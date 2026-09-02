import { FIXED_STARS, LILLY_TERMS } from "@/app/lib/traditionalTables";
import type { MundaneHistoricalRadixInput, MundaneProgressionDossier, MundaneReturnDossier } from "./mundaneTypes";
import { birthDateToUtcMs, bodyLongitudeAtMs, circularDistance, findPreviousLongitudeReturn, normalize360, progressPointByMeanSolarArc, signName } from "@/traditions/western/predictive/predictiveAstronomy";
import type { PredictiveSkySnapshot } from "@/traditions/western/predictive/predictiveTypes";
import { mundaneSkyAt } from "./mundaneAstronomy";

const DAY=86_400_000,YEAR_DAYS=365.2422,GATE=1;
function houseContainsSun(sky:PredictiveSkySnapshot){const sun=sky.planets.find(x=>x.name==="Sol")!,c=sky.cusps.map(x=>x.longitude);for(let i=0;i<12;i++){const span=normalize360(c[(i+1)%12]-c[i]),off=normalize360(sun.longitude-c[i]);if(off<=span)return i+1;}return 1;}
function fortune(sky:PredictiveSkySnapshot){const asc=sky.angles.find(x=>x.key==="asc")!.longitude,sun=sky.planets.find(x=>x.name==="Sol")!.longitude,moon=sky.planets.find(x=>x.name==="Lua")!.longitude;const day=(()=>{const h=houseContainsSun(sky);return h>=7&&h<=12;})();return normalize360(asc+(day?moon:sun)-(day?sun:moon));}
function term(lon:number){const si=Math.floor(normalize360(lon)/30),d=normalize360(lon)%30;return LILLY_TERMS[si]?.find(x=>d<x.endDeg)?.ruler;}
function precessedStars(radixMs:number){const year=2000+(radixMs-Date.UTC(2000,0,1,12))/(365.2425*DAY),shift=(year-2000)*50.29/3600;return FIXED_STARS.map(s=>({name:s.name,longitude:normalize360(s.lon+shift)}));}
function contact(moving:{name:string;longitude:number},target:{name:string;longitude:number},targetClass:MundaneProgressionDossier["contacts"][number]["targetClass"]){const sep=circularDistance(moving.longitude,target.longitude);const conj=sep,opp=Math.abs(sep-180),aspect=conj<=opp?"conjunction" as const:"opposition" as const,d=Math.min(conj,opp);return d<=GATE?{moving:moving.name,target:target.name,targetClass,aspect,distanceToExact:d,operationalGateDeg:GATE,gateProvenance:"ENGINE_SCREENING_NOT_AUTHORIAL_ORB" as const}:null;}

export async function calculateMundaneProgression(radix:MundaneHistoricalRadixInput,radixSky:PredictiveSkySnapshot,targetMs:number):Promise<MundaneProgressionDossier>{
  const radixMs=birthDateToUtcMs(radix.date),ageYears=(targetMs-radixMs)/(YEAR_DAYS*DAY),symbolicMs=radixMs+ageYears*DAY;
  const [sun,moon]=await Promise.all([bodyLongitudeAtMs(0,symbolicMs),bodyLongitudeAtMs(1,symbolicMs)]);
  const asc0=radixSky.angles.find(x=>x.key==="asc")!.longitude,mc0=radixSky.angles.find(x=>x.key==="mc")!.longitude,fortune0=fortune(radixSky);
  const asc=progressPointByMeanSolarArc(asc0,ageYears),mc=progressPointByMeanSolarArc(mc0,ageYears),fort=progressPointByMeanSolarArc(fortune0,ageYears);
  const progressed=[{name:"Sol",longitude:sun.longitude,sign:signName(sun.longitude),mechanism:"literal-day-for-year-ephemeris"},{name:"Lua",longitude:moon.longitude,sign:signName(moon.longitude),mechanism:"literal-day-for-year-ephemeris"},{name:"ASC",longitude:asc.longitude,sign:signName(asc.longitude),mechanism:"mean-solar-arc-in-right-ascension"},{name:"MC",longitude:mc.longitude,sign:signName(mc.longitude),mechanism:"mean-solar-arc-in-right-ascension"},{name:"Fortuna",longitude:fort.longitude,sign:signName(fort.longitude),mechanism:"mean-solar-arc-in-right-ascension"}] as MundaneProgressionDossier["progressedPoints"];
  const radixBase:Record<string,number>={Sol:radixSky.planets.find(x=>x.name==="Sol")!.longitude,Lua:radixSky.planets.find(x=>x.name==="Lua")!.longitude,ASC:asc0,MC:mc0,Fortuna:fortune0};
  const termChanges=progressed.map(p=>({point:p.name,radixTerm:term(radixBase[p.name]),progressedTerm:term(p.longitude),changed:term(radixBase[p.name])!==term(p.longitude)}));
  const targets=[...radixSky.planets.map(p=>({name:p.name,longitude:p.longitude,targetClass:"planet" as const})),...radixSky.cusps.map(c=>({name:c.name,longitude:c.longitude,targetClass:"cusp" as const})),{name:"Fortuna radical",longitude:fortune0,targetClass:"part" as const},...precessedStars(radixMs).map(s=>({...s,targetClass:"fixed-star" as const}))];
  const contacts=progressed.flatMap(p=>targets.map(t=>contact(p,t,t.targetClass)).filter((x):x is NonNullable<typeof x>=>Boolean(x))).sort((a,b)=>a.distanceToExact-b.distanceToExact);
  return {radixId:radix.id,method:"frawley-published-day-for-year-baseline",targetUtcIso:new Date(targetMs).toISOString(),ageYears,symbolicUtcIso:new Date(symbolicMs).toISOString(),primaryPromissors:["Sol","Lua","ASC","MC","Fortuna"],progressedPoints:progressed,termChanges,contacts,exactMundaneDirectionClaimed:false,sourceIds:["FRA-PROG"]};
}

export async function calculateMundaneReturns(radix:MundaneHistoricalRadixInput,radixSky:PredictiveSkySnapshot,targetMs:number):Promise<MundaneReturnDossier[]>{
  const sun0=radixSky.planets.find(x=>x.name==="Sol")!.longitude,moon0=radixSky.planets.find(x=>x.name==="Lua")!.longitude;
  const [solar,lunar]=await Promise.all([findPreviousLongitudeReturn(0,sun0,targetMs),findPreviousLongitudeReturn(1,moon0,targetMs)]);
  const [solarSky,lunarSky]=await Promise.all([mundaneSkyAt(solar.utcMs,radix.date.coordinates,"P"),mundaneSkyAt(lunar.utcMs,radix.date.coordinates,"P")]);
  return [{radixId:radix.id,kind:"solar-return",exactUtcIso:new Date(solar.utcMs).toISOString(),residualArcSeconds:solar.residualArcSeconds,chart:solarSky,relation:"return-of-radix",sourceIds:["FRA-PROG"]},{radixId:radix.id,kind:"lunar-return",exactUtcIso:new Date(lunar.utcMs).toISOString(),residualArcSeconds:lunar.residualArcSeconds,chart:lunarSky,relation:"return-of-radix",sourceIds:["FRA-PROG"]}];
}
