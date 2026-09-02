import moment from "moment-timezone";
import { getSwe } from "@/app/lib/astrologyEngine";
import { DOMICILE_RULER, SIGNS } from "@/app/lib/traditionalTables";
import type { BirthDate, SelectedCity } from "@/interfaces/BirthChartInterfaces";
import type { EssentialConditionSnapshot, PredictivePoint, PredictiveSkySnapshot } from "./predictiveTypes";

const DAY_MS = 86400000;
const TRADITIONAL_BODIES = [
  { id: 0, key: "sun", name: "Sol" },
  { id: 1, key: "moon", name: "Lua" },
  { id: 2, key: "mercury", name: "Mercúrio" },
  { id: 3, key: "venus", name: "Vênus" },
  { id: 4, key: "mars", name: "Marte" },
  { id: 5, key: "jupiter", name: "Júpiter" },
  { id: 6, key: "saturn", name: "Saturno" },
] as const;

const BODY_ID_BY_NAME: Record<string, number> = Object.fromEntries(TRADITIONAL_BODIES.map((body) => [body.name, body.id]));

export function normalize360(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function signedAngularDelta(value: number): number {
  const normalized = normalize360(value);
  return normalized >= 180 ? normalized - 360 : normalized;
}

export function circularDistance(first: number, second: number): number {
  return Math.abs(signedAngularDelta(first - second));
}

export function houseIndexFromCusps(longitude: number, cusps: number[]): number | undefined {
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

export function signName(longitude: number): string {
  return SIGNS[Math.floor(normalize360(longitude) / 30) % 12];
}

function assertLocation(location: SelectedCity): SelectedCity & { timezone: string } {
  if (!Number.isFinite(Number(location.latitude)) || !Number.isFinite(Number(location.longitude))) {
    throw new Error("Coordenadas inválidas para a Preditiva.");
  }
  if (!location.timezone || !moment.tz.zone(location.timezone)) {
    throw new Error("A Preditiva exige timezone IANA explícito na localidade.");
  }
  return location as SelectedCity & { timezone: string };
}

export function birthDateToUtcMs(date: BirthDate): number {
  const location = assertLocation(date.coordinates);
  const time = String(date.time);
  let hhmmss = time;
  if (!time.includes(":")) {
    const decimal = Number(time);
    if (!Number.isFinite(decimal) || decimal < 0 || decimal >= 24) throw new Error(`Hora inválida: ${time}`);
    const hh = Math.floor(decimal);
    const mmFloat = (decimal - hh) * 60;
    const mm = Math.floor(mmFloat);
    const ss = Math.round((mmFloat - mm) * 60);
    hhmmss = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  } else if (/^\d{1,2}:\d{2}$/.test(time)) {
    hhmmss = `${time}:00`;
  }
  const local = moment.tz(
    `${date.year}-${date.month}-${date.day} ${hhmmss}`,
    "YYYY-M-D HH:mm:ss",
    true,
    location.timezone,
  );
  if (!local.isValid()) throw new Error(`Data/hora inválida no fuso ${location.timezone}.`);
  return local.valueOf();
}


export function completedAgeAtTarget(birthDate: BirthDate, targetUtcMs: number): number {
  const location = assertLocation(birthDate.coordinates);
  const target = moment.utc(targetUtcMs).tz(location.timezone);
  const birthClock = String(birthDate.time).includes(":") ? String(birthDate.time) : (() => {
    const decimal = Number(birthDate.time);
    const hh = Math.floor(decimal);
    const mm = Math.floor((decimal - hh) * 60);
    const ss = Math.round((((decimal - hh) * 60) - mm) * 60);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  })();
  const normalizedClock = /^\d{1,2}:\d{2}$/.test(birthClock) ? `${birthClock}:00` : birthClock;
  let age = target.year() - birthDate.year;
  const anniversary = moment.tz(
    `${target.year()}-${birthDate.month}-${birthDate.day} ${normalizedClock}`,
    "YYYY-M-D HH:mm:ss",
    true,
    location.timezone,
  );
  if (target.valueOf() < anniversary.valueOf()) age -= 1;
  return Math.max(0, age);
}

export function localBirthDateAtUtcMs(utcMs: number, coordinates: SelectedCity): BirthDate {
  const location = assertLocation(coordinates);
  const local = moment.utc(utcMs).tz(location.timezone);
  return {
    year: local.year(),
    month: local.month() + 1,
    day: local.date(),
    time: local.format("HH:mm:ss"),
    coordinates: { ...coordinates, timezone: location.timezone },
  };
}

function julianDayForMs(sw: any, utcMs: number): number {
  const date = new Date(utcMs);
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600 + date.getUTCMilliseconds() / 3600000;
  return sw.julianDay(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), hour, 1);
}

function rawPosition(sw: any, jd: number, bodyId: number): { longitude: number; latitude: number; speed: number } {
  const m = sw.module;
  const xxPtr = m._malloc(6 * 8);
  const serrPtr = m._malloc(256);
  try {
    const flag = m.ccall("swe_calc_ut_wrap", "number", ["number", "number", "number", "number", "number"], [jd, bodyId, 258, xxPtr, serrPtr]);
    if (flag < 0) throw new Error(m.UTF8ToString(serrPtr));
    return {
      longitude: normalize360(m.getValue(xxPtr, "double")),
      latitude: m.getValue(xxPtr + 8, "double"),
      speed: m.getValue(xxPtr + 3 * 8, "double"),
    };
  } finally {
    m._free(xxPtr);
    m._free(serrPtr);
  }
}

function rawHouses(sw: any, jd: number, location: SelectedCity, houseSystemCode: "R" | "P" = "R"): { cusps: number[]; asc: number; mc: number; armc: number } {
  const m = sw.module;
  const cuspsPtr = m._malloc(13 * 8);
  const ascmcPtr = m._malloc(10 * 8);
  try {
    m.ccall("swe_houses_wrap", "number", ["number", "number", "number", "number", "number", "number"], [
      jd,
      Number(location.latitude),
      Number(location.longitude),
      houseSystemCode.charCodeAt(0),
      cuspsPtr,
      ascmcPtr,
    ]);
    const cusps = Array.from({ length: 12 }, (_, index) => normalize360(m.getValue(cuspsPtr + (index + 1) * 8, "double")));
    return { cusps, asc: normalize360(m.getValue(ascmcPtr, "double")), mc: normalize360(m.getValue(ascmcPtr + 8, "double")), armc: normalize360(m.getValue(ascmcPtr + 2 * 8, "double")) };
  } finally {
    m._free(cuspsPtr);
    m._free(ascmcPtr);
  }
}


const MEAN_SOLAR_MOTION_DEG_PER_DAY = 0.98564736;
const MEAN_OBLIQUITY_DEG = 23.4392911;

function degToRad(value: number): number { return value * Math.PI / 180; }
function radToDeg(value: number): number { return value * 180 / Math.PI; }

/** Convert an ecliptic point (latitude 0) to right ascension. */
export function eclipticLongitudeToRightAscension(longitude: number, obliquityDeg = MEAN_OBLIQUITY_DEG): number {
  const lon = degToRad(normalize360(longitude));
  const eps = degToRad(obliquityDeg);
  return normalize360(radToDeg(Math.atan2(Math.sin(lon) * Math.cos(eps), Math.cos(lon))));
}

/** Convert right ascension back to the ecliptic (latitude 0). */
export function rightAscensionToEclipticLongitude(rightAscension: number, obliquityDeg = MEAN_OBLIQUITY_DEG): number {
  const ra = degToRad(normalize360(rightAscension));
  const eps = degToRad(obliquityDeg);
  return normalize360(radToDeg(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(eps))));
}

