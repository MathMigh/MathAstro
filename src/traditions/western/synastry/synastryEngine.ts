import type { BirthChart, FixedStarMatch, Planet, PlanetType } from "@/interfaces/BirthChartInterfaces";
import {
  DETRIMENT,
  DOMICILE_RULER,
  EXALTATION,
  FACES,
  FALL,
  LILLY_TERMS,
  SIGN_ELEMENT,
  SIGNS,
  TRIPLICITY_RULERS,
} from "@/app/lib/traditionalTables";
import {
  getAspectTypeFromSigns,
  getSignIndex,
  getTraditionalAspectOrbFromLongitudes,
  normalizeLongitude,
  resolveTraditionalAspect,
} from "@/app/lib/aspectDynamics";
import { getHouseIndex } from "@/app/lib/traditionalCalculations";
import {
  calculateNatalAnalysis,
  type NatalAnalysis,
  type ReceptionKind,
} from "@/app/lib/natalAnalysis";
import { SYNASTRY_AUTHORITY, SYNASTRY_INTERACTION_PRESETS } from "./synastryMethodContract";
import { classifySynastryTemperamentBond } from "./temperamentBond";
import type {
  CrossAntiscionContact,
  CrossAspectContact,
  CrossMutualReception,
  CrossReception,
  DistributionSnapshot,
  InteractionPatternComparison,
  NatalInteractionPattern,
  NatalRelationshipCommonInterest,
  RelationshipCuspFoundation,
  RoleHouseFoundation,
  RoleResonanceTestimony,
  SharedGroundEvidence,
  SunMoonBridge,
  SynastryAnalysis,
  SynastryCalculationCompleteness,
  SynastryCalculationOptions,
  SynastryInputAudit,
  SynastryInteractionContext,
  SynastryInteractionKind,
  SynastryPersonFoundation,
  SynastryPersonId,
  SynastrySynthesis,
  TemperamentAxisRelation,
  TemperamentBond,
} from "./types";

const TRADITIONAL_TYPES = new Set<PlanetType>([
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
]);

const SIGN_RULER_TYPES: PlanetType[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];

const CORE_TYPES = new Set<PlanetType>(["sun", "moon"]);

/**
 * Frawley explicitly treats a Mercury→Ascendant aspect 5° from perfection as
 * still operative, though slight. The source locks the relevance of a
 * planet→cusp contact and demonstrates 5° at the Ascendant; extending 5° as a
 * uniform ceiling to all thematic cusps is a MathAstro operational derivation.
 * This override is local to synastry and never mutates natal/core behavior.
 */
const SYNASTRY_CUSP_ASPECT_MAX_ORB = 5;

/** Frawley: contacts to antiscia must be close; "nothing much more than a degree". */
const SYNASTRY_ANTISCION_MAX_ORB = 1;

function getLongitude(planet: Planet): number {
  return Number.isFinite(planet.longitudeRaw) ? planet.longitudeRaw : planet.longitude;
}

function getTraditionalPlanets(chart: BirthChart): Planet[] {
  return chart.planets.filter((planet) => TRADITIONAL_TYPES.has(planet.type));
}

function getPlanetByType(chart: BirthChart, type: PlanetType): Planet {
  const planet = chart.planets.find((candidate) => candidate.type === type);
  if (!planet) throw new Error(`Planeta ausente no mapa: ${type}`);
  return planet;
}

function signName(longitude: number): string {
  return SIGNS[getSignIndex(longitude)];
}

function getRulerType(longitude: number): PlanetType {
  return SIGN_RULER_TYPES[getSignIndex(longitude)];
}

function cuspPointName(house: number): string {
  if (house === 1) return "ASC";
  if (house === 4) return "IC";
  if (house === 7) return "DSC";
  if (house === 10) return "MC";
  return `C${house}`;
}

function buildInteractionContext(options?: SynastryCalculationOptions): SynastryInteractionContext {
  const normalized: SynastryInteractionKind = options?.interactionKind ?? "general";

  if (normalized === "custom") {
    const custom = options?.customRole;
    const houseA = Number(custom?.houseForA);
    const houseB = Number(custom?.houseForB);
    const roleA = custom?.roleA?.trim();
    const roleB = custom?.roleB?.trim();
    if (!Number.isInteger(houseA) || houseA < 1 || houseA > 12 || !Number.isInteger(houseB) || houseB < 1 || houseB > 12) {
      throw new Error("Sinastria personalizada exige casas inteiras de 1 a 12 para A e B.");
    }
    if (!roleA || !roleB) {
      throw new Error("Sinastria personalizada exige um rótulo de papel para B no mapa A e para A no mapa B.");
    }
    return {
      kind: "custom",
      label: `papéis personalizados · casa ${houseA} de A ↔ casa ${houseB} de B`,
      roleA,
      roleB,
      counterpartHouseForA: houseA,
      counterpartHouseForB: houseB,
      relationshipAxisRelevant: houseA === 7 && houseB === 7,
      romanticSpecific: false,
      marriageSpecific: false,
      note: "Modo avançado: as casas foram declaradas pelo usuário, não inferidas pelo motor. O cálculo aplica o procedimento de Marcos aos papéis informados e marca a escolha como derivação transparente.",
      sourceStatus: "derived-from-source",
      custom: true,
    };
  }

  const definition = SYNASTRY_INTERACTION_PRESETS.find((item) => item.kind === normalized);
  if (!definition) throw new Error(`Tipo de interação não reconhecido: ${normalized}.`);
  const relationshipAxisRelevant = definition.houseA === 7 && definition.houseB === 7;
  const romanticSpecific = normalized === "romantic" || normalized === "marriage";
  const marriageSpecific = normalized === "marriage";
  return {
    kind: normalized,
    label: definition.label,
    roleA: definition.roleA,
    roleB: definition.roleB,
    counterpartHouseForA: definition.houseA,
    counterpartHouseForB: definition.houseB,
    relationshipAxisRelevant,
    romanticSpecific,
    marriageSpecific,
    note: normalized === "general"
      ? "Sem papel mais específico, a casa VII representa a outra pessoa. O motor não presume romance. O procedimento continua: padrão natal do papel em A, padrão natal correspondente em B, comparação dos padrões e somente depois contatos cruzados."
      : `Contexto declarado: ${definition.label}. O motor julga primeiro como cada natividade contém o papel da outra pessoa (casa ${definition.houseA} em A; casa ${definition.houseB} em B), compara esses dois padrões e só então usa contatos entre mapas para dar corpo, área de manifestação e relevância à combinação.`,
    sourceStatus: definition.sourceStatus,
    custom: false,
  };
}

function validateChart(chart: BirthChart | undefined, label: string): string[] {
  const errors: string[] = [];
  if (!chart) return [`${label}: mapa ausente.`];
  const traditional = getTraditionalPlanets(chart);
  if (traditional.length !== 7) errors.push(`${label}: são necessários os sete planetas tradicionais; encontrados ${traditional.length}.`);
  if (!Array.isArray(chart.housesData?.house) || chart.housesData.house.length !== 12) errors.push(`${label}: doze cúspides são obrigatórias.`);
  if (!Number.isFinite(chart.housesData?.ascendant)) errors.push(`${label}: Ascendente inválido.`);
  if (!chart.birthDate) errors.push(`${label}: dados natais ausentes.`);
  return errors;
}

function auditInputs(chartA: BirthChart, chartB: BirthChart): SynastryInputAudit {
  const errors = [...validateChart(chartA, "Mapa A"), ...validateChart(chartB, "Mapa B")];
  const warnings: string[] = [];
  // Zero contatos com estrelas é um resultado válido. Só há lacuna quando o
  // catálogo/céu estelar integral não veio materializado no próprio mapa.
  if (!chartA.fixedStarCatalog?.length) warnings.push("Mapa A sem catálogo integral de estrelas fixas; testemunhos estelares ficam MISSING_ENGINE_DATA.");
  if (!chartB.fixedStarCatalog?.length) warnings.push("Mapa B sem catálogo integral de estrelas fixas; testemunhos estelares ficam MISSING_ENGINE_DATA.");
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    chartA: {
      traditionalPlanets: getTraditionalPlanets(chartA).length,
      cusps: chartA.housesData?.house?.length ?? 0,
      hasFullFixedStarSky: Boolean(chartA.fixedStarCatalog?.length),
    },
    chartB: {
      traditionalPlanets: getTraditionalPlanets(chartB).length,
      cusps: chartB.housesData?.house?.length ?? 0,
      hasFullFixedStarSky: Boolean(chartB.fixedStarCatalog?.length),
    },
  };
}

function distribution(chart: BirthChart): DistributionSnapshot {
  const planets = getTraditionalPlanets(chart);
  let aboveHorizon = 0;
  let belowHorizon = 0;
  let easternHemisphere = 0;
  let westernHemisphere = 0;

  for (const planet of planets) {
    const house = getHouseIndex(getLongitude(planet), chart.housesData.house);
    if (house >= 7 && house <= 12) aboveHorizon += 1;
    else belowHorizon += 1;
    if ([10, 11, 12, 1, 2, 3].includes(house)) easternHemisphere += 1;
    else westernHemisphere += 1;
  }

  return {
    aboveHorizon,
    belowHorizon,
    easternHemisphere,
    westernHemisphere,
    total: planets.length,
    horizonMajority: aboveHorizon === belowHorizon ? "equilibrado" : aboveHorizon > belowHorizon ? "acima" : "abaixo",
    hemisphereMajority: easternHemisphere === westernHemisphere ? "equilibrado" : easternHemisphere > westernHemisphere ? "leste" : "oeste",
  };
}

function matchesForPoint(chart: BirthChart, pointName: string): FixedStarMatch[] {
  const normalized = pointName.toLowerCase();
  return (chart.fixedStarMatches ?? [])
    .filter((match) => match.pointElementType === "planet" && match.pointName.toLowerCase() === normalized && match.isRelevant)
    .sort((a, b) => a.orb - b.orb);
}

