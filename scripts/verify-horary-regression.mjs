import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'.audit','horary-runtime');
fs.rmSync(runtime,{recursive:true,force:true});
execFileSync('tsc',['-p',path.join(root,'.audit','tsconfig-horary-runtime.json')],{stdio:'inherit'});
fs.mkdirSync(path.join(runtime,'node_modules','@'),{recursive:true});
for(const p of ['app','interfaces']){const target=path.join(runtime,'node_modules','@',p);try{fs.unlinkSync(target)}catch{} fs.symlinkSync(path.join('..','..','src',p),target,'dir');}
const h=await import(path.join(runtime,'src','traditions','western','horary','index.js'));

const names={sun:'Sol',moon:'Lua',mercury:'Mercúrio',venus:'Vênus',mars:'Marte',jupiter:'Júpiter',saturn:'Saturno',uranus:'Urano',neptune:'Netuno',pluto:'Plutão',northNode:'Nodo Norte',southNode:'Nodo Sul'};
function P(type,lon,speed){return {name:names[type],type,id:0,longitude:lon,longitudeRaw:lon,longitudeSpeed:speed,sign:'',antiscion:0,antiscionRaw:0,isRetrograde:speed<0};}
function chart(overrides={},houseStart=0){
 const base={sun:[200,.9856],moon:[100,13.17],mercury:[150,1.38],venus:[40,1.2],mars:[10,.52],jupiter:[250,.08],saturn:[300,.03],uranus:[50,.01],neptune:[350,.006],pluto:[305,.004],northNode:[20,-.05],southNode:[200,-.05]};
 for(const [k,v] of Object.entries(overrides)) base[k]=v;
 const houses=Array.from({length:12},(_,i)=>(houseStart+i*30)%360);
 return {planets:Object.entries(base).map(([k,[lon,sp]])=>P(k,lon,sp)),housesData:{house:houses,housesWithSigns:undefined,ascendant:houseStart,mc:(houseStart+90)%360,armc:0,vertex:0,equatorialAscendant:0,kochCoAscendant:0,munkaseyCoAscendant:0,munkaseyPolarAscendant:0,houseSystem:'Regiomontanus',houseSystemCode:'R'},birthDate:{day:1,month:1,year:2026,time:'12:00',coordinates:{latitude:0,longitude:0,name:'Test',timezone:'UTC'}},fixedStars:[]};
}

