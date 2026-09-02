import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const fixture = JSON.parse(fs.readFileSync(path.join(root, "fixtures/synastry-v4-temperament-regression.json"), "utf8"));
const moduleUrl = pathToFileURL(path.join(root, "src/traditions/western/synastry/temperamentBond.ts")).href;
const { classifySynastryTemperamentBond } = await import(moduleUrl);

const failures = [];
for (const test of fixture) {
  const actual = classifySynastryTemperamentBond(test.similarCount, test.complementaryCount, test.anyIndeterminate);
  if (actual !== test.expected) failures.push(`${test.name}: esperado ${test.expected}, obtido ${actual}`);
}

const method = fs.readFileSync(path.join(root, "docs/MathAstro_METODO_ABSOLUTO_INTEGRAL_SINASTRIA_v4_PROFESSOR_ASTROLOGO.md"), "utf8");
const prompt = fs.readFileSync(path.join(root, "docs/MathAstro_PROMPT_ABSOLUTO_SINASTRIA_PTBR_v4_PROFESSOR_ASTROLOGO.txt"), "utf8");
const contract = fs.readFileSync(path.join(root, "src/traditions/western/synastry/synastryMethodContract.ts"), "utf8");
const ai = fs.readFileSync(path.join(root, "src/traditions/western/synastry/synastryAIPacket.ts"), "utf8");

const requireText = (text, needle, label) => { if (!text.includes(needle)) failures.push(label); };
requireText(method, "Núcleo da Relação", "Método v4 sem Núcleo da Relação");
requireText(prompt, "integracao-preferencial", "Prompt v4 sem matriz temperamental corrigida");
requireText(contract, "corroborative-direct", "Contrato sem Gugu corroborative-direct");
requireText(contract, "uso uniforme de 5°", "Contrato sem derivação explícita do teto uniforme de 5°");
requireText(contract, "Frawley explícito para orbe/hierarquia; Marcos explícito para antíscio em cúspide", "Contrato sem separação correta de proveniência dos antíscios");
requireText(ai, "MathAstro.SynastryAIEvidence.v4", "Envelope IA não foi elevado à v4");

if (failures.length) {
  console.error("REGRESSÃO SINASTRIA v4: FALHOU");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log(`REGRESSÃO SINASTRIA v4: OK — ${fixture.length} casos temperamentais + contrato pedagógico/proveniência.`);
