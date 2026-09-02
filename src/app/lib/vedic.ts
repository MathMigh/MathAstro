import { BirthChart, BirthDate, Planet } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";
import { resolveVedicTimezone } from "./vedicTimezone";
import { DEFAULT_JYOTISH_CONFIG } from "./jyotish/jyotishConfig";
import { buildSiderealAuditContext } from "./jyotish/astroTimings";
import { buildYogaLabels } from "./jyotish/yogaCatalog";
import { buildJyotishModules } from "./jyotish/reportEngine";
import type {
  JyotishConfig,
  JyotishModuleKey,
  JyotishModuleResult,
} from "./jyotish/types";

export type VedicAyanamsa = "lahiri" | "krishnamurti" | "raman";

type ClassicalPlanetKey =
  | "sun"
  | "moon"
  | "mars"
  | "mercury"
  | "jupiter"
  | "venus"
  | "saturn";

type SupportedPlanetKey = ClassicalPlanetKey | "northNode" | "southNode";

type CharaKarakaRole =
  | "Atmakaraka"
  | "Amatyakaraka"
  | "Bhratrikaraka"
  | "Matrikaraka"
  | "Putrakaraka"
  | "Gnatikaraka"
  | "Darakaraka";

interface VargaDefinition {
  key: string;
  label: string;
}

interface PlanetStrength {
  key: ClassicalPlanetKey;
  name: string;
  uchchaBala: number;
  saptavargajaBala: number;
  ojhayugmaBala: number;
  kendradiBala: number;
  drekkanaBala: number;
  sthanaBala: number;
  digBala: number;
  nathonnathaBala: number;
  pakshaBala: number;
  totalShadbala: number;
  rupas: number;
  note: string;
}

interface HouseStrength {
  house: number;
  score: number;
  rupas: number;
  lord: string;
  occupants: string[];
  note: string;
}

interface AshtakavargaRow {
  label: string;
  scores: number[];
  total: number;
}

interface AshtakavargaMatrix {
  signs: string[];
  rows: AshtakavargaRow[];
  totals: number[];
}

interface NakshatraMeta {
  name: string;
  deity: string;
  purpose: string;
  lord: string;
}

export interface VedicPoint {
  key: string;
  name: string;
  longitude: number;
  sourceLongitude?: number;
  longitudeSpeed?: number;
  latitude?: number;
  declination?: number;
  distance?: number;
  signIndex: number;
  signName: string;
  degreeInSign: number;
  house: number;
  retrograde: boolean;
  nakshatra: string;
  nakshatraIndex: number;
  pada: number;
  signLord: string;
  tags: string[];
}

export interface VedicPanchanga {
  weekday: string;
  tithi: string;
  paksha: string;
  yoga: string;
  karana: string;
  nakshatra: string;
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  years: number;
  active: boolean;
}

export interface DashaSubPeriod {
  mahaLord: string;
  lord: string;
  startDate: string;
  endDate: string;
  years: number;
  active: boolean;
}

export interface VargaChart {
  key: string;
  label: string;
  points: VedicPoint[];
}

export interface VedicNakshatraDetail {
  chartKey: string;
  chartLabel: string;
  pointKey: string;
  pointName: string;
  signName: string;
  longitudeLabel: string;
  rangeLabel: string;
  nakshatra: string;
  pada: number;
  lord: string;
  deity: string;
  purpose: string;
}

export interface VedicAspect {
  source: string;
  target: string;
  kind: string;
  note: string;
}

export interface CharaKarakaEntry {
  role: CharaKarakaRole;
  key: string;
  name: string;
  signName: string;
  house: number;
  degreeInSign: number;
}

export interface VedicSnapshot {
  name: string;
  gender?: "male" | "female";
  sourceEngine: string;
  timezone: string;
  latitude: number;
  longitude: number;
  referenceDate: string;
  analysisDate: string;
  localBirthHour: number;
  localBirthTimeLabel: string;
  birthTimePrecisionMinutes: number;
  timezoneOffsetMinutes: number;
  daylightSavingActive: boolean;
  ayanamsaMode: VedicAyanamsa;
  ayanamsaDegrees: number;
  ascendant: VedicPoint;
  planets: VedicPoint[];
  sunSign: string;
  moonSign: string;
  panchanga: VedicPanchanga;
  yogas: string[];
  dashas: DashaPeriod[];
  antardashas: DashaSubPeriod[];
  vargas: VargaChart[];
  nakshatraDetails: VedicNakshatraDetail[];
  charaKarakas: CharaKarakaEntry[];
  shadbala: PlanetStrength[];
  bhavabala: HouseStrength[];
  ashtakavarga: AshtakavargaMatrix;
  aspects: VedicAspect[];
  highlights: string[];
  siderealHouseCusps: number[];
}

export interface VedicMatchFactor {
  label: string;
  score: number;
  max: number;
  note: string;
}

export interface VedicCompatibility {
  score: number;
  percentage: number;
  factors: VedicMatchFactor[];
  summary: string[];
}

export interface VedicSuite {
  primary: VedicSnapshot;
  transit: VedicSnapshot;
  partner?: VedicSnapshot;
  compatibility?: VedicCompatibility;
  config: JyotishConfig;
  modules: Record<JyotishModuleKey, JyotishModuleResult>;
  coverage: string[];
  reports: {
    natal: string;
    divisional: string;
    dasha: string;
    transit: string;
    compatibility: string;
    muhurta: string;
    annual: string;
  };
}

export interface VedicBuildOptions {
  config?: Partial<JyotishConfig>;
  question?: string;
  eventType?: string;
  selectedYear?: number;
}

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

const SIGN_LORDS: ClassicalPlanetKey[] = [
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
];

const PLANET_LABELS: Record<string, string> = {
  sun: "Surya",
  moon: "Chandra",
  mars: "Mangala",
  mercury: "Budha",
  jupiter: "Guru",
  venus: "Shukra",
  saturn: "Shani",
  northNode: "Rahu",
  southNode: "Ketu",
  ascendant: "Lagna",
};

const CLASSICAL_PLANETS: ClassicalPlanetKey[] = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
];

const PLANET_ORDER: SupportedPlanetKey[] = [
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

const NAKSHATRA_META: NakshatraMeta[] = [
  { name: "Ashwini", deity: "Ashwini Kumara", purpose: "Dharma", lord: "Ketu" },
  { name: "Bharani", deity: "Yama", purpose: "Artha", lord: "Venus" },
  { name: "Krittika", deity: "Agni", purpose: "Kama", lord: "Sun" },
  { name: "Rohini", deity: "Brahma", purpose: "Moksha", lord: "Moon" },
  { name: "Mrigashira", deity: "Soma", purpose: "Dharma", lord: "Mars" },
  { name: "Ardra", deity: "Rudra", purpose: "Artha", lord: "Rahu" },
  { name: "Punarvasu", deity: "Aditi", purpose: "Kama", lord: "Jupiter" },
  { name: "Pushya", deity: "Brihaspati", purpose: "Moksha", lord: "Saturn" },
  { name: "Ashlesha", deity: "Nagas", purpose: "Dharma", lord: "Mercury" },
  { name: "Magha", deity: "Pitris", purpose: "Artha", lord: "Ketu" },
  { name: "Purva Phalguni", deity: "Bhaga", purpose: "Kama", lord: "Venus" },
  { name: "Uttara Phalguni", deity: "Aryaman", purpose: "Moksha", lord: "Sun" },
  { name: "Hasta", deity: "Savitar", purpose: "Dharma", lord: "Moon" },
  { name: "Chitra", deity: "Tvashtar", purpose: "Artha", lord: "Mars" },
  { name: "Swati", deity: "Vayu", purpose: "Kama", lord: "Rahu" },
  { name: "Vishakha", deity: "Indragni", purpose: "Moksha", lord: "Jupiter" },
  { name: "Anuradha", deity: "Mitra", purpose: "Dharma", lord: "Saturn" },
  { name: "Jyeshtha", deity: "Indra", purpose: "Artha", lord: "Mercury" },
  { name: "Mula", deity: "Nirriti", purpose: "Kama", lord: "Ketu" },
  { name: "Purva Ashadha", deity: "Apas", purpose: "Moksha", lord: "Venus" },
  { name: "Uttara Ashadha", deity: "Vishvadevas", purpose: "Dharma", lord: "Sun" },
  { name: "Shravana", deity: "Vishnu", purpose: "Artha", lord: "Moon" },
  { name: "Dhanishta", deity: "Vasus", purpose: "Kama", lord: "Mars" },
  { name: "Shatabhisha", deity: "Varuna", purpose: "Moksha", lord: "Rahu" },
  { name: "Purva Bhadrapada", deity: "Aja Ekapada", purpose: "Dharma", lord: "Jupiter" },
  { name: "Uttara Bhadrapada", deity: "Ahirbudhnya", purpose: "Artha", lord: "Saturn" },
  { name: "Revati", deity: "Pushan", purpose: "Kama", lord: "Mercury" },
];

const NAKSHATRA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

const DASHA_YEARS: Record<string, number> = {
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

const WEEKDAYS = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

const TITHIS = [
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dvadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Pratipada Krishna",
  "Dvitiya Krishna",
  "Tritiya Krishna",
  "Chaturthi Krishna",
  "Panchami Krishna",
  "Shashthi Krishna",
  "Saptami Krishna",
  "Ashtami Krishna",
  "Navami Krishna",
  "Dashami Krishna",
  "Ekadashi Krishna",
  "Dvadashi Krishna",
  "Trayodashi Krishna",
  "Chaturdashi Krishna",
  "Amavasya",
];

const YOGAS = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shula",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
];

const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];

const BENEFICS = new Set<ClassicalPlanetKey>(["moon", "mercury", "jupiter", "venus"]);
const MALE_PLANETS = new Set<ClassicalPlanetKey>(["sun", "mars", "jupiter"]);
const FEMALE_PLANETS = new Set<ClassicalPlanetKey>(["moon", "venus"]);

const EXALTATION_DEGREES: Record<ClassicalPlanetKey, number> = {
  sun: 10,
  moon: 33,
  mars: 298,
  mercury: 165,
  jupiter: 95,
  venus: 357,
  saturn: 200,
};

const OWN_SIGNS: Record<ClassicalPlanetKey, number[]> = {
  sun: [4],
  moon: [3],
  mars: [0, 7],
  mercury: [2, 5],
  jupiter: [8, 11],
  venus: [1, 6],
  saturn: [9, 10],
};

