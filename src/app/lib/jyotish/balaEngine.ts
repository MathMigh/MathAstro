import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

const CLASSICAL_KEYS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"] as const;
const NATURAL_BENEFICS = new Set(["moon", "mercury", "jupiter", "venus"]);
const NATURAL_MALEFICS = new Set(["sun", "mars", "saturn", "northNode", "southNode"]);
const SPEED_MAXIMA: Record<(typeof CLASSICAL_KEYS)[number], number> = {
  sun: 1.02,
  moon: 15.4,
  mars: 0.8,
  mercury: 2.2,
  jupiter: 0.24,
  venus: 1.26,
  saturn: 0.14,
};
const VARGA_WEIGHTS: Record<string, number> = {
  D1: 6,
  D9: 5,
  D10: 4,
  D12: 2,
  D30: 2,
  D60: 4,
};
const SHADBALA_MINIMUM_RUPAS: Record<(typeof CLASSICAL_KEYS)[number], number> = {
  sun: 5,
  moon: 6,
  mars: 5,
  mercury: 7,
  jupiter: 6.5,
  venus: 5.5,
  saturn: 5,
};
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function classicalPlanets(snapshot: VedicSnapshot) {
  return snapshot.planets.filter((point): point is VedicPoint & { key: (typeof CLASSICAL_KEYS)[number] } =>
    (CLASSICAL_KEYS as readonly string[]).includes(point.key)
  );
}

function strengthBucket(score: number) {
  if (score >= 45) return "Forte";
  if (score >= 30) return "Media";
  return "Baixa";
}

function cheshtaBala(point: VedicPoint) {
  const key = point.key as (typeof CLASSICAL_KEYS)[number];
  const maximum = SPEED_MAXIMA[key];
  const speed = Math.abs(point.longitudeSpeed ?? 0);
  const normalized = clamp(speed / maximum, 0, 1);
  const stationary = normalized <= 0.08;
  let score = normalized * 45;

  if (!["sun", "moon"].includes(point.key) && point.retrograde) {
    score = 60;
  } else if (stationary) {
    score = Math.max(score, 15);
  }

  return {
    score: Number(score.toFixed(2)),
    normalized,
    stationary,
    bucket: strengthBucket(score),
    note: point.retrograde && !["sun", "moon"].includes(point.key)
      ? "Retrogradacao priorizada no working set atual, elevando Cheshta Bala."
      : stationary
        ? "Velocidade muito baixa; o motor marcou estado estacionario operacional."
        : "Score proporcional a velocidade longitudinal observada pelo Swiss Ephemeris.",
  };
}

function drikBala(point: VedicPoint, snapshot: VedicSnapshot) {
  const incoming = snapshot.aspects.filter((aspect) => aspect.target === point.name);
  const weighted = incoming.reduce(
    (acc, aspect) => {
      const source = snapshot.planets.find((planet) => planet.name === aspect.source);
      if (!source) {
        return acc;
      }

      if (NATURAL_BENEFICS.has(source.key)) {
        acc.benefic += 15;
        acc.notes.push(`${source.name} apoia por ${aspect.kind}.`);
      } else if (NATURAL_MALEFICS.has(source.key)) {
        acc.malefic += 15;
        acc.notes.push(`${source.name} pressiona por ${aspect.kind}.`);
      }

      return acc;
    },
    { benefic: 0, malefic: 0, notes: [] as string[] }
  );

  const score = Number((weighted.benefic - weighted.malefic).toFixed(2));

  return {
    incoming,
    benefic: weighted.benefic,
    malefic: weighted.malefic,
    score,
    bucket: score > 0 ? "Benefico" : score < 0 ? "Malefico" : "Neutro",
    note: weighted.notes[0] ?? "Sem drishti ponderada suficiente no working set atual.",
  };
}

function dignityFactor(point?: VedicPoint) {
  if (!point) return 0.5;
  if (point.tags.includes("Exaltado")) return 1;
  if (point.tags.includes("Domicilio")) return 0.9;
  if (point.tags.includes("Moolatrikona")) return 0.85;
  if (point.tags.includes("Amigavel")) return 0.65;
  if (point.tags.includes("Inimigo")) return 0.35;
  if (point.tags.includes("Debilitado")) return 0.15;
  return 0.5;
}

function housesRuledByPlanet(snapshot: VedicSnapshot, planetKey: (typeof CLASSICAL_KEYS)[number]) {
  return Array.from({ length: 12 }, (_, index) => index + 1).filter((house) => {
    const signIndex = ((snapshot.ascendant.signIndex + house - 1) % 12 + 12) % 12;
    return SIGN_LORD_KEYS[signIndex] === planetKey;
  });
}

