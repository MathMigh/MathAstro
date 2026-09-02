import type { VedicPoint } from "../vedic";
import type { JyotishContext } from "./types";
import { createDatum, createSection, createTable, signDistance } from "./engineHelpers";
import type { EngineResult, JyotishModuleKey } from "./types";

type TransitKey =
  | "sun"
  | "moon"
  | "mars"
  | "mercury"
  | "jupiter"
  | "venus"
  | "saturn"
  | "northNode"
  | "southNode";

const PLANET_LABELS: Record<TransitKey, string> = {
  sun: "Surya",
  moon: "Chandra",
  mars: "Mangala",
  mercury: "Budha",
  jupiter: "Guru",
  venus: "Shukra",
  saturn: "Shani",
  northNode: "Rahu",
  southNode: "Ketu",
};

const GOCHARA_RULES: Record<
  TransitKey,
  {
    goodHouses: number[];
    vedhaByHouse: Partial<Record<number, number>>;
    note: string;
  }
> = {
  sun: {
    goodHouses: [3, 6, 10, 11],
    vedhaByHouse: { 3: 9, 6: 12, 10: 4, 11: 5 },
    note: "Padrao classico de gochara com vedha do Sol a partir da Lua natal.",
  },
  moon: {
    goodHouses: [1, 3, 6, 7, 10, 11],
    vedhaByHouse: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
    note: "Padrao classico de gochara com vedha da Lua a partir da Lua natal.",
  },
  mars: {
    goodHouses: [3, 6, 11],
    vedhaByHouse: { 3: 12, 6: 9, 11: 5 },
    note: "Padrao classico de gochara com vedha de Mangala; Ketu e espelhado nesta versao.",
  },
  mercury: {
    goodHouses: [2, 4, 6, 8, 10, 11],
    vedhaByHouse: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 7, 11: 12 },
    note: "Padrao classico de gochara com vedha de Budha a partir da Lua natal.",
  },
  jupiter: {
    goodHouses: [2, 5, 7, 9, 11],
    vedhaByHouse: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
    note: "Padrao classico de gochara com vedha de Guru a partir da Lua natal.",
  },
  venus: {
    goodHouses: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    vedhaByHouse: { 1: 8, 2: 7, 3: 6, 4: 10, 5: 9, 8: 1, 9: 5, 11: 3, 12: 2 },
    note: "Padrao classico de gochara com vedha de Shukra a partir da Lua natal.",
  },
  saturn: {
    goodHouses: [3, 6, 11],
    vedhaByHouse: { 3: 12, 6: 9, 11: 5 },
    note: "Padrao classico de gochara com vedha de Shani a partir da Lua natal.",
  },
  northNode: {
    goodHouses: [3, 6, 11],
    vedhaByHouse: { 3: 12, 6: 9, 11: 5 },
    note: "Rahu espelhado sobre a malha de Shani nesta versao v1, como working set tecnico.",
  },
  southNode: {
    goodHouses: [3, 6, 11],
    vedhaByHouse: { 3: 12, 6: 9, 11: 5 },
    note: "Ketu espelhado sobre a malha marciana/saturnina curta nesta versao v1.",
  },
};

const VEDHA_EXCEPTIONS = new Set(["sun|saturn", "moon|mercury"]);

function pairKey(left: string, right: string) {
  return [left, right].sort().join("|");
}

function findPlanet(snapshot: JyotishContext["transit"], key: TransitKey): VedicPoint {
  return snapshot.planets.find((point) => point.key === key) ?? snapshot.ascendant;
}

function sameVedhaException(left: TransitKey, right: TransitKey) {
  return VEDHA_EXCEPTIONS.has(pairKey(left, right));
}

