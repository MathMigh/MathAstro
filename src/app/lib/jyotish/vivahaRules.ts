import type { VedicPoint, VedicSnapshot } from "../vedic";
import { signDistance } from "./engineHelpers";
import type { JyotishConfig } from "./types";

export interface KootaFactorResult {
  key: string;
  label: string;
  score: number;
  max: number;
  note: string;
}

export interface KujaAssessment {
  subject: string;
  houses: {
    fromLagna: number;
    fromMoon: number;
    fromVenus: number;
  };
  triggeredFrom: string[];
  activeTriggers: string[];
  cancelledTriggers: string[];
  mitigations: string[];
  cancellations: string[];
  triggerCount: number;
  effectiveTriggerCount: number;
  mitigationCount: number;
  severity: "none" | "mild" | "moderate" | "strong";
}

export interface SupplementalVivahaFactor {
  key: string;
  label: string;
  score: number;
  max: number;
  note: string;
}

export interface MahendraAssessment extends SupplementalVivahaFactor {
  direction: string;
  reverseDirection: string;
  count: number;
  reverseCount: number;
}

export interface StriDeerghaAssessment extends SupplementalVivahaFactor {
  direction: string;
  count: number;
}

export interface RajjuAssessment extends SupplementalVivahaFactor {
  firstGroup: string;
  secondGroup: string;
  firstTrack: string;
  secondTrack: string;
  firstPada: number;
  secondPada: number;
  samePada: boolean;
  severity: "low" | "medium" | "high";
  antidoteNotes: string[];
  schoolNotes: string[];
  reliefNotes: string[];
  state: "clear" | "relieved" | "blocked";
}

export interface VedhaAssessment extends SupplementalVivahaFactor {
  blocked: boolean;
  pairType: "none" | "direct" | "clustered";
  firstPada: number;
  secondPada: number;
  samePada: boolean;
  severity: "low" | "medium" | "high";
  antidoteNotes: string[];
  schoolNotes: string[];
  reliefNotes: string[];
  state: "clear" | "relieved" | "blocked";
}

export interface SupplementalVivahaBundle {
  factors: SupplementalVivahaFactor[];
  mahendra: MahendraAssessment;
  striDeergha: StriDeerghaAssessment;
  rajju: RajjuAssessment;
  vedha: VedhaAssessment;
}

interface NakshatraProfile {
  gana: "Deva" | "Manushya" | "Rakshasa";
  yoni: string;
  nadi: "Adi" | "Madhya" | "Antya";
}

const NAKSHATRA_PROFILES: NakshatraProfile[] = [
  { gana: "Deva", yoni: "Horse", nadi: "Adi" },
  { gana: "Manushya", yoni: "Elephant", nadi: "Madhya" },
  { gana: "Rakshasa", yoni: "Sheep", nadi: "Antya" },
  { gana: "Manushya", yoni: "Serpent", nadi: "Antya" },
  { gana: "Deva", yoni: "Serpent", nadi: "Madhya" },
  { gana: "Manushya", yoni: "Dog", nadi: "Adi" },
  { gana: "Deva", yoni: "Cat", nadi: "Adi" },
  { gana: "Deva", yoni: "Sheep", nadi: "Madhya" },
  { gana: "Rakshasa", yoni: "Cat", nadi: "Antya" },
  { gana: "Rakshasa", yoni: "Rat", nadi: "Antya" },
  { gana: "Manushya", yoni: "Rat", nadi: "Adi" },
  { gana: "Manushya", yoni: "Cow", nadi: "Adi" },
  { gana: "Deva", yoni: "Buffalo", nadi: "Madhya" },
  { gana: "Rakshasa", yoni: "Tiger", nadi: "Madhya" },
  { gana: "Deva", yoni: "Buffalo", nadi: "Antya" },
  { gana: "Rakshasa", yoni: "Tiger", nadi: "Antya" },
  { gana: "Deva", yoni: "Deer", nadi: "Madhya" },
  { gana: "Rakshasa", yoni: "Deer", nadi: "Adi" },
  { gana: "Rakshasa", yoni: "Dog", nadi: "Adi" },
  { gana: "Manushya", yoni: "Monkey", nadi: "Madhya" },
  { gana: "Manushya", yoni: "Mongoose", nadi: "Antya" },
  { gana: "Deva", yoni: "Monkey", nadi: "Antya" },
  { gana: "Rakshasa", yoni: "Lion", nadi: "Madhya" },
  { gana: "Rakshasa", yoni: "Horse", nadi: "Adi" },
  { gana: "Manushya", yoni: "Lion", nadi: "Adi" },
  { gana: "Manushya", yoni: "Cow", nadi: "Madhya" },
  { gana: "Deva", yoni: "Elephant", nadi: "Antya" },
];

const VARNA_BY_SIGN = [
  "Kshatriya",
  "Vaishya",
  "Shudra",
  "Brahmin",
  "Kshatriya",
  "Vaishya",
  "Shudra",
  "Brahmin",
  "Kshatriya",
  "Vaishya",
  "Shudra",
  "Brahmin",
] as const;

