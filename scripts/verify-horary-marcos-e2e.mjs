import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {execFileSync,spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'.audit','horary-runtime-marcos-e2e');
fs.rmSync(runtime,{recursive:true,force:true});
execFileSync('tsc',['-p',path.join(root,'.audit','tsconfig-horary-runtime.json'),'--outDir',runtime],{stdio:'inherit'});
fs.mkdirSync(path.join(runtime,'node_modules','@'),{recursive:true});
for(const p of ['app','interfaces']){const target=path.join(runtime,'node_modules','@',p);try{fs.unlinkSync(target)}catch{}fs.symlinkSync(path.join('..','..','src',p),target,'dir');}
const h=await import(path.join(runtime,'src','traditions','western','horary','index.js'));
const cases=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/marcos-e2e-swiss.json'),'utf8'));
const expectations=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/marcos-e2e-source-expectations.json'),'utf8'));
const byId=Object.fromEntries(cases.map(c=>[c.id,c]));
const expById=Object.fromEntries(expectations.map(c=>[c.id,c]));
const signStart={Aries:0,Taurus:30,Gemini:60,Cancer:90,Leo:120,Virgo:150,Libra:180,Scorpio:210,Sagittarius:240,Capricorn:270,Aquarius:300,Pisces:330};
const circ=(a,b)=>{let d=Math.abs(a-b)%360;return Math.min(d,360-d)};
const sig=(d,r)=>d.significators.find(s=>s.role===r);
const tst=(d,id)=>d.testimonies.find(t=>t.id===id);
const med=(d,k)=>d.mediation.filter(x=>x.kind===k);
const pair=(e,a,b)=>e.planets?.length===2&&e.planets.includes(a)&&e.planets.includes(b);
let assertions=0, sourceDiscrepancies=0;
function A(cond,msg){assert(cond,msg);assertions++;}
function EQ(a,b,msg){assert.equal(a,b,msg);assertions++;}
function LT(a,b,msg){assert(a<b,msg);assertions++;}

// Astronomia de nascimento: os 10 mapas reconstruídos por Swiss Ephemeris precisam reproduzir o ASC publicado (arredondado no livro).
for(const e of expectations){
  const c=byId[e.id]; A(!!c,`${e.id}: fixture missing`);
  EQ(c.chart.housesData.houseSystem,'Regiomontanus',`${e.id}: house system`);
  const expected=(signStart[e.publishedAsc.sign]+e.publishedAsc.degree)%360;
  A(circ(c.chart.housesData.ascendant,expected)<1.0,`${e.id}: ASC differs >=1 degree: got ${c.chart.housesData.ascendant}, expected ~${expected}`);
}

const dossiers={};
for(const c of cases) dossiers[c.id]=h.evaluateHorary({chart:c.chart,context:c.context});