function buildRoleHouseFoundation(natal: NatalAnalysis, house: number): RoleHouseFoundation {
  const dossier = natal.houseDossiers.find((item) => item.house === house);
  if (!dossier) throw new Error(`Dossiê natal da casa ${house} ausente.`);
  return {
    house,
    topic: dossier.topic,
    cuspLongitude: dossier.cuspLongitude,
    cuspSign: dossier.cuspSign,
    ruler: dossier.domicileRuler,
    rulerEssential: dossier.rulerEssential,
    rulerAccidental: dossier.rulerAccidental,
    rulerAspects: dossier.rulerAspects,
    rulerReceptions: dossier.rulerReceptions,
    cuspPlanetContacts: dossier.cuspPlanetContacts.filter((item) => item.directHouseTestimonyMarcos),
    occupants: dossier.occupants.filter((item) => item.onCuspMarcos || item.directlyTestifiesHouseMarcos),
    activeLots: dossier.activeLots.filter((item) => item.activeMarcos),
    cuspFixedStars: dossier.cuspFixedStars,
  };
}

function buildRelationshipCuspFoundation(natal: NatalAnalysis, house: 1 | 7): RelationshipCuspFoundation {
  const dossier = natal.houseDossiers.find((item) => item.house === house);
  if (!dossier) throw new Error(`Dossiê natal da casa ${house} ausente.`);
  return {
    house,
    cuspLongitude: dossier.cuspLongitude,
    cuspSign: dossier.cuspSign,
    cuspPlanetContacts: dossier.cuspPlanetContacts.filter((item) => item.directHouseTestimonyMarcos),
    occupantsOnCusp: dossier.occupants.filter((item) => item.onCuspMarcos || item.directlyTestifiesHouseMarcos),
    activeLots: dossier.activeLots.filter((item) => item.activeMarcos),
    fixedStars: dossier.cuspFixedStars,
  };
}

function buildCommonNatalInterests(natal: NatalAnalysis): NatalRelationshipCommonInterest[] {
  const ruler1 = natal.relationships.ruler1;
  const ruler7 = natal.relationships.ruler7;
  const r1 = natal.receptions.filter((item) => item.guest === ruler1 && item.polarity === "positiva");
  const r7 = natal.receptions.filter((item) => item.guest === ruler7 && item.polarity === "positiva");
  const receivers = [...new Set(r1.map((item) => item.receiver))]
    .filter((receiver) => r7.some((item) => item.receiver === receiver));
  return receivers.map((receiver) => ({
    receiver,
    ruler1Receptions: r1.filter((item) => item.receiver === receiver),
    ruler7Receptions: r7.filter((item) => item.receiver === receiver),
    note: "Implementação da pergunta de Marcos sobre os regentes I/VII se orientarem para algo em comum; o receptor não é traduzido automaticamente em um bem concreto sem contexto.",
    sourceStatus: "derived-from-source",
  }));
}

function buildRomanticMarriageSupplement(chart: BirthChart, natal: NatalAnalysis) {
  const ruler1 = natal.relationships.ruler1;
  const ruler7 = natal.relationships.ruler7;
  return {
    relationshipPattern: natal.relationships,
    relationshipRulerStars: {
      ruler1: matchesForPoint(chart, ruler1),
      ruler7: matchesForPoint(chart, ruler7),
    },
    relationshipCusps: {
      house1: buildRelationshipCuspFoundation(natal, 1),
      house7: buildRelationshipCuspFoundation(natal, 7),
    },
    relationshipLots: {
      partOfLove: natal.relationships.partOfLove,
      marriageParts: natal.relationships.frawleyMarriageParts,
    },
    commonNatalInterests: buildCommonNatalInterests(natal),
  };
}

function buildFoundation(
  chart: BirthChart,
  natal: NatalAnalysis,
  person: SynastryPersonId,
  label: string,
  includeRomanticMarriageSupplement: boolean,
): SynastryPersonFoundation {
  const asc = chart.housesData.ascendant;
  const ruler1Type = getRulerType(asc);
  const ruler1 = getPlanetByType(chart, ruler1Type);
  return {
    person,
    label,
    ascendant: { longitude: asc, sign: signName(asc), ruler: ruler1.name },
    sect: natal.sect,
    temperament: natal.temperament,
    lordOfNativity: natal.lordOfNativity.planet,
    mentality: natal.mentality,
    manner: natal.manner,
    spiritualOrientation: natal.spiritualOrientation,
    essentialConditions: natal.essentialConditions,
    accidentalConditions: natal.accidentalConditions,
    distribution: distribution(chart),
    romanticMarriageSupplement: includeRomanticMarriageSupplement
      ? buildRomanticMarriageSupplement(chart, natal)
      : null,
  };
}

function essentialCondition(natal: NatalAnalysis, planetName: string) {
  return natal.essentialConditions.find((item) => item.planet === planetName);
}

function accidentalCondition(natal: NatalAnalysis, planetName: string) {
  return natal.accidentalConditions.find((item) => item.planet === planetName);
}

function findNatalAspectBetween(
  natal: NatalAnalysis,
  first: string,
  second: string,
): NatalInteractionPattern["directAspect"] {
  if (first === second) return null;
  const packet = natal.technicalForm.planets.find((item) => item.planet === first);
  const aspect = packet?.aspects.find((item) => item.planet === second);
  return aspect ? { aspect: aspect.aspect, orb: aspect.orb, applying: aspect.applying } : null;
}

function natalReceptionsForPair(natal: NatalAnalysis, guest: string, receiver: string) {
  // If the same planet rules both sides of a natal relation, it cannot be
  // treated as two different actors "receiving" one another. Preserve the
  // coincidence as sameSignificator instead of manufacturing intention.
  if (guest === receiver) return [];
  return natal.receptions.filter((item) => item.guest === guest && item.receiver === receiver);
}

function interactionPatternTone(pattern: Omit<NatalInteractionPattern, "tone" | "evidence" | "sourceStatus">): NatalInteractionPattern["tone"] {
  const receptions = [
    ...pattern.selfToCounterpart,
    ...pattern.counterpartToSelf,
    ...pattern.moonToCounterpart,
    ...pattern.counterpartToMoon,
  ];
  const positive = receptions.some((item) => item.polarity === "positiva" && Math.abs(item.strength) >= 3);
  const negative = receptions.some((item) => item.polarity === "negativa" && Math.abs(item.strength) >= 4);
  const hardPrincipal = pattern.directAspect ? ["square", "opposition"].includes(pattern.directAspect.aspect) : false;
  const hardMoon = pattern.moonDirectAspect ? ["square", "opposition"].includes(pattern.moonDirectAspect.aspect) : false;
  const tension = negative || hardPrincipal || hardMoon;
  if (positive && tension) return "misto";
  if (tension) return "tensao";
  if (positive) return "afinidade";
  return "neutro";
}

function buildNatalInteractionPattern(
  chart: BirthChart,
  natal: NatalAnalysis,
  person: SynastryPersonId,
  roleLabel: string,
  counterpartHouse: number,
  sourceStatus: "source-locked" | "derived-from-source",
): NatalInteractionPattern {
  const houseFoundation = buildRoleHouseFoundation(natal, counterpartHouse);
  const selfRuler = natal.relationships.ruler1;
  const counterpartRuler = houseFoundation.ruler;
  const selfEssential = essentialCondition(natal, selfRuler);
  const selfAccidental = accidentalCondition(natal, selfRuler);
  const moonEssential = essentialCondition(natal, "Lua");
  const moonAccidental = accidentalCondition(natal, "Lua");
  if (!selfEssential || !selfAccidental) throw new Error(`Condição natal do regente I (${selfRuler}) ausente.`);
  if (!moonEssential || !moonAccidental) throw new Error("Condição natal da Lua ausente; o significador secundário de Marcos não pode ser omitido.");

  const base = {
    person,
    roleLabel,
    selfRuler,
    secondarySelf: "Lua" as const,
    counterpartHouse,
    counterpartRuler,
    sameSignificator: selfRuler === counterpartRuler,
    directAspect: findNatalAspectBetween(natal, selfRuler, counterpartRuler),
    moonDirectAspect: findNatalAspectBetween(natal, "Lua", counterpartRuler),
    selfToCounterpart: natalReceptionsForPair(natal, selfRuler, counterpartRuler),
    counterpartToSelf: natalReceptionsForPair(natal, counterpartRuler, selfRuler),
    moonToCounterpart: natalReceptionsForPair(natal, "Lua", counterpartRuler),
    counterpartToMoon: natalReceptionsForPair(natal, counterpartRuler, "Lua"),
    selfEssential,
    selfAccidental,
    moonEssential,
    moonAccidental,
    counterpartEssential: essentialCondition(natal, counterpartRuler) ?? null,
    counterpartAccidental: accidentalCondition(natal, counterpartRuler) ?? null,
    counterpartHouseFoundation: houseFoundation,
    counterpartRulerStars: matchesForPoint(chart, counterpartRuler),
  };
  const tone = interactionPatternTone(base);
  const evidence: string[] = [];

  if (base.sameSignificator) {
    evidence.push(`O mesmo planeta (${selfRuler}) significa o nativo e o papel ${roleLabel}; registra-se a coincidência sem inventar aspecto do planeta consigo mesmo.`);
  }
  if (base.directAspect) {
    evidence.push(`Regente I ${base.directAspect.aspect} regente da casa ${counterpartHouse}, orbe ${base.directAspect.orb.toFixed(2)}°, ${base.directAspect.applying ? "aplicativo" : "separativo"} no próprio mapa natal.`);
  }
  if (base.moonDirectAspect) {
    evidence.push(`Lua, significador secundário do nativo, ${base.moonDirectAspect.aspect} regente da casa ${counterpartHouse}, orbe ${base.moonDirectAspect.orb.toFixed(2)}°, ${base.moonDirectAspect.applying ? "aplicativo" : "separativo"} no próprio mapa natal.`);
  }
  if (base.selfToCounterpart.length) {
    evidence.push(`Inclinação do nativo para o papel: ${base.selfToCounterpart.map((item) => `${item.by}/${item.polarity}`).join("+")}.`);
  }
  if (base.counterpartToSelf.length) {
    evidence.push(`Inclinação do significador do papel para o nativo: ${base.counterpartToSelf.map((item) => `${item.by}/${item.polarity}`).join("+")}.`);
  }
  if (base.moonToCounterpart.length || base.counterpartToMoon.length) {
    evidence.push("A Lua, significador secundário do nativo no exemplo explícito de Marcos, acrescenta testemunho de recepção ao padrão.");
  }
  evidence.push(`Estado da Lua preservado no padrão: essencial=${moonEssential.sign}/${moonEssential.isPeregrine ? "peregrina" : "dignidades/debilidades materializadas"}; acidental=casa ${moonAccidental.house}, condição solar ${moonAccidental.solarCondition}.`);
  if (houseFoundation.cuspPlanetContacts.length || houseFoundation.occupants.length || houseFoundation.activeLots.length) {
    evidence.push(`A casa ${counterpartHouse} possui testemunhos natais adicionais materializados na própria cúspide/ocupação/Partes; eles qualificam o padrão do papel, não substituem seus significadores.`);
  }
  if (base.counterpartRulerStars.length) {
    evidence.push(`O regente do papel (${counterpartRuler}) possui ${base.counterpartRulerStars.length} contato(s) relevante(s) com estrela fixa já materializado(s) pelo natal.`);
  }
  if (!evidence.length) {
    evidence.push("Nenhum aspecto direto ou recepção forte foi materializado entre o nativo e o significador deste papel; não forçar um padrão dramático.");
  }

  return { ...base, tone, evidence, sourceStatus };
}

