import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable, signDistance } from "./engineHelpers";
import { calculateArudhaSet, type ArudhaPoint } from "./arudhaUtils";
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
const SIGN_LORD_KEYS = [
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
] as const;
const INDU_KALA_VALUES: Record<(typeof SIGN_LORD_KEYS)[number], number> = {
  sun: 30,
  moon: 16,
  mars: 6,
  mercury: 8,
  jupiter: 10,
  venus: 12,
  saturn: 1,
};

type SpecialLagnaRow = {
  key: string;
  label: string;
  signIndex: number;
  signName: string;
  houseFromLagna: number;
  longitude: number;
  note: string;
};

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function parseDateParts(dateText: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  return { year, month, day };
}

function previousDateText(dateText: string) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function formatLongitude(longitude: number) {
  const normalized = modulo(longitude, 360);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = modulo(normalized, 30);
  const degrees = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degrees) * 60 + 1e-9);
  return `${SIGN_NAMES[signIndex]} ${degrees}deg${String(minutes).padStart(2, "0")}'`;
}

function buildSpecialLagnaRow(
  snapshot: VedicSnapshot,
  key: string,
  label: string,
  longitude: number,
  note: string
): SpecialLagnaRow {
  const signIndex = Math.floor(modulo(longitude, 360) / 30);
  return {
    key,
    label,
    signIndex,
    signName: SIGN_NAMES[signIndex],
    houseFromLagna: signDistance(snapshot.ascendant.signIndex, signIndex) + 1,
    longitude: modulo(longitude, 360),
    note,
  };
}

function buildSunriseReference(snapshot: VedicSnapshot) {
  const { year, month, day } = parseDateParts(snapshot.referenceDate);
  const todayTimings = buildSolarDayTimings(
    year,
    month,
    day,
    snapshot.latitude,
    snapshot.longitude,
    snapshot.timezone
  );
  const sun = snapshot.planets.find((point) => point.key === "sun") ?? snapshot.ascendant;

  if (Number.isFinite(todayTimings.sunrise ?? Number.NaN) && snapshot.localBirthHour >= (todayTimings.sunrise ?? 0)) {
    const elapsedHours = snapshot.localBirthHour - (todayTimings.sunrise ?? 0);
    return {
      sunriseHour: todayTimings.sunrise ?? 0,
      elapsedHours,
      elapsedGhatis: elapsedHours * 2.5,
      sunriseSunLongitude: modulo(sun.longitude - ((sun.longitudeSpeed ?? 0) * elapsedHours) / 24, 360),
      note: `Sunrise local do proprio dia em ${snapshot.referenceDate}; elapsed ${elapsedHours.toFixed(2)}h desde o nascer do Sol.`,
      sourceDate: snapshot.referenceDate,
      fallback: false,
    };
  }

  const previousDate = previousDateText(snapshot.referenceDate);
  const previousParts = parseDateParts(previousDate);
  const previousTimings = buildSolarDayTimings(
    previousParts.year,
    previousParts.month,
    previousParts.day,
    snapshot.latitude,
    snapshot.longitude,
    snapshot.timezone
  );

  if (Number.isFinite(previousTimings.sunrise ?? Number.NaN)) {
    const elapsedHours = 24 - (previousTimings.sunrise ?? 0) + snapshot.localBirthHour;
    return {
      sunriseHour: previousTimings.sunrise ?? 0,
      elapsedHours,
      elapsedGhatis: elapsedHours * 2.5,
      sunriseSunLongitude: modulo(sun.longitude - ((sun.longitudeSpeed ?? 0) * elapsedHours) / 24, 360),
      note:
        `Nascimento antes do nascer do Sol civil de ${snapshot.referenceDate}; ` +
        `a contagem recuou para o sunrise de ${previousDate}.`,
      sourceDate: previousDate,
      fallback: false,
    };
  }

  const fallbackElapsedHours = modulo(snapshot.localBirthHour - 6, 24);
  return {
    sunriseHour: 6,
    elapsedHours: fallbackElapsedHours,
    elapsedGhatis: fallbackElapsedHours * 2.5,
    sunriseSunLongitude: modulo(sun.longitude - ((sun.longitudeSpeed ?? 0) * fallbackElapsedHours) / 24, 360),
    note: "Sem sunrise local confiavel; fallback operacional usando 06:00 como ancora.",
    sourceDate: snapshot.referenceDate,
    fallback: true,
  };
}

