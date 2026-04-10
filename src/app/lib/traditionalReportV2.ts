import moment from "moment-timezone";
import { BirthChart, Planet } from "@/interfaces/BirthChartInterfaces";
import {
  formatDegrees,
  getAlmuten,
  getAspects,
  getHouseIndex,
  getSect,
} from "./traditionalCalculations";
import {
  calculateArabicLots,
  DEFAULT_ARABIC_PARTS_MODE,
  fromTotal,
  ORDERED_ARABIC_PART_KEYS,
} from "./arabicLots";
import {
  AVERAGE_DAILY_SPEED,
  DETRIMENT,
  DOMICILE_RULER,
  EGYPTIAN_TERMS,
  EXALTATION,
  FACES,
  FALL,
  HOUSE_SCORES,
  HOUSE_TYPE,
  JUBILEE_HOUSE,
  SIGN_ELEMENT,
  SIGNS,
  TRIPLICITY_RULERS,
} from "./traditionalTables";
import { calculateTemperament } from "./traditionalTemperament";
import {
  buildFixedStarReportLine,
  calculateFixedStarMatches,
} from "./fixedStars";
import {
  getAbsoluteAngularDistance,
  normalizeLongitude,
} from "./aspectDynamics";
import { getSwe, resolveTimezone } from "./astrologyEngine";

const OUTER_PLANET_TYPES = new Set(["uranus", "neptune", "pluto"]);
const NODE_TYPES = new Set(["northNode", "southNode"]);
const TRADITIONAL_SOLAR_PROXIMITY_TYPES = new Set([
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
]);
const DIURNAL_PLANETS = new Set(["Sol", "Júpiter", "Saturno"]);
const FEMININE_PLANETS = new Set(["Lua", "Vênus"]);
const TRADITIONAL_PLANET_NAMES = [
  "Sol",
  "Lua",
  "Mercúrio",
  "Vênus",
  "Marte",
  "Júpiter",
  "Saturno",
];
const PARTICIPATING_TRIPLICITY_RULERS: Record<number, string> = {
  0: "Saturno",
  1: "Marte",
  2: "Júpiter",
  3: "Lua",
};
const CHALDEAN_ORDER = [
  "Saturno",
  "Júpiter",
  "Marte",
  "Sol",
  "Vênus",
  "Mercúrio",
  "Lua",
];
const WEEKDAY_RULERS = [
  "Sol",
  "Lua",
  "Marte",
  "Mercúrio",
  "Júpiter",
  "Vênus",
  "Saturno",
];
const ALMUTEN_HOUSE_POINTS: Record<number, number> = {
  1: 12,
  10: 11,
  7: 10,
  4: 9,
  11: 8,
  5: 7,
  2: 6,
  9: 5,
  3: 4,
  12: 3,
  8: 2,
  6: 1,
};
const RETROGRADE_SPEED_EPSILON = 1e-6;
const CAZIMI_ORB_DEGREES = 17 / 60;
const COMBUSTION_ORB_DEGREES = 8.5;
const SUN_BEAMS_ORB_DEGREES = 17;
const SOLAR_PROXIMITY_FLAG = 258;
const SYZYGY_SEARCH_STEP_DAYS = 0.5;
const SYZYGY_MAX_LOOKBACK_STEPS = 40;
const SEPARATOR = "--------------------------------------------------------------------\n";
const ARABIC_PARTS_WITH_DO_ARTICLE = new Set([
  "Espírito",
  "Amor",
  "Valor",
  "Cativeiro",
]);

interface TraditionalReportArabicPart {
  name: string;
  longitude: number;
  posFormatted: string;
  house: string;
  dispositor: string;
  antiscion: string;
}

interface SignedContribution {
  label: string;
  points: number;
}

interface AlmutenContribution {
  points: number;
  reasons: string[];
}

interface PrenatalSyzygy {
  type: "Lua Nova" | "Lua Cheia";
  longitude: number;
  sunLongitude: number;
  moonLongitude: number;
}

interface AlmutenAnalysis {
  pointLines: string[];
  houseLine: string;
  dayHourLine: string;
  scoreLine: string;
  winnerLine: string;
}

