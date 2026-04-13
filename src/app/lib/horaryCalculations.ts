import {
  BirthChart,
  Planet,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import {
  EssentialDignityScore,
  AccidentalDignityScore,
  HorarySignificators,
  CollectionData,
  ReceptionData,
  HoraryPart,
  HoraryData,
} from "@/interfaces/HoraryInterfaces";

import {
  formatDegrees,
  getHouseIndex,
  getSect,
} from "./traditionalCalculations";
import {
  SIGNS,
  DOMICILE_RULER,
  EXALTATION,
  FALL,
  DETRIMENT,
  TRIPLICITY_RULERS,
  EGYPTIAN_TERMS,
  FACES,
  SIGN_ELEMENT,
  AVERAGE_DAILY_SPEED,
  HOUSE_TYPE,
} from "./traditionalTables";
import {
  resolveTraditionalAspect,
  isApplyingByMotion,
  TraditionalAspectParticipant,
} from "./aspectDynamics";
import {
  getHourLord,
  HORARY_TOPICS,
  LILLY_CRITICAL_DEGREES,
  PLANET_NAME_TO_TYPE,
  PLANET_TYPE_TO_NAME,
  RECEPTION_STRENGTH,
  COMBUST_DISTANCE,
  CAZIMI_DISTANCE,
  SUNBEAMS_DISTANCE,
  BENEFICS,
  MALEFICS,
} from "./horaryTables";
import {
  calculateArabicLots,
  fromTotal,
  longitudeToAbsoluteMinutes,
  normalize,
  isDiurnalChart,
} from "./arabicLots";

// ============================================================
// Helpers
// ============================================================

const TRADITIONAL_TYPES: PlanetType[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
];

const TRADITIONAL_NAMES = ["Sol", "Lua", "Mercúrio", "Vênus", "Marte", "Júpiter", "Saturno"];

const TRADITIONAL_PLANET_TYPES = ["saturn", "saturno"] as const;

function resolveTraditionalType(name: string): PlanetType {
  const mapping: Record<string, PlanetType> = {
    "Sol": "sun",
    "Lua": "moon",
    "Mercúrio": "mercury",
    "Vênus": "venus",
    "Marte": "mars",
    "Júpiter": "jupiter",
    "Saturno": "saturn",
  };
  return mapping[name] ?? "sun";
}

function normalizeLongitude(lon: number): number {
  return ((lon % 360) + 360) % 360;
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));
  return diff > 180 ? 360 - diff : diff;
}

function getPlanet(chart: BirthChart, type: PlanetType): Planet | undefined {
  return chart.planets.find((p) => p.type === type);
}

function findTraditionalPlanet(chart: BirthChart, name: string): Planet | undefined {
  const type = PLANET_NAME_TO_TYPE[name];
  if (!type) return undefined;
  return getPlanet(chart, type as PlanetType);
}

function getRulerOfSign(signIdx: number): string {
  return DOMICILE_RULER[((signIdx % 12) + 12) % 12];
}

// ============================================================
// 1. Dignidades Essenciais (estruturadas para horária)
// ============================================================

