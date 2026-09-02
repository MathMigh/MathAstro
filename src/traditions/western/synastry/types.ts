import type { AspectType } from "@/interfaces/AstroChartInterfaces";
import type { FixedStarMatch, PlanetType } from "@/interfaces/BirthChartInterfaces";
import type {
  AccidentalCondition,
  EssentialCondition,
  HouseTechnicalDossier,
  MannerAnalysis,
  MentalityAnalysis,
  ReceptionKind,
  ReceptionTestimony,
  RelationshipDossier,
  SpiritualOrientationDossier,
  TechnicalLotDossier,
} from "@/app/lib/natalAnalysis";
import type { TemperamentResult } from "@/app/lib/traditionalTemperament";

export type SynastryPersonId = "A" | "B";

export type SynastryInteractionKind =
  | "general"
  | "romantic"
  | "marriage"
  | "business"
  | "teacher-student"
  | "student-teacher"
  | "employer-employee"
  | "employee-employer"
  | "siblings"
  | "friends"
  | "father-child"
  | "child-father"
  | "mother-child"
  | "child-mother"
  | "custom";

export type SynastrySourceStatus =
  | "source-locked"
  | "derived-from-source"
  | "example-derived";

export interface SynastryCustomRoleInput {
  houseForA: number;
  houseForB: number;
  roleA: string;
  roleB: string;
}

export interface SynastryUserContext {
  focus?: string;
  relationshipState?: string;
  notes?: string;
}

export interface SynastryCalculationOptions {
  labelA?: string;
  labelB?: string;
  interactionKind?: SynastryInteractionKind;
  customRole?: SynastryCustomRoleInput;
  userContext?: SynastryUserContext;
}

export interface SynastryInteractionContext {
  kind: SynastryInteractionKind;
  label: string;
  roleA: string;
  roleB: string;
  counterpartHouseForA: number;
  counterpartHouseForB: number;
  /** Only true when the declared relationship is intrinsically an I–VII matter. */
  relationshipAxisRelevant: boolean;
  romanticSpecific: boolean;
  marriageSpecific: boolean;
  note: string;
  sourceStatus: "source-locked" | "derived-from-source";
  custom: boolean;
}

export interface SynastryInputAudit {
  valid: boolean;
  errors: string[];
  warnings: string[];
  chartA: { traditionalPlanets: number; cusps: number; hasFullFixedStarSky: boolean };
  chartB: { traditionalPlanets: number; cusps: number; hasFullFixedStarSky: boolean };
}

export interface DistributionSnapshot {
  aboveHorizon: number;
  belowHorizon: number;
  easternHemisphere: number;
  westernHemisphere: number;
  total: number;
  horizonMajority: "acima" | "abaixo" | "equilibrado";
  hemisphereMajority: "leste" | "oeste" | "equilibrado";
}

export interface RoleHouseFoundation {
  house: number;
  topic: string;
  cuspLongitude: number;
  cuspSign: string;
  ruler: string;
  rulerEssential: EssentialCondition | null;
  rulerAccidental: AccidentalCondition | null;
  rulerAspects: HouseTechnicalDossier["rulerAspects"];
  rulerReceptions: HouseTechnicalDossier["rulerReceptions"];
  cuspPlanetContacts: HouseTechnicalDossier["cuspPlanetContacts"];
  occupants: HouseTechnicalDossier["occupants"];
  activeLots: HouseTechnicalDossier["activeLots"];
  cuspFixedStars: FixedStarMatch[];
}

export type InteractionPatternTone = "afinidade" | "tensao" | "misto" | "neutro";

export interface NatalInteractionPattern {
  person: SynastryPersonId;
  roleLabel: string;
  selfRuler: string;
  secondarySelf: "Lua";
  counterpartHouse: number;
  counterpartRuler: string;
  sameSignificator: boolean;
  directAspect: { aspect: AspectType; orb: number; applying: boolean } | null;
  moonDirectAspect: { aspect: AspectType; orb: number; applying: boolean } | null;
  selfToCounterpart: ReceptionTestimony[];
  counterpartToSelf: ReceptionTestimony[];
  moonToCounterpart: ReceptionTestimony[];
  counterpartToMoon: ReceptionTestimony[];
  selfEssential: EssentialCondition;
  selfAccidental: AccidentalCondition;
  moonEssential: EssentialCondition;
  moonAccidental: AccidentalCondition;
  counterpartEssential: EssentialCondition | null;
  counterpartAccidental: AccidentalCondition | null;
  counterpartHouseFoundation: RoleHouseFoundation;
  counterpartRulerStars: FixedStarMatch[];
  tone: InteractionPatternTone;
  evidence: string[];
  sourceStatus: "source-locked" | "derived-from-source";
}

