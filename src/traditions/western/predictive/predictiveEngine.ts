import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import { calculateNatalAnalysis } from "@/app/lib/natalAnalysis";
import { calculateNatalPrecision } from "@/app/lib/natalPrecision";
import { buildNatalAiStructuredForm, containsAuditOnlyNumericKeys, findAiUnsafeStarContacts } from "@/app/lib/natalAiForm";
import { generateNatalTechnicalReport } from "@/app/lib/natalTechnicalReport";
import { validateNatalProductionOutput } from "@/app/lib/natalProductionValidation";
import { DOMICILE_RULER, LILLY_TERMS, EXALTATION, DETRIMENT, FALL, TRIPLICITY_RULERS, SIGN_ELEMENT, FACES } from "@/app/lib/traditionalTables";
import type { BirthChart, BirthDate, Planet, SelectedCity } from "@/interfaces/BirthChartInterfaces";
import {
  birthDateToUtcMs,
  completedAgeAtTarget,
  calculatePredictiveSky,
  calculateNaibodProgressedHouses,
  circularDistance,
  essentialCondition,
  findNextSignIngress,
  findPreviousSignIngress,
  findPreviousLongitudeReturn,
  houseIndexFromCusps,
  normalize360,
  rulerForLongitude,
  signName,
  signedAngularDelta,
} from "./predictiveAstronomy";
import { calculateGuguPlanetaryPeriods } from "./guguPeriods";
import { calculatePredictiveFixedStarContacts, calculatePredictiveFixedStarTargets } from "./predictiveFixedStars";
import { PREDICTIVE_SOURCES } from "./predictiveSources";
import type {
  ConvergenceItem,
  EssentialConditionSnapshot,
  GuguPeriodDossier,
  GuguPeriodLordCondition,
  PredictiveAspectName,
  PredictiveAuthorFallback,
  PredictiveAuthorMode,
  PredictiveContact,
  PredictiveEngineResult,
  PredictiveFixedStarContact,
  PredictiveInput,
  PredictivePoint,
  ProgressionWindowEvent,
  ProgressionWindowTimeline,
  PredictiveSkySnapshot,
  ProfectionDossier,
  ReturnDossier,
  ReturnHouseRulerContact,
  ReturnHouseRulerEvidence,
  ReturnLotEvidence,
  ReturnReceptionEvidence,
  ReturnLocationPolicy,
  TransitDossier,
} from "./predictiveTypes";
import { generatePredictiveReport } from "./predictiveReport";
import { buildPredictiveAiJudgmentContract, PREDICTIVE_ABSOLUTE_PROMPT_PTBR } from "./predictiveAiContract";

const DAY_MS = 86_400_000;
const TROPICAL_YEAR_DAYS = 365.2425;
const ACTIVE_SCREENING_DEG = 1;
const ASPECTS: Array<{ name: PredictiveAspectName; angle: number }> = [
  { name: "conjunction", angle: 0 },
  { name: "sextile", angle: 60 },
  { name: "square", angle: 90 },
  { name: "trine", angle: 120 },
  { name: "opposition", angle: 180 },
];

function includesMarcos(mode: PredictiveAuthorMode): boolean {
  return mode === "marcos" || mode === "combined" || mode === "integrated";
}
function includesFrawley(mode: PredictiveAuthorMode): boolean {
  return mode === "frawley" || mode === "combined" || mode === "integrated";
}
function includesGugu(mode: PredictiveAuthorMode): boolean {
  return mode === "gugu" || mode === "integrated";
}
function includesMainPredictiveStack(mode: PredictiveAuthorMode): boolean {
  return mode !== "gugu";
}

function radixPoints(chart: BirthChart, houseSystem: "R" | "P" = "R"): PredictivePoint[] {
  const houseSnapshot = houseSystem === "P" ? chart.housesData.variants?.placidus : undefined;
  const cusps = houseSnapshot?.cusps ?? chart.housesData.house;
  const asc = houseSnapshot?.ascendant ?? chart.housesData.ascendant;
  const mc = houseSnapshot?.mc ?? chart.housesData.mc;
  const planets = chart.planets
    .filter((planet) => ["Sol", "Lua", "Mercúrio", "Vênus", "Marte", "Júpiter", "Saturno"].includes(planet.name))
    .map((planet): PredictivePoint => ({
      key: planet.type,
      name: planet.name,
      kind: "planet",
      longitude: planet.longitudeRaw,
      sign: planet.sign,
      house: houseIndexFromCusps(planet.longitudeRaw, cusps),
      speed: planet.longitudeSpeed,
      retrograde: planet.isRetrograde,
    }));
  const dsc = normalize360(asc + 180);
  const ic = normalize360(mc + 180);
  const nodes = chart.planets
    .filter((planet) => planet.type === "northNode" || planet.type === "southNode")
    .map((planet): PredictivePoint => ({ key: planet.type, name: planet.name, kind: "node", longitude: planet.longitudeRaw, sign: planet.sign, house: houseIndexFromCusps(planet.longitudeRaw, cusps), speed: planet.longitudeSpeed, retrograde: planet.isRetrograde }));
  const angles: PredictivePoint[] = [
    { key: "asc", name: "ASC", kind: "angle", longitude: asc, sign: signName(asc), house: 1 },
    { key: "dsc", name: "DSC", kind: "angle", longitude: dsc, sign: signName(dsc), house: 7 },
    { key: "mc", name: "MC", kind: "angle", longitude: mc, sign: signName(mc), house: 10 },
    { key: "ic", name: "IC", kind: "angle", longitude: ic, sign: signName(ic), house: 4 },
  ];
  return [...planets, ...nodes, ...angles];
}

function radixCusps(chart: BirthChart, houseSystem: "R" | "P" = "R", label?: string): PredictivePoint[] {
  const cusps = houseSystem === "P" ? (chart.housesData.variants?.placidus.cusps ?? chart.housesData.house) : chart.housesData.house;
  return cusps.map((longitude, index) => ({
    key: `cusp-${index + 1}`,
    name: `Cúspide ${index + 1}${label ? ` [${label}]` : ""}`,
    kind: "cusp",
    longitude,
    sign: signName(longitude),
  }));
}

function lotPoint(key: string, name: string, longitude: number): PredictivePoint {
  return { key, name, kind: "lot", longitude: normalize360(longitude), sign: signName(longitude) };
}

