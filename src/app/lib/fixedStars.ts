import {
  BirthChart,
  FixedStar,
  FixedStarMatch,
  FixedStarPosition,
  FixedStarCatalogMetadata,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { FIXED_STARS, PRECESSION_RATE, SIGNS } from "./traditionalTables";
import { calculateArabicLots, ORDERED_ARABIC_PART_KEYS } from "./arabicLots";
import { MARCOS_FIXED_STAR_COMMON_MAX_ORB, MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB, MARCOS_PRINCIPAL_FIXED_STAR_NAMES } from "@/traditions/western/natal/natalMethodConstants";

const FIXED_STAR_ORB_DEGREES = 2;
const PARTILE_EXACT_ORB = 1 / 6;
const PARTILE_ORB = 0.5;

type FixedStarTarget = {
  pointName: string;
  pointElementType: "planet" | "house" | "arabicPart";
  pointPlanetType?: PlanetType;
  pointLongitude: number;
};

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function getAngularDistance(first: number, second: number): number {
  const diff = Math.abs(normalizeDegrees(first) - normalizeDegrees(second));
  return diff > 180 ? 360 - diff : diff;
}

function formatDegrees(longitude: number): string {
  const totalMinutesCircle = 360 * 60;
  const roundedMinutes = ((Math.round(normalizeDegrees(longitude) * 60) % totalMinutesCircle) + totalMinutesCircle) % totalMinutesCircle;
  const signSpanMinutes = 30 * 60;
  const signIndex = Math.floor(roundedMinutes / signSpanMinutes) % 12;
  const withinSign = roundedMinutes - signIndex * signSpanMinutes;
  const degree = Math.floor(withinSign / 60);
  const minute = withinSign % 60;
  return `${degree}°${minute.toString().padStart(2, "0")}' de ${SIGNS[signIndex]}`;
}

function formatOrb(orb: number): string {
  const degree = Math.floor(orb);
  const minute = Math.round((orb - degree) * 60);
  const safeDegree = minute === 60 ? degree + 1 : degree;
  const safeMinute = minute === 60 ? 0 : minute;

  return `${safeDegree}°${safeMinute.toString().padStart(2, "0")}'`;
}

function getDescriptor(orb: number): string {
  if (orb <= PARTILE_EXACT_ORB) return "Conjuncao Partil Exata";
  if (orb <= PARTILE_ORB) return "Conjuncao Partil";
  return "Forte Conjuncao";
}

const PRINCIPAL_FIXED_STARS = new Set([
  "Deneb Kaitos", "Mira", "Hamal", "Schedir", "Algol", "Alcyone",
  "Aldebaran", "Rigel", "Bellatrix", "Capella", "Betelgeuse", "Canopus",
  "Sirius", "Castor", "Pollux", "Procyon", "Praesepe", "Regulus",
  "Denebola", "Vindemiatrix", "Spica", "Arcturus", "Zubenelgenubi",
  "Zubeneschamali", "Antares", "Aculeus", "Acumen", "Vega", "Altair",
  "Fomalhaut", "Markab", "Scheat",
]);

function isRelevantStar(star: {
  name: string;
  magnitude?: number;
  extra?: string;
}, orb: number): boolean {
  return (
    PRINCIPAL_FIXED_STARS.has(star.name) ||
    star.extra === "Estrela Real" ||
    (star.magnitude ?? Number.POSITIVE_INFINITY) <= 1.5 ||
    (orb <= 0.5 && (star.magnitude ?? Number.POSITIVE_INFINITY) <= 3)
  );
}

export function getDecimalYearFromDate(date: Date): number {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1, 0, 0, 0);
  const end = Date.UTC(year + 1, 0, 1, 0, 0, 0);

  return year + (date.getTime() - start) / (end - start);
}

function getDecimalYearFromBirthDate(chart: BirthChart): number {
  const { year, month, day, time } = chart.birthDate;
  let hours = 0;
  let minutes = 0;
  if (`${time}`.includes(":")) {
    const [hoursString = "0", minutesString = "00", secondsString = "00"] = `${time}`.split(":");
    hours = Number(hoursString) || 0;
    minutes = (Number(minutesString) || 0) + (Number(secondsString) || 0) / 60;
  } else {
    const decimal = Number(time);
    const safe = Number.isFinite(decimal) ? decimal : 0;
    hours = Math.floor(safe);
    minutes = (safe - hours) * 60;
  }

  return getDecimalYearFromDate(
    new Date(Date.UTC(year, Math.max(0, month - 1), day, hours, minutes))
  );
}

