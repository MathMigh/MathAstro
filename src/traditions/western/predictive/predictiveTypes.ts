import type { BirthDate, SelectedCity } from "@/interfaces/BirthChartInterfaces";

export type PredictiveAuthorMode = "marcos" | "frawley" | "combined" | "gugu" | "integrated";
export type PredictiveCoverageState =
  | "SOURCE_LOCKED_IMPLEMENTED"
  | "SOURCE_LOCKED_PARTIAL"
  | "SOURCE_LOCKED_WITH_OPERATIONAL_GATE"
  | "TRADITIONAL_STANDARD_MECHANICS"
  | "SOURCE_GAP"
  | "DEFERRED";

export interface PredictiveSourceRef {
  id: string;
  author: "Marcos Monteiro" | "John Frawley" | "Luiz Gonzaga de Carvalho Neto" | "Traditional mechanics" | "MathAstro audit";
  work: string;
  dateOrVersion?: string;
  locator?: string;
  rule: string;
  coverage: PredictiveCoverageState;
  evidenceLevel?: "PRIMARY" | "SECONDARY" | "AUDIT";
}

export interface PredictiveConsultationContext {
  question?: string;
  context?: string;
  focalTopics?: string[];
  knownEvents?: string[];
}

export interface PredictiveInput {
  birthDate: BirthDate;
  targetDate: BirthDate;
  consultation?: PredictiveConsultationContext;
  eventCoordinates?: SelectedCity;
  authorMode?: PredictiveAuthorMode;
  includeDerivedLunar?: boolean;
  includeProfection?: boolean;
  includeGuguPeriods?: boolean;
  includeTemporalFixedStars?: boolean;
}

export interface PredictivePoint {
  key: string;
  name: string;
  kind: "planet" | "angle" | "cusp" | "lot" | "fixed-star" | "node";
  longitude: number;
  sign: string;
  house?: number;
  speed?: number;
  retrograde?: boolean;
}

export interface PredictiveSkySnapshot {
  utcIso: string;
  localIso: string;
  timezone: string;
  julianDayUt: number;
  location: SelectedCity;
  houseSystem: "Regiomontanus" | "Placidus";
  houseSystemCode: "R" | "P";
  planets: PredictivePoint[];
  nodes: PredictivePoint[];
  angles: PredictivePoint[];
  cusps: PredictivePoint[];
}

export type PredictiveAspectName = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface PredictiveContact {
  moving: string;
  target: string;
  aspect: PredictiveAspectName;
  exactAngle: number;
  separation: number;
  distanceToExact: number;
  movingLongitude: number;
  targetLongitude: number;
  applying?: boolean;
  operationallyActive: boolean;
  operationalGateDeg: number;
  gateProvenance: "ENGINE_SCREENING_NOT_AUTHORIAL_ORB";
}

export interface PredictiveFixedStarContact {
  moving: string;
  movingKind: PredictivePoint["kind"];
  movingLongitude: number;
  movingSign: string;
  star: string;
  starLongitude: number;
  starSign: string;
  magnitude?: number;
  calculationMode: "swiss-exact" | "catalog-precession";
  sameSign: boolean;
  distanceToConjunction: number;
  maxOrbDeg: number;
  operationallyActive: boolean;
  sourceIds: string[];
  authorEligibility: {
    marcos: "SOURCE_LOCKED_CANDIDATE" | "NOT_ACTIVE_BY_MARCOS_SCREEN";
    frawley: "SOURCE_LOCKED_PROGRESSION_TARGET_ORB_UNPUBLISHED" | "SOURCE_LOCKED_RETURN_EXAMPLE_DISTANCE_UNFILTERED" | "ASTRONOMY_MATERIALIZED_INTERPRETIVE_RULE_NOT_ASSUMED" | "NOT_IN_AUTHOR_MODE";
  };
  noStandaloneInterpretation: true;
}

export interface EssentialConditionSnapshot {
  point: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  domicile: boolean;
  exaltation: boolean;
  detriment: boolean;
  fall: boolean;
  termRuler?: string;
  faceRuler?: string;
  labels: string[];
}