const FRIENDS: Record<ClassicalPlanetKey, ClassicalPlanetKey[]> = {
  sun: ["moon", "mars", "jupiter"],
  moon: ["sun", "mercury"],
  mars: ["sun", "moon", "jupiter"],
  mercury: ["sun", "venus"],
  jupiter: ["sun", "moon", "mars"],
  venus: ["mercury", "saturn"],
  saturn: ["mercury", "venus"],
};

const ENEMIES: Record<ClassicalPlanetKey, ClassicalPlanetKey[]> = {
  sun: ["venus", "saturn"],
  moon: [],
  mars: ["mercury"],
  mercury: ["moon"],
  jupiter: ["mercury", "venus"],
  venus: ["sun", "moon"],
  saturn: ["sun", "moon"],
};

const COMBUSTION_LIMITS: Partial<Record<ClassicalPlanetKey, number>> = {
  moon: 12,
  mars: 17,
  mercury: 10,
  jupiter: 11,
  venus: 10,
  saturn: 15,
};

const VARGA_DEFINITIONS: VargaDefinition[] = [
  { key: "D1", label: "Rasi" },
  { key: "D2", label: "Hora" },
  { key: "D3", label: "Drekkana" },
  { key: "D4", label: "Chaturthamsa" },
  { key: "D5", label: "Panchamsa" },
  { key: "D6", label: "Shashthamsa" },
  { key: "D7", label: "Saptamsa" },
  { key: "D8", label: "Ashtamsa" },
  { key: "D9", label: "Navamsa" },
  { key: "D10", label: "Dasamsa" },
  { key: "D11", label: "Ekadasamsa / Rudramsa" },
  { key: "D12", label: "Dvadasamsa" },
  { key: "D16", label: "Shodasamsa" },
  { key: "D20", label: "Vimsamsa" },
  { key: "D24", label: "Siddhamsa" },
  { key: "D27", label: "Nakshatramsa" },
  { key: "D30", label: "Trimsamsa" },
  { key: "D40", label: "Khavedamsa" },
  { key: "D45", label: "Akshavedamsa" },
  { key: "D60", label: "Shastyamsa" },
  { key: "D108", label: "Ashtottaramsa" },
  { key: "D144", label: "Dvadasa-Dvadasamsa" },
];

const SAPTAVARGA_KEYS = new Set(["D1", "D2", "D3", "D7", "D9", "D12", "D30"]);
const NAKSHATRA_REPORT_KEYS = new Set(["D1", "D9", "D10", "D60"]);
const ASHTAKAVARGA_SIGNS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"];

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function buildDate(value: BirthDate) {
  if (value.time.includes(":")) {
    const [hourText, minuteText, secondText] = value.time.split(":");
    const hour = Number(hourText || 0);
    const minute = Number(minuteText || 0);
    const second = Number(secondText || 0);

    return new Date(Date.UTC(value.year, value.month - 1, value.day, hour, minute, second));
  }

  const decimal = Number(value.time || 12);
  const wholeHours = Math.floor(decimal);
  const minutes = Math.floor((decimal - wholeHours) * 60);

  return new Date(Date.UTC(value.year, value.month - 1, value.day, wholeHours, minutes, 0));
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateLong(dateText: string) {
  const date = new Date(`${dateText}T00:00:00Z`);

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDegree(value: number) {
  const normalized = modulo(value, 30);
  const degrees = Math.floor(normalized);
  const minutes = Math.floor((normalized - degrees) * 60);

  return `${degrees}°${minutes.toString().padStart(2, "0")}'`;
}

const REPORT_SIGN_NAMES: Record<string, string> = {
  Mesha: "Áries",
  Vrishabha: "Touro",
  Mithuna: "Gêmeos",
  Karka: "Câncer",
  Simha: "Leão",
  Kanya: "Virgem",
  Tula: "Libra",
  Vrischika: "Escorpião",
  Dhanu: "Sagitário",
  Makara: "Capricórnio",
  Kumbha: "Aquário",
  Meena: "Peixes",
};

const REPORT_POINT_NAMES: Record<string, string> = {
  Lagna: "Ascendente",
  Surya: "Sol (Surya)",
  Chandra: "Lua (Chandra)",
  Mangala: "Marte (Kuja)",
  Budha: "Mercúrio (Budha)",
  Guru: "Júpiter (Guru)",
  Shukra: "Vênus (Shukra)",
  Shani: "Saturno (Śani)",
  Rahu: "Nodo Norte",
  Ketu: "Nodo Sul",
};

const REPORT_DASHA_NAMES: Record<string, string> = {
  Sun: "Sol (Surya)",
  Moon: "Lua (Chandra)",
  Mars: "Marte (Kuja)",
  Mercury: "Mercúrio (Budha)",
  Jupiter: "Júpiter (Guru)",
  Venus: "Vênus (Shukra)",
  Saturn: "Saturno (Śani)",
  Rahu: "Rahu",
  Ketu: "Ketu",
};

const HOUSE_ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const REFERENCE_REPORT_VARGA_KEYS = new Set([
  "D1",
  "D2",
  "D3",
  "D4",
  "D7",
  "D9",
  "D10",
  "D12",
  "D16",
  "D20",
  "D24",
  "D27",
  "D30",
  "D40",
  "D45",
  "D60",
]);
const NAKSHATRA_REPORT_ORDER = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "northNode",
  "southNode",
  "ascendant",
] as const;
const PRIMARY_OWN_SIGN_BY_PLANET: Record<ClassicalPlanetKey, number> = {
  sun: 4,
  moon: 3,
  mars: 0,
  mercury: 5,
  jupiter: 8,
  venus: 6,
  saturn: 10,
};

function reportSignName(signName: string) {
  return REPORT_SIGN_NAMES[signName] ?? signName;
}

function reportPointName(pointName: string) {
  return REPORT_POINT_NAMES[pointName] ?? pointName;
}

function reportDashaName(lord: string) {
  return REPORT_DASHA_NAMES[lord] ?? lord;
}

function reportHouse(house: number) {
  return HOUSE_ROMANS[Math.max(0, Math.min(HOUSE_ROMANS.length - 1, house - 1))] ?? String(house);
}

function reportTag(tag: string, pointKey: string) {
  const venusFeminine = pointKey === "venus";

  switch (tag) {
    case "Amigavel":
      return "Amigável";
    case "Domicilio":
      return "Domicílio";
    case "Retrogrado":
      return "Retrógrado";
    case "Exaltado":
      return venusFeminine ? "Exaltada" : "Exaltado";
    case "Debilitado":
      return venusFeminine ? "Debilitada" : "Debilitado";
    case "Inimigo":
      return venusFeminine ? "Inimiga" : "Inimigo";
    default:
      return tag;
  }
}

function reportState(point: VedicPoint) {
  return point.tags.map((tag) => reportTag(tag, point.key)).join(", ");
}

function formatOptionalState(state: string) {
  return state ? ` (${state})` : "";
}

function formatDegreePadded(value: number) {
  const normalized = modulo(value, 30);
  const degrees = Math.floor(normalized);
  const minutes = Math.floor((normalized - degrees) * 60 + 1e-9);

  return `${degrees.toString().padStart(2, "0")}°${minutes.toString().padStart(2, "0")}'`;
}

function buildNakshatraRangeLabel(nakshatraIndex: number) {
  const size = 360 / 27;
  const start = modulo(nakshatraIndex * size, 30);
  const end = modulo((nakshatraIndex + 1) * size, 30);

  return `${formatDegreePadded(start)} - ${formatDegreePadded(end)}`;
}

function reportNakshatraSubject(detail: VedicNakshatraDetail) {
  if (detail.pointKey === "ascendant") {
    return "Ascendente (Lagna)";
  }

  if (detail.pointKey === "northNode") {
    return "Nodo Lunar Norte: Rahu";
  }

  if (detail.pointKey === "southNode") {
    return "Nodo Lunar Sul: Ketu";
  }

  return `Planeta: ${reportPointName(detail.pointName)}`;
}

function getPrimaryOwnedHouse(snapshot: VedicSnapshot, planetKey: ClassicalPlanetKey) {
  return getHouse(PRIMARY_OWN_SIGN_BY_PLANET[planetKey], snapshot.ascendant.signIndex);
}

function formatOrdinalHouse(house: number) {
  return `${house}ª`;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function extractLocalHour(birthDate: BirthDate) {
  if (birthDate.time.includes(":")) {
    const [hourText, minuteText] = birthDate.time.split(":");
    return Number(hourText || 0) + Number(minuteText || 0) / 60;
  }

  return Number(birthDate.time || 12);
}

function formatLocalBirthTimeLabel(birthDate: BirthDate) {
  if (birthDate.time.includes(":")) {
    const [hourText, minuteText, secondText] = birthDate.time.split(":");
    const hour = Number(hourText || 0);
    const minute = Number(minuteText || 0);
    const second = Number(secondText || 0);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  }

  const decimal = Number(birthDate.time || 12);
  const wholeHours = Math.floor(decimal);
  const minutesFloat = (decimal - wholeHours) * 60;
  const wholeMinutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - wholeMinutes) * 60);
  return `${String(wholeHours).padStart(2, "0")}:${String(wholeMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function inferBirthTimePrecisionMinutes(birthDate: BirthDate) {
  if (birthDate.time.includes(":")) {
    const parts = birthDate.time.split(":");
    if (parts.length >= 3) {
      return Number((1 / 60).toFixed(4));
    }
    return 1;
  }

  const decimals = birthDate.time.includes(".") ? birthDate.time.split(".")[1]?.length ?? 0 : 0;
  return Number((60 / 10 ** Math.max(0, decimals)).toFixed(4));
}

function buildBirthMoment(birthDate: BirthDate, timezone: string) {
  const localTimeLabel = formatLocalBirthTimeLabel(birthDate);
  return moment.tz(
    `${birthDate.year}-${birthDate.month}-${birthDate.day} ${localTimeLabel}`,
    "YYYY-M-D HH:mm:ss",
    timezone
  );
}

function angularDistance(from: number, to: number) {
  const difference = Math.abs(modulo(to - from, 360));
  return difference > 180 ? 360 - difference : difference;
}

function isOddSign(signIndex: number) {
  return signIndex % 2 === 0;
}

function isMovable(signIndex: number) {
  return [0, 3, 6, 9].includes(signIndex);
}

function isFixed(signIndex: number) {
  return [1, 4, 7, 10].includes(signIndex);
}

function elementStartSign(signIndex: number) {
  if ([0, 4, 8].includes(signIndex)) {
    return 0;
  }

  if ([1, 5, 9].includes(signIndex)) {
    return 3;
  }

  if ([2, 6, 10].includes(signIndex)) {
    return 6;
  }

  return 9;
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

function ayanamsaSourceLabel(mode: VedicAyanamsa) {
  return {
    lahiri: "Lahiri / Chitrapaksha (working set interno)",
    krishnamurti: "Krishnamurti (working set interno)",
    raman: "B. V. Raman (working set interno)",
  }[mode];
}

function formatUtcOffsetLabel(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatCoordinateLabel(value: number, axis: "lat" | "lon") {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60);
  const hemisphere =
    axis === "lat"
      ? value >= 0
        ? "N"
        : "S"
      : value >= 0
        ? "E"
        : "W";
  return `${degrees}°${String(minutes).padStart(2, "0")}'${String(seconds).padStart(2, "0")}" ${hemisphere}`;
}

