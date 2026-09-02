import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";
import {
  buildLunarDayTimings,
  buildSolarCalendarContext,
  buildSolarDayTimings,
  decimalHourToClockText,
} from "./astroTimings";

const SAMVATSARA_NAMES = [
  "Prabhava",
  "Vibhava",
  "Shukla",
  "Pramoduta",
  "Prajapati",
  "Angirasa",
  "Shrimukha",
  "Bhava",
  "Yuva",
  "Dhata",
  "Ishvara",
  "Bahudhanya",
  "Pramathi",
  "Vikrama",
  "Vrishapraja",
  "Chitrabhanu",
  "Svabhanu",
  "Tarana",
  "Parthiva",
  "Vyaya",
  "Sarvajit",
  "Sarvadhari",
  "Virodhi",
  "Vikriti",
  "Khara",
  "Nandana",
  "Vijaya",
  "Jaya",
  "Manmatha",
  "Durmukha",
  "Hevilambi",
  "Vilambi",
  "Vikari",
  "Sharvari",
  "Plava",
  "Shubhakrit",
  "Shobhakrit",
  "Krodhi",
  "Vishvavasu",
  "Parabhava",
  "Plavanga",
  "Kilaka",
  "Saumya",
  "Sadharana",
  "Virodhakrita",
  "Paridhavi",
  "Pramadi",
  "Ananda",
  "Rakshasa",
  "Nala",
  "Pingala",
  "Kalayukta",
  "Siddharthi",
  "Raudri",
  "Durmati",
  "Dundubhi",
  "Rudhirodgari",
  "Raktakshi",
  "Krodhana",
  "Akshaya",
] as const;

const LUNAR_MASA_NAMES = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashvina",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
] as const;

const VARIABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"] as const;
const FIXED_KARANAS: Record<number, string> = {
  0: "Kimstughna",
  57: "Shakuni",
  58: "Chatushpada",
  59: "Naga",
};
const TITHI_FAMILY_SEQUENCE = ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"] as const;

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function getSunAndMoon(snapshot: VedicSnapshot) {
  const sun = snapshot.planets.find((point) => point.key === "sun") ?? snapshot.ascendant;
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  return { sun, moon };
}

function buildTithiContext(sun: VedicPoint, moon: VedicPoint) {
  const angle = modulo(moon.longitude - sun.longitude, 360);
  const tithiIndex = Math.floor(angle / 12);
  const tithiProgressDegrees = angle % 12;
  return {
    angle,
    tithiIndex,
    tithiNumber: tithiIndex + 1,
    paksha: tithiIndex < 15 ? "Shukla" : "Krishna",
    progressDegrees: tithiProgressDegrees,
    progressPercent: (tithiProgressDegrees / 12) * 100,
    remainingDegrees: 12 - tithiProgressDegrees,
  };
}

function buildKaranaContext(angle: number) {
  const slot = Math.floor(angle / 6);
  const progressDegrees = angle % 6;
  let name = FIXED_KARANAS[slot];

  if (!name) {
    const cycleIndex = ((slot - 1) % 7 + 7) % 7;
    name = VARIABLE_KARANAS[cycleIndex];
  }

  return {
    slot,
    name,
    progressDegrees,
    progressPercent: (progressDegrees / 6) * 100,
    remainingDegrees: 6 - progressDegrees,
    kind: FIXED_KARANAS[slot] ? "Sthira" : "Chara",
  };
}

function buildYogaContext(sun: VedicPoint, moon: VedicPoint) {
  const angle = modulo(sun.longitude + moon.longitude, 360);
  const segment = 360 / 27;
  const yogaIndex = Math.floor(angle / segment);
  const progressDegrees = angle % segment;

  return {
    angle,
    yogaIndex,
    progressDegrees,
    progressPercent: (progressDegrees / segment) * 100,
    remainingDegrees: segment - progressDegrees,
    segmentDegrees: segment,
  };
}

function buildTithiFamily(tithiNumber: number) {
  const family = TITHI_FAMILY_SEQUENCE[modulo(tithiNumber - 1, TITHI_FAMILY_SEQUENCE.length)];
  const noteByFamily: Record<(typeof TITHI_FAMILY_SEQUENCE)[number], string> = {
    Nanda: "Faixa normalmente associada a nutricao, alegria e inicio de fluxo.",
    Bhadra: "Faixa ligada a sustentacao pratica, acordos e arranjos funcionais.",
    Jaya: "Faixa classica de enfrentamento, conquista e afirmacao de vontade.",
    Rikta: "Faixa de esvaziamento, corte e limpeza do que esta sobrando.",
    Purna: "Faixa de consolidacao, conclusao e fechamento com mais completude.",
  };

  return {
    family,
    note: noteByFamily[family],
  };
}