export interface InteractionPatternComparison {
  status:
    | "facilitacao-convergente"
    | "dificuldade-convergente"
    | "assimetrico"
    | "misto"
    | "indeterminado";
  description: string;
  sourceStatus: "derived-from-source";
}

export interface RelationshipCuspFoundation {
  house: 1 | 7;
  cuspLongitude: number;
  cuspSign: string;
  cuspPlanetContacts: HouseTechnicalDossier["cuspPlanetContacts"];
  occupantsOnCusp: HouseTechnicalDossier["occupants"];
  activeLots: HouseTechnicalDossier["activeLots"];
  fixedStars: FixedStarMatch[];
}

export interface NatalRelationshipCommonInterest {
  receiver: string;
  ruler1Receptions: ReceptionTestimony[];
  ruler7Receptions: ReceptionTestimony[];
  note: string;
  sourceStatus: "derived-from-source";
}

export interface RomanticMarriageSupplement {
  relationshipPattern: RelationshipDossier;
  relationshipRulerStars: {
    ruler1: FixedStarMatch[];
    ruler7: FixedStarMatch[];
  };
  relationshipCusps: {
    house1: RelationshipCuspFoundation;
    house7: RelationshipCuspFoundation;
  };
  relationshipLots: {
    partOfLove: TechnicalLotDossier | null;
    marriageParts: RelationshipDossier["frawleyMarriageParts"];
  };
  commonNatalInterests: NatalRelationshipCommonInterest[];
}

export interface SynastryPersonFoundation {
  person: SynastryPersonId;
  label: string;
  ascendant: { longitude: number; sign: string; ruler: string };
  sect: "Diurno" | "Noturno";
  temperament: TemperamentResult;
  lordOfNativity: string | null;
  mentality: MentalityAnalysis;
  manner: MannerAnalysis;
  spiritualOrientation: SpiritualOrientationDossier;
  essentialConditions: EssentialCondition[];
  accidentalConditions: AccidentalCondition[];
  distribution: DistributionSnapshot;
  romanticMarriageSupplement: RomanticMarriageSupplement | null;
}

export interface TemperamentAxisRelation {
  axis: "calor" | "umidade";
  personA: string;
  personB: string;
  relation: "similar" | "complementar" | "indeterminado";
}

export interface TemperamentBond {
  status:
    | "integracao-preferencial"
    | "similaridade-forte"
    | "oposicao-polar"
    | "indeterminado";
  axisRelations: TemperamentAxisRelation[];
  personAIntensity: TemperamentResult["intensity"];
  personBIntensity: TemperamentResult["intensity"];
  interpretationKey: string[];
  sourceStatus: "source-locked";
}

export interface SharedGroundEvidence {
  id: string;
  present: boolean;
  weight: "primary" | "secondary";
  description: string;
  sourceStatus: SynastrySourceStatus;
}

export interface CrossAspectContact {
  id: string;
  personA: SynastryPersonId;
  pointA: string;
  pointAType: "planet" | "cusp";
  planetTypeA?: PlanetType;
  personB: SynastryPersonId;
  pointB: string;
  pointBType: "planet" | "cusp";
  planetTypeB?: PlanetType;
  aspect: AspectType;
  orb: number;
  maxOrb: number;
  priority: "role-core" | "core" | "supporting";
  roleTags: string[];
  longitudeA: number;
  longitudeB: number;
  houseA?: number;
  houseB?: number;
  note: string;
  sourceStatus: SynastrySourceStatus;
  sourceBasis: string;
}

export interface CrossReception {
  id: string;
  actorPerson: SynastryPersonId;
  actorPlanet: string;
  targetPerson: SynastryPersonId;
  targetPlanet: string;
  by: ReceptionKind;
  polarity: "positiva" | "negativa";
  strength: number;
  quality: string;
  hasCrossAspect: boolean;
  aspect?: AspectType;
  orb?: number;
  sectBasis: SynastryPersonId;
  priority: "role-core" | "core" | "supporting";
  sourceStatus: "derived-from-source";
}

