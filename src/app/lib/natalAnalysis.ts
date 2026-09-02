import {
  BirthChart,
  FixedStarMatch,
  Planet,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { AspectType } from "@/interfaces/AstroChartInterfaces";
import {
  AVERAGE_DAILY_SPEED,
  DETRIMENT,
  DOMICILE_RULER,
  EXALTATION,
  FACES,
  FALL,
  HOUSE_SCORES,
  JUBILEE_HOUSE,
  LILLY_TERMS,
  SIGN_ELEMENT,
  SIGN_QUALITIES,
  SIGN_GENDER,
  SIGN_FERTILITY,
  SIGN_VOICE,
  SIGN_CREATURE_TYPE,
  SIGN_DOUBLE_BODIED,
  LILLY_PLANET_SIGN_BODY_PARTS,
  isFeralLongitude,
  SIGNS,
  TRIPLICITY_RULERS,
} from "./traditionalTables";
import {
  getAbsoluteAngularDistance,
  getAspectAngleFromType,
  getAspectTypeFromSigns,
  getSignIndex,
  getTraditionalAspectOrbFromLongitudes,
  isApplyingByMotion,
  normalizeLongitude,
  resolveTraditionalAspect,
  TraditionalAspectMatch,
} from "./aspectDynamics";
import { getHouseIndex, getSect } from "./traditionalCalculations";
import { calculateTemperament, TemperamentResult } from "./traditionalTemperament";
import { calculateArabicLots, ORDERED_ARABIC_PART_KEYS } from "./arabicLots";
import {
  AI_NATAL_OUTPUT_RULES,
  EXPECTED_PROTOCOL_SECTIONS,
  NATAL_DOMAIN_CONTRACTS,
  UNIVERSAL_NATAL_JUDGMENT_RULES,
} from "@/traditions/western/natal/natalMethodContract";
import { MARCOS_CUSP_BASE_MAX_DEGREES, MARCOS_NATAL_INFLUENCE_MAX_ORB, classifyMarcosNatalInfluenceOrb, type MarcosNatalInfluenceTier } from "@/traditions/western/natal/natalMethodConstants";


const TRADITIONAL_TYPES = new Set<PlanetType>([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
]);

const BENEFICS = new Set(["Vênus", "Júpiter"]);
const MALEFICS = new Set(["Marte", "Saturno"]);
const DIURNAL_PLANETS = new Set(["Sol", "Júpiter", "Saturno"]);
const NOCTURNAL_PLANETS = new Set(["Lua", "Vênus", "Marte"]);
const MASCULINE_PLANETS = new Set(["Sol", "Júpiter", "Saturno", "Marte"]);
const FEMININE_PLANETS = new Set(["Lua", "Vênus"]);
const MODALITIES = [
  "Cardinal", "Fixo", "Mutável", "Cardinal", "Fixo", "Mutável",
  "Cardinal", "Fixo", "Mutável", "Cardinal", "Fixo", "Mutável",
] as const;
const ELEMENTS = ["Fogo", "Terra", "Ar", "Água"] as const;

export type Sect = "Diurno" | "Noturno";

export interface DignityTestimony {
  kind: "domicilio" | "exaltacao" | "triplicidade" | "termo" | "face";
  ruler: string;
  points: number;
}

export interface DebilityTestimony {
  kind: "exilio" | "queda" | "peregrino";
  points: number;
}

export interface EssentialCondition {
  planet: string;
  longitude: number;
  sign: string;
  degreeInSign: number;
  rulers: {
    domicile: string;
    exaltation?: string;
    triplicity: string;
    term: string;
    face: string;
  };
  dignities: DignityTestimony[];
  debilities: DebilityTestimony[];
  isPeregrine: boolean;
  marcosScore: number;
  frawleyScore: number;
}

export interface AccidentalTestimony {
  code: string;
  label: string;
  /** Audit-only numeric ledger; never a Marcos canonical total. */
  score: number;
  scoreProvenance: "FRAWLEY_APPLIED_LEDGER" | "LEGACY_AUDIT_ONLY" | "NONE";
  source: "Frawley" | "Marcos Monteiro" | "Frawley e Marcos Monteiro";
  details: string;
}

export type SolarCondition = "cazimi" | "combusto" | "sob-os-raios" | "proximidade-trans-signo" | "oposto-ao-sol" | "livre" | "sol";

export interface AccidentalCondition {
  planet: string;
  /** Canonical effective house used by the Marcos-first natal layer. */
  house: number;
  geometricHouse: number;
  effectiveHouseMarcos: number;
  effectiveHouseFrawley: number;
  houseResolution: "geometric" | "same-sign-within-5";
  /** Absolute distance to the cusp of the effective house. */
  distanceFromHouseCusp: number;
  sameSignAsHouseCusp: boolean;
  orientation: "oriental" | "ocidental" | "luminar";
  /** Marcos-first canonical classification used by the Natal layer. */
  solarCondition: SolarCondition;
  /** Source-specific boundaries are preserved instead of blending Marcos and Frawley. */
  solarConditionBySource: {
    marcos: SolarCondition;
    frawleyApplied: SolarCondition;
    solarDistance: number;
    sameSignAsSun: boolean;
  };
  isHalb: boolean;
  isHayz: boolean;
  speedRatio: number;
  testimonies: AccidentalTestimony[];
  frawleyScore: number;
}

export interface RankedPlanet {
  planet: string;
  essentialScore: number;
  accidentalScore: number;
  totalScore: number;
  tied: boolean;
}

export interface DegreeAlmuten {
  point: string;
  longitude: number;
  winner: string | null;
  tiedWinners: string[];
  scores: Record<string, number>;
}

export interface AntiscionPosition {
  point: string;
  longitude: number;
  antiscion: number;
  oppositeAntiscion: number;
}

export interface AntiscionContact {
  first: string;
  second: string;
  type: "conjuncao" | "oposicao";
  orb: number;
}

export interface DispositorChain {
  planet: string;
  chain: string[];
  finalDispositor: string | null;
  cycle: string[] | null;
}

export type ReceptionKind = DignityTestimony["kind"] | "exilio" | "queda";

export interface ReceptionTestimony {
  guest: string;
  receiver: string;
  by: ReceptionKind;
  polarity: "positiva" | "negativa";
  strength: number;
  hasAspect: boolean;
  aspect?: AspectType;
  orb?: number;
}

export interface MutualReception {
  planets: [string, string];
  firstReceivesSecondBy: ReceptionKind[];
  secondReceivesFirstBy: ReceptionKind[];
  hasAspect: boolean;
  aspect?: AspectType;
  orb?: number;
}

export interface MentalSignificatorDossier {
  planet: "Lua" | "Mercúrio";
  longitude: number;
  sign: string;
  element: string;
  modality: string;
  /**
   * Propriedades tradicionais do signo já resolvidas pelo motor. A IA não deve
   * reconstruir voz/fertilidade/natureza do signo a partir de tabelas próprias.
   */
  signProperties: SignPropertyDossier;
  degreeAlmuten: DegreeAlmuten;
  domicileDispositor: string;
  essentialCondition: EssentialCondition;
  accidentalCondition: AccidentalCondition;
}

export interface MentalityAnalysis {
  method: "evidencia tecnica - Marcos/Frawley/Gugu";
  status: "dados-prontos-para-interpretacao";
  moon: MentalSignificatorDossier & {
    phase: string;
    phaseAngle: number;
    phaseQualities: string[];
  };
  mercury: MentalSignificatorDossier;
  moonMercuryConnection: {
    /** Marcos natal influence gate: <=3° núcleo; >3° a <=5° relevância contextual. */
    connected: boolean;
    geometricConnected: boolean;
    aspect?: AspectType;
    orb?: number;
    applying?: boolean;
    marcosNatalEligible?: boolean;
    marcosInfluenceTier?: MarcosNatalInfluenceTier;
  };
  modifyingAspects: Array<{
    significator: "Lua" | "Mercúrio";
    planet: string;
    aspect: AspectType;
    orb: number;
    applying: boolean;
    marcosNatalEligible: boolean;
    marcosInfluenceTier: MarcosNatalInfluenceTier;
    sourceLayers: Array<"Marcos" | "Frawley-context">;
  }>;
  ascendantRuler: string;
  ascendantRulerCondition: {
    essential: EssentialCondition;
    accidental: AccidentalCondition;
  };
  /**
   * Marcos' worked nativities (notably Guénon) frequently make the mental
   * judgement by cross-linking Moon/Mercury with Arabic Parts and antiscia.
   * These contacts used to exist only in the global dossiers, forcing the AI
   * to rediscover the relevant subset. They are now preselected here without
   * adding a new interpretation or score.
   */
  contextualContacts: {
    lotRelations: Array<{
      significator: "Lua" | "Mercúrio";
      lot: string;
      relation: "conjunction" | "opposition";
      orb: number;
      activeMarcos: boolean;
    }>;
    antiscionContacts: AntiscionContact[];
  };
  sourceVariants: {
    marcos: {
      role: "primario";
      evidence: string[];
    };
    frawley: {
      role: "complementar";
      evidence: string[];
    };
    gugu: {
      role: "suplemento-autoral-identificado";
      moonAlmuten: DegreeAlmuten;
      mercuryAlmuten: DegreeAlmuten;
      compoundMentalityCandidates: string[];
      modalityBalance: Record<string, number>;
      significators: Array<{ point: string; sign: string; modality: string }>;
      sunCondition: {
        house: number;
        orientation: string;
        solarCondition: string;
      };
      sunRole: "moral-consciousness-reflection-modifier-not-primary-mental-significator";
      primaryMentalSignificators: ["Lua", "Mercúrio"];
      angleProximity: Array<{
        planet: string;
        nearestAngle: "ASC" | "IC" | "DSC" | "MC";
        distanceFromAngle: number;
      }>;
      orientationEvidence: Array<{ planet: string; orientation: string; house: number }>;
      mcIcProximity: Array<{ planet: string; distanceFromMC: number; distanceFromIC: number; nearer: "MC" | "IC" }>;
      ascendantPlanetsRaw: Array<{ planet: string; effectiveHouse: number; distanceFromASC: number; essentialDignities: string[]; essentialDebilities: string[] }>;
      moonNodeRawDistance: {
        northNode: number | null;
        southNode: number | null;
        nearestNode: "Nodo Norte" | "Nodo Sul" | null;
        nearestDistance: number | null;
        northSquareError: number | null;
        southSquareError: number | null;
        nearestSquareNode: "Nodo Norte" | "Nodo Sul" | null;
        nearestSquareError: number | null;
        conservativePartileNearNode1Deg: boolean;
        conservativePartileSquare1Deg: boolean;
        sourceRule: {
          nearNode: "mais-pratica-incisiva-ativa";
          squareNodes: "mais-sensivel-artistica-voluvel";
        };
        interpretationStatus: "RULE_SEMANTICS_SOURCE_LOCKED_ORB_UNSPECIFIED";
      };
      properPlaces: Array<{
        planet: "Mercúrio" | "Vênus" | "Marte" | "Júpiter" | "Saturno";
        offsetSigns: 1 | 2 | 3 | 4 | 5;
        signIndex: number;
        moonSignIndex: number;
        sunSignIndex: number;
        signsBeforeMoon: number;
        signsAfterSun: number;
        beforeMoonMatch: boolean;
        afterSunMatch: boolean;
        inProperPlace: boolean;
        mentalModifierWhenSignificator: "liberal-franca-autoconfiante-corajosa-engenhosa-aberta-aguda";
      }>;
      properPlacesStatus: "SOURCE_LOCKED_IMPLEMENTED";
      evidence: string[];
    };
  };
  unresolved: string[];
}

export interface MannerAnalysis {
  method: "John Frawley - The Real Astrology Applied (published legacy)";
  sourceStatus: "published-legacy-current-version-not-publicly-specified";
  status: "selecionado" | "multiplos-testemunhos" | "fallback-regente-do-ascendente";
  selected: string | null;
  candidates: Array<{
    planet: string;
    basis: "signo-ascendente" | "contato-lua-mercurio" | "regente-do-ascendente";
    orb?: number;
    essentialScore: number;
    accidentalScore: number;
  }>;
}



export type TemperamentalQuality = "quente" | "frio" | "seco" | "úmido";

export interface FrawleyTemperamentDossier {
  method: "John Frawley - published executable baseline + current public doctrine";
  publishedBaselineSource: "The Real Astrology Applied";
  currentPublicDoctrineSource: "Conversations on Natal Astrology 1/3 + Approaching the Birthchart syllabus";
  exactCurrentCalculationStatus: "CURRENT_METHOD_NOT_PUBLIC";
  status: "evidence-ready-qualitative-judgment";
  witnesses: Array<{
    key: "first-house-and-ruler" | "sun" | "moon" | "lord-of-geniture";
    qualities: TemperamentalQuality[];
    evidence: string[];
  }>;
  lordOfGenitureCandidates: RankedPlanet[];
  currentDoctrine: {
    foundation: "temperament-first";
    temperamentMeaning: "mixture-hot-cold-moist-dry";
    archetypalDirections: {
      choleric: "agir";
      sanguine: "pensar";
      melancholic: "ter-e-reter";
      phlegmatic: "sentir";
    };
    prioritiesAfterTemperament: ["fase-da-Lua", "Mercúrio"];
    noIntelligenceShortcut: true;
    noMedicalReduction: true;
  };
  conclusion: null;
  note: string;
}

export interface GuguTemperamentDossier {
  method: "Luiz Gonzaga de Carvalho Neto - historical course layers";
  status: "historical-and-detailed-ledger-executable-with-explicit-orb-boundary";
  historicalFourComponents: Array<{
    key: "ascendant" | "solar-season" | "moon-phase" | "strongest-planet";
    qualities: TemperamentalQuality[];
    evidence: string[];
  }>;
  detailedMethod: {
    sourceStatus: "SOURCE_LOCKED_DETERMINANTS_AND_POINT_LEDGER";
    determinantGroups: [
      "ascendant",
      "ascendant-ruler-and-aspects",
      "moon-phase-dispositor-and-aspects",
      "solar-season",
      "strongest-planet"
    ];
    witnesses: Array<{
      group: "ascendant" | "ascendant-ruler" | "aspect-to-ascendant" | "moon-phase" | "moon-dispositor" | "aspect-to-moon" | "solar-season" | "strongest-planet";
      source: string;
      qualities: TemperamentalQuality[];
      pointsPerQuality: 1;
      includedInBaseCount: boolean;
      inclusionStatus: "SOURCE_LOCKED" | "ORB_BOUNDARY_UNPUBLISHED";
      evidence: string[];
    }>;
    baseCounts: Record<TemperamentalQuality, number>;
    baseClassification: {
      temperature: "quente" | "frio" | "equilibrado";
      moisture: "úmido" | "seco" | "equilibrado";
      primary: "colérico" | "sanguíneo" | "melancólico" | "fleumático" | "misto/indeterminado";
      secondary: "colérico" | "sanguíneo" | "melancólico" | "fleumático" | null;
      evidence: string;
    };
    qualitativeConsiderations: Array<{
      key: "fixed-stars" | "asc-ruler-and-dispositor" | "mentality" | "exceptionally-prominent-planets";
      status: "MATERIALIZED_FOR_JUDGMENT";
      evidence: string[];
      numericWeightApplied: false;
    }>;
    nodeRule: {
      northNodeAnalogy: "Júpiter+Vênus";
      southNodeAnalogy: "Saturno+Marte";
      beneficAspectChoosesNorth: true;
      squareChoosesSouth: true;
      conjunctionChoosesContactedNode: true;
      aspectOrbStatus: "AUTHORIAL_ORB_NOT_UNIVERSALLY_PUBLISHED";
    };
  };
  laterCourseStatus: "DETAILED_WITNESS_LEDGER_IMPLEMENTED_ORB_BOUNDARY_EXPLICIT";
  laterCourseEvidence: string[];
  conclusion: null;
  note: string;
}

export interface GuguPrimaryMotivationDossier {
  method: "Luiz Gonzaga de Carvalho Neto - Cosmologia e Astrologia Medieval";
  status: "SOURCE_LOCKED_IMPLEMENTED_WITH_QUALITATIVE_SELECTION";
  ascendant: {
    longitude: number;
    sign: string;
    ruler: string;
    directionAxis: string;
  };
  ascendantRuler: {
    planet: string;
    sign: string;
    house: number;
    dispositor: string;
    evidence: string[];
  };
  realizationInstrument: {
    planet: string;
    sign: string;
    house: number;
    evidence: string[];
  };
  strongestPlanetCandidates: Array<{
    planet: string;
    house: number;
    majorEssentialDignities: string[];
    relationToAscendant: string[];
    relationToAscendantRuler: string[];
    candidateStatus: "primary-candidate" | "secondary-candidate" | "weak-candidate";
  }>;
  selectedStrongestPlanet: string | null;
  selectionStatus: "single-clear-candidate" | "qualitative-selection-required" | "no-major-dignity-candidate";
  saturnChallenge: {
    house: number;
    geometricHouse: number;
    sign: string;
    interpretationAxis: string;
  };
  interpretiveGuardrails: string[];
}

export interface GuguPowerOfSoulDossier {
  method: "Luiz Gonzaga de Carvalho Neto / Pedro Sette Câmara - analogical planetary faculties";
  attributionStatus: "HISTORICAL_ANALOGY_NOT_ONTOLOGICAL_IDENTITY";
  faculties: Array<{
    planet: "Lua" | "Mercúrio" | "Vênus" | "Sol" | "Marte" | "Júpiter" | "Saturno";
    faculty:
      | "sentido-comum-fantasia"
      | "estimativa"
      | "apetite-concupiscivel"
      | "vontade"
      | "apetite-irascivel"
      | "intelecto-paciente"
      | "intelecto-agente";
    longitude: number;
    sign: string;
    house: number;
    ruledHouses: number[];
    essential: EssentialCondition;
    accidental: AccidentalCondition;
    dispositor: string;
    note: string;
  }>;
  philosophicalGuardrails: string[];
}

export interface GuguPlanetRoleMatrix {
  method: "Luiz Gonzaga de Carvalho Neto - multi-role planetary reading";
  planets: Array<{
    planet: string;
    roles: Array<
      "temperament-component"
      | "mental-faculty"
      | "house-ruler"
      | "house-occupant"
      | "natural-significator"
      | "relational-agent"
    >;
    ruledHouses: number[];
    occupiedHouse: number;
    dispositor: string;
    faculty: string;
  }>;
  note: string;
}

export interface GuguPhilosophicalFrame {
  method: "Luiz Gonzaga de Carvalho Neto - symbolic/cosmological frame";
  principles: string[];
  interpretiveProhibitions: string[];
  anthropologyLayers: Array<"mineral-corporeal" | "vegetative" | "sensitive" | "rational-intellective">;
  note: string;
}

export interface AuthorialTemperamentsDossier {
  marcos: TemperamentResult;
  frawley: FrawleyTemperamentDossier;
  gugu: GuguTemperamentDossier;
}

export interface GuguNatalDossier {
  temperament: GuguTemperamentDossier;
  primaryMotivation: GuguPrimaryMotivationDossier;
  powersOfSoul: GuguPowerOfSoulDossier;
  planetRoleMatrix: GuguPlanetRoleMatrix;
  philosophicalFrame: GuguPhilosophicalFrame;
}

export interface FrawleyLifeIndicators {
  method: "John Frawley current - Conversations on Natal Astrology 2";
  houseSystem: "Placidus";
  hyleg: {
    planet: "Sol" | "Lua" | null;
    reason: string;
    effectiveHouse: number | null;
  };
  anareta: {
    planet: string | null;
    reason: string;
    eighthHousePlanets: Array<{ planet: string; distanceFromCusp: number }>;
  };
  alcochoden: {
    planet: string | null;
    reason: string;
  };
  longevityEvidence: Array<{ point: string; condition: string; evidence: string[] }>;
  caveat: string;
}

export interface HouseTechnicalDossier {
  house: number;
  topic: string;
  canonicalTopics: string[];
  medicalBodyParts: string[];
  coSignificatorNatural: string | null;
  joyPlanet: string | null;
  cuspLongitude: number;
  cuspSign: string;
  cuspAntiscion: number;
  cuspContraAntiscion: number;
  domicileRuler: string;
  naturalSignificators: string[];
  rulerEssential: EssentialCondition | null;
  rulerAccidental: AccidentalCondition | null;
  rulerDispositor: string | null;
  rulerAspects: Array<{ planet: string; aspect: AspectType; orb: number; applying: boolean; marcosNatalEligible: boolean; marcosInfluenceTier: MarcosNatalInfluenceTier; sourceLayers: Array<"Marcos" | "Frawley-context"> }>;
  rulerReceptions: ReceptionTestimony[];
  occupants: Array<{
    planet: string;
    longitude: number;
    geometricHouse: number;
    effectiveHouseMarcos: number;
    distanceFromCusp: number;
    onCuspMarcos: boolean;
    planetAffectedByHouse: true;
    directlyTestifiesHouseMarcos: boolean;
  }>;
  geometricOccupants: Array<{ planet: string; longitude: number; geometricHouse: number; effectiveHouseMarcos: number }>;
  cuspPlanetContacts: Array<{ planet: string; orb: number; sameSign: boolean; directHouseTestimonyMarcos: boolean }>;
  cuspFixedStars: FixedStarMatch[];
  activeLots: Array<{ name: string; aspect: AspectType; orb: number; activeMarcos: boolean }>;
}

export interface GeneralFortuneDossier {
  method: "Frawley current syllabus - technical evidence package";
  status: "public-syllabus-confirmed-exact-current-lesson-rule-not-public";
  foundations: Array<{ point: string; evidence: string[] }>;
  beneficSupport: Array<{ planet: string; evidence: string[] }>;
  maleficPressure: Array<{ planet: string; evidence: string[] }>;
  note: string;
}

export interface ModesDossier {
  frawleyAppliedLegacy: MannerAnalysis;
  guguSupplement: {
    status: "secondary-transcript";
    modalityEvidence: Record<string, number>;
    significators: Array<{ point: string; sign: string; modality: string }>;
    note: string;
  };
}

export interface ProfessionDossier {
  method: "Frawley Applied + Marcos capability framing + Gugu supplement";
  house10: HouseTechnicalDossier;
  corePlanets: Array<{ planet: "Mercúrio" | "Vênus" | "Marte"; essential: EssentialCondition; accidental: AccidentalCondition }>;
  mcFixedStars: FixedStarMatch[];
  ruler10Modality: string;
  frawleyVocationalIndicators: {
    planetsIn10: string[];
    fallbackRuler10: string;
    verifiedCriteria: string[];
    disabledUnverifiedCriteria: string[];
    note: string;
  };
  vocationalLots: {
    vocation: { longitude: number; dispositor: string; house: number; formula: string };
    fameOrWorkToBeDone: { longitude: number; dispositor: string; house: number; formula: string };
  };
  guguSupplement: {
    status: "secondary-transcript";
    angularProminence: Array<{ planet: string; house: number; angle: "ASC" | "IC" | "DSC" | "MC"; distanceFromAngle: number }>;
    angleProximity: Array<{ planet: string; nearestAngle: "ASC" | "IC" | "DSC" | "MC"; distanceFromAngle: number }>;
    strongTraditionalPlanets: Array<{ planet: string; essentialDignities: string[]; house: number }>;
    note: string;
  };
  evidence: string[];
}

export interface RelationshipDossier {
  method: "Marcos Monteiro primary + Frawley house/Part supplement";
  ruler1: string;
  ruler7: string;
  ruler1Essential: EssentialCondition;
  ruler1Accidental: AccidentalCondition;
  ruler7Essential: EssentialCondition;
  ruler7Accidental: AccidentalCondition;
  directAspect: { aspect: AspectType; orb: number; applying: boolean; marcosNatalEligible: true; marcosInfluenceTier: MarcosNatalInfluenceTier } | null;
  broaderTraditionalAspect: { aspect: AspectType; orb: number; applying: boolean; sourceLayers: ["Frawley-context"] } | null;
  reception1To7: ReceptionTestimony[];
  reception7To1: ReceptionTestimony[];
  cusp1Stars: FixedStarMatch[];
  cusp7Stars: FixedStarMatch[];
  partOfLove: TechnicalLotDossier | null;
  frawleyMarriageParts: Array<{
    id: "relationship" | "marriage-partner" | "male-native" | "female-native" | "applied-example";
    longitude: number;
    dispositor: string;
    house: number;
    formula: string;
    sourceStatus: "revised-horary-published" | "applied-published-example";
    note: string;
  }>;
}

export interface HealthSymbolicDossier {
  method: "Marcos Monteiro - symbolic predisposition evidence";
  disclaimer: string;
  temperament: TemperamentResult;
  ruler1: string;
  ruler6: string;
  house1: HouseTechnicalDossier;
  house6: HouseTechnicalDossier;
  relevantStars: FixedStarMatch[];
  relevantLots: TechnicalLotDossier[];
  planetSignMedicalCorrespondences: Array<{
    planet: string;
    sign: string;
    bodyParts: string[];
    source: "William Lilly CA I p.119-120; traditional table explicitly invoked by Marcos";
  }>;
  outerCuspModifiers: Array<{
    planet: "Urano" | "Netuno" | "Plutão";
    cusp: string;
    house: number;
    aspect: "conjunction" | "opposition";
    orb: number;
    authorialOrbStatus: "UNIVERSAL_CUTOFF_NOT_PUBLISHED";
  }>;
}

export interface SignPropertyDossier {
  sign: string;
  fertility: "fértil" | "estéril" | "neutro";
  voice: "mudo" | "voz-alta" | "meia-voz" | "voz-fraca";
  creatureType: "humano" | "bestial" | "neutro";
  feral: boolean;
  doubleBodied: boolean;
}

export interface FrawleySpiritualPart {
  key: "spirit" | "faith" | "love" | "despair" | "valour" | "victory" | "captivity";
  name: string;
  longitude: number;
  formula: string;
  dispositor: string;
  housePlacement: TechnicalHousePlacement;
  antiscion: number;
  contraAntiscion: number;
}

export interface SpiritualOrientationDossier {
  method: "John Frawley - The Real Astrology Applied (published legacy)";
  house9: HouseTechnicalDossier;
  house3: HouseTechnicalDossier;
  ruler9: string;
  ruler3: string;
  ascendantRuler: string;
  jupiter: { essential: EssentialCondition; accidental: AccidentalCondition };
  moon: { essential: EssentialCondition; accidental: AccidentalCondition };
  sun: { essential: EssentialCondition; accidental: AccidentalCondition };
  partOfFortune: TechnicalLotDossier | null;
  sevenKeyLots: FrawleySpiritualPart[];
  royalStarContacts: FixedStarMatch[];
  receptionsWithRulerAscendant: ReceptionTestimony[];
  note: string;
}

export interface ChildrenDossier {
  method: "John Frawley - The Real Astrology Applied (published legacy)";
  house5: HouseTechnicalDossier;
  cuspSignProperties: SignPropertyDossier;
  ruler5: string;
  ruler5SignProperties: SignPropertyDossier;
  moon: { essential: EssentialCondition; accidental: AccidentalCondition; signProperties: SignPropertyDossier };
  jupiter: { essential: EssentialCondition; accidental: AccidentalCondition; signProperties: SignPropertyDossier };
  partOfChildren: {
    longitude: number;
    dispositor: string;
    house: number;
    formula: string;
    formulaStatus: "frawley-published-night-example" | "traditional-day-reversal-supplement";
    signProperties: SignPropertyDossier;
  };
  note: string;
}

export interface WealthDossier {
  method: "John Frawley - The Real Astrology Applied (published legacy)";
  house2: HouseTechnicalDossier;
  ruler2: string;
  jupiterNaturalWealth: { essential: EssentialCondition; accidental: AccidentalCondition };
  partOfFortune: TechnicalLotDossier | null;
  fortuneDispositor: string | null;
  note: string;
}

export interface SourceRegistryEntry {
  id: string;
  author: "Marcos Monteiro" | "John Frawley" | "Luiz Gonzaga de Carvalho Neto" | "Swiss Ephemeris";
  source: string;
  url?: string;
  evidenceKind: "direct" | "published" | "secondary-transcript" | "software";
  status: "canonical" | "current" | "legacy-published" | "supplemental" | "technical";
  note: string;
}

export interface TechnicalHousePlacement {
  point: string;
  longitude: number;
  geometricHouse: number;
  nextCusp: number;
  distanceToNextCusp: number;
  sameSignAsNextCusp: boolean;
  withinFiveDegreesBeforeNextCusp: boolean;
  /** Compatibility field: populated when the <=5° same-sign rule resolves to the next house. */
  marcosEffectiveHouseCandidate: number | null;
  effectiveHouseMarcos: number;
  effectiveHouseFrawley: number;
  resolution: "geometric" | "same-sign-within-5";
  ruleScope: "planet-effective" | "point-contact-only";
}

export interface TechnicalLotDossier {
  key: string;
  name: string;
  longitude: number;
  formula: string;
  housePlacement: TechnicalHousePlacement;
  domicileDispositor: string;
  dispositorEssential: EssentialCondition | null;
  dispositorAccidental: AccidentalCondition | null;
  antiscion: number;
  relations: Array<{
    target: string;
    targetType: "planet" | "cusp" | "arabicPart";
    aspect: AspectType;
    orb: number;
    applying: boolean;
    activeMarcos: boolean;
    activationThresholdDegrees: number;
    rule: "conjunction-or-opposition" | "cusp-conjunction";
  }>;
  frawleyPublishedAspects: Array<{
    planet: string;
    aspect: AspectType;
    orb: number;
    applyingByInstantaneousMotion: boolean;
    source: "The Real Astrology Applied";
  }>;
}

export interface PlanetTechnicalPacket {
  planet: string;
  longitude: number;
  sign: string;
  ruledHouses: number[];
  housePlacement: TechnicalHousePlacement;
  essential: EssentialCondition;
  accidental: AccidentalCondition;
  dispositor: DispositorChain;
  aspects: Array<{
    planet: string;
    aspect: AspectType;
    orb: number;
    applying: boolean;
    marcosNatalEligible: boolean;
    marcosInfluenceTier: MarcosNatalInfluenceTier;
    sourceLayers: Array<"Marcos" | "Frawley-context">;
  }>;
  receptionsAsGuest: ReceptionTestimony[];
  receptionsAsReceiver: ReceptionTestimony[];
  fixedStars: FixedStarMatch[];
  nodeConjunctions: Array<{ node: string; orb: number; sourceGate: "CONJUNCTION_ONLY_CONSERVATIVE_1DEG" }>;
  nodeRawDistances: Array<{ node: string; distance: number }>;
  antiscionContacts: AntiscionContact[];
}

export interface DerivedHouseLookupEntry {
  baseHouse: number;
  relativeHouse: number;
  resolvedHouse: number;
  resolvedRuler: string;
  derivation: string;
}


export type NatalSourceGapStatus =
  | "RESOLVED_IMPLEMENTED"
  | "PARTIAL_RAW_EVIDENCE_ONLY"
  | "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED"
  | "CURRENT_METHOD_NOT_PUBLIC"
  | "SOURCE_LOCKED_UNRESOLVED"
  | "REJECTED_UNVERIFIED"
  | "OUTSIDE_STATIC_NATAL_EXECUTION";

export interface NatalSourceGapEntry {
  id: string;
  author: "Marcos Monteiro" | "John Frawley" | "Luiz Gonzaga de Carvalho Neto";
  domain: string;
  status: NatalSourceGapStatus;
  blocksRadicalInterpretation: boolean;
  availableEvidence: string[];
  missingEvidence: string[];
  engineBehavior: string;
  provenance: string[];
}

function buildNatalSourceGapRegistry(): NatalSourceGapEntry[] {
  return [
    {
      id: "gugu-proper-places", author: "Luiz Gonzaga de Carvalho Neto", domain: "mentalidade",
      status: "RESOLVED_IMPLEMENTED", blocksRadicalInterpretation: false,
      availableEvidence: [
        "tabela completa recuperada: Mercúrio 1 signo antes da Lua ou 1 depois do Sol; Vênus 2; Marte 3; Júpiter 4; Saturno 5",
        "a fonte atribui ao significador em lugar próprio um modificador de liberalidade, franqueza, autoconfiança, coragem, engenho, abertura e agudeza",
      ],
      missingEvidence: [],
      engineBehavior: "calcula por signo os dois caminhos de lugar próprio para Mercúrio/Vênus/Marte/Júpiter/Saturno e marca inProperPlace sem score agregado",
      provenance: ["G-TX: Notas sobre Mentalidade ou Disposição Geral da Mente, preservadas na Sinopse dos Cálculos de Temperamento (Bruno Melchiori)", "web verification 28/08/2026"],
    },
    {
      id: "gugu-moon-nodes", author: "Luiz Gonzaga de Carvalho Neto", domain: "mentalidade",
      status: "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED", blocksRadicalInterpretation: false,
      availableEvidence: [
        "regra semântica recuperada: Lua perto dos Nodos → mentalidade mais prática, incisiva e ativa",
        "Lua em quadratura aos Nodos → mentalidade mais sensível, artística e volúvel",
        "distâncias exatas a ambos os nodos e erros para quadratura são calculados",
      ],
      missingEvidence: ["orbe/limiar autoral explícito para 'perto' e para aceitar a quadratura"],
      engineBehavior: "entrega geometria integral, semântica source-locked e gates partís conservadores de 1° claramente não atribuídos a Gugu; não inventa orbe autoral",
      provenance: ["G-TX: Notas sobre Mentalidade ou Disposição Geral da Mente, preservadas na Sinopse dos Cálculos de Temperamento (Bruno Melchiori)", "web verification 28/08/2026"],
    },
    {
      id: "marcos-node-orb", author: "Marcos Monteiro", domain: "nodos natais",
      status: "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED", blocksRadicalInterpretation: false,
      availableEvidence: ["Marcos afirma que somente a conjunção com os nodos é relevante", "distâncias brutas planeta–Nodo Norte/Sul são calculadas integralmente"],
      missingEvidence: ["orbe universal explícito para a conjunção nodal no corpus fornecido"],
      engineBehavior: "preserva todas as distâncias e usa 1° apenas como gate conservador de testemunho partil; não atribui esse 1° como orbe autoral de Marcos",
      provenance: ["M-BK capítulo de dignidades acidentais: Conjunção com os Nodos"],
    },
    {
      id: "frawley-current-temperament-delta", author: "John Frawley", domain: "temperamento",
      status: "CURRENT_METHOD_NOT_PUBLIC", blocksRadicalInterpretation: false,
      availableEvidence: [
        "The Real Astrology Applied publica um baseline executável: Casa I/regente, Sol/Lua e Senhor da Genitura, julgados por quente/frio/úmido/seco",
        "Conversations on Natal Astrology 1/3 preserva o temperamento como fundação e prioriza depois fase lunar e Mercúrio",
        "o syllabus atual de Approaching the Birthchart declara que a compreensão do cálculo avançou consideravelmente desde Applied",
      ],
      missingEvidence: ["passo a passo integral do cálculo contemporâneo, disponível no tutorial atual e não publicado no corpus recuperável"],
      engineBehavior: "executa o último baseline publicado como Frawley publishedExecutableBaseline, expõe a doutrina pública atual em paralelo e marca explicitamente que não é o algoritmo atual exato",
      provenance: ["F-APP pp. 183–184", "F-CUR Conversations on Natal Astrology 1/3", "F-CUR Approaching the Birthchart syllabus"],
    },
    {
      id: "gugu-later-temperament-table", author: "Luiz Gonzaga de Carvalho Neto", domain: "temperamento",
      status: "RESOLVED_IMPLEMENTED", blocksRadicalInterpretation: false,
      availableEvidence: [
        "aulas 10–11 recuperam os cinco determinantes: Ascendente; regente do Ascendente + aspectos ao ASC; fase da Lua + dispositor + aspectos; estação solar; planeta mais forte",
        "a demonstração manda marcar um ponto por qualidade em cada testemunho-base e permite o mesmo corpo contar novamente quando exerce outra função",
        "as considerações finais são separadas da soma-base: estrelas fixas, natureza/condição do regente do ASC e dispositor, mentalidade e planetas excepcionalmente destacados",
        "as próprias aulas explicitam que os sinais '+' das considerações valem menos de um ponto (meio ponto no máximo no exemplo), portanto não são convertidos em peso universal pelo motor",
        "Cabeça do Dragão combina Júpiter+Vênus; Cauda combina Saturno+Marte; opostos se cancelam e qualidades repetidas não dobram o ponto",
      ],
      missingEvidence: [],
      engineBehavior: "executa a contagem-base detalhada recuperada, preserva cada testemunho em ledger auditável e mantém as considerações qualitativas fora de um score universal inventado",
      provenance: ["G-TX Cosmologia e Astrologia Medieval 10", "G-TX Cosmologia e Astrologia Medieval 11", "Live Temperamentos e Mentalidades Gugu + Marcos"],
    },
    {
      id: "gugu-temperament-node-angle-orb", author: "Luiz Gonzaga de Carvalho Neto", domain: "temperamento / nodos e ângulos",
      status: "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED", blocksRadicalInterpretation: false,
      availableEvidence: [
        "o procedimento demonstrado inclui a Cabeça do Dragão em aspecto com o Ascendente como testemunho possível",
        "a semântica quente/frio/úmido/seco dos nodos é recuperada por composição planetária",
        "a geometria exata nodo→ASC é calculada integralmente",
      ],
      missingEvidence: ["orbe universal explícito e estável para nodo→ângulo no procedimento de temperamento"],
      engineBehavior: "materializa o aspecto e a distância, mas não o pontua automaticamente sem limiar autoral recuperado",
      provenance: ["G-TX Cosmologia e Astrologia Medieval 10", "G-TX Cosmologia e Astrologia Medieval 11"],
    },
    {
      id: "frawley-current-loud-planets", author: "John Frawley", domain: "planetas excepcionalmente salientes",
      status: "CURRENT_METHOD_NOT_PUBLIC", blocksRadicalInterpretation: false,
      availableEvidence: ["o catálogo atual de aulas confirma um módulo sobre planetas que 'shout especially loudly' no mapa"],
      missingEvidence: ["algoritmo e critérios integrais do módulo atual"],
      engineBehavior: "não inventa um loudness score; angularidade, dignidade, estrelas e demais condições já ficam disponíveis no dossiê técnico para julgamento humano/IA",
      provenance: ["F-CUR natal audio lectures syllabus"],
    },
    {
      id: "frawley-current-general-fortune", author: "John Frawley", domain: "general-fortune",
      status: "CURRENT_METHOD_NOT_PUBLIC", blocksRadicalInterpretation: false,
      availableEvidence: ["currículo atual confirma o módulo General Fortune", "o motor já possui o dossiê universal completo de sete planetas e doze casas que pode servir de entrada sem alegar que estes sejam o algoritmo proprietário atual"],
      missingEvidence: ["algoritmo integral da versão atual não publicado no corpus fornecido"],
      engineBehavior: "materializa testemunhos e identifica o gate; não inventa veredito atual de Frawley",
      provenance: ["F-CUR syllabus", "F-APP legacy-published"],
    },
    {
      id: "frawley-current-manner-delta", author: "John Frawley", domain: "manner",
      status: "CURRENT_METHOD_NOT_PUBLIC", blocksRadicalInterpretation: false,
      availableEvidence: ["The Real Astrology Applied publica a sequência: planeta no signo ascendente → planeta ligado a Lua/Mercúrio → regente do Ascendente; Sol/Lua não candidatos"],
      missingEvidence: ["eventuais alterações da versão atual não publicadas no corpus"],
      engineBehavior: "usa a variante publicada como legacy-published e rotula a proveniência; não a chama de regra atual",
      provenance: ["F-APP pp. 184–185", "F-CUR scope confirmation"],
    },
    {
      id: "frawley-profession-sunrise-criterion", author: "John Frawley", domain: "profissão",
      status: "REJECTED_UNVERIFIED", blocksRadicalInterpretation: false,
      availableEvidence: ["F-APP verifica Casa X, regente X, planetas em X e Mercúrio/Vênus/Marte", "The Horary Textbook verifica Mercúrio/Vênus/Marte e Parte da Vocação em perguntas de vocação"],
      missingEvidence: ["fonte direta que sustente o alegado critério natal do planeta que nasce mais próximo do Sol"],
      engineBehavior: "critério desabilitado; não entra na seleção profissional",
      provenance: ["F-APP career passage", "F-HOR vocation passage"],
    },
    {
      id: "prenatal-eclipse-physical-classification", author: "John Frawley", domain: "lunações/eclipses natais",
      status: "RESOLVED_IMPLEMENTED", blocksRadicalInterpretation: false,
      availableEvidence: [
        "lunações pré/pós-natais são resolvidas por raiz efemérica",
        "@swisseph/browser 1.3.1 expõe findNextSolarEclipse/findNextLunarEclipse e os intervalos físicos das fases",
        "o motor testa se a sizígia exata cai no intervalo físico do eclipse e classifica total/anular/híbrido/parcial ou total/parcial/penumbral",
      ],
      missingEvidence: [],
      engineBehavior: "classifica o eclipse por evento físico Swiss Ephemeris; eclipseGeometryCandidate fica apenas como diagnóstico nodal e jamais determina o veredito",
      provenance: ["Swiss Ephemeris / @swisseph/browser >=1.3.1 technical layer", "F-CUR scope: eclipses/lunations", "web verification 28/08/2026"],
    },
    {
      id: "marcos-dynamic-cusp-beyond-five", author: "Marcos Monteiro", domain: "cúspides natais",
      status: "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED", blocksRadicalInterpretation: false,
      availableEvidence: ["regra-base ~5° antes da cúspide no mesmo signo", "distância, mesmo-signo, tamanho da casa, fração da casa, faixas 2°/3°/5°, velocidade e dinâmica são materializados"],
      missingEvidence: ["Marcos não fornece limiar numérico universal para decidir todos os casos discricionários ligeiramente acima de 5° nem gatilho matemático universal para escolher 2° versus 3° em casas pequenas"],
      engineBehavior: "resolve automaticamente somente o núcleo source-locked; expõe toda a geometria necessária para a exceção qualitativa e a marca como autoral-discricionária, sem deixar cálculo para a IA",
      provenance: ["Marcos transcriptions/stories supplied by user", "M-BK accidental house condition"],
    },
    {
      id: "frawley-current-timing-algorithms", author: "John Frawley", domain: "técnicas temporais natais",
      status: "OUTSIDE_STATIC_NATAL_EXECUTION", blocksRadicalInterpretation: false,
      availableEvidence: ["currículo atual confirma progressões, retornos, profecções e eclipses/lunações"],
      missingEvidence: ["procedimentos integrais current-version para cada técnica quando não publicados no corpus"],
      engineBehavior: "o relatório natal estático registra capacidade/gate; não executa previsão e não inventa algoritmo",
      provenance: ["F-CUR syllabus / Conversations on Natal Astrology"],
    },
    {
      id: "marcos-primary-directions-runtime", author: "Marcos Monteiro", domain: "técnicas temporais natais",
      status: "OUTSIDE_STATIC_NATAL_EXECUTION", blocksRadicalInterpretation: false,
      availableEvidence: ["direções exigem significador natal, contato/arco e domínio ativado"],
      missingEvidence: ["data/janela alvo e execução do módulo temporal"],
      engineBehavior: "preserva a promessa radical e o contrato; o radical não simula direção primária",
      provenance: ["Marcos transcriptions 2025–2026"],
    },
  ];
}

export interface OuterPlanetModifierDossier {
  planet: "Urano" | "Netuno" | "Plutão";
  longitude: number;
  sign: string;
  geometricHouse: number;
  contacts: Array<{
    target: string;
    targetType: "traditional-planet" | "angle" | "house-cusp";
    aspect: "conjunction" | "opposition";
    orb: number;
    /** Generic Marcos natal proximity reference only; NOT an outer-planet source cutoff. */
    tier: MarcosNatalInfluenceTier;
    authorialOrbStatus: "UNIVERSAL_CUTOFF_NOT_PUBLISHED";
    automaticInterpretation: false;
  }>;
  policy: {
    rulership: "NONE";
    essentialDignity: "NONE";
    almutenParticipation: "NONE";
    role: "SECONDARY_MODIFIER_ONLY";
    allowedAspectTypes: ["conjunction", "opposition"];
    authorialOrbStatus: "UNIVERSAL_CUTOFF_NOT_PUBLISHED";
  };
}

export interface NatalTechnicalForm {
  schemaVersion: "4.0.0";
  principle: "motor-calcula-ia-interpreta";
  sourceHierarchy: ["Marcos Monteiro", "John Frawley", "Luiz Gonzaga de Carvalho Neto"];
  temperamentCanonicalSource: "Marcos Monteiro";
  /** Core radical dossiers are first-class fields: the AI JSON must not rely on prose reconstruction. */
  sect: Sect;
  temperament: TemperamentResult;
  temperaments: AuthorialTemperamentsDossier;
  gugu: GuguNatalDossier;
  lordOfNativity: TemperamentResult["lordOfNativity"];
  manner: MannerAnalysis;
  mentality: MentalityAnalysis;
  dispositors: {
    chains: DispositorChain[];
    globalFinalDispositor: string | null;
    cycles: string[][];
  };
  planets: PlanetTechnicalPacket[];
  outerPlanetModifiers: OuterPlanetModifierDossier[];
  cusps: Array<{ house: number; longitude: number; almuten: DegreeAlmuten }>;
  lots: TechnicalLotDossier[];
  receptions: ReceptionTestimony[];
  mutualReceptions: MutualReception[];
  antiscia: NatalAnalysis["antiscia"];
  fixedStarContacts: FixedStarMatch[];
  fixedStarSky: {
    metadata: BirthChart["fixedStarCatalogMetadata"] | null;
    catalogSize: number;
    aboveHorizon: number;
    major15: Array<{ name: string; longitude: number; latitude: number; rightAscension: number; declination: number; magnitude?: number; houseRegiomontanus?: number; aboveHorizon?: boolean }>;
    interpretationPolicy: "catalogo-astronomico-nao-e-testemunho; somente fixedStarContacts isRelevant=true entra no julgamento";
    fullCatalogAvailableAtChartRoot: boolean;
  };
  houseDossiers: HouseTechnicalDossier[];
  lifeIndicatorsFrawley: FrawleyLifeIndicators;
  generalFortune: GeneralFortuneDossier;
  modes: ModesDossier;
  profession: ProfessionDossier;
  relationships: RelationshipDossier;
  healthSymbolic: HealthSymbolicDossier;
  spiritualOrientation: SpiritualOrientationDossier;
  children: ChildrenDossier;
  wealth: WealthDossier;
  derivedHouseTable: DerivedHouseLookupEntry[];
  interpretationContract: {
    universalRules: typeof UNIVERSAL_NATAL_JUDGMENT_RULES;
    protocols: typeof NATAL_DOMAIN_CONTRACTS;
    aiOutputRules: typeof AI_NATAL_OUTPUT_RULES;
    coverage: {
      expectedSections: number[];
      actualSections: number[];
      missingSections: number[];
      duplicateSections: number[];
      allCovered: boolean;
    };
  };
  sourceRegistry: SourceRegistryEntry[];
  sourceGapRegistry: NatalSourceGapEntry[];
  unresolvedTechnicalQuestions: string[];
}

export interface NatalAnalysis {
  methodVersion: "4.0.0";
  sect: Sect;
  methodology: {
    temperament: string;
    arabicLots: string;
    triplicity: string;
    terms: string;
    houseSystem: string;
    outerPlanets: string;
    analysisOrder: string[];
  };
  temperament: TemperamentResult;
  temperaments: AuthorialTemperamentsDossier;
  gugu: GuguNatalDossier;
  essentialConditions: EssentialCondition[];
  accidentalConditions: AccidentalCondition[];
  lordOfNativity: TemperamentResult["lordOfNativity"];
  lordOfGeniture: RankedPlanet[];
  chartAlmuten: RankedPlanet[];
  cuspAlmutens: DegreeAlmuten[];
  mentality: MentalityAnalysis;
  outerPlanetModifiers: OuterPlanetModifierDossier[];
  manner: MannerAnalysis;
  houseDossiers: HouseTechnicalDossier[];
  lifeIndicatorsFrawley: FrawleyLifeIndicators;
  generalFortune: GeneralFortuneDossier;
  modes: ModesDossier;
  profession: ProfessionDossier;
  relationships: RelationshipDossier;
  healthSymbolic: HealthSymbolicDossier;
  spiritualOrientation: SpiritualOrientationDossier;
  children: ChildrenDossier;
  wealth: WealthDossier;
  receptions: ReceptionTestimony[];
  mutualReceptions: MutualReception[];
  dispositors: {
    chains: DispositorChain[];
    globalFinalDispositor: string | null;
    cycles: string[][];
  };
  antiscia: {
    positions: AntiscionPosition[];
    contacts: AntiscionContact[];
    primaryOrb: number;
  };
  fixedStars: {
    relevantMatches: FixedStarMatch[];
    secondaryMatches: FixedStarMatch[];
    rule: string;
  };
  technicalForm: NatalTechnicalForm;
  cautions: string[];
}

function getTraditionalPlanets(chart: BirthChart): Planet[] {
  return chart.planets.filter((planet) => TRADITIONAL_TYPES.has(planet.type));
}

function getPlanet(chart: BirthChart, name: string): Planet {
  const planet = chart.planets.find((candidate) => candidate.name === name);
  if (!planet) throw new Error(`Planeta ausente no mapa: ${name}`);
  return planet;
}

function getExaltationRuler(signIndex: number): string | undefined {
  return Object.entries(EXALTATION).find(([, sign]) => sign === signIndex)?.[0];
}

function getDignityRulers(longitude: number, sect: Sect) {
  const signIndex = getSignIndex(longitude);
  const degreeInSign = normalizeLongitude(longitude) % 30;
  const triplicity = TRIPLICITY_RULERS[SIGN_ELEMENT[signIndex]];

  return {
    signIndex,
    degreeInSign,
    domicile: DOMICILE_RULER[signIndex],
    exaltation: getExaltationRuler(signIndex),
    triplicity: sect === "Diurno" ? triplicity.day : triplicity.night,
    term: LILLY_TERMS[signIndex].find((item) => degreeInSign < item.endDeg)!.ruler,
    face: FACES[signIndex][Math.floor(degreeInSign / 10)],
  };
}

export function calculateEssentialCondition(
  planet: Planet,
  sect: Sect,
): EssentialCondition {
  const rulers = getDignityRulers(planet.longitudeRaw, sect);
  const dignities: DignityTestimony[] = [];
  const debilities: DebilityTestimony[] = [];

  const dignityCandidates: Array<DignityTestimony> = [
    { kind: "domicilio", ruler: rulers.domicile, points: 5 },
    ...(rulers.exaltation
      ? [{ kind: "exaltacao" as const, ruler: rulers.exaltation, points: 4 }]
      : []),
    { kind: "triplicidade", ruler: rulers.triplicity, points: 3 },
    { kind: "termo", ruler: rulers.term, points: 2 },
    { kind: "face", ruler: rulers.face, points: 1 },
  ];

  dignityCandidates.forEach((testimony) => {
    if (testimony.ruler === planet.name) dignities.push(testimony);
  });

  if (DETRIMENT[planet.name]?.includes(rulers.signIndex)) {
    debilities.push({ kind: "exilio", points: -5 });
  }
  if (FALL[planet.name] === rulers.signIndex) {
    debilities.push({ kind: "queda", points: -4 });
  }

  const hasEssentialDebility = debilities.some(
    (testimony) => testimony.kind === "exilio" || testimony.kind === "queda",
  );
  const isPeregrine = dignities.length === 0 && !hasEssentialDebility;
  if (isPeregrine) debilities.push({ kind: "peregrino", points: -3 });

  const positive = dignities.reduce((sum, item) => sum + item.points, 0);
  const majorDebilities = debilities
    .filter((item) => item.kind !== "peregrino")
    .reduce((sum, item) => sum + item.points, 0);

  return {
    planet: planet.name,
    longitude: planet.longitudeRaw,
    sign: SIGNS[rulers.signIndex],
    degreeInSign: rulers.degreeInSign,
    rulers: {
      domicile: rulers.domicile,
      exaltation: rulers.exaltation,
      triplicity: rulers.triplicity,
      term: rulers.term,
      face: rulers.face,
    },
    dignities,
    debilities,
    isPeregrine,
    marcosScore: positive + majorDebilities,
    frawleyScore: positive + majorDebilities + (isPeregrine ? -3 : 0),
  };
}

function getOrientation(planet: Planet, sun: Planet): AccidentalCondition["orientation"] {
  if (planet.type === "sun" || planet.type === "moon") return "luminar";
  const elongation = normalizeLongitude(planet.longitudeRaw - sun.longitudeRaw);
  return elongation > 180 ? "oriental" : "ocidental";
}

function classifySolarConditionMarcos(planet: Planet, sun: Planet): SolarCondition {
  if (planet.type === "sun") return "sol";
  const distance = getAbsoluteAngularDistance(planet.longitudeRaw, sun.longitudeRaw);
  const sameSign = getSignIndex(planet.longitudeRaw) === getSignIndex(sun.longitudeRaw);

  // Marcos explains the physical basis as the solar radius: 17.5 arcminutes.
  // Combustion requires the same sign; a trans-sign contact at combustion distance
  // is under the rays, explicitly weaker. The outer under-rays boundary is 17°.
  if (distance <= 17.5 / 60) return "cazimi";
  if (distance <= 8.5 && sameSign) return "combusto";
  if (distance <= 8.5 && !sameSign) return "sob-os-raios";
  if (distance <= 17) return "sob-os-raios";
  if (Math.abs(distance - 180) <= 8) return "oposto-ao-sol";
  return "livre";
}

function classifySolarConditionFrawleyApplied(planet: Planet, sun: Planet): SolarCondition {
  if (planet.type === "sun") return "sol";
  const distance = getAbsoluteAngularDistance(planet.longitudeRaw, sun.longitudeRaw);
  const sameSign = getSignIndex(planet.longitudeRaw) === getSignIndex(sun.longitudeRaw);

  // The Real Astrology Applied: 17.5' cazimi; 8.5° combustion in the same sign;
  // under the sunbeams within 17.5°. No Marcos-only solar-opposition rule is added.
  if (distance <= 17.5 / 60) return "cazimi";
  if (distance <= 8.5 && sameSign) return "combusto";
  if (distance <= 17.5) return "sob-os-raios";
  return "livre";
}

function getSolarConditionBySource(planet: Planet, sun: Planet): AccidentalCondition["solarConditionBySource"] {
  return {
    marcos: classifySolarConditionMarcos(planet, sun),
    frawleyApplied: classifySolarConditionFrawleyApplied(planet, sun),
    solarDistance: getAbsoluteAngularDistance(planet.longitudeRaw, sun.longitudeRaw),
    sameSignAsSun: getSignIndex(planet.longitudeRaw) === getSignIndex(sun.longitudeRaw),
  };
}

function isAboveHorizon(house: number): boolean {
  return house >= 7 && house <= 12;
}

function getPlanetSect(planet: Planet, orientation: AccidentalCondition["orientation"]): "diurno" | "noturno" {
  if (DIURNAL_PLANETS.has(planet.name)) return "diurno";
  if (NOCTURNAL_PLANETS.has(planet.name)) return "noturno";
  return orientation === "oriental" ? "diurno" : "noturno";
}

function getPlanetGender(planet: Planet): "masculino" | "feminino" | "contextual" {
  if (MASCULINE_PLANETS.has(planet.name)) return "masculino";
  if (FEMININE_PLANETS.has(planet.name)) return "feminino";
  return "contextual";
}

function addTestimony(
  list: AccidentalTestimony[],
  code: string,
  label: string,
  score: number,
  source: AccidentalTestimony["source"],
  details: string,
) {
  const scoreProvenance: AccidentalTestimony["scoreProvenance"] = score === 0
    ? "NONE"
    : source.includes("Frawley")
      ? "FRAWLEY_APPLIED_LEDGER"
      : "LEGACY_AUDIT_ONLY";
  list.push({ code, label, score, scoreProvenance, source, details });
}

function getPartileAspect(
  first: Planet,
  second: Planet,
): TraditionalAspectMatch | null {
  const match = resolveTraditionalAspect(
    {
      longitude: first.longitudeRaw,
      speed: first.longitudeSpeed,
      elementType: "planet",
      planetType: first.type,
    },
    {
      longitude: second.longitudeRaw,
      speed: second.longitudeSpeed,
      elementType: "planet",
      planetType: second.type,
    },
  );

  return match && match.orbDistance <= 1 ? match : null;
}

function addPartileAspectTestimonies(
  chart: BirthChart,
  planet: Planet,
  testimonies: AccidentalTestimony[],
) {
  getTraditionalPlanets(chart)
    .filter((other) => other.name !== planet.name)
    .forEach((other) => {
      const match = getPartileAspect(planet, other);
      if (!match) return;

      if (BENEFICS.has(other.name)) {
        const score = match.aspectType === "conjunction"
          ? 5
          : match.aspectType === "trine"
            ? 4
            : match.aspectType === "sextile"
              ? 3
              : 0;
        if (score) {
          addTestimony(
            testimonies,
            `aspecto-partil-${other.type}`,
            `${match.aspectType} partil com ${other.name}`,
            score,
            "Frawley",
            `Orbe ${match.orbDistance.toFixed(3)}°`,
          );
        }
      }

      if (MALEFICS.has(other.name)) {
        const score = match.aspectType === "conjunction"
          ? -5
          : match.aspectType === "opposition"
            ? -4
            : match.aspectType === "square"
              ? -3
              : 0;
        if (score) {
          addTestimony(
            testimonies,
            `aspecto-partil-${other.type}`,
            `${match.aspectType} partil com ${other.name}`,
            score,
            "Frawley",
            `Orbe ${match.orbDistance.toFixed(3)}°`,
          );
        }
      }
    });

  chart.planets
    .filter((other) => other.type === "northNode" || other.type === "southNode")
    .forEach((node) => {
      const orb = getAbsoluteAngularDistance(planet.longitudeRaw, node.longitudeRaw);
      if (orb <= 1) {
        // Both authors use conjunction only, but the supplied passages do not
        // establish a shared numerical node score. Preserve qualitative testimony.
        addTestimony(
          testimonies,
          `conjuncao-${node.type}-marcos`,
          `conjunção partil com ${node.name}`,
          0,
          "Marcos Monteiro",
          `Orbe ${orb.toFixed(3)}°; gate conservador do motor <=1°; Marcos: somente conjunção, sem orbe universal source-locked.`,
        );
        addTestimony(
          testimonies,
          `conjuncao-${node.type}-frawley`,
          `conjunção partil com ${node.name}`,
          0,
          "Frawley",
          `Orbe ${orb.toFixed(3)}°; Frawley Applied: nodos afetam apenas por conjunção.`,
        );
      }
    });
}

function addFixedStarTestimonies(
  chart: BirthChart,
  planet: Planet,
  testimonies: AccidentalTestimony[],
) {
  const matches = (chart.fixedStarMatches ?? []).filter(
    (match) => match.pointName === planet.name
      && match.isRelevant
      && match.interpretiveTier === "principal-source-locked",
  );

  matches.forEach((match) => {
    const normalizedName = match.starName.toLowerCase();
    const slug = normalizedName.replace(/\s+/g, "-");
    const hasMarcos = match.interpretiveSources?.some((source) => source === "Marcos-principal") ?? false;
    const hasFrawley = match.interpretiveSources?.some((source) => source === "Frawley-Applied-explicit") ?? false;

    if (hasMarcos) {
      addTestimony(
        testimonies,
        `estrela-${slug}-marcos`,
        `conjunção com ${match.starName}`,
        0,
        "Marcos Monteiro",
        `Orbe ${match.orbLabel}; estrela principal Marcos; natureza ${match.nature ?? "não cadastrada"}. Importância qualitativa, sem score Marcos inventado.`,
      );
    }
    if (hasFrawley) {
      const frawleyScore = normalizedName === "regulus"
        ? 6
        : normalizedName === "spica"
          ? 5
          : normalizedName === "algol"
            ? -5
            : 0;
      addTestimony(
        testimonies,
        `estrela-${slug}-frawley`,
        `conjunção com ${match.starName}`,
        frawleyScore,
        "Frawley",
        `Orbe ${match.orbLabel}; objeto explicitamente usado por Frawley Applied; natureza ${match.nature ?? "não cadastrada"}.`,
      );
    }
  });
}

export function calculateAccidentalCondition(
  chart: BirthChart,
  planet: Planet,
  sect: Sect,
): AccidentalCondition {
  const sun = getPlanet(chart, "Sol");
  const placement = buildHousePlacement(chart, planet.name, planet.longitudeRaw);
  const geometricHouse = placement.geometricHouse;
  const house = placement.effectiveHouseMarcos;
  const cusp = chart.housesData.house[house - 1];
  const distanceFromHouseCusp = getAbsoluteAngularDistance(planet.longitudeRaw, cusp);
  const sameSignAsHouseCusp = getSignIndex(planet.longitudeRaw) === getSignIndex(cusp);
  const orientation = getOrientation(planet, sun);
  const solarConditionBySource = getSolarConditionBySource(planet, sun);
  const solarCondition = solarConditionBySource.marcos;
  const testimonies: AccidentalTestimony[] = [];
  const averageSpeed = AVERAGE_DAILY_SPEED[planet.name] ?? Math.abs(planet.longitudeSpeed);
  const speedRatio = averageSpeed ? Math.abs(planet.longitudeSpeed) / averageSpeed : 1;

  addTestimony(
    testimonies,
    "casa",
    `casa efetiva ${house}`,
    HOUSE_SCORES[house - 1] ?? 0,
    "Frawley e Marcos Monteiro",
    placement.resolution === "same-sign-within-5"
      ? `casa geométrica ${geometricHouse}; ${placement.distanceToNextCusp.toFixed(2)}° antes da cúspide ${house}, no mesmo signo; resolvido na casa seguinte`
      : `casa geométrica/efetiva ${house}; distância à cúspide da casa ${distanceFromHouseCusp.toFixed(2)}°; ${sameSignAsHouseCusp ? "sem" : "com"} barreira de signo`,
  );

  const joy = JUBILEE_HOUSE[planet.name];
  if (joy === house) {
    addTestimony(testimonies, "jubilo", "na casa de seu júbilo", 2, "Frawley e Marcos Monteiro", `Casa ${house}`);
  } else if (joy && ((joy + 5) % 12) + 1 === house) {
    addTestimony(testimonies, "oposto-jubilo", "na casa oposta ao júbilo", -1, "Frawley e Marcos Monteiro", `Casa ${house}`);
  }

  const stationary = speedRatio < 0.05;
  if (planet.type !== "sun" && planet.type !== "moon") {
    if (planet.isRetrograde) {
      addTestimony(testimonies, "retrogrado", "retrógrado", -5, "Frawley", `Velocidade ${planet.longitudeSpeed.toFixed(6)}°/dia; para Marcos, a retrogradação é preservada como condição contextual, sem debilidade natal automática.`);
    } else if (stationary) {
      addTestimony(testimonies, "estacionario", "estacionário", -5, "Marcos Monteiro", `Velocidade ${planet.longitudeSpeed.toFixed(6)}°/dia`);
    } else {
      addTestimony(testimonies, "direto", "direto", 4, "Frawley", `Velocidade ${planet.longitudeSpeed.toFixed(6)}°/dia`);
    }
  }

  if (speedRatio >= 1.05 && planet.type !== "saturn") {
    addTestimony(testimonies, "rapido", "mais rápido que a média", 2, "Frawley e Marcos Monteiro", `Razão ${speedRatio.toFixed(2)}×`);
  } else if (speedRatio <= 0.95 && !stationary) {
    addTestimony(testimonies, "lento", "mais lento que a média", -2, "Frawley e Marcos Monteiro", `Razão ${speedRatio.toFixed(2)}×`);
  }

  if (planet.latitudeSpeed !== undefined && planet.type !== "sun") {
    addTestimony(
      testimonies,
      planet.latitudeSpeed >= 0 ? "latitude-norte" : "latitude-sul",
      planet.latitudeSpeed >= 0 ? "aumentando latitude norte" : "aumentando latitude sul",
      planet.latitudeSpeed >= 0 ? 2 : -2,
      "Frawley",
      `${planet.latitudeSpeed.toFixed(6)}°/dia`,
    );
  }

  if (planet.type !== "sun") {
    const marcosSolar = solarConditionBySource.marcos;
    const frawleySolar = solarConditionBySource.frawleyApplied;
    const distance = solarConditionBySource.solarDistance;
    const sameSign = solarConditionBySource.sameSignAsSun;
    const essentialRulers = getDignityRulers(planet.longitudeRaw, sect);
    const protectedByOwnMajorDignity =
      essentialRulers.domicile === planet.name || essentialRulers.exaltation === planet.name;

    // Marcos testimony is generated independently from Frawley. This prevents
    // author-specific exceptions/boundaries from silently changing the other layer.
    if (marcosSolar === "cazimi") {
      addTestimony(testimonies, "cazimi-marcos", "cazimi", 5, "Marcos Monteiro", "Até 17′30″ do centro do Sol na explicação detalhada do raio solar.");
    } else if (marcosSolar === "combusto") {
      if (protectedByOwnMajorDignity) {
        addTestimony(
          testimonies,
          "combustao-mitigada-dignidade-maior",
          "combustão no próprio domicílio/exaltação — mitigação Marcos",
          0,
          "Marcos Monteiro",
          "Marcos afirma que combustão no próprio domicílio ou exaltação perde a conotação maléfica principal; o fato geométrico da combustão permanece registrado.",
        );
      } else {
        addTestimony(testimonies, "combusto-marcos", "combusto", -5, "Marcos Monteiro", "Entre cazimi e 8°30′ do Sol, no mesmo signo.");
      }
    } else if (marcosSolar === "sob-os-raios") {
      addTestimony(
        testimonies, "sob-raios-marcos", "sob os raios", -4, "Marcos Monteiro",
        sameSign
          ? `Distância solar ${distance.toFixed(3)}°; fora da combustão e até 17°.`
          : `Distância solar ${distance.toFixed(3)}° em signo diferente: sob os raios, não combustão; efeito trans-signo explicitamente mais fraco.`,
      );
    } else if (marcosSolar === "oposto-ao-sol") {
      addTestimony(testimonies, "oposto-sol-marcos", "oposição próxima ao Sol", -4, "Marcos Monteiro", "Até 8° da oposição.");
    }

    // Frawley Applied retains its own solar boundaries and no Marcos-only
    // combustion mitigation is imported into this layer.
    if (frawleySolar === "cazimi") {
      addTestimony(testimonies, "cazimi-frawley", "cazimi", 5, "Frawley", "The Real Astrology Applied: até 17′30″.");
    } else if (frawleySolar === "combusto") {
      addTestimony(testimonies, "combusto-frawley", "combusto", -5, "Frawley", "The Real Astrology Applied: até 8°30′ no mesmo signo, fora do cazimi.");
    } else if (frawleySolar === "sob-os-raios") {
      addTestimony(testimonies, "sob-raios-frawley", "sob os raios", -4, "Frawley", `The Real Astrology Applied: distância solar ${distance.toFixed(3)}°, dentro de 17°30′.`);
    } else if (frawleySolar === "livre") {
      addTestimony(testimonies, "livre-sol-frawley", "livre de combustão e raios", 5, "Frawley", "Além da zona de 17°30′ de Frawley Applied.");
    }
  }

  if (["Marte", "Júpiter", "Saturno"].includes(planet.name)) {
    addTestimony(
      testimonies,
      `orientacao-${orientation}`,
      orientation,
      orientation === "oriental" ? 2 : -2,
      "Frawley",
      "Regra para planetas superiores",
    );
  } else if (["Vênus", "Mercúrio"].includes(planet.name)) {
    addTestimony(
      testimonies,
      `orientacao-${orientation}`,
      orientation,
      orientation === "ocidental" ? 2 : -2,
      "Frawley",
      "Regra específica para Vênus e Mercúrio",
    );
  }

  if (planet.type === "moon") {
    const phaseAngle = normalizeLongitude(planet.longitudeRaw - sun.longitudeRaw);
    const increasing = phaseAngle < 180;
    addTestimony(
      testimonies,
      increasing ? "lua-crescente" : "lua-minguante",
      increasing ? "Lua aumentando em luz" : "Lua diminuindo em luz",
      increasing ? 2 : -2,
      "Frawley e Marcos Monteiro",
      `Elongação ${phaseAngle.toFixed(2)}°`,
    );

    if (planet.longitudeRaw >= 195 && planet.longitudeRaw <= 225) {
      addTestimony(testimonies, "via-combusta", "Lua na Via Combusta", -2, "Marcos Monteiro", "15° de Libra a 15° de Escorpião");
    }
  }

  const planetSect = getPlanetSect(planet, orientation);
  const above = isAboveHorizon(house);
  const isDay = sect === "Diurno";
  const isHalb = planetSect === "diurno" ? above === isDay : above !== isDay;
  const gender = getPlanetGender(planet);
  const signGender = SIGN_GENDER[getSignIndex(planet.longitudeRaw)] ? "masculino" : "feminino";
  const isHayz = isHalb && gender !== "contextual" && gender === signGender;

  if (isHayz) {
    addTestimony(testimonies, "hayz", "em hayz", 3, "Frawley e Marcos Monteiro", `${planetSect}, ${gender}, signo ${signGender}`);
  } else if (isHalb) {
    addTestimony(testimonies, "halb", "em halb", 2, "Frawley e Marcos Monteiro", `${planetSect}; gênero ${gender}`);
  }

  addPartileAspectTestimonies(chart, planet, testimonies);
  addFixedStarTestimonies(chart, planet, testimonies);

  return {
    planet: planet.name,
    house,
    geometricHouse,
    effectiveHouseMarcos: placement.effectiveHouseMarcos,
    effectiveHouseFrawley: placement.effectiveHouseFrawley,
    houseResolution: placement.resolution,
    distanceFromHouseCusp,
    sameSignAsHouseCusp,
    orientation,
    solarCondition,
    solarConditionBySource,
    isHalb,
    isHayz,
    speedRatio,
    testimonies,
    frawleyScore: testimonies.reduce((sum, item) => sum + item.score, 0),
  };
}

function rankPlanets(
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  includeAccidental: boolean,
): RankedPlanet[] {
  const ranking = essential.map((condition) => {
    const accidentalScore = includeAccidental
      ? accidental.find((item) => item.planet === condition.planet)?.frawleyScore ?? 0
      : 0;
    return {
      planet: condition.planet,
      essentialScore: condition.frawleyScore,
      accidentalScore,
      totalScore: condition.frawleyScore + accidentalScore,
      tied: false,
    };
  }).sort((first, second) => second.totalScore - first.totalScore || first.planet.localeCompare(second.planet));

  const topScore = ranking[0]?.totalScore;
  ranking.forEach((item) => {
    item.tied = item.totalScore === topScore;
  });
  return ranking;
}


function signTemperamentalQualities(longitude: number): TemperamentalQuality[] {
  const [hot, moist] = SIGN_QUALITIES[getSignIndex(longitude)];
  return [hot ? "quente" : "frio", moist ? "úmido" : "seco"];
}

function planetTemperamentalQualities(planet: Planet): TemperamentalQuality[] {
  const map: Partial<Record<PlanetType, TemperamentalQuality[]>> = {
    sun: ["quente", "seco"],
    moon: ["frio", "úmido"],
    mercury: ["frio", "seco"],
    venus: ["frio", "úmido"],
    mars: ["quente", "seco"],
    jupiter: ["quente", "úmido"],
    saturn: ["frio", "seco"],
  };
  return [...(map[planet.type] ?? [])];
}

function aspectEvidenceToLongitude(chart: BirthChart, source: Planet, targetLongitude: number, targetName: string): string[] {
  const aspectType = getAspectTypeFromSigns(source.longitudeRaw, targetLongitude);
  if (!aspectType) return [];
  const orb = getTraditionalAspectOrbFromLongitudes(source.longitudeRaw, targetLongitude, aspectType);
  if (orb > 5) return [];
  return [`${source.name} ${aspectType} ${targetName}; orbe ${orb.toFixed(2)}°; tier Marcos ${classifyMarcosNatalInfluenceOrb(orb)}`];
}

function buildFrawleyTemperamentDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
): FrawleyTemperamentDossier {
  const asc = chart.housesData.ascendant;
  const rulerName = DOMICILE_RULER[getSignIndex(asc)];
  const ruler = getPlanet(chart, rulerName);
  const sun = getPlanet(chart, "Sol");
  const moon = getPlanet(chart, "Lua");
  const allTraditional = getTraditionalPlanets(chart);
  const lordRanking = rankPlanets(essential, accidental, true);
  const topScore = lordRanking[0]?.totalScore;
  const topCandidates = lordRanking.filter((item) => item.totalScore === topScore);
  const lordWitnessPlanet = topCandidates.length === 1 ? getPlanet(chart, topCandidates[0].planet) : null;
  const planetsInFirst = allTraditional.filter((planet) =>
    buildHousePlacement(chart, planet.name, planet.longitudeRaw).effectiveHouseFrawley === 1
  );

  const firstEvidence = [
    `ASC ${SIGNS[getSignIndex(asc)]}: ${signTemperamentalQualities(asc).join("/")}.`,
    `${ruler.name} rege o ASC; natureza ${planetTemperamentalQualities(ruler).join("/")}; em ${SIGNS[getSignIndex(ruler.longitudeRaw)]} (${signTemperamentalQualities(ruler.longitudeRaw).join("/")}); orientação ${accidental.find((item) => item.planet === ruler.name)?.orientation ?? "—"}.`,
    ...planetsInFirst.map((planet) => `Planeta tradicional na I: ${planet.name} em ${SIGNS[getSignIndex(planet.longitudeRaw)]}; natureza ${planetTemperamentalQualities(planet).join("/")}.`),
    ...allTraditional
      .filter((planet) => planet.name !== ruler.name)
      .flatMap((planet) => aspectEvidenceToLongitude(chart, planet, asc, "ASC")),
  ];

  const sunEvidence = [
    `Sol em ${SIGNS[getSignIndex(sun.longitudeRaw)]}: signo ${signTemperamentalQualities(sun.longitudeRaw).join("/")}; estação zodiacal preservada como modificador qualitativo.`,
    ...allTraditional.filter((planet) => planet.name !== sun.name).flatMap((planet) => {
      const match = getAspectBetween(sun, planet);
      return match && match.orbDistance <= 5 ? [`Aspecto ao Sol: ${planet.name} ${match.aspectType}; orbe ${match.orbDistance.toFixed(2)}°.`] : [];
    }),
  ];
  const phase = getPhaseDetails(moon, sun);
  const moonEvidence = [
    `Lua em ${SIGNS[getSignIndex(moon.longitudeRaw)]}: signo ${signTemperamentalQualities(moon.longitudeRaw).join("/")}; ${phase.phase} (${phase.qualities.join("/")}).`,
    ...allTraditional.filter((planet) => planet.name !== moon.name).flatMap((planet) => {
      const match = getAspectBetween(moon, planet);
      return match && match.orbDistance <= 5 ? [`Aspecto à Lua: ${planet.name} ${match.aspectType}; orbe ${match.orbDistance.toFixed(2)}°.`] : [];
    }),
  ];
  const lordEvidence = lordWitnessPlanet
    ? [
        `Senhor da Genitura publicado: ${lordWitnessPlanet.name}; ranking Frawley Applied por dignidade essencial + acidental.`,
        `Natureza ${planetTemperamentalQualities(lordWitnessPlanet).join("/")}; signo ${SIGNS[getSignIndex(lordWitnessPlanet.longitudeRaw)]} (${signTemperamentalQualities(lordWitnessPlanet.longitudeRaw).join("/")}).`,
      ]
    : [
        `Senhor da Genitura publicado permanece empatado entre ${topCandidates.map((item) => item.planet).join(", ")}; nenhum desempate inventado para o testemunho temperamental.`,
      ];

  return {
    method: "John Frawley - published executable baseline + current public doctrine",
    publishedBaselineSource: "The Real Astrology Applied",
    currentPublicDoctrineSource: "Conversations on Natal Astrology 1/3 + Approaching the Birthchart syllabus",
    exactCurrentCalculationStatus: "CURRENT_METHOD_NOT_PUBLIC",
    status: "evidence-ready-qualitative-judgment",
    witnesses: [
      {
        key: "first-house-and-ruler",
        qualities: [...signTemperamentalQualities(asc), ...planetTemperamentalQualities(ruler)],
        evidence: firstEvidence,
      },
      {
        key: "sun",
        qualities: signTemperamentalQualities(sun.longitudeRaw),
        evidence: sunEvidence,
      },
      {
        key: "moon",
        qualities: [...signTemperamentalQualities(moon.longitudeRaw), ...(phase.qualities.map((quality) => quality.replace("fria", "frio").replace("quente", "quente").replace("úmida", "úmido").replace("seca", "seco")) as TemperamentalQuality[])],
        evidence: moonEvidence,
      },
      {
        key: "lord-of-geniture",
        qualities: lordWitnessPlanet ? [...planetTemperamentalQualities(lordWitnessPlanet), ...signTemperamentalQualities(lordWitnessPlanet.longitudeRaw)] : [],
        evidence: lordEvidence,
      },
    ],
    lordOfGenitureCandidates: topCandidates,
    currentDoctrine: {
      foundation: "temperament-first",
      temperamentMeaning: "mixture-hot-cold-moist-dry",
      archetypalDirections: {
        choleric: "agir",
        sanguine: "pensar",
        melancholic: "ter-e-reter",
        phlegmatic: "sentir",
      },
      prioritiesAfterTemperament: ["fase-da-Lua", "Mercúrio"],
      noIntelligenceShortcut: true,
      noMedicalReduction: true,
    },
    conclusion: null,
    note: "Executa e materializa o último procedimento publicado recuperável. Frawley declara publicamente que sua forma atual de calcular temperamento avançou consideravelmente desde Applied; por isso o motor não chama este baseline de algoritmo atual exato e não inventa os passos privados do tutorial.",
  };
}

