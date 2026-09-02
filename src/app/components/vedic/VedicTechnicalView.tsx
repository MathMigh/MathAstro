"use client";

import type { JyotishSection } from "@/app/lib/jyotish/types";
import { formatStatus } from "@/app/lib/jyotish/engineHelpers";

function StatusBadge({ status }: { status: JyotishSection["status"] }) {
  const palette = {
    implemented: "border-emerald-200/60 bg-emerald-500/10 text-emerald-100",
    mixed: "border-amber-200/40 bg-amber-500/10 text-amber-50",
    placeholder: "border-slate-300/25 bg-white/[0.05] text-amber-100/76",
  }[status];

  return (
    <span className={`rounded-full border px-3 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.18em] ${palette}`}>
      {formatStatus(status)}
    </span>
  );
}

function TechnicalTable({
  title,
  description,
  columns,
  rows,
}: NonNullable<JyotishSection["tables"]>[number]) {
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-amber-200/14 bg-[#0b1024]/88">
      <div className="border-b border-amber-200/10 px-4 py-3">
        <h4 className="text-sm font-black uppercase tracking-[0.18em] text-amber-50">{title}</h4>
        {description ? <p className="mt-2 text-sm text-amber-100/68">{description}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-amber-50/88">
          <thead className="bg-white/[0.03] text-[0.68rem] uppercase tracking-[0.18em] text-amber-200/84">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-amber-200/8 align-top">
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${index}-${cellIndex}`} className="px-4 py-3 text-amber-50/78">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function VedicTechnicalView({
  sections,
  activeSectionId,
  onSelect,
}: {
  sections: JyotishSection[];
  activeSectionId: string;
  onSelect: (sectionId: string) => void;
}) {
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[16rem_1fr]">
      <aside className="rounded-[1.75rem] border border-amber-200/14 bg-white/[0.03] p-3">
        <div className="mb-3 px-2">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-amber-200/84">
            Abas internas
          </p>
        </div>
        <div className="grid gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={`rounded-[1.1rem] border px-3 py-3 text-left transition ${
                section.id === activeSection?.id
                  ? "border-amber-300/50 bg-amber-200/14 text-amber-50"
                  : "border-amber-200/12 bg-[#0a1023]/70 text-amber-100/76 hover:border-amber-200/26"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em]">{section.title}</span>
                <StatusBadge status={section.status} />
              </div>
            </button>
          ))}
        </div>
      </aside>

      {activeSection ? (
        <section className="rounded-[1.75rem] border border-amber-200/14 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-amber-200/84">
                Secao ativa
              </p>
              <h3 className="mt-2 text-2xl font-black text-amber-50">{activeSection.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-amber-100/74">
                {activeSection.description}
              </p>
            </div>
            <StatusBadge status={activeSection.status} />
          </div>

          {activeSection.items?.length ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {activeSection.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.35rem] border border-amber-200/14 bg-[#0b1024]/88 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-200/84">
                      {item.name}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-3 text-lg font-black text-amber-50">{String(item.value)}</p>
                  <p className="mt-2 text-sm leading-6 text-amber-100/70">{item.technicalNotes}</p>
                  {item.alerts.length ? (
                    <div className="mt-3 space-y-1 text-xs text-rose-200">
                      {item.alerts.map((alert) => (
                        <p key={alert}>{alert}</p>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {activeSection.tables?.length ? (
            <div className="mt-6 grid gap-4">
              {activeSection.tables.map((table) => (
                <TechnicalTable key={table.id} {...table} />
              ))}
            </div>
          ) : null}

          {activeSection.bullets?.length ? (
            <div className="mt-6 rounded-[1.35rem] border border-amber-200/14 bg-[#0b1024]/88 p-4">
              <ul className="space-y-2 text-sm leading-6 text-amber-100/74">
                {activeSection.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
