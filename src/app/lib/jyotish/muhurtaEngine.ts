import type { JyotishContext } from "./types";
import { createDatum, createSection, createTable, signDistance } from "./engineHelpers";
import type { EngineResult, JyotishModuleKey } from "./types";
import {
  buildMuhurtaWindows,
  buildPlanetaryHourContext,
  buildSolarDayTimings,
  decimalHourToClockText,
} from "./astroTimings";

const TARA_SEQUENCE = [
  "Janma",
  "Sampat",
  "Vipat",
  "Kshema",
  "Pratyari",
  "Sadhaka",
  "Naidhana",
  "Mitra",
  "Parama Mitra",
];

const GENERAL_INAUSPICIOUS_DAY_MUHURTAS = new Set([1, 2, 4, 10, 11, 12, 15]);
const WEEKDAY_DURMUHURTA_MAP: Record<number, number[]> = {
  0: [14],
  1: [8, 12],
  2: [4, 11],
  3: [8],
  4: [12, 13],
  5: [4, 8],
  6: [1, 2],
};
const WEEKDAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;
const HORA_SEQUENCE = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"] as const;
const RAHU_SEGMENT = [8, 2, 7, 5, 6, 4, 3] as const;
const YAMAGANDA_SEGMENT = [5, 4, 3, 2, 1, 7, 6] as const;
const GULIKA_SEGMENT = [7, 6, 5, 4, 3, 2, 1] as const;
const SUPPORTIVE_HOUR_RULERS = new Set(["Moon", "Mercury", "Jupiter", "Venus"]);
const DEMANDING_HOUR_RULERS = new Set(["Mars", "Saturn"]);
const CLASSICAL_MALEFIC_DAY_RULERS = new Set(["Sun", "Mars", "Saturn"]);
const TITHI_FAMILY_SEQUENCE = ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"] as const;
const VARIABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"] as const;
const FIXED_KARANAS: Record<number, string> = {
  0: "Kimstughna",
  57: "Shakuni",
  58: "Chatushpada",
  59: "Naga",
};
const CLASSICAL_DISRUPTIVE_YOGAS = new Set([
  "vishkambha",
  "atiganda",
  "shula",
  "ganda",
  "vyaghata",
  "vajra",
  "vyatipata",
  "parigha",
  "vaidhriti",
]);
const NAKSHATRA_NATURES = [
  "Light/Swift",
  "Fierce/Ugra",
  "Mixed/Common",
  "Fixed/Dhruva",
  "Soft/Mridu",
  "Sharp/Tikshna",
  "Movable/Chara",
  "Light/Swift",
  "Sharp/Tikshna",
  "Fierce/Ugra",
  "Fierce/Ugra",
  "Fixed/Dhruva",
  "Light/Swift",
  "Soft/Mridu",
  "Movable/Chara",
  "Mixed/Common",
  "Soft/Mridu",
  "Sharp/Tikshna",
  "Sharp/Tikshna",
  "Fierce/Ugra",
  "Fixed/Dhruva",
  "Movable/Chara",
  "Movable/Chara",
  "Movable/Chara",
  "Fierce/Ugra",
  "Fixed/Dhruva",
  "Soft/Mridu",
] as const;

const MUHURTA_EVENT_RULES = [
  {
    key: "marriage",
    label: "Casamento e uniao",
    keywords: ["casamento", "casar", "noivado", "uniao", "parceria", "aliança", "alianca", "relacionamento", "matrimonio"],
    supportiveDayRulers: ["Moon", "Mercury", "Jupiter", "Venus"],
    cautionDayRulers: ["Mars", "Saturn"],
    supportiveTithiFamilies: ["Nanda", "Bhadra", "Purna"],
    cautionTithiFamilies: ["Rikta"],
    supportiveNakshatraNatures: ["Soft/Mridu", "Fixed/Dhruva", "Light/Swift"],
    cautionNakshatraNatures: ["Sharp/Tikshna", "Fierce/Ugra"],
    supportiveKaranas: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija"],
    cautionKaranas: ["Vishti", "Shakuni", "Chatushpada", "Naga"],
    note: "Perfil classico para uniao, pacto afetivo e estabilidade relacional.",
  },
  {
    key: "contract",
    label: "Assinatura, comercio e inicio civil",
    keywords: ["assinatura", "contrato", "projeto", "empresa", "negocio", "negócio", "abertura", "compra", "venda", "lancamento", "lançamento", "inicio"],
    supportiveDayRulers: ["Mercury", "Jupiter", "Venus", "Moon"],
    cautionDayRulers: ["Saturn"],
    supportiveTithiFamilies: ["Bhadra", "Nanda", "Purna"],
    cautionTithiFamilies: ["Rikta"],
    supportiveNakshatraNatures: ["Light/Swift", "Fixed/Dhruva", "Movable/Chara"],
    cautionNakshatraNatures: ["Sharp/Tikshna"],
    supportiveKaranas: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija"],
    cautionKaranas: ["Vishti", "Shakuni"],
    note: "Perfil para contratos, aberturas, transacoes e começos que pedem fluxo e sustentacao.",
  },
  {
    key: "travel",
    label: "Viagem e deslocamento",
    keywords: ["viagem", "mudanca", "mudança", "deslocamento", "partida", "embarque", "rota", "transporte"],
    supportiveDayRulers: ["Moon", "Mercury", "Jupiter", "Venus"],
    cautionDayRulers: ["Saturn"],
    supportiveTithiFamilies: ["Nanda", "Bhadra", "Jaya"],
    cautionTithiFamilies: ["Rikta"],
    supportiveNakshatraNatures: ["Movable/Chara", "Light/Swift"],
    cautionNakshatraNatures: ["Fixed/Dhruva"],
    supportiveKaranas: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija"],
    cautionKaranas: ["Vishti", "Shakuni"],
    note: "Perfil para trajetos, saidas, mudancas e tudo que pede movimento continuo.",
  },
  {
    key: "property",
    label: "Imovel, construcao e fundacao",
    keywords: ["imovel", "imóvel", "casa", "terreno", "construcao", "construção", "reforma", "fundacao", "fundação", "mudanca de casa"],
    supportiveDayRulers: ["Jupiter", "Venus", "Mercury", "Saturn"],
    cautionDayRulers: ["Moon"],
    supportiveTithiFamilies: ["Bhadra", "Purna"],
    cautionTithiFamilies: ["Rikta"],
    supportiveNakshatraNatures: ["Fixed/Dhruva"],
    cautionNakshatraNatures: ["Movable/Chara", "Sharp/Tikshna"],
    supportiveKaranas: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija"],
    cautionKaranas: ["Vishti", "Naga", "Chatushpada"],
    note: "Perfil para atos que desejam permanencia material e continuidade estrutural.",
  },
  {
    key: "study",
    label: "Estudo, mantra e iniciacao intelectual",
    keywords: ["estudo", "curso", "prova", "ensin", "aprend", "mantra", "iniciacao", "iniciação", "ritual", "puja", "pujā", "consagracao", "consagração"],
    supportiveDayRulers: ["Mercury", "Jupiter", "Moon", "Sun"],
    cautionDayRulers: ["Mars"],
    supportiveTithiFamilies: ["Nanda", "Bhadra", "Purna"],
    cautionTithiFamilies: ["Rikta"],
    supportiveNakshatraNatures: ["Light/Swift", "Soft/Mridu", "Fixed/Dhruva"],
    cautionNakshatraNatures: ["Fierce/Ugra", "Sharp/Tikshna"],
    supportiveKaranas: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija"],
    cautionKaranas: ["Vishti", "Shakuni"],
    note: "Perfil para aprendizado, mantra, puja e atos de refinamento mental ou ritual.",
  },
  {
    key: "surgery",
    label: "Cirurgia, corte e litigio",
    keywords: ["cirurgia", "corte", "litigio", "litígio", "processo", "disputa", "conflito", "operacao", "operação", "extracao", "extração"],
    supportiveDayRulers: ["Mars", "Saturn", "Sun"],
    cautionDayRulers: ["Venus", "Moon"],
    supportiveTithiFamilies: ["Jaya", "Rikta"],
    cautionTithiFamilies: ["Nanda"],
    supportiveNakshatraNatures: ["Sharp/Tikshna", "Fierce/Ugra", "Mixed/Common"],
    cautionNakshatraNatures: ["Soft/Mridu"],
    supportiveKaranas: ["Vishti", "Shakuni", "Chatushpada", "Naga"],
    cautionKaranas: ["Bava", "Balava"],
    note: "Perfil para atos que exigem corte, confronto, extração ou pressão direta.",
  },
] as const;