export interface ProgressionWindowEvent {
  kind: "direct-contact" | "antiscion-contact" | "fixed-star-conjunction" | "term-ingress" | "sign-ingress";
  moving: string;
  movingKind: PredictivePoint["kind"];
  target: string;
  targetKind: PredictivePoint["kind"] | "fixed-star" | "term" | "sign";
  aspect?: "conjunction" | "opposition";
  perfectionUtcIso: string;
  symbolicUtcIso: string;
  residualDeg: number;
  fromValue?: string;
  toValue?: string;
  sourceIds: string[];
  authorEligibility: {
    marcos: boolean;
    frawley: boolean;
    note: string;
  };
}

export interface ProgressionWindowTimeline {
  basis: "governing-solar-return-year";
  startUtcIso: string;
  endUtcIso: string;
  sampleCount: number;
  directEvents: ProgressionWindowEvent[];
  antiscionEvents: ProgressionWindowEvent[];
  fixedStarEvents: ProgressionWindowEvent[];
  termIngressEvents: ProgressionWindowEvent[];
  signIngressEvents: ProgressionWindowEvent[];
  allEvents: ProgressionWindowEvent[];
  note: string;
}


export interface ProgressionAuthorVariant {
  author: "Marcos Monteiro" | "John Frawley";
  houseSystem: "Regiomontanus" | "Placidus";
  progressedSky: PredictiveSkySnapshot;
  pointsConsidered: string[];
  primaryDirectors: string[];
  contactsToRadix: PredictiveContact[];
  antiscionContactsToRadix: PredictiveContact[];
  termChanges: Array<{ point: string; natalTermRuler?: string; progressedTermRuler?: string; changed: boolean }>;
  temporalFixedStarContacts: PredictiveFixedStarContact[];
  progressionWindow?: ProgressionWindowTimeline;
  note: string;
}

export interface ProgressionDossier {
  method: "secondary-progressions-day-for-year";
  sourceIds: string[];
  ageYears: number;
  progressedUtcIso: string;
  progressedSky: PredictiveSkySnapshot;
  pointsConsidered: string[];
  primaryDirectors: string[];
  secondaryRelationalPoints: string[];
  targetClasses: string[];
  houseSystemPolicy: { primary: "Regiomontanus" | "Placidus"; frawleyNatal: "Placidus"; alternateAuthorGeometryMaterialized: boolean; note: string };
  authorVariants?: { marcos?: ProgressionAuthorVariant; frawley?: ProgressionAuthorVariant };
  aspectPolicy: "conjunction-and-opposition-only";
  aspectPolicySourceIds: string[];
  aspectPolicyProvenance: "MARCOS_CURRENT_SOURCE_LOCKED" | "FRAWLEY_CONSERVATIVE_SUBSET_POLICY_UNPUBLISHED";
  angleProgressionPolicy: {
    method: "naibod-in-ra-via-progressed-ramc";
    arcDegrees: number;
    note: string;
    sourceStatus: "FRAWLEY_SCHOOL_SECONDARY_ATTESTATION_TRADITIONAL_MECHANICS";
  };
  termChanges: Array<{ point: string; natalTermRuler?: string; progressedTermRuler?: string; changed: boolean }>;
  contactsToRadix: PredictiveContact[];
  contactsWithinProgressedSky: PredictiveContact[];
  progressedLots: PredictivePoint[];
  antiscionContactsToRadix: PredictiveContact[];
  antiscionContactsWithinProgressedSky: PredictiveContact[];
  progressionWindow?: ProgressionWindowTimeline;
  /** @deprecated kept as a compatibility summary; values are now epoch-correct. */
  natalFixedStarContacts: Array<{
    moving: string;
    star: string;
    starLongitude: number;
    distanceToConjunction: number;
    operationallyActive: boolean;
    operationalGateDeg: number;
  }>;
  temporalFixedStarContacts: PredictiveFixedStarContact[];
  note: string;
}

