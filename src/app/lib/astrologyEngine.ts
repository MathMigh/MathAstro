import { SwissEphemeris } from "@swisseph/browser";
import { BirthChart, BirthDate, Planet, HousesData, PlanetType, FixedStar } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";

let swe: SwissEphemeris | null = null;

export async function getSwe(): Promise<SwissEphemeris> {
  if (!swe) {
    swe = new SwissEphemeris();
    await swe.init("https://unpkg.com/@swisseph/browser@1.1.1/dist/swisseph.wasm");
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
  const xx = [];
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
  const cusps = [];
  for (let i = 0; i < 13; i++) {
    cusps[i] = m.getValue(cuspsPtr + i * 8, "double");
  }
  const ascmc = [];
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
  
  if (!year || !month || !day || !time) {
     const d = new Date();
     year = d.getFullYear();
     month = d.getMonth() + 1;
     day = d.getDate();
     time = "12:00"; 
  }

  const coordinates = (birthDate && (birthDate as any).coordinates) ? (birthDate as any).coordinates : { latitude: -22.9, longitude: -43.2 };

  // O frontend Zazastro envia 'time' convertido pra hora decimal (Ex: 06:45 = "6.75")!
  let decimalTime = 12;
  if (typeof time === 'string' && time.includes(':')) {
     const parts = time.split(":");
     decimalTime = (Number(parts[0]) || 0) + (Number(parts[1]) || 0) / 60;
  } else if (time !== undefined && time !== null) {
     decimalTime = Number(time) || 12;
  }
  
  let hh = Math.floor(decimalTime);
  let mm = Math.round((decimalTime - hh) * 60);

  // Format as ISO with -03:00 timezone for Brazil
  const pad = (n: any) => {
    if (n === undefined || n === null || isNaN(n)) return '00';
    return n.toString().padStart(2, '0');
  };
  
  const isoString = `${pad(year)}-${pad(month)}-${pad(day)}T${pad(hh)}:${pad(mm)}:00.000-03:00`;
  const dateObj = new Date(isoString);

  let uYear = dateObj.getUTCFullYear();
  let uMonth = dateObj.getUTCMonth() + 1;
  let uDate = dateObj.getUTCDate();
  let uHour = dateObj.getUTCHours() + dateObj.getUTCMinutes() / 60 + dateObj.getUTCSeconds() / 3600;
  
  if (isNaN(uYear)) { 
     console.error("FALHA AO PARSEAR DATA:", isoString, "Payload recebido:", birthDate);
     uYear = 2000; uMonth = 1; uDate = 1; uHour = 12; 
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
    { type: "northNode", swId: 10, name: "Nodo Norte" }
  ];

  const planets: Planet[] = [];
  let idCounter = 0;

  for (const p of planetMapping) {
    // 258 = SwissEphemeris | Speed flag
    const pos = safeCalculatePosition(sw, jd, p.swId, 258);
    const isRet = pos.longitudeSpeed < 0;
    
    planets.push({
      id: idCounter++,
      type: p.type,
      name: p.name,
      longitude: pos.longitude,
      longitudeRaw: pos.longitude,
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
    sign: getSignName(southNodeLon),
    antiscion: computeAntiscion(southNodeLon),
    antiscionRaw: computeAntiscion(southNodeLon),
    isRetrograde: true,
  });

  const housesCalc = safeCalculateHouses(sw, jd, coordinates.latitude, coordinates.longitude, "R");
  
  // Custom logic usually drops index 0 since cusps are 1-indexed in C
  const rawCusps = housesCalc.cusps.slice(1, 13);
  
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
  };

  const fixedStars: FixedStar[] = [];

  return {
    planets,
    housesData,
    birthDate: {
      year, month, day, time, coordinates
    },
    fixedStars
  };
}