function formatBirthPrecisionLabel(minutes: number) {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} s`;
  }

  if (Number.isInteger(minutes)) {
    return `${minutes} min`;
  }

  return `${minutes.toFixed(2)} min`;
}

function toSidereal(longitude: number, ayanamsaDegrees: number) {
  return modulo(longitude - ayanamsaDegrees, 360);
}

function getNakshatra(longitude: number) {
  const size = 360 / 27;
  const index = Math.min(26, Math.floor(modulo(longitude, 360) / size));
  const within = modulo(longitude, size);
  const pada = Math.min(4, Math.floor(within / (size / 4)) + 1);
  const meta = NAKSHATRA_META[index];

  return {
    name: meta.name,
    index,
    pada,
    meta,
  };
}

function getHouse(signIndex: number, ascendantSignIndex: number) {
  return modulo(signIndex - ascendantSignIndex, 12) + 1;
}

function makePoint(
  key: string,
  name: string,
  longitude: number,
  ascendantSignIndex: number,
  retrograde = false,
  extra: Partial<VedicPoint> = {}
): VedicPoint {
  const normalizedLongitude = modulo(longitude, 360);
  const signIndex = Math.floor(normalizedLongitude / 30) % 12;
  const degreeInSign = modulo(normalizedLongitude, 30);
  const nakshatra = getNakshatra(normalizedLongitude);

  return {
    key,
    name,
    longitude: normalizedLongitude,
    sourceLongitude: extra.sourceLongitude,
    longitudeSpeed: extra.longitudeSpeed,
    latitude: extra.latitude,
    declination: extra.declination,
    distance: extra.distance,
    signIndex,
    signName: SIGNS[signIndex],
    degreeInSign,
    house: getHouse(signIndex, ascendantSignIndex),
    retrograde,
    nakshatra: nakshatra.name,
    nakshatraIndex: nakshatra.index,
    pada: nakshatra.pada,
    signLord: PLANET_LABELS[SIGN_LORDS[signIndex]],
    tags: [],
  };
}

function asClassicalPlanetKey(key: string): ClassicalPlanetKey | undefined {
  if (CLASSICAL_PLANETS.includes(key as ClassicalPlanetKey)) {
    return key as ClassicalPlanetKey;
  }

  return undefined;
}

function getSignRelationship(planetKey: ClassicalPlanetKey, signIndex: number) {
  if (OWN_SIGNS[planetKey].includes(signIndex)) {
    return "domicilio";
  }

  const signLord = SIGN_LORDS[signIndex];

  if (FRIENDS[planetKey].includes(signLord)) {
    return "amigavel";
  }

  if (ENEMIES[planetKey].includes(signLord)) {
    return "inimigo";
  }

  return "neutro";
}

function getPointTags(point: VedicPoint, sun: VedicPoint | undefined) {
  if (point.key === "northNode" || point.key === "southNode") {
    return [point.retrograde ? "Retrogrado" : "Direto"];
  }

  const classicalKey = asClassicalPlanetKey(point.key);

  if (!classicalKey) {
    return point.tags;
  }

  const tags: string[] = [];
  const exaltationSign = Math.floor(EXALTATION_DEGREES[classicalKey] / 30);
  const debilitationSign = modulo(exaltationSign + 6, 12);

  if (point.signIndex === exaltationSign) {
    tags.push("Exaltado");
  }

  if (point.signIndex === debilitationSign) {
    tags.push("Debilitado");
  }

  const relationship = getSignRelationship(classicalKey, point.signIndex);
  if (relationship === "domicilio") {
    tags.push("Domicilio");
  } else if (relationship === "amigavel") {
    tags.push("Amigavel");
  } else if (relationship === "inimigo") {
    tags.push("Inimigo");
  }

  if (sun && point.key !== "sun") {
    const limit = COMBUSTION_LIMITS[classicalKey];
    if (limit && angularDistance(point.longitude, sun.longitude) <= limit) {
      tags.push("Combusto");
    }
  }

  if (point.retrograde) {
    tags.push("Retrogrado");
  } else {
    tags.push("Direto");
  }

  return tags;
}

function enrichPoints(points: VedicPoint[], sun: VedicPoint | undefined) {
  return points.map((point) => ({
    ...point,
    tags: getPointTags(point, sun),
  }));
}

function projectEqualDivision(signIndex: number, degreeInSign: number, divisions: number, startSign: number) {
  const partSize = 30 / divisions;
  const rawIndex = Math.min(divisions - 1, Math.floor(degreeInSign / partSize));
  const withinPart = degreeInSign - rawIndex * partSize;
  const projectedDegree = (withinPart / partSize) * 30;
  const mappedSign = modulo(startSign + rawIndex, 12);

  return mappedSign * 30 + projectedDegree;
}

function projectByOffsets(
  signIndex: number,
  degreeInSign: number,
  partSize: number,
  offsets: number[]
) {
  const rawIndex = Math.min(offsets.length - 1, Math.floor(degreeInSign / partSize));
  const withinPart = degreeInSign - rawIndex * partSize;
  const projectedDegree = (withinPart / partSize) * 30;
  const mappedSign = modulo(signIndex + offsets[rawIndex], 12);

  return mappedSign * 30 + projectedDegree;
}

function projectTrimsamsa(signIndex: number, degreeInSign: number) {
  const oddDefinition = [
    { size: 5, sign: 0 },
    { size: 5, sign: 10 },
    { size: 8, sign: 8 },
    { size: 7, sign: 2 },
    { size: 5, sign: 6 },
  ];

  const evenDefinition = [
    { size: 5, sign: 1 },
    { size: 7, sign: 5 },
    { size: 8, sign: 11 },
    { size: 5, sign: 9 },
    { size: 5, sign: 7 },
  ];

  const definition = isOddSign(signIndex) ? oddDefinition : evenDefinition;
  let cursor = 0;

  for (const segment of definition) {
    const nextCursor = cursor + segment.size;
    if (degreeInSign < nextCursor || segment === definition[definition.length - 1]) {
      const withinSegment = degreeInSign - cursor;
      // Classical Trimsamsa in the reference report keeps the segment-selected sign,
      // but advances the degree by the harmonic 30x sweep inside that segment.
      const projectedDegree = modulo(withinSegment * 30, 30);
      return segment.sign * 30 + projectedDegree;
    }
    cursor = nextCursor;
  }

  return signIndex * 30 + degreeInSign;
}

function projectDivisionLongitude(signIndex: number, degreeInSign: number, division: string) {
  if (division === "D1") {
    return signIndex * 30 + degreeInSign;
  }

  if (division === "D2") {
    const rawIndex = Math.min(1, Math.floor(degreeInSign / 15));
    const withinPart = degreeInSign - rawIndex * 15;
    const projectedDegree = (withinPart / 15) * 30;
    const targetSign = isOddSign(signIndex) ? (rawIndex === 0 ? 4 : 3) : rawIndex === 0 ? 3 : 4;
    return targetSign * 30 + projectedDegree;
  }

  if (division === "D3") {
    return projectByOffsets(signIndex, degreeInSign, 10, [0, 4, 8]);
  }

  if (division === "D4") {
    return projectByOffsets(signIndex, degreeInSign, 7.5, [0, 3, 6, 9]);
  }

  if (division === "D5") {
    return projectEqualDivision(signIndex, degreeInSign, 5, signIndex);
  }

  if (division === "D6") {
    return projectEqualDivision(signIndex, degreeInSign, 6, signIndex);
  }

  if (division === "D7") {
    const startSign = isOddSign(signIndex) ? signIndex : modulo(signIndex + 6, 12);
    return projectEqualDivision(signIndex, degreeInSign, 7, startSign);
  }

  if (division === "D8") {
    return projectEqualDivision(signIndex, degreeInSign, 8, signIndex);
  }

  if (division === "D9") {
    const startSign = isMovable(signIndex)
      ? signIndex
      : isFixed(signIndex)
        ? modulo(signIndex + 8, 12)
        : modulo(signIndex + 4, 12);
    return projectEqualDivision(signIndex, degreeInSign, 9, startSign);
  }

  if (division === "D10") {
    const startSign = isOddSign(signIndex) ? signIndex : modulo(signIndex + 8, 12);
    return projectEqualDivision(signIndex, degreeInSign, 10, startSign);
  }

  if (division === "D11") {
    return projectEqualDivision(signIndex, degreeInSign, 11, signIndex);
  }

  if (division === "D12") {
    return projectEqualDivision(signIndex, degreeInSign, 12, signIndex);
  }

  if (division === "D16") {
    const startSign = isMovable(signIndex) ? 0 : isFixed(signIndex) ? 4 : 8;
    return projectEqualDivision(signIndex, degreeInSign, 16, startSign);
  }

  if (division === "D20") {
    const startSign = isMovable(signIndex) ? 0 : isFixed(signIndex) ? 8 : 4;
    return projectEqualDivision(signIndex, degreeInSign, 20, startSign);
  }

  if (division === "D24") {
    const startSign = isOddSign(signIndex) ? 4 : 3;
    return projectEqualDivision(signIndex, degreeInSign, 24, startSign);
  }

  if (division === "D27") {
    return projectEqualDivision(signIndex, degreeInSign, 27, elementStartSign(signIndex));
  }

  if (division === "D30") {
    return projectTrimsamsa(signIndex, degreeInSign);
  }

  if (division === "D40") {
    const startSign = isOddSign(signIndex) ? 0 : 6;
    return projectEqualDivision(signIndex, degreeInSign, 40, startSign);
  }

  if (division === "D45") {
    const startSign = isMovable(signIndex) ? 0 : isFixed(signIndex) ? 4 : 8;
    return projectEqualDivision(signIndex, degreeInSign, 45, startSign);
  }

  if (division === "D60") {
    return projectEqualDivision(signIndex, degreeInSign, 60, signIndex);
  }

  if (division === "D108") {
    return projectEqualDivision(signIndex, degreeInSign, 108, signIndex);
  }

  if (division === "D144") {
    return projectEqualDivision(signIndex, degreeInSign, 144, signIndex);
  }

  return signIndex * 30 + degreeInSign;
}

function projectVargaPoint(point: VedicPoint, ascendantSignIndex: number, division: string) {
  const longitude = projectDivisionLongitude(point.signIndex, point.degreeInSign, division);
  return makePoint(point.key, point.name, longitude, ascendantSignIndex, point.retrograde, {
    sourceLongitude: point.sourceLongitude,
    longitudeSpeed: point.longitudeSpeed,
    latitude: point.latitude,
    declination: point.declination,
    distance: point.distance,
  });
}

function mapPlanetToPoint(
  planet: Planet,
  ayanamsaDegrees: number,
  ascendantSignIndex: number
) {
  const longitude = toSidereal(planet.longitudeRaw ?? planet.longitude, ayanamsaDegrees);

  return makePoint(
    planet.type,
    PLANET_LABELS[planet.type] ?? planet.name,
    longitude,
    ascendantSignIndex,
    planet.isRetrograde,
    {
      sourceLongitude: planet.longitudeRaw ?? planet.longitude,
      longitudeSpeed: planet.longitudeSpeed,
      latitude: planet.latitudeRaw,
      declination: planet.declination,
      distance: planet.distanceRaw,
    }
  );
}

function buildPanchanga(snapshotDate: Date, sun: VedicPoint, moon: VedicPoint): VedicPanchanga {
  const angle = modulo(moon.longitude - sun.longitude, 360);
  const tithiIndex = Math.min(TITHIS.length - 1, Math.floor(angle / 12));
  const yogaIndex = Math.floor(modulo(moon.longitude + sun.longitude, 360) / (360 / 27));
  const karanaIndex = Math.floor(angle / 6) % KARANAS.length;

  return {
    weekday: WEEKDAYS[snapshotDate.getUTCDay()],
    tithi: TITHIS[tithiIndex],
    paksha: tithiIndex < 15 ? "Shukla" : "Krishna",
    yoga: YOGAS[yogaIndex],
    karana: KARANAS[karanaIndex],
    nakshatra: moon.nakshatra,
  };
}

function buildDashaPeriods(moon: VedicPoint, birthDate: Date, activeDate: Date) {
  const size = 360 / 27;
  const withinNakshatra = modulo(moon.longitude, size);
  const completedFraction = withinNakshatra / size;
  const startIndex = moon.nakshatraIndex % NAKSHATRA_LORDS.length;
  const currentLord = NAKSHATRA_LORDS[startIndex];
  const currentLordYears = DASHA_YEARS[currentLord];
  const currentStartTime =
    birthDate.getTime() - completedFraction * currentLordYears * 365.2422 * 24 * 60 * 60 * 1000;
  const periods: DashaPeriod[] = [];
  let cursor = currentStartTime;

  for (let offset = 0; offset < 9; offset += 1) {
    const lord = NAKSHATRA_LORDS[(startIndex + offset) % NAKSHATRA_LORDS.length];
    const years = DASHA_YEARS[lord];
    const start = new Date(cursor);
    const end = new Date(cursor + years * 365.2422 * 24 * 60 * 60 * 1000);

    periods.push({
      lord,
      startDate: formatDate(start),
      endDate: formatDate(end),
      years,
      active: activeDate.getTime() >= start.getTime() && activeDate.getTime() < end.getTime(),
    });

    cursor = end.getTime();
  }

  return periods;
}

function buildAntardashas(periods: DashaPeriod[], activeDate: Date) {
  const subPeriods: DashaSubPeriod[] = [];

  periods.forEach((period) => {
    const startIndex = NAKSHATRA_LORDS.indexOf(period.lord);
    let cursor = new Date(`${period.startDate}T00:00:00Z`).getTime();

    for (let offset = 0; offset < 9; offset += 1) {
      const lord = NAKSHATRA_LORDS[(startIndex + offset) % NAKSHATRA_LORDS.length];
      const years = (period.years * DASHA_YEARS[lord]) / 120;
      const start = new Date(cursor);
      const end = new Date(cursor + years * 365.2422 * 24 * 60 * 60 * 1000);

      subPeriods.push({
        mahaLord: period.lord,
        lord,
        startDate: formatDate(start),
        endDate: formatDate(end),
        years: round(years, 2),
        active: activeDate.getTime() >= start.getTime() && activeDate.getTime() < end.getTime(),
      });

      cursor = end.getTime();
    }
  });

  return subPeriods;
}

function relationLabel(distance: number) {
  if ([0, 4, 8].includes(distance)) {
    return "trinal";
  }

  if ([2, 6, 10].includes(distance)) {
    return "supportive";
  }

  if ([1, 5, 7, 11].includes(distance)) {
    return "charged";
  }

  return "tense";
}

function aspectOffsetsFor(pointKey: string) {
  if (pointKey === "mars") {
    return [4, 7, 8];
  }

  if (pointKey === "jupiter") {
    return [5, 7, 9];
  }

  if (pointKey === "saturn") {
    return [3, 7, 10];
  }

  if (pointKey === "northNode" || pointKey === "southNode") {
    return [5, 7, 9];
  }

  return [7];
}

function doesAspect(source: VedicPoint, target: VedicPoint) {
  const offsets = aspectOffsetsFor(source.key);
  const distance = modulo(target.house - source.house, 12) + 1;
  return offsets.includes(distance);
}

function buildAspectTable(ascendant: VedicPoint, points: VedicPoint[]) {
  const aspects: VedicAspect[] = [];

  points.forEach((source) => {
    points.forEach((target) => {
      if (source.key === target.key || !doesAspect(source, target)) {
        return;
      }

      const distance = modulo(target.house - source.house, 12) + 1;

      aspects.push({
        source: source.name,
        target: target.name,
        kind: distance === 7 ? "Plena" : "Especial",
        note:
          distance === 7
            ? `${source.name} olha diretamente ${target.name} pela casa ${target.house}.`
            : `${source.name} toca ${target.name} pelo aspecto especial em ${distance} casas.`,
      });
    });
  });

  aspectOffsetsFor("ascendant");
  void ascendant;

  return aspects;
}

function getHouseLord(snapshot: VedicSnapshot, house: number) {
  const signIndex = modulo(snapshot.ascendant.signIndex + house - 1, 12);
  const lordKey = SIGN_LORDS[signIndex];
  return snapshot.planets.find((point) => point.key === lordKey) ?? snapshot.ascendant;
}

function getMoonBrightness(moon: VedicPoint, sun: VedicPoint) {
  const angle = modulo(moon.longitude - sun.longitude, 360);
  const waxing = angle <= 180;
  const brightness = waxing ? angle / 180 : (360 - angle) / 180;

  return {
    angle,
    waxing,
    brightness,
  };
}

function detectYogas(snapshot: VedicSnapshot) {
  return buildYogaLabels(snapshot);
}

function dignityScore(point: VedicPoint, planetKey: ClassicalPlanetKey) {
  if (point.tags.includes("Exaltado")) {
    return 20;
  }

  if (point.tags.includes("Debilitado")) {
    return 0;
  }

  const relationship = getSignRelationship(planetKey, point.signIndex);

  if (relationship === "domicilio") {
    return 15;
  }

  if (relationship === "amigavel") {
    return 10;
  }

  if (relationship === "neutro") {
    return 7.5;
  }

  return 5;
}

function computePlanetStrengths(snapshot: VedicSnapshot) {
  const sun = snapshot.planets.find((point) => point.key === "sun") ?? snapshot.ascendant;
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const brightness = getMoonBrightness(moon, sun);
  const sectPhase = Math.sin(((snapshot.localBirthHour - 6) / 12) * Math.PI);

  return CLASSICAL_PLANETS.map((planetKey) => {
    const point = snapshot.planets.find((item) => item.key === planetKey);

    if (!point) {
      return null;
    }

    const exaltationDistance = angularDistance(point.longitude, EXALTATION_DEGREES[planetKey]);
    const uchchaBala = round(Math.max(0, 60 - Math.min(exaltationDistance, 180) / 3));

    const saptavargajaBala = round(
      snapshot.vargas
        .filter((varga) => SAPTAVARGA_KEYS.has(varga.key))
        .reduce((sum, varga) => {
          const vargaPoint = varga.points.find((item) => item.key === planetKey);
          return sum + (vargaPoint ? dignityScore(vargaPoint, planetKey) : 0);
        }, 0)
    );

    const navamsaPoint =
      snapshot.vargas.find((varga) => varga.key === "D9")?.points.find((item) => item.key === planetKey) ??
      point;
    const pointParityMatch = isOddSign(point.signIndex);
    const navamsaParityMatch = isOddSign(navamsaPoint.signIndex);
    let ojhayugmaBala = 15;

    if (MALE_PLANETS.has(planetKey)) {
      ojhayugmaBala = (pointParityMatch ? 15 : 0) + (navamsaParityMatch ? 15 : 0);
    } else if (FEMALE_PLANETS.has(planetKey)) {
      ojhayugmaBala = (!pointParityMatch ? 15 : 0) + (!navamsaParityMatch ? 15 : 0);
    }

    let kendradiBala = 15;
    if ([1, 4, 7, 10].includes(point.house)) {
      kendradiBala = 60;
    } else if ([2, 5, 8, 11].includes(point.house)) {
      kendradiBala = 30;
    }

    const drekkanaIndex = Math.min(2, Math.floor(point.degreeInSign / 10));
    let drekkanaBala = 0;
    if (MALE_PLANETS.has(planetKey) && drekkanaIndex === 0) {
      drekkanaBala = 15;
    } else if (FEMALE_PLANETS.has(planetKey) && drekkanaIndex === 1) {
      drekkanaBala = 15;
    } else if (!MALE_PLANETS.has(planetKey) && !FEMALE_PLANETS.has(planetKey) && drekkanaIndex === 2) {
      drekkanaBala = 15;
    }

    const sthanaBala = round(
      uchchaBala + saptavargajaBala + ojhayugmaBala + kendradiBala + drekkanaBala
    );

    const idealHouse =
      planetKey === "sun" || planetKey === "mars"
        ? 10
        : planetKey === "moon" || planetKey === "venus"
          ? 4
          : planetKey === "saturn"
            ? 7
            : 1;
    const houseGap = Math.min(
      modulo(point.house - idealHouse, 12),
      modulo(idealHouse - point.house, 12)
    );
    const digBala = round(Math.max(0, 60 - houseGap * 10));

    const nathonnathaBala =
      planetKey === "mercury"
        ? 60
        : round(
            30 + (["sun", "jupiter", "saturn"].includes(planetKey) ? 1 : -1) * sectPhase * 15
          );

    let pakshaBala = 0;
    if (planetKey === "moon") {
      pakshaBala = round(60 + (brightness.waxing ? brightness.brightness : 1 - brightness.brightness) * 50);
    } else if (BENEFICS.has(planetKey)) {
      pakshaBala = round(brightness.brightness * 60);
    } else {
      pakshaBala = round((1 - brightness.brightness) * 60);
    }

    const totalShadbala = round(sthanaBala + digBala + nathonnathaBala + pakshaBala);

    return {
      key: planetKey,
      name: point.name,
      uchchaBala,
      saptavargajaBala,
      ojhayugmaBala,
      kendradiBala,
      drekkanaBala,
      sthanaBala,
      digBala,
      nathonnathaBala,
      pakshaBala,
      totalShadbala,
      rupas: round(totalShadbala / 60),
      note: `${point.name} fica em ${point.signName}, casa ${point.house}, com ${point.tags.join(", ").toLowerCase()}.`,
    } satisfies PlanetStrength;
  }).filter(Boolean) as PlanetStrength[];
}

function computeBhavabala(snapshot: VedicSnapshot, strengths: PlanetStrength[]) {
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const lord = getHouseLord(snapshot, house);
    const occupants = snapshot.planets.filter((point) => point.house === house);
    const occupantScore = occupants.reduce((sum, point) => {
      const strength = strengths.find((item) => item.key === point.key);
      return sum + (strength?.totalShadbala ?? 90) / 2.8;
    }, 0);
    const lordStrength = strengths.find((item) => item.key === lord.key)?.totalShadbala ?? 120;
    const beneficAspects = snapshot.planets.filter(
      (point) => BENEFICS.has(point.key as ClassicalPlanetKey) && point.house !== house && doesAspect(point, makePoint("house", "House", (modulo(snapshot.ascendant.signIndex + house - 1, 12) * 30), snapshot.ascendant.signIndex))
    ).length;
    const maleficAspects = snapshot.planets.filter(
      (point) =>
        !BENEFICS.has(point.key as ClassicalPlanetKey) &&
        point.key !== "moon" &&
        point.house !== house &&
        doesAspect(point, makePoint("house", "House", (modulo(snapshot.ascendant.signIndex + house - 1, 12) * 30), snapshot.ascendant.signIndex))
    ).length;
    const score = round(
      220 +
        lordStrength +
        occupantScore +
        beneficAspects * 26 -
        maleficAspects * 14 +
        ([1, 4, 5, 7, 9, 10].includes(lord.house) ? 34 : 0)
    );

    return {
      house,
      score,
      rupas: round(score / 60),
      lord: lord.name,
      occupants: occupants.map((point) => point.name),
      note:
        occupants.length > 0
          ? `Casa ${house} recebe ${occupants.map((point) => point.name).join(", ")}.`
          : `Casa ${house} depende mais do lord ${lord.name}.`,
    } satisfies HouseStrength;
  });
}

function computeAshtakavarga(snapshot: VedicSnapshot) {
  const rowPoints = [snapshot.ascendant, ...snapshot.planets.filter((point) => CLASSICAL_PLANETS.includes(point.key as ClassicalPlanetKey))];

  const rows = rowPoints.map((point) => {
    const classicalKey = asClassicalPlanetKey(point.key);

    const scores = Array.from({ length: 12 }, (_, signIndex) => {
      const trine = [0, 4, 8].includes(modulo(signIndex - point.signIndex, 12));
      const opposition = modulo(signIndex - point.signIndex, 12) === 6;
      const owned =
        classicalKey && OWN_SIGNS[classicalKey].includes(signIndex);
      const exalted =
        classicalKey && Math.floor(EXALTATION_DEGREES[classicalKey] / 30) === signIndex;
      const aspected = aspectOffsetsFor(point.key).includes(modulo(signIndex - point.signIndex, 12) + 1);

      return Number(trine || opposition || owned || exalted || aspected);
    });

    return {
      label: point.name,
      scores,
      total: scores.reduce((sum, value) => sum + value, 0),
    } satisfies AshtakavargaRow;
  });

  const totals = Array.from({ length: 12 }, (_, signIndex) =>
    rows.reduce((sum, row) => sum + row.scores[signIndex], 0)
  );

  return {
    signs: ASHTAKAVARGA_SIGNS,
    rows,
    totals,
  } satisfies AshtakavargaMatrix;
}

function computeCharaKarakas(snapshot: VedicSnapshot) {
  const sorted = snapshot.planets
    .filter((point) => CLASSICAL_PLANETS.includes(point.key as ClassicalPlanetKey))
    .toSorted((left, right) => right.degreeInSign - left.degreeInSign);

  const roles: CharaKarakaRole[] = [
    "Atmakaraka",
    "Amatyakaraka",
    "Bhratrikaraka",
    "Matrikaraka",
    "Putrakaraka",
    "Gnatikaraka",
    "Darakaraka",
  ];

  return sorted.map((point, index) => ({
    role: roles[index],
    key: point.key,
    name: point.name,
    signName: point.signName,
    house: point.house,
    degreeInSign: round(point.degreeInSign),
  }));
}

function buildVargaCharts(ascendant: VedicPoint, planets: VedicPoint[]) {
  return VARGA_DEFINITIONS.map((definition) => {
    const ascendantPoint = projectVargaPoint(ascendant, 0, definition.key);
    const ascendantSignIndex = ascendantPoint.signIndex;
    const points = [
      makePoint("ascendant", "Lagna", ascendantPoint.longitude, ascendantSignIndex),
      ...planets.map((point) => projectVargaPoint(point, ascendantSignIndex, definition.key)),
    ];
    const sun = points.find((point) => point.key === "sun");

    return {
      key: definition.key,
      label: definition.label,
      points: enrichPoints(points, sun),
    } satisfies VargaChart;
  });
}

function buildNakshatraDetails(vargas: VargaChart[]) {
  return vargas
    .filter((varga) => NAKSHATRA_REPORT_KEYS.has(varga.key))
    .flatMap((varga) =>
      [...varga.points]
        .toSorted(
          (left, right) =>
            NAKSHATRA_REPORT_ORDER.indexOf(left.key as (typeof NAKSHATRA_REPORT_ORDER)[number]) -
            NAKSHATRA_REPORT_ORDER.indexOf(right.key as (typeof NAKSHATRA_REPORT_ORDER)[number])
        )
        .map((point) => {
        const meta = NAKSHATRA_META[point.nakshatraIndex];

        return {
          chartKey: varga.key,
          chartLabel: varga.label,
          pointKey: point.key,
          pointName: point.name,
          signName: point.signName,
          longitudeLabel: `${formatDegree(point.degreeInSign)} em ${reportSignName(point.signName)}`,
          rangeLabel: buildNakshatraRangeLabel(point.nakshatraIndex),
          nakshatra: point.nakshatra,
          pada: point.pada,
          lord: meta.lord,
          deity: meta.deity,
          purpose: meta.purpose,
        } satisfies VedicNakshatraDetail;
      })
    );
}

function deriveHighlights(snapshot: VedicSnapshot) {
  const activeDasha = snapshot.dashas.find((period) => period.active) ?? snapshot.dashas[0];
  const activeAntardasha =
    snapshot.antardashas.find((period) => period.active) ??
    snapshot.antardashas.find((period) => period.mahaLord === activeDasha?.lord);
  const strongestPlanet = snapshot.shadbala.toSorted((left, right) => right.totalShadbala - left.totalShadbala)[0];
  const strongestHouse = snapshot.bhavabala.toSorted((left, right) => right.score - left.score)[0];
  const atmakaraka = snapshot.charaKarakas.find((item) => item.role === "Atmakaraka");

  return [
    `Lagna em ${snapshot.ascendant.signName} com Lua em ${snapshot.moonSign} e Sol em ${snapshot.sunSign}.`,
    strongestPlanet
      ? `${strongestPlanet.name} lidera a forca do mapa em ${strongestPlanet.rupas} rupas.`
      : "O mapa pede leitura por conjunto, sem um graha isolado dominar tudo.",
    strongestHouse
      ? `A casa ${strongestHouse.house} recebe o maior peso de manifestacao nesta fase.`
      : "As casas seguem equilibrio moderado neste recorte.",
    activeDasha
      ? `A linha do tempo atual passa por ${activeDasha.lord}${activeAntardasha ? ` / ${activeAntardasha.lord}` : ""}.`
      : "Sem dasha ativa marcada para a data de analise.",
    atmakaraka
      ? `${atmakaraka.name} atua como Atmakaraka e colore a busca central da vida.`
      : "Os chara karakas pedem leitura mais distribuida.",
  ];
}

export function deriveVedicSnapshot(
  chart: BirthChart,
  ayanamsaMode: VedicAyanamsa,
  analysisDate = buildDate(chart.birthDate)
): VedicSnapshot {
  const referenceDate = buildDate(chart.birthDate);
  const ayanamsaDegrees = getAyanamsaDegrees(referenceDate, ayanamsaMode);
  const timezone = resolveVedicTimezone(chart.birthDate.coordinates);
  const birthMoment = buildBirthMoment(chart.birthDate, timezone);
  const birthTimePrecisionMinutes = inferBirthTimePrecisionMinutes(chart.birthDate);
  const ascendantLongitude = toSidereal(chart.housesData.ascendant, ayanamsaDegrees);
  const ascendantSignIndex = Math.floor(ascendantLongitude / 30) % 12;
  const rawAscendant = makePoint("ascendant", "Lagna", ascendantLongitude, ascendantSignIndex, false, {
    sourceLongitude: chart.housesData.ascendant,
  });
  const rawPlanets = PLANET_ORDER
    .map((planetKey) =>
      chart.planets.find((planet) => planet.type === planetKey)
    )
    .filter(Boolean)
    .map((planet) => mapPlanetToPoint(planet as Planet, ayanamsaDegrees, ascendantSignIndex));
  const rawSun = rawPlanets.find((point) => point.key === "sun") ?? rawAscendant;
  const ascendant = { ...rawAscendant, tags: ["Direto"] };
  const planets = enrichPoints(rawPlanets, rawSun);
  const sun = planets.find((point) => point.key === "sun") ?? ascendant;
  const moon = planets.find((point) => point.key === "moon") ?? ascendant;
  const panchanga = buildPanchanga(referenceDate, sun, moon);
  const dashas = buildDashaPeriods(moon, referenceDate, analysisDate);
  const antardashas = buildAntardashas(dashas, analysisDate);
  const vargas = buildVargaCharts(ascendant, planets);
  const siderealHouseCusps = chart.housesData.house.map((house) =>
    round(toSidereal(house, ayanamsaDegrees), 4)
  );

  const snapshot: VedicSnapshot = {
    name: chart.birthDate.coordinates.name ?? "Sem nome",
    gender: chart.birthDate.gender,
    sourceEngine: "Swiss Ephemeris (@swisseph/browser)",
    timezone,
    latitude: chart.birthDate.coordinates.latitude,
    longitude: chart.birthDate.coordinates.longitude,
    referenceDate: formatDate(referenceDate),
    analysisDate: formatDate(analysisDate),
    localBirthHour: extractLocalHour(chart.birthDate),
    localBirthTimeLabel: formatLocalBirthTimeLabel(chart.birthDate),
    birthTimePrecisionMinutes,
    timezoneOffsetMinutes: birthMoment.utcOffset(),
    daylightSavingActive: birthMoment.isDST(),
    ayanamsaMode,
    ayanamsaDegrees: round(ayanamsaDegrees, 4),
    ascendant,
    planets,
    sunSign: sun.signName,
    moonSign: moon.signName,
    panchanga,
    yogas: [],
    dashas,
    antardashas,
    vargas,
    nakshatraDetails: [],
    charaKarakas: [],
    shadbala: [],
    bhavabala: [],
    ashtakavarga: {
      signs: ASHTAKAVARGA_SIGNS,
      rows: [],
      totals: [],
    },
    aspects: [],
    highlights: [],
    siderealHouseCusps,
  };

  snapshot.nakshatraDetails = buildNakshatraDetails(vargas);
  snapshot.charaKarakas = computeCharaKarakas(snapshot);
  snapshot.aspects = buildAspectTable(snapshot.ascendant, snapshot.planets);
  snapshot.yogas = detectYogas(snapshot);
  snapshot.shadbala = computePlanetStrengths(snapshot);
  snapshot.bhavabala = computeBhavabala(snapshot, snapshot.shadbala);
  snapshot.ashtakavarga = computeAshtakavarga(snapshot);
  snapshot.highlights = deriveHighlights(snapshot);

  return snapshot;
}

function signDistance(fromIndex: number, toIndex: number) {
  return modulo(toIndex - fromIndex, 12);
}

function buildCompatibility(primary: VedicSnapshot, partner: VedicSnapshot): VedicCompatibility {
  const primaryMoon = primary.planets.find((point) => point.key === "moon") ?? primary.ascendant;
  const partnerMoon = partner.planets.find((point) => point.key === "moon") ?? partner.ascendant;
  const primaryVenus = primary.planets.find((point) => point.key === "venus") ?? primary.ascendant;
  const partnerMars = partner.planets.find((point) => point.key === "mars") ?? partner.ascendant;
  const primaryMars = primary.planets.find((point) => point.key === "mars") ?? primary.ascendant;
  const partnerVenus = partner.planets.find((point) => point.key === "venus") ?? partner.ascendant;

  const moonDistance = signDistance(primaryMoon.signIndex, partnerMoon.signIndex);
  const lagnaDistance = signDistance(primary.ascendant.signIndex, partner.ascendant.signIndex);
  const chemistryDistance =
    signDistance(primaryVenus.signIndex, partnerMars.signIndex) +
    signDistance(partnerVenus.signIndex, primaryMars.signIndex);
  const nakshatraGap = Math.abs(primaryMoon.nakshatraIndex - partnerMoon.nakshatraIndex);
  const taraFlow = Math.min(
    modulo(partnerMoon.nakshatraIndex - primaryMoon.nakshatraIndex, 27) + 1,
    modulo(primaryMoon.nakshatraIndex - partnerMoon.nakshatraIndex, 27) + 1
  );

  const factors: VedicMatchFactor[] = [
    {
      label: "Lua e emocao",
      score:
        relationLabel(moonDistance) === "trinal"
          ? 10
          : relationLabel(moonDistance) === "supportive"
            ? 8
            : relationLabel(moonDistance) === "charged"
              ? 6
              : 4,
      max: 10,
      note: `Distancia de signos entre as Luas: ${moonDistance}.`,
    },
    {
      label: "Lagna e ritmo de vida",
      score:
        relationLabel(lagnaDistance) === "trinal"
          ? 8
          : relationLabel(lagnaDistance) === "supportive"
            ? 6
            : 4,
      max: 8,
      note: `Ascendentes em ${primary.ascendant.signName} e ${partner.ascendant.signName}.`,
    },
    {
      label: "Venus e Mars",
      score: chemistryDistance <= 6 ? 6 : chemistryDistance <= 12 ? 4 : 2,
      max: 6,
      note: "Quimica entre afeto, desejo e iniciativa.",
    },
    {
      label: "Nakshatra e Tara Bala",
      score: taraFlow <= 3 ? 6 : taraFlow <= 8 ? 4 : 2,
      max: 6,
      note: `Fluxo de Tara Bala entre as Luas: ${taraFlow}.`,
    },
    {
      label: "Gap de nakshatra",
      score: nakshatraGap <= 3 ? 4 : nakshatraGap <= 8 ? 3 : 1,
      max: 4,
      note: `Gap de nakshatra entre as Luas: ${nakshatraGap}.`,
    },
  ];

  const score = factors.reduce((sum, factor) => sum + factor.score, 0);
  const max = factors.reduce((sum, factor) => sum + factor.max, 0);

  return {
    score,
    percentage: Math.round((score / max) * 100),
    factors,
    summary: [
      `Compatibilidade geral em ${Math.round((score / max) * 100)}%.`,
      `As Luas se relacionam em tom ${relationLabel(moonDistance)} e os Lagnas em tom ${relationLabel(lagnaDistance)}.`,
      "O vinculo melhora quando a quimica entre Venus e Mars encontra rotina, nao apenas intensidade.",
    ],
  };
}

function houseFrom(origin: VedicPoint, target: VedicPoint) {
  return modulo(target.signIndex - origin.signIndex, 12) + 1;
}

function groupAntardashasByMaha(snapshot: VedicSnapshot) {
  return snapshot.antardashas.reduce<Record<string, DashaSubPeriod[]>>((groups, period) => {
    groups[period.mahaLord] = [...(groups[period.mahaLord] ?? []), period];
    return groups;
  }, {});
}

function describePoint(point: VedicPoint) {
  if (point.key === "ascendant") {
    return `${reportPointName(point.name)}: ${reportSignName(point.signName)}`;
  }

  return `${reportPointName(point.name)}: ${reportSignName(point.signName)}, a ${formatDegree(point.degreeInSign)}, na Casa ${reportHouse(point.house)}${formatOptionalState(reportState(point))}`;
}

function buildDivisionSection(snapshot: VedicSnapshot, filter?: (varga: VargaChart) => boolean) {
  return snapshot.vargas
    .filter((varga) => (filter ? filter(varga) : true))
    .map((varga) => {
      const ordered = ["ascendant", ...PLANET_ORDER]
        .map((key) => varga.points.find((point) => point.key === key))
        .filter(Boolean) as VedicPoint[];

      return [
        `${varga.key} (${varga.label}):`,
        "",
        ...ordered.map(describePoint),
        "",
      ].join("\n");
    })
    .join("\n");
}

function buildNakshatraSection(snapshot: VedicSnapshot) {
  const groups = snapshot.nakshatraDetails.reduce<Record<string, VedicNakshatraDetail[]>>((acc, detail) => {
    acc[detail.chartKey] = [...(acc[detail.chartKey] ?? []), detail];
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([chartKey, details]) => {
      const title = `${chartKey} (${details[0]?.chartLabel ?? chartKey}):`;
      return [
        title,
        "",
        ...details.map(
          (detail) =>
            `${reportNakshatraSubject(detail)}\nLongitude: ${detail.longitudeLabel}\nNakshatra: ${detail.nakshatra} - Pada ${detail.pada} (${detail.rangeLabel})\nNakshatra Lord: ${reportDashaName(detail.lord)}\nRuling Deity: ${detail.deity}\nPurpose (Purushartha): ${detail.purpose}\n`
        ),
      ].join("\n");
    })
    .join("\n");
}

function buildDashaSection(snapshot: VedicSnapshot) {
  const groupedAntardashas = groupAntardashasByMaha(snapshot);
  const activeMaha = snapshot.dashas.find((period) => period.active);
  const activeAntardasha = snapshot.antardashas.find((period) => period.active);

  return [
    "Dasha Periods:",
    "",
    activeMaha ? `Mahadasha ativa: ${reportDashaName(activeMaha.lord)}` : "Mahadasha ativa: --",
    activeAntardasha
      ? `Antardasha ativa: ${reportDashaName(activeAntardasha.mahaLord)} / ${reportDashaName(activeAntardasha.lord)}`
      : "Antardasha ativa: --",
    "",
    "Mahadasha (Períodos Principais):",
    ...snapshot.dashas.map(
      (period) =>
        `${reportDashaName(period.lord)}: de ${formatDateLong(period.startDate)} a ${formatDateLong(period.endDate)}${period.active ? " (Ativa)" : ""}`
    ),
    "",
    ...snapshot.dashas.flatMap((period) => [
      `Antardashas dentro da Mahadasha de ${reportDashaName(period.lord)}:`,
      "",
      ...(groupedAntardashas[period.lord] ?? []).map(
        (subPeriod) =>
          `${reportDashaName(period.lord)} / ${reportDashaName(subPeriod.lord)}: de ${formatDateLong(subPeriod.startDate)} a ${formatDateLong(subPeriod.endDate)}${subPeriod.active ? " (Ativa)" : ""}`
      ),
      "",
    ]),
  ].join("\n");
}

function buildLagnaNavamsaSection(snapshot: VedicSnapshot) {
  const d1 = snapshot.vargas.find((varga) => varga.key === "D1");
  const d9 = snapshot.vargas.find((varga) => varga.key === "D9");
  const natalVenus = snapshot.planets.find((point) => point.key === "venus");
  const d1Lagna = d1?.points.find((point) => point.key === "ascendant") ?? snapshot.ascendant;
  const d9Lagna = d9?.points.find((point) => point.key === "ascendant");
  const d9Venus = d9?.points.find((point) => point.key === "venus");
  const atmakaraka = snapshot.charaKarakas.find((item) => item.role === "Atmakaraka");
  const darakaraka = snapshot.charaKarakas.find((item) => item.role === "Darakaraka");

  return [
    "Lagna Chart e Navamsa Chart:",
    "",
    `Lagna natal: ${reportSignName(d1Lagna.signName)}, Casa ${reportHouse(d1Lagna.house)}, grau ${formatDegree(d1Lagna.degreeInSign)}.`,
    d9Lagna
      ? `Lagna do Navamsa: ${reportSignName(d9Lagna.signName)}, Casa ${reportHouse(d9Lagna.house)}, grau ${formatDegree(d9Lagna.degreeInSign)}.`
      : "Lagna do Navamsa: --",
    atmakaraka
      ? `Atmakaraka: ${reportPointName(atmakaraka.name)} em ${reportSignName(atmakaraka.signName)}, Casa ${reportHouse(atmakaraka.house)}.`
      : "Atmakaraka: --",
    darakaraka
      ? `Darakaraka: ${reportPointName(darakaraka.name)} em ${reportSignName(darakaraka.signName)}, Casa ${reportHouse(darakaraka.house)}.`
      : "Darakaraka: --",
    natalVenus && d9Venus
      ? `Ponte afetiva D1-D9: Vênus natal em ${reportSignName(natalVenus.signName)} e Vênus no D9 em ${reportSignName(d9Venus.signName)}.`
      : "Ponte afetiva D1-D9: --",
  ].join("\n");
}

function buildKarakasSection(snapshot: VedicSnapshot) {
  const atmakaraka = snapshot.charaKarakas.find((item) => item.role === "Atmakaraka");
  const darakaraka = snapshot.charaKarakas.find((item) => item.role === "Darakaraka");
  const otherKarakas = snapshot.charaKarakas.filter(
    (entry) => !["Atmakaraka", "Darakaraka"].includes(entry.role)
  );

  return [
    "Atmakaraka e Darakaraka:",
    "",
    "Atmakaraka (Ātmakāraka):",
    "",
    atmakaraka
      ? [
          `Planeta: ${reportPointName(atmakaraka.name)}`,
          `Signo: ${reportSignName(atmakaraka.signName)}`,
          `Casa: ${formatOrdinalHouse(atmakaraka.house)}`,
          `Senhor da: ${formatOrdinalHouse(getPrimaryOwnedHouse(snapshot, atmakaraka.key as ClassicalPlanetKey))} casa`,
          `Grau: ${formatDegree(atmakaraka.degreeInSign)}`,
        ].join("\n")
      : "Não identificado.",
    "",
    "Darakaraka (Dārakāraka):",
    "",
    darakaraka
      ? [
          `Planeta: ${reportPointName(darakaraka.name)}`,
          `Signo: ${reportSignName(darakaraka.signName)}`,
          `Casa: ${formatOrdinalHouse(darakaraka.house)}`,
          `Senhor da: ${formatOrdinalHouse(getPrimaryOwnedHouse(snapshot, darakaraka.key as ClassicalPlanetKey))} casa`,
          `Grau: ${formatDegree(darakaraka.degreeInSign)}`,
        ].join("\n")
      : "Não identificado.",
    "",
    "Demais Chara Karakas:",
    "",
    ...otherKarakas.map(
      (entry) =>
        `${entry.role}: ${reportPointName(entry.name)} em ${reportSignName(entry.signName)}, Casa ${reportHouse(entry.house)}, grau ${formatDegree(entry.degreeInSign)}`
    ),
  ].join("\n");
}

function buildYogaSection(snapshot: VedicSnapshot) {
  return [
    "Yogas:",
    "",
    ...(snapshot.yogas.length
      ? snapshot.yogas
      : ["Nenhum yoga automatico dominou o recorte atual."]),
  ].join("\n");
}

function buildShadbalaSection(snapshot: VedicSnapshot) {
  const lines = [
    "Shadbala:",
    "",
    "Uchcha Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.uchchaBala}`),
    "",
    "Saptavargaja Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.saptavargajaBala}`),
    "",
    "Ojhayugmarasiamsa Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.ojhayugmaBala}`),
    "",
    "Kendradi Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.kendradiBala}`),
    "",
    "Drekkana Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.drekkanaBala}`),
    "",
    "Sthaana Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.sthanaBala}`),
    "",
    "Dig Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.digBala}`),
    "",
    "Nathonnatha Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.nathonnathaBala}`),
    "",
    "Paksha Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.pakshaBala}`),
    "",
    "Total Shadbala Bala:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.totalShadbala}`),
    "",
    "Shadbala em rupas:",
    ...snapshot.shadbala.map((item) => `${item.name}: ${item.rupas}`),
  ];

  return lines.join("\n");
}

