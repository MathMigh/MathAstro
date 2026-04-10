import { BirthChart, Planet } from "@/interfaces/BirthChartInterfaces";
import {
  DETRIMENT,
  DOMICILE_RULER,
  EGYPTIAN_TERMS,
  EXALTATION,
  FACES,
  FALL,
  SIGN_QUALITIES,
  SIGNS,
  TRIPLICITY_RULERS,
} from "./traditionalTables";
import { getSect } from "./traditionalCalculations";

export interface TemperamentTotals {
  hot: number;
  cold: number;
  dry: number;
  moist: number;
}

export interface TemperamentWitness {
  label: string;
  details: string;
  contributions: TemperamentTotals;
}

export interface LordOfNativityResult {
  planet: string;
  longitude: number;
  sign: string;
  score: number;
  easyAspects: number;
  hardAspects: number;
  contributions: TemperamentTotals;
}

export interface TemperamentResult {
  temperament: string;
  dominantTemperament: string;
  inferiorTemperament: string;
  summary: string;
  totals: TemperamentTotals;
  hotDelta: number;
  dryDelta: number;
  witnesses: TemperamentWitness[];
  lordOfNativity: LordOfNativityResult;
}

const ZERO_TOTALS = (): TemperamentTotals => ({
  hot: 0,
  cold: 0,
  dry: 0,
  moist: 0,
});

type TraditionalPlanetType =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn";

const PLANET_QUALITIES: Record<TraditionalPlanetType, TemperamentTotals> = {
  sun: { hot: 1, cold: 0, dry: 1, moist: 0 },
  moon: { hot: 0, cold: 1, dry: 0, moist: 1 },
  mercury: { hot: 0, cold: 1, dry: 1, moist: 0 },
  venus: { hot: 0, cold: 1, dry: 0, moist: 1 },
  mars: { hot: 1, cold: 0, dry: 1, moist: 0 },
  jupiter: { hot: 1, cold: 0, dry: 0, moist: 1 },
  saturn: { hot: 0, cold: 1, dry: 1, moist: 0 },
};

const TRADITIONAL_PLANET_TYPES = new Set<TraditionalPlanetType>([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
]);

const SIGN_RULER_TYPES: TraditionalPlanetType[] = [
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

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function getSignIndex(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z]/g, "");
}

function nameToTraditionalType(name: string): TraditionalPlanetType | null {
  const key = normalizeText(name);

  if (key.includes("sol")) return "sun";
  if (key.includes("lua")) return "moon";
  if (key.includes("mercur")) return "mercury";
  if (key.includes("venus") || key.includes("vnus")) return "venus";
  if (key.includes("marte") || key.includes("mars")) return "mars";
  if (key.includes("jup") || key.includes("piter")) return "jupiter";
  if (key.includes("saturn")) return "saturn";

  return null;
}

function cloneTotals(totals: TemperamentTotals): TemperamentTotals {
  return {
    hot: totals.hot,
    cold: totals.cold,
    dry: totals.dry,
    moist: totals.moist,
  };
}

function sumTotals(
  left: TemperamentTotals,
  right: TemperamentTotals
): TemperamentTotals {
  return {
    hot: left.hot + right.hot,
    cold: left.cold + right.cold,
    dry: left.dry + right.dry,
    moist: left.moist + right.moist,
  };
}

function formatScore(score: number): string {
  return score.toFixed(2).replace(/\.00$/, ".0").replace(/(\.\d)0$/, "$1");
}

function describeContributions(contributions: TemperamentTotals): string {
  const parts: string[] = [];

  if (contributions.hot > 0) parts.push(`Quente +${formatScore(contributions.hot)}`);
  if (contributions.cold > 0) parts.push(`Frio +${formatScore(contributions.cold)}`);
  if (contributions.dry > 0) parts.push(`Seco +${formatScore(contributions.dry)}`);
  if (contributions.moist > 0) parts.push(`Umido +${formatScore(contributions.moist)}`);

  return parts.join(", ");
}

