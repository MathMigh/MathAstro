/** Public boundary for Western / Synastry. */
export { calculateSynastryAnalysis } from "./synastryEngine";
export { generateSynastryTechnicalReport } from "./synastryReport";
export { buildSynastryAIEvaluationPacket } from "./synastryAIPacket";
export type { SynastryAIEvaluationPacket } from "./synastryAIPacket";
export {
  SYNASTRY_AUTHORITY,
  SYNASTRY_INTERACTION_PRESETS,
  SYNASTRY_JUDGMENT_ORDER,
  SYNASTRY_PROHIBITIONS,
  SYNASTRY_SCOPE,
  SYNASTRY_SOURCE_REGISTRY,
} from "./synastryMethodContract";
export type * from "./types";
