import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

const PLANET_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"] as const;
const PLANET_LABELS: Record<(typeof PLANET_ORDER)[number], string> = {
  sun: "Surya",
  moon: "Chandra",
  mars: "Mangala",
  mercury: "Budha",
  jupiter: "Guru",
  venus: "Shukra",
  saturn: "Shani",
};
const SIGN_LORDS = [
  "mars",
  "venus",
  "mercury",
  "moon",
  "sun",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "saturn",
  "jupiter",
] as const;

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function houseSignIndex(snapshot: VedicSnapshot, house: number) {
  return modulo(snapshot.ascendant.signIndex + house - 1, 12);
}

function housesRuledByPlanet(snapshot: VedicSnapshot, planetKey: (typeof PLANET_ORDER)[number]) {
  return Array.from({ length: 12 }, (_, index) => index + 1).filter(
    (house) => SIGN_LORDS[houseSignIndex(snapshot, house)] === planetKey
  );
}

function isMovable(signIndex: number) {
  return [0, 3, 6, 9].includes(signIndex);
}

function isFixed(signIndex: number) {
  return [1, 4, 7, 10].includes(signIndex);
}

function badhakaHouse(snapshot: VedicSnapshot) {
  if (isMovable(snapshot.ascendant.signIndex)) return 11;
  if (isFixed(snapshot.ascendant.signIndex)) return 9;
  return 7;
}