export async function generateTraditionalReport(chart: BirthChart): Promise<string> {
  const sect = getSect(
    chart.planets.find((planet) => planet.type === "sun")!.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house,
  );

  const sun = chart.planets.find((planet) => planet.type === "sun")!;
  const moon = chart.planets.find((planet) => planet.type === "moon")!;
  const mercury = chart.planets.find((planet) => planet.type === "mercury")!;
  const venus = chart.planets.find((planet) => planet.type === "venus")!;
  const mars = chart.planets.find((planet) => planet.type === "mars")!;
  const jupiter = chart.planets.find((planet) => planet.type === "jupiter")!;
  const saturn = chart.planets.find((planet) => planet.type === "saturn")!;
  const traditionalPlanets = [sun, moon, mercury, venus, mars, jupiter, saturn];
  const orderedPlanets = [
    ...traditionalPlanets,
    ...chart.planets.filter((planet) => OUTER_PLANET_TYPES.has(planet.type)),
    ...chart.planets.filter((planet) => NODE_TYPES.has(planet.type)),
  ];

  const asc = chart.housesData.ascendant;
  const mc = chart.housesData.mc;
  const desc = normalizeLongitude(asc + 180);
  const ic = normalizeLongitude(mc + 180);
  const temperament = calculateTemperament(chart);
  // Keep the textual report synchronized with the lots rendered in the chart UI.
  const lots = calculateArabicLots(chart, DEFAULT_ARABIC_PARTS_MODE);
  const parts = buildTraditionalReportArabicParts(chart, lots);
  const prenatalSyzygy = await calculatePrenatalSyzygy(chart);
  const almutenAnalysis = buildAlmutenAnalysis(
    chart,
    traditionalPlanets,
    lots.fortune?.longitude ?? asc,
    prenatalSyzygy,
  );

  let report = "MAPA TRADICIONAL OCIDENTAL:\n\n";
  report += `Ascendente em ${formatDegrees(asc)} (Lento).\n`;
  report += `Descendente em ${formatDegrees(desc)} (Lento).\n`;
  report += `Meio do Ceu (MC) em ${formatDegrees(mc)} (Lento).\n`;
  report += `Fundo do Ceu (IC) em ${formatDegrees(ic)} (Lento).\n\n`;

  orderedPlanets.forEach((planet) => {
    report += `${formatPlanetReportLine(planet, chart, sun)}\n`;
  });

  report += SEPARATOR;
  report += `Secto: ${sect}.\n`;
  report += SEPARATOR;
  report += `Temperamento: ${temperament.summary}.\n`;
  report += SEPARATOR;
  report += "Mentalidade: (Desejado...)\n";
  report += SEPARATOR;

  report += "CUSPIDES DAS CASAS:\n\n";
  chart.housesData.house.forEach((cuspLongitude, index) => {
    const houseNumber = index + 1;
    const almuten = getAlmuten(cuspLongitude, sect);
    const antiscionLongitude = normalizeLongitude(540 - cuspLongitude);
    report += `Casa ${houseNumber} em ${formatDegrees(cuspLongitude)}, almuten ${almuten}. (antiscion: ${formatDegrees(antiscionLongitude)}).\n`;
  });

  report += SEPARATOR;
  report += "PARTES ARABES:\n\n";
  parts.forEach((part) => {
    report += `Parte ${getArabicPartArticle(part.name)} ${part.name} em ${part.posFormatted} na ${part.house}. (Dispositor: ${part.dispositor}). Antiscion: ${part.antiscion}.\n`;
  });

  report += SEPARATOR;
  report += "ANTISCIOS:\n\n";
  chart.planets
    .concat(parts.map((part) => ({ name: part.name, longitudeRaw: part.longitude } as Planet)))
    .forEach((point) => {
      const antiscionLongitude = normalizeLongitude(540 - point.longitudeRaw);
      const contrantiscion = formatDegrees(normalizeLongitude(antiscionLongitude + 180));
      report += `${point.name} - antiscion: ${formatDegrees(antiscionLongitude)} | contrantiscion: ${contrantiscion}.\n`;
    });

  report += SEPARATOR;
  report += "ESTRELAS FIXAS:\n\n";
  const fixedStarMatches = chart.fixedStarMatches ?? calculateFixedStarMatches(chart);

  if (fixedStarMatches.length === 0) {
    report += "Nenhuma estrela fixa associada dentro da orbe de 2°.\n";
  } else {
    const groupedMatches = fixedStarMatches.reduce<Record<string, typeof fixedStarMatches>>(
      (accumulator, match) => {
        if (!accumulator[match.pointName]) {
          accumulator[match.pointName] = [];
        }

        accumulator[match.pointName].push(match);
        return accumulator;
      },
      {},
    );

    Object.entries(groupedMatches).forEach(([pointName, matches]) => {
      const pointLongitude = matches[0]?.pointLongitude ?? 0;
      report += `${pointName} em ${formatDegrees(pointLongitude)}: ${matches
        .map((match) => buildFixedStarReportLine(match))
        .join("; ")};\n`;
    });
  }

  report += SEPARATOR;
  report += "ASPECTOS TRADICIONAIS:\n\n";
  const aspectList = getAspects(chart);
  if (aspectList.length === 0) {
    report += "Nenhum aspecto tradicional encontrado dentro da orbe configurada.\n";
  } else {
    aspectList.forEach((aspect) => {
      report += `${aspect}\n`;
    });
  }

  report += SEPARATOR;
  report += "DIGNIDADES E DEBILIDADES ESSENCIAIS:\n\n";
  traditionalPlanets.forEach((planet) => {
    report += `${buildEssentialDignityLine(planet, sect)}\n`;
  });

  report += SEPARATOR;
  report += "DIGNIDADES E DEBILIDADES ACIDENTAIS:\n\n";
  traditionalPlanets.forEach((planet) => {
    report += `${buildAccidentalDignityLine(planet, chart, sect, sun)}\n`;
  });

  report += SEPARATOR;
  report += "ALMUTEN FIGURIS:\n\n";
  almutenAnalysis.pointLines.forEach((line) => {
    report += `${line}\n`;
  });
  report += `${almutenAnalysis.houseLine}\n`;
  report += `${almutenAnalysis.dayHourLine}\n`;
  report += `${almutenAnalysis.scoreLine}\n`;
  report += `${almutenAnalysis.winnerLine}\n`;

  report += SEPARATOR;
  report += "DISPOSITORES:\n\n";
  traditionalPlanets.forEach((planet) => {
    report += `${buildDispositorLine(planet, chart)}\n`;
  });

  report += SEPARATOR;

  return report;
}

function buildTraditionalReportArabicParts(
  chart: BirthChart,
  lots = calculateArabicLots(chart, DEFAULT_ARABIC_PARTS_MODE),
): TraditionalReportArabicPart[] {
  return ORDERED_ARABIC_PART_KEYS.flatMap((key) => {
    const lot = lots[key];
    if (!lot) {
      return [];
    }

    const { signo } = fromTotal(lot.longitudeRaw);
    const ruler = DOMICILE_RULER[signo];
    const rulerPlanet = chart.planets.find((planet) => planet.name === ruler);

    return [
      {
        name: lot.name,
        longitude: lot.longitude,
        posFormatted: formatDegrees(lot.longitude),
        house: `Casa ${getHouseIndex(lot.longitude, chart.housesData.house)}`,
        dispositor: formatDispositor(ruler, rulerPlanet, chart),
        antiscion: formatDegrees(lot.antiscionRaw),
      },
    ];
  });
}

function getArabicPartArticle(name: string): string {
  return ARABIC_PARTS_WITH_DO_ARTICLE.has(name) ? "do" : "da";
}

function formatDispositor(
  ruler: string,
  rulerPlanet: Planet | undefined,
  chart: BirthChart,
): string {
  if (!rulerPlanet) {
    return ruler;
  }

  return `${ruler} em ${formatDegrees(rulerPlanet.longitudeRaw)}, na Casa ${getHouseIndex(rulerPlanet.longitudeRaw, chart.housesData.house)}`;
}

