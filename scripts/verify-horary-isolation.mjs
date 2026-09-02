import fs from "node:fs"; import path from "node:path";
const root=path.join(process.cwd(),"src","traditions","western","horary");
const files=fs.readdirSync(root).filter(x=>x.endsWith(".ts"));
const forbidden=[/natalAnalysis/i,/natalPrecision/i,/natalTechnicalReport/i,/western\/electional/i,/Sinastry/i,/synastry/i,/traditionalTemperament/i,/HoraryInterfaces/i,/app\/lib\/horaryCalculations/i,/app\/lib\/horaryReport/i];
const hits=[];
const legacy=["src/app/lib/horaryCalculations.ts","src/app/lib/horaryReport.ts","src/interfaces/HoraryInterfaces.ts"];
const presentLegacy=legacy.filter(x=>fs.existsSync(path.join(process.cwd(),x)));
if(presentLegacy.length){console.error("HORARY_ISOLATION_FAIL legacy-present="+presentLegacy.join(","));process.exit(1)}

for(const f of files){const text=fs.readFileSync(path.join(root,f),"utf8");for(const rx of forbidden)if(rx.test(text))hits.push(`${f}: ${rx}`)}
if(hits.length){console.error("HORARY_ISOLATION_FAIL\n"+hits.join("\n"));process.exit(1)}
console.log(`HORARY_ISOLATION_OK files=${files.length} legacy=not-imported natal/electional/synastry=isolated`);
