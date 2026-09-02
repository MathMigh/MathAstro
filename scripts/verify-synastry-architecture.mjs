import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const manifestPath = path.join(root, ".audit", "SYNASTRY_NATAL_BOUNDARY_SHA256.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const failures = [];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

for (const [relative, expected] of Object.entries(manifest.sha256)) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    failures.push(`Arquivo protegido ausente: ${relative}`);
    continue;
  }
  const actual = sha256(file);
  if (actual !== expected) failures.push(`Arquivo protegido alterado: ${relative}`);
}

const natalRoot = path.join(root, "src", "traditions", "western", "natal");
for (const entry of fs.readdirSync(natalRoot, { recursive: true })) {
  const file = path.join(natalRoot, entry);
  if (!fs.statSync(file).isFile()) continue;
  const text = fs.readFileSync(file, "utf8");
  if (/from\s+["'][^"']*(?:synastry|sinastria)|import\s+[^;]*(?:synastry|sinastria)/i.test(text)) {
    failures.push(`Natal importou sinastria: ${path.relative(root, file)}`);
  }
}

const enginePath = path.join(root, "src", "traditions", "western", "synastry", "synastryEngine.ts");
const contractPath = path.join(root, "src", "traditions", "western", "synastry", "synastryMethodContract.ts");
const apiPath = path.join(root, "src", "app", "api", "synastry", "route.ts");
for (const required of [enginePath, contractPath, apiPath]) {
  if (!fs.existsSync(required)) failures.push(`Componente de sinastria ausente: ${path.relative(root, required)}`);
}

if (fs.existsSync(enginePath)) {
  const engine = fs.readFileSync(enginePath, "utf8");
  if (!engine.includes("calculateNatalAnalysis")) failures.push("Sinastria não consome o fundamento natal read-only esperado.");
  if (/compatibilityScore|compatibilityPercent|overallCompatibilityScore/i.test(engine)) failures.push("Motor contém identificador de escore/percentual de compatibilidade proibido.");
  if (/cross-chart-applying|applying.*chartA.*chartB/i.test(engine)) failures.push("Motor parece inferir aplicação/separação entre épocas diferentes.");
}

if (failures.length) {
  console.error("VERIFICAÇÃO DE SINASTRIA: FALHOU");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`VERIFICAÇÃO DE SINASTRIA: OK — ${Object.keys(manifest.sha256).length} arquivos natais/core preservados.`);
