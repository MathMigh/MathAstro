import fs from "node:fs";import path from "node:path";
const root=path.join(process.cwd(),"src","traditions","western","horary");
const all=fs.readdirSync(root).filter(x=>x.endsWith(".ts")).map(x=>fs.readFileSync(path.join(root,x),"utf8")).join("\n");
const required=["HORARY_ONLY","Regiomontanus","Recepção","score totalizador","psychic_attack","inheritance","work_relationship","dream_meaning","prison","surgery","tax","wish"];
const missing=required.filter(x=>!all.includes(x));
if(missing.length){console.error("HORARY_CONTRACT_FAIL missing="+missing.join(","));process.exit(1)}
console.log("HORARY_CONTRACT_OK core-guards=present topic-gaps=explicit");