function formatPlanetReportLine(
  planet: Planet,
  chart: BirthChart,
  sun: Planet,
): string {
  const houseIndex = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
  const { sign, degrees } = formatSignAndDegrees(planet.longitudeRaw);
  const solarCondition = getSolarConditionDescription(planet, sun);
  const motion = getPlanetMotionDescription(planet);
  const note = getTraditionalPlanetNote(planet);
  const baseLine = `${planet.name} em ${sign}, a ${degrees}, na Casa ${romanize(houseIndex)}`;

  if (solarCondition) {
    return `${baseLine} (${solarCondition}), (${motion})${note}.`;
  }

  return `${baseLine} (${motion})${note}.`;
}

function formatSignAndDegrees(longitude: number): { sign: string; degrees: string } {
  const totalMinutes = ((Math.round(longitude * 60) % 21600) + 21600) % 21600;
  const signIndex = Math.floor(totalMinutes / 1800) % 12;
  const remaining = totalMinutes - signIndex * 1800;
  const degree = Math.floor(remaining / 60);
  const minute = remaining % 60;

  return {
    sign: SIGNS[signIndex],
    degrees: `${degree}°${minute.toString().padStart(2, "0")}’`,
  };
}

function getPlanetMotionDescription(planet: Planet): string {
  if (planet.isRetrograde) {
    return "Movimento Retrógrado";
  }

  const averageSpeed = AVERAGE_DAILY_SPEED[planet.name];
  if (
    averageSpeed &&
    Number.isFinite(planet.longitudeSpeed) &&
    planet.longitudeSpeed >= -RETROGRADE_SPEED_EPSILON &&
    Math.abs(planet.longitudeSpeed) >= averageSpeed * 0.85
  ) {
    return "Movimento Direto - Rápido";
  }

  return "Movimento Direto - Lento";
}

function getSolarConditionDescription(planet: Planet, sun: Planet): string | null {
  if (
    planet.type === "sun" ||
    !TRADITIONAL_SOLAR_PROXIMITY_TYPES.has(planet.type)
  ) {
    return null;
  }

  const solarDistance = getAbsoluteAngularDistance(
    planet.longitudeRaw,
    sun.longitudeRaw,
  );
  const formattedDistance = formatAngularDistance(solarDistance);
  const sameSign = getSignIndex(planet.longitudeRaw) === getSignIndex(sun.longitudeRaw);

  if (solarDistance <= CAZIMI_ORB_DEGREES) {
    return `Cazimi: a ${formattedDistance} do Sol, no coração do Sol`;
  }

  if (solarDistance <= COMBUSTION_ORB_DEGREES) {
    if (sameSign) {
      return `Combusto: a ${formattedDistance} do Sol, no mesmo signo`;
    }

    return `Aflição por proximidade: a ${formattedDistance} do Sol em signo diferente, portanto não combusto; também não está sob os raios, que exigem a faixa de 8°30’ a 17°`;
  }

  if (solarDistance <= SUN_BEAMS_ORB_DEGREES) {
    return `Aflição: sob os raios do Sol, a ${formattedDistance}`;
  }

  return null;
}

function getTraditionalPlanetNote(planet: Planet): string {
  if (OUTER_PLANET_TYPES.has(planet.type)) {
    return " (Só considerado como Estrela Fixa na Astrologia Tradicional, e seu valor só importa enquanto conjunção ou oposição)";
  }

  if (NODE_TYPES.has(planet.type)) {
    return " (Na Astrologia Tradicional seu valor só importa enquanto conjunção ou oposição)";
  }

  return "";
}

function getSignIndex(longitude: number): number {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12;
}

