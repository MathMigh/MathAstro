import type { BirthChart, PlanetType } from "@/interfaces/BirthChartInterfaces";

export type HoraryAuthor = "Marcos Monteiro" | "John Frawley" | "Luiz Gonzaga de Carvalho Neto" | "MathAstro";
export type HorarySourceTier = "primary-current" | "primary-published" | "secondary" | "operational";
export type HorarySeverity = "decisive" | "major" | "minor" | "context" | "warning";
export type HoraryAnswer = "YES" | "NO" | "MIXED" | "UNKNOWN" | "DESCRIPTIVE_ONLY";

export interface HorarySourceRef {
  id: string;
  author: HoraryAuthor;
  tier: HorarySourceTier;
  work: string;
  locator?: string;
  note?: string;
}

export type HoraryTopic =
  | "relationship" | "marriage" | "separation" | "lover"
  | "job_get" | "job_keep" | "job_quality" | "work_relationship" | "career_choice"
  | "money" | "salary" | "debt" | "loan" | "investment" | "tax" | "inheritance" | "bet"
  | "buy_sell" | "property" | "lost_object" | "missing_animal" | "missing_person" | "theft"
  | "lawsuit" | "competition" | "should_i" | "travel" | "travel_profit"
  | "study" | "exam" | "knowledge" | "course"
  | "health" | "illness" | "doctor" | "treatment" | "surgery" | "pregnancy" | "death"
  | "prison" | "release" | "self_undoing" | "hidden_enemy" | "psychic_attack"
  | "wish" | "dream_truth" | "dream_meaning" | "rumour" | "news_truth"
  | "weather" | "public_event" | "adoption"
  | "lottery" | "election" | "government_grant" | "communication" | "service_change" | "delivery" | "authenticity" | "kidnapping"
  | "custom";

export type HoraryIntent =
  | "event" | "state" | "quality" | "location" | "timing" | "truth" | "choice"
  | "recovery" | "quantity" | "cause" | "relationship" | "possession" | "survival" | "release";

export type HoraryCategoryFamily =
  | "self_identity" | "money_possessions" | "communication_truth" | "property_home"
  | "children_pregnancy" | "illness_service_animals" | "relationships_contests_legal"
  | "death_other_money" | "knowledge_travel_dreams" | "career_authority"
  | "gifts_wishes" | "confinement_hidden" | "public_collective" | "meta_custom";

export type HoraryHouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type HoraryHouseSemanticKey =
  "self"
  | "person"
  | "body"
  | "head"
  | "voice"
  | "name"
  | "money"
  | "possessions"
  | "movable_object"
  | "bank_balance"
  | "personal_resources"
  | "sibling"
  | "same_generation_relative"
  | "neighbor"
  | "routine_communication"
  | "sent_message"
  | "local_journey"
  | "elementary_knowledge"
  | "elementary_school"
  | "student"
  | "arms_hands"
  | "father"
  | "parents"
  | "ancestry"
  | "home"
  | "land"
  | "immovable_property"
  | "homeland"
  | "end_of_matter"
  | "verdict"
  | "prognosis"
  | "buried_thing"
  | "chest_lungs"
  | "child"
  | "pregnancy"
  | "sex"
  | "pleasure"
  | "sport"
  | "creative_work"
  | "heart_liver_stomach"
  | "messenger"
  | "illness"
  | "hospital"
  | "subordinate"
  | "employee"
  | "tradesman"
  | "service_provider"
  | "small_animal"
  | "aunt_uncle"
  | "lower_belly_bowels"
  | "spouse"
  | "partner"
  | "lover"
  | "business_partner"
  | "client"
  | "counterparty"
  | "open_enemy"
  | "opponent"
  | "tenant"
  | "treating_doctor"
  | "unrelated_other"
  | "death"
  | "other_person_money"
  | "higher_knowledge"
  | "university"
  | "teacher"
  | "priest"
  | "religion"
  | "foreign_country"
  | "long_journey"
  | "pilgrimage"
  | "dream"
  | "prediction"
  | "astrologer"
  | "learned_person"
  | "career"
  | "job"
  | "boss"
  | "authority"
  | "government"
  | "king"
  | "judge"
  | "mother"
  | "honor_success"
  | "public_action"
  | "property_price"
  | "medical_treatment"
  | "friend"
  | "gift"
  | "hope_wish"
  | "wages"
  | "government_money"
  | "government_gift"
  | "windfall"
  | "advisor"
  | "adoptive_child"
  | "prison"
  | "self_undoing"
  | "hidden_enemy"
  | "temptation"
  | "psychological_problem"
  | "large_animal"
  | "childbed"
  | "garage_stable";

