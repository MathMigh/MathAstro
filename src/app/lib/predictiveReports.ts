import { AspectType } from "@/interfaces/AstroChartInterfaces";
import {
  BirthChart,
  BirthDate,
  Planet,
  PlanetType,
  ReturnChartType,
} from "@/interfaces/BirthChartInterfaces";
import {
  DETRIMENT,
  DOMICILE_RULER,
  EGYPTIAN_TERMS,
  EXALTATION,
  FACES,
  FALL,
  HOUSE_TYPE,
  SIGN_ELEMENT,
  SIGNS,
  TRIPLICITY_RULERS,
} from "./traditionalTables";
import {
  resolveTraditionalAspect,
  TraditionalAspectParticipant,
} from "./aspectDynamics";
import {
  calculateArabicLots,
  DEFAULT_ARABIC_PARTS_MODE,
} from "./arabicLots";

interface ReturnReportOptions {
  natalChart: BirthChart;
  returnChart: BirthChart;
  returnType: ReturnChartType;
  targetDate: BirthDate;
  returnTime: string;
}

const SEPARATOR = "--------------------------------------------------------------------";
const TRADITIONAL_TYPES: PlanetType[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
];

const TABLE_PLANET_NAME: Record<PlanetType, string> = {
  sun: "Sol",
  moon: "Lua",
  mercury: "Merc\u00fario",
  venus: "V\u00eanus",
  mars: "Marte",
  jupiter: "J\u00fapiter",
  saturn: "Saturno",
  uranus: "Urano",
  neptune: "Netuno",
  pluto: "Plut\u00e3o",
  northNode: "Nodo Norte",
  southNode: "Nodo Sul",
};