export interface ReturnLocationPolicy {
  primaryLocation: "birthplace" | "event-location";
  sourceIds: string[];
  rationale: string;
  alternateEventLocationMaterialized: boolean;
}


export type PredictiveHouseClass = "angular" | "succedent" | "cadent";

export interface ReturnCuspProximity {
  point: string;
  pointKind: PredictivePoint["kind"];
  cuspHouse: number;
  distanceDeg: number;
  maxOrbDeg: 2;
  emphasized: boolean;
  sourceIds: string[];
}

export interface ReturnReceptionEvidence {
  guest: string;
  receiver: string;
  by: "domicile" | "exaltation" | "triplicity" | "term" | "face" | "detriment" | "fall";
  polarity: "positive" | "negative";
  guestLongitude: number;
  guestSign: string;
}

export interface ReturnReceptionChange {
  guest: string;
  receiver: string;
  by: ReturnReceptionEvidence["by"];
  polarity: ReturnReceptionEvidence["polarity"];
  natalPresent: boolean;
  returnPresent: boolean;
  changed: boolean;
}

export interface ImminentSignIngressEvidence {
  planet: string;
  fromSign: string;
  toSign: string;
  ingressUtcIso: string;
  daysAfterReturn: number;
  direction: "direct" | "retrograde";
  receptionBefore: ReturnReceptionEvidence[];
  receptionAfter: ReturnReceptionEvidence[];
  changedReceptionKeys: string[];
  sourceIds: string[];
}


export interface RecentSignIngressEvidence {
  planet: string;
  fromSign: string;
  toSign: string;
  ingressUtcIso: string;
  daysBeforeReturn: number;
  direction: "direct" | "retrograde";
  receptionBefore: ReturnReceptionEvidence[];
  receptionAfter: ReturnReceptionEvidence[];
  changedReceptionKeys: string[];
  sourceIds: string[];
}

export interface ReturnSolarConditionEvidence {
  planet: string;
  longitude: number;
  sunLongitude: number;
  separationDeg: number;
  sameSignAsSun: boolean;
  approachingSun: boolean | null;
  marcosStatus: "cazimi" | "combust" | "under-beams" | "free";
  frawleyStatus: "cazimi" | "combust" | "under-beams" | "free";
  distanceToCazimiBoundaryDeg: number;
  distanceToCombustionBoundaryDeg: number;
  distanceToMarcosBeamBoundaryDeg: number;
  distanceToFrawleyBeamBoundaryDeg: number;
  sourceIds: string[];
}

export interface ReturnHouseRulerContinuity {
  house: number;
  radicalRuler: string;
  returnRuler: string;
  sameRuler: boolean;
}

export interface ReturnPlanetToRadicalHouseRulerContact {
  returnPlanet: string;
  radicalHouse: number;
  radicalRuler: string;
  contact: PredictiveContact;
}

export interface ReturnLotEvidence {
  id: string;
  lotKey: string;
  variant: "natal-position" | "return-calculated" | "natal-arc";
  label: string;
  point: PredictivePoint;
  house?: number;
  dispositor: string;
  antiscionLongitude: number;
  sourceIds: string[];
  formula: string;
  contactsToRadix: PredictiveContact[];
  contactsWithinReturn: PredictiveContact[];
  cuspContacts: PredictiveContact[];
  fixedStarContacts: PredictiveFixedStarContact[];
}

export interface ReturnHouseRulerEvidence {
  origin: "return-house" | "radical-house";
  house: number;
  ruler: string;
  cuspLongitude: number;
  rulerReturnLongitude: number;
  rulerReturnHouse?: number;
  rulerReturnCondition: EssentialConditionSnapshot;
}

export interface ReturnHouseRulerContact {
  firstOrigin: ReturnHouseRulerEvidence["origin"];
  firstHouse: number;
  firstRuler: string;
  secondOrigin: ReturnHouseRulerEvidence["origin"];
  secondHouse: number;
  secondRuler: string;
  contact: PredictiveContact;
}

export interface ReturnHouseEmphasisSummary {
  angular: string[];
  succedent: string[];
  cadent: string[];
  allTraditionalPlanetsCadent: boolean;
  allTraditionalPlanetsCadentAndAwayFromCusps: boolean;
}