function formatAngularDistance(distance: number): string {
  const totalMinutes = Math.round(distance * 60);
  const degrees = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${degrees}°${minutes.toString().padStart(2, "0")}’`;
}

function buildEssentialDignityLine(
  planet: Planet,
  sect: "Diurno" | "Noturno",
): string {
  const contributions = getEssentialContributions(planet, sect);
  const total = getContributionTotal(contributions);
  const { sign, degrees } = formatSignAndDegrees(planet.longitudeRaw);

  if (contributions.length === 0) {
    return `${planet.name} em ${sign}, a ${degrees} — Peregrino (0 pontos).`;
  }

  return `${planet.name} em ${sign}, a ${degrees} — ${contributions
    .map((contribution) => formatContribution(contribution))
    .join(", ")} → ${formatPointsTotal(total)} (${getEssentialClassification(total, planet.name)}).`;
}

function buildAccidentalDignityLine(
  planet: Planet,
  chart: BirthChart,
  sect: "Diurno" | "Noturno",
  sun: Planet,
): string {
  const houseIndex = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
  const contributions = getAccidentalContributions(planet, chart, sect, sun);
  const total = getContributionTotal(contributions);

  return `${planet.name} (Casa ${romanize(houseIndex)} – ${HOUSE_TYPE[houseIndex - 1]}) — ${contributions
    .map((contribution) => formatContribution(contribution))
    .join(", ")} → ${formatPointsTotal(total)} (${getAccidentalClassification(total, planet.name)}).`;
}

function getEssentialContributions(
  planet: Planet,
  sect: "Diurno" | "Noturno",
): SignedContribution[] {
  const signIndex = getSignIndex(planet.longitudeRaw);
  const degreeInSign = normalizeLongitude(planet.longitudeRaw) % 30;
  const elementIndex = SIGN_ELEMENT[signIndex];
  const triplicity = TRIPLICITY_RULERS[elementIndex];
  const term = EGYPTIAN_TERMS[signIndex].find(
    (entry) => degreeInSign < entry.endDeg,
  )?.ruler;
  const face = FACES[signIndex][Math.floor(degreeInSign / 10)];
  const contributions: SignedContribution[] = [];

  if (planet.name === DOMICILE_RULER[signIndex]) {
    contributions.push({ label: "Domicílio", points: 5 });
  }

  const exaltationRuler = Object.entries(EXALTATION).find(
    ([, exaltedSign]) => exaltedSign === signIndex,
  )?.[0];
  if (planet.name === exaltationRuler) {
    contributions.push({ label: "Exaltação", points: 4 });
  }

  if (planet.name === (sect === "Diurno" ? triplicity.day : triplicity.night)) {
    contributions.push({ label: "Triplicidade", points: 3 });
  }

  if (planet.name === term) {
    contributions.push({ label: "Termo", points: 2 });
  }

  if (planet.name === face) {
    contributions.push({ label: "Face", points: 1 });
  }

  if (DETRIMENT[planet.name]?.includes(signIndex)) {
    contributions.push({ label: "Detrimento", points: -5 });
  }

  if (FALL[planet.name] === signIndex) {
    contributions.push({ label: "Queda", points: -4 });
  }

  return contributions;
}

function getAccidentalContributions(
  planet: Planet,
  chart: BirthChart,
  sect: "Diurno" | "Noturno",
  sun: Planet,
): SignedContribution[] {
  const houseIndex = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
  const contributions: SignedContribution[] = [
    {
      label: "Casa",
      points: HOUSE_SCORES[houseIndex - 1] ?? 0,
    },
  ];

  if (planet.name !== "Sol") {
    contributions.push(getSpeedContribution(planet));

    const solarContribution = getSolarContribution(planet, sun);
    if (solarContribution) {
      contributions.push(solarContribution);
    }

    const orientationContribution = getOrientationContribution(planet, sun, sect);
    if (orientationContribution) {
      contributions.push(orientationContribution);
    }
  }

  contributions.push({
    label: "Halb",
    points: isPlanetInHalb(planet, houseIndex, sect, sun) ? 2 : 0,
  });

  contributions.push(getJubileeContribution(planet, houseIndex));

  return contributions;
}

function getContributionTotal(contributions: SignedContribution[]): number {
  return contributions.reduce((sum, contribution) => {
    return sum + contribution.points;
  }, 0);
}

function getSpeedContribution(planet: Planet): SignedContribution {
  if (planet.isRetrograde) {
    return {
      label: "Retrógrado",
      points: -5,
    };
  }

  const averageSpeed = AVERAGE_DAILY_SPEED[planet.name];
  const isFast =
    averageSpeed !== undefined &&
    Number.isFinite(planet.longitudeSpeed) &&
    planet.longitudeSpeed >= -RETROGRADE_SPEED_EPSILON &&
    Math.abs(planet.longitudeSpeed) >= averageSpeed * 0.85;

  return {
    label: isFast ? "Rápido" : "Lento",
    points: isFast ? 2 : -2,
  };
}

function getSolarContribution(planet: Planet, sun: Planet): SignedContribution | null {
  if (planet.name === "Sol") {
    return null;
  }

  const distance = getAbsoluteAngularDistance(planet.longitudeRaw, sun.longitudeRaw);
  const sameSign = getSignIndex(planet.longitudeRaw) === getSignIndex(sun.longitudeRaw);

  if (distance <= CAZIMI_ORB_DEGREES) {
    return { label: "Cazimi", points: 5 };
  }

  if (distance <= COMBUSTION_ORB_DEGREES && sameSign) {
    return { label: "Combusto", points: -5 };
  }

  if (distance <= SUN_BEAMS_ORB_DEGREES) {
    return { label: "Sob os Raios do Sol", points: -4 };
  }

  if (distance <= COMBUSTION_ORB_DEGREES) {
    return { label: "Aflição por Proximidade", points: 0 };
  }

  return { label: "Livre do Sol", points: 5 };
}

function getOrientationContribution(
  planet: Planet,
  sun: Planet,
  sect: "Diurno" | "Noturno",
): SignedContribution | null {
  if (planet.name === "Sol") {
    return null;
  }

  const orientation = getOrientationLabel(planet, sun);
  const preferredOrientation = getPreferredOrientation(planet.name, sect);

  if (!preferredOrientation) {
    return null;
  }

  const label =
    planet.name === "Mercúrio"
      ? `${orientation} [${sect.toLowerCase()}]`
      : orientation;

  return {
    label,
    points: orientation === preferredOrientation ? 2 : -2,
  };
}

function getOrientationLabel(planet: Planet, sun: Planet): "Oriental" | "Ocidental" {
  const distanceFromSun = normalizeLongitude(sun.longitudeRaw - planet.longitudeRaw);
  return distanceFromSun < 180 ? "Oriental" : "Ocidental";
}

function getPreferredOrientation(
  planetName: string,
  sect: "Diurno" | "Noturno",
): "Oriental" | "Ocidental" | null {
  if (planetName === "Saturno" || planetName === "Júpiter" || planetName === "Marte") {
    return "Oriental";
  }

  if (planetName === "Lua" || planetName === "Vênus") {
    return "Ocidental";
  }

  if (planetName === "Mercúrio") {
    return sect === "Diurno" ? "Oriental" : "Ocidental";
  }

  return null;
}

function isPlanetInHalb(
  planet: Planet,
  houseIndex: number,
  sect: "Diurno" | "Noturno",
  sun: Planet,
): boolean {
  const isAboveHorizon = houseIndex >= 7 && houseIndex <= 12;
  const isDiurnalPlanet =
    planet.name === "Mercúrio"
      ? getOrientationLabel(planet, sun) === "Oriental"
      : DIURNAL_PLANETS.has(planet.name);
  const shouldBeAboveHorizon = sect === "Diurno" ? isDiurnalPlanet : !isDiurnalPlanet;

  return isAboveHorizon === shouldBeAboveHorizon;
}

function getJubileeContribution(planet: Planet, houseIndex: number): SignedContribution {
  const jubileeHouse = JUBILEE_HOUSE[planet.name];
  if (!jubileeHouse) {
    return {
      label: "Júbilo",
      points: 0,
    };
  }

  if (houseIndex === jubileeHouse) {
    return {
      label: "Júbilo",
      points: 2,
    };
  }

  const oppositeHouse = ((jubileeHouse + 5) % 12) + 1;
  if (houseIndex === oppositeHouse) {
    return {
      label: "Op. Júbilo",
      points: -1,
    };
  }

  return {
    label: "Júbilo",
    points: 0,
  };
}

function buildDispositorLine(planet: Planet, chart: BirthChart): string {
  const chainParts = [
    `${planet.name} em ${SIGNS[getSignIndex(planet.longitudeRaw)]} (Casa ${romanize(
      getHouseIndex(planet.longitudeRaw, chart.housesData.house),
    )})`,
  ];
  const visited = new Map<string, number>([[planet.name, -1]]);
  let currentPlanet = planet;
  const traversedRulers: Planet[] = [];

  for (let index = 0; index < 12; index += 1) {
    const rulerName = DOMICILE_RULER[getSignIndex(currentPlanet.longitudeRaw)];
    const rulerPlanet = chart.planets.find((candidate) => candidate.name === rulerName);

    if (!rulerPlanet) {
      chainParts.push(`Dispositor final: ${rulerName} (dispositor final)`);
      break;
    }

    const rulerDescription = `${rulerPlanet.name} em ${SIGNS[getSignIndex(rulerPlanet.longitudeRaw)]}`;

    if (rulerPlanet.name === currentPlanet.name) {
      chainParts.push(`Dispositor final: ${rulerDescription} (dispositor final)`);
      break;
    }

    const repeatedIndex = visited.get(rulerPlanet.name);
    if (repeatedIndex !== undefined) {
      const cyclePlanets =
        repeatedIndex < 0
          ? [planet, ...traversedRulers]
          : traversedRulers.slice(repeatedIndex);
      const finalDispositor = getDominantDispositor(cyclePlanets, chart);
      chainParts.push(
        `Dispositor final: ${finalDispositor.name} em ${SIGNS[getSignIndex(finalDispositor.longitudeRaw)]} (dispositor final)`,
      );
      break;
    }

    chainParts.push(`Dispositor: ${rulerDescription}`);
    visited.set(rulerPlanet.name, traversedRulers.length);
    traversedRulers.push(rulerPlanet);
    currentPlanet = rulerPlanet;
  }

  return `${chainParts.join(" → ")}.`;
}

function getDominantDispositor(cyclePlanets: Planet[], chart: BirthChart): Planet {
  const sun = chart.planets.find((planet) => planet.type === "sun")!;
  const sect = getSect(
    sun.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house,
  );

  return cyclePlanets.reduce((bestPlanet, candidatePlanet) => {
    const bestEssential = getContributionTotal(getEssentialContributions(bestPlanet, sect));
    const candidateEssential = getContributionTotal(
      getEssentialContributions(candidatePlanet, sect),
    );

    if (candidateEssential !== bestEssential) {
      return candidateEssential > bestEssential ? candidatePlanet : bestPlanet;
    }

    const bestAccidental = getContributionTotal(
      getAccidentalContributions(bestPlanet, chart, sect, sun),
    );
    const candidateAccidental = getContributionTotal(
      getAccidentalContributions(candidatePlanet, chart, sect, sun),
    );

    if (candidateAccidental !== bestAccidental) {
      return candidateAccidental > bestAccidental ? candidatePlanet : bestPlanet;
    }

    return TRADITIONAL_PLANET_NAMES.indexOf(candidatePlanet.name) <
      TRADITIONAL_PLANET_NAMES.indexOf(bestPlanet.name)
      ? candidatePlanet
      : bestPlanet;
  }, cyclePlanets[0]!);
}

function buildAlmutenAnalysis(
  chart: BirthChart,
  traditionalPlanets: Planet[],
  fortuneLongitude: number,
  prenatalSyzygy: PrenatalSyzygy,
): AlmutenAnalysis {
  const totalScores = initializeAlmutenScores();
  const sensitivePoints = [
    {
      label: "Sol",
      longitude: traditionalPlanets.find((planet) => planet.name === "Sol")!.longitudeRaw,
    },
    {
      label: "Lua",
      longitude: traditionalPlanets.find((planet) => planet.name === "Lua")!.longitudeRaw,
    },
    {
      label: "Ascendente",
      longitude: chart.housesData.ascendant,
    },
    {
      label: "Parte da Fortuna",
      longitude: fortuneLongitude,
    },
    {
      label: `Última Sizígia (${prenatalSyzygy.type})`,
      longitude: prenatalSyzygy.longitude,
    },
  ];

  const pointLines = sensitivePoints.map((point) => {
    const contributions = getAlmutenPointContributions(point.longitude);

    Object.entries(contributions).forEach(([planetName, contribution]) => {
      totalScores[planetName] += contribution.points;
    });

    return `${point.label} em ${formatDegrees(point.longitude)} → ${formatAlmutenContributions(
      contributions,
    )}.`;
  });

  const houseBonuses: string[] = [];
  traditionalPlanets.forEach((planet) => {
    const houseIndex = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
    const housePoints = ALMUTEN_HOUSE_POINTS[houseIndex] ?? 0;
    totalScores[planet.name] += housePoints;
    houseBonuses.push(`${planet.name} (${formatSignedNumber(housePoints)})`);
  });

  const dayRuler = getDayRuler(chart);
  const planetaryHourRuler = getPlanetaryHourRuler(chart);
  totalScores[dayRuler] += 7;
  totalScores[planetaryHourRuler] += 6;

  const winner = TRADITIONAL_PLANET_NAMES.reduce((bestPlanet, planetName) => {
    if (totalScores[planetName] > totalScores[bestPlanet]) {
      return planetName;
    }

    return bestPlanet;
  }, TRADITIONAL_PLANET_NAMES[0]);

  return {
    pointLines,
    houseLine: `Bônus de casa no almuten — ${houseBonuses.join(", ")}.`,
    dayHourLine: `Regente do dia: ${dayRuler} (+7). Regente da hora planetária: ${planetaryHourRuler} (+6).`,
    scoreLine: `Pontuação final — ${TRADITIONAL_PLANET_NAMES.map((planetName) => {
      return `${planetName} (${totalScores[planetName]} pontos)`;
    }).join(", ")}.`,
    winnerLine: `Almuten Figuris: ${winner} (${totalScores[winner]} pontos).`,
  };
}

function initializeAlmutenScores(): Record<string, number> {
  return TRADITIONAL_PLANET_NAMES.reduce<Record<string, number>>((scores, planetName) => {
    scores[planetName] = 0;
    return scores;
  }, {});
}

function getAlmutenPointContributions(
  longitude: number,
): Record<string, AlmutenContribution> {
  const signIndex = getSignIndex(longitude);
  const degreeInSign = normalizeLongitude(longitude) % 30;
  const elementIndex = SIGN_ELEMENT[signIndex];
  const result = initializeAlmutenContributionMap();
  const triplicity = TRIPLICITY_RULERS[elementIndex];

  addAlmutenContribution(result, DOMICILE_RULER[signIndex], 5, "domicílio");

  const exaltationRuler = Object.entries(EXALTATION).find(
    ([, exaltedSign]) => exaltedSign === signIndex,
  )?.[0];
  if (exaltationRuler) {
    addAlmutenContribution(result, exaltationRuler, 4, "exaltação");
  }

  addAlmutenContribution(result, triplicity.day, 3, "triplicidade diurna");
  addAlmutenContribution(result, triplicity.night, 3, "triplicidade noturna");
  addAlmutenContribution(
    result,
    PARTICIPATING_TRIPLICITY_RULERS[elementIndex],
    3,
    "triplicidade participante",
  );

  const term = EGYPTIAN_TERMS[signIndex].find(
    (entry) => degreeInSign < entry.endDeg,
  )?.ruler;
  if (term) {
    addAlmutenContribution(result, term, 2, "termo");
  }

  const face = FACES[signIndex][Math.floor(degreeInSign / 10)];
  addAlmutenContribution(result, face, 1, "face");

  return result;
}

function initializeAlmutenContributionMap(): Record<string, AlmutenContribution> {
  return TRADITIONAL_PLANET_NAMES.reduce<Record<string, AlmutenContribution>>(
    (accumulator, planetName) => {
      accumulator[planetName] = {
        points: 0,
        reasons: [],
      };
      return accumulator;
    },
    {},
  );
}

function addAlmutenContribution(
  scores: Record<string, AlmutenContribution>,
  planetName: string,
  points: number,
  reason: string,
): void {
  if (!scores[planetName]) {
    scores[planetName] = { points: 0, reasons: [] };
  }

  scores[planetName].points += points;
  scores[planetName].reasons.push(reason);
}

function formatAlmutenContributions(
  contributions: Record<string, AlmutenContribution>,
): string {
  return Object.entries(contributions)
    .filter(([, contribution]) => contribution.points > 0)
    .sort((firstEntry, secondEntry) => {
      const [, firstContribution] = firstEntry;
      const [, secondContribution] = secondEntry;
      if (secondContribution.points !== firstContribution.points) {
        return secondContribution.points - firstContribution.points;
      }

      return firstEntry[0].localeCompare(secondEntry[0]);
    })
    .map(([planetName, contribution]) => {
      return `${planetName} (${formatSignedNumber(contribution.points)}: ${contribution.reasons.join(", ")})`;
    })
    .join("; ");
}

function getDayRuler(chart: BirthChart): string {
  return WEEKDAY_RULERS[getLocalBirthMoment(chart).day()] ?? "Sol";
}

function getPlanetaryHourRuler(chart: BirthChart): string {
  const localBirthMoment = getLocalBirthMoment(chart);
  const latitude = Number(chart.birthDate.coordinates.latitude);
  const longitude = Number(chart.birthDate.coordinates.longitude);
  const startOfToday = localBirthMoment.clone().startOf("day");
  const sunriseToday = calculateSunEvent(startOfToday, latitude, longitude, true);
  const sunsetToday = calculateSunEvent(startOfToday, latitude, longitude, false);

  if (!sunriseToday || !sunsetToday) {
    return getDayRuler(chart);
  }

  if (
    localBirthMoment.isSameOrAfter(sunriseToday) &&
    localBirthMoment.isBefore(sunsetToday)
  ) {
    const hourLengthMinutes = sunsetToday.diff(sunriseToday, "minutes", true) / 12;
    const hourIndex = Math.min(
      11,
      Math.max(
        0,
        Math.floor(localBirthMoment.diff(sunriseToday, "minutes", true) / hourLengthMinutes),
      ),
    );
    return getPlanetaryHourFromIndex(getDayRuler(chart), hourIndex);
  }

  if (localBirthMoment.isBefore(sunriseToday)) {
    const startOfPreviousDay = startOfToday.clone().subtract(1, "day");
    const previousSunrise = calculateSunEvent(
      startOfPreviousDay,
      latitude,
      longitude,
      true,
    );
    const previousSunset = calculateSunEvent(
      startOfPreviousDay,
      latitude,
      longitude,
      false,
    );

    if (!previousSunrise || !previousSunset) {
      return getDayRuler(chart);
    }

    const nightLengthMinutes = sunriseToday.diff(previousSunset, "minutes", true) / 12;
    const hourIndex = 12 + Math.min(
      11,
      Math.max(
        0,
        Math.floor(localBirthMoment.diff(previousSunset, "minutes", true) / nightLengthMinutes),
      ),
    );
    const previousDayRuler = WEEKDAY_RULERS[startOfPreviousDay.day()] ?? "Sol";
    return getPlanetaryHourFromIndex(previousDayRuler, hourIndex);
  }

  const startOfNextDay = startOfToday.clone().add(1, "day");
  const nextSunrise = calculateSunEvent(startOfNextDay, latitude, longitude, true);
  if (!nextSunrise) {
    return getDayRuler(chart);
  }

  const nightLengthMinutes = nextSunrise.diff(sunsetToday, "minutes", true) / 12;
  const hourIndex = 12 + Math.min(
    11,
    Math.max(
      0,
      Math.floor(localBirthMoment.diff(sunsetToday, "minutes", true) / nightLengthMinutes),
    ),
  );
  return getPlanetaryHourFromIndex(getDayRuler(chart), hourIndex);
}

function getPlanetaryHourFromIndex(dayRuler: string, hourIndex: number): string {
  const startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
  if (startIndex < 0) {
    return dayRuler;
  }

  return CHALDEAN_ORDER[(startIndex + hourIndex) % CHALDEAN_ORDER.length];
}

function calculateSunEvent(
  dateMoment: moment.Moment,
  latitude: number,
  longitude: number,
  isSunrise: boolean,
): moment.Moment | null {
  const dayOfYear = dateMoment.dayOfYear();
  const longitudeHour = longitude / 15;
  const approximateTime =
    dayOfYear + ((isSunrise ? 6 : 18) - longitudeHour) / 24;
  const meanAnomaly = (0.9856 * approximateTime) - 3.289;
  let trueLongitude =
    meanAnomaly +
    (1.916 * Math.sin(degToRad(meanAnomaly))) +
    (0.02 * Math.sin(degToRad(2 * meanAnomaly))) +
    282.634;
  trueLongitude = normalizeLongitude(trueLongitude);

  let rightAscension = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(trueLongitude))));
  rightAscension = normalizeLongitude(rightAscension);

  const trueLongitudeQuadrant = Math.floor(trueLongitude / 90) * 90;
  const rightAscensionQuadrant = Math.floor(rightAscension / 90) * 90;
  rightAscension += trueLongitudeQuadrant - rightAscensionQuadrant;
  rightAscension /= 15;

  const sinDeclination = 0.39782 * Math.sin(degToRad(trueLongitude));
  const cosDeclination = Math.cos(Math.asin(sinDeclination));
  const cosLocalHour =
    (Math.cos(degToRad(90.833)) -
      (sinDeclination * Math.sin(degToRad(latitude)))) /
    (cosDeclination * Math.cos(degToRad(latitude)));

  if (cosLocalHour < -1 || cosLocalHour > 1) {
    return null;
  }

  let localHour = isSunrise
    ? 360 - radToDeg(Math.acos(cosLocalHour))
    : radToDeg(Math.acos(cosLocalHour));
  localHour /= 15;

  const localMeanTime =
    localHour + rightAscension - (0.06571 * approximateTime) - 6.622;
  let universalTime = localMeanTime - longitudeHour;
  universalTime = ((universalTime % 24) + 24) % 24;

  const localTimeHours = universalTime + (dateMoment.utcOffset() / 60);
  const normalizedLocalHours = ((localTimeHours % 24) + 24) % 24;

  return dateMoment.clone().startOf("day").add(normalizedLocalHours, "hours");
}

function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

function getLocalBirthMoment(chart: BirthChart): moment.Moment {
  const { year, month, day, time, coordinates } = chart.birthDate;
  const zone = resolveTimezone(coordinates);
  const { hour, minute } = parseBirthTime(time);

  return moment.tz(
    `${year}-${month}-${day} ${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`,
    "YYYY-M-D HH:mm",
    zone,
  );
}

function parseBirthTime(time: string): { hour: number; minute: number } {
  if (typeof time === "string" && time.includes(":")) {
    const [hour, minute] = time.split(":").map((value) => Number(value) || 0);
    return { hour, minute };
  }

  const decimalTime = Number(time) || 12;
  let hour = Math.floor(decimalTime);
  let minute = Math.round((decimalTime - hour) * 60);

  if (minute === 60) {
    hour += 1;
    minute = 0;
  }

  return { hour, minute };
}

async function calculatePrenatalSyzygy(chart: BirthChart): Promise<PrenatalSyzygy> {
  try {
    const sw = await getSwe();
    const birthJulianDay = getBirthJulianDay(chart, sw);
    const sun = chart.planets.find((planet) => planet.type === "sun")!;
    const moon = chart.planets.find((planet) => planet.type === "moon")!;
    const phaseAngle = normalizeLongitude(moon.longitudeRaw - sun.longitudeRaw);
    const targetAngle = phaseAngle < 180 ? 0 : 180;
    let upperJulianDay = birthJulianDay;
    let upperDifference = getPhaseDifference(sw, upperJulianDay, targetAngle);
    let lowerJulianDay = upperJulianDay - SYZYGY_SEARCH_STEP_DAYS;
    let lowerDifference = getPhaseDifference(sw, lowerJulianDay, targetAngle);
    let foundBracket = lowerDifference <= 0 && upperDifference >= 0;

    for (
      let step = 0;
      !foundBracket && step < SYZYGY_MAX_LOOKBACK_STEPS;
      step += 1
    ) {
      upperJulianDay = lowerJulianDay;
      upperDifference = lowerDifference;
      lowerJulianDay -= SYZYGY_SEARCH_STEP_DAYS;
      lowerDifference = getPhaseDifference(sw, lowerJulianDay, targetAngle);
      foundBracket = lowerDifference <= 0 && upperDifference >= 0;
    }

    if (!foundBracket) {
      return getApproximatePrenatalSyzygy(chart);
    }

    for (let iteration = 0; iteration < 40; iteration += 1) {
      const middleJulianDay = (lowerJulianDay + upperJulianDay) / 2;
      const middleDifference = getPhaseDifference(sw, middleJulianDay, targetAngle);

      if (middleDifference <= 0) {
        lowerJulianDay = middleJulianDay;
      } else {
        upperJulianDay = middleJulianDay;
      }
    }

    const exactJulianDay = (lowerJulianDay + upperJulianDay) / 2;
    const sunLongitude = calculateLongitudeAtJulianDay(sw, exactJulianDay, 0);
    const moonLongitude = calculateLongitudeAtJulianDay(sw, exactJulianDay, 1);

    return {
      type: targetAngle === 0 ? "Lua Nova" : "Lua Cheia",
      longitude:
        targetAngle === 0
          ? normalizeLongitude((sunLongitude + moonLongitude) / 2)
          : moonLongitude,
      sunLongitude,
      moonLongitude,
    };
  } catch {
    return getApproximatePrenatalSyzygy(chart);
  }
}

function getApproximatePrenatalSyzygy(chart: BirthChart): PrenatalSyzygy {
  const sun = chart.planets.find((planet) => planet.type === "sun")!;
  const moon = chart.planets.find((planet) => planet.type === "moon")!;
  const phaseAngle = normalizeLongitude(moon.longitudeRaw - sun.longitudeRaw);
  const targetAngle = phaseAngle < 180 ? 0 : 180;
  const relativeSpeed = Math.max(
    0.1,
    Math.abs((moon.longitudeSpeed || 13) - (sun.longitudeSpeed || 1)),
  );
  const degreesSinceSyzygy = targetAngle === 0 ? phaseAngle : phaseAngle - 180;
  const daysSinceSyzygy = Math.max(0, degreesSinceSyzygy / relativeSpeed);
  const sunLongitude = normalizeLongitude(
    sun.longitudeRaw - (sun.longitudeSpeed || 1) * daysSinceSyzygy,
  );
  const moonLongitude = normalizeLongitude(
    moon.longitudeRaw - (moon.longitudeSpeed || 13) * daysSinceSyzygy,
  );

  return {
    type: targetAngle === 0 ? "Lua Nova" : "Lua Cheia",
    longitude:
      targetAngle === 0
        ? normalizeLongitude((sunLongitude + moonLongitude) / 2)
        : moonLongitude,
    sunLongitude,
    moonLongitude,
  };
}

function getBirthJulianDay(
  chart: BirthChart,
  sw: {
    julianDay: (
      year: number,
      month: number,
      day: number,
      hour: number,
      gregorianFlag: number,
    ) => number;
  },
): number {
  const utcMoment = getLocalBirthMoment(chart).clone().utc();
  const hour =
    utcMoment.hour() +
    utcMoment.minute() / 60 +
    utcMoment.second() / 3600 +
    utcMoment.millisecond() / 3600000;

  return sw.julianDay(
    utcMoment.year(),
    utcMoment.month() + 1,
    utcMoment.date(),
    hour,
    1,
  );
}

function getPhaseDifference(
  sw: any,
  julianDay: number,
  targetAngle: number,
): number {
  const sunLongitude = calculateLongitudeAtJulianDay(sw, julianDay, 0);
  const moonLongitude = calculateLongitudeAtJulianDay(sw, julianDay, 1);
  const phaseAngle = normalizeLongitude(moonLongitude - sunLongitude);
  return wrapAngleToSignedRange(phaseAngle - targetAngle);
}

function calculateLongitudeAtJulianDay(
  sw: any,
  julianDay: number,
  bodyId: number,
): number {
  const moduleRef = sw.module;
  const xxPtr = moduleRef._malloc(6 * 8);
  const errorPtr = moduleRef._malloc(256);

  try {
    const returnFlag = moduleRef.ccall(
      "swe_calc_ut_wrap",
      "number",
      ["number", "number", "number", "number", "number"],
      [julianDay, bodyId, SOLAR_PROXIMITY_FLAG, xxPtr, errorPtr],
    );

    if (returnFlag < 0) {
      throw new Error(moduleRef.UTF8ToString(errorPtr));
    }

    return normalizeLongitude(moduleRef.getValue(xxPtr, "double"));
  } finally {
    moduleRef._free(xxPtr);
    moduleRef._free(errorPtr);
  }
}

function wrapAngleToSignedRange(angle: number): number {
  return ((angle + 180) % 360 + 360) % 360 - 180;
}

function formatContribution(contribution: SignedContribution): string {
  return `${contribution.label} (${formatSignedNumber(contribution.points)})`;
}

function formatSignedNumber(points: number): string {
  return `${points >= 0 ? "+" : ""}${points}`;
}

function formatPointsTotal(points: number): string {
  const label = Math.abs(points) === 1 ? "ponto" : "pontos";
  return `${formatSignedNumber(points)} ${label}`;
}

function getEssentialClassification(points: number, planetName: string): string {
  if (points >= 8) {
    return inflectByPlanet(planetName, "Muito Digno", "Muito Digna");
  }

  if (points >= 5) {
    return inflectByPlanet(planetName, "Digno", "Digna");
  }

  if (points >= 1) {
    return inflectByPlanet(planetName, "Levemente Digno", "Levemente Digna");
  }

  if (points === 0) {
    return "Peregrino";
  }

  if (points <= -8) {
    return inflectByPlanet(
      planetName,
      "Fortemente Debilitado",
      "Fortemente Debilitada",
    );
  }

  return inflectByPlanet(planetName, "Debilitado", "Debilitada");
}

function getAccidentalClassification(points: number, planetName: string): string {
  if (points >= 12) {
    return inflectByPlanet(planetName, "Muito Digno", "Muito Digna");
  }

  if (points >= 9) {
    return inflectByPlanet(planetName, "Digno", "Digna");
  }

  if (points >= 7) {
    return inflectByPlanet(
      planetName,
      "Moderadamente Dignificado",
      "Moderadamente Dignificada",
    );
  }

  if (points >= 4) {
    return inflectByPlanet(
      planetName,
      "Levemente Dignificado",
      "Levemente Dignificada",
    );
  }

  if (points >= -4) {
    return "Debilitado por Casa";
  }

  if (points <= -7) {
    return inflectByPlanet(
      planetName,
      "Severamente Debilitado",
      "Severamente Debilitada",
    );
  }

  return inflectByPlanet(planetName, "Debilitado", "Debilitada");
}

function inflectByPlanet(
  planetName: string,
  masculine: string,
  feminine: string,
): string {
  return FEMININE_PLANETS.has(planetName) ? feminine : masculine;
}

function romanize(num: number): string {
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";

  for (const [symbol, value] of Object.entries(lookup)) {
    while (num >= value) {
      roman += symbol;
      num -= value;
    }
  }

  return roman;
}