const VASHYA_BY_SIGN = [
  "Quadruped",
  "Quadruped",
  "Human",
  "Water",
  "Wild",
  "Human",
  "Human",
  "Insect",
  "Quadruped",
  "Water",
  "Human",
  "Water",
] as const;

const SIGN_LORDS = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
] as const;

const NATURAL_RELATIONS: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  Sun: {
    friends: ["Moon", "Mars", "Jupiter"],
    neutrals: ["Mercury"],
    enemies: ["Venus", "Saturn"],
  },
  Moon: {
    friends: ["Sun", "Mercury"],
    neutrals: ["Mars", "Jupiter", "Venus", "Saturn"],
    enemies: [],
  },
  Mars: {
    friends: ["Sun", "Moon", "Jupiter"],
    neutrals: ["Venus", "Saturn"],
    enemies: ["Mercury"],
  },
  Mercury: {
    friends: ["Sun", "Venus"],
    neutrals: ["Mars", "Jupiter", "Saturn"],
    enemies: ["Moon"],
  },
  Jupiter: {
    friends: ["Sun", "Moon", "Mars"],
    neutrals: ["Saturn"],
    enemies: ["Mercury", "Venus"],
  },
  Venus: {
    friends: ["Mercury", "Saturn"],
    neutrals: ["Mars", "Jupiter"],
    enemies: ["Sun", "Moon"],
  },
  Saturn: {
    friends: ["Mercury", "Venus"],
    neutrals: ["Jupiter"],
    enemies: ["Sun", "Moon", "Mars"],
  },
};

const YONI_ENEMIES = new Set([
  "Cat|Rat",
  "Cow|Tiger",
  "Dog|Deer",
  "Elephant|Lion",
  "Horse|Buffalo",
  "Monkey|Sheep",
  "Mongoose|Serpent",
]);

const RAJJU_PROFILES = [
  { group: "Pada", track: "Aroha" },
  { group: "Ooru", track: "Aroha" },
  { group: "Nabhi", track: "Aroha" },
  { group: "Kantha", track: "Aroha" },
  { group: "Shirsha", track: "Siro" },
  { group: "Kantha", track: "Avaroha" },
  { group: "Nabhi", track: "Avaroha" },
  { group: "Ooru", track: "Avaroha" },
  { group: "Pada", track: "Avaroha" },
  { group: "Pada", track: "Aroha" },
  { group: "Ooru", track: "Aroha" },
  { group: "Nabhi", track: "Aroha" },
  { group: "Kantha", track: "Aroha" },
  { group: "Shirsha", track: "Siro" },
  { group: "Kantha", track: "Avaroha" },
  { group: "Nabhi", track: "Avaroha" },
  { group: "Ooru", track: "Avaroha" },
  { group: "Pada", track: "Avaroha" },
  { group: "Pada", track: "Aroha" },
  { group: "Ooru", track: "Aroha" },
  { group: "Nabhi", track: "Aroha" },
  { group: "Kantha", track: "Aroha" },
  { group: "Shirsha", track: "Siro" },
  { group: "Kantha", track: "Avaroha" },
  { group: "Nabhi", track: "Avaroha" },
  { group: "Ooru", track: "Avaroha" },
  { group: "Pada", track: "Avaroha" },
] as const;

const MAHENDRA_COUNTS = new Set([4, 7, 10, 13, 16, 19, 22, 25]);
const VEDHA_PAIRS = new Map<number, number[]>([
  [0, [17]],
  [1, [16]],
  [2, [15]],
  [3, [14]],
  [4, [13, 22]],
  [5, [21]],
  [6, [20]],
  [7, [19]],
  [8, [18]],
  [9, [26]],
  [10, [25]],
  [11, [24]],
  [12, [23]],
  [13, [4, 22]],
  [14, [3]],
  [15, [2]],
  [16, [1]],
  [17, [0]],
  [18, [8]],
  [19, [7]],
  [20, [6]],
  [21, [5]],
  [22, [4, 13]],
  [23, [12]],
  [24, [11]],
  [25, [10]],
  [26, [9]],
]);

function pairKey(left: string, right: string) {
  return [left, right].sort().join("|");
}

function cycleDistance(fromIndex: number, toIndex: number, size: number) {
  return ((toIndex - fromIndex) % size + size) % size;
}

function getProfile(point: VedicPoint) {
  return NAKSHATRA_PROFILES[point.nakshatraIndex] ?? NAKSHATRA_PROFILES[0];
}

function getSignLord(point: VedicPoint) {
  return SIGN_LORDS[point.signIndex];
}

function getRelation(left: string, right: string) {
  if (left === right) {
    return "same";
  }

  if (NATURAL_RELATIONS[left].friends.includes(right) && NATURAL_RELATIONS[right].friends.includes(left)) {
    return "mutual-friend";
  }

  if (NATURAL_RELATIONS[left].enemies.includes(right) && NATURAL_RELATIONS[right].enemies.includes(left)) {
    return "mutual-enemy";
  }

  if (
    NATURAL_RELATIONS[left].friends.includes(right) ||
    NATURAL_RELATIONS[right].friends.includes(left)
  ) {
    return "one-sided-friend";
  }

  if (
    NATURAL_RELATIONS[left].enemies.includes(right) ||
    NATURAL_RELATIONS[right].enemies.includes(left)
  ) {
    return "one-sided-enemy";
  }

  return "neutral";
}

