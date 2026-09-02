import { NextResponse } from "next/server";
import { evaluateElection } from "@/traditions/western/electional";

export async function POST(request:Request){
  try {
    const body=await request.json();
    if(!body?.electionChart) return NextResponse.json({erro:"electionChart é obrigatório."},{status:400});
    if(!body?.goal) return NextResponse.json({erro:"goal é obrigatório."},{status:400});
    const result=evaluateElection({
      methodMode: body.methodMode ?? "current-marcos-frawley-aware",
      goal: body.goal,
      objective: body.objective ?? "",
      constraints: Array.isArray(body.constraints)?body.constraints:[],
      electionChart: body.electionChart,
      natalCharts: Array.isArray(body.natalCharts)?body.natalCharts:[],
    });
    return NextResponse.json(result);
  }catch(error:any){
    console.error("Erro no motor eletivo:",error);
    return NextResponse.json({erro:error?.message??"Erro desconhecido no motor eletivo."},{status:500});
  }
}