function getFixedStarTargets(chart: BirthChart): FixedStarTarget[] {
  const planetTargets = chart.planets
    .filter((planet) =>
      ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"].includes(planet.type)
    )
    .map((planet) => ({
      pointName: planet.name,
      pointElementType: "planet" as const,
      pointPlanetType: planet.type,
      pointLongitude: planet.longitudeRaw,
    }));

  const cuspTargets = chart.housesData.house.map((longitude, index) => ({
    pointName: `Cúspide ${index + 1}`,
    pointElementType: "house" as const,
    pointLongitude: longitude,
  }));

  const lots = calculateArabicLots(chart);
  const lotTargets = ORDERED_ARABIC_PART_KEYS.flatMap((key) => {
    const lot = lots[key];
    return lot
      ? [{
          pointName: `Parte ${lot.name}`,
          pointElementType: "arabicPart" as const,
          pointLongitude: lot.longitude,
        }]
      : [];
  });

  return [...planetTargets, ...cuspTargets, ...lotTargets];
}

function buildFixedStarMatchKey(target: FixedStarTarget, starName: string): string {
  return `${target.pointName}-${starName}`.toLowerCase().replace(/\s+/g, "-");
}

export function getFixedStarLongitude(
  baseLongitude: number,
  decimalYear: number
): number {
  return normalizeDegrees(baseLongitude + (decimalYear - 2000) * PRECESSION_RATE);
}

export function calculateFixedStarMatches(
  chart: BirthChart,
  decimalYear = getDecimalYearFromBirthDate(chart)
): FixedStarMatch[] {
  const targets = getFixedStarTargets(chart);
  const matches: FixedStarMatch[] = [];

  targets.forEach((target) => {
    FIXED_STARS.forEach((star) => {
      const starLongitude = getFixedStarLongitude(star.lon, decimalYear);
      const orb = getAngularDistance(target.pointLongitude, starLongitude);

      if (orb > FIXED_STAR_ORB_DEGREES) {
        return;
      }

      matches.push({
        key: buildFixedStarMatchKey(target, star.name),
        pointName: target.pointName,
        pointPlanetType: target.pointPlanetType,
        pointElementType: target.pointElementType,
        pointLongitude: target.pointLongitude,
        starName: star.name,
        starLongitude,
        starLongitudeLabel: formatDegrees(starLongitude),
        orb,
        orbLabel: formatOrb(orb),
        nature: star.nature,
        note: star.extra,
        magnitude: star.magnitude,
        descriptor: getDescriptor(orb),
        isRelevant: isRelevantStar(star, orb),
      });
    });
  });

  return matches.sort((first, second) => first.orb - second.orb);
}

export function buildFixedStarsFromMatches(matches: FixedStarMatch[]): FixedStar[] {
  const byStarName = new Map<string, FixedStar>();

  matches.forEach((match, index) => {
    if (!match.isRelevant) {
      return;
    }

    if (byStarName.has(match.starName)) {
      return;
    }

    byStarName.set(match.starName, {
      id: index,
      name: match.starName,
      longitude: match.starLongitude,
      longitudeSign: match.starLongitudeLabel,
      latitude: 0,
      magnitude: match.magnitude ?? 0,
      nature: match.nature,
      note: match.note,
      isRelevant: match.isRelevant,
      elementType: "fixedStar",
      isAntiscion: false,
      isFromOuterChart: false,
      isRetrograde: false,
    });
  });

  return Array.from(byStarName.values());
}

export function buildFixedStarReportLine(match: FixedStarMatch): string {
  const parts = [
    `${match.starName} (${match.starLongitudeLabel}, orbe ${match.orbLabel}) - ${match.descriptor}`,
  ];

  if (match.nature) {
    parts.push(`natureza ${match.nature}`);
  }

  if (match.note) {
    parts.push(match.note);
  }

  return parts.join(", ");
}

export function getFixedStarConjunctions(
  longitude: number,
  year: number
): string[] {
  const decimalYear = Number.isFinite(year) ? year : 2000;

  return FIXED_STARS.map((star) => {
    const starLongitude = getFixedStarLongitude(star.lon, decimalYear);
    const orb = getAngularDistance(longitude, starLongitude);

    if (orb > FIXED_STAR_ORB_DEGREES) {
      return undefined;
    }

    return buildFixedStarReportLine({
      key: `legacy-${star.name}`,
      pointName: "legacy",
      pointElementType: "house",
      pointLongitude: longitude,
      pointPlanetType: undefined,
      starName: star.name,
      starLongitude,
      starLongitudeLabel: formatDegrees(starLongitude),
      orb,
      orbLabel: formatOrb(orb),
      nature: star.nature,
      note: star.extra,
      magnitude: star.magnitude,
      descriptor: getDescriptor(orb),
      isRelevant: isRelevantStar(star, orb),
    });
  }).filter((entry): entry is string => Boolean(entry));
}

