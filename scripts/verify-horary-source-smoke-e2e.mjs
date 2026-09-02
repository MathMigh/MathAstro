import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'.audit','horary-runtime-source-smoke-e2e');
fs.rmSync(runtime,{recursive:true,force:true});
execFileSync('tsc',['-p',path.join(root,'.audit','tsconfig-horary-runtime.json'),'--outDir',runtime],{stdio:'inherit'});
fs.mkdirSync(path.join(runtime,'node_modules','@'),{recursive:true});
for(const p of ['app','interfaces']){const target=path.join(runtime,'node_modules','@',p);try{fs.unlinkSync(target)}catch{}fs.symlinkSync(path.join('..','..','src',p),target,'dir');}
const h=await import(path.join(runtime,'src','traditions','western','horary','index.js'));
const cases=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/source-smoke-e2e-swiss.json'),'utf8'));
const byId=Object.fromEntries(cases.map(c=>[c.id,c]));
const signStart={Aries:0,Taurus:30,Gemini:60,Cancer:90,Leo:120,Virgo:150,Libra:180,Scorpio:210,Sagittarius:240,Capricorn:270,Aquarius:300,Pisces:330};
const circ=(a,b)=>{let d=Math.abs(a-b)%360;return Math.min(d,360-d)};
let assertions=0; const A=(x,m)=>{assert(x,m);assertions++}; const EQ=(a,b,m)=>{assert.equal(a,b,m);assertions++};
const sig=(d,r)=>d.significators.find(s=>s.role===r); const tst=(d,id)=>d.testimonies.find(t=>t.id===id);
for(const c of cases){
 const expected=signStart[c.publishedAsc.sign]+c.publishedAsc.degree;
 A(circ(c.chart.housesData.ascendant,expected)<1,`${c.id}: ASC mismatch got=${c.chart.housesData.ascendant} expected~=${expected}`);
 EQ(c.chart.housesData.houseSystem,'Regiomontanus',`${c.id}: house system`);
}
const dossiers=Object.fromEntries(cases.map(c=>[c.id,h.evaluateHorary({chart:c.chart,context:c.context})]));
// Authenticity: supplier's goods = H8; Mercury has only minor term dignity; fallen Venus within 5° of H8 cusp counts in H8 and afflicts product house => not original.
{
 const c=byId['HE-AUTH'],d=dossiers['HE-AUTH']; EQ(sig(d,'product').house,8,'auth product H8'); EQ(sig(d,'product').planet,'mercury','auth product Mercury'); A(sig(d,'product').essential.term,'auth Mercury term dignity'); A(!sig(d,'product').essential.domicile&&!sig(d,'product').essential.exaltation,'auth product lacks major dignity');
 EQ(h.planetHouse(c.chart,h.planet(c.chart,'venus').longitudeRaw),8,'5-degree cusp rule must place Venus in H8'); A(h.essentialCondition(c.chart,'venus').fall,'Venus in Virgo fall'); A(!!tst(d,'authenticity-house-affliction'),'auth H8 affliction missing'); EQ(d.judgement.answer,'NO','authenticity outcome');
}
// Funded spot: daughter H5; government money H11. Daughter/Sun is about to enter exaltation; source case does not require funding aspect.
{
 const d=dossiers['HE-FUNDED']; EQ(sig(d,'grant_recipient').house,5,'funded daughter H5'); EQ(sig(d,'grant_recipient').planet,'sun','funded daughter Sun'); EQ(sig(d,'government_gift').house,11,'funding H11'); const t=tst(d,'grant-recipient-imminent-change'); A(t&&t.data.degreesToSignExit<.5,'funded recipient imminent sign change'); EQ(d.judgement.answer,'YES','funded outcome');
}
// Delivery: package remains seller's possession = H8; Moon applies by trine in ~6 degrees; hours forced by question.
{
 const d=dossiers['HE-DELIVERY']; EQ(sig(d,'package').house,8,'delivery package H8'); EQ(sig(d,'package').planet,'saturn','delivery package Saturn'); const t=tst(d,'delivery-moon-package'); A(t?.data?.aspect?.applying===true,'delivery Moon applies'); EQ(t?.data?.aspect?.aspect,'trine','delivery trine'); const deg=t?.data?.aspect?.degreesToPerfection; A(deg>5&&deg<6.5,'delivery ~6 degrees'); EQ(d.judgement.answer,'YES','delivery outcome'); A((d.judgement.timing??'').startsWith('5.76'),'delivery symbolic timing ~5.76');
}
// Power cut: artificial light = natural Moon; source times return by its ~11-degree contact with Ascendant, not generic service-provider L6.
{
 const d=dossiers['HE-POWER']; const t=tst(d,'custom-cusp-contact-trigger'); EQ(t?.data?.planet,'moon','power natural Moon'); EQ(t?.data?.house,1,'power Asc/H1'); A(t?.data?.degreesToCusp>10.5&&t?.data?.degreesToCusp<12.5,'power cusp distance ~11 degrees'); EQ(d.judgement.answer,'YES','power outcome'); A((d.judgement.timing??'').startsWith('11.73'),'power timing ~11.73');
}
// Kidnapped priest: identify him as mother's cousin = radical H12; inspect radical and turned H8; self-rulership of turned H8 cannot create self-aspect; survival first, then release timing by Venus leaving Libra ~21 units.
{
 const d=dossiers['HE-KIDNAP']; EQ(sig(d,'kidnapped_person').house,12,'kidnapped relative H12'); EQ(sig(d,'kidnapped_person').planet,'venus','kidnapped Venus'); EQ(sig(d,'radical_death').house,8,'kidnap radical H8'); EQ(sig(d,'radical_death').planet,'mercury','kidnap radical death Mercury'); EQ(sig(d,'turned_death').house,7,'kidnap turned H8 -> radical H7'); EQ(sig(d,'turned_death').planet,'venus','kidnap turned death same Venus'); A(!!tst(d,'kidnap-turned-death-self'),'kidnap self-aspect guard missing'); A(!d.directPerfections.some(e=>e.a===e.b),'kidnap no self-aspect'); EQ(d.judgement.answer,'YES','kidnap survival/release possibility'); const tr=tst(d,'custom-sign-change-trigger'); A(tr?.data?.degreesToSignChange>20&&tr?.data?.degreesToSignChange<22,'kidnap release ~21 units'); A((d.judgement.timing??'').startsWith('20.84'),'kidnap timing ~20.84');
}
console.log(`HORARY_SOURCE_SMOKE_E2E_OK cases=${cases.length} assertions=${assertions} sources=Frawley+Silvestre+Cuperman+Morrissey`);