export type HoraryTurningPolicy = "intrinsic" | "usually_radical" | "contextual" | "dual_radical_and_turned";
export type HorarySemanticRelationMode = "auto" | "radical" | "turned";

export interface HoraryHouseSemanticMeaning {
  key: HoraryHouseSemanticKey;
  label: string;
  relativeHouse: HoraryHouseNumber;
  turning: HoraryTurningPolicy;
  sourceIds: string[];
  note?: string;
}

export interface HoraryHouseAtlasEntry {
  house: HoraryHouseNumber;
  principle: string;
  meanings: HoraryHouseSemanticMeaning[];
  sourceIds: string[];
}

export interface HorarySemanticRoleSpec {
  role: string;
  label?: string;
  meaning: HoraryHouseSemanticKey;
  anchorRole?: string;
  relationMode?: HorarySemanticRelationMode;
  rationale?: string;
  sourceIds?: string[];
  primary?: boolean;
}

export interface HorarySemanticAmbiguityCandidate {
  meaning: HoraryHouseSemanticKey;
  anchorRole?: string;
  relationMode?: HorarySemanticRelationMode;
  note?: string;
}

export interface HorarySemanticAmbiguity {
  phrase: string;
  candidates: HorarySemanticAmbiguityCandidate[];
  blocking?: boolean;
}

export interface HoraryCompiledSemanticRole {
  role: string;
  label?: string;
  meaning: HoraryHouseSemanticKey;
  anchorRole: string;
  relationMode: "radical" | "turned";
  relativeHouse: HoraryHouseNumber;
  radicalHouse: number;
  turning: HoraryTurningPolicy;
  rationale: string;
  sourceIds: string[];
  primary: boolean;
}

export interface HorarySemanticFrame {
  atlasVersion: string;
  compiledRoles: HoraryCompiledSemanticRole[];
  houseAssignments: HoraryHouseAssignment[];
  unresolved: string[];
  warnings: string[];
  requiresInterpretiveLayer: true;
  policy: string[];
}

export interface HoraryHousePath {
  /** Casa radical onde começa a cadeia. Ex.: mãe=10. */
  rootHouse: number;
  /** Casas derivadas sucessivas. Ex.: primo da mãe = [3]; dinheiro dele = [3,2]. */
  turns?: number[];
  label?: string;
}

export interface HoraryDynamicRoleSpec {
  role: string;
  label?: string;
  radicalHouse?: number;
  path?: HoraryHousePath;
  rationale: string;
  sourceIds?: string[];
  primary?: boolean;
}

/** Papel cuja significação vem de um planeta natural/explicitamente identificado, sem fingir uma casa. */
export interface HoraryNaturalRoleSpec {
  role: string;
  label?: string;
  planet: PlanetType;
  rationale: string;
  sourceIds?: string[];
  primary?: boolean;
}

export interface HoraryOntologyClassification {
  family: HoraryCategoryFamily;
  intents: HoraryIntent[];
  presetTopic: HoraryTopic;
  composable: boolean;
}

export interface HoraryPersonRef {
  id: string;
  label: string;
  relationToQuerent?: string;
  radicalHouse?: number;
}

