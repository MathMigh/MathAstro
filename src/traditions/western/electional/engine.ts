import type { PlanetType } from "@/interfaces/BirthChartInterfaces";
import { ELECTIONAL_GOALS, ELECTIONAL_SOURCES } from "./tables";
import { classicalConditions, closeToAngle, electionToNatalContacts, houseRuler, planetCondition, signElement, signMode, electionalAspect, receptionByDignity, lunarApplyingSequence } from "./calculations";
import type { ElectionalEvaluation, ElectionalRequest, ElectionalTestimony, NatalElectionLink } from "./types";

const MALEFICS: PlanetType[] = ["mars","saturn"];
const BENEFICS: PlanetType[] = ["venus","jupiter"];

function t(id:string,severity:ElectionalTestimony["severity"],subject:string,statement:string,sourceIds:string[],data?:Record<string,unknown>):ElectionalTestimony {
  return {id,severity,subject,statement,sourceIds,data};
}

function conditionStrength(c: ReturnType<typeof planetCondition>): "strong"|"mixed"|"weak" {
  const e=c.essential,a=c.accidental;
  if (a.cazimi || ((e.domicile||e.exaltation) && !a.combust && !a.retrograde && !e.fall && !e.detriment)) return "strong";
  if (e.fall || e.detriment || a.combust || (a.retrograde && a.cadent)) return "weak";
  return "mixed";
}

function makeNatalLink(request:ElectionalRequest,natalItem:ElectionalRequest["natalCharts"][number],house:number):NatalElectionLink {
  const ruler=houseRuler(natalItem.chart,house);
  const c=planetCondition(request.electionChart,ruler);
  const contacts:string[]=[];
  for (const target of [ruler,"sun","moon","venus","jupiter"] as PlanetType[]) contacts.push(...electionToNatalContacts(request.electionChart,natalItem.chart,ruler,target));
  const strength=conditionStrength(c);
  return {natalId:natalItem.id,role:natalItem.role,natalHouse:house,natalRuler:ruler,electionCondition:c,electionToNatalContacts:contacts,status:strength==="strong"?"supportive":strength==="weak"?"difficult":contacts.length?"mixed":"neutral"};
}