/**
 * Legacy point-wise RA translation retained only as a low-level comparison
 * helper. It is NOT the canonical method for progressed house angles because
 * Naibod in RA advances the RAMC and then rebuilds ASC/MC/cusps for latitude.
 */
export function progressPointByMeanSolarArc(longitude: number, ageYears: number): { longitude: number; arcDegrees: number } {
  const arcDegrees = ageYears * MEAN_SOLAR_MOTION_DEG_PER_DAY;
  const natalRa = eclipticLongitudeToRightAscension(longitude);
  return { longitude: rightAscensionToEclipticLongitude(natalRa + arcDegrees), arcDegrees };
}

const SIDEREAL_ROTATION_DEG_PER_SOLAR_DAY = 360.98564736629;

export interface NaibodProgressedHouses {
  cusps: number[];
  asc: number;
  mc: number;
  armc: number;
  natalArmc: number;
  targetArmc: number;
  arcDegrees: number;
  syntheticJulianDayUt: number;
}

/**
 * Canonical secondary-progressed angles for the predictive engine.
 *
 * `Naibod in RA` is an angle/house method: advance the natal RAMC by the
 * Naibod mean-solar arc, then derive MC, ASC and all house cusps from that
 * progressed RAMC at the birthplace latitude. We obtain the exact requested
 * RAMC through the existing Swiss `swe_houses` wrapper by solving for a nearby
 * synthetic Julian day. The synthetic day is only a geometry carrier; planet
 * progressions still use the independent day-for-year symbolic ephemeris.
 */
