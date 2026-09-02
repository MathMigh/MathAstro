import { Solar } from "lunar-typescript";
import { BaziChart, ElementName } from "@/app/lib/bazi";
import {
  DetailBlock,
  blocksToReport,
  buildBaziAnnualBlocks,
  buildBaziCompatibilityBlocks,
  buildBaziNatalBlocks,
  buildQiMenBlocks,
  buildTongShuBlocks,
  buildZiWeiBlocks,
} from "@/app/lib/chineseTechniques";
import { QiMenProfile } from "@/app/lib/qimen";
import { ZiWeiProfile } from "@/app/lib/ziwei";

export interface TongShuReading {
  dayPillar: string;
  dayMaster: string;
  favorableActivities: string[];
  cautionActivities: string[];
  favorableHours: string[];
  note: string;
}

interface ReportSection {
  title: string;
  lines: string[];
}

const SUPPORT_ELEMENT: Record<ElementName, ElementName> = {
  Madeira: "Agua",
  Fogo: "Madeira",
  Terra: "Fogo",
  Metal: "Terra",
  Agua: "Metal",
};

const FAVORABLE_BY_ELEMENT: Record<ElementName, string[]> = {
  Madeira: ["estudar", "iniciar", "planejar", "conversar com franqueza"],
  Fogo: ["apresentar", "divulgar", "marcar encontros", "criar"],
  Terra: ["organizar contas", "assinar", "estruturar rotina", "negociar prazos"],
  Metal: ["editar", "refinar", "tomar decisoes", "encerrar pendencias"],
  Agua: ["pesquisar", "observar", "escrever", "mapear cenarios"],
};

const CAUTION_BY_ELEMENT: Record<ElementName, string[]> = {
  Madeira: ["bater de frente sem preparar o terreno", "prometer mais do que sustenta"],
  Fogo: ["agir no impulso", "forcar visibilidade sem base"],
  Terra: ["engessar o dia em excesso", "acumular preocupacao material"],
  Metal: ["criticar tudo ao redor", "cortar vinculos no calor do momento"],
  Agua: ["adiar por excesso de analise", "sumir sem alinhar expectativas"],
};

function _weakestElement(chart: BaziChart) {
  return [...chart.elementScores].sort((left, right) => left.score - right.score)[0];
}

