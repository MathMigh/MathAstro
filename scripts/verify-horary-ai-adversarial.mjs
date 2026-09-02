import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'.audit','horary-runtime-ai-adversarial');
fs.rmSync(runtime,{recursive:true,force:true});
execFileSync('tsc',['-p',path.join(root,'.audit','tsconfig-horary-runtime.json'),'--outDir',runtime],{stdio:'inherit'});
fs.mkdirSync(path.join(runtime,'node_modules','@'),{recursive:true});
for(const p of ['app','interfaces']){const target=path.join(runtime,'node_modules','@',p);try{fs.unlinkSync(target)}catch{}fs.symlinkSync(path.join('..','..','src',p),target,'dir');}
const h=await import(path.join(runtime,'src','traditions','western','horary','index.js'));

const names={sun:'Sol',moon:'Lua',mercury:'Mercúrio',venus:'Vênus',mars:'Marte',jupiter:'Júpiter',saturn:'Saturno',uranus:'Urano',neptune:'Netuno',pluto:'Plutão',northNode:'Nodo Norte',southNode:'Nodo Sul'};
function P(type,lon,speed){return {name:names[type],type,id:0,longitude:lon,longitudeRaw:lon,longitudeSpeed:speed,sign:'',antiscion:0,antiscionRaw:0,isRetrograde:speed<0};}
function chart(){const base={sun:[200,.9856],moon:[100,13.17],mercury:[150,1.38],venus:[40,1.2],mars:[10,.52],jupiter:[250,.08],saturn:[300,.03],uranus:[50,.01],neptune:[350,.006],pluto:[305,.004],northNode:[20,-.05],southNode:[200,-.05]};const houses=Array.from({length:12},(_,i)=>i*30);return {planets:Object.entries(base).map(([k,[lon,sp]])=>P(k,lon,sp)),housesData:{house:houses,ascendant:0,mc:90,armc:0,vertex:0,equatorialAscendant:0,kochCoAscendant:0,munkaseyCoAscendant:0,munkaseyPolarAscendant:0,houseSystem:'Regiomontanus',houseSystemCode:'R'},birthDate:{day:1,month:1,year:2026,time:'12:00',coordinates:{latitude:0,longitude:0,name:'Test',timezone:'UTC'}},fixedStars:[]};}

let assertions=0; const A=(x,m)=>{assert(x,m);assertions++}; const EQ=(a,b,m)=>{assert.equal(a,b,m);assertions++};
function roleHouse(ctx,role){const a=h.analyseQuestion({topic:'custom',concreteQuestion:'teste',...ctx});const r=a.houses.find(x=>x.role===role);return {a,house:r?.radicalHouse};}