export function calculateEssentialDignities(
  chart: BirthChart
): EssentialDignityScore[] {
  const sect = getSect(
    getPlanet(chart, "sun")!.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house,
  );

  return TRADITIONAL_TYPES.map((pType, idx) => {
    const planet = getPlanet(chart, pType);
    if (!planet) {
      return {
        planetName: TRADITIONAL_NAMES[idx],
        planetType: pType,
        longitude: 0,
        sign: "?",
        degreeInSign: 0,
        essentialScore: 0,
        isPeregrine: true,
      };
    }

    const lon = normalizeLongitude(planet.longitudeRaw);
    const signIdx = Math.floor(lon / 30) % 12;
    const deg = lon % 30;
    const element = SIGN_ELEMENT[signIdx];
    const name = TRADITIONAL_NAMES[idx];

    // Dignidades
    const domicileRuler = getRulerOfSign(signIdx);
    const hasDomicile = domicileRuler === name;

    let exaltationSign: string | undefined;
    let hasExaltation = false;
    for (const [p, sIdx] of Object.entries(EXALTATION)) {
      if (sIdx === signIdx) {
        exaltationSign = `${p} (${SIGNS[sIdx]})`;
        if (p === name) hasExaltation = true;
      }
    }

    const tripRuler = sect === "Diurno"
      ? TRIPLICITY_RULERS[element].day
      : TRIPLICITY_RULERS[element].night;
    const hasTriplicity = tripRuler === name;

    const termRuler = EGYPTIAN_TERMS[signIdx].find((t) => deg < t.endDeg)?.ruler;
    const hasTerm = termRuler === name;

    const faceIdx = Math.floor(deg / 10);
    const faceRuler = FACES[signIdx][faceIdx];
    const hasFace = faceRuler === name;

    // Debilidades
    let hasDetriment = false;
    let detrimentSigns: string | undefined;
    if (DETRIMENT[name]?.includes(signIdx)) {
      hasDetriment = true;
      detrimentSigns = DETRIMENT[name]
        .map((s) => SIGNS[s])
        .join(", ");
    }

    let hasFall = false;
    let fallSign: string | undefined;
    if (FALL[name] === signIdx) {
      hasFall = true;
      fallSign = SIGNS[signIdx];
    }

    // Pontuação
    let score = 0;
    if (hasDomicile) score += 5;
    if (hasExaltation) score += 4;
    if (hasTriplicity) score += 3;
    if (hasTerm) score += 2;
    if (hasFace) score += 1;
    if (hasDetriment) score -= 5;
    if (hasFall) score -= 4;

    return {
      planetName: name,
      planetType: pType,
      longitude: lon,
      sign: SIGNS[signIdx],
      degreeInSign: deg,
      domicile: hasDomicile ? SIGNS[signIdx] : undefined,
      exaltation: exaltationSign,
      triplicity: hasTriplicity ? tripRuler : tripRuler,
      term: termRuler,
      face: faceRuler,
      detriment: detrimentSigns,
      fall: fallSign,
      essentialScore: score,
      isPeregrine: score <= 0,
    };
  });
}

// ============================================================
// 2. Dignidades Acidentais
// ============================================================