export interface ReturnDossier {
  kind: "solar-return" | "lunar-return" | "derived-lunar-return";
  sourceIds: string[];
  exactReturnUtcIso: string;
  targetLongitude: number;
  actualLongitude: number;
  residualArcSeconds: number;
  sky: PredictiveSkySnapshot;
  alternateEventLocationSky?: PredictiveSkySnapshot;
  authorHouseSystemVariants?: { regiomontanus?: PredictiveSkySnapshot; placidus?: PredictiveSkySnapshot };
  locationPolicy: ReturnLocationPolicy;
  essentialConditions: EssentialConditionSnapshot[];
  dignityChangesFromRadix: Array<{
    planet: string;
    natal: EssentialConditionSnapshot;
    return: EssentialConditionSnapshot;
    changed: boolean;
  }>;
  rulersByHouse: Array<{ house: number; cuspLongitude: number; sign: string; ruler: string }>;
  housePlacements: Array<{ point: string; kind: PredictivePoint["kind"]; house?: number; houseClass?: PredictiveHouseClass }>;
  houseEmphasis: ReturnHouseEmphasisSummary;
  contactsWithinReturn: PredictiveContact[];
  planetAngleContactsWithinReturn: PredictiveContact[];
  cuspProximities: ReturnCuspProximity[];
  nodeContactsWithinReturn: PredictiveContact[];
  nodeContactsToRadix: PredictiveContact[];
  nodeAntiscionContactsToRadix: PredictiveContact[];
  angleContactsToRadixAngles: PredictiveContact[];
  antiscionContactsWithinReturn: PredictiveContact[];
  cuspAntiscionContactsWithinReturn: PredictiveContact[];
  receptions: ReturnReceptionEvidence[];
  receptionChangesFromRadix: ReturnReceptionChange[];
  recentSignIngresses: RecentSignIngressEvidence[];
  imminentSignIngresses: ImminentSignIngressEvidence[];
  solarConditions: ReturnSolarConditionEvidence[];
  returnHouseRulers: ReturnHouseRulerEvidence[];
  radicalHouseRulersInReturn: ReturnHouseRulerEvidence[];
  houseRulerContinuities: ReturnHouseRulerContinuity[];
  returnPlanetContactsToRadicalHouseRulers: ReturnPlanetToRadicalHouseRulerContact[];
  returnHouseRulerContacts: ReturnHouseRulerContact[];
  radicalHouseRulerContactsInReturn: ReturnHouseRulerContact[];
  lots: ReturnLotEvidence[];
  contactsToRadix: PredictiveContact[];
  cuspContactsToRadix: PredictiveContact[];
  antiscionContactsToRadix: PredictiveContact[];
  temporalFixedStarContacts: PredictiveFixedStarContact[];
  hierarchy: string;
}

export interface ProfectionDossier {
  method: "annual-profection-by-sign";
  sourceIds: string[];
  ageCompleted: number;
  profectedHouse: number;
  natalAscendantLongitude: number;
  profectedAscendantLongitude: number;
  profectedSign: string;
  lordOfYear: string;
  rule: "advance-one-sign-per-completed-year; do-not-rotate-natal-planets";
  interpretiveWeight: "secondary-context-not-automatic-dominant-ruler";
}

export type GuguPeriodLevel = "major-years" | "minor-months" | "micro-days" | "micro-hours";

export interface GuguPeriodSegment {
  level: GuguPeriodLevel;
  signIndex: number;
  sign: string;
  ruler: string;
  parentRuler?: string;
  planetaryNumber: number;
  startUtcIso: string;
  endUtcIso: string;
  exactDurationSeconds: number;
  zodiacCycle: number;
  sequenceIndex: number;
  truncatedByParent: boolean;
}

export interface GuguSubdivisionCoverage {
  status: "SOURCE_LOCKED_ZODIAC_SEQUENCE_CONTINUED";
  active: GuguPeriodSegment;
  timeline: GuguPeriodSegment[];
  firstCycle: GuguPeriodSegment[];
  firstCycleEndUtcIso: string;
  cyclesTraversed: number;
}

