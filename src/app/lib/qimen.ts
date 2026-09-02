import { Solar } from "lunar-typescript";
import { paipan } from "qimen-mingfa";
import type { PanJuInformation } from "qimen-mingfa/src/feiPan/interfaces";
import { BaziChart, BaziInput } from "@/app/lib/bazi";

type QiMenPalaceKey =
  | "kanGong"
  | "kunGong"
  | "zhenGong"
  | "xunGong"
  | "zhongGong"
  | "qianGong"
  | "duiGong"
  | "genGong"
  | "liGong";

export type QiMenEnginePresetId = "flying-chaibu";

export interface QiMenEnginePreset {
  id: QiMenEnginePresetId;
  label: string;
  description: string;
  paipanMethod: string;
  chaiBu: boolean;
  additionalSettings: {
    traditionalCharacters: boolean;
    singleCharacter: boolean;
  };
  technicalMethodLabel: string;
}

export interface QiMenPalaceProfile {
  key: QiMenPalaceKey;
  label: string;
  shortLabel: string;
  bagua: string;
  direction: string;
  number: number;
  wangShuai: string;
  maXing: boolean;
  gongKong: boolean;
  tianPanYiKong: boolean;
  diPanYiKong: boolean;
  tianPanShen: string;
  diPanShen: string;
  xing: string;
  men: string;
  tianPanGan: string;
  diPanGan: string;
  anGan: string;
  anZhi: string;
  tianPanGanLiuQin: string;
  diPanGanLiuQin: string;
  tianPanGanShiShen: string;
  diPanGanShiShen: string;
  zhengGe: string[];
  zhengGeNames: string[];
  fuGe: {
    ganGong: string;
    menGong: string;
    xingGong: string;
    active: string[];
    activeNames: string[];
  };
  shenSha: string[];
  shenShaNames: string[];
  cangTianPanJia: boolean;
  cangDiPanJia: boolean;
  tianPanGanZhangSheng: string;
  diPanGanZhangSheng: string;
  symbolDigest: {
    xing: string;
    men: string;
    shen: string;
    tianPanGan: string;
    diPanGan: string;
    zhangSheng: string[];
    gong: string;
  };
  summaryLine: string;
}

export interface QiMenCaseMarker {
  label: string;
  rule: string;
  stem: string;
  carriers: string[];
}

export interface QiMenPatternAudit {
  name: string;
  status: "present" | "candidate" | "absent";
  criterion: string;
  palaces: string[];
  details: string[];
}

export interface QiMenDirectionRating {
  palace: string;
  direction: string;
  score: number;
  grade: string;
  reasons: string[];
}

export interface QiMenCaseRelationRow {
  palace: string;
  direction: string;
  score: number;
  grade: string;
  tags: string[];
  notes: string[];
}

export interface QiMenApplicationCue {
  key: string;
  label: string;
  rule: string;
  bestPalaces: string[];
  cautionPalaces: string[];
}

interface QiMenApplicationConfig {
  key: string;
  label: string;
  rule: string;
  preferredDoors: string[];
  preferredDeities: string[];
  positivePatterns: string[];
  cautionDoors: string[];
  boostMaXing: boolean;
}

export interface QiMenProfile {
  engine: string;
  engineVersion: string;
  enginePreset: QiMenEnginePreset;
  consultationMoment: string;
  adjustedMoment: string;
  solarCorrectionLabel: string;
  lunarDateLabel: string;
  allTimeInformation: PanJuInformation["allTimeInformation"];
  sexagenary: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  jieQiWindow: {
    previousJie: string;
    currentJie: string;
    nextJie: string;
    previousQi: string;
    nextQi: string;
  };
  zhiFu: string;
  zhiShi: string;
  xunShou: string;
  dun: string;
  juLabel: string;
  juNumber: string;
  qiJuMethodLabel: string;
  chosenJuShuLabel: string;
  palaces: QiMenPalaceProfile[];
  gridPalaces: QiMenPalaceProfile[];
  zhiFuPalace: string;
  zhiShiPalace: string;
  xunShouCarriers: string[];
  maXingPalaces: string[];
  gongKongPalaces: string[];
  yiKongPalaces: string[];
  tianJiaPalaces: string[];
  diJiaPalaces: string[];
  sanQiOnSky: string[];
  sanQiOnEarth: string[];
  liuYiOnSky: string[];
  liuYiOnEarth: string[];
  canonicalDoorHighlights: {
    open: string[];
    caution: string[];
    neutral: string[];
  };
  canonicalDeityHighlights: {
    supportive: string[];
    caution: string[];
    remaining: string[];
  };
  temporalScopeSupport: {
    yearly: string;
    monthly: string;
    daily: string;
    hourly: string;
  };
  caseMarkers: {
    subject: QiMenCaseMarker;
    object: QiMenCaseMarker;
    yearAnchor: QiMenCaseMarker;
    monthAnchor: QiMenCaseMarker;
    yongShenRule: string;
  };
  patternAudits: QiMenPatternAudit[];
  directionRatings: QiMenDirectionRating[];
  bestDirections: string[];
  cautionDirections: string[];
  caseAxisSummary: string[];
  caseRelationMatrix: QiMenCaseRelationRow[];
  applicationCues: QiMenApplicationCue[];
  structureHighlights: string[];
  structureNames: string[];
  shenShaHighlights: string[];
  shenShaNames: string[];
  huanJuActivePalaces: number;
  summary: string[];
  boardDigest: string[];
}

const QIMEN_ENGINE_NAME = "qimen-mingfa";
const QIMEN_ENGINE_VERSION = "1.0.28";
const SAN_QI = new Set(["乙", "丙", "丁"]);
const LIU_YI = new Set(["戊", "己", "庚", "辛", "壬", "癸"]);
const OPEN_DOORS = new Set(["开门", "生门", "休门"]);
const CAUTION_DOORS = new Set(["死门", "惊门", "伤门", "杜门"]);
const SUPPORTIVE_DEITIES = new Set(["值符", "六合", "太阴", "九地", "九天"]);
const CAUTION_DEITIES = new Set(["白虎", "玄武", "螣蛇"]);

