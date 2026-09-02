import type { VedicCompatibility, VedicSnapshot } from "../vedic";

export type JyotishModuleKey =
  | "janma"
  | "prashna"
  | "muhurta"
  | "varshaphala"
  | "dasha"
  | "gochara"
  | "vivaha";

export type JyotishSectionStatus = "implemented" | "mixed" | "placeholder";
export type JyotishValidationLevel = "info" | "warning" | "error";

export interface JyotishConfig {
  ayanamsha: "lahiri" | "krishnamurti" | "raman";
  kpEnabled: boolean;
  kpAyanamsha: "lahiri" | "krishnamurti" | "raman";
  kpHouseSystem: "placidus";
  kpRulingPlanetMode: "classical-5" | "extended-7";
  siderealZodiac: "nirayana";
  houseSystem: "whole-sign" | "sripati" | "equal";
  localityMode: "city-search" | "manual";
  timezoneMode: "city-derived" | "manual";
  sunriseMethod: "standard-disc" | "center-disc";
  moonMethod: "swisseph-derived";
  includeNodes: boolean;
  nodeAspectMode: "none" | "5-7-9" | "full-7";
  bhavaChalitSystem: "sripati" | "whole-sign";
  primaryDasha: "vimshottari";
  secondaryDasha:
    | "yogini"
    | "ashtottari"
    | "shodashottari"
    | "dwadashottari"
    | "kalachakra"
    | "chara"
    | "narayana"
    | "sthira";
  kalachakraCycleMode: "progressive-group" | "cyclic-pada" | "same-nakshatra-reset";
  enabledVargas: string[];
  friendshipRules: "parasari-classic";
  dignityRules: "parasari-classic";
  badhakaRules: "parasari";
  marakaRules: "parasari";
  mrityuBhagaRules: "sarvartha-chintamani" | "phala-deepika";
  ashtaKootaMode: "classical-36" | "southern-adjusted";
  kujaDoshaRules: "south-indian-mixed" | "classical-strict" | "relaxed-modern";
  yogaCancellationRules: "classical-mixed";
  jaiminiRules: "classical-7-chara-karaka";
  showAdvanced: boolean;
}

export interface JyotishTechnicalDatum {
  id: string;
  name: string;
  sanskritName?: string;
  category: string;
  module: JyotishModuleKey;
  value: string | number | boolean;
  unit?: string;
  relatedPlanet?: string;
  relatedHouse?: number;
  relatedSign?: string;
  relatedNakshatra?: string;
  relatedVarga?: string;
  methodUsed: string;
  technicalNotes: string;
  confidence: number;
  dependencies: string[];
  alerts: string[];
  status: JyotishSectionStatus;
}

export interface JyotishTable {
  id: string;
  title: string;
  description?: string;
  advanced?: boolean;
  columns: string[];
  rows: string[][];
}

export interface JyotishSection {
  id: string;
  title: string;
  description: string;
  status: JyotishSectionStatus;
  advanced?: boolean;
  items?: JyotishTechnicalDatum[];
  tables?: JyotishTable[];
  bullets?: string[];
}

export interface JyotishValidation {
  level: JyotishValidationLevel;
  message: string;
  field?: string;
  method?: string;
}

export interface JyotishCoverage {
  implemented: number;
  mixed: number;
  placeholder: number;
}

export interface EngineResult {
  sections: JyotishSection[];
  validations?: JyotishValidation[];
  summary?: string[];
}

export interface JyotishModuleResult {
  key: JyotishModuleKey;
  label: string;
  description: string;
  summary: string[];
  sections: JyotishSection[];
  validations: JyotishValidation[];
  report: string;
  jsonExport: Record<string, unknown>;
  printableHtml: string;
  coverage: JyotishCoverage;
}

export interface JyotishContext {
  primary: VedicSnapshot;
  transit: VedicSnapshot;
  partner?: VedicSnapshot;
  compatibility?: VedicCompatibility;
  config: JyotishConfig;
  question?: string;
  eventType?: string;
  selectedYear?: number;
}
