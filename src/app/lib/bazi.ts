import { Solar } from "lunar-typescript";

export type Gender = "male" | "female";
export type BaziSchoolMode =
  | "ziping-conservative"
  | "balance-strong-weak"
  | "geju-structure"
  | "expanded-symbolic";
export type ElementName = "Madeira" | "Fogo" | "Terra" | "Metal" | "Agua";
export type Polarity = "Yang" | "Yin";
export type PillarKey = "hour" | "day" | "month" | "year";

export interface BaziInput {
  name: string;
  date: string;
  time: string;
  gender: Gender;
  location: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  unknownTime: boolean;
  solarTime: boolean;
  dayStartsAt23: boolean;
  splitLuck: boolean;
  schoolMode: BaziSchoolMode;
}

export interface Pillar {
  key: PillarKey;
  label: string;
  ganZhi: string;
  stem: string;
  branch: string;
  stemElement: ElementName;
  branchElement: ElementName;
  polarity: Polarity;
  animal: string;
  tenGod: string;
  hiddenStems: string[];
  hiddenGods: string[];
  naYin: string;
  naYinElement: ElementName;
  qiPhase: string;
  xunKong: string;
}

export interface ElementScore {
  element: ElementName;
  score: number;
  percent: number;
  role: string;
}

export interface LuckCycle {
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  stem: string;
  branch: string;
  role: string;
  active: boolean;
}

export type SeasonName = "Primavera" | "Verao" | "Outono" | "Inverno";
export type ElementState = "旺" | "相" | "休" | "囚" | "死";

export interface ElementDiagnostic {
  element: ElementName;
  total: number;
  percent: number;
  role: string;
  visibleStem: number;
  branchBody: number;
  hiddenStem: number;
  rootCount: number;
  state: ElementState;
  stateLabel: string;
}

export interface StrengthDiagnostic {
  score: number;
  tone: string;
  state: ElementState;
  stateLabel: string;
  deLing: boolean;
  deDi: boolean;
  deShi: boolean;
  supportiveScore: number;
  hostileScore: number;
  supportiveShare: number;
  hostileShare: number;
  visibleSupportScore: number;
  visibleHostileScore: number;
  rootScore: number;
  seasonalScore: number;
  phaseScore: number;
  directRoots: string[];
  supportRoots: string[];
  strongPhases: string[];
}

export interface BaziAnalysis {
  season: SeasonName;
  monthCommand: {
    branch: string;
    element: ElementName;
    state: ElementState;
    stateLabel: string;
  };
  climate: {
    dominant: string;
    advice: string;
  };
  polarityBalance: {
    visibleYang: number;
    visibleYin: number;
    hiddenYang: number;
    hiddenYin: number;
  };
  elementDiagnostics: Record<ElementName, ElementDiagnostic>;
  strength: StrengthDiagnostic;
  favorableElements: ElementName[];
  unfavorableElements: ElementName[];
  dominantElement: ElementName;
  weakestElement: ElementName;
}

export interface BaziChart {
  input: BaziInput;
  adjusted: {
    date: string;
    time: string;
    solarMinutes: number;
    longitudeMinutes: number;
    equationOfTimeMinutes: number;
  };
  lunarText: string;
  yearAnimal: string;
  dayMaster: {
    stem: string;
    element: ElementName;
    polarity: Polarity;
    label: string;
    strength: number;
    tone: string;
  };
  pillars: Pillar[];
  elementScores: ElementScore[];
  luckCycles: LuckCycle[];
  currentLuck?: LuckCycle;
  analysis: BaziAnalysis;
  summary: string[];
}

const _STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const _BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

const ELEMENTS: ElementName[] = ["Madeira", "Fogo", "Terra", "Metal", "Agua"];

const SEASON_BY_BRANCH: Record<string, SeasonName> = {
  寅: "Primavera",
  卯: "Primavera",
  辰: "Primavera",
  巳: "Verao",
  午: "Verao",
  未: "Verao",
  申: "Outono",
  酉: "Outono",
  戌: "Outono",
  亥: "Inverno",
  子: "Inverno",
  丑: "Inverno",
};

const STATE_BY_SEASON: Record<SeasonName, Record<ElementName, ElementState>> = {
  Primavera: {
    Madeira: "旺",
    Fogo: "相",
    Agua: "休",
    Metal: "囚",
    Terra: "死",
  },
  Verao: {
    Fogo: "旺",
    Terra: "相",
    Madeira: "休",
    Agua: "囚",
    Metal: "死",
  },
  Outono: {
    Metal: "旺",
    Agua: "相",
    Terra: "休",
    Fogo: "囚",
    Madeira: "死",
  },
  Inverno: {
    Agua: "旺",
    Madeira: "相",
    Metal: "休",
    Terra: "囚",
    Fogo: "死",
  },
};

