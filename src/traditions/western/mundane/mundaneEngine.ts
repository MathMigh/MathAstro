import { birthDateToUtcMs } from "@/traditions/western/predictive/predictiveAstronomy";
import { findAriesIngressForYear, findGoverningAriesIngress, findLatestPrecedingGrandConjunction, findPrecedingMajorLunation, mundaneSkyAt } from "./mundaneAstronomy";
import { MUNDANE_GAP_MATRIX, blockingMundaneGaps } from "./mundaneGapMatrix";
import { authorAllows, focusProtocol, houseSystemForSourceReproduction, sourcesForAuthorMode } from "./mundanePolicy";
import type { MundaneEngineResult, MundaneInput, MundaneRootEvent } from "./mundaneTypes";
import { findPhysicalEclipses, nearestPrecedingEclipse } from "./mundaneEclipses";
import { buildIngressLordCandidates } from "./mundaneIngressLord";
import { calculateMundaneParts } from "./mundaneParts";
import { buildMundaneRelations, materializeRelationContacts, type MundaneChartNode } from "./mundaneRelations";
import { calculateWeatherDossier } from "./mundaneWeather";
import { buildCometDossiers } from "./mundaneComets";
import { calculateMundaneProgression, calculateMundaneReturns } from "./mundaneTiming";
import { calculateMundaneFixedStars } from "./mundaneFixedStars";
import { buildFocusEvidence } from "./mundaneFocusEvidence";
import { buildMundaneAiContract } from "./mundaneAiContract";
import { buildMundaneAbsolutePrompt } from "./mundaneAiPrompt";

function locationOf(input:MundaneInput){ return input.targetDate.coordinates; }

function fmt(n:number|undefined|null,d=3){return n===undefined||n===null?"—":Number(n).toFixed(d);}
function chartReport(id:string,sky:MundaneEngineResult["charts"]["target"]):string[]{
  const lines=[`### ${id}`,`- UTC: ${sky.utcIso}`,`- Local: ${sky.localIso}`,`- Localidade: ${sky.location.name ?? "—"} · lat ${sky.location.latitude} · lon ${sky.location.longitude} · ${sky.timezone}`,`- Casas: ${sky.houseSystem} (${sky.houseSystemCode})`];
  lines.push("- Planetas:");
  for(const p of sky.planets) lines.push(`  - ${p.name}: ${fmt(p.longitude)}° · ${p.sign}${p.house?` · casa ${p.house}`:""}${p.retrograde?" · retrógrado":""}${p.speed!==undefined?` · vel ${fmt(p.speed,5)}`:""}`);
  lines.push("- Ângulos/cúspides:");
  for(const a of sky.angles) lines.push(`  - ${a.name}: ${fmt(a.longitude)}° · ${a.sign}`);
  for(const c of sky.cusps) lines.push(`  - ${c.name}: ${fmt(c.longitude)}° · ${c.sign}`);
  return lines;
}

