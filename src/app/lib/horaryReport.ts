import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { formatDegrees, getAspects, getSect } from "./traditionalCalculations";
import { getHourLord, LILLY_CRITICAL_DEGREES, HORARY_TOPICS, PLANET_TYPE_TO_NAME } from "./horaryTables";
import {
  calculateEssentialDignities,
  calculateAccidentalDignities,
  getHorarySignificators,
  calculateCollection,
  calculateReception,
  calculateHoraryParts,
  calculateHoraryVerdict,
} from "./horaryCalculations";
import { buildFixedStarReportLine, calculateFixedStarMatches } from "./fixedStars";
import type { HoraryData } from "@/interfaces/HoraryInterfaces";

// ============================================================
// Relatório Horário Completo
// ============================================================

export function generateHoraryReport(
  chart: BirthChart,
  question: string,
  topic?: string,
): string {
  const sect = getSect(
    chart.planets.find((p) => p.type === "sun")!.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house,
  );

  const ascLon = chart.housesData.ascendant;
  const ascSignIdx = Math.floor(((ascLon % 360) + 360) % 360 / 30) % 12;
  const ascDegInSign = ((ascLon % 360) + 360) % 360 % 30;

  // Dados da pergunta
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const hourLord = getHourLord(dayOfWeek, hour);

  // Dignidades
  const essentialDignities = calculateEssentialDignities(chart);
  const accidentalDignities = calculateAccidentalDignities(chart, essentialDignities);

  // Significadores
  const resolvedTopic = topic?.toLowerCase().trim() ?? "";
  const significators = getHorarySignificators(chart, resolvedTopic, essentialDignities, accidentalDignities);

  // Coleção
  const collection = calculateCollection(chart, significators);

  // Recepção
  const reception = calculateReception(significators, chart);

  // Partes
  const horaryParts = calculateHoraryParts(chart);

  // Ascendente crítico
  const ascendantIsCritical = LILLY_CRITICAL_DEGREES.some((d) => {
    const rounded = Math.floor(ascDegInSign);
    return rounded === d;
  });

  let ascendantTestimony = `Ascendente a ${Math.floor(ascDegInSign)}°${Math.floor((ascDegInSign % 1) * 60)}' ${ascendantIsCritical ? "— GRAU CRÍTICO DE LILLY" : ""}`;
  if (Math.floor(ascDegInSign) >= 29) {
    ascendantTestimony += "\n⚠ ATENÇÃO: Ascendente em grau tardio (29°). A situação já pode ter se resolvido ou estar mudando.";
  }

  // Veredito
  const horaryData: Partial<HoraryData> = {
    chartCondition: sect,
    hourLord,
    ascendantDegree: ascDegInSign,
    ascendantIsCritical,
    significators,
    collection,
    reception,
    essentialDignities,
    accidentalDignities,
  };

  const verdict = calculateHoraryVerdict(chart, horaryData);

  // ---- Construir relatório ----
  const sep = "────────────────────────────────────────────────────────────";
  const bd = chart.birthDate;

  let r = "";
  r += `╔══════════════════════════════════════════════════════════╗\n`;
  r += `║              CARTA HORÁRIA — TRADICIONAL                ║\n`;
  r += `╚══════════════════════════════════════════════════════════╝\n\n`;
  r += `Pergunta: "${question}"\n`;
  r += `Data da pergunta: ${String(bd.day).padStart(2, "0")}/${String(bd.month).padStart(2, "0")}/${bd.year} ${bd.time}\n`;
  r += `Local: ${bd.coordinates.name ?? `${bd.coordinates.latitude}°, ${bd.coordinates.longitude}°`}\n`;

  // --- TESTEMUNHO INICIAL ---
  r += `\n${sep}\n`;
  r += `TESTEMUNHO INICIAL\n`;
  r += `${sep}\n`;
  r += `• Condição: ${sect}\n`;
  r += `• Senhor da Hora: ${hourLord}\n`;
  r += `• ${ascendantTestimony}\n`;

  // --- SIGNIFICADORES ---
  r += `\n${sep}\n`;
  r += `SIGNIFICADORES\n`;
  r += `${sep}\n`;
  const qPlanet = chart.planets.find((p) => p.type === significators.querent.lord);
  const qsPlanet = chart.planets.find((p) => p.type === significators.quesited.lord);
  r += `• Consulente: ${significators.querent.lordName} (regente do AC)\n`;
  r += `  Posição: ${qPlanet ? formatDegrees(qPlanet.longitudeRaw) : "?"}\n`;
  r += `  Casa: ${qPlanet ? getHouseFromChart(qPlanet.longitudeRaw, chart) : "?"}\n`;
  r += `  Essenciais: ${significators.querent.essentialScore > 0 ? `+${significators.querent.essentialScore}` : significators.querent.essentialScore} pontos\n`;
  r += `  Acidentais: ${significators.querent.accidentalScore > 0 ? `+${significators.querent.accidentalScore}` : significators.querent.accidentalScore} pontos\n`;
  r += `  Total: ${significators.querent.totalScore > 0 ? `+${significators.querent.totalScore}` : significators.querent.totalScore} pontos\n\n`;
  r += `• Quesitado: ${significators.quesited.lordName} (regente da Casa ${significators.derivedHouse})\n`;
  r += `  Tópico: ${significators.topicLabel}\n`;
  r += `  Posição: ${qsPlanet ? formatDegrees(qsPlanet.longitudeRaw) : "?"}\n`;
  r += `  Casa: ${qsPlanet ? getHouseFromChart(qsPlanet.longitudeRaw, chart) : "?"}\n`;
  r += `  Essenciais: ${significators.quesited.essentialScore > 0 ? `+${significators.quesited.essentialScore}` : significators.quesited.essentialScore} pontos\n`;
  r += `  Acidentais: ${significators.quesited.accidentalScore > 0 ? `+${significators.quesited.accidentalScore}` : significators.quesited.accidentalScore} pontos\n`;
  r += `  Total: ${significators.quesited.totalScore > 0 ? `+${significators.quesited.totalScore}` : significators.quesited.totalScore} pontos\n`;

  // --- DIGNIDADES ESSENCIAIS ---
  r += `\n${sep}\n`;
  r += `DIGNIDADES E DEBILIDADES ESSENCIAIS\n`;
  r += `${sep}\n`;
  for (const ed of essentialDignities) {
    const p = chart.planets.find((pl) => pl.type === ed.planetType);
    const posStr = p ? formatDegrees(p.longitudeRaw) : "?";
    let line = `${ed.planetName} em ${posStr}`;
    line += ` — Domicílio: ${ed.domicile ?? "—"}`;
    line += `, Exaltação: ${ed.exaltation ?? "—"}`;
    line += `, Triplicidade: ${ed.triplicity ?? "—"}`;
    line += `, Termo: ${ed.term ?? "—"}`;
    line += `, Face: ${ed.face ?? "—"}`;
    if (ed.isPeregrine) {
      line += ` → PEREGRINO (${ed.essentialScore} pontos)`;
    } else {
      line += ` → ${ed.essentialScore > 0 ? "+" : ""}${ed.essentialScore} pontos`;
    }
    if (ed.detriment) line += ` [DETRIMENTO: ${ed.detriment}]`;
    if (ed.fall) line += ` [QUEDA: ${ed.fall}]`;
    r += `${line}\n`;
  }

  // --- DIGNIDADES ACIDENTAIS ---
  r += `\n${sep}\n`;
  r += `DIGNIDADES E DEBILIDADES ACIDENTAIS\n`;
  r += `${sep}\n`;
  for (const ad of accidentalDignities) {
    const p = chart.planets.find((pl) => pl.type === ad.planetType);
    const posStr = p ? formatDegrees(p.longitudeRaw) : "?";
    let line = `${ad.planetName} — Casa ${p ? getHouseFromChart(p.longitudeRaw, chart) : "?"} (${ad.houseType})`;
    line += `, ${ad.isDirect ? "Direto" : "Retrógrado"}`;
    line += `, ${ad.isSwift ? "Rápido" : "Lento"}`;
    if (ad.isCazimi) line += ", CAZIMI";
    else if (ad.isCombust) line += ", COMBUSTO";
    else if (ad.isUnderSunbeams) line += ", Sob Raios do Sol";
    line += `, ${ad.isOriental ? "Oriental" : "Ocidental"}`;
    if (ad.conjunctBenefic.length) line += `, conj. ${ad.conjunctBenefic.join(", ")}`;
    if (ad.conjunctMalefic.length) line += `, conj. ${ad.conjunctMalefic.join(", ")}`;
    if (ad.isLordOfMC) line += ", Senhor do MC";
    if (ad.fortuneInGoodHouse) line += ", Fortuna em casa favorável";
    line += ` → Acidental: ${ad.accidentalScore > 0 ? "+" : ""}${ad.accidentalScore} / Total: ${ad.totalScore > 0 ? "+" : ""}${ad.totalScore}`;
    r += `${line}\n`;
  }

  // --- RECEPÇÃO ---
  r += `\n${sep}\n`;
  r += `RECEPÇÃO\n`;
  r += `${sep}\n`;
  const qName = significators.querent.lordName;
  const qsName = significators.quesited.lordName;

  if (reception.querentToQuesited || reception.quesitedToQuerent) {
    if (reception.querentToQuesited) {
      const r1 = reception.querentToQuesited;
      r += `• ${qName} (consulente) está no signo de dignidade de ${qsName} (quesitado) por: ${r1.by.join(", ")}. Força: ${r1.strength}.\n`;
    }
    if (reception.quesitedToQuerent) {
      const r2 = reception.quesitedToQuerent;
      r += `• ${qsName} (quesitado) está no signo de dignidade de ${qName} (consulente) por: ${r2.by.join(", ")}. Força: ${r2.strength}.\n`;
    }
    if (reception.isMutual) {
      r += `\n  ✦ RECEPÇÃO MÚTUA — ${reception.mutualBy ?? ""}. Indica boa vontade e aceitação mútua.\n`;
    }
  } else {
    r += `• Não há recepção entre os significadores. As partes não possuem afinidade natural.\n`;
  }

  // --- COLEÇÃO E TRADUÇÃO ---
  r += `\n${sep}\n`;
  r += `COLEÇÃO E TRADUÇÃO\n`;
  r += `${sep}\n`;

  if (collection.aspectType) {
    const aspectLabels: Record<string, string> = {
      conjunction: "conjunção",
      sextile: "sextil",
      square: "quadratura",
      trine: "trígono",
      opposition: "oposição",
    };
    const aspectLabel = aspectLabels[collection.aspectType] ?? collection.aspectType;
    const applyingStr = collection.isApplying ? "APLICANDO (aproximando-se)" : "SEPARANDO (afastando-se)";
    r += `• ${collection.applyingPlanet} está ${applyingStr} de ${collection.receivingPlanet} por ${aspectLabel}`;
    if (collection.orb !== undefined) {
      r += ` (orbe: ${collection.orb.toFixed(1)}°)`;
    }
    r += `.\n`;

    if (collection.translation) {
      r += `• Tradução: ${collection.translation.translatingPlanet} traduz a luz de ${collection.translation.from} para ${collection.translation.to} por ${aspectLabels[collection.translation.aspectType] ?? collection.translation.aspectType}.\n`;
    }
    if (collection.prohibition) {
      r += `• PROIBIÇÃO: ${collection.prohibition.prohibitingPlanet} ${collection.prohibition.details}\n`;
    }
    if (collection.frustration) {
      r += `• FRUSTRAÇÃO: ${collection.frustration.details}\n`;
    }
    if (collection.contrantiscion) {
      r += `• Contrantiscion presente — união por via indireta.\n`;
    }
  } else {
    r += `• Não há aspecto entre ${collection.applyingPlanet} e ${collection.receivingPlanet}. Os significadores não se conectam.\n`;
  }

  // --- PARTES ÁRABES ---
  r += `\n${sep}\n`;
  r += `PARTES ÁRABES DA HORÁRIA\n`;
  r += `${sep}\n`;
  for (const part of horaryParts) {
    r += `• ${part.name} em ${part.posFormatted} na ${part.house}\n`;
  }

  // --- ASPECTOS TRADICIONAIS ---
  r += `\n${sep}\n`;
  r += `ASPECTOS TRADICIONAIS\n`;
  r += `${sep}\n`;
  try {
    const aspects = getAspects(chart);
    for (const aspect of aspects) {
      r += `${aspect}\n`;
    }
  } catch {
    r += "(Não foi possível calcular os aspectos)\n";
  }

  // --- ESTRELAS FIXAS ---
  r += `\n${sep}\n`;
  r += `ESTRELAS FIXAS\n`;
  r += `${sep}\n`;
  const fixedStarMatches = chart.fixedStarMatches ?? calculateFixedStarMatches(chart);
  if (fixedStarMatches.length === 0) {
    r += `Nenhuma estrela fixa relevante dentro da orbe de 2°.\n`;
  } else {
    const grouped: Record<string, typeof fixedStarMatches> = {};
    for (const match of fixedStarMatches) {
      if (!grouped[match.pointName]) grouped[match.pointName] = [];
      grouped[match.pointName].push(match);
    }
    for (const [pointName, matches] of Object.entries(grouped)) {
      const lon = matches[0]?.pointLongitude ?? 0;
      r += `${pointName} em ${formatDegrees(lon)}: ${matches.map((m) => buildFixedStarReportLine(m)).join("; ")}.\n`;
    }
  }

  // --- VEREDITO ---
  r += `\n${sep}\n`;
  r += `VEREDITO\n`;
  r += `${sep}\n`;
  r += `Pontuação: ${verdict.score > 0 ? "+" : ""}${verdict.score}\n`;
  r += `Confiança: ${verdict.confidence}\n\n`;
  r += `Resumo:\n${verdict.summary}\n\n`;
  r += `Indicadores detalhados:\n`;
  for (const detail of verdict.detailedReport) {
    r += `  • ${detail}\n`;
  }
  if (verdict.detailedReport.length === 0) {
    r += `  • Nenhum indicador forte identificado. A carta não apresenta sinais claros.\n`;
  }

  r += `\n${sep}\n`;

  return r;
}

// ============================================================
// Helper local
// ============================================================

function getHouseFromChart(longitude: number, chart: BirthChart): string {
  // Reuse the same logic as traditionalCalculations
  const cusps = chart.housesData.house;
  const lon = ((longitude % 360) + 360) % 360;
  for (let i = 0; i < 11; i++) {
    const start = ((cusps[i] % 360) + 360) % 360;
    const end = ((cusps[i + 1] % 360) + 360) % 360;
    if (end < start) {
      if (lon >= start || lon < end) return `${i + 1}`;
    } else {
      if (lon >= start && lon < end) return `${i + 1}`;
    }
  }
  return "12";
}