export async function calculateNaibodProgressedHouses(
  birthUtcMs: number,
  ageYears: number,
  locationInput: SelectedCity,
  houseSystemCode: "R" | "P",
  natalArmcInput?: number,
): Promise<NaibodProgressedHouses> {
  const location = assertLocation(locationInput);
  const sw = await getSwe();
  const natalJd = julianDayForMs(sw as any, birthUtcMs);
  const natalHouses = rawHouses(sw as any, natalJd, location, houseSystemCode);
  const natalArmc = Number.isFinite(Number(natalArmcInput)) ? normalize360(Number(natalArmcInput)) : natalHouses.armc;
  const arcDegrees = ageYears * MEAN_SOLAR_MOTION_DEG_PER_DAY;
  const targetArmc = normalize360(natalArmc + arcDegrees);

  // A nearby synthetic instant is enough because house geometry is periodic in
  // RAMC. Refine against Swiss' own ARMC, rather than assuming a perfectly
  // constant sidereal rate. This prevents accumulated angle error.
  // Anchor the geometry carrier near the day-for-year ephemeris date so Swiss
  // uses the obliquity appropriate to the progressed ephemeris epoch, while the
  // RAMC itself remains the deliberately Naibod-progressed natal RAMC.
  let jd = natalJd + ageYears;
  let houses = rawHouses(sw as any, jd, location, houseSystemCode);
  for (let i = 0; i < 8; i += 1) {
    const errorDeg = signedAngularDelta(houses.armc - targetArmc);
    if (Math.abs(errorDeg) < 1e-10) break;
    jd -= errorDeg / SIDEREAL_ROTATION_DEG_PER_SOLAR_DAY;
    houses = rawHouses(sw as any, jd, location, houseSystemCode);
  }

  return {
    ...houses,
    natalArmc,
    targetArmc,
    arcDegrees,
    syntheticJulianDayUt: jd,
  };
}
export async function bodyLongitudeAtMs(bodyId: number, utcMs: number): Promise<{ longitude: number; speed: number }> {
  const sw = await getSwe();
  const pos = rawPosition(sw as any, julianDayForMs(sw as any, utcMs), bodyId);
  return { longitude: pos.longitude, speed: pos.speed };
}

export async function calculatePredictiveSky(utcMs: number, locationInput: SelectedCity, houseSystemCode: "R" | "P" = "R"): Promise<PredictiveSkySnapshot> {
  const location = assertLocation(locationInput);
  const sw = await getSwe();
  const jd = julianDayForMs(sw as any, utcMs);
  const houses = rawHouses(sw as any, jd, location, houseSystemCode);
  const houseFor = (longitude: number) => houseIndexFromCusps(longitude, houses.cusps);
  const planets: PredictivePoint[] = TRADITIONAL_BODIES.map((body) => {
    const position = rawPosition(sw as any, jd, body.id);
    return {
      key: body.key,
      name: body.name,
      kind: "planet",
      longitude: position.longitude,
      sign: signName(position.longitude),
      house: houseFor(position.longitude),
      speed: position.speed,
      retrograde: position.speed < -1e-6,
    };
  });
  const trueNorth = rawPosition(sw as any, jd, 11);
  const southLongitude = normalize360(trueNorth.longitude + 180);
  const nodes: PredictivePoint[] = [
    { key: "north-node", name: "Nodo Norte", kind: "node", longitude: trueNorth.longitude, sign: signName(trueNorth.longitude), house: houseFor(trueNorth.longitude), speed: trueNorth.speed, retrograde: trueNorth.speed < -1e-6 },
    { key: "south-node", name: "Nodo Sul", kind: "node", longitude: southLongitude, sign: signName(southLongitude), house: houseFor(southLongitude), speed: trueNorth.speed, retrograde: trueNorth.speed < -1e-6 },
  ];
  const cusps = houses.cusps.map((longitude, index): PredictivePoint => ({
    key: `cusp-${index + 1}`,
    name: `Cúspide ${index + 1}`,
    kind: "cusp",
    longitude,
    sign: signName(longitude),
    house: index + 1,
  }));
  const dsc = normalize360(houses.asc + 180);
  const ic = normalize360(houses.mc + 180);
  const angles: PredictivePoint[] = [
    { key: "asc", name: "ASC", kind: "angle", longitude: houses.asc, sign: signName(houses.asc), house: 1 },
    { key: "dsc", name: "DSC", kind: "angle", longitude: dsc, sign: signName(dsc), house: 7 },
    { key: "mc", name: "MC", kind: "angle", longitude: houses.mc, sign: signName(houses.mc), house: 10 },
    { key: "ic", name: "IC", kind: "angle", longitude: ic, sign: signName(ic), house: 4 },
  ];
  const local = moment.utc(utcMs).tz(location.timezone);
  return {
    utcIso: new Date(utcMs).toISOString(),
    localIso: local.format(),
    timezone: location.timezone,
    julianDayUt: jd,
    location: { ...location },
    houseSystem: houseSystemCode === "P" ? "Placidus" : "Regiomontanus",
    houseSystemCode,
    planets,
    nodes,
    angles,
    cusps,
  };
}