// Bateria de manifestações simbólicas: o texto humano pode ser infinito; a composição não.
const semanticCases=[
  ['vizinho', [{role:'neighbor',meaning:'neighbor',primary:true}], 'neighbor',3],
  ['dinheiro do vizinho', [{role:'neighbor',meaning:'neighbor'},{role:'neighbor_money',meaning:'money',anchorRole:'neighbor',primary:true}], 'neighbor_money',4],
  ['casa do vizinho', [{role:'neighbor',meaning:'neighbor'},{role:'neighbor_home',meaning:'home',anchorRole:'neighbor',primary:true}], 'neighbor_home',6],
  ['filho do vizinho', [{role:'neighbor',meaning:'neighbor'},{role:'neighbor_child',meaning:'child',anchorRole:'neighbor',primary:true}], 'neighbor_child',7],
  ['pai', [{role:'father',meaning:'father',primary:true}], 'father',4],
  ['dinheiro do pai', [{role:'father',meaning:'father'},{role:'father_money',meaning:'money',anchorRole:'father',primary:true}], 'father_money',5],
  ['casa do pai', [{role:'father',meaning:'father'},{role:'father_home',meaning:'home',anchorRole:'father',primary:true}], 'father_home',7],
  ['mãe', [{role:'mother',meaning:'mother',primary:true}], 'mother',10],
  ['irmão da mãe', [{role:'mother',meaning:'mother'},{role:'mothers_brother',meaning:'sibling',anchorRole:'mother',primary:true}], 'mothers_brother',12],
  ['dinheiro do irmão da mãe', [{role:'mother',meaning:'mother'},{role:'mothers_brother',meaning:'sibling',anchorRole:'mother'},{role:'money',meaning:'money',anchorRole:'mothers_brother',primary:true}], 'money',1],
  ['cônjuge', [{role:'spouse',meaning:'spouse',primary:true}], 'spouse',7],
  ['trabalho do cônjuge', [{role:'spouse',meaning:'spouse'},{role:'spouse_job',meaning:'job',anchorRole:'spouse',primary:true}], 'spouse_job',4],
  ['dinheiro do cliente', [{role:'client',meaning:'client'},{role:'client_money',meaning:'money',anchorRole:'client',primary:true}], 'client_money',8],
  ['dinheiro do chefe', [{role:'boss',meaning:'boss'},{role:'boss_money',meaning:'money',anchorRole:'boss',primary:true}], 'boss_money',11],
  ['filho do amigo', [{role:'friend',meaning:'friend'},{role:'friend_child',meaning:'child',anchorRole:'friend',primary:true}], 'friend_child',3],
  ['amigo do filho', [{role:'child',meaning:'child'},{role:'child_friend',meaning:'friend',anchorRole:'child',primary:true}], 'child_friend',3],
  ['coelho do filho', [{role:'child',meaning:'child'},{role:'rabbit',meaning:'small_animal',anchorRole:'child',primary:true}], 'rabbit',10],
  ['gato do pai', [{role:'father',meaning:'father'},{role:'cat',meaning:'small_animal',anchorRole:'father',primary:true}], 'cat',9],
  ['chefe do irmão', [{role:'brother',meaning:'sibling'},{role:'brother_boss',meaning:'boss',anchorRole:'brother',primary:true}], 'brother_boss',12],
  ['filho do irmão', [{role:'brother',meaning:'sibling'},{role:'nephew',meaning:'child',anchorRole:'brother',primary:true}], 'nephew',7],
  ['dinheiro do filho do irmão', [{role:'brother',meaning:'sibling'},{role:'nephew',meaning:'child',anchorRole:'brother'},{role:'nephew_money',meaning:'money',anchorRole:'nephew',primary:true}], 'nephew_money',8],
];
for(const [label,semanticRoles,role,expected] of semanticCases){const {house}=roleHouse({semanticRoles},role);EQ(house,expected,`${label}: expected H${expected}, got H${house}`);}

// Instituição que apenas "é de alguém" na fala não deve ser virada automaticamente.
{
  const {house}=roleHouse({semanticRoles:[{role:'son',meaning:'child'},{role:'university',meaning:'university',anchorRole:'son',primary:true}]},'university');
  EQ(house,9,'universidade do filho deve permanecer IX radical por default semântico');
}
// Mas turning explícito continua disponível quando o contexto realmente o exige.
{
  const {house}=roleHouse({semanticRoles:[{role:'son',meaning:'child'},{role:'sons_ninth',meaning:'university',anchorRole:'son',relationMode:'turned',primary:true}]},'sons_ninth');
  EQ(house,1,'IX derivada do filho: 9ª de H5 = H1');
}
// Morte/prisão de terceiro preservam radical + derivada.
{
  const {a,house}=roleHouse({semanticRoles:[{role:'neighbor',meaning:'neighbor'},{role:'neighbor_death',meaning:'death',anchorRole:'neighbor',primary:true}]},'neighbor_death');
  EQ(house,10,'VIII do vizinho'); A(a.houses.some(x=>x.role==='neighbor_death:radical'&&x.radicalHouse===8),'VIII radical companion ausente');
}
{
  const {a,house}=roleHouse({semanticRoles:[{role:'neighbor',meaning:'neighbor'},{role:'neighbor_prison',meaning:'prison',anchorRole:'neighbor',primary:true}]},'neighbor_prison');
  EQ(house,2,'XII do vizinho'); A(a.houses.some(x=>x.role==='neighbor_prison:radical'&&x.radicalHouse===12),'XII radical companion ausente');
}
// Contextual ambíguo não é adivinhado.
{
  const a=h.analyseQuestion({topic:'custom',concreteQuestion:'dinheiro da contraparte?',semanticRoles:[{role:'neighbor',meaning:'neighbor'},{role:'maybe_money',meaning:'other_person_money',anchorRole:'neighbor',primary:true}]});
  A(a.unresolvedContext.some(x=>x.includes('semanticRole:maybe_money:relationMode')),'meaning contextual deveria ficar pendente');
}
// Palavra-chave não injeta vizinho/dinheiro sem semanticRoles.
{
  const a=h.analyseQuestion({topic:'custom',concreteQuestion:'Tenho um problema financeiro com o meu vizinho'});
  A(!a.houses.some(x=>x.role==='neighbor'||x.role==='neighbor_money'),'classificador lexical oculto detectado');
  A(a.unresolvedContext.length>0,'custom sem semântica deve ficar pendente');
}
// Ambiguidade explícita bloqueia canJudge.
{
  const d=h.evaluateHorary({chart:chart(),context:{topic:'custom',concreteQuestion:'Tenho um problema financeiro com o vizinho',questionUnderstood:true,questionAccepted:true,semanticAmbiguities:[{phrase:'problema financeiro com o vizinho',candidates:[{meaning:'neighbor'},{meaning:'money'},{meaning:'other_person_money'}]}]}});
  EQ(d.judgement.canJudge,false,'ambiguidade semântica deve bloquear');
}

