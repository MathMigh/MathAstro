import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

const SIGNS = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrischika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
];

const SIGN_LORD_KEYS = [
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

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

function forwardArc(start: number, end: number) {
  return normalize360(end - start);
}

function midpoint(start: number, end: number) {
  return normalize360(start + forwardArc(start, end) / 2);
}

function angularDistance(first: number, second: number) {
  return Math.min(forwardArc(first, second), forwardArc(second, first));
}

function isWithinArc(value: number, start: number, end: number) {
  const arcLength = forwardArc(start, end);
  const valueOffset = forwardArc(start, value);
  return valueOffset < arcLength || Math.abs(valueOffset - arcLength) < 0.0001;
}

function formatLongitude(longitude: number) {
  const normalized = normalize360(longitude);
  const signIndex = Math.floor(normalized / 30) % 12;
  const degreeInSign = normalized - signIndex * 30;
  return `${SIGNS[signIndex]} ${degreeInSign.toFixed(2)}deg`;
}

function buildBhavaFrames(cusps: number[]) {
  if (cusps.length !== 12) {
    return [];
  }

  return cusps.map((cusp, index) => ({
    house: index + 1,
    cusp: normalize360(cusp),
    start: midpoint(cusps[(index + 11) % 12], cusp),
    end: midpoint(cusp, cusps[(index + 1) % 12]),
  }));
}

function determineChalitHouse(longitude: number, cusps: number[]) {
  const frames = buildBhavaFrames(cusps);
  const normalized = normalize360(longitude);

  const match = frames.find((frame) => isWithinArc(normalized, frame.start, frame.end));
  return match?.house;
}

export function bhavaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const bhavaFrames = buildBhavaFrames(snapshot.siderealHouseCusps);
  const lordshipRows = Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const signIndex = (snapshot.ascendant.signIndex + index) % 12;
    const signName = SIGNS[signIndex];
    const houseLord = snapshot.planets.find((point) => point.key === SIGN_LORD_KEYS[signIndex]);
    const occupants = snapshot.planets.filter((point) => point.house === house);

    return [
      `${house}`,
      signName,
      houseLord?.name ?? "--",
      houseLord ? `${houseLord.signName} / casa ${houseLord.house}` : "--",
      occupants.length ? occupants.map((point) => point.name).join(", ") : "--",
    ];
  });
  const chalitRows = [snapshot.ascendant, ...snapshot.planets].map((point) => {
    const chalitHouse = determineChalitHouse(point.longitude, snapshot.siderealHouseCusps) ?? point.house;
    const nearestSandhi = bhavaFrames.length
      ? Math.min(
          ...bhavaFrames.flatMap((frame) => [
            angularDistance(point.longitude, frame.start),
            angularDistance(point.longitude, frame.end),
          ])
        )
      : undefined;

    return {
      point,
      chalitHouse,
      nearestSandhi,
      changed: point.house !== chalitHouse,
    };
  });
  const changedRows = chalitRows.filter((entry) => entry.changed);
  const nearSandhiRows = chalitRows.filter((entry) => (entry.nearestSandhi ?? Number.POSITIVE_INFINITY) <= 3);

  return {
    sections: [
      createSection({
        id: `${module}-lordships`,
        title: "Bhavas, Lordships e Regencias",
        description:
          "Organiza as doze casas, seus regentes operacionais e a forca comparativa de casa no recorte atual.",
        status: "implemented",
        items: snapshot.bhavabala.map((house) =>
          createDatum(module, "Bhava Bala", `Casa ${house.house}`, house.score, {
            unit: "pontos",
            relatedHouse: house.house,
            relatedPlanet: house.lord,
            technicalNotes: `${house.note}. Rupas: ${house.rupas}.`,
            confidence: 0.72,
            status: "implemented",
          })
        ),
        tables: [
          createTable(
            `${module}-lordships-table`,
            "Lordships operacionais",
            ["Casa", "Signo", "Regente", "Posicao do regente", "Ocupantes"],
            lordshipRows,
            "Representacao inicial das regencias da carta principal.",
          ),
        ],
      }),
      createSection({
        id: `${module}-bhava-chalit`,
        title: "Bhava Chalit",
        description:
          "Compara a casa inteira por signo com a leitura por cuspides sidereais e sandhis derivados do eixo medio entre os madhyas.",
        status: bhavaFrames.length === 12 ? "implemented" : "placeholder",
        items: [
          createDatum(
            module,
            "Bhava Chalit",
            "Bhava Madhya",
            bhavaFrames.length === 12 ? "12 cuspides sidereais carregadas" : "Cuspides insuficientes",
            {
              technicalNotes:
                "Os madhyas usam as cuspides sidereais vindas do motor base apos aplicacao do ayanamsha configurado.",
              confidence: bhavaFrames.length === 12 ? 0.84 : 0.4,
              status: bhavaFrames.length === 12 ? "implemented" : "placeholder",
            }
          ),
          createDatum(
            module,
            "Bhava Chalit",
            "Bhava Sandhi",
            `${nearSandhiRows.length} pontos a menos de 3deg de uma sandhi`,
            {
              technicalNotes:
                "Pontos muito proximos da borda entre casas pedem mais cuidado na leitura de mudanca de casa.",
              confidence: bhavaFrames.length === 12 ? 0.78 : 0.35,
              status: bhavaFrames.length === 12 ? "implemented" : "placeholder",
            }
          ),
          createDatum(
            module,
            "Bhava Chalit",
            "Mudanca de casa no Chalit",
            `${changedRows.length} pontos mudam de casa`,
            {
              technicalNotes:
                "Comparacao entre a casa whole-sign herdada do snapshot e a casa reconstruida pelas sandhis do Bhava Chalit.",
              confidence: bhavaFrames.length === 12 ? 0.8 : 0.35,
              status: bhavaFrames.length === 12 ? "implemented" : "placeholder",
            }
          ),
        ],
        tables: [
          createTable(
            `${module}-bhava-chalit-frame`,
            "Madhyas e sandhis",
            ["Casa", "Bhava Madhya", "Sandhi inicial", "Sandhi final"],
            bhavaFrames.map((frame) => [
              `${frame.house}`,
              formatLongitude(frame.cusp),
              formatLongitude(frame.start),
              formatLongitude(frame.end),
            ]),
            "Cada casa recebe um madhya e duas bordas derivadas dos pontos medios entre cuspides consecutivas."
          ),
          createTable(
            `${module}-bhava-chalit-shifts`,
            "Mudancas de casa no Chalit",
            ["Ponto", "Longitude", "Casa Rasi", "Casa Chalit", "Distancia da sandhi"],
            changedRows.length
              ? changedRows.map((entry) => [
                  entry.point.name,
                  formatLongitude(entry.point.longitude),
                  `${entry.point.house}`,
                  `${entry.chalitHouse}`,
                  `${entry.nearestSandhi?.toFixed(2) ?? "--"}deg`,
                ])
              : [["Nenhum", "--", "--", "--", "--"]],
            "A troca aparece quando o ponto cruza a faixa delimitada pelas sandhis, mesmo que o signo continue o mesmo."
          ),
        ],
      }),
    ],
  };
}
