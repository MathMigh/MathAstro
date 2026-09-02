import {
  buildNatalAbsoluteLlmMessages,
  type NatalAbsoluteJudgmentPackage,
  type NatalAbsoluteLlmMessages,
} from "./natalJudgmentEngine";

export const NATAL_AI_PROMPT_ID = "mathastro-natal-absolute-ptbr" as const;
export const NATAL_AI_PROMPT_VERSION = "2.0.0" as const;
export const NATAL_AI_PROMPT_LANGUAGE = "pt-BR" as const;

export type NatalAiIntegrationStatus =
  | "READY_FOR_PROVIDER"
  | "AWAITING_QUESTION"
  | "BLOCKED_BY_ENGINE_VALIDATION";

export interface NatalAiProviderInvocation {
  schemaVersion: "1.0.0";
  purpose: "NATAL_JUDGMENT";
  prompt: {
    id: typeof NATAL_AI_PROMPT_ID;
    version: typeof NATAL_AI_PROMPT_VERSION;
    language: typeof NATAL_AI_PROMPT_LANGUAGE;
  };
  messages: NatalAbsoluteLlmMessages;
  responseContract: {
    language: "pt-BR";
    format: "text-or-markdown";
    requiredBlocks: ["DADOS_CALCULADOS", "TESTEMUNHOS", "SINTESE", "INCERTEZAS_E_CONFLITOS", "CONTEXTO_NECESSARIO"];
    chainOfThoughtForbidden: true;
    astrologyRecalculationForbidden: true;
    sourceProvenanceRequired: true;
    singleSymbolConclusionForbidden: true;
  };
  executionPolicy: {
    serverSideOnlyForSecrets: true;
    immutableEngineEvidence: true;
    providerMustNotMutatePackage: true;
    rejectWhenEngineValidationFails: true;
    rejectWithoutConcreteQuestion: true;
  };
}

export interface NatalAiIntegrationEnvelope {
  schemaVersion: "1.0.0";
  integration: "NATAL_AI_PROVIDER_ADAPTER";
  status: NatalAiIntegrationStatus;
  readyForProvider: boolean;
  reason: string;
  providerContract: {
    interfaceName: "NatalAiProviderAdapter";
    requiredMethod: "judge";
    input: "NatalAiProviderInvocation";
    output: "NatalAiProviderResult";
    secrets: "SERVER_SIDE_ONLY";
    vendorNeutral: true;
  };
  invocation: NatalAiProviderInvocation;
}

export interface NatalAiProviderResult {
  text: string;
  providerId: string;
  model?: string;
  requestId?: string;
  rawMetadata?: Record<string, unknown>;
}

/**
 * Único ponto que uma IA externa precisa implementar.
 * O motor natal, o roteamento, o prompt e o pacote de evidências não devem ser
 * reimplementados dentro do adapter.
 */
export interface NatalAiProviderAdapter {
  readonly id: string;
  judge(invocation: NatalAiProviderInvocation): Promise<NatalAiProviderResult>;
}

function integrationStatus(packageData: NatalAbsoluteJudgmentPackage): Pick<NatalAiIntegrationEnvelope, "status" | "readyForProvider" | "reason"> {
  if (!packageData.release.releasedForAi || packageData.release.productionValidationStatus !== "PASS") {
    return {
      status: "BLOCKED_BY_ENGINE_VALIDATION",
      readyForProvider: false,
      reason: "O motor não liberou o pacote para IA. Corrija os erros de validação antes de invocar qualquer provedor.",
    };
  }
  if (packageData.natalJudgmentContext.questionRoute.status === "AWAITING_QUESTION") {
    return {
      status: "AWAITING_QUESTION",
      readyForProvider: false,
      reason: "O mapa está calculado, mas falta uma pergunta/contexto concreto. O protocolo não autoriza uma narrativa natal total automática sem contexto.",
    };
  }
  return {
    status: "READY_FOR_PROVIDER",
    readyForProvider: true,
    reason: "Pacote validado e roteado. Pode ser enviado, no servidor, a qualquer adapter que implemente NatalAiProviderAdapter.",
  };
}

export function buildNatalAiProviderInvocation(packageData: NatalAbsoluteJudgmentPackage): NatalAiProviderInvocation {
  return {
    schemaVersion: "1.0.0",
    purpose: "NATAL_JUDGMENT",
    prompt: {
      id: NATAL_AI_PROMPT_ID,
      version: NATAL_AI_PROMPT_VERSION,
      language: NATAL_AI_PROMPT_LANGUAGE,
    },
    messages: buildNatalAbsoluteLlmMessages(packageData),
    responseContract: {
      language: "pt-BR",
      format: "text-or-markdown",
      requiredBlocks: ["DADOS_CALCULADOS", "TESTEMUNHOS", "SINTESE", "INCERTEZAS_E_CONFLITOS", "CONTEXTO_NECESSARIO"],
      chainOfThoughtForbidden: true,
      astrologyRecalculationForbidden: true,
      sourceProvenanceRequired: true,
      singleSymbolConclusionForbidden: true,
    },
    executionPolicy: {
      serverSideOnlyForSecrets: true,
      immutableEngineEvidence: true,
      providerMustNotMutatePackage: true,
      rejectWhenEngineValidationFails: true,
      rejectWithoutConcreteQuestion: true,
    },
  };
}

export function buildNatalAiIntegrationEnvelope(packageData: NatalAbsoluteJudgmentPackage): NatalAiIntegrationEnvelope {
  const status = integrationStatus(packageData);
  return {
    schemaVersion: "1.0.0",
    integration: "NATAL_AI_PROVIDER_ADAPTER",
    ...status,
    providerContract: {
      interfaceName: "NatalAiProviderAdapter",
      requiredMethod: "judge",
      input: "NatalAiProviderInvocation",
      output: "NatalAiProviderResult",
      secrets: "SERVER_SIDE_ONLY",
      vendorNeutral: true,
    },
    invocation: buildNatalAiProviderInvocation(packageData),
  };
}

export async function executeNatalAiWithProvider(
  packageData: NatalAbsoluteJudgmentPackage,
  provider: NatalAiProviderAdapter,
): Promise<NatalAiProviderResult> {
  const envelope = buildNatalAiIntegrationEnvelope(packageData);
  if (!envelope.readyForProvider) {
    throw new Error(`NATAL_AI_NOT_READY:${envelope.status}:${envelope.reason}`);
  }
  const result = await provider.judge(envelope.invocation);
  if (!result || typeof result.text !== "string" || !result.text.trim()) {
    throw new Error("NATAL_AI_PROVIDER_INVALID_RESPONSE: o adapter não retornou texto interpretativo válido.");
  }
  return result;
}
