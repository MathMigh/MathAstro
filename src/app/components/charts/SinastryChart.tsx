"use client";

import { useBirthChart } from "@/contexts/BirthChartContext";
import type { BirthChart, PlanetType } from "@/interfaces/BirthChartInterfaces";
import type { SynastryAIEvaluationPacket, SynastryAnalysis } from "@/traditions/western/synastry";
import ChartAndData from "../ChartAndData";
import TraditionalSynastryPanel from "../synastry/TraditionalSynastryPanel";

interface SinastryProps {
  sinastryChart?: BirthChart;
  sinastryProfileName?: string;
  synastryAnalysis?: SynastryAnalysis;
  synastryReport?: string;
  synastryAI?: SynastryAIEvaluationPacket;
}

const TRADITIONAL_TYPES = new Set<PlanetType>([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
]);

function traditionalWheel(chart: BirthChart): BirthChart {
  return {
    ...chart,
    planets: chart.planets.filter((planet) => TRADITIONAL_TYPES.has(planet.type)),
  };
}

export default function SinastryChart(props: SinastryProps) {
  const {
    sinastryChart,
    sinastryProfileName,
    synastryAnalysis,
    synastryReport,
    synastryAI,
  } = props;
  const { profileName, birthChart } = useBirthChart();

  if (!birthChart || !sinastryChart || !synastryAnalysis || !synastryReport) {
    return null;
  }

  const innerTraditional = traditionalWheel(birthChart);
  const outerTraditional = traditionalWheel(sinastryChart);

  return (
    <div className="mb-4 flex w-full flex-col items-center justify-center gap-6">
      <div className="flex w-full flex-col items-center text-left">
        <ChartAndData
          innerChart={innerTraditional}
          outerChart={outerTraditional}
          chartDateProps={{
            chartType: "birth",
            birthChart,
            label: profileName,
          }}
          outerChartDateProps={{
            chartType: "birth",
            birthChart: sinastryChart,
            label: sinastryProfileName,
          }}
          title={`Sinastria tradicional — ${profileName ?? "Pessoa A"} × ${sinastryProfileName ?? "Pessoa B"}`}
          showPositionsSummary={false}
          showFixedStarsTable={false}
          showFixedStarsOnWheel={false}
          showTraditionalReport={false}
          synastryMode
        />
      </div>

      <div className="w-[95%] md:w-full">
        <TraditionalSynastryPanel
          analysis={synastryAnalysis}
          report={synastryReport}
          aiPacket={synastryAI}
        />
      </div>
    </div>
  );
}
