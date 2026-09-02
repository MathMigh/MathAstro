import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'.audit','horary-runtime-ai-source-hardcases');
fs.rmSync(runtime,{recursive:true,force:true});
execFileSync('tsc',['-p',path.join(root,'.audit','tsconfig-horary-runtime.json'),'--outDir',runtime],{stdio:'inherit'});
fs.mkdirSync(path.join(runtime,'node_modules','@'),{recursive:true});
for(const p of ['app','interfaces']){const target=path.join(runtime,'node_modules','@',p);try{fs.unlinkSync(target)}catch{}fs.symlinkSync(path.join('..','..','src',p),target,'dir');}
const h=await import(path.join(runtime,'src','traditions','western','horary','index.js'));
const cases=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/horary-examples-all-swiss.json'),'utf8'));
const by=id=>cases.find(x=>x.id===id);
let assertions=0; const A=(x,m)=>{assert(x,m);assertions++}; const EQ=(a,b,m)=>{assert.equal(a,b,m);assertions++;};
const dossier=id=>{const c=by(id);assert(c,`missing ${id}`);return h.evaluateHorary({chart:c.chart,context:c.context});};
const H=(d,role)=>d.topicAnalysis.houses.find(x=>x.role===role)?.radicalHouse;
const S=(d,role)=>d.significators.find(x=>x.role===role);
const T=(d,id)=>d.testimonies.find(x=>x.id===id);
const hasT=(d,id)=>!!T(d,id);

