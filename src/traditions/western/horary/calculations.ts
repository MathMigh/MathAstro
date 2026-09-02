import type { BirthChart, Planet, PlanetType } from "@/interfaces/BirthChartInterfaces";
import { DOMICILE_RULER, EXALTATION, DETRIMENT, FALL, TRIPLICITY_RULERS, LILLY_TERMS, FACES, SIGNS, AVERAGE_DAILY_SPEED } from "@/app/lib/traditionalTables";
import { CLASSICAL_PLANETS, NAME_TO_PLANET, PLANET_NAMES, ASPECT_ANGLES } from "./tables";
import type { AccidentalCondition, EssentialCondition, HoraryAspectEvent, HoraryLunarEvent, HoraryReception, HorarySignificator } from "./types";

export const norm=(x:number)=>((x%360)+360)%360;
export const antiscionLongitude=(longitude:number)=>norm(180-longitude);
export const shortDistance=(a:number,b:number)=>{const d=Math.abs(norm(a)-norm(b));return Math.min(d,360-d);};
export const signIndex=(lon:number)=>Math.floor(norm(lon)/30);
export const degreeInSign=(lon:number)=>norm(lon)%30;
export const houseRuler=(chart:BirthChart,house:number):PlanetType=>{
  const cusp=chart.housesData.house[(house-1+12)%12];
  const ruler=DOMICILE_RULER[signIndex(cusp)];
  const type=NAME_TO_PLANET[ruler];
  if(!type) throw new Error(`Regente tradicional não resolvido: ${ruler}`);
  return type;
};
export const derivedHouse=(base:number,offset:number)=>((base+offset-2)%12)+1;
export const planet=(chart:BirthChart,type:PlanetType):Planet=>{
  const p=chart.planets.find(x=>x.type===type); if(!p) throw new Error(`Planeta ausente: ${type}`); return p;
};

function isDiurnal(chart:BirthChart):boolean {
  const sun=planet(chart,"sun");
  const h=planetHouse(chart,sun.longitudeRaw);
  return [7,8,9,10,11,12].includes(h);
}

export function planetHouse(chart:BirthChart,lon:number):number {
  const cusps=chart.housesData.house.map(norm);
  const x=norm(lon);
  let rawHouse=1;
  for(let i=0;i<12;i++){
    const a=cusps[i],b=cusps[(i+1)%12];
    if(a<=b ? x>=a&&x<b : x>=a||x<b){ rawHouse=i+1; break; }
  }
  // Regra horária operacional de Frawley: planeta a ~5° da cúspide seguinte,
  // e já no mesmo signo dessa cúspide, é contado na casa seguinte.
  const nextHouse=rawHouse===12?1:rawHouse+1;
  const nextCusp=cusps[nextHouse-1];
  const forward=norm(nextCusp-x);
  if(forward>0&&forward<=5&&signIndex(x)===signIndex(nextCusp)) return nextHouse;
  return rawHouse;
}

export function essentialCondition(chart:BirthChart,type:PlanetType):EssentialCondition {
  const p=planet(chart,type), idx=signIndex(p.longitudeRaw), deg=degreeInSign(p.longitudeRaw), name=PLANET_NAMES[type];
  const day=isDiurnal(chart);
  const domicileRuler=DOMICILE_RULER[idx];
  const exaltEntry=Object.entries(EXALTATION).find(([,s])=>s===idx)?.[0];
  const triplicity=TRIPLICITY_RULERS[idx%4]?.[day?"day":"night"] ?? "";
  const term=(LILLY_TERMS[idx].find(x=>deg<x.endDeg) ?? LILLY_TERMS[idx][LILLY_TERMS[idx].length-1]).ruler;
  const face=FACES[idx][Math.min(2,Math.floor(deg/10))];
  const domicile=domicileRuler===name, exaltation=exaltEntry===name, trip=triplicity===name, trm=term===name, fce=face===name;
  const detriment=(DETRIMENT[name]??[]).includes(idx), fall=FALL[name]===idx;
  return {domicile,exaltation,triplicity:trip,term:trm,face:fce,detriment,fall,peregrine:!(domicile||exaltation||trip||trm||fce),dignityRulers:{domicile:domicileRuler,exaltation:exaltEntry,triplicity,term,face}};
}