export function calculateAccidentalDignities(
  chart: BirthChart,
  essentialScores: EssentialDignityScore[],
): AccidentalDignityScore[] {
  const cusps = chart.housesData.house;
  const sun = getPlanet(chart, "sun");
  const sunLon = sun ? normalizeLongitude(sun.longitudeRaw) : 0;
  const mcLon = chart.housesData.mc;
  const mcSignIdx = Math.floor(normalizeLongitude(mcLon) / 30) % 12;
  const mcRuler = getRulerOfSign(mcSignIdx);

  // Parte da Fortuna (posição)
  let fortuneHouse = 0;
  try {
    const lots = calculateArabicLots(chart);
    if (lots.fortune) {
      fortuneHouse = getHouseIndex(lots.fortune.longitude, cusps);
    }
  } catch {
    fortuneHouse = 0;
  }

  const goodFortuneHouses = new Set([1, 4, 7, 10, 11]);

  return TRADITIONAL_TYPES.map((pType, idx) => {
    const planet = getPlanet(chart, pType);
    const name = TRADITIONAL_NAMES[idx];
    const essScore = essentialScores[idx]?.essentialScore ?? 0;

    if (!planet) {
      return {
        planetName: name,
        planetType: pType,
        houseStrength: 0,
        houseType: "?",
        isDirect: true,
        isSwift: false,
        isCombust: false,
        isCazimi: false,
        isUnderSunbeams: false,
        isOriental: false,
        conjunctBenefic: [] as string[],
        conjunctMalefic: [] as string[],
        isLordOfMC: false,
        fortuneInGoodHouse: false,
        accidentalScore: 0,
        totalScore: essScore,
      } satisfies AccidentalDignityScore;
    }

    const lon = normalizeLongitude(planet.longitudeRaw);
    const hIdx = getHouseIndex(lon, cusps);

    // Casa
    let houseStrength = 0;
    let houseType = HOUSE_TYPE[hIdx - 1] ?? "Cadente";
    if ([1, 4, 7, 10].includes(hIdx)) houseStrength = 4;
    else if ([2, 5, 8, 11].includes(hIdx)) houseStrength = 3;
    else houseStrength = 2;

    // Direção
    const isDirect = !planet.isRetrograde;
    const dirScore = isDirect ? 4 : -5;

    // Velocidade
    const avgSpeed = AVERAGE_DAILY_SPEED[name];
    const speed = Math.abs(planet.longitudeSpeed);
    const isSwift = avgSpeed ? speed >= avgSpeed * 0.85 : false;
    const swiftScore = isSwift ? 2 : -2;

    // Distância ao Sol
    const sunDist = angularDistance(lon, sunLon);
    let isCazimi = sunDist < CAZIMI_DISTANCE;
    let isCombust = !isCazimi && sunDist < COMBUST_DISTANCE;
    let isUnderSunbeams = !isCombust && !isCazimi && sunDist < SUNBEAMS_DISTANCE;
    const sunScore = isCazimi ? 5 : isCombust ? -4 : isUnderSunbeams ? -2 : 0;

    // Oriental / Ocidental
    const isOriental = lon < sunLon;
    const orientalScore = 1;

    // Conjunções
    const conjunctBenefic: string[] = [];
    const conjunctMalefic: string[] = [];
    for (const otherName of TRADITIONAL_NAMES) {
      if (otherName === name) continue;
      const otherPlanet = findTraditionalPlanet(chart, otherName);
      if (!otherPlanet) continue;
      const otherLon = normalizeLongitude(otherPlanet.longitudeRaw);
      const dist = angularDistance(lon, otherLon);
      if (dist > 5) continue;
      if (BENEFICS.includes(otherName)) conjunctBenefic.push(otherName);
      if (MALEFICS.includes(otherName)) conjunctMalefic.push(otherName);
    }
    const conjScore = conjunctBenefic.length * 2 - conjunctMalefic.length * 2;

    // Regente do MC
    const isLordOfMC = mcRuler === name;
    const mcScore = isLordOfMC ? 3 : 0;

    // Fortuna em casa boa
    const fortuneInGoodHouse = goodFortuneHouses.has(fortuneHouse);
    const fortuneScore = fortuneInGoodHouse ? 4 : 0;

    const accidentalScore =
      houseStrength + dirScore + swiftScore + sunScore +
      orientalScore + conjScore + mcScore + fortuneScore;

    return {
      planetName: name,
      planetType: pType,
      houseStrength,
      houseType,
      isDirect,
      isSwift,
      isCombust,
      isCazimi,
      isUnderSunbeams,
      isOriental,
      conjunctBenefic,
      conjunctMalefic,
      isLordOfMC,
      fortuneInGoodHouse,
      accidentalScore,
      totalScore: essScore + accidentalScore,
    };
  });
}

// ============================================================
// 3. Significadores Horários
// ============================================================

