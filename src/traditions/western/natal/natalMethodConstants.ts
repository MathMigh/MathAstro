/**
 * Source-locked numerical boundaries for the isolated Western Natal engine.
 * Keep unlike rules separate: a cusp boundary is not an aspect orb.
 */
export const MARCOS_NATAL_CORE_INFLUENCE_MAX_ORB = 3;
export const MARCOS_NATAL_CONTEXTUAL_INFLUENCE_MAX_ORB = 5;
/** Backward-compatible alias: generic Marcos natal relevance extends contextually to 5°. */
export const MARCOS_NATAL_INFLUENCE_MAX_ORB = MARCOS_NATAL_CONTEXTUAL_INFLUENCE_MAX_ORB;

export type MarcosNatalInfluenceTier = "CORE_0_3" | "CONTEXTUAL_3_5" | "OUTSIDE_GENERIC_5";

export function classifyMarcosNatalInfluenceOrb(orb: number): MarcosNatalInfluenceTier {
  if (orb <= MARCOS_NATAL_CORE_INFLUENCE_MAX_ORB + 1e-9) return "CORE_0_3";
  if (orb <= MARCOS_NATAL_CONTEXTUAL_INFLUENCE_MAX_ORB + 1e-9) return "CONTEXTUAL_3_5";
  return "OUTSIDE_GENERIC_5";
}
export const MARCOS_CUSP_BASE_MAX_DEGREES = 5;
export const MARCOS_FIXED_STAR_COMMON_MAX_ORB = 1;
export const MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB = 3;

export const MARCOS_PRINCIPAL_FIXED_STAR_NAMES = [
  "Regulus",
  "Aldebaran",
  "Antares",
  "Fomalhaut",
  "Sirius",
  "Procyon",
  "Castor",
  "Pollux",
  "Spica",
  "Algol",
] as const;