// 1. Campeão: X/IV, antíscio da Lua angular na X e próximo de Mercúrio, YES.
{
 const d=dossiers['M-HE-CHAMPION']; EQ(sig(d,'champion').house,10,'champion H10'); EQ(sig(d,'challenger').house,4,'challenger H4');
 EQ(sig(d,'champion').planet,'moon','champion Moon'); EQ(sig(d,'challenger').planet,'saturn','challenger Saturn');
 A(!!tst(d,'competition-champion-antiscion-angular'),'champion antiscion angular missing'); A(!!tst(d,'competition-champion-antiscion-contact'),'champion antiscion Mercury contact missing'); EQ(d.judgement.answer,'YES','champion outcome');
}
// 2. Brasil: L1 Mars não alcança L10 Saturno; Lua vai a Saturno e Vênus está na cúspide X => NO.
{
 const d=dossiers['M-HE-BRAZIL']; EQ(sig(d,'querent').planet,'mars','Brazil L1 Mars'); EQ(sig(d,'victory').planet,'saturn','victory L10 Saturn');
 A(!h.aspectBetween(byId['M-HE-BRAZIL'].chart,'mars','saturn'),'Brazil Mars/Saturn should not behold'); A(!!tst(d,'competition-moon-to-victory'),'Moon to victory missing'); A(!!tst(d,'competition-other-on-victory-cusp'),'other team at H10 missing'); EQ(d.judgement.answer,'NO','Brazil outcome');
}
// 5. Trip x negócio snapshot: o motor deve preferir viagem por condição, antes mesmo da cronologia de tradução.
{
 const d=dossiers['M-HE-TRIP-BUSINESS']; EQ(sig(d,'alternative:trip').planet,'jupiter','trip Jupiter'); EQ(sig(d,'alternative:business').planet,'mars','business Mars'); EQ(sig(d,'alternative:business:profit').planet,'venus','business profit Venus');
 A(sig(d,'alternative:trip').essential.exaltation,'trip Jupiter should be exalted'); A(sig(d,'alternative:business').essential.detriment,'business Mars detriment'); A(sig(d,'alternative:business:profit').essential.detriment,'business profit Venus detriment');
 EQ(tst(d,'choice-preferred-alternative')?.data?.preferred,'trip','trip should be preferred');
}
// 7. Bebê: V, XII de childbed, VII médico e variante VI; Vênus forte e dois arcos de ~1 unidade.
{
 const d=dossiers['M-HE-BABY']; EQ(sig(d,'child').house,5,'child H5'); EQ(sig(d,'childbed').house,12,'childbed H12'); EQ(sig(d,'doctor_treating_case').house,7,'doctor H7'); EQ(sig(d,'surgery_marcos_variant').house,6,'surgery variant H6');
 EQ(sig(d,'child').planet,'venus','child Venus'); A(sig(d,'child').essential.domicile,'child Venus domicile');
 const a1=tst(d,'pregnancy-mother-surgery-aspect')?.data?.aspect?.degreesToPerfection, a2=tst(d,'pregnancy-child-childbed-aspect')?.data?.aspect?.degreesToPerfection; A(a1>.7&&a1<1.7,'mother/surgery arc about one'); A(a2>.7&&a2<1.7,'child/childbed arc about one'); A((d.judgement.timing??'').includes('days'),'baby timing should expose days context');
}
// 8. Estômago: paciente e órgão podem compartilhar Vênus sem self-aspect; combustão + Marte/dispositor + quente/seco.
{
 const d=dossiers['M-HE-STOMACH']; EQ(sig(d,'patient').planet,'venus','patient Venus'); EQ(sig(d,'organ').planet,'venus','organ Venus');
 A(!d.directPerfections.some(e=>e.a===e.b),'self-aspect must never exist'); A(sig(d,'organ').accidental.combust,'organ Venus combust'); A(!!tst(d,'medical-nature-mismatch'),'medical nature mismatch'); A(!!tst(d,'medical-combustion-cause'),'medical Sun afflictor'); EQ(tst(d,'medical-sign-dispositor-cause')?.data?.dispositor,'mars','Mars cause'); A(!!tst(d,'medical-hot-dry-excess'),'hot/dry chain');
}
// 10. Internet snapshot: H6 Mercury, Gemini loud -> Cancer mute; 5.5-ish symbolic units.
{
 const d=dossiers['M-HE-INTERNET']; EQ(sig(d,'quesited').house,6,'internet H6'); EQ(sig(d,'quesited').planet,'mercury','internet Mercury'); const tr=tst(d,'custom-sign-change-trigger');
 EQ(tr?.data?.fromVoice,'loud','Gemini voiced'); EQ(tr?.data?.toVoice,'mute','Cancer mute'); A(tr?.data?.degreesToSignChange>5&&tr?.data?.degreesToSignChange<6.2,'Mercury sign-exit ~5.5deg'); A((d.judgement.timing??'').startsWith('5.61'),'symbolic timing should be ~5.61'); EQ(d.judgement.answer,'YES','assumed cutoff event');
}

