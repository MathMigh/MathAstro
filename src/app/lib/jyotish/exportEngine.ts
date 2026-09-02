import type { JyotishModuleResult } from "./types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildPrintableHtml(module: JyotishModuleResult) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(module.label)}</title>
    <style>
      body { font-family: Georgia, serif; margin: 32px; color: #1f1720; }
      h1, h2 { margin: 0 0 12px; }
      section { margin: 24px 0; page-break-inside: avoid; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
      th, td { border: 1px solid #d3c5ab; padding: 8px; text-align: left; vertical-align: top; }
      ul { padding-left: 18px; }
      .muted { color: #6a5d52; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(module.label)}</h1>
    <p class="muted">${escapeHtml(module.description)}</p>
    ${module.sections
      .map(
        (section) => `<section>
          <h2>${escapeHtml(section.title)}</h2>
          <p class="muted">${escapeHtml(section.description)}</p>
          ${
            section.items?.length
              ? `<ul>${section.items
                  .map(
                    (item) =>
                      `<li><strong>${escapeHtml(item.name)}:</strong> ${escapeHtml(String(item.value))} <span class="muted">(${escapeHtml(item.technicalNotes)})</span></li>`
                  )
                  .join("")}</ul>`
              : ""
          }
          ${
            section.tables?.length
              ? section.tables
                  .map(
                    (table) => `<table>
                      <thead><tr>${table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
                      <tbody>${table.rows
                        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
                        .join("")}</tbody>
                    </table>`
                  )
                  .join("")
              : ""
          }
        </section>`
      )
      .join("")}
  </body>
</html>`;
}
