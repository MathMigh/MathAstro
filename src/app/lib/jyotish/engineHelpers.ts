import type {
  EngineResult,
  JyotishContext,
  JyotishCoverage,
  JyotishModuleKey,
  JyotishSection,
  JyotishSectionStatus,
  JyotishTable,
  JyotishTechnicalDatum,
  JyotishValidation,
} from "./types";

export function createDatum(
  module: JyotishModuleKey,
  category: string,
  name: string,
  value: string | number | boolean,
  options: Partial<Omit<JyotishTechnicalDatum, "id" | "module" | "category" | "name" | "value">> = {}
): JyotishTechnicalDatum {
  return {
    id: `${module}-${category}-${name}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    name,
    category,
    module,
    value,
    methodUsed: options.methodUsed ?? "motor-tecnico-interno",
    technicalNotes: options.technicalNotes ?? "",
    confidence: options.confidence ?? 0.7,
    dependencies: options.dependencies ?? [],
    alerts: options.alerts ?? [],
    status: options.status ?? "implemented",
    unit: options.unit,
    relatedPlanet: options.relatedPlanet,
    relatedHouse: options.relatedHouse,
    relatedSign: options.relatedSign,
    relatedNakshatra: options.relatedNakshatra,
    relatedVarga: options.relatedVarga,
    sanskritName: options.sanskritName,
  };
}

export function createSection(
  section: JyotishSection
): JyotishSection {
  return section;
}

export function createTable(
  id: string,
  title: string,
  columns: string[],
  rows: string[][],
  description?: string,
  advanced?: boolean
): JyotishTable {
  return { id, title, columns, rows, description, advanced };
}

export function createValidation(
  level: JyotishValidation["level"],
  message: string,
  field?: string,
  method?: string
): JyotishValidation {
  return { level, message, field, method };
}

export function withCoverage(sections: JyotishSection[]): JyotishCoverage {
  return sections.reduce<JyotishCoverage>(
    (acc, section) => {
      acc[section.status] += 1;
      return acc;
    },
    { implemented: 0, mixed: 0, placeholder: 0 }
  );
}

export function normalizeEngineResults(...results: EngineResult[]): EngineResult {
  return {
    sections: results.flatMap((result) => result.sections),
    validations: results.flatMap((result) => result.validations ?? []),
    summary: results.flatMap((result) => result.summary ?? []),
  };
}

export function createConfigSummary(context: JyotishContext): string[] {
  return [
    `Ayanamsha ${context.config.ayanamsha} | Bhava ${context.config.houseSystem} | Bhava Chalit ${context.config.bhavaChalitSystem}.`,
    context.config.kpEnabled
      ? `Camada KP separada em ${context.config.kpAyanamsha} + ${context.config.kpHouseSystem} | Ruling Planets ${context.config.kpRulingPlanetMode}.`
      : "Camada KP separada desligada nesta rodada.",
    `Dasha principal ${context.config.primaryDasha} e secundaria ${context.config.secondaryDasha}.`,
    context.config.secondaryDasha === "kalachakra"
      ? `Kalachakra em modo escolar ${context.config.kalachakraCycleMode}.`
      : "Kalachakra segue em modo padrao fora do foco principal.",
    context.config.includeNodes
      ? `Rahu e Ketu incluidos; drishti dos nodos em modo ${context.config.nodeAspectMode}.`
      : "Rahu e Ketu excluidos das tecnicas opcionais.",
    `Mrityu Bhaga em modo ${context.config.mrityuBhagaRules}.`,
    `Ashta Koota em modo ${context.config.ashtaKootaMode} | Kuja Dosha em modo ${context.config.kujaDoshaRules}.`,
  ];
}

export function signDistance(fromIndex: number, toIndex: number) {
  return ((toIndex - fromIndex) % 12 + 12) % 12;
}

export function formatDate(dateText: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateText}T00:00:00Z`));
}

export function filterAdvanced<T extends { advanced?: boolean }>(
  items: T[],
  showAdvanced: boolean
) {
  return showAdvanced ? items : items.filter((item) => !item.advanced);
}

export function formatStatus(status: JyotishSectionStatus) {
  return {
    implemented: "Calculado",
    mixed: "Parcial",
    placeholder: "Estruturado",
  }[status];
}