function getRajjuProfile(point: VedicPoint) {
  return RAJJU_PROFILES[point.nakshatraIndex] ?? RAJJU_PROFILES[0];
}

function buildMoonSignReliefs(firstMoon: VedicPoint, secondMoon: VedicPoint) {
  const notes: string[] = [];
  const firstLord = getSignLord(firstMoon);
  const secondLord = getSignLord(secondMoon);

  if (firstLord === secondLord) {
    notes.push(`Ekadhipati entre ${firstMoon.signName} e ${secondMoon.signName} pelo mesmo regente (${firstLord}).`);
  } else {
    const relation = getRelation(firstLord, secondLord);
    if (relation === "mutual-friend" || relation === "one-sided-friend") {
      notes.push(`Regentes lunares em amizade natural (${firstLord} x ${secondLord}).`);
    }
  }

  if (cycleDistance(firstMoon.signIndex, secondMoon.signIndex, 12) + 1 === 7) {
    notes.push("Janma Rashis em samasaptama (7/7), alivio citado em manuais de matching.");
  }

  return notes;
}

function getFactor(
  factors: KootaFactorResult[],
  key: string
) {
  return factors.find((factor) => factor.key === key);
}

function buildMatchingAntidotes(
  firstMoon: VedicPoint,
  secondMoon: VedicPoint,
  factors: KootaFactorResult[]
) {
  const notes = buildMoonSignReliefs(firstMoon, secondMoon);
  const tara = getFactor(factors, "tara");
  const maitri = getFactor(factors, "graha-maitri");
  const nadi = getFactor(factors, "nadi");
  const yoni = getFactor(factors, "yoni");

  if (tara && tara.score >= 1.5) {
    notes.push(`Dina/Tara bala em ${tara.score}/${tara.max} entra como antidoto parcial de fluxo lunar.`);
  }

  if (maitri && maitri.score >= 4) {
    notes.push(`Graha Maitri em ${maitri.score}/${maitri.max} sustenta amizade entre os regentes lunares.`);
  }

  if (nadi && nadi.score === nadi.max) {
    notes.push("Nadi distinto evita a sobreposicao mais dura desta malha de matching.");
  }

  if (yoni && yoni.score >= 3) {
    notes.push(`Yoni sem inimizade direta (${yoni.score}/${yoni.max}) ajuda a amortecer o atrito.`);
  }

  return dedupe(notes);
}

function aspectOffsetsFor(pointKey: string) {
  if (pointKey === "mars") {
    return [4, 7, 8];
  }

  if (pointKey === "jupiter") {
    return [5, 7, 9];
  }

  if (pointKey === "saturn") {
    return [3, 7, 10];
  }

  if (pointKey === "northNode" || pointKey === "southNode") {
    return [5, 7, 9];
  }

  return [7];
}

function doesGrahaAspect(source: VedicPoint, target: VedicPoint) {
  const distance = signDistance(source.signIndex, target.signIndex) + 1;
  return aspectOffsetsFor(source.key).includes(distance);
}

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

function axisLabel(axis: keyof KujaAssessment["houses"]) {
  return axis.replace("from", "");
}

function houseSpecificKujaCancellation(house: number, signIndex: number) {
  if (house === 2 && [2, 5].includes(signIndex)) {
    return "2a casa em signo de Budha (Mithuna/Kanya) segue excecao classica amplamente usada.";
  }

  if (house === 4 && [0, 7].includes(signIndex)) {
    return "4a casa em signo proprio de Mangala (Mesha/Vrischika) cancela a leitura severa neste eixo.";
  }

  if (house === 7 && [3, 9].includes(signIndex)) {
    return "7a casa em Karka/Makara entra na faixa de cancelamento citada em escolas de matching.";
  }

  if (house === 8 && [8, 11].includes(signIndex)) {
    return "8a casa em signo de Guru (Dhanu/Meena) entra na excecao de longevidade conjugal.";
  }

  if (house === 12 && [1, 6].includes(signIndex)) {
    return "12a casa em signo de Shukra (Vrishabha/Tula) suaviza a leitura de perdas e cama.";
  }

  return undefined;
}

function getTaraScore(first: VedicPoint, second: VedicPoint) {
  const forwardIndex = cycleDistance(first.nakshatraIndex, second.nakshatraIndex, 27) % 9;
  const backwardIndex = cycleDistance(second.nakshatraIndex, first.nakshatraIndex, 27) % 9;
  const supportive = [1, 3, 5, 7, 8];
  const forwardGood = supportive.includes(forwardIndex);
  const backwardGood = supportive.includes(backwardIndex);
  const score = forwardGood && backwardGood ? 3 : forwardGood || backwardGood ? 1.5 : 0;
  return {
    score,
    note: `Fluxo ${forwardIndex + 1}/${backwardIndex + 1} no ciclo de 9 taras entre os nakshatras lunares.`,
  };
}