function guguHistoricalPlanetQualities(
  planetName: string,
  orientation: AccidentalCondition["orientation"],
): TemperamentalQuality[] {
  if (planetName === "Júpiter") return ["quente", "úmido"]; // ar, camada histórica inicial
  if (planetName === "Sol" || planetName === "Marte") return ["quente", "seco"]; // fogo
  if (planetName === "Saturno") return ["frio", "seco"]; // terra
  if (planetName === "Lua") return ["frio", "úmido"]; // água
  if (planetName === "Mercúrio") return orientation === "oriental" ? ["quente", "úmido"] : ["frio", "seco"];
  if (planetName === "Vênus") return orientation === "oriental" ? ["quente", "úmido"] : ["frio", "úmido"];
  return [];
}

/**
 * Tabela efetivamente usada nas aulas tardias de Cosmologia e Astrologia Medieval 10–11.
 * Ela não é idêntica à simplificação dos quatro componentes ensinada no começo do curso.
 * Nas aulas detalhadas, orientalidade/ocidentalidade pode deixar apenas uma qualidade ativa.
 */
function guguDetailedPlanetQualities(
  planetName: string,
  orientation: AccidentalCondition["orientation"],
  phase?: ReturnType<typeof getPhaseDetails>,
  solarSeason?: TemperamentalQuality[],
): TemperamentalQuality[] {
  if (planetName === "Sol") return solarSeason ? [...solarSeason] : [];
  if (planetName === "Lua") {
    return phase
      ? phase.qualities.map((quality) => quality.replace("fria", "frio").replace("úmida", "úmido").replace("seca", "seco")) as TemperamentalQuality[]
      : [];
  }
  if (planetName === "Saturno") return orientation === "oriental" ? ["frio", "seco"] : ["seco"];
  if (planetName === "Júpiter") return orientation === "oriental" ? ["quente", "úmido"] : ["úmido"];
  if (planetName === "Marte") return orientation === "oriental" ? ["quente", "seco"] : ["seco"];
  if (planetName === "Vênus") return orientation === "oriental" ? ["quente", "úmido"] : ["úmido"];
  if (planetName === "Mercúrio") return orientation === "oriental" ? ["quente"] : ["seco"];
  return [];
}

