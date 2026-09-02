import moment from "moment-timezone";
import { calculateReturnChartData } from "../returnEngine";
import { calculateBirthChart } from "../astrologyEngine";
import type { BirthDate, Planet } from "@/interfaces/BirthChartInterfaces";
import type { EngineResult, JyotishContext, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable, createValidation } from "./engineHelpers";
import { buildPlanetaryHourContext, buildSolarDayTimings } from "./astroTimings";

const SIGNS = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrischika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
];

const SIGN_LORDS = [
  "Mangala",
  "Shukra",
  "Budha",
  "Chandra",
  "Surya",
  "Budha",
  "Shukra",
  "Mangala",
  "Guru",
  "Shani",
  "Shani",
  "Guru",
];
const SIGN_LORD_KEYS: Record<number, Planet["type"]> = {
  0: "mars",
  1: "venus",
  2: "mercury",
  3: "moon",
  4: "sun",
  5: "mercury",
  6: "venus",
  7: "mars",
  8: "jupiter",
  9: "saturn",
  10: "saturn",
  11: "jupiter",
};

const WEEKDAY_RULERS = ["Surya", "Chandra", "Mangala", "Budha", "Guru", "Shukra", "Shani"];
const TARGET_PLANETS: Planet["type"][] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];
const HARSHA_HOUSE_MAP: Record<Planet["type"], number> = {
  sun: 9,
  moon: 3,
  mercury: 1,
  venus: 5,
  mars: 6,
  jupiter: 11,
  saturn: 12,
  uranus: 0,
  neptune: 0,
  pluto: 0,
  northNode: 0,
  southNode: 0,
};
const HARSHA_FEMININE_PLANETS = new Set<Planet["type"]>(["moon", "mercury", "venus", "saturn"]);
const HARSHA_MASCULINE_PLANETS = new Set<Planet["type"]>(["sun", "mars", "jupiter"]);
const FEMININE_HOUSES = new Set([1, 2, 3, 7, 8, 9]);
const NAKSHATRA_ARC = 360 / 27;
const TAJIKA_MUDDA_SEQUENCE = ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"] as const;
const TAJIKA_MUDDA_DAYS: Record<(typeof TAJIKA_MUDDA_SEQUENCE)[number], number> = {
  Sun: 18,
  Moon: 30,
  Mars: 21,
  Rahu: 54,
  Jupiter: 48,
  Saturn: 57,
  Mercury: 51,
  Ketu: 21,
  Venus: 60,
};
const TAJIKA_PATYAYINI_MULTIPLIERS: Record<(typeof TAJIKA_MUDDA_SEQUENCE)[number], number> = {
  Sun: 4,
  Moon: 8,
  Mars: 5,
  Rahu: 7,
  Jupiter: 10,
  Saturn: 6,
  Mercury: 9,
  Ketu: 5,
  Venus: 6,
};
const ANNUAL_SCHOOL_CONTESTED_MARGIN = 2;
const BALARAMA_SEQUENCE = [
  { lord: "Sun", days: 20, groupSize: 4, startNakshatraIndex: 5, startNakshatra: "Ardra" },
  { lord: "Moon", days: 50, groupSize: 3, startNakshatraIndex: 9, startNakshatra: "Magha" },
  { lord: "Mars", days: 80 / 3, groupSize: 4, startNakshatraIndex: 12, startNakshatra: "Hasta" },
  { lord: "Mercury", days: 170 / 3, groupSize: 3, startNakshatraIndex: 16, startNakshatra: "Anuradha" },
  { lord: "Saturn", days: 100 / 3, groupSize: 4, startNakshatraIndex: 19, startNakshatra: "Purva Ashadha" },
  { lord: "Jupiter", days: 190 / 3, groupSize: 3, startNakshatraIndex: 22, startNakshatra: "Dhanishtha" },
  { lord: "Rahu", days: 40, groupSize: 4, startNakshatraIndex: 25, startNakshatra: "Uttara Bhadrapada" },
  { lord: "Venus", days: 70, groupSize: 3, startNakshatraIndex: 2, startNakshatra: "Krittika" },
] as const;
const BALARAMA_ORDER = BALARAMA_SEQUENCE.map((entry) => entry.lord);
const BALARAMA_PERIOD_DAYS: Record<TajikaMuddaLord, number> = {
  Sun: 20,
  Moon: 50,
  Mars: 80 / 3,
  Mercury: 170 / 3,
  Saturn: 100 / 3,
  Jupiter: 190 / 3,
  Rahu: 40,
  Ketu: 0,
  Venus: 70,
};
const PLANET_LABELS: Record<Planet["type"], string> = {
  sun: "Surya",
  moon: "Chandra",
  mercury: "Budha",
  venus: "Shukra",
  mars: "Mangala",
  jupiter: "Guru",
  saturn: "Shani",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  northNode: "Rahu",
  southNode: "Ketu",
};
const TAJIKA_LORD_LABELS: Record<string, string> = {
  Sun: "Surya",
  Moon: "Chandra",
  Mars: "Mangala",
  Mercury: "Budha",
  Jupiter: "Guru",
  Venus: "Shukra",
  Saturn: "Shani",
  Rahu: "Rahu",
  Ketu: "Ketu",
};
const TAJIKA_DEEPTAMSHA: Partial<Record<Planet["type"], number>> = {
  sun: 15,
  moon: 12,
  mars: 8,
  mercury: 7,
  jupiter: 9,
  venus: 7,
  saturn: 9,
};
const TAJIKA_ASPECTS = [
  { label: "Conjuncao", angle: 0 },
  { label: "Sextil", angle: 60 },
  { label: "Quadratura", angle: 90 },
  { label: "Trino", angle: 120 },
  { label: "Oposicao", angle: 180 },
] as const;

type TajikaMuddaLord = (typeof TAJIKA_MUDDA_SEQUENCE)[number];
type TajikaMuddaSchool = "Gauri" | "Mahadeva" | "Balarama";

interface PanchadhikariRow {
  role: string;
  planet: string;
  note: string;
}

interface SahamRow {
  name: string;
  sign: ReturnType<typeof siderealSign>;
  lineage: string;
  theme: string;
  formula: string;
  addend: string;
  source: string;
  note: string;
}

interface SahamPriorityRow {
  name: string;
  signName: string;
  degreeInSign: number;
  signLord: string;
  lagnaDistance: number;
  munthaDistance: number;
  lordMatchesVarshesh: boolean;
  lordMatchesMudda: boolean;
  lordMatchesSub: boolean;
  alignmentHits: number;
  score: number;
  lineage: string;
  theme: string;
  note: string;
}

interface SahamLineageRow {
  lineage: string;
  count: number;
  topTheme: string;
  topSaham: string;
  averageScore: number;
  alignmentHits: number;
  note: string;
}

interface HarshaBalaRow {
  planet: string;
  house: number;
  signName: string;
  houseScore: number;
  dignityScore: number;
  houseSexScore: number;
  dayNightScore: number;
  total: number;
  note: string;
}

interface AnnualContactRow {
  fasterKey: Planet["type"];
  faster: string;
  slowerKey: Planet["type"];
  slower: string;
  aspect: string;
  angle: number;
  orb: number;
  orbLimit: number;
  state: string;
  application: "applying" | "separating" | "steady";
  note: string;
}

interface MunthaContactRow {
  planet: string;
  aspect: string;
  orb: number;
  note: string;
}

interface AnnualPlanetPoint {
  key: Planet["type"];
  label: string;
  longitude: number;
  signIndex: number;
  speed: number;
}

interface TajikaYogaRow {
  yoga: string;
  planets: string;
  mediator: string;
  state: string;
  score: number;
  note: string;
}

interface TajikaMuddaPeriodRow {
  school: string;
  lord: TajikaMuddaLord;
  start: string;
  end: string;
  days: number;
  active: boolean;
  segment: "remaining" | "full" | "elapsed";
  note: string;
}

interface TajikaMuddaPeriodState extends TajikaMuddaPeriodRow {
  startMoment: moment.Moment;
  endMoment: moment.Moment;
}

interface TajikaPatyayiniRow {
  school: string;
  maha: TajikaMuddaLord;
  lord: TajikaMuddaLord;
  start: string;
  end: string;
  days: number;
  active: boolean;
  note: string;
}

interface TajikaPatyayiniState extends TajikaPatyayiniRow {
  startMoment: moment.Moment;
  endMoment: moment.Moment;
}

interface TajikaMuddaSystem {
  school: TajikaMuddaSchool;
  firstLord: TajikaMuddaLord;
  periods: TajikaMuddaPeriodState[];
  activePeriod: TajikaMuddaPeriodState;
  subPeriods: TajikaPatyayiniState[];
  activeSubPeriod: TajikaPatyayiniState;
  elapsedGhatis: number;
  remainingGhatis: number;
  note: string;
}

interface MuddaSchoolRankingRow {
  school: TajikaMuddaSchool;
  activeLord: string;
  activeSubLord: string;
  leaderPlanet: string;
  leaderScore: number;
  coherenceScore: number;
  note: string;
}

interface AnnualReturnPayload {
  returnPlanets: Planet[];
  returnHousesData: {
    house: number[];
    ascendant: number;
  };
  returnTime: string;
  timezone: string;
}

interface AnnualReturnResolution {
  payload: AnnualReturnPayload;
  mode: "exact" | "approximate";
  note: string;
  sourceError?: string;
}

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

function normalize180(value: number) {
  const normalized = normalize360(value);
  return normalized > 180 ? normalized - 360 : normalized;
}

function modulo(value: number, base: number) {
  return ((value % base) + base) % base;
}

function isBetweenOnShortArc(target: number, left: number, right: number) {
  const forwardArc = normalize360(right - left);
  const backwardArc = normalize360(left - right);

  if (forwardArc <= backwardArc) {
    return normalize360(target - left) <= forwardArc;
  }

  return normalize360(target - right) <= backwardArc;
}

function decimalHourToTime(value: number) {
  const safe = Number.isFinite(value) ? value : 12;
  const hours = Math.floor(safe);
  const totalSeconds = Math.round((safe - hours) * 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function siderealSign(longitude: number, ayanamshaDegrees: number) {
  const normalized = normalize360(longitude - ayanamshaDegrees);
  const signIndex = Math.floor(normalized / 30) % 12;
  return {
    signIndex,
    signName: SIGNS[signIndex],
    degreeInSign: normalized % 30,
    longitude: normalized,
    lord: SIGN_LORDS[signIndex],
  };
}

function buildAnnualPlanetPoints(planets: Planet[], ayanamshaDegrees: number): AnnualPlanetPoint[] {
  return TARGET_PLANETS
    .map((type) => findPlanet(planets, type))
    .filter((planet): planet is Planet => Boolean(planet))
    .map((planet) => {
      const sidereal = siderealSign(planet.longitude, ayanamshaDegrees);
      return {
        key: planet.type,
        label: PLANET_LABELS[planet.type],
        longitude: sidereal.longitude,
        signIndex: sidereal.signIndex,
        speed: Math.abs(planet.longitudeSpeed ?? 0),
      };
    });
}

function getTajikaOrbLimit(left: Planet["type"], right: Planet["type"]) {
  const leftOrb = TAJIKA_DEEPTAMSHA[left] ?? 0;
  const rightOrb = TAJIKA_DEEPTAMSHA[right] ?? 0;
  return (leftOrb + rightOrb) / 2;
}

function normalizeTajikaLordLabel(lord: string) {
  return TAJIKA_LORD_LABELS[lord] ?? lord;
}

function findBalaramaSegment(nakshatraIndex: number) {
  for (const segment of BALARAMA_SEQUENCE) {
    for (let offset = 0; offset < segment.groupSize; offset += 1) {
      if (modulo(segment.startNakshatraIndex + offset, 27) === nakshatraIndex) {
        return {
          ...segment,
          offsetInGroup: offset,
        };
      }
    }
  }

  return {
    ...BALARAMA_SEQUENCE[0],
    offsetInGroup: 0,
  };
}

function buildBirthDate(snapshot: JyotishContext["primary"], yearOverride?: number): BirthDate {
  const [year, month, day] = snapshot.referenceDate.split("-").map(Number);
  return {
    year: yearOverride ?? year,
    month,
    day,
    time: decimalHourToTime(snapshot.localBirthHour),
    coordinates: {
      name: snapshot.name,
      latitude: snapshot.latitude,
      longitude: snapshot.longitude,
    },
  };
}

async function resolveAnnualReturn(
  natalBirthDate: BirthDate,
  targetBirthDate: BirthDate,
  timezone: string
): Promise<AnnualReturnResolution> {
  try {
    const exact = await calculateReturnChartData(natalBirthDate, targetBirthDate, "solar");
    return {
      payload: {
        returnPlanets: exact.returnPlanets,
        returnHousesData: {
          house: exact.returnHousesData.house,
          ascendant: exact.returnHousesData.ascendant,
        },
        returnTime: exact.returnTime,
        timezone: exact.timezone,
      },
      mode: "exact",
      note: "Retorno solar exato localizado pelo motor de retornos do projeto.",
    };
  } catch (error) {
    const approximateChart = await calculateBirthChart(targetBirthDate);
    const [rawHours, rawMinutes = "00", rawSeconds = "00"] = String(targetBirthDate.time).split(":");
    const returnTime = `${targetBirthDate.year}-${String(targetBirthDate.month).padStart(2, "0")}-${String(targetBirthDate.day).padStart(2, "0")} ${String(rawHours).padStart(2, "0")}:${String(rawMinutes).padStart(2, "0")}:${String(rawSeconds).padStart(2, "0")}`;

    return {
      payload: {
        returnPlanets: approximateChart.planets,
        returnHousesData: {
          house: approximateChart.housesData.house,
          ascendant: approximateChart.housesData.ascendant,
        },
        returnTime,
        timezone,
      },
      mode: "approximate",
      note:
        "Retorno solar exato indisponivel; o modulo caiu para a carta do aniversario civil na mesma localidade e hora natal, mantendo o ano operacional auditavel.",
      sourceError: (error as Error)?.message ?? "erro desconhecido",
    };
  }
}

function findPlanet(planets: Planet[], type: Planet["type"]) {
  return planets.find((planet) => planet.type === type);
}

function findSignLordLongitude(
  planets: Planet[],
  longitude: number,
  ayanamshaDegrees: number
) {
  const sign = siderealSign(longitude, ayanamshaDegrees);
  const lordKey = SIGN_LORD_KEYS[sign.signIndex];
  return findPlanet(planets, lordKey)?.longitude ?? longitude;
}

function buildReturnContext(returnTime: string, timezone: string) {
  const zoned = moment.tz(returnTime, "YYYY-MM-DD HH:mm:ss", timezone);
  return {
    year: zoned.year(),
    month: zoned.month() + 1,
    day: zoned.date(),
    decimalHour:
      zoned.hour() + zoned.minute() / 60 + zoned.second() / 3600,
    weekdayIndex: zoned.day(),
  };
}

function buildPanchadhikariRows(
  natalLagnaLord: string,
  varshaLagnaLord: string,
  munthaLord: string,
  weekdayLord: string,
  hourLord: string
): PanchadhikariRow[] {
  return [
    { role: "Varsha Lagna lord", planet: varshaLagnaLord, note: "Senhor do ascendente do retorno anual." },
    { role: "Muntha lord", planet: munthaLord, note: "Senhor do signo onde cai a Muntha no ano." },
    { role: "Weekday ruler", planet: weekdayLord, note: "Regente do dia do retorno solar." },
    { role: "Hora ruler", planet: hourLord, note: "Regente da hora planetaria do retorno." },
    { role: "Natal Lagna lord", planet: natalLagnaLord, note: "Senhor do Lagna do mapa-base." },
  ];
}

function chooseVarsheshCandidate(rows: Array<{ role: string; planet: string; note: string }>) {
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.planet] = (acc[row.planet] ?? 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  return sorted[0]?.[0] ?? rows[0]?.planet ?? "--";
}

function buildMunthaProgression(selectedYear: number, natalYear: number, ascendantSignIndex: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const year = selectedYear - 2 + index;
    const age = year - natalYear;
    const signIndex = ((ascendantSignIndex + age) % 12 + 12) % 12;
    const house = ((age % 12) + 12) % 12 + 1;

    return {
      year,
      signName: SIGNS[signIndex],
      house,
      lord: SIGN_LORDS[signIndex],
      active: year === selectedYear,
    };
  });
}

