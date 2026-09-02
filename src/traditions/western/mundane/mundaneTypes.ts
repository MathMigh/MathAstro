export type MundaneAuthorMode = "marcos" | "frawley-legacy" | "marcos-frawley" | "research";
export type MundaneFocus = "general" | "war" | "government" | "economy" | "disaster" | "weather" | "agriculture";
export type MundaneConsultationMode = "focused" | "integral";

export type EvidenceStatus = "calculated" | "calculated-baseline" | "source-locked" | "user-input";

export interface MundaneSourceRef {
  id: string;
  author: "Marcos Monteiro" | "John Frawley" | "engineering" | "user";
  scope: string;
}

export interface MundaneFocusProtocol {
  focus: MundaneFocus;
  requiredLayers: string[];
  primaryHouses: number[];
  secondaryHouses: number[];
  naturalSignificators: string[];
  admittedPartKeys: string[];
  terrestrialRequirements: string[];
  interpretationOrder: string[];
}

export interface ElementalConjunction {
  utcIso: string;
  longitude: number;
  signIndex: number;
  element: "fire" | "earth" | "air" | "water";
}

export interface ElementalRun {
  element: ElementalConjunction["element"];
  startUtcIso: string;
  endUtcIso: string;
  count: number;
  conjunctions: ElementalConjunction[];
  canonicalHistoricalMutationClaimed: false;
}

export interface MundaneGap {
  code: string;
  status: "closed" | "partial" | "source-locked" | "qa";
  blocking: boolean;
  note: string;
}


export interface MundaneEclipseLord {
  status: "calculated" | "source-locked";
  planet: string | null;
  rule: string;
  sourceIds: string[];
}

export interface MundaneEclipseRecord {
  type: "solar" | "lunar";
  kind: "solar-total" | "solar-annular" | "solar-hybrid" | "solar-partial" | "lunar-total" | "lunar-partial" | "lunar-penumbral";
  maximumUtcIso: string;
  maximumJulianDayUt: number;
  phaseBeginUtcIso: string | null;
  phaseEndUtcIso: string | null;
  eclipseTypeFlags: number | null;
  sunLongitude: number;
  moonLongitude: number;
  eclipseSign: string;
  lord?: MundaneEclipseLord;
  localVisibility: Record<string, unknown>;
  structuralInvariants: Array<{key:string;structuralByDefinition:true;independentTestimony:false;reason:string}>;
  provenance: { physicalClassification:string; localVisibility:string };
}

export interface MundaneIngressLordCandidate {
  planet: string;
  longitude: number;
  sign: string;
  essentialCondition: import("@/traditions/western/predictive/predictiveTypes").EssentialConditionSnapshot;
  house: number;
  angularity: "angular" | "succedent" | "cadent";
  domicileRuledCusps: number[];
  exaltationRuledCusps: number[];
  angularControl: Array<{angle:"ASC"|"MC"|"DSC"|"IC";basis:"domicile"|"exaltation"}>;
  moonApplication: null | {aspect:"conjunction"|"sextile"|"square"|"trine"|"opposition"; exactUtcIso:string; hoursAfterIngress:number};
  noAggregateScore: true;
}

export interface MundanePartRecord {
  key: string;
  name: string;
  longitude: number;
  sign: string;
  formula: string;
  authorEligibility: MundaneAuthorMode[];
  sourceIds: string[];
  status: EvidenceStatus;
  dispositor: string;
}

export interface MundaneInterChartContact {
  fromChartId: string;
  fromPoint: string;
  toChartId: string;
  toPoint: string;
  aspect: "conjunction"|"sextile"|"square"|"trine"|"opposition"|"antiscion-conjunction"|"contra-antiscion-opposition";
  distanceToExact: number;
  sameSignGate?: boolean;
  materialized: boolean;
  operationalGateDeg: number;
  gateProvenance: "ENGINE_SCREENING_NOT_AUTHORIAL_ORB";
}

export interface MundaneRelationEdge {
  from: string;
  to: string;
  type: "contains"|"refines"|"localizes-to-radix"|"inter-polity"|"return-of-radix"|"progresses-radix"|"activates-radix"|"activates-cycle"|"same-process";
  reason: string;
}