export function decorateChartWithFixedStars(
  chart: BirthChart,
  decimalYear?: number
): BirthChart {
  const fixedStarMatches = calculateFixedStarMatches(chart, decimalYear);
  const fixedStars = buildFixedStarsFromMatches(fixedStarMatches);

  return {
    ...chart,
    fixedStars,
    fixedStarMatches,
  };
}

// ---------------------------------------------------------------------------
// FULL FIXED-STAR SKY — Astro-Seek-style presentation + MathAstro judgement.
// ---------------------------------------------------------------------------
// Astro-Seek exposes a compact major-star preset and a much larger "all stars"
// view, with epoch-correct longitude, latitude, RA, declination and magnitude.
// MathAstro follows that data architecture but keeps its own source of truth:
// the packaged Swiss Ephemeris sefstars.txt catalogue. The complete sky and the
// interpretive contacts are separate objects. A failure to resolve stars must
// NEVER be reported as "no contacts".

const MARCOS_PRINCIPAL_FIXED_STARS = new Set<string>(MARCOS_PRINCIPAL_FIXED_STAR_NAMES);

// The classic 15-star default used by Astro-Seek is the Behenian/major set.
// Alcyone represents the Pleiades group.
const FRAWLEY_EXPLICIT_FIXED_OBJECTS = new Set([
  // The Real Astrology Applied: tabela de dignidades e exemplos natais.
  "Regulus", "Spica", "Algol", "Canopus", "Pollux", "Praesepe Cluster",
  "Praesepe", "Facies", "Andromeda Galaxy",
]);

const ASTRO_SEEK_MAJOR_15 = new Set([
  "Algol", "Alcyone", "Aldebaran", "Capella", "Sirius", "Procyon",
  "Regulus", "Alkaid", "Algorab", "Spica", "Arcturus", "Alphecca",
  "Antares", "Vega", "Deneb Algedi",
]);

// The deterministic catalogue-precession fallback is intentionally conservative.
// Independent PySwissEph comparisons on principal stars are within ~1 arcminute
// around the 1999/2001 regression epochs. A contact that lies inside this margin
// of an interpretive orb boundary is kept for audit but not released to the AI.
const CATALOG_PRECESSION_BOUNDARY_UNCERTAINTY_DEGREES = 1 / 60;

interface ExactStarCatalogEntry {
  queryName: string;
  displayName: string;
  traditionalName: string;
  nomenclature: string;
  constellationCode?: string;
  equinox: "ICRS" | "2000" | "1950" | string;
  rightAscensionEpoch: number;
  declinationEpoch: number;
  properMotionRaCosDecMasYr: number;
  properMotionDecMasYr: number;
  magnitude: number | null;
  traditionalNameCanonical: boolean;
  objectClass: FixedStarPosition["objectClass"];
}

let exactCatalogLoaded = false;
let exactCatalogEntries: ExactStarCatalogEntry[] = [];
let exactCatalogRawRecords = 0;

function parseSignedDms(degrees: string, minutes: string, seconds: string): number {
  const degValue = Number.parseFloat(degrees);
  const sign = degrees.trim().startsWith("-") ? -1 : 1;
  return sign * (Math.abs(degValue) + Number.parseFloat(minutes) / 60 + Number.parseFloat(seconds) / 3600);
}

function parseRaDegrees(hours: string, minutes: string, seconds: string): number {
  return 15 * (Number.parseFloat(hours) + Number.parseFloat(minutes) / 60 + Number.parseFloat(seconds) / 3600);
}

function constellationCodeFromNomenclature(nomenclature: string): string | undefined {
  const match = nomenclature.match(/([A-Z][a-z]{2})$/);
  return match?.[1];
}

function classifyCatalogObject(traditionalName: string, nomenclature: string): FixedStarPosition["objectClass"] {
  const name = traditionalName.trim();
  const nom = nomenclature.trim();
  // Traditional astrology does use a few clusters/nebulae as fixed-star-like
  // objects (Praesepe, Aculeus, Acumen). Keep them explicitly distinct from
  // ordinary stars instead of silently treating every Messier object as a star.
  if (["M6", "M7", "M22", "M44"].includes(nom) || ["Aculeus", "Acumen", "Facies", "Praesepe Cluster", "Praesepe"].includes(name)) {
    return "traditional-cluster-nebula";
  }
  if (/galaxy|galactic center|great attractor|supercluster/i.test(name) || /^M31$/i.test(nom)) {
    return "deep-sky";
  }
  return "star";
}

function normalizeTraditionalStarName(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase().replace(/\s+/g, " ");
}