const RULER_BY_SIGN: PlanetType[] = [
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

const ASPECT_LABELS: Record<AspectType, string> = {
  conjunction: "conjuncao",
  sextile: "sextil",
  square: "quadratura",
  trine: "trigono",
  opposition: "oposicao",
};

function normalizeLongitude(longitude: number) {
  return ((longitude % 360) + 360) % 360;
}

function getSignIndex(longitude: number) {
  return Math.floor(normalizeLongitude(longitude) / 30) % 12;
}

function getDegreeInSign(longitude: number) {
  return normalizeLongitude(longitude) % 30;
}

function formatLongitude(longitude: number) {
  const totalMinutes = Math.round(normalizeLongitude(longitude) * 60) % 21600;
  const signIndex = Math.floor(totalMinutes / 1800) % 12;
  const degree = Math.floor((totalMinutes - signIndex * 1800) / 60);
  const minute = totalMinutes % 60;
  return `${SIGNS[signIndex]} ${degree}\u00b0${minute
    .toString()
    .padStart(2, "0")}'`;
}

function formatDate(date?: BirthDate) {
  if (!date) return "data nao informada";

  return `${date.day.toString().padStart(2, "0")}/${date.month
    .toString()
    .padStart(2, "0")}/${date.year}${date.time ? ` ${date.time}` : ""}`;
}

function getHouseIndex(longitude: number, cusps: number[]) {
  const point = normalizeLongitude(longitude);

  for (let index = 0; index < cusps.length; index += 1) {
    const start = normalizeLongitude(cusps[index]);
    const end = normalizeLongitude(cusps[(index + 1) % cusps.length]);
    const isInside =
      start <= end
        ? point >= start && point < end
        : point >= start || point < end;

    if (isInside) return index + 1;
  }

  return 12;
}

function getPlanet(chart: BirthChart, type: PlanetType) {
  const planet = chart.planets.find((item) => item.type === type);

  if (!planet) {
    throw new Error(`Planeta ausente no mapa: ${type}.`);
  }

  return planet;
}

function getTraditionalPlanets(chart: BirthChart) {
  return TRADITIONAL_TYPES.map((type) => getPlanet(chart, type));
}

function getRulerType(longitude: number) {
  return RULER_BY_SIGN[getSignIndex(longitude)];
}

function getSect(chart: BirthChart): "Diurno" | "Noturno" {
  const sun = getPlanet(chart, "sun");
  const sunHouse = getHouseIndex(sun.longitudeRaw, chart.housesData.house);
  return sunHouse >= 7 && sunHouse <= 12 ? "Diurno" : "Noturno";
}

function getDignitySummary(planet: Planet, chart: BirthChart) {
  const planetName = TABLE_PLANET_NAME[planet.type];
  const sect = getSect(chart);
  const signIndex = getSignIndex(planet.longitudeRaw);
  const degree = getDegreeInSign(planet.longitudeRaw);
  const element = SIGN_ELEMENT[signIndex];
  const domicile = DOMICILE_RULER[signIndex];
  const exaltation = Object.entries(EXALTATION).find(
    ([, exaltationSign]) => exaltationSign === signIndex
  )?.[0];
  const triplicity =
    sect === "Diurno"
      ? TRIPLICITY_RULERS[element].day
      : TRIPLICITY_RULERS[element].night;
  const term = EGYPTIAN_TERMS[signIndex].find(
    (item) => degree < item.endDeg
  )?.ruler;
  const face = FACES[signIndex][Math.floor(degree / 10)];
  const strengths: string[] = [];
  const debilities: string[] = [];

  if (planetName === domicile) strengths.push("domicilio");
  if (planetName === exaltation) strengths.push("exaltacao");
  if (planetName === triplicity) strengths.push("triplicidade");
  if (planetName === term) strengths.push("termo");
  if (planetName === face) strengths.push("face");
  if (DETRIMENT[planetName]?.includes(signIndex)) debilities.push("exilio");
  if (FALL[planetName] === signIndex) debilities.push("queda");

  const strengthLabel =
    strengths.length > 0 ? strengths.join(", ") : "peregrino";
  const debilityLabel =
    debilities.length > 0 ? `; debilidade: ${debilities.join(", ")}` : "";

  return `${strengthLabel}${debilityLabel}`;
}

function getPlanetCondition(planet: Planet, chart: BirthChart) {
  const house = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
  const houseType = HOUSE_TYPE[house - 1] ?? "casa";
  const motion = planet.isRetrograde ? "retrogrado" : "direto";

  return `${TABLE_PLANET_NAME[planet.type]} em ${formatLongitude(
    planet.longitudeRaw
  )}, casa ${house} (${houseType}), ${motion}; dignidade: ${getDignitySummary(
    planet,
    chart
  )}.`;
}

function getPlanetsInHouse(chart: BirthChart, house: number) {
  return getTraditionalPlanets(chart).filter(
    (planet) => getHouseIndex(planet.longitudeRaw, chart.housesData.house) === house
  );
}

function formatPlanetList(planets: Planet[]) {
  if (planets.length === 0) return "nenhum planeta tradicional";
  return planets.map((planet) => TABLE_PLANET_NAME[planet.type]).join(", ");
}

function formatOrb(orb: number) {
  const degree = Math.floor(orb);
  const minute = Math.round((orb - degree) * 60);
  return `${degree}\u00b0${minute.toString().padStart(2, "0")}'`;
}

function makePlanetParticipant(
  planet: Planet,
  contextLabel: string,
  freezeMotion = false
): TraditionalAspectParticipant & { name: string; contextLabel: string } {
  return {
    name: TABLE_PLANET_NAME[planet.type],
    contextLabel,
    longitude: planet.longitudeRaw,
    speed: freezeMotion ? 0 : planet.longitudeSpeed,
    elementType: "planet",
    planetType: planet.type,
  };
}

function makeAngleParticipant(
  name: string,
  longitude: number,
  contextLabel: string
): TraditionalAspectParticipant & { name: string; contextLabel: string } {
  return {
    name,
    contextLabel,
    longitude,
    speed: 0,
    elementType: "house",
  };
}

function collectCrossAspects(
  movingChart: BirthChart,
  radixChart: BirthChart,
  movingLabel: string,
  radixLabel: string,
  limit = 12
) {
  const movingParticipants = getTraditionalPlanets(movingChart).map((planet) =>
    makePlanetParticipant(planet, movingLabel)
  );
  const radixParticipants = [
    ...getTraditionalPlanets(radixChart).map((planet) =>
      makePlanetParticipant(planet, radixLabel, true)
    ),
    makeAngleParticipant("ASC", radixChart.housesData.ascendant, radixLabel),
    makeAngleParticipant("MC", radixChart.housesData.mc, radixLabel),
  ];
  const lines: { text: string; orb: number }[] = [];

  movingParticipants.forEach((movingParticipant) => {
    radixParticipants.forEach((radixParticipant) => {
      const aspect = resolveTraditionalAspect(
        movingParticipant,
        radixParticipant
      );

      if (!aspect) return;

      lines.push({
        orb: aspect.orbDistance,
        text: `${movingParticipant.name} (${movingParticipant.contextLabel}) ${
          ASPECT_LABELS[aspect.aspectType]
        } ${radixParticipant.name} (${radixParticipant.contextLabel}), orbe ${formatOrb(
          aspect.orbDistance
        )}, ${aspect.applying ? "aplicativo" : "separativo"}.`,
      });
    });
  });

  return lines
    .sort((first, second) => first.orb - second.orb)
    .slice(0, limit)
    .map((item) => item.text);
}

function getMoonPhaseLabel(sunLongitude: number, moonLongitude: number) {
  const distance = normalizeLongitude(moonLongitude - sunLongitude);

  if (distance < 45) return "Lua Nova / crescimento inicial";
  if (distance < 90) return "crescente";
  if (distance < 135) return "proxima ao quarto crescente";
  if (distance < 180) return "gibosa crescente";
  if (distance < 225) return "Lua Cheia / culminacao";
  if (distance < 270) return "disseminante";
  if (distance < 315) return "minguante";
  return "balsamica";
}

function buildArabicLotsLines(chart: BirthChart) {
  const lots = calculateArabicLots(chart, DEFAULT_ARABIC_PARTS_MODE);
  const fortuneHouse = lots.fortune
    ? getHouseIndex(lots.fortune.longitude, chart.housesData.house)
    : undefined;
  const spiritHouse = lots.spirit
    ? getHouseIndex(lots.spirit.longitude, chart.housesData.house)
    : undefined;

  return [
    lots.fortune
      ? `Fortuna em ${formatLongitude(lots.fortune.longitude)}, casa ${fortuneHouse}; mostra corpo, materia e circunstancias de suporte.`
      : undefined,
    lots.spirit
      ? `Espirito em ${formatLongitude(lots.spirit.longitude)}, casa ${spiritHouse}; mostra intencao, escolha e direcao voluntaria.`
      : undefined,
  ].filter(Boolean) as string[];
}

function getAnnualProfectionData(natalChart: BirthChart, years: number) {
  const activatedHouse = (years % 12) + 1;
  const profectedAscendant = normalizeLongitude(
    natalChart.housesData.ascendant + years * 30
  );
  const activatedSignIndex = getSignIndex(profectedAscendant);
  const annualLordType = getRulerType(profectedAscendant);
  const annualLordNatal = getPlanet(natalChart, annualLordType);

  return {
    activatedHouse,
    profectedAscendant,
    activatedSignIndex,
    annualLordType,
    annualLordNatal,
  };
}

export function generateTraditionalReturnReport({
  natalChart,
  returnChart,
  returnType,
  targetDate,
  returnTime,
}: ReturnReportOptions) {
  const isSolar = returnType === "solar";
  const report: string[] = [];
  const returnAscRuler = getPlanet(
    returnChart,
    getRulerType(returnChart.housesData.ascendant)
  );
  const returnMcRuler = getPlanet(
    returnChart,
    getRulerType(returnChart.housesData.mc)
  );
  const returnSun = getPlanet(returnChart, "sun");
  const returnMoon = getPlanet(returnChart, "moon");
  const natalSun = getPlanet(natalChart, "sun");
  const natalMoon = getPlanet(natalChart, "moon");
  const ascInNatalHouse = getHouseIndex(
    returnChart.housesData.ascendant,
    natalChart.housesData.house
  );
  const mcInNatalHouse = getHouseIndex(
    returnChart.housesData.mc,
    natalChart.housesData.house
  );
  const years = Math.max(0, targetDate.year - natalChart.birthDate.year);
  const profection = getAnnualProfectionData(natalChart, years);
  const annualLordReturn = getPlanet(returnChart, profection.annualLordType);
  const crossAspects = collectCrossAspects(
    returnChart,
    natalChart,
    isSolar ? "revolucao solar" : "revolucao lunar",
    "natal"
  );

  report.push(
    isSolar
      ? "RELATORIO DE REVOLUCAO SOLAR TRADICIONAL"
      : "RELATORIO DE REVOLUCAO LUNAR TRADICIONAL",
    "",
    `Mapa-base: ${formatDate(natalChart.birthDate)}.`,
    `Retorno calculado: ${returnTime}.`,
    isSolar
      ? `Ano solar consultado: ${targetDate.year}/${targetDate.year + 1}.`
      : `Mes lunar consultado a partir de ${formatDate(targetDate)}.`,
    "Este relatorio julga o retorno como figura temporal derivada do natal; nao substitui o mapa radical.",
    "",
    SEPARATOR,
    "EIXOS DO RETORNO",
    `ASC do retorno em ${formatLongitude(returnChart.housesData.ascendant)}, caindo na casa natal ${ascInNatalHouse}.`,
    `MC do retorno em ${formatLongitude(returnChart.housesData.mc)}, caindo na casa natal ${mcInNatalHouse}.`,
    `Regente do ASC do retorno: ${getPlanetCondition(returnAscRuler, returnChart)}`,
    `Regente do MC do retorno: ${getPlanetCondition(returnMcRuler, returnChart)}`
  );

  if (isSolar) {
    report.push(
      "",
      SEPARATOR,
      "PROFECCAO ANUAL COMO CHAVE DE LEITURA",
      `Idade profectada: ${years}. Casa ativada: ${profection.activatedHouse}.`,
      `ASC profectado em ${formatLongitude(
        profection.profectedAscendant
      )}; senhor do ano: ${TABLE_PLANET_NAME[profection.annualLordType]}.`,
      `Senhor do ano no natal: ${getPlanetCondition(
        profection.annualLordNatal,
        natalChart
      )}`,
      `Senhor do ano na revolucao: ${getPlanetCondition(
        annualLordReturn,
        returnChart
      )}`,
      `Planetas natais na casa ativada: ${formatPlanetList(
        getPlanetsInHouse(natalChart, profection.activatedHouse)
      )}.`
    );
  }

  report.push(
    "",
    SEPARATOR,
    isSolar ? "LUMINARES NA REVOLUCAO" : "LUA DA REVOLUCAO LUNAR",
    `Sol natal: ${formatLongitude(natalSun.longitudeRaw)}. Lua natal: ${formatLongitude(natalMoon.longitudeRaw)}.`,
    `Sol do retorno: ${getPlanetCondition(returnSun, returnChart)}`,
    `Lua do retorno: ${getPlanetCondition(returnMoon, returnChart)}`,
    `Fase Sol-Lua no retorno: ${getMoonPhaseLabel(
      returnSun.longitudeRaw,
      returnMoon.longitudeRaw
    )}.`
  );

  report.push(
    "",
    SEPARATOR,
    "PLANETAS DO RETORNO EM CASAS NATAIS",
    ...getTraditionalPlanets(returnChart).map((planet) => {
      const natalHouse = getHouseIndex(
        planet.longitudeRaw,
        natalChart.housesData.house
      );
      return `${TABLE_PLANET_NAME[planet.type]} do retorno cai na casa natal ${natalHouse}, em ${formatLongitude(planet.longitudeRaw)}.`;
    }),
    "",
    SEPARATOR,
    "PARTES ARABES DO RETORNO",
    ...buildArabicLotsLines(returnChart),
    "",
    SEPARATOR,
    "ASPECTOS RELEVANTES COM O NATAL",
    ...(crossAspects.length > 0
      ? crossAspects
      : ["Nenhum aspecto tradicional dentro da orbe configurada."])
  );

  return report.join("\n");
}

export function generateSecondaryProgressionReport(
  natalChart: BirthChart,
  progressionChart: BirthChart
) {
  const report: string[] = [];
  const targetYear =
    progressionChart.targetDate?.year ??
    natalChart.birthDate.year +
      Math.max(0, progressionChart.birthDate.year - natalChart.birthDate.year);
  const years = Math.max(0, targetYear - natalChart.birthDate.year);
  const progressedSun = getPlanet(progressionChart, "sun");
  const progressedMoon = getPlanet(progressionChart, "moon");
  const progressedAscRuler = getPlanet(
    progressionChart,
    getRulerType(progressionChart.housesData.ascendant)
  );
  const crossAspects = collectCrossAspects(
    progressionChart,
    natalChart,
    "progredido",
    "natal"
  );
  const signChanges = getTraditionalPlanets(progressionChart)
    .map((progressedPlanet) => {
      const natalPlanet = getPlanet(natalChart, progressedPlanet.type);
      const natalSign = getSignIndex(natalPlanet.longitudeRaw);
      const progressedSign = getSignIndex(progressedPlanet.longitudeRaw);

      if (natalSign === progressedSign) return undefined;

      return `${TABLE_PLANET_NAME[progressedPlanet.type]} saiu de ${SIGNS[natalSign]} e esta em ${SIGNS[progressedSign]}.`;
    })
    .filter(Boolean) as string[];
  const stationChanges = getTraditionalPlanets(progressionChart)
    .map((progressedPlanet) => {
      const natalPlanet = getPlanet(natalChart, progressedPlanet.type);

      if (natalPlanet.isRetrograde === progressedPlanet.isRetrograde) {
        return undefined;
      }

      return `${TABLE_PLANET_NAME[progressedPlanet.type]} mudou de movimento: natal ${natalPlanet.isRetrograde ? "retrogrado" : "direto"}, progredido ${progressedPlanet.isRetrograde ? "retrogrado" : "direto"}.`;
    })
    .filter(Boolean) as string[];

  report.push(
    "RELATORIO DE PROGRESSAO SECUNDARIA",
    "",
    `Ano consultado: ${targetYear}. Idade simbolica: ${years}.`,
    `Dia simbolico usado: ${formatDate(progressionChart.birthDate)}.`,
    "Regra tecnica: um dia apos o nascimento equivale a um ano de vida. A carta progredida e simbolica, nao um mapa radical autonomo.",
    "",
    SEPARATOR,
    "LUMINARES PROGREDIDOS",
    `Sol progredido: ${getPlanetCondition(progressedSun, progressionChart)}`,
    `Lua progredida: ${getPlanetCondition(progressedMoon, progressionChart)}`,
    `A Lua progredida cai na casa natal ${getHouseIndex(
      progressedMoon.longitudeRaw,
      natalChart.housesData.house
    )}.`,
    `Fase progredida Sol-Lua: ${getMoonPhaseLabel(
      progressedSun.longitudeRaw,
      progressedMoon.longitudeRaw
    )}.`,
    "",
    SEPARATOR,
    "ASCENDENTE E REGENTE PROGREDIDOS",
    `ASC progredido em ${formatLongitude(progressionChart.housesData.ascendant)}.`,
    `Regente do ASC progredido: ${getPlanetCondition(
      progressedAscRuler,
      progressionChart
    )}`,
    "",
    SEPARATOR,
    "MUDANCAS SIMBOLICAS",
    ...(signChanges.length > 0
      ? signChanges
      : ["Nenhuma mudanca de signo entre os planetas tradicionais."]),
    ...(stationChanges.length > 0
      ? stationChanges
      : ["Nenhuma mudanca de movimento direto/retrogrado entre os planetas tradicionais."]),
    "",
    SEPARATOR,
    "ASPECTOS PROGREDIDOS AO NATAL",
    ...(crossAspects.length > 0
      ? crossAspects
      : ["Nenhum aspecto tradicional dentro da orbe configurada."])
  );

  return report.join("\n");
}

export function generateAnnualProfectionReport(
  natalChart: BirthChart,
  profectionChart: BirthChart
) {
  const years =
    profectionChart.profectionYears ??
    Math.max(0, profectionChart.birthDate.year - natalChart.birthDate.year);
  const targetYear = profectionChart.targetDate?.year ?? profectionChart.birthDate.year;
  const profection = getAnnualProfectionData(natalChart, years);
  const annualLordProfected = getPlanet(
    profectionChart,
    profection.annualLordType
  );
  const activatedPlanets = getPlanetsInHouse(
    natalChart,
    profection.activatedHouse
  );
  const natalLotsLines = buildArabicLotsLines(natalChart);

  return [
    "RELATORIO DE PROFECCAO ANUAL TRADICIONAL",
    "",
    `Ano consultado: ${targetYear}. Idade profectada: ${years}.`,
    "Regra tecnica: a profeccao e simbolica; cada ano avanca uma casa/signo. Ela ativa lugares e regentes do natal, nao descreve posicoes astronomicas reais.",
    "",
    SEPARATOR,
    "LUGAR ATIVADO",
    `Casa ativada: ${profection.activatedHouse}.`,
    `ASC profectado em ${formatLongitude(profection.profectedAscendant)} (${SIGNS[profection.activatedSignIndex]}).`,
    `Senhor do ano: ${TABLE_PLANET_NAME[profection.annualLordType]}.`,
    `Planetas natais na casa ativada: ${formatPlanetList(activatedPlanets)}.`,
    "",
    SEPARATOR,
    "SENHOR DO ANO",
    `No natal: ${getPlanetCondition(profection.annualLordNatal, natalChart)}`,
    `No giro simbolico da profeccao: ${getPlanetCondition(
      annualLordProfected,
      profectionChart
    )}`,
    `Casa natal ocupada pelo senhor do ano: ${getHouseIndex(
      profection.annualLordNatal.longitudeRaw,
      natalChart.housesData.house
    )}.`,
    "",
    SEPARATOR,
    "ANGULOS PROFECTADOS",
    `ASC: ${formatLongitude(profectionChart.housesData.house[0])}.`,
    `IC: ${formatLongitude(profectionChart.housesData.house[3])}.`,
    `DSC: ${formatLongitude(profectionChart.housesData.house[6])}.`,
    `MC: ${formatLongitude(profectionChart.housesData.house[9])}.`,
    "",
    SEPARATOR,
    "PARTES ARABES DO NATAL COMO APOIO",
    ...natalLotsLines,
    "",
    SEPARATOR,
    "CRITERIO DE JULGAMENTO",
    "Priorize o senhor do ano, os planetas da casa ativada e a condicao natal desses significadores. Para timing fino, combine com revolucao solar/lunar e transitos, sem tratar a profeccao como transito real.",
  ].join("\n");
}
