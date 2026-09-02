import type { NatalAnalysis, NatalSourceGapEntry } from "./natalAnalysis";
import type { NatalPrecisionData } from "./natalPrecision";
import type { NatalProductionValidation } from "./natalProductionValidation";
import { sanitizeNatalAiValue } from "./natalAiSanitizer";

export type NatalAuthorLabel = "Marcos Monteiro" | "John Frawley" | "Luiz Gonzaga de Carvalho Neto" | "Traditional shared";
export type NatalEvidenceStatus = "SOURCE_LOCKED" | "CONTEXTUAL" | "AUTHORIAL_JUDGMENT_REQUIRED" | "DOCUMENTARY_BOUNDARY";

export interface NatalEvidenceGraphNode {
  id: string;
  type: "planet" | "house" | "lot" | "angle" | "fixed-star" | "faculty" | "domain" | "symbol";
  label: string;
  data?: unknown;
}

export interface NatalEvidenceGraphEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  authorLayers: NatalAuthorLabel[];
  status: NatalEvidenceStatus;
  evidencePath: string;
  note?: string;
}

export interface NatalAuthorialEvidenceGraph {
  schemaVersion: "1.0.0";
  principle: "same-symbol-different-role-by-context";
  nodes: NatalEvidenceGraphNode[];
  edges: NatalEvidenceGraphEdge[];
  readingRule: string;
}

export interface NatalHouseOntologyEntry {
  house: number;
  coreTopics: string[];
  medicalBodyParts: string[];
  ruler: string;
  naturalSignificators: string[];
  rule: "HOUSE_IS_FIELD_NOT_AGENT";
}

export interface NatalDerivedRoute {
  actor: string;
  actorHouse: number;
  subject: string;
  relativeHouse: number;
  resolvedHouse: number;
  resolvedRuler: string;
  derivation: string;
  confidence: "HIGH" | "CONTEXT_REQUIRED";
}

export interface NatalQuestionRoute {
  status: "AWAITING_QUESTION" | "ROUTED" | "OPEN_WORLD_SEMANTIC_ROUTING_REQUIRED";
  question: string | null;
  normalizedQuestion: string | null;
  matchedDomains: string[];
  protocolIds: string[];
  primaryHouses: number[];
  contextHouses: number[];
  selectedPlanets: string[];
  derivedRoutes: NatalDerivedRoute[];
  semanticDecomposition: string[];
  unresolvedSemanticChoices: string[];
  requiresSemanticExpansion: boolean;
  routingRule: string;
}

export interface NatalJudgmentZone {
  id: string;
  author: string;
  domain: string;
  status: "QUALITATIVE_SELECTION" | "DOCUMENTARY_BOUNDARY" | "CONTEXT_REQUIRED" | "CONTRADICTION_CHECK";
  evidence: unknown;
  aiInstruction: string;
}

export interface NatalJudgmentContext {
  schemaVersion: "1.0.0";
  layer: "NATAL_JUDGMENT_CONTEXT";
  questionRoute: NatalQuestionRoute;
  selectedProtocols: unknown[];
  selectedHouseDossiers: unknown[];
  selectedPlanetPackets: unknown[];
  selectedSpecialistDossiers: Record<string, unknown>;
  authorialJudgmentZones: NatalJudgmentZone[];
  mandatoryInvestigationChecklist: string[];
  answerContract: {
    requiredBlocks: ["DADOS_CALCULADOS", "TESTEMUNHOS", "SINTESE", "INCERTEZAS_E_CONFLITOS", "CONTEXTO_NECESSARIO"];
    provenanceRequired: true;
    calculationForbidden: true;
    missingDataToken: "MISSING_ENGINE_DATA";
    noSingleSymbolConclusion: true;
  };
}

export interface NatalFactsLayer {
  schemaVersion: "1.0.0";
  layer: "NATAL_FACTS";
  interpretationAllowed: false;
  computedOnly: true;
  radix: unknown;
  precision: unknown;
  rule: string;
}

export interface NatalAuthorialDossierLayer {
  schemaVersion: "1.0.0";
  layer: "NATAL_AUTHORIAL_DOSSIER";
  authorSeparation: "STRICT";
  sourceHierarchy: ["Marcos Monteiro", "John Frawley", "Luiz Gonzaga de Carvalho Neto"];
  authorialTracks: unknown;
  domainDossiers: unknown;
  protocols: unknown;
  sourceGaps: unknown;
  unresolvedTechnicalQuestions: string[];
  evidenceGraph: NatalAuthorialEvidenceGraph;
  openWorldContext: {
    houseOntology: NatalHouseOntologyEntry[];
    derivedHouseTable: unknown;
    symbolicComposition: {
      signs: "QUALITIES_NOT_AGENTS";
      planets: "AGENTS_OR_FUNCTIONS_DEPENDING_ON_ROLE";
      houses: "FIELDS_OF_MANIFESTATION";
      aspects: "RELATIONS_OR_CONTACTS_NOT_AUTOMATIC_GOOD_BAD";
      receptions: "INCLINATION_PRIORITY_INTEREST_NOT_EVENT";
      lots: "SUBJECT_POINTS_DONE_TO_NOT_DOERS";
    };
    interpretiveBoundary: "NEVER_INFER_CONCRETE_MANIFESTATION_FROM_ONE_SYMBOL_ALONE";
  };
}

export interface NatalAbsoluteJudgmentPackage {
  schemaVersion: "1.0.0";
  profile: "absolute-natal-judgment";
  release: {
    releasedForAi: boolean;
    productionValidationStatus: "PASS" | "FAIL";
    errorCodes: string[];
    warningCodes: string[];
  };
  natalFacts: NatalFactsLayer;
  natalAuthorialDossier: NatalAuthorialDossierLayer;
  natalJudgmentContext: NatalJudgmentContext;
  absolutePrompt: string;
}

