import type { DashaPeriod, DashaSubPeriod, VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishConfig, JyotishModuleKey } from "./types";
import { createSection, createTable, createDatum, createValidation } from "./engineHelpers";
import { buildSolarDayTimings } from "./astroTimings";
import { calculateArudhaSet } from "./arudhaUtils";

const ASHTOTTARI_SEQUENCE = [
  { lord: "Sun", years: 6, groupSize: 4, stars: ["Ardra", "Punarvasu", "Pushya", "Ashlesha"] },
  { lord: "Moon", years: 15, groupSize: 3, stars: ["Magha", "Purva Phalguni", "Uttara Phalguni"] },
  { lord: "Mars", years: 8, groupSize: 4, stars: ["Hasta", "Chitra", "Swati", "Vishakha"] },
  { lord: "Mercury", years: 17, groupSize: 3, stars: ["Anuradha", "Jyeshtha", "Mula"] },
  { lord: "Saturn", years: 10, groupSize: 4, stars: ["Purva Ashadha", "Uttara Ashadha", "Abhijit", "Shravana"] },
  { lord: "Jupiter", years: 19, groupSize: 3, stars: ["Dhanishtha", "Shatabhisha", "Purva Bhadrapada"] },
  { lord: "Rahu", years: 12, groupSize: 4, stars: ["Uttara Bhadrapada", "Revati", "Ashwini", "Bharani"] },
  { lord: "Venus", years: 21, groupSize: 3, stars: ["Krittika", "Rohini", "Mrigashira"] },
] as const;
const SHODASHOTTARI_SEQUENCE = [
  { lord: "Sun", years: 11 },
  { lord: "Mars", years: 12 },
  { lord: "Jupiter", years: 13 },
  { lord: "Saturn", years: 14 },
  { lord: "Ketu", years: 15 },
  { lord: "Moon", years: 16 },
  { lord: "Mercury", years: 17 },
  { lord: "Venus", years: 18 },
] as const;
const DWADASHOTTARI_SEQUENCE = [
  { lord: "Sun", years: 7 },
  { lord: "Jupiter", years: 9 },
  { lord: "Ketu", years: 11 },
  { lord: "Mercury", years: 13 },
  { lord: "Rahu", years: 15 },
  { lord: "Mars", years: 17 },
  { lord: "Saturn", years: 19 },
  { lord: "Moon", years: 21 },
] as const;

const YOGINI_SEQUENCE = [
  { yogini: "Mangala", lord: "Chandra", years: 1 },
  { yogini: "Pingala", lord: "Surya", years: 2 },
  { yogini: "Dhanya", lord: "Guru", years: 3 },
  { yogini: "Bhramari", lord: "Mangala", years: 4 },
  { yogini: "Bhadrika", lord: "Budha", years: 5 },
  { yogini: "Ulka", lord: "Shani", years: 6 },
  { yogini: "Siddha", lord: "Shukra", years: 7 },
  { yogini: "Sankata", lord: "Rahu", years: 8 },
] as const;
const KALACHAKRA_KAALA_SEQUENCE = [
  { key: "sun", lord: "Sun", weight: 1 },
  { key: "moon", lord: "Moon", weight: 2 },
  { key: "mars", lord: "Mars", weight: 3 },
  { key: "mercury", lord: "Mercury", weight: 4 },
  { key: "jupiter", lord: "Jupiter", weight: 5 },
  { key: "venus", lord: "Venus", weight: 6 },
  { key: "saturn", lord: "Saturn", weight: 7 },
  { key: "northNode", lord: "Rahu", weight: 8 },
  { key: "southNode", lord: "Ketu", weight: 9 },
] as const;
const KALACHAKRA_SIGN_YEARS = [7, 16, 9, 21, 5, 9, 16, 7, 10, 4, 4, 10] as const;
const KALACHAKRA_YEAR_MS = 365.2425 * 24 * 60 * 60 * 1000;
const KALACHAKRA_PATTERNS = [
  {
    key: "aswini",
    patternLabel: "Aswini",
    groupLabel: "Savya / grupo Aswini",
    motion: "savya" as const,
    members: ["Ashwini", "Punarvasu", "Hasta", "Mula", "Purva Bhadrapada"],
    padas: [
      { sequence: [0, 1, 2, 3, 4, 5, 6, 7, 8], paramayus: 100, deha: 0, jeeva: 8, amsa: 0 },
      { sequence: [9, 10, 11, 7, 6, 5, 3, 4, 2], paramayus: 85, deha: 1, jeeva: 3, amsa: 1 },
      { sequence: [1, 0, 11, 10, 9, 8, 0, 1, 2], paramayus: 83, deha: 1, jeeva: 2, amsa: 2 },
      { sequence: [3, 4, 5, 6, 7, 8, 9, 10, 11], paramayus: 86, deha: 3, jeeva: 11, amsa: 3 },
    ],
  },
  {
    key: "bharani",
    patternLabel: "Bharani",
    groupLabel: "Savya / grupo Bharani",
    motion: "savya" as const,
    members: ["Bharani", "Pushya", "Chitra", "Purva Ashadha", "Uttara Bhadrapada"],
    padas: [
      { sequence: [7, 6, 5, 3, 4, 2, 1, 0, 11], paramayus: 100, deha: 7, jeeva: 11, amsa: 4 },
      { sequence: [10, 9, 8, 0, 1, 2, 3, 4, 5], paramayus: 85, deha: 10, jeeva: 5, amsa: 5 },
      { sequence: [6, 7, 8, 9, 10, 11, 7, 6, 5], paramayus: 83, deha: 6, jeeva: 5, amsa: 6 },
      { sequence: [3, 4, 2, 1, 0, 11, 10, 9, 8], paramayus: 86, deha: 3, jeeva: 8, amsa: 7 },
    ],
  },
  {
    key: "krittika",
    patternLabel: "Krittika",
    groupLabel: "Savya / grupo Aswini",
    motion: "savya" as const,
    members: ["Krittika", "Ashlesha", "Swati", "Uttara Ashadha", "Revati"],
    padas: [
      { sequence: [0, 1, 2, 3, 4, 5, 6, 7, 8], paramayus: 100, deha: 0, jeeva: 8, amsa: 8 },
      { sequence: [9, 10, 11, 7, 6, 5, 3, 4, 2], paramayus: 85, deha: 1, jeeva: 3, amsa: 9 },
      { sequence: [1, 0, 11, 10, 9, 8, 0, 1, 2], paramayus: 83, deha: 1, jeeva: 2, amsa: 10 },
      { sequence: [3, 4, 5, 6, 7, 8, 9, 10, 11], paramayus: 86, deha: 3, jeeva: 11, amsa: 11 },
    ],
  },
  {
    key: "rohini",
    patternLabel: "Rohini",
    groupLabel: "Apasavya / grupo Rohini",
    motion: "apasavya" as const,
    members: ["Rohini", "Magha", "Vishakha", "Shravana"],
    padas: [
      { sequence: [8, 9, 10, 11, 0, 1, 2, 4, 3], paramayus: 86, deha: 3, jeeva: 8, amsa: 7 },
      { sequence: [5, 6, 7, 11, 10, 9, 8, 7, 6], paramayus: 83, deha: 6, jeeva: 5, amsa: 6 },
      { sequence: [5, 4, 3, 2, 1, 0, 8, 9, 10], paramayus: 85, deha: 10, jeeva: 5, amsa: 5 },
      { sequence: [11, 0, 1, 2, 4, 3, 5, 6, 7], paramayus: 100, deha: 7, jeeva: 11, amsa: 3 },
    ],
  },
  {
    key: "mrigashira",
    patternLabel: "Mrigashira",
    groupLabel: "Apasavya / grupo Mrigashira",
    motion: "apasavya" as const,
    members: ["Mrigashira", "Purva Phalguni", "Anuradha", "Dhanishta"],
    padas: [
      { sequence: [11, 10, 9, 8, 7, 6, 5, 4, 3], paramayus: 86, deha: 3, jeeva: 11, amsa: 4 },
      { sequence: [2, 1, 0, 8, 9, 10, 11, 0, 1], paramayus: 83, deha: 1, jeeva: 2, amsa: 2 },
      { sequence: [2, 4, 3, 5, 6, 7, 11, 10, 9], paramayus: 85, deha: 9, jeeva: 2, amsa: 1 },
      { sequence: [8, 7, 6, 5, 4, 3, 2, 1, 0], paramayus: 100, deha: 0, jeeva: 8, amsa: 0 },
    ],
  },
  {
    key: "ardra",
    patternLabel: "Ardra",
    groupLabel: "Apasavya / grupo Rohini",
    motion: "apasavya" as const,
    members: ["Ardra", "Uttara Phalguni", "Jyeshtha", "Shatabhisha"],
    padas: [
      { sequence: [8, 9, 10, 11, 0, 1, 2, 4, 3], paramayus: 86, deha: 3, jeeva: 8, amsa: 11 },
      { sequence: [5, 6, 7, 11, 10, 9, 8, 7, 6], paramayus: 83, deha: 6, jeeva: 5, amsa: 10 },
      { sequence: [5, 4, 3, 2, 1, 0, 8, 9, 10], paramayus: 85, deha: 10, jeeva: 5, amsa: 9 },
      { sequence: [11, 0, 1, 2, 4, 3, 5, 6, 7], paramayus: 100, deha: 7, jeeva: 11, amsa: 8 },
    ],
  },
] as const;
const KALACHAKRA_CYCLE_MODE_LABELS = {
  "progressive-group": "Progressivo por grupo",
  "cyclic-pada": "Ciclico no mesmo pada",
  "same-nakshatra-reset": "Reset no mesmo nakshatra",
} as const;

