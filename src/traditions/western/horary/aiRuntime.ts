import type {
  HoraryAIModelRequest,
  HoraryAIProvider,
  HoraryAISourceResolver,
  HoraryAIResultShape,
  HoraryAISemanticIntakeInput,
  HoraryAISemanticIntakeResult,
  HoraryAIValidationResult,
  HoraryDossier,
} from "./types";
import { HORARY_SOURCES } from "./tables";
import { HORARY_TOPIC_LIST } from "./ontology";
import {
  buildHoraryAIHandoff,
  HORARY_ABSOLUTE_AI_SYSTEM_PROMPT,
  HORARY_AI_CONTRACT_VERSION,
  HORARY_AI_PROMPT_VERSION,
  renderHoraryAIUserPrompt,
} from "./aiHandoff";
import { HORARY_HOUSE_SEMANTIC_KEYS } from "./houseSemantics";
import { BUILTIN_HORARY_SOURCE_RESOLVER } from "./aiKnowledgeBase";

export const HORARY_AI_LANGUAGE = "pt-BR" as const;

/**
 * Fase 1 do bot: entender a pergunta humana ANTES de pedir ao núcleo que julgue.
 * A IA não calcula casas por longitude nem astrologia; ela apenas descreve as
 * relações humanas com o vocabulário semântico aceito pelo motor.
 */
export const HORARY_AI_SEMANTIC_INTAKE_INSTRUCTIONS_PTBR = `
MODO: ENTRADA SEMÂNTICA PRÉ-MOTOR

Você recebeu uma pergunta humana de astrologia horária. Nesta fase NÃO interprete o mapa, NÃO calcule planetas e NÃO dê o julgamento astrológico final.

Sua tarefa é transformar linguagem natural em uma especificação auditável para o motor MathAstro:
1. Reescreva a pergunta como uma questão concreta e verificável, sem mudar o sentido.
2. Identifique pessoas, entidades, objetos, dinheiro, instituições e relações que realmente importam.
3. Para cada papel, use apenas uma meaning existente no atlas semântico entregue no pacote.
4. Use anchorRole para relações X-DE-Y. Ex.: vizinho=neighbor ancorado no querente; dinheiro do vizinho=money ancorado no papel vizinho.
5. NÃO derive uma instituição apenas por possessivo linguístico. Ex.: "universidade do meu filho" normalmente continua university radical; ela não pertence ao filho.
6. Se uma frase admitir leituras que mudam a casa, o evento ou o método, NÃO escolha por palpite: devolva semanticAmbiguities e NEEDS_CLARIFICATION.
7. Identifique se a pergunta pede evento, estado, qualidade, localização, verdade, escolha, causa, quantidade, relacionamento, posse/transferência, sobrevivência, soltura e/ou timing.
8. Preserve subperguntas do mesmo organismo. Não desmembre artificialmente uma única situação em mapas independentes.
9. Preencha positiveOutcomeDefinition quando o que conta como "sim" não for óbvio.
10. Se a pergunta estiver fora de astrologia horária, devolva OUT_OF_SCOPE.

IMPORTANTE: você não está autorizado a escolher uma casa por palavra-chave. O atlas e o turning serão compilados deterministicamente depois. Seu papel é dizer O QUE a coisa é e DE QUEM/COM QUEM ela se relaciona.
`.trim();

const semanticOutputExample = {
  status:"READY_FOR_ENGINE | NEEDS_CLARIFICATION | OUT_OF_SCOPE",
  topic:"um HoraryTopic existente quando possível",
  concreteQuestion:"frase concreta",
  semanticRoles:[{role:"neighbor",meaning:"neighbor",anchorRole:"querent",relationMode:"auto",primary:true}],
  semanticAmbiguities:[],
  intents:["event"],
  primaryRoleIds:["neighbor"],
  contextPatch:{positiveOutcomeDefinition:"..."},
  clarificationQuestions:[],
  confidence:"high | medium | low",
  semanticNotes:["vizinho é relação de III; o motor calculará a casa"],
};

const judgementOutputExample = {
  status:"JUDGED | NEEDS_CLARIFICATION | DESCRIPTIVE_ONLY | SOURCE_RULE_REQUIRED",
  questionReframed:"...",
  semanticResolution:[{role:"...",meaning:"...",house:3,rationale:"..."}],
  answer:"YES | NO | MIXED | UNKNOWN | DESCRIPTIVE_ONLY",
  causalChain:["papel/casa → significador → contato/impedimento → conclusão"],
  sourceVariants:[],
  usedSourceIds:["F-HT"],
  unresolvedSubjectivity:[],
  timing:{rationale:"..."},
  confidence:"high | medium | low",
  clarificationNeeded:[],
  sourceRuleRequired:[],
  reportText:"...",
};