function getSignContributions(signIndex: number): TemperamentTotals {
  const [isHot, isMoist] = SIGN_QUALITIES[signIndex];

  return {
    hot: isHot ? 1 : 0,
    cold: isHot ? 0 : 1,
    dry: isMoist ? 0 : 1,
    moist: isMoist ? 1 : 0,
  };
}

function getPlanetContributions(
  planetType: TraditionalPlanetType
): TemperamentTotals {
  return cloneTotals(PLANET_QUALITIES[planetType] ?? ZERO_TOTALS());
}

function modulateBySign(
  baseContributions: TemperamentTotals,
  signIndex: number
): TemperamentTotals {
  const sign = getSignContributions(signIndex);

  return {
    hot: baseContributions.hot > 0 ? (sign.hot > 0 ? 1.25 : 0.75) : 0,
    cold: baseContributions.cold > 0 ? (sign.cold > 0 ? 1.25 : 0.75) : 0,
    dry: baseContributions.dry > 0 ? (sign.dry > 0 ? 1.25 : 0.75) : 0,
    moist: baseContributions.moist > 0 ? (sign.moist > 0 ? 1.25 : 0.75) : 0,
  };
}

function getSeasonWitness(signIndex: number): {
  label: string;
  base: TemperamentTotals;
} {
  if (signIndex <= 2) {
    return {
      label: "Primavera",
      base: { hot: 1, cold: 0, dry: 0, moist: 1 },
    };
  }

  if (signIndex <= 5) {
    return {
      label: "Verao",
      base: { hot: 1, cold: 0, dry: 1, moist: 0 },
    };
  }

  if (signIndex <= 8) {
    return {
      label: "Outono",
      base: { hot: 0, cold: 1, dry: 1, moist: 0 },
    };
  }

  return {
    label: "Inverno",
    base: { hot: 0, cold: 1, dry: 0, moist: 1 },
  };
}

function getMoonPhaseWitness(angleFromSun: number): {
  label: string;
  base: TemperamentTotals;
} {
  if (angleFromSun < 90) {
    return {
      label: "1a fase",
      base: { hot: 1, cold: 0, dry: 0, moist: 1 },
    };
  }

  if (angleFromSun < 180) {
    return {
      label: "2a fase",
      base: { hot: 1, cold: 0, dry: 1, moist: 0 },
    };
  }

  if (angleFromSun < 270) {
    return {
      label: "3a fase",
      base: { hot: 0, cold: 1, dry: 1, moist: 0 },
    };
  }

  return {
    label: "4a fase",
    base: { hot: 0, cold: 1, dry: 0, moist: 1 },
  };
}

function getEssentialScore(planet: Planet, sect: "Diurno" | "Noturno"): number {
  if (!TRADITIONAL_PLANET_TYPES.has(planet.type as TraditionalPlanetType)) {
    return 0;
  }

  const planetType = planet.type as TraditionalPlanetType;
  const signIndex = getSignIndex(planet.longitudeRaw);
  const degreeInSign = normalizeLongitude(planet.longitudeRaw) % 30;
  const signContributions = getSignContributions(signIndex);
  const elementIndex =
    signContributions.hot && signContributions.dry
      ? 0
      : signContributions.cold && signContributions.dry
        ? 1
        : signContributions.hot && signContributions.moist
          ? 2
          : 3;

  let score = 0;

  if (nameToTraditionalType(DOMICILE_RULER[signIndex]) === planetType) score += 5;

  for (const [name, exaltSign] of Object.entries(EXALTATION)) {
    if (exaltSign === signIndex && nameToTraditionalType(name) === planetType) {
      score += 4;
      break;
    }
  }

  const triplicity = TRIPLICITY_RULERS[elementIndex];
  if (
    nameToTraditionalType(sect === "Diurno" ? triplicity.day : triplicity.night) ===
    planetType
  ) {
    score += 3;
  }

  const term = EGYPTIAN_TERMS[signIndex].find((item) => degreeInSign < item.endDeg);
  if (term && nameToTraditionalType(term.ruler) === planetType) score += 2;

  const face = FACES[signIndex][Math.floor(degreeInSign / 10)];
  if (nameToTraditionalType(face) === planetType) score += 1;

  for (const [name, signs] of Object.entries(DETRIMENT)) {
    if (nameToTraditionalType(name) === planetType && signs.includes(signIndex)) {
      score -= 5;
      break;
    }
  }

  for (const [name, fallSign] of Object.entries(FALL)) {
    if (nameToTraditionalType(name) === planetType && fallSign === signIndex) {
      score -= 4;
      break;
    }
  }

  return score;
}