function termRulerAt(longitude: number): string | undefined {
  const normalized = normalize360(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return LILLY_TERMS[signIndex]?.find((item) => degree < item.endDeg)?.ruler;
}

function separation(first: number, second: number): number {
  return circularDistance(first, second);
}

function contactForAspect(moving: PredictivePoint, target: PredictivePoint, aspect: { name: PredictiveAspectName; angle: number }): PredictiveContact {
  const sep = separation(moving.longitude, target.longitude);
  const distanceToExact = Math.abs(sep - aspect.angle);
  const applying = moving.speed === undefined
    ? undefined
    : (() => {
        const futureLon = normalize360(moving.longitude + moving.speed * 0.01);
        const futureSep = separation(futureLon, target.longitude);
        return Math.abs(futureSep - aspect.angle) < distanceToExact;
      })();
  return {
    moving: moving.name,
    target: target.name,
    aspect: aspect.name,
    exactAngle: aspect.angle,
    separation: sep,
    distanceToExact,
    movingLongitude: moving.longitude,
    targetLongitude: target.longitude,
    applying,
    operationallyActive: distanceToExact <= ACTIVE_SCREENING_DEG,
    operationalGateDeg: ACTIVE_SCREENING_DEG,
    gateProvenance: "ENGINE_SCREENING_NOT_AUTHORIAL_ORB",
  };
}

function nearestContact(moving: PredictivePoint, target: PredictivePoint, allowed: PredictiveAspectName[] = ASPECTS.map((item) => item.name)): PredictiveContact {
  return ASPECTS
    .filter((aspect) => allowed.includes(aspect.name))
    .map((aspect) => contactForAspect(moving, target, aspect))
    .sort((a, b) => a.distanceToExact - b.distanceToExact)[0];
}

function matrixContacts(movingPoints: PredictivePoint[], targetPoints: PredictivePoint[], allowed?: PredictiveAspectName[]): PredictiveContact[] {
  return movingPoints.flatMap((moving) => targetPoints.map((target) => nearestContact(moving, target, allowed)));
}

function activeContacts(contacts: PredictiveContact[]): PredictiveContact[] {
  return contacts.filter((contact) => contact.operationallyActive);
}

function antiscionPoints(points: PredictivePoint[]): PredictivePoint[] {
  return points.map((point) => ({
    ...point,
    key: `${point.key}-antiscion`,
    name: `${point.name} (antíscio)`,
    longitude: normalize360(180 - point.longitude),
    sign: signName(normalize360(180 - point.longitude)),
  }));
}

function snapshotRadix(chart: BirthChart) {
  const all = radixPoints(chart);
  return {
    planets: all.filter((point) => point.kind === "planet"),
    nodes: all.filter((point) => point.kind === "node"),
    angles: all.filter((point) => point.kind === "angle"),
    cusps: radixCusps(chart),
  };
}

function sourceIdsForMode(mode: PredictiveAuthorMode, base: string[]): string[] {
  return base.filter((id) => {
    if (id.startsWith("MARCOS")) return includesMarcos(mode);
    if (id.startsWith("FRAWLEY")) return includesFrawley(mode);
    if (id.startsWith("GUGU")) return includesGugu(mode);
    if (id.startsWith("TRADITIONAL")) return mode !== "gugu";
    return true;
  });
}

function dignityMap(points: PredictivePoint[]): Map<string, EssentialConditionSnapshot> {
  return new Map(points.filter((point) => point.kind === "planet").map((point) => [point.name, essentialCondition(point)]));
}

function sameLocation(a: SelectedCity, b: SelectedCity): boolean {
  return Math.abs(a.latitude - b.latitude) < 1e-9 && Math.abs(a.longitude - b.longitude) < 1e-9 && (a.timezone ?? "") === (b.timezone ?? "");
}

function returnLocationPolicy(mode: PredictiveAuthorMode, hasAlternateEvent: boolean): ReturnLocationPolicy {
  if (includesMarcos(mode)) {
    return {
      primaryLocation: "birthplace",
      sourceIds: ["MARCOS_BOOK_SOLAR_RETURN_BIRTHPLACE"],
      rationale: "No perfil que inclui Marcos, o mapa principal de retorno usa o local natal. Quando o local do evento difere, o motor materializa também a geometria alternativa sem misturar as duas.",
      alternateEventLocationMaterialized: hasAlternateEvent,
    };
  }
  return {
    primaryLocation: "event-location",
    sourceIds: [],
    rationale: "Perfil Frawley: a localização fornecida é materializada como superfície operacional; a regra espacial específica permanece explicitamente sem source-lock neste corpus.",
    alternateEventLocationMaterialized: false,
  };
}

interface ReturnLotSeed {
  id: string;
  lotKey: string;
  variant: ReturnLotEvidence["variant"];
  label: string;
  point: PredictivePoint;
  sourceIds: string[];
  formula: string;
}

function houseClassFor(house?: number): "angular" | "succedent" | "cadent" | undefined {
  if (!house) return undefined;
  if ([1, 4, 7, 10].includes(house)) return "angular";
  if ([2, 5, 8, 11].includes(house)) return "succedent";
  return "cadent";
}

function movingPairContactForAspect(first: PredictivePoint, second: PredictivePoint, aspect: { name: PredictiveAspectName; angle: number }): PredictiveContact {
  const sep = separation(first.longitude, second.longitude);
  const distanceToExact = Math.abs(sep - aspect.angle);
  const applying = first.speed === undefined || second.speed === undefined
    ? undefined
    : (() => {
        const futureFirst = normalize360(first.longitude + first.speed * 0.01);
        const futureSecond = normalize360(second.longitude + second.speed * 0.01);
        return Math.abs(separation(futureFirst, futureSecond) - aspect.angle) < distanceToExact;
      })();
  return {
    moving: first.name,
    target: second.name,
    aspect: aspect.name,
    exactAngle: aspect.angle,
    separation: sep,
    distanceToExact,
    movingLongitude: first.longitude,
    targetLongitude: second.longitude,
    applying,
    operationallyActive: distanceToExact <= ACTIVE_SCREENING_DEG,
    operationalGateDeg: ACTIVE_SCREENING_DEG,
    gateProvenance: "ENGINE_SCREENING_NOT_AUTHORIAL_ORB",
  };
}

function nearestMovingPairContact(first: PredictivePoint, second: PredictivePoint, allowed: PredictiveAspectName[] = ASPECTS.map((item) => item.name)): PredictiveContact {
  return ASPECTS
    .filter((aspect) => allowed.includes(aspect.name))
    .map((aspect) => movingPairContactForAspect(first, second, aspect))
    .sort((a, b) => a.distanceToExact - b.distanceToExact)[0];
}

function pairContacts(points: PredictivePoint[], allowed?: PredictiveAspectName[]): PredictiveContact[] {
  return points.flatMap((first, index) => points.slice(index + 1).map((second) => nearestMovingPairContact(first, second, allowed)));
}

function returnIsDay(sky: PredictiveSkySnapshot): boolean {
  const sun = sky.planets.find((point) => point.name === "Sol");
  return Boolean(sun?.house && sun.house >= 7 && sun.house <= 12);
}

function receptionsForPoint(point: PredictivePoint, isDay: boolean): ReturnReceptionEvidence[] {
  if (point.kind !== "planet") return [];
  const signIndex = Math.floor(normalize360(point.longitude) / 30) % 12;
  const degree = normalize360(point.longitude) % 30;
  const evidence: ReturnReceptionEvidence[] = [];
  const add = (receiver: string | undefined, by: ReturnReceptionEvidence["by"], polarity: ReturnReceptionEvidence["polarity"]) => {
    if (!receiver) return;
    evidence.push({ guest: point.name, receiver, by, polarity, guestLongitude: point.longitude, guestSign: point.sign });
  };
  add(DOMICILE_RULER[signIndex], "domicile", "positive");
  add(Object.entries(EXALTATION).find(([, value]) => value === signIndex)?.[0], "exaltation", "positive");
  const triplicity = TRIPLICITY_RULERS[SIGN_ELEMENT[signIndex]];
  add(isDay ? triplicity?.day : triplicity?.night, "triplicity", "positive");
  add(LILLY_TERMS[signIndex]?.find((item) => degree < item.endDeg)?.ruler, "term", "positive");
  add(FACES[signIndex]?.[Math.min(2, Math.floor(degree / 10))], "face", "positive");
  for (const [receiver, signs] of Object.entries(DETRIMENT)) if (signs.includes(signIndex)) add(receiver, "detriment", "negative");
  add(Object.entries(FALL).find(([, value]) => value === signIndex)?.[0], "fall", "negative");
  return evidence;
}

function receptionKey(item: ReturnReceptionEvidence): string {
  return `${item.guest}|${item.receiver}|${item.by}|${item.polarity}`;
}

function receptionLedger(points: PredictivePoint[], isDay: boolean): ReturnReceptionEvidence[] {
  return points.flatMap((point) => receptionsForPoint(point, isDay));
}

function receptionChanges(natal: ReturnReceptionEvidence[], ret: ReturnReceptionEvidence[]) {
  const natalKeys = new Set(natal.map(receptionKey));
  const returnKeys = new Set(ret.map(receptionKey));
  const byKey = new Map<string, ReturnReceptionEvidence>();
  for (const item of [...natal, ...ret]) byKey.set(receptionKey(item), item);
  return [...byKey.entries()].map(([key, item]) => ({
    guest: item.guest,
    receiver: item.receiver,
    by: item.by,
    polarity: item.polarity,
    natalPresent: natalKeys.has(key),
    returnPresent: returnKeys.has(key),
    changed: natalKeys.has(key) !== returnKeys.has(key),
  }));
}

function fortuneFromSky(sky: PredictiveSkySnapshot): PredictivePoint {
  const asc = sky.angles.find((point) => point.name === "ASC")?.longitude;
  const sun = sky.planets.find((point) => point.name === "Sol")?.longitude;
  const moon = sky.planets.find((point) => point.name === "Lua")?.longitude;
  if (asc === undefined || sun === undefined || moon === undefined) throw new Error("Céu sem ASC/Sol/Lua para Parte da Fortuna.");
  const fortune = normalize360(asc + moon - sun);
  return { ...lotPoint("fortune", "Parte da Fortuna", fortune), house: houseIndexFromCusps(fortune, sky.cusps.map((cusp) => cusp.longitude)) };
}

function marcosLotsFromSky(progressedSky: PredictiveSkySnapshot): PredictivePoint[] {
  const asc = progressedSky.angles.find((point) => point.name === "ASC")?.longitude;
  const sun = progressedSky.planets.find((point) => point.name === "Sol")?.longitude;
  const moon = progressedSky.planets.find((point) => point.name === "Lua")?.longitude;
  const mars = progressedSky.planets.find((point) => point.name === "Marte")?.longitude;
  const jupiter = progressedSky.planets.find((point) => point.name === "Júpiter")?.longitude;
  const saturn = progressedSky.planets.find((point) => point.name === "Saturno")?.longitude;
  if ([asc, sun, moon, mars, jupiter, saturn].some((value) => value === undefined)) return [];
  const fortune = fortuneFromSky(progressedSky).longitude;
  const spirit = normalize360(asc! + sun! - moon!);
  const necessity = normalize360(asc! + fortune - spirit);
  const love = normalize360(asc! + spirit - fortune);
  const valor = normalize360(asc! + fortune - mars!);
  const victory = normalize360(asc! + jupiter! - spirit);
  const captivity = normalize360(asc! + fortune - saturn!);
  return [
    lotPoint("fortune", "Parte da Fortuna", fortune),
    lotPoint("spirit", "Parte do Espírito", spirit),
    lotPoint("necessity", "Parte da Necessidade", necessity),
    lotPoint("love", "Parte do Amor", love),
    lotPoint("valor", "Parte do Valor/Coragem", valor),
    lotPoint("victory", "Parte da Vitória", victory),
    lotPoint("captivity", "Parte do Cativeiro", captivity),
  ].map((point) => ({ ...point, house: houseIndexFromCusps(point.longitude, progressedSky.cusps.map((cusp) => cusp.longitude)) }));
}


async function calculateSecondaryProgressedSkyAtCivilMs(
  birthMs: number,
  civilMs: number,
  birthDate: BirthDate,
  birthChart: BirthChart,
  houseSystemCode: "R" | "P",
): Promise<{ ageYears: number; symbolicMs: number; sky: PredictiveSkySnapshot; arcDegrees: number }> {
  const ageYears = (civilMs - birthMs) / (TROPICAL_YEAR_DAYS * DAY_MS);
  const symbolicMs = birthMs + ageYears * DAY_MS;
  const symbolicSkyRaw = await calculatePredictiveSky(symbolicMs, birthDate.coordinates, houseSystemCode);
  const natalArmc = houseSystemCode === "P"
    ? (birthChart.housesData.variants?.placidus.armc ?? birthChart.housesData.armc)
    : birthChart.housesData.armc;
  const progressedGeometry = await calculateNaibodProgressedHouses(
    birthMs,
    ageYears,
    birthDate.coordinates,
    houseSystemCode,
    natalArmc,
  );
  const progressedDsc = normalize360(progressedGeometry.asc + 180);
  const progressedIc = normalize360(progressedGeometry.mc + 180);
  const progressedAngles: PredictivePoint[] = [
    { key: "asc", name: "ASC", kind: "angle", longitude: progressedGeometry.asc, sign: signName(progressedGeometry.asc), house: 1 },
    { key: "dsc", name: "DSC", kind: "angle", longitude: progressedDsc, sign: signName(progressedDsc), house: 7 },
    { key: "mc", name: "MC", kind: "angle", longitude: progressedGeometry.mc, sign: signName(progressedGeometry.mc), house: 10 },
    { key: "ic", name: "IC", kind: "angle", longitude: progressedIc, sign: signName(progressedIc), house: 4 },
  ];
  const progressedCusps: PredictivePoint[] = progressedGeometry.cusps.map((longitude, index) => ({
    key: `cusp-${index + 1}`,
    name: `Cúspide ${index + 1} progredida`,
    kind: "cusp",
    longitude,
    sign: signName(longitude),
    house: index + 1,
  }));
  const progressedCuspLongitudes = progressedGeometry.cusps;
  const progressedPlanets = symbolicSkyRaw.planets.map((point) => ({
    ...point,
    house: houseIndexFromCusps(point.longitude, progressedCuspLongitudes),
  }));
  const progressedNodes = symbolicSkyRaw.nodes.map((point) => ({
    ...point,
    house: houseIndexFromCusps(point.longitude, progressedCuspLongitudes),
  }));
  return {
    ageYears,
    symbolicMs,
    arcDegrees: progressedGeometry.arcDegrees,
    sky: { ...symbolicSkyRaw, planets: progressedPlanets, nodes: progressedNodes, angles: progressedAngles, cusps: progressedCusps },
  };
}

function progressionMoversForMode(sky: PredictiveSkySnapshot, mode: PredictiveAuthorMode): {
  movingPoints: PredictivePoint[];
  primaryDirectors: PredictivePoint[];
  progressedLots: PredictivePoint[];
} {
  const lots = marcosLotsFromSky(sky);
  const fortune = lots.find((point) => point.key === "fortune");
  const primaryDirectors = [
    sky.planets.find((point) => point.name === "Sol"),
    sky.planets.find((point) => point.name === "Lua"),
    sky.angles.find((point) => point.name === "ASC"),
    sky.angles.find((point) => point.name === "MC"),
    fortune,
  ].filter(Boolean) as PredictivePoint[];
  const progressedLots = includesMarcos(mode) ? lots : (fortune ? [fortune] : []);
  return {
    primaryDirectors,
    progressedLots,
    movingPoints: mode === "frawley" ? primaryDirectors : [...sky.planets, ...sky.angles, ...progressedLots],
  };
}

function timelineEventKey(event: ProgressionWindowEvent): string {
  return [event.kind, event.moving, event.target, event.aspect ?? "", event.fromValue ?? "", event.toValue ?? ""].join("|");
}

function dedupeTimelineEvents(events: ProgressionWindowEvent[]): ProgressionWindowEvent[] {
  const sorted = [...events].sort((a, b) => Date.parse(a.perfectionUtcIso) - Date.parse(b.perfectionUtcIso) || timelineEventKey(a).localeCompare(timelineEventKey(b)));
  const out: ProgressionWindowEvent[] = [];
  for (const event of sorted) {
    const previous = out[out.length - 1];
    if (previous && timelineEventKey(previous) === timelineEventKey(event) && Math.abs(Date.parse(previous.perfectionUtcIso) - Date.parse(event.perfectionUtcIso)) < 6 * 60 * 60 * 1000) continue;
    out.push(event);
  }
  return out;
}

async function buildProgressionWindowTimeline(args: {
  mode: PredictiveAuthorMode;
  birthMs: number;
  birthDate: BirthDate;
  birthChart: BirthChart;
  houseSystemCode: "R" | "P";
  startMs: number;
  endMs: number;
  targets: PredictivePoint[];
  includeFixedStars: boolean;
}): Promise<ProgressionWindowTimeline> {
  const { mode, birthMs, birthDate, birthChart, houseSystemCode, startMs, endMs, targets, includeFixedStars } = args;
  const cache = new Map<number, Promise<{ civilMs: number; symbolicMs: number; sky: PredictiveSkySnapshot; movingPoints: PredictivePoint[]; primaryDirectors: PredictivePoint[] }>>();
  const stateAt = (civilMsInput: number) => {
    const civilMs = Math.max(startMs, Math.min(endMs, Math.round(civilMsInput)));
    let cached = cache.get(civilMs);
    if (!cached) {
      cached = (async () => {
        const progressed = await calculateSecondaryProgressedSkyAtCivilMs(birthMs, civilMs, birthDate, birthChart, houseSystemCode);
        const movers = progressionMoversForMode(progressed.sky, mode);
        return { civilMs, symbolicMs: progressed.symbolicMs, sky: progressed.sky, movingPoints: movers.movingPoints, primaryDirectors: movers.primaryDirectors };
      })();
      cache.set(civilMs, cached);
    }
    return cached;
  };
  const pointAt = async (civilMs: number, movingName: string, antiscion = false): Promise<{ longitude: number; symbolicMs: number; kind: PredictivePoint["kind"] }> => {
    const state = await stateAt(civilMs);
    const point = state.movingPoints.find((item) => item.name === movingName);
    if (!point) throw new Error(`Ponto progredido ausente na timeline: ${movingName}`);
    const longitude = antiscion ? normalize360(180 - point.longitude) : point.longitude;
    return { longitude, symbolicMs: state.symbolicMs, kind: point.kind };
  };
  const signedError = async (civilMs: number, movingName: string, targetLongitude: number, aspect: "conjunction" | "opposition", antiscion = false) => {
    const point = await pointAt(civilMs, movingName, antiscion);
    const exactTarget = normalize360(targetLongitude + (aspect === "opposition" ? 180 : 0));
    return signedAngularDelta(point.longitude - exactTarget);
  };
  const refineRoot = async (loInput: number, hiInput: number, errorFn: (t: number) => Promise<number>) => {
    let lo = loInput; let hi = hiInput;
    let elo = await errorFn(lo); let ehi = await errorFn(hi);
    for (let i = 0; i < 42 && hi - lo > 250; i += 1) {
      const mid = (lo + hi) / 2;
      const emid = await errorFn(mid);
      if (Math.abs(emid) < 1e-10) { lo = mid; hi = mid; elo = emid; ehi = emid; break; }
      if (elo === 0 || Math.sign(elo) !== Math.sign(emid)) { hi = mid; ehi = emid; }
      else { lo = mid; elo = emid; }
    }
    const t = (lo + hi) / 2;
    const residual = Math.abs(await errorFn(t));
    void ehi;
    return { t, residual };
  };
  const crossingBracket = (a: number, b: number) => (a === 0 || b === 0 || (Math.sign(a) !== Math.sign(b) && Math.max(Math.abs(a), Math.abs(b)) < 90));

  const stepMs = 2 * DAY_MS;
  const sampleTimes: number[] = [];
  for (let t = startMs; t < endMs; t += stepMs) sampleTimes.push(t);
  if (!sampleTimes.length || sampleTimes[sampleTimes.length - 1] !== endMs) sampleTimes.push(endMs);
  const samples = await Promise.all(sampleTimes.map((t) => stateAt(t)));
  const moverNames = samples[0]?.movingPoints.map((point) => point.name) ?? [];
  const primaryNames = new Set(samples[0]?.primaryDirectors.map((point) => point.name) ?? []);
  const movingKind = new Map(samples[0]?.movingPoints.map((point) => [point.name, point.kind]) ?? []);
  const longitudeFromSample = (sampleIndex: number, name: string, antiscion = false) => {
    const point = samples[sampleIndex].movingPoints.find((item) => item.name === name);
    if (!point) throw new Error(`Ponto ${name} ausente na amostra de progressão.`);
    return antiscion ? normalize360(180 - point.longitude) : point.longitude;
  };
  const eligibility = (moving: string, kind: ProgressionWindowEvent["kind"]) => ({
    marcos: includesMarcos(mode) && (kind !== "term-ingress"),
    frawley: includesFrawley(mode) && primaryNames.has(moving) && kind !== "antiscion-contact",
    note: kind === "antiscion-contact"
      ? "Antíscio progressivo source-locked nos exemplos Marcos; não é promovido a regra Frawley sem fonte específica."
      : primaryNames.has(moving)
        ? "O ponto também pertence aos cinco diretores principais publicados por Frawley quando esse autor está ativo."
        : "Evidência da malha Marcos; não recebe automaticamente elegibilidade Frawley.",
  });

  const directEvents: ProgressionWindowEvent[] = [];
  const antiscionEvents: ProgressionWindowEvent[] = [];
  for (const moving of moverNames) {
    for (const target of targets) {
      if (moving === target.name) continue;
      for (const aspect of ["conjunction", "opposition"] as const) {
        for (const antiscion of [false, true]) {
          for (let i = 0; i < samples.length - 1; i += 1) {
            const exactTarget = normalize360(target.longitude + (aspect === "opposition" ? 180 : 0));
            const e0 = signedAngularDelta(longitudeFromSample(i, moving, antiscion) - exactTarget);
            const e1 = signedAngularDelta(longitudeFromSample(i + 1, moving, antiscion) - exactTarget);
            if (!crossingBracket(e0, e1)) continue;
            const root = await refineRoot(samples[i].civilMs, samples[i + 1].civilMs, (t) => signedError(t, moving, target.longitude, aspect, antiscion));
            const point = await pointAt(root.t, moving, antiscion);
            const event: ProgressionWindowEvent = {
              kind: antiscion ? "antiscion-contact" : "direct-contact",
              moving,
              movingKind: movingKind.get(moving) ?? "planet",
              target: target.name,
              targetKind: target.kind,
              aspect,
              perfectionUtcIso: new Date(root.t).toISOString(),
              symbolicUtcIso: new Date(point.symbolicMs).toISOString(),
              residualDeg: root.residual,
              sourceIds: antiscion
                ? sourceIdsForMode(mode, ["MARCOS_PROGRESSIONS_PARTS_ANTISCIA_EXAMPLES"])
                : sourceIdsForMode(mode, ["MARCOS_BOOK_CH22_SECONDARY", "MARCOS_2026_PROGRESSIONS_CONJ_OPP", "FRAWLEY_FIVE_PRIMARY_DIRECTORS"]),
              authorEligibility: eligibility(moving, antiscion ? "antiscion-contact" : "direct-contact"),
            };
            (antiscion ? antiscionEvents : directEvents).push(event);
          }
        }
      }
    }
  }

  const signIngressEvents: ProgressionWindowEvent[] = [];
  const termIngressEvents: ProgressionWindowEvent[] = [];
  for (const moving of moverNames) {
    for (let i = 0; i < samples.length - 1; i += 1) {
      const l0 = longitudeFromSample(i, moving);
      const l1 = longitudeFromSample(i + 1, moving);
      const sign0 = Math.floor(normalize360(l0) / 30);
      const sign1 = Math.floor(normalize360(l1) / 30);
      if (sign0 !== sign1) {
        let lo = samples[i].civilMs; let hi = samples[i + 1].civilMs;
        for (let j = 0; j < 42 && hi - lo > 250; j += 1) {
          const mid = (lo + hi) / 2;
          const point = await pointAt(mid, moving);
          if (Math.floor(normalize360(point.longitude) / 30) === sign0) lo = mid; else hi = mid;
        }
        const root = (lo + hi) / 2;
        const point = await pointAt(root, moving);
        signIngressEvents.push({
          kind: "sign-ingress", moving, movingKind: movingKind.get(moving) ?? "planet", target: signName(point.longitude), targetKind: "sign",
          perfectionUtcIso: new Date(root).toISOString(), symbolicUtcIso: new Date(point.symbolicMs).toISOString(), residualDeg: 0,
          fromValue: signName(l0), toValue: signName(l1),
          sourceIds: sourceIdsForMode(mode, ["FRAWLEY_CURRENT_NATAL_PREDICTION", "MARCOS_BOOK_CH22_SECONDARY"]),
          authorEligibility: eligibility(moving, "sign-ingress"),
        });
      }
      if (primaryNames.has(moving)) {
        const key0 = `${sign0}:${termRulerAt(l0) ?? "?"}`;
        const key1 = `${sign1}:${termRulerAt(l1) ?? "?"}`;
        if (key0 !== key1) {
          let lo = samples[i].civilMs; let hi = samples[i + 1].civilMs;
          for (let j = 0; j < 42 && hi - lo > 250; j += 1) {
            const mid = (lo + hi) / 2;
            const point = await pointAt(mid, moving);
            const signMid = Math.floor(normalize360(point.longitude) / 30);
            const keyMid = `${signMid}:${termRulerAt(point.longitude) ?? "?"}`;
            if (keyMid === key0) lo = mid; else hi = mid;
          }
          const root = (lo + hi) / 2;
          const point = await pointAt(root, moving);
          termIngressEvents.push({
            kind: "term-ingress", moving, movingKind: movingKind.get(moving) ?? "planet", target: termRulerAt(point.longitude) ?? key1.split(":")[1], targetKind: "term",
            perfectionUtcIso: new Date(root).toISOString(), symbolicUtcIso: new Date(point.symbolicMs).toISOString(), residualDeg: 0,
            fromValue: key0.split(":")[1], toValue: key1.split(":")[1], sourceIds: sourceIdsForMode(mode, ["FRAWLEY_FIVE_PRIMARY_DIRECTORS"]),
            authorEligibility: eligibility(moving, "term-ingress"),
          });
        }
      }
    }
  }

  const fixedStarEvents: ProgressionWindowEvent[] = [];
  if (includeFixedStars && samples.length) {
    const midState = await stateAt((startMs + endMs) / 2);
    const starTargets = await calculatePredictiveFixedStarTargets(birthChart, midState.sky);
    for (const moving of moverNames) {
      const canMarcos = includesMarcos(mode);
      const canFrawley = includesFrawley(mode) && primaryNames.has(moving);
      if (!canMarcos && !canFrawley) continue;
      for (const star of starTargets) {
        for (let i = 0; i < samples.length - 1; i += 1) {
          const e0 = signedAngularDelta(longitudeFromSample(i, moving) - star.longitude);
          const e1 = signedAngularDelta(longitudeFromSample(i + 1, moving) - star.longitude);
          if (!crossingBracket(e0, e1)) continue;
          const root = await refineRoot(samples[i].civilMs, samples[i + 1].civilMs, async (t) => {
            const point = await pointAt(t, moving);
            return signedAngularDelta(point.longitude - star.longitude);
          });
          const rootState = await stateAt(root.t);
          const point = rootState.movingPoints.find((item) => item.name === moving)!;
          const exactStars = await calculatePredictiveFixedStarTargets(birthChart, rootState.sky);
          const exactStar = exactStars.find((item) => item.name === star.name) ?? star;
          fixedStarEvents.push({
            kind: "fixed-star-conjunction", moving, movingKind: point.kind, target: star.name, targetKind: "fixed-star", aspect: "conjunction",
            perfectionUtcIso: new Date(root.t).toISOString(), symbolicUtcIso: new Date(rootState.symbolicMs).toISOString(),
            residualDeg: circularDistance(point.longitude, exactStar.longitude),
            sourceIds: sourceIdsForMode(mode, ["MARCOS_FIXED_STARS_TEMPORAL_COURSE", "FRAWLEY_FIVE_PRIMARY_DIRECTORS"]),
            authorEligibility: {
              marcos: canMarcos,
              frawley: canFrawley,
              note: canFrawley ? "Conjunção exata de um dos cinco diretores Frawley com estrela; o evento exato dispensa inventar orbe universal." : "Conjunção temporal source-locked no perfil Marcos.",
            },
          });
        }
      }
    }
  }

  const direct = dedupeTimelineEvents(directEvents);
  const antiscia = dedupeTimelineEvents(antiscionEvents);
  const stars = dedupeTimelineEvents(fixedStarEvents);
  const terms = dedupeTimelineEvents(termIngressEvents);
  const signs = dedupeTimelineEvents(signIngressEvents);
  const allEvents = [...direct, ...antiscia, ...stars, ...terms, ...signs].sort((a, b) => Date.parse(a.perfectionUtcIso) - Date.parse(b.perfectionUtcIso));
  return {
    basis: "governing-solar-return-year",
    startUtcIso: new Date(startMs).toISOString(),
    endUtcIso: new Date(endMs).toISOString(),
    sampleCount: sampleTimes.length,
    directEvents: direct,
    antiscionEvents: antiscia,
    fixedStarEvents: stars,
    termIngressEvents: terms,
    signIngressEvents: signs,
    allEvents,
    note: "Linha do tempo calculada no ano da Revolução Solar governante. O tempo civil é convertido continuamente para a efeméride simbólica dia=ano; raízes de C/O e antíscios são refinadas numericamente. Mudanças de termo são materializadas para os cinco diretores Frawley. Estrelas são avaliadas na época progredida, com posição final recalculada no instante encontrado.",
  };
}

function buildReturnLotSeeds(kind: ReturnDossier["kind"], sky: PredictiveSkySnapshot, birthChart: BirthChart, natalAnalysis: ReturnType<typeof calculateNatalAnalysis>): ReturnLotSeed[] {
  if (kind !== "solar-return") return [];
  const natalLots = natalAnalysis.technicalForm.lots;
  const asc = sky.angles.find((point) => point.name === "ASC")?.longitude;
  if (asc === undefined || !natalLots.length) return [];
  const returnLots = new Map(marcosLotsFromSky(sky).map((point) => [point.key, point]));
  const cusps = sky.cusps.map((cusp) => cusp.longitude);
  const seeds: ReturnLotSeed[] = [];
  const mk = (id: string, lotKey: string, variant: ReturnLotEvidence["variant"], label: string, longitude: number, sourceIds: string[], formula: string): ReturnLotSeed => {
    const point = lotPoint(id, label, longitude);
    point.house = houseIndexFromCusps(point.longitude, cusps);
    return { id, lotKey, variant, label, point, sourceIds, formula };
  };
  for (const natalLot of natalLots) {
    const returnLot = returnLots.get(natalLot.key);
    const label = natalLot.name.startsWith("Parte") ? natalLot.name : `Parte ${natalLot.name}`;
    seeds.push(mk(`natal-${natalLot.key}`, natalLot.key, "natal-position", `${label} natal na Revolução`, natalLot.longitude, ["MARCOS_FORTUNE_TEMPORAL_CURRENT", "MARCOS_SOLAR_RETURN_PARTS_ARC_EXAMPLES"], "posição natal preservada e lida nas casas da Revolução"));
    if (returnLot) seeds.push(mk(`return-${natalLot.key}`, natalLot.key, "return-calculated", `${label} calculada da Revolução`, returnLot.longitude, ["MARCOS_SOLAR_RETURN_PARTS_ARC_EXAMPLES"], `recomputada pelos fatores da Revolução segundo a fórmula natal source-locked de ${label}`));
    seeds.push(mk(`natal-arc-${natalLot.key}`, natalLot.key, "natal-arc", `${label} por arco natal`, normalize360(asc + natalLot.longitude - birthChart.housesData.ascendant), ["MARCOS_FORTUNE_TEMPORAL_CURRENT", "MARCOS_SOLAR_RETURN_PARTS_ARC_EXAMPLES"], `ASC retorno + (${label} natal - ASC natal); preserva o arco natal da Parte no mapa separado`));
  }
  return seeds;
}

function buildHouseRulers(origin: ReturnHouseRulerEvidence["origin"], cusps: PredictivePoint[], sky: PredictiveSkySnapshot): ReturnHouseRulerEvidence[] {
  return cusps.flatMap((cusp, index) => {
    const ruler = rulerForLongitude(cusp.longitude);
    const planet = sky.planets.find((point) => point.name === ruler);
    if (!planet) return [];
    return [{
      origin,
      house: index + 1,
      ruler,
      cuspLongitude: cusp.longitude,
      rulerReturnLongitude: planet.longitude,
      rulerReturnHouse: planet.house,
      rulerReturnCondition: essentialCondition(planet),
    }];
  });
}

function buildHouseRulerContacts(items: ReturnHouseRulerEvidence[], sky: PredictiveSkySnapshot): ReturnHouseRulerContact[] {
  const out: ReturnHouseRulerContact[] = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const first = items[i]; const second = items[j];
      if (first.ruler === second.ruler) continue;
      const p1 = sky.planets.find((point) => point.name === first.ruler);
      const p2 = sky.planets.find((point) => point.name === second.ruler);
      if (!p1 || !p2) continue;
      out.push({ firstOrigin: first.origin, firstHouse: first.house, firstRuler: first.ruler, secondOrigin: second.origin, secondHouse: second.house, secondRuler: second.ruler, contact: nearestMovingPairContact(p1, p2) });
    }
  }
  return out;
}