function buildBhavabalaSection(snapshot: VedicSnapshot) {
  return [
    "Bhavabala:",
    "",
    ...snapshot.bhavabala.map(
      (item) =>
        `Casa ${item.house}: ${item.score}\nBhavabala em rupas: ${item.rupas}\nLord: ${item.lord}\nOcupantes: ${item.occupants.length ? item.occupants.join(", ") : "Nenhum"}\nNota: ${item.note}\n`
    ),
  ].join("\n");
}

function buildAshtakavargaSection(snapshot: VedicSnapshot) {
  return [
    "Ashtakavarga:",
    "",
    ...snapshot.ashtakavarga.rows.map((row) => `${row.label}: ${row.scores.join(" ")} | Total: ${row.total}`),
    "",
    `Sarvashtakavarga: ${snapshot.ashtakavarga.totals.join(" ")}`,
  ].join("\n");
}

function buildAspectSection(snapshot: VedicSnapshot) {
  const notableAspects = snapshot.aspects.slice(0, 18);

  return [
    "Drishti:",
    "",
    ...(notableAspects.length
      ? notableAspects.map((aspect) => `${aspect.source} -> ${aspect.target}: ${aspect.note}`)
      : ["Sem drishtis dominantes para listar."]),
  ].join("\n");
}

function buildAuditSection(snapshot: VedicSnapshot, config: JyotishConfig) {
  const siderealAudit = buildSiderealAuditContext(
    snapshot.referenceDate,
    snapshot.localBirthTimeLabel,
    snapshot.timezone,
    snapshot.longitude
  );

  return [
    "DADOS NATAIS AUDITAVEIS:",
    "",
    `Hora local exata informada: ${snapshot.localBirthTimeLabel}`,
    `Fuso horario resolvido: ${snapshot.timezone} (${formatUtcOffsetLabel(snapshot.timezoneOffsetMinutes)})`,
    `Horario de verao no nascimento: ${snapshot.daylightSavingActive ? "Sim" : "Nao"}`,
    `Coordenadas geograficas: ${formatCoordinateLabel(snapshot.latitude, "lat")} | ${formatCoordinateLabel(snapshot.longitude, "lon")}`,
    `SID (hora sideral local): ${siderealAudit.clockLabel} (${siderealAudit.degrees.toFixed(4)} graus)`,
    `Sistema de casas por camada: Rasi em ${config.houseSystem}; Bhava Chalit em ${config.bhavaChalitSystem}`,
    `Metodo de calculo do nascer do Sol: ${config.sunriseMethod}`,
    `Ayanamsha: ${snapshot.ayanamsaMode} (${snapshot.ayanamsaDegrees} graus) | fonte: ${ayanamsaSourceLabel(snapshot.ayanamsaMode)}`,
    "Nodos lunares: medios (Swiss Ephemeris body 10 para Rahu; Ketu por oposicao exata)",
    "Planetas externos no Jyotish: auxiliares e fora do conjunto classico; nao reescrevem grahas, dignidades, dashas ou yogas do corpo principal",
    "Referencial astronomico: grahas em longitudes geocentricas; casas e nascer do Sol dependentes da localidade",
    `Margem declarada da hora natal: nao informada | resolucao recebida do input: ${formatBirthPrecisionLabel(snapshot.birthTimePrecisionMinutes)}`,
  ].join("\n");
}

