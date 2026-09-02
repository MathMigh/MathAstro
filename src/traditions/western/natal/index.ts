/**
 * Public boundary for Western / Natal.
 *
 * Rule: other techniques (synastry, electional, profections, returns, etc.) may
 * consume the shared astronomical core, but must not be imported by this
 * boundary. This keeps natal calculation deterministic and independently
 * testable.
 */
export { calculateNatalAnalysis } from "@/app/lib/natalAnalysis";
export { calculateNatalPrecision } from "@/app/lib/natalPrecision";
export { generateNatalTechnicalReport } from "@/app/lib/natalTechnicalReport";
export type { NatalAnalysis, NatalTechnicalForm } from "@/app/lib/natalAnalysis";
export type { NatalPrecisionData } from "@/app/lib/natalPrecision";

export {
  AI_NATAL_OUTPUT_RULES,
  EXPECTED_PROTOCOL_SECTIONS,
  NATAL_DOMAIN_CONTRACTS,
  UNIVERSAL_NATAL_JUDGMENT_RULES,
} from "./natalMethodContract";
export type { NatalDomainContract } from "./natalMethodContract";

export {
  ABSOLUTE_NATAL_PROMPT,
  buildNatalAbsoluteJudgmentPackage,
  buildNatalAbsoluteLlmMessages,
  buildNatalAuthorialEvidenceGraph,
  buildNatalJudgmentContext,
  buildAuthorialJudgmentZones,
  routeNatalQuestion,
} from "@/app/lib/natalJudgmentEngine";
export type {
  NatalAbsoluteJudgmentPackage,
  NatalAbsoluteLlmMessages,
  NatalAuthorialEvidenceGraph,
  NatalJudgmentContext,
  NatalQuestionRoute,
} from "@/app/lib/natalJudgmentEngine";

export {
  NATAL_AI_PROMPT_ID,
  NATAL_AI_PROMPT_LANGUAGE,
  NATAL_AI_PROMPT_VERSION,
  buildNatalAiIntegrationEnvelope,
  buildNatalAiProviderInvocation,
  executeNatalAiWithProvider,
} from "@/app/lib/natalAiIntegration";
export type {
  NatalAiIntegrationEnvelope,
  NatalAiIntegrationStatus,
  NatalAiProviderAdapter,
  NatalAiProviderInvocation,
  NatalAiProviderResult,
} from "@/app/lib/natalAiIntegration";
