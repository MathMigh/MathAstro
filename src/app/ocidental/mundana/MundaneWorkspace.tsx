"use client";
import { useState } from "react";

const initial={
  date:new Date().toISOString().slice(0,10),time:"12:00",lat:"-23.5505",lon:"-46.6333",tz:"America/Sao_Paulo",locality:"São Paulo",
  author:"marcos-frawley",focus:"general",mode:"focused",question:"",advancedJson:"{}"
};
function split(d:string){const [year,month,day]=d.split("-").map(Number);return {year,month,day};}
function download(name:string,text:string,type="text/plain;charset=utf-8"){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}

export default function MundaneWorkspace(){
 const [f,setF]=useState(initial);const [data,setData]=useState<any>(null);const [err,setErr]=useState("");const [loading,setLoading]=useState(false);
 const set=(k:string,v:string)=>setF((x:any)=>({...x,[k]:v}));
 async function run(){
   setLoading(true);setErr("");
   try{
     let advanced:any={};
     try{advanced=JSON.parse(f.advancedJson||"{}");}catch{throw new Error("JSON avançado inválido.");}
     if(!advanced||Array.isArray(advanced)||typeof advanced!=="object") throw new Error("JSON avançado deve ser um objeto.");
     const base:any={
       targetDate:{...split(f.date),time:f.time,coordinates:{name:f.locality,latitude:Number(f.lat),longitude:Number(f.lon),timezone:f.tz}},
       authorMode:f.author,focus:f.focus,consultationMode:f.mode,consultationQuestion:f.question.trim()||undefined,
       terrestrialContext:{"topic-context":f.question.trim()||"consulta-mundana"}
     };
     const payload={...base,...advanced,terrestrialContext:{...base.terrestrialContext,...(advanced.terrestrialContext??{})}};
     const r=await fetch("/api/mundane",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
     const j=await r.json();if(!r.ok&&!j.analysisReport)throw new Error(j.erro??`HTTP ${r.status}`);setData(j);
   }catch(e){setErr(e instanceof Error?e.message:"Falha na Mundana");}finally{setLoading(false);}
 }
 return <section className="mx-auto max-w-7xl space-y-6">
   <div className="western-glass rounded-[2rem] p-7">
     <p className="section-eyebrow">Motor Mundano isolado · Consulta Pro v3</p>
     <h1 className="section-title mt-3 text-4xl text-amber-100">Rodas dentro de rodas</h1>
     <p className="section-copy mt-4 text-sm">O motor calcula; a IA julga. O pacote entrega Prompt Absoluto v3, método integral, source-locks, zonas de juízo do astrólogo e JSON lossless.</p>
   </div>
   <div className="grid gap-5 lg:grid-cols-3">
     <div className="western-glass rounded-[2rem] p-6 space-y-3 text-sm">
       <label className="block">Pergunta mundana<textarea className="mt-1 min-h-24 w-full rounded-xl bg-black/20 p-3" placeholder="Ex.: há risco de ruptura institucional neste período?" value={f.question} onChange={(e:any)=>set("question",e.target.value)}/></label>
       <label className="block">Modo de consulta<select className="mt-1 w-full rounded-xl bg-black/20 p-3" value={f.mode} onChange={(e:any)=>set("mode",e.target.value)}><option value="focused">Temática/focada</option><option value="integral">Integral/Consulta Pro</option></select></label>
       <label className="block">Data<input className="mt-1 w-full rounded-xl bg-black/20 p-3" type="date" value={f.date} onChange={(e:any)=>set("date",e.target.value)}/></label>
       <label className="block">Hora<input className="mt-1 w-full rounded-xl bg-black/20 p-3" type="time" value={f.time} onChange={(e:any)=>set("time",e.target.value)}/></label>
       <label className="block">Local<input className="mt-1 w-full rounded-xl bg-black/20 p-3" value={f.locality} onChange={(e:any)=>set("locality",e.target.value)}/></label>
       <div className="grid grid-cols-2 gap-2"><input aria-label="latitude" className="rounded-xl bg-black/20 p-3" value={f.lat} onChange={(e:any)=>set("lat",e.target.value)}/><input aria-label="longitude" className="rounded-xl bg-black/20 p-3" value={f.lon} onChange={(e:any)=>set("lon",e.target.value)}/></div>
       <input aria-label="timezone" className="w-full rounded-xl bg-black/20 p-3" value={f.tz} onChange={(e:any)=>set("tz",e.target.value)}/>
       <select className="w-full rounded-xl bg-black/20 p-3" value={f.author} onChange={(e:any)=>set("author",e.target.value)}><option value="marcos-frawley">Marcos + Frawley</option><option value="marcos">Marcos</option><option value="frawley-legacy">Frawley publicado</option><option value="research">Research</option></select>
       <select className="w-full rounded-xl bg-black/20 p-3" value={f.focus} onChange={(e:any)=>set("focus",e.target.value)}>{["general","war","government","economy","disaster","weather","agriculture"].map(x=><option key={x}>{x}</option>)}</select>
       <details className="rounded-xl border border-white/10 p-3"><summary>JSON avançado opcional</summary><p className="mt-2 text-xs opacity-75">Use para historicalRadices, processOriginUtcIso, terrestrialContext, weather, agriculture, comets, relatedRadixIds e includeFullFixedStarCatalog.</p><textarea className="mt-2 min-h-44 w-full rounded-xl bg-black/20 p-3 font-mono text-xs" value={f.advancedJson} onChange={(e:any)=>set("advancedJson",e.target.value)}/></details>
       <button className="w-full rounded-xl bg-amber-200/10 p-3 text-amber-100" onClick={run} disabled={loading}>{loading?"Calculando…":"Gerar dossiê mundano"}</button>{err&&<p className="text-red-200">{err}</p>}
     </div>
     <div className="western-glass rounded-[2rem] p-6 lg:col-span-2">
       {data&&<div className="mb-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/5 px-3 py-2">{data.aiContract?.schema}</span><span className="rounded-full bg-white/5 px-3 py-2">{data.aiHandoff?.methodVersion}</span><span className="rounded-full bg-white/5 px-3 py-2">IA ready: {String(data.aiContract?.readyForInterpretation)}</span></div>}
       <pre className="max-h-[55rem] overflow-auto whitespace-pre-wrap text-xs leading-6">{data?.analysisReport??"O dossiê aparecerá aqui."}</pre>
       {data&&<div className="mt-5 flex flex-wrap gap-2"><button className="rounded-xl bg-white/5 px-4 py-2 text-xs" onClick={()=>download("mundana-dossie.txt",data.analysisReport)}>Baixar TXT</button><button className="rounded-xl bg-white/5 px-4 py-2 text-xs" onClick={()=>download("mundana-lossless.json",JSON.stringify(data,null,2),"application/json;charset=utf-8")}>Baixar JSON</button><button className="rounded-xl bg-white/5 px-4 py-2 text-xs" onClick={()=>download("prompt-absoluto-mundana-v3.txt",data.aiHandoff.systemPrompt)}>Baixar Prompt IA</button></div>}
       {data&&<details className="mt-5"><summary>JSON lossless</summary><pre className="mt-3 max-h-[40rem] overflow-auto whitespace-pre-wrap text-[11px]">{JSON.stringify(data,null,2)}</pre></details>}
       {data&&<details className="mt-5"><summary>Prompt absoluto da execução</summary><pre className="mt-3 max-h-[40rem] overflow-auto whitespace-pre-wrap text-[11px]">{data.aiHandoff?.systemPrompt}</pre></details>}
     </div>
   </div>
 </section>;
}
