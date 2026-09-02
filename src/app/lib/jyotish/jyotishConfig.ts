import type { JyotishConfig } from "./types";

export const DEFAULT_JYOTISH_CONFIG: JyotishConfig = {
  ayanamsha: "lahiri",
  kpEnabled: true,
  kpAyanamsha: "krishnamurti",
  kpHouseSystem: "placidus",
  kpRulingPlanetMode: "extended-7",
  siderealZodiac: "nirayana",
  houseSystem: "whole-sign",
  localityMode: "city-search",
  timezoneMode: "city-derived",
  sunriseMethod: "standard-disc",
  moonMethod: "swisseph-derived",
  includeNodes: true,
  nodeAspectMode: "5-7-9",
  bhavaChalitSystem: "sripati",
  primaryDasha: "vimshottari",
  secondaryDasha: "yogini",
  kalachakraCycleMode: "progressive-group",
  enabledVargas: [
    "D1",
    "D2",
    "D3",
    "D4",
    "D7",
    "D9",
    "D10",
    "D12",
    "D16",
    "D20",
    "D24",
    "D27",
    "D30",
    "D40",
    "D45",
    "D60",
  ],
  friendshipRules: "parasari-classic",
  dignityRules: "parasari-classic",
  badhakaRules: "parasari",
  marakaRules: "parasari",
  mrityuBhagaRules: "sarvartha-chintamani",
  ashtaKootaMode: "classical-36",
  kujaDoshaRules: "south-indian-mixed",
  yogaCancellationRules: "classical-mixed",
  jaiminiRules: "classical-7-chara-karaka",
  showAdvanced: false,
};

export const HOUSE_SYSTEM_OPTIONS = [
  { value: "whole-sign", label: "Whole Sign" },
  { value: "sripati", label: "Sripati" },
  { value: "equal", label: "Equal" },
] as const;

export const KP_RULING_PLANET_OPTIONS = [
  { value: "classical-5", label: "Classico 5 fatores" },
  { value: "extended-7", label: "Expandido 7 fatores" },
] as const;

export const NODE_ASPECT_OPTIONS = [
  { value: "none", label: "Sem drishti dos nodos" },
  { value: "5-7-9", label: "Drishti 5, 7 e 9" },
  { value: "full-7", label: "Apenas 7a" },
] as const;

export const SECONDARY_DASHA_OPTIONS = [
  { value: "yogini", label: "Yogini" },
  { value: "ashtottari", label: "Ashtottari" },
  { value: "shodashottari", label: "Shodashottari" },
  { value: "dwadashottari", label: "Dwadashottari" },
  { value: "kalachakra", label: "Kalachakra" },
  { value: "chara", label: "Chara" },
  { value: "narayana", label: "Narayana" },
  { value: "sthira", label: "Sthira" },
] as const;

export const KALACHAKRA_CYCLE_MODE_OPTIONS = [
  { value: "progressive-group", label: "Progressivo por grupo" },
  { value: "cyclic-pada", label: "Ciclico no mesmo pada" },
  { value: "same-nakshatra-reset", label: "Reset no mesmo nakshatra" },
] as const;

export const ASHTA_KOOTA_OPTIONS = [
  { value: "classical-36", label: "Classico 36 pontos" },
  { value: "southern-adjusted", label: "Sul-indiano ajustado" },
] as const;

export const MRITYU_BHAGA_OPTIONS = [
  { value: "sarvartha-chintamani", label: "Sarvartha Chintamani" },
  { value: "phala-deepika", label: "Phala Deepika" },
] as const;

export const KUJA_DOSHA_OPTIONS = [
  { value: "south-indian-mixed", label: "Sul-indiano misto" },
  { value: "classical-strict", label: "Classico estrito" },
  { value: "relaxed-modern", label: "Relaxado moderno" },
] as const;