function compareInteractionPatterns(
  a: NatalInteractionPattern,
  b: NatalInteractionPattern,
): InteractionPatternComparison {
  let status: InteractionPatternComparison["status"] = "indeterminado";
  if (a.tone === "tensao" && b.tone === "tensao") status = "dificuldade-convergente";
  else if (a.tone === "afinidade" && b.tone === "afinidade") status = "facilitacao-convergente";
  else if (a.tone === "misto" || b.tone === "misto") status = "misto";
  else if (a.tone !== b.tone && (a.tone !== "neutro" || b.tone !== "neutro")) status = "assimetrico";

  const descriptions: Record<InteractionPatternComparison["status"], string> = {
    "dificuldade-convergente": "Os dois padrões natais de papel contêm tensão. Como no exemplo professor–discípulo de Marcos, a combinação já sugere dificuldade antes de olhar contatos cruzados; os contatos posteriores mostram como e onde isso ganha corpo.",
    "facilitacao-convergente": "Os dois padrões natais de papel mostram afinidade suficiente para convergência. Os contatos cruzados ainda são necessários para mostrar como e em que áreas essa possibilidade se concretiza.",
    assimetrico: "Os dois padrões natais de papel não apontam na mesma direção. A assimetria deve ser preservada; não se deve forçá-la a virar média de compatibilidade.",
    misto: "Ao menos um dos padrões contém simultaneamente testemunhos de afinidade e tensão. O pareamento é misto e não deve ser reduzido a 'bom' ou 'ruim'.",
    indeterminado: "Os padrões natais de papel não fornecem polaridade suficiente por si sós. Contatos cruzados podem mostrar relevância e modo de manifestação, mas não autorizam preencher a lacuna com slogans.",
  };
  return { status, description: descriptions[status], sourceStatus: "derived-from-source" };
}

function axisQuality(delta: number, positive: string, negative: string): string {
  if (Math.abs(delta) < 1e-9) return "equilibrado";
  return delta > 0 ? positive : negative;
}

function buildTemperamentBond(a: SynastryPersonFoundation, b: SynastryPersonFoundation): TemperamentBond {
  const heatA = axisQuality(a.temperament.hotDelta, "quente", "frio");
  const heatB = axisQuality(b.temperament.hotDelta, "quente", "frio");
  const humidityA = axisQuality(a.temperament.dryDelta, "seco", "úmido");
  const humidityB = axisQuality(b.temperament.dryDelta, "seco", "úmido");
  const relation = (first: string, second: string): "similar" | "complementar" | "indeterminado" => {
    if (first === "equilibrado" || second === "equilibrado") return "indeterminado";
    return first === second ? "similar" : "complementar";
  };
  const axisRelations: TemperamentAxisRelation[] = [
    { axis: "calor", personA: heatA, personB: heatB, relation: relation(heatA, heatB) },
    { axis: "umidade", personA: humidityA, personB: humidityB, relation: relation(humidityA, humidityB) },
  ];
  const complementaryCount = axisRelations.filter((item) => item.relation === "complementar").length;
  const similarCount = axisRelations.filter((item) => item.relation === "similar").length;
  const anyIndeterminate = axisRelations.some((item) => item.relation === "indeterminado") ||
    a.temperament.status !== "pronto-para-julgamento-qualitativo" || b.temperament.status !== "pronto-para-julgamento-qualitativo";

  const status: TemperamentBond["status"] = classifySynastryTemperamentBond(
    similarCount,
    complementaryCount,
    anyIndeterminate,
  );

  const interpretationKey: string[] = [];
  if (status === "integracao-preferencial") interpretationKey.push("Uma qualidade é compartilhada e uma é diferente: esta é a faixa estrutural preferencial explicitada por Frawley, porque combina reconhecimento com complementaridade. A intensidade real dos dois temperamentos e o terreno comum continuam modulando a leitura.");
  if (status === "similaridade-forte") interpretationKey.push("As duas qualidades são iguais: há reconhecimento temperamental forte, mas também risco de duplicar o mesmo excesso, falta ou defeito. Similaridade não prova suficiência do vínculo.");
  if (status === "oposicao-polar") interpretationKey.push("As duas qualidades são opostas: pode existir complementaridade, mas a polarização pode dificultar compreensão mútua. Terreno comum e intensidade ganham peso decisivo.");
  if (status === "indeterminado") interpretationKey.push("Ao menos um eixo ou cálculo de temperamento não permite polarização segura; não forçar veredito.");

  return {
    status,
    axisRelations,
    personAIntensity: a.temperament.intensity,
    personBIntensity: b.temperament.intensity,
    interpretationKey,
    sourceStatus: "source-locked",
  };
}

function buildSharedGround(a: SynastryPersonFoundation, b: SynastryPersonFoundation): SharedGroundEvidence[] {
  const ascSameSign = a.ascendant.sign === b.ascendant.sign;
  const sameHorizon = a.distribution.horizonMajority !== "equilibrado" && a.distribution.horizonMajority === b.distribution.horizonMajority;
  const sameHemisphere = a.distribution.hemisphereMajority !== "equilibrado" && a.distribution.hemisphereMajority === b.distribution.hemisphereMajority;
  return [
    {
      id: "shared-ascendant-sign",
      present: ascSameSign,
      weight: "primary",
      description: ascSameSign
        ? `Ambos têm Ascendente em ${a.ascendant.sign}: testemunho explícito de terreno comum no exemplo publicado por Frawley.`
        : `Ascendentes em signos diferentes (${a.ascendant.sign} / ${b.ascendant.sign}); isto não é incompatibilidade por si só.`,
      sourceStatus: "example-derived",
    },
    {
      id: "shared-horizon-distribution",
      present: sameHorizon,
      weight: "secondary",
      description: sameHorizon
        ? `Os dois mapas concentram a maioria dos sete planetas ${a.distribution.horizonMajority === "abaixo" ? "abaixo" : "acima"} do horizonte.`
        : "A distribuição acima/abaixo do horizonte não repete o mesmo padrão majoritário.",
      sourceStatus: "example-derived",
    },
    {
      id: "shared-east-west-distribution",
      present: sameHemisphere,
      weight: "secondary",
      description: sameHemisphere
        ? `Os dois mapas concentram a maioria dos sete planetas no hemisfério ${a.distribution.hemisphereMajority}.`
        : "A distribuição leste/oeste não repete o mesmo padrão majoritário.",
      sourceStatus: "example-derived",
    },
  ];
}

function isCoreWeak(natal: NatalAnalysis, planetName: string): boolean {
  const essential = essentialCondition(natal, planetName);
  const accidental = accidentalCondition(natal, planetName);
  if (!essential || !accidental) return false;
  const essentialDebility = essential.debilities.some((item) => ["exilio", "queda", "peregrino"].includes(item.kind));
  const severeSolar = ["combusto", "sob-os-raios"].includes(accidental.solarCondition);
  return essentialDebility || severeSolar || accidental.frawleyScore < 0;
}

function buildSunMoonBridges(
  chartA: BirthChart,
  chartB: BirthChart,
  natalA: NatalAnalysis,
  natalB: NatalAnalysis,
): SunMoonBridge[] {
  const aSun = getPlanetByType(chartA, "sun");
  const aMoon = getPlanetByType(chartA, "moon");
  const bSun = getPlanetByType(chartB, "sun");
  const bMoon = getPlanetByType(chartB, "moon");
  const aMoonInBSun = getSignIndex(getLongitude(aMoon)) === getSignIndex(getLongitude(bSun));
  const bMoonInASun = getSignIndex(getLongitude(bMoon)) === getSignIndex(getLongitude(aSun));
  return [
    {
      direction: "A-Moon-in-B-Sun-sign",
      present: aMoonInBSun,
      sunSign: signName(getLongitude(bSun)),
      moonSign: signName(getLongitude(aMoon)),
      targetSunWeak: isCoreWeak(natalB, bSun.name),
      actorMoonWeak: isCoreWeak(natalA, aMoon.name),
      note: aMoonInBSun
        ? "Indicador preservado do exemplo Newman/Woodward: pode oferecer compreensão da fragilidade do outro quando o restante da sinastria sustenta o vínculo; não é lei autônoma."
        : "O indicador específico Lua-no-signo-do-Sol não está presente nesta direção.",
      sourceStatus: "example-derived",
    },
    {
      direction: "B-Moon-in-A-Sun-sign",
      present: bMoonInASun,
      sunSign: signName(getLongitude(aSun)),
      moonSign: signName(getLongitude(bMoon)),
      targetSunWeak: isCoreWeak(natalA, aSun.name),
      actorMoonWeak: isCoreWeak(natalB, bMoon.name),
      note: bMoonInASun
        ? "Indicador preservado do exemplo Newman/Woodward: pode oferecer compreensão da fragilidade do outro quando o restante da sinastria sustenta o vínculo; não é lei autônoma."
        : "O indicador específico Lua-no-signo-do-Sol não está presente nesta direção.",
      sourceStatus: "example-derived",
    },
  ];
}

interface ContactPoint {
  person: SynastryPersonId;
  name: string;
  pointType: "planet" | "cusp";
  longitude: number;
  planetType?: PlanetType;
  house?: number;
  roles: Set<string>;
}