// Swiss Ephemeris future chronology. Prefer live PySwissEph audit; fallback to committed event fixture when unavailable.
let pythonSwiss=false;try{execFileSync('python',['-c','import swisseph'],{stdio:'ignore'});pythonSwiss=true}catch{}
const chronoIds=['M-HE-TRIAL','M-HE-BET','M-HE-TRIP-BUSINESS','M-HE-REL','M-HE-DARRYL','M-HE-INTERNET'];
let eventMap={};
if(pythonSwiss){
 const py=spawn('python',[path.join(root,'scripts/swiss-bridge.py')],{stdio:['pipe','pipe','inherit']}); const rl=readline.createInterface({input:py.stdout}); const pending=[];
 rl.on('line',line=>{const p=pending.shift();if(!p)return;try{const x=JSON.parse(line);x.ok?p.resolve(x.out):p.reject(new Error(x.error));}catch(e){p.reject(e);}});
 const provider=(jd,types)=>new Promise((resolve,reject)=>{pending.push({resolve,reject});py.stdin.write(JSON.stringify({jd,types})+'\n');});
 for(const id of chronoIds){const c=byId[id],d=dossiers[id];eventMap[id]=await h.buildHoraryChronology(c.chart,d,provider,{horizonDays:15,stepDays:.25});}
 py.stdin.end();
 fs.writeFileSync(path.join(root,'fixtures/horary/marcos-e2e-chronology.json'),JSON.stringify(eventMap,null,2));
}else{
 eventMap=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/marcos-e2e-chronology.json'),'utf8'));
}
for(const id of chronoIds) dossiers[id]=h.applyChronology(dossiers[id],eventMap[id]);