export function evaluateElection(request:ElectionalRequest):ElectionalEvaluation {
  const goal=ELECTIONAL_GOALS[request.goal] ?? ELECTIONAL_GOALS.general;
  const chart=request.electionChart;
  const testimonies:ElectionalTestimony[]=[];
  const conditions=classicalConditions(chart);
  const ascRuler=houseRuler(chart,1);
  const relevantRuler=houseRuler(chart,goal.radicalHouse);

  if (!request.objective?.trim()) testimonies.push(t("objective-missing","critical","objetivo","A eleição não define com precisão o resultado desejado; Frawley exige distinguir, por exemplo, lucro, prazer no trabalho, impacto etc.",["F-REAL-ELECT"]));

  for (const type of [ascRuler,relevantRuler,"sun","moon",...goal.naturalPlanets] as PlanetType[]) {
    const c=conditions[type] ?? planetCondition(chart,type);
    const strength=conditionStrength(c);
    if (strength==="weak") testimonies.push(t(`weak-${type}`,type===ascRuler||type===relevantRuler?"critical":"major",type,`${c.sign}: significador requerido está debilitado/impedido (${c.testimony.join(", ")||"sem dignidade"}).`,["F-REAL-ELECT","MA-OP-ELECT"]));
    if (strength==="strong") testimonies.push(t(`strong-${type}`,"support",type,`Significador requerido com condição forte (${c.testimony.join(", ")}).`,["F-REAL-ELECT"]));
  }

  // Recepção (disposição/intenção) e aspecto (ocasião de contato) são julgados separadamente.
  const mainAspect=electionalAspect(chart,ascRuler,relevantRuler);
  const relevantReceivesAsc=receptionByDignity(chart,relevantRuler,ascRuler);
  const ascReceivesRelevant=receptionByDignity(chart,ascRuler,relevantRuler);
  if(mainAspect.type) testimonies.push(t("l1-topic-aspect",mainAspect.applying?"support":"info","L1 ↔ regente temático",`${ascRuler} e ${relevantRuler}: ${mainAspect.type}, orbe ${mainAspect.orb?.toFixed(2)}°, ${mainAspect.applying?"aplicativo":"separativo"}. Isto descreve oportunidade/ligação, não recepção.`,["M-TX-ELECT-CURRENT","F-REAL-ELECT"]));
  if(relevantReceivesAsc.length) testimonies.push(t("topic-receives-l1","support","recepção",`${relevantRuler} recebe ${ascRuler} por ${relevantReceivesAsc.join(", ")}. Recepção é disposição/relação; não substitui aspecto.`,["M-TX-ELECT-CURRENT","F-REAL-ELECT"]));
  if(ascReceivesRelevant.length) testimonies.push(t("l1-receives-topic","support","recepção",`${ascRuler} recebe ${relevantRuler} por ${ascReceivesRelevant.join(", ")}.`,["M-TX-ELECT-CURRENT","F-REAL-ELECT"]));

  const lunarSequence=lunarApplyingSequence(chart);
  if(lunarSequence.length) {
    const first=lunarSequence[0];
    testimonies.push(t("moon-next-application","info","Lua",`Próxima aplicação lunar detectada antes de sair do signo: ${first.type} a ${first.target}, orbe atual ${first.orb.toFixed(2)}°. A sequência lunar é testemunho dinâmico separado da força estática do mapa.`,["F-REAL-ELECT"]));
  } else testimonies.push(t("moon-no-application","minor","Lua","Nenhuma aplicação lunar maior foi detectada antes da mudança de signo pelo modelo dinâmico atual; tratar como advertência contextual, não veto universal.",["F-REAL-ELECT","MA-OP-ELECT"]));

  const ascMode=signMode(chart.housesData.ascendant);
  const ascElement=signElement(chart.housesData.ascendant);
  if (goal.preferredModes?.includes(ascMode)) testimonies.push(t("mode-fit","support","Ascendente",`Modalidade ${ascMode} combina com a duração/ritmo priorizado para ${goal.label}.`,["F-REAL-ELECT"]));
  if (goal.preferredElements?.includes(ascElement)) testimonies.push(t("element-fit","support","Ascendente",`Elemento ${ascElement} é coerente com a natureza operacional do empreendimento.`,["F-REAL-ELECT"]));

  for (const m of MALEFICS) {
    const c=conditions[m]!;
    const angleHits=closeToAngle(chart,m,5);
    const isRequired=[ascRuler,relevantRuler,...goal.naturalPlanets].includes(m);
    if (angleHits.length && !isRequired) testimonies.push(t(`malefic-angle-${m}`,"critical",m,`${angleHits.join("; ")}; maléfico não requerido está angular e muito capaz de agir.`,["F-REAL-ELECT"]));
    else if (isRequired && conditionStrength(c)==="strong") testimonies.push(t(`useful-malefic-${m}`,"support",m,`Maléfico é funcionalmente requerido e está utilizável; não é removido mecanicamente só por ser maléfico.`,["F-REAL-ELECT"]));
  }

  for (const b of BENEFICS) if (closeToAngle(chart,b,5).length) testimonies.push(t(`benefic-angle-${b}`,"support",b,`${closeToAngle(chart,b,5).join("; ")}.`,["F-REAL-ELECT"]));

  const natalLinks:NatalElectionLink[]=[];
  for (const n of request.natalCharts) for (const h of goal.natalHouses) natalLinks.push(makeNatalLink(request,n,h));
  if (!request.natalCharts.length) testimonies.push(t("no-nativity","critical","mapa natal","Sem natividade, isto é apenas uma eleição simples/triagem. Não pode ser rotulado como eleição completa na linha Marcos/Frawley publicada.",["M-BK-ELECT","F-REAL-ELECT"]));
  const expectedNatals = ["marriage","partnership"].includes(goal.id) ? 2 : 1;
  if (request.natalCharts.length > 0 && request.natalCharts.length < expectedNatals) testimonies.push(t("incomplete-nativities","critical","mapas natais",`O objetivo ${goal.label} pede ${expectedNatals} natividade(s) relevante(s) para uma eleição plena; foram fornecidas ${request.natalCharts.length}.`,["M-BK-ELECT","F-REAL-ELECT"]));
  for (const link of natalLinks) {
    if (link.status==="difficult") testimonies.push(t(`natal-ruler-difficult-${link.natalId}-${link.natalHouse}`,"critical",`${link.role}/Casa ${link.natalHouse}`,`O regente natal da área (${link.natalRuler}) fica fraco no céu eletivo; isto pode inverter a intenção da eleição.`,["M-BK-ELECT","F-REAL-ELECT"]));
    if (link.status==="supportive") testimonies.push(t(`natal-ruler-support-${link.natalId}-${link.natalHouse}`,"support",`${link.role}/Casa ${link.natalHouse}`,`O regente natal da área (${link.natalRuler}) está bem colocado no céu eletivo.`,["M-BK-ELECT","F-REAL-ELECT"]));
  }

  const warnings:string[]=[
    "Não existe 'mapa perfeito': selecionar o melhor disponível sob restrições reais.",
    "O motor não afirma que a eleição cria capacidades ausentes no natal nem corrige inviabilidade objetiva do empreendimento.",
    "A qualidade temporal deve ser tratada como janela contínua; não como minuto mágico sem transição.",
    "Estrelas fixas não são usadas como gate automático: Marcos adverte que em horária/eletiva o risco de usá-las é maior que o de ignorá-las; o uso forte de estrelas do Frawley publicado permanece apenas como testemunho opcional auditável.",
  ];
  if (request.methodMode==="current-marcos-frawley-aware") warnings.unshift("Modo atual: registra que Marcos prefere eleição por horária e que Frawley hoje declara não atribuir valor prático à eletiva; esta avaliação clássica é preservada como ferramenta técnica/contrafactual, não como endosso da prática.");

  const hardVetoes=testimonies.filter(x=>x.severity==="veto");
  const criticalRisks=testimonies.filter(x=>x.severity==="critical");
  const supports=testimonies.filter(x=>x.severity==="support");
  const major=testimonies.filter(x=>x.severity==="major").length;
  const rankingVector=[-hardVetoes.length,-criticalRisks.length,-major,supports.length];
  let band:ElectionalEvaluation["band"]="ACEITAVEL";
  if (hardVetoes.length) band="REJEITAR";
  else if (criticalRisks.length>=3) band="FRACA";
  else if (criticalRisks.length>=1) band="ACEITAVEL";
  else if (supports.length>=6) band="MUITO_BOA";
  else if (supports.length>=3) band="BOA";
  const summary=band==="REJEITAR"?"Candidato rejeitado por gate metodológico.":`Candidato ${band.toLowerCase().replaceAll("_"," ")}; comparar lexicograficamente com outros horários disponíveis, sem score totalizador.`;

  return {module:"western/electional",methodMode:request.methodMode,goal,objective:request.objective,band,hardVetoes,criticalRisks,supports,testimonies,electionRulers:{ascendant:ascRuler,relevant:relevantRuler},planetConditions:conditions,natalLinks,warnings,provenance:ELECTIONAL_SOURCES,rankingVector,summary};
}

export function compareElections(a:ElectionalEvaluation,b:ElectionalEvaluation):number {
  const n=Math.max(a.rankingVector.length,b.rankingVector.length);
  for(let i=0;i<n;i++){ const av=a.rankingVector[i]??0,bv=b.rankingVector[i]??0; if(av!==bv) return bv-av; }
  return 0;
}
