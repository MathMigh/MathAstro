import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

const SIGN_PAIRS = [
  { signs: [0, 7] as const, lord: "Mangala" },
  { signs: [1, 6] as const, lord: "Shukra" },
  { signs: [2, 5] as const, lord: "Budha" },
  { signs: [8, 11] as const, lord: "Guru" },
  { signs: [9, 10] as const, lord: "Shani" },
];

const TRINE_GROUPS = [
  [0, 4, 8],
  [1, 5, 9],
  [2, 6, 10],
  [3, 7, 11],
];

const HOUSE_THEMES = [
  "Lagna e corpo",
  "Recursos",
  "Esforco",
  "Lar e base",
  "Criacao",
  "Risco e doenca",
  "Parcerias",
  "Mudanca profunda",
  "Dharma e viagens",
  "Carreira",
  "Ganhos",
  "Perdas e moksha",
];
const CLASSICAL_GRAHA_KEYS = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
] as const;
const RASI_GUNAKARA = [7, 10, 8, 4, 10, 6, 7, 8, 9, 5, 11, 12] as const;
const GRAHA_GUNAKARA: Record<(typeof CLASSICAL_GRAHA_KEYS)[number], number> = {
  sun: 5,
  moon: 5,
  mars: 8,
  mercury: 5,
  jupiter: 10,
  venus: 7,
  saturn: 5,
};

function applyTrikonaShodhana(values: number[]) {
  const adjusted = [...values];

  const rows = TRINE_GROUPS.map((group) => {
    const original = group.map((index) => values[index]);
    const removal = Math.min(...original);
    const reduced = original.map((value) => value - removal);

    group.forEach((index, offset) => {
      adjusted[index] = reduced[offset];
    });

    return {
      group,
      original,
      removal,
      reduced,
    };
  });

  return { adjusted, rows };
}

function buildOccupancyMap(snapshot: VedicSnapshot) {
  return Array.from({ length: 12 }, (_, signIndex) =>
    snapshot.planets.filter(
      (point) => point.signIndex === signIndex && CLASSICAL_GRAHA_KEYS.includes(point.key as (typeof CLASSICAL_GRAHA_KEYS)[number])
    ).length
  );
}

function applyEkadhipatyaShodhana(values: number[], occupancies: number[]) {
  const adjusted = [...values];

  const rows = SIGN_PAIRS.map(({ signs: [leftIndex, rightIndex], lord }) => {
    const left = adjusted[leftIndex];
    const right = adjusted[rightIndex];
    const leftOccupied = occupancies[leftIndex] > 0;
    const rightOccupied = occupancies[rightIndex] > 0;

    if (left === 0 || right === 0) {
      return {
        lord,
        leftIndex,
        rightIndex,
        before: [left, right],
        after: [left, right],
        note: "Sem reducao porque um dos signos ja esta zerado.",
      };
    }

    if (leftOccupied && rightOccupied) {
      return {
        lord,
        leftIndex,
        rightIndex,
        before: [left, right],
        after: [left, right],
        note: "Par ocupado nos dois lados; o motor preserva a dupla no working set v1.",
      };
    }

    const reduction = Math.min(left, right);
    if (leftOccupied && !rightOccupied) {
      adjusted[rightIndex] = right - reduction;
      return {
        lord,
        leftIndex,
        rightIndex,
        before: [left, right],
        after: [left, adjusted[rightIndex]],
        note: "O signo vazio perde a base comum do par neste working set ocupacional.",
      };
    }

    if (!leftOccupied && rightOccupied) {
      adjusted[leftIndex] = left - reduction;
      return {
        lord,
        leftIndex,
        rightIndex,
        before: [left, right],
        after: [adjusted[leftIndex], right],
        note: "O signo vazio perde a base comum do par neste working set ocupacional.",
      };
    }

    adjusted[leftIndex] = left - reduction;
    adjusted[rightIndex] = right - reduction;

    return {
      lord,
      leftIndex,
      rightIndex,
      before: [left, right],
      after: [adjusted[leftIndex], adjusted[rightIndex]],
      note: "Par sem ocupacao explicita: o motor remove a base comum dos dois lados.",
    };
  });

  return { adjusted, rows };
}