function isOddSign(signIndex: number) {
  return signIndex % 2 === 0;
}

function varnadCount(signIndex: number) {
  return isOddSign(signIndex) ? signIndex + 1 : 12 - signIndex;
}

function varnadSignIndexFromCount(count: number) {
  const normalizedCount = modulo(count - 1, 12) + 1;
  return normalizedCount % 2 === 1 ? normalizedCount - 1 : modulo(12 - normalizedCount, 12);
}

function buildVarnadaRow(snapshot: VedicSnapshot, horaLagna: SpecialLagnaRow) {
  const natalCount = varnadCount(snapshot.ascendant.signIndex);
  const horaCount = varnadCount(horaLagna.signIndex);
  const combinedCount =
    natalCount % 2 === horaCount % 2 ? natalCount + horaCount : Math.abs(natalCount - horaCount);
  const signIndex = varnadSignIndexFromCount(combinedCount);

  return {
    key: "varnada",
    label: "Varnada Lagna",
    signIndex,
    signName: SIGN_NAMES[signIndex],
    houseFromLagna: signDistance(snapshot.ascendant.signIndex, signIndex) + 1,
    longitude: signIndex * 30,
    note:
      `Varnada pelo capitulo de Special Lagnas: natal=${natalCount}, hora=${horaCount}, ` +
      `produto final=${combinedCount}, contado por Aries/Pisces conforme a paridade classica.`,
  } satisfies SpecialLagnaRow;
}

function getPlanetPoint(snapshot: VedicSnapshot, key: string) {
  return snapshot.planets.find((point) => point.key === key);
}

function buildInduRow(snapshot: VedicSnapshot) {
  const moon = getPlanetPoint(snapshot, "moon") ?? snapshot.ascendant;
  const ninthFromLagnaSign = modulo(snapshot.ascendant.signIndex + 8, 12);
  const ninthFromMoonSign = modulo(moon.signIndex + 8, 12);
  const lagnaLordKey = SIGN_LORD_KEYS[ninthFromLagnaSign];
  const moonLordKey = SIGN_LORD_KEYS[ninthFromMoonSign];
  const lagnaNinthLord = getPlanetPoint(snapshot, lagnaLordKey) ?? snapshot.ascendant;
  const moonNinthLord = getPlanetPoint(snapshot, moonLordKey) ?? snapshot.ascendant;
  const totalKala = INDU_KALA_VALUES[lagnaLordKey] + INDU_KALA_VALUES[moonLordKey];
  const remainder = totalKala % 12 || 12;
  const signIndex = modulo(moon.signIndex + remainder - 1, 12);
  const reverseVariantSignIndex = modulo(moon.signIndex - (remainder - 1), 12);
  const reverseVariantNote = isOddSign(moon.signIndex)
    ? "Como a Lua cai em signo impar, nao se abre aqui a variante reversa por signo par."
    : `Algumas escolas contam em sentido reverso a partir da Lua em signo par; nessa variante o Indu cairia em ${SIGN_NAMES[reverseVariantSignIndex]}.`;

  return {
    key: "indu",
    label: "Indu Lagna",
    signIndex,
    signName: SIGN_NAMES[signIndex],
    houseFromLagna: signDistance(snapshot.ascendant.signIndex, signIndex) + 1,
    longitude: signIndex * 30,
    note:
      `Indu Lagna classico pelo soma de kalas do 9o lord do Lagna (${lagnaNinthLord.name}=${INDU_KALA_VALUES[lagnaLordKey]}) ` +
      `e do 9o lord da Lua (${moonNinthLord.name}=${INDU_KALA_VALUES[moonLordKey]}), total ${totalKala}, resto ${remainder}, ` +
      `contado diretamente desde a Lua em ${moon.signName}. ${reverseVariantNote}`,
  } satisfies SpecialLagnaRow;
}

