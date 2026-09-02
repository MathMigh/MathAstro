import { BirthChart, Planet, PlanetType } from "@/interfaces/BirthChartInterfaces";
import { calculateArabicLots, ORDERED_ARABIC_PART_KEYS } from "./arabicLots";
import { getSwe } from "./astrologyEngine";
import {
  getAspectTypeFromSigns,
  getDegreeInSign,
  getSignDistance,
  getTraditionalAspectOrbFromLongitudes,
  normalizeLongitude,
} from "./aspectDynamics";
import { getHouseIndex } from "./traditionalCalculations";
import { SIGNS } from "./traditionalTables";
import { MARCOS_CUSP_BASE_MAX_DEGREES, MARCOS_NATAL_INFLUENCE_MAX_ORB } from "@/traditions/western/natal/natalMethodConstants";

const SWISS_IDS: Partial<Record<PlanetType, number>> = {
  sun: 0,
  moon: 1,
  mercury: 2,
  venus: 3,
  mars: 4,
  jupiter: 5,
  saturn: 6,
  uranus: 7,
  neptune: 8,
  pluto: 9,
  northNode: 11,
};

const TRADITIONAL_TYPES = new Set<PlanetType>([
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
]);

const SCAN_STEP_DAYS: Partial<Record<PlanetType, number>> = {
  moon: 0.125,
  mercury: 0.25,
  venus: 0.25,
  sun: 0.5,
  mars: 0.5,
  jupiter: 2,
  saturn: 4,
};

export interface PrecisionIngress {
  direction: "previous" | "next";
  julianDayUt: number;
  deltaDays: number;
  fromSign: string;
  toSign: string;
  longitude: number;
}

export interface PrecisionStation {
  julianDayUt: number;
  deltaDays: number;
  kind: "station-retrograde" | "station-direct";
  longitude: number;
}

export interface BoundaryDynamics {
  planet: string;
  currentSign: string;
  currentLongitude: number;
  previousIngress: PrecisionIngress | null;
  nextIngress: PrecisionIngress | null;
  nextStationBeforeIngress: PrecisionStation | null;
}

export interface ExactAspectDynamics {
  first: string;
  second: string;
  aspect: string;
  currentOrb: number;
  currentMotion: "applying" | "separating" | "stationary-relative";
  influenceBandMarcos: "strong" | "weak";
  previousPerfectionJd: number | null;
  previousPerfectionDaysAgo: number | null;
  nextPerfectionJd: number | null;
  nextPerfectionDays: number | null;
  perfectionStatus: "already-perfected" | "will-perfect" | "blocked" | "no-nearby-perfection";
  blocker: "ingress" | "relative-motion-reversal" | null;
  blockerJd: number | null;
  evidence: string;
}

export interface PrecisionHousePlacement {
  point: string;
  longitude: number;
  geometricHouse: number;
  currentCusp: number;
  currentCuspLongitude: number;
  distanceFromCurrentCusp: number;
  nextCusp: number;
  nextCuspLongitude: number;
  distanceToNextCusp: number;
  sameSignAsNextCusp: boolean;
  longitudeSpeed: number | null;
  motionTowardNextCusp: "applying" | "separating" | "stationary" | "not-applicable";
  houseArcSize: number;
  distanceFractionOfHouse: number;
  fiveDegreesFractionOfHouse: number;
  withinTwoDegreesSameSign: boolean;
  withinThreeDegreesSameSign: boolean;
  withinMarcosBaseFiveDegrees: boolean;
  sourceDecision: "BASE_ACCEPT" | "SIGN_BARRIER" | "OUTSIDE_BASE_AUTHORIAL_REVIEW";
}

export interface PrenatalSyzygy {
  type: "new-moon" | "full-moon";
  julianDayUt: number;
  daysBeforeBirth: number;
  longitude: number;
}

export interface LunationRecord {
  type: "new-moon" | "full-moon";
  direction: "previous" | "next";
  julianDayUt: number;
  deltaDays: number;
  sunLongitude: number;
  moonLongitude: number;
  moonLatitude: number;
  trueNodeDistance: number;
  eclipseGeometryCandidate: boolean;
  physicalEclipse: {
    isEclipse: boolean;
    kind: "none" | "solar-total" | "solar-annular" | "solar-hybrid" | "solar-partial" | "lunar-total" | "lunar-partial" | "lunar-penumbral";
    maximumJulianDayUt: number | null;
    maximumDeltaDaysFromLunation: number | null;
    phaseBeginJulianDayUt: number | null;
    phaseEndJulianDayUt: number | null;
    eclipseTypeFlags: number | null;
    source: "SwissEphemeris-eclipse-search" | "eclipse-api-unavailable";
  };
  classificationStatus: "physical-eclipse-classified" | "eclipse-api-unavailable";
  /** Full traditional-planet snapshot at the exact syzygy. */
  traditionalPlanetSnapshot: Array<{
    name: string;
    longitude: number;
    latitude: number;
    longitudeSpeed: number;
  }>;
}