function buildPanchangaNatalSection(snapshot: VedicSnapshot) {
  return [
    "PANCHANGA NATAL:",
    "",
    `Vara: ${snapshot.panchanga.weekday}`,
    `Tithi: ${snapshot.panchanga.tithi} (${snapshot.panchanga.paksha})`,
    `Nakshatra da Lua: ${snapshot.panchanga.nakshatra}`,
    `Yoga: ${snapshot.panchanga.yoga}`,
    `Karana: ${snapshot.panchanga.karana}`,
  ].join("\n");
}

function renderModuleSectionsForReferenceReport(module: JyotishModuleResult) {
  return module.sections
    .map((section) => {
      const lines = [section.title.toUpperCase(), "", section.description, ""];

      for (const item of section.items ?? []) {
        lines.push(`- ${item.name}: ${String(item.value)} | ${item.technicalNotes}`);
      }

      if (section.items?.length) {
        lines.push("");
      }

      for (const table of section.tables ?? []) {
        lines.push(`${table.title}:`);
        lines.push(table.columns.join(" | "));
        lines.push(...table.rows.map((row) => row.join(" | ")));
        lines.push("");
      }

      for (const bullet of section.bullets ?? []) {
        lines.push(`- ${bullet}`);
      }

      return lines.join("\n");
    })
    .join("\n");
}