function sourceHints(ids:string[]):string[]{
  const table=new Map(HORARY_SOURCES.map(s=>[s.id,s]));
  return ids.map(id=>{
    const s=table.get(id);
    return s?`${id}: ${s.author} — ${s.work}${s.locator?` (${s.locator})`:""}`:`${id}: recuperar a regra/caso correspondente no corpus MathAstro`;
  });
}

export function buildHoraryAISemanticIntakeRequest(input:HoraryAISemanticIntakeInput):HoraryAIModelRequest {
  const userPrompt=[
    "Prepare a entrada semântica desta pergunta para o motor de horária.",
    "",
    `PERGUNTA BRUTA: ${input.rawQuestion}`,
    input.background?`CONTEXTO: ${input.background}`:"",
    input.knownFacts?.length?`FATOS CONHECIDOS: ${input.knownFacts.join(" | ")}`:"",
    input.positiveOutcomeDefinition?`RESULTADO POSITIVO DEFINIDO PELO USUÁRIO: ${input.positiveOutcomeDefinition}`:"",
    input.currentDefault?`CURSO NATURAL/DEFAULT: ${input.currentDefault}`:"",
    "",
    `TÓPICOS DISPONÍVEIS: ${HORARY_TOPIC_LIST.join(", ")}`,
    `MEANINGS DO ATLAS: ${HORARY_HOUSE_SEMANTIC_KEYS.join(", ")}`,
    "",
    "Devolva SOMENTE um objeto compatível com o contrato HoraryAISemanticIntakeResult. Se houver ambiguidade bloqueadora, formule apenas as perguntas mínimas necessárias.",
  ].filter(Boolean).join("\n");

  return {
    stage:"semantic_intake",
    contractVersion:HORARY_AI_CONTRACT_VERSION,
    promptVersion:HORARY_AI_PROMPT_VERSION,
    language:HORARY_AI_LANGUAGE,
    systemPrompt:`${HORARY_ABSOLUTE_AI_SYSTEM_PROMPT}\n\n${HORARY_AI_SEMANTIC_INTAKE_INSTRUCTIONS_PTBR}`,
    userPrompt,
    expectedOutput:semanticOutputExample,
    requiredSourceIds:["M-HOUSE-TURNING","F-HT","MA-OPS"],
    sourceRetrievalHints:sourceHints(["M-HOUSE-TURNING","F-HT","MA-OPS"]),
    blockingClarifications:[],
  };
}

export async function hydrateHoraryAIModelRequestWithSources(request:HoraryAIModelRequest,resolver:HoraryAISourceResolver):Promise<HoraryAIModelRequest>{
  const raw=await resolver.resolve({sourceIds:[...request.requiredSourceIds],stage:request.stage,query:request.userPrompt});
  const allowed=new Set(request.requiredSourceIds);
  const sourceEvidence=(raw??[]).filter(x=>x&&allowed.has(x.sourceId)&&typeof x.excerpt==="string"&&x.excerpt.trim()).map(x=>({...x,excerpt:x.excerpt.trim()}));
  const evidenceText=sourceEvidence.length?`\n\nEVIDÊNCIA_DE_FONTE_RECUPERADA — use apenas quando pertinente; não extrapole além dos trechos:\n${sourceEvidence.map(x=>`[${x.sourceId}]${x.title?` ${x.title}`:""}${x.locator?` — ${x.locator}`:""}\n${x.excerpt}`).join("\n\n")}`:"\n\nEVIDÊNCIA_DE_FONTE_RECUPERADA: nenhuma evidência foi resolvida pelo adapter. Se uma regra indispensável depender dela, use SOURCE_RULE_REQUIRED.";
  return {...request,sourceEvidence,userPrompt:`${request.userPrompt}${evidenceText}`};
}

export function buildHoraryAIJudgementRequest(d:HoraryDossier):HoraryAIModelRequest {
  const handoff=buildHoraryAIHandoff(d);
  return {
    stage:"judgement",
    contractVersion:HORARY_AI_CONTRACT_VERSION,
    promptVersion:HORARY_AI_PROMPT_VERSION,
    language:HORARY_AI_LANGUAGE,
    systemPrompt:HORARY_ABSOLUTE_AI_SYSTEM_PROMPT,
    userPrompt:renderHoraryAIUserPrompt(d),
    expectedOutput:judgementOutputExample,
    requiredSourceIds:handoff.requiredSourceIds,
    sourceRetrievalHints:sourceHints(handoff.requiredSourceIds),
    blockingClarifications:handoff.clarificationQuestions,
  };
}

