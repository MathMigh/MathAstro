import type { SelectedCity } from "@/interfaces/BirthChartInterfaces";
import { bodyLongitudeAtMs, calculatePredictiveSky, circularDistance, normalize360, signedAngularDelta } from "@/traditions/western/predictive/predictiveAstronomy";
import type { MundaneRootEvent } from "./mundaneTypes";

const DAY=86400000;
const YEAR=365.2422*DAY;

async function scalar(ms:number, a:number, b:number|undefined, target:number): Promise<number> {
  const pa=await bodyLongitudeAtMs(a,ms);
  const base=b===undefined ? pa.longitude : normalize360(pa.longitude-(await bodyLongitudeAtMs(b,ms)).longitude);
  return signedAngularDelta(base-target);
}

async function bisectRoot(aMs:number,bMs:number,aBody:number,bBody:number|undefined,target:number):Promise<number>{
  let a=aMs,b=bMs,fa=await scalar(a,aBody,bBody,target),fb=await scalar(b,aBody,bBody,target);
  if (Math.abs(fa)<1e-10) return a;
  if (Math.abs(fb)<1e-10) return b;
  if (fa*fb>0) throw new Error("Root not bracketed");
  for(let i=0;i<60;i++){
    const m=(a+b)/2, fm=await scalar(m,aBody,bBody,target);
    if(Math.abs(fm)<1e-9 || b-a<5) return m;
    if(fa*fm<=0){b=m;fb=fm;} else {a=m;fa=fm;}
  }
  return (a+b)/2;
}

async function residualArcsec(ms:number,aBody:number,bBody:number|undefined,target:number):Promise<number>{
  return Math.abs(await scalar(ms,aBody,bBody,target))*3600;
}

export async function findAriesIngressForYear(year:number):Promise<MundaneRootEvent>{
  const start=Date.UTC(year,2,17,0,0,0), end=Date.UTC(year,2,23,0,0,0);
  let prev=start, fp=await scalar(prev,0,undefined,0);
  for(let t=start+6*3600000;t<=end;t+=6*3600000){
    const ft=await scalar(t,0,undefined,0);
    if(fp*ft<=0 && Math.abs(fp)<30 && Math.abs(ft)<30){
      const root=await bisectRoot(prev,t,0,undefined,0);
      const sun=(await bodyLongitudeAtMs(0,root)).longitude;
      return {kind:"aries-ingress",utcIso:new Date(root).toISOString(),residualArcSeconds:await residualArcsec(root,0,undefined,0),longitude:sun};
    }
    prev=t;fp=ft;
  }
  throw new Error(`Ingresso de Áries não encontrado para ${year}.`);
}

export async function findGoverningAriesIngress(beforeUtcMs:number):Promise<MundaneRootEvent>{
  const year=new Date(beforeUtcMs).getUTCFullYear();
  const current=await findAriesIngressForYear(year);
  if(Date.parse(current.utcIso)<=beforeUtcMs) return current;
  return findAriesIngressForYear(year-1);
}

export async function findGrandConjunctions(startUtcMs:number,endUtcMs:number):Promise<MundaneRootEvent[]>{
  const roots:number[]=[];
  const step=5*DAY;
  let prev=startUtcMs, fp=await scalar(prev,5,6,0);
  for(let t=startUtcMs+step;t<=endUtcMs;t+=step){
    const ft=await scalar(t,5,6,0);
    // Avoid the signed-delta discontinuity at opposition.
    if(fp*ft<=0 && Math.abs(fp)<60 && Math.abs(ft)<60){
      try{
        const root=await bisectRoot(prev,t,5,6,0);
        if(!roots.some(x=>Math.abs(x-root)<12*3600000)) roots.push(root);
      }catch{}
    }
    prev=t;fp=ft;
  }
  return Promise.all(roots.sort((a,b)=>a-b).map(async root=>({kind:"jupiter-saturn-conjunction" as const,utcIso:new Date(root).toISOString(),residualArcSeconds:await residualArcsec(root,5,6,0),longitude:(await bodyLongitudeAtMs(5,root)).longitude})));
}

export async function findLatestPrecedingGrandConjunction(beforeUtcMs:number):Promise<MundaneRootEvent>{
  const events=await findGrandConjunctions(beforeUtcMs-35*YEAR,beforeUtcMs-1000);
  if(!events.length) throw new Error("Grande Conjunção precedente não encontrada na janela de 35 anos.");
  return events[events.length-1];
}