const APPLICATION_CONFIG: QiMenApplicationConfig[] = [
  {
    key: "opening",
    label: "Abertura, lancamento e comercio",
    rule: "Prioriza 开门/生门, deidades de apoio e ausencia de vazio para abertura de fluxo.",
    preferredDoors: ["开门", "生门"],
    preferredDeities: ["值符", "六合", "九天"],
    positivePatterns: ["门交和", "门结义", "倚势格", "乘权格"],
    cautionDoors: ["死门", "伤门"],
    boostMaXing: false,
  },
  {
    key: "negotiation",
    label: "Negociacao, acordo e mediacao",
    rule: "Prioriza 休门/开门, 六合/太阴 e padroes de uniao como 门交和 e 门结义.",
    preferredDoors: ["休门", "开门"],
    preferredDeities: ["六合", "太阴", "值符"],
    positivePatterns: ["门交和", "门结义", "得母格", "获父格"],
    cautionDoors: ["惊门", "伤门"],
    boostMaXing: false,
  },
  {
    key: "movement",
    label: "Deslocamento, visita e acao externa",
    rule: "Prioriza 开门/休门 com 马星 ou 九天 para movimento tecnico e saida de campo.",
    preferredDoors: ["开门", "休门", "生门"],
    preferredDeities: ["九天", "值符", "六合"],
    positivePatterns: ["前间格", "后间格"],
    cautionDoors: ["死门", "杜门"],
    boostMaXing: true,
  },
  {
    key: "documents",
    label: "Documentos, exposicao e comunicacao",
    rule: "Prioriza 景门, 朱雀 e deidades de apoio para visibilidade, papelada e comunicacao.",
    preferredDoors: ["景门", "开门"],
    preferredDeities: ["值符", "太阴", "九天"],
    positivePatterns: ["倚势格", "乘权格"],
    cautionDoors: ["杜门", "死门"],
    boostMaXing: false,
  },
  {
    key: "concealment",
    label: "Sigilo, pesquisa e refugio tecnico",
    rule: "Prioriza 杜门/休门 e camadas de recolhimento para ocultacao, resguardo e trabalho tecnico fechado.",
    preferredDoors: ["杜门", "休门"],
    preferredDeities: ["太阴", "玄武", "九地"],
    positivePatterns: ["后间格", "外乱格"],
    cautionDoors: ["开门", "景门"],
    boostMaXing: false,
  },
  {
    key: "recovery",
    label: "Recuperacao, manutencao e reabastecimento",
    rule: "Prioriza 生门, 九地, 天心/天任 quando presentes, com pouco atrito e pouco vazio.",
    preferredDoors: ["生门", "休门"],
    preferredDeities: ["九地", "太阴", "值符"],
    positivePatterns: ["得母格", "获父格"],
    cautionDoors: ["伤门", "死门"],
    boostMaXing: false,
  },
  {
    key: "containment",
    label: "Contencao, isolamento e fechamento",
    rule: "Prioriza 杜门/死门 como uso tecnico de bloqueio, com nota explicita de cautela estrutural.",
    preferredDoors: ["杜门", "死门"],
    preferredDeities: ["九地", "白虎", "玄武"],
    positivePatterns: ["门受制"],
    cautionDoors: ["开门", "生门"],
    boostMaXing: false,
  },
] as const;

const QIMEN_ENGINE_PRESET_MAP: Record<QiMenEnginePresetId, QiMenEnginePreset> = {
  "flying-chaibu": {
    id: "flying-chaibu",
    label: "Fei Pan · Chai Bu",
    description:
      "Tabuleiro voador do Qi Men Dun Jia com abertura tecnica por 拆补, mantendo o horario corrigido do formulario.",
    paipanMethod: "飞盘",
    chaiBu: true,
    additionalSettings: {
      traditionalCharacters: false,
      singleCharacter: false,
    },
    technicalMethodLabel: "飞盘 + 拆补",
  },
};

export const QIMEN_ENGINE_PRESETS = QIMEN_ENGINE_PRESET_MAP;

const PALACE_META: Record<
  QiMenPalaceKey,
  {
    label: string;
    shortLabel: string;
    direction: string;
    number: number;
  }
> = {
  kanGong: { label: "坎宫", shortLabel: "坎", direction: "Norte", number: 1 },
  kunGong: { label: "坤宫", shortLabel: "坤", direction: "Sudoeste", number: 2 },
  zhenGong: { label: "震宫", shortLabel: "震", direction: "Leste", number: 3 },
  xunGong: { label: "巽宫", shortLabel: "巽", direction: "Sudeste", number: 4 },
  zhongGong: { label: "中宫", shortLabel: "中", direction: "Centro", number: 5 },
  qianGong: { label: "乾宫", shortLabel: "乾", direction: "Noroeste", number: 6 },
  duiGong: { label: "兑宫", shortLabel: "兑", direction: "Oeste", number: 7 },
  genGong: { label: "艮宫", shortLabel: "艮", direction: "Nordeste", number: 8 },
  liGong: { label: "离宫", shortLabel: "离", direction: "Sul", number: 9 },
};

const PALACE_ORDER: QiMenPalaceKey[] = [
  "kanGong",
  "kunGong",
  "zhenGong",
  "xunGong",
  "zhongGong",
  "qianGong",
  "duiGong",
  "genGong",
  "liGong",
];

const PALACE_GRID_ORDER: QiMenPalaceKey[] = [
  "xunGong",
  "liGong",
  "kunGong",
  "zhenGong",
  "zhongGong",
  "duiGong",
  "genGong",
  "kanGong",
  "qianGong",
];

function parseChartMoment(chart: BaziChart) {
  const [year, month, day] = chart.adjusted.date.split("-").map(Number);
  const [hour, minute] = chart.adjusted.time.split(":").map(Number);

  return { year, month, day, hour, minute };
}