function formatHouses(houses: number[]) {
  return houses.length ? houses.map((house) => `H${house}`).join(", ") : "--";
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function functionalTone(score: number) {
  if (score >= 2.5) return "Apoio funcional";
  if (score <= -2) return "Pressao funcional";
  return "Tom misto";
}

export function functionalRolesEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const badhaka = badhakaHouse(snapshot);
  const arishtaYogas = snapshot.yogas.filter((yoga) => yoga.toLowerCase().includes("arishta"));
  const rows = PLANET_ORDER.map((planetKey) => {
    const houses = housesRuledByPlanet(snapshot, planetKey);
    const kendra = houses.filter((house) => [1, 4, 7, 10].includes(house));
    const trikona = houses.filter((house) => [1, 5, 9].includes(house));
    const dusthana = houses.filter((house) => [6, 8, 12].includes(house));
    const upachaya = houses.filter((house) => [3, 6, 10, 11].includes(house));
    const rulesFiveOrNine = houses.some((house) => [5, 9].includes(house));
    const isLagnaLord = houses.includes(1);
    const isMaraka = houses.some((house) => [2, 7].includes(house));
    const isBadhakesha = houses.includes(badhaka);
    const isYogakaraka = houses.some((house) => [4, 7, 10].includes(house)) && rulesFiveOrNine;
    let score = 0;

    if (isYogakaraka) score += 3;
    if (isLagnaLord) score += 2;
    if (rulesFiveOrNine) score += 2;
    if (dusthana.includes(8)) score -= 2;
    if (dusthana.includes(6)) score -= 1.5;
    if (houses.includes(11)) score -= 1.25;
    if (houses.includes(12)) score -= 0.75;
    if (isMaraka) score -= 1.5;
    if (isBadhakesha) score -= 1.5;

    const tone = functionalTone(score);
    const note = unique([
      isLagnaLord ? "rege o Lagna" : "",
      rulesFiveOrNine ? "toca um eixo de trikona" : "",
      isYogakaraka ? "fecha combinacao classica de kendra + trikona" : "",
      isMaraka ? "rege casa maraka (2/7)" : "",
      isBadhakesha ? `rege a badhaka sthana (H${badhaka})` : "",
      dusthana.length ? `tambem rege ${formatHouses(dusthana)} como dusthana` : "",
      upachaya.length ? `entra em upachaya por ${formatHouses(upachaya)}` : "",
    ].filter(Boolean)).join("; ");

    return {
      planetKey,
      label: PLANET_LABELS[planetKey],
      houses,
      kendra,
      trikona,
      dusthana,
      isMaraka,
      isBadhakesha,
      isYogakaraka,
      score: Number(score.toFixed(2)),
      tone,
      note,
    };
  });

  const marakaRows = rows.filter((row) => row.isMaraka);
  const badhakeshaRows = rows.filter((row) => row.isBadhakesha);
  const yogakarakaRows = rows.filter((row) => row.isYogakaraka);
  const strongestSupport = [...rows].sort((left, right) => right.score - left.score)[0];

  return {
    sections: [
      createSection({
        id: `${module}-functional-roles`,
        title: "Regencias Funcionais por Lagna",
        description:
          "Abre a regencia de casas e os papeis funcionais para que o astrologo julgue o mapa com base em casa, senhorio, maraka, badhaka e yogakaraka.",
        status: "implemented",
        items: [
          createDatum(module, "Funcional", "Badhaka sthana", `H${badhaka}`, {
            technicalNotes:
              "Movable -> 11a, fixed -> 9a, dual -> 7a, no working set parasari configurado para badhaka.",
            relatedHouse: badhaka,
            confidence: 0.8,
            status: "implemented",
            methodUsed: "parasari-badhaka-v1",
          }),
          createDatum(module, "Funcional", "Badhakesha", badhakeshaRows.length ? badhakeshaRows.map((row) => row.label).join(", ") : "--", {
            technicalNotes:
              badhakeshaRows.length
                ? `Planetas que regem a H${badhaka} a partir do Lagna atual.`
                : "Nenhum badhakesha isolado no recorte atual.",
            confidence: badhakeshaRows.length ? 0.76 : 0.4,
            status: "implemented",
            methodUsed: "parasari-badhaka-v1",
          }),
          createDatum(module, "Funcional", "Maraka lords", marakaRows.length ? marakaRows.map((row) => row.label).join(", ") : "--", {
            technicalNotes: "Lordes das casas 2 e 7 destacados como camada maraka estrutural do mapa.",
            confidence: marakaRows.length ? 0.8 : 0.45,
            status: "implemented",
            methodUsed: "parasari-maraka-v1",
          }),
          createDatum(module, "Funcional", "Yogakaraka(s)", yogakarakaRows.length ? yogakarakaRows.map((row) => row.label).join(", ") : "Nenhum classico", {
            technicalNotes:
              "Marcado quando o mesmo graha rege simultaneamente um eixo de kendra (4/7/10) e de trikona (5/9).",
            confidence: yogakarakaRows.length ? 0.82 : 0.55,
            status: "implemented",
            methodUsed: "parasari-yogakaraka-v1",
          }),
          createDatum(module, "Funcional", "Maior apoio funcional", `${strongestSupport.label} | ${strongestSupport.tone}`, {
            technicalNotes: strongestSupport.note,
            confidence: 0.68,
            status: "implemented",
            methodUsed: "functional-tone-overlay-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-functional-roles-table`,
            "Mapa funcional dos grahas",
            ["Graha", "Casas regidas", "Kendra", "Trikona", "Dusthana", "Maraka", "Badhakesha", "Yogakaraka", "Tom", "Nota"],
            rows.map((row) => [
              row.label,
              formatHouses(row.houses),
              formatHouses(row.kendra),
              formatHouses(row.trikona),
              formatHouses(row.dusthana),
              row.isMaraka ? "Sim" : "Nao",
              row.isBadhakesha ? "Sim" : "Nao",
              row.isYogakaraka ? "Sim" : "Nao",
              row.tone,
              row.note || "--",
            ]),
            "A tabela nao sentencia fruto final; ela deixa explicitos os papeis que o astrologo precisa cruzar com bala, dignidade, avastha, yoga e dasha."
          ),
          createTable(
            `${module}-house-lordship-table`,
            "Casas e lordes",
            ["Casa", "Signo", "Lord"],
            Array.from({ length: 12 }, (_, index) => {
              const house = index + 1;
              const signIndex = houseSignIndex(snapshot, house);
              const lordKey = SIGN_LORDS[signIndex];
              return [
                `H${house}`,
                snapshot.ascendant.signName && SIGN_LORDS.length ? ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"][signIndex] : "--",
                PLANET_LABELS[lordKey as keyof typeof PLANET_LABELS] ?? lordKey,
              ];
            }),
            "Grade simples de senhorio para auditoria rapida das regencias do Lagna atual."
          ),
        ],
      }),
      createSection({
        id: `${module}-maraka-badhaka`,
        title: "Maraka, Badhaka e Arishta",
        description:
          "Separa as casas e os lordes de dano estrutural para o astrologo nao precisar inferir isso apenas pelo texto corrido.",
        status: "implemented",
        items: [
          createDatum(module, "Maraka", "Casas maraka", "H2 e H7", {
            technicalNotes: "Base parasari classica para camada maraka no mapa natal.",
            confidence: 0.8,
            status: "implemented",
            methodUsed: "parasari-maraka-v1",
          }),
          createDatum(module, "Badhaka", "Casa badhaka", `H${badhaka}`, {
            technicalNotes: "Derivada da modalidade do Lagna no working set parasari atual.",
            relatedHouse: badhaka,
            confidence: 0.8,
            status: "implemented",
            methodUsed: "parasari-badhaka-v1",
          }),
          createDatum(module, "Arishta", "Arishta yogas detectados", arishtaYogas.length ? arishtaYogas.join("; ") : "Nenhum catalogado", {
            technicalNotes:
              arishtaYogas.length
                ? "Familia de risco detectada nominalmente no catalogo atual de yogas."
                : "Nao houve yoga com rotulo explicito de arishta no snapshot atual.",
            confidence: arishtaYogas.length ? 0.62 : 0.48,
            status: "implemented",
            methodUsed: "catalogo-yoga-arishta-v1",
          }),
        ],
        bullets: [
          "A camada funcional nao substitui o julgamento final por bala, dignidade, avastha, drishti e dasha.",
          "Casas 6, 8 e 12 continuam explicitadas dentro da grade funcional para mostrar onde o graha mistura apoio e dano.",
        ],
      }),
    ],
    summary: [
      `Regencias funcionais abertas para o Lagna em ${snapshot.ascendant.signName}, com H${badhaka} marcada como badhaka.`,
      "Maraka, badhaka, yogakaraka e tom funcional de cada graha agora saem como dados auditaveis e nao apenas inferencia textual.",
    ],
  };
}
