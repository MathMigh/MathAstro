import type { JyotishContext, JyotishModuleKey, JyotishModuleResult } from "./types";
import { astronomyEngine } from "./astronomyEngine";
import { rashiChartEngine } from "./rashiChartEngine";
import { bhavaEngine } from "./bhavaEngine";
import { vargaEngine } from "./vargaEngine";
import { nakshatraEngine } from "./nakshatraEngine";
import { panchangaEngine } from "./panchangaEngine";
import { balaEngine } from "./balaEngine";
import { ashtakavargaEngine } from "./ashtakavargaEngine";
import { avasthaEngine } from "./avasthaEngine";
import { upagrahaEngine } from "./upagrahaEngine";
import { yogaEngine } from "./yogaEngine";
import { yogaValidationEngine } from "./yogaValidationEngine";
import { dashaEngine } from "./dashaEngine";
import { jaiminiEngine } from "./jaiminiEngine";
import { arudhaEngine } from "./arudhaEngine";
import { argalaEngine } from "./argalaEngine";
import { specialLagnaEngine } from "./specialLagnaEngine";
import { functionalRolesEngine } from "./functionalRolesEngine";
import { sensitivePointsEngine } from "./sensitivePointsEngine";
import { themePanelEngine } from "./themePanelEngine";
import { gocharaEngine } from "./gocharaEngine";
import { varshaphalaEngine } from "./varshaphalaEngine";
import { muhurtaEngine } from "./muhurtaEngine";
import { prashnaEngine } from "./prashnaEngine";
import { vivahaEngine } from "./vivahaEngine";
import { kpEngine } from "./kpEngine";
import { buildPrintableHtml } from "./exportEngine";
import {
  createConfigSummary,
  filterAdvanced,
  formatStatus,
  normalizeEngineResults,
  withCoverage,
} from "./engineHelpers";

const MODULE_META: Record<JyotishModuleKey, { label: string; description: string }> = {
  janma: {
    label: "Janma Jyotish",
    description: "Modulo natal principal com Rasi, bhavas, vargas, nakshatras, bala, yogas e bases Jaimini.",
  },
  prashna: {
    label: "Prashna Jyotish",
    description: "Modulo horario védico voltado para o momento da pergunta e suas validacoes tecnicas.",
  },
  muhurta: {
    label: "Muhurta",
    description: "Modulo eletivo tecnico baseado em panchanga, Lua e sinalizacao do horario.",
  },
  varshaphala: {
    label: "Varshaphala",
    description: "Modulo anual vedico com abertura para Tajika, Muntha, Varshesh e dashas anuais.",
  },
  dasha: {
    label: "Dasha Shastra",
    description: "Modulo de periodos planetarios com foco em Vimshottari e reserva para familias classicas adicionais.",
  },
  gochara: {
    label: "Gochara",
    description: "Modulo de transitos vedicos com leitura a partir de Lagna, Lua e periodo ativo.",
  },
  vivaha: {
    label: "Vivaha Jyotish",
    description: "Modulo de casamento e compatibilidade vedica sem sentenca final automatica.",
  },
};

function buildModuleReport(module: JyotishModuleResult) {
  const lines = [
    module.label.toUpperCase(),
    "",
    module.description,
    "",
    "Sintese tecnica:",
    ...module.summary.map((line) => `- ${line}`),
    "",
  ];

  if (module.validations.length) {
    lines.push("Validacoes e alertas:");
    lines.push(...module.validations.map((validation) => `- [${validation.level.toUpperCase()}] ${validation.message}`));
    lines.push("");
  }

  for (const section of module.sections) {
    lines.push(`${section.title} [${formatStatus(section.status)}]`);
    lines.push(section.description);
    lines.push("");

    for (const item of section.items ?? []) {
      lines.push(`- ${item.name}: ${String(item.value)} | ${item.technicalNotes}`);
    }

    if (section.items?.length) {
      lines.push("");
    }

    for (const table of section.tables ?? []) {
      lines.push(`${table.title}:`);
      lines.push(table.columns.join(" | "));
      lines.push(...table.rows.map((row) => row.join(" | ")));
      lines.push("");
    }

    for (const bullet of section.bullets ?? []) {
      lines.push(`- ${bullet}`);
    }

    if (section.bullets?.length) {
      lines.push("");
    }
  }

  lines.push("Sintese final:");
  lines.push(
    "O relatorio destaca apenas forca, fraqueza, confirmacao, contradicao, dependencia de configuracao e potencial de ativacao por dasha quando a base tecnica ja permite."
  );

  return lines.join("\n");
}