function _buildNatalReport(snapshot: VedicSnapshot, config: JyotishConfig) {
  return [
    "MAPA TRADICIONAL VÉDICO:",
    "",
    `Nome: ${snapshot.name}`,
    `Data base: ${formatDateLong(snapshot.referenceDate)}`,
    `Data de analise: ${formatDateLong(snapshot.analysisDate)}`,
    `Ayanamsa: ${snapshot.ayanamsaMode} (${snapshot.ayanamsaDegrees} graus)`,
    `Lagna: ${reportSignName(snapshot.ascendant.signName)} (${formatDegree(snapshot.ascendant.degreeInSign)})`,
    `Lua: ${reportSignName(snapshot.moonSign)}`,
    `Sol: ${reportSignName(snapshot.sunSign)}`,
    "",
    buildAuditSection(snapshot, config),
    "--------------------------------------------------------------------",
    buildPanchangaNatalSection(snapshot),
    "--------------------------------------------------------------------",
    buildDivisionSection(snapshot, (varga) => REFERENCE_REPORT_VARGA_KEYS.has(varga.key)),
    "--------------------------------------------------------------------",
    "Nakshatra:",
    "",
    buildNakshatraSection(snapshot),
    "--------------------------------------------------------------------",
    buildLagnaNavamsaSection(snapshot),
    "--------------------------------------------------------------------",
    buildDashaSection(snapshot),
    "--------------------------------------------------------------------",
    buildKarakasSection(snapshot),
    "--------------------------------------------------------------------",
    buildYogaSection(snapshot),
    "--------------------------------------------------------------------",
    buildShadbalaSection(snapshot),
    "--------------------------------------------------------------------",
    buildBhavabalaSection(snapshot),
    "--------------------------------------------------------------------",
    buildAshtakavargaSection(snapshot),
    "--------------------------------------------------------------------",
    buildAspectSection(snapshot),
    "--------------------------------------------------------------------",
    "Sintese:",
    "",
    ...snapshot.highlights.map((item) => `- ${item}`),
  ].join("\n");
}

