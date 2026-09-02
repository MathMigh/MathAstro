import { NextResponse } from "next/server";
import { calculateMundaneEngine } from "@/traditions/western/mundane";
import type { MundaneInput } from "@/traditions/western/mundane";

function validate(body:any):MundaneInput{
  if(!body?.targetDate) throw new Error("targetDate é obrigatório.");
  const c=body.targetDate.coordinates;
  if(!c || !Number.isFinite(Number(c.latitude)) || !Number.isFinite(Number(c.longitude))) throw new Error("Coordenadas válidas são obrigatórias.");
  if(typeof c.timezone!=="string" || !c.timezone.trim()) throw new Error("Timezone IANA explícito é obrigatório.");
  const modes=new Set(["marcos","frawley-legacy","marcos-frawley","research"]);
  if(body.authorMode && !modes.has(body.authorMode)) throw new Error("authorMode inválido.");
  return body as MundaneInput;
}
export async function POST(request:Request){
  try{
    const body=validate(await request.json());
    const result=await calculateMundaneEngine(body);
    return NextResponse.json(result,{status:result.validation.status==="FAIL"?422:200});
  }catch(error){return NextResponse.json({erro:error instanceof Error?error.message:"Erro desconhecido na Mundana."},{status:400});}
}
