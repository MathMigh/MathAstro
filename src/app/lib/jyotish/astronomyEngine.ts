import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishContext, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";
import { buildSiderealAuditContext } from "./astroTimings";

function formatUtcOffsetLabel(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatPrecisionLabel(minutes: number) {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} s`;
  }
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(2)} min`;
}

function buildAstronomyItems(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot,
  context: JyotishContext
) {
  const siderealAudit = buildSiderealAuditContext(
    snapshot.referenceDate,
    snapshot.localBirthTimeLabel,
    snapshot.timezone,
    snapshot.longitude
  );

  return [
    createDatum(module, "Configuracao", "Ayanamsha", context.config.ayanamsha, {
      technicalNotes: `${snapshot.ayanamsaDegrees} graus aplicados ao mapa.`,
      confidence: 0.9,
    }),
    createDatum(module, "Configuracao", "Zodiaco", "Sideral Nirayana", {
      technicalNotes: "O mapa e convertido do motor base para leitura sideral.",
      confidence: 0.9,
    }),
    createDatum(module, "Configuracao", "Sistema de bhava", context.config.houseSystem, {
      technicalNotes: `Bhava Chalit configurado em ${context.config.bhavaChalitSystem}.`,
      confidence: 0.7,
    }),
    createDatum(module, "Configuracao", "Camada KP", context.config.kpEnabled ? "Ativa e separada" : "Desligada", {
      technicalNotes: context.config.kpEnabled
        ? `KP usa ${context.config.kpAyanamsha} em ${context.config.kpHouseSystem}, com Ruling Planets ${context.config.kpRulingPlanetMode}.`
        : "Nenhuma camada KP foi anexada a esta suite.",
      confidence: 0.78,
    }),
    createDatum(module, "Astronomia", "Data base", snapshot.referenceDate, {
      technicalNotes: "Data usada para os calculos principais do modulo.",
      confidence: 0.95,
    }),
    createDatum(module, "Astronomia", "Data de analise", snapshot.analysisDate, {
      technicalNotes: "Data usada para dasha ativa, gochara e validacoes contextuais.",
      confidence: 0.95,
    }),
    createDatum(module, "Astronomia", "Hora local exata", snapshot.localBirthTimeLabel, {
      technicalNotes:
        `Hora recebida com resolucao operacional de ${formatPrecisionLabel(snapshot.birthTimePrecisionMinutes)}. ` +
        "Nao ha margem declarada de retificacao no payload atual.",
      confidence: 0.86,
    }),
    createDatum(module, "Astronomia", "Fuso horario", snapshot.timezone, {
      technicalNotes:
        `${formatUtcOffsetLabel(snapshot.timezoneOffsetMinutes)} no momento do nascimento; ` +
        `horario de verao ${snapshot.daylightSavingActive ? "ativo" : "inativo"}.`,
      confidence: 0.92,
    }),
    createDatum(module, "Astronomia", "Coordenadas geograficas", `${snapshot.latitude.toFixed(6)}, ${snapshot.longitude.toFixed(6)}`, {
      technicalNotes: "Latitude e longitude usadas para ascendente, casas e calculos locais de nascer do Sol.",
      confidence: 0.95,
    }),
    createDatum(module, "Astronomia", "SID", siderealAudit.clockLabel, {
      technicalNotes:
        `Hora sideral local do instante natal. Equivale a ${siderealAudit.degrees.toFixed(4)} graus ` +
        `(${siderealAudit.hours.toFixed(4)} h) para longitude ${snapshot.longitude.toFixed(6)}.`,
      confidence: 0.88,
    }),
    createDatum(module, "Configuracao", "Nodos lunares", "Medios", {
      technicalNotes: "O motor usa o corpo 10 do Swiss Ephemeris para Rahu; Ketu e derivado por oposicao exata.",
      confidence: 0.9,
    }),
    createDatum(module, "Configuracao", "Planetas externos", "Auxiliares fora do core Jyotish", {
      technicalNotes:
        "Urano, Netuno e Plutao nao entram como grahas classicos do corpo principal Parasari/Jaimini. " +
        "Se alguma camada auxiliar os mencionar, isso nao substitui os sete grahas e os nodos.",
      confidence: 0.9,
    }),
    createDatum(module, "Configuracao", "Referencial dos grahas", "Geocentrico", {
      technicalNotes: "As longitudes planetarias sao geocentricas; as casas dependem da localidade informada.",
      confidence: 0.9,
    }),
    createDatum(module, "Configuracao", "Metodo do nascer do Sol", context.config.sunriseMethod, {
      technicalNotes: "Parametro usado nas camadas que dependem do arco diurno local, como Panchanga e Muhurta.",
      confidence: 0.7,
    }),
    createDatum(module, "Configuracao", "Localidade e timezone", `${context.config.localityMode} | ${context.config.timezoneMode}`, {
      technicalNotes: "Deixa claro se o fuso veio da cidade/coordernada ou de override manual.",
      confidence: 0.7,
    }),
    createDatum(module, "Astronomia", "Lagna", snapshot.ascendant.signName, {
      relatedSign: snapshot.ascendant.signName,
      technicalNotes: `${snapshot.ascendant.degreeInSign.toFixed(2)} graus no signo.`,
      confidence: 0.85,
    }),
    createDatum(module, "Astronomia", "Sol", snapshot.sunSign, {
      relatedSign: snapshot.sunSign,
      technicalNotes: "Longitude sidereal do Sol depois da correcao do ayanamsha.",
      confidence: 0.8,
    }),
    createDatum(module, "Astronomia", "Lua", snapshot.moonSign, {
      relatedSign: snapshot.moonSign,
      relatedNakshatra: snapshot.panchanga.nakshatra,
      technicalNotes: "Base para nakshatra e dashas lunares.",
      confidence: 0.85,
    }),
    createDatum(module, "Configuracao", "Ayanamsha auditavel", `${context.config.ayanamsha} | ${snapshot.ayanamsaDegrees}deg`, {
      technicalNotes: "Valor numerico efetivamente aplicado ao mapa nesta data-base.",
      confidence: 0.92,
    }),
    createDatum(module, "Astronomia", "Fonte astronomica", snapshot.sourceEngine, {
      technicalNotes: "Longitudes, velocidades e retrogradacao derivadas da base Swiss Ephemeris do projeto.",
      confidence: 0.98,
    }),
    createDatum(module, "Astronomia", "Timezone resolvido", snapshot.timezone, {
      technicalNotes: `Latitude ${snapshot.latitude} | longitude ${snapshot.longitude}.`,
      confidence: 0.92,
    }),
    createDatum(module, "Astronomia", "Hora local decimal", snapshot.localBirthHour.toFixed(2), {
      unit: "h",
      technicalNotes: "Versao decimal preservada para formulas que trabalham com horas fracionadas.",
      confidence: 0.75,
    }),
    createDatum(module, "Astronomia", "Confianca dos vargas altos", snapshot.birthTimePrecisionMinutes <= 1 ? "Boa no payload; depende de retificacao real" : "Usar com cautela", {
      technicalNotes:
        "D9, D10, D40, D45 e D60 ficam mais sensiveis quando a margem real da hora e maior do que a resolucao recebida.",
      confidence: 0.68,
    }),
  ];
}