function progressPhaseLabel(progressPercent: number) {
  if (progressPercent < 25) {
    return "Abertura";
  }

  if (progressPercent > 75) {
    return "Fechamento";
  }

  return "Meio";
}

function buildCadenceState(
  rows: Array<{
    anga: string;
    progressPercent: number;
    phase: string;
  }>
) {
  const hotRows = rows.filter((row) => 100 - row.progressPercent <= 15);
  const middleRows = rows.filter((row) => row.phase === "Meio");
  const closingRows = rows.filter((row) => row.phase === "Fechamento");

  if (hotRows.length >= 2) {
    return {
      label: "Virada forte",
      note: `${hotRows.map((row) => row.anga).join(" e ")} ja estao perto de troca no recorte atual.`,
    };
  }

  if (closingRows.length >= 2) {
    return {
      label: "Faixa transicional",
      note: `${closingRows.map((row) => row.anga).join(" e ")} caminham juntos para encerramento de ciclo.`,
    };
  }

  if (middleRows.length >= 2) {
    return {
      label: "Cadencia estavel",
      note: "Dois ou mais angas estao em miolo de ciclo, reduzindo pressao imediata de troca.",
    };
  }

  return {
    label: "Cadencia regular",
    note: "Os angas nao estao totalmente sincronizados, mas tambem nao indicam virada concentrada.",
  };
}

function buildLunisolarMasa(sunSignIndex: number, paksha: string) {
  const amantaIndex = modulo(sunSignIndex + 1, 12);
  const purnimantaIndex = paksha === "Krishna" ? modulo(amantaIndex + 1, 12) : amantaIndex;

  return {
    amanta: LUNAR_MASA_NAMES[amantaIndex],
    purnimanta: LUNAR_MASA_NAMES[purnimantaIndex],
    note:
      "Working set sem adhika/ksaya masa: o nome parte do signo sideral do Sol, com ajuste de paksha apenas para a trilha purnimanta.",
  };
}

function buildSamvatsaraContext(analysisYear: number, sunSignIndex: number) {
  const solarCycleYear = sunSignIndex === 11 ? analysisYear - 1 : analysisYear;
  const cycleIndex = modulo(solarCycleYear - 1987, 60);
  return {
    solarCycleYear,
    cycleIndex,
    name: SAMVATSARA_NAMES[cycleIndex],
    note:
      "Nome anual pelo working set solar de Mesha-ingresso: ancora em 1987-1988 = Prabhava e troca de ciclo quando o Sol sideral deixa Meena e entra em Mesha.",
  };
}