function buildPunyaSaham(
  ascendantLongitude: number,
  sunLongitude: number,
  moonLongitude: number,
  isDay: boolean,
  ayanamshaDegrees: number
) {
  const raw = buildProjectedSahamaLongitude(
    isDay ? sunLongitude : moonLongitude,
    isDay ? moonLongitude : sunLongitude,
    ascendantLongitude
  );
  return siderealSign(raw, ayanamshaDegrees);
}

function isProjectionReferenceBetween(
  subtrahendLongitude: number,
  minuendLongitude: number,
  referenceLongitude: number
) {
  const arc = normalize360(minuendLongitude - subtrahendLongitude);
  const referenceArc = normalize360(referenceLongitude - subtrahendLongitude);
  return referenceArc <= arc;
}

function buildProjectedSahamaLongitude(
  minuendLongitude: number,
  subtrahendLongitude: number,
  addendLongitude: number,
  correctionReferenceLongitude = addendLongitude
) {
  let raw = normalize360(minuendLongitude - subtrahendLongitude + addendLongitude);
  if (!isProjectionReferenceBetween(subtrahendLongitude, minuendLongitude, correctionReferenceLongitude)) {
    raw = normalize360(raw + 30);
  }
  return raw;
}

function buildSahamRow(
  name: string,
  rawLongitude: number,
  ayanamshaDegrees: number,
  lineage: string,
  theme: string,
  formula: string,
  addend: string,
  source: string,
  note: string
): SahamRow {
  return {
    name,
    sign: siderealSign(rawLongitude, ayanamshaDegrees),
    lineage,
    theme,
    formula,
    addend,
    source,
    note,
  };
}

function buildAdditionalSahams(
  ascendantLongitude: number,
  sunLongitude: number,
  moonLongitude: number,
  jupiterLongitude: number,
  venusLongitude: number,
  saturnLongitude: number,
  mercuryLongitude: number,
  marsLongitude: number,
  lagnaLordLongitude: number,
  secondHouseLongitude: number,
  secondLordLongitude: number,
  sixthHouseLongitude: number,
  ninthHouseLongitude: number,
  ninthLordLongitude: number,
  sunSignLordLongitude: number,
  moonSignLordLongitude: number,
  isDay: boolean,
  ayanamshaDegrees: number
): SahamRow[] {
  const lagnaLordKey = SIGN_LORD_KEYS[siderealSign(ascendantLongitude, ayanamshaDegrees).signIndex];
  const lagnaLordIsMoon = lagnaLordKey === "moon";
  const punyaRaw = buildProjectedSahamaLongitude(
    isDay ? sunLongitude : moonLongitude,
    isDay ? moonLongitude : sunLongitude,
    ascendantLongitude
  );
  const vidyaRaw = buildProjectedSahamaLongitude(
    isDay ? moonLongitude : sunLongitude,
    isDay ? sunLongitude : moonLongitude,
    ascendantLongitude
  );
  const mahatmyaRaw = buildProjectedSahamaLongitude(
    isDay ? punyaRaw : marsLongitude,
    isDay ? marsLongitude : punyaRaw,
    ascendantLongitude
  );
  const yashaRaw = buildProjectedSahamaLongitude(
    isDay ? jupiterLongitude : punyaRaw,
    isDay ? punyaRaw : jupiterLongitude,
    ascendantLongitude
  );
  const mitraRaw = buildProjectedSahamaLongitude(
    isDay ? vidyaRaw : punyaRaw,
    isDay ? punyaRaw : vidyaRaw,
    venusLongitude,
    venusLongitude
  );
  const sutaRaw = buildProjectedSahamaLongitude(
    jupiterLongitude,
    moonLongitude,
    ascendantLongitude
  );
  const rajyaRaw = buildProjectedSahamaLongitude(
    isDay ? saturnLongitude : sunLongitude,
    isDay ? sunLongitude : saturnLongitude,
    ascendantLongitude
  );
  const karmanRaw = buildProjectedSahamaLongitude(
    isDay ? marsLongitude : mercuryLongitude,
    isDay ? mercuryLongitude : marsLongitude,
    ascendantLongitude
  );
  const rogaRaw = buildProjectedSahamaLongitude(
    ascendantLongitude,
    moonLongitude,
    ascendantLongitude
  );
  const manmathaRaw = lagnaLordIsMoon
    ? buildProjectedSahamaLongitude(sunLongitude, moonLongitude, ascendantLongitude)
    : buildProjectedSahamaLongitude(
        isDay ? moonLongitude : lagnaLordLongitude,
        isDay ? lagnaLordLongitude : moonLongitude,
        ascendantLongitude
      );
  const shastraRaw = buildProjectedSahamaLongitude(
    isDay ? jupiterLongitude : saturnLongitude,
    isDay ? saturnLongitude : jupiterLongitude,
    mercuryLongitude,
    mercuryLongitude
  );
  const bandhuRaw = buildProjectedSahamaLongitude(
    mercuryLongitude,
    moonLongitude,
    ascendantLongitude
  );
  const deshantaraRaw = buildProjectedSahamaLongitude(
    ninthHouseLongitude,
    ninthLordLongitude,
    ascendantLongitude
  );
  const arthaRaw = buildProjectedSahamaLongitude(
    secondHouseLongitude,
    secondLordLongitude,
    ascendantLongitude
  );
  const karyasiddhiRaw = buildProjectedSahamaLongitude(
    saturnLongitude,
    isDay ? sunLongitude : moonLongitude,
    isDay ? sunSignLordLongitude : moonSignLordLongitude,
    isDay ? sunSignLordLongitude : moonSignLordLongitude
  );
  const vivahaRaw = buildProjectedSahamaLongitude(
    venusLongitude,
    saturnLongitude,
    ascendantLongitude
  );
  const santapaRaw = buildProjectedSahamaLongitude(
    saturnLongitude,
    moonLongitude,
    sixthHouseLongitude,
    sixthHouseLongitude
  );
  const buddhiRaw = buildProjectedSahamaLongitude(
    isDay ? jupiterLongitude : sunLongitude,
    isDay ? sunLongitude : jupiterLongitude,
    ascendantLongitude
  );
  const prasutiRaw = buildProjectedSahamaLongitude(
    isDay ? jupiterLongitude : mercuryLongitude,
    isDay ? mercuryLongitude : jupiterLongitude,
    ascendantLongitude
  );
  const shraddhaRaw = buildProjectedSahamaLongitude(
    venusLongitude,
    marsLongitude,
    ascendantLongitude
  );
  const ripuRaw = buildProjectedSahamaLongitude(
    isDay ? marsLongitude : saturnLongitude,
    isDay ? saturnLongitude : marsLongitude,
    ascendantLongitude
  );

  return [
    buildSahamRow(
      "Punya Saham",
      punyaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Merit and fortune",
      isDay ? "Sun - Moon + Asc" : "Moon - Sun + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.2",
      "Punya/Fortuna anual com a correcao de um signo referida ao ascendente, seguindo a linha defendida por Balabhadra."
    ),
    buildSahamRow(
      "Vidya Saham",
      vidyaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Learning and study",
      isDay ? "Moon - Sun + Asc" : "Sun - Moon + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Vidya/Learning anual tratada como reverso do Punya, em vez de duplicar a mesma formula."
    ),
    buildSahamRow(
      "Mahatmya Saham",
      mahatmyaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Honor and stature",
      isDay ? "Punya - Mars + Asc" : "Mars - Punya + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Mahatmya/Greatness anual deriva do Punya e ajuda a distinguir projeção de honra da mera fama."
    ),
    buildSahamRow(
      "Yasha Saham",
      yashaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Recognition and reputation",
      isDay ? "Jupiter - Punya + Asc" : "Punya - Jupiter + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Yasha/Renown anual projetado a partir do Punya propriamente calculado."
    ),
    buildSahamRow(
      "Mitra Saham",
      mitraRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Alliances and friendships",
      isDay ? "Vidya - Punya + Venus" : "Punya - Vidya + Venus",
      "Venus do retorno",
      "Samjnatantra via Hayanaratna 4.3",
      "Mitra/Friends anual usa Venus como addend e como referencia da correcao."
    ),
    buildSahamRow(
      "Suta Saham",
      sutaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Children and creativity",
      "Jupiter - Moon + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Suta/Children anual entra para cruzar filhos, criatividade e 5a casa."
    ),
    buildSahamRow(
      "Rajya Saham",
      rajyaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Authority and office",
      isDay ? "Saturn - Sun + Asc" : "Sun - Saturn + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Rajya/Authority anual abre governo, posto, mandato e capacidade de comando pelo retorno."
    ),
    buildSahamRow(
      "Karman Saham",
      karmanRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Work and execution",
      isDay ? "Mars - Mercury + Asc" : "Mercury - Mars + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Karman/Work anual segue a inversao dia-noite da fonte."
    ),
    buildSahamRow(
      "Roga Saham",
      rogaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Illness and strain",
      "Asc - Moon + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Roga/Illness anual parte do ascendente menos Lua, mantendo a mesma projecao em qualquer horario."
    ),
    buildSahamRow(
      "Manmatha Saham",
      manmathaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Desire and attraction",
      lagnaLordIsMoon
        ? "Sun - Moon + Asc"
        : isDay
          ? "Moon - lord(Asc) + Asc"
          : "lord(Asc) - Moon + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      lagnaLordIsMoon
        ? "Manmatha/Desire anual usa a excecao classica em que a Lua rege o ascendente."
        : "Manmatha/Desire anual cruza a Lua com o senhor do ascendente anual no sentido dia-noite da fonte."
    ),
    buildSahamRow(
      "Shastra Saham",
      shastraRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Doctrine and instruction",
      isDay ? "Jupiter - Saturn + Mercury" : "Saturn - Jupiter + Mercury",
      "Mercurio do retorno",
      "Samjnatantra via Hayanaratna 4.3",
      "Shastra/Instruction anual projeta o arco sobre Mercurio, nao sobre o ascendente."
    ),
    buildSahamRow(
      "Bandhu Saham",
      bandhuRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Kinship and support",
      "Mercury - Moon + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Bandhu/Kinsmen anual ajuda a abrir parentes, alianças e círculo de apoio imediato."
    ),
    buildSahamRow(
      "Deshantara Saham",
      deshantaraRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Travel and foreign lands",
      "9th cusp - 9th lord + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Deshantara/Foreign lands anual usa a 9a casa da revolucao e seu senhor."
    ),
    buildSahamRow(
      "Vivaha Saham",
      vivahaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Marriage and union",
      "Venus - Saturn + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Vivaha/Marriage anual agora fica constante nos dois hemisferios do dia, como na fonte."
    ),
    buildSahamRow(
      "Artha Saham",
      arthaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Wealth and resources",
      "2nd cusp - 2nd lord + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Artha/Wealth anual mantem 2a casa menos seu senhor, sem inversao dia-noite."
    ),
    buildSahamRow(
      "Karyasiddhi Saham",
      karyasiddhiRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Success and completion",
      isDay ? "Saturn - Sun + lord(Sun sign)" : "Saturn - Moon + lord(Moon sign)",
      isDay ? "Senhor do signo do Sol anual" : "Senhor do signo da Lua anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Karyasiddhi/Success anual usa um addend especifico e a correcao de um signo referida a esse projetor."
    ),
    buildSahamRow(
      "Santapa Saham",
      santapaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Affliction and pressure",
      "Saturn - Moon + 6th cusp",
      "6a casa anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Santapa/Affliction anual projeta desde a 6a casa, nao desde o ascendente."
    ),
    buildSahamRow(
      "Buddhi Saham",
      buddhiRaw,
      ayanamshaDegrees,
      "Tajika-muktavali / Hayanaratna",
      "Understanding and judgment",
      isDay ? "Jupiter - Sun + Asc" : "Sun - Jupiter + Asc",
      "Ascendente anual",
      "Tajika-muktavali via Hayanaratna 4.3",
      "Buddhi/Understanding anual complementa Vidya com formula propria de Tajika-muktavali."
    ),
    buildSahamRow(
      "Prasuti Saham",
      prasutiRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Birth and emergence",
      isDay ? "Jupiter - Mercury + Asc" : "Mercury - Jupiter + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Prasuti/Birth anual entra como ponto adicional para geracao, entregas e processos de surgimento."
    ),
    buildSahamRow(
      "Shraddha Saham",
      shraddhaRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Faith and observance",
      "Venus - Mars + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Shraddha/Faith anual usa Venus e Mars sem reversao, preservando a projecao classica sobre o ascendente."
    ),
    buildSahamRow(
      "Ripu Saham",
      ripuRaw,
      ayanamshaDegrees,
      "Samjnatantra / Hayanaratna",
      "Enemies and contest",
      isDay ? "Mars - Saturn + Asc" : "Saturn - Mars + Asc",
      "Ascendente anual",
      "Samjnatantra via Hayanaratna 4.3",
      "Ripu/Enemy anual separa hostilidade e oposicao da leitura mais geral de Karyasiddhi ou Santapa."
    ),
  ];
}