function parseExactStarCatalog(text: string): ExactStarCatalogEntry[] {
  const byNomenclature = new Map<string, ExactStarCatalogEntry>();
  exactCatalogRawRecords = 0;

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trimEnd();
    if (!line || line.trimStart().startsWith("#")) return;
    const fields = line.split(",");
    if (fields.length < 14) return;
    exactCatalogRawRecords += 1;

    const traditional = fields[0]?.trim() ?? "";
    const nomenclature = fields[1]?.trim() ?? "";
    const equinox = fields[2]?.trim() ?? "";
    if (!nomenclature) return;

    const magnitudeValue = Number.parseFloat(fields[13]?.trim() ?? "");
    // Entries such as Galactic Center/Great Attractor use 999.99 as a sentinel.
    // They remain valuable astronomy, but are not fixed stars and are excluded
    // from the stellar sky requested by the natal module.
    if (!Number.isFinite(magnitudeValue) || magnitudeValue >= 90) return;

    const rightAscensionEpoch = parseRaDegrees(fields[3], fields[4], fields[5]);
    const declinationEpoch = parseSignedDms(fields[6], fields[7], fields[8]);
    const pmRa = Number.parseFloat(fields[9]?.trim() ?? "0");
    const pmDec = Number.parseFloat(fields[10]?.trim() ?? "0");
    if (![rightAscensionEpoch, declinationEpoch, pmRa, pmDec].every(Number.isFinite)) return;

    const key = nomenclature.toLowerCase();
    if (byNomenclature.has(key)) return; // aliases do not become duplicate stars

    const displayName = traditional || nomenclature;
    byNomenclature.set(key, {
      queryName: `,${nomenclature}`,
      displayName,
      traditionalName: traditional,
      nomenclature,
      constellationCode: constellationCodeFromNomenclature(nomenclature),
      equinox,
      rightAscensionEpoch,
      declinationEpoch,
      properMotionRaCosDecMasYr: pmRa,
      properMotionDecMasYr: pmDec,
      magnitude: magnitudeValue,
      traditionalNameCanonical: true,
      objectClass: classifyCatalogObject(traditional, nomenclature),
    });
  });

  const entries = [...byNomenclature.values()];
  // sefstars.txt contains a small number of duplicated traditional labels that
  // refer to different physical objects (e.g. two rows historically labelled
  // "Menkar"). A name collision must never become two astrological Menkars.
  // The brighter object retains the traditional label; the other remains in the
  // astronomical catalogue under its nomenclature only.
  const groups = new Map<string, ExactStarCatalogEntry[]>();
  entries.forEach((entry) => {
    if (!entry.traditionalName) return;
    const key = normalizeTraditionalStarName(entry.traditionalName);
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  });
  groups.forEach((group) => {
    if (group.length <= 1) return;
    group.sort((a, b) => (a.magnitude ?? Number.POSITIVE_INFINITY) - (b.magnitude ?? Number.POSITIVE_INFINITY));
    group.forEach((entry, index) => {
      entry.traditionalNameCanonical = index === 0;
      if (index > 0) entry.displayName = entry.nomenclature;
    });
  });

  return entries;
}

async function ensureExactStarCatalog(sw?: any): Promise<ExactStarCatalogEntry[]> {
  if (exactCatalogLoaded && exactCatalogEntries.length) return exactCatalogEntries;
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const catalogPath = path.join(process.cwd(), "public", "vendor", "sefstars.txt");
  const bytes = await readFile(catalogPath);
  exactCatalogEntries = parseExactStarCatalog(bytes.toString("utf8"));
  if (!exactCatalogEntries.length) {
    throw new Error("sefstars.txt carregado, mas nenhum registro estelar foi reconhecido.");
  }

  // Best-effort injection into the Emscripten filesystem. The deterministic
  // precession fallback below does not depend on this succeeding.
  const module = sw?.module;
  if (module?.FS) {
    try { module.FS.mkdir("/ephe"); } catch { /* already exists */ }
    try {
      module.FS.writeFile("/ephe/sefstars.txt", bytes);
      module.ccall?.("swe_set_ephe_path", null, ["string"], ["/ephe"]);
    } catch {
      // Do not fail the stellar sky; the catalogue-precession path remains valid.
    }
  }

  exactCatalogLoaded = true;
  return exactCatalogEntries;
}

function lookupLegacyStarMetadata(name: string) {
  const normalized = name === "Praesepe Cluster" ? "Praesepe" : name;
  return FIXED_STARS.find((star) => star.name === normalized);
}

function degreesToRadians(value: number): number { return value * Math.PI / 180; }
function radiansToDegrees(value: number): number { return value * 180 / Math.PI; }