export async function findNextSignIngress(
  planetName: string,
  fromUtcMs: number,
  horizonDays: number,
): Promise<{ utcMs: number; fromSign: string; toSign: string; direction: "direct" | "retrograde"; beforeLongitude: number; afterLongitude: number } | undefined> {
  const bodyId = BODY_ID_BY_NAME[planetName];
  if (bodyId === undefined) return undefined;
  const initial = await bodyLongitudeAtMs(bodyId, fromUtcMs);
  const initialSignIndex = Math.floor(normalize360(initial.longitude) / 30);
  const endMs = fromUtcMs + horizonDays * DAY_MS;
  // 12h steps are sufficient to bracket any planetary sign crossing; the exact
  // crossing is then refined by bisection. This also survives stations/reversals.
  const stepMs = 0.5 * DAY_MS;
  let previousMs = fromUtcMs;
  let previous = initial;
  for (let probeMs = Math.min(fromUtcMs + stepMs, endMs); probeMs <= endMs + 1; probeMs = Math.min(probeMs + stepMs, endMs)) {
    const current = await bodyLongitudeAtMs(bodyId, probeMs);
    const currentSignIndex = Math.floor(normalize360(current.longitude) / 30);
    if (currentSignIndex !== initialSignIndex) {
      let lo = previousMs;
      let hi = probeMs;
      for (let i = 0; i < 48 && hi - lo > 1000; i += 1) {
        const mid = (lo + hi) / 2;
        const midPos = await bodyLongitudeAtMs(bodyId, mid);
        const midSign = Math.floor(normalize360(midPos.longitude) / 30);
        if (midSign === initialSignIndex) lo = mid; else hi = mid;
      }
      const before = await bodyLongitudeAtMs(bodyId, Math.max(fromUtcMs, lo - 1000));
      const after = await bodyLongitudeAtMs(bodyId, hi + 1000);
      return {
        utcMs: hi,
        fromSign: signName(before.longitude),
        toSign: signName(after.longitude),
        direction: before.speed < 0 ? "retrograde" : "direct",
        beforeLongitude: before.longitude,
        afterLongitude: after.longitude,
      };
    }
    if (probeMs >= endMs) break;
    previousMs = probeMs;
    previous = current;
  }
  void previous;
  return undefined;
}

export async function findPreviousSignIngress(
  planetName: string,
  fromUtcMs: number,
  horizonDays: number,
): Promise<{ utcMs: number; fromSign: string; toSign: string; direction: "direct" | "retrograde"; beforeLongitude: number; afterLongitude: number } | undefined> {
  const bodyId = BODY_ID_BY_NAME[planetName];
  if (bodyId === undefined) return undefined;
  const initial = await bodyLongitudeAtMs(bodyId, fromUtcMs);
  const initialSignIndex = Math.floor(normalize360(initial.longitude) / 30);
  const endMs = fromUtcMs - horizonDays * DAY_MS;
  const stepMs = 0.5 * DAY_MS;
  let laterMs = fromUtcMs;
  for (let probeMs = Math.max(fromUtcMs - stepMs, endMs); probeMs >= endMs - 1; probeMs = Math.max(probeMs - stepMs, endMs)) {
    const current = await bodyLongitudeAtMs(bodyId, probeMs);
    const currentSignIndex = Math.floor(normalize360(current.longitude) / 30);
    if (currentSignIndex !== initialSignIndex) {
      let lo = probeMs;
      let hi = laterMs;
      // Find the first instant moving forward from lo that is in the current return sign.
      for (let i = 0; i < 48 && hi - lo > 1000; i += 1) {
        const mid = (lo + hi) / 2;
        const midPos = await bodyLongitudeAtMs(bodyId, mid);
        const midSign = Math.floor(normalize360(midPos.longitude) / 30);
        if (midSign === initialSignIndex) hi = mid; else lo = mid;
      }
      const before = await bodyLongitudeAtMs(bodyId, Math.max(endMs, lo - 1000));
      const after = await bodyLongitudeAtMs(bodyId, hi + 1000);
      return {
        utcMs: hi,
        fromSign: signName(before.longitude),
        toSign: signName(after.longitude),
        direction: after.speed < 0 ? "retrograde" : "direct",
        beforeLongitude: before.longitude,
        afterLongitude: after.longitude,
      };
    }
    if (probeMs <= endMs) break;
    laterMs = probeMs;
  }
  return undefined;
}

