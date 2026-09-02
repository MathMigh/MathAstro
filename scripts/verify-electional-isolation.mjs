import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const root=process.cwd();
const manifest=fs.readFileSync(path.join(root,'docs/ELECTIONAL_PROTECTED_HASHES.sha256'),'utf8').trim().split(/\r?\n/).filter(Boolean);
let bad=[];
for(const line of manifest){
  const m=line.match(/^([a-f0-9]{64})\s{2}(.+)$/); if(!m){bad.push(`manifesto inválido: ${line}`);continue;}
  const [,expected,rel]=m; const abs=path.join(root,rel);
  if(!fs.existsSync(abs)){bad.push(`ausente: ${rel}`);continue;}
  const got=crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
  if(got!==expected) bad.push(`alterado: ${rel}`);
}
const roots=['src/traditions/western/electional','src/app/api/electional','src/app/ocidental/eletiva'];
const forbidden=[/natalAnalysis/i,/natalPrecision/i,/natalTechnicalReport/i,/SinastryChart/i,/Synastry/i,/calculateNatalAnalysis/i,/horaryCalculations/i,/calculateHoraryVerdict/i];
function walk(p){let out=[]; if(!fs.existsSync(p))return out; for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name); if(e.isDirectory())out.push(...walk(q));else if(/\.(ts|tsx|js|mjs)$/.test(e.name))out.push(q);} return out;}
for(const relRoot of roots) for(const f of walk(path.join(root,relRoot))){
  const text=fs.readFileSync(f,'utf8');
  for(const rx of forbidden) if(rx.test(text)) bad.push(`import/referência proibida ${rx} em ${path.relative(root,f)}`);
}
if(bad.length){console.error('ELECTIONAL ISOLATION: FAIL');for(const x of bad)console.error('-',x);process.exit(1);}
console.log(`ELECTIONAL ISOLATION: PASS (${manifest.length} arquivos protegidos íntegros; sem imports proibidos).`);