function getVarnaScore(
  first: VedicPoint,
  second: VedicPoint,
  mode: JyotishConfig["ashtaKootaMode"]
) {
  const firstVarna = VARNA_BY_SIGN[first.signIndex];
  const secondVarna = VARNA_BY_SIGN[second.signIndex];
  const score = firstVarna === secondVarna ? 1 : mode === "southern-adjusted" ? 0.75 : 0.5;
  return {
    score,
    note: `${firstVarna} x ${secondVarna} no recorte de signos lunares (${mode}).`,
  };
}

function getVashyaScore(
  first: VedicPoint,
  second: VedicPoint,
  mode: JyotishConfig["ashtaKootaMode"]
) {
  const firstVashya = VASHYA_BY_SIGN[first.signIndex];
  const secondVashya = VASHYA_BY_SIGN[second.signIndex];

  let score = 0;
  if (firstVashya === secondVashya) {
    score = 2;
  } else if (
    pairKey(firstVashya, secondVashya) === pairKey("Human", "Quadruped") ||
    pairKey(firstVashya, secondVashya) === pairKey("Quadruped", "Wild") ||
    pairKey(firstVashya, secondVashya) === pairKey("Water", "Quadruped") ||
    pairKey(firstVashya, secondVashya) === pairKey("Water", "Insect")
  ) {
    score = 1;
  } else if (mode === "southern-adjusted") {
    score = 0.5;
  }

  return {
    score,
    note: `${firstVashya} x ${secondVashya} na grade vashya do motor atual (${mode}).`,
  };
}

function getYoniScore(
  first: VedicPoint,
  second: VedicPoint,
  mode: JyotishConfig["ashtaKootaMode"]
) {
  const firstYoni = getProfile(first).yoni;
  const secondYoni = getProfile(second).yoni;
  let score = 2;

  if (firstYoni === secondYoni) {
    score = 4;
  } else if (YONI_ENEMIES.has(pairKey(firstYoni, secondYoni))) {
    score = mode === "southern-adjusted" ? 1 : 0;
  } else if (mode === "southern-adjusted") {
    score = 3;
  }

  return {
    score,
    note: `${firstYoni} x ${secondYoni} na malha yoni atual (${mode}).`,
  };
}

function getGrahaMaitriScore(first: VedicPoint, second: VedicPoint) {
  const firstLord = getSignLord(first);
  const secondLord = getSignLord(second);
  const relation = getRelation(firstLord, secondLord);
  const scoreByRelation = {
    same: 5,
    "mutual-friend": 5,
    neutral: 3,
    "one-sided-friend": 4,
    "one-sided-enemy": 1,
    "mutual-enemy": 0,
  } as const;

  return {
    score: scoreByRelation[relation],
    note: `${firstLord} x ${secondLord} na amizade natural entre senhores dos signos lunares.`,
  };
}

function getMahendraFactor(
  firstMoon: VedicPoint,
  secondMoon: VedicPoint,
  firstLabel: string,
  secondLabel: string,
  firstGender?: VedicSnapshot["gender"],
  secondGender?: VedicSnapshot["gender"]
): MahendraAssessment {
  let from = firstMoon;
  let to = secondMoon;
  let fromLabel = firstLabel;
  let toLabel = secondLabel;

  if (firstGender === "male" && secondGender === "female") {
    from = secondMoon;
    to = firstMoon;
    fromLabel = secondLabel;
    toLabel = firstLabel;
  }

  const count = cycleDistance(from.nakshatraIndex, to.nakshatraIndex, 27) + 1;
  const reverseCount = cycleDistance(to.nakshatraIndex, from.nakshatraIndex, 27) + 1;
  const classicalHit = MAHENDRA_COUNTS.has(count);
  const reverseHit = MAHENDRA_COUNTS.has(reverseCount);
  const direction = `${fromLabel}->${toLabel}`;
  const reverseDirection = `${toLabel}->${fromLabel}`;

  return {
    key: "mahendra",
    label: "Mahendra",
    score: classicalHit ? 2 : reverseHit ? 1 : 0,
    max: 2,
    note: classicalHit
      ? `Contagem ${direction}: ${count}. O working set prioriza o fluxo feminino->masculino quando o genero esta disponivel e marca 4/7/10/13/16/19/22/25 como Mahendra classico.`
      : reverseHit
        ? `Contagem ${direction}: ${count}. O fluxo principal nao fecha Mahendra classico, mas o retorno ${reverseDirection}: ${reverseCount} cai na serie 4/7/10/13/16/19/22/25 e entra apenas como apoio secundario.`
        : `Contagem ${direction}: ${count}; retorno ${reverseDirection}: ${reverseCount}. Nenhum dos fluxos cai na serie 4/7/10/13/16/19/22/25 usada nesta versao.`,
    direction,
    reverseDirection,
    count,
    reverseCount,
  };
}

