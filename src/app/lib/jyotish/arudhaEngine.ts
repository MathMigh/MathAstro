import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";
import { calculateArudhaSet } from "./arudhaUtils";

export function arudhaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const arudhas = calculateArudhaSet(snapshot);
  const upapada = arudhas.find((entry) => entry.houseNumber === 12);
  const darapada = arudhas.find((entry) => entry.houseNumber === 7);
  const arudhaLagna = arudhas.find((entry) => entry.houseNumber === 1);

  return {
    sections: [
      createSection({
        id: `${module}-arudha`,
        title: "Arudha",
        description:
          "Arudha Lagna, A2-A12, Darapada e Upapada calculados pela regencia de casa no D1, com excecao classica 1/7 explicitada.",
        status: "implemented",
        items: [
          createDatum(module, "Arudha", "Arudha Lagna / A1", arudhaLagna?.signName ?? "--", {
            technicalNotes: arudhaLagna?.note ?? "Sem regente calculado para A1.",
            confidence: arudhaLagna ? 0.78 : 0.2,
            status: arudhaLagna ? "implemented" : "placeholder",
          }),
          createDatum(module, "Arudha", "Darapada / A7", darapada?.signName ?? "--", {
            technicalNotes: darapada?.note ?? "Sem regente calculado para A7.",
            confidence: darapada ? 0.76 : 0.2,
            status: darapada ? "implemented" : "placeholder",
          }),
          createDatum(module, "Arudha", "Upapada Lagna / A12", upapada?.signName ?? "--", {
            technicalNotes: upapada?.note ?? "Sem regente calculado para A12.",
            confidence: upapada ? 0.78 : 0.2,
            status: upapada ? "implemented" : "placeholder",
          }),
        ],
        tables: [
          createTable(
            `${module}-arudha-table`,
            "Arudha Padas",
            ["Pada", "Signo", "Casa", "Regente", "Regente em", "Ajuste", "Nota"],
            arudhas.map((entry) => [
              entry.key,
              entry.signName,
              `H${entry.houseFromLagna}`,
              entry.lordLabel,
              entry.lordSignName,
              entry.adjustmentApplied ? "Sim" : "Nao",
              entry.note,
            ]),
            "A tabela usa a contagem da casa ate seu regente e repete a distancia a partir do regente; quando o regente cai na propria casa ou na 7a, aplica-se a excecao classica da 10a."
          ),
        ],
      }),
    ],
  };
}
