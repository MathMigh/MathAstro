import { DOMICILE_RULER, EXALTATION } from "@/app/lib/traditionalTables";
import { bodyLongitudeAtMs, essentialCondition, normalize360, signedAngularDelta } from "@/traditions/western/predictive/predictiveAstronomy";
import type { PredictiveSkySnapshot } from "@/traditions/western/predictive/predictiveTypes";
import type { MundaneIngressLordCandidate } from "./mundaneTypes";

const BODY:Record<string,number>={Sol:0,Lua:1,"Mercúrio":2,"Vênus":3,Marte:4,"Júpiter":5,Saturno:6};
const ASPECTS=[{name:"conjunction",angle:0},{name:"sextile",angle:60},{name:"square",angle:90},{name:"trine",angle:120},{name:"opposition",angle:180}] as const;
const HOUR=3_600_000;

function houseOf(longitude:number,cusps:number[]):number{
  const lon=normalize360(longitude);
  for(let i=0;i<12;i++){
    const c=normalize360(cusps[i]),n=normalize360(cusps[(i+1)%12]);
    const span=normalize360(n-c),offset=normalize360(lon-c);
    if(offset<span || Math.abs(offset-span)<1e-10) return i+1;
  }
  return 1;
}
function angularity(h:number):MundaneIngressLordCandidate["angularity"]{return [1,4,7,10].includes(h)?"angular":[2,5,8,11].includes(h)?"succedent":"cadent";}
function signIndex(x:number){return Math.floor(normalize360(x)/30)%12;}
function exaltationRulerForSign(index:number):string|undefined{return Object.entries(EXALTATION).find(([,s])=>s===index)?.[0];}

async function nextMoonApplication(ingressMs:number,targetName:string):Promise<MundaneIngressLordCandidate["moonApplication"]>{
  if(targetName==="Lua") return null;
  const targetId=BODY[targetName]; if(targetId===undefined) return null;
  const initialMoon=(await bodyLongitudeAtMs(1,ingressMs)).longitude, initialSign=signIndex(initialMoon);
  const error=async(ms:number,angle:number)=>{
    const [m,t]=await Promise.all([bodyLongitudeAtMs(1,ms),bodyLongitudeAtMs(targetId,ms)]);
    const sep=normalize360(m.longitude-t.longitude);
    // aspects are undirected; choose nearest ±angle root
    const e1=Math.abs(signedAngularDelta(sep-angle));
    const e2=Math.abs(signedAngularDelta(sep+angle));
    return e1<=e2?signedAngularDelta(sep-angle):signedAngularDelta(sep+angle);
  };
  let best:{name:typeof ASPECTS[number]["name"];ms:number}|null=null;
  for(const asp of ASPECTS){
    let prev=ingressMs,fp=await error(prev,asp.angle);
    for(let t=ingressMs+0.5*HOUR;t<=ingressMs+72*HOUR;t+=0.5*HOUR){
      const moon=(await bodyLongitudeAtMs(1,t)).longitude;
      if(signIndex(moon)!==initialSign) break;
      const ft=await error(t,asp.angle);
      if(Math.abs(ft-fp)<30 && (Math.abs(ft)<1e-7 || fp*ft<0)){
        let a=prev,b=t,fa=fp;
        for(let i=0;i<45;i++){
          const m=(a+b)/2,fm=await error(m,asp.angle);
          if(Math.abs(fm)<1e-7||b-a<1000){a=b=m;break;}
          if(fa*fm<=0)b=m;else{a=m;fa=fm;}
        }
        const ms=(a+b)/2;
        if(!best||ms<best.ms) best={name:asp.name,ms};
        break;
      }
      prev=t;fp=ft;
    }
  }
  return best?{aspect:best.name,exactUtcIso:new Date(best.ms).toISOString(),hoursAfterIngress:(best.ms-ingressMs)/HOUR}:null;
}

export async function buildIngressLordCandidates(ingress:PredictiveSkySnapshot):Promise<MundaneIngressLordCandidate[]>{
  const cusps=ingress.cusps.map(x=>x.longitude);
  const angles=[
    {angle:"ASC" as const,longitude:ingress.angles.find(x=>x.key==="asc")!.longitude,cusp:1},
    {angle:"MC" as const,longitude:ingress.angles.find(x=>x.key==="mc")!.longitude,cusp:10},
    {angle:"DSC" as const,longitude:normalize360(ingress.angles.find(x=>x.key==="asc")!.longitude+180),cusp:7},
    {angle:"IC" as const,longitude:normalize360(ingress.angles.find(x=>x.key==="mc")!.longitude+180),cusp:4},
  ];
  const ingressMs=Date.parse(ingress.utcIso);
  const out:MundaneIngressLordCandidate[]=[];
  for(const p of ingress.planets){
    const h=houseOf(p.longitude,cusps);
    const domicileRuledCusps:number[]=[],exaltationRuledCusps:number[]=[];
    for(let i=0;i<12;i++){
      const si=signIndex(cusps[i]);
      if(DOMICILE_RULER[si]===p.name) domicileRuledCusps.push(i+1);
      if(exaltationRulerForSign(si)===p.name) exaltationRuledCusps.push(i+1);
    }
    const angularControl:MundaneIngressLordCandidate["angularControl"]=[];
    for(const a of angles){
      const si=signIndex(a.longitude);
      if(DOMICILE_RULER[si]===p.name) angularControl.push({angle:a.angle,basis:"domicile"});
      if(exaltationRulerForSign(si)===p.name) angularControl.push({angle:a.angle,basis:"exaltation"});
    }
    out.push({planet:p.name,longitude:p.longitude,sign:p.sign,essentialCondition:essentialCondition(p),house:h,angularity:angularity(h),domicileRuledCusps,exaltationRuledCusps,angularControl,moonApplication:await nextMoonApplication(ingressMs,p.name),noAggregateScore:true});
  }
  return out;
}