function report(result:Omit<MundaneEngineResult,"analysisReport">):string{
  const lines:string[]=[
    "# MathAstro · Astrologia Mundana · Dossiê técnico lossless-friendly · Consulta Pro v3",
    "",
    `Schema engine: ${result.schema}`,
    `Contrato IA: ${result.aiContract.schema} · prompt ${result.aiContract.promptVersion}`,
    `Handoff IA: ${result.aiHandoff.schema} · ${result.aiHandoff.methodVersion}`,
    `Autor: ${result.authorMode}`,
    `Foco: ${result.focus}`,
    `Modo de consulta: ${result.aiHandoff.consultationMode}`,
    `Pergunta: ${result.aiHandoff.consultationQuestion ?? "não fornecida"}`,
    `Alvo: ${result.targetUtcIso}`,
    `IA pronta para interpretação: ${result.aiContract.readyForInterpretation?"sim":"não"}`,
    "",
    "## Cadeia superior",
    `- Ingresso de Áries governante: ${result.governingAriesIngress.utcIso} · residual ${fmt(result.governingAriesIngress.residualArcSeconds,4)}\"`,
    `- Grande Conjunção cronológica precedente: ${result.latestPrecedingGrandConjunction.utcIso} · ${fmt(result.latestPrecedingGrandConjunction.longitude)}°`,
    `- Grande Conjunção do processo: ${result.processGrandConjunction.utcIso} · ${fmt(result.processGrandConjunction.longitude)}°`,
    `- Lunação maior precedente: ${result.precedingMajorLunation.kind} · ${result.precedingMajorLunation.utcIso}`,
    `- Eclipse precedente: ${result.precedingEclipse?`${result.precedingEclipse.kind} · ${result.precedingEclipse.maximumUtcIso}`:"não materializado"}`,
    "",
    "## Ordem de julgamento do foco",
    ...result.focusProtocol.interpretationOrder.map((x,i)=>`${i+1}. ${x}`),
    `- Casas primárias: ${result.focusProtocol.primaryHouses.join(", ")||"—"}`,
    `- Casas secundárias: ${result.focusProtocol.secondaryHouses.join(", ")||"—"}`,
    `- Significadores naturais: ${result.focusProtocol.naturalSignificators.join(", ")||"—"}`,
    `- Requisitos terrestres: ${result.focusProtocol.terrestrialRequirements.join(", ")||"—"}`,
    "",
    "## Rodas principais",
    ...chartReport("target",result.charts.target),
    "",
    ...chartReport("governing-aries-ingress",result.charts.governingIngress),
    "",
    ...chartReport("process-grand-conjunction",result.charts.grandConjunction),
    "",
    "## Eclipses físicos no ano astrológico",
  ];
  if(!result.eclipses.length) lines.push("- nenhum eclipse materializado");
  for(const [i,e] of result.eclipses.entries()){
    lines.push(`### eclipse-${i+1} · ${e.kind}`);
    lines.push(`- máximo: ${e.maximumUtcIso} · Sol ${fmt(e.sunLongitude)}° · Lua ${fmt(e.moonLongitude)}° · signo ${e.eclipseSign}`);
    lines.push(`- fase: ${e.phaseBeginUtcIso??"—"} → ${e.phaseEndUtcIso??"—"}`);
    lines.push(`- Senhor do Eclipse: ${e.lord?.status??"—"} · ${e.lord?.planet??"—"} · ${e.lord?.rule??"—"}`);
    lines.push(`- visibilidade local: ${JSON.stringify(e.localVisibility)}`);
    for(const inv of e.structuralInvariants) lines.push(`- INVARIANTE ${inv.key}: independente=false · ${inv.reason}`);
  }
  lines.push("","## Radices históricos/políticos");
  if(!result.charts.historicalRadices.length) lines.push("- nenhum radix fornecido");
  for(const r of result.charts.historicalRadices){lines.push(`### ${r.id} · ${r.label} · ${r.kind} · qualidade=${r.documentaryQuality??"não informada"}`,...chartReport(r.id,r.chart));}
  lines.push("","## Candidatos a Senhor do Ingresso");
  if(!result.ingressLordCandidates.length) lines.push("- não aplicável ao modo autoral ativo");
  for(const c of result.ingressLordCandidates) lines.push(`- ${c.planet}: ${fmt(c.longitude)}° ${c.sign} · casa ${c.house} ${c.angularity} · dignidade=[${c.essentialCondition.labels.join(", ")||"peregrino/sem label"}] · domicílio-cúspides=[${c.domicileRuledCusps.join(",")}] · exaltação-cúspides=[${c.exaltationRuledCusps.join(",")}] · ângulos=[${c.angularControl.map(x=>`${x.angle}:${x.basis}`).join(",")}] · Lua=${c.moonApplication?`${c.moonApplication.aspect} ${c.moonApplication.exactUtcIso}`:"sem aplicação materializada"}`);
  lines.push("","## Partes");
  for(const p of result.parts) lines.push(`- ${p.key} · ${p.name}: ${fmt(p.longitude)}° ${p.sign} · dispositor=${p.dispositor} · ${p.formula} · status=${p.status} · fontes=${p.sourceIds.join(",")}`);
  lines.push("","## Relações tipadas entre rodas");
  for(const r of result.relations) lines.push(`- ${r.from} → ${r.to} · ${r.type} · ${r.reason}`);
  lines.push("","## Contatos entre rodas");
  if(!result.interChartContacts.length) lines.push("- nenhum dentro do gate de materialização");
  for(const c of result.interChartContacts) lines.push(`- ${c.fromChartId}:${c.fromPoint} → ${c.toChartId}:${c.toPoint} · ${c.aspect} · dist=${fmt(c.distanceToExact)}° · gate=${c.operationalGateDeg}° · ${c.gateProvenance}`);
  lines.push("","## Estrelas fixas");
  lines.push(`- catálogo=${result.fixedStars.catalogCount} · modo=${result.fixedStars.catalogMode} · estrela-como-agente=false · oposição=${result.fixedStars.oppositionPolicy}`);
  for(const c of result.fixedStars.contacts) if(c.eligibleByMarcos||c.eligibleByFrawley) lines.push(`- ${c.targetKind}:${c.target} ↔ ${c.star} · Δlon=${fmt(c.longitudeDistance)}° · mesmo-signo=${c.sameSign} · 2D=${fmt(c.twoDimensionalSeparationDeg)}° · Marcos=${c.eligibleByMarcos} · Frawley=${c.eligibleByFrawley} · ocultação-física=false · fontes=${c.sourceIds.join(",")}`);
  lines.push("","## Evidência por foco");
  for(const f of result.focusEvidence){
    lines.push(`### ${f.chartId}`);
    for(const h of [...f.primaryHouses,...f.secondaryHouses]) lines.push(`- H${h.house}: cúspide ${fmt(h.cuspLongitude)}° ${h.cuspSign} · regente=${h.domicileRuler}${h.exaltationRuler?` · exaltador=${h.exaltationRuler}`:""} · planetas-no-signo=[${h.planetsInCuspSign.map(p=>`${p.planet}:${fmt(p.distanceFromCusp)}°`).join(",")}]`);
    if(f.naturalSignificators.length) lines.push(`- significadores naturais: ${f.naturalSignificators.map(x=>`${x.planet}@H${x.house} ${fmt(x.longitude)}°`).join("; ")}`);
    if(f.admittedParts.length) lines.push(`- Partes admitidas: ${f.admittedParts.map(x=>x.key).join(", ")}`);
  }
  lines.push("","## Progressões/direções baseline");
  if(!result.progressions.length) lines.push("- não solicitadas/não autorizadas");
  for(const p of result.progressions){
    lines.push(`### radix ${p.radixId} · ${p.method} · exactMundaneDirectionClaimed=false`);
    lines.push(`- idade simbólica=${fmt(p.ageYears,6)} anos · data simbólica=${p.symbolicUtcIso}`);
    lines.push(`- promissores: ${p.progressedPoints.map(x=>`${x.name}:${fmt(x.longitude)}° ${x.sign} [${x.mechanism}]`).join("; ")}`);
    for(const c of p.contacts) lines.push(`- contato ${c.moving} → ${c.target} (${c.targetClass}) · ${c.aspect} · Δ=${fmt(c.distanceToExact)}° · ${c.gateProvenance}`);
    for(const t of p.termChanges.filter(x=>x.changed)) lines.push(`- mudança de termo ${t.point}: ${t.radixTerm??"—"} → ${t.progressedTerm??"—"}`);
  }
  lines.push("","## Revoluções");
  if(!result.returns.length) lines.push("- não solicitadas/não autorizadas");
  for(const r of result.returns) lines.push(`- ${r.radixId} · ${r.kind} · ${r.exactUtcIso} · residual=${fmt(r.residualArcSeconds,4)}\" · relação=${r.relation}`);
  lines.push("","## Astrometeorologia");
  if(!result.weather) lines.push("- não solicitada");
  else {
    lines.push(`- status=${result.weather.status} · clima-normal=${result.weather.normalClimate??"ausente"}`);
    lines.push(`- estação=${result.weather.season.label} · ingresso ${result.weather.season.ingress.utcIso} · lunação ${result.weather.season.precedingLunation.utcIso}`);
    lines.push(`- mês · ingresso ${result.weather.month.ingress.utcIso} · lunação ${result.weather.month.precedingLunation.utcIso}`);
    lines.push(`- semana · fase ${result.weather.week.phase.phaseAngle}° · ${result.weather.week.phase.utcIso}`);
    lines.push(`- dia · nascer do Sol ${result.weather.day.sunriseUtcIso??"não resolvido"}`);
    lines.push(`- aplicações · Lua=${result.weather.day.moonApplication?`${result.weather.day.moonApplication.aspect}→${result.weather.day.moonApplication.target}@${result.weather.day.moonApplication.exactUtcIso}`:"—"} · Mercúrio=${result.weather.day.mercuryApplication?`${result.weather.day.mercuryApplication.aspect}→${result.weather.day.mercuryApplication.target}@${result.weather.day.mercuryApplication.exactUtcIso}`:"—"}`);
  }
  lines.push("","## Cometas");
  if(!result.comets.length) lines.push("- nenhum fornecido");
  for(const c of result.comets) lines.push(`- ${c.id} · ${c.name} · primeira=${c.firstSeenUtcIso} · signo=${c.firstSign} · percurso=[${c.pathSigns.join(" → ")}] · pontos=${c.observedPath.length} · completo=${c.pathComplete} · warnings=[${c.warnings.join(",")}]`);
  lines.push("","## Contrato da IA / cobertura");
  for(const [k,v] of Object.entries(result.aiContract.coverage)) lines.push(`- ${k}: ${v}`);
  lines.push("- Estados:");
  for(const [k,v] of Object.entries(result.aiContract.judgmentStates)) lines.push(`  - ${k}: ${v}`);
  lines.push("- Proibições:",...result.aiContract.prohibitions.map(x=>`  - ${x}`));
  lines.push("","## Source-locks / QA");
  for(const g of result.gaps) lines.push(`- ${g.code}: ${g.status}${g.blocking?" [BLOCKING]":""} — ${g.note}`);
  if(result.validation.warnings.length) lines.push("","## Warnings",...result.validation.warnings.map(x=>`- ${x}`));
  if(result.validation.errors.length) lines.push("","## Errors",...result.validation.errors.map(x=>`- ${x}`));
  lines.push("","## Regra final para IA","O motor materializa fatos e relações. A IA executa o Prompt Absoluto Mundana v3 Consulta Pro: processo → escala → cadeia → significadores → convergência/contradição → potencial/localização/manifestação → síntese. Nunca preencha source-lock por imaginação.");
  return lines.join("\n");
}