function buildTransitRow(
  key: TransitKey,
  point: VedicPoint,
  natalMoon: VedicPoint,
  natalLagna: VedicPoint,
  allTransitPoints: Array<{ key: TransitKey; point: VedicPoint }>,
  sarvashtakavarga: number[]
) {
  const rule = GOCHARA_RULES[key];
  const houseFromMoon = signDistance(natalMoon.signIndex, point.signIndex) + 1;
  const houseFromLagna = signDistance(natalLagna.signIndex, point.signIndex) + 1;
  const isFavorable = rule.goodHouses.includes(houseFromMoon);
  const vedhaHouse = isFavorable ? rule.vedhaByHouse[houseFromMoon] : undefined;
  const reverseGoodHouse = !isFavorable
    ? Object.entries(rule.vedhaByHouse).find(([, obstruction]) => obstruction === houseFromMoon)?.[0]
    : undefined;
  const vedhaBlocker =
    vedhaHouse === undefined
      ? undefined
      : allTransitPoints.find(
          (candidate) =>
            candidate.key !== key &&
            !sameVedhaException(key, candidate.key) &&
            signDistance(natalMoon.signIndex, candidate.point.signIndex) + 1 === vedhaHouse
        );
  const viparitaSupporter =
    reverseGoodHouse === undefined
      ? undefined
      : allTransitPoints.find(
          (candidate) =>
            candidate.key !== key &&
            !sameVedhaException(key, candidate.key) &&
            signDistance(natalMoon.signIndex, candidate.point.signIndex) + 1 === Number(reverseGoodHouse)
        );
  const bindus = sarvashtakavarga[point.signIndex] ?? 0;

  return {
    planet: PLANET_LABELS[key],
    signName: point.signName,
    houseFromMoon,
    houseFromLagna,
    bindus,
    state: isFavorable ? "Favorable" : "Desafiante",
    vedha:
      vedhaBlocker && vedhaHouse
        ? `Vedha por ${PLANET_LABELS[vedhaBlocker.key]} em ${vedhaHouse}a`
        : isFavorable && vedhaHouse
          ? `Sem vedha ativo na ${vedhaHouse}a`
          : viparitaSupporter && reverseGoodHouse
            ? `Viparita vedha por ${PLANET_LABELS[viparitaSupporter.key]} em ${reverseGoodHouse}a`
            : "Sem alavanca de vedha",
    note: rule.note,
  };
}

