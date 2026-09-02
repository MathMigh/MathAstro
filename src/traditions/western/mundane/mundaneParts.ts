import { rulerForLongitude, normalize360, signName } from "@/traditions/western/predictive/predictiveAstronomy";
import type { PredictiveSkySnapshot } from "@/traditions/western/predictive/predictiveTypes";
import type { MundaneAuthorMode, MundaneFocus, MundaneInput, MundanePartRecord } from "./mundaneTypes";

function point(sky:PredictiveSkySnapshot,name:string):number{
  if(name==="ASC") return sky.angles.find(x=>x.key==="asc")!.longitude;
  if(name==="MC") return sky.angles.find(x=>x.key==="mc")!.longitude;
  if(name==="CUSP8") return sky.cusps[7].longitude;
  const p=sky.planets.find(x=>x.name===name); if(!p) throw new Error(`Ponto ausente: ${name}`); return p.longitude;
}
function lot(a:number,b:number,c:number){return normalize360(a+b-c);}
function isDayChart(sky:PredictiveSkySnapshot){
  const sun=sky.planets.find(x=>x.name==="Sol")!;
  // materialization baseline: houses 7–12 are above horizon in the ordinary house wheel.
  const cusps=sky.cusps.map(x=>x.longitude),lon=sun.longitude;
  let house=1;
  for(let i=0;i<12;i++){const span=normalize360(cusps[(i+1)%12]-cusps[i]);const off=normalize360(lon-cusps[i]);if(off<=span){house=i+1;break;}}
  return house>=7&&house<=12;
}
function rec(key:string,name:string,longitude:number,formula:string,elig:MundaneAuthorMode[],sourceIds:string[],status:MundanePartRecord["status"]="calculated"):MundanePartRecord{
  return {key,name,longitude,sign:signName(longitude),formula,authorEligibility:elig,sourceIds,status,dispositor:rulerForLongitude(longitude)};
}
function includesF(mode:MundaneAuthorMode){return mode==="frawley-legacy"||mode==="marcos-frawley"||mode==="research";}
function includesM(mode:MundaneAuthorMode){return mode==="marcos"||mode==="marcos-frawley"||mode==="research";}