export interface HoraryQuestionContext {
  /** A horária nasce quando a pergunta foi compreendida e aceita pelo astrólogo. */
  questionUnderstood?: boolean;
  questionAccepted?: boolean;
  questionBirthNote?: string;
  topic: HoraryTopic;
  concreteQuestion: string;
  background?: string;
  sameSituationSubquestions?: string[];
  querentRole?: string;
  quesitedRole?: string;
  relationToQuerent?: string;
  /** Casa da pessoa/entidade central quando não é o querente. */
  subjectHouse?: number;
  /** Alternativa semântica ao número manual da casa do sujeito. */
  subjectRoleId?: string;
  /** Casa manual do objeto principal, quando o tópico não basta para resolvê-la. */
  relevantHouse?: number;
  sourcePersonHouse?: number;
  sourcePersonRoleId?: string;
  workRelation?: "boss" | "colleague" | "subordinate";
  prisonState?: "free" | "imprisoned" | "release_question";
  desiredObjectTopic?: HoraryTopic;
  dreamNarrative?: string;
  dreamCharacters?: HoraryPersonRef[];
  currentDefault?: string;
  realWorldConstraints?: string[];
  /** Escala plausível fornecida pelo contexto. Ex.: ["dias","semanas","meses"]. */
  timingUnits?: string[];
  /** Evento passado conhecido para calibrar tempo: N graus corresponderam a M unidades. */
  pastTimingCalibration?: { degrees: number; elapsed: number; unit: string; description?: string };
  advancedManualHouses?: Record<string, number>;
  paymentSourceHouse?: number;
  paymentSourceRoleId?: string;
  suspectHouse?: number;
  suspectRoleId?: string;
  animalSize?: "small" | "large";
  organHouse?: number;
  serviceProviderHouse?: number;
  serviceProviderRoleId?: string;
  naturalServicePlanet?: PlanetType;
  contestMode?: "support" | "betting";
  /** Estrutura concreta da competição. Incumbente/desafiante e time×troféu não são I/VII genéricos. */
  competitionStructure?: "head_to_head" | "incumbent_challenger" | "tournament_victory";
  alternatives?: Array<{ id:string; label:string; house?:number; naturalPlanet?:PlanetType; profitHouse?:number }>;
  querentSex?: "male" | "female";
  quesitedSex?: "male" | "female";
  pregnancyState?: "possible" | "confirmed" | "in_labor";
  /** Quando o fato principal é dado pela própria pergunta (ex.: serviço será cortado; pergunta é quando). */
  eventAssumed?: boolean;
  /** O acontecimento físico já terminou; a pergunta busca um resultado ainda desconhecido (ex.: votação encerrada, apuração pendente). */
  eventAlreadyOccurred?: boolean;
  eventTrigger?: { kind:"sign_change"|"cusp_entry"|"cusp_contact"; role?:string; planet?:PlanetType; house?:number; interpretation?:string };
  /** Intenções técnicas da pergunta. Um mesmo mapa pode ter várias: ex. sobrevivência + soltura + timing. */
  intents?: HoraryIntent[];
  /** Papéis compostos por casas derivadas, para não limitar o motor a uma lista finita de perguntas. */
  dynamicRoles?: HoraryDynamicRoleSpec[];
  /** Papéis semânticos de alto nível. A IA/UI resolve a frase humana em relações; o núcleo calcula as casas. */
  semanticRoles?: HorarySemanticRoleSpec[];
  /** Ambiguidades que a camada inteligente não conseguiu resolver. Por padrão bloqueiam canJudge. */
  semanticAmbiguities?: HorarySemanticAmbiguity[];
  /** Papéis naturais/planetários explícitos (ex.: Lua=luz artificial, Mercúrio=internet). */
  naturalRoles?: HoraryNaturalRoleSpec[];
  /** Permite declarar papéis primários em questões compostas/contextuais. */
  primaryRoleIds?: string[];
  positiveOutcomeDefinition?: string;
}

export interface HoraryRequest {
  chart: BirthChart;
  context: HoraryQuestionContext;
}

export interface HoraryHouseAssignment {
  role: string;
  radicalHouse: number;
  derivedFrom?: number;
  derivation?: number;
  rationale: string;
  sourceIds: string[];
}

export interface EssentialCondition {
  domicile: boolean;
  exaltation: boolean;
  triplicity: boolean;
  term: boolean;
  face: boolean;
  detriment: boolean;
  fall: boolean;
  peregrine: boolean;
  dignityRulers: { domicile: string; exaltation?: string; triplicity: string; term: string; face: string };
}

export interface AccidentalCondition {
  house: number;
  angularity: "angular" | "succedent" | "cadent";
  direct: boolean;
  retrograde: boolean;
  swift: boolean;
  slow: boolean;
  cazimi: boolean;
  combust: boolean;
  underSunbeams: boolean;
  distanceFromSun: number;
  nearAngle?: { angle: "ASC" | "MC" | "DSC" | "IC"; orb: number };
}

export interface HorarySignificator {
  role: string;
  /** Casa significada pelo papel; null quando o papel é natural/planetário, não uma regência de casa. */
  house: number | null;
  basis: "house_ruler" | "natural_planet" | "explicit_planet";
  planet: PlanetType;
  planetName: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  speed: number;
  essential: EssentialCondition;
  accidental: AccidentalCondition;
  sourceIds: string[];
}

export interface HoraryReception {
  from: PlanetType;
  to: PlanetType;
  fromName: string;
  toName: string;
  dignities: Array<"domicile" | "exaltation" | "triplicity" | "term" | "face" | "detriment" | "fall">;
  strongest: "domicile" | "exaltation" | "triplicity" | "term" | "face" | "detriment" | "fall" | "none";
  disposition: "strong_positive" | "positive" | "mild_positive" | "negative" | "strong_negative" | "neutral";
}

