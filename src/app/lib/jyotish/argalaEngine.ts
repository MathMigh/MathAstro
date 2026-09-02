import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createSection, createTable } from "./engineHelpers";
import { calculateArudhaSet } from "./arudhaUtils";

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function findOccupants(snapshot: VedicSnapshot, signIndex: number) {
  return snapshot.planets.filter((point) => point.signIndex === signIndex).map((point) => point.name);
}

function buildArgalaForTarget(snapshot: VedicSnapshot, label: string, signIndex: number) {
  const primary = [
    { offset: 1, label: "2a", blockerOffset: 11, blockerLabel: "12a" },
    { offset: 3, label: "4a", blockerOffset: 9, blockerLabel: "10a" },
    { offset: 10, label: "11a", blockerOffset: 2, blockerLabel: "3a" },
  ];
  const secondary = { offset: 4, label: "5a", blockerOffset: 8, blockerLabel: "9a" };

  const rows = primary.map((rule) => {
    const sourceSign = modulo(signIndex + rule.offset, 12);
    const blockerSign = modulo(signIndex + rule.blockerOffset, 12);
    const source = findOccupants(snapshot, sourceSign);
    const blocker = findOccupants(snapshot, blockerSign);
    return [
      label,
      rule.label,
      source.length ? source.join(", ") : "--",
      rule.blockerLabel,
      blocker.length ? blocker.join(", ") : "--",
      source.length > blocker.length ? "Argala ativa" : source.length === blocker.length && source.length > 0 ? "Argala equilibrada" : "Sem dominancia",
    ];
  });

  const secondarySourceSign = modulo(signIndex + secondary.offset, 12);
  const secondaryBlockerSign = modulo(signIndex + secondary.blockerOffset, 12);
  rows.push([
    label,
    secondary.label,
    findOccupants(snapshot, secondarySourceSign).join(", ") || "--",
    secondary.blockerLabel,
    findOccupants(snapshot, secondaryBlockerSign).join(", ") || "--",
    "Argala secundario",
  ]);

  return rows;
}

export function argalaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const arudhas = calculateArudhaSet(snapshot);
  const atmakaraka = snapshot.charaKarakas.find((item) => item.role === "Atmakaraka");
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const targets = [
    { label: "Lagna", signIndex: snapshot.ascendant.signIndex },
    { label: "Lua", signIndex: moon.signIndex },
    { label: "Atmakaraka", signIndex: atmakaraka ? snapshot.planets.find((point) => point.key === atmakaraka.key)?.signIndex ?? snapshot.ascendant.signIndex : snapshot.ascendant.signIndex },
    { label: "Arudha Lagna", signIndex: arudhas.find((entry) => entry.houseNumber === 1)?.signIndex ?? snapshot.ascendant.signIndex },
    { label: "Upapada", signIndex: arudhas.find((entry) => entry.houseNumber === 12)?.signIndex ?? snapshot.ascendant.signIndex },
  ];

  return {
    sections: [
      createSection({
        id: `${module}-argala`,
        title: "Argala e Virodhargala",
        description:
          "Leitura inicial de Argala por ocupantes nas posicoes 2, 4, 11 e 5, com seus bloqueios 12, 10, 3 e 9.",
        status: "implemented",
        tables: [
          createTable(
            `${module}-argala-table`,
            "Argala por alvo",
            ["Alvo", "Posicao", "Argala", "Bloqueio", "Virodhargala", "Estado"],
            targets.flatMap((target) => buildArgalaForTarget(snapshot, target.label, target.signIndex)),
            "O motor compara ocupantes por posicao e marca se a pressao argalica esta ativa, equilibrada ou sem dominancia visivel."
          ),
        ],
      }),
    ],
  };
}