function precessEquatorialJ2000(raDeg: number, decDeg: number, julianDayUt: number) {
  const T = (julianDayUt - 2451545.0) / 36525;
  const zeta = (2306.2181 * T + 0.30188 * T*T + 0.017998 * T*T*T) / 3600;
  const z = (2306.2181 * T + 1.09468 * T*T + 0.018203 * T*T*T) / 3600;
  const theta = (2004.3109 * T - 0.42665 * T*T - 0.041833 * T*T*T) / 3600;

  const a = degreesToRadians(raDeg);
  const d = degreesToRadians(decDeg);
  const zr = degreesToRadians(z);
  const zetar = degreesToRadians(zeta);
  const tr = degreesToRadians(theta);
  const A = Math.cos(d) * Math.sin(a + zetar);
  const B = Math.cos(tr) * Math.cos(d) * Math.cos(a + zetar) - Math.sin(tr) * Math.sin(d);
  const C = Math.sin(tr) * Math.cos(d) * Math.cos(a + zetar) + Math.cos(tr) * Math.sin(d);

  return {
    rightAscension: normalizeDegrees(radiansToDegrees(Math.atan2(A, B)) + z),
    declination: radiansToDegrees(Math.asin(Math.max(-1, Math.min(1, C)))),
  };
}

function meanObliquity(julianDayUt: number): number {
  const T = (julianDayUt - 2451545.0) / 36525;
  return 23 + 26/60 + 21.448/3600 - (46.8150*T + 0.00059*T*T - 0.001813*T*T*T)/3600;
}

function equatorialToEcliptic(raDeg: number, decDeg: number, julianDayUt: number) {
  const ra = degreesToRadians(raDeg);
  const dec = degreesToRadians(decDeg);
  const eps = degreesToRadians(meanObliquity(julianDayUt));
  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.cos(dec) * Math.sin(ra);
  const z = Math.sin(dec);
  const ye = Math.cos(eps) * y + Math.sin(eps) * z;
  const ze = -Math.sin(eps) * y + Math.cos(eps) * z;
  return {
    longitude: normalizeDegrees(radiansToDegrees(Math.atan2(ye, x))),
    latitude: radiansToDegrees(Math.asin(Math.max(-1, Math.min(1, ze)))),
  };
}

function catalogPrecessionPosition(star: ExactStarCatalogEntry, julianDayUt: number) {
  if (star.equinox === "1950") {
    // The only packaged 1950 pseudo-entry is Apex and is excluded by magnitude.
    throw new Error(`Unsupported stellar epoch 1950 for ${star.displayName}`);
  }
  const yearsFromJ2000 = (julianDayUt - 2451545.0) / 365.25;
  const dec0Rad = degreesToRadians(star.declinationEpoch);
  const cosDec = Math.max(Math.abs(Math.cos(dec0Rad)), 1e-9);
  const raWithProperMotion = star.rightAscensionEpoch
    + (star.properMotionRaCosDecMasYr / 1000 / cosDec) * yearsFromJ2000 / 3600;
  const decWithProperMotion = star.declinationEpoch
    + (star.properMotionDecMasYr / 1000) * yearsFromJ2000 / 3600;
  const eq = precessEquatorialJ2000(raWithProperMotion, decWithProperMotion, julianDayUt);
  const ecl = equatorialToEcliptic(eq.rightAscension, eq.declination, julianDayUt);
  return { ...ecl, ...eq };
}

function readDoubleArray(module: any, ptr: number, length: number): number[] {
  if (module?.HEAPF64) {
    const start = ptr >> 3;
    return Array.from(module.HEAPF64.subarray(start, start + length));
  }
  if (typeof module?.getValue === "function") {
    return Array.from({ length }, (_, index) => module.getValue(ptr + index * 8, "double"));
  }
  throw new Error("Runtime Emscripten sem HEAPF64/getValue.");
}

function safeCalculateFixedStar(sw: any, starName: string, julianDayUt: number, equatorial = false) {
  const module = sw?.module;
  if (!module?.ccall || !module?._malloc || !module?._free) {
    throw new Error("Runtime Swiss Ephemeris sem símbolos C necessários para estrelas fixas.");
  }
  const starPtr = typeof module.allocateUTF8 === "function" ? module.allocateUTF8(starName) : module._malloc(256);
  const allocatedByMalloc = typeof module.allocateUTF8 !== "function";
  const xxPtr = module._malloc(6 * 8);
  const serrPtr = module._malloc(512);
  try {
    if (allocatedByMalloc) {
      if (typeof module.stringToUTF8 !== "function") throw new Error("Runtime sem stringToUTF8.");
      module.stringToUTF8(starName, starPtr, 256);
    }
    const flags = 258 | (equatorial ? 2048 : 0); // SWIEPH + SPEED + optional EQUATORIAL
    const retflag = module.ccall(
      "swe_fixstar_ut", "number",
      ["number", "number", "number", "number", "number"],
      [starPtr, julianDayUt, flags, xxPtr, serrPtr],
    );
    if (retflag < 0) throw new Error(`Swiss Ephemeris não resolveu ${starName}.`);
    const xx = readDoubleArray(module, xxPtr, 6);
    return { first: xx[0], second: xx[1], speedFirst: xx[3], speedSecond: xx[4], flags: retflag };
  } finally {
    module._free(starPtr);
    module._free(xxPtr);
    module._free(serrPtr);
  }
}

