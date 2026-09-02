import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

const NATURAL_MALEFICS = new Set(["sun", "mars", "saturn", "northNode", "southNode"]);
const NATURAL_BENEFICS = new Set(["moon", "mercury", "jupiter", "venus"]);
const SHAYANADI_STATES = [
  "Shayana",
  "Upavesana",
  "Netrapani",
  "Prakasha",
  "Gamana",
  "Agamana",
  "Sabha",
  "Agama",
  "Bhojana",
  "Nrityalipsa",
  "Kautuka",
  "Nidra",
] as const;
const PLANET_SERIALS: Record<string, number> = {
  sun: 1,
  moon: 2,
  mars: 3,
  mercury: 4,
  jupiter: 5,
  venus: 6,
  saturn: 7,
  northNode: 8,
  southNode: 9,
};
const SHAYANADI_ADDITIVES: Record<string, number> = {
  sun: 5,
  moon: 2,
  mars: 2,
  mercury: 3,
  jupiter: 5,
  venus: 3,
  saturn: 3,
  northNode: 4,
  southNode: 4,
};

function isOddSign(signIndex: number) {
  return signIndex % 2 === 0;
}

function degreeAvastha(point: VedicPoint) {
  const degree = point.degreeInSign;

  if (isOddSign(point.signIndex)) {
    if (degree < 6) return "Bala";
    if (degree < 12) return "Kumara";
    if (degree < 18) return "Yuva";
    if (degree < 24) return "Vriddha";
    return "Mrita";
  }

  if (degree < 6) return "Mrita";
  if (degree < 12) return "Vriddha";
  if (degree < 18) return "Yuva";
  if (degree < 24) return "Kumara";
  return "Bala";
}

function deeptadiAvastha(point: VedicPoint, snapshot: VedicSnapshot) {
  const conjunctMalefic = snapshot.planets.some(
    (candidate) =>
      candidate.key !== point.key &&
      candidate.signIndex === point.signIndex &&
      NATURAL_MALEFICS.has(candidate.key)
  );
  const signRuledByMalefic = ["Surya", "Mangala", "Shani", "Rahu", "Ketu"].includes(point.signLord);

  if (point.tags.includes("Combusto")) {
    return "Kopa";
  }
  if (point.tags.includes("Exaltado")) {
    return "Deepta";
  }
  if (point.tags.includes("Domicilio")) {
    return "Svastha";
  }
  if (point.tags.includes("Amigavel")) {
    return "Shanta";
  }
  if (point.tags.includes("Inimigo")) {
    return "Dukhi";
  }
  if (conjunctMalefic) {
    return "Vikala";
  }
  if (signRuledByMalefic) {
    return "Khala";
  }
  if (point.tags.includes("Debilitado")) {
    return "Dukhi";
  }

  return "Deena";
}

function jagradadiAvastha(point: VedicPoint) {
  if (point.tags.includes("Exaltado") || point.tags.includes("Domicilio")) {
    return "Jagrat";
  }

  if (point.tags.includes("Debilitado") || point.tags.includes("Inimigo")) {
    return "Sushupti";
  }

  return "Swapna";
}

function lajjitadiAvastha(point: VedicPoint, snapshot: VedicSnapshot) {
  const conjunctPoints = snapshot.planets.filter(
    (candidate) => candidate.key !== point.key && candidate.signIndex === point.signIndex
  );
  const aspectedByMalefic = snapshot.aspects.some(
    (aspect) =>
      aspect.target === point.name &&
      snapshot.planets.some(
        (planet) => planet.name === aspect.source && NATURAL_MALEFICS.has(planet.key)
      )
  );

  if (
    point.house === 5 &&
    conjunctPoints.some((candidate) =>
      ["northNode", "southNode", "sun", "saturn", "mars"].includes(candidate.key)
    )
  ) {
    return "Lajjita";
  }

  if (point.tags.includes("Exaltado")) {
    return "Garvita";
  }

  if (
    point.tags.includes("Inimigo") ||
    conjunctPoints.some((candidate) => NATURAL_MALEFICS.has(candidate.key)) ||
    aspectedByMalefic
  ) {
    return "Kshudhita";
  }

  if (conjunctPoints.some((candidate) => NATURAL_BENEFICS.has(candidate.key))) {
    return "Mudita";
  }

  if (point.tags.includes("Combusto") || point.house === 10) {
    return "Kshobhita";
  }

  return "Saumya";
}

