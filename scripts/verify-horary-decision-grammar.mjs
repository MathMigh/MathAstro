import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const ont=fs.readFileSync(path.join(root,'src/traditions/western/horary/ontology.ts'),'utf8');
const grammar=fs.readFileSync(path.join(root,'src/traditions/western/horary/decisionGrammar.ts'),'utf8');
const types=fs.readFileSync(path.join(root,'src/traditions/western/horary/types.ts'),'utf8');
const union=(types.match(/export type HoraryTopic =([\s\S]*?);\n\nexport type HoraryIntent/)||[])[1]||'';
const topics=[...union.matchAll(/"([a-z0-9_]+)"/g)].map(m=>m[1]);
const presetBlock=(ont.match(/HORARY_TOPIC_ONTOLOGY:[\s\S]*?= \{([\s\S]*?)\n\};/)||[])[1]||'';
const presets=[...presetBlock.matchAll(/^\s{2}([a-z0-9_]+):\{/gm)].map(m=>m[1]);
const missing=topics.filter(t=>!presets.includes(t));
const extra=presets.filter(t=>!topics.includes(t));
const intentBlock=(types.match(/export type HoraryIntent =([\s\S]*?);\n\nexport type HoraryCategoryFamily/)||[])[1]||'';
const intents=[...intentBlock.matchAll(/"([a-z0-9_]+)"/g)].map(m=>m[1]);
const unmappedIntent=intents.filter(i=>!new RegExp(`\\b${i}:\\"[A-Z_]+\\"`).test(grammar));
const archetypes=[...grammar.matchAll(/\| "([A-Z_]+)"/g)].map(m=>m[1]);
const uniqueArch=[...new Set(archetypes)];
if(missing.length||extra.length||unmappedIntent.length||uniqueArch.length<10){
 console.error('HORARY_DECISION_GRAMMAR_FAIL',{missing,extra,unmappedIntent,archetypes:uniqueArch.length});process.exit(1);
}
console.log(`HORARY_DECISION_GRAMMAR_OK topics=${topics.length} intents=${intents.length} archetypes=${uniqueArch.length} all-topics-compiled=contractual`);
