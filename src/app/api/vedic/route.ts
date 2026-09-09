import { NextResponse } from "next/server";
import { calculateBirthChart } from "@/app/lib/astrologyEngine";
import { buildVedicSuite, VedicAyanamsa } from "@/app/lib/vedic";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import type { JyotishConfig } from "@/app/lib/jyotish/types";

interface VedicPayload {
  primary: BirthDate;
  transit: BirthDate;
  partner?: BirthDate;
  ayanamsa?: VedicAyanamsa;
  config?: Partial<JyotishConfig>;
  question?: string;
  eventType?: string;
  selectedYear?: number;
}

function hasCoordinates(input?: BirthDate) {
  return Boolean(
    input &&
      Number.isFinite(Number(input.coordinates?.latitude)) &&
      Number.isFinite(Number(input.coordinates?.longitude))
  );
}


function ensureVedicTimezone(input: BirthDate): BirthDate {
  if (input.coordinates.timezone) return input;
  const offset = Math.max(-12, Math.min(14, Math.round(Number(input.coordinates.longitude) / 15)));
  const timezone = offset === 0 ? "Etc/GMT" : offset > 0 ? `Etc/GMT-${offset}` : `Etc/GMT+${Math.abs(offset)}`;
  return { ...input, coordinates: { ...input.coordinates, timezone, timezoneSource: "user" } };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VedicPayload;

    if (!hasCoordinates(body.primary) || !hasCoordinates(body.transit)) {
      return NextResponse.json(
        { erro: "Selecione cidades válidas para o mapa natal e para o trânsito." },
        { status: 400 }
      );
    }

    if (body.partner && !hasCoordinates(body.partner)) {
      return NextResponse.json(
        { erro: "A segunda pessoa precisa ter uma cidade válida selecionada." },
        { status: 400 }
      );
    }

    const [primaryChart, transitChart, partnerChart] = await Promise.all([
      calculateBirthChart(ensureVedicTimezone(body.primary)),
      calculateBirthChart(ensureVedicTimezone(body.transit)),
      body.partner ? calculateBirthChart(ensureVedicTimezone(body.partner)) : Promise.resolve(undefined),
    ]);

    const suite = await buildVedicSuite(
      primaryChart,
      transitChart,
      body.ayanamsa ?? "lahiri",
      partnerChart,
      {
        config: body.config,
        question: body.question,
        eventType: body.eventType,
        selectedYear: body.selectedYear,
      }
    );

    return NextResponse.json(suite);
  } catch (error) {
    console.error("Erro ao montar a suíte védica:", error);

    return NextResponse.json(
      {
        erro:
          "Não consegui montar a leitura védica agora. " +
          ((error as Error)?.message ?? "Erro desconhecido"),
      },
      { status: 500 }
    );
  }
}