export function getHorarySignificators(
  chart: BirthChart,
  topic: string,
  essentialScores: EssentialDignityScore[],
  accidentalScores: AccidentalDignityScore[],
): HorarySignificators {
  // Consulente = regente do Ascendente
  const ascLon = normalizeLongitude(chart.housesData.ascendant);
  const ascSignIdx = Math.floor(ascLon / 30) % 12;
  const querentRulerName = getRulerOfSign(ascSignIdx);
  const querentRulerType = (PLANET_NAME_TO_TYPE[querentRulerName] ?? "sun") as PlanetType;
  const querentIdx = TRADITIONAL_NAMES.indexOf(querentRulerName);

  // Quesitado = regente da cúspide da casa derivada
  const topicData = HORARY_TOPICS[topic.toLowerCase().trim()];
  const derivedHouse = topicData?.house ?? 7;
  const topicLabel = topicData?.label ?? topic;
  const derivedCuspIdx = derivedHouse - 1;
  const derivedCuspLon = normalizeLongitude(chart.housesData.house[derivedCuspIdx]);
  const derivedSignIdx = Math.floor(derivedCuspLon / 30) % 12;
  const quesitedRulerName = getRulerOfSign(derivedSignIdx);
  const quesitedRulerType = (PLANET_NAME_TO_TYPE[quesitedRulerName] ?? "venus") as PlanetType;
  const quesitedIdx = TRADITIONAL_NAMES.indexOf(quesitedRulerName);

  const querentEss = essentialScores[querentIdx]?.essentialScore ?? 0;
  const querentAcc = accidentalScores[querentIdx]?.accidentalScore ?? 0;
  const quesitedEss = essentialScores[quesitedIdx]?.essentialScore ?? 0;
  const quesitedAcc = accidentalScores[quesitedIdx]?.accidentalScore ?? 0;

  return {
    querent: {
      lord: querentRulerType,
      lordName: querentRulerName,
      house: 1,
      essentialScore: querentEss,
      accidentalScore: querentAcc,
      totalScore: querentEss + querentAcc,
    },
    quesited: {
      lord: quesitedRulerType,
      lordName: quesitedRulerName,
      house: derivedHouse,
      topicLabel,
      essentialScore: quesitedEss,
      accidentalScore: quesitedAcc,
      totalScore: quesitedEss + quesitedAcc,
    },
    derivedHouse,
    topic: topic.toLowerCase().trim(),
    topicLabel,
  };
}

// ============================================================
// 4. Coleção e Tradução
// ============================================================

export function calculateCollection(
  chart: BirthChart,
  significators: HorarySignificators,
): CollectionData {
  const querentPlanet = findTraditionalPlanet(chart, significators.querent.lordName);
  const quesitedPlanet = findTraditionalPlanet(chart, significators.quesited.lordName);

  if (!querentPlanet || !quesitedPlanet) {
    return {
      isApplying: false,
      applyingPlanet: significators.querent.lordName,
      receivingPlanet: significators.quesited.lordName,
    };
  }

  const qParticipant: TraditionalAspectParticipant = {
    longitude: querentPlanet.longitudeRaw,
    speed: querentPlanet.longitudeSpeed,
    elementType: "planet",
    planetType: significators.querent.lord,
  };

  const qsParticipant: TraditionalAspectParticipant = {
    longitude: quesitedPlanet.longitudeRaw,
    speed: quesitedPlanet.longitudeSpeed,
    elementType: "planet",
    planetType: significators.quesited.lord,
  };

  const match = resolveTraditionalAspect(qParticipant, qsParticipant);

  // Verificar tradução
  let translation: CollectionData["translation"];
  let prohibition: CollectionData["prohibition"];
  let frustration: CollectionData["frustration"];

  if (match) {
    // Tradução: outro planeta aplica ao quesitado antes
    for (const name of TRADITIONAL_NAMES) {
      if (name === significators.querent.lordName || name === significators.quesited.lordName) continue;
      const translator = findTraditionalPlanet(chart, name);
      if (!translator) continue;

      const tToQuesited: TraditionalAspectParticipant = {
        longitude: translator.longitudeRaw,
        speed: translator.longitudeSpeed,
        elementType: "planet",
        planetType: (PLANET_NAME_TO_TYPE[name] ?? "sun") as PlanetType,
      };

      const tMatch = resolveTraditionalAspect(tToQuesited, qsParticipant);
      if (tMatch && tMatch.applying && tMatch.orbDistance < (match.orbDistance ?? 999)) {
        // Proibição se maléfico
        if (MALEFICS.includes(name)) {
          prohibition = {
            prohibitingPlanet: name,
            type: "aspect",
            details: `${name} aplica ${tMatch.aspectType} ao quesited (${significators.quesited.lordName}) com orbe de ${tMatch.orbDistance.toFixed(1)}° antes da coleção.`,
          };
        } else {
          translation = {
            translatingPlanet: name,
            from: significators.querent.lordName,
            to: significators.quesited.lordName,
            aspectType: tMatch.aspectType,
            orb: tMatch.orbDistance,
          };
        }
      }
    }

    // Frustração: outro planeta separa do quesitado enquanto consulente aplica
    for (const name of TRADITIONAL_NAMES) {
      if (name === significators.querent.lordName || name === significators.quesited.lordName) continue;
      const frustrator = findTraditionalPlanet(chart, name);
      if (!frustrator) continue;

      const fToQuesited: TraditionalAspectParticipant = {
        longitude: frustrator.longitudeRaw,
        speed: frustrator.longitudeSpeed,
        elementType: "planet",
        planetType: (PLANET_NAME_TO_TYPE[name] ?? "sun") as PlanetType,
      };

      const fMatch = resolveTraditionalAspect(fToQuesited, qsParticipant);
      if (fMatch && !fMatch.applying && fMatch.orbDistance < (match.orbDistance ?? 999)) {
        frustration = {
          frustratingPlanet: name,
          details: `${name} está separando do quesited (${significators.quesited.lordName}) por ${fMatch.aspectType} (orbe ${fMatch.orbDistance.toFixed(1)}°), frustrando a coleção.`,
        };
      }
    }
  }

  // Contrantiscion: antíscio do consulente em conjunção com o quesitado
  const querentAntiscion = (540 - normalizeLongitude(querentPlanet.longitudeRaw)) % 360;
  const antiscionDistance = angularDistance(querentAntiscion, normalizeLongitude(quesitedPlanet.longitudeRaw));
  const contrantiscion = antiscionDistance < 1.5;

  return {
    isApplying: match?.applying ?? false,
    aspectType: match?.aspectType,
    orb: match?.orbDistance,
    applyingPlanet: significators.querent.lordName,
    receivingPlanet: significators.quesited.lordName,
    translation,
    prohibition,
    frustration,
    contrantiscion,
  };
}