function buildModuleJson(module: JyotishModuleResult) {
  return {
    key: module.key,
    label: module.label,
    description: module.description,
    summary: module.summary,
    validations: module.validations,
    coverage: module.coverage,
    sections: module.sections,
  };
}

export async function buildJyotishModules(context: JyotishContext) {
  const janmaResult = normalizeEngineResults(
    astronomyEngine("janma", context.primary, context),
    rashiChartEngine("janma", context.primary),
    bhavaEngine("janma", context.primary),
    vargaEngine("janma", context.primary),
    nakshatraEngine("janma", context.primary),
    await panchangaEngine("janma", context.primary),
    balaEngine("janma", context.primary),
    ashtakavargaEngine("janma", context.primary),
    avasthaEngine("janma", context.primary),
    await upagrahaEngine("janma", context.primary),
    yogaEngine("janma", context.primary),
    yogaValidationEngine("janma", context.primary),
    dashaEngine("janma", context.primary, context.config),
    jaiminiEngine("janma", context.primary),
    arudhaEngine("janma", context.primary),
    argalaEngine("janma", context.primary),
    specialLagnaEngine("janma", context.primary),
    functionalRolesEngine("janma", context.primary),
    sensitivePointsEngine("janma", context.primary, context.config),
    themePanelEngine("janma", context.primary),
    await kpEngine("janma", context.primary, context)
  );

  const prashnaResult = normalizeEngineResults(
    astronomyEngine("prashna", context.transit, context),
    rashiChartEngine("prashna", context.transit),
    await panchangaEngine("prashna", context.transit),
    prashnaEngine("prashna", context),
    yogaEngine("prashna", context.transit)
  );

  const muhurtaResult = normalizeEngineResults(
    astronomyEngine("muhurta", context.transit, context),
    await panchangaEngine("muhurta", context.transit),
    muhurtaEngine("muhurta", context),
    gocharaEngine("muhurta", context)
  );

  const varshaphalaResult = normalizeEngineResults(
    astronomyEngine("varshaphala", context.primary, context),
    dashaEngine("varshaphala", context.primary, context.config),
    gocharaEngine("varshaphala", context),
    await varshaphalaEngine("varshaphala", context)
  );

  const dashaResult = normalizeEngineResults(
    astronomyEngine("dasha", context.primary, context),
    dashaEngine("dasha", context.primary, context.config),
    yogaValidationEngine("dasha", context.primary),
    gocharaEngine("dasha", context)
  );

  const gocharaResult = normalizeEngineResults(
    astronomyEngine("gochara", context.primary, context),
    gocharaEngine("gochara", context),
    await panchangaEngine("gochara", context.transit)
  );

  const vivahaResult = normalizeEngineResults(
    astronomyEngine("vivaha", context.primary, context),
    vivahaEngine("vivaha", context),
    nakshatraEngine("vivaha", context.primary),
    jaiminiEngine("vivaha", context.primary)
  );

  const records: Record<JyotishModuleKey, ReturnType<typeof normalizeEngineResults>> = {
    janma: janmaResult,
    prashna: prashnaResult,
    muhurta: muhurtaResult,
    varshaphala: varshaphalaResult,
    dasha: dashaResult,
    gochara: gocharaResult,
    vivaha: vivahaResult,
  };

  return (Object.keys(records) as JyotishModuleKey[]).reduce<Record<JyotishModuleKey, JyotishModuleResult>>(
    (acc, key) => {
      const meta = MODULE_META[key];
      const raw = records[key];
      const sections = filterAdvanced(raw.sections, context.config.showAdvanced);
      const coverage = withCoverage(sections);
      const summary = [
        ...createConfigSummary(context),
        ...(raw.summary ?? []),
        `Cobertura atual: ${coverage.implemented} secoes calculadas, ${coverage.mixed} parciais e ${coverage.placeholder} estruturadas.`,
      ];
      const moduleResult: JyotishModuleResult = {
        key,
        label: meta.label,
        description: meta.description,
        summary,
        sections,
        validations: raw.validations ?? [],
        report: "",
        jsonExport: {},
        printableHtml: "",
        coverage,
      };

      moduleResult.report = buildModuleReport(moduleResult);
      moduleResult.jsonExport = buildModuleJson(moduleResult);
      moduleResult.printableHtml = buildPrintableHtml(moduleResult);

      acc[key] = moduleResult;
      return acc;
    },
    {} as Record<JyotishModuleKey, JyotishModuleResult>
  );
}