function avasthaNote(label: string) {
  switch (label) {
    case "Bala":
      return "Faixa inicial de manifestacao do graha.";
    case "Kumara":
      return "Estado em crescimento, mas ainda nao pleno.";
    case "Yuva":
      return "Faixa de maior disponibilidade para produzir resultado.";
    case "Vriddha":
      return "Estado mais cansado ou menos expansivo.";
    case "Mrita":
      return "Faixa que tende a reduzir bastante a entrega do graha.";
    case "Deepta":
      return "Ligado a exaltacao no working set atual.";
    case "Svastha":
      return "Graha em signo proprio.";
    case "Shanta":
      return "Faixa amigavel no recorte de dignidade atual.";
    case "Deena":
      return "Faixa neutra, sem apoio especial.";
    case "Dukhi":
      return "Faixa adversa por debilidade ou signo inimigo.";
    case "Vikala":
      return "Associacao com malefico no mesmo signo.";
    case "Khala":
      return "Signo regido por natural malefico no working set.";
    case "Kopa":
      return "Combustao priorizada como sinal de tensao.";
    case "Jagrat":
      return "Vigilancia alta segundo dignidade base.";
    case "Swapna":
      return "Estado medio, sem extremo apoio nem queda.";
    case "Sushupti":
      return "Estado de sono por queda ou signo inimigo.";
    case "Lajjita":
      return "5a casa com nodo ou malefico classico no mesmo campo.";
    case "Garvita":
      return "Exaltacao acionando orgulho/forca posicional.";
    case "Kshudhita":
      return "Aflicao por inimigo, malefico conjunto ou aspecto duro.";
    case "Mudita":
      return "Companhia benefica no mesmo signo.";
    case "Kshobhita":
      return "Tensao operacional por combustao ou peso ocupacional do 10o.";
    default:
      return "Leitura tecnica operacional do working set atual.";
  }
}

function shayanadiNote(label: (typeof SHAYANADI_STATES)[number]) {
  switch (label) {
    case "Shayana":
      return "Estado de repouso ou recolhimento; tende a entregar resultado de modo mais passivo.";
    case "Upavesana":
      return "Estado sentado; estabiliza o graha, mas sem maxima expansao.";
    case "Netrapani":
      return "Estado de vigilia e observacao; o graha tende a atuar de forma alerta.";
    case "Prakasha":
      return "Estado luminoso; o graha tende a projetar mais visibilidade e expressao.";
    case "Gamana":
      return "Estado de movimento; o graha atua em deslocamento, mudanca ou instabilidade.";
    case "Agamana":
      return "Estado de chegada/retorno; costuma misturar busca, contato e reentrada.";
    case "Sabha":
      return "Estado assemblear; favorece ambiente social, audiencia e suporte publico.";
    case "Agama":
      return "Estado de aproximacao intensa; pode concentrar desejo, urgencia ou pressao.";
    case "Bhojana":
      return "Estado de consumo; o graha puxa experiencia material, gasto ou assimilacao.";
    case "Nrityalipsa":
      return "Estado expressivo; o graha busca arte, exibicao, ritmo ou performance.";
    case "Kautuka":
      return "Estado curioso e celebrativo; o graha tende a explorar, brincar e experimentar.";
    case "Nidra":
      return "Estado de sono; o graha tende a reduzir entrega manifesta ou ficar latente.";
    default:
      return "Leitura tecnica operacional do working set atual.";
  }
}

function shayanadiSubstateLabel(value: number) {
  if (value === 1) {
    return "Drishti";
  }

  if (value === 2) {
    return "Cheshta";
  }

  return "Vicheshta";
}

function shayanadiSubstateNote(label: string) {
  if (label === "Cheshta") {
    return "Subestado de entrega plena no working set atual.";
  }

  if (label === "Drishti") {
    return "Subestado de entrega media no working set atual.";
  }

  return "Subestado de entrega reduzida ou residual no working set atual.";
}

function normalizeMod(value: number, size: number) {
  return ((value % size) + size) % size;
}

function getNavamshaOrdinal(point: VedicPoint) {
  return Math.min(9, Math.floor(point.degreeInSign / (30 / 9)) + 1);
}

