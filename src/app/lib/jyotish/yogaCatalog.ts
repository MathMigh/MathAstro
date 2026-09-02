import type { VedicPoint, VedicSnapshot } from "../vedic";

type ClassicalPlanetKey =
  | "sun"
  | "moon"
  | "mars"
  | "mercury"
  | "jupiter"
  | "venus"
  | "saturn";

export interface YogaDiagnostic {
  name: string;
  family: string;
  rule: string;
  detail: string;
  involvedKeys: string[];
  area: string;
  cancellation?: string;
}

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
];

const SIGN_LORD_KEYS: ClassicalPlanetKey[] = [
  "mars",
  "venus",
  "mercury",
  "moon",
  "sun",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "saturn",
  "jupiter",
];

const CLASSICAL_PLANETS = new Set<ClassicalPlanetKey>([
  "sun",
  "moon",
  "mars",
  "mercury",
  "jupiter",
  "venus",
  "saturn",
]);

const BENEFIC_KEYS = new Set<string>(["moon", "mercury", "jupiter", "venus"]);
const MALEFIC_KEYS = new Set<string>(["sun", "mars", "saturn", "northNode", "southNode"]);
const STRONG_TAGS = new Set(["Exaltado", "Domicilio", "Amigavel"]);
const WEAK_TAGS = new Set(["Debilitado", "Inimigo", "Combusto"]);
const KENDRA_HOUSES = new Set([1, 4, 7, 10]);
const TRIKONA_HOUSES = new Set([1, 5, 9]);
const DUSTHANA_HOUSES = new Set([6, 8, 12]);
const UPACHAYA_HOUSES = new Set([3, 6, 10, 11]);

const EXALTATION_SIGN_BY_PLANET: Record<ClassicalPlanetKey, number> = {
  sun: 0,
  moon: 1,
  mars: 9,
  mercury: 5,
  jupiter: 3,
  venus: 11,
  saturn: 6,
};

const PANCHA_MAHAPURUSHA: Array<{
  key: ClassicalPlanetKey;
  name: string;
  area: string;
}> = [
  { key: "mars", name: "Ruchaka Mahapurusha Yoga", area: "coragem, acao, lideranca e capacidade de combate" },
  { key: "mercury", name: "Bhadra Mahapurusha Yoga", area: "intelecto, fala, comercio e articulacao" },
  { key: "jupiter", name: "Hamsa Mahapurusha Yoga", area: "dharma, protecao, ensino e nobreza" },
  { key: "venus", name: "Malavya Mahapurusha Yoga", area: "prazer, refinamento, relacionamento e conforto" },
  { key: "saturn", name: "Sasa Mahapurusha Yoga", area: "autoridade, resistencia, organizacao e massa" },
];

const MOVABLE_SIGNS = new Set([0, 3, 6, 9]);
const FIXED_SIGNS = new Set([1, 4, 7, 10]);
const DUAL_SIGNS = new Set([2, 5, 8, 11]);

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function uniqueKeys(values: string[]) {
  return Array.from(new Set(values));
}

function angularDistance(first: number, second: number) {
  const distance = Math.abs(modulo(first - second, 360));
  return distance > 180 ? 360 - distance : distance;
}

function findPoint(snapshot: VedicSnapshot, key: string) {
  return snapshot.planets.find((point) => point.key === key);
}

function asClassicalPoint(point?: VedicPoint) {
  if (!point || !CLASSICAL_PLANETS.has(point.key as ClassicalPlanetKey)) {
    return undefined;
  }

  return point as VedicPoint & { key: ClassicalPlanetKey };
}

function getHouseLordKey(snapshot: VedicSnapshot, house: number) {
  const signIndex = modulo(snapshot.ascendant.signIndex + house - 1, 12);
  return SIGN_LORD_KEYS[signIndex];
}