export interface PrenatalLunationNatalLink {
  lunationType: "new-moon" | "full-moon";
  isPhysicalEclipse: boolean;
  lunationJulianDayUt: number;
  source: string;
  sourceLongitude: number;
  target: string;
  targetType: "natal-planet" | "natal-cusp" | "natal-lot";
  targetLongitude: number;
  aspect: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
  screeningBand: "CORE_0_3" | "CONTEXTUAL_3_5";
  interpretationStatus: "RAW_PRENATAL_LINK_AUTHORIAL_SYNTHESIS_REQUIRED";
}

export interface NatalPrecisionData {
  schemaVersion: "1.0.0";
  principle: "astronomia-e-geometria-resolvidas-antes-da-interpretacao";
  julianDayUt: number;
  planets: Array<{
    name: string;
    longitude: number;
    latitude: number | null;
    longitudeSpeed: number;
    latitudeSpeed: number | null;
    rightAscension: number | null;
    declination: number | null;
    distanceAu: number | null;
    retrograde: boolean;
    antiscion: number;
    contraAntiscion: number;
    elongationFromSun: number | null;
  }>;
  houses: {
    regiomontanus: number[];
    placidus: number[] | null;
  };
  placements: PrecisionHousePlacement[];
  boundaryDynamics: BoundaryDynamics[];
  exactAspectDynamics: ExactAspectDynamics[];
  prenatalSyzygy: PrenatalSyzygy | null;
  lunations: LunationRecord[];
  prenatalLunationNatalLinks: PrenatalLunationNatalLink[];
  nodes: {
    trueNorthLongitude: number;
    trueSouthLongitude: number;
    meanNorthLongitude: number;
    meanSouthLongitude: number;
  } | null;
  cautions: string[];
}

type RawPosition = {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  latitudeSpeed: number;
  distanceSpeed: number;
};

function safeCalc(sw: any, jd: number, bodyId: number, flags = 258): RawPosition {
  const m = sw.module;
  const xxPtr = m._malloc(6 * 8);
  const serrPtr = m._malloc(512);
  try {
    const retflag = m.ccall(
      "swe_calc_ut_wrap",
      "number",
      ["number", "number", "number", "number", "number"],
      [jd, bodyId, flags, xxPtr, serrPtr],
    );
    if (retflag < 0) throw new Error(m.UTF8ToString(serrPtr));
    const xx = Array.from({ length: 6 }, (_, index) =>
      m.getValue(xxPtr + index * 8, "double") as number
    );
    return {
      longitude: xx[0], latitude: xx[1], distance: xx[2],
      longitudeSpeed: xx[3], latitudeSpeed: xx[4], distanceSpeed: xx[5],
    };
  } finally {
    m._free(xxPtr);
    m._free(serrPtr);
  }
}

function signIndex(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12;
}

