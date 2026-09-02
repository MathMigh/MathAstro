import type { NatalAnalysis } from "./natalAnalysis";
import type { NatalProductionValidation } from "./natalProductionValidation";
import type { NatalPrecisionData } from "./natalPrecision";
import {
  auditNatalEvidenceMaterialization,
  type NatalEvidenceMaterializationAudit,
} from "@/traditions/western/natal/natalEvidenceAudit";
import { findNatalAiAuditOnlyKeys, sanitizeNatalAiValue } from "./natalAiSanitizer";

export interface NatalAiStructuredForm {
  schemaVersion: "2.0.0";
  profile: "ai-clean";
  principle: "motor-calcula-ia-interpreta";
  release: {
    releasedForAi: boolean;
    productionValidationStatus: "PASS" | "FAIL";
    errorCodes: string[];
    warningCodes: string[];
  };
  sourceGaps: {
    blockingRadical: Array<{ id: string; author: string; domain: string; status: string; missingEvidence: string[] }>;
    unresolvedNonBlocking: Array<{ id: string; author: string; domain: string; status: string; missingEvidence: string[] }>;
    documentaryBoundaries: Array<{ id: string; author: string; domain: string; status: string; missingEvidence: string[] }>;
    rejectedUnverified: Array<{ id: string; author: string; domain: string; engineBehavior: string }>;
    outsideStaticNatalExecution: Array<{ id: string; author: string; domain: string; engineBehavior: string }>;
  };
  technicalForm: unknown;
  precisionEvidence: {
    schemaVersion: NatalPrecisionData["schemaVersion"];
    julianDayUt: number;
    houses: NatalPrecisionData["houses"];
    placements: NatalPrecisionData["placements"];
    boundaryDynamics: NatalPrecisionData["boundaryDynamics"];
    exactAspectDynamics: NatalPrecisionData["exactAspectDynamics"];
    prenatalSyzygy: NatalPrecisionData["prenatalSyzygy"];
    lunations: NatalPrecisionData["lunations"];
    prenatalLunationNatalLinks: NatalPrecisionData["prenatalLunationNatalLinks"];
    nodes: NatalPrecisionData["nodes"];
    cautions: NatalPrecisionData["cautions"];
  };
  evidenceMaterialization: NatalEvidenceMaterializationAudit;
}

function buildAiSafeTechnicalForm(analysis: NatalAnalysis): unknown {
  // The audit form intentionally stores the entire astronomical star-contact
  // candidate set. The AI form must see only contacts already admitted by the
  // source-locked interpretive gate; otherwise a language model can accidentally
  // promote an astronomical coincidence that the engine explicitly rejected.
  const source = analysis.technicalForm;
  const aiSafe = {
    ...source,
    fixedStarContacts: source.fixedStarContacts.filter((match) => match.isRelevant),
    fixedStarSky: {
      ...source.fixedStarSky,
      // Astro-Seek-style major lists are useful in the visual/audit sky, but are
      // not independent testimonies. The AI receives their existence/policy and
      // the actual source-locked contacts instead of a tempting display list.
      major15: [],
    },
  };
  return sanitizeNatalAiValue(aiSafe);
}

export function buildNatalAiStructuredForm(
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
  validation: NatalProductionValidation,
): NatalAiStructuredForm {
  const evidenceMaterialization = auditNatalEvidenceMaterialization(analysis, precision, true);
  const gaps = analysis.technicalForm.sourceGapRegistry;
  const compactGap = (gap: (typeof gaps)[number]) => ({
    id: gap.id, author: gap.author, domain: gap.domain, status: gap.status, missingEvidence: gap.missingEvidence,
  });
  return {
    schemaVersion: "2.0.0",
    profile: "ai-clean",
    principle: "motor-calcula-ia-interpreta",
    release: {
      releasedForAi: validation.status === "PASS",
      productionValidationStatus: validation.status,
      errorCodes: validation.errors.map((item) => item.code),
      warningCodes: validation.warnings.map((item) => item.code),
    },
    sourceGaps: {
      blockingRadical: gaps.filter((gap) => gap.blocksRadicalInterpretation && gap.status !== "RESOLVED_IMPLEMENTED").map(compactGap),
      unresolvedNonBlocking: gaps.filter((gap) => !gap.blocksRadicalInterpretation && (gap.status === "SOURCE_LOCKED_UNRESOLVED" || gap.status === "PARTIAL_RAW_EVIDENCE_ONLY")).map(compactGap),
      documentaryBoundaries: gaps.filter((gap) => gap.status === "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED" || gap.status === "CURRENT_METHOD_NOT_PUBLIC").map(compactGap),
      rejectedUnverified: gaps.filter((gap) => gap.status === "REJECTED_UNVERIFIED").map((gap) => ({ id: gap.id, author: gap.author, domain: gap.domain, engineBehavior: gap.engineBehavior })),
      outsideStaticNatalExecution: gaps.filter((gap) => gap.status === "OUTSIDE_STATIC_NATAL_EXECUTION").map((gap) => ({ id: gap.id, author: gap.author, domain: gap.domain, engineBehavior: gap.engineBehavior })),
    },
    technicalForm: buildAiSafeTechnicalForm(analysis),
    precisionEvidence: {
      schemaVersion: precision.schemaVersion,
      julianDayUt: precision.julianDayUt,
      houses: precision.houses,
      placements: precision.placements,
      boundaryDynamics: precision.boundaryDynamics,
      exactAspectDynamics: precision.exactAspectDynamics,
      prenatalSyzygy: precision.prenatalSyzygy,
      lunations: precision.lunations,
      prenatalLunationNatalLinks: precision.prenatalLunationNatalLinks,
      nodes: precision.nodes,
      cautions: precision.cautions,
    },
    evidenceMaterialization,
  };
}

export function findAiUnsafeStarContacts(value: unknown): string[] {
  if (!value || typeof value !== "object") return ["technicalForm ausente"];
  const root = value as Record<string, unknown>;
  const contacts = root.fixedStarContacts;
  if (!Array.isArray(contacts)) return ["fixedStarContacts ausente/não-array"];
  return contacts.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [`fixedStarContacts[${index}] inválido`];
    const match = item as Record<string, unknown>;
    return match.isRelevant === true ? [] : [`fixedStarContacts[${index}] ${String(match.starName ?? "?")}`];
  });
}

export function containsAuditOnlyNumericKeys(value: unknown): string[] {
  return findNatalAiAuditOnlyKeys(value);
}
