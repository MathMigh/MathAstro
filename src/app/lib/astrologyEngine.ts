import { SwissEphemeris } from "@swisseph/browser";
import { BirthChart, BirthDate, Planet, HousesData, PlanetType } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildFixedStarsFromExactMatches,
  calculateFixedStarMatchesFromSky,
  calculateFullFixedStarSky,
  decorateChartWithFixedStars,
  getDecimalYearFromDate,
} from "./fixedStars";

let swe: SwissEphemeris | null = null;

interface CoordinatesLike {
  latitude: number;
  longitude: number;
  name?: string;
  timezone?: string;
}

export async function getSwe(): Promise<SwissEphemeris> {
  if (!swe) {
    swe = new SwissEphemeris();
    const wasmPath = path.join(process.cwd(), "public", "vendor", "swisseph.wasm");
    const wasmBytes = await readFile(wasmPath);
    const wasmDataUrl = `data:application/wasm;base64,${wasmBytes.toString("base64")}`;
    await swe.init(wasmDataUrl);
  }
  return swe;
}

const SIGNS = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];

export function getSignName(lon: number): string {
  const index = Math.floor(lon / 30) % 12;
  return SIGNS[index];
}

export function computeAntiscion(lon: number): number {
  return (540 - lon) % 360;
}