function cancelOpposedTemperamentalQualities(qualities: TemperamentalQuality[]): TemperamentalQuality[] {
  const set = new Set(qualities);
  if (set.has("quente") && set.has("frio")) {
    set.delete("quente");
    set.delete("frio");
  }
  if (set.has("úmido") && set.has("seco")) {
    set.delete("úmido");
    set.delete("seco");
  }
  return ["quente", "frio", "úmido", "seco"].filter((quality) => set.has(quality as TemperamentalQuality)) as TemperamentalQuality[];
}

function getGuguNodeTemperamentalQualities(
  node: "northNode" | "southNode",
  accidental: AccidentalCondition[],
  phase: ReturnType<typeof getPhaseDetails>,
  solarSeason: TemperamentalQuality[],
): TemperamentalQuality[] {
  const pair = node === "northNode" ? ["Júpiter", "Vênus"] : ["Saturno", "Marte"];
  const combined = pair.flatMap((planetName) => {
    const orientation = accidental.find((item) => item.planet === planetName)?.orientation ?? "ocidental";
    return guguDetailedPlanetQualities(planetName, orientation, phase, solarSeason);
  });
  return cancelOpposedTemperamentalQualities(combined);
}

const GUGU_POINT_ASPECT_FULL_ORB: Partial<Record<PlanetType, number>> = {
  sun: 15,
  moon: 12,
  mercury: 7,
  venus: 7,
  mars: 7,
  jupiter: 9,
  saturn: 9,
};

