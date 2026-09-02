import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const matrixPath = path.join(root,'fixtures/horary/horary-examples-category-matrix.json');
const typesPath = path.join(root,'src/traditions/western/horary/types.ts');
const ontologyPath = path.join(root,'src/traditions/western/horary/ontology.ts');
const coveragePath = path.join(root,'src/traditions/western/horary/coverage.ts');

const fail=(m)=>{throw new Error(`HORARY_SOURCE_CASE_COVERAGE_FAIL ${m}`)};
const cases=JSON.parse(fs.readFileSync(matrixPath,'utf8'));
if(!Array.isArray(cases)) fail('matrix-not-array');
if(cases.length!==64) fail(`expected-64-cases got=${cases.length}`);

const ids=new Set();
for(let i=0;i<cases.length;i++){
  const c=cases[i];
  const expected=`HE-${String(i+1).padStart(2,'0')}`;
  if(c.id!==expected) fail(`non-sequential-id expected=${expected} got=${c.id}`);
  if(ids.has(c.id)) fail(`duplicate-id=${c.id}`); ids.add(c.id);
  if(!c.section?.trim()) fail(`missing-section id=${c.id}`);
  if(!c.title?.trim()) fail(`missing-title id=${c.id}`);
  if(!Array.isArray(c.topics)||!c.topics.length) fail(`unmapped-topic id=${c.id}`);
  if(!Array.isArray(c.intents)||!c.intents.length) fail(`unmapped-intent id=${c.id}`);
  if(c.topics.some(x=>x==='unmapped'||!String(x).trim())) fail(`invalid-topic id=${c.id}`);
  if(c.intents.some(x=>x==='unmapped'||!String(x).trim())) fail(`invalid-intent id=${c.id}`);
}

const types=fs.readFileSync(typesPath,'utf8');
const topicBlock=types.match(/export type HoraryTopic\s*=([\s\S]*?);\s*\n\nexport type HoraryIntent/);
if(!topicBlock) fail('HoraryTopic-union-not-found');
const topics=new Set([...topicBlock[1].matchAll(/"([a-z0-9_]+)"/g)].map(m=>m[1]));
const intentBlock=types.match(/export type HoraryIntent\s*=([\s\S]*?);\s*\n\nexport type HoraryCategoryFamily/);
if(!intentBlock) fail('HoraryIntent-union-not-found');
const intents=new Set([...intentBlock[1].matchAll(/"([a-z0-9_]+)"/g)].map(m=>m[1]));
for(const c of cases){
  for(const t of c.topics) if(!topics.has(t)) fail(`unknown-topic id=${c.id} topic=${t}`);
  for(const i of c.intents) if(!intents.has(i)) fail(`unknown-intent id=${c.id} intent=${i}`);
}

const ontology=fs.readFileSync(ontologyPath,'utf8');
const coverage=fs.readFileSync(coveragePath,'utf8');
for(const t of topics){
  const q=`${t}:`;
  if(!ontology.includes(q)) fail(`ontology-missing topic=${t}`);
  if(!coverage.includes(q)) fail(`coverage-missing topic=${t}`);
}

const expectedSections=['Contests','Money & Jobs','Housing','Relationship','Pregnancy & Children','Health','Lost & Found','Miscellaneous'];
const sections=new Set(cases.map(c=>c.section));
for(const s of expectedSections) if(!sections.has(s)) fail(`section-missing=${s}`);
if(sections.size!==expectedSections.length) fail(`unexpected-section-count=${sections.size}`);

const requiredSourcePresets=['election','government_grant','delivery','authenticity','kidnapping','service_change'];
const used=new Set(cases.flatMap(c=>c.topics));
for(const t of requiredSourcePresets) if(!used.has(t)) fail(`source-preset-unused=${t}`);

const composite=cases.filter(c=>c.topics.length>1).length;
const topicUsage=[...used].sort();
console.log(`HORARY_SOURCE_CASE_COVERAGE_OK cases=${cases.length} sections=${sections.size} unmapped=0 used_topics=${used.size} composites=${composite}`);
console.log(`HORARY_SOURCE_CASE_TOPICS ${topicUsage.join(',')}`);