function buildContactPoints(
  chart: BirthChart,
  natal: NatalAnalysis,
  person: SynastryPersonId,
  interactionPattern: NatalInteractionPattern,
): ContactPoint[] {
  const lordOfNativity = natal.lordOfNativity.planet;
  const planets: ContactPoint[] = getTraditionalPlanets(chart).map((planet) => {
    const roles = new Set<string>();
    if (CORE_TYPES.has(planet.type)) roles.add("core");
    if (planet.name === interactionPattern.selfRuler) roles.add("role-self-ruler");
    if (planet.name === interactionPattern.counterpartRuler) roles.add("role-counterpart-ruler");
    if (planet.name === "Lua") roles.add("role-secondary-self");
    if (planet.name === lordOfNativity) roles.add("lord-of-nativity");
    return {
      person,
      name: planet.name,
      pointType: "planet",
      longitude: getLongitude(planet),
      planetType: planet.type,
      roles,
    };
  });
  const cusps: ContactPoint[] = chart.housesData.house.map((longitude, index) => {
    const house = index + 1;
    const roles = new Set<string>();
    if (house === 1) roles.add("role-self-cusp");
    if (house === interactionPattern.counterpartHouse) roles.add("role-counterpart-cusp");
    if (house === 10) roles.add("career-cusp");
    return {
      person,
      name: cuspPointName(house),
      pointType: "cusp",
      longitude,
      house,
      roles,
    };
  });
  return [...planets, ...cusps];
}

function contactPriority(a: ContactPoint, b: ContactPoint): CrossAspectContact["priority"] {
  const roleRelevant = (point: ContactPoint) => [...point.roles].some((role) => role.startsWith("role-"));
  if (roleRelevant(a) || roleRelevant(b)) return "role-core";
  if (a.roles.has("core") || b.roles.has("core") || a.roles.has("lord-of-nativity") || b.roles.has("lord-of-nativity")) return "core";
  return "supporting";
}

function crossContactProvenance(a: ContactPoint, b: ContactPoint): { status: CrossAspectContact["sourceStatus"]; basis: string } {
  if (a.pointType === "planet" && b.pointType === "planet") {
    return {
      status: "source-locked",
      basis: "Frawley usa contatos planetários entre os mapas como o 'como' da relação, depois do fundamento natal/temperamental.",
    };
  }
  const cusp = a.pointType === "cusp" ? a : b;
  if (cusp.house === 1) {
    return {
      status: "source-locked",
      basis: "Frawley usa explicitamente contatos de planetas de um mapa com o Ascendente do outro no exemplo Newman/Woodward.",
    };
  }
  if (cusp.house === 10) {
    return {
      status: "source-locked",
      basis: "Marcos usa explicitamente planeta de um mapa ligado ao MC/casa X do outro no exemplo Guénon–Schuon para qualificar importância/impacto na obra e carreira.",
    };
  }
  return {
    status: "derived-from-source",
    basis: "Extensão transparente da mecânica planeta–cúspide documentada em ASC/MC para a cúspide temática pertinente; não é apresentada como exemplo literal publicado para esta cúspide específica.",
  };
}

function resolveSynastryCrossContact(a: ContactPoint, b: ContactPoint) {
  if (a.pointType === "planet" && b.pointType === "planet") {
    return resolveTraditionalAspect(
      { longitude: a.longitude, elementType: "planet", planetType: a.planetType },
      { longitude: b.longitude, elementType: "planet", planetType: b.planetType },
    );
  }

  // A cusp is a point, not a planet with its own moiety. Frawley explicitly
  // treats a planet→Ascendant aspect 5° from perfection as operative but weak.
  // Preserve sign-based Ptolemaic geometry and cap all planet↔cusp contacts at 5°.
  const aspectType = getAspectTypeFromSigns(a.longitude, b.longitude);
  if (!aspectType) return null;
  const orbDistance = getTraditionalAspectOrbFromLongitudes(a.longitude, b.longitude, aspectType);
  if (orbDistance > SYNASTRY_CUSP_ASPECT_MAX_ORB) return null;
  return {
    aspectType,
    aspectAngle: 0, // not consumed by the synastry domain
    orbDistance,
    maxOrb: SYNASTRY_CUSP_ASPECT_MAX_ORB,
    applying: false, // cross-natal application/separation is intentionally undefined
  };
}

function collectCrossAspects(
  chartA: BirthChart,
  chartB: BirthChart,
  natalA: NatalAnalysis,
  natalB: NatalAnalysis,
  patternA: NatalInteractionPattern,
  patternB: NatalInteractionPattern,
): CrossAspectContact[] {
  const pointsA = buildContactPoints(chartA, natalA, "A", patternA);
  const pointsB = buildContactPoints(chartB, natalB, "B", patternB);
  const contacts: CrossAspectContact[] = [];
  for (const a of pointsA) {
    for (const b of pointsB) {
      // Marcos usa planeta em cúspide e, no exemplo Guénon–Schuon, planeta no MC.
      // Cúspide–cúspide não é transformada em aspecto: uma cúspide não é agente.
      if (a.pointType === "cusp" && b.pointType === "cusp") continue;
      const match = resolveSynastryCrossContact(a, b);
      if (!match) continue;
      const provenance = crossContactProvenance(a, b);
      contacts.push({
        id: `A:${a.name}|B:${b.name}|${match.aspectType}`,
        personA: "A",
        pointA: a.name,
        pointAType: a.pointType,
        planetTypeA: a.planetType,
        personB: "B",
        pointB: b.name,
        pointBType: b.pointType,
        planetTypeB: b.planetType,
        aspect: match.aspectType,
        orb: match.orbDistance,
        maxOrb: match.maxOrb,
        priority: contactPriority(a, b),
        roleTags: [...new Set([...a.roles, ...b.roles])],
        longitudeA: a.longitude,
        longitudeB: b.longitude,
        houseA: a.house,
        houseB: b.house,
        note: a.pointType === "cusp" || b.pointType === "cusp"
          ? "Contato planeta–cúspide: localiza uma área em que a combinação entre os dois mapas ganha corpo/impacto; não prova afeto nem compatibilidade."
          : "Contato estático entre dois mapas natais: mostra modo de conexão; não se infere aplicação/separação entre épocas natais diferentes.",
        sourceStatus: provenance.status,
        sourceBasis: provenance.basis,
      });
    }
  }
  const priorityOrder = { "role-core": 0, core: 1, supporting: 2 } as const;
  return contacts.sort((x, y) => priorityOrder[x.priority] - priorityOrder[y.priority] || x.orb - y.orb || x.id.localeCompare(y.id));
}

function exaltationRuler(signIndex: number): string | undefined {
  return Object.entries(EXALTATION).find(([, sign]) => sign === signIndex)?.[0];
}

function receptionOwners(longitude: number, sect: "Diurno" | "Noturno") {
  const signIndex = getSignIndex(longitude);
  const degree = normalizeLongitude(longitude) % 30;
  const triplicity = TRIPLICITY_RULERS[SIGN_ELEMENT[signIndex]];
  const owners: Array<{ by: ReceptionKind; receiver: string; strength: number; polarity: "positiva" | "negativa" }> = [
    { by: "domicilio", receiver: DOMICILE_RULER[signIndex], strength: 5, polarity: "positiva" },
  ];
  const exalt = exaltationRuler(signIndex);
  if (exalt) owners.push({ by: "exaltacao", receiver: exalt, strength: 4, polarity: "positiva" });
  owners.push(
    { by: "triplicidade", receiver: sect === "Diurno" ? triplicity.day : triplicity.night, strength: 3, polarity: "positiva" },
    { by: "termo", receiver: LILLY_TERMS[signIndex].find((item) => degree < item.endDeg)!.ruler, strength: 2, polarity: "positiva" },
    { by: "face", receiver: FACES[signIndex][Math.floor(degree / 10)], strength: 1, polarity: "positiva" },
  );
  Object.entries(DETRIMENT).forEach(([receiver, signs]) => {
    if (signs.includes(signIndex)) owners.push({ by: "exilio", receiver, strength: -5, polarity: "negativa" });
  });
  Object.entries(FALL).forEach(([receiver, sign]) => {
    if (sign === signIndex) owners.push({ by: "queda", receiver, strength: -4, polarity: "negativa" });
  });
  return owners;
}

function receptionQuality(by: ReceptionKind, polarity: "positiva" | "negativa"): string {
  if (polarity === "negativa") return by === "exilio" ? "aversão/rejeição forte" : "depreciação/aversão";
  if (by === "domicilio") return "interesse forte e relativamente claro";
  if (by === "exaltacao") return "forte idealização; tendência a não ver claramente";
  if (by === "triplicidade") return "amizade, compreensão e conforto";
  if (by === "termo") return "interesse menor e localizado";
  return "interesse leve/limitado";
}

function lookupContact(contacts: CrossAspectContact[], aPlanet: string, bPlanet: string) {
  return contacts.find((contact) =>
    contact.pointAType === "planet" &&
    contact.pointBType === "planet" &&
    contact.pointA === aPlanet &&
    contact.pointB === bPlanet,
  );
}

function rolePlanetNames(pattern: NatalInteractionPattern): Set<string> {
  return new Set([pattern.selfRuler, pattern.counterpartRuler, "Lua"]);
}

function corePlanetNames(natal: NatalAnalysis, pattern?: NatalInteractionPattern): Set<string> {
  const names = new Set<string>(["Sol", "Lua"]);
  if (natal.lordOfNativity.planet) names.add(natal.lordOfNativity.planet);
  if (pattern) for (const name of rolePlanetNames(pattern)) names.add(name);
  return names;
}

function crossReceptionPriority(
  actorPlanet: string,
  targetPlanet: string,
  actorNatal: NatalAnalysis,
  targetNatal: NatalAnalysis,
  actorPattern: NatalInteractionPattern,
  targetPattern: NatalInteractionPattern,
): CrossReception["priority"] {
  if (rolePlanetNames(actorPattern).has(actorPlanet) || rolePlanetNames(targetPattern).has(targetPlanet)) return "role-core";
  if (corePlanetNames(actorNatal).has(actorPlanet) || corePlanetNames(targetNatal).has(targetPlanet)) return "core";
  return "supporting";
}

