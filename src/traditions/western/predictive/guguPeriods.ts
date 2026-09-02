import { DOMICILE_RULER } from "@/app/lib/traditionalTables";
import { normalize360, signName } from "./predictiveAstronomy";
import type {
  GuguPeriodDossier,
  GuguPeriodLevel,
  GuguPeriodSegment,
  GuguSubdivisionCoverage,
} from "./predictiveTypes";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/**
 * Source-locked lesser-period values recovered from Luiz Gonzaga de Carvalho
 * Neto, Curso de Cosmologia e Astrologia Medieval 04.
 *
 * Years are symbolic 360-day years; months are 30-day months. The same
 * planetary numbers are reused at month/day/hour scales.
 */
export const GUGU_PLANETARY_PERIOD_VALUES: Readonly<Record<string, number>> = Object.freeze({
  Lua: 25,
  Sol: 19,
  Mercúrio: 20,
  Vênus: 8,
  Marte: 15,
  Júpiter: 12,
  Saturno: 30,
});

function valueForRuler(ruler: string): number {
  const value = GUGU_PLANETARY_PERIOD_VALUES[ruler];
  if (!value) throw new Error(`Regente sem valor de período Gugu source-locked: ${ruler}`);
  return value;
}

function durationMs(level: GuguPeriodLevel, ruler: string): number {
  const units = valueForRuler(ruler);
  switch (level) {
    case "major-years": return units * 360 * DAY_MS;
    case "minor-months": return units * 30 * DAY_MS;
    case "micro-days": return units * DAY_MS;
    case "micro-hours": return units * HOUR_MS;
  }
}

function segment(
  level: GuguPeriodLevel,
  signIndex: number,
  startMs: number,
  parentRuler: string | undefined,
  zodiacCycle: number,
  sequenceIndex: number,
  parentEndMs?: number,
): GuguPeriodSegment {
  const normalizedSign = ((signIndex % 12) + 12) % 12;
  const ruler = DOMICILE_RULER[normalizedSign];
  const rawEndMs = startMs + durationMs(level, ruler);
  const endMs = parentEndMs === undefined ? rawEndMs : Math.min(rawEndMs, parentEndMs);
  return {
    level,
    signIndex: normalizedSign,
    sign: signName(normalizedSign * 30),
    ruler,
    parentRuler,
    planetaryNumber: valueForRuler(ruler),
    startUtcIso: new Date(startMs).toISOString(),
    endUtcIso: new Date(endMs).toISOString(),
    exactDurationSeconds: Math.max(0, (endMs - startMs) / 1000),
    zodiacCycle,
    sequenceIndex,
    truncatedByParent: parentEndMs !== undefined && rawEndMs > parentEndMs,
  };
}

function segmentStartMs(item: GuguPeriodSegment): number { return Date.parse(item.startUtcIso); }
function segmentEndMs(item: GuguPeriodSegment): number { return Date.parse(item.endUtcIso); }
function contains(item: GuguPeriodSegment, targetMs: number): boolean {
  return targetMs >= segmentStartMs(item) && targetMs < segmentEndMs(item);
}

function buildMajorTimeline(birthMs: number, ascSignIndex: number, targetMs: number): GuguPeriodSegment[] {
  const timeline: GuguPeriodSegment[] = [];
  let cursor = birthMs;
  let sequenceIndex = 0;
  // One zodiacal cycle already covers more than a century. Continue only if
  // the target requires it; this is a mechanical continuation of "segue a
  // sequência dos signos" and every segment records its zodiacCycle.
  while (cursor <= targetMs && sequenceIndex < 120) {
    const signIndex = (ascSignIndex + sequenceIndex) % 12;
    const item = segment("major-years", signIndex, cursor, undefined, Math.floor(sequenceIndex / 12), sequenceIndex);
    timeline.push(item);
    cursor = segmentEndMs(item);
    sequenceIndex += 1;
  }
  if (!timeline.some((item) => contains(item, targetMs))) {
    const signIndex = (ascSignIndex + sequenceIndex) % 12;
    timeline.push(segment("major-years", signIndex, cursor, undefined, Math.floor(sequenceIndex / 12), sequenceIndex));
  }
  return timeline;
}

