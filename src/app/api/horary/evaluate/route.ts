import { NextResponse } from "next/server";
import { calculateBirthChart, calculatePlanetarySnapshotAtJulianDay } from "@/app/lib/astrologyEngine";
import {
  applyChronology,
  buildHoraryAIHandoff,
  buildHoraryAIJudgementRequest,
  buildHoraryAISemanticIntakeRequest,
  buildHoraryChronology,
  evaluateHorary,
  HORARY_ABSOLUTE_AI_SYSTEM_PROMPT,
  HORARY_AI_CONTRACT_VERSION,
  HORARY_AI_PROMPT_VERSION,
  renderHoraryAIUserPrompt,
  renderHoraryReport,
} from "@/traditions/western/horary";

export async function POST(request:Request){
  try{
    const body=await request.json();

    // Modo pré-motor: quando o bot/IA ainda precisa transformar linguagem humana
    // em papéis semânticos. Nenhuma IA é chamada aqui; a API apenas prepara o
    // pacote provider-neutral para o modelo que for conectado no futuro.
    if(!body?.context?.concreteQuestion && body?.aiSemanticIntakeInput?.rawQuestion){
      const aiModelRequest=buildHoraryAISemanticIntakeRequest(body.aiSemanticIntakeInput);
      return NextResponse.json({
        stage:"semantic_intake",
        aiReady:true,
        promptVersion:HORARY_AI_PROMPT_VERSION,
        contractVersion:HORARY_AI_CONTRACT_VERSION,
        aiModelRequest,
      },{status:202});
    }

    if(!body?.context?.concreteQuestion) return NextResponse.json({error:"context.concreteQuestion é obrigatório, ou envie aiSemanticIntakeInput.rawQuestion para preparar a fase semântica da IA."},{status:400});
    const chart=body.chart ?? (body.chartDate ? await calculateBirthChart(body.chartDate) : null);
    if(!chart) return NextResponse.json({error:"Informe chart pronto ou chartDate para cálculo Swiss Ephemeris."},{status:400});
    let dossier=evaluateHorary({chart,context:body.context});
    if(dossier.judgement.canJudge && chart.calculationMetadata?.julianDayUt){
      const provider=async(jd:number,types:any[])=>calculatePlanetarySnapshotAtJulianDay(jd,types);
      const chronology=await buildHoraryChronology(chart,dossier,provider,{horizonDays:body?.chronologyHorizonDays??370,stepDays:body?.chronologyStepDays??1});
      dossier=applyChronology(dossier,chronology);
    }
    return NextResponse.json({
      dossier,
      report:renderHoraryReport(dossier),
      aiReady:true,
      aiHandoff:buildHoraryAIHandoff(dossier),
      aiSystemPrompt:HORARY_ABSOLUTE_AI_SYSTEM_PROMPT,
      aiUserPrompt:renderHoraryAIUserPrompt(dossier),
      aiModelRequest:buildHoraryAIJudgementRequest(dossier),
      aiIntegration:{
        provider:"not-connected",
        language:"pt-BR",
        promptVersion:HORARY_AI_PROMPT_VERSION,
        contractVersion:HORARY_AI_CONTRACT_VERSION,
        note:"Conecte qualquer provedor que implemente HoraryAIProvider.generate(request). O motor permanece provider-neutral.",
      },
    });
  }catch(error){ return NextResponse.json({error:error instanceof Error?error.message:"Erro desconhecido"},{status:500}); }
}
