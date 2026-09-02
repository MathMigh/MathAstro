import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { JyotishContext } from "./types";
import {
  createDatum,
  createSection,
  createTable,
  createValidation,
  signDistance,
} from "./engineHelpers";
import type { EngineResult, JyotishModuleKey } from "./types";
import { calculateArudhaForHouse } from "./arudhaUtils";

const HOUSE_NAMES = [
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

const BENEFIC_KEYS = new Set(["moon", "mercury", "jupiter", "venus"]);
const MALEFIC_KEYS = new Set(["sun", "mars", "saturn", "northNode", "southNode"]);
const BENEFIC_NAMES = new Set(["Chandra", "Budha", "Guru", "Shukra"]);
const SPEED_MAXIMA: Partial<Record<VedicPoint["key"], number>> = {
  sun: 1.02,
  moon: 15.4,
  mars: 0.8,
  mercury: 2.2,
  jupiter: 0.24,
  venus: 1.26,
  saturn: 0.14,
};

const PRASHNA_THEME_RULES = [
  {
    house: 7,
    label: "Relacionamentos e casamento",
    karakas: ["Shukra", "Guru"],
    keywords: ["casamento", "relacionamento", "namoro", "parceiro", "parceira", "marido", "esposa", "love", "relationship"],
  },
  {
    house: 10,
    label: "Carreira e status",
    karakas: ["Surya", "Budha", "Shani"],
    keywords: ["carreira", "trabalho", "emprego", "profissao", "cargo", "status", "negocio", "business", "job"],
  },
  {
    house: 2,
    label: "Dinheiro e recursos",
    karakas: ["Guru", "Shukra"],
    keywords: ["dinheiro", "financas", "financeiro", "renda", "salario", "recursos", "wealth", "money"],
  },
  {
    house: 5,
    label: "Filhos, romance e criatividade",
    karakas: ["Guru", "Shukra"],
    keywords: ["filho", "filha", "gravidez", "crianca", "romance", "criatividade", "children", "pregnancy"],
  },
  {
    house: 6,
    label: "Doenca, divida e disputa",
    karakas: ["Mangala", "Shani"],
    keywords: ["doenca", "saude", "divida", "dividas", "processo", "disputa", "inimigo", "illness", "debt", "lawsuit"],
  },
  {
    house: 4,
    label: "Casa, familia e imoveis",
    karakas: ["Chandra", "Mangala"],
    keywords: ["casa", "familia", "mae", "imovel", "apartamento", "terreno", "property", "home"],
  },
  {
    house: 9,
    label: "Viagem longa, fe e estudo superior",
    karakas: ["Guru", "Surya"],
    keywords: ["viagem", "exterior", "faculdade", "universidade", "mestres", "religiao", "faith", "travel"],
  },
  {
    house: 8,
    label: "Crise, heranca e oculto",
    karakas: ["Shani", "Ketu"],
    keywords: ["heranca", "segredo", "morte", "cirurgia", "oculto", "inheritance", "surgery"],
  },
  {
    house: 3,
    label: "Mensagens, irmaos e deslocamentos curtos",
    karakas: ["Budha", "Mangala"],
    keywords: ["irmao", "irma", "mensagem", "documento", "viagem curta", "sibling", "message"],
  },
  {
    house: 11,
    label: "Ganhos e redes",
    karakas: ["Guru", "Rahu"],
    keywords: ["ganho", "lucro", "amigos", "grupo", "network", "profit"],
  },
  {
    house: 12,
    label: "Perdas, isolamento e exterior",
    karakas: ["Shani", "Ketu"],
    keywords: ["perda", "prisao", "isolamento", "hospital", "exterior", "foreign", "loss"],
  },
] as const;

interface PrashnaThemeCandidate {
  house: number;
  label: string;
  karakas: string[];
  matchedKeywords: string[];
  score: number;
  note: string;
}

interface PrashnaThemeResolution {
  normalizedQuestion: string;
  primary: PrashnaThemeCandidate;
  candidates: PrashnaThemeCandidate[];
  ambiguityBand: string;
  ambiguityNote: string;
}

function normalizeQuestionText(input?: string) {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function buildGeneralPrashnaTheme(note: string): PrashnaThemeCandidate {
  return {
    house: 1,
    label: "Consulta geral",
    karakas: ["Lagna", "Chandra"],
    matchedKeywords: [],
    score: 0,
    note,
  };
}

function detectPrashnaThemes(question?: string): PrashnaThemeResolution {
  const normalized = normalizeQuestionText(question);

  if (!normalized) {
    const primary = buildGeneralPrashnaTheme(
      "Sem texto de pergunta; o motor ancora a triagem na 1a casa e na Lua do momento."
    );

    return {
      normalizedQuestion: normalized,
      primary,
      candidates: [primary],
      ambiguityBand: "Triagem ausente",
      ambiguityNote: "Sem pergunta textual, o modulo conserva apenas a ancora geral do Lagna e da Lua.",
    };
  }

  const candidates = PRASHNA_THEME_RULES.map((rule) => {
    const matches = Array.from(new Set(rule.keywords.filter((keyword) => normalized.includes(keyword))));

    return {
      house: rule.house,
      label: rule.label,
      karakas: [...rule.karakas],
      matchedKeywords: matches,
      score: matches.length,
      note: matches.length
        ? `Tema inferido por palavras-chave: ${matches.join(", ")}.`
        : "Sem match ativo desta familia na pergunta atual.",
    } satisfies PrashnaThemeCandidate;
  })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.house - right.house);

  if (!candidates.length) {
    const primary = buildGeneralPrashnaTheme(
      "Pergunta sem match forte de palavras-chave; o motor preserva a leitura geral do Lagna."
    );

    return {
      normalizedQuestion: normalized,
      primary,
      candidates: [primary],
      ambiguityBand: "Sem match tematico",
      ambiguityNote:
        "A pergunta nao fechou casa-tema clara por palavras-chave; a leitura fica aberta para o astrologo enquadrar manualmente o assunto.",
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
        : "Tema dominante";
  const ambiguityNote =
    ambiguityBand === "Tema dominante"
      ? `A casa ${primary.house} lidera a triagem textual sem concorrencia forte.`
      : `${closeAlternates
          .map((candidate) => `H${candidate.house} ${candidate.label}`)
          .join(" | ")} ainda concorrem com o tema principal na malha textual.`;

  return {
    normalizedQuestion: normalized,
    primary,
    candidates,
    ambiguityBand,
    ambiguityNote,
  };
}

function findSignOccupants(snapshot: VedicSnapshot, signIndex: number) {
  return snapshot.planets.filter((point) => point.signIndex === signIndex).map((point) => point.name);
}

function buildPrashnaArgalaRows(snapshot: VedicSnapshot, label: string, signIndex: number) {
  const primary = [
    { offset: 1, label: "2a", blockerOffset: 11, blockerLabel: "12a" },
    { offset: 3, label: "4a", blockerOffset: 9, blockerLabel: "10a" },
    { offset: 10, label: "11a", blockerOffset: 2, blockerLabel: "3a" },
  ];
  const secondary = { offset: 4, label: "5a", blockerOffset: 8, blockerLabel: "9a" };

  const rows = primary.map((rule) => {
    const sourceSign = modulo(signIndex + rule.offset, 12);
    const blockerSign = modulo(signIndex + rule.blockerOffset, 12);
    const source = findSignOccupants(snapshot, sourceSign);
    const blocker = findSignOccupants(snapshot, blockerSign);

    return [
      label,
      rule.label,
      source.length ? source.join(", ") : "--",
      rule.blockerLabel,
      blocker.length ? blocker.join(", ") : "--",
      source.length > blocker.length
        ? "Argala ativa"
        : source.length === blocker.length && source.length > 0
          ? "Argala equilibrada"
          : "Sem dominancia",
    ];
  });

  const secondarySourceSign = modulo(signIndex + secondary.offset, 12);
  const secondaryBlockerSign = modulo(signIndex + secondary.blockerOffset, 12);
  rows.push([
    label,
    secondary.label,
    findSignOccupants(snapshot, secondarySourceSign).join(", ") || "--",
    secondary.blockerLabel,
    findSignOccupants(snapshot, secondaryBlockerSign).join(", ") || "--",
    "Argala secundario",
  ]);

  return rows;
}

function buildArgalaBand(rows: string[][]) {
  const activeCount = rows.filter((row) => row[5] === "Argala ativa").length;
  const balancedCount = rows.filter((row) => row[5] === "Argala equilibrada").length;

  if (activeCount >= 3) {
    return {
      label: "Pressao argalica forte",
      note: `${activeCount} faixa(s) com Argala ativa na malha do quesito.`,
    };
  }

  if (activeCount >= 1 || balancedCount >= 2) {
    return {
      label: "Pressao argalica mista",
      note: `${activeCount} ativa(s) e ${balancedCount} equilibrada(s) no recorte usado.`,
    };
  }

  return {
    label: "Pressao argalica discreta",
    note: "A malha do quesito nao exibiu predominancia forte de Argala nas posicoes classicas.",
  };
}

function buildMotionProfile(point: VedicPoint) {
  const maximum = SPEED_MAXIMA[point.key];
  const speed = Math.abs(point.longitudeSpeed ?? 0);
  const normalized = maximum ? Math.min(speed / maximum, 1) : undefined;

  if (!maximum || normalized === undefined) {
    return {
      label: point.retrograde ? "Movimento retrogrado" : "Movimento simples",
      speed,
      normalized,
      note:
        "Sem calibracao de velocidade fina para este ponto; o modulo preserva apenas o movimento bruto do snapshot.",
    };
  }

  if (!["sun", "moon"].includes(point.key) && point.retrograde) {
    return {
      label: normalized >= 0.5 ? "Retrogrado forte" : "Retrogrado de revisao",
      speed,
      normalized,
      note: "A retrogradacao do regente do quesito costuma pedir revisao, retorno ou atraso antes de fechamento limpo.",
    };
  }

  if (normalized <= 0.08) {
    return {
      label: "Quase estacionario",
      speed,
      normalized,
      note: "Velocidade muito baixa no snapshot; o quesito pode estar perto de travar, pausar ou mudar de marcha.",
    };
  }

  if (normalized >= 0.75) {
    return {
      label: "Cadencia rapida",
      speed,
      normalized,
      note: "Velocidade relativamente alta para o graha; o recorte sugere maior mobilidade do quesito.",
    };
  }

  if (normalized >= 0.35) {
    return {
      label: "Cadencia regular",
      speed,
      normalized,
      note: "O graha se move em faixa intermediaria, sem aceleracao ou travamento extremos.",
    };
  }

  return {
    label: "Cadencia lenta",
    speed,
    normalized,
    note: "Velocidade modesta do graha; o assunto tende a pedir mais tempo ou repeticao de etapas.",
  };
}

function buildContactState(
  left: VedicPoint,
  right: VedicPoint,
  aspects: JyotishContext["transit"]["aspects"]
) {
  const direct = aspects.filter((aspect) => aspect.source === left.name && aspect.target === right.name);
  const reverse = aspects.filter((aspect) => aspect.source === right.name && aspect.target === left.name);
  const signRelation = signDistance(left.signIndex, right.signIndex) + 1;
  const sameSign = left.signIndex === right.signIndex;
  const sameHouse = left.house === right.house;

  if (sameSign && sameHouse) {
    return {
      label: "Mesma casa/signo",
      note: `${left.name} e ${right.name} compartilham o mesmo campo de manifestacao no D1 horario.`,
      signRelation,
    };
  }

  if (direct.length && reverse.length) {
    return {
      label: "Aspecto mutuo",
      note: `${direct[0]?.kind ?? "Aspecto"} de ida e volta entre os dois pontos no snapshot.`,
      signRelation,
    };
  }

  if (direct.length || reverse.length) {
    const aspect = direct[0] ?? reverse[0];
    return {
      label: "Aspecto unilateral",
      note: `${aspect?.source} toca ${aspect?.target} por ${aspect?.kind ?? "aspecto"} no recorte atual.`,
      signRelation,
    };
  }

  if ([1, 4, 7, 10].includes(signRelation)) {
    return {
      label: "Contato angular",
      note: `A relacao em ${signRelation}a ancora os pontos por eixo/angularidade, mesmo sem aspecto explicito listado.`,
      signRelation,
    };
  }

  if ([5, 9].includes(signRelation)) {
    return {
      label: "Contato de trikona",
      note: `A relacao em ${signRelation}a preserva afinidade de trikona entre os pontos do quesito.`,
      signRelation,
    };
  }

  if ([2, 3, 11].includes(signRelation)) {
    return {
      label: "Apoio lateral",
      note: `A relacao em ${signRelation}a entrega proximidade util, mas nao fecha eixo principal sozinha.`,
      signRelation,
    };
  }

  return {
    label: "Sem contato direto",
    note: `Os pontos ficam em ${signRelation}a relacao, sem aspecto operacional listado neste snapshot.`,
    signRelation,
  };
}

function summarizeConditionTags(tags: string[]) {
  return [
    tags.includes("Exaltado") ? "Exaltado" : undefined,
    tags.includes("Domicilio") ? "Domicilio" : undefined,
    tags.includes("Moolatrikona") ? "Moolatrikona" : undefined,
    tags.includes("Amigavel") ? "Amigavel" : undefined,
    tags.includes("Debilitado") ? "Debilitado" : undefined,
    tags.includes("Combusto") ? "Combusto" : undefined,
    tags.includes("Retrogrado") ? "Retrogrado" : undefined,
  ].filter(Boolean);
}

function houseSupportBand(house: number) {
  if ([1, 4, 5, 7, 9, 10, 11].includes(house)) {
    return { score: 2, label: "Casa favoravel" };
  }

  if ([2, 3].includes(house)) {
    return { score: 1, label: "Casa neutra-util" };
  }

  return { score: -1, label: "Casa tensionada" };
}

function moonThemeSupportBand(distance: number) {
  if ([1, 4, 5, 7, 9, 10, 11].includes(distance)) {
    return {
      label: "Ligacao direta",
      score: 1,
      note: "A Lua toca a casa-tema por angulo ou trikona no recorte horario.",
    };
  }

  if ([2, 3].includes(distance)) {
    return {
      label: "Apoio lateral",
      score: 0,
      note: "A Lua nao fecha eixo principal, mas ainda orbita o tema de forma lateral.",
    };
  }

  return {
    label: "Distancia lunar",
    score: -1,
    note: "A Lua do momento fica distante do signo-tema, reduzindo aderencia imediata.",
  };
}

function strongestWitnessBand(score?: number) {
  if ((score ?? Number.NEGATIVE_INFINITY) >= 5) {
    return {
      label: "Witness forte",
      score: 2,
      note: "A testemunha principal segura bem o tema por dignidade, casa e relacao com o signo perguntado.",
    };
  }

  if ((score ?? Number.NEGATIVE_INFINITY) >= 3) {
    return {
      label: "Witness util",
      score: 1,
      note: "Ha uma testemunha principal funcional, embora sem dominancia absoluta.",
    };
  }

  return {
    label: "Witness fraco",
    score: -1,
    note: "A melhor testemunha ainda sai curta para sustentar leitura limpa sozinha.",
  };
}

function buildPrashnaOutcome(
  rows: Array<{
    criterion: string;
    state: string;
    score: number;
    note: string;
  }>
) {
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const positiveCount = rows.filter((row) => row.score > 0).length;
  const state =
    totalScore >= 6
      ? "Resposta favorecida"
      : totalScore >= 3
        ? "Resposta viavel"
        : totalScore >= 0
          ? "Resposta mista"
          : "Resposta resistida";

  return {
    totalScore,
    positiveCount,
    state,
    note:
      `${positiveCount} filtro(s) positivos em ${rows.length}. ` +
      `Score operacional ${totalScore} a partir de radicalidade, eixo-tema, testemunha, karakas, Lua e Arudha.`,
  };
}

export function prashnaEngine(
  module: JyotishModuleKey,
  context: JyotishContext
): EngineResult {
  const moon = context.transit.planets.find((point) => point.key === "moon") ?? context.transit.ascendant;
  const lagna = context.transit.ascendant;
  const lagnaLordKeyBySign = [
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
  const lagnaLord =
    context.transit.planets.find((point) => point.key === lagnaLordKeyBySign[lagna.signIndex]) ?? lagna;
  const moonFromLagna = signDistance(lagna.signIndex, moon.signIndex) + 1;
  const lagnaEarly = lagna.degreeInSign < 3;
  const lagnaLate = lagna.degreeInSign > 27;
  const moonSandhi = moon.degreeInSign < 1 || moon.degreeInSign > 29;
  const lagnaLordCombust = lagnaLord.tags.includes("Combusto");
  const lagnaLordRetro = lagnaLord.tags.includes("Retrogrado");
  const radicalityScore = [
    !(lagnaEarly || lagnaLate),
    !moonSandhi,
    [1, 4, 7, 10, 5, 9].includes(moonFromLagna),
    !lagnaLordCombust,
    Boolean(context.question),
  ].filter(Boolean).length;
  const radicalityBand =
    radicalityScore >= 4 ? "Suporte tecnico forte" : radicalityScore >= 3 ? "Suporte tecnico medio" : "Suporte tecnico fragil";
  const themeResolution = detectPrashnaThemes(context.question);
  const theme = themeResolution.primary;
  const questionSignIndex = (lagna.signIndex + theme.house - 1) % 12;
  const questionSignName = HOUSE_NAMES[questionSignIndex];
  const questionHouseLord =
    context.transit.planets.find((point) => point.key === lagnaLordKeyBySign[questionSignIndex]) ?? lagna;
  const questionOccupants = context.transit.planets.filter((point) => point.house === theme.house);
  const beneficOccupants = questionOccupants.filter((point) => BENEFIC_KEYS.has(point.key));
  const maleficOccupants = questionOccupants.filter((point) => MALEFIC_KEYS.has(point.key));
  const lordAspects = context.transit.aspects.filter((aspect) => aspect.target === questionHouseLord.name);
  const questionArudha = calculateArudhaForHouse(context.transit, theme.house);
  const questionArudhaLord = questionArudha
    ? context.transit.planets.find((point) => point.key === lagnaLordKeyBySign[questionArudha.signIndex])
    : undefined;
  const moonToQuestionHouse = signDistance(moon.signIndex, questionSignIndex) + 1;
  const lordCondition = [
    questionHouseLord.tags.includes("Exaltado") ? "Exaltado" : undefined,
    questionHouseLord.tags.includes("Domicilio") ? "Domicilio" : undefined,
    questionHouseLord.tags.includes("Debilitado") ? "Debilitado" : undefined,
    questionHouseLord.tags.includes("Combusto") ? "Combusto" : undefined,
    questionHouseLord.tags.includes("Retrogrado") ? "Retrogrado" : undefined,
  ].filter(Boolean);
  const supportScore = [
    beneficOccupants.length > 0,
    !questionHouseLord.tags.includes("Combusto"),
    !questionHouseLord.tags.includes("Debilitado"),
    lordAspects.some((aspect) => BENEFIC_NAMES.has(aspect.source)),
    [1, 4, 5, 7, 9, 10, 11].includes(questionHouseLord.house),
  ].filter(Boolean).length;
  const supportBand = supportScore >= 4 ? "Suporte alto" : supportScore >= 2 ? "Suporte medio" : "Suporte baixo";
  const karakaPoints = theme.karakas
    .map((name) => context.transit.planets.find((point) => point.name === name))
    .filter(Boolean);
  const questionLordMotion = buildMotionProfile(questionHouseLord);
  const witnessRows = [
    { label: "Regente do Lagna", point: lagnaLord, emphasis: "base" as const },
    { label: "Lua", point: moon, emphasis: "lunar" as const },
    { label: "Regente da pergunta", point: questionHouseLord, emphasis: "theme" as const },
    ...karakaPoints.map((point) => ({
      label: `Karaka ${point!.name}`,
      point: point!,
      emphasis: "karaka" as const,
    })),
  ].map((entry) => {
    const point = entry.point;
    const conditionTags = summarizeConditionTags(point.tags);
    const relationToTheme = signDistance(point.signIndex, questionSignIndex) + 1;
    const houseBand = houseSupportBand(point.house);
    const relationBand = [1, 4, 5, 7, 9, 10, 11].includes(relationToTheme)
      ? { score: 2, label: "Liga o tema" }
      : [2, 3].includes(relationToTheme)
        ? { score: 1, label: "Apoio lateral" }
        : { score: -1, label: "Distancia do tema" };
    const conditionScore =
      (conditionTags.includes("Exaltado") ? 2 : 0) +
      (conditionTags.includes("Domicilio") || conditionTags.includes("Moolatrikona") ? 2 : 0) +
      (conditionTags.includes("Amigavel") ? 1 : 0) +
      (conditionTags.includes("Debilitado") ? -2 : 0) +
      (conditionTags.includes("Combusto") ? -1 : 0) +
      (conditionTags.includes("Retrogrado") ? -0.5 : 0);
    const emphasisScore =
      entry.emphasis === "theme" ? 2 : entry.emphasis === "base" || entry.emphasis === "lunar" ? 1.5 : 1;
    const score = Number((conditionScore + houseBand.score + relationBand.score + emphasisScore).toFixed(2));

    return {
      label: entry.label,
      point,
      conditionTags,
      relationToTheme,
      houseBand,
      relationBand,
      score,
      note:
        `${point.name} em ${point.signName}, H${point.house}. ${conditionTags.length ? conditionTags.join(", ") : "Sem marca forte de dignidade."} ` +
        `${houseBand.label}; relacao ${relationToTheme}a com o signo da pergunta.`,
    };
  });
  const strongestWitness =
    [...witnessRows].sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))[0] ??
    witnessRows[0];
  const karakaSupportScore = witnessRows
    .filter((row) => row.label.startsWith("Karaka "))
    .reduce((sum, row) => sum + Math.max(0, row.score), 0);
  const karakaSupportBand =
    karakaSupportScore >= 6 ? "Karakas fortes" : karakaSupportScore >= 3 ? "Karakas medianos" : "Karakas fragilizados";
  const anchorMap = new Map<string, { label: string; point: VedicPoint }>();
  const registerAnchor = (label: string, point?: VedicPoint) => {
    if (!point) {
      return;
    }

    const existing = anchorMap.get(point.key);
    if (existing) {
      const labels = new Set(existing.label.split(" / ").concat(label));
      existing.label = Array.from(labels).join(" / ");
      return;
    }

    anchorMap.set(point.key, { label, point });
  };

  registerAnchor("Regente do Lagna", lagnaLord);
  registerAnchor("Lua", moon);
  registerAnchor("Regente do tema", questionHouseLord);
  registerAnchor("Regente do Pada", questionArudhaLord);
  karakaPoints.forEach((point) => registerAnchor(`Karaka ${point!.name}`, point!));

  const structuralAnchorRows = [...anchorMap.values()].map((entry) => {
    const relationToTheme = signDistance(entry.point.signIndex, questionSignIndex) + 1;
    const motion = buildMotionProfile(entry.point);
    const incomingAspects = context.transit.aspects.filter((aspect) => aspect.target === entry.point.name);
    const outgoingAspects = context.transit.aspects.filter((aspect) => aspect.source === entry.point.name);

    return {
      ...entry,
      relationToTheme,
      motion,
      incomingAspects,
      outgoingAspects,
    };
  });

  const contactRows = structuralAnchorRows.flatMap((left, leftIndex) =>
    structuralAnchorRows.slice(leftIndex + 1).map((right) => {
      const contact = buildContactState(left.point, right.point, context.transit.aspects);

      return {
        left,
        right,
        contact,
      };
    })
  );

  const argalaTargets = [
    { label: "Lagna", signIndex: lagna.signIndex },
    { label: "Lua", signIndex: moon.signIndex },
    { label: "Casa-tema", signIndex: questionSignIndex },
    ...(questionArudha ? [{ label: "Pada da pergunta", signIndex: questionArudha.signIndex }] : []),
  ];
  const argalaRows = argalaTargets.flatMap((target) =>
    buildPrashnaArgalaRows(context.transit, target.label, target.signIndex)
  );
  const themeArgalaRows = argalaRows.filter((row) => ["Casa-tema", "Pada da pergunta"].includes(row[0]));
  const argalaBand = buildArgalaBand(themeArgalaRows.length ? themeArgalaRows : argalaRows);
  const ruleRows = [
    {
      family: "Prashna Marga v1",
      rule: "Lagna nao-sandhi",
      state: lagnaEarly ? "Muito cedo" : lagnaLate ? "Muito tarde" : "Atendido",
      note: `${lagna.degreeInSign.toFixed(2)} graus no ascendente do momento.`,
    },
    {
      family: "Prashna Marga v1",
      rule: "Lua fora de sandhi",
      state: moonSandhi ? "Falhou" : "Atendido",
      note: `${moon.signName} ${moon.degreeInSign.toFixed(2)} graus no nakshatra ${moon.nakshatra}.`,
    },
    {
      family: "Tripe Lagna-Lua-Regente",
      rule: "Testemunha principal",
      state: strongestWitness?.label ?? "--",
      note: strongestWitness?.note ?? "Sem testemunha forte isolada.",
    },
    {
      family: "Tema e regencia",
      rule: "Regente da pergunta",
      state: `${questionHouseLord.name} | ${supportBand}`,
      note: `Casa-tema H${theme.house}, regente em H${questionHouseLord.house}, relacao lunar ${moonToQuestionHouse}a.`,
    },
    {
      family: "Karakas do tema",
      rule: "Forca dos karakas",
      state: karakaSupportBand,
      note: theme.karakas.length
        ? `${theme.karakas.join(", ")} com score agregado ${karakaSupportScore.toFixed(2)}.`
        : "Tema sem karakas operacionais declarados neste working set.",
    },
    {
      family: "Arudha de apoio",
      rule: "Pada da pergunta",
      state: questionArudha?.signName ?? "--",
      note: questionArudha?.note ?? "Sem pada calculado para a casa-tema nesta rodada.",
    },
  ];
  const ruleSupportCount = ruleRows.filter((row) => ["Atendido", "Karakas fortes"].includes(row.state) || row.state.includes("Suporte alto")).length;
  const schoolBand =
    ruleSupportCount >= 3 || (strongestWitness?.score ?? 0) >= 5
      ? "Leitura escolar consistente"
      : ruleSupportCount >= 2 || (strongestWitness?.score ?? 0) >= 3
        ? "Leitura escolar parcial"
        : "Leitura escolar fragil";
  const moonThemeBand = moonThemeSupportBand(moonToQuestionHouse);
  const witnessBand = strongestWitnessBand(strongestWitness?.score);
  const prashnaScoreRows = [
    {
      criterion: "Radicalidade",
      state:
        radicalityScore >= 4
          ? "Forte"
          : radicalityScore >= 3
            ? "Media"
            : "Fragil",
      score: radicalityScore >= 4 ? 2 : radicalityScore >= 3 ? 1 : -1,
      note: `Score bruto ${radicalityScore}/5 no filtro basal de Prashna.`,
    },
    {
      criterion: "Eixo da pergunta",
      state: supportBand,
      score: supportBand === "Suporte alto" ? 2 : supportBand === "Suporte medio" ? 1 : -1,
      note: `Casa-tema, regente, aspectos e ocupacao entregam ${supportScore}/5 no overlay atual.`,
    },
    {
      criterion: "Testemunha principal",
      state: strongestWitness ? `${strongestWitness.label} | ${witnessBand.label}` : witnessBand.label,
      score: witnessBand.score,
      note: strongestWitness ? `${strongestWitness.note} ${witnessBand.note}` : witnessBand.note,
    },
    {
      criterion: "Karakas do tema",
      state: karakaSupportBand,
      score:
        karakaSupportBand === "Karakas fortes"
          ? 2
          : karakaSupportBand === "Karakas medianos"
            ? 1
            : -1,
      note:
        theme.karakas.length
          ? `Score agregado ${karakaSupportScore.toFixed(2)} para ${theme.karakas.join(", ")}.`
          : "Tema sem karakas operacionais declarados nesta malha.",
    },
    {
      criterion: "Lua x tema",
      state: moonThemeBand.label,
      score: moonThemeBand.score,
      note: `${moonToQuestionHouse}a casa da Lua ate o signo-tema. ${moonThemeBand.note}`,
    },
    {
      criterion: "Arudha da pergunta",
      state: questionArudha ? "Pada presente" : "Pada ausente",
      score: questionArudha ? 1 : 0,
      note: questionArudha?.note ?? "Sem Arudha calculado para reforcar o tema nesta rodada.",
    },
    {
      criterion: "Cadencia do regente",
      state: questionLordMotion.label,
      score:
        questionLordMotion.label === "Cadencia rapida"
          ? 2
          : questionLordMotion.label === "Cadencia regular"
            ? 1
            : questionLordMotion.label === "Retrogrado forte" || questionLordMotion.label === "Retrogrado de revisao"
              ? 0
              : -1,
      note: `${questionLordMotion.note} Velocidade longitudinal ${questionLordMotion.speed.toFixed(4)}.`,
    },
  ];
  const prashnaOutcome = buildPrashnaOutcome(prashnaScoreRows);

  return {
    sections: [
      createSection({
        id: `${module}-prashna`,
        title: "Prashna Jyotish",
        description:
          "Carta do momento da pergunta com foco em Lagna, Lua, panchanga e radicalidade tecnica.",
        status: "implemented",
        items: [
          createDatum(module, "Prashna", "Pergunta", context.question || "Sem pergunta registrada", {
            technicalNotes: context.question
              ? "A pergunta textual ancora o modulo horario."
              : "Sem texto de pergunta; o modulo preserva o recorte horario, mas perde ancora semantica do quesito.",
            confidence: context.question ? 0.95 : 0.25,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Lagna da pergunta", context.transit.ascendant.signName, {
            technicalNotes: `${context.transit.ascendant.degreeInSign.toFixed(2)} graus.`,
            confidence: 0.82,
          }),
          createDatum(module, "Prashna", "Lua da pergunta", `${moon.signName} | ${moon.nakshatra}`, {
            technicalNotes: "Lua do momento do questionamento.",
            confidence: 0.84,
          }),
          createDatum(module, "Prashna", "Suporte tecnico de radicalidade", radicalityBand, {
            technicalNotes:
              "Faixa sintetica derivada de Lagna nao-sandhi, Lua nao-sandhi, posicao da Lua a partir do Lagna, estado do regente do Lagna e ancora textual da pergunta.",
            confidence: 0.68,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Tendencia operacional da resposta", prashnaOutcome.state, {
            technicalNotes: prashnaOutcome.note,
            confidence: context.question ? 0.7 : 0.42,
            status: "implemented",
            methodUsed: "prashna-scorecard-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-prashna-radicality-table`,
            "Indicadores de radicalidade",
            ["Indicador", "Estado", "Nota"],
            [
              [
                "Lagna",
                lagnaEarly ? "Muito cedo" : lagnaLate ? "Muito tarde" : "Faixa media",
                `${lagna.degreeInSign.toFixed(2)} graus no signo.`,
              ],
              [
                "Lua",
                moonSandhi ? "Sandhi" : "Fora de sandhi",
                `${moon.signName} | ${moon.nakshatra} | ${moon.degreeInSign.toFixed(2)} graus.`,
              ],
              [
                "Lua a partir do Lagna",
                `${moonFromLagna}a casa`,
                [1, 4, 7, 10, 5, 9].includes(moonFromLagna)
                  ? "Lua em angulo ou trikona no recorte atual."
                  : "Lua fora de angulo/trikona no recorte atual.",
              ],
              [
                "Regente do Lagna",
                lagnaLord.name,
                lagnaLordCombust
                  ? "Combusto no recorte atual."
                  : lagnaLordRetro
                    ? "Retrogrado, exigindo leitura cuidadosa."
                    : "Sem combustao no recorte atual.",
              ],
              [
                "Pergunta registrada",
                context.question ? "Sim" : "Nao",
                context.question
                  ? "A pergunta textual ancora o modulo."
                  : "Sem pergunta, a radicalidade fica menos confiavel.",
              ],
            ],
            "Triagem de radicalidade v1 do modulo. Ela nao substitui escola de Prashna, mas ajuda a separar momentos tecnicamente mais ou menos estaveis."
          ),
        ],
      }),
      createSection({
        id: `${module}-prashna-combinations`,
        title: "Combinacoes de Prashna",
        description:
          "Abre a casa principal da pergunta, seu regente, seu pada e os apoios ou aflicoes mais imediatos no mapa horario.",
        status: "implemented",
        items: [
          createDatum(module, "Prashna", "Tema reconhecido", theme.label, {
            technicalNotes: theme.note,
            confidence: context.question ? (theme.matchedKeywords.length ? 0.82 : 0.56) : 0.42,
            status: "implemented",
          }),
          createDatum(
            module,
            "Prashna",
            "Palavras-chave ativas",
            theme.matchedKeywords.length ? theme.matchedKeywords.join(", ") : "Sem match forte",
            {
              technicalNotes:
                theme.matchedKeywords.length
                  ? "Palavras ou fragmentos que puxaram a casa-tema nesta rodada."
                  : "Sem palavras-chave dominantes; o motor recuou para a triagem geral do Lagna.",
              confidence: context.question ? 0.78 : 0.32,
              status: "implemented",
              methodUsed: "prashna-theme-trace-v2",
            }
          ),
          createDatum(module, "Prashna", "Ambiguidade da triagem", themeResolution.ambiguityBand, {
            technicalNotes: themeResolution.ambiguityNote,
            confidence: context.question ? 0.72 : 0.3,
            status: "implemented",
            methodUsed: "prashna-theme-trace-v2",
          }),
          createDatum(module, "Prashna", "Casa principal da pergunta", `H${theme.house}`, {
            technicalNotes: `Casa derivada do tema "${theme.label}" no working set do modulo.`,
            relatedHouse: theme.house,
            confidence: 0.78,
          }),
          createDatum(module, "Prashna", "Regente da casa da pergunta", questionHouseLord.name, {
            technicalNotes: `Regente da casa ${theme.house} em ${questionHouseLord.signName}, H${questionHouseLord.house}.`,
            relatedPlanet: questionHouseLord.name,
            confidence: 0.8,
          }),
          createDatum(module, "Prashna", "Regente do Pada da pergunta", questionArudhaLord?.name ?? "--", {
            technicalNotes: questionArudhaLord
              ? `${questionArudhaLord.name} rege o pada da pergunta em ${questionArudhaLord.signName}, H${questionArudhaLord.house}.`
              : "Sem regente de pada isolado neste recorte.",
            relatedPlanet: questionArudhaLord?.name,
            confidence: questionArudhaLord ? 0.72 : 0.28,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Pada da pergunta", questionArudha?.signName ?? "--", {
            technicalNotes: questionArudha?.note ?? "Sem Arudha calculado para a casa-tema.",
            relatedSign: questionArudha?.signName,
            confidence: questionArudha ? 0.74 : 0.3,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Cadencia do regente do quesito", questionLordMotion.label, {
            technicalNotes: `${questionLordMotion.note} Velocidade ${questionLordMotion.speed.toFixed(4)} grau/dia no snapshot.`,
            relatedPlanet: questionHouseLord.name,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "cheshta-normalized-prashna-v1",
          }),
          createDatum(module, "Prashna", "Suporte do eixo da pergunta", supportBand, {
            technicalNotes: `Pontuacao operacional ${supportScore}/5 a partir de ocupacao benefica, dignidade do regente, aspectos e posicao do regente.`,
            confidence: 0.7,
            status: "implemented",
          }),
        ],
        tables: [
          createTable(
            `${module}-prashna-theme-trace`,
            "Triagem textual do tema",
            ["Casa", "Tema", "Score", "Palavras-chave", "Nota"],
            themeResolution.candidates.map((candidate) => [
              `H${candidate.house}`,
              candidate.label,
              candidate.score.toString(),
              candidate.matchedKeywords.length ? candidate.matchedKeywords.join(", ") : "--",
              candidate.note,
            ]),
            "Rastro da escolha do tema no texto da pergunta. Serve para o astrologo conferir se a casa inferida bate com a intencao real do consulente."
          ),
          createTable(
            `${module}-prashna-theme-table`,
            "Casa, regente e Arudha da pergunta",
            ["Item", "Valor", "Nota"],
            [
              ["Tema", theme.label, theme.note],
              ["Ambiguidade", themeResolution.ambiguityBand, themeResolution.ambiguityNote],
              ["Casa principal", `H${theme.house}`, `No D1 horario, a casa-tema cai em ${questionSignName}.`],
              [
                "Regente",
                questionHouseLord.name,
                `Em ${questionHouseLord.signName}, casa ${questionHouseLord.house}. ${lordCondition.length ? lordCondition.join(", ") : "Sem marca forte no working set."}`,
              ],
              [
                "Regente do Pada",
                questionArudhaLord?.name ?? "--",
                questionArudhaLord
                  ? `Em ${questionArudhaLord.signName}, casa ${questionArudhaLord.house}.`
                  : "Sem regente de pada isolado para apoiar a pergunta.",
              ],
              ["Arudha / Pada", questionArudha?.signName ?? "--", questionArudha?.note ?? "Sem calculo de pada para a casa-tema."],
              ["Lua ate a casa-tema", `${moonToQuestionHouse}a`, "Distancia da Lua do momento ate o signo da pergunta."],
            ],
            "Eixo tecnico central do Prashna: casa-tema, regente, pada e distancia lunar."
          ),
          createTable(
            `${module}-prashna-support-table`,
            "Apoio e aflicao do tema",
            ["Indicador", "Estado", "Nota"],
            [
              [
                "Ocupantes da casa",
                questionOccupants.length ? questionOccupants.map((point) => point.name).join(", ") : "Sem ocupantes",
                questionOccupants.length
                  ? `${beneficOccupants.length} beneficos e ${maleficOccupants.length} maleficos na casa-tema.`
                  : "Sem grahas na casa-tema; o foco recai mais no regente e no pada.",
              ],
              [
                "Aspectos ao regente",
                lordAspects.length ? lordAspects.map((aspect) => aspect.source).join(", ") : "Sem aspecto forte listado",
                lordAspects.length
                  ? "Aspectos lidos do motor de drishti ja montado no snapshot."
                  : "Nenhum aspecto relevante sobre o regente apareceu no recorte atual.",
              ],
              ["Karakas do tema", theme.karakas.join(", "), "Karakas operacionais usados para ancorar o tema reconhecido."],
              [
                "Condicao do regente",
                lordCondition.length ? lordCondition.join(", ") : "Regular",
                `Regente em ${questionHouseLord.signName}, H${questionHouseLord.house}.`,
              ],
              [
                "Cadencia do regente",
                questionLordMotion.label,
                `${questionLordMotion.note} Velocidade ${questionLordMotion.speed.toFixed(4)} grau/dia.`,
              ],
            ],
            "Tabela-resumo para separar apoio, aflicao e coerencia do eixo da pergunta."
          ),
        ],
      }),
      createSection({
        id: `${module}-prashna-contact-grid`,
        title: "Malha do Quesito",
        description:
          "Explicita as ancoras do quesito e seus contatos cruzados para o astrologo auditar quem realmente segura, espelha ou distancia o tema no mapa horario.",
        status: "implemented",
        items: [
          createDatum(module, "Prashna", "Regente mais mobilizado", strongestWitness?.label ?? "--", {
            technicalNotes:
              strongestWitness?.note ?? "Sem testemunha dominante isolada; a leitura depende mais da malha de contatos do que de um unico ponto.",
            relatedPlanet: strongestWitness?.point.name,
            confidence: strongestWitness ? 0.72 : 0.3,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Cadencia do regente do tema", questionLordMotion.label, {
            technicalNotes: `${questionLordMotion.note} Velocidade longitudinal ${questionLordMotion.speed.toFixed(4)} grau/dia.`,
            relatedPlanet: questionHouseLord.name,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "cheshta-normalized-prashna-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-prashna-anchors`,
            "Ancoras estruturais do quesito",
            ["Ancora", "Signo", "Casa", "Relacao com tema", "Movimento", "Aspectos recebidos", "Aspectos emitidos"],
            structuralAnchorRows.map((row) => [
              row.label,
              row.point.signName,
              `H${row.point.house}`,
              `${row.relationToTheme}a`,
              row.motion.label,
              row.incomingAspects.length ? row.incomingAspects.map((aspect) => `${aspect.source} (${aspect.kind})`).join(", ") : "--",
              row.outgoingAspects.length ? row.outgoingAspects.map((aspect) => `${aspect.target} (${aspect.kind})`).join(", ") : "--",
            ]),
            "Quadro cru para ver onde cada ancora do Prashna cai, como se move e quais drishtis entram ou saem dela."
          ),
          createTable(
            `${module}-prashna-contacts`,
            "Contatos entre as ancoras do quesito",
            ["Ponto A", "Ponto B", "Contato", "Relacao", "Nota"],
            contactRows.map((row) => [
              row.left.label,
              row.right.label,
              row.contact.label,
              `${row.contact.signRelation}a`,
              row.contact.note,
            ]),
            "Malha cruzada entre regente do Lagna, Lua, regente do tema, regente do pada e karakas ativos."
          ),
        ],
      }),
      createSection({
        id: `${module}-prashna-argala`,
        title: "Argala do Quesito",
        description:
          "Aplica a malha classica de Argala e Virodhargala ao Lagna, Lua, casa-tema e pada da pergunta para abrir pressao de suporte ou bloqueio.",
        status: "implemented",
        items: [
          createDatum(module, "Prashna", "Pressao argalica do quesito", argalaBand.label, {
            technicalNotes: argalaBand.note,
            confidence: 0.66,
            status: "implemented",
            methodUsed: "prashna-argala-grid-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-prashna-argala-table`,
            "Argala por ancora do quesito",
            ["Alvo", "Posicao", "Argala", "Bloqueio", "Virodhargala", "Estado"],
            argalaRows,
            "Le a pressao ocupacional nas posicoes 2, 4, 11 e 5, com seus bloqueios 12, 10, 3 e 9, diretamente sobre os alvos centrais do Prashna."
          ),
        ],
      }),
      createSection({
        id: `${module}-prashna-school-rules`,
        title: "Regras Escolares de Prashna",
        description:
          "Camada escolar operacional que cruza radicalidade, tripe Lagna-Lua-Regente, karakas do tema e Arudha da casa perguntada.",
        status: "implemented",
        items: [
          createDatum(module, "Prashna", "Leitura escolar", schoolBand, {
            technicalNotes:
              "Faixa sintetica derivada do atendimento das regras de radicalidade, da testemunha principal e do apoio do eixo-tema.",
            confidence: 0.68,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Testemunha principal", strongestWitness?.label ?? "--", {
            technicalNotes: strongestWitness?.note ?? "Sem testemunha principal isolada.",
            relatedPlanet: strongestWitness?.point.name,
            confidence: strongestWitness ? 0.72 : 0.32,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Forca dos karakas", karakaSupportBand, {
            technicalNotes:
              theme.karakas.length
                ? `Karakas operacionais: ${theme.karakas.join(", ")}. Score agregado ${karakaSupportScore.toFixed(2)}.`
                : "Tema sem karakas operacionais declarados no working set atual.",
            confidence: theme.karakas.length ? 0.7 : 0.42,
            status: "implemented",
          }),
          createDatum(module, "Prashna", "Score operacional", prashnaOutcome.totalScore, {
            technicalNotes: prashnaOutcome.note,
            confidence: context.question ? 0.7 : 0.4,
            status: "implemented",
            methodUsed: "prashna-scorecard-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-prashna-witnesses`,
            "Tripode, karakas e testemunhas",
            ["Ponto", "Signo", "Casa", "Condicao", "Relacao com tema", "Score", "Nota"],
            witnessRows.map((row) => [
              row.label,
              row.point.signName,
              `H${row.point.house}`,
              row.conditionTags.length ? row.conditionTags.join(", ") : "Regular",
              `${row.relationToTheme}a | ${row.relationBand.label}`,
              row.score.toFixed(2),
              row.note,
            ]),
            "Lagna, Lua, regente da pergunta e karakas operacionais cruzados pelo signo/casa da pergunta."
          ),
          createTable(
            `${module}-prashna-school-rules-table`,
            "Regras operacionais aplicadas",
            ["Familia", "Regra", "Estado", "Nota"],
            ruleRows.map((row) => [row.family, row.rule, row.state, row.note]),
            "Working set escolar do modulo: Prashna Marga basal, tripe Lagna-Lua-Regente, eixo-tema e Arudha."
          ),
          createTable(
            `${module}-prashna-scorecard`,
            "Scorecard Operacional de Prashna",
            ["Filtro", "Estado", "Score", "Nota"],
            prashnaScoreRows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
            "Painel curto para pesar radicalidade, eixo-tema, witness, karakas, Lua e Arudha antes de sintetizar a tendencia da resposta."
          ),
        ],
      }),
    ],
    validations: [
      ...(context.question
        ? []
        : [
            createValidation(
              "warning",
              "Prashna sem texto da pergunta; o modulo fica tecnicamente enfraquecido.",
              "question",
              "prashna-textual-anchor"
            ),
          ]),
      ...(radicalityScore <= 2
        ? [
            createValidation(
              "warning",
              "A radicalidade horaria ficou fragil neste recorte; Lagna/Lua ou ancora textual nao sustentam bem a pergunta.",
              "question",
              "prashna-radicality-low"
            ),
          ]
        : []),
      ...(supportBand === "Suporte baixo"
        ? [
            createValidation(
              "info",
              "A casa-tema e seu regente aparecem com pouco apoio direto; a resposta tecnica depende mais de contexto e menos de testemunho limpo.",
              "question",
              "prashna-theme-support-low"
            ),
          ]
        : []),
      ...(context.question && themeResolution.ambiguityBand !== "Tema dominante"
        ? [
            createValidation(
              "info",
              `A triagem tematica saiu em ${themeResolution.ambiguityBand.toLowerCase()}; vale conferir se a pergunta deve ser lida pela casa ${theme.house} ou por uma casa concorrente.`,
              "question",
              "prashna-theme-ambiguity"
            ),
          ]
        : []),
    ],
    summary: [
      `Prashna em ${prashnaOutcome.state.toLowerCase()} com score ${prashnaOutcome.totalScore}.`,
      `Tema ${theme.label} com ${themeResolution.ambiguityBand.toLowerCase()}; testemunha principal em ${strongestWitness?.label ?? "--"} e suporte do eixo em ${supportBand.toLowerCase()}.`,
      `Regente do quesito em ${questionLordMotion.label.toLowerCase()} e malha argalica em ${argalaBand.label.toLowerCase()}.`,
    ],
  };
}
