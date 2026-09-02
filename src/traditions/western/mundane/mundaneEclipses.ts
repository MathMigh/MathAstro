import { getSwe } from "@/app/lib/astrologyEngine";
import { DOMICILE_RULER } from "@/app/lib/traditionalTables";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { bodyLongitudeAtMs, normalize360, signName } from "@/traditions/western/predictive/predictiveAstronomy";
import { structuralInvariantsForChart } from "./mundaneStructuralInvariants";
import type { MundaneAuthorMode, MundaneEclipseRecord, MundaneEclipseLord } from "./mundaneTypes";

const DAY_MS = 86_400_000;
const UNIX_EPOCH_JD = 2440587.5;
const AU_KM = 149_597_870.7;
const EARTH_EQUATORIAL_RADIUS_KM = 6378.137;
const EARTH_FLATTENING = 1 / 298.257223563;
const SUN_RADIUS_KM = 696_340;
const MOON_RADIUS_KM = 1737.4;
const OBLIQUITY_DEG = 23.4392911;
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function jdFromMs(ms: number): number { return ms / DAY_MS + UNIX_EPOCH_JD; }
function msFromJd(jd: number): number { return (jd - UNIX_EPOCH_JD) * DAY_MS; }
function clamp(v:number,min:number,max:number){ return Math.max(min,Math.min(max,v)); }
function signed(v:number){ const n=normalize360(v); return n>=180?n-360:n; }

function rawPosition(sw:any,jd:number,bodyId:number){
  const m=sw.module; const xxPtr=m._malloc(6*8); const serrPtr=m._malloc(256);
  try{
    const flag=m.ccall("swe_calc_ut_wrap","number",["number","number","number","number","number"],[jd,bodyId,258,xxPtr,serrPtr]);
    if(flag<0) throw new Error(m.UTF8ToString(serrPtr));
    return {longitude:normalize360(m.getValue(xxPtr,"double")),latitude:m.getValue(xxPtr+8,"double"),distanceAu:m.getValue(xxPtr+16,"double")};
  } finally {m._free(xxPtr);m._free(serrPtr);}
}

function eclipticToEquatorial(lonDeg:number,latDeg:number){
  const lon=lonDeg*RAD, lat=latDeg*RAD, eps=OBLIQUITY_DEG*RAD;
  const x=Math.cos(lat)*Math.cos(lon);
  const y=Math.cos(lat)*Math.sin(lon)*Math.cos(eps)-Math.sin(lat)*Math.sin(eps);
  const z=Math.cos(lat)*Math.sin(lon)*Math.sin(eps)+Math.sin(lat)*Math.cos(eps);
  return {ra:normalize360(Math.atan2(y,x)*DEG),dec:Math.asin(clamp(z,-1,1))*DEG};
}

function greenwichSiderealDeg(jd:number){
  const T=(jd-2451545.0)/36525;
  return normalize360(280.46061837 + 360.98564736629*(jd-2451545.0) + 0.000387933*T*T - T*T*T/38710000);
}

function topoEquatorial(jd:number,location:SelectedCity,geo:{longitude:number;latitude:number;distanceAu:number}){
  const eq=eclipticToEquatorial(geo.longitude,geo.latitude);
  const ra=eq.ra*RAD, dec=eq.dec*RAD;
  const rEarth=(geo.distanceAu*AU_KM)/EARTH_EQUATORIAL_RADIUS_KM;
  const ox=rEarth*Math.cos(dec)*Math.cos(ra), oy=rEarth*Math.cos(dec)*Math.sin(ra), oz=rEarth*Math.sin(dec);
  const phi=Number(location.latitude)*RAD;
  const u=Math.atan((1-EARTH_FLATTENING)*Math.tan(phi));
  const rhoCos=Math.cos(u), rhoSin=(1-EARTH_FLATTENING)*Math.sin(u);
  const theta=(greenwichSiderealDeg(jd)+Number(location.longitude))*RAD;
  const tx=ox-rhoCos*Math.cos(theta), ty=oy-rhoCos*Math.sin(theta), tz=oz-rhoSin;
  const distEarth=Math.sqrt(tx*tx+ty*ty+tz*tz);
  const topRa=normalize360(Math.atan2(ty,tx)*DEG);
  const topDec=Math.asin(clamp(tz/distEarth,-1,1))*DEG;
  const hourAngle=signed(greenwichSiderealDeg(jd)+Number(location.longitude)-topRa)*RAD;
  const decR=topDec*RAD;
  const altitude=Math.asin(clamp(Math.sin(phi)*Math.sin(decR)+Math.cos(phi)*Math.cos(decR)*Math.cos(hourAngle),-1,1))*DEG;
  return {ra:topRa,dec:topDec,distanceKm:distEarth*EARTH_EQUATORIAL_RADIUS_KM,altitude};
}