export function accidentalCondition(chart:BirthChart,type:PlanetType):AccidentalCondition {
  const p=planet(chart,type), sun=planet(chart,"sun"), house=planetHouse(chart,p.longitudeRaw);
  const ang:[string,number][]=[["ASC",chart.housesData.ascendant],["MC",chart.housesData.mc],["DSC",norm(chart.housesData.ascendant+180)],["IC",norm(chart.housesData.mc+180)]];
  const nearest=ang.map(([angle,l])=>({angle:angle as "ASC"|"MC"|"DSC"|"IC",orb:shortDistance(p.longitudeRaw,l)})).sort((a,b)=>a.orb-b.orb)[0];
  const d=type==="sun"?180:shortDistance(p.longitudeRaw,sun.longitudeRaw);
  const sameSunSign=type!=="sun" && signIndex(p.longitudeRaw)===signIndex(sun.longitudeRaw);
  const avg=AVERAGE_DAILY_SPEED[PLANET_NAMES[type]] ?? Math.abs(p.longitudeSpeed);
  const abs=Math.abs(p.longitudeSpeed);
  return {house,angularity:[1,4,7,10].includes(house)?"angular":[2,5,8,11].includes(house)?"succedent":"cadent",direct:!p.isRetrograde,retrograde:p.isRetrograde,swift:abs>avg,slow:abs<avg,cazimi:sameSunSign&&d<=17/60,combust:sameSunSign&&d>17/60&&d<=8.5,underSunbeams:sameSunSign&&d>8.5&&d<=17,distanceFromSun:d,nearAngle:nearest.orb<=3?nearest:undefined};
}

export function significator(chart:BirthChart,role:string,house:number,sourceIds:string[]):HorarySignificator {
  const type=houseRuler(chart,house), p=planet(chart,type);
  return {role,house,basis:"house_ruler",planet:type,planetName:PLANET_NAMES[type],longitude:p.longitudeRaw,sign:SIGNS[signIndex(p.longitudeRaw)],degreeInSign:degreeInSign(p.longitudeRaw),speed:p.longitudeSpeed,essential:essentialCondition(chart,type),accidental:accidentalCondition(chart,type),sourceIds};
}

export function significatorFromPlanet(chart:BirthChart,role:string,type:PlanetType,sourceIds:string[],basis:"natural_planet"|"explicit_planet"="natural_planet"):HorarySignificator {
  const p=planet(chart,type);
  return {role,house:null,basis,planet:type,planetName:PLANET_NAMES[type],longitude:p.longitudeRaw,sign:SIGNS[signIndex(p.longitudeRaw)],degreeInSign:degreeInSign(p.longitudeRaw),speed:p.longitudeSpeed,essential:essentialCondition(chart,type),accidental:accidentalCondition(chart,type),sourceIds};
}

function dignityOfPositionForPlanet(chart:BirthChart,positionOwner:PlanetType,target:PlanetType):HoraryReception["dignities"] {
  const pos=planet(chart,positionOwner), idx=signIndex(pos.longitudeRaw), deg=degreeInSign(pos.longitudeRaw), targetName=PLANET_NAMES[target], day=isDiurnal(chart);
  const out:HoraryReception["dignities"]=[];
  if(DOMICILE_RULER[idx]===targetName) out.push("domicile");
  if(Object.entries(EXALTATION).some(([n,s])=>n===targetName&&s===idx)) out.push("exaltation");
  if(TRIPLICITY_RULERS[idx%4]?.[day?"day":"night"]===targetName) out.push("triplicity");
  if((LILLY_TERMS[idx].find(x=>deg<x.endDeg)??LILLY_TERMS[idx][4]).ruler===targetName) out.push("term");
  if(FACES[idx][Math.min(2,Math.floor(deg/10))]===targetName) out.push("face");
  if((DETRIMENT[targetName]??[]).includes(idx)) out.push("detriment");
  if(FALL[targetName]===idx) out.push("fall");
  return out;
}

export function reception(chart:BirthChart,from:PlanetType,to:PlanetType):HoraryReception {
  const ds=dignityOfPositionForPlanet(chart,from,to);
  const order:HoraryReception["strongest"][]=["domicile","exaltation","triplicity","term","face","detriment","fall"];
  const strongest=(order.find(x=>ds.includes(x as any))??"none") as HoraryReception["strongest"];
  const disposition=strongest==="domicile"||strongest==="exaltation"?"strong_positive":strongest==="triplicity"||strongest==="term"?"positive":strongest==="face"?"mild_positive":strongest==="fall"?"strong_negative":strongest==="detriment"?"negative":"neutral";
  return {from,to,fromName:PLANET_NAMES[from],toName:PLANET_NAMES[to],dignities:ds,strongest,disposition};
}

function signedToTarget(delta:number,target:number):number {
  const cands=[target,-target].flatMap(t=>[t-delta,t-delta+360,t-delta-360,t-delta+720,t-delta-720]);
  return cands.sort((a,b)=>Math.abs(a)-Math.abs(b))[0];
}