function getStriDeerghaFactor(
  firstMoon: VedicPoint,
  secondMoon: VedicPoint,
  firstLabel: string,
  secondLabel: string,
  firstGender?: VedicSnapshot["gender"],
  secondGender?: VedicSnapshot["gender"]
): StriDeerghaAssessment {
  let from = firstMoon;
  let to = secondMoon;
  let direction = `${firstLabel}->${secondLabel}`;

  if (firstGender === "male" && secondGender === "female") {
    from = secondMoon;
    to = firstMoon;
    direction = `${secondLabel}->${firstLabel}`;
  } else if (firstGender === "female" && secondGender === "male") {
    from = firstMoon;
    to = secondMoon;
    direction = `${firstLabel}->${secondLabel}`;
  }

  const count = cycleDistance(from.nakshatraIndex, to.nakshatraIndex, 27) + 1;
  return {
    key: "stri-deergha",
    label: "Stri Deergha",
    score: count >= 13 ? 2 : count >= 7 ? 1 : 0,
    max: 2,
    note: `Contagem ${direction}: ${count} nakshatras. O motor usa a direcao feminina->masculina quando o genero esta disponivel; sem isso, preserva Pessoa A->Pessoa B.`,
    direction,
    count,
  };
}

function getRajjuFactor(
  firstMoon: VedicPoint,
  secondMoon: VedicPoint,
  factors: KootaFactorResult[]
): RajjuAssessment {
  const firstRajju = getRajjuProfile(firstMoon);
  const secondRajju = getRajjuProfile(secondMoon);
  const sameRajju = firstRajju.group === secondRajju.group;
  const oppositeTracks =
    firstRajju.track !== "Siro" &&
    secondRajju.track !== "Siro" &&
    firstRajju.track !== secondRajju.track;
  const samePada = firstMoon.pada === secondMoon.pada;
  const antidoteNotes = sameRajju ? buildMatchingAntidotes(firstMoon, secondMoon, factors) : [];
  const reliefNotes = antidoteNotes;
  const relieved = sameRajju && oppositeTracks && reliefNotes.length > 0 && !samePada;
  const severity =
    !sameRajju
      ? "low"
      : relieved
        ? "low"
        : firstRajju.group === "Shirsha" || samePada || !oppositeTracks
          ? "high"
          : "medium";
  const schoolNotes: string[] = [];

  if (sameRajju) {
    schoolNotes.push("Leitura linear: mesmo Rajju continua sendo um bloqueio tecnico na escola base.");

    if (oppositeTracks) {
      schoolNotes.push("Gate Aroha/Avaroha abriu trilhas opostas entre os dois nakshatras.");
    }

    if (samePada) {
      schoolNotes.push("Mesmo pada lunar segura a cautela em patamar alto neste working set.");
    }

    if (antidoteNotes.length > 0) {
      schoolNotes.push("Dina/Tara, Graha Maitri, Nadi e Yoni entram apenas como alivio, nao como liberacao total.");
    }
  } else {
    schoolNotes.push("Rajjus distintos deixam o par fora da restricao principal neste recorte.");
  }

  return {
    key: "rajju",
    label: "Rajju v2",
    score: sameRajju ? (relieved ? 1 : 0) : 2,
    max: 2,
    note: sameRajju
      ? relieved
        ? `${firstRajju.group} x ${secondRajju.group} no mesmo Rajju, com trilhas ${firstRajju.track}/${secondRajju.track}, padas ${firstMoon.pada}/${secondMoon.pada} e antidotos classicos ativos. O motor trata como Rajju aliviado, nao como liberacao plena.`
        : `${firstRajju.group} x ${secondRajju.group} no mesmo Rajju (${firstRajju.track}/${secondRajju.track}, padas ${firstMoon.pada}/${secondMoon.pada}). Sem gate suficiente para liberar o eixo, segue como cautela tecnica.`
      : `${firstRajju.group} x ${secondRajju.group} em Rajjus distintos; a malha Aroha/Avaroha e os antidotos ficam reservados apenas para casos de mesmo Rajju.`,
    firstGroup: firstRajju.group,
    secondGroup: secondRajju.group,
    firstTrack: firstRajju.track,
    secondTrack: secondRajju.track,
    firstPada: firstMoon.pada,
    secondPada: secondMoon.pada,
    samePada,
    severity,
    antidoteNotes,
    schoolNotes,
    reliefNotes,
    state: sameRajju ? (relieved ? "relieved" : "blocked") : "clear",
  };
}

