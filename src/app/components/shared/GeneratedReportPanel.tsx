"use client";

import { useMemo, useState } from "react";
import { FiCopy, FiDownload, FiFileText, FiGrid } from "react-icons/fi";

interface GeneratedReportPanelProps {
  brand?: string;
  title: string;
  description: string;
  report: string;
  filename: string;
  jsonData?: unknown;
  pdfTitle?: string;
}

interface ReportRow {
  label: string;
  value: string;
}

interface ReportSection {
  title: string;
  rows: ReportRow[];
  bullets: string[];
  paragraphs: string[];
}

interface ParsedReport {
  metaRows: ReportRow[];
  metaParagraphs: string[];
  sections: ReportSection[];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isHeading(line: string) {
  const value = line.trim();

  if (!value || value.startsWith("- ")) {
    return false;
  }

  if (value.endsWith(":") && !value.includes(": ")) {
    return value.length > 2;
  }

  if (value.includes(":")) {
    return false;
  }

  return value.length > 2 && value === value.toUpperCase();
}

function parseRow(line: string) {
  const divider = line.indexOf(": ");

  if (divider <= 0 || divider > 48) {
    return null;
  }

  return {
    label: line.slice(0, divider).trim(),
    value: line.slice(divider + 2).trim(),
  };
}

function parseReport(report: string): ParsedReport {
  const lines = report.split(/\r?\n/).map((line) => line.trimEnd());
  const metaRows: ReportRow[] = [];
  const metaParagraphs: string[] = [];
  const sections: ReportSection[] = [];
  let currentSection: ReportSection | null = null;
  let index = 0;

  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }

  if (index < lines.length && isHeading(lines[index]) && lines[index].includes("RELATORIO")) {
    index += 1;
  }

  for (; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) {
      continue;
    }

    if (isHeading(line)) {
      currentSection = {
        title: line,
        rows: [],
        bullets: [],
        paragraphs: [],
      };
      sections.push(currentSection);
      continue;
    }

    if (line.startsWith("- ")) {
      if (currentSection) {
        currentSection.bullets.push(line.slice(2).trim());
      } else {
        metaParagraphs.push(line.slice(2).trim());
      }
      continue;
    }

    const row = parseRow(line);

    if (row) {
      if (currentSection) {
        currentSection.rows.push(row);
      } else {
        metaRows.push(row);
      }
      continue;
    }

    if (currentSection) {
      currentSection.paragraphs.push(line);
    } else {
      metaParagraphs.push(line);
    }
  }

  return {
    metaRows,
    metaParagraphs,
    sections,
  };
}

function collectHighlights(parsed: ParsedReport) {
  const prioritySets = [
    [
      "Lagna",
      "Lua",
      "Sol",
      "Atmakaraka",
      "Mahadasha ativa",
      "Antardasha ativa",
      "Yogini Dasha ativa",
      "Karakamsa",
    ],
    [
      "Mestre do Dia",
      "Pilar do Dia",
      "Estrutura do mapa",
      "Elemento dominante",
      "Yong Shen",
      "Da Yun atual",
      "Pilar anual",
      "Mesma natureza elementar",
    ],
  ];

  const rows = [...parsed.metaRows, ...parsed.sections.flatMap((section) => section.rows)];

  const rankedSets = prioritySets
    .map((priorities) =>
      priorities
        .map((label) => rows.find((row) => row.label === label))
        .filter((row): row is ReportRow => Boolean(row))
    )
    .sort((left, right) => right.length - left.length);

  return rankedSets[0]?.slice(0, 6) ?? [];
}

