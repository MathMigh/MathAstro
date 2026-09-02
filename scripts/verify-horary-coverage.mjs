import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();
const types=fs.readFileSync(path.join(root,'src/traditions/western/horary/types.ts'),'utf8');
const cov=fs.readFileSync(path.join(root,'src/traditions/western/horary/coverage.ts'),'utf8');
const m=types.match(/export type HoraryTopic =([\s\S]*?);\n/);if(!m)throw new Error('HoraryTopic union not found');
const topics=[...m[1].matchAll(/"([a-z_]+)"/g)].map(x=>x[1]);
const missing=topics.filter(t=>!new RegExp(`\\b${t}:\\{status:`).test(cov));
if(missing.length){console.error('HORARY_COVERAGE_FAIL missing='+missing.join(','));process.exit(1)}
const counts={};for(const t of topics){const mm=cov.match(new RegExp(`\\b${t}:\\{status:\"([^\"]+)\"`));counts[mm?.[1]??'unknown']=(counts[mm?.[1]??'unknown']??0)+1;}
console.log(`HORARY_COVERAGE_OK topics=${topics.length} `+Object.entries(counts).map(([k,v])=>`${k}=${v}`).join(' '));