function buildHarshaBalaRows(
  planets: Planet[],
  ayanamshaDegrees: number,
  varshaLagnaSignIndex: number,
  isDay: boolean
): HarshaBalaRow[] {
  const ownSigns: Partial<Record<Planet["type"], number[]>> = {
    sun: [4],
    moon: [3],
    mars: [0, 7],
    mercury: [2, 5],
    jupiter: [8, 11],
    venus: [1, 6],
    saturn: [9, 10],
  };
  const exaltationSigns: Partial<Record<Planet["type"], number>> = {
    sun: 0,
    moon: 1,
    mars: 9,
    mercury: 5,
    jupiter: 3,
    venus: 11,
    saturn: 6,
  };

  return TARGET_PLANETS.map((type) => findPlanet(planets, type))
    .filter((planet): planet is Planet => Boolean(planet))
    .map((planet) => {
      const sign = siderealSign(planet.longitude, ayanamshaDegrees);
      const house = ((sign.signIndex - varshaLagnaSignIndex + 12) % 12) + 1;
      const houseScore = HARSHA_HOUSE_MAP[planet.type] === house ? 5 : 0;
      const dignityScore =
        exaltationSigns[planet.type] === sign.signIndex || ownSigns[planet.type]?.includes(sign.signIndex)
          ? 5
          : 0;
      const houseSexScore =
        (HARSHA_FEMININE_PLANETS.has(planet.type) && FEMININE_HOUSES.has(house)) ||
        (HARSHA_MASCULINE_PLANETS.has(planet.type) && !FEMININE_HOUSES.has(house))
          ? 5
          : 0;
      const dayNightScore =
        (isDay && HARSHA_MASCULINE_PLANETS.has(planet.type)) ||
        (!isDay && HARSHA_FEMININE_PLANETS.has(planet.type))
          ? 5
          : 0;
      const total = houseScore + dignityScore + houseSexScore + dayNightScore;

      return {
        planet: PLANET_LABELS[planet.type],
        house,
        signName: sign.signName,
        houseScore,
        dignityScore,
        houseSexScore,
        dayNightScore,
        total,
        note:
          total >= 15
            ? "Forca anual muito alta no working set Tajika."
            : total >= 10
              ? "Forca anual boa para cruzar com Mudda, Muntha e contatos."
              : total >= 5
                ? "Forca anual media, pedindo apoio de outros indicadores."
                : "Forca anual baixa neste recorte de Harsha Bala.",
      };
    });
}

function buildAnnualAspects(points: AnnualPlanetPoint[]): AnnualContactRow[] {
  const contacts: AnnualContactRow[] = [];

  for (let leftIndex = 0; leftIndex < points.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < points.length; rightIndex += 1) {
      const first = points[leftIndex];
      const second = points[rightIndex];
      const faster = first.speed >= second.speed ? first : second;
      const slower = faster === first ? second : first;
      const fasterTomorrow = normalize360(faster.longitude + faster.speed);
      const slowerTomorrow = normalize360(slower.longitude + slower.speed);
      const separationNow = Math.abs(normalize180(slower.longitude - faster.longitude));
      const separationTomorrow = Math.abs(normalize180(slowerTomorrow - fasterTomorrow));
      const nearestAspect = TAJIKA_ASPECTS.reduce<{
        aspect: (typeof TAJIKA_ASPECTS)[number];
        orb: number;
      }>(
        (best, aspect) => {
          const orb = Math.abs(separationNow - aspect.angle);
          if (orb < best.orb) {
            return { aspect, orb };
          }
          return best;
        },
        { aspect: TAJIKA_ASPECTS[0], orb: Number.POSITIVE_INFINITY }
      );
      const orbTomorrow = Math.abs(separationTomorrow - nearestAspect.aspect.angle);
      const orbLimit = getTajikaOrbLimit(faster.key, slower.key);

      if (nearestAspect.orb > orbLimit) {
        continue;
      }

      const application =
        orbTomorrow < nearestAspect.orb
          ? "applying"
          : orbTomorrow > nearestAspect.orb
            ? "separating"
            : "steady";

      contacts.push({
        fasterKey: faster.key,
        faster: faster.label,
        slowerKey: slower.key,
        slower: slower.label,
        aspect: nearestAspect.aspect.label,
        angle: nearestAspect.aspect.angle,
        orb: nearestAspect.orb,
        orbLimit,
        state:
          application === "applying"
            ? "Ithasala candidato"
            : application === "separating"
              ? "Easarpha candidata"
              : "Contato estavel",
        application,
        note:
          application === "applying"
            ? `Contato dentro do deeptamsha medio (${orbLimit.toFixed(2)}deg) e em aproximacao no passo seguinte do motor.`
            : application === "separating"
              ? `Contato dentro do deeptamsha medio (${orbLimit.toFixed(2)}deg), mas ja separando no passo seguinte do motor.`
              : `Contato dentro do deeptamsha medio (${orbLimit.toFixed(2)}deg) sem variacao relevante no passo seguinte do motor.`,
      });
    }
  }

  return contacts.sort((left, right) => left.orb - right.orb);
}

function buildMunthaContacts(
  planets: Planet[],
  munthaLongitude: number,
  ayanamshaDegrees: number
): MunthaContactRow[] {
  const contacts = TARGET_PLANETS
    .map((type) => findPlanet(planets, type))
    .filter((planet): planet is Planet => Boolean(planet))
    .map((planet) => {
      const sidereal = siderealSign(planet.longitude, ayanamshaDegrees).longitude;
      const separation = Math.abs(normalize180(munthaLongitude - sidereal));
      const aspectWindows = [
        { label: "Conjuncao", angle: 0, orb: 8 },
        { label: "Sextil", angle: 60, orb: 5 },
        { label: "Quadratura", angle: 90, orb: 6 },
        { label: "Trino", angle: 120, orb: 6 },
        { label: "Oposicao", angle: 180, orb: 8 },
      ];
      const hit = aspectWindows.find((aspect) => Math.abs(separation - aspect.angle) <= aspect.orb);

      if (!hit) {
        return undefined;
      }

      return {
        planet: PLANET_LABELS[planet.type],
        aspect: hit.label,
        orb: Math.abs(separation - hit.angle),
        note:
          hit.angle === 0
            ? "Contato direto com a Muntha, util para cruzar ativacao anual e tema do planeta."
            : "Contato angular com a Muntha dentro do working set anual desta versao.",
      };
    })
    .filter(Boolean) as MunthaContactRow[];

  return contacts.sort((left, right) => left.orb - right.orb).slice(0, 8);
}

function buildTajikaYogaRows(
  points: AnnualPlanetPoint[],
  annualContacts: AnnualContactRow[],
  varshaLagnaLord: string,
  munthaLord: string
) {
  const keyPlanets = new Set([varshaLagnaLord, munthaLord]);
  const pointByKey = new Map(points.map((point) => [point.key, point]));
  const contactKey = (left: Planet["type"], right: Planet["type"]) => [left, right].sort().join("|");
  const directContacts = new Map<string, AnnualContactRow>();

  annualContacts.forEach((contact) => {
    directContacts.set(contactKey(contact.fasterKey, contact.slowerKey), contact);
  });

  const rows: TajikaYogaRow[] = [];

  for (let leftIndex = 0; leftIndex < points.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < points.length; rightIndex += 1) {
      const first = points[leftIndex];
      const second = points[rightIndex];
      const direct = directContacts.get(contactKey(first.key, second.key));

      if (!direct) {
        for (const mediator of points) {
          if (mediator.key === first.key || mediator.key === second.key) {
            continue;
          }

          const toFirst = directContacts.get(contactKey(mediator.key, first.key));
          const toSecond = directContacts.get(contactKey(mediator.key, second.key));

          if (!toFirst || !toSecond) {
            continue;
          }

          const between = isBetweenOnShortArc(mediator.longitude, first.longitude, second.longitude);
          if (!between) {
            continue;
          }

          const relevance =
            (keyPlanets.has(first.label) ? 1 : 0) +
            (keyPlanets.has(second.label) ? 1 : 0) +
            (keyPlanets.has(mediator.label) ? 1 : 0);
          const avgOrb = (toFirst.orb + toSecond.orb) / 2;
          const state = toFirst.application === "applying" || toSecond.application === "applying" ? "Ativa" : "Mista";

          if (mediator.speed > first.speed && mediator.speed > second.speed) {
            rows.push({
              yoga: "Nakta",
              planets: `${first.label} <-> ${second.label}`,
              mediator: mediator.label,
              state,
              score: Number((relevance * 3 + Math.max(0, 12 - avgOrb)).toFixed(2)),
              note:
                `${mediator.label} funciona como mediador mais rapido entre dois planetas sem contato direto; o working set exige contato com ambos dentro do deeptamsha e mediador no arco curto entre eles.`,
            });
          }

          if (mediator.speed < first.speed && mediator.speed < second.speed) {
            rows.push({
              yoga: "Yamaya",
              planets: `${first.label} <-> ${second.label}`,
              mediator: mediator.label,
              state,
              score: Number((relevance * 3 + Math.max(0, 12 - avgOrb)).toFixed(2)),
              note:
                `${mediator.label} funciona como mediador mais lento entre dois planetas sem contato direto; o working set usa o mesmo gate de deeptamsha e arco curto da rede anual.`,
            });
          }
        }
      }

      if (direct && direct.application === "applying" && first.key !== "moon" && second.key !== "moon") {
        const moon = pointByKey.get("moon");
        if (!moon) {
          continue;
        }

        const moonToFirst = directContacts.get(contactKey("moon", first.key));
        const moonToSecond = directContacts.get(contactKey("moon", second.key));

        if (!moonToFirst && !moonToSecond) {
          continue;
        }

        const moonRelevance =
          (keyPlanets.has(first.label) ? 1 : 0) +
          (keyPlanets.has(second.label) ? 1 : 0) +
          (moon.signIndex === 1 || moon.signIndex === 3 ? 2 : moon.signIndex === 7 ? 0 : 1);
        const moonState =
          moonToFirst && moonToSecond ? "Dupla" : moonToFirst || moonToSecond ? "Simples" : "Ausente";

        rows.push({
          yoga: "Kamboola",
          planets: `${first.label} <-> ${second.label}`,
          mediator: "Chandra",
          state: moonState,
          score: Number(
            (
              moonRelevance * 3 +
              Math.max(0, 12 - direct.orb) +
              (moonToFirst && moonToSecond ? 3 : 1)
            ).toFixed(2)
          ),
          note:
            `Chandra se junta a uma Ithasala entre ${first.label} e ${second.label}; o working set marca como dupla quando a Lua toca os dois polos e simples quando toca apenas um.`,
        });
      }
    }
  }

  return rows
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.yoga.localeCompare(right.yoga);
    })
    .slice(0, 8);
}

function buildVarsheshRanking(
  rows: PanchadhikariRow[],
  harshaBalaRows: HarshaBalaRow[],
  annualContacts: AnnualContactRow[],
  munthaContacts: MunthaContactRow[],
  activeMuddaLord: string,
  activePatyayiniLord: string
) {
  const planets = Array.from(new Set(rows.map((row) => row.planet)));

  const ranked = planets
    .map((planet) => {
      const roles = rows.filter((row) => row.planet === planet).map((row) => row.role);
      const harsha = harshaBalaRows.find((row) => row.planet === planet);
      const contacts = annualContacts.filter((row) => row.faster === planet || row.slower === planet);
      const ithasalaCount = contacts.filter((row) => row.state === "Ithasala candidato").length;
      const easarphaCount = contacts.filter((row) => row.state === "Easarpha candidata").length;
      const munthaHit = munthaContacts.find((row) => row.planet === planet);
      const muddaActive = normalizeTajikaLordLabel(activeMuddaLord) === planet;
      const patyayiniActive = normalizeTajikaLordLabel(activePatyayiniLord) === planet;
      const score =
        roles.length * 5 +
        (harsha?.total ?? 0) +
        ithasalaCount * 3 +
        easarphaCount +
        (munthaHit ? Math.max(0, 8 - munthaHit.orb) : 0) +
        (muddaActive ? 4 : 0) +
        (patyayiniActive ? 2 : 0);

      return {
        planet,
        roles,
        hits: roles.length,
        harshaTotal: harsha?.total ?? 0,
        ithasalaCount,
        easarphaCount,
        munthaAspect: munthaHit?.aspect ?? "--",
        munthaOrb: munthaHit?.orb ?? Number.NaN,
        muddaActive,
        patyayiniActive,
        score: Number(score.toFixed(2)),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.hits !== left.hits) {
        return right.hits - left.hits;
      }
      if (right.harshaTotal !== left.harshaTotal) {
        return right.harshaTotal - left.harshaTotal;
      }
      if (right.ithasalaCount !== left.ithasalaCount) {
        return right.ithasalaCount - left.ithasalaCount;
      }
      return left.planet.localeCompare(right.planet);
    });

  return {
    ranked,
    leader: ranked[0] ?? {
      planet: "--",
      roles: [],
      hits: 0,
      harshaTotal: 0,
      ithasalaCount: 0,
      easarphaCount: 0,
      munthaAspect: "--",
      munthaOrb: Number.NaN,
      muddaActive: false,
      patyayiniActive: false,
      score: 0,
    },
  };
}

