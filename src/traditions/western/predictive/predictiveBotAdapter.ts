import type { PredictiveEngineResult } from "./predictiveTypes";

export interface PredictiveBotPayload {
  schema: "mathastro.predictive.bot-payload/1.0";
  botReady: true;
  systemPrompt: string;
  userMessage: string;
  judgmentContract: PredictiveEngineResult["aiJudgmentContract"];
  mechanicalDossier: Omit<PredictiveEngineResult, "analysisReport" | "aiPrompt" | "aiJudgmentContract">;
  humanTechnicalReport: string;
  release: {
    interpretationAllowed: boolean;
    validationStatus: PredictiveEngineResult["validation"]["status"];
    blockingErrors: string[];
    warnings: string[];
  };
  executionRules: {
    requireJsonOutput: true;
    forbidAstrologicalRecalculation: true;
    preserveSourceGaps: true;
    preserveAuthorSeparation: true;
    requireValidationPass: true;
  };
}

export function buildPredictiveBotPayload(result: PredictiveEngineResult, overrideUserMessage?: string): PredictiveBotPayload {
  const { analysisReport, aiPrompt, aiJudgmentContract, ...mechanicalDossier } = result;
  const consultation = result.input.consultation;
  const question = overrideUserMessage?.trim() || consultation?.question?.trim() || "Interprete o dossiê preditivo completo segundo o contrato, sem recalcular astrologia.";
  const context = consultation?.context?.trim();
  const userMessage = context ? `${question}\n\nContexto factual fornecido pelo consulente:\n${context}` : question;
  return {
    schema: "mathastro.predictive.bot-payload/1.0",
    botReady: true,
    systemPrompt: aiPrompt.text,
    userMessage,
    judgmentContract: aiJudgmentContract,
    mechanicalDossier,
    humanTechnicalReport: analysisReport,
    release: {
      interpretationAllowed: result.validation.status === "PASS",
      validationStatus: result.validation.status,
      blockingErrors: result.validation.errors,
      warnings: result.validation.warnings,
    },
    executionRules: {
      requireJsonOutput: true,
      forbidAstrologicalRecalculation: true,
      preserveSourceGaps: true,
      preserveAuthorSeparation: true,
      requireValidationPass: true,
    },
  };
}