const STATE_LABEL: Record<ElementState, string> = {
  旺: "prosperidade",
  相: "assistencia",
  休: "repouso",
  囚: "prisao",
  死: "morte",
};

const STEM_META: Record<string, { element: ElementName; polarity: Polarity; label: string }> = {
  "甲": { element: "Madeira", polarity: "Yang", label: "Madeira Yang" },
  "乙": { element: "Madeira", polarity: "Yin", label: "Madeira Yin" },
  "丙": { element: "Fogo", polarity: "Yang", label: "Fogo Yang" },
  "丁": { element: "Fogo", polarity: "Yin", label: "Fogo Yin" },
  "戊": { element: "Terra", polarity: "Yang", label: "Terra Yang" },
  "己": { element: "Terra", polarity: "Yin", label: "Terra Yin" },
  "庚": { element: "Metal", polarity: "Yang", label: "Metal Yang" },
  "辛": { element: "Metal", polarity: "Yin", label: "Metal Yin" },
  "壬": { element: "Agua", polarity: "Yang", label: "Agua Yang" },
  "癸": { element: "Agua", polarity: "Yin", label: "Agua Yin" },
};

const BRANCH_ELEMENT: Record<string, ElementName> = {
  "子": "Agua",
  "丑": "Terra",
  "寅": "Madeira",
  "卯": "Madeira",
  "辰": "Terra",
  "巳": "Fogo",
  "午": "Fogo",
  "未": "Terra",
  "申": "Metal",
  "酉": "Metal",
  "戌": "Terra",
  "亥": "Agua",
};

const BRANCH_ANIMAL: Record<string, string> = {
  "子": "Rato",
  "丑": "Boi",
  "寅": "Tigre",
  "卯": "Coelho",
  "辰": "Dragao",
  "巳": "Serpente",
  "午": "Cavalo",
  "未": "Cabra",
  "申": "Macaco",
  "酉": "Galo",
  "戌": "Cao",
  "亥": "Porco",
};

const _HIDDEN_STEMS: Record<string, string[]> = {
  "子": ["癸"],
  "丑": ["己", "癸", "辛"],
  "寅": ["甲", "丙", "戊"],
  "卯": ["乙"],
  "辰": ["戊", "乙", "癸"],
  "巳": ["丙", "庚", "戊"],
  "午": ["丁", "己"],
  "未": ["己", "丁", "乙"],
  "申": ["庚", "壬", "戊"],
  "酉": ["辛"],
  "戌": ["戊", "辛", "丁"],
  "亥": ["壬", "甲"],
};

const TEN_GOD_PT: Record<string, string> = {
  "比肩": "Paralelo Justo",
  "劫财": "Paralelo Injusto",
  "食神": "Producao Justa",
  "伤官": "Producao Injusta",
  "偏财": "Riqueza Abrupta",
  "正财": "Riqueza Justa",
  "七杀": "Poder Injusto",
  "正官": "Poder Justo",
  "偏印": "Sustentacao Injusta",
  "正印": "Sustentacao Justa",
  "日主": "Mestre do Dia",
};

const QI_PHASE_PT: Record<string, string> = {
  "长生": "Nascimento",
  "沐浴": "Banho",
  "冠带": "Graduacao",
  "临官": "Prosperidade",
  "帝旺": "Apogeu",
  "衰": "Declinio",
  "病": "Doenca",
  "死": "Morte",
  "墓": "Armazem",
  "绝": "Extincao",
  "胎": "Gestacao",
  "养": "Nutricao",
};

const GENERATES: Record<ElementName, ElementName> = {
  Madeira: "Fogo",
  Fogo: "Terra",
  Terra: "Metal",
  Metal: "Agua",
  Agua: "Madeira",
};

const CONTROLS: Record<ElementName, ElementName> = {
  Madeira: "Terra",
  Fogo: "Metal",
  Terra: "Agua",
  Metal: "Madeira",
  Agua: "Fogo",
};

