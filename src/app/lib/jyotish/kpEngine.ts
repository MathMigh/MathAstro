import moment from "moment-timezone";
import { getSwe } from "../astrologyEngine";
import type { VedicAyanamsa, VedicPoint, VedicSnapshot } from "../vedic";
import { createDatum, createSection, createTable, createValidation } from "./engineHelpers";
import type { EngineResult, JyotishContext, JyotishModuleKey } from "./types";

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

const SIGN_LORDS = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
] as const;

const NAKSHATRA_NAMES = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishtha",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

const KP_LORD_SEQUENCE = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
] as const;

const KP_PERIOD_YEARS: Record<(typeof KP_LORD_SEQUENCE)[number], number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const WEEKDAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
const NAKSHATRA_SPAN = 360 / 27;
const SUBDIVISION_DENOMINATOR = 120;

type KpLord = (typeof KP_LORD_SEQUENCE)[number];
type KpPointKey =
  | "sun"
  | "moon"
  | "mars"
  | "mercury"
  | "jupiter"
  | "venus"
  | "saturn"
  | "northNode"
  | "southNode";

interface KpLayer {
  longitude: number;
  signIndex: number;
  signName: string;
  degreeInSign: number;
  signLord: string;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number;
  starLord: KpLord;
  subLord: KpLord;
  subSubLord: KpLord;
}

interface KpDivision {
  lord: KpLord;
  start: number;
  end: number;
  size: number;
}

interface KpPointRow {
  point: VedicPoint;
  layer: KpLayer;
  kpHouse: number;
}

interface KpLordDirectLinks {
  occupiedHouses: number[];
  ownedHouses: number[];
}

interface KpLordLinks extends KpLordDirectLinks {
  lord: KpLord;
  starLord?: KpLord;
  subLord?: KpLord;
  starSignifiedHouses: number[];
  subBridgeHouses: number[];
  totalSignifiedHouses: number[];
}

interface KpThemeDefinition {
  key: string;
  label: string;
  houses: number[];
  note: string;
}

const KP_LORD_TO_POINT_KEY: Record<KpLord, KpPointKey> = {
  Sun: "sun",
  Moon: "moon",
  Mars: "mars",
  Mercury: "mercury",
  Jupiter: "jupiter",
  Venus: "venus",
  Saturn: "saturn",
  Rahu: "northNode",
  Ketu: "southNode",
};

const KP_THEME_DEFINITIONS: KpThemeDefinition[] = [
  {
    key: "marriage",
    label: "Casamento e compromisso",
    houses: [2, 7, 11],
    note: "Painel operacional para pacto, compromisso e consolidacao do vinculo.",
  },
  {
    key: "career",
    label: "Carreira e trabalho",
    houses: [2, 6, 10, 11],
    note: "Painel operacional para servico, funcao, renda e resultado concreto.",
  },
  {
    key: "property",
    label: "Imovel e base material",
    houses: [4, 11],
    note: "Painel operacional para casa, patrimonio e estabilizacao material.",
  },
  {
    key: "children",
    label: "Filhos e continuidade",
    houses: [2, 5, 11],
    note: "Painel operacional para prole, continuidade e frutificacao.",
  },
  {
    key: "health",
    label: "Saude e prova",
    houses: [1, 6, 8, 12],
    note: "Painel operacional para corpo, doenca, crise e internacao/recolhimento.",
  },
  {
    key: "travel",
    label: "Viagem e deslocamento",
    houses: [3, 9, 12],
    note: "Painel operacional para movimento, afastamento e abertura de distancia.",
  },
] as const;

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

function getAyanamsaDegrees(date: Date, mode: VedicAyanamsa) {
  const yearsFromJ2000 =
    (date.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) /
    (365.2422 * 24 * 60 * 60 * 1000);

  const base = {
    lahiri: 23.8530556,
    krishnamurti: 23.7802778,
    raman: 22.5066667,
  }[mode];

  return base + yearsFromJ2000 * (50.290966 / 3600);
}

