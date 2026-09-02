"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  FixedStarCatalogMetadata,
  FixedStarMatch,
  FixedStarPosition,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { getPlanetImage } from "@/app/utils/chartUtils";

interface Props {
  matches?: FixedStarMatch[];
  catalog?: FixedStarPosition[];
  metadata?: FixedStarCatalogMetadata;
}

type SkyFilter = "all" | "major15" | "above";

function getPointLabel(match: FixedStarMatch) {
  if (!match.pointPlanetType) {
    return <span className="font-semibold tracking-[0.08em]">{match.pointName}</span>;
  }
  return (
    <div className="flex items-center justify-center gap-2">
      {getPlanetImage(match.pointPlanetType as PlanetType, { size: 18 })}
      <span>{match.pointName}</span>
    </div>
  );
}

function getStarTone(match: FixedStarMatch) {
  if (match.note && match.nature) return `${match.nature} - ${match.note}`;
  return match.nature ?? match.note ?? "-";
}

function signed(value?: number, digits = 2) {
  if (value === undefined || !Number.isFinite(value)) return "-";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}°`;
}

export default function FixedStarsTable({ matches = [], catalog = [], metadata }: Props) {
  const [mode, setMode] = useState<"contacts" | "sky">("sky");
  const [filter, setFilter] = useState<SkyFilter>("all");
  const [query, setQuery] = useState("");
  const [showAuditContacts, setShowAuditContacts] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filteredSky = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return catalog.filter((star) => {
      if (filter === "major15" && !star.isAstroSeekMajor15) return false;
      if (filter === "above" && !star.aboveHorizon) return false;
      if (!q) return true;
      return [star.name, star.traditionalName, star.nomenclature, star.constellationCode]
        .filter(Boolean)
        .some((item) => String(item).toLocaleLowerCase().includes(q));
    });
  }, [catalog, filter, query]);

  const interpretiveMatches = useMemo(() => matches.filter((match) => match.isRelevant), [matches]);
  const contactRows = showAuditContacts ? matches : interpretiveMatches;

  const totalPages = Math.max(1, Math.ceil(filteredSky.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredSky.slice((safePage - 1) * pageSize, safePage * pageSize);

  function switchFilter(next: SkyFilter) {
    setFilter(next);
    setPage(1);
  }

  return (
    <section className="w-full">
      <div className="mb-3 flex w-full flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="section-eyebrow text-[0.62rem]!">Céu Natal</p>
          <h2 className="text-lg font-bold text-slate-900 md:text-xl">Estrelas Fixas</h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600 md:text-sm">
            O catálogo completo e os contatos interpretativos são camadas separadas. A ausência de contato nunca significa falha ou ausência de estrelas no céu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-700">
          <span className="rounded-full border border-amber-200 bg-white px-3 py-2">
            {metadata ? `${metadata.calculatedEntries} estrelas calculadas` : `${catalog.length} estrelas`}
          </span>
          {metadata?.aboveHorizonEntries !== undefined && (
            <span className="rounded-full border border-amber-200 bg-white px-3 py-2">
              {metadata.aboveHorizonEntries} acima do horizonte
            </span>
          )}
          <span className="rounded-full border border-amber-200 bg-white px-3 py-2">Marcos: comuns 1° · principais 2–3° máx.</span>
        </div>
      </div>

      {metadata?.calculationMode === "failed" && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
          Falha explícita do motor de estrelas fixas. O sistema não tratará isto como “nenhuma estrela”.
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode("sky")} className={`rounded-full px-4 py-2 text-xs font-semibold ${mode === "sky" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>
          Céu natal completo
        </button>
        <button type="button" onClick={() => setMode("contacts")} className={`rounded-full px-4 py-2 text-xs font-semibold ${mode === "contacts" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>
          Contatos interpretativos ({interpretiveMatches.length})
        </button>
      </div>

      {mode === "sky" ? (
        <>
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => switchFilter("all")} className={`rounded-full border px-3 py-1.5 text-xs ${filter === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>Todas</button>
              <button type="button" onClick={() => switchFilter("major15")} className={`rounded-full border px-3 py-1.5 text-xs ${filter === "major15" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>15 principais (visual)</button>
              <button type="button" onClick={() => switchFilter("above")} className={`rounded-full border px-3 py-1.5 text-xs ${filter === "above" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white"}`}>Acima do horizonte</button>
            </div>
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Buscar estrela ou designação"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none md:w-72"
            />
          </div>

          <div className="overflow-x-auto rounded-[1.3rem] border border-amber-200 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
            <table className="min-w-[1050px] w-full text-left text-xs text-slate-800">
              <thead className="bg-[#f9f2e6] text-[0.68rem] uppercase tracking-[0.12em] text-slate-700">
                <tr>
                  <th className="px-3 py-3">Estrela</th><th className="px-3 py-3">Const.</th><th className="px-3 py-3">Longitude</th>
                  <th className="px-3 py-3">Lat.</th><th className="px-3 py-3">RA</th><th className="px-3 py-3">Dec.</th>
                  <th className="px-3 py-3">Mag.</th><th className="px-3 py-3">Casa R/P</th><th className="px-3 py-3">Horizonte</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((star) => (
                  <tr key={star.key} className="border-t border-amber-100 even:bg-amber-50/30">
                    <td className="px-3 py-2.5 font-semibold">{star.name}<span className="ml-2 text-[0.68rem] font-normal text-slate-500">{star.nomenclature}</span></td>
                    <td className="px-3 py-2.5">{star.constellationCode ?? "-"}</td>
                    <td className="px-3 py-2.5 font-medium">{star.longitudeSign}</td>
                    <td className="px-3 py-2.5">{signed(star.latitude)}</td>
                    <td className="px-3 py-2.5">{star.rightAscension.toFixed(3)}°</td>
                    <td className="px-3 py-2.5">{signed(star.declination, 3)}</td>
                    <td className="px-3 py-2.5">{star.magnitude?.toFixed(2) ?? "-"}</td>
                    <td className="px-3 py-2.5">{star.houseRegiomontanus ?? "-"}/{star.housePlacidus ?? "-"}</td>
                    <td className="px-3 py-2.5">{star.aboveHorizon ? `acima ${signed(star.altitude)}` : `abaixo ${signed(star.altitude)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pageRows.length && <div className="px-4 py-8 text-center text-sm text-slate-600">Nenhuma estrela corresponde ao filtro.</div>}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>{filteredSky.length} resultado(s)</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40">Anterior</button>
              <span>{safePage}/{totalPages}</span>
              <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40">Próxima</button>
            </div>
          </div>
        </>
      ) : (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-xs text-slate-700">
            <span>Por padrão, esta aba mostra somente contatos liberados para interpretação com proveniência e orbe válidos.</span>
            <button type="button" onClick={() => setShowAuditContacts((value) => !value)} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold">
              {showAuditContacts ? "Ocultar coincidências de auditoria" : `Ver coincidências de auditoria (${matches.length - interpretiveMatches.length})`}
            </button>
          </div>
        <table className="flex w-full flex-col overflow-hidden rounded-[1.6rem] border border-amber-200 bg-[#fffdfa] text-center text-[0.75rem] text-slate-800 shadow-[0_18px_45px_rgba(0,0,0,0.08)] md:text-sm">
          <thead className="bg-[linear-gradient(180deg,#fffaf0_0%,#f6ead5_100%)]">
            <tr className="flex flex-row justify-between border-b border-amber-200 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-700 md:text-[0.76rem]">
              <th className="w-3/4 border-r border-amber-200 px-2 py-3">Elemento</th><th className="w-full border-r border-amber-200 px-2 py-3">Estrela</th>
              <th className="w-full border-r border-amber-200 px-2 py-3">Posição</th><th className="w-2/3 border-r border-amber-200 px-2 py-3">Orbe</th><th className="w-full px-2 py-3">Natureza</th>
            </tr>
          </thead>
          {contactRows.length > 0 ? (
            <tbody className="flex flex-col bg-white">
              {contactRows.map((match) => (
                <tr className="flex flex-row border-t border-amber-100 even:bg-amber-50/30" key={match.key}>
                  <td className="flex min-h-[2.9rem] w-3/4 items-center justify-center border-r border-amber-200 px-2 py-2">{getPointLabel(match)}</td>
                  <td className="flex min-h-[2.9rem] w-full items-center justify-center border-r border-amber-200 px-3 py-2 text-left">
                    <div className="flex items-center gap-2"><Image alt="fixed-star" src={match.isRelevant ? "/table-relevant-star.png" : "/star.png"} width={11} height={11}/><span className={match.isRelevant ? "font-semibold text-[#4015fa]" : "font-medium"}>{match.starName}{match.starNomenclature ? <span className="ml-1 text-[0.65rem] font-normal text-slate-500">[{match.starNomenclature}]</span> : null}</span></div>
                  </td>
                  <td className="flex min-h-[2.9rem] w-full items-center justify-center border-r border-amber-200 px-2 py-2">{match.starLongitudeLabel}</td>
                  <td className="flex min-h-[2.9rem] w-2/3 items-center justify-center border-r border-amber-200 px-2 py-2 font-semibold">{match.orbLabel}</td>
                  <td className="flex min-h-[2.9rem] w-full items-center justify-center px-3 py-2 text-xs leading-5 text-slate-700">{getStarTone(match)}</td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody className="flex flex-col bg-white"><tr className="flex flex-row border-t border-amber-100"><td className="w-full px-4 py-6 text-slate-700">{catalog.length ? "Céu natal calculado, mas nenhum contato passou pelos filtros interpretativos ativos." : "O catálogo estelar não foi calculado."}</td></tr></tbody>
          )}
          <tfoot className="flex items-center justify-between border-t border-amber-200 bg-[#f9f2e6] px-4 py-3 text-sm font-semibold text-slate-700"><span>{showAuditContacts ? "Total auditável" : "Total interpretativo"}</span><span>{contactRows.length}</span></tfoot>
        </table>
        </div>
      )}
    </section>
  );
}
