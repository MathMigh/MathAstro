import type { VedicSnapshot } from "../vedic";
import { signDistance } from "./engineHelpers";

const SIGN_NAMES = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrischika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
] as const;

const SIGN_LORDS = [
  { key: "mars", label: "Mangala" },
  { key: "venus", label: "Shukra" },
  { key: "mercury", label: "Budha" },
  { key: "moon", label: "Chandra" },
  { key: "sun", label: "Surya" },
  { key: "mercury", label: "Budha" },
  { key: "venus", label: "Shukra" },
  { key: "mars", label: "Mangala" },
  { key: "jupiter", label: "Guru" },
  { key: "saturn", label: "Shani" },
  { key: "saturn", label: "Shani" },
  { key: "jupiter", label: "Guru" },
] as const;

export interface ArudhaPoint {
  key: string;
  houseNumber: number;
  houseLabel: string;
  signIndex: number;
  signName: string;
  houseFromLagna: number;
  lordKey: string;
  lordLabel: string;
  lordSignName: string;
  distance: number;
  adjustmentApplied: boolean;
  note: string;
}

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function getHouseLabel(houseNumber: number) {
  if (houseNumber === 1) {
    return "Arudha Lagna";
  }
  if (houseNumber === 7) {
    return "Darapada";
  }
  if (houseNumber === 12) {
    return "Upapada Lagna";
  }
  return `A${houseNumber}`;
}

export function calculateArudhaForHouse(
  snapshot: VedicSnapshot,
  houseNumber: number
): ArudhaPoint | undefined {
  const baseSignIndex = modulo(snapshot.ascendant.signIndex + houseNumber - 1, 12);
  const lord = SIGN_LORDS[baseSignIndex];
  const lordPoint = snapshot.planets.find((point) => point.key === lord.key);

  if (!lordPoint) {
    return undefined;
  }

  const distance = signDistance(baseSignIndex, lordPoint.signIndex);
  let resultSignIndex = modulo(lordPoint.signIndex + distance, 12);
  let adjustmentApplied = false;
  let note = `Contagem da casa ${houseNumber} ate ${lord.label} em ${lordPoint.signName}; projeção repetida a partir do regente.`;

  if (distance === 0 || distance === 6) {
    resultSignIndex = modulo(baseSignIndex + 9, 12);
    adjustmentApplied = true;
    note =
      `Regra classica de excecao 1/7 aplicada: quando o regente cai na propria casa ou na 7a, o pada e deslocado para a 10a a partir da casa-base.`;
  }

  return {
    key: `A${houseNumber}`,
    houseNumber,
    houseLabel: getHouseLabel(houseNumber),
    signIndex: resultSignIndex,
    signName: SIGN_NAMES[resultSignIndex],
    houseFromLagna: signDistance(snapshot.ascendant.signIndex, resultSignIndex) + 1,
    lordKey: lord.key,
    lordLabel: lord.label,
    lordSignName: lordPoint.signName,
    distance,
    adjustmentApplied,
    note,
  };
}

export function calculateArudhaSet(snapshot: VedicSnapshot) {
  return Array.from({ length: 12 }, (_, index) =>
    calculateArudhaForHouse(snapshot, index + 1)
  ).filter((entry): entry is ArudhaPoint => Boolean(entry));
}