function angularSeparation(a:{ra:number;dec:number},b:{ra:number;dec:number}){
  const ra1=a.ra*RAD,ra2=b.ra*RAD,d1=a.dec*RAD,d2=b.dec*RAD;
  return Math.acos(clamp(Math.sin(d1)*Math.sin(d2)+Math.cos(d1)*Math.cos(d2)*Math.cos(ra1-ra2),-1,1))*DEG;
}

function apparentRadiusDeg(radiusKm:number,distanceKm:number){ return Math.asin(clamp(radiusKm/distanceKm,-1,1))*DEG; }

function classifyKind(e:any,type:"solar"|"lunar"):MundaneEclipseRecord["kind"]{
  if(type==="solar"){
    if(typeof e?.isTotal==="function" && e.isTotal()) return "solar-total";
    if(typeof e?.isAnnular==="function" && e.isAnnular()) return "solar-annular";
    if(typeof e?.isHybrid==="function" && e.isHybrid()) return "solar-hybrid";
    return "solar-partial";
  }
  if(typeof e?.isTotal==="function" && e.isTotal()) return "lunar-total";
  if(typeof e?.isPartial==="function" && e.isPartial()) return "lunar-partial";
  return "lunar-penumbral";
}

async function solarLocalVisibility(sw:any,e:any,location:SelectedCity){
  const begin=Number(e.partialBegin), end=Number(e.partialEnd);
  if(!Number.isFinite(begin)||!Number.isFinite(end)||begin<=0||end<=begin) return {visible:null,method:"unavailable" as const};
  const evaluate=(jd:number)=>{
    const sun=topoEquatorial(jd,location,rawPosition(sw,jd,0));
    const moon=topoEquatorial(jd,location,rawPosition(sw,jd,1));
    const sep=angularSeparation(sun,moon);
    const sunR=apparentRadiusDeg(SUN_RADIUS_KM,sun.distanceKm), moonR=apparentRadiusDeg(MOON_RADIUS_KM,moon.distanceKm);
    const overlap=sunR+moonR-sep;
    const magnitude=clamp(overlap/(2*sunR),0,2);
    return {jd,sep,sunR,moonR,overlap,magnitude,altitude:sun.altitude};
  };
  let best:ReturnType<typeof evaluate>|null=null;
  const step=2/(24*60);
  for(let jd=begin;jd<=end+1e-9;jd+=step){ const v=evaluate(Math.min(jd,end)); if(v.altitude>-0.833 && v.overlap>0 && (!best||v.sep<best.sep)) best=v; }
  if(!best) return {visible:false,method:"topocentric-disc-overlap" as const,maximumUtcIso:null,approximateMagnitude:0,solarAltitudeDeg:null,minimumCenterSeparationDeg:null};
  let left=Math.max(begin,best.jd-4/(24*60)),right=Math.min(end,best.jd+4/(24*60));
  for(let i=0;i<28;i++){
    const m1=left+(right-left)/3,m2=right-(right-left)/3,v1=evaluate(m1),v2=evaluate(m2);
    const score=(v:ReturnType<typeof evaluate>)=>v.altitude>-0.833?v.sep:999;
    if(score(v1)<score(v2)) right=m2; else left=m1;
  }
  best=evaluate((left+right)/2);
  return {visible:best.altitude>-0.833&&best.overlap>0,method:"topocentric-disc-overlap" as const,maximumUtcIso:new Date(msFromJd(best.jd)).toISOString(),approximateMagnitude:best.magnitude,solarAltitudeDeg:best.altitude,minimumCenterSeparationDeg:best.sep};
}

function lunarLocalVisibility(sw:any,e:any,location:SelectedCity){
  const begin=Number(e.penumbralBegin)||Number(e.partialBegin), end=Number(e.penumbralEnd)||Number(e.partialEnd);
  if(!Number.isFinite(begin)||!Number.isFinite(end)||begin<=0||end<=begin) return {visible:null,method:"unavailable" as const};
  const sample=[begin,Number(e.maximum),(begin+end)/2,end].filter(x=>Number.isFinite(x)&&x>=begin&&x<=end);
  let maxAlt=-90,at:number|null=null;
  const step=4/(24*60);
  for(let jd=begin;jd<=end+1e-9;jd+=step){
    const moon=topoEquatorial(Math.min(jd,end),location,rawPosition(sw,Math.min(jd,end),1));
    if(moon.altitude>maxAlt){maxAlt=moon.altitude;at=Math.min(jd,end);}
  }
  for(const jd of sample){const moon=topoEquatorial(jd,location,rawPosition(sw,jd,1));if(moon.altitude>maxAlt){maxAlt=moon.altitude;at=jd;}}
  return {visible:maxAlt>-0.3,method:"topocentric-moon-above-horizon" as const,maximumVisibleAltitudeUtcIso:at?new Date(msFromJd(at)).toISOString():null,maximumMoonAltitudeDeg:maxAlt};
}

