import { Solar } from "lunar-typescript";
import { astro, data } from "iztro";
import zhCnStarLocale from "iztro/lib/i18n/locales/zh-CN/star.js";
import { BaziChart, BaziInput, ElementName } from "@/app/lib/bazi";

type ZiWeiAstrolabe = ReturnType<typeof astro.bySolar>;
type ZiWeiHoroscope = ReturnType<ZiWeiAstrolabe["horoscope"]>;
type ZiWeiSourcePalace = ZiWeiAstrolabe["palaces"][number];
type ZiWeiSourceStar =
  | ZiWeiSourcePalace["majorStars"][number]
  | ZiWeiSourcePalace["minorStars"][number]
  | ZiWeiSourcePalace["adjectiveStars"][number];
type ZiWeiLayerScope = "decadal" | "age" | "yearly" | "monthly" | "daily" | "hourly";
export type ZiWeiEnginePresetId =
  | "default-exact"
  | "default-normal"
  | "zhongzhou-exact"
  | "zhongzhou-normal";

export interface ZiWeiEnginePreset {
  id: ZiWeiEnginePresetId;
  label: string;
  algorithm: "default" | "zhongzhou";
  yearDivide: "exact" | "normal";
  horoscopeDivide: "exact" | "normal";
  ageDivide: "birthday" | "normal";
  dayDivide: "forward" | "current";
  description: string;
}

export interface ZiWeiStarEntry {
  key: string;
  name: string;
  type: "major" | "minor" | "adjective" | "dynamic";
  rawType: string;
  scope: string;
  brightness?: string;
  mutagen?: string;
  palace?: string;
}

export interface ZiWeiTrineHighlight {
  title: string;
  targetPalace: string;
  members: string[];
  starDigest: string[];
  hasMutagenJi: boolean;
  hasMajorAxis: boolean;
}

export interface ZiWeiRelationHighlight {
  title: string;
  palace: string;
  oppositePalace: string;
  wealthPalace: string;
  careerPalace: string;
  flyTargets: string[];
  fliesToOpposite: boolean;
  fliesToWealth: boolean;
  fliesToCareer: boolean;
  selfMutaged: boolean;
  isEmpty: boolean;
}

export interface ZiWeiTemporalRelationHighlight {
  scope: ZiWeiLayerScope;
  label: string;
  palace: string;
  roleAtTarget: string;
  oppositeRole: string;
  wealthRole: string;
  careerRole: string;
  mutagen: string[];
  targetStars: string[];
  axisStars: string[];
}

export interface ZiWeiTemporalMatrixEntry {
  scope: ZiWeiLayerScope;
  label: string;
  palace: string;
  ganZhi: string;
  role: string;
  stars: string[];
  mutagen: string[];
  oppositeRole: string;
  wealthRole: string;
  careerRole: string;
}

export interface ZiWeiStarCatalogEntry {
  name: string;
  libraryKey?: string;
  families: string[];
  natalPalaces: string[];
  dynamicScopes: string[];
  temporalActivations: string[];
  brightnesses: string[];
  mutagens: string[];
  observedInNatal: boolean;
  observedInTiming: boolean;
  fiveElements?: string;
  yinYang?: string;
}

export interface ZiWeiBorrowedStarProfile {
  palace: string;
  isEmpty: boolean;
  borrowedFrom: string;
  borrowedMajorStars: string[];
  rule: string;
}

export interface ZiWeiPalace {
  key: string;
  name: string;
  chineseName: string;
  branch: string;
  stem: string;
  ganZhi: string;
  ageRange: string;
  startAge: number;
  endAge: number;
  headline: string;
  emphasis: string;
  majorStars: ZiWeiStarEntry[];
  minorStars: ZiWeiStarEntry[];
  adjectiveStars: ZiWeiStarEntry[];
  yearTransformations: string[];
  selfTransformations: string[];
  flyingStars: string[];
  isLaiYin: boolean;
  isLifePalace: boolean;
  isBodyPalace: boolean;
  isEmpty: boolean;
  borrowedFromOpposite: boolean;
  borrowedMajorStars: string[];
  emptyRule: string;
  changsheng12: string;
  boshi12: string;
  jiangqian12: string;
  suiqian12: string;
  oppositePalace: string;
  wealthAxisPalace: string;
  careerAxisPalace: string;
  surroundedPalaces: string[];
  surroundedSummary: string;
  mutagedTargetPalaces: string[];
  fliesToOpposite: boolean;
  fliesToWealth: boolean;
  fliesToCareer: boolean;
  observedStarCount: number;
}

export interface ZiWeiHoroscopeEntry {
  palace: string;
  age: number;
  year: number;
  label: string;
}

export interface ZiWeiHoroscopeLayer {
  scope: ZiWeiLayerScope;
  label: string;
  activeIndex: number;
  activePalace: string;
  rolePalace: string;
  activePalaceGanZhi: string;
  heavenlyStem: string;
  earthlyBranch: string;
  ganZhi: string;
  mutagen: string[];
  starCount: number;
  palaceMappings: string[];
  starLines: string[];
}

export interface ZiWeiCoverage {
  engine: string;
  libraryEstimatedStarCount: number;
  expectedFloor: number;
  observedNatalUniqueStars: number;
  observedDynamicUniqueStars: number;
  observedCombinedUniqueStars: number;
  palaceCount: number;
  layerCount: number;
  supports: string[];
}

export interface ZiWeiProfile {
  mingGong: string;
  shenGong: string;
  mingGongNaYin: string;
  shenGongNaYin: string;
  mingPalaceName: string;
  shenPalaceName: string;
  lunarMonth: number;
  lunarDay: number;
  lunarDateLabel: string;
  solarDate: string;
  trueSolarDate?: string;
  sexagenaryDate?: string;
  zodiac: string;
  genderLabel: string;
  fiveElementBureau: string;
  horoscopeDirection: string;
  ziweiStarBranch: string;
  mainPalaceBranch: string;
  currentDecadePalace: string;
  currentDecadeRange: string;
  enginePreset: ZiWeiEnginePreset;
  palaceHighlights: ZiWeiPalace[];
  borrowedStarProfiles: ZiWeiBorrowedStarProfile[];
  fourTransformations: string[];
  currentHoroscope: ZiWeiHoroscopeEntry[];
  horoscopeLayers: ZiWeiHoroscopeLayer[];
  temporalMatrix: ZiWeiTemporalMatrixEntry[];
  keyAxes: string[];
  trineHighlights: ZiWeiTrineHighlight[];
  relationHighlights: ZiWeiRelationHighlight[];
  temporalRelationHighlights: ZiWeiTemporalRelationHighlight[];
  summary: string[];
  coverage: ZiWeiCoverage;
  observedNatalStars: string[];
  observedDynamicStars: string[];
  starCatalog: ZiWeiStarCatalogEntry[];
  soulStar: string;
  bodyStar: string;
  birthTimeIndex: number;
  birthTimeRange: string;
  consultationMoment: string;
}