const ELEMENT_ROLE: Record<ElementName, Record<ElementName, string>> = {
  Madeira: {
    Madeira: "Paralelos",
    Fogo: "Producao",
    Terra: "Riqueza",
    Metal: "Poder",
    Agua: "Sustentacao",
  },
  Fogo: {
    Fogo: "Paralelos",
    Terra: "Producao",
    Metal: "Riqueza",
    Agua: "Poder",
    Madeira: "Sustentacao",
  },
  Terra: {
    Terra: "Paralelos",
    Metal: "Producao",
    Agua: "Riqueza",
    Madeira: "Poder",
    Fogo: "Sustentacao",
  },
  Metal: {
    Metal: "Paralelos",
    Agua: "Producao",
    Madeira: "Riqueza",
    Fogo: "Poder",
    Terra: "Sustentacao",
  },
  Agua: {
    Agua: "Paralelos",
    Madeira: "Producao",
    Fogo: "Riqueza",
    Terra: "Poder",
    Metal: "Sustentacao",
  },
};

const NA_YIN_ELEMENT_BY_CHAR: Record<string, ElementName> = {
  "木": "Madeira",
  "火": "Fogo",
  "土": "Terra",
  "金": "Metal",
  "水": "Agua",
};

const _NA_YIN_BY_GANZHI: Record<string, string> = {
  "甲子": "海中金",
  "乙丑": "海中金",
  "丙寅": "炉中火",
  "丁卯": "炉中火",
  "戊辰": "大林木",
  "己巳": "大林木",
  "庚午": "路旁土",
  "辛未": "路旁土",
  "壬申": "剑锋金",
  "癸酉": "剑锋金",
  "甲戌": "山头火",
  "乙亥": "山头火",
  "丙子": "涧下水",
  "丁丑": "涧下水",
  "戊寅": "城头土",
  "己卯": "城头土",
  "庚辰": "白蜡金",
  "辛巳": "白蜡金",
  "壬午": "杨柳木",
  "癸未": "杨柳木",
  "甲申": "泉中水",
  "乙酉": "泉中水",
  "丙戌": "屋上土",
  "丁亥": "屋上土",
  "戊子": "霹雳火",
  "己丑": "霹雳火",
  "庚寅": "松柏木",
  "辛卯": "松柏木",
  "壬辰": "长流水",
  "癸巳": "长流水",
  "甲午": "沙中金",
  "乙未": "沙中金",
  "丙申": "山下火",
  "丁酉": "山下火",
  "戊戌": "平地木",
  "己亥": "平地木",
  "庚子": "壁上土",
  "辛丑": "壁上土",
  "壬寅": "金箔金",
  "癸卯": "金箔金",
  "甲辰": "覆灯火",
  "乙巳": "覆灯火",
  "丙午": "天河水",
  "丁未": "天河水",
  "戊申": "大驿土",
  "己酉": "大驿土",
  "庚戌": "钗钏金",
  "辛亥": "钗钏金",
  "壬子": "桑柘木",
  "癸丑": "桑柘木",
  "甲寅": "大溪水",
  "乙卯": "大溪水",
  "丙辰": "沙中土",
  "丁巳": "沙中土",
  "戊午": "天上火",
  "己未": "天上火",
  "庚申": "石榴木",
  "辛酉": "石榴木",
  "壬戌": "大海水",
  "癸亥": "大海水",
};

function translateTenGod(value: string): string {
  return TEN_GOD_PT[value] ?? value;
}

function translateQiPhase(value: string): string {
  return QI_PHASE_PT[value] ?? value;
}

function getNaYinElement(naYin: string): ElementName {
  const marker = Object.keys(NA_YIN_ELEMENT_BY_CHAR).find((char) => naYin.includes(char));
  return marker ? NA_YIN_ELEMENT_BY_CHAR[marker] : "Terra";
}