const DOMAIN_RULES: Array<{
  id: string;
  protocolIds: string[];
  patterns: string[];
  houses: number[];
  extraPlanets?: string[];
}> = [
  { id: "temperament", protocolIds: ["temperament", "lord-of-nativity"], patterns: ["temperamento", "coleric", "sanguin", "melancol", "fleumat"], houses: [1] },
  { id: "mentalidade", protocolIds: ["mentality-marcos", "mentality-frawley", "mentality-gugu"], patterns: ["mental", "mente", "intelect", "raciocin", "pensamento", "memoria", "imagin", "fala", "comunic"], houses: [3], extraPlanets: ["Lua", "Mercúrio"] },
  { id: "motivacao-primaria", protocolIds: [], patterns: ["motivacao", "proposito", "sentido da vida", "realizacao", "vocacao interior"], houses: [1], extraPlanets: ["Saturno"] },
  { id: "potencias-da-alma", protocolIds: [], patterns: ["potencia da alma", "faculdade", "vontade", "apetite", "concupisc", "irasc", "intelecto agente", "intelecto paciente", "estimativa", "sentido comum"], houses: [], extraPlanets: ["Sol", "Lua", "Mercúrio", "Vênus", "Marte", "Júpiter", "Saturno"] },
  { id: "saude", protocolIds: ["constitution", "health-disease", "body-localization", "accidents"], patterns: ["saude", "doenca", "doenc", "enferm", "corpo", "acidente", "lesao", "vulnerab", "predispos"], houses: [1, 6] },
  { id: "dinheiro", protocolIds: ["money"], patterns: ["dinheiro", "finance", "renda", "riqueza", "patrimonio", "bens", "recursos", "ganho"], houses: [2] },
  { id: "salario", protocolIds: ["salary"], patterns: ["salario", "remuneracao", "beneficio do trabalho", "pagamento do trabalho"], houses: [11] },
  { id: "imovel", protocolIds: ["property"], patterns: ["imovel", "casa propria", "terra", "propriedade", "terreno"], houses: [4] },
  { id: "heranca", protocolIds: ["inheritance"], patterns: ["heranca", "herdar", "espólio", "espolio"], houses: [8] },
  { id: "emprestimo-banco", protocolIds: ["loans-banks", "other-money"], patterns: ["emprestimo", "divida", "banco", "credito", "financiamento"], houses: [7, 8] },
  { id: "relacionamentos", protocolIds: ["relationships", "romance-sexuality"], patterns: ["casamento", "casar", "relacionamento", "conjuge", "esposa", "marido", "namor", "parceiro", "amor", "romance", "sexual"], houses: [1, 5, 7], extraPlanets: ["Vênus"] },
  { id: "filhos", protocolIds: ["children"], patterns: ["filho", "filha", "crianca", "fertilidade", "gravidez", "engravid"], houses: [5] },
  { id: "pai-raizes", protocolIds: ["father-roots"], patterns: ["pai", "ancestr", "raiz", "familia de origem", "patria"], houses: [4] },
  { id: "mae", protocolIds: ["mother"], patterns: ["mae", "materna"], houses: [10] },
  { id: "irmaos-vizinhos", protocolIds: ["siblings-peers"], patterns: ["irmao", "irma", "primo", "prima", "vizinho", "vizinha", "colega cotidiano"], houses: [3] },
  { id: "amigos", protocolIds: ["friends-support"], patterns: ["amigo", "amizade", "benfeitor", "apoio", "esperanca"], houses: [11] },
  { id: "inimigos-declarados", protocolIds: ["open-enemies"], patterns: ["inimigo declarado", "concorrente", "oponente", "rival"], houses: [7] },
  { id: "inimigos-ocultos", protocolIds: ["hidden-enemies", "self-undoing"], patterns: ["inimigo oculto", "sabotagem", "autossabotagem", "vicio", "prisao", "confinamento", "restricao"], houses: [12] },
  { id: "aprendizado-comunicacao", protocolIds: ["communication-basic-learning"], patterns: ["escrever", "escrita", "leitura", "comunicacao", "aprender", "aprendizado basico", "habilidade intelectual"], houses: [3], extraPlanets: ["Mercúrio"] },
  { id: "ensino-superior-filosofia", protocolIds: ["higher-learning"], patterns: ["filosofia", "ensino superior", "universidade", "professor", "mestre", "conhecimento superior", "estudo superior", "doutrina"], houses: [9] },
  { id: "religiao-fe", protocolIds: ["faith"], patterns: ["religiao", "religioso", "fe", "espiritual", "deus", "igreja", "sacerd", "teologia"], houses: [9], extraPlanets: ["Júpiter"] },
  { id: "sonhos", protocolIds: ["dreams"], patterns: ["sonho", "sonhar", "visao durante o sono"], houses: [9] },
  { id: "viagem-curta", protocolIds: ["short-travel"], patterns: ["viagem curta", "deslocamento", "trajeto", "rotina de transporte"], houses: [3] },
  { id: "viagem-longa", protocolIds: ["long-travel"], patterns: ["viagem longa", "estrangeiro", "exterior", "peregrinacao", "morar fora"], houses: [9] },
  { id: "profissao", protocolIds: ["profession-marcos", "profession-frawley", "authority-status"], patterns: ["profissao", "profissional", "carreira", "trabalho", "oficio", "vocacao", "emprego", "cargo"], houses: [10], extraPlanets: ["Mercúrio", "Vênus", "Marte"] },
  { id: "fama-status", protocolIds: ["authority-status", "fame"], patterns: ["fama", "famos", "notoriedade", "reputacao", "status", "honra", "autoridade", "chefe", "lideranca"], houses: [10] },
  { id: "subordinados-animais-pequenos", protocolIds: ["subordinates-small-animals"], patterns: ["empregado", "subordinado", "prestador", "animal pequeno", "pet", "cachorro", "gato"], houses: [6] },
  { id: "animais-grandes", protocolIds: ["large-animals"], patterns: ["animal grande", "cavalo", "boi", "gado"], houses: [12] },
];

const ACTOR_RULES: Array<{ label: string; house: number; patterns: string[] }> = [
  { label: "nativo", house: 1, patterns: ["meu", "minha", "eu", "proprio", "propria"] },
  { label: "irmão/vizinho/par", house: 3, patterns: ["irmao", "irma", "vizinho", "vizinha", "primo", "prima"] },
  { label: "pai", house: 4, patterns: ["pai"] },
  { label: "filho", house: 5, patterns: ["filho", "filha", "crianca"] },
  { label: "subordinado/prestador", house: 6, patterns: ["empregado", "subordinado", "prestador"] },
  { label: "cônjuge/parceiro/cliente", house: 7, patterns: ["conjuge", "esposa", "marido", "namorado", "namorada", "parceiro", "cliente"] },
  { label: "mãe/autoridade", house: 10, patterns: ["mae", "chefe", "autoridade"] },
  { label: "amigo", house: 11, patterns: ["amigo", "amiga"] },
];

const SUBJECT_RELATIVE_HOUSE_RULES: Array<{ label: string; relativeHouse: number; patterns: string[] }> = [
  { label: "dinheiro/posses", relativeHouse: 2, patterns: ["dinheiro", "finance", "renda", "bens", "posses", "patrimonio", "divid", "endividad"] },
  { label: "irmãos/vizinhos", relativeHouse: 3, patterns: ["irmao", "irma", "vizinho", "vizinha"] },
  { label: "lar/imóveis/raízes", relativeHouse: 4, patterns: ["casa", "imovel", "terra", "lar", "raiz"] },
  { label: "filhos/prazer", relativeHouse: 5, patterns: ["filho", "filha", "prazer", "sexo"] },
  { label: "doença/subordinados", relativeHouse: 6, patterns: ["doenca", "saude", "empregado", "subordinado"] },
  { label: "parceiro/inimigo declarado", relativeHouse: 7, patterns: ["conjuge", "parceiro", "cliente", "inimigo", "rival"] },
  { label: "morte/herança/recursos do outro", relativeHouse: 8, patterns: ["morte", "heranca", "espólio", "espolio"] },
  { label: "religião/estudo superior/viagem longa", relativeHouse: 9, patterns: ["religiao", "fe", "filosofia", "universidade", "viagem longa"] },
  { label: "profissão/mãe/status", relativeHouse: 10, patterns: ["profissao", "carreira", "mae", "status"] },
  { label: "amigos/apoios/salário", relativeHouse: 11, patterns: ["amigo", "apoio", "salario"] },
  { label: "inimigos ocultos/restrições", relativeHouse: 12, patterns: ["inimigo oculto", "prisao", "restricao", "autossabotagem"] },
];

function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STEM_PATTERNS = new Set([
  "coleric", "sanguin", "melancol", "fleumat", "mental", "intelect", "raciocin", "imagin", "comunic",
  "concupisc", "irasc", "finance", "patrimon", "divid", "endividad", "doenc", "enferm", "vulnerab", "predispos",
  "relacion", "conjug", "namor", "parceir", "gravidez", "engravid", "ancestr", "materna", "amizad", "benfeitor",
  "autossabot", "restri", "aprend", "filosof", "univers", "professor", "relig", "espirit", "sacerd", "teolog",
  "peregrin", "profiss", "carreir", "vocac", "reput", "autoridad", "lider", "subordin", "prestador",
]);