function buildSriRow(snapshot: VedicSnapshot) {
  const moon = getPlanetPoint(snapshot, "moon") ?? snapshot.ascendant;
  const nakshatraArc = 13 + 20 / 60;
  const progressedArc = modulo(moon.longitude, nakshatraArc);
  const progressFraction = progressedArc / nakshatraArc;
  const longitude = modulo(snapshot.ascendant.longitude + progressFraction * 360, 360);

  return buildSpecialLagnaRow(
    snapshot,
    "sri",
    "Sri Lagna",
    longitude,
    `Sri Lagna classico: a fracao corrida da Lua no Janma Nakshatra (${(progressFraction * 100).toFixed(2)}%) foi projetada sobre o zodiaco inteiro e somada ao Lagna natal.`
  );
}

function buildTaraLagnaRow(snapshot: VedicSnapshot) {
  const moon = getPlanetPoint(snapshot, "moon") ?? snapshot.ascendant;
  const nakshatraArc = 13 + 20 / 60;
  const segmentArc = nakshatraArc / 12;
  const nakshatraOffset = modulo(moon.longitude, nakshatraArc);
  const quotient = Math.floor(nakshatraOffset / segmentArc);
  const houseOffset = quotient;
  const signIndex = modulo(snapshot.ascendant.signIndex + houseOffset, 12);

  return {
    key: "tara-lagna",
    label: "Tara Lagna",
    signIndex,
    signName: SIGN_NAMES[signIndex],
    houseFromLagna: signDistance(snapshot.ascendant.signIndex, signIndex) + 1,
    longitude: signIndex * 30,
    note:
      `Jaimini/Parasari: o trecho corrido do Janma Nakshatra (${nakshatraOffset.toFixed(2)}deg) foi dividido em 12 partes de ${segmentArc.toFixed(4)}deg; ` +
      `quociente ${quotient}, logo o Tara Lagna cai na ${houseOffset + 1}a casa desde o Lagna natal.`,
  } satisfies SpecialLagnaRow;
}

function getMovableTrineBaseSignIndex(signIndex: number) {
  if (signIndex % 3 === 0) {
    return signIndex;
  }
  if (signIndex % 3 === 1) {
    return modulo(signIndex - 4, 12);
  }
  return modulo(signIndex + 4, 12);
}

function buildPranapadaRow(snapshot: VedicSnapshot, sunriseReference: ReturnType<typeof buildSunriseReference>) {
  const sunriseSunLongitude = modulo(sunriseReference.sunriseSunLongitude, 360);
  const sunriseSunSignIndex = Math.floor(sunriseSunLongitude / 30);
  const sunriseSunDegree = modulo(sunriseSunLongitude, 30);
  const elapsedVighatis = sunriseReference.elapsedHours * 150;
  const traversedSigns = modulo(elapsedVighatis / 15, 12);
  const baseSignIndex = getMovableTrineBaseSignIndex(sunriseSunSignIndex);
  const longitude = modulo(baseSignIndex * 30 + sunriseSunDegree + traversedSigns * 30, 360);

  return buildSpecialLagnaRow(
    snapshot,
    "pranapada",
    "Pranapada Lagna",
    longitude,
    `Pranapada classico: ${elapsedVighatis.toFixed(2)} vighatis apos o sunrise dividido por 15 gera ${traversedSigns.toFixed(4)} signos; a base foi o signo movel em trino ao Sol do sunrise (${SIGN_NAMES[baseSignIndex]}), preservando o grau solar ${sunriseSunDegree.toFixed(2)}deg. ${sunriseReference.note}`
  );
}

function createPadaDatum(module: JyotishModuleKey, label: string, entry: ArudhaPoint | undefined, methodUsed: string) {
  return createDatum(module, "Pada", label, entry ? `${entry.signName} | H${entry.houseFromLagna}` : "--", {
    technicalNotes: entry?.note ?? `${label} nao disponivel neste snapshot.`,
    relatedSign: entry?.signName,
    relatedHouse: entry?.houseFromLagna,
    confidence: entry ? 0.76 : 0.3,
    status: entry ? "implemented" : "placeholder",
    methodUsed,
  });
}