function combinedLead(chartA: BaziChart, chartB: BaziChart) {
  const totals = new Map<ElementName, number>();

  [...chartA.elementScores, ...chartB.elementScores].forEach((item) => {
    totals.set(item.element, (totals.get(item.element) ?? 0) + item.score);
  });

  return [...totals.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Madeira";
}

function getVisiblePillars(chart: BaziChart) {
  return chart.pillars;
}

function getPillar(chart: BaziChart, key: "year" | "month" | "day" | "hour") {
  return chart.pillars.find((pillar) => pillar.key === key);
}

function _mentionElement(bucket: string, element: ElementName) {
  const normalized = bucket
    .split(/[|/,]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return normalized.includes(element.toLowerCase());
}

function buildBlockLookup(blocks: DetailBlock[]) {
  const byLabel = new Map<string, string>();
  const byTitle = new Map<string, DetailBlock>();

  blocks.forEach((block) => {
    byTitle.set(block.title, block);
    block.items.forEach((item) => byLabel.set(item.label, item.value));
  });

  return {
    value(label: string, fallback = "--") {
      return byLabel.get(label) ?? fallback;
    },
    bullets(title: string) {
      return byTitle.get(title)?.bullets ?? [];
    },
  };
}

function blockToSection(block: DetailBlock): ReportSection {
  return {
    title: block.title.toUpperCase(),
    lines: [
      ...block.items.map((item) => `${item.label}: ${item.value}`),
      ...(block.bullets?.length ? ["", ...block.bullets.map((bullet) => `- ${bullet}`)] : []),
    ],
  };
}

function blocksToSections(blocks: DetailBlock[]) {
  return blocks.map((block) => blockToSection(block));
}

function renderReport(
  title: string,
  meta: string[],
  sections: ReportSection[],
  appendix: string[] = []
) {
  const parts = [title, "", ...meta];

  if (sections.length) {
    parts.push("");
  }

  sections.forEach((section, index) => {
    parts.push(section.title, ...section.lines);

    if (index < sections.length - 1) {
      parts.push("");
    }
  });

  if (appendix.length) {
    parts.push("", ...appendix);
  }

  return parts.join("\n").trim();
}

function _describeBalanceSignal(chart: BaziChart, favorable: string, unfavorable: string) {
  const strongest = chart.elementScores[0];
  const second = chart.elementScores[1];
  const weakest = _weakestElement(chart);
  const strength = chart.analysis.strength;

  return `O grafico concentra ${strongest.element.toLowerCase()} em ${strongest.percent}% e deixa ${weakest.element.toLowerCase()} como a faixa menos espontanea. A base do Mestre soma ${strength.supportiveShare}% de apoio contra ${strength.hostileShare}% de drenagem e controle, com ${strength.directRoots.length} raiz(es) diretas no recorte visivel. Isso empurra ${strongest.role.toLowerCase()} para a linha de frente, enquanto ${weakest.role.toLowerCase()} precisa ser chamado conscientemente. O segundo apoio vem de ${second.element.toLowerCase()}, e a regulacao fica melhor quando ${favorable.toLowerCase()} entra sem dar palco excessivo a ${unfavorable.toLowerCase()}.`;
}

function _describeCompatibilitySignal(chartA: BaziChart, chartB: BaziChart, lead: ElementName) {
  const strongestA = chartA.elementScores[0];
  const strongestB = chartB.elementScores[0];
  const weakestA = _weakestElement(chartA);
  const weakestB = _weakestElement(chartB);

  return `Quando os dois graficos se somam, ${lead.toLowerCase()} assume o centro. ${chartA.input.name || "Pessoa A"} traz ${strongestA.element.toLowerCase()} para ${strongestA.role.toLowerCase()} com ${chartA.analysis.strength.supportiveShare}% de apoio interno, enquanto ${chartB.input.name || "Pessoa B"} puxa ${strongestB.element.toLowerCase()} para ${strongestB.role.toLowerCase()} com ${chartB.analysis.strength.supportiveShare}% de apoio interno. As fragilidades aparecem em ${weakestA.element.toLowerCase()} para A e ${weakestB.element.toLowerCase()} para B, entao a relacao melhora quando um nao exige do outro justamente o ponto menos nutrido do mapa parceiro.`;
}

function _describeTransitSignal(periodChart: BaziChart, natalFavorable: string, natalUnfavorable: string) {
  const transitLead = periodChart.elementScores[0];

  if (_mentionElement(natalFavorable, transitLead.element)) {
    return `O periodo abre com ${transitLead.element.toLowerCase()} dominante, e isso ajuda a regular o natal porque o transito bate num elemento favoravel ao Mestre do Dia. A fase tende a render melhor quando a pessoa transforma impulso em acao concreta, sem desperdiçar a janela em expectativa.`;
  }

  if (_mentionElement(natalUnfavorable, transitLead.element)) {
    return `O periodo destaca ${transitLead.element.toLowerCase()}, mas esse e um eixo sensivel para o mapa natal. A leitura pede mais consciencia de ritmo, menos reatividade e mais uso dos elementos que costumam proteger o Mestre do Dia.`;
  }

  return `O periodo prioriza ${transitLead.element.toLowerCase()} e ativa ${transitLead.role.toLowerCase()} no mapa natal. Nao e uma fase neutra: o ano mexe na area que mais quer se mover agora e pede calibragem entre iniciativa e sustentacao.`;
}

export function buildTongShuReading(dayChart: BaziChart): TongShuReading {
  const [year, month, day] = dayChart.adjusted.date.split("-").map(Number);
  const clock = dayChart.input.unknownTime ? "12:00" : dayChart.adjusted.time;
  const [hour, minute] = clock.split(":").map(Number);
  const lunar = Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0).getLunar();
  const hours = lunar
    .getTimes()
    .filter((time) => time.getTianShenLuck() === "\u5409")
    .map((time) => `${time.getMinHm()}-${time.getMaxHm()} ${time.getGanZhi()} ${time.getTianShen()}`);
  const support = SUPPORT_ELEMENT[dayChart.dayMaster.element];

  return {
    dayPillar: getPillar(dayChart, "day")?.ganZhi ?? "--",
    dayMaster: dayChart.dayMaster.label,
    favorableActivities: lunar.getDayYi().length
      ? lunar.getDayYi().slice(0, 8)
      : FAVORABLE_BY_ELEMENT[dayChart.dayMaster.element],
    cautionActivities: lunar.getDayJi().length
      ? lunar.getDayJi().slice(0, 8)
      : CAUTION_BY_ELEMENT[dayChart.dayMaster.element],
    favorableHours: hours,
    note: `Zhi Xing ${lunar.getZhiXing()}, Xiu ${lunar.getXiu()} (${lunar.getXiuLuck()}) e Yue Xiang ${lunar.getYueXiang()}. ${support.toLowerCase()} continua ajudando a nutrir ${dayChart.dayMaster.element.toLowerCase()}.`,
  };
}

export function generateBaziNatalReport(chart: BaziChart) {
  const blocks = buildBaziNatalBlocks(chart);
  const lookup = buildBlockLookup(blocks);
  const dayPillar = getPillar(chart, "day");
  const visiblePillars = getVisiblePillars(chart);

  return renderReport(
    "RELATORIO TECNICO BAZI NATAL",
    [
      `Nome: ${chart.input.name || "Sem nome"}`,
      `Local: ${chart.input.location}`,
      `Data ajustada: ${chart.adjusted.date} ${chart.adjusted.time}`,
      `Calendario lunar: ${chart.lunarText}`,
      `Hora solar verdadeira: ${lookup.value("Hora solar verdadeira")}`,
      `Mes de comando / Yue Ling: ${lookup.value("Mes de comando / Yue Ling")}`,
      `Escola / linha usada: ${lookup.value("Escola / linha usada")}`,
      `Estrutura selecionada: ${lookup.value("Estrutura selecionada")}`,
      `Sexo/genero tecnico: ${lookup.value("Sexo/genero tecnico do nativo")}`,
      `Biblioteca Shen Sha: ${lookup.value("Modo da biblioteca de estrelas")}`,
      `Mestre do Dia: ${chart.dayMaster.stem} ${chart.dayMaster.label} (${chart.dayMaster.tone})`,
      `Pilar do Dia: ${dayPillar?.ganZhi ?? "--"} ${dayPillar?.animal ?? ""}`,
      `Pilares visiveis: ${visiblePillars.map((pillar) => `${pillar.label} ${pillar.ganZhi}`).join(" | ")}`,
      "Escopo: relatorio tecnico-calculado do BaZi natal, com exposicao direta dos calculos e sem interpretacao automatica.",
    ],
    blocksToSections(blocks)
  );
}

export function generateBaziCompatibilityReport(chartA: BaziChart, chartB: BaziChart) {
  const blocks = buildBaziCompatibilityBlocks(chartA, chartB);
  const lookup = buildBlockLookup(blocks);

  return renderReport(
    "RELATORIO TECNICO DE COMPATIBILIDADE BAZI",
    [
      `Pessoa A: ${chartA.input.name || "A"} | ${chartA.dayMaster.label} (${chartA.dayMaster.tone})`,
      `Pessoa B: ${chartB.input.name || "B"} | ${chartB.dayMaster.label} (${chartB.dayMaster.tone})`,
      `Pilar do Dia A: ${getPillar(chartA, "day")?.ganZhi ?? "--"} ${getPillar(chartA, "day")?.animal ?? ""}`,
      `Pilar do Dia B: ${getPillar(chartB, "day")?.ganZhi ?? "--"} ${getPillar(chartB, "day")?.animal ?? ""}`,
      `Elemento dominante do encontro: ${combinedLead(chartA, chartB)}`,
      `Ajuste mutuo de Yong Shen: ${lookup.value("Ajuste mutuo de Yong Shen")}`,
      "Escopo: relatorio tecnico-calculado da compatibilidade BaZi, com exposicao direta das interacoes e sem interpretacao automatica do vinculo.",
    ],
    blocksToSections(blocks)
  );
}

export function generateBaziAnnualReport(natalChart: BaziChart, periodChart: BaziChart) {
  const blocks = buildBaziAnnualBlocks(natalChart.input, natalChart, periodChart);
  const lookup = buildBlockLookup(blocks);
  const yearPillar = getPillar(periodChart, "year");

  return renderReport(
    "RELATORIO TECNICO BAZI: CICLOS E PERIODO",
    [
      `Mapa base: ${natalChart.input.name || "Sem nome"}`,
      `Periodo analisado: ${periodChart.adjusted.date} ${periodChart.adjusted.time}`,
      `Pilar anual: ${yearPillar?.ganZhi ?? "--"} ${yearPillar?.animal ?? ""}`,
      `Escola / linha usada: ${lookup.value("Escola / linha usada")}`,
      `Mestre do Dia natal: ${natalChart.dayMaster.label} (${natalChart.dayMaster.tone})`,
      `Mestre do Dia do periodo: ${periodChart.dayMaster.label} (${periodChart.dayMaster.tone})`,
      `Sentido do Yun: ${lookup.value("Sentido do Yun")}`,
      `Entrada no primeiro Da Yun: ${lookup.value("Entrada no primeiro Da Yun")}`,
      `Estrutura selecionada do periodo: ${lookup.value("Estrutura selecionada do periodo")}`,
      `Biblioteca Shen Sha: ${lookup.value("Modo da biblioteca de estrelas")}`,
      `Yong Shen do periodo: ${lookup.value("Yong Shen do periodo")}`,
      `Saldo tecnico do periodo: ${lookup.value("Saldo tecnico do periodo")}`,
      "Escopo: relatorio tecnico-calculado de ciclos BaZi, com exposicao direta das camadas temporais e sem interpretacao automatica.",
    ],
    blocksToSections(blocks)
  );
}

export function generateZiWeiReport(profile: ZiWeiProfile, chart: BaziChart) {
  const blocks = buildZiWeiBlocks(chart, profile);
  const mingPalace = profile.palaceHighlights.find((palace) => palace.key === "MING");
  const spousePalace = profile.palaceHighlights.find((palace) => palace.key === "FU_QI");
  const wealthPalace = profile.palaceHighlights.find((palace) => palace.key === "CAI_BO");
  const careerPalace = profile.palaceHighlights.find((palace) => palace.key === "GUAN_LU");
  const primaryTrine = profile.trineHighlights[0];
  const relationPreview = profile.relationHighlights
    .slice(0, 4)
    .map(
      (relation) =>
        `${relation.title}: oposto ${relation.oppositePalace}; riqueza ${relation.wealthPalace}; carreira ${relation.careerPalace}; 飞化 ${relation.flyTargets.join("/") || "--"}`
    );
  const temporalPreview = profile.temporalRelationHighlights
    .filter((entry) => entry.scope === "decadal" || entry.scope === "yearly" || entry.scope === "monthly")
    .slice(0, 6)
    .map(
      (entry) =>
        `${entry.label} ${entry.palace} => ${entry.roleAtTarget}; oposto ${entry.oppositeRole}; riqueza ${entry.wealthRole}; carreira ${entry.careerRole}; 四化 ${entry.mutagen.join("/") || "--"}`
    );
  const starPreview = profile.starCatalog
    .slice(0, 10)
    .map(
      (entry) =>
        `${entry.name}[${entry.families.join("/") || "--"}] natal=${entry.natalPalaces.join("/") || "--"} timing=${entry.dynamicScopes.join("/") || "--"}`
    );
  const borrowPreview = profile.borrowedStarProfiles
    .slice(0, 6)
    .map(
      (entry) =>
        `${entry.palace}: 空宫=${entry.isEmpty ? "sim" : "nao"}; empresta de ${entry.borrowedFrom}; principais ${entry.borrowedMajorStars.join("/") || "--"}`
    );

  return renderReport(
    "RELATORIO ZI WEI DOU SHU",
    [
      `Perfil: ${chart.input.name || "Sem nome"}`,
      `Ming Gong: ${profile.mingPalaceName} | ${profile.mingGong}`,
      `Shen Gong: ${profile.shenPalaceName} | ${profile.shenGong}`,
      `Calendario lunar: ${profile.lunarDateLabel}`,
      `Cinco Elementos Bureau: ${profile.fiveElementBureau}`,
      `Motor: ${profile.coverage.engine}`,
      `Preset tecnico: ${profile.enginePreset.label} | algorithm=${profile.enginePreset.algorithm} | year=${profile.enginePreset.yearDivide} | horoscope=${profile.enginePreset.horoscopeDivide} | age=${profile.enginePreset.ageDivide} | day=${profile.enginePreset.dayDivide}`,
      `Catalogo auditado: >= ${profile.coverage.expectedFloor} estrelas | estimativa local ${profile.coverage.libraryEstimatedStarCount}`,
      `Relacoes auditadas: ${profile.relationHighlights.length} natais | ${profile.temporalRelationHighlights.length} temporais`,
    ],
    [
      {
        title: "EIXOS CENTRAIS",
        lines: [
          `Ming Gong / Shen Gong: ${profile.mingPalaceName} ${profile.mingGong} | ${profile.shenPalaceName} ${profile.shenGong}`,
          `Na Yin: ${profile.mingGongNaYin} | ${profile.shenGongNaYin}`,
          `Zi Wei: ${profile.ziweiStarBranch}`,
          `命主 / 身主: ${profile.soulStar} | ${profile.bodyStar}`,
          `Grande periodo corrente: ${profile.currentDecadePalace} | ${profile.currentDecadeRange}`,
        ],
      },
      {
        title: "PALACIOS-CHAVE",
        lines: [
          `Destino: ${mingPalace ? `${mingPalace.ganZhi} | ${mingPalace.branch} | ${mingPalace.majorStars.map((star) => star.name).join("/") || "--"}` : "--"}`,
          `Casamento: ${spousePalace ? `${spousePalace.ganZhi} | ${spousePalace.branch} | ${spousePalace.majorStars.map((star) => star.name).join("/") || "--"}` : "--"}`,
          `Riqueza: ${wealthPalace ? `${wealthPalace.ganZhi} | ${wealthPalace.branch} | ${wealthPalace.majorStars.map((star) => star.name).join("/") || "--"}` : "--"}`,
          `Carreira: ${careerPalace ? `${careerPalace.ganZhi} | ${careerPalace.branch} | ${careerPalace.majorStars.map((star) => star.name).join("/") || "--"}` : "--"}`,
        ],
      },
      {
        title: "TRIGONOS, OPOSICOES E TRANSFORMACOES",
        lines: [
          `Quatro transformacoes natais: ${profile.fourTransformations.join(", ") || "--"}.`,
          `Direcao dos grandes periodos: ${profile.horoscopeDirection}.`,
          `San Fang Si Zheng central: ${primaryTrine ? primaryTrine.members.join(" | ") : "--"}.`,
          `Relacoes de palacio: ${relationPreview.join(" | ") || "--"}.`,
          `Fluxo temporal corrente: ${profile.currentHoroscope.map((entry) => entry.label).join(" | ") || "--"}.`,
        ],
      },
      {
        title: "MATRIZ TEMPORAL DE RELACOES",
        lines: [
          `Camadas expostas: ${profile.horoscopeLayers.map((layer) => `${layer.label} ${layer.ganZhi}`).join(" | ")}.`,
          `Recorte relacional tecnico: ${temporalPreview.join(" | ") || "--"}.`,
          `Matriz palacio x camada: ${profile.temporalMatrix.length} linhas tecnicas.`,
        ],
      },
      {
        title: "KONG GONG E JIE XING",
        lines: [
          `Palacios com ficha de vazio/emprestimo: ${profile.borrowedStarProfiles.length}.`,
          `Amostra tecnica: ${borrowPreview.join(" | ") || "--"}.`,
        ],
      },
      {
        title: "CATALOGO ESTRELA POR ESTRELA",
        lines: [
          `Entradas observadas no catalogo: ${profile.starCatalog.length}.`,
          `Amostra do catalogo: ${starPreview.join(" | ") || "--"}.`,
        ],
      },
      {
        title: "COBERTURA TECNICA",
        lines: [
          `Estrelas unicas observadas no natal: ${profile.coverage.observedNatalUniqueStars}.`,
          `Estrelas unicas observadas no timing: ${profile.coverage.observedDynamicUniqueStars}.`,
          `Estrelas unicas combinadas: ${profile.coverage.observedCombinedUniqueStars}.`,
          `Camadas expostas: ${profile.horoscopeLayers.map((layer) => layer.label).join(" | ")}.`,
        ],
      },
    ],
    ["ANEXO TECNICO DETALHADO", "", blocksToReport(blocks)]
  );
}

export function generateQiMenReport(profile: QiMenProfile, chart: BaziChart) {
  const blocks = buildQiMenBlocks(profile);
  const palacePreview = profile.palaces
    .map(
      (palace) =>
        `${palace.label} ${palace.direction}: ${palace.men} / ${palace.xing} / ${palace.tianPanShen}`
    )
    .join(" | ");

  return renderReport(
    "RELATORIO TECNICO QI MEN DUN JIA",
    [
      `Caso: ${chart.input.name || "Sem rotulo"}`,
      `Local: ${chart.input.location}`,
      `Momento informado: ${profile.consultationMoment}`,
      `Momento ajustado: ${profile.adjustedMoment}`,
      `Calendario lunar: ${profile.lunarDateLabel}`,
      `Motor: ${profile.engine} ${profile.engineVersion}`,
      `Preset tecnico: ${profile.enginePreset.label}`,
      `Metodo efetivo: ${profile.qiJuMethodLabel}`,
      `Jie Qi atual: ${profile.jieQiWindow.currentJie}`,
      `Dun / Ju: ${profile.juLabel}`,
      `Zhi Fu: ${profile.zhiFu} | ${profile.zhiFuPalace}`,
      `Zhi Shi: ${profile.zhiShi} | ${profile.zhiShiPalace}`,
      `Xun Shou: ${profile.xunShou}`,
      `Direcoes mais fortes: ${profile.bestDirections.join(" | ") || "--"}`,
      "Escopo: relatorio tecnico-calculado do Qi Men Dun Jia, com exposicao direta do tabuleiro, das estruturas e dos marcadores do caso, sem interpretacao automatica.",
    ],
    [
      {
        title: "NUCLEO DO TABULEIRO",
        lines: [
          `Pilares do momento: ${profile.sexagenary.year} | ${profile.sexagenary.month} | ${profile.sexagenary.day} | ${profile.sexagenary.hour}.`,
          `Correcao solar aplicada: ${profile.solarCorrectionLabel}.`,
          `Jie/Qi: ${profile.jieQiWindow.previousJie} -> ${profile.jieQiWindow.currentJie} -> ${profile.jieQiWindow.nextJie}; Qi ${profile.jieQiWindow.previousQi} -> ${profile.jieQiWindow.nextQi}.`,
          `Portadores de Xun Shou / Jia oculto: ${profile.xunShouCarriers.join(" | ") || "--"}.`,
        ],
      },
      {
        title: "ESCOPO TEMPORAL DO MOTOR",
        lines: [
          `Suporte anual: ${profile.temporalScopeSupport.yearly}.`,
          `Suporte mensal: ${profile.temporalScopeSupport.monthly}.`,
          `Suporte diario: ${profile.temporalScopeSupport.daily}.`,
          `Suporte horario: ${profile.temporalScopeSupport.hourly}.`,
        ],
      },
      {
        title: "PORTAS, ESTRELAS E DEIDADES",
        lines: [
          `Portas canonicamente abertas: ${profile.canonicalDoorHighlights.open.join(" | ") || "--"}.`,
          `Portas de cautela: ${profile.canonicalDoorHighlights.caution.join(" | ") || "--"}.`,
          `Deidades de apoio: ${profile.canonicalDeityHighlights.supportive.join(" | ") || "--"}.`,
          `Deidades de cautela: ${profile.canonicalDeityHighlights.caution.join(" | ") || "--"}.`,
          `Resumo dos nove palacios: ${palacePreview}.`,
        ],
      },
      {
        title: "SAN QI, LIU YI E MARCADORES",
        lines: [
          `San Qi no ceu: ${profile.sanQiOnSky.join(" | ") || "--"}.`,
          `San Qi na terra: ${profile.sanQiOnEarth.join(" | ") || "--"}.`,
          `Liu Yi no ceu: ${profile.liuYiOnSky.join(" | ") || "--"}.`,
          `Liu Yi na terra: ${profile.liuYiOnEarth.join(" | ") || "--"}.`,
          `Ma Xing: ${profile.maXingPalaces.join(" | ") || "--"} | Kong Wang: ${profile.gongKongPalaces.join(" | ") || "--"} | Yi Kong: ${profile.yiKongPalaces.join(" | ") || "--"}.`,
        ],
      },
      {
        title: "MARCADORES TECNICOS DO CASO",
        lines: [
          `${profile.caseMarkers.subject.label}: ${profile.caseMarkers.subject.stem} | ${profile.caseMarkers.subject.carriers.join(" | ") || "--"}.`,
          `${profile.caseMarkers.object.label}: ${profile.caseMarkers.object.stem} | ${profile.caseMarkers.object.carriers.join(" | ") || "--"}.`,
          `${profile.caseMarkers.yearAnchor.label}: ${profile.caseMarkers.yearAnchor.stem} | ${profile.caseMarkers.yearAnchor.carriers.join(" | ") || "--"}.`,
          `${profile.caseMarkers.monthAnchor.label}: ${profile.caseMarkers.monthAnchor.stem} | ${profile.caseMarkers.monthAnchor.carriers.join(" | ") || "--"}.`,
          `Regra tecnica de Yong Shen: ${profile.caseMarkers.yongShenRule}.`,
        ],
      },
      {
        title: "MATRIZ TECNICA DO CASO",
        lines: [
          ...profile.caseAxisSummary,
          `Matriz palacio x marcador: ${profile.caseRelationMatrix
            .map(
              (row) =>
                `${row.palace} ${row.direction} => tags ${row.tags.join("/") || "--"}; score ${row.score}; notas ${row.notes.join(" | ") || "--"}`
            )
            .join(" || ") || "--"}.`,
        ],
      },
      {
        title: "PADROES CANONICOS AUDITADOS",
        lines: profile.patternAudits.map((audit) => {
          const detailText = audit.details.length ? ` | detalhes ${audit.details.join(" | ")}` : "";
          return `${audit.name}: ${audit.status}; palacios ${audit.palaces.join(" | ") || "--"}; criterio ${audit.criterion}${detailText}.`;
        }),
      },
      {
        title: "DIRECOES E ELEICAO TECNICA",
        lines: [
          `Direcoes mais fortes: ${profile.bestDirections.join(" | ") || "--"}.`,
          `Direcoes de cautela: ${profile.cautionDirections.join(" | ") || "--"}.`,
          `Ranking completo: ${profile.directionRatings
            .map(
              (rating) =>
                `${rating.palace} ${rating.direction} ${rating.grade} score ${rating.score} (${rating.reasons.join(", ") || "sem reforco especial"})`
            )
            .join(" | ") || "--"}.`,
        ],
      },
      {
        title: "APLICACOES CANONICAS DO QUADRO",
        lines: profile.applicationCues.map(
          (cue) =>
            `${cue.label}: regra ${cue.rule}; melhores palacios ${cue.bestPalaces.join(" | ") || "--"}; palacios de cautela ${
              cue.cautionPalaces.join(" | ") || "--"
            }.`
        ),
      },
      {
        title: "ESTRUTURAS E SHEN SHA",
        lines: [
          `Estruturas observadas: ${profile.structureNames.join(" | ") || "--"}.`,
          `Shen Sha observados: ${profile.shenShaNames.join(" | ") || "--"}.`,
          `Linhas tecnicas de estrutura: ${profile.structureHighlights.length}.`,
          `Linhas tecnicas de Shen Sha: ${profile.shenShaHighlights.length}.`,
          `Huan Ju exposto pela biblioteca: ${profile.huanJuActivePalaces} palacios ativos.`,
        ],
      },
    ],
    ["ANEXO TECNICO DETALHADO", "", blocksToReport(blocks)]
  );
}

export function generateTongShuReport(reading: TongShuReading, dayChart: BaziChart) {
  const blocks = buildTongShuBlocks(dayChart);

  return renderReport(
    "RELATORIO TONG SHU DO DIA",
    [
      `Data: ${dayChart.adjusted.date}`,
      `Pilar do dia: ${reading.dayPillar}`,
      `Mestre do dia: ${reading.dayMaster}`,
    ],
    [
      {
        title: "PULSO DO DIA",
        lines: [reading.note],
      },
      {
        title: "ATIVIDADES FAVORAVEIS",
        lines: reading.favorableActivities.map((item) => `- ${item}`),
      },
      {
        title: "HORAS FAVORAVEIS",
        lines: reading.favorableHours.length
          ? reading.favorableHours.map((item) => `- ${item}`)
          : ["- Sem hora especialmente destacada neste recorte."],
      },
      {
        title: "CAUTELAS",
        lines: reading.cautionActivities.map((item) => `- ${item}`),
      },
    ],
    ["ANEXO TECNICO DETALHADO", "", blocksToReport(blocks)]
  );
}