function includesPattern(text: string, pattern: string): boolean {
  const normalizedPattern = normalizeText(pattern);
  if (!normalizedPattern) return false;
  if (normalizedPattern.includes(" ")) return text.includes(normalizedPattern);
  if (STEM_PATTERNS.has(normalizedPattern)) {
    return text.split(/[\s/-]+/).some((token) => token.startsWith(normalizedPattern));
  }
  return text.split(/[\s/-]+/).includes(normalizedPattern);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function getProtocolById(analysis: NatalAnalysis, id: string) {
  return analysis.technicalForm.interpretationContract.protocols.find((protocol) => protocol.id === id);
}

function resolveDerivedRoutes(text: string, analysis: NatalAnalysis): NatalDerivedRoute[] {
  const actors = ACTOR_RULES.map((actor) => ({
    ...actor,
    hits: actor.patterns.filter((pattern) => includesPattern(text, pattern)),
  })).filter((actor) => actor.hits.length > 0);
  const subjects = SUBJECT_RELATIVE_HOUSE_RULES.map((subject) => ({
    ...subject,
    hits: subject.patterns.filter((pattern) => includesPattern(text, pattern)),
  })).filter((subject) => subject.hits.length > 0);
  if (!actors.length || !subjects.length) return [];

  const ownershipLinked = (actorHit: string, subjectHit: string): boolean => {
    const a = normalizeText(actorHit);
    const s = normalizeText(subjectHit);
    const possessiveLinks = ["do", "da", "de", "dos", "das", "do meu", "da minha", "de meu", "de minha", "de um", "de uma", "do seu", "da sua"];
    return [
      ...possessiveLinks.map((link) => `${s} ${link} ${a}`),
      `${a} tem ${s}`, `${a} possui ${s}`, `${a} esta com ${s}`,
      `${a} esta ${s}`, `${a} ficou ${s}`,
    ].some((pattern) => text.includes(pattern));
  };

  const routes: NatalDerivedRoute[] = [];
  for (const actor of actors) {
    if (actor.house === 1) continue; // "my money" is radical H2, not a derived-house problem.
    for (const subject of subjects) {
      const linked = actor.hits.some((actorHit) => subject.hits.some((subjectHit) => ownershipLinked(actorHit, subjectHit)));
      if (!linked) continue; // Fail closed: mere co-occurrence ("financial problem with neighbor") is not ownership.
      const lookup = analysis.technicalForm.derivedHouseTable.find(
        (entry) => entry.baseHouse === actor.house && entry.relativeHouse === subject.relativeHouse,
      );
      if (!lookup) continue;
      routes.push({
        actor: actor.label,
        actorHouse: actor.house,
        subject: subject.label,
        relativeHouse: subject.relativeHouse,
        resolvedHouse: lookup.resolvedHouse,
        resolvedRuler: lookup.resolvedRuler,
        derivation: lookup.derivation,
        confidence: "HIGH",
      });
    }
  }
  return routes;
}

export function routeNatalQuestion(question: string | null | undefined, analysis: NatalAnalysis): NatalQuestionRoute {
  const trimmed = question?.trim() ?? "";
  if (!trimmed) {
    return {
      status: "AWAITING_QUESTION",
      question: null,
      normalizedQuestion: null,
      matchedDomains: [],
      protocolIds: [],
      primaryHouses: [],
      contextHouses: [],
      selectedPlanets: [],
      derivedRoutes: [],
      semanticDecomposition: [],
      unresolvedSemanticChoices: ["Nenhuma pergunta/contexto foi fornecido. A IA deve aguardar o problema concreto antes de selecionar significadores."],
      requiresSemanticExpansion: false,
      routingRule: "Do not pre-interpret the entire chart. Select domains only after a concrete question/context exists.",
    };
  }

  const normalized = normalizeText(trimmed);
  const matches = DOMAIN_RULES.filter((rule) => rule.patterns.some((pattern) => includesPattern(normalized, pattern)));
  const derivedRoutes = resolveDerivedRoutes(normalized, analysis);
  const protocolIds = unique([
    ...matches.flatMap((match) => match.protocolIds),
    ...(derivedRoutes.length ? ["derived-house-router"] : []),
  ]);
  const houses = unique([
    ...matches.flatMap((match) => match.houses),
    ...derivedRoutes.flatMap((route) => [route.actorHouse, route.resolvedHouse]),
  ]).sort((a, b) => a - b);
  const selectedPlanets = unique([
    ...matches.flatMap((match) => match.extraPlanets ?? []),
    ...houses.map((house) => analysis.technicalForm.houseDossiers[house - 1]?.domicileRuler).filter((planet): planet is string => Boolean(planet)),
  ]);
  const semanticDecomposition = [
    ...matches.map((match) => `domínio:${match.id}`),
    ...derivedRoutes.map((route) => `${route.actor} → ${route.subject} → ${route.derivation}`),
  ];
  const unresolvedSemanticChoices: string[] = [];
  const actorPossessiveReference = ACTOR_RULES.some((actor) => actor.patterns.some((pattern) => {
    const normalizedPattern = normalizeText(pattern);
    return normalized.includes(` do ${normalizedPattern}`) || normalized.includes(` da ${normalizedPattern}`) || normalized.includes(` de ${normalizedPattern}`);
  }));
  if (!matches.length && !derivedRoutes.length) {
    unresolvedSemanticChoices.push("Nenhuma correspondência lexical fechada. A IA deve mapear semanticamente o caso para a ontologia das 12 casas e selecionar do derivedHouseTable sem fazer aritmética própria.");
  }
  if (actorPossessiveReference && !derivedRoutes.length) {
    unresolvedSemanticChoices.push("Há uma relação de pertencimento/posse, mas o assunto não está no vocabulário determinístico. Mapear semanticamente o assunto para uma casa relativa usando houseOntology e então selecionar a célula pronta no derivedHouseTable; não fazer aritmética.");
  }
  if (derivedRoutes.some((route) => route.confidence === "CONTEXT_REQUIRED")) {
    unresolvedSemanticChoices.push("Mais de um ator/assunto pode estar presente; escolher a derivação somente após distinguir quem possui/sofre/realiza o tema.");
  }
  const requiresSemanticExpansion = (!matches.length && !derivedRoutes.length) || (actorPossessiveReference && !derivedRoutes.length);

  return {
    status: matches.length || derivedRoutes.length ? "ROUTED" : "OPEN_WORLD_SEMANTIC_ROUTING_REQUIRED",
    question: trimmed,
    normalizedQuestion: normalized,
    matchedDomains: matches.map((match) => match.id),
    protocolIds,
    primaryHouses: houses,
    contextHouses: unique(matches.flatMap((match) => match.houses)),
    selectedPlanets,
    derivedRoutes,
    semanticDecomposition,
    unresolvedSemanticChoices,
    requiresSemanticExpansion,
    routingRule: "Semantic composition is open-world: identify actor, subject and relation; houses are fields, planets act only after a role is established, and derived-house arithmetic must come from the engine table.",
  };
}

function addNode(nodes: NatalEvidenceGraphNode[], seen: Set<string>, node: NatalEvidenceGraphNode): void {
  if (seen.has(node.id)) return;
  seen.add(node.id);
  nodes.push(node);
}

function addEdge(edges: NatalEvidenceGraphEdge[], seen: Set<string>, edge: NatalEvidenceGraphEdge): void {
  if (seen.has(edge.id)) return;
  seen.add(edge.id);
  edges.push(edge);
}

export function buildNatalAuthorialEvidenceGraph(analysis: NatalAnalysis): NatalAuthorialEvidenceGraph {
  const form = analysis.technicalForm;
  const nodes: NatalEvidenceGraphNode[] = [];
  const edges: NatalEvidenceGraphEdge[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  form.planets.forEach((packet) => {
    const planetId = `planet:${packet.planet}`;
    addNode(nodes, nodeIds, {
      id: planetId,
      type: "planet",
      label: packet.planet,
      data: sanitizeNatalAiValue({
        longitude: packet.longitude,
        sign: packet.sign,
        housePlacement: packet.housePlacement,
        essential: packet.essential,
        accidental: packet.accidental,
      }),
    });

    packet.ruledHouses.forEach((house) => {
      addEdge(edges, edgeIds, {
        id: `${planetId}->house:${house}:rules`, from: planetId, to: `house:${house}`, relation: "RULES_HOUSE",
        authorLayers: ["Traditional shared"], status: "SOURCE_LOCKED", evidencePath: `technicalForm.planets[${packet.planet}].ruledHouses`,
      });
    });
    addEdge(edges, edgeIds, {
      id: `${planetId}->house:${packet.housePlacement.effectiveHouseMarcos}:occupies`, from: planetId, to: `house:${packet.housePlacement.effectiveHouseMarcos}`,
      relation: "OCCUPIES_EFFECTIVE_HOUSE_MARCOS", authorLayers: ["Marcos Monteiro"], status: "SOURCE_LOCKED", evidencePath: `technicalForm.planets[${packet.planet}].housePlacement`,
    });
    if (packet.dispositor.chain[1]) {
      addEdge(edges, edgeIds, {
        id: `${planetId}->planet:${packet.dispositor.chain[1]}:dispositor`, from: planetId, to: `planet:${packet.dispositor.chain[1]}`,
        relation: "DISPOSITED_BY", authorLayers: ["Traditional shared"], status: "SOURCE_LOCKED", evidencePath: `technicalForm.planets[${packet.planet}].dispositor`,
      });
    }
    packet.aspects.forEach((aspect) => {
      addEdge(edges, edgeIds, {
        id: `${planetId}->planet:${aspect.planet}:aspect:${aspect.aspect}`, from: planetId, to: `planet:${aspect.planet}`,
        relation: `ASPECT_${aspect.aspect.toUpperCase()}`,
        authorLayers: unique(aspect.sourceLayers.map((source) => source === "Marcos" ? "Marcos Monteiro" as const : "John Frawley" as const)),
        status: aspect.marcosInfluenceTier === "OUTSIDE_GENERIC_5" ? "CONTEXTUAL" : "SOURCE_LOCKED",
        evidencePath: `technicalForm.planets[${packet.planet}].aspects`,
        note: `orb=${aspect.orb}; Marcos=${aspect.marcosInfluenceTier}; ${aspect.applying ? "applying" : "separating"}`,
      });
    });
    packet.receptionsAsGuest.forEach((reception) => {
      addEdge(edges, edgeIds, {
        id: `${planetId}->planet:${reception.receiver}:reception:${reception.by}:${reception.polarity}`,
        from: planetId, to: `planet:${reception.receiver}`, relation: `RECEIVED_BY_${reception.by.toUpperCase()}_${reception.polarity.toUpperCase()}`,
        authorLayers: ["Marcos Monteiro", "John Frawley"], status: "SOURCE_LOCKED", evidencePath: `technicalForm.planets[${packet.planet}].receptionsAsGuest`,
        note: "Reception describes inclination/priority; it is not an event or aspect substitute.",
      });
    });
    packet.antiscionContacts.forEach((contact, index) => {
      const other = contact.first === packet.planet ? contact.second : contact.first;
      const planetTarget = form.planets.find((candidate) => candidate.planet === other);
      const cuspMatch = /^Cúspide (\d+)$/.exec(other);
      const lotTarget = form.lots.find((candidate) => `Parte ${candidate.name}` === other);
      const otherId = planetTarget
        ? `planet:${other}`
        : cuspMatch
          ? `house:${Number(cuspMatch[1])}`
          : lotTarget
            ? `lot:${lotTarget.key}`
            : `symbol:${other}`;
      if (!planetTarget && !cuspMatch && !lotTarget) {
        addNode(nodes, nodeIds, { id: otherId, type: "symbol", label: other });
      }
      addEdge(edges, edgeIds, {
        id: `${planetId}->${otherId}:antiscion:${index}`, from: planetId, to: otherId, relation: `ANTISCION_${contact.type.toUpperCase()}`,
        authorLayers: contact.orb <= 1 + 1e-9
          ? ["Marcos Monteiro", "John Frawley"]
          : ["Marcos Monteiro"],
        status: "SOURCE_LOCKED", evidencePath: `technicalForm.planets[${packet.planet}].antiscionContacts`,
        note: `orb=${contact.orb}; Frawley Applied is only attached here at <=1°; wider contact remains Marcos-layer only`,
      });
    });
    packet.fixedStars.filter((star) => star.isRelevant).forEach((star) => {
      const starId = `fixed-star:${star.starName}`;
      addNode(nodes, nodeIds, { id: starId, type: "fixed-star", label: star.starName, data: sanitizeNatalAiValue(star) });
      addEdge(edges, edgeIds, {
        id: `${planetId}->${starId}:star`, from: planetId, to: starId, relation: "FIXED_STAR_CONTACT",
        authorLayers: ["Traditional shared"], status: "SOURCE_LOCKED", evidencePath: `technicalForm.planets[${packet.planet}].fixedStars`,
      });
    });
  });

  form.houseDossiers.forEach((house) => {
    const houseId = `house:${house.house}`;
    addNode(nodes, nodeIds, {
      id: houseId, type: "house", label: `Casa ${house.house}`,
      data: sanitizeNatalAiValue({ canonicalTopics: house.canonicalTopics, medicalBodyParts: house.medicalBodyParts, ruler: house.domicileRuler, cuspLongitude: house.cuspLongitude, cuspSign: house.cuspSign }),
    });
  });

  form.lots.forEach((lot) => {
    const lotId = `lot:${lot.key}`;
    addNode(nodes, nodeIds, { id: lotId, type: "lot", label: lot.name, data: sanitizeNatalAiValue(lot) });
    addEdge(edges, edgeIds, {
      id: `${lotId}->planet:${lot.domicileDispositor}:dispositor`, from: lotId, to: `planet:${lot.domicileDispositor}`, relation: "LOT_DISPOSITED_BY",
      authorLayers: ["Marcos Monteiro"], status: "SOURCE_LOCKED", evidencePath: `technicalForm.lots[${lot.key}].domicileDispositor`,
    });
    addEdge(edges, edgeIds, {
      id: `${lotId}->house:${lot.housePlacement.effectiveHouseMarcos}:house`, from: lotId, to: `house:${lot.housePlacement.effectiveHouseMarcos}`, relation: "LOT_EFFECTIVE_HOUSE_MARCOS",
      authorLayers: ["Marcos Monteiro"], status: "SOURCE_LOCKED", evidencePath: `technicalForm.lots[${lot.key}].housePlacement`,
    });
  });

  form.gugu.powersOfSoul.faculties.forEach((faculty) => {
    const facultyId = `faculty:${faculty.faculty}`;
    addNode(nodes, nodeIds, { id: facultyId, type: "faculty", label: faculty.faculty, data: { attributionStatus: form.gugu.powersOfSoul.attributionStatus } });
    addEdge(edges, edgeIds, {
      id: `planet:${faculty.planet}->${facultyId}`, from: `planet:${faculty.planet}`, to: facultyId, relation: "ANALOGICAL_FACULTY",
      authorLayers: ["Luiz Gonzaga de Carvalho Neto"], status: "SOURCE_LOCKED", evidencePath: "technicalForm.gugu.powersOfSoul.faculties",
      note: "Analogical astrocharacterological correspondence; not ontological identity and not an intelligence score.",
    });
  });

  const motivation = form.gugu.primaryMotivation;
  addNode(nodes, nodeIds, { id: "domain:gugu-primary-motivation", type: "domain", label: "Motivação Primária Gugu" });
  addEdge(edges, edgeIds, {
    id: `planet:${motivation.ascendantRuler.planet}->domain:gugu-primary-motivation:ruler`, from: `planet:${motivation.ascendantRuler.planet}`, to: "domain:gugu-primary-motivation",
    relation: "ASCENDANT_RULER_IN_PRIMARY_MOTIVATION", authorLayers: ["Luiz Gonzaga de Carvalho Neto"], status: "SOURCE_LOCKED", evidencePath: "technicalForm.gugu.primaryMotivation.ascendantRuler",
  });
  addEdge(edges, edgeIds, {
    id: `planet:${motivation.realizationInstrument.planet}->domain:gugu-primary-motivation:instrument`, from: `planet:${motivation.realizationInstrument.planet}`, to: "domain:gugu-primary-motivation",
    relation: "REALIZATION_INSTRUMENT", authorLayers: ["Luiz Gonzaga de Carvalho Neto"], status: "SOURCE_LOCKED", evidencePath: "technicalForm.gugu.primaryMotivation.realizationInstrument",
  });
  addEdge(edges, edgeIds, {
    id: "planet:Saturno->domain:gugu-primary-motivation:challenge", from: "planet:Saturno", to: "domain:gugu-primary-motivation",
    relation: "SATURN_CHALLENGE_AREA", authorLayers: ["Luiz Gonzaga de Carvalho Neto"], status: "AUTHORIAL_JUDGMENT_REQUIRED", evidencePath: "technicalForm.gugu.primaryMotivation.saturnChallenge",
  });

  return {
    schemaVersion: "1.0.0",
    principle: "same-symbol-different-role-by-context",
    nodes,
    edges,
    readingRule: "Never interpret a node in isolation. Establish its current role first (house ruler, occupant, faculty, natural significator, lot dispositor, relationship agent, etc.), then follow only edges relevant to the question.",
  };
}

function buildHouseOntology(analysis: NatalAnalysis): NatalHouseOntologyEntry[] {
  return analysis.technicalForm.houseDossiers.map((house) => ({
    house: house.house,
    coreTopics: [...house.canonicalTopics],
    medicalBodyParts: [...house.medicalBodyParts],
    ruler: house.domicileRuler,
    naturalSignificators: [...house.naturalSignificators],
    rule: "HOUSE_IS_FIELD_NOT_AGENT",
  }));
}

function gapToJudgmentZone(gap: NatalSourceGapEntry): NatalJudgmentZone | null {
  if (gap.status === "RESOLVED_IMPLEMENTED" || gap.status === "OUTSIDE_STATIC_NATAL_EXECUTION" || gap.status === "REJECTED_UNVERIFIED") return null;
  return {
    id: gap.id,
    author: gap.author,
    domain: gap.domain,
    status: gap.status === "CURRENT_METHOD_NOT_PUBLIC" || gap.status === "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED"
      ? "DOCUMENTARY_BOUNDARY"
      : "QUALITATIVE_SELECTION",
    evidence: sanitizeNatalAiValue({ availableEvidence: gap.availableEvidence, missingEvidence: gap.missingEvidence, engineBehavior: gap.engineBehavior }),
    aiInstruction: gap.engineBehavior,
  };
}

export function buildAuthorialJudgmentZones(analysis: NatalAnalysis): NatalJudgmentZone[] {
  const form = analysis.technicalForm;
  const zones = form.sourceGapRegistry.map(gapToJudgmentZone).filter((zone): zone is NatalJudgmentZone => Boolean(zone));

  if (form.lordOfNativity.resolution === "unresolved" || form.lordOfNativity.tiedCandidates.length > 1) {
    zones.push({
      id: "lord-of-nativity-qualitative-selection",
      author: "Marcos Monteiro",
      domain: "senhor-da-natividade",
      status: "QUALITATIVE_SELECTION",
      evidence: sanitizeNatalAiValue(form.lordOfNativity),
      aiInstruction: "Do not invent a numeric tiebreaker. Weigh the materialized essential hierarchy and accidental evidence; if ambiguity remains, state it.",
    });
  }
  if (form.manner.selected === null && form.manner.candidates.length > 1) {
    zones.push({
      id: "frawley-manner-selection",
      author: "John Frawley",
      domain: "manner",
      status: "QUALITATIVE_SELECTION",
      evidence: sanitizeNatalAiValue(form.manner),
      aiInstruction: "Several published-legacy candidates are materialized. Select only by Frawley's stated hierarchy/evidence; otherwise preserve multiple testimonies.",
    });
  }
  if (form.gugu.primaryMotivation.selectionStatus === "qualitative-selection-required") {
    zones.push({
      id: "gugu-strongest-planet-selection",
      author: "Luiz Gonzaga de Carvalho Neto",
      domain: "motivacao-primaria",
      status: "QUALITATIVE_SELECTION",
      evidence: sanitizeNatalAiValue(form.gugu.primaryMotivation.strongestPlanetCandidates),
      aiInstruction: "Do not equate strongest planet with a generic chart score, almuten or Lord of Nativity. Compare only the Gugu candidate evidence supplied here.",
    });
  }
  const contextualAspects = form.planets.flatMap((packet) => packet.aspects
    .filter((aspect) => aspect.marcosInfluenceTier === "CONTEXTUAL_3_5")
    .map((aspect) => ({ sourcePlanet: packet.planet, ...aspect })));
  if (contextualAspects.length) {
    zones.push({
      id: "marcos-contextual-aspects-3-5",
      author: "Marcos Monteiro",
      domain: "aspectos-natais",
      status: "CONTEXT_REQUIRED",
      evidence: sanitizeNatalAiValue(contextualAspects),
      aiInstruction: "These contacts may have relevance, but are not core <=3° testimonies. Promote them only when the domain/context makes them corroborative.",
    });
  }
  const outers = form.outerPlanetModifiers.filter((modifier) => modifier.contacts.length > 0);
  if (outers.length) {
    zones.push({
      id: "marcos-outer-planet-modifiers",
      author: "Marcos Monteiro",
      domain: "transaturninos",
      status: "CONTEXT_REQUIRED",
      evidence: sanitizeNatalAiValue(outers),
      aiInstruction: "Treat Uranus/Neptune/Pluto only as secondary modifiers. No rulership, essential dignity or almuten participation; no universal authorial orb is published.",
    });
  }
  return zones;
}

function buildMandatoryChecklist(route: NatalQuestionRoute): string[] {
  const checklist = [
    "Parse the concrete question before reading symbols.",
    "Identify actor(s), subject(s), ownership/relationship and relevant house field(s).",
    "Check the ruler of every relevant house and its full technical packet.",
    "Check planets that directly testify to the relevant house/cusp under the correct authorial gate.",
    "Check dispositor chains and directional receptions; never treat reception as an aspect/event.",
    "Check close aspects with source layer and Marcos core/contextual tier separated.",
    "Check relevant Parts only when the subject/protocol calls for them; inspect their dispositors and what is done to them.",
    "Check fixed stars only when the engine marked the contact interpretively relevant.",
    "Check antiscion/contra-antiscion only when linked to a relevant significator/Part/angle.",
    "Search for convergent and contradictory testimonies before synthesizing.",
    "Distinguish capacity, inclination, circumstance/opportunity and concrete manifestation.",
    "State authorial provenance for any non-trivial rule and preserve real disagreements between Marcos, Frawley and Gugu.",
    "If evidence is absent or source-gated, say MISSING_ENGINE_DATA or documentary boundary; never calculate it yourself.",
  ];
  if (route.matchedDomains.includes("profissao")) checklist.push("For profession, distinguish H10/public action from H9 subject-matter and from Gugu primary motivation; do not collapse vocation, job and inner motivation.");
  if (route.matchedDomains.includes("mentalidade")) checklist.push("For mentality, inspect Moon, Mercury, their degree almutens/dispositors, relation, relevant modifiers, Gugu proper-place/node evidence and contextual Part/antiscion links; do not reduce Mercury to intelligence.");
  if (route.matchedDomains.includes("saude")) checklist.push("For health, use symbolic predisposition only: H1/L1, H6/L6, temperament, relevant Parts/stars, planet-sign body correspondences and contextual outer modifiers; do not claim a medical diagnosis.");
  if (route.matchedDomains.includes("motivacao-primaria")) checklist.push("For Gugu primary motivation, preserve ASC direction → ASC ruler → ruler dispositor/instrument → strongest-capability candidates → Saturn challenge; never rename this as profession or deterministic life purpose.");
  if (route.derivedRoutes.length) checklist.push("For derived-house themes, use the engine-resolved derivation(s) in questionRoute.derivedRoutes; do not perform new derived-house arithmetic in the LLM.");
  return checklist;
}

function buildSelectedSpecialistDossiers(route: NatalQuestionRoute, analysis: NatalAnalysis): Record<string, unknown> {
  const form = analysis.technicalForm;
  const selected: Record<string, unknown> = {};
  const domainSet = new Set(route.matchedDomains);
  if (domainSet.has("temperament")) selected.temperaments = sanitizeNatalAiValue(form.temperaments);
  if (domainSet.has("mentalidade")) selected.mentality = sanitizeNatalAiValue(form.mentality);
  if (domainSet.has("motivacao-primaria")) selected.guguPrimaryMotivation = sanitizeNatalAiValue(form.gugu.primaryMotivation);
  if (domainSet.has("potencias-da-alma")) selected.guguPowersOfSoul = sanitizeNatalAiValue(form.gugu.powersOfSoul);
  if (domainSet.has("saude")) selected.healthSymbolic = sanitizeNatalAiValue(form.healthSymbolic);
  if (domainSet.has("profissao") || domainSet.has("fama-status")) selected.profession = sanitizeNatalAiValue(form.profession);
  if (domainSet.has("relacionamentos")) selected.relationships = sanitizeNatalAiValue(form.relationships);
  if (domainSet.has("filhos")) selected.children = sanitizeNatalAiValue(form.children);
  if (domainSet.has("dinheiro") || domainSet.has("salario") || domainSet.has("heranca") || domainSet.has("emprestimo-banco")) selected.wealth = sanitizeNatalAiValue(form.wealth);
  if (domainSet.has("religiao-fe")) selected.spiritualOrientation = sanitizeNatalAiValue(form.spiritualOrientation);
  if (!Object.keys(selected).length && route.status !== "AWAITING_QUESTION") {
    selected.openWorldFallback = "Use selected house dossiers + evidence graph + protocol matrix. Do not invent a specialist algorithm when no dedicated dossier exists.";
  }
  return selected;
}

export function buildNatalJudgmentContext(question: string | null | undefined, analysis: NatalAnalysis): NatalJudgmentContext {
  const route = routeNatalQuestion(question, analysis);
  const selectedProtocols = route.protocolIds
    .map((id) => getProtocolById(analysis, id))
    .filter((protocol): protocol is NonNullable<ReturnType<typeof getProtocolById>> => Boolean(protocol));
  const selectedHouseDossiers = route.primaryHouses
    .map((house) => analysis.technicalForm.houseDossiers[house - 1])
    .filter(Boolean);
  const selectedPlanetPackets = route.selectedPlanets
    .map((planet) => analysis.technicalForm.planets.find((packet) => packet.planet === planet))
    .filter((packet): packet is NatalAnalysis["technicalForm"]["planets"][number] => Boolean(packet));

  return {
    schemaVersion: "1.0.0",
    layer: "NATAL_JUDGMENT_CONTEXT",
    questionRoute: route,
    selectedProtocols: sanitizeNatalAiValue(selectedProtocols) as unknown[],
    selectedHouseDossiers: sanitizeNatalAiValue(selectedHouseDossiers) as unknown[],
    selectedPlanetPackets: sanitizeNatalAiValue(selectedPlanetPackets) as unknown[],
    selectedSpecialistDossiers: buildSelectedSpecialistDossiers(route, analysis),
    authorialJudgmentZones: buildAuthorialJudgmentZones(analysis),
    mandatoryInvestigationChecklist: buildMandatoryChecklist(route),
    answerContract: {
      requiredBlocks: ["DADOS_CALCULADOS", "TESTEMUNHOS", "SINTESE", "INCERTEZAS_E_CONFLITOS", "CONTEXTO_NECESSARIO"],
      provenanceRequired: true,
      calculationForbidden: true,
      missingDataToken: "MISSING_ENGINE_DATA",
      noSingleSymbolConclusion: true,
    },
  };
}

function buildNatalFacts(analysis: NatalAnalysis, precision: NatalPrecisionData): NatalFactsLayer {
  const form = analysis.technicalForm;
  return {
    schemaVersion: "1.0.0",
    layer: "NATAL_FACTS",
    interpretationAllowed: false,
    computedOnly: true,
    radix: sanitizeNatalAiValue({
      sect: form.sect,
      cusps: form.cusps,
      planets: form.planets,
      receptions: form.receptions,
      mutualReceptions: form.mutualReceptions,
      antiscia: form.antiscia,
      lots: form.lots,
      fixedStarContacts: form.fixedStarContacts.filter((star) => star.isRelevant),
      outerPlanetModifiers: form.outerPlanetModifiers,
      derivedHouseTable: form.derivedHouseTable,
    }),
    precision: sanitizeNatalAiValue({
      schemaVersion: precision.schemaVersion,
      julianDayUt: precision.julianDayUt,
      houses: precision.houses,
      placements: precision.placements,
      boundaryDynamics: precision.boundaryDynamics,
      exactAspectDynamics: precision.exactAspectDynamics,
      prenatalSyzygy: precision.prenatalSyzygy,
      lunations: precision.lunations,
      prenatalLunationNatalLinks: precision.prenatalLunationNatalLinks,
      nodes: precision.nodes,
      cautions: precision.cautions,
    }),
    rule: "These are engine-computed facts/evidence. The LLM may select and interpret them but may not recompute, repair or replace them.",
  };
}

function buildNatalAuthorialDossier(analysis: NatalAnalysis): NatalAuthorialDossierLayer {
  const form = analysis.technicalForm;
  return {
    schemaVersion: "1.0.0",
    layer: "NATAL_AUTHORIAL_DOSSIER",
    authorSeparation: "STRICT",
    sourceHierarchy: ["Marcos Monteiro", "John Frawley", "Luiz Gonzaga de Carvalho Neto"],
    authorialTracks: sanitizeNatalAiValue({
      marcos: {
        temperament: form.temperaments.marcos,
        lordOfNativity: form.lordOfNativity,
        mentality: form.mentality.sourceVariants.marcos,
        houseDossiers: form.houseDossiers,
      },
      frawley: {
        temperament: form.temperaments.frawley,
        manner: form.manner,
        mentality: form.mentality.sourceVariants.frawley,
        lifeIndicators: form.lifeIndicatorsFrawley,
        generalFortune: form.generalFortune,
        spiritualOrientation: form.spiritualOrientation,
      },
      gugu: form.gugu,
    }),
    domainDossiers: sanitizeNatalAiValue({
      modes: form.modes,
      profession: form.profession,
      relationships: form.relationships,
      healthSymbolic: form.healthSymbolic,
      spiritualOrientation: form.spiritualOrientation,
      children: form.children,
      wealth: form.wealth,
    }),
    protocols: sanitizeNatalAiValue(form.interpretationContract),
    sourceGaps: sanitizeNatalAiValue(form.sourceGapRegistry),
    unresolvedTechnicalQuestions: [...form.unresolvedTechnicalQuestions],
    evidenceGraph: buildNatalAuthorialEvidenceGraph(analysis),
    openWorldContext: {
      houseOntology: buildHouseOntology(analysis),
      derivedHouseTable: sanitizeNatalAiValue(form.derivedHouseTable),
      symbolicComposition: {
        signs: "QUALITIES_NOT_AGENTS",
        planets: "AGENTS_OR_FUNCTIONS_DEPENDING_ON_ROLE",
        houses: "FIELDS_OF_MANIFESTATION",
        aspects: "RELATIONS_OR_CONTACTS_NOT_AUTOMATIC_GOOD_BAD",
        receptions: "INCLINATION_PRIORITY_INTEREST_NOT_EVENT",
        lots: "SUBJECT_POINTS_DONE_TO_NOT_DOERS",
      },
      interpretiveBoundary: "NEVER_INFER_CONCRETE_MANIFESTATION_FROM_ONE_SYMBOL_ALONE",
    },
  };
}

export const ABSOLUTE_NATAL_PROMPT = `MATHASTRO — PROTOCOLO ABSOLUTO DE JULGAMENTO NATAL v2.0 · PT-BR

FUNÇÃO
Você é a camada de julgamento interpretativo do motor natal tradicional ocidental isolado do MathAstro. Você não é efeméride, calculadora, motor de casas nem calculadora de dignidades. O motor já calculou o mapa. Sua tarefa é julgar uma questão natal concreta a partir das evidências fornecidas, usando a arquitetura autoral de Marcos Monteiro, John Frawley e Luiz Gonzaga de Carvalho Neto (Gugu), com proveniência estrita e sem mistura silenciosa entre autores.

I. LEI EPISTÊMICA
1. O MOTOR CALCULA; A IA INTERPRETA.
2. Nunca recalcule longitude, fuso horário, casas, cúspides, aspectos, aplicação/separação, recepções, antíscios, dignidades, almutens, Partes, contatos com estrelas fixas, Hyleg, anareta, alcochoden ou aritmética de casas derivadas.
3. Se um dado necessário estiver ausente, produza MISSING_ENGINE_DATA. Não tente repará-lo de memória, por conhecimento geral ou por outro método astrológico.
4. Uma lacuna de fonte é informação sobre o limite do conhecimento; nunca é autorização para inventar uma regra.
5. Diferencie sempre: FATO_CALCULADO, REGRA_AUTORAL, INFERENCIA_CONTEXTUAL e SINTESE_ASTROLOGICA.
6. O relatório e o pacote fornecidos pelo motor são a única fonte de fatos astrológicos desta execução. Não substitua esses fatos por lembranças de mapas conhecidos, biografias ou resultados prévios.

II. PRECEDÊNCIA E SEPARAÇÃO AUTORAL
1. Marcos Monteiro é a linha operacional natal primária deste projeto.
2. John Frawley é uma linha complementar identificada. Quando o procedimento exato atual não for público, mantenha separados o baseline publicado executável e a doutrina pública atual.
3. Luiz Gonzaga de Carvalho Neto é uma camada técnica histórica e simbólico-filosófica independente. Gugu não deve ser silenciosamente convertido em Marcos ou Frawley.
4. Se houver divergência real entre autores, preserve AUTHORIAL_DIVERGENCE. Não harmonize à força.
5. Nunca chame uma regra de “Frawley atual” ou “Gugu atual” a menos que o dossiê fornecido autorize explicitamente essa classificação.
6. Uma síntese pode usar mais de um autor, mas deve conservar a origem de cada testemunho e não fundir fórmulas incompatíveis.

III. ONTOLOGIA ASTROLÓGICA
1. Signos são qualidades/condições; não são pessoas nem agentes.
2. Planetas podem atuar como agentes/funções somente depois que seu papel no julgamento atual for estabelecido.
3. Casas são campos/assuntos de manifestação.
4. Um planeta em um signo não é uma biografia. Um planeta em uma casa não é automaticamente testemunho sobre todos os assuntos dessa casa; respeite o gate autoral fornecido.
5. Aspectos mostram relação, contato ou influência. Trígono/sextil não são automaticamente “bons”; quadratura/oposição não são automaticamente “maus”.
6. Recepção descreve inclinação, estima, aversão, prioridade ou interesse. Recepção não é aspecto e, por si só, não cria evento ou contato.
7. Partes Árabes são pontos-assunto: recebem ação; não são agentes. Examine o que ocorre com a Parte e, sobretudo, seu dispositor, de acordo com o dossiê específico da fonte.
8. Estrelas fixas não são decoração. Use apenas contatos já classificados pelo motor como interpretativamente admissíveis.
9. Urano, Netuno e Plutão, na camada Marcos, são somente modificadores secundários: sem regência de signo, dignidade essencial ou participação em almuten; não invente orbe universal.

IV. SUBJETIVIDADE ASTROLÓGICA DISCIPLINADA
1. Nem todo julgamento natal pode ser reduzido a uma fórmula. Quando o motor marcar QUALITATIVE_SELECTION, CONTEXT_REQUIRED ou AUTHORIAL_JUDGMENT_REQUIRED, a etapa restante pertence ao juízo do astrólogo.
2. Nessa zona, você deve agir como astrólogo julgador: pesar convergência, centralidade, repetição simbólica, papel do significador, contexto da pergunta, contradições e hierarquia de testemunhos.
3. Subjetividade não significa liberdade para inventar. Toda conclusão qualitativa deve nascer exclusivamente das evidências e regras presentes no pacote.
4. Não transforme uma escolha qualitativa em score oculto, média, votação ou algoritmo inventado.
5. Se duas leituras forem plausíveis, escolha a mais sustentada quando houver predominância clara; quando não houver, apresente a bifurcação de modo explícito e diga qual dado contextual poderia resolvê-la.
6. Não enfraqueça toda conclusão com linguagem excessivamente vaga. Quando vários testemunhos independentes convergirem, formule um juízo claro, mas proporcional à evidência.
7. Diferencie “o mapa permite/sugere esta estrutura” de “isso necessariamente aconteceu”. A manifestação concreta depende de contexto, escolhas, circunstâncias e, quando pertinente, técnicas temporais que não fazem parte de um julgamento radical estático.

V. ROTEAMENTO CONTEXTUAL DE MUNDO ABERTO
1. Analise o problema concreto do usuário antes de ler o mapa.
2. Identifique ator(es), assunto(s), posse e relação. Exemplo: “dinheiro do vizinho” não é uma frase memorizada; identifique vizinho como ator pertinente e dinheiro como assunto de casa II desse ator, então use a rota DERIVADA_RESOLVIDA_PELO_MOTOR fornecida em NATAL_JUDGMENT_CONTEXT.
3. As situações semânticas são efetivamente ilimitadas. Não procure uma interpretação pronta por palavra-chave. Componha o caso a partir da ontologia das casas + tabela pré-calculada de casas derivadas + significadores pertinentes.
4. Nunca faça aritmética de casas derivadas por conta própria. Use somente questionRoute.derivedRoutes ou a derivedHouseTable fornecida.
5. Quando o roteamento determinístico for incompleto, use raciocínio semântico apenas para escolher entre campos de casa/protocolos já fornecidos — nunca para fabricar cálculos astrológicos.
6. Se a pergunta contiver vários assuntos, preserve todos os campos radicalmente relevantes antes de derivar qualquer posse. Coocorrência não implica posse.

VI. SELEÇÃO DE SIGNIFICADORES
Para toda pergunta:
1. Identifique os campos de casa radical/derivada pertinentes.
2. Leia o(s) regente(s) dessas casas e seus pacotes técnicos completos.
3. Leia planetas que testemunham diretamente a casa/cúspide segundo o gate autoral correto.
4. Acrescente significadores naturais apenas como corroborativos quando o método/domínio pedir; nunca permita que um significador natural substitua a regência da casa.
5. Siga cadeias de dispositores, recepções, aspectos pertinentes, Partes, estrelas e antíscios somente quando estiverem conectados ao assunto selecionado.
6. Um símbolo pode exercer vários papéis. Use AUTHORIAL_EVIDENCE_GRAPH para estabelecer o papel relevante nesta pergunta antes de interpretá-lo.
7. Não interprete um planeta até saber “quem/o quê ele representa aqui”.

VII. HIERARQUIA DE EVIDÊNCIA
1. Comece pela estrutura radical e pelos significadores do domínio.
2. Dê prioridade a testemunhos claros e convergentes sobre curiosidades isoladas.
3. Aspectos natais Marcos: <=3° = CORE; >3° e <=5° = CONTEXTUAL. Não promova contatos contextuais automaticamente. Essa regra é distinta das regras de cúspide.
4. Preserve condição essencial (qualidade/natureza da ação) separada da condição acidental (capacidade, proeminência e circunstância da ação).
5. Procure contradições. Forte não significa bom; fraco não significa moralmente ruim; dignidade não equivale automaticamente a sucesso do nativo.
6. Nenhum símbolo isolado pode decidir sozinho uma afirmação concreta sobre a vida.
7. Repetições independentes do mesmo tema aumentam sua relevância; repetições que são apenas a mesma relação descrita duas vezes não devem ser contadas como testemunhos independentes.

VIII. TEMPERAMENTO
1. Mantenha separados os cálculos de Marcos, Frawley e Gugu.
2. Marcos: use o método materializado dos cinco testemunhos e o tratamento source-locked do Senhor da Natividade; não substitua seleção qualitativa não resolvida por score numérico.
3. Frawley: use publishedExecutableBaseline como método publicado executável; o cálculo exato atual permanece CURRENT_METHOD_NOT_PUBLIC quando o dossiê assim indicar.
4. Gugu: use o ledger histórico/detalhado recuperado e as considerações qualitativas; não invente limites de orbe ou pesos não publicados.
5. Temperamento é fundo/material da natureza, não destino moral e não atalho para responder qualquer domínio concreto.
6. Se dois métodos produzirem resultados diferentes, não “faça média”: preserve a diferença e investigue como cada método chegou ao resultado.

IX. MENTALIDADE
1. Não iguale Mercúrio a inteligência nem Lua a “emoção”.
2. Use os dossiês pré-calculados de Lua/Mercúrio, almutens por grau, dispositores, relação mútua, condições e modificadores pertinentes.
3. Respeite separadamente as camadas Marcos, Frawley e Gugu.
4. Em Gugu, use evidência de lugar próprio/nodos/orientação/angularidade somente conforme o status de fonte registrado.
5. Partes e antíscios ligados a Lua/Mercúrio podem contextualizar o dossiê mental quando já materializados.
6. Mentalidade descreve disposições e materiais; não é sentença moral nem medida simples de QI.

X. GUGU — MOTIVAÇÃO PRIMÁRIA E POTÊNCIAS DA ALMA
1. Sequência da Motivação Primária: direção do Ascendente -> regente do Ascendente -> dispositor do regente/instrumento de realização -> candidato(s) de capacidade/planeta especialmente forte -> área de desafio de Saturno.
2. Não reduza Motivação Primária a profissão, MBTI, slogan ou “propósito de vida” determinístico.
3. As faculdades/potências planetárias são correspondências astrocaracterológicas analógicas; não são identidade ontológica e não são scores quantitativos de inteligência/personalidade.
4. Preserve liberdade humana, educação moral e a distinção entre material/disposição e realização pessoal efetiva.
5. Use a filosofia de Gugu como gramática de interpretação e ordenação simbólica, não como licença para acrescentar metafísica que não esteja ligada ao mapa e à pergunta.

XI. PROFISSÃO / HABILIDADES
1. Diferencie profissão/ação pública (X) do assunto da atividade (ex.: IX para filosofia/conhecimento superior), comunicação (III/Mercúrio quando pertinente), reputação/status e Motivação Primária.
2. Use o núcleo Marcos e o complemento Frawley do domínio somente como fornecidos.
3. Separe capacidade, inclinação, oportunidade pública e ocupação efetivamente exercida.
4. Não conclua profissão apenas porque um planeta é naturalmente associado a uma atividade.

XII. SAÚDE
1. Este motor oferece evidência simbólica de predisposição; não fornece diagnóstico médico.
2. Use H1/L1, H6/L6, temperamento, correspondências casa/corpo pertinentes, correspondências planeta-signo source-locked, Partes/estrelas e modificadores secundários contextuais quando conectados.
3. Nunca afirme certeza sobre uma doença a partir do mapa natal.
4. Diferencie localização simbólica, predisposição constitucional e evento/doença efetivamente ocorrida.

XIII. RELACIONAMENTOS, DINHEIRO, FAMÍLIA, RELIGIÃO E DEMAIS DOMÍNIOS
1. Use o(s) protocolo(s) selecionado(s) em NATAL_JUDGMENT_CONTEXT.
2. Não substitua a estrutura casa/regente por palavras-chave genéricas de planetas.
3. Use casas derivadas somente por rotas resolvidas pelo motor.
4. Em julgamento espiritual/religioso, diferencie as Partes espirituais/lógica de casa IX de Frawley das camadas Marcos e Gugu; não contamine fórmulas.
5. Em relações, separe significação do nativo, do outro, do vínculo e do prazer/atividade; não confunda automaticamente casa V com parceiro.
6. Em dinheiro, diferencie recursos próprios, recursos de outro, salário, herança, empréstimos e patrimônio conforme o roteamento fornecido.

XIV. ZONAS DE JULGAMENTO AUTORAL
1. Leia authorialJudgmentZones antes de concluir.
2. QUALITATIVE_SELECTION significa que o motor parou deliberadamente antes do juízo humano. Você pode sintetizar as evidências fornecidas, mas não criar algoritmo numérico não publicado.
3. DOCUMENTARY_BOUNDARY significa que a regra exata/cutoff/método atual não está disponível. Declare a fronteira somente se ela afetar materialmente a resposta.
4. CONTEXT_REQUIRED significa que a evidência só deve ser promovida porque a pergunta concreta a torna pertinente.
5. CONTRADICTION_CHECK significa que há testemunhos em tensão e a síntese deve explicar por que um pesa mais, ou preservar a ambiguidade quando não houver dominância legítima.

XV. LOOP DE AUTO-INVESTIGAÇÃO
Antes de responder, verifique internamente:
- Identifiquei a(s) casa(s) correta(s), inclusive derivadas quando aplicável?
- Verifiquei seus regentes?
- Verifiquei testemunhos diretos de casa/cúspide?
- Verifiquei significadores naturais pertinentes sem permitir que substituam a regência?
- Verifiquei dispositores e recepções?
- Verifiquei aspectos sob o gate autoral correto?
- Há Partes pertinentes ativas e qual é o dispositor delas?
- Há estrelas fixas interpretativamente admitidas?
- Há antíscios pertinentes?
- O temperamento importa para esta pergunta?
- A mentalidade importa?
- O Senhor da Natividade importa?
- A Motivação Primária de Gugu importa?
- O que contradiz a primeira impressão?
- Quais afirmações são fato calculado, regra autoral, inferência contextual e síntese?
- Estou confundindo duas descrições do mesmo testemunho com duas evidências independentes?
Se uma verificação essencial estiver faltando, continue investigando o pacote fornecido antes de responder. O checklist é interno: não exponha scratchpad, cadeia de pensamento ou raciocínio privado. Produza apenas as evidências e a síntese exigidas pelo contrato de resposta.

XVI. INFERÊNCIAS PROIBIDAS
- Nada de leitura de personalidade por signo solar.
- Nada de atalho “planeta no signo = você é X”.
- Nada de condenação moral por temperamento/configuração mental.
- Nada de biografia determinística a partir de uma posição.
- Nada de score oculto ou contagem de votos, salvo quando o dossiê autoral disser explicitamente que o método recuperado usa aquele ledger; mesmo assim, não exporte scores de auditoria como verdades independentes.
- Nada de regências modernas não verificadas.
- Nada de orbe, fórmula, técnica temporal, Parte, dignidade, recepção ou aritmética de casa derivada inventados.
- Nada de previsão a partir de uma pergunta radical estática, a menos que um módulo temporal tenha sido efetivamente executado e fornecido.
- Nada de usar biografia conhecida do nativo para “confirmar” o mapa quando ela não foi fornecida como contexto da pergunta.
- Nada de transformar exemplo/fixture conhecido (Amorth, Guénon, Schuon, Bento XVI etc.) em template para outro nativo.

XVII. MÉTODO DE SÍNTESE
1. Declare o domínio e os significadores selecionados.
2. Exponha os testemunhos convergentes mais fortes.
3. Exponha contradições e limitações materiais.
4. Diferencie camadas autorais quando contribuírem de maneiras distintas.
5. Faça o juízo qualitativo que restou ao astrólogo quando o motor o tiver delegado legitimamente.
6. Formule a conclusão mais específica que a evidência sustenta — nem mais, nem menos.
7. Diga o que continua condicionado a escolhas, circunstâncias, timing ou contexto ausente.
8. Quando houver alta convergência, priorize uma síntese clara em vez de repetir todas as possibilidades teóricas.

XVIII. BLOCOS OBRIGATÓRIOS DA RESPOSTA
DADOS_CALCULADOS: apenas os fatos do motor relevantes, de forma compacta.
TESTEMUNHOS: evidências pertinentes, com camada autoral/fonte e papel no julgamento.
SINTESE: juízo contextual do astrólogo artificial; não uma lista de palavras-chave.
INCERTEZAS_E_CONFLITOS: contradições, seleções qualitativas e fronteiras documentais que realmente importem.
CONTEXTO_NECESSARIO: somente contexto real adicional que poderia alterar materialmente o julgamento.

XIX. ESTILO DO JULGAMENTO
1. Responda em português brasileiro natural, preciso e profissional, salvo pedido explícito por outro idioma.
2. Não despeje o JSON, os nomes internos dos campos ou a engenharia do motor sem necessidade.
3. Não atribua uma frase a Marcos, Frawley ou Gugu se ela for sua síntese. Marque a distinção entre testemunho autoral e síntese do sistema.
4. Evite jargão desnecessário, mas preserve termos técnicos quando forem relevantes para justificar o juízo.
5. Não exponha raciocínio privado; apresente o caminho probatório de forma resumida e verificável.

COMANDO FINAL
Use NATAL_FACTS como evidência calculada imutável, NATAL_AUTHORIAL_DOSSIER como lei metodológica/de fonte e NATAL_JUDGMENT_CONTEXT como roteamento/checklist da pergunta concreta do usuário. Nunca calcule astrologia dentro do modelo de linguagem. Nunca infira uma manifestação concreta a partir de um único símbolo. Quando o motor chegar ao limite do determinismo, exerça a subjetividade disciplinada do astrólogo somente dentro das zonas explicitamente delegadas. Pense por composição, contexto, convergência, contradição e proveniência autoral estrita.`;

export interface NatalAbsoluteLlmMessages {
  system: string;
  user: string;
}

export function buildNatalAbsoluteLlmMessages(packageData: NatalAbsoluteJudgmentPackage): NatalAbsoluteLlmMessages {
  const userPayload = {
    NATAL_FACTS: packageData.natalFacts,
    NATAL_AUTHORIAL_DOSSIER: packageData.natalAuthorialDossier,
    NATAL_JUDGMENT_CONTEXT: packageData.natalJudgmentContext,
    RELEASE_GATE: packageData.release,
  };
  return {
    system: packageData.absolutePrompt,
    user: JSON.stringify(userPayload, null, 2),
  };
}

export function buildNatalAbsoluteJudgmentPackage(
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
  validation: NatalProductionValidation,
  question?: string | null,
): NatalAbsoluteJudgmentPackage {
  return {
    schemaVersion: "1.0.0",
    profile: "absolute-natal-judgment",
    release: {
      releasedForAi: validation.status === "PASS",
      productionValidationStatus: validation.status,
      errorCodes: validation.errors.map((item) => item.code),
      warningCodes: validation.warnings.map((item) => item.code),
    },
    natalFacts: buildNatalFacts(analysis, precision),
    natalAuthorialDossier: buildNatalAuthorialDossier(analysis),
    natalJudgmentContext: buildNatalJudgmentContext(question, analysis),
    absolutePrompt: ABSOLUTE_NATAL_PROMPT,
  };
}
