import moment from "moment-timezone";
import { calculateFullFixedStarSky } from "@/app/lib/fixedStars";
import { getSwe } from "@/app/lib/astrologyEngine";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { bodyLongitudeAtMs, normalize360, signedAngularDelta, signName } from "@/traditions/western/predictive/predictiveAstronomy";
import { findLatestLunarPhaseBefore, findPrecedingMajorLunation, findSolarIngressBefore, mundaneSkyAt } from "./mundaneAstronomy";
import type { MundaneInput, MundaneRootEvent, MundaneWeatherApplication, MundaneWeatherDossier } from "./mundaneTypes";

const HOUR=3_600_000,DAY=86_400_000,RAD=Math.PI/180,DEG=180/Math.PI,JD0=2440587.5;
const BODY:Record<string,number>={Sol:0,Lua:1,"Mercúrio":2,"Vênus":3,Marte:4,"Júpiter":5,Saturno:6};
const ASPECTS=[{name:"conjunction",angle:0},{name:"sextile",angle:60},{name:"square",angle:90},{name:"trine",angle:120},{name:"opposition",angle:180}] as const;
const PRINCIPAL=new Set(["Regulus","Aldebaran","Antares","Fomalhaut","Sirius","Procyon","Castor","Pollux","Spica","Algol"]);
function jd(ms:number){return ms/DAY+JD0;} function clamp(x:number,a:number,b:number){return Math.max(a,Math.min(b,x));}
function gst(j:number){const T=(j-2451545)/36525;return normalize360(280.46061837+360.98564736629*(j-2451545)+0.000387933*T*T-T*T*T/38710000);}
function sunAltitude(ms:number,lon:number,location:SelectedCity){
  const eps=23.4392911*RAD,l=lon*RAD;const ra=Math.atan2(Math.sin(l)*Math.cos(eps),Math.cos(l))*DEG;const dec=Math.asin(Math.sin(eps)*Math.sin(l));
  const phi=Number(location.latitude)*RAD,H=signedAngularDelta(gst(jd(ms))+Number(location.longitude)-normalize360(ra))*RAD;
  return Math.asin(clamp(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H),-1,1))*DEG;
}
async function findSunrise(targetMs:number,location:SelectedCity):Promise<number|null>{
  if(!location.timezone||!moment.tz.zone(location.timezone)) return null;
  const local=moment.utc(targetMs).tz(location.timezone),mid=moment.tz(`${local.year()}-${local.month()+1}-${local.date()} 00:00:00`,`YYYY-M-D HH:mm:ss`,location.timezone).valueOf();
  let prev=mid,prevLon=(await bodyLongitudeAtMs(0,prev)).longitude,fa=sunAltitude(prev,prevLon,location)+0.833;
  for(let t=mid+10*60_000;t<=mid+18*HOUR;t+=10*60_000){
    const lon=(await bodyLongitudeAtMs(0,t)).longitude,fb=sunAltitude(t,lon,location)+0.833;
    if(fa<=0&&fb>=0){let a=prev,b=t,f0=fa;for(let i=0;i<35;i++){const m=(a+b)/2,ml=(await bodyLongitudeAtMs(0,m)).longitude,f=sunAltitude(m,ml,location)+0.833;if(Math.abs(f)<1e-5||b-a<1000){a=b=m;break;}if(f0*f<=0)b=m;else{a=m;f0=f;}}return (a+b)/2;}
    prev=t;fa=fb;prevLon=lon;
  }
  return null;
}
async function nextApplication(referenceMs:number,movingName:"Lua"|"Mercúrio"):Promise<MundaneWeatherApplication|undefined>{
  const movingId=BODY[movingName],initial=(await bodyLongitudeAtMs(movingId,referenceMs)).longitude,si=Math.floor(initial/30);
  const max=movingName==="Lua"?4*DAY:35*DAY,step=movingName==="Lua"?0.5*HOUR:2*HOUR;
  let best:{target:string;aspect:typeof ASPECTS[number]["name"];ms:number}|undefined;
  for(const [target,targetId] of Object.entries(BODY)){
    if(target===movingName) continue;
    for(const asp of ASPECTS){
      const err=async(ms:number)=>{const [m,t]=await Promise.all([bodyLongitudeAtMs(movingId,ms),bodyLongitudeAtMs(targetId,ms)]);const sep=normalize360(m.longitude-t.longitude);const a=signedAngularDelta(sep-asp.angle),b=signedAngularDelta(sep+asp.angle);return Math.abs(a)<=Math.abs(b)?a:b;};
      let p=referenceMs,fp=await err(p);
      for(let t=referenceMs+step;t<=referenceMs+max;t+=step){
        if(Math.floor((await bodyLongitudeAtMs(movingId,t)).longitude/30)!==si) break;
        const ft=await err(t); if(Math.abs(ft-fp)<30&&(fp*ft<0||Math.abs(ft)<1e-7)){
          let a=p,b=t,fa=fp;for(let i=0;i<40;i++){const m=(a+b)/2,fm=await err(m);if(Math.abs(fm)<1e-7||b-a<1000){a=b=m;break;}if(fa*fm<=0)b=m;else{a=m;fa=fm;}}
          const ms=(a+b)/2;if(!best||ms<best.ms)best={target,aspect:asp.name,ms};break;
        } p=t;fp=ft;
      }
    }
  }
  return best?{moving:movingName,target:best.target,aspect:best.aspect,exactUtcIso:new Date(best.ms).toISOString(),hoursAfterReference:(best.ms-referenceMs)/HOUR,beforeMovingBodyChangesSign:true}:undefined;
}
function nearestSiderealEvent(referenceJd:number,location:SelectedCity,ra:number,dec:number,kind:"rise"|"set"):number|null{
  const phi=Number(location.latitude)*RAD,d=dec*RAD,cosH=-Math.tan(phi)*Math.tan(d); if(cosH<-1||cosH>1)return null;
  const H=Math.acos(clamp(cosH,-1,1))*DEG,desired=normalize360(ra+(kind==="rise"?-H:H));
  const current=normalize360(gst(referenceJd)+Number(location.longitude));let delta=signedAngularDelta(desired-current); if(delta<0)delta+=360;
  return referenceJd+delta/360.98564736629;
}
async function fixedStarRiseSet(referenceMs:number,location:SelectedCity,sky:any){
  try{
    const sw=await getSwe();
    const fake:any={birthDate:{coordinates:location},housesData:{house:sky.cusps.map((x:any)=>x.longitude),variants:{placidus:{cusps:sky.cusps.map((x:any)=>x.longitude)}}}};
    const starSky=await calculateFullFixedStarSky(fake,sw,sky.julianDayUt);
    return starSky.positions.filter((s:any)=>PRINCIPAL.has(s.name)).map((s:any)=>{
      const r=nearestSiderealEvent(jd(referenceMs),location,s.rightAscension,s.declination,"rise"),q=nearestSiderealEvent(jd(referenceMs),location,s.rightAscension,s.declination,"set");
      return {star:s.name,riseUtcIso:r?new Date((r-JD0)*DAY).toISOString():null,setUtcIso:q?new Date((q-JD0)*DAY).toISOString():null,declination:s.declination,rightAscension:s.rightAscension,status:"calculated-from-epoch-ra-dec"};
    });
  }catch{return [];}
}
function seasonLabel(longitude:number,hemisphere:"north"|"south"){
  const q=Math.floor(normalize360(longitude)/90)%4;const north=["spring","summer","autumn","winter"],south=["autumn","winter","spring","summer"];return (hemisphere==="north"?north:south)[q];
}
export async function calculateWeatherDossier(targetMs:number,location:SelectedCity,input:MundaneInput):Promise<MundaneWeatherDossier>{
  const targetSun=(await bodyLongitudeAtMs(0,targetMs)).longitude,currentSign=Math.floor(targetSun/30),currentQuarter=Math.floor(targetSun/90)*3;
  const seasonIngress=await findSolarIngressBefore(targetMs,currentQuarter),monthIngress=await findSolarIngressBefore(targetMs,currentSign);
  const [seasonLunation,monthLunation,phase]=await Promise.all([findPrecedingMajorLunation(Date.parse(seasonIngress.utcIso)),findPrecedingMajorLunation(Date.parse(monthIngress.utcIso)),findLatestLunarPhaseBefore(targetMs)]);
  const sunriseMs=await findSunrise(targetMs,location);const sunriseChart=sunriseMs?await mundaneSkyAt(sunriseMs,location,"R"):undefined;
  const ref=sunriseMs??targetMs;const [moonApplication,mercuryApplication]=await Promise.all([nextApplication(ref,"Lua"),nextApplication(ref,"Mercúrio")]);
  const stars=sunriseChart?await fixedStarRiseSet(ref,location,sunriseChart):[];
  return {status:input.weather?.normalClimate?"calculated":"blocked-missing-climate-context",hierarchy:["season","month","week","day"],normalClimate:input.weather?.normalClimate,
    season:{ingress:seasonIngress,precedingLunation:seasonLunation,label:seasonLabel(seasonIngress.longitude??0,Number(location.latitude)>=0?"north":"south")},month:{ingress:monthIngress,precedingLunation:monthLunation},week:{phase},
    day:{sunriseUtcIso:sunriseMs?new Date(sunriseMs).toISOString():null,sunriseChart,moonApplication,mercuryApplication,fixedStarRiseSet:stars},
    planetaryPrinciples:[{planet:"Saturno",principle:"frio; umedecido, nuvens"},{planet:"Júpiter",principle:"tempo benigno; umedecido, chuva abundante"},{planet:"Marte",principle:"intensificação e violência"},{planet:"Sol",principle:"qualidade sazonal"},{planet:"Vênus",principle:"benéfica/úmida em escala menor que Júpiter"},{planet:"Mercúrio",principle:"vento e turbulência"},{planet:"Lua",principle:"catalisadora; ativa o planeta a que aplica"}],partKeys:["weather","heat","clouds","rain","cold","day"],noAggregateScore:true};
}
