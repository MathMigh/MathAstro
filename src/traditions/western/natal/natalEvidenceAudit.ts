import type { NatalAnalysis } from "@/app/lib/natalAnalysis";
import type { NatalPrecisionData } from "@/app/lib/natalPrecision";
import type { NatalDomainContract } from "./natalMethodContract";

export type EvidenceMaterializationStatus =
  | "MATERIALIZED"
  | "EXTERNAL_RUNTIME"
  | "CONTEXT_REQUIRED"
  | "SOURCE_LOCKED_UNRESOLVED"
  | "MISSING_ENGINE_DATA";

export interface EvidenceMaterializationEntry {
  key: string;
  status: EvidenceMaterializationStatus;
  path: string | null;
  note: string;
}

export interface ProtocolMaterializationAudit {
  protocolId: string;
  section: number;
  phase: "radical" | "timing";
  status: "READY" | "GATED" | "FAIL";
  evidence: EvidenceMaterializationEntry[];
  missingKeys: string[];
}

export interface NatalEvidenceMaterializationAudit {
  schemaVersion: "1.0.0";
  radicalAllMaterialized: boolean;
  allEvidenceAccountedFor: boolean;
  protocols: ProtocolMaterializationAudit[];
  missingRadicalEvidence: Array<{ protocolId: string; key: string }>;
  unaccountedEvidenceKeys: string[];
}

const materialized = (key: string, path: string, note: string): EvidenceMaterializationEntry => ({
  key, status: "MATERIALIZED", path, note,
});
const missing = (key: string, note: string): EvidenceMaterializationEntry => ({
  key, status: "MISSING_ENGINE_DATA", path: null, note,
});
const gated = (
  key: string,
  status: "EXTERNAL_RUNTIME" | "CONTEXT_REQUIRED" | "SOURCE_LOCKED_UNRESOLVED",
  path: string | null,
  note: string,
): EvidenceMaterializationEntry => ({ key, status, path, note });

function hasArray(value: unknown): boolean {
  return Array.isArray(value);
}

function hasNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function evaluateEvidence(
  key: string,
  protocol: NatalDomainContract,
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
  productionValidationPresent: boolean,
): EvidenceMaterializationEntry {
  const form = analysis.technicalForm;
  const temperament = form.temperament;
  const witness = (label: string) => temperament.witnesses.find((item) => item.label === label);
  const lot = (fragment: string) => form.lots.find((item) => item.name.toLowerCase().includes(fragment));

  switch (key) {
    // Universal radical evidence.
    case "houseDossiers":
      return form.houseDossiers.length === 12
        ? materialized(key, "technicalForm.houseDossiers", "As 12 casas possuem dossiê técnico.")
        : missing(key, `Esperadas 12 casas; recebidas ${form.houseDossiers.length}.`);
    case "planetPackets":
      return form.planets.length >= 7
        ? materialized(key, "technicalForm.planets", "Pacotes dos sete planetas tradicionais materializados.")
        : missing(key, `Pacotes planetários insuficientes: ${form.planets.length}.`);
    case "essentialConditions":
      return form.planets.every((item) => Boolean(item.essential))
        ? materialized(key, "technicalForm.planets[*].essential", "Condição essencial anexada a cada pacote planetário.")
        : missing(key, "Há planeta sem condição essencial no formulário.");
    case "accidentalConditions":
      return form.planets.every((item) => Boolean(item.accidental))
        ? materialized(key, "technicalForm.planets[*].accidental", "Condição acidental, inclusive casa efetiva, anexada a cada planeta.")
        : missing(key, "Há planeta sem condição acidental no formulário.");
    case "dispositors":
      return hasNonEmptyArray(form.dispositors.chains)
        ? materialized(key, "technicalForm.dispositors", "Cadeias, ciclos e eventual dispositor final estão materializados.")
        : missing(key, "Cadeias de dispositores ausentes.");
    case "receptions":
      return hasArray(form.receptions)
        ? materialized(key, "technicalForm.receptions", "Tabela direcional de recepções materializada; array vazio é resultado válido.")
        : missing(key, "Tabela de recepções ausente.");
    case "aspects":
      return form.planets.every((item) => hasArray(item.aspects))
        ? materialized(key, "technicalForm.planets[*].aspects", "Aspectos calculados com gate de fonte por autor.")
        : missing(key, "Algum pacote planetário não possui array de aspectos.");
    case "fixedStars":
      return form.fixedStarSky.metadata && hasArray(form.fixedStarContacts)
        ? materialized(key, "technicalForm.fixedStarSky + technicalForm.fixedStarContacts", "Céu completo e contatos interpretativos são camadas separadas.")
        : missing(key, "Metadados do céu estelar ou contatos ausentes.");
    case "antiscia":
      return form.antiscia && hasArray(form.antiscia.positions) && hasArray(form.antiscia.contacts)
        ? materialized(key, "technicalForm.antiscia", "Posições e contatos de antíscio/contra-antíscio materializados.")
        : missing(key, "Antíscios incompletos.");
    case "nodes":
      return precision.nodes
        ? materialized(key, "precisionEvidence.nodes", "Nodos verdadeiro e médio calculados; núcleo Marcos usa conjunção.")
        : missing(key, "Geometria nodal ausente.");
    case "lots":
      return hasNonEmptyArray(form.lots)
        ? materialized(key, "technicalForm.lots", "Partes com dispositor, casa geométrica, relações e antíscios.")
        : missing(key, "Partes ausentes.");
    case "derivedHouseTable":
      return form.derivedHouseTable.length === 144
        ? materialized(key, "technicalForm.derivedHouseTable", "Tabela 12×12 de casas derivadas já resolvida pelo motor.")
        : missing(key, `Tabela derivada contém ${form.derivedHouseTable.length}, esperado 144.`);
    case "effectiveHousePlacements":
      return form.planets.every((item) => Number.isInteger(item.housePlacement.effectiveHouseMarcos))
        ? materialized(key, "technicalForm.planets[*].housePlacement", "Casa geométrica e casa efetiva preservadas separadamente.")
        : missing(key, "Há pacote sem casa efetiva resolvida.");
    case "fixedStarInterpretiveProvenance":
      return form.fixedStarContacts.filter((item) => item.isRelevant).every((item) => (item.interpretiveSources ?? []).length > 0)
        ? materialized(key, "technicalForm.fixedStarContacts[*].interpretiveSources", "Todo contato promovido possui proveniência interpretativa.")
        : missing(key, "Há contato estelar interpretativo sem proveniência.");
    case "sourceTaggedAspectLayers":
      return form.planets.every((packet) => packet.aspects.every((aspect) => Array.isArray(aspect.sourceLayers) && aspect.sourceLayers.length > 0))
        ? materialized(key, "technicalForm.planets[*].aspects[*].sourceLayers", "Aspectos carregam camada Marcos/Frawley-context explicitamente.")
        : missing(key, "Há aspecto sem sourceLayers.");
    case "productionValidation":
      return productionValidationPresent
        ? gated(key, "EXTERNAL_RUNTIME", "reportBundle.validation", "Validação é calculada após o formulário e anexada ao envelope da API.")
        : missing(key, "Validação de produção não foi anexada ao envelope runtime.");

    // Core dossiers.
    case "fiveTemperamentWitnesses":
      return temperament.witnesses.length === 5
        ? materialized(key, "technicalForm.temperament.witnesses", "Cinco testemunhos Marcos preservados sem voto automático.")
        : missing(key, `Temperamento contém ${temperament.witnesses.length} testemunhos.`);
    case "solarSeason":
      return witness("Estacao do Sol")
        ? materialized(key, "technicalForm.temperament.witnesses[label=Estacao do Sol]", "Testemunho sazonal materializado.")
        : missing(key, "Testemunho da estação solar ausente.");
    case "lunarPhase":
      return witness("Fase da Lua")
        ? materialized(key, "technicalForm.temperament.witnesses[label=Fase da Lua]", "Testemunho de fase lunar materializado no temperamento.")
        : missing(key, "Testemunho da fase lunar ausente.");
    case "essentialDignityHierarchy":
      return form.lordOfNativity?.essentialHierarchy
        ? materialized(key, "technicalForm.lordOfNativity.essentialHierarchy", "Hierarquia essencial explícita; empate pode permanecer não resolvido.")
        : missing(key, "Hierarquia essencial do Senhor da Natividade ausente.");
    case "mannerSelectionStages":
      return form.manner && hasArray(form.manner.candidates)
        ? materialized(key, "technicalForm.manner", "Estágio/candidatos de Manner materializados; múltiplos não recebem desempate automático.")
        : missing(key, "Manner não materializado.");
    case "moonPhase":
      return form.mentality.moon.phase
        ? materialized(key, "technicalForm.mentality.moon.phase", "Fase e ângulo lunar materializados no dossiê mental.")
        : missing(key, "Fase lunar ausente no dossiê mental.");
    case "moonMercuryRelation":
      return form.mentality.moonMercuryConnection
        ? materialized(key, "technicalForm.mentality.moonMercuryConnection", "Relação Lua–Mercúrio pré-calculada e gate Marcos separado.")
        : missing(key, "Relação Lua–Mercúrio ausente.");
    case "mentalModifiers":
      return hasArray(form.mentality.modifyingAspects)
        ? materialized(key, "technicalForm.mentality.modifyingAspects", "Modificadores materializados mesmo quando o conjunto é vazio.")
        : missing(key, "Modificadores mentais ausentes.");
    case "signVoice":
      return form.mentality.moon.signProperties?.voice && form.mentality.mercury.signProperties?.voice
        ? materialized(key, "technicalForm.mentality.{moon,mercury}.signProperties.voice", "Natureza vocal dos signos resolvida pelo motor.")
        : missing(key, "Natureza vocal de Lua/Mercúrio não foi materializada.");
    case "degreeAlmutens":
      return form.mentality.moon.degreeAlmuten && form.mentality.mercury.degreeAlmuten
        ? materialized(key, "technicalForm.mentality.{moon,mercury}.degreeAlmuten", "Almutens dos graus de Lua e Mercúrio materializados separadamente.")
        : missing(key, "Almutens mentais ausentes.");
    case "orientation":
      return form.mentality.moon.accidentalCondition.orientation && form.mentality.mercury.accidentalCondition.orientation
        ? materialized(key, "technicalForm.mentality.{moon,mercury}.accidentalCondition.orientation", "Orientação calculada por significador.")
        : missing(key, "Orientação dos significadores mentais ausente.");
    case "angularProximity":
      return hasNonEmptyArray(form.mentality.sourceVariants.gugu.angleProximity)
        ? materialized(key, "technicalForm.mentality.sourceVariants.gugu.angleProximity", "Distância aos quatro ângulos calculada sem cutoff interpretativo inventado.")
        : missing(key, "Proximidade angular Gugu não materializada.");
    case "moonNodeRawDistance":
      return form.mentality.sourceVariants.gugu.moonNodeRawDistance
        ? materialized(key, "technicalForm.mentality.sourceVariants.gugu.moonNodeRawDistance", "Geometria Lua–Nodos entregue, interpretação permanece source-gated.")
        : missing(key, "Distância Lua–Nodos ausente.");
    case "ascendantPacket": {
      const ruler = form.mentality.ascendantRuler;
      return form.planets.some((item) => item.planet === ruler)
        ? materialized(key, `technicalForm.planets[planet=${ruler}]`, "Pacote do regente do Ascendente materializado.")
        : missing(key, `Pacote do regente do ASC (${ruler}) ausente.`);
    }
    case "temperament":
      return form.temperament
        ? materialized(key, "technicalForm.temperament", "Temperamento entregue como evidência qualitativa, sem conclusão automática.")
        : missing(key, "Temperamento ausente.");
    case "medicalBodyParts":
      return form.houseDossiers.every((item) => Array.isArray(item.medicalBodyParts))
        ? materialized(key, "technicalForm.houseDossiers[*].medicalBodyParts", "Localizações corporais por casa materializadas.")
        : missing(key, "Correspondências corporais incompletas.");
    case "maleficContacts":
      return form.planets.some((item) => item.planet === "Marte") && form.planets.some((item) => item.planet === "Saturno")
        ? materialized(key, "technicalForm.planets[Marte|Saturno].aspects + houseDossiers[*].cuspPlanetContacts", "Contatos de maléficos disponíveis sem criar um score de dano.")
        : missing(key, "Pacotes de Marte/Saturno ausentes.");
    case "placidusHylegalHouses":
      return form.lifeIndicatorsFrawley.houseSystem === "Placidus" && Array.isArray(precision.houses.placidus)
        ? materialized(key, "technicalForm.lifeIndicatorsFrawley + precisionEvidence.houses.placidus", "Seleção vital Frawley usa Placidus explicitamente.")
        : missing(key, "Casas Placidus/Hyleg não materializadas.");
    case "fortuneActivation": {
      const fortune = lot("fortuna") ?? form.lots.find((item) => item.key === "fortune");
      return fortune && hasArray(fortune.relations)
        ? materialized(key, "technicalForm.lots[key=fortune].relations", "Ativações da Fortuna pré-calculadas; ausência de relação é resultado válido.")
        : missing(key, "Parte da Fortuna/ativações ausentes.");
    }
    case "derivedHouseResolutions":
      return form.derivedHouseTable.length === 144
        ? materialized(key, "technicalForm.derivedHouseTable", "Todas as derivações possíveis estão resolvidas; contexto apenas escolhe a célula.")
        : missing(key, "Casas derivadas não resolvidas integralmente.");
    case "lovePartActivation": {
      const love = form.lots.find((item) => item.key === "love") ?? lot("amor");
      return love && hasArray(love.relations)
        ? materialized(key, "technicalForm.lots[key=love].relations", "Parte do Amor e relações pré-calculadas.")
        : missing(key, "Parte do Amor/ativações ausentes.");
    }
    case "relationshipPerfection": {
      const first = form.relationships.ruler1;
      const second = form.relationships.ruler7;
      const dyn = precision.exactAspectDynamics.find((item) =>
        (item.first === first && item.second === second) || (item.first === second && item.second === first));
      if (form.relationships.directAspect === null) {
        return materialized(key, "technicalForm.relationships + precisionEvidence.exactAspectDynamics", "Sem aspecto Marcos I–VII: ausência de perfeição é um resultado técnico válido.");
      }
      return dyn
        ? materialized(key, "precisionEvidence.exactAspectDynamics[I-VII]", "Dinâmica de perfeição/bloqueio dos regentes I–VII calculada pelo motor.")
        : missing(key, `Há aspecto Marcos entre ${first}/${second}, mas sua dinâmica exata não foi materializada.`);
    }
    case "signFertility":
      return form.children?.moon?.signProperties?.fertility && form.children?.jupiter?.signProperties?.fertility
        ? materialized(key, "technicalForm.children.*.signProperties.fertility", "Fertilidade dos signos relevantes pré-classificada.")
        : missing(key, "Fertilidade dos signos do pacote de filhos incompleta.");
    case "careerCapabilityPacket":
      return form.profession?.house10 && hasNonEmptyArray(form.profession.corePlanets)
        ? materialized(key, "technicalForm.profession", "Casa X, regente, ocupantes efetivos e Mercúrio/Vênus/Marte materializados.")
        : missing(key, "Pacote profissional incompleto.");
    case "mcFixedStars":
      return hasArray(form.profession?.mcFixedStars)
        ? materialized(key, "technicalForm.profession.mcFixedStars", "Contatos estelares do MC filtrados pelo motor.")
        : missing(key, "Contatos estelares do MC ausentes.");
    case "prenatalSyzygy":
      return precision.prenatalSyzygy
        ? materialized(key, "precisionEvidence.prenatalSyzygy", "Sizígia pré-natal calculada.")
        : missing(key, "Sizígia pré-natal ausente.");
    case "lunationGeometry":
      return hasArray(precision.lunations)
        ? materialized(key, "precisionEvidence.lunations", "Lunações vizinhas e geometria nodal calculadas.")
        : missing(key, "Geometria de lunações ausente.");
    case "prenatalLunationNatalLinks":
      return hasArray(precision.prenatalLunationNatalLinks)
        ? materialized(key, "precisionEvidence.prenatalLunationNatalLinks", "Planetas das lunações pré-natais comparados a planetas, cúspides e Partes natais; contatos são triagem geométrica sem juízo automático.")
        : missing(key, "Elo técnico entre lunações pré-natais e pontos natais ausente.");

    case "guguSourceGapRegistry":
      return analysis.technicalForm.sourceGapRegistry.some((gap) => gap.id === "gugu-proper-places")
        ? materialized(key, "technicalForm.sourceGapRegistry[gugu-*]", "Gaps Gugu estão formalmente inventariados; a IA recebe geometria bruta onde a regra não está source-locked.")
        : missing(key, "Registro formal dos gaps Gugu ausente.");
    case "frawleySourceGapRegistry":
      return analysis.technicalForm.sourceGapRegistry.some((gap) => gap.author === "John Frawley")
        ? materialized(key, "technicalForm.sourceGapRegistry[frawley-*]", "Diferença entre Frawley publicado, current-scope e regra não verificada está explicitamente registrada.")
        : missing(key, "Registro formal dos gaps Frawley ausente.");

    // Timing protocols: the static natal report must expose an explicit gate,
    // never pretend the time technique has run.
    case "selectedRadicalDomainDossier":
      return gated(key, "CONTEXT_REQUIRED", null, "É necessário selecionar o tema natal antes da promessa radical específica.");
    case "timingContext":
      return gated(key, "CONTEXT_REQUIRED", null, "Data/janela alvo não pertence ao mapa natal estático.");
    case "sourceLockedPrimaryDirectionModule":
      return gated(key, "SOURCE_LOCKED_UNRESOLVED", null, "O contrato reconhece a técnica, mas o módulo calculador source-locked não é materializado no relatório natal estático.");
    case "secondaryProgressionConjunctionOppositionModule":
      return gated(key, "CONTEXT_REQUIRED", null, "A regra Marcos está source-locked (conjunção/oposição), mas a execução exige data/janela.");
    case "exactSolarReturn":
    case "exactLunarReturn":
      return gated(key, "CONTEXT_REQUIRED", null, "Retorno exato exige ano/mês alvo e cálculo temporal separado do radical.");
    case "frawleyTimingCapabilityRegistry":
      return gated(key, "SOURCE_LOCKED_UNRESOLVED", null, "Escopo atual de Frawley é registrado; algoritmos não publicados não são inventados.");
    case "radicalPromise":
      return gated(key, "CONTEXT_REQUIRED", null, "Promessa radical depende do domínio natal selecionado.");
    case "timingTechniqueOutputs":
    case "returnOutputs":
      return gated(key, "CONTEXT_REQUIRED", null, "Saídas só existem depois da execução temporal solicitada.");
    default:
      return missing(key, `Chave de evidência sem mapeamento de materialização: ${key}.`);
  }
}

