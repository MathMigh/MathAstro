import { calculateFullFixedStarSky } from "@/app/lib/fixedStars";
import { getSwe } from "@/app/lib/astrologyEngine";
import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { circularDistance, normalize360 } from "@/traditions/western/predictive/predictiveAstronomy";
import type { PredictiveSkySnapshot } from "@/traditions/western/predictive/predictiveTypes";
import type { MundaneAuthorMode, MundaneFixedStarContact, MundaneFixedStarDossier, MundanePartRecord } from "./mundaneTypes";

const ELITE=new Set(["Regulus","Aldebaran","Antares","Fomalhaut","Sirius","Procyon","Castor","Pollux","Spica","Algol"]);
function norm(x:number){return normalize360(x);} function sameSign(a:number,b:number){return Math.floor(norm(a)/30)===Math.floor(norm(b)/30);}
function marcosOrb(star:{name:string;magnitude?:number}){if(ELITE.has(star.name))return 3;if(Number.isFinite(star.magnitude)&&Number(star.magnitude)<=2.5)return 2;return 1;}
function includesM(m:MundaneAuthorMode){return m==="marcos"||m==="marcos-frawley"||m==="research";} function includesF(m:MundaneAuthorMode){return m==="frawley-legacy"||m==="marcos-frawley"||m==="research";}
function rawPlanetLatitude(sw:any,jd:number,bodyId:number){const m=sw.module,xx=m._malloc(48),serr=m._malloc(256);try{const f=m.ccall("swe_calc_ut_wrap","number",["number","number","number","number","number"],[jd,bodyId,258,xx,serr]);if(f<0)throw new Error(m.UTF8ToString(serr));return {lon:norm(m.getValue(xx,"double")),lat:m.getValue(xx+8,"double")};}finally{m._free(xx);m._free(serr);}}
function sphericalSep(lon1:number,lat1:number,lon2:number,lat2:number){const r=Math.PI/180,a=lon1*r,b=lat1*r,c=lon2*r,d=lat2*r;return Math.acos(Math.max(-1,Math.min(1,Math.sin(b)*Math.sin(d)+Math.cos(b)*Math.cos(d)*Math.cos(a-c))))/r;}

export async function calculateMundaneFixedStars(args:{chartId:string;sky:PredictiveSkySnapshot;mode:MundaneAuthorMode;parts:MundanePartRecord[];includeFull:boolean}):Promise<MundaneFixedStarDossier>{
  const sw:any=await getSwe();const fake:any={birthDate:{coordinates:args.sky.location as SelectedCity},housesData:{house:args.sky.cusps.map(x=>x.longitude),variants:{placidus:{cusps:args.sky.cusps.map(x=>x.longitude)}}}};
  const catalog=await calculateFullFixedStarSky(fake,sw,args.sky.julianDayUt);
  const candidates=catalog.positions.filter(s=>s.isMarcosPrincipal||s.traditionalMetadataAvailable||s.isAstroSeekMajor15||args.includeFull);
  const planetLat=new Map<string,{lon:number;lat:number}>();const ids:Record<string,number>={Sol:0,Lua:1,"Mercúrio":2,"Vênus":3,Marte:4,"Júpiter":5,Saturno:6};
  for(const p of args.sky.planets)planetLat.set(p.name,rawPlanetLatitude(sw,args.sky.julianDayUt,ids[p.name]));
  const targets=[...args.sky.planets.map(p=>({name:p.name,kind:"planet" as const,lon:p.longitude})),...args.sky.cusps.map(c=>({name:c.name,kind:"cusp" as const,lon:c.longitude})),...args.parts.filter(p=>p.key==="fortune").map(p=>({name:p.name,kind:"part" as const,lon:p.longitude}))];
  const contacts:MundaneFixedStarContact[]=[];
  for(const t of targets)for(const star of candidates){const d=circularDistance(t.lon,star.longitude),ss=sameSign(t.lon,star.longitude),orb=marcosOrb(star),mEligible=includesM(args.mode)&&t.kind!=="part"&&ss&&d<=orb,fEligible=includesF(args.mode)&&d<=3&&(t.kind!=="part"||t.name==="Fortuna");if(!mEligible&&!fEligible&&d>3)continue;const pl=t.kind==="planet"?planetLat.get(t.name):undefined;contacts.push({chartId:args.chartId,target:t.name,targetKind:t.kind,targetLongitude:t.lon,star:star.name,starLongitude:star.longitude,starLatitude:star.latitude,rightAscension:star.rightAscension,declination:star.declination,magnitude:star.magnitude,longitudeDistance:d,sameSign:ss,maxOrbDeg:orb,eligibleByMarcos:mEligible,eligibleByFrawley:fEligible,twoDimensionalSeparationDeg:pl?sphericalSep(pl.lon,pl.lat,star.longitude,star.latitude):undefined,physicalOccultationClaimed:false,aspectPolicy:"conjunction-only",sourceIds:[...(mEligible?["MAR-STARS"]:[]),...(fEligible?["FRA-MUN-COVENTRY"]:[])]});}
  return {catalogMode:args.includeFull?"full":"relevant",catalogCount:catalog.positions.length,positions:args.includeFull?catalog.positions.map(s=>({name:s.name,longitude:s.longitude,latitude:s.latitude,rightAscension:s.rightAscension,declination:s.declination,magnitude:s.magnitude,calculationMode:s.calculationMode})):undefined,contacts:contacts.sort((a,b)=>a.longitudeDistance-b.longitudeDistance),noStarAsAgent:true,oppositionPolicy:"no-star-opposition; opposite-cusp cases normalized as conjunction to opposite cusp"};
}