export async function panchangaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): Promise<EngineResult> {
  const [year, month, day] = snapshot.analysisDate.split("-").map(Number);
  const solarTimings = buildSolarDayTimings(
    year,
    month,
    day,
    snapshot.latitude,
    snapshot.longitude,
    snapshot.timezone
  );
  const lunarTimings = await buildLunarDayTimings(
    year,
    month,
    day,
    snapshot.latitude,
    snapshot.longitude,
    snapshot.timezone
  );
  const { sun, moon } = getSunAndMoon(snapshot);
  const calendar = buildSolarCalendarContext(sun.signIndex, year);
  const tithiContext = buildTithiContext(sun, moon);
  const karanaContext = buildKaranaContext(tithiContext.angle);
  const yogaContext = buildYogaContext(sun, moon);
  const tithiFamily = buildTithiFamily(tithiContext.tithiNumber);
  const lunisolarMasa = buildLunisolarMasa(sun.signIndex, snapshot.panchanga.paksha);
  const samvatsara = buildSamvatsaraContext(year, sun.signIndex);
  const cadenceRows = [
    {
      anga: "Tithi",
      label: snapshot.panchanga.tithi,
      phase: progressPhaseLabel(tithiContext.progressPercent),
      progressPercent: tithiContext.progressPercent,
      remainingDegrees: tithiContext.remainingDegrees,
      note: `${tithiContext.paksha}; familia ${tithiFamily.family}.`,
    },
    {
      anga: "Yoga",
      label: snapshot.panchanga.yoga,
      phase: progressPhaseLabel(yogaContext.progressPercent),
      progressPercent: yogaContext.progressPercent,
      remainingDegrees: yogaContext.remainingDegrees,
      note: `Indice ${yogaContext.yogaIndex + 1} de 27 no arco somado Sol-Lua.`,
    },
    {
      anga: "Karana",
      label: karanaContext.name,
      phase: progressPhaseLabel(karanaContext.progressPercent),
      progressPercent: karanaContext.progressPercent,
      remainingDegrees: karanaContext.remainingDegrees,
      note: `${karanaContext.kind}; slot ${karanaContext.slot}.`,
    },
  ];
  const cadenceState = buildCadenceState(cadenceRows);

  return {
    sections: [
      createSection({
        id: `${module}-panchanga`,
        title: "Panchanga",
        description:
          "Tithi, Vara, Nakshatra, Yoga e Karana do momento base, agora combinados com o recorte solar local que alimenta o modulo eletivo.",
        status: "implemented",
        items: [
          createDatum(module, "Panchanga", "Vara", snapshot.panchanga.weekday, {
            technicalNotes: "Dia da semana do recorte calculado.",
            confidence: 0.92,
          }),
          createDatum(module, "Panchanga", "Tithi", snapshot.panchanga.tithi, {
            technicalNotes: `${snapshot.panchanga.paksha}; familia ${tithiFamily.family}.`,
            confidence: 0.84,
          }),
          createDatum(module, "Panchanga", "Nakshatra", snapshot.panchanga.nakshatra, {
            technicalNotes: `Ligado a dasha lunar e tara bala; Lua atual em pada ${moon.pada}.`,
            confidence: 0.88,
          }),
          createDatum(module, "Panchanga", "Yoga", snapshot.panchanga.yoga, {
            technicalNotes: `Yoga do dia calculado a partir do motor interno; indice ${yogaContext.yogaIndex + 1} de 27.`,
            confidence: 0.78,
          }),
          createDatum(module, "Panchanga", "Karana", snapshot.panchanga.karana, {
            technicalNotes: `Karana tecnico do momento de referencia; ${karanaContext.kind.toLowerCase()} no slot ${karanaContext.slot}.`,
            confidence: 0.78,
          }),
          createDatum(module, "Panchanga", "Masa solar", calendar.masa, {
            technicalNotes:
              "Recorte solar do mes pela longitude sideral do Sol. O calendario lunissolar completo permanece separado.",
            confidence: 0.76,
            status: "implemented",
          }),
          createDatum(module, "Panchanga", "Ritu", calendar.ritu, {
            technicalNotes: "Estacao vedica derivada do signo sideral do Sol.",
            confidence: 0.8,
            status: "implemented",
          }),
          createDatum(module, "Panchanga", "Ayana", calendar.ayana, {
            technicalNotes: "Janela solsticial inferida do percurso solar sideral.",
            confidence: 0.78,
            status: "implemented",
          }),
        ],
        tables: [
          createTable(
            `${module}-panchanga-solar`,
            "Recorte solar local",
            ["Item", "Valor", "Nota"],
            [
              [
                "Sunrise",
                decimalHourToClockText(solarTimings.sunrise),
                "Nascer do Sol local usado para tecnicas eletivas e horas planetarias.",
              ],
              [
                "Sunset",
                decimalHourToClockText(solarTimings.sunset),
                "Por do Sol local para divisao diurna e noturna.",
              ],
              [
                "Solar noon",
                decimalHourToClockText(solarTimings.solarNoon),
                "Centro do arco diurno local.",
              ],
              [
                "Duracao do dia",
                Number.isFinite(solarTimings.daylightHours ?? Number.NaN)
                  ? `${solarTimings.daylightHours?.toFixed(2)} h`
                  : "--",
                "Tempo entre nascer e por do Sol no local da carta.",
              ],
              [
                "Moonrise",
                decimalHourToClockText(lunarTimings.moonrise),
                lunarTimings.note,
              ],
              [
                "Moonset",
                decimalHourToClockText(lunarTimings.moonset),
                lunarTimings.source,
              ],
            ],
            "Tabela solar e lunar auxiliar do Panchanga, usada tambem por Muhurta."
          ),
        ],
      }),
      createSection({
        id: `${module}-panchanga-extended`,
        title: "Panchanga Estendido",
        description:
          "Expande a leitura do Panchanga com recorte anual e lunissolar de working set, deixando explicito onde a escola regional ainda pode mudar o resultado.",
        status: "implemented",
        items: [
          createDatum(module, "Panchanga", "Samvatsara", samvatsara.name, {
            technicalNotes: samvatsara.note,
            confidence: 0.64,
            status: "implemented",
            methodUsed: "working-set-solar-samvatsara",
          }),
          createDatum(module, "Panchanga", "Masa lunissolar (Amanta)", lunisolarMasa.amanta, {
            technicalNotes: lunisolarMasa.note,
            confidence: 0.58,
            status: "implemented",
            methodUsed: "working-set-amanta-no-adhika",
          }),
          createDatum(module, "Panchanga", "Masa lunissolar (Purnimanta)", lunisolarMasa.purnimanta, {
            technicalNotes:
              "Variante purnimanta derivada do mesmo working set, deslocando o nome na metade krishna do mes.",
            confidence: 0.56,
            status: "implemented",
            methodUsed: "working-set-purnimanta-no-adhika",
          }),
          createDatum(module, "Panchanga", "Familia do tithi", tithiFamily.family, {
            technicalNotes: tithiFamily.note,
            confidence: 0.76,
            status: "implemented",
            methodUsed: "tithi-family-sequence-v1",
          }),
          createDatum(
            module,
            "Panchanga",
            "Yoga fracionado",
            `${snapshot.panchanga.yoga} (${yogaContext.progressPercent.toFixed(1)}%)`,
            {
              technicalNotes:
                `Yoga derivado do arco somado Sol-Lua; faltam ${yogaContext.remainingDegrees.toFixed(2)}deg para a proxima troca.`,
              confidence: 0.78,
              status: "implemented",
              methodUsed: "yoga-sum-arc-progress-v1",
            }
          ),
          createDatum(
            module,
            "Panchanga",
            "Karana fracionado",
            `${karanaContext.name} (${karanaContext.progressPercent.toFixed(1)}%)`,
            {
              technicalNotes:
                "Calculado sobre o arco Sun-Moon em blocos de 6 graus, com karanas sthira para os slots 0, 57, 58 e 59.",
              confidence: 0.78,
              status: "implemented",
              methodUsed: "karana-slot-progress",
            }
          ),
          createDatum(module, "Panchanga", "Cadencia dos angas", cadenceState.label, {
            technicalNotes: cadenceState.note,
            confidence: 0.74,
            status: "implemented",
            methodUsed: "panchanga-cadence-overlay-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-panchanga-extended-table`,
            "Tithi, Yoga, Karana e Ciclo",
            ["Medida", "Valor", "Nota"],
            [
              [
                "Tithi corrente",
                `${snapshot.panchanga.tithi} (${tithiContext.paksha})`,
                `Numero ${tithiContext.tithiNumber}; ${tithiContext.progressPercent.toFixed(1)}% do tithi ja percorrido.`,
              ],
              [
                "Familia do tithi",
                tithiFamily.family,
                tithiFamily.note,
              ],
              [
                "Arco Sun-Moon",
                `${tithiContext.angle.toFixed(2)}deg`,
                `Faltam ${tithiContext.remainingDegrees.toFixed(2)}deg para a proxima troca de tithi.`,
              ],
              [
                "Yoga operacional",
                `${snapshot.panchanga.yoga} | indice ${yogaContext.yogaIndex + 1}`,
                `${yogaContext.progressPercent.toFixed(1)}% ja percorrido; faltam ${yogaContext.remainingDegrees.toFixed(2)}deg para a proxima troca.`,
              ],
              [
                "Karana operacional",
                `${karanaContext.name} | slot ${karanaContext.slot}`,
                `${karanaContext.kind}; faltam ${karanaContext.remainingDegrees.toFixed(2)}deg para o proximo karana.`,
              ],
              [
                "Masa lunissolar",
                `${lunisolarMasa.amanta} / ${lunisolarMasa.purnimanta}`,
                "Formato Amanta / Purnimanta, sem ajuste de adhika ou ksaya masa.",
              ],
              [
                "Samvatsara solar",
                samvatsara.name,
                `Ano-ancora do ciclo: ${samvatsara.solarCycleYear}; indice ${samvatsara.cycleIndex + 1} de 60.`,
              ],
            ],
            "A malha mostra o working set tecnico usado. Calendarios regionais e meses intercalares ainda podem exigir outra escola."
          ),
          createTable(
            `${module}-panchanga-cadence`,
            "Cadencia dos angas",
            ["Anga", "Valor", "Fase", "Ja percorrido", "Restante", "Nota"],
            cadenceRows.map((row) => [
              row.anga,
              row.label,
              row.phase,
              `${row.progressPercent.toFixed(1)}%`,
              `${row.remainingDegrees.toFixed(2)}deg`,
              row.note,
            ]),
            "Tabela operacional para separar angas em abertura, meio ou fechamento e medir a pressao de troca do recorte."
          ),
        ],
      }),
    ],
    summary: [
      `Panchanga em ${cadenceState.label.toLowerCase()}, com ${snapshot.panchanga.tithi}, ${snapshot.panchanga.yoga} e ${karanaContext.name}.`,
      `Calendario solar em ${calendar.masa}, ${calendar.ritu} e ${calendar.ayana}; Samvatsara ${samvatsara.name}.`,
    ],
  };
}