export function aspectBetween(chart:BirthChart,a:PlanetType,b:PlanetType):HoraryAspectEvent|undefined {
  if(a===b) return undefined; // um planeta não aperfeiçoa aspecto consigo mesmo; evita falsos eventos quando dois papéis compartilham regente.
  const pa=planet(chart,a),pb=planet(chart,b);
  const ia=signIndex(pa.longitudeRaw), ib=signIndex(pb.longitudeRaw);
  const forwardSigns=(ib-ia+12)%12;
  const signDiff=Math.min(forwardSigns,(12-forwardSigns)%12);
  const aspectBySigns:Partial<Record<number,HoraryAspectEvent["aspect"]>>={0:"conjunction",2:"sextile",3:"square",4:"trine",6:"opposition"};
  const aspect=aspectBySigns[signDiff];
  if(!aspect) return undefined; // signos que não se contemplam não formam aspecto corporal.
  const directedTarget=forwardSigns*30; // 60/300, 90/270 etc.; preserva a relação entre os signos atuais.
  const delta=norm(pb.longitudeRaw-pa.longitudeRaw), rel=pb.longitudeSpeed-pa.longitudeSpeed;
  let error=norm(delta-directedTarget); if(error>180) error-=360;
  const time=Math.abs(rel)>1e-9?-error/rel:undefined;
  const applying=time!==undefined&&time>0;
  const days=applying?time:undefined;
  const degs=Math.abs(error);
  const aToBoundary=pa.longitudeSpeed>=0?30-degreeInSign(pa.longitudeRaw):degreeInSign(pa.longitudeRaw);
  const bToBoundary=pb.longitudeSpeed>=0?30-degreeInSign(pb.longitudeRaw):degreeInSign(pb.longitudeRaw);
  const aDays=Math.abs(pa.longitudeSpeed)>1e-9?aToBoundary/Math.abs(pa.longitudeSpeed):Infinity;
  const bDays=Math.abs(pb.longitudeSpeed)>1e-9?bToBoundary/Math.abs(pb.longitudeSpeed):Infinity;
  return {a,b,aName:PLANET_NAMES[a],bName:PLANET_NAMES[b],aspect,applying,separating:!applying,orb:Math.abs(error),degreesToPerfection:degs,estimatedDaysToPerfection:days,beforeEitherChangesSign:days!==undefined?days<=Math.min(aDays,bDays):undefined};
}

export function antiscialContact(chart:BirthChart,a:PlanetType,b:PlanetType):HoraryAspectEvent|undefined {
  if(a===b) return undefined;
  const pa=planet(chart,a),pb=planet(chart,b), anti=norm(180-pa.longitudeRaw+180); // 360 - lon mirrored over Cancer/Capricorn axis
  const antiCorrect=norm(180-pa.longitudeRaw);
  const dAnti=shortDistance(antiCorrect,pb.longitudeRaw), dContra=shortDistance(norm(antiCorrect+180),pb.longitudeRaw);
  if(Math.min(dAnti,dContra)>1) return undefined;
  return {a,b,aName:PLANET_NAMES[a],bName:PLANET_NAMES[b],aspect:dAnti<=dContra?"conjunction":"opposition",applying:false,separating:false,orb:Math.min(dAnti,dContra),byAntiscion:dAnti<=dContra,byContraAntiscion:dContra<dAnti};
}

export function lunarSequence(chart:BirthChart,max=8):HoraryLunarEvent[] {
  const moon=planet(chart,"moon"), out:HoraryLunarEvent[]=[];
  for(const target of CLASSICAL_PLANETS.filter(x=>x!=="moon")){
    const ev=aspectBetween(chart,"moon",target);
    if(ev?.applying&&ev.beforeEitherChangesSign&&ev.degreesToPerfection!==undefined) out.push({order:0,target,targetName:PLANET_NAMES[target],aspect:ev.aspect,degreesToPerfection:ev.degreesToPerfection,estimatedDaysToPerfection:ev.estimatedDaysToPerfection});
  }
  out.sort((a,b)=>(a.estimatedDaysToPerfection??999)-(b.estimatedDaysToPerfection??999));
  return out.slice(0,max).map((x,i)=>({...x,order:i+1}));
}

export function cuspEntryDistance(chart:BirthChart,type:PlanetType,house:number):{degrees:number;possible:boolean} {
  const p=planet(chart,type), cusp=chart.housesData.house[(house-1)%12], dir=p.longitudeSpeed>=0?1:-1;
  const degrees=dir>0?norm(cusp-p.longitudeRaw):norm(p.longitudeRaw-cusp);
  return {degrees,possible:degrees<30};
}
