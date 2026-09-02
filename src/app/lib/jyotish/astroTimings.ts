import moment from "moment-timezone";
import { getSwe } from "../astrologyEngine";

export interface SolarDayTimings {
  sunrise?: number;
  sunset?: number;
  solarNoon?: number;
  daylightHours?: number;
  nightHours?: number;
}

export interface LunarDayTimings {
  moonrise?: number;
  moonset?: number;
  source: string;
  note: string;
}

export interface MuhurtaWindow {
  key: string;
  label: string;
  start?: number;
  end?: number;
  note: string;
}

export interface PlanetaryHourContext {
  dayRuler: string;
  hourRuler: string;
  period: string;
  hourNumber: number;
  note: string;
}

const MOON_STANDARD_ALTITUDE_DEGREES = -0.3;
const SWISS_MOON_BODY_ID = 1;
const SWISS_EQUATORIAL_SPEED_FLAGS = 2308;

const WEEKDAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const HORA_SEQUENCE = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
const RAHU_SEGMENT = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_SEGMENT = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEGMENT = [7, 6, 5, 4, 3, 2, 1];

function normalize360(value: number) {
  return ((value % 360) + 360) % 360;
}

export function julianDayFromDate(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function formatSiderealClock(degrees: number) {
  const normalizedHours = normalize360(degrees) / 15;
  const totalSeconds = Math.round(normalizedHours * 3600) % 86400;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function buildSiderealAuditContext(
  dateText: string,
  timeText: string,
  timezone: string,
  longitude: number
) {
  const momentRef = moment.tz(
    `${dateText} ${timeText}`,
    ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"],
    timezone
  );
  const julianDay = julianDayFromDate(momentRef.toDate());
  const degrees = localSiderealTimeDegrees(julianDay, longitude);

  return {
    julianDay,
    degrees,
    hours: degrees / 15,
    clockLabel: formatSiderealClock(degrees),
  };
}

function safeCalculatePosition(
  sw: Awaited<ReturnType<typeof getSwe>>,
  julianDay: number,
  bodyId: number,
  flags: number
) {
  const moduleRef = (sw as any).module;
  const xxPtr = moduleRef._malloc(6 * 8);
  const serrPtr = moduleRef._malloc(256);

  try {
    const retflag = moduleRef.ccall(
      "swe_calc_ut_wrap",
      "number",
      ["number", "number", "number", "number", "number"],
      [julianDay, bodyId, flags, xxPtr, serrPtr]
    );

    if (retflag < 0) {
      throw new Error(moduleRef.UTF8ToString(serrPtr));
    }

    const values = Array.from({ length: 6 }, (_, index) =>
      moduleRef.getValue(xxPtr + index * 8, "double")
    );

    return {
      longitude: values[0],
      latitude: values[1],
      distance: values[2],
      longitudeSpeed: values[3],
      latitudeSpeed: values[4],
      distanceSpeed: values[5],
      flags: retflag,
    };
  } finally {
    moduleRef._free(xxPtr);
    moduleRef._free(serrPtr);
  }
}

function dayOfYear(year: number, month: number, day: number) {
  const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  if (isLeapYear) {
    monthLengths[1] = 29;
  }

  let total = day;
  for (let index = 0; index < month - 1; index += 1) {
    total += monthLengths[index];
  }
  return total;
}

function solarEventUtcMinutes(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  sunrise: boolean
): number | undefined {
  const zenith = 90.833;
  const nDay = dayOfYear(year, month, day);
  const lngHour = longitude / 15;
  const t = nDay + ((sunrise ? 6 : 18) - lngHour) / 24;
  const meanAnomaly = 0.9856 * t - 3.289;
  const trueLongitude = normalize360(
    meanAnomaly +
      1.916 * Math.sin((meanAnomaly * Math.PI) / 180) +
      0.02 * Math.sin((2 * meanAnomaly * Math.PI) / 180) +
      282.634
  );

  let rightAscension =
    (Math.atan(0.91764 * Math.tan((trueLongitude * Math.PI) / 180)) * 180) /
    Math.PI;
  rightAscension = normalize360(rightAscension);
  rightAscension +=
    Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
  rightAscension /= 15;

  const sinDeclination = 0.39782 * Math.sin((trueLongitude * Math.PI) / 180);
  const cosDeclination = Math.cos(Math.asin(sinDeclination));
  const cosHour =
    (Math.cos((zenith * Math.PI) / 180) -
      sinDeclination * Math.sin((latitude * Math.PI) / 180)) /
    (cosDeclination * Math.cos((latitude * Math.PI) / 180));

  if (cosHour > 1 || cosHour < -1) {
    return undefined;
  }

  let hourAngle = (Math.acos(cosHour) * 180) / Math.PI;
  if (sunrise) {
    hourAngle = 360 - hourAngle;
  }
  hourAngle /= 15;

  const localMeanTime = hourAngle + rightAscension - 0.06571 * t - 6.622;
  return normalize360((localMeanTime - lngHour) * 15) * 4;
}

function utcMinutesToLocalDecimal(
  year: number,
  month: number,
  day: number,
  minutes: number,
  timezone: string
) {
  const base = moment
    .utc(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} 00:00`,
      "YYYY-MM-DD HH:mm"
    )
    .add(minutes, "minutes")
    .tz(timezone);

  return base.hour() + base.minute() / 60 + base.second() / 3600;
}

function buildSegment(
  start: number,
  end: number,
  segmentIndex: number,
  totalSegments: number
) {
  const segmentLength = (end - start) / totalSegments;
  const segmentStart = start + (segmentIndex - 1) * segmentLength;
  return {
    start: segmentStart,
    end: segmentStart + segmentLength,
  };
}

function buildRulerForHour(dayRuler: string, hourNumber: number) {
  const startIndex = HORA_SEQUENCE.indexOf(dayRuler);
  if (startIndex === -1 || hourNumber <= 0) {
    return "nao calculado";
  }
  return HORA_SEQUENCE[(startIndex + hourNumber - 1) % HORA_SEQUENCE.length];
}

export function decimalHourToClockText(value?: number) {
  if (!Number.isFinite(value ?? Number.NaN)) {
    return "--";
  }

  const totalMinutes = Math.round((value ?? 0) * 60);
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = ((totalMinutes % 60) + 60) % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function buildSolarDayTimings(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  timezone: string
): SolarDayTimings {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {};
  }

  const sunriseUtc = solarEventUtcMinutes(year, month, day, latitude, longitude, true);
  const sunsetUtc = solarEventUtcMinutes(year, month, day, latitude, longitude, false);
  const sunrise =
    sunriseUtc === undefined
      ? undefined
      : utcMinutesToLocalDecimal(year, month, day, sunriseUtc, timezone);
  const sunset =
    sunsetUtc === undefined
      ? undefined
      : utcMinutesToLocalDecimal(year, month, day, sunsetUtc, timezone);
  const daylightHours =
    Number.isFinite(sunrise ?? Number.NaN) && Number.isFinite(sunset ?? Number.NaN)
      ? (sunset ?? 0) - (sunrise ?? 0)
      : undefined;

  return {
    sunrise,
    sunset,
    solarNoon:
      Number.isFinite(daylightHours ?? Number.NaN) && Number.isFinite(sunrise ?? Number.NaN)
        ? (sunrise ?? 0) + (daylightHours ?? 0) / 2
        : undefined,
    daylightHours,
    nightHours:
      Number.isFinite(daylightHours ?? Number.NaN)
        ? 24 - (daylightHours ?? 0)
        : undefined,
  };
}

export function buildMuhurtaWindows(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  timezone: string
): { timings: SolarDayTimings; windows: MuhurtaWindow[] } {
  const timings = buildSolarDayTimings(year, month, day, latitude, longitude, timezone);
  const sunrise = timings.sunrise;
  const sunset = timings.sunset;
  const weekdayIndex = moment.tz(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    "YYYY-MM-DD",
    timezone
  ).day();

  if (!Number.isFinite(sunrise ?? Number.NaN) || !Number.isFinite(sunset ?? Number.NaN)) {
    return {
      timings,
      windows: [
        {
          key: "unavailable",
          label: "Janelas classicas",
          note: "Sem nascer e por do Sol locais, o modulo nao consegue dividir o dia em yamas.",
        },
      ],
    };
  }

  const dayStart = sunrise ?? 6;
  const dayEnd = sunset ?? 18;
  const rahu = buildSegment(dayStart, dayEnd, RAHU_SEGMENT[weekdayIndex], 8);
  const yamaganda = buildSegment(dayStart, dayEnd, YAMAGANDA_SEGMENT[weekdayIndex], 8);
  const gulika = buildSegment(dayStart, dayEnd, GULIKA_SEGMENT[weekdayIndex], 8);
  const solarNoon = timings.solarNoon ?? (dayStart + dayEnd) / 2;
  const daylight = timings.daylightHours ?? dayEnd - dayStart;
  const abhijitHalfSpan = daylight / 30;

  return {
    timings,
    windows: [
      {
        key: "rahu-kalam",
        label: "Rahu Kalam",
        start: rahu.start,
        end: rahu.end,
        note: "Faixa diurna tradicionalmente evitada para comecos auspiciosos.",
      },
      {
        key: "yamaganda",
        label: "Yamaganda",
        start: yamaganda.start,
        end: yamaganda.end,
        note: "Outra divisao diurna tradicionalmente cautelosa para inicios.",
      },
      {
        key: "gulika-kalam",
        label: "Gulika Kalam",
        start: gulika.start,
        end: gulika.end,
        note: "Segmento regido por Shani no metodo de oito partes do dia.",
      },
      {
        key: "abhijit",
        label: "Abhijit Muhurta",
        start: solarNoon - abhijitHalfSpan,
        end: solarNoon + abhijitHalfSpan,
        note: "Janela centrada no meio do dia solar; aqui calculada a partir do arco diurno local.",
      },
    ],
  };
}

export function buildPlanetaryHourContext(
  year: number,
  month: number,
  day: number,
  localTime: number,
  latitude: number,
  longitude: number,
  timezone: string
): PlanetaryHourContext {
  const date = moment.tz(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    "YYYY-MM-DD",
    timezone
  );
  const weekdayIndex = date.day();
  const dayRuler = WEEKDAY_RULERS[weekdayIndex];
  const today = buildSolarDayTimings(year, month, day, latitude, longitude, timezone);

  if (
    !Number.isFinite(localTime) ||
    !Number.isFinite(today.sunrise ?? Number.NaN) ||
    !Number.isFinite(today.sunset ?? Number.NaN)
  ) {
    return {
      dayRuler,
      hourRuler: "nao calculado",
      period: "indefinido",
      hourNumber: 0,
      note: "Hora planetaria requer nascer e por do Sol locais validos.",
    };
  }

  const sunrise = today.sunrise ?? 6;
  const sunset = today.sunset ?? 18;
  let hourNumber = 1;
  let period = "diurno";
  let effectiveDayRuler = dayRuler;

  if (localTime >= sunrise && localTime < sunset) {
    const hourLength = (sunset - sunrise) / 12;
    hourNumber = Math.min(12, Math.max(1, Math.floor((localTime - sunrise) / hourLength) + 1));
  } else if (localTime >= sunset) {
    const nextDate = date.clone().add(1, "day");
    const next = buildSolarDayTimings(
      nextDate.year(),
      nextDate.month() + 1,
      nextDate.date(),
      latitude,
      longitude,
      timezone
    );
    const nextSunrise = (next.sunrise ?? sunrise) + 24;
    const hourLength = (nextSunrise - sunset) / 12;
    hourNumber = Math.min(24, Math.max(13, 13 + Math.floor((localTime - sunset) / hourLength)));
    period = "noturno";
  } else {
    const previousDate = date.clone().subtract(1, "day");
    effectiveDayRuler = WEEKDAY_RULERS[previousDate.day()];
    const previous = buildSolarDayTimings(
      previousDate.year(),
      previousDate.month() + 1,
      previousDate.date(),
      latitude,
      longitude,
      timezone
    );
    const previousSunset = previous.sunset ?? sunset;
    const hourLength = (24 - previousSunset + sunrise) / 12;
    hourNumber = Math.min(
      24,
      Math.max(13, 13 + Math.floor((24 - previousSunset + localTime) / hourLength))
    );
    period = "noturno antes do nascer do Sol";
  }

  return {
    dayRuler: effectiveDayRuler,
    hourRuler: buildRulerForHour(effectiveDayRuler, hourNumber),
    period,
    hourNumber,
    note: "Hora planetaria derivada do nascer e por do Sol locais no metodo diurno/noturno de 12 partes.",
  };
}

export function buildSolarCalendarContext(sunSignIndex: number, referenceYear: number) {
  const masaBySign = [
    "Mesha Masa",
    "Vrishabha Masa",
    "Mithuna Masa",
    "Karka Masa",
    "Simha Masa",
    "Kanya Masa",
    "Tula Masa",
    "Vrischika Masa",
    "Dhanu Masa",
    "Makara Masa",
    "Kumbha Masa",
    "Meena Masa",
  ];
  const rituBySign = [
    "Vasanta",
    "Vasanta",
    "Grishma",
    "Grishma",
    "Varsha",
    "Varsha",
    "Sharad",
    "Sharad",
    "Hemanta",
    "Hemanta",
    "Shishira",
    "Shishira",
  ];

  return {
    masa: masaBySign[sunSignIndex] ?? "Masa nao definido",
    ritu: rituBySign[sunSignIndex] ?? "Ritu nao definido",
    ayana: sunSignIndex >= 9 || sunSignIndex <= 2 ? "Uttarayana" : "Dakshinayana",
    samvatsaraSeed: `${referenceYear % 60}`,
  };
}

export function localSiderealTimeDegrees(julianDay: number, longitude: number) {
  const t = (julianDay - 2451545.0) / 36525;
  const gmst =
    280.46061837 +
    360.98564736629 * (julianDay - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return normalize360(gmst + longitude);
}

async function localDecimalToJulianDay(
  swe: Awaited<ReturnType<typeof getSwe>>,
  year: number,
  month: number,
  day: number,
  localDecimalHour: number,
  timezone: string
) {
  const base = moment
    .tz(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} 00:00:00`,
      "YYYY-MM-DD HH:mm:ss",
      timezone
    )
    .add(Math.round(localDecimalHour * 3600), "seconds")
    .utc();

  return swe.julianDay(
    base.year(),
    base.month() + 1,
    base.date(),
    base.hour() + base.minute() / 60 + base.second() / 3600,
    1
  );
}

async function moonAltitudeDegrees(
  swe: Awaited<ReturnType<typeof getSwe>>,
  year: number,
  month: number,
  day: number,
  localDecimalHour: number,
  latitude: number,
  longitude: number,
  timezone: string
) {
  const julianDay = await localDecimalToJulianDay(swe, year, month, day, localDecimalHour, timezone);
  const moon = safeCalculatePosition(
    swe,
    julianDay,
    SWISS_MOON_BODY_ID,
    SWISS_EQUATORIAL_SPEED_FLAGS
  );

  const rightAscension = moon.longitude;
  const declination = moon.latitude;
  const hourAngle = normalize360(localSiderealTimeDegrees(julianDay, longitude) - rightAscension);
  const signedHourAngle = hourAngle > 180 ? hourAngle - 360 : hourAngle;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const declinationRadians = (declination * Math.PI) / 180;
  const hourAngleRadians = (signedHourAngle * Math.PI) / 180;
  const altitude =
    (Math.asin(
      Math.sin(latitudeRadians) * Math.sin(declinationRadians) +
        Math.cos(latitudeRadians) * Math.cos(declinationRadians) * Math.cos(hourAngleRadians)
    ) *
      180) /
    Math.PI;

  return altitude;
}

async function refineLunarCrossing(
  swe: Awaited<ReturnType<typeof getSwe>>,
  year: number,
  month: number,
  day: number,
  startHour: number,
  endHour: number,
  latitude: number,
  longitude: number,
  timezone: string
) {
  let low = startHour;
  let high = endHour;
  let lowAltitude = await moonAltitudeDegrees(swe, year, month, day, low, latitude, longitude, timezone);

  for (let iteration = 0; iteration < 18; iteration += 1) {
    const middle = (low + high) / 2;
    const middleAltitude = await moonAltitudeDegrees(
      swe,
      year,
      month,
      day,
      middle,
      latitude,
      longitude,
      timezone
    );

    if (Math.sign(middleAltitude - MOON_STANDARD_ALTITUDE_DEGREES) === Math.sign(lowAltitude - MOON_STANDARD_ALTITUDE_DEGREES)) {
      low = middle;
      lowAltitude = middleAltitude;
    } else {
      high = middle;
    }

    if (Math.abs(high - low) < 1 / 120) {
      break;
    }
  }

  return (low + high) / 2;
}

export async function buildLunarDayTimings(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  timezone: string
): Promise<LunarDayTimings> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      source: "Swiss Ephemeris + altitude solver",
      note: "Sem latitude e longitude validas, a rotina lunar nao pode operar.",
    };
  }

  const swe = await getSwe();
  const samples: Array<{ hour: number; altitude: number }> = [];
  for (let hour = 0; hour <= 24; hour += 1) {
    samples.push({
      hour,
      altitude: await moonAltitudeDegrees(swe, year, month, day, hour, latitude, longitude, timezone),
    });
  }

  let moonrise: number | undefined;
  let moonset: number | undefined;

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    const previousDiff = previous.altitude - MOON_STANDARD_ALTITUDE_DEGREES;
    const currentDiff = current.altitude - MOON_STANDARD_ALTITUDE_DEGREES;

    if (previousDiff === 0) {
      if (moonrise === undefined) {
        moonrise = previous.hour;
      }
      continue;
    }

    if (previousDiff * currentDiff <= 0) {
      const crossing = await refineLunarCrossing(
        swe,
        year,
        month,
        day,
        previous.hour,
        current.hour,
        latitude,
        longitude,
        timezone
      );
      if (current.altitude > previous.altitude && moonrise === undefined) {
        moonrise = crossing;
      } else if (current.altitude < previous.altitude && moonset === undefined) {
        moonset = crossing;
      }
    }
  }

  return {
    moonrise,
    moonset,
    source: "Swiss Ephemeris + altitude solver",
    note:
      "Moonrise e moonset obtidos por busca horaria e refinamento binario sobre altura local da Lua, usando coordenadas equatoriais do Swiss Ephemeris.",
  };
}
