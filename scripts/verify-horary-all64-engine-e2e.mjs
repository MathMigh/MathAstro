import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'.audit','horary-runtime-all64-engine-e2e');
fs.rmSync(runtime,{recursive:true,force:true});
execFileSync('tsc',['-p',path.join(root,'.audit','tsconfig-horary-runtime.json'),'--outDir',runtime],{stdio:'inherit'});
fs.mkdirSync(path.join(runtime,'node_modules','@'),{recursive:true});
for(const p of ['app','interfaces']){const target=path.join(runtime,'node_modules','@',p);try{fs.unlinkSync(target)}catch{}fs.symlinkSync(path.join('..','..','src',p),target,'dir');}
const h=await import(path.join(runtime,'src','traditions','western','horary','index.js'));
const cases=JSON.parse(fs.readFileSync(path.join(root,'fixtures/horary/horary-examples-all-swiss.json'),'utf8'));
assert.equal(cases.length,64);
let canJudge=0,semanticCases=0,compiledRoles=0,aiReady=0;
const failures=[];
for(const c of cases){
 try{
  const d=h.evaluateHorary({chart:c.chart,context:c.context});
  if(d.judgement.canJudge) canJudge++; else failures.push({id:c.id,topic:c.context.topic,unresolved:d.topicAnalysis.unresolvedContext});
  assert.equal(d.houseAtlas.length,12,`${c.id}: house atlas`);
  assert.equal(d.topicAnalysis.semanticFrame.requiresInterpretiveLayer,true,`${c.id}: semantic contract`);
  const ai=h.buildHoraryAIHandoff(d);
  assert.equal(ai.machineJudgementIsAdvisory,true,`${c.id}: AI judgement boundary`);
  assert(ai.interpretiveTasks.length>=2,`${c.id}: AI tasks`);
  assert(ai.outputContract.requiredFields.includes("causalChain"),`${c.id}: AI output contract`);
  aiReady++;
  if(c.context.semanticRoles?.length){semanticCases++;compiledRoles+=d.topicAnalysis.semanticFrame.compiledRoles.length;assert(d.topicAnalysis.semanticFrame.compiledRoles.length>=c.context.semanticRoles.length,`${c.id}: semantic roles not compiled`);}
 }catch(error){failures.push({id:c.id,crash:error instanceof Error?error.message:String(error)});}
}
if(failures.length){console.error('HORARY_ALL64_ENGINE_E2E_FAIL',JSON.stringify(failures,null,2));process.exit(1);}
assert.equal(canJudge,64);
assert.equal(aiReady,64);
console.log(`HORARY_ALL64_ENGINE_E2E_OK cases=64 canJudge=64 aiHandoff=64 semanticCases=${semanticCases} compiledSemanticRoles=${compiledRoles} crashes=0`);
