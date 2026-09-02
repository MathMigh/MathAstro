import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { NatalAnalysis } from "./natalAnalysis";
import { MARCOS_NATAL_INFLUENCE_MAX_ORB } from "@/traditions/western/natal/natalMethodConstants";
import { NatalPrecisionData } from "./natalPrecision";
import { calculateArabicLots, ORDERED_ARABIC_PART_KEYS } from "./arabicLots";
import { getHouseIndex } from "./traditionalCalculations";
import { DOMICILE_RULER, SIGNS } from "./traditionalTables";
import { normalizeLongitude } from "./aspectDynamics";

function dms(value: number): string {
  const totalCircleSeconds = 360 * 3600;
  const totalSeconds = ((Math.round(normalizeLongitude(value) * 3600) % totalCircleSeconds) + totalCircleSeconds) % totalCircleSeconds;
  const signSpan = 30 * 3600;
  const sign = Math.floor(totalSeconds / signSpan) % 12;
  const within = totalSeconds - sign * signSpan;
  const degree = Math.floor(within / 3600);
  const minute = Math.floor((within % 3600) / 60);
  const second = within % 60;
  return `${SIGNS[sign]} ${degree}°${String(minute).padStart(2, "0")}′${String(second).padStart(2, "0")}″`;
}

function orb(value: number): string {
  const totalSeconds = Math.max(0, Math.round(Math.abs(value) * 3600));
  const degree = Math.floor(totalSeconds / 3600);
  const minute = Math.floor((totalSeconds % 3600) / 60);
  const second = totalSeconds % 60;
  return `${degree}°${String(minute).padStart(2, "0")}′${String(second).padStart(2, "0")}″`;
}

function formatCivilTime(raw: string): string {
  const text = String(raw ?? "").trim();
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(text)) {
    const [h, m, sec = "00"] = text.split(":");
    return `${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}:${String(Number(sec)).padStart(2, "0")}`;
  }
  const decimal = Number(text.replace(",", "."));
  if (!Number.isFinite(decimal)) return text || "MISSING_ENGINE_DATA";
  let totalSeconds = Math.round(decimal * 3600);
  totalSeconds = ((totalSeconds % 86400) + 86400) % 86400;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const sec = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function signed(value: number, digits = 6): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function jdDelta(days: number | null): string {
  if (days === null) return "—";
  const abs = Math.abs(days);
  if (abs < 1) return `${(abs * 24).toFixed(3)} h`;
  return `${abs.toFixed(6)} d`;
}

function formatDignities(condition: NatalAnalysis["essentialConditions"][number], includePoints = false): string {
  const pos = condition.dignities.length
    ? condition.dignities.map((item) => includePoints ? `${item.kind} ${item.points > 0 ? "+" : ""}${item.points}` : item.kind).join(", ")
    : "nenhuma";
  const neg = condition.debilities.length
    ? condition.debilities.map((item) => includePoints ? `${item.kind} ${item.points}` : item.kind).join(", ")
    : "nenhuma";
  return `dignidades [${pos}]; debilidades [${neg}]`;
}


function protocolHouseLine(analysis: NatalAnalysis, houseNumber: number): string {
  const house = analysis.technicalForm.houseDossiers.find((item) => item.house === houseNumber);
  if (!house) return `Casa ${houseNumber}: MISSING_ENGINE_DATA.`;
  const ruler = house.rulerEssential && house.rulerAccidental
    ? `${house.domicileRuler}: ${formatDignities(house.rulerEssential)}; casa ${house.rulerAccidental.house}; solar Marcos=${house.rulerAccidental.solarConditionBySource.marcos}; solar Frawley=${house.rulerAccidental.solarConditionBySource.frawleyApplied}; orientação=${house.rulerAccidental.orientation}; velocidade=${house.rulerAccidental.speedRatio.toFixed(4)}×; dispositor=${house.rulerDispositor ?? "—"}`
    : `${house.domicileRuler}: dossiê do regente incompleto`;
  const occupants = house.occupants.length
    ? house.occupants.map((item) => `${item.planet}@${dms(item.longitude)}${item.geometricHouse !== item.effectiveHouseMarcos ? `[geom H${item.geometricHouse}→efetiva H${item.effectiveHouseMarcos}]` : ""}${item.onCuspMarcos ? "[cúspide]" : ""}`).join(", ")
    : "nenhum";
  const cuspContacts = house.cuspPlanetContacts.length
    ? house.cuspPlanetContacts.map((item) => `${item.planet} ${orb(item.orb)}${item.directHouseTestimonyMarcos ? "[testemunho-direto]" : ""}`).join(", ")
    : "nenhum";
  const stars = house.cuspFixedStars.length
    ? house.cuspFixedStars.map((item) => `${item.starName} ${item.orbLabel}[${item.interpretiveTier ?? "tier?"}:${(item.interpretiveSources ?? []).join("+") || "source?"}]`).join(", ")
    : "nenhuma";
  const lots = house.activeLots.length
    ? house.activeLots.map((item) => `${item.name} ${item.aspect} ${orb(item.orb)}${item.activeMarcos ? "[ativa]" : ""}`).join(", ")
    : "nenhuma";
  return `Casa ${houseNumber}: cúspide ${dms(house.cuspLongitude)} ${house.cuspSign}; regente=${house.domicileRuler}; tópicos=[${house.canonicalTopics.join("; ")}]; corpo=[${house.medicalBodyParts.join("; ")}]; co-significador=${house.coSignificatorNatural ?? "—"}; júbilo=${house.joyPlanet ?? "—"}; regente{${ruler}}; ocupantes=${occupants}; contatos-cúspide=${cuspContacts}; estrelas=${stars}; Partes=${lots}.`;
}

function protocolPlanetLine(analysis: NatalAnalysis, planetName: string): string {
  const packet = analysis.technicalForm.planets.find((item) => item.planet === planetName);
  if (!packet) return `${planetName}: MISSING_ENGINE_DATA.`;
  const aspects = packet.aspects.length
    ? packet.aspects.map((item) => `${item.aspect} ${item.planet} ${orb(item.orb)} ${item.applying ? "aplicativo" : "separativo"} ${item.marcosNatalEligible ? `[MARCOS:${item.marcosInfluenceTier}|FRAWLEY-CONTEXT]` : "[FORA-MARCOS>5|FRAWLEY-CONTEXT]"}`).join(" | ")
    : "nenhum";
  const receptionsGiven = packet.receptionsAsGuest.length
    ? packet.receptionsAsGuest.map((item) => `→${item.receiver}/${item.by}/${item.polarity}`).join(", ")
    : "nenhuma";
  const receptionsReceived = packet.receptionsAsReceiver.length
    ? packet.receptionsAsReceiver.map((item) => `←${item.guest}/${item.by}/${item.polarity}`).join(", ")
    : "nenhuma";
  const stars = packet.fixedStars.length ? packet.fixedStars.map((item) => `${item.starName} ${item.orbLabel}[${item.interpretiveTier ?? "tier?"}:${(item.interpretiveSources ?? []).join("+") || "source?"}]`).join(", ") : "nenhuma";
  const nodes = packet.nodeConjunctions.length ? packet.nodeConjunctions.map((item) => `${item.node} ${orb(item.orb)}`).join(", ") : "nenhum";
  const antiscia = packet.antiscionContacts.length ? packet.antiscionContacts.map((item) => `${item.type}:${item.first}-${item.second} ${orb(item.orb)}`).join(", ") : "nenhum";
  return `${packet.planet}: ${dms(packet.longitude)}; rege casas [${packet.ruledHouses.join(", ") || "—"}]; casa geométrica=${packet.housePlacement.geometricHouse}; casa efetiva Marcos=${packet.housePlacement.effectiveHouseMarcos}; casa efetiva Frawley=${packet.housePlacement.effectiveHouseFrawley}; resolução=${packet.housePlacement.resolution}; ${formatDignities(packet.essential)}; acidental{casa efetiva=${packet.accidental.house}; geométrica=${packet.accidental.geometricHouse}; orientação=${packet.accidental.orientation}; solar Marcos=${packet.accidental.solarConditionBySource.marcos}; solar Frawley=${packet.accidental.solarConditionBySource.frawleyApplied}; halb=${packet.accidental.isHalb ? "sim" : "não"}; hayz=${packet.accidental.isHayz ? "sim" : "não"}; vel=${packet.accidental.speedRatio.toFixed(4)}×}; cadeia=${packet.dispositor.chain.join("→")}; aspectos=${aspects}; recepções dadas=${receptionsGiven}; recebidas=${receptionsReceived}; estrelas=${stars}; nodos=${nodes}; antíscios=${antiscia}.`;
}