interface ZiWeiReferenceMoment {
  date: string;
  time: string;
}

const ZIWEI_ENGINE_NAME = "iztro 2.5.8";
const ZIWEI_LIBRARY_ESTIMATED_STARS = 162;
const ZIWEI_LIBRARY_EXPECTED_FLOOR = 100;
const MUTAGEN_LABELS = ["禄", "权", "科", "忌"] as const;
const STAR_LABELS = zhCnStarLocale as Record<string, string>;
const STAR_KEY_BY_NAME = new Map(
  Object.entries(STAR_LABELS).map(([key, value]) => [value, key])
);
export const ZIWEI_ENGINE_PRESETS: Record<ZiWeiEnginePresetId, ZiWeiEnginePreset> = {
  "default-exact": {
    id: "default-exact",
    label: "Padrão auditável",
    algorithm: "default",
    yearDivide: "exact",
    horoscopeDivide: "exact",
    ageDivide: "birthday",
    dayDivide: "current",
    description:
      "Preset técnico com algoritmo padrão do iztro e divisões exatas para ano e 运限.",
  },
  "default-normal": {
    id: "default-normal",
    label: "Padrão normal",
    algorithm: "default",
    yearDivide: "normal",
    horoscopeDivide: "normal",
    ageDivide: "normal",
    dayDivide: "current",
    description:
      "Preset técnico com algoritmo padrão do iztro e cortes normais para ano, 运限 e idade.",
  },
  "zhongzhou-exact": {
    id: "zhongzhou-exact",
    label: "Zhongzhou exato",
    algorithm: "zhongzhou",
    yearDivide: "exact",
    horoscopeDivide: "exact",
    ageDivide: "birthday",
    dayDivide: "current",
    description:
      "Preset técnico com algoritmo Zhongzhou e divisões exatas para ano e 运限.",
  },
  "zhongzhou-normal": {
    id: "zhongzhou-normal",
    label: "Zhongzhou normal",
    algorithm: "zhongzhou",
    yearDivide: "normal",
    horoscopeDivide: "normal",
    ageDivide: "normal",
    dayDivide: "current",
    description:
      "Preset técnico com algoritmo Zhongzhou e cortes normais para ano, 运限 e idade.",
  },
};
const HOROSCOPE_SCOPE_META: Record<
  ZiWeiLayerScope,
  {
    label: string;
  }
> = {
  decadal: { label: "大限" },
  age: { label: "小限" },
  yearly: { label: "流年" },
  monthly: { label: "流月" },
  daily: { label: "流日" },
  hourly: { label: "流时" },
};

const BRANCH_LABELS: Record<string, string> = {
  子: "Zi / Rato",
  丑: "Chou / Boi",
  寅: "Yin / Tigre",
  卯: "Mao / Coelho",
  辰: "Chen / Dragao",
  巳: "Si / Serpente",
  午: "Wu / Cavalo",
  未: "Wei / Cabra",
  申: "Shen / Macaco",
  酉: "You / Galo",
  戌: "Xu / Cao",
  亥: "Hai / Porco",
};

const PALACE_META: Record<
  string,
  {
    key: string;
    label: string;
    headline: string;
  }
> = {
  命宫: {
    key: "MING",
    label: "Destino",
    headline: "Centro do mapa, eixo da pessoa e do modo de se colocar no mundo.",
  },
  兄弟: {
    key: "XIONG_DI",
    label: "Irmaos",
    headline: "Rede de pares, irmaos, aliados proximos e competidores de mesmo nivel.",
  },
  夫妻: {
    key: "FU_QI",
    label: "Casamento",
    headline: "Parcerias intimas, uniao, convivencia e espelho relacional principal.",
  },
  子女: {
    key: "ZI_NV",
    label: "Filhos",
    headline: "Filhos, frutos, criatividade, obras e extensoes da propria energia.",
  },
  财帛: {
    key: "CAI_BO",
    label: "Riqueza",
    headline: "Fluxo de recursos, arrecadacao, caixa, patrimonio e renda.",
  },
  疾厄: {
    key: "JI_E",
    label: "Saude",
    headline: "Corpo, desgaste, manutencao fisiologica e pontos de sobrecarga.",
  },
  迁移: {
    key: "QIAN_YI",
    label: "Viagens",
    headline: "Movimento, migracao, deslocamentos, ambiente externo e palco fora da base.",
  },
  仆役: {
    key: "JIAO_YOU",
    label: "Aliancas",
    headline: "Amigos, clientes, subordinados, rede de cooperacao e pessoas de suporte.",
  },
  官禄: {
    key: "GUAN_LU",
    label: "Carreira",
    headline: "Vocacao, oficio, carreira, reputacao funcional e postura perante autoridade.",
  },
  田宅: {
    key: "TIAN_ZHAI",
    label: "Propriedade",
    headline: "Moradia, imoveis, base material, posse e consolidacao patrimonial.",
  },
  福德: {
    key: "FU_DE",
    label: "Fortuna",
    headline: "Bem-estar, descanso, vida interior, lastro psiquico e fortuna invisivel.",
  },
  父母: {
    key: "FU_MU",
    label: "Pais",
    headline: "Origem, pais, mentores, tutela, heranca cultural e suporte ancestral.",
  },
};

const ELEMENT_NOTES: Record<ElementName, string> = {
  Madeira: "crescimento, autonomia e novos ramos",
  Fogo: "expressao, performance e presenca",
  Terra: "base material, responsabilidade e foco",
  Metal: "criterio, reputacao e refinamento",
  Agua: "percepcao, adaptacao e leitura fina",
};

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function formatBranchLabel(branch: string) {
  return branch ? `${branch} / ${BRANCH_LABELS[branch] ?? branch}` : "--";
}

function toDisplayDate(date: string, time?: string) {
  return time ? `${date} ${time}` : date;
}