export interface CrossMutualReception {
  personAPlanet: string;
  personBPlanet: string;
  aTowardB: CrossReception[];
  bTowardA: CrossReception[];
  hasCrossAspect: boolean;
  aspect?: AspectType;
  orb?: number;
}

export interface RoleResonanceTestimony {
  id: string;
  title: string;
  present: boolean;
  contactPresent: boolean;
  receptionPresent: boolean;
  description: string;
  aspect?: AspectType;
  orb?: number;
  receptions: CrossReception[];
  sourceStatus: SynastrySourceStatus;
}

export interface SunMoonBridge {
  direction: "A-Moon-in-B-Sun-sign" | "B-Moon-in-A-Sun-sign";
  present: boolean;
  sunSign: string;
  moonSign: string;
  targetSunWeak: boolean;
  actorMoonWeak: boolean;
  note: string;
  sourceStatus: "example-derived";
}

export interface CrossAntiscionContact {
  sourcePerson: SynastryPersonId;
  sourcePoint: string;
  targetPerson: SynastryPersonId;
  targetPoint: string;
  targetPointType: "planet" | "cusp";
  aspect: AspectType;
  aspectWeight: "principal" | "secondary";
  orb: number;
  maxOrb: number;
  sourceLongitude: number;
  antiscionLongitude: number;
  targetLongitude: number;
  targetHouse?: number;
  priority: "role-core" | "core" | "supporting";
  sourceStatus: "derived-from-source";
  sourceBasis: string;
}

export interface SynastryCalculationCompleteness {
  status: "complete" | "partial";
  checks: {
    inputValidated: boolean;
    bothNatalFoundations: boolean;
    rolePatternsBothSides: boolean;
    moonSecondaryEvidenceBothSides: boolean;
    temperamentCalculated: boolean;
    crossContactsMaterialized: boolean;
    crossReceptionsMaterialized: boolean;
    roleResonanceMaterialized: boolean;
    antisciaEvaluated: boolean;
    aiSafeAnalysisPayloadReady: boolean;
  };
  counts: {
    contacts: number;
    roleCoreContacts: number;
    receptions: number;
    mutualReceptions: number;
    activeRoleResonances: number;
    antiscia: number;
  };
  missing: string[];
  note: string;
}

export interface SynastrySynthesis {
  patternFit: "favoravel" | "dificil" | "assimetrico" | "misto" | "indeterminado";
  structuralBond: "forte" | "presente" | "fraco" | "indeterminado";
  contactCapacity: "alta" | "moderada" | "baixa" | "indeterminada";
  reciprocity: "reciproca" | "assimetrica" | "negativa" | "mista" | "nao-demonstrada";
  why: string[];
  how: string[];
  strengths: string[];
  tensions: string[];
  asymmetries: string[];
  growthPotential: string[];
  limits: string[];
}

export interface SynastryAnalysis {
  method: "MathAstro — Sinastria por Padrões Natais de Papel — Marcos/Frawley";
  methodVersion: "4.0.0";
  authority: {
    primary: readonly ["Marcos Monteiro", "John Frawley"];
    secondary: readonly ["Luiz Gonzaga de Carvalho Neto (Gugu)"];
  };
  inputAudit: SynastryInputAudit;
  interactionContext: SynastryInteractionContext;
  userContext: SynastryUserContext;
  foundations: {
    A: SynastryPersonFoundation;
    B: SynastryPersonFoundation;
  };
  interactionPatterns: {
    A: NatalInteractionPattern;
    B: NatalInteractionPattern;
    comparison: InteractionPatternComparison;
  };
  temperamentBond: TemperamentBond;
  sharedGround: SharedGroundEvidence[];
  sunMoonBridges: SunMoonBridge[];
  contacts: CrossAspectContact[];
  receptions: CrossReception[];
  mutualReceptions: CrossMutualReception[];
  roleResonance: RoleResonanceTestimony[];
  antiscia: CrossAntiscionContact[];
  calculationCompleteness: SynastryCalculationCompleteness;
  synthesis: SynastrySynthesis;
  sourceNotes: string[];
  unresolvedTechnicalQuestions: string[];
  cautions: string[];
}
