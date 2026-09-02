"use client";

import { useState } from "react";

type ApiResult = { error?: string; [key: string]: unknown };

const sample = {
  methodMode: "current-marcos-frawley-aware",
  goal: "business",
  objective: "Abrir oficialmente uma empresa visando estabilidade, lucro e permanência.",
  constraints: {
    startLocal: "2026-09-01T09:00:00",
    endLocal: "2026-09-01T18:00:00",
    coordinates: { latitude: -23.5505, longitude: -46.6333, name: "São Paulo", timezone: "America/Sao_Paulo" },
    stepMinutes: 30,
    allowedLocalHours: [{ start: "09:00", end: "18:00" }],
    maxCandidates: 30
  },
  natalCharts: [],
  topN: 5
};

export default function ElectionalPage() {
  const [payload,setPayload]=useState(JSON.stringify(sample,null,2));
  const [result,setResult]=useState<ApiResult|null>(null);
  const [busy,setBusy]=useState(false);
  async function run(){
    setBusy(true); setResult(null);
    try {
      const res=await fetch("/api/electional/scan",{method:"POST",headers:{"content-type":"application/json"},body:payload});
      setResult(await res.json());
    } catch(e) { setResult({error:e instanceof Error?e.message:"Erro"}); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-[#0d0b08] text-[#efe5cf] px-6 py-10">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs tracking-[0.3em] uppercase text-[#b99b68]">MathAstro · Ocidental</p>
      <h1 className="mt-2 text-4xl font-semibold">Astrologia Eletiva</h1>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-[#cfc3ad]">Módulo isolado. Linha principal: Marcos Monteiro → John Frawley; Gugu somente onde houver material atribuível. O modo atual preserva a eletiva clássica para cálculo e auditoria, mas explicita a preferência recente por eleição guiada por horária e rejeita a ideia de minuto mágico.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#463b2c] bg-[#15110d] p-5">
          <h2 className="text-lg font-medium">Varredura</h2>
          <p className="mt-2 text-xs leading-5 text-[#a99b86]">A API exige natividades para chamar o resultado de eleição clássica plena. Sem elas, o resultado deve ser tratado como triagem simples/degradada.</p>
          <textarea className="mt-4 h-[520px] w-full rounded-xl border border-[#3a3024] bg-[#0b0907] p-4 font-mono text-xs text-[#e6dcc8]" value={payload} onChange={e=>setPayload(e.target.value)} />
          <button onClick={run} disabled={busy} className="mt-4 rounded-lg border border-[#8f754c] px-5 py-2 text-sm disabled:opacity-50">{busy?"Calculando…":"Executar varredura"}</button>
        </section>
        <section className="rounded-2xl border border-[#463b2c] bg-[#15110d] p-5">
          <h2 className="text-lg font-medium">Resultado auditável</h2>
          <pre className="mt-4 h-[610px] overflow-auto whitespace-pre-wrap rounded-xl border border-[#3a3024] bg-[#0b0907] p-4 text-xs leading-5 text-[#d8ccb7]">{result?JSON.stringify(result,null,2):"Nenhum cálculo executado."}</pre>
        </section>
      </div>
    </div>
  </main>;
}