export interface GuguPeriodLordCondition {
  planet: string;
  longitude: number;
  sign: string;
  house?: number;
  retrograde?: boolean;
  essentialCondition: EssentialConditionSnapshot;
}

export interface GuguPeriodDossier {
  method: "gugu-zodiacal-planetary-periods";
  sourceIds: string[];
  natalAscendantLongitude: number;
  natalAscendantSign: string;
  startsFromAscendantSign: true;
  units: {
    majorYearDays: 360;
    monthDays: 30;
    samePlanetaryNumberAtAllLevels: true;
  };
  planetaryValues: Record<string, number>;
  majorTimeline: GuguPeriodSegment[];
  activeMajor: GuguPeriodSegment;
  minor: GuguSubdivisionCoverage;
  day?: GuguSubdivisionCoverage;
  hour?: GuguSubdivisionCoverage;
  activePath: GuguPeriodSegment[];
  lordConditions?: GuguPeriodLordCondition[];
  boundaryEvidence: Array<{
    level: GuguPeriodLevel;
    ruler: string;
    sign: string;
    elapsedDays: number;
    remainingDays: number;
    nearestBoundaryDistanceDays: number;
    noAuthorialBoundaryOrb: true;
  }>;
  interpretiveMechanics: {
    receiverHasGreaterWeight: true;
    compareNaturalRelationshipOfPeriodLords: true;
    compareNatalConditionOfPeriodLords: true;
    smallerScalesHaveLowerLifeSignificance: true;
    transitsDoNotPredictEventsAutonomously: true;
    noAggregateScore: true;
  };
}

export interface TransitDossier {
  sourceIds: string[];
  targetSky: PredictiveSkySnapshot;
  contactsToRadix: PredictiveContact[];
  temporalFixedStarContacts: PredictiveFixedStarContact[];
  triggerPolicy: "trigger-only-needs-higher-scale-support" | "gugu-period-context-no-autonomous-event-prediction";
  triggers: Array<{
    contact: PredictiveContact;
    status: "background_only" | "eligible_trigger" | "period_context_only";
    supportLayers: string[];
    reason: string;
    guguPeriodContext?: {
      majorRuler: string;
      majorSign: string;
      minorRuler?: string;
      minorSign?: string;
      nearestMajorBoundaryDays: number;
    };
  }>;
}

export interface ConvergenceItem {
  radixTarget: string;
  layers: Array<"progression" | "solar-return" | "lunar-return" | "derived-lunar-return" | "profection" | "transit">;
  evidence: string[];
  noAggregateScore: true;
}

export interface PredictiveValidation {
  status: "PASS" | "FAIL";
  checks: Record<string, boolean>;
  errors: string[];
  warnings: string[];
}

export interface PredictiveAuthorFallback {
  gapId: "FRAWLEY_RETURN_LOCATION_POLICY" | "FRAWLEY_PROGRESSION_ASPECT_POLICY" | "FRAWLEY_TEMPORAL_FIXED_STAR_ORB_POLICY";
  missingAuthor: "John Frawley";
  suppliedBy: "Marcos Monteiro";
  status: "SOURCE_LOCKED_FALLBACK_IN_COMBINED_MODES";
  sourceIds: string[];
  rule: string;
  appliesInModes: Array<"combined" | "integrated">;
  doesNotClaimMissingAuthorAgreement: true;
}


export type PredictiveJudgmentTaskType =
  | "SEMANTIC_TOPIC_ROUTING"
  | "RADIX_PROMISE_JUDGMENT"
  | "PROGRESSION_THEME_JUDGMENT"
  | "PROGRESSION_TIMING_SYNTHESIS"
  | "SOLAR_RETURN_HIERARCHY_SYNTHESIS"
  | "LUNAR_RETURN_REFINEMENT"
  | "DERIVED_LUNAR_REFINEMENT"
  | "PROFECTION_CONTEXT_JUDGMENT"
  | "GUGU_PERIOD_QUALITY_JUDGMENT"
  | "TRANSIT_TRIGGER_JUDGMENT"
  | "AUTHOR_CONFLICT_RESOLUTION"
  | "EVENT_VS_SUBJECTIVE_EXPERIENCE"
  | "FINAL_PREDICTIVE_SYNTHESIS";

