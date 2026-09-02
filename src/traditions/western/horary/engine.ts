import type { PlanetType } from "@/interfaces/BirthChartInterfaces";
import { CLASSICAL_PLANETS, HORARY_SOURCES, NAME_TO_PLANET, PLANET_NAMES, SIGN_VOICE } from "./tables";
import { DOMICILE_RULER } from "@/app/lib/traditionalTables";
import { analyseQuestion } from "./router";
import { coverageFor } from "./coverage";
import { classifyHoraryQuestion } from "./ontology";
import { compileHoraryDecisionPlan } from "./decisionGrammar";
import { HORARY_HOUSE_ATLAS } from "./houseSemantics";
import { antiscialContact, antiscionLongitude, aspectBetween, cuspEntryDistance, degreeInSign, essentialCondition, lunarSequence, norm, planet, planetHouse, reception, significator, significatorFromPlanet, signIndex, shortDistance } from "./calculations";
import { analyseMediation } from "./mechanics";
import type { HoraryDossier, HoraryQuestionContext, HoraryRequest, HorarySignificator, HoraryTestimony } from "./types";

const unique=<T>(xs:T[])=>[...new Set(xs)];
const test=(id:string,severity:HoraryTestimony["severity"],subject:string,statement:string,sourceIds:string[],data?:Record<string,unknown>):HoraryTestimony=>({id,severity,subject,statement,sourceIds,data});
function modeOf(lon:number):"cardinal"|"fixed"|"mutable" { const i=Math.floor(norm(lon)/30); return [0,3,6,9].includes(i)?"cardinal":[1,4,7,10].includes(i)?"fixed":"mutable"; }
function signExitDistance(s:HorarySignificator){ return s.speed>=0?30-degreeInSign(s.longitude):degreeInSign(s.longitude); }
function role(ss:HorarySignificator[],name:string){ return ss.find(s=>s.role===name); }
function findPrimary(ss:HorarySignificator[],roles:string[]){ return roles.map(r=>role(ss,r)).filter(Boolean) as HorarySignificator[]; }
function positiveReception(x:ReturnType<typeof reception>|undefined){ return !!x && ["strong_positive","positive","mild_positive"].includes(x.disposition); }
function negativeReception(x:ReturnType<typeof reception>|undefined){ return !!x && ["negative","strong_negative"].includes(x.disposition); }
function voiceQuality(lon:number){ return SIGN_VOICE[signIndex(lon)]; }
function elementOf(lon:number):"fire"|"earth"|"air"|"water" { return (["fire","earth","air","water"] as const)[signIndex(lon)%4]; }
function dispositorOf(lon:number):PlanetType|undefined { return NAME_TO_PLANET[DOMICILE_RULER[signIndex(lon)]]; }
function nextSignIndexFor(s:HorarySignificator){ const i=signIndex(s.longitude); return (i+(s.speed>=0?1:11))%12; }
const SIGN_QUALITIES:Array<"hot_dry"|"cold_dry"|"hot_moist"|"cold_moist">=["hot_dry","cold_dry","hot_moist","cold_moist","hot_dry","cold_dry","hot_moist","cold_moist","hot_dry","cold_dry","hot_moist","cold_moist"];
const PLANET_QUALITIES:Partial<Record<PlanetType,"hot_dry"|"cold_dry"|"hot_moist"|"cold_moist">>={sun:"hot_dry",moon:"cold_moist",mercury:"cold_dry",venus:"cold_moist",mars:"hot_dry",jupiter:"hot_moist",saturn:"cold_dry"};
function rolePlanetPair(ss:HorarySignificator[],a:string,b:string){ const x=role(ss,a),y=role(ss,b); return x&&y?[x,y] as const:undefined; }
function motherOr(ss:HorarySignificator[]){ return role(ss,"mother")??role(ss,"querent")??ss[0]; }

function timingLabel(degrees:number|undefined,sig:HorarySignificator,context:HoraryQuestionContext):string|undefined {
  if(degrees===undefined) return undefined;
  if(context.pastTimingCalibration?.degrees && context.pastTimingCalibration.degrees>0){
    const c=context.pastTimingCalibration;
    const value=degrees*(c.elapsed/c.degrees);
    return `${value.toFixed(2)} ${c.unit} (calibração interna: ${c.degrees}° = ${c.elapsed} ${c.unit}${c.description?`; ${c.description}`:""}).`;
  }
  const housePace=sig.accidental.angularity==="angular"?"lento":sig.accidental.angularity==="cadent"?"rápido":"intermediário";
  const signMode=modeOf(sig.longitude), signPace=signMode==="fixed"?"lento":signMode==="cardinal"?"rápido":"intermediário";
  let effectiveHousePace=housePace;
  if(sig.accidental.angularity==="angular") effectiveHousePace="lento";
  const pace=effectiveHousePace===signPace?effectiveHousePace:"intermediário";
  const units=context.timingUnits?.length?` Escala plausível fornecida: ${context.timingUnits.join(" / ")}.`:"";
  return `${degrees.toFixed(2)} unidade(s) de arco; combinação signo=${signPace}, casa=${housePace}, síntese=${pace}.${units} A angularidade pode acelerar quando representa agente com vontade e capacidade; não converter mecanicamente sem recepções/contexto.`;
}

function analysePair(chart:HoraryRequest["chart"],a:HorarySignificator,b:HorarySignificator,receptions:ReturnType<typeof reception>[],perfections:NonNullable<ReturnType<typeof aspectBetween>>[],antis:NonNullable<ReturnType<typeof antiscialContact>>[],testimonies:HoraryTestimony[],label:string){
  const r1=reception(chart,a.planet,b.planet), r2=reception(chart,b.planet,a.planet); receptions.push(r1,r2);
  const asp=aspectBetween(chart,a.planet,b.planet); if(asp) perfections.push(asp);
  const anti=antiscialContact(chart,a.planet,b.planet); if(anti) antis.push(anti);
  if(asp?.applying&&asp.beforeEitherChangesSign) testimonies.push(test(`${label}-application`,"decisive","perfection",`${a.planetName} (${a.role}) aplica a ${b.planetName} (${b.role}) por ${asp.aspect} antes de mudança de signo.`,["M-HORARY-CURRENT","F-HT"],{orb:asp.orb,degreesToPerfection:asp.degreesToPerfection}));
  else if(asp?.applying&&asp.beforeEitherChangesSign===false) testimonies.push(test(`${label}-sign-change`,"major","perfection",`Há aplicação geométrica ${a.planetName}–${b.planetName}, mas a projeção ultrapassa mudança de signo; não tratar como perfeição simples.`,["M-HORARY-CURRENT","F-HT"],{aspect:asp}));
  else if(asp?.separating) testimonies.push(test(`${label}-separation`,"major","perfection",`O contato ${a.planetName}–${b.planetName} é separativo: descreve contato passado, não perfeição futura por si só.`,["F-HT"]));
  else if(!asp) testimonies.push(test(`${label}-no-aspect`,"minor","perfection",`Não há aspecto ptolomaico próximo entre ${a.role} e ${b.role}; examinar Lua, tradução/coleta, antíscio e regra específica do tópico.`,["M-HORARY-CURRENT","F-HT"]));
  testimonies.push(test(`${label}-reception-a-b`,"context","reception",`${r1.fromName} (${a.role}) → ${r1.toName} (${b.role}): ${r1.strongest}/${r1.disposition}.`,["M-HORARY-CURRENT","F-HT"],{reception:r1}));
  testimonies.push(test(`${label}-reception-b-a`,"context","reception",`${r2.fromName} (${b.role}) → ${r2.toName} (${a.role}): ${r2.strongest}/${r2.disposition}.`,["M-HORARY-CURRENT","F-HT"],{reception:r2}));
  return {asp,r1,r2};
}

