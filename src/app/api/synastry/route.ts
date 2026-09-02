import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import type { BirthChart, BirthDate } from "@/interfaces/BirthChartInterfaces";
import {
  buildSynastryAIEvaluationPacket,
  calculateSynastryAnalysis,
  generateSynastryTechnicalReport,
  SYNASTRY_INTERACTION_PRESETS,
} from "@/traditions/western/synastry";
import type {
  SynastryCustomRoleInput,
  SynastryInteractionKind,
  SynastryUserContext,
} from "@/traditions/western/synastry";

const INTERACTION_KINDS = new Set<SynastryInteractionKind>([
  ...SYNASTRY_INTERACTION_PRESETS.map((item) => item.kind),
  "custom",
]);

function parseInteractionKind(value: unknown): SynastryInteractionKind | undefined {
  return typeof value === "string" && INTERACTION_KINDS.has(value as SynastryInteractionKind)
    ? value as SynastryInteractionKind
    : undefined;
}

function parseCustomRole(value: unknown): SynastryCustomRoleInput | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  return {
    houseForA: Number(input.houseForA),
    houseForB: Number(input.houseForB),
    roleA: typeof input.roleA === "string" ? input.roleA : "",
    roleB: typeof input.roleB === "string" ? input.roleB : "",
  };
}

function parseUserContext(value: unknown): SynastryUserContext | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  return {
    focus: typeof input.focus === "string" ? input.focus.slice(0, 2000) : undefined,
    relationshipState: typeof input.relationshipState === "string" ? input.relationshipState.slice(0, 2000) : undefined,
    notes: typeof input.notes === "string" ? input.notes.slice(0, 4000) : undefined,
  };
}

function validateBirthDate(value: unknown, label: string): string | null {
  const date = value as BirthDate | undefined;
  if (!date) return `${label} ausente.`;
  if (!Number.isFinite(Number(date.coordinates?.latitude)) || !Number.isFinite(Number(date.coordinates?.longitude))) return `${label}: coordenadas inválidas.`;
  if (typeof date.coordinates?.timezone !== "string" || !date.coordinates.timezone.trim()) return `${label}: fuso IANA obrigatório.`;
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let chartA: BirthChart;
    let chartB: BirthChart;

    if (body?.chartA && body?.chartB) {
      chartA = body.chartA as BirthChart;
      chartB = body.chartB as BirthChart;
    } else {
      const errorA = validateBirthDate(body?.birthDateA, "birthDateA");
      const errorB = validateBirthDate(body?.birthDateB, "birthDateB");
      if (errorA || errorB) {
        return NextResponse.json({ erro: [errorA, errorB].filter(Boolean).join(" ") }, { status: 400 });
      }
      [chartA, chartB] = await Promise.all([
        calculateBirthChart(body.birthDateA),
        calculateBirthChart(body.birthDateB),
      ]);
    }

    const interactionKind = parseInteractionKind(body?.interactionKind) ?? "general";
    const synastryAnalysis = calculateSynastryAnalysis(chartA, chartB, {
      labelA: typeof body?.labelA === "string" ? body.labelA : undefined,
      labelB: typeof body?.labelB === "string" ? body.labelB : undefined,
      interactionKind,
      customRole: interactionKind === "custom" ? parseCustomRole(body?.customRole) : undefined,
      userContext: parseUserContext(body?.userContext),
    });
    const synastryReport = generateSynastryTechnicalReport(synastryAnalysis);
    const synastryAI = buildSynastryAIEvaluationPacket(synastryAnalysis);

    return NextResponse.json({ chartA, chartB, synastryAnalysis, synastryReport, synastryAI });
  } catch (error: unknown) {
    console.error("Erro interno no motor de sinastria:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    const status = /personalizada exige|Tipo de interação/.test(message) ? 400 : 500;
    return NextResponse.json(
      { erro: `Erro ao calcular sinastria: ${message}` },
      { status },
    );
  }
}