function getHouseLord(snapshot: VedicSnapshot, house: number) {
  return findPoint(snapshot, getHouseLordKey(snapshot, house)) ?? snapshot.ascendant;
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

function doesAspect(source: VedicPoint, target: VedicPoint) {
  const distance = modulo(target.house - source.house, 12) + 1;
  return aspectOffsetsFor(source.key).includes(distance);
}

function areLinked(first?: VedicPoint, second?: VedicPoint) {
  return Boolean(
    first &&
      second &&
      (first.signIndex === second.signIndex || doesAspect(first, second) || doesAspect(second, first))
  );
}

function isStrong(point?: VedicPoint) {
  return Boolean(point && point.tags.some((tag) => STRONG_TAGS.has(tag)));
}

function isWeak(point?: VedicPoint) {
  return Boolean(point && point.tags.some((tag) => WEAK_TAGS.has(tag)));
}

function isOwnOrExalted(point?: VedicPoint) {
  return Boolean(point && point.tags.some((tag) => tag === "Exaltado" || tag === "Domicilio"));
}

function contactPoints(snapshot: VedicSnapshot, target: VedicPoint, sourceKeys: Set<string>) {
  return snapshot.planets.filter(
    (point) =>
      point.key !== target.key &&
      sourceKeys.has(point.key) &&
      (point.signIndex === target.signIndex || doesAspect(point, target))
  );
}

function getBeneficContacts(snapshot: VedicSnapshot, target: VedicPoint) {
  return contactPoints(snapshot, target, BENEFIC_KEYS);
}

function getMaleficContacts(snapshot: VedicSnapshot, target: VedicPoint) {
  return contactPoints(snapshot, target, MALEFIC_KEYS);
}

function formatContactNames(snapshot: VedicSnapshot, points: VedicPoint[]) {
  return formatPointNames(
    snapshot,
    points.map((point) => point.key)
  );
}

function dominantClusterPoint(snapshot: VedicSnapshot, cluster: VedicPoint[]) {
  return [...cluster].sort((first, second) => {
    const secondRupas = snapshot.shadbala.find((item) => item.key === second.key)?.rupas ?? 0;
    const firstRupas = snapshot.shadbala.find((item) => item.key === first.key)?.rupas ?? 0;
    if (secondRupas !== firstRupas) {
      return secondRupas - firstRupas;
    }

    if (isStrong(second) !== isStrong(first)) {
      return Number(isStrong(second)) - Number(isStrong(first));
    }

    return second.degreeInSign - first.degreeInSign;
  })[0];
}

function classicalPlanetPoints(snapshot: VedicSnapshot) {
  return snapshot.planets.filter((point) => CLASSICAL_PLANETS.has(point.key as ClassicalPlanetKey));
}

function inKendraOrTrikona(point?: VedicPoint) {
  return Boolean(point && (KENDRA_HOUSES.has(point.house) || TRIKONA_HOUSES.has(point.house)));
}

function pointsForKeys(snapshot: VedicSnapshot, keys: string[]) {
  return uniqueKeys(keys)
    .map((key) => findPoint(snapshot, key))
    .filter(Boolean) as VedicPoint[];
}

function formatPointNames(snapshot: VedicSnapshot, keys: string[]) {
  const points = pointsForKeys(snapshot, keys);
  return points.length ? points.map((point) => point.name).join(", ") : "--";
}

function formatPointHouses(snapshot: VedicSnapshot, keys: string[]) {
  const houses = uniqueKeys(pointsForKeys(snapshot, keys).map((point) => `${point.house}`));
  return houses.length ? houses.join(", ") : "--";
}

function formatPointSigns(snapshot: VedicSnapshot, keys: string[]) {
  const signs = uniqueKeys(pointsForKeys(snapshot, keys).map((point) => point.signName));
  return signs.length ? signs.join(", ") : "--";
}

function pushYoga(rows: YogaDiagnostic[], row: YogaDiagnostic) {
  if (!rows.some((candidate) => candidate.name === row.name)) {
    rows.push(row);
  }
}

function detectBaseYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  const moon = findPoint(snapshot, "moon") ?? snapshot.ascendant;
  const jupiter = findPoint(snapshot, "jupiter");
  const sun = findPoint(snapshot, "sun");
  const mercury = findPoint(snapshot, "mercury");
  const ninthLord = getHouseLord(snapshot, 9);
  const tenthLord = getHouseLord(snapshot, 10);
  const lagnaLord = getHouseLord(snapshot, 1);
  const secondLord = getHouseLord(snapshot, 2);
  const fourthLord = getHouseLord(snapshot, 4);

  if (jupiter && KENDRA_HOUSES.has(modulo(jupiter.house - moon.house, 12) + 1)) {
    pushYoga(rows, {
      name: "Gaja Kesari Yoga",
      family: "Gaja Kesari Yoga",
      rule: "Guru em kendra a partir da Lua.",
      detail: `Guru cai na ${modulo(jupiter.house - moon.house, 12) + 1}a casa desde a Lua, em ${jupiter.signName}.`,
      involvedKeys: ["moon", "jupiter"],
      area: "mente, reputacao, apoio e protecao",
    });
  }

  if (sun && mercury && sun.signIndex === mercury.signIndex) {
    pushYoga(rows, {
      name: "Budha Aditya Yoga",
      family: "Raja Yogas",
      rule: "Sol e Mercurio compartilham o mesmo signo.",
      detail: `Sol e Mercurio se juntam em ${sun.signName}.`,
      involvedKeys: ["sun", "mercury"],
      area: "intelecto, administracao, visibilidade e articulacao",
    });
  }

  if (
    ninthLord.key !== tenthLord.key &&
    (ninthLord.signIndex === tenthLord.signIndex ||
      doesAspect(ninthLord, tenthLord) ||
      doesAspect(tenthLord, ninthLord))
  ) {
    pushYoga(rows, {
      name: "Dharma-Karmadhipati Raja Yoga",
      family: "Raja Yogas",
      rule: "Lords da 9a e da 10a em conjuncao, mesmo signo ou aspecto mutuo.",
      detail: `${ninthLord.name} e ${tenthLord.name} ligam dharma e karma por signo/drishti.`,
      involvedKeys: [ninthLord.key, tenthLord.key],
      area: "status, carreira, merito e elevacao",
    });
  }

  if ([1, 4, 5, 7, 9, 10].includes(lagnaLord.house) || isOwnOrExalted(lagnaLord)) {
    pushYoga(rows, {
      name: "Parijata Yoga",
      family: "Raja Yogas",
      rule: "Lagna lord forte e bem assentado em casa angular/trinal ou por dignidade.",
      detail: `${lagnaLord.name} sustenta o Lagna a partir da casa ${lagnaLord.house} em ${lagnaLord.signName}.`,
      involvedKeys: [lagnaLord.key],
      area: "estabilidade do mapa, prestigio e sustentacao geral",
    });
  }

  const conjunctionSigns = Array.from(
    snapshot.planets.reduce<Map<number, string[]>>((acc, point) => {
      if (!CLASSICAL_PLANETS.has(point.key as ClassicalPlanetKey)) {
        return acc;
      }
      acc.set(point.signIndex, [...(acc.get(point.signIndex) ?? []), point.key]);
      return acc;
    }, new Map())
  ).filter(([, keys]) => keys.length >= 2);
  if (conjunctionSigns.length) {
    pushYoga(rows, {
      name: "Dwigraha Yoga",
      family: "Raja Yogas",
      rule: "Dois ou mais grahas classicos compartilham o mesmo signo.",
      detail: conjunctionSigns
        .map(([signIndex, keys]) => `${SIGN_NAMES[signIndex]}: ${formatPointNames(snapshot, keys)}`)
        .join("; "),
      involvedKeys: conjunctionSigns.flatMap(([, keys]) => keys),
      area: "mistura forte de temas conforme os grahas envolvidos",
    });
  }

  const secondFromMoon = modulo(moon.signIndex + 1, 12);
  const twelfthFromMoon = modulo(moon.signIndex + 11, 12);
  const planetsInSecondFromMoon = snapshot.planets.filter(
    (point) => point.key !== "sun" && point.signIndex === secondFromMoon
  );
  const planetsInTwelfthFromMoon = snapshot.planets.filter(
    (point) => point.key !== "sun" && point.signIndex === twelfthFromMoon
  );

  if (planetsInSecondFromMoon.length) {
    pushYoga(rows, {
      name: "Sunapha Yoga",
      family: "Sunapha Yoga",
      rule: "Grahas na 2a a partir da Lua, excluindo o Sol.",
      detail: `A 2a desde a Lua recebe ${formatPointNames(snapshot, planetsInSecondFromMoon.map((point) => point.key))}.`,
      involvedKeys: ["moon", ...planetsInSecondFromMoon.map((point) => point.key)],
      area: "autonomia, iniciativa pessoal e capacidade de construir recursos",
    });
  }

  if (planetsInTwelfthFromMoon.length) {
    pushYoga(rows, {
      name: "Anapha Yoga",
      family: "Anapha Yoga",
      rule: "Grahas na 12a a partir da Lua, excluindo o Sol.",
      detail: `A 12a desde a Lua recebe ${formatPointNames(snapshot, planetsInTwelfthFromMoon.map((point) => point.key))}.`,
      involvedKeys: ["moon", ...planetsInTwelfthFromMoon.map((point) => point.key)],
      area: "autocontrole, interioridade e preparo silencioso",
    });
  }

  if (planetsInSecondFromMoon.length && planetsInTwelfthFromMoon.length) {
    pushYoga(rows, {
      name: "Durudhara Yoga",
      family: "Durudhara Yoga",
      rule: "Grahas nas duas bordas da Lua, 2a e 12a, excluindo o Sol.",
      detail: "A Lua recebe apoio simultaneo por ambos os lados.",
      involvedKeys: [
        "moon",
        ...planetsInSecondFromMoon.map((point) => point.key),
        ...planetsInTwelfthFromMoon.map((point) => point.key),
      ],
      area: "sustentacao mental, rede de apoio e capacidade de manutencao",
    });
  }

  if ([1, 4, 5, 7, 9, 10].includes(secondLord.house)) {
    pushYoga(rows, {
      name: "Swa-Veeryaddhana Yoga",
      family: "Dhana Yogas",
      rule: "Lord da 2a em kendra ou trikona.",
      detail: `${secondLord.name} rege a 2a e cai na casa ${secondLord.house}.`,
      involvedKeys: [secondLord.key],
      area: "recursos, sustento e acumulacao",
    });
  }

  const beneficCountNearSecondLord = snapshot.planets.filter(
    (point) =>
      BENEFIC_KEYS.has(point.key) &&
      (point.signIndex === secondLord.signIndex || doesAspect(point, secondLord))
  );
  if (beneficCountNearSecondLord.length) {
    pushYoga(rows, {
      name: "Sumukha Yoga",
      family: "Dhana Yogas",
      rule: "Lord da 2a recebe apoio benefico por signo ou drishti.",
      detail: `${secondLord.name} recebe apoio de ${formatPointNames(snapshot, beneficCountNearSecondLord.map((point) => point.key))}.`,
      involvedKeys: [secondLord.key, ...beneficCountNearSecondLord.map((point) => point.key)],
      area: "renda, apoio financeiro e boa apresentacao dos recursos",
    });
  }

  if (
    secondLord.signIndex === fourthLord.signIndex ||
    doesAspect(secondLord, fourthLord) ||
    doesAspect(fourthLord, secondLord)
  ) {
    pushYoga(rows, {
      name: "Mathrumooladhana Yoga",
      family: "Dhana Yogas",
      rule: "Ligacao entre 2a e 4a por signo ou aspecto.",
      detail: `${secondLord.name} e ${fourthLord.name} amarram riqueza e base material.`,
      involvedKeys: [secondLord.key, fourthLord.key],
      area: "patrimonio, familia, bens e base domestica",
    });
  }

  if (
    [1, 4, 5, 7, 9, 10].includes(lagnaLord.house) &&
    [1, 4, 5, 7, 9, 10].includes(fourthLord.house)
  ) {
    pushYoga(rows, {
      name: "Matru Sneha Yoga",
      family: "Dhana Yogas",
      rule: "Lagna lord e 4o lord bem assentados no eixo angular/trinal.",
      detail: `${lagnaLord.name} e ${fourthLord.name} sustentam o eixo de base do mapa.`,
      involvedKeys: [lagnaLord.key, fourthLord.key],
      area: "raizes, acolhimento, apoio familiar e solo emocional",
    });
  }

  const twelfthFromSun = modulo((sun ?? snapshot.ascendant).signIndex + 11, 12);
  const beneficsBehindSun = snapshot.planets.filter(
    (point) => point.signIndex === twelfthFromSun && BENEFIC_KEYS.has(point.key)
  );
  if (beneficsBehindSun.length) {
    pushYoga(rows, {
      name: "Subha-Vasi Yoga",
      family: "Raja Yogas",
      rule: "Benefico na 12a a partir do Sol.",
      detail: `A 12a do Sol recebe ${formatPointNames(snapshot, beneficsBehindSun.map((point) => point.key))}.`,
      involvedKeys: ["sun", ...beneficsBehindSun.map((point) => point.key)],
      area: "reserva, apoio silencioso, refinamento e protecao do ego",
    });
  }
}

function detectLunarAndWealthYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  const moon = findPoint(snapshot, "moon") ?? snapshot.ascendant;
  const moonCompanions = snapshot.planets.filter(
    (point) =>
      point.key !== "sun" &&
      point.key !== "northNode" &&
      point.key !== "southNode" &&
      point.signIndex === moon.signIndex
  );
  const secondFromMoon = modulo(moon.signIndex + 1, 12);
  const twelfthFromMoon = modulo(moon.signIndex + 11, 12);
  const sidePlanets = snapshot.planets.filter(
    (point) =>
      point.key !== "sun" &&
      point.key !== "northNode" &&
      point.key !== "southNode" &&
      (point.signIndex === secondFromMoon || point.signIndex === twelfthFromMoon)
  );
  const kendraFromMoonBenefics = snapshot.planets.filter((point) => {
    if (!BENEFIC_KEYS.has(point.key)) {
      return false;
    }
    const relativeHouse = modulo(point.signIndex - moon.signIndex, 12) + 1;
    return KENDRA_HOUSES.has(relativeHouse);
  });
  const kendraFromLagnaBenefics = snapshot.planets.filter(
    (point) => BENEFIC_KEYS.has(point.key) && KENDRA_HOUSES.has(point.house)
  );

  if (!sidePlanets.length && !moonCompanions.length) {
    const cancellationNotes: string[] = [];
    if (kendraFromMoonBenefics.length) {
      cancellationNotes.push(
        `beneficos em kendra da Lua (${formatPointNames(snapshot, kendraFromMoonBenefics.map((point) => point.key))})`
      );
    }
    if (kendraFromLagnaBenefics.length) {
      cancellationNotes.push(
        `beneficos em kendra do Lagna (${formatPointNames(snapshot, kendraFromLagnaBenefics.map((point) => point.key))})`
      );
    }

    pushYoga(rows, {
      name: "Kemadruma Yoga",
      family: "Kemadruma Yoga",
      rule: "Sem grahas nas bordas da Lua e sem companhia lunar imediata; checar bhanga a parte.",
      detail: "Lua sem apoio lateral direto no working set atual.",
      involvedKeys: ["moon"],
      area: "estabilidade mental, suporte subjetivo e sensacao de vazio",
      cancellation: cancellationNotes.length
        ? `Ha sinais classicos de bhanga: ${cancellationNotes.join("; ")}.`
        : "Sem bhanga classica automatica forte detectada nesta camada.",
    });
  }

  const adhiBenefics = snapshot.planets.filter((point) => {
    if (!BENEFIC_KEYS.has(point.key)) {
      return false;
    }
    const relativeHouse = modulo(point.signIndex - moon.signIndex, 12) + 1;
    return [6, 7, 8].includes(relativeHouse);
  });

  if (adhiBenefics.length >= 2) {
    pushYoga(rows, {
      name: "Adhi Yoga",
      family: "Adhi Yoga",
      rule: "Beneficos nas casas 6, 7 ou 8 a partir da Lua.",
      detail: `A Lua recebe ${formatPointNames(snapshot, adhiBenefics.map((point) => point.key))} nas casas 6/7/8.`,
      involvedKeys: ["moon", ...adhiBenefics.map((point) => point.key)],
      area: "protecoes, suporte mental, diplomacia e condicao de resposta",
    });
  }

  const vasumatiBenefics = snapshot.planets.filter(
    (point) => BENEFIC_KEYS.has(point.key) && UPACHAYA_HOUSES.has(point.house)
  );
  if (vasumatiBenefics.length >= 2) {
    pushYoga(rows, {
      name: "Vasumati Yoga",
      family: "Vasumati Yoga",
      rule: "Beneficos em upachayas a partir do Lagna.",
      detail: `${formatPointNames(snapshot, vasumatiBenefics.map((point) => point.key))} sustentam casas de crescimento.`,
      involvedKeys: vasumatiBenefics.map((point) => point.key),
      area: "riqueza progressiva, crescimento e recursos por desenvolvimento",
    });
  }
}

function detectDaridraAndArishtaYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  const moon = findPoint(snapshot, "moon") ?? snapshot.ascendant;
  const lagnaLord = getHouseLord(snapshot, 1);
  const secondLord = getHouseLord(snapshot, 2);
  const sixthLord = getHouseLord(snapshot, 6);
  const eighthLord = getHouseLord(snapshot, 8);
  const eleventhLord = getHouseLord(snapshot, 11);
  const twelfthLord = getHouseLord(snapshot, 12);
  const dusthanaLords = [sixthLord, eighthLord, twelfthLord];

  [
    { point: secondLord, houseLabel: "2a" },
    { point: eleventhLord, houseLabel: "11a" },
  ].forEach(({ point, houseLabel }) => {
    const dusthanaLinks = dusthanaLords.filter(
      (dusthanaLord) => dusthanaLord.key !== point.key && areLinked(dusthanaLord, point)
    );
    const maleficPressure = uniqueKeys([
      ...dusthanaLinks.map((dusthanaLord) => dusthanaLord.key),
      ...getMaleficContacts(snapshot, point).map((pressurePoint) => pressurePoint.key),
    ]);
    const beneficSupport = getBeneficContacts(snapshot, point);
    const pressuredByDusthana = DUSTHANA_HOUSES.has(point.house) || dusthanaLinks.length > 0;

    if (pressuredByDusthana && (isWeak(point) || maleficPressure.length >= 2 || DUSTHANA_HOUSES.has(point.house))) {
      pushYoga(rows, {
        name: `Daridra Yoga (${houseLabel} lord)`,
        family: "Daridra Yogas",
        rule: `Lord da ${houseLabel} casa fragilizado por dusthana, aflicao natural ou ambos.`,
        detail:
          `${point.name} rege a ${houseLabel} casa e cai na casa ${point.house} em ${point.signName}; ` +
          `a pressao principal vem de ${formatPointNames(snapshot, maleficPressure)}.`,
        involvedKeys: uniqueKeys([point.key, ...maleficPressure]),
        area: "renda, liquidez, estabilidade de recursos e sustentacao material",
        cancellation: beneficSupport.length
          ? `Ha alivio parcial por ${formatContactNames(snapshot, beneficSupport)}.`
          : "Sem alivio benefico basal forte detectado neste recorte.",
      });
    }
  });

  const moonMalefics = getMaleficContacts(snapshot, moon);
  const moonBenefics = getBeneficContacts(snapshot, moon);
  if (DUSTHANA_HOUSES.has(moon.house) && (isWeak(moon) || moonMalefics.length >= 2)) {
    pushYoga(rows, {
      name: "Chandra Arishta Yoga",
      family: "Arishta Yogas",
      rule: "Lua em dusthana sob pressao malefica ou dignidade fraca, pedindo leitura de bhanga.",
      detail:
        `A Lua cai na casa ${moon.house} em ${moon.signName} e recebe pressao de ` +
        `${formatContactNames(snapshot, moonMalefics)}.`,
      involvedKeys: uniqueKeys(["moon", ...moonMalefics.map((point) => point.key)]),
      area: "estabilidade emocional, suporte psiquico, saude e seguranca basica",
      cancellation: moonBenefics.length
        ? `A Lua ainda recebe alivio de ${formatContactNames(snapshot, moonBenefics)}.`
        : "Sem apoio benefico forte imediato sobre a Lua nesta camada.",
    });
  }

  const lagnaAfflictors = snapshot.planets.filter(
    (point) =>
      point.key !== lagnaLord.key &&
      MALEFIC_KEYS.has(point.key) &&
      (point.house === 1 ||
        point.signIndex === snapshot.ascendant.signIndex ||
        doesAspect(point, snapshot.ascendant) ||
        areLinked(point, lagnaLord))
  );
  const lagnaBenefics = snapshot.planets.filter(
    (point) =>
      point.key !== lagnaLord.key &&
      BENEFIC_KEYS.has(point.key) &&
      (point.house === 1 ||
        point.signIndex === snapshot.ascendant.signIndex ||
        doesAspect(point, snapshot.ascendant) ||
        areLinked(point, lagnaLord))
  );
  if ((isWeak(lagnaLord) || DUSTHANA_HOUSES.has(lagnaLord.house)) && lagnaAfflictors.length >= 2) {
    pushYoga(rows, {
      name: "Lagna Arishta Yoga",
      family: "Arishta Yogas",
      rule: "Lagna lord fragilizado com aflicao relevante sobre o Lagna ou sobre o proprio regente.",
      detail:
        `${lagnaLord.name} sustenta o Lagna a partir da casa ${lagnaLord.house} em ${lagnaLord.signName}; ` +
        `a pressao vem de ${formatContactNames(snapshot, lagnaAfflictors)}.`,
      involvedKeys: uniqueKeys([lagnaLord.key, ...lagnaAfflictors.map((point) => point.key)]),
      area: "vitalidade, capacidade de sustentacao e defesa global do mapa",
      cancellation: lagnaBenefics.length
        ? `Ha defesa parcial por ${formatContactNames(snapshot, lagnaBenefics)}.`
        : "Sem cerca benefica forte ao redor do Lagna nesta camada.",
    });
  }

  const ayuAffliction = areLinked(eighthLord, moon) || areLinked(eighthLord, lagnaLord);
  if (ayuAffliction && (isWeak(moon) || isWeak(lagnaLord))) {
    pushYoga(rows, {
      name: "Ayu Arishta Yoga",
      family: "Arishta Yogas",
      rule: "8o lord pressionando Lua ou Lagna lord quando um dos dois ja esta fraco.",
      detail:
        `${eighthLord.name} liga a 8a casa com ${isWeak(moon) ? "Lua" : lagnaLord.name}, ` +
        "pedindo leitura classica de vulnerabilidade e checagem de bhanga.",
      involvedKeys: uniqueKeys([eighthLord.key, isWeak(moon) ? "moon" : lagnaLord.key]),
      area: "vulnerabilidade, rupturas, crises e necessidade de protecao",
      cancellation: isStrong(eighthLord)
        ? "A pressao do 8o lord vem forte neste recorte; bhanga depende de outros modulos."
        : "O 8o lord nao aparece especialmente forte, o que pode reduzir o peso final do arishta.",
    });
  }
}

function detectNabhasaYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  const classicalPoints = classicalPlanetPoints(snapshot);
  const signIndexes = classicalPoints.map((point) => point.signIndex);
  const occupiedSigns = Array.from(new Set(signIndexes));
  const occupiedSignLabels = occupiedSigns.map((signIndex) => SIGN_NAMES[signIndex]).join(", ");
  const pointKeys = classicalPoints.map((point) => point.key);
  const sankhyaDefinitions: Record<number, { name: string; area: string }> = {
    1: {
      name: "Gola Yoga",
      area: "concentracao extrema de vida, unilateralidade e destino comprimido",
    },
    2: {
      name: "Yuga Yoga",
      area: "polarizacao de experiencia, dualidade forte e vida em dois polos",
    },
    3: {
      name: "Shula Yoga",
      area: "tensao, iniciativa dura, foco penetrante e percurso agudo",
    },
    4: {
      name: "Kedara Yoga",
      area: "organizacao pratica, cultivo, acumulacao e base material",
    },
    5: {
      name: "Pasha Yoga",
      area: "rede social, vinculos, enredamentos e vida entre obrigacoes",
    },
    6: {
      name: "Dama Yoga",
      area: "disciplina, controle, esforco repartido e manejo tecnico",
    },
    7: {
      name: "Veena Yoga",
      area: "multiplicidade de talentos, articulacao e vida mais distribuida",
    },
  };
  const sankhyaDefinition = sankhyaDefinitions[occupiedSigns.length];
  if (sankhyaDefinition) {
    pushYoga(rows, {
      name: sankhyaDefinition.name,
      family: "Nabhasa Yogas",
      rule: `Sankhya Nabhasa: os sete grahas classicos ocupam ${occupiedSigns.length} signos.`,
      detail: `Os grahas classicos se distribuem por ${occupiedSigns.length} signos: ${occupiedSignLabels}.`,
      involvedKeys: pointKeys,
      area: sankhyaDefinition.area,
    });
  }

  const allMovable = signIndexes.every((signIndex) => MOVABLE_SIGNS.has(signIndex));
  const allFixed = signIndexes.every((signIndex) => FIXED_SIGNS.has(signIndex));
  const allDual = signIndexes.every((signIndex) => DUAL_SIGNS.has(signIndex));
  if (allMovable) {
    pushYoga(rows, {
      name: "Rajju Yoga",
      family: "Nabhasa Yogas",
      rule: "Ashraya Nabhasa: todos os grahas classicos em signos moveis.",
      detail: `Os sete grahas classicos caem apenas em signos moveis: ${occupiedSignLabels}.`,
      involvedKeys: pointKeys,
      area: "movimento, deslocamento, instabilidade criativa e tracao de vida",
    });
  }

  if (allFixed) {
    pushYoga(rows, {
      name: "Musala Yoga",
      family: "Nabhasa Yogas",
      rule: "Ashraya Nabhasa: todos os grahas classicos em signos fixos.",
      detail: `Os sete grahas classicos caem apenas em signos fixos: ${occupiedSignLabels}.`,
      involvedKeys: pointKeys,
      area: "estabilidade, persistencia, peso material e consolidacao",
    });
  }

  if (allDual) {
    pushYoga(rows, {
      name: "Nala Yoga",
      family: "Nabhasa Yogas",
      rule: "Ashraya Nabhasa: todos os grahas classicos em signos duais.",
      detail: `Os sete grahas classicos caem apenas em signos duais: ${occupiedSignLabels}.`,
      involvedKeys: pointKeys,
      area: "adaptabilidade, articulacao mental e alternancia de vias",
    });
  }
}

function detectMahapurushaAndFortuneYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  PANCHA_MAHAPURUSHA.forEach((definition) => {
    const point = asClassicalPoint(findPoint(snapshot, definition.key));
    if (!point) {
      return;
    }

    if (KENDRA_HOUSES.has(point.house) && isOwnOrExalted(point)) {
      pushYoga(rows, {
        name: definition.name,
        family: "Pancha Mahapurusha Yogas",
        rule: `${point.name} em kendra, em signo proprio ou exaltacao.`,
        detail: `${point.name} cai na casa ${point.house} em ${point.signName}, com ${point.tags.join(", ").toLowerCase()}.`,
        involvedKeys: [point.key],
        area: definition.area,
      });
    }
  });

  const lagnaLord = getHouseLord(snapshot, 1);
  const ninthLord = getHouseLord(snapshot, 9);
  if (inKendraOrTrikona(ninthLord) && isStrong(ninthLord) && isStrong(lagnaLord)) {
    pushYoga(rows, {
      name: "Lakshmi Yoga",
      family: "Lakshmi Yoga",
      rule: "9o lord forte em kendra/trikona, com Lagna lord tambem forte.",
      detail: `${ninthLord.name} sustenta a 9a a partir da casa ${ninthLord.house}; ${lagnaLord.name} sustenta o Lagna.`,
      involvedKeys: [ninthLord.key, lagnaLord.key],
      area: "fortuna, merito, prosperidade e graca",
    });
  }

  const saraswatiPoints = ["mercury", "jupiter", "venus"]
    .map((key) => findPoint(snapshot, key))
    .filter(Boolean) as VedicPoint[];
  if (
    saraswatiPoints.length === 3 &&
    saraswatiPoints.every((point) => [2, 1, 4, 5, 7, 9, 10].includes(point.house))
  ) {
    pushYoga(rows, {
      name: "Saraswati Yoga",
      family: "Saraswati Yoga",
      rule: "Budha, Guru e Shukra fortes em 2a, kendra ou trikona.",
      detail: saraswatiPoints
        .map((point) => `${point.name} na casa ${point.house} em ${point.signName}`)
        .join("; "),
      involvedKeys: saraswatiPoints.map((point) => point.key),
      area: "estudo, linguagem, refinamento, escrita e cultura",
      cancellation: saraswatiPoints.some((point) => isWeak(point))
        ? "Ha tensao por dignidade fraca em pelo menos um dos tres grahas."
        : "Sem contradicao basal forte entre os tres grahas neste recorte.",
    });
  }
}

function detectRenunciateYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  const signClusters = Array.from(
    snapshot.planets.reduce<Map<number, VedicPoint[]>>((acc, point) => {
      if (!CLASSICAL_PLANETS.has(point.key as ClassicalPlanetKey)) {
        return acc;
      }

      acc.set(point.signIndex, [...(acc.get(point.signIndex) ?? []), point]);
      return acc;
    }, new Map())
  )
    .map(([signIndex, points]) => ({ signIndex, points }))
    .filter((entry) => entry.points.length >= 4);

  signClusters.forEach(({ signIndex, points }) => {
    const dominant = dominantClusterPoint(snapshot, points);
    const pointKeys = points.map((point) => point.key);
    const clusterLabel = `${SIGN_NAMES[signIndex]}: ${formatPointNames(snapshot, pointKeys)}`;
    const dominanceNote = dominant
      ? `${dominant.name} lidera a aglomeracao por shadbala/forca basal.`
      : "Sem dominancia clara entre os grahas aglomerados.";

    pushYoga(rows, {
      name: `Sanyasa Yoga (${SIGN_NAMES[signIndex]})`,
      family: "Sanyasa Yogas",
      rule: "Quatro ou mais grahas classicos reunidos no mesmo signo, formando compressao ascetica basal.",
      detail: `${clusterLabel}. ${dominanceNote}`,
      involvedKeys: pointKeys,
      area: "desapego, reorientacao de vida, severidade e concentracao de destino",
      cancellation: dominant && isWeak(dominant)
        ? `${dominant.name} domina a aglomeracao, mas traz fragilidade de dignidade, o que pode reduzir a pureza do sanyasa.`
        : "Sem quebra basal forte detectada dentro da aglomeracao.",
    });

    pushYoga(rows, {
      name: `Pravrajya Yoga (${SIGN_NAMES[signIndex]})`,
      family: "Pravrajya Yogas",
      rule: "Quatro ou mais grahas classicos em um unico signo; o graha dominante colore a via de renuncia.",
      detail: `${clusterLabel}. ${dominanceNote}`,
      involvedKeys: pointKeys,
      area: "renuncia, afastamento, disciplina e mudanca de ordem de vida",
      cancellation: dominant && isWeak(dominant)
        ? `${dominant.name} domina o conjunto, mas a tensao de dignidade pede cautela antes de ler uma pravrajya plena.`
        : "Sem contradicao basal forte na camada de pravrajya.",
    });
  });
}

function detectParivartanaAndDusthanaYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  const lordsByHouse = Array.from({ length: 12 }, (_, index) => getHouseLord(snapshot, index + 1));

  for (let firstHouse = 1; firstHouse <= 12; firstHouse += 1) {
    const firstLord = lordsByHouse[firstHouse - 1];
    for (let secondHouse = firstHouse + 1; secondHouse <= 12; secondHouse += 1) {
      const secondLord = lordsByHouse[secondHouse - 1];
      const firstOccupiesSecond = SIGN_LORD_KEYS[firstLord.signIndex] === secondLord.key;
      const secondOccupiesFirst = SIGN_LORD_KEYS[secondLord.signIndex] === firstLord.key;

      if (firstOccupiesSecond && secondOccupiesFirst) {
        pushYoga(rows, {
          name: `Parivartana Yoga (${firstHouse}-${secondHouse})`,
          family: "Parivartana Yogas",
          rule: `Troca de signos entre os lords da ${firstHouse}a e da ${secondHouse}a casas.`,
          detail: `${firstLord.name} e ${secondLord.name} trocam dominios por signo.`,
          involvedKeys: [firstLord.key, secondLord.key],
          area: "mistura de assuntos entre casas envolvidas",
        });
      }
    }
  }

  const sixthLord = getHouseLord(snapshot, 6);
  const eighthLord = getHouseLord(snapshot, 8);
  const twelfthLord = getHouseLord(snapshot, 12);
  const viparitaRows: Array<{
    name: string;
    point: VedicPoint;
    house: number;
  }> = [
    { name: "Harsha Viparita Raja Yoga", point: sixthLord, house: 6 },
    { name: "Sarala Viparita Raja Yoga", point: eighthLord, house: 8 },
    { name: "Vimala Viparita Raja Yoga", point: twelfthLord, house: 12 },
  ];

  viparitaRows.forEach((entry) => {
    if (DUSTHANA_HOUSES.has(entry.point.house)) {
      pushYoga(rows, {
        name: entry.name,
        family: "Viparita Raja Yoga",
        rule: `Lord da ${entry.house}a ocupando uma dusthana (6, 8 ou 12).`,
        detail: `${entry.point.name} cai na casa ${entry.point.house} em ${entry.point.signName}.`,
        involvedKeys: [entry.point.key],
        area: "virada de crise, sobrevivencia e ganho por reversao de dificuldade",
      });
    }
  });
}