export function astronomyEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot,
  context: JyotishContext
): EngineResult {
  return {
    sections: [
      createSection({
        id: `${module}-configuracoes`,
        title: "Configuracoes Tecnicas",
        description:
          "Mostra a escola operacional usada neste calculo para que o relatorio deixe claras as dependencias do metodo.",
        status: "implemented",
        items: buildAstronomyItems(module, snapshot, context),
        tables: [
          createTable(
            `${module}-astronomy-planets`,
            "Dados astronomicos basicos",
            ["Ponto", "Longitude sideral", "Longitude de origem", "Velocidade", "Latitude", "Declinacao", "Estado"],
            [snapshot.ascendant, ...snapshot.planets].map((point) => [
              point.name,
              point.longitude.toFixed(4),
              point.sourceLongitude?.toFixed(4) ?? "--",
              point.longitudeSpeed?.toFixed(6) ?? "--",
              point.latitude?.toFixed(4) ?? "--",
              point.declination?.toFixed(4) ?? "--",
              point.retrograde ? "Retrogrado" : "Direto",
            ]),
            "Tabela puxada do motor Swiss Ephemeris e convertida para o recorte sideral configurado."
          ),
          createTable(
            `${module}-sidereal-houses`,
            "Cusps sidereais",
            ["Casa", "Longitude sideral"],
            snapshot.siderealHouseCusps.map((house, index) => [
              `${index + 1}`,
              house.toFixed(4),
            ]),
            "Cuspides derivadas das casas do motor base apos aplicacao do ayanamsha."
          ),
        ],
      }),
    ],
  };
}