function normalizeDateForIztro(date: string) {
  const [year, month, day] = date.split("-").map((value) => Number(value));
  return `${year}-${month}-${day}`;
}

function toTimeIndex(time: string) {
  const [hour, minute] = time.split(":").map((value) => Number(value));
  const totalMinutes = (hour || 0) * 60 + (minute || 0);

  if (totalMinutes >= 23 * 60) {
    return 12;
  }

  if (totalMinutes < 60) {
    return 0;
  }

  return Math.min(11, Math.floor((totalMinutes - 60) / 120) + 1);
}

function resolveBirthMoment(input: BaziInput, chart: BaziChart) {
  const safeTime = input.unknownTime ? "12:00" : input.time;
  const shouldUseAdjusted = input.solarTime || input.dayStartsAt23;
  const date = shouldUseAdjusted ? chart.adjusted.date : input.date;
  const time = shouldUseAdjusted ? chart.adjusted.time : safeTime;
  const timeIndex = toTimeIndex(time);

  return {
    rawDate: input.date,
    rawTime: safeTime,
    date,
    time,
    dateStr: normalizeDateForIztro(date),
    timeIndex,
    timeRange: data.TIME_RANGE?.[timeIndex] ?? "--",
  };
}

function resolveReferenceMoment(
  reference: ZiWeiReferenceMoment | undefined,
  birthMoment: ReturnType<typeof resolveBirthMoment>
) {
  const date = reference?.date ?? birthMoment.date;
  const time = reference?.time ?? birthMoment.time;

  return {
    date,
    time,
    dateStr: normalizeDateForIztro(date),
    timeIndex: toTimeIndex(time),
    timeRange: data.TIME_RANGE?.[toTimeIndex(time)] ?? "--",
  };
}

function normalizeStarFamily(star: ZiWeiSourceStar): ZiWeiStarEntry["type"] {
  if (star.scope !== "origin") {
    return "dynamic";
  }

  if (star.type === "major") {
    return "major";
  }

  if (star.type === "adjective") {
    return "adjective";
  }

  return "minor";
}

function normalizeStar(star: ZiWeiSourceStar, palaceName?: string): ZiWeiStarEntry {
  const brightness = star.brightness || undefined;
  const mutagen = star.mutagen || undefined;

  return {
    key: `${star.scope}:${star.type}:${star.name}:${palaceName ?? "--"}`,
    name: star.name,
    type: normalizeStarFamily(star),
    rawType: star.type,
    scope: star.scope,
    brightness,
    mutagen,
    palace: palaceName,
  };
}