// 1) Tradução de luz: Lua separa de Saturno e aplica a Marte, sendo mais rápida.
{
 const c=chart({saturn:[0,.03],moon:[10,13],mars:[20,.5]});
 const m=h.analyseMediation(c,'saturn','mars',h.aspectBetween(c,'saturn','mars'));
 assert(m.some(x=>x.kind==='translation'&&x.mediator==='moon'),'translation not detected');
}
// 2) Coleta: Vênus e Marte aplicam a Saturno mais lento.
{
 const c=chart({venus:[0,1.2],mars:[4,.5],saturn:[10,.03]});
 const m=h.analyseMediation(c,'venus','mars',h.aspectBetween(c,'venus','mars'));
 assert(m.some(x=>x.kind==='collection'&&x.mediator==='saturn'),'collection not detected');
}
// 3) Proibição candidata antes da perfeição principal.
{
 const c=chart({venus:[0,1.2],saturn:[10,.03],mercury:[4,.2]});
 const primary=h.aspectBetween(c,'venus','saturn');
 assert(primary?.applying,'primary must apply');
 const m=h.analyseMediation(c,'venus','saturn',primary);
 assert(m.some(x=>x.kind==='prohibition_candidate'&&x.mediator==='mercury'),'prohibition candidate not detected');
}
// 4) Roteamento de prisão usa significador da PESSOA e XII derivada, não o regente da prisão como pessoa.
{
 const a=h.analyseQuestion({topic:'prison',concreteQuestion:'Ele será preso?',prisonState:'free',subjectHouse:7});
 assert(a.houses.some(x=>x.role==='prison_subject'&&x.radicalHouse===7));
 assert(a.houses.some(x=>x.role==='derived_prison'&&x.radicalHouse===6));
 assert.deepEqual(a.primaryRoles,['prison_subject','quesited']);
}
// 5) Herança específica usa 2ª da pessoa-fonte e materializa L2 do querente.
{
 const a=h.analyseQuestion({topic:'inheritance',concreteQuestion:'Receberei?',sourcePersonHouse:4});
 assert(a.houses.some(x=>x.role==='legacy_money'&&x.radicalHouse===5));
 assert(a.houses.some(x=>x.role==='querent_money'&&x.radicalHouse===2));
}
// 6) Job keep NÃO depende de aspecto: fixidez gera testemunho de manutenção.
{
 const d=h.evaluateHorary({chart:chart({},30),context:{topic:'job_keep',concreteQuestion:'Vou manter este emprego?',currentDefault:'Continuo empregado.'}});
 assert(d.testimonies.some(x=>x.subject==='job_keep'&&x.id.includes('fixed')),'job keep fixity missing');
 assert.notEqual(d.judgement.answer,'DESCRIPTIVE_ONLY');
}
// 7) Tax materializa L2/L10/L11.
{
 const d=h.evaluateHorary({chart:chart(),context:{topic:'tax',concreteQuestion:'Quanto/como ficará este imposto?'}});
 for(const r of ['querent_money','government','government_treasury']) assert(d.significators.some(x=>x.role===r),`tax role ${r} missing`);
 assert.equal(d.judgement.answer,'DESCRIPTIVE_ONLY');
}
// 8) Job get materializa salário e rival separadamente do L10.
{
 const a=h.analyseQuestion({topic:'job_get',concreteQuestion:'Vou conseguir a vaga?'});
 assert(a.houses.some(x=>x.role==='wages'&&x.radicalHouse===11));
 assert(a.houses.some(x=>x.role==='job_rival'&&x.radicalHouse===7));
}
// 9) Self-undoing mantém XII específica e julgamento descritivo.
{
 const d=h.evaluateHorary({chart:chart(),context:{topic:'self_undoing',concreteQuestion:'Este hábito está me prejudicando?'}});
 assert(d.testimonies.some(x=>x.id==='self-undoing-reception'));
 assert.equal(d.judgement.answer,'DESCRIPTIVE_ONLY');
}
console.log('HORARY_REGRESSION_OK cases=9 mechanics=translation,collection,prohibition routing=prison,inheritance,job_get,job_keep,tax,self_undoing');
// 10) Sem gate de orbe: planetas em signos que se contemplam podem aplicar mesmo longe do exato.
{
 const c=chart({venus:[1,1.2],mars:[118,.1]}); // Aries/Cancer square, 3 graus de erro? make far enough below
 const e=h.aspectBetween(c,'venus','mars'); assert(e,'aspect by signs missing'); assert.equal(e.aspect,'square');
}
// 11) Signos adjacentes não fabricam conjunção por proximidade física.
{
 const c=chart({moon:[29,13],mars:[31,.5]}); assert.equal(h.aspectBetween(c,'moon','mars'),undefined);
}
// 12) Combustão exige mesmo signo.
{
 const c=chart({sun:[29,.98],venus:[31,1.2]}); const s=h.significator(c,'x',2,[]); // role planet depends cusp; test helper may not give Venus
 const ac=h.accidentalCondition(c,'venus'); assert.equal(ac.combust,false); assert.equal(ac.underSunbeams,false);
}
// 13) Bet é financeiro: H2 e H8.
{
 const a=h.analyseQuestion({topic:'bet',concreteQuestion:'Vou lucrar?',questionUnderstood:true,questionAccepted:true}); assert(a.houses.some(x=>x.role==='querent_money'&&x.radicalHouse===2)); assert(a.houses.some(x=>x.role==='bookmaker_money'&&x.radicalHouse===8));
}
// 14) Propriedade materializa imóvel, preço, lucro e vizinhos.
{
 const a=h.analyseQuestion({topic:'property',concreteQuestion:'Vale comprar?',questionUnderstood:true,questionAccepted:true}); for(const [r,hh] of [['property',4],['price',10],['property_profit',5],['property_neighbours',6]]) assert(a.houses.some(x=>x.role===r&&x.radicalHouse===hh),r);
}
// 15) Dívida usa dinheiro da pessoa-fonte, não H8 universal.
{
 const a=h.analyseQuestion({topic:'debt',concreteQuestion:'Meu irmão vai me pagar?',paymentSourceHouse:3,questionUnderstood:true,questionAccepted:true}); assert(a.houses.some(x=>x.role==='payment_money'&&x.radicalHouse===4));
}
// 16) Animal grande = XII; pequeno = VI.
{
 assert(h.analyseQuestion({topic:'missing_animal',concreteQuestion:'Cadê o cavalo?',animalSize:'large'}).houses.some(x=>x.role==='missing_animal'&&x.radicalHouse===12)); assert(h.analyseQuestion({topic:'missing_animal',concreteQuestion:'Cadê o gato?',animalSize:'small'}).houses.some(x=>x.role==='missing_animal'&&x.radicalHouse===6));
}
// 17) Pessoa desaparecida usa relação/casa da pessoa, não H2.
{
 const a=h.analyseQuestion({topic:'missing_person',concreteQuestion:'Onde está minha mãe?',subjectHouse:10}); assert(a.houses.some(x=>x.role==='missing_person'&&x.radicalHouse===10));
}
// 18) Furto com suspeito concreto preserva casa relacional do suspeito.
{
 const a=h.analyseQuestion({topic:'theft',concreteQuestion:'O vizinho pegou?',suspectHouse:3}); assert(a.houses.some(x=>x.role==='theft_suspect'&&x.radicalHouse===3));
}
// 19) Processo materializa oponente, juiz e veredicto.
{
 const a=h.analyseQuestion({topic:'lawsuit',concreteQuestion:'Vou ganhar?'}); for(const [r,hh] of [['opponent',7],['judge',10],['verdict',4]]) assert(a.houses.some(x=>x.role===r&&x.radicalHouse===hh));
}
// 20) Conhecimento e lucro do conhecimento ficam separados.
{
 const a=h.analyseQuestion({topic:'knowledge',concreteQuestion:'Vou lucrar com astrologia?'}); assert(a.houses.some(x=>x.role==='knowledge_or_school'&&x.radicalHouse===9)); assert(a.houses.some(x=>x.role==='knowledge_profit'&&x.radicalHouse===10));
}
// 21) Nascimento da pergunta: sem compreensão/aceite, dossier pode auditar mas não julgar.
{
 const d=h.evaluateHorary({chart:chart(),context:{topic:'money',concreteQuestion:'Vou receber?'}}); assert.equal(d.judgement.canJudge,false); assert(d.considerations.some(x=>x.id==='question-birth-unconfirmed'));
}
// 22) Com compreensão/aceite, o gate de nascimento abre se não falta outro contexto.
{
 const d=h.evaluateHorary({chart:chart(),context:{topic:'money',concreteQuestion:'Vou receber?',questionUnderstood:true,questionAccepted:true}}); assert.equal(d.judgement.canJudge,true);
}
// 23) Céu neutro completo é entregue à IA.
{
 const d=h.evaluateHorary({chart:chart(),context:{topic:'money',concreteQuestion:'x',questionUnderstood:true,questionAccepted:true}}); assert.equal(d.neutralSky.length,12); assert(d.neutralSky.some(x=>x.planet==='saturn'));
}
// 24) Considerações são registradas sem bloquear mecanicamente.
{
 const d=h.evaluateHorary({chart:chart({},1),context:{topic:'money',concreteQuestion:'x',questionUnderstood:true,questionAccepted:true}}); assert(d.considerations.some(x=>x.id==='consideration-early-asc')); assert.equal(d.judgement.canJudge,true);
}
// 25) Cronologia efemérica sintética encontra estação e pode revogar YES linear.
{
 const base=chart({venus:[0,1],mars:[10,.1]}); base.calculationMetadata={julianDayUt:1000,utcIso:'2026-01-01T00:00:00Z',timezone:'UTC',zodiac:'Tropical',houseSystem:'Regiomontanus',houseSystemCode:'R',engine:'Swiss Ephemeris',enginePackage:'@swisseph/browser',enginePackageVersion:'1.1.1',nodeMode:'Nodo verdadeiro',coordinatePrecision:'informada'};
 const d=h.evaluateHorary({chart:base,context:{topic:'relationship',concreteQuestion:'x',questionUnderstood:true,questionAccepted:true}});
 const init={sun:[200,.98],moon:[100,13],mercury:[150,1.3],venus:[0,1],mars:[10,.1],jupiter:[250,.08],saturn:[300,.03]};
 const provider=async(jd,types)=>{const t=jd-1000,out={};for(const x of types){let [lon,sp]=init[x]; if(x==='venus'){sp=t<2?1:-1;lon=t<2?t:4-t;}else lon+=sp*t;out[x]={longitude:(lon%360+360)%360,longitudeSpeed:sp,isRetrograde:sp<0};}return out;};
 const ev=await h.buildHoraryChronology(base,d,provider,{horizonDays:5,stepDays:1}); assert(ev.some(x=>x.kind==='station'&&x.planets[0]==='venus'));
}
console.log('HORARY_REGRESSION_EXTENDED_OK cases=25');
// 26) Gramática composicional: primo da mãe = X -> III = XII; dinheiro dele = X -> III -> II = I.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'O dinheiro do primo da minha mãe virá?',relevantHouse:1,dynamicRoles:[
  {role:'mothers_cousin',path:{rootHouse:10,turns:[3]},rationale:'Primo da mãe',primary:true},
  {role:'mothers_cousin_money',path:{rootHouse:10,turns:[3,2]},rationale:'Dinheiro do primo da mãe',primary:true},
 ],primaryRoleIds:['mothers_cousin','mothers_cousin_money']});
 assert(a.houses.some(x=>x.role==='mothers_cousin'&&x.radicalHouse===12));
 assert(a.houses.some(x=>x.role==='mothers_cousin_money'&&x.radicalHouse===1));
 assert.deepEqual(a.primaryRoles,['mothers_cousin','mothers_cousin_money']);
}
// 27) Adoção: criança ainda alheia é XI por padrão (V da VII), não V automática.
{
 const a=h.analyseQuestion({topic:'adoption',concreteQuestion:'Vou conseguir adotar esta criança?'}); assert(a.houses.some(x=>x.role==='adoptive_child'&&x.radicalHouse===11));
}
// 28) Entrega: pacote é II do vendedor/remetente (VII -> II = VIII), não III de correspondência.
{
 const a=h.analyseQuestion({topic:'delivery',concreteQuestion:'Quando chega o vinho?'}); assert(a.houses.some(x=>x.role==='package'&&x.radicalHouse===8)); assert(a.houses.some(x=>x.role==='seller'&&x.radicalHouse===7));
}
// 29) Autenticidade: produto do fornecedor é II da VII = VIII.
{
 const a=h.analyseQuestion({topic:'authenticity',concreteQuestion:'As peças são originais?'}); assert(a.houses.some(x=>x.role==='product'&&x.radicalHouse===8));
}
// 30) Sequestro compõe pessoa + XII radical/derivada + VIII radical/derivada.
{
 const a=h.analyseQuestion({topic:'kidnapping',concreteQuestion:'Ele sobreviverá e será solto?',subjectHouse:12}); for(const r of ['kidnapped_person','radical_captivity','turned_captivity','radical_death','turned_death']) assert(a.houses.some(x=>x.role===r),r);
 assert(a.houses.some(x=>x.role==='turned_captivity'&&x.radicalHouse===11)); assert(a.houses.some(x=>x.role==='turned_death'&&x.radicalHouse===7));
}
// 31) Loteria é XI (windfall), distinta de aposta H8.
{
 const a=h.analyseQuestion({topic:'lottery',concreteQuestion:'Vou ganhar na loteria?'}); assert(a.houses.some(x=>x.role==='windfall'&&x.radicalHouse===11)); assert(!a.houses.some(x=>x.role==='bookmaker_money'));
}
// 32) Benefício governamental: beneficiário pode ser terceiro, governo X, dinheiro/favor XI.
{
 const a=h.analyseQuestion({topic:'government_grant',concreteQuestion:'Minha filha receberá a vaga financiada?',subjectHouse:5}); assert(a.houses.some(x=>x.role==='grant_recipient'&&x.radicalHouse===5)); assert(a.houses.some(x=>x.role==='government'&&x.radicalHouse===10)); assert(a.houses.some(x=>x.role==='government_gift'&&x.radicalHouse===11));
}
// 33) Eleição não inventa casas: candidatos são papéis explícitos/derivados e Lua é electorate natural na análise.
{
 const c={topic:'election',concreteQuestion:'O incumbente vencerá?',dynamicRoles:[{role:'incumbent',radicalHouse:10,rationale:'governante atual',primary:true},{role:'challenger',radicalHouse:4,rationale:'oponente do governante',primary:true}],primaryRoleIds:['incumbent','challenger'],questionUnderstood:true,questionAccepted:true};
 const a=h.analyseQuestion(c); assert.deepEqual(a.primaryRoles,['incumbent','challenger']); assert.equal(a.unresolvedContext.length,0);
 const d=h.evaluateHorary({chart:chart(),context:c}); assert(d.testimonies.some(x=>x.id==='election-moon-electorate')); assert.equal(d.ontology.family,'public_collective');
}
// 34) Ontologia separa tópico de intenção e permite múltiplas intenções no mesmo mapa.
{
 const c=h.classifyHoraryQuestion({topic:'kidnapping',concreteQuestion:'x',subjectHouse:12,intents:['survival','release','timing']}); assert.deepEqual(c.intents,['survival','release','timing']); assert.equal(c.composable,true);
}
// 35) Regra de cúspide: planeta até ~5° antes da cúspide seguinte, já no mesmo signo, conta na casa seguinte.
{
 const c=chart({venus:[155,1]},120); // cusps artificiais a cada 30°: H2=150; use custom below
 c.housesData.house=[120,156,190,220,250,280,300,330,0,30,60,90]; c.housesData.ascendant=120; c.housesData.mc=30;
 assert.equal(h.planetHouse(c,155),2); // 1° antes da cúspide H2=156, mesmo signo Virgo
 c.housesData.house=[120,150,190,220,250,280,300,330,0,30,60,90];
 assert.equal(h.planetHouse(c,149),1); // 1° antes da cúspide, mas cusp=0 Virgo and planet=29 Leo: no carry-over
}
// 36) Gatilho genérico de contato com cúspide permite timing simbólico por significador natural sem forçar casa ontológica do serviço.
{
 const c=chart({moon:[50,12]},38); c.housesData.house[0]=38;
 const d=h.evaluateHorary({chart:c,context:{topic:'service_change',concreteQuestion:'Quando a luz volta?',questionUnderstood:true,questionAccepted:true,eventAssumed:true,naturalServicePlanet:'moon',eventTrigger:{kind:'cusp_contact',planet:'moon',house:1},timingUnits:['hours']}});
 const t=d.testimonies.find(x=>x.id==='custom-cusp-contact-trigger'); assert(t); assert.equal(t.data.planet,'moon'); assert(Math.abs(t.data.degreesToCusp-12)<.01); assert.equal(d.judgement.answer,'YES');
}
// 37) Lista de tópicos canônica vem da ontologia: não pode haver presets invisíveis à UI/API por arrays paralelos.
{
 assert.equal(h.HORARY_TOPIC_LIST.length,Object.keys(h.HORARY_TOPIC_ONTOLOGY).length); assert(h.HORARY_TOPIC_LIST.includes('kidnapping')); assert(h.HORARY_TOPIC_LIST.includes('authenticity')); assert(h.HORARY_TOPIC_LIST.includes('service_change'));
}
console.log('HORARY_REGRESSION_COMPOSITIONAL_OK cases=37 dynamic-house-grammar=on source-presets=expanded cusp-rule=on canonical-topic-list=on');
// 38) Atlas semântico cobre as 12 casas e todas as chaves são únicas.
{
 assert.equal(h.HORARY_HOUSE_ATLAS.length,12); const keys=h.HORARY_HOUSE_ATLAS.flatMap(x=>x.meanings.map(m=>m.key)); assert.equal(new Set(keys).size,keys.length); assert(keys.length>=100);
}
// 39) Exemplo do usuário: problema financeiro com vizinho não é "uma casa"; compõe vizinho H3, meu dinheiro H2 e dinheiro do vizinho H4.
{
 const c={topic:'custom',concreteQuestion:'Meu vizinho vai me devolver o dinheiro?',questionUnderstood:true,questionAccepted:true,semanticRoles:[
  {role:'neighbor',meaning:'neighbor',primary:false},
  {role:'querent_money',meaning:'money',anchorRole:'querent',primary:true},
  {role:'neighbor_money',meaning:'money',anchorRole:'neighbor',primary:true},
 ],primaryRoleIds:['querent_money','neighbor_money']};
 const a=h.analyseQuestion(c); assert(a.houses.some(x=>x.role==='neighbor'&&x.radicalHouse===3)); assert(a.houses.some(x=>x.role==='querent_money'&&x.radicalHouse===2)); assert(a.houses.some(x=>x.role==='neighbor_money'&&x.radicalHouse===4)); assert.equal(a.unresolvedContext.length,0);
 const d=h.evaluateHorary({chart:chart(),context:c}); assert.equal(d.judgement.canJudge,true); assert.equal(d.topicAnalysis.semanticFrame.compiledRoles.length,3);
}
// 40) Casa do vizinho = IV do vizinho: H3 -> H4 relativa = H6 radical.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'Como está a casa do vizinho?',semanticRoles:[{role:'neighbor',meaning:'neighbor'},{role:'neighbor_home',meaning:'home',anchorRole:'neighbor',primary:true}]}); assert(a.houses.some(x=>x.role==='neighbor_home'&&x.radicalHouse===6));
}
// 41) Dinheiro do pai = II do pai: H4 -> H2 = H5.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'Dinheiro do meu pai',semanticRoles:[{role:'father',meaning:'father'},{role:'father_money',meaning:'money',anchorRole:'father',primary:true}]}); assert(a.houses.some(x=>x.role==='father_money'&&x.radicalHouse===5));
}
// 42) Irmão da mãe = III da mãe: H10 -> H3 = H12.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'Irmão da minha mãe',semanticRoles:[{role:'mother',meaning:'mother'},{role:'mothers_brother',meaning:'sibling',anchorRole:'mother',primary:true}]}); assert(a.houses.some(x=>x.role==='mothers_brother'&&x.radicalHouse===12));
}
// 43) Universidade do filho permanece IX radical por padrão: não virar só por possessivo linguístico.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'A universidade do meu filho é boa?',semanticRoles:[{role:'son',meaning:'child'},{role:'university',meaning:'university',anchorRole:'son',primary:true}]}); assert(a.houses.some(x=>x.role==='son'&&x.radicalHouse===5)); assert(a.houses.some(x=>x.role==='university'&&x.radicalHouse===9));
}
// 44) A camada inteligente pode ordenar turning explícito quando o contexto realmente o exige.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'IX derivada do filho',semanticRoles:[{role:'son',meaning:'child'},{role:'sons_ninth',meaning:'university',anchorRole:'son',relationMode:'turned',primary:true}]}); assert(a.houses.some(x=>x.role==='sons_ninth'&&x.radicalHouse===1));
}
// 45) Morte de terceiro gera VIII derivada + VIII radical automaticamente.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'Meu vizinho morrerá?',semanticRoles:[{role:'neighbor',meaning:'neighbor'},{role:'neighbor_death',meaning:'death',anchorRole:'neighbor',primary:true}]}); assert(a.houses.some(x=>x.role==='neighbor_death'&&x.radicalHouse===10)); assert(a.houses.some(x=>x.role==='neighbor_death:radical'&&x.radicalHouse===8));
}
// 46) Ambiguidade semântica não resolvida bloqueia julgamento em vez de o motor adivinhar.
{
 const c={topic:'custom',concreteQuestion:'Tenho um problema financeiro com o vizinho',questionUnderstood:true,questionAccepted:true,semanticAmbiguities:[{phrase:'problema financeiro com o vizinho',candidates:[{meaning:'neighbor'},{meaning:'money'},{meaning:'other_person_money'}]}]}; const d=h.evaluateHorary({chart:chart(),context:c}); assert.equal(d.judgement.canJudge,false); assert(d.topicAnalysis.unresolvedContext.some(x=>x.startsWith('semanticAmbiguity:')));
}
// 47) Texto livre sozinho NÃO é classificado por keyword no núcleo; sem frame ou casa, custom permanece pendente.
{
 const a=h.analyseQuestion({topic:'custom',concreteQuestion:'Tenho um problema financeiro com meu vizinho'}); assert(a.unresolvedContext.includes('relevantHouse')); assert(!a.houses.some(x=>x.role==='neighbor'));
}
console.log(`HORARY_HOUSE_SEMANTICS_REGRESSION_OK cases=10 atlasKeys=${h.HORARY_HOUSE_SEMANTIC_KEYS.length} infinite-composition=on no-text-guessing=on`);
