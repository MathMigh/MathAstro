import { BirthChart, Planet } from "@/interfaces/BirthChartInterfaces";
import {
  formatDegrees,
  getAlmuten,
  getAspects,
  getEssentialDignities,
  getHouseIndex,
  getSect,
} from "./traditionalCalculations";
import {
  calculateArabicLots,
  fromTotal,
  ORDERED_ARABIC_PART_KEYS,
} from "./arabicLots";
import { AVERAGE_DAILY_SPEED, DOMICILE_RULER, SIGNS } from "./traditionalTables";
import { calculateTemperament } from "./traditionalTemperament";
import {
  buildFixedStarReportLine,
  calculateFixedStarMatches,
} from "./fixedStars";
import { getAbsoluteAngularDistance } from "./aspectDynamics";

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
const RETROGRADE_SPEED_EPSILON = 1e-6;
const CAZIMI_ORB_DEGREES = 17 / 60;
const COMBUSTION_ORB_DEGREES = 8.5;
const SUN_BEAMS_ORB_DEGREES = 17;
const ARABIC_PARTS_WITH_DO_ARTICLE = new Set([
  "Esp\u00edrito",
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

export function generateTraditionalReport(chart: BirthChart): string {
  const sect = getSect(
    chart.planets.find((p) => p.type === "sun")!.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house,
  );

  const planets = chart.planets;
  const sun = planets.find((p) => p.type === "sun")!;
  const moon = planets.find((p) => p.type === "moon")!;
  const merc = planets.find((p) => p.type === "mercury")!;
  const ven = planets.find((p) => p.type === "venus")!;
  const mars = planets.find((p) => p.type === "mars")!;
  const jup = planets.find((p) => p.type === "jupiter")!;
  const sat = planets.find((p) => p.type === "saturn")!;

  const asc = chart.housesData.ascendant;
  const mc = chart.housesData.mc;
  const desc = (asc + 180) % 360;
  const ic = (mc + 180) % 360;
  const temperament = calculateTemperament(chart);

  let report = "MAPA TRADICIONAL OCIDENTAL:\n\n";
  report += `Ascendente em ${formatDegrees(asc)} (Lento).\n`;
  report += `Descendente em ${formatDegrees(desc)} (Lento).\n`;
  report += `Meio do Ceu (MC) em ${formatDegrees(mc)} (Lento).\n`;
  report += `Fundo do Ceu (IC) em ${formatDegrees(ic)} (Lento).\n\n`;

  const orderedPlanets = [
    sun,
    moon,
    merc,
    ven,
    mars,
    jup,
    sat,
    ...planets.filter((p) => OUTER_PLANET_TYPES.has(p.type)),
    ...planets.filter((p) => NODE_TYPES.has(p.type)),
  ];

  orderedPlanets.forEach((planet) => {
    report += `${formatPlanetReportLine(planet, chart, sun)}\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += `Secto: ${sect}.\n`;
  report += "--------------------------------------------------------------------\n";
  report += `Temperamento: ${temperament.summary}.\n`;
  report += "--------------------------------------------------------------------\n";
  report += "Mentalidade: (Desejado...)\n";
  report += "--------------------------------------------------------------------\n";

  report += "CUSPIDES DAS CASAS:\n\n";
  chart.housesData.house.forEach((cuspLon, idx) => {
    const hNum = idx + 1;
    const almuten = getAlmuten(cuspLon, sect);
    const antiscionLon = (540 - cuspLon) % 360;
    report += `Casa ${hNum} em ${formatDegrees(cuspLon)}, almuten ${almuten}. (antiscion: ${formatDegrees(antiscionLon)}).\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += "PARTES ARABES:\n\n";
  const parts = buildTraditionalReportArabicParts(chart);
  parts.forEach((part) => {
    report += `Parte ${getArabicPartArticle(part.name)} ${part.name} em ${part.posFormatted} na ${part.house}. (Dispositor: ${part.dispositor}). Antiscion: ${part.antiscion}.\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += "ANTISCIOS:\n\n";
  planets
    .concat(parts.map((part) => ({ name: part.name, longitudeRaw: part.longitude } as Planet)))
    .forEach((point) => {
      const antLon = (540 - point.longitudeRaw) % 360;
      const contraStr = formatDegrees((antLon + 180) % 360);
      report += `${point.name} - antiscion: ${formatDegrees(antLon)} | contrantiscion: ${contraStr}.\n`;
    });

  report += "--------------------------------------------------------------------\n";
  report += "ESTRELAS FIXAS:\n\n";
  const fixedStarMatches =
    chart.fixedStarMatches ?? calculateFixedStarMatches(chart);

  if (fixedStarMatches.length === 0) {
    report += "Nenhuma estrela fixa associada dentro da orbe de 2\u00b0.\n";
  } else {
    const groupedMatches = fixedStarMatches.reduce<Record<string, typeof fixedStarMatches>>(
      (accumulator, match) => {
        if (!accumulator[match.pointName]) {
          accumulator[match.pointName] = [];
        }

        accumulator[match.pointName].push(match);
        return accumulator;
      },
      {}
    );

    Object.entries(groupedMatches).forEach(([pointName, matches]) => {
      const pointLongitude = matches[0]?.pointLongitude ?? 0;
      report += `${pointName} em ${formatDegrees(pointLongitude)}: ${matches
        .map((match) => buildFixedStarReportLine(match))
        .join("; ")};\n`;
    });
  }

  report += "--------------------------------------------------------------------\n";
  report += "ASPECTOS TRADICIONAIS:\n\n";
  const aspectList = getAspects(chart);
  aspectList.forEach((aspect) => {
    report += `${aspect}\n`;
  });

  report += "-------------------------------------------------------------------\n";
  report += "DIGNIDADES E DEBILIDADES ESSENCIAIS:\n\n";
  [sun, moon, merc, ven, mars, jup, sat].forEach((planet) => {
    report += `${getEssentialDignities(planet.longitudeRaw, planet.name, sect)}\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += "DISPOSITORES:\n\n";
  [sun, moon, merc, ven, mars, jup, sat].forEach((planet) => {
    const currentSignIdx = Math.floor(planet.longitudeRaw / 30) % 12;
    const ruler = DOMICILE_RULER[currentSignIdx];
    report += `${planet.name} em ${SIGNS[currentSignIdx]} -> Dispositor: ${ruler}.\n`;
  });

  report += "--------------------------------------------------------------------\n";

  return report;
}

function buildTraditionalReportArabicParts(
  chart: BirthChart,
): TraditionalReportArabicPart[] {
  const lots = calculateArabicLots(chart);

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
  const hIdx = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
  const { sign, degrees } = formatSignAndDegrees(planet.longitudeRaw);
  const solarCondition = getSolarConditionDescription(planet, sun);
  const motion = getPlanetMotionDescription(planet);
  const note = getTraditionalPlanetNote(planet);
  const baseLine = `${planet.name} em ${sign}, a ${degrees}, na Casa ${romanize(hIdx)}`;

  if (solarCondition) {
    return `${baseLine} (${solarCondition}), (${motion})${note}.`;
  }

  return `${baseLine} (${motion})${note}.`;
}

function formatSignAndDegrees(longitude: number): { sign: string; degrees: string } {
  const totalMinutes = ((Math.round(longitude * 60) % 21600) + 21600) % 21600;
  const signIdx = Math.floor(totalMinutes / 1800) % 12;
  const remaining = totalMinutes - signIdx * 1800;
  const degree = Math.floor(remaining / 60);
  const minute = remaining % 60;

  return {
    sign: SIGNS[signIdx],
    degrees: `${degree}\u00b0${minute.toString().padStart(2, "0")}\u2019`,
  };
}

function getPlanetMotionDescription(planet: Planet): string {
  if (planet.isRetrograde) {
    return "Movimento Retr\u00f3grado";
  }

  const averageSpeed = AVERAGE_DAILY_SPEED[planet.name];
  if (
    averageSpeed &&
    Number.isFinite(planet.longitudeSpeed) &&
    planet.longitudeSpeed >= -RETROGRADE_SPEED_EPSILON &&
    Math.abs(planet.longitudeSpeed) >= averageSpeed * 0.85
  ) {
    return "Movimento Direto - R\u00e1pido";
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
  const formattedSolarDistance = formatAngularDistance(solarDistance);
  const sameSign = getSignIndex(planet.longitudeRaw) === getSignIndex(sun.longitudeRaw);

  if (solarDistance <= CAZIMI_ORB_DEGREES) {
    return `Cazimi: a ${formattedSolarDistance} do Sol, no cora\u00e7\u00e3o do Sol`;
  }

  if (solarDistance <= COMBUSTION_ORB_DEGREES) {
    if (sameSign) {
      return `Combusto: a ${formattedSolarDistance} do Sol, no mesmo signo`;
    }

    return `Afli\u00e7\u00e3o por proximidade: a ${formattedSolarDistance} do Sol em signo diferente, portanto n\u00e3o combusto; tamb\u00e9m n\u00e3o est\u00e1 sob os raios, que exigem a faixa de 8\u00b030\u2019 a 17\u00b0`;
  }

  if (solarDistance <= SUN_BEAMS_ORB_DEGREES) {
    return `Afli\u00e7\u00e3o: sob os raios do Sol, a ${formattedSolarDistance}`;
  }

  return null;
}

function getTraditionalPlanetNote(planet: Planet): string {
  if (OUTER_PLANET_TYPES.has(planet.type)) {
    return " (S\u00f3 considerado como Estrela Fixa na Astrologia Tradicional, e seu valor s\u00f3 importa enquanto conjun\u00e7\u00e3o ou oposi\u00e7\u00e3o)";
  }

  if (NODE_TYPES.has(planet.type)) {
    return " (Na Astrologia Tradicional seu valor s\u00f3 importa enquanto conjun\u00e7\u00e3o ou oposi\u00e7\u00e3o)";
  }

  return "";
}

function getSignIndex(longitude: number): number {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  return Math.floor(normalizedLongitude / 30) % 12;
}

function formatAngularDistance(distance: number): string {
  const totalMinutes = Math.round(distance * 60);
  const degrees = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${degrees}\u00b0${minutes.toString().padStart(2, "0")}\u2019`;
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