function parseDate(date: string): { year: number; month: number; day: number } {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(":").map(Number);
  return { hour: hour || 0, minute: minute || 0 };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function shiftDateTime(
  date: string,
  time: string,
  minutes: number,
): { date: string; time: string; year: number; month: number; day: number; hour: number; minute: number } {
  const { year, month, day } = parseDate(date);
  const { hour, minute } = parseTime(time);
  const value = new Date(year, month - 1, day, hour, minute + minutes, 0, 0);

  return {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
    hour: value.getHours(),
    minute: value.getMinutes(),
    date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
    time: `${pad(value.getHours())}:${pad(value.getMinutes())}`,
  };
}

function solarCorrectionMinutes(input: BaziInput): number {
  if (!input.solarTime) {
    return 0;
  }

  const standardLongitude = input.utcOffset * 15;
  return Math.round((input.longitude - standardLongitude) * 4);
}

function dayOfYear(year: number, month: number, day: number) {
  const utc = Date.UTC(year, month - 1, day);
  const yearStart = Date.UTC(year, 0, 0);
  return Math.floor((utc - yearStart) / 86400000);
}

function equationOfTimeMinutes(date: string, time: string) {
  const { year, month, day } = parseDate(date);
  const { hour, minute } = parseTime(time);
  const n = dayOfYear(year, month, day);
  const fractionalHour = hour + minute / 60;
  const gamma = (2 * Math.PI / 365) * (n - 1 + (fractionalHour - 12) / 24);
  const eot =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  return Math.round(eot);
}

function getSolarCorrection(input: BaziInput) {
  if (!input.solarTime) {
    return {
      longitudeMinutes: 0,
      equationOfTimeMinutes: 0,
      totalMinutes: 0,
    };
  }

  const longitudeMinutes = solarCorrectionMinutes(input);
  const equationMinutes = equationOfTimeMinutes(input.date, input.time);

  return {
    longitudeMinutes,
    equationOfTimeMinutes: equationMinutes,
    totalMinutes: longitudeMinutes + equationMinutes,
  };
}

export function getSupportElement(element: ElementName): ElementName {
  return ELEMENTS.find((candidate) => GENERATES[candidate] === element) ?? "Agua";
}

function _elementBefore(element: ElementName): ElementName {
  return getSupportElement(element);
}

export function getControlledBy(element: ElementName): ElementName {
  return (Object.entries(CONTROLS).find(([, controlled]) => controlled === element)?.[0] ??
    "Metal") as ElementName;
}

export function getSeasonByBranch(branch: string): SeasonName {
  return SEASON_BY_BRANCH[branch] ?? "Primavera";
}

export function getElementState(element: ElementName, season: SeasonName): ElementState {
  return STATE_BY_SEASON[season]?.[element] ?? "休";
}

export function getElementStateLabel(state: ElementState) {
  return STATE_LABEL[state] ?? "repouso";
}

function tenGodForStem(dayStem: string, targetStem: string): string {
  if (dayStem === targetStem) {
    return "Mestre do Dia";
  }

  const day = STEM_META[dayStem];
  const target = STEM_META[targetStem];
  const samePolarity = day.polarity === target.polarity;

  if (day.element === target.element) {
    return samePolarity ? "Paralelo Justo" : "Paralelo Injusto";
  }

  if (GENERATES[day.element] === target.element) {
    return samePolarity ? "Producao Justa" : "Producao Injusta";
  }

  if (GENERATES[target.element] === day.element) {
    return samePolarity ? "Sustentacao Injusta" : "Sustentacao Justa";
  }

  if (CONTROLS[day.element] === target.element) {
    return samePolarity ? "Riqueza Abrupta" : "Riqueza Justa";
  }

  return samePolarity ? "Poder Injusto" : "Poder Justo";
}

function buildPillar(
  key: PillarKey,
  label: string,
  dayStem: string,
  ganZhi: string,
  stem: string,
  branch: string,
  hiddenStems: string[],
  hiddenGods: string[],
  naYin: string,
  tenGod: string,
  qiPhase: string,
  xunKong: string,
): Pillar {
  return {
    key,
    label,
    ganZhi,
    stem,
    branch,
    stemElement: STEM_META[stem].element,
    branchElement: BRANCH_ELEMENT[branch],
    polarity: STEM_META[stem].polarity,
    animal: BRANCH_ANIMAL[branch],
    tenGod: key === "day" ? "Mestre do Dia" : translateTenGod(tenGod) || tenGodForStem(dayStem, stem),
    hiddenStems,
    hiddenGods: hiddenGods.map(translateTenGod),
    naYin,
    naYinElement: getNaYinElement(naYin),
    qiPhase: translateQiPhase(qiPhase),
    xunKong,
  };
}

function strengthTone(strength: number): string {
  if (strength < 38) {
    return "Fraco";
  }

  if (strength > 62) {
    return "Forte";
  }

  return "Neutro";
}

const STRONG_QI_PHASES = new Set(["Nascimento", "Graduacao", "Prosperidade", "Apogeu"]);
export const STEM_SCORE_BY_PILLAR: Record<PillarKey, number> = {
  year: 12,
  month: 14,
  day: 16,
  hour: 12,
};
export const BRANCH_SCORE_BY_PILLAR: Record<PillarKey, number> = {
  year: 8,
  month: 18,
  day: 8,
  hour: 8,
};
export const HIDDEN_STEM_WEIGHTS = [8, 4, 2];
export const STATE_STRENGTH_WEIGHT: Record<ElementState, number> = {
  旺: 10,
  相: 6,
  休: 0,
  囚: -5,
  死: -8,
};
const CLIMATE_PROFILE_BY_SEASON: Record<
  SeasonName,
  { dominant: string; adjustment: ElementName; advice: string }
> = {
  Primavera: {
    dominant: "vento e umidade de arranque",
    adjustment: "Fogo",
    advice: "O mapa rende mais quando ganha direcao, calor e foco antes de dispersar.",
  },
  Verao: {
    dominant: "calor e secura predominantes",
    adjustment: "Agua",
    advice: "Resfriamento, liquidez e pausa ajudam a lapidar excessos sem apagar o brilho.",
  },
  Outono: {
    dominant: "secura e consolidacao predominantes",
    adjustment: "Fogo",
    advice: "Calor moderado e movimento refinam o mapa e evitam rigidez excessiva.",
  },
  Inverno: {
    dominant: "frio e umidade predominantes",
    adjustment: "Fogo",
    advice: "Aquecimento e circulacao impedem estagnacao e devolvem vida ao sistema.",
  },
};

function uniqueElements(elements: ElementName[]) {
  return [...new Set(elements)];
}

function sortElementsByNeed(
  elements: ElementName[],
  diagnostics: Record<ElementName, ElementDiagnostic>,
  direction: "asc" | "desc"
) {
  const factor = direction === "asc" ? 1 : -1;
  return uniqueElements(elements).sort(
    (left, right) => (diagnostics[left]?.total - diagnostics[right]?.total) * factor
  );
}

function buildPolarityBalance(pillars: Pillar[]) {
  return pillars.reduce(
    (acc, pillar) => {
      acc[`visible${pillar.polarity}`] += 1;
      pillar.hiddenStems.forEach((stem) => {
        const meta = STEM_META[stem];
        if (meta) {
          acc[`hidden${meta.polarity}`] += 1;
        }
      });
      return acc;
    },
    {
      visibleYang: 0,
      visibleYin: 0,
      hiddenYang: 0,
      hiddenYin: 0,
    } as BaziAnalysis["polarityBalance"]
  );
}

function buildElementDiagnostics(
  pillars: Pillar[],
  dayElement: ElementName,
  season: SeasonName
): Record<ElementName, ElementDiagnostic> {
  const diagnostics = Object.fromEntries(
    ELEMENTS.map((element) => [
      element,
      {
        element,
        total: 0,
        percent: 0,
        role: ELEMENT_ROLE[dayElement][element],
        visibleStem: 0,
        branchBody: 0,
        hiddenStem: 0,
        rootCount: 0,
        state: getElementState(element, season),
        stateLabel: getElementStateLabel(getElementState(element, season)),
      },
    ])
  ) as Record<ElementName, ElementDiagnostic>;

  pillars.forEach((pillar) => {
    diagnostics[pillar.stemElement].visibleStem += STEM_SCORE_BY_PILLAR[pillar.key];
    diagnostics[pillar.branchElement].branchBody += BRANCH_SCORE_BY_PILLAR[pillar.key];

    pillar.hiddenStems.forEach((stem, index) => {
      diagnostics[STEM_META[stem].element].hiddenStem += HIDDEN_STEM_WEIGHTS[index] ?? 1;
    });
  });

  ELEMENTS.forEach((element) => {
    const row = diagnostics[element];
    row.rootCount = pillars.filter((pillar) =>
      pillar.hiddenStems.some((stem) => STEM_META[stem].element === element)
    ).length;
    row.total = row.visibleStem + row.branchBody + row.hiddenStem;
  });

  const total = ELEMENTS.reduce((sum, element) => sum + diagnostics[element].total, 0) || 1;

  ELEMENTS.forEach((element) => {
    diagnostics[element].percent = Math.round((diagnostics[element].total / total) * 100);
  });

  return diagnostics;
}

function toElementScores(
  diagnostics: Record<ElementName, ElementDiagnostic>
): ElementScore[] {
  return ELEMENTS.map((element) => ({
    element,
    score: diagnostics[element].total,
    percent: diagnostics[element].percent,
    role: diagnostics[element].role,
  })).sort((left, right) => right.score - left.score);
}

function calculateDayMasterStrength(
  pillars: Pillar[],
  diagnostics: Record<ElementName, ElementDiagnostic>,
  dayElement: ElementName,
  monthBranch: string
): StrengthDiagnostic {
  const supportElement = getSupportElement(dayElement);
  const outputElement = GENERATES[dayElement];
  const wealthElement = CONTROLS[dayElement];
  const authorityElement = getControlledBy(dayElement);
  const total =
    ELEMENTS.reduce((sum, element) => sum + diagnostics[element].total, 0) || 1;
  const supportiveScore =
    diagnostics[dayElement].total + diagnostics[supportElement].total;
  const hostileScore =
    diagnostics[outputElement].total +
    diagnostics[wealthElement].total +
    diagnostics[authorityElement].total;
  const directRoots = pillars
    .filter((pillar) =>
      pillar.hiddenStems.some((stem) => STEM_META[stem].element === dayElement)
    )
    .map((pillar) => pillar.label);
  const supportRoots = pillars
    .filter(
      (pillar) =>
        pillar.hiddenStems.some((stem) => STEM_META[stem].element === supportElement) &&
        !directRoots.includes(pillar.label)
    )
    .map((pillar) => pillar.label);
  const strongPhases = pillars
    .filter((pillar) => STRONG_QI_PHASES.has(pillar.qiPhase))
    .map((pillar) => `${pillar.label} ${pillar.qiPhase}`);
  const visibleSupportScore = pillars.reduce((sum, pillar) => {
    return [dayElement, supportElement].includes(pillar.stemElement)
      ? sum + Math.round(STEM_SCORE_BY_PILLAR[pillar.key] / 4)
      : sum;
  }, 0);
  const visibleHostileScore = pillars.reduce((sum, pillar) => {
    return [outputElement, wealthElement, authorityElement].includes(pillar.stemElement)
      ? sum + Math.round(STEM_SCORE_BY_PILLAR[pillar.key] / 4)
      : sum;
  }, 0);
  const deLing =
    [dayElement, supportElement].includes(BRANCH_ELEMENT[monthBranch] ?? dayElement) ||
    ["旺", "相"].includes(diagnostics[dayElement].state);
  const deDi = directRoots.length > 0 || supportRoots.length > 0;
  const deShi = strongPhases.length > 0;
  const seasonalScore =
    STATE_STRENGTH_WEIGHT[diagnostics[dayElement].state] +
    Math.round(STATE_STRENGTH_WEIGHT[diagnostics[supportElement].state] * 0.5);
  const rootScore =
    directRoots.length * 4 +
    supportRoots.length * 2 +
    (deDi ? (directRoots.length ? 2 : 1) : -3);
  const phaseScore =
    strongPhases.length * 2 +
    (STRONG_QI_PHASES.has(
      pillars.find((pillar) => pillar.key === "day")?.qiPhase ?? ""
    )
      ? 2
      : 0) +
    (deShi ? 1 : -2);
  const visibleScore = Math.round((visibleSupportScore - visibleHostileScore) * 0.8);
  const imbalanceScore = Math.round(((supportiveScore - hostileScore) / total) * 34);
  const deLingScore = deLing ? 5 : -4;
  const score = Math.max(
    8,
    Math.min(
      92,
      45 + seasonalScore + rootScore + phaseScore + visibleScore + imbalanceScore + deLingScore
    )
  );

  return {
    score,
    tone: strengthTone(score),
    state: diagnostics[dayElement].state,
    stateLabel: diagnostics[dayElement].stateLabel,
    deLing,
    deDi,
    deShi,
    supportiveScore,
    hostileScore,
    supportiveShare: Math.round((supportiveScore / total) * 100),
    hostileShare: Math.round((hostileScore / total) * 100),
    visibleSupportScore,
    visibleHostileScore,
    rootScore,
    seasonalScore,
    phaseScore,
    directRoots,
    supportRoots,
    strongPhases,
  };
}

function buildAnalysis(
  pillars: Pillar[],
  dayElement: ElementName
): { analysis: BaziAnalysis; elementScores: ElementScore[] } {
  const monthBranch = pillars.find((pillar) => pillar.key === "month")?.branch ?? "辰";
  const season = getSeasonByBranch(monthBranch);
  const diagnostics = buildElementDiagnostics(pillars, dayElement, season);
  const elementScores = toElementScores(diagnostics);
  const strength = calculateDayMasterStrength(pillars, diagnostics, dayElement, monthBranch);
  const climate = CLIMATE_PROFILE_BY_SEASON[season];
  const supportElement = getSupportElement(dayElement);
  const authorityElement = getControlledBy(dayElement);
  const outputElement = GENERATES[dayElement];
  const wealthElement = CONTROLS[dayElement];
  const sameElement = dayElement;
  const favorableElements =
    strength.tone === "Forte"
      ? sortElementsByNeed(
          [wealthElement, authorityElement, outputElement, climate.adjustment],
          diagnostics,
          "asc"
        )
      : strength.tone === "Fraco"
        ? sortElementsByNeed(
            [supportElement, sameElement, climate.adjustment],
            diagnostics,
            "asc"
          )
        : sortElementsByNeed(
            [climate.adjustment, wealthElement, outputElement, authorityElement],
            diagnostics,
            "asc"
          );
  const unfavorableElements =
    strength.tone === "Forte"
      ? sortElementsByNeed([sameElement, supportElement], diagnostics, "desc")
      : strength.tone === "Fraco"
        ? sortElementsByNeed(
            [wealthElement, authorityElement, outputElement],
            diagnostics,
            "desc"
          )
        : sortElementsByNeed([sameElement, supportElement], diagnostics, "desc");

  return {
    analysis: {
      season,
      monthCommand: {
        branch: monthBranch,
        element: BRANCH_ELEMENT[monthBranch] ?? dayElement,
        state: diagnostics[BRANCH_ELEMENT[monthBranch] ?? dayElement].state,
        stateLabel: diagnostics[BRANCH_ELEMENT[monthBranch] ?? dayElement].stateLabel,
      },
      climate: {
        dominant: climate.dominant,
        advice: climate.advice,
      },
      polarityBalance: buildPolarityBalance(pillars),
      elementDiagnostics: diagnostics,
      strength,
      favorableElements,
      unfavorableElements,
      dominantElement: elementScores[0]?.element ?? dayElement,
      weakestElement: [...elementScores].sort((left, right) => left.score - right.score)[0]?.element ?? dayElement,
    },
    elementScores,
  };
}

function buildSummary(chart: {
  dayElement: ElementName;
  analysis: BaziAnalysis;
  scores: ElementScore[];
  currentLuck?: LuckCycle;
}): string[] {
  const leading = chart.scores[0];
  const weakest = [...chart.scores].sort((a, b) => a.score - b.score)[0];
  const notes = [
    `Mestre do Dia em ${chart.dayElement}, leitura ${chart.analysis.strength.tone.toLowerCase()}, sob Yue Ling de ${chart.analysis.monthCommand.element} em ${chart.analysis.season.toLowerCase()}.`,
    `${leading.element} lidera a distribuicao com ${leading.percent}% e atua como ${leading.role.toLowerCase()} neste recorte.`,
    `Base do Mestre: ${chart.analysis.strength.supportiveShare}% de apoio contra ${chart.analysis.strength.hostileShare}% de drenagem/controle, com ${chart.analysis.strength.directRoots.length} raiz(es) diretas.`,
    `${weakest.element} aparece como ponto de baixa presenca e merece cultivo tecnico quando for favoravel ao mapa.`,
  ];

  if (chart.currentLuck) {
    notes.push(`O ciclo atual ${chart.currentLuck.ganZhi} ativa ${chart.currentLuck.role.toLowerCase()} entre ${chart.currentLuck.startYear} e ${chart.currentLuck.endYear}.`);
  } else {
    notes.push(
      `Elementos mais uteis no ajuste atual: ${chart.analysis.favorableElements.join(", ")}. Evite excessos em ${chart.analysis.unfavorableElements.join(", ")}.`
    );
  }

  return notes;
}

export function calculateBazi(input: BaziInput, nowYear = new Date().getFullYear()): BaziChart {
  const baseTime = input.unknownTime ? "12:00" : input.time;
  const solarCorrection = getSolarCorrection({
    ...input,
    time: baseTime,
  });
  let adjusted = shiftDateTime(input.date, baseTime, solarCorrection.totalMinutes);

  if (input.dayStartsAt23 && !input.unknownTime && adjusted.hour >= 23) {
    adjusted = shiftDateTime(adjusted.date, adjusted.time, 60);
  }

  const solar = Solar.fromYmdHms(
    adjusted.year,
    adjusted.month,
    adjusted.day,
    adjusted.hour,
    adjusted.minute,
    0,
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const dayStem = eightChar.getDayGan();

  const pillars: Pillar[] = [
    buildPillar(
      "year",
      "ANO",
      dayStem,
      eightChar.getYear(),
      eightChar.getYearGan(),
      eightChar.getYearZhi(),
      eightChar.getYearHideGan(),
      eightChar.getYearShiShenZhi(),
      eightChar.getYearNaYin(),
      eightChar.getYearShiShenGan(),
      eightChar.getYearDiShi(),
      eightChar.getYearXunKong(),
    ),
    buildPillar(
      "month",
      "MES",
      dayStem,
      eightChar.getMonth(),
      eightChar.getMonthGan(),
      eightChar.getMonthZhi(),
      eightChar.getMonthHideGan(),
      eightChar.getMonthShiShenZhi(),
      eightChar.getMonthNaYin(),
      eightChar.getMonthShiShenGan(),
      eightChar.getMonthDiShi(),
      eightChar.getMonthXunKong(),
    ),
    buildPillar(
      "day",
      "DIA",
      dayStem,
      eightChar.getDay(),
      eightChar.getDayGan(),
      eightChar.getDayZhi(),
      eightChar.getDayHideGan(),
      eightChar.getDayShiShenZhi(),
      eightChar.getDayNaYin(),
      eightChar.getDayShiShenGan(),
      eightChar.getDayDiShi(),
      eightChar.getDayXunKong(),
    ),
  ];

  if (!input.unknownTime) {
    const hour = buildPillar(
      "hour",
      "HORA",
      dayStem,
      eightChar.getTime(),
      eightChar.getTimeGan(),
      eightChar.getTimeZhi(),
      eightChar.getTimeHideGan(),
      eightChar.getTimeShiShenZhi(),
      eightChar.getTimeNaYin(),
      eightChar.getTimeShiShenGan(),
      eightChar.getTimeDiShi(),
      eightChar.getTimeXunKong(),
    );

    pillars.push(hour);
  }

  const displayPillars = [...pillars].sort((a, b) => {
    const order = ["year", "month", "day", "hour"];
    return order.indexOf(a.key) - order.indexOf(b.key);
  });

  const { analysis, elementScores } = buildAnalysis(displayPillars, STEM_META[dayStem].element);
  const strength = analysis.strength.score;
  const gender = input.gender === "male" ? 1 : 0;
  const yun = eightChar.getYun(gender, input.splitLuck ? 2 : 1);
  const luckCycles = yun
    .getDaYun(9)
    .filter((cycle) => cycle.getGanZhi())
    .map((cycle) => {
      const ganZhi = cycle.getGanZhi();
      const stem = ganZhi[0];
      const branch = ganZhi[1];
      return {
        ganZhi,
        startYear: cycle.getStartYear(),
        endYear: cycle.getEndYear(),
        startAge: cycle.getStartAge(),
        stem,
        branch,
        role: tenGodForStem(dayStem, stem),
        active: nowYear >= cycle.getStartYear() && nowYear <= cycle.getEndYear(),
      };
    });
  const currentLuck = luckCycles.find((cycle) => cycle.active);

  return {
    input,
    adjusted: {
      date: adjusted.date,
      time: input.unknownTime ? "Hora desconhecida" : adjusted.time,
      solarMinutes: solarCorrection.totalMinutes,
      longitudeMinutes: solarCorrection.longitudeMinutes,
      equationOfTimeMinutes: solarCorrection.equationOfTimeMinutes,
    },
    lunarText: lunar.toString(),
    yearAnimal: BRANCH_ANIMAL[eightChar.getYearZhi()],
    dayMaster: {
      stem: dayStem,
      element: STEM_META[dayStem].element,
      polarity: STEM_META[dayStem].polarity,
      label: STEM_META[dayStem].label,
      strength,
      tone: analysis.strength.tone,
    },
    pillars: displayPillars,
    elementScores,
    luckCycles,
    currentLuck,
    analysis,
    summary: buildSummary({
      dayElement: STEM_META[dayStem].element,
      analysis,
      scores: elementScores,
      currentLuck,
    }),
  };
}

export function mergeElementScores(charts: BaziChart[]): ElementScore[] {
  if (charts.length === 0) {
    return [];
  }

  const dayElement = charts[0].dayMaster.element;
  const scores = Object.fromEntries(ELEMENTS.map((element) => [element, 0])) as Record<ElementName, number>;

  for (const chart of charts) {
    for (const score of chart.elementScores) {
      scores[score.element] += score.score;
    }
  }

  const total = Object.values(scores).reduce((sum, value) => sum + value, 0) || 1;
  return ELEMENTS.map((element) => ({
    element,
    score: scores[element],
    percent: Math.round((scores[element] / total) * 100),
    role: ELEMENT_ROLE[dayElement][element],
  })).sort((a, b) => b.score - a.score);
}

export function getStemMeta(stem: string) {
  return STEM_META[stem];
}

export function getAnimal(branch: string): string {
  return BRANCH_ANIMAL[branch] ?? branch;
}