export interface HoraryAspectEvent {
  a: PlanetType;
  b: PlanetType;
  aName: string;
  bName: string;
  aspect: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  applying: boolean;
  separating: boolean;
  orb: number;
  degreesToPerfection?: number;
  estimatedDaysToPerfection?: number;
  beforeEitherChangesSign?: boolean;
  byAntiscion?: boolean;
  byContraAntiscion?: boolean;
}

export interface HoraryLunarEvent {
  order: number;
  target: PlanetType;
  targetName: string;
  aspect: HoraryAspectEvent["aspect"];
  degreesToPerfection: number;
  estimatedDaysToPerfection?: number;
}

export interface HoraryMediationEvent {
  kind: "translation" | "collection" | "prohibition_candidate" | "prohibition" | "prohibition_of_prohibition" | "frustration" | "refranation" | "sign_change_obstruction";
  mediator?: PlanetType;
  mediatorName?: string;
  confidence: "high" | "medium" | "requires_ephemeris";
  statement: string;
  sourceIds: string[];
  data?: Record<string, unknown>;
}


export type HoraryChronologyEventKind = "aspect" | "antiscion" | "contra_antiscion" | "station" | "sign_change" | "solar_conjunction" | "combustion_entry" | "combustion_exit" | "cusp_entry";
export interface HoraryChronologyEvent {
  jd: number;
  daysFromQuestion: number;
  kind: HoraryChronologyEventKind;
  planets: PlanetType[];
  aspect?: HoraryAspectEvent["aspect"];
  house?: number;
  fromSign?: number;
  toSign?: number;
  statement: string;
}

export interface HoraryCoverageEntry {
  status: "mechanized" | "routed" | "manual_context" | "safety_limited";
  ruleIds: string[];
  note: string;
}

export interface HoraryTestimony {
  id: string;
  severity: HorarySeverity;
  subject: string;
  statement: string;
  sourceIds: string[];
  data?: Record<string, unknown>;
}

export interface HoraryTopicAnalysis {
  topic: HoraryTopic;
  requiredContext: string[];
  unresolvedContext: string[];
  houses: HoraryHouseAssignment[];
  naturalRoles: HoraryNaturalRoleSpec[];
  primaryRoles: string[];
  notes: string[];
  semanticFrame: HorarySemanticFrame;
}


export interface HoraryDecisionPlanView {
  topic: HoraryTopic;
  intents: HoraryIntent[];
  archetypes: string[];
  steps: Array<{ archetype:string; intent:HoraryIntent; purpose:string; requiredSignals:string[]; forbiddenShortcuts:string[] }>;
  compositional: true;
}


export type HoraryAIResolutionStatus = "JUDGED" | "NEEDS_CLARIFICATION" | "DESCRIPTIVE_ONLY" | "SOURCE_RULE_REQUIRED";
export type HoraryAIConfidence = "high" | "medium" | "low";

export interface HoraryAIInterpretiveTask {
  id: string;
  kind: "semantic_resolution" | "contextual_judgement" | "source_variant" | "symbolic_synthesis" | "timing_selection" | "reporting";
  question: string;
  blocking: boolean;
  allowedActions: string[];
  forbiddenActions: string[];
  sourceIds: string[];
}

export interface HoraryAIHandoff {
  contractVersion: string;
  promptVersion: string;
  methodology: "Marcos+Frawley+Gugu-supplement";
  deterministicBoundary: {
    closedByEngine: string[];
    aiMayInterpret: string[];
    aiMustNotAlter: string[];
  };
  sourceHierarchy: Array<{priority:number; source:string; policy:string}>;
  requiredSourceIds: string[];
  interpretiveTasks: HoraryAIInterpretiveTask[];
  unresolved: string[];
  clarificationQuestions: string[];
  machineJudgementIsAdvisory: true;
  outputContract: {
    status: HoraryAIResolutionStatus[];
    answer: HoraryAnswer[];
    requiredFields: string[];
    confidence: HoraryAIConfidence[];
  };
}

