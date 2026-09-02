"use client";

import { FormEvent, useMemo, useState } from "react";
import CitySearch from "@/app/components/CitySearch";
import ChartPositionsSummary from "@/app/components/ChartPositionsSummary";
import type { BirthChart, BirthDate, SelectedCity } from "@/interfaces/BirthChartInterfaces";
import type { NatalAnalysis } from "./index";

type NatalValidationResponse = {
  status: "PASS" | "FAIL";
  errors: Array<{ code: string; message: string; context?: string }>;
  warnings: Array<{ code: string; message: string }>;
  checks: Record<string, boolean>;
};

type NatalAiIntegrationResponse = {
  status: "READY_FOR_PROVIDER" | "AWAITING_QUESTION" | "BLOCKED_BY_ENGINE_VALIDATION";
  readyForProvider: boolean;
  reason: string;
  invocation: unknown;
  providerContract: unknown;
};

type NatalApiResponse = BirthChart & {
  natalAnalysis: NatalAnalysis;
  natalPrecision: unknown;
  traditionalReport: string;
  natalValidation: NatalValidationResponse;
  reportBundle: {
    aiTechnicalReport: string;
    auditTechnicalReport: string;
    aiStructuredForm: unknown;
    auditStructuredForm: NatalAnalysis["technicalForm"];
    absoluteJudgmentPackage: unknown;
    absoluteNatalPrompt: string;
    natalJudgmentContext: unknown;
    aiIntegration: NatalAiIntegrationResponse;
    validation: NatalValidationResponse;
    releasedForAi: boolean;
  };
  erro?: string;
};

type ReportView = "ai" | "audit" | "json-ai" | "json-audit" | "absolute-prompt" | "judgment-json" | "provider-json";