function buildJanmaReferenceReport(
  snapshot: VedicSnapshot,
  module: JyotishModuleResult,
  config: JyotishConfig
) {
  const lines = [
    _buildNatalReport(snapshot, config),
    "--------------------------------------------------------------------",
    "SINTESE TECNICA DO MOTOR:",
    "",
    ...module.summary.map((item) => `- ${item}`),
  ];

  if (module.validations.length) {
    lines.push("");
    lines.push("VALIDACOES E ALERTAS:");
    lines.push("");
    lines.push(...module.validations.map((validation) => `- [${validation.level.toUpperCase()}] ${validation.message}`));
  }

  lines.push("");
  lines.push("--------------------------------------------------------------------");
  lines.push("CAMADAS TECNICAS DO MOTOR:");
  lines.push("");
  lines.push(renderModuleSectionsForReferenceReport(module));

  return lines.join("\n");
}

function _generateDivisionalReport(snapshot: VedicSnapshot) {
  return [
    "RELATORIO DE DIVISIONAIS",
    "",
    buildDivisionSection(snapshot),
    "Leitura:",
    "Rasi organiza a vida visivel; Navamsa aprofunda compromissos; Dasamsa mostra carreira; Dvadasamsa fala de linhagem; as demais vargas refinam tema por tema do mapa.",
  ].join("\n");
}