function getAspectDifficultyCounts(planets: Planet[], target: Planet): {
  easy: number;
  hard: number;
} {
  let easy = 0;
  let hard = 0;

  planets
    .filter((planet) => planet.name !== target.name)
    .forEach((planet) => {
      const rawDiff = Math.abs(target.longitudeRaw - planet.longitudeRaw);
      const diff = rawDiff > 180 ? 360 - rawDiff : rawDiff;

      if (Math.abs(diff - 60) <= 5 || Math.abs(diff - 120) <= 5) {
        easy += 1;
      } else if (Math.abs(diff - 90) <= 5 || Math.abs(diff - 180) <= 5) {
        hard += 1;
      }
    });

  return { easy, hard };
}

export function getLordOfNativity(chart: BirthChart): LordOfNativityResult {
  const sect = getSect(
    chart.planets.find((planet) => planet.type === "sun")!.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house
  );

  const traditionalPlanets = chart.planets.filter((planet) =>
    TRADITIONAL_PLANET_TYPES.has(planet.type as TraditionalPlanetType)
  );

  const rankedPlanets = traditionalPlanets
    .map((planet) => {
      const aspectCounts = getAspectDifficultyCounts(traditionalPlanets, planet);
      const signIndex = getSignIndex(planet.longitudeRaw);

      return {
        planet,
        signIndex,
        score: getEssentialScore(planet, sect),
        easyAspects: aspectCounts.easy,
        hardAspects: aspectCounts.hard,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (right.easyAspects !== left.easyAspects) {
        return right.easyAspects - left.easyAspects;
      }
      if (left.hardAspects !== right.hardAspects) {
        return left.hardAspects - right.hardAspects;
      }

      return left.planet.longitudeRaw - right.planet.longitudeRaw;
    });

  const winner = rankedPlanets[0];
  const contributions = modulateBySign(
    getPlanetContributions(winner.planet.type as TraditionalPlanetType),
    winner.signIndex
  );

  return {
    planet: winner.planet.name,
    longitude: winner.planet.longitudeRaw,
    sign: SIGNS[winner.signIndex],
    score: winner.score,
    easyAspects: winner.easyAspects,
    hardAspects: winner.hardAspects,
    contributions,
  };
}

export function calculateTemperament(chart: BirthChart): TemperamentResult {
  const planets = chart.planets;
  const sun = planets.find((planet) => planet.type === "sun")!;
  const moon = planets.find((planet) => planet.type === "moon")!;
  const ascLongitude = chart.housesData.ascendant;
  const ascSignIndex = getSignIndex(ascLongitude);
  const ascSign = SIGNS[ascSignIndex];
  const ascRulerType = SIGN_RULER_TYPES[ascSignIndex];
  const ascRuler = planets.find((planet) => planet.type === ascRulerType);
  const sunSignIndex = getSignIndex(sun.longitudeRaw);
  const moonSignIndex = getSignIndex(moon.longitudeRaw);
  const moonPhaseAngle = normalizeLongitude(moon.longitudeRaw - sun.longitudeRaw);
  const lordOfNativity = getLordOfNativity(chart);
  const witnesses: TemperamentWitness[] = [];

  let totals = ZERO_TOTALS();

  const addWitness = (
    label: string,
    details: string,
    contributions: TemperamentTotals
  ) => {
    totals = sumTotals(totals, contributions);
    witnesses.push({ label, details, contributions });
  };

  const ascContributions = getSignContributions(ascSignIndex);
  addWitness(
    "Signo ascendente",
    `${ascSign} na Casa 1 -> ${describeContributions(ascContributions)}`,
    ascContributions
  );

  if (ascRuler) {
    const ascRulerSignIndex = getSignIndex(ascRuler.longitudeRaw);
    const ascRulerContributions = modulateBySign(
      getPlanetContributions(ascRuler.type as TraditionalPlanetType),
      ascRulerSignIndex,
    );

    addWitness(
      "Regente do ascendente",
      `${ascRuler.name} em ${SIGNS[ascRulerSignIndex]} -> ${describeContributions(ascRulerContributions)}`,
      ascRulerContributions
    );
  }

  const seasonWitness = getSeasonWitness(sunSignIndex);
  const seasonContributions = modulateBySign(seasonWitness.base, sunSignIndex);
  addWitness(
    "Estacao do Sol",
    `${seasonWitness.label} modulada por ${SIGNS[sunSignIndex]} -> ${describeContributions(seasonContributions)}`,
    seasonContributions
  );

  const moonPhaseWitness = getMoonPhaseWitness(moonPhaseAngle);
  const moonPhaseContributions = modulateBySign(
    moonPhaseWitness.base,
    moonSignIndex
  );
  addWitness(
    "Fase da Lua",
    `${moonPhaseWitness.label} modulada por ${SIGNS[moonSignIndex]} -> ${describeContributions(moonPhaseContributions)}`,
    moonPhaseContributions
  );

  addWitness(
    "Senhor da natividade",
    `${lordOfNativity.planet} em ${lordOfNativity.sign} (essenciais ${lordOfNativity.score}, faceis ${lordOfNativity.easyAspects}, dificeis ${lordOfNativity.hardAspects}) -> ${describeContributions(lordOfNativity.contributions)}`,
    lordOfNativity.contributions
  );

  const hotDelta = totals.hot - totals.cold;
  const dryDelta = totals.dry - totals.moist;
  const dominantHeat = hotDelta >= 0 ? "Quente" : "Frio";
  const dominantHumidity = dryDelta >= 0 ? "Seco" : "Umido";

  const temperamentMap: Record<string, string> = {
    "Quente/Seco": "Colerico",
    "Quente/Umido": "Sanguineo",
    "Frio/Seco": "Melancolico",
    "Frio/Umido": "Fleumatico",
  };

  const dominantTemperament = temperamentMap[`${dominantHeat}/${dominantHumidity}`];
  const oppositeHeat = dominantHeat === "Quente" ? "Frio" : "Quente";
  const oppositeHumidity = dominantHumidity === "Seco" ? "Umido" : "Seco";

  let inferiorTemperament = dominantTemperament;

  if (Math.abs(dryDelta) > Math.abs(hotDelta)) {
    inferiorTemperament = temperamentMap[`${oppositeHeat}/${dominantHumidity}`];
  } else if (Math.abs(hotDelta) > Math.abs(dryDelta)) {
    inferiorTemperament = temperamentMap[`${dominantHeat}/${oppositeHumidity}`];
  } else {
    const temperamentScores: Array<{ name: string; score: number }> = [
      { name: "Colerico", score: totals.hot + totals.dry },
      { name: "Sanguineo", score: totals.hot + totals.moist },
      { name: "Melancolico", score: totals.cold + totals.dry },
      { name: "Fleumatico", score: totals.cold + totals.moist },
    ].sort((left, right) => right.score - left.score);

    const secondBest = temperamentScores.find(
      (item) => item.name !== dominantTemperament,
    );

    inferiorTemperament = secondBest?.name ?? dominantTemperament;
  }

  const summary = `${dominantTemperament}-${inferiorTemperament}`;

  return {
    temperament: summary,
    dominantTemperament,
    inferiorTemperament,
    summary,
    totals,
    hotDelta,
    dryDelta,
    witnesses,
    lordOfNativity,
  };
}