// ============================================================
// 5. Recepção
// ============================================================

function getDignitiesForPlanetInSign(planetName: string, signIdx: number): string[] {
  const result: string[] = [];
  const signRuler = getRulerOfSign(signIdx);

  // Domicílio
  if (signRuler === planetName) result.push("domicílio");

  // Exaltação
  for (const [p, sIdx] of Object.entries(EXALTATION)) {
    if (sIdx === signIdx && p === planetName) result.push("exaltacao");
  }

  // Triplicidade (usamos diurno como referência genérica; na prática depende do sect)
  const element = SIGN_ELEMENT[signIdx];
  const trip = TRIPLICITY_RULERS[element];
  if (trip.day === planetName || trip.night === planetName) result.push("triplicidade");

  // Termo
  // Verificamos se o planeta rege algum termo deste signo
  for (const t of EGYPTIAN_TERMS[signIdx]) {
    if (t.ruler === planetName) result.push("termo");
    break;
  }

  // Face
  for (const faceRuler of FACES[signIdx]) {
    if (faceRuler === planetName) result.push("face");
    break;
  }

  return result;
}

function strongestReception(byList: string[]): { strongest: string; strength: "forte" | "moderada" | "fraca" } {
  if (byList.includes("domicílio")) return { strongest: "domicílio", strength: "forte" };
  if (byList.includes("exaltacao")) return { strongest: "exaltacao", strength: "forte" };
  if (byList.includes("triplicidade")) return { strongest: "triplicidade", strength: "moderada" };
  if (byList.includes("termo")) return { strongest: "termo", strength: "moderada" };
  if (byList.includes("face")) return { strongest: "face", strength: "fraca" };
  return { strongest: "", strength: "fraca" };
}