function houseIndexFromLongitude(longitude: number, cusps: number[]): number | undefined {
  if (!cusps?.length || cusps.length < 12) return undefined;
  const lon = normalizeDegrees(longitude);
  for (let index = 0; index < 12; index += 1) {
    const start = normalizeDegrees(cusps[index]);
    const end = normalizeDegrees(cusps[(index + 1) % 12]);
    const inHouse = start <= end ? lon >= start && lon < end : lon >= start || lon < end;
    if (inHouse) return index + 1;
  }
  return undefined;
}

function localHorizontal(rightAscensionDeg: number, declinationDeg: number, julianDayUt: number, latitudeDeg: number, longitudeDeg: number) {
  const T = (julianDayUt - 2451545.0) / 36525;
  const gmst = normalizeDegrees(
    280.46061837
    + 360.98564736629 * (julianDayUt - 2451545.0)
    + 0.000387933 * T*T
    - T*T*T / 38710000
  );
  const lst = normalizeDegrees(gmst + longitudeDeg);
  const hourAngle = degreesToRadians(normalizeDegrees(lst - rightAscensionDeg));
  const dec = degreesToRadians(declinationDeg);
  const lat = degreesToRadians(latitudeDeg);
  const altitude = Math.asin(
    Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngle)
  );
  const azimuth = Math.atan2(
    -Math.sin(hourAngle),
    Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(hourAngle)
  );
  return {
    altitude: radiansToDegrees(altitude),
    azimuth: normalizeDegrees(radiansToDegrees(azimuth)),
  };
}

export async function calculateFullFixedStarSky(
  chart: BirthChart,
  sw: any,
  julianDayUt: number,
): Promise<{ positions: FixedStarPosition[]; metadata: FixedStarCatalogMetadata }> {
  const catalog = await ensureExactStarCatalog(sw);
  const positions: FixedStarPosition[] = [];
  let exactCount = 0;
  let fallbackCount = 0;
  let failedCount = 0;
  let exactCapability: boolean | null = null;

  for (const star of catalog) {
    try {
      let longitude = Number.NaN;
      let latitude = Number.NaN;
      let rightAscension = Number.NaN;
      let declination = Number.NaN;
      let calculationMode: "swiss-exact" | "catalog-precession" = "catalog-precession";

      let exactResolved = false;
      if (exactCapability !== false) {
        try {
          const ecliptic = safeCalculateFixedStar(sw, star.queryName, julianDayUt, false);
          const equatorial = safeCalculateFixedStar(sw, star.queryName, julianDayUt, true);
          longitude = normalizeDegrees(ecliptic.first);
          latitude = ecliptic.second;
          rightAscension = normalizeDegrees(equatorial.first);
          declination = equatorial.second;
          calculationMode = "swiss-exact";
          exactCount += 1;
          exactCapability = true;
          exactResolved = true;
        } catch {
          // If the first probe fails, do not repeat the same missing-symbol failure
          // a thousand times. If exact mode had already worked, only this star falls back.
          if (exactCapability === null) exactCapability = false;
        }
      }
      if (!exactResolved) {
        const fallback = catalogPrecessionPosition(star, julianDayUt);
        longitude = fallback.longitude;
        latitude = fallback.latitude;
        rightAscension = fallback.rightAscension;
        declination = fallback.declination;
        fallbackCount += 1;
      }

      if (![longitude, latitude, rightAscension, declination].every(Number.isFinite)) {
        throw new Error(`Posição estelar inválida para ${star.displayName}.`);
      }

      const horizontal = localHorizontal(
        rightAscension,
        declination,
        julianDayUt,
        chart.birthDate.coordinates.latitude,
        chart.birthDate.coordinates.longitude,
      );
      const metadata = star.traditionalNameCanonical ? lookupLegacyStarMetadata(star.displayName) : undefined;
      positions.push({
        key: star.nomenclature.toLowerCase(),
        name: star.displayName,
        traditionalName: star.traditionalName || undefined,
        nomenclature: star.nomenclature,
        constellationCode: star.constellationCode,
        magnitude: star.magnitude ?? undefined,
        longitude,
        longitudeSign: formatDegrees(longitude),
        latitude,
        rightAscension,
        declination,
        houseRegiomontanus: houseIndexFromLongitude(longitude, chart.housesData.house),
        housePlacidus: houseIndexFromLongitude(longitude, chart.housesData.variants?.placidus.cusps ?? chart.housesData.house),
        altitude: horizontal.altitude,
        azimuth: horizontal.azimuth,
        aboveHorizon: horizontal.altitude >= 0,
        isAstroSeekMajor15: star.traditionalNameCanonical && ASTRO_SEEK_MAJOR_15.has(star.displayName),
        isMarcosPrincipal: star.traditionalNameCanonical && MARCOS_PRINCIPAL_FIXED_STARS.has(star.displayName),
        traditionalNameCanonical: star.traditionalNameCanonical,
        objectClass: star.objectClass,
        traditionalMetadataAvailable: Boolean(metadata),
        nature: metadata?.nature,
        note: metadata?.extra,
        calculationMode,
      });
    } catch {
      failedCount += 1;
    }
  }

  if (!positions.length) {
    throw new Error("FIXED_STAR_ENGINE_FAILURE: catálogo carregado, mas nenhuma estrela pôde ser calculada.");
  }

  const calculationMode: FixedStarCatalogMetadata["calculationMode"] =
    exactCount > 0 && fallbackCount > 0 ? "hybrid"
    : exactCount > 0 ? "swiss-exact"
    : "catalog-precession";

  const metadata: FixedStarCatalogMetadata = {
    source: "Swiss Ephemeris sefstars.txt",
    rawRecords: exactCatalogRawRecords,
    uniqueEntries: catalog.length,
    calculatedEntries: positions.length,
    failedEntries: failedCount,
    aboveHorizonEntries: positions.filter((star) => star.aboveHorizon).length,
    calculationMode,
    astroSeekReferenceMode: "15-major-plus-full-catalog",
    notes: [
      "Catálogo completo separado dos contatos interpretativos.",
      "Posições são calculadas para o instante natal; o fallback aplica movimento próprio e precessão do J2000.",
      "Casa estelar é a casa zodiacal por longitude eclíptica; altitude/azimute registram o horizonte local real.",
    ],
  };

  return { positions: positions.sort((a, b) => a.longitude - b.longitude), metadata };
}