function normalizeLookup(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function protocolLotLine(analysis: NatalAnalysis, requestedName: string): string {
  const key = normalizeLookup(requestedName);
  const lot = analysis.technicalForm.lots.find((item) => {
    const name = normalizeLookup(item.name);
    const itemKey = normalizeLookup(item.key);
    return name.includes(key) || key.includes(name) || itemKey.includes(key) || key.includes(itemKey);
  });
  if (lot) {
    return `${requestedName}: ${dms(lot.longitude)}; casa geométrica=${lot.housePlacement.geometricHouse}; proximidade à próxima cúspide=${lot.housePlacement.marcosEffectiveHouseCandidate ?? "—"}[CONTATO-APENAS; não relocar Parte como planeta]; dispositor=${lot.domicileDispositor}; relações=${lot.relations.map((item) => `${item.target}:${item.aspect}/${orb(item.orb)}${item.activeMarcos ? "[ativa]" : ""}`).join(", ") || "nenhuma"}.`;
  }
  if (key.includes("filh")) {
    const child = analysis.children.partOfChildren;
    return `${requestedName}: ${dms(child.longitude)}; casa=${child.house}; dispositor=${child.dispositor}; fórmula=${child.formula}; status=${child.formulaStatus}.`;
  }
  if (key.includes("amor") && analysis.relationships.partOfLove) {
    const love = analysis.relationships.partOfLove;
    return `${requestedName}: ${dms(love.longitude)}; casa=${love.housePlacement.geometricHouse}; dispositor=${love.domicileDispositor}.`;
  }
  return `${requestedName}: NOT_MATERIALIZED_AS_GENERIC_LOT; verificar pacote especializado antes de interpretar.`;
}

function protocolRelationLine(analysis: NatalAnalysis, relation: NatalAnalysis["technicalForm"]["interpretationContract"]["protocols"][number]["relations"][number]): string {
  let first = "";
  let second = "";
  if (relation.kind === "house-rulers") {
    first = analysis.technicalForm.houseDossiers[relation.firstHouse - 1]?.domicileRuler ?? "MISSING";
    second = analysis.technicalForm.houseDossiers[relation.secondHouse - 1]?.domicileRuler ?? "MISSING";
  } else if (relation.kind === "fixed-planets") {
    first = relation.firstPlanet;
    second = relation.secondPlanet;
  } else {
    first = relation.planet;
    second = analysis.technicalForm.houseDossiers[relation.house - 1]?.domicileRuler ?? "MISSING";
  }
  const firstPacket = analysis.technicalForm.planets.find((item) => item.planet === first);
  const aspect = firstPacket?.aspects.find((item) => item.planet === second);
  const firstToSecond = analysis.receptions.filter((item) => item.guest === first && item.receiver === second);
  const secondToFirst = analysis.receptions.filter((item) => item.guest === second && item.receiver === first);
  return `${relation.label}: ${first} ↔ ${second}; aspecto=${aspect ? `${aspect.aspect}/${orb(aspect.orb)}/${aspect.applying ? "aplicativo" : "separativo"}/${aspect.marcosNatalEligible ? "MARCOS<=5|FRAWLEY-CONTEXT" : "FORA-MARCOS<=5|FRAWLEY-CONTEXT"}` : "nenhum calculado"}; recepção ${first}→${second}=${firstToSecond.map((item) => `${item.by}/${item.polarity}`).join(",") || "nenhuma"}; ${second}→${first}=${secondToFirst.map((item) => `${item.by}/${item.polarity}`).join(",") || "nenhuma"}.`;
}

function specialistPacketStatus(packet: string, analysis: NatalAnalysis, precision: NatalPrecisionData): string {
  const form = analysis.technicalForm;
  if (packet === "manner" && form.manner.selected === null && form.manner.candidates.length > 1) {
    return "manner=CANDIDATES_MATERIALIZED_QUALITATIVE_SELECTION_REQUIRED";
  }
  const present: Record<string, boolean> = {
    temperament: Boolean(form.temperament),
    lordOfNativity: Boolean(form.lordOfNativity),
    manner: Boolean(form.manner),
    mentality: Boolean(form.mentality),
    modes: Boolean(form.modes),
    lifeIndicatorsFrawley: Boolean(form.lifeIndicatorsFrawley),
    generalFortune: Boolean(form.generalFortune),
    profession: Boolean(form.profession),
    relationships: Boolean(form.relationships),
    healthSymbolic: Boolean(form.healthSymbolic),
    spiritualOrientation: Boolean(form.spiritualOrientation),
    children: Boolean(form.children),
    wealth: Boolean(form.wealth),
    prenatalSyzygy: Boolean(precision.prenatalSyzygy),
  };
  return `${packet}=${present[packet] ? "MATERIALIZED" : "MISSING_ENGINE_DATA"}`;
}

function appendOperationalProtocolDossiers(
  lines: string[],
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
): void {
  const contract = analysis.technicalForm.interpretationContract;
  lines.push("");
  lines.push("28. MATRIZ OPERACIONAL — DOSSIÊS PRÉ-COMPILADOS PARA A IA");
  lines.push(`Cobertura estrutural de contratos: ${contract.coverage.actualSections.length}/${contract.coverage.expectedSections.length}; faltantes=[${contract.coverage.missingSections.join(",") || "nenhum"}]; duplicados=[${contract.coverage.duplicateSections.join(",") || "nenhum"}]; STRUCTURAL_ALL_COVERED=${contract.coverage.allCovered ? "YES" : "NO"}.`);
  lines.push("Regra: GREEN significa que o protocolo tem contrato, evidência pré-materializada e/ou gate explícito. Não significa que uma técnica temporal foi executada sem data nem que uma regra não source-locked foi inventada.");

  contract.protocols.forEach((protocol) => {
    const executionStatus = protocol.phase === "timing"
      ? "TIMING_CONTEXT_REQUIRED"
      : protocol.contextRequirements.length
        ? "READY_WITH_CONTEXT_GATE"
        : "READY_FOR_AI";
    const sourceGate = protocol.id === "mentality-gugu"
      ? "SOURCE_GATE: lugares próprios e semântica Lua–Nodos estão source-locked; permanece sem orbe autoral explícito para ‘perto’/quadratura, portanto o motor expõe geometria e somente gates partís conservadores não autorais."
      : protocol.id === "frawley-timing"
        ? "SOURCE_GATE: escopo atual confirmado; algoritmo detalhado não deve ser inventado quando não publicado no corpus."
        : null;

    lines.push("");
    lines.push(`28.${protocol.section}. [CONTRACT-COVERED] ${protocol.title}`);
    lines.push(`ID=${protocol.id}; fase=${protocol.phase}; execução=${executionStatus}.`);
    lines.push(`FONTES: Marcos=${protocol.sourceTiers.marcos}; Frawley=${protocol.sourceTiers.frawley}; Gugu=${protocol.sourceTiers.gugu}.`);
    if (sourceGate) lines.push(sourceGate);

    const allHouses = [...new Set([...protocol.primaryHouses, ...protocol.rulerHouses, ...protocol.contextHouses])];
    if (allHouses.length) {
      lines.push("CASAS PRÉ-COMPILADAS:");
      allHouses.forEach((house) => lines.push(`  ${protocolHouseLine(analysis, house)}`));
    }

    if (protocol.fixedPlanets.length) {
      lines.push("PLANETAS FIXOS DO PROTOCOLO:");
      protocol.fixedPlanets.forEach((planet) => lines.push(`  ${protocolPlanetLine(analysis, planet)}`));
    }

    if (protocol.relations.length) {
      lines.push("RELAÇÕES PRÉ-CALCULADAS:");
      protocol.relations.forEach((relation) => lines.push(`  ${protocolRelationLine(analysis, relation)}`));
    }

    if (protocol.derivedHouses.length) {
      lines.push("CASAS DERIVADAS — ARITMÉTICA JÁ FEITA PELO MOTOR:");
      protocol.derivedHouses.forEach((derived) => {
        if (derived.baseHouse) {
          const resolved = analysis.technicalForm.derivedHouseTable.find((item) => item.baseHouse === derived.baseHouse && item.relativeHouse === derived.relativeHouse);
          lines.push(`  ${derived.label}: ${resolved ? `${resolved.derivation}; casa resolvida=${resolved.resolvedHouse}; regente=${resolved.resolvedRuler}` : "MISSING_ENGINE_DATA"}. ${derived.note}`);
        } else {
          const possibilities = analysis.technicalForm.derivedHouseTable
            .filter((item) => item.relativeHouse === derived.relativeHouse)
            .map((item) => `base${item.baseHouse}→H${item.resolvedHouse}/${item.resolvedRuler}`)
            .join(" | ");
          lines.push(`  ${derived.label}: CONTEXT_REQUIRED(${derived.contextKey ?? "ator"}); tabela completa=${possibilities}. ${derived.note}`);
        }
      });
    }

    if (protocol.lotNames.length) {
      lines.push("PARTES SOLICITADAS:");
      protocol.lotNames.forEach((name) => lines.push(`  ${protocolLotLine(analysis, name)}`));
    }

    if (protocol.specialistPackets.length) {
      lines.push(`PACOTES ESPECIALIZADOS: ${protocol.specialistPackets.map((packet) => specialistPacketStatus(packet, analysis, precision)).join("; ")}.`);
    }

    if (protocol.id === "mentality-gugu") {
      const moonAlmuten = analysis.mentality.sourceVariants.gugu.moonAlmuten;
      const mercuryAlmuten = analysis.mentality.sourceVariants.gugu.mercuryAlmuten;
      const sunPacket = analysis.technicalForm.planets.find((item) => item.planet === "Sol");
      const ascPacket = analysis.technicalForm.planets.find((item) => item.planet === analysis.mentality.ascendantRuler);
      lines.push(`GUGU — almúten Lua=${moonAlmuten.winner ?? (moonAlmuten.tiedWinners.join("/") || "não resolvido")}; almúten Mercúrio=${mercuryAlmuten.winner ?? (mercuryAlmuten.tiedWinners.join("/") || "não resolvido")}.`);
      lines.push(`GUGU — candidatos compostos preservados: ${analysis.mentality.sourceVariants.gugu.compoundMentalityCandidates.join(", ") || "nenhum"}.`);
      lines.push(`GUGU — MODALIDADES MATERIALIZADAS: ${Object.entries(analysis.modes.guguSupplement.modalityEvidence).map(([key, value]) => `${key}=${value}`).join(", ")}.`);
      lines.push(`GUGU — significadores: ${analysis.modes.guguSupplement.significators.map((item) => `${item.point}:${item.sign}/${item.modality}`).join("; ")}.`);
      lines.push(`GUGU — Sol: ${sunPacket ? `casa=${sunPacket.accidental.house}; solar=${sunPacket.accidental.solarCondition}; orientação=${sunPacket.accidental.orientation}` : "MISSING_ENGINE_DATA"}. Regente ASC ${analysis.mentality.ascendantRuler}: ${ascPacket ? `casa=${ascPacket.accidental.house}; ${formatDignities(ascPacket.essential)}` : "MISSING_ENGINE_DATA"}.`);
      lines.push(`GUGU — casas angulares: ${analysis.profession.guguSupplement.angularProminence.map((item) => `${item.planet}@H${item.house}; ${item.angle} ${orb(item.distanceFromAngle)}`).join("; ") || "nenhuma"}.`);
      lines.push(`GUGU — proximidade aos quatro ângulos, sem cutoff inventado: ${analysis.mentality.sourceVariants.gugu.angleProximity.map((item) => `${item.planet}→${item.nearestAngle}/${orb(item.distanceFromAngle)}`).join("; ")}.`);
      lines.push(`GUGU — orientação dos significadores: ${analysis.mentality.sourceVariants.gugu.orientationEvidence.map((item) => `${item.planet}:${item.orientation}/H${item.house}`).join("; ")}.`);
      lines.push(`GUGU — eixo MC/IC bruto: ${analysis.mentality.sourceVariants.gugu.mcIcProximity.map((item) => `${item.planet}:MC ${orb(item.distanceFromMC)}, IC ${orb(item.distanceFromIC)}, mais perto=${item.nearer}`).join("; ")}.`);
      lines.push(`GUGU — planetas efetivos na I, sem declarar excepcionalidade sem cutoff source-locked: ${analysis.mentality.sourceVariants.gugu.ascendantPlanetsRaw.map((item) => `${item.planet}/${orb(item.distanceFromASC)}; dignidades=[${item.essentialDignities.join(",") || "nenhuma"}]; debilidades=[${item.essentialDebilities.join(",") || "nenhuma"}]`).join(" | ") || "nenhum"}.`);
      const moonNode = analysis.mentality.sourceVariants.gugu.moonNodeRawDistance;
      lines.push(`GUGU — Lua–Nodos: Norte=${moonNode.northNode === null ? "—" : orb(moonNode.northNode)}; Sul=${moonNode.southNode === null ? "—" : orb(moonNode.southNode)}; mais próximo=${moonNode.nearestNode ?? "—"}/${moonNode.nearestDistance === null ? "—" : orb(moonNode.nearestDistance)}; erro quadratura Norte=${moonNode.northSquareError === null ? "—" : orb(moonNode.northSquareError)}; Sul=${moonNode.southSquareError === null ? "—" : orb(moonNode.southSquareError)}; partil-conservador perto<=1°=${moonNode.conservativePartileNearNode1Deg ? "sim" : "não"}; quadratura<=1°=${moonNode.conservativePartileSquare1Deg ? "sim" : "não"}; semântica fonte: perto→${moonNode.sourceRule.nearNode}, quadratura→${moonNode.sourceRule.squareNodes}; status=${moonNode.interpretationStatus}.`);
      const properPlaces = analysis.mentality.sourceVariants.gugu.properPlaces;
      lines.push(`GUGU — lugares próprios: status=${analysis.mentality.sourceVariants.gugu.properPlacesStatus}; ${properPlaces.map((item) => `${item.planet}: offset=${item.offsetSigns}, antes-da-Lua=${item.signsBeforeMoon}${item.beforeMoonMatch ? "✓" : ""}, depois-do-Sol=${item.signsAfterSun}${item.afterSunMatch ? "✓" : ""}, lugar-próprio=${item.inProperPlace ? "sim" : "não"}`).join(" | ")}.`);
    }

    if (protocol.phase === "timing") {
      lines.push(`TIMING GATE: o relatório natal estático não executa esta técnica sem contexto. Evidências exigidas=[${protocol.requiredEngineEvidence.join("; ")}].`);
    } else {
      lines.push(`EVIDÊNCIA EXIGIDA DO MOTOR: ${protocol.requiredEngineEvidence.join("; ")}.`);
    }
    lines.push(`CAMPOS DE CONCLUSÃO DA IA: ${protocol.requiredOutputFields.join("; ")}.`);
    lines.push(`CONTEXTO NECESSÁRIO: ${protocol.contextRequirements.join("; ") || "nenhum"}.`);
    lines.push(`IA NÃO PODE: ${protocol.aiProhibitions.join("; ") || "nenhuma proibição adicional"}.`);
  });

  lines.push("");
  lines.push("29. CONTRATO FINAL DE NÃO-RECÁLCULO PELA IA");
  lines.push(`Blocos obrigatórios: ${contract.aiOutputRules.requiredBlocks.join(" → ")}.`);
  lines.push(`Cálculos proibidos à IA: ${contract.aiOutputRules.forbiddenCalculations.join(", ")}.`);
  lines.push(contract.aiOutputRules.conclusionRule);
}

export type NatalReportProfile = "ai-clean" | "audit";

export function generateNatalTechnicalReport(
  chart: BirthChart,
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
  options: { profile?: NatalReportProfile } = {},
): string {
  const profile = options.profile ?? "ai-clean";
  const audit = profile === "audit";
  const lines: string[] = [];
  const meta = chart.calculationMetadata;
  const coords = chart.birthDate.coordinates;
  const lots = calculateArabicLots(chart);

  lines.push(audit
    ? "MAPA NATAL TRADICIONAL — FORMULÁRIO TÉCNICO DE AUDITORIA"
    : "MAPA NATAL TRADICIONAL — FORMULÁRIO TÉCNICO LIMPO PARA INTERPRETAÇÃO POR IA");
  lines.push("==========================================================================");
  lines.push("");
  lines.push(`PERFIL_DE_SAÍDA=${profile.toUpperCase().replace("-", "_")}.`);
  lines.push("PRINCÍPIO: o motor calcula astronomia, geometria e relações técnicas; a IA interpreta posteriormente.");
  if (!audit) lines.push("REGRA DE HIGIENE: scores/ledgers históricos são omitidos deste perfil para não contaminar o julgamento da IA; permanecem no relatório de auditoria separado.");
  lines.push("");
  lines.push("1. DADOS DE ENTRADA E AUDITORIA TEMPORAL");
  lines.push(`Nascimento civil: ${String(chart.birthDate.day).padStart(2,"0")}/${String(chart.birthDate.month).padStart(2,"0")}/${chart.birthDate.year} ${formatCivilTime(chart.birthDate.time)}`);
  lines.push(`Local: ${coords.name ?? "não nomeado"}`);
  lines.push(`Coordenadas: latitude ${coords.latitude.toFixed(10)}°, longitude ${coords.longitude.toFixed(10)}°`);
  lines.push(`Fuso IANA: ${meta?.timezone ?? "—"}`);
  lines.push(`UTC: ${meta?.utcIso ?? "—"}`);
  lines.push(`JD(UT): ${meta?.julianDayUt.toFixed(8) ?? "—"}`);
  lines.push(`Motor: ${meta?.engine ?? "Swiss Ephemeris"}; zodíaco tropical; calendário ${meta?.calendar ?? "Gregoriano"}.`);
  lines.push(`Nodo canônico Marcos: ${meta?.nodeMode ?? "Nodo verdadeiro"}.`);
  if (meta?.auxiliaryNodes) {
    lines.push(`Nodo N verdadeiro ${dms(meta.auxiliaryNodes.trueNorthLongitude)} | médio ${dms(meta.auxiliaryNodes.meanNorthLongitude)} (diferença ${orb(meta.auxiliaryNodes.trueNorthLongitude-meta.auxiliaryNodes.meanNorthLongitude)}).`);
  }

  lines.push("");
  lines.push("2. POSIÇÕES ASTRONÔMICAS");
  precision.planets.forEach((planet) => {
    const house = getHouseIndex(planet.longitude, chart.housesData.house);
    lines.push(`${planet.name}: ${dms(planet.longitude)} | casa geométrica ${house} | lat ${planet.latitude === null ? "—" : signed(planet.latitude)}° | vel. long. ${signed(planet.longitudeSpeed)}°/dia | RA ${planet.rightAscension === null ? "—" : planet.rightAscension.toFixed(6)+"°"} | Dec ${planet.declination === null ? "—" : signed(planet.declination)+"°"} | ${planet.retrograde ? "retrógrado" : "direto"}.`);
  });

  lines.push("");
  lines.push("3. CASAS — REGIOMONTANUS (CANÔNICO DO PROJETO) E PLACIDUS (PARALELO)");
  precision.houses.regiomontanus.forEach((cusp, index) => {
    const placidus = precision.houses.placidus?.[index];
    lines.push(`Casa ${index+1}: R ${dms(cusp)}${placidus === undefined ? "" : ` | P ${dms(placidus)} | Δ ${orb(cusp-placidus)}`}`);
  });
  lines.push("Almútens de grau/cúspide (camada histórica/Gugu; não canônico Frawley atual):");
  analysis.cuspAlmutens.forEach((item, index) => lines.push(audit
    ? `  Casa ${index+1}: ${item.winner ?? item.tiedWinners.join("/")} | ledger ${Object.entries(item.scores).map(([p,v]) => `${p}=${v}`).join(", ")}.`
    : `  Casa ${index+1}: ${item.winner ?? (item.tiedWinners.length ? `empate ${item.tiedWinners.join("/")}` : "não resolvido")}.`));

  lines.push("");
  lines.push("4. GEOMETRIA DE CASAS/CÚSPIDES — SEM REMAPEAMENTO SILENCIOSO");
  precision.placements.forEach((placement) => {
    lines.push(`${placement.point}: casa ${placement.geometricHouse}; próxima cúspide ${placement.nextCusp} em ${dms(placement.nextCuspLongitude)}; distância ${orb(placement.distanceToNextCusp)} (${(placement.distanceFractionOfHouse * 100).toFixed(1)}% do arco da casa); mesmo signo=${placement.sameSignAsNextCusp ? "sim" : "não"}; velocidade=${placement.longitudeSpeed === null ? "—" : `${signed(placement.longitudeSpeed)}°/dia`}; dinâmica=${placement.motionTowardNextCusp}; faixas mesmo-signo 2°=${placement.withinTwoDegreesSameSign ? "sim" : "não"}, 3°=${placement.withinThreeDegreesSameSign ? "sim" : "não"}, 5°=${placement.withinMarcosBaseFiveDegrees ? "sim" : "não"}; 5° equivalem a ${(placement.fiveDegreesFractionOfHouse * 100).toFixed(1)}% da casa; decisão fonte=${placement.sourceDecision}; tamanho eclíptico=${orb(placement.houseArcSize)}.`);
  });

  lines.push("");
  lines.push("5. SECTA E TEMPERAMENTO — MARCOS MONTEIRO");
  lines.push(`Secta: ${analysis.sect}.`);
  lines.push(`Status do temperamento: ${analysis.temperament.status}; conclusão canônica automática=${analysis.temperament.canonicalConclusion ?? "NÃO — julgamento qualitativo pela IA"}.`);
  lines.push(audit
    ? "Os cinco testemunhos são preservados; a aritmética interna de compatibilidade permanece apenas na auditoria e NÃO é método canônico."
    : "Os cinco testemunhos são preservados qualitativamente. O motor NÃO decide o temperamento por votação/score; a IA julga convergência, intensidade e contradições segundo Marcos.");
  analysis.temperament.witnesses.forEach((witness, index) => {
    const details = audit ? witness.details : witness.qualitativeDetails;
    lines.push(`T${index+1} ${witness.label}: ${details}; qualidades categóricas=[${witness.qualitativeContributions.join(", ") || "não resolvidas"}]`);
  });
  lines.push(`Senhor da Natividade: ${analysis.lordOfNativity.planet ?? "não resolvido"}; resolução=${analysis.lordOfNativity.resolution}; hierarquia essencial=${Object.entries(analysis.lordOfNativity.essentialHierarchy).filter(([,active]) => active).map(([name]) => name).join(" > ") || "sem dignidade essencial"}; empate=${analysis.lordOfNativity.tiedCandidates.join(", ") || "não"}. Aspectos/condição acidental são evidência, não desempate automático.`);

  lines.push("");
  lines.push("5.2. TEMPERAMENTOS AUTORAIS EM PARALELO — SEM FUSÃO");
  lines.push(`Marcos: ${analysis.temperaments.marcos.method}; status=${analysis.temperaments.marcos.status}; Senhor da Natividade=${analysis.temperaments.marcos.lordOfNativity.planet ?? "não resolvido"} (${analysis.temperaments.marcos.lordOfNativity.resolution}).`);
  lines.push(`Frawley: ${analysis.temperaments.frawley.method}; baseline=${analysis.temperaments.frawley.publishedBaselineSource}; currentExact=${analysis.temperaments.frawley.exactCurrentCalculationStatus}.`);
  analysis.temperaments.frawley.witnesses.forEach((w) => lines.push(`  Frawley/${w.key}: qualidades=[${w.qualities.join(", ")}]; ${w.evidence.join(" ")}`));
  lines.push(`Gugu: ${analysis.temperaments.gugu.method}; camada posterior=${analysis.temperaments.gugu.laterCourseStatus}.`);
  analysis.temperaments.gugu.historicalFourComponents.forEach((w) => lines.push(`  Gugu/${w.key}: qualidades=[${w.qualities.join(", ")}]; ${w.evidence.join(" ")}`));
  lines.push(analysis.temperaments.frawley.note);
  lines.push(analysis.temperaments.gugu.note);

  lines.push("");
  lines.push("5.3. GUGU — MOTIVAÇÃO PRIMÁRIA, POTÊNCIAS DA ALMA E QUADRO SIMBÓLICO");
  const gm = analysis.gugu.primaryMotivation;
  lines.push(`Motivação primária: ASC ${dms(gm.ascendant.longitude)} (${gm.ascendant.sign}) → regente ${gm.ascendantRuler.planet} em H${gm.ascendantRuler.house} → dispositor/instrumento ${gm.realizationInstrument.planet} em H${gm.realizationInstrument.house}.`);
  lines.push(`Capacidade/planeta mais forte: status=${gm.selectionStatus}; selecionado=${gm.selectedStrongestPlanet ?? "julgamento qualitativo"}; candidatos=${gm.strongestPlanetCandidates.map((c) => `${c.planet}/H${c.house}/${c.candidateStatus}`).join(", ") || "nenhum"}.`);
  lines.push(`Desafio saturnino: Saturno em H${gm.saturnChallenge.house} (${gm.saturnChallenge.sign}); ${gm.saturnChallenge.interpretationAxis}.`);
  lines.push(`Potências/faculdades analógicas: ${analysis.gugu.powersOfSoul.faculties.map((f) => `${f.planet}=${f.faculty}@H${f.house}`).join("; ")}.`);
  lines.push(`Guardrails Gugu: ${analysis.gugu.philosophicalFrame.interpretiveProhibitions.join(" | ")}`);

  lines.push("");
  lines.push("6. DIGNIDADES E DEBILIDADES ESSENCIAIS");
  analysis.essentialConditions.forEach((condition) => {
    const base = `${condition.planet}: ${dms(condition.longitude)}; regentes do grau: domicílio=${condition.rulers.domicile}, exaltação=${condition.rulers.exaltation ?? "—"}, triplicidade=${condition.rulers.triplicity}, termo=${condition.rulers.term}, face=${condition.rulers.face}; ${formatDignities(condition)}; peregrino=${condition.isPeregrine ? "sim" : "não"}`;
    lines.push(audit
      ? `${base}; ledger histórico Marcos=${condition.marcosScore}, 5/4/3/2/1=${condition.frawleyScore}.`
      : `${base}.`);
  });

  lines.push("");
  lines.push(audit ? "7. CONDIÇÕES ACIDENTAIS — AUDITORIA DE TESTEMUNHOS" : "7. CONDIÇÕES ACIDENTAIS — TESTEMUNHOS QUALITATIVOS");
  analysis.accidentalConditions.forEach((condition) => {
    lines.push(`${condition.planet}: casa geométrica=${condition.geometricHouse}; casa efetiva Marcos=${condition.effectiveHouseMarcos}; casa efetiva Frawley=${condition.effectiveHouseFrawley}; resolução=${condition.houseResolution}; orientação=${condition.orientation}; solar Marcos=${condition.solarConditionBySource.marcos}; solar Frawley Applied=${condition.solarConditionBySource.frawleyApplied}; distância solar=${condition.solarConditionBySource.solarDistance.toFixed(4)}°; halb=${condition.isHalb ? "sim" : "não"}; hayz=${condition.isHayz ? "sim" : "não"}; razão de velocidade=${condition.speedRatio.toFixed(4)}.`);
    condition.testimonies.forEach((testimony) => lines.push(audit
      ? `  - ${testimony.label}: ${testimony.details} [fonte do testemunho=${testimony.source}; score auxiliar=${testimony.score}; proveniência do score=${testimony.scoreProvenance}]`
      : `  - ${testimony.label}: ${testimony.details} [fonte=${testimony.source}]`));
  });

  lines.push("");
  lines.push("8. ASPECTOS NATAIS — INFLUÊNCIA MARCOS + DINÂMICA EFEMÉRICA EXATA");
  if (precision.exactAspectDynamics.length === 0) lines.push("Nenhum aspecto de influência <=5° entre os sete planetas tradicionais (Marcos: <=3° núcleo; >3°–5° contextual).");
  precision.exactAspectDynamics.forEach((aspect) => {
    lines.push(`${aspect.first} ${aspect.aspect} ${aspect.second}: orbe ${orb(aspect.currentOrb)}; faixa Marcos=${aspect.influenceBandMarcos}; agora=${aspect.currentMotion}; status=${aspect.perfectionStatus}; perfeição anterior=${jdDelta(aspect.previousPerfectionDaysAgo)}; próxima=${jdDelta(aspect.nextPerfectionDays)}; bloqueio=${aspect.blocker ?? "nenhum"}${aspect.blockerJd ? ` em JD ${aspect.blockerJd.toFixed(8)}` : ""}. ${aspect.evidence}`);
  });

  lines.push("");
  lines.push("9. RECEPÇÕES");
  analysis.receptions.forEach((reception) => {
    const strengthAudit = audit ? `; ledger-força=${reception.strength}` : "";
    lines.push(`${reception.guest} está em dignidade/debilidade de ${reception.receiver} por ${reception.by}; polaridade=${reception.polarity}${strengthAudit}; aspecto entre ambos=${reception.hasAspect ? `${reception.aspect}, orbe ${reception.orb?.toFixed(4)}°` : "não"}.`);
  });

  lines.push("");
  lines.push("10. DISPOSITORES");
  analysis.dispositors.chains.forEach((chain) => {
    lines.push(`${chain.planet}: ${chain.chain.join(" → ")}${chain.finalDispositor ? `; final=${chain.finalDispositor}` : ""}${chain.cycle ? `; ciclo=${chain.cycle.join(" → ")}` : ""}.`);
  });
  lines.push(`Dispositor final global: ${analysis.dispositors.globalFinalDispositor ?? "não existe"}.`);

  lines.push("");
  lines.push("11. PARTES ÁRABES FUNDAMENTAIS — MARCOS");
  ORDERED_ARABIC_PART_KEYS.forEach((key) => {
    const lot = lots[key];
    if (!lot) return;
    const sign = Math.floor(lot.longitude / 30)%12;
    const ruler = DOMICILE_RULER[sign];
    const dossier = analysis.technicalForm.lots.find((item) => item.key === key);
    lines.push(`Parte ${lot.name}: ${dms(lot.longitude)} | fórmula ${lot.formulaDescription} | casa ${getHouseIndex(lot.longitude, chart.housesData.house)} | dispositor ${ruler} | antíscio ${dms(lot.antiscionRaw)} | contra-antíscio ${dms(lot.antiscionRaw+180)}.`);
    dossier?.relations.forEach((relation) => lines.push(`  - Marcos contato ${relation.targetType}: ${relation.target}, ${relation.aspect}, orbe ${orb(relation.orb)}, ativo<=1°=${relation.activeMarcos ? "sim" : "não"}.`));
    dossier?.frawleyPublishedAspects.forEach((relation) => lines.push(`  - Frawley Applied aspecto recebido de ${relation.planet}: ${relation.aspect}, orbe ${orb(relation.orb)}.`));
  });

  lines.push("");
  lines.push("12. ANTÍSCIOS E CONTRA-ANTÍSCIOS");
  analysis.antiscia.positions.forEach((position) => lines.push(`${position.point}: antíscio ${dms(position.antiscion)} | contra-antíscio ${dms(position.oppositeAntiscion)}.`));
  analysis.antiscia.contacts.forEach((contact) => lines.push(`Contato: ${contact.first} ↔ ${contact.second}: ${contact.type}, orbe ${orb(contact.orb)}.`));

  lines.push("");
  lines.push("13. ESTRELAS FIXAS — CÉU NATAL + CONTATOS INTERPRETATIVOS");
  const starCatalog = chart.fixedStarCatalog ?? [];
  const starMeta = chart.fixedStarCatalogMetadata;
  const starMatches = chart.fixedStarMatches ?? [];
  if (starMeta) {
    lines.push(`Catálogo: ${starMeta.source}; registros brutos=${starMeta.rawRecords}; estrelas únicas=${starMeta.uniqueEntries}; calculadas=${starMeta.calculatedEntries}; falhas=${starMeta.failedEntries}; acima do horizonte=${starMeta.aboveHorizonEntries ?? "n/d"}; modo=${starMeta.calculationMode}.`);
    starMeta.notes.forEach((note) => lines.push(`  - ${note}`));
  }
  if (starCatalog.length && audit) {
    lines.push("13.1. Grupo principal estilo Astro-Seek/Beheniano — posições no instante natal [AUDITORIA/EXIBIÇÃO; não é testemunho automático]");
    starCatalog.filter((star) => star.isAstroSeekMajor15).forEach((star) => {
      lines.push(`  ${star.name}: ${dms(star.longitude)}; lat=${star.latitude.toFixed(4)}°; RA=${star.rightAscension.toFixed(4)}°; Dec=${star.declination.toFixed(4)}°; mag=${star.magnitude ?? "n/d"}; casa R=${star.houseRegiomontanus ?? "n/d"}; casa P=${star.housePlacidus ?? "n/d"}; horizonte=${star.aboveHorizon ? "acima" : "abaixo"} (${star.altitude?.toFixed(2) ?? "n/d"}°).`);
    });
  } else if (starCatalog.length) {
    lines.push("13.1. Céu completo calculado e disponível na auditoria/interface; a versão IA omite listas de exibição e recebe apenas contatos interpretativos source-locked abaixo.");
  } else if (starMeta?.calculationMode === "failed") {
    lines.push("FALHA DO MOTOR DE ESTRELAS FIXAS: não interpretar ausência de catálogo como ausência de estrelas ou contatos.");
  }
  lines.push("13.2. Contatos INTERPRETATIVOS source-locked preservados");
  const interpretiveStarMatches = starMatches.filter((match) => match.isRelevant);
  const astronomicalOnlyMatches = starMatches.filter((match) => !match.isRelevant);
  if (!interpretiveStarMatches.length && starCatalog.length) {
    lines.push("Catálogo estelar calculado com sucesso, mas nenhum contato passou pelos filtros interpretativos source-locked. Isso NÃO significa ausência de estrelas no céu natal.");
  }
  interpretiveStarMatches.forEach((match) => {
    lines.push(`${match.pointName} ↔ ${match.starName}${match.starNomenclature ? ` [${match.starNomenclature}]` : ""}: ${dms(match.starLongitude)}; orbe ${orb(match.orb)}; limite=${match.maxOrb ?? 1}°; tier=${match.interpretiveTier ?? "legacy"}; fontes=[${match.interpretiveSources?.join(",") || "não registradas"}]; dominante=${match.isDominantInCluster ? "sim" : "não"}${match.nature ? `; natureza=${match.nature}` : ""}.`);
  });
  if (audit && astronomicalOnlyMatches.length) {
    lines.push(`13.3. CONTATOS SOMENTE ASTRONÔMICOS / NÃO INTERPRETAR (${astronomicalOnlyMatches.length})`);
    astronomicalOnlyMatches.forEach((match) => lines.push(`  ${match.pointName} ↔ ${match.starName}${match.starNomenclature ? ` [${match.starNomenclature}]` : ""}: orbe ${orb(match.orb)}; tier=${match.interpretiveTier}; motivo=${match.interpretiveReason ?? "não source-locked"}.`));
  } else if (astronomicalOnlyMatches.length) {
    lines.push(`13.3. ${astronomicalOnlyMatches.length} coincidência(s) astronômica(s) secundária(s) foram preservadas na estrutura, mas excluídas do julgamento da IA.`);
  }
  if (starCatalog.length) {
    lines.push(`13.4. Catálogo completo disponível na estrutura fixedStarCatalog (${starCatalog.length} objetos estelares/catalogais) e na tabela visual "Céu natal"; não é despejado integralmente neste texto.`);
  }

  lines.push("");
  lines.push("13.3. URANO, NETUNO E PLUTÃO — MODIFICADORES SECUNDÁRIOS MARCOS");
  analysis.outerPlanetModifiers.forEach((outer) => {
    lines.push(`${outer.planet}: ${dms(outer.longitude)}, H${outer.geometricHouse}; geometrias conj/opp=${outer.contacts.map((c) => `${c.aspect} ${c.target} ${orb(c.orb)} [proximidade-genérica:${c.tier}; cutoff-autoral:${c.authorialOrbStatus}; auto=${c.automaticInterpretation ? "sim" : "não"}]`).join("; ") || "nenhuma"}; política=${outer.policy.role}; regência=${outer.policy.rulership}; dignidade=${outer.policy.essentialDignity}; almuten=${outer.policy.almutenParticipation}; orbe especial=${outer.policy.authorialOrbStatus}.`);
  });

  lines.push("");
  lines.push("14. MENTALIDADE — DADOS, SEM INTERPRETAÇÃO");
  lines.push(`Lua: ${dms(analysis.mentality.moon.longitude)}; ${analysis.mentality.moon.element}; ${analysis.mentality.moon.modality}; fase=${analysis.mentality.moon.phase}; ângulo de fase=${analysis.mentality.moon.phaseAngle.toFixed(6)}°; dispositor=${analysis.mentality.moon.domicileDispositor}; almúten do grau=${analysis.mentality.moon.degreeAlmuten.winner ?? analysis.mentality.moon.degreeAlmuten.tiedWinners.join("/")}.`);
  lines.push(`Mercúrio: ${dms(analysis.mentality.mercury.longitude)}; ${analysis.mentality.mercury.element}; ${analysis.mentality.mercury.modality}; solar Marcos=${analysis.mentality.mercury.accidentalCondition.solarConditionBySource.marcos}; solar Frawley Applied=${analysis.mentality.mercury.accidentalCondition.solarConditionBySource.frawleyApplied}; dispositor=${analysis.mentality.mercury.domicileDispositor}; almúten do grau=${analysis.mentality.mercury.degreeAlmuten.winner ?? analysis.mentality.mercury.degreeAlmuten.tiedWinners.join("/")}.`);
  lines.push(`Lua–Mercúrio — MARCOS: ${analysis.mentality.moonMercuryConnection.connected ? `${analysis.mentality.moonMercuryConnection.aspect}, orbe ${orb(analysis.mentality.moonMercuryConnection.orb ?? 0)}, dentro de <=5°` : "sem ligação natal válida dentro de <=5°"}.`);
  if (analysis.mentality.moonMercuryConnection.geometricConnected && !analysis.mentality.moonMercuryConnection.connected) {
    lines.push(`Lua–Mercúrio — GEOMETRIA/FRAWLEY-CONTEXT: ${analysis.mentality.moonMercuryConnection.aspect}, orbe ${orb(analysis.mentality.moonMercuryConnection.orb ?? 0)}; FORA da faixa Marcos, não promover à camada Marcos.`);
  }
  const marcosMentalModifiers = analysis.mentality.modifyingAspects.filter((item) => item.marcosNatalEligible);
  const frawleyOnlyMentalModifiers = analysis.mentality.modifyingAspects.filter((item) => !item.marcosNatalEligible);
  marcosMentalModifiers.forEach((item) => lines.push(`Modificador [MARCOS:${item.marcosInfluenceTier}|FRAWLEY-CONTEXT]: ${item.significator} ${item.aspect} ${item.planet}; orbe ${orb(item.orb)}; ${item.applying ? "aplicativo" : "separativo"}.`));
  frawleyOnlyMentalModifiers.forEach((item) => lines.push(`Candidato geométrico [FORA-MARCOS<=5|FRAWLEY-CONTEXT; ORBE-FRAWLEY-NÃO-GATADO-CANONICAMENTE]: ${item.significator} ${item.aspect} ${item.planet}; orbe ${orb(item.orb)}; ${item.applying ? "aplicativo" : "separativo"}; NÃO usar como testemunho Marcos e não promover automaticamente a testemunho Frawley sem o julgamento da fonte específica.`));
  lines.push(`Regente do Ascendente no dossiê mental: ${analysis.mentality.ascendantRuler}.`);
  lines.push(`Variante publicada de Modos/Maneira (Frawley Applied): candidatos ${analysis.manner.candidates.map((item) => `${item.planet}[${item.basis}]`).join(", ") || "nenhum"}; status=${analysis.manner.sourceStatus}.`);
  lines.push(`Suplemento Gugu — modos dos significadores: ${Object.entries(analysis.modes.guguSupplement.modalityEvidence).map(([k,v]) => `${k}=${v}`).join(" | ")}.`);

  lines.push("");
  lines.push("15. HYLEG, ANARETA E ALCOCHODEN — FRAWLEY ATUAL");
  lines.push(`Sistema de casas: ${analysis.lifeIndicatorsFrawley.houseSystem}. Hyleg=${analysis.lifeIndicatorsFrawley.hyleg.planet ?? "nenhum"}; ${analysis.lifeIndicatorsFrawley.hyleg.reason}`);
  lines.push(`Anareta=${analysis.lifeIndicatorsFrawley.anareta.planet ?? "nenhum"}; ${analysis.lifeIndicatorsFrawley.anareta.reason}`);
  if (analysis.lifeIndicatorsFrawley.anareta.eighthHousePlanets.length) lines.push(`Planetas efetivos na VIII: ${analysis.lifeIndicatorsFrawley.anareta.eighthHousePlanets.map((p) => `${p.planet} (distância da cúspide ${orb(p.distanceFromCusp)})`).join("; ")}.`);
  lines.push(`Alcochoden=${analysis.lifeIndicatorsFrawley.alcochoden.planet ?? "nenhum"}; ${analysis.lifeIndicatorsFrawley.alcochoden.reason}`);
  analysis.lifeIndicatorsFrawley.longevityEvidence.forEach((item) => lines.push(`  ${item.point}: ${item.condition}; ${item.evidence.join("; ") || "sem testemunho adicional destacado"}.`));
  lines.push(`Cautela: ${analysis.lifeIndicatorsFrawley.caveat}`);

  lines.push("");
  lines.push("16. DOSSIÊS DAS 12 CASAS — REGENTE PRIMÁRIO + CONTATOS");
  analysis.houseDossiers.forEach((house) => {
    lines.push(`Casa ${house.house} — ${house.topic}: cúspide ${dms(house.cuspLongitude)} (${house.cuspSign}); regente=${house.domicileRuler}; antíscio=${dms(house.cuspAntiscion)}; contra-antíscio=${dms(house.cuspContraAntiscion)}.`);
    lines.push(`  Estado do regente: essencial=${house.rulerEssential ? formatDignities(house.rulerEssential) : "—"}; acidental=${house.rulerAccidental ? `casa ${house.rulerAccidental.house}, ${house.rulerAccidental.solarCondition}` : "—"}; dispositor=${house.rulerDispositor ?? "—"}.`);
    if (house.naturalSignificators.length) lines.push(`  Significadores naturais complementares: ${house.naturalSignificators.join(", ")}.`);
    if (house.rulerAspects.length) lines.push(`  Aspectos do regente: ${house.rulerAspects.map((a) => `${a.planet} ${a.aspect} ${orb(a.orb)} ${a.applying ? "aplicativo" : "separativo"} ${a.marcosNatalEligible ? `[MARCOS:${a.marcosInfluenceTier}|FRAWLEY-CONTEXT]` : "[FORA-MARCOS>5|FRAWLEY-CONTEXT]"}`).join("; ")}.`);
    if (house.rulerReceptions.length) lines.push(`  Recepções envolvendo o regente: ${house.rulerReceptions.map((r) => `${r.guest}→${r.receiver} por ${r.by}/${r.polarity}`).join("; ")}.`);
    if (house.occupants.length) lines.push(`  Ocupantes EFETIVOS Marcos: ${house.occupants.map((o) => `${o.planet}${o.geometricHouse !== o.effectiveHouseMarcos ? ` [geom H${o.geometricHouse}→efetiva H${o.effectiveHouseMarcos}]` : ""}${o.onCuspMarcos ? " [cúspide Marcos]" : ""}`).join(", ")}.`);
    if (audit && house.geometricOccupants.length) lines.push(`  Ocupantes geométricos brutos: ${house.geometricOccupants.map((o) => `${o.planet}${o.geometricHouse !== o.effectiveHouseMarcos ? ` [efetiva H${o.effectiveHouseMarcos}]` : ""}`).join(", ")}.`);
    if (house.cuspPlanetContacts.length) lines.push(`  Contatos à cúspide <=5°: ${house.cuspPlanetContacts.map((c) => `${c.planet} ${orb(c.orb)} ${c.sameSign ? "mesmo-signo" : "trans-signo"}${c.directHouseTestimonyMarcos ? " [direto Marcos]" : ""}`).join("; ")}.`);
    if (house.cuspFixedStars.length) lines.push(`  Estrelas na cúspide: ${house.cuspFixedStars.map((m) => `${m.starName} ${m.orbLabel}`).join(", ")}.`);
    if (house.activeLots.length) lines.push(`  Partes em contato: ${house.activeLots.map((l) => `${l.name} ${l.aspect} ${orb(l.orb)}${l.activeMarcos ? " [ativa Marcos]" : ""}`).join("; ")}.`);
  });

  lines.push("");
  lines.push("17. FORTUNA GERAL — PACOTE TÉCNICO FRAWLEY");
  lines.push(`Status: ${analysis.generalFortune.status}. ${analysis.generalFortune.note}`);
  analysis.generalFortune.foundations.forEach((f) => lines.push(`  ${f.point}: ${f.evidence.join("; ")}.`));
  lines.push(`  Benéficos: ${analysis.generalFortune.beneficSupport.map((p) => `${p.planet} [${p.evidence.join("; ")}]`).join(" | ")}.`);
  lines.push(`  Maléficos: ${analysis.generalFortune.maleficPressure.map((p) => `${p.planet} [${p.evidence.join("; ")}]`).join(" | ")}.`);

  lines.push("");
  lines.push("18. HABILIDADES / PROFISSÃO — DOSSIÊ TÉCNICO");
  lines.push(`Método: ${analysis.profession.method}. Regente da X=${analysis.profession.house10.domicileRuler}; modalidade do regente=${analysis.profession.ruler10Modality}.`);
  analysis.profession.corePlanets.forEach((p) => lines.push(`  ${p.planet}: ${formatDignities(p.essential)}; casa ${p.accidental.house}; ${p.accidental.solarCondition}; vel. ${p.accidental.speedRatio.toFixed(2)}×.`));
  if (analysis.profession.mcFixedStars.length) lines.push(`  Estrelas no MC: ${analysis.profession.mcFixedStars.map((m) => `${m.starName} ${m.orbLabel}`).join(", ")}.`);
  lines.push(`  Frawley verificado — planetas na X: ${analysis.profession.frawleyVocationalIndicators.planetsIn10.join(", ") || "nenhum"}; regente X=${analysis.profession.frawleyVocationalIndicators.fallbackRuler10}; critérios=${analysis.profession.frawleyVocationalIndicators.verifiedCriteria.join("; ")}.`);
  lines.push(`  Critérios deliberadamente desabilitados por falta de verificação: ${analysis.profession.frawleyVocationalIndicators.disabledUnverifiedCriteria.join("; ") || "nenhum"}.`);
  lines.push(`  Parte da Vocação: ${dms(analysis.profession.vocationalLots.vocation.longitude)}, dispositor ${analysis.profession.vocationalLots.vocation.dispositor}; ${analysis.profession.vocationalLots.vocation.formula}.`);
  lines.push(`  Parte da Fama/Trabalho a Fazer: ${dms(analysis.profession.vocationalLots.fameOrWorkToBeDone.longitude)}, dispositor ${analysis.profession.vocationalLots.fameOrWorkToBeDone.dispositor}; ${analysis.profession.vocationalLots.fameOrWorkToBeDone.formula}.`);
  lines.push(`  Gugu complementar — planetas em casas angulares: ${analysis.profession.guguSupplement.angularProminence.map((p) => `${p.planet}(H${p.house}; ângulo mais próximo ${p.angle}; distância ${orb(p.distanceFromAngle)})`).join(", ") || "nenhum"}.`);
  lines.push(`  Gugu — distâncias brutas aos ângulos (sem limiar inventado): ${analysis.profession.guguSupplement.angleProximity.map((p) => `${p.planet}→${p.nearestAngle} ${orb(p.distanceFromAngle)}`).join("; ")}.`);
  analysis.profession.evidence.forEach((e) => lines.push(`  - ${e}`));

  lines.push("");
  lines.push("19. PADRÃO DE RELACIONAMENTOS — DOSSIÊ TÉCNICO");
  lines.push(`Regente I=${analysis.relationships.ruler1}; Regente VII=${analysis.relationships.ruler7}.`);
  lines.push(`Relação direta I–VII — MARCOS <=5°: ${analysis.relationships.directAspect ? `${analysis.relationships.directAspect.aspect}, ${orb(analysis.relationships.directAspect.orb)}, ${analysis.relationships.directAspect.applying ? "aplicativo" : "separativo"}` : "sem aspecto de influência válido no teto Marcos"}.`);
  if (analysis.relationships.broaderTraditionalAspect) {
    lines.push(`Relação I–VII mais ampla — FRAWLEY-CONTEXT apenas: ${analysis.relationships.broaderTraditionalAspect.aspect}, ${orb(analysis.relationships.broaderTraditionalAspect.orb)}, ${analysis.relationships.broaderTraditionalAspect.applying ? "aplicativo" : "separativo"}; NÃO promover à camada Marcos.`);
  }
  lines.push(`Recepção I→VII: ${analysis.relationships.reception1To7.map((r) => `${r.by}/${r.polarity}`).join(", ") || "nenhuma"}; VII→I: ${analysis.relationships.reception7To1.map((r) => `${r.by}/${r.polarity}`).join(", ") || "nenhuma"}.`);
  lines.push(`Parte do Amor: ${analysis.relationships.partOfLove ? dms(analysis.relationships.partOfLove.longitude) : "—"}.`);
  analysis.relationships.frawleyMarriageParts.forEach((part) => {
    lines.push(`Parte Frawley [${part.id}]: ${dms(part.longitude)}, dispositor ${part.dispositor}, casa ${part.house}; fórmula ${part.formula}; status=${part.sourceStatus}. ${part.note}`);
  });

  lines.push("");
  lines.push("20. SAÚDE — EVIDÊNCIAS SIMBÓLICAS, NÃO DIAGNÓSTICO");
  lines.push(analysis.healthSymbolic.disclaimer);
  lines.push(`Regente I=${analysis.healthSymbolic.ruler1}; regente VI=${analysis.healthSymbolic.ruler6}.`);
  if (analysis.healthSymbolic.relevantStars.length) lines.push(`Estrelas pertinentes ao eixo I/VI e regentes: ${analysis.healthSymbolic.relevantStars.map((m) => `${m.pointName}-${m.starName} ${m.orbLabel}`).join("; ")}.`);
  if (analysis.healthSymbolic.relevantLots.length) lines.push(`Partes ativas pertinentes: ${analysis.healthSymbolic.relevantLots.map((l) => l.name).join(", ")}.`);

  lines.push("");
  lines.push("21. ORIENTAÇÃO ESPIRITUAL — PACOTE FRAWLEY PUBLICADO");
  lines.push(`Casas IX/III: regentes ${analysis.spiritualOrientation.ruler9}/${analysis.spiritualOrientation.ruler3}; regente do ASC=${analysis.spiritualOrientation.ascendantRuler}.`);
  lines.push(`Júpiter: ${formatDignities(analysis.spiritualOrientation.jupiter.essential)}; casa ${analysis.spiritualOrientation.jupiter.accidental.house}. Lua: ${formatDignities(analysis.spiritualOrientation.moon.essential)}. Sol: ${formatDignities(analysis.spiritualOrientation.sun.essential)}.`);
  if (analysis.spiritualOrientation.royalStarContacts.length) lines.push(`Estrelas reais: ${analysis.spiritualOrientation.royalStarContacts.map((m) => `${m.pointName}-${m.starName} ${m.orbLabel}`).join("; ")}.`);
  lines.push(`Sete Partes espirituais Frawley: ${analysis.spiritualOrientation.sevenKeyLots.map((l) => `${l.name}@${dms(l.longitude)}→${l.dispositor} [${l.formula}]`).join("; ")}.`);
  lines.push(analysis.spiritualOrientation.note);

  lines.push("");
  lines.push("22. FILHOS / FERTILIDADE — PACOTE FRAWLEY PUBLICADO");
  lines.push(`Casa V: cúspide ${dms(analysis.children.house5.cuspLongitude)} (${analysis.children.cuspSignProperties.fertility}); regente ${analysis.children.ruler5} em signo ${analysis.children.ruler5SignProperties.sign}/${analysis.children.ruler5SignProperties.fertility}.`);
  lines.push(`Lua: ${analysis.children.moon.signProperties.sign}/${analysis.children.moon.signProperties.fertility}, casa ${analysis.children.moon.accidental.house}; Júpiter: ${analysis.children.jupiter.signProperties.sign}/${analysis.children.jupiter.signProperties.fertility}, casa ${analysis.children.jupiter.accidental.house}.`);
  lines.push(`Parte dos Filhos: ${dms(analysis.children.partOfChildren.longitude)}, dispositor ${analysis.children.partOfChildren.dispositor}, casa ${analysis.children.partOfChildren.house}; fórmula ${analysis.children.partOfChildren.formula}; status=${analysis.children.partOfChildren.formulaStatus}.`);
  lines.push(analysis.children.note);

  lines.push("");
  lines.push("23. RIQUEZA / RECURSOS — PACOTE FRAWLEY PUBLICADO");
  lines.push(`Casa II: regente ${analysis.wealth.ruler2}; estado ${analysis.wealth.house2.rulerEssential ? formatDignities(analysis.wealth.house2.rulerEssential) : "—"}.`);
  lines.push(`Júpiter natural da riqueza: ${formatDignities(analysis.wealth.jupiterNaturalWealth.essential)}; casa ${analysis.wealth.jupiterNaturalWealth.accidental.house}.`);
  lines.push(`Fortuna: ${analysis.wealth.partOfFortune ? dms(analysis.wealth.partOfFortune.longitude) : "—"}; dispositor ${analysis.wealth.fortuneDispositor ?? "—"}. ${analysis.wealth.note}`);

  lines.push("");
  lines.push("24. MUDANÇAS DE SIGNO / DIGNIDADE — DADOS PARA REGRAS DE FRONTEIRA");
  precision.boundaryDynamics.forEach((item) => {
    lines.push(`${item.planet}: ingresso anterior ${item.previousIngress ? `${item.previousIngress.fromSign}→${item.previousIngress.toSign}, ${jdDelta(item.previousIngress.deltaDays)} atrás` : "—"}; próximo ingresso ${item.nextIngress ? `${item.nextIngress.fromSign}→${item.nextIngress.toSign}, em ${jdDelta(item.nextIngress.deltaDays)}` : "—"}; estação antes do próximo ingresso=${item.nextStationBeforeIngress ? `${item.nextStationBeforeIngress.kind} em ${jdDelta(item.nextStationBeforeIngress.deltaDays)}` : "não"}.`);
  });

  lines.push("");
  lines.push("25. SYZYGIA PRÉ-NATAL E LUNAÇÕES VIZINHAS");
  lines.push(precision.prenatalSyzygy
    ? `${precision.prenatalSyzygy.type}: ${dms(precision.prenatalSyzygy.longitude)}; JD ${precision.prenatalSyzygy.julianDayUt.toFixed(8)}; ${precision.prenatalSyzygy.daysBeforeBirth.toFixed(6)} dias antes do nascimento.`
    : "Não resolvida pelo módulo atual.");
  precision.lunations.forEach((lunation) => {
    const physical = lunation.physicalEclipse;
    const physicalText = physical.source === "eclipse-api-unavailable"
      ? "classificação física indisponível no runtime"
      : physical.isEclipse
        ? `ECLIPSE FÍSICO=${physical.kind}; máximo JD ${physical.maximumJulianDayUt?.toFixed(8) ?? "—"}; Δmáximo-sizígia=${physical.maximumDeltaDaysFromLunation?.toFixed(6) ?? "—"} d`
        : "eclipse físico=não";
    lines.push(`${lunation.direction === "previous" ? "anterior" : "seguinte"} ${lunation.type}: JD ${lunation.julianDayUt.toFixed(8)}, Δ ${lunation.deltaDays.toFixed(6)} d, Sol ${dms(lunation.sunLongitude)}, Lua lat ${signed(lunation.moonLatitude)}°, distância ao eixo nodal ${orb(lunation.trueNodeDistance)}, candidato geométrico=${lunation.eclipseGeometryCandidate ? "sim" : "não"}; ${physicalText}; status=${lunation.classificationStatus}.`);
  });

  if (audit) {
    lines.push("");
    lines.push("26. APÊNDICE DE AUDITORIA — RANKINGS / ALMÚTENS LEGADOS — NÃO ENVIAR COMO SCORE À IA");
    lines.push(`Ranking legado de Senhor da Genitura: ${analysis.lordOfGeniture.map((p) => `${p.planet}=${p.totalScore}`).join("; ")}.`);
    lines.push(`Ranking essencial aditivo/almúten do mapa: ${analysis.chartAlmuten.map((p) => `${p.planet}=${p.totalScore}`).join("; ")}.`);
    lines.push("Frawley atual rejeita o uso de almúten como regra canônica; estes campos são preservados apenas para compatibilidade histórica/Gugu e auditoria.");
  }

  appendOperationalProtocolDossiers(lines, analysis, precision);

  lines.push("");
  lines.push("30.1. REGISTRO FORMAL DE GAPS / BLOQUEIOS DE FONTE");
  analysis.technicalForm.sourceGapRegistry.forEach((gap) => {
    lines.push(`- [${gap.status}] ${gap.id} — ${gap.author} / ${gap.domain}; bloqueia radical=${gap.blocksRadicalInterpretation ? "sim" : "não"}.`);
    lines.push(`  Disponível: ${gap.availableEvidence.join(" | ") || "nenhum"}.`);
    lines.push(`  Falta: ${gap.missingEvidence.join(" | ") || "nada"}.`);
    lines.push(`  Comportamento do motor: ${gap.engineBehavior}.`);
  });
  lines.push("");

  lines.push("30. REGISTRO DE FONTES E STATUS TÉCNICO");
  analysis.technicalForm.sourceRegistry.forEach((source) => lines.push(`Fonte ${source.id}: ${source.author} — ${source.source}; ${source.evidenceKind}/${source.status}${source.url ? `; ${source.url}` : ""}. ${source.note}`));
  lines.push("Este formulário não contém interpretação de personalidade, destino, profissão, relacionamento ou prognóstico.");
  lines.push("Dados derivados preservam proveniência por módulo; divergências entre Marcos/Frawley/Gugu não devem ser fundidas silenciosamente.");
  precision.cautions.forEach((caution) => lines.push(`- ${caution}`));
  analysis.technicalForm.unresolvedTechnicalQuestions.forEach((question) => lines.push(`- PENDENTE: ${question}`));

  return lines.join("\n") + "\n";
}

export function generateNatalAuditReport(
  chart: BirthChart,
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
): string {
  return generateNatalTechnicalReport(chart, analysis, precision, { profile: "audit" });
}
