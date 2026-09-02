import { NextResponse } from "next/server";
import { scanElectionalWindow } from "@/traditions/western/electional";
import type { ElectionalScanRequest } from "@/traditions/western/electional";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json() as ElectionalScanRequest;
    const result = await scanElectionalWindow(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha na varredura eletiva." }, { status: 400 });
  }
}