async function buildImminentSignIngresses(sky: PredictiveSkySnapshot, horizonDays: number) {
  const startMs = Date.parse(sky.utcIso);
  const isDay = returnIsDay(sky);
  const entries = await Promise.all(sky.planets.map(async (planet) => {
    const ingress = await findNextSignIngress(planet.name, startMs, horizonDays);
    if (!ingress) return undefined;
    const before: PredictivePoint = { ...planet, longitude: ingress.beforeLongitude, sign: signName(ingress.beforeLongitude) };
    const after: PredictivePoint = { ...planet, longitude: ingress.afterLongitude, sign: signName(ingress.afterLongitude) };
    const receptionBefore = receptionsForPoint(before, isDay);
    const receptionAfter = receptionsForPoint(after, isDay);
    const beforeKeys = new Set(receptionBefore.map(receptionKey));
    const afterKeys = new Set(receptionAfter.map(receptionKey));
    const changedReceptionKeys = [...new Set([...beforeKeys, ...afterKeys])].filter((key) => beforeKeys.has(key) !== afterKeys.has(key));
    return {
      planet: planet.name,
      fromSign: ingress.fromSign,
      toSign: ingress.toSign,
      ingressUtcIso: new Date(ingress.utcMs).toISOString(),
      daysAfterReturn: (ingress.utcMs - startMs) / DAY_MS,
      direction: ingress.direction,
      receptionBefore,
      receptionAfter,
      changedReceptionKeys,
      sourceIds: ["FRAWLEY_ORWELL_RETURN_CHANGE_EVIDENCE"],
    };
  }));
  return entries.filter(Boolean) as NonNullable<(typeof entries)[number]>[];
}