export function evaluateHorary(request:HoraryRequest):HoraryDossier {
  const {chart,context}=request;
  if(chart.housesData.houseSystem && chart.housesData.houseSystem!=="Regiomontanus") throw new Error("HORARY_ONLY exige cúspides Regiomontanus no contrato atual.");
  if(!context.concreteQuestion?.trim()) throw new Error("Pergunta concreta é obrigatória.");
  const topicAnalysis=analyseQuestion(context);
  const ontology=classifyHoraryQuestion(context);
  const decisionPlan=compileHoraryDecisionPlan(context);
  const coverage=coverageFor(context.topic);
  const allowedRoles=new Set(topicAnalysis.houses.map(h=>h.role));
  const houseSignificators=topicAnalysis.houses.filter(h=>allowedRoles.has(h.role)).map(h=>significator(chart,h.role,h.radicalHouse,h.sourceIds));
  const naturalSignificators=topicAnalysis.naturalRoles.filter(n=>!houseSignificators.some(s=>s.role===n.role)).map(n=>significatorFromPlanet(chart,n.role,n.planet,n.sourceIds?.length?n.sourceIds:["F-HT"],"natural_planet"));
  const significators=[...houseSignificators,...naturalSignificators];
  const receptions=[] as ReturnType<typeof reception>[];
  const directPerfections=[] as NonNullable<ReturnType<typeof aspectBetween>>[];
  const antiscialContacts=[] as NonNullable<ReturnType<typeof antiscialContact>>[];
  const testimonies:HoraryTestimony[]=[];
  const considerations:HoraryTestimony[]=[];
  const ascDeg=degreeInSign(chart.housesData.ascendant);
  if(ascDeg<3) considerations.push(test("consideration-early-asc","context","considerations",`Ascendente a ${ascDeg.toFixed(2)}° do signo: consideração tradicional registrada, não bloqueadora.`,["M-HORARY-CURRENT","F-HT"]));
  if(ascDeg>=27) considerations.push(test("consideration-late-asc","context","considerations",`Ascendente a ${ascDeg.toFixed(2)}° do signo: consideração tradicional registrada, não bloqueadora.`,["M-HORARY-CURRENT","F-HT"]));
  const satHouse=planetHouse(chart,planet(chart,"saturn").longitudeRaw);
  if(satHouse===7 && !["relationship","marriage","lover","lawsuit","competition","buy_sell"].includes(context.topic)) considerations.push(test("consideration-saturn-7","context","considerations","Saturno está na VII: consideração histórica registrada; não invalida mecanicamente a carta.",["M-HORARY-CURRENT","F-HT"]));

  const primary=findPrimary(significators,topicAnalysis.primaryRoles);
  const a=primary[0],b=primary[1];
  let primaryAspect:ReturnType<typeof aspectBetween>|undefined;
  let primaryR1:ReturnType<typeof reception>|undefined, primaryR2:ReturnType<typeof reception>|undefined;
  if(a&&b){ const x=analysePair(chart,a,b,receptions,directPerfections,antiscialContacts,testimonies,"primary"); primaryAspect=x.asp; primaryR1=x.r1; primaryR2=x.r2; }

  const mediation=a&&b?analyseMediation(chart,a.planet,b.planet,primaryAspect):[];
  for(const m of mediation) testimonies.push(test(`mediation-${m.kind}-${m.mediator??"none"}`,m.kind==="translation"||m.kind==="collection"?"major":"minor","mediation",m.statement,m.sourceIds,m.data));

  const lunar=lunarSequence(chart);
  const moonVOC=lunar.length===0;
  if(moonVOC) considerations.push(test("consideration-moon-voc","context","considerations","Lua vazia de curso registrada como consideração/estado; seu peso depende do tópico.",["M-HORARY-CURRENT","F-HT"]));
  if(moonVOC) testimonies.push(test("moon-voc","context","moon","A Lua não aperfeiçoa aspecto ptolomaico com planeta tradicional antes de sair do signo, pelo algoritmo estrito usado aqui.",["F-HT"]));
  else testimonies.push(test("moon-next","context","moon",`Próximo contato lunar: ${lunar[0].aspect} com ${lunar[0].targetName}.`,["M-HORARY-CURRENT","F-HT"],{sequence:lunar}));

  // Módulos tópicos que NÃO podem ser reduzidos ao juiz genérico L1×Lquesitado.
  if(context.topic==="job_get"){
    const q=role(significators,"querent"),job=role(significators,"quesited"),wages=role(significators,"wages"),rival=role(significators,"job_rival");
    if(q&&wages) { const rwq=reception(chart,wages.planet,q.planet); receptions.push(rwq); testimonies.push(test("job-wages-quality","context","job_get",`L11 (salário) em relação ao querente: ${rwq.strongest}/${rwq.disposition}. Isto qualifica pagamento; não é testemunho de conseguir a vaga.`,["F-HT"],{wagesEssential:wages.essential,wagesAccidental:wages.accidental})); }
    if(job&&rival&&q){
      const jr=aspectBetween(chart,job.planet,rival.planet), jq=aspectBetween(chart,job.planet,q.planet);
      const tr=jr?.applying?jr.estimatedDaysToPerfection:undefined, tq=jq?.applying?jq.estimatedDaysToPerfection:undefined;
      if(tr!==undefined&&(tq===undefined||tr<tq)) testimonies.push(test("job-rival-before-querent","decisive","job_get",`L10 encontra/aplica ao rival (L7) antes do querente: forte testemunho de a vaga ir para outro candidato.`,["F-HT"],{jobToRival:jr,jobToQuerent:jq}));
    }
    if(moonVOC) testimonies.push(test("job-get-voc","major","job_get","Como a pergunta exige mudança de estado, Lua vazia de curso é testemunho negativo importante, embora possa ser superado por testemunho mais forte.",["F-HT"]));
    if(primaryR2&&negativeReception(primaryR2)) testimonies.push(test("job-dislikes-querent","major","job_get","L10 recebe L1 por detrimento/queda: o emprego/empregador mostra forte aversão ao querente; isso pesa contra a contratação.",["F-HT"],{reception:primaryR2}));
  }

  if(context.topic==="job_keep"){
    const q=role(significators,"querent"),job=role(significators,"quesited");
    const fixedAngles=[chart.housesData.ascendant,chart.housesData.mc].every(x=>modeOf(x)==="fixed");
    if(fixedAngles) testimonies.push(test("job-keep-fixed-angles","major","job_keep","ASC e MC estão em signos fixos: testemunho de permanência da situação.",["F-HT"]));
    for(const s of [q,job].filter(Boolean) as HorarySignificator[]){
      if(modeOf(s.longitude)==="fixed") testimonies.push(test(`job-keep-fixed-${s.role}`,"major","job_keep",`${s.role} está em signo fixo: testemunho de manutenção.`,["F-HT"]));
      const exit=signExitDistance(s);
      if(exit<=3) testimonies.push(test(`job-keep-sign-exit-${s.role}`,"major","job_keep",`${s.role} está a ${exit.toFixed(2)}° de sair do signo: testemunho forte de mudança, a qual deve ser qualificada pela dignidade no signo seguinte.`,["F-HT"],{degreesToSignExit:exit}));
    }
    if(moonVOC) testimonies.push(test("job-keep-voc","major","job_keep","Lua vazia de curso reforça continuidade do estado atual nesta classe de pergunta.",["F-HT"]));
  }

  if(context.topic==="work_relationship"){
    testimonies.push(test("work-rel-state","context","work_relationship","Pergunta de convivência é primariamente julgamento de estado/recepção; aspecto pode qualificar, mas não é requisito para a relação existir.",["F-HT"]));
  }

  if(context.topic==="tax"){
    const qm=role(significators,"querent_money"),gov=role(significators,"government"),treasury=role(significators,"government_treasury");
    if(qm&&gov) analysePair(chart,qm,gov,receptions,directPerfections,antiscialContacts,testimonies,"tax-money-government");
    if(qm&&treasury) analysePair(chart,qm,treasury,receptions,directPerfections,antiscialContacts,testimonies,"tax-money-treasury");
    testimonies.push(test("tax-structure","major","tax","Juízo fiscal materializa L2 (dinheiro do querente), L10 (governo) e L11 (cofres do governo); não reduz imposto a L1×L10.",["F-HT"]));
  }

  if(context.topic==="inheritance"){
    const legacy=role(significators,"legacy_money")??role(significators,"quesited"),q=role(significators,"querent"),qm=role(significators,"querent_money");
    if(legacy&&q) analysePair(chart,legacy,q,receptions,directPerfections,antiscialContacts,testimonies,"legacy-to-querent");
    if(legacy&&qm) analysePair(chart,legacy,qm,receptions,directPerfections,antiscialContacts,testimonies,"legacy-to-money");
    if(legacy){ const lm=aspectBetween(chart,legacy.planet,"moon"); if(lm) directPerfections.push(lm); testimonies.push(test("legacy-moon","context","inheritance",lm?`Contato legado–Lua: ${lm.aspect}, ${lm.applying?"aplicativo":"separativo"}.`:"Sem aspecto ptolomaico próximo entre legado e Lua.",["F-HT"],{aspect:lm})); }
  }

  if(context.topic==="lottery"){
    const windfall=role(significators,"windfall"),q=role(significators,"querent"),qm=role(significators,"querent_money");
    if(windfall&&q) analysePair(chart,windfall,q,receptions,directPerfections,antiscialContacts,testimonies,"lottery-to-querent");
    if(windfall&&qm) analysePair(chart,windfall,qm,receptions,directPerfections,antiscialContacts,testimonies,"lottery-to-pocket");
    if(windfall) testimonies.push(test("lottery-windfall-condition",windfall.essential.domicile||windfall.essential.exaltation?"major":"context","lottery",`L11/ganho do alto = ${windfall.planetName}; jackpot exige condição excepcionalmente forte, não mero contato.`,["F-HT"],{essential:windfall.essential,accidental:windfall.accidental}));
  }
  if(context.topic==="government_grant"){
    const rec=role(significators,"grant_recipient"),gift=role(significators,"government_gift"),gov=role(significators,"government");
    if(rec&&gift) analysePair(chart,rec,gift,receptions,directPerfections,antiscialContacts,testimonies,"grant-recipient-gift");
    if(rec&&gov){ const rg=reception(chart,gov.planet,rec.planet); receptions.push(rg); testimonies.push(test("grant-government-attitude",negativeReception(rg)?"major":"context","government_grant",`Órgão/L10 → beneficiário: ${rg.strongest}/${rg.disposition}; pesa sobretudo se a concessão for discricionária.`,["F-HT"],{reception:rg})); }
    if(rec){ const exit=signExitDistance(rec); if(exit<=3) testimonies.push(test("grant-recipient-imminent-change","major","government_grant",`Beneficiário está a ${exit.toFixed(2)}° de mudança de signo: mudança imediata de condição pode decidir a concessão, como em casos publicados.`,["F-HT"],{degreesToSignExit:exit})); }
  }
  if(context.topic==="election"){
    const candidateRoles=topicAnalysis.primaryRoles.map(r=>role(significators,r)).filter(Boolean) as HorarySignificator[];
    const moon=significator(chart,"electorate",1,["F-HT"]);
    testimonies.push(test("election-moon-electorate","major","election","A Lua é usada como significadora natural do eleitorado; não recebe uma casa artificial para isso.",["F-HT"],{moonLongitude:planet(chart,"moon").longitudeRaw}));
    if(context.eventAlreadyOccurred){
      const past=CLASSICAL_PLANETS.filter(pt=>pt!=="moon").flatMap(pt=>{ const ev=aspectBetween(chart,"moon",pt); return ev?.separating?[{pt,ev}]:[]; }).sort((x,y)=>x.ev.orb-y.ev.orb);
      const last=past[0];
      if(last){ testimonies.push(test("election-last-lunar-aspect","major","election",`Como o evento físico já terminou, o último aspecto lunar é materializado: Lua separa de ${PLANET_NAMES[last.pt]} por ${last.ev.aspect}, a ${last.ev.orb.toFixed(2)}° da perfeição passada.`,["F-HT"],{planet:last.pt,aspect:last.ev}));
        for(const c of candidateRoles){ if(c.planet===last.pt) continue; const toCollector=aspectBetween(chart,c.planet,last.pt); if(toCollector?.applying&&toCollector.beforeEitherChangesSign) testimonies.push(test(`election-past-collection-${c.role}`,"major","election",`${c.planetName}/${c.role} aplica a ${PLANET_NAMES[last.pt]}, planeta do último aspecto lunar. Isto materializa candidato de coleta/ligação do resultado já consumado, para julgamento contextual.`,["F-HT"],{collector:last.pt,aspect:toCollector})); }
      }
    }
    for(const c of candidateRoles){ const ev=aspectBetween(chart,"moon",c.planet); if(ev) testimonies.push(test(`election-moon-${c.role}`,ev.applying&&ev.beforeEitherChangesSign?"decisive":"context","election",`Eleitorado/Lua → ${c.role}/${c.planetName}: ${ev.aspect}, ${ev.applying?"aplicativo":"separativo"}.`,["F-HT"],{aspect:ev})); }
  }
  if(context.topic==="communication"){
    const comm=role(significators,"communication")??role(significators,"quesited");
    if(comm){ const v=voiceQuality(comm.longitude),nv=SIGN_VOICE[nextSignIndexFor(comm)]; testimonies.push(test("communication-voice","context","communication",`${comm.planetName} está em signo de voz ${v}; próximo signo na direção atual: ${nv}.`,["M-HORARY-CURRENT","F-HT"],{voice:v,nextVoice:nv,degreesToSignExit:signExitDistance(comm)})); }
  }
  if(context.topic==="delivery"){
    const pkg=role(significators,"package"),q=role(significators,"querent"),qp=role(significators,"querent_possessions");
    if(pkg&&q) analysePair(chart,pkg,q,receptions,directPerfections,antiscialContacts,testimonies,"delivery-package-querent");
    if(pkg&&qp) analysePair(chart,pkg,qp,receptions,directPerfections,antiscialContacts,testimonies,"delivery-package-pocket");
    if(pkg){ const moonPkg=aspectBetween(chart,"moon",pkg.planet); if(moonPkg) testimonies.push(test("delivery-moon-package",moonPkg.applying&&moonPkg.beforeEitherChangesSign?"decisive":"context","delivery",`Lua → pacote/${pkg.planetName}: ${moonPkg.aspect}, ${moonPkg.degreesToPerfection?.toFixed(2)}° até perfeição.`,["F-HT"],{aspect:moonPkg})); }
  }
  if(context.topic==="authenticity"){
    const product=role(significators,"product");
    if(product){
      const strong=product.essential.domicile||product.essential.exaltation;
      const bad=product.essential.detriment||product.essential.fall||product.accidental.combust;
      const afflictors=product.house?CLASSICAL_PLANETS.filter(pt=>pt!==product.planet).map(pt=>({pt,house:planetHouse(chart,planet(chart,pt).longitudeRaw),essential:essentialCondition(chart,pt),actual:planet(chart,pt)})).filter(x=>x.house===product.house&&(x.essential.detriment||x.essential.fall)):[];
      testimonies.push(test("authenticity-product-condition",bad?"decisive":strong?"major":"context","authenticity",`Produto = ${product.planetName}; dignidade essencial mostra até que ponto ele corresponde à própria natureza, e aflições mostram defeito/inautenticidade.`,["F-HT"],{essential:product.essential,accidental:product.accidental,strong,bad}));
      if(afflictors.length){ testimonies.push(test("authenticity-house-affliction","major","authenticity",`A casa do produto recebe planeta debilitado: ${afflictors.map(x=>`${PLANET_NAMES[x.pt]} em detrimento/queda`).join(", ")}. Isto reforça defeito/inautenticidade no caso-fonte.`,["F-HT"],{afflictors:afflictors.map(x=>x.pt)})); }
    }
  }
  if(context.topic==="kidnapping"){
    const person=role(significators,"kidnapped_person"),rd=role(significators,"radical_death"),td=role(significators,"turned_death"),cap=role(significators,"turned_captivity");
    if(person&&rd&&person.planet!==rd.planet) analysePair(chart,person,rd,receptions,directPerfections,antiscialContacts,testimonies,"kidnap-radical-death");
    if(person&&td&&person.planet!==td.planet) analysePair(chart,person,td,receptions,directPerfections,antiscialContacts,testimonies,"kidnap-turned-death");
    if(person&&td&&person.planet===td.planet) testimonies.push(test("kidnap-turned-death-self","context","kidnapping","Pessoa e VIII derivada têm o mesmo regente; não fabricar self-aspect. A VIII radical fornece significador alternativo de morte.",["F-HT"]));
    if(person&&cap) testimonies.push(test("kidnap-captivity-state","context","kidnapping",`${person.planetName} (sequestrado) e cativeiro derivado/${cap.planetName} foram materializados; soltura deve ser inferida por saída do poder/cativeiro conforme a sequência, não por dignidade genérica.`,["F-HT"]));
  }

  if(["prison","release"].includes(context.topic)){
    const person=role(significators,"prison_subject")??role(significators,"querent");
    const prison=role(significators,"quesited");
    if(person&&prison && (person.role!==a?.role||prison.role!==b?.role)) analysePair(chart,person,prison,receptions,directPerfections,antiscialContacts,testimonies,"prison-person-ruler");
    if(person){
      const prisonHouses=topicAnalysis.houses.filter(h=>h.role==="radical_prison"||h.role==="derived_prison");
      for(const h of prisonHouses){ const ce=cuspEntryDistance(chart,person.planet,h.radicalHouse); testimonies.push(test(`prison-cusp-${h.radicalHouse}`,"major","prison",`Distância direcional de ${person.planetName} (pessoa) até a cúspide da casa ${h.radicalHouse} de prisão: ${ce.degrees.toFixed(2)}°.`,["F-HT"],{house:h.radicalHouse,possible:ce.possible,state:context.prisonState})); }
    }
    const saturnPrison=role(significators,"imprisonment_natural");
    if(person&&saturnPrison&&person.planet!==saturnPrison.planet){
      const saturnContact=aspectBetween(chart,person.planet,saturnPrison.planet);
      if(saturnContact) testimonies.push(test("prison-natural-saturn-contact",saturnContact.applying&&saturnContact.beforeEitherChangesSign?"major":"context","prison",`${person.planetName} (pessoa) → Saturno natural da prisão: ${saturnContact.aspect}, ${saturnContact.applying?"aplicativo":"separativo"}. É testemunho auxiliar de confinamento; XII radical/derivada continua estrutural.`,["F-HT"],{aspect:saturnContact}));
    }
    if(context.prisonState==="imprisoned") testimonies.push(test("prison-existing-state","context","prison","A pessoa já está presa: presença/aplicação à prisão descreve primeiro o estado existente; o juízo deve procurar melhora/piora/saída, não converter o fato já consumado em nova prisão.",["F-HT"]));
    if(context.prisonState==="release_question") testimonies.push(test("release-semantics","context","release","Pergunta de soltura inverte o foco: procura-se testemunho de saída/afastamento da prisão e mudança do estado atual.",["F-HT"]));
  }

  if(context.topic==="self_undoing"){
    const q=role(significators,"querent"),undo=role(significators,"self_undoing")??role(significators,"quesited");
    if(q&&undo){ const ru=reception(chart,q.planet,undo.planet); receptions.push(ru); testimonies.push(test("self-undoing-reception","major","self_undoing",`${q.planetName} em relação a L12: ${ru.strongest}/${ru.disposition}. Isto descreve o grau em que o significador do querente está entregue ao assunto de XII, sem transformar recepção em diagnóstico.`,["M-HORARY-CURRENT","F-HT"])); const exit=signExitDistance(q); testimonies.push(test("self-undoing-sign-change","context","self_undoing",`L1 está a ${exit.toFixed(2)}° de mudança de signo; se próxima, comparar recepções antes/depois para ver entrada ou saída da condição.`,["F-HT"])); }
  }

  if(["salary","debt","loan"].includes(context.topic)) {
    const money=role(significators,"wages")??role(significators,"payment_money")??role(significators,"quesited");
    const q=role(significators,"querent"),qm=role(significators,"querent_money");
    if(money&&q) analysePair(chart,money,q,receptions,directPerfections,antiscialContacts,testimonies,"payment-to-querent");
    if(money&&qm) analysePair(chart,money,qm,receptions,directPerfections,antiscialContacts,testimonies,"payment-to-pocket");
  }
  if(context.topic==="bet") {
    const prize=role(significators,"bookmaker_money")??role(significators,"quesited"),q=role(significators,"querent"),qm=role(significators,"querent_money");
    if(prize&&q) analysePair(chart,prize,q,receptions,directPerfections,antiscialContacts,testimonies,"bet-profit-to-querent");
    if(prize&&qm) analysePair(chart,prize,qm,receptions,directPerfections,antiscialContacts,testimonies,"bet-profit-to-pocket");
    testimonies.push(test("bet-is-profit","major","bet","O objeto do juízo é lucro/prejuízo da aposta, não quem vence a competição em abstrato.",["F-HT"]));
  }
  if(context.topic==="investment") {
    const qm=role(significators,"querent_money")??role(significators,"quesited");
    if(qm) testimonies.push(test("investment-future-state","major","investment",`L2 está em ${qm.sign} a ${signExitDistance(qm).toFixed(2)}° da próxima mudança de signo; comparar condição presente e futura antes de recomendar mudança.`,["F-HT"],{essential:qm.essential,accidental:qm.accidental}));
  }
  if(context.topic==="property"||context.topic==="buy_sell") {
    for(const r of ["property","price","property_profit","property_neighbours"]){ const x=role(significators,r); if(x) testimonies.push(test(`property-${r}`,"context","property",`${r}: ${x.planetName}, condição essencial/acidental materializada.`,["F-HT"],{essential:x.essential,accidental:x.accidental})); }
    const q=role(significators,"querent"),prop=role(significators,"property");
    if(q&&prop&&q.planet!==prop.planet) analysePair(chart,q,prop,receptions,directPerfections,antiscialContacts,testimonies,"property-querent-property");
  }
  if(["lost_object","missing_animal","missing_person"].includes(context.topic)) {
    const target=role(significators,"lost_object")??role(significators,"missing_animal")??role(significators,"missing_person")??role(significators,"quesited");
    if(target){
      const element=elementOf(target.longitude),mode=modeOf(target.longitude),disp=dispositorOf(target.longitude);
      const dispSig=disp?significatorFromPlanet(chart,"location_dispositor",disp,["F-HT"],"natural_planet"):undefined;
      testimonies.push(test("missing-location","major",context.topic,`Localização primária: ${target.planetName} está na casa ${target.accidental.house}, ${target.sign} ${target.degreeInSign.toFixed(2)}°. A casa tem prioridade; signo e contatos refinam a descrição.`,["M-HORARY-CURRENT","F-HT"],{house:target.accidental.house,sign:target.sign,longitude:target.longitude,element,mode,dispositor:disp,dispositorEssential:dispSig?.essential,dispositorAccidental:dispSig?.accidental}));
      testimonies.push(test("missing-location-symbolism","context",context.topic,`Refino de localização já calculado para a camada interpretativa: elemento=${element}, modalidade=${mode}, dispositor tradicional=${disp?PLANET_NAMES[disp]:"não resolvido"}. A IA pode traduzir estes símbolos em lugares concretos sem recalcular o mapa.`,["F-HT"],{element,mode,dispositor:disp,dispositorEssential:dispSig?.essential,dispositorAccidental:dispSig?.accidental}));
      for(const outer of (["uranus","neptune","pluto"] as PlanetType[])){ const dist=shortDistance(target.longitude,planet(chart,outer).longitudeRaw); if(dist<=2) testimonies.push(test(`missing-tight-outer-${outer}`,"context",context.topic,`${target.planetName} está a ${dist.toFixed(2)}° de ${PLANET_NAMES[outer]}. Contato exterior muito estreito pode ser usado apenas como descritor auxiliar de localização, nunca como regência.`,["MA-OPS"],{planet:outer,orb:dist})); }
    }
  }
  if(context.topic==="theft") {
    const obj=role(significators,"stolen_object")??role(significators,"quesited"),sus=role(significators,"theft_suspect");
    if(obj&&sus){ const ev=aspectBetween(chart,sus.planet,obj.planet); testimonies.push(test("theft-past-contact",ev?.separating?"decisive":"warning","theft",ev?.separating?"Há contato separativo suspeito–objeto: testemunho de contato passado compatível com furto, a ser lido com posse/localização.":"Não há contato separativo suficiente entre suspeito e objeto; não acusar com base em aspecto aplicativo ou mera suspeita.",["F-HT"],{aspect:ev})); }
    if(obj){
      for(const pt of CLASSICAL_PLANETS.filter(pt=>pt!==obj.planet)){
        const ev=aspectBetween(chart,obj.planet,pt);
        if(ev?.aspect==="conjunction" && ev.orb<=3){
          testimonies.push(test(`theft-object-contact-candidate-${pt}`,"context","theft",`${obj.planetName} (objeto) está em conjunção corporal estreita (${ev.orb.toFixed(2)}°) com ${PLANET_NAMES[pt]}. Em furto já conhecido, este planeta pode ser candidato contextual ao agente; o motor não o acusa nem lhe inventa casa.`,["F-HT","MA-OPS"],{planet:pt,aspect:ev}));
          const q=role(significators,"querent"),returnContact=q&&q.planet!==pt?aspectBetween(chart,pt,q.planet):undefined;
          testimonies.push(test(`theft-candidate-return-contact-${pt}`,returnContact?.applying&&returnContact.beforeEitherChangesSign?"major":"context","theft",returnContact?`${PLANET_NAMES[pt]} (candidato contextual ao agente) → querente/${q?.planetName}: ${returnContact.aspect}, ${returnContact.applying?"aplicativo":"separativo"}.`:`${PLANET_NAMES[pt]} (candidato contextual ao agente) não forma aspecto ptolomaico com o significador do querente; isto pode ser relevante para uma pergunta de retorno/novo contato.`,["F-HT","MA-OPS"],{planet:pt,aspect:returnContact}));
        }
      }
    }
  }
  if(context.topic==="adoption") {
    const child=role(significators,"baby")??role(significators,"adoptive_child")??role(significators,"quesited");
    if(child) testimonies.push(test("adoption-child-placement","major","adoption",`Criança = ${child.planetName}; está fisicamente na casa ${child.accidental.house}, em ${child.sign}, com modalidade ${modeOf(child.longitude)}. Em perguntas sobre manter/entregar a criança, posição na casa das pessoas que a detêm e fixidez são fatos a sintetizar contextualmente, não um YES/NO lexical.`,["F-HT"],{house:child.accidental.house,sign:child.sign,mode:modeOf(child.longitude),essential:child.essential,accidental:child.accidental}));
  }
  if(context.topic==="lawsuit") {
    const q=role(significators,"querent"),opp=role(significators,"opponent"),judge=role(significators,"judge"),verdict=role(significators,"verdict");
    if(judge){
      testimonies.push(test("lawsuit-judge","context","lawsuit",`Juiz/tribunal = ${judge.planetName}; recepções com as partes podem mostrar inclinação.`,["F-HT"]));
      if(q){ const r=reception(chart,judge.planet,q.planet); receptions.push(r); testimonies.push(test("lawsuit-judge-to-querent",negativeReception(r)?"major":"context","lawsuit",`Juiz → querente: ${r.strongest}/${r.disposition}.`,["F-HT"],{reception:r})); }
      if(opp){ const r=reception(chart,judge.planet,opp.planet); receptions.push(r); testimonies.push(test("lawsuit-judge-to-opponent",positiveReception(r)?"major":"context","lawsuit",`Juiz → oponente: ${r.strongest}/${r.disposition}.`,["F-HT"],{reception:r})); }
    }
    if(verdict){
      testimonies.push(test("lawsuit-verdict","context","lawsuit",`Fim da matéria/veredicto = ${verdict.planetName} (IV).`,["F-HT"]));
      if(q) analysePair(chart,verdict,q,receptions,directPerfections,antiscialContacts,testimonies,"lawsuit-verdict-querent");
      if(opp) analysePair(chart,verdict,opp,receptions,directPerfections,antiscialContacts,testimonies,"lawsuit-verdict-opponent");
    }
  }
  if(context.topic==="competition") {
    if(context.competitionStructure==="incumbent_challenger") {
      const champion=role(significators,"champion"), challenger=role(significators,"challenger");
      if(champion&&challenger){
        const anti=antiscionLongitude(champion.longitude), antiHouse=planetHouse(chart,anti), h10=chart.housesData.house[9], antiOrb=shortDistance(anti,h10);
        testimonies.push(test("competition-incumbent-structure","major","competition","Estrutura de campeão incumbente contra desafiante: campeão=X, desafiante=IV; comparar capacidade acidental, não I/VII genérico.",["M-HORARY-CURRENT","F-HT"]));
        if(antiHouse===10&&antiOrb<=5) testimonies.push(test("competition-champion-antiscion-angular","decisive","competition",`Antíscio do campeão cai dentro da X, a ${antiOrb.toFixed(2)}° da cúspide: forte dignidade acidental a favor do incumbente.`,["M-HORARY-CURRENT"],{antiscion:anti,house:antiHouse,orbToTenth:antiOrb}));
        const antiPlanet=CLASSICAL_PLANETS.filter(x=>x!==champion.planet&&x!==challenger.planet).map(x=>({x,d:shortDistance(anti,planet(chart,x).longitudeRaw)})).sort((x,y)=>x.d-y.d)[0];
        if(antiPlanet&&antiPlanet.d<=1) testimonies.push(test("competition-champion-antiscion-contact","major","competition",`Antíscio do campeão está em contato estreito (${antiPlanet.d.toFixed(2)}°) com ${PLANET_NAMES[antiPlanet.x]}.`,["M-HORARY-CURRENT","F-HT"],{planet:antiPlanet.x,orb:antiPlanet.d}));
      }
    } else if(context.competitionStructure==="tournament_victory") {
      const team=role(significators,"querent"),victory=role(significators,"victory");
      if(team&&victory){
        const tv=aspectBetween(chart,team.planet,victory.planet);
        testimonies.push(test("competition-team-victory-contact",tv?.applying&&tv.beforeEitherChangesSign?"decisive":"major","competition",tv?`Time/L1 e vitória/L10: ${tv.aspect}, ${tv.applying?"aplicativo":"separativo"}.`:`Time/L1 e vitória/L10 não formam aspecto nos signos atuais.`,["M-HORARY-CURRENT","F-HT"],{aspect:tv}));
        const mv=aspectBetween(chart,"moon",victory.planet);
        if(mv?.applying&&mv.beforeEitherChangesSign) testimonies.push(test("competition-moon-to-victory","major","competition",`Lua aplica a L10/vitória por ${mv.aspect}: outro agente chega ao troféu; não é co-significador automático do time apoiado.`,["M-HORARY-CURRENT"],{aspect:mv}));
        const cusp=chart.housesData.house[9];
        const other=CLASSICAL_PLANETS.filter(x=>x!==team.planet&&x!==victory.planet).map(x=>({x,d:shortDistance(planet(chart,x).longitudeRaw,cusp)})).sort((x,y)=>x.d-y.d)[0];
        if(other&&other.d<=3) testimonies.push(test("competition-other-on-victory-cusp","major","competition",`${PLANET_NAMES[other.x]} está a ${other.d.toFixed(2)}° da cúspide X/vitória: testemunho de outro competidor chegando ao prêmio.`,["M-HORARY-CURRENT"],{planet:other.x,orb:other.d}));
      }
    } else {
      testimonies.push(test("competition-head-to-head","context","competition","Competição simétrica usa I/VII e é julgada prioritariamente por dignidade acidental, casas, combustão e demais vantagens concretas; aspecto entre os competidores não é requisito de vitória.",["F-HT"]));
    }
  }
  if(context.topic==="relationship") {
    const q=role(significators,"querent"),other=role(significators,"quesited");
    if(q&&other){
      const qPlanets=unique<PlanetType>([q.planet,"moon",...(context.querentSex?[context.querentSex==="male"?"sun":"venus" as PlanetType]:[])]);
      const otherPlanets=unique<PlanetType>([other.planet,...(context.quesitedSex?[context.quesitedSex==="male"?"sun":"venus" as PlanetType]:[])]);
      for(const ptype of otherPlanets){
        const pp=planet(chart,ptype), voice=voiceQuality(pp.longitudeRaw), next=SIGN_VOICE[(signIndex(pp.longitudeRaw)+(pp.longitudeSpeed>=0?1:11))%12];
        testimonies.push(test(`relationship-voice-${ptype}`,voice==="mute"||voice==="weak"?"major":"context","relationship",`${PLANET_NAMES[ptype]} (lado do quesitado) está em signo de voz ${voice}; próximo signo na direção atual: ${next}.`,["M-HORARY-CURRENT","F-HT"],{voice,nextVoice:next}));
        for(const qp of qPlanets.filter(x=>x!==ptype)){ const ev=aspectBetween(chart,ptype,qp); if(ev) testimonies.push(test(`relationship-contact-${ptype}-${qp}`,ev.applying&&ev.beforeEitherChangesSign?"major":"context","relationship",`${PLANET_NAMES[ptype]} → ${PLANET_NAMES[qp]}: ${ev.aspect}, ${ev.applying?"aplicativo":"separativo"}.`,["M-HORARY-CURRENT","F-HT"],{aspect:ev})); }
      }
      const rOtherMoon=reception(chart,other.planet,"moon"); receptions.push(rOtherMoon); testimonies.push(test("relationship-other-to-moon",negativeReception(rOtherMoon)?"major":"context","relationship",`${other.planetName} → Lua do querente: ${rOtherMoon.strongest}/${rOtherMoon.disposition}.`,["F-HT"],{reception:rOtherMoon}));
      if(context.quesitedSex==="female"){ const rv=reception(chart,"venus",q.planet); receptions.push(rv); testimonies.push(test("relationship-woman-to-querent",negativeReception(rv)?"major":"context","relationship",`Vênus natural da mulher → significador principal do querente: ${rv.strongest}/${rv.disposition}.`,["M-HORARY-CURRENT","F-HT"],{reception:rv})); }
    }
  }
  if(context.topic==="pregnancy") {
    const mother=role(significators,"mother"),child=role(significators,"child"),childbed=role(significators,"childbed"),doctor=role(significators,"doctor_treating_case"),surgery=role(significators,"surgery_marcos_variant");
    if(child) testimonies.push(test("pregnancy-child-condition",child.essential.domicile||child.essential.exaltation?"major":"context","pregnancy",`Bebê/L5 = ${child.planetName}: condição essencial e acidental materializada.`,["M-HORARY-CURRENT","F-HT"],{essential:child.essential,accidental:child.accidental}));
    if(childbed) testimonies.push(test("pregnancy-childbed","context","pregnancy",`Parto/childbed = ${childbed.planetName}, XII da mãe.`,["M-HORARY-CURRENT","F-HT"]));
    if(doctor) testimonies.push(test("pregnancy-doctor","context","pregnancy",`Médico do caso = ${doctor.planetName}, VII da mãe.`,["M-HORARY-CURRENT","F-HT"]));
    if(mother&&surgery){ const ev=aspectBetween(chart,mother.planet,surgery.planet); if(ev) testimonies.push(test("pregnancy-mother-surgery-aspect","major","pregnancy",`Mãe → regente da VI (variante cirúrgica de Marcos): ${ev.aspect}, ${ev.degreesToPerfection?.toFixed(2)}° até perfeição.`,["M-HORARY-CURRENT"],{aspect:ev})); }
    if(child&&childbed){ const ev=aspectBetween(chart,child.planet,childbed.planet); if(ev) testimonies.push(test("pregnancy-child-childbed-aspect","major","pregnancy",`Bebê → childbed: ${ev.aspect}, ${ev.degreesToPerfection?.toFixed(2)}° até perfeição.`,["M-HORARY-CURRENT","F-HT"],{aspect:ev})); }
  }
  if(["health","illness"].includes(context.topic)) {
    const patient=role(significators,"patient"),organ=role(significators,"organ");
    const target=organ??patient;
    if(target){
      const signQ=SIGN_QUALITIES[signIndex(target.longitude)], planetQ=PLANET_QUALITIES[target.planet];
      if(planetQ&&planetQ!==signQ) testimonies.push(test("medical-nature-mismatch","major","health",`${target.planetName} (${target.role}) tem natureza ${planetQ} e está em ambiente ${signQ}: incompatibilidade humoral relevante.`,["F-HT"],{planetQuality:planetQ,signQuality:signQ}));
      if(target.accidental.combust) testimonies.push(test("medical-combustion-cause","major","health",`${target.planetName} está combusto: o Sol é afligente direto e deve entrar na cadeia causal, não apenas como pontuação de fraqueza.`,["M-HORARY-CURRENT","F-HT"],{sun:planet(chart,"sun").longitudeRaw}));
      const rulerName=target.essential.dignityRulers.domicile, disposer=NAME_TO_PLANET[rulerName];
      if(disposer&&disposer!==target.planet) testimonies.push(test("medical-sign-dispositor-cause","major","health",`Dispositor do signo de ${target.planetName}: ${PLANET_NAMES[disposer]}; candidato causal quando a natureza do signo desequilibra o paciente/órgão.`,["M-HORARY-CURRENT","F-HT"],{dispositor:disposer}));
      if(signQ==="hot_dry"&&(target.accidental.combust||disposer==="mars")) testimonies.push(test("medical-hot-dry-excess","major","health","A cadeia paciente/órgão aponta calor + secura; no vocabulário humoral do caso, excesso colérico é hipótese astrológica interna do método, não diagnóstico médico clínico.",["M-HORARY-CURRENT","F-HT"]));
    }
  }
  if(context.topic==="death") {
    const subject=role(significators,"death_subject"),rad=role(significators,"radical_death"),turned=role(significators,"turned_death");
    if(subject&&rad) analysePair(chart,subject,rad,receptions,directPerfections,antiscialContacts,testimonies,"death-radical");
    if(subject&&turned) analysePair(chart,subject,turned,receptions,directPerfections,antiscialContacts,testimonies,"death-turned");
    testimonies.push(test("death-body-contact-gate","warning","death","Morte não é inferida por acumulação de aflições nem por antíscio isolado; exige contato/perfeição pertinente com VIII radical/derivada e leitura da sequência.",["M-HORARY-CURRENT","F-HT","MA-OPS"]));
  }
  if(context.topic==="should_i"||context.topic==="career_choice") {
    for(const alt of context.alternatives??[]){
      const sAlt=role(significators,`alternative:${alt.id}`); if(sAlt) testimonies.push(test(`choice-alt-${alt.id}`,"context",context.topic,`${alt.label}: ${sAlt.planetName}; condição essencial/acidental registrada.`,["F-HT"],{essential:sAlt.essential,accidental:sAlt.accidental}));
      const profit=role(significators,`alternative:${alt.id}:profit`); if(profit) testimonies.push(test(`choice-alt-${alt.id}-profit`,"context",context.topic,`Retorno de ${alt.label}: ${profit.planetName}; condição essencial/acidental registrada.`,["F-HT"],{essential:profit.essential,accidental:profit.accidental}));
    }
    const qm=role(significators,"querent_money");
    const business=(context.alternatives??[]).find(x=>x.profitHouse)?.id;
    if(qm&&business){ const b=role(significators,`alternative:${business}`); if(b){ analysePair(chart,b,qm,receptions,directPerfections,antiscialContacts,testimonies,"choice-business-money"); const m=analyseMediation(chart,b.planet,qm.planet,aspectBetween(chart,b.planet,qm.planet)); for(const x of m.filter(x=>x.kind==="translation"&&x.mediator==="moon")) testimonies.push(test("choice-business-money-translation","major",context.topic,"Lua traduz luz entre a alternativa de negócio e o dinheiro do querente; recepções/condições mostram se a ligação beneficia ou prejudica o bolso.",["M-HORARY-CURRENT","F-HT"],x.data)); } }
  }
  if(context.eventTrigger?.kind==="sign_change") {
    const triggerRole=context.eventTrigger.role??"quesited"; const sig=role(significators,triggerRole);
    const ptype=context.eventTrigger.planet??sig?.planet??context.naturalServicePlanet;
    if(ptype){ const pp=planet(chart,ptype); const deg=pp.longitudeSpeed>=0?30-degreeInSign(pp.longitudeRaw):degreeInSign(pp.longitudeRaw); const from=voiceQuality(pp.longitudeRaw),to=SIGN_VOICE[(signIndex(pp.longitudeRaw)+(pp.longitudeSpeed>=0?1:11))%12]; testimonies.push(test("custom-sign-change-trigger","decisive","event_trigger",`${PLANET_NAMES[ptype]} está a ${deg.toFixed(2)}° da mudança de signo; voz ${from} → ${to}.${context.eventTrigger.interpretation?` ${context.eventTrigger.interpretation}`:""}`,["M-HORARY-CURRENT","F-HT"],{planet:ptype,degreesToSignChange:deg,fromVoice:from,toVoice:to})); }
  }
  if(context.eventTrigger?.kind==="cusp_entry") {
    const triggerRole=context.eventTrigger.role??"quesited"; const sig=role(significators,triggerRole);
    const ptype=context.eventTrigger.planet??sig?.planet??context.naturalServicePlanet; const house=context.eventTrigger.house;
    if(ptype&&house){ const entry=cuspEntryDistance(chart,ptype,house); testimonies.push(test("custom-cusp-entry-trigger",entry.possible?"decisive":"warning","event_trigger",`${PLANET_NAMES[ptype]} está a ${entry.degrees.toFixed(2)}° de cruzar a cúspide da casa ${house}.${context.eventTrigger.interpretation?` ${context.eventTrigger.interpretation}`:""}`,["F-HT","MA-OPS"],{planet:ptype,house,degreesToCusp:entry.degrees,possible:entry.possible})); }
  }
  if(context.eventTrigger?.kind==="cusp_contact") {
    const triggerRole=context.eventTrigger.role??"quesited"; const sig=role(significators,triggerRole);
    const ptype=context.eventTrigger.planet??sig?.planet??context.naturalServicePlanet; const house=context.eventTrigger.house;
    if(ptype&&house){ const cusp=chart.housesData.house[(house-1)%12]; const deg=shortDistance(planet(chart,ptype).longitudeRaw,cusp); testimonies.push(test("custom-cusp-contact-trigger","decisive","event_trigger",`${PLANET_NAMES[ptype]} está a ${deg.toFixed(2)}° de contato com a cúspide da casa ${house}.${context.eventTrigger.interpretation?` ${context.eventTrigger.interpretation}`:""}`,["F-HT","MA-OPS"],{planet:ptype,house,degreesToCusp:deg})); }
  }
  if(context.topic==="hidden_enemy") testimonies.push(test("hidden-enemy-safety","warning","hidden_enemy","XII e suas relações podem descrever ação oculta; o motor não converte isso em acusação factual contra pessoa real.",["MA-OPS","F-HT"]));
  if(["travel","travel_profit","study","exam","knowledge","course","weather","adoption","career_choice","should_i","public_event"].includes(context.topic)) testimonies.push(test(`topic-${context.topic}-specific`,`context`,context.topic,`Roteamento tópico específico ativo; o juízo deve usar as casas e papéis materializados, não o fallback L1×Lquesitado quando a pergunta for de estado/comparação/localização.`,["F-HT","MA-OPS"]));

  if(context.topic==="surgery") testimonies.push(test("surgery-mars","context","surgery","Marte é significador natural auxiliar de cirurgia; não substitui paciente/doença/médico/tratamento.",["M-HORARY-CURRENT","F-HT"],{mars:planet(chart,"mars").longitudeRaw}));
  if(context.topic==="psychic_attack") testimonies.push(test("psychic-safeguard","warning","safeguard","Qualquer saída deste módulo é descrição de gramática astrológica histórica e não confirmação de ataque sobrenatural.",["MA-OPS"]));
  if(context.topic==="dream_meaning" && (context.dreamCharacters?.length??0)===0) testimonies.push(test("dream-no-characters","warning","dream_meaning","Narrativa foi recebida, mas nenhum personagem foi mapeado a uma relação/casa; a IA não deve inventar identidades simbólicas.",["MA-OPS"]));

  const unresolved=[...topicAnalysis.unresolvedContext];
  const questionBirthReady=context.questionUnderstood===true&&context.questionAccepted===true;
  if(!questionBirthReady) considerations.push(test("question-birth-unconfirmed","warning","question_birth","Pergunta ainda não marcada como compreendida e aceita pelo astrólogo; o dossiê pode ser calculado para auditoria, mas canJudge permanece false.",["M-HORARY-CURRENT","G-SUPP","MA-OPS"]));
  let answer:HoraryDossier["judgement"]["answer"]="UNKNOWN", summary="Dossiê técnico gerado; a camada interpretativa deve julgar os testemunhos sem score totalizador.";
  const reasons:string[]=[];
  let timing:string|undefined;
  if(unresolved.length){ summary=`Contexto insuficiente para juízo tópico: ${unresolved.join(", ")}.`; reasons.push("O motor não inventa casas ou relações faltantes."); }
  else if(context.topic==="job_get"){
    const rivalWins=testimonies.some(t=>t.id==="job-rival-before-querent");
    const voc=testimonies.some(t=>t.id==="job-get-voc");
    if(rivalWins){ answer="NO"; reasons.push("L10 chega ao rival antes do querente."); }
    else if(primaryAspect?.applying&&primaryAspect.beforeEitherChangesSign){ answer=primaryAspect.aspect==="opposition"?"MIXED":"YES"; reasons.push("Há perfeição futura L1–L10 antes de mudança de signo."); if(voc) reasons.push("Lua VOC pesa contra a mudança, mas existe perfeição direta concorrente."); timing=timingLabel(primaryAspect.degreesToPerfection,a!,context); }
    else { answer="UNKNOWN"; reasons.push("Não há perfeição direta L1–L10 suficiente para afirmar contratação."); if(voc) reasons.push("Lua VOC reforça inércia/ausência de mudança."); }
  }
  else if(context.topic==="job_keep"){
    const change=testimonies.some(t=>t.id.startsWith("job-keep-sign-exit")); const stay=testimonies.some(t=>t.id.startsWith("job-keep-fixed")||t.id==="job-keep-voc");
    answer=change&&stay?"MIXED":change?"NO":stay?"YES":"UNKNOWN";
    reasons.push(change?"Há testemunho explícito de mudança iminente por saída de signo.":"Não há saída de signo próxima materializada para L1/L10.");
    if(stay) reasons.push("Há testemunho de fixidez/VOC favorecendo manutenção do estado atual.");
  } else if(context.topic==="competition") {
    if(context.competitionStructure==="incumbent_challenger") {
      const champion=role(significators,"champion"), challenger=role(significators,"challenger");
      const antiAngular=testimonies.some(t=>t.id==="competition-champion-antiscion-angular");
      if(champion?.accidental.combust&&!challenger?.accidental.combust){ answer="NO"; reasons.push("O campeão está combusto e o desafiante não: aflição decisiva contra o incumbente."); }
      else if(challenger?.accidental.combust&&!champion?.accidental.combust){ answer="YES"; reasons.push("O desafiante está combusto: vantagem decisiva do incumbente."); }
      else if(antiAngular){ answer="YES"; reasons.push("O antíscio do campeão torna-se angular na X e inclina o confronto a favor do incumbente."); }
      else { answer="UNKNOWN"; reasons.push("Estrutura incumbente/desafiante resolvida, mas a hierarquia de dignidades acidentais não produziu vantagem decisiva automática."); }
    } else if(context.competitionStructure==="tournament_victory") {
      const team=role(significators,"querent"),victory=role(significators,"victory");
      const tv=team&&victory?aspectBetween(chart,team.planet,victory.planet):undefined;
      if(tv?.applying&&tv.beforeEitherChangesSign){ answer="YES"; reasons.push("O time apoiado/L1 aperfeiçoa contato com L10/vitória."); timing=timingLabel(tv.degreesToPerfection,team!,context); }
      else if(testimonies.some(t=>t.id==="competition-moon-to-victory"||t.id==="competition-other-on-victory-cusp")){ answer="NO"; reasons.push("L1 não alcança L10 e há testemunho de outro agente chegando à vitória/troféu."); }
      else { answer="NO"; reasons.push("Nesta pergunta de conquistar o troféu, não há ligação entre L1 e L10/vitória."); }
    } else {
      const q=role(significators,"querent"),opp=role(significators,"opponent");
      if(q&&opp){
        if(q.accidental.combust!==opp.accidental.combust){ answer=q.accidental.combust?"NO":"YES"; reasons.push("Combustão distingue decisivamente os competidores."); }
        else if(q.accidental.angularity!==opp.accidental.angularity){ answer=q.accidental.angularity==="angular"?"YES":opp.accidental.angularity==="angular"?"NO":"UNKNOWN"; reasons.push("A vantagem automática encontrada é de dignidade acidental/angulação, não de aspecto entre os competidores."); }
        else { answer="UNKNOWN"; reasons.push("Competição simétrica requer ponderação de dignidades acidentais sem score único; nenhum discriminante decisivo automático foi encontrado."); }
      }
    }
  } else if(context.topic==="lawsuit") {
    const q=role(significators,"querent"),opp=role(significators,"opponent"),verdict=role(significators,"verdict");
    const qv=q&&verdict?aspectBetween(chart,verdict.planet,q.planet):undefined, ov=opp&&verdict?aspectBetween(chart,verdict.planet,opp.planet):undefined;
    const tq=qv?.applying&&qv.beforeEitherChangesSign?qv.estimatedDaysToPerfection:undefined, to=ov?.applying&&ov.beforeEitherChangesSign?ov.estimatedDaysToPerfection:undefined;
    if(tq!==undefined&&(to===undefined||tq<to)){ answer="YES"; reasons.push("Provisoriamente, L4/veredicto alcança o querente antes do oponente; a cronologia ainda pode proibir este contato."); timing=timingLabel(qv?.degreesToPerfection,q!,context); }
    else if(to!==undefined&&(tq===undefined||to<tq)){ answer="NO"; reasons.push("L4/veredicto alcança o oponente antes do querente."); }
    else { answer="UNKNOWN"; reasons.push("O veredicto não se liga de modo simples a uma das partes; juiz, recepções e cronologia precisam decidir."); }
    if(testimonies.some(t=>t.id==="lawsuit-judge-to-querent"&&t.severity==="major")&&testimonies.some(t=>t.id==="lawsuit-judge-to-opponent"&&t.severity==="major")) reasons.push("O juiz recebe negativamente o querente e positivamente o oponente: forte advertência contra a expectativa do querente.");
  } else if(context.topic==="relationship" && /talk|communicat|falar|convers|contato/.test(context.concreteQuestion.toLowerCase())) {
    const other=role(significators,"quesited"), q=role(significators,"querent");
    const others=unique<PlanetType>([...(other?[other.planet]:[]),...(context.quesitedSex?[context.quesitedSex==="male"?"sun":"venus" as PlanetType]:[])]);
    const qs=unique<PlanetType>([...(q?[q.planet]:[]),"moon"]);
    const applies=others.some(x=>qs.some(y=>x!==y&&!!(aspectBetween(chart,x,y)?.applying&&aspectBetween(chart,x,y)?.beforeEitherChangesSign)));
    const silent=others.every(x=>{const pp=planet(chart,x),v=voiceQuality(pp.longitudeRaw),nv=SIGN_VOICE[(signIndex(pp.longitudeRaw)+(pp.longitudeSpeed>=0?1:11))%12]; return (v==="mute"||v==="weak")&&(nv==="mute"||nv==="weak");});
    if(!applies&&silent){ answer="NO"; reasons.push("Os significadores do quesitado não aperfeiçoam contato com os do querente e permanecem em signos de voz muda/fraca: testemunho específico contra retomada da comunicação."); }
    else { answer="DESCRIPTIVE_ONLY"; reasons.push("Comunicação e importância afetiva foram separadas; os contatos/relações precisam ser lidos em conjunto."); }
  } else if(context.topic==="pregnancy") {
    answer="DESCRIPTIVE_ONLY";
    const child=role(significators,"child");
    if(child?.essential.domicile||child?.essential.exaltation) reasons.push("O significador do bebê tem forte dignidade essencial, testemunho favorável ao seu estado no método da fonte.");
    const arcs=testimonies.filter(t=>t.id==="pregnancy-mother-surgery-aspect"||t.id==="pregnancy-child-childbed-aspect").map(t=>(t.data?.aspect as any)?.degreesToPerfection).filter((x):x is number=>typeof x==="number");
    if(arcs.length){ const deg=Math.min(...arcs); timing=timingLabel(deg,motherOr(significators),context); reasons.push("Aspectos ligados ao parto convergem em arco curto; timing é tratado como subpergunta, não como prova de dano ao bebê."); }
  } else if(context.topic==="death") {
    answer="UNKNOWN"; reasons.push("Morte exige cronologia do contato da pessoa com VIII radical/derivada; o snapshot não transforma uma aplicação potencial em sentença antes de testar proibição/refranação.");
  } else if(context.topic==="lottery") {
    const w=role(significators,"windfall");
    const exceptional=!!w&&(w.essential.domicile||w.essential.exaltation)&&w.accidental.angularity!=="cadent"&&!w.accidental.combust;
    const arrival=testimonies.some(t=>t.id==="lottery-to-querent-application"||t.id==="lottery-to-pocket-application");
    answer=exceptional&&arrival?"YES":exceptional?"MIXED":"NO";
    reasons.push(exceptional?"L11/ganho do alto tem força excepcional suficiente para manter a hipótese de prêmio.":"L11 não está excepcionalmente forte; para jackpot, o método não autoriza um YES fraco.");
    if(arrival) reasons.push("Há contato de chegada entre o ganho e querente/bolso.");
  } else if(context.topic==="government_grant") {
    const change=testimonies.some(t=>t.id==="grant-recipient-imminent-change");
    const arrival=testimonies.some(t=>t.id==="grant-recipient-gift-application");
    answer=arrival||change?"YES":"UNKNOWN";
    reasons.push(arrival?"Há ligação entre o beneficiário e o dinheiro/favor do governo.":change?"Mudança imediata e forte na condição do beneficiário pode decidir a concessão mesmo sem depender de um aspecto monetário.":"Não há testemunho automático suficiente para afirmar a concessão.");
  } else if(context.topic==="election") {
    const decisive=testimonies.filter(t=>t.id.startsWith("election-moon-")&&t.id!=="election-moon-electorate"&&t.severity==="decisive");
    if(decisive.length===1){ answer="YES"; reasons.push(`A Lua/eleitorado aplica ao candidato focal: ${decisive[0].statement}`); } else { answer="DESCRIPTIVE_ONLY"; reasons.push("Casas dos candidatos estão resolvidas, mas o resultado deve comparar o destino da Lua/eleitorado e a condição dos competidores sem presumir um candidato focal universal."); }
  } else if(context.topic==="delivery") {
    const ev=testimonies.find(t=>t.id==="delivery-moon-package"&&t.severity==="decisive");
    answer=ev?"YES":"UNKNOWN";
    const asp=(ev?.data?.aspect as any); if(ev&&asp?.degreesToPerfection!==undefined&&a) timing=timingLabel(asp.degreesToPerfection,a,context);
    reasons.push(ev?"A Lua aperfeiçoa contato com o pacote antes de mudança de signo, fornecendo chegada/timing.":"A estrutura de posse está resolvida, mas não há contato de chegada suficiente no snapshot.");
  } else if(context.topic==="authenticity") {
    const t=testimonies.find(x=>x.id==="authenticity-product-condition"), bad=t?.data?.bad===true,strong=t?.data?.strong===true, houseAfflicted=testimonies.some(x=>x.id==="authenticity-house-affliction");
    answer=(bad||houseAfflicted)?"NO":strong?"YES":"MIXED";
    reasons.push((bad||houseAfflicted)?"O significador/casa do produto está afligido: o produto não corresponde bem ao que deveria ser.":strong?"O significador do produto tem forte dignidade essencial: corresponde à própria natureza.":"A condição do produto é intermediária; não há base para autenticidade absoluta.");
  } else if(context.topic==="kidnapping") {
    const deathContacts=testimonies.filter(t=>t.id.startsWith("kidnap-")&&t.id.endsWith("-application"));
    answer=deathContacts.length?"UNKNOWN":"YES";
    reasons.push(deathContacts.length?"Há aplicação potencial à morte e a cronologia deve testar perfeição/interposição antes de falar em sobrevivência.":"Não há aplicação inicial da pessoa sequestrada à VIII radical/derivada materializada; no método do caso-fonte, isso favorece sobrevivência e, portanto, possibilidade de soltura.");
    if(!deathContacts.length&&context.eventTrigger?.kind==="sign_change"){
      const tr=testimonies.find(t=>t.id==="custom-sign-change-trigger"),deg=tr?.data?.degreesToSignChange;
      if(typeof deg==="number") { timing=`${deg.toFixed(2)} unidade(s) simbólica(s) até a mudança que marca a soltura.${context.timingUnits?.length?` Escala contextual plausível: ${context.timingUnits.join(" / ")}.`:""}`; reasons.push("Sobrevivência foi resolvida primeiro; a mudança de signo explicitamente contextualizada pode então fornecer o timing da soltura, sem confundir deterioração de dignidade posterior com o evento já encerrado."); }
    }
  } else if(context.topic==="communication") {
    answer="DESCRIPTIVE_ONLY"; reasons.push("Comunicação exige distinguir a função comunicativa, o agente/prestador e o evento concreto; voz do signo e mudança de estado são materializadas sem confundir qualidade com ocorrência.");
  } else if(context.eventAssumed&&context.eventTrigger?.kind==="sign_change") {
    const tr=testimonies.find(t=>t.id==="custom-sign-change-trigger"); const deg=tr?.data?.degreesToSignChange;
    answer="YES"; reasons.push("O evento é pressuposto pela própria pergunta; a mudança de signo do significador fornecido funciona como marcador do quando, não como prova independente do se.");
    if(typeof deg==="number") timing=`${deg.toFixed(2)} unidade(s) simbólica(s) até a mudança de signo.${context.timingUnits?.length?` Escala contextual plausível: ${context.timingUnits.join(" / ")}.`:""}`;
  } else if(context.eventAssumed&&context.eventTrigger?.kind==="cusp_entry") {
    const tr=testimonies.find(t=>t.id==="custom-cusp-entry-trigger"); const deg=tr?.data?.degreesToCusp;
    answer="YES"; reasons.push("O evento é pressuposto pela própria pergunta; a entrada do significador na cúspide indicada funciona como marcador do quando.");
    if(typeof deg==="number") timing=`${deg.toFixed(2)} unidade(s) simbólica(s) até a cúspide.${context.timingUnits?.length?` Escala contextual plausível: ${context.timingUnits.join(" / ")}.`:""}`;
  } else if(context.eventAssumed&&context.eventTrigger?.kind==="cusp_contact") {
    const tr=testimonies.find(t=>t.id==="custom-cusp-contact-trigger"); const deg=tr?.data?.degreesToCusp;
    answer="YES"; reasons.push("O evento é pressuposto pela própria pergunta; a distância do significador à cúspide indicada fornece o marcador simbólico do quando.");
    if(typeof deg==="number") timing=`${deg.toFixed(2)} unidade(s) simbólica(s) até o contato com a cúspide.${context.timingUnits?.length?` Escala contextual plausível: ${context.timingUnits.join(" / ")}.`:""}`;
  } else if(["job_quality","work_relationship","dream_meaning","self_undoing","tax","health","illness","doctor","treatment","surgery","property","lost_object","missing_animal","missing_person","theft","weather","public_event","career_choice","should_i","service_change"].includes(context.topic)){
    answer="DESCRIPTIVE_ONLY"; reasons.push("Este tópico exige descrição de estado/relações ou cadeia específica, não um YES/NO genérico.");
    if((context.topic==="should_i"||context.topic==="career_choice")&&(context.alternatives?.length??0)>=2){
      const ranked=(context.alternatives??[]).map(alt=>({alt,s:role(significators,`alternative:${alt.id}`),profit:role(significators,`alternative:${alt.id}:profit`)}));
      const good=ranked.find(x=>x.s&&(x.s.essential.domicile||x.s.essential.exaltation)&&!(x.s.essential.detriment||x.s.essential.fall));
      const bad=ranked.find(x=>x.s&&(x.s.essential.detriment||x.s.essential.fall)&&(x.profit?(x.profit.essential.detriment||x.profit.essential.fall):true));
      if(good&&bad&&good.alt.id!==bad.alt.id){ testimonies.push(test("choice-preferred-alternative","major",context.topic,`Comparação automática favorece “${good.alt.label}” sobre “${bad.alt.label}”: a primeira tem condição forte, enquanto a segunda e/ou seu retorno estão debilitados.`,["F-HT"],{preferred:good.alt.id,against:bad.alt.id})); reasons.push(`Entre as alternativas materializadas, ${good.alt.label} é tecnicamente favorecida sobre ${bad.alt.label}.`); }
    }
  } else if(a&&b){
    if(primaryAspect?.applying&&primaryAspect.beforeEitherChangesSign){
      const hardBlock=mediation.some(m=>m.kind==="prohibition_candidate"&&m.confidence==="high") || mediation.some(m=>m.kind==="sign_change_obstruction");
      answer=hardBlock?"UNKNOWN":"YES"; reasons.push("Há perfeição direta futura entre os significadores principais antes da mudança de signo.");
      if(primaryAspect.aspect==="opposition") { answer="MIXED"; reasons.push("A oposição aperfeiçoa contato com dificuldade/custo/separação conforme o tópico."); }
      if(negativeReception(primaryR1)||negativeReception(primaryR2)) { answer="MIXED"; reasons.push("Recepção negativa modifica fortemente qualidade/intenção do encontro."); }
      timing=timingLabel(primaryAspect.degreesToPerfection,a,context);
    } else if(mediation.some(m=>m.kind==="translation"||m.kind==="collection")){
      answer="YES"; reasons.push("Não há perfeição direta simples, mas existe tradução/coleta de luz materializada como via de perfeição.");
    } else {
      reasons.push("Não há perfeição direta suficiente nem mediação forte materializada no núcleo automático.");
      answer="UNKNOWN";
    }
  }

  // Default da situação: ausência de novidade não significa automaticamente NO.
  if(context.currentDefault && answer==="UNKNOWN") reasons.push(`Default informado da situação: ${context.currentDefault}. A ausência de testemunho novo deve ser lida contra esse curso natural, não como “não” automático.`);

  const fixed=(chart.fixedStarMatches??[]).filter(x=>x.isRelevant&&x.orb<=Math.min(x.maxOrb??2,2)).slice(0,20).map(x=>({pointName:x.pointName,starName:x.starName,orb:x.orb,descriptor:x.descriptor}));
  const outers=(['uranus','neptune','pluto'] as PlanetType[]).map(x=>({name:PLANET_NAMES[x],longitude:planet(chart,x).longitudeRaw,note:"Auxiliar apenas em contato muito estreito; nunca regente de signo/casa no HORARY_ONLY."}));
  const nodes=(['northNode','southNode'] as PlanetType[]).map(x=>({name:PLANET_NAMES[x],longitude:planet(chart,x).longitudeRaw}));

  return {
    module:"western/horary", methodology:"Marcos+Frawley", question:context,
    chartMetadata:{houseSystem:chart.housesData.houseSystem??"Regiomontanus",zodiac:chart.calculationMetadata?.zodiac??"Tropical",timezone:chart.calculationMetadata?.timezone,utcIso:chart.calculationMetadata?.utcIso,location:chart.birthDate.coordinates.displayName??chart.birthDate.coordinates.name},
    topicAnalysis,ontology,decisionPlan,coverage,houseAtlas:HORARY_HOUSE_ATLAS.map(h=>({...h,meanings:h.meanings.map(m=>({...m,sourceIds:[...m.sourceIds]})),sourceIds:[...h.sourceIds]})),neutralSky:chart.planets.map(p=>({planet:p.type,name:PLANET_NAMES[p.type],longitude:p.longitudeRaw,speed:p.longitudeSpeed,retrograde:p.isRetrograde,house:planetHouse(chart,p.longitudeRaw),sign:p.sign||String(signIndex(p.longitudeRaw)+1),degreeInSign:degreeInSign(p.longitudeRaw)})),significators,receptions,directPerfections,antiscialContacts,mediation,lunarSequence:lunar,moonVoidOfCourse:moonVOC,testimonies,considerations,
    auxiliary:{nodes,fixedStars:fixed,outerPlanets:outers,partsPolicy:"Partes árabes são auxiliares e não são usadas como gate automático; só entram quando o tópico/fonte as exige."},
    judgement:{answer,canJudge:unresolved.length===0&&questionBirthReady,summary,reasons:unique(reasons),timing},provenance:HORARY_SOURCES,
    safeguards:[
      "HORARY_ONLY: não importar promessa natal, temperamento natal, sinastria ou regras eletivas.",
      "SEMÂNTICA ABERTA: o núcleo não adivinha o tema de texto livre; IA/UI/astrólogo deve decompor a situação em papéis e relações de casa, que o compilador resolve recursivamente.",
      "TURNING HOUSES: derivar X de Y somente quando a relação realmente pertence a Y; não virar instituições/objetos inutilmente só porque a frase usa possessivo.",
      "AMBIGUIDADE: se houver mais de uma leitura de casa plausível e não resolvida, canJudge permanece false em vez de escolher silenciosamente.",
      "Regentes de casas: somente sete planetas tradicionais.",
      "Recepção descreve disposição/valoração; não prova ocorrência sem contato pertinente.",
      "Dignidade essencial e capacidade acidental ficam separadas; não há score único de força.",
      "Considerações antes do julgamento são avisos/contexto, não bloqueadores mecânicos de radicalidade.",
      "Tradução/coleta são classificadas por sequência cinemática; proibição é marcada conservadoramente quando a natureza completa ainda exige leitura contextual.",
      "Refranação por estação/reversão futura só pode ser certificada quando chronology efemérica for anexada; snapshot isolado não basta.",
      "Timing só é produzido depois de testemunho de ocorrência e permanece dependente da escala concreta da pergunta.",
    ]
  };
}

