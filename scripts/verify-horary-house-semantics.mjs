import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const text=fs.readFileSync(path.join(root,'src/traditions/western/horary/houseSemantics.ts'),'utf8');
const types=fs.readFileSync(path.join(root,'src/traditions/western/horary/types.ts'),'utf8');
const router=fs.readFileSync(path.join(root,'src/traditions/western/horary/router.ts'),'utf8');
const report=fs.readFileSync(path.join(root,'src/traditions/western/horary/report.ts'),'utf8');
const houses=[...text.matchAll(/\{house:(\d+),principle:/g)].map(m=>Number(m[1]));
const keys=[...text.matchAll(/meaning\("([a-z0-9_]+)"/g)].map(m=>m[1]);
const errors=[];
if(houses.length!==12||new Set(houses).size!==12||Math.min(...houses)!==1||Math.max(...houses)!==12) errors.push(`houses=${houses.join(',')}`);
if(keys.length<100||new Set(keys).size!==keys.length) errors.push(`semanticKeys=${keys.length} unique=${new Set(keys).size}`);
for(const token of ['requiresInterpretiveLayer:true','Não virar casas inutilmente','dual_radical_and_turned','semanticAmbiguity:']) if(!text.includes(token)) errors.push(`missing:${token}`);
for(const token of ['semanticRoles?: HorarySemanticRoleSpec[]','semanticAmbiguities?: HorarySemanticAmbiguity[]','houseAtlas: HoraryHouseAtlasEntry[]']) if(!types.includes(token)) errors.push(`types:${token}`);
for(const token of ['compileHorarySemanticFrame','semanticFrame.houseAssignments','o texto livre não foi usado como classificador oculto']) if(!router.includes(token)) errors.push(`router:${token}`);
for(const token of ['ATLAS SEMÂNTICO DAS 12 CASAS','FRAME SEMÂNTICO RESOLVIDO']) if(!report.includes(token)) errors.push(`report:${token}`);
if(/concreteQuestion[^\n]{0,120}(includes|match|test)\(/.test(text)) errors.push('lexical-guesser-detected');
if(errors.length){console.error('HORARY_HOUSE_SEMANTICS_FAIL',errors);process.exit(1);}
console.log(`HORARY_HOUSE_SEMANTICS_OK houses=${houses.length} semanticKeys=${keys.length} recursive-turning=on ambiguity-gate=on lexical-guesser=off`);