function collectCrossReceptions(
  chartA: BirthChart,
  chartB: BirthChart,
  natalA: NatalAnalysis,
  natalB: NatalAnalysis,
  contacts: CrossAspectContact[],
  patternA: NatalInteractionPattern,
  patternB: NatalInteractionPattern,
): CrossReception[] {
  const results: CrossReception[] = [];
  const addDirection = (
    actorChart: BirthChart,
    targetChart: BirthChart,
    actorNatal: NatalAnalysis,
    targetNatal: NatalAnalysis,
    actorPerson: SynastryPersonId,
    targetPerson: SynastryPersonId,
    actorPattern: NatalInteractionPattern,
    targetPattern: NatalInteractionPattern,
  ) => {
    const targetsByName = new Map(getTraditionalPlanets(targetChart).map((planet) => [planet.name, planet]));
    for (const actor of getTraditionalPlanets(actorChart)) {
      for (const owner of receptionOwners(getLongitude(actor), actorNatal.sect)) {
        const target = targetsByName.get(owner.receiver);
        if (!target) continue;
        const aName = actorPerson === "A" ? actor.name : target.name;
        const bName = actorPerson === "A" ? target.name : actor.name;
        const aspectContact = lookupContact(contacts, aName, bName);
        results.push({
          id: `${actorPerson}:${actor.name}->${targetPerson}:${target.name}:${owner.by}`,
          actorPerson,
          actorPlanet: actor.name,
          targetPerson,
          targetPlanet: target.name,
          by: owner.by,
          polarity: owner.polarity,
          strength: owner.strength,
          quality: receptionQuality(owner.by, owner.polarity),
          hasCrossAspect: Boolean(aspectContact),
          aspect: aspectContact?.aspect,
          orb: aspectContact?.orb,
          sectBasis: actorPerson,
          priority: crossReceptionPriority(actor.name, target.name, actorNatal, targetNatal, actorPattern, targetPattern),
          sourceStatus: "derived-from-source",
        });
      }
    }
  };
  addDirection(chartA, chartB, natalA, natalB, "A", "B", patternA, patternB);
  addDirection(chartB, chartA, natalB, natalA, "B", "A", patternB, patternA);
  const priorityOrder = { "role-core": 0, core: 1, supporting: 2 } as const;
  return results.sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority] ||
    Math.abs(b.strength) - Math.abs(a.strength) ||
    Number(b.hasCrossAspect) - Number(a.hasCrossAspect) ||
    a.id.localeCompare(b.id),
  );
}

function collectMutualReceptions(receptions: CrossReception[], contacts: CrossAspectContact[]): CrossMutualReception[] {
  const aPlanets = [...new Set(receptions.filter((item) => item.actorPerson === "A").map((item) => item.actorPlanet))];
  const bPlanets = [...new Set(receptions.filter((item) => item.actorPerson === "B").map((item) => item.actorPlanet))];
  const mutual: CrossMutualReception[] = [];
  for (const aPlanet of aPlanets) {
    for (const bPlanet of bPlanets) {
      const aTowardB = receptions.filter((item) => item.actorPerson === "A" && item.actorPlanet === aPlanet && item.targetPerson === "B" && item.targetPlanet === bPlanet);
      const bTowardA = receptions.filter((item) => item.actorPerson === "B" && item.actorPlanet === bPlanet && item.targetPerson === "A" && item.targetPlanet === aPlanet);
      if (!aTowardB.length || !bTowardA.length) continue;
      const aspect = lookupContact(contacts, aPlanet, bPlanet);
      mutual.push({
        personAPlanet: aPlanet,
        personBPlanet: bPlanet,
        aTowardB,
        bTowardA,
        hasCrossAspect: Boolean(aspect),
        aspect: aspect?.aspect,
        orb: aspect?.orb,
      });
    }
  }
  return mutual.sort((a, b) => Number(b.hasCrossAspect) - Number(a.hasCrossAspect) || (a.orb ?? 999) - (b.orb ?? 999));
}

function receptionsForPair(
  receptions: CrossReception[],
  actorPerson: SynastryPersonId,
  actorPlanet: string,
  targetPerson: SynastryPersonId,
  targetPlanet: string,
) {
  return receptions.filter((item) =>
    item.actorPerson === actorPerson &&
    item.actorPlanet === actorPlanet &&
    item.targetPerson === targetPerson &&
    item.targetPlanet === targetPlanet,
  );
}

function buildRoleResonance(
  patternA: NatalInteractionPattern,
  patternB: NatalInteractionPattern,
  contacts: CrossAspectContact[],
  receptions: CrossReception[],
): RoleResonanceTestimony[] {
  const tests: RoleResonanceTestimony[] = [];

  const getContact = (aPoint: string, bPoint: string) =>
    contacts.find((item) => item.pointA === aPoint && item.pointB === bPoint);

  const addPlanetPair = (
    id: string,
    title: string,
    aPoint: string,
    bPoint: string,
    sourceStatus: RoleResonanceTestimony["sourceStatus"],
  ) => {
    const contact = getContact(aPoint, bPoint);
    const pairReceptions = [
      ...receptionsForPair(receptions, "A", aPoint, "B", bPoint),
      ...receptionsForPair(receptions, "B", bPoint, "A", aPoint),
    ];
    const contactPresent = Boolean(contact);
    const receptionPresent = pairReceptions.length > 0;
    const parts = [
      contact
        ? `há ${contact.aspect} dentro do orbe tradicional (${contact.orb.toFixed(2)}°): existe contato simbólico`
        : "não há aspecto ptolomaico dentro do orbe: não se afirma contato",
      receptionPresent
        ? `há recepção (${pairReceptions.map((item) => `${item.actorPerson}:${item.actorPlanet}→${item.targetPerson}:${item.targetPlanet}/${item.by}`).join("; ")}): existe inclinação/interesse, sem convertê-la em aspecto`
        : "não há recepção cruzada direta materializada entre esses significadores",
    ];
    tests.push({
      id,
      title,
      present: contactPresent || receptionPresent,
      contactPresent,
      receptionPresent,
      description: `${aPoint} (A) ↔ ${bPoint} (B): ${parts.join("; ")}.`,
      aspect: contact?.aspect,
      orb: contact?.orb,
      receptions: pairReceptions,
      sourceStatus,
    });
  };

  // Regentes principais e Lua secundária do nativo. A presença explícita da Lua
  // aqui corrige a lacuna da v2: Marcos usa regente I + Lua no padrão natal e a
  // pessoa concreta não pode perder esse segundo significador quando é cruzada
  // com o papel do outro mapa.
  addPlanetPair("self-to-self", "Regentes principais dos nativos I(A) ↔ I(B)", patternA.selfRuler, patternB.selfRuler, "derived-from-source");
  addPlanetPair("moon-to-moon", "Luas dos dois nativos · significadores secundários", "Lua", "Lua", "derived-from-source");
  addPlanetPair(
    "a-role-to-b-self",
    `Significador do papel '${patternA.roleLabel}' em A ↔ regente I de B`,
    patternA.counterpartRuler,
    patternB.selfRuler,
    patternA.sourceStatus,
  );
  addPlanetPair(
    "a-role-to-b-moon",
    `Significador do papel '${patternA.roleLabel}' em A ↔ Lua de B`,
    patternA.counterpartRuler,
    "Lua",
    patternA.sourceStatus,
  );
  addPlanetPair(
    "a-self-to-b-role",
    `Regente I de A ↔ significador do papel '${patternB.roleLabel}' em B`,
    patternA.selfRuler,
    patternB.counterpartRuler,
    patternB.sourceStatus,
  );
  addPlanetPair(
    "a-moon-to-b-role",
    `Lua de A ↔ significador do papel '${patternB.roleLabel}' em B`,
    "Lua",
    patternB.counterpartRuler,
    patternB.sourceStatus,
  );
  addPlanetPair("role-to-role", "Significadores natais dos dois papéis", patternA.counterpartRuler, patternB.counterpartRuler, "derived-from-source");

  const addCuspTest = (
    id: string,
    title: string,
    contact: CrossAspectContact | undefined,
    descriptionIfPresent: string,
    descriptionIfAbsent: string,
    fallbackStatus: RoleResonanceTestimony["sourceStatus"],
  ) => {
    tests.push({
      id,
      title,
      present: Boolean(contact),
      contactPresent: Boolean(contact),
      receptionPresent: false,
      description: contact ? descriptionIfPresent : descriptionIfAbsent,
      aspect: contact?.aspect,
      orb: contact?.orb,
      receptions: [],
      sourceStatus: contact?.sourceStatus ?? fallbackStatus,
    });
  };

  const aRoleCusp = cuspPointName(patternA.counterpartHouse);
  const bRoleCusp = cuspPointName(patternB.counterpartHouse);

  const bSelfToARoleCusp = getContact(aRoleCusp, patternB.selfRuler);
  addCuspTest(
    "b-self-to-a-role-cusp",
    `Regente I de B ↔ cúspide da casa ${patternA.counterpartHouse} de A`,
    bSelfToARoleCusp,
    `${patternB.selfRuler} de B toca por aspecto a cúspide que representa '${patternA.roleLabel}' no mapa de A: B entra diretamente no campo natal do papel que A lhe atribui.`,
    `${patternB.selfRuler} de B não toca por aspecto, dentro do orbe, a cúspide da casa ${patternA.counterpartHouse} de A.`,
    patternA.sourceStatus,
  );

  const bMoonToARoleCusp = getContact(aRoleCusp, "Lua");
  addCuspTest(
    "b-moon-to-a-role-cusp",
    `Lua de B ↔ cúspide da casa ${patternA.counterpartHouse} de A`,
    bMoonToARoleCusp,
    `A Lua de B, significador secundário de B, toca a cúspide que representa '${patternA.roleLabel}' em A: há ressonância secundária direta com o campo natal do papel.`,
    `A Lua de B não toca por aspecto, dentro do orbe, a cúspide da casa ${patternA.counterpartHouse} de A.`,
    patternA.sourceStatus,
  );

  const aSelfToBRoleCusp = getContact(patternA.selfRuler, bRoleCusp);
  addCuspTest(
    "a-self-to-b-role-cusp",
    `Regente I de A ↔ cúspide da casa ${patternB.counterpartHouse} de B`,
    aSelfToBRoleCusp,
    `${patternA.selfRuler} de A toca por aspecto a cúspide que representa '${patternB.roleLabel}' no mapa de B: A entra diretamente no campo natal do papel que B lhe atribui.`,
    `${patternA.selfRuler} de A não toca por aspecto, dentro do orbe, a cúspide da casa ${patternB.counterpartHouse} de B.`,
    patternB.sourceStatus,
  );

  const aMoonToBRoleCusp = getContact("Lua", bRoleCusp);
  addCuspTest(
    "a-moon-to-b-role-cusp",
    `Lua de A ↔ cúspide da casa ${patternB.counterpartHouse} de B`,
    aMoonToBRoleCusp,
    `A Lua de A, significador secundário de A, toca a cúspide que representa '${patternB.roleLabel}' em B: há ressonância secundária direta com o campo natal do papel.`,
    `A Lua de A não toca por aspecto, dentro do orbe, a cúspide da casa ${patternB.counterpartHouse} de B.`,
    patternB.sourceStatus,
  );

  return tests;
}

