import type { NatalAiStructuredForm } from "@/app/lib/natalAiForm";
import type { NatalProductionValidation } from "@/app/lib/natalProductionValidation";
import { AI_NATAL_OUTPUT_RULES, NATAL_DOMAIN_CONTRACTS, UNIVERSAL_NATAL_JUDGMENT_RULES } from "@/traditions/western/natal/natalMethodContract";
import type { PredictiveEngineResult } from "@/traditions/western/predictive";
import { buildPredictiveBotPayload } from "@/traditions/western/predictive";
import {
  MASTER_CONSULTATION_PROMPT_ID,
  MASTER_CONSULTATION_PROMPT_PTBR,
  MASTER_CONSULTATION_PROMPT_VERSION,
} from "./consultationMasterPrompt";

export interface MasterConsultationPayload {
  schema: "mathastro.western.master-consultation/1.0";
  prompt: {
    id: typeof MASTER_CONSULTATION_PROMPT_ID;
    version: typeof MASTER_CONSULTATION_PROMPT_VERSION;
    language: "pt-BR";
    text: string;
  };
  userMessage: string;
  mode: "natal-integral" | "natal-focal" | "natal-plus-predictive";
  teachingPackage: {
    universalNatalRules: typeof UNIVERSAL_NATAL_JUDGMENT_RULES;
    natalDomainContracts: typeof NATAL_DOMAIN_CONTRACTS;
    natalOutputRules: typeof AI_NATAL_OUTPUT_RULES;
    mandatoryCoreSequence: string[];
    powersOfSoul: Array<{ planet: string; faculty: string }>;
  };
  natal: {
    structuredForm: NatalAiStructuredForm;
    validation: NatalProductionValidation;
  };
  predictive?: ReturnType<typeof buildPredictiveBotPayload>;
  release: {
    interpretationAllowed: boolean;
    natalReleasedForAi: boolean;
    predictiveReleasedForAi: boolean | null;
    blockingErrors: string[];
  };
  executionRules: {
    requireNatalBeforePrediction: true;
    forbidAstrologicalRecalculation: true;
    forbidSilentAuthorBlending: true;
    requireContradictionSearch: true;
    requireEvidenceTrace: true;
    requireExplicitUncertainty: true;
  };
}

const mandatoryCoreSequence = [
  "secta/Ascendente e estrutura geral",
  "temperamento Marcos/Frawley/Gugu separados",
  "Senhor da Natividade Marcos",
  "Manner Frawley",
  "mentalidade Marcos/Frawley/Gugu",
  "Motivação Primária Gugu",
  "potências/faculdades da alma Gugu",
  "constituição e presença",
  "capacidades/profissão",
  "domínios natais pertinentes",
  "contradições e limites",
  "síntese humana",
];

const powersOfSoul = [
  { planet: "Lua", faculty: "sentido comum / fantasia / recepção integrada da experiência" },
  { planet: "Mercúrio", faculty: "estimativa / discriminação" },
  { planet: "Vênus", faculty: "apetite concupiscível" },
  { planet: "Sol", faculty: "vontade" },
  { planet: "Marte", faculty: "apetite irascível" },
  { planet: "Júpiter", faculty: "intelecto paciente" },
  { planet: "Saturno", faculty: "intelecto agente" },
];

export function buildMasterConsultationPayload(args: {
  natalStructuredForm: NatalAiStructuredForm;
  natalValidation: NatalProductionValidation;
  question?: string;
  context?: string;
  fullNatalRequested?: boolean;
  predictiveResult?: PredictiveEngineResult;
}): MasterConsultationPayload {
  const question = args.question?.trim();
  const context = args.context?.trim();
  const predictive = args.predictiveResult ? buildPredictiveBotPayload(args.predictiveResult) : undefined;
  const mode: MasterConsultationPayload["mode"] = predictive
    ? "natal-plus-predictive"
    : args.fullNatalRequested || !question
      ? "natal-integral"
      : "natal-focal";
  const defaultInstruction = mode === "natal-integral"
    ? "Faça uma consulta natal integral seguindo todo o currículo obrigatório do Prompt Mestre."
    : mode === "natal-plus-predictive"
      ? "Julgue a questão partindo da natividade integral pertinente e continue pela cadeia preditiva completa."
      : "Julgue a pergunta focal sem perder o retrato radical necessário do nativo.";
  const userMessage = [question || defaultInstruction, context ? `Contexto factual do consulente:\n${context}` : ""].filter(Boolean).join("\n\n");

  const natalReleasedForAi = args.natalValidation.status === "PASS" && args.natalStructuredForm.release.releasedForAi;
  const predictiveReleasedForAi = predictive ? predictive.release.interpretationAllowed : null;
  const predictiveErrors = predictive?.release.blockingErrors ?? [];
  const blockingErrors = [
    ...args.natalValidation.errors.map((item) => `${item.code}: ${item.message}`),
    ...predictiveErrors,
  ];
  const interpretationAllowed = natalReleasedForAi && (predictiveReleasedForAi ?? true) && blockingErrors.length === 0;

  return {
    schema: "mathastro.western.master-consultation/1.0",
    prompt: {
      id: MASTER_CONSULTATION_PROMPT_ID,
      version: MASTER_CONSULTATION_PROMPT_VERSION,
      language: "pt-BR",
      text: MASTER_CONSULTATION_PROMPT_PTBR,
    },
    userMessage,
    mode,
    teachingPackage: {
      universalNatalRules: UNIVERSAL_NATAL_JUDGMENT_RULES,
      natalDomainContracts: NATAL_DOMAIN_CONTRACTS,
      natalOutputRules: AI_NATAL_OUTPUT_RULES,
      mandatoryCoreSequence,
      powersOfSoul,
    },
    natal: {
      structuredForm: args.natalStructuredForm,
      validation: args.natalValidation,
    },
    ...(predictive ? { predictive } : {}),
    release: {
      interpretationAllowed,
      natalReleasedForAi,
      predictiveReleasedForAi,
      blockingErrors,
    },
    executionRules: {
      requireNatalBeforePrediction: true,
      forbidAstrologicalRecalculation: true,
      forbidSilentAuthorBlending: true,
      requireContradictionSearch: true,
      requireEvidenceTrace: true,
      requireExplicitUncertainty: true,
    },
  };
}
