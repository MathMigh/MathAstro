import { BirthChart, Planet } from "@/interfaces/BirthChartInterfaces";
import {
  formatDegrees,
  getAspects,
  getHouseIndex,
  getSect,
} from "./traditionalCalculations";
import {
  calculateArabicLots,
  fromTotal,
  ORDERED_ARABIC_PART_KEYS,
} from "./arabicLots";
import { AVERAGE_DAILY_SPEED, DOMICILE_RULER, SIGNS } from "./traditionalTables";
import { calculateTemperament } from "./traditionalTemperament";
import {
  buildFixedStarReportLine,
  calculateFixedStarMatches,
} from "./fixedStars";
import {
  calculateNatalAnalysis,
  NatalAnalysis,
} from "./natalAnalysis";

const OUTER_PLANET_TYPES = new Set(["uranus", "neptune", "pluto"]);
const NODE_TYPES = new Set(["northNode", "southNode"]);
const RETROGRADE_SPEED_EPSILON = 1e-6;
const ARABIC_PARTS_WITH_DO_ARTICLE = new Set([
  "Espírito",
  "Amor",
  "Valor",
  "Cativeiro",
]);

interface TraditionalReportArabicPart {
  name: string;
  longitude: number;
  posFormatted: string;
  house: string;
  dispositor: string;
  antiscion: string;
}