// 3. Processo: contra-antíscio Lua/Mercúrio < Lua/Marte; Mercúrio/Saturno < Vênus/Saturno; proibição da proibição; NO.
{
 const d=dossiers['M-HE-TRIAL'],ev=eventMap['M-HE-TRIAL']; const lm=ev.find(e=>e.kind==='contra_antiscion'&&pair(e,'moon','mercury')); const lma=ev.find(e=>e.kind==='aspect'&&pair(e,'moon','mars')&&e.aspect==='square'); const ms=ev.find(e=>e.kind==='aspect'&&pair(e,'mercury','saturn')); const vs=ev.find(e=>e.kind==='aspect'&&pair(e,'venus','saturn'));
 A(lm&&lma&&ms&&vs,'trial sequence events missing'); LT(lm.daysFromQuestion,lma.daysFromQuestion,'Moon/Mercury contra before Moon/Mars'); LT(lm.daysFromQuestion,ms.daysFromQuestion,'Moon/Mercury intercepts Mercury before judge'); LT(ms.daysFromQuestion,vs.daysFromQuestion,'Mercury would reach judge before Venus without prior interception'); A(med(d,'prohibition_of_prohibition').length>=1,'prohibition of prohibition missing'); EQ(d.judgement.answer,'NO','trial outcome');
}
// 4. Aposta: Vênus estaciona, e não há oposição real Vênus/Júpiter antes disso => refranação/NO. O texto publicado contém conflito interno sobre VOC da Lua.
{
 const d=dossiers['M-HE-BET'],ev=eventMap['M-HE-BET']; const st=ev.find(e=>e.kind==='station'&&e.planets.includes('venus')); const vj=ev.find(e=>e.kind==='aspect'&&pair(e,'venus','jupiter')&&e.aspect==='opposition'); A(!!st,'Venus station missing'); A(!vj||st.daysFromQuestion<vj.daysFromQuestion,'Venus must station before any Venus/Jupiter opposition'); A(med(d,'refranation').length>=1,'bet refranation missing'); EQ(d.judgement.answer,'NO','bet outcome');
 // Fonte diz VOC, mas o próprio mapa publicado/Swiss tem sextil Lua-Saturno antes da saída do signo. Não adulterar o cálculo para imitar a inconsistência textual.
 EQ(d.moonVoidOfCourse,false,'Swiss chart has Moon-Saturn sextile, so Moon is not strict VOC'); const ms=ev.find(e=>e.kind==='aspect'&&pair(e,'moon','saturn')&&e.aspect==='sextile'); A(ms&&ms.daysFromQuestion<0.25,'Moon/Saturn sextile should perfect ~0.16d'); sourceDiscrepancies++;
}
// 5b. Escolha: Lua encontra Marte e depois Sol/L2 sem mudar de signo => tradução futura real; negócio prejudica dinheiro.
{
 const d=dossiers['M-HE-TRIP-BUSINESS'],ev=eventMap['M-HE-TRIP-BUSINESS']; const mm=ev.find(e=>e.kind==='aspect'&&pair(e,'moon','mars')); const ms=ev.find(e=>e.kind==='aspect'&&pair(e,'moon','sun')); A(mm&&ms,'trip/business Moon sequence missing'); LT(mm.daysFromQuestion,ms.daysFromQuestion,'Moon should hit business then L2'); A(med(d,'translation').some(x=>x.mediator==='moon'),'chronological translation missing'); A(d.judgement.reasons.some(x=>x.includes('prejudicar o dinheiro')),'negative business-to-money reception missing');
}
// 6. Comunicação: Vênus mudará de signo antes do trígono exato com Lua; Saturno/Vênus estão mute/weak; recepções negativas; NO.
{
 const d=dossiers['M-HE-REL'],ev=eventMap['M-HE-REL']; const vc=ev.find(e=>e.kind==='sign_change'&&e.planets.includes('venus')); const vm=ev.find(e=>e.kind==='aspect'&&pair(e,'venus','moon')&&e.aspect==='trine'); A(vc&&vm,'relationship Venus/Moon events missing'); LT(vc.daysFromQuestion,vm.daysFromQuestion,'Venus sign change must precede apparent Moon trine'); A(med(d,'frustration').length>=1,'relationship frustration missing'); A(tst(d,'relationship-other-to-moon')?.data?.reception?.disposition?.includes('negative'),'Saturn->Moon negative reception'); A(tst(d,'relationship-woman-to-querent')?.data?.reception?.disposition?.includes('negative'),'Venus->Sun negative reception'); EQ(d.judgement.answer,'NO','communication outcome');
}
// 9. Darryl: Mercury/Mars +2.55d and Sun/Saturn antiscion +1.01d both before Mercury/Saturn +6.60d; NO to death.
{
 const d=dossiers['M-HE-DARRYL'],ev=eventMap['M-HE-DARRYL']; const mm=ev.find(e=>e.kind==='aspect'&&pair(e,'mercury','mars')&&e.aspect==='conjunction'); const ss=ev.find(e=>e.kind==='antiscion'&&pair(e,'sun','saturn')); const mSat=ev.find(e=>e.kind==='aspect'&&pair(e,'mercury','saturn')); A(mm&&ss&&mSat,'Darryl death sequence missing'); LT(ss.daysFromQuestion,mSat.daysFromQuestion,'Sun/Saturn antiscion before death contact'); LT(mm.daysFromQuestion,mSat.daysFromQuestion,'Mercury/Mars prohibition before death contact'); A(med(d,'prohibition').some(x=>x.statement.includes('Mercúrio e Marte')),'Mercury/Mars prohibition not materialized'); A(med(d,'prohibition').some(x=>x.statement.includes('Sol e Saturno')),'Sun/Saturn antiscion interposition not materialized'); EQ(d.judgement.answer,'NO','Darryl survives / death NO');
}
// 10b. O ingresso astronômico real é mais tarde por causa da estação; não deve substituir os 5.61 graus simbólicos da horária.
{
 const d=dossiers['M-HE-INTERNET'],ev=eventMap['M-HE-INTERNET']; const ing=ev.find(e=>e.kind==='sign_change'&&e.planets.includes('mercury')); A(ing&&ing.daysFromQuestion>10&&ing.daysFromQuestion<12,'Mercury actual ingress ~11.3 days'); A((d.judgement.timing??'').startsWith('5.61'),'chronology must not overwrite symbolic 5.61 units');
}

const results=expectations.map(e=>({id:e.id,title:byId[e.id].title,ascendant:byId[e.id].chart.housesData.ascendant,answer:dossiers[e.id].judgement.answer,timing:dossiers[e.id].judgement.timing??null,roles:Object.fromEntries(dossiers[e.id].significators.map(s=>[s.role,{house:s.house,planet:s.planet}])),mediation:dossiers[e.id].mediation.map(m=>({kind:m.kind,statement:m.statement})),reasons:dossiers[e.id].judgement.reasons,sourceInternalConflict:e.sourceInternalConflict??null}));
fs.writeFileSync(path.join(root,'fixtures/horary/marcos-e2e-certified-results.json'),JSON.stringify(results,null,2));
console.log(`HORARY_MARCOS_E2E_OK cases=${cases.length} assertions=${assertions} chronology=${pythonSwiss?'live-pyswisseph':'committed-fixture'} source_discrepancies=${sourceDiscrepancies}`);