function buildZodiacSubdivision(parent: GuguPeriodSegment, level: Exclude<GuguPeriodLevel, "major-years">, targetMs: number): GuguSubdivisionCoverage {
  const items: GuguPeriodSegment[] = [];
  const parentEnd = segmentEndMs(parent);
  let cursor = segmentStartMs(parent);
  let sequenceIndex = 0;
  while (cursor < parentEnd && sequenceIndex < 240) {
    const item = segment(
      level,
      parent.signIndex + sequenceIndex,
      cursor,
      parent.ruler,
      Math.floor(sequenceIndex / 12),
      sequenceIndex,
      parentEnd,
    );
    items.push(item);
    cursor = segmentEndMs(item);
    sequenceIndex += 1;
    if (item.truncatedByParent) break;
  }
  const active = items.find((item) => contains(item, targetMs));
  if (!active) throw new Error(`Gugu periods: active ${level} subdivision was not resolved inside parent.`);
  const firstCycle = items.filter((item) => item.zodiacCycle === 0);
  const firstCycleEndMs = firstCycle.length ? segmentEndMs(firstCycle[firstCycle.length - 1]) : segmentStartMs(parent);
  return {
    status: "SOURCE_LOCKED_ZODIAC_SEQUENCE_CONTINUED",
    active,
    timeline: items,
    firstCycle,
    firstCycleEndUtcIso: new Date(firstCycleEndMs).toISOString(),
    cyclesTraversed: Math.max(...items.map((item) => item.zodiacCycle)) + 1,
  };
}

function boundary(item: GuguPeriodSegment, targetMs: number) {
  const start = segmentStartMs(item);
  const end = segmentEndMs(item);
  return {
    level: item.level,
    ruler: item.ruler,
    sign: item.sign,
    elapsedDays: (targetMs - start) / DAY_MS,
    remainingDays: (end - targetMs) / DAY_MS,
    nearestBoundaryDistanceDays: Math.min(Math.abs(targetMs - start), Math.abs(end - targetMs)) / DAY_MS,
    noAuthorialBoundaryOrb: true as const,
  };
}

export function calculateGuguPlanetaryPeriods(
  birthMs: number,
  targetMs: number,
  natalAscendantLongitude: number,
): GuguPeriodDossier {
  if (targetMs < birthMs) throw new Error("Gugu periods: target before birth is unsupported.");
  const ascSignIndex = Math.floor(normalize360(natalAscendantLongitude) / 30);
  const majorTimeline = buildMajorTimeline(birthMs, ascSignIndex, targetMs);
  const activeMajor = majorTimeline.find((item) => contains(item, targetMs));
  if (!activeMajor) throw new Error("Gugu periods: active major period was not resolved.");

  const minor = buildZodiacSubdivision(activeMajor, "minor-months", targetMs);
  const day = buildZodiacSubdivision(minor.active, "micro-days", targetMs);
  const hour = buildZodiacSubdivision(day.active, "micro-hours", targetMs);

  return {
    method: "gugu-zodiacal-planetary-periods",
    sourceIds: [
      "GUGU_COSMOLOGY04_PERIOD_VALUES",
      "GUGU_COSMOLOGY04_ZODIAC_SEQUENCE",
      "GUGU_COSMOLOGY04_SUBDIVISIONS",
      "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION",
    ],
    natalAscendantLongitude,
    natalAscendantSign: signName(natalAscendantLongitude),
    startsFromAscendantSign: true,
    units: {
      majorYearDays: 360,
      monthDays: 30,
      samePlanetaryNumberAtAllLevels: true,
    },
    planetaryValues: { ...GUGU_PLANETARY_PERIOD_VALUES },
    majorTimeline,
    activeMajor,
    minor,
    day,
    hour,
    activePath: [activeMajor, minor.active, day.active, hour.active],
    boundaryEvidence: [activeMajor, minor.active, day.active, hour.active].map((item) => boundary(item, targetMs)),
    interpretiveMechanics: {
      receiverHasGreaterWeight: true,
      compareNaturalRelationshipOfPeriodLords: true,
      compareNatalConditionOfPeriodLords: true,
      smallerScalesHaveLowerLifeSignificance: true,
      transitsDoNotPredictEventsAutonomously: true,
      noAggregateScore: true,
    },
  };
}