function uniqueStrings(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function joinOrFallback(values: string[], fallback = "--") {
  return values.length ? values.join("/") : fallback;
}

function mapBrightness(brightness?: string) {
  const dictionary: Record<string, string> = {
    庙: "Miao / templo",
    旺: "Wang / prospera",
    得: "De / favorecida",
    利: "Li / util",
    平: "Ping / neutra",
    陷: "Xian / queda",
    不: "Bu / fraca",
  };

  return brightness ? dictionary[brightness] ?? brightness : "--";
}

function summarizeStars(stars: ZiWeiStarEntry[], limit = 8) {
  return stars
    .slice(0, limit)
    .map((star) => {
      const pieces = [star.name];

      if (star.mutagen) {
        pieces.push(`化${star.mutagen}`);
      }

      if (star.brightness) {
        pieces.push(mapBrightness(star.brightness));
      }

      return pieces.join(" ");
    })
    .join(" / ");
}

function buildPalaceEmphasis(
  headline: string,
  palace: ZiWeiSourcePalace,
  dayElement: ElementName,
  majorStars: ZiWeiStarEntry[],
  minorStars: ZiWeiStarEntry[],
  adjectiveStars: ZiWeiStarEntry[],
  ageRange: string
) {
  return `${headline} ${palace.heavenlyStem}${palace.earthlyBranch}; principais ${
    summarizeStars(majorStars) || "--"
  }; auxiliares ${summarizeStars(minorStars, 6) || "--"}; adjetivas ${
    summarizeStars(adjectiveStars, 6) || "--"
  }; grande periodo ${ageRange}; Chang Sheng ${palace.changsheng12}; Bo Shi ${
    palace.boshi12
  }; eixo elemental ${ELEMENT_NOTES[dayElement]}.`;
}

function buildNatalTransformations(stars: ZiWeiStarEntry[]) {
  return uniqueStrings(
    stars.map((star) => (star.mutagen ? `${star.name}化${star.mutagen}` : undefined))
  );
}

function buildSelfTransformations(palace: ZiWeiSourcePalace) {
  return MUTAGEN_LABELS.filter((mutagen) => palace.selfMutaged(mutagen)).map(
    (mutagen) => `自化${mutagen}`
  );
}

function buildMutagedTargetPalaces(palace: ZiWeiSourcePalace) {
  return palace
    .mutagedPlaces()
    .flatMap((target, index) => (target ? [`${MUTAGEN_LABELS[index]}→${target.name}`] : []));
}

function inferHoroscopeDirection(sourcePalaces: ZiWeiSourcePalace[], mingIndex: number) {
  const current = sourcePalaces[mingIndex].decadal.range[0];
  const previous = sourcePalaces[modulo(mingIndex - 1, sourcePalaces.length)].decadal.range[0];
  const next = sourcePalaces[modulo(mingIndex + 1, sourcePalaces.length)].decadal.range[0];
  const normalize = (value: number) => {
    let result = value;

    while (result < current) {
      result += 120;
    }

    return result;
  };

  const previousStep = normalize(previous);
  const nextStep = normalize(next);

  return previousStep < nextStep
    ? "Reversa / anti-horaria no tabuleiro natal"
    : "Direta / horaria no tabuleiro natal";
}

function buildTrineHighlight(
  title: string,
  palace: ZiWeiPalace,
  palaceLookup: Map<string, ZiWeiPalace>
) {
  const members = palace.surroundedPalaces;
  const starDigest = members.map((member) => {
    const chineseName = member.match(/\((.+?)\)/)?.[1];
    const target =
      (chineseName && palaceLookup.get(chineseName)) ||
      [...palaceLookup.values()].find((entry) => member.includes(entry.chineseName));

    return target
      ? `${target.name} (${target.chineseName}) ${target.ganZhi}: ${summarizeStars(
          target.majorStars,
          6
        ) || "--"}`
      : member;
  });

  return {
    title,
    targetPalace: `${palace.name} (${palace.chineseName}) ${palace.ganZhi}`,
    members,
    starDigest,
    hasMutagenJi: members.some((member) => member.includes("化忌")),
    hasMajorAxis: starDigest.some((line) =>
      ["紫微", "天府", "太阳", "太阴", "武曲", "贪狼", "天梁", "天相"].some((star) =>
        line.includes(star)
      )
    ),
  } satisfies ZiWeiTrineHighlight;
}

function buildRelationHighlight(
  title: string,
  palace: ZiWeiPalace,
  sourcePalace: ZiWeiSourcePalace,
  surrounded: ReturnType<ZiWeiAstrolabe["surroundedPalaces"]>
) {
  return {
    title,
    palace: `${palace.name} (${palace.chineseName}) ${palace.ganZhi}`,
    oppositePalace: `${PALACE_META[surrounded.opposite.name]?.label ?? surrounded.opposite.name} (${surrounded.opposite.name}) ${
      surrounded.opposite.heavenlyStem
    }${surrounded.opposite.earthlyBranch}`,
    wealthPalace: `${PALACE_META[surrounded.wealth.name]?.label ?? surrounded.wealth.name} (${surrounded.wealth.name}) ${
      surrounded.wealth.heavenlyStem
    }${surrounded.wealth.earthlyBranch}`,
    careerPalace: `${PALACE_META[surrounded.career.name]?.label ?? surrounded.career.name} (${surrounded.career.name}) ${
      surrounded.career.heavenlyStem
    }${surrounded.career.earthlyBranch}`,
    flyTargets: palace.mutagedTargetPalaces,
    fliesToOpposite: sourcePalace.fliesOneOfTo(surrounded.opposite.index, [...MUTAGEN_LABELS]),
    fliesToWealth: sourcePalace.fliesOneOfTo(surrounded.wealth.index, [...MUTAGEN_LABELS]),
    fliesToCareer: sourcePalace.fliesOneOfTo(surrounded.career.index, [...MUTAGEN_LABELS]),
    selfMutaged: sourcePalace.selfMutagedOneOf(),
    isEmpty: palace.isEmpty,
  } satisfies ZiWeiRelationHighlight;
}

function buildTemporalRelationHighlight(
  scope: ZiWeiLayerScope,
  sourcePalace: ZiWeiSourcePalace,
  palace: ZiWeiPalace,
  item: ZiWeiHoroscope["decadal"],
  surrounded: ReturnType<ZiWeiAstrolabe["surroundedPalaces"]>
) {
  const targetStars = (item.stars?.[sourcePalace.index] ?? []).map((star) => star.name);
  const oppositeStars = (item.stars?.[surrounded.opposite.index] ?? []).map((star) => star.name);
  const wealthStars = (item.stars?.[surrounded.wealth.index] ?? []).map((star) => star.name);
  const careerStars = (item.stars?.[surrounded.career.index] ?? []).map((star) => star.name);

  return {
    scope,
    label: HOROSCOPE_SCOPE_META[scope].label,
    palace: `${palace.name} (${palace.chineseName}) ${palace.ganZhi}`,
    roleAtTarget: item.palaceNames[sourcePalace.index] ?? "--",
    oppositeRole: item.palaceNames[surrounded.opposite.index] ?? "--",
    wealthRole: item.palaceNames[surrounded.wealth.index] ?? "--",
    careerRole: item.palaceNames[surrounded.career.index] ?? "--",
    mutagen: [...item.mutagen],
    targetStars,
    axisStars: [
      `${item.palaceNames[surrounded.opposite.index] ?? "--"}:${oppositeStars.join("/") || "--"}`,
      `${item.palaceNames[surrounded.wealth.index] ?? "--"}:${wealthStars.join("/") || "--"}`,
      `${item.palaceNames[surrounded.career.index] ?? "--"}:${careerStars.join("/") || "--"}`,
    ],
  } satisfies ZiWeiTemporalRelationHighlight;
}

function buildTemporalMatrixEntry(
  scope: ZiWeiLayerScope,
  sourcePalace: ZiWeiSourcePalace,
  palace: ZiWeiPalace,
  item: ZiWeiHoroscope["decadal"],
  surrounded: ReturnType<ZiWeiAstrolabe["surroundedPalaces"]>
) {
  return {
    scope,
    label: HOROSCOPE_SCOPE_META[scope].label,
    palace: `${palace.name} (${palace.chineseName})`,
    ganZhi: palace.ganZhi,
    role: item.palaceNames[sourcePalace.index] ?? "--",
    stars: (item.stars?.[sourcePalace.index] ?? []).map((star) => star.name),
    mutagen: [...item.mutagen],
    oppositeRole: item.palaceNames[surrounded.opposite.index] ?? "--",
    wealthRole: item.palaceNames[surrounded.wealth.index] ?? "--",
    careerRole: item.palaceNames[surrounded.career.index] ?? "--",
  } satisfies ZiWeiTemporalMatrixEntry;
}

function buildHoroscopeLayer(
  scope: ZiWeiLayerScope,
  sourcePalaces: ZiWeiSourcePalace[],
  natalLookup: Map<string, ZiWeiPalace>,
  item: ZiWeiHoroscope["decadal"]
) {
  const activeSource = sourcePalaces[item.index];
  const activeNatal = natalLookup.get(activeSource.name);
  const rolePalace = item.palaceNames[item.index] ?? "--";
  const starGroups = (item.stars ?? []).map((bucket, index) => {
    const anchor = sourcePalaces[index];
    const role = item.palaceNames[index] ?? "--";
    const normalized = bucket.map((star) => normalizeStar(star, anchor.name));

    return {
      anchor,
      role,
      stars: normalized,
    };
  });
  const starLines = starGroups
    .filter((group) => group.stars.length)
    .map(
      (group) =>
        `${PALACE_META[group.anchor.name]?.label ?? group.anchor.name} (${group.anchor.name}) ${
          group.anchor.heavenlyStem
        }${group.anchor.earthlyBranch} -> ${group.role}: ${summarizeStars(group.stars, 10) || "--"}`
    );

  return {
    scope,
    label: HOROSCOPE_SCOPE_META[scope].label,
    activeIndex: item.index,
    activePalace: `${PALACE_META[activeSource.name]?.label ?? activeSource.name} (${activeSource.name})`,
    rolePalace,
    activePalaceGanZhi: activeNatal?.ganZhi ?? `${activeSource.heavenlyStem}${activeSource.earthlyBranch}`,
    heavenlyStem: item.heavenlyStem,
    earthlyBranch: item.earthlyBranch,
    ganZhi: `${item.heavenlyStem}${item.earthlyBranch}`,
    mutagen: [...item.mutagen],
    starCount: starGroups.reduce((total, group) => total + group.stars.length, 0),
    palaceMappings: sourcePalaces.map(
      (palace, index) =>
        `${PALACE_META[palace.name]?.label ?? palace.name} (${palace.name}) ${palace.heavenlyStem}${
          palace.earthlyBranch
        } -> ${item.palaceNames[index] ?? "--"}`
    ),
    starLines,
  } satisfies ZiWeiHoroscopeLayer;
}

function collectUniqueStarNames(values: ZiWeiStarEntry[][]) {
  return [...new Set(values.flat().map((star) => star.name))].sort((left, right) =>
    left.localeCompare(right, "zh-CN")
  );
}

function collectDynamicStarNames(horoscope: ZiWeiHoroscope) {
  const buckets = [
    horoscope.decadal.stars ?? [],
    horoscope.yearly.stars ?? [],
    horoscope.monthly.stars ?? [],
    horoscope.daily.stars ?? [],
    horoscope.hourly.stars ?? [],
  ];

  return [
    ...new Set(
      buckets
        .flat()
        .flat()
        .map((star) => star.name)
        .filter(Boolean)
    ),
  ].sort((left, right) => left.localeCompare(right, "zh-CN"));
}

function mapCatalogFamilyLabel(family: ZiWeiStarEntry["type"]) {
  const labels: Record<ZiWeiStarEntry["type"], string> = {
    major: "principal",
    minor: "auxiliar",
    adjective: "adjetiva",
    dynamic: "dinamica",
  };

  return labels[family];
}

function buildStarCatalog(
  palaces: ZiWeiPalace[],
  sourcePalaces: ZiWeiSourcePalace[],
  horoscope: ZiWeiHoroscope
) {
  const catalog = new Map<
    string,
    {
      name: string;
      libraryKey?: string;
      families: Set<string>;
      natalPalaces: Set<string>;
      dynamicScopes: Set<string>;
      temporalActivations: Set<string>;
      brightnesses: Set<string>;
      mutagens: Set<string>;
      observedInNatal: boolean;
      observedInTiming: boolean;
      fiveElements?: string;
      yinYang?: string;
    }
  >();

  const ensureEntry = (name: string) => {
    let entry = catalog.get(name);

    if (!entry) {
      const libraryKey = STAR_KEY_BY_NAME.get(name);
      const info =
        (libraryKey &&
          (data.STARS_INFO as Record<string, { fiveElements?: string; yinYang?: string }>)[
            libraryKey
          ]) ||
        undefined;

      entry = {
        name,
        libraryKey,
        families: new Set<string>(),
        natalPalaces: new Set<string>(),
        dynamicScopes: new Set<string>(),
        temporalActivations: new Set<string>(),
        brightnesses: new Set<string>(),
        mutagens: new Set<string>(),
        observedInNatal: false,
        observedInTiming: false,
        fiveElements: info?.fiveElements,
        yinYang: info?.yinYang,
      };
      catalog.set(name, entry);
    }

    return entry;
  };

  palaces.forEach((palace) => {
    [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars].forEach((star) => {
      const entry = ensureEntry(star.name);
      entry.families.add(mapCatalogFamilyLabel(star.type));
      entry.natalPalaces.add(`${palace.name} (${palace.chineseName}) ${palace.ganZhi}`);
      entry.observedInNatal = true;

      if (star.brightness) {
        entry.brightnesses.add(mapBrightness(star.brightness));
      }

      if (star.mutagen) {
        entry.mutagens.add(`化${star.mutagen}`);
      }
    });
  });

  const dynamicLayers = [
    { scope: "decadal" as const, item: horoscope.decadal },
    { scope: "age" as const, item: horoscope.age },
    { scope: "yearly" as const, item: horoscope.yearly },
    { scope: "monthly" as const, item: horoscope.monthly },
    { scope: "daily" as const, item: horoscope.daily },
    { scope: "hourly" as const, item: horoscope.hourly },
  ];

  dynamicLayers.forEach(({ scope, item }) => {
    const scopeLabel = `${HOROSCOPE_SCOPE_META[scope].label} ${item.heavenlyStem}${item.earthlyBranch}`;

    (item.stars ?? []).forEach((bucket, index) => {
      const sourcePalace = sourcePalaces[index];
      const rolePalace = item.palaceNames[index] ?? "--";

      bucket.forEach((sourceStar) => {
        const star = normalizeStar(sourceStar, sourcePalace?.name);
        const entry = ensureEntry(star.name);
        entry.families.add(mapCatalogFamilyLabel(star.type));
        entry.dynamicScopes.add(scopeLabel);
        entry.temporalActivations.add(
          `${scopeLabel} | ${PALACE_META[sourcePalace?.name]?.label ?? sourcePalace?.name ?? "--"} (${sourcePalace?.name ?? "--"}) ${sourcePalace?.heavenlyStem ?? "--"}${sourcePalace?.earthlyBranch ?? "--"} -> ${rolePalace}`
        );
        entry.observedInTiming = true;

        if (star.brightness) {
          entry.brightnesses.add(mapBrightness(star.brightness));
        }

        if (star.mutagen) {
          entry.mutagens.add(`化${star.mutagen}`);
        }
      });
    });
  });

  return [...catalog.values()]
    .map((entry) => ({
      name: entry.name,
      libraryKey: entry.libraryKey,
      families: [...entry.families].sort(),
      natalPalaces: [...entry.natalPalaces].sort((left, right) => left.localeCompare(right, "zh-CN")),
      dynamicScopes: [...entry.dynamicScopes].sort((left, right) => left.localeCompare(right, "zh-CN")),
      temporalActivations: [...entry.temporalActivations].sort((left, right) =>
        left.localeCompare(right, "zh-CN")
      ),
      brightnesses: [...entry.brightnesses],
      mutagens: [...entry.mutagens],
      observedInNatal: entry.observedInNatal,
      observedInTiming: entry.observedInTiming,
      fiveElements: entry.fiveElements,
      yinYang: entry.yinYang,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "zh-CN")) satisfies ZiWeiStarCatalogEntry[];
}

export function calculateZiWeiProfile(
  input: BaziInput,
  chart: BaziChart,
  reference?: ZiWeiReferenceMoment,
  presetId: ZiWeiEnginePresetId = "default-exact"
): ZiWeiProfile {
  const preset = ZIWEI_ENGINE_PRESETS[presetId];
  const birthMoment = resolveBirthMoment(input, chart);
  const referenceMoment = resolveReferenceMoment(reference, birthMoment);
  const [year, month, day] = birthMoment.date.split("-").map(Number);
  const [hour, minute] = birthMoment.time.split(":").map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const mingGongGanZhi = eightChar.getMingGong();
  const shenGongGanZhi = eightChar.getShenGong();
  const mingBranch = mingGongGanZhi[1] ?? "";
  const shenBranch = shenGongGanZhi[1] ?? "";

  const astrolabe = astro.withOptions({
    type: "solar",
    dateStr: birthMoment.dateStr,
    timeIndex: birthMoment.timeIndex,
    gender: input.gender,
    fixLeap: true,
    language: "zh-CN",
    config: {
      yearDivide: preset.yearDivide,
      horoscopeDivide: preset.horoscopeDivide,
      ageDivide: preset.ageDivide,
      dayDivide: input.dayStartsAt23 ? "forward" : preset.dayDivide,
      algorithm: preset.algorithm,
    },
  });
  const horoscope = astrolabe.horoscope(referenceMoment.dateStr, referenceMoment.timeIndex);
  const sourceLookup = new Map(astrolabe.palaces.map((palace) => [palace.name, palace]));
  const rawPalaces = astrolabe.palaces.map((palace) => {
    const meta = PALACE_META[palace.name] ?? {
      key: palace.name,
      label: palace.name,
      headline: "Quadro tecnico do palacio.",
    };
    const majorStars = palace.majorStars.map((star) => normalizeStar(star, palace.name));
    const minorStars = palace.minorStars.map((star) => normalizeStar(star, palace.name));
    const adjectiveStars = palace.adjectiveStars.map((star) => normalizeStar(star, palace.name));
    const allNatalStars = [...majorStars, ...minorStars, ...adjectiveStars];
    const yearTransformations = buildNatalTransformations(allNatalStars);
    const selfTransformations = buildSelfTransformations(palace);
    const mutagedTargetPalaces = buildMutagedTargetPalaces(palace);
    const surrounded = astrolabe.surroundedPalaces(palace.index);
    const isEmpty = palace.isEmpty();
    const borrowedMajorStars = isEmpty
      ? surrounded.opposite.majorStars
          .filter((star) => star.type === "major")
          .map((star) => star.name)
      : [];
    const surroundedPalaces = [surrounded.target, surrounded.opposite, surrounded.wealth, surrounded.career].map(
      (entry) =>
        `${PALACE_META[entry.name]?.label ?? entry.name} (${entry.name}) ${entry.heavenlyStem}${entry.earthlyBranch}${
          entry.hasMutagen("忌") ? " 化忌" : ""
        }`
    );
    const oppositePalace = `${PALACE_META[surrounded.opposite.name]?.label ?? surrounded.opposite.name} (${surrounded.opposite.name}) ${
      surrounded.opposite.heavenlyStem
    }${surrounded.opposite.earthlyBranch}`;
    const wealthAxisPalace = `${PALACE_META[surrounded.wealth.name]?.label ?? surrounded.wealth.name} (${surrounded.wealth.name}) ${
      surrounded.wealth.heavenlyStem
    }${surrounded.wealth.earthlyBranch}`;
    const careerAxisPalace = `${PALACE_META[surrounded.career.name]?.label ?? surrounded.career.name} (${surrounded.career.name}) ${
      surrounded.career.heavenlyStem
    }${surrounded.career.earthlyBranch}`;
    const startAge = palace.decadal.range[0];
    const endAge = palace.decadal.range[1];
    const ageRange = `${startAge}-${endAge}`;

    return {
      key: meta.key,
      name: meta.label,
      chineseName: palace.name,
      branch: formatBranchLabel(palace.earthlyBranch),
      stem: palace.heavenlyStem,
      ganZhi: `${palace.heavenlyStem}${palace.earthlyBranch}`,
      ageRange,
      startAge,
      endAge,
      headline: meta.headline,
      emphasis: buildPalaceEmphasis(
        meta.headline,
        palace,
        chart.dayMaster.element,
        majorStars,
        minorStars,
        adjectiveStars,
        ageRange
      ),
      majorStars,
      minorStars,
      adjectiveStars,
      yearTransformations,
      selfTransformations,
      flyingStars: mutagedTargetPalaces,
      isLaiYin: palace.isOriginalPalace,
      isLifePalace: palace.name === "命宫",
      isBodyPalace: palace.isBodyPalace,
      isEmpty,
      borrowedFromOpposite: isEmpty && borrowedMajorStars.length > 0,
      borrowedMajorStars,
      emptyRule: isEmpty
        ? `空宫: sem estrela principal no proprio palacio; regra tecnica ativa 借对宫主星 a partir de ${PALACE_META[surrounded.opposite.name]?.label ?? surrounded.opposite.name} (${surrounded.opposite.name}).`
        : "Palacio com estrela principal propria; nao usa emprestimo tecnico do oposto.",
      changsheng12: palace.changsheng12,
      boshi12: palace.boshi12,
      jiangqian12: palace.jiangqian12,
      suiqian12: palace.suiqian12,
      oppositePalace,
      wealthAxisPalace,
      careerAxisPalace,
      surroundedPalaces,
      surroundedSummary: `${surroundedPalaces.join(" | ")} | 有忌: ${
        surrounded.haveMutagen("忌") ? "sim" : "nao"
      }`,
      mutagedTargetPalaces,
      fliesToOpposite: palace.fliesOneOfTo(surrounded.opposite.index, [...MUTAGEN_LABELS]),
      fliesToWealth: palace.fliesOneOfTo(surrounded.wealth.index, [...MUTAGEN_LABELS]),
      fliesToCareer: palace.fliesOneOfTo(surrounded.career.index, [...MUTAGEN_LABELS]),
      observedStarCount: allNatalStars.length,
    } satisfies ZiWeiPalace;
  });

  const natalLookup = new Map(rawPalaces.map((palace) => [palace.chineseName, palace]));
  const mingIndex = rawPalaces.findIndex((palace) => palace.key === "MING");
  const palaceHighlights = rawPalaces.map(
    (_, index) => rawPalaces[modulo(mingIndex + index, rawPalaces.length)]
  );
  const mingPalace = rawPalaces.find((palace) => palace.key === "MING") ?? palaceHighlights[0];
  const bodyPalace = rawPalaces.find((palace) => palace.isBodyPalace);
  const spousePalace = rawPalaces.find((palace) => palace.key === "FU_QI");
  const wealthPalace = rawPalaces.find((palace) => palace.key === "CAI_BO");
  const careerPalace = rawPalaces.find((palace) => palace.key === "GUAN_LU");
  const healthPalace = rawPalaces.find((palace) => palace.key === "JI_E");
  const horoscopeLayers = [
    buildHoroscopeLayer("decadal", astrolabe.palaces, natalLookup, horoscope.decadal),
    buildHoroscopeLayer("age", astrolabe.palaces, natalLookup, horoscope.age),
    buildHoroscopeLayer("yearly", astrolabe.palaces, natalLookup, horoscope.yearly),
    buildHoroscopeLayer("monthly", astrolabe.palaces, natalLookup, horoscope.monthly),
    buildHoroscopeLayer("daily", astrolabe.palaces, natalLookup, horoscope.daily),
    buildHoroscopeLayer("hourly", astrolabe.palaces, natalLookup, horoscope.hourly),
  ];
  const nominalAge = horoscope.age.nominalAge;
  const currentDecadePalace =
    rawPalaces.find((palace) => nominalAge >= palace.startAge && nominalAge <= palace.endAge) ??
    rawPalaces[horoscope.decadal.index];
  const ziweiSourcePalace = astrolabe.palaces.find((palace) =>
    palace.majorStars.some((star) => star.name === "紫微")
  );
  const ziweiPalace = ziweiSourcePalace ? natalLookup.get(ziweiSourcePalace.name) : undefined;
  const observedNatalStars = collectUniqueStarNames(
    rawPalaces.map((palace) => [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars])
  );
  const observedDynamicStars = collectDynamicStarNames(horoscope);
  const starCatalog = buildStarCatalog(rawPalaces, astrolabe.palaces, horoscope);
  const trineHighlights = [mingPalace, spousePalace, wealthPalace, careerPalace]
    .filter(Boolean)
    .map((palace) => buildTrineHighlight(`三方四正 ${(palace as ZiWeiPalace).name}`, palace as ZiWeiPalace, natalLookup));
  const relationFocusPalaces = [
    mingPalace,
    bodyPalace,
    spousePalace,
    wealthPalace,
    careerPalace,
    healthPalace,
  ]
    .filter((palace): palace is (typeof rawPalaces)[number] => Boolean(palace))
    .filter(
      (palace, index, values) =>
        values.findIndex((candidate) => candidate.chineseName === palace.chineseName) === index
    );
  const relationHighlights = relationFocusPalaces
    .map((palace) => {
      const sourcePalace = sourceLookup.get(palace.chineseName);

      if (!sourcePalace) {
        return null;
      }

      return buildRelationHighlight(
        `Relacao estrutural ${palace.name}`,
        palace,
        sourcePalace,
        astrolabe.surroundedPalaces(sourcePalace.index)
      );
    })
    .filter((entry): entry is ZiWeiRelationHighlight => Boolean(entry));
  const temporalRelationLayers = [
    { scope: "decadal" as const, item: horoscope.decadal },
    { scope: "age" as const, item: horoscope.age },
    { scope: "yearly" as const, item: horoscope.yearly },
    { scope: "monthly" as const, item: horoscope.monthly },
    { scope: "daily" as const, item: horoscope.daily },
    { scope: "hourly" as const, item: horoscope.hourly },
  ];
  const temporalRelationHighlights = temporalRelationLayers.flatMap(({ scope, item }) =>
    relationFocusPalaces.flatMap((palace) => {
      const sourcePalace = sourceLookup.get(palace.chineseName);

      if (!sourcePalace) {
        return [];
      }

      return [
        buildTemporalRelationHighlight(
          scope,
          sourcePalace,
          palace,
          item,
          astrolabe.surroundedPalaces(sourcePalace.index)
        ),
      ];
    })
  );
  const borrowedStarProfiles = rawPalaces
    .filter((palace) => palace.isEmpty || palace.borrowedMajorStars.length)
    .map((palace) => ({
      palace: `${palace.name} (${palace.chineseName}) ${palace.ganZhi}`,
      isEmpty: palace.isEmpty,
      borrowedFrom: palace.oppositePalace,
      borrowedMajorStars: palace.borrowedMajorStars,
      rule: palace.emptyRule,
    }));
  const temporalMatrix = temporalRelationLayers.flatMap(({ scope, item }) =>
    rawPalaces.flatMap((palace) => {
      const sourcePalace = sourceLookup.get(palace.chineseName);

      if (!sourcePalace) {
        return [];
      }

      return [
        buildTemporalMatrixEntry(
          scope,
          sourcePalace,
          palace,
          item,
          astrolabe.surroundedPalaces(sourcePalace.index)
        ),
      ];
    })
  );
  const currentHoroscope = horoscopeLayers.map((layer) => ({
    palace: `${layer.activePalace} => ${layer.rolePalace}`,
    age: nominalAge,
    year: Number(referenceMoment.date.slice(0, 4)),
    label: `${layer.label} ${layer.ganZhi} | ${layer.activePalace} => ${layer.rolePalace} | 四化 ${
      joinOrFallback(layer.mutagen, "--")
    }`,
  }));

  return {
    mingGong: formatBranchLabel(mingBranch || astrolabe.earthlyBranchOfSoulPalace),
    shenGong: formatBranchLabel(shenBranch || astrolabe.earthlyBranchOfBodyPalace),
    mingGongNaYin: eightChar.getMingGongNaYin(),
    shenGongNaYin: eightChar.getShenGongNaYin(),
    mingPalaceName: mingPalace?.name ?? "Destino",
    shenPalaceName: bodyPalace?.name ?? "--",
    lunarMonth: Math.abs(Number(lunar.getMonth?.() ?? month)),
    lunarDay: Math.abs(Number(lunar.getDay?.() ?? day)),
    lunarDateLabel: astrolabe.lunarDate,
    solarDate: toDisplayDate(birthMoment.rawDate, birthMoment.rawTime),
    trueSolarDate:
      birthMoment.rawDate !== birthMoment.date || birthMoment.rawTime !== birthMoment.time
        ? toDisplayDate(birthMoment.date, birthMoment.time)
        : undefined,
    sexagenaryDate: astrolabe.chineseDate,
    zodiac: astrolabe.zodiac,
    genderLabel: input.gender === "male" ? "Masculino" : "Feminino",
    fiveElementBureau: astrolabe.fiveElementsClass,
    horoscopeDirection: inferHoroscopeDirection(astrolabe.palaces, mingIndex),
    ziweiStarBranch: ziweiPalace
      ? `${ziweiPalace.name} (${ziweiPalace.chineseName}) ${ziweiPalace.ganZhi}`
      : astrolabe.soul,
    mainPalaceBranch: formatBranchLabel(astrolabe.earthlyBranchOfSoulPalace),
    currentDecadePalace: currentDecadePalace
      ? `${currentDecadePalace.name} (${currentDecadePalace.chineseName}) ${currentDecadePalace.ganZhi}`
      : "--",
    currentDecadeRange: currentDecadePalace?.ageRange ?? "--",
    enginePreset: {
      ...preset,
      dayDivide: input.dayStartsAt23 ? "forward" : preset.dayDivide,
      description: `${preset.description} Day divide efetivo: ${
        input.dayStartsAt23 ? "forward" : preset.dayDivide
      }.`,
    },
    palaceHighlights,
    borrowedStarProfiles,
    fourTransformations: uniqueStrings(
      rawPalaces.flatMap((palace) => palace.yearTransformations)
    ).sort((left, right) => {
      const order: Record<string, number> = { 禄: 0, 权: 1, 科: 2, 忌: 3 };
      return (order[left.slice(-1)] ?? 99) - (order[right.slice(-1)] ?? 99);
    }),
    currentHoroscope,
    horoscopeLayers,
    temporalMatrix,
    keyAxes: [
      `Ming Gong ${mingPalace?.name ?? "--"} (${mingPalace?.chineseName ?? "--"}) em ${
        mingPalace?.ganZhi ?? "--"
      }; oposto ${mingPalace?.surroundedPalaces[1] ?? "--"}.`,
      `三方四正 do Destino: ${mingPalace?.surroundedPalaces.join(" | ") || "--"}.`,
      `Palacio do Casamento: ${spousePalace?.name ?? "--"} ${spousePalace?.ganZhi ?? "--"} | Riqueza: ${
        wealthPalace?.name ?? "--"
      } ${wealthPalace?.ganZhi ?? "--"} | Carreira: ${careerPalace?.name ?? "--"} ${
        careerPalace?.ganZhi ?? "--"
      }.`,
      `Saude: ${healthPalace?.name ?? "--"} ${healthPalace?.ganZhi ?? "--"} | Shen Gong cai em ${
        bodyPalace?.name ?? "--"
      } ${bodyPalace?.ganZhi ?? "--"}.`,
    ],
    trineHighlights,
    relationHighlights,
    temporalRelationHighlights,
    summary: [
      `Motor ${ZIWEI_ENGINE_NAME} com 12 palacios, 运限 dinamicos, brilho, 12 Chang Sheng, 12 Bo Shi e 三方四正 reais.`,
      `Catalogo auditado acima de ${ZIWEI_LIBRARY_EXPECTED_FLOOR} estrelas; biblioteca local estimada em ${ZIWEI_LIBRARY_ESTIMATED_STARS} nomes tecnicos, com ${observedNatalStars.length} estrelas unicas observadas no natal e ${observedDynamicStars.length} no recorte temporal atual.`,
      `Preset tecnico ${preset.label}; algoritmo ${preset.algorithm}; cortes year=${preset.yearDivide}, 运限=${preset.horoscopeDivide}, idade=${preset.ageDivide}, dia=${input.dayStartsAt23 ? "forward" : preset.dayDivide}; catalogo observado com ${starCatalog.length} entradas estrela por estrela.`,
      `Ming Gong em ${formatBranchLabel(astrolabe.earthlyBranchOfSoulPalace)}; Shen Gong em ${formatBranchLabel(
        astrolabe.earthlyBranchOfBodyPalace
      )}; 命主 ${astrolabe.soul}; 身主 ${astrolabe.body}.`,
      `Grande periodo corrente em ${currentDecadePalace?.name ?? "--"} ${currentDecadePalace?.ageRange ?? "--"}; consulta em ${toDisplayDate(
        referenceMoment.date,
        referenceMoment.time
      )}.`,
      `Relacoes expostas: ${relationHighlights.length} palacios-chave com oposicao, eixos riqueza/carreira, 飞化, 自化 e vazio; ${temporalRelationHighlights.length} cruzamentos temporais em 大限/小限/流年/流月/流日/流时.`,
      `空宫/借星: ${borrowedStarProfiles.length} palacios com ficha de vazio ou emprestimo tecnico; matriz temporal com ${temporalMatrix.length} linhas palacio x camada.`,
    ],
    coverage: {
      engine: ZIWEI_ENGINE_NAME,
      libraryEstimatedStarCount: ZIWEI_LIBRARY_ESTIMATED_STARS,
      expectedFloor: ZIWEI_LIBRARY_EXPECTED_FLOOR,
      observedNatalUniqueStars: observedNatalStars.length,
      observedDynamicUniqueStars: observedDynamicStars.length,
      observedCombinedUniqueStars: new Set([
        ...observedNatalStars,
        ...observedDynamicStars,
      ]).size,
      palaceCount: rawPalaces.length,
      layerCount: horoscopeLayers.length,
      supports: [
        "12 palacios",
        "estrelas principais, auxiliares e adjetivas",
        "brilho das estrelas",
        "四化 natais",
        "飞化 / mutaged places",
        "自化 / self-mutagen",
        "三方四正",
        "oposicao e eixos riqueza/carreira",
        "palacio vazio / 空宫",
        "借对宫主星",
        "大限 / 小限 / 流年 / 流月 / 流日 / 流时",
        "12 Chang Sheng",
        "12 Bo Shi",
        "岁前12 e 将前12",
        "matriz temporal de relacoes por camada",
        "preset tecnico do motor",
        "catalogo estrela por estrela",
      ],
    },
    observedNatalStars,
    observedDynamicStars,
    starCatalog,
    soulStar: astrolabe.soul,
    bodyStar: astrolabe.body,
    birthTimeIndex: birthMoment.timeIndex,
    birthTimeRange: birthMoment.timeRange,
    consultationMoment: toDisplayDate(referenceMoment.date, referenceMoment.time),
  };
}