async function findPhaseRoots(startUtcMs:number,endUtcMs:number,target:number,kind:"new-moon"|"full-moon"):Promise<MundaneRootEvent[]>{
  const roots:number[]=[]; const step=12*3600000;
  let prev=startUtcMs, fp=await scalar(prev,1,0,target);
  for(let t=startUtcMs+step;t<=endUtcMs;t+=step){
    const ft=await scalar(t,1,0,target);
    if(fp*ft<=0 && Math.abs(fp)<60 && Math.abs(ft)<60){
      try{const root=await bisectRoot(prev,t,1,0,target); if(!roots.some(x=>Math.abs(x-root)<6*3600000)) roots.push(root);}catch{}
    }
    prev=t;fp=ft;
  }
  return Promise.all(roots.map(async root=>({kind,utcIso:new Date(root).toISOString(),residualArcSeconds:await residualArcsec(root,1,0,target),longitude:(await bodyLongitudeAtMs(1,root)).longitude})));
}

export async function findPrecedingMajorLunation(beforeUtcMs:number):Promise<MundaneRootEvent>{
  const start=beforeUtcMs-35*DAY;
  const [news,fulls]=await Promise.all([findPhaseRoots(start,beforeUtcMs,0,"new-moon"),findPhaseRoots(start,beforeUtcMs,180,"full-moon")]);
  const all=[...news,...fulls].filter(x=>Date.parse(x.utcIso)<beforeUtcMs).sort((a,b)=>Date.parse(a.utcIso)-Date.parse(b.utcIso));
  if(!all.length) throw new Error("Lunação precedente não encontrada.");
  return all[all.length-1];
}

export async function mundaneSkyAt(utcMs:number,location:SelectedCity,houseSystem:"R"|"P"="R"){
  return calculatePredictiveSky(utcMs,location,houseSystem);
}

export async function rootSeparationArcsec(event:MundaneRootEvent,aBody:number,bBody:number|undefined,target:number):Promise<number>{
  return residualArcsec(Date.parse(event.utcIso),aBody,bBody,target);
}


export async function findSolarIngressBefore(beforeUtcMs:number,signIndex:number):Promise<MundaneRootEvent>{
  const target=normalize360(signIndex*30);
  const approxYear=new Date(beforeUtcMs).getUTCFullYear();
  const centerMonth=(signIndex*1+2)%12;
  const candidates:number[]=[];
  for(const y of [approxYear-1,approxYear,approxYear+1]){
    const rough=Date.UTC(y,centerMonth,20,0,0,0);
    const start=rough-10*DAY,end=rough+10*DAY;
    let prev=start,fp=await scalar(prev,0,undefined,target);
    for(let t=start+6*3600000;t<=end;t+=6*3600000){
      const ft=await scalar(t,0,undefined,target);
      if(fp*ft<=0&&Math.abs(fp)<30&&Math.abs(ft)<30){
        try{const root=await bisectRoot(prev,t,0,undefined,target); if(root<=beforeUtcMs+1000)candidates.push(root);}catch{}
      }
      prev=t;fp=ft;
    }
  }
  const root=candidates.sort((a,b)=>a-b).at(-1);
  if(root===undefined) throw new Error(`Ingresso solar ${signIndex} precedente não encontrado.`);
  return {kind:"aries-ingress",utcIso:new Date(root).toISOString(),residualArcSeconds:await residualArcsec(root,0,undefined,target),longitude:(await bodyLongitudeAtMs(0,root)).longitude};
}

export async function findLatestLunarPhaseBefore(beforeUtcMs:number):Promise<MundaneRootEvent & {phaseAngle:0|90|180|270}>{
  const start=beforeUtcMs-10*DAY;
  const all:Array<MundaneRootEvent & {phaseAngle:0|90|180|270}>=[];
  for(const target of [0,90,180,270] as const){
    const kind=target===0?"new-moon":target===180?"full-moon":"new-moon";
    const roots=await findPhaseRoots(start,beforeUtcMs,target,kind);
    for(const r of roots) all.push({...r,phaseAngle:target});
  }
  const hit=all.filter(x=>Date.parse(x.utcIso)<=beforeUtcMs).sort((a,b)=>Date.parse(a.utcIso)-Date.parse(b.utcIso)).at(-1);
  if(!hit) throw new Error("Fase lunar precedente não encontrada.");
  return hit;
}