function collectAntiscia(
  chartA: BirthChart,
  chartB: BirthChart,
  natalA: NatalAnalysis,
  natalB: NatalAnalysis,
  patternA: NatalInteractionPattern,
  patternB: NatalInteractionPattern,
): CrossAntiscionContact[] {
  const aPlanets = getTraditionalPlanets(chartA);
  const bPlanets = getTraditionalPlanets(chartB);
  const roleA = rolePlanetNames(patternA);
  const roleB = rolePlanetNames(patternB);
  const coreA = corePlanetNames(natalA, patternA);
  const coreB = corePlanetNames(natalB, patternB);
  const contacts: CrossAntiscionContact[] = [];

  const cuspTargets = (chart: BirthChart, pattern: NatalInteractionPattern) =>
    chart.housesData.house.map((longitude, index) => ({
      name: cuspPointName(index + 1),
      longitude,
      house: index + 1,
      roleCore: index + 1 === 1 || index + 1 === pattern.counterpartHouse,
    }));

  const priorityFor = (sourceName: string, sourceRole: Set<string>, sourceCore: Set<string>, targetName: string, targetRole: boolean, targetCore: boolean): CrossAntiscionContact["priority"] => {
    if (sourceRole.has(sourceName) || targetRole) return "role-core";
    if (sourceCore.has(sourceName) || targetCore) return "core";
    return "supporting";
  };

  const testSourceAgainstTargets = (
    sourcePerson: SynastryPersonId,
    sourcePlanets: Planet[],
    sourceRole: Set<string>,
    sourceCore: Set<string>,
    targetPerson: SynastryPersonId,
    targetPlanets: Planet[],
    targetRole: Set<string>,
    targetCore: Set<string>,
    targetCusps: ReturnType<typeof cuspTargets>,
    includePlanetTargets: boolean,
  ) => {
    for (const source of sourcePlanets) {
      const antiscion = normalizeLongitude(540 - getLongitude(source));
      const targets: Array<{
        name: string;
        longitude: number;
        planetType?: PlanetType;
        elementType: "planet" | "house";
        targetPointType: "planet" | "cusp";
        house?: number;
        roleCore: boolean;
        core: boolean;
      }> = [
        ...(includePlanetTargets ? targetPlanets.map((target) => ({
          name: target.name,
          longitude: getLongitude(target),
          planetType: target.type,
          elementType: "planet" as const,
          targetPointType: "planet" as const,
          roleCore: targetRole.has(target.name),
          core: targetCore.has(target.name),
        })) : []),
        ...targetCusps.map((target) => ({
          name: target.name,
          longitude: target.longitude,
          elementType: "house" as const,
          targetPointType: "cusp" as const,
          house: target.house,
          roleCore: target.roleCore,
          core: target.house === 10,
        })),
      ];
      for (const target of targets) {
        const aspectType = getAspectTypeFromSigns(antiscion, target.longitude);
        if (!aspectType) continue;
        const orbDistance = getTraditionalAspectOrbFromLongitudes(antiscion, target.longitude, aspectType);
        if (orbDistance > SYNASTRY_ANTISCION_MAX_ORB) continue;
        const aspectWeight = aspectType === "conjunction" || aspectType === "opposition" ? "principal" : "secondary";
        contacts.push({
          sourcePerson,
          sourcePoint: source.name,
          targetPerson,
          targetPoint: target.name,
          targetPointType: target.targetPointType,
          aspect: aspectType,
          aspectWeight,
          orb: orbDistance,
          maxOrb: SYNASTRY_ANTISCION_MAX_ORB,
          sourceLongitude: getLongitude(source),
          antiscionLongitude: antiscion,
          targetLongitude: target.longitude,
          targetHouse: target.house,
          priority: priorityFor(source.name, sourceRole, sourceCore, target.name, target.roleCore, target.core),
          sourceStatus: "derived-from-source",
          sourceBasis: target.targetPointType === "cusp"
            ? `Marcos usa explicitamente antíscio planetário em cúspide no exemplo Guénon–Schuon. Frawley exige contato muito estreito (cerca de 1°); conjunção/oposição são principais e ${aspectWeight === "secondary" ? "este aspecto ptolomaico é apenas secundário" : "este contato é da classe principal"}. A extensão a qualquer cúspide pertinente permanece marcada como derivação.`
            : `Frawley exige contato de antíscio muito estreito (cerca de 1°), prioriza conjunção/oposição e admite outros aspectos apenas como secundários. Este contato é ${aspectWeight === "secondary" ? "secundário" : "principal"} e nunca substitui padrão natal, aspecto corporal ou recepção.`,
        });
      }
    }
  };

  // Planeta–planeta por antíscio é simétrico: armazena-se A→B uma só vez.
  // Planeta–cúspide é direcional porque a cúspide pertence a uma natividade.
  testSourceAgainstTargets("A", aPlanets, roleA, coreA, "B", bPlanets, roleB, coreB, cuspTargets(chartB, patternB), true);
  testSourceAgainstTargets("B", bPlanets, roleB, coreB, "A", aPlanets, roleA, coreA, cuspTargets(chartA, patternA), false);

  const priorityOrder = { "role-core": 0, core: 1, supporting: 2 } as const;
  return contacts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.orb - b.orb);
}

function summarizeReciprocity(receptions: CrossReception[], mutual: CrossMutualReception[]): SynastrySynthesis["reciprocity"] {
  const role = receptions.filter((item) => item.priority === "role-core");
  const selected = role.length ? role : receptions.filter((item) => item.priority === "core");
  const strongA = selected.filter((item) => item.actorPerson === "A" && Math.abs(item.strength) >= 3);
  const strongB = selected.filter((item) => item.actorPerson === "B" && Math.abs(item.strength) >= 3);
  const relevantMutual = mutual.filter((item) =>
    item.aTowardB.some((r) => r.priority !== "supporting") || item.bTowardA.some((r) => r.priority !== "supporting"),
  );
  const positiveMutual = relevantMutual.some((item) =>
    item.aTowardB.some((r) => r.polarity === "positiva" && Math.abs(r.strength) >= 3) &&
    item.bTowardA.some((r) => r.polarity === "positiva" && Math.abs(r.strength) >= 3),
  );
  const negativeMutual = relevantMutual.some((item) =>
    item.aTowardB.some((r) => r.polarity === "negativa" && Math.abs(r.strength) >= 4) &&
    item.bTowardA.some((r) => r.polarity === "negativa" && Math.abs(r.strength) >= 4),
  );
  if (positiveMutual && negativeMutual) return "mista";
  if (positiveMutual) return "reciproca";
  if (negativeMutual) return "negativa";
  if ((strongA.length > 0) !== (strongB.length > 0)) return "assimetrica";
  if (strongA.some((r) => r.polarity === "negativa") || strongB.some((r) => r.polarity === "negativa")) return "mista";
  return "nao-demonstrada";
}

function mapPatternFit(status: InteractionPatternComparison["status"]): SynastrySynthesis["patternFit"] {
  if (status === "facilitacao-convergente") return "favoravel";
  if (status === "dificuldade-convergente") return "dificil";
  if (status === "assimetrico") return "assimetrico";
  if (status === "misto") return "misto";
  return "indeterminado";
}