function getBirthGhatis(localBirthHour: number) {
  const ghatis = (localBirthHour * 60) / 24;
  return Math.max(1, Math.ceil(ghatis - 1e-9));
}

function getNameAnka(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const syllableGroups: Array<{ value: number; tokens: string[] }> = [
    { value: 1, tokens: ["bh", "dh", "tt", "ch", "ka", "va", "v", "k", "a"] },
    { value: 2, tokens: ["kh", "jh", "sh", "ja", "na", "i", "j", "n"] },
    { value: 3, tokens: ["gh", "th", "ga", "pa", "ya", "sa", "u", "g", "p", "y", "s", "t"] },
    { value: 4, tokens: ["ph", "ra", "ma", "e", "r", "m"] },
    { value: 5, tokens: ["ca", "da", "ba", "la", "ha", "o", "c", "d", "b", "l", "h"] },
  ];

  for (const group of syllableGroups) {
    if (group.tokens.some((token) => normalized.startsWith(token))) {
      return {
        value: group.value,
        token: group.tokens.find((token) => normalized.startsWith(token)) ?? normalized[0] ?? "a",
        fallback: false,
      };
    }
  }

  return {
    value: 1,
    token: normalized[0] ?? "a",
    fallback: true,
  };
}

function calculateShayanadiAvastha(snapshot: VedicSnapshot, point: VedicPoint) {
  const moon = snapshot.planets.find((candidate) => candidate.key === "moon") ?? snapshot.ascendant;
  const planetSerial = PLANET_SERIALS[point.key] ?? 9;
  const starNumber = point.nakshatraIndex + 1;
  const navamshaNumber = getNavamshaOrdinal(point);
  const birthStarNumber = moon.nakshatraIndex + 1;
  const birthGhatis = getBirthGhatis(snapshot.localBirthHour);
  const lagnaOrder = snapshot.ascendant.signIndex + 1;
  const total = starNumber * planetSerial * navamshaNumber + birthStarNumber + birthGhatis + lagnaOrder;
  const avasthaRemainder = normalizeMod(total, 12);
  const avasthaIndex = avasthaRemainder === 0 ? 12 : avasthaRemainder;
  const state = SHAYANADI_STATES[avasthaIndex - 1];
  const nameAnka = getNameAnka(snapshot.name ?? "");
  const stageOneRemainder = normalizeMod(avasthaIndex * avasthaIndex + nameAnka.value, 12);
  const additive = SHAYANADI_ADDITIVES[point.key] ?? 4;
  const stageTwoRemainder = normalizeMod(stageOneRemainder + additive, 3);
  const substate = shayanadiSubstateLabel(stageTwoRemainder);

  return {
    state,
    substate,
    total,
    starNumber,
    planetSerial,
    navamshaNumber,
    birthStarNumber,
    birthGhatis,
    lagnaOrder,
    avasthaIndex,
    stageOneRemainder,
    additive,
    stageTwoRemainder,
    nameAnka,
    note:
      `Formula BPHS operacional: (${starNumber} x ${planetSerial} x ${navamshaNumber}) + (${birthStarNumber} + ${birthGhatis} + ${lagnaOrder}) = ${total}; ` +
      `mod 12 -> ${avasthaIndex} (${state}). Subestado: (A^2 + ${nameAnka.value}) mod 12 = ${stageOneRemainder}; ` +
      `+ aditivo ${additive}, mod 3 -> ${substate}.` +
      (nameAnka.fallback
        ? ` Nome "${snapshot.name}" sem silaba sanscrita clara em alfabeto latino; fallback operacional aplicado em ${nameAnka.value}.`
        : ` Anka do nome pela silaba/token inicial "${nameAnka.token}".`),
  };
}

