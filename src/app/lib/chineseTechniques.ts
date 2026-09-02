import { Solar } from "lunar-typescript";
import {
  BaziChart,
  BaziInput,
  BRANCH_SCORE_BY_PILLAR,
  ElementName,
  HIDDEN_STEM_WEIGHTS,
  Pillar,
  STATE_STRENGTH_WEIGHT,
  STEM_SCORE_BY_PILLAR,
  getStemMeta,
} from "@/app/lib/bazi";
import { QiMenProfile } from "@/app/lib/qimen";
import { ZiWeiProfile } from "@/app/lib/ziwei";

export interface DetailRow {
  label: string;
  value: string;
}

export interface DetailBlock {
  title: string;
  items: DetailRow[];
  bullets?: string[];
}

interface CycleFlow {
  forward: boolean;
  directionLabel: string;
  directionRule: string;
  genderLabel: string;
  yearPolarity: string;
  yearStem: string;
  methodLabel: string;
  methodFormula: string;
  referenceJie: string;
  referenceDistance: string;
  startSolar: string;
  startOffset: string;
  firstDaYun: string;
  firstDaYunAgeRange: string;
  firstDaYunStartSolar: string;
  firstDaYunEndSolar: string;
  firstDaYunSwitchSolar: string;
  daYunTable: string[];
  preDaYunXiaoYunTable: string[];
  currentDaYunXiaoYunTable: string[];
  currentDaYunLiuNianTable: string[];
  daYun: string;
  daYunVoid: string;
  daYunRole: string;
  xiaoYun: string;
  xiaoYunVoid: string;
  xiaoYunRole: string;
  liuNian: string;
  liuNianVoid: string;
  liuNianRole: string;
  liuYue: string;
  liuYueVoid: string;
  liuYueRole: string;
  liuNianDetail: string;
  liuYueDetail: string;
  liuRiDetail: string;
  liuShiDetail: string;
}

interface JieQiLike {
  getName(): string;
  getSolar(): Solar;
}

interface TiaoHouProfile {
  climate: string;
  yongShen: ElementName;
  note: string;
}

interface StructureCatalogRow {
  name: string;
  status: string;
  score: number;
  confidence: string;
  coverage: "direta" | "heuristica" | "catalogada";
  note: string;
}

interface StructureProfile {
  summary: string;
  selectedStructure: string;
  zhengGe: string;
  congGe: string;
  huaGe: string;
  zhuanWangGe: string;
  specialStructures: string;
  confidence: string;
  formedState: string;
  integrityNote: string;
  schoolBias: string;
  regularThreshold: number;
  specialThreshold: number;
  structureElement: ElementName;
  protectorElement: ElementName;
  transformedElement?: ElementName;
  dominantFollowerElements: ElementName[];
  supportivePurity: number;
  hostilePurity: number;
  broken: boolean;
  evidence: string[];
  scoreMap: Array<{ name: string; score: number }>;
  catalog: StructureCatalogRow[];
}

interface UsefulGodSet {
  yong: ElementName;
  xi: ElementName;
  ji: ElementName;
  chou: ElementName;
  xian: ElementName;
  tiaoHou: TiaoHouProfile;
  note: string;
  originalYong?: ElementName;
  priority: ElementName[];
  warnings: string[];
}

interface TransformationAssessment {
  formations: string[];
  stemTransforms: string[];
  trueTransforms: string[];
  conditionalTransforms: string[];
  transformedElements: ElementName[];
  strongestElement?: ElementName;
  integrity: string;
  blockers: string[];
  dominantNarrative: string;
}

interface ShenShaProfile {
  overall: string[];
  summary: string;
  themes: string[];
  libraryMode: string;
  ruleLines: string[];
  catalogLines: string[];
  perPillar: Array<{
    pillar: Pillar;
    stars: string[];
    narrative: string;
  }>;
}

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

const BRANCH_ELEMENT_MAP: Record<string, ElementName> = {
  子: "Agua",
  丑: "Terra",
  寅: "Madeira",
  卯: "Madeira",
  辰: "Terra",
  巳: "Fogo",
  午: "Fogo",
  未: "Terra",
  申: "Metal",
  酉: "Metal",
  戌: "Terra",
  亥: "Agua",
};

const BRANCH_HIDDEN_STEM_MAP: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "庚", "戊"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

const HIDDEN_LAYER_LABELS = ["Ben Qi", "Zhong Qi", "Yu Qi"];

const MU_KU_BRANCH_INFO: Partial<Record<string, string>> = {
  辰: "Armazem umido: concentra Terra com reserva de Madeira e Agua.",
  戌: "Armazem seco: concentra Terra com reserva de Metal e Fogo.",
  丑: "Armazem frio: concentra Terra com reserva de Agua e Metal.",
  未: "Armazem quente: concentra Terra com reserva de Fogo e Madeira.",
};

const MU_KU_CLASH_PARTNER: Partial<Record<string, string>> = {
  辰: "戌",
  戌: "辰",
  丑: "未",
  未: "丑",
};

const MU_KU_CLOSE_PARTNER: Partial<Record<string, string>> = {
  "\u8fb0": "\u9149",
  "\u620c": "\u536f",
  "\u4e11": "\u5b50",
  "\u672a": "\u5348",
};