function _generateDashaReport(snapshot: VedicSnapshot) {
  const activeMaha = snapshot.dashas.find((period) => period.active) ?? snapshot.dashas[0];
  const activeAntardasha =
    snapshot.antardashas.find((period) => period.active) ??
    snapshot.antardashas.find((period) => period.mahaLord === activeMaha?.lord);

  return [
    "RELATORIO DE VIMSHOTTARI DASHA",
    "",
    `Nakshatra lunar: ${snapshot.panchanga.nakshatra}`,
    `Maha dasha ativa: ${activeMaha?.lord ?? "--"}`,
    `Antardasha ativa: ${activeAntardasha ? `${activeAntardasha.mahaLord} / ${activeAntardasha.lord}` : "--"}`,
    "",
    buildDashaSection(snapshot),
    "",
    "Leitura:",
    activeMaha
      ? `A leitura atual se ancora em ${activeMaha.lord}${activeAntardasha ? ` / ${activeAntardasha.lord}` : ""}, o que colore o periodo com o tema desse planeta e da casa que ele ocupa.`
      : "Sem periodo dasha ativo detectado.",
  ].join("\n");
}

function _generateTransitReport(natal: VedicSnapshot, transit: VedicSnapshot) {
  const transitSaturn = transit.planets.find((point) => point.key === "saturn") ?? transit.ascendant;
  const transitJupiter = transit.planets.find((point) => point.key === "jupiter") ?? transit.ascendant;
  const transitRahu = transit.planets.find((point) => point.key === "northNode") ?? transit.ascendant;
  const natalMoon = natal.planets.find((point) => point.key === "moon") ?? natal.ascendant;

  return [
    "RELATORIO DE GOCHAR",
    "",
    `Data de transito: ${formatDateLong(transit.referenceDate)}`,
    `Saturno cai na casa ${houseFrom(natalMoon, transitSaturn)} a partir da Lua natal.`,
    `Jupiter cai na casa ${houseFrom(natalMoon, transitJupiter)} a partir da Lua natal.`,
    `Rahu cai na casa ${houseFrom(natalMoon, transitRahu)} a partir da Lua natal.`,
    "",
    "Panchanga do dia:",
    `Tithi: ${transit.panchanga.tithi} (${transit.panchanga.paksha})`,
    `Nakshatra: ${transit.panchanga.nakshatra}`,
    `Yoga: ${transit.panchanga.yoga}`,
    `Karana: ${transit.panchanga.karana}`,
    "",
    "Leitura:",
    "Saturno marca a cobranca da fase; Jupiter mostra a janela de expansao; Rahu indica fome, ambicao e deslocamento do eixo costumeiro.",
  ].join("\n");
}

function _generateCompatibilityReport(
  primary: VedicSnapshot,
  partner: VedicSnapshot | undefined,
  compatibility: VedicCompatibility | undefined
) {
  if (!partner || !compatibility) {
    return "RELATORIO DE COMPATIBILIDADE VEDICA\n\nPreencha a segunda pessoa para gerar a leitura do vinculo.";
  }

  return [
    "RELATORIO DE COMPATIBILIDADE VEDICA",
    "",
    `${primary.ascendant.signName} x ${partner.ascendant.signName}`,
    `${primary.moonSign} x ${partner.moonSign}`,
    "",
    ...compatibility.summary.map((item) => `- ${item}`),
    "",
    "Fatores:",
    ...compatibility.factors.map(
      (factor) => `- ${factor.label}: ${factor.score}/${factor.max} | ${factor.note}`
    ),
  ].join("\n");
}

function _generateMuhurtaReport(snapshot: VedicSnapshot) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;

  return [
    "RELATORIO DE PANCHANGA E MUHURTA",
    "",
    `Dia: ${snapshot.panchanga.weekday}`,
    `Tithi: ${snapshot.panchanga.tithi} (${snapshot.panchanga.paksha})`,
    `Nakshatra: ${snapshot.panchanga.nakshatra}`,
    `Yoga: ${snapshot.panchanga.yoga}`,
    `Karana: ${snapshot.panchanga.karana}`,
    "",
    "Leitura:",
    `Com Lua em ${moon.signName} e no nakshatra ${moon.nakshatra}, o dia pede coerencia entre intencao e gesto pratico.`,
    "Use este bloco para escolher reunioes, estudos, assinaturas, lancamentos ou recolhimento com base no clima do ceu.",
  ].join("\n");
}

function _generateAnnualReport(natal: VedicSnapshot, transit: VedicSnapshot) {
  const active = natal.dashas.find((period) => period.active) ?? natal.dashas[0];
  const activeSub =
    natal.antardashas.find((period) => period.active) ??
    natal.antardashas.find((period) => period.mahaLord === active?.lord);
  const transitJupiter = transit.planets.find((point) => point.key === "jupiter") ?? transit.ascendant;
  const transitSaturn = transit.planets.find((point) => point.key === "saturn") ?? transit.ascendant;
  const strongestHouse = natal.bhavabala.toSorted((left, right) => right.score - left.score)[0];

  return [
    "RELATORIO ANUAL VEDICO",
    "",
    `Ano-base: ${transit.referenceDate.slice(0, 4)}`,
    `Maha dasha em curso: ${active?.lord ?? "--"}`,
    `Antardasha em curso: ${activeSub ? `${activeSub.mahaLord} / ${activeSub.lord}` : "--"}`,
    `Jupiter passa pela casa ${houseFrom(natal.ascendant, transitJupiter)} a partir do Lagna natal.`,
    `Saturno passa pela casa ${houseFrom(natal.ascendant, transitSaturn)} a partir do Lagna natal.`,
    strongestHouse ? `Casa mais robusta no mapa-base: ${strongestHouse.house}.` : "",
    "",
    "Sintese:",
    "A previsao anual vedica rende melhor quando voce cruza dasha, gochar e as casas mais carregadas do mapa. O ano responde ao planeta-periodo que esta no comando.",
  ].join("\n");
}

export async function buildVedicSuite(
  primaryChart: BirthChart,
  transitChart: BirthChart,
  ayanamsaMode: VedicAyanamsa,
  partnerChart?: BirthChart,
  options?: VedicBuildOptions
): Promise<VedicSuite> {
  const analysisDate = buildDate(transitChart.birthDate);
  const primary = deriveVedicSnapshot(primaryChart, ayanamsaMode, analysisDate);
  const transit = deriveVedicSnapshot(transitChart, ayanamsaMode, analysisDate);
  const partner = partnerChart ? deriveVedicSnapshot(partnerChart, ayanamsaMode, analysisDate) : undefined;
  const compatibility = partner ? buildCompatibility(primary, partner) : undefined;
  const config: JyotishConfig = {
    ...DEFAULT_JYOTISH_CONFIG,
    ...options?.config,
    ayanamsha: ayanamsaMode,
  };
  const modules = await buildJyotishModules({
    primary,
    transit,
    partner,
    compatibility,
    config,
    question: options?.question,
    eventType: options?.eventType,
    selectedYear: options?.selectedYear ?? Number(transit.referenceDate.slice(0, 4)),
  });
  modules.janma.report = buildJanmaReferenceReport(primary, modules.janma, config);
  const coverage = Object.values(modules).map(
    (module) =>
      `${module.label}: ${module.coverage.implemented} calculadas, ${module.coverage.mixed} parciais, ${module.coverage.placeholder} estruturadas`
  );

  return {
    primary,
    transit,
    partner,
    compatibility,
    config,
    modules,
    coverage,
    reports: {
      natal: modules.janma.report,
      divisional: modules.janma.report,
      dasha: modules.dasha.report,
      transit: modules.gochara.report,
      compatibility: modules.vivaha.report,
      muhurta: modules.muhurta.report,
      annual: modules.varshaphala.report,
    },
  };
}