interface MuhurtaEventCandidate {
  key: string;
  label: string;
  matchedKeywords: string[];
  score: number;
  note: string;
  supportiveDayRulers: readonly string[];
  cautionDayRulers: readonly string[];
  supportiveTithiFamilies: readonly string[];
  cautionTithiFamilies: readonly string[];
  supportiveNakshatraNatures: readonly string[];
  cautionNakshatraNatures: readonly string[];
  supportiveKaranas: readonly string[];
  cautionKaranas: readonly string[];
}

interface MuhurtaEventResolution {
  normalizedEvent: string;
  primary: MuhurtaEventCandidate;
  candidates: MuhurtaEventCandidate[];
  ambiguityBand: string;
  ambiguityNote: string;
}

function hasValidArc(start?: number, end?: number) {
  return Number.isFinite(start ?? Number.NaN) && Number.isFinite(end ?? Number.NaN) && (end ?? 0) > (start ?? 0);
}

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function normalizeEventText(input?: string) {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildGeneralEventProfile(note: string): MuhurtaEventCandidate {
  return {
    key: "general",
    label: "Evento geral",
    matchedKeywords: [],
    score: 0,
    note,
    supportiveDayRulers: ["Moon", "Mercury", "Jupiter", "Venus"],
    cautionDayRulers: ["Mars", "Saturn"],
    supportiveTithiFamilies: ["Nanda", "Bhadra", "Purna"],
    cautionTithiFamilies: ["Rikta"],
    supportiveNakshatraNatures: ["Light/Swift", "Soft/Mridu", "Fixed/Dhruva", "Movable/Chara"],
    cautionNakshatraNatures: ["Sharp/Tikshna", "Fierce/Ugra"],
    supportiveKaranas: ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija"],
    cautionKaranas: ["Vishti", "Shakuni", "Chatushpada", "Naga"],
  };
}

function detectMuhurtaEventProfile(eventType?: string): MuhurtaEventResolution {
  const normalizedEvent = normalizeEventText(eventType);

  if (!normalizedEvent) {
    const primary = buildGeneralEventProfile(
      "Sem tipo de evento informado; o modulo preserva um filtro classico geral de vara, tithi, nakshatra, yoga e karana."
    );
    return {
      normalizedEvent,
      primary,
      candidates: [primary],
      ambiguityBand: "Triagem ausente",
      ambiguityNote: "Sem descricao do evento, a adequacao classica fica geral e nao especializada.",
    };
  }

  const candidates = MUHURTA_EVENT_RULES.map((rule) => {
    const matches = Array.from(new Set(rule.keywords.filter((keyword) => normalizedEvent.includes(keyword))));
    return {
      key: rule.key,
      label: rule.label,
      matchedKeywords: matches,
      score: matches.length,
      note: matches.length ? `Tema reconhecido por ${matches.join(", ")}.` : rule.note,
      supportiveDayRulers: rule.supportiveDayRulers,
      cautionDayRulers: rule.cautionDayRulers,
      supportiveTithiFamilies: rule.supportiveTithiFamilies,
      cautionTithiFamilies: rule.cautionTithiFamilies,
      supportiveNakshatraNatures: rule.supportiveNakshatraNatures,
      cautionNakshatraNatures: rule.cautionNakshatraNatures,
      supportiveKaranas: rule.supportiveKaranas,
      cautionKaranas: rule.cautionKaranas,
    } satisfies MuhurtaEventCandidate;
  })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));

  if (!candidates.length) {
    const primary = buildGeneralEventProfile(
      "O texto do evento nao caiu em nenhuma familia classica forte; o modulo fica em perfil geral."
    );
    return {
      normalizedEvent,
      primary,
      candidates: [primary],
      ambiguityBand: "Sem match especializado",
      ambiguityNote: "O tipo de evento nao fechou categoria classica automatica; a leitura permanece geral.",
    };
  }

  const primary = candidates[0];
  const secondary = candidates[1];
  const closeAlternates = candidates.filter(
    (candidate, index) => index > 0 && candidate.score >= Math.max(1, primary.score - 1)
  );
  const ambiguityBand =
    secondary?.score === primary.score
      ? "Ambiguidade forte"
      : closeAlternates.length
        ? "Ambiguidade moderada"
        : "Perfil dominante";
  const ambiguityNote =
    ambiguityBand === "Perfil dominante"
      ? `O evento foi ancorado principalmente em ${primary.label}.`
      : `${closeAlternates.map((candidate) => candidate.label).join(" | ")} ainda competem com o perfil principal nesta triagem.`;

  return {
    normalizedEvent,
    primary,
    candidates,
    ambiguityBand,
    ambiguityNote,
  };
}

function buildSegment(start: number, end: number, segmentIndex: number, totalSegments: number) {
  const segmentLength = (end - start) / totalSegments;
  const segmentStart = start + (segmentIndex - 1) * segmentLength;
  return {
    start: segmentStart,
    end: segmentStart + segmentLength,
  };
}

function buildRulerForHour(dayRuler: string, hourNumber: number) {
  const startIndex = HORA_SEQUENCE.indexOf(dayRuler as (typeof HORA_SEQUENCE)[number]);
  if (startIndex === -1 || hourNumber <= 0) {
    return "nao calculado";
  }
  return HORA_SEQUENCE[(startIndex + hourNumber - 1) % HORA_SEQUENCE.length];
}

function buildCivilWeekdayIndex(dateText: string) {
  return new Date(`${dateText}T12:00:00Z`).getUTCDay();
}