function buildAnnualSchoolContextScore(
  system: TajikaMuddaSystem,
  rows: PanchadhikariRow[],
  harshaBalaRows: HarshaBalaRow[],
  annualContacts: AnnualContactRow[],
  munthaContacts: MunthaContactRow[],
  varshaLagnaLord: string,
  munthaLord: string
) {
  const muddaPlanet = normalizeTajikaLordLabel(system.activePeriod.lord);
  const subPlanet = normalizeTajikaLordLabel(system.activeSubPeriod.lord);
  const muddaRoleHits = rows.filter((row) => row.planet === muddaPlanet).length;
  const subRoleHits = rows.filter((row) => row.planet === subPlanet).length;
  const muddaHarsha = harshaBalaRows.find((row) => row.planet === muddaPlanet)?.total ?? 0;
  const subHarsha = harshaBalaRows.find((row) => row.planet === subPlanet)?.total ?? 0;
  const muddaMuntha = munthaContacts.find((row) => row.planet === muddaPlanet);
  const subMuntha = munthaContacts.find((row) => row.planet === subPlanet);
  const muddaIthasalaCount = annualContacts.filter(
    (row) => row.state === "Ithasala candidato" && (row.faster === muddaPlanet || row.slower === muddaPlanet)
  ).length;
  const subIthasalaCount = annualContacts.filter(
    (row) => row.state === "Ithasala candidato" && (row.faster === subPlanet || row.slower === subPlanet)
  ).length;
  const muddaMatchesVarsha = muddaPlanet === varshaLagnaLord;
  const muddaMatchesMuntha = muddaPlanet === munthaLord;
  const subMatchesVarsha = subPlanet === varshaLagnaLord;
  const subMatchesMuntha = subPlanet === munthaLord;

  const score = Number(
    (
      muddaRoleHits * 1.5 +
      subRoleHits * 0.75 +
      muddaHarsha / 5 +
      subHarsha / 10 +
      (muddaMatchesVarsha ? 2 : 0) +
      (muddaMatchesMuntha ? 2 : 0) +
      (subMatchesVarsha ? 1 : 0) +
      (subMatchesMuntha ? 1 : 0) +
      (muddaMuntha ? Math.max(0, 6 - muddaMuntha.orb) / 2 : 0) +
      (subMuntha ? Math.max(0, 6 - subMuntha.orb) / 4 : 0) +
      muddaIthasalaCount * 0.75 +
      subIthasalaCount * 0.35
    ).toFixed(2)
  );

  const notes = [
    muddaRoleHits > 0 ? `${muddaPlanet} segura ${muddaRoleHits} papel(is) de Panchadhikari.` : "",
    subRoleHits > 0 ? `${subPlanet} reaparece em ${subRoleHits} papel(is) de apoio.` : "",
    muddaMatchesVarsha ? `${muddaPlanet} coincide com o senhor do Varsha Lagna.` : "",
    muddaMatchesMuntha ? `${muddaPlanet} coincide com o senhor da Muntha.` : "",
    subMatchesVarsha ? `${subPlanet} reforca o senhor do Varsha Lagna pelo subperiodo.` : "",
    subMatchesMuntha ? `${subPlanet} reforca a Muntha pelo subperiodo.` : "",
    muddaMuntha ? `${muddaPlanet} toca a Muntha por ${muddaMuntha.aspect} a ${muddaMuntha.orb.toFixed(2)}deg.` : "",
    muddaIthasalaCount > 0 ? `${muddaPlanet} entra em ${muddaIthasalaCount} Ithasala anual(is).` : "",
  ].filter(Boolean);

  return {
    score,
    note:
      notes.join(" ") ||
      "Sem reforco extra claro por Panchadhikari, Muntha, Harsha Bala ou alinhamento direto com o ascendente anual.",
  };
}

function buildMuddaSchoolRanking(
  systems: TajikaMuddaSystem[],
  rows: PanchadhikariRow[],
  harshaBalaRows: HarshaBalaRow[],
  annualContacts: AnnualContactRow[],
  munthaContacts: MunthaContactRow[],
  sahams: SahamRow[],
  varshaLagnaLongitude: number,
  munthaLongitude: number,
  varshaLagnaLord: string,
  munthaLord: string
) {
  const ranked = systems
    .map((system) => {
      const ranking = buildVarsheshRanking(
        rows,
        harshaBalaRows,
        annualContacts,
        munthaContacts,
        system.activePeriod.lord,
        system.activeSubPeriod.lord
      );
      const muddaPlanet = normalizeTajikaLordLabel(system.activePeriod.lord);
      const subPlanet = normalizeTajikaLordLabel(system.activeSubPeriod.lord);
      const muddaSupportsLeader = ranking.leader.planet === muddaPlanet;
      const subSupportsLeader = ranking.leader.planet === subPlanet;
      const contextWeight = buildAnnualSchoolContextScore(
        system,
        rows,
        harshaBalaRows,
        annualContacts,
        munthaContacts,
        varshaLagnaLord,
        munthaLord
      );
      const sahamPriority = buildSahamPriorityRows(
        sahams,
        varshaLagnaLongitude,
        munthaLongitude,
        ranking.leader.planet,
        muddaPlanet,
        subPlanet
      );
      const sahamSupportRows = sahamPriority.rows.slice(0, 3);
      const sahamSupportScore = Number(
        (
          sahamSupportRows.reduce((sum, row) => sum + row.score, 0) /
          Math.max(sahamSupportRows.length * 4, 1)
        ).toFixed(2)
      );
      const coherenceScore = Number(
        (
          ranking.leader.score +
          (muddaSupportsLeader ? 3 : 0) +
          (subSupportsLeader ? 1.5 : 0) +
          (system.activePeriod.segment === "remaining" ? 0.5 : 0) +
          contextWeight.score +
          sahamSupportScore
        ).toFixed(2)
      );

      return {
        school: system.school,
        activeLord: muddaPlanet,
        activeSubLord: subPlanet,
        leaderPlanet: ranking.leader.planet,
        leaderScore: ranking.leader.score,
        coherenceScore,
        note:
          `${system.note} Lider anual por esse recorte: ${ranking.leader.planet} (${ranking.leader.score.toFixed(2)} pts).` +
          `${muddaSupportsLeader ? " Mudda ativo reforca diretamente o lider anual." : ""}` +
          `${subSupportsLeader ? " Subperiodo anual repete o mesmo planeta-lider." : ""}` +
          ` Contexto anual extra: ${contextWeight.score.toFixed(2)} pts. ${contextWeight.note}` +
          ` Painel de Sahams: ${sahamSupportScore.toFixed(2)} pts, puxado por ${sahamPriority.leader.name}.`,
        ranking,
        system,
      };
    })
    .sort((left, right) => {
      if (right.coherenceScore !== left.coherenceScore) {
        return right.coherenceScore - left.coherenceScore;
      }
      return right.leaderScore - left.leaderScore;
    });

  return {
    ranked,
    runnerUp: ranked[1] ?? null,
    scoreSpread:
      ranked.length >= 2 ? Number((ranked[0].coherenceScore - ranked[1].coherenceScore).toFixed(2)) : Number.POSITIVE_INFINITY,
    contested:
      ranked.length >= 2 && Number((ranked[0].coherenceScore - ranked[1].coherenceScore).toFixed(2)) <= ANNUAL_SCHOOL_CONTESTED_MARGIN,
    leader:
      ranked[0] ??
      ({
        school: "Gauri",
        activeLord: "--",
        activeSubLord: "--",
        leaderPlanet: "--",
        leaderScore: 0,
        coherenceScore: 0,
        note: "Nenhuma escola anual ranqueada.",
        ranking: buildVarsheshRanking(rows, harshaBalaRows, annualContacts, munthaContacts, "--", "--"),
        system: systems[0],
      } as MuddaSchoolRankingRow & {
        ranking: ReturnType<typeof buildVarsheshRanking>;
        system: TajikaMuddaSystem;
      }),
  };
}

