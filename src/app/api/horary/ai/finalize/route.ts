import { NextResponse } from "next/server";
import { renderHoraryFinalAIReport, validateHoraryAIResult } from "@/traditions/western/horary";
import type { HoraryDossier } from "@/traditions/western/horary";

/**
 * Endpoint provider-neutral para a fase posterior à IA.
 * O provedor externo devolve um HoraryAIResultShape; este endpoint valida o
 * contrato contra o dossiê original antes de aceitar a síntese final.
 */
export async function POST(request:Request){
  try{
    const body=await request.json();
    if(!body?.dossier) return NextResponse.json({error:"dossier é obrigatório."},{status:400});
    if(!body?.aiResult) return NextResponse.json({error:"aiResult é obrigatório."},{status:400});
    const dossier=body.dossier as HoraryDossier;
    const validation=validateHoraryAIResult(body.aiResult,dossier);
    if(!validation.valid||!validation.value) return NextResponse.json({accepted:false,validation},{status:422});
    return NextResponse.json({accepted:true,validation,finalReport:renderHoraryFinalAIReport(dossier,validation.value)});
  }catch(error){ return NextResponse.json({error:error instanceof Error?error.message:"Erro desconhecido"},{status:500}); }
}