const STATE_BY_SEASON: Record<string, Record<ElementName, string>> = {
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

const STATE_LABEL: Record<string, string> = {
  旺: "prosperidade",
  相: "assistencia",
  休: "repouso",
  囚: "prisao",
  死: "morte",
};

const STRONG_PHASES = new Set(["Nascimento", "Graduacao", "Prosperidade", "Apogeu"]);

const STEM_COMBINATIONS: Record<string, ElementName> = {
  "甲己": "Terra",
  "乙庚": "Metal",
  "丙辛": "Agua",
  "丁壬": "Madeira",
  "戊癸": "Fogo",
};

const LIU_HE_TRANSFORMS: Record<string, ElementName> = {
  "丑子": "Terra",
  "亥寅": "Madeira",
  "卯戌": "Fogo",
  "辰酉": "Metal",
  "巳申": "Agua",
  "午未": "Fogo",
};

const BRANCH_LIU_HE = new Set(["丑子", "亥寅", "卯戌", "辰酉", "巳申", "午未"]);
const BRANCH_LIU_CHONG = new Set(["午子", "丑未", "寅申", "卯酉", "辰戌", "亥巳"]);
const BRANCH_LIU_HAI = new Set(["子未", "丑午", "寅巳", "卯辰", "亥申", "戌酉"]);
const BRANCH_LIU_PO = new Set(["子酉", "丑辰", "亥寅", "卯午", "巳申", "戌未"]);
const BRANCH_SELF_PUNISH = new Set(["辰", "午", "酉", "亥"]);

const SAN_HE_GROUPS = [
  { members: ["申", "子", "辰"], element: "Agua" as ElementName },
  { members: ["亥", "卯", "未"], element: "Madeira" as ElementName },
  { members: ["寅", "午", "戌"], element: "Fogo" as ElementName },
  { members: ["巳", "酉", "丑"], element: "Metal" as ElementName },
];

const SAN_HUI_GROUPS = [
  { members: ["亥", "子", "丑"], element: "Agua" as ElementName },
  { members: ["寅", "卯", "辰"], element: "Madeira" as ElementName },
  { members: ["巳", "午", "未"], element: "Fogo" as ElementName },
  { members: ["申", "酉", "戌"], element: "Metal" as ElementName },
];

const BAN_HE_PAIRS = [
  { members: ["申", "子"], element: "Agua" as ElementName },
  { members: ["子", "辰"], element: "Agua" as ElementName },
  { members: ["亥", "卯"], element: "Madeira" as ElementName },
  { members: ["卯", "未"], element: "Madeira" as ElementName },
  { members: ["寅", "午"], element: "Fogo" as ElementName },
  { members: ["午", "戌"], element: "Fogo" as ElementName },
  { members: ["巳", "酉"], element: "Metal" as ElementName },
  { members: ["酉", "丑"], element: "Metal" as ElementName },
];

const AN_HE_PAIRS = [
  { members: ["\u5bc5", "\u4e11"], label: "An He conservador" },
  { members: ["\u536f", "\u7533"], label: "An He conservador" },
  { members: ["\u5348", "\u4ea5"], label: "An He conservador" },
];

const PUNISHMENT_GROUPS = [
  { members: ["寅", "巳", "申"], label: "Xing das tres punicoes (ingratidao)" },
  { members: ["丑", "未", "戌"], label: "Xing das tres punicoes (pressao de Terra)" },
  { members: ["子", "卯"], label: "Xing de descortesia" },
];

const BRANCH_GROUP_INDEX: Record<string, "water" | "wood" | "fire" | "metal"> = {
  申: "water",
  子: "water",
  辰: "water",
  亥: "wood",
  卯: "wood",
  未: "wood",
  寅: "fire",
  午: "fire",
  戌: "fire",
  巳: "metal",
  酉: "metal",
  丑: "metal",
};

const BRANCH_SEQUENCE = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

const GROUPED_SHEN_SHA = {
  water: {
    taoHua: "酉",
    yiMa: "寅",
    huaGai: "辰",
    jiangXing: "子",
  },
  wood: {
    taoHua: "子",
    yiMa: "巳",
    huaGai: "未",
    jiangXing: "卯",
  },
  fire: {
    taoHua: "卯",
    yiMa: "申",
    huaGai: "戌",
    jiangXing: "午",
  },
  metal: {
    taoHua: "午",
    yiMa: "亥",
    huaGai: "丑",
    jiangXing: "酉",
  },
} as const;

const GROUPED_JIE_SHA: Record<keyof typeof GROUPED_SHEN_SHA, string> = {
  water: "巳",
  wood: "申",
  fire: "亥",
  metal: "寅",
};

const GROUPED_ZAI_SHA: Record<keyof typeof GROUPED_SHEN_SHA, string> = {
  water: "午",
  wood: "酉",
  fire: "子",
  metal: "卯",
};

const GROUPED_WANG_SHEN: Record<keyof typeof GROUPED_SHEN_SHA, string> = {
  water: "亥",
  wood: "寅",
  fire: "巳",
  metal: "申",
};

const DAY_STEM_TIAN_YI: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  辛: ["寅", "午"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
};

const DAY_STEM_WEN_CHANG: Record<string, string> = {
  甲: "巳",
  乙: "午",
  丙: "申",
  戊: "申",
  丁: "酉",
  己: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
};

const DAY_STEM_YANG_REN: Record<string, string> = {
  甲: "卯",
  乙: "寅",
  丙: "午",
  丁: "巳",
  戊: "午",
  己: "巳",
  庚: "酉",
  辛: "申",
  壬: "子",
  癸: "亥",
};

const DAY_STEM_LU_SHEN: Record<string, string> = {
  甲: "寅",
  乙: "卯",
  丙: "巳",
  丁: "午",
  戊: "巳",
  己: "午",
  庚: "申",
  辛: "酉",
  壬: "亥",
  癸: "子",
};

const DAY_STEM_LIU_XIA: Record<string, string> = {
  甲: "酉",
  乙: "戌",
  丙: "未",
  丁: "申",
  戊: "巳",
  己: "午",
  庚: "辰",
  辛: "卯",
  壬: "亥",
  癸: "寅",
};

const HONG_LUAN_BY_BRANCH: Record<string, string> = {
  子: "卯",
  丑: "寅",
  寅: "丑",
  卯: "子",
  辰: "亥",
  巳: "戌",
  午: "酉",
  未: "申",
  申: "未",
  酉: "午",
  戌: "巳",
  亥: "辰",
};

const TIAN_XI_BY_BRANCH: Record<string, string> = {
  子: "酉",
  丑: "申",
  寅: "未",
  卯: "午",
  辰: "巳",
  巳: "辰",
  午: "卯",
  未: "寅",
  申: "丑",
  酉: "子",
  戌: "亥",
  亥: "戌",
};

const GU_CHEN_BY_GROUP: Record<string, string> = {
  water: "寅",
  wood: "巳",
  fire: "申",
  metal: "亥",
};

const GUA_SU_BY_GROUP: Record<string, string> = {
  water: "戌",
  wood: "丑",
  fire: "辰",
  metal: "未",
};

const TAI_JI_GUI_REN_BY_DAY_STEM: Record<string, string[]> = {
  甲: ["子", "午"],
  乙: ["子", "午"],
  丙: ["卯", "酉"],
  丁: ["卯", "酉"],
  戊: ["辰", "戌", "丑", "未"],
  己: ["辰", "戌", "丑", "未"],
  庚: ["寅", "亥"],
  辛: ["寅", "亥"],
  壬: ["巳", "申"],
  癸: ["巳", "申"],
};

const FU_XING_GUI_REN_BY_STEM: Record<string, string[]> = {
  甲: ["寅", "子"],
  丙: ["寅", "子"],
  乙: ["丑"],
  癸: ["丑"],
  丁: ["亥"],
  戊: ["申"],
  己: ["未"],
  庚: ["午"],
  辛: ["巳"],
  壬: ["辰"],
};

const TIAN_CHU_GUI_REN_BY_STEM: Record<string, string> = {
  甲: "巳",
  乙: "午",
  丙: "申",
  戊: "申",
  丁: "酉",
  己: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
};

const YUE_DE_STEM_BY_MONTH_BRANCH: Record<string, string> = {
  寅: "丙",
  午: "丙",
  戌: "丙",
  申: "壬",
  子: "壬",
  辰: "壬",
  亥: "甲",
  卯: "甲",
  未: "甲",
  巳: "庚",
  酉: "庚",
  丑: "庚",
};

const YUE_DE_HE_BY_MONTH_BRANCH: Record<string, string> = {
  寅: "辛",
  午: "辛",
  戌: "辛",
  申: "丁",
  子: "丁",
  辰: "丁",
  巳: "乙",
  酉: "乙",
  丑: "乙",
  亥: "己",
  卯: "己",
  未: "己",
};

const TIAN_DE_MARKER_BY_MONTH_BRANCH: Record<string, { type: "stem" | "branch"; value: string }> = {
  寅: { type: "stem", value: "丁" },
  卯: { type: "branch", value: "申" },
  辰: { type: "stem", value: "壬" },
  巳: { type: "stem", value: "辛" },
  午: { type: "branch", value: "亥" },
  未: { type: "stem", value: "甲" },
  申: { type: "stem", value: "癸" },
  酉: { type: "branch", value: "寅" },
  戌: { type: "stem", value: "丙" },
  亥: { type: "stem", value: "乙" },
  子: { type: "branch", value: "巳" },
  丑: { type: "stem", value: "庚" },
};

const TIAN_DE_HE_MARKER_BY_MONTH_BRANCH: Record<string, { type: "stem" | "branch"; value: string }> = {
  寅: { type: "stem", value: "壬" },
  卯: { type: "branch", value: "巳" },
  辰: { type: "stem", value: "丁" },
  巳: { type: "stem", value: "丙" },
  午: { type: "branch", value: "寅" },
  未: { type: "stem", value: "己" },
  申: { type: "stem", value: "戊" },
  酉: { type: "branch", value: "亥" },
  戌: { type: "stem", value: "辛" },
  亥: { type: "stem", value: "庚" },
  子: { type: "branch", value: "申" },
  丑: { type: "stem", value: "乙" },
};

const TIAN_YI_DOCTOR_BY_MONTH_BRANCH: Record<string, string> = {
  寅: "丑",
  卯: "寅",
  辰: "卯",
  巳: "辰",
  午: "巳",
  未: "午",
  申: "未",
  酉: "申",
  戌: "酉",
  亥: "戌",
  子: "亥",
  丑: "子",
};

const HONG_YAN_BY_DAY_STEM: Record<string, string> = {
  甲: "午",
  乙: "午",
  丙: "寅",
  丁: "未",
  戊: "辰",
  己: "辰",
  庚: "戌",
  辛: "酉",
  壬: "子",
  癸: "申",
};

const GUO_YIN_BY_DAY_STEM: Record<string, string> = {
  甲: "戌",
  乙: "亥",
  丙: "丑",
  丁: "寅",
  戊: "丑",
  己: "寅",
  庚: "辰",
  辛: "巳",
  壬: "未",
  癸: "申",
};

const XUE_TANG_BY_DAY_MASTER_ELEMENT: Record<ElementName, string> = {
  Metal: "巳",
  Madeira: "亥",
  Agua: "申",
  Terra: "申",
  Fogo: "寅",
};

const XUE_REN_BY_MONTH_BRANCH: Record<string, string> = {
  寅: "丑",
  卯: "未",
  辰: "寅",
  巳: "申",
  午: "卯",
  未: "酉",
  申: "辰",
  酉: "戌",
  戌: "巳",
  亥: "亥",
  子: "午",
  丑: "子",
};

const KUI_GANG_DAY_PILLARS = new Set(["庚辰", "庚戌", "壬辰", "戊戌"]);
const YIN_YANG_CHA_CUO_DAY_PILLARS = new Set([
  "丙子",
  "丁丑",
  "戊寅",
  "辛卯",
  "壬辰",
  "癸巳",
  "丙午",
  "丁未",
  "戊申",
  "辛酉",
  "壬戌",
  "癸亥",
]);
const BA_ZHUAN_DAY_PILLARS = new Set(["甲寅", "乙卯", "丁未", "戊戌", "己未", "庚申", "辛酉", "癸丑"]);
const TEN_SPIRIT_DAY_PILLARS = new Set([
  "甲辰",
  "乙亥",
  "丙辰",
  "丁酉",
  "戊午",
  "庚戌",
  "庚寅",
  "辛亥",
  "壬寅",
  "癸未",
]);
const GU_LUAN_DAY_PILLARS = new Set(["甲寅", "乙巳", "丙午", "丁巳", "戊午", "戊申", "辛亥", "壬子"]);
const JIN_SHEN_PILLARS = new Set(["乙丑", "己巳", "癸酉"]);
const LIU_XIU_DAY_PILLARS = new Set(["丙午", "丁未", "戊子", "戊午", "己丑", "己未"]);
const SHI_E_DA_BAI_DAY_PILLARS = new Set(["甲辰", "乙巳", "壬申", "丙申", "丁亥", "庚辰", "戊戌", "癸亥", "辛巳", "己丑"]);
const FOUR_WASTE_DAY_PILLARS_BY_SEASON: Record<string, Set<string>> = {
  Primavera: new Set(["庚申", "辛酉"]),
  Verao: new Set(["壬子", "癸亥"]),
  Outono: new Set(["甲寅", "乙卯"]),
  Inverno: new Set(["丙午", "丁巳"]),
};
const TIAN_ZHUAN_DAY_PILLARS_BY_SEASON: Record<string, Set<string>> = {
  Primavera: new Set(["乙卯"]),
  Verao: new Set(["丙午"]),
  Outono: new Set(["辛酉"]),
  Inverno: new Set(["壬子"]),
};
const DI_ZHUAN_DAY_PILLARS_BY_SEASON: Record<string, Set<string>> = {
  Primavera: new Set(["辛卯"]),
  Verao: new Set(["戊午"]),
  Outono: new Set(["癸酉"]),
  Inverno: new Set(["丙子"]),
};
const TIAN_SHE_DAY_PILLARS_BY_SEASON: Record<string, Set<string>> = {
  Primavera: new Set(["戊寅"]),
  Verao: new Set(["甲午"]),
  Outono: new Set(["戊申"]),
  Inverno: new Set(["甲子"]),
};

const STRUCTURE_BY_TEN_GOD: Record<string, string> = {
  "Paralelo Justo": "Bi Jian Ge",
  "Paralelo Injusto": "Jie Cai Ge",
  "Producao Justa": "Shi Shen Ge",
  "Producao Injusta": "Shang Guan Ge",
  "Riqueza Justa": "Zheng Cai Ge",
  "Riqueza Abrupta": "Pian Cai Ge",
  "Poder Justo": "Zheng Guan Ge",
  "Poder Injusto": "Qi Sha Ge",
  "Sustentacao Justa": "Zheng Yin Ge",
  "Sustentacao Injusta": "Pian Yin Ge",
  "Mestre do Dia": "Ri Zhu Ge",
};

const JIE_QI_ALIAS: Record<string, string> = {
  DONG_ZHI: "冬至",
  DA_XUE: "大雪",
  XIAO_HAN: "小寒",
  DA_HAN: "大寒",
  LI_CHUN: "立春",
  YU_SHUI: "雨水",
  JING_ZHE: "驚蟄",
  CHUN_FEN: "春分",
  QING_MING: "清明",
  GU_YU: "谷雨",
  LI_XIA: "立夏",
  XIAO_MAN: "小满",
  MANG_ZHONG: "芒种",
  XIA_ZHI: "夏至",
  XIAO_SHU: "小暑",
  DA_SHU: "大暑",
  LI_QIU: "立秋",
  CHU_SHU: "處暑",
  BAI_LU: "白露",
  QIU_FEN: "秋分",
  HAN_LU: "寒露",
  SHUANG_JIANG: "霜降",
  LI_DONG: "立冬",
  XIAO_XUE: "小雪",
};

const SHEN_SHA_GLOSSARY: Record<
  string,
  { theme: string; short: string; pillarHint?: string; rule?: string; source?: string; library?: "core" | "expanded" }
> = {
  "Tao Hua": {
    theme: "carisma e atracao",
    short: "Amplia magnetismo social, desejo, visibilidade afetiva e poder de seducao.",
    rule: "Usa grupo do ramo do Ano ou do Dia para localizar a flor de pessego no ramo correspondente.",
    source: "Tabela classica por grupos de ramos (Zi Ping).",
    library: "core",
  },
  "Hong Luan": {
    theme: "romance e eventos afetivos",
    short: "Favorece encontros marcantes, casamento, abertura do coracao e eventos emocionais felizes.",
    rule: "Usa o ramo do Ano para localizar o ramo correspondente de Hong Luan.",
    source: "Tabela anual de estrelas afetivas.",
    library: "core",
  },
  "Tian Xi": {
    theme: "alegria e celebracao",
    short: "Traz alegria, reconciliacao, noticias boas e clima de satisfacao emocional.",
    rule: "Usa o ramo do Ano para localizar o ramo correspondente de Tian Xi.",
    source: "Tabela anual de estrelas afetivas.",
    library: "core",
  },
  "Yi Ma": {
    theme: "movimento e deslocamento",
    short: "Acende mudanca, viagens, relocacao, transicao de carreira e movimento de vida.",
    rule: "Usa grupo do ramo do Ano ou do Dia para localizar o Cavalo Viajante.",
    source: "Tabela classica por grupos de ramos.",
    library: "core",
  },
  "Hua Gai": {
    theme: "refinamento e recolhimento",
    short: "Sinaliza introspeccao, arte, espiritualidade, pensamento simbolico e certa distancia social.",
    rule: "Usa grupo do ramo do Ano ou do Dia para localizar o ramo da Canopy Star.",
    source: "Tabela classica por grupos de ramos.",
    library: "core",
  },
  "Jiang Xing": {
    theme: "lideranca e comando",
    short: "Aumenta presenca de comando, iniciativa, postura de chefe e gosto por decidir rumos.",
    rule: "Usa grupo do ramo do Ano ou do Dia para localizar a General Star.",
    source: "Tabela classica por grupos de ramos.",
    library: "expanded",
  },
  "Tian Yi Gui Ren": {
    theme: "ajuda e protecao humana",
    short: "Indica apoio de aliados, mentores ou pessoas que aliviam momentos delicados.",
    rule: "Compara o tronco do Dia com ramos nobres correspondentes.",
    source: "Tabela classica por tronco do Dia.",
    library: "core",
  },
  "Wen Chang": {
    theme: "intelecto e expressao",
    short: "Fortalece estudo, escrita, articulacao verbal, estrategia mental e reputacao intelectual.",
    rule: "Compara o tronco do Dia com o ramo correspondente de Wen Chang.",
    source: "Tabela classica por tronco do Dia.",
    library: "core",
  },
  "Yang Ren": {
    theme: "forca cortante e risco de excesso",
    short: "Da coragem e presenca, mas pode endurecer a conduta e ampliar impulsividade ou confrontos.",
    rule: "Compara o tronco do Dia com o ramo correspondente da Sheep Blade.",
    source: "Tabela classica por tronco do Dia.",
    library: "core",
  },
  "Lu Shen": {
    theme: "capacidade de sustento",
    short: "Reflete capacidade de se estabelecer, ganhar base propria e sustentar o proprio valor.",
    rule: "Compara o tronco do Dia com o ramo correspondente de Jian Lu / Lu Shen.",
    source: "Tabela classica por tronco do Dia.",
    library: "core",
  },
  "Gu Chen": {
    theme: "solitude e distancia",
    short: "Marca independencia, reserva emocional e tendencia a afastamento ou dificuldade de intimidade.",
    rule: "Usa o grupo do ramo do Ano para localizar Lonely Star.",
    source: "Tabela anual por grupos de ramos.",
    library: "core",
  },
  "Gua Su": {
    theme: "esfriamento relacional",
    short: "Aponta secura afetiva, sentimento de separacao ou peso extra nas relacoes intimas.",
    rule: "Usa o grupo do ramo do Ano para localizar Widow Star.",
    source: "Tabela anual por grupos de ramos.",
    library: "core",
  },
  "Tai Ji Gui Ren": {
    theme: "sabedoria e sensibilidade metafisica",
    short: "Favorece intuicao, filosofia, espiritualidade, psicologia e estudo profundo.",
    rule: "Compara o tronco do Dia com os ramos correspondentes de Tai Ji.",
    source: "Tabela classica por tronco do Dia.",
    library: "core",
  },
  "Yue De Gui Ren": {
    theme: "virtude e suavizacao",
    short: "Ajuda a suavizar conflitos, atrair boa vontade e encontrar apoio em situacoes humanas.",
    rule: "Compara o ramo do Mes com o tronco correspondente de Yue De.",
    source: "Tabela classica por ramo do Mes.",
    library: "core",
  },
  "Tian De Gui Ren": {
    theme: "protecao e virtude celeste",
    short: "Funciona como camada de protecao, amortecimento de dano e saida mais limpa em crises.",
    rule: "Compara o ramo do Mes com o marcador de tronco ou ramo correspondente de Tian De.",
    source: "Tabela classica por ramo do Mes.",
    library: "core",
  },
  "Yue De He": {
    theme: "conciliacao, virtude e harmonizacao",
    short: "Opera como combinacao da virtude mensal, ajudando a pacificar conflitos, acomodar tensoes e reunir fortuna com boa vontade.",
    rule: "Compara o ramo do Mes com o tronco correspondente da combinacao de Yue De He.",
    source: "FateMaster Yue De He / formula classica por ramo do Mes.",
    library: "expanded",
  },
  "Tian De He": {
    theme: "conciliacao celeste e saida favoravel",
    short: "Age como combinacao da virtude celeste, favorecendo desembaraco, alivio de dano e resolucao mais limpa das tensoes.",
    rule: "Compara o ramo do Mes com o marcador correspondente de Tian De He, que pode ser tronco ou ramo.",
    source: "FateMaster Tian De He / formula classica por ramo do Mes.",
    library: "expanded",
  },
  "Fu Xing Gui Ren": {
    theme: "fortuna estavel e benfazejo suporte",
    short: "Marca estrela nobre de fortuna, conforto e protecao, associada a boa base material e vida mais auspiciosa.",
    rule: "Compara o tronco do Dia ou do Ano com os ramos correspondentes de Fu Xing Gui Ren.",
    source: "FateMaster Fu Xing Gui Ren / tabela classica por tronco.",
    library: "expanded",
  },
  "Tian Chu Gui Ren": {
    theme: "abundancia, sustento e provisao",
    short: "Aponta boa provisao, nutricao, fartura e apoio material, com afinidade a comida, acolhimento e sustento.",
    rule: "Compara o tronco do Dia ou do Ano com o ramo correspondente de Tian Chu Gui Ren.",
    source: "FateMaster Tian Chu Gui Ren / tabela classica por tronco.",
    library: "expanded",
  },
  "Tian Yi": {
    theme: "medicina, cura e protecao fisica",
    short: "Associa-se a medicina, cuidados de saude, sensibilidade curativa e recursos de amparo corporal ou terapeutico.",
    rule: "Compara o ramo do Mes com o ramo correspondente de Tian Yi (Heavenly Doctor).",
    source: "FateMaster Tian Yi / tabela classica por ramo do Mes.",
    library: "expanded",
  },
  "De Xiu Gui Ren": {
    theme: "virtude, refinamento e talento distinto",
    short: "Sinaliza nobreza de carater, talento refinado, elegancia de conduta e brilho intelectual quando preservada de danos pesados.",
    rule: "Usa o ramo do Mes para localizar os troncos de De e Xiu que formam a estrela Virtude e Excelencia.",
    source: "FateMaster De Xiu Gui Ren / formulas classicas por grupos de ramo do Mes.",
    library: "expanded",
  },
  "San Qi Gui Ren": {
    theme: "engenho excepcional e talento raro",
    short: "Marca reuniao das Tres Maravilhas, favorecendo inteligencia fora do comum, criatividade elevada e capacidade de destaque.",
    rule: "Verifica a reuniao dos tres troncos classicos de San Qi: Ceu (Jia-Wu-Geng), Terra (Yi-Bing-Ding) ou Humana (Ren-Gui-Xin).",
    source: "FateMaster San Qi Gui Ren / San Ming Tong Hui.",
    library: "expanded",
  },
  "Hong Yan": {
    theme: "atracao intensa e enredamento afetivo",
    short: "Sinaliza magnetismo erotico e complexidade relacional, especialmente quando reforcada por outras estrelas de romance.",
    rule: "Compara o tronco do Dia com o ramo correspondente de Hong Yan.",
    source: "San Ming Tong Hui e FateMaster Hong Yan Sha.",
    library: "expanded",
  },
  "Guo Yin": {
    theme: "autoridade, selo e legitimidade",
    short: "Marca senso de ordem, dignidade, comando institucional e capacidade de lidar com responsabilidade formal.",
    rule: "Compara o tronco do Dia com o ramo correspondente de Guo Yin.",
    source: "Cantian AI Guoyin / tabela classica por tronco do Dia.",
    library: "expanded",
  },
  "Jie Sha": {
    theme: "roubo, perda e choque abrupto",
    short: "Assinala risco de perdas, conflitos bruscos, pressao por seguranca material e eventos de rapida ruptura.",
    rule: "Usa o grupo do ramo do Ano ou do Dia: Shen-Zi-Chen ve Si, Hai-Mao-Wei ve Shen, Yin-Wu-Xu ve Hai, Si-You-Chou ve Yin.",
    source: "FateMaster Jie Sha e formula classica do San Ming Tong Hui.",
    library: "expanded",
  },
  "Zai Sha": {
    theme: "acidente, susto e dano repentino",
    short: "Marca exposicao maior a acidentes, sustos, risco fisico ou eventos que exigem cautela material.",
    rule: "Usa o grupo do ramo do Ano ou do Dia: Shen-Zi-Chen ve Wu, Hai-Mao-Wei ve You, Yin-Wu-Xu ve Zi, Si-You-Chou ve Mao.",
    source: "FateMaster Zai Sha e formula classica do San Ming Tong Hui.",
    library: "expanded",
  },
  "Wang Shen": {
    theme: "perda, desgaste e misfortune",
    short: "Sinaliza fase de perda energetica, desgaste, vulnerabilidade e necessidade de fortalecer base e prudencia.",
    rule: "Usa o grupo do ramo do Ano ou do Dia: Yin-Wu-Xu ve Si, Hai-Mao-Wei ve Yin, Si-You-Chou ve Shen, Shen-Zi-Chen ve Hai.",
    source: "FateMaster Wang Shen / Death God.",
    library: "expanded",
  },
  "Sang Men": {
    theme: "luto e peso emocional",
    short: "Traz tema de pesar, despedidas, ambiente de luto ou clima emocional mais pesado no eixo anual.",
    rule: "Conta duas posicoes a frente a partir do ramo do Ano para localizar Sang Men.",
    source: "FateMaster Sang Men / Mourning Gate.",
    library: "expanded",
  },
  "Diao Ke": {
    theme: "tristeza e melancolia",
    short: "Aponta baixa emocional, tristeza, pesar, saudade ou atmosfera menos leve no eixo anual.",
    rule: "Conta duas posicoes para tras a partir do ramo do Ano para localizar Diao Ke.",
    source: "FateMaster Diao Ke / Mourning Visitor.",
    library: "expanded",
  },
  "Pi Ma": {
    theme: "vestes de luto e assuntos de despedida",
    short: "Associa-se a contexto de luto, cerimonial funebre, encerramentos e peso emocional familiar.",
    rule: "Usa a sequencia anual: Zi ve You, Chou ve Xu, Yin ve Hai, Mao ve Zi, Chen ve Chou, Si ve Yin, Wu ve Mao, Wei ve Chen, Shen ve Si, You ve Wu, Xu ve Wei, Hai ve Shen.",
    source: "FateMaster Pi Ma / Wearing Hemp.",
    library: "expanded",
  },
  "Liu Xia": {
    theme: "sangue, corte e vulnerabilidade fisica",
    short: "Acende cuidados com cortes, acidentes, sangue, cirurgias ou situacoes fisicamente invasivas.",
    rule: "Compara o tronco do Dia com o ramo correspondente de Liu Xia.",
    source: "FateMaster Liu Xia / Flowing Cloud.",
    library: "expanded",
  },
  "Xue Ren": {
    theme: "sangue, lesao e cirurgia",
    short: "Marca predisposicao simbolica a sangramento, cirurgia, lesoes ou eventos de impacto fisico.",
    rule: "Compara o ramo do Mes com o ramo correspondente de Xue Ren.",
    source: "FateMaster Xue Ren / Blood Blade.",
    library: "expanded",
  },
  "Xue Tang": {
    theme: "estudo, memoria e formacao",
    short: "Realca memoria, disciplina intelectual, formacao erudita e inclinacao a estudo sistematico.",
    rule: "Usa o elemento do Mestre do Dia para localizar o ramo de Xue Tang no modo Ziping simplificado.",
    source: "FateMaster Xue Tang / formula classica do Academic Hall.",
    library: "expanded",
  },
  "Kui Gang": {
    theme: "autoridade dura e resolucao",
    short: "Aponta dia de carater forte, autoridade, firmeza e decisao, com necessidade de observar choques e rigidez.",
    rule: "Verifica se o Pilar do Dia e um dos quatro dias Kui Gang.",
    source: "San Ming Tong Hui e FateMaster Kui Gang.",
    library: "expanded",
  },
  "Jin Shen": {
    theme: "firmeza metalica e autoridade cortante",
    short: "Marca pulso firme, decisao, dureza de comando e necessidade de modular rigidez e impulso.",
    rule: "Verifica se algum pilar forma uma das tres combinacoes classicas de Jin Shen: Yi Chou, Ji Si ou Gui You.",
    source: "FateMaster Jin Shen.",
    library: "expanded",
  },
  "Yin Yang Cha Cuo": {
    theme: "descompasso relacional",
    short: "Marca dia sensivel para desalinhamento conjugal e friccao entre polos relacionais.",
    rule: "Verifica se o Pilar do Dia pertence ao grupo classico de doze dias Yin Yang Cha Cuo.",
    source: "San Ming Tong Hui e FateMaster Yin Yang Error.",
    library: "expanded",
  },
  "Ba Zhuan Ri": {
    theme: "especializacao e foco tecnico",
    short: "Sinaliza dia com foco especializado, tenacidade e tendencia a consolidar autoridade em nichos.",
    rule: "Verifica se o Pilar do Dia pertence aos oito dias especializados.",
    source: "FateMaster Eight Exclusive Days.",
    library: "expanded",
  },
  "Shi Ling Ri": {
    theme: "sensibilidade, inspiracao e intuicao",
    short: "Marca dia de insight, refinamento intuitivo e percepcao simbolica acima da media.",
    rule: "Verifica se o Pilar do Dia pertence aos dez dias espirituais.",
    source: "FateMaster Ten Spirit Days.",
    library: "expanded",
  },
  "Si Fei Ri": {
    theme: "dispersao sazonal e improdutividade",
    short: "Assinala dia sazonalmente esvaziado, com perda de tracao quando a estacao o contraria.",
    rule: "Usa a estacao do mapa e compara o Pilar do Dia com os dias Four Waste daquela estacao.",
    source: "FateMaster Four Waste Days.",
    library: "expanded",
  },
  "Gu Luan": {
    theme: "solidao conjugal e independencia afetiva",
    short: "Assinala dia com maior risco de distancia afetiva ou de percurso conjugal pouco convencional.",
    rule: "Verifica se o Pilar do Dia pertence ao grupo classico de Gu Luan.",
    source: "FateMaster Lonely Phoenix.",
    library: "expanded",
  },
  "Liu Xiu Ri": {
    theme: "talento refinado e brilho natural",
    short: "Assinala dia tradicionalmente ligado a inteligencia, refinamento, talento artistico e boa apresentacao.",
    rule: "Verifica se o Pilar do Dia pertence a um dos seis dias Liu Xiu.",
    source: "FateMaster Six Beautiful Days.",
    library: "expanded",
  },
  "Shi E Da Bai": {
    theme: "fragilidade material e perda patrimonial",
    short: "Sinaliza vulnerabilidade simbolica a perda de patrimonio, vazamento material ou erosao de base herdada.",
    rule: "Verifica se o Pilar do Dia pertence ao grupo classico dos dez grandes derrotados.",
    source: "FateMaster Shi E Da Bai / Ten Great Defeats.",
    library: "expanded",
  },
  "Tian Luo": {
    theme: "rede, aprisionamento e enrosco",
    short: "Assinala sensacao de aprisionamento, enrosco, dependencia de contexto e dificuldade de sair de dilemas.",
    rule: "Verifica a presenca conjunta de Xu e Hai no quadro visivel, regra classica de Tian Luo.",
    source: "Cantian AI e FateMaster Tian Luo Di Wang.",
    library: "expanded",
  },
  "Di Wang": {
    theme: "armadilha terrestre e pressao de contexto",
    short: "Indica cerco, pressao de ambiente, repeticao de bloqueios e necessidade de estrategia para destravar o quadro.",
    rule: "Verifica a presenca conjunta de Chen e Si no quadro visivel, regra classica de Di Wang.",
    source: "Cantian AI e FateMaster Tian Luo Di Wang.",
    library: "expanded",
  },
  "Tian Zhuan Ri": {
    theme: "virada celeste e inflexao de destino",
    short: "Marca dia tradicional de virada forte, transicao de fase e inflexoes importantes do percurso.",
    rule: "Usa a estacao do Mes para verificar o dia sazonal de Tian Zhuan: primavera Yi Mao, verao Bing Wu, outono Xin You, inverno Ren Zi.",
    source: "FateMaster Tian Zhuan Ri.",
    library: "expanded",
  },
  "Di Zhuan Ri": {
    theme: "virada terrestre e mudanca de rota",
    short: "Sinaliza dia de reversao de base, mudanca de rota material e giro importante de condicoes.",
    rule: "Usa a estacao do Mes para verificar o dia sazonal de Di Zhuan: primavera Xin Mao, verao Wu Wu, outono Gui You, inverno Bing Zi.",
    source: "FateMaster Tian Zhuan Ri (bloco Heaven and Earth Turning Days).",
    library: "expanded",
  },
  "Tian She Ri": {
    theme: "perdao, alivio e saida limpa",
    short: "Aponta dia de anistia simbolica, alivio de peso, desbloqueio e oportunidade de recomeco.",
    rule: "Usa a estacao do Mes para verificar Tian She Ri: primavera Wu Yin, verao Jia Wu, outono Wu Shen, inverno Jia Zi.",
    source: "FateMaster Tian She Ri.",
    library: "expanded",
  },
};

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour: hour || 0, minute: minute || 0 };
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTime(value: Date) {
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())} ${pad2(value.getHours())}:${pad2(value.getMinutes())}:${pad2(value.getSeconds())}`;
}

function shiftDateTimeString(value: string, minutes: number) {
  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  date.setMinutes(date.getMinutes() + minutes);
  return formatDateTime(date);
}

function formatMinuteSpan(totalMinutes: number) {
  const absolute = Math.abs(totalMinutes);
  const days = Math.floor(absolute / 1440);
  const hours = Math.floor((absolute % 1440) / 60);
  const minutes = absolute % 60;
  const parts = [
    days ? `${days} dia(s)` : "",
    hours ? `${hours} hora(s)` : "",
    minutes ? `${minutes} minuto(s)` : "",
  ].filter(Boolean);

  return parts.join(", ") || "0 minuto(s)";
}

function formatJieQiName(name: string) {
  return JIE_QI_ALIAS[name] ?? name;
}

function formatJieQiNode(node: JieQiLike) {
  return `${formatJieQiName(node.getName())} ${node.getSolar().toYmdHms()}`;
}

function formatCurrentJieQiWindow(current: JieQiLike | null, previous: JieQiLike, next: JieQiLike) {
  return current
    ? formatJieQiNode(current)
    : `Entre ${formatJieQiName(previous.getName())} ${previous.getSolar().toYmdHms()} e ${formatJieQiName(next.getName())} ${next.getSolar().toYmdHms()}`;
}

function joinOrFallback(values: string[], fallback: string) {
  return values.length ? values.join(" | ") : fallback;
}

function shiftBranch(branch: string, offset: number) {
  const index = BRANCH_SEQUENCE.indexOf(branch as (typeof BRANCH_SEQUENCE)[number]);

  if (index === -1) {
    return "";
  }

  return BRANCH_SEQUENCE[(index + offset + BRANCH_SEQUENCE.length) % BRANCH_SEQUENCE.length];
}

function getVisiblePillars(chart: BaziChart) {
  return chart.pillars;
}

function getBranchHiddenStems(branch: string) {
  return BRANCH_HIDDEN_STEM_MAP[branch] ?? [];
}

function buildGanZhiProfile(dayStem: string, ganZhi: string, xunKong = "--") {
  const stem = ganZhi[0] ?? "";
  const branch = ganZhi[1] ?? "";
  const stemMeta = stem ? getStemMeta(stem) : undefined;
  const hiddenStems = getBranchHiddenStems(branch);

  return {
    ganZhi,
    stem,
    branch,
    stemElement: stemMeta?.element,
    branchElement: BRANCH_ELEMENT_MAP[branch],
    hiddenStems,
    stemGod: stem ? getTenGodName(dayStem, stem) : "--",
    hiddenGods: hiddenStems.map((hidden) => getTenGodName(dayStem, hidden)),
    xunKong,
  };
}

function summarizeGanZhiAgainstNatal(chart: BaziChart, label: string, ganZhi: string) {
  const lines = getVisiblePillars(chart).flatMap((pillar) =>
    summarizeGanZhiInteraction(label, ganZhi, pillar.label, pillar.ganZhi)
  );

  return lines.length
    ? lines.join(" | ")
    : "Sem combinacao, choque, dano ou destruicao classica maior contra os pilares natais";
}

function buildUsefulTouchNote(
  profile: ReturnType<typeof buildGanZhiProfile>,
  usefulGods: UsefulGodSet,
  structure: StructureProfile
) {
  const elements = [profile.stemElement, profile.branchElement].filter(Boolean) as ElementName[];
  const notes: string[] = [];

  if (elements.includes(usefulGods.yong)) {
    notes.push(`toca Yong ${usefulGods.yong}`);
  }

  if (elements.includes(usefulGods.xi)) {
    notes.push(`toca Xi ${usefulGods.xi}`);
  }

  if (elements.includes(usefulGods.ji)) {
    notes.push(`encosta em Ji ${usefulGods.ji}`);
  }

  if (elements.includes(usefulGods.chou)) {
    notes.push(`encosta em Chou ${usefulGods.chou}`);
  }

  if (elements.includes(usefulGods.tiaoHou.yongShen)) {
    notes.push(`aciona Tiao Hou ${usefulGods.tiaoHou.yongShen}`);
  }

  if (elements.includes(structure.structureElement)) {
    notes.push(`dialoga com a estrutura em ${structure.structureElement}`);
  }

  if (structure.broken && elements.includes(structure.protectorElement)) {
    notes.push(`oferece elemento protetor ${structure.protectorElement}`);
  }

  return notes.length ? notes.join(" | ") : "sem toque direto em Yong, Xi, Ji, Chou ou Tiao Hou";
}

function formatHiddenStemTechnicalLayers(dayStem: string, stems: string[], season?: string) {
  return stems
    .map((stem, index) => {
      const meta = getStemMeta(stem);
      const state = season && meta ? `${getElementState(meta.element, season)} ${STATE_LABEL[getElementState(meta.element, season)]}` : "";
      const revealed = dayStem ? "" : "";
      return `${HIDDEN_LAYER_LABELS[index] ?? `Oculto ${index + 1}`} ${stem} (${getTenGodName(dayStem, stem)}${meta ? `; ${meta.element}` : ""}${state ? `; ${state}` : ""}; peso ${HIDDEN_STEM_WEIGHTS[index] ?? 1})${revealed}`;
    })
    .join(" | ");
}

function buildDaYunTechnicalLine(
  cycle: {
    getIndex(): number;
    getGanZhi(): string;
    getXunKong(): string;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
  },
  firstStartSolar: Solar,
  dayStem: string,
  natalChart: BaziChart,
  usefulGods: UsefulGodSet,
  structure: StructureProfile
) {
  const profile = buildGanZhiProfile(dayStem, cycle.getGanZhi(), cycle.getXunKong());
  const cycleStart = firstStartSolar.nextYear((cycle.getIndex() - 1) * 10);
  const nextSwitch = firstStartSolar.nextYear(cycle.getIndex() * 10);
  const cycleEnd = shiftDateTimeString(nextSwitch.toYmdHms(), -1);
  const hiddenLayers = formatHiddenStemTechnicalLayers(dayStem, profile.hiddenStems);

  return `${cycle.getGanZhi()} | idades ${cycle.getStartAge()}-${cycle.getEndAge()} | anos ${cycle.getStartYear()}-${cycle.getEndYear()} | inicio exato ${cycleStart.toYmdHms()} | fim tecnico ${cycleEnd} | tronco ${profile.stem} (${profile.stemGod}${profile.stemElement ? ` / ${profile.stemElement}` : ""}) | ramo ${profile.branch} (${profile.branchElement ?? "--"}) | ocultos ${hiddenLayers || "--"} | 1a metade com maior enfase no tronco | 2a metade com maior enfase no ramo | Kong Wang ${profile.xunKong} | ${buildUsefulTouchNote(profile, usefulGods, structure)} | natal ${summarizeGanZhiAgainstNatal(natalChart, "Da Yun", cycle.getGanZhi())}`;
}

function buildLiuNianTechnicalLine(
  cycle: {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
    getXunKong(): string;
  },
  daYunGanZhi: string,
  dayStem: string,
  natalChart: BaziChart,
  usefulGods: UsefulGodSet,
  structure: StructureProfile,
  currentYear: number
) {
  const profile = buildGanZhiProfile(dayStem, cycle.getGanZhi(), cycle.getXunKong());
  const hiddenLayers = formatHiddenStemTechnicalLayers(dayStem, profile.hiddenStems);
  const chain = summarizeGanZhiInteraction("Da Yun", daYunGanZhi, "Liu Nian", cycle.getGanZhi()).join(" | ") || "Sem aspecto classico maior com o Da Yun";
  const currentMarker = cycle.getYear() === currentYear ? " | ano consultado" : "";
  const annualShenSha = buildTransitShenShaSnapshot(natalChart, cycle.getGanZhi()).join("/") || "--";

  return `${cycle.getYear()} (idade ${cycle.getAge()}): ${cycle.getGanZhi()}${currentMarker} | tronco ${profile.stem} (${profile.stemGod}${profile.stemElement ? ` / ${profile.stemElement}` : ""}) | ramo ${profile.branch} (${profile.branchElement ?? "--"}) | ocultos ${hiddenLayers || "--"} | Kong Wang ${profile.xunKong} | Shen Sha ${annualShenSha} | ${buildUsefulTouchNote(profile, usefulGods, structure)} | natal ${summarizeGanZhiAgainstNatal(natalChart, "Liu Nian", cycle.getGanZhi())} | Da Yun ${chain}`;
}

function buildXiaoYunTechnicalLine(
  cycle: {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
    getXunKong(): string;
  },
  daYunGanZhi: string,
  dayStem: string,
  natalChart: BaziChart,
  usefulGods: UsefulGodSet,
  structure: StructureProfile
) {
  const profile = buildGanZhiProfile(dayStem, cycle.getGanZhi(), cycle.getXunKong());
  const hiddenLayers = formatHiddenStemTechnicalLayers(dayStem, profile.hiddenStems);
  const chain = daYunGanZhi
    ? summarizeGanZhiInteraction("Da Yun", daYunGanZhi, "Xiao Yun", cycle.getGanZhi()).join(" | ") || "Sem aspecto classico maior com o Da Yun"
    : "Usado antes da entrada no primeiro Da Yun";

  return `${cycle.getYear()} (idade ${cycle.getAge()}): ${cycle.getGanZhi()} | tronco ${profile.stem} (${profile.stemGod}${profile.stemElement ? ` / ${profile.stemElement}` : ""}) | ramo ${profile.branch} (${profile.branchElement ?? "--"}) | ocultos ${hiddenLayers || "--"} | Kong Wang ${profile.xunKong} | ${buildUsefulTouchNote(profile, usefulGods, structure)} | natal ${summarizeGanZhiAgainstNatal(natalChart, "Xiao Yun", cycle.getGanZhi())} | apoio temporal ${chain}`;
}

function buildTemporalLayerDetail(
  label: string,
  ganZhi: string,
  xunKong: string,
  dayStem: string,
  natalChart: BaziChart,
  usefulGods: UsefulGodSet,
  structure: StructureProfile,
  chainedLabels: Array<[string, string]> = []
) {
  const profile = buildGanZhiProfile(dayStem, ganZhi, xunKong);
  const hiddenLayers = formatHiddenStemTechnicalLayers(dayStem, profile.hiddenStems);
  const chain = chainedLabels
    .flatMap(([otherLabel, otherGanZhi]) => summarizeGanZhiInteraction(label, ganZhi, otherLabel, otherGanZhi))
    .join(" | ");

  return `${ganZhi} | tronco ${profile.stem} (${profile.stemGod}${profile.stemElement ? ` / ${profile.stemElement}` : ""}) | ramo ${profile.branch} (${profile.branchElement ?? "--"}) | ocultos ${hiddenLayers || "--"} | Kong Wang ${profile.xunKong} | ${buildUsefulTouchNote(profile, usefulGods, structure)} | natal ${summarizeGanZhiAgainstNatal(natalChart, label, ganZhi)}${chain ? ` | cadeia ${chain}` : ""}`;
}

function getChartSolar(chart: BaziChart) {
  const { year, month, day } = parseDate(chart.adjusted.date);
  const clock = chart.input.unknownTime ? "12:00" : chart.adjusted.time;
  const { hour, minute } = parseTime(clock);

  return Solar.fromYmdHms(year, month, day, hour, minute, 0);
}

function getLunarFromChart(chart: BaziChart) {
  return getChartSolar(chart).getLunar();
}

function getSupportElement(element: ElementName) {
  return (Object.entries(GENERATES).find(([, generated]) => generated === element)?.[0] ??
    "Agua") as ElementName;
}

function getControlledBy(element: ElementName) {
  return (Object.entries(CONTROLS).find(([, controlled]) => controlled === element)?.[0] ??
    "Metal") as ElementName;
}

function getElementState(element: ElementName, season: string) {
  return STATE_BY_SEASON[season]?.[element] ?? "休";
}

function normalizePair(left: string, right: string) {
  return [left, right].sort((a, b) => a.localeCompare(b, "zh-Hans-CN")).join("");
}

function branchRootsForElement(chart: BaziChart, target: ElementName) {
  return chart.pillars.filter((pillar) =>
    pillar.hiddenStems.some((stem) => getStemMeta(stem)?.element === target)
  );
}

function getTenGodName(dayStem: string, targetStem: string) {
  const day = getStemMeta(dayStem);
  const target = getStemMeta(targetStem);

  if (!day || !target) {
    return "--";
  }

  if (dayStem === targetStem) {
    return "Mestre do Dia";
  }

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

function describeElementDynamic(source: ElementName, target: ElementName) {
  if (source === target) {
    return `${source} espelha ${target}`;
  }

  if (GENERATES[source] === target) {
    return `${source} alimenta ${target}`;
  }

  if (GENERATES[target] === source) {
    return `${source} recebe recurso de ${target}`;
  }

  if (CONTROLS[source] === target) {
    return `${source} controla ${target}`;
  }

  return `${source} e controlado por ${target}`;
}

function formatElementList(elements: ElementName[]) {
  return elements.join(" / ") || "--";
}

function getYinYangBalance(chart: BaziChart) {
  if (chart.analysis?.polarityBalance) {
    const balance = chart.analysis.polarityBalance;
    return `Visiveis Yang ${balance.visibleYang} / Yin ${balance.visibleYin}; ocultos Yang ${balance.hiddenYang} / Yin ${balance.hiddenYin}`;
  }

  const visible = getVisiblePillars(chart);
  const visibleBalance = visible.reduce(
    (acc, pillar) => {
      acc[pillar.polarity] += 1;
      return acc;
    },
    { Yang: 0, Yin: 0 } as Record<"Yang" | "Yin", number>
  );
  const hiddenBalance = visible.reduce(
    (acc, pillar) => {
      pillar.hiddenStems.forEach((stem) => {
        const meta = getStemMeta(stem);
        if (meta) {
          acc[meta.polarity] += 1;
        }
      });
      return acc;
    },
    { Yang: 0, Yin: 0 } as Record<"Yang" | "Yin", number>
  );

  return `Visiveis Yang ${visibleBalance.Yang} / Yin ${visibleBalance.Yin}; ocultos Yang ${hiddenBalance.Yang} / Yin ${hiddenBalance.Yin}`;
}

function buildStemCombinationPairs(chart: BaziChart) {
  const combinations: Array<{ labels: [string, string]; result: ElementName }> = [];
  const pillars = getVisiblePillars(chart);

  for (let index = 0; index < pillars.length; index += 1) {
    for (let inner = index + 1; inner < pillars.length; inner += 1) {
      const pair = `${pillars[index].stem}${pillars[inner].stem}`;
      const reverse = `${pillars[inner].stem}${pillars[index].stem}`;
      const result = STEM_COMBINATIONS[pair] ?? STEM_COMBINATIONS[reverse];

      if (result) {
        combinations.push({
          labels: [pillars[index].label, pillars[inner].label],
          result,
        });
      }
    }
  }

  return combinations;
}

function buildStemRelations(chart: BaziChart) {
  return buildStemCombinationPairs(chart).map(
    (pair) => `${pair.labels[0]} + ${pair.labels[1]}: combinacao de Troncos em ${pair.result}`
  );
}

function buildBranchRelations(chart: BaziChart) {
  const liuHe: string[] = [];
  const liuChong: string[] = [];
  const liuHai: string[] = [];
  const liuPo: string[] = [];
  const banHe: string[] = [];
  const anHe: string[] = [];
  const yaoHe: string[] = [];
  const yaoChong: string[] = [];
  const selfPunishments: string[] = [];
  const punishments: string[] = [];
  const muKuOpenings: string[] = [];
  const muKuClosings: string[] = [];
  const pillars = getVisiblePillars(chart);
  const branches = pillars.map((pillar) => pillar.branch);
  const counts = new Map<string, number>();
  const remoteBranchRules = usesRemoteBranchRules(chart.input.schoolMode);

  branches.forEach((branch) => counts.set(branch, (counts.get(branch) ?? 0) + 1));

  for (let index = 0; index < pillars.length; index += 1) {
    for (let inner = index + 1; inner < pillars.length; inner += 1) {
      const pair = normalizePair(pillars[index].branch, pillars[inner].branch);
      const labels = `${pillars[index].label} ${pillars[index].branch} + ${pillars[inner].label} ${pillars[inner].branch}`;

      if (BRANCH_LIU_HE.has(pair)) {
        liuHe.push(`${labels}: Liu He`);
      }

      if (BRANCH_LIU_CHONG.has(pair)) {
        liuChong.push(`${labels}: choque`);
      }

      if (BRANCH_LIU_HAI.has(pair)) {
        liuHai.push(`${labels}: dano`);
      }

      if (BRANCH_LIU_PO.has(pair)) {
        liuPo.push(`${labels}: destruicao`);
      }

      if (remoteBranchRules && inner - index > 1) {
        if (BRANCH_LIU_HE.has(pair)) {
          yaoHe.push(`${labels}: Yao He / combinacao a distancia`);
        }

        if (BRANCH_LIU_CHONG.has(pair)) {
          yaoChong.push(`${labels}: Yao Chong / choque a distancia`);
        }
      }
    }
  }

  BRANCH_SELF_PUNISH.forEach((branch) => {
    if ((counts.get(branch) ?? 0) > 1) {
      selfPunishments.push(`Autopunicao em ${branch}`);
    }
  });

  PUNISHMENT_GROUPS.forEach((group) => {
    if (group.members.every((branch) => branches.includes(branch))) {
      punishments.push(group.label);
    }
  });

  const sanHe = SAN_HE_GROUPS.filter((group) =>
    group.members.every((branch) => branches.includes(branch))
  ).map((group) => `San He completo em ${group.element}: ${group.members.join("-")}`);

  const sanHui = SAN_HUI_GROUPS.filter((group) =>
    group.members.every((branch) => branches.includes(branch))
  ).map((group) => `San Hui completo em ${group.element}: ${group.members.join("-")}`);

  BAN_HE_PAIRS.forEach((pair) => {
    const [left, right] = pair.members;

    if (branches.includes(left) && branches.includes(right)) {
      banHe.push(`Ban He em ${pair.element}: ${left}-${right}`);
    }
  });

  AN_HE_PAIRS.forEach((pair) => {
    const [left, right] = pair.members;

    if (branches.includes(left) && branches.includes(right)) {
      anHe.push(`${pair.label}: ${left}-${right}`);
    }
  });

  pillars
    .filter((pillar) => Boolean(MU_KU_BRANCH_INFO[pillar.branch]))
    .forEach((pillar) => {
      const clashBranch = MU_KU_CLASH_PARTNER[pillar.branch];
      const closeBranch = MU_KU_CLOSE_PARTNER[pillar.branch];
      const clashPillar = clashBranch
        ? pillars.find((entry) => entry.branch === clashBranch && entry.key !== pillar.key)
        : undefined;
      const closePillar = closeBranch
        ? pillars.find((entry) => entry.branch === closeBranch && entry.key !== pillar.key)
        : undefined;

      if (clashBranch && clashPillar) {
        muKuOpenings.push(
          `${pillar.label} ${pillar.branch} abre armazem por choque com ${clashPillar.label} ${clashPillar.branch}`
        );
      }

      if (closeBranch && closePillar) {
        muKuClosings.push(
          `${pillar.label} ${pillar.branch} fecha/armazena por combinacao com ${closePillar.label} ${closePillar.branch}`
        );
      }
    });

  return {
    liuHe,
    liuChong,
    liuHai,
    liuPo,
    banHe,
    anHe,
    yaoHe,
    yaoChong,
    selfPunishments,
    punishments,
    sanHe,
    sanHui,
    muKuOpenings,
    muKuClosings,
  };
}

function normalizeShenShaName(star: string) {
  return star.replace(/\s+\(.+\)$/, "");
}

function getDeXiuProfile(monthBranch: string) {
  if (["寅", "午", "戌"].includes(monthBranch)) {
    return {
      de: ["丙", "丁"],
      xiu: ["戊", "癸"],
    };
  }

  if (["申", "子", "辰"].includes(monthBranch)) {
    return {
      de: ["壬", "癸", "戊", "己"],
      xiu: ["丙", "辛", "甲", "己"],
    };
  }

  if (["巳", "酉", "丑"].includes(monthBranch)) {
    return {
      de: ["庚", "辛"],
      xiu: ["乙", "庚"],
    };
  }

  if (["亥", "卯", "未"].includes(monthBranch)) {
    return {
      de: ["甲", "乙"],
      xiu: ["丁", "壬"],
    };
  }

  return {
    de: [] as string[],
    xiu: [] as string[],
  };
}

function getSanQiType(stems: string[]) {
  const stemSet = new Set(stems);

  if (["甲", "戊", "庚"].every((stem) => stemSet.has(stem))) {
    return "San Qi Gui Ren (Ceu)";
  }
  if (["乙", "丙", "丁"].every((stem) => stemSet.has(stem))) {
    return "San Qi Gui Ren (Terra)";
  }
  if (["壬", "癸", "辛"].every((stem) => stemSet.has(stem))) {
    return "San Qi Gui Ren (Humana)";
  }

  return "";
}

function getSanQiMembers(type: string) {
  if (type.includes("Ceu")) {
    return ["甲", "戊", "庚"];
  }
  if (type.includes("Terra")) {
    return ["乙", "丙", "丁"];
  }
  if (type.includes("Humana")) {
    return ["壬", "癸", "辛"];
  }

  return [];
}

function isExpandedShenShaMode(mode: BaziInput["schoolMode"]) {
  return mode === "expanded-symbolic";
}

function usesRemoteBranchRules(mode: BaziInput["schoolMode"]) {
  return mode === "geju-structure" || mode === "expanded-symbolic";
}

function buildShenShaProfile(chart: BaziChart): ShenShaProfile {
  const yearBranch = chart.pillars.find((pillar) => pillar.key === "year")?.branch ?? "";
  const yearStem = chart.pillars.find((pillar) => pillar.key === "year")?.stem ?? "";
  const monthBranch = chart.pillars.find((pillar) => pillar.key === "month")?.branch ?? "";
  const dayBranch = chart.pillars.find((pillar) => pillar.key === "day")?.branch ?? yearBranch;
  const dayPillarGanZhi = chart.pillars.find((pillar) => pillar.key === "day")?.ganZhi ?? "";
  const dayStem = chart.dayMaster.stem;
  const dayElement = chart.dayMaster.element;
  const expandedMode = isExpandedShenShaMode(chart.input.schoolMode);
  const overall = new Set<string>();
  const yearGroupKey = yearBranch ? BRANCH_GROUP_INDEX[yearBranch] : undefined;
  const monthVirtueStem = monthBranch ? YUE_DE_STEM_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthHeavenVirtue = monthBranch ? TIAN_DE_MARKER_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthVirtueHeStem = monthBranch ? YUE_DE_HE_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthHeavenVirtueHe = monthBranch ? TIAN_DE_HE_MARKER_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthDoctorBranch = monthBranch ? TIAN_YI_DOCTOR_BY_MONTH_BRANCH[monthBranch] : undefined;
  const visiblePillars = getVisiblePillars(chart);
  const visibleStemList = visiblePillars.map((pillar) => pillar.stem);
  const visibleBranchSet = new Set(visiblePillars.map((pillar) => pillar.branch));
  const deXiu = getDeXiuProfile(monthBranch);
  const sanQiType = expandedMode ? getSanQiType(visibleStemList) : "";
  const sanQiMembers = sanQiType ? getSanQiMembers(sanQiType) : [];
  const sangMenBranch = yearBranch ? shiftBranch(yearBranch, 2) : "";
  const diaoKeBranch = yearBranch ? shiftBranch(yearBranch, -2) : "";
  const piMaBranch = yearBranch ? shiftBranch(yearBranch, -3) : "";
  const hasTianLuo = visibleBranchSet.has("戌") && visibleBranchSet.has("亥");
  const hasDiWang = visibleBranchSet.has("辰") && visibleBranchSet.has("巳");

  const groupedSources = [
    { source: "Ano", branch: yearBranch },
    { source: "Dia", branch: dayBranch },
  ].filter((entry) => entry.branch);

  const describeStars = (stars: string[]) => {
    if (!stars.length) {
      return "Shen Sha: --.";
    }

    const parts = stars
      .map((star) => {
        const base = normalizeShenShaName(star);
        const gloss = SHEN_SHA_GLOSSARY[base];
        return gloss ? `${base} => ${gloss.theme}` : `${base} => estrela simbolica ativa`;
      })
      .slice(0, 3);

    return parts.join(" ");
  };

  const perPillar = visiblePillars.map((pillar) => {
    const stars = new Set<string>();

    groupedSources.forEach(({ source, branch }) => {
      const groupKey = BRANCH_GROUP_INDEX[branch];
      const group = groupKey ? GROUPED_SHEN_SHA[groupKey] : null;

      if (!group) {
        return;
      }

      if (pillar.branch === group.taoHua) {
        stars.add(`Tao Hua (${source})`);
      }
      if (pillar.branch === group.yiMa) {
        stars.add(`Yi Ma (${source})`);
      }
      if (pillar.branch === group.huaGai) {
        stars.add(`Hua Gai (${source})`);
      }
      if (pillar.branch === group.jiangXing) {
        stars.add(`Jiang Xing (${source})`);
      }
      if (expandedMode && pillar.branch === GROUPED_JIE_SHA[groupKey]) {
        stars.add(`Jie Sha (${source})`);
      }
      if (expandedMode && pillar.branch === GROUPED_ZAI_SHA[groupKey]) {
        stars.add(`Zai Sha (${source})`);
      }
      if (expandedMode && pillar.branch === GROUPED_WANG_SHEN[groupKey]) {
        stars.add(`Wang Shen (${source})`);
      }
    });

    if (DAY_STEM_TIAN_YI[dayStem]?.includes(pillar.branch)) {
      stars.add("Tian Yi Gui Ren");
    }
    if (DAY_STEM_WEN_CHANG[dayStem] === pillar.branch) {
      stars.add("Wen Chang");
    }
    if (expandedMode && monthDoctorBranch && pillar.branch === monthDoctorBranch) {
      stars.add("Tian Yi");
    }
    if (DAY_STEM_YANG_REN[dayStem] === pillar.branch) {
      stars.add("Yang Ren");
    }
    if (DAY_STEM_LU_SHEN[dayStem] === pillar.branch) {
      stars.add("Lu Shen");
    }
    if (yearBranch && pillar.branch === HONG_LUAN_BY_BRANCH[yearBranch]) {
      stars.add("Hong Luan (Ano)");
    }
    if (yearBranch && pillar.branch === TIAN_XI_BY_BRANCH[yearBranch]) {
      stars.add("Tian Xi (Ano)");
    }
    if (yearGroupKey && pillar.branch === GU_CHEN_BY_GROUP[yearGroupKey]) {
      stars.add("Gu Chen (Ano)");
    }
    if (yearGroupKey && pillar.branch === GUA_SU_BY_GROUP[yearGroupKey]) {
      stars.add("Gua Su (Ano)");
    }
    if (TAI_JI_GUI_REN_BY_DAY_STEM[dayStem]?.includes(pillar.branch)) {
      stars.add("Tai Ji Gui Ren (Dia)");
    }
    if (expandedMode && FU_XING_GUI_REN_BY_STEM[dayStem]?.includes(pillar.branch)) {
      stars.add("Fu Xing Gui Ren (Dia)");
    }
    if (expandedMode && yearStem && FU_XING_GUI_REN_BY_STEM[yearStem]?.includes(pillar.branch)) {
      stars.add("Fu Xing Gui Ren (Ano)");
    }
    if (expandedMode && TIAN_CHU_GUI_REN_BY_STEM[dayStem] === pillar.branch) {
      stars.add("Tian Chu Gui Ren (Dia)");
    }
    if (expandedMode && yearStem && TIAN_CHU_GUI_REN_BY_STEM[yearStem] === pillar.branch) {
      stars.add("Tian Chu Gui Ren (Ano)");
    }
    if (monthVirtueStem && pillar.stem === monthVirtueStem) {
      stars.add("Yue De Gui Ren (Mes)");
    }
    if (
      monthHeavenVirtue &&
      ((monthHeavenVirtue.type === "stem" && pillar.stem === monthHeavenVirtue.value) ||
        (monthHeavenVirtue.type === "branch" && pillar.branch === monthHeavenVirtue.value))
    ) {
      stars.add("Tian De Gui Ren (Mes)");
    }
    if (expandedMode && monthVirtueHeStem && pillar.stem === monthVirtueHeStem) {
      stars.add("Yue De He");
    }
    if (
      expandedMode &&
      monthHeavenVirtueHe &&
      ((monthHeavenVirtueHe.type === "stem" && pillar.stem === monthHeavenVirtueHe.value) ||
        (monthHeavenVirtueHe.type === "branch" && pillar.branch === monthHeavenVirtueHe.value))
    ) {
      stars.add("Tian De He");
    }
    if (expandedMode && (deXiu.de.includes(pillar.stem) || deXiu.xiu.includes(pillar.stem))) {
      stars.add("De Xiu Gui Ren");
    }
    if (expandedMode && sanQiType && sanQiMembers.includes(pillar.stem)) {
      stars.add(sanQiType);
    }
    if (expandedMode && HONG_YAN_BY_DAY_STEM[dayStem] === pillar.branch) {
      stars.add("Hong Yan");
    }
    if (expandedMode && DAY_STEM_LIU_XIA[dayStem] === pillar.branch) {
      stars.add("Liu Xia");
    }
    if (expandedMode && GUO_YIN_BY_DAY_STEM[dayStem] === pillar.branch) {
      stars.add("Guo Yin");
    }
    if (expandedMode && XUE_TANG_BY_DAY_MASTER_ELEMENT[dayElement] === pillar.branch) {
      stars.add("Xue Tang");
    }
    if (expandedMode && monthBranch && XUE_REN_BY_MONTH_BRANCH[monthBranch] === pillar.branch) {
      stars.add("Xue Ren");
    }
    if (expandedMode && yearBranch && pillar.branch === sangMenBranch) {
      stars.add("Sang Men (Ano)");
    }
    if (expandedMode && yearBranch && pillar.branch === diaoKeBranch) {
      stars.add("Diao Ke (Ano)");
    }
    if (expandedMode && yearBranch && pillar.branch === piMaBranch) {
      stars.add("Pi Ma (Ano)");
    }
    if (expandedMode && hasTianLuo && (pillar.branch === "戌" || pillar.branch === "亥")) {
      stars.add("Tian Luo");
    }
    if (expandedMode && hasDiWang && (pillar.branch === "辰" || pillar.branch === "巳")) {
      stars.add("Di Wang");
    }
    if (expandedMode && JIN_SHEN_PILLARS.has(pillar.ganZhi)) {
      stars.add("Jin Shen");
    }
    if (expandedMode && KUI_GANG_DAY_PILLARS.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Kui Gang");
    }
    if (
      expandedMode &&
      YIN_YANG_CHA_CUO_DAY_PILLARS.has(dayPillarGanZhi) &&
      pillar.key === "day"
    ) {
      stars.add("Yin Yang Cha Cuo");
    }
    if (expandedMode && BA_ZHUAN_DAY_PILLARS.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Ba Zhuan Ri");
    }
    if (expandedMode && TEN_SPIRIT_DAY_PILLARS.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Shi Ling Ri");
    }
    if (
      expandedMode &&
      FOUR_WASTE_DAY_PILLARS_BY_SEASON[chart.analysis.season]?.has(dayPillarGanZhi) &&
      pillar.key === "day"
    ) {
      stars.add("Si Fei Ri");
    }
    if (expandedMode && GU_LUAN_DAY_PILLARS.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Gu Luan");
    }
    if (expandedMode && LIU_XIU_DAY_PILLARS.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Liu Xiu Ri");
    }
    if (expandedMode && SHI_E_DA_BAI_DAY_PILLARS.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Shi E Da Bai");
    }
    if (expandedMode && TIAN_ZHUAN_DAY_PILLARS_BY_SEASON[chart.analysis.season]?.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Tian Zhuan Ri");
    }
    if (expandedMode && DI_ZHUAN_DAY_PILLARS_BY_SEASON[chart.analysis.season]?.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Di Zhuan Ri");
    }
    if (expandedMode && TIAN_SHE_DAY_PILLARS_BY_SEASON[chart.analysis.season]?.has(dayPillarGanZhi) && pillar.key === "day") {
      stars.add("Tian She Ri");
    }

    stars.forEach((star) => overall.add(star));

    const sortedStars = [...stars].sort((left, right) => left.localeCompare(right));

    return {
      pillar,
      stars: sortedStars,
      narrative: describeStars(sortedStars),
    };
  });

  const overallStars = [...overall].sort((left, right) => left.localeCompare(right));
  const themeLabels = distinctStrings(
    overallStars.map((star) => SHEN_SHA_GLOSSARY[normalizeShenShaName(star)]?.theme)
  );
  const catalogLines = overallStars.map((star) => {
    const base = normalizeShenShaName(star);
    const gloss = SHEN_SHA_GLOSSARY[base];
    const activePillars = perPillar
      .filter(({ stars }) => stars.some((entry) => normalizeShenShaName(entry) === base))
      .map(({ pillar }) => pillar.label)
      .join("/");

    return `${base}: ${gloss?.short ?? "estrela simbolica ativa"} | pilares ${activePillars || "--"} | biblioteca ${
      gloss?.library === "expanded" ? "ampliada" : "base"
    }`;
  });
  const ruleLines = distinctStrings(
    overallStars.map((star) => {
      const base = normalizeShenShaName(star);
      const gloss = SHEN_SHA_GLOSSARY[base];

      if (!gloss?.rule) {
        return undefined;
      }

      return `${base}: ${gloss.rule} | Fonte: ${gloss.source ?? "tradicao classica"} | Biblioteca ${
        gloss.library === "expanded" ? "ampliada" : "base"
      }`;
    })
  );

  const summary = overallStars.length
    ? overallStars
        .slice(0, 4)
        .map((star) => {
          const base = normalizeShenShaName(star);
          const gloss = SHEN_SHA_GLOSSARY[base];
          return gloss ? `${base} => ${gloss.theme}` : `${base} => estrela simbolica ativa`;
        })
        .join(" ")
    : "Shen Sha principal: --.";

  return {
    overall: overallStars,
    summary,
    themes: themeLabels.slice(0, 4),
    libraryMode: expandedMode ? "Biblioteca ampliada de Shen Sha" : "Biblioteca base de Shen Sha",
    ruleLines,
    catalogLines,
    perPillar,
  };
}

function buildTenGodStrengthProfile(chart: BaziChart) {
  const weights = new Map<string, number>();
  const visiblePillars = getVisiblePillars(chart);

  visiblePillars.forEach((pillar) => {
    const visibleWeight = pillar.key === "month" ? 16 : pillar.key === "day" ? 18 : 12;
    weights.set(pillar.tenGod, (weights.get(pillar.tenGod) ?? 0) + visibleWeight);
    pillar.hiddenGods.forEach((god, index) => {
      const hiddenWeight = [6, 3, 1][index] ?? 1;
      weights.set(god, (weights.get(god) ?? 0) + hiddenWeight);
    });
  });

  return [...weights.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([god, score]) => `${god} ${score}`);
}

function buildTransitShenShaSnapshot(natalChart: BaziChart, ganZhi: string) {
  const branch = ganZhi[1] ?? "";
  const stem = ganZhi[0] ?? "";
  const yearBranch = natalChart.pillars.find((pillar) => pillar.key === "year")?.branch ?? "";
  const yearStem = natalChart.pillars.find((pillar) => pillar.key === "year")?.stem ?? "";
  const monthBranch = natalChart.pillars.find((pillar) => pillar.key === "month")?.branch ?? "";
  const dayBranch = natalChart.pillars.find((pillar) => pillar.key === "day")?.branch ?? yearBranch;
  const dayPillarGanZhi = natalChart.pillars.find((pillar) => pillar.key === "day")?.ganZhi ?? "";
  const dayStem = natalChart.dayMaster.stem;
  const dayElement = natalChart.dayMaster.element;
  const expandedMode = isExpandedShenShaMode(natalChart.input.schoolMode);
  const monthVirtueStem = monthBranch ? YUE_DE_STEM_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthHeavenVirtue = monthBranch ? TIAN_DE_MARKER_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthVirtueHeStem = monthBranch ? YUE_DE_HE_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthHeavenVirtueHe = monthBranch ? TIAN_DE_HE_MARKER_BY_MONTH_BRANCH[monthBranch] : undefined;
  const monthDoctorBranch = monthBranch ? TIAN_YI_DOCTOR_BY_MONTH_BRANCH[monthBranch] : undefined;
  const deXiu = getDeXiuProfile(monthBranch);
  const natalBranches = new Set(getVisiblePillars(natalChart).map((pillar) => pillar.branch));
  const natalStems = getVisiblePillars(natalChart).map((pillar) => pillar.stem);
  const sanQiType = expandedMode ? getSanQiType([...natalStems, stem]) : "";
  const sanQiMembers = sanQiType ? getSanQiMembers(sanQiType) : [];
  const sangMenBranch = yearBranch ? shiftBranch(yearBranch, 2) : "";
  const diaoKeBranch = yearBranch ? shiftBranch(yearBranch, -2) : "";
  const piMaBranch = yearBranch ? shiftBranch(yearBranch, -3) : "";
  const hits = new Set<string>();

  [
    { source: "Ano natal", branch: yearBranch },
    { source: "Dia natal", branch: dayBranch },
  ]
    .filter((entry) => entry.branch)
    .forEach(({ source, branch: sourceBranch }) => {
      const groupKey = BRANCH_GROUP_INDEX[sourceBranch];
      const group = groupKey ? GROUPED_SHEN_SHA[groupKey] : null;

      if (!group || !branch) {
        return;
      }

      if (branch === group.taoHua) {
        hits.add(`Tao Hua (${source})`);
      }
      if (branch === group.yiMa) {
        hits.add(`Yi Ma (${source})`);
      }
      if (branch === group.huaGai) {
        hits.add(`Hua Gai (${source})`);
      }
      if (branch === group.jiangXing) {
        hits.add(`Jiang Xing (${source})`);
      }
      if (expandedMode && branch === GROUPED_JIE_SHA[groupKey]) {
        hits.add(`Jie Sha (${source})`);
      }
      if (expandedMode && branch === GROUPED_ZAI_SHA[groupKey]) {
        hits.add(`Zai Sha (${source})`);
      }
      if (expandedMode && branch === GROUPED_WANG_SHEN[groupKey]) {
        hits.add(`Wang Shen (${source})`);
      }
    });

  if (DAY_STEM_TIAN_YI[dayStem]?.includes(branch)) {
    hits.add("Tian Yi Gui Ren");
  }
  if (DAY_STEM_WEN_CHANG[dayStem] === branch) {
    hits.add("Wen Chang");
  }
  if (expandedMode && monthDoctorBranch && branch === monthDoctorBranch) {
    hits.add("Tian Yi");
  }
  if (DAY_STEM_YANG_REN[dayStem] === branch) {
    hits.add("Yang Ren");
  }
  if (DAY_STEM_LU_SHEN[dayStem] === branch) {
    hits.add("Lu Shen");
  }
  if (expandedMode && FU_XING_GUI_REN_BY_STEM[dayStem]?.includes(branch)) {
    hits.add("Fu Xing Gui Ren (Dia natal)");
  }
  if (expandedMode && yearStem && FU_XING_GUI_REN_BY_STEM[yearStem]?.includes(branch)) {
    hits.add("Fu Xing Gui Ren (Ano natal)");
  }
  if (expandedMode && TIAN_CHU_GUI_REN_BY_STEM[dayStem] === branch) {
    hits.add("Tian Chu Gui Ren (Dia natal)");
  }
  if (expandedMode && yearStem && TIAN_CHU_GUI_REN_BY_STEM[yearStem] === branch) {
    hits.add("Tian Chu Gui Ren (Ano natal)");
  }
  if (yearBranch && branch === HONG_LUAN_BY_BRANCH[yearBranch]) {
    hits.add("Hong Luan (Ano natal)");
  }
  if (yearBranch && branch === TIAN_XI_BY_BRANCH[yearBranch]) {
    hits.add("Tian Xi (Ano natal)");
  }
  if (yearBranch && branch === sangMenBranch) {
    hits.add("Sang Men (Ano natal)");
  }
  if (yearBranch && branch === diaoKeBranch) {
    hits.add("Diao Ke (Ano natal)");
  }
  if (yearBranch && branch === piMaBranch) {
    hits.add("Pi Ma (Ano natal)");
  }
  if (monthVirtueStem && stem === monthVirtueStem) {
    hits.add("Yue De Gui Ren (Mes natal)");
  }
  if (
    monthHeavenVirtue &&
    ((monthHeavenVirtue.type === "stem" && stem === monthHeavenVirtue.value) ||
      (monthHeavenVirtue.type === "branch" && branch === monthHeavenVirtue.value))
  ) {
    hits.add("Tian De Gui Ren (Mes natal)");
  }
  if (expandedMode && monthVirtueHeStem && stem === monthVirtueHeStem) {
    hits.add("Yue De He");
  }
  if (
    expandedMode &&
    monthHeavenVirtueHe &&
    ((monthHeavenVirtueHe.type === "stem" && stem === monthHeavenVirtueHe.value) ||
      (monthHeavenVirtueHe.type === "branch" && branch === monthHeavenVirtueHe.value))
  ) {
    hits.add("Tian De He");
  }
  if (expandedMode && (deXiu.de.includes(stem) || deXiu.xiu.includes(stem))) {
    hits.add("De Xiu Gui Ren");
  }
  if (expandedMode && sanQiType && sanQiMembers.includes(stem)) {
    hits.add(sanQiType);
  }
  if (TAI_JI_GUI_REN_BY_DAY_STEM[dayStem]?.includes(branch)) {
    hits.add("Tai Ji Gui Ren (Dia natal)");
  }

  if (!expandedMode) {
    return [...hits].sort((left, right) => left.localeCompare(right));
  }

  if (HONG_YAN_BY_DAY_STEM[dayStem] === branch) {
    hits.add("Hong Yan");
  }
  if (DAY_STEM_LIU_XIA[dayStem] === branch) {
    hits.add("Liu Xia");
  }
  if (GUO_YIN_BY_DAY_STEM[dayStem] === branch) {
    hits.add("Guo Yin");
  }
  if (XUE_TANG_BY_DAY_MASTER_ELEMENT[dayElement] === branch) {
    hits.add("Xue Tang");
  }
  if (monthBranch && XUE_REN_BY_MONTH_BRANCH[monthBranch] === branch) {
    hits.add("Xue Ren");
  }
  if (JIN_SHEN_PILLARS.has(ganZhi)) {
    hits.add("Jin Shen");
  }
  if (LIU_XIU_DAY_PILLARS.has(ganZhi)) {
    hits.add("Liu Xiu Ri");
  }
  if (SHI_E_DA_BAI_DAY_PILLARS.has(ganZhi)) {
    hits.add("Shi E Da Bai");
  }
  if (TIAN_ZHUAN_DAY_PILLARS_BY_SEASON[natalChart.analysis.season]?.has(ganZhi)) {
    hits.add("Tian Zhuan Ri");
  }
  if (DI_ZHUAN_DAY_PILLARS_BY_SEASON[natalChart.analysis.season]?.has(ganZhi)) {
    hits.add("Di Zhuan Ri");
  }
  if (TIAN_SHE_DAY_PILLARS_BY_SEASON[natalChart.analysis.season]?.has(ganZhi)) {
    hits.add("Tian She Ri");
  }
  if ((branch === "戌" && natalBranches.has("亥")) || (branch === "亥" && natalBranches.has("戌"))) {
    hits.add("Tian Luo");
  }
  if ((branch === "辰" && natalBranches.has("巳")) || (branch === "巳" && natalBranches.has("辰"))) {
    hits.add("Di Wang");
  }
  if (YIN_YANG_CHA_CUO_DAY_PILLARS.has(dayPillarGanZhi) && ganZhi === dayPillarGanZhi) {
    hits.add("Yin Yang Cha Cuo");
  }

  return [...hits].sort((left, right) => left.localeCompare(right));
}

function pickDistinctElement(
  pool: ElementName[],
  excluded: ElementName[],
  fallback: ElementName
) {
  return pool.find((element) => !excluded.includes(element)) ?? fallback;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreToConfidence(score: number) {
  if (score >= 88) {
    return "Muito alta";
  }
  if (score >= 76) {
    return "Alta";
  }
  if (score >= 64) {
    return "Media";
  }
  if (score >= 48) {
    return "Baixa";
  }
  return "Muito baixa";
}

function getStructureSchoolPolicy(mode: BaziInput["schoolMode"]) {
  switch (mode) {
    case "balance-strong-weak":
      return {
        regularThreshold: 74,
        specialThreshold: 80,
        scoreBias: { regular: -4, cong: -2, hua: -6, zhuan: -6 },
        label:
          "Modo forte/fraco: estruturas especiais sob gate mais duro; o motor privilegia balanco do Mestre antes de promover Ge raro.",
      };
    case "geju-structure":
      return {
        regularThreshold: 70,
        specialThreshold: 68,
        scoreBias: { regular: 4, cong: 8, hua: 10, zhuan: 8 },
        label:
          "Modo Ge Ju: Yue Ling, Cheng/Po Ge e estruturas especiais recebem peso ampliado no fechamento tecnico.",
      };
    case "expanded-symbolic":
      return {
        regularThreshold: 72,
        specialThreshold: 72,
        scoreBias: { regular: 2, cong: 4, hua: 4, zhuan: 4 },
        label:
          "Modo simbolico ampliado: base estrutural Zi Ping preservada, com catalogo expandido sem relaxar demais o gate tecnico.",
      };
    case "ziping-conservative":
    default:
      return {
        regularThreshold: 72,
        specialThreshold: 76,
        scoreBias: { regular: 0, cong: 0, hua: 0, zhuan: 0 },
        label:
          "Modo Zi Ping conservador: gate estrutural mais prudente para evitar promover Ge especial sem pureza suficiente.",
      };
  }
}

function getRoleElements(dayElement: ElementName) {
  return {
    same: dayElement,
    support: getSupportElement(dayElement),
    authority: getControlledBy(dayElement),
    expression: GENERATES[dayElement],
    wealth: CONTROLS[dayElement],
  };
}

function getStructureElementByGod(dayElement: ElementName, god: string) {
  const roles = getRoleElements(dayElement);

  if (god.startsWith("Paralelo") || god === "Mestre do Dia") {
    return roles.same;
  }

  if (god.startsWith("Sustentacao")) {
    return roles.support;
  }

  if (god.startsWith("Producao")) {
    return roles.expression;
  }

  if (god.startsWith("Riqueza")) {
    return roles.wealth;
  }

  return roles.authority;
}

function getVisibleStemCount(chart: BaziChart, targets: ElementName[]) {
  return getVisiblePillars(chart).filter((pillar) => targets.includes(pillar.stemElement)).length;
}

function getElementShare(chart: BaziChart, targets: ElementName[]) {
  return targets.reduce(
    (sum, element) => sum + (chart.analysis.elementDiagnostics[element]?.percent ?? 0),
    0
  );
}

function assessStructureIntegrity(
  chart: BaziChart,
  candidateElement: ElementName,
  season: string
) {
  const candidate = chart.analysis.elementDiagnostics[candidateElement];
  const controller = getControlledBy(candidateElement);
  const controllerProfile = chart.analysis.elementDiagnostics[controller];
  const protector = getSupportElement(candidateElement);
  const seasonSupport = isElementSeasonallySupported(candidateElement, season);
  const rooted = branchHasRootForElement(chart, candidateElement);
  const broken =
    (!rooted && controllerProfile.total >= candidate.total + 10) ||
    (!seasonSupport && controllerProfile.percent >= candidate.percent + 12) ||
    (candidate.total <= 8 && controllerProfile.total > candidate.total);

  return {
    broken,
    protector,
    note: broken
      ? `${candidateElement} esta sob pressao de ${controller} e precisa de ${protector} para proteger a estrutura`
      : `${candidateElement} permanece amparado por raiz e estacao suficientes para sustentar a estrutura`,
  };
}

function buildStructureProfile(chart: BaziChart, season: string): StructureProfile {
  const monthPillar = chart.pillars.find((pillar) => pillar.key === "month");
  const monthCommandGod = monthPillar?.hiddenGods[0] ?? monthPillar?.tenGod ?? "Mestre do Dia";
  const baseStructure = STRUCTURE_BY_TEN_GOD[monthCommandGod] ?? "Zheng Ge";
  const schoolPolicy = getStructureSchoolPolicy(chart.input.schoolMode);
  const roles = getRoleElements(chart.dayMaster.element);
  const supportiveElements = [roles.same, roles.support];
  const hostileElements = [roles.expression, roles.wealth, roles.authority];
  const lead = chart.elementScores[0];
  const second = chart.elementScores[1];
  const strength = chart.analysis.strength;
  const roots = strength.directRoots;
  const supportRoots = strength.supportRoots;
  const visibleSupportive = getVisibleStemCount(chart, supportiveElements);
  const visibleHostile = getVisibleStemCount(chart, hostileElements);
  const supportiveClusterShare = getElementShare(chart, supportiveElements);
  const hostileClusterShare = getElementShare(chart, hostileElements);
  const hostileDominants = chart.elementScores
    .filter((item) => hostileElements.includes(item.element))
    .map((item) => item.element);
  const dominantFollowerElements = hostileDominants.slice(0, 2);
  const structureElement = getStructureElementByGod(chart.dayMaster.element, monthCommandGod);
  const transformations = buildTransformationAssessment(chart, season);
  const transformedElement = transformations.strongestElement;
  const transformationSignature = transformedElement
    ? transformations.trueTransforms.some((line) => line.includes(transformedElement))
    : false;
  const repeatedTransformation = transformedElement
    ? transformations.transformedElements.filter((element) => element === transformedElement).length
    : 0;
  const noSupportOutsideCore =
    visibleSupportive <= 1 &&
    roots.length === 0 &&
    supportRoots.length === 0 &&
    (chart.analysis.elementDiagnostics[roles.support]?.total ?? 0) <= 8;
  const hostileCoalitionStrong =
    hostileClusterShare >= 60 &&
    !supportiveElements.includes(lead.element) &&
    !supportiveElements.includes(second?.element ?? lead.element);
  const followerCandidate =
    chart.dayMaster.strength <= 32 &&
    strength.supportiveShare <= 32 &&
    !strength.deLing &&
    noSupportOutsideCore &&
    hostileCoalitionStrong;
  const vibrantCandidate =
    chart.dayMaster.strength >= 72 &&
    strength.supportiveShare >= 68 &&
    strength.hostileShare <= 28 &&
    visibleHostile <= 1 &&
    roots.length >= 2 &&
    strength.deLing &&
    supportiveClusterShare >= 62 &&
    supportiveElements.includes(lead.element);
  const huaCandidate =
    Boolean(transformedElement) &&
    transformationSignature &&
    (repeatedTransformation >= 2 ||
      chart.analysis.dominantElement === transformedElement ||
      chart.analysis.monthCommand.element === transformedElement) &&
    chart.dayMaster.strength >= 36 &&
    chart.dayMaster.strength <= 68;
  const structureFocus =
    followerCandidate
      ? dominantFollowerElements[0] ?? lead.element
      : vibrantCandidate
        ? lead.element
        : huaCandidate
          ? transformedElement ?? structureElement
          : structureElement;
  const integrity = assessStructureIntegrity(chart, structureFocus, season);
  const congScore = clampScore(
    (chart.dayMaster.strength <= 32 ? 26 : chart.dayMaster.strength <= 38 ? 12 : 0) +
      (strength.supportiveShare <= 32 ? 22 : strength.supportiveShare <= 38 ? 10 : 0) +
      (!strength.deLing ? 12 : -6) +
      (noSupportOutsideCore ? 16 : 0) +
      (hostileCoalitionStrong ? 16 : 0) +
      (visibleHostile > visibleSupportive ? 8 : 0) +
      schoolPolicy.scoreBias.cong
  );
  const huaScore = clampScore(
    (transformedElement ? 18 : 0) +
      (transformationSignature ? 24 : 0) +
      (repeatedTransformation >= 2 ? 18 : repeatedTransformation === 1 ? 8 : 0) +
      (chart.analysis.dominantElement === transformedElement ? 14 : 0) +
      (chart.analysis.monthCommand.element === transformedElement ? 14 : 0) +
      (chart.dayMaster.strength >= 36 && chart.dayMaster.strength <= 68 ? 12 : 0) +
      schoolPolicy.scoreBias.hua
  );
  const zhuanScore = clampScore(
    (chart.dayMaster.strength >= 72 ? 24 : chart.dayMaster.strength >= 66 ? 12 : 0) +
      (strength.supportiveShare >= 68 ? 20 : strength.supportiveShare >= 60 ? 10 : 0) +
      (strength.hostileShare <= 28 ? 12 : strength.hostileShare <= 34 ? 6 : 0) +
      (visibleHostile <= 1 ? 10 : 0) +
      (roots.length >= 2 ? 12 : roots.length === 1 ? 5 : 0) +
      (strength.deLing ? 10 : 0) +
      (supportiveClusterShare >= 62 ? 12 : supportiveClusterShare >= 56 ? 6 : 0) +
      schoolPolicy.scoreBias.zhuan
  );
  const scoreMap = [
    { name: "Cong Ge", score: congScore },
    { name: transformedElement ? `Hua Ge em ${transformedElement}` : "Hua Ge", score: huaScore },
    { name: "Zhuan Wang Ge", score: zhuanScore },
  ].sort((left, right) => right.score - left.score);
  const confidence = scoreToConfidence(scoreMap[0].score);
  const visibleBranches = getVisiblePillars(chart).map((pillar) => pillar.branch);
  const branchCount = (targets: string[]) =>
    visibleBranches.filter((branch) => targets.includes(branch)).length;
  const hasFullSet = (targets: string[]) => targets.every((branch) => visibleBranches.includes(branch));
  const metalPercent = chart.analysis.elementDiagnostics.Metal.percent;
  const waterPercent = chart.analysis.elementDiagnostics.Agua.percent;
  const woodPercent = chart.analysis.elementDiagnostics.Madeira.percent;
  const firePercent = chart.analysis.elementDiagnostics.Fogo.percent;
  const earthPercent = chart.analysis.elementDiagnostics.Terra.percent;
  const evidence = [
    `Apoio do Mestre ${strength.supportiveShare}% vs desgaste ${strength.hostileShare}%`,
    `Raizes diretas ${roots.length} e raizes de apoio ${supportRoots.length}`,
    `De Ling ${strength.deLing ? "sim" : "nao"} | De Di ${strength.deDi ? "sim" : "nao"} | De Shi ${strength.deShi ? "sim" : "nao"}`,
    `Pureza do bloco de apoio ${supportiveClusterShare}% | pureza do bloco que drena/controla ${hostileClusterShare}%`,
    `Gate estrutural da escola: regular ${schoolPolicy.regularThreshold}+ | especial ${schoolPolicy.specialThreshold}+`,
    transformedElement
      ? `Transformacao dominante em ${transformedElement}: ${transformations.integrity.toLowerCase()}`
      : "Sem transformacao dominante fechada acima do resto do mapa",
  ];
  const specials: string[] = [];

  if (followerCandidate && congScore >= schoolPolicy.specialThreshold) {
    specials.push("Cong Ge");
  }

  if (huaCandidate && transformedElement && huaScore >= schoolPolicy.specialThreshold) {
    specials.push(`Hua Ge em ${transformedElement}`);
  }

  if (vibrantCandidate && zhuanScore >= schoolPolicy.specialThreshold) {
    specials.push("Zhuan Wang Ge");
  }

  const buildCatalogStatus = (
    score: number,
    threshold: number,
    coverage: StructureCatalogRow["coverage"]
  ) => {
    if (score >= threshold) {
      return "Passou";
    }
    if (score >= threshold - 10) {
      return "Concorrente";
    }
    if (score >= 32) {
      return "Indicio parcial";
    }
    return coverage === "catalogada" ? "Catalogada / sem gate forte" : "Nao passou";
  };

  const buildCatalogRow = (
    name: string,
    score: number,
    coverage: StructureCatalogRow["coverage"],
    note: string,
    threshold: number
  ): StructureCatalogRow => ({
    name,
    score,
    coverage,
    note,
    status: buildCatalogStatus(score, threshold, coverage),
    confidence: scoreToConfidence(score),
  });

  const quZhiScore = clampScore(
    (chart.dayMaster.element === "Madeira" ? 30 : 0) +
      (branchCount(["å¯…", "å¯", "è¾°"]) >= 2 ? 18 : branchCount(["å¯…", "å¯", "è¾°"]) === 1 ? 8 : 0) +
      (hasFullSet(["äº¥", "å¯", "æœª"]) ? 22 : 0) +
      (supportiveClusterShare >= 60 ? 12 : supportiveClusterShare >= 52 ? 6 : 0) +
      (metalPercent <= 10 ? 12 : metalPercent <= 18 ? 4 : 0) +
      (vibrantCandidate ? 8 : 0)
  );
  const yanShangScore = clampScore(
    (chart.dayMaster.element === "Fogo" ? 30 : 0) +
      (branchCount(["å·³", "åˆ", "æœª"]) >= 2 ? 18 : branchCount(["å·³", "åˆ", "æœª"]) === 1 ? 8 : 0) +
      (hasFullSet(["å¯…", "åˆ", "æˆŒ"]) ? 22 : 0) +
      (supportiveClusterShare >= 60 ? 12 : supportiveClusterShare >= 52 ? 6 : 0) +
      (waterPercent <= 10 ? 12 : waterPercent <= 18 ? 4 : 0) +
      (vibrantCandidate ? 8 : 0)
  );
  const jiaSeScore = clampScore(
    (chart.dayMaster.element === "Terra" ? 30 : 0) +
      (branchCount(["è¾°", "æˆŒ", "ä¸‘", "æœª"]) >= 2
        ? 18
        : branchCount(["è¾°", "æˆŒ", "ä¸‘", "æœª"]) === 1
          ? 8
          : 0) +
      (firePercent >= 22 ? 12 : firePercent >= 16 ? 6 : 0) +
      (woodPercent <= 10 ? 12 : woodPercent <= 18 ? 4 : 0) +
      (lead.element === "Terra" ? 8 : 0)
  );
  const congGeMetalScore = clampScore(
    (chart.dayMaster.element === "Metal" ? 30 : 0) +
      (branchCount(["ç”³", "é…‰", "æˆŒ"]) >= 2 ? 18 : branchCount(["ç”³", "é…‰", "æˆŒ"]) === 1 ? 8 : 0) +
      (hasFullSet(["å·³", "é…‰", "ä¸‘"]) ? 22 : 0) +
      (supportiveClusterShare >= 60 ? 12 : supportiveClusterShare >= 52 ? 6 : 0) +
      (firePercent <= 10 ? 12 : firePercent <= 18 ? 4 : 0) +
      (vibrantCandidate ? 8 : 0)
  );
  const runXiaScore = clampScore(
    (chart.dayMaster.element === "Agua" ? 30 : 0) +
      (branchCount(["äº¥", "å­", "ä¸‘"]) >= 2 ? 18 : branchCount(["äº¥", "å­", "ä¸‘"]) === 1 ? 8 : 0) +
      (hasFullSet(["ç”³", "å­", "è¾°"]) ? 22 : 0) +
      (supportiveClusterShare >= 60 ? 12 : supportiveClusterShare >= 52 ? 6 : 0) +
      (earthPercent <= 10 ? 12 : earthPercent <= 18 ? 4 : 0) +
      (vibrantCandidate ? 8 : 0)
  );

  const regularCatalog = Object.entries(STRUCTURE_BY_TEN_GOD)
    .filter(([, name]) => name !== "Ri Zhu Ge")
    .map(([god, name]) => {
      const candidateElement = getStructureElementByGod(chart.dayMaster.element, god);
      const seasonSupport = isElementSeasonallySupported(candidateElement, season);
      const rooted = branchHasRootForElement(chart, candidateElement);
      const dominantTouch =
        chart.analysis.dominantElement === candidateElement ||
        chart.analysis.monthCommand.element === candidateElement;
      const score = clampScore(
        (baseStructure === name ? 58 : 0) +
          (monthCommandGod === god ? 16 : 0) +
          (structureElement === candidateElement ? 8 : 0) +
          (seasonSupport ? 8 : 0) +
          (rooted ? 8 : 0) +
          (dominantTouch ? 6 : 0) +
          schoolPolicy.scoreBias.regular
      );

      return buildCatalogRow(
        name,
        score,
        "direta",
        `${monthCommandGod === god ? "Yue Ling/oculto principal confirma o gate" : "Yue Ling nao fecha este gate diretamente"} | elemento ${candidateElement} | ${seasonSupport ? "estacao apoia" : "estacao nao apoia"} | raiz ${rooted ? "presente" : "ausente"}`,
        schoolPolicy.regularThreshold
      );
    });

  const heuristicCatalog = [
    buildCatalogRow(
      "Jian Lu Ge",
      clampScore(
        (monthPillar?.qiPhase === "Prosperidade" ? 56 : 0) +
          (monthPillar?.tenGod.startsWith("Paralelo") ? 8 : 0) +
          (chart.dayMaster.strength >= 62 ? 10 : 0) +
          (strength.deLing ? 8 : 0) +
          (roots.length >= 1 ? 8 : 0)
      ),
      "heuristica",
      `Baseado no Yue Ling em fase de Prosperidade (Lin Guan) para o Mestre do Dia. Mes ${monthPillar?.ganZhi ?? "--"} | fase ${monthPillar?.qiPhase ?? "--"} | Dez Deus ${monthPillar?.tenGod ?? "--"}.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Yang Ren Ge",
      clampScore(
        ((monthPillar?.qiPhase === "Apogeu" && chart.dayMaster.polarity === "Yang")
          ? 54
          : 0) +
          ((monthPillar?.tenGod === "Paralelo Injusto" ||
          monthPillar?.hiddenGods.includes("Paralelo Injusto"))
          ? 10
          : 0) +
          (chart.dayMaster.strength >= 66 ? 12 : 0) +
          (roots.length >= 1 ? 8 : 0)
      ),
      "heuristica",
      `Procura Yue Ling em Apogeu (Di Wang) para troncos Yang e exposicao forte de Jie Cai/Yang Ren no Mes. Fase ${monthPillar?.qiPhase ?? "--"} | ocultos ${monthPillar?.hiddenGods.join("/") || "--"}.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Cong Cai Ge",
      clampScore(
        (followerCandidate && dominantFollowerElements.includes(roles.wealth) ? congScore + 8 : 0) +
          (lead.element === roles.wealth ? 12 : 0)
      ),
      "heuristica",
      `Segue bloco de riqueza quando o Mestre enfraquece e a frente dominante e ${roles.wealth}. Dominantes ${dominantFollowerElements.join("/") || "--"}.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Cong Guan/Sha Ge",
      clampScore(
        (followerCandidate && dominantFollowerElements.includes(roles.authority) ? congScore + 8 : 0) +
          (lead.element === roles.authority ? 12 : 0)
      ),
      "heuristica",
      `Segue autoridade/pressao quando o Mestre perde base e o bloco dominante puxa ${roles.authority}.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Cong Er Ge",
      clampScore(
        (followerCandidate && dominantFollowerElements.includes(roles.expression) ? congScore + 8 : 0) +
          (lead.element === roles.expression ? 12 : 0)
      ),
      "heuristica",
      `Segue output quando expressao ${roles.expression} domina o conjunto e o Mestre nao consolida raiz propria.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Cong Qiang Ge",
      clampScore((vibrantCandidate ? zhuanScore + 4 : 0) + (lead.element === roles.same ? 10 : 0)),
      "heuristica",
      `Assinatura de Mestre muito forte e bloco de apoio concentrado em ${roles.same}/${roles.support}.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Cong Ruo Ge",
      clampScore((followerCandidate ? congScore : 0) + (noSupportOutsideCore ? 10 : 0)),
      "heuristica",
      `Assinatura de Mestre muito fraco, pouco recurso proprio e tendencia a seguir o ambiente dominante.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Hua Qi Ge",
      clampScore((huaCandidate && transformedElement ? huaScore + 4 : 0)),
      "heuristica",
      `Depende de transformacao dominante coerente. Elemento transformado: ${transformedElement ?? "--"}.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Zhuan Wang Ge",
      zhuanScore,
      "heuristica",
      `Concentra forca extrema no bloco do Mestre, com pureza ${supportiveClusterShare}% e raiz ${roots.length}.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Qu Zhi Ge",
      quZhiScore,
      "heuristica",
      `Madeira dominante com eixo leste (Yin-Mao-Chen) ou triplicidade Hai-Mao-Wei, pedindo ausencia de Metal forte. Ramos ativos ${visibleBranches.join("/")} | Metal ${metalPercent}%.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Yan Shang Ge",
      yanShangScore,
      "heuristica",
      `Fogo dominante com eixo sul (Si-Wu-Wei) ou triplicidade Yin-Wu-Xu, pedindo ausencia de Agua forte. Ramos ativos ${visibleBranches.join("/")} | Agua ${waterPercent}%.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Jia Se Ge",
      jiaSeScore,
      "heuristica",
      `Terra dominante com armazens Chen-Xu-Chou-Wei e suporte de Fogo, pedindo baixa pressao de Madeira. Terra ${earthPercent}% | Fogo ${firePercent}% | Madeira ${woodPercent}%.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Cong Ge (Metal dominante)",
      congGeMetalScore,
      "heuristica",
      `Metal dominante com eixo oeste (Shen-You-Xu) ou triplicidade Si-You-Chou, pedindo baixa pressao de Fogo. Metal ${metalPercent}% | Fogo ${firePercent}%.`,
      schoolPolicy.specialThreshold
    ),
    buildCatalogRow(
      "Run Xia Ge",
      runXiaScore,
      "heuristica",
      `Agua dominante com eixo norte (Hai-Zi-Chou) ou triplicidade Shen-Zi-Chen, pedindo baixa pressao de Terra. Agua ${waterPercent}% | Terra ${earthPercent}%.`,
      schoolPolicy.specialThreshold
    ),
  ];

  const catalog = [...regularCatalog, ...heuristicCatalog].sort((left, right) => right.score - left.score);
  const regularStructureNames = new Set(Object.values(STRUCTURE_BY_TEN_GOD));
  const acceptedStructures = catalog
    .filter((row) => row.status === "Passou")
    .map((row) => row.name);
  const selectedStructure = specials[0] ?? acceptedStructures[0] ?? baseStructure;
  const extraSpecialAccepted = catalog
    .filter((row) => row.status === "Passou" && !regularStructureNames.has(row.name))
    .map((row) => row.name);
  const specialStructureLabels = [...new Set([...specials, ...extraSpecialAccepted])];

  return {
    summary: specialStructureLabels.length
      ? `${selectedStructure} com base em ${baseStructure} (${integrity.broken ? "estrutura sob tensao" : "estrutura formada"})`
      : `${baseStructure} / Zheng Ge com pulso ${chart.dayMaster.tone.toLowerCase()} (${integrity.broken ? "sob tensao" : "formado"})`,
    selectedStructure,
    zhengGe: `${baseStructure} derivado do Yue Ling (${monthCommandGod}), com foco em ${structureElement}, Mestre em ${strength.stateLabel} e apoio de ${strength.supportiveShare}%`,
    congGe: followerCandidate
      ? `Sim. O Mestre nao recebe base suficiente, nao mostra raiz limpa e segue ${dominantFollowerElements.join(" / ") || lead.element} com pureza aproximada de ${hostileClusterShare}%`
      : "Nao ha assinatura suficientemente pura de seguimento integral do bloco dominante",
    huaGe: huaCandidate && transformedElement
      ? `Sim. A energia converge para ${transformedElement}, com ${transformations.integrity.toLowerCase()}`
      : transformedElement
        ? `Existe tendencia de mistura em ${transformedElement}, mas ainda sem fechamento classico completo`
        : "Sem assinatura suficiente para Hua Ge pleno",
    zhuanWangGe: vibrantCandidate
      ? `Sim. O bloco ${lead.element} domina com pureza de ${supportiveClusterShare}%, raiz forte e apoio estacional`
      : "Sem predominio extremo e suficientemente puro do bloco do Mestre neste recorte",
    specialStructures: specialStructureLabels.length
      ? specialStructureLabels.join(" | ")
      : `Estrutura regular de ${baseStructure} sem Ge especial fechado acima de ${season.toLowerCase()}`,
    formedState: integrity.broken ? "Po Ge / estrutura sob tensao" : "Cheng Ge / estrutura formada",
    integrityNote: integrity.note,
    schoolBias: schoolPolicy.label,
    regularThreshold: schoolPolicy.regularThreshold,
    specialThreshold: schoolPolicy.specialThreshold,
    structureElement,
    protectorElement: integrity.protector,
    transformedElement: huaCandidate ? transformedElement : undefined,
    dominantFollowerElements,
    supportivePurity: supportiveClusterShare,
    hostilePurity: hostileClusterShare,
    broken: integrity.broken,
    confidence,
    evidence,
    scoreMap,
    catalog,
  };
}

function branchHasRootForElement(chart: BaziChart, element: ElementName) {
  return branchRootsForElement(chart, element).length > 0;
}

function isElementSeasonallySupported(element: ElementName, season: string) {
  return ["旺", "相"].includes(getElementState(element, season));
}

function buildTransformationAssessment(chart: BaziChart, season: string): TransformationAssessment {
  const stemPairs = buildStemCombinationPairs(chart);
  const pillars = getVisiblePillars(chart);
  const formations: string[] = [];
  const stemTransforms: string[] = [];
  const trueTransforms: string[] = [];
  const conditionalTransforms: string[] = [];
  const transformedElements: ElementName[] = [];
  const blockers = new Set<string>();

  SAN_HE_GROUPS.forEach((group) => {
    if (group.members.every((branch) => pillars.some((pillar) => pillar.branch === branch))) {
      const seasonSupport = isElementSeasonallySupported(group.element, season);
      formations.push(
        `San He completo em ${group.element}: ${group.members.join("-")} (${seasonSupport ? "favorecido pela estacao" : "fora de estacao"})`
      );
      transformedElements.push(group.element);

      if (seasonSupport) {
        trueTransforms.push(`San He ${group.members.join("-")} -> ${group.element}`);
      } else {
        conditionalTransforms.push(`San He ${group.members.join("-")} -> ${group.element}`);
      }
    }
  });

  SAN_HUI_GROUPS.forEach((group) => {
    if (group.members.every((branch) => pillars.some((pillar) => pillar.branch === branch))) {
      const seasonSupport = isElementSeasonallySupported(group.element, season);
      formations.push(
        `San Hui completo em ${group.element}: ${group.members.join("-")} (${seasonSupport ? "favorecido pela estacao" : "fora de estacao"})`
      );
      transformedElements.push(group.element);

      if (seasonSupport) {
        trueTransforms.push(`San Hui ${group.members.join("-")} -> ${group.element}`);
      } else {
        conditionalTransforms.push(`San Hui ${group.members.join("-")} -> ${group.element}`);
      }
    }
  });

  for (let index = 0; index < pillars.length; index += 1) {
    for (let inner = index + 1; inner < pillars.length; inner += 1) {
      const pair = normalizePair(pillars[index].branch, pillars[inner].branch);

      if (!BRANCH_LIU_HE.has(pair)) {
        continue;
      }

      const result = LIU_HE_TRANSFORMS[pair];

      if (!result) {
        continue;
      }

      const seasonSupport = isElementSeasonallySupported(result, season);
      const rooted = branchHasRootForElement(chart, result);
      formations.push(
        `${pillars[index].label} + ${pillars[inner].label}: Liu He em ${result} (${seasonSupport || rooted ? "ganha corpo" : "fica parcial"})`
      );
      transformedElements.push(result);

      if (seasonSupport && rooted) {
        trueTransforms.push(`${pillars[index].label} + ${pillars[inner].label} -> ${result}`);
      } else {
        conditionalTransforms.push(`${pillars[index].label} + ${pillars[inner].label} -> ${result}`);
        if (!seasonSupport) {
          blockers.add(`Liu He ${pillars[index].branch}-${pillars[inner].branch}: ${result} fora de estacao`);
        }
        if (!rooted) {
          blockers.add(`Liu He ${pillars[index].branch}-${pillars[inner].branch}: ${result} sem raiz suficiente`);
        }
      }
    }
  }

  stemPairs.forEach((pair) => {
    const resultProfile = chart.analysis.elementDiagnostics[pair.result];
    const controller = getControlledBy(pair.result);
    const seasonSupport = isElementSeasonallySupported(pair.result, season);
    const rooted = branchHasRootForElement(chart, pair.result);
    const blocked = chart.analysis.elementDiagnostics[controller].total > resultProfile.total + 10;
    const truth = seasonSupport && rooted && !blocked;
    const conditional = (seasonSupport || rooted) && !blocked;

    stemTransforms.push(
      `${pair.labels[0]} + ${pair.labels[1]} -> ${pair.result} (estacao ${seasonSupport ? "favorece" : "nao favorece"}, raiz ${rooted ? "presente" : "ausente"}, pressao de ${controller} ${blocked ? "alta" : "administravel"}; ${truth ? "transformacao verdadeira provavel" : conditional ? "transformacao condicional" : "combinacao sem transformacao plena"})`
    );
    transformedElements.push(pair.result);

    if (truth) {
      trueTransforms.push(`${pair.labels[0]} + ${pair.labels[1]} -> ${pair.result}`);
    } else if (conditional) {
      conditionalTransforms.push(`${pair.labels[0]} + ${pair.labels[1]} -> ${pair.result}`);
      if (!seasonSupport) {
        blockers.add(`${pair.result}: estacao nao confirma a combinacao de Troncos`);
      }
      if (!rooted) {
        blockers.add(`${pair.result}: falta raiz para consolidar a transformacao`);
      }
      if (blocked) {
        blockers.add(`${pair.result}: ${controller} bloqueia a transformacao por excesso de controle`);
      }
    } else {
      if (!seasonSupport) {
        blockers.add(`${pair.result}: estacao desfavoravel`);
      }
      if (!rooted) {
        blockers.add(`${pair.result}: ausencia de raiz`);
      }
      if (blocked) {
        blockers.add(`${pair.result}: controlador ${controller} mais forte que o resultado`);
      }
    }
  });

  const rankedTransforms = [...new Set(transformedElements)].sort((left, right) => {
    const leftCount = transformedElements.filter((element) => element === left).length;
    const rightCount = transformedElements.filter((element) => element === right).length;
    const byCount = rightCount - leftCount;

    if (byCount !== 0) {
      return byCount;
    }

    return (
      (chart.analysis.elementDiagnostics[right]?.total ?? 0) -
      (chart.analysis.elementDiagnostics[left]?.total ?? 0)
    );
  });

  return {
    formations,
    stemTransforms,
    trueTransforms,
    conditionalTransforms,
    transformedElements,
    strongestElement: rankedTransforms[0],
    integrity: trueTransforms.length
      ? "Transformacao com raiz e estacao suficientes para leitura forte"
      : conditionalTransforms.length
        ? "Transformacao parcial: ainda depende de consolidacao por estacao, raiz ou ciclo"
        : "Sem transformacao fechada acima das combinacoes aparentes",
    blockers: [...blockers],
    dominantNarrative: rankedTransforms[0]
      ? `${rankedTransforms[0]} lidera a tentativa de transformacao; ${trueTransforms.length ? "ha fechamento tecnico relevante" : conditionalTransforms.length ? "o fechamento ainda e parcial" : "a energia ainda nao se fixa"}.`
      : "Nenhum eixo de transformacao dominou o suficiente para reorganizar o mapa.",
  };
}

function getTiaoHou(chart: BaziChart, season: string): TiaoHouProfile {
  const seasonalYong: Record<string, ElementName> = {
    Primavera: "Fogo",
    Verao: "Agua",
    Outono: "Fogo",
    Inverno: "Fogo",
  };

  return {
    climate: chart.analysis.climate.dominant,
    yongShen: seasonalYong[season] ?? "Fogo",
    note: chart.analysis.climate.advice,
  };
}

function finalizeUsefulGodSet(
  set: Omit<UsefulGodSet, "tiaoHou" | "priority" | "warnings">,
  structure: StructureProfile,
  tiaoHou: TiaoHouProfile
): UsefulGodSet {
  const priority = [...new Set([set.yong, set.xi, tiaoHou.yongShen, set.xian])];
  const warnings = [
    set.yong !== tiaoHou.yongShen
      ? `Tiao Hou continua pedindo ${tiaoHou.yongShen} como regulador climatico`
      : "",
    structure.broken
      ? `Estrutura sob tensao: ${structure.protectorElement} precisa proteger ${set.yong}`
      : "",
  ].filter(Boolean);

  if (!structure.broken || set.yong === structure.protectorElement) {
    return {
      ...set,
      tiaoHou,
      priority,
      warnings,
    };
  }

  return {
    yong: structure.protectorElement,
    xi: set.yong,
    ji: set.ji,
    chou: pickDistinctElement(
      [set.chou, getControlledBy(structure.protectorElement)],
      [set.ji],
      set.chou
    ),
    xian: set.xian,
    tiaoHou,
    note: `${set.note}. Como a estrutura esta sob tensao, ${structure.protectorElement} passa a proteger o elemento util original ${set.yong}.`,
    originalYong: set.yong,
    priority: [...new Set([structure.protectorElement, set.yong, set.xi, tiaoHou.yongShen, set.xian])],
    warnings: [
      ...warnings,
      `Elemento util original deslocado para segundo plano: ${set.yong}`,
    ],
  };
}

function getUsefulGodSet(chart: BaziChart, season: string): UsefulGodSet {
  const { same, support, authority, expression, wealth } = getRoleElements(chart.dayMaster.element);
  const strength = chart.analysis.strength;
  const tiaoHou = getTiaoHou(chart, season);
  const structure = buildStructureProfile(chart, season);
  const favored = chart.analysis.favorableElements;
  const unfavored = chart.analysis.unfavorableElements;
  const transformed = structure.transformedElement;

  if (structure.specialStructures.includes("Cong Ge")) {
    const yong =
      structure.dominantFollowerElements[0] ?? chart.elementScores[0]?.element ?? tiaoHou.yongShen;
    const xi = pickDistinctElement(
      [structure.dominantFollowerElements[1] ?? GENERATES[yong], GENERATES[yong], ...favored],
      [yong],
      GENERATES[yong]
    );
    return finalizeUsefulGodSet(
      {
        yong,
        xi,
        ji: same,
        chou: support,
        xian: pickDistinctElement(
          [tiaoHou.yongShen as ElementName, expression],
          [yong, xi],
          expression
        ),
        note: "Mapa com assinatura de seguimento: os elementos que sustentam o bloco dominante tornam-se os mais uteis",
      },
      structure,
      tiaoHou
    );
  }

  if (structure.specialStructures.includes("Zhuan Wang Ge")) {
    const yong = structure.structureElement;
    const xi = pickDistinctElement([GENERATES[yong], yong, ...favored], [yong], GENERATES[yong]);
    return finalizeUsefulGodSet(
      {
        yong,
        xi,
        ji: getControlledBy(yong),
        chou: pickDistinctElement(
          [CONTROLS[yong], ...unfavored],
          [getControlledBy(yong)],
          CONTROLS[yong]
        ),
        xian: pickDistinctElement(
          [tiaoHou.yongShen as ElementName, support],
          [yong, xi],
          support
        ),
        note: "Mapa de predominio puro: os elementos que mantem a vibracao principal sao priorizados antes de qualquer tentativa de enfraquecimento",
      },
      structure,
      tiaoHou
    );
  }

  if (transformed && structure.specialStructures.includes("Hua Ge")) {
    const yong = transformed;
    const xi = pickDistinctElement(
      [getSupportElement(transformed), GENERATES[transformed], ...favored],
      [yong],
      getSupportElement(transformed)
    );
    return finalizeUsefulGodSet(
      {
        yong,
        xi,
        ji: getControlledBy(transformed),
        chou: pickDistinctElement(
          [CONTROLS[transformed], ...unfavored],
          [getControlledBy(transformed)],
          CONTROLS[transformed]
        ),
        xian: pickDistinctElement(
          [tiaoHou.yongShen as ElementName, structure.protectorElement],
          [yong, xi],
          structure.protectorElement
        ),
        note: "Mapa de transformacao: o elemento transformado e o eixo principal, desde que raiz e estacao o sustentem",
      },
      structure,
      tiaoHou
    );
  }

  if (strength.tone === "Forte") {
    const yong = pickDistinctElement(favored, [same, support], wealth);
    const xi = pickDistinctElement([authority, expression, ...favored], [yong], authority);
    return finalizeUsefulGodSet(
      {
        yong,
        xi,
        ji: pickDistinctElement(unfavored, [], same),
        chou: pickDistinctElement([support, same, ...unfavored], [same], support),
        xian: pickDistinctElement(
          [expression, tiaoHou.yongShen as ElementName],
          [yong, xi],
          expression
        ),
        note: "Mestre forte: prioriza-se drenagem, riqueza ou autoridade que reduzam o excesso sem quebrar a estrutura",
      },
      structure,
      tiaoHou
    );
  }

  if (strength.tone === "Fraco") {
    const yong = pickDistinctElement([support, same, ...favored], [], support);
    const xi = pickDistinctElement([same, support, ...favored], [yong], same);
    return finalizeUsefulGodSet(
      {
        yong,
        xi,
        ji: pickDistinctElement(unfavored, [], wealth),
        chou: pickDistinctElement([authority, expression, ...unfavored], [wealth], authority),
        xian: pickDistinctElement(
          [tiaoHou.yongShen as ElementName, expression],
          [yong, xi],
          expression
        ),
        note: "Mestre fraco: recurso e paridade estabilizam o centro antes de expor o mapa a riqueza, poder ou vazamento",
      },
      structure,
      tiaoHou
    );
  }

  const neutralYong = pickDistinctElement(favored, [], tiaoHou.yongShen as ElementName);
  return finalizeUsefulGodSet(
    {
      yong: neutralYong,
      xi: pickDistinctElement([expression, support, ...favored], [neutralYong], expression),
      ji: pickDistinctElement(unfavored, [], authority),
      chou: pickDistinctElement([same, support, ...unfavored], [authority], same),
      xian: pickDistinctElement(
        [tiaoHou.yongShen as ElementName, expression],
        [neutralYong],
        expression
      ),
      note: "Mapa intermediario: clima, estrutura e distribuicao elemental dividem a definicao do ajuste mais util",
    },
    structure,
    tiaoHou
  );
}

function formatPillarLabel(pillar: Pillar) {
  return `${pillar.label} ${pillar.ganZhi} ${pillar.animal}`;
}

function describePillar(pillar: Pillar) {
  return `${pillar.ganZhi} | ${pillar.tenGod} | ${pillar.stemElement}/${pillar.branchElement} | ocultos ${pillar.hiddenStems.join("/") || "--"} | Na Yin ${pillar.naYin} | Kong Wang ${pillar.xunKong || "--"} | Chang Sheng ${pillar.qiPhase}`;
}

function boolLabel(value: boolean) {
  return value ? "sim" : "nao";
}

function pillarContainsElement(pillar: Pillar, element: ElementName) {
  return (
    pillar.stemElement === element ||
    pillar.branchElement === element ||
    pillar.hiddenStems.some((stem) => getStemMeta(stem)?.element === element)
  );
}

function getPillarDomainNote(pillar: Pillar, structure: StructureProfile) {
  switch (pillar.key) {
    case "year":
      return "Dominio: origem, ancestralidade, reputacao inicial e ambiente social.";
    case "month":
      return `Dominio: Yue Ling, carreira e meio social | estrutura de referencia ${structure.summary}.`;
    case "day":
      return "Dominio: Mestre do Dia, eixo intimo e palacio do conjuge.";
    case "hour":
      return "Dominio: filhos, projetos, producao tardia e legado.";
    default:
      return "Dominio: camada complementar do campo de qi.";
  }
}

function getPillarEffectNote(chart: BaziChart, pillar: Pillar) {
  const dayElement = chart.dayMaster.element;
  const support = getSupportElement(dayElement);
  const output = GENERATES[dayElement];
  const wealth = CONTROLS[dayElement];
  const authority = getControlledBy(dayElement);
  const visiblePair = [pillar.stemElement, pillar.branchElement];
  const supportCount = visiblePair.filter((element) => element === dayElement || element === support).length;
  const drainCount = visiblePair.filter((element) => element === output || element === wealth).length;
  const controlCount = visiblePair.filter((element) => element === authority).length;
  const relation =
    supportCount === 2
      ? "apoio pleno"
      : supportCount >= 1 && (drainCount >= 1 || controlCount >= 1)
        ? "misto"
        : supportCount >= 1
          ? "apoio parcial"
          : controlCount >= 1 && drainCount >= 1
            ? "pressao e vazamento"
            : controlCount >= 1
              ? "controle"
              : drainCount >= 1
                ? "vazamento"
                : "neutro";

  return `Relacao com Mestre: ${relation} | suporte visivel ${supportCount} | vazamento visivel ${drainCount} | controle visivel ${controlCount} | elementos visiveis ${pillar.stemElement}/${pillar.branchElement}.`;
}

function getPillarRootNote(chart: BaziChart, pillar: Pillar) {
  const dayElement = chart.dayMaster.element;
  const support = getSupportElement(dayElement);
  const directRoot = pillar.hiddenStems.some((stem) => getStemMeta(stem)?.element === dayElement);
  const supportRoot = pillar.hiddenStems.some((stem) => getStemMeta(stem)?.element === support);

  return `Raiz do Mestre nas ocultas: direta ${boolLabel(directRoot)} | recurso ${boolLabel(
    supportRoot
  )} | ocultos ${pillar.hiddenStems.join("/") || "--"}.`;
}

function getPillarAdjustmentNote(
  pillar: Pillar,
  usefulGods: UsefulGodSet,
  structure: StructureProfile
) {
  const helpful = [usefulGods.yong, usefulGods.xi, usefulGods.xian].filter((element, index, pool) =>
    pillarContainsElement(pillar, element) ? pool.indexOf(element) === index : false
  );
  const harmful = [usefulGods.ji, usefulGods.chou].filter((element, index, pool) =>
    pillarContainsElement(pillar, element) ? pool.indexOf(element) === index : false
  );
  const structureTouch = pillarContainsElement(pillar, structure.structureElement);
  const protectorTouch = structure.broken && pillarContainsElement(pillar, structure.protectorElement);

  return `Contato com ajuste: Yong/Xi/Xian ${helpful.join("/") || "--"} | Ji/Chou ${
    harmful.join("/") || "--"
  } | elemento estrutural ${structureTouch ? structure.structureElement : "--"} | elemento protetor ${
    protectorTouch ? structure.protectorElement : "--"
  }.`;
}

function getPillarQiNote(pillar: Pillar, stars: string[]) {
  return `Qi / Chang Sheng: ${pillar.qiPhase}${
    STRONG_PHASES.has(pillar.qiPhase) ? " (fase forte)" : ""
  } | Kong Wang ${pillar.xunKong || "--"} | Shen Sha ${stars.join(", ") || "--"}.`;
}

function interpretPillarInContext(
  chart: BaziChart,
  pillar: Pillar,
  stars: string[],
  usefulGods: UsefulGodSet,
  structure: StructureProfile
) {
  return [
    getPillarDomainNote(pillar, structure),
    getPillarEffectNote(chart, pillar),
    getPillarRootNote(chart, pillar),
    getPillarAdjustmentNote(pillar, usefulGods, structure),
    getPillarQiNote(pillar, stars),
  ].join(" ");
}

function distinctElements(elements: Array<ElementName | undefined>) {
  return elements.filter(
    (element, index, pool): element is ElementName =>
      Boolean(element) && pool.indexOf(element) === index
  );
}

function distinctStrings(values: Array<string | undefined>) {
  return values.filter(
    (value, index, pool): value is string => Boolean(value) && pool.indexOf(value) === index
  );
}

function chartTouchesElement(chart: BaziChart, element: ElementName) {
  return getVisiblePillars(chart).some((pillar) => pillarContainsElement(pillar, element));
}

function getElementRoleInChart(chart: BaziChart, element: ElementName) {
  return chart.elementScores.find((item) => item.element === element)?.role ?? "campo geral do mapa";
}

function buildTemporalAdjustmentProfile(
  natalChart: BaziChart,
  periodChart: BaziChart,
  natalUseful: UsefulGodSet,
  natalStructure: StructureProfile,
  periodUseful: UsefulGodSet,
  periodStructure: StructureProfile
) {
  const rescueTargets = distinctElements([
    natalUseful.yong,
    natalUseful.xi,
    natalStructure.broken ? natalStructure.protectorElement : undefined,
  ]);
  const riskTargets = distinctElements([natalUseful.ji, natalUseful.chou]);
  const rescueHits = rescueTargets.filter((element) => chartTouchesElement(periodChart, element));
  const riskHits = riskTargets.filter((element) => chartTouchesElement(periodChart, element));
  const natalYongTouched = chartTouchesElement(periodChart, natalUseful.yong);
  const natalXiTouched = chartTouchesElement(periodChart, natalUseful.xi);
  const periodTouchesNatalStructure = chartTouchesElement(periodChart, natalStructure.structureElement);
  const transitLead = periodChart.elementScores[0]?.element ?? periodUseful.yong;
  const natalRole = getElementRoleInChart(natalChart, transitLead);
  const transitSupportsNatal =
    natalChart.analysis.favorableElements.includes(transitLead) || rescueHits.length > 0;
  const transitPressesNatal =
    natalChart.analysis.unfavorableElements.includes(transitLead) || riskHits.length > 0;
  const rescueText = rescueHits.length
    ? `Elementos de resgate no periodo: ${rescueHits.join("/")} | protetor natal ${
        natalStructure.broken && rescueHits.includes(natalStructure.protectorElement)
          ? natalStructure.protectorElement
          : "--"
      }.`
    : "Elementos de resgate no periodo: --.";
  const pressureText = riskHits.length
    ? `Elementos de pressao no periodo: ${riskHits.join("/")}.`
    : "Elementos de pressao no periodo: --.";
  const activationText =
    natalYongTouched || natalXiTouched
      ? `Eixo util natal ativado: ${[
          natalYongTouched ? `Yong ${natalUseful.yong}` : null,
          natalXiTouched ? `Xi ${natalUseful.xi}` : null,
        ]
          .filter(Boolean)
          .join(" | ")}.`
      : "Eixo util natal ativado: --.";
  const structuralText = periodTouchesNatalStructure
    ? `Elemento estrutural natal tocado: ${natalStructure.structureElement}.`
    : "Elemento estrutural natal tocado: --.";
  const diagnosis = `Saldo tecnico do periodo: apoio ${boolLabel(
    transitSupportsNatal
  )} | pressao ${boolLabel(transitPressesNatal)} | resgate ${boolLabel(
    rescueHits.length > 0
  )} | eixo dominante ${transitLead}.`;

  return {
    rescueText,
    pressureText,
    activationText,
    structuralText,
    areaText: `${transitLead} ativa sobretudo ${natalRole.toLowerCase()} no mapa natal.`,
    diagnosis,
    periodStructuralRhythm: `${periodStructure.summary} | ${periodStructure.formedState} | Yong ${periodUseful.yong}`,
  };
}

function buildJieQiList(chart: BaziChart) {
  const lunar = getLunarFromChart(chart);
  const list = lunar
    .getJieQiList()
    .map((entry) => ({
      name: JIE_QI_ALIAS[entry] ?? entry,
      date: lunar.getJieQiTable()[entry]?.toYmdHms?.() ?? "",
    }))
    .filter((entry) => entry.date);

  const unique = new Map<string, string>();
  list.forEach((entry) => {
    if (!unique.has(entry.name)) {
      unique.set(entry.name, entry.date);
    }
  });

  return [...unique.entries()].map(([name, date]) => `${name} ${date}`);
}

function getSchoolModeLabel(mode: BaziInput["schoolMode"]) {
  switch (mode) {
    case "balance-strong-weak":
      return "Equilibrio forte/fraco";
    case "geju-structure":
      return "Ge Ju / estrutura";
    case "expanded-symbolic":
      return "Shen Sha ampliado";
    case "ziping-conservative":
    default:
      return "Zi Ping conservador";
  }
}

function getSchoolModeNotes(mode: BaziInput["schoolMode"]) {
  switch (mode) {
    case "balance-strong-weak":
      return [
        "Prioridade tecnica: forca do Mestre do Dia, equilibrio de apoio vs desgaste e regulacao elemental.",
        "Xiao Yun e Shen Sha permanecem auxiliares; o nucleo decisivo fica no balanceamento forte/fraco.",
      ];
    case "geju-structure":
      return [
        "Prioridade tecnica: Yue Ling, estrutura do mapa, Cheng/Po Ge e hierarquia estrutural do Yong Shen.",
        "Transformacoes e Ge especiais recebem peso maior do que a simples balanca forte/fraco.",
        "Regras opcionais de ramos a distancia podem aparecer aqui, como Yao He e Yao Chong, quando fecham sem adjacencia.",
      ];
    case "expanded-symbolic":
      return [
        "Prioridade tecnica: base Zi Ping preservada com camada simbolica ampliada para Shen Sha e vazios temporais.",
        "Estrelas simbolicas entram como catalogo complementar, sem substituir pilares, estrutura e Yun.",
        "A camada ampliada admite relacoes opcionais como Yao He e Yao Chong para auditoria tecnica dos ramos.",
      ];
    case "ziping-conservative":
    default:
      return [
        "Prioridade tecnica: Zi Ping classico com regra conservadora para Yun, estrutura, Yong Shen e relacoes fundamentais.",
        "Shen Sha e camadas opcionais aparecem como complemento, nao como eixo principal do julgamento tecnico.",
      ];
  }
}

function splitKongWang(value: string) {
  return value
    .replace(/[^子丑寅卯辰巳午未申酉戌亥]/g, "")
    .split("")
    .filter(Boolean);
}

function buildKongWangActivationLines(
  natalChart: BaziChart,
  layers: Array<{ label: string; ganZhi: string; xunKong: string }>
) {
  const natalPillars = getVisiblePillars(natalChart);
  const lines: string[] = [];

  natalPillars.forEach((pillar) => {
    const voidBranches = splitKongWang(pillar.xunKong || "");
    if (!voidBranches.length) {
      return;
    }

    layers.forEach((layer) => {
      const branch = layer.ganZhi[1] ?? "";
      const layerVoid = splitKongWang(layer.xunKong);

      if (branch && voidBranches.includes(branch)) {
        lines.push(
          `${layer.label} ${layer.ganZhi} toca o vazio natal de ${pillar.label} (${pillar.xunKong}) no dominio ${getPillarDomainLabel(
            pillar.key
          )}; deuses ocultos do palacio ${pillar.hiddenGods.join("/") || "--"}.`
        );
      }

      if (layerVoid.includes(pillar.branch)) {
        lines.push(
          `${pillar.label} ${pillar.ganZhi} cai no Kong Wang de ${layer.label} (${layer.xunKong}) no dominio ${getPillarDomainLabel(
            pillar.key
          )}; ramo ${pillar.branch} e deuses ${pillar.hiddenGods.join("/") || "--"}.`
        );
      }
    });
  });

  return lines;
}

function buildLiuQinProfile(chart: BaziChart) {
  const visible = getVisiblePillars(chart);
  const gods = visible.flatMap((pillar) => [pillar.tenGod, ...pillar.hiddenGods]);
  const byPrefix = (prefixes: string[]) =>
    gods.filter((god) => prefixes.some((prefix) => god.startsWith(prefix)));
  const byPillar = (key: Pillar["key"]) => visible.find((pillar) => pillar.key === key);
  const monthPillar = byPillar("month");
  const dayPillar = byPillar("day");
  const hourPillar = byPillar("hour");
  const yearPillar = byPillar("year");

  return {
    father: `Convencao tecnica usada: pai pelo eixo da riqueza. Visiveis/ocultos ${byPrefix(["Riqueza"]).join("/") || "--"} | referencia de palacio ${monthPillar ? formatPillarLabel(monthPillar) : "--"}.`,
    mother: `Convencao tecnica usada: mae pelo eixo do recurso. Visiveis/ocultos ${byPrefix(["Sustentacao"]).join("/") || "--"} | referencia de palacio ${monthPillar ? formatPillarLabel(monthPillar) : "--"}.`,
    siblings: `Irmaos/pares pelo eixo de paridade. Visiveis/ocultos ${byPrefix(["Paralelo"]).join("/") || "--"} | pilar do Dia ${dayPillar ? formatPillarLabel(dayPillar) : "--"}.`,
    spouse: `Conjuge pela estrela tecnica ${chart.input.gender === "male" ? "da riqueza" : "da autoridade"}. Visiveis/ocultos ${chart.input.gender === "male" ? byPrefix(["Riqueza"]).join("/") || "--" : byPrefix(["Poder"]).join("/") || "--"} | palacio ${dayPillar ? formatPillarLabel(dayPillar) : "--"}.`,
    children: `Filhos/obras pelo eixo da expressao. Visiveis/ocultos ${byPrefix(["Producao"]).join("/") || "--"} | referencia de palacio ${hourPillar ? formatPillarLabel(hourPillar) : "--"}.`,
    authority: `Autoridade/superiores pelo eixo de poder. Visiveis/ocultos ${byPrefix(["Poder"]).join("/") || "--"} | referencia de palacio ${monthPillar ? formatPillarLabel(monthPillar) : "--"}.`,
    companions: `Amigos/concorrentes pelo eixo de paridade. Visiveis/ocultos ${byPrefix(["Paralelo"]).join("/") || "--"} | rede ampla ${yearPillar ? formatPillarLabel(yearPillar) : "--"}.`,
  };
}

function buildSpousePalaceTechnical(
  chart: BaziChart,
  spousePalace: Pillar | undefined,
  usefulGods: UsefulGodSet,
  relations: ReturnType<typeof buildBranchRelations>,
  spouseStars: string[]
) {
  if (!spousePalace) {
    return {
      summary: "--",
      star: "--",
      activation: "--",
      force: "--",
      favorability: "--",
      hidden: "--",
    };
  }

  const helpful = [usefulGods.yong, usefulGods.xi, usefulGods.xian].filter((element, index, pool) =>
    pillarContainsElement(spousePalace, element) ? pool.indexOf(element) === index : false
  );
  const harmful = [usefulGods.ji, usefulGods.chou].filter((element, index, pool) =>
    pillarContainsElement(spousePalace, element) ? pool.indexOf(element) === index : false
  );
  const shockNotes = [
    ...relations.liuChong.filter((line) => line.includes(spousePalace.label)),
    ...relations.liuHai.filter((line) => line.includes(spousePalace.label)),
    ...relations.liuPo.filter((line) => line.includes(spousePalace.label)),
    ...relations.punishments.filter((line) => line.includes(spousePalace.label)),
    ...relations.selfPunishments.filter((line) => line.includes(spousePalace.label)),
  ];
  const spouseStarLabel = chart.input.gender === "male" ? "Riqueza (Zheng Cai/Pian Cai)" : "Autoridade (Zheng Guan/Qi Sha)";

  return {
    summary: `${formatPillarLabel(spousePalace)} | elemento ${spousePalace.branchElement} | ocultos ${spousePalace.hiddenStems.join("/")} | deuses ${spousePalace.hiddenGods.join("/")} | Kong Wang ${spousePalace.xunKong || "--"} | favoravel ${helpful.join("/") || "--"} | desfavoravel ${harmful.join("/") || "--"}.`,
    star: `Estrela tecnica do conjuge pela convencao usada: ${spouseStarLabel}. Diferenca tecnica: estrela = categoria de Dez Deus; palacio = ramo do Dia e seus ocultos.`,
    activation: shockNotes.length
      ? `Ativacoes natais do palacio: ${shockNotes.join(" | ")} | Shen Sha ${spouseStars.join("/") || "--"}`
      : `Ativacoes natais do palacio: sem choque/punicao/dano/destruicao maior | Shen Sha ${spouseStars.join("/") || "--"}`,
    force: `Forca do palacio: Chang Sheng ${spousePalace.qiPhase} | elemento ${spousePalace.branchElement} | Kong Wang ${spousePalace.xunKong || "--"}`,
    favorability: `Favorabilidade tecnica: util ${helpful.join("/") || "--"} | sensivel ${harmful.join("/") || "--"}`,
    hidden: `Ocultos do palacio: ${spousePalace.hiddenStems.join("/")} | Dez Deuses ocultos ${spousePalace.hiddenGods.join("/") || "--"}`,
  };
}

function getPillarDomainLabel(key: Pillar["key"]) {
  switch (key) {
    case "year":
      return "origem/linhagem";
    case "month":
      return "pais/carreira";
    case "day":
      return "eu/conjuge";
    case "hour":
      return "filhos/legado";
    default:
      return "camada auxiliar";
  }
}

function buildMuKuStatusLine(
  chart: BaziChart,
  pillar: Pillar,
  temporalGanZhi: string[] = []
) {
  const clashBranch =
    pillar.branch === "辰"
      ? "戌"
      : pillar.branch === "戌"
        ? "辰"
        : pillar.branch === "丑"
          ? "未"
          : pillar.branch === "未"
            ? "丑"
            : "";
  const natalClash = clashBranch
    ? getVisiblePillars(chart).some((entry) => entry.branch === clashBranch)
    : false;
  const temporalClash = clashBranch ? temporalGanZhi.some((ganZhi) => ganZhi[1] === clashBranch) : false;
  const storageElements = distinctStrings(
    pillar.hiddenStems.map((stem) => getStemMeta(stem)?.element).map((element) => element ?? "")
  );
  const storageGods = distinctStrings(pillar.hiddenGods);

  return `${pillar.label} ${pillar.branch}: ${MU_KU_BRANCH_INFO[pillar.branch] ?? "--"} | elementos ${storageElements.join("/") || "--"} | deuses ${storageGods.join("/") || "--"} | aberto por choque natal ${boolLabel(
    natalClash
  )} | aberto por choque temporal ${boolLabel(temporalClash)} | Kong Wang ${pillar.xunKong || "--"}`;
}

function buildTechnicalRoleModules(
  chart: BaziChart,
  usefulGods: UsefulGodSet,
  structure: StructureProfile
) {
  const visible = getVisiblePillars(chart);
  const roles = getRoleElements(chart.dayMaster.element);
  const currentCycle = chart.currentLuck?.ganZhi
    ? buildGanZhiProfile(chart.dayMaster.stem, chart.currentLuck.ganZhi)
    : null;
  const moduleLine = (
    title: string,
    element: ElementName,
    prefixes: string[],
    extra?: string
  ) => {
    const visibleMatches = visible
      .filter((pillar) => prefixes.some((prefix) => pillar.tenGod.startsWith(prefix)))
      .map((pillar) => `${pillar.label}:${pillar.tenGod}`);
    const hiddenMatches = visible.flatMap((pillar) =>
      pillar.hiddenGods
        .filter((god) => prefixes.some((prefix) => god.startsWith(prefix)))
        .map((god) => `${pillar.label}:${god}`)
    );
    const roots = branchRootsForElement(chart, element).map((pillar) => `${pillar.label}${pillar.branch}`);
    const storages = visible
      .filter(
        (pillar) =>
          Boolean(MU_KU_BRANCH_INFO[pillar.branch]) &&
          pillar.hiddenStems.some((stem) => getStemMeta(stem)?.element === element)
      )
      .map((pillar) => `${pillar.label}${pillar.branch}`);
    const currentTouch = currentCycle
      ? [currentCycle.stemElement, currentCycle.branchElement].includes(element)
        ? `Sim (${chart.currentLuck?.ganZhi})`
        : "Nao"
      : "--";
    const usefulTouch = [
      element === usefulGods.yong ? "Yong" : "",
      element === usefulGods.xi ? "Xi" : "",
      element === usefulGods.ji ? "Ji" : "",
      element === usefulGods.chou ? "Chou" : "",
      element === usefulGods.tiaoHou.yongShen ? "Tiao Hou" : "",
      element === structure.structureElement ? "Estrutura" : "",
    ]
      .filter(Boolean)
      .join("/");

    return `${title}: elemento ${element} | visiveis ${visibleMatches.join(", ") || "--"} | ocultos ${
      hiddenMatches.join(", ") || "--"
    } | raizes ${roots.join(", ") || "--"} | armazens ${storages.join(", ") || "--"} | ciclo corrente ${currentTouch} | eixo tecnico ${
      usefulTouch || "neutro"
    }${extra ? ` | ${extra}` : ""}`;
  };

  return {
    wealth: moduleLine("Riqueza", roles.wealth, ["Riqueza"], "foco em Zheng Cai/Pian Cai"),
    authority: moduleLine("Carreira/autoridade", roles.authority, ["Poder"], "foco em Zheng Guan/Qi Sha"),
    resource: moduleLine("Estudo/protecao", roles.support, ["Sustentacao"], "foco em Zheng Yin/Pian Yin"),
    output: moduleLine("Producao/talento", roles.expression, ["Producao"], "foco em Shi Shen/Shang Guan"),
    parity: moduleLine("Competicao/paridade", roles.same, ["Paralelo"], "foco em Bi Jian/Jie Cai"),
    enterprise: moduleLine(
      "Empreendimento/especulacao",
      roles.wealth,
      ["Riqueza", "Producao"],
      `combina ${roles.wealth} + ${roles.expression}`
    ),
    status: moduleLine(
      "Status/cargo",
      roles.authority,
      ["Poder", "Sustentacao"],
      `combina ${roles.authority} + ${roles.support} + estrutura ${structure.summary}`
    ),
  };
}

function buildHealthTechnicalLines(chart: BaziChart) {
  const healthMap: Array<{ element: ElementName; body: string }> = [
    { element: "Madeira", body: "figado/vesicula, tendoes e olhos" },
    { element: "Fogo", body: "coracao, sangue, circulacao e shen" },
    { element: "Terra", body: "baco/estomago, digestao e tecido muscular" },
    { element: "Metal", body: "pulmoes/intestino grosso, pele e respiracao" },
    { element: "Agua", body: "rins/bexiga, ossos, medos e jing" },
  ];

  return healthMap.map(({ element, body }) => {
    const diagnostic = chart.analysis.elementDiagnostics[element];
    return `${element}: ${diagnostic.percent}% | estado ${diagnostic.state} (${diagnostic.stateLabel}) | eixo tradicional ${body}`;
  });
}

function buildPalaceActivationNotes(chart: BaziChart, ganZhi: string) {
  const branch = ganZhi[1] ?? "";
  const notes = getVisiblePillars(chart)
    .map((pillar) => {
      const interactions = summarizeGanZhiInteraction("Camada", ganZhi, pillar.label, pillar.ganZhi);
      const sameBranch = branch && pillar.branch === branch;

      if (!interactions.length && !sameBranch) {
        return null;
      }

      return `${pillar.label} (${getPillarDomainLabel(pillar.key)}): ${
        sameBranch ? "mesmo ramo / ativacao direta" : interactions.join("; ")
      }`;
    })
    .filter(Boolean) as string[];

  return notes.length ? notes.join(" | ") : "Sem ativacao palacial dominante";
}

function buildInteractionMatrixRows(
  natalChart: BaziChart,
  usefulGods: UsefulGodSet,
  cycle: CycleFlow,
  currentDayGanZhi: string,
  currentHourGanZhi: string
) {
  const aggregate = (entries: Array<[string, string]>) => {
    const messages: string[] = [];

    for (let index = 0; index < entries.length; index += 1) {
      for (let inner = index + 1; inner < entries.length; inner += 1) {
        messages.push(
          ...summarizeGanZhiInteraction(entries[index][0], entries[index][1], entries[inner][0], entries[inner][1])
        );
      }
    }

    const kongLines = buildKongWangActivationLines(
      natalChart,
      entries
        .filter(([label]) => label !== "Natal")
        .map(([label, ganZhi]) => ({
          label,
          ganZhi,
          xunKong:
            label === "Da Yun"
              ? cycle.daYunVoid
              : label === "Xiao Yun"
                ? cycle.xiaoYunVoid
                : label === "Liu Nian"
                  ? cycle.liuNianVoid
                  : label === "Liu Yue"
                    ? cycle.liuYueVoid
                    : "--",
        }))
    );
    const technicalTouch = entries
      .filter(([label]) => label !== "Natal")
      .map(([label, ganZhi]) => {
        const profile = buildGanZhiProfile(natalChart.dayMaster.stem, ganZhi);
        return `${label}: ${buildUsefulTouchNote(profile, usefulGods, buildStructureProfile(natalChart, natalChart.analysis.season))} | ${buildPalaceActivationNotes(natalChart, ganZhi)}`;
      });

    return [...messages, ...kongLines, ...technicalTouch].join(" | ") || "Sem combinacao, choque, dano, destruicao, Kong Wang ou ativacao palacial dominante neste recorte";
  };

  const natalDay = natalChart.pillars.find((pillar) => pillar.key === "day")?.ganZhi ?? "--";

  return [
    `Natal x Da Yun: ${aggregate([["Natal", natalDay], ["Da Yun", cycle.daYun]])}`,
    `Natal x Liu Nian: ${aggregate([["Natal", natalDay], ["Liu Nian", cycle.liuNian]])}`,
    `Da Yun x Liu Nian: ${aggregate([["Da Yun", cycle.daYun], ["Liu Nian", cycle.liuNian]])}`,
    `Natal x Da Yun x Liu Nian: ${aggregate([["Natal", natalDay], ["Da Yun", cycle.daYun], ["Liu Nian", cycle.liuNian]])}`,
    `Natal x Da Yun x Liu Nian x Liu Yue: ${aggregate([["Natal", natalDay], ["Da Yun", cycle.daYun], ["Liu Nian", cycle.liuNian], ["Liu Yue", cycle.liuYue]])}`,
    `Natal x Da Yun x Liu Nian x Liu Yue x Liu Ri: ${aggregate([["Natal", natalDay], ["Da Yun", cycle.daYun], ["Liu Nian", cycle.liuNian], ["Liu Yue", cycle.liuYue], ["Liu Ri", currentDayGanZhi]])}`,
    `Natal x Da Yun x Liu Nian x Liu Yue x Liu Ri x Liu Shi: ${aggregate([["Natal", natalDay], ["Da Yun", cycle.daYun], ["Liu Nian", cycle.liuNian], ["Liu Yue", cycle.liuYue], ["Liu Ri", currentDayGanZhi], ["Liu Shi", currentHourGanZhi]])}`,
  ];
}

function summarizeGanZhiInteraction(labelA: string, ganZhiA: string, labelB: string, ganZhiB: string) {
  const stemA = ganZhiA[0] ?? "";
  const branchA = ganZhiA[1] ?? "";
  const stemB = ganZhiB[0] ?? "";
  const branchB = ganZhiB[1] ?? "";
  const messages: string[] = [];
  const stemCombo = STEM_COMBINATIONS[`${stemA}${stemB}`] ?? STEM_COMBINATIONS[`${stemB}${stemA}`];
  const branchPair = normalizePair(branchA, branchB);
  const anHePair = AN_HE_PAIRS.find(
    (pair) => normalizePair(pair.members[0], pair.members[1]) === branchPair
  );
  const muKuOpen =
    (MU_KU_CLASH_PARTNER[branchA] && MU_KU_CLASH_PARTNER[branchA] === branchB) ||
    (MU_KU_CLASH_PARTNER[branchB] && MU_KU_CLASH_PARTNER[branchB] === branchA);
  const muKuClose =
    (MU_KU_CLOSE_PARTNER[branchA] && MU_KU_CLOSE_PARTNER[branchA] === branchB) ||
    (MU_KU_CLOSE_PARTNER[branchB] && MU_KU_CLOSE_PARTNER[branchB] === branchA);

  if (stemCombo) {
    messages.push(`${labelA} x ${labelB}: Troncos combinam em ${stemCombo}`);
  }

  if (BRANCH_LIU_HE.has(branchPair)) {
    messages.push(`${labelA} x ${labelB}: Ramos em Liu He`);
  }

  if (BRANCH_LIU_CHONG.has(branchPair)) {
    messages.push(`${labelA} x ${labelB}: Ramos em choque`);
  }

  if (BRANCH_LIU_HAI.has(branchPair)) {
    messages.push(`${labelA} x ${labelB}: Ramos em dano`);
  }

  if (BRANCH_LIU_PO.has(branchPair)) {
    messages.push(`${labelA} x ${labelB}: Ramos em destruicao`);
  }

  if (anHePair) {
    messages.push(`${labelA} x ${labelB}: Ramos em ${anHePair.label}`);
  }

  if (muKuOpen) {
    messages.push(`${labelA} x ${labelB}: choque abre Mu Ku`);
  }

  if (muKuClose) {
    messages.push(`${labelA} x ${labelB}: combinacao fecha Mu Ku`);
  }

  return messages;
}

function buildCycleFlow(
  natalInput: BaziInput,
  natalChart: BaziChart,
  targetChart: BaziChart,
  usefulGods: UsefulGodSet,
  structure: StructureProfile
): CycleFlow {
  const birthTime = natalInput.unknownTime ? "12:00" : natalInput.time;
  const { year, month, day } = parseDate(natalInput.date);
  const { hour, minute } = parseTime(birthTime);
  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  const eightChar = lunar.getEightChar();
  const yun = eightChar.getYun(natalInput.gender === "male" ? 1 : 0, natalInput.splitLuck ? 2 : 1);
  const birthSolar = lunar.getSolar();
  const targetYear = parseDate(targetChart.adjusted.date).year;
  const targetLunar = getLunarFromChart(targetChart);
  const targetLunarMonth = targetLunar.getMonthInChinese();
  const dayStem = natalChart.dayMaster.stem;
  const startSolar = yun.getStartSolar();
  const allDaYun = yun.getDaYun(10);
  const firstDaYun = allDaYun.find((cycle) => cycle.getIndex() === 1);
  const preDaYun = allDaYun.find((cycle) => cycle.getIndex() === 0);
  const daYun = allDaYun
    .filter((cycle) => cycle.getGanZhi())
    .find((cycle) => targetYear >= cycle.getStartYear() && targetYear <= cycle.getEndYear());
  const liuNian = daYun?.getLiuNian(12).find((cycle) => cycle.getYear() === targetYear);
  const xiaoYun = daYun?.getXiaoYun(12).find((cycle) => cycle.getYear() === targetYear);
  const liuYue = liuNian?.getLiuYue().find((cycle) => cycle.getMonthInChinese() === targetLunarMonth);
  const yearPillar = natalChart.pillars.find((pillar) => pillar.key === "year");
  const directionRule =
    "Regra tradicional aplicada: ano Yang com homem ou ano Yin com mulher avanca; ano Yang com mulher ou ano Yin com homem retrocede.";
  const prevJie = lunar.getPrevJie(true);
  const nextJie = lunar.getNextJie(true);
  const referenceDistanceMinutes = yun.isForward()
    ? nextJie.getSolar().subtractMinute(birthSolar)
    : birthSolar.subtractMinute(prevJie.getSolar());
  const firstDaYunSwitchSolar = firstDaYun
    ? startSolar.nextYear(firstDaYun.getIndex() * 10).toYmdHms()
    : "--";
  const targetDayPillar = targetChart.pillars.find((pillar) => pillar.key === "day");
  const targetHourPillar = targetChart.pillars.find((pillar) => pillar.key === "hour");

  const cycleRole = (ganZhi: string) => {
    const stem = ganZhi[0] ?? "";
    return stem ? getTenGodName(dayStem, stem) : "--";
  };

  return {
    forward: yun.isForward(),
    directionLabel: yun.isForward() ? "Direto / avanca" : "Reverso / retrocede",
    directionRule,
    genderLabel: natalInput.gender === "male" ? "Masculino tecnico" : "Feminino tecnico",
    yearPolarity: yearPillar ? `${yearPillar.polarity} (${yearPillar.stem})` : "--",
    yearStem: yearPillar?.stem ?? "--",
    methodLabel: natalInput.splitLuck
      ? "Sect 2 / contagem por minutos solares"
      : "Sect 1 / 3 dias = 1 ano de sorte",
    methodFormula: natalInput.splitLuck
      ? "Metodo Sect 2: 4320 minutos = 1 ano | 360 minutos = 1 mes | 12 minutos = 1 dia | 1 minuto restante = 2 horas de sorte."
      : "Metodo Sect 1: 3 dias = 1 ano | 1 dia = 4 meses | 1 hora de relogio = 5 dias de sorte | 1 zhi-hora = 10 dias.",
    referenceJie: yun.isForward()
      ? `Contagem da data de nascimento ate ${formatJieQiNode(nextJie)}`
      : `Contagem de ${formatJieQiNode(prevJie)} ate a data de nascimento`,
    referenceDistance: `${formatMinuteSpan(referenceDistanceMinutes)} (${referenceDistanceMinutes} minuto(s))`,
    startSolar: startSolar.toYmdHms(),
    startOffset: `${yun.getStartYear()} ano(s), ${yun.getStartMonth()} mes(es), ${yun.getStartDay()} dia(s), ${yun.getStartHour()} hora(s) de sorte apos o nascimento`,
    firstDaYun: firstDaYun?.getGanZhi() ?? "--",
    firstDaYunAgeRange: firstDaYun
      ? `idades ${firstDaYun.getStartAge()}-${firstDaYun.getEndAge()} | anos ${firstDaYun.getStartYear()}-${firstDaYun.getEndYear()}`
      : "--",
    firstDaYunStartSolar: startSolar.toYmdHms(),
    firstDaYunEndSolar:
      firstDaYun && firstDaYunSwitchSolar !== "--"
        ? shiftDateTimeString(firstDaYunSwitchSolar, -1)
        : "--",
    firstDaYunSwitchSolar,
    daYunTable: allDaYun
      .filter((cycle) => cycle.getGanZhi())
      .map((cycle) =>
        buildDaYunTechnicalLine(cycle, startSolar, dayStem, natalChart, usefulGods, structure)
      ),
    preDaYunXiaoYunTable:
      preDaYun?.getXiaoYun().map((cycle) =>
        buildXiaoYunTechnicalLine(cycle, "", dayStem, natalChart, usefulGods, structure)
      ) ?? [],
    currentDaYunXiaoYunTable:
      daYun?.getXiaoYun(10).map((cycle) =>
        buildXiaoYunTechnicalLine(
          cycle,
          daYun.getGanZhi(),
          dayStem,
          natalChart,
          usefulGods,
          structure
        )
      ) ?? [],
    currentDaYunLiuNianTable:
      daYun?.getLiuNian(10).map((cycle) =>
        buildLiuNianTechnicalLine(
          cycle,
          daYun.getGanZhi(),
          dayStem,
          natalChart,
          usefulGods,
          structure,
          targetYear
        )
      ) ?? [],
    daYun: daYun?.getGanZhi() ?? "--",
    daYunVoid: daYun?.getXunKong() ?? "--",
    daYunRole: cycleRole(daYun?.getGanZhi() ?? ""),
    xiaoYun: xiaoYun?.getGanZhi() ?? "--",
    xiaoYunVoid: xiaoYun?.getXunKong() ?? "--",
    xiaoYunRole: cycleRole(xiaoYun?.getGanZhi() ?? ""),
    liuNian: liuNian?.getGanZhi() ?? "--",
    liuNianVoid: liuNian?.getXunKong() ?? "--",
    liuNianRole: cycleRole(liuNian?.getGanZhi() ?? ""),
    liuYue: liuYue?.getGanZhi() ?? "--",
    liuYueVoid: liuYue?.getXunKong() ?? "--",
    liuYueRole: cycleRole(liuYue?.getGanZhi() ?? ""),
    liuNianDetail: liuNian
      ? buildLiuNianTechnicalLine(
          liuNian,
          daYun?.getGanZhi() ?? "--",
          dayStem,
          natalChart,
          usefulGods,
          structure,
          targetYear
        )
      : "--",
    liuYueDetail: liuYue
      ? buildTemporalLayerDetail(
          "Liu Yue",
          liuYue.getGanZhi(),
          liuYue.getXunKong(),
          dayStem,
          natalChart,
          usefulGods,
          structure,
          [
            ["Da Yun", daYun?.getGanZhi() ?? "--"],
            ["Liu Nian", liuNian?.getGanZhi() ?? "--"],
          ]
        )
      : "--",
    liuRiDetail: targetDayPillar
      ? buildTemporalLayerDetail(
          "Liu Ri",
          targetDayPillar.ganZhi,
          targetDayPillar.xunKong || "--",
          dayStem,
          natalChart,
          usefulGods,
          structure,
          [
            ["Da Yun", daYun?.getGanZhi() ?? "--"],
            ["Liu Nian", liuNian?.getGanZhi() ?? "--"],
            ["Liu Yue", liuYue?.getGanZhi() ?? "--"],
          ]
        )
      : "--",
    liuShiDetail: targetHourPillar
      ? buildTemporalLayerDetail(
          "Liu Shi",
          targetHourPillar.ganZhi,
          targetHourPillar.xunKong || "--",
          dayStem,
          natalChart,
          usefulGods,
          structure,
          [
            ["Da Yun", daYun?.getGanZhi() ?? "--"],
            ["Liu Nian", liuNian?.getGanZhi() ?? "--"],
            ["Liu Yue", liuYue?.getGanZhi() ?? "--"],
            ["Liu Ri", targetDayPillar?.ganZhi ?? "--"],
          ]
        )
      : "--",
  };
}

function getNineStarBlock(chart: BaziChart) {
  const lunar = getLunarFromChart(chart);
  const formatStar = (label: string, star: ReturnType<typeof lunar.getDayNineStar>) =>
    `${label}: ${star.getNumber()} ${star.getColor()} ${star.getNameInXuanKong()} | Qi Men ${star.getNameInQiMen()} ${star.getBaMenInQiMen()} (${star.getLuckInQiMen()}) | Tai Yi ${star.getNameInTaiYi()}`;

  return [
    formatStar("Ano", lunar.getYearNineStar()),
    formatStar("Mes", lunar.getMonthNineStar()),
    formatStar("Dia", lunar.getDayNineStar()),
    formatStar("Hora", lunar.getTimeNineStar()),
  ];
}

export function buildBaziNatalBlocks(chart: BaziChart): DetailBlock[] {
  const lunar = getLunarFromChart(chart);
  const visiblePillars = getVisiblePillars(chart);
  const yearPillar = chart.pillars.find((pillar) => pillar.key === "year");
  const monthPillar = chart.pillars.find((pillar) => pillar.key === "month");
  const dayPillar = chart.pillars.find((pillar) => pillar.key === "day");
  const hourPillar = chart.pillars.find((pillar) => pillar.key === "hour");
  const season = chart.analysis.season;
  const dayElement = chart.dayMaster.element;
  const support = getSupportElement(dayElement);
  const authority = getControlledBy(dayElement);
  const output = GENERATES[dayElement];
  const wealth = CONTROLS[dayElement];
  const supportScore = chart.analysis.elementDiagnostics[support]?.total ?? 0;
  const sameScore = chart.analysis.elementDiagnostics[dayElement]?.total ?? 0;
  const roots = chart.analysis.strength.directRoots;
  const supportRoots = chart.analysis.strength.supportRoots;
  const strongPhases = chart.analysis.strength.strongPhases;
  const usefulGods = getUsefulGodSet(chart, season);
  const structure = buildStructureProfile(chart, season);
  const stateSummary = chart.elementScores.map(
    (item) =>
      `${item.element} ${chart.analysis.elementDiagnostics[item.element].state} (${chart.analysis.elementDiagnostics[item.element].stateLabel})`
  );
  const relations = buildBranchRelations(chart);
  const stemRelations = buildStemRelations(chart);
  const transformations = buildTransformationAssessment(chart, season);
  const shenSha = buildShenShaProfile(chart);
  const starsByPillarKey = new Map(
    shenSha.perPillar.map(({ pillar, stars }) => [pillar.key, stars] as const)
  );
  const tenGodWeights = buildTenGodStrengthProfile(chart);
  const excessive = chart.elementScores.filter((item) => item.percent >= 28).map((item) => item.element);
  const absent = chart.elementScores.filter((item) => item.score <= 4).map((item) => item.element);
  const blocked = chart.elementScores
    .filter(
      (item) =>
        !visiblePillars.some((pillar) => pillar.stemElement === item.element) &&
        ["囚", "死"].includes(chart.analysis.elementDiagnostics[item.element].state)
    )
    .map((item) => item.element);
  const spousePalace = dayPillar;
  const schoolModeLabel = getSchoolModeLabel(chart.input.schoolMode);
  const schoolModeNotes = getSchoolModeNotes(chart.input.schoolMode);
  const remoteBranchRules = usesRemoteBranchRules(chart.input.schoolMode);
  const liuQin = buildLiuQinProfile(chart);
  const jieQiLines = buildJieQiList(chart);
  const pillarAnalyses = visiblePillars.map(
    (pillar) =>
      `${pillar.label}: ${interpretPillarInContext(
        chart,
        pillar,
        starsByPillarKey.get(pillar.key) ?? [],
        usefulGods,
        structure
      )}`
  );
  const elementDistribution = chart.elementScores.map(
    (item) => `${item.element} ${item.percent}% (${item.role})`
  );
  const visibleTenGods = visiblePillars.map((pillar) => `${pillar.label}:${pillar.tenGod}`);
  const hiddenTenGods = visiblePillars.map(
    (pillar) => `${pillar.label}:${pillar.hiddenGods.join("/") || "--"}`
  );
  const positionGods = visiblePillars.map(
    (pillar) => `${pillar.label} ${pillar.tenGod} / ${pillar.hiddenGods.join("/") || "--"}`
  );
  const cycleGods = chart.luckCycles
    .slice(0, 4)
    .map((cycle) => `${cycle.ganZhi}:${cycle.role}`)
    .filter(Boolean);
  const pillarNaYin = visiblePillars.map((pillar) => `${pillar.label}:${pillar.naYin}`);
  const prevJie = lunar.getPrevJie(true);
  const nextJie = lunar.getNextJie(true);
  const prevQi = lunar.getPrevQi(true);
  const nextQi = lunar.getNextQi(true);
  const birthSolar = lunar.getSolar();
  const currentJie = formatCurrentJieQiWindow(lunar.getCurrentJie(), prevJie, nextJie);
  const currentQi = formatCurrentJieQiWindow(lunar.getCurrentQi(), prevQi, nextQi);
  const solarMonthTotalMinutes = nextJie.getSolar().subtractMinute(prevJie.getSolar());
  const solarMonthElapsedMinutes = birthSolar.subtractMinute(prevJie.getSolar());
  const solarMonthPercent = solarMonthTotalMinutes
    ? Math.round((solarMonthElapsedMinutes / solarMonthTotalMinutes) * 100)
    : 0;
  const hiddenStemLayers = visiblePillars.map(
    (pillar) =>
      `${pillar.label} ${pillar.branch}: ${formatHiddenStemTechnicalLayers(
        chart.dayMaster.stem,
        pillar.hiddenStems,
        season
      ) || "--"} | revelado no ceu ${pillar.hiddenStems.filter((stem) => visiblePillars.some((visible) => visible.stem === stem)).join("/") || "nao"}`
  );
  const muKuLines = visiblePillars
    .filter((pillar) => Boolean(MU_KU_BRANCH_INFO[pillar.branch]))
    .map((pillar) => buildMuKuStatusLine(chart, pillar));
  const scoringAuditLines = [
    `Peso por Tronco visivel: ${Object.entries(STEM_SCORE_BY_PILLAR).map(([key, value]) => `${key} ${value}`).join(" | ")}`,
    `Peso por corpo do Ramo: ${Object.entries(BRANCH_SCORE_BY_PILLAR).map(([key, value]) => `${key} ${value}`).join(" | ")}`,
    `Peso por Tronco oculto: ${HIDDEN_LAYER_LABELS.map((label, index) => `${label} ${HIDDEN_STEM_WEIGHTS[index] ?? 1}`).join(" | ")}`,
    `Peso sazonal dos estados: ${Object.entries(STATE_STRENGTH_WEIGHT).map(([state, value]) => `${state} ${value}`).join(" | ")}`,
    `Formula da forca do Mestre: base 45 + estacao ${chart.analysis.strength.seasonalScore} + raiz ${chart.analysis.strength.rootScore} + fase ${chart.analysis.strength.phaseScore} + visivel ${chart.analysis.strength.visibleSupportScore - chart.analysis.strength.visibleHostileScore} + desequilibrio + De Ling`,
  ];
  const elementAuditLines = chart.elementScores.map((item) => {
    const diagnostic = chart.analysis.elementDiagnostics[item.element];
    return `${item.element}: total ${diagnostic.total} | visivel ${diagnostic.visibleStem} | ramo ${diagnostic.branchBody} | oculto ${diagnostic.hiddenStem} | raizes ${diagnostic.rootCount} | estado ${diagnostic.state} (${diagnostic.stateLabel})`;
  });
  const spousePalaceTechnical = buildSpousePalaceTechnical(
    chart,
    spousePalace,
    usefulGods,
    relations,
    starsByPillarKey.get("day") ?? []
  );
  const technicalModules = buildTechnicalRoleModules(chart, usefulGods, structure);
  const healthLines = buildHealthTechnicalLines(chart);

  return [
    {
      title: "Fundamentos do mapa",
      items: [
        { label: "Quatro Pilares", value: visiblePillars.map((pillar) => `${pillar.label} ${pillar.ganZhi}`).join(" | ") },
        { label: "Pilar do Ano", value: yearPillar ? describePillar(yearPillar) : "--" },
        { label: "Pilar do Mes", value: monthPillar ? describePillar(monthPillar) : "--" },
        { label: "Pilar do Dia", value: dayPillar ? describePillar(dayPillar) : "--" },
        { label: "Pilar da Hora", value: hourPillar ? describePillar(hourPillar) : "Hora desconhecida" },
        { label: "Troncos Celestes", value: visiblePillars.map((pillar) => `${pillar.label}:${pillar.stem}`).join(" | ") },
        { label: "Ramos Terrestres", value: visiblePillars.map((pillar) => `${pillar.label}:${pillar.branch}`).join(" | ") },
        { label: "Troncos ocultos", value: visiblePillars.map((pillar) => `${pillar.label}:${pillar.hiddenStems.join("/") || "--"}`).join(" | ") },
        { label: "Ocultos por camada", value: hiddenStemLayers.join(" || ") },
        { label: "Mestre do Dia", value: `${chart.dayMaster.stem} ${chart.dayMaster.label} (${chart.dayMaster.tone})` },
        { label: "Sexo/genero tecnico do nativo", value: chart.input.gender === "male" ? "Masculino tecnico" : "Feminino tecnico" },
        { label: "Dez Deuses", value: joinOrFallback(visibleTenGods, "Sem deuses calculados") },
        { label: "Cinco Elementos", value: elementDistribution.join(" | ") },
        { label: "Yin/Yang", value: getYinYangBalance(chart) },
        { label: "Na Yin", value: pillarNaYin.join(" | ") },
      ],
    },
    {
      title: "Modo por escola",
      items: [
        { label: "Escola / linha usada", value: schoolModeLabel },
        { label: "Regra de ciclos", value: chart.input.splitLuck ? "Sect 2 / minutos solares" : "Sect 1 / 3 dias = 1 ano" },
        { label: "Hora solar", value: chart.input.solarTime ? "Ativa" : "Desligada" },
        { label: "Escopo dos pilares", value: "Quatro Pilares classicos: Ano, Mes, Dia e Hora" },
        { label: "Virada do dia 23:00", value: chart.input.dayStartsAt23 ? "Ativa" : "Desligada" },
      ],
      bullets: schoolModeNotes,
    },
    {
      title: "Calendario, estacao e forca",
      items: [
        { label: "Calendario solar por Jie Qi", value: `${chart.adjusted.date} | Jie ${currentJie} | Qi ${currentQi}` },
        { label: "24 Jie Qi", value: `${jieQiLines.length} termos solares calculados para o ano` },
        { label: "Jie anterior", value: formatJieQiNode(prevJie) },
        { label: "Jie atual", value: currentJie },
        { label: "Jie seguinte", value: formatJieQiNode(nextJie) },
        { label: "Qi anterior", value: formatJieQiNode(prevQi) },
        { label: "Qi atual", value: currentQi },
        { label: "Qi seguinte", value: formatJieQiNode(nextQi) },
        {
          label: "Posicao dentro do mes solar",
          value: `${formatMinuteSpan(solarMonthElapsedMinutes)} decorridos desde ${formatJieQiName(prevJie.getName())} | janela total ${formatMinuteSpan(solarMonthTotalMinutes)} | ${solarMonthPercent}% do mes solar`,
        },
        {
          label: "Hora solar verdadeira",
          value: `${chart.adjusted.time} (${chart.adjusted.solarMinutes >= 0 ? "+" : ""}${chart.adjusted.solarMinutes} min; longitude ${chart.adjusted.longitudeMinutes >= 0 ? "+" : ""}${chart.adjusted.longitudeMinutes}; equacao ${chart.adjusted.equationOfTimeMinutes >= 0 ? "+" : ""}${chart.adjusted.equationOfTimeMinutes})`,
        },
        {
          label: "Mes de comando / Yue Ling",
          value: `${monthPillar?.ganZhi ?? "--"} ${monthPillar?.animal ?? ""} (${season}; comando em ${chart.analysis.monthCommand.element})`,
        },
        {
          label: "Forca do Mestre do Dia",
          value: `${chart.dayMaster.strength}% (${chart.dayMaster.tone}; apoio ${chart.analysis.strength.supportiveShare}% / desgaste ${chart.analysis.strength.hostileShare}%)`,
        },
        {
          label: "De Ling",
          value: chart.analysis.strength.deLing
            ? `Sim, o Yue Ling alimenta ${dayElement} ou seu recurso ${support}`
            : `Nao, o Yue Ling nao sustenta diretamente ${dayElement}`,
        },
        {
          label: "De Di",
          value: `${roots.length} raiz(es) diretas em ${dayElement}${supportRoots.length ? ` e ${supportRoots.length} de suporte em ${support}` : ""}`,
        },
        {
          label: "De Shi",
          value: strongPhases.length
            ? `${strongPhases.length} pilar(es) em fase forte: ${strongPhases.join(" | ")}`
            : "Sem fase forte dominante no recorte visivel",
        },
        {
          label: "Raiz dos Troncos / Tong Gen",
          value: roots.length
            ? `${roots.join(", ")}${supportRoots.length ? ` | apoio em ${supportRoots.join(", ")}` : ""}`
            : "Sem raiz direta; apoio apenas indireto",
        },
        { label: "Troncos revelados / Tou Gan", value: visiblePillars.map((pillar) => `${pillar.label}:${pillar.stem}`).join(" | ") },
        {
          label: "Forca por estacao",
          value: `${chart.analysis.strength.state} / ${chart.analysis.strength.stateLabel} com clima ${chart.analysis.climate.dominant}`,
        },
        {
          label: "Forca por raiz",
          value: `${chart.analysis.strength.rootScore} pontos de enraizamento (diretas ${roots.length}, suporte ${supportRoots.length})`,
        },
        {
          label: "Forca por apoio dos elementos",
          value: `${sameScore + supportScore} pontos em ${dayElement} + ${support}; oposicao ${chart.analysis.strength.hostileScore}`,
        },
        { label: "Wang Xiang Xiu Qiu Si", value: stateSummary.join(" | ") },
        { label: "12 fases de crescimento / Chang Sheng", value: visiblePillars.map((pillar) => `${pillar.label}:${pillar.qiPhase}`).join(" | ") },
        { label: "Na Yin dos pilares", value: pillarNaYin.join(" | ") },
      ],
      bullets: jieQiLines,
    },
    {
      title: "Ocultos, armazens e pesos",
      items: [
        { label: "Ben Qi / Zhong Qi / Yu Qi", value: hiddenStemLayers.join(" || ") },
        {
          label: "Mu Ku / armazens",
          value: muKuLines.length
            ? muKuLines.join(" || ")
            : "Sem ramo-armazem entre 辰, 戌, 丑 e 未 no recorte visivel",
        },
        {
          label: "Metodo de pesos",
          value: "Distribuicao auditavel por troncos visiveis, corpo dos ramos, ocultos, estado sazonal, raiz, fase e desequilibrio.",
        },
      ],
      bullets: scoringAuditLines,
    },
    {
      title: "Relacoes, formacoes e vazios",
      items: [
        { label: "Shen Sha / estrelas simbolicas", value: joinOrFallback(shenSha.overall, "Sem Shen Sha classica acionada no recorte principal") },
        { label: "Tema predominante das estrelas", value: joinOrFallback(shenSha.themes, "Sem tema simbolico dominante") },
        { label: "Quadro tecnico das estrelas simbolicas", value: shenSha.summary },
        { label: "Kong Wang / vazio", value: visiblePillars.map((pillar) => `${pillar.label}:${pillar.xunKong || "--"}`).join(" | ") },
        { label: "Combinacoes de Troncos", value: joinOrFallback(stemRelations, "Nenhuma combinacao classica entre os Troncos visiveis") },
        {
          label: "Combinacoes de Ramos",
          value: joinOrFallback(
            [...relations.liuHe, ...relations.sanHe, ...relations.sanHui, ...relations.yaoHe],
            "Sem combinacao fechada de Ramos"
          ),
        },
        {
          label: "Choques",
          value: joinOrFallback(
            [...relations.liuChong, ...relations.yaoChong],
            "Sem choque destacado"
          ),
        },
        { label: "Punicoes", value: joinOrFallback(relations.punishments, "Sem punicao fechada") },
        { label: "Autopunicoes", value: joinOrFallback(relations.selfPunishments, "Sem autopunicao") },
        { label: "Danos", value: joinOrFallback(relations.liuHai, "Sem dano destacado") },
        { label: "Destruicoes", value: joinOrFallback(relations.liuPo, "Sem destruicao destacada") },
        { label: "San He", value: joinOrFallback(relations.sanHe, "Sem San He completo") },
        { label: "San Hui", value: joinOrFallback(relations.sanHui, "Sem San Hui completo") },
        { label: "Ban He / meia combinacao", value: joinOrFallback(relations.banHe, "Sem meia combinacao dominante") },
        { label: "An He / combinacao oculta", value: joinOrFallback(relations.anHe, "Sem An He dominante pela regra conservadora") },
        {
          label: "Yao He / combinacao a distancia",
          value: joinOrFallback(
            relations.yaoHe,
            remoteBranchRules
              ? "Sem Yao He fechado entre pilares nao adjacentes"
              : "Regra opcional desativada nesta escola"
          ),
        },
        {
          label: "Yao Chong / choque a distancia",
          value: joinOrFallback(
            relations.yaoChong,
            remoteBranchRules
              ? "Sem Yao Chong fechado entre pilares nao adjacentes"
              : "Regra opcional desativada nesta escola"
          ),
        },
        { label: "Liu He", value: joinOrFallback(relations.liuHe, "Sem Liu He fechado") },
        { label: "Liu Chong", value: joinOrFallback(relations.liuChong, "Sem Liu Chong") },
        { label: "Liu Hai", value: joinOrFallback(relations.liuHai, "Sem Liu Hai") },
        { label: "Liu Po", value: joinOrFallback(relations.liuPo, "Sem Liu Po") },
        { label: "Xing / punicoes", value: joinOrFallback([...relations.punishments, ...relations.selfPunishments], "Sem Xing completo") },
        { label: "Abertura de armazem por choque", value: joinOrFallback(relations.muKuOpenings, "Sem abertura tecnica de armazem no recorte natal") },
        { label: "Fechamento de armazem por combinacao", value: joinOrFallback(relations.muKuClosings, "Sem fechamento tecnico de armazem por combinacao no recorte natal") },
        { label: "Formacoes de elemento", value: joinOrFallback(transformations.formations, "Sem formacao elemental completa") },
        { label: "Transformacoes de elemento", value: joinOrFallback(transformations.stemTransforms, "Sem transformacao elemental por Troncos") },
        {
          label: "Condicoes para transformacao verdadeira",
          value: joinOrFallback(
            transformations.trueTransforms,
            joinOrFallback(
              transformations.conditionalTransforms,
              "Nenhuma transformacao cumpriu raiz + estacao"
            )
          ),
        },
        { label: "Narrativa da transformacao", value: transformations.dominantNarrative },
        { label: "Bloqueios da transformacao", value: transformations.blockers.join(" | ") || "Sem bloqueio tecnico dominante" },
        { label: "Forca sazonal", value: `${season} | ${stateSummary.join(" | ")}` },
      ],
      bullets: shenSha.perPillar.map(
        ({ pillar, stars, narrative }) =>
          `${pillar.label}: ${stars.length ? stars.join(", ") : "sem Shen Sha dominante"} | ${narrative}`
      ),
    },
    {
      title: "Biblioteca de Shen Sha e regras",
      items: [
        { label: "Modo da biblioteca de estrelas", value: shenSha.libraryMode },
        { label: "Estrelas ativas no recorte", value: joinOrFallback(shenSha.overall, "Sem estrela ativa no recorte") },
        { label: "Regras auditaveis das estrelas ativas", value: shenSha.ruleLines.join(" || ") || "Sem regra adicional ativa" },
      ],
      bullets: shenSha.catalogLines,
    },
    {
      title: "Estrutura, deuses uteis e clima",
      items: [
        { label: "Estrutura do mapa", value: structure.summary },
        { label: "Estrutura selecionada", value: structure.selectedStructure },
        { label: "Regra estrutural da escola", value: structure.schoolBias },
        { label: "Zheng Ge", value: structure.zhengGe },
        { label: "Cong Ge", value: structure.congGe },
        { label: "Hua Ge", value: structure.huaGe },
        { label: "Zhuan Wang Ge", value: structure.zhuanWangGe },
        { label: "Estruturas especiais", value: structure.specialStructures },
        {
          label: "Confianca estrutural",
          value: `${structure.confidence} | ${structure.scoreMap.map((item) => `${item.name} ${item.score}`).join(" | ")}`,
        },
        { label: "Integridade da estrutura", value: structure.formedState },
        { label: "Nota tecnica da estrutura", value: structure.integrityNote },
        { label: "Evidencias da estrutura", value: structure.evidence.join(" | ") },
        { label: "Yong Shen", value: usefulGods.yong },
        { label: "Xi Shen", value: usefulGods.xi },
        { label: "Ji Shen", value: usefulGods.ji },
        { label: "Chou Shen", value: usefulGods.chou },
        { label: "Xian Shen", value: usefulGods.xian },
        { label: "Logica do Yong Shen", value: usefulGods.note },
        { label: "Prioridade tecnica dos elementos", value: usefulGods.priority.join(" -> ") },
        { label: "Alertas do ajuste", value: usefulGods.warnings.join(" | ") || "Sem conflito tecnico dominante no ajuste" },
        { label: "Tiao Hou", value: usefulGods.tiaoHou.climate },
        { label: "Tiao Hou Yong Shen", value: usefulGods.tiaoHou.yongShen },
        { label: "Equilibrio climatico", value: usefulGods.tiaoHou.note },
        { label: "Frio/calor/secura/umidade", value: `${season}: ${usefulGods.tiaoHou.climate}` },
      ],
      bullets: [
        `Jie anterior e proximo: ${lunar.getPrevJie(true).toString()} -> ${lunar.getNextJie(true).toString()}`,
        `Qi anterior e proximo: ${lunar.getPrevQi(true).toString()} -> ${lunar.getNextQi(true).toString()}`,
      ],
    },
    {
      title: "Catalogo de estruturas e gates",
      items: [
        {
          label: "Gate de aprovacao",
          value: `Estruturas regulares >= ${structure.regularThreshold} | estruturas especiais >= ${structure.specialThreshold}`,
        },
        {
          label: "Estruturas aprovadas",
          value:
            structure.catalog
              .filter((row) => row.status === "Passou")
              .map((row) => row.name)
              .join(" | ") || "Nenhuma estrutura passou acima do gate desta escola",
        },
        {
          label: "Estruturas concorrentes",
          value:
            structure.catalog
              .filter((row) => row.status === "Concorrente")
              .map((row) => row.name)
              .join(" | ") || "Sem estrutura concorrente encostando no gate",
        },
      ],
      bullets: structure.catalog.map(
        (row) =>
          `${row.name}: ${row.status} | score ${row.score} | cobertura ${row.coverage} | confianca ${row.confidence} | ${row.note}`
      ),
    },
    {
      title: "Yong Shen por metodo",
      items: [
        { label: "Yong Shen estrutural", value: structure.broken ? structure.protectorElement : structure.structureElement },
        { label: "Yong Shen climatico / Tiao Hou", value: usefulGods.tiaoHou.yongShen },
        { label: "Yong Shen de equilibrio forte/fraco", value: usefulGods.originalYong ?? usefulGods.yong },
        { label: "Xiang Shen / assistente", value: usefulGods.xi },
        { label: "Yong Shen natal final", value: usefulGods.yong },
        { label: "Conflito entre metodos", value: usefulGods.warnings.join(" | ") || "Sem conflito tecnico dominante entre estrutura, clima e equilibrio" },
      ],
      bullets: [`Hierarquia tecnica registrada: ${usefulGods.priority.join(" -> ")}`],
    },
    {
      title: "Modulos tecnicos por tema",
      items: [
        { label: "Riqueza", value: technicalModules.wealth },
        { label: "Carreira/autoridade", value: technicalModules.authority },
        { label: "Estudo/protecao", value: technicalModules.resource },
        { label: "Producao/talento", value: technicalModules.output },
        { label: "Competicao/paridade", value: technicalModules.parity },
        { label: "Empreendimento/especulacao", value: technicalModules.enterprise },
        { label: "Status/cargo", value: technicalModules.status },
      ],
    },
    {
      title: "Saude tradicional simbolica",
      items: [
        { label: "Eixo Madeira", value: healthLines[0] },
        { label: "Eixo Fogo", value: healthLines[1] },
        { label: "Eixo Terra", value: healthLines[2] },
        { label: "Eixo Metal", value: healthLines[3] },
        { label: "Eixo Agua", value: healthLines[4] },
      ],
      bullets: [
        "Escopo simbolico tradicional: nao substitui avaliacao medica, diagnostico ou tratamento.",
      ],
    },
    {
      title: "Auditoria de pontuacao do motor",
      items: [
        { label: "Score bruto do Mestre", value: `${chart.analysis.strength.score}` },
        { label: "Score de apoio", value: `${chart.analysis.strength.supportiveScore}` },
        { label: "Score de desgaste", value: `${chart.analysis.strength.hostileScore}` },
        { label: "Score sazonal", value: `${chart.analysis.strength.seasonalScore}` },
        { label: "Score de raiz", value: `${chart.analysis.strength.rootScore}` },
        { label: "Score de fase", value: `${chart.analysis.strength.phaseScore}` },
        { label: "Score visivel de apoio", value: `${chart.analysis.strength.visibleSupportScore}` },
        { label: "Score visivel de desgaste", value: `${chart.analysis.strength.visibleHostileScore}` },
      ],
      bullets: [...scoringAuditLines, ...elementAuditLines],
    },
    {
      title: "Referencia por posicao",
      items: [
        {
          label: "Referencia tecnica do Pilar do Ano",
          value: yearPillar
            ? interpretPillarInContext(
                chart,
                yearPillar,
                starsByPillarKey.get(yearPillar.key) ?? [],
                usefulGods,
                structure
              )
            : "--",
        },
        {
          label: "Referencia tecnica do Pilar do Mes",
          value: monthPillar
            ? interpretPillarInContext(
                chart,
                monthPillar,
                starsByPillarKey.get(monthPillar.key) ?? [],
                usefulGods,
                structure
              )
            : "--",
        },
        {
          label: "Referencia tecnica do Pilar do Dia",
          value: dayPillar
            ? interpretPillarInContext(
                chart,
                dayPillar,
                starsByPillarKey.get(dayPillar.key) ?? [],
                usefulGods,
                structure
              )
            : "--",
        },
        {
          label: "Referencia tecnica do Pilar da Hora",
          value: hourPillar
            ? interpretPillarInContext(
                chart,
                hourPillar,
                starsByPillarKey.get(hourPillar.key) ?? [],
                usefulGods,
                structure
              )
            : "Hora desconhecida",
        },
        { label: "Ramo do Dia", value: dayPillar ? `${dayPillar.branch} ${dayPillar.animal} | ocultos ${dayPillar.hiddenStems.join("/") || "--"}` : "--" },
        { label: "Palacio do Conjuge", value: spousePalace ? `${formatPillarLabel(spousePalace)} | Kong Wang ${spousePalace.xunKong || "--"}` : "--" },
        { label: "Palacio do Conjuge tecnico", value: spousePalaceTechnical.summary },
        { label: "Forca do Palacio do Conjuge", value: spousePalaceTechnical.force },
        { label: "Ocultos do Palacio do Conjuge", value: spousePalaceTechnical.hidden },
        { label: "Favorabilidade do Palacio do Conjuge", value: spousePalaceTechnical.favorability },
        { label: "Estrela tecnica do Conjuge", value: spousePalaceTechnical.star },
        { label: "Ativacao natal do Palacio do Conjuge", value: spousePalaceTechnical.activation },
        { label: "Tai Yuan", value: `${lunar.getEightChar().getTaiYuan()} | ${lunar.getEightChar().getTaiYuanNaYin()}` },
        { label: "Ming Gong", value: `${lunar.getEightChar().getMingGong()} | ${lunar.getEightChar().getMingGongNaYin()}` },
        { label: "Shen Gong", value: `${lunar.getEightChar().getShenGong()} | ${lunar.getEightChar().getShenGongNaYin()}` },
      ],
      bullets: pillarAnalyses,
    },
    {
      title: "Liu Qin e relacoes familiares",
      items: [
        { label: "Pai", value: liuQin.father },
        { label: "Mae", value: liuQin.mother },
        { label: "Irmaos / pares", value: liuQin.siblings },
        { label: "Conjuge", value: liuQin.spouse },
        { label: "Filhos / obras", value: liuQin.children },
        { label: "Autoridade / superiores", value: liuQin.authority },
        { label: "Amigos / concorrentes", value: liuQin.companions },
      ],
      bullets: [
        "Convencao tecnica usada: mae pelo recurso, pai pela riqueza, conjuge por riqueza masculina ou autoridade feminina.",
        "Palacios-base: ano = ancestralidade, mes = ambiente formador/carreira, dia = eu + conjuge, hora = filhos/legado.",
      ],
    },
    {
      title: "Dez Deuses e balanco elemental",
      items: [
        { label: "Shen Sha por pilar", value: shenSha.perPillar.map(({ pillar, stars }) => `${pillar.label}:${stars.join("/") || "--"}`).join(" | ") },
        { label: "Kong Wang por pilar", value: visiblePillars.map((pillar) => `${pillar.label}:${pillar.xunKong || "--"}`).join(" | ") },
        { label: "Dez Deuses nos Troncos visiveis", value: joinOrFallback(visibleTenGods, "Sem Troncos visiveis") },
        { label: "Dez Deuses nos Troncos ocultos", value: joinOrFallback(hiddenTenGods, "Sem Troncos ocultos") },
        { label: "Dez Deuses por posicao", value: positionGods.join(" | ") },
        { label: "Dez Deuses por forca", value: joinOrFallback(tenGodWeights, "Sem pesos calculados") },
        { label: "Dez Deuses por ciclo de sorte", value: joinOrFallback(cycleGods, "Sem ciclos suficientes para distribuicao") },
        { label: "Estrutura util e estrutura nociva", value: `Util ${usefulGods.yong}/${usefulGods.xi} | nociva ${usefulGods.ji}/${usefulGods.chou}` },
        { label: "Elemento favoravel", value: `${usefulGods.yong} / ${usefulGods.xi}` },
        { label: "Elemento desfavoravel", value: `${usefulGods.ji} / ${usefulGods.chou}` },
        { label: "Elemento excessivo", value: excessive.join(", ") || "Nenhum excesso claro" },
        { label: "Elemento ausente", value: absent.join(", ") || "Nenhum elemento ausente" },
        { label: "Elemento bloqueado", value: blocked.join(", ") || "Sem bloqueio claro" },
        { label: "Elemento transformado", value: joinOrFallback(transformations.trueTransforms, joinOrFallback(transformations.formations, "Sem transformacao completa")) },
        { label: "Elemento de producao", value: output },
        { label: "Elemento de controle", value: `controlado ${wealth} | controlador ${authority}` },
        { label: "Elemento de vazamento", value: output },
        { label: "Elemento de riqueza", value: wealth },
        { label: "Elemento de autoridade", value: authority },
        { label: "Elemento de recurso", value: support },
        { label: "Elemento de expressao", value: output },
        { label: "Elemento de paridade", value: dayElement },
      ],
      bullets: chart.luckCycles.slice(0, 6).map(
        (cycle) => `${cycle.ganZhi} ${cycle.startYear}-${cycle.endYear}: ${cycle.role}`
      ),
    },
  ];
}

export function buildBaziCompatibilityBlocks(chartA: BaziChart, chartB: BaziChart): DetailBlock[] {
  const sharedDayMaster = chartA.dayMaster.element === chartB.dayMaster.element;
  const dominantA = chartA.elementScores[0].element;
  const dominantB = chartB.elementScores[0].element;
  const usefulA = getUsefulGodSet(chartA, chartA.analysis.season);
  const usefulB = getUsefulGodSet(chartB, chartB.analysis.season);
  const structureA = buildStructureProfile(chartA, chartA.analysis.season);
  const structureB = buildStructureProfile(chartB, chartB.analysis.season);
  const shenShaA = buildShenShaProfile(chartA);
  const shenShaB = buildShenShaProfile(chartB);
  const yongA = usefulA.yong;
  const yongB = usefulB.yong;
  const aReceivesB = chartA.analysis.favorableElements.includes(dominantB);
  const bReceivesA = chartB.analysis.favorableElements.includes(dominantA);
  const aPressedByB = chartA.analysis.unfavorableElements.includes(dominantB);
  const bPressedByA = chartB.analysis.unfavorableElements.includes(dominantA);
  const aYongHelpsB = chartB.analysis.favorableElements.includes(yongA);
  const bYongHelpsA = chartA.analysis.favorableElements.includes(yongB);
  const mutualSupport =
    aReceivesB && bReceivesA
      ? "Dupla via de apoio elemental"
      : aReceivesB || bReceivesA
        ? "Apoio parcial entre os mapas"
        : "Pouco apoio elemental espontaneo";
  const mutualPressure =
    aPressedByB && bPressedByA
      ? "Pressao reciproca nos eixos sensiveis"
      : aPressedByB || bPressedByA
        ? "Um mapa pressiona mais o eixo sensivel do outro"
        : "Sem pressao cruzada dominante";
  const mutualYong =
    aYongHelpsB && bYongHelpsA
      ? "Os dois Yong Shen se apoiam mutuamente"
      : aYongHelpsB || bYongHelpsA
        ? "Ha apoio parcial entre os Yong Shen do par"
        : "Os Yong Shen caminham em trilhas diferentes e pedem mais ajuste";
  const bridgeElements = distinctElements([
    ...chartA.analysis.favorableElements.filter((element) =>
      chartB.analysis.favorableElements.includes(element)
    ),
    aYongHelpsB ? yongA : undefined,
    bYongHelpsA ? yongB : undefined,
    structureA.broken ? structureA.protectorElement : undefined,
    structureB.broken ? structureB.protectorElement : undefined,
  ]);
  const tensionElements = distinctElements([
    ...chartA.analysis.unfavorableElements.filter((element) =>
      chartB.analysis.unfavorableElements.includes(element)
    ),
    aPressedByB ? dominantB : undefined,
    bPressedByA ? dominantA : undefined,
  ]);
  const structuralHandshake =
    !structureA.broken && !structureB.broken
      ? "As duas estruturas chegam relativamente formadas ao vinculo"
      : structureA.broken && structureB.broken
        ? "As duas estruturas entram tensionadas e o vinculo precisa proteger ambas"
        : "Um mapa chega mais pronto que o outro e tende a sustentar o ritmo da relacao";
  const reconciliationBridge = bridgeElements.length
    ? `${bridgeElements.join("/")} funciona como ponte de cooperacao e estabiliza melhor o par.`
    : "O par nao mostra ponte elemental espontanea forte e precisa construir ritmo por combinacao de comportamento.";
  const frictionAxis = tensionElements.length
    ? `${tensionElements.join("/")} tende a concentrar os atritos recorrentes do vinculo.`
    : "Nao ha eixo unico de atrito; a tensao depende mais do contexto e do timing.";
  const symbolicBlend = [
    shenShaA.themes.length ? `A traz ${shenShaA.themes.join("/")}` : null,
    shenShaB.themes.length ? `B traz ${shenShaB.themes.join("/")}` : null,
  ]
    .filter(Boolean)
    .join(" | ") || "O vinculo depende mais da estrutura e dos elementos do que de estrelas simbolicas dominantes.";
  const relationNotes = [
    ...summarizeGanZhiInteraction(
      "Dia A",
      chartA.pillars.find((pillar) => pillar.key === "day")?.ganZhi ?? "--",
      "Dia B",
      chartB.pillars.find((pillar) => pillar.key === "day")?.ganZhi ?? "--"
    ),
    ...summarizeGanZhiInteraction(
      "Mes A",
      chartA.pillars.find((pillar) => pillar.key === "month")?.ganZhi ?? "--",
      "Mes B",
      chartB.pillars.find((pillar) => pillar.key === "month")?.ganZhi ?? "--"
    ),
  ];

  return [
    {
      title: "Eixo dos Mestres do Dia",
      items: [
        { label: "Pessoa A", value: `${chartA.dayMaster.label} (${chartA.dayMaster.tone})` },
        { label: "Pessoa B", value: `${chartB.dayMaster.label} (${chartB.dayMaster.tone})` },
        { label: "Mesma natureza elementar", value: sharedDayMaster ? "Sim" : "Nao" },
        {
          label: "Dinamica entre Mestres do Dia",
          value: describeElementDynamic(chartA.dayMaster.element, chartB.dayMaster.element),
        },
        { label: "Ramo do Dia A", value: chartA.pillars.find((pillar) => pillar.key === "day")?.animal ?? "--" },
        { label: "Ramo do Dia B", value: chartB.pillars.find((pillar) => pillar.key === "day")?.animal ?? "--" },
      ],
      bullets: relationNotes.length
        ? relationNotes
        : ["Sem ativacao classica forte entre os eixos de Dia e Mes nesta comparacao."],
    },
    {
      title: "Pulso elementar",
      items: [
        { label: "Elemento mais forte de A", value: chartA.elementScores[0].element },
        { label: "Elemento mais forte de B", value: chartB.elementScores[0].element },
        {
          label: "Apoio interno de A",
          value: `${chartA.analysis.strength.supportiveShare}% apoio | ${chartA.analysis.strength.hostileShare}% desgaste`,
        },
        {
          label: "Apoio interno de B",
          value: `${chartB.analysis.strength.supportiveShare}% apoio | ${chartB.analysis.strength.hostileShare}% desgaste`,
        },
        {
          label: "Yong Shen provavel de A",
          value: yongA,
        },
        {
          label: "Yong Shen provavel de B",
          value: yongB,
        },
        { label: "Integridade estrutural de A", value: structureA.formedState },
        { label: "Integridade estrutural de B", value: structureB.formedState },
        { label: "Shen Sha de A", value: joinOrFallback(shenShaA.overall, "Sem estrela simbolica dominante") },
        { label: "Shen Sha de B", value: joinOrFallback(shenShaB.overall, "Sem estrela simbolica dominante") },
      ],
      bullets: [
        `Visiveis A: ${chartA.pillars.map((pillar) => `${pillar.label}:${pillar.tenGod}`).join(" | ")}`,
        `Visiveis B: ${chartB.pillars.map((pillar) => `${pillar.label}:${pillar.tenGod}`).join(" | ")}`,
      ],
    },
    {
      title: "Convergencia tecnica do par",
      items: [
        { label: "Clima de A", value: `${chartA.analysis.season} | ${chartA.analysis.climate.dominant}` },
        { label: "Clima de B", value: `${chartB.analysis.season} | ${chartB.analysis.climate.dominant}` },
        { label: "Elemento de A para B", value: describeElementDynamic(dominantA, dominantB) },
        { label: "Elemento de B para A", value: describeElementDynamic(dominantB, dominantA) },
        { label: "Fator harmonico do par", value: mutualSupport },
        { label: "Fator de tensao do par", value: mutualPressure },
        {
          label: "Favorabilidade cruzada",
          value: `Dominante de B em A: ${aReceivesB ? "favorece" : "nao favorece"} | dominante de A em B: ${bReceivesA ? "favorece" : "nao favorece"}`,
        },
        {
          label: "Pressao cruzada",
          value: `Dominante de B em A: ${aPressedByB ? "pressiona" : "nao pressiona"} | dominante de A em B: ${bPressedByA ? "pressiona" : "nao pressiona"}`,
        },
        {
          label: "Elementos favoraveis conjuntos",
          value: formatElementList(
            chartA.analysis.favorableElements.filter((element) =>
              chartB.analysis.favorableElements.includes(element)
            )
          ),
        },
        {
          label: "Elementos sensiveis conjuntos",
          value: formatElementList(
            chartA.analysis.unfavorableElements.filter((element) =>
              chartB.analysis.unfavorableElements.includes(element)
            )
          ),
        },
        { label: "Ponte de conciliacao do par", value: reconciliationBridge },
        { label: "Eixo de atrito do par", value: frictionAxis },
        { label: "Tom simbolico do par", value: symbolicBlend },
        { label: "Ajuste mutuo de Yong Shen", value: mutualYong },
        { label: "Estado estrutural do vinculo", value: structuralHandshake },
      ],
    },
  ];
}

export function buildBaziAnnualBlocks(
  natalInput: BaziInput,
  natalChart: BaziChart,
  periodChart: BaziChart
): DetailBlock[] {
  const schoolModeLabel = getSchoolModeLabel(natalInput.schoolMode);
  const schoolModeNotes = getSchoolModeNotes(natalInput.schoolMode);
  const natalUseful = getUsefulGodSet(natalChart, natalChart.analysis.season);
  const natalStructure = buildStructureProfile(natalChart, natalChart.analysis.season);
  const cycle = buildCycleFlow(natalInput, natalChart, periodChart, natalUseful, natalStructure);
  const annualPillar = periodChart.pillars.find((pillar) => pillar.key === "year");
  const monthPillar = periodChart.pillars.find((pillar) => pillar.key === "month");
  const dayPillar = periodChart.pillars.find((pillar) => pillar.key === "day");
  const hourPillar = periodChart.pillars.find((pillar) => pillar.key === "hour");
  const periodUseful = getUsefulGodSet(periodChart, periodChart.analysis.season);
  const periodStructure = buildStructureProfile(periodChart, periodChart.analysis.season);
  const periodRelations = buildBranchRelations(periodChart);
  const periodShenSha = buildShenShaProfile(periodChart);
  const remoteBranchRules = usesRemoteBranchRules(natalInput.schoolMode);
  const periodModules = buildTechnicalRoleModules(periodChart, periodUseful, periodStructure);
  const spousePalace = natalChart.pillars.find((pillar) => pillar.key === "day");
  const transitLead = periodChart.elementScores[0].element;
  const transitHelpsNatal = natalChart.analysis.favorableElements.includes(transitLead);
  const transitPressesNatal = natalChart.analysis.unfavorableElements.includes(transitLead);
  const temporalProfile = buildTemporalAdjustmentProfile(
    natalChart,
    periodChart,
    natalUseful,
    natalStructure,
    periodUseful,
    periodStructure
  );
  const interactions = [
    ...summarizeGanZhiInteraction(
      "Natal Dia",
      natalChart.pillars.find((pillar) => pillar.key === "day")?.ganZhi ?? "--",
      "Da Yun",
      cycle.daYun
    ),
    ...summarizeGanZhiInteraction(
      "Natal Dia",
      natalChart.pillars.find((pillar) => pillar.key === "day")?.ganZhi ?? "--",
      "Liu Nian",
      cycle.liuNian
    ),
    ...summarizeGanZhiInteraction("Da Yun", cycle.daYun, "Liu Nian", cycle.liuNian),
    ...summarizeGanZhiInteraction("Liu Nian", cycle.liuNian, "Liu Yue", cycle.liuYue),
    ...summarizeGanZhiInteraction("Liu Yue", cycle.liuYue, "Liu Ri", dayPillar?.ganZhi ?? "--"),
    ...summarizeGanZhiInteraction("Liu Ri", dayPillar?.ganZhi ?? "--", "Liu Shi", hourPillar?.ganZhi ?? "--"),
  ];
  const matrixRows = buildInteractionMatrixRows(
    natalChart,
    natalUseful,
    cycle,
    dayPillar?.ganZhi ?? "--",
    hourPillar?.ganZhi ?? "--"
  );
  const kongWangTemporalRows = buildKongWangActivationLines(natalChart, [
    { label: "Da Yun", ganZhi: cycle.daYun, xunKong: cycle.daYunVoid },
    { label: "Xiao Yun", ganZhi: cycle.xiaoYun, xunKong: cycle.xiaoYunVoid },
    { label: "Liu Nian", ganZhi: cycle.liuNian, xunKong: cycle.liuNianVoid },
    { label: "Liu Yue", ganZhi: cycle.liuYue, xunKong: cycle.liuYueVoid },
    { label: "Liu Ri", ganZhi: dayPillar?.ganZhi ?? "--", xunKong: dayPillar?.xunKong ?? "--" },
    { label: "Liu Shi", ganZhi: hourPillar?.ganZhi ?? "--", xunKong: hourPillar?.xunKong ?? "--" },
  ]);
  const temporalMuKuLines = getVisiblePillars(natalChart)
    .filter((pillar) => Boolean(MU_KU_BRANCH_INFO[pillar.branch]))
    .map((pillar) =>
      buildMuKuStatusLine(natalChart, pillar, [
        cycle.daYun,
        cycle.xiaoYun,
        cycle.liuNian,
        cycle.liuYue,
        dayPillar?.ganZhi ?? "--",
        hourPillar?.ganZhi ?? "--",
      ])
    );
  const spouseCycleLines = spousePalace
    ? [
        ...summarizeGanZhiInteraction("Palacio do Conjuge", spousePalace.ganZhi, "Da Yun", cycle.daYun),
        ...summarizeGanZhiInteraction("Palacio do Conjuge", spousePalace.ganZhi, "Liu Nian", cycle.liuNian),
        ...summarizeGanZhiInteraction("Palacio do Conjuge", spousePalace.ganZhi, "Liu Yue", cycle.liuYue),
        ...summarizeGanZhiInteraction("Palacio do Conjuge", spousePalace.ganZhi, "Liu Ri", dayPillar?.ganZhi ?? "--"),
        ...summarizeGanZhiInteraction("Palacio do Conjuge", spousePalace.ganZhi, "Liu Shi", hourPillar?.ganZhi ?? "--"),
      ]
    : [];

  return [
    {
      title: "Escola e convencoes tecnicas",
      items: [
        { label: "Escola / linha usada", value: schoolModeLabel },
        { label: "Metodo do Yun", value: cycle.methodLabel },
        { label: "Formula de conversao do Yun", value: cycle.methodFormula },
      ],
      bullets: schoolModeNotes,
    },
    {
      title: "Metodo do Yun e entrada do primeiro Da Yun",
      items: [
        { label: "Sexo/genero tecnico do nativo", value: cycle.genderLabel },
        { label: "Polaridade do ano natal", value: cycle.yearPolarity },
        { label: "Sentido do Yun", value: cycle.directionLabel },
        { label: "Regra da direcao dos Da Yun", value: cycle.directionRule },
        { label: "Metodo do Yun", value: cycle.methodLabel },
        { label: "Formula de conversao do Yun", value: cycle.methodFormula },
        { label: "Jie usado como referencia", value: cycle.referenceJie },
        { label: "Distancia tecnica ate o primeiro Yun", value: cycle.referenceDistance },
        { label: "Entrada no primeiro Da Yun", value: `${cycle.firstDaYunStartSolar} | ${cycle.startOffset}` },
        { label: "Primeiro Da Yun", value: cycle.firstDaYun },
        { label: "Faixa do primeiro Da Yun", value: cycle.firstDaYunAgeRange },
        { label: "Fim tecnico do primeiro Da Yun", value: cycle.firstDaYunEndSolar },
        { label: "Virada do Da Yun seguinte", value: cycle.firstDaYunSwitchSolar },
      ],
      bullets: [
        `Inicio tecnico geral do Yun: ${cycle.startSolar}.`,
        `Ano natal ${cycle.yearStem} / ${cycle.yearPolarity}.`,
      ],
    },
    {
      title: "Catalogo tecnico dos Da Yun",
      items: [
        { label: "Da Yun corrente", value: `${cycle.daYun} | ${cycle.daYunRole} | Kong Wang ${cycle.daYunVoid}` },
        { label: "Liu Nian corrente", value: `${cycle.liuNian} | ${cycle.liuNianRole} | Kong Wang ${cycle.liuNianVoid}` },
        { label: "Liu Yue corrente", value: `${cycle.liuYue} | ${cycle.liuYueRole} | Kong Wang ${cycle.liuYueVoid}` },
        { label: "Liu Ri corrente", value: `${dayPillar?.ganZhi ?? "--"} ${dayPillar?.animal ?? ""}` },
        { label: "Liu Shi corrente", value: `${hourPillar?.ganZhi ?? "--"} ${hourPillar?.animal ?? ""}` },
      ],
      bullets: cycle.daYunTable,
    },
    {
      title: "Xiao Yun e Liu Nian auditaveis",
      items: [
        {
          label: "Uso de Xiao Yun",
          value: cycle.preDaYunXiaoYunTable.length
            ? "Camada auxiliar ativada no motor; listada antes do primeiro Da Yun e dentro do Da Yun vigente."
            : "Sem camada auxiliar listada antes do primeiro Da Yun neste recorte.",
        },
        {
          label: "Xiao Yun antes do primeiro Da Yun",
          value: cycle.preDaYunXiaoYunTable.length
            ? `${cycle.preDaYunXiaoYunTable.length} ano(s) de idade calculados antes da entrada no primeiro Da Yun`
            : "Sem anos previos suficientes para listar Xiao Yun pre-Da Yun",
        },
        {
          label: "Xiao Yun no Da Yun vigente",
          value: cycle.currentDaYunXiaoYunTable.length
            ? `${cycle.currentDaYunXiaoYunTable.length} camadas anuais auxiliares calculadas no Da Yun corrente`
            : "Sem Da Yun vigente para derivar Xiao Yun",
        },
        {
          label: "Liu Nian no Da Yun vigente",
          value: cycle.currentDaYunLiuNianTable.length
            ? `${cycle.currentDaYunLiuNianTable.length} anos tecnicos listados dentro do Da Yun corrente`
            : "Sem Da Yun vigente para listar Liu Nian",
        },
        { label: "Liu Nian tecnico corrente", value: cycle.liuNianDetail },
        { label: "Liu Yue tecnico corrente", value: cycle.liuYueDetail },
        { label: "Liu Ri tecnico corrente", value: cycle.liuRiDetail },
        { label: "Liu Shi tecnico corrente", value: cycle.liuShiDetail },
      ],
      bullets: [
        ...cycle.preDaYunXiaoYunTable.map((line) => `Pre-Da Yun | ${line}`),
        ...cycle.currentDaYunXiaoYunTable.map((line) => `Xiao Yun vigente | ${line}`),
        ...cycle.currentDaYunLiuNianTable.map((line) => `Liu Nian do Da Yun | ${line}`),
      ],
    },
    {
      title: "Ciclos correntes",
      items: [
        { label: "Da Yun", value: `${cycle.daYun} | ${cycle.daYunRole} | Kong Wang ${cycle.daYunVoid}` },
        { label: "Xiao Yun", value: `${cycle.xiaoYun} | ${cycle.xiaoYunRole} | Kong Wang ${cycle.xiaoYunVoid}` },
        { label: "Liu Nian", value: `${cycle.liuNian} | ${cycle.liuNianRole} | Kong Wang ${cycle.liuNianVoid}` },
        { label: "Liu Yue", value: `${cycle.liuYue} | ${cycle.liuYueRole} | Kong Wang ${cycle.liuYueVoid}` },
        { label: "Liu Ri", value: `${dayPillar?.ganZhi ?? "--"} ${dayPillar?.animal ?? ""}` },
        { label: "Liu Shi", value: `${hourPillar?.ganZhi ?? "--"} ${hourPillar?.animal ?? ""}` },
        { label: "Inicio do Da Yun", value: `${cycle.startSolar} | ${cycle.startOffset}` },
        { label: "Sentido do Yun", value: cycle.directionLabel },
        {
          label: "Pulso do periodo",
          value: `${periodChart.analysis.strength.supportiveShare}% apoio | ${periodChart.analysis.strength.hostileShare}% desgaste`,
        },
        { label: "Elemento dominante do periodo", value: transitLead },
        { label: "Estrutura do periodo", value: periodStructure.summary },
        { label: "Estrutura selecionada do periodo", value: periodStructure.selectedStructure },
        { label: "Integridade do periodo", value: periodStructure.formedState },
        { label: "Regra estrutural da escola", value: periodStructure.schoolBias },
        { label: "Yong Shen do periodo", value: periodUseful.yong },
        { label: "Logica do Yong do periodo", value: periodUseful.note },
        { label: "Shen Sha do periodo", value: joinOrFallback(periodShenSha.overall, "Sem Shen Sha dominante no periodo") },
        { label: "Temas simbolicos do periodo", value: joinOrFallback(periodShenSha.themes, "Sem tema simbolico dominante") },
        { label: "Quadro tecnico das estrelas do periodo", value: periodShenSha.summary },
        { label: "Resgate estrutural do periodo", value: temporalProfile.rescueText },
        { label: "Atrito estrutural do periodo", value: temporalProfile.pressureText },
        { label: "Yong do natal ativado no periodo", value: temporalProfile.activationText },
        { label: "Estrutura natal tocada pelo periodo", value: temporalProfile.structuralText },
        { label: "Area do natal mais tocada", value: temporalProfile.areaText },
        { label: "Saldo tecnico do periodo", value: temporalProfile.diagnosis },
        {
          label: "Transito favorece o natal",
          value: transitHelpsNatal ? "Sim, ativa elemento util ao mapa natal" : "Nao de forma direta",
        },
        {
          label: "Transito pressiona o natal",
          value: transitPressesNatal ? "Sim, toca elemento sensivel do natal" : "Nao de forma dominante",
        },
      ],
    },
    {
      title: "Catalogo estrutural do periodo",
      items: [
        {
          label: "Gate de aprovacao do periodo",
          value: `Estruturas regulares >= ${periodStructure.regularThreshold} | estruturas especiais >= ${periodStructure.specialThreshold}`,
        },
        {
          label: "Estruturas aprovadas no periodo",
          value:
            periodStructure.catalog
              .filter((row) => row.status === "Passou")
              .map((row) => row.name)
              .join(" | ") || "Nenhuma estrutura do periodo passou acima do gate",
        },
        {
          label: "Estruturas concorrentes no periodo",
          value:
            periodStructure.catalog
              .filter((row) => row.status === "Concorrente")
              .map((row) => row.name)
              .join(" | ") || "Sem estrutura concorrente destacada no periodo",
        },
      ],
      bullets: periodStructure.catalog.map(
        (row) =>
          `${row.name}: ${row.status} | score ${row.score} | cobertura ${row.coverage} | confianca ${row.confidence} | ${row.note}`
      ),
    },
    {
      title: "Shen Sha temporal e regras",
      items: [
        { label: "Modo da biblioteca de estrelas", value: periodShenSha.libraryMode },
        { label: "Shen Sha do periodo", value: joinOrFallback(periodShenSha.overall, "Sem Shen Sha dominante no periodo") },
        { label: "Regras auditaveis ativas", value: periodShenSha.ruleLines.join(" || ") || "Sem regra adicional ativa" },
      ],
      bullets: periodShenSha.catalogLines,
    },
    {
      title: "Modulos tecnicos do periodo",
      items: [
        { label: "Riqueza no periodo", value: periodModules.wealth },
        { label: "Carreira/autoridade no periodo", value: periodModules.authority },
        { label: "Estudo/protecao no periodo", value: periodModules.resource },
        { label: "Producao/talento no periodo", value: periodModules.output },
        { label: "Competicao/paridade no periodo", value: periodModules.parity },
        { label: "Empreendimento/especulacao no periodo", value: periodModules.enterprise },
        { label: "Status/cargo no periodo", value: periodModules.status },
      ],
    },
    {
      title: "Palacios e armazens sob ativacao",
      items: [
        {
          label: "Palacio do Conjuge sob ciclos",
          value: spouseCycleLines.join(" | ") || "Sem ativacao maior do Palacio do Conjuge no recorte corrente",
        },
        {
          label: "Mu Ku natal sob ciclos",
          value: temporalMuKuLines.join(" || ") || "Sem Mu Ku natal para abrir ou pressionar neste recorte",
        },
        {
          label: "Ban He no periodo",
          value: joinOrFallback(periodRelations.banHe, "Sem meia combinacao dominante no recorte temporal"),
        },
        {
          label: "An He no periodo",
          value: joinOrFallback(periodRelations.anHe, "Sem An He dominante no proprio quadro temporal"),
        },
        {
          label: "Yao He no periodo",
          value: joinOrFallback(
            periodRelations.yaoHe,
            remoteBranchRules
              ? "Sem Yao He fechado no proprio quadro temporal"
              : "Regra opcional desativada nesta escola"
          ),
        },
        {
          label: "Yao Chong no periodo",
          value: joinOrFallback(
            periodRelations.yaoChong,
            remoteBranchRules
              ? "Sem Yao Chong fechado no proprio quadro temporal"
              : "Regra opcional desativada nesta escola"
          ),
        },
        {
          label: "Abertura de armazem no periodo",
          value: joinOrFallback(periodRelations.muKuOpenings, "Sem abertura de armazem no proprio quadro temporal"),
        },
        {
          label: "Fechamento de armazem no periodo",
          value: joinOrFallback(periodRelations.muKuClosings, "Sem fechamento de armazem por combinacao no proprio quadro temporal"),
        },
      ],
      bullets: [
        `Ativacao palacial por Da Yun: ${buildPalaceActivationNotes(natalChart, cycle.daYun)}`,
        `Ativacao palacial por Liu Nian: ${buildPalaceActivationNotes(natalChart, cycle.liuNian)}`,
        `Ativacao palacial por Liu Yue: ${buildPalaceActivationNotes(natalChart, cycle.liuYue)}`,
      ],
    },
    {
      title: "Interacoes entre camadas",
      items: [
        { label: "Mapa natal + Da Yun", value: interactions.filter((item) => item.includes("Da Yun") && item.includes("Natal")).join(" | ") || "Sem aspecto maior" },
        { label: "Mapa natal + Liu Nian", value: interactions.filter((item) => item.includes("Liu Nian") && item.includes("Natal")).join(" | ") || "Sem aspecto maior" },
        { label: "Da Yun + Liu Nian", value: interactions.filter((item) => item.includes("Da Yun") && item.includes("Liu Nian")).join(" | ") || "Sem aspecto maior" },
        { label: "Liu Nian + Liu Yue", value: interactions.filter((item) => item.includes("Liu Nian") && item.includes("Liu Yue")).join(" | ") || "Sem aspecto maior" },
        { label: "Liu Yue + Liu Ri", value: interactions.filter((item) => item.includes("Liu Yue") && item.includes("Liu Ri")).join(" | ") || "Sem aspecto maior" },
        { label: "Liu Ri + Liu Shi", value: interactions.filter((item) => item.includes("Liu Ri") && item.includes("Liu Shi")).join(" | ") || "Sem aspecto maior" },
        { label: "Ritmo estrutural do periodo", value: temporalProfile.periodStructuralRhythm },
      ],
      bullets: [
        `Pilar anual: ${annualPillar ? formatPillarLabel(annualPillar) : "--"}`,
        `Pilar mensal: ${monthPillar ? formatPillarLabel(monthPillar) : "--"}`,
        `Pilar diario: ${dayPillar ? formatPillarLabel(dayPillar) : "--"}`,
        `Pilar horario: ${hourPillar ? formatPillarLabel(hourPillar) : "--"}`,
      ],
    },
    {
      title: "Kong Wang temporal e matriz completa",
      items: [
        {
          label: "Kong Wang natal por pilar",
          value: getVisiblePillars(natalChart).map((pillar) => `${pillar.label}:${pillar.xunKong || "--"}`).join(" | "),
        },
        { label: "Kong Wang do Da Yun", value: cycle.daYunVoid },
        { label: "Kong Wang do Xiao Yun", value: cycle.xiaoYunVoid },
        { label: "Kong Wang do Liu Nian", value: cycle.liuNianVoid },
        { label: "Kong Wang do Liu Yue", value: cycle.liuYueVoid },
        {
          label: "Ativacoes temporais do vazio",
          value: kongWangTemporalRows.join(" | ") || "Sem ativacao temporal dominante do Kong Wang neste recorte",
        },
      ],
      bullets: matrixRows,
    },
  ];
}

export function buildZiWeiBlocks(chart: BaziChart, profile: ZiWeiProfile): DetailBlock[] {
  const lunar = getLunarFromChart(chart);
  const mingPalace = profile.palaceHighlights.find((palace) => palace.key === "MING");
  const bodyPalace = profile.palaceHighlights.find((palace) => palace.isBodyPalace);
  const spousePalace = profile.palaceHighlights.find((palace) => palace.key === "FU_QI");
  const wealthPalace = profile.palaceHighlights.find((palace) => palace.key === "CAI_BO");
  const careerPalace = profile.palaceHighlights.find((palace) => palace.key === "GUAN_LU");
  const healthPalace = profile.palaceHighlights.find((palace) => palace.key === "JI_E");
  const transformedPalaces = profile.palaceHighlights.filter(
    (palace) =>
      palace.yearTransformations.length ||
      palace.selfTransformations.length ||
      palace.flyingStars.length
  );
  const palaceRoster = profile.palaceHighlights.map((palace) => {
    const major = palace.majorStars
      .map((star) => (star.mutagen ? `${star.name}化${star.mutagen}` : star.name))
      .join("/");
    const minor = palace.minorStars.map((star) => star.name).join("/");
    const adjective = palace.adjectiveStars.map((star) => star.name).join("/");

    return `${palace.name} (${palace.chineseName}) ${palace.ganZhi} | grande periodo ${palace.ageRange} | principais ${
      major || "--"
    } | auxiliares ${minor || "--"} | adjetivas ${adjective || "--"} | 12长生 ${palace.changsheng12} | 博士 ${
      palace.boshi12
    } | 四化/飞化 ${palace.flyingStars.join("/") || "--"}`;
  });
  const currentHoroscopeLines = profile.currentHoroscope.map(
    (entry) => `${entry.label} | ${entry.palace}`
  );
  const layerLines = profile.horoscopeLayers.map(
    (layer) =>
      `${layer.label} ${layer.ganZhi} | ancora ${layer.activePalace} ${layer.activePalaceGanZhi} => papel ${
        layer.rolePalace
      } | 四化 ${joinOrFallback(layer.mutagen, "--")} | estrelas dinamicas ${layer.starCount}`
  );
  const trineBullets = profile.trineHighlights.flatMap((trine) => [
    `${trine.title}: ${trine.targetPalace}`,
    `Membros: ${trine.members.join(" | ")}`,
    `Eixo estelar: ${trine.starDigest.join(" || ")}`,
  ]);
  const relationBullets = profile.relationHighlights.flatMap((relation) => [
    `${relation.title}: ${relation.palace}`,
    `Oposto ${relation.oppositePalace} | riqueza ${relation.wealthPalace} | carreira ${relation.careerPalace}`,
    `Destinos 飞化 ${joinOrFallback(relation.flyTargets, "--")} | voa para oposto ${
      relation.fliesToOpposite ? "sim" : "nao"
    } | voa para riqueza ${relation.fliesToWealth ? "sim" : "nao"} | voa para carreira ${
      relation.fliesToCareer ? "sim" : "nao"
    } | 自化 ${relation.selfMutaged ? "sim" : "nao"} | 空宫 ${relation.isEmpty ? "sim" : "nao"}`,
  ]);
  const temporalRelationBullets = profile.temporalRelationHighlights.flatMap((entry) => [
    `${entry.label}: ${entry.palace} => ${entry.roleAtTarget} | oposto ${entry.oppositeRole} | riqueza ${entry.wealthRole} | carreira ${entry.careerRole}`,
    `四化 ${joinOrFallback(entry.mutagen, "--")} | estrelas no alvo ${joinOrFallback(
      entry.targetStars,
      "--"
    )} | eixos ${entry.axisStars.join(" || ")}`,
  ]);
  const starCatalogBullets = profile.starCatalog.map(
    (entry) =>
      `${entry.name} [${joinOrFallback(entry.families, "--")}] | natal ${joinOrFallback(
        entry.natalPalaces,
        "--"
      )} | timing ${joinOrFallback(entry.dynamicScopes, "--")} | brilho ${joinOrFallback(
        entry.brightnesses,
        "--"
      )} | 四化 ${joinOrFallback(entry.mutagens, "--")} | ativacoes ${joinOrFallback(
        entry.temporalActivations.slice(0, 4),
        "--"
      )}`
  );
  const borrowBullets = profile.borrowedStarProfiles.flatMap((entry) => [
    `${entry.palace}: 空宫 ${entry.isEmpty ? "sim" : "nao"} | empresta de ${entry.borrowedFrom}`,
    `Principais emprestadas: ${joinOrFallback(entry.borrowedMajorStars, "--")} | regra ${entry.rule}`,
  ]);
  const temporalMatrixBullets = profile.horoscopeLayers.flatMap((layer) => {
    const rows = profile.temporalMatrix.filter((entry) => entry.scope === layer.scope);

    return [
      `${layer.label} ${layer.ganZhi}: ${rows.length} linhas no recorte palacio x camada`,
      ...rows
        .slice(0, 12)
        .map(
          (entry) =>
            `${entry.palace} ${entry.ganZhi} => ${entry.role} | estrelas ${joinOrFallback(
              entry.stars,
              "--"
            )} | op ${entry.oppositeRole} | riqueza ${entry.wealthRole} | carreira ${entry.careerRole}`
        ),
    ];
  });

  return [
    {
      title: "Base do astrolabio",
      items: [
        { label: "Calendario solar", value: profile.solarDate },
        { label: "Hora solar verdadeira", value: profile.trueSolarDate ?? "Nao aplicada neste calculo" },
        { label: "Calendario lunar", value: profile.lunarDateLabel },
        { label: "Ganzhi do nascimento", value: profile.sexagenaryDate ?? "--" },
        { label: "Genero tecnico / zodiaco", value: `${profile.genderLabel} | ${profile.zodiac}` },
        { label: "Cinco Elementos Bureau", value: profile.fiveElementBureau },
        { label: "Direcao dos grandes periodos", value: profile.horoscopeDirection },
        { label: "Motor tecnico", value: profile.coverage.engine },
        { label: "Preset tecnico", value: profile.enginePreset.label },
        {
          label: "Configuracao efetiva",
          value: `algorithm=${profile.enginePreset.algorithm} | year=${profile.enginePreset.yearDivide} | horoscope=${profile.enginePreset.horoscopeDivide} | age=${profile.enginePreset.ageDivide} | day=${profile.enginePreset.dayDivide}`,
        },
        { label: "Posicao de Zi Wei", value: profile.ziweiStarBranch },
        { label: "Indice horario de nascimento", value: `${profile.birthTimeIndex} | ${profile.birthTimeRange}` },
        { label: "Momento de consulta", value: profile.consultationMoment },
      ],
      bullets: [
        `Descricao do preset: ${profile.enginePreset.description}`,
        `Ming Gong Na Yin: ${profile.mingGongNaYin}`,
        `Shen Gong Na Yin: ${profile.shenGongNaYin}`,
        `命主 / 身主: ${profile.soulStar} | ${profile.bodyStar}`,
        `Jie anterior / proximo: ${lunar.getPrevJie(true).toString()} -> ${lunar.getNextJie(true).toString()}`,
        `Qi anterior / proximo: ${lunar.getPrevQi(true).toString()} -> ${lunar.getNextQi(true).toString()}`,
      ],
    },
    {
      title: "Cobertura do motor e catalogo",
      items: [
        { label: "Catalogo auditado da biblioteca", value: `>= ${profile.coverage.expectedFloor} estrelas` },
        { label: "Estimativa local do catalogo", value: `${profile.coverage.libraryEstimatedStarCount} nomes tecnicos` },
        { label: "Estrelas unicas no natal", value: `${profile.coverage.observedNatalUniqueStars}` },
        { label: "Estrelas unicas no recorte temporal", value: `${profile.coverage.observedDynamicUniqueStars}` },
        { label: "Estrelas unicas combinadas", value: `${profile.coverage.observedCombinedUniqueStars}` },
        { label: "Entradas do catalogo observado", value: `${profile.starCatalog.length}` },
        { label: "Camadas temporais expostas", value: profile.horoscopeLayers.map((layer) => layer.label).join(" | ") },
        { label: "Palacios do natal", value: `${profile.coverage.palaceCount}` },
        { label: "Palacios com vazio / emprestimo", value: `${profile.borrowedStarProfiles.length}` },
        { label: "Relacoes natais expostas", value: `${profile.relationHighlights.length}` },
        { label: "Relacoes temporais expostas", value: `${profile.temporalRelationHighlights.length}` },
        { label: "Modo tecnico suportado", value: joinOrFallback(profile.coverage.supports, "--") },
      ],
      bullets: [
        `Observado no natal: ${joinOrFallback(profile.observedNatalStars, "--")}`,
        `Observado no timing: ${joinOrFallback(profile.observedDynamicStars, "--")}`,
      ],
    },
    {
      title: "Eixos centrais e palacios-chave",
      items: [
        { label: "Ming Gong", value: `${profile.mingPalaceName} | ${profile.mingGong}` },
        { label: "Shen Gong", value: `${profile.shenPalaceName} | ${profile.shenGong}` },
        { label: "Palacio do Destino", value: mingPalace ? `${mingPalace.ganZhi} | ${mingPalace.branch}` : "--" },
        { label: "Palacio do Corpo", value: bodyPalace ? `${bodyPalace.name} | ${bodyPalace.ganZhi} | ${bodyPalace.branch}` : "--" },
        { label: "Palacio do Casamento", value: spousePalace ? `${spousePalace.ganZhi} | ${spousePalace.branch}` : "--" },
        { label: "Palacio da Riqueza", value: wealthPalace ? `${wealthPalace.ganZhi} | ${wealthPalace.branch}` : "--" },
        { label: "Palacio da Carreira", value: careerPalace ? `${careerPalace.ganZhi} | ${careerPalace.branch}` : "--" },
        { label: "Palacio da Saude", value: healthPalace ? `${healthPalace.ganZhi} | ${healthPalace.branch}` : "--" },
        { label: "Grande periodo corrente", value: `${profile.currentDecadePalace} | ${profile.currentDecadeRange}` },
      ],
      bullets: profile.keyAxes,
    },
    {
      title: "Palacios, estrelas, brilho e 12 estados",
      items: [
        { label: "12 palacios", value: profile.palaceHighlights.map((palace) => palace.name).join(" | ") },
        {
          label: "Palacios com estrelas principais",
          value:
            profile.palaceHighlights
              .filter((palace) => palace.majorStars.length)
              .map((palace) => `${palace.name}:${palace.majorStars.map((star) => star.name).join("/")}`)
              .join(" | ") || "--",
        },
        {
          label: "Palacios com estrelas auxiliares",
          value:
            profile.palaceHighlights
              .filter((palace) => palace.minorStars.length)
              .map((palace) => `${palace.name}:${palace.minorStars.map((star) => star.name).join("/")}`)
              .join(" | ") || "--",
        },
        {
          label: "Palacios com estrelas adjetivas",
          value:
            profile.palaceHighlights
              .filter((palace) => palace.adjectiveStars.length)
              .map((palace) => `${palace.name}:${palace.adjectiveStars.map((star) => star.name).join("/")}`)
              .join(" | ") || "--",
        },
        {
          label: "Palacios vazios",
          value:
            profile.palaceHighlights
              .filter((palace) => palace.isEmpty)
              .map((palace) => `${palace.name} ${palace.ganZhi}`)
              .join(" | ") || "Sem palacio vazio no criterio atual",
        },
        {
          label: "Lai Yin Gong",
          value:
            profile.palaceHighlights
              .filter((palace) => palace.isLaiYin)
              .map((palace) => `${palace.name} ${palace.ganZhi}`)
              .join(" | ") || "Nenhum palacio marcado como Lai Yin neste mapa",
        },
        {
          label: "12 Chang Sheng por palacio",
          value: profile.palaceHighlights.map((palace) => `${palace.name}:${palace.changsheng12}`).join(" | "),
        },
        {
          label: "12 Bo Shi por palacio",
          value: profile.palaceHighlights.map((palace) => `${palace.name}:${palace.boshi12}`).join(" | "),
        },
      ],
      bullets: palaceRoster,
    },
    {
      title: "Kong Gong e Jie Xing tecnico",
      items: profile.borrowedStarProfiles.map((entry) => ({
        label: entry.palace,
        value: `空宫 ${entry.isEmpty ? "sim" : "nao"} | empresta de ${entry.borrowedFrom} | principais ${joinOrFallback(
          entry.borrowedMajorStars,
          "--"
        )}`,
      })),
      bullets: borrowBullets.length
        ? borrowBullets
        : ["Nenhum palacio vazio exigiu ficha tecnica de emprestimo por oposicao neste recorte."],
    },
    {
      title: "Catalogo estrela por estrela",
      items: profile.starCatalog.map((entry) => ({
        label: `${entry.name} | ${joinOrFallback(entry.families, "--")}`,
        value: `natal ${joinOrFallback(entry.natalPalaces, "--")} | timing ${joinOrFallback(
          entry.dynamicScopes,
          "--"
        )} | brilho ${joinOrFallback(entry.brightnesses, "--")} | 四化 ${joinOrFallback(
          entry.mutagens,
          "--"
        )} | 五行 ${entry.fiveElements ?? "--"} | 阴阳 ${entry.yinYang ?? "--"}`,
      })),
      bullets: starCatalogBullets,
    },
    {
      title: "San Fang Si Zheng e oposicoes reais",
      items: [
        { label: "三方四正 do Ming Gong", value: mingPalace?.surroundedPalaces.join(" | ") || "--" },
        { label: "三方四正 do Palacio do Casamento", value: spousePalace?.surroundedPalaces.join(" | ") || "--" },
        { label: "三方四正 do Palacio da Riqueza", value: wealthPalace?.surroundedPalaces.join(" | ") || "--" },
        { label: "三方四正 do Palacio da Carreira", value: careerPalace?.surroundedPalaces.join(" | ") || "--" },
        { label: "三方四正 do Palacio do Corpo", value: bodyPalace?.surroundedPalaces.join(" | ") || "--" },
      ],
      bullets: trineBullets,
    },
    {
      title: "Relacoes de palacio, oposicao e voos",
      items: profile.relationHighlights.map((relation) => ({
        label: relation.title,
        value: `oposto ${relation.oppositePalace} | riqueza ${relation.wealthPalace} | carreira ${relation.careerPalace} | 飞化 ${joinOrFallback(
          relation.flyTargets,
          "--"
        )} | 自化 ${relation.selfMutaged ? "sim" : "nao"} | 空宫 ${relation.isEmpty ? "sim" : "nao"}`,
      })),
      bullets: relationBullets,
    },
    {
      title: "Quatro transformacoes, 自化 e 飞化",
      items: [
        { label: "Quatro transformacoes natais", value: joinOrFallback(profile.fourTransformations, "--") },
        {
          label: "Palacios com transformacao anual",
          value:
            transformedPalaces
              .filter((palace) => palace.yearTransformations.length)
              .map((palace) => `${palace.name}:${palace.yearTransformations.join("/")}`)
              .join(" | ") || "Sem palacio com transformacao anual exposta",
        },
        {
          label: "Palacios com 自化",
          value:
            transformedPalaces
              .filter((palace) => palace.selfTransformations.length)
              .map((palace) => `${palace.name}:${palace.selfTransformations.join("/")}`)
              .join(" | ") || "Sem 自化 exposta",
        },
        {
          label: "飞化 do Ming Gong",
          value: mingPalace?.flyingStars.join("/") || "--",
        },
        {
          label: "飞化 do Palacio do Casamento",
          value: spousePalace?.flyingStars.join("/") || "--",
        },
        {
          label: "飞化 do Palacio da Riqueza",
          value: wealthPalace?.flyingStars.join("/") || "--",
        },
        {
          label: "飞化 do Palacio da Carreira",
          value: careerPalace?.flyingStars.join("/") || "--",
        },
      ],
      bullets: transformedPalaces.length
        ? transformedPalaces.map(
            (palace) =>
              `${palace.name}: natal ${palace.yearTransformations.join("/") || "--"} | auto ${
                palace.selfTransformations.join("/") || "--"
              } | destinos ${palace.mutagedTargetPalaces.join("/") || "--"}`
          )
        : ["Nenhuma transformacao adicional destacada no quadro atual."],
    },
    {
      title: "Grandes periodos, timing e overlays",
      items: [
        { label: "Palacio do grande periodo corrente", value: profile.currentDecadePalace },
        { label: "Faixa do grande periodo corrente", value: profile.currentDecadeRange },
        {
          label: "Resumo das camadas temporais",
          value: currentHoroscopeLines.join(" | ") || "--",
        },
        {
          label: "Decade ranges por palacio",
          value: profile.palaceHighlights.map((palace) => `${palace.name}:${palace.ageRange}`).join(" | "),
        },
        {
          label: "Overlays por camada",
          value: layerLines.join(" | ") || "--",
        },
      ],
      bullets: profile.horoscopeLayers.flatMap((layer) => [
        `${layer.label}: ${layer.activePalace} ${layer.activePalaceGanZhi} => ${layer.rolePalace} | 四化 ${joinOrFallback(
          layer.mutagen,
          "--"
        )}`,
        ...layer.starLines.slice(0, 8),
      ]),
    },
    {
      title: "Matriz temporal de relacoes",
      items: profile.horoscopeLayers.map((layer) => {
        const relations = profile.temporalRelationHighlights.filter((entry) => entry.scope === layer.scope);

        return {
          label: `${layer.label} ${layer.ganZhi}`,
          value:
            relations
              .map(
                (entry) =>
                  `${entry.palace} => ${entry.roleAtTarget} | op ${entry.oppositeRole} | riqueza ${entry.wealthRole} | carreira ${entry.careerRole}`
              )
              .join(" || ") || "--",
        };
      }),
      bullets: temporalRelationBullets,
    },
    {
      title: "Matriz temporal completa por palacio",
      items: profile.horoscopeLayers.map((layer) => {
        const rows = profile.temporalMatrix.filter((entry) => entry.scope === layer.scope);

        return {
          label: `${layer.label} ${layer.ganZhi}`,
          value:
            rows
              .map(
                (entry) =>
                  `${entry.palace} ${entry.ganZhi} => ${entry.role} | estrelas ${joinOrFallback(
                    entry.stars,
                    "--"
                  )}`
              )
              .join(" || ") || "--",
        };
      }),
      bullets: temporalMatrixBullets,
    },
  ];
}

export function buildQiMenBlocks(profile: QiMenProfile): DetailBlock[] {
  const caseMarkerRows = [
    profile.caseMarkers.subject,
    profile.caseMarkers.object,
    profile.caseMarkers.yearAnchor,
    profile.caseMarkers.monthAnchor,
  ];
  const caseMarkerBullets = caseMarkerRows.flatMap((marker) => [
    `${marker.label}: ${marker.rule}`,
    `Portadores de ${marker.stem}: ${joinOrFallback(marker.carriers, "--")}`,
  ]);
  const patternAuditBullets = profile.patternAudits.flatMap((audit) => {
    const statusLabel =
      audit.status === "present"
        ? "presente"
        : audit.status === "candidate"
          ? "candidato"
          : "ausente";

    return [
      `${audit.name}: ${statusLabel}. ${audit.criterion}`,
      `Palacios: ${joinOrFallback(audit.palaces, "--")}`,
      ...(audit.details.length ? [`Detalhes: ${audit.details.join(" | ")}`] : []),
    ];
  });
  const directionBullets = profile.directionRatings.map(
    (rating) =>
      `${rating.palace} ${rating.direction}: ${rating.grade} | score ${rating.score} | ${joinOrFallback(
        rating.reasons,
        "sem reforco especial"
      )}`
  );
  const caseAxisBullets = [
    ...profile.caseAxisSummary,
    ...profile.caseRelationMatrix.map(
      (row) =>
        `${row.palace} ${row.direction}: tags ${joinOrFallback(row.tags, "--")} | score ${row.score} | ${joinOrFallback(
          row.notes,
          "sem nota complementar"
        )}`
    ),
  ];
  const applicationCueBullets = profile.applicationCues.flatMap((cue) => [
    `${cue.label}: ${cue.rule}`,
    `Palacios mais aderentes: ${joinOrFallback(cue.bestPalaces, "--")}`,
    `Palacios de cautela: ${joinOrFallback(cue.cautionPalaces, "--")}`,
  ]);
  const palacePlateLines = profile.palaces.map(
    (palace) =>
      `${palace.label} ${palace.direction} | 天盘 ${palace.tianPanGan} | 地盘 ${palace.diPanGan} | 人盘 ${palace.men} | 神盘 ${palace.tianPanShen} | 星 ${palace.xing} | 旺衰 ${palace.wangShuai}`
  );
  const palaceStructureLines = profile.palaces.flatMap((palace) => [
    `${palace.label}: 正格 ${joinOrFallback(palace.zhengGeNames, "--")} | 附格 ${joinOrFallback(
      palace.fuGe.activeNames,
      "--"
    )}`,
    `神煞 ${joinOrFallback(palace.shenShaNames, "--")} | 马星 ${palace.maXing ? "sim" : "nao"} | 空 ${
      palace.gongKong ? "sim" : "nao"
    } | 乙空 céu ${palace.tianPanYiKong ? "sim" : "nao"} / terra ${
      palace.diPanYiKong ? "sim" : "nao"
    }`,
  ]);
  const palaceDigestLines = profile.palaces.flatMap((palace) => [
    `${palace.label}: ${palace.summaryLine}`,
    `Liu Qin céu/terra ${palace.tianPanGanLiuQin}/${palace.diPanGanLiuQin} | Shi Shen céu/terra ${palace.tianPanGanShiShen}/${palace.diPanGanShiShen}`,
    `象意: 星 ${palace.symbolDigest.xing} | 门 ${palace.symbolDigest.men} | 神 ${palace.symbolDigest.shen}`,
    `天干/地干: ${palace.symbolDigest.tianPanGan} | ${palace.symbolDigest.diPanGan}`,
    `长生: ${joinOrFallback(palace.symbolDigest.zhangSheng, "Sem digest de crescimento")} | 宫 ${
      palace.symbolDigest.gong
    }`,
  ]);

  return [
    {
      title: "Relogio do Ju",
      items: [
        { label: "Motor tecnico", value: `${profile.engine} ${profile.engineVersion}` },
        { label: "Preset tecnico", value: profile.enginePreset.label },
        { label: "Metodo efetivo", value: profile.qiJuMethodLabel },
        { label: "Momento informado", value: profile.consultationMoment },
        { label: "Momento ajustado", value: profile.adjustedMoment },
        { label: "Correcao solar", value: profile.solarCorrectionLabel },
        { label: "Calendario lunar", value: profile.lunarDateLabel },
        {
          label: "Pilares do momento",
          value: `${profile.sexagenary.year} | ${profile.sexagenary.month} | ${profile.sexagenary.day} | ${profile.sexagenary.hour}`,
        },
      ],
      bullets: profile.summary,
    },
    {
      title: "Configuracao temporal",
      items: [
        { label: "Jie Qi anterior", value: profile.jieQiWindow.previousJie },
        { label: "Jie Qi atual", value: profile.jieQiWindow.currentJie },
        { label: "Jie Qi seguinte", value: profile.jieQiWindow.nextJie },
        { label: "Qi anterior", value: profile.jieQiWindow.previousQi },
        { label: "Qi seguinte", value: profile.jieQiWindow.nextQi },
        { label: "Dun", value: profile.dun },
        { label: "Ju number", value: profile.juNumber },
        { label: "Ju label", value: profile.juLabel },
        { label: "Ju escolhido", value: profile.chosenJuShuLabel },
        { label: "Zhi Fu", value: `${profile.zhiFu} | ${profile.zhiFuPalace}` },
        { label: "Zhi Shi", value: `${profile.zhiShi} | ${profile.zhiShiPalace}` },
        {
          label: "Xun Shou",
          value: `${profile.xunShou} | portadores ${joinOrFallback(profile.xunShouCarriers, "--")}`,
        },
      ],
    },
    {
      title: "Escopo temporal do motor",
      items: [
        { label: "Suporte anual", value: profile.temporalScopeSupport.yearly },
        { label: "Suporte mensal", value: profile.temporalScopeSupport.monthly },
        { label: "Suporte diario", value: profile.temporalScopeSupport.daily },
        { label: "Suporte horario", value: profile.temporalScopeSupport.hourly },
      ],
    },
    {
      title: "Estrutura do tabuleiro",
      items: [
        { label: "Nove palacios", value: profile.palaces.map((palace) => palace.label).join(" | ") },
        {
          label: "Prato do Ceu",
          value: profile.palaces.map((palace) => `${palace.shortLabel}:${palace.tianPanGan}`).join(" | "),
        },
        {
          label: "Prato da Terra",
          value: profile.palaces.map((palace) => `${palace.shortLabel}:${palace.diPanGan}`).join(" | "),
        },
        {
          label: "Prato humano",
          value: profile.palaces.map((palace) => `${palace.shortLabel}:${palace.men}`).join(" | "),
        },
        {
          label: "Prato espiritual",
          value: profile.palaces.map((palace) => `${palace.shortLabel}:${palace.tianPanShen}`).join(" | "),
        },
        {
          label: "Nove estrelas",
          value: profile.palaces.map((palace) => `${palace.shortLabel}:${palace.xing}`).join(" | "),
        },
        {
          label: "Oito deuses",
          value: profile.palaces.map((palace) => `${palace.shortLabel}:${palace.tianPanShen}`).join(" | "),
        },
      ],
      bullets: palacePlateLines,
    },
    {
      title: "San Qi, Liu Yi e marcadores do quadro",
      items: [
        { label: "San Qi no Ceu", value: joinOrFallback(profile.sanQiOnSky, "--") },
        { label: "San Qi na Terra", value: joinOrFallback(profile.sanQiOnEarth, "--") },
        { label: "Liu Yi no Ceu", value: joinOrFallback(profile.liuYiOnSky, "--") },
        { label: "Liu Yi na Terra", value: joinOrFallback(profile.liuYiOnEarth, "--") },
        { label: "Tian Pan Jia oculto", value: joinOrFallback(profile.tianJiaPalaces, "--") },
        { label: "Di Pan Jia oculto", value: joinOrFallback(profile.diJiaPalaces, "--") },
        { label: "Ma Xing", value: joinOrFallback(profile.maXingPalaces, "--") },
        { label: "Gong Kong", value: joinOrFallback(profile.gongKongPalaces, "--") },
        { label: "Yi Kong", value: joinOrFallback(profile.yiKongPalaces, "--") },
      ],
    },
    {
      title: "Marcadores tecnicos do caso",
      items: [
        {
          label: "Sujeito / consulente",
          value: `${profile.caseMarkers.subject.stem} | ${joinOrFallback(
            profile.caseMarkers.subject.carriers,
            "--"
          )}`,
        },
        {
          label: "Objeto / evento",
          value: `${profile.caseMarkers.object.stem} | ${joinOrFallback(
            profile.caseMarkers.object.carriers,
            "--"
          )}`,
        },
        {
          label: "Ancora anual",
          value: `${profile.caseMarkers.yearAnchor.stem} | ${joinOrFallback(
            profile.caseMarkers.yearAnchor.carriers,
            "--"
          )}`,
        },
        {
          label: "Ancora mensal",
          value: `${profile.caseMarkers.monthAnchor.stem} | ${joinOrFallback(
            profile.caseMarkers.monthAnchor.carriers,
            "--"
          )}`,
        },
        { label: "Regra tecnica de Yong Shen", value: profile.caseMarkers.yongShenRule },
      ],
      bullets: caseMarkerBullets,
    },
    {
      title: "Portas e deidades por classificacao canonica",
      items: [
        { label: "Portas abertas / favoraveis", value: joinOrFallback(profile.canonicalDoorHighlights.open, "--") },
        { label: "Portas fechadas / pressao", value: joinOrFallback(profile.canonicalDoorHighlights.caution, "--") },
        { label: "Portas contextuais", value: joinOrFallback(profile.canonicalDoorHighlights.neutral, "--") },
        {
          label: "Deidades de apoio",
          value: joinOrFallback(profile.canonicalDeityHighlights.supportive, "--"),
        },
        {
          label: "Deidades de cautela",
          value: joinOrFallback(profile.canonicalDeityHighlights.caution, "--"),
        },
        {
          label: "Deidades restantes",
          value: joinOrFallback(profile.canonicalDeityHighlights.remaining, "--"),
        },
      ],
    },
    {
      title: "Auditoria de padroes canonicos",
      items: profile.patternAudits.map((audit) => ({
        label: audit.name,
        value: `${audit.status} | ${joinOrFallback(audit.palaces, "--")}`,
      })),
      bullets: patternAuditBullets,
    },
    {
      title: "Direcoes e eleicao tecnica",
      items: [
        { label: "Direcoes mais fortes", value: joinOrFallback(profile.bestDirections, "--") },
        { label: "Direcoes de cautela", value: joinOrFallback(profile.cautionDirections, "--") },
        {
          label: "Ranking completo",
          value: `${profile.directionRatings.length} palacios ranqueados`,
        },
      ],
      bullets: directionBullets,
    },
    {
      title: "Matriz tecnica do caso",
      items: [
        { label: "Resumo do eixo", value: joinOrFallback(profile.caseAxisSummary, "Sem eixo resumido") },
        { label: "Palacios mapeados", value: `${profile.caseRelationMatrix.length}` },
        {
          label: "Melhor cruzamento do caso",
          value:
            profile.caseRelationMatrix.find((row) =>
              row.tags.some((tag) => ["sujeito", "objeto", "ancora anual", "ancora mensal"].includes(tag))
            )?.palace ?? "--",
        },
      ],
      bullets: caseAxisBullets,
    },
    {
      title: "Aplicacoes canonicas do quadro",
      items: profile.applicationCues.map((cue) => ({
        label: cue.label,
        value: `${joinOrFallback(cue.bestPalaces, "--")} | cautela ${joinOrFallback(cue.cautionPalaces, "--")}`,
      })),
      bullets: applicationCueBullets,
    },
    {
      title: "Padroes, ge ju e Shen Sha",
      items: [
        { label: "Estruturas encontradas", value: joinOrFallback(profile.structureNames, "--") },
        { label: "Linhas de estrutura", value: `${profile.structureHighlights.length}` },
        { label: "Shen Sha observados", value: joinOrFallback(profile.shenShaNames, "--") },
        { label: "Linhas de Shen Sha", value: `${profile.shenShaHighlights.length}` },
        { label: "Huan Ju exposto", value: `${profile.huanJuActivePalaces} palacios ativos` },
      ],
      bullets: [...profile.structureHighlights, ...profile.shenShaHighlights].slice(0, 80),
    },
    {
      title: "Palacio por palacio",
      items: profile.palaces.map((palace) => ({
        label: `${palace.label} ${palace.direction}`,
        value: `门 ${palace.men} | 星 ${palace.xing} | 神 ${palace.tianPanShen} | 天盘 ${palace.tianPanGan} | 地盘 ${palace.diPanGan} | 暗干 ${palace.anGan} | 暗支 ${palace.anZhi} | 旺衰 ${palace.wangShuai}`,
      })),
      bullets: palaceDigestLines,
    },
    {
      title: "Relacoes ceu-terra e familias tecnicas",
      items: profile.palaces.map((palace) => ({
        label: palace.label,
        value: `Liu Qin céu/terra ${palace.tianPanGanLiuQin}/${palace.diPanGanLiuQin} | Shi Shen céu/terra ${palace.tianPanGanShiShen}/${palace.diPanGanShiShen} | 长生 céu ${palace.tianPanGanZhangSheng} | 长生 terra ${palace.diPanGanZhangSheng}`,
      })),
      bullets: palaceStructureLines,
    },
  ];
}

export function buildTongShuBlocks(chart: BaziChart): DetailBlock[] {
  const lunar = getLunarFromChart(chart);
  const currentTime = lunar.getTime();
  const favorableTimes = lunar
    .getTimes()
    .filter((time) => time.getTianShenLuck() === "吉")
    .map(
      (time) =>
        `${time.getMinHm()}-${time.getMaxHm()} ${time.getGanZhi()} ${time.getTianShen()}`
    );

  return [
    {
      title: "Calendario classico do dia",
      items: [
        { label: "Calendario chines", value: lunar.toString() },
        { label: "Calendario solar", value: chart.adjusted.date },
        { label: "Calendario lunar", value: `${Math.abs(lunar.getMonth())}/${lunar.getDay()}` },
        { label: "Jie Qi anterior / proximo", value: `${lunar.getPrevJie(true).toString()} -> ${lunar.getNextJie(true).toString()}` },
        { label: "12 oficiais / Jian Chu", value: lunar.getZhiXing() },
        { label: "28 Xiu", value: `${lunar.getXiu()} (${lunar.getXiuLuck()})` },
        { label: "Peng Zu Bai Ji", value: `${lunar.getPengZuGan()} | ${lunar.getPengZuZhi()}` },
        { label: "Yue Xiang", value: lunar.getYueXiang() },
      ],
      bullets: [lunar.getXiuSong()],
    },
    {
      title: "Auspiciosidade e restricoes",
      items: [
        { label: "Dias auspiciosos / atividades permitidas", value: lunar.getDayYi().slice(0, 10).join(", ") || "--" },
        { label: "Dias inauspiciosos / atividades proibidas", value: lunar.getDayJi().slice(0, 10).join(", ") || "--" },
        { label: "Estrelas auspiciosas", value: lunar.getDayJiShen().join(", ") || "--" },
        { label: "Estrelas nocivas", value: lunar.getDayXiongSha().join(", ") || "--" },
        { label: "Animal clash do dia", value: lunar.getDayChongDesc() },
        { label: "Day Breaker / Sha", value: lunar.getDaySha() },
        { label: "Tai Sui anual", value: lunar.getYearPositionTaiSuiDesc() },
        { label: "Tai Sui mensal", value: lunar.getMonthPositionTaiSuiDesc() },
        { label: "Tai Sui diario", value: lunar.getDayPositionTaiSuiDesc() },
      ],
    },
    {
      title: "Horas favoraveis",
      items: [
        { label: "Hora atual", value: `${currentTime.getGanZhi()} ${currentTime.getTianShen()} (${currentTime.getTianShenLuck()})` },
        { label: "Time Yi", value: currentTime.getYi().join(", ") || "--" },
        { label: "Time Ji", value: currentTime.getJi().join(", ") || "--" },
        { label: "Time Chong", value: currentTime.getChongDesc() },
        { label: "Time Sha", value: currentTime.getSha() },
        { label: "Time Kong Wang", value: currentTime.getXunKong() },
      ],
      bullets: favorableTimes,
    },
    {
      title: "Nove estrelas e direcoes",
      items: [
        { label: "Direcao de alegria / Xi", value: lunar.getDayPositionXiDesc() },
        { label: "Direcao de riqueza / Cai", value: lunar.getDayPositionCaiDesc() },
        { label: "Direcao de nobre / Yang Gui", value: lunar.getDayPositionYangGuiDesc() },
        { label: "Direcao de nobre / Yin Gui", value: lunar.getDayPositionYinGuiDesc() },
        { label: "Posicao Tai do dia", value: lunar.getDayPositionTai() },
        { label: "Posicao Tai do mes", value: lunar.getMonthPositionTai() },
      ],
      bullets: getNineStarBlock(chart),
    },
  ];
}

export function blocksToReport(blocks: DetailBlock[]) {
  return blocks
    .map((block) =>
      [
        block.title.toUpperCase(),
        ...block.items.map((item) => `${item.label}: ${item.value}`),
        ...(block.bullets?.length ? ["", ...block.bullets.map((bullet) => `- ${bullet}`)] : []),
      ].join("\n")
    )
    .join("\n\n");
}