function getVedhaFactor(
  firstMoon: VedicPoint,
  secondMoon: VedicPoint,
  factors: KootaFactorResult[]
): VedhaAssessment {
  const directTargets = VEDHA_PAIRS.get(firstMoon.nakshatraIndex) ?? [];
  const reverseTargets = VEDHA_PAIRS.get(secondMoon.nakshatraIndex) ?? [];
  const blocked = directTargets.includes(secondMoon.nakshatraIndex);
  const samePada = firstMoon.pada === secondMoon.pada;
  const pairType = blocked
    ? directTargets.length > 1 || reverseTargets.length > 1
      ? "clustered"
      : "direct"
    : "none";
  const antidoteNotes = blocked ? buildMatchingAntidotes(firstMoon, secondMoon, factors) : [];
  const reliefNotes = antidoteNotes;
  const relieved = blocked && reliefNotes.length > 0 && !samePada;
  const severity =
    !blocked
      ? "low"
      : relieved
        ? pairType === "clustered"
          ? "medium"
          : "low"
        : pairType === "clustered" || samePada
          ? "high"
          : "medium";
  const schoolNotes: string[] = [];

  if (blocked) {
    schoolNotes.push(
      pairType === "clustered"
        ? "O par cai numa malha de Vedha com cluster de tres pontos, exigindo mais cautela."
        : "O par cai em Vedha direto de nakshatra para nakshatra na malha ativa."
    );

    if (samePada) {
      schoolNotes.push("Mesmo pada lunar fecha a ressonancia de Vedha de forma mais apertada nesta leitura.");
    }

    if (antidoteNotes.length > 0) {
      schoolNotes.push("Os antidotos classicos entram como reducao parcial do atrito, nao como anulacao.");
    }
  } else {
    schoolNotes.push("Nao houve Vedha direto na malha nakshatra-nakshatra usada pelo modulo.");
  }

  return {
    key: "vedha",
    label: "Vedha",
    score: blocked ? (relieved ? 1 : 0) : 2,
    max: 2,
    note: blocked
      ? relieved
        ? `${firstMoon.nakshatra} x ${secondMoon.nakshatra} cai em Vedha ${pairType === "clustered" ? "em cluster" : "direto"}, mas o motor registra antidotos classicos e trata como conflito reduzido.`
        : `${firstMoon.nakshatra} x ${secondMoon.nakshatra} cai em Vedha ${pairType === "clustered" ? "em cluster" : "direto"} na malha nakshatra-nakshatra usada nesta versao.`
      : `${firstMoon.nakshatra} x ${secondMoon.nakshatra} nao cai em par Vedha direto na malha usada pelo modulo.`,
    blocked,
    pairType,
    firstPada: firstMoon.pada,
    secondPada: secondMoon.pada,
    samePada,
    severity,
    antidoteNotes,
    schoolNotes,
    reliefNotes,
    state: blocked ? (relieved ? "relieved" : "blocked") : "clear",
  };
}

function getGanaScore(
  first: VedicPoint,
  second: VedicPoint,
  mode: JyotishConfig["ashtaKootaMode"]
) {
  const firstGana = getProfile(first).gana;
  const secondGana = getProfile(second).gana;
  let score = 0;

  if (firstGana === secondGana) {
    score = 6;
  } else if (pairKey(firstGana, secondGana) === pairKey("Deva", "Manushya")) {
    score = 5;
  } else if (pairKey(firstGana, secondGana) === pairKey("Manushya", "Rakshasa")) {
    score = mode === "southern-adjusted" ? 2 : 1;
  } else if (mode === "southern-adjusted") {
    score = 1;
  }

  return {
    score,
    note: `${firstGana} x ${secondGana} na triagem de gana (${mode}).`,
  };
}

function getBhakootScore(
  first: VedicPoint,
  second: VedicPoint,
  mode: JyotishConfig["ashtaKootaMode"]
) {
  const forward = signDistance(first.signIndex, second.signIndex) + 1;
  const reverse = signDistance(second.signIndex, first.signIndex) + 1;
  const adversePairs = new Set(["2-12", "5-9", "6-8"]);
  const pair = `${Math.min(forward, reverse)}-${Math.max(forward, reverse)}`;
  const score = adversePairs.has(pair) ? (mode === "southern-adjusted" ? 4 : 0) : 7;
  return {
    score,
    note: `Relacao ${forward}/${reverse} entre os signos lunares no criterio Bhakoot (${mode}).`,
  };
}

function getNadiScore(
  first: VedicPoint,
  second: VedicPoint,
  mode: JyotishConfig["ashtaKootaMode"]
) {
  const firstNadi = getProfile(first).nadi;
  const secondNadi = getProfile(second).nadi;
  const score = firstNadi === secondNadi ? (mode === "southern-adjusted" ? 4 : 0) : 8;
  return {
    score,
    note: `${firstNadi} x ${secondNadi} no crivo de Nadi (${mode}).`,
  };
}

function marsHouses(snapshot: VedicSnapshot) {
  const mars = snapshot.planets.find((point) => point.key === "mars") ?? snapshot.ascendant;
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const venus = snapshot.planets.find((point) => point.key === "venus") ?? snapshot.ascendant;

  return {
    mars,
    houses: {
      fromLagna: signDistance(snapshot.ascendant.signIndex, mars.signIndex) + 1,
      fromMoon: signDistance(moon.signIndex, mars.signIndex) + 1,
      fromVenus: signDistance(venus.signIndex, mars.signIndex) + 1,
    },
  };
}