function functionalRoleProfile(snapshot: VedicSnapshot, point: VedicPoint) {
  const houses = housesRuledByPlanet(snapshot, point.key as (typeof CLASSICAL_KEYS)[number]);
  const support =
    (houses.includes(1) ? 2 : 0) +
    (houses.includes(5) ? 2 : 0) +
    (houses.includes(9) ? 2 : 0) +
    (houses.some((house) => [4, 7, 10].includes(house)) ? 1.5 : 0) +
    (houses.some((house) => [4, 7, 10].includes(house)) && houses.some((house) => [5, 9].includes(house))
      ? 2
      : 0);
  const strain =
    (houses.includes(8) ? 2.5 : 0) +
    (houses.includes(6) ? 1.5 : 0) +
    (houses.includes(12) ? 1.25 : 0) +
    (houses.includes(11) ? 1 : 0) +
    (houses.some((house) => [2, 7].includes(house)) ? 1.25 : 0);
  const tone =
    support - strain >= 2
      ? "Apoio funcional"
      : strain - support >= 1.5
        ? "Pressao funcional"
        : "Tom misto";
  const note = [
    houses.includes(1) ? "rege o Lagna" : "",
    houses.some((house) => [5, 9].includes(house)) ? "toca trikona" : "",
    houses.some((house) => [4, 7, 10].includes(house)) ? "toca kendra" : "",
    houses.some((house) => [2, 7].includes(house)) ? "porta camada maraka" : "",
    houses.includes(8) ? "mistura 8a casa" : "",
    houses.includes(6) ? "mistura 6a casa" : "",
    houses.includes(12) ? "mistura 12a casa" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return {
    houses,
    support,
    strain,
    tone,
    note,
  };
}

function vargaSupport(point: VedicPoint, snapshot: VedicSnapshot) {
  const contributions = Object.entries(VARGA_WEIGHTS).map(([chartKey, weight]) => {
    const chartPoint = snapshot.vargas
      .find((chart) => chart.key === chartKey)
      ?.points.find((candidate) => candidate.key === point.key);
    const factor = dignityFactor(chartPoint);

    return {
      chartKey,
      weight,
      factor,
      score: weight * factor,
      signName: chartPoint?.signName ?? "--",
      state: chartPoint?.tags.join(", ") || "Sem marca forte",
    };
  });

  const totalWeight = contributions.reduce((sum, item) => sum + item.weight, 0);
  const totalScore = contributions.reduce((sum, item) => sum + item.score, 0);
  const normalized = totalWeight > 0 ? (totalScore / totalWeight) * 60 : 0;

  return {
    contributions,
    score: Number(normalized.toFixed(2)),
    bucket: strengthBucket(normalized),
    note:
      normalized >= 42
        ? "D1 e vargas-chave sustentam o planeta com boa repeticao de dignidade."
        : normalized >= 30
          ? "Os vargas seguram parte da promessa, mas sem unanimidade tecnica."
          : "Os vargas relevantes nao estao confirmando o planeta de forma consistente.",
  };
}

function compositeBalaRows(
  snapshot: VedicSnapshot,
  cheshtaRows: Array<ReturnType<typeof cheshtaBala> & { point: VedicPoint }>,
  drikRows: Array<ReturnType<typeof drikBala> & { point: VedicPoint }>,
  vargaRows: Array<ReturnType<typeof vargaSupport> & { point: VedicPoint }>
) {
  const maxRupas = Math.max(...snapshot.shadbala.map((item) => item.rupas), 1);
  return snapshot.shadbala
    .map((item) => {
      const point = snapshot.planets.find((planet) => planet.name === item.name);
      const cheshta = cheshtaRows.find((row) => row.point.name === item.name);
      const drik = drikRows.find((row) => row.point.name === item.name);
      const varga = vargaRows.find((row) => row.point.name === item.name);
      const shadbalaNormalized = (item.rupas / maxRupas) * 60;
      const drikNormalized = clamp((drik?.score ?? 0) + 30, 0, 60);
      const score = Number(
        (
          shadbalaNormalized * 0.45 +
          (cheshta?.score ?? 0) * 0.2 +
          drikNormalized * 0.15 +
          (varga?.score ?? 0) * 0.2
        ).toFixed(2)
      );

      return {
        item,
        point,
        cheshta,
        drik,
        varga,
        score,
        bucket: strengthBucket(score),
        note:
          `${item.name} cruza ${item.rupas.toFixed(2)} rupas de Shadbala, ` +
          `${cheshta?.score.toFixed(2) ?? "--"} de Cheshta, ` +
          `${drik?.score.toFixed(2) ?? "--"} de Drik e ` +
          `${varga?.score.toFixed(2) ?? "--"} de suporte por varga no overlay atual.`,
      };
    })
    .sort((left, right) => right.score - left.score || left.item.name.localeCompare(right.item.name));
}

function buildRequirementRows(snapshot: VedicSnapshot) {
  return snapshot.shadbala.map((item) => {
    const point = snapshot.planets.find((planet) => planet.name === item.name);
    const key = point?.key as (typeof CLASSICAL_KEYS)[number] | undefined;
    const minimum = key ? SHADBALA_MINIMUM_RUPAS[key] : 5;
    const delta = Number((item.rupas - minimum).toFixed(2));
    const functional = point ? functionalRoleProfile(snapshot, point) : undefined;

    return {
      item,
      point,
      minimum,
      delta,
      passes: delta >= 0,
      functional,
    };
  });
}

function buildIshtaKashtaRows(
  snapshot: VedicSnapshot,
  cheshtaRows: Array<ReturnType<typeof cheshtaBala> & { point: VedicPoint }>,
  drikRows: Array<ReturnType<typeof drikBala> & { point: VedicPoint }>,
  vargaRows: Array<ReturnType<typeof vargaSupport> & { point: VedicPoint }>
) {
  return classicalPlanets(snapshot).map((point) => {
    const shadbala = snapshot.shadbala.find((item) => item.name === point.name);
    const cheshta = cheshtaRows.find((row) => row.point.key === point.key)!;
    const drik = drikRows.find((row) => row.point.key === point.key)!;
    const varga = vargaRows.find((row) => row.point.key === point.key)!;
    const functional = functionalRoleProfile(snapshot, point);
    const minimum = SHADBALA_MINIMUM_RUPAS[point.key];
    const shadbalaNormalized = shadbala ? clamp((shadbala.rupas / minimum) * 12, 0, 18) : 0;
    const positiveDrik = clamp(drik.score, 0, 45) / 3;
    const negativeDrik = clamp(-drik.score, 0, 45) / 3;
    const afflictionPenalty =
      (point.tags.includes("Combusto") ? 6 : 0) +
      (point.tags.includes("Debilitado") ? 6 : 0) +
      (point.tags.includes("Inimigo") ? 3 : 0);
    const ishta = Number(
      clamp(
        dignityFactor(point) * 18 +
          shadbalaNormalized +
          positiveDrik +
          varga.score / 6 +
          functional.support * 2.5 +
          (cheshta.score >= 45 ? 5 : cheshta.score >= 30 ? 3 : 1) -
          afflictionPenalty / 2,
        0,
        60
      ).toFixed(2)
    );
    const kashta = Number(
      clamp(
        (1 - dignityFactor(point)) * 18 +
          negativeDrik +
          (60 - varga.score) / 6 +
          functional.strain * 2.5 +
          (cheshta.score < 20 ? 4 : cheshta.score < 30 ? 2 : 1) +
          afflictionPenalty,
        0,
        60
      ).toFixed(2)
    );

    return {
      point,
      shadbala,
      functional,
      ishta,
      kashta,
      note:
        `${functional.tone}; ${functional.note || "sem carga funcional dominante"}. ` +
        `${drik.note} ${varga.note}`,
    };
  });
}

export function balaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const planets = classicalPlanets(snapshot);
  const cheshtaRows = planets.map((point) => ({ point, ...cheshtaBala(point) }));
  const drikRows = planets.map((point) => ({ point, ...drikBala(point, snapshot) }));
  const vargaRows = planets.map((point) => ({ point, ...vargaSupport(point, snapshot) }));
  const compositeRows = compositeBalaRows(snapshot, cheshtaRows, drikRows, vargaRows);
  const strongestCheshta = [...cheshtaRows].sort((left, right) => right.score - left.score)[0];
  const bestDrik = [...drikRows].sort((left, right) => right.score - left.score)[0];
  const bestVarga = [...vargaRows].sort((left, right) => right.score - left.score)[0];
  const bestComposite = compositeRows[0];
  const requirementRows = buildRequirementRows(snapshot);
  const ishtaKashtaRows = buildIshtaKashtaRows(snapshot, cheshtaRows, drikRows, vargaRows);
  const passingCount = requirementRows.filter((row) => row.passes).length;
  const strongestIshta = [...ishtaKashtaRows].sort((left, right) => right.ishta - left.ishta)[0];
  const strongestKashta = [...ishtaKashtaRows].sort((left, right) => right.kashta - left.kashta)[0];

  return {
    sections: [
      createSection({
        id: `${module}-shadbala`,
        title: "Forcas Planetarias e de Casa",
        description:
          "Shadbala e Bhavabala nativos do snapshot, agora acompanhados por working sets tecnicos de Cheshta, Drik e suporte por vargas.",
        status: "implemented",
        tables: [
          createTable(
            `${module}-shadbala-table`,
            "Shadbala",
            ["Graha", "Uchcha", "Saptavargaja", "Dig", "Paksha", "Total", "Rupas"],
            snapshot.shadbala.map((item) => [
              item.name,
              item.uchchaBala.toString(),
              item.saptavargajaBala.toString(),
              item.digBala.toString(),
              item.pakshaBala.toString(),
              item.totalShadbala.toString(),
              item.rupas.toString(),
            ]),
            "Componentes de bala efetivamente disponiveis no motor atual."
          ),
          createTable(
            `${module}-bhavabala-table`,
            "Bhavabala",
            ["Casa", "Score", "Rupas", "Regente", "Ocupantes"],
            snapshot.bhavabala.map((item) => [
              item.house.toString(),
              item.score.toString(),
              item.rupas.toString(),
              item.lord,
              item.occupants.join(", ") || "--",
            ])
          ),
        ],
        items: snapshot.shadbala.slice(0, 3).map((item) =>
          createDatum(module, "Ranking", `${item.name} em destaque`, item.rupas, {
            unit: "rupas",
            relatedPlanet: item.name,
            technicalNotes: item.note,
            confidence: 0.75,
          })
        ),
      }),
      createSection({
        id: `${module}-other-balas`,
        title: "Outras Balas",
        description:
          "O modulo agora calcula working sets operacionais para Cheshta Bala, Drik Bala e suporte de vargas, mantendo explicita a escola parcial usada.",
        status: "implemented",
        items: [
          createDatum(module, "Bala", "Cheshta Bala em destaque", `${strongestCheshta.point.name} (${strongestCheshta.score})`, {
            relatedPlanet: strongestCheshta.point.name,
            technicalNotes: strongestCheshta.note,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "working-set-velocidade-swisseph",
          }),
          createDatum(module, "Bala", "Drik Bala mais favoravel", `${bestDrik.point.name} (${bestDrik.score})`, {
            relatedPlanet: bestDrik.point.name,
            technicalNotes: bestDrik.note,
            confidence: 0.64,
            status: "implemented",
            methodUsed: "working-set-drishti-benefico-malefico",
          }),
          createDatum(module, "Bala", "Vimshopaka / suporte por varga", `${bestVarga.point.name} (${bestVarga.score})`, {
            relatedPlanet: bestVarga.point.name,
            technicalNotes: bestVarga.note,
            confidence: 0.66,
            status: "implemented",
            methodUsed: "working-set-varga-support",
          }),
          createDatum(module, "Bala", "Overlay composto de balas", `${bestComposite.item.name} (${bestComposite.score})`, {
            relatedPlanet: bestComposite.item.name,
            technicalNotes: bestComposite.note,
            confidence: 0.68,
            status: "implemented",
            methodUsed: "working-set-bala-overlay-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-cheshta-bala`,
            "Cheshta Bala",
            ["Graha", "Velocidade", "Retrogrado", "Score", "Faixa", "Observacao"],
            cheshtaRows.map((row) => [
              row.point.name,
              (row.point.longitudeSpeed ?? 0).toFixed(4),
              row.point.retrograde ? "Sim" : "Nao",
              row.score.toFixed(2),
              row.bucket,
              row.note,
            ]),
            "Working set proporcional a velocidade longitudinal do Swiss Ephemeris, com prioridade operacional para retrogradacao dos nao-luminares."
          ),
          createTable(
            `${module}-drik-bala`,
            "Drik Bala",
            ["Graha", "Apoio benefico", "Pressao malefica", "Saldo", "Leitura", "Observacao"],
            drikRows.map((row) => [
              row.point.name,
              row.benefic.toFixed(0),
              row.malefic.toFixed(0),
              row.score.toFixed(0),
              row.bucket,
              row.note,
            ]),
            "Saldo tecnico de drishti recebido, usando beneficos e maleficos naturais como ponderacao inicial."
          ),
          createTable(
            `${module}-varga-support`,
            "Suporte por Vargas",
            ["Graha", "Score", "Faixa", "D1", "D9", "D10", "D60"],
            vargaRows.map((row) => {
              const getState = (chartKey: string) =>
                row.contributions.find((item) => item.chartKey === chartKey)?.state ?? "--";
              return [
                row.point.name,
                row.score.toFixed(2),
                row.bucket,
                getState("D1"),
                getState("D9"),
                getState("D10"),
                getState("D60"),
              ];
            }),
            "Leitura de repeticao de dignidade entre D1 e vargas-chave, usada como trilha operacional de suporte tecnico.",
            true
          ),
          createTable(
            `${module}-bala-overlay`,
            "Overlay Composto de Balas",
            ["Graha", "Shadbala (rupas)", "Cheshta", "Drik", "Varga", "Score", "Faixa", "Nota"],
            compositeRows.map((row) => [
              row.item.name,
              row.item.rupas.toFixed(2),
              row.cheshta?.score.toFixed(2) ?? "--",
              row.drik?.score.toFixed(2) ?? "--",
              row.varga?.score.toFixed(2) ?? "--",
              row.score.toFixed(2),
              row.bucket,
              row.note,
            ]),
            "Overlay operacional que cruza Shadbala nativo com Cheshta, Drik e suporte por Vargas para ranquear a entrega global do graha."
          ),
        ],
      }),
      createSection({
        id: `${module}-ishta-kashta`,
        title: "Ista, Kashta e Requisitos",
        description:
          "Transforma a forca bruta em leitura auditavel: mostra exigencia minima, passagem/falha e um overlay operacional de Ista e Kashta Bala.",
        status: "implemented",
        items: [
          createDatum(module, "Bala", "Grahas acima do minimo", `${passingCount}/${requirementRows.length}`, {
            technicalNotes:
              "Working set de minimo em rupas usado para auditoria rapida de passagem/falha do Shadbala.",
            confidence: 0.7,
            status: "implemented",
            methodUsed: "operational-shadbala-threshold-v1",
          }),
          createDatum(module, "Bala", "Maior Ista Bala", `${strongestIshta.point.name} (${strongestIshta.ishta})`, {
            technicalNotes: strongestIshta.note,
            confidence: 0.66,
            status: "implemented",
            methodUsed: "working-set-ishta-kashta-overlay-v1",
          }),
          createDatum(module, "Bala", "Maior Kashta Bala", `${strongestKashta.point.name} (${strongestKashta.kashta})`, {
            technicalNotes: strongestKashta.note,
            confidence: 0.66,
            status: "implemented",
            methodUsed: "working-set-ishta-kashta-overlay-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-shadbala-requirements`,
            "Requisitos minimos de Shadbala",
            ["Graha", "Rupas", "Minimo", "Passa", "Saldo", "Tom funcional"],
            requirementRows.map((row) => [
              row.item.name,
              row.item.rupas.toFixed(2),
              row.minimum.toFixed(2),
              row.passes ? "Sim" : "Nao",
              row.delta >= 0 ? `+${row.delta.toFixed(2)}` : row.delta.toFixed(2),
              row.functional?.tone ?? "--",
            ]),
            "Os minimos sao usados aqui como threshold operacional padronizado para o relatorio tecnico, nao como sentenca interpretativa isolada."
          ),
          createTable(
            `${module}-ishta-kashta-table`,
            "Ista e Kashta Bala",
            ["Graha", "Ista", "Kashta", "Rupas", "Tom funcional", "Observacao"],
            ishtaKashtaRows.map((row) => [
              row.point.name,
              row.ishta.toFixed(2),
              row.kashta.toFixed(2),
              row.shadbala?.rupas.toFixed(2) ?? "--",
              row.functional.tone,
              row.note,
            ]),
            "Overlay operacional que compara a forca quantitativa com dignidade, drishti, suporte por varga e papel funcional do graha."
          ),
        ],
      }),
    ],
    summary: [
      `Graha lider no overlay composto: ${bestComposite.item.name} com score ${bestComposite.score.toFixed(2)}.`,
      `Melhor Drik Bala: ${bestDrik.point.name} (${bestDrik.score.toFixed(2)}).`,
      `Melhor suporte por varga: ${bestVarga.point.name} (${bestVarga.score.toFixed(2)}).`,
      `Maior Ista Bala operacional: ${strongestIshta.point.name} (${strongestIshta.ishta.toFixed(2)}).`,
    ],
  };
}
