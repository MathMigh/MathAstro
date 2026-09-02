import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

export function rashiChartEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  return {
    sections: [
      createSection({
        id: `${module}-rashi`,
        title: "Rasi Chart / D1",
        description:
          "Lagna, grahas por signo e por casa, com os estados tecnicos que o motor ja conseguiu derivar.",
        status: "implemented",
        items: [
          createDatum(module, "Rasi", "Lagna", snapshot.ascendant.signName, {
            relatedSign: snapshot.ascendant.signName,
            technicalNotes: `${snapshot.ascendant.degreeInSign.toFixed(2)} graus; nakshatra ${snapshot.ascendant.nakshatra} pada ${snapshot.ascendant.pada}.`,
            confidence: 0.88,
          }),
          createDatum(module, "Rasi", "Chandra Lagna", snapshot.moonSign, {
            relatedSign: snapshot.moonSign,
            technicalNotes: "Usado como ancora adicional para dashas e gochara.",
            confidence: 0.82,
          }),
          createDatum(module, "Rasi", "Surya Lagna", snapshot.sunSign, {
            relatedSign: snapshot.sunSign,
            technicalNotes: "Usado como referencial solar complementar.",
            confidence: 0.82,
          }),
        ],
        tables: [
          createTable(
            `${module}-grahas-d1`,
            "Grahas no D1",
            ["Graha", "Signo", "Casa", "Grau", "Nakshatra", "Estado"],
            [snapshot.ascendant, ...snapshot.planets].map((point) => [
              point.name,
              point.signName,
              point.house.toString(),
              point.degreeInSign.toFixed(2),
              `${point.nakshatra} P${point.pada}`,
              point.tags.join(", "),
            ]),
            "Tabela principal do mapa sideral natal ou do momento.",
          ),
        ],
      }),
    ],
  };
}