export interface MundaneFocusHouseEvidence {
  house:number;cuspLongitude:number;cuspSign:string;domicileRuler:string;exaltationRuler?:string;
  planetsInCuspSign:Array<{planet:string;longitude:number;distanceFromCusp:number}>;
}
export interface MundaneFocusEvidence {
  chartId:string;
  primaryHouses:MundaneFocusHouseEvidence[];
  secondaryHouses:MundaneFocusHouseEvidence[];
  naturalSignificators:Array<{planet:string;longitude:number;sign:string;house:number}>;
  admittedParts:MundanePartRecord[];
  cuspMaterializationPolicy:"same-sign-all-distances-no-conjunction-claim";
}
export interface MundaneAiContract {
  schema:"mathastro.mundane.ai-contract/2.0";
  principle:"motor-calcula-ia-julga";
  promptVersion:"3.0-consulta-pro";
  judgmentStates:Record<"CALCULATED"|"CALCULATED_BASELINE"|"SOURCE_LOCKED"|"DATA_REQUIRED"|"AUTHOR_DIVERGENCE"|"ASTROLOGER_JUDGMENT_REQUIRED"|"MISSING_ENGINE_DATA"|"ENGINEERING_GATE",string>;
  readyForInterpretation:boolean;
  blockingCodes:string[];warningCodes:string[];
  interpretationOrder:string[];
  coverage:Record<string,"calculated"|"calculated-baseline"|"source-locked"|"not-requested"|"blocked">;
  prohibitions:string[];
}

export interface MundaneFixedStarContact {
  chartId:string; target:string; targetKind:"planet"|"cusp"|"part"; targetLongitude:number;
  star:string;starLongitude:number;starLatitude:number;rightAscension:number;declination:number;magnitude?:number;
  longitudeDistance:number;sameSign:boolean;maxOrbDeg:number;eligibleByMarcos:boolean;eligibleByFrawley:boolean;
  twoDimensionalSeparationDeg?:number;physicalOccultationClaimed:false;aspectPolicy:"conjunction-only";sourceIds:string[];
}
export interface MundaneFixedStarDossier {
  catalogMode:"relevant"|"full"; catalogCount:number;
  positions?:Array<{name:string;longitude:number;latitude:number;rightAscension:number;declination:number;magnitude?:number;calculationMode:string}>;
  contacts:MundaneFixedStarContact[];noStarAsAgent:true;
  oppositionPolicy:"no-star-opposition; opposite-cusp cases normalized as conjunction to opposite cusp";
}

export interface MundaneProgressionDossier {
  radixId:string;
  method:"frawley-published-day-for-year-baseline";
  targetUtcIso:string;
  ageYears:number;
  symbolicUtcIso:string;
  primaryPromissors:["Sol","Lua","ASC","MC","Fortuna"];
  progressedPoints:Array<{name:string;longitude:number;sign:string;mechanism:string}>;
  termChanges:Array<{point:string;radixTerm?:string;progressedTerm?:string;changed:boolean}>;
  contacts:Array<{moving:string;target:string;targetClass:"planet"|"cusp"|"fixed-star"|"part";aspect:"conjunction"|"opposition";distanceToExact:number;operationalGateDeg:number;gateProvenance:"ENGINE_SCREENING_NOT_AUTHORIAL_ORB"}>;
  exactMundaneDirectionClaimed:false;
  sourceIds:string[];
}
export interface MundaneReturnDossier {
  radixId:string;kind:"solar-return"|"lunar-return";exactUtcIso:string;residualArcSeconds:number;
  chart:import("@/traditions/western/predictive/predictiveTypes").PredictiveSkySnapshot;
  relation:"return-of-radix"; sourceIds:string[];
}

export interface MundaneWeatherApplication {
  moving: "Lua"|"Mercúrio";
  target: string;
  aspect: "conjunction"|"sextile"|"square"|"trine"|"opposition";
  exactUtcIso: string;
  hoursAfterReference: number;
  beforeMovingBodyChangesSign: true;
}
export interface MundaneWeatherDossier {
  status: "calculated"|"blocked-missing-climate-context";
  hierarchy: ["season","month","week","day"];
  normalClimate?: string;
  season: { ingress: MundaneRootEvent; precedingLunation: MundaneRootEvent; label:string };
  month: { ingress: MundaneRootEvent; precedingLunation: MundaneRootEvent };
  week: { phase: MundaneRootEvent & {phaseAngle:0|90|180|270} };
  day: { sunriseUtcIso:string|null; sunriseChart?: import("@/traditions/western/predictive/predictiveTypes").PredictiveSkySnapshot; moonApplication?:MundaneWeatherApplication; mercuryApplication?:MundaneWeatherApplication; fixedStarRiseSet:Array<{star:string;riseUtcIso:string|null;setUtcIso:string|null;declination:number;rightAscension:number;status:string}> };
  planetaryPrinciples: Array<{planet:string;principle:string}>;
  partKeys: string[];
  noAggregateScore: true;
}