function buildSynthesis(
  context: SynastryInteractionContext,
  foundationA: SynastryPersonFoundation,
  foundationB: SynastryPersonFoundation,
  patternA: NatalInteractionPattern,
  patternB: NatalInteractionPattern,
  patternComparison: InteractionPatternComparison,
  temperament: TemperamentBond,
  sharedGround: SharedGroundEvidence[],
  bridges: SunMoonBridge[],
  contacts: CrossAspectContact[],
  receptions: CrossReception[],
  mutual: CrossMutualReception[],
  roleResonance: RoleResonanceTestimony[],
  antiscia: CrossAntiscionContact[],
): SynastrySynthesis {
  const patternFit = mapPatternFit(patternComparison.status);
  const presentGround = sharedGround.filter((item) => item.present);
  const hasSharedGround = presentGround.length > 0;
  const centralReceptions = receptions.filter((item) => item.priority !== "supporting");
  const positiveStrong = centralReceptions.filter((item) => item.polarity === "positiva" && Math.abs(item.strength) >= 3);
  const negativeStrong = centralReceptions.filter((item) => item.polarity === "negativa" && Math.abs(item.strength) >= 4);

  // O vínculo estrutural é um classificador operacional. A primeira causa de
  // decisão agora é o encaixe dos padrões natais de papel, não uma contagem de
  // aspectos nem o antigo eixo I–VII universalizado.
  let structuralBond: SynastrySynthesis["structuralBond"] = "presente";
  if (patternFit === "indeterminado" && temperament.status === "indeterminado") {
    structuralBond = "indeterminado";
  } else if (patternFit === "favoravel" && temperament.status === "integracao-preferencial" && hasSharedGround) {
    structuralBond = "forte";
  } else if (patternFit === "dificil" && temperament.status === "oposicao-polar" && !hasSharedGround) {
    structuralBond = "fraco";
  } else if (patternFit === "indeterminado" && !hasSharedGround) {
    structuralBond = "fraco";
  }

  const activeContact = (id: string) => roleResonance.find((item) => item.id === id)?.contactPresent ?? false;
  const bFitsARole = activeContact("a-role-to-b-self") || activeContact("a-role-to-b-moon");
  const aFitsBRole = activeContact("a-self-to-b-role") || activeContact("a-moon-to-b-role");
  const bHitsARoleCusp = activeContact("b-self-to-a-role-cusp") || activeContact("b-moon-to-a-role-cusp");
  const aHitsBRoleCusp = activeContact("a-self-to-b-role-cusp") || activeContact("a-moon-to-b-role-cusp");
  const selfToSelf = activeContact("self-to-self") || activeContact("moon-to-moon");
  const anyRoleContact = contacts.some((item) => item.priority === "role-core");
  const anyCoreContact = contacts.some((item) => item.priority === "core");

  let contactCapacity: SynastrySynthesis["contactCapacity"] = "baixa";
  if ((bFitsARole || bHitsARoleCusp) && (aFitsBRole || aHitsBRoleCusp) && (selfToSelf || anyRoleContact)) {
    contactCapacity = "alta";
  } else if (bFitsARole || aFitsBRole || bHitsARoleCusp || aHitsBRoleCusp || selfToSelf || anyRoleContact || anyCoreContact) {
    contactCapacity = "moderada";
  }

  const why: string[] = [
    `Padrão natal de A para '${patternA.roleLabel}': ${patternA.tone}.`,
    `Padrão natal de B para '${patternB.roleLabel}': ${patternB.tone}.`,
    `Comparação dos padrões: ${patternComparison.status}. ${patternComparison.description}`,
    `Temperamento: ${temperament.status}; entra depois do pareamento de papéis como fundamento estrutural adicional, não como substituto dele.`,
    hasSharedGround
      ? `Terreno comum materializado: ${presentGround.map((item) => item.id).join(", ")}.`
      : "Nenhum dos testemunhos de terreno comum derivados do exemplo Newman/Woodward foi materializado; isso não equivale a incompatibilidade automática.",
  ];
  if (bridges.some((item) => item.present)) {
    why.push("Há ao menos uma ponte Lua-no-signo-do-Sol do exemplo de Frawley; ela é tratada como testemunho de compreensão, nunca como regra autônoma de amor.");
  }
  if (context.romanticSpecific && (foundationA.romanticMarriageSupplement || foundationB.romanticMarriageSupplement)) {
    why.push("Como o contexto é amoroso/casamento, o suplemento natal I–VII de Marcos é reativado especificamente aqui; ele não governa sinastrias de papéis não relacionais.");
  }

  const roleContacts = roleResonance.filter((item) => item.contactPresent).map((item) => item.title);
  const roleReceptionOnly = roleResonance.filter((item) => item.receptionPresent && !item.contactPresent).map((item) => item.title);
  const cuspImpacts = contacts.filter((item) =>
    (item.pointAType === "cusp" || item.pointBType === "cusp") && item.priority !== "supporting",
  );
  const how: string[] = [
    roleContacts.length
      ? `Contatos diretamente ligados aos papéis: ${roleContacts.join("; ")}.`
      : "Nenhum dos testes principais de ressonância dos papéis produziu aspecto cruzado dentro do orbe.",
    roleReceptionOnly.length
      ? `Recepção sem aspecto nos significadores de papel: ${roleReceptionOnly.join("; ")}; isso mostra inclinação, não ocasião.`
      : "Não há testemunho central dos papéis que dependa somente de recepção sem aspecto.",
    cuspImpacts.length
      ? `Há ${cuspImpacts.length} contato(s) central(is) planeta–cúspide: eles mostram em quais áreas natais a relação tende a ganhar corpo ou importância.`
      : "Nenhum contato central planeta–cúspide foi materializado; não se inventa área de impacto.",
  ];
  if (antiscia.length) {
    how.push(`${antiscia.length} contato(s) por antíscio/contra-antíscio aparecem como testemunhos subordinados; planeta–cúspide por antíscio é permitido porque Marcos o usa explicitamente no exemplo Guénon–Schuon.`);
  }

  const strengths: string[] = [];
  if (patternFit === "favoravel") strengths.push("Os dois padrões natais relevantes convergem para facilitação antes de qualquer contato cruzado.");
  if (positiveStrong.length) {
    strengths.push(`Recepções positivas centrais: ${positiveStrong.slice(0, 8).map((item) => `${item.actorPerson}:${item.actorPlanet}→${item.targetPerson}:${item.targetPlanet} (${item.by})`).join("; ")}${positiveStrong.length > 8 ? "; …" : ""}.`);
  }
  if (mutual.some((item) => item.hasCrossAspect)) {
    strengths.push("Há recepção mútua acompanhada de aspecto em ao menos um par planetário: inclinação recíproca e contato aparecem juntos nesse par.");
  }
  if (hasSharedGround) strengths.push("Existe terreno comum verificável além da mera atração por diferença.");

  const tensions: string[] = [];
  if (patternFit === "dificil") tensions.push("Os dois padrões natais relevantes convergem para dificuldade; contatos cruzados não apagam essa base, apenas mostram sua forma e importância.");
  if (negativeStrong.length) {
    tensions.push(`Recepções negativas centrais: ${negativeStrong.slice(0, 8).map((item) => `${item.actorPerson}:${item.actorPlanet}→${item.targetPerson}:${item.targetPlanet} (${item.by})`).join("; ")}${negativeStrong.length > 8 ? "; …" : ""}.`);
  }
  const oppositions = contacts.filter((item) => item.priority !== "supporting" && item.aspect === "opposition");
  if (oppositions.length) tensions.push(`${oppositions.length} oposição(ões) central(is) mostram conexão por confronto/tensão; a interpretação depende dos significadores e recepções.`);
  if (temperament.status === "oposicao-polar" && !hasSharedGround) tensions.push("Os dois eixos temperamentais estão polarizados e não há testemunho derivado de terreno comum; isso aumenta o risco de incompreensão.");
  if (temperament.status === "similaridade-forte") tensions.push("A forte similitude temperamental pode duplicar o mesmo excesso ou deficiência; procurar contrapesos antes de tratá-la como facilidade.");

  const asymmetries: string[] = [];
  if (patternFit === "assimetrico") asymmetries.push("Os padrões natais dos dois papéis são assimétricos: cada pessoa entra na relação a partir de uma disposição diferente.");
  const reciprocity = summarizeReciprocity(receptions, mutual);
  if (reciprocity === "assimetrica") asymmetries.push("As recepções centrais mostram inclinação forte em uma direção sem equivalente de mesma ordem na outra.");
  if ((bHitsARoleCusp || bFitsARole) !== (aHitsBRoleCusp || aFitsBRole)) asymmetries.push("Um mapa encaixa/toca o papel natal do outro mais diretamente do que o movimento inverso.");

  const growthPotential: string[] = [];
  if (bridges.some((item) => item.present && (item.targetSunWeak || item.actorMoonWeak))) {
    growthPotential.push("Uma ponte Lua–Sol coincide com fragilidade natal em ao menos um dos pontos, possível testemunho de compreensão/apoio no sentido estrito do exemplo de Frawley.");
  }
  if (cuspImpacts.some((item) => item.roleTags.includes("career-cusp"))) {
    growthPotential.push("Há contato relevante com casa X/MC: a relação pode tornar-se importante para ação pública, carreira ou obra, como no tipo de leitura mostrado por Marcos no exemplo Guénon–Schuon.");
  }
  if (context.kind === "teacher-student" || context.kind === "student-teacher") {
    growthPotential.push("No vínculo professor–discípulo, dificuldade não equivale a esterilidade: o exemplo de Marcos mostra que uma relação intelectualmente importante pode conter divergência real e ainda assim ser formativa.");
  }

  return {
    patternFit,
    structuralBond,
    contactCapacity,
    reciprocity,
    why,
    how,
    strengths,
    tensions,
    asymmetries,
    growthPotential,
    limits: [
      "O motor não começa por contatos entre mapas: começa pelos padrões natais dos papéis concretos que A e B ocupam um para o outro.",
      "Aspecto mostra contato/ocasião; recepção mostra inclinação/interesse. Nenhum dos dois é convertido automaticamente no outro.",
      "Sinastria estática não demonstra que duas pessoas necessariamente se encontrarão, formarão casal, permanecerão juntas ou terminarão a relação.",
      "Nenhuma contagem de aspectos é convertida em percentual, nota ou escore global de compatibilidade.",
      "Mentalidade, modos e orientação espiritual são fundamentos natais preservados, mas não recebem um algoritmo cruzado inventado sem fonte publicada.",
      "As categorias sintéticas do motor são classificadores operacionais transparentes; não são citações literais de Marcos ou Frawley.",
    ],
  };
}

function buildCalculationCompleteness(
  inputAudit: SynastryInputAudit,
  foundationA: SynastryPersonFoundation,
  foundationB: SynastryPersonFoundation,
  patternA: NatalInteractionPattern,
  patternB: NatalInteractionPattern,
  temperament: TemperamentBond,
  contacts: CrossAspectContact[],
  receptions: CrossReception[],
  mutualReceptions: CrossMutualReception[],
  roleResonance: RoleResonanceTestimony[],
  antiscia: CrossAntiscionContact[],
): SynastryCalculationCompleteness {
  const checks = {
    inputValidated: inputAudit.valid,
    bothNatalFoundations: foundationA.essentialConditions.length === 7 && foundationB.essentialConditions.length === 7,
    rolePatternsBothSides: Boolean(patternA.counterpartHouseFoundation && patternB.counterpartHouseFoundation),
    moonSecondaryEvidenceBothSides: Boolean(
      patternA.moonEssential && patternA.moonAccidental &&
      patternB.moonEssential && patternB.moonAccidental &&
      Object.prototype.hasOwnProperty.call(patternA, "moonDirectAspect") &&
      Object.prototype.hasOwnProperty.call(patternB, "moonDirectAspect")
    ),
    temperamentCalculated: foundationA.temperament.status === "pronto-para-julgamento-qualitativo" && foundationB.temperament.status === "pronto-para-julgamento-qualitativo" && Boolean(temperament),
    // Arrays may validly be empty. These flags assert that the sweep ran and the
    // result is materialized, not that the sky was obliged to produce a hit.
    crossContactsMaterialized: Array.isArray(contacts),
    crossReceptionsMaterialized: Array.isArray(receptions),
    roleResonanceMaterialized: Array.isArray(roleResonance) && roleResonance.length >= 11,
    antisciaEvaluated: Array.isArray(antiscia),
    aiSafeAnalysisPayloadReady: true,
  };
  const missing: string[] = [];
  for (const [key, ok] of Object.entries(checks)) if (!ok) missing.push(key);
  if (!inputAudit.chartA.hasFullFixedStarSky) missing.push("chartA.fullFixedStarSky");
  if (!inputAudit.chartB.hasFullFixedStarSky) missing.push("chartB.fullFixedStarSky");
  return {
    status: missing.length ? "partial" : "complete",
    checks,
    counts: {
      contacts: contacts.length,
      roleCoreContacts: contacts.filter((item) => item.priority === "role-core").length,
      receptions: receptions.length,
      mutualReceptions: mutualReceptions.length,
      activeRoleResonances: roleResonance.filter((item) => item.present).length,
      antiscia: antiscia.length,
    },
    missing,
    note: missing.length
      ? "O pipeline executou, mas há dados de entrada ou blocos obrigatórios ausentes. A IA deve tratar cada item de missing como MISSING_ENGINE_DATA e não completar por conta própria."
      : "Todos os blocos mecânicos exigidos pela versão 3.0 foram executados e materializados. Zero ocorrências em um inventário é um resultado válido, não dado ausente.",
  };
}

