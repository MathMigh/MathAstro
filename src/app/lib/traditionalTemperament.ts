import { BirthChart, Planet } from "@/interfaces/BirthChartInterfaces";
import {
  DETRIMENT,
  DOMICILE_RULER,
  LILLY_TERMS,
  EXALTATION,
  FACES,
  FALL,
  HOUSE_SCORES,
  SIGN_QUALITIES,
  SIGNS,
  TRIPLICITY_RULERS,
} from "./traditionalTables";
import { getHouseIndex, getSect } from "./traditionalCalculations";

export interface TemperamentTotals {
  hot: number;
  cold: number;
  dry: number;
  moist: number;
}

export interface TemperamentWitness {
  label: string;
  /** Raw compatibility trace; audit only. */
  details: string;
  /** Canonical human-readable evidence without invented weighting. */
  qualitativeDetails: string;
  /** Qualities contributed by this witness, categorical only. */
  qualitativeContributions: Array<"quente" | "frio" | "seco" | "úmido">;
  contributions: TemperamentTotals;
}

export interface LordOfNativityResult {
  planet: string | null;
  longitude: number;
  sign: string;
  score: number;
  easyAspects: number;
  hardAspects: number;
  houseScore: number;
  essentialHierarchy: {
    domicile: boolean;
    exaltation: boolean;
    triplicity: boolean;
    term: boolean;
    face: boolean;
  };
  resolution:
    | "essential-hierarchy"
    | "essential-tie-accidental-angularity"
    | "unresolved";
  tiedCandidates: string[];
  contributions: TemperamentTotals;
}

export interface TemperamentComponentScore {
  temperament: "Colerico" | "Sanguineo" | "Melancolico" | "Fleumatico";
  score: number;
  rank: number;
}

export interface TemperamentResult {
  method: "Marcos Monteiro - cinco testemunhos";
  methodVersion: "1.3.0";
  status: "pronto-para-julgamento-qualitativo" | "incompleto-senhor-da-natividade";
  temperament: string;
  dominantTemperament: string;
  inferiorTemperament: string;
  strongestTemperament: string;
  weakestTemperament: string;
  mixture: TemperamentComponentScore[];
  summary: string;
  totals: TemperamentTotals;
  hotDelta: number;
  dryDelta: number;
  intensity: "leve" | "definido" | "equilibrado" | "indeterminado";
  witnesses: TemperamentWitness[];
  canonicalConclusion: null;
  compatibilityOnly: { summary: string; totals: TemperamentTotals; hotDelta: number; dryDelta: number; mixture: TemperamentComponentScore[] };
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
  _signIndex: number
): TemperamentTotals {
  // Marcos descreve reforço/atenuação qualitativamente ("muito", "pouco").
  // O corpus não fornece multiplicadores universais. Portanto preservamos
  // o testemunho-base sem inventar 1.25/0.75; a modulação pelo signo fica
  // explícita no texto de evidência, não numa aritmética apresentada como fonte.
  return cloneTotals(baseContributions);
}