function buildMuhurtaWindowSet(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  timezone: string
) {
  const base = buildMuhurtaWindows(year, month, day, latitude, longitude, timezone);
  const validArc = hasValidArc(base.timings.sunrise, base.timings.sunset);
  const unavailable = base.windows.some((window) => window.key === "unavailable");

  if (validArc && !unavailable) {
    return {
      timings: base.timings,
      windows: base.windows,
      approximate: false,
      note: "Recorte solar local completo.",
    };
  }

  const weekdayIndex = buildCivilWeekdayIndex(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  const sunrise = 6;
  const sunset = 18;
  const solarNoon = 12;
  const daylightHours = 12;
  const rahu = buildSegment(sunrise, sunset, RAHU_SEGMENT[weekdayIndex], 8);
  const yamaganda = buildSegment(sunrise, sunset, YAMAGANDA_SEGMENT[weekdayIndex], 8);
  const gulika = buildSegment(sunrise, sunset, GULIKA_SEGMENT[weekdayIndex], 8);
  const abhijitHalfSpan = daylightHours / 30;

  return {
    timings: {
      sunrise,
      sunset,
      solarNoon,
      daylightHours,
      nightHours: 12,
    },
    windows: [
      {
        key: "rahu-kalam",
        label: "Rahu Kalam",
        start: rahu.start,
        end: rahu.end,
        note: "Faixa diurna tradicionalmente evitada para comecos auspiciosos. Arco operacional 06:00-18:00.",
      },
      {
        key: "yamaganda",
        label: "Yamaganda",
        start: yamaganda.start,
        end: yamaganda.end,
        note: "Faixa cautelosa operacionalizada em oito partes do arco diurno 06:00-18:00.",
      },
      {
        key: "gulika-kalam",
        label: "Gulika Kalam",
        start: gulika.start,
        end: gulika.end,
        note: "Segmento operacional de Gulika no arco diurno 06:00-18:00.",
      },
      {
        key: "abhijit",
        label: "Abhijit Muhurta",
        start: solarNoon - abhijitHalfSpan,
        end: solarNoon + abhijitHalfSpan,
        note: "Janela centrada no meio do dia operacional, usada apenas quando o arco solar local falhou.",
      },
    ],
    approximate: true,
    note: "Recorte solar local indisponivel; o modulo caiu para o arco operacional 06:00-18:00.",
  };
}

function buildOperationalPlanetaryHourContext(
  year: number,
  month: number,
  day: number,
  localTime: number,
  latitude: number,
  longitude: number,
  timezone: string
) {
  const base = buildPlanetaryHourContext(year, month, day, localTime, latitude, longitude, timezone);
  if (base.hourNumber > 0) {
    return {
      ...base,
      approximate: false,
    };
  }

  const civilWeekdayIndex = buildCivilWeekdayIndex(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  );
  let dayRuler = WEEKDAY_RULERS[civilWeekdayIndex];
  let effectiveDayRuler = dayRuler;
  let hourNumber = 0;
  let period = "indefinido";

  if (Number.isFinite(localTime)) {
    if (localTime >= 6 && localTime < 18) {
      hourNumber = Math.min(12, Math.max(1, Math.floor((localTime - 6) / 1) + 1));
      period = "diurno operacional";
    } else if (localTime >= 18) {
      hourNumber = Math.min(24, Math.max(13, 13 + Math.floor((localTime - 18) / 1)));
      period = "noturno operacional";
    } else {
      effectiveDayRuler = WEEKDAY_RULERS[modulo(civilWeekdayIndex - 1, 7)];
      hourNumber = Math.min(24, Math.max(13, 13 + Math.floor(localTime / 1)));
      period = "noturno operacional antes do nascer do Sol";
    }
  }

  return {
    dayRuler: effectiveDayRuler,
    hourRuler: buildRulerForHour(effectiveDayRuler, hourNumber),
    period,
    hourNumber,
    note: `${base.note} Fallback operacional usando 12 horas diurnas de 06:00-18:00 e 12 horas noturnas de 18:00-06:00.`,
    approximate: true,
  };
}

function buildTithiFamilyContext(sunLongitude: number, moonLongitude: number) {
  const angle = modulo(moonLongitude - sunLongitude, 360);
  const tithiIndex = Math.floor(angle / 12);
  const family = TITHI_FAMILY_SEQUENCE[modulo(tithiIndex, TITHI_FAMILY_SEQUENCE.length)];

  return {
    angle,
    tithiNumber: tithiIndex + 1,
    family,
  };
}

function buildKaranaContext(sunLongitude: number, moonLongitude: number) {
  const angle = modulo(moonLongitude - sunLongitude, 360);
  const slot = Math.floor(angle / 6);
  let name = FIXED_KARANAS[slot];

  if (!name) {
    const cycleIndex = modulo(slot - 1, 7);
    name = VARIABLE_KARANAS[cycleIndex];
  }

  return {
    slot,
    name,
    kind: FIXED_KARANAS[slot] ? "Sthira" : "Chara",
  };
}

function buildYogaContext(sunLongitude: number, moonLongitude: number, yogaLabel: string) {
  const angle = modulo(sunLongitude + moonLongitude, 360);
  const segment = 360 / 27;
  const yogaIndex = Math.floor(angle / segment);
  const progressDegrees = angle % segment;
  const normalizedLabel = normalizeEventText(yogaLabel).replace(/\s+/g, "");
  const disruptive = CLASSICAL_DISRUPTIVE_YOGAS.has(normalizedLabel);

  return {
    angle,
    yogaIndex,
    progressDegrees,
    progressPercent: (progressDegrees / segment) * 100,
    remainingDegrees: segment - progressDegrees,
    disruptive,
  };
}

function buildProfileCriterionBand(
  value: string,
  supportiveValues: readonly string[],
  cautionValues: readonly string[],
  supportiveLabel: string,
  cautionLabel: string,
  neutralLabel: string,
  contextLabel: string
) {
  if (supportiveValues.includes(value)) {
    return {
      label: supportiveLabel,
      score: 2,
      note: `${contextLabel} cai na faixa de apoio do perfil escolhido.`,
    };
  }

  if (cautionValues.includes(value)) {
    return {
      label: cautionLabel,
      score: -1,
      note: `${contextLabel} cai em faixa classica mais cautelosa para este perfil.`,
    };
  }

  return {
    label: neutralLabel,
    score: 0,
    note: `${contextLabel} fica em faixa neutra ou intermediaria para o perfil atual.`,
  };
}

function buildVaraBand(
  value: string,
  eventProfile: MuhurtaEventCandidate,
  afterSolarMidpoint: boolean
) {
  const base = buildProfileCriterionBand(
    value,
    eventProfile.supportiveDayRulers,
    eventProfile.cautionDayRulers,
    "Vara favoravel",
    "Vara cauteloso",
    "Vara neutro",
    `O dia regido por ${value}`
  );

  if (base.score < 0 && afterSolarMidpoint && CLASSICAL_MALEFIC_DAY_RULERS.has(value)) {
    return {
      label: "Vara malefico suavizado",
      score: 0,
      note:
        `${base.note} Excecao classica aplicada: na segunda metade do vara, a pressao dos dias de naturais maleficos diminui, ` +
        "com regra ainda mais explicita para a vara de Marte apos o meio do dia.",
    };
  }

  return base;
}

function buildYogaBand(
  yogaLabel: string,
  eventProfile: MuhurtaEventCandidate
) {
  const normalizedYoga = normalizeEventText(yogaLabel).replace(/\s+/g, "");
  const disruptive = CLASSICAL_DISRUPTIVE_YOGAS.has(normalizedYoga);
  const illNatureEvent = eventProfile.key === "surgery";

  if (disruptive && illNatureEvent) {
    return {
      label: "Yoga de corte coerente",
      score: 2,
      note:
        `O yoga ${yogaLabel} entra na lista classica dos yogas destrutivos, mas esta mesma natureza apoia atos de corte, litigio ou pressao direta.`,
    };
  }

  if (disruptive) {
    return {
      label: "Yoga cauteloso ao evento",
      score: -1,
      note:
        `O yoga ${yogaLabel} entra na lista classica dos yogas destrutivos e deve ser evitado para atos beneficos ou agradaveis sempre que houver alternativa melhor.`,
    };
  }

  return {
    label: "Yoga regular do evento",
    score: 0,
    note:
      `O yoga ${yogaLabel} nao cai na lista classica dos yogas destrutivos desta triagem; isso preserva o filtro do evento, sem superestimar apoio automatico.`,
  };
}

function buildTaraBand(
  tara: ReturnType<typeof taraCategory>,
  eventProfile: MuhurtaEventCandidate,
  afterSolarMidpoint: boolean
) {
  if (tara.distance === 27) {
    const strongCaution = eventProfile.key === "marriage" || eventProfile.key === "travel";
    return {
      label: strongCaution ? "27a Tara cautelosa" : "27a Tara especial",
      score: strongCaution ? -2 : -1,
      note:
        "A 27a Nakshatra a partir da Janma, embora conte como Parama Mitra no ciclo, e tratada classicamente como faixa delicada para varios atos duradouros, em especial casamento e viagem.",
    };
  }

  if (tara.favorable) {
    return {
      label: `${tara.label} favoravel`,
      score: 2,
      note: `A Tara atual cai em ${tara.label}, uma das faixas tradicionalmente mais sustentadoras do ciclo lunar.`,
    };
  }

  if (afterSolarMidpoint && (tara.label === "Janma" || tara.label === "Pratyari")) {
    return {
      label: `${tara.label} suavizada apos o meio do dia`,
      score: 0,
      note:
        `Excecao classica aplicada: ${tara.label} perde parte do peso negativo quando o evento e iniciado depois do meio do dia solar.`,
    };
  }

  return {
    label: `${tara.label} delicada`,
    score: -1,
    note: `A Tara atual cai em ${tara.label}, faixa tradicionalmente mais sensivel para eventos importantes ou duradouros.`,
  };
}

function taraCategory(fromNakshatraIndex: number, toNakshatraIndex: number) {
  const distance = ((toNakshatraIndex - fromNakshatraIndex) % 27 + 27) % 27;
  const categoryIndex = distance % 9;
  const label = TARA_SEQUENCE[categoryIndex];
  const favorable = [1, 3, 5, 7, 8].includes(categoryIndex);

  return {
    label,
    distance: distance + 1,
    favorable,
  };
}

function isWithinWindow(time: number, start?: number, end?: number) {
  if (!Number.isFinite(time) || !Number.isFinite(start ?? Number.NaN) || !Number.isFinite(end ?? Number.NaN)) {
    return false;
  }
  return time >= (start ?? 0) && time < (end ?? 0);
}

function buildDayMuhurtaSegments(sunrise?: number, sunset?: number) {
  return buildMuhurtaSegments(sunrise, sunset);
}

function buildMuhurtaSegments(start?: number, end?: number) {
  if (!Number.isFinite(start ?? Number.NaN) || !Number.isFinite(end ?? Number.NaN)) {
    return [];
  }

  const dayStart = start ?? 6;
  const dayEnd = end ?? 18;
  const segmentLength = (dayEnd - dayStart) / 15;

  return Array.from({ length: 15 }, (_, index) => ({
    number: index + 1,
    start: dayStart + index * segmentLength,
    end: dayStart + (index + 1) * segmentLength,
    generallyInauspicious: GENERAL_INAUSPICIOUS_DAY_MUHURTAS.has(index + 1),
  }));
}

function shiftDateTuple(year: number, month: number, day: number, offsetDays: number) {
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return {
    year: base.getUTCFullYear(),
    month: base.getUTCMonth() + 1,
    day: base.getUTCDate(),
  };
}

function buildHoraSupport(hourRuler: string, dayRuler: string, hourNumber: number) {
  if (hourNumber <= 0) {
    return {
      label: "Hora nao calculada",
      score: 0,
      note: "Sem hora planetaria valida, o modulo nao consegue usar este filtro.",
    };
  }

  const sameAsDayRuler = hourRuler === dayRuler;

  if (SUPPORTIVE_HOUR_RULERS.has(hourRuler)) {
    return {
      label: sameAsDayRuler ? "Hora benefica alinhada" : "Hora benefica",
      score: sameAsDayRuler ? 2 : 1,
      note: sameAsDayRuler
        ? `A hora de ${hourRuler} coincide com o regente do dia, reforcando coerencia do recorte.`
        : `A hora de ${hourRuler} entra no working set benefico basico do modulo.`,
    };
  }

  if (DEMANDING_HOUR_RULERS.has(hourRuler)) {
    return {
      label: sameAsDayRuler ? "Hora exigente coerente" : "Hora exigente",
      score: sameAsDayRuler ? 0 : -1,
      note: sameAsDayRuler
        ? `A hora de ${hourRuler} e mais seca, mas segue coerente com o regente do dia.`
        : `A hora de ${hourRuler} pede mais firmeza e filtro no inicio do evento.`,
    };
  }

  if (hourRuler === "Sun") {
    return {
      label: sameAsDayRuler ? "Hora solar alinhada" : "Hora solar",
      score: sameAsDayRuler ? 1 : 0,
      note: sameAsDayRuler
        ? "A hora solar coincide com o regente do dia e ajuda na assinatura do momento."
        : "Hora solar neutra-operacional no working set atual.",
    };
  }

  return {
    label: "Hora neutra",
    score: 0,
    note: `A hora de ${hourRuler} nao entra nem como apoio forte nem como pressao clara neste overlay.`,
  };
}

function mergeIntervals(intervals: Array<{ start?: number; end?: number }>) {
  const normalized = intervals
    .filter(
      (interval) =>
        Number.isFinite(interval.start ?? Number.NaN) &&
        Number.isFinite(interval.end ?? Number.NaN) &&
        (interval.end ?? 0) > (interval.start ?? 0)
    )
    .map((interval) => ({
      start: interval.start ?? 0,
      end: interval.end ?? 0,
    }))
    .sort((left, right) => left.start - right.start);

  return normalized.reduce<Array<{ start: number; end: number }>>((rows, interval) => {
    const last = rows[rows.length - 1];
    if (!last || interval.start > last.end) {
      rows.push(interval);
      return rows;
    }

    last.end = Math.max(last.end, interval.end);
    return rows;
  }, []);
}

function intervalsOverlap(
  left: { start?: number; end?: number },
  right: { start?: number; end?: number }
) {
  if (
    !Number.isFinite(left.start ?? Number.NaN) ||
    !Number.isFinite(left.end ?? Number.NaN) ||
    !Number.isFinite(right.start ?? Number.NaN) ||
    !Number.isFinite(right.end ?? Number.NaN)
  ) {
    return false;
  }

  return (left.start ?? 0) < (right.end ?? 0) && (right.start ?? 0) < (left.end ?? 0);
}

function buildWindowAssessment(
  localTime: number,
  windows: Array<{ key: string; label: string; start?: number; end?: number }>
) {
  const activeWindows = windows.filter((window) => isWithinWindow(localTime, window.start, window.end));
  const supportiveWindows = activeWindows.filter((window) => window.key === "abhijit");
  const cautionWindows = activeWindows.filter(
    (window) => window.key !== "abhijit" && window.key !== "unavailable"
  );

  if (cautionWindows.length) {
    return {
      label: "Janela cautelosa",
      score: -2,
      note: `Horario atual cai em ${cautionWindows.map((window) => window.label).join(", ")}.`,
      activeWindows,
      supportiveWindows,
      cautionWindows,
    };
  }

  if (supportiveWindows.length) {
    return {
      label: "Abhijit ativo",
      score: 1,
      note: "Horario atual toca a janela de Abhijit Muhurta no recorte solar local.",
      activeWindows,
      supportiveWindows,
      cautionWindows,
    };
  }

  return {
    label: "Janela limpa",
    score: 0,
    note: "Horario atual nao cai em Rahu Kalam, Yamaganda, Gulika nem Abhijit.",
    activeWindows,
    supportiveWindows,
    cautionWindows,
  };
}

function buildNextCleanWindow(
  localTime: number,
  sunrise: number | undefined,
  sunset: number | undefined,
  blockedIntervals: Array<{ start?: number; end?: number }>,
  supportiveIntervals: Array<{ start?: number; end?: number; label: string }>
) {
  const approximate = !hasValidArc(sunrise, sunset);
  const dayStart = approximate ? 6 : (sunrise ?? 6);
  const dayEnd = approximate ? 18 : (sunset ?? 18);
  const mergedBlocked = mergeIntervals(blockedIntervals).map((interval) => ({
    start: Math.max(interval.start, dayStart),
    end: Math.min(interval.end, dayEnd),
  }));
  let cursor = Math.max(localTime, dayStart);

  if (cursor >= dayEnd) {
    return {
      label: "Sem faixa limpa diurna restante",
      status: "implemented" as const,
      approximate,
      note: `O horario atual ja caiu depois do arco diurno filtrado para este modulo.${approximate ? " Usando arco diurno operacional 06:00-18:00." : ""}`,
    };
  }

  for (const interval of mergedBlocked) {
    if (interval.end <= cursor) {
      continue;
    }

    if (interval.start > cursor) {
      const cleanInterval = { start: cursor, end: interval.start };
      const supportive = supportiveIntervals.find((row) => intervalsOverlap(row, cleanInterval));
      return {
        label:
          localTime >= cleanInterval.start && localTime < cleanInterval.end
            ? `Faixa limpa ativa ate ${decimalHourToClockText(cleanInterval.end)}`
            : `${decimalHourToClockText(cleanInterval.start)}-${decimalHourToClockText(cleanInterval.end)}`,
        status: "implemented" as const,
        approximate,
        note: supportive
          ? `Intervalo livre de janelas cautelosas e Durmuhurta, com apoio de ${supportive.label} em parte da faixa.${approximate ? " Usando arco diurno operacional 06:00-18:00." : ""}`
          : `Intervalo livre de Rahu Kalam, Yamaganda, Gulika e Durmuhurta no arco diurno restante.${approximate ? " Usando arco diurno operacional 06:00-18:00." : ""}`,
      };
    }

    cursor = Math.max(cursor, interval.end);
    if (cursor >= dayEnd) {
      return {
        label: "Sem faixa limpa diurna restante",
        status: "implemented" as const,
        approximate,
        note: `As janelas cautelosas ocupam o restante do arco diurno deste dia.${approximate ? " Usando arco diurno operacional 06:00-18:00." : ""}`,
      };
    }
  }

  const cleanInterval = { start: cursor, end: dayEnd };
  const supportive = supportiveIntervals.find((row) => intervalsOverlap(row, cleanInterval));
  return {
    label:
      localTime >= cleanInterval.start && localTime < cleanInterval.end
        ? `Faixa limpa ativa ate ${decimalHourToClockText(cleanInterval.end)}`
        : `${decimalHourToClockText(cleanInterval.start)}-${decimalHourToClockText(cleanInterval.end)}`,
    status: "implemented" as const,
    approximate,
    note: supportive
      ? `Intervalo final do dia livre de janelas cautelosas, tangenciando ${supportive.label}.${approximate ? " Usando arco diurno operacional 06:00-18:00." : ""}`
      : `Intervalo final do arco diurno sem Rahu Kalam, Yamaganda, Gulika ou Durmuhurta.${approximate ? " Usando arco diurno operacional 06:00-18:00." : ""}`,
  };
}

function buildNightDurmuhurtaContext(
  localTime: number,
  sunrise: number | undefined,
  sunset: number | undefined,
  previousSunset: number | undefined,
  nextSunrise: number | undefined
) {
  if (!Number.isFinite(localTime)) {
    return {
      label: "Sem Durmuhurta noturno calculado",
      score: 0,
      status: "implemented" as const,
      approximate: false,
      note: "O arco noturno requer hora local valida; sem isso o working set noturno nao pode ser montado.",
      rows: [] as Array<{
        number: number;
        start: number;
        end: number;
        active: boolean;
        generallyInauspicious: boolean;
        reference: string;
      }>,
    };
  }

  const fallbackMode =
    !hasValidArc(sunrise, sunset) ||
    !Number.isFinite(previousSunset ?? Number.NaN) ||
    !Number.isFinite(nextSunrise ?? Number.NaN);
  const safeSunrise = hasValidArc((sunrise ?? 0) - 12, sunrise) ? (sunrise ?? 6) : 6;
  const safeSunset = hasValidArc(sunset, (sunset ?? 0) + 12) ? (sunset ?? 18) : 18;
  const safePreviousSunset = Number.isFinite(previousSunset ?? Number.NaN) ? (previousSunset ?? 18) : 18;
  const safeNextSunrise = Number.isFinite(nextSunrise ?? Number.NaN) ? (nextSunrise ?? 6) : 6;
  const isBeforeSunrise = localTime < safeSunrise;
  const isAfterSunset = localTime >= safeSunset;
  const nightStart = isBeforeSunrise ? safePreviousSunset : safeSunset;
  const nightEnd = isBeforeSunrise ? safeSunrise + 24 : safeNextSunrise + 24;
  const effectiveLocalTime = isBeforeSunrise ? localTime + 24 : localTime;
  const reference = fallbackMode
    ? "fallback operacional"
    : isBeforeSunrise
      ? "noite anterior"
      : isAfterSunset
        ? "noite corrente"
        : "proxima noite";
  const rows = buildMuhurtaSegments(nightStart, nightEnd).map((segment) => ({
    ...segment,
    active:
      segment.generallyInauspicious &&
      effectiveLocalTime >= segment.start &&
      effectiveLocalTime < segment.end,
    reference,
  }));
  const activeRows = rows.filter((row) => row.active);

  if (!isBeforeSunrise && !isAfterSunset) {
    return {
      label: "Fora do arco noturno",
      score: 0,
      status: "implemented" as const,
      approximate: fallbackMode,
      note:
        `O horario atual esta no arco diurno; o painel noturno fica disponivel para a noite corrente como working set complementar.${fallbackMode ? " A ancora noturna usa o arco operacional 18:00-06:00." : ""}`,
      rows,
    };
  }

  return {
    label: activeRows.length ? "Horario cai em Durmuhurta noturno" : "Horario fora do Durmuhurta noturno",
    score: activeRows.length ? -2 : 0,
    status: "implemented" as const,
    approximate: fallbackMode,
    note:
      `Working set noturno em ${reference}, dividindo o arco da noite em 15 muhurtas e marcando os slots gerais 1, 2, 4, 10, 11, 12 e 15 como cautelosos.` +
      (activeRows.length ? ` Slots ativos: ${activeRows.map((row) => row.number).join(", ")}.` : "") +
      (fallbackMode ? " O arco foi aproximado operacionalmente para 18:00-06:00." : ""),
    rows,
  };
}

function buildNextNightCleanWindow(
  localTime: number,
  sunrise: number | undefined,
  sunset: number | undefined,
  previousSunset: number | undefined,
  nextSunrise: number | undefined,
  rows: Array<{
    number: number;
    start: number;
    end: number;
    active: boolean;
    generallyInauspicious: boolean;
    reference: string;
  }>
) {
  if (!rows.length || !Number.isFinite(localTime)) {
    return {
      label: "Sem faixa noturna limpa calculada",
      status: "implemented" as const,
      approximate: false,
      note: "A proxima faixa noturna limpa depende do arco noturno completo e dos muhurtas correspondentes.",
      reference: "--",
    };
  }

  const fallbackMode =
    !hasValidArc(sunrise, sunset) ||
    !Number.isFinite(previousSunset ?? Number.NaN) ||
    !Number.isFinite(nextSunrise ?? Number.NaN);
  const safeSunrise = hasValidArc((sunrise ?? 0) - 12, sunrise) ? (sunrise ?? 6) : 6;
  const safeSunset = hasValidArc(sunset, (sunset ?? 0) + 12) ? (sunset ?? 18) : 18;
  const safePreviousSunset = Number.isFinite(previousSunset ?? Number.NaN) ? (previousSunset ?? 18) : 18;
  const safeNextSunrise = Number.isFinite(nextSunrise ?? Number.NaN) ? (nextSunrise ?? 6) : 6;
  const isBeforeSunrise = localTime < safeSunrise;
  const isAfterSunset = localTime >= safeSunset;
  const nightStart = isBeforeSunrise ? safePreviousSunset : safeSunset;
  const nightEnd = isBeforeSunrise ? safeSunrise + 24 : safeNextSunrise + 24;
  const effectiveLocalTime = isBeforeSunrise ? localTime + 24 : isAfterSunset ? localTime : safeSunset;
  const reference = fallbackMode
    ? "fallback operacional"
    : isBeforeSunrise
      ? "noite anterior"
      : isAfterSunset
        ? "noite corrente"
        : "proxima noite";
  const blocked = rows
    .filter((row) => row.generallyInauspicious)
    .map((row) => ({ start: row.start, end: row.end }));
  const mergedBlocked = mergeIntervals(blocked).map((interval) => ({
    start: Math.max(interval.start, nightStart),
    end: Math.min(interval.end, nightEnd),
  }));
  let cursor = Math.max(effectiveLocalTime, nightStart);

  if (cursor >= nightEnd) {
    return {
      label: "Sem faixa noturna restante",
      status: "implemented" as const,
      approximate: fallbackMode,
      note: `O arco noturno relevante para este recorte ja se encerrou.${fallbackMode ? " A ancora usa o arco operacional 18:00-06:00." : ""}`,
      reference,
    };
  }

  for (const interval of mergedBlocked) {
    if (interval.end <= cursor) {
      continue;
    }

    if (interval.start > cursor) {
      return {
        label:
          effectiveLocalTime >= cursor && effectiveLocalTime < interval.start
            ? `Faixa noturna ativa ate ${decimalHourToClockText(interval.start)}`
            : `${decimalHourToClockText(cursor)}-${decimalHourToClockText(interval.start)}`,
        status: "implemented" as const,
        approximate: fallbackMode,
        note: `Intervalo noturno fora dos muhurtas gerais mais cautelosos do working set atual.${fallbackMode ? " A ancora usa o arco operacional 18:00-06:00." : ""}`,
        reference,
      };
    }

    cursor = Math.max(cursor, interval.end);
    if (cursor >= nightEnd) {
      return {
        label: "Sem faixa noturna restante",
        status: "implemented" as const,
        approximate: fallbackMode,
        note: `Os muhurtas noturnos cautelosos ocupam o restante da noite considerada.${fallbackMode ? " A ancora usa o arco operacional 18:00-06:00." : ""}`,
        reference,
      };
    }
  }

  return {
    label:
      effectiveLocalTime >= cursor && effectiveLocalTime < nightEnd
        ? `Faixa noturna ativa ate ${decimalHourToClockText(nightEnd)}`
        : `${decimalHourToClockText(cursor)}-${decimalHourToClockText(nightEnd)}`,
    status: "implemented" as const,
    approximate: fallbackMode,
    note: `Faixa final da noite livre dos muhurtas gerais mais cautelosos mapeados neste modulo.${fallbackMode ? " A ancora usa o arco operacional 18:00-06:00." : ""}`,
    reference,
  };
}

export function muhurtaEngine(
  module: JyotishModuleKey,
  context: JyotishContext
): EngineResult {
  const moon = context.transit.planets.find((point) => point.key === "moon") ?? context.transit.ascendant;
  const sun = context.transit.planets.find((point) => point.key === "sun") ?? context.transit.ascendant;
  const natalMoon = context.primary.planets.find((point) => point.key === "moon") ?? context.primary.ascendant;
  const [year, month, day] = context.transit.analysisDate.split("-").map(Number);
  const previousDate = shiftDateTuple(year, month, day, -1);
  const nextDate = shiftDateTuple(year, month, day, 1);
  const windows = buildMuhurtaWindowSet(
    year,
    month,
    day,
    context.transit.latitude,
    context.transit.longitude,
    context.transit.timezone
  );
  const previousSolar = buildSolarDayTimings(
    previousDate.year,
    previousDate.month,
    previousDate.day,
    context.transit.latitude,
    context.transit.longitude,
    context.transit.timezone
  );
  const nextSolar = buildSolarDayTimings(
    nextDate.year,
    nextDate.month,
    nextDate.day,
    context.transit.latitude,
    context.transit.longitude,
    context.transit.timezone
  );
  const planetaryHour = buildOperationalPlanetaryHourContext(
    year,
    month,
    day,
    context.transit.localBirthHour,
    context.transit.latitude,
    context.transit.longitude,
    context.transit.timezone
  );
  const tara = taraCategory(natalMoon.nakshatraIndex, moon.nakshatraIndex);
  const chandraBalaHouse = signDistance(natalMoon.signIndex, moon.signIndex) + 1;
  const chandraBalaSupportive = [1, 3, 6, 7, 10, 11].includes(chandraBalaHouse);
  const weekdayIndex = buildCivilWeekdayIndex(context.transit.analysisDate);
  const civilDayRuler = WEEKDAY_RULERS[weekdayIndex];
  const eventProfileResolution = detectMuhurtaEventProfile(context.eventType);
  const eventProfile = eventProfileResolution.primary;
  const tithiFamilyContext = buildTithiFamilyContext(sun.longitude, moon.longitude);
  const karanaContext = buildKaranaContext(sun.longitude, moon.longitude);
  const yogaContext = buildYogaContext(sun.longitude, moon.longitude, context.transit.panchanga.yoga);
  const moonNature = NAKSHATRA_NATURES[moon.nakshatraIndex] ?? "Mixed/Common";
  const solarMidpoint =
    Number.isFinite(windows.timings.solarNoon ?? Number.NaN) ? (windows.timings.solarNoon ?? 12) : 12;
  const afterSolarMidpoint = context.transit.localBirthHour >= solarMidpoint;
  const dayMuhurtas = buildDayMuhurtaSegments(windows.timings.sunrise, windows.timings.sunset);
  const weekdayDurmuhurtaSet = new Set(WEEKDAY_DURMUHURTA_MAP[weekdayIndex] ?? []);
  const durmuhurtaRows = dayMuhurtas.filter((segment) => weekdayDurmuhurtaSet.has(segment.number));
  const durmuhurtaActive = durmuhurtaRows.some((segment) =>
    isWithinWindow(context.transit.localBirthHour, segment.start, segment.end)
  );
  const nightDurmuhurta = buildNightDurmuhurtaContext(
    context.transit.localBirthHour,
    windows.timings.sunrise,
    windows.timings.sunset,
    previousSolar.sunset,
    nextSolar.sunrise
  );
  const nextNightCleanWindow = buildNextNightCleanWindow(
    context.transit.localBirthHour,
    windows.timings.sunrise,
    windows.timings.sunset,
    previousSolar.sunset,
    nextSolar.sunrise,
    nightDurmuhurta.rows
  );
  const horaSupport = buildHoraSupport(
    planetaryHour.hourRuler,
    planetaryHour.dayRuler,
    planetaryHour.hourNumber
  );
  const varaBand = buildVaraBand(civilDayRuler, eventProfile, afterSolarMidpoint);
  const tithiFamilyBand = buildProfileCriterionBand(
    tithiFamilyContext.family,
    eventProfile.supportiveTithiFamilies,
    eventProfile.cautionTithiFamilies,
    "Tithi favoravel ao evento",
    "Tithi cauteloso ao evento",
    "Tithi neutro ao evento",
    `A familia ${tithiFamilyContext.family}`
  );
  const nakshatraBand = buildProfileCriterionBand(
    moonNature,
    eventProfile.supportiveNakshatraNatures,
    eventProfile.cautionNakshatraNatures,
    "Nakshatra favoravel ao evento",
    "Nakshatra cauteloso ao evento",
    "Nakshatra neutro ao evento",
    `A natureza ${moonNature} de ${moon.nakshatra}`
  );
  const karanaBand = buildProfileCriterionBand(
    karanaContext.name,
    eventProfile.supportiveKaranas,
    eventProfile.cautionKaranas,
    "Karana favoravel ao evento",
    "Karana cauteloso ao evento",
    "Karana neutro ao evento",
    `O karana ${karanaContext.name}`
  );
  const yogaBand = buildYogaBand(context.transit.panchanga.yoga, eventProfile);
  const taraBand = buildTaraBand(tara, eventProfile, afterSolarMidpoint);
  const windowAssessment = buildWindowAssessment(context.transit.localBirthHour, windows.windows);
  const nextCleanWindow = buildNextCleanWindow(
    context.transit.localBirthHour,
    windows.timings.sunrise,
    windows.timings.sunset,
    [
      ...windows.windows
        .filter((window) => window.key !== "abhijit" && window.key !== "unavailable")
        .map((window) => ({
          start: window.start,
          end: window.end,
        })),
      ...durmuhurtaRows.map((segment) => ({
        start: segment.start,
        end: segment.end,
      })),
    ],
    windows.windows
      .filter((window) => window.key === "abhijit")
      .map((window) => ({
        start: window.start,
        end: window.end,
        label: window.label,
      }))
  );
  const scoreRows = [
    {
      criterion: "Evento x Vara",
      state: varaBand.label,
      score: varaBand.score,
      note: `${varaBand.note} ${eventProfile.note}`,
    },
    {
      criterion: "Evento x Tithi",
      state: tithiFamilyBand.label,
      score: tithiFamilyBand.score,
      note: `${tithiFamilyBand.note} Tithi ${context.transit.panchanga.tithi} (${tithiFamilyContext.family}).`,
    },
    {
      criterion: "Evento x Nakshatra",
      state: nakshatraBand.label,
      score: nakshatraBand.score,
      note: `${nakshatraBand.note} Lua em ${moon.nakshatra}.`,
    },
    {
      criterion: "Evento x Karana",
      state: karanaBand.label,
      score: karanaBand.score,
      note: `${karanaBand.note} Karana ${karanaContext.name} (${karanaContext.kind}).`,
    },
    {
      criterion: "Evento x Yoga",
      state: yogaBand.label,
      score: yogaBand.score,
      note: `${yogaBand.note} Yoga ${context.transit.panchanga.yoga} (indice ${yogaContext.yogaIndex + 1}).`,
    },
    {
      criterion: "Chandra Bala",
      state: chandraBalaSupportive ? "Sustenta" : "Pede filtro",
      score: chandraBalaSupportive ? 2 : -1,
      note: chandraBalaSupportive
        ? `Lua do evento cai na ${chandraBalaHouse}a a partir da Lua natal, faixa mais confortavel no filtro basico.`
        : `Lua do evento cai na ${chandraBalaHouse}a a partir da Lua natal, fora da faixa basal mais sustentadora.`,
    },
    {
      criterion: "Tara Bala",
      state: taraBand.label,
      score: taraBand.score,
      note: `${taraBand.note} Distancia de ${tara.distance} nakshatras entre a Lua natal e a Lua do evento.`,
    },
    {
      criterion: "Hora planetaria",
      state: horaSupport.label,
      score: horaSupport.score,
      note: `${horaSupport.note}${planetaryHour.approximate ? " Hora calculada em fallback operacional." : ""}`,
    },
    {
      criterion: "Janelas classicas",
      state: windowAssessment.label,
      score: windowAssessment.score,
      note: `${windowAssessment.note}${windows.approximate ? ` ${windows.note}` : ""}`,
    },
    {
      criterion: "Durmuhurta diurno",
      state: durmuhurtaActive ? "Ativo" : "Fora da janela",
      score: durmuhurtaActive ? -2 : 0,
      note: `Filtro diurno construido pelo fracionamento do arco ${windows.approximate ? "operacional" : "real"} do dia local.`,
    },
    {
      criterion: "Durmuhurta noturno",
      state: nightDurmuhurta.label,
      score: nightDurmuhurta.score,
      note: nightDurmuhurta.note,
    },
  ];
  const electionScore = scoreRows.reduce((sum, row) => sum + row.score, 0);
  const electionBand =
    electionScore >= 8
      ? "Faixa eletiva forte"
      : electionScore >= 4
        ? "Faixa eletiva util"
        : electionScore >= 0
          ? "Faixa eletiva mista"
          : "Faixa eletiva cautelosa";

  return {
    sections: [
      createSection({
        id: `${module}-muhurta`,
        title: "Muhurta",
        description:
          "Usa Panchanga, Lua, Lagna do evento e divisao solar local do dia para abrir uma leitura eletiva tecnica, sem escolher automaticamente um destino final.",
        status: "implemented",
        items: [
          createDatum(module, "Muhurta", "Evento", context.eventType || "Consulta geral", {
            technicalNotes: `${eventProfile.note} ${eventProfileResolution.ambiguityNote}`,
            confidence: context.eventType ? 0.95 : 0.5,
            status: "implemented",
          }),
          createDatum(module, "Muhurta", "Vara", context.transit.panchanga.weekday, {
            technicalNotes: `${civilDayRuler} rege o dia. ${varaBand.note}`,
            confidence: 0.84,
            status: "implemented",
          }),
          createDatum(module, "Muhurta", "Lua do momento", `${moon.signName} | ${moon.nakshatra}`, {
            relatedPlanet: "Chandra",
            technicalNotes: "Base para Chandra Bala, Tara Bala e clima lunar do muhurta.",
            confidence: 0.82,
          }),
          createDatum(module, "Muhurta", "Tithi", context.transit.panchanga.tithi, {
            technicalNotes: `${context.transit.panchanga.paksha}; familia ${tithiFamilyContext.family}.`,
            confidence: 0.82,
          }),
          createDatum(module, "Muhurta", "Yoga", context.transit.panchanga.yoga, {
            technicalNotes: `${yogaBand.note} Indice ${yogaContext.yogaIndex + 1} de 27; progresso ${yogaContext.progressPercent.toFixed(1)}%.`,
            confidence: 0.78,
            status: "implemented",
          }),
          createDatum(module, "Muhurta", "Karana", karanaContext.name, {
            technicalNotes: `${karanaContext.kind}; slot ${karanaContext.slot}. ${karanaBand.note}`,
            confidence: 0.78,
            status: "implemented",
          }),
          createDatum(module, "Muhurta", "Chandra Bala", `Lua do evento na ${chandraBalaHouse}a casa a partir da Lua natal`, {
            technicalNotes: chandraBalaSupportive
              ? "Faixa geralmente tratada como sustentadora para o momento."
              : "Faixa que pede mais filtro porque nao e a mais confortavel no criterio lunar basico.",
            confidence: 0.74,
            status: "implemented",
          }),
          createDatum(module, "Muhurta", "Tara Bala", `${tara.label} Tara`, {
            technicalNotes: `${taraBand.note} Distancia tecnica de ${tara.distance} nakshatras entre a Lua natal e a Lua do evento.`,
            confidence: 0.76,
            status: "implemented",
          }),
          createDatum(module, "Muhurta", "Hora planetaria", `${planetaryHour.hourRuler} | ${planetaryHour.period}`, {
            technicalNotes: `${planetaryHour.note} Hora ${planetaryHour.hourNumber}, com dia regido por ${planetaryHour.dayRuler}. ${horaSupport.note}`,
            confidence: planetaryHour.approximate ? 0.52 : 0.72,
            status: "implemented",
          }),
          createDatum(
            module,
            "Muhurta",
            "Durmuhurta",
            durmuhurtaActive ? "Horario cai em Durmuhurta" : "Horario fora do Durmuhurta",
            {
              technicalNotes:
                `Janela montada pela divisao do arco ${windows.approximate ? "operacional" : "real"} em 15 muhurtas com os indices desfavoraveis do dia da semana.`,
              confidence: windows.approximate ? 0.54 : 0.74,
              status: "implemented",
            }
          ),
          createDatum(module, "Muhurta", "Durmuhurta noturno", nightDurmuhurta.label, {
            technicalNotes: nightDurmuhurta.note,
            confidence: nightDurmuhurta.approximate ? 0.46 : 0.66,
            status: "implemented",
            methodUsed: "muhurta-night-durmuhurta-v1",
          }),
          createDatum(module, "Muhurta", "Triagem eletiva", electionBand, {
            technicalNotes: `Overlay atual soma ${electionScore} pontos ao cruzar vara, tithi, nakshatra, yoga, karana, Chandra Bala, Tara Bala, hora planetaria, janelas classicas, Durmuhurta diurno e leitura noturna complementar.`,
            confidence: 0.76,
            status: "implemented",
            methodUsed: "muhurta-scorecard-overlay-v1",
          }),
          createDatum(module, "Muhurta", "Proxima faixa limpa", nextCleanWindow.label, {
            technicalNotes: nextCleanWindow.note,
            confidence: nextCleanWindow.approximate ? 0.52 : 0.74,
            status: "implemented",
            methodUsed: "muhurta-next-clean-window-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-muhurta-windows`,
            "Janelas classicas do dia",
            ["Janela", "Inicio", "Fim", "Estado no horario", "Nota"],
            windows.windows.map((window) => [
              window.label,
              decimalHourToClockText(window.start),
              decimalHourToClockText(window.end),
              isWithinWindow(context.transit.localBirthHour, window.start, window.end)
                ? "Ativa agora"
                : "Fora da janela",
              window.note,
            ]),
            "Divisao local do dia a partir do nascer e por do Sol. O motor atual calcula Rahu Kalam, Yamaganda, Gulika e Abhijit."
          ),
          createTable(
            `${module}-muhurta-solar`,
            "Recorte solar do evento",
            ["Item", "Valor"],
            [
              ["Sunrise", decimalHourToClockText(windows.timings.sunrise)],
              ["Sunset", decimalHourToClockText(windows.timings.sunset)],
              ["Solar noon", decimalHourToClockText(windows.timings.solarNoon)],
              ["Modo do arco", windows.approximate ? "Aproximado" : "Local calculado"],
              [
                "Duracao do dia",
                Number.isFinite(windows.timings.daylightHours ?? Number.NaN)
                  ? `${windows.timings.daylightHours?.toFixed(2)} h`
                  : "--",
              ],
            ],
            "Base tecnica do recorte eletivo local."
          ),
          createTable(
            `${module}-muhurta-scorecard`,
            "Scorecard Eletivo",
            ["Filtro", "Estado", "Score", "Nota"],
            scoreRows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
            "Scorecard operacional do muhurta atual. Ele cruza Panchanga Shuddhi, bala lunar e janelas do dia para separar apoio, neutralidade e pressao do horario."
          ),
          createTable(
            `${module}-durmuhurta`,
            "Durmuhurta diurno",
            ["Muhurta", "Inicio", "Fim", "Estado no horario", "Classificacao"],
            durmuhurtaRows.length
              ? durmuhurtaRows.map((segment) => [
                  `${segment.number}`,
                  decimalHourToClockText(segment.start),
                  decimalHourToClockText(segment.end),
                  isWithinWindow(context.transit.localBirthHour, segment.start, segment.end)
                    ? "Ativo agora"
                    : "Fora da janela",
                  segment.generallyInauspicious ? "Durmuhurta + desfavoravel geral" : "Durmuhurta especifico do dia",
                ])
              : [["--", "--", "--", "--", "Sem recorte diurno valido"]],
            `Working set diurno de Durmuhurta com base no fracionamento ${windows.approximate ? "operacional" : "real"} do dia local.`
          ),
          createTable(
            `${module}-durmuhurta-night`,
            "Durmuhurta noturno v1",
            ["Muhurta", "Inicio", "Fim", "Estado no horario", "Classificacao", "Referencia"],
            nightDurmuhurta.rows.length
              ? nightDurmuhurta.rows.map((segment) => [
                  `${segment.number}`,
                  decimalHourToClockText(segment.start),
                  decimalHourToClockText(segment.end),
                  segment.active ? "Ativo agora" : "Fora da janela",
                  segment.generallyInauspicious ? "Faixa cautelosa geral" : "Faixa regular",
                  segment.reference,
                ])
              : [["--", "--", "--", "--", "Sem recorte noturno valido", "--"]],
            "Primeira camada noturna do modulo: divide a noite local em 15 muhurtas e marca os slots gerais mais cautelosos."
          ),
        ],
      }),
      createSection({
        id: `${module}-muhurta-classical-fit`,
        title: "Panchanga Shuddhi do Evento",
        description:
          "Cruza o perfil classico do evento com os cinco membros do Panchanga, para deixar a aderencia do momento visivel ao astrologo.",
        status: "implemented",
        items: [
          createDatum(module, "Muhurta", "Perfil do evento", eventProfile.label, {
            technicalNotes: `${eventProfile.note} ${eventProfileResolution.ambiguityNote}`,
            confidence: context.eventType ? 0.82 : 0.46,
            status: "implemented",
            methodUsed: "muhurta-event-profile-v1",
          }),
          createDatum(module, "Muhurta", "Ambiguidade do perfil", eventProfileResolution.ambiguityBand, {
            technicalNotes: eventProfileResolution.ambiguityNote,
            confidence: context.eventType ? 0.74 : 0.38,
            status: "implemented",
            methodUsed: "muhurta-event-profile-v1",
          }),
          createDatum(module, "Muhurta", "Adequacao do vara", varaBand.label, {
            technicalNotes: varaBand.note,
            confidence: 0.72,
            status: "implemented",
            methodUsed: "muhurta-event-vara-fit-v1",
          }),
          createDatum(module, "Muhurta", "Adequacao do tithi", tithiFamilyBand.label, {
            technicalNotes: tithiFamilyBand.note,
            confidence: 0.72,
            status: "implemented",
            methodUsed: "muhurta-event-tithi-fit-v1",
          }),
          createDatum(module, "Muhurta", "Adequacao do nakshatra", nakshatraBand.label, {
            technicalNotes: nakshatraBand.note,
            confidence: 0.74,
            status: "implemented",
            methodUsed: "muhurta-event-nakshatra-fit-v1",
          }),
          createDatum(module, "Muhurta", "Adequacao do yoga", yogaBand.label, {
            technicalNotes: yogaBand.note,
            confidence: 0.72,
            status: "implemented",
            methodUsed: "muhurta-event-yoga-fit-v1",
          }),
          createDatum(module, "Muhurta", "Adequacao do karana", karanaBand.label, {
            technicalNotes: karanaBand.note,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "muhurta-event-karana-fit-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-muhurta-event-profile`,
            "Triagem textual do evento",
            ["Perfil", "Score", "Palavras-chave", "Nota"],
            eventProfileResolution.candidates.map((candidate) => [
              candidate.label,
              candidate.score.toString(),
              candidate.matchedKeywords.length ? candidate.matchedKeywords.join(", ") : "--",
              candidate.note,
            ]),
            "Rastro da classificacao do evento para o working set classico do Muhurta."
          ),
          createTable(
            `${module}-muhurta-panchanga-fit`,
            "Adequacao classica do evento",
            ["Filtro", "Valor atual", "Estado", "Nota"],
            [
              ["Vara", civilDayRuler, varaBand.label, varaBand.note],
              ["Tithi", `${context.transit.panchanga.tithi} | ${tithiFamilyContext.family}`, tithiFamilyBand.label, tithiFamilyBand.note],
              ["Nakshatra", `${moon.nakshatra} | ${moonNature}`, nakshatraBand.label, nakshatraBand.note],
              ["Yoga", `${context.transit.panchanga.yoga} | indice ${yogaContext.yogaIndex + 1}`, yogaBand.label, yogaBand.note],
              ["Karana", `${karanaContext.name} | ${karanaContext.kind}`, karanaBand.label, karanaBand.note],
              ["Hora planetaria", planetaryHour.hourRuler, horaSupport.label, horaSupport.note],
            ],
            "Mostra como o Panchanga do evento conversa com a natureza classica do ato a ser iniciado."
          ),
          createTable(
            `${module}-muhurta-panchanga-five-limbs`,
            "Cinco membros do Panchanga do evento",
            ["Anga", "Valor atual", "Leitura tecnica"],
            [
              ["Vara", `${context.transit.panchanga.weekday} | ${civilDayRuler}`, varaBand.note],
              ["Tithi", `${context.transit.panchanga.tithi} | ${tithiFamilyContext.family}`, tithiFamilyBand.note],
              ["Nakshatra", `${moon.nakshatra} | ${moonNature}`, nakshatraBand.note],
              ["Yoga", `${context.transit.panchanga.yoga} | indice ${yogaContext.yogaIndex + 1}`, yogaBand.note],
              ["Karana", `${karanaContext.name} | ${karanaContext.kind}`, karanaBand.note],
            ],
            "Painel auditavel dos cinco angas do Panchanga usados pelo Muhurta nesta rodada."
          ),
        ],
      }),
      createSection({
        id: `${module}-muhurta-next`,
        title: "Camada Noturna Complementar",
        description:
          "A camada noturna agora sai como working set operacional complementar, sem prometer unanimidade entre escolas eletivas.",
        status: "implemented",
        items: [
          createDatum(module, "Muhurta", "Moonrise/Moonset", "Disponivel no Panchanga", {
            technicalNotes: "O recorte lunar local agora aparece na aba de Panchanga, para nao duplicar tabelas no modulo.",
            confidence: 0.8,
            status: "implemented",
          }),
          createDatum(module, "Muhurta", "Proxima faixa noturna limpa", nextNightCleanWindow.label, {
            technicalNotes: `${nextNightCleanWindow.note} Referencia: ${nextNightCleanWindow.reference}.`,
            confidence: nextNightCleanWindow.approximate ? 0.44 : 0.64,
            status: "implemented",
            methodUsed: "muhurta-next-night-clean-window-v1",
          }),
          createDatum(module, "Muhurta", "Leitura escolar noturna", "Working set noturno operacional", {
            technicalNotes:
              "O modulo agora abre malha noturna, Durmuhurta noturno e faixa limpa complementar; a lacuna que sobra e mais de preferencia escolar do que de estrutura tecnica.",
            confidence: 0.66,
            status: "implemented",
            methodUsed: "muhurta-night-working-set-v2",
          }),
        ],
        tables: [
          createTable(
            `${module}-night-clean-window`,
            "Faixa noturna complementar",
            ["Indicador", "Valor", "Nota"],
            [
              ["Referencia", nextNightCleanWindow.reference, "Indica se a malha se ancora na noite anterior, corrente ou na proxima noite."],
              ["Faixa limpa", nextNightCleanWindow.label, nextNightCleanWindow.note],
              ["Estado", nextNightCleanWindow.approximate ? "Aproximada" : "Calculada", "Saida complementar do working set noturno do muhurta."],
            ],
            "Triagem noturna basica derivada da malha de 15 muhurtas da noite local, separando as faixas fora dos slots gerais mais cautelosos."
          ),
        ],
      }),
    ],
    validations: [
      ...(planetaryHour.approximate
        ? [
            {
              level: "warning" as const,
              message: "A hora planetaria caiu em fallback operacional nesta rodada do Muhurta.",
              field: "planetaryHour",
              method: "muhurta-planetary-hour-fallback",
            },
          ]
        : []),
      ...(windows.approximate || nextCleanWindow.approximate || nightDurmuhurta.approximate || nextNightCleanWindow.approximate
        ? [
            {
              level: "warning" as const,
              message: "Parte do recorte solar/noturno do Muhurta usou ancoras operacionais 06:00-18:00 e 18:00-06:00 por indisponibilidade local completa.",
              field: "solarArc",
              method: "muhurta-operational-arc-fallback",
            },
          ]
        : []),
    ],
    summary: [
      `Perfil do evento em ${eventProfile.label.toLowerCase()}, com ${eventProfileResolution.ambiguityBand.toLowerCase()}.`,
      `Tara Bala atual em ${taraBand.label.toLowerCase()}, com distancia de ${tara.distance} nakshatras.`,
      chandraBalaSupportive
        ? "A Lua do evento cai em faixa de Chandra Bala tecnicamente mais sustentadora."
        : "A Lua do evento cai em faixa de Chandra Bala que pede mais triagem do horario.",
      `Vara ${civilDayRuler}, tithi ${tithiFamilyContext.family}, nakshatra ${moonNature}, yoga ${context.transit.panchanga.yoga} e karana ${karanaContext.name} foram cruzados com o perfil do evento.`,
      `${electionBand} no overlay atual, com proxima faixa limpa em ${nextCleanWindow.label}.`,
      `Camada noturna complementar em ${nextNightCleanWindow.reference}, com faixa limpa em ${nextNightCleanWindow.label}.`,
    ],
  };
}