export interface MundaneCometDossier {
  id:string;name:string;firstSeenUtcIso:string;color?:string;brightness?:number;twilightOnly?:boolean;
  firstSign:string; pathSigns:string[]; observedPath:Array<{utcIso:string;longitude:number;latitude?:number;brightness?:number}>;
  pathComplete:boolean; warnings:string[]; noAutomaticEventPrediction:true;
}

export interface MundaneHistoricalRadixInput {
  id: string;
  label: string;
  kind: "foundation" | "independence" | "government" | "ruler" | "event";
  date: import("@/interfaces/BirthChartInterfaces").BirthDate;
  documentaryQuality?: "primary" | "secondary" | "traditional" | "uncertain";
}

export interface MundaneInput {
  targetDate: import("@/interfaces/BirthChartInterfaces").BirthDate;
  authorMode?: MundaneAuthorMode;
  focus?: MundaneFocus;
  consultationQuestion?: string;
  consultationMode?: MundaneConsultationMode;
  historicalRadices?: MundaneHistoricalRadixInput[];
  processOriginUtcIso?: string;
  terrestrialContext?: Record<string, string | number | boolean | null | undefined>;
  includeEclipses?: boolean;
  weather?: { normalClimate?: string; pressureHpa?: number; temperatureC?: number };
  agriculture?: { crop?: "onion"|"corn"|"watermelon"|string; customFormula?: { add:string; subtract:string } };
  comets?: Array<{id:string;name:string;firstSeenUtcIso:string;color?:string;brightness?:number;twilightOnly?:boolean;observedPath?:Array<{utcIso:string;longitude:number;latitude?:number;brightness?:number}>}>;
  relatedRadixIds?: Array<[string,string]>;
  includeFullFixedStarCatalog?: boolean;
}

export interface MundaneRootEvent {
  kind: "aries-ingress" | "jupiter-saturn-conjunction" | "new-moon" | "full-moon";
  utcIso: string;
  residualArcSeconds: number;
  longitude?: number;
}

export interface MundaneEngineResult {
  schema: "mathastro.mundane/0.5";
  authorMode: MundaneAuthorMode;
  focus: MundaneFocus;
  targetUtcIso: string;
  focusProtocol: MundaneFocusProtocol;
  sources: MundaneSourceRef[];
  governingAriesIngress: MundaneRootEvent;
  latestPrecedingGrandConjunction: MundaneRootEvent;
  processGrandConjunction: MundaneRootEvent;
  precedingMajorLunation: MundaneRootEvent;
  eclipses: MundaneEclipseRecord[];
  precedingEclipse?: MundaneEclipseRecord;
  ingressLordCandidates: MundaneIngressLordCandidate[];
  parts: MundanePartRecord[];
  relations: MundaneRelationEdge[];
  interChartContacts: MundaneInterChartContact[];
  weather?: MundaneWeatherDossier;
  comets: MundaneCometDossier[];
  progressions: MundaneProgressionDossier[];
  returns: MundaneReturnDossier[];
  fixedStars: MundaneFixedStarDossier;
  focusEvidence: MundaneFocusEvidence[];
  aiContract: MundaneAiContract;
  aiHandoff: import("./mundaneAiPrompt").MundaneAiHandoff;
  charts: {
    target: import("@/traditions/western/predictive/predictiveTypes").PredictiveSkySnapshot;
    governingIngress: import("@/traditions/western/predictive/predictiveTypes").PredictiveSkySnapshot;
    grandConjunction: import("@/traditions/western/predictive/predictiveTypes").PredictiveSkySnapshot;
    eclipseCharts: Array<{ id:string; eclipseMaximumUtcIso:string; chart: import("@/traditions/western/predictive/predictiveTypes").PredictiveSkySnapshot }>;
    historicalRadices: Array<{ id:string; label:string; kind:MundaneHistoricalRadixInput["kind"]; documentaryQuality?:MundaneHistoricalRadixInput["documentaryQuality"]; chart: import("@/traditions/western/predictive/predictiveTypes").PredictiveSkySnapshot }>;
  };
  gaps: MundaneGap[];
  validation: { status:"PASS"|"WARN"|"FAIL"; errors:string[]; warnings:string[] };
  analysisReport: string;
}
