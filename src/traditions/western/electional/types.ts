import type { BirthChart, PlanetType } from "@/interfaces/BirthChartInterfaces";

export type ElectionalSourceAuthor = "Marcos Monteiro" | "John Frawley" | "Luiz Gonzaga de Carvalho Neto" | "MathAstro";
export type ElectionalSourceTier = "primary-current" | "primary-published" | "secondary" | "operational";
export type ElectionalMethodMode = "classical-full-election" | "current-marcos-frawley-aware";
export type ElectionalSeverity = "veto" | "critical" | "major" | "minor" | "support" | "info";
export type ElectionalJudgementBand = "REJEITAR" | "FRACA" | "ACEITAVEL" | "BOA" | "MUITO_BOA" | "MELHOR_DISPONIVEL";

export interface ElectionalSourceRef {
  id: string;
  author: ElectionalSourceAuthor;
  tier: ElectionalSourceTier;
  work: string;
  locator?: string;
  note?: string;
}

export interface ElectionalGoalProfile {
  id: string;
  label: string;
  radicalHouse: number;
  natalHouses: number[];
  naturalPlanets: PlanetType[];
  preferredElements?: Array<"Fogo" | "Terra" | "Ar" | "Agua">;
  preferredModes?: Array<"cardinal" | "fixed" | "mutable">;
  notes: string[];
}

export interface ElectionalRequest {
  methodMode: ElectionalMethodMode;
  goal: string;
  objective: string;
  constraints?: string[];
  electionChart: BirthChart;
  natalCharts: Array<{ id: string; role: string; chart: BirthChart }>;
}

export interface ElectionalPlanetCondition {
  planet: PlanetType;
  house?: number;
  sign?: string;
  essential: {
    domicile: boolean;
    exaltation: boolean;
    triplicity: boolean;
    term: boolean;
    face: boolean;
    detriment: boolean;
    fall: boolean;
    peregrine: boolean;
  };
  accidental: {
    angular: boolean;
    cadent: boolean;
    retrograde: boolean;
    combust: boolean;
    cazimi: boolean;
    underSunbeams: boolean;
  };
  testimony: string[];
}

export interface ElectionalTestimony {
  id: string;
  severity: ElectionalSeverity;
  subject: string;
  statement: string;
  sourceIds: string[];
  data?: Record<string, unknown>;
}

export interface NatalElectionLink {
  natalId: string;
  role: string;
  natalHouse: number;
  natalRuler: PlanetType;
  electionCondition: ElectionalPlanetCondition;
  electionToNatalContacts: string[];
  status: "supportive" | "mixed" | "difficult" | "neutral";
}

export interface ElectionalEvaluation {
  module: "western/electional";
  methodMode: ElectionalMethodMode;
  goal: ElectionalGoalProfile;
  objective: string;
  band: ElectionalJudgementBand;
  hardVetoes: ElectionalTestimony[];
  criticalRisks: ElectionalTestimony[];
  supports: ElectionalTestimony[];
  testimonies: ElectionalTestimony[];
  electionRulers: {
    ascendant: PlanetType;
    relevant: PlanetType;
  };
  planetConditions: Partial<Record<PlanetType, ElectionalPlanetCondition>>;
  natalLinks: NatalElectionLink[];
  warnings: string[];
  provenance: ElectionalSourceRef[];
  rankingVector: number[];
  summary: string;
}

export interface ElectionalWindowConstraints {
  startLocal: string;
  endLocal: string;
  coordinates: {
    latitude: number;
    longitude: number;
    name?: string;
    timezone: string;
  };
  stepMinutes?: number;
  allowedWeekdays?: number[];
  allowedLocalHours?: Array<{ start: string; end: string }>;
  blocked?: Array<{ startLocal: string; endLocal: string; reason?: string }>;
  maxCandidates?: number;
}

export interface ElectionalScanRequest {
  methodMode: ElectionalMethodMode;
  goal: string;
  objective: string;
  constraints: ElectionalWindowConstraints;
  natalCharts: Array<{ id: string; role: string; chart: BirthChart }>;
  topN?: number;
}

export interface ElectionalCandidateResult {
  localDateTime: string;
  evaluation: ElectionalEvaluation;
}

export interface ElectionalContinuousWindow {
  startLocal: string;
  endLocal: string;
  peakLocal: string;
  band: ElectionalJudgementBand;
  candidateCount: number;
  note: string;
}

export interface ElectionalScanResult {
  module: "western/electional";
  generatedCandidates: number;
  rejectedByPracticalConstraints: number;
  ranked: ElectionalCandidateResult[];
  windows: ElectionalContinuousWindow[];
  warning: string;
}