function kujaMitigations(
  snapshot: VedicSnapshot,
  mars: VedicPoint,
  houses: KujaAssessment["houses"],
  rules: JyotishConfig["kujaDoshaRules"]
) {
  const mitigations: string[] = [];

  if (mars.signIndex === 3) {
    mitigations.push("Mangala em Karka entra como redutor debatido entre escolas, nao como cancelamento automatico.");
  }

  if ([3, 4].includes(snapshot.ascendant.signIndex)) {
    mitigations.push("Lagna em Karka/Simha deixa Mangala mais proximo do papel yogakaraka no recorte lagna-based.");
  }

  if ((snapshot.planets.find((point) => point.key === "jupiter") ?? snapshot.ascendant).house === 1) {
    mitigations.push("Guru no Lagna entra como apoio classico a estabilidade do mapa.");
  }

  if ((snapshot.planets.find((point) => point.key === "venus") ?? snapshot.ascendant).house === 1) {
    mitigations.push("Shukra no Lagna suaviza a secura marciana na leitura de matching.");
  }

  if (rules !== "classical-strict" && houses.fromMoon === houses.fromVenus) {
    mitigations.push("Sobreposicao entre eixos da Lua e Venus reduz redundancia no critero atual.");
  }

  if (rules === "relaxed-modern" && houses.fromLagna === 1) {
    mitigations.push("Modo relaxado moderno trata Mangala no proprio Lagna com filtro contextual, nao condenatorio.");
  }

  return mitigations;
}

export function buildAshtaKootaFactors(
  firstMoon: VedicPoint,
  secondMoon: VedicPoint,
  mode: JyotishConfig["ashtaKootaMode"]
): KootaFactorResult[] {
  const varna = getVarnaScore(firstMoon, secondMoon, mode);
  const vashya = getVashyaScore(firstMoon, secondMoon, mode);
  const tara = getTaraScore(firstMoon, secondMoon);
  const yoni = getYoniScore(firstMoon, secondMoon, mode);
  const maitri = getGrahaMaitriScore(firstMoon, secondMoon);
  const gana = getGanaScore(firstMoon, secondMoon, mode);
  const bhakoot = getBhakootScore(firstMoon, secondMoon, mode);
  const nadi = getNadiScore(firstMoon, secondMoon, mode);

  return [
    { key: "varna", label: "Varna", max: 1, score: varna.score, note: varna.note },
    { key: "vashya", label: "Vashya", max: 2, score: vashya.score, note: vashya.note },
    { key: "tara", label: "Tara", max: 3, score: tara.score, note: tara.note },
    { key: "yoni", label: "Yoni", max: 4, score: yoni.score, note: yoni.note },
    { key: "graha-maitri", label: "Graha Maitri", max: 5, score: maitri.score, note: maitri.note },
    { key: "gana", label: "Gana", max: 6, score: gana.score, note: gana.note },
    { key: "bhakoot", label: "Bhakoot", max: 7, score: bhakoot.score, note: bhakoot.note },
    { key: "nadi", label: "Nadi", max: 8, score: nadi.score, note: nadi.note },
  ];
}