function buildMoment(dateText: string, timeText: string, timezone: string) {
  return moment.tz(`${dateText} ${timeText}`, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"], timezone);
}

function formatLongitude(longitude: number) {
  const normalized = normalize360(longitude);
  const signIndex = Math.floor(normalized / 30) % 12;
  const degreeInSign = normalized - signIndex * 30;
  const degrees = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degrees) * 60);
  const seconds = Math.round((((degreeInSign - degrees) * 60) - minutes) * 60);

  return `${SIGN_NAMES[signIndex]} ${String(degrees).padStart(2, "0")}deg${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}"`;
}

function buildSequenceFrom(startLord: KpLord) {
  const startIndex = KP_LORD_SEQUENCE.indexOf(startLord);
  return [
    ...KP_LORD_SEQUENCE.slice(startIndex),
    ...KP_LORD_SEQUENCE.slice(0, startIndex),
  ] as KpLord[];
}

function locateDivision(offset: number, containerSize: number, startLord: KpLord): KpDivision {
  const sequence = buildSequenceFrom(startLord);
  let cursor = 0;

  for (let index = 0; index < sequence.length; index += 1) {
    const lord = sequence[index];
    const size = (containerSize * KP_PERIOD_YEARS[lord]) / SUBDIVISION_DENOMINATOR;
    const end = cursor + size;

    if (offset < end || index === sequence.length - 1) {
      return {
        lord,
        start: cursor,
        end,
        size,
      };
    }

    cursor = end;
  }

  return {
    lord: sequence[sequence.length - 1],
    start: containerSize,
    end: containerSize,
    size: 0,
  };
}

function buildKpLayer(tropicalLongitude: number, ayanamshaDegrees: number): KpLayer {
  const longitude = normalize360(tropicalLongitude - ayanamshaDegrees);
  const signIndex = Math.floor(longitude / 30) % 12;
  const degreeInSign = longitude - signIndex * 30;
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN);
  const nakshatraStart = nakshatraIndex * NAKSHATRA_SPAN;
  const nakshatraOffset = longitude - nakshatraStart;
  const starLord = KP_LORD_SEQUENCE[nakshatraIndex % KP_LORD_SEQUENCE.length];
  const subDivision = locateDivision(nakshatraOffset, NAKSHATRA_SPAN, starLord);
  const subOffset = nakshatraOffset - subDivision.start;
  const subSubDivision = locateDivision(subOffset, subDivision.size, subDivision.lord);

  return {
    longitude,
    signIndex,
    signName: SIGN_NAMES[signIndex],
    degreeInSign,
    signLord: SIGN_LORDS[signIndex],
    nakshatraIndex,
    nakshatraName: NAKSHATRA_NAMES[nakshatraIndex],
    pada: Math.min(4, Math.floor(nakshatraOffset / (NAKSHATRA_SPAN / 4)) + 1),
    starLord,
    subLord: subDivision.lord,
    subSubLord: subSubDivision.lord,
  };
}

function determineHouse(longitude: number, cuspLongitudes: number[]) {
  const normalized = normalize360(longitude);

  for (let index = 0; index < cuspLongitudes.length; index += 1) {
    const start = normalize360(cuspLongitudes[index]);
    const end = normalize360(cuspLongitudes[(index + 1) % cuspLongitudes.length]);

    if (start <= end) {
      if (normalized >= start && normalized < end) {
        return index + 1;
      }
      continue;
    }

    if (normalized >= start || normalized < end) {
      return index + 1;
    }
  }

  return 12;
}

async function calculatePlacidusCusps(snapshot: VedicSnapshot) {
  const sw = await getSwe();
  const moduleRef = (sw as any).module;
  const momentRef = buildMoment(snapshot.referenceDate, snapshot.localBirthTimeLabel, snapshot.timezone);
  const utcDate = momentRef.toDate();
  const julianDay = sw.julianDay(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600,
    1
  );
  const cuspsPtr = moduleRef._malloc(13 * 8);
  const ascmcPtr = moduleRef._malloc(10 * 8);

  try {
    moduleRef.ccall(
      "swe_houses_wrap",
      "number",
      ["number", "number", "number", "number", "number", "number"],
      [julianDay, snapshot.latitude, snapshot.longitude, "P".charCodeAt(0), cuspsPtr, ascmcPtr]
    );

    const tropicalCusps = Array.from({ length: 12 }, (_, index) =>
      moduleRef.getValue(cuspsPtr + (index + 1) * 8, "double")
    );

    return {
      tropicalCusps,
      tropicalAscendant: moduleRef.getValue(ascmcPtr, "double"),
      tropicalMc: moduleRef.getValue(ascmcPtr + 8, "double"),
      moment: momentRef,
    };
  } finally {
    moduleRef._free(cuspsPtr);
    moduleRef._free(ascmcPtr);
  }
}