export function auditNatalEvidenceMaterialization(
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
  productionValidationPresent = true,
): NatalEvidenceMaterializationAudit {
  const protocols = analysis.technicalForm.interpretationContract.protocols.map((protocol) => {
    const evidence = protocol.requiredEngineEvidence.map((key) =>
      evaluateEvidence(key, protocol, analysis, precision, productionValidationPresent));
    const missingKeys = evidence.filter((item) => item.status === "MISSING_ENGINE_DATA").map((item) => item.key);
    const hasGates = evidence.some((item) => ["CONTEXT_REQUIRED", "SOURCE_LOCKED_UNRESOLVED", "EXTERNAL_RUNTIME"].includes(item.status));
    return {
      protocolId: protocol.id,
      section: protocol.section,
      phase: protocol.phase,
      status: missingKeys.length ? "FAIL" as const : hasGates ? "GATED" as const : "READY" as const,
      evidence,
      missingKeys,
    };
  });

  const missingRadicalEvidence = protocols.flatMap((protocol) =>
    protocol.phase === "radical"
      ? protocol.missingKeys.map((key) => ({ protocolId: protocol.protocolId, key }))
      : []);
  const allEntries = protocols.flatMap((protocol) => protocol.evidence);
  const unaccountedEvidenceKeys = [...new Set(allEntries.filter((entry) =>
    entry.status === "MISSING_ENGINE_DATA" && entry.note.startsWith("Chave de evidência sem mapeamento"))
    .map((entry) => entry.key))].sort();

  return {
    schemaVersion: "1.0.0",
    radicalAllMaterialized: missingRadicalEvidence.length === 0,
    allEvidenceAccountedFor: unaccountedEvidenceKeys.length === 0,
    protocols,
    missingRadicalEvidence,
    unaccountedEvidenceKeys,
  };
}