// HE-01 — pessoa alheia, XII derivada e Saturno natural de prisão.
{
 const d=dossier('HE-01'); EQ(H(d,'deirdre'),7,'HE-01 Deirdre H7'); EQ(H(d,'derived_prison'),6,'HE-01 XII da VII = H6');
 EQ(S(d,'prison_subject')?.accidental.house,6,'HE-01 pessoa fisicamente na prisão derivada');
 const t=T(d,'prison-natural-saturn-contact'); A(t,'HE-01 Saturno natural não materializado'); A(t.data?.aspect?.applying===true,'HE-01 contato pessoa-Saturno deve aplicar');
}
// HE-05 — votação encerrada: último aspecto lunar + coleta posterior do candidato.
{
 const d=dossier('HE-05'); EQ(d.question.eventAlreadyOccurred,true,'HE-05 estado temporal'); EQ(H(d,'candidate'),1,'HE-05 candidato apoiado H1'); EQ(H(d,'opponent'),7,'HE-05 oponente H7');
 EQ(T(d,'election-last-lunar-aspect')?.data?.planet,'jupiter','HE-05 último aspecto lunar deve ser Júpiter'); A(hasT(d,'election-past-collection-candidate'),'HE-05 coleta do candidato via Júpiter ausente');
}
// HE-06 — incumbente X, desafiante IV; Lua vai ao incumbente.
{
 const d=dossier('HE-06'); EQ(H(d,'incumbent'),10,'HE-06 incumbente H10'); EQ(H(d,'challenger'),4,'HE-06 desafiante H4');
 const t=T(d,'election-moon-incumbent'); A(t?.data?.aspect?.applying===true,'HE-06 Lua deve aplicar ao incumbente');
}
// HE-24 — imóvel/preço/vizinhos + recepção e contra-antíscio querente-imóvel.
{
 const d=dossier('HE-24'); EQ(H(d,'property'),4,'HE-24 imóvel H4'); EQ(H(d,'price'),10,'HE-24 preço H10'); EQ(H(d,'property_neighbours'),6,'HE-24 vizinhos III da IV = H6');
 EQ(S(d,'property')?.planet,'mercury','HE-24 L4 Mercúrio'); A(S(d,'property')?.accidental.retrograde===true,'HE-24 imóvel/Mercúrio retrógrado'); A(S(d,'price')?.accidental.combust===true,'HE-24 preço/Júpiter combusto');
 EQ(T(d,'property-querent-property-reception-a-b')?.data?.reception?.disposition,'negative','HE-24 querente recebe imóvel negativamente');
 A(d.antiscialContacts.some(x=>x.a==='moon'&&x.b==='mercury'&&x.byContraAntiscion&&x.orb<1),'HE-24 contra-antíscio Lua-Mercúrio ausente');
}
// HE-34 — criança de outros = V da VII = XI; significador alojado na VII em signo fixo.
{
 const d=dossier('HE-34'); EQ(d.question.topic,'adoption','HE-34 tópico deve ser adoção'); EQ(H(d,'young_couple'),7,'HE-34 casal H7'); EQ(H(d,'baby'),11,'HE-34 bebê H11');
 const t=T(d,'adoption-child-placement'); EQ(t?.data?.house,7,'HE-34 bebê fisicamente H7'); EQ(t?.data?.mode,'fixed','HE-34 bebê em signo fixo'); EQ(S(d,'baby')?.planet,'venus','HE-34 bebê Vênus');
}
// HE-50 — cartão: H2/Mercúrio; signo de ar e dispositor Vênus debilitado.
{
 const d=dossier('HE-50'); EQ(H(d,'lost_object'),2,'HE-50 objeto H2'); EQ(S(d,'lost_object')?.planet,'mercury','HE-50 objeto Mercúrio');
 const t=T(d,'missing-location-symbolism'); EQ(t?.data?.element,'air','HE-50 elemento ar'); EQ(t?.data?.dispositor,'venus','HE-50 dispositor Vênus'); A(t?.data?.dispositorEssential?.detriment===true,'HE-50 Vênus dispositor em detrimento');
}
// HE-55 — objeto H2, faxineira H6, contato passado, localização aquática/mutável e Netuno estreito auxiliar.
{
 const d=dossier('HE-55'); EQ(H(d,'lost_object'),2,'HE-55 objeto H2'); EQ(H(d,'cleaning_lady'),6,'HE-55 faxineira H6'); A(T(d,'primary-separation'),'HE-55 contato separativo objeto-faxineira ausente');
 const loc=T(d,'missing-location-symbolism'); EQ(loc?.data?.element,'water','HE-55 elemento água'); EQ(loc?.data?.mode,'mutable','HE-55 mutável'); A(hasT(d,'missing-tight-outer-neptune'),'HE-55 Netuno estreito auxiliar ausente');
 EQ(d.lunarSequence[0]?.target,'saturn','HE-55 Lua deve encontrar Saturno antes do objeto'); EQ(d.lunarSequence[1]?.target,'mercury','HE-55 Lua deve chegar ao objeto depois de Saturno');
}
// HE-57 — rota direta: nosso dinheiro H2, dinheiro deles H8; Júpiter intervém antes.
{
 const d=dossier('HE-57'); EQ(H(d,'our_money'),2,'HE-57 nosso dinheiro H2'); EQ(H(d,'their_money'),8,'HE-57 dinheiro deles H8'); EQ(S(d,'our_money')?.planet,'venus','HE-57 nosso dinheiro Vênus'); EQ(S(d,'their_money')?.planet,'mars','HE-57 dinheiro deles Marte');
 A(d.mediation.some(x=>x.kind==='sign_change_obstruction'),'HE-57 mudança de signo obstrutiva ausente'); A(d.mediation.some(x=>x.kind==='prohibition_candidate'&&x.mediator==='jupiter'),'HE-57 proibição por Júpiter ausente');
}
// HE-61 — ladrão não é H7 automático: contato estreito objeto-Sol sugere candidato; sem contato de retorno ao querente.
{
 const d=dossier('HE-61'); EQ(H(d,'stolen_object'),2,'HE-61 cortador H2'); const c=T(d,'theft-object-contact-candidate-sun'); A(c&&c.data?.aspect?.orb<1,'HE-61 candidato Sol por conjunção estreita ausente');
 const r=T(d,'theft-candidate-return-contact-sun'); A(r,'HE-61 teste de retorno do candidato ausente'); EQ(r.data?.aspect,undefined,'HE-61 Sol não deve ter aspecto com querente');
}
// HE-64 — relação familiar derivada, dupla VIII e sem self-aspect inventado.
{
 const d=dossier('HE-64'); EQ(H(d,'mother'),10,'HE-64 mãe H10'); EQ(H(d,'kidnapped_person'),12,'HE-64 primo da mãe H12'); EQ(H(d,'turned_captivity'),11,'HE-64 XII do sequestrado H11'); EQ(H(d,'turned_death'),7,'HE-64 VIII do sequestrado H7');
 A(hasT(d,'kidnap-turned-death-self'),'HE-64 proteção contra self-aspect ausente'); A(!d.testimonies.some(t=>t.id==='kidnap-radical-death-application'),'HE-64 não deve inventar aplicação à morte radical');
}

// Todos os hard cases devem entregar à IA um pacote em português, auditável e sem recalcular o mapa.
for(const id of ['HE-01','HE-05','HE-06','HE-24','HE-34','HE-50','HE-55','HE-57','HE-61','HE-64']){
 const d=dossier(id); const req=h.buildHoraryAIJudgementRequest(d);
 EQ(req.language,'pt-BR',`${id} idioma`); EQ(req.stage,'judgement',`${id} stage`); A(req.systemPrompt.includes('SUBJETIVIDADE CONTROLADA'),`${id} prompt sem fronteira subjetiva`); A(req.userPrompt.includes('DOSSIÊ_JSON'),`${id} sem dossiê`); EQ(req.blockingClarifications.length,0,`${id} não deveria bloquear após contexto-fonte`);
}
console.log(`HORARY_AI_SOURCE_HARDCASES_OK cases=10 assertions=${assertions} difficult-semantics=covered source-parity-signals=materialized ai-packets=10`);
