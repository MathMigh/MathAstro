import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishConfig, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

const SIGN_NAMES = [
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
] as const;
const PUSHKARA_NAVAMSHA_RULES = [
  {
    signs: new Set([0, 4, 8]),
    ranges: [
      { start: 20, end: 23 + 20 / 60, navamsaSign: "Tula" },
      { start: 26 + 40 / 60, end: 30, navamsaSign: "Dhanu" },
    ],
  },
  {
    signs: new Set([1, 5, 9]),
    ranges: [
      { start: 6 + 40 / 60, end: 10, navamsaSign: "Meena" },
      { start: 13 + 20 / 60, end: 16 + 40 / 60, navamsaSign: "Vrishabha" },
    ],
  },
  {
    signs: new Set([2, 6, 10]),
    ranges: [
      { start: 16 + 40 / 60, end: 20, navamsaSign: "Meena" },
      { start: 23 + 20 / 60, end: 26 + 40 / 60, navamsaSign: "Vrishabha" },
    ],
  },
  {
    signs: new Set([3, 7, 11]),
    ranges: [
      { start: 0, end: 3 + 20 / 60, navamsaSign: "Karka" },
      { start: 6 + 40 / 60, end: 10, navamsaSign: "Kanya" },
    ],
  },
] as const;
const PUSHKARA_BHAGA_DEGREES = [21, 14, 18, 8, 19, 9, 24, 11, 23, 14, 19, 9] as const;
const NAKSHATRA_ARC = 13 + 20 / 60;
const NAKSHATRA_SANDHI_ARC = 48 / 60;
const RASHI_SANDHI_ARC = 1;
const MRITYU_BHAGA_TABLES: Record<JyotishConfig["mrityuBhagaRules"], Record<string, readonly number[]>> = {
  "sarvartha-chintamani": {
    sun: [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
    moon: [8, 25, 22, 22, 21, 1, 4, 23, 18, 20, 20, 10],
    mars: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
    mercury: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
    jupiter: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
    venus: [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
    saturn: [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
    northNode: [14, 13, 12, 11, 24, 23, 22, 21, 10, 20, 18, 8],
    southNode: [8, 18, 20, 10, 21, 22, 23, 24, 11, 12, 13, 14],
    ascendant: [1, 9, 22, 22, 25, 2, 4, 23, 18, 20, 24, 10],
  },
  "phala-deepika": {
    sun: [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
    moon: [26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12],
    mars: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
    mercury: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
    jupiter: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
    venus: [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
    saturn: [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
    northNode: [14, 13, 12, 11, 24, 23, 22, 21, 10, 20, 18, 8],
    southNode: [8, 18, 20, 10, 21, 22, 23, 24, 11, 12, 13, 14],
    ascendant: [8, 9, 22, 22, 25, 14, 4, 23, 18, 20, 21, 10],
  },
};

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function formatDegree(value: number) {
  const normalized = modulo(value, 30);
  const degrees = Math.floor(normalized);
  const minutes = Math.floor((normalized - degrees) * 60 + 1e-9);
  return `${degrees}deg${String(minutes).padStart(2, "0")}'`;
}

function formatDistance(value: number) {
  return `${value.toFixed(2)}deg`;
}

function getPushkaraNavamsa(point: VedicPoint) {
  const rule = PUSHKARA_NAVAMSHA_RULES.find((entry) => entry.signs.has(point.signIndex));
  const match = rule?.ranges.find((range) => point.degreeInSign >= range.start && point.degreeInSign < range.end);
  return match
    ? {
        state: `${match.navamsaSign} (${formatDegree(match.start)}-${formatDegree(match.end)})`,
        active: true,
      }
    : {
        state: "--",
        active: false,
      };
}

function getPushkaraBhaga(point: VedicPoint) {
  const target = PUSHKARA_BHAGA_DEGREES[point.signIndex];
  const distance = Math.abs(point.degreeInSign - target);
  return {
    target,
    distance,
    state: distance <= 0.1 ? "Exato" : distance <= 1 ? "Vizinho" : "--",
  };
}

function getRashiSandhi(point: VedicPoint) {
  const distance = Math.min(point.degreeInSign, 30 - point.degreeInSign);
  return {
    distance,
    active: distance <= RASHI_SANDHI_ARC,
  };
}

function getNakshatraSandhi(point: VedicPoint) {
  const offset = modulo(point.longitude, NAKSHATRA_ARC);
  const distance = Math.min(offset, NAKSHATRA_ARC - offset);
  return {
    distance,
    active: distance <= NAKSHATRA_SANDHI_ARC,
  };
}

function getGandanta(point: VedicPoint) {
  const waterSigns = new Set([3, 7, 11]);
  const fireSigns = new Set([0, 4, 8]);
  const signGandanta =
    (waterSigns.has(point.signIndex) && point.degreeInSign >= 26 + 40 / 60) ||
    (fireSigns.has(point.signIndex) && point.degreeInSign <= 3 + 20 / 60);

  const nakshatraOffset = modulo(point.longitude, NAKSHATRA_ARC);
  const endBoundaryNakshatras = new Set([8, 17, 26]);
  const startBoundaryNakshatras = new Set([0, 9, 18]);
  const nakshatraGandanta =
    (endBoundaryNakshatras.has(point.nakshatraIndex) && nakshatraOffset >= NAKSHATRA_ARC - NAKSHATRA_SANDHI_ARC) ||
    (startBoundaryNakshatras.has(point.nakshatraIndex) && nakshatraOffset <= NAKSHATRA_SANDHI_ARC);

  return {
    signGandanta,
    nakshatraGandanta,
    state: signGandanta && nakshatraGandanta ? "Rashi + Nakshatra" : signGandanta ? "Rashi" : nakshatraGandanta ? "Nakshatra" : "--",
  };
}

function getMrityuBhaga(point: VedicPoint, rules: JyotishConfig["mrityuBhagaRules"]) {
  const degrees = MRITYU_BHAGA_TABLES[rules][point.key];
  if (!degrees) {
    return {
      target: undefined,
      state: "--",
      windowLabel: "--",
    };
  }

  const target = degrees[point.signIndex];
  const windowStart = Math.max(0, target - 1);
  const active = point.degreeInSign >= windowStart && point.degreeInSign < target;
  return {
    target,
    state: active ? "Ativo" : "--",
    windowLabel: `${windowStart}deg-${target}deg`,
  };
}

export function sensitivePointsEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot,
  config: Pick<JyotishConfig, "mrityuBhagaRules">
): EngineResult {
  const d9 = snapshot.vargas.find((chart) => chart.key === "D9");
  const rows = [snapshot.ascendant, ...snapshot.planets].map((point) => {
    const rashiSandhi = getRashiSandhi(point);
    const nakshatraSandhi = getNakshatraSandhi(point);
    const gandanta = getGandanta(point);
    const pushkaraNavamsa = getPushkaraNavamsa(point);
    const pushkaraBhaga = getPushkaraBhaga(point);
    const mrityuBhaga = getMrityuBhaga(point, config.mrityuBhagaRules);
    const d9Point = d9?.points.find((candidate) => candidate.key === point.key);
    const vargottama = d9Point?.signIndex === point.signIndex;

    return {
      point,
      rashiSandhi,
      nakshatraSandhi,
      gandanta,
      pushkaraNavamsa,
      pushkaraBhaga,
      mrityuBhaga,
      d9Point,
      vargottama,
    };
  });

  const pushkaraNavamsaCount = rows.filter((row) => row.pushkaraNavamsa.active).length;
  const pushkaraBhagaCount = rows.filter((row) => row.pushkaraBhaga.distance <= 1).length;
  const gandantaCount = rows.filter((row) => row.gandanta.state !== "--").length;
  const sandhiCount = rows.filter((row) => row.rashiSandhi.active || row.nakshatraSandhi.active).length;
  const vargottamaCount = rows.filter((row) => row.vargottama).length;
  const mrityuBhagaCount = rows.filter((row) => row.mrityuBhaga.state === "Ativo").length;
  const lagnaRow = rows[0];

  return {
    sections: [
      createSection({
        id: `${module}-sensitive-points`,
        title: "Pushkara, Gandanta, Sandhis e Mrityu",
        description:
          "Mostra pontos de sensibilidade e reforco do mapa natal: Pushkara Navamsha, Pushkara Bhaga, Vargottama, Rashi Sandhi, Nakshatra Sandhi, Gandanta e Mrityu Bhaga.",
        status: "implemented",
        items: [
          createDatum(module, "Pontos Sensiveis", "Escola do Mrityu Bhaga", config.mrityuBhagaRules, {
            technicalNotes:
              config.mrityuBhagaRules === "phala-deepika"
                ? "Usa a variante de Phala Deepika, em que Lua e Lagna seguem a tabela alternativa classica."
                : "Usa a variante de Sarvartha Chintamani / Jataka Parijata, com tabela mais restritiva para Lua e Lagna.",
            confidence: 0.78,
            status: "implemented",
            methodUsed: "mrityu-bhaga-school-selector-v1",
          }),
          createDatum(module, "Pontos Sensiveis", "Pontos em Pushkara Navamsha", pushkaraNavamsaCount, {
            technicalNotes:
              "A faixa de Pushkara Navamsha segue a malha classica dos 24 Pushkaras por elemento, apontando a navamsha nutridora do ponto.",
            confidence: 0.7,
            status: "implemented",
            methodUsed: "classical-pushkara-navamsa-v1",
          }),
          createDatum(module, "Pontos Sensiveis", "Pontos proximos ao Pushkara Bhaga", pushkaraBhagaCount, {
            technicalNotes:
              "Conta pontos a ate 1 grau do Pushkara Bhaga classico para auditoria rapida do mapa; a tabela expande a distancia exata.",
            confidence: 0.66,
            status: "implemented",
            methodUsed: "jataka-parijata-pushkara-bhaga-v1",
          }),
          createDatum(module, "Pontos Sensiveis", "Pontos em Gandanta", gandantaCount, {
            technicalNotes:
              "Gandanta e separado em camada de rashi e de nakshatra para nao misturar o no da agua-fogo com a simples proximidade de borda.",
            confidence: 0.72,
            status: "implemented",
            methodUsed: "classical-gandanta-v1",
          }),
          createDatum(module, "Pontos Sensiveis", "Pontos em Mrityu Bhaga", mrityuBhagaCount, {
            technicalNotes:
              `Usa aqui a tabela ${config.mrityuBhagaRules}, tratando o grau informado como faixa trimsamsica de 1 grau imediatamente anterior.`,
            confidence: 0.68,
            status: "implemented",
            methodUsed:
              config.mrityuBhagaRules === "phala-deepika"
                ? "mrityu-bhaga-phala-deepika-v1"
                : "mrityu-bhaga-sarvartha-chintamani-v1",
          }),
          createDatum(module, "Pontos Sensiveis", "Lagna sensivel", `${lagnaRow.gandanta.state !== "--" ? lagnaRow.gandanta.state : lagnaRow.rashiSandhi.active || lagnaRow.nakshatraSandhi.active ? "Sandhi" : "Estavel"}`, {
            technicalNotes:
              `Ascendente em ${snapshot.ascendant.signName} ${formatDegree(snapshot.ascendant.degreeInSign)}; ` +
              `distancia da rashi sandhi ${formatDistance(lagnaRow.rashiSandhi.distance)} e da nakshatra sandhi ${formatDistance(lagnaRow.nakshatraSandhi.distance)}.`,
            confidence: 0.74,
            status: "implemented",
            methodUsed: "sensitive-points-lagna-audit-v1",
          }),
          createDatum(module, "Pontos Sensiveis", "Pontos vargottama D1-D9", vargottamaCount, {
            technicalNotes:
              "Compara diretamente o signo do D1 com o do D9 para mostrar onde a assinatura do graha ou do Lagna se repete.",
            confidence: 0.76,
            status: "implemented",
            methodUsed: "d1-d9-vargottama-audit-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-sensitive-points-table`,
            "Pontos sensiveis do mapa",
            [
              "Ponto",
              "Signo",
              "Rashi Sandhi",
              "Nakshatra Sandhi",
              "Gandanta",
              "Pushkara Navamsha",
              "Pushkara Bhaga",
              "Mrityu Bhaga",
              "Vargottama D1-D9",
            ],
            rows.map((row) => [
              row.point.name,
              `${row.point.signName} ${formatDegree(row.point.degreeInSign)}`,
              row.rashiSandhi.active ? `Sim (${formatDistance(row.rashiSandhi.distance)})` : `Nao (${formatDistance(row.rashiSandhi.distance)})`,
              row.nakshatraSandhi.active
                ? `Sim (${formatDistance(row.nakshatraSandhi.distance)})`
                : `Nao (${formatDistance(row.nakshatraSandhi.distance)})`,
              row.gandanta.state,
              row.pushkaraNavamsa.state,
              row.pushkaraBhaga.state === "--"
                ? `Alvo ${row.pushkaraBhaga.target}deg (${formatDistance(row.pushkaraBhaga.distance)})`
                : `${row.pushkaraBhaga.state} ${row.pushkaraBhaga.target}deg (${formatDistance(row.pushkaraBhaga.distance)})`,
              row.mrityuBhaga.target
                ? `${row.mrityuBhaga.state === "Ativo" ? "Ativo" : "Faixa"} ${row.mrityuBhaga.windowLabel}`
                : "--",
              row.vargottama ? `Sim (${row.d9Point?.signName ?? "--"})` : row.d9Point?.signName ?? "Nao",
            ]),
            `Rashi Sandhi usa a borda de 1 grau; Nakshatra Sandhi e Gandanta de nakshatra usam a faixa curta de 48 minutos de arco; Mrityu Bhaga segue a faixa trimsamsica de 1 grau em modo ${config.mrityuBhagaRules}.`
          ),
        ],
      }),
    ],
    summary: [
      `Pushkara Navamsha em ${pushkaraNavamsaCount} ponto(s); faixa de Pushkara Bhaga auditada em todos os corpos.`,
      `Gandanta em ${gandantaCount} ponto(s), sandhis ativos em ${sandhiCount} ponto(s) e Mrityu Bhaga em ${mrityuBhagaCount} ponto(s).`,
      `Vargottama D1-D9 presente em ${vargottamaCount} ponto(s).`,
    ],
  };
}
