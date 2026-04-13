import { PlanetType } from "./BirthChartInterfaces";
import { AspectType } from "./AstroChartInterfaces";

// ============================================================
// Essential Dignity Score
// ============================================================

export interface EssentialDignityScore {
  planetName: string;
  planetType: PlanetType;
  longitude: number;
  sign: string;
  degreeInSign: number;

  /** Signo cujo domicílio o planeta possui (se for regente) */
  domicile?: string;
  /** Signo cuja exaltação o planeta possui */
  exaltation?: string;
  /** Regente da triplicidade do signo atual (diurno/noturno) */
  triplicity?: string;
  /** Regente do termo */
  term?: string;
  /** Regente da face */
  face?: string;

  /** Signo de detrimento */
  detriment?: string;
  /** Signo de queda */
  fall?: string;

  /** Soma de dignidades - debilidades (-15 a +15) */
  essentialScore: number;
  /** Planet is without essential dignity (score ≤ 0) */
  isPeregrine: boolean;
}

// ============================================================
// Accidental Dignity Score
// ============================================================

export interface AccidentalDignityScore {
  planetName: string;
  planetType: PlanetType;

  houseStrength: number;
  houseType: string;
  isDirect: boolean;
  isSwift: boolean;
  isCombust: boolean;
  isCazimi: boolean;
  isUnderSunbeams: boolean;
  isOriental: boolean;

  conjunctBenefic: string[];
  conjunctMalefic: string[];
  isLordOfMC: boolean;
  fortuneInGoodHouse: boolean;

  accidentalScore: number;
  totalScore: number; // essentialScore + accidentalScore
}

// ============================================================
// Horary Significators
// ============================================================

export interface HorarySignificators {
  querent: {
    lord: PlanetType;
    lordName: string;
    house: number;
    essentialScore: number;
    accidentalScore: number;
    totalScore: number;
  };
  quesited: {
    lord: PlanetType;
    lordName: string;
    house: number;
    topicLabel: string;
    essentialScore: number;
    accidentalScore: number;
    totalScore: number;
  };
  derivedHouse: number;
  topic: string;
  topicLabel: string;
}

// ============================================================
// Collection (Application/Separation)
// ============================================================

export interface CollectionData {
  isApplying: boolean;
  aspectType?: AspectType;
  orb?: number;
  applyingPlanet: string;
  receivingPlanet: string;

  translation?: {
    translatingPlanet: string;
    from: string;
    to: string;
    aspectType: AspectType;
    orb: number;
  };

  prohibition?: {
    prohibitingPlanet: string;
    type: "aspect" | "position";
    details: string;
  };

  frustration?: {
    frustratingPlanet: string;
    details: string;
  };

  contrantiscion?: boolean;
}

// ============================================================
// Reception
// ============================================================

export interface ReceptionData {
  querentToQuesited?: {
    by: string[];
    strongest: string;
    strength: "forte" | "moderada" | "fraca";
  };
  quesitedToQuerent?: {
    by: string[];
    strongest: string;
    strength: "forte" | "moderada" | "fraca";
  };
  isMutual: boolean;
  mutualBy?: string;
}

// ============================================================
// Horary Parts
// ============================================================

export interface HoraryPart {
  name: string;
  longitude: number;
  sign: string;
  posFormatted: string;
  house: string;
}

// ============================================================
// Full Horary Data
// ============================================================

export interface HoraryData {
  question: string;
  questionTime: Date;
  chartCondition: "Diurno" | "Noturno";
  hourLord: string;

  ascendantDegree: number;
  ascendantIsCritical: boolean;
  ascendantTestimony: string;

  essentialDignities: EssentialDignityScore[];
  accidentalDignities: AccidentalDignityScore[];

  significators: HorarySignificators;
  collection: CollectionData;
  reception: ReceptionData;

  horaryParts: HoraryPart[];

  verdict: {
    score: number;
    confidence: "alto" | "moderado" | "baixo";
    summary: string;
    detailedReport: string[];
  };
}