export function calculateReception(
  significators: HorarySignificators,
  chart: BirthChart,
): ReceptionData {
  const querentPlanet = findTraditionalPlanet(chart, significators.querent.lordName);
  const quesitedPlanet = findTraditionalPlanet(chart, significators.quesited.lordName);

  if (!querentPlanet || !quesitedPlanet) {
    return { isMutual: false };
  }

  const querentSignIdx = Math.floor(normalizeLongitude(querentPlanet.longitudeRaw) / 30) % 12;
  const quesitedSignIdx = Math.floor(normalizeLongitude(quesitedPlanet.longitudeRaw) / 30) % 12;

  // O quesido possui dignidades no signo onde está o consulente?
  const qToQsList = getDignitiesForPlanetInSign(significators.quesited.lordName, querentSignIdx);
  const querentToQuesited = qToQsList.length > 0
    ? { by: qToQsList, ...strongestReception(qToQsList) }
    : undefined;

  // O consulente possui dignidades no signo onde está o quesido?
  const qsToQList = getDignitiesForPlanetInSign(significators.querent.lordName, quesitedSignIdx);
  const quesitedToQuerent = qsToQList.length > 0
    ? { by: qsToQList, ...strongestReception(qsToQList) }
    : undefined;

  const isMutual = (qToQsList.length > 0) && (qsToQList.length > 0);
  const mutualBy = isMutual
    ? `${significators.querent.lordName} recebe por ${qToQsList.join(", ")}; ${significators.quesited.lordName} recebe por ${qsToQList.join(", ")}`
    : undefined;

  return {
    querentToQuesited,
    quesitedToQuerent,
    isMutual,
    mutualBy,
  };
}

// ============================================================
// 6. Partes Árabes da Horária
// ============================================================

export function calculateHoraryParts(chart: BirthChart): HoraryPart[] {
  const cusps = chart.housesData.house;
  const isDiurno = isDiurnalChart(chart);
  const ascTotal = longitudeToAbsoluteMinutes(chart.housesData.ascendant);
  const sunTotal = longitudeToAbsoluteMinutes(getPlanet(chart, "sun")!.longitudeRaw);
  const moonTotal = longitudeToAbsoluteMinutes(getPlanet(chart, "moon")!.longitudeRaw);
  const venusTotal = longitudeToAbsoluteMinutes(getPlanet(chart, "venus")!.longitudeRaw);
  const cusp8Total = longitudeToAbsoluteMinutes(cusps[7]);

  function calcPart(bTotal: number, cTotal: number): number {
    return isDiurno
      ? normalize(ascTotal + bTotal - cTotal)
      : normalize(ascTotal + cTotal - bTotal);
  }

  function toHoraryPart(name: string, totalMin: number): HoraryPart {
    const { signo, grau, minuto } = fromTotal(totalMin);
    const lon = totalMin / 60;
    const hIdx = getHouseIndex(lon, cusps);
    return {
      name,
      longitude: lon,
      sign: SIGNS[signo],
      posFormatted: `${SIGNS[signo]} a ${grau}°${minuto.toString().padStart(2, "0")}'`,
      house: `Casa ${hIdx}`,
    };
  }

  const parts: HoraryPart[] = [];

  // Fortuna e Espírito (já existem)
  try {
    const lots = calculateArabicLots(chart);
    if (lots.fortune) {
      parts.push(toHoraryPart("Parte da Fortuna", lots.fortune.longitudeRaw));
    }
    if (lots.spirit) {
      parts.push(toHoraryPart("Parte do Espírito", lots.spirit.longitudeRaw));
    }
  } catch {
    // fallback
  }

  // Conjunção: AC + Sol - Lua (diurno) ou AC + Lua - Sol (noturno)
  parts.push(toHoraryPart(
    "Parte da Conjunção",
    isDiurno
      ? normalize(ascTotal + sunTotal - moonTotal)
      : normalize(ascTotal + moonTotal - sunTotal),
  ));

  // Casamento: AC + Lua - Vênus (diurno) ou AC + Vênus - Lua (noturno)
  parts.push(toHoraryPart(
    "Parte do Casamento",
    isDiurno
      ? normalize(ascTotal + moonTotal - venusTotal)
      : normalize(ascTotal + venusTotal - moonTotal),
  ));

  // Morte: AC + cusp8 - Sol (diurno) ou AC + Sol - cusp8 (noturno)
  parts.push(toHoraryPart(
    "Parte da Morte",
    isDiurno
      ? normalize(ascTotal + cusp8Total - sunTotal)
      : normalize(ascTotal + sunTotal - cusp8Total),
  ));

  return parts;
}