function buildPrintableHtml(
  title: string,
  description: string,
  parsed: ParsedReport,
  highlights: ReportRow[]
) {
  const highlightHtml = highlights.length
    ? `<section class="highlight-grid">${highlights
        .map(
          (item) => `
            <article class="chip-card">
              <span class="chip-label">${escapeHtml(item.label)}</span>
              <span class="chip-value">${escapeHtml(item.value)}</span>
            </article>`
        )
        .join("")}</section>`
    : "";

  const metaHtml = parsed.metaRows.length
    ? `<section class="meta-grid">${parsed.metaRows
        .map(
          (row) => `
            <article class="meta-card">
              <p class="meta-label">${escapeHtml(row.label)}</p>
              <p class="meta-value">${escapeHtml(row.value)}</p>
            </article>`
        )
        .join("")}</section>`
    : "";

  const introHtml = parsed.metaParagraphs.length
    ? `<section class="body-card">
        <h2 class="section-title">Síntese</h2>
        ${parsed.metaParagraphs
          .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
          .join("")}
      </section>`
    : "";

  const sectionHtml = parsed.sections
    .map((section) => {
      const rows = section.rows.length
        ? `<div class="rows">${section.rows
            .map(
              (row) => `
                <div class="row">
                  <p class="row-label">${escapeHtml(row.label)}</p>
                  <p class="row-value">${escapeHtml(row.value)}</p>
                </div>`
            )
            .join("")}</div>`
        : "";

      const paragraphs = section.paragraphs.length
        ? `<div class="paragraphs">${section.paragraphs
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join("")}</div>`
        : "";

      const bullets = section.bullets.length
        ? `<div class="bullet-card">${section.bullets
            .map((bullet) => `<p>&bull; ${escapeHtml(bullet)}</p>`)
            .join("")}</div>`
        : "";

      return `
        <section class="body-card">
          <h2 class="section-title">${escapeHtml(section.title)}</h2>
          ${rows}
          ${paragraphs}
          ${bullets}
        </section>`;
    })
    .join("");

  return `<!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Georgia, serif; margin: 28px; color: #221b12; background: #f7f0e5; }
          h1 { margin: 0; font-size: 30px; }
          .lede { margin-top: 8px; color: #6b5b45; line-height: 1.7; }
          .highlight-grid, .meta-grid { display: grid; gap: 12px; margin-top: 18px; }
          .highlight-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .meta-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .chip-card, .meta-card, .body-card {
            border: 1px solid rgba(143, 108, 41, 0.22);
            background: rgba(255, 255, 255, 0.78);
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: 0 10px 28px rgba(95, 74, 31, 0.08);
          }
          .chip-label, .meta-label, .row-label, .section-title {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #8b6522;
          }
          .chip-value, .meta-value {
            display: block;
            margin-top: 8px;
            font-size: 14px;
            line-height: 1.7;
            color: #362b1f;
          }
          .body-card { margin-top: 16px; }
          .section-title { margin-bottom: 14px; }
          .rows { display: grid; gap: 10px; }
          .row {
            display: grid;
            gap: 8px;
            grid-template-columns: 180px minmax(0, 1fr);
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(244, 237, 225, 0.78);
          }
          .row-value, .paragraphs p, .bullet-card p {
            margin: 0;
            font-size: 13px;
            line-height: 1.8;
            color: #3f3429;
          }
          .paragraphs { display: grid; gap: 10px; margin-top: 12px; }
          .bullet-card {
            margin-top: 12px;
            border-radius: 14px;
            padding: 12px;
            background: rgba(245, 229, 193, 0.44);
          }
          @media print {
            body { background: #fff; margin: 18px; }
            .chip-card, .meta-card, .body-card { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p class="lede">${escapeHtml(description)}</p>
        ${highlightHtml}
        ${metaHtml}
        ${introHtml}
        ${sectionHtml}
      </body>
    </html>`;
}