export function calculateSynastryAnalysis(
  chartA: BirthChart,
  chartB: BirthChart,
  options?: SynastryCalculationOptions,
): SynastryAnalysis {
  const inputAudit = auditInputs(chartA, chartB);
  if (!inputAudit.valid) throw new Error(inputAudit.errors.join(" "));

  const interactionContext = buildInteractionContext(options);

  // Fronteira rígida: o motor de sinastria só lê os dossiês natais já
  // calculados. Nenhum arquivo/regra/resultado natal é alterado por esta etapa.
  const natalA = calculateNatalAnalysis(chartA);
  const natalB = calculateNatalAnalysis(chartB);

  const foundationA = buildFoundation(
    chartA,
    natalA,
    "A",
    options?.labelA ?? "Pessoa A",
    interactionContext.romanticSpecific,
  );
  const foundationB = buildFoundation(
    chartB,
    natalB,
    "B",
    options?.labelB ?? "Pessoa B",
    interactionContext.romanticSpecific,
  );

  // Frawley coloca o temperamento na raiz do “porquê”; Marcos também o usa
  // como primeira comparação geral no exemplo direto. O papel concreto é então
  // julgado nos dois natais e comparado ANTES de qualquer contato cruzado.
  const temperamentBond = buildTemperamentBond(foundationA, foundationB);
  const sharedGround = buildSharedGround(foundationA, foundationB);

  const patternA = buildNatalInteractionPattern(
    chartA,
    natalA,
    "A",
    interactionContext.roleA,
    interactionContext.counterpartHouseForA,
    interactionContext.sourceStatus,
  );
  const patternB = buildNatalInteractionPattern(
    chartB,
    natalB,
    "B",
    interactionContext.roleB,
    interactionContext.counterpartHouseForB,
    interactionContext.sourceStatus,
  );
  const patternComparison = compareInteractionPatterns(patternA, patternB);
  const sunMoonBridges = buildSunMoonBridges(chartA, chartB, natalA, natalB);
  const contacts = collectCrossAspects(chartA, chartB, natalA, natalB, patternA, patternB);
  const receptions = collectCrossReceptions(chartA, chartB, natalA, natalB, contacts, patternA, patternB);
  const mutualReceptions = collectMutualReceptions(receptions, contacts);
  const roleResonance = buildRoleResonance(patternA, patternB, contacts, receptions);
  const antiscia = collectAntiscia(chartA, chartB, natalA, natalB, patternA, patternB);
  const calculationCompleteness = buildCalculationCompleteness(
    inputAudit, foundationA, foundationB, patternA, patternB, temperamentBond,
    contacts, receptions, mutualReceptions, roleResonance, antiscia,
  );
  const synthesis = buildSynthesis(
    interactionContext,
    foundationA,
    foundationB,
    patternA,
    patternB,
    patternComparison,
    temperamentBond,
    sharedGround,
    sunMoonBridges,
    contacts,
    receptions,
    mutualReceptions,
    roleResonance,
    antiscia,
  );

  return {
    method: "MathAstro — Sinastria por Padrões Natais de Papel — Marcos/Frawley",
    methodVersion: "4.0.0",
    authority: {
      primary: SYNASTRY_AUTHORITY.primary,
      secondary: SYNASTRY_AUTHORITY.secondary,
    },
    inputAudit,
    interactionContext,
    userContext: {
      focus: options?.userContext?.focus?.trim() || undefined,
      relationshipState: options?.userContext?.relationshipState?.trim() || undefined,
      notes: options?.userContext?.notes?.trim() || undefined,
    },
    foundations: { A: foundationA, B: foundationB },
    interactionPatterns: { A: patternA, B: patternB, comparison: patternComparison },
    temperamentBond,
    sharedGround,
    sunMoonBridges,
    contacts,
    receptions,
    mutualReceptions,
    roleResonance,
    antiscia,
    calculationCompleteness,
    synthesis,
    sourceNotes: [
      "Marcos Monteiro: o passo crucial da sinastria é julgar cada mapa separadamente, encontrar em cada natividade o padrão correspondente ao papel concreto da outra pessoa, comparar esses dois padrões e somente depois olhar os contatos entre os mapas.",
      "Marcos demonstra diretamente o procedimento com professor/mestre ↔ aluno/discípulo: nativo por regente I e secundariamente Lua; alunos pela casa III; professores/mestres pela casa IX. A versão 4.0 materializa tanto aspecto quanto recepções da Lua com o significador do papel e conserva a Lua também na ressonância cruzada.",
      "Marcos usa, no exemplo Guénon–Schuon, contatos de um mapa com cúspides do outro e antíscio planetário em cúspide; por isso planeta–cúspide é materializado e cúspide–cúspide continua proibido. Frawley considera ainda operativo um aspecto de Mercúrio ao Ascendente a 5° (fraco), por isso 5° é adotado como teto operacional local. A relevância de planeta→cúspide é source-locked; a uniformização de 5° para todas as cúspides tem status derived-from-source. Cada contato carrega sourceStatus e sourceBasis próprios.",
      "Frawley: cada natal deve ser avaliado antes da comparação; temperamento fornece parte do 'porquê' e aspectos fornecem o 'como'.",
      "Frawley/Marcos: recepção é inclinação/interesse; aspecto é oportunidade/contato. O motor os mantém em estruturas diferentes.",
      "Frawley: contatos por antíscio precisam ser muito estreitos (nada muito além de 1°); conjunção/oposição são prioritárias e os demais aspectos ptolomaicos por antíscio são apenas secundários. A v4.0 aplica esse limite local sem alterar o motor natal.",
      "Frawley: sinastria não se limita a romance; pode servir a negócios, professor–aluno, empregador–empregado e outras formas de interação.",
      "O eixo I–VII de Marcos não governa mais toda sinastria. Ele reaparece como suplemento específico quando o papel declarado é amoroso/casamento/parceria de VII.",
      "Gugu corrobora diretamente, em transcrição recuperada, que temperamento deve ser analisado antes dos contatos planetários; isso reforça o eixo Frawley sem criar um segundo algoritmo autônomo de sinastria.",
      interactionContext.custom ? "O modo personalizado usa casas e papéis fornecidos pelo usuário; o motor calcula sem esconder que essa escolha é uma derivação contextual, não uma citação literal de Marcos/Frawley para aquela relação." : "O tipo de relação usa um preset documentado no contrato do motor, com proveniência explícita para o pareamento de casas.",
    ],
    unresolvedTechnicalQuestions: [
      "Não foi localizado o conteúdo integral das aulas de sinastria de Marcos; o núcleo do método e o exemplo professor–discípulo foram recuperados, mas nem toda relação possível possui exemplo publicado individual.",
      "As casas para papéis além dos exemplos diretos são derivações transparentes das significações tradicionais já materializadas no motor natal; elas não são apresentadas como citações literais de um exemplo de Marcos para cada relação.",
      "Não foi localizada regra publicada específica para cruzar Partes de relacionamento/casamento de um mapa com pontos do outro; por isso elas permanecem suplemento natal, sem contatos cruzados automáticos.",
      "Não foi localizada fórmula publicada para transformar os dossiês natais de mentalidade/modos em um índice cruzado de comunicação.",
      "Não foi localizada fórmula publicada para converter orientação espiritual natal em um índice de compatibilidade espiritual.",
      "Não foi localizado um orbe exclusivo para antíscios de sinastria; Frawley, porém, publica a regra geral de contato muito estreito (nada muito além de 1°). O motor adota 1° como teto operacional e mantém a aplicação cruzada marcada como derivação subordinada.",
      "Não foi localizado um algoritmo autônomo completo de sinastria de Luiz Gonzaga de Carvalho Neto; há, porém, regra direta recuperada que coloca o temperamento antes dos contatos planetários.",
    ],
    cautions: [
      ...inputAudit.warnings,
      "O tipo de relação deve ser informado corretamente: trocar o papel muda as casas e, portanto, muda o padrão natal que deve ser comparado.",
      "Aplicação/separação é usada apenas dentro de cada mapa natal; nunca é inventada entre planetas pertencentes a duas épocas natais diferentes.",
      "Distribuição por hemisférios e pontes Lua–Sol são indicadores derivados de exemplos de Frawley, não leis universais independentes.",
      "Estrelas fixas entram primeiro nos significadores/casas do padrão natal. Não há varredura arbitrária estrela-de-A contra planeta-de-B.",
      "Aspectos cúspide–cúspide são proibidos; cúspides recebem testemunhos de planetas/antíscios, mas não atuam como agentes entre si.",
      "Antíscios cruzados são testemunhos subordinados e não substituem o pareamento dos padrões natais nem aspectos corporais.",
      "Não transformar automaticamente antíscio em segredo, caso oculto ou traição: Marcos/Frawley só admitem a tonalidade oculta quando o contexto autoriza; o motor materializa o contato e deixa a interpretação contextual para a camada de julgamento.",
      interactionContext.custom ? "Modo personalizado: a correção do pareamento de casas depende da escolha contextual do usuário; o cálculo posterior é determinístico, mas uma casa declarada errada produz o padrão errado." : "O pareamento de casas veio do preset escolhido e conserva seu status de fonte.",
      "Nenhum componente do motor natal, horária, eletiva ou mundana foi modificado para produzir esta sinastria.",
    ],
  };
}