function avasthaReadinessScore(row: {
  basic: string;
  deeptadi: string;
  jagradadi: string;
  lajjitadi: string;
  shayanadi: ReturnType<typeof calculateShayanadiAvastha>;
}) {
  let score = 0;

  if (row.basic === "Yuva") score += 3;
  if (row.basic === "Kumara") score += 1.5;
  if (row.basic === "Bala") score += 1;
  if (row.basic === "Vriddha") score -= 1;
  if (row.basic === "Mrita") score -= 2.5;

  if (["Deepta", "Svastha", "Shanta"].includes(row.deeptadi)) score += 2;
  if (["Dukhi", "Vikala", "Khala", "Kopa"].includes(row.deeptadi)) score -= 2;

  if (row.jagradadi === "Jagrat") score += 1.5;
  if (row.jagradadi === "Sushupti") score -= 1.5;

  if (["Mudita", "Garvita", "Saumya"].includes(row.lajjitadi)) score += 1.5;
  if (["Lajjita", "Kshudhita", "Kshobhita"].includes(row.lajjitadi)) score -= 1.5;

  if (["Prakasha", "Sabha", "Kautuka"].includes(row.shayanadi.state)) score += 1.5;
  if (["Shayana", "Nidra"].includes(row.shayanadi.state)) score -= 1.5;

  if (row.shayanadi.substate === "Cheshta") score += 1;
  if (row.shayanadi.substate === "Vicheshta") score -= 1;

  return Number(score.toFixed(2));
}