// Prompt absoluto: português, fronteira e subjetividade declaradas.
for(const token of ['SUBJETIVIDADE CONTROLADA','PROTOCOLO SEMÂNTICO PARA SITUAÇÕES INFINITAS','Não classifique por palavras isoladas','unresolvedSubjectivity','SOURCE_RULE_REQUIRED','NEEDS_CLARIFICATION']) A(h.HORARY_ABSOLUTE_AI_SYSTEM_PROMPT.includes(token),`prompt ausente: ${token}`);
EQ(h.HORARY_AI_LANGUAGE,'pt-BR','idioma do runtime IA');

// Fase 1: pacote semântico provider-neutral.
{
 const req=h.buildHoraryAISemanticIntakeRequest({rawQuestion:'Meu vizinho está com o meu dinheiro; ele vai me pagar?',background:'É uma dívida já vencida.'});
 EQ(req.stage,'semantic_intake'); EQ(req.language,'pt-BR'); A(req.systemPrompt.includes('ENTRADA SEMÂNTICA PRÉ-MOTOR')); A(req.userPrompt.includes('MEANINGS DO ATLAS')); A(req.requiredSourceIds.includes('M-HOUSE-TURNING'));
}
// Validador intake rejeita meaning inventada e exige pergunta quando NEEDS_CLARIFICATION.
{
 const bad=h.validateHoraryAISemanticIntakeResult({status:'READY_FOR_ENGINE',concreteQuestion:'x',semanticRoles:[{role:'x',meaning:'magic_house'}],semanticAmbiguities:[],intents:[],primaryRoleIds:['x'],contextPatch:{},clarificationQuestions:[],confidence:'high',semanticNotes:[]});
 EQ(bad.valid,false); A(bad.errors.some(x=>x.includes('fora do atlas')));
 const bad2=h.validateHoraryAISemanticIntakeResult({status:'NEEDS_CLARIFICATION',semanticRoles:[],semanticAmbiguities:[],intents:[],primaryRoleIds:[],contextPatch:{},clarificationQuestions:[],confidence:'medium',semanticNotes:[]});
 EQ(bad2.valid,false); A(bad2.errors.some(x=>x.includes('exige pelo menos uma pergunta')));
}