async function buildRecentSignIngresses(sky: PredictiveSkySnapshot, horizonDays: number) {
  const startMs = Date.parse(sky.utcIso);
  const isDay = returnIsDay(sky);
  const entries = await Promise.all(sky.planets.map(async (planet) => {
    const ingress = await findPreviousSignIngress(planet.name, startMs, horizonDays);
    if (!ingress) return undefined;
    const before: PredictivePoint = { ...planet, longitude: ingress.beforeLongitude, sign: signName(ingress.beforeLongitude) };
    const after: PredictivePoint = { ...planet, longitude: ingress.afterLongitude, sign: signName(ingress.afterLongitude) };
    const receptionBefore = receptionsForPoint(before, isDay);
    const receptionAfter = receptionsForPoint(after, isDay);
    const beforeKeys = new Set(receptionBefore.map(receptionKey));
    const afterKeys = new Set(receptionAfter.map(receptionKey));
    const changedReceptionKeys = [...new Set([...beforeKeys, ...afterKeys])].filter((key) => beforeKeys.has(key) !== afterKeys.has(key));
    return {
      planet: planet.name,
      fromSign: ingress.fromSign,
      toSign: ingress.toSign,
      ingressUtcIso: new Date(ingress.utcMs).toISOString(),
      daysBeforeReturn: (startMs - ingress.utcMs) / DAY_MS,
      direction: ingress.direction,
      receptionBefore,
      receptionAfter,
      changedReceptionKeys,
      sourceIds: ["FRAWLEY_ORWELL_RETURN_CHANGE_EVIDENCE", "MARCOS_SOLAR_RETURN_CIRO_CASE_EVIDENCE"],
    };
  }));
  return entries.filter(Boolean) as NonNullable<(typeof entries)[number]>[];
}

function solarConditionEvidence(sky: PredictiveSkySnapshot) {
  const sun = sky.planets.find((point) => point.name === "Sol");
  if (!sun) return [];
  const cazimi = 17.5 / 60;
  return sky.planets.filter((point) => point.name !== "Sol").map((planet) => {
    const separationDeg = circularDistance(planet.longitude, sun.longitude);
    const sameSignAsSun = Math.floor(normalize360(planet.longitude) / 30) === Math.floor(normalize360(sun.longitude) / 30);
    const futurePlanet = planet.speed === undefined ? planet.longitude : normalize360(planet.longitude + planet.speed * 0.01);
    const futureSun = sun.speed === undefined ? sun.longitude : normalize360(sun.longitude + sun.speed * 0.01);
    const approachingSun = planet.speed === undefined || sun.speed === undefined ? null : circularDistance(futurePlanet, futureSun) < separationDeg;
    const status = (beamBoundary: number): "cazimi" | "combust" | "under-beams" | "free" => {
      if (separationDeg <= cazimi) return "cazimi";
      if (sameSignAsSun && separationDeg <= 8.5) return "combust";
      if (separationDeg <= beamBoundary) return "under-beams";
      return "free";
    };
    return {
      planet: planet.name,
      longitude: planet.longitude,
      sunLongitude: sun.longitude,
      separationDeg,
      sameSignAsSun,
      approachingSun,
      marcosStatus: status(17),
      frawleyStatus: status(17.5),
      distanceToCazimiBoundaryDeg: Math.abs(separationDeg - cazimi),
      distanceToCombustionBoundaryDeg: Math.abs(separationDeg - 8.5),
      distanceToMarcosBeamBoundaryDeg: Math.abs(separationDeg - 17),
      distanceToFrawleyBeamBoundaryDeg: Math.abs(separationDeg - 17.5),
      sourceIds: ["MARCOS_BOOK_SOLAR_CONDITION_LIMITS", "FRAWLEY_APPLIED_SOLAR_CONDITION_LIMITS", "FRAWLEY_ORWELL_RETURN_CHANGE_EVIDENCE"],
    };
  });
}

async function buildReturnDossier(
  kind: ReturnDossier["kind"],
  sky: PredictiveSkySnapshot,
  alternateEventLocationSky: PredictiveSkySnapshot | undefined,
  authorHouseSystemVariants: ReturnDossier["authorHouseSystemVariants"],
  locationPolicy: ReturnLocationPolicy,
  exact: { longitude: number; residualArcSeconds: number },
  targetLongitude: number,
  radix: PredictivePoint[],
  radixCondition: Map<string, EssentialConditionSnapshot>,
  birthChart: BirthChart,
  natalAnalysis: ReturnType<typeof calculateNatalAnalysis>,
  sourceIds: string[],
  hierarchy: string,
  temporalFixedStarContacts: PredictiveFixedStarContact[],
  lotSeeds: ReturnLotSeed[],
): Promise<ReturnDossier> {
  const returnConditions = sky.planets.map(essentialCondition);
  const returnMap = new Map(returnConditions.map((condition) => [condition.point, condition]));
  const dignityChangesFromRadix = [...radixCondition.entries()].flatMap(([planet, natal]) => {
    const ret = returnMap.get(planet);
    if (!ret) return [];
    const changed = natal.sign !== ret.sign || natal.labels.join("|") !== ret.labels.join("|");
    return [{ planet, natal, return: ret, changed }];
  });
  const rulersByHouse = sky.cusps.map((cusp, index) => ({ house: index + 1, cuspLongitude: cusp.longitude, sign: cusp.sign, ruler: rulerForLongitude(cusp.longitude) }));
  const returnCore = [...sky.planets, ...sky.angles];
  const contactsWithinReturn = pairContacts(sky.planets);
  const planetAngleContactsWithinReturn = matrixContacts(sky.planets, sky.angles);
  const cuspProximities = sky.planets.flatMap((planet) => sky.cusps.flatMap((cusp, index) => {
    const distanceDeg = circularDistance(planet.longitude, cusp.longitude);
    return distanceDeg <= 2 ? [{ point: planet.name, pointKind: planet.kind, cuspHouse: index + 1, distanceDeg, maxOrbDeg: 2 as const, emphasized: true, sourceIds: ["FRAWLEY_RETURN_JUDGMENT_GRAMMAR"] }] : [];
  }));
  const housePlacements = [...sky.planets, ...sky.nodes, ...sky.angles, ...lotSeeds.map((item) => item.point)].map((point) => ({ point: point.name, kind: point.kind, house: point.house, houseClass: houseClassFor(point.house) }));
  const angular = sky.planets.filter((point) => houseClassFor(point.house) === "angular").map((point) => point.name);
  const succedent = sky.planets.filter((point) => houseClassFor(point.house) === "succedent").map((point) => point.name);
  const cadent = sky.planets.filter((point) => houseClassFor(point.house) === "cadent").map((point) => point.name);
  const nodeContactsWithinReturn = matrixContacts(sky.nodes, [...sky.planets, ...sky.angles], ["conjunction", "opposition"]);
  const nodeContactsToRadix = matrixContacts(sky.nodes, radix, ["conjunction", "opposition"]);
  const nodeAntiscionContactsToRadix = matrixContacts(antiscionPoints(sky.nodes), radix.filter((point) => point.kind === "node" || point.kind === "angle"), ["conjunction", "opposition"]);
  const radixAngles = radix.filter((point) => point.kind === "angle");
  const angleContactsToRadixAngles = matrixContacts(sky.angles, radixAngles, ["conjunction", "opposition"]);
  const antiscionContactsWithinReturn = matrixContacts(antiscionPoints(sky.planets), sky.planets, ["conjunction", "opposition"]).filter((contact) => contact.moving.replace(" (antíscio)", "") !== contact.target);
  const cuspAntiscionContactsWithinReturn = matrixContacts(antiscionPoints(sky.cusps), sky.angles, ["conjunction", "opposition"]);
  const returnReceptionLedger = receptionLedger(sky.planets, returnIsDay(sky));
  const natalPlanetPoints = radix.filter((point) => point.kind === "planet");
  const natalSunHouse = natalPlanetPoints.find((point) => point.name === "Sol")?.house;
  const natalReceptionLedger = receptionLedger(natalPlanetPoints, Boolean(natalSunHouse && natalSunHouse >= 7 && natalSunHouse <= 12));
  const receptionChangesFromRadix = receptionChanges(natalReceptionLedger, returnReceptionLedger);
  const horizonDays = kind === "solar-return" ? 370 : 35;
  const recentSignIngresses = await buildRecentSignIngresses(sky, horizonDays);
  const imminentSignIngresses = await buildImminentSignIngresses(sky, horizonDays);
  const solarConditions = solarConditionEvidence(sky);
  const returnHouseRulers = buildHouseRulers("return-house", sky.cusps, sky);
  const radicalCusps = radixCusps(birthChart, sky.houseSystemCode);
  const radicalHouseRulersInReturn = buildHouseRulers("radical-house", radicalCusps, sky);
  const houseRulerContinuities = radicalHouseRulersInReturn.map((radical) => {
    const ret = returnHouseRulers.find((item) => item.house === radical.house);
    return { house: radical.house, radicalRuler: radical.ruler, returnRuler: ret?.ruler ?? "", sameRuler: ret?.ruler === radical.ruler };
  });
  const returnPlanetContactsToRadicalHouseRulers = sky.planets.flatMap((planet) => radicalHouseRulersInReturn.flatMap((radical) => {
    if (planet.name === radical.ruler) return [];
    const rulerPoint = sky.planets.find((point) => point.name === radical.ruler);
    if (!rulerPoint) return [];
    return [{ returnPlanet: planet.name, radicalHouse: radical.house, radicalRuler: radical.ruler, contact: nearestMovingPairContact(planet, rulerPoint) }];
  }));
  const returnHouseRulerContacts = buildHouseRulerContacts(returnHouseRulers, sky);
  const radicalHouseRulerContactsInReturn = buildHouseRulerContacts(radicalHouseRulersInReturn, sky);
  const lots: ReturnLotEvidence[] = lotSeeds.map((seed) => ({
    id: seed.id,
    lotKey: seed.lotKey,
    variant: seed.variant,
    label: seed.label,
    point: seed.point,
    house: seed.point.house,
    dispositor: rulerForLongitude(seed.point.longitude),
    antiscionLongitude: normalize360(180 - seed.point.longitude),
    sourceIds: seed.sourceIds,
    formula: seed.formula,
    contactsToRadix: matrixContacts([seed.point], radix, ["conjunction", "opposition"]),
    contactsWithinReturn: matrixContacts([seed.point], returnCore, ["conjunction", "opposition"]),
    cuspContacts: matrixContacts([seed.point], sky.cusps, ["conjunction", "opposition"]),
    fixedStarContacts: temporalFixedStarContacts.filter((contact) => contact.moving === seed.point.name),
  }));
  return {
    kind,
    sourceIds,
    exactReturnUtcIso: sky.utcIso,
    targetLongitude,
    actualLongitude: exact.longitude,
    residualArcSeconds: exact.residualArcSeconds,
    sky,
    alternateEventLocationSky,
    authorHouseSystemVariants,
    locationPolicy,
    essentialConditions: returnConditions,
    dignityChangesFromRadix,
    rulersByHouse,
    housePlacements,
    houseEmphasis: {
      angular, succedent, cadent,
      allTraditionalPlanetsCadent: cadent.length === sky.planets.length,
      allTraditionalPlanetsCadentAndAwayFromCusps: cadent.length === sky.planets.length && cuspProximities.length === 0,
    },
    contactsWithinReturn,
    planetAngleContactsWithinReturn,
    cuspProximities,
    nodeContactsWithinReturn,
    nodeContactsToRadix,
    nodeAntiscionContactsToRadix,
    angleContactsToRadixAngles,
    antiscionContactsWithinReturn,
    cuspAntiscionContactsWithinReturn,
    receptions: returnReceptionLedger,
    receptionChangesFromRadix,
    recentSignIngresses,
    imminentSignIngresses,
    solarConditions,
    returnHouseRulers,
    radicalHouseRulersInReturn,
    houseRulerContinuities,
    returnPlanetContactsToRadicalHouseRulers,
    returnHouseRulerContacts,
    radicalHouseRulerContactsInReturn,
    lots,
    contactsToRadix: matrixContacts(returnCore, radix),
    cuspContactsToRadix: matrixContacts(sky.cusps, radix, ["conjunction", "opposition"]),
    antiscionContactsToRadix: matrixContacts(antiscionPoints(sky.planets), radix, ["conjunction", "opposition"]),
    temporalFixedStarContacts,
    hierarchy,
  };
}