export async function findPreviousLongitudeReturn(
  bodyId: 0 | 1,
  targetLongitude: number,
  beforeUtcMs: number,
): Promise<{ utcMs: number; longitude: number; residualArcSeconds: number }> {
  const current = await bodyLongitudeAtMs(bodyId, beforeUtcMs);
  const cycleDays = bodyId === 0 ? 365.2422 : 27.321661;
  const speedFallback = bodyId === 0 ? 0.985647 : 13.1764;
  const separationSinceLast = normalize360(current.longitude - targetLongitude);
  let guess = beforeUtcMs - (separationSinceLast / Math.max(Math.abs(current.speed), speedFallback * 0.5)) * DAY_MS;

  async function refine(start: number): Promise<number> {
    let t = start;
    for (let iteration = 0; iteration < 16; iteration += 1) {
      const p = await bodyLongitudeAtMs(bodyId, t);
      const error = signedAngularDelta(p.longitude - targetLongitude);
      const speed = Math.abs(p.speed) > 1e-6 ? p.speed : speedFallback;
      const correctionDays = error / speed;
      t -= correctionDays * DAY_MS;
      if (Math.abs(error) < 1e-8) break;
    }
    return t;
  }

  guess = await refine(guess);
  if (guess > beforeUtcMs + 1000) guess = await refine(guess - cycleDays * DAY_MS);
  if (beforeUtcMs - guess > cycleDays * 1.25 * DAY_MS) guess = await refine(guess + cycleDays * DAY_MS);
  if (guess > beforeUtcMs + 1000) guess = await refine(guess - cycleDays * DAY_MS);

  const exact = await bodyLongitudeAtMs(bodyId, guess);
  return {
    utcMs: guess,
    longitude: exact.longitude,
    residualArcSeconds: circularDistance(exact.longitude, targetLongitude) * 3600,
  };
}

export function essentialCondition(point: PredictivePoint): EssentialConditionSnapshot {
  const signIndex = Math.floor(normalize360(point.longitude) / 30) % 12;
  const degreeInSign = normalize360(point.longitude) % 30;
  const planet = point.name;
  const exaltations: Record<string, number> = { Sol: 0, Lua: 1, Mercúrio: 5, Vênus: 11, Marte: 9, Júpiter: 3, Saturno: 6 };
  const detriments: Record<string, number[]> = { Sol: [10], Lua: [9], Mercúrio: [8, 11], Vênus: [0, 7], Marte: [1, 6], Júpiter: [2, 5], Saturno: [3, 4] };
  const falls: Record<string, number> = { Sol: 6, Lua: 7, Mercúrio: 11, Vênus: 5, Marte: 3, Júpiter: 9, Saturno: 0 };
  const domicile = DOMICILE_RULER[signIndex] === planet;
  const exaltation = exaltations[planet] === signIndex;
  const detriment = detriments[planet]?.includes(signIndex) ?? false;
  const fall = falls[planet] === signIndex;
  const labels = [domicile ? "domicílio" : "", exaltation ? "exaltação" : "", detriment ? "exílio" : "", fall ? "queda" : ""].filter(Boolean);
  return { point: planet, longitude: point.longitude, sign: SIGNS[signIndex], degreeInSign, domicile, exaltation, detriment, fall, labels };
}

export function rulerForLongitude(longitude: number): string {
  return DOMICILE_RULER[Math.floor(normalize360(longitude) / 30) % 12];
}
