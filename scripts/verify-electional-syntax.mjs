import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=process.cwd(); const dirs=['src/traditions/western/electional','src/app/api/electional','src/app/ocidental/eletiva'];
function walk(p){let out=[];for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name);if(e.isDirectory())out.push(...walk(q));else if(/\.tsx?$/.test(e.name))out.push(q);}return out;}
let errors=[];
for(const dir of dirs){if(!fs.existsSync(dir))continue;for(const f of walk(dir)){
 const source=fs.readFileSync(f,'utf8');
 const r=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true,fileName:f});
 for(const d of r.diagnostics??[]) if(d.category===ts.DiagnosticCategory.Error) errors.push(`${f}: ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('ELECTIONAL SYNTAX: PASS');