function rankResidualHouses(adjusted: number[], ascendantSignIndex: number) {
  return adjusted
    .map((value, signIndex) => {
      const house = ((signIndex - ascendantSignIndex + 12) % 12) + 1;
      return {
        signIndex,
        house,
        value,
        theme: HOUSE_THEMES[house - 1],
      };
    })
    .sort((left, right) => right.value - left.value || left.house - right.house);
}

function buildPindaRows(snapshot: VedicSnapshot, occupancyMap: number[]) {
  const classicalPoints = snapshot.planets.filter((point) =>
    CLASSICAL_GRAHA_KEYS.includes(point.key as (typeof CLASSICAL_GRAHA_KEYS)[number])
  );

  return snapshot.ashtakavarga.rows
    .map((row) => {
      const point = classicalPoints.find((candidate) => candidate.name === row.label);
      if (!point) {
        return null;
      }

      const trikona = applyTrikonaShodhana(row.scores);
      const ekadhipatya = applyEkadhipatyaShodhana(trikona.adjusted, occupancyMap);
      const rasiPinda = ekadhipatya.adjusted.reduce(
        (sum, value, signIndex) => sum + value * RASI_GUNAKARA[signIndex],
        0
      );
      const grahaContributions = classicalPoints.map((occupant) => {
        const weight = GRAHA_GUNAKARA[occupant.key as keyof typeof GRAHA_GUNAKARA];
        const bindus = ekadhipatya.adjusted[occupant.signIndex];
        const value = bindus * weight;
        return {
          owner: point,
          occupant,
          bindus,
          weight,
          value,
        };
      });
      const grahaPinda = grahaContributions.reduce((sum, entry) => sum + entry.value, 0);
      const topResidualSignIndex = ekadhipatya.adjusted.reduce(
        (best, current, index) => (current > ekadhipatya.adjusted[best] ? index : best),
        0
      );
      const dominantGraha = [...grahaContributions].sort((left, right) => right.value - left.value)[0];

      return {
        point,
        rasiPinda,
        grahaPinda,
        yogaPinda: rasiPinda + grahaPinda,
        topResidualSignIndex,
        dominantGraha,
        ekadhipatyaAdjusted: ekadhipatya.adjusted,
        grahaContributions,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

export function ashtakavargaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const totals = snapshot.ashtakavarga.totals;
  const topSignIndex = totals.reduce(
    (best, current, index) => (current > totals[best] ? index : best),
    0
  );
  const occupancyMap = buildOccupancyMap(snapshot);
  const contributorsBySign = snapshot.ashtakavarga.signs.map((sign, signIndex) => {
    const contributors = snapshot.ashtakavarga.rows
      .filter((row) => row.scores[signIndex] > 0)
      .map((row) => row.label);

    return {
      sign,
      signIndex,
      contributors,
      total: totals[signIndex],
    };
  });
  const trikona = applyTrikonaShodhana(totals);
  const ekadhipatya = applyEkadhipatyaShodhana(trikona.adjusted, occupancyMap);
  const residualHouses = rankResidualHouses(ekadhipatya.adjusted, snapshot.ascendant.signIndex);
  const strongestPostShodhanaIndex = ekadhipatya.adjusted.reduce(
    (best, current, index) => (current > ekadhipatya.adjusted[best] ? index : best),
    0
  );
  const pindaRows = buildPindaRows(snapshot, occupancyMap);
  const strongestYogaPinda = [...pindaRows].sort((left, right) => right.yogaPinda - left.yogaPinda)[0];
  const strongestRasiPinda = [...pindaRows].sort((left, right) => right.rasiPinda - left.rasiPinda)[0];
  const strongestGrahaPinda = [...pindaRows].sort((left, right) => right.grahaPinda - left.grahaPinda)[0];
  const pindaDetailRows = pindaRows.flatMap((entry) =>
    entry.grahaContributions.map((contribution) => [
      entry.point.name,
      contribution.occupant.name,
      snapshot.ashtakavarga.signs[contribution.occupant.signIndex],
      contribution.bindus.toString(),
      contribution.weight.toString(),
      contribution.value.toString(),
    ])
  );
  const pindaWeightRows = [
    ...snapshot.ashtakavarga.signs.map((sign, index) => [
      "Rasi",
      sign,
      RASI_GUNAKARA[index].toString(),
    ]),
    ...snapshot.planets
      .filter((point) => CLASSICAL_GRAHA_KEYS.includes(point.key as (typeof CLASSICAL_GRAHA_KEYS)[number]))
      .map((point) => [
        "Graha",
        point.name,
        GRAHA_GUNAKARA[point.key as keyof typeof GRAHA_GUNAKARA].toString(),
      ]),
  ];

  return {
    sections: [
      createSection({
        id: `${module}-ashtakavarga`,
        title: "Ashtakavarga",
        description:
          "Bhinnashtakavarga e Sarvashtakavarga presentes no motor atual; o modulo agora abre tambem prastara de contribuidores e shodhana operacional.",
        status: "implemented",
        items: [
          createDatum(module, "Ashtakavarga", "Signo com mais bindus", snapshot.ashtakavarga.signs[topSignIndex], {
            technicalNotes: `Sarvashtakavarga em ${totals[topSignIndex]} bindus antes das correcoes de shodhana.`,
            confidence: 0.8,
            status: "implemented",
          }),
          createDatum(
            module,
            "Ashtakavarga",
            "Signo lider apos shodhana",
            snapshot.ashtakavarga.signs[strongestPostShodhanaIndex],
            {
              technicalNotes: `Valor residual de ${ekadhipatya.adjusted[strongestPostShodhanaIndex]} bindus no working set de Trikona + Ekadhipatya.`,
              confidence: 0.72,
              status: "implemented",
            }
          ),
        ],
        tables: [
          createTable(
            `${module}-ashtakavarga-table`,
            "Bhinnashtakavarga",
            ["Linha", ...snapshot.ashtakavarga.signs, "Total"],
            snapshot.ashtakavarga.rows.map((row) => [
              row.label,
              ...row.scores.map(String),
              row.total.toString(),
            ])
          ),
          createTable(
            `${module}-sarvashtakavarga`,
            "Sarvashtakavarga",
            ["Signos", ...snapshot.ashtakavarga.signs],
            [["Bindus", ...snapshot.ashtakavarga.totals.map(String)]]
          ),
        ],
      }),
      createSection({
        id: `${module}-ashtakavarga-advanced`,
        title: "Ashtakavarga Avancado",
        description:
          "Abre contribuidores por signo, Trikona Shodhana e uma leitura ocupacional v1 de Ekadhipatya para reduzir o bloco que antes era apenas estrutural.",
        status: "implemented",
        items: [
          createDatum(module, "Ashtakavarga", "Prastarashtakavarga", "Operacional", {
            technicalNotes:
              "O motor lista os contribuidores efetivos de cada signo a partir das linhas do Bhinnashtakavarga.",
            confidence: 0.74,
            status: "implemented",
          }),
          createDatum(module, "Ashtakavarga", "Kakshya", "Operacional", {
            technicalNotes:
              "Cada signo mostra a sequencia de contribuidores ativos como working set de kakshya para leitura rapida.",
            confidence: 0.66,
            status: "implemented",
          }),
          createDatum(module, "Ashtakavarga", "Trikona Shodhana", "Operacional", {
            technicalNotes:
              "A base comum de cada trino e removida por grupo antes da comparacao residual dos signos.",
            confidence: 0.78,
            status: "implemented",
          }),
          createDatum(module, "Ashtakavarga", "Ekadhipatya Shodhana", "Working set v1", {
            technicalNotes:
              "O par de signos de mesmo regente e ajustado com prioridade ocupacional explicita no proprio relatorio.",
            confidence: 0.58,
            status: "implemented",
          }),
          createDatum(module, "Ashtakavarga", "Casa residual lider", `H${residualHouses[0].house}`, {
            technicalNotes:
              `${snapshot.ashtakavarga.signs[residualHouses[0].signIndex]} lidera o residual com ${residualHouses[0].value} bindus na area de ${residualHouses[0].theme.toLowerCase()}.`,
            confidence: 0.68,
            status: "implemented",
          }),
        ],
        tables: [
          createTable(
            `${module}-prastara-kakshya`,
            "Prastara e Kakshya por signo",
            ["Signo", "Bindus", "Contribuidores", "Ocupacao no signo"],
            contributorsBySign.map((entry) => [
              entry.sign,
              entry.total.toString(),
              entry.contributors.length ? entry.contributors.join(", ") : "--",
              occupancyMap[entry.signIndex].toString(),
            ]),
            "Os contribuidores listam quais linhas do Bhinnashtakavarga entregam bindu para o signo."
          ),
          createTable(
            `${module}-trikona-shodhana`,
            "Trikona Shodhana",
            ["Trino", "Original", "Base removida", "Residual"],
            trikona.rows.map((row) => [
              row.group.map((index) => snapshot.ashtakavarga.signs[index]).join(" / "),
              row.original.join(" | "),
              row.removal.toString(),
              row.reduced.join(" | "),
            ]),
            "O menor valor de cada trino e retirado dos tres signos antes da leitura residual."
          ),
          createTable(
            `${module}-ekadhipatya-shodhana`,
            "Ekadhipatya Shodhana v1",
            ["Regente", "Par", "Antes", "Depois", "Nota"],
            ekadhipatya.rows.map((row) => [
              row.lord,
              `${snapshot.ashtakavarga.signs[row.leftIndex]} / ${snapshot.ashtakavarga.signs[row.rightIndex]}`,
              row.before.join(" | "),
              row.after.join(" | "),
              row.note,
            ]),
            "Working set ocupacional para pares de signos de mesmo regente depois do Trikona Shodhana."
          ),
          createTable(
            `${module}-ashtakavarga-residual-houses`,
            "Casas Residuais apos Shodhana",
            ["Casa", "Signo", "Bindus residuais", "Tema"],
            residualHouses.map((row) => [
              `H${row.house}`,
              snapshot.ashtakavarga.signs[row.signIndex],
              row.value.toString(),
              row.theme,
            ]),
            "Leitura operacional que converte o residual pos-shodhana em foco de casas a partir do Lagna."
          ),
        ],
      }),
      createSection({
        id: `${module}-ashtakavarga-pinda`,
        title: "Pinda Shodhana",
        description:
          "Aplica Rasi Pinda e Graha Pinda sobre o Bhinnashtakavarga ja retificado por Trikona e Ekadhipatya, deixando a trilha do Yog Pinda auditavel por graha.",
        status: pindaRows.length ? "implemented" : "placeholder",
        items: [
          createDatum(
            module,
            "Ashtakavarga",
            "Maior Yog Pinda",
            strongestYogaPinda ? `${strongestYogaPinda.point.name} (${strongestYogaPinda.yogaPinda})` : "--",
            {
              technicalNotes: strongestYogaPinda
                ? `${strongestYogaPinda.point.name} lidera o total ${strongestYogaPinda.rasiPinda} + ${strongestYogaPinda.grahaPinda}, com residual mais forte em ${snapshot.ashtakavarga.signs[strongestYogaPinda.topResidualSignIndex]}.`
                : "Sem linhas classicas suficientes para calcular o Yog Pinda.",
              confidence: strongestYogaPinda ? 0.72 : 0.3,
              status: strongestYogaPinda ? "implemented" : "placeholder",
              methodUsed: "ashtakavarga-pinda-shodhana-v1",
            }
          ),
          createDatum(
            module,
            "Ashtakavarga",
            "Maior Rasi Pinda",
            strongestRasiPinda ? `${strongestRasiPinda.point.name} (${strongestRasiPinda.rasiPinda})` : "--",
            {
              technicalNotes: strongestRasiPinda
                ? `A soma ponderada por Rasi Gunakara lidera nesta linha do ${strongestRasiPinda.point.name}.`
                : "Sem Rasi Pinda disponivel.",
              confidence: strongestRasiPinda ? 0.7 : 0.28,
              status: strongestRasiPinda ? "implemented" : "placeholder",
              methodUsed: "ashtakavarga-pinda-shodhana-v1",
            }
          ),
          createDatum(
            module,
            "Ashtakavarga",
            "Maior Graha Pinda",
            strongestGrahaPinda ? `${strongestGrahaPinda.point.name} (${strongestGrahaPinda.grahaPinda})` : "--",
            {
              technicalNotes: strongestGrahaPinda?.dominantGraha
                ? `${strongestGrahaPinda.dominantGraha.occupant.name} foi o principal gatilho ocupacional desta linha, com parcela ${strongestGrahaPinda.dominantGraha.value}.`
                : "Sem Graha Pinda disponivel.",
              confidence: strongestGrahaPinda ? 0.68 : 0.28,
              status: strongestGrahaPinda ? "implemented" : "placeholder",
              methodUsed: "ashtakavarga-pinda-shodhana-v1",
            }
          ),
        ],
        tables: [
          createTable(
            `${module}-pinda-summary`,
            "Pinda Shodhana por graha",
            ["Linha", "Rasi Pinda", "Graha Pinda", "Yog Pinda", "Signo residual lider", "Graha gatilho"],
            pindaRows.map((entry) => [
              entry.point.name,
              entry.rasiPinda.toString(),
              entry.grahaPinda.toString(),
              entry.yogaPinda.toString(),
              snapshot.ashtakavarga.signs[entry.topResidualSignIndex],
              `${entry.dominantGraha.occupant.name} (${entry.dominantGraha.value})`,
            ]),
            "A linha usa os pesos tradicionais do Pinda sobre a matriz ja corrigida por Trikona e Ekadhipatya."
          ),
          createTable(
            `${module}-pinda-weights`,
            "Pesos usados no Pinda",
            ["Camada", "Alvo", "Peso"],
            pindaWeightRows,
            "Rasi Gunakara e Graha Gunakara ficam explicitos para auditoria do calculo."
          ),
          createTable(
            `${module}-pinda-detail`,
            "Graha Pinda detalhado",
            ["Linha", "Graha ocupante", "Signo", "Bindus apos shodhana", "Peso", "Parcela"],
            pindaDetailRows,
            "Cada parcela mostra o bindu residual do signo ocupado pelo graha multiplicado pelo respectivo Graha Gunakara."
          ),
        ],
      }),
    ],
    summary: [
      `Signo lider bruto: ${snapshot.ashtakavarga.signs[topSignIndex]} com ${totals[topSignIndex]} bindus.`,
      `Signo lider apos shodhana: ${snapshot.ashtakavarga.signs[strongestPostShodhanaIndex]}.`,
      `Casa residual lider: H${residualHouses[0].house} (${residualHouses[0].theme}).`,
      strongestYogaPinda
        ? `Maior Yog Pinda: ${strongestYogaPinda.point.name} (${strongestYogaPinda.yogaPinda}).`
        : "Pinda Shodhana ainda sem linhas suficientes para ranqueamento.",
    ],
  };
}