export function calculateMundaneParts(sky:PredictiveSkySnapshot,mode:MundaneAuthorMode,focus:MundaneFocus,input:MundaneInput):MundanePartRecord[]{
  const asc=point(sky,"ASC"),sun=point(sky,"Sol"),moon=point(sky,"Lua"),mars=point(sky,"Marte"),jupiter=point(sky,"Júpiter"),saturn=point(sky,"Saturno"),venus=point(sky,"Vênus"),mercury=point(sky,"Mercúrio"),c8=point(sky,"CUSP8");
  const fortune=lot(asc,isDayChart(sky)?moon:sun,isDayChart(sky)?sun:moon);
  const spirit=lot(asc,isDayChart(sky)?sun:moon,isDayChart(sky)?moon:sun);
  const both:MundaneAuthorMode[]=["marcos","frawley-legacy","marcos-frawley","research"];
  const out:MundanePartRecord[]=[
    rec("fortune","Fortuna",fortune,isDayChart(sky)?"ASC + Lua − Sol":"ASC + Sol − Lua",both,["TRADITIONAL-FORTUNE"]),
    rec("spirit","Espírito",spirit,isDayChart(sky)?"ASC + Sol − Lua":"ASC + Lua − Sol",both,["TRADITIONAL-SPIRIT"]),
    rec("love","Amor/Amizade/Afeição",lot(asc,spirit,fortune),"ASC + Espírito − Fortuna",both,["FRA-SEVEN-PARTS","MARCOS-SEVEN-PARTS"]),
    rec("necessity-despair","Necessidade / Desespero, Fraude e Penúria",lot(asc,fortune,spirit),"ASC + Fortuna − Espírito",both,["FRA-SEVEN-PARTS","MARCOS-SEVEN-PARTS"]),
    rec("valour","Valor/Coragem",lot(asc,fortune,mars),"ASC + Fortuna − Marte",both,["FRA-SEVEN-PARTS","MARCOS-SEVEN-PARTS"]),
    rec("victory","Vitória/Ajuda",lot(asc,jupiter,spirit),"ASC + Júpiter − Espírito",both,["FRA-SEVEN-PARTS","MARCOS-SEVEN-PARTS"]),
  ];
  if(includesF(mode)){
    out.push(rec("faith-frawley","Fé",lot(asc,venus,moon),"ASC + Vênus − Lua",["frawley-legacy","marcos-frawley","research"],["FRA-PART-FAITH"]));
    out.push(rec("captivity-frawley","Cativeiro e Escape",lot(asc,saturn,fortune),"ASC + Saturno − Fortuna",["frawley-legacy","marcos-frawley","research"],["FRA-SEVEN-PARTS"]));
    out.push(rec("death-frawley-1","Morte I",lot(asc,c8,moon),"ASC + Cúspide VIII − Lua",["frawley-legacy","marcos-frawley","research"],["FRA-PART-DEATH"]));
    out.push(rec("death-frawley-2","Morte II",lot(c8,saturn,moon),"Cúspide VIII + Saturno − Lua",["frawley-legacy","marcos-frawley","research"],["FRA-PART-DEATH"]));
  }
  if(includesM(mode)) out.push(rec("captivity-marcos","Cativeiro",lot(asc,fortune,saturn),"ASC + Fortuna − Saturno",["marcos","marcos-frawley","research"],["MARCOS-PART-CAPTIVITY"]));
  if(focus==="weather"&&includesF(mode)){
    const mercuryDispositorLong=sky.planets.find(x=>x.name===rulerForLongitude(mercury))?.longitude;
    if(mercuryDispositorLong!==undefined) out.push(rec("weather","Tempo/Ventos",lot(asc,mercuryDispositorLong,mercury),"ASC + dispositor de Mercúrio − Mercúrio",["frawley-legacy","marcos-frawley","research"],["FRA-WEATHER-PARTS"]));
    out.push(rec("heat","Fogo/Calor",lot(asc,mars,sun),"ASC + Marte − Sol",["frawley-legacy","marcos-frawley","research"],["FRA-WEATHER-PARTS"]));
    out.push(rec("clouds","Nuvens",lot(asc,saturn,mars),"ASC + Saturno − Marte",["frawley-legacy","marcos-frawley","research"],["FRA-WEATHER-PARTS"]));
    out.push(rec("rain","Chuvas",lot(asc,venus,moon),"ASC + Vênus − Lua",["frawley-legacy","marcos-frawley","research"],["FRA-WEATHER-PARTS"]));
    out.push(rec("cold","Frio",lot(asc,saturn,mercury),"ASC + Saturno − Mercúrio",["frawley-legacy","marcos-frawley","research"],["FRA-WEATHER-PARTS"]));
    out.push(rec("day","Dia",lot(moon,sun,saturn),"Lua + Sol − Saturno",["frawley-legacy","marcos-frawley","research"],["FRA-WEATHER-PARTS"]));
  }
  if(focus==="agriculture"){
    const crop=input.agriculture?.crop;
    if(crop==="onion") out.push(rec("crop-onion","Cebola",lot(asc,mars,saturn),"ASC + Marte − Saturno",["frawley-legacy","marcos-frawley","research"],["ALBIRUNI-CROP-PARTS"]));
    else if(crop==="corn") out.push(rec("crop-corn","Milho",lot(asc,saturn,jupiter),"ASC + Saturno − Júpiter",["frawley-legacy","marcos-frawley","research"],["ALBIRUNI-CROP-PARTS"]));
    else if(crop==="watermelon") out.push(rec("crop-watermelon","Melancia",lot(asc,mercury,jupiter),"ASC + Mercúrio − Júpiter",["frawley-legacy","marcos-frawley","research"],["ALBIRUNI-CROP-PARTS"]));
    else if(input.agriculture?.customFormula){
      const add=point(sky,input.agriculture.customFormula.add),sub=point(sky,input.agriculture.customFormula.subtract);
      out.push(rec("crop-custom",`Cultura: ${crop??"custom"}`,lot(asc,add,sub),`ASC + ${input.agriculture.customFormula.add} − ${input.agriculture.customFormula.subtract}`,[mode],["USER-CROP-FORMULA"],"user-input"));
    }
  }
  return out;
}