function buildProfection(ageCompleted: number, asc: number): ProfectionDossier {
  const profectedHouse = (ageCompleted % 12) + 1;
  const natalDegreeInSign = normalize360(asc) % 30;
  const profectedSignIndex = (Math.floor(normalize360(asc) / 30) + ageCompleted) % 12;
  const profectedAscendantLongitude = profectedSignIndex * 30 + natalDegreeInSign;
  return {
    method: "annual-profection-by-sign",
    sourceIds: ["MARCOS_RECENT_PROFECTION_CAUTION", "TRADITIONAL_ANNUAL_PROFECTION_STANDARD", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
    ageCompleted,
    profectedHouse,
    natalAscendantLongitude: asc,
    profectedAscendantLongitude,
    profectedSign: signName(profectedAscendantLongitude),
    lordOfYear: DOMICILE_RULER[profectedSignIndex],
    rule: "advance-one-sign-per-completed-year; do-not-rotate-natal-planets",
    interpretiveWeight: "secondary-context-not-automatic-dominant-ruler",
  };
}

function buildConvergence(
  progression: PredictiveContact[],
  solar: PredictiveContact[],
  lunar: PredictiveContact[],
  dlr: PredictiveContact[],
  transit: PredictiveContact[],
  profection?: ProfectionDossier,
): ConvergenceItem[] {
  const buckets = new Map<string, ConvergenceItem>();
  const add = (layer: ConvergenceItem["layers"][number], contacts: PredictiveContact[]) => {
    for (const contact of activeContacts(contacts)) {
      const item = buckets.get(contact.target) ?? { radixTarget: contact.target, layers: [], evidence: [], noAggregateScore: true as const };
      if (!item.layers.includes(layer)) item.layers.push(layer);
      item.evidence.push(`${layer}: ${contact.moving} ${contact.aspect} ${contact.target}, erro ${contact.distanceToExact.toFixed(4)}°`);
      buckets.set(contact.target, item);
    }
  };
  add("progression", progression);
  add("solar-return", solar);
  add("lunar-return", lunar);
  add("derived-lunar-return", dlr);
  add("transit", transit);
  if (profection) {
    const item = buckets.get(`Casa ${profection.profectedHouse}`) ?? { radixTarget: `Casa ${profection.profectedHouse}`, layers: [], evidence: [], noAggregateScore: true as const };
    if (!item.layers.includes("profection")) item.layers.push("profection");
    item.evidence.push(`profection: casa ${profection.profectedHouse}, ${profection.profectedSign}, regente ${profection.lordOfYear}`);
    buckets.set(item.radixTarget, item);
  }
  return [...buckets.values()].sort((a, b) => b.layers.length - a.layers.length || a.radixTarget.localeCompare(b.radixTarget));
}

function houseIndexFromLongitude(longitude: number, cusps: number[]): number | undefined {
  const lon = normalize360(longitude);
  for (let i = 0; i < cusps.length; i += 1) {
    const start = normalize360(cusps[i]);
    let end = normalize360(cusps[(i + 1) % cusps.length]);
    let test = lon;
    if (end <= start) end += 360;
    if (test < start) test += 360;
    if (test >= start && test < end) return i + 1;
  }
  return undefined;
}

function enrichGuguLordConditions(dossier: GuguPeriodDossier, birthChart: BirthChart, radix: PredictivePoint[]): GuguPeriodDossier {
  const rulers = [...new Set(dossier.activePath.flatMap((item) => [item.parentRuler, item.ruler]).filter(Boolean) as string[])];
  const lordConditions: GuguPeriodLordCondition[] = rulers.flatMap((ruler) => {
    const point = radix.find((item) => item.kind === "planet" && item.name === ruler);
    if (!point) return [];
    return [{
      planet: ruler,
      longitude: point.longitude,
      sign: point.sign,
      house: houseIndexFromLongitude(point.longitude, birthChart.housesData.house),
      retrograde: point.retrograde,
      essentialCondition: essentialCondition(point),
    }];
  });
  return { ...dossier, lordConditions };
}

function buildTransitDossier(
  mode: PredictiveAuthorMode,
  targetSky: PredictiveSkySnapshot,
  radix: PredictivePoint[],
  higherScale: PredictiveContact[],
  temporalFixedStarContacts: PredictiveFixedStarContact[],
  guguPeriods?: GuguPeriodDossier,
): TransitDossier {
  const contacts = matrixContacts(targetSky.planets, radix);
  const higherActiveTargets = new Set(activeContacts(higherScale).map((contact) => contact.target));
  const pureGugu = mode === "gugu";
  const guguPeriodContext = guguPeriods ? {
    majorRuler: guguPeriods.activeMajor.ruler,
    majorSign: guguPeriods.activeMajor.sign,
    minorRuler: guguPeriods.minor.active?.ruler,
    minorSign: guguPeriods.minor.active?.sign,
    nearestMajorBoundaryDays: guguPeriods.boundaryEvidence.find((item) => item.level === "major-years")?.nearestBoundaryDistanceDays ?? Number.NaN,
  } : undefined;
  const triggers = activeContacts(contacts).map((contact) => {
    if (pureGugu) {
      return {
        contact,
        status: "period_context_only" as const,
        supportLayers: guguPeriods ? ["gugu-planetary-period-context"] : [],
        reason: "No perfil Gugu, o trânsito é materializado como condição/experiência temporal subordinada aos períodos; ele não prediz acontecimento autonomamente.",
        guguPeriodContext,
      };
    }
    const supported = higherActiveTargets.has(contact.target);
    return {
      contact,
      status: supported ? "eligible_trigger" as const : "background_only" as const,
      supportLayers: supported ? ["progression-or-return-on-same-radix-target"] : [],
      reason: supported
        ? "O mesmo alvo radical está ativo em técnica de escala superior; o trânsito pode funcionar como marcador temporal."
        : "Sem apoio de progressão/retorno sobre o mesmo alvo radical; trânsito não sobe sozinho para previsão.",
      guguPeriodContext,
    };
  });
  return {
    sourceIds: sourceIdsForMode(mode, ["MARCOS_2026_TRANSIT_TRIGGER", "FRAWLEY_CURRENT_NATAL_PREDICTION", "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION"]),
    targetSky,
    contactsToRadix: contacts,
    temporalFixedStarContacts,
    triggerPolicy: pureGugu ? "gugu-period-context-no-autonomous-event-prediction" : "trigger-only-needs-higher-scale-support",
    triggers,
  };
}

export async function calculatePredictiveEngine(input: PredictiveInput): Promise<PredictiveEngineResult> {
  const authorMode = input.authorMode ?? "integrated";
  const birthMs = birthDateToUtcMs(input.birthDate);
  const targetMs = birthDateToUtcMs(input.targetDate);
  if (targetMs < birthMs) throw new Error("A data-alvo preditiva não pode ser anterior ao nascimento.");
  const eventLocation: SelectedCity = input.eventCoordinates ?? input.targetDate.coordinates ?? input.birthDate.coordinates;
  const useMainStack = includesMainPredictiveStack(authorMode);
  const useGugu = input.includeGuguPeriods === true || includesGugu(authorMode);
  const useTemporalFixedStars = input.includeTemporalFixedStars !== false && useMainStack;

  const birthChart = await calculateBirthChart(input.birthDate);
  const natalAnalysis = calculateNatalAnalysis(birthChart);
  const natalPrecision = await calculateNatalPrecision(birthChart);
  const natalReport = generateNatalTechnicalReport(birthChart, natalAnalysis, natalPrecision, { profile: "ai-clean" });
  const natalValidation = validateNatalProductionOutput(birthChart, natalAnalysis, natalPrecision, natalReport);
  const natalAi = buildNatalAiStructuredForm(natalAnalysis, natalPrecision, natalValidation);
  const natalAiLeaks = containsAuditOnlyNumericKeys(natalAi.technicalForm);
  const natalUnsafeStars = findAiUnsafeStarContacts(natalAi.technicalForm);
  const natalAiReleasePass = natalValidation.status === "PASS"
    && natalAiLeaks.length === 0
    && natalUnsafeStars.length === 0
    && natalAi.evidenceMaterialization.radicalAllMaterialized
    && natalAi.evidenceMaterialization.allEvidenceAccountedFor;

  const radix = radixPoints(birthChart);
  const radixCondition = dignityMap(radix);
  const birthSun = birthChart.planets.find((planet: Planet) => planet.name === "Sol");
  const birthMoon = birthChart.planets.find((planet: Planet) => planet.name === "Lua");
  if (!birthSun || !birthMoon) throw new Error("Radix sem Sol/Lua; impossível executar Preditiva.");

  let progressions: PredictiveEngineResult["progressions"];
  let solarReturn: ReturnDossier | undefined;
  let lunarReturn: ReturnDossier | undefined;
  let derivedLunarReturn: ReturnDossier | undefined;
  let profection: ProfectionDossier | undefined;
  let progressionToRadix: PredictiveContact[] = [];

  const returnPrimaryLocation = includesMarcos(authorMode) ? input.birthDate.coordinates : eventLocation;
  const hasAlternateEvent = includesMarcos(authorMode) && !sameLocation(returnPrimaryLocation, eventLocation);
  const locationPolicy = returnLocationPolicy(authorMode, hasAlternateEvent);

  if (useMainStack) {
    const progressionHouseSystem: "R" | "P" = authorMode === "frawley" ? "P" : "R";
    const marcosProgressedState = includesMarcos(authorMode)
      ? await calculateSecondaryProgressedSkyAtCivilMs(birthMs, targetMs, input.birthDate, birthChart, "R")
      : undefined;
    const frawleyProgressedState = includesFrawley(authorMode)
      ? await calculateSecondaryProgressedSkyAtCivilMs(birthMs, targetMs, input.birthDate, birthChart, "P")
      : undefined;
    const progressedState = authorMode === "frawley"
      ? frawleyProgressedState!
      : marcosProgressedState ?? frawleyProgressedState!;
    const ageYears = progressedState.ageYears;
    const progressedMs = progressedState.symbolicMs;
    const progressedSky = progressedState.sky;
    const progressedAngles = progressedSky.angles;
    const progressedCusps = progressedSky.cusps;

    const natalLots = natalAnalysis.technicalForm.lots;
    const fortuneNatal = natalLots.find((lot) => lot.key === "fortune");
    const natalLotTargets: PredictivePoint[] = natalLots.map((lot) => lotPoint(`natal-${lot.key}`, `Parte ${lot.name} natal`, lot.longitude));

    // Marcos and Frawley share the day-for-year planetary ephemeris, but their
    // house geometries are kept separate. In combined/integrated mode Frawley
    // must never inherit Marcos/Regiomontanus ASC, MC or cusps merely because
    // both authors are active.
    const marcosSky = marcosProgressedState?.sky;
    const marcosLots = marcosSky ? marcosLotsFromSky(marcosSky) : [];
    const marcosMovingPoints: PredictivePoint[] = marcosSky
      ? [...marcosSky.planets, ...marcosSky.angles, ...marcosLots]
      : [];
    const marcosTargets: PredictivePoint[] = includesMarcos(authorMode)
      ? [...radixPoints(birthChart, "R"), ...radixCusps(birthChart, "R", "Marcos/Regiomontanus"), ...natalLotTargets]
      : [];
    const marcosContacts = marcosSky ? matrixContacts(marcosMovingPoints, marcosTargets, ["conjunction", "opposition"]) : [];
    const marcosInternal = marcosSky
      ? marcosMovingPoints.flatMap((moving, index) => marcosMovingPoints.slice(index + 1).map((target) => nearestMovingPairContact(moving, target, ["conjunction", "opposition"])))
      : [];
    const marcosAntisciaToRadix = marcosSky ? matrixContacts(antiscionPoints(marcosMovingPoints), marcosTargets, ["conjunction", "opposition"]) : [];
    const marcosAntisciaInternal = marcosSky
      ? matrixContacts(antiscionPoints(marcosMovingPoints), marcosMovingPoints, ["conjunction", "opposition"]).filter((contact) => contact.moving.replace(" (antíscio)", "") !== contact.target)
      : [];
    const marcosStars = marcosSky && useTemporalFixedStars
      ? await calculatePredictiveFixedStarContacts(birthChart, marcosSky, marcosMovingPoints, "marcos", "progression")
      : [];

    const frawleySky = frawleyProgressedState?.sky;
    const frawleyFortuneDirector = frawleySky ? fortuneFromSky(frawleySky) : undefined;
    const frawleyPrimaryDirectors = frawleySky ? [
      frawleySky.planets.find((point) => point.name === "Sol"),
      frawleySky.planets.find((point) => point.name === "Lua"),
      frawleySky.angles.find((point) => point.name === "ASC"),
      frawleySky.angles.find((point) => point.name === "MC"),
      frawleyFortuneDirector,
    ].filter(Boolean) as PredictivePoint[] : [];
    const frawleyTargets: PredictivePoint[] = includesFrawley(authorMode)
      ? [...radixPoints(birthChart, "P"), ...radixCusps(birthChart, "P", "Frawley/Placidus"), ...natalLotTargets]
      : [];
    const frawleyContacts = frawleySky ? matrixContacts(frawleyPrimaryDirectors, frawleyTargets, ["conjunction", "opposition"]) : [];
    const frawleyInternal = frawleySky
      ? frawleyPrimaryDirectors.flatMap((moving, index) => frawleyPrimaryDirectors.slice(index + 1).map((target) => nearestMovingPairContact(moving, target, ["conjunction", "opposition"])))
      : [];
    const frawleyAntisciaToRadix = frawleySky ? matrixContacts(antiscionPoints(frawleyPrimaryDirectors), frawleyTargets, ["conjunction", "opposition"]) : [];
    const frawleyStars = frawleySky && useTemporalFixedStars
      ? await calculatePredictiveFixedStarContacts(birthChart, frawleySky, frawleyPrimaryDirectors, "frawley", "progression")
      : [];
    const frawleyNatalAsc = birthChart.housesData.variants?.placidus.ascendant ?? birthChart.housesData.ascendant;
    const frawleyNatalMc = birthChart.housesData.variants?.placidus.mc ?? birthChart.housesData.mc;
    const natalDirectorMap = new Map<string, number>([
      ["Sol", birthSun.longitudeRaw],
      ["Lua", birthMoon.longitudeRaw],
      ["ASC", frawleyNatalAsc],
      ["MC", frawleyNatalMc],
      ...(fortuneNatal ? [["Parte da Fortuna", fortuneNatal.longitude] as [string, number]] : []),
    ]);
    const frawleyTermChanges = frawleyPrimaryDirectors.map((point) => {
      const natalLongitude = natalDirectorMap.get(point.name);
      const natalTermRuler = natalLongitude === undefined ? undefined : termRulerAt(natalLongitude);
      const progressedTermRuler = termRulerAt(point.longitude);
      return { point: point.name, natalTermRuler, progressedTermRuler, changed: natalTermRuler !== progressedTermRuler };
    });

    const movingPoints = authorMode === "frawley" ? frawleyPrimaryDirectors : marcosMovingPoints;
    const progressionTargets = authorMode === "frawley" ? frawleyTargets : marcosTargets;
    progressionToRadix = authorMode === "frawley" ? frawleyContacts : marcosContacts;
    const progressionInternal = authorMode === "frawley" ? frawleyInternal : marcosInternal;
    const progressionAntisciaToRadix = authorMode === "frawley" ? frawleyAntisciaToRadix : marcosAntisciaToRadix;
    const progressionAntisciaInternal = authorMode === "frawley" ? [] : marcosAntisciaInternal;
    const progressionStars = authorMode === "frawley" ? frawleyStars : marcosStars;
    const allProgressedLots = marcosLots;
    const fortuneDirector = authorMode === "frawley" ? frawleyFortuneDirector : marcosLots.find((point) => point.key === "fortune");
    const progressedLots = includesMarcos(authorMode) ? marcosLots : (frawleyFortuneDirector ? [frawleyFortuneDirector] : []);
    const progressedPlanetPoints = progressedSky.planets;
    const termChanges = frawleyTermChanges;

    const progressionAuthorVariants: NonNullable<PredictiveEngineResult["progressions"]>["authorVariants"] = {
      ...(marcosSky ? {
        marcos: {
          author: "Marcos Monteiro" as const,
          houseSystem: "Regiomontanus" as const,
          progressedSky: marcosSky,
          pointsConsidered: marcosMovingPoints.map((point) => point.name),
          primaryDirectors: [],
          contactsToRadix: marcosContacts,
          antiscionContactsToRadix: marcosAntisciaToRadix,
          termChanges: [],
          temporalFixedStarContacts: marcosStars,
          note: "Camada Marcos preservada em Regiomontanus; inclui planetas, quatro ângulos e sete Partes recomputadas, sem herdar o recorte dos cinco diretores Frawley.",
        },
      } : {}),
      ...(frawleySky ? {
        frawley: {
          author: "John Frawley" as const,
          houseSystem: "Placidus" as const,
          progressedSky: frawleySky,
          pointsConsidered: frawleyPrimaryDirectors.map((point) => point.name),
          primaryDirectors: frawleyPrimaryDirectors.map((point) => point.name),
          contactsToRadix: frawleyContacts,
          antiscionContactsToRadix: frawleyAntisciaToRadix,
          termChanges: frawleyTermChanges,
          temporalFixedStarContacts: frawleyStars,
          note: "Camada Frawley preservada em Placidus; ASC/MC/cúspides são reconstruídos pelo RAMC Naibod próprio desta geometria e os cinco diretores são julgados contra alvos natais Placidus.",
        },
      } : {}),
    };

    progressions = {
      method: "secondary-progressions-day-for-year",
      sourceIds: sourceIdsForMode(authorMode, ["MARCOS_BOOK_CH22_SECONDARY", "MARCOS_2026_PROGRESSIONS_CONJ_OPP", "MARCOS_YOUTUBE_EN_PREDICTION_MODULE", "MARCOS_PROGRESSIONS_ANGLE_USAGE_EXAMPLES", "FRAWLEY_NAIBOD_RA_SECONDARY_ATTESTATION", "MARCOS_FORTUNE_TEMPORAL_CURRENT", "MARCOS_PROGRESSIONS_PARTS_ANTISCIA_EXAMPLES", "FRAWLEY_CURRENT_NATAL_PREDICTION", "FRAWLEY_FIVE_PRIMARY_DIRECTORS", "FRAWLEY_ORWELL_RELATIONAL_EVIDENCE"]),
      ageYears,
      progressedUtcIso: progressedSky.utcIso,
      progressedSky,
      pointsConsidered: movingPoints.map((point) => point.name),
      primaryDirectors: frawleyPrimaryDirectors.map((point) => point.name),
      secondaryRelationalPoints: progressedPlanetPoints.filter((point) => !["Sol", "Lua"].includes(point.name)).map((point) => point.name),
      targetClasses: ["planetas natais", "ângulos natais", "cúspides natais por perfil autoral", "sete Partes natais materializadas", "sete Partes progredidas no perfil Marcos", "antíscios progressivos", "estrelas fixas", "mudanças de termo"],
      houseSystemPolicy: {
        primary: progressionHouseSystem === "P" ? "Placidus" : "Regiomontanus",
        frawleyNatal: "Placidus",
        alternateAuthorGeometryMaterialized: Boolean(progressionAuthorVariants.marcos && progressionAuthorVariants.frawley),
        note: "Frawley publica Placidus para trabalho natal; nos modos combinados, as progressões Marcos/Regiomontanus e Frawley/Placidus possuem céus, ângulos, cúspides, contatos e timelines próprios. Nenhuma geometria de um autor é reutilizada silenciosamente pelo outro.",
      },
      authorVariants: progressionAuthorVariants,
      aspectPolicy: "conjunction-and-opposition-only",
      aspectPolicySourceIds: includesMarcos(authorMode) ? ["MARCOS_2026_PROGRESSIONS_CONJ_OPP"] : [],
      aspectPolicyProvenance: includesMarcos(authorMode) ? "MARCOS_CURRENT_SOURCE_LOCKED" : "FRAWLEY_CONSERVATIVE_SUBSET_POLICY_UNPUBLISHED",
      angleProgressionPolicy: {
        method: "naibod-in-ra-via-progressed-ramc",
        arcDegrees: progressedState.arcDegrees,
        note: "A efeméride planetária continua dia=ano, mas ASC/MC/cúspides são reconstruídos pela geometria Naibod em RA: soma-se o arco solar médio ao RAMC natal e recalculam-se as casas na latitude natal. Isto evita tanto a rotação diurna do instante simbólico quanto a falsa tradução ponto-a-ponto da RA de cada cúspide. Marcos source-locka o uso dos ângulos e a escala ~1°/ano; o setting Naibod/RA possui atestação convergente na escola Frawley, sem ser promovido a citação primária direta do autor.",
        sourceStatus: "FRAWLEY_SCHOOL_SECONDARY_ATTESTATION_TRADITIONAL_MECHANICS",
      },
      termChanges,
      contactsToRadix: progressionToRadix,
      contactsWithinProgressedSky: progressionInternal,
      progressedLots,
      antiscionContactsToRadix: progressionAntisciaToRadix,
      antiscionContactsWithinProgressedSky: progressionAntisciaInternal,
      temporalFixedStarContacts: progressionStars,
      natalFixedStarContacts: progressionStars.map((item) => ({
        moving: item.moving,
        star: item.star,
        starLongitude: item.starLongitude,
        distanceToConjunction: item.distanceToConjunction,
        operationallyActive: item.operationallyActive,
        operationalGateDeg: item.maxOrbDeg,
      })),
      note: "O snapshot é suporte de cálculo; o objeto interpretativo são progressões individuais. No perfil Marcos, as sete Partes são recomputadas a partir dos pontos progredidos (Fortuna/Espírito respondem ao movimento lunar e não recebem arco solar artificial) e seus antíscios são materializados. No perfil Frawley, Sol, Lua, ASC, MC e Fortuna são os cinco diretores principais publicados. Estrelas são recalculadas para a época progredida.",
    };

    const solarExact = await findPreviousLongitudeReturn(0, birthSun.longitudeRaw, targetMs);
    let nextSolarExact = await findPreviousLongitudeReturn(0, birthSun.longitudeRaw, solarExact.utcMs + 370 * DAY_MS);
    if (nextSolarExact.utcMs <= solarExact.utcMs + 300 * DAY_MS) {
      nextSolarExact = await findPreviousLongitudeReturn(0, birthSun.longitudeRaw, solarExact.utcMs + 740 * DAY_MS);
    }
    if (progressions.authorVariants?.marcos) {
      progressions.authorVariants.marcos.progressionWindow = await buildProgressionWindowTimeline({
        mode: "marcos",
        birthMs,
        birthDate: input.birthDate,
        birthChart,
        houseSystemCode: "R",
        startMs: solarExact.utcMs,
        endMs: nextSolarExact.utcMs,
        targets: marcosTargets,
        includeFixedStars: useTemporalFixedStars,
      });
    }
    if (progressions.authorVariants?.frawley) {
      progressions.authorVariants.frawley.progressionWindow = await buildProgressionWindowTimeline({
        mode: "frawley",
        birthMs,
        birthDate: input.birthDate,
        birthChart,
        houseSystemCode: "P",
        startMs: solarExact.utcMs,
        endMs: nextSolarExact.utcMs,
        targets: frawleyTargets,
        includeFixedStars: useTemporalFixedStars,
      });
    }
    progressions.progressionWindow = authorMode === "frawley"
      ? progressions.authorVariants?.frawley?.progressionWindow
      : progressions.authorVariants?.marcos?.progressionWindow ?? progressions.authorVariants?.frawley?.progressionWindow;
    const primaryReturnHouseSystem: "R" | "P" = authorMode === "frawley" ? "P" : "R";
    const solarSky = await calculatePredictiveSky(solarExact.utcMs, returnPrimaryLocation, primaryReturnHouseSystem);
    const solarAlternate = hasAlternateEvent ? await calculatePredictiveSky(solarExact.utcMs, eventLocation, primaryReturnHouseSystem) : undefined;
    const solarAuthorVariants = includesFrawley(authorMode) && includesMarcos(authorMode) ? {
      regiomontanus: primaryReturnHouseSystem === "R" ? solarSky : await calculatePredictiveSky(solarExact.utcMs, returnPrimaryLocation, "R"),
      placidus: primaryReturnHouseSystem === "P" ? solarSky : await calculatePredictiveSky(solarExact.utcMs, returnPrimaryLocation, "P"),
    } : undefined;
    const solarLotSeeds = includesMarcos(authorMode) ? buildReturnLotSeeds("solar-return", solarSky, birthChart, natalAnalysis) : [];
    const solarStars = useTemporalFixedStars
      ? await calculatePredictiveFixedStarContacts(birthChart, solarSky, [...solarSky.planets, ...solarSky.angles, ...solarSky.cusps, ...solarLotSeeds.map((item) => item.point)], authorMode, "return")
      : [];
    solarReturn = await buildReturnDossier(
      "solar-return", solarSky, solarAlternate, solarAuthorVariants, locationPolicy, solarExact, birthSun.longitudeRaw, radix, radixCondition, birthChart, natalAnalysis,
      sourceIdsForMode(authorMode, ["MARCOS_2024_PREDICTIVE_HIERARCHY", "MARCOS_YOUTUBE_EN_PREDICTION_MODULE", "MARCOS_BOOK_SOLAR_RETURN_BIRTHPLACE", "MARCOS_FORTUNE_TEMPORAL_CURRENT", "MARCOS_SOLAR_RETURN_CIRO_CASE_EVIDENCE", "FRAWLEY_CURRENT_NATAL_PREDICTION", "FRAWLEY_RETURN_JUDGMENT_GRAMMAR", "FRAWLEY_ORWELL_RELATIONAL_EVIDENCE", "FRAWLEY_ORWELL_RETURN_CHANGE_EVIDENCE"]),
      "Radix → progressões → Revolução Solar",
      solarStars,
      solarLotSeeds,
    );

    const lunarExact = await findPreviousLongitudeReturn(1, birthMoon.longitudeRaw, targetMs);
    const lunarSky = await calculatePredictiveSky(lunarExact.utcMs, returnPrimaryLocation, primaryReturnHouseSystem);
    const lunarAlternate = hasAlternateEvent ? await calculatePredictiveSky(lunarExact.utcMs, eventLocation, primaryReturnHouseSystem) : undefined;
    const lunarAuthorVariants = includesFrawley(authorMode) && includesMarcos(authorMode) ? {
      regiomontanus: primaryReturnHouseSystem === "R" ? lunarSky : await calculatePredictiveSky(lunarExact.utcMs, returnPrimaryLocation, "R"),
      placidus: primaryReturnHouseSystem === "P" ? lunarSky : await calculatePredictiveSky(lunarExact.utcMs, returnPrimaryLocation, "P"),
    } : undefined;
    const lunarLotSeeds = buildReturnLotSeeds("lunar-return", lunarSky, birthChart, natalAnalysis);
    const lunarStars = useTemporalFixedStars
      ? await calculatePredictiveFixedStarContacts(birthChart, lunarSky, [...lunarSky.planets, ...lunarSky.angles, ...lunarSky.cusps, ...lunarLotSeeds.map((item) => item.point)], authorMode, "return")
      : [];
    lunarReturn = await buildReturnDossier(
      "lunar-return", lunarSky, lunarAlternate, lunarAuthorVariants, locationPolicy, lunarExact, birthMoon.longitudeRaw, radix, radixCondition, birthChart, natalAnalysis,
      sourceIdsForMode(authorMode, ["MARCOS_2024_PREDICTIVE_HIERARCHY", "MARCOS_YOUTUBE_EN_PREDICTION_MODULE", "FRAWLEY_CURRENT_NATAL_PREDICTION", "FRAWLEY_RETURN_JUDGMENT_GRAMMAR", "FRAWLEY_ORWELL_RELATIONAL_EVIDENCE", "FRAWLEY_ORWELL_RETURN_CHANGE_EVIDENCE"]),
      "Radix → progressões → Solar governante → Lunar",
      lunarStars,
      lunarLotSeeds,
    );

    if (input.includeDerivedLunar !== false) {
      const solarMoon = solarSky.planets.find((point) => point.name === "Lua");
      if (!solarMoon) throw new Error("Solar sem Lua para cálculo da Revolução Lunar Derivada.");
      const dlrExact = await findPreviousLongitudeReturn(1, solarMoon.longitude, targetMs);
      const dlrSky = await calculatePredictiveSky(dlrExact.utcMs, returnPrimaryLocation, primaryReturnHouseSystem);
      const dlrAlternate = hasAlternateEvent ? await calculatePredictiveSky(dlrExact.utcMs, eventLocation, primaryReturnHouseSystem) : undefined;
      const dlrAuthorVariants = includesFrawley(authorMode) && includesMarcos(authorMode) ? {
        regiomontanus: primaryReturnHouseSystem === "R" ? dlrSky : await calculatePredictiveSky(dlrExact.utcMs, returnPrimaryLocation, "R"),
        placidus: primaryReturnHouseSystem === "P" ? dlrSky : await calculatePredictiveSky(dlrExact.utcMs, returnPrimaryLocation, "P"),
      } : undefined;
      const dlrLotSeeds = buildReturnLotSeeds("derived-lunar-return", dlrSky, birthChart, natalAnalysis);
      const dlrStars = useTemporalFixedStars
        ? await calculatePredictiveFixedStarContacts(birthChart, dlrSky, [...dlrSky.planets, ...dlrSky.angles, ...dlrSky.cusps, ...dlrLotSeeds.map((item) => item.point)], authorMode, "return")
        : [];
      derivedLunarReturn = await buildReturnDossier(
        "derived-lunar-return", dlrSky, dlrAlternate, dlrAuthorVariants, locationPolicy, dlrExact, solarMoon.longitude, radix, radixCondition, birthChart, natalAnalysis,
        sourceIdsForMode(authorMode, ["MARCOS_2024_PREDICTIVE_HIERARCHY", "MARCOS_YOUTUBE_EN_PREDICTION_MODULE", "FRAWLEY_CURRENT_NATAL_PREDICTION", "FRAWLEY_RETURN_JUDGMENT_GRAMMAR"]),
        "Radix → progressões → Solar governante → Lunar/DLR; DLR usa a Lua da Solar como posição-base e encurta/refina a janela",
        dlrStars,
        dlrLotSeeds,
      );
    }

    const profectionAgeCompleted = completedAgeAtTarget(input.birthDate, targetMs);
    profection = input.includeProfection === false ? undefined : buildProfection(profectionAgeCompleted, birthChart.housesData.ascendant);
  }

  let guguPeriods: GuguPeriodDossier | undefined;
  if (useGugu) {
    guguPeriods = enrichGuguLordConditions(
      calculateGuguPlanetaryPeriods(birthMs, targetMs, birthChart.housesData.ascendant),
      birthChart,
      radix,
    );
  }

  const targetSky = await calculatePredictiveSky(targetMs, eventLocation);
  const targetStars = useTemporalFixedStars
    ? await calculatePredictiveFixedStarContacts(birthChart, targetSky, [...targetSky.planets, ...targetSky.angles, ...targetSky.cusps], authorMode, "transit")
    : [];
  const higherScale = [
    ...progressionToRadix,
    ...(solarReturn ? [...solarReturn.contactsToRadix, ...solarReturn.cuspContactsToRadix] : []),
    ...(lunarReturn ? [...lunarReturn.contactsToRadix, ...lunarReturn.cuspContactsToRadix] : []),
    ...(derivedLunarReturn ? [...derivedLunarReturn.contactsToRadix, ...derivedLunarReturn.cuspContactsToRadix] : []),
  ];
  const transits = buildTransitDossier(authorMode, targetSky, radix, higherScale, targetStars, guguPeriods);
  const convergence = useMainStack
    ? buildConvergence(
        progressionToRadix,
        solarReturn ? [...solarReturn.contactsToRadix, ...solarReturn.cuspContactsToRadix, ...solarReturn.antiscionContactsToRadix] : [],
        lunarReturn ? [...lunarReturn.contactsToRadix, ...lunarReturn.cuspContactsToRadix, ...lunarReturn.antiscionContactsToRadix] : [],
        derivedLunarReturn ? [...derivedLunarReturn.contactsToRadix, ...derivedLunarReturn.cuspContactsToRadix, ...derivedLunarReturn.antiscionContactsToRadix] : [],
        transits.contactsToRadix,
        profection,
      )
    : [];

  const validationChecks: Record<string, boolean> = {
    natalUpstreamReleased: natalAiReleasePass,
    solarReturnExact: !solarReturn || solarReturn.residualArcSeconds < 1,
    lunarReturnExact: !lunarReturn || lunarReturn.residualArcSeconds < 1,
    derivedLunarReturnExact: !derivedLunarReturn || derivedLunarReturn.residualArcSeconds < 1,
    progressionsConjunctionOppositionOnly: !progressions || progressionToRadix.every((contact) => contact.aspect === "conjunction" || contact.aspect === "opposition"),
    progressedAnglesSeparatedFromDiurnalSky: !progressions || progressions.angleProgressionPolicy.method === "naibod-in-ra-via-progressed-ramc",
    combinedProgressionAuthorGeometriesSeparated: !(includesMarcos(authorMode) && includesFrawley(authorMode)) || !progressions || Boolean(
      progressions.authorVariants?.marcos?.houseSystem === "Regiomontanus"
      && progressions.authorVariants?.frawley?.houseSystem === "Placidus"
      && progressions.authorVariants.marcos.progressedSky.cusps.length === 12
      && progressions.authorVariants.frawley.progressedSky.cusps.length === 12
      && progressions.authorVariants.marcos.progressionWindow
      && progressions.authorVariants.frawley.progressionWindow
    ),
    frawleyFivePrimaryDirectorsMaterialized: !includesFrawley(authorMode) || !progressions || ["Sol", "Lua", "ASC", "MC", "Parte da Fortuna"].every((name) => progressions.primaryDirectors.includes(name)),
    progressionNatalCuspsMaterializedAsTargets: !progressions || progressions.contactsToRadix.some((contact) => contact.target.startsWith("Cúspide ")),
    progressionTermChangesMaterialized: !includesFrawley(authorMode) || !progressions || progressions.termChanges.length >= 4,
    marcosProgressedLotsRecomputed: !includesMarcos(authorMode) || !progressions || progressions.progressedLots.length === 7,
    progressionAntisciaMaterialized: !includesMarcos(authorMode) || !progressions || Array.isArray(progressions.antiscionContactsToRadix),
    progressionWindowTimelineMaterialized: !progressions || Boolean(progressions.progressionWindow && Date.parse(progressions.progressionWindow.startUtcIso) <= targetMs && targetMs < Date.parse(progressions.progressionWindow.endUtcIso)),
    progressionWindowRootsNumericallyTight: !progressions?.progressionWindow || progressions.progressionWindow.allEvents.every((event) => event.residualDeg <= 0.01),
    progressionWindowTermChangesForFrawleyDirectors: !includesFrawley(authorMode) || !progressions?.progressionWindow || Array.isArray(progressions.progressionWindow.termIngressEvents),
    returnPlanetHousesMaterialized: !solarReturn || [solarReturn, lunarReturn, derivedLunarReturn].filter(Boolean).every((ret) => ret!.sky.planets.every((point) => Number.isInteger(point.house))),
    returnNodesMaterialized: !solarReturn || [solarReturn, lunarReturn, derivedLunarReturn].filter(Boolean).every((ret) => ret!.sky.nodes.length === 2),
    returnInternalGrammarMaterialized: !solarReturn || [solarReturn, lunarReturn, derivedLunarReturn].filter(Boolean).every((ret) => ret!.returnHouseRulers.length === 12 && ret!.radicalHouseRulersInReturn.length === 12 && Array.isArray(ret!.contactsWithinReturn) && Array.isArray(ret!.planetAngleContactsWithinReturn) && Array.isArray(ret!.receptions)),
    marcosSolarLotVariantsMaterialized: !includesMarcos(authorMode) || !solarReturn || solarReturn.lots.length >= 21,
    transitsNeverAutoEligibleWithoutHigherSupport: transits.triggers.every((trigger) => trigger.status !== "eligible_trigger" || trigger.supportLayers.length > 0),
    guguTransitsNeverAutonomousEvents: authorMode !== "gugu" || transits.triggers.every((trigger) => trigger.status === "period_context_only"),
    noProfectionPlanetRotation: profection?.rule === "advance-one-sign-per-completed-year; do-not-rotate-natal-planets" || !profection,
    guguMajorPeriodResolved: !useGugu || Boolean(guguPeriods?.activeMajor),
    guguUses360DayYears: !guguPeriods || guguPeriods.units.majorYearDays === 360,
    guguStartsFromAscendantSign: !guguPeriods || guguPeriods.startsFromAscendantSign === true,
    noAggregateConvergenceScore: convergence.every((item) => item.noAggregateScore === true),
    fixedStarsEpochMaterialized: !useTemporalFixedStars || [
      ...(progressions?.temporalFixedStarContacts ?? []),
      ...(solarReturn?.temporalFixedStarContacts ?? []),
      ...(lunarReturn?.temporalFixedStarContacts ?? []),
      ...(derivedLunarReturn?.temporalFixedStarContacts ?? []),
      ...transits.temporalFixedStarContacts,
    ].every((item) => Number.isFinite(item.starLongitude) && item.calculationMode !== undefined),
  };
  const errors = Object.entries(validationChecks).filter(([, pass]) => !pass).map(([key]) => key);
  const warnings = [
    "O gate de 1° dos aspectos planetários é apenas triagem operacional explícita; não é atribuído a Marcos/Frawley como orbe universal.",
    "Direções primárias permanecem em módulo separado: Marcos reconhece a técnica, mas no material novo explica que prefere progressões pela praticidade/confiabilidade do cálculo.",
    "Firdaria permanece fora do perfil canônico principal; não é misturada silenciosamente aos períodos Gugu.",
    ...(includesFrawley(authorMode) && !includesMarcos(authorMode) ? [
      "Frawley-only: a localização espacial dos retornos usa o local operacional fornecido, mas a regra espacial específica não está source-locked no corpus recuperado; o instante astronômico do retorno permanece exato e independente do local.",
      "Frawley-only: os cinco diretores principais e seus alvos estão source-locked; conjunção/oposição continua sendo o subconjunto conservador de contatos de evento porque o texto publicado não fixa uma lista universal de aspectos para todas as direções.",
      "Frawley-only: estrelas fixas temporais são materializadas astronomicamente, mas nenhuma regra universal de orbe/eligibilidade é atribuída a Frawley sem fonte explícita.",
    ] : []),
  ];

  const sourceGaps: PredictiveEngineResult["sourceGaps"] = [
    { id: "PRIMARY_DIRECTIONS_PROFILE", blocking: false, note: "Técnica válida, deliberadamente separada do perfil de progressões secundárias." },
    { id: "FIRDARIA_PROFILE", blocking: false, note: "Não privilegiada pela prática atual de Marcos; permanece opcional/deferida e não é confundida com os períodos Gugu." },
  ];
  if (includesFrawley(authorMode) && !includesMarcos(authorMode)) {
    sourceGaps.push({ id: "FRAWLEY_RETURN_LOCATION_POLICY", blocking: false, note: "O corpus atual não fechou uma regra espacial própria de Frawley para os retornos; a geometria do local operacional é exposta sem atribuição doutrinária." });
    sourceGaps.push({ id: "FRAWLEY_PROGRESSION_ASPECT_POLICY", blocking: false, note: "Os cinco diretores e classes de alvo estão source-locked. O que permanece não publicado no corpus é uma lista universal de aspectos para todas as direções; conjunção/oposição é mantida como subconjunto conservador de evento." });
    sourceGaps.push({ id: "FRAWLEY_TEMPORAL_FIXED_STAR_ORB_POLICY", blocking: false, note: "Frawley publica estrelas fixas como alvos dos cinco diretores principais. O que permanece não publicado no corpus é um orbe temporal universal; o motor materializa distância exata e não inventa cutoff Frawley." });
  }
  if (useMainStack) {
    sourceGaps.push({ id: "ANGLE_PROGRESSION_PRIMARY_AUTHOR_SETTING", blocking: false, note: "O setting operacional deixou de ser uma hipótese sem testemunho: duas fontes secundárias independentes ligadas à prática de Frawley atestam Naibod in RA / Mean Solar Arc in RA, exatamente a família usada pelo motor. Marcos confirma o uso dos ângulos e escala ~1°/ano. O que ainda não foi recuperado é apenas uma declaração primária direta de Marcos ou Frawley nomeando a constante/setting; por isso a atribuição primária continua aberta, mas a mecânica operacional está secundariamente atestada." });
  }

  const authorFallbacks: PredictiveAuthorFallback[] = includesFrawley(authorMode) && includesMarcos(authorMode) ? [
    {
      gapId: "FRAWLEY_RETURN_LOCATION_POLICY",
      missingAuthor: "John Frawley",
      suppliedBy: "Marcos Monteiro",
      status: "SOURCE_LOCKED_FALLBACK_IN_COMBINED_MODES",
      sourceIds: ["MARCOS_BOOK_SOLAR_RETURN_BIRTHPLACE"],
      rule: "Retornos principais são erguidos para o local de nascimento no subperfil Marcos; a geometria alternativa do local do evento pode ser materializada separadamente.",
      appliesInModes: ["combined", "integrated"],
      doesNotClaimMissingAuthorAgreement: true,
    },
    {
      gapId: "FRAWLEY_PROGRESSION_ASPECT_POLICY",
      missingAuthor: "John Frawley",
      suppliedBy: "Marcos Monteiro",
      status: "SOURCE_LOCKED_FALLBACK_IN_COMBINED_MODES",
      sourceIds: ["MARCOS_2026_PROGRESSIONS_CONJ_OPP"],
      rule: "Nas progressões secundárias, usar conjunção e oposição; Frawley continua fornecendo os cinco diretores e classes de alvo, sem lhe atribuir esta restrição autoral.",
      appliesInModes: ["combined", "integrated"],
      doesNotClaimMissingAuthorAgreement: true,
    },
    {
      gapId: "FRAWLEY_TEMPORAL_FIXED_STAR_ORB_POLICY",
      missingAuthor: "John Frawley",
      suppliedBy: "Marcos Monteiro",
      status: "SOURCE_LOCKED_FALLBACK_IN_COMBINED_MODES",
      sourceIds: ["MARCOS_FIXED_STARS_TEMPORAL_COURSE"],
      rule: "Aplicar ao subperfil Marcos a regra geral de conjunção próxima com estrela fixa, com limites documentados de 1° para comuns e até 3° para principais; distância exata permanece sempre exposta.",
      appliesInModes: ["combined", "integrated"],
      doesNotClaimMissingAuthorAgreement: true,
    },
  ] : [];

  const interpretationOrder = authorMode === "gugu"
    ? [
        "1. Verificar o radix como estrutura natal upstream.",
        "2. Localizar o grande período Gugu pela sequência zodiacal iniciada no signo do Ascendente.",
        "3. Quando source-locked, localizar os subperíodos mensais/diários/horários e distinguir doador e receptor da autoridade.",
        "4. Comparar mecanicamente a condição natal dos regentes ativos; a IA julga a relação, sem score do motor.",
        "5. Usar trânsitos apenas dentro do contexto dos períodos; trânsito sozinho não prediz acontecimento.",
        "6. Observar distância exata às fronteiras de período sem inventar janela/orbe temporal universal.",
      ]
    : [
        "1. Verificar possibilidades e impossibilidades do radix.",
        "2. Ler progressões secundárias individuais (conjunção/oposição), incluindo Partes progredidas/antíscios permitidos pelo perfil autoral e a timeline exata do ano solar governante; não extrapolar datas a partir de velocidade nem reconstruir um mapa progredido autônomo.",
        "3. Julgar a Revolução Solar governante em comparação ao radix e às progressões; dentro da Revolução usar casas dos planetas, regentes natais/da Revolução, aspectos internos, recepções e suas mudanças, nodos, cúspides, antíscios, eixos repetidos e Partes já materializadas.",
        "4. Refinar pela Revolução Lunar e, quando habilitada, pela Lunar Derivada usando a mesma gramática interna calculada; não tratar nenhuma delas como técnica autônoma.",
        "5. Usar profecção como contexto anual secundário, sem fazer o regente anual dominar automaticamente.",
        ...(guguPeriods ? ["6. Acrescentar os períodos planetários Gugu como camada autoral separada: sequência zodiacal, doador/receptor e condição natal dos regentes, sem fundir a doutrina."] : []),
        `${guguPeriods ? 7 : 6}. Só promover trânsito a gatilho Marcos/Frawley quando houver apoio de escala superior; no eixo Gugu, tratá-lo como subordinado ao período.`,
        `${guguPeriods ? 8 : 7}. Julgar convergência por camadas nomeadas, sem score agregado.`,
      ];

  const aiJudgmentContract = buildPredictiveAiJudgmentContract({
    input,
    authorMode,
    hasProgressions: Boolean(progressions),
    hasSolar: Boolean(solarReturn),
    hasLunar: Boolean(lunarReturn),
    hasDlr: Boolean(derivedLunarReturn),
    hasProfection: Boolean(profection),
    hasGugu: Boolean(guguPeriods),
    sourceGaps,
    authorFallbacks,
    interpretationOrder,
  });

  const baseResult: Omit<PredictiveEngineResult, "analysisReport"> = {
    schemaVersion: "1.5.0",
    schema: "mathastro.predictive.ai-report/1.5",
    principle: "motor-calcula-ia-interpreta",
    authorMode,
    input,
    sourceRegistry: PREDICTIVE_SOURCES,
    authorFallbacks,
    sourceGaps,
    radix: {
      utcIso: birthChart.calculationMetadata?.utcIso ?? new Date(birthMs).toISOString(),
      timezone: birthChart.birthDate.coordinates.timezone ?? "",
      ...snapshotRadix(birthChart),
      natalAiReleaseStatus: natalAiReleasePass ? "PASS" : "FAIL",
      natalValidationErrorCodes: [
        ...natalAi.release.errorCodes,
        ...(natalAiLeaks.length ? ["AI_STRUCTURED_FORM_SCORE_CONTAMINATION"] : []),
        ...(natalUnsafeStars.length ? ["AI_STRUCTURED_FORM_STAR_CONTAMINATION"] : []),
        ...(!natalAi.evidenceMaterialization.radicalAllMaterialized ? ["AI_STRUCTURED_FORM_RADICAL_EVIDENCE_MISSING"] : []),
        ...(!natalAi.evidenceMaterialization.allEvidenceAccountedFor ? ["AI_STRUCTURED_FORM_EVIDENCE_KEY_UNMAPPED"] : []),
      ],
      natalTechnicalForm: natalAi.technicalForm,
      natalPrecisionEvidence: natalAi.precisionEvidence,
    },
    progressions,
    solarReturn,
    lunarReturn,
    derivedLunarReturn,
    profection,
    guguPeriods,
    transits,
    convergence,
    interpretationOrder,
    aiPrompt: PREDICTIVE_ABSOLUTE_PROMPT_PTBR,
    aiJudgmentContract,
    validation: { status: errors.length ? "FAIL" : "PASS", checks: validationChecks, errors, warnings },
  };
  const analysisReport = generatePredictiveReport(baseResult);
  return { ...baseResult, analysisReport };
}