function detectNodalYogas(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  const sun = findPoint(snapshot, "sun");
  const moon = findPoint(snapshot, "moon");
  const rahu = findPoint(snapshot, "northNode");
  const ketu = findPoint(snapshot, "southNode");
  const grahanaPairs = [
    { luminary: sun, node: rahu, label: "Surya Grahana Yoga (Rahu)" },
    { luminary: sun, node: ketu, label: "Surya Grahana Yoga (Ketu)" },
    { luminary: moon, node: rahu, label: "Chandra Grahana Yoga (Rahu)" },
    { luminary: moon, node: ketu, label: "Chandra Grahana Yoga (Ketu)" },
  ];

  grahanaPairs.forEach(({ luminary, node, label }) => {
    if (!luminary || !node) {
      return;
    }

    const separation = angularDistance(luminary.longitude, node.longitude);
    if (luminary.signIndex === node.signIndex && separation <= 12) {
      const beneficContacts = getBeneficContacts(snapshot, luminary);
      pushYoga(rows, {
        name: label,
        family: "Yogas de Rahu/Ketu",
        rule: "Luminar em conjuncao nodal apertada no mesmo signo, formando padrao de grahana.",
        detail: `${luminary.name} se junta a ${node.name} em ${luminary.signName} com separacao de ${separation.toFixed(2)}deg.`,
        involvedKeys: [luminary.key, node.key],
        area: "eclipses natais, sombra karmica, foco compulsivo e eventos de virada",
        cancellation: beneficContacts.length
          ? `${luminary.name} ainda recebe apoio de ${formatContactNames(snapshot, beneficContacts)}.`
          : "Sem amortecimento benefico forte do luminar nesta camada.",
      });
    }
  });
}

function detectNeechaBhanga(snapshot: VedicSnapshot, rows: YogaDiagnostic[]) {
  snapshot.planets
    .map((point) => asClassicalPoint(point))
    .filter(Boolean)
    .forEach((point) => {
      if (!point || !point.tags.includes("Debilitado")) {
        return;
      }

      const signLord = findPoint(snapshot, SIGN_LORD_KEYS[point.signIndex]);
      const exaltationSignIndex = EXALTATION_SIGN_BY_PLANET[point.key];
      const exaltationLord = findPoint(snapshot, SIGN_LORD_KEYS[exaltationSignIndex]);
      const signLordKendra =
        signLord && (KENDRA_HOUSES.has(signLord.house) || KENDRA_HOUSES.has(modulo(signLord.house - (findPoint(snapshot, "moon")?.house ?? snapshot.ascendant.house), 12) + 1));
      const exaltationLordKendra =
        exaltationLord &&
        (KENDRA_HOUSES.has(exaltationLord.house) ||
          KENDRA_HOUSES.has(modulo(exaltationLord.house - (findPoint(snapshot, "moon")?.house ?? snapshot.ascendant.house), 12) + 1));
      const conjunctSignLord = signLord ? signLord.signIndex === point.signIndex : false;

      if (signLordKendra || exaltationLordKendra || conjunctSignLord) {
        pushYoga(rows, {
          name: `Neecha Bhanga Raja Yoga (${point.name})`,
          family: "Neecha Bhanga Raja Yoga",
          rule:
            "Planeta debilitado recebe cancelamento quando o lord do signo, o lord da exaltacao ou a conjuncao relevante restaura suporte angular.",
          detail:
            `${point.name} esta debilitado em ${point.signName}; ` +
            `${signLord?.name ?? "o lord do signo"} / ${exaltationLord?.name ?? "o lord de exaltacao"} ` +
            "oferecem condicao de cancelamento.",
          involvedKeys: uniqueKeys([point.key, signLord?.key ?? "", exaltationLord?.key ?? ""].filter(Boolean)),
          area: "reversao de fraqueza, recuperacao de status e correcao de falha natal",
        });
      }
    });
}

export function buildYogaDiagnostics(snapshot: VedicSnapshot) {
  const rows: YogaDiagnostic[] = [];

  detectBaseYogas(snapshot, rows);
  detectLunarAndWealthYogas(snapshot, rows);
  detectDaridraAndArishtaYogas(snapshot, rows);
  detectNabhasaYogas(snapshot, rows);
  detectMahapurushaAndFortuneYogas(snapshot, rows);
  detectRenunciateYogas(snapshot, rows);
  detectParivartanaAndDusthanaYogas(snapshot, rows);
  detectNeechaBhanga(snapshot, rows);
  detectNodalYogas(snapshot, rows);

  return rows;
}

export function buildYogaLabels(snapshot: VedicSnapshot) {
  return buildYogaDiagnostics(snapshot).map((row) => `${row.name} - ${row.detail}`);
}

export function formatYogaPointNames(snapshot: VedicSnapshot, keys: string[]) {
  return formatPointNames(snapshot, keys);
}

export function formatYogaPointHouses(snapshot: VedicSnapshot, keys: string[]) {
  return formatPointHouses(snapshot, keys);
}

export function formatYogaPointSigns(snapshot: VedicSnapshot, keys: string[]) {
  return formatPointSigns(snapshot, keys);
}