const ASHTOTTARI_STAR_SEGMENTS = [
  { name: "Ashwini", start: 0, end: 13 + 20 / 60 },
  { name: "Bharani", start: 13 + 20 / 60, end: 26 + 40 / 60 },
  { name: "Krittika", start: 26 + 40 / 60, end: 40 },
  { name: "Rohini", start: 40, end: 53 + 20 / 60 },
  { name: "Mrigashira", start: 53 + 20 / 60, end: 66 + 40 / 60 },
  { name: "Ardra", start: 66 + 40 / 60, end: 80 },
  { name: "Punarvasu", start: 80, end: 93 + 20 / 60 },
  { name: "Pushya", start: 93 + 20 / 60, end: 106 + 40 / 60 },
  { name: "Ashlesha", start: 106 + 40 / 60, end: 120 },
  { name: "Magha", start: 120, end: 133 + 20 / 60 },
  { name: "Purva Phalguni", start: 133 + 20 / 60, end: 146 + 40 / 60 },
  { name: "Uttara Phalguni", start: 146 + 40 / 60, end: 160 },
  { name: "Hasta", start: 160, end: 173 + 20 / 60 },
  { name: "Chitra", start: 173 + 20 / 60, end: 186 + 40 / 60 },
  { name: "Swati", start: 186 + 40 / 60, end: 200 },
  { name: "Vishakha", start: 200, end: 213 + 20 / 60 },
  { name: "Anuradha", start: 213 + 20 / 60, end: 226 + 40 / 60 },
  { name: "Jyeshtha", start: 226 + 40 / 60, end: 240 },
  { name: "Mula", start: 240, end: 253 + 20 / 60 },
  { name: "Purva Ashadha", start: 253 + 20 / 60, end: 266 + 40 / 60 },
  { name: "Uttara Ashadha", start: 266 + 40 / 60, end: 276 + 40 / 60 },
  { name: "Abhijit", start: 276 + 40 / 60, end: 280 + 53 / 60 + 20 / 3600 },
  { name: "Shravana", start: 280 + 53 / 60 + 20 / 3600, end: 293 + 20 / 60 },
  { name: "Dhanishtha", start: 293 + 20 / 60, end: 306 + 40 / 60 },
  { name: "Shatabhisha", start: 306 + 40 / 60, end: 320 },
  { name: "Purva Bhadrapada", start: 320, end: 333 + 20 / 60 },
  { name: "Uttara Bhadrapada", start: 333 + 20 / 60, end: 346 + 40 / 60 },
  { name: "Revati", start: 346 + 40 / 60, end: 360 },
] as const;
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
const ODD_FOOTED_SIGNS = new Set([0, 1, 2, 6, 7, 8]);
const NATURAL_ODD_SIGNS = new Set([0, 2, 4, 6, 8, 10]);
const WEEKDAY_PLANET_KEYS = [
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
] as const;
const NARAYANA_GENERAL_ORDER = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [1, 8, 3, 10, 5, 0, 7, 2, 9, 4, 11, 6],
  [2, 10, 6, 5, 1, 9, 8, 4, 0, 11, 7, 3],
  [3, 2, 1, 0, 11, 10, 9, 8, 7, 6, 5, 4],
  [4, 9, 2, 7, 0, 5, 10, 3, 8, 1, 6, 11],
  [5, 9, 1, 2, 6, 10, 11, 3, 7, 8, 0, 4],
  [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5],
  [7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5, 0],
  [8, 4, 0, 11, 7, 3, 2, 10, 6, 5, 1, 9],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11, 10],
  [10, 3, 8, 1, 6, 11, 4, 9, 2, 7, 0, 5],
  [11, 3, 7, 8, 0, 4, 5, 9, 1, 2, 6, 10],
] as const;
const NARAYANA_KETU_START_ORDER = [
  [0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  [1, 6, 11, 4, 9, 2, 7, 0, 5, 10, 3, 8],
  [2, 6, 10, 11, 3, 7, 8, 0, 4, 5, 9, 1],
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
  [4, 11, 6, 1, 8, 3, 10, 5, 0, 7, 2, 9],
  [5, 1, 9, 8, 4, 0, 11, 7, 3, 2, 10, 6],
  [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7],
  [7, 0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2],
  [8, 0, 4, 5, 9, 1, 2, 6, 10, 11, 3, 7],
  [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8],
  [10, 5, 0, 7, 2, 9, 4, 11, 6, 1, 8, 3],
  [11, 7, 3, 2, 10, 6, 5, 1, 9, 8, 4, 0],
] as const;
const NARAYANA_EXALTATION_SIGNS: Record<string, number> = {
  sun: 0,
  moon: 1,
  mars: 9,
  mercury: 5,
  jupiter: 3,
  venus: 11,
  saturn: 6,
  northNode: 2,
  southNode: 8,
};
const NARAYANA_DEBILITATION_SIGNS: Record<string, number> = {
  sun: 6,
  moon: 7,
  mars: 3,
  mercury: 11,
  jupiter: 9,
  venus: 5,
  saturn: 0,
  northNode: 8,
  southNode: 2,
};
const VIMSHOTTARI_SEQUENCE = [
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
const VIMSHOTTARI_YEARS: Record<(typeof VIMSHOTTARI_SEQUENCE)[number], number> = {
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
const VIMSHOTTARI_YEAR_MS = 365.2422 * 24 * 60 * 60 * 1000;

type VimshottariLord = (typeof VIMSHOTTARI_SEQUENCE)[number];

type VimshottariWindowPeriod = {
  lord: VimshottariLord;
  startMs: number;
  endMs: number;
  startLabel: string;
  endLabel: string;
  years: number;
  days: number;
  active: boolean;
};

type SthiraBrahmaCandidate = {
  point: VedicPoint;
  sourceHouses: number[];
  sourceSigns: number[];
  strong: boolean;
  odd: boolean;
  invisible: boolean;
  invalid: boolean;
  invalidReasons: string[];
  sourceNote: string;
  rank: readonly [number, 0 | 1, 0 | 1, 0 | 1, number, number, number];
};

type SthiraRudraCandidate = {
  label: string;
  baseSignIndex: number;
  point: VedicPoint;
  sourceNote: string;
  rank: readonly [number, number, number, 0 | 1, number];
};

type SthiraTriadMemberRow = {
  label: "Brahma" | "Rudra" | "Maheshwara";
  point: VedicPoint;
  base: string;
  anchorHits: string[];
  pairHits: string[];
  score: number;
  note: string;
};

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function isMovable(signIndex: number) {
  return [0, 3, 6, 9].includes(signIndex);
}

function isFixed(signIndex: number) {
  return [1, 4, 7, 10].includes(signIndex);
}

function isDual(signIndex: number) {
  return !isMovable(signIndex) && !isFixed(signIndex);
}

function signModeWeight(signIndex: number) {
  if (isMovable(signIndex)) {
    return 3;
  }

  if (isFixed(signIndex)) {
    return 2;
  }

  return 1;
}

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

function normalize24(value: number) {
  return ((value % 24) + 24) % 24;
}

function decimalHoursToLabel(value: number) {
  const normalized = normalize24(value);
  const hours = Math.floor(normalized);
  const minutes = Math.round((normalized - hours) * 60);
  const safeHours = minutes === 60 ? (hours + 1) % 24 : hours;
  const safeMinutes = minutes === 60 ? 0 : minutes;
  return `${safeHours.toString().padStart(2, "0")}:${safeMinutes.toString().padStart(2, "0")}`;
}

function boolLabel(value: boolean) {
  return value ? "Sim" : "Nao";
}

function coerceVimshottariLord(lord: string): VimshottariLord | null {
  return VIMSHOTTARI_SEQUENCE.includes(lord as VimshottariLord)
    ? (lord as VimshottariLord)
    : null;
}

function formatUtcDateTimeLabel(timestamp: number) {
  return `${new Date(timestamp).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function rotateList<T>(items: readonly T[], offset: number) {
  if (!items.length) {
    return [] as T[];
  }

  return items.map((_, index) => items[modulo(index + offset, items.length)]);
}

function kalachakraYearsForSign(signIndex: number) {
  return KALACHAKRA_SIGN_YEARS[modulo(signIndex, 12)];
}

function formatKalachakraMotion(value: "savya" | "apasavya") {
  return value === "savya" ? "Savya" : "Apasavya";
}

function formatSignSequence(signIndices: readonly number[]) {
  return signIndices.map((signIndex) => SIGN_NAMES[signIndex]).join(" -> ");
}

function formatKalachakraCycleMode(value: JyotishConfig["kalachakraCycleMode"]) {
  return KALACHAKRA_CYCLE_MODE_LABELS[value];
}

function buildKalachakraEnvelope(
  pattern: (typeof KALACHAKRA_PATTERNS)[number],
  memberIndex: number,
  padaIndex: number
) {
  const safeMemberIndex = modulo(memberIndex, pattern.members.length);
  const safePadaIndex = modulo(padaIndex, pattern.padas.length);
  const pada = pattern.padas[safePadaIndex];
  const sequence = rotateList(pada.sequence, safeMemberIndex);
  const years = sequence.map((signIndex) => kalachakraYearsForSign(signIndex));

  return {
    memberIndex: safeMemberIndex,
    memberName: pattern.members[safeMemberIndex],
    padaIndex: safePadaIndex,
    padaNumber: safePadaIndex + 1,
    sequence,
    years,
    paramayus: pada.paramayus,
    amsa: pada.amsa,
    deha: pada.deha,
    jeeva: pada.jeeva,
  };
}

function advanceKalachakraEnvelope(
  pattern: (typeof KALACHAKRA_PATTERNS)[number],
  memberIndex: number,
  padaIndex: number,
  mode: JyotishConfig["kalachakraCycleMode"]
) {
  if (mode === "cyclic-pada") {
    return { memberIndex, padaIndex };
  }

  if (padaIndex < pattern.padas.length - 1) {
    return { memberIndex, padaIndex: padaIndex + 1 };
  }

  if (mode === "same-nakshatra-reset") {
    return { memberIndex, padaIndex: 0 };
  }

  return {
    memberIndex: modulo(memberIndex + 1, pattern.members.length),
    padaIndex: 0,
  };
}

function buildKalachakraClassicalProfile(
  snapshot: VedicSnapshot,
  cycleMode: JyotishConfig["kalachakraCycleMode"] = "progressive-group"
) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const pattern =
    KALACHAKRA_PATTERNS.find((entry) => (entry.members as readonly string[]).includes(moon.nakshatra)) ??
    KALACHAKRA_PATTERNS[0];
  const birthMemberIndex = Math.max(0, (pattern.members as readonly string[]).indexOf(moon.nakshatra));
  const birthPadaIndex = Math.max(0, Math.min(pattern.padas.length - 1, moon.pada - 1));
  const birthEnvelope = buildKalachakraEnvelope(pattern, birthMemberIndex, birthPadaIndex);
  const padaProfile = pattern.padas[birthPadaIndex];
  const memberIndex = Math.max(0, (pattern.members as readonly string[]).indexOf(moon.nakshatra));
  const rotatedSequence = birthEnvelope.sequence;
  const rotatedYears = birthEnvelope.years;
  const nakshatraSize = 360 / 27;
  const padaSize = nakshatraSize / 4;
  const withinNakshatra = modulo(moon.longitude, nakshatraSize);
  const rawWithinPada = withinNakshatra - (moon.pada - 1) * padaSize;
  const withinPada = Math.max(0, Math.min(padaSize * 0.999999, rawWithinPada));
  const elapsedFraction = padaSize > 0 ? withinPada / padaSize : 0;
  const elapsedYears = elapsedFraction * padaProfile.paramayus;
  let remainingElapsed = elapsedYears;
  let activeSequenceIndex = 0;

  while (
    activeSequenceIndex < rotatedYears.length - 1 &&
    remainingElapsed >= rotatedYears[activeSequenceIndex]
  ) {
    remainingElapsed -= rotatedYears[activeSequenceIndex];
    activeSequenceIndex += 1;
  }

  const activeSignIndex = rotatedSequence[activeSequenceIndex];
  const activeSignYears = rotatedYears[activeSequenceIndex];
  const activeElapsedYears = Math.max(0, Math.min(activeSignYears, remainingElapsed));
  const activeBalanceYears = Math.max(0.0001, activeSignYears - activeElapsedYears);
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  const analysisYearsFromBirth = Math.max(0, (analysisMoment.getTime() - birthMoment.getTime()) / KALACHAKRA_YEAR_MS);
  const targetYears = Math.max(analysisYearsFromBirth + 24, birthEnvelope.paramayus + 24);
  let cursor = new Date(birthMoment);
  const periods: Array<{
    step: number;
    signIndex: number;
    signName: string;
    years: number;
    start: string;
    end: string;
    active: boolean;
    note: string;
    nakshatra: string;
    pada: number;
    envelope: string;
  }> = [];
  let envelopeMemberIndex = birthMemberIndex;
  let envelopePadaIndex = birthPadaIndex;
  let envelopeCounter = 1;
  let stepStartIndex = activeSequenceIndex;
  let safety = 0;

  while (
    (cursor.getTime() <= analysisMoment.getTime() || periods.length < 18 || periods.reduce((sum, period) => sum + period.years, 0) < targetYears) &&
    safety < 64
  ) {
    const envelope = buildKalachakraEnvelope(pattern, envelopeMemberIndex, envelopePadaIndex);

    for (let stepIndex = stepStartIndex; stepIndex < envelope.sequence.length; stepIndex += 1) {
      const signIndex = envelope.sequence[stepIndex];
      const years =
        envelopeCounter === 1 && stepIndex === activeSequenceIndex ? activeBalanceYears : envelope.years[stepIndex];
      const start = new Date(cursor);
      const end = new Date(cursor.getTime() + years * KALACHAKRA_YEAR_MS);
      const active = analysisMoment >= start && analysisMoment < end;
      cursor = end;
      periods.push({
        step: stepIndex + 1,
        signIndex,
        signName: SIGN_NAMES[signIndex],
        years,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        active,
        nakshatra: envelope.memberName,
        pada: envelope.padaNumber,
        envelope: `${envelope.memberName} / ${envelope.padaNumber}o pada`,
        note:
          envelopeCounter === 1 && stepIndex === activeSequenceIndex
            ? `Saldo remanescente da dasha natal: ${years.toFixed(2)} anos apos ${activeElapsedYears.toFixed(2)} anos ja transcorridos em ${SIGN_NAMES[signIndex]}.`
            : `Etapa ${stepIndex + 1} do envelope ${envelope.memberName} / ${envelope.padaNumber}o pada.`,
      });
    }

    const next = advanceKalachakraEnvelope(pattern, envelopeMemberIndex, envelopePadaIndex, cycleMode);
    envelopeMemberIndex = next.memberIndex;
    envelopePadaIndex = next.padaIndex;
    envelopeCounter += 1;
    stepStartIndex = 0;
    safety += 1;
  }

  const activeBirthPeriod =
    periods.find((period) => period.active) ??
    (analysisMoment < birthMoment ? periods[0] : periods[periods.length - 1]);
  const moonD9 = snapshot.vargas.find((chart) => chart.key === "D9")?.points.find((point) => point.key === "moon");
  const amsaMatchesNavamsa = moonD9?.signIndex === birthEnvelope.amsa;
  const classicalRows = pattern.padas.map((pada, index) => ({
    pada: index + 1,
    motion: formatKalachakraMotion(pattern.motion),
    amsaSignIndex: pada.amsa,
    dehaSignIndex: pada.deha,
    jeevaSignIndex: pada.jeeva,
    paramayus: pada.paramayus,
    sequence: formatSignSequence(pada.sequence),
  }));

  return {
    moon,
    pattern,
    memberIndex,
    padaProfile,
    rotatedSequence,
    rotatedYears,
    elapsedFraction,
    elapsedYears,
    remainingYears: Math.max(0, padaProfile.paramayus - elapsedYears),
    activeSequenceIndex,
    activeSignIndex,
    activeSignYears,
    activeElapsedYears,
    activeBalanceYears,
    activeBirthPeriod,
    birthPeriods: periods,
    moonD9,
    amsaMatchesNavamsa,
    classicalRows,
    cycleMode,
    cycleModeLabel: formatKalachakraCycleMode(cycleMode),
    nextEnvelope: advanceKalachakraEnvelope(pattern, birthMemberIndex, birthPadaIndex, cycleMode),
    note:
      `${formatKalachakraMotion(pattern.motion)} em ${pattern.groupLabel}, padrao ${pattern.patternLabel}, com ${moon.nakshatra} na ${memberIndex + 1}a posicao do chakra e pada ${moon.pada}. ` +
      `A sequencia natal do pada foi rotacionada por essa ordem interna para evitar que os membros do mesmo chakra colapsem no mesmo ponto de entrada.`,
    balanceNote:
      `Fracao transcorrida no pada lunar: ${(elapsedFraction * 100).toFixed(2)}%, equivalente a ${elapsedYears.toFixed(2)} de ${padaProfile.paramayus} anos do Paramayus. ` +
      `Saldo remanescente no ciclo natal: ${Math.max(0, padaProfile.paramayus - elapsedYears).toFixed(2)} anos.`,
    cycleMethodNote:
      `Modo escolar ativo: ${formatKalachakraCycleMode(cycleMode)}. ` +
      (cycleMode === "progressive-group"
        ? "Ao fechar um pada, o chakra avanca pelo mesmo nakshatra ate o 4o pada e depois salta para o 1o pada do proximo membro do mesmo grupo."
        : cycleMode === "cyclic-pada"
          ? "Ao fechar o 9o passo, o chakra repete o mesmo pada indefinidamente, sem avancar para outro membro ou pada."
          : "Ao fechar o 4o pada, o chakra reinicia no 1o pada do mesmo nakshatra, sem caminhar para o proximo membro do grupo."),
  };
}

function resolveExactAntardashaYears(
  mahadasha: DashaPeriod | undefined,
  antardasha: DashaSubPeriod | undefined
) {
  const antaraLord = antardasha ? coerceVimshottariLord(antardasha.lord) : null;
  return mahadasha && antaraLord
    ? (mahadasha.years * VIMSHOTTARI_YEARS[antaraLord]) / 120
    : antardasha?.years ?? 0;
}

function buildVimshottariWindow(
  startLord: string,
  parentStartMs: number,
  parentYears: number,
  activeMoment: Date
): VimshottariWindowPeriod[] {
  const normalizedStartLord = coerceVimshottariLord(startLord);
  if (!normalizedStartLord || parentYears <= 0) {
    return [];
  }

  const startIndex = VIMSHOTTARI_SEQUENCE.indexOf(normalizedStartLord);
  let cursor = parentStartMs;

  return VIMSHOTTARI_SEQUENCE.map((_, offset) => {
    const lord = VIMSHOTTARI_SEQUENCE[(startIndex + offset) % VIMSHOTTARI_SEQUENCE.length];
    const years = (parentYears * VIMSHOTTARI_YEARS[lord]) / 120;
    const startMs = cursor;
    const endMs = cursor + years * VIMSHOTTARI_YEAR_MS;
    cursor = endMs;

    return {
      lord,
      startMs,
      endMs,
      startLabel: formatUtcDateTimeLabel(startMs),
      endLabel: formatUtcDateTimeLabel(endMs),
      years: Number(years.toFixed(6)),
      days: Number((years * 365.2422).toFixed(2)),
      active: activeMoment.getTime() >= startMs && activeMoment.getTime() < endMs,
    } satisfies VimshottariWindowPeriod;
  });
}

function windowElapsed(start: number, hour: number) {
  return normalize24(hour - start);
}

function windowContains(start: number, duration: number, hour: number) {
  return windowElapsed(start, hour) < duration;
}

function signCount(fromSignIndex: number, toSignIndex: number, forward: boolean) {
  if (forward) {
    return modulo(toSignIndex - fromSignIndex, 12) + 1;
  }

  return modulo(fromSignIndex - toSignIndex, 12) + 1;
}

function conjunctionCount(snapshot: VedicSnapshot, key: string) {
  const point = snapshot.planets.find((candidate) => candidate.key === key);
  if (!point) {
    return 0;
  }

  return snapshot.planets.filter((candidate) => candidate.signIndex === point.signIndex).length - 1;
}

function dignityRank(tags: string[]) {
  if (tags.includes("Exaltado") || tags.includes("Moolatrikona") || tags.includes("Domicilio")) {
    return 3;
  }

  if (tags.includes("Amigavel")) {
    return 2;
  }

  if (tags.includes("Inimigo") || tags.includes("Debilitado") || tags.includes("Combusto")) {
    return 0;
  }

  return 1;
}

function signRelationRank(fromSignIndex: number, lordSignIndex: number) {
  const distance = modulo(lordSignIndex - fromSignIndex, 12) + 1;
  if ([1, 5, 9].includes(distance)) {
    return 2;
  }

  if ([1, 4, 7, 10].includes(distance)) {
    return 1;
  }

  return 0;
}

function compareRankArrays(left: readonly number[], right: readonly number[]) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0);
    if (delta !== 0) {
      return delta;
    }
  }

  return 0;
}

function getPlanetPoint(snapshot: VedicSnapshot, key: string) {
  return snapshot.planets.find((candidate) => candidate.key === key);
}

function getKarakaPoint(snapshot: VedicSnapshot, role: string) {
  const karaka = snapshot.charaKarakas.find((item) => item.role === role);
  return karaka ? getPlanetPoint(snapshot, karaka.key) : undefined;
}

function hasPlanetInSign(snapshot: VedicSnapshot, signIndex: number, key: string) {
  return snapshot.planets.some((candidate) => candidate.signIndex === signIndex && candidate.key === key);
}

function isStrongPlanet(point: VedicPoint) {
  return dignityRank(point.tags) >= 2;
}

function hasJaiminiRashiDrishti(fromSignIndex: number, toSignIndex: number) {
  if (fromSignIndex === toSignIndex) {
    return false;
  }

  if (isMovable(fromSignIndex)) {
    return isFixed(toSignIndex) && toSignIndex !== modulo(fromSignIndex + 1, 12);
  }

  if (isFixed(fromSignIndex)) {
    return isMovable(toSignIndex) && toSignIndex !== modulo(fromSignIndex - 1, 12);
  }

  return isDual(toSignIndex);
}

function buildSignStrength(snapshot: VedicSnapshot, signIndex: number) {
  const occupants = snapshot.planets.filter((candidate) => candidate.signIndex === signIndex);
  const lordInfo = resolveCharaLord(snapshot, signIndex);
  const watchedKeys = new Set(["mercury", "jupiter"]);
  if (lordInfo?.point?.key) {
    watchedKeys.add(lordInfo.point.key);
  }

  const aspectors = snapshot.planets.filter(
    (candidate) => watchedKeys.has(candidate.key) && hasJaiminiRashiDrishti(candidate.signIndex, signIndex)
  );
  const parityBonus =
    lordInfo?.point && signIndex % 2 !== lordInfo.point.signIndex % 2 ? 1 : 0;

  return {
    signIndex,
    lordInfo,
    occupants,
    aspectors,
    rank: [
      occupants.length,
      aspectors.length,
      occupants.filter((candidate) => candidate.tags.includes("Exaltado")).length,
      parityBonus,
      signModeWeight(signIndex),
      lordInfo?.point?.degreeInSign ?? -1,
    ] as const,
  };
}

function chooseStrongerSign(snapshot: VedicSnapshot, leftSignIndex: number, rightSignIndex: number) {
  const left = buildSignStrength(snapshot, leftSignIndex);
  const right = buildSignStrength(snapshot, rightSignIndex);
  return compareRankArrays(left.rank, right.rank) >= 0 ? left : right;
}

function describeSignStrength(
  snapshot: VedicSnapshot,
  winnerSignIndex: number,
  loserSignIndex: number
) {
  const winner = buildSignStrength(snapshot, winnerSignIndex);
  const lordName = winner.lordInfo?.point?.name ?? "regente nao localizado";
  const aspectNames = winner.aspectors.length
    ? winner.aspectors.map((candidate) => candidate.name).join(", ")
    : "sem apoio extra de Budha, Guru ou regente";
  const lordDegree = winner.lordInfo?.point?.degreeInSign;
  const degreeText = typeof lordDegree === "number" ? lordDegree.toFixed(2) : "--";

  return `${SIGN_NAMES[winnerSignIndex]} vence ${SIGN_NAMES[loserSignIndex]} por ocupacao, apoio de rashi drishti (${aspectNames}) e regente ${lordName} a ${degreeText} graus no signo.`;
}

function resolveCharaLord(snapshot: VedicSnapshot, signIndex: number) {
  if (signIndex === 7) {
    const mars = snapshot.planets.find((point) => point.key === "mars");
    const ketu = snapshot.planets.find((point) => point.key === "southNode");
    if (!mars && !ketu) {
      return undefined;
    }

    if (mars?.signIndex === signIndex && ketu?.signIndex === signIndex) {
      return { point: mars ?? ketu!, note: "Scorpio com ambos os co-lords no proprio signo: 12 anos pela regra de excecao." };
    }
    if (mars?.signIndex === signIndex) {
      return { point: ketu ?? mars, note: "Scorpio com Mars no proprio signo: o working set usa Ketu para a contagem de anos." };
    }
    if (ketu?.signIndex === signIndex) {
      return { point: mars ?? ketu, note: "Scorpio com Ketu no proprio signo: o working set usa Mars para a contagem de anos." };
    }

    const candidates = [mars, ketu].filter(Boolean);
    const ranked = candidates
      .map((point) => ({
        point: point!,
        conjunctions: conjunctionCount(snapshot, point!.key),
        modeWeight: signModeWeight(point!.signIndex),
      }))
      .sort((left, right) =>
        right.conjunctions - left.conjunctions ||
        right.modeWeight - left.modeWeight ||
        right.point.degreeInSign - left.point.degreeInSign
      );
    return {
      point: ranked[0].point,
      note: "Scorpio com co-lords fora do signo: o working set escolhe o mais forte por conjuncao, modalidade do signo e grau no signo.",
    };
  }

  if (signIndex === 10) {
    const saturn = snapshot.planets.find((point) => point.key === "saturn");
    const rahu = snapshot.planets.find((point) => point.key === "northNode");
    if (!saturn && !rahu) {
      return undefined;
    }

    if (saturn?.signIndex === signIndex && rahu?.signIndex === signIndex) {
      return { point: saturn ?? rahu!, note: "Aquarius com ambos os co-lords no proprio signo: 12 anos pela regra de excecao." };
    }
    if (saturn?.signIndex === signIndex) {
      return { point: rahu ?? saturn, note: "Aquarius com Saturn no proprio signo: o working set usa Rahu para a contagem de anos." };
    }
    if (rahu?.signIndex === signIndex) {
      return { point: saturn ?? rahu, note: "Aquarius com Rahu no proprio signo: o working set usa Saturn para a contagem de anos." };
    }

    const candidates = [saturn, rahu].filter(Boolean);
    const ranked = candidates
      .map((point) => ({
        point: point!,
        conjunctions: conjunctionCount(snapshot, point!.key),
        modeWeight: signModeWeight(point!.signIndex),
      }))
      .sort((left, right) =>
        right.conjunctions - left.conjunctions ||
        right.modeWeight - left.modeWeight ||
        right.point.degreeInSign - left.point.degreeInSign
      );
    return {
      point: ranked[0].point,
      note: "Aquarius com co-lords fora do signo: o working set escolhe o mais forte por conjuncao, modalidade do signo e grau no signo.",
    };
  }

  const lordKey = SIGN_LORD_KEYS[signIndex];
  const point = snapshot.planets.find((candidate) => candidate.key === lordKey);
  if (!point) {
    return undefined;
  }

  return {
    point,
    note: `Regente padrao do signo usado para a contagem: ${point.name}.`,
  };
}

function buildSeedReference(snapshot: VedicSnapshot) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const sun = snapshot.planets.find((point) => point.key === "sun") ?? snapshot.ascendant;
  const candidates = [
    { label: "Lagna", signIndex: snapshot.ascendant.signIndex },
    { label: "Moon", signIndex: moon.signIndex },
    { label: "Sun", signIndex: sun.signIndex },
  ].map((candidate) => {
    const lordInfo = resolveCharaLord(snapshot, candidate.signIndex);
    const point = lordInfo?.point;
    const parityBonus =
      point && candidate.signIndex % 2 !== point.signIndex % 2 ? 1 : 0;
    return {
      ...candidate,
      lordInfo,
      point,
      rank: [
        dignityRank(point?.tags ?? []),
        point ? conjunctionCount(snapshot, point.key) : -1,
        point ? signRelationRank(candidate.signIndex, point.signIndex) : -1,
        parityBonus,
        point?.degreeInSign ?? -1,
      ] as const,
    };
  });

  const sorted = candidates.sort((left, right) => {
    for (let index = 0; index < left.rank.length; index += 1) {
      const delta = right.rank[index] - left.rank[index];
      if (delta !== 0) {
        return delta;
      }
    }
    return 0;
  });

  return sorted[0];
}

function buildCharaSequence(seedSignIndex: number, direct: boolean) {
  return Array.from({ length: 12 }, (_, index) =>
    modulo(seedSignIndex + (direct ? index : -index), 12)
  );
}

function buildCharaYears(snapshot: VedicSnapshot, signIndex: number) {
  const lordInfo = resolveCharaLord(snapshot, signIndex);
  if (!lordInfo?.point) {
    return {
      years: 0,
      lordName: "--",
      note: "Sem regente operacional disponivel para a contagem.",
    };
  }

  if (lordInfo.point.signIndex === signIndex) {
    return {
      years: 12,
      lordName: lordInfo.point.name,
      note: `${lordInfo.note} O regente cai no proprio signo; o working set fixa 12 anos.`,
    };
  }

  const forward = ODD_FOOTED_SIGNS.has(signIndex);
  const count = signCount(signIndex, lordInfo.point.signIndex, forward);
  return {
    years: count - 1,
    lordName: lordInfo.point.name,
    note: `${lordInfo.note} Contagem ${forward ? "zodiacal" : "anti-zodiacal"} do signo ate o regente, menos 1.`,
  };
}

function buildCharaDasha(snapshot: VedicSnapshot) {
  const seed = buildSeedReference(snapshot);
  const ninthFromSeed = modulo(seed.signIndex + 8, 12);
  const direct = ODD_FOOTED_SIGNS.has(ninthFromSeed);
  const sequence = buildCharaSequence(seed.signIndex, direct);
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  let cursor = new Date(birthMoment);
  const periods = Array.from({ length: 24 }, (_, index) => {
    const signIndex = sequence[index % sequence.length];
    const signData = buildCharaYears(snapshot, signIndex);
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + signData.years * 365.2425 * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    cursor = end;
    return {
      signIndex,
      signName: SIGN_NAMES[signIndex],
      lordName: signData.lordName,
      years: signData.years,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
      note: signData.note,
    };
  });

  const activePeriod = periods.find((period) => period.active) ?? periods[0];
  const activeIndex = sequence.findIndex((signIndex) => signIndex === activePeriod.signIndex);
  const subSequence = buildCharaSequence(activePeriod.signIndex, direct);
  const cycleData = subSequence.map((signIndex) => ({
    signIndex,
    signName: SIGN_NAMES[signIndex],
    ...buildCharaYears(snapshot, signIndex),
  }));
  const totalYears = cycleData.reduce((sum, row) => sum + row.years, 0);
  let subCursor = new Date(`${activePeriod.start}T00:00:00Z`);
  const subPeriods = cycleData.map((row) => {
    const days = totalYears > 0 ? (activePeriod.years * row.years * 365.2425) / totalYears : 0;
    const start = new Date(subCursor);
    const end = new Date(subCursor.getTime() + days * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    subCursor = end;
    return {
      maha: activePeriod.signName,
      signName: row.signName,
      lordName: row.lordName,
      years: row.years,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
      note: row.note,
    };
  });

  return {
    seed,
    direct,
    periods,
    activeIndex,
    activePeriod,
    subPeriods,
    note:
      "Chara Dasha v1 segue o working set Jaimini/PVN Rao-JHora: semente pela mais forte entre Lagna, Lua e Sol; direcao pelo 9o signo da semente; anos por contagem do signo ao regente, com 12 anos quando o regente cai no proprio signo.",
  };
}

function getNarayanaAdjustment(point?: VedicPoint) {
  if (!point) {
    return {
      adjustment: 0,
      note: "Sem ajuste adicional de exaltacao/debilitacao por falta de regente operacional.",
    };
  }

  if (NARAYANA_EXALTATION_SIGNS[point.key] === point.signIndex) {
    return {
      adjustment: 1,
      note: `${point.name} em exaltacao operacional para Narayana (+1 ano no primeiro ciclo).`,
    };
  }

  if (NARAYANA_DEBILITATION_SIGNS[point.key] === point.signIndex) {
    return {
      adjustment: -1,
      note: `${point.name} em debilidade operacional para Narayana (-1 ano no primeiro ciclo).`,
    };
  }

  return {
    adjustment: 0,
    note: `${point.name} sem ajuste de exaltacao/debilitacao no primeiro ciclo.`,
  };
}

function buildNarayanaYears(snapshot: VedicSnapshot, signIndex: number) {
  const base = buildCharaYears(snapshot, signIndex);
  const lordInfo = resolveCharaLord(snapshot, signIndex);
  const adjustmentInfo = getNarayanaAdjustment(lordInfo?.point);
  const rawYears = base.years + adjustmentInfo.adjustment;
  const years = Math.max(0, Math.min(12, rawYears));
  const capNote =
    years !== rawYears
      ? ` Aplicado teto operacional de ${years} anos para manter o ciclo dentro de 0 a 12.`
      : "";

  return {
    years,
    secondCycleYears: 12 - years,
    lordName: base.lordName,
    note: `${base.note} ${adjustmentInfo.note}${capNote}`.trim(),
  };
}

function buildNarayanaAntardasha(
  snapshot: VedicSnapshot,
  activePeriod: {
    signIndex: number;
    signName: string;
    years: number;
    start: string;
  }
) {
  const oppositeSignIndex = modulo(activePeriod.signIndex + 6, 12);
  const stronger = chooseStrongerSign(snapshot, activePeriod.signIndex, oppositeSignIndex);
  const seedLord = resolveCharaLord(snapshot, stronger.signIndex)?.point;
  const seedSignIndex = seedLord?.signIndex ?? stronger.signIndex;
  const hasSaturn = hasPlanetInSign(snapshot, activePeriod.signIndex, "saturn");
  const hasKetu = hasPlanetInSign(snapshot, activePeriod.signIndex, "southNode");
  let direct = NATURAL_ODD_SIGNS.has(activePeriod.signIndex);

  if (hasSaturn) {
    direct = true;
  } else if (hasKetu) {
    direct = !direct;
  }

  const sequence = Array.from({ length: 12 }, (_, index) =>
    modulo(seedSignIndex + (direct ? index : -index), 12)
  );
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  const daysPerSubPeriod = (activePeriod.years * 365.2425) / 12;
  let cursor = new Date(`${activePeriod.start}T00:00:00Z`);
  const subPeriods = sequence.map((signIndex) => {
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + daysPerSubPeriod * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    cursor = end;

    return {
      maha: activePeriod.signName,
      signName: SIGN_NAMES[signIndex],
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      months: activePeriod.years,
      active,
    };
  });

  return {
    seedSignIndex,
    direct,
    strongerSignIndex: stronger.signIndex,
    subPeriods,
    note:
      `Antardasha iniciada pelo signo do regente de ${SIGN_NAMES[stronger.signIndex]}, mais forte entre a dasha ativa e sua 7a. ` +
      `Ordem ${direct ? "zodiacal" : "reversa"} pela paridade natural da rasi da maha${hasSaturn ? ", com excecao de Saturn ativando sequencia regular" : ""}${hasKetu ? ", com viparita de Ketu invertendo a ordem" : ""}.`,
  };
}

function buildNarayanaDasha(snapshot: VedicSnapshot) {
  const lagnaSignIndex = snapshot.ascendant.signIndex;
  const oppositeSignIndex = modulo(lagnaSignIndex + 6, 12);
  const startSign = chooseStrongerSign(snapshot, lagnaSignIndex, oppositeSignIndex);
  const startSignIndex = startSign.signIndex;
  const hasSaturn = hasPlanetInSign(snapshot, startSignIndex, "saturn");
  const hasKetu = hasPlanetInSign(snapshot, startSignIndex, "southNode");
  const order = hasSaturn
    ? Array.from({ length: 12 }, (_, index) => modulo(startSignIndex + index, 12))
    : hasKetu
      ? [...NARAYANA_KETU_START_ORDER[startSignIndex]]
      : [...NARAYANA_GENERAL_ORDER[startSignIndex]];
  const cycleRows = order.map((signIndex) => ({
    signIndex,
    signName: SIGN_NAMES[signIndex],
    ...buildNarayanaYears(snapshot, signIndex),
  }));
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  let cursor = new Date(birthMoment);
  const periods = [...cycleRows, ...cycleRows].map((row, index) => {
    const cycle = index < cycleRows.length ? 1 : 2;
    const years = cycle === 1 ? row.years : row.secondCycleYears;
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + years * 365.2425 * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    cursor = end;

    return {
      signIndex: row.signIndex,
      signName: row.signName,
      lordName: row.lordName,
      cycle,
      years,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
      note:
        cycle === 1
          ? row.note
          : `${row.note} Segundo ciclo operacional calculado por complemento: 12 - ${row.years} = ${row.secondCycleYears}.`,
    };
  });

  const activePeriod = periods.find((period) => period.active) ?? periods[periods.length - 1];
  const subData = buildNarayanaAntardasha(snapshot, activePeriod);

  return {
    startSignIndex,
    periods,
    activePeriod,
    subPeriods: subData.subPeriods,
    note:
      "Narayana Dasha v1 segue um working set Parasari/Jaimini operacional: inicio pela mais forte entre Lagna e 7a, " +
      "ordem pela tabela classica geral com excecoes de Saturn/Ketu na rasi inicial, duracoes por contagem rasi-ao-regente " +
      "como em Chara mais ajuste de exaltacao/debilitacao no primeiro ciclo e complemento no segundo.",
    strengthNote: describeSignStrength(snapshot, startSignIndex, modulo(startSignIndex + 6, 12)),
    orderNote: hasSaturn
      ? "Saturn na rasi inicial acionou a excecao de sequencia zodiacal regular."
      : hasKetu
        ? "Ketu na rasi inicial acionou a excecao viparita com a tabela reversa de Narayana."
        : "A ordem seguiu a tabela geral classica de Narayana para a rasi inicial escolhida.",
    subNote: subData.note,
  };
}

function getSixthWeekdayPlanetKey(key: string) {
  const index = WEEKDAY_PLANET_KEYS.indexOf(key as (typeof WEEKDAY_PLANET_KEYS)[number]);
  if (index === -1) {
    return undefined;
  }

  return WEEKDAY_PLANET_KEYS[modulo(index + 5, WEEKDAY_PLANET_KEYS.length)];
}

function buildSthiraBrahma(snapshot: VedicSnapshot) {
  const lagnaSignIndex = snapshot.ascendant.signIndex;
  const oppositeSignIndex = modulo(lagnaSignIndex + 6, 12);
  const reference = chooseStrongerSign(snapshot, lagnaSignIndex, oppositeSignIndex);
  const candidateSignIndices = [
    modulo(reference.signIndex + 5, 12),
    modulo(reference.signIndex + 7, 12),
    modulo(reference.signIndex + 11, 12),
  ];
  const candidateHouseNumbers = [6, 8, 12] as const;
  const candidateSourceMap = candidateSignIndices.reduce<
    Map<string, { houses: number[]; signIndices: number[] }>
  >((map, signIndex, index) => {
    const key = SIGN_LORD_KEYS[signIndex];
    const existing = map.get(key) ?? { houses: [], signIndices: [] };
    existing.houses.push(candidateHouseNumbers[index]);
    existing.signIndices.push(signIndex);
    map.set(key, existing);
    return map;
  }, new Map());
  const atmakaraka = snapshot.charaKarakas.find((item) => item.role === "Atmakaraka");
  const atmakarakaPoint = atmakaraka ? getPlanetPoint(snapshot, atmakaraka.key) : undefined;
  const eighthFromAtmakaraka = atmakarakaPoint ? modulo(atmakarakaPoint.signIndex + 7, 12) : undefined;
  const eighthLordKey =
    eighthFromAtmakaraka !== undefined ? SIGN_LORD_KEYS[eighthFromAtmakaraka] : undefined;
  const candidates = Array.from(candidateSourceMap.entries())
    .map(([key, source]) => {
      const point = getPlanetPoint(snapshot, key);
      if (!point) {
        return undefined;
      }

      const strong = isStrongPlanet(point) ? 1 : 0;
      const odd = NATURAL_ODD_SIGNS.has(point.signIndex) ? 1 : 0;
      const invisible = modulo(point.signIndex - reference.signIndex, 12) <= 5 ? 1 : 0;
      const pointStrength = buildSignStrength(snapshot, point.signIndex);
      const invalidReasons = [
        ...(point.key === "saturn" ? ["Saturn cai na excecao do working set de Brahma."] : []),
        ...(point.key === eighthLordKey && atmakarakaPoint
          ? [`${point.name} rege a 8a a partir de ${atmakarakaPoint.name}.`]
          : []),
        ...(point.signIndex === eighthFromAtmakaraka && atmakarakaPoint
          ? [`${point.name} ocupa a 8a a partir de ${atmakarakaPoint.name}.`]
          : []),
      ];

      return {
        point,
        sourceHouses: source.houses,
        sourceSigns: source.signIndices,
        strong: Boolean(strong),
        odd: Boolean(odd),
        invisible: Boolean(invisible),
        invalid: invalidReasons.length > 0,
        invalidReasons,
        sourceNote:
          `Lord operacional da ${source.houses.join("a e da ")}a a partir de ${SIGN_NAMES[reference.signIndex]}. ` +
          `Origem em ${source.signIndices.map((index) => SIGN_NAMES[index]).join(", ")}.`,
        rank: [
          strong + odd + invisible,
          strong,
          odd,
          invisible,
          pointStrength.rank[0],
          pointStrength.rank[1],
          point.degreeInSign,
        ] as const,
      };
    })
    .filter(
      (
        candidate
      ): candidate is SthiraBrahmaCandidate => Boolean(candidate)
    )
    .sort((left, right) => compareRankArrays(right.rank, left.rank));

  const fallbackPoint = resolveCharaLord(snapshot, reference.signIndex)?.point ?? snapshot.ascendant;
  let selectedPoint = candidates[0]?.point ?? fallbackPoint;
  let replacement:
    | {
        fromPoint: VedicPoint;
        replacementPoint: VedicPoint;
        note: string;
      }
    | undefined;
  let note =
    `Sthira v1 usa ${SIGN_NAMES[reference.signIndex]} como referencia entre Lagna e 7a; ` +
    "Brahma e escolhido pelos lords da 6a, 8a e 12a em score de forca, signo impar e metade invisivel.";

  if (candidates[0]?.invalid) {
    const replacementKey = getSixthWeekdayPlanetKey(candidates[0].point.key);
    const replacementPoint = replacementKey ? getPlanetPoint(snapshot, replacementKey) : undefined;
    if (replacementPoint) {
      selectedPoint = replacementPoint;
      replacement = {
        fromPoint: candidates[0].point,
        replacementPoint,
        note:
          `${candidates[0].point.name} caiu em excecao do working set e foi substituido por ${replacementPoint.name} ` +
          "na sequencia semanal de 6a a partir dele.",
      };
      note += ` ${replacement.note}`;
    }
  }

  return {
    referenceSignIndex: reference.signIndex,
    point: selectedPoint,
    note,
    candidates,
    replacement,
  };
}

function buildSthiraRudra(snapshot: VedicSnapshot) {
  const secondSignIndex = modulo(snapshot.ascendant.signIndex + 1, 12);
  const eighthSignIndex = modulo(snapshot.ascendant.signIndex + 7, 12);
  const candidates = [
    {
      label: "Lord da 2a",
      baseSignIndex: secondSignIndex,
      info: resolveCharaLord(snapshot, secondSignIndex),
    },
    {
      label: "Lord da 8a",
      baseSignIndex: eighthSignIndex,
      info: resolveCharaLord(snapshot, eighthSignIndex),
    },
  ]
    .filter((entry) => entry.info?.point)
    .map((entry): SthiraRudraCandidate => ({
      label: entry.label,
      baseSignIndex: entry.baseSignIndex,
      point: entry.info!.point,
      sourceNote:
        `${entry.label} em ${SIGN_NAMES[entry.baseSignIndex]}, herdando a mesma regra operacional de co-lords/excecoes usada nas rasi dashas. ` +
        entry.info!.note,
      rank: [
        dignityRank(entry.info!.point.tags),
        conjunctionCount(snapshot, entry.info!.point.key),
        signModeWeight(entry.info!.point.signIndex),
        hasJaiminiRashiDrishti(entry.info!.point.signIndex, snapshot.ascendant.signIndex) ? 1 : 0,
        entry.info!.point.degreeInSign,
      ] as const,
    }))
    .sort((left, right) => compareRankArrays(right.rank, left.rank));
  const fallbackPoint = resolveCharaLord(snapshot, snapshot.ascendant.signIndex)?.point ?? snapshot.ascendant;
  const selected = candidates[0];

  return {
    secondSignIndex,
    eighthSignIndex,
    candidates,
    point: selected?.point ?? fallbackPoint,
    note: selected
      ? `${selected.label} em ${SIGN_NAMES[selected.baseSignIndex]} venceu no working set de Rudra por dignidade, conjuncao, modalidade do signo e rashi drishti ao Lagna.`
      : "Sem lord operacional claro entre 2a e 8a; fallback no regente do Lagna.",
  };
}

function buildSthiraMaheshwara(snapshot: VedicSnapshot) {
  const atmakarakaPoint = getKarakaPoint(snapshot, "Atmakaraka");
  const baseSignIndex = atmakarakaPoint
    ? modulo(atmakarakaPoint.signIndex + 7, 12)
    : modulo(snapshot.ascendant.signIndex + 7, 12);
  const lordInfo = resolveCharaLord(snapshot, baseSignIndex);
  const point = lordInfo?.point ?? atmakarakaPoint ?? snapshot.ascendant;
  const rank = [
    dignityRank(point.tags),
    conjunctionCount(snapshot, point.key),
    signModeWeight(point.signIndex),
    hasJaiminiRashiDrishti(point.signIndex, snapshot.ascendant.signIndex) ? 1 : 0,
    point.degreeInSign,
  ] as const;

  return {
    atmakarakaPoint,
    baseSignIndex,
    point,
    rank,
    note: atmakarakaPoint
      ? `Maheshwara operacional usa o lord da 8a a partir do Atmakaraka (${atmakarakaPoint.name} em ${SIGN_NAMES[atmakarakaPoint.signIndex]}). ${lordInfo?.note ?? "Sem lord claro; fallback aplicado."}`
      : `Sem Atmakaraka claro; fallback na 8a a partir do Lagna em ${SIGN_NAMES[baseSignIndex]}. ${lordInfo?.note ?? "Sem lord claro; fallback aplicado."}`,
  };
}

function hasSthiraTriadLink(leftSignIndex: number, rightSignIndex: number) {
  return (
    leftSignIndex === rightSignIndex ||
    hasJaiminiRashiDrishti(leftSignIndex, rightSignIndex) ||
    hasJaiminiRashiDrishti(rightSignIndex, leftSignIndex)
  );
}

function buildSthiraTriadOverlay(
  snapshot: VedicSnapshot,
  brahma: ReturnType<typeof buildSthiraBrahma>,
  rudra: ReturnType<typeof buildSthiraRudra>,
  maheshwara: ReturnType<typeof buildSthiraMaheshwara>
) {
  const arudhas = calculateArudhaSet(snapshot);
  const arudhaLagna = arudhas.find((entry) => entry.houseNumber === 1);
  const upapada = arudhas.find((entry) => entry.houseNumber === 12);
  const atmakarakaPoint = getKarakaPoint(snapshot, "Atmakaraka");
  const anchors = [
    { label: "Lagna", signIndex: snapshot.ascendant.signIndex },
    ...(arudhaLagna ? [{ label: "Arudha Lagna", signIndex: arudhaLagna.signIndex }] : []),
    ...(upapada ? [{ label: "Upapada", signIndex: upapada.signIndex }] : []),
    ...(atmakarakaPoint ? [{ label: "Atmakaraka", signIndex: atmakarakaPoint.signIndex }] : []),
  ];
  const triadPoints = [
    {
      label: "Brahma" as const,
      point: brahma.point,
      base: `Referencia ${SIGN_NAMES[brahma.referenceSignIndex]}`,
    },
    {
      label: "Rudra" as const,
      point: rudra.point,
      base: `2a/8a do Lagna (${SIGN_NAMES[rudra.secondSignIndex]} / ${SIGN_NAMES[rudra.eighthSignIndex]})`,
    },
    {
      label: "Maheshwara" as const,
      point: maheshwara.point,
      base: maheshwara.atmakarakaPoint
        ? `8a do AK (${maheshwara.atmakarakaPoint.name})`
        : `8a do Lagna (${SIGN_NAMES[maheshwara.baseSignIndex]})`,
    },
  ];

  const rows: SthiraTriadMemberRow[] = triadPoints
    .map((entry) => {
      const anchorHits = anchors
        .filter((anchor) => hasSthiraTriadLink(entry.point.signIndex, anchor.signIndex))
        .map((anchor) => anchor.label);
      const pairHits = triadPoints
        .filter((candidate) => candidate.label !== entry.label)
        .filter((candidate) => hasSthiraTriadLink(entry.point.signIndex, candidate.point.signIndex))
        .map((candidate) => candidate.label);
      const score = Number(
        (
          anchorHits.length * 2 +
          pairHits.length * 1.5 +
          dignityRank(entry.point.tags) +
          signModeWeight(entry.point.signIndex) * 0.35
        ).toFixed(2)
      );

      return {
        label: entry.label,
        point: entry.point,
        base: entry.base,
        anchorHits,
        pairHits,
        score,
        note:
          `${entry.label} em ${SIGN_NAMES[entry.point.signIndex]} toca ${anchorHits.join(", ") || "nenhum ancora"} ` +
          `e fecha enlace com ${pairHits.join(", ") || "nenhum membro da triade"} por signo ou rashi drishti.`,
      };
    })
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));

  const pairCount =
    (hasSthiraTriadLink(brahma.point.signIndex, rudra.point.signIndex) ? 1 : 0) +
    (hasSthiraTriadLink(brahma.point.signIndex, maheshwara.point.signIndex) ? 1 : 0) +
    (hasSthiraTriadLink(rudra.point.signIndex, maheshwara.point.signIndex) ? 1 : 0);
  const anchorCoverage = rows.reduce((sum, row) => sum + row.anchorHits.length, 0);
  const state =
    pairCount >= 2 && rows.every((row) => row.anchorHits.length > 0)
      ? "Fechada"
      : pairCount >= 1 || anchorCoverage >= 4
        ? "Parcial"
        : "Fraca";
  const status =
    state === "Fechada"
      ? ("implemented" as const)
      : state === "Parcial"
        ? ("mixed" as const)
        : ("placeholder" as const);

  return {
    rows,
    leader: rows[0],
    pairCount,
    anchorCoverage,
    state,
    status,
    note:
      `Triade com ${pairCount} enlace(s) internos e ${anchorCoverage} toque(s) nos ancoras Lagna/AL/UL/AK. ` +
      `${rows[0]?.label ?? "Sem lider"} lidera a coesao atual desta rodada.`,
  };
}

function buildSthiraYears(signIndex: number) {
  if (isMovable(signIndex)) {
    return 7;
  }

  if (isFixed(signIndex)) {
    return 8;
  }

  return 9;
}

function buildSthiraDasha(snapshot: VedicSnapshot) {
  const brahma = buildSthiraBrahma(snapshot);
  const rudra = buildSthiraRudra(snapshot);
  const maheshwara = buildSthiraMaheshwara(snapshot);
  const triadOverlay = buildSthiraTriadOverlay(snapshot, brahma, rudra, maheshwara);
  const startSignIndex = brahma.point.signIndex;
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  let cursor = new Date(birthMoment);
  const periods = Array.from({ length: 24 }, (_, index) => {
    const signIndex = modulo(startSignIndex + index, 12);
    const years = buildSthiraYears(signIndex);
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + years * 365.2425 * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    cursor = end;

    return {
      signIndex,
      signName: SIGN_NAMES[signIndex],
      cycle: index < 12 ? 1 : 2,
      years,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
      note: `${SIGN_NAMES[signIndex]} recebe ${years} anos pelo modo ${isMovable(signIndex) ? "chara" : isFixed(signIndex) ? "sthira" : "dual"}.`,
    };
  });

  const activePeriod = periods.find((period) => period.active) ?? periods[periods.length - 1];
  const daysPerSubPeriod = (activePeriod.years * 365.2425) / 12;
  let subCursor = new Date(`${activePeriod.start}T00:00:00Z`);
  const subPeriods = Array.from({ length: 12 }, (_, index) => {
    const signIndex = modulo(activePeriod.signIndex + index, 12);
    const start = new Date(subCursor);
    const end = new Date(subCursor.getTime() + daysPerSubPeriod * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    subCursor = end;

    return {
      maha: activePeriod.signName,
      signName: SIGN_NAMES[signIndex],
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      months: activePeriod.years,
      active,
    };
  });

  return {
    brahma,
    rudra,
    maheshwara,
    periods,
    activePeriod,
    subPeriods,
    note:
      `Sthira Dasha v1 parte do signo de Brahma (${brahma.point.name} em ${SIGN_NAMES[startSignIndex]}) ` +
      "e segue ordem zodiacal regular com 7/8/9 anos para signos chara/sthira/dual.",
    subNote:
      `Antardasha regular com ${activePeriod.years} meses por signo dentro da maha ativa, ` +
      "mantendo a mesma ordem zodiacal do sistema.",
    markerNote:
      `Rudra operacional em ${rudra.point.name} e Maheshwara operacional em ${maheshwara.point.name} entram como marcadores auxiliares da triade Brahma-Rudra-Maheshwara desta versao.`,
    triadOverlay,
  };
}

function buildSimpleNakshatraDasha<T extends readonly { lord: string; years: number }[]>(
  snapshot: VedicSnapshot,
  sequence: T,
  startIndex: number
) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const nakshatraSize = 360 / 27;
  const withinNakshatra = ((moon.longitude % nakshatraSize) + nakshatraSize) % nakshatraSize;
  const completedFraction = withinNakshatra / nakshatraSize;
  const first = sequence[startIndex];
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const elapsedDays = first.years * completedFraction * 365.2425;
  let cursor = new Date(birthMoment.getTime() - elapsedDays * 24 * 60 * 60 * 1000);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);

  const periods = Array.from({ length: 16 }, (_, index) => {
    const current = sequence[(startIndex + index) % sequence.length];
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + current.years * 365.2425 * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    cursor = end;

    return {
      lord: current.lord,
      years: current.years,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
    };
  });

  const activePeriod = periods.find((period) => period.active) ?? periods[0];
  const activeSequence = sequence.find((entry) => entry.lord === activePeriod.lord) ?? sequence[0];
  let subCursor = new Date(`${activePeriod.start}T00:00:00Z`);
  const totalYears = sequence.reduce((sum, entry) => sum + entry.years, 0);
  const subPeriods = sequence.map((entry) => {
    const days = (activeSequence.years * entry.years * 365.2425) / totalYears;
    const start = new Date(subCursor);
    const end = new Date(subCursor.getTime() + days * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    subCursor = end;

    return {
      maha: activePeriod.lord,
      lord: entry.lord,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      days,
      active,
    };
  });

  return {
    periods,
    activePeriod,
    subPeriods,
  };
}

function buildLagnaHora(snapshot: VedicSnapshot) {
  const oddSign = snapshot.ascendant.signIndex % 2 === 0;
  const firstHalf = snapshot.ascendant.degreeInSign < 15;

  if (oddSign) {
    return firstHalf ? "Sun" : "Moon";
  }

  return firstHalf ? "Moon" : "Sun";
}

function isBirthDuringDay(snapshot: VedicSnapshot) {
  const [year, month, day] = snapshot.referenceDate.split("-").map(Number);
  const timings = buildSolarDayTimings(
    year,
    month,
    day,
    snapshot.latitude,
    snapshot.longitude,
    snapshot.timezone
  );

  if (!Number.isFinite(timings.sunrise ?? Number.NaN) || !Number.isFinite(timings.sunset ?? Number.NaN)) {
    return snapshot.localBirthHour >= 6 && snapshot.localBirthHour < 18;
  }

  return snapshot.localBirthHour >= (timings.sunrise ?? 6) && snapshot.localBirthHour < (timings.sunset ?? 18);
}

function classifyKalachakraDayPortion(snapshot: VedicSnapshot) {
  const [year, month, day] = snapshot.referenceDate.split("-").map(Number);
  const timings = buildSolarDayTimings(
    year,
    month,
    day,
    snapshot.latitude,
    snapshot.longitude,
    snapshot.timezone
  );
  const sunrise = Number.isFinite(timings.sunrise ?? Number.NaN) ? (timings.sunrise ?? 6) : 6;
  const sunset = Number.isFinite(timings.sunset ?? Number.NaN) ? (timings.sunset ?? 18) : 18;
  const dayLength = normalize24(sunset - sunrise) || 12;
  const nightLength = 24 - dayLength;
  const dawnStart = normalize24(sunrise - nightLength / 6);
  const dawnDuration = nightLength / 6 + dayLength / 6;
  const dayStart = normalize24(sunrise + dayLength / 6);
  const dayDuration = (dayLength * 4) / 6;
  const duskStart = normalize24(sunset - dayLength / 6);
  const duskDuration = dayLength / 6 + nightLength / 6;
  const nightStart = normalize24(sunset + nightLength / 6);
  const nightDuration = (nightLength * 4) / 6;
  const birthHour = normalize24(snapshot.localBirthHour);

  const windows = [
    {
      key: "dawn" as const,
      label: "Dawn / Sandhya da manha",
      start: dawnStart,
      duration: dawnDuration,
      note:
        `Janela centrada no nascer do Sol, de ${decimalHoursToLabel(dawnStart)} ate ${decimalHoursToLabel(
          dawnStart + dawnDuration
        )}.`,
    },
    {
      key: "day" as const,
      label: "Daytime",
      start: dayStart,
      duration: dayDuration,
      note:
        `Faixa diurna principal, de ${decimalHoursToLabel(dayStart)} ate ${decimalHoursToLabel(
          dayStart + dayDuration
        )}.`,
    },
    {
      key: "dusk" as const,
      label: "Dusk / Sandhya da tarde",
      start: duskStart,
      duration: duskDuration,
      note:
        `Janela centrada no por do Sol, de ${decimalHoursToLabel(duskStart)} ate ${decimalHoursToLabel(
          duskStart + duskDuration
        )}.`,
    },
    {
      key: "night" as const,
      label: "Nighttime",
      start: nightStart,
      duration: nightDuration,
      note:
        `Faixa noturna principal, de ${decimalHoursToLabel(nightStart)} ate ${decimalHoursToLabel(
          nightStart + nightDuration
        )}.`,
    },
  ];
  const selected = windows.find((window) => windowContains(window.start, window.duration, birthHour)) ?? windows[1];
  const elapsed = windowElapsed(selected.start, birthHour);
  const elapsedFraction = selected.duration > 0 ? Math.min(1, elapsed / selected.duration) : 0;

  return {
    ...selected,
    windows,
    birthHour,
    sunrise,
    sunset,
    elapsed,
    elapsedFraction,
    remainingFraction: 1 - elapsedFraction,
  };
}

function buildKalachakraDasha(
  snapshot: VedicSnapshot,
  cycleMode: JyotishConfig["kalachakraCycleMode"] = "progressive-group"
) {
  const portion = classifyKalachakraDayPortion(snapshot);
  const classical = buildKalachakraClassicalProfile(snapshot, cycleMode);
  const firstCycleYears = 120 * portion.elapsedFraction;
  const secondCycleYears = 120 - firstCycleYears;
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  let cursor = new Date(birthMoment);
  const kaalaPeriods = [firstCycleYears, secondCycleYears].flatMap((cycleYears, cycleIndex) => {
    const unit = cycleYears / 45;
    return KALACHAKRA_KAALA_SEQUENCE.map((entry) => {
      const years = unit * entry.weight;
      const start = new Date(cursor);
      const end = new Date(cursor.getTime() + years * 365.2425 * 24 * 60 * 60 * 1000);
      const active = analysisMoment >= start && analysisMoment < end;
      cursor = end;
      return {
        lord: entry.lord,
        cycle: cycleIndex + 1,
        years,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        active,
      };
    });
  });
  const activeKaalaPeriod =
    kaalaPeriods.find((period) => period.active) ?? kaalaPeriods[kaalaPeriods.length - 1];

  const lagnaLord = resolveCharaLord(snapshot, snapshot.ascendant.signIndex)?.point;
  const chakraStartSignIndex =
    portion.key === "day"
      ? lagnaLord?.signIndex ?? snapshot.ascendant.signIndex
      : portion.key === "night"
        ? snapshot.ascendant.signIndex
        : modulo(snapshot.ascendant.signIndex + 1, 12);
  let chakraCursor = new Date(birthMoment);
  const chakraPeriods = Array.from({ length: 12 }, (_, index) => {
    const signIndex = modulo(chakraStartSignIndex + index, 12);
    const start = new Date(chakraCursor);
    const end = new Date(chakraCursor.getTime() + 10 * 365.2425 * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    chakraCursor = end;
    return {
      signIndex,
      signName: SIGN_NAMES[signIndex],
      years: 10,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
    };
  });
  const activeChakraPeriod =
    chakraPeriods.find((period) => period.active) ?? chakraPeriods[chakraPeriods.length - 1];

  return {
    classical,
    portion,
    firstCycleYears,
    secondCycleYears,
    kaalaPeriods,
    activeKaalaPeriod,
    chakraStartSignIndex,
    chakraPeriods,
    activeChakraPeriod,
    note:
      "Kalachakra agora combina uma camada classica auditavel do chakra natal com o overlay operacional Kaala Dasa + Chakra Dasa, " +
      "usando divisao do dia em dawn/day/dusk/night, 2 ciclos planetarios proporcionais e 12 rashis de 10 anos para o chakra operacional.",
    portionNote:
      `${portion.note} Nascer do Sol operacional em ${decimalHoursToLabel(portion.sunrise)} e por do Sol em ${decimalHoursToLabel(
        portion.sunset
      )}. Fracao transcorrida da faixa: ${(portion.elapsedFraction * 100).toFixed(2)}%.`,
    chakraNote:
      portion.key === "day"
        ? `Como o nascimento caiu na faixa diurna principal, o Chakra Dasa parte do signo do Lagna lord em ${SIGN_NAMES[chakraStartSignIndex]}.`
        : portion.key === "night"
          ? `Como o nascimento caiu na faixa noturna principal, o Chakra Dasa parte do proprio Lagna em ${SIGN_NAMES[chakraStartSignIndex]}.`
          : `Como o nascimento caiu em sandhya, o Chakra Dasa parte do 2o signo a partir do Lagna, em ${SIGN_NAMES[chakraStartSignIndex]}.`,
    classicalNote:
      `${classical.note} Amsa ${SIGN_NAMES[classical.padaProfile.amsa]}, Deha ${SIGN_NAMES[classical.padaProfile.deha]} e Jeeva ${SIGN_NAMES[classical.padaProfile.jeeva]}. ` +
      `${classical.balanceNote} Proximo salto escolar previsto para ${classical.pattern.members[classical.nextEnvelope.memberIndex]} / ${classical.nextEnvelope.padaIndex + 1}o pada.`,
  };
}

function findAshtottariSegment(longitude: number) {
  const normalized = normalize360(longitude);
  return (
    ASHTOTTARI_STAR_SEGMENTS.find((segment) => normalized >= segment.start && normalized < segment.end) ??
    ASHTOTTARI_STAR_SEGMENTS[ASHTOTTARI_STAR_SEGMENTS.length - 1]
  );
}

function buildAshtottariDasha(snapshot: VedicSnapshot) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const rahu = snapshot.planets.find((point) => point.key === "northNode");
  const lagnaLord = snapshot.planets.find((point) => point.name === snapshot.ascendant.signLord);
  const segment = findAshtottariSegment(moon.longitude);
  const sequenceIndex = ASHTOTTARI_SEQUENCE.findIndex((entry) =>
    (entry.stars as readonly string[]).includes(segment.name)
  );
  const sequenceEntry = ASHTOTTARI_SEQUENCE[Math.max(0, sequenceIndex)];
  const starIndexWithinLord = Math.max(0, (sequenceEntry.stars as readonly string[]).indexOf(segment.name));
  const starSpan = segment.end - segment.start;
  const withinStar = normalize360(moon.longitude) - segment.start;
  const fractionInStar = starSpan > 0 ? withinStar / starSpan : 0;
  const yearsPerStar = sequenceEntry.years / sequenceEntry.groupSize;
  const elapsedInLordYears = starIndexWithinLord * yearsPerStar + fractionInStar * yearsPerStar;
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const lordStart = new Date(
    birthMoment.getTime() - elapsedInLordYears * 365.2425 * 24 * 60 * 60 * 1000
  );
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  const lagnaLordDistance = rahu && lagnaLord ? ((rahu.house - lagnaLord.house + 12) % 12) + 1 : undefined;
  const classicalGate =
    snapshot.panchanga.paksha === "Krishna" &&
    lagnaLordDistance !== undefined &&
    [4, 5, 7, 9, 10].includes(lagnaLordDistance);

  let cursor = new Date(lordStart);
  const periods = Array.from({ length: 16 }, (_, index) => {
    const current = ASHTOTTARI_SEQUENCE[(sequenceIndex + index) % ASHTOTTARI_SEQUENCE.length];
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + current.years * 365.2425 * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    cursor = end;

    return {
      lord: current.lord,
      years: current.years,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
    };
  });

  const activePeriod = periods.find((period) => period.active) ?? periods[0];
  const activeSequence = ASHTOTTARI_SEQUENCE.find((entry) => entry.lord === activePeriod.lord) ?? ASHTOTTARI_SEQUENCE[0];
  let subCursor = new Date(`${activePeriod.start}T00:00:00Z`);
  const subPeriods = ASHTOTTARI_SEQUENCE.map((entry) => {
    const days = (activeSequence.years * entry.years * 365.2425) / 108;
    const start = new Date(subCursor);
    const end = new Date(subCursor.getTime() + days * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    subCursor = end;

    return {
      maha: activePeriod.lord,
      lord: entry.lord,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      days,
      active,
    };
  });

  return {
    periods,
    activePeriod,
    subPeriods,
    birthStar: segment.name,
    note:
      "Ashtottari Dasha calculada com a sequencia de 8 grahas de BPHS, usando o working set de 28 nakshatras com Abhijit entre Uttara Ashadha e Shravana.",
    gateNote:
      classicalGate
        ? "O gate tecnico usado nesta versao bate com Krishna Paksha e Rahu em kendra/trikona do Lagna lord."
        : "O motor calculou a serie mesmo sem o gate tecnico classico completo desta escola se confirmar automaticamente.",
    classicalGate,
  };
}

function buildShodashottariDasha(snapshot: VedicSnapshot) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const countFromPushya = ((moon.nakshatraIndex - 7 + 27) % 27) + 1;
  const startIndex = (countFromPushya - 1) % SHODASHOTTARI_SEQUENCE.length;
  const paksha = snapshot.panchanga.paksha;
  const birthDuringDay = isBirthDuringDay(snapshot);
  const lagnaHora = buildLagnaHora(snapshot);
  const recommendedDayNight =
    (paksha === "Krishna" && birthDuringDay) || (paksha === "Shukla" && !birthDuringDay);
  const horaGate =
    (paksha === "Krishna" && lagnaHora === "Moon") || (paksha === "Shukla" && lagnaHora === "Sun");
  const base = buildSimpleNakshatraDasha(snapshot, SHODASHOTTARI_SEQUENCE, startIndex);

  return {
    ...base,
    note:
      "Shodashottari Dasha calculada pelo working set de BPHS: contagem de Pushya ao Janma Nakshatra, resto por 8 e sequencia Sun, Mars, Jupiter, Saturn, Ketu, Moon, Mercury, Venus.",
    gateNote:
      recommendedDayNight && horaGate
        ? "O gate tecnico desta versao bate com paksha, periodo do dia e Hora do Lagna."
        : horaGate
          ? "A Hora do Lagna bate com a regra classica, mas o contexto dia/noite segue apenas parcial."
          : "O motor calculou a serie sem o gate tecnico classico completo desta escola se fechar automaticamente.",
    classicalGate: recommendedDayNight && horaGate,
  };
}

function buildDwadashottariDasha(snapshot: VedicSnapshot) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const countToRevati = ((26 - moon.nakshatraIndex + 27) % 27) + 1;
  const startIndex = (countToRevati - 1) % DWADASHOTTARI_SEQUENCE.length;
  const navamsaAscendant = snapshot.vargas
    .find((chart) => chart.key === "D9")
    ?.points.find((point) => point.key === "ascendant");
  const classicalGate = [1, 6].includes(navamsaAscendant?.signIndex ?? -1);
  const base = buildSimpleNakshatraDasha(snapshot, DWADASHOTTARI_SEQUENCE, startIndex);

  return {
    ...base,
    note:
      "Dwadashottari Dasha calculada pelo working set de BPHS: contagem do Janma Nakshatra ate Revati, resto por 8 e sequencia Sun, Jupiter, Ketu, Mercury, Rahu, Mars, Saturn, Moon.",
    gateNote: classicalGate
      ? "O gate tecnico desta versao bate com o Lagna em Navamsa de Venus."
      : "O motor calculou a serie mesmo sem o gate tecnico classico do Navamsa de Venus se fechar automaticamente.",
    classicalGate,
  };
}

function buildYoginiDasha(snapshot: VedicSnapshot) {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const nakshatraSize = 360 / 27;
  const withinNakshatra = ((moon.longitude % nakshatraSize) + nakshatraSize) % nakshatraSize;
  const remainingFraction = (nakshatraSize - withinNakshatra) / nakshatraSize;
  const startingRemainder = ((moon.nakshatraIndex + 1 + 3) % 8 + 8) % 8;
  const startIndex = startingRemainder === 0 ? 7 : startingRemainder - 1;
  const first = YOGINI_SEQUENCE[startIndex];
  const birthMoment = new Date(`${snapshot.referenceDate}T00:00:00Z`);
  const firstBalanceDays = first.years * remainingFraction * 365.2425;
  const firstElapsedDays = first.years * 365.2425 - firstBalanceDays;
  let cursor = new Date(birthMoment.getTime() - firstElapsedDays * 24 * 60 * 60 * 1000);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);

  const periods = Array.from({ length: 16 }, (_, index) => {
    const current = YOGINI_SEQUENCE[(startIndex + index) % YOGINI_SEQUENCE.length];
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + current.years * 365.2425 * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    cursor = end;
    return {
      ...current,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      active,
    };
  });

  const activePeriod = periods.find((period) => period.active) ?? periods[0];
  let subCursor = new Date(`${activePeriod.start}T00:00:00Z`);
  const subPeriods = YOGINI_SEQUENCE.map((item) => {
    const days = (activePeriod.years * item.years * 365.2425) / 36;
    const start = new Date(subCursor);
    const end = new Date(subCursor.getTime() + days * 24 * 60 * 60 * 1000);
    const active = analysisMoment >= start && analysisMoment < end;
    subCursor = end;
    return {
      maha: activePeriod.yogini,
      yogini: item.yogini,
      lord: item.lord,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      days,
      active,
    };
  });

  return {
    periods,
    activePeriod,
    subPeriods,
    note:
      "Yogini Dasha v1 calculada pela regra classica de somar 3 ao Janma Nakshatra, dividir por 8 e usar o saldo do nakshatra lunar para o balanço inicial.",
  };
}

function readinessBase(status: "implemented" | "mixed" | "placeholder") {
  if (status === "implemented") {
    return 6;
  }

  if (status === "mixed") {
    return 4;
  }

  return 1;
}

export function dashaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot,
  config?: Pick<JyotishConfig, "secondaryDasha" | "kalachakraCycleMode">
): EngineResult {
  const ashtottari = buildAshtottariDasha(snapshot);
  const dwadashottari = buildDwadashottariDasha(snapshot);
  const shodashottari = buildShodashottariDasha(snapshot);
  const yogini = buildYoginiDasha(snapshot);
  const chara = buildCharaDasha(snapshot);
  const narayana = buildNarayanaDasha(snapshot);
  const sthira = buildSthiraDasha(snapshot);
  const kalachakra = buildKalachakraDasha(snapshot, config?.kalachakraCycleMode ?? "progressive-group");
  const selectedSecondary = config?.secondaryDasha ?? "yogini";
  const secondaryLabels: Record<JyotishConfig["secondaryDasha"], string> = {
    yogini: "Yogini",
    ashtottari: "Ashtottari",
    shodashottari: "Shodashottari",
    dwadashottari: "Dwadashottari",
    kalachakra: "Kalachakra",
    chara: "Chara",
    narayana: "Narayana",
    sthira: "Sthira",
  };
  const comparisonItems = [
    createDatum(module, "Dasha", "Yogini Dasha ativa", `${yogini.activePeriod.yogini} | ${yogini.activePeriod.lord}`, {
      technicalNotes: yogini.note,
      confidence: 0.72,
      status: "implemented",
    }),
    createDatum(module, "Dasha", "Ashtottari Dasha ativa", ashtottari.activePeriod.lord, {
      technicalNotes: `${ashtottari.note} ${ashtottari.gateNote}`,
      confidence: ashtottari.classicalGate ? 0.76 : 0.58,
      status: "implemented",
    }),
    createDatum(module, "Dasha", "Shodashottari ativa", shodashottari.activePeriod.lord, {
      technicalNotes: `${shodashottari.note} ${shodashottari.gateNote}`,
      confidence: shodashottari.classicalGate ? 0.74 : 0.56,
      status: "implemented",
    }),
    createDatum(module, "Dasha", "Dwadashottari ativa", dwadashottari.activePeriod.lord, {
      technicalNotes: `${dwadashottari.note} ${dwadashottari.gateNote}`,
      confidence: dwadashottari.classicalGate ? 0.74 : 0.56,
      status: "implemented",
    }),
    createDatum(module, "Dasha", "Chara Dasha ativa", chara.activePeriod.signName, {
      technicalNotes: `${chara.note} Semente ${chara.seed.label} em ${SIGN_NAMES[chara.seed.signIndex]}; ordem ${chara.direct ? "direta" : "reversa"}.`,
      confidence: 0.68,
      status: "implemented",
      methodUsed: "working-set-jaimini-chara-rao-jhora",
    }),
    createDatum(module, "Dasha", "Narayana Dasha ativa", narayana.activePeriod.signName, {
      technicalNotes: `${narayana.note} ${narayana.strengthNote} ${narayana.orderNote} ${narayana.subNote}`,
      confidence: 0.71,
      status: "implemented",
      methodUsed: "working-set-narayana-parasari-jaimini-v1",
    }),
    createDatum(module, "Dasha", "Sthira Dasha ativa", sthira.activePeriod.signName, {
      technicalNotes: `${sthira.note} ${sthira.brahma.note} ${sthira.rudra.note} ${sthira.maheshwara.note} ${sthira.subNote} ${sthira.triadOverlay.note}`,
      confidence: 0.66,
      status: "implemented",
      methodUsed: "working-set-sthira-brahma-rudra-maheshwara-v2",
    }),
    createDatum(
      module,
      "Dasha",
      "Kalachakra Dasha ativa",
      `${kalachakra.classical.activeBirthPeriod?.signName ?? "--"} | ${kalachakra.activeKaalaPeriod.lord} | ${kalachakra.activeChakraPeriod.signName}`,
      {
        technicalNotes:
          `${kalachakra.classicalNote} ${kalachakra.classical.cycleMethodNote} ` +
          `${kalachakra.portionNote} ${kalachakra.chakraNote}`,
        confidence: kalachakra.classical.activeBirthPeriod ? 0.74 : 0.64,
        status: "implemented",
        methodUsed: "classical-kalachakra-pada-cycle-plus-operational-overlay-v2",
      }
    ),
  ];
  const kalachakraStartLord = resolveCharaLord(snapshot, kalachakra.chakraStartSignIndex)?.point;
  const kalachakraActiveChakraLord = resolveCharaLord(snapshot, kalachakra.activeChakraPeriod.signIndex)?.point;
  const kalachakraClassicalRows = [
    {
      criterion: "Modo escolar do ciclo",
      state: kalachakra.classical.cycleModeLabel,
      score: 2,
      note: kalachakra.classical.cycleMethodNote,
    },
    {
      criterion: "Movimento do chakra",
      state: `${formatKalachakraMotion(kalachakra.classical.pattern.motion)} | ${kalachakra.classical.pattern.patternLabel}`,
      score: 2,
      note: kalachakra.classical.note,
    },
    {
      criterion: "Amsa / Deha / Jeeva",
      state:
        `${SIGN_NAMES[kalachakra.classical.padaProfile.amsa]} | ${SIGN_NAMES[kalachakra.classical.padaProfile.deha]} | ` +
        `${SIGN_NAMES[kalachakra.classical.padaProfile.jeeva]}`,
      score: 2,
      note: kalachakra.classical.balanceNote,
    },
    {
      criterion: "Navamsa da Lua",
      state: kalachakra.classical.moonD9
        ? `${kalachakra.classical.moonD9.signName} | ${kalachakra.classical.amsaMatchesNavamsa ? "coerente" : "divergente"}`
        : "D9 da Lua indisponivel",
      score: kalachakra.classical.moonD9 ? (kalachakra.classical.amsaMatchesNavamsa ? 2 : 1) : 0,
      note: kalachakra.classical.moonD9
        ? `Amsa tabelada em ${SIGN_NAMES[kalachakra.classical.padaProfile.amsa]} contra Lua D9 em ${kalachakra.classical.moonD9.signName}.`
        : "Sem Lua do Navamsa para checar a identidade amsa-pada.",
    },
    {
      criterion: "Ciclo natal do pada",
      state: kalachakra.classical.activeBirthPeriod
        ? `${kalachakra.classical.activeBirthPeriod.signName} ate ${kalachakra.classical.activeBirthPeriod.end}`
        : "Analise fora do primeiro ciclo natal",
      score: kalachakra.classical.activeBirthPeriod ? 2 : 1,
      note: kalachakra.classical.activeBirthPeriod
        ? kalachakra.classical.activeBirthPeriod.note
        : kalachakra.classical.cycleMethodNote,
    },
  ];
  const kalachakraClassicalScore = kalachakraClassicalRows.reduce((sum, row) => sum + row.score, 0);
  const kalachakraClassicalState =
    kalachakraClassicalScore >= 7
      ? "Kalachakra classico fechado"
      : kalachakraClassicalScore >= 5
        ? "Kalachakra classico util"
        : "Kalachakra classico basico";
  const kalachakraOperationalRows = [
    {
      criterion: "Janela natal",
      state: kalachakra.portion.label,
      score: kalachakra.portion.key === "day" || kalachakra.portion.key === "night" ? 2 : 1,
      note: kalachakra.portionNote,
    },
    {
      criterion: "Split dos ciclos",
      state: `${kalachakra.firstCycleYears.toFixed(2)} + ${kalachakra.secondCycleYears.toFixed(2)} anos`,
      score: kalachakra.firstCycleYears > 0 && kalachakra.secondCycleYears > 0 ? 2 : 0,
      note: "O primeiro ciclo usa a fracao ja transcorrida da faixa operacional; o segundo fecha o complemento ate 120 anos.",
    },
    {
      criterion: "Chakra inicial",
      state: `${SIGN_NAMES[kalachakra.chakraStartSignIndex]} | ${kalachakraStartLord?.name ?? "--"}`,
      score: kalachakra.portion.key === "dawn" || kalachakra.portion.key === "dusk" ? 1 : 2,
      note: kalachakra.chakraNote,
    },
    {
      criterion: "Kaala x Chakra ativo",
      state:
        kalachakraActiveChakraLord?.name === kalachakra.activeKaalaPeriod.lord
          ? "Mesmo regente"
          : kalachakraActiveChakraLord
            ? `${kalachakra.activeKaalaPeriod.lord} x ${kalachakraActiveChakraLord.name}`
            : "Sem regente resolvido",
      score:
        kalachakraActiveChakraLord?.name === kalachakra.activeKaalaPeriod.lord
          ? 2
          : kalachakraActiveChakraLord
            ? 1
            : 0,
      note: kalachakraActiveChakraLord
        ? `Kaala ativa em ${kalachakra.activeKaalaPeriod.lord} (ciclo ${kalachakra.activeKaalaPeriod.cycle}) enquanto o Chakra ativo cai em ${kalachakra.activeChakraPeriod.signName}, regido por ${kalachakraActiveChakraLord.name}.`
        : "Sem regente operacional resolvido para o signo ativo do Chakra.",
    },
  ];
  const kalachakraOperationalScore = kalachakraOperationalRows.reduce((sum, row) => sum + row.score, 0);
  const kalachakraOperationalState =
    kalachakraOperationalScore >= 7
      ? "Kalachakra operacional forte"
      : kalachakraOperationalScore >= 5
        ? "Kalachakra operacional util"
        : "Kalachakra operacional basico";
  const comparisonTables = [
    createTable(
      `${module}-yogini-maha`,
      "Yogini Dasha",
      ["Yogini", "Lord", "Inicio", "Fim", "Anos", "Ativa"],
      yogini.periods.map((period) => [
        period.yogini,
        period.lord,
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
      ]),
      "Sequencia de 36 anos: Mangala, Pingala, Dhanya, Bhramari, Bhadrika, Ulka, Siddha e Sankata."
    ),
    createTable(
      `${module}-yogini-sub`,
      "Subperiodos da Yogini ativa",
      ["Maha", "Sub", "Lord", "Inicio", "Fim", "Dias", "Ativa"],
      yogini.subPeriods.map((period) => [
        period.maha,
        period.yogini,
        period.lord,
        period.start,
        period.end,
        period.days.toFixed(1),
        period.active ? "Sim" : "Nao",
      ]),
      "Subperiodos proporcionais dentro da Yogini ativa."
    ),
    createTable(
      `${module}-ashtottari-maha`,
      "Ashtottari Dasha",
      ["Lord", "Inicio", "Fim", "Anos", "Ativa"],
      ashtottari.periods.map((period) => [
        period.lord,
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
      ]),
      `Janma Nakshatra operacional: ${ashtottari.birthStar}. ${ashtottari.gateNote}`
    ),
    createTable(
      `${module}-ashtottari-sub`,
      "Subperiodos da Ashtottari ativa",
      ["Maha", "Sub", "Inicio", "Fim", "Dias", "Ativa"],
      ashtottari.subPeriods.map((period) => [
        period.maha,
        period.lord,
        period.start,
        period.end,
        period.days.toFixed(1),
        period.active ? "Sim" : "Nao",
      ]),
      "Subperiodos proporcionais dentro da Mahadasha ativa de Ashtottari."
    ),
    createTable(
      `${module}-shodashottari-maha`,
      "Shodashottari Dasha",
      ["Lord", "Inicio", "Fim", "Anos", "Ativa"],
      shodashottari.periods.map((period) => [
        period.lord,
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
      ]),
      shodashottari.gateNote
    ),
    createTable(
      `${module}-shodashottari-sub`,
      "Subperiodos da Shodashottari ativa",
      ["Maha", "Sub", "Inicio", "Fim", "Dias", "Ativa"],
      shodashottari.subPeriods.map((period) => [
        period.maha,
        period.lord,
        period.start,
        period.end,
        period.days.toFixed(1),
        period.active ? "Sim" : "Nao",
      ]),
      "Subperiodos proporcionais dentro da Mahadasha ativa de Shodashottari."
    ),
    createTable(
      `${module}-dwadashottari-maha`,
      "Dwadashottari Dasha",
      ["Lord", "Inicio", "Fim", "Anos", "Ativa"],
      dwadashottari.periods.map((period) => [
        period.lord,
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
      ]),
      dwadashottari.gateNote
    ),
    createTable(
      `${module}-dwadashottari-sub`,
      "Subperiodos da Dwadashottari ativa",
      ["Maha", "Sub", "Inicio", "Fim", "Dias", "Ativa"],
      dwadashottari.subPeriods.map((period) => [
        period.maha,
        period.lord,
        period.start,
        period.end,
        period.days.toFixed(1),
        period.active ? "Sim" : "Nao",
      ]),
      "Subperiodos proporcionais dentro da Mahadasha ativa de Dwadashottari."
    ),
    createTable(
      `${module}-chara-maha`,
      "Chara Dasha",
      ["Signo", "Regente", "Inicio", "Fim", "Anos", "Ativa", "Nota"],
      chara.periods.map((period) => [
        period.signName,
        period.lordName,
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
        period.note,
      ]),
      `Working set usado: semente ${chara.seed.label} em ${SIGN_NAMES[chara.seed.signIndex]} e ordem ${chara.direct ? "zodiacal" : "anti-zodiacal"}.`
    ),
    createTable(
      `${module}-chara-sub`,
      "Subperiodos da Chara ativa",
      ["Maha", "Sub", "Regente", "Inicio", "Fim", "Anos-base", "Ativa"],
      chara.subPeriods.map((period) => [
        period.maha,
        period.signName,
        period.lordName,
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
      ]),
      "Antardasha operacional pela mesma ordem de signos da escola escolhida, com pesos proporcionais aos anos-base de cada signo."
    ),
    createTable(
      `${module}-narayana-maha`,
      "Narayana Dasha",
      ["Signo", "Regente", "Ciclo", "Inicio", "Fim", "Anos", "Ativa", "Nota"],
      narayana.periods.map((period) => [
        period.signName,
        period.lordName,
        period.cycle.toString(),
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
        period.note,
      ]),
      `${narayana.strengthNote} ${narayana.orderNote}`
    ),
    createTable(
      `${module}-narayana-sub`,
      "Antardashas da Narayana ativa",
      ["Maha", "Sub", "Inicio", "Fim", "Meses", "Ativa"],
      narayana.subPeriods.map((period) => [
        period.maha,
        period.signName,
        period.start,
        period.end,
        period.months.toFixed(1),
        period.active ? "Sim" : "Nao",
      ]),
      narayana.subNote
    ),
    createTable(
      `${module}-sthira-maha`,
      "Sthira Dasha",
      ["Signo", "Ciclo", "Inicio", "Fim", "Anos", "Ativa", "Nota"],
      sthira.periods.map((period) => [
        period.signName,
        period.cycle.toString(),
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
        period.note,
      ]),
      `${sthira.note} ${sthira.brahma.note} ${sthira.markerNote}`
    ),
    createTable(
      `${module}-sthira-sub`,
      "Antardashas da Sthira ativa",
      ["Maha", "Sub", "Inicio", "Fim", "Meses", "Ativa"],
      sthira.subPeriods.map((period) => [
        period.maha,
        period.signName,
        period.start,
        period.end,
        period.months.toFixed(1),
        period.active ? "Sim" : "Nao",
      ]),
      sthira.subNote
    ),
    createTable(
      `${module}-sthira-brahma`,
      "Brahma e Candidatos da Sthira",
      ["Fonte", "Graha", "Signo", "Forte", "Impar", "Metade invisivel", "Score", "Excecao", "Selecionado", "Nota"],
      [
        ...sthira.brahma.candidates.map((candidate) => [
          `${candidate.sourceHouses.map((house) => `${house}a`).join(", ")} da referencia`,
          candidate.point.name,
          SIGN_NAMES[candidate.point.signIndex],
          boolLabel(candidate.strong),
          boolLabel(candidate.odd),
          boolLabel(candidate.invisible),
          candidate.rank.join("/"),
          candidate.invalid ? candidate.invalidReasons.join(" ") : "Sem excecao ativa.",
          boolLabel(
            !sthira.brahma.replacement &&
              candidate.point.key === sthira.brahma.point.key &&
              candidate.point.signIndex === sthira.brahma.point.signIndex
          ),
          candidate.sourceNote,
        ]),
        ...(sthira.brahma.replacement
          ? [
              [
                "Substituicao semanal de 6a",
                sthira.brahma.replacement.replacementPoint.name,
                SIGN_NAMES[sthira.brahma.replacement.replacementPoint.signIndex],
                boolLabel(isStrongPlanet(sthira.brahma.replacement.replacementPoint)),
                boolLabel(NATURAL_ODD_SIGNS.has(sthira.brahma.replacement.replacementPoint.signIndex)),
                boolLabel(
                  modulo(
                    sthira.brahma.replacement.replacementPoint.signIndex -
                      sthira.brahma.referenceSignIndex,
                    12
                  ) <= 5
                ),
                "substituicao",
                "Aplicada por excecao semanal.",
                "Sim",
                sthira.brahma.replacement.note,
              ],
            ]
          : []),
      ],
      `${sthira.note} ${sthira.brahma.note}`
    ),
    createTable(
      `${module}-sthira-markers`,
      "Rudra e Maheshwara da Sthira",
      ["Marcador", "Origem", "Graha", "Signo", "Dignidade", "Drishti ao Lagna", "Score", "Selecionado", "Nota"],
      [
        ...sthira.rudra.candidates.map((candidate) => [
          candidate.label,
          SIGN_NAMES[candidate.baseSignIndex],
          candidate.point.name,
          SIGN_NAMES[candidate.point.signIndex],
          dignityRank(candidate.point.tags).toString(),
          boolLabel(hasJaiminiRashiDrishti(candidate.point.signIndex, snapshot.ascendant.signIndex)),
          candidate.rank.join("/"),
          boolLabel(
            candidate.point.key === sthira.rudra.point.key &&
              candidate.point.signIndex === sthira.rudra.point.signIndex
          ),
          candidate.sourceNote,
        ]),
        [
          "Maheshwara",
          sthira.maheshwara.atmakarakaPoint
            ? `8a do AK (${sthira.maheshwara.atmakarakaPoint.name})`
            : "8a do Lagna",
          sthira.maheshwara.point.name,
          SIGN_NAMES[sthira.maheshwara.point.signIndex],
          dignityRank(sthira.maheshwara.point.tags).toString(),
          boolLabel(hasJaiminiRashiDrishti(sthira.maheshwara.point.signIndex, snapshot.ascendant.signIndex)),
          sthira.maheshwara.rank.join("/"),
          "Sim",
          sthira.maheshwara.note,
        ],
      ],
      `Sthira v2 cruza Brahma, Rudra e Maheshwara como triade operacional do sistema. ${sthira.markerNote}`
    ),
    createTable(
      `${module}-sthira-triad`,
      "Coesao da Triade Sthira",
      ["Membro", "Base", "Graha", "Signo", "Anchors tocados", "Enlaces internos", "Score", "Nota"],
      sthira.triadOverlay.rows.map((row) => [
        row.label,
        row.base,
        row.point.name,
        SIGN_NAMES[row.point.signIndex],
        row.anchorHits.join(", ") || "--",
        row.pairHits.join(", ") || "--",
        row.score.toFixed(2),
        row.note,
      ]),
      `Estado atual da triade: ${sthira.triadOverlay.state}. ${sthira.triadOverlay.note}`
    ),
    createTable(
      `${module}-kalachakra-classical-matrix`,
      "Kalachakra classico - matriz do chakra natal",
      ["Pada", "Movimento", "Amsa", "Deha", "Jeeva", "Paramayus", "Sequencia"],
      kalachakra.classical.classicalRows.map((row) => [
        `${row.pada}o`,
        row.motion,
        SIGN_NAMES[row.amsaSignIndex],
        SIGN_NAMES[row.dehaSignIndex],
        SIGN_NAMES[row.jeevaSignIndex],
        row.paramayus.toString(),
        row.sequence,
      ]),
      `${kalachakra.classical.note} ${kalachakra.classical.cycleMethodNote}`
    ),
    createTable(
      `${module}-kalachakra-classical-cycle`,
      "Kalachakra classico - ciclo do pada natal",
      ["Nakshatra", "Pada", "Etapa", "Signo", "Anos", "Inicio", "Fim", "Ativa", "Nota"],
      kalachakra.classical.birthPeriods.map((period) => [
        period.nakshatra,
        `${period.pada}o`,
        period.step.toString(),
        period.signName,
        period.years.toFixed(2),
        period.start,
        period.end,
        boolLabel(period.active),
        period.note,
      ]),
      `${kalachakra.classical.balanceNote} Sequencia rotacionada: ${formatSignSequence(kalachakra.classical.rotatedSequence)}. ` +
        `Progresso escolar em modo ${kalachakra.classical.cycleModeLabel}.`
    ),
    createTable(
      `${module}-kalachakra-kaala`,
      "Kalachakra v1 - Kaala Dasa",
      ["Lord", "Ciclo", "Inicio", "Fim", "Anos", "Ativa"],
      kalachakra.kaalaPeriods.map((period) => [
        period.lord,
        period.cycle.toString(),
        period.start,
        period.end,
        period.years.toFixed(2),
        period.active ? "Sim" : "Nao",
      ]),
      `${kalachakra.portionNote} Primeiro ciclo: ${kalachakra.firstCycleYears.toFixed(2)} anos; segundo ciclo: ${kalachakra.secondCycleYears.toFixed(2)} anos.`
    ),
    createTable(
      `${module}-kalachakra-chakra`,
      "Kalachakra v1 - Chakra Dasa",
      ["Signo", "Inicio", "Fim", "Anos", "Ativa"],
      kalachakra.chakraPeriods.map((period) => [
        period.signName,
        period.start,
        period.end,
        period.years.toString(),
        period.active ? "Sim" : "Nao",
      ]),
      kalachakra.chakraNote
    ),
    createTable(
      `${module}-kalachakra-windows`,
      "Janelas do Kalachakra v1",
      ["Faixa", "Inicio", "Fim", "Duracao (h)", "Ativa", "Nota"],
      kalachakra.portion.windows.map((window) => [
        window.label,
        decimalHoursToLabel(window.start),
        decimalHoursToLabel(window.start + window.duration),
        window.duration.toFixed(2),
        boolLabel(window.key === kalachakra.portion.key),
        window.note,
      ]),
      "Tabela operacional da divisao dawn/day/dusk/night usada por esta versao de Kalachakra."
    ),
    createTable(
      `${module}-kalachakra-scorecard`,
      "Scorecard Kalachakra v1",
      ["Filtro", "Estado", "Score", "Nota"],
      kalachakraOperationalRows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
      "Overlay curto para mostrar o quanto a versao Kaala + Chakra ficou coesa no recorte atual, agora apoiada por uma malha classica auditavel do chakra natal."
    ),
    createTable(
      `${module}-kalachakra-classical-scorecard`,
      "Scorecard Kalachakra classico",
      ["Filtro", "Estado", "Score", "Nota"],
      kalachakraClassicalRows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
      "Painel da camada classica do chakra natal: movimento, Amsa, Deha, Jeeva, Paramayus e encaixe do ciclo do pada."
    ),
  ];
  const focusConfig: Record<
    JyotishConfig["secondaryDasha"],
    {
      itemName: string;
      tableTitles: string[];
      description: string;
      status: "implemented" | "mixed" | "placeholder";
      bullets?: string[];
    }
  > = {
    yogini: {
      itemName: "Yogini Dasha ativa",
      tableTitles: ["Yogini Dasha", "Subperiodos da Yogini ativa"],
      description: "A familia Yogini foi trazida para o primeiro plano desta leitura, com foco na maha ativa e seus subperiodos proporcionais.",
      status: "implemented",
    },
    ashtottari: {
      itemName: "Ashtottari Dasha ativa",
      tableTitles: ["Ashtottari Dasha", "Subperiodos da Ashtottari ativa"],
      description: "A familia Ashtottari foi priorizada nesta leitura, mantendo o gate tecnico explicito para quando a condicao classica fecha ou nao.",
      status: "implemented",
    },
    shodashottari: {
      itemName: "Shodashottari ativa",
      tableTitles: ["Shodashottari Dasha", "Subperiodos da Shodashottari ativa"],
      description: "A familia Shodashottari foi trazida ao foco, com a nota tecnica mostrando o quanto o gate classico ficou completo nesta rodada.",
      status: "implemented",
    },
    dwadashottari: {
      itemName: "Dwadashottari ativa",
      tableTitles: ["Dwadashottari Dasha", "Subperiodos da Dwadashottari ativa"],
      description: "A familia Dwadashottari foi priorizada nesta leitura, deixando o papel do Navamsa e do gate operacional totalmente exposto.",
      status: "implemented",
    },
    kalachakra: {
      itemName: "Kalachakra Dasha ativa",
      tableTitles: [
        "Kalachakra classico - matriz do chakra natal",
        "Kalachakra classico - ciclo do pada natal",
        "Scorecard Kalachakra classico",
        "Kalachakra v1 - Kaala Dasa",
        "Kalachakra v1 - Chakra Dasa",
        "Janelas do Kalachakra v1",
        "Scorecard Kalachakra v1",
      ],
      description:
        "A familia Kalachakra agora abre o chakra natal classico do pada e preserva, em paralelo, o overlay operacional de Kaala Dasa + Chakra Dasa.",
      status: "implemented",
      bullets: [
        "A camada classica agora explicita Savya/Apasavya, grupo, Amsa, Deha, Jeeva, Paramayus e o ciclo natal do pada.",
        "O salto entre padas/ciclos depois do envelope natal continua sendo escolha escolar separada; o motor mantem Kaala + Chakra como overlay operacional de comparacao.",
      ],
    },
    chara: {
      itemName: "Chara Dasha ativa",
      tableTitles: ["Chara Dasha", "Subperiodos da Chara ativa"],
      description: "A familia Chara/Jaimini foi promovida para foco principal desta leitura, com semente, ordem e anos-base expostos.",
      status: "implemented",
    },
    narayana: {
      itemName: "Narayana Dasha ativa",
      tableTitles: ["Narayana Dasha", "Antardashas da Narayana ativa"],
      description: "A familia Narayana foi colocada no foco principal, com primeiro e segundo ciclo, ordem usada e antardasha operacional em destaque.",
      status: "implemented",
    },
    sthira: {
      itemName: "Sthira Dasha ativa",
      tableTitles: [
        "Sthira Dasha",
        "Antardashas da Sthira ativa",
        "Brahma e Candidatos da Sthira",
        "Rudra e Maheshwara da Sthira",
        "Coesao da Triade Sthira",
      ],
      description:
        "A familia Sthira foi trazida para a frente do fluxo, com Brahma-sign operacional, Rudra, Maheshwara e grade 7/8/9 anos explicitados.",
      status: "implemented",
    },
  };
  const familyRankingRows = [
    {
      key: "yogini" as const,
      name: "Yogini",
      active: `${yogini.activePeriod.yogini} | ${yogini.activePeriod.lord}`,
      gate: "Fechamento classico direto",
      anchor: "Nakshatra lunar + saldo inicial",
      status: "implemented" as const,
      score: Number((readinessBase("implemented") + 3 + 2).toFixed(2)),
      note: yogini.note,
    },
    {
      key: "ashtottari" as const,
      name: "Ashtottari",
      active: ashtottari.activePeriod.lord,
      gate: ashtottari.classicalGate ? "Gate classico fechado" : "Gate classico parcial",
      anchor: ashtottari.birthStar,
      status: "implemented" as const,
      score: Number((readinessBase("implemented") + (ashtottari.classicalGate ? 3 : 1) + 1.5).toFixed(2)),
      note: `${ashtottari.note} ${ashtottari.gateNote}`,
    },
    {
      key: "shodashottari" as const,
      name: "Shodashottari",
      active: shodashottari.activePeriod.lord,
      gate: shodashottari.classicalGate ? "Gate classico fechado" : "Gate classico parcial",
      anchor: "Pushya ao Janma Nakshatra",
      status: "implemented" as const,
      score: Number((readinessBase("implemented") + (shodashottari.classicalGate ? 3 : 1.5) + 1.5).toFixed(2)),
      note: `${shodashottari.note} ${shodashottari.gateNote}`,
    },
    {
      key: "dwadashottari" as const,
      name: "Dwadashottari",
      active: dwadashottari.activePeriod.lord,
      gate: dwadashottari.classicalGate ? "Gate classico fechado" : "Gate classico parcial",
      anchor: "Revati + Navamsa",
      status: "implemented" as const,
      score: Number((readinessBase("implemented") + (dwadashottari.classicalGate ? 3 : 1) + 1.5).toFixed(2)),
      note: `${dwadashottari.note} ${dwadashottari.gateNote}`,
    },
    {
      key: "chara" as const,
      name: "Chara",
      active: chara.activePeriod.signName,
      gate: "Semente e ordem expostas",
      anchor: `${chara.seed.label} em ${SIGN_NAMES[chara.seed.signIndex]}`,
      status: "implemented" as const,
      score: Number((readinessBase("implemented") + 2.5 + 2).toFixed(2)),
      note: `${chara.note} Semente ${chara.seed.label} em ${SIGN_NAMES[chara.seed.signIndex]}; ordem ${chara.direct ? "direta" : "reversa"}.`,
    },
    {
      key: "narayana" as const,
      name: "Narayana",
      active: narayana.activePeriod.signName,
      gate: "Dois ciclos operacionais",
      anchor: `${SIGN_NAMES[narayana.startSignIndex]} vs 7a`,
      status: "implemented" as const,
      score: Number((readinessBase("implemented") + 2 + (narayana.orderNote.includes("tabela geral") ? 1.5 : 1) + 1).toFixed(2)),
      note: `${narayana.note} ${narayana.strengthNote} ${narayana.orderNote}`,
    },
    {
      key: "sthira" as const,
      name: "Sthira",
      active: sthira.activePeriod.signName,
      gate: sthira.brahma.replacement
        ? "Triade operacional com excecao semanal no Brahma"
        : "Triade Brahma-Rudra-Maheshwara operacional",
      anchor: `${sthira.brahma.point.name} em ${SIGN_NAMES[sthira.brahma.point.signIndex]}`,
      status: "implemented" as const,
      score: Number(
        (
          readinessBase("implemented") +
          2 +
          (sthira.brahma.replacement ? 0.5 : 1.5) +
          (sthira.triadOverlay.state === "Fechada" ? 2 : sthira.triadOverlay.state === "Parcial" ? 1.25 : 0.5)
        ).toFixed(2)
      ),
      note: `${sthira.note} ${sthira.brahma.note} ${sthira.rudra.note} ${sthira.maheshwara.note} ${sthira.subNote} ${sthira.triadOverlay.note}`,
    },
    {
      key: "kalachakra" as const,
      name: "Kalachakra",
      active:
        kalachakra.classical.activeBirthPeriod
          ? `${kalachakra.classical.activeBirthPeriod.signName} | ${kalachakra.activeKaalaPeriod.lord}`
          : `${kalachakra.activeKaalaPeriod.lord} | ${kalachakra.activeChakraPeriod.signName}`,
      gate: "Chakra natal classico + Kaala/Chakra operacionais",
      anchor:
        `${formatKalachakraMotion(kalachakra.classical.pattern.motion)} ${kalachakra.classical.pattern.patternLabel} | ` +
        `${SIGN_NAMES[kalachakra.classical.padaProfile.amsa]} | ${kalachakra.classical.cycleModeLabel}`,
      status: "implemented" as const,
      score: Number(
        (readinessBase("implemented") + 2 + kalachakraClassicalScore / 3 + kalachakraOperationalScore / 4).toFixed(2)
      ),
      note:
        `${kalachakra.classicalNote} ${kalachakra.classical.cycleMethodNote} ${kalachakra.portionNote} ` +
        `${kalachakra.chakraNote} ${kalachakraClassicalState}; ${kalachakraOperationalState}.`,
    },
  ].sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
  const familyLeader = familyRankingRows[0];
  const familyRunnerUp = familyRankingRows[1];
  const familySpread =
    familyLeader && familyRunnerUp ? Number((familyLeader.score - familyRunnerUp.score).toFixed(2)) : Number.POSITIVE_INFINITY;
  const selectedFocus = focusConfig[selectedSecondary];
  const focusItem = comparisonItems.find((item) => item.name === selectedFocus.itemName);
  const focusTables = comparisonTables.filter((table) => selectedFocus.tableTitles.includes(table.title));
  const selectedFocusItems = [
    createDatum(module, "Dasha", "Familia secundaria selecionada", secondaryLabels[selectedSecondary], {
      technicalNotes:
        selectedSecondary === "kalachakra"
          ? "A configuracao do modulo aponta Kalachakra como foco tecnico; esta versao abre o chakra natal classico do pada e o overlay operacional de Kaala + Chakra em paralelo."
          : selectedSecondary === "sthira"
            ? "A configuracao do modulo pede foco tecnico em Sthira, que agora sai em secao propria com Brahma, Rudra, Maheshwara, candidatos e grade 7/8/9 anos expostos."
            : `A configuracao do modulo pede foco tecnico em ${secondaryLabels[selectedSecondary]}, que agora ganha sua propria secao principal.`,
      confidence: selectedFocus.status === "placeholder" ? 0.35 : 0.82,
      status: selectedFocus.status,
      methodUsed: "config-secondary-dasha-focus",
    }),
    ...(focusItem ? [focusItem] : []),
    ...(selectedSecondary === "sthira"
      ? [
          createDatum(
            module,
            "Dasha",
            "Referencia Lagna x 7a",
            SIGN_NAMES[sthira.brahma.referenceSignIndex],
            {
              technicalNotes:
                `${describeSignStrength(snapshot, sthira.brahma.referenceSignIndex, modulo(sthira.brahma.referenceSignIndex + 6, 12))} ` +
                "A Sthira usa essa rasi como ancora antes da escolha de Brahma.",
              confidence: 0.72,
              status: "implemented",
              methodUsed: "working-set-sthira-reference-sign-v1",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Brahma operacional",
            `${sthira.brahma.point.name} | ${SIGN_NAMES[sthira.brahma.point.signIndex]}`,
            {
              technicalNotes: sthira.brahma.note,
              confidence: 0.7,
              status: "implemented",
              methodUsed: "working-set-sthira-brahma-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Rudra operacional",
            `${sthira.rudra.point.name} | ${SIGN_NAMES[sthira.rudra.point.signIndex]}`,
            {
              technicalNotes: sthira.rudra.note,
              confidence: 0.66,
              status: "implemented",
              methodUsed: "working-set-sthira-rudra-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Maheshwara operacional",
            `${sthira.maheshwara.point.name} | ${SIGN_NAMES[sthira.maheshwara.point.signIndex]}`,
            {
              technicalNotes: sthira.maheshwara.note,
              confidence: 0.64,
              status: "implemented",
              methodUsed: "working-set-sthira-maheshwara-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Coesao da triade Sthira",
            sthira.triadOverlay.state,
            {
              technicalNotes: sthira.triadOverlay.note,
              confidence:
                sthira.triadOverlay.state === "Fechada"
                  ? 0.69
                  : sthira.triadOverlay.state === "Parcial"
                    ? 0.58
                    : 0.4,
              status: sthira.triadOverlay.status,
              methodUsed: "working-set-sthira-triad-overlay-v1",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Lider da triade Sthira",
            sthira.triadOverlay.leader
              ? `${sthira.triadOverlay.leader.label} | ${sthira.triadOverlay.leader.point.name}`
              : "--",
            {
              technicalNotes: sthira.triadOverlay.leader
                ? `${sthira.triadOverlay.leader.note} Score ${sthira.triadOverlay.leader.score.toFixed(2)}.`
                : "Sem membro lider para a triade nesta rodada.",
              confidence: sthira.triadOverlay.leader ? 0.64 : 0.3,
              status: sthira.triadOverlay.leader ? "implemented" : "placeholder",
              methodUsed: "working-set-sthira-triad-overlay-v1",
            }
          ),
          ...(sthira.brahma.replacement
            ? [
                createDatum(
                  module,
                  "Dasha",
                  "Excecao semanal aplicada",
                  `${sthira.brahma.replacement.fromPoint.name} -> ${sthira.brahma.replacement.replacementPoint.name}`,
                  {
                    technicalNotes: sthira.brahma.replacement.note,
                    confidence: 0.62,
                    status: "implemented",
                    methodUsed: "working-set-sthira-brahma-weekday-exception-v2",
                  }
                ),
              ]
            : []),
        ]
      : []),
    ...(selectedSecondary === "kalachakra"
        ? [
          createDatum(module, "Dasha", "Coesao operacional do Kalachakra", kalachakraOperationalState, {
            technicalNotes: `Score ${kalachakraOperationalScore} no overlay curto de janela natal, split dos ciclos, Chakra inicial e Kaala x Chakra ativo.`,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "working-set-kalachakra-scorecard-v1",
          }),
          createDatum(module, "Dasha", "Modo escolar do ciclo", kalachakra.classical.cycleModeLabel, {
            technicalNotes: kalachakra.classical.cycleMethodNote,
            confidence: 0.78,
            status: "implemented",
            methodUsed: "classical-kalachakra-cycle-mode-v2",
          }),
          createDatum(
            module,
            "Dasha",
            "Chakra natal classico",
            `${formatKalachakraMotion(kalachakra.classical.pattern.motion)} | ${kalachakra.classical.pattern.patternLabel} | Pada ${kalachakra.classical.moon.pada}`,
            {
              technicalNotes: kalachakra.classical.note,
              confidence: 0.76,
              status: "implemented",
              methodUsed: "classical-kalachakra-chakra-envelope-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Amsa, Deha e Jeeva",
            `${SIGN_NAMES[kalachakra.classical.padaProfile.amsa]} | ${SIGN_NAMES[kalachakra.classical.padaProfile.deha]} | ${SIGN_NAMES[kalachakra.classical.padaProfile.jeeva]}`,
            {
              technicalNotes: `${kalachakra.classical.balanceNote} ${kalachakra.classical.moonD9 ? `Lua D9 em ${kalachakra.classical.moonD9.signName}.` : "Sem Lua D9 para checagem."}`,
              confidence: kalachakra.classical.moonD9 ? 0.74 : 0.68,
              status: "implemented",
              methodUsed: "classical-kalachakra-amsa-deha-jeeva-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Proximo salto escolar",
            `${kalachakra.classical.pattern.members[kalachakra.classical.nextEnvelope.memberIndex]} | ${kalachakra.classical.nextEnvelope.padaIndex + 1}o pada`,
            {
              technicalNotes: `Quando o envelope natal atual se esgotar, o motor avanca para esse alvo conforme o modo ${kalachakra.classical.cycleModeLabel}.`,
              confidence: 0.76,
              status: "implemented",
              methodUsed: "classical-kalachakra-cycle-mode-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Dasha classica no ciclo natal",
            kalachakra.classical.activeBirthPeriod?.signName ?? "--",
            {
              technicalNotes: kalachakra.classical.activeBirthPeriod
                ? `${kalachakra.classical.activeBirthPeriod.note} Fim previsto em ${kalachakra.classical.activeBirthPeriod.end}.`
                : kalachakra.classical.cycleMethodNote,
              confidence: kalachakra.classical.activeBirthPeriod ? 0.72 : 0.44,
              status: "implemented",
              methodUsed: "classical-kalachakra-pada-cycle-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Coesao classica do Kalachakra",
            kalachakraClassicalState,
            {
              technicalNotes: `Score ${kalachakraClassicalScore} ao cruzar movimento do chakra, Amsa, Deha, Jeeva, Navamsa da Lua e ciclo natal do pada.`,
              confidence: 0.74,
              status: "implemented",
              methodUsed: "classical-kalachakra-scorecard-v2",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Janela operacional do nascimento",
            kalachakra.portion.label,
            {
              technicalNotes:
                `${kalachakra.portion.note} Hora local operacional em ${decimalHoursToLabel(kalachakra.portion.birthHour)}. ` +
                `Fracao transcorrida: ${(kalachakra.portion.elapsedFraction * 100).toFixed(2)}% da faixa.`,
              confidence: 0.66,
              status: "implemented",
              methodUsed: "working-set-kalachakra-day-portion-v1",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Split Kaala dos dois ciclos",
            `${kalachakra.firstCycleYears.toFixed(2)} + ${kalachakra.secondCycleYears.toFixed(2)} anos`,
            {
              technicalNotes:
                "O primeiro ciclo usa a fracao ja transcorrida da faixa operacional; o segundo fecha o complemento ate 120 anos.",
              confidence: 0.64,
              status: "implemented",
              methodUsed: "working-set-kalachakra-kaala-split-v1",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Signo inicial do Chakra",
            SIGN_NAMES[kalachakra.chakraStartSignIndex],
            {
              technicalNotes: kalachakra.chakraNote,
              confidence: 0.64,
              status: "implemented",
              methodUsed: "working-set-kalachakra-chakra-start-v1",
            }
          ),
        ]
      : []),
  ];
  const selectedSecondarySection = createSection({
    id: `${module}-dasha-focus`,
    title: `Foco da Dasha Secundaria: ${secondaryLabels[selectedSecondary]}`,
    description: selectedFocus.description,
    status: selectedFocus.status,
    items: selectedFocusItems,
    tables: focusTables,
    bullets: selectedFocus.bullets,
  });
  const comparisonSection = createSection({
    id: `${module}-dasha-classical`,
    title: "Comparativo Tecnico de Familias de Dasha",
    description:
      "Esta camada avancada preserva o quadro comparativo completo entre Yogini, Ashtottari, Shodashottari, Dwadashottari, Chara, Narayana, Sthira e o Kalachakra com envelope classico natal mais overlay operacional.",
    status: "implemented",
    advanced: true,
    items: [
      createDatum(module, "Dasha", "Familia tecnicamente mais fechada", familyLeader.name, {
        technicalNotes: `${familyLeader.note} Anchor operacional: ${familyLeader.anchor}. Gate: ${familyLeader.gate}. Score ${familyLeader.score.toFixed(2)}.`,
        confidence: familyLeader.status === "implemented" ? 0.78 : 0.62,
        status: familyLeader.status,
        methodUsed: "family-readiness-ranking-v1",
      }),
      createDatum(
        module,
        "Dasha",
        "Familia alternativa",
        familyRunnerUp ? `${familyRunnerUp.name} (${familyRunnerUp.score.toFixed(2)} pts)` : "--",
        {
          technicalNotes: familyRunnerUp
            ? `${familyRunnerUp.note} Diferenca frente a ${familyLeader.name}: ${familySpread.toFixed(2)} pts.`
            : "Sem segunda familia disponivel para comparativo.",
          confidence: familyRunnerUp ? 0.7 : 0.3,
          status: familyRunnerUp ? familyRunnerUp.status : "placeholder",
          methodUsed: "family-readiness-ranking-v1",
        }
      ),
      createDatum(
        module,
        "Dasha",
        "Margem tecnica entre familias",
        Number.isFinite(familySpread)
          ? `${familySpread.toFixed(2)} pts | ${familySpread <= 1.5 ? "quadro disputado" : "lideranca firme"}`
          : "sem comparativo",
        {
          technicalNotes:
            "Ranking tecnico agregado por fechamento do gate classico, estabilidade do working set e transparencia das ancoras usadas em cada familia.",
          confidence: 0.72,
          status: "implemented",
          methodUsed: "family-readiness-ranking-v1",
        }
      ),
      ...comparisonItems,
    ],
    tables: [
      createTable(
        `${module}-dasha-family-ranking`,
        "Ranking tecnico das familias de dasha",
        ["Familia", "Estado", "Gate", "Ancora", "Ativa", "Score", "Nota"],
        familyRankingRows.map((row) => [
          row.name,
          row.status === "implemented" ? "Implementada" : row.status === "mixed" ? "Mista" : "Placeholder",
          row.gate,
          row.anchor,
          row.active,
          row.score.toFixed(2),
          row.note,
        ]),
        "Score agregado para mostrar quao fechada cada familia esta no motor atual, sem confundir isso com previsao definitiva."
      ),
      ...comparisonTables,
    ],
  });
  const validations = [
    ...(familyLeader.key !== selectedSecondary
      ? [
          createValidation(
            "info",
            `A familia selecionada foi ${secondaryLabels[selectedSecondary]}, mas o ranking tecnico desta rodada ficou liderado por ${familyLeader.name}.`,
            "secondaryDasha",
            "family-readiness-ranking-v1"
          ),
        ]
      : []),
    ...(selectedSecondary === "chara"
      ? [
          createValidation(
            "info",
            "Chara Dasha segue o working set Jaimini/PVN Rao-JHora com semente pela mais forte entre Lagna, Lua e Sol.",
            "secondaryDasha",
            "working-set-jaimini-chara-rao-jhora"
          ),
        ]
      : []),
    ...(selectedSecondary === "narayana"
      ? [
          createValidation(
            "info",
            "Narayana Dasha v1 esta operacional com dois ciclos, mas continua dependente do working set de ordem e forca entre rasi e sua 7a.",
            "secondaryDasha",
            "working-set-narayana-parasari-jaimini-v1"
          ),
        ]
      : []),
    ...(selectedSecondary === "sthira"
      ? [
          createValidation(
            "warning",
            `Sthira Dasha agora abre Brahma, Rudra e Maheshwara operacionais com triade ${sthira.triadOverlay.state.toLowerCase()}, mas ainda nao fechou as variantes escolares mais controversas nem a camada classica completa do sistema.`,
            "secondaryDasha",
            "working-set-sthira-brahma-rudra-maheshwara-v2"
          ),
        ]
      : []),
    ...(selectedSecondary === "kalachakra"
      ? [
          createValidation(
            "info",
            `Kalachakra agora abre Savya/Apasavya, grupo, Amsa, Deha, Jeeva, Paramayus e o ciclo natal do pada. Nesta rodada, o salto entre padas/ciclos esta em modo ${kalachakra.classical.cycleModeLabel.toLowerCase()}.`,
            "secondaryDasha",
            "classical-kalachakra-pada-cycle-v2"
          ),
        ]
      : []),
    ...(selectedSecondary === "ashtottari" && !ashtottari.classicalGate
      ? [
          createValidation(
            "warning",
            "Ashtottari foi calculada mesmo sem o gate classico fechar integralmente; leia esta familia como working set operacional.",
            "secondaryDasha",
            "ashtottari-gate-v1"
          ),
        ]
      : []),
    ...(selectedSecondary === "shodashottari" && !shodashottari.classicalGate
      ? [
          createValidation(
            "warning",
            "Shodashottari foi calculada com gate classico parcial; o periodo do dia e a Hora do Lagna ainda precisam de confirmacao mais estrita.",
            "secondaryDasha",
            "shodashottari-gate-v1"
          ),
        ]
      : []),
    ...(selectedSecondary === "dwadashottari" && !dwadashottari.classicalGate
      ? [
          createValidation(
            "warning",
            "Dwadashottari foi calculada sem o gate classico de Navamsa de Venus se fechar automaticamente; trate esta leitura como operacional e nao como sentenca escolar fechada.",
            "secondaryDasha",
            "dwadashottari-gate-v1"
          ),
        ]
      : []),
  ];
  const activePrimaryMahadasha = snapshot.dashas.find((period) => period.active);
  const activePrimaryAntardasha = snapshot.antardashas.find((period) => period.active);
  const analysisMoment = new Date(`${snapshot.analysisDate}T12:00:00Z`);
  const activePrimaryAntardashaYears = resolveExactAntardashaYears(
    activePrimaryMahadasha,
    activePrimaryAntardasha
  );
  const pratyantardashas = activePrimaryAntardasha
    ? buildVimshottariWindow(
        activePrimaryAntardasha.lord,
        new Date(`${activePrimaryAntardasha.startDate}T00:00:00Z`).getTime(),
        activePrimaryAntardashaYears,
        analysisMoment
      )
    : [];
  const activePratyantardasha = pratyantardashas.find((period) => period.active);
  const sukshmaDashas = activePratyantardasha
    ? buildVimshottariWindow(
        activePratyantardasha.lord,
        activePratyantardasha.startMs,
        activePratyantardasha.years,
        analysisMoment
      )
    : [];
  const activeSukshmaDasha = sukshmaDashas.find((period) => period.active);
  const pranaDashas = activeSukshmaDasha
    ? buildVimshottariWindow(
        activeSukshmaDasha.lord,
        activeSukshmaDasha.startMs,
        activeSukshmaDasha.years,
        analysisMoment
      )
    : [];
  const activePranaDasha = pranaDashas.find((period) => period.active);
  const primaryChainState =
    activePrimaryMahadasha && activePrimaryAntardasha
      ? "Cadeia primaria fechada"
      : activePrimaryMahadasha
        ? "Mahadasha presente"
        : "Sem cadeia primaria ativa";
  const fineChainState =
    activePrimaryAntardasha && activePratyantardasha && activeSukshmaDasha && activePranaDasha
      ? "Cadeia fina operacional"
      : activePrimaryAntardasha && activePratyantardasha
        ? "Cadeia fina parcial"
        : "Cadeia fina ausente";

  return {
    validations,
    summary: [
      `Foco secundario atual: ${secondaryLabels[selectedSecondary]}.`,
      `Ranking tecnico atual liderado por ${familyLeader.name}${familyRunnerUp ? `, com ${familySpread.toFixed(2)} pts sobre ${familyRunnerUp.name}` : ""}.`,
      activePranaDasha
        ? `Cadeia fina ativa: ${activePrimaryAntardasha?.mahaLord ?? "--"} / ${activePrimaryAntardasha?.lord ?? "--"} / ${activePratyantardasha?.lord ?? "--"} / ${activeSukshmaDasha?.lord ?? "--"} / ${activePranaDasha.lord}.`
        : "A cadeia fina do Vimshottari agora sai em working set auditavel quando a trilha primaria do snapshot fecha.",
      selectedSecondary === "kalachakra"
        ? `Kalachakra agora sai com chakra natal classico auditavel e overlay operacional Kaala + Chakra, em modo escolar ${kalachakra.classical.cycleModeLabel.toLowerCase()}.`
        : selectedSecondary === "sthira"
          ? `Sthira agora sai com triade Brahma-Rudra-Maheshwara operacional e coesao ${sthira.triadOverlay.state.toLowerCase()} antes do comparativo avancado.`
          : `A familia ${secondaryLabels[selectedSecondary]} agora sai em secao propria antes do comparativo avancado.`,
    ],
    sections: [
      createSection({
        id: `${module}-dasha`,
        title: "Dashas e Periodos",
        description:
          "Vimshottari calculado com mahadasha e antardasha, com estrutura aberta para familias adicionais de dasha.",
        status: "implemented",
        items: [
          createDatum(module, "Dasha", "Vimshottari ativo", activePrimaryMahadasha?.lord ?? "--", {
            technicalNotes: activePrimaryMahadasha
              ? `Mahadasha ativa de ${activePrimaryMahadasha.startDate} ate ${activePrimaryMahadasha.endDate}.`
              : "Sem Mahadasha ativa marcada no snapshot atual.",
            confidence: activePrimaryMahadasha ? 0.82 : 0.35,
            status: activePrimaryMahadasha ? "implemented" : "placeholder",
            methodUsed: "snapshot-vimshottari-primary-chain",
          }),
          createDatum(module, "Dasha", "Antardasha ativa", activePrimaryAntardasha ? `${activePrimaryAntardasha.mahaLord} / ${activePrimaryAntardasha.lord}` : "--", {
            technicalNotes: activePrimaryAntardasha
              ? `Subperiodo ativo de ${activePrimaryAntardasha.startDate} ate ${activePrimaryAntardasha.endDate}.`
              : "Sem Antardasha ativa marcada no snapshot atual.",
            confidence: activePrimaryAntardasha ? 0.8 : 0.35,
            status: activePrimaryAntardasha ? "implemented" : "placeholder",
            methodUsed: "snapshot-vimshottari-primary-chain",
          }),
          createDatum(module, "Dasha", "Cadeia primaria", primaryChainState, {
            technicalNotes:
              activePrimaryMahadasha && activePrimaryAntardasha
                ? "Mahadasha e Antardasha saem juntas no snapshot, deixando a trilha primaria do Vimshottari operacional para cruzamento com as familias secundarias."
                : "A trilha primaria ficou incompleta no snapshot atual e pede revisao da cadeia temporal antes do cruzamento fino.",
            confidence: activePrimaryMahadasha && activePrimaryAntardasha ? 0.8 : 0.4,
            status: activePrimaryMahadasha && activePrimaryAntardasha ? "implemented" : "placeholder",
            methodUsed: "snapshot-vimshottari-primary-chain",
          }),
        ],
        tables: [
          createTable(
            `${module}-mahadasha`,
            "Mahadasha",
            ["Lord", "Inicio", "Fim", "Anos", "Ativa"],
            snapshot.dashas.map((period) => [
              period.lord,
              period.startDate,
              period.endDate,
              period.years.toString(),
              period.active ? "Sim" : "Nao",
            ])
          ),
          createTable(
            `${module}-antardasha`,
            "Antardasha",
            ["Maha", "Sub", "Inicio", "Fim", "Ativa"],
            snapshot.antardashas.slice(0, 18).map((period) => [
              period.mahaLord,
              period.lord,
              period.startDate,
              period.endDate,
              period.active ? "Sim" : "Nao",
            ]),
            "Os primeiros periodos ja aparecem; a exportacao JSON guarda a lista inteira do modulo.",
            true
          ),
        ],
      }),
      createSection({
        id: `${module}-vimshottari-fine-chain`,
        title: "Cadeia Fina do Vimshottari",
        description:
          "Abre Pratyantardasha, Sukshma e Prana a partir da cadeia primaria do snapshot. As janelas finas herdam resolucao diaria/UTC aproximada do periodo ativo.",
        status: activePrimaryAntardasha ? "implemented" : "placeholder",
        items: [
          createDatum(module, "Dasha", "Cadeia fina", fineChainState, {
            technicalNotes: activePrimaryAntardasha
              ? "A malha fina parte da Antardasha ativa e distribui subperiodos proporcionais na ordem classica do Vimshottari."
              : "Sem Antardasha ativa no snapshot; a cadeia fina nao pode ser desdobrada com seguranca.",
            confidence: activePrimaryAntardasha ? 0.74 : 0.3,
            status: activePrimaryAntardasha ? "implemented" : "placeholder",
            methodUsed: "vimshottari-primary-sublevels-v1",
          }),
          createDatum(
            module,
            "Dasha",
            "Pratyantardasha ativa",
            activePratyantardasha && activePrimaryAntardasha
              ? `${activePrimaryAntardasha.mahaLord} / ${activePrimaryAntardasha.lord} / ${activePratyantardasha.lord}`
              : "--",
            {
              technicalNotes: activePratyantardasha
                ? `${activePratyantardasha.startLabel} ate ${activePratyantardasha.endLabel}, com ${activePratyantardasha.days.toFixed(2)} dias aproximados.`
                : "Sem Pratyantardasha ativa derivada da Antardasha atual.",
              confidence: activePratyantardasha ? 0.72 : 0.3,
              status: activePratyantardasha ? "implemented" : "placeholder",
              methodUsed: "vimshottari-primary-sublevels-v1",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Sukshma ativa",
            activeSukshmaDasha && activePrimaryAntardasha && activePratyantardasha
              ? `${activePrimaryAntardasha.mahaLord} / ${activePrimaryAntardasha.lord} / ${activePratyantardasha.lord} / ${activeSukshmaDasha.lord}`
              : "--",
            {
              technicalNotes: activeSukshmaDasha
                ? `${activeSukshmaDasha.startLabel} ate ${activeSukshmaDasha.endLabel}, com ${activeSukshmaDasha.days.toFixed(2)} dias aproximados.`
                : "Sem Sukshma ativa derivada da Pratyantardasha atual.",
              confidence: activeSukshmaDasha ? 0.68 : 0.28,
              status: activeSukshmaDasha ? "implemented" : "placeholder",
              methodUsed: "vimshottari-primary-sublevels-v1",
            }
          ),
          createDatum(
            module,
            "Dasha",
            "Prana ativa",
            activePranaDasha && activePrimaryAntardasha && activePratyantardasha && activeSukshmaDasha
              ? `${activePrimaryAntardasha.mahaLord} / ${activePrimaryAntardasha.lord} / ${activePratyantardasha.lord} / ${activeSukshmaDasha.lord} / ${activePranaDasha.lord}`
              : "--",
            {
              technicalNotes: activePranaDasha
                ? `${activePranaDasha.startLabel} ate ${activePranaDasha.endLabel}, com ${((activePranaDasha.days * 24) || 0).toFixed(2)} horas aproximadas.`
                : "Sem Prana ativa derivada da Sukshma atual.",
              confidence: activePranaDasha ? 0.6 : 0.24,
              status: activePranaDasha ? "implemented" : "placeholder",
              methodUsed: "vimshottari-primary-sublevels-v1",
            }
          ),
        ],
        tables: [
          createTable(
            `${module}-pratyantardasha`,
            "Pratyantardasha da Antardasha ativa",
            ["Maha", "Antara", "Pratyantara", "Inicio UTC", "Fim UTC", "Dias", "Ativa"],
            pratyantardashas.map((period) => [
              activePrimaryAntardasha?.mahaLord ?? "--",
              activePrimaryAntardasha?.lord ?? "--",
              period.lord,
              period.startLabel,
              period.endLabel,
              period.days.toFixed(2),
              boolLabel(period.active),
            ]),
            "A malha fina parte do inicio diario da Antardasha ativa e preserva o encadeamento classico do Vimshottari."
          ),
          createTable(
            `${module}-sukshma-dasha`,
            "Sukshma da Pratyantardasha ativa",
            ["Maha", "Antara", "Pratyantara", "Sukshma", "Inicio UTC", "Fim UTC", "Dias", "Ativa"],
            sukshmaDashas.map((period) => [
              activePrimaryAntardasha?.mahaLord ?? "--",
              activePrimaryAntardasha?.lord ?? "--",
              activePratyantardasha?.lord ?? "--",
              period.lord,
              period.startLabel,
              period.endLabel,
              period.days.toFixed(2),
              boolLabel(period.active),
            ]),
            "O desdobramento fino herda a resolucao diaria do snapshot primario; use-o como trilha auditavel, nao como carimbo de minuto."
          ),
          createTable(
            `${module}-prana-dasha`,
            "Prana da Sukshma ativa",
            ["Maha", "Antara", "Pratyantara", "Sukshma", "Prana", "Inicio UTC", "Fim UTC", "Horas", "Ativa"],
            pranaDashas.map((period) => [
              activePrimaryAntardasha?.mahaLord ?? "--",
              activePrimaryAntardasha?.lord ?? "--",
              activePratyantardasha?.lord ?? "--",
              activeSukshmaDasha?.lord ?? "--",
              period.lord,
              period.startLabel,
              period.endLabel,
              (period.days * 24).toFixed(2),
              boolLabel(period.active),
            ]),
            "A camada Prana e mostrada em horas aproximadas para nao esconder o estreitamento real dos subperiodos."
          ),
        ],
      }),
      selectedSecondarySection,
      comparisonSection,
    ],
  };
}
