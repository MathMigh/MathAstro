import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import { calculateNatalAnalysis } from "@/app/lib/natalAnalysis";
import { calculateNatalPrecision } from "@/app/lib/natalPrecision";
import { generateNatalTechnicalReport } from "@/app/lib/natalTechnicalReport";
import { buildNatalAiStructuredForm, containsAuditOnlyNumericKeys, findAiUnsafeStarContacts } from "@/app/lib/natalAiForm";
import { validateNatalProductionOutput } from "@/app/lib/natalProductionValidation";
import { calculatePredictiveEngine, type PredictiveInput } from "@/traditions/western/predictive";
import { buildMasterConsultationPayload } from "@/traditions/western/consultation";

function validateBirthDate(date: any, label: string) {
  if (!date) throw new Error(`${label} é obrigatório.`);
  const latitude = Number(date?.coordinates?.latitude);
  const longitude = Number(date?.coordinates?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error(`${label}: coordenadas válidas são obrigatórias.`);
  if (typeof date?.coordinates?.timezone !== "string" || !date.coordinates.timezone.trim()) throw new Error(`${label}: timezone IANA explícito é obrigatório.`);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    validateBirthDate(body?.birthDate, "birthDate");

    const chartData = await calculateBirthChart(body.birthDate);
    const natalAnalysis = calculateNatalAnalysis(chartData);
    const natalPrecision = await calculateNatalPrecision(chartData);
    const aiReportBase = generateNatalTechnicalReport(chartData, natalAnalysis, natalPrecision, { profile: "ai-clean" });
    let natalValidation = validateNatalProductionOutput(chartData, natalAnalysis, natalPrecision, aiReportBase);
    let natalStructuredForm = buildNatalAiStructuredForm(natalAnalysis, natalPrecision, natalValidation);

    const aiFormLeaks = containsAuditOnlyNumericKeys(natalStructuredForm.technicalForm);
    const aiUnsafeStars = findAiUnsafeStarContacts(natalStructuredForm.technicalForm);
    const evidenceAudit = natalStructuredForm.evidenceMaterialization;
    const extractionErrors = [
      ...(aiFormLeaks.length ? [{ code: "AI_STRUCTURED_FORM_SCORE_CONTAMINATION", level: "error" as const, message: `O formulário JSON para IA ainda contém ${aiFormLeaks.length} campo(s) de score/ranking de auditoria.`, context: aiFormLeaks.slice(0, 12).join(", ") }] : []),
      ...(aiUnsafeStars.length ? [{ code: "AI_STRUCTURED_FORM_STAR_CONTAMINATION", level: "error" as const, message: `O formulário JSON para IA contém ${aiUnsafeStars.length} contato(s) estelar(es) não interpretativo(s).`, context: aiUnsafeStars.slice(0, 12).join(", ") }] : []),
      ...(!evidenceAudit.radicalAllMaterialized ? [{ code: "AI_STRUCTURED_FORM_RADICAL_EVIDENCE_MISSING", level: "error" as const, message: `O formulário para IA possui ${evidenceAudit.missingRadicalEvidence.length} evidência(s) radical(is) declarada(s) no contrato mas não materializada(s).` }] : []),
      ...(!evidenceAudit.allEvidenceAccountedFor ? [{ code: "AI_STRUCTURED_FORM_EVIDENCE_KEY_UNMAPPED", level: "error" as const, message: `Há ${evidenceAudit.unaccountedEvidenceKeys.length} chave(s) de evidência do contrato sem mapeamento de materialização.` }] : []),
    ];
    if (extractionErrors.length) {
      natalValidation = {
        ...natalValidation,
        status: "FAIL",
        errors: [...natalValidation.errors, ...extractionErrors],
        checks: {
          ...natalValidation.checks,
          aiStructuredFormNoAuditScores: aiFormLeaks.length === 0,
          aiStructuredFormOnlyInterpretiveStars: aiUnsafeStars.length === 0,
          aiStructuredFormRadicalEvidenceMaterialized: evidenceAudit.radicalAllMaterialized,
          aiStructuredFormAllEvidenceKeysAccountedFor: evidenceAudit.allEvidenceAccountedFor,
        },
      };
      natalStructuredForm = buildNatalAiStructuredForm(natalAnalysis, natalPrecision, natalValidation);
    }

    let predictiveResult;
    if (body?.targetDate) {
      validateBirthDate(body.targetDate, "targetDate");
      const predictiveInput: PredictiveInput = {
        ...body,
        consultation: {
          ...(body.consultation ?? {}),
          ...(body.question ? { question: body.question } : {}),
          ...(body.context ? { context: body.context } : {}),
        },
      } as PredictiveInput;
      predictiveResult = await calculatePredictiveEngine(predictiveInput);
    }

    const payload = buildMasterConsultationPayload({
      natalStructuredForm,
      natalValidation,
      question: body?.question ?? body?.consultation?.question,
      context: body?.context ?? body?.consultation?.context,
      fullNatalRequested: body?.fullNatalRequested === true,
      predictiveResult,
    });

    return NextResponse.json(payload, { status: payload.release.interpretationAllowed ? 200 : 422 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido na consulta mestre.";
    return NextResponse.json({ erro: message }, { status: 400 });
  }
}