function isRecord(x:unknown):x is Record<string,unknown>{ return !!x && typeof x==="object" && !Array.isArray(x); }
function isStringArray(x:unknown):x is string[]{ return Array.isArray(x)&&x.every(v=>typeof v==="string"); }

export function validateHoraryAISemanticIntakeResult(raw:unknown):HoraryAIValidationResult<HoraryAISemanticIntakeResult>{
  const errors:string[]=[]; const warnings:string[]=[];
  if(!isRecord(raw)) return {valid:false,errors:["A resposta da IA não é um objeto."],warnings};
  const statuses=["READY_FOR_ENGINE","NEEDS_CLARIFICATION","OUT_OF_SCOPE"];
  if(!statuses.includes(String(raw.status))) errors.push("status inválido para semantic_intake.");
  if(!Array.isArray(raw.semanticRoles)) errors.push("semanticRoles deve ser array.");
  if(!Array.isArray(raw.semanticAmbiguities)) errors.push("semanticAmbiguities deve ser array.");
  if(!Array.isArray(raw.intents)) errors.push("intents deve ser array.");
  if(!isStringArray(raw.primaryRoleIds)) errors.push("primaryRoleIds deve ser string[].");
  if(!isRecord(raw.contextPatch)) errors.push("contextPatch deve ser objeto.");
  if(!isStringArray(raw.clarificationQuestions)) errors.push("clarificationQuestions deve ser string[].");
  if(!["high","medium","low"].includes(String(raw.confidence))) errors.push("confidence inválida.");
  if(!isStringArray(raw.semanticNotes)) errors.push("semanticNotes deve ser string[].");
  if(Array.isArray(raw.semanticRoles)){
    for(const [i,r] of raw.semanticRoles.entries()){
      if(!isRecord(r)){errors.push(`semanticRoles[${i}] não é objeto.`);continue;}
      if(typeof r.role!=="string"||!r.role.trim()) errors.push(`semanticRoles[${i}].role ausente.`);
      if(!HORARY_HOUSE_SEMANTIC_KEYS.includes(r.meaning as any)) errors.push(`semanticRoles[${i}].meaning fora do atlas: ${String(r.meaning)}.`);
      // Casa radical manual aqui é suspeita: a fase semântica deve descrever relações, não substituir o compilador.
      if("radicalHouse" in r) warnings.push(`semanticRoles[${i}] tentou fornecer radicalHouse; o núcleo deve ignorar esse atalho e compilar pelo atlas.`);
    }
  }
  if(raw.status==="NEEDS_CLARIFICATION"&&(!Array.isArray(raw.clarificationQuestions)||raw.clarificationQuestions.length===0)) errors.push("NEEDS_CLARIFICATION exige pelo menos uma pergunta de clarificação.");
  if(raw.status==="READY_FOR_ENGINE"&&typeof raw.concreteQuestion!=="string") errors.push("READY_FOR_ENGINE exige concreteQuestion.");
  return {valid:errors.length===0,errors,warnings,value:errors.length?undefined:raw as unknown as HoraryAISemanticIntakeResult};
}