export async function calculateMundaneEngine(input:MundaneInput):Promise<MundaneEngineResult>{
  const authorMode=input.authorMode ?? "marcos-frawley";
  const focus=input.focus ?? "general";
  const targetMs=birthDateToUtcMs(input.targetDate);
  const location=locationOf(input);
  const governingAriesIngress=await findGoverningAriesIngress(targetMs);
  const latestPrecedingGrandConjunction=await findLatestPrecedingGrandConjunction(Date.parse(governingAriesIngress.utcIso));
  let processGrandConjunction: MundaneRootEvent=latestPrecedingGrandConjunction;
  if(input.processOriginUtcIso){
    const origin=Date.parse(input.processOriginUtcIso);
    if(!Number.isFinite(origin)) throw new Error("processOriginUtcIso inválido.");
    processGrandConjunction=await findLatestPrecedingGrandConjunction(origin);
  }
  const precedingMajorLunation=await findPrecedingMajorLunation(targetMs);
  const ingressYear=new Date(Date.parse(governingAriesIngress.utcIso)).getUTCFullYear();
  const nextAriesIngress=await findAriesIngressForYear(ingressYear+1);
  let eclipses:MundaneEngineResult["eclipses"]=[];
  const eclipseWarnings:string[]=[];
  if(input.includeEclipses!==false){
    try{ eclipses=await findPhysicalEclipses(Date.parse(governingAriesIngress.utcIso),Date.parse(nextAriesIngress.utcIso),location,authorMode); }
    catch(error){ eclipseWarnings.push(`ECLIPSE_RUNTIME_UNAVAILABLE:${error instanceof Error?error.message:String(error)}`); }
  }
  const precedingEclipse=nearestPrecedingEclipse(eclipses,targetMs);
  const [target,governingIngress,grandConjunction]=await Promise.all([
    mundaneSkyAt(targetMs,location,"R"),
    mundaneSkyAt(Date.parse(governingAriesIngress.utcIso),location,"R"),
    mundaneSkyAt(Date.parse(processGrandConjunction.utcIso),location,"R"),
  ]);
  const eclipseCharts=[] as MundaneEngineResult["charts"]["eclipseCharts"];
  for(let i=0;i<eclipses.length;i++){
    const e=eclipses[i];
    eclipseCharts.push({id:`eclipse-${i+1}`,eclipseMaximumUtcIso:e.maximumUtcIso,chart:await mundaneSkyAt(Date.parse(e.maximumUtcIso),location,"R")});
  }
  const historicalRadices=[] as MundaneEngineResult["charts"]["historicalRadices"];
  for(const radix of input.historicalRadices ?? []){
    const ms=birthDateToUtcMs(radix.date);
    const hsys=houseSystemForSourceReproduction(authorMode,"historical-radix");
    historicalRadices.push({id:radix.id,label:radix.label,kind:radix.kind,documentaryQuality:radix.documentaryQuality,chart:await mundaneSkyAt(ms,radix.date.coordinates,hsys)});
  }
  const ingressLordCandidates=authorAllows(authorMode,"lord-of-ingress")?await buildIngressLordCandidates(governingIngress):[];
  const parts=calculateMundaneParts(governingIngress,authorMode,focus,input);
  const eclipseIds=eclipseCharts.map(x=>x.id);
  const relations=buildMundaneRelations({radixIds:historicalRadices.map(x=>x.id),eclipseIds,relatedRadixIds:input.relatedRadixIds});
  const nodes:MundaneChartNode[]=[
    {id:"target",sky:target,role:"trigger"},{id:"governing-aries-ingress",sky:governingIngress,role:"annual"},{id:"process-grand-conjunction",sky:grandConjunction,role:"chronocrator"},
    ...eclipseCharts.map(x=>({id:x.id,sky:x.chart,role:"eclipse"})),...historicalRadices.map(x=>({id:x.id,sky:x.chart,role:"historical-radix"})),
  ];
  const interChartContacts=materializeRelationContacts(relations,nodes);
  const weather=focus==="weather"&&authorMode!=="marcos"?await calculateWeatherDossier(targetMs,location,input):undefined;
  const comets=buildCometDossiers(input);
  const fixedStars=await calculateMundaneFixedStars({chartId:"governing-aries-ingress",sky:governingIngress,mode:authorMode,parts,includeFull:Boolean(input.includeFullFixedStarCatalog)});
  const fp=focusProtocol(focus);
  const focusEvidence=[buildFocusEvidence("governing-aries-ingress",governingIngress,fp,parts),buildFocusEvidence("target",target,fp,parts),...historicalRadices.map(r=>buildFocusEvidence(r.id,r.chart,fp,parts))];
  const progressions:MundaneEngineResult["progressions"]=[];
  const returns:MundaneEngineResult["returns"]=[];
  if(authorAllows(authorMode,"five-promissor-progression")){
    for(let i=0;i<(input.historicalRadices??[]).length;i++){
      const raw=(input.historicalRadices??[])[i], material=historicalRadices[i];
      progressions.push(await calculateMundaneProgression(raw,material.chart,targetMs));
      if(authorAllows(authorMode,"solar-lunar-returns")) returns.push(...await calculateMundaneReturns(raw,material.chart,targetMs));
    }
  }
  const errors:string[]=[]; const warnings:string[]=[...eclipseWarnings,...comets.flatMap(c=>c.warnings.map(w=>`${w}:${c.id}`))];
  for(const requirement of fp.terrestrialRequirements){
    if(input.terrestrialContext?.[requirement] === undefined) warnings.push(`TERRESTRIAL_CONTEXT_MISSING:${requirement}`);
  }
  for(const r of input.historicalRadices ?? []) if(!r.documentaryQuality) warnings.push(`RADIX_DOCUMENTARY_QUALITY_MISSING:${r.id}`);
  if(fp.requiredLayers.includes("preceding-eclipse")&&!precedingEclipse) warnings.push("PRECEDING_ECLIPSE_NOT_MATERIALIZED");
  if(focus==="weather"&&!input.weather?.normalClimate) warnings.push("WEATHER_NORMAL_CLIMATE_MISSING");
  if(focus==="agriculture"&&!input.agriculture?.crop) warnings.push("AGRICULTURE_CROP_MISSING");
  const blockers=blockingMundaneGaps();
  if(blockers.length) warnings.push(...blockers.map(x=>`QA_BLOCKER:${x.code}`));
  const aiContract=buildMundaneAiContract({focus,interpretationOrder:fp.interpretationOrder,gaps:MUNDANE_GAP_MATRIX,warnings,hasEclipses:eclipses.length>0,hasRadices:historicalRadices.length>0,hasWeather:Boolean(weather),hasAgriculturePart:parts.some(p=>p.key.startsWith("crop-")),hasComets:comets.length>0,hasProgressions:progressions.length>0,hasReturns:returns.length>0,hasStars:fixedStars.catalogCount>0});
  const aiHandoff=buildMundaneAbsolutePrompt({authorMode,focus,contract:aiContract,consultationMode:input.consultationMode,consultationQuestion:input.consultationQuestion});
  const base:Omit<MundaneEngineResult,"analysisReport">={
    schema:"mathastro.mundane/0.5", authorMode, focus, targetUtcIso:new Date(targetMs).toISOString(), focusProtocol:fp,
    sources:sourcesForAuthorMode(authorMode), governingAriesIngress, latestPrecedingGrandConjunction, processGrandConjunction, precedingMajorLunation,
    eclipses, precedingEclipse, ingressLordCandidates, parts, relations, interChartContacts, weather, comets, progressions, returns, fixedStars, focusEvidence, aiContract, aiHandoff,
    charts:{target,governingIngress,grandConjunction,eclipseCharts,historicalRadices}, gaps:MUNDANE_GAP_MATRIX,
    validation:{status:errors.length?"FAIL":warnings.length?"WARN":"PASS",errors,warnings},
  };
  return {...base,analysisReport:report(base)};
}
