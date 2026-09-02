import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let ts;
try {
  ts = require("typescript");
} catch {
  ts = require("/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js");
}

const root = process.cwd();
const files = [
  "src/traditions/western/synastry/types.ts",
  "src/traditions/western/synastry/temperamentBond.ts",
  "src/traditions/western/synastry/synastryMethodContract.ts",
  "src/traditions/western/synastry/synastryEngine.ts",
  "src/traditions/western/synastry/synastryReport.ts",
  "src/traditions/western/synastry/synastryAIPacket.ts",
  "src/traditions/western/synastry/index.ts",
  "src/app/api/synastry/route.ts",
  "src/app/components/synastry/SynastrySetupPanel.tsx",
  "src/app/components/synastry/TraditionalSynastryPanel.tsx",
  "src/app/components/charts/PresavedChartsDropdown.tsx",
  "src/app/components/charts/BirthChart.tsx",
  "src/app/components/charts/SinastryChart.tsx",
  "src/app/components/ChartAndData.tsx",
  "src/app/components/charts/AstroChart.tsx",
  "src/interfaces/AstroChartInterfaces.ts",
];

let failed = false;
for (const relative of files) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    failed = true;
    console.error(`AUSENTE: ${relative}`);
    continue;
  }
  const source = fs.readFileSync(absolute, "utf8");
  const result = ts.transpileModule(source, {
    fileName: relative,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      isolatedModules: true,
    },
  });
  const errors = (result.diagnostics ?? []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    failed = true;
    console.error(`\n${relative}`);
    for (const diagnostic of errors) {
      console.error(`  TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
    }
  }
}

const engine = fs.readFileSync(path.join(root, "src/traditions/western/synastry/synastryEngine.ts"), "utf8");
const types = fs.readFileSync(path.join(root, "src/traditions/western/synastry/types.ts"), "utf8");
const contract = fs.readFileSync(path.join(root, "src/traditions/western/synastry/synastryMethodContract.ts"), "utf8");
const report = fs.readFileSync(path.join(root, "src/traditions/western/synastry/synastryReport.ts"), "utf8");
const ai = fs.readFileSync(path.join(root, "src/traditions/western/synastry/synastryAIPacket.ts"), "utf8");
const setup = fs.readFileSync(path.join(root, "src/app/components/synastry/SynastrySetupPanel.tsx"), "utf8");
const panel = fs.readFileSync(path.join(root, "src/app/components/synastry/TraditionalSynastryPanel.tsx"), "utf8");
const birth = fs.readFileSync(path.join(root, "src/app/components/charts/BirthChart.tsx"), "utf8");

const analysisStart = engine.indexOf("export function calculateSynastryAnalysis");
const analysisBody = analysisStart >= 0 ? engine.slice(analysisStart) : "";
const indexTemp = analysisBody.indexOf("buildTemperamentBond");
const indexPattern = analysisBody.indexOf("buildNatalInteractionPattern");
const indexCompare = analysisBody.indexOf("compareInteractionPatterns");
const indexContacts = analysisBody.indexOf("collectCrossAspects");

const invariants = [
  [types.includes('methodVersion: "4.0.0"'), "methodVersion 4.0.0 ausente"],
  [types.includes('moonDirectAspect'), "aspecto natal Lua↔papel não está tipado"],
  [types.includes('calculationCompleteness'), "auditoria de completude não está tipada"],
  [types.includes('| "custom";'), "modo de papéis personalizados ausente"],
  [engine.includes('if (a.pointType === "cusp" && b.pointType === "cusp") continue;'), "bloqueio de aspecto cúspide-cúspide ausente"],
  [engine.includes("crossContactProvenance"), "proveniência por tipo de contato ausente"],
  [engine.includes("SYNASTRY_CUSP_ASPECT_MAX_ORB = 5"), "teto de 5° para planeta↔cúspide, sustentado pelo exemplo de Frawley, ausente"],
  [engine.includes("SYNASTRY_ANTISCION_MAX_ORB = 1"), "teto de ~1° para antíscios de Frawley ausente"],
  [engine.includes("classifySynastryTemperamentBond"), "motor não usa classificador temperamental v4 testável"],
  [engine.includes('aspectWeight = aspectType === "conjunction" || aspectType === "opposition" ? "principal" : "secondary"'), "hierarquia principal/secundária dos aspectos por antíscio ausente"],
  [engine.includes('["square", "opposition"].includes(pattern.directAspect.aspect)'), "quadratura/oposição não estão materializadas como aspectos difíceis no padrão natal"],
  [engine.includes('"a-moon-to-b-role"') && engine.includes('"b-moon-to-a-role-cusp"'), "Lua secundária ausente da ressonância dos papéis"],
  [engine.includes("buildCalculationCompleteness"), "auditoria mecânica de completude ausente"],
  [indexTemp >= 0 && indexPattern >= 0 && indexTemp < indexPattern, "temperamento não é calculado antes dos padrões de papel na rotina principal"],
  [indexPattern >= 0 && indexCompare >= 0 && indexContacts >= 0 && indexPattern < indexCompare && indexCompare < indexContacts, "ordem estrutural não garante padrões/comparação antes dos contatos"],
  [!engine.includes('if (!chartA.fixedStarMatches?.length)'), "zero contatos de estrelas está sendo confundido com dado ausente no mapa A"],
  [!engine.includes('if (!chartB.fixedStarMatches?.length)'), "zero contatos de estrelas está sendo confundido com dado ausente no mapa B"],
  [contract.includes("SYNASTRY_INTERACTION_PRESETS"), "presets centralizados de papéis ausentes"],
  [contract.includes("universal-house-1-7-for-all-relations"), "proibição de I–VII universal ausente"],
  [contract.includes("corroborative-direct") && contract.includes("a primeira coisa a analisar deve ser o temperamento"), "corroboração direta de Gugu sobre temperamento primeiro ausente"],
  [report.includes("ANEXO JSON INTEGRAL"), "relatório não contém anexo integral para IA"],
  [report.includes("Estado da Lua"), "relatório não materializa estado da Lua no padrão de papel"],
  [ai.includes('schema: "MathAstro.SynastryAIEvidence.v4"'), "schema canônico para IA v4 ausente"],
  [ai.includes("CALCULATION_COMPLETENESS") && ai.includes("MISSING_ENGINE_DATA"), "contrato de completude/não-recálculo para IA ausente"],
  [setup.includes("Papéis personalizados") && setup.includes("O que você quer entender nesta relação?"), "front guiado de contexto/papéis incompleto"],
  [setup.includes("Limite do método"), "front não expõe limite temporal da sinastria estática"],
  [panel.includes("Copiar pacote para IA") && panel.includes("Copiar relatório completo"), "ações de saída amigáveis ausentes"],
  [birth.includes("customRole:") && birth.includes("userContext:"), "front não envia papel personalizado/contexto à API"],
];
for (const [ok, message] of invariants) {
  if (!ok) {
    failed = true;
    console.error(`INVARIANTE: ${message}`);
  }
}

if (failed) process.exit(1);
console.log(`VERIFICAÇÃO SINTÁTICA DE SINASTRIA: OK — ${files.length} unidades TS/TSX e invariantes v4.0.`);
