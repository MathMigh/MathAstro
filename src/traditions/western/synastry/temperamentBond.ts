export type SynastryTemperamentBondStatus =
  | "integracao-preferencial"
  | "similaridade-forte"
  | "oposicao-polar"
  | "indeterminado";

/**
 * Frawley v4 correction:
 * - one shared quality + one different quality = preferred integration band;
 * - two shared qualities = strong similarity with duplication risk;
 * - two opposite qualities = polar opposition with incomprehension risk.
 */
export function classifySynastryTemperamentBond(
  similarCount: number,
  complementaryCount: number,
  anyIndeterminate: boolean,
): SynastryTemperamentBondStatus {
  if (anyIndeterminate) return "indeterminado";
  if (similarCount === 1 && complementaryCount === 1) return "integracao-preferencial";
  if (similarCount === 2) return "similaridade-forte";
  if (complementaryCount === 2) return "oposicao-polar";
  return "indeterminado";
}
