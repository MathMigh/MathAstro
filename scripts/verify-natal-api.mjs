import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const baseUrl = process.env.MATHASTRO_BASE_URL ?? "http://127.0.0.1:3100";
const fixture = JSON.parse(
  await readFile(new URL("../fixtures/barra-mansa-santa-casa-2001.json", import.meta.url), "utf8"),
);

const response = await fetch(`${baseUrl}/api/birth-chart`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(fixture),
});

if (!response.ok) {
  throw new Error(`API retornou ${response.status}: ${await response.text()}`);
}
assert.equal(response.status, 200);
const chart = await response.json();
const closeTo = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} não está a ${tolerance} de ${expected}`);
};

assert.equal(chart.calculationMetadata.utcIso, "2001-04-21T09:45:00.000Z");
assert.equal(chart.calculationMetadata.timezone, "America/Sao_Paulo");
assert.equal(chart.calculationMetadata.houseSystem, "Regiomontanus");
assert.equal(chart.calculationMetadata.nodeMode, "Nodo verdadeiro");
closeTo(chart.housesData.ascendant, 37.9609288395979);
closeTo(chart.housesData.mc, 309.1731661472928);

const planet = (name) => chart.planets.find((item) => item.name === name);
closeTo(planet("Sol").longitudeRaw, 31.34861655952354);
closeTo(planet("Lua").longitudeRaw, 4.907786849688487);
closeTo(planet("Mercúrio").longitudeRaw, 29.090958716914365);
closeTo(planet("Saturno").longitudeRaw, 60.058259376878404);

assert.equal(chart.natalAnalysis.temperament.method, "Marcos Monteiro - cinco testemunhos");
assert.equal(chart.natalAnalysis.temperament.witnesses.length, 5);
assert.equal(chart.natalAnalysis.lordOfNativity.resolution, "essential-hierarchy");
assert.equal(chart.natalAnalysis.lordOfNativity.planet, "Saturno");
assert.equal(chart.natalAnalysis.lordOfGeniture[0].planet, "Saturno");
assert.equal(chart.natalAnalysis.chartAlmuten[0].planet, "Saturno");
assert.equal(chart.natalAnalysis.mentality.mercury.solarCondition, "sob-os-raios");
assert.equal(chart.natalAnalysis.mentality.moonMercuryConnection.connected, false);
assert.equal(chart.natalAnalysis.dispositors.globalFinalDispositor, null);
assert.ok(
  chart.natalAnalysis.dispositors.cycles.some((cycle) =>
    ["Marte", "Júpiter", "Mercúrio"].every((name) => cycle.includes(name))),
);
assert.ok(
  chart.natalAnalysis.fixedStars.relevantMatches.some((match) =>
    match.pointName === "Saturno" && match.starName === "Alcyone"),
);

for (const expected of [
  "Parte da Fortuna em Áries a 11°31’",
  "Parte do Espírito em Gêmeos a 4°25’",
  "Parte da Necessidade em Peixes a 15°04’",
  "Parte do Amor em Câncer a 0°52’",
  "Parte do Valor em Leão a 22°45’",
  "Parte da Vitória em Touro a 15°03’",
  "Parte do Cativeiro em Peixes a 19°26’",
  "Mercúrio está sob os raios",
  "Não há dispositor final global"
]) {
  assert.ok(chart.traditionalReport.includes(expected), expected);
}

console.log("Verificação natal concluída: caso Barra Mansa/Santa Casa aprovado.");