export function generateTraditionalReport(
  chart: BirthChart,
  providedAnalysis?: NatalAnalysis,
): string {
  const sect = getSect(
    chart.planets.find((p) => p.type === "sun")!.longitudeRaw,
    chart.housesData.ascendant,
    chart.housesData.house,
  );

  const planets = chart.planets;
  const sun = planets.find((p) => p.type === "sun")!;
  const moon = planets.find((p) => p.type === "moon")!;
  const merc = planets.find((p) => p.type === "mercury")!;
  const ven = planets.find((p) => p.type === "venus")!;
  const mars = planets.find((p) => p.type === "mars")!;
  const jup = planets.find((p) => p.type === "jupiter")!;
  const sat = planets.find((p) => p.type === "saturn")!;

  const asc = chart.housesData.ascendant;
  const mc = chart.housesData.mc;
  const desc = (asc + 180) % 360;
  const ic = (mc + 180) % 360;
  const temperament = calculateTemperament(chart);
  const analysis = providedAnalysis ?? calculateNatalAnalysis(chart);

  let report = "MAPA TRADICIONAL OCIDENTAL:\n\n";
  report += "BASE DE CÁLCULO:\n";
  report += `Zodíaco tropical; Regiomontanus canônico + Placidus paralelo; ${chart.calculationMetadata?.nodeMode ?? "Nodo verdadeiro"}.\n`;
  if (chart.calculationMetadata) {
    report += `UTC calculado: ${chart.calculationMetadata.utcIso}; fuso: ${chart.calculationMetadata.timezone}; JD(UT): ${chart.calculationMetadata.julianDayUt.toFixed(8)}.\n`;
  }
  report += "Triplicidades de dois regentes de Marcos Monteiro; termos de Lilly.\n\n";
  report += `Ascendente em ${formatDegrees(asc)} (Lento).\n`;
  report += `Descendente em ${formatDegrees(desc)} (Lento).\n`;
  report += `Meio do Ceu (MC) em ${formatDegrees(mc)} (Lento).\n`;
  report += `Fundo do Ceu (IC) em ${formatDegrees(ic)} (Lento).\n\n`;

  const orderedPlanets = [
    sun,
    moon,
    merc,
    ven,
    mars,
    jup,
    sat,
    ...planets.filter((p) => OUTER_PLANET_TYPES.has(p.type)),
    ...planets.filter((p) => NODE_TYPES.has(p.type)),
  ];

  orderedPlanets.forEach((planet) => {
    report += `${formatPlanetReportLine(planet, chart)}\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += `Secto: ${sect}.\n`;
  report += "--------------------------------------------------------------------\n";
  report += `Temperamento: ${temperament.summary} (síntese qualitativa dos cinco testemunhos).\n`;
  report += `Os cinco testemunhos permanecem discriminados; totais internos não constituem pesos autorais nem score canônico.\n`;
  report += `Senhor da Natividade (Marcos): ${analysis.lordOfNativity.planet ?? "não resolvido"}; seleção por hierarquia essencial; aspectos/força acidental não desempataram.\n`;
  report += "--------------------------------------------------------------------\n";
  report += "MENTALIDADE — TESTEMUNHOS CALCULÁVEIS:\n\n";
  report += "Marcos (primário):\n";
  analysis.mentality.sourceVariants.marcos.evidence.forEach((evidence) => {
    report += `- ${evidence}\n`;
  });
  report += "Frawley (complementar publicado):\n";
  analysis.mentality.sourceVariants.frawley.evidence.forEach((evidence) => {
    report += `- ${evidence}\n`;
  });
  report += "Gugu (suplemento de terceiro nível):\n";
  analysis.mentality.sourceVariants.gugu.evidence.forEach((evidence) => {
    report += `- ${evidence}\n`;
  });
  report += "Lua e Mercúrio permanecem como significadores paralelos; o motor não escolhe um parceiro dominante por score.\n";
  if (analysis.mentality.modifyingAspects.length > 0) {
    report += "Modificadores próximos:\n";
    analysis.mentality.modifyingAspects.forEach((aspect) => {
      report += `- ${aspect.significator} ${translateAspect(aspect.aspect)} ${aspect.planet}, orbe ${formatDecimalOrb(aspect.orb)}, ${aspect.applying ? "aplicativo" : "separativo"}.\n`;
    });
  }
  if (analysis.mentality.unresolved.length) {
    report += `Pendências: ${analysis.mentality.unresolved.join(" | ")}\n`;
  }
  report += "--------------------------------------------------------------------\n";

  report += "CUSPIDES DAS CASAS:\n\n";
  chart.housesData.house.forEach((cuspLon, idx) => {
    const hNum = idx + 1;
    const almutenData = analysis.cuspAlmutens[idx];
    const almuten = almutenData.winner ?? `empate (${almutenData.tiedWinners.join(", ")})`;
    const antiscionLon = (540 - cuspLon) % 360;
    report += `Casa ${hNum} em ${formatDegrees(cuspLon)}, almuten ${almuten}. (antiscion: ${formatDegrees(antiscionLon)}).\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += "PARTES ARABES:\n\n";
  const parts = buildTraditionalReportArabicParts(chart);
  parts.forEach((p) => {
    report += `Parte ${getArabicPartArticle(p.name)} ${p.name} em ${p.posFormatted} na ${p.house}. (Dispositor: ${p.dispositor}). Antiscion: ${p.antiscion}.\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += "ANTISCIOS:\n\n";
  planets
    .concat(parts.map((p) => ({ name: p.name, longitudeRaw: p.longitude } as Planet)))
    .forEach((p) => {
      const antLon = (540 - p.longitudeRaw) % 360;
      const contraStr = formatDegrees((antLon + 180) % 360);
      report += `${p.name} - antiscion: ${formatDegrees(antLon)} | contrantiscion: ${contraStr}.\n`;
    });

  report += "--------------------------------------------------------------------\n";
  report += "ESTRELAS FIXAS:\n\n";
  const fixedStarMatches =
    chart.fixedStarMatches ?? calculateFixedStarMatches(chart);
  const relevantFixedStarMatches = fixedStarMatches.filter((match) => match.isRelevant);
  const starMeta = chart.fixedStarCatalogMetadata;
  if (starMeta) {
    report += `Céu natal: ${starMeta.calculatedEntries}/${starMeta.uniqueEntries} estrelas calculadas do ${starMeta.source}; acima do horizonte=${starMeta.aboveHorizonEntries ?? "n/d"}; modo=${starMeta.calculationMode}.\n`;
  }

  if (relevantFixedStarMatches.length === 0) {
    if ((chart.fixedStarCatalog?.length ?? 0) > 0) {
      report += "Catálogo estelar calculado; nenhum contato PRINCIPAL passou pelos filtros interpretativos ativos. Isto não significa ausência de estrelas no céu natal.\n";
    } else {
      report += "Catálogo de estrelas indisponível/falhou; não interpretar como ausência de contatos.\n";
    }
  } else {
    const groupedMatches = relevantFixedStarMatches.reduce<Record<string, typeof relevantFixedStarMatches>>(
      (accumulator, match) => {
        if (!accumulator[match.pointName]) {
          accumulator[match.pointName] = [];
        }

        accumulator[match.pointName].push(match);
        return accumulator;
      },
      {}
    );

    Object.entries(groupedMatches).forEach(([pointName, matches]) => {
      const pointLongitude = matches[0]?.pointLongitude ?? 0;
      report += `${pointName} em ${formatDegrees(pointLongitude)}: ${matches
        .map((match) => buildFixedStarReportLine(match))
        .join("; ")};\n`;
    });
  }
  const secondaryFixedStarCount = fixedStarMatches.length - relevantFixedStarMatches.length;
  if (secondaryFixedStarCount > 0) {
    report += `${secondaryFixedStarCount} coincidência(s) secundária(s) foram preservadas nos dados, mas omitidas do juízo principal.\n`;
  }

  report += "--------------------------------------------------------------------\n";
  report += "ASPECTOS TRADICIONAIS:\n\n";
  const aspList = getAspects(chart);
  aspList.forEach((aspect) => {
    report += `${aspect}\n`;
  });

  report += "-------------------------------------------------------------------\n";
  report += "DIGNIDADES E DEBILIDADES ESSENCIAIS:\n\n";
  analysis.essentialConditions.forEach((condition) => {
    report += `${condition.planet} em ${condition.sign} — dignidades: ${formatEssentialDignities(condition)}; debilidades: ${formatEssentialDebilities(condition)}; pontuação Marcos ${signed(condition.marcosScore)}, referência Frawley ${signed(condition.frawleyScore)}.\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += "DIGNIDADES E DEBILIDADES ACIDENTAIS:\n\n";
  analysis.accidentalConditions.forEach((condition) => {
    const testimonies = condition.testimonies
      .map((testimony) => `${testimony.label} (${signed(testimony.score)})`)
      .join("; ");
    report += `${condition.planet}: ${testimonies}. Total de referência: ${signed(condition.frawleyScore)}.\n`;
  });

  report += "--------------------------------------------------------------------\n";
  report += "SENHORES GERAIS DO MAPA:\n\n";
  report += `Senhor da Natividade (Marcos, usado no temperamento): ${analysis.lordOfNativity.planet}.\n`;
  report += `Senhor da Genitura (Frawley, essenciais + acidentais): ${formatRankingWinners(analysis.lordOfGeniture)}.\n`;
  report += `Almúten essencial do mapa: ${formatRankingWinners(analysis.chartAlmuten)}.\n`;
  report += "Almuten Figuris medieval: não inferido sem fórmula específica atribuível às autoridades adotadas.\n";

  report += "--------------------------------------------------------------------\n";
  report += "RECEPÇÕES MÚTUAS:\n\n";
  if (analysis.mutualReceptions.length === 0) {
    report += "Nenhuma recepção mútua essencial identificada.\n";
  } else {
    analysis.mutualReceptions.forEach((reception) => {
      report += `${reception.planets[0]} recebe ${reception.planets[1]} por ${reception.firstReceivesSecondBy.join("/")}; ${reception.planets[1]} recebe ${reception.planets[0]} por ${reception.secondReceivesFirstBy.join("/")}${reception.hasAspect ? `; com ${translateAspect(reception.aspect!)} em orbe ${formatDecimalOrb(reception.orb!)}` : "; sem aspecto dentro da orbe"}.\n`;
    });
  }

  report += "--------------------------------------------------------------------\n";
  report += "DISPOSITORES E CADEIAS:\n\n";
  analysis.dispositors.chains.forEach((chain) => {
    report += `${chain.planet}: ${chain.chain.join(" → ")}${chain.cycle ? " (circuito; sem dispositor final)" : chain.finalDispositor ? ` (final: ${chain.finalDispositor})` : ""}.\n`;
  });
  report += analysis.dispositors.globalFinalDispositor
    ? `Dispositor final global: ${analysis.dispositors.globalFinalDispositor}.\n`
    : "Não há dispositor final global.\n";

  report += "--------------------------------------------------------------------\n";
  report += "CONTATOS POR ANTÍSCIO (ORBE PRIMÁRIA DE 3°):\n\n";
  if (analysis.antiscia.contacts.length === 0) {
    report += "Nenhuma conjunção ou oposição por antíscio dentro da orbe primária.\n";
  } else {
    analysis.antiscia.contacts.forEach((contact) => {
      report += `${contact.first} — ${contact.second}: ${contact.type} por antíscio, orbe ${formatDecimalOrb(contact.orb)}.\n`;
    });
  }

  report += "--------------------------------------------------------------------\n";

  return report;
}

function buildTraditionalReportArabicParts(
  chart: BirthChart,
): TraditionalReportArabicPart[] {
  const lots = calculateArabicLots(chart);

  return ORDERED_ARABIC_PART_KEYS.flatMap((key) => {
    const lot = lots[key];
    if (!lot) {
      return [];
    }

    const { signo } = fromTotal(lot.longitudeRaw);
    const ruler = DOMICILE_RULER[signo];
    const rulerPlanet = chart.planets.find((planet) => planet.name === ruler);

    return [
      {
        name: lot.name,
        longitude: lot.longitude,
        posFormatted: formatDegrees(lot.longitude),
        house: `Casa ${getHouseIndex(lot.longitude, chart.housesData.house)}`,
        dispositor: formatDispositor(ruler, rulerPlanet, chart),
        antiscion: formatDegrees(lot.antiscionRaw),
      },
    ];
  });
}

function getArabicPartArticle(name: string): string {
  return ARABIC_PARTS_WITH_DO_ARTICLE.has(name) ? "do" : "da";
}

function formatDispositor(
  ruler: string,
  rulerPlanet: Planet | undefined,
  chart: BirthChart,
): string {
  if (!rulerPlanet) {
    return ruler;
  }

  return `${ruler} em ${formatDegrees(rulerPlanet.longitudeRaw)}, na Casa ${getHouseIndex(rulerPlanet.longitudeRaw, chart.housesData.house)}`;
}

function formatPlanetReportLine(planet: Planet, chart: BirthChart): string {
  const hIdx = getHouseIndex(planet.longitudeRaw, chart.housesData.house);
  const { sign, degrees } = formatSignAndDegrees(planet.longitudeRaw);
  const motion = getPlanetMotionDescription(planet);
  const note = getTraditionalPlanetNote(planet);

  return `${planet.name} em ${sign}, a ${degrees} na Casa ${romanize(hIdx)} (${motion})${note}.`;
}

function formatSignAndDegrees(longitude: number): { sign: string; degrees: string } {
  const totalMinutes = ((Math.round(longitude * 60) % 21600) + 21600) % 21600;
  const signIdx = Math.floor(totalMinutes / 1800) % 12;
  const remaining = totalMinutes - signIdx * 1800;
  const degree = Math.floor(remaining / 60);
  const minute = remaining % 60;

  return {
    sign: SIGNS[signIdx],
    degrees: `${degree}°${minute.toString().padStart(2, "0")}’`,
  };
}

function getPlanetMotionDescription(planet: Planet): string {
  if (planet.isRetrograde) {
    return "Retrógrado";
  }

  const averageSpeed = AVERAGE_DAILY_SPEED[planet.name];
  if (
    averageSpeed &&
    Number.isFinite(planet.longitudeSpeed) &&
    planet.longitudeSpeed >= -RETROGRADE_SPEED_EPSILON &&
    Math.abs(planet.longitudeSpeed) >= averageSpeed * 0.85
  ) {
    return "Movimento Direto, Rápido";
  }

  return "Movimento Direto, Lento";
}

function getTraditionalPlanetNote(planet: Planet): string {
  if (OUTER_PLANET_TYPES.has(planet.type)) {
    return " (qualificador secundário; não rege signos nem participa das dignidades essenciais dos sete planetas tradicionais)";
  }

  if (NODE_TYPES.has(planet.type)) {
    return " (Na Astrologia Tradicional seu valor só importa enquanto conjunção ou oposição)";
  }

  return "";
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatEssentialDignities(
  condition: NatalAnalysis["essentialConditions"][number],
): string {
  if (condition.dignities.length === 0) return "nenhuma";
  return condition.dignities
    .map((dignity) => `${dignity.kind} ${signed(dignity.points)}`)
    .join(", ");
}

function formatEssentialDebilities(
  condition: NatalAnalysis["essentialConditions"][number],
): string {
  if (condition.debilities.length === 0) return "nenhuma";
  return condition.debilities
    .map((debility) => `${debility.kind} ${signed(debility.points)}`)
    .join(", ");
}

function formatRankingWinners(ranking: NatalAnalysis["lordOfGeniture"]): string {
  const winners = ranking.filter((item) => item.tied);
  return winners
    .map((item) => `${item.planet} (${signed(item.totalScore)})`)
    .join(" e ");
}

function translateAspect(aspect: string): string {
  const labels: Record<string, string> = {
    conjunction: "conjunção",
    sextile: "sextil",
    square: "quadratura",
    trine: "trígono",
    opposition: "oposição",
  };
  return labels[aspect] ?? aspect;
}

function formatDecimalOrb(orb: number): string {
  const degrees = Math.floor(orb);
  const minutes = Math.round((orb - degrees) * 60);
  if (minutes === 60) return `${degrees + 1}°00′`;
  return `${degrees}°${minutes.toString().padStart(2, "0")}′`;
}

function romanize(num: number): string {
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";

  for (const [symbol, value] of Object.entries(lookup)) {
    while (num >= value) {
      roman += symbol;
      num -= value;
    }
  }

  return roman;
}