function getMomentLunar(chart: BaziChart) {
  const moment = parseChartMoment(chart);
  return Solar.fromYmdHms(
    moment.year,
    moment.month,
    moment.day,
    moment.hour,
    moment.minute,
    0
  ).getLunar();
}

function compactLine(value: string) {
  return value.replace(/\r/g, "").trim();
}

function firstMeaningfulLine(value: string) {
  return (
    compactLine(value)
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "--"
  );
}

function digestLines(value: string, maxLines = 2) {
  const lines = compactLine(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(0, maxLines).join(" | ") || "--";
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function findCarrierPalaces(
  palaces: QiMenPalaceProfile[],
  predicate: (palace: QiMenPalaceProfile) => boolean,
  formatter: (palace: QiMenPalaceProfile) => string
) {
  return palaces.filter(predicate).map(formatter);
}

function normalizePalace(
  key: QiMenPalaceKey,
  raw: PanJuInformation["panJuResult"][QiMenPalaceKey]
): QiMenPalaceProfile {
  const meta = PALACE_META[key];
  const zhengGeNames = raw.zhengGe.map((entry) => firstMeaningfulLine(entry));
  const fuGeActive = [raw.fuGe.ganGong, raw.fuGe.menGong, raw.fuGe.xingGong].filter(Boolean);
  const shenShaNames = raw.shenSha.map((entry) => firstMeaningfulLine(entry).split(/[：:]/)[0].trim());

  return {
    key,
    label: meta.label,
    shortLabel: meta.shortLabel,
    bagua: raw.baGua,
    direction: meta.direction,
    number: meta.number,
    wangShuai: raw.gongWangShuai || "--",
    maXing: raw.maXing,
    gongKong: raw.gongKong,
    tianPanYiKong: raw.tianPanYiKong,
    diPanYiKong: raw.diPanYiKong,
    tianPanShen: raw.tianPanShen || "--",
    diPanShen: raw.diPanShen || "--",
    xing: raw.xing || "--",
    men: raw.men || "--",
    tianPanGan: raw.tianPanGan || "--",
    diPanGan: raw.diPanGan || "--",
    anGan: raw.anGan || "--",
    anZhi: raw.anZhi || "--",
    tianPanGanLiuQin: raw.tianPanGanLiuQin || "--",
    diPanGanLiuQin: raw.diPanGanLiuQin || "--",
    tianPanGanShiShen: raw.tianPanGanShiShen || "--",
    diPanGanShiShen: raw.diPanGanShiShen || "--",
    zhengGe: raw.zhengGe,
    zhengGeNames,
    fuGe: {
      ganGong: raw.fuGe.ganGong || "",
      menGong: raw.fuGe.menGong || "",
      xingGong: raw.fuGe.xingGong || "",
      active: fuGeActive,
      activeNames: fuGeActive.map((entry) => firstMeaningfulLine(entry)),
    },
    shenSha: raw.shenSha,
    shenShaNames,
    cangTianPanJia: raw.cangTianPanJia,
    cangDiPanJia: raw.cangDiPanJia,
    tianPanGanZhangSheng: raw.tianPanGanZhangSheng || "--",
    diPanGanZhangSheng: raw.diPanGanZhangSheng || "--",
    symbolDigest: {
      xing: digestLines(raw.symboleInfo.xing),
      men: digestLines(raw.symboleInfo.men),
      shen: digestLines(raw.symboleInfo.shen),
      tianPanGan: digestLines(raw.symboleInfo.tianPanGan),
      diPanGan: digestLines(raw.symboleInfo.diPanGan),
      zhangSheng: raw.symboleInfo.zhangSheng.map((entry) => digestLines(entry)),
      gong: digestLines(raw.symboleInfo.gong),
    },
    summaryLine: `${meta.shortLabel}宫 ${raw.men || "--"} / ${raw.xing || "--"} / ${
      raw.tianPanShen || "--"
    } | 天盘 ${raw.tianPanGan || "--"} / 地盘 ${raw.diPanGan || "--"} | 旺衰 ${
      raw.gongWangShuai || "--"
    }`,
  };
}

function countActivePalaces(board: PanJuInformation["panJuResult"]) {
  return PALACE_ORDER.reduce((count, key) => {
    const palace = board[key];
    const active = Boolean(
      palace.xing ||
        palace.men ||
        palace.tianPanGan ||
        palace.diPanGan ||
        palace.tianPanShen ||
        palace.diPanShen
    );

    return count + (active ? 1 : 0);
  }, 0);
}

function formatMoment(chart: BaziChart) {
  return `${chart.adjusted.date} ${chart.adjusted.time}`;
}

function formatConsultationMoment(input: BaziInput) {
  return `${input.date} ${input.time}`;
}

function classifyDoor(palace: QiMenPalaceProfile) {
  if (OPEN_DOORS.has(palace.men)) {
    return "open";
  }

  if (CAUTION_DOORS.has(palace.men)) {
    return "caution";
  }

  return "neutral";
}

function classifyDeity(palace: QiMenPalaceProfile) {
  if (SUPPORTIVE_DEITIES.has(palace.tianPanShen)) {
    return "supportive";
  }

  if (CAUTION_DEITIES.has(palace.tianPanShen)) {
    return "caution";
  }

  return "remaining";
}

function extractStem(ganzhi: string) {
  return ganzhi.charAt(0) || "--";
}

function detectStrongPhase(value: string) {
  return value.includes("长生") || value.includes("临官") || value.includes("帝旺");
}

function detectTombPhase(value: string) {
  return value.includes("墓");
}

function palacePatternText(palace: QiMenPalaceProfile) {
  return [
    ...palace.zhengGe,
    palace.fuGe.ganGong,
    palace.fuGe.menGong,
    palace.fuGe.xingGong,
  ]
    .filter(Boolean)
    .join("\n");
}

function palaceHasPatternToken(palace: QiMenPalaceProfile, tokens: string[]) {
  const haystack = palacePatternText(palace);
  return tokens.some((token) => haystack.includes(token));
}

function findStemCarriers(palaces: QiMenPalaceProfile[], stem: string) {
  return palaces
    .filter(
      (palace) =>
        palace.tianPanGan === stem || palace.diPanGan === stem || palace.anGan === stem
    )
    .map((palace) => {
      const carriers = [
        palace.tianPanGan === stem ? `天盘${stem}` : "",
        palace.diPanGan === stem ? `地盘${stem}` : "",
        palace.anGan === stem ? `暗干${stem}` : "",
      ].filter(Boolean);

      return `${palace.label} ${carriers.join(" / ")} | 门 ${palace.men} | 星 ${palace.xing}`;
    });
}

function buildCaseMarker(
  label: string,
  rule: string,
  stem: string,
  palaces: QiMenPalaceProfile[]
): QiMenCaseMarker {
  return {
    label,
    rule,
    stem,
    carriers: stem === "--" ? [] : findStemCarriers(palaces, stem),
  };
}

function palaceCarriesStem(palace: QiMenPalaceProfile, stem: string) {
  return palace.tianPanGan === stem || palace.diPanGan === stem || palace.anGan === stem;
}

function formatPatternPalace(palace: QiMenPalaceProfile) {
  return `${palace.label} ${palace.direction} | 门 ${palace.men} | 星 ${palace.xing} | 神 ${palace.tianPanShen}`;
}

function buildPatternAudit(args: {
  name: string;
  status: "present" | "candidate" | "absent";
  criterion: string;
  palaces: string[];
  details?: string[];
}): QiMenPatternAudit {
  return {
    name: args.name,
    status: args.status,
    criterion: args.criterion,
    palaces: args.palaces,
    details: args.details ?? [],
  };
}

function scoreDirection(palace: QiMenPalaceProfile) {
  let score = 0;
  const reasons: string[] = [];

  if (OPEN_DOORS.has(palace.men)) {
    score += 3;
    reasons.push(`porta aberta ${palace.men}`);
  } else if (CAUTION_DOORS.has(palace.men)) {
    score -= 3;
    reasons.push(`porta de pressao ${palace.men}`);
  }

  if (SUPPORTIVE_DEITIES.has(palace.tianPanShen)) {
    score += 2;
    reasons.push(`deidade de apoio ${palace.tianPanShen}`);
  } else if (CAUTION_DEITIES.has(palace.tianPanShen)) {
    score -= 2;
    reasons.push(`deidade de cautela ${palace.tianPanShen}`);
  }

  if (SAN_QI.has(palace.tianPanGan) || SAN_QI.has(palace.diPanGan)) {
    score += 1;
    reasons.push("San Qi presente");
  }

  if (palace.maXing) {
    score += 1;
    reasons.push("Ma Xing ativa");
  }

  if (palace.gongKong || palace.tianPanYiKong || palace.diPanYiKong) {
    score -= 1;
    reasons.push("vazio no palacio");
  }

  if (palaceHasPatternToken(palace, ["六仪击刑", "门迫宫", "门受制", "反吟"])) {
    score -= 2;
    reasons.push("padrao de pressao");
  }

  if (palaceHasPatternToken(palace, ["门交和", "门结义", "得母格", "获父格", "倚势格", "乘权格"])) {
    score += 1;
    reasons.push("padrao de apoio");
  }

  const grade = score >= 4 ? "favoravel" : score <= -2 ? "cautela" : "misto";

  return {
    palace: palace.label,
    direction: palace.direction,
    score,
    grade,
    reasons,
  };
}

function scoreApplicationPalace(
  palace: QiMenPalaceProfile,
  config: QiMenApplicationConfig
) {
  let score = 0;
  const reasons: string[] = [];

  if (config.preferredDoors.includes(palace.men)) {
    score += 3;
    reasons.push(`porta ${palace.men}`);
  }

  if (config.cautionDoors.includes(palace.men)) {
    score -= 2;
    reasons.push(`porta sensivel ${palace.men}`);
  }

  if (config.preferredDeities.includes(palace.tianPanShen)) {
    score += 2;
    reasons.push(`deidade ${palace.tianPanShen}`);
  }

  if (config.positivePatterns.some((pattern) => palaceHasPatternToken(palace, [pattern]))) {
    score += 1;
    reasons.push("padrao aderente");
  }

  if (config.boostMaXing && palace.maXing) {
    score += 1;
    reasons.push("Ma Xing");
  }

  if (palace.gongKong || palace.tianPanYiKong || palace.diPanYiKong) {
    score -= 1;
    reasons.push("vazio");
  }

  if (palaceHasPatternToken(palace, ["六仪击刑", "门迫宫", "反吟"])) {
    score -= 2;
    reasons.push("pressao estrutural");
  }

  return {
    score,
    reasons,
  };
}

export function calculateQiMenProfile(
  input: BaziInput,
  chart: BaziChart,
  presetId: QiMenEnginePresetId = "flying-chaibu"
): QiMenProfile {
  const preset = QIMEN_ENGINE_PRESET_MAP[presetId];
  const moment = parseChartMoment(chart);
  const lunar = getMomentLunar(chart);
  const board = paipan({
    paipanMethod: preset.paipanMethod,
    time: moment,
    chaiBu: preset.chaiBu,
    additionalSettings: preset.additionalSettings,
  });
  const palaces = PALACE_ORDER.map((key) => normalizePalace(key, board.panJuResult[key]));
  const palaceByKey = new Map(palaces.map((palace) => [palace.key, palace]));
  const gridPalaces = PALACE_GRID_ORDER.map((key) => palaceByKey.get(key)!);
  const zhiFuPalace =
    palaces.find((palace) => palace.xing === board.zhiFu)?.label ??
    palaces.find((palace) => palace.tianPanShen === "值符")?.label ??
    "--";
  const zhiShiPalace =
    palaces.find((palace) => palace.men === board.zhiShi)?.label ?? "--";
  const xunShouCarriers = findCarrierPalaces(
    palaces,
    (palace) => palace.cangTianPanJia || palace.cangDiPanJia,
    (palace) => `${palace.label} ${palace.tianPanGan}/${palace.diPanGan}`
  );
  const maXingPalaces = findCarrierPalaces(
    palaces,
    (palace) => palace.maXing,
    (palace) => `${palace.label} ${palace.men} / ${palace.xing}`
  );
  const gongKongPalaces = findCarrierPalaces(
    palaces,
    (palace) => palace.gongKong,
    (palace) => `${palace.label} ${palace.shortLabel}`
  );
  const yiKongPalaces = findCarrierPalaces(
    palaces,
    (palace) => palace.tianPanYiKong || palace.diPanYiKong,
    (palace) =>
      `${palace.label} céu ${palace.tianPanYiKong ? "sim" : "nao"} / terra ${
        palace.diPanYiKong ? "sim" : "nao"
      }`
  );
  const tianJiaPalaces = findCarrierPalaces(
    palaces,
    (palace) => palace.cangTianPanJia,
    (palace) => `${palace.label} 天甲`
  );
  const diJiaPalaces = findCarrierPalaces(
    palaces,
    (palace) => palace.cangDiPanJia,
    (palace) => `${palace.label} 地甲`
  );
  const sanQiOnSky = findCarrierPalaces(
    palaces,
    (palace) => SAN_QI.has(palace.tianPanGan),
    (palace) => `${palace.label} ${palace.tianPanGan}`
  );
  const sanQiOnEarth = findCarrierPalaces(
    palaces,
    (palace) => SAN_QI.has(palace.diPanGan),
    (palace) => `${palace.label} ${palace.diPanGan}`
  );
  const liuYiOnSky = findCarrierPalaces(
    palaces,
    (palace) => LIU_YI.has(palace.tianPanGan),
    (palace) => `${palace.label} ${palace.tianPanGan}`
  );
  const liuYiOnEarth = findCarrierPalaces(
    palaces,
    (palace) => LIU_YI.has(palace.diPanGan),
    (palace) => `${palace.label} ${palace.diPanGan}`
  );
  const doorHighlights = {
    open: palaces
      .filter((palace) => classifyDoor(palace) === "open")
      .map((palace) => `${palace.label} ${palace.men}`),
    caution: palaces
      .filter((palace) => classifyDoor(palace) === "caution")
      .map((palace) => `${palace.label} ${palace.men}`),
    neutral: palaces
      .filter((palace) => classifyDoor(palace) === "neutral")
      .map((palace) => `${palace.label} ${palace.men}`),
  };
  const deityHighlights = {
    supportive: palaces
      .filter((palace) => classifyDeity(palace) === "supportive")
      .map((palace) => `${palace.label} ${palace.tianPanShen}`),
    caution: palaces
      .filter((palace) => classifyDeity(palace) === "caution")
      .map((palace) => `${palace.label} ${palace.tianPanShen}`),
    remaining: palaces
      .filter((palace) => classifyDeity(palace) === "remaining")
      .map((palace) => `${palace.label} ${palace.tianPanShen}`),
  };
  const structureHighlights = unique(
    palaces.flatMap((palace) => [
      ...palace.zhengGe.map((entry) => `${palace.label}: ${firstMeaningfulLine(entry)}`),
      ...palace.fuGe.active.map((entry) => `${palace.label}: ${firstMeaningfulLine(entry)}`),
    ])
  );
  const structureNames = unique(
    palaces.flatMap((palace) => [...palace.zhengGeNames, ...palace.fuGe.activeNames])
  );
  const shenShaHighlights = unique(
    palaces.flatMap((palace) => palace.shenSha.map((entry) => `${palace.label}: ${firstMeaningfulLine(entry)}`))
  );
  const shenShaNames = unique(palaces.flatMap((palace) => palace.shenShaNames));
  const huanJuActivePalaces = countActivePalaces(board.huanJu);
  const yearStem = extractStem(board.allTimeInformation.nianzhu);
  const monthStem = extractStem(board.allTimeInformation.yuezhu);
  const dayStem = extractStem(board.allTimeInformation.rizhu);
  const hourStem = extractStem(board.allTimeInformation.shizhu);
  const subjectMarker = buildCaseMarker(
    "Sujeito / consulente",
    "Regra padrao do tabuleiro horario: o Ri Gan (日干) ancora o consulente e o polo principal da pergunta.",
    dayStem,
    palaces
  );
  const objectMarker = buildCaseMarker(
    "Objeto / evento",
    "Regra padrao do tabuleiro horario: o Shi Gan (时干) ancora o evento, a acao ou o alvo imediato da consulta.",
    hourStem,
    palaces
  );
  const yearAnchor = buildCaseMarker(
    "Ancora anual",
    "O Gan do ano (年干) fica exposto como ancora sexagenaria para auditoria tecnica do quadro horario.",
    yearStem,
    palaces
  );
  const monthAnchor = buildCaseMarker(
    "Ancora mensal",
    "O Gan do mes (月干) fica exposto como ancora sazonal e administrativa do quadro horario.",
    monthStem,
    palaces
  );
  const fuYinPalaces = palaces.filter((palace) => palaceHasPatternToken(palace, ["伏吟"]));
  const fanYinPalaces = palaces.filter((palace) => palaceHasPatternToken(palace, ["反吟"]));
  const liuYiJiXingPalaces = palaces.filter((palace) =>
    palaceHasPatternToken(palace, ["六仪击刑"])
  );
  const menPoPalaces = palaces.filter((palace) =>
    palaceHasPatternToken(palace, ["门迫宫"])
  );
  const menShouZhiPalaces = palaces.filter((palace) =>
    palaceHasPatternToken(palace, ["门受制"])
  );
  const sanQiDeShiCandidates = palaces.filter((palace) => {
    const hasSanQi =
      SAN_QI.has(palace.tianPanGan) || SAN_QI.has(palace.diPanGan) || SAN_QI.has(palace.anGan);
    const inStrongPhase =
      detectStrongPhase(palace.tianPanGanZhangSheng) ||
      detectStrongPhase(palace.diPanGanZhangSheng);
    const withoutVoid = !(palace.gongKong || palace.tianPanYiKong || palace.diPanYiKong);

    return hasSanQi && inStrongPhase && withoutVoid;
  });
  const sanQiDeShiPresent = sanQiDeShiCandidates.filter(
    (palace) => OPEN_DOORS.has(palace.men) || SUPPORTIVE_DEITIES.has(palace.tianPanShen)
  );
  const sanQiRuMuPalaces = palaces.filter((palace) => {
    const hasSanQi =
      SAN_QI.has(palace.tianPanGan) || SAN_QI.has(palace.diPanGan) || SAN_QI.has(palace.anGan);
    const inTombPhase =
      detectTombPhase(palace.tianPanGanZhangSheng) || detectTombPhase(palace.diPanGanZhangSheng);

    return hasSanQi && inTombPhase;
  });
  const hourStemRuMuPalaces = palaces.filter((palace) => {
    const carriesHourStem =
      palace.tianPanGan === hourStem || palace.diPanGan === hourStem || palace.anGan === hourStem;
    const inTombPhase =
      detectTombPhase(palace.tianPanGanZhangSheng) || detectTombPhase(palace.diPanGanZhangSheng);

    return carriesHourStem && inTombPhase;
  });
  const gengTriggerPalaces = findStemCarriers(palaces, "庚");
  const patternAudits: QiMenPatternAudit[] = [
    buildPatternAudit({
      name: "Fu Yin",
      status: fuYinPalaces.length ? "present" : "absent",
      criterion:
        "Busca explicita por 伏吟 nas linhas de 正格 e 附格 entregues pelo motor do tabuleiro horario.",
      palaces: fuYinPalaces.map((palace) => formatPatternPalace(palace)),
    }),
    buildPatternAudit({
      name: "Fan Yin",
      status: fanYinPalaces.length ? "present" : "absent",
      criterion:
        "Busca explicita por 反吟 nas linhas de 正格 e 附格 entregues pelo motor do tabuleiro horario.",
      palaces: fanYinPalaces.map((palace) => formatPatternPalace(palace)),
    }),
    buildPatternAudit({
      name: "Liu Yi Ji Xing",
      status: liuYiJiXingPalaces.length ? "present" : "absent",
      criterion:
        "Busca explicita por 六仪击刑 no texto tecnico do palacio, sem reinterpretacao externa.",
      palaces: liuYiJiXingPalaces.map((palace) => formatPatternPalace(palace)),
    }),
    buildPatternAudit({
      name: "Men Po",
      status: menPoPalaces.length ? "present" : "absent",
      criterion:
        "Busca explicita por 门迫宫 no texto tecnico do palacio, como gatilho canonico de pressao de porta.",
      palaces: menPoPalaces.map((palace) => formatPatternPalace(palace)),
    }),
    buildPatternAudit({
      name: "Men Shou Zhi",
      status: menShouZhiPalaces.length ? "present" : "absent",
      criterion:
        "Busca explicita por 门受制 no texto tecnico do palacio, mantendo a rotulagem da propria biblioteca.",
      palaces: menShouZhiPalaces.map((palace) => formatPatternPalace(palace)),
    }),
    buildPatternAudit({
      name: "San Qi De Shi",
      status: sanQiDeShiPresent.length
        ? "present"
        : sanQiDeShiCandidates.length
          ? "candidate"
          : "absent",
      criterion:
        "Criterio interno auditavel: 三奇 em ceu/terra/暗干, sem vazio, com 长生/临官/帝旺; status sobe para presente quando a porta ou a deidade tambem apoiam o palacio.",
      palaces: (sanQiDeShiPresent.length ? sanQiDeShiPresent : sanQiDeShiCandidates).map(
        (palace) => formatPatternPalace(palace)
      ),
      details: (sanQiDeShiPresent.length ? sanQiDeShiPresent : sanQiDeShiCandidates).map(
        (palace) =>
          `${palace.label}: 长生 céu ${palace.tianPanGanZhangSheng} | 长生 terra ${palace.diPanGanZhangSheng} | vazio ${
            palace.gongKong || palace.tianPanYiKong || palace.diPanYiKong ? "sim" : "nao"
          }`
      ),
    }),
    buildPatternAudit({
      name: "San Qi Ru Mu",
      status: sanQiRuMuPalaces.length ? "present" : "absent",
      criterion:
        "Criterio interno auditavel: 三奇 em ceu/terra/暗干 coincidindo com fase 墓 em qualquer camada de 长生 do palacio.",
      palaces: sanQiRuMuPalaces.map((palace) => formatPatternPalace(palace)),
      details: sanQiRuMuPalaces.map(
        (palace) =>
          `${palace.label}: 长生 céu ${palace.tianPanGanZhangSheng} | 长生 terra ${palace.diPanGanZhangSheng}`
      ),
    }),
    buildPatternAudit({
      name: "Shi Gan Ru Mu",
      status: hourStemRuMuPalaces.length ? "present" : "absent",
      criterion:
        "Auditoria do 时干 em fase 墓 dentro do quadro horario, sem promover automaticamente o resultado a uma leitura conclusiva.",
      palaces: hourStemRuMuPalaces.map((palace) => formatPatternPalace(palace)),
      details: hourStemRuMuPalaces.map(
        (palace) =>
          `${palace.label}: portador do 时干 ${hourStem}; 长生 céu ${palace.tianPanGanZhangSheng}; 长生 terra ${palace.diPanGanZhangSheng}`
      ),
    }),
    buildPatternAudit({
      name: "Geng trigger / 庚触发",
      status: gengTriggerPalaces.length ? "present" : "absent",
      criterion:
        "Auditoria transparente de onde 庚 aparece no quadro; isto nao substitui uma escola propria de 庚格, apenas expõe o gatilho tecnico.",
      palaces: gengTriggerPalaces,
    }),
  ];
  const directionRatings = palaces
    .map((palace) => scoreDirection(palace))
    .sort((left, right) => right.score - left.score || left.palace.localeCompare(right.palace));
  const directionByPalace = new Map(directionRatings.map((rating) => [rating.palace, rating]));
  const bestDirections = directionRatings
    .filter((rating) => rating.score > 0)
    .slice(0, 3)
    .map(
      (rating) =>
        `${rating.palace} ${rating.direction} | ${rating.grade} | score ${rating.score} | ${rating.reasons.join(", ")}`
    );
  const cautionDirections = directionRatings
    .filter((rating) => rating.score < 0)
    .slice(0, 3)
    .map(
      (rating) =>
        `${rating.palace} ${rating.direction} | ${rating.grade} | score ${rating.score} | ${rating.reasons.join(", ")}`
    );
  const caseRelationMatrix = palaces
    .map((palace) => {
      const tags: string[] = [];
      const notes: string[] = [];
      const rating = directionByPalace.get(palace.label);

      if (palaceCarriesStem(palace, dayStem)) {
        tags.push("sujeito");
      }
      if (palaceCarriesStem(palace, hourStem)) {
        tags.push("objeto");
      }
      if (palaceCarriesStem(palace, yearStem)) {
        tags.push("ancora anual");
      }
      if (palaceCarriesStem(palace, monthStem)) {
        tags.push("ancora mensal");
      }
      if (palace.label === zhiFuPalace) {
        tags.push("Zhi Fu");
      }
      if (palace.label === zhiShiPalace) {
        tags.push("Zhi Shi");
      }
      if (xunShouCarriers.some((entry) => entry.startsWith(palace.label))) {
        tags.push("Xun Shou");
      }
      if (SAN_QI.has(palace.tianPanGan) || SAN_QI.has(palace.diPanGan) || SAN_QI.has(palace.anGan)) {
        tags.push("San Qi");
      }
      if (LIU_YI.has(palace.tianPanGan) || LIU_YI.has(palace.diPanGan) || LIU_YI.has(palace.anGan)) {
        tags.push("Liu Yi");
      }
      if (palace.maXing) {
        tags.push("Ma Xing");
      }
      if (palace.gongKong || palace.tianPanYiKong || palace.diPanYiKong) {
        tags.push("Kong");
      }

      if (palace.zhengGeNames.length) {
        notes.push(`zheng ge ${palace.zhengGeNames.join(" / ")}`);
      }
      if (palace.fuGe.activeNames.length) {
        notes.push(`fu ge ${palace.fuGe.activeNames.join(" / ")}`);
      }
      if (rating?.reasons.length) {
        notes.push(`eleicao ${rating.reasons.join(", ")}`);
      }
      if (palace.shenShaNames.length) {
        notes.push(`shen sha ${palace.shenShaNames.slice(0, 4).join(" / ")}`);
      }

      return {
        palace: palace.label,
        direction: palace.direction,
        score: rating?.score ?? 0,
        grade: rating?.grade ?? "misto",
        tags,
        notes,
      };
    })
    .sort((left, right) => right.score - left.score || left.palace.localeCompare(right.palace));
  const subjectPalaces = unique(
    palaces.filter((palace) => palaceCarriesStem(palace, dayStem)).map((palace) => palace.label)
  );
  const objectPalaces = unique(
    palaces.filter((palace) => palaceCarriesStem(palace, hourStem)).map((palace) => palace.label)
  );
  const sharedPalaces = subjectPalaces.filter((label) => objectPalaces.includes(label));
  const subjectHitsZhiFu = subjectPalaces.includes(zhiFuPalace);
  const objectHitsZhiShi = objectPalaces.includes(zhiShiPalace);
  const markerBestPalaces = caseRelationMatrix
    .filter((row) => row.tags.some((tag) => ["sujeito", "objeto", "ancora anual", "ancora mensal"].includes(tag)))
    .slice(0, 3)
    .map((row) => `${row.palace} ${row.direction} | ${row.grade} | score ${row.score}`);
  const markerCautionPalaces = caseRelationMatrix
    .filter(
      (row) =>
        row.score < 0 &&
        row.tags.some((tag) => ["sujeito", "objeto", "ancora anual", "ancora mensal"].includes(tag))
    )
    .map((row) => `${row.palace} ${row.direction} | ${row.grade} | score ${row.score}`);
  const caseAxisSummary = [
    `Sujeito (${dayStem}) em ${subjectPalaces.join(" | ") || "--"}.`,
    `Objeto (${hourStem}) em ${objectPalaces.join(" | ") || "--"}.`,
    `Sobreposicao sujeito x objeto: ${sharedPalaces.join(" | ") || "--"}.`,
    `Sujeito toca Zhi Fu: ${subjectHitsZhiFu ? "sim" : "nao"} | Objeto toca Zhi Shi: ${
      objectHitsZhiShi ? "sim" : "nao"
    }.`,
    `Eixo de comando: Zhi Fu ${zhiFuPalace} | Zhi Shi ${zhiShiPalace} | Xun Shou ${xunShouCarriers.join(" | ") || "--"}.`,
    `Melhores palacios com marcador do caso: ${markerBestPalaces.join(" || ") || "--"}.`,
    `Palacios de cautela com marcador do caso: ${markerCautionPalaces.join(" || ") || "--"}.`,
  ];
  const applicationCues = APPLICATION_CONFIG.map((config) => {
    const ranked = palaces
      .map((palace) => {
        const result = scoreApplicationPalace(palace, config);
        return { palace, score: result.score, reasons: result.reasons };
      })
      .sort((left, right) => right.score - left.score || left.palace.label.localeCompare(right.palace.label));

    const bestPalaces = ranked
      .filter((entry) => entry.score > 0)
      .slice(0, 3)
      .map(
        (entry) =>
          `${entry.palace.label} ${entry.palace.direction} | score ${entry.score} | ${
            entry.reasons.join(", ") || "sem reforco"
          }`
      );

    const cautionPalaces = ranked
      .filter((entry) => entry.score < 0)
      .slice(0, 3)
      .map(
        (entry) =>
          `${entry.palace.label} ${entry.palace.direction} | score ${entry.score} | ${
            entry.reasons.join(", ") || "sem reforco"
          }`
      );

    return {
      key: config.key,
      label: config.label,
      rule: config.rule,
      bestPalaces,
      cautionPalaces,
    };
  });
  const summary = [
    `Tabuleiro horario ${preset.technicalMethodLabel} em ${board.allTimeInformation.jieqi}, ${board.allTimeInformation.dun}遁 ${board.allTimeInformation.jushu}局.`,
    `值符 ${board.zhiFu} em ${zhiFuPalace} e 值使 ${board.zhiShi} em ${zhiShiPalace}.`,
    `旬首 ${board.xunShou}; 马星 em ${maXingPalaces.join(" | ") || "--"}; 宫空 em ${
      gongKongPalaces.join(" | ") || "--"
    }.`,
    `Portas canonicamente abertas em ${doorHighlights.open.join(" | ") || "--"}; deidades de apoio em ${
      deityHighlights.supportive.join(" | ") || "--"
    }.`,
    `Direcoes mais fortes: ${bestDirections.join(" || ") || "--"}; direcoes de cautela: ${
      cautionDirections.join(" || ") || "--"
    }.`,
    `Aplicacoes tecnicas principais: ${applicationCues
      .map((cue) => `${cue.label} => ${cue.bestPalaces[0] ?? "--"}`)
      .join(" || ")}.`,
  ];
  const boardDigest = palaces.map(
    (palace) =>
      `${palace.label} ${palace.direction}: 门 ${palace.men} | 星 ${palace.xing} | 神 ${
        palace.tianPanShen
      } | 天盘 ${palace.tianPanGan} | 地盘 ${palace.diPanGan} | 暗干 ${palace.anGan} | 旺衰 ${
        palace.wangShuai
      }`
  );

  return {
    engine: QIMEN_ENGINE_NAME,
    engineVersion: QIMEN_ENGINE_VERSION,
    enginePreset: preset,
    consultationMoment: formatConsultationMoment(input),
    adjustedMoment: formatMoment(chart),
    solarCorrectionLabel: `${chart.adjusted.solarMinutes} min total | longitude ${chart.adjusted.longitudeMinutes} | equacao ${chart.adjusted.equationOfTimeMinutes}`,
    lunarDateLabel: chart.lunarText,
    allTimeInformation: board.allTimeInformation,
    sexagenary: {
      year: board.allTimeInformation.nianzhu,
      month: board.allTimeInformation.yuezhu,
      day: board.allTimeInformation.rizhu,
      hour: board.allTimeInformation.shizhu,
    },
    jieQiWindow: {
      previousJie: lunar.getPrevJie(true).toString(),
      currentJie: board.allTimeInformation.jieqi,
      nextJie: lunar.getNextJie(true).toString(),
      previousQi: lunar.getPrevQi(true).toString(),
      nextQi: lunar.getNextQi(true).toString(),
    },
    zhiFu: board.zhiFu,
    zhiShi: board.zhiShi,
    xunShou: board.xunShou,
    dun: board.allTimeInformation.dun,
    juLabel: `${board.allTimeInformation.dun}遁 ${board.allTimeInformation.jushu}局`,
    juNumber: board.allTimeInformation.jushu,
    qiJuMethodLabel: board.qiJuMethod || preset.technicalMethodLabel,
    chosenJuShuLabel: board.choosenJuShu || "automatico",
    palaces,
    gridPalaces,
    zhiFuPalace,
    zhiShiPalace,
    xunShouCarriers,
    maXingPalaces,
    gongKongPalaces,
    yiKongPalaces,
    tianJiaPalaces,
    diJiaPalaces,
    sanQiOnSky,
    sanQiOnEarth,
    liuYiOnSky,
    liuYiOnEarth,
    canonicalDoorHighlights: doorHighlights,
    canonicalDeityHighlights: deityHighlights,
    temporalScopeSupport: {
      yearly: `Ancora anual ${board.allTimeInformation.nianzhu} exposta; este preset nao abre painel anual independente, apenas o ano sexagenario dentro do quadro horario.`,
      monthly: `Ancora mensal ${board.allTimeInformation.yuezhu} exposta; este preset nao abre painel mensal independente, apenas o mes sexagenario dentro do quadro horario.`,
      daily: `Ancora diaria ${board.allTimeInformation.rizhu} exposta; o dia participa do tabuleiro horario, mas nao existe aqui um painel 日家 separado.`,
      hourly: `Suporte integral: tabuleiro horario ${preset.technicalMethodLabel} calculado a partir de ${board.allTimeInformation.shizhu}.`,
    },
    caseMarkers: {
      subject: subjectMarker,
      object: objectMarker,
      yearAnchor,
      monthAnchor,
      yongShenRule:
        "Regra tecnica exposta: Ri Gan marca o consulente, Shi Gan marca o evento imediato, e Zhi Fu/Zhi Shi marcam comando e abertura; o Yong Shen final depende do tema concreto da pergunta.",
    },
    patternAudits,
    directionRatings,
    bestDirections,
    cautionDirections,
    caseAxisSummary,
    caseRelationMatrix,
    applicationCues,
    structureHighlights,
    structureNames,
    shenShaHighlights,
    shenShaNames,
    huanJuActivePalaces,
    summary,
    boardDigest,
  } as QiMenProfile;
}