function getGuguAspectToPoint(planet: Planet, pointLongitude: number) {
  const aspectType = getAspectTypeFromSigns(planet.longitudeRaw, pointLongitude);
  if (!aspectType) return null;
  const orb = getTraditionalAspectOrbFromLongitudes(planet.longitudeRaw, pointLongitude, aspectType);
  const maxOrb = GUGU_POINT_ASPECT_FULL_ORB[planet.type] ?? 3;
  return orb <= maxOrb ? { aspectType, orb, maxOrb } : null;
}

function classifyTemperamentFromCounts(counts: Record<TemperamentalQuality, number>) {
  const temperature: "quente" | "frio" | "equilibrado" = counts.quente === counts.frio ? "equilibrado" : counts.quente > counts.frio ? "quente" : "frio";
  const moisture: "úmido" | "seco" | "equilibrado" = counts.úmido === counts.seco ? "equilibrado" : counts.úmido > counts.seco ? "úmido" : "seco";
  const typeFor = (temp: "quente" | "frio", moist: "úmido" | "seco") => {
    if (temp === "quente" && moist === "seco") return "colérico" as const;
    if (temp === "quente" && moist === "úmido") return "sanguíneo" as const;
    if (temp === "frio" && moist === "seco") return "melancólico" as const;
    return "fleumático" as const;
  };
  if (temperature === "equilibrado" || moisture === "equilibrado") {
    return {
      temperature,
      moisture,
      primary: "misto/indeterminado" as const,
      secondary: null,
      evidence: `Contagem-base: quente ${counts.quente}, frio ${counts.frio}, úmido ${counts.úmido}, seco ${counts.seco}; pelo menos um eixo está empatado antes das considerações qualitativas.`,
    };
  }
  const primary = typeFor(temperature, moisture);
  const alternatives = ([
    ["quente", "úmido", "sanguíneo"],
    ["quente", "seco", "colérico"],
    ["frio", "úmido", "fleumático"],
    ["frio", "seco", "melancólico"],
  ] as const)
    .map(([temp, moist, type]) => ({ type, score: counts[temp] + counts[moist] }))
    .sort((a, b) => b.score - a.score);
  const secondary = alternatives.find((item) => item.type !== primary)?.type ?? null;
  return {
    temperature,
    moisture,
    primary,
    secondary,
    evidence: `Contagem-base: quente ${counts.quente}, frio ${counts.frio}, úmido ${counts.úmido}, seco ${counts.seco}. As aulas mandam julgar proporcionalmente e só depois aplicar as considerações; por isso esta classificação é BASE, não veredito final.`,
  };
}

function buildGuguTemperamentDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
): GuguTemperamentDossier {
  const asc = chart.housesData.ascendant;
  const ascRulerName = DOMICILE_RULER[getSignIndex(asc)];
  const ascRuler = getPlanet(chart, ascRulerName);
  const sun = getPlanet(chart, "Sol");
  const moon = getPlanet(chart, "Lua");
  const phase = getPhaseDetails(moon, sun);
  const seasonIndex = getSignIndex(sun.longitudeRaw);
  const seasonQualities: TemperamentalQuality[] = seasonIndex <= 2
    ? ["quente", "úmido"]
    : seasonIndex <= 5
      ? ["quente", "seco"]
      : seasonIndex <= 8
        ? ["frio", "seco"]
        : ["frio", "úmido"];

  const majorDignityCandidates = essential.filter((item) =>
    item.dignities.some((dignity) => dignity.kind === "domicilio" || dignity.kind === "exaltacao")
  );
  const viable = majorDignityCandidates.filter((item) => {
    const acc = accidental.find((candidate) => candidate.planet === item.planet);
    return acc && ![8, 12].includes(acc.house);
  });
  const angularViable = viable.filter((item) => [1, 4, 7, 10].includes(accidental.find((candidate) => candidate.planet === item.planet)?.house ?? 0));
  const strongestName = viable.length === 1
    ? viable[0].planet
    : angularViable.length === 1
      ? angularViable[0].planet
      : null;
  const strongest = strongestName ? getPlanet(chart, strongestName) : null;

  const historical = [
    {
      key: "ascendant" as const,
      qualities: signTemperamentalQualities(asc),
      evidence: [`Ascendente em ${SIGNS[getSignIndex(asc)]}; componente 1 do método histórico de quatro componentes.`],
    },
    {
      key: "solar-season" as const,
      qualities: seasonQualities,
      evidence: [`Estação do Sol inferida pelo signo solar ${SIGNS[seasonIndex]}; signo solar funciona como modulação qualitativa.`],
    },
    {
      key: "moon-phase" as const,
      qualities: phase.qualities.map((q) => q.replace("fria", "frio").replace("úmida", "úmido").replace("seca", "seco")) as TemperamentalQuality[],
      evidence: [`${phase.phase}; Lua em ${SIGNS[getSignIndex(moon.longitudeRaw)]} modula a fase.`],
    },
    {
      key: "strongest-planet" as const,
      qualities: strongest ? guguHistoricalPlanetQualities(strongest.name, accidental.find((item) => item.planet === strongest.name)?.orientation ?? "luminar") : [],
      evidence: strongest
        ? [`Candidato claro por dignidade maior/condição acidental: ${strongest.name} em H${accidental.find((item) => item.planet === strongest.name)?.house}.`]
        : [`Seleção qualitativa necessária entre candidatos: ${(viable.length ? viable : majorDignityCandidates).map((item) => item.planet).join(", ") || "nenhum candidato óbvio"}.`],
    },
  ];

  type DetailedWitness = GuguTemperamentDossier["detailedMethod"]["witnesses"][number];
  const witnesses: DetailedWitness[] = [];
  const pushWitness = (
    group: DetailedWitness["group"],
    source: string,
    qualities: TemperamentalQuality[],
    evidence: string[],
    includedInBaseCount = true,
    inclusionStatus: DetailedWitness["inclusionStatus"] = "SOURCE_LOCKED",
  ) => witnesses.push({ group, source, qualities, pointsPerQuality: 1, includedInBaseCount, inclusionStatus, evidence });

  pushWitness("ascendant", `ASC ${SIGNS[getSignIndex(asc)]}`, signTemperamentalQualities(asc), ["Determinante 1: signo Ascendente; cada qualidade recebe um ponto."]);
  const ascRulerOrientation = accidental.find((item) => item.planet === ascRulerName)?.orientation ?? "ocidental";
  pushWitness("ascendant-ruler", ascRulerName, guguDetailedPlanetQualities(ascRulerName, ascRulerOrientation, phase, seasonQualities), [`Determinante 2: regente do ASC; orientação ${ascRulerOrientation}.`]);

  getTraditionalPlanets(chart)
    .filter((planet) => planet.name !== ascRulerName)
    .forEach((planet) => {
      const match = getGuguAspectToPoint(planet, asc);
      if (!match) return;
      const orientation = accidental.find((item) => item.planet === planet.name)?.orientation ?? "ocidental";
      pushWitness(
        "aspect-to-ascendant",
        planet.name,
        guguDetailedPlanetQualities(planet.name, orientation, phase, seasonQualities),
        [`${planet.name} ${match.aspectType} ASC; orbe ${match.orb.toFixed(2)}° de máximo ${match.maxOrb.toFixed(1)}° do planeta no procedimento demonstrado.`, "Aulas 10–11 mostram explicitamente o uso dos orbes planetários para aspectos ao Ascendente (Lua ainda aceita a 9°; Sol tem orbe maior)."],
      );
    });

  const moonQualities = phase.qualities.map((q) => q.replace("fria", "frio").replace("úmida", "úmido").replace("seca", "seco")) as TemperamentalQuality[];
  pushWitness("moon-phase", `Lua ${phase.phase}`, moonQualities, [`Determinante 3: fase lunar; ângulo de fase ${phase.phaseAngle.toFixed(2)}°.`]);
  const moonDispositorName = DOMICILE_RULER[getSignIndex(moon.longitudeRaw)];
  const moonDispositorOrientation = accidental.find((item) => item.planet === moonDispositorName)?.orientation ?? "ocidental";
  pushWitness("moon-dispositor", moonDispositorName, guguDetailedPlanetQualities(moonDispositorName, moonDispositorOrientation, phase, seasonQualities), [`Dispositor da Lua: ${moonDispositorName}; orientação ${moonDispositorOrientation}.`]);

  getTraditionalPlanets(chart)
    .filter((planet) => planet.name !== "Lua" && planet.name !== moonDispositorName)
    .forEach((planet) => {
      const match = getAspectBetween(moon, planet);
      if (!match) return;
      const orientation = accidental.find((item) => item.planet === planet.name)?.orientation ?? "ocidental";
      pushWitness("aspect-to-moon", planet.name, guguDetailedPlanetQualities(planet.name, orientation, phase, seasonQualities), [`${planet.name} ${match.aspectType} Lua; orbe ${match.orbDistance.toFixed(2)}° / máximo tradicional ${match.maxOrb.toFixed(2)}°.`]);
    });

  // Nodos: nas aulas, sextil/trígono escolhe a Cabeça; quadratura escolhe a Cauda;
  // conjunção escolhe o nodo tocado. O exemplo explica que a Lua permite contato amplo
  // por possuir orbe grande. Usamos, portanto, o orbe completo lunar (12°) quando a Lua é o significador.
  const nodePlanets = chart.planets.filter((planet) => planet.type === "northNode" || planet.type === "southNode");
  const nodeCandidates = nodePlanets.flatMap((node) => {
    const aspectType = getAspectTypeFromSigns(moon.longitudeRaw, node.longitudeRaw);
    if (!aspectType) return [];
    const orb = getTraditionalAspectOrbFromLongitudes(moon.longitudeRaw, node.longitudeRaw, aspectType);
    return orb <= (GUGU_POINT_ASPECT_FULL_ORB.moon ?? 12) ? [{ node, aspectType, orb }] : [];
  });
  const conjunctionNode = nodeCandidates.find((item) => item.aspectType === "conjunction");
  const squareNode = nodeCandidates.find((item) => item.aspectType === "square");
  const beneficNode = nodeCandidates.find((item) => item.aspectType === "sextile" || item.aspectType === "trine");
  const chosenNode = conjunctionNode
    ?? (squareNode ? nodeCandidates.find((item) => item.node.type === "southNode" && item.aspectType === "square") ?? squareNode : null)
    ?? (beneficNode ? nodeCandidates.find((item) => item.node.type === "northNode" && (item.aspectType === "sextile" || item.aspectType === "trine")) ?? beneficNode : null);
  if (chosenNode) {
    const chosenType = chosenNode.node.type === "northNode" ? "northNode" : "southNode";
    pushWitness(
      "aspect-to-moon",
      chosenNode.node.name,
      getGuguNodeTemperamentalQualities(chosenType, accidental, phase, seasonQualities),
      [`${chosenNode.node.name} ${chosenNode.aspectType} Lua; orbe ${chosenNode.orb.toFixed(2)}°. Regra source-locked: trígono/sextil privilegia Cabeça; quadratura privilegia Cauda; conjunção usa o nodo tocado.`, `Cabeça combina qualidades de Júpiter+Vênus; Cauda combina Saturno+Marte, cancelando qualidades opostas e sem duplicar a mesma qualidade.`],
    );
  }

  pushWitness("solar-season", `Sol / ${SIGNS[seasonIndex]}`, seasonQualities, ["Determinante 4: estação do Sol; nas aulas o Sol conta novamente se também aparece por aspecto."]);
  if (strongest) {
    const orientation = accidental.find((item) => item.planet === strongest.name)?.orientation ?? "ocidental";
    pushWitness("strongest-planet", strongest.name, guguDetailedPlanetQualities(strongest.name, orientation, phase, seasonQualities), [`Determinante 5: planeta mais forte; ${strongest.name}, H${accidental.find((item) => item.planet === strongest.name)?.house}, orientação ${orientation}.`]);
  } else {
    pushWitness("strongest-planet", "seleção qualitativa pendente", [], ["As aulas exigem o planeta mais forte, mas este mapa não produz um vencedor source-locked automático sem pesar testemunhos heterogêneos. O motor preserva os candidatos e não inventa score."], false, "ORB_BOUNDARY_UNPUBLISHED");
  }

  // Nodos aspectando o ASC aparecem no procedimento, mas o corpus não fornece um orbe universal
  // para nodo→ângulo. Materializamos a geometria sem pontuar se o limiar autoral não é recuperável.
  nodePlanets.forEach((node) => {
    const aspectType = getAspectTypeFromSigns(node.longitudeRaw, asc);
    if (!aspectType) return;
    const orb = getTraditionalAspectOrbFromLongitudes(node.longitudeRaw, asc, aspectType);
    pushWitness(
      "aspect-to-ascendant",
      node.name,
      getGuguNodeTemperamentalQualities(node.type === "northNode" ? "northNode" : "southNode", accidental, phase, seasonQualities),
      [`Geometria ${node.name} ${aspectType} ASC; orbe ${orb.toFixed(2)}°. O corpus demonstra nodo em aspecto ao ASC, mas não publica um orbe universal nodo→ângulo.`],
      false,
      "ORB_BOUNDARY_UNPUBLISHED",
    );
  });

  const baseCounts: Record<TemperamentalQuality, number> = { quente: 0, frio: 0, úmido: 0, seco: 0 };
  witnesses.filter((witness) => witness.includedInBaseCount).forEach((witness) => witness.qualities.forEach((quality) => { baseCounts[quality] += 1; }));
  const baseClassification = classifyTemperamentFromCounts(baseCounts);

  const ascRulerDispositorName = DOMICILE_RULER[getSignIndex(ascRuler.longitudeRaw)];
  const prominent = accidental
    .filter((item) => [1, 4, 7, 10].includes(item.house))
    .map((item) => `${item.planet} H${item.house}`);
  const qualitativeConsiderations: GuguTemperamentDossier["detailedMethod"]["qualitativeConsiderations"] = [
    {
      key: "fixed-stars",
      status: "MATERIALIZED_FOR_JUDGMENT",
      evidence: ["As aulas incluem estrelas fixas nas considerações finais, não na soma-base. Usar o dossiê de estrelas do formulário técnico; nenhum peso inteiro é acrescentado automaticamente."],
      numericWeightApplied: false,
    },
    {
      key: "asc-ruler-and-dispositor",
      status: "MATERIALIZED_FOR_JUDGMENT",
      evidence: [`Regente do ASC ${ascRulerName}: H${accidental.find((item) => item.planet === ascRulerName)?.house}; dispositor ${ascRulerDispositorName}: H${accidental.find((item) => item.planet === ascRulerDispositorName)?.house}.`, "Nas aulas esta comparação pode inclinar o resultado por 'mais' qualitativos (explicitamente menos que um ponto); o motor não transforma isso em score universal."],
      numericWeightApplied: false,
    },
    {
      key: "mentality",
      status: "MATERIALIZED_FOR_JUDGMENT",
      evidence: ["A mentalidade é uma consideração final explícita. O dossiê de mentalidade Gugu entrega almutens de Lua/Mercúrio e demais testemunhos; aqui usa-se a natureza planetária de fundo, não a orientação como novo ponto inteiro."],
      numericWeightApplied: false,
    },
    {
      key: "exceptionally-prominent-planets",
      status: "MATERIALIZED_FOR_JUDGMENT",
      evidence: [`Planetas angularmente proeminentes disponíveis: ${prominent.join(", ") || "nenhum"}.`, "As aulas tratam planetas excepcionalmente destacados como consideração final e podem usar dispositores finais/recepções; sem peso universal publicado."],
      numericWeightApplied: false,
    },
  ];

  return {
    method: "Luiz Gonzaga de Carvalho Neto - historical course layers",
    status: "historical-and-detailed-ledger-executable-with-explicit-orb-boundary",
    historicalFourComponents: historical,
    detailedMethod: {
      sourceStatus: "SOURCE_LOCKED_DETERMINANTS_AND_POINT_LEDGER",
      determinantGroups: ["ascendant", "ascendant-ruler-and-aspects", "moon-phase-dispositor-and-aspects", "solar-season", "strongest-planet"],
      witnesses,
      baseCounts,
      baseClassification,
      qualitativeConsiderations,
      nodeRule: {
        northNodeAnalogy: "Júpiter+Vênus",
        southNodeAnalogy: "Saturno+Marte",
        beneficAspectChoosesNorth: true,
        squareChoosesSouth: true,
        conjunctionChoosesContactedNode: true,
        aspectOrbStatus: "AUTHORIAL_ORB_NOT_UNIVERSALLY_PUBLISHED",
      },
    },
    laterCourseStatus: "DETAILED_WITNESS_LEDGER_IMPLEMENTED_ORB_BOUNDARY_EXPLICIT",
    laterCourseEvidence: [
      "Cosmologia e Astrologia Medieval 10 explicita cinco determinantes, um ponto por qualidade, orientação planetária, fase lunar, dispositor, aspectos e considerações finais.",
      "Cosmologia e Astrologia Medieval 11 demonstra a contagem completa, permite o mesmo fator contar novamente quando exerce outro papel e julga os totais proporcionalmente.",
      "Cabeça do Dragão é construída por Júpiter+Vênus; Cauda por Saturno+Marte; qualidades opostas se cancelam e duplicatas não dobram o ponto.",
      "As considerações finais (estrelas, regente/dispositor do ASC, mentalidade, planetas excepcionalmente salientes) são deliberadamente qualitativas e não recebem peso inteiro inventado.",
    ],
    conclusion: null,
    note: "O método tardio deixou de ser tratado como tabela perdida: o corpus novo recupera o ledger operacional. O motor calcula a soma-base e preserva as considerações qualitativas. A única fronteira numérica relevante remanescente aqui é o orbe universal de nodo→ângulo, que permanece explicitamente não publicado.",
  };
}

function buildGuguPrimaryMotivationDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
): GuguPrimaryMotivationDossier {
  const asc = chart.housesData.ascendant;
  const ascRulerName = DOMICILE_RULER[getSignIndex(asc)];
  const ascRuler = getPlanet(chart, ascRulerName);
  const ascRulerAcc = accidental.find((item) => item.planet === ascRulerName)!;
  const dispositorName = DOMICILE_RULER[getSignIndex(ascRuler.longitudeRaw)];
  const dispositor = getPlanet(chart, dispositorName);
  const dispositorAcc = accidental.find((item) => item.planet === dispositorName)!;
  const saturn = getPlanet(chart, "Saturno");
  const saturnAcc = accidental.find((item) => item.planet === "Saturno")!;
  const candidates = essential
    .filter((item) => item.dignities.some((d) => d.kind === "domicilio" || d.kind === "exaltacao"))
    .map((item) => {
      const planet = getPlanet(chart, item.planet);
      const acc = accidental.find((candidate) => candidate.planet === item.planet)!;
      const major = item.dignities.filter((d) => d.kind === "domicilio" || d.kind === "exaltacao").map((d) => d.kind);
      const toAsc = aspectEvidenceToLongitude(chart, planet, asc, "ASC");
      const toRulerMatch = planet.name === ascRuler.name ? null : getAspectBetween(planet, ascRuler);
      const toRuler = planet.name === ascRuler.name
        ? ["É o próprio regente do Ascendente."]
        : toRulerMatch && toRulerMatch.orbDistance <= 5
          ? [`Aspecto com regente do ASC ${ascRuler.name}: ${toRulerMatch.aspectType}; orbe ${toRulerMatch.orbDistance.toFixed(2)}°.`]
          : [];
      const badHouse = [8, 12].includes(acc.house);
      const weakHouse = acc.house === 6;
      const ascLinked = planet.name === ascRuler.name || toAsc.length > 0 || toRuler.length > 0;
      return {
        planet: item.planet,
        house: acc.house,
        majorEssentialDignities: major,
        relationToAscendant: toAsc,
        relationToAscendantRuler: toRuler,
        candidateStatus: (!badHouse && (!weakHouse || ascLinked))
          ? "primary-candidate" as const
          : ascLinked
            ? "secondary-candidate" as const
            : "weak-candidate" as const,
      };
    });

  const primary = candidates.filter((item) => item.candidateStatus === "primary-candidate");
  const selected = primary.length === 1 ? primary[0].planet : null;
  const selectionStatus: GuguPrimaryMotivationDossier["selectionStatus"] =
    selected ? "single-clear-candidate" : candidates.length ? "qualitative-selection-required" : "no-major-dignity-candidate";

  return {
    method: "Luiz Gonzaga de Carvalho Neto - Cosmologia e Astrologia Medieval",
    status: "SOURCE_LOCKED_IMPLEMENTED_WITH_QUALITATIVE_SELECTION",
    ascendant: {
      longitude: asc,
      sign: SIGNS[getSignIndex(asc)],
      ruler: ascRulerName,
      directionAxis: "direção fundamental da motivação; eixo simbólico, não profissão literal",
    },
    ascendantRuler: {
      planet: ascRuler.name,
      sign: SIGNS[getSignIndex(ascRuler.longitudeRaw)],
      house: ascRulerAcc.house,
      dispositor: dispositorName,
      evidence: [`Regente do ASC como sujeito/operador da direção; condição em H${ascRulerAcc.house}.`],
    },
    realizationInstrument: {
      planet: dispositor.name,
      sign: SIGNS[getSignIndex(dispositor.longitudeRaw)],
      house: dispositorAcc.house,
      evidence: [`Dispositor do regente do ASC como instrumento/modo de realização; condição em H${dispositorAcc.house}.`],
    },
    strongestPlanetCandidates: candidates,
    selectedStrongestPlanet: selected,
    selectionStatus,
    saturnChallenge: {
      house: saturnAcc.house,
      geometricHouse: saturnAcc.geometricHouse,
      sign: SIGNS[getSignIndex(saturn.longitudeRaw)],
      interpretationAxis: "área de dificuldade/obstáculo cuja compreensão e superação pode produzir satisfação; não sentença fatalista",
    },
    interpretiveGuardrails: [
      "Motivação primária não é profissão nem destino único.",
      "Os signos/planetas/casas expressam eixos simbólicos que admitem múltiplas concretizações.",
      "Planeta mais forte é seleção qualitativa: dignidade maior e capacidade de agir vêm primeiro; vínculo com ASC/regente pode preferir candidato quase tão forte.",
      "Casa VI é difícil mas não automaticamente eliminatória; VIII e XII pesam fortemente contra o candidato no exemplo pedagógico.",
      "A história vivida, educação e escolhas não estão integralmente escritas no radix.",
    ],
  };
}

function buildGuguPowerOfSoulDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
): GuguPowerOfSoulDossier {
  const facultyMap = [
    ["Lua", "sentido-comum-fantasia"],
    ["Mercúrio", "estimativa"],
    ["Vênus", "apetite-concupiscivel"],
    ["Sol", "vontade"],
    ["Marte", "apetite-irascivel"],
    ["Júpiter", "intelecto-paciente"],
    ["Saturno", "intelecto-agente"],
  ] as const;

  const faculties = facultyMap.map(([planetName, faculty]) => {
    const planet = getPlanet(chart, planetName);
    const ruledHouses = chart.housesData.house
      .map((cusp, index) => ({ house: index + 1, ruler: DOMICILE_RULER[getSignIndex(cusp)] }))
      .filter((item) => item.ruler === planetName)
      .map((item) => item.house);
    return {
      planet: planetName,
      faculty,
      longitude: planet.longitudeRaw,
      sign: SIGNS[getSignIndex(planet.longitudeRaw)],
      house: accidental.find((item) => item.planet === planetName)!.house,
      ruledHouses,
      essential: essential.find((item) => item.planet === planetName)!,
      accidental: accidental.find((item) => item.planet === planetName)!,
      dispositor: DOMICILE_RULER[getSignIndex(planet.longitudeRaw)],
      note: "Correspondência analógica de faculdade; não identificar o planeta ontologicamente com a potência da alma nem reduzir a pessoa a um único significador.",
    };
  });

  return {
    method: "Luiz Gonzaga de Carvalho Neto / Pedro Sette Câmara - analogical planetary faculties",
    attributionStatus: "HISTORICAL_ANALOGY_NOT_ONTOLOGICAL_IDENTITY",
    faculties,
    philosophicalGuardrails: [
      "Mercúrio não equivale a inteligência/QI; sua analogia é com a estimativa/discriminação.",
      "Lua não equivale simplesmente a emoção; sua analogia inclui sentido comum/fantasia e recepção da experiência.",
      "Sol/vontade não equivale a todo desejo; Vênus e Marte representam apetites distintos.",
      "Júpiter e Saturno são analogias intelectivas e não autorizam um score de inteligência.",
      "As faculdades devem ser lidas em relação entre si, ao temperamento, à mentalidade, às casas regidas e à situação concreta.",
    ],
  };
}

function buildGuguPlanetRoleMatrix(
  chart: BirthChart,
  powers: GuguPowerOfSoulDossier,
): GuguPlanetRoleMatrix {
  const naturalByPlanet: Record<string, string> = {
    "Sol": "autoridade-luz-unidade",
    "Lua": "corpo-fluxo-imaginacao",
    "Mercúrio": "mediação-cálculo-linguagem",
    "Vênus": "união-prazer-conciliação",
    "Marte": "força-separação-combate",
    "Júpiter": "expansão-juízo-elevação",
    "Saturno": "limite-contração-estrutura",
  };
  return {
    method: "Luiz Gonzaga de Carvalho Neto - multi-role planetary reading",
    planets: powers.faculties.map((item) => ({
      planet: item.planet,
      roles: [
        "temperament-component",
        "mental-faculty",
        ...(item.ruledHouses.length ? ["house-ruler" as const] : []),
        "house-occupant",
        "natural-significator",
        "relational-agent",
      ],
      ruledHouses: item.ruledHouses,
      occupiedHouse: item.house,
      dispositor: item.dispositor,
      faculty: item.faculty,
    })),
    note: `Cada planeta deve ser distinguido por função no julgamento: faculdade/analogia psíquica, regente de casa, ocupante, significador natural e agente em relações. "Planeta = palavra-chave" é uma simplificação proibida. Naturais de referência: ${Object.entries(naturalByPlanet).map(([p,v]) => `${p}:${v}`).join("; ")}.`,
  };
}

function buildGuguPhilosophicalFrame(): GuguPhilosophicalFrame {
  return {
    method: "Luiz Gonzaga de Carvalho Neto - symbolic/cosmological frame",
    principles: [
      "Astrologia opera por analogias e semelhanças de tipo entre ordens distintas, não por identidade literal entre símbolo e evento.",
      "O mapa é uma representação do microcosmo humano em correspondência com a ordem celeste.",
      "Temperamento e mentalidade descrevem materiais/disposições; não esgotam a pessoa nem sua biografia.",
      "A vontade, a educação moral, a experiência e as escolhas modulam a manifestação das disposições.",
      "Símbolos devem ser lidos hierarquicamente e em contexto; uma mesma figura pode realizar-se de vários modos concretos.",
      "A antropologia subjacente distingue níveis corpóreo, vegetativo, sensitivo e racional-intelectivo.",
    ],
    interpretiveProhibitions: [
      "Não moralizar um temperamento ou uma mentalidade.",
      "Não converter uma potência da alma em diagnóstico psicológico moderno.",
      "Não transformar motivação primária em 'missão profissional' única.",
      "Não contar testemunhos heterogêneos como se fossem unidades de uma escala psicológica universal.",
      "Não confundir causalidade simbólica/vertical com causalidade física simples.",
      "Não usar astrologia como negação de responsabilidade, liberdade ou contexto biográfico.",
    ],
    anthropologyLayers: ["mineral-corporeal", "vegetative", "sensitive", "rational-intellective"],
    note: "Camada interpretativa/epistemológica para orientar a IA. Ela não cria novas longitudes, dignidades ou aspectos; impede que dados corretos sejam sintetizados com uma ontologia incompatível com as fontes.",
  };
}

function buildGuguNatalDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
): GuguNatalDossier {
  const temperament = buildGuguTemperamentDossier(chart, essential, accidental);
  const primaryMotivation = buildGuguPrimaryMotivationDossier(chart, essential, accidental);
  const powersOfSoul = buildGuguPowerOfSoulDossier(chart, essential, accidental);
  return {
    temperament,
    primaryMotivation,
    powersOfSoul,
    planetRoleMatrix: buildGuguPlanetRoleMatrix(chart, powersOfSoul),
    philosophicalFrame: buildGuguPhilosophicalFrame(),
  };
}

function calculateDegreeAlmuten(point: string, longitude: number, sect: Sect): DegreeAlmuten {
  const rulers = getDignityRulers(longitude, sect);
  const scores: Record<string, number> = {};
  const add = (planet: string | undefined, value: number) => {
    if (planet) scores[planet] = (scores[planet] ?? 0) + value;
  };
  add(rulers.domicile, 5);
  add(rulers.exaltation, 4);
  add(rulers.triplicity, 3);
  add(rulers.term, 2);
  add(rulers.face, 1);
  const max = Math.max(...Object.values(scores));
  const tiedWinners = Object.entries(scores).filter(([, score]) => score === max).map(([planet]) => planet);
  return {
    point,
    longitude,
    winner: tiedWinners.length === 1 ? tiedWinners[0] : null,
    tiedWinners,
    scores,
  };
}

function calculateDispositorChain(chart: BirthChart, start: Planet): DispositorChain {
  const byName = new Map(getTraditionalPlanets(chart).map((planet) => [planet.name, planet]));
  const chain: string[] = [];
  const seen = new Map<string, number>();
  let current = start.name;

  while (true) {
    if (seen.has(current)) {
      const cycleStart = seen.get(current)!;
      const cycle = [...chain.slice(cycleStart), current];
      const isSelfRule = cycle.length === 2 && cycle[0] === cycle[1];
      return {
        planet: start.name,
        chain: [...chain, current],
        finalDispositor: isSelfRule ? current : null,
        cycle: isSelfRule ? null : cycle,
      };
    }

    seen.set(current, chain.length);
    chain.push(current);
    const planet = byName.get(current);
    if (!planet) return { planet: start.name, chain, finalDispositor: null, cycle: null };
    current = DOMICILE_RULER[getSignIndex(planet.longitudeRaw)];
  }
}

function uniqueCycles(chains: DispositorChain[]): string[][] {
  const unique = new Map<string, string[]>();
  chains.forEach((chain) => {
    if (!chain.cycle) return;
    const body = chain.cycle.slice(0, -1);
    const rotations = body.map((_, index) => [...body.slice(index), ...body.slice(0, index)]);
    rotations.sort((a, b) => a.join("|").localeCompare(b.join("|")));
    const canonical = rotations[0];
    unique.set(canonical.join("|"), [...canonical, canonical[0]]);
  });
  return [...unique.values()];
}

function calculateAntiscia(chart: BirthChart) {
  const primaryOrb = 3;
  const traditional = getTraditionalPlanets(chart);
  const lots = calculateArabicLots(chart);
  const lotPoints = ORDERED_ARABIC_PART_KEYS.flatMap((key) => {
    const lot = lots[key];
    return lot ? [{ point: `Parte ${lot.name}`, longitude: lot.longitude }] : [];
  });
  const points = [
    ...traditional.map((planet) => ({ point: planet.name, longitude: planet.longitudeRaw })),
    ...chart.housesData.house.map((longitude, index) => ({ point: `Cúspide ${index + 1}`, longitude })),
    ...lotPoints,
  ];
  const positions: AntiscionPosition[] = points.map((point) => {
    const antiscion = normalizeLongitude(540 - point.longitude);
    return {
      ...point,
      antiscion,
      oppositeAntiscion: normalizeLongitude(antiscion + 180),
    };
  });

  const contactSources = [
    ...traditional.map((planet) => ({ point: planet.name, longitude: planet.longitudeRaw })),
    ...lotPoints,
  ];
  const contactTargets = [
    ...traditional.map((planet) => ({ point: planet.name, longitude: planet.longitudeRaw })),
    ...chart.housesData.house.map((longitude, index) => ({ point: `Cúspide ${index + 1}`, longitude })),
    ...lotPoints,
  ];
  const contacts = new Map<string, AntiscionContact>();

  contactSources.forEach((source) => {
    const antiscion = normalizeLongitude(540 - source.longitude);
    contactTargets.forEach((target) => {
      if (source.point === target.point) return;
      const conjunctionOrb = getAbsoluteAngularDistance(antiscion, target.longitude);
      const oppositionOrb = Math.abs(getAbsoluteAngularDistance(antiscion, target.longitude) - 180);
      const type = conjunctionOrb <= primaryOrb
        ? "conjuncao"
        : oppositionOrb <= primaryOrb
          ? "oposicao"
          : null;
      if (!type) return;

      const names = [source.point, target.point].sort();
      const key = `${names.join("|")}|${type}`;
      const contact: AntiscionContact = {
        first: names[0],
        second: names[1],
        type,
        orb: type === "conjuncao" ? conjunctionOrb : oppositionOrb,
      };
      const previous = contacts.get(key);
      if (!previous || contact.orb < previous.orb) contacts.set(key, contact);
    });
  });

  return {
    positions,
    contacts: [...contacts.values()].sort((first, second) => first.orb - second.orb),
    primaryOrb,
  };
}

function getPhaseDetails(moon: Planet, sun: Planet) {
  const phaseAngle = normalizeLongitude(moon.longitudeRaw - sun.longitudeRaw);
  if (phaseAngle < 90) return { phase: "1ª fase", qualities: ["quente", "úmida"], phaseAngle };
  if (phaseAngle < 180) return { phase: "2ª fase", qualities: ["quente", "seca"], phaseAngle };
  if (phaseAngle < 270) return { phase: "3ª fase", qualities: ["fria", "seca"], phaseAngle };
  return { phase: "4ª fase", qualities: ["fria", "úmida"], phaseAngle };
}

function getMentalModifyingAspects(chart: BirthChart, significator: Planet) {
  return getTraditionalPlanets(chart)
    .filter((planet) => planet.name !== significator.name && !["Lua", "Mercúrio"].includes(planet.name))
    .flatMap((planet) => {
      const match = resolveTraditionalAspect(
        { longitude: significator.longitudeRaw, speed: significator.longitudeSpeed, elementType: "planet", planetType: significator.type },
        { longitude: planet.longitudeRaw, speed: planet.longitudeSpeed, elementType: "planet", planetType: planet.type },
      );
      if (!match) return [];
      const marcosNatalEligible = match.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB;
      return [{
        significator: significator.name as "Lua" | "Mercúrio",
        planet: planet.name,
        aspect: match.aspectType,
        orb: match.orbDistance,
        applying: match.applying,
        marcosNatalEligible,
        marcosInfluenceTier: classifyMarcosNatalInfluenceOrb(match.orbDistance),
        sourceLayers: marcosNatalEligible ? ["Marcos" as const, "Frawley-context" as const] : ["Frawley-context" as const],
      }];
    })
    .sort((first, second) => first.orb - second.orb);
}

function calculateMentality(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  sect: Sect,
): MentalityAnalysis {
  const sun = getPlanet(chart, "Sol");
  const moon = getPlanet(chart, "Lua");
  const mercury = getPlanet(chart, "Mercúrio");
  const phase = getPhaseDetails(moon, sun);
  const connection = resolveTraditionalAspect(
    { longitude: moon.longitudeRaw, speed: moon.longitudeSpeed, elementType: "planet", planetType: moon.type },
    { longitude: mercury.longitudeRaw, speed: mercury.longitudeSpeed, elementType: "planet", planetType: mercury.type },
  );
  const modifyingAspects = [
    ...getMentalModifyingAspects(chart, moon),
    ...getMentalModifyingAspects(chart, mercury),
  ].sort((first, second) => first.orb - second.orb);

  const buildDossier = (planet: Planet): MentalSignificatorDossier => {
    const signIndex = getSignIndex(planet.longitudeRaw);
    return {
      planet: planet.name as "Lua" | "Mercúrio",
      longitude: planet.longitudeRaw,
      sign: SIGNS[signIndex],
      element: ELEMENTS[SIGN_ELEMENT[signIndex]],
      modality: MODALITIES[signIndex],
      signProperties: getSignPropertyDossier(planet.longitudeRaw),
      degreeAlmuten: calculateDegreeAlmuten(`Grau de ${planet.name}`, planet.longitudeRaw, sect),
      domicileDispositor: DOMICILE_RULER[signIndex],
      essentialCondition: essential.find((item) => item.planet === planet.name)!,
      accidentalCondition: accidental.find((item) => item.planet === planet.name)!,
    };
  };

  const moonDossier = buildDossier(moon);
  const mercuryDossier = buildDossier(mercury);
  const ascRulerName = DOMICILE_RULER[getSignIndex(chart.housesData.ascendant)];
  const ascEssential = essential.find((item) => item.planet === ascRulerName)!;
  const ascAccidental = accidental.find((item) => item.planet === ascRulerName)!;
  const modalitySignificators = [
    { point: "Lua", sign: moonDossier.sign, modality: moonDossier.modality },
    { point: "Mercúrio", sign: mercuryDossier.sign, modality: mercuryDossier.modality },
    { point: "Regente do Ascendente", sign: SIGNS[getSignIndex(getPlanet(chart, ascRulerName).longitudeRaw)], modality: MODALITIES[getSignIndex(getPlanet(chart, ascRulerName).longitudeRaw)] },
  ];
  const modalityBalance = modalitySignificators.reduce<Record<string, number>>((acc, item) => {
    acc[item.modality] = (acc[item.modality] ?? 0) + 1;
    return acc;
  }, { Cardinal: 0, Fixo: 0, Mutável: 0 });

  const angles: Array<{ angle: "ASC" | "IC" | "DSC" | "MC"; longitude: number }> = [
    { angle: "ASC", longitude: chart.housesData.house[0] },
    { angle: "IC", longitude: chart.housesData.house[3] },
    { angle: "DSC", longitude: chart.housesData.house[6] },
    { angle: "MC", longitude: chart.housesData.house[9] },
  ];
  const angleProximity = getTraditionalPlanets(chart)
    .map((planet) => {
      const nearest = angles
        .map((item) => ({ ...item, distance: getAbsoluteAngularDistance(planet.longitudeRaw, item.longitude) }))
        .sort((a, b) => a.distance - b.distance)[0];
      return { planet: planet.name, nearestAngle: nearest.angle, distanceFromAngle: nearest.distance };
    })
    .sort((a, b) => a.distanceFromAngle - b.distanceFromAngle);

  const trueNorthNode = chart.planets.find((planet) => planet.type === "northNode") ?? null;
  const trueSouthNode = chart.planets.find((planet) => planet.type === "southNode") ?? null;
  const northDistance = trueNorthNode ? getAbsoluteAngularDistance(moon.longitudeRaw, trueNorthNode.longitudeRaw) : null;
  const southDistance = trueSouthNode ? getAbsoluteAngularDistance(moon.longitudeRaw, trueSouthNode.longitudeRaw) : null;
  const nodeCandidates = [
    ...(northDistance === null ? [] : [{ node: "Nodo Norte" as const, distance: northDistance }]),
    ...(southDistance === null ? [] : [{ node: "Nodo Sul" as const, distance: southDistance }]),
  ].sort((a, b) => a.distance - b.distance);
  const northSquareError = northDistance === null ? null : Math.abs(northDistance - 90);
  const southSquareError = southDistance === null ? null : Math.abs(southDistance - 90);
  const squareCandidates = [
    ...(northSquareError === null ? [] : [{ node: "Nodo Norte" as const, error: northSquareError }]),
    ...(southSquareError === null ? [] : [{ node: "Nodo Sul" as const, error: southSquareError }]),
  ].sort((a, b) => a.error - b.error);

  const properPlaceOffsets = {
    "Mercúrio": 1,
    "Vênus": 2,
    "Marte": 3,
    "Júpiter": 4,
    "Saturno": 5,
  } as const;
  const sunSignIndex = getSignIndex(sun.longitudeRaw);
  const moonSignIndex = getSignIndex(moon.longitudeRaw);
  const properPlaces = (Object.entries(properPlaceOffsets) as Array<[keyof typeof properPlaceOffsets, 1 | 2 | 3 | 4 | 5]>).map(([planetName, offsetSigns]) => {
    const planet = getPlanet(chart, planetName);
    const signIndex = getSignIndex(planet.longitudeRaw);
    const signsBeforeMoon = (moonSignIndex - signIndex + 12) % 12;
    const signsAfterSun = (signIndex - sunSignIndex + 12) % 12;
    const beforeMoonMatch = signsBeforeMoon === offsetSigns;
    const afterSunMatch = signsAfterSun === offsetSigns;
    return {
      planet: planetName,
      offsetSigns,
      signIndex,
      moonSignIndex,
      sunSignIndex,
      signsBeforeMoon,
      signsAfterSun,
      beforeMoonMatch,
      afterSunMatch,
      inProperPlace: beforeMoonMatch || afterSunMatch,
      mentalModifierWhenSignificator: "liberal-franca-autoconfiante-corajosa-engenhosa-aberta-aguda" as const,
    };
  });

  const compoundMentalityCandidates = [
    moonDossier.degreeAlmuten.winner,
    mercuryDossier.degreeAlmuten.winner,
    ...moonDossier.degreeAlmuten.tiedWinners,
    ...mercuryDossier.degreeAlmuten.tiedWinners,
  ].filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);
  const mentalNames = [...new Set(["Lua", "Mercúrio", ascRulerName, ...compoundMentalityCandidates])];
  const orientationEvidence = mentalNames.map((name) => {
    const p = getPlanet(chart, name);
    const ac = accidental.find((item) => item.planet === name);
    // The universal accidental dossier deliberately labels the luminaries as "luminar".
    // Gugu's mental supplement, however, explicitly asks for oriental/occidental evidence;
    // for the Moon we therefore preserve its raw solar-relative orientation separately
    // (waxing = occidental, waning = oriental), without changing the universal dossier.
    const guguOrientation = name === "Lua"
      ? (normalizeLongitude(p.longitudeRaw - sun.longitudeRaw) > 180 ? "oriental" : "ocidental")
      : ac?.orientation ?? "não-calculado";
    return { planet: name, orientation: guguOrientation, house: ac?.house ?? getHouseIndex(p.longitudeRaw, chart.housesData.house) };
  });
  const mc = chart.housesData.house[9];
  const ic = chart.housesData.house[3];
  const mcIcProximity = mentalNames.map((name) => {
    const p = getPlanet(chart, name);
    const distanceFromMC = getAbsoluteAngularDistance(p.longitudeRaw, mc);
    const distanceFromIC = getAbsoluteAngularDistance(p.longitudeRaw, ic);
    return { planet: name, distanceFromMC, distanceFromIC, nearer: (distanceFromMC <= distanceFromIC ? "MC" : "IC") as "MC" | "IC" };
  });
  const ascendantPlanetsRaw = getTraditionalPlanets(chart)
    .filter((planet) => accidental.find((item) => item.planet === planet.name)?.house === 1)
    .map((planet) => {
      const ec = essential.find((item) => item.planet === planet.name)!;
      return {
        planet: planet.name,
        effectiveHouse: 1,
        distanceFromASC: getAbsoluteAngularDistance(planet.longitudeRaw, chart.housesData.ascendant),
        essentialDignities: ec.dignities.map((item) => item.kind),
        essentialDebilities: ec.debilities.map((item) => item.kind),
      };
    })
    .sort((a, b) => a.distanceFromASC - b.distanceFromASC);

  return {
    method: "evidencia tecnica - Marcos/Frawley/Gugu",
    status: "dados-prontos-para-interpretacao",
    moon: {
      ...moonDossier,
      phase: phase.phase,
      phaseAngle: phase.phaseAngle,
      phaseQualities: phase.qualities,
    },
    mercury: mercuryDossier,
    moonMercuryConnection: connection
      ? {
          connected: connection.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB,
          geometricConnected: true,
          aspect: connection.aspectType,
          orb: connection.orbDistance,
          applying: connection.applying,
          marcosNatalEligible: connection.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB,
          marcosInfluenceTier: classifyMarcosNatalInfluenceOrb(connection.orbDistance),
        }
      : { connected: false, geometricConnected: false },
    modifyingAspects,
    ascendantRuler: ascRulerName,
    ascendantRulerCondition: { essential: ascEssential, accidental: ascAccidental },
    contextualContacts: { lotRelations: [], antiscionContacts: [] },
    sourceVariants: {
      marcos: {
        role: "primario",
        evidence: [
          `Lua: fase ${phase.phase}, ${moonDossier.sign}, ${moonDossier.element}, ${moonDossier.modality}.`,
          `Mercúrio: ${mercuryDossier.sign}, ${mercuryDossier.element}, ${mercuryDossier.modality}, ${mercuryDossier.accidentalCondition.solarCondition}.`,
          connection && connection.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB
            ? `Lua-Mercúrio: ${connection.aspectType}, orbe ${connection.orbDistance.toFixed(3)}°; dentro da influência natal Marcos.`
            : connection
              ? `Lua-Mercúrio: ${connection.aspectType} geométrico a ${connection.orbDistance.toFixed(3)}°, FORA da faixa natal Marcos <=5°; não usar como ligação Marcos.`
              : "Lua-Mercúrio sem aspecto ptolomaico calculado.",
        ],
      },
      frawley: {
        role: "complementar",
        evidence: [
          "Condições essenciais e acidentais completas de Lua e Mercúrio estão anexadas; nenhum score total de inteligência é autorizado.",
          "Aspectos modificadores fora da faixa Marcos permanecem marcados apenas como Frawley-context até o julgamento específico da camada Frawley.",
          "Recepções positivas e negativas são calculadas em bloco próprio e devem ser lidas junto aos significadores.",
        ],
      },
      gugu: {
        role: "suplemento-autoral-identificado",
        moonAlmuten: moonDossier.degreeAlmuten,
        mercuryAlmuten: mercuryDossier.degreeAlmuten,
        compoundMentalityCandidates,
        modalityBalance,
        significators: modalitySignificators,
        sunCondition: {
          house: accidental.find((item) => item.planet === "Sol")?.house ?? getHouseIndex(sun.longitudeRaw, chart.housesData.house),
          orientation: accidental.find((item) => item.planet === "Sol")?.orientation ?? "luminar",
          solarCondition: accidental.find((item) => item.planet === "Sol")?.solarCondition ?? "sol",
        },
        sunRole: "moral-consciousness-reflection-modifier-not-primary-mental-significator",
        primaryMentalSignificators: ["Lua", "Mercúrio"],
        angleProximity,
        orientationEvidence,
        mcIcProximity,
        ascendantPlanetsRaw,
        moonNodeRawDistance: {
          northNode: northDistance,
          southNode: southDistance,
          nearestNode: nodeCandidates[0]?.node ?? null,
          nearestDistance: nodeCandidates[0]?.distance ?? null,
          northSquareError,
          southSquareError,
          nearestSquareNode: squareCandidates[0]?.node ?? null,
          nearestSquareError: squareCandidates[0]?.error ?? null,
          conservativePartileNearNode1Deg: (nodeCandidates[0]?.distance ?? Infinity) <= 1,
          conservativePartileSquare1Deg: (squareCandidates[0]?.error ?? Infinity) <= 1,
          sourceRule: {
            nearNode: "mais-pratica-incisiva-ativa",
            squareNodes: "mais-sensivel-artistica-voluvel",
          },
          interpretationStatus: "RULE_SEMANTICS_SOURCE_LOCKED_ORB_UNSPECIFIED",
        },
        properPlaces,
        properPlacesStatus: "SOURCE_LOCKED_IMPLEMENTED",
        evidence: [
          "Almutens dos graus da Lua e de Mercúrio calculados separadamente.",
          `Regente do Ascendente: ${ascRulerName}, com condições essenciais e acidentais anexadas.`,
          "Aspectos modificadores a Lua e Mercúrio já estão enumerados.",
          "Modalidades, orientação dos significadores, distâncias específicas a MC/IC e planetas efetivos na I são materializados.",
          "Lugares próprios Gugu são calculados pela tabela source-locked 1/2/3/4/5 signos em relação à Lua/Sol.",
          "Lua–Nodos preserva a semântica source-locked e a geometria exata; o orbe autoral permanece não especificado.",
        ],
      },
    },
    unresolved: [],
  };
}

