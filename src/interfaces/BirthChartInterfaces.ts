import { ChartElement } from "./AstroChartInterfaces";

export type PlanetType =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "northNode"
  | "southNode";

export type ReturnChartType = "solar" | "lunar";
export type ChartType = "birth" | "return" | "sinastry" | "progression" | "lunarDerived" | "profection" | "horary";
export type ArabicPartType = "birth" | "arch" | "solarReturn" | "sinastry";

export const planetTypes: PlanetType[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "northNode",
  "southNode",
];

export interface BirthDate {
  day: number;
  month: number;
  year: number;
  time: string;
  coordinates: SelectedCity;
  /** Used by Jyotish/Chinese compatibility workflows; ignored by the Western natal engine. */
  gender?: "male" | "female";
}

export interface BirthChartProfile {
  name?: string;
  id?: string;
  birthDate?: BirthDate;
}

export interface PlanetWithSign {
  position: string;
  antiscion: string;
}

export interface BirthChart {
  planets: Planet[];
  planetsWithSigns?: PlanetWithSign[];
  housesData: HousesData;
  birthDate: BirthDate;
  fixedStars: FixedStar[];
  /** Full fixed-star sky calculated for the birth instant. */
  fixedStarCatalog?: FixedStarPosition[];
  /** Traditional/interpretive contacts derived from the full sky. */
  fixedStarMatches?: FixedStarMatch[];
  fixedStarCatalogMetadata?: FixedStarCatalogMetadata;
  traditionalReport?: string;
  calculationMetadata?: ChartCalculationMetadata;

  // If it is a return chart, these props will be needed
  returnType?: ReturnChartType;
  targetDate?: BirthDate;
  returnTime?: string;
  timezone?: string;
}

export interface Planet {
  name: string;
  type: PlanetType;
  id: number;
  longitude: number;
  longitudeRaw: number;
  longitudeSpeed: number;
  latitudeRaw?: number;
  latitudeSpeed?: number;
  distanceRaw?: number;
  rightAscension?: number;
  declination?: number;
  rightAscensionSpeed?: number;
  declinationSpeed?: number;
  sign: string;
  antiscion: number;
  antiscionRaw: number;
  isRetrograde: boolean;
}

export interface HouseSystemSnapshot {
  system: "Regiomontanus" | "Placidus";
  code: "R" | "P";
  cusps: number[];
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  kochCoAscendant: number;
  munkaseyCoAscendant: number;
  munkaseyPolarAscendant: number;
}

export interface HousesData {
  house: number[];
  housesWithSigns: string[] | undefined;
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  kochCoAscendant: number;
  munkaseyCoAscendant: number;
  munkaseyPolarAscendant: number;
  houseSystem?: "Regiomontanus";
  houseSystemCode?: "R";
  variants?: {
    regiomontanus: HouseSystemSnapshot;
    placidus: HouseSystemSnapshot;
  };
}

export interface ChartCalculationMetadata {
  engine: "Swiss Ephemeris";
  enginePackage: "@swisseph/browser";
  enginePackageVersion: "1.1.1";
  julianDayUt: number;
  utcIso: string;
  timezone: string;
  zodiac: "Tropical";
  houseSystem: "Regiomontanus";
  houseSystemCode: "R";
  availableHouseSystems?: Array<"Regiomontanus" | "Placidus">;
  nodeMode: "Nodo verdadeiro";
  auxiliaryNodes?: {
    trueNorthLongitude: number;
    trueSouthLongitude: number;
    meanNorthLongitude: number;
    meanSouthLongitude: number;
  };
  calendar?: "Gregoriano";
  ephemerisFlags?: string[];
  coordinatePrecision: "endereco" | "rua" | "cidade" | "municipio" | "informada";
  timezoneSource?: "user" | "geocoder";
  locationSource?: "Nominatim/OpenStreetMap" | "manual" | "legacy";
  locationPrecision?: SelectedCity["precision"];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SelectedCity {
  name?: string;
  displayName?: string;
  locality?: string;
  municipality?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  /** IANA timezone (ex.: America/Sao_Paulo). Preferido quando disponível. */
  timezone?: string;
  timezoneSource?: "user" | "geocoder";
  source?: "Nominatim/OpenStreetMap" | "manual" | "legacy";
  sourceId?: string;
  precision?: "exactAddress" | "street" | "locality" | "municipality" | "coordinates";
}

export interface PlanetOverlap {
  thresholdDeg: number;
  baseSymbolOffset: number;
  overlapGap: number;
  planetOrder: number;
}

export interface FixedStar extends ChartElement {
  longitudeSign: string;
  latitude: number;
  magnitude: number;
  nature?: string;
  note?: string;
  isRelevant: boolean;
}

export type FixedStarObjectClass =
  | "star"
  | "stellar-system"
  | "traditional-cluster-nebula"
  | "deep-sky"
  | "unknown";

export type FixedStarInterpretiveTier =
  | "principal-source-locked"
  | "traditional-secondary"
  | "astronomical-only"
  | "excluded-nonstellar";

export interface FixedStarPosition {
  key: string;
  name: string;
  /** Traditional catalogue label before alias sanitation. */
  traditionalName?: string;
  nomenclature: string;
  constellationCode?: string;
  magnitude?: number;
  longitude: number;
  longitudeSign: string;
  latitude: number;
  rightAscension: number;
  declination: number;
  houseRegiomontanus?: number;
  housePlacidus?: number;
  altitude?: number;
  azimuth?: number;
  aboveHorizon?: boolean;
  isAstroSeekMajor15?: boolean;
  isMarcosPrincipal?: boolean;
  /** True only for the physical object that owns a duplicated traditional label. */
  traditionalNameCanonical?: boolean;
  objectClass?: FixedStarObjectClass;
  traditionalMetadataAvailable?: boolean;
  nature?: string;
  note?: string;
  calculationMode: "swiss-exact" | "catalog-precession";
}

export interface FixedStarCatalogMetadata {
  source: "Swiss Ephemeris sefstars.txt";
  rawRecords: number;
  uniqueEntries: number;
  calculatedEntries: number;
  failedEntries: number;
  aboveHorizonEntries?: number;
  calculationMode: "swiss-exact" | "catalog-precession" | "hybrid" | "failed";
  astroSeekReferenceMode: "15-major-plus-full-catalog";
  notes: string[];
}

export interface FixedStarMatch {
  key: string;
  pointName: string;
  pointPlanetType?: PlanetType;
  pointElementType: "planet" | "house" | "arabicPart";
  pointLongitude: number;
  starName: string;
  starNomenclature?: string;
  starLongitude: number;
  starLatitude?: number;
  starLongitudeLabel: string;
  orb: number;
  maxOrb?: number;
  sameSign?: boolean;
  calculationMode?: "swiss-exact" | "catalog-precession" | "legacy-j2000-linear-precession";
  isDominantInCluster?: boolean;
  orbLabel: string;
  nature?: string;
  note?: string;
  magnitude?: number;
  descriptor: string;
  /** Source-locked interpretive eligibility; astronomical contacts may be preserved with false. */
  isRelevant: boolean;
  interpretiveTier?: FixedStarInterpretiveTier;
  interpretiveSources?: string[];
  interpretiveReason?: string;
  objectClass?: FixedStarObjectClass;
  traditionalNameCanonical?: boolean;
}

export interface ChatDateProps {
  chartType: ChartType;
  label?: string;
  birthChart?: BirthChart;
}