export function specialLagnaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const sunriseReference = buildSunriseReference(snapshot);
  const bhavaLagna = buildSpecialLagnaRow(
    snapshot,
    "bhava-lagna",
    "Bhava Lagna",
    sunriseReference.sunriseSunLongitude + sunriseReference.elapsedGhatis * 6,
    `BPHS: 1 Bhava Lagna a cada 5 ghatis desde o sunrise. ${sunriseReference.note}`
  );
  const horaLagna = buildSpecialLagnaRow(
    snapshot,
    "hora-lagna",
    "Hora Lagna",
    sunriseReference.sunriseSunLongitude + sunriseReference.elapsedGhatis * 12,
    `BPHS: 1 Hora Lagna a cada 2.5 ghatis desde o sunrise. ${sunriseReference.note}`
  );
  const ghatiLagna = buildSpecialLagnaRow(
    snapshot,
    "ghati-lagna",
    "Ghati Lagna",
    sunriseReference.sunriseSunLongitude + sunriseReference.elapsedGhatis * 30,
    `BPHS: 1 Ghati Lagna por ghati transcorrido desde o sunrise. ${sunriseReference.note}`
  );
  const varnadLagna = buildVarnadaRow(snapshot, horaLagna);
  const induLagna = buildInduRow(snapshot);
  const sriLagna = buildSriRow(snapshot);
  const taraLagna = buildTaraLagnaRow(snapshot);
  const pranapadaLagna = buildPranapadaRow(snapshot, sunriseReference);
  const suryaLagna = buildSpecialLagnaRow(
    snapshot,
    "surya-lagna",
    "Surya Lagna",
    (snapshot.planets.find((point) => point.key === "sun") ?? snapshot.ascendant).longitude,
    "Referencia solar direta do mapa natal, util como ancora complementar de julgamento."
  );
  const chandraLagna = buildSpecialLagnaRow(
    snapshot,
    "chandra-lagna",
    "Chandra Lagna",
    (snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant).longitude,
    "Referencia lunar direta do mapa natal, util para dashas, gochara e experiencia vivida."
  );
  const arudhas = calculateArudhaSet(snapshot);
  const selectedPadas = arudhas.filter((entry) => [1, 2, 7, 10, 12].includes(entry.houseNumber));
  const arudhaLagna = selectedPadas.find((entry) => entry.houseNumber === 1);
  const dhanapada = selectedPadas.find((entry) => entry.houseNumber === 2);
  const darapada = selectedPadas.find((entry) => entry.houseNumber === 7);
  const rajyaPada = selectedPadas.find((entry) => entry.houseNumber === 10);
  const upapada = selectedPadas.find((entry) => entry.houseNumber === 12);
  const specialRows = [
    bhavaLagna,
    horaLagna,
    ghatiLagna,
    varnadLagna,
    induLagna,
    sriLagna,
    taraLagna,
    pranapadaLagna,
    suryaLagna,
    chandraLagna,
  ];

  return {
    sections: [
      createSection({
        id: `${module}-special-lagnas`,
        title: "Lagnas Especiais e Padas",
        description:
          "Explicita lagnas derivados do sunrise e padas mais usados no julgamento natal, para o relatorio nao depender apenas do Lagna basico.",
        status: "implemented",
        items: [
          createDatum(module, "Lagna Especial", "Bhava Lagna", `${bhavaLagna.signName} | H${bhavaLagna.houseFromLagna}`, {
            technicalNotes: bhavaLagna.note,
            relatedSign: bhavaLagna.signName,
            relatedHouse: bhavaLagna.houseFromLagna,
            confidence: sunriseReference.fallback ? 0.56 : 0.74,
            status: "implemented",
            methodUsed: "bphs-special-lagnas-bhava-v1",
          }),
          createDatum(module, "Lagna Especial", "Hora Lagna", `${horaLagna.signName} | H${horaLagna.houseFromLagna}`, {
            technicalNotes: horaLagna.note,
            relatedSign: horaLagna.signName,
            relatedHouse: horaLagna.houseFromLagna,
            confidence: sunriseReference.fallback ? 0.56 : 0.74,
            status: "implemented",
            methodUsed: "bphs-special-lagnas-hora-v1",
          }),
          createDatum(module, "Lagna Especial", "Ghati Lagna", `${ghatiLagna.signName} | H${ghatiLagna.houseFromLagna}`, {
            technicalNotes: ghatiLagna.note,
            relatedSign: ghatiLagna.signName,
            relatedHouse: ghatiLagna.houseFromLagna,
            confidence: sunriseReference.fallback ? 0.54 : 0.72,
            status: "implemented",
            methodUsed: "bphs-special-lagnas-ghati-v1",
          }),
          createDatum(module, "Lagna Especial", "Varnada Lagna", `${varnadLagna.signName} | H${varnadLagna.houseFromLagna}`, {
            technicalNotes: varnadLagna.note,
            relatedSign: varnadLagna.signName,
            relatedHouse: varnadLagna.houseFromLagna,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "bphs-special-lagnas-varnada-v1",
          }),
          createDatum(module, "Lagna Especial", "Indu Lagna", `${induLagna.signName} | H${induLagna.houseFromLagna}`, {
            technicalNotes: induLagna.note,
            relatedSign: induLagna.signName,
            relatedHouse: induLagna.houseFromLagna,
            confidence: 0.72,
            status: "implemented",
            methodUsed: "classical-indu-lagna-v1",
          }),
          createDatum(module, "Lagna Especial", "Sri Lagna", `${sriLagna.signName} | H${sriLagna.houseFromLagna}`, {
            technicalNotes: sriLagna.note,
            relatedSign: sriLagna.signName,
            relatedHouse: sriLagna.houseFromLagna,
            confidence: 0.74,
            status: "implemented",
            methodUsed: "classical-sri-lagna-v1",
          }),
          createDatum(module, "Lagna Especial", "Tara Lagna", `${taraLagna.signName} | H${taraLagna.houseFromLagna}`, {
            technicalNotes: taraLagna.note,
            relatedSign: taraLagna.signName,
            relatedHouse: taraLagna.houseFromLagna,
            confidence: 0.74,
            status: "implemented",
            methodUsed: "jaimini-tara-lagna-v1",
          }),
          createDatum(module, "Lagna Especial", "Pranapada Lagna", `${pranapadaLagna.signName} | H${pranapadaLagna.houseFromLagna}`, {
            technicalNotes: pranapadaLagna.note,
            relatedSign: pranapadaLagna.signName,
            relatedHouse: pranapadaLagna.houseFromLagna,
            confidence: sunriseReference.fallback ? 0.55 : 0.73,
            status: "implemented",
            methodUsed: "classical-pranapada-lagna-v1",
          }),
          createPadaDatum(module, "Arudha Lagna / A1", arudhaLagna, "arudha-a1-highlight-v1"),
          createPadaDatum(module, "Dhanapada / A2", dhanapada, "arudha-a2-highlight-v1"),
          createPadaDatum(module, "Darapada / A7", darapada, "arudha-a7-highlight-v1"),
          createPadaDatum(module, "Rajya Pada / A10", rajyaPada, "arudha-a10-highlight-v1"),
          createPadaDatum(module, "Upapada Lagna / A12", upapada, "arudha-a12-highlight-v1"),
        ],
        tables: [
          createTable(
            `${module}-special-lagnas-table`,
            "Lagnas especiais",
            ["Referencia", "Signo", "Casa", "Longitude", "Nota"],
            specialRows.map((row) => [
              row.label,
              row.signName,
              `H${row.houseFromLagna}`,
              formatLongitude(row.longitude),
              row.note,
            ]),
            "Bhava, Hora e Ghati seguem o capitulo de Special Lagnas do BPHS, ancorados no nascer do Sol local."
          ),
          createTable(
            `${module}-selected-arudha-padas`,
            "Padas destacados",
            ["Pada", "Signo", "Casa", "Regente", "Regente em", "Nota"],
            [
              arudhaLagna,
              dhanapada,
              darapada,
              rajyaPada,
              upapada,
            ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)).map((entry) => [
              entry.houseLabel,
              entry.signName,
              `H${entry.houseFromLagna}`,
              entry.lordLabel,
              entry.lordSignName,
              entry.note,
            ]),
            "A tabela destaca A1, A2, A7, A10 e A12 porque costumam ser os padas mais cobrados em leitura natal aplicada."
          ),
        ],
      }),
    ],
    summary: [
      `Lagnas especiais abertos com sunrise em ${sunriseReference.sourceDate}${sunriseReference.fallback ? " por fallback operacional" : ""}.`,
      "Bhava, Hora, Ghati, Varnada, Indu, Sri, Tara e Pranapada agora saem explicitados ao lado de A1, A2, A7, A10 e A12.",
    ],
  };
}