export function calculateFixedStarMatchesFromSky(
  chart: BirthChart,
  positions: FixedStarPosition[],
): FixedStarMatch[] {
  const targets = getFixedStarTargets(chart);
  const matches: FixedStarMatch[] = [];

  for (const star of positions) {
    const marcosPrincipal = Boolean(star.isMarcosPrincipal);
    const frawleyExplicit = FRAWLEY_EXPLICIT_FIXED_OBJECTS.has(star.name)
      || Boolean(star.traditionalName && FRAWLEY_EXPLICIT_FIXED_OBJECTS.has(star.traditionalName));
    const authorSourceLocked = marcosPrincipal || frawleyExplicit;
    const traditionalSecondary = Boolean(star.traditionalMetadataAvailable) && star.traditionalNameCanonical !== false;
    const sourceLockedNonstellar = star.objectClass === "deep-sky" && frawleyExplicit;
    const excludedNonstellar = star.objectClass === "deep-sky" && !sourceLockedNonstellar;
    // Do not let a Frawley-explicit object inherit Marcos's wider principal-star orb.
    // Marcos principal stars may extend to 2–3°; Frawley Applied describes natal
    // planetary star contacts as about a degree. Common traditional stars also stay <=1°.
    const maxOrb = marcosPrincipal
      ? MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB
      : MARCOS_FIXED_STAR_COMMON_MAX_ORB;
    const interpretiveTier: FixedStarMatch["interpretiveTier"] = excludedNonstellar
      ? "excluded-nonstellar"
      : authorSourceLocked
        ? "principal-source-locked"
        : traditionalSecondary
          ? "traditional-secondary"
          : "astronomical-only";
    const interpretiveSources = [
      ...(marcosPrincipal ? ["Marcos-principal"] : []),
      ...(frawleyExplicit ? ["Frawley-Applied-explicit"] : []),
      ...(traditionalSecondary && !authorSourceLocked ? ["Marcos-common-star-orb-rule", "traditional-metadata-non-author-specific"] : []),
      ...(star.isAstroSeekMajor15 ? ["AstroSeek-major-display-only"] : []),
    ];

    for (const target of targets) {
      const sameSign = Math.floor(normalizeDegrees(target.pointLongitude) / 30)
        === Math.floor(normalizeDegrees(star.longitude) / 30);
      if (!sameSign) continue;
      const orb = getAngularDistance(target.pointLongitude, star.longitude);
      if (orb > maxOrb) continue;
      const boundaryUncertain = star.calculationMode === "catalog-precession"
        && orb > Math.max(0, maxOrb - CATALOG_PRECESSION_BOUNDARY_UNCERTAINTY_DEGREES);
      const interpretiveEligible = !excludedNonstellar && !boundaryUncertain && (authorSourceLocked || traditionalSecondary);
      matches.push({
        key: `${buildFixedStarMatchKey(target, star.name)}-${star.nomenclature.toLowerCase()}`,
        pointName: target.pointName,
        pointPlanetType: target.pointPlanetType,
        pointElementType: target.pointElementType,
        pointLongitude: target.pointLongitude,
        starName: star.name,
        starNomenclature: star.nomenclature,
        starLongitude: star.longitude,
        starLatitude: star.latitude,
        starLongitudeLabel: star.longitudeSign,
        orb,
        orbLabel: formatOrb(orb),
        maxOrb,
        sameSign,
        calculationMode: star.calculationMode,
        nature: star.nature,
        note: star.note,
        magnitude: star.magnitude,
        descriptor: getDescriptor(orb),
        isRelevant: interpretiveEligible,
        interpretiveTier,
        interpretiveSources,
        interpretiveReason: interpretiveEligible
          ? authorSourceLocked
            ? `objeto source-locked por ${interpretiveSources.filter((source) => !source.includes("display")).join(" + ")}; orbe ampliada permitida`
            : "estrela tradicional secundária admitida pela regra Marcos de estrelas comuns <=1°; natureza/metadado tradicional preservado separadamente e não atribuído ao autor"
          : excludedNonstellar
            ? "objeto deep-sky preservado apenas no céu astronômico"
            : boundaryUncertain
              ? `contato no limite da orbe e calculado por fallback de precessão; margem conservadora de ${CATALOG_PRECESSION_BOUNDARY_UNCERTAINTY_DEGREES.toFixed(6)}° bloqueia promoção automática`
              : "estrela física sem regra interpretativa source-locked; contato preservado apenas para auditoria",
        objectClass: star.objectClass,
        traditionalNameCanonical: star.traditionalNameCanonical,
      });
    }
  }

  // Dominância só é calculada entre testemunhos interpretativamente elegíveis.
  // Uma estrela técnica muito brilhante sem tradição não deve suprimir uma
  // estrela tradicional no mesmo agrupamento.
  const byPoint = new Map<string, FixedStarMatch[]>();
  matches.filter((match) => match.isRelevant).forEach((match) => {
    const list = byPoint.get(match.pointName) ?? [];
    list.push(match);
    byPoint.set(match.pointName, list);
  });
  byPoint.forEach((pointMatches) => {
    pointMatches.sort((a, b) =>
      (a.interpretiveTier === "principal-source-locked" ? 0 : a.interpretiveTier === "traditional-secondary" ? 1 : 2)
      - (b.interpretiveTier === "principal-source-locked" ? 0 : b.interpretiveTier === "traditional-secondary" ? 1 : 2)
      || a.orb - b.orb
      || (a.magnitude ?? Number.POSITIVE_INFINITY) - (b.magnitude ?? Number.POSITIVE_INFINITY)
    );
    pointMatches.forEach((match, index) => { match.isDominantInCluster = index === 0; });
  });
  matches.filter((match) => !match.isRelevant).forEach((match) => { match.isDominantInCluster = false; });
  return matches.sort((a, b) => Number(b.isRelevant) - Number(a.isRelevant) || a.orb - b.orb);
}

export async function calculateExactFixedStarMatches(
  chart: BirthChart,
  sw: any,
  julianDayUt: number,
): Promise<FixedStarMatch[]> {
  const sky = await calculateFullFixedStarSky(chart, sw, julianDayUt);
  return calculateFixedStarMatchesFromSky(chart, sky.positions);
}

export function buildFixedStarsFromExactMatches(matches: FixedStarMatch[]): FixedStar[] {
  const byStarName = new Map<string, FixedStar>();
  matches
    .filter((match) => match.isRelevant)
    .forEach((match, index) => {
      if (byStarName.has(match.starName)) return;
      byStarName.set(match.starName, {
        id: index,
        name: match.starName,
        longitude: match.starLongitude,
        longitudeSign: match.starLongitudeLabel,
        latitude: match.starLatitude ?? 0,
        magnitude: match.magnitude ?? 0,
        nature: match.nature,
        note: match.note,
        isRelevant: match.isRelevant,
        elementType: "fixedStar",
        isAntiscion: false,
        isFromOuterChart: false,
        isRetrograde: false,
      });
    });
  return [...byStarName.values()];
}