export function buildKujaAssessments(
  firstLabel: string,
  firstSnapshot: VedicSnapshot,
  secondLabel: string,
  secondSnapshot: VedicSnapshot,
  rules: JyotishConfig["kujaDoshaRules"]
): {
  rows: KujaAssessment[];
  combinedNote: string;
  sharedAxes: string[];
  symmetry: "balanced" | "partially-balanced" | "asymmetric";
  mitigationCoverage: "high" | "medium" | "low";
  mutualCancellation: "full" | "partial" | "none";
} {
  const first = marsHouses(firstSnapshot);
  const second = marsHouses(secondSnapshot);

  const triggerSets: Record<JyotishConfig["kujaDoshaRules"], number[]> = {
    "classical-strict": [1, 2, 4, 7, 8, 12],
    "south-indian-mixed": [1, 2, 4, 7, 8, 12],
    "relaxed-modern": [2, 4, 7, 8, 12],
  };

  const toAssessment = (
    subject: string,
    snapshot: VedicSnapshot,
    mars: VedicPoint,
    houses: KujaAssessment["houses"]
  ): KujaAssessment => {
    const rawTriggeredAxes = (Object.entries(houses) as Array<
      [keyof KujaAssessment["houses"], number]
    >)
      .filter(([axis, house]) => {
        if (rules === "relaxed-modern" && axis === "fromVenus") {
          return false;
        }
        return triggerSets[rules].includes(house);
      });
    const triggeredFrom = rawTriggeredAxes.map(([axis]) => axisLabel(axis));
    const globalCancellations: string[] = [];
    const axisCancellations: string[] = [];
    const cancelledTriggers = new Set<string>();
    const beneficSupporters = ["jupiter", "moon", "mercury"]
      .map((key) => snapshot.planets.find((point) => point.key === key))
      .filter((point): point is VedicPoint => Boolean(point))
      .filter((point) => point.signIndex === mars.signIndex || doesGrahaAspect(point, mars));

    if ([0, 7].includes(mars.signIndex)) {
      globalCancellations.push("Mangala em signo proprio (Mesha/Vrischika) entra como cancelamento forte.");
    }

    if (mars.signIndex === 9) {
      globalCancellations.push("Mangala exaltado em Makara entra como cancelamento forte.");
    }

    if (mars.signIndex === 4 || mars.signIndex === 10) {
      globalCancellations.push("Mangala em Simha/Kumbha entra no blanket exception B.V. Raman-like usado nesta versao.");
    }

    if (beneficSupporters.length > 0) {
      globalCancellations.push(
        `Mangala recebe apoio direto de ${beneficSupporters.map((point) => point.name).join(", ")} por conjuncao/aspecto.`
      );
    }

    rawTriggeredAxes.forEach(([axis, sourceHouse]) => {
      const houseCancellation = houseSpecificKujaCancellation(sourceHouse, mars.signIndex);
      if (houseCancellation) {
        cancelledTriggers.add(axisLabel(axis));
        axisCancellations.push(`${axisLabel(axis)}: ${houseCancellation}`);
      }
    });

    if (globalCancellations.length > 0) {
      triggeredFrom.forEach((axis) => cancelledTriggers.add(axis));
    }

    const activeTriggers = triggeredFrom.filter((axis) => !cancelledTriggers.has(axis));
    const mitigations = kujaMitigations(snapshot, mars, houses, rules);
    const cancellations = dedupe([...globalCancellations, ...axisCancellations]);
    const effectiveTriggerCount = activeTriggers.length;
    const severity =
      effectiveTriggerCount === 0
        ? "none"
        : effectiveTriggerCount === 1
          ? "mild"
          : effectiveTriggerCount === 2
            ? "moderate"
            : "strong";

    return {
      subject,
      houses,
      triggeredFrom,
      activeTriggers,
      cancelledTriggers: Array.from(cancelledTriggers),
      mitigations: dedupe(mitigations),
      cancellations: dedupe(cancellations),
      triggerCount: triggeredFrom.length,
      effectiveTriggerCount,
      mitigationCount: dedupe([...mitigations, ...cancellations]).length,
      severity,
    };
  };

  const rows = [
    toAssessment(firstLabel, firstSnapshot, first.mars, first.houses),
    toAssessment(secondLabel, secondSnapshot, second.mars, second.houses),
  ];

  const sharedAxes = rows[0].activeTriggers.filter((axis) => rows[1].activeTriggers.includes(axis));
  const bothTriggered = rows.every((row) => row.triggeredFrom.length > 0);
  const bothActive = rows.every((row) => row.effectiveTriggerCount > 0);
  const triggerGap = Math.abs(rows[0].effectiveTriggerCount - rows[1].effectiveTriggerCount);
  const totalMitigations = rows.reduce((sum, row) => sum + row.mitigationCount, 0);
  const symmetry =
    rows[0].effectiveTriggerCount === rows[1].effectiveTriggerCount && rows[0].effectiveTriggerCount > 0
      ? "balanced"
      : bothActive || sharedAxes.length > 0 || triggerGap <= 1
        ? "partially-balanced"
        : "asymmetric";
  const mutualCancellation =
    bothTriggered && rows.every((row) => row.triggerCount === row.effectiveTriggerCount)
      ? rows[0].triggerCount === rows[1].triggerCount
        ? "full"
        : "partial"
      : bothTriggered
        ? "partial"
        : "none";
  const mitigationCoverage =
    totalMitigations >= 4 ? "high" : totalMitigations >= 2 ? "medium" : "low";

  return {
    rows,
    combinedNote: bothTriggered
      ? `Os dois mapas mostram Kuja bruto em pelo menos um eixo; apos cancelamentos fortes e mitigacoes, a simetria ficou ${symmetry}, o cancelamento mutuo ficou ${mutualCancellation} e a cobertura mitigadora ficou ${mitigationCoverage} no modo ${rules}.`
      : `O motor destaca Kuja Dosha como triagem tecnica no modo ${rules}; apos cancelamentos fortes, a simetria ficou ${symmetry} com cobertura mitigadora ${mitigationCoverage}.`,
    sharedAxes,
    symmetry,
    mitigationCoverage,
    mutualCancellation,
  };
}

export function buildSupplementalVivahaFactors(
  firstLabel: string,
  firstSnapshot: VedicSnapshot,
  secondLabel: string,
  secondSnapshot: VedicSnapshot,
  factors: KootaFactorResult[]
): SupplementalVivahaBundle {
  const firstMoon =
    firstSnapshot.planets.find((point) => point.key === "moon") ?? firstSnapshot.ascendant;
  const secondMoon =
    secondSnapshot.planets.find((point) => point.key === "moon") ?? secondSnapshot.ascendant;
  const mahendra = getMahendraFactor(
    firstMoon,
    secondMoon,
    firstLabel,
    secondLabel,
    firstSnapshot.gender,
    secondSnapshot.gender
  );
  const striDeergha = getStriDeerghaFactor(
    firstMoon,
    secondMoon,
    firstLabel,
    secondLabel,
    firstSnapshot.gender,
    secondSnapshot.gender
  );
  const rajju = getRajjuFactor(firstMoon, secondMoon, factors);
  const vedha = getVedhaFactor(firstMoon, secondMoon, factors);

  return {
    factors: [mahendra, striDeergha, rajju, vedha],
    mahendra,
    striDeergha,
    rajju,
    vedha,
  };
}
