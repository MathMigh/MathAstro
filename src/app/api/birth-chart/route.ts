import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import { calculateNatalAnalysis } from "@/app/lib/natalAnalysis";
import { calculateNatalPrecision } from "@/app/lib/natalPrecision";
import { generateNatalAuditReport, generateNatalTechnicalReport } from "@/app/lib/natalTechnicalReport";
import { prependNatalValidationHeader, validateNatalProductionOutput } from "@/app/lib/natalProductionValidation";
import { buildNatalAiStructuredForm, containsAuditOnlyNumericKeys, findAiUnsafeStarContacts } from "@/app/lib/natalAiForm";
import { buildNatalAbsoluteJudgmentPackage } from "@/app/lib/natalJudgmentEngine";
import { buildNatalAiIntegrationEnvelope } from "@/app/lib/natalAiIntegration";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.birthDate) {
      return NextResponse.json(
        { erro: "Faltando payload 'birthDate' na requisicao." },
        { status: 400 },
      );
    }

    const latitude = Number(body.birthDate?.coordinates?.latitude);
    const longitude = Number(body.birthDate?.coordinates?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { erro: "Selecione uma cidade valida na lista antes de gerar o mapa." },
        { status: 400 },
      );
    }

    const timezone = body.birthDate?.coordinates?.timezone;
    if (typeof timezone !== "string" || !timezone.trim()) {
      return NextResponse.json(
        { erro: "Fuso IANA obrigatório. Selecione uma localidade com timezone resolvido ou informe-o explicitamente." },
        { status: 400 },
      );
    }

    const chartData = await calculateBirthChart(body.birthDate);
    const natalAnalysis = calculateNatalAnalysis(chartData);
    const natalPrecision = await calculateNatalPrecision(chartData);
    const aiReportBase = generateNatalTechnicalReport(
      chartData,
      natalAnalysis,
      natalPrecision,
      { profile: "ai-clean" },
    );
    let natalValidation = validateNatalProductionOutput(
      chartData,
      natalAnalysis,
      natalPrecision,
      aiReportBase,
    );

    // A própria extração para IA também é validada. O relatório não é liberado
    // se algum score/ranking/ledger numérico de compatibilidade sobreviver ao saneamento.
    const judgmentQuestion = typeof body.judgmentQuestion === "string" ? body.judgmentQuestion.trim() : "";
    let aiStructuredForm = buildNatalAiStructuredForm(natalAnalysis, natalPrecision, natalValidation);
    let absoluteJudgmentPackage = buildNatalAbsoluteJudgmentPackage(natalAnalysis, natalPrecision, natalValidation, judgmentQuestion || null);
    const aiFormLeaks = containsAuditOnlyNumericKeys(aiStructuredForm.technicalForm);
    const aiUnsafeStars = findAiUnsafeStarContacts(aiStructuredForm.technicalForm);
    const absolutePackageLeaks = containsAuditOnlyNumericKeys(absoluteJudgmentPackage);
    const evidenceAudit = aiStructuredForm.evidenceMaterialization;
    const extractionErrors = [
      ...(aiFormLeaks.length ? [{
        code: "AI_STRUCTURED_FORM_SCORE_CONTAMINATION",
        level: "error" as const,
        message: `O formulário JSON para IA ainda contém ${aiFormLeaks.length} campo(s) de score/ranking de auditoria.`,
        context: aiFormLeaks.slice(0, 12).join(", "),
      }] : []),
      ...(aiUnsafeStars.length ? [{
        code: "AI_STRUCTURED_FORM_STAR_CONTAMINATION",
        level: "error" as const,
        message: `O formulário JSON para IA contém ${aiUnsafeStars.length} contato(s) estelar(es) não interpretativo(s).`,
        context: aiUnsafeStars.slice(0, 12).join(", "),
      }] : []),
      ...(absolutePackageLeaks.length ? [{
        code: "AI_ABSOLUTE_PACKAGE_SCORE_CONTAMINATION",
        level: "error" as const,
        message: `O pacote de julgamento absoluto ainda contém ${absolutePackageLeaks.length} campo(s) de score/ranking de auditoria.`,
        context: absolutePackageLeaks.slice(0, 12).join(", "),
      }] : []),
      ...(!evidenceAudit.radicalAllMaterialized ? [{
        code: "AI_STRUCTURED_FORM_RADICAL_EVIDENCE_MISSING",
        level: "error" as const,
        message: `O formulário para IA possui ${evidenceAudit.missingRadicalEvidence.length} evidência(s) radical(is) declarada(s) no contrato mas não materializada(s).`,
        context: evidenceAudit.missingRadicalEvidence.slice(0, 16).map((item) => `${item.protocolId}:${item.key}`).join(", "),
      }] : []),
      ...(!evidenceAudit.allEvidenceAccountedFor ? [{
        code: "AI_STRUCTURED_FORM_EVIDENCE_KEY_UNMAPPED",
        level: "error" as const,
        message: `Há ${evidenceAudit.unaccountedEvidenceKeys.length} chave(s) de evidência do contrato sem mapeamento de materialização.`,
        context: evidenceAudit.unaccountedEvidenceKeys.join(", "),
      }] : []),
    ];
    natalValidation = {
      ...natalValidation,
      status: extractionErrors.length ? "FAIL" : natalValidation.status,
      errors: [...natalValidation.errors, ...extractionErrors],
      checks: {
        ...natalValidation.checks,
        aiStructuredFormNoAuditScores: aiFormLeaks.length === 0,
        aiStructuredFormOnlyInterpretiveStars: aiUnsafeStars.length === 0,
        aiAbsoluteJudgmentPackageNoAuditScores: absolutePackageLeaks.length === 0,
        aiStructuredFormRadicalEvidenceMaterialized: evidenceAudit.radicalAllMaterialized,
        aiStructuredFormAllEvidenceKeysAccountedFor: evidenceAudit.allEvidenceAccountedFor,
      },
    };
    aiStructuredForm = buildNatalAiStructuredForm(natalAnalysis, natalPrecision, natalValidation);
    absoluteJudgmentPackage = buildNatalAbsoluteJudgmentPackage(natalAnalysis, natalPrecision, natalValidation, judgmentQuestion || null);

    const traditionalReport = prependNatalValidationHeader(aiReportBase, natalValidation);
    const auditReport = generateNatalAuditReport(chartData, natalAnalysis, natalPrecision);
    const aiIntegration = buildNatalAiIntegrationEnvelope(absoluteJudgmentPackage);

    return NextResponse.json({
      ...chartData,
      traditionalReport,
      natalAnalysis,
      natalPrecision,
      natalValidation,
      reportBundle: {
        aiTechnicalReport: traditionalReport,
        auditTechnicalReport: auditReport,
        aiStructuredForm,
        auditStructuredForm: natalAnalysis.technicalForm,
        absoluteJudgmentPackage,
        absoluteNatalPrompt: absoluteJudgmentPackage.absolutePrompt,
        natalJudgmentContext: absoluteJudgmentPackage.natalJudgmentContext,
        aiIntegration,
        validation: natalValidation,
        releasedForAi: natalValidation.status === "PASS",
      },
    });
  } catch (error: any) {
    console.error("Erro interno ao calcular o mapa:", error);
    return NextResponse.json(
      { erro: "Erro ao calcular o mapa: " + (error?.message || "Erro desconhecido") },
      { status: 500 },
    );
  }
}
