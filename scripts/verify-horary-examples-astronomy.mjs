import assert from 'node:assert/strict';
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cases=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/horary-examples-all-swiss.json'),'utf8'));
assert.equal(cases.length,64,'expected 64 Horary Examples charts');
let assertions=1, conflicts=0;
const A=(x,m)=>{assert(x,m);assertions++};
const circ=(a,b)=>{let d=Math.abs(a-b)%360;return Math.min(d,360-d)};
for(const c of cases){
 A(c.chart.housesData.houseSystem==='Regiomontanus',`${c.id}: not Regiomontanus`);
 A(Number.isFinite(c.chart.calculationMetadata.julianDayUt),`${c.id}: missing JD`);
 A(c.chart.planets.length>=12,`${c.id}: incomplete sky`);
 if(c.id==='HE-10'){
  conflicts++;
  A(c.sourceInternalConflict?.field==='ascendant','HE-10 source conflict not recorded');
  // Embedded source chart shows 9°14 Cancer; the prose says 19 Cancer. Swiss matches the chart itself.
  const imageAsc=90+9+14/60;
  A(circ(c.computedAsc,imageAsc)<0.25,`HE-10 Swiss ASC does not match chart image: ${c.computedAsc}`);
 } else {
  A(c.ascDeltaDegrees<1.25,`${c.id}: ASC differs too much from published rounded value: ${c.ascDeltaDegrees}`);
 }
}
console.log(`HORARY_EXAMPLES_ASTRONOMY_OK cases=${cases.length} asc_reconstructed=64 source_conflicts=${conflicts} tolerance=1.25deg`);
