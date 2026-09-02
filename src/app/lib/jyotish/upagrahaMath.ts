import moment from "moment-timezone";
import type { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { calculateBirthChart } from "../astrologyEngine";
import type { VedicSnapshot } from "../vedic";
import { buildSolarDayTimings } from "./astroTimings";

const SIGN_NAMES = [
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
] as const;

const DAY_PART_RULERS = [
  ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", null],
  ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", null, "Sun"],
  ["Mars", "Mercury", "Jupiter", "Venus", "Saturn", null, "Sun", "Moon"],
  ["Mercury", "Jupiter", "Venus", "Saturn", null, "Sun", "Moon", "Mars"],
  ["Jupiter", "Venus", "Saturn", null, "Sun", "Moon", "Mars", "Mercury"],
  ["Venus", "Saturn", null, "Sun", "Moon", "Mars", "Mercury", "Jupiter"],
  ["Saturn", null, "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus"],
] as const;
const NIGHT_PART_RULERS = [
  ["Jupiter", "Venus", "Saturn", null, "Sun", "Moon", "Mars", "Mercury"],
  ["Venus", "Saturn", null, "Sun", "Moon", "Mars", "Mercury", "Jupiter"],
  ["Saturn", null, "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus"],
  ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", null],
  ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", null, "Sun"],
  ["Mars", "Mercury", "Jupiter", "Venus", "Saturn", null, "Sun", "Moon"],
  ["Mercury", "Jupiter", "Venus", "Saturn", null, "Sun", "Moon", "Mars"],
] as const;

export interface UpagrahaComputedPoint {
  key: string;
  name: string;
  longitude: number;
  signName: string;
  degreeInSign: number;
  house: number;
  note: string;
}

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function toPoint(
  key: string,
  name: string,
  longitude: number,
  ascendantSignIndex: number,
  note: string
): UpagrahaComputedPoint {
  const normalized = modulo(longitude, 360);
  const signIndex = Math.floor(normalized / 30) % 12;
  const degreeInSign = normalized % 30;
  const house = modulo(signIndex - ascendantSignIndex, 12) + 1;

  return {
    key,
    name,
    longitude: normalized,
    signName: SIGN_NAMES[signIndex],
    degreeInSign,
    house,
    note,
  };
}

function decimalToTimeString(value: number) {
  const normalized = modulo(value * 60, 24 * 60);
  const totalMinutes = Math.round(normalized);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function buildBirthDateAtLocalTime(snapshot: VedicSnapshot, localDecimalHour: number): BirthDate {
  const [year, month, day] = snapshot.referenceDate.split("-").map(Number);
  return {
    year,
    month,
    day,
    time: decimalToTimeString(localDecimalHour),
    gender: snapshot.gender,
    coordinates: {
      name: snapshot.name,
      latitude: snapshot.latitude,
      longitude: snapshot.longitude,
      timezone: snapshot.timezone,
      timezoneSource: "user",
    },
  };
}

async function ascendantLongitudeAtLocalTime(snapshot: VedicSnapshot, localDecimalHour: number) {
  const chart = await calculateBirthChart(buildBirthDateAtLocalTime(snapshot, localDecimalHour));
  return chart.housesData.ascendant;
}

function buildSunBasedUpagrahas(snapshot: VedicSnapshot) {
  const sun = snapshot.planets.find((point) => point.key === "sun");
  if (!sun) {
    return [];
  }

  const dhuma = modulo(sun.longitude + 133 + 20 / 60, 360);
  const vyatipata = modulo(360 - dhuma, 360);
  const parivesha = modulo(vyatipata + 180, 360);
  const indrachapa = modulo(360 - parivesha, 360);
  const upaketu = modulo(indrachapa + 16 + 40 / 60, 360);

  return [
    toPoint(
      "dhooma",
      "Dhooma",
      dhuma,
      snapshot.ascendant.signIndex,
      "Sun-based upagraha calculado por Sun + 133deg20min."
    ),
    toPoint(
      "vyatipata",
      "Vyatipata",
      vyatipata,
      snapshot.ascendant.signIndex,
      "Sun-based upagraha calculado por 360deg - Dhooma."
    ),
    toPoint(
      "parivesha",
      "Parivesha",
      parivesha,
      snapshot.ascendant.signIndex,
      "Sun-based upagraha calculado por Vyatipata + 180deg."
    ),
    toPoint(
      "indrachapa",
      "Indrachapa",
      indrachapa,
      snapshot.ascendant.signIndex,
      "Sun-based upagraha calculado por 360deg - Parivesha."
    ),
    toPoint(
      "upaketu",
      "Upaketu",
      upaketu,
      snapshot.ascendant.signIndex,
      "Sun-based upagraha calculado por Indrachapa + 16deg40min."
    ),
  ];
}

function getTemporalContext(snapshot: VedicSnapshot) {
  const [year, month, day] = snapshot.referenceDate.split("-").map(Number);
  const timings = buildSolarDayTimings(year, month, day, snapshot.latitude, snapshot.longitude, snapshot.timezone);
  const localMoment = moment.tz(snapshot.referenceDate, "YYYY-MM-DD", snapshot.timezone);
  const sunrise = timings.sunrise ?? 6;
  const sunset = timings.sunset ?? 18;
  const birthHour = snapshot.localBirthHour;

  if (birthHour >= sunrise && birthHour < sunset) {
    return {
      dayNight: "day" as const,
      weekdayIndex: localMoment.day(),
      start: sunrise,
      duration: (timings.daylightHours ?? sunset - sunrise),
      note: "Nascimento diurno: partes do dia medidas a partir do nascer do Sol.",
    };
  }

  if (birthHour < sunrise) {
    const previousDate = localMoment.clone().subtract(1, "day");
    const previousTimings = buildSolarDayTimings(
      previousDate.year(),
      previousDate.month() + 1,
      previousDate.date(),
      snapshot.latitude,
      snapshot.longitude,
      snapshot.timezone
    );
    const previousSunset = previousTimings.sunset ?? 18;
    return {
      dayNight: "night" as const,
      weekdayIndex: previousDate.day(),
      start: previousSunset,
      duration: (24 - previousSunset) + sunrise,
      note: "Nascimento antes do nascer do Sol: noite contada a partir do por do Sol do dia anterior.",
    };
  }

  return {
    dayNight: "night" as const,
    weekdayIndex: localMoment.day(),
    start: sunset,
    duration: (timings.nightHours ?? 24 - (timings.daylightHours ?? 12)),
    note: "Nascimento noturno: partes da noite medidas a partir do por do Sol.",
  };
}

function normalizeHourFromContext(startHour: number, offsetHours: number) {
  return modulo(startHour + offsetHours, 24);
}

async function buildTemporalUpagrahas(snapshot: VedicSnapshot) {
  const context = getTemporalContext(snapshot);
  const partLength = context.duration / 8;
  const rulers =
    context.dayNight === "day"
      ? DAY_PART_RULERS[context.weekdayIndex]
      : NIGHT_PART_RULERS[context.weekdayIndex];

  const targetPlanets = [
    { key: "kaala", name: "Kala", ruler: "Sun", midpoint: true },
    { key: "mrityu", name: "Mrityu", ruler: "Mars", midpoint: true },
    { key: "ardhaprahara", name: "Ardhaprahara", ruler: "Mercury", midpoint: true },
    { key: "yamakantaka", name: "Yamakantaka", ruler: "Jupiter", midpoint: true },
    { key: "gulika", name: "Gulika", ruler: "Saturn", midpoint: true },
    { key: "mandi", name: "Mandi", ruler: "Saturn", midpoint: false },
  ] as const;

  const results: UpagrahaComputedPoint[] = [];

  for (const target of targetPlanets) {
    const partIndex = rulers.findIndex((ruler) => ruler === target.ruler);
    if (partIndex === -1) {
      continue;
    }

    const offset = partIndex * partLength + (target.midpoint ? partLength / 2 : 0);
    const localDecimalHour = normalizeHourFromContext(context.start, offset);
    const ascendantLongitude = await ascendantLongitudeAtLocalTime(snapshot, localDecimalHour);
    results.push(
      toPoint(
        target.key,
        target.name,
        ascendantLongitude,
        snapshot.ascendant.signIndex,
        `${context.note} ${target.midpoint ? "Ponto medio" : "Inicio"} da parte regida por ${target.ruler}.`
      )
    );
  }

  return results;
}

export async function computeUpagrahaSet(snapshot: VedicSnapshot) {
  const sunBased = buildSunBasedUpagrahas(snapshot);
  const temporal = await buildTemporalUpagrahas(snapshot);
  return [...sunBased, ...temporal];
}