export default function NatalOnlyWorkspace() {
  const [date, setDate] = useState({ day: 21, month: 4, year: 2001, time: "06:45" });
  const [city, setCity] = useState<SelectedCity | undefined>();
  const [result, setResult] = useState<NatalApiResponse | null>(null);
  const [judgmentQuestion, setJudgmentQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportView, setReportView] = useState<ReportView>("ai");

  const locationAudit = useMemo(() => {
    if (!city) return null;
    return [city.precision, city.timezone, city.source].filter(Boolean).join(" · ");
  }, [city]);


  function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const displayedReport = useMemo(() => {
    if (!result) return "";
    if (reportView === "audit") return result.reportBundle.auditTechnicalReport;
    if (reportView === "json-ai") return JSON.stringify(result.reportBundle.aiStructuredForm, null, 2);
    if (reportView === "json-audit") return JSON.stringify(result.reportBundle.auditStructuredForm, null, 2);
    if (reportView === "absolute-prompt") return result.reportBundle.absoluteNatalPrompt;
    if (reportView === "judgment-json") return JSON.stringify(result.reportBundle.absoluteJudgmentPackage, null, 2);
    if (reportView === "provider-json") return JSON.stringify(result.reportBundle.aiIntegration, null, 2);
    return result.reportBundle.aiTechnicalReport;
  }, [result, reportView]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!city) {
      setError("Selecione uma localidade da lista para fixar coordenadas e fuso histórico.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const birthDate: BirthDate = { ...date, coordinates: city };
      const response = await fetch("/api/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, judgmentQuestion: judgmentQuestion.trim() || null }),
      });
      const data = await response.json() as NatalApiResponse;
      if (!response.ok) throw new Error(data.erro || "Falha ao calcular o mapa natal.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha desconhecida ao calcular o mapa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <section className="western-glass grid gap-7 rounded-[2rem] p-5 sm:p-7 lg:grid-cols-[0.78fr_1.22fr] lg:p-9">
        <div>
          <p className="section-eyebrow">Radix · cálculo técnico</p>
          <h1 className="section-title mt-3 text-4xl font-semibold text-amber-100 sm:text-5xl">Mapa Natal</h1>
          <p className="section-copy mt-5 max-w-xl">
            Motor natal ocidental isolado, com Swiss Ephemeris e formulário técnico estruturado para uma camada interpretativa posterior. Marcos Monteiro é a fonte central; Frawley e Gugu aparecem somente como complementos identificados.
          </p>
          <div className="gold-divider mt-7" />
          <p className="mt-6 text-xs leading-6 text-stone-400">
            O cálculo preserva posições brutas, variantes metodológicas e proveniência. Ausência de regra verificável não é preenchida por adivinhação da IA.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-[1.6rem] border border-amber-200/15 bg-black/20 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <label className="text-xs uppercase tracking-[0.16em] text-stone-400">Dia
              <input className="mt-2" type="number" min={1} max={31} value={date.day} onChange={(e) => setDate((d) => ({ ...d, day: Number(e.target.value) }))} />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-stone-400">Mês
              <input className="mt-2" type="number" min={1} max={12} value={date.month} onChange={(e) => setDate((d) => ({ ...d, month: Number(e.target.value) }))} />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-stone-400">Ano
              <input className="mt-2" type="number" min={1} max={3000} value={date.year} onChange={(e) => setDate((d) => ({ ...d, year: Number(e.target.value) }))} />
            </label>
            <label className="text-xs uppercase tracking-[0.16em] text-stone-400">Hora local
              <input className="mt-2" type="time" step={1} value={date.time} onChange={(e) => setDate((d) => ({ ...d, time: e.target.value }))} />
            </label>
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-stone-400">Local de nascimento</label>
            <CitySearch initialCoordinates={city} onSelect={setCity} />
            {locationAudit && <p className="mt-2 text-xs text-amber-100/55">{locationAudit}</p>}
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-stone-400">Pergunta/contexto interpretativo — opcional</label>
            <textarea
              className="min-h-28 w-full rounded-xl border border-amber-200/15 bg-black/25 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-200/35"
              value={judgmentQuestion}
              onChange={(event) => setJudgmentQuestion(event.target.value)}
              placeholder="Ex.: Tenho vocação para ensinar filosofia? / Problemas financeiros com um vizinho. / Como funciona minha motivação primária?"
            />
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Se preenchido, o motor não interpreta por conta própria: ele cria o NATAL_JUDGMENT_CONTEXT, resolve rotas de casas/derivações e prepara o pacote para a IA sob o Prompt Absoluto em português. A chamada ao modelo fica isolada num adapter server-side.
            </p>
          </div>
          {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-950/20 px-4 py-3 text-sm text-red-100/90">{error}</p>}
          <button className="default-btn mt-5" type="submit" disabled={loading}>{loading ? "Calculando…" : "Calcular mapa natal"}</button>
        </form>
      </section>

      {result && (
        <div className="space-y-7">
          <ChartPositionsSummary chart={result} />

          <section className="western-glass rounded-[1.6rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Validação de produção</p>
                <h2 className="section-title mt-1 text-2xl font-semibold text-amber-100">
                  {result.natalValidation.status === "PASS" ? "PASS — relatório liberado" : "FAIL — não enviar à IA"}
                </h2>
                <p className="mt-2 text-xs text-stone-400">
                  {Object.keys(result.natalValidation.checks).length} invariantes · {result.natalValidation.errors.length} erro(s) · {result.natalValidation.warnings.length} aviso(s)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="default-btn" disabled={!result.reportBundle.releasedForAi} title={!result.reportBundle.releasedForAi ? "Bloqueado: a validação de produção falhou" : undefined} onClick={() => downloadText("mapa-natal-relatorio-ia.txt", result.reportBundle.aiTechnicalReport)}>Salvar relatório IA</button>
                <button type="button" className="default-btn" onClick={() => downloadText("mapa-natal-auditoria.txt", result.reportBundle.auditTechnicalReport)}>Salvar auditoria</button>
                <button type="button" className="default-btn" disabled={!result.reportBundle.releasedForAi} title={!result.reportBundle.releasedForAi ? "Bloqueado: a validação de produção falhou" : undefined} onClick={() => downloadText("mapa-natal-formulario-ia.json", JSON.stringify(result.reportBundle.aiStructuredForm, null, 2), "application/json;charset=utf-8")}>Salvar JSON IA</button>
                <button type="button" className="default-btn" onClick={() => downloadText("mapa-natal-formulario-auditoria.json", JSON.stringify(result.reportBundle.auditStructuredForm, null, 2), "application/json;charset=utf-8")}>Salvar JSON auditoria</button>
                <button type="button" className="default-btn" disabled={!result.reportBundle.releasedForAi} onClick={() => downloadText("mapa-natal-prompt-absoluto.txt", result.reportBundle.absoluteNatalPrompt)}>Salvar Prompt Absoluto</button>
                <button type="button" className="default-btn" disabled={!result.reportBundle.releasedForAi} onClick={() => downloadText("mapa-natal-pacote-julgamento-absoluto.json", JSON.stringify(result.reportBundle.absoluteJudgmentPackage, null, 2), "application/json;charset=utf-8")}>Salvar pacote IA absoluto</button>
                <button type="button" className="default-btn" disabled={!result.reportBundle.aiIntegration.readyForProvider} title={!result.reportBundle.aiIntegration.readyForProvider ? result.reportBundle.aiIntegration.reason : "Contrato pronto para o adapter de IA"} onClick={() => downloadText("mapa-natal-invocacao-provedor-ia.json", JSON.stringify(result.reportBundle.aiIntegration, null, 2), "application/json;charset=utf-8")}>Salvar invocação do provedor</button>
              </div>
            </div>
            {result.natalValidation.errors.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-300/20 bg-red-950/20 p-4 text-sm text-red-100/90">
                {result.natalValidation.errors.map((item) => <p key={item.code}><strong>{item.code}:</strong> {item.message}</p>)}
              </div>
            )}
            {result.natalValidation.warnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200/20 bg-amber-950/10 p-4 text-sm text-amber-100/80">
                {result.natalValidation.warnings.map((item) => <p key={item.code}><strong>{item.code}:</strong> {item.message}</p>)}
              </div>
            )}
            <div className="mt-4 rounded-xl border border-amber-200/15 bg-black/15 p-4 text-sm text-stone-300">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100/70">Integração com IA</p>
              <p className="mt-2 font-semibold text-stone-100">{result.reportBundle.aiIntegration.status}</p>
              <p className="mt-1 text-xs leading-5 text-stone-400">{result.reportBundle.aiIntegration.reason}</p>
              <p className="mt-2 text-xs leading-5 text-stone-500">O provedor futuro entra somente como adapter server-side. O Prompt Absoluto, os três dossiês e o contrato de resposta já chegam montados; nenhuma regra astrológica deve ser reimplementada no provedor.</p>
            </div>
          </section>

          <section className="traditional-report-shell overflow-hidden rounded-[2rem]">
            <div className="border-b border-stone-300/70 px-6 py-5 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Formulário técnico integral</p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
                <h2 className="section-title text-3xl font-semibold text-slate-900">Relatório Natal</h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setReportView("ai")} className={`rounded-full border px-4 py-2 text-xs font-bold ${reportView === "ai" ? "border-slate-700 bg-slate-900 text-white" : "border-stone-300 text-slate-700"}`}>Para IA</button>
                  <button type="button" onClick={() => setReportView("audit")} className={`rounded-full border px-4 py-2 text-xs font-bold ${reportView === "audit" ? "border-slate-700 bg-slate-900 text-white" : "border-stone-300 text-slate-700"}`}>Auditoria</button>
                  <button type="button" onClick={() => setReportView("json-ai")} className={`rounded-full border px-4 py-2 text-xs font-bold ${reportView === "json-ai" ? "border-slate-700 bg-slate-900 text-white" : "border-stone-300 text-slate-700"}`}>JSON IA</button>
                  <button type="button" onClick={() => setReportView("json-audit")} className={`rounded-full border px-4 py-2 text-xs font-bold ${reportView === "json-audit" ? "border-slate-700 bg-slate-900 text-white" : "border-stone-300 text-slate-700"}`}>JSON auditoria</button>
                  <button type="button" onClick={() => setReportView("absolute-prompt")} className={`rounded-full border px-4 py-2 text-xs font-bold ${reportView === "absolute-prompt" ? "border-slate-700 bg-slate-900 text-white" : "border-stone-300 text-slate-700"}`}>Prompt absoluto</button>
                  <button type="button" onClick={() => setReportView("judgment-json")} className={`rounded-full border px-4 py-2 text-xs font-bold ${reportView === "judgment-json" ? "border-slate-700 bg-slate-900 text-white" : "border-stone-300 text-slate-700"}`}>Pacote IA absoluto</button>
                  <button type="button" onClick={() => setReportView("provider-json")} className={`rounded-full border px-4 py-2 text-xs font-bold ${reportView === "provider-json" ? "border-slate-700 bg-slate-900 text-white" : "border-stone-300 text-slate-700"}`}>Adapter IA</button>
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-xs leading-5 text-stone-500">
                “Para IA” omite scores históricos e coincidências estelares não source-locked. “Auditoria” preserva os ledgers e dados secundários. O JSON IA é saneado de scores/ledgers; o JSON auditoria conserva a estrutura completa para verificação humana.
              </p>
            </div>
            <pre className="traditional-report-text max-h-[72vh] overflow-auto whitespace-pre-wrap px-6 py-6 font-mono text-[12px] leading-6 sm:px-8 sm:text-[13px]">
              {displayedReport}
            </pre>
          </section>
        </div>
      )}
    </div>
  );
}