export function validateHoraryAIResult(raw:unknown,d:HoraryDossier):HoraryAIValidationResult<HoraryAIResultShape>{
  const errors:string[]=[]; const warnings:string[]=[];
  if(!isRecord(raw)) return {valid:false,errors:["A resposta da IA não é um objeto."],warnings};
  const handoff=buildHoraryAIHandoff(d);
  const status=String(raw.status), answer=String(raw.answer), confidence=String(raw.confidence);
  if(!handoff.outputContract.status.includes(status as any)) errors.push(`status inválido: ${status}.`);
  if(!handoff.outputContract.answer.includes(answer as any)) errors.push(`answer inválida: ${answer}.`);
  if(!handoff.outputContract.confidence.includes(confidence as any)) errors.push(`confidence inválida: ${confidence}.`);
  for(const field of handoff.outputContract.requiredFields) if(!(field in raw)) errors.push(`campo obrigatório ausente: ${field}.`);
  for(const field of ["causalChain","sourceVariants","usedSourceIds","unresolvedSubjectivity","clarificationNeeded","sourceRuleRequired"]){
    if(field in raw&&!isStringArray(raw[field])) errors.push(`${field} deve ser string[].`);
  }
  if(typeof raw.questionReframed!=="string") errors.push("questionReframed deve ser string.");
  if(typeof raw.reportText!=="string") errors.push("reportText deve ser string.");
  if(!Array.isArray(raw.semanticResolution)) errors.push("semanticResolution deve ser array.");

  const allowedSources=new Set([...handoff.requiredSourceIds,...d.provenance.map(x=>x.id),...HORARY_SOURCES.map(x=>x.id)]);
  if(isStringArray(raw.usedSourceIds)) for(const id of raw.usedSourceIds) if(!allowedSources.has(id)) errors.push(`usedSourceIds contém fonte não autorizada/não entregue: ${id}.`);
  if(status==="NEEDS_CLARIFICATION"&&(!isStringArray(raw.clarificationNeeded)||raw.clarificationNeeded.length===0)) errors.push("NEEDS_CLARIFICATION exige clarificationNeeded.");
  if(status==="SOURCE_RULE_REQUIRED"&&(!isStringArray(raw.sourceRuleRequired)||raw.sourceRuleRequired.length===0)) errors.push("SOURCE_RULE_REQUIRED exige sourceRuleRequired.");
  if(handoff.clarificationQuestions.length&&status==="JUDGED") warnings.push("A IA julgou apesar de haver clarificações bloqueadoras no handoff; revisão humana obrigatória.");
  if(raw.answer!==d.judgement.answer&&d.judgement.canJudge&&d.judgement.answer!=="UNKNOWN") warnings.push(`A IA divergiu do julgamento mecânico (${d.judgement.answer}); a divergência deve ser explicada no relatório.`);
  return {valid:errors.length===0,errors,warnings,value:errors.length?undefined:raw as unknown as HoraryAIResultShape};
}

export async function runHoraryAIJudgement(provider:HoraryAIProvider,d:HoraryDossier,resolver?:HoraryAISourceResolver):Promise<HoraryAIValidationResult<HoraryAIResultShape>>{
  let request=buildHoraryAIJudgementRequest(d);
  request=await hydrateHoraryAIModelRequestWithSources(request,resolver??BUILTIN_HORARY_SOURCE_RESOLVER);
  const raw=await provider.generate(request);
  return validateHoraryAIResult(raw,d);
}

export async function runHoraryAISemanticIntake(provider:HoraryAIProvider,input:HoraryAISemanticIntakeInput,resolver?:HoraryAISourceResolver):Promise<HoraryAIValidationResult<HoraryAISemanticIntakeResult>>{
  let request=buildHoraryAISemanticIntakeRequest(input);
  request=await hydrateHoraryAIModelRequestWithSources(request,resolver??BUILTIN_HORARY_SOURCE_RESOLVER);
  const raw=await provider.generate(request);
  return validateHoraryAISemanticIntakeResult(raw);
}

export function renderHoraryFinalAIReport(d:HoraryDossier,ai:HoraryAIResultShape):string{
  const lines=[
    "MATHASTRO — HORÁRIA — RELATÓRIO FINAL HÍBRIDO MOTOR + IA",
    `Pergunta: ${ai.questionReframed||d.question.concreteQuestion}`,
    `Status IA: ${ai.status}`,
    `Resposta: ${ai.answer}`,
    `Confiança: ${ai.confidence}`,
    "",
    "CADEIA CAUSAL AUDITÁVEL",
    ...(ai.causalChain.length?ai.causalChain.map(x=>`- ${x}`):["- não fornecida"]),
    "",
    "SUBJETIVIDADE RESIDUAL",
    ...(ai.unresolvedSubjectivity.length?ai.unresolvedSubjectivity.map(x=>`- ${x}`):["- nenhuma declarada"]),
    "",
    "VARIANTES / FONTES",
    `- Fontes usadas: ${ai.usedSourceIds.join(", ")||"não declaradas"}`,
    ...(ai.sourceVariants.length?ai.sourceVariants.map(x=>`- ${x}`):["- nenhuma variante declarada"]),
  ];
  if(ai.timing) lines.push("", "TIMING", `- ${ai.timing.value??""} ${ai.timing.unit??ai.timing.range??""}`.trim(), `- ${ai.timing.rationale}`);
  if(ai.clarificationNeeded.length) lines.push("", "CLARIFICAÇÕES AINDA NECESSÁRIAS",...ai.clarificationNeeded.map(x=>`- ${x}`));
  if(ai.sourceRuleRequired.length) lines.push("", "REGRA DE FONTE AINDA NECESSÁRIA",...ai.sourceRuleRequired.map(x=>`- ${x}`));
  lines.push("", "SÍNTESE", ai.reportText);
  return lines.join("\n");
}