export function avasthaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const rows = snapshot.planets.map((point) => {
    const basic = degreeAvastha(point);
    const deeptadi = deeptadiAvastha(point, snapshot);
    const jagradadi = jagradadiAvastha(point);
    const lajjitadi = lajjitadiAvastha(point, snapshot);
    const shayanadi = calculateShayanadiAvastha(snapshot, point);

    return {
      point,
      basic,
      deeptadi,
      jagradadi,
      lajjitadi,
      shayanadi,
      readinessScore: avasthaReadinessScore({
        basic,
        deeptadi,
        jagradadi,
        lajjitadi,
        shayanadi,
      }),
    };
  });
  const jagratCount = rows.filter((row) => row.jagradadi === "Jagrat").length;
  const lajjitaCount = rows.filter((row) => row.lajjitadi === "Lajjita").length;
  const prakashaCount = rows.filter((row) => row.shayanadi.state === "Prakasha").length;
  const cheshtaCount = rows.filter((row) => row.shayanadi.substate === "Cheshta").length;
  const fallbackNameAnka = rows.some((row) => row.shayanadi.nameAnka.fallback);
  const strongestReadiness = [...rows].sort(
    (left, right) => right.readinessScore - left.readinessScore || left.point.name.localeCompare(right.point.name)
  )[0];

  return {
    sections: [
      createSection({
        id: `${module}-avastha`,
        title: "Avasthas",
        description:
          "O modulo agora respeita a inversao por signos pares na Baladi e abre working sets de Deeptadi, Jagradadi e Lajjitadi.",
        status: "implemented",
        items: [
          createDatum(module, "Avastha", "Grahas em Jagrat", jagratCount, {
            technicalNotes: "Contagem baseada em exaltacao ou signo proprio no working set atual.",
            confidence: 0.74,
            status: "implemented",
          }),
          createDatum(module, "Avastha", "Grahas em Lajjita", lajjitaCount, {
            technicalNotes:
              "Marcados quando o graha cai na 5a casa junto de nodo, Sol, Saturno ou Marte.",
            confidence: 0.7,
            status: "implemented",
          }),
          createDatum(module, "Avastha", "Graha com melhor prontidao avasthica", `${strongestReadiness.point.name} (${strongestReadiness.readinessScore})`, {
            technicalNotes:
              "Overlay operacional de Baladi, Deeptadi, Jagradadi, Lajjitadi e Shayanadi para ranquear disponibilidade do graha.",
            confidence: 0.68,
            status: "implemented",
            methodUsed: "working-set-avastha-overlay-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-avastha-table`,
            "Baladi Avastha",
            ["Graha", "Signo", "Grau", "Estado basico", "Nota"],
            rows.map((row) => [
              row.point.name,
              row.point.signName,
              row.point.degreeInSign.toFixed(2),
              row.basic,
              avasthaNote(row.basic),
            ])
          ),
          createTable(
            `${module}-avastha-advanced`,
            "Avasthas Avancadas",
            ["Graha", "Deeptadi", "Jagradadi", "Lajjitadi", "Observacao"],
            rows.map((row) => [
              row.point.name,
              row.deeptadi,
              row.jagradadi,
              row.lajjitadi,
              [avasthaNote(row.deeptadi), avasthaNote(row.jagradadi), avasthaNote(row.lajjitadi)]
                .filter(Boolean)
                .join(" | "),
            ]),
            "Working set tecnico baseado em dignidade, aflicao e condicao posicional do graha."
          ),
          createTable(
            `${module}-avastha-overlay`,
            "Overlay de Avasthas",
            ["Graha", "Baladi", "Deeptadi", "Jagradadi", "Lajjitadi", "Shayanadi", "Subestado", "Score"],
            rows.map((row) => [
              row.point.name,
              row.basic,
              row.deeptadi,
              row.jagradadi,
              row.lajjitadi,
              row.shayanadi.state,
              row.shayanadi.substate,
              row.readinessScore.toFixed(2),
            ]),
            "Matriz operacional que junta as familias de avastha para estimar prontidao, queda ou latencia do graha."
          ),
        ],
      }),
      createSection({
        id: `${module}-avastha-shayanadi`,
        title: "Shayanadi Avastha",
        description:
          "Shayanadi agora sai em working set operacional com a formula BPHS baseada em estrela ocupada, serial do graha, Navamsha, Janma Nakshatra, ghatis do nascimento e ordem do Lagna.",
        status: "implemented",
        items: [
          createDatum(module, "Avastha", "Grahas em Prakasha", prakashaCount, {
            technicalNotes:
              "Contagem dos grahas cuja formula Shayanadi fechou no 4o estado da serie operacional.",
            confidence: 0.74,
            status: "implemented",
          }),
          createDatum(module, "Avastha", "Grahas em Cheshta", cheshtaCount, {
            technicalNotes:
              "Subestado de entrega plena segundo a etapa final do working set operacional.",
            confidence: 0.72,
            status: "implemented",
          }),
          createDatum(module, "Avastha", "Anka do nome", fallbackNameAnka ? "Fallback parcial" : "Mapeado", {
            technicalNotes:
              fallbackNameAnka
                ? "Pelo menos um token inicial do nome exigiu fallback latino operacional no calculo do subestado."
                : "O token inicial do nome foi mapeado diretamente para a grade de anka usada pelo working set.",
            confidence: fallbackNameAnka ? 0.52 : 0.66,
            status: "implemented",
            methodUsed: "working-set-shayanadi-name-anka-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-shayanadi-table`,
            "Shayanadi e Subestado",
            ["Graha", "Estado", "Subestado", "Navamsha", "Ghatis", "Resto", "Observacao"],
            rows.map((row) => [
              row.point.name,
              row.shayanadi.state,
              row.shayanadi.substate,
              row.shayanadi.navamshaNumber.toString(),
              row.shayanadi.birthGhatis.toString(),
              row.shayanadi.avasthaIndex.toString(),
              `${shayanadiNote(row.shayanadi.state)} ${shayanadiSubstateNote(row.shayanadi.substate)}`,
            ]),
            "Leitura operacional dos 12 estados de Shayanadi com subestado Drishti/Cheshta/Vicheshta."
          ),
          createTable(
            `${module}-shayanadi-formula`,
            "Formula Operacional do Shayanadi",
            ["Graha", "s", "p", "n", "a", "g", "r", "Total", "Anka", "Aditivo", "Nota"],
            rows.map((row) => [
              row.point.name,
              row.shayanadi.starNumber.toString(),
              row.shayanadi.planetSerial.toString(),
              row.shayanadi.navamshaNumber.toString(),
              row.shayanadi.birthStarNumber.toString(),
              row.shayanadi.birthGhatis.toString(),
              row.shayanadi.lagnaOrder.toString(),
              row.shayanadi.total.toString(),
              row.shayanadi.nameAnka.value.toString(),
              row.shayanadi.additive.toString(),
              row.shayanadi.note,
            ]),
            "Formula BPHS aplicada em modo operacional. Rahu/Ketu foram estendidos como 8/9 e com aditivo 4."
          ),
        ],
      }),
    ],
    summary: [
      `Grahas em Jagrat: ${jagratCount}.`,
      `Graha com maior prontidao avasthica: ${strongestReadiness.point.name} (${strongestReadiness.readinessScore.toFixed(2)}).`,
      `Estados Prakasha: ${prakashaCount}; subestados Cheshta: ${cheshtaCount}.`,
    ],
  };
}
