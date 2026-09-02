import { NextResponse } from "next/server";
import { buildPredictiveBotPayload, calculatePredictiveEngine } from "@/traditions/western/predictive";
import type { PredictiveInput } from "@/traditions/western/predictive";

function validatePayload(body: any): PredictiveInput {
  if (!body?.birthDate || !body?.targetDate) throw new Error("birthDate e targetDate são obrigatórios.");
  const allowedAuthorModes = new Set(["marcos", "frawley", "combined", "gugu", "integrated"]);
  if (body.authorMode !== undefined && !allowedAuthorModes.has(body.authorMode)) throw new Error("authorMode inválido.");
  for (const [label, date] of [["birthDate", body.birthDate], ["targetDate", body.targetDate]] as const) {
    if (!date.coordinates || !Number.isFinite(Number(date.coordinates.latitude)) || !Number.isFinite(Number(date.coordinates.longitude))) {
      throw new Error(`${label}: coordenadas válidas são obrigatórias.`);
    }
    if (typeof date.coordinates.timezone !== "string" || !date.coordinates.timezone.trim()) {
      throw new Error(`${label}: timezone IANA explícito é obrigatório.`);
    }
  }
  return body as PredictiveInput;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validatePayload(body);
    const result = await calculatePredictiveEngine(input);
    const format = body?.format ?? "full-json";
    if (format === "report-text") {
      return new Response(result.analysisReport, {
        status: result.validation.status === "PASS" ? 200 : 422,
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    }
    if (format === "report-json") {
      return NextResponse.json({
        schema: result.schema,
        validation: result.validation,
        analysisReport: result.analysisReport,
        aiPrompt: result.aiPrompt,
        aiJudgmentContract: result.aiJudgmentContract,
      }, { status: result.validation.status === "PASS" ? 200 : 422 });
    }
    if (format === "ai-package") {
      return NextResponse.json(buildPredictiveBotPayload(result, body?.userMessage), { status: result.validation.status === "PASS" ? 200 : 422 });
    }
    return NextResponse.json(result, { status: result.validation.status === "PASS" ? 200 : 422 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido na Preditiva.";
    return NextResponse.json({ erro: message }, { status: 400 });
  }
}