function buildSahamPriorityRows(
  sahams: SahamRow[],
  varshaLagnaLongitude: number,
  munthaLongitude: number,
  varsheshPlanet: string,
  activeMuddaPlanet: string,
  activeSubPlanet: string
) {
  const rows: SahamPriorityRow[] = sahams
    .map((saham) => {
      const lagnaDistance = Math.abs(normalize180(saham.sign.longitude - varshaLagnaLongitude));
      const munthaDistance = Math.abs(normalize180(saham.sign.longitude - munthaLongitude));
      const lordMatchesVarshesh = saham.sign.lord === varsheshPlanet;
      const lordMatchesMudda = saham.sign.lord === activeMuddaPlanet;
      const lordMatchesSub = saham.sign.lord === activeSubPlanet;
      const lagnaBand = lagnaDistance <= 15 ? 3 : lagnaDistance <= 30 ? 2 : lagnaDistance <= 45 ? 1 : 0;
      const munthaBand = munthaDistance <= 15 ? 3 : munthaDistance <= 30 ? 2 : munthaDistance <= 45 ? 1 : 0;
      const alignmentHits =
        (lordMatchesVarshesh ? 1 : 0) + (lordMatchesMudda ? 1 : 0) + (lordMatchesSub ? 1 : 0);
      const score =
        lagnaBand +
        munthaBand +
        (lordMatchesVarshesh ? 2 : 0) +
        (lordMatchesMudda ? 1.5 : 0) +
        (lordMatchesSub ? 1 : 0);

      return {
        name: saham.name,
        signName: saham.sign.signName,
        degreeInSign: saham.sign.degreeInSign,
        signLord: saham.sign.lord,
        lagnaDistance,
        munthaDistance,
        lordMatchesVarshesh,
        lordMatchesMudda,
        lordMatchesSub,
        alignmentHits,
        score,
        lineage: saham.lineage,
        theme: saham.theme,
        note: saham.note,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      const leftDistance = Math.min(left.lagnaDistance, left.munthaDistance);
      const rightDistance = Math.min(right.lagnaDistance, right.munthaDistance);
      return leftDistance - rightDistance;
    });

  return {
    rows,
    leader: rows[0] ?? {
      name: "--",
      signName: "--",
      degreeInSign: 0,
      signLord: "--",
      lagnaDistance: Number.NaN,
      munthaDistance: Number.NaN,
      lordMatchesVarshesh: false,
      lordMatchesMudda: false,
      lordMatchesSub: false,
      alignmentHits: 0,
      score: 0,
      lineage: "--",
      theme: "--",
      note: "Nenhum Saham anual disponivel.",
    },
  };
}

function buildSahamLineageRows(priorityRows: SahamPriorityRow[]): SahamLineageRow[] {
  const grouped = priorityRows.reduce<Record<string, SahamPriorityRow[]>>((acc, row) => {
    if (!acc[row.lineage]) {
      acc[row.lineage] = [];
    }
    acc[row.lineage].push(row);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([lineage, rows]) => {
      const topRow =
        rows.reduce((best, current) => {
          if (current.score !== best.score) {
            return current.score > best.score ? current : best;
          }
          return current.alignmentHits > best.alignmentHits ? current : best;
        }, rows[0]) ?? rows[0];
      const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
      const alignmentHits = rows.reduce((sum, row) => sum + row.alignmentHits, 0);

      return {
        lineage,
        count: rows.length,
        topTheme: topRow?.theme ?? "--",
        topSaham: topRow?.name ?? "--",
        averageScore: Number((totalScore / rows.length).toFixed(2)),
        alignmentHits,
        note:
          topRow && alignmentHits > 0
            ? `${topRow.name} lidera esta linha, com ${alignmentHits} alinhamento(s) entre Varshesh, Mudda e subperiodo.`
            : `${topRow?.name ?? "Nenhum Saham"} lidera esta linha sem alinhamento direto extra dos lordes anuais.`,
      };
    })
    .sort((left, right) => {
      if (right.averageScore !== left.averageScore) {
        return right.averageScore - left.averageScore;
      }
      return right.alignmentHits - left.alignmentHits;
    });
}

function buildMuddaDashaPeriods(
  school: TajikaMuddaSchool,
  moonLongitude: number,
  moonNakshatraIndex: number,
  annualAge: number,
  returnTime: string,
  timezone: string,
  analysisDateText: string
): TajikaMuddaSystem {
  const start = moment.tz(returnTime, "YYYY-MM-DD HH:mm:ss", timezone);
  const analysisMoment = moment.tz(`${analysisDateText} 12:00:00`, "YYYY-MM-DD HH:mm:ss", timezone);
  const elapsedFraction = modulo(moonLongitude, NAKSHATRA_ARC) / NAKSHATRA_ARC;
  const elapsedGhatis = Number((elapsedFraction * 60).toFixed(2));
  const remainingGhatis = Number((60 - elapsedGhatis).toFixed(2));
  let firstLord: TajikaMuddaLord;
  let firstLordDays: number;
  let firstRemainingDays: number;
  let firstElapsedDays: number;
  let trailingNote = "";
  let balaramaSegment:
    | (typeof BALARAMA_SEQUENCE)[number] & {
        offsetInGroup: number;
      }
    | undefined;

  if (school === "Balarama") {
    balaramaSegment = findBalaramaSegment(moonNakshatraIndex);
    firstLord = balaramaSegment.lord as TajikaMuddaLord;
    firstLordDays = balaramaSegment.days;
    const perNakshatraDays = firstLordDays / balaramaSegment.groupSize;
    firstElapsedDays = Number(
      (balaramaSegment.offsetInGroup * perNakshatraDays + (perNakshatraDays * elapsedGhatis) / 60).toFixed(2)
    );
    firstRemainingDays = Number(
      (((balaramaSegment.groupSize - balaramaSegment.offsetInGroup - 1) * perNakshatraDays) +
        (perNakshatraDays * remainingGhatis) / 60).toFixed(2)
    );
    trailingNote =
      `Escola Balarama: lua anual em grupo ${balaramaSegment.startNakshatra} (${balaramaSegment.groupSize} nakshatras), ` +
      `com ${balaramaSegment.offsetInGroup} nakshatras completos decorridos dentro do grupo.`;
  } else {
    const baseIndex =
      school === "Gauri"
        ? modulo(moonNakshatraIndex - 2, 9)
        : Math.floor(modulo(moonNakshatraIndex - 5, 27) / 3);
    firstLord = TAJIKA_MUDDA_SEQUENCE[modulo(baseIndex + annualAge, TAJIKA_MUDDA_SEQUENCE.length)];
    firstLordDays = TAJIKA_MUDDA_DAYS[firstLord];
    firstRemainingDays = Number(((firstLordDays * remainingGhatis) / 60).toFixed(2));
    firstElapsedDays = Number(((firstLordDays * elapsedGhatis) / 60).toFixed(2));
  }
  const periods: TajikaMuddaPeriodState[] = [];
  let cursor = start.clone();

  const pushPeriod = (
    lord: TajikaMuddaLord,
    days: number,
    segment: TajikaMuddaPeriodRow["segment"],
    note: string
  ) => {
    if (days <= 0) {
      return;
    }

    const periodStart = cursor.clone();
    const periodEnd = cursor.clone().add(days, "days");
    const isActive =
      (analysisMoment.isSame(periodStart) || analysisMoment.isAfter(periodStart)) &&
      analysisMoment.isBefore(periodEnd);

    periods.push({
      school,
      lord,
      startMoment: periodStart,
      endMoment: periodEnd,
      start: periodStart.format("YYYY-MM-DD"),
      end: periodEnd.format("YYYY-MM-DD"),
      days: Number(days.toFixed(2)),
      active: isActive,
      segment,
      note,
    });
    cursor = periodEnd.clone();
  };

  pushPeriod(
    firstLord,
    firstRemainingDays,
    "remaining",
    school === "Balarama"
      ? `Primeiro segmento da escola ${school} fracionado pelo restante do grupo nakshatra anual (${remainingGhatis.toFixed(2)}/60 ghatis).`
      : `Primeiro segmento da escola ${school} fracionado pelo restante do nakshatra natal (${remainingGhatis.toFixed(2)}/60 ghatis).`
  );

  const majorOrder =
    school === "Balarama"
      ? BALARAMA_ORDER
      : [...TAJIKA_MUDDA_SEQUENCE];
  const periodDaysMap =
    school === "Balarama"
      ? BALARAMA_PERIOD_DAYS
      : TAJIKA_MUDDA_DAYS;

  for (let offset = 1; offset < majorOrder.length; offset += 1) {
    const lord = majorOrder[(majorOrder.indexOf(firstLord) + offset) % majorOrder.length] as TajikaMuddaLord;
    pushPeriod(
      lord,
      periodDaysMap[lord],
      "full",
      `Periodo completo da escola ${school} na ordem anual do mudda.`
    );
  }

  const elapsedRemainder = Number((360 - periods.reduce((sum, period) => sum + period.days, 0)).toFixed(2));
  pushPeriod(
    firstLord,
    elapsedRemainder > 0 ? elapsedRemainder : firstElapsedDays,
    "elapsed",
    school === "Balarama"
      ? `Fecho do primeiro periodo pelo trecho ja corrido no grupo anual (${elapsedGhatis.toFixed(2)}/60 ghatis).`
      : `Fecho do primeiro periodo pelo trecho ja corrido no nakshatra natal (${elapsedGhatis.toFixed(2)}/60 ghatis).`
  );

  const activePeriod = periods.find((period) => period.active) ?? periods[0];
  const activeStartIndex = majorOrder.indexOf(activePeriod.lord);
  const subPeriods: TajikaPatyayiniState[] = [];
  let subCursor = activePeriod.startMoment.clone();

  for (let offset = 0; offset < majorOrder.length; offset += 1) {
    const lord = majorOrder[(activeStartIndex + offset) % majorOrder.length] as TajikaMuddaLord;
    const rawDays =
      school === "Balarama"
        ? (activePeriod.days * periodDaysMap[lord]) / 360
        : (activePeriod.days * TAJIKA_PATYAYINI_MULTIPLIERS[lord]) / 60;
    const days =
      offset === majorOrder.length - 1
        ? Number((activePeriod.days - subPeriods.reduce((sum, period) => sum + period.days, 0)).toFixed(2))
        : Number(rawDays.toFixed(2));
    const subStart = subCursor.clone();
    const subEnd = subCursor.clone().add(days, "days");
    const isActive =
      (analysisMoment.isSame(subStart) || analysisMoment.isAfter(subStart)) &&
      analysisMoment.isBefore(subEnd);

    subPeriods.push({
      school,
      maha: activePeriod.lord,
      lord,
      startMoment: subStart,
      endMoment: subEnd,
      start: subStart.format("YYYY-MM-DD"),
      end: subEnd.format("YYYY-MM-DD"),
      days,
      active: isActive,
      note:
        school === "Balarama"
          ? `Subperiodo anual de Balarama por produto dos periodos ${activePeriod.lord} x ${lord} / 360.`
          : `Patyayini pelo multiplicador ${TAJIKA_PATYAYINI_MULTIPLIERS[lord]}/60 dentro do Mudda ${school} ativo.`,
    });
    subCursor = subEnd.clone();
  }

  const activeSubPeriod = subPeriods.find((period) => period.active) ?? subPeriods[0];

  return {
    school,
    firstLord,
    periods,
    activePeriod,
    subPeriods,
    activeSubPeriod,
    elapsedGhatis,
    remainingGhatis,
    note:
      school === "Gauri"
        ? "Escola Gauri: regente anual derivado da lua natal em grupos de nona a partir de Krittika, com Patyayini por multiplicadores de mudda."
        : school === "Mahadeva"
          ? "Escola Mahadeva: comparativo derivado do agrupamento de tres nakshatras a partir de Ardra/Rudra, mantendo a mesma grade de subperiodos do mudda."
          : `Escola Balarama: periodos contados pela lua anual em grupos alternados de 4 e 3 nakshatras a partir de Rudra/Ardra, com subperiodos pelo produto dos periodos/360. ${trailingNote}`,
  };
}

export async function varshaphalaEngine(
  module: JyotishModuleKey,
  context: JyotishContext
): Promise<EngineResult> {
  const selectedYear = context.selectedYear ?? Number(context.transit.referenceDate.slice(0, 4));
  const natalYear = Number(context.primary.referenceDate.slice(0, 4));
  const annualAge = selectedYear - natalYear;
  const munthaSignIndex = ((context.primary.ascendant.signIndex + annualAge) % 12 + 12) % 12;
  const munthaHouse = ((annualAge % 12) + 12) % 12 + 1;
  const munthaLord = SIGN_LORDS[munthaSignIndex];
  const natalLagnaLord = SIGN_LORDS[context.primary.ascendant.signIndex];
  const activeDasha = context.primary.dashas.find((item) => item.active) ?? context.primary.dashas[0];
  const activeAntardasha =
    context.primary.antardashas.find((item) => item.active && item.mahaLord === activeDasha?.lord) ??
    context.primary.antardashas.find((item) => item.active);

  try {
    const natalBirthDate = buildBirthDate(context.primary);
    const targetBirthDate = buildBirthDate(context.primary, selectedYear);
    const annualReturn = await resolveAnnualReturn(natalBirthDate, targetBirthDate, context.primary.timezone);
    const solarReturn = annualReturn.payload;
    const annualStatus = annualReturn.mode === "exact" ? "implemented" : "mixed";
    const ayanamsha = context.transit.ayanamsaDegrees;
    const returnSunPlanet = findPlanet(solarReturn.returnPlanets, "sun");
    const returnMoonPlanet = findPlanet(solarReturn.returnPlanets, "moon");
    const returnJupiterPlanet = findPlanet(solarReturn.returnPlanets, "jupiter");
    const returnSaturnPlanet = findPlanet(solarReturn.returnPlanets, "saturn");
    const returnVenusPlanet = findPlanet(solarReturn.returnPlanets, "venus");
    const returnSun = siderealSign(returnSunPlanet?.longitude ?? 0, ayanamsha);
    const returnMoon = siderealSign(returnMoonPlanet?.longitude ?? 0, ayanamsha);
    const returnMoonNakshatraIndex = Math.floor(modulo(returnMoon.longitude, 360) / NAKSHATRA_ARC) % 27;
    const returnJupiter = siderealSign(returnJupiterPlanet?.longitude ?? 0, ayanamsha);
    const returnSaturn = siderealSign(returnSaturnPlanet?.longitude ?? 0, ayanamsha);
    const varshaLagna = siderealSign(solarReturn.returnHousesData.ascendant, ayanamsha);
    const returnContext = buildReturnContext(solarReturn.returnTime, solarReturn.timezone);
    const solarTimings = buildSolarDayTimings(
      returnContext.year,
      returnContext.month,
      returnContext.day,
      context.primary.latitude,
      context.primary.longitude,
      solarReturn.timezone
    );
    const isDay =
      Number.isFinite(solarTimings.sunrise ?? Number.NaN) &&
      Number.isFinite(solarTimings.sunset ?? Number.NaN)
        ? returnContext.decimalHour >= (solarTimings.sunrise ?? 6) &&
          returnContext.decimalHour < (solarTimings.sunset ?? 18)
        : true;
    const planetaryHour = buildPlanetaryHourContext(
      returnContext.year,
      returnContext.month,
      returnContext.day,
      returnContext.decimalHour,
      context.primary.latitude,
      context.primary.longitude,
      solarReturn.timezone
    );
    const weekdayLord = WEEKDAY_RULERS[returnContext.weekdayIndex];
    const hourLordMap: Record<string, string> = {
      Sun: "Surya",
      Moon: "Chandra",
      Mars: "Mangala",
      Mercury: "Budha",
      Jupiter: "Guru",
      Venus: "Shukra",
      Saturn: "Shani",
      "nao calculado": "--",
    };
    const hourLord = hourLordMap[planetaryHour.hourRuler] ?? planetaryHour.hourRuler;
    const panchadhikariRows = buildPanchadhikariRows(
      natalLagnaLord,
      varshaLagna.lord,
      munthaLord,
      weekdayLord,
      hourLord
    );
    const varsheshCandidate = chooseVarsheshCandidate(panchadhikariRows);
    const punyaSaham = buildPunyaSaham(
      solarReturn.returnHousesData.ascendant,
      returnSunPlanet?.longitude ?? 0,
      returnMoonPlanet?.longitude ?? 0,
      isDay,
      ayanamsha
    );
    const natalMoonPoint = context.primary.planets.find((point) => point.key === "moon");
    const lagnaLordLongitude = findSignLordLongitude(
      solarReturn.returnPlanets,
      solarReturn.returnHousesData.ascendant,
      ayanamsha
    );
    const secondHouseLongitude = solarReturn.returnHousesData.house[1] ?? solarReturn.returnHousesData.ascendant;
    const sixthHouseLongitude = solarReturn.returnHousesData.house[5] ?? solarReturn.returnHousesData.ascendant;
    const ninthHouseLongitude = solarReturn.returnHousesData.house[8] ?? solarReturn.returnHousesData.ascendant;
    const returnMercuryPlanet = findPlanet(solarReturn.returnPlanets, "mercury");
    const returnMarsPlanet = findPlanet(solarReturn.returnPlanets, "mars");
    const secondLordLongitude = findSignLordLongitude(solarReturn.returnPlanets, secondHouseLongitude, ayanamsha);
    const ninthLordLongitude = findSignLordLongitude(solarReturn.returnPlanets, ninthHouseLongitude, ayanamsha);
    const sunSignLordLongitude = findSignLordLongitude(solarReturn.returnPlanets, returnSunPlanet?.longitude ?? 0, ayanamsha);
    const moonSignLordLongitude = findSignLordLongitude(solarReturn.returnPlanets, returnMoonPlanet?.longitude ?? 0, ayanamsha);
    const sahams = buildAdditionalSahams(
      solarReturn.returnHousesData.ascendant,
      returnSunPlanet?.longitude ?? 0,
      returnMoonPlanet?.longitude ?? 0,
      returnJupiterPlanet?.longitude ?? 0,
      returnVenusPlanet?.longitude ?? 0,
      returnSaturnPlanet?.longitude ?? 0,
      returnMercuryPlanet?.longitude ?? 0,
      returnMarsPlanet?.longitude ?? 0,
      lagnaLordLongitude,
      secondHouseLongitude,
      secondLordLongitude,
      sixthHouseLongitude,
      ninthHouseLongitude,
      ninthLordLongitude,
      sunSignLordLongitude,
      moonSignLordLongitude,
      isDay,
      ayanamsha
    );
    const annualPoints = buildAnnualPlanetPoints(solarReturn.returnPlanets, ayanamsha);
    const annualContactNetwork = buildAnnualAspects(annualPoints);
    const annualContacts = annualContactNetwork.slice(0, 8);
    const munthaLongitude = munthaSignIndex * 30 + context.primary.ascendant.degreeInSign;
    const munthaContacts = buildMunthaContacts(
      solarReturn.returnPlanets,
      munthaLongitude,
      ayanamsha
    );
    const munthaProgression = buildMunthaProgression(
      selectedYear,
      natalYear,
      context.primary.ascendant.signIndex
    );
    const harshaBalaRows = buildHarshaBalaRows(
      solarReturn.returnPlanets,
      ayanamsha,
      varshaLagna.signIndex,
      isDay
    );
    const strongestHarsha = harshaBalaRows.reduce(
      (best, current) => (current.total > best.total ? current : best),
      harshaBalaRows[0]
    );
    const gauriMudda = buildMuddaDashaPeriods(
      "Gauri",
      natalMoonPoint?.longitude ?? 0,
      natalMoonPoint?.nakshatraIndex ?? 0,
      annualAge,
      solarReturn.returnTime,
      solarReturn.timezone,
      context.transit.referenceDate
    );
    const mahadevaMudda = buildMuddaDashaPeriods(
      "Mahadeva",
      natalMoonPoint?.longitude ?? 0,
      natalMoonPoint?.nakshatraIndex ?? 0,
      annualAge,
      solarReturn.returnTime,
      solarReturn.timezone,
      context.transit.referenceDate
    );
    const balaramaMudda = buildMuddaDashaPeriods(
      "Balarama",
      returnMoon.longitude,
      returnMoonNakshatraIndex,
      annualAge,
      solarReturn.returnTime,
      solarReturn.timezone,
      context.transit.referenceDate
    );
    const muddaSchoolRows = [gauriMudda, mahadevaMudda, balaramaMudda];
    const muddaSchoolRanking = buildMuddaSchoolRanking(
      muddaSchoolRows,
      panchadhikariRows,
      harshaBalaRows,
      annualContactNetwork,
      munthaContacts,
      sahams,
      varshaLagna.longitude,
      munthaLongitude,
      varshaLagna.lord,
      munthaLord
    );
    const mudda = muddaSchoolRanking.leader.system;
    const activePatyayini = mudda.activeSubPeriod;
    const activeMuddaLabel = normalizeTajikaLordLabel(mudda.activePeriod.lord);
    const activePatyayiniLabel = normalizeTajikaLordLabel(activePatyayini?.lord ?? "--");
    const varsheshRanking = muddaSchoolRanking.leader.ranking;
    const tajikaApplyingLead =
      annualContactNetwork.find((contact) => contact.state === "Ithasala candidato") ?? annualContactNetwork[0];
    const munthaLead = munthaContacts[0];
    const tajikaYogas = buildTajikaYogaRows(
      annualPoints,
      annualContactNetwork,
      varshaLagna.lord,
      munthaLord
    );
    const naktaLead = tajikaYogas.find((row) => row.yoga === "Nakta");
    const yamayaLead = tajikaYogas.find((row) => row.yoga === "Yamaya");
    const kamboolaLead = tajikaYogas.find((row) => row.yoga === "Kamboola");
    const sahamPriority = buildSahamPriorityRows(
      sahams,
      varshaLagna.longitude,
      munthaLongitude,
      varsheshRanking.leader.planet,
      activeMuddaLabel,
      activePatyayiniLabel
    );
    const sahamLineages = buildSahamLineageRows(sahamPriority.rows);
    const ithasalaCount = annualContactNetwork.filter((contact) => contact.state === "Ithasala candidato").length;
    const easarphaCount = annualContactNetwork.filter((contact) => contact.state === "Easarpha candidata").length;
    const annualLeaderMatches =
      (varsheshRanking.leader.planet === activeMuddaLabel ? 1 : 0) +
      (varsheshRanking.leader.planet === activePatyayiniLabel ? 1 : 0);
    const annualConvergenceRows = [
      {
        criterion: "Escola anual",
        state: muddaSchoolRanking.contested ? "Disputa aberta" : "Lideranca firme",
        score: muddaSchoolRanking.contested ? 0 : 2,
        note: muddaSchoolRanking.runnerUp
          ? `Margem atual de ${muddaSchoolRanking.scoreSpread.toFixed(2)} pts sobre ${muddaSchoolRanking.runnerUp.school}.`
          : "Nao houve segunda escola elegivel para comparativo.",
      },
      {
        criterion: "Varshesh x periodos",
        state:
          annualLeaderMatches === 2
            ? "Repete Mudda e sub"
            : annualLeaderMatches === 1
              ? "Repete um periodo"
              : "Sem repeticao direta",
        score: annualLeaderMatches === 2 ? 3 : annualLeaderMatches === 1 ? 1 : -1,
        note: `${varsheshRanking.leader.planet} foi testado contra ${activeMuddaLabel} e ${activePatyayiniLabel}.`,
      },
      {
        criterion: "Contato aplicante",
        state: tajikaApplyingLead ? tajikaApplyingLead.state : "Sem contato destacado",
        score: tajikaApplyingLead?.state === "Ithasala candidato" ? 2 : tajikaApplyingLead ? 1 : -1,
        note: tajikaApplyingLead
          ? `${tajikaApplyingLead.faster} -> ${tajikaApplyingLead.slower} em ${tajikaApplyingLead.aspect} com orb ${tajikaApplyingLead.orb.toFixed(2)}deg.`
          : "Nenhum contato anual dominante ficou disponivel.",
      },
      {
        criterion: "Muntha",
        state: munthaLead ? `${munthaLead.planet} | ${munthaLead.aspect}` : "Sem contato angular",
        score: munthaLead ? 1 : -1,
        note: munthaLead
          ? `Orb ${munthaLead.orb.toFixed(2)}deg no recorte angular da Muntha anual.`
          : "A Muntha nao fechou contato operacional forte nesta rodada.",
      },
      {
        criterion: "Sahams",
        state: `${sahamPriority.leader.name} | ${sahamPriority.leader.alignmentHits} alinhamento(s)`,
        score:
          sahamPriority.leader.alignmentHits >= 2
            ? 2
            : sahamPriority.leader.alignmentHits === 1
              ? 1
              : 0,
        note: `Linha lider ${sahamPriority.leader.lineage} com score ${sahamPriority.leader.score.toFixed(2)}.`,
      },
      {
        criterion: "Yogas Tajika",
        state: `${tajikaYogas.length} candidato(s)`,
        score: tajikaYogas.length >= 3 ? 2 : tajikaYogas.length >= 1 ? 1 : -1,
        note: `${ithasalaCount} Ithasala, ${easarphaCount} Easarpha, Nakta ${naktaLead ? "presente" : "ausente"}, Yamaya ${yamayaLead ? "presente" : "ausente"}, Kamboola ${kamboolaLead ? "presente" : "ausente"}.`,
      },
    ];
    const annualConvergenceScore = annualConvergenceRows.reduce((sum, row) => sum + row.score, 0);
    const annualConvergenceState =
      annualConvergenceScore >= 8
        ? "Convergencia anual forte"
        : annualConvergenceScore >= 4
          ? "Convergencia anual util"
          : annualConvergenceScore >= 1
            ? "Convergencia anual mista"
            : "Convergencia anual fragil";
    const varsheshBridgeMatches =
      (varsheshCandidate === varsheshRanking.leader.planet ? 1 : 0) +
      (varsheshCandidate === activeMuddaLabel ? 1 : 0) +
      (varsheshCandidate === activePatyayiniLabel ? 1 : 0) +
      annualLeaderMatches;
    const varsheshBridgeState =
      varsheshBridgeMatches >= 4
        ? "Ponte anual fechada"
        : varsheshBridgeMatches >= 2
          ? "Ponte anual parcial"
          : "Ponte anual aberta";
    const varsheshBridgeRows = [
      {
        criterion: "Base Panchadhikari",
        state: varsheshCandidate,
        score: varsheshCandidate === varsheshRanking.leader.planet ? 2 : 0,
        note:
          varsheshCandidate === varsheshRanking.leader.planet
            ? `A base Panchadhikari repete o lider operacional ${varsheshRanking.leader.planet}.`
            : `A base Panchadhikari apontou ${varsheshCandidate}, enquanto o ranking anual liderou com ${varsheshRanking.leader.planet}.`,
      },
      {
        criterion: "Mudda ativo",
        state: activeMuddaLabel,
        score: varsheshCandidate === activeMuddaLabel || varsheshRanking.leader.planet === activeMuddaLabel ? 1 : 0,
        note: `Periodo anual principal em ${activeMuddaLabel}.`,
      },
      {
        criterion: "Subperiodo ativo",
        state: activePatyayiniLabel,
        score: varsheshCandidate === activePatyayiniLabel || varsheshRanking.leader.planet === activePatyayiniLabel ? 1 : 0,
        note: `Subperiodo anual ativo em ${activePatyayiniLabel}.`,
      },
      {
        criterion: "Lider operacional",
        state: `${varsheshRanking.leader.planet} (${varsheshRanking.leader.score.toFixed(2)} pts)`,
        score: annualLeaderMatches === 2 ? 2 : annualLeaderMatches === 1 ? 1 : 0,
        note: "Ranking anual por hits Panchadhikari, Harsha Bala, contatos Tajika, Muntha e periodos anuais.",
      },
    ];
    const tajikaTransferRows = [
      {
        criterion: "Nakta",
        state: naktaLead ? `${naktaLead.planets} via ${naktaLead.mediator}` : "Ausente",
        score: naktaLead ? (naktaLead.state === "Dupla" ? 2 : 1) : 0,
        note: naktaLead
          ? `${naktaLead.state} com score ${naktaLead.score.toFixed(2)} no working set anual de transferencia por mediador mais rapido.`
          : "Nenhuma cadeia Nakta passou pelos filtros atuais de deeptamsha, arco curto e ausencia de contato direto.",
      },
      {
        criterion: "Yamaya",
        state: yamayaLead ? `${yamayaLead.planets} via ${yamayaLead.mediator}` : "Ausente",
        score: yamayaLead ? (yamayaLead.state === "Dupla" ? 2 : 1) : 0,
        note: yamayaLead
          ? `${yamayaLead.state} com score ${yamayaLead.score.toFixed(2)} no working set anual de transferencia por mediador mais lento.`
          : "Nenhuma cadeia Yamaya passou pelos filtros atuais de deeptamsha, arco curto e ausencia de contato direto.",
      },
      {
        criterion: "Kamboola",
        state: kamboolaLead ? `${kamboolaLead.planets} com ${kamboolaLead.state}` : "Ausente",
        score: kamboolaLead ? (kamboolaLead.state === "Dupla" ? 2 : 1) : 0,
        note: kamboolaLead
          ? `${kamboolaLead.note} Score ${kamboolaLead.score.toFixed(2)}.`
          : "Nenhuma Lua anual entrou numa Ithasala elegivel para Kamboola dentro da malha atual.",
      },
    ];
    const tajikaTransferScore = tajikaTransferRows.reduce((sum, row) => sum + row.score, 0);
    const tajikaTransferState =
      tajikaTransferScore >= 5
        ? "Transferencias Tajika fortes"
        : tajikaTransferScore >= 2
          ? "Transferencias Tajika presentes"
          : "Transferencias Tajika discretas";

    return {
      sections: [
        createSection({
          id: `${module}-varshaphala`,
          title: "Varshaphala / Tajika",
          description:
            "Recorte anual baseado em retorno solar real do motor Swiss Ephemeris do projeto, mantido separado do transito comum do dia.",
          status: annualStatus,
          items: [
            createDatum(module, "Varshaphala", "Ano consultado", selectedYear, {
              technicalNotes: "Ano-base usado para a leitura anual.",
              confidence: 0.95,
            }),
            createDatum(module, "Varshaphala", "Retorno solar", solarReturn.returnTime, {
              technicalNotes: `${annualReturn.note} O motor atual ancora a localidade nas coordenadas do mapa-base.`,
              confidence: annualReturn.mode === "exact" ? 0.9 : 0.6,
              status: annualStatus,
            }),
            createDatum(module, "Varshaphala", "Modo anual", annualReturn.mode === "exact" ? "Retorno solar exato" : "Aniversario civil aproximado", {
              technicalNotes:
                annualReturn.mode === "exact"
                  ? "O ano foi calculado no instante real do retorno solar."
                  : `${annualReturn.note} Erro original do retorno exato: ${annualReturn.sourceError ?? "--"}.`,
              confidence: annualReturn.mode === "exact" ? 0.88 : 0.56,
              status: annualStatus,
            }),
            createDatum(module, "Varshaphala", "Varsha Lagna", `${varshaLagna.signName} ${varshaLagna.degreeInSign.toFixed(2)}deg`, {
              technicalNotes: "Ascendente sideral do retorno anual apos aplicacao do ayanamsha configurado.",
              confidence: 0.84,
            }),
            createDatum(module, "Varshaphala", "Muntha", `${SIGNS[munthaSignIndex]} | casa ${munthaHouse}`, {
              technicalNotes:
                `Muntha avancada ${annualAge} anos a partir do Lagna natal. Regente atual: ${munthaLord}.`,
              confidence: 0.74,
              status: "implemented",
            }),
            createDatum(module, "Varshaphala", "Varshesh candidato", varsheshCandidate, {
              technicalNotes:
                "Escolha automatizada no working set Panchadhikari v1 do motor atual; continue tratando isso como candidato tecnico, nao dogma fechado.",
              confidence: 0.62,
              status: "implemented",
              methodUsed: "working-set-panchadhikari-varshesh-base-v1",
            }),
            createDatum(module, "Varshaphala", "Ponte do Varshesh anual", varsheshBridgeState, {
              technicalNotes: `A ponte soma ${varsheshBridgeMatches} alinhamento(s) entre base Panchadhikari, lider operacional, Mudda e subperiodo anual.`,
              confidence:
                varsheshBridgeState === "Ponte anual fechada"
                  ? 0.72
                  : varsheshBridgeState === "Ponte anual parcial"
                    ? 0.62
                    : 0.46,
              status: "implemented",
              methodUsed: "varshesh-bridge-overlay-v1",
            }),
            createDatum(module, "Varshaphala", "Punya Saham", `${punyaSaham.signName} ${punyaSaham.degreeInSign.toFixed(2)}deg`, {
              technicalNotes:
                `Formula anual usada: ${isDay ? "Sun - Moon + Asc" : "Moon - Sun + Asc"}, com correcao de um signo pelo ascendente e criterio ${isDay ? "diurno" : "noturno"}.`,
              confidence: 0.76,
              status: "implemented",
            }),
            createDatum(module, "Varshaphala", "Mahadasha ativa", activeDasha?.lord ?? "--", {
              technicalNotes: "Periodo maior ativo na data de analise fornecida ao modulo.",
              confidence: 0.7,
            }),
            createDatum(module, "Varshaphala", "Antardasha ativa", activeAntardasha ? `${activeAntardasha.mahaLord} / ${activeAntardasha.lord}` : "--", {
              technicalNotes: "Subperiodo ativo que deve ser cruzado com retorno e gochara.",
              confidence: 0.66,
              status: "implemented",
            }),
            createDatum(module, "Varshaphala", "Mudda Dasha ativa", activeMuddaLabel, {
              technicalNotes:
                `Periodo anual pela escola ${mudda.school}, com ${mudda.remainingGhatis.toFixed(2)} ghatis restantes e ${mudda.elapsedGhatis.toFixed(2)} decorridos no ponto de partida usado por esta escola.`,
              confidence: 0.72,
              status: "implemented",
            }),
            createDatum(module, "Varshaphala", "Escola operacional do Mudda", mudda.school, {
              technicalNotes:
                `Selecao automatica por coerencia anual entre Gauri, Mahadeva e Balarama. Score atual: ${muddaSchoolRanking.leader.coherenceScore.toFixed(2)}.`,
              confidence: 0.72,
              status: "implemented",
            }),
            createDatum(
              module,
              "Varshaphala",
              "Margem da escola anual",
              Number.isFinite(muddaSchoolRanking.scoreSpread)
                ? `${muddaSchoolRanking.scoreSpread.toFixed(2)} pts | ${muddaSchoolRanking.contested ? "disputa aberta" : "lideranca firme"}`
                : "sem comparativo",
              {
                technicalNotes: muddaSchoolRanking.runnerUp
                  ? `Vice-lider atual: ${muddaSchoolRanking.runnerUp.school} com ${muddaSchoolRanking.runnerUp.coherenceScore.toFixed(2)} pts.`
                  : "Nao houve segunda escola elegivel nesta rodada anual.",
                confidence: 0.68,
                status: "implemented",
              }
            ),
            createDatum(module, "Varshaphala", "Planeta lider em Harsha Bala", `${strongestHarsha.planet} (${strongestHarsha.total}/20)`, {
              technicalNotes:
                "Harsha Bala anual somado por casa preferida, dignidade, sexo da casa e dia/noite do Varsha Pravesha.",
              confidence: 0.74,
              status: "implemented",
            }),
            createDatum(
              module,
              "Varshaphala",
              "Linha dominante dos Sahams",
              sahamLineages[0] ? `${sahamLineages[0].lineage} (${sahamLineages[0].averageScore.toFixed(2)} pts)` : "--",
              {
                technicalNotes: sahamLineages[0]
                  ? `${sahamLineages[0].topSaham} puxou a linha por ${sahamLineages[0].topTheme.toLowerCase()}, com ${sahamLineages[0].alignmentHits} alinhamento(s) no eixo Varshesh/Mudda/Sub.`
                  : "Nenhuma linha de Sahams ficou disponivel para sumarizacao nesta rodada.",
                confidence: 0.66,
                status: "implemented",
              }
            ),
          ],
          tables: [
            createTable(
              `${module}-varshaphala-return-points`,
              "Pontos anuais principais",
              ["Ponto", "Signo sideral", "Grau"],
              [
                ["Varsha Lagna", varshaLagna.signName, `${varshaLagna.degreeInSign.toFixed(2)}deg`],
                ["Surya", returnSun.signName, `${returnSun.degreeInSign.toFixed(2)}deg`],
                ["Chandra", returnMoon.signName, `${returnMoon.degreeInSign.toFixed(2)}deg`],
                ["Guru", returnJupiter.signName, `${returnJupiter.degreeInSign.toFixed(2)}deg`],
                ["Shani", returnSaturn.signName, `${returnSaturn.degreeInSign.toFixed(2)}deg`],
              ],
              "Recorte anual principal derivado do retorno solar do projeto."
            ),
            createTable(
              `${module}-tajika-panchadhikari`,
              "Panchadhikari v1",
              ["Papel", "Planeta", "Nota"],
              panchadhikariRows.map((row) => [row.role, row.planet, row.note]),
              "Working set tecnico para destacar regentes recorrentes no retorno anual atual."
            ),
            createTable(
              `${module}-annual-sahams`,
              "Sahams de trabalho",
              ["Saham", "Tema", "Linha", "Signo sideral", "Grau", "Addend", "Formula", "Fonte", "Nota"],
              sahams.map((saham) => [
                saham.name,
                saham.theme,
                saham.lineage,
                saham.sign.signName,
                `${saham.sign.degreeInSign.toFixed(2)}deg`,
                saham.addend,
                saham.formula,
                saham.source,
                saham.note,
              ]),
              "Sahams anuais com addends especificos, fonte explicita e correcao de um signo aplicada pelo ponto projetor indicado na tradicao usada."
            ),
            createTable(
              `${module}-mudda-schools`,
              "Periodos anuais por escola",
              ["Escola", "Primeira dasha", "Periodo ativo", "Subperiodo ativo", "Nota"],
              muddaSchoolRows.map((row) => [
                row.school,
                normalizeTajikaLordLabel(row.firstLord),
                normalizeTajikaLordLabel(row.activePeriod.lord),
                `${normalizeTajikaLordLabel(row.activeSubPeriod.maha)} / ${normalizeTajikaLordLabel(row.activeSubPeriod.lord)}`,
                row.note,
              ]),
              "Comparativo operacional entre Gauri, Mahadeva e Balarama; a escola principal passa a ser escolhida pelo score de coerencia anual."
            ),
            createTable(
              `${module}-mudda-school-ranking`,
              "Ranking tecnico das escolas anuais",
              ["Escola", "Periodo ativo", "Subperiodo", "Lider anual", "Score do lider", "Score da escola", "Selecionada"],
              muddaSchoolRanking.ranked.map((row) => [
                row.school,
                row.activeLord,
                row.activeSubLord,
                row.leaderPlanet,
                row.leaderScore.toFixed(2),
                row.coherenceScore.toFixed(2),
                row.school === mudda.school ? "Sim" : "Nao",
              ]),
              "Score da escola = coerencia entre lider anual, periodo ativo, subperiodo ativo e contexto tecnico do ano."
            ),
            createTable(
              `${module}-varshesh-bridge`,
              "Ponte do Varshesh anual",
              ["Filtro", "Estado", "Score", "Nota"],
              varsheshBridgeRows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
              "Amarra a escolha base de Panchadhikari com o ranking anual operacional e com os periodos que realmente estao ativos no ano."
            ),
            createTable(
              `${module}-tajika-aspects`,
              "Contatos Tajika de trabalho",
              ["Rapido", "Lento", "Aspecto", "Orb", "Deeptamsha", "Estado", "Nota"],
              annualContacts.map((contact) => [
                contact.faster,
                contact.slower,
                contact.aspect,
                `${contact.orb.toFixed(2)}deg`,
                `${contact.orbLimit.toFixed(2)}deg`,
                contact.state,
                contact.note,
              ]),
              "Triagem dinamica de contatos anuais pelo deeptamsha medio, com leitura aplicativa/separativa no motor atual."
            ),
            createTable(
              `${module}-muntha-contacts`,
              "Contatos da Muntha",
              ["Planeta", "Aspecto", "Orb", "Nota"],
              munthaContacts.map((contact) => [
                contact.planet,
                contact.aspect,
                `${contact.orb.toFixed(2)}deg`,
                contact.note,
              ]),
              "Recorte angular da Muntha anual contra os planetas do retorno."
            ),
            createTable(
              `${module}-mudda-dasha`,
              mudda.school === "Balarama" ? "Periodos anuais (Balarama)" : `Mudda Dasha (${mudda.school} v2)`,
              ["Lord", "Inicio", "Fim", "Dias", "Trecho", "Ativa"],
              mudda.periods.map((period) => [
                normalizeTajikaLordLabel(period.lord),
                period.start,
                period.end,
                period.days.toFixed(2),
                period.segment,
                period.active ? "Sim" : "Nao",
              ]),
              mudda.school === "Balarama"
                ? "Periodos anuais da escola de Balarama, iniciados pela lua do retorno em grupos alternados de 4 e 3 nakshatras a partir de Ardra/Rudra."
                : `Mudda anual da escola de ${mudda.school}, com primeira dasha fracionada pelo restante e pelo trecho corrido do ponto de partida da escola.`
            ),
            createTable(
              `${module}-patyayini-v1`,
              mudda.school === "Balarama" ? "Subperiodos anuais (Balarama)" : `Patyayini (${mudda.school} v2)`,
              ["Maha", "Sub", "Inicio", "Fim", "Dias", "Ativa"],
              mudda.subPeriods.map((period) => [
                normalizeTajikaLordLabel(period.maha),
                normalizeTajikaLordLabel(period.lord),
                period.start,
                period.end,
                period.days.toFixed(2),
                period.active ? "Sim" : "Nao",
              ]),
              mudda.school === "Balarama"
                ? "Subperiodos anuais da escola de Balarama pelo produto dos periodos / 360 em ordem a partir do proprio periodo ativo."
                : `Patyayini da escola de ${mudda.school} por multiplicadores classicos de mudda dentro do periodo ativo.`
            ),
          ],
        }),
        createSection({
          id: `${module}-annual-strength`,
          title: "Forca Anual e Progressao",
          description:
            "Abre Harsha Bala do retorno e a progressao curta da Muntha para comparar o ano atual com seus vizinhos imediatos.",
          status: annualStatus,
          tables: [
            createTable(
              `${module}-harsha-bala`,
              "Harsha Bala",
              ["Planeta", "Casa", "Signo", "Casa-base", "Dignidade", "Sexo da casa", "Dia/Noite", "Total", "Nota"],
              harshaBalaRows.map((row) => [
                row.planet,
                row.house.toString(),
                row.signName,
                row.houseScore.toString(),
                row.dignityScore.toString(),
                row.houseSexScore.toString(),
                row.dayNightScore.toString(),
                row.total.toString(),
                row.note,
              ]),
              "Cada criterio soma 5 pontos: casa preferida, exaltacao/own sign, sexo da casa e dia/noite do Varsha Pravesha."
            ),
            createTable(
              `${module}-muntha-progression`,
              "Annual Muntha progression",
              ["Ano", "Muntha", "Casa", "Regente", "Estado"],
              munthaProgression.map((entry) => [
                entry.year.toString(),
                entry.signName,
                entry.house.toString(),
                entry.lord,
                entry.active ? "Ano ativo" : "Vizinho",
              ]),
              "Recorte curto para comparar a Muntha do ano consultado com os anos ao redor."
            ),
          ],
        }),
        createSection({
          id: `${module}-tajika`,
          title: "Tajika Operacional",
          description:
            "Camada anual que cruza Panchadhikari, periodos anuais por escola, contatos dinamicos e Sahams sem fingir fechamento de toda a escola Tajika.",
          status: annualStatus,
          items: [
            createDatum(module, "Tajika", "Varshesh operacional v2", `${varsheshRanking.leader.planet} (${varsheshRanking.leader.score.toFixed(2)} pts)`, {
              technicalNotes:
                `Ranking anual por hits Panchadhikari, Harsha Bala, contatos Tajika, contato com Muntha e ativacao do periodo/subperiodo anual. Roles: ${varsheshRanking.leader.roles.join(", ") || "--"}.`,
              confidence: 0.7,
              status: "implemented",
            }),
            createDatum(module, "Tajika", "Subperiodo anual ativo", activePatyayini ? `${normalizeTajikaLordLabel(activePatyayini.maha)} / ${activePatyayiniLabel}` : "--", {
              technicalNotes:
                mudda.school === "Balarama"
                  ? "Subperiodo anual pela escola de Balarama, calculado pelo produto dos periodos / 360 em ordem a partir do proprio periodo ativo."
                  : `Subperiodo interno do Mudda ${mudda.school} ativo, calculado pelos multiplicadores classicos do mudda no trecho anual corrente.`,
              confidence: 0.74,
              status: "implemented",
            }),
            createDatum(module, "Tajika", "Comparativo de escola", muddaSchoolRanking.ranked.map((row) => `${row.school}: ${row.activeLord}`).join(" | "), {
              technicalNotes:
                "Comparacao direta entre os periodos ativos das escolas Gauri, Mahadeva e Balarama para nao esconder divergencias de agrupamento anual.",
              confidence: 0.68,
              status: "implemented",
            }),
            createDatum(
              module,
              "Tajika",
              "Escola anual alternativa",
              muddaSchoolRanking.runnerUp
                ? `${muddaSchoolRanking.runnerUp.school} (${muddaSchoolRanking.runnerUp.activeLord})`
                : "--",
              {
                technicalNotes: muddaSchoolRanking.runnerUp
                  ? `Margem frente a ${mudda.school}: ${muddaSchoolRanking.scoreSpread.toFixed(2)} pts. ${muddaSchoolRanking.contested ? "Ano ainda disputado entre as escolas principais." : "Ano com preferencia tecnica mais limpa para a escola lider."}`
                  : "Nao houve segunda escola elegivel para comparativo.",
                confidence: 0.65,
                status: "implemented",
              }
            ),
            createDatum(
              module,
              "Tajika",
              "Contato aplicante dominante",
              tajikaApplyingLead
                ? `${tajikaApplyingLead.faster} -> ${tajikaApplyingLead.slower} | ${tajikaApplyingLead.aspect}`
                : "--",
              {
                technicalNotes: tajikaApplyingLead
                  ? `${tajikaApplyingLead.state} com orb ${tajikaApplyingLead.orb.toFixed(2)}deg no passo dinamico atual.`
                  : "Nenhum contato anual relevante caiu na janela tecnica atual.",
                confidence: 0.68,
                status: "implemented",
              }
            ),
            createDatum(
              module,
              "Tajika",
              "Contato dominante com Muntha",
              munthaLead ? `${munthaLead.planet} | ${munthaLead.aspect}` : "--",
              {
                technicalNotes: munthaLead
                  ? `Orb ${munthaLead.orb.toFixed(2)}deg no recorte angular anual da Muntha.`
                  : "Nenhum contato angular com a Muntha foi ativado no working set atual.",
                confidence: 0.67,
                status: "implemented",
              }
            ),
            createDatum(module, "Tajika", "Saham em destaque", `${sahamPriority.leader.name} (${sahamPriority.leader.score} pts)`, {
              technicalNotes:
                `Prioridade anual por proximidade ao Varsha Lagna, proximidade a Muntha e coincidencia do senhor do signo com Varshesh (${varsheshRanking.leader.planet}), Mudda (${activeMuddaLabel}) e subperiodo (${activePatyayiniLabel}).`,
              confidence: 0.65,
              status: "implemented",
            }),
            createDatum(
              module,
              "Tajika",
              "Linha de Saham lider",
              sahamLineages[0] ? `${sahamLineages[0].lineage} | ${sahamLineages[0].topSaham}` : "--",
              {
                technicalNotes: sahamLineages[0]
                  ? `Media ${sahamLineages[0].averageScore.toFixed(2)} pts e ${sahamLineages[0].alignmentHits} alinhamento(s) somados entre os lordes anuais da linha.`
                  : "Sem resumo por linha disponivel para esta leitura anual.",
                confidence: 0.63,
                status: "implemented",
              }
            ),
            createDatum(module, "Tajika", "Mapa aplicante/separativo", `${ithasalaCount} Ithasala | ${easarphaCount} Easarpha`, {
              technicalNotes:
                "Contagem simples do painel anual dinamico para separar contatos que aproximam dos que se afastam no passo seguinte do motor.",
              confidence: 0.68,
              status: "implemented",
            }),
            createDatum(module, "Tajika", "Convergencia anual", annualConvergenceState, {
              technicalNotes: `Score ${annualConvergenceScore} no overlay anual, cruzando escola, periodos, contatos, Muntha, Sahams e yogas Tajika.`,
              confidence: 0.72,
              status: "implemented",
              methodUsed: "tajika-annual-convergence-v1",
            }),
            createDatum(module, "Tajika", "Transferencias Tajika", tajikaTransferState, {
              technicalNotes: `Score ${tajikaTransferScore} no painel Nakta/Yamaya/Kamboola desta rodada anual.`,
              confidence:
                tajikaTransferState === "Transferencias Tajika fortes"
                  ? 0.68
                  : tajikaTransferState === "Transferencias Tajika presentes"
                    ? 0.6
                    : 0.48,
              status: "implemented",
              methodUsed: "tajika-transfer-overlay-v1",
            }),
            createDatum(module, "Tajika", "Nakta candidato", naktaLead ? `${naktaLead.planets} via ${naktaLead.mediator}` : "--", {
              technicalNotes: naktaLead
                ? `${naktaLead.state} com score ${naktaLead.score.toFixed(2)} no working set anual de transferencia por mediador mais rapido.`
                : "Nenhuma cadeia Nakta passou pelos filtros atuais de deeptamsha, arco curto e ausencia de contato direto.",
              confidence: 0.58,
              status: "implemented",
              methodUsed: "tajika-transfer-overlay-v1",
            }),
            createDatum(module, "Tajika", "Yamaya candidato", yamayaLead ? `${yamayaLead.planets} via ${yamayaLead.mediator}` : "--", {
              technicalNotes: yamayaLead
                ? `${yamayaLead.state} com score ${yamayaLead.score.toFixed(2)} no working set anual de transferencia por mediador mais lento.`
                : "Nenhuma cadeia Yamaya passou pelos filtros atuais de deeptamsha, arco curto e ausencia de contato direto.",
              confidence: 0.57,
              status: "implemented",
              methodUsed: "tajika-transfer-overlay-v1",
            }),
            createDatum(module, "Tajika", "Kamboola candidato", kamboolaLead ? `${kamboolaLead.planets} com ${kamboolaLead.state}` : "--", {
              technicalNotes: kamboolaLead
                ? `${kamboolaLead.note} Score ${kamboolaLead.score.toFixed(2)}.`
                : "Nenhuma Lua anual entrou numa Ithasala elegivel para Kamboola dentro da malha atual.",
              confidence: 0.59,
              status: "implemented",
              methodUsed: "tajika-transfer-overlay-v1",
            }),
          ],
          tables: [
          createTable(
            `${module}-varshesh-ranking-v2`,
            "Ranking do Varshesh anual",
            ["Planeta", "Hits", "Roles", "Harsha", "Ithasala", "Easarpha", "Muntha", "Mudda", "Patyayini", "Score"],
              varsheshRanking.ranked.map((row) => [
                row.planet,
                row.hits.toString(),
                row.roles.join(", "),
                row.harshaTotal.toString(),
                row.ithasalaCount.toString(),
                row.easarphaCount.toString(),
                Number.isFinite(row.munthaOrb) ? `${row.munthaAspect} | ${row.munthaOrb.toFixed(2)}deg` : "--",
                row.muddaActive ? "Ativo" : "--",
                row.patyayiniActive ? "Ativa" : "--",
                row.score.toFixed(2),
              ]),
              "Score operacional = hits Panchadhikari x 5 + Harsha Bala + contatos anuais + contato com Muntha + ativacao do periodo anual e do subperiodo."
            ),
            createTable(
              `${module}-annual-convergence`,
              "Scorecard de Convergencia Anual",
              ["Filtro", "Estado", "Score", "Nota"],
              annualConvergenceRows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
              "Resume o quanto escola anual, periodos, contatos, Muntha, Sahams e yogas Tajika estao falando a mesma lingua nesta rodada."
            ),
            createTable(
              `${module}-tajika-transfers`,
              "Transferencias Tajika",
              ["Tecnica", "Estado", "Score", "Nota"],
              tajikaTransferRows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
              "Painel curto de Nakta, Yamaya e Kamboola para separar transferencia forte, simples ou ausente dentro do working set anual."
            ),
            createTable(
              `${module}-saham-priority`,
              "Foco anual dos Sahams",
              ["Saham", "Tema", "Linha", "Signo", "Grau", "Senhor", "Varshesh", "Mudda", "Sub", "Dist. Varsha Lagna", "Dist. Muntha", "Score"],
              sahamPriority.rows.map((row) => [
                row.name,
                row.theme,
                row.lineage,
                row.signName,
                `${row.degreeInSign.toFixed(2)}deg`,
                row.signLord,
                row.lordMatchesVarshesh ? "Sim" : "Nao",
                row.lordMatchesMudda ? "Sim" : "Nao",
                row.lordMatchesSub ? "Sim" : "Nao",
                `${row.lagnaDistance.toFixed(2)}deg`,
                `${row.munthaDistance.toFixed(2)}deg`,
                row.score.toString(),
              ]),
              "Prioridade anual sobre a grade ampliada de Sahams classicos, cruzando proximidade, Muntha e repeticao dos lordes de Varshesh, Mudda e subperiodo."
            ),
            createTable(
              `${module}-saham-lineages`,
              "Sahams por linha e fonte",
              ["Linha", "Total", "Tema dominante", "Saham lider", "Media de score", "Alinhamentos", "Nota"],
              sahamLineages.map((row) => [
                row.lineage,
                row.count.toString(),
                row.topTheme,
                row.topSaham,
                row.averageScore.toFixed(2),
                row.alignmentHits.toString(),
                row.note,
              ]),
              "Resumo das linhas de Sahams portadas nesta etapa, para mostrar qual fonte sustenta melhor o ano atual."
            ),
            createTable(
              `${module}-patyayini-school-v2`,
              "Subperiodos por escola",
              ["Escola", "Periodo ativo", "Subperiodo ativo", "Trecho", "Nota"],
              muddaSchoolRows.map((row) => [
                row.school,
                normalizeTajikaLordLabel(row.activePeriod.lord),
                `${normalizeTajikaLordLabel(row.activeSubPeriod.maha)} / ${normalizeTajikaLordLabel(row.activeSubPeriod.lord)}`,
                row.activePeriod.segment,
                row.activeSubPeriod.note,
              ]),
              "A escola muda o agrupamento inicial do periodo anual; a subdivisao interna segue multiplicadores classicos nas escolas de Mudda e produto dos periodos/360 em Balarama."
            ),
            createTable(
              `${module}-tajika-yogas-v1`,
              "Nakta, Yamaya e Kamboola",
              ["Yoga", "Par base", "Mediador", "Estado", "Score", "Nota"],
              tajikaYogas.map((row) => [
                row.yoga,
                row.planets,
                row.mediator,
                row.state,
                row.score.toFixed(2),
                row.note,
              ]),
              "Working set de yogas Tajika por transferencia de luz e apoio lunar, filtrado pela mesma malha anual de deeptamsha."
            ),
          ],
        }),
      ],
      validations: [
        createValidation(
          "info",
          "O motor anual agora compara Gauri, Mahadeva e Balarama e escolhe a escola operacional por coerencia tecnica do ano; Tasira e outras familias ainda seguem abertas.",
          "varshaphala",
          "annual-school-ranking-v1"
        ),
        ...(annualReturn.mode === "approximate"
          ? [
              createValidation(
                "warning",
                `O retorno solar exato nao foi localizado; esta leitura anual usa a carta do aniversario civil como aproximacao auditavel. Motivo original: ${annualReturn.sourceError ?? "erro desconhecido"}.`,
                "selectedYear",
                "solar-return-civil-fallback"
              ),
            ]
          : []),
        ...(muddaSchoolRanking.contested
          ? [
              createValidation(
                "warning",
                `A escolha anual entre ${mudda.school} e ${muddaSchoolRanking.runnerUp?.school ?? "--"} ficou apertada (${muddaSchoolRanking.scoreSpread.toFixed(2)} pts). Trate o ano como disputa tecnica entre escolas.`,
                "varshaphala",
                "annual-school-close-call"
              ),
            ]
          : []),
        createValidation(
          "info",
          "Sahams anuais agora usam addends especificos, correcao de um signo pelo ponto projetor e painel de leitura por linha/fonte dentro do bloco Tajika.",
          "varshaphala",
          "sahama-classic-v2"
        ),
      ],
      summary: [
        annualReturn.mode === "exact"
          ? `Retorno solar encontrado para ${selectedYear} em ${solarReturn.returnTime}.`
          : `Retorno solar exato indisponivel; leitura anual aproximada pelo aniversario civil em ${solarReturn.returnTime}.`,
        `Muntha atual em ${SIGNS[munthaSignIndex]}, com Varshesh candidato em ${varsheshCandidate}.`,
        `Escola anual operacional: ${mudda.school}, com periodo ativo em ${activeMuddaLabel} e score ${muddaSchoolRanking.leader.coherenceScore.toFixed(2)}${muddaSchoolRanking.runnerUp ? `; vice-lider ${muddaSchoolRanking.runnerUp.school} a ${muddaSchoolRanking.scoreSpread.toFixed(2)} pts.` : "."}`,
        `Varshesh operacional v2 em ${varsheshRanking.leader.planet}, com subperiodo anual ativo em ${activePatyayiniLabel}.`,
        `${annualConvergenceState} com score ${annualConvergenceScore}.`,
        `${varsheshBridgeState}; ${tajikaTransferState.toLowerCase()}.`,
        `Painel Tajika anual com ${ithasalaCount} Ithasala, ${easarphaCount} Easarpha e ${tajikaYogas.length} yogas candidatos.`,
        `Harsha Bala lider em ${strongestHarsha.planet} com ${strongestHarsha.total}/20.`,
        `Sahams anuais revistos com ${sahams.length} formulas classicas portadas nesta etapa; linha lider ${sahamLineages[0]?.lineage ?? "--"}.`,
      ],
    };
  } catch (error) {
    return {
      sections: [
        createSection({
          id: `${module}-varshaphala-fallback`,
          title: "Varshaphala / Tajika",
          description:
            "O modulo tentou localizar o retorno solar real, mas caiu em fallback tecnico para nao quebrar a suite.",
          status: "implemented",
          items: [
            createDatum(module, "Varshaphala", "Ano consultado", selectedYear, {
              technicalNotes: "Ano-base ainda reconhecido mesmo com falha no retorno.",
              confidence: 0.92,
            }),
            createDatum(module, "Varshaphala", "Muntha", `${SIGNS[munthaSignIndex]} | casa ${munthaHouse}`, {
              technicalNotes: `Fallback anual sem retorno solar completo. Regente atual: ${munthaLord}.`,
              confidence: 0.68,
              status: "implemented",
            }),
          ],
        }),
      ],
      validations: [
        createValidation(
          "warning",
          `O retorno solar nao foi concluido nesta tentativa: ${(error as Error)?.message ?? "erro desconhecido"}`,
          "selectedYear",
          "solar-return-engine"
        ),
      ],
    };
  }
}