function lordForEclipse(mode:MundaneAuthorMode,type:"solar"|"lunar",longitude:number):MundaneEclipseLord|undefined{
  const frawley=mode==="frawley-legacy"||mode==="marcos-frawley"||mode==="research";
  if(!frawley) return undefined;
  if(type==="solar"){
    const signIndex=Math.floor(normalize360(longitude)/30)%12;
    return {status:"calculated",planet:DOMICILE_RULER[signIndex],rule:"domicile-ruler-of-solar-eclipse-sign",sourceIds:["FRA-ECL-LORD-SOLAR"]};
  }
  return {status:"source-locked",planet:null,rule:"generic-lunar-eclipse-lord-not-inferred-from-solar-rule",sourceIds:["FRA-ECL-LORD-COVENTRY-CASE"]};
}

async function record(sw:any,e:any,type:"solar"|"lunar",location:SelectedCity,mode:MundaneAuthorMode):Promise<MundaneEclipseRecord>{
  const maxJd=Number(e.maximum), maxMs=msFromJd(maxJd);
  const sun=await bodyLongitudeAtMs(0,maxMs), moon=await bodyLongitudeAtMs(1,maxMs);
  const relevantLon=type==="solar"?sun.longitude:sun.longitude;
  const phaseBegin=type==="solar"?Number(e.partialBegin):(Number(e.penumbralBegin)||Number(e.partialBegin));
  const phaseEnd=type==="solar"?Number(e.partialEnd):(Number(e.penumbralEnd)||Number(e.partialEnd));
  return {
    type,kind:classifyKind(e,type),maximumUtcIso:new Date(maxMs).toISOString(),maximumJulianDayUt:maxJd,
    phaseBeginUtcIso:Number.isFinite(phaseBegin)&&phaseBegin>0?new Date(msFromJd(phaseBegin)).toISOString():null,
    phaseEndUtcIso:Number.isFinite(phaseEnd)&&phaseEnd>0?new Date(msFromJd(phaseEnd)).toISOString():null,
    eclipseTypeFlags:Number.isFinite(e.type)?Number(e.type):null,
    sunLongitude:sun.longitude,moonLongitude:moon.longitude,eclipseSign:signName(relevantLon),
    lord:lordForEclipse(mode,type,relevantLon),
    localVisibility:type==="solar"?await solarLocalVisibility(sw,e,location):lunarLocalVisibility(sw,e,location),
    structuralInvariants:structuralInvariantsForChart(type==="solar"?"solar-eclipse":"lunar-eclipse"),
    provenance:{physicalClassification:"SwissEphemeris-eclipse-search",localVisibility:type==="solar"?"MathAstro-topocentric-disc-geometry":"MathAstro-topocentric-horizon-geometry"},
  };
}

export async function findPhysicalEclipses(startUtcMs:number,endUtcMs:number,location:SelectedCity,mode:MundaneAuthorMode):Promise<MundaneEclipseRecord[]>{
  const sw:any=await getSwe();
  if(typeof sw.findNextSolarEclipse!=="function"||typeof sw.findNextLunarEclipse!=="function") throw new Error("Swiss Ephemeris eclipse API indisponível no runtime.");
  const startJd=jdFromMs(startUtcMs),endJd=jdFromMs(endUtcMs),out:MundaneEclipseRecord[]=[];
  for(const type of ["solar","lunar"] as const){
    let cursor=startJd-1e-5;
    for(let guard=0;guard<12;guard++){
      const e=type==="solar"?sw.findNextSolarEclipse(cursor):sw.findNextLunarEclipse(cursor);
      if(!e||!Number.isFinite(e.maximum)||Number(e.maximum)>endJd+1e-8) break;
      if(Number(e.maximum)>=startJd-1e-8) out.push(await record(sw,e,type,location,mode));
      cursor=Number(e.maximum)+1;
    }
  }
  return out.sort((a,b)=>Date.parse(a.maximumUtcIso)-Date.parse(b.maximumUtcIso));
}

export function nearestPrecedingEclipse(eclipses:MundaneEclipseRecord[],beforeUtcMs:number):MundaneEclipseRecord|undefined{
  return eclipses.filter(e=>Date.parse(e.maximumUtcIso)<=beforeUtcMs).sort((a,b)=>Date.parse(a.maximumUtcIso)-Date.parse(b.maximumUtcIso)).at(-1);
}