export interface PredictiveJudgmentOutputField {
  key: string;
  type: "string" | "string[]" | "boolean" | "number" | "object";
  required: boolean;
  description: string;
}

export interface PredictiveJudgmentTask {
  id: string;
  type: PredictiveJudgmentTaskType;
  status: "READY" | "NEEDS_USER_CONTEXT" | "BLOCKED_BY_SOURCE_GAP" | "NOT_APPLICABLE";
  authors: Array<"Marcos Monteiro" | "John Frawley" | "Luiz Gonzaga de Carvalho Neto">;
  purpose: string;
  allowedEvidencePaths: string[];
  sourceIds: string[];
  forbiddenActions: string[];
  resolutionRules: string[];
  outputFields: PredictiveJudgmentOutputField[];
}

export interface PredictiveAiJudgmentContract {
  schema: "mathastro.predictive.ai-judgment-contract/1.0";
  contractVersion: "1.0.0";
  language: "pt-BR";
  promptId: "MATHASTRO_PREDITIVA_ABSOLUTE_PTBR_V1";
  promptVersion: "1.0.0";
  botReady: true;
  consultation: PredictiveConsultationContext;
  subjectivityBoundary: {
    aiMayJudge: string[];
    engineExclusive: string[];
    neverInferFromAbsence: string[];
  };
  authorPolicy: {
    keepAuthorsSeparate: true;
    allowIntegratedSynthesis: true;
    integratedSynthesisMustLabelProvenance: true;
    neverConvertFallbackIntoMissingAuthorAgreement: true;
  };
  uncertaintyPolicy: {
    indeterminateToken: "INDETERMINADO";
    sourceGapToken: "SOURCE_GAP";
    insufficientContextToken: "CONTEXTO_INSUFICIENTE";
    rules: string[];
  };
  hardProhibitions: string[];
  requiredJudgmentOrder: string[];
  tasks: PredictiveJudgmentTask[];
  finalOutputSchema: {
    format: "json-object";
    fields: PredictiveJudgmentOutputField[];
  };
}

export interface PredictiveAiPrompt {
  id: "MATHASTRO_PREDITIVA_ABSOLUTE_PTBR_V1";
  version: "1.0.0";
  language: "pt-BR";
  text: string;
}

export interface PredictiveEngineResult {
  schemaVersion: "1.5.0";
  schema: "mathastro.predictive.ai-report/1.5";
  principle: "motor-calcula-ia-interpreta";
  authorMode: PredictiveAuthorMode;
  input: PredictiveInput;
  sourceRegistry: PredictiveSourceRef[];
  authorFallbacks: PredictiveAuthorFallback[];
  sourceGaps: Array<{ id: string; blocking: boolean; note: string }>;
  radix: {
    utcIso: string;
    timezone: string;
    planets: PredictivePoint[];
    nodes: PredictivePoint[];
    angles: PredictivePoint[];
    cusps: PredictivePoint[];
    natalAiReleaseStatus: "PASS" | "FAIL";
    natalValidationErrorCodes: string[];
    natalTechnicalForm: unknown;
    natalPrecisionEvidence: unknown;
  };
  progressions?: ProgressionDossier;
  solarReturn?: ReturnDossier;
  lunarReturn?: ReturnDossier;
  derivedLunarReturn?: ReturnDossier;
  profection?: ProfectionDossier;
  guguPeriods?: GuguPeriodDossier;
  transits: TransitDossier;
  convergence: ConvergenceItem[];
  interpretationOrder: string[];
  aiPrompt: PredictiveAiPrompt;
  aiJudgmentContract: PredictiveAiJudgmentContract;
  validation: PredictiveValidation;
  analysisReport: string;
}