export default function GeneratedReportPanel({
  brand = "Math, o Mágico",
  title,
  description,
  report,
  filename,
  jsonData,
  pdfTitle,
}: GeneratedReportPanelProps) {
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const parsed = useMemo(() => parseReport(report), [report]);
  const highlights = useMemo(() => collectHighlights(parsed), [parsed]);
  const printableHtml = useMemo(
    () => buildPrintableHtml(pdfTitle ?? title, description, parsed, highlights),
    [description, highlights, parsed, pdfTitle, title]
  );

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopyLabel("Copiado");
      window.setTimeout(() => setCopyLabel("Copiar"), 1600);
    } catch (error) {
      console.error("Falha ao copiar relatorio:", error);
      setCopyLabel("Falha");
      window.setTimeout(() => setCopyLabel("Copiar"), 1600);
    }
  }

  function downloadReport() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadJson() {
    if (!jsonData) {
      return;
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/\.txt$/i, ".json");
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");

    if (!printWindow) {
      return;
    }

    printWindow.document.write(printableHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <section className="traditional-report-shell overflow-hidden rounded-[1.75rem]">
      <div className="flex flex-col gap-4 border-b border-slate-400/15 px-5 pb-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="section-eyebrow text-[0.62rem]!">{brand}</span>
          <h2 className="section-title text-2xl font-semibold text-slate-900">
            {title}
          </h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={copyReport}
            className="inline-flex items-center gap-2 rounded-full border border-amber-700/20 bg-white/70 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-900 transition-colors hover:bg-white"
          >
            <FiCopy />
            {copyLabel}
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex items-center gap-2 rounded-full border border-amber-700/20 bg-white/70 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-900 transition-colors hover:bg-white"
          >
            <FiDownload />
            Baixar .txt
          </button>
          {jsonData ? (
            <button
              type="button"
              onClick={downloadJson}
              className="inline-flex items-center gap-2 rounded-full border border-amber-700/20 bg-white/70 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-900 transition-colors hover:bg-white"
            >
              <FiDownload />
              Baixar JSON
            </button>
          ) : null}
          <button
            type="button"
            onClick={exportPdf}
            className="inline-flex items-center gap-2 rounded-full border border-amber-700/20 bg-white/70 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-900 transition-colors hover:bg-white"
          >
            <FiDownload />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-5 pb-5 pt-4">
        {highlights.length ? (
          <div className="flex flex-wrap gap-2">
            {highlights.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-amber-700/14 bg-white/75 px-3 py-2 text-[0.72rem] text-amber-950 shadow-sm"
              >
                <span className="font-extrabold uppercase tracking-[0.16em] text-amber-800">
                  {item.label}
                </span>
                <span className="break-words font-semibold text-slate-700 whitespace-normal">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {parsed.metaRows.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {parsed.metaRows.map((row) => (
              <article
                key={`${row.label}-${row.value}`}
                className="rounded-[1.3rem] border border-amber-700/14 bg-white/72 p-4 shadow-sm"
              >
                <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-amber-800">
                  {row.label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 break-words">
                  {row.value}
                </p>
              </article>
            ))}
          </div>
        ) : null}

        {parsed.metaParagraphs.length ? (
          <article className="rounded-[1.3rem] border border-amber-700/14 bg-white/68 p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-amber-800">
              <FiGrid />
              Sintese
            </div>
            <div className="space-y-3 text-sm leading-7 text-slate-700">
              {parsed.metaParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ) : null}

        {parsed.sections.length ? (
          <div className="grid gap-4 2xl:grid-cols-2">
            {parsed.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.45rem] border border-amber-700/14 bg-white/70 p-4 shadow-[0_18px_36px_rgba(116,84,30,0.08)]"
              >
                <div className="mb-4 inline-flex items-center gap-2 text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-amber-800">
                  <FiFileText />
                  {section.title}
                </div>

                {section.rows.length ? (
                  <div className="space-y-3">
                    {section.rows.map((row) => (
                      <div
                        key={`${section.title}-${row.label}`}
                        className="grid min-w-0 gap-2 rounded-2xl border border-stone-200/80 bg-stone-50/85 p-3 xl:grid-cols-[13rem_minmax(0,1fr)]"
                      >
                        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-stone-500">
                          {row.label}
                        </p>
                        <p className="text-sm leading-6 text-stone-700 break-words">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {section.paragraphs.length ? (
                  <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    {section.paragraphs.map((paragraph) => (
                      <p key={`${section.title}-${paragraph}`}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}

                {section.bullets.length ? (
                  <div className="mt-4 rounded-2xl border border-amber-700/12 bg-amber-50/70 p-4">
                    <div className="space-y-2 text-sm leading-6 text-stone-700">
                      {section.bullets.map((bullet) => (
                        <p key={`${section.title}-${bullet}`}>- {bullet}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <pre className="traditional-report-text max-h-[70vh] overflow-x-auto whitespace-pre-wrap rounded-[1.35rem] border border-amber-700/14 bg-white/72 px-5 pb-5 pt-4 font-mono text-[0.8rem] leading-7 md:text-[0.92rem]">
            {report}
          </pre>
        )}

        <details className="rounded-[1.35rem] border border-amber-700/14 bg-white/62">
          <summary className="cursor-pointer list-none px-5 py-4 text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-amber-800">
            Texto integral
          </summary>
          <pre className="traditional-report-text max-h-[70vh] overflow-x-auto whitespace-pre-wrap border-t border-amber-700/10 px-5 pb-5 pt-4 font-mono text-[0.8rem] leading-7 md:text-[0.92rem]">
            {report}
          </pre>
        </details>
      </div>
    </section>
  );
}