function describeSignModulation(base: TemperamentTotals, signIndex: number): string {
  const sign = getSignContributions(signIndex);
  const notes: string[] = [];
  const compare = (quality: keyof TemperamentTotals, opposite: keyof TemperamentTotals, label: string) => {
    if (base[quality] <= 0) return;
    if (sign[quality] > 0) notes.push(`${label} reforçado pelo signo`);
    else if (sign[opposite] > 0) notes.push(`${label} atenuado/contrariado pelo signo`);
  };
  compare("hot", "cold", "quente");
  compare("cold", "hot", "frio");
  compare("dry", "moist", "seco");
  compare("moist", "dry", "úmido");
  return notes.join("; ") || "modulação sem quantificação adicional";
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

type EssentialHierarchy = LordOfNativityResult["essentialHierarchy"];

function getEssentialHierarchy(planet: Planet, sect: "Diurno" | "Noturno"): EssentialHierarchy {
  if (!TRADITIONAL_PLANET_TYPES.has(planet.type as TraditionalPlanetType)) {
    return { domicile: false, exaltation: false, triplicity: false, term: false, face: false };
  }

  const planetType = planet.type as TraditionalPlanetType;
  const signIndex = getSignIndex(planet.longitudeRaw);
  const degreeInSign = normalizeLongitude(planet.longitudeRaw) % 30;
  const signContributions = getSignContributions(signIndex);
  const elementIndex =
    signContributions.hot && signContributions.dry ? 0
      : signContributions.cold && signContributions.dry ? 1
        : signContributions.hot && signContributions.moist ? 2 : 3;

  const domicile = nameToTraditionalType(DOMICILE_RULER[signIndex]) === planetType;
  const exaltation = Object.entries(EXALTATION).some(
    ([name, exaltSign]) => exaltSign === signIndex && nameToTraditionalType(name) === planetType,
  );
  const triplicityRulers = TRIPLICITY_RULERS[elementIndex];
  const triplicity = nameToTraditionalType(sect === "Diurno" ? triplicityRulers.day : triplicityRulers.night) === planetType;
  const term = LILLY_TERMS[signIndex].find((item) => degreeInSign < item.endDeg);
  const face = FACES[signIndex][Math.floor(degreeInSign / 10)];

  return {
    domicile,
    exaltation,
    triplicity,
    term: Boolean(term && nameToTraditionalType(term.ruler) === planetType),
    face: nameToTraditionalType(face) === planetType,
  };
}

function hierarchyVector(hierarchy: EssentialHierarchy): number[] {
  return [hierarchy.domicile, hierarchy.exaltation, hierarchy.triplicity, hierarchy.term, hierarchy.face].map((value) => value ? 1 : 0);
}

function compareHierarchy(first: EssentialHierarchy, second: EssentialHierarchy): number {
  const a = hierarchyVector(first);
  const b = hierarchyVector(second);
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function hierarchyPriorityValue(hierarchy: EssentialHierarchy): number {
  if (hierarchy.domicile) return 5;
  if (hierarchy.exaltation) return 4;
  if (hierarchy.triplicity) return 3;
  if (hierarchy.term) return 2;
  if (hierarchy.face) return 1;
  return 0;
}

function getAspectDifficultyCounts(planets: Planet[], target: Planet): {
  easy: number;
  hard: number;
} {
  const MAX_ASPECT_ORB = 3;
  const CAZIMI_ORB = 17 / 60;
  let easy = 0;
  let hard = 0;

  planets
    .filter((planet) => planet.name !== target.name)
    .forEach((planet) => {
      const rawDiff = Math.abs(target.longitudeRaw - planet.longitudeRaw);
      const diff = rawDiff > 180 ? 360 - rawDiff : rawDiff;
      const targetSign = getSignIndex(target.longitudeRaw);
      const planetSign = getSignIndex(planet.longitudeRaw);
      const signDistance = (planetSign - targetSign + 12) % 12;

      if (signDistance === 0 && diff <= MAX_ASPECT_ORB) {
        const involvesSun = target.type === "sun" || planet.type === "sun";

        if (involvesSun) {
          if (diff <= CAZIMI_ORB) easy += 1;
          else hard += 1;
        }

        return;
      }

      const isSextile =
        (signDistance === 2 || signDistance === 10) &&
        Math.abs(diff - 60) <= MAX_ASPECT_ORB;
      const isTrine =
        (signDistance === 4 || signDistance === 8) &&
        Math.abs(diff - 120) <= MAX_ASPECT_ORB;
      const isSquare =
        (signDistance === 3 || signDistance === 9) &&
        Math.abs(diff - 90) <= MAX_ASPECT_ORB;
      const isOpposition =
        signDistance === 6 && Math.abs(diff - 180) <= MAX_ASPECT_ORB;

      if (isSextile || isTrine) {
        easy += 1;
      } else if (isSquare || isOpposition) {
        hard += 1;
      }
    });

  return { easy, hard };
}

export function getLordOfNativity(chart: BirthChart): LordOfNativityResult {
  const sect = getSect(
    chart.planets.find((planet) => planet.type === "sun")!.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house,
  );

  const traditionalPlanets = chart.planets.filter((planet) =>
    TRADITIONAL_PLANET_TYPES.has(planet.type as TraditionalPlanetType),
  );

  if (traditionalPlanets.length === 0) {
    throw new Error("Nao ha planetas tradicionais para calcular o Senhor da Natividade.");
  }

  const candidates = traditionalPlanets.map((planet) => {
    const aspectCounts = getAspectDifficultyCounts(traditionalPlanets, planet);
    const signIndex = getSignIndex(planet.longitudeRaw);
    const houseIndex = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
    const essentialHierarchy = getEssentialHierarchy(planet, sect);
    return {
      planet,
      signIndex,
      essentialHierarchy,
      score: hierarchyPriorityValue(essentialHierarchy),
      easyAspects: aspectCounts.easy,
      hardAspects: aspectCounts.hard,
      houseScore: HOUSE_SCORES[houseIndex - 1] ?? 0,
    };
  });

  const sorted = [...candidates].sort((first, second) => {
    const hierarchy = compareHierarchy(second.essentialHierarchy, first.essentialHierarchy);
    if (hierarchy !== 0) return hierarchy;
    return first.planet.name.localeCompare(second.planet.name);
  });
  const best = sorted[0];
  const finalists = sorted.filter((item) => compareHierarchy(item.essentialHierarchy, best.essentialHierarchy) === 0);
  const angularHouses = new Set([1, 4, 7, 10]);
  const angularFinalists = finalists.filter((item) => angularHouses.has(getHouseIndex(item.planet.longitudeRaw, chart.housesData.house)));
  const winner = finalists.length === 1
    ? finalists[0]
    : angularFinalists.length === 1
      ? angularFinalists[0]
      : null;
  const tiedCandidates = winner ? [] : finalists.map((item) => item.planet.name);
  const contributions = winner
    ? modulateBySign(
        getPlanetContributions(winner.planet.type as TraditionalPlanetType),
        winner.signIndex,
      )
    : ZERO_TOTALS();

  // Marcos usa a condição acidental para desempatar candidatos essencialmente equivalentes.
  // O motor só automatiza o caso source-locked e inequívoco de angularidade exclusiva;
  // aspectos, estrelas e demais condições permanecem evidência qualitativa, sem score inventado.
  return {
    planet: winner?.planet.name ?? null,
    longitude: winner?.planet.longitudeRaw ?? Number.NaN,
    sign: winner ? SIGNS[winner.signIndex] : "Indeterminado",
    score: winner?.score ?? best.score,
    easyAspects: winner?.easyAspects ?? Math.max(...finalists.map((item) => item.easyAspects)),
    hardAspects: winner?.hardAspects ?? Math.min(...finalists.map((item) => item.hardAspects)),
    houseScore: winner?.houseScore ?? 0,
    essentialHierarchy: winner?.essentialHierarchy ?? best.essentialHierarchy,
    resolution: winner
      ? (finalists.length === 1 ? "essential-hierarchy" : "essential-tie-accidental-angularity")
      : "unresolved",
    tiedCandidates,
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
    const qualitativeDetails = details.replace(/\s*->\s*[^;]+(?:;\s*)?/, "; ").replace(/;\s*;/g, ";").replace(/;\s*$/, "");
    const qualitativeContributions: TemperamentWitness["qualitativeContributions"] = [];
    if (contributions.hot > 0) qualitativeContributions.push("quente");
    if (contributions.cold > 0) qualitativeContributions.push("frio");
    if (contributions.dry > 0) qualitativeContributions.push("seco");
    if (contributions.moist > 0) qualitativeContributions.push("úmido");
    witnesses.push({ label, details, qualitativeDetails, qualitativeContributions, contributions });
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
      `${ascRuler.name} em ${SIGNS[ascRulerSignIndex]} -> ${describeContributions(ascRulerContributions)}; ${describeSignModulation(getPlanetContributions(ascRuler.type as TraditionalPlanetType), ascRulerSignIndex)}`,
      ascRulerContributions
    );
  }

  const seasonWitness = getSeasonWitness(sunSignIndex);
  const seasonContributions = modulateBySign(seasonWitness.base, sunSignIndex);
  addWitness(
    "Estacao do Sol",
    `${seasonWitness.label} em ${SIGNS[sunSignIndex]} -> ${describeContributions(seasonContributions)}; ${describeSignModulation(seasonWitness.base, sunSignIndex)}`,
    seasonContributions
  );

  const moonPhaseWitness = getMoonPhaseWitness(moonPhaseAngle);
  const moonPhaseContributions = modulateBySign(
    moonPhaseWitness.base,
    moonSignIndex
  );
  addWitness(
    "Fase da Lua",
    `${moonPhaseWitness.label} com Lua em ${SIGNS[moonSignIndex]} -> ${describeContributions(moonPhaseContributions)}; ${describeSignModulation(moonPhaseWitness.base, moonSignIndex)}`,
    moonPhaseContributions
  );

  addWitness(
    "Senhor da natividade",
    lordOfNativity.planet
      ? `${lordOfNativity.planet} em ${lordOfNativity.sign} (${lordOfNativity.resolution === "essential-tie-accidental-angularity" ? "empate essencial resolvido por angularidade acidental exclusiva" : "seleção por hierarquia essencial"}; aspectos permanecem evidência) -> ${describeContributions(lordOfNativity.contributions)}`
      : `Empate não resolvido após hierarquia essencial e gate acidental inequívoco: ${lordOfNativity.tiedCandidates.join(", ")}. Aspectos/estrelas não recebem desempate numérico inventado.`,
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

  const componentScores = ([
    { temperament: "Colerico", score: totals.hot + totals.dry, rank: 0 },
    { temperament: "Sanguineo", score: totals.hot + totals.moist, rank: 0 },
    { temperament: "Melancolico", score: totals.cold + totals.dry, rank: 0 },
    { temperament: "Fleumatico", score: totals.cold + totals.moist, rank: 0 },
  ] satisfies TemperamentComponentScore[])
    .sort((left, right) => right.score - left.score || left.temperament.localeCompare(right.temperament))
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const dominantTemperament = componentScores[0].temperament;
  const inferiorTemperament = componentScores[1]?.temperament ?? dominantTemperament;
  const strongestTemperament = componentScores[0].temperament;
  const weakestTemperament = componentScores[componentScores.length - 1].temperament;

  const BALANCE_EPSILON = 1e-9;
  const heatIsBalanced = Math.abs(hotDelta) <= BALANCE_EPSILON;
  const humidityIsBalanced = Math.abs(dryDelta) <= BALANCE_EPSILON;
  const weakestExcess = Math.min(Math.abs(hotDelta), Math.abs(dryDelta));

  let intensity: TemperamentResult["intensity"] = "definido";
  let summary: string = dominantTemperament;

  if (heatIsBalanced && humidityIsBalanced) {
    intensity = "equilibrado";
    summary = "Equilibrado";
  } else if (heatIsBalanced || humidityIsBalanced) {
    intensity = "indeterminado";
    summary = `Indeterminado (${dominantTemperament})`;
  } else if (weakestExcess <= 1) {
    intensity = "leve";
    summary = `Levemente ${dominantTemperament}`;
  }

  return {
    method: "Marcos Monteiro - cinco testemunhos",
    methodVersion: "1.3.0",
    status: lordOfNativity.planet ? "pronto-para-julgamento-qualitativo" : "incompleto-senhor-da-natividade",
    temperament: "JULGAMENTO_QUALITATIVO_PENDENTE",
    dominantTemperament: "NOT_CANONICALLY_RESOLVED",
    inferiorTemperament: "NOT_CANONICALLY_RESOLVED",
    strongestTemperament: "NOT_CANONICALLY_RESOLVED",
    weakestTemperament: "NOT_CANONICALLY_RESOLVED",
    mixture: componentScores,
    summary: "Julgamento qualitativo pendente — não decidir por votação/score",
    totals,
    hotDelta,
    dryDelta,
    intensity: "indeterminado",
    witnesses,
    canonicalConclusion: null,
    compatibilityOnly: { summary, totals, hotDelta, dryDelta, mixture: componentScores },
    lordOfNativity,
  };
}
