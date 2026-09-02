import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";
import { computeUpagrahaSet } from "./upagrahaMath";

const UPAGRAHAS = [
  "Gulika",
  "Mandi",
  "Dhooma",
  "Vyatipata",
  "Parivesha",
  "Indrachapa",
  "Upaketu",
  "Kala",
  "Mrityu",
  "Ardhaprahara",
  "Yamakantaka",
];

export async function upagrahaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): Promise<EngineResult> {
  const upagrahas = await computeUpagrahaSet(snapshot);
  const fullSetAvailable = UPAGRAHAS.every((name) => upagrahas.some((entry) => entry.name === name));

  return {
    sections: [
      createSection({
        id: `${module}-upagrahas`,
        title: "Upagrahas",
        description:
          "Sun-based upagrahas e upagrahas temporais calculados com formulas explicitas, sem esconder o metodo usado.",
        status: fullSetAvailable ? "implemented" : "placeholder",
        items: UPAGRAHAS.map((name) => {
          const point = upagrahas.find((entry) => entry.name === name);
          return createDatum(module, "Upagraha", name, point ? `${point.signName} ${point.degreeInSign.toFixed(2)}deg` : "Pendente", {
            technicalNotes: point?.note ?? "Ainda sem formula ativa nesta versao.",
            confidence: point ? 0.68 : 0.3,
            status: point ? "implemented" : "placeholder",
          });
        }),
        tables: [
          createTable(
            `${module}-upagrahas-table`,
            "Mapa de Upagrahas",
            ["Nome", "Signo", "Grau", "Casa", "Nota"],
            upagrahas.map((point) => [
              point.name,
              point.signName,
              `${point.degreeInSign.toFixed(2)}deg`,
              point.house.toString(),
              point.note,
            ]),
            "Dhooma, Vyatipata, Parivesha, Indrachapa e Upaketu derivam do Sol; Kala, Mrityu, Ardhaprahara, Yamakantaka, Gulika e Mandi derivam das partes diurnas/noturnas."
          ),
        ],
      }),
    ],
  };
}