// ============================================================
// 7. Veredito Horário (Frawley)
// ============================================================

export function calculateHoraryVerdict(
  chart: BirthChart,
  horaryData: Partial<HoraryData>,
): HoraryData["verdict"] {
  const detailedReport: string[] = [];
  let score = 0;

  // 1. AC em grau crítico (29° = carta tardia)
  if (horaryData.ascendantIsCritical) {
    const ascDeg = Math.floor(horaryData.ascendantDegree!);
    if (ascDeg >= 29) {
      score -= 4;
      detailedReport.push(
        `ATENÇÃO: Ascendente em grau tardio (${ascDeg}°). A situação pode já ter se resolvido ou estar mudando. [-4]`,
      );
    } else {
      score -= 1;
      detailedReport.push(
        `Ascendente em grau crítico de Lilly (${ascDeg}°). Possível instabilidade. [-1]`,
      );
    }
  }

  // 2. Consulente em queda/detrimento
  const querentEss = horaryData.significators?.querent?.essentialScore ?? 0;
  const querentName = horaryData.significators?.querent?.lordName ?? "?";
  if (querentEss <= -4) {
    score -= 3;
    detailedReport.push(
      `${querentName} (consulente) fortemente debilitado essencialmente (score ${querentEss}). Indica fraqueza do consulente. [-3]`,
    );
  }

  // 3. Consulente peregrino
  if (querentEss <= 0 && querentEss > -4) {
    score -= 1;
    detailedReport.push(
      `${querentName} (consulente) peregrino (score ${querentEss}). Pouco recurso próprio. [-1]`,
    );
  }

  // 4. Quesitado em casa 6, 8 ou 12
  const quesitedHouse = horaryData.significators?.quesited?.house ?? 0;
  const quesitedName = horaryData.significators?.quesited?.lordName ?? "?";
  if ([6, 8, 12].includes(quesitedHouse)) {
    score -= 3;
    detailedReport.push(
      `${quesitedName} (quesitado) na Casa ${quesitedHouse}, casa desfavorável. Indica dificuldade ou perda. [-3]`,
    );
  }

  // 5. Coleção
  const collection = horaryData.collection;
  if (collection) {
    if (collection.isApplying && collection.aspectType) {
      if (["conjunction", "sextile", "trine"].includes(collection.aspectType)) {
        score += 5;
        const aspectLabels: Record<string, string> = {
          conjunction: "conjunção",
          sextile: "sextil",
          trine: "trígono",
        };
        detailedReport.push(
          `${collection.applyingPlanet} aplica por ${aspectLabels[collection.aspectType] ?? collection.aspectType} a ${collection.receivingPlanet}. Aspecto favorável, indica reunião. [+5]`,
        );
      } else if (["square", "opposition"].includes(collection.aspectType)) {
        score -= 5;
        const aspectLabels: Record<string, string> = {
          square: "quadratura",
          opposition: "oposição",
        };
        detailedReport.push(
          `${collection.applyingPlanet} aplica por ${aspectLabels[collection.aspectType] ?? collection.aspectType} a ${collection.receivingPlanet}. Aspecto desfavorável, indica conflito. [-5]`,
        );
      }
    } else if (!collection.isApplying && collection.aspectType) {
      detailedReport.push(
        `${collection.applyingPlanet} está separando de ${collection.receivingPlanet}. A situação já passou. [0]`,
      );
    }

    // 6. Recepção mútua
    if (horaryData.reception?.isMutual) {
      score += 6;
      detailedReport.push(
        `Recepção mútua entre ${querentName} e ${quesitedName}. Indica acordo, boa vontade mútua, alta probabilidade de resultado positivo. [+6]`,
      );
    }

    // 7. Proibição
    if (collection.prohibition) {
      score -= 5;
      detailedReport.push(
        `Proibição: ${collection.prohibition.prohibitingPlanet} intercepta a coleção antes que se complete. Resultado bloqueado. [-5]`,
      );
    }

    // 9. Tradução por benéfico
    if (collection.translation && BENEFICS.includes(collection.translation.translatingPlanet)) {
      score += 3;
      detailedReport.push(
        `Tradução por ${collection.translation.translatingPlanet} (benéfico): ${collection.translation.from} → ${collection.translation.to}. Intermediário favorável. [+3]`,
      );
    }

    // 10. Contrantiscion
    if (collection.contrantiscion) {
      score += 2;
      detailedReport.push(
        `Contrantiscion: o antíscio do consulente toca o quesitado. União por meio indireto. [+2]`,
      );
    }
  }

  // 8. Quesitado combusto
  const accScores = horaryData.accidentalDignities;
  if (accScores) {
    const quesitedIdx = TRADITIONAL_NAMES.indexOf(quesitedName);
    if (quesitedIdx >= 0 && accScores[quesitedIdx]?.isCombust) {
      score -= 4;
      detailedReport.push(
        `${quesitedName} (quesitado) combusto — perdeu poder. A coisa desejada está oculta ou danificada. [-4]`,
      );
    }
  }

  // Confiança
  let confidence: "alto" | "moderado" | "baixo";
  if (score >= 3) confidence = "alto";
  else if (score <= -3) confidence = "alto";
  else confidence = "moderado";

  if (Math.abs(score) <= 1 && detailedReport.length <= 2) {
    confidence = "baixo";
  }

  // Resumo
  const isPositive = score > 0;
  const summary = buildVerdictSummary(score, isPositive, horaryData, detailedReport);

  return { score, confidence, summary, detailedReport };
}