function calculateManner(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
): MannerAnalysis {
  const traditional = getTraditionalPlanets(chart);
  const ascSign = getSignIndex(chart.housesData.ascendant);
  const candidates: MannerAnalysis["candidates"] = [];
  const addCandidate = (planet: Planet, basis: MannerAnalysis["candidates"][number]["basis"], orb?: number) => {
    if (candidates.some((candidate) => candidate.planet === planet.name && candidate.basis === basis)) return;
    candidates.push({
      planet: planet.name,
      basis,
      orb,
      essentialScore: essential.find((item) => item.planet === planet.name)?.frawleyScore ?? 0,
      accidentalScore: accidental.find((item) => item.planet === planet.name)?.frawleyScore ?? 0,
    });
  };

  traditional
    .filter((planet) => !["Sol", "Lua"].includes(planet.name) && getSignIndex(planet.longitudeRaw) === ascSign)
    .forEach((planet) => addCandidate(planet, "signo-ascendente"));

  if (candidates.length === 0) {
    const moon = getPlanet(chart, "Lua");
    const mercury = getPlanet(chart, "Mercúrio");
    traditional
      .filter((planet) => !["Sol", "Lua", "Mercúrio"].includes(planet.name))
      .forEach((planet) => {
        const matches = [moon, mercury].flatMap((significator) => {
          const match = resolveTraditionalAspect(
            { longitude: planet.longitudeRaw, speed: planet.longitudeSpeed, elementType: "planet", planetType: planet.type },
            { longitude: significator.longitudeRaw, speed: significator.longitudeSpeed, elementType: "planet", planetType: significator.type },
          );
          return match ? [match] : [];
        });
        matches.sort((first, second) => first.orbDistance - second.orbDistance);
        if (matches[0]) addCandidate(planet, "contato-lua-mercurio", matches[0].orbDistance);
      });
  }

  if (candidates.length === 0) {
    const rulerName = DOMICILE_RULER[ascSign];
    const ruler = traditional.find((planet) => planet.name === rulerName)!;
    addCandidate(ruler, "regente-do-ascendente");
    return { method: "John Frawley - The Real Astrology Applied (published legacy)", sourceStatus: "published-legacy-current-version-not-publicly-specified", status: "fallback-regente-do-ascendente", selected: ruler.name, candidates };
  }

  // Ordenação apenas para auditoria visual. Quando há mais de um candidato
  // no mesmo estágio, Frawley não autoriza um desempate automático por score.
  candidates.sort((first, second) =>
    (first.orb ?? Number.POSITIVE_INFINITY) - (second.orb ?? Number.POSITIVE_INFINITY)
      || first.planet.localeCompare(second.planet),
  );

  return {
    method: "John Frawley - The Real Astrology Applied (published legacy)",
    sourceStatus: "published-legacy-current-version-not-publicly-specified",
    status: candidates.length === 1 ? "selecionado" : "multiplos-testemunhos",
    selected: candidates.length === 1 ? candidates[0].planet : null,
    candidates,
  };
}

function getAspectBetween(first: Planet, second: Planet) {
  return resolveTraditionalAspect(
    { longitude: first.longitudeRaw, speed: first.longitudeSpeed, elementType: "planet", planetType: first.type },
    { longitude: second.longitudeRaw, speed: second.longitudeSpeed, elementType: "planet", planetType: second.type },
  );
}

function calculateReceptions(chart: BirthChart, sect: Sect) {
  const planets = getTraditionalPlanets(chart);
  const receptions: ReceptionTestimony[] = [];

  planets.forEach((guest) => {
    const rulers = getDignityRulers(guest.longitudeRaw, sect);
    const signIndex = getSignIndex(guest.longitudeRaw);
    const owners: Array<[ReceptionKind, string | undefined, number, "positiva" | "negativa"]> = [
      ["domicilio", rulers.domicile, 5, "positiva"],
      ["exaltacao", rulers.exaltation, 4, "positiva"],
      ["triplicidade", rulers.triplicity, 3, "positiva"],
      ["termo", rulers.term, 2, "positiva"],
      ["face", rulers.face, 1, "positiva"],
    ];

    Object.entries(DETRIMENT).forEach(([receiver, signs]) => {
      if (signs.includes(signIndex)) owners.push(["exilio", receiver, -5, "negativa"]);
    });
    Object.entries(FALL).forEach(([receiver, fallSign]) => {
      if (fallSign === signIndex) owners.push(["queda", receiver, -4, "negativa"]);
    });

    owners.forEach(([by, receiver, strength, polarity]) => {
      if (!receiver || receiver === guest.name) return;
      const receiverPlanet = planets.find((planet) => planet.name === receiver);
      if (!receiverPlanet) return;
      const aspect = getAspectBetween(guest, receiverPlanet);
      receptions.push({
        guest: guest.name,
        receiver,
        by,
        polarity,
        strength,
        hasAspect: Boolean(aspect),
        aspect: aspect?.aspectType,
        orb: aspect?.orbDistance,
      });
    });
  });

  const mutualReceptions: MutualReception[] = [];
  for (let firstIndex = 0; firstIndex < planets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < planets.length; secondIndex += 1) {
      const first = planets[firstIndex];
      const second = planets[secondIndex];
      const firstReceivesSecond = receptions.filter((item) => item.receiver === first.name && item.guest === second.name);
      const secondReceivesFirst = receptions.filter((item) => item.receiver === second.name && item.guest === first.name);
      if (firstReceivesSecond.length === 0 || secondReceivesFirst.length === 0) continue;
      const aspect = getAspectBetween(first, second);
      mutualReceptions.push({
        planets: [first.name, second.name],
        firstReceivesSecondBy: firstReceivesSecond.map((item) => item.by),
        secondReceivesFirstBy: secondReceivesFirst.map((item) => item.by),
        hasAspect: Boolean(aspect),
        aspect: aspect?.aspectType,
        orb: aspect?.orbDistance,
      });
    }
  }

  return { receptions, mutualReceptions };
}

function buildHousePlacement(chart: BirthChart, point: string, longitude: number, ruleScope: TechnicalHousePlacement["ruleScope"] = "planet-effective"): TechnicalHousePlacement {
  const geometricHouse = getHouseIndex(longitude, chart.housesData.house);
  const nextCuspHouse = geometricHouse === 12 ? 1 : geometricHouse + 1;
  const nextCuspLongitude = chart.housesData.house[nextCuspHouse - 1];
  const forwardDistance = normalizeLongitude(nextCuspLongitude - longitude);
  const sameSignAsNextCusp = getSignIndex(longitude) === getSignIndex(nextCuspLongitude);
  // Marcos: <=5° before the following cusp, in the same sign, is direct
  // testimony/effective placement in the following house. Frawley's published
  // natal practice uses the same basic ~5° same-sign cusp convention.
  const withinFive = forwardDistance > 0 && forwardDistance <= MARCOS_CUSP_BASE_MAX_DEGREES && sameSignAsNextCusp;
  const effective = ruleScope === "planet-effective" && withinFive ? nextCuspHouse : geometricHouse;
  return {
    point,
    longitude,
    geometricHouse,
    nextCusp: nextCuspHouse,
    distanceToNextCusp: forwardDistance,
    sameSignAsNextCusp,
    withinFiveDegreesBeforeNextCusp: withinFive,
    marcosEffectiveHouseCandidate: withinFive ? nextCuspHouse : null,
    effectiveHouseMarcos: effective,
    effectiveHouseFrawley: effective,
    resolution: ruleScope === "planet-effective" && withinFive ? "same-sign-within-5" : "geometric",
    ruleScope,
  };
}


const HOUSE_TOPICS = [
  "pessoa, corpo, saúde geral, cabeça, nome e presença",
  "finanças, bens móveis, dinheiro, alimento ingerido e garganta/pescoço/boca",
  "irmãos e parentes da mesma geração, vizinhos, comunicação, habilidades intelectuais básicas, educação primária, rotina e deslocamentos curtos/funcionais",
  "pai, pais em sentido amplo, raízes, ancestrais, pátria/cultura, terra, imóveis, minas e fim das coisas (não morte)",
  "prazer, sexo enquanto prazer, esportes, filhos e gravidez enquanto assunto do filho",
  "doença, acidentes, servos/subordinados/prestadores e animais pequenos/domesticáveis",
  "cônjuge, namorado(a), amante, noivo(a), pretendente, parceiros comerciais, contratos, bancos, clientes, público e inimigos declarados",
  "morte física, herança, medo/angústia, dinheiro dos outros por derivação e excreção/ânus",
  "religião, fé, templos, ensino superior, professores, médicos/advogados/astrólogos enquanto categorias profissionais, sonhos literais e viagens longas/finalísticas",
  "profissão/magistério, honra, reputação, atuação no mundo, autoridades, mãe, tratamento médico e joelhos",
  "amigos verdadeiros, bênçãos, esperanças/desejos, loteria contextual, salário como II da X, permissões e canelas",
  "vício, pecado, autodestruição/autossabotagem, inimigos ocultos, ataques clandestinos, prisão/confinamento/restrições, animais grandes/perigosos e pés",
];

const HOUSE_CANONICAL_TOPICS: Record<number, string[]> = {
  1: ["nativo", "corpo", "saúde geral", "presença", "cabeça", "nome", "aqui"],
  2: ["dinheiro próprio", "bens móveis", "posses inanimadas", "alimento ingerido"],
  3: ["irmãos", "parentes da mesma geração", "vizinhos", "comunicação", "aprendizado básico", "rotina", "deslocamentos curtos/funcionais"],
  4: ["pai", "raízes", "ancestralidade", "pátria/cultura", "terra", "imóveis", "minas", "fim das coisas"],
  5: ["prazer", "sexualidade enquanto prazer", "esportes", "filhos", "gravidez enquanto filho"],
  6: ["doença", "acidentes", "servidores", "subordinados", "prestadores", "animais pequenos/domesticáveis"],
  7: ["cônjuge", "parceiro afetivo", "parceiro comercial", "contratos", "bancos", "clientes", "público", "inimigos declarados"],
  8: ["morte física", "heranças", "medo/angústia", "recursos do outro por derivação"],
  9: ["religião", "fé", "templos", "ensino superior", "mestres", "profissões eruditas como categoria", "sonhos literais", "viagens longas/finalísticas"],
  10: ["profissão", "magistério", "honra", "reputação", "autoridade", "mãe", "tratamento médico"],
  11: ["amigos", "bênçãos", "esperanças", "apoios", "loteria contextual", "salário", "permissões"],
  12: ["vícios", "autossabotagem", "inimigos ocultos", "ataques clandestinos", "prisão/confinamento", "restrições", "animais grandes/perigosos"],
};

const HOUSE_MEDICAL_BODY_PARTS: Record<number, string[]> = {
  1: ["cabeça"],
  2: ["pescoço", "garganta", "boca"],
  3: ["braços", "mãos", "ombros"],
  4: ["peito", "pulmões"],
  5: ["coração", "fígado", "estômago", "costas", "lados"],
  6: ["intestinos", "barriga"],
  7: ["órgãos reprodutivos", "vias urinárias", "lombar"],
  8: ["sistema excretor", "ânus"],
  9: ["quadris", "coxas"],
  10: ["joelhos"],
  11: ["canelas"],
  12: ["pés"],
};

// Co-significadores naturais segundo o esquema preservado de Marcos; não são regentes.
const HOUSE_NATURAL_SIGNIFICATORS: Record<number, string[]> = {
  1: ["Saturno"], // Marcos ressalva "segundo alguns autores".
  2: ["Júpiter"],
  3: ["Marte"],
  4: ["Sol"],
  5: ["Vênus"],
  6: ["Mercúrio"],
  7: ["Lua"],
  8: ["Saturno"],
  9: ["Júpiter"],
  10: ["Marte"],
  11: ["Sol"],
  12: ["Vênus"],
};

const HOUSE_JOY_PLANET: Record<number, string | null> = {
  1: "Mercúrio",
  2: null,
  3: "Lua",
  4: null,
  5: "Vênus",
  6: "Marte",
  7: null,
  8: null,
  9: "Sol",
  10: null,
  11: "Júpiter",
  12: "Saturno",
};


function effectiveHouseByCuspRule(longitude: number, cusps: number[]): number {
  const geometric = getHouseIndex(longitude, cusps);
  const next = geometric === 12 ? 1 : geometric + 1;
  const nextCusp = cusps[next - 1];
  const distance = normalizeLongitude(nextCusp - longitude);
  const sameSign = getSignIndex(longitude) === getSignIndex(nextCusp);
  return distance > 0 && distance <= MARCOS_CUSP_BASE_MAX_DEGREES && sameSign ? next : geometric;
}

function distanceAfterCusp(longitude: number, cusp: number): number {
  return normalizeLongitude(longitude - cusp);
}

function buildHouseDossiers(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  lotDossiers: TechnicalLotDossier[],
  receptions: ReceptionTestimony[],
  chains: DispositorChain[],
): HouseTechnicalDossier[] {
  const traditional = getTraditionalPlanets(chart);
  return chart.housesData.house.map((cuspLongitude, index) => {
    const house = index + 1;
    const ruler = DOMICILE_RULER[getSignIndex(cuspLongitude)];
    const geometricOccupants = traditional
      .filter((planet) => getHouseIndex(planet.longitudeRaw, chart.housesData.house) === house)
      .map((planet) => {
        const placement = buildHousePlacement(chart, planet.name, planet.longitudeRaw);
        return {
          planet: planet.name,
          longitude: planet.longitudeRaw,
          geometricHouse: placement.geometricHouse,
          effectiveHouseMarcos: placement.effectiveHouseMarcos,
        };
      });
    const occupants = traditional
      .filter((planet) => buildHousePlacement(chart, planet.name, planet.longitudeRaw).effectiveHouseMarcos === house)
      .map((planet) => {
        const placement = buildHousePlacement(chart, planet.name, planet.longitudeRaw);
        const onCuspMarcos = placement.resolution === "same-sign-within-5" && placement.effectiveHouseMarcos === house;
        return {
          planet: planet.name,
          longitude: planet.longitudeRaw,
          geometricHouse: placement.geometricHouse,
          effectiveHouseMarcos: placement.effectiveHouseMarcos,
          distanceFromCusp: getAbsoluteAngularDistance(planet.longitudeRaw, cuspLongitude),
          onCuspMarcos,
          planetAffectedByHouse: true as const,
          directlyTestifiesHouseMarcos: onCuspMarcos || placement.geometricHouse === house,
        };
      });
    const cuspPlanetContacts = traditional
      .map((planet) => ({
        planet: planet.name,
        orb: getAbsoluteAngularDistance(planet.longitudeRaw, cuspLongitude),
        sameSign: getSignIndex(planet.longitudeRaw) === getSignIndex(cuspLongitude),
      }))
      .filter((item) => item.orb <= 5)
      .map((item) => ({ ...item, directHouseTestimonyMarcos: item.sameSign && item.orb <= 5 }))
      .sort((a, b) => a.orb - b.orb);
    const cuspFixedStars = (chart.fixedStarMatches ?? [])
      .filter((match) => match.pointElementType === "house" && match.pointName === `Cúspide ${house}` && match.sameSign !== false && match.isRelevant)
      .sort((a, b) => a.orb - b.orb);
    const activeLots = lotDossiers.flatMap((lot) => lot.relations
      .filter((relation) => relation.targetType === "cusp" && relation.target === `Cúspide ${house}`)
      .map((relation) => ({ name: lot.name, aspect: relation.aspect, orb: relation.orb, activeMarcos: relation.activeMarcos })));
    const rulerPlanet = getPlanet(chart, ruler);
    const rulerAspects = traditional
      .filter((planet) => planet.name !== ruler)
      .flatMap((planet) => {
        const aspect = getAspectBetween(rulerPlanet, planet);
        if (!aspect) return [];
        const marcosNatalEligible = aspect.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB;
        return [{
          planet: planet.name,
          aspect: aspect.aspectType,
          orb: aspect.orbDistance,
          applying: aspect.applying,
          marcosNatalEligible,
          marcosInfluenceTier: classifyMarcosNatalInfluenceOrb(aspect.orbDistance),
          sourceLayers: marcosNatalEligible ? ["Marcos" as const, "Frawley-context" as const] : ["Frawley-context" as const],
        }];
      })
      .sort((a, b) => a.orb - b.orb);
    const rulerReceptions = receptions.filter((reception) =>
      reception.guest === ruler || reception.receiver === ruler
    );
    const antiscion = normalizeLongitude(180 - cuspLongitude);
    return {
      house,
      topic: HOUSE_TOPICS[index],
      canonicalTopics: HOUSE_CANONICAL_TOPICS[house] ?? [],
      medicalBodyParts: HOUSE_MEDICAL_BODY_PARTS[house] ?? [],
      coSignificatorNatural: HOUSE_NATURAL_SIGNIFICATORS[house]?.[0] ?? null,
      joyPlanet: HOUSE_JOY_PLANET[house] ?? null,
      cuspLongitude,
      cuspSign: SIGNS[getSignIndex(cuspLongitude)],
      cuspAntiscion: antiscion,
      cuspContraAntiscion: normalizeLongitude(antiscion + 180),
      domicileRuler: ruler,
      naturalSignificators: HOUSE_NATURAL_SIGNIFICATORS[house] ?? [],
      rulerEssential: essential.find((item) => item.planet === ruler) ?? null,
      rulerAccidental: accidental.find((item) => item.planet === ruler) ?? null,
      rulerDispositor: chains.find((chain) => chain.planet === ruler)?.chain[1] ?? null,
      rulerAspects,
      rulerReceptions,
      occupants,
      geometricOccupants,
      cuspPlanetContacts,
      cuspFixedStars,
      activeLots,
    };
  });
}

function buildFrawleyLifeIndicators(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
): FrawleyLifeIndicators {
  const placidus = chart.housesData.variants?.placidus.cusps ?? chart.housesData.house;
  const sun = getPlanet(chart, "Sol");
  const moon = getPlanet(chart, "Lua");
  const sect = getSect(sun.longitudeRaw, chart.housesData.ascendant, chart.housesData.house);
  const hylegal = new Set([1, 7, 9, 10, 11]);
  const order: Array<Planet> = sect === "Diurno" ? [sun, moon] : [moon, sun];
  let hylegPlanet: "Sol" | "Lua" | null = null;
  let hylegHouse: number | null = null;
  for (const candidate of order) {
    const effective = effectiveHouseByCuspRule(candidate.longitudeRaw, placidus);
    if (hylegal.has(effective)) {
      hylegPlanet = candidate.name as "Sol" | "Lua";
      hylegHouse = effective;
      break;
    }
  }
  const hyleg = {
    planet: hylegPlanet,
    effectiveHouse: hylegHouse,
    reason: hylegPlanet
      ? `${hylegPlanet} é a primeira luz elegível pela ordem da secta e ocupa casa hilegíaca Placidus ${hylegHouse}.`
      : "Nem a luz do tempo nem a outra luminária ocupa casa hilegíaca; Frawley atual recomenda não inventar alternativa.",
  };

  const eighthCusp = placidus[7];
  const eighthHousePlanets = getTraditionalPlanets(chart)
    .filter((planet) => effectiveHouseByCuspRule(planet.longitudeRaw, placidus) === 8)
    .map((planet) => ({
      planet: planet.name,
      // A planet admitted into VIII by the ~5° same-sign cusp rule may still be
      // geometrically before the cusp. Selection of the closest Anareta candidate
      // therefore uses absolute angular distance, never a 358° forward distance.
      distanceFromCusp: getAbsoluteAngularDistance(planet.longitudeRaw, eighthCusp),
    }))
    .sort((a, b) => a.distanceFromCusp - b.distanceFromCusp);
  const lord8 = DOMICILE_RULER[getSignIndex(eighthCusp)];
  let anaretaPlanet: string | null = null;
  let anaretaReason = "";
  if (eighthHousePlanets.length) {
    anaretaPlanet = eighthHousePlanets[0].planet;
    anaretaReason = `Planeta na casa VIII mais próximo da cúspide: ${anaretaPlanet}.`;
  } else if (lord8 !== hylegPlanet) {
    anaretaPlanet = lord8;
    anaretaReason = `Casa VIII vazia; usa-se o regente da VIII (${lord8}).`;
  } else {
    anaretaReason = "Casa VIII vazia e seu regente coincide com o Hyleg; Frawley atual prefere não nomear Anareta oficial.";
  }

  const alcochodenPlanet = hylegPlanet
    ? DOMICILE_RULER[getSignIndex(getPlanet(chart, hylegPlanet).longitudeRaw)]
    : null;
  const pointCondition = (name: string): { point: string; condition: string; evidence: string[] } => {
    const ec = essential.find((item) => item.planet === name);
    const ac = accidental.find((item) => item.planet === name);
    return {
      point: name,
      condition: ac ? `casa ${ac.house}; ${ac.solarCondition}; velocidade ${ac.speedRatio.toFixed(2)}×` : "ponto/cúspide",
      evidence: [
        ...(ec ? [`dignidades: ${ec.dignities.map((d) => d.kind).join(", ") || "nenhuma"}; debilidades: ${ec.debilities.map((d) => d.kind).join(", ") || "nenhuma"}`] : []),
        ...(ac ? ac.testimonies.filter((t) => ["casa", "cazimi", "combusto", "sob-raios", "proximidade-trans-signo", "conjuncao-northNode", "conjuncao-southNode"].includes(t.code)).map((t) => t.label) : []),
      ],
    };
  };
  const ascRuler = DOMICILE_RULER[getSignIndex(chart.housesData.ascendant)];
  const longevityEvidence = [pointCondition("Sol"), pointCondition("Lua")];
  longevityEvidence.push({
    point: "Ascendente",
    condition: `${SIGNS[getSignIndex(chart.housesData.ascendant)]} ${chart.housesData.ascendant.toFixed(6)}°`,
    evidence: (chart.fixedStarMatches ?? []).filter((m) => m.pointName === "Cúspide 1" && m.isRelevant).map((m) => `estrela ${m.starName} (${m.orbLabel})`),
  });
  longevityEvidence.push(pointCondition(ascRuler));
  if (alcochodenPlanet && !["Sol", "Lua", ascRuler].includes(alcochodenPlanet)) longevityEvidence.push(pointCondition(alcochodenPlanet));

  return {
    method: "John Frawley current - Conversations on Natal Astrology 2",
    houseSystem: "Placidus",
    hyleg,
    anareta: { planet: anaretaPlanet, reason: anaretaReason, eighthHousePlanets },
    alcochoden: {
      planet: alcochodenPlanet,
      reason: hylegPlanet
        ? `Dispositor por domicílio do Hyleg (${hylegPlanet}); almúten não é usado na variante atual de Frawley.`
        : "Sem Hyleg, não há Alcochoden oficial.",
    },
    longevityEvidence,
    caveat: "O motor não calcula 'anos de vida' por uma fórmula única: o próprio Frawley atual trata os anos do Alcochoden apenas como triagem grosseira e exige técnicas preditivas combinadas.",
  };
}

function buildGeneralFortuneDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  houseDossiers: HouseTechnicalDossier[],
): GeneralFortuneDossier {
  // Frawley's current syllabus names "General fortune" but does not publish the
  // current lesson algorithm. Do not reverse-engineer a secret selection rule from
  // generic tradition. Instead expose the complete radical substrate so no arithmetic
  // remains missing if/when the exact source rule is supplied.
  const foundations = essential.map((ec) => {
    const ac = accidental.find((item) => item.planet === ec.planet)!;
    return { point: ec.planet, evidence: [`${ec.sign}: ${ec.dignities.map((d) => d.kind).join(", ") || "sem dignidade"}`, `debilidades ${ec.debilities.map((d) => d.kind).join(", ") || "nenhuma"}`, `casa ${ac.house}; ${ac.solarCondition}; velocidade ${ac.speedRatio.toFixed(2)}×`] };
  });
  houseDossiers.forEach((d) => {
    foundations.push({ point: `Casa ${d.house}`, evidence: [`regente ${d.domicileRuler}`, `cúspide ${d.cuspSign}`, `${d.occupants.length} ocupante(s) tradicional(is)`, `condição do regente: ${d.rulerEssential?.dignities.map((item) => item.kind).join(", ") || "sem dignidade"}`] });
  });
  const planetPacket = (name: string) => {
    const ec = essential.find((item) => item.planet === name)!;
    const ac = accidental.find((item) => item.planet === name)!;
    return { planet: name, evidence: [`dignidades ${ec.dignities.map((d) => d.kind).join(", ") || "nenhuma"}`, `debilidades ${ec.debilities.map((d) => d.kind).join(", ") || "nenhuma"}`, `casa ${ac.house}`, `condição solar ${ac.solarCondition}`] };
  };
  return {
    method: "Frawley current syllabus - technical evidence package",
    status: "public-syllabus-confirmed-exact-current-lesson-rule-not-public",
    foundations,
    beneficSupport: [planetPacket("Vênus"), planetPacket("Júpiter")],
    maleficPressure: [planetPacket("Marte"), planetPacket("Saturno")],
    note: "O currículo atual confirma um módulo de 'General fortune', mas sua regra integral não está publicada. Este bloco entrega o substrato radical completo (sete planetas + doze casas + benéficos/maléficos) e não atribui a Frawley uma seleção ou veredito que ele não publicou.",
  };
}

function buildModesDossier(chart: BirthChart, manner: MannerAnalysis, mentality: MentalityAnalysis): ModesDossier {
  const significators = [
    { point: "Lua", sign: mentality.moon.sign, modality: mentality.moon.modality },
    { point: "Mercúrio", sign: mentality.mercury.sign, modality: mentality.mercury.modality },
    { point: "Regente do Ascendente", sign: SIGNS[getSignIndex(getPlanet(chart, mentality.ascendantRuler).longitudeRaw)], modality: MODALITIES[getSignIndex(getPlanet(chart, mentality.ascendantRuler).longitudeRaw)] },
  ];
  const mentalRulers = [mentality.sourceVariants.gugu.moonAlmuten.winner, mentality.sourceVariants.gugu.mercuryAlmuten.winner]
    .filter((x): x is string => Boolean(x));
  mentalRulers.forEach((name) => {
    const p = getPlanet(chart, name);
    if (!significators.some((s) => s.point === `Regente mental ${name}`)) significators.push({ point: `Regente mental ${name}`, sign: p.sign, modality: MODALITIES[getSignIndex(p.longitudeRaw)] });
  });
  const modalityEvidence: Record<string, number> = { Cardinal: 0, Fixo: 0, "Mutável": 0 };
  significators.forEach((item) => { modalityEvidence[item.modality] = (modalityEvidence[item.modality] ?? 0) + 1; });
  return {
    frawleyAppliedLegacy: manner,
    guguSupplement: {
      status: "secondary-transcript",
      modalityEvidence,
      significators,
      note: "Camada suplementar de modalidade entre significadores mentais; não é fundida silenciosamente com a técnica publicada de Manner de Frawley.",
    },
  };
}

function buildProfessionDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  houseDossiers: HouseTechnicalDossier[],
): ProfessionDossier {
  const h10 = houseDossiers[9];
  const coreNames = ["Mercúrio", "Vênus", "Marte"] as const;
  const corePlanets = coreNames.map((planet) => ({
    planet,
    essential: essential.find((item) => item.planet === planet)!,
    accidental: accidental.find((item) => item.planet === planet)!,
  }));
  const ruler10Planet = getPlanet(chart, h10.domicileRuler);
  const moon = getPlanet(chart, "Lua");
  const sun = getPlanet(chart, "Sol");
  const jupiter = getPlanet(chart, "Júpiter");
  const sect = getSect(sun.longitudeRaw, chart.housesData.ascendant, chart.housesData.house);
  const planetsIn10 = getTraditionalPlanets(chart)
    .filter((planet) => effectiveHouseByCuspRule(planet.longitudeRaw, chart.housesData.house) === 10)
    .map((planet) => planet.name);
  const vocationLongitude = normalizeLongitude(chart.housesData.mc + moon.longitudeRaw - sun.longitudeRaw);
  const fameLongitude = normalizeLongitude(
    sect === "Diurno"
      ? chart.housesData.ascendant + jupiter.longitudeRaw - sun.longitudeRaw
      : chart.housesData.ascendant + sun.longitudeRaw - jupiter.longitudeRaw,
  );
  const anglePoints = [
    { angle: "ASC" as const, longitude: chart.housesData.ascendant },
    { angle: "IC" as const, longitude: normalizeLongitude(chart.housesData.mc + 180) },
    { angle: "DSC" as const, longitude: normalizeLongitude(chart.housesData.ascendant + 180) },
    { angle: "MC" as const, longitude: chart.housesData.mc },
  ];
  const angleProximity = getTraditionalPlanets(chart)
    .map((planet) => {
      const nearest = anglePoints
        .map((item) => ({ ...item, distance: getAbsoluteAngularDistance(planet.longitudeRaw, item.longitude) }))
        .sort((a, b) => a.distance - b.distance)[0];
      return { planet: planet.name, nearestAngle: nearest.angle, distanceFromAngle: nearest.distance };
    })
    .sort((a, b) => a.distanceFromAngle - b.distanceFromAngle);
  // Do not call proximity to an arbitrary house cusp "angularity". Until a
  // primary Gugu threshold is source-locked, angular prominence is limited to
  // planets actually occupying angular houses; exact distances to ASC/IC/DSC/MC
  // are materialized separately without inventing a cutoff.
  const angularProminence = getTraditionalPlanets(chart)
    .flatMap((planet) => {
      const ac = accidental.find((item) => item.planet === planet.name)!;
      if (![1, 4, 7, 10].includes(ac.house)) return [];
      const nearest = angleProximity.find((item) => item.planet === planet.name)!;
      return [{ planet: planet.name, house: ac.house, angle: nearest.nearestAngle, distanceFromAngle: nearest.distanceFromAngle }];
    })
    .sort((a, b) => a.distanceFromAngle - b.distanceFromAngle);
  const strongTraditionalPlanets = essential
    .filter((item) => item.dignities.some((d) => d.kind === "domicilio" || d.kind === "exaltacao"))
    .map((item) => ({
      planet: item.planet,
      essentialDignities: item.dignities.map((d) => d.kind),
      house: accidental.find((a) => a.planet === item.planet)?.house ?? 0,
    }));
  return {
    method: "Frawley Applied + Marcos capability framing + Gugu supplement",
    house10: h10,
    corePlanets,
    mcFixedStars: (chart.fixedStarMatches ?? []).filter((m) => m.pointName === "Cúspide 10" && m.sameSign !== false && m.isRelevant),
    ruler10Modality: MODALITIES[getSignIndex(ruler10Planet.longitudeRaw)],
    frawleyVocationalIndicators: {
      planetsIn10,
      fallbackRuler10: h10.domicileRuler,
      verifiedCriteria: [
        "Casa X",
        "regente da Casa X",
        "planetas na Casa X",
        "Mercúrio, Vênus e Marte como indicadores gerais de capacidade",
      ],
      disabledUnverifiedCriteria: [
        "planeta que nasce mais próximo do Sol no nascer do Sol - não atribuir sem fonte direta verificada",
      ],
      note: "Camada Frawley limitada ao que está verificado no corpus: X, regente X, planetas em X e Mercúrio/Vênus/Marte. Não há ranking totalizador de vocação.",
    },
    vocationalLots: {
      vocation: {
        longitude: vocationLongitude,
        dispositor: DOMICILE_RULER[getSignIndex(vocationLongitude)],
        house: getHouseIndex(vocationLongitude, chart.housesData.house),
        formula: "MC + Lua - Sol (Parte da Vocação: Fortuna projetada a partir do MC; Frawley publicado)",
      },
      fameOrWorkToBeDone: {
        longitude: fameLongitude,
        dispositor: DOMICILE_RULER[getSignIndex(fameLongitude)],
        house: getHouseIndex(fameLongitude, chart.housesData.house),
        formula: sect === "Diurno"
          ? "ASC + Júpiter - Sol (dia)"
          : "ASC + Sol - Júpiter (noite)",
      },
    },
    guguSupplement: {
      status: "secondary-transcript",
      angularProminence,
      angleProximity,
      strongTraditionalPlanets,
      note: "Gugu é usado apenas como complemento. Angularidade significa casas angulares/ângulos reais; distâncias a ASC/IC/DSC/MC são preservadas sem limiar inventado. Não se usa proximidade de uma cúspide qualquer como angularidade.",
    },
    evidence: [
      "Frawley publicado: pesar casa X, regente da X, planetas na X e Mercúrio/Vênus/Marte.",
      "Marcos: converter a estrutura em capacidades e estilo de trabalho, não em uma profissão única determinada.",
    ],
  };
}

function buildRelationshipDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  receptions: { receptions: ReceptionTestimony[]; mutualReceptions: MutualReception[] },
  houseDossiers: HouseTechnicalDossier[],
  lotDossiers: TechnicalLotDossier[],
): RelationshipDossier {
  const ruler1 = houseDossiers[0].domicileRuler;
  const ruler7 = houseDossiers[6].domicileRuler;
  const p1 = getPlanet(chart, ruler1);
  const p7 = getPlanet(chart, ruler7);
  const aspect = getAspectBetween(p1, p7);
  const venus = getPlanet(chart, "Vênus");
  const saturn = getPlanet(chart, "Saturno");
  const desc = chart.housesData.house[6];
  const marriageLongitude = normalizeLongitude(chart.housesData.ascendant + desc - venus.longitudeRaw);
  const marriagePartnerLongitude = normalizeLongitude(chart.housesData.ascendant + desc - p7.longitudeRaw);
  const maleMarriageLongitude = normalizeLongitude(chart.housesData.ascendant + venus.longitudeRaw - saturn.longitudeRaw);
  const femaleMarriageLongitude = normalizeLongitude(chart.housesData.ascendant + saturn.longitudeRaw - venus.longitudeRaw);
  const makeMarriagePart = (
    id: "relationship" | "marriage-partner" | "male-native" | "female-native" | "applied-example",
    longitude: number,
    formula: string,
    sourceStatus: "revised-horary-published" | "applied-published-example",
    note: string,
  ) => ({
    id,
    longitude,
    dispositor: DOMICILE_RULER[getSignIndex(longitude)],
    house: getHouseIndex(longitude, chart.housesData.house),
    formula,
    sourceStatus,
    note,
  });
  return {
    method: "Marcos Monteiro primary + Frawley house/Part supplement",
    ruler1,
    ruler7,
    ruler1Essential: essential.find((e) => e.planet === ruler1)!,
    ruler1Accidental: accidental.find((e) => e.planet === ruler1)!,
    ruler7Essential: essential.find((e) => e.planet === ruler7)!,
    ruler7Accidental: accidental.find((e) => e.planet === ruler7)!,
    directAspect: aspect && aspect.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB
      ? { aspect: aspect.aspectType, orb: aspect.orbDistance, applying: aspect.applying, marcosNatalEligible: true as const, marcosInfluenceTier: classifyMarcosNatalInfluenceOrb(aspect.orbDistance) }
      : null,
    broaderTraditionalAspect: aspect && aspect.orbDistance > MARCOS_NATAL_INFLUENCE_MAX_ORB
      ? { aspect: aspect.aspectType, orb: aspect.orbDistance, applying: aspect.applying, sourceLayers: ["Frawley-context"] as ["Frawley-context"] }
      : null,
    reception1To7: receptions.receptions.filter((r) => r.guest === ruler1 && r.receiver === ruler7),
    reception7To1: receptions.receptions.filter((r) => r.guest === ruler7 && r.receiver === ruler1),
    cusp1Stars: houseDossiers[0].cuspFixedStars,
    cusp7Stars: houseDossiers[6].cuspFixedStars,
    partOfLove: lotDossiers.find((lot) => lot.key === "love") ?? lotDossiers.find((lot) => lot.name.toLowerCase().includes("amor")) ?? null,
    frawleyMarriageParts: [
      makeMarriagePart(
        "relationship",
        marriageLongitude,
        "ASC + DESC - Vênus",
        "revised-horary-published",
        "Parte principal do relacionamento entre as pessoas significadas pelas casas I e VII; descreve a relação, não o momento do casamento.",
      ),
      makeMarriagePart(
        "male-native",
        maleMarriageLongitude,
        "ASC + Vênus - Saturno",
        "revised-horary-published",
        "Frawley menciona esta Parte do Casamento do Homem como técnica tradicional ligada sobretudo a casamentos arranjados; não é promovida automaticamente.",
      ),
      makeMarriagePart(
        "female-native",
        femaleMarriageLongitude,
        "ASC + Saturno - Vênus",
        "revised-horary-published",
        "Frawley menciona esta Parte do Casamento da Mulher como técnica tradicional ligada sobretudo a casamentos arranjados; não é promovida automaticamente.",
      ),
      makeMarriagePart(
        "applied-example",
        marriageLongitude,
        "ASC + cúspide VII - Vênus",
        "applied-published-example",
        "A fórmula aparece também no exemplo publicado de The Real Astrology Applied. Mantida como proveniência histórica, sem duplicar peso interpretativo.",
      ),
      makeMarriagePart(
        "marriage-partner",
        marriagePartnerLongitude,
        "ASC + DESC - regente da VII",
        "revised-horary-published",
        "Parte do Parceiro Matrimonial citada por Frawley; é armazenada como variante distinta da Parte principal do relacionamento.",
      ),
    ],
  };
}

function buildHealthSymbolicDossier(
  chart: BirthChart,
  temperament: TemperamentResult,
  houseDossiers: HouseTechnicalDossier[],
  lotDossiers: TechnicalLotDossier[],
  outerPlanetModifiers: OuterPlanetModifierDossier[],
): HealthSymbolicDossier {
  const ruler1 = houseDossiers[0].domicileRuler;
  const ruler6 = houseDossiers[5].domicileRuler;
  const relevantStars = (chart.fixedStarMatches ?? []).filter((m) =>
    ["Cúspide 1", "Cúspide 6", ruler1, ruler6].includes(m.pointName) && m.isRelevant && m.sameSign !== false
  );
  const relevantLots = lotDossiers.filter((lot) => lot.relations.some((relation) => relation.activeMarcos && ["Cúspide 1", "Cúspide 6", ruler1, ruler6].includes(relation.target)));
  const planetSignMedicalCorrespondences = getTraditionalPlanets(chart).map((planet) => ({
    planet: planet.name,
    sign: SIGNS[getSignIndex(planet.longitudeRaw)],
    bodyParts: LILLY_PLANET_SIGN_BODY_PARTS[planet.name]?.[getSignIndex(planet.longitudeRaw)] ?? [],
    source: "William Lilly CA I p.119-120; traditional table explicitly invoked by Marcos" as const,
  }));
  const outerCuspModifiers = outerPlanetModifiers.flatMap((outer) =>
    outer.contacts
      .filter((contact) => contact.targetType === "house-cusp")
      .map((contact) => ({
        planet: outer.planet,
        cusp: contact.target,
        house: Number(contact.target.replace("Cúspide ", "")),
        aspect: contact.aspect,
        orb: contact.orb,
        authorialOrbStatus: contact.authorialOrbStatus,
      })),
  ).sort((a, b) => a.orb - b.orb);
  return {
    method: "Marcos Monteiro - symbolic predisposition evidence",
    disclaimer: "Bloco astrológico simbólico para organização técnica; não é diagnóstico médico nem substitui avaliação clínica.",
    temperament,
    ruler1,
    ruler6,
    house1: houseDossiers[0],
    house6: houseDossiers[5],
    relevantStars,
    relevantLots,
    planetSignMedicalCorrespondences,
    outerCuspModifiers,
  };
}

function enrichMentalityContext(
  mentality: MentalityAnalysis,
  lotDossiers: TechnicalLotDossier[],
  antiscia: NatalAnalysis["antiscia"],
): MentalityAnalysis {
  const mental = new Set(["Lua", "Mercúrio"]);
  const lotRelations = lotDossiers.flatMap((lot) =>
    lot.relations
      .filter((relation) => mental.has(relation.target) && (relation.aspect === "conjunction" || relation.aspect === "opposition"))
      .map((relation) => ({
        significator: relation.target as "Lua" | "Mercúrio",
        lot: lot.name,
        relation: relation.aspect as "conjunction" | "opposition",
        orb: relation.orb,
        activeMarcos: relation.activeMarcos,
      })),
  ).sort((a, b) => a.orb - b.orb);

  const antiscionContacts = antiscia.contacts
    .filter((contact) => mental.has(contact.first) || mental.has(contact.second))
    .sort((a, b) => a.orb - b.orb);

  return {
    ...mentality,
    contextualContacts: { lotRelations, antiscionContacts },
  };
}


function getSignPropertyDossier(longitude: number): SignPropertyDossier {
  const signIndex = getSignIndex(longitude);
  return {
    sign: SIGNS[signIndex],
    fertility: SIGN_FERTILITY[signIndex],
    voice: SIGN_VOICE[signIndex],
    creatureType: SIGN_CREATURE_TYPE[signIndex],
    feral: isFeralLongitude(longitude),
    doubleBodied: SIGN_DOUBLE_BODIED[signIndex],
  };
}

function buildSpiritualOrientationDossier(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  receptions: ReceptionTestimony[],
  houseDossiers: HouseTechnicalDossier[],
  lotDossiers: TechnicalLotDossier[],
): SpiritualOrientationDossier {
  const ruler1 = houseDossiers[0].domicileRuler;
  const ruler9 = houseDossiers[8].domicileRuler;
  const ruler3 = houseDossiers[2].domicileRuler;
  const packet = (planet: string) => ({
    essential: essential.find((item) => item.planet === planet)!,
    accidental: accidental.find((item) => item.planet === planet)!,
  });
  const asc = chart.housesData.ascendant;
  const sunLongitude = getPlanet(chart, "Sol").longitudeRaw;
  const moonLongitude = getPlanet(chart, "Lua").longitudeRaw;
  const jupiterLongitude = getPlanet(chart, "Júpiter").longitudeRaw;
  const marsLongitude = getPlanet(chart, "Marte").longitudeRaw;
  const saturnLongitude = getPlanet(chart, "Saturno").longitudeRaw;
  const fortuneLongitude = normalizeLongitude(asc + moonLongitude - sunLongitude);
  const spiritLongitude = normalizeLongitude(asc + sunLongitude - moonLongitude);
  const makeSpiritualPart = (
    key: FrawleySpiritualPart["key"], name: string, longitude: number, formula: string,
  ): FrawleySpiritualPart => {
    const normalized = normalizeLongitude(longitude);
    const antiscion = normalizeLongitude(180 - normalized);
    return {
      key,
      name,
      longitude: normalized,
      formula,
      dispositor: DOMICILE_RULER[getSignIndex(normalized)],
      housePlacement: buildHousePlacement(chart, name, normalized, "point-contact-only"),
      antiscion,
      contraAntiscion: normalizeLongitude(antiscion + 180),
    };
  };
  const sevenKeyLots: FrawleySpiritualPart[] = [
    makeSpiritualPart("spirit", "Parte do Espírito", spiritLongitude, "ASC + Sol - Lua"),
    // F-APP p.177: the glyph is Mercury (☿), not Jupiter (♃).
    makeSpiritualPart("faith", "Parte da Fé", asc + getPlanet(chart, "Mercúrio").longitudeRaw - moonLongitude, "ASC + Mercúrio - Lua"),
    makeSpiritualPart("love", "Parte do Amor, Amizade e Afeição", asc + spiritLongitude - fortuneLongitude, "ASC + Espírito - Fortuna"),
    makeSpiritualPart("despair", "Parte do Desespero, Fraude e Penúria", asc + fortuneLongitude - spiritLongitude, "ASC + Fortuna - Espírito"),
    makeSpiritualPart("valour", "Parte do Valor e Coragem", asc + fortuneLongitude - marsLongitude, "ASC + Fortuna - Marte"),
    makeSpiritualPart("victory", "Parte da Vitória e Ajuda do Alto", asc + jupiterLongitude - spiritLongitude, "ASC + Júpiter - Espírito"),
    makeSpiritualPart("captivity", "Parte do Cativeiro e Escape", asc + saturnLongitude - fortuneLongitude, "ASC + Saturno - Fortuna"),
  ];
  const royal = new Set(["Aldebaran", "Regulus", "Antares", "Fomalhaut"]);
  return {
    method: "John Frawley - The Real Astrology Applied (published legacy)",
    house9: houseDossiers[8],
    house3: houseDossiers[2],
    ruler9,
    ruler3,
    ascendantRuler: ruler1,
    jupiter: packet("Júpiter"),
    moon: packet("Lua"),
    sun: packet("Sol"),
    partOfFortune: lotDossiers.find((lot) => lot.key === "fortune") ?? null,
    sevenKeyLots,
    royalStarContacts: (chart.fixedStarMatches ?? []).filter((match) =>
      royal.has(match.starName) && match.sameSign !== false && match.isRelevant
    ),
    receptionsWithRulerAscendant: receptions.filter((reception) =>
      reception.guest === ruler1 || reception.receiver === ruler1
    ),
    note: "Frawley publicado começa a orientação espiritual por Júpiter, casas IX e III, Ascendente e Lua; se o quadro é sólido, acrescenta o Sol. As sete Partes espirituais são calculadas aqui pelas fórmulas próprias publicadas em The Real Astrology Applied, separadas das sete Partes de Marcos. Este é um pacote de evidência: não produz automaticamente um juízo moral ou religioso.",
  };
}

function buildChildrenDossier(
  chart: BirthChart,
  sect: Sect,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  houseDossiers: HouseTechnicalDossier[],
): ChildrenDossier {
  const house5 = houseDossiers[4];
  const ruler5 = house5.domicileRuler;
  const ruler5Planet = getPlanet(chart, ruler5);
  const moon = getPlanet(chart, "Lua");
  const jupiter = getPlanet(chart, "Júpiter");
  const saturn = getPlanet(chart, "Saturno");
  const partLongitude = normalizeLongitude(
    sect === "Noturno"
      ? chart.housesData.ascendant + jupiter.longitudeRaw - saturn.longitudeRaw
      : chart.housesData.ascendant + saturn.longitudeRaw - jupiter.longitudeRaw
  );
  return {
    method: "John Frawley - The Real Astrology Applied (published legacy)",
    house5,
    cuspSignProperties: getSignPropertyDossier(house5.cuspLongitude),
    ruler5,
    ruler5SignProperties: getSignPropertyDossier(ruler5Planet.longitudeRaw),
    moon: {
      essential: essential.find((item) => item.planet === "Lua")!,
      accidental: accidental.find((item) => item.planet === "Lua")!,
      signProperties: getSignPropertyDossier(moon.longitudeRaw),
    },
    jupiter: {
      essential: essential.find((item) => item.planet === "Júpiter")!,
      accidental: accidental.find((item) => item.planet === "Júpiter")!,
      signProperties: getSignPropertyDossier(jupiter.longitudeRaw),
    },
    partOfChildren: {
      longitude: partLongitude,
      dispositor: DOMICILE_RULER[getSignIndex(partLongitude)],
      house: getHouseIndex(partLongitude, chart.housesData.house),
      formula: sect === "Noturno"
        ? "ASC + Júpiter - Saturno"
        : "ASC + Saturno - Júpiter",
      formulaStatus: sect === "Noturno"
        ? "frawley-published-night-example"
        : "traditional-day-reversal-supplement",
      signProperties: getSignPropertyDossier(partLongitude),
    },
    note: "Frawley publicado julga filhos pela casa V e seu regente, fertilidade dos signos, Lua como significadora natural da geração, Júpiter, movimento/luz/aspectos e Parte dos Filhos. O motor entrega os testemunhos, não uma contagem determinista de filhos.",
  };
}

function buildWealthDossier(
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  houseDossiers: HouseTechnicalDossier[],
  lotDossiers: TechnicalLotDossier[],
): WealthDossier {
  const fortune = lotDossiers.find((lot) => lot.key === "fortune") ?? null;
  return {
    method: "John Frawley - The Real Astrology Applied (published legacy)",
    house2: houseDossiers[1],
    ruler2: houseDossiers[1].domicileRuler,
    jupiterNaturalWealth: {
      essential: essential.find((item) => item.planet === "Júpiter")!,
      accidental: accidental.find((item) => item.planet === "Júpiter")!,
    },
    partOfFortune: fortune,
    fortuneDispositor: fortune?.domicileDispositor ?? null,
    note: "Pacote publicado de riqueza: casa II/regente, Júpiter como significador natural de riqueza e Fortuna com seu dispositor, sempre qualificados por dignidade, recepção, aspecto e contexto das casas.",
  };
}