// Fase 2: julgamento e contrato de retorno.
const dossier=h.evaluateHorary({chart:chart(),context:{topic:'custom',concreteQuestion:'Meu vizinho vai me devolver o dinheiro?',questionUnderstood:true,questionAccepted:true,semanticRoles:[{role:'neighbor',meaning:'neighbor'},{role:'querent_money',meaning:'money',anchorRole:'querent',primary:true},{role:'neighbor_money',meaning:'money',anchorRole:'neighbor',primary:true}],primaryRoleIds:['querent_money','neighbor_money']}});
{
 const req=h.buildHoraryAIJudgementRequest(dossier); EQ(req.stage,'judgement'); EQ(req.language,'pt-BR'); A(req.expectedOutput.usedSourceIds!==undefined); A(req.userPrompt.includes('DOSSIÊ_JSON'));
}
const validAI={status:'DESCRIPTIVE_ONLY',questionReframed:'Meu vizinho me devolverá o dinheiro?',semanticResolution:[{role:'neighbor',meaning:'neighbor',house:3,rationale:'vizinho'}, {role:'neighbor_money',meaning:'money',house:4,rationale:'II da III'}],answer:'DESCRIPTIVE_ONLY',causalChain:['vizinho H3 → dinheiro dele H4 → significadores e contatos do dossiê → síntese contextual'],sourceVariants:[],usedSourceIds:['F-HT','M-HOUSE-TURNING'],unresolvedSubjectivity:['A qualificação final depende do contexto de cobrança fornecido ao astrólogo.'],confidence:'medium',clarificationNeeded:[],sourceRuleRequired:[],reportText:'Síntese astrológica contextual.'};
{
 const v=h.validateHoraryAIResult(validAI,dossier); EQ(v.valid,true,`valid AI rejected: ${v.errors.join('; ')}`); A(h.renderHoraryFinalAIReport(dossier,validAI).includes('SUBJETIVIDADE RESIDUAL'));
}
// Fonte inventada deve ser barrada.
{
 const bad=h.validateHoraryAIResult({...validAI,usedSourceIds:['AUTOR-INVENTADO']},dossier); EQ(bad.valid,false); A(bad.errors.some(x=>x.includes('fonte não autorizada')));
}
// Provider adapter: mock prova que a integração futura não depende de fornecedor específico.
{
 const provider={generate:async req=>{EQ(req.stage,'judgement');A(Array.isArray(req.sourceEvidence)&&req.sourceEvidence.length>0,'fallback curado de fonte não foi injetado');return validAI;}};
 const out=await h.runHoraryAIJudgement(provider,dossier); EQ(out.valid,true);
}

// Adapter RAG/corpus: apenas sourceIds solicitados podem entrar no pacote do modelo.
{
 const base=h.buildHoraryAIJudgementRequest(dossier);
 const resolver={resolve:async ({sourceIds})=>[
   {sourceId:sourceIds[0],title:'Corpus autorizado',locator:'teste',excerpt:'Regra recuperada do corpus para o caso.'},
   {sourceId:'FONTE_FORA_DO_PACOTE',excerpt:'deve ser descartada'},
 ]};
 const hydrated=await h.hydrateHoraryAIModelRequestWithSources(base,resolver);
 EQ(hydrated.sourceEvidence.length,1,'RAG deve filtrar sourceId fora do pacote');
 A(hydrated.userPrompt.includes('EVIDÊNCIA_DE_FONTE_RECUPERADA'),'RAG não foi anexado ao prompt do caso');
 A(!hydrated.userPrompt.includes('FONTE_FORA_DO_PACOTE'),'RAG vazou fonte não autorizada');
 const provider={generate:async req=>{A(Array.isArray(req.sourceEvidence)&&req.sourceEvidence.length===1,'provider não recebeu evidência RAG');return validAI;}};
 const out=await h.runHoraryAIJudgement(provider,dossier,resolver); EQ(out.valid,true,'julgamento com RAG deveria validar');
}

// Todos os 64 mapas publicados devem produzir um pacote de julgamento pronto para modelo.
const all64=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/horary-examples-all-swiss.json'),'utf8'));
let packets=0, blocking=0;
for(const c of all64){
 const d=h.evaluateHorary({chart:c.chart,context:c.context});
 const req=h.buildHoraryAIJudgementRequest(d);
 EQ(req.stage,'judgement',`${c.id}: stage`); EQ(req.language,'pt-BR',`${c.id}: language`); A(req.systemPrompt.includes('SUBJETIVIDADE CONTROLADA'),`${c.id}: prompt v2`); A(Array.isArray(req.sourceRetrievalHints),`${c.id}: source hints`); A(req.expectedOutput.unresolvedSubjectivity!==undefined,`${c.id}: output contract`);
 packets++; if(req.blockingClarifications.length) blocking++;
}

console.log(`HORARY_AI_ADVERSARIAL_OK semanticCases=${semanticCases.length+8} all64Packets=${packets} blockingPackets=${blocking} assertions=${assertions} provider-neutral=on prompt=pt-BR-v3 subjective-boundary=explicit`);