function buildVerdictSummary(
  score: number,
  isPositive: boolean,
  horaryData: Partial<HoraryData>,
  details: string[],
): string {
  const qName = horaryData.significators?.querent?.lordName ?? "O consulente";
  const qsName = horaryData.significators?.quesited?.lordName ?? "o quesitado";
  const topicLabel = horaryData.significators?.topicLabel ?? "a pergunta";

  const positiveIndicators = details.filter((d) => d.includes("[+]")).length;
  const negativeIndicators = details.filter((d) => d.includes("[-]")).length;

  let text = "";

  if (horaryData.ascendantIsCritical && Math.floor(horaryData.ascendantDegree ?? 0) >= 29) {
    text += "O Ascendente em 29° sugere que a questão já avançou ou está prestes a mudar. ";
  }

  if (isPositive) {
    text += `Os indicadores tendem a favor (pontuação ${score > 0 ? "+" : ""}${score}). `;
    if (positiveIndicators > 1) {
      text += `${qName} e ${qsName} demonstram afinidade, `;
    }
    if (horaryData.reception?.isMutual) {
      text += "com receptividade mútua entre as partes. ";
    }
    if (horaryData.collection?.isApplying && ["conjunction", "sextile", "trine"].includes(horaryData.collection.aspectType ?? "")) {
      text += `A aplicação de ${qName} a ${qsName} indica que o resultado está se aproximando. `;
    }
    text += "A resposta tende a ser positiva para " + topicLabel.toLowerCase() + ".";
  } else if (score < 0) {
    text += `Os indicadores tendem contra (pontuação ${score}). `;
    if (horaryData.collection?.prohibition) {
      text += "A presença de proibição bloqueia a concretização. ";
    }
    if (negativeIndicators >= 2) {
      text += `Múltiplos indicadores negativos enfraquecem a possibilidade. `;
    }
    text += "A resposta tende a ser desfavorável para " + topicLabel.toLowerCase() + ".";
  } else {
    text += "Os indicadores estão equilibrados (pontuação 0). ";
    text += "A carta não apresenta sinais claros de sim ou não. ";
    text += "Pode haver demora ou a questão pode depender de fatores externos não capturados neste momento.";
  }

  return text;
}