export function gocharaEngine(
  module: JyotishModuleKey,
  context: JyotishContext
): EngineResult {
  const natalMoon = context.primary.planets.find((point) => point.key === "moon") ?? context.primary.ascendant;
  const natalLagna = context.primary.ascendant;
  const transitKeys: TransitKey[] = [
    "sun",
    "moon",
    "mars",
    "mercury",
    "jupiter",
    "venus",
    "saturn",
    "northNode",
    "southNode",
  ];
  const transitPoints: Array<{ key: TransitKey; point: VedicPoint }> = transitKeys.map((key) => ({
    key,
    point: findPlanet(context.transit, key),
  }));

  const transitSaturn = findPlanet(context.transit, "saturn");
  const transitJupiter = findPlanet(context.transit, "jupiter");
  const transitRahu = findPlanet(context.transit, "northNode");
  const transitKetu = findPlanet(context.transit, "southNode");
  const saturnFromMoon = signDistance(natalMoon.signIndex, transitSaturn.signIndex) + 1;
  const jupiterFromMoon = signDistance(natalMoon.signIndex, transitJupiter.signIndex) + 1;
  const rahuFromMoon = signDistance(natalMoon.signIndex, transitRahu.signIndex) + 1;
  const ketuFromMoon = signDistance(natalMoon.signIndex, transitKetu.signIndex) + 1;
  const saturnFromLagna = signDistance(natalLagna.signIndex, transitSaturn.signIndex) + 1;
  const jupiterFromLagna = signDistance(natalLagna.signIndex, transitJupiter.signIndex) + 1;
  const gocharaRows = transitPoints.map((entry) =>
    buildTransitRow(
      entry.key,
      entry.point,
      natalMoon,
      natalLagna,
      transitPoints,
      context.primary.ashtakavarga.totals
    )
  );
  const sadeSati = [12, 1, 2].includes(saturnFromMoon);
  const ashtamaShani = saturnFromMoon === 8;
  const kantakaShani = saturnFromMoon === 4;
  const dhaiya = [4, 8].includes(saturnFromMoon);

  return {
    sections: [
      createSection({
        id: `${module}-gochara`,
        title: "Gochara",
        description:
          "Le a posicao dos transitos principais a partir do Lagna e da Lua, agora incluindo vedha, viparita vedha, bindus do signo transitado e bandeiras classicas de Shani.",
        status: "implemented",
        items: [
          createDatum(module, "Transito", "Saturno a partir da Lua", saturnFromMoon, {
            unit: "casa",
            relatedPlanet: "Shani",
            technicalNotes: `Saturno em ${transitSaturn.signName} no dia de analise.`,
            confidence: 0.82,
          }),
          createDatum(module, "Transito", "Jupiter a partir da Lua", jupiterFromMoon, {
            unit: "casa",
            relatedPlanet: "Guru",
            technicalNotes: `Jupiter em ${transitJupiter.signName} no dia de analise.`,
            confidence: 0.82,
          }),
          createDatum(module, "Transito", "Rahu a partir da Lua", rahuFromMoon, {
            unit: "casa",
            relatedPlanet: "Rahu",
            technicalNotes: `Rahu em ${transitRahu.signName} no dia de analise.`,
            confidence: 0.76,
          }),
          createDatum(module, "Transito", "Ketu a partir da Lua", ketuFromMoon, {
            unit: "casa",
            relatedPlanet: "Ketu",
            technicalNotes: `Ketu em ${transitKetu.signName} no dia de analise.`,
            confidence: 0.74,
          }),
          createDatum(module, "Transito", "Saturno a partir do Lagna", saturnFromLagna, {
            unit: "casa",
            relatedPlanet: "Shani",
            technicalNotes: "Usado como eixo complementar ao recorte pela Lua.",
            confidence: 0.78,
          }),
          createDatum(module, "Transito", "Jupiter a partir do Lagna", jupiterFromLagna, {
            unit: "casa",
            relatedPlanet: "Guru",
            technicalNotes: "Usado como eixo complementar ao recorte pela Lua.",
            confidence: 0.78,
          }),
          createDatum(module, "Transito", "Sade Sati", sadeSati ? "Ativo" : "Nao", {
            technicalNotes:
              "Marcado quando Shani transita a 12a, 1a ou 2a a partir da Lua natal.",
            confidence: 0.8,
            status: "implemented",
          }),
          createDatum(module, "Transito", "Ashtama Shani", ashtamaShani ? "Ativo" : "Nao", {
            technicalNotes: "Marcado quando Shani ocupa a 8a a partir da Lua natal.",
            confidence: 0.8,
            status: "implemented",
          }),
          createDatum(module, "Transito", "Kantaka Shani", kantakaShani ? "Ativo" : "Nao", {
            technicalNotes: "Marcado quando Shani ocupa a 4a a partir da Lua natal.",
            confidence: 0.76,
            status: "implemented",
          }),
          createDatum(module, "Transito", "Dhaiya", dhaiya ? "Ativo" : "Nao", {
            technicalNotes: "Faixa curta de Shani quando transita a 4a ou 8a da Lua.",
            confidence: 0.72,
            status: "implemented",
          }),
        ],
        tables: [
          createTable(
            `${module}-gochara-vedha`,
            "Gochara, Vedha e Bindus",
            ["Planeta", "Signo", "Casa da Lua", "Casa do Lagna", "Bindus", "Estado", "Vedha", "Nota"],
            gocharaRows.map((row) => [
              row.planet,
              row.signName,
              row.houseFromMoon.toString(),
              row.houseFromLagna.toString(),
              row.bindus.toString(),
              row.state,
              row.vedha,
              row.note,
            ]),
            "Bindus lidos do Sarvashtakavarga natal no signo atualmente transitado; vedha e viparita vedha seguem o working set classico explicitado no motor."
          ),
        ],
      }),
    ],
  };
}