function normalizeLocationText(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function resolveTimezone(coordinates: CoordinatesLike): string {
  const latitude = Number(coordinates.latitude);
  const longitude = Number(coordinates.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Coordenadas inválidas para resolver o fuso horário.");
  }

  if (!coordinates.timezone) {
    throw new Error(
      "Fuso IANA obrigatório. O motor natal não infere fuso por longitude, nome de cidade ou caixa geográfica; informe um timezone IANA explícito (ex.: America/Sao_Paulo).",
    );
  }

  if (!moment.tz.zone(coordinates.timezone)) {
    throw new Error(`Fuso IANA inválido: ${coordinates.timezone}`);
  }
  return coordinates.timezone;
}

// ==========================================
// C-MODULE BYPASS FUNCTIONS
// O pacote @swisseph/browser possui bugs no Javascript transpilado "(void 0).Ascendant".
// Estamos puxando a memória C++ bruta diretamente!
// ==========================================
function safeCalculatePosition(sw: any, julianDay: number, bodyId: number, flags: number) {
  const m = sw.module;
  const xxPtr = m._malloc(6 * 8);
  const serrPtr = m._malloc(256);
  const retflag = m.ccall(
    "swe_calc_ut_wrap",
    "number",
    ["number", "number", "number", "number", "number"],
    [julianDay, bodyId, flags, xxPtr, serrPtr]
  );
  if (retflag < 0) {
    const error = m.UTF8ToString(serrPtr);
    m._free(xxPtr);
    m._free(serrPtr);
    throw new Error(error);
  }
  const xx: number[] = [];
  for (let i = 0; i < 6; i++) {
    xx[i] = m.getValue(xxPtr + i * 8, "double");
  }
  m._free(xxPtr);
  m._free(serrPtr);
  return {
    longitude: xx[0],
    latitude: xx[1],
    distance: xx[2],
    longitudeSpeed: xx[3],
    latitudeSpeed: xx[4],
    distanceSpeed: xx[5],
    flags: retflag
  };
}

export interface PlanetaryEphemerisPoint {
  longitude: number;
  longitudeSpeed: number;
  isRetrograde: boolean;
}

/**
 * Astronomia neutra compartilhada: posições tropicais e velocidades em Dia Juliano UT.
 * Não executa julgamento natal ou horário; serve aos solvers cronológicos especializados.
 */
export async function calculatePlanetarySnapshotAtJulianDay(
  julianDay: number,
  types: PlanetType[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"],
): Promise<Partial<Record<PlanetType, PlanetaryEphemerisPoint>>> {
  const sw = await getSwe();
  const ids: Partial<Record<PlanetType, number>> = {
    sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6,
    uranus: 7, neptune: 8, pluto: 9, northNode: 11,
  };
  const out: Partial<Record<PlanetType, PlanetaryEphemerisPoint>> = {};
  for (const type of types) {
    if (type === "southNode") {
      const n = safeCalculatePosition(sw, julianDay, 11, 258);
      out.southNode = {
        longitude: (n.longitude + 180) % 360,
        longitudeSpeed: n.longitudeSpeed,
        isRetrograde: n.longitudeSpeed < 0,
      };
      continue;
    }
    const id = ids[type];
    if (id === undefined) continue;
    const x = safeCalculatePosition(sw, julianDay, id, 258);
    out[type] = {
      longitude: x.longitude,
      longitudeSpeed: x.longitudeSpeed,
      isRetrograde: x.longitudeSpeed < 0,
    };
  }
  return out;
}

function safeCalculateHouses(sw: any, julianDay: number, latitude: number, longitude: number, houseSystem: string) {
  const m = sw.module;
  const cuspsPtr = m._malloc(13 * 8); // 13 doubles
  const ascmcPtr = m._malloc(10 * 8); // 10 doubles
  const hsysCode = houseSystem.charCodeAt(0);
  m.ccall(
    "swe_houses_wrap",
    "number",
    ["number", "number", "number", "number", "number", "number"],
    [julianDay, latitude, longitude, hsysCode, cuspsPtr, ascmcPtr]
  );
  const cusps: number[] = [];
  for (let i = 0; i < 13; i++) {
    cusps[i] = m.getValue(cuspsPtr + i * 8, "double");
  }
  const ascmc: number[] = [];
  for (let i = 0; i < 10; i++) {
    ascmc[i] = m.getValue(ascmcPtr + i * 8, "double");
  }
  m._free(cuspsPtr);
  m._free(ascmcPtr);
  return {
    cusps,
    ascendant: ascmc[0], // 0 is Ascendant in C Enum
    mc: ascmc[1],
    armc: ascmc[2],
    vertex: ascmc[3],
    equatorialAscendant: ascmc[4],
    coAscendant1: ascmc[5],
    coAscendant2: ascmc[6],
    polarAscendant: ascmc[7]
  };
}
// ==========================================

function hasRetrogradeMotion(longitudeSpeed: number): boolean {
  return Number.isFinite(longitudeSpeed) && longitudeSpeed < -1e-6;
}


export async function calculateBirthChart(birthDate: BirthDate): Promise<BirthChart> {
  const sw = await getSwe();
  
  // Tratamento seguro de datas faltantes ou diferentes do frontend:
  let year, month, day, time;
  
  if (typeof birthDate === 'string') {
    // Caso a API envie como string ISO
    const d = new Date(birthDate);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
      time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  } else if (birthDate && typeof birthDate === 'object') {
    year = birthDate.year;
    month = birthDate.month;
    day = birthDate.day;
    time = birthDate.time;
  }
  
  if (!year || !month || !day || time === undefined || time === null || time === "") {
    throw new Error("Data e hora de nascimento são obrigatórias e não podem ser inferidas.");
  }

  const coordinates = (birthDate && (birthDate as any).coordinates)
    ? (birthDate as any).coordinates
    : undefined;

  if (
    !coordinates ||
    !Number.isFinite(Number(coordinates.latitude)) ||
    !Number.isFinite(Number(coordinates.longitude))
  ) {
    throw new Error("Selecione uma cidade válida na lista antes de gerar o mapa.");
  }

  // O frontend pode enviar HH:mm ou hora decimal (ex.: 06:45 / 6.75).
  // Nao usamos fallback: qualquer valor invalido interrompe o calculo.
  let decimalTime: number;
  if (typeof time === "string" && time.includes(":")) {
    const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/);
    if (!match) throw new Error(`Hora local invalida: ${time}`);
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] ?? 0);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds >= 60) {
      throw new Error(`Hora local fora do intervalo permitido: ${time}`);
    }
    decimalTime = hours + minutes / 60 + seconds / 3600;
  } else {
    decimalTime = Number(time);
    if (!Number.isFinite(decimalTime) || decimalTime < 0 || decimalTime >= 24) {
      throw new Error(`Hora decimal invalida: ${String(time)}`);
    }
  }

  let hh = Math.floor(decimalTime);
  let mm = Math.floor((decimalTime - hh) * 60);
  let ss = Math.round((((decimalTime - hh) * 60) - mm) * 60);
  if (ss === 60) { ss = 0; mm += 1; }
  if (mm === 60) { mm = 0; hh += 1; }
  if (hh >= 24) throw new Error("Hora decimal arredondou para o dia seguinte; forneca hora em HH:mm:ss.");

  let uYear: number, uMonth: number, uDate: number, uHour: number;

  // O fuso deve vir explicitamente da geocodificação/entrada do usuário.
  const determineTimezone = (lat: number, lon: number): string => {
    return resolveTimezone({
      latitude: lat,
      longitude: lon,
      name: (coordinates as CoordinatesLike).name,
      timezone: (coordinates as CoordinatesLike).timezone,
    });
  };

  const zone = determineTimezone(coordinates.latitude, coordinates.longitude);
  
  // Usamos moment-timezone para converter hora local da cidade em UTC real
  // Isso lida automaticamente com Horário de Verão (DST) histórico da região!
  const m = moment.tz(
    `${year}-${month}-${day} ${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`,
    "YYYY-M-D HH:mm:ss",
    true,
    zone
  );

  const dateObj = m.toDate();
  
  if (isNaN(dateObj.getTime()) || !m.isValid()) { 
    throw new Error(`Data/hora inválida para o fuso ${zone}; o motor não usa fallback temporal.`);
  } else {
     uYear = dateObj.getUTCFullYear();
     uMonth = dateObj.getUTCMonth() + 1;
     uDate = dateObj.getUTCDate();
     uHour = dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600;
  }


  // 1 = Calendário Gregoriano e passamos expresso pra evitar bug (void 0).Gregorian da lib
  const jd = sw.julianDay(uYear, uMonth, uDate, uHour, 1);
  
  const planetMapping: { type: PlanetType; swId: number; name: string }[] = [
    { type: "sun", swId: 0, name: "Sol" },
    { type: "moon", swId: 1, name: "Lua" },
    { type: "mercury", swId: 2, name: "Mercúrio" },
    { type: "venus", swId: 3, name: "Vênus" },
    { type: "mars", swId: 4, name: "Marte" },
    { type: "jupiter", swId: 5, name: "Júpiter" },
    { type: "saturn", swId: 6, name: "Saturno" },
    { type: "uranus", swId: 7, name: "Urano" },
    { type: "neptune", swId: 8, name: "Netuno" },
    { type: "pluto", swId: 9, name: "Plutão" },
    { type: "northNode", swId: 11, name: "Nodo Norte" }
  ];

  const planets: Planet[] = [];
  let idCounter = 0;

  for (const p of planetMapping) {
    // 258 = SEFLG_SWIEPH (2) | SEFLG_SPEED (256).
    // 2306 adiciona SEFLG_EQUATORIAL (2048), preservando RA/declinacao na mesma efemeride.
    const pos = safeCalculatePosition(sw, jd, p.swId, 258);
    const equatorial = safeCalculatePosition(sw, jd, p.swId, 2306);
    const isRet = hasRetrogradeMotion(pos.longitudeSpeed);

    planets.push({
      id: idCounter++,
      type: p.type,
      name: p.name,
      longitude: pos.longitude,
      longitudeRaw: pos.longitude,
      longitudeSpeed: pos.longitudeSpeed,
      latitudeRaw: pos.latitude,
      latitudeSpeed: pos.latitudeSpeed,
      distanceRaw: pos.distance,
      rightAscension: equatorial.longitude,
      declination: equatorial.latitude,
      rightAscensionSpeed: equatorial.longitudeSpeed,
      declinationSpeed: equatorial.latitudeSpeed,
      sign: getSignName(pos.longitude),
      antiscion: computeAntiscion(pos.longitude),
      antiscionRaw: computeAntiscion(pos.longitude),
      isRetrograde: isRet,
    });
  }

  // South Node calculation (reflex of north node)
  const northNode = planets.find((p) => p.type === "northNode")!;
  const southNodeLon = (northNode.longitudeRaw + 180) % 360;
  planets.push({
    id: idCounter++,
    type: "southNode",
    name: "Nodo Sul",
    longitude: southNodeLon,
    longitudeRaw: southNodeLon,
    longitudeSpeed: northNode.longitudeSpeed,
    latitudeRaw: northNode.latitudeRaw !== undefined ? -northNode.latitudeRaw : undefined,
    latitudeSpeed: northNode.latitudeSpeed !== undefined ? -northNode.latitudeSpeed : undefined,
    distanceRaw: northNode.distanceRaw,
    rightAscension: northNode.rightAscension !== undefined
      ? (northNode.rightAscension + 180) % 360
      : undefined,
    declination: northNode.declination !== undefined
      ? -northNode.declination
      : undefined,
    rightAscensionSpeed: northNode.rightAscensionSpeed,
    declinationSpeed: northNode.declinationSpeed !== undefined
      ? -northNode.declinationSpeed
      : undefined,
    sign: getSignName(southNodeLon),
    antiscion: computeAntiscion(southNodeLon),
    antiscionRaw: computeAntiscion(southNodeLon),
    isRetrograde: northNode.isRetrograde,
  });

  // Nodo medio e preservado apenas como dado auxiliar; a variante Marcos usa o Nodo verdadeiro.
  const meanNorthNode = safeCalculatePosition(sw, jd, 10, 258);
  const meanSouthNodeLongitude = (meanNorthNode.longitude + 180) % 360;

  const housesCalc = safeCalculateHouses(sw, jd, coordinates.latitude, coordinates.longitude, "R");
  const placidusCalc = safeCalculateHouses(sw, jd, coordinates.latitude, coordinates.longitude, "P");

  // As cuspides retornadas pelo wrapper C sao indexadas de 1 a 12.
  const rawCusps = housesCalc.cusps.slice(1, 13);
  const placidusCusps = placidusCalc.cusps.slice(1, 13);

  const housesData: HousesData = {
    house: rawCusps,
    housesWithSigns: rawCusps.map((h: number) => getSignName(h)),
    ascendant: housesCalc.ascendant,
    mc: housesCalc.mc,
    armc: housesCalc.armc,
    vertex: housesCalc.vertex,
    equatorialAscendant: housesCalc.equatorialAscendant,
    kochCoAscendant: housesCalc.coAscendant1,
    munkaseyCoAscendant: housesCalc.coAscendant1,
    munkaseyPolarAscendant: housesCalc.polarAscendant,
    houseSystem: "Regiomontanus",
    houseSystemCode: "R",
    variants: {
      regiomontanus: {
        system: "Regiomontanus", code: "R", cusps: rawCusps,
        ascendant: housesCalc.ascendant, mc: housesCalc.mc, armc: housesCalc.armc,
        vertex: housesCalc.vertex, equatorialAscendant: housesCalc.equatorialAscendant,
        kochCoAscendant: housesCalc.coAscendant1, munkaseyCoAscendant: housesCalc.coAscendant1,
        munkaseyPolarAscendant: housesCalc.polarAscendant,
      },
      placidus: {
        system: "Placidus", code: "P", cusps: placidusCusps,
        ascendant: placidusCalc.ascendant, mc: placidusCalc.mc, armc: placidusCalc.armc,
        vertex: placidusCalc.vertex, equatorialAscendant: placidusCalc.equatorialAscendant,
        kochCoAscendant: placidusCalc.coAscendant1, munkaseyCoAscendant: placidusCalc.coAscendant1,
        munkaseyPolarAscendant: placidusCalc.polarAscendant,
      },
    },
  };

  const chart: BirthChart = {
    planets,
    housesData,
    birthDate: {
      year, month, day, time, coordinates
    },
    fixedStars: [],
    calculationMetadata: {
      engine: "Swiss Ephemeris",
      enginePackage: "@swisseph/browser",
      enginePackageVersion: "1.1.1",
      julianDayUt: jd,
      utcIso: dateObj.toISOString(),
      timezone: zone,
      zodiac: "Tropical",
      houseSystem: "Regiomontanus",
      houseSystemCode: "R",
      availableHouseSystems: ["Regiomontanus", "Placidus"],
      nodeMode: "Nodo verdadeiro",
      auxiliaryNodes: {
        trueNorthLongitude: northNode.longitudeRaw,
        trueSouthLongitude: southNodeLon,
        meanNorthLongitude: meanNorthNode.longitude,
        meanSouthLongitude: meanSouthNodeLongitude,
      },
      calendar: "Gregoriano",
      ephemerisFlags: ["SEFLG_SWIEPH", "SEFLG_SPEED", "SEFLG_EQUATORIAL"],
      coordinatePrecision:
        coordinates.precision === "exactAddress" ? "endereco"
        : coordinates.precision === "street" ? "rua"
        : coordinates.precision === "locality" ? "cidade"
        : coordinates.precision === "municipality" ? "municipio"
        : normalizeLocationText(coordinates.name).includes("santa casa") ? "endereco"
        : "informada",
      timezoneSource: coordinates.timezoneSource ?? "user",
      locationSource: coordinates.source ?? (coordinates.name ? "legacy" : "manual"),
      locationPrecision: coordinates.precision ?? "coordinates",
    },
  };

  try {
    const starSky = await calculateFullFixedStarSky(chart, sw as any, jd);
    const exactMatches = calculateFixedStarMatchesFromSky(chart, starSky.positions);
    return {
      ...chart,
      fixedStarCatalog: starSky.positions,
      fixedStarCatalogMetadata: starSky.metadata,
      fixedStarMatches: exactMatches,
      fixedStars: buildFixedStarsFromExactMatches(exactMatches),
      calculationMetadata: {
        ...chart.calculationMetadata!,
        ephemerisFlags: [
          ...(chart.calculationMetadata?.ephemerisFlags ?? []),
          `FIXED_STARS_FULL_SKY_${starSky.metadata.calculationMode.toUpperCase()}`,
        ],
      },
    };
  } catch (error) {
    // Legacy fallback is kept only as an emergency path. Crucially, a star-engine
    // failure is explicit in metadata and can no longer masquerade as "no stars".
    console.warn("Full fixed-star sky unavailable; using audited legacy fallback:", error);
    const fallback = decorateChartWithFixedStars(chart, getDecimalYearFromDate(dateObj));
    return {
      ...fallback,
      fixedStarCatalogMetadata: {
        source: "Swiss Ephemeris sefstars.txt",
        rawRecords: 0, uniqueEntries: 0, calculatedEntries: 0, failedEntries: 0,
        calculationMode: "failed",
        astroSeekReferenceMode: "15-major-plus-full-catalog",
        notes: [`FIXED_STAR_ENGINE_FAILURE: ${error instanceof Error ? error.message : String(error)}`],
      },
    };
  }
}
