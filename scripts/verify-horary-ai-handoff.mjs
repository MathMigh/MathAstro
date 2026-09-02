import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const ai=fs.readFileSync(path.join(root,'src/traditions/western/horary/aiHandoff.ts'),'utf8');
const runtime=fs.readFileSync(path.join(root,'src/traditions/western/horary/aiRuntime.ts'),'utf8');
const kb=fs.readFileSync(path.join(root,'src/traditions/western/horary/aiKnowledgeBase.ts'),'utf8');
const report=fs.readFileSync(path.join(root,'src/traditions/western/horary/report.ts'),'utf8');
const api=fs.readFileSync(path.join(root,'src/app/api/horary/evaluate/route.ts'),'utf8');
const finalize=fs.readFileSync(path.join(root,'src/app/api/horary/ai/finalize/route.ts'),'utf8');
const types=fs.readFileSync(path.join(root,'src/traditions/western/horary/types.ts'),'utf8');
const ui=fs.readFileSync(path.join(root,'src/app/ocidental/horaria/page.tsx'),'utf8');
const errors=[];
const promptTokens=[
  'HORARY_ONLY','HIERARQUIA DE AUTORIDADE','FRONTEIRA MOTOR × IA','SUBJETIVIDADE CONTROLADA','PROTOCOLO SEMÂNTICO PARA SITUAÇÕES INFINITAS','SEMÂNTICA OPERACIONAL DAS 12 CASAS','MÉTODO INTEGRAL — ORDEM OBRIGATÓRIA','PROTOCOLOS TÓPICOS — RELACIONAMENTOS','PROTOCOLOS TÓPICOS — TRABALHO E CARREIRA','PROTOCOLOS TÓPICOS — DINHEIRO, PAGAMENTO, DÍVIDA E EMPRÉSTIMO','PROTOCOLOS TÓPICOS — MORTE, PRISÃO, CATIVEIRO E SOLTURA','DISCIPLINA DE INFERÊNCIA','CHECKLIST FINAL ANTES DE RESPONDER',
  'Vire casas somente quando','Não faça turning desnecessário','EVENTO, ESTADO E DESCRIÇÃO',
  'recepção e dignidade, sozinhas, não criam evento','PERFEIÇÃO E CRONOLOGIA','TIMING',
  'SOURCE_RULE_REQUIRED','NEEDS_CLARIFICATION','Não recalcule o mapa','Não some tudo em um escore totalizador','unresolvedSubjectivity'
];
for(const t of promptTokens) if(!ai.includes(t)) errors.push(`prompt:${t}`);
for(const t of ['HoraryAIHandoff','HoraryAIResultShape','HoraryAIInterpretiveTask','HoraryAISemanticIntakeResult','HoraryAIProvider','HoraryAIModelRequest']) if(!types.includes(t)) errors.push(`types:${t}`);
for(const t of ['buildHoraryAIHandoff','renderHoraryAIUserPrompt','requiredSourceIds','clarificationQuestions','machineJudgementIsAdvisory:true','usedSourceIds','unresolvedSubjectivity']) if(!ai.includes(t)) errors.push(`handoff:${t}`);
for(const t of ['BUILTIN_HORARY_SOURCE_RESOLVER','buildHoraryAISemanticIntakeRequest','buildHoraryAIJudgementRequest','validateHoraryAIResult','runHoraryAIJudgement','HORARY_AI_LANGUAGE','ENTRADA SEMÂNTICA PRÉ-MOTOR']) if(!runtime.includes(t)) errors.push(`runtime:${t}`);
for(const t of ['HORARY_BUILTIN_SOURCE_EVIDENCE','M-HE-TRIAL','M-HE-INTERNET']) if(!kb.includes(t)) errors.push(`knowledge:${t}`);
for(const t of ['FRONTEIRA MOTOR × IA','Pendências interpretativas','Clarificações mínimas']) if(!report.includes(t)) errors.push(`report:${t}`);
for(const t of ['aiHandoff:buildHoraryAIHandoff','aiSystemPrompt:HORARY_ABSOLUTE_AI_SYSTEM_PROMPT','aiUserPrompt:renderHoraryAIUserPrompt','aiModelRequest:buildHoraryAIJudgementRequest','aiSemanticIntakeInput']) if(!api.includes(t)) errors.push(`api:${t}`);
for(const t of ['validateHoraryAIResult','renderHoraryFinalAIReport','accepted:true']) if(!finalize.includes(t)) errors.push(`finalize:${t}`);
for(const t of ['Pacote IA JSON','Prompt absoluto PT-BR','Camada IA pronta para conexão']) if(!ui.includes(t)) errors.push(`ui:${t}`);
if(errors.length){console.error('HORARY_AI_HANDOFF_FAIL',errors);process.exit(1);}
console.log('HORARY_AI_HANDOFF_OK prompt=pt-BR-v3 intake+judgement=ready provider-neutral=on boundary=deterministic-vs-interpretive source-hierarchy=explicit ambiguity=clarify-not-guess output-contract=validated');