export interface HoraryAIResultShape {
  status: HoraryAIResolutionStatus;
  questionReframed: string;
  semanticResolution: Array<{role:string; meaning:string; house?:number; rationale:string}>;
  answer: HoraryAnswer;
  /** Cadeia técnica curta e auditável; não é para expor raciocínio privado do modelo. */
  causalChain: string[];
  sourceVariants: string[];
  /** IDs de fonte efetivamente usados, limitados ao corpus/contrato entregue pelo motor. */
  usedSourceIds: string[];
  /** Pontos que continuam dependentes de julgamento humano/contextual mesmo depois da síntese. */
  unresolvedSubjectivity: string[];
  timing?: {value?:number; unit?:string; range?:string; rationale:string};
  confidence: HoraryAIConfidence;
  clarificationNeeded: string[];
  sourceRuleRequired: string[];
  reportText: string;
}

export interface HoraryAISemanticIntakeInput {
  rawQuestion: string;
  background?: string;
  knownFacts?: string[];
  positiveOutcomeDefinition?: string;
  currentDefault?: string;
}

export interface HoraryAISemanticIntakeResult {
  status: "READY_FOR_ENGINE" | "NEEDS_CLARIFICATION" | "OUT_OF_SCOPE";
  topic?: HoraryTopic;
  concreteQuestion?: string;
  semanticRoles: HorarySemanticRoleSpec[];
  semanticAmbiguities: HorarySemanticAmbiguity[];
  intents: HoraryIntent[];
  primaryRoleIds: string[];
  contextPatch: Partial<HoraryQuestionContext>;
  clarificationQuestions: string[];
  confidence: HoraryAIConfidence;
  /** Justificativas operacionais curtas: relação humana → significação, sem cálculo astronômico. */
  semanticNotes: string[];
}

export interface HoraryAISourceEvidence {
  sourceId: string;
  title?: string;
  locator?: string;
  excerpt: string;
}

export interface HoraryAIModelRequest {
  stage: "semantic_intake" | "judgement";
  contractVersion: string;
  promptVersion: string;
  language: "pt-BR";
  systemPrompt: string;
  userPrompt: string;
  expectedOutput: Record<string, unknown>;
  requiredSourceIds: string[];
  sourceRetrievalHints: string[];
  /** Trechos efetivamente recuperados do corpus pelo adapter/RAG. O motor nunca os inventa. */
  sourceEvidence?: HoraryAISourceEvidence[];
  blockingClarifications: string[];
}

export interface HoraryAIValidationResult<T> {
  valid: boolean;
  errors: string[];
  warnings: string[];
  value?: T;
}

/** Adapter neutro: qualquer provedor/modelo futuro precisa apenas cumprir este contrato. */
export interface HoraryAIProvider {
  generate(request: HoraryAIModelRequest): Promise<unknown>;
}

/** Adapter opcional de RAG/corpus. Mantém a busca de fontes separada do modelo de linguagem. */
export interface HoraryAISourceResolver {
  resolve(input:{sourceIds:string[];stage:HoraryAIModelRequest["stage"];query:string}):Promise<HoraryAISourceEvidence[]>;
}

export interface HoraryDossier {
  module: "western/horary";
  methodology: "Marcos+Frawley";
  question: HoraryQuestionContext;
  chartMetadata: {
    houseSystem: string;
    zodiac: string;
    timezone?: string;
    utcIso?: string;
    location?: string;
  };
  topicAnalysis: HoraryTopicAnalysis;
  ontology: HoraryOntologyClassification;
  decisionPlan: HoraryDecisionPlanView;
  coverage: HoraryCoverageEntry;
  houseAtlas: HoraryHouseAtlasEntry[];
  neutralSky: Array<{planet:PlanetType;name:string;longitude:number;speed:number;retrograde:boolean;house:number;sign:string;degreeInSign:number}>;
  significators: HorarySignificator[];
  receptions: HoraryReception[];
  directPerfections: HoraryAspectEvent[];
  antiscialContacts: HoraryAspectEvent[];
  mediation: HoraryMediationEvent[];
  chronology?: HoraryChronologyEvent[];
  lunarSequence: HoraryLunarEvent[];
  moonVoidOfCourse: boolean;
  testimonies: HoraryTestimony[];
  considerations: HoraryTestimony[];
  auxiliary: {
    nodes: Array<{ name: string; longitude: number }>;
    fixedStars: Array<{ pointName: string; starName: string; orb: number; descriptor: string }>;
    outerPlanets: Array<{ name: string; longitude: number; note: string }>;
    partsPolicy: string;
  };
  judgement: {
    answer: HoraryAnswer;
    canJudge: boolean;
    summary: string;
    reasons: string[];
    timing?: string;
  };
  provenance: HorarySourceRef[];
  safeguards: string[];
}
