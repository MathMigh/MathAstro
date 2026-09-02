"use client";

import { useState } from "react";

type FormState = {
  birth: string;
  birthTime: string;
  target: string;
  targetTime: string;
  birthLatitude: string;
  birthLongitude: string;
  birthTimezone: string;
  birthLocality: string;
  eventLatitude: string;
  eventLongitude: string;
  eventTimezone: string;
  eventLocality: string;
  authorMode: "integrated" | "combined" | "marcos" | "frawley" | "gugu";
  question: string;
  context: string;
};

const initial: FormState = {
  birth: "2000-01-01",
  birthTime: "12:00",
  target: new Date().toISOString().slice(0, 10),
  targetTime: "12:00",
  birthLatitude: "-23.5505",
  birthLongitude: "-46.6333",
  birthTimezone: "America/Sao_Paulo",
  birthLocality: "São Paulo",
  eventLatitude: "-23.5505",
  eventLongitude: "-46.6333",
  eventTimezone: "America/Sao_Paulo",
  eventLocality: "São Paulo",
  authorMode: "integrated",
  question: "",
  context: "",
};

function splitDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

export default function PredictiveWorkspace() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [json, setJson] = useState<any>(null);
  const [error, setError] = useState("");

  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function run() {
    setLoading(true);
    setError("");
    setReport("");
    setJson(null);
    try {
      const birthCoordinates = {
        name: form.birthLocality,
        latitude: Number(form.birthLatitude),
        longitude: Number(form.birthLongitude),
        timezone: form.birthTimezone,
        timezoneSource: "user",
        source: "manual",
        precision: "coordinates",
      };
      const eventCoordinates = {
        name: form.eventLocality,
        latitude: Number(form.eventLatitude),
        longitude: Number(form.eventLongitude),
        timezone: form.eventTimezone,
        timezoneSource: "user",
        source: "manual",
        precision: "coordinates",
      };
      const response = await fetch("/api/predictive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: { ...splitDate(form.birth), time: form.birthTime, coordinates: birthCoordinates },
          targetDate: { ...splitDate(form.target), time: form.targetTime, coordinates: eventCoordinates },
          eventCoordinates,
          authorMode: form.authorMode,
          consultation: { question: form.question.trim() || undefined, context: form.context.trim() || undefined },
          includeDerivedLunar: true,
          includeProfection: true,
          includeGuguPeriods: form.authorMode === "integrated" || form.authorMode === "gugu",
          includeTemporalFixedStars: form.authorMode !== "gugu",
        }),
      });
      const data = await response.json();
      if (!response.ok && !data.analysisReport) throw new Error(data.erro ?? `HTTP ${response.status}`);
      setJson(data);
      setReport(data.analysisReport ?? "");
      if (data.validation?.status === "FAIL") setError(`Motor executou, mas a validação final retornou FAIL: ${(data.validation.errors ?? []).join(", ")}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao executar Preditiva.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="western-glass rounded-[2rem] p-6 sm:p-8">
        <p className="section-eyebrow">Motor Preditivo · Marcos + Frawley + Gugu</p>
        <h1 className="section-title mt-3 text-4xl font-semibold text-amber-100">Preditiva isolada</h1>
        <p className="section-copy mt-4 max-w-4xl text-sm">
          Radix → progressões secundárias → Solar → Lunar → Lunar Derivada → profecção contextual → períodos Gugu → trânsitos subordinados. O relatório preserva as doutrinas autorais separadas, recalcula estrelas fixas por época e entrega a mecânica pronta para a IA, sem score oculto.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="western-glass rounded-[2rem] p-6 lg:col-span-1">
          <div className="space-y-4 text-sm">
            <label className="block">Nascimento<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" type="date" value={form.birth} onChange={(e: any) => set("birth", e.target.value)} /></label>
            <label className="block">Hora natal<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" type="time" value={form.birthTime} onChange={(e: any) => set("birthTime", e.target.value)} /></label>
            <label className="block">Data-alvo<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" type="date" value={form.target} onChange={(e: any) => set("target", e.target.value)} /></label>
            <label className="block">Hora-alvo<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" type="time" value={form.targetTime} onChange={(e: any) => set("targetTime", e.target.value)} /></label>
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">Local de nascimento</p>
              <div className="space-y-3">
                <label className="block">Localidade natal<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.birthLocality} onChange={(e: any) => set("birthLocality", e.target.value)} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label>Latitude<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.birthLatitude} onChange={(e: any) => set("birthLatitude", e.target.value)} /></label>
                  <label>Longitude<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.birthLongitude} onChange={(e: any) => set("birthLongitude", e.target.value)} /></label>
                </div>
                <label className="block">Timezone natal IANA<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.birthTimezone} onChange={(e: any) => set("birthTimezone", e.target.value)} /></label>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">Local do evento / data-alvo</p>
              <div className="space-y-3">
                <label className="block">Localidade do evento<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.eventLocality} onChange={(e: any) => set("eventLocality", e.target.value)} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label>Latitude<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.eventLatitude} onChange={(e: any) => set("eventLatitude", e.target.value)} /></label>
                  <label>Longitude<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.eventLongitude} onChange={(e: any) => set("eventLongitude", e.target.value)} /></label>
                </div>
                <label className="block">Timezone do evento IANA<input className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.eventTimezone} onChange={(e: any) => set("eventTimezone", e.target.value)} /></label>
              </div>
            </div>
            <label className="block">Perfil autoral<select className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.authorMode} onChange={(e: any) => set("authorMode", e.target.value)}><option value="integrated">Integrado: Marcos + Frawley + Gugu</option><option value="combined">Marcos + Frawley</option><option value="marcos">Marcos</option><option value="frawley">Frawley</option><option value="gugu">Gugu — períodos planetários</option></select></label>
            <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.03] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">Contexto para a futura IA</p>
              <label className="block">Pergunta / situação<textarea className="mt-1 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.question} onChange={(e: any) => set("question", e.target.value)} placeholder="Ex.: O que este período mostra para minha situação profissional?" /></label>
              <label className="mt-3 block">Contexto factual<textarea className="mt-1 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 p-3" value={form.context} onChange={(e: any) => set("context", e.target.value)} placeholder="Fatos concretos que ajudam a IA a escolher entre manifestações possíveis, sem alterar os cálculos." /></label>
              <p className="mt-2 text-[11px] leading-5 text-stone-400">A pergunta é opcional para o motor. Quando houver IA conectada, ela será usada apenas para roteamento semântico e julgamento contextual.</p>
            </div>
            <button onClick={run} disabled={loading} className="w-full rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-3 font-medium text-amber-100 disabled:opacity-50">{loading ? "Calculando…" : "Gerar dossiê preditivo"}</button>
            {error && <p className="rounded-xl border border-red-300/20 bg-red-400/5 p-3 text-red-200">{error}</p>}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="western-glass rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-3"><h2 className="section-title text-2xl text-amber-100">Relatório para IA</h2>{json?.validation?.status && <span className="rounded-full border border-white/10 px-3 py-1 text-xs">{json.validation.status}</span>}</div>
            <pre className="mt-4 max-h-[52rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-black/20 p-4 text-xs leading-6 text-stone-200">{report || "O relatório técnico aparecerá aqui."}</pre>
          </div>
          {json?.aiJudgmentContract && <details className="western-glass rounded-[2rem] p-6"><summary className="cursor-pointer section-title text-xl text-amber-100">Contrato + prompt da IA</summary><div className="mt-4 space-y-4"><p className="text-xs text-stone-300">Bot ready: {String(json.aiJudgmentContract.botReady)} · tarefas: {json.aiJudgmentContract.tasks?.length ?? 0}</p><pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-black/20 p-4 text-[11px] leading-5 text-stone-300">{json.aiPrompt?.text}</pre></div></details>}
          {json && <details className="western-glass rounded-[2rem] p-6"><summary className="cursor-pointer section-title text-xl text-amber-100">JSON mecânico integral</summary><pre className="mt-4 max-h-[40rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-black/20 p-4 text-[11px] leading-5 text-stone-300">{JSON.stringify(json, null, 2)}</pre></details>}
        </div>
      </div>
    </section>
  );
}