function buildSourceLongitude(point: VedicPoint, fallbackAyanamshaDegrees: number) {
  if (Number.isFinite(point.sourceLongitude ?? Number.NaN)) {
    return point.sourceLongitude ?? 0;
  }
  return normalize360(point.longitude + fallbackAyanamshaDegrees);
}

function uniqueNumbers(values: number[]) {
  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function formatHouseList(houses: number[]) {
  return houses.length ? houses.map((house) => `${house}`).join(", ") : "--";
}

function buildDirectLinksForLord(
  lord: KpLord,
  pointRowsByLord: Map<KpLord, KpPointRow>,
  cuspLayers: KpLayer[]
): KpLordDirectLinks {
  const pointRow = pointRowsByLord.get(lord);
  const occupiedHouses = pointRow ? [pointRow.kpHouse] : [];
  const ownedHouses = uniqueNumbers(
    cuspLayers
      .map((layer, index) => ({ house: index + 1, signLord: layer.signLord }))
      .filter((row) => row.signLord === lord)
      .map((row) => row.house)
  );

  return {
    occupiedHouses,
    ownedHouses,
  };
}

function buildLordLinks(
  lord: KpLord,
  pointRowsByLord: Map<KpLord, KpPointRow>,
  cuspLayers: KpLayer[]
): KpLordLinks {
  const pointRow = pointRowsByLord.get(lord);
  const direct = buildDirectLinksForLord(lord, pointRowsByLord, cuspLayers);
  const starLord = pointRow?.layer.starLord;
  const subLord = pointRow?.layer.subLord;
  const starDirect = starLord
    ? buildDirectLinksForLord(starLord, pointRowsByLord, cuspLayers)
    : { occupiedHouses: [], ownedHouses: [] };
  const subDirect = subLord
    ? buildDirectLinksForLord(subLord, pointRowsByLord, cuspLayers)
    : { occupiedHouses: [], ownedHouses: [] };
  const starSignifiedHouses = uniqueNumbers([...starDirect.occupiedHouses, ...starDirect.ownedHouses]);
  const subBridgeHouses = uniqueNumbers([...subDirect.occupiedHouses, ...subDirect.ownedHouses]);
  const totalSignifiedHouses = uniqueNumbers([
    ...direct.occupiedHouses,
    ...direct.ownedHouses,
    ...starSignifiedHouses,
    ...subBridgeHouses,
  ]);

  return {
    lord,
    occupiedHouses: direct.occupiedHouses,
    ownedHouses: direct.ownedHouses,
    starLord,
    subLord,
    starSignifiedHouses,
    subBridgeHouses,
    totalSignifiedHouses,
  };
}

function scoreThemeHit(hitCount: number, totalCount: number) {
  if (hitCount >= totalCount) {
    return "Convergencia forte";
  }

  if (hitCount >= Math.ceil(totalCount / 2)) {
    return "Convergencia util";
  }

  if (hitCount > 0) {
    return "Convergencia parcial";
  }

  return "Convergencia fraca";
}

export async function kpEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot,
  context: JyotishContext
): Promise<EngineResult> {
  if (!context.config.kpEnabled || module !== "janma") {
    return { sections: [] };
  }

  const placidus = await calculatePlacidusCusps(snapshot);
  const kpAyanamshaDegrees = getAyanamsaDegrees(placidus.moment.toDate(), context.config.kpAyanamsha);
  const cuspLayers = placidus.tropicalCusps.map((longitude) => buildKpLayer(longitude, kpAyanamshaDegrees));
  const cuspLongitudes = cuspLayers.map((layer) => layer.longitude);
  const natalPoints = [snapshot.ascendant, ...snapshot.planets];
  const pointRows: KpPointRow[] = natalPoints.map((point) => {
    const sourceLongitude = buildSourceLongitude(point, snapshot.ayanamsaDegrees);
    const layer = buildKpLayer(sourceLongitude, kpAyanamshaDegrees);
    return {
      point,
      layer,
      kpHouse: determineHouse(layer.longitude, cuspLongitudes),
    };
  });
  const pointRowsByKey = new Map<KpPointKey, KpPointRow>(
    pointRows
      .filter((row) => row.point.key !== "ascendant")
      .map((row) => [row.point.key as KpPointKey, row])
  );
  const pointRowsByLord = new Map<KpLord, KpPointRow>(
    (Object.entries(KP_LORD_TO_POINT_KEY) as Array<[KpLord, KpPointKey]>)
      .map(([lord, key]) => [lord, pointRowsByKey.get(key)] as const)
      .filter((entry): entry is [KpLord, KpPointRow] => Boolean(entry[1]))
  );
  const lordByPointKey = new Map<KpPointKey, KpLord>(
    (Object.entries(KP_LORD_TO_POINT_KEY) as Array<[KpLord, KpPointKey]>).map(([lord, key]) => [key, lord])
  );
  const lordLinksByLord = new Map<KpLord, KpLordLinks>(
    KP_LORD_SEQUENCE.map((lord) => [lord, buildLordLinks(lord, pointRowsByLord, cuspLayers)])
  );

  const transitMoment = buildMoment(
    context.transit.referenceDate,
    context.transit.localBirthTimeLabel,
    context.transit.timezone
  );
  const transitKpAyanamsha = getAyanamsaDegrees(transitMoment.toDate(), context.config.kpAyanamsha);
  const transitMoon = context.transit.planets.find((point) => point.key === "moon") ?? context.transit.ascendant;
  const transitAscSource = buildSourceLongitude(context.transit.ascendant, context.transit.ayanamsaDegrees);
  const transitMoonSource = buildSourceLongitude(transitMoon, context.transit.ayanamsaDegrees);
  const transitAscLayer = buildKpLayer(transitAscSource, transitKpAyanamsha);
  const transitMoonLayer = buildKpLayer(transitMoonSource, transitKpAyanamsha);
  const rulingPlanetRows = [
    {
      factor: "Day lord",
      planet: WEEKDAY_RULERS[transitMoment.day()],
      basis: `Semana local de ${context.transit.referenceDate} em ${context.transit.timezone}.`,
    },
    {
      factor: "Asc sign lord",
      planet: transitAscLayer.signLord,
      basis: `${transitAscLayer.signName} no ascendente do momento.`,
    },
    {
      factor: "Asc star lord",
      planet: transitAscLayer.starLord,
      basis: `${transitAscLayer.nakshatraName} no ascendente do momento.`,
    },
    {
      factor: "Moon sign lord",
      planet: transitMoonLayer.signLord,
      basis: `${transitMoonLayer.signName} para a Lua do momento.`,
    },
    {
      factor: "Moon star lord",
      planet: transitMoonLayer.starLord,
      basis: `${transitMoonLayer.nakshatraName} para a Lua do momento.`,
    },
    ...(context.config.kpRulingPlanetMode === "extended-7"
      ? [
          {
            factor: "Asc sub-lord",
            planet: transitAscLayer.subLord,
            basis: `Sub-lord do ascendente do momento em ${transitAscLayer.nakshatraName}.`,
          },
          {
            factor: "Moon sub-lord",
            planet: transitMoonLayer.subLord,
            basis: `Sub-lord da Lua do momento em ${transitMoonLayer.nakshatraName}.`,
          },
        ]
      : []),
  ];
  const rulingPlanetSummary = Array.from(new Set(rulingPlanetRows.map((row) => row.planet))).join(", ");
  const dominantCusps = [1, 4, 7, 10].map((house) => {
    const layer = cuspLayers[house - 1];
    return `Casa ${house}: ${layer.starLord}/${layer.subLord}`;
  });
  const significatorRows = pointRows
    .filter((row) => row.point.key !== "ascendant")
    .map((row) => {
      const lord = lordLinksByLord.get(row.layer.signLord as KpLord);
      const selfLord = lordByPointKey.get(row.point.key as KpPointKey);
      const activeLinks = selfLord ? lordLinksByLord.get(selfLord) : undefined;

      return {
        pointName: row.point.name,
        pointKey: row.point.key,
        kpHouse: row.kpHouse,
        starLord: row.layer.starLord,
        subLord: row.layer.subLord,
        signLord: row.layer.signLord,
        starHouses: activeLinks?.starSignifiedHouses ?? [],
        ownHouses: uniqueNumbers([...(activeLinks?.occupiedHouses ?? []), ...(activeLinks?.ownedHouses ?? [])]),
        subBridgeHouses: activeLinks?.subBridgeHouses ?? [],
        totalHouses: activeLinks?.totalSignifiedHouses ?? [],
        signLordOwnedHouses: lord?.ownedHouses ?? [],
      };
    });
  const cuspPromiseRows = cuspLayers.map((layer, index) => {
    const house = index + 1;
    const starLinks = lordLinksByLord.get(layer.starLord);
    const subLinks = lordLinksByLord.get(layer.subLord);
    const starTouchesHouse = starLinks?.totalSignifiedHouses.includes(house) ?? false;
    const subTouchesHouse = subLinks?.totalSignifiedHouses.includes(house) ?? false;
    const gate =
      subTouchesHouse && starTouchesHouse
        ? "Sub e Star tocam a casa"
        : subTouchesHouse
          ? "Sub-lord toca a casa"
          : starTouchesHouse
            ? "Star-lord sustenta a casa"
            : "Promessa indireta";

    return {
      house,
      layer,
      starLinks,
      subLinks,
      gate,
    };
  });
  const themeRows = KP_THEME_DEFINITIONS.map((theme) => {
    const themeSubLords = theme.houses.map((house) => cuspLayers[house - 1].subLord);
    const themeSignifiedHouses = uniqueNumbers(
      themeSubLords.flatMap((lord) => lordLinksByLord.get(lord)?.totalSignifiedHouses ?? [])
    );
    const hitCount = theme.houses.filter((house) => themeSignifiedHouses.includes(house)).length;

    return {
      theme,
      subLords: Array.from(new Set(themeSubLords)),
      signifiedHouses: themeSignifiedHouses,
      hitCount,
      gate: scoreThemeHit(hitCount, theme.houses.length),
    };
  });
  const strongestSignificator = [...significatorRows].sort(
    (left, right) => right.totalHouses.length - left.totalHouses.length || left.pointName.localeCompare(right.pointName)
  )[0];
  const strongestTheme = [...themeRows].sort(
    (left, right) => right.hitCount - left.hitCount || left.theme.label.localeCompare(right.theme.label)
  )[0];

  return {
    sections: [
      createSection({
        id: `${module}-kp-overview`,
        title: "Krishnamurti Paddhati (KP)",
        description:
          "Camada KP separada do julgamento tradicional. Ela usa ayanamsha proprio, cuspides KP e Ruling Planets sem reescrever Parasari, Jaimini ou Bhava Chalit do relatorio-base.",
        status: "implemented",
        items: [
          createDatum(module, "KP", "Modo KP", "Camada separada ativa", {
            technicalNotes: "Os dados KP aparecem como overlay tecnico e nao alteram silenciosamente a leitura tradicional.",
            confidence: 0.94,
            status: "implemented",
            methodUsed: "kp-separate-layer-v1",
          }),
          createDatum(module, "KP", "Ayanamsha KP", `${context.config.kpAyanamsha} | ${kpAyanamshaDegrees.toFixed(4)}deg`, {
            technicalNotes: "Valor proprio da camada KP para cuspides, star-lords e sub-lords.",
            confidence: 0.9,
            status: "implemented",
            methodUsed: "kp-ayanamsha-v1",
          }),
          createDatum(module, "KP", "Sistema de casas KP", "Placidus", {
            technicalNotes: "As cuspides KP sao calculadas em Placidus e depois convertidas para o recorte sideral escolhido da camada KP.",
            confidence: 0.9,
            status: "implemented",
            methodUsed: "kp-placidus-cusps-v1",
          }),
          createDatum(module, "KP", "Ruling Planets", rulingPlanetSummary, {
            technicalNotes: `Modo ${context.config.kpRulingPlanetMode}; fatores ativos: ${rulingPlanetRows.map((row) => row.factor).join(", ")}.`,
            confidence: 0.82,
            status: "implemented",
            methodUsed: "kp-ruling-planets-v1",
          }),
          createDatum(module, "KP", "Eixo 1-4-7-10", dominantCusps.join(" | "), {
            technicalNotes: "Painel curto das cuspides angulares para leitura rapida do astrólogo.",
            confidence: 0.8,
            status: "implemented",
            methodUsed: "kp-angular-cusps-v1",
          }),
          ...(strongestSignificator
            ? [
                createDatum(module, "KP", "Significator operacional dominante", strongestSignificator.pointName, {
                  technicalNotes:
                    `A malha operacional atual abre ${formatHouseList(strongestSignificator.totalHouses)} como conjunto de casas significadas para este ponto.`,
                  confidence: 0.72,
                  status: "implemented",
                  methodUsed: "kp-significator-overlay-v1",
                }),
              ]
            : []),
        ],
        tables: [
          createTable(
            `${module}-kp-cusps`,
            "Cuspides KP",
            ["Casa", "Longitude KP", "Signo", "Nakshatra", "Pada", "Sign lord", "Star lord", "Sub-lord", "Sub-sub-lord"],
            cuspLayers.map((layer, index) => [
              `${index + 1}`,
              formatLongitude(layer.longitude),
              layer.signName,
              layer.nakshatraName,
              `${layer.pada}`,
              layer.signLord,
              layer.starLord,
              layer.subLord,
              layer.subSubLord,
            ]),
            "Cuspides Placidus convertidas para a camada sideral KP, com hierarquia completa de lords por cuspal longitude."
          ),
          createTable(
            `${module}-kp-points`,
            "Planetas e pontos em KP",
            ["Ponto", "Longitude KP", "Casa KP", "Signo", "Nakshatra", "Sign lord", "Star lord", "Sub-lord", "Sub-sub-lord"],
            pointRows.map((row) => [
              row.point.name,
              formatLongitude(row.layer.longitude),
              `${row.kpHouse}`,
              row.layer.signName,
              `${row.layer.nakshatraName} p${row.layer.pada}`,
              row.layer.signLord,
              row.layer.starLord,
              row.layer.subLord,
              row.layer.subSubLord,
            ]),
            "Malha natal KP para os pontos principais do mapa, preservando a separacao desta escola em relacao ao bloco tradicional."
          ),
          createTable(
            `${module}-kp-ruling-planets`,
            "Ruling Planets KP",
            ["Fator", "Planeta", "Base"],
            rulingPlanetRows.map((row) => [row.factor, row.planet, row.basis]),
            "Ruling Planets derivados do momento de analise, em modo KP separado."
          ),
        ],
      }),
      createSection({
        id: `${module}-kp-significators`,
        title: "Significadores KP",
        description:
          "Abre a malha operacional de significadores por planeta: casas do star-lord, ocupacao ou regencia propria e a ponte curta do sub-lord, sem substituir o julgamento completo do astrólogo.",
        status: "implemented",
        items: [
          createDatum(module, "KP", "Regra operacional dos significadores", "Star > planeta > sub", {
            technicalNotes:
              "O overlay prioriza as casas abertas pelo star-lord do planeta, depois preserva ocupacao ou regencia propria e por fim mostra a ponte curta do sub-lord.",
            confidence: 0.76,
            status: "implemented",
            methodUsed: "kp-significator-overlay-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-kp-significators-table`,
            "Significadores operacionais por planeta",
            ["Ponto", "Casa KP", "Star lord", "Casas do star-lord", "Casas proprias", "Sub-lord", "Ponte do sub-lord", "Casas totais"],
            significatorRows.map((row) => [
              row.pointName,
              `${row.kpHouse}`,
              row.starLord,
              formatHouseList(row.starHouses),
              formatHouseList(row.ownHouses),
              row.subLord,
              formatHouseList(row.subBridgeHouses),
              formatHouseList(row.totalHouses),
            ]),
            "Painel curto dos significadores operacionais que o motor KP abre para cada planeta e nodo."
          ),
        ],
      }),
      createSection({
        id: `${module}-kp-cusp-promise`,
        title: "Promessa Cuspal KP",
        description:
          "Mostra como o star-lord e o sub-lord de cada cúspide conversam com a propria casa e com as outras casas abertas pelo motor KP.",
        status: "implemented",
        items: [
          createDatum(module, "KP", "Tema mais convergente", strongestTheme?.theme.label ?? "--", {
            technicalNotes: strongestTheme
              ? `${strongestTheme.gate}; casas significadas ${formatHouseList(strongestTheme.signifiedHouses)}.`
              : "Sem convergencia tematica calculada.",
            confidence: strongestTheme ? 0.7 : 0.4,
            status: "implemented",
            methodUsed: "kp-theme-convergence-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-kp-cusp-promise-table`,
            "Promessa por cúspide",
            ["Casa", "Cúspide KP", "Star-lord", "Casas do star-lord", "Sub-lord", "Casas do sub-lord", "Gate"],
            cuspPromiseRows.map((row) => [
              `${row.house}`,
              formatLongitude(row.layer.longitude),
              row.layer.starLord,
              formatHouseList(row.starLinks?.totalSignifiedHouses ?? []),
              row.layer.subLord,
              formatHouseList(row.subLinks?.totalSignifiedHouses ?? []),
              row.gate,
            ]),
            "A leitura cuspal fica ancorada no sub-lord, com o star-lord preservado como campo principal de abertura."
          ),
          createTable(
            `${module}-kp-theme-panel`,
            "Temas KP prioritarios",
            ["Tema", "Casas-chave", "Sub-lords-chave", "Casas significadas", "Gate", "Nota"],
            themeRows.map((row) => [
              row.theme.label,
              formatHouseList(row.theme.houses),
              row.subLords.join(", "),
              formatHouseList(row.signifiedHouses),
              row.gate,
              row.theme.note,
            ]),
            "Painel tematico curto para o astrólogo ver convergencias cuspais sem misturar isso com a leitura tradicional."
          ),
        ],
      }),
    ],
    validations: [
      createValidation(
        "info",
        "A camada KP foi calculada separadamente e nao substitui o julgamento tradicional do restante do relatorio.",
        "kp",
        "kp-separate-layer-v1"
      ),
      ...(context.config.ayanamsha !== context.config.kpAyanamsha
        ? [
            createValidation(
              "info",
              `KP usa ${context.config.kpAyanamsha} enquanto o bloco tradicional usa ${context.config.ayanamsha}; a divergencia e deliberada para nao misturar escolas.`,
              "kpAyanamsha",
              "kp-separate-ayanamsha"
            ),
          ]
        : []),
    ],
    summary: [
      `Camada KP separada ativa com ${context.config.kpAyanamsha} e Placidus.`,
      `As 12 cuspides KP agora saem com sign lord, star-lord, sub-lord e sub-sub-lord.`,
      `Ruling Planets do momento: ${rulingPlanetSummary}.`,
      strongestSignificator
        ? `${strongestSignificator.pointName} abriu ${formatHouseList(strongestSignificator.totalHouses)} como malha significadora operacional.`
        : "A malha de significadores KP nao encontrou dominancia clara nesta rodada.",
      strongestTheme
        ? `${strongestTheme.theme.label} apareceu como tema KP mais convergente em ${strongestTheme.gate.toLowerCase()}.`
        : "Nenhum tema KP prioritario se destacou nesta rodada.",
    ],
  };
}