function signedAngular(value: number): number {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function bisection(
  fn: (jd: number) => number,
  left: number,
  right: number,
  iterations = 55,
): number {
  let a = left;
  let b = right;
  let fa = fn(a);
  for (let index = 0; index < iterations; index += 1) {
    const middle = (a + b) / 2;
    const fm = fn(middle);
    if (Math.abs(fm) < 1e-10) return middle;
    if (fa === 0 || fa * fm <= 0) {
      b = middle;
    } else {
      a = middle;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

function getBodyId(planet: Planet): number | null {
  if (planet.type === "southNode") return null;
  return SWISS_IDS[planet.type] ?? null;
}

function refineSignTransition(
  sw: any,
  bodyId: number,
  firstJd: number,
  secondJd: number,
): { julianDayUt: number; fromSign: string; toSign: string; longitude: number } | null {
  let left = Math.min(firstJd, secondJd);
  let right = Math.max(firstJd, secondJd);
  let leftSign = signIndex(safeCalc(sw, left, bodyId).longitude);
  let rightSign = signIndex(safeCalc(sw, right, bodyId).longitude);
  if (leftSign === rightSign) return null;

  // Refine the discrete sign transition rather than solving against an assumed
  // zodiac boundary. This is robust for direct/retrograde motion and prevents
  // impossible outputs such as Libra→Libra.
  for (let iteration = 0; iteration < 80 && right - left > 1e-9; iteration += 1) {
    const mid = (left + right) / 2;
    const midSign = signIndex(safeCalc(sw, mid, bodyId).longitude);
    if (midSign === leftSign) {
      left = mid;
    } else {
      right = mid;
      rightSign = midSign;
    }
  }

  const root = (left + right) / 2;
  const before = safeCalc(sw, Math.max(left, root - 1e-6), bodyId).longitude;
  const after = safeCalc(sw, Math.min(right, root + 1e-6), bodyId).longitude;
  const fromIndex = signIndex(before);
  const toIndex = signIndex(after);
  if (fromIndex === toIndex) {
    // Numerical edge exactly on the boundary: use the bracket's known signs.
    if (leftSign === rightSign) return null;
    return {
      julianDayUt: root,
      fromSign: SIGNS[leftSign],
      toSign: SIGNS[rightSign],
      longitude: safeCalc(sw, root, bodyId).longitude,
    };
  }
  return {
    julianDayUt: root,
    fromSign: SIGNS[fromIndex],
    toSign: SIGNS[toIndex],
    longitude: safeCalc(sw, root, bodyId).longitude,
  };
}

function findIngress(
  sw: any,
  planet: Planet,
  birthJd: number,
  direction: 1 | -1,
): PrecisionIngress | null {
  const bodyId = getBodyId(planet);
  if (bodyId === null || !TRADITIONAL_TYPES.has(planet.type)) return null;
  const stepMagnitude = SCAN_STEP_DAYS[planet.type] ?? 1;
  const maxDays = 1200;
  let previousJd = birthJd;
  let previousSign = signIndex(safeCalc(sw, birthJd, bodyId).longitude);

  for (let elapsed = stepMagnitude; elapsed <= maxDays; elapsed += stepMagnitude) {
    const candidateJd = birthJd + elapsed * direction;
    const candidateSign = signIndex(safeCalc(sw, candidateJd, bodyId).longitude);
    if (candidateSign !== previousSign) {
      const transition = refineSignTransition(sw, bodyId, previousJd, candidateJd);
      if (!transition || transition.fromSign === transition.toSign) return null;
      return {
        direction: direction > 0 ? "next" : "previous",
        julianDayUt: transition.julianDayUt,
        deltaDays: transition.julianDayUt - birthJd,
        fromSign: transition.fromSign,
        toSign: transition.toSign,
        longitude: transition.longitude,
      };
    }
    previousJd = candidateJd;
    previousSign = candidateSign;
  }
  return null;
}

function findStationBetween(
  sw: any,
  planet: Planet,
  birthJd: number,
  endJd: number,
): PrecisionStation | null {
  const bodyId = getBodyId(planet);
  if (bodyId === null || !TRADITIONAL_TYPES.has(planet.type)) return null;
  const direction = endJd >= birthJd ? 1 : -1;
  const span = Math.abs(endJd - birthJd);
  const step = Math.min(0.5, Math.max(0.05, span / 80));
  let previousJd = birthJd;
  let previousSpeed = safeCalc(sw, previousJd, bodyId).longitudeSpeed;
  for (let elapsed = step; elapsed <= span + 1e-9; elapsed += step) {
    const candidateJd = birthJd + elapsed * direction;
    const candidateSpeed = safeCalc(sw, candidateJd, bodyId).longitudeSpeed;
    if (previousSpeed === 0 || previousSpeed * candidateSpeed < 0) {
      const a = Math.min(previousJd, candidateJd);
      const b = Math.max(previousJd, candidateJd);
      const root = bisection((jd) => safeCalc(sw, jd, bodyId).longitudeSpeed, a, b);
      const beforeSpeed = safeCalc(sw, root - 1e-4, bodyId).longitudeSpeed;
      const afterSpeed = safeCalc(sw, root + 1e-4, bodyId).longitudeSpeed;
      return {
        julianDayUt: root,
        deltaDays: root - birthJd,
        kind: beforeSpeed < 0 && afterSpeed > 0 ? "station-direct" : "station-retrograde",
        longitude: safeCalc(sw, root, bodyId).longitude,
      };
    }
    previousJd = candidateJd;
    previousSpeed = candidateSpeed;
  }
  return null;
}

function buildBoundaryDynamics(sw: any, chart: BirthChart, birthJd: number): BoundaryDynamics[] {
  return chart.planets
    .filter((planet) => TRADITIONAL_TYPES.has(planet.type))
    .map((planet) => {
      const previousIngress = findIngress(sw, planet, birthJd, -1);
      const nextIngress = findIngress(sw, planet, birthJd, 1);
      const nextStationBeforeIngress = nextIngress
        ? findStationBetween(sw, planet, birthJd, nextIngress.julianDayUt)
        : null;
      return {
        planet: planet.name,
        currentSign: planet.sign,
        currentLongitude: planet.longitudeRaw,
        previousIngress,
        nextIngress,
        nextStationBeforeIngress,
      };
    });
}

function findRootInInterval(
  fn: (jd: number) => number,
  start: number,
  end: number,
  step: number,
): number | null {
  const direction = end >= start ? 1 : -1;
  const span = Math.abs(end - start);
  let prevJd = start;
  let prev = fn(prevJd);
  for (let elapsed = step; elapsed < span; elapsed += step) {
    const jd = start + elapsed * direction;
    const value = fn(jd);
    if (Math.abs(value - prev) < 90 && (value === 0 || prev === 0 || value * prev < 0)) {
      return bisection(fn, Math.min(prevJd, jd), Math.max(prevJd, jd));
    }
    prevJd = jd;
    prev = value;
  }

  // Examine the exact endpoint as well. An exactitude can occur in the last
  // fraction of the interval immediately after an ingress; skipping that tail
  // produced a false negative in the Barra Mansa regression (Lua-Saturno).
  if (span > 0) {
    const value = fn(end);
    if (Math.abs(value - prev) < 90 && (value === 0 || prev === 0 || value * prev < 0)) {
      return bisection(fn, Math.min(prevJd, end), Math.max(prevJd, end));
    }
  }
  return null;
}

function calculateExactAspectDynamics(
  sw: any,
  chart: BirthChart,
  birthJd: number,
  boundaries: BoundaryDynamics[],
): ExactAspectDynamics[] {
  const planets = chart.planets.filter((planet) => TRADITIONAL_TYPES.has(planet.type));
  const results: ExactAspectDynamics[] = [];

  for (let firstIndex = 0; firstIndex < planets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < planets.length; secondIndex += 1) {
      const first = planets[firstIndex];
      const second = planets[secondIndex];
      const aspect = getAspectTypeFromSigns(first.longitudeRaw, second.longitudeRaw);
      if (!aspect) continue;
      const currentOrb = getTraditionalAspectOrbFromLongitudes(
        first.longitudeRaw, second.longitudeRaw, aspect,
      );
      if (currentOrb > MARCOS_NATAL_INFLUENCE_MAX_ORB) continue; // Marcos: <=3° é núcleo; >3° até 5° permanece contextual; acima disso sai do gate genérico.
      const firstId = getBodyId(first)!;
      const secondId = getBodyId(second)!;
      const signDistance = getSignDistance(first.longitudeRaw, second.longitudeRaw);
      const signedSignDistance = signDistance <= 6 ? signDistance : signDistance - 12;
      const targetAngle = signedSignDistance * 30;
      const errorAt = (jd: number) => signedAngular(
        (safeCalc(sw, jd, secondId).longitude - safeCalc(sw, jd, firstId).longitude) - targetAngle,
      );
      const orbNow = Math.abs(errorAt(birthJd));
      const orbSoon = Math.abs(errorAt(birthJd + 0.01));
      const currentMotion: ExactAspectDynamics["currentMotion"] =
        Math.abs(orbSoon - orbNow) < 1e-6 ? "stationary-relative"
          : orbSoon < orbNow ? "applying" : "separating";

      const firstBoundary = boundaries.find((entry) => entry.planet === first.name);
      const secondBoundary = boundaries.find((entry) => entry.planet === second.name);
      const futureLimit = Math.min(
        firstBoundary?.nextIngress?.julianDayUt ?? birthJd + 120,
        secondBoundary?.nextIngress?.julianDayUt ?? birthJd + 120,
      );
      const pastLimit = Math.max(
        firstBoundary?.previousIngress?.julianDayUt ?? birthJd - 120,
        secondBoundary?.previousIngress?.julianDayUt ?? birthJd - 120,
      );
      const scanStep = (first.type === "moon" || second.type === "moon") ? 0.02 : 0.08;
      const previousRoot = findRootInInterval(errorAt, birthJd - 1e-5, pastLimit, scanStep);
      const nextRoot = findRootInInterval(errorAt, birthJd + 1e-5, futureLimit, scanStep);

      let blocker: ExactAspectDynamics["blocker"] = null;
      let blockerJd: number | null = null;
      if (!nextRoot && currentMotion === "applying") {
        const relativeSpeed = (jd: number) =>
          safeCalc(sw, jd, secondId).longitudeSpeed - safeCalc(sw, jd, firstId).longitudeSpeed;
        const reversal = findRootInInterval(relativeSpeed, birthJd, futureLimit, 0.05);
        if (reversal) {
          blocker = "relative-motion-reversal";
          blockerJd = reversal;
        } else {
          blocker = "ingress";
          blockerJd = futureLimit;
        }
      }

      const perfectionStatus: ExactAspectDynamics["perfectionStatus"] = nextRoot
        ? "will-perfect"
        : blocker
          ? "blocked"
          : previousRoot
            ? "already-perfected"
            : "no-nearby-perfection";

      results.push({
        first: first.name,
        second: second.name,
        aspect,
        currentOrb,
        currentMotion,
        influenceBandMarcos: currentOrb <= 3 ? "strong" : "weak",
        previousPerfectionJd: previousRoot,
        previousPerfectionDaysAgo: previousRoot ? birthJd - previousRoot : null,
        nextPerfectionJd: nextRoot,
        nextPerfectionDays: nextRoot ? nextRoot - birthJd : null,
        perfectionStatus,
        blocker,
        blockerJd,
        evidence: nextRoot
          ? `Perfeição efemérica encontrada antes de qualquer ingresso relevante.`
          : blocker === "relative-motion-reversal"
            ? `O orbe diminui no instante natal, mas a velocidade relativa se inverte antes da perfeição.`
            : blocker === "ingress"
              ? `O aspecto não aperfeiçoa antes de uma fronteira de signo.`
              : previousRoot
                ? `A perfeição ocorreu antes do nascimento; aspecto separativo no quadro natal.`
                : `Sem perfeição próxima dentro da relação zodiacal atual.`,
      });
    }
  }

  return results.sort((a, b) => a.currentOrb - b.currentOrb);
}

function buildPlacement(chart: BirthChart, point: string, longitude: number): PrecisionHousePlacement {
  const cusps = chart.housesData.house;
  const geometricHouse = getHouseIndex(longitude, cusps);
  const currentCusp = geometricHouse;
  const nextCusp = geometricHouse === 12 ? 1 : geometricHouse + 1;
  const currentCuspLongitude = cusps[currentCusp - 1];
  const nextCuspLongitude = cusps[nextCusp - 1];
  const distanceFromCurrentCusp = normalizeLongitude(longitude - currentCuspLongitude);
  const distanceToNextCusp = normalizeLongitude(nextCuspLongitude - longitude);
  const houseArcSize = normalizeLongitude(nextCuspLongitude - currentCuspLongitude);
  const sameSignAsNextCusp = signIndex(longitude) === signIndex(nextCuspLongitude);
  const planet = chart.planets.find((candidate) => candidate.name === point);
  const longitudeSpeed = planet?.longitudeSpeed ?? null;
  const motionTowardNextCusp = longitudeSpeed === null
    ? "not-applicable"
    : Math.abs(longitudeSpeed) < 1e-5
      ? "stationary"
      : longitudeSpeed > 0
        ? "applying"
        : "separating";
  return {
    point,
    longitude,
    geometricHouse,
    currentCusp,
    currentCuspLongitude,
    distanceFromCurrentCusp,
    nextCusp,
    nextCuspLongitude,
    distanceToNextCusp,
    sameSignAsNextCusp,
    longitudeSpeed,
    motionTowardNextCusp,
    houseArcSize,
    distanceFractionOfHouse: houseArcSize > 0 ? distanceToNextCusp / houseArcSize : 0,
    fiveDegreesFractionOfHouse: houseArcSize > 0 ? MARCOS_CUSP_BASE_MAX_DEGREES / houseArcSize : 0,
    withinTwoDegreesSameSign: distanceToNextCusp <= 2 && sameSignAsNextCusp,
    withinThreeDegreesSameSign: distanceToNextCusp <= 3 && sameSignAsNextCusp,
    withinMarcosBaseFiveDegrees: distanceToNextCusp <= MARCOS_CUSP_BASE_MAX_DEGREES && sameSignAsNextCusp,
    sourceDecision: !sameSignAsNextCusp
      ? "SIGN_BARRIER"
      : distanceToNextCusp <= MARCOS_CUSP_BASE_MAX_DEGREES
        ? "BASE_ACCEPT"
        : "OUTSIDE_BASE_AUTHORIAL_REVIEW",
  };
}

function calculatePrenatalSyzygy(sw: any, birthJd: number): PrenatalSyzygy | null {
  const phaseError = (target: 0 | 180) => (jd: number) => signedAngular(
    (safeCalc(sw, jd, 1).longitude - safeCalc(sw, jd, 0).longitude) - target,
  );
  const candidates: PrenatalSyzygy[] = [];
  for (const target of [0, 180] as const) {
    const fn = phaseError(target);
    let end = birthJd - 1e-5;
    let root: number | null = null;
    // Search backwards in small windows to avoid the 180° wrapping discontinuity.
    for (let offset = 0; offset < 32 && !root; offset += 0.25) {
      const a = end - offset;
      const b = a - 0.25;
      const fa = fn(a);
      const fb = fn(b);
      if (Math.abs(fa - fb) < 90 && (fa === 0 || fb === 0 || fa * fb < 0)) {
        root = bisection(fn, b, a);
      }
    }
    if (root) {
      candidates.push({
        type: target === 0 ? "new-moon" : "full-moon",
        julianDayUt: root,
        daysBeforeBirth: birthJd - root,
        longitude: safeCalc(sw, root, 0).longitude,
      });
    }
  }
  return candidates.sort((a, b) => a.daysBeforeBirth - b.daysBeforeBirth)[0] ?? null;
}

function classifyPhysicalEclipse(sw: any, lunationJd: number, type: "new-moon" | "full-moon"): LunationRecord["physicalEclipse"] {
  const methodName = type === "new-moon" ? "findNextSolarEclipse" : "findNextLunarEclipse";
  if (!sw || typeof sw[methodName] !== "function") {
    return {
      isEclipse: false, kind: "none", maximumJulianDayUt: null, maximumDeltaDaysFromLunation: null,
      phaseBeginJulianDayUt: null, phaseEndJulianDayUt: null, eclipseTypeFlags: null, source: "eclipse-api-unavailable",
    };
  }
  try {
    // Starting one day before the exact syzygy ensures that an eclipse belonging to this
    // lunation is the next event. Membership is then decided by the physical contact
    // interval, not by an invented nodal orb.
    const eclipse = sw[methodName](lunationJd - 1);
    if (!eclipse || !Number.isFinite(eclipse.maximum)) throw new Error("invalid eclipse result");
    const phaseBegin = type === "new-moon" ? eclipse.partialBegin : eclipse.penumbralBegin;
    const phaseEnd = type === "new-moon" ? eclipse.partialEnd : eclipse.penumbralEnd;
    const isPhysicalMember = Number.isFinite(phaseBegin) && Number.isFinite(phaseEnd) && phaseBegin > 0 && phaseEnd > 0
      && lunationJd >= phaseBegin - 1e-7 && lunationJd <= phaseEnd + 1e-7;
    if (!isPhysicalMember) {
      return {
        isEclipse: false, kind: "none", maximumJulianDayUt: null, maximumDeltaDaysFromLunation: null,
        phaseBeginJulianDayUt: null, phaseEndJulianDayUt: null, eclipseTypeFlags: null, source: "SwissEphemeris-eclipse-search",
      };
    }
    let kind: LunationRecord["physicalEclipse"]["kind"] = "none";
    if (type === "new-moon") {
      if (typeof eclipse.isTotal === "function" && eclipse.isTotal()) kind = "solar-total";
      else if (typeof eclipse.isAnnular === "function" && eclipse.isAnnular()) kind = "solar-annular";
      else if (typeof eclipse.isHybrid === "function" && eclipse.isHybrid()) kind = "solar-hybrid";
      else kind = "solar-partial";
    } else {
      if (typeof eclipse.isTotal === "function" && eclipse.isTotal()) kind = "lunar-total";
      else if (typeof eclipse.isPartial === "function" && eclipse.isPartial()) kind = "lunar-partial";
      else kind = "lunar-penumbral";
    }
    return {
      isEclipse: true,
      kind,
      maximumJulianDayUt: eclipse.maximum,
      maximumDeltaDaysFromLunation: eclipse.maximum - lunationJd,
      phaseBeginJulianDayUt: phaseBegin,
      phaseEndJulianDayUt: phaseEnd,
      eclipseTypeFlags: Number.isFinite(eclipse.type) ? eclipse.type : null,
      source: "SwissEphemeris-eclipse-search",
    };
  } catch {
    return {
      isEclipse: false, kind: "none", maximumJulianDayUt: null, maximumDeltaDaysFromLunation: null,
      phaseBeginJulianDayUt: null, phaseEndJulianDayUt: null, eclipseTypeFlags: null, source: "eclipse-api-unavailable",
    };
  }
}

function findNearestLunation(
  sw: any,
  birthJd: number,
  target: 0 | 180,
  direction: -1 | 1,
): LunationRecord | null {
  const phaseError = (jd: number) => signedAngular(
    (safeCalc(sw, jd, 1).longitude - safeCalc(sw, jd, 0).longitude) - target,
  );
  const step = 0.2;
  const maxDays = 35;
  let previousJd = birthJd + direction * 1e-5;
  let previousValue = phaseError(previousJd);
  for (let elapsed = step; elapsed <= maxDays; elapsed += step) {
    const jd = birthJd + direction * elapsed;
    const value = phaseError(jd);
    if (Math.abs(value - previousValue) < 90 && (value === 0 || previousValue === 0 || value * previousValue < 0)) {
      const root = bisection(phaseError, Math.min(previousJd, jd), Math.max(previousJd, jd));
      const sun = safeCalc(sw, root, 0);
      const moon = safeCalc(sw, root, 1);
      const node = safeCalc(sw, root, 11);
      const south = normalizeLongitude(node.longitude + 180);
      const nodeDistance = Math.min(
        Math.abs(signedAngular(sun.longitude - node.longitude)),
        Math.abs(signedAngular(sun.longitude - south)),
      );
      const lunationType = target === 0 ? "new-moon" : "full-moon";
      const physicalEclipse = classifyPhysicalEclipse(sw, root, lunationType);
      const traditionalPlanetSnapshot = ([
        ["Sol", 0], ["Lua", 1], ["Mercúrio", 2], ["Vênus", 3], ["Marte", 4], ["Júpiter", 5], ["Saturno", 6],
      ] as const).map(([name, id]) => {
        const position = safeCalc(sw, root, id);
        return { name, longitude: position.longitude, latitude: position.latitude, longitudeSpeed: position.longitudeSpeed };
      });
      return {
        type: lunationType,
        direction: direction < 0 ? "previous" : "next",
        julianDayUt: root,
        deltaDays: root - birthJd,
        sunLongitude: sun.longitude,
        moonLongitude: moon.longitude,
        moonLatitude: moon.latitude,
        trueNodeDistance: nodeDistance,
        eclipseGeometryCandidate: nodeDistance <= 18,
        physicalEclipse,
        classificationStatus: physicalEclipse.source === "SwissEphemeris-eclipse-search"
          ? "physical-eclipse-classified"
          : "eclipse-api-unavailable",
        traditionalPlanetSnapshot,
      };
    }
    previousJd = jd;
    previousValue = value;
  }
  return null;
}

function calculateLunationPacket(sw: any, birthJd: number): LunationRecord[] {
  return ([0, 180] as const).flatMap((target) =>
    ([-1, 1] as const).flatMap((direction) => {
      const value = findNearestLunation(sw, birthJd, target, direction);
      return value ? [value] : [];
    })
  ).sort((a, b) => a.julianDayUt - b.julianDayUt);
}

function buildPrenatalLunationNatalLinks(chart: BirthChart, lunations: LunationRecord[]): PrenatalLunationNatalLink[] {
  const lots = calculateArabicLots(chart);
  const targets = [
    ...chart.planets.filter((planet) => TRADITIONAL_TYPES.has(planet.type)).map((planet) => ({
      target: planet.name, targetType: "natal-planet" as const, longitude: planet.longitudeRaw,
    })),
    ...chart.housesData.house.map((longitude, index) => ({
      target: `Cúspide ${index + 1}`, targetType: "natal-cusp" as const, longitude,
    })),
    ...ORDERED_ARABIC_PART_KEYS.flatMap((key) => {
      const lot = lots[key];
      return lot ? [{ target: `Parte ${lot.name}`, targetType: "natal-lot" as const, longitude: lot.longitude }] : [];
    }),
  ];
  const links: PrenatalLunationNatalLink[] = [];
  lunations.filter((lunation) => lunation.direction === "previous").forEach((lunation) => {
    lunation.traditionalPlanetSnapshot.forEach((source) => {
      targets.forEach((target) => {
        const aspect = getAspectTypeFromSigns(source.longitude, target.longitude);
        if (!aspect) return;
        const orb = getTraditionalAspectOrbFromLongitudes(source.longitude, target.longitude, aspect);
        // This is a screening window, not a claimed special eclipse orb. Marcos' Guénon
        // example shows that prenatal lunation/eclipse contacts to natal cusps/planets
        // can matter, but the recovered example does not publish a dedicated universal
        // cutoff for this comparison. We preserve the ordinary 3°/5° natal bands only
        // as a compact candidate screen and require authorial synthesis downstream.
        if (orb > 5) return;
        links.push({
          lunationType: lunation.type,
          isPhysicalEclipse: lunation.physicalEclipse.isEclipse,
          lunationJulianDayUt: lunation.julianDayUt,
          source: source.name,
          sourceLongitude: source.longitude,
          target: target.target,
          targetType: target.targetType,
          targetLongitude: target.longitude,
          aspect,
          orb,
          screeningBand: orb <= 3 ? "CORE_0_3" : "CONTEXTUAL_3_5",
          interpretationStatus: "RAW_PRENATAL_LINK_AUTHORIAL_SYNTHESIS_REQUIRED",
        });
      });
    });
  });
  return links.sort((a, b) => a.orb - b.orb);
}

export async function calculateNatalPrecision(chart: BirthChart): Promise<NatalPrecisionData> {
  const birthJd = chart.calculationMetadata?.julianDayUt;
  if (!Number.isFinite(birthJd)) throw new Error("JD(UT) ausente para o modulo de precisão natal.");
  const sw = await getSwe();
  const sun = chart.planets.find((planet) => planet.type === "sun")!;
  const boundaries = buildBoundaryDynamics(sw as any, chart, birthJd!);
  const lots = calculateArabicLots(chart);
  const placements = [
    ...chart.planets.map((planet) => buildPlacement(chart, planet.name, planet.longitudeRaw)),
    ...ORDERED_ARABIC_PART_KEYS.flatMap((key) => {
      const lot = lots[key];
      return lot ? [buildPlacement(chart, `Parte ${lot.name}`, lot.longitude)] : [];
    }),
  ];
  const lunations = calculateLunationPacket(sw as any, birthJd!);

  return {
    schemaVersion: "1.0.0",
    principle: "astronomia-e-geometria-resolvidas-antes-da-interpretacao",
    julianDayUt: birthJd!,
    planets: chart.planets.map((planet) => ({
      name: planet.name,
      longitude: planet.longitudeRaw,
      latitude: planet.latitudeRaw ?? null,
      longitudeSpeed: planet.longitudeSpeed,
      latitudeSpeed: planet.latitudeSpeed ?? null,
      rightAscension: planet.rightAscension ?? null,
      declination: planet.declination ?? null,
      distanceAu: planet.distanceRaw ?? null,
      retrograde: planet.isRetrograde,
      antiscion: planet.antiscionRaw,
      contraAntiscion: normalizeLongitude(planet.antiscionRaw + 180),
      elongationFromSun: planet.type === "sun"
        ? null
        : normalizeLongitude(planet.longitudeRaw - sun.longitudeRaw),
    })),
    houses: {
      regiomontanus: chart.housesData.house,
      placidus: chart.housesData.variants?.placidus.cusps ?? null,
    },
    placements,
    boundaryDynamics: boundaries,
    exactAspectDynamics: calculateExactAspectDynamics(sw as any, chart, birthJd!, boundaries),
    prenatalSyzygy: calculatePrenatalSyzygy(sw as any, birthJd!),
    lunations,
    prenatalLunationNatalLinks: buildPrenatalLunationNatalLinks(chart, lunations),
    nodes: chart.calculationMetadata?.auxiliaryNodes ?? null,
    cautions: [
      "Nenhuma interpretação psicológica ou prognóstica é produzida neste módulo.",
      "Cúspides materializam distância, mesmo-signo, arco real da casa, frações 2°/3°/5°, velocidade e aplicação/separação. O núcleo <=5° é automático; exceções acima de 5° ou a escolha 2° versus 3° permanecem juízo autoral porque Marcos não publica um cutoff universal.",
      "Lunações são resolvidas por raiz efemérica. eclipseGeometryCandidate permanece apenas como geometria nodal diagnóstica; a classificação física usa a rotina oficial de eclipse do Swiss Ephemeris quando disponível e nunca é inferida do limiar nodal.",
      "Contatos de lunações pré-natais com pontos natais são pré-computados em bandas 0–3°/3–5° apenas como triagem geométrica; o corpus não publica um orbe universal específico para o elo eclipse→natividade, portanto nenhum contato recebe juízo automático.",
      "Direções primárias, progressões e revoluções pertencem ao módulo temporal, não ao radix bruto.",
    ],
  };
}