function buildSourceRegistry(): SourceRegistryEntry[] {
  return [
    {
      id: "marcos-book",
      author: "Marcos Monteiro",
      source: "Introdução à Astrologia Ocidental — edição revista e aumentada",
      evidenceKind: "published",
      status: "canonical",
      note: "Base conceitual e técnica canônica do projeto quando Marcos fornece regra explícita.",
    },
    {
      id: "marcos-transcripts-2025-2026",
      author: "Marcos Monteiro",
      source: "Stories, respostas, aulas e transcrições fornecidas pelo usuário (2025–2026)",
      evidenceKind: "direct",
      status: "canonical",
      note: "Usadas para refinamentos posteriores ao livro: temperamento, cúspides, mentalidade, relações, nodos, estrelas, Partes, profissão e técnicas temporais. Regra direta preservada no hardening: até ~3° é o núcleo forte do aspecto natal; >3° até 5° pode permanecer contextualmente relevante. Estrelas comuns usam contato muito estreito e as principais podem chegar a 2–3° conforme o corpus.",
    },
    {
      id: "frawley-current-natal",
      author: "John Frawley",
      source: "Conversations on Natal Astrology 1/2/3 + current Natal syllabus/tutorial descriptions",
      url: "https://www.johnfrawley.com/conversations-on-natal1",
      evidenceKind: "published",
      status: "current",
      note: "Fonte atual para prioridades de julgamento, temperamento como fundação, Hyleg/Anareta/Alcochoden e escopo do curso. Onde Frawley diz que o método mudou mas o algoritmo atual não é público, o engine mantém a versão publicada separada e source-locka a lacuna.",
    },
    {
      id: "frawley-applied",
      author: "John Frawley",
      source: "The Real Astrology Applied",
      evidenceKind: "published",
      status: "legacy-published",
      note: "Usado para procedimentos natal publicados de Manner, mente, profissão, casas, riqueza, filhos, orientação espiritual, Partes e exemplos explícitos de estrelas/objetos tradicionais (incluindo Regulus, Spica, Algol, Canopus, Pollux, Praesepe, Facies e a nebulosa de Andrômeda/Vertex); não é rotulado como método atual quando Frawley informa que sua prática mudou.",
    },
    {
      id: "gugu-direct-course-corpus",
      author: "Luiz Gonzaga de Carvalho Neto",
      source: "Cosmologia e Astrologia Medieval + aulas ICLS + Live Temperamentos e Mentalidades com Marcos Monteiro",
      evidenceKind: "direct",
      status: "supplemental",
      note: "Fonte direta para temperamento histórico, mentalidade, planeta mais forte, motivação primária, potências/faculdades da alma e método simbólico. O motor mantém Gugu como camada autoral identificada, sem substituir Marcos/Frawley onde divergem.",
    },
    {
      id: "gugu-symbolic-anthropology",
      author: "Luiz Gonzaga de Carvalho Neto",
      source: "Introdução ao Simbolismo Astrológico / aulas de simbolismo, cosmologia e antropologia",
      evidenceKind: "published",
      status: "supplemental",
      note: "Fundamento para eixos simbólicos, analogia microcosmo–macrocosmo e correspondências planetárias com faculdades da alma. Correspondência é analógica, não identidade ontológica nem score psicológico.",
    },
    {
      id: "swiss-ephemeris",
      author: "Swiss Ephemeris",
      source: "@swisseph/browser + Swiss Ephemeris data files",
      evidenceKind: "software",
      status: "technical",
      note: "Astronomia, casas e posições exatas; resultados técnicos são separados das regras de julgamento dos autores.",
    },
  ];
}


function buildDerivedHouseTable(chart: BirthChart): DerivedHouseLookupEntry[] {
  const entries: DerivedHouseLookupEntry[] = [];
  for (let baseHouse = 1; baseHouse <= 12; baseHouse += 1) {
    for (let relativeHouse = 1; relativeHouse <= 12; relativeHouse += 1) {
      const resolvedHouse = ((baseHouse + relativeHouse - 2) % 12) + 1;
      const cusp = chart.housesData.house[resolvedHouse - 1];
      entries.push({
        baseHouse,
        relativeHouse,
        resolvedHouse,
        resolvedRuler: DOMICILE_RULER[getSignIndex(cusp)],
        derivation: `${relativeHouse}ª a partir da Casa ${baseHouse} = Casa ${resolvedHouse}`,
      });
    }
  }
  return entries;
}

function buildPlanetTechnicalPackets(
  chart: BirthChart,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  chains: DispositorChain[],
  receptions: ReceptionTestimony[],
  antiscia: NatalAnalysis["antiscia"],
): PlanetTechnicalPacket[] {
  const traditional = getTraditionalPlanets(chart);
  const nodePlanets = chart.planets.filter((planet) => planet.type === "northNode" || planet.type === "southNode");

  return traditional.map((planet) => {
    const aspects = traditional
      .filter((other) => other.name !== planet.name)
      .flatMap((other) => {
        const match = getAspectBetween(planet, other);
        if (!match) return [];
        const marcosNatalEligible = match.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB;
        return [{
          planet: other.name,
          aspect: match.aspectType,
          orb: match.orbDistance,
          applying: match.applying,
          marcosNatalEligible,
          marcosInfluenceTier: classifyMarcosNatalInfluenceOrb(match.orbDistance),
          sourceLayers: marcosNatalEligible ? ["Marcos" as const, "Frawley-context" as const] : ["Frawley-context" as const],
        }];
      })
      .sort((a, b) => a.orb - b.orb);
    const ruledHouses = chart.housesData.house
      .map((cusp, index) => ({ house: index + 1, ruler: DOMICILE_RULER[getSignIndex(cusp)] }))
      .filter((item) => item.ruler === planet.name)
      .map((item) => item.house);
    const fixedStars = (chart.fixedStarMatches ?? [])
      .filter((match) => match.pointName === planet.name && match.isRelevant)
      .sort((a, b) => a.orb - b.orb);
    const nodeRawDistances = nodePlanets
      .map((node) => ({ node: node.name, distance: getAbsoluteAngularDistance(planet.longitudeRaw, node.longitudeRaw) }))
      .sort((a, b) => a.distance - b.distance);
    // Marcos states that only conjunction with the nodes matters, but the supplied
    // corpus does not source-lock a universal node orb. The interpretive packet
    // therefore uses a deliberately conservative 1° gate (matching the partile
    // accidental-testimony layer) while preserving all raw distances separately.
    const nodeConjunctions = nodeRawDistances
      .filter((item) => item.distance <= 1)
      .map((item) => ({ node: item.node, orb: item.distance, sourceGate: "CONJUNCTION_ONLY_CONSERVATIVE_1DEG" as const }));
    const antiscionContacts = antiscia.contacts.filter((contact) => contact.first === planet.name || contact.second === planet.name);

    return {
      planet: planet.name,
      longitude: planet.longitudeRaw,
      sign: SIGNS[getSignIndex(planet.longitudeRaw)],
      ruledHouses,
      housePlacement: buildHousePlacement(chart, planet.name, planet.longitudeRaw),
      essential: essential.find((item) => item.planet === planet.name)!,
      accidental: accidental.find((item) => item.planet === planet.name)!,
      dispositor: chains.find((item) => item.planet === planet.name)!,
      aspects,
      receptionsAsGuest: receptions.filter((item) => item.guest === planet.name),
      receptionsAsReceiver: receptions.filter((item) => item.receiver === planet.name),
      fixedStars,
      nodeConjunctions,
      nodeRawDistances,
      antiscionContacts,
    };
  });
}

function buildOuterPlanetModifiers(chart: BirthChart): OuterPlanetModifierDossier[] {
  const outers = chart.planets.filter((planet) => ["uranus", "neptune", "pluto"].includes(planet.type));
  const traditional = getTraditionalPlanets(chart);
  const angles = [
    { name: "ASC", longitude: chart.housesData.ascendant },
    { name: "DSC", longitude: normalizeLongitude(chart.housesData.ascendant + 180) },
    { name: "MC", longitude: chart.housesData.mc },
    { name: "IC", longitude: normalizeLongitude(chart.housesData.mc + 180) },
  ];
  const houseCusps = chart.housesData.house.map((longitude, index) => ({
    name: `Cúspide ${index + 1}`,
    longitude,
  }));
  return outers.map((outer) => {
    const contacts: OuterPlanetModifierDossier["contacts"] = [];
    const add = (target: string, targetType: "traditional-planet" | "angle" | "house-cusp", longitude: number) => {
      const aspectType = getAspectTypeFromSigns(outer.longitudeRaw, longitude);
      if (aspectType !== "conjunction" && aspectType !== "opposition") return;
      const conjunctionOrb = getAbsoluteAngularDistance(outer.longitudeRaw, longitude);
      const orb = aspectType === "conjunction" ? conjunctionOrb : Math.abs(180 - conjunctionOrb);
      // Marcos treats the trans-Saturnians as fixed-star-like secondary modifiers and
      // explicitly privileges close conjunction/opposition, but the recovered corpus
      // does NOT publish a universal numerical cutoff for this special class.
      // Preserve the full conjunction/opposition geometry and expose the generic
      // 3°/5° natal tier only as a proximity reference; never auto-activate it.
      contacts.push({
        target,
        targetType,
        aspect: aspectType,
        orb,
        tier: classifyMarcosNatalInfluenceOrb(orb),
        authorialOrbStatus: "UNIVERSAL_CUTOFF_NOT_PUBLISHED",
        automaticInterpretation: false,
      });
    };
    traditional.forEach((planet) => add(planet.name, "traditional-planet", planet.longitudeRaw));
    angles.forEach((angle) => add(angle.name, "angle", angle.longitude));
    // Marcos explicitly uses a trans-Saturnian close to a non-angular cusp in
    // his public health example (Pluto at cusp V). Therefore all twelve cusps
    // are materialized as possible fixed-star-like targets, not only angles.
    houseCusps.forEach((cusp) => add(cusp.name, "house-cusp", cusp.longitude));
    return {
      planet: outer.name as OuterPlanetModifierDossier["planet"],
      longitude: outer.longitudeRaw,
      sign: SIGNS[getSignIndex(outer.longitudeRaw)],
      geometricHouse: getHouseIndex(outer.longitudeRaw, chart.housesData.house),
      contacts: contacts.sort((a, b) => a.orb - b.orb),
      policy: {
        rulership: "NONE",
        essentialDignity: "NONE",
        almutenParticipation: "NONE",
        role: "SECONDARY_MODIFIER_ONLY",
        allowedAspectTypes: ["conjunction", "opposition"],
        authorialOrbStatus: "UNIVERSAL_CUTOFF_NOT_PUBLISHED",
      },
    };
  });
}

function buildTechnicalForm(
  chart: BirthChart,
  sect: Sect,
  essential: EssentialCondition[],
  accidental: AccidentalCondition[],
  chains: DispositorChain[],
  cuspAlmutens: DegreeAlmuten[],
  receptions: { receptions: ReceptionTestimony[]; mutualReceptions: MutualReception[] },
  antiscia: NatalAnalysis["antiscia"],
  temperament: TemperamentResult,
  mentality: MentalityAnalysis,
  manner: MannerAnalysis,
): NatalTechnicalForm {
  const lots = calculateArabicLots(chart);
  const lotDossiers: TechnicalLotDossier[] = ORDERED_ARABIC_PART_KEYS.flatMap((key) => {
    const lot = lots[key];
    if (!lot) return [];
    const dispositor = DOMICILE_RULER[getSignIndex(lot.longitude)];
    const relations: TechnicalLotDossier["relations"] = [];
    const source = { longitude: lot.longitude, elementType: "arabicPart" as const };

    const addPartRelation = (
      target: string,
      targetType: "planet" | "cusp" | "arabicPart",
      targetLongitude: number,
      targetSpeed?: number,
      targetPlanetType?: PlanetType,
    ) => {
      // Não usamos resolveTraditionalAspect aqui porque o seu orb genérico para
      // Partes é 3°. Marcos preserva candidatos de Parte até 5° para
      // conjunção/oposição e conjunção à cúspide; <=1° é apenas a faixa
      // explicitamente muito forte, não o limite de existência do contato.
      const aspectType = getAspectTypeFromSigns(source.longitude, targetLongitude);
      if (!aspectType) return;
      const allowed = targetType === "cusp"
        ? aspectType === "conjunction"
        : aspectType === "conjunction" || aspectType === "opposition";
      if (!allowed) return;
      const orbDistance = getTraditionalAspectOrbFromLongitudes(source.longitude, targetLongitude, aspectType);
      if (orbDistance > 5) return;
      const applying = isApplyingByMotion({
        firstLongitude: source.longitude,
        firstSpeed: 0,
        secondLongitude: targetLongitude,
        secondSpeed: targetSpeed ?? 0,
        aspectAngle: getAspectAngleFromType(aspectType),
      });
      relations.push({
        target,
        targetType,
        aspect: aspectType,
        orb: orbDistance,
        applying,
        activeMarcos: orbDistance <= 1,
        activationThresholdDegrees: 1,
        rule: targetType === "cusp" ? "cusp-conjunction" : "conjunction-or-opposition",
      });
    };

    getTraditionalPlanets(chart).forEach((planet) => {
      addPartRelation(planet.name, "planet", planet.longitudeRaw, planet.longitudeSpeed, planet.type);
    });

    chart.housesData.house.forEach((cuspLongitude, index) => {
      addPartRelation(`Cúspide ${index + 1}`, "cusp", cuspLongitude);
    });

    ORDERED_ARABIC_PART_KEYS.forEach((otherKey) => {
      if (otherKey === key) return;
      const other = lots[otherKey];
      if (!other) return;
      addPartRelation(other.name, "arabicPart", other.longitude);
    });

    relations.sort((a, b) => a.orb - b.orb);

    const frawleyPublishedAspects: TechnicalLotDossier["frawleyPublishedAspects"] = getTraditionalPlanets(chart).flatMap((planet) => {
      const aspectType = getAspectTypeFromSigns(lot.longitude, planet.longitudeRaw);
      if (!aspectType) return [];
      const orbDistance = aspectType === "conjunction"
        ? getAbsoluteAngularDistance(lot.longitude, planet.longitudeRaw)
        : Math.abs((normalizeLongitude(lot.longitude) % 30) - (normalizeLongitude(planet.longitudeRaw) % 30));
      if (orbDistance > 3) return [];
      const applyingByInstantaneousMotion = resolveTraditionalAspect(
        { longitude: planet.longitudeRaw, speed: planet.longitudeSpeed, elementType: "planet", planetType: planet.type },
        { longitude: lot.longitude, speed: 0, elementType: "house" },
      )?.applying ?? false;
      return [{ planet: planet.name, aspect: aspectType, orb: orbDistance, applyingByInstantaneousMotion, source: "The Real Astrology Applied" as const }];
    }).sort((a, b) => a.orb - b.orb);

    return [{
      key,
      name: lot.name,
      longitude: lot.longitude,
      formula: lot.formulaDescription,
      housePlacement: buildHousePlacement(chart, lot.name, lot.longitude, "point-contact-only"),
      domicileDispositor: dispositor,
      dispositorEssential: essential.find((item) => item.planet === dispositor) ?? null,
      dispositorAccidental: accidental.find((item) => item.planet === dispositor) ?? null,
      antiscion: lot.antiscionRaw,
      relations,
      frawleyPublishedAspects,
    }];
  });

  const frawleyTemperament = buildFrawleyTemperamentDossier(chart, essential, accidental);
  const gugu = buildGuguNatalDossier(chart, essential, accidental);
  const temperaments: AuthorialTemperamentsDossier = {
    marcos: temperament,
    frawley: frawleyTemperament,
    gugu: gugu.temperament,
  };

  const houseDossiers = buildHouseDossiers(
    chart,
    essential,
    accidental,
    lotDossiers,
    receptions.receptions,
    chains,
  );
  const mentalityWithContext = enrichMentalityContext(mentality, lotDossiers, antiscia);
  const outerPlanetModifiers = buildOuterPlanetModifiers(chart);
  const lifeIndicatorsFrawley = buildFrawleyLifeIndicators(chart, essential, accidental);
  const generalFortune = buildGeneralFortuneDossier(chart, essential, accidental, houseDossiers);
  const modes = buildModesDossier(chart, manner, mentalityWithContext);
  const profession = buildProfessionDossier(chart, essential, accidental, houseDossiers);
  const relationships = buildRelationshipDossier(chart, essential, accidental, receptions, houseDossiers, lotDossiers);
  const healthSymbolic = buildHealthSymbolicDossier(chart, temperament, houseDossiers, lotDossiers, outerPlanetModifiers);
  const spiritualOrientation = buildSpiritualOrientationDossier(
    chart,
    essential,
    accidental,
    receptions.receptions,
    houseDossiers,
    lotDossiers,
  );
  const children = buildChildrenDossier(chart, sect, essential, accidental, houseDossiers);
  const wealth = buildWealthDossier(essential, accidental, houseDossiers, lotDossiers);
  const sourceRegistry = buildSourceRegistry();
  const sourceGapRegistry = buildNatalSourceGapRegistry();

  const unresolvedTechnicalQuestions: string[] = [];
  if (!chart.calculationMetadata?.timezone) unresolvedTechnicalQuestions.push("Fuso IANA/histórico não confirmado nos metadados.");
  sourceGapRegistry
    .filter((gap) => gap.blocksRadicalInterpretation && gap.status !== "RESOLVED_IMPLEMENTED")
    .forEach((gap) => unresolvedTechnicalQuestions.push(`[${gap.id}] ${gap.engineBehavior}`));
  // O catálogo exato de estrelas é consultado contra planetas, 12 cúspides e
  // as sete Partes. Ausência de contato com uma Parte é um resultado negativo
  // legítimo, não evidência de que o alvo deixou de ser calculado.

  const derivedHouseTable = buildDerivedHouseTable(chart);
  const planetPackets = buildPlanetTechnicalPackets(
    chart, essential, accidental, chains, receptions.receptions, antiscia,
  );
  const finalDispositors = [...new Set(chains.map((chain) => chain.finalDispositor).filter((item): item is string => Boolean(item)))];
  const dispositorSummary = {
    chains,
    globalFinalDispositor: finalDispositors.length === 1 && chains.every((chain) => chain.finalDispositor === finalDispositors[0])
      ? finalDispositors[0]
      : null,
    cycles: uniqueCycles(chains),
  };

  return {
    schemaVersion: "4.0.0",
    principle: "motor-calcula-ia-interpreta",
    sourceHierarchy: ["Marcos Monteiro", "John Frawley", "Luiz Gonzaga de Carvalho Neto"],
    temperamentCanonicalSource: "Marcos Monteiro",
    sect,
    temperament,
    temperaments,
    gugu,
    lordOfNativity: temperament.lordOfNativity,
    manner,
    mentality: mentalityWithContext,
    dispositors: dispositorSummary,
    planets: planetPackets,
    outerPlanetModifiers,
    cusps: chart.housesData.house.map((longitude, index) => ({ house: index + 1, longitude, almuten: cuspAlmutens[index] })),
    lots: lotDossiers,
    receptions: receptions.receptions,
    mutualReceptions: receptions.mutualReceptions,
    antiscia,
    fixedStarContacts: chart.fixedStarMatches ?? [],
    fixedStarSky: {
      metadata: chart.fixedStarCatalogMetadata ?? null,
      catalogSize: chart.fixedStarCatalog?.length ?? 0,
      aboveHorizon: chart.fixedStarCatalog?.filter((star) => star.aboveHorizon).length ?? 0,
      major15: (chart.fixedStarCatalog ?? []).filter((star) => star.isAstroSeekMajor15).map((star) => ({
        name: star.name, longitude: star.longitude, latitude: star.latitude, rightAscension: star.rightAscension,
        declination: star.declination, magnitude: star.magnitude, houseRegiomontanus: star.houseRegiomontanus, aboveHorizon: star.aboveHorizon,
      })),
      interpretationPolicy: "catalogo-astronomico-nao-e-testemunho; somente fixedStarContacts isRelevant=true entra no julgamento",
      fullCatalogAvailableAtChartRoot: Boolean(chart.fixedStarCatalog?.length),
    },
    houseDossiers,
    lifeIndicatorsFrawley,
    generalFortune,
    modes,
    profession,
    relationships,
    healthSymbolic,
    spiritualOrientation,
    children,
    wealth,
    derivedHouseTable,
    interpretationContract: {
      universalRules: UNIVERSAL_NATAL_JUDGMENT_RULES,
      protocols: NATAL_DOMAIN_CONTRACTS,
      aiOutputRules: AI_NATAL_OUTPUT_RULES,
      coverage: (() => {
        const actualSections = NATAL_DOMAIN_CONTRACTS.map((protocol) => protocol.section);
        const missingSections = EXPECTED_PROTOCOL_SECTIONS.filter((section) => !actualSections.includes(section));
        const duplicateSections = [...new Set(actualSections.filter((section, index) => actualSections.indexOf(section) !== index))];
        return {
          expectedSections: [...EXPECTED_PROTOCOL_SECTIONS],
          actualSections,
          missingSections,
          duplicateSections,
          allCovered: missingSections.length === 0 && duplicateSections.length === 0 && actualSections.length === EXPECTED_PROTOCOL_SECTIONS.length,
        };
      })(),
    },
    sourceRegistry,
    sourceGapRegistry,
    unresolvedTechnicalQuestions,
  };
}

export function calculateNatalAnalysis(chart: BirthChart): NatalAnalysis {
  const sun = getPlanet(chart, "Sol");
  const sect = getSect(sun.longitudeRaw, chart.housesData.ascendant, chart.housesData.house);
  const traditional = getTraditionalPlanets(chart);
  const essentialConditions = traditional.map((planet) => calculateEssentialCondition(planet, sect));
  const accidentalConditions = traditional.map((planet) => calculateAccidentalCondition(chart, planet, sect));
  const temperament = calculateTemperament(chart);
  const lordOfGeniture = rankPlanets(essentialConditions, accidentalConditions, true);
  const chartAlmuten = rankPlanets(essentialConditions, accidentalConditions, false);
  const cuspAlmutens = chart.housesData.house.map((longitude, index) =>
    calculateDegreeAlmuten(`Cúspide ${index + 1}`, longitude, sect),
  );
  const chains = traditional.map((planet) => calculateDispositorChain(chart, planet));
  const finalDispositors = [...new Set(chains.map((chain) => chain.finalDispositor).filter((item): item is string => Boolean(item)))];
  const receptions = calculateReceptions(chart, sect);
  const antiscia = calculateAntiscia(chart);
  const fixedStarMatches = chart.fixedStarMatches ?? [];
  const mentality = calculateMentality(chart, essentialConditions, accidentalConditions, sect);
  const manner = calculateManner(chart, essentialConditions, accidentalConditions);
  const technicalForm = buildTechnicalForm(
    chart, sect, essentialConditions, accidentalConditions, chains, cuspAlmutens, receptions, antiscia,
    temperament, mentality, manner,
  );

  return {
    methodVersion: "4.0.0",
    sect,
    methodology: {
      temperament: "Trilhas paralelas: Marcos atual como canônico do projeto + Frawley published baseline/current public doctrine + Gugu historical layers",
      arabicLots: "Marcos Monteiro, fórmulas fixas da planilha publicada",
      triplicity: "Dois regentes; Água regida por Marte de dia e de noite",
      terms: "Termos de Lilly",
      houseSystem: "Regiomontanus tropical canônico do projeto; Placidus calculado em paralelo",
      outerPlanets: "Qualificadores secundários; não recebem regências, dignidades ou almutens",
      analysisOrder: [
        "temperamento",
        "modos e mentalidade",
        "áreas concretas perguntadas",
        "sete partes árabes fundamentais",
        "revisão por partes",
        "estrelas fixas",
        "revisão final",
      ],
    },
    temperament,
    temperaments: technicalForm.temperaments,
    gugu: technicalForm.gugu,
    essentialConditions,
    accidentalConditions,
    lordOfNativity: temperament.lordOfNativity,
    lordOfGeniture,
    chartAlmuten,
    cuspAlmutens,
    mentality,
    outerPlanetModifiers: technicalForm.outerPlanetModifiers,
    manner,
    houseDossiers: technicalForm.houseDossiers,
    lifeIndicatorsFrawley: technicalForm.lifeIndicatorsFrawley,
    generalFortune: technicalForm.generalFortune,
    modes: technicalForm.modes,
    profession: technicalForm.profession,
    relationships: technicalForm.relationships,
    healthSymbolic: technicalForm.healthSymbolic,
    spiritualOrientation: technicalForm.spiritualOrientation,
    children: technicalForm.children,
    wealth: technicalForm.wealth,
    receptions: receptions.receptions,
    mutualReceptions: receptions.mutualReceptions,
    dispositors: {
      chains,
      globalFinalDispositor: finalDispositors.length === 1 && chains.every((chain) => chain.finalDispositor === finalDispositors[0])
        ? finalDispositors[0]
        : null,
      cycles: uniqueCycles(chains),
    },
    antiscia,
    fixedStars: {
      relevantMatches: fixedStarMatches.filter((match) => match.isRelevant),
      secondaryMatches: fixedStarMatches.filter((match) => !match.isRelevant),
      rule: "Conjunções próximas preservadas como dados; relevância catalogal e orbe não substituem a distância bruta nem a proveniência.",
    },
    technicalForm,
    cautions: [
      "Senhor da Natividade (Marcos), ranking legado de Senhor da Genitura e almútens essenciais são resultados distintos; Frawley atual rejeita o almúten como técnica canônica.",
      "Almuten Figuris medieval não é inferido: nenhuma fórmula específica foi atribuída a Marcos ou Frawley nas fontes auditadas.",
      "Pontuações 5/4/3/2/1 permanecem apenas como ledger histórico/auxiliar; Frawley atual rejeita somar dignidades qualitativamente distintas como se fossem grandezas homogêneas.",
      "Senhor da Natividade: hierarquia essencial domicílio > exaltação > triplicidade > termo > face vem primeiro; empate essencial só é resolvido automaticamente quando há angularidade acidental exclusiva e inequívoca. Aspectos, estrelas e demais condições permanecem evidência qualitativa sem score inventado.",
      "Planetas exteriores não regem signos nem participam das dignidades dos sete planetas tradicionais.",
    ],
  };
}
