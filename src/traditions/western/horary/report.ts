import type { HoraryDossier } from "./types";
import { buildHoraryAIHandoff } from "./aiHandoff";
export function renderHoraryReport(d:HoraryDossier):string {
  const lines:string[]=[];
  lines.push("MATHASTRO — HORARY_ONLY — DOSSIÊ PARA IA",`Pergunta: ${d.question.concreteQuestion}`,`Tópico: ${d.question.topic}`,`Método: ${d.methodology}`,`Cobertura: ${d.coverage.status} — ${d.coverage.note}`,`Casas: ${d.chartMetadata.houseSystem}`,`Nascimento da pergunta: compreendida=${String(d.question.questionUnderstood)}; aceita=${String(d.question.questionAccepted)}`);
  if(d.question.background) lines.push(`Contexto: ${d.question.background}`);
  if(d.question.currentDefault) lines.push(`Default real da situação: ${d.question.currentDefault}`);
  if(d.question.sameSituationSubquestions?.length) lines.push(`Subperguntas do mesmo organismo: ${d.question.sameSituationSubquestions.join(" | ")}`);
  lines.push("");
  if(d.topicAnalysis.unresolvedContext.length) lines.push(`CONTEXTO PENDENTE: ${d.topicAnalysis.unresolvedContext.join(", ")}`,"");
  lines.push("","PLANO DECISÓRIO COMPOSICIONAL",`- Família: ${d.ontology.family}`,`- Intenções: ${d.decisionPlan.intents.join(", ")}`,`- Arquétipos: ${d.decisionPlan.archetypes.join(", ")}`); for(const s of d.decisionPlan.steps) lines.push(`- ${s.intent} → ${s.archetype}: ${s.purpose}`);
  lines.push("","ATLAS SEMÂNTICO DAS 12 CASAS");
  for(const h of d.houseAtlas) lines.push(`- H${h.house}: ${h.principle} [${h.meanings.map(m=>m.key).join(", ")}]`);
  lines.push("","FRAME SEMÂNTICO RESOLVIDO",`- versão: ${d.topicAnalysis.semanticFrame.atlasVersion}`,`- requer camada interpretativa: ${d.topicAnalysis.semanticFrame.requiresInterpretiveLayer?"sim":"não"}`);
  if(!d.topicAnalysis.semanticFrame.compiledRoles.length) lines.push("- nenhum semanticRole explícito; foi usado o roteamento tópico/documental existente.");
  for(const r of d.topicAnalysis.semanticFrame.compiledRoles) lines.push(`- ${r.role}: ${r.meaning}; âncora=${r.anchorRole}; modo=${r.relationMode}; H${r.radicalHouse} (${r.rationale})`);
  for(const w of d.topicAnalysis.semanticFrame.warnings) lines.push(`- AVISO: ${w}`);
  lines.push("ESQUELETO DA PERGUNTA"); for(const h of d.topicAnalysis.houses) lines.push(`- ${h.role}: Casa ${h.radicalHouse}${h.derivedFrom?` (derivada de ${h.derivedFrom}, ${h.derivation}ª)`:""} — ${h.rationale}`);
  if(d.topicAnalysis.notes.length){ lines.push("","NOTAS DE ROTEAMENTO",...d.topicAnalysis.notes.map(x=>`- ${x}`)); }
  lines.push("","CÉU NEUTRO COMPLETO"); for(const p of d.neutralSky) lines.push(`- ${p.name}: ${p.longitude.toFixed(4)}°, velocidade ${p.speed.toFixed(6)}°/d, casa ${p.house}, retrógrado=${p.retrograde}`);
  lines.push("","SIGNIFICADORES"); for(const s of d.significators) lines.push(`- ${s.role}: ${s.planetName}, ${s.house===null?"papel natural/planetário":`Casa significada ${s.house}`}, ${s.degreeInSign.toFixed(2)}° ${s.sign}; base=${s.basis}; essencial=${JSON.stringify(s.essential)}; acidental=${JSON.stringify(s.accidental)}`);
  lines.push("","RECEPÇÕES"); for(const r of d.receptions) lines.push(`- ${r.fromName} → ${r.toName}: ${r.strongest}; ${r.disposition}; [${r.dignities.join(", ")||"nenhuma"}]`);
  lines.push("","PERFEIÇÕES / CONTATOS DIRETOS"); for(const a of d.directPerfections) lines.push(`- ${a.aName}–${a.bName}: ${a.aspect}; ${a.applying?"aplicativo":"separativo"}; orbe ${a.orb.toFixed(2)}°; Δ=${a.degreesToPerfection?.toFixed(2)??"—"}°; antes da mudança de signo=${String(a.beforeEitherChangesSign)}`);
  lines.push("","ANTÍSCIOS"); if(!d.antiscialContacts.length) lines.push("- nenhum contato estreito materializado"); for(const a of d.antiscialContacts) lines.push(`- ${a.aName}–${a.bName}: ${a.byAntiscion?"antíscio":"contra-antíscio"}; orbe ${a.orb.toFixed(2)}°`);
  lines.push("","MEDIAÇÃO / IMPEDIMENTOS"); if(!d.mediation.length) lines.push("- nenhuma tradução/coleta/interferência materializada pelo núcleo"); for(const m of d.mediation) lines.push(`- ${m.kind} [${m.confidence}]: ${m.statement}`);
  if(d.chronology?.length){lines.push("","CRONOLOGIA EFEMÉRICA SWISS EPHEMERIS");for(const e of d.chronology.slice(0,120)) lines.push(`- +${e.daysFromQuestion.toFixed(3)}d [${e.kind}] ${e.statement}`);}
  lines.push("","LUA"); lines.push(`- VOC estrita: ${d.moonVoidOfCourse?"sim":"não"}`); for(const x of d.lunarSequence) lines.push(`- ${x.order}. ${x.aspect} ${x.targetName}; Δ=${x.degreesToPerfection.toFixed(2)}°`);
  lines.push("","CONSIDERAÇÕES ANTES DO JULGAMENTO (NÃO BLOQUEADORAS)"); if(!d.considerations.length) lines.push("- nenhuma consideração materializada"); for(const t of d.considerations) lines.push(`- [${t.severity}] ${t.statement}`);
  lines.push("","TESTEMUNHOS"); for(const t of d.testimonies) lines.push(`- [${t.severity}] (${t.subject}) ${t.statement}`);
  lines.push("","AUXILIARES",`- Partes: ${d.auxiliary.partsPolicy}`,`- Estrelas relevantes materializadas: ${d.auxiliary.fixedStars.length}`,`- Exteriores: ${d.auxiliary.outerPlanets.map(x=>x.name).join(", ")} (auxiliares, nunca regentes)`);
  lines.push("","JUÍZO AUTOMÁTICO CONSERVADOR",`- Pode julgar: ${d.judgement.canJudge?"sim":"não"}`,`- Resposta: ${d.judgement.answer}`,`- ${d.judgement.summary}`); for(const r of d.judgement.reasons) lines.push(`- ${r}`); if(d.judgement.timing) lines.push(`- Timing: ${d.judgement.timing}`);
  const ai=buildHoraryAIHandoff(d);
  lines.push("","FRONTEIRA MOTOR × IA",`- Contrato: ${ai.contractVersion}`,`- Prompt: ${ai.promptVersion}`,"- Fechado pelo motor: "+ai.deterministicBoundary.closedByEngine.join("; "),"- A IA pode interpretar: "+ai.deterministicBoundary.aiMayInterpret.join("; "),"- A IA NÃO pode alterar: "+ai.deterministicBoundary.aiMustNotAlter.join("; "));
  if(ai.unresolved.length) lines.push("- Pendências interpretativas: "+ai.unresolved.join(" | "));
  if(ai.clarificationQuestions.length) lines.push("- Clarificações mínimas: "+ai.clarificationQuestions.join(" | "));
  lines.push("- Fontes exigidas neste caso: "+(ai.requiredSourceIds.join(", ")||"nenhuma além do contrato base"));
  for(const t of ai.interpretiveTasks) lines.push(`- Tarefa IA [${t.kind}] ${t.id}: ${t.question} | bloqueadora=${String(t.blocking)}`);
  lines.push("","CONTRATO PARA IA",...d.safeguards.map(x=>`- ${x}`));
  return lines.join("\n");
}
