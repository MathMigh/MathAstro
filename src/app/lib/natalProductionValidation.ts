import { BirthChart } from "@/interfaces/BirthChartInterfaces";
import { NatalAnalysis } from "./natalAnalysis";
import { MARCOS_NATAL_INFLUENCE_MAX_ORB } from "@/traditions/western/natal/natalMethodConstants";
import { NatalPrecisionData } from "./natalPrecision";

export type NatalValidationLevel = "error" | "warning";

export interface NatalValidationIssue {
  code: string;
  level: NatalValidationLevel;
  message: string;
  context?: string;
}

export interface NatalProductionValidation {
  schemaVersion: "1.2.0";
  status: "PASS" | "FAIL";
  errors: NatalValidationIssue[];
  warnings: NatalValidationIssue[];
  checks: Record<string, boolean>;
}

function issue(code: string, level: NatalValidationLevel, message: string, context?: string): NatalValidationIssue {
  return { code, level, message, ...(context ? { context } : {}) };
}

export function validateNatalProductionOutput(
  chart: BirthChart,
  analysis: NatalAnalysis,
  precision: NatalPrecisionData,
  aiReport?: string,
): NatalProductionValidation {
  const errors: NatalValidationIssue[] = [];
  const warnings: NatalValidationIssue[] = [];
  const checks: Record<string, boolean> = {};
  const pass = (name: string, value: boolean) => { checks[name] = value; return value; };

  if (!pass("contractCoverage", analysis.technicalForm.interpretationContract.coverage.allCovered)) {
    errors.push(issue("CONTRACT_COVERAGE", "error", "A matriz operacional não cobre todas as seções esperadas."));
  }

  const planetByName = new Map(analysis.technicalForm.planets.map((packet) => [packet.planet, packet]));
  let cuspPropagationOk = true;
  for (const packet of analysis.technicalForm.planets) {
    const placement = packet.housePlacement;
    if (placement.resolution === "same-sign-within-5") {
      const ok = placement.withinFiveDegreesBeforeNextCusp
        && placement.sameSignAsNextCusp
        && placement.effectiveHouseMarcos === placement.nextCusp
        && packet.accidental.house === placement.effectiveHouseMarcos
        && packet.accidental.effectiveHouseFrawley === placement.effectiveHouseFrawley;
      if (!ok) {
        cuspPropagationOk = false;
        errors.push(issue(
          "CUSP_EFFECTIVE_HOUSE_NOT_PROPAGATED",
          "error",
          `${packet.planet} foi resolvido na casa seguinte pela regra de cúspide, mas algum consumidor ainda usa outra casa.`,
          `geom=${placement.geometricHouse}; next=${placement.nextCusp}; effective=${placement.effectiveHouseMarcos}; accidental=${packet.accidental.house}`,
        ));
      }
    }
  }
  pass("cuspEffectiveHousePropagation", cuspPropagationOk);

  let occupantConsistencyOk = true;
  for (const house of analysis.technicalForm.houseDossiers) {
    for (const occupant of house.occupants) {
      if (occupant.effectiveHouseMarcos !== house.house) {
        occupantConsistencyOk = false;
        errors.push(issue("HOUSE_OCCUPANT_EFFECTIVE_MISMATCH", "error", `${occupant.planet} aparece como ocupante efetivo da casa ${house.house}, mas seu effectiveHouseMarcos=${occupant.effectiveHouseMarcos}.`));
      }
    }
  }
  pass("houseOccupantConsistency", occupantConsistencyOk);

  let ingressOk = true;
  for (const boundary of precision.boundaryDynamics) {
    for (const ingress of [boundary.previousIngress, boundary.nextIngress]) {
      if (ingress && ingress.fromSign === ingress.toSign) {
        ingressOk = false;
        errors.push(issue("IMPOSSIBLE_SIGN_INGRESS", "error", `${boundary.planet} possui ingresso impossível ${ingress.fromSign}→${ingress.toSign}.`));
      }
    }
  }
  pass("signIngressTransitions", ingressOk);

  const precisionAspectsOk = precision.exactAspectDynamics.every((item) => item.currentOrb <= MARCOS_NATAL_INFLUENCE_MAX_ORB + 1e-9);
  if (!pass("precisionMarcosAspectCap", precisionAspectsOk)) {
    errors.push(issue("PRECISION_MARCOS_ORB_LEAK", "error", `A dinâmica exata contém aspecto acima de ${MARCOS_NATAL_INFLUENCE_MAX_ORB}° na camada Marcos.`));
  }

  let mentalProvenanceOk = true;
  for (const modifier of analysis.mentality.modifyingAspects) {
    if (modifier.orb > MARCOS_NATAL_INFLUENCE_MAX_ORB && modifier.marcosNatalEligible) {
      mentalProvenanceOk = false;
      errors.push(issue("MARCOS_ORB_LEAK", "error", `${modifier.significator}-${modifier.planet} a ${modifier.orb.toFixed(4)}° foi indevidamente marcado como Marcos.`));
    }
    if (modifier.orb <= MARCOS_NATAL_INFLUENCE_MAX_ORB && !modifier.marcosNatalEligible) {
      mentalProvenanceOk = false;
      errors.push(issue("MARCOS_ORB_FALSE_NEGATIVE", "error", `${modifier.significator}-${modifier.planet} a ${modifier.orb.toFixed(4)}° deveria estar elegível no gate Marcos <=5° (3° núcleo; 3–5° contextual).`));
    }
  }
  const mm = analysis.mentality.moonMercuryConnection;
  if (mm.orb !== undefined && mm.orb > MARCOS_NATAL_INFLUENCE_MAX_ORB && mm.connected) {
    mentalProvenanceOk = false;
    errors.push(issue("MOON_MERCURY_MARCOS_ORB_LEAK", "error", `Lua-Mercúrio a ${mm.orb.toFixed(4)}° foi marcado como ligação Marcos.`));
  }
  pass("mentalAspectSourceSeparation", mentalProvenanceOk);

  let globalAspectProvenanceOk = true;
  for (const packet of analysis.technicalForm.planets) {
    for (const aspect of packet.aspects) {
      const shouldBeMarcos = aspect.orb <= MARCOS_NATAL_INFLUENCE_MAX_ORB;
      if (aspect.marcosNatalEligible !== shouldBeMarcos) {
        globalAspectProvenanceOk = false;
        errors.push(issue("PLANET_ASPECT_SOURCE_GATE", "error", `${packet.planet}-${aspect.planet} a ${aspect.orb.toFixed(4)}° possui gate Marcos inconsistente.`));
      }
    }
  }
  for (const house of analysis.technicalForm.houseDossiers) {
    for (const aspect of house.rulerAspects) {
      const shouldBeMarcos = aspect.orb <= MARCOS_NATAL_INFLUENCE_MAX_ORB;
      if (aspect.marcosNatalEligible !== shouldBeMarcos) {
        globalAspectProvenanceOk = false;
        errors.push(issue("HOUSE_RULER_ASPECT_SOURCE_GATE", "error", `Regente da casa ${house.house}-${aspect.planet} possui gate Marcos inconsistente.`));
      }
    }
  }
  if (analysis.relationships.directAspect && analysis.relationships.directAspect.orb > MARCOS_NATAL_INFLUENCE_MAX_ORB) {
    globalAspectProvenanceOk = false;
    errors.push(issue("RELATIONSHIP_MARCOS_ASPECT_LEAK", "error", `I-VII a ${analysis.relationships.directAspect.orb.toFixed(4)}° foi promovido à camada Marcos acima do teto.`));
  }
  pass("globalAspectSourceSeparation", globalAspectProvenanceOk);

  let starsOk = true;
  const starKeys = new Set<string>();
  for (const match of chart.fixedStarMatches ?? []) {
    if (!match.isRelevant) continue;
    const sourceLockedDeepSky = match.objectClass === "deep-sky"
      && match.interpretiveTier === "principal-source-locked"
      && (match.interpretiveSources ?? []).some((source) => source.startsWith("Frawley-"));
    if (match.interpretiveTier === "astronomical-only" || match.interpretiveTier === "excluded-nonstellar" || (match.objectClass === "deep-sky" && !sourceLockedDeepSky)) {
      starsOk = false;
      errors.push(issue("NON_SOURCE_LOCKED_STAR_PROMOTED", "error", `${match.starName} foi promovida ao juízo interpretativo sem source-lock suficiente; tier=${match.interpretiveTier}.`));
    }
    if (!(match.interpretiveSources ?? []).length) {
      starsOk = false;
      errors.push(issue("STAR_PROVENANCE_MISSING", "error", `${match.starName} não possui interpretiveSources.`));
    }
    if (match.sameSign === false) {
      starsOk = false;
      errors.push(issue("STAR_CROSS_SIGN_CONTACT", "error", `${match.starName} foi promovida apesar de atravessar fronteira de signo.`));
    }
    if (match.interpretiveTier === "traditional-secondary" && match.orb > 1 + 1e-9) {
      starsOk = false;
      errors.push(issue("COMMON_STAR_ORB_LEAK", "error", `${match.starName} secundária entrou a ${match.orb.toFixed(4)}°, acima de 1°.`));
    }
    if (match.interpretiveTier === "principal-source-locked" && match.orb > 3 + 1e-9) {
      starsOk = false;
      errors.push(issue("PRINCIPAL_STAR_ORB_LEAK", "error", `${match.starName} principal/source-locked entrou a ${match.orb.toFixed(4)}°, acima de 3°.`));
    }
    const key = `${match.pointName}|${match.starName.toLowerCase()}`;
    if (starKeys.has(key)) {
      starsOk = false;
      errors.push(issue("DUPLICATE_INTERPRETIVE_STAR_NAME", "error", `O mesmo nome tradicional ${match.starName} aparece mais de uma vez para ${match.pointName}.`));
    }
    starKeys.add(key);
  }
  const catalogTraditionalNames = new Set<string>();
  for (const star of chart.fixedStarCatalog ?? []) {
    if (!star.traditionalName || star.traditionalNameCanonical === false) continue;
    const key = star.traditionalName.toLowerCase();
    if (catalogTraditionalNames.has(key)) {
      starsOk = false;
      errors.push(issue("DUPLICATE_CANONICAL_TRADITIONAL_STAR", "error", `Nome tradicional canônico duplicado no catálogo: ${star.traditionalName}.`));
    }
    catalogTraditionalNames.add(key);
  }
  pass("fixedStarInterpretiveSanitation", starsOk);

  const starMeta = chart.fixedStarCatalogMetadata;
  const starEngineOk = Boolean(
    starMeta
      && starMeta.calculationMode !== "failed"
      && starMeta.uniqueEntries > 0
      && starMeta.calculatedEntries === starMeta.uniqueEntries
      && starMeta.failedEntries === 0
      && (chart.fixedStarCatalog?.length ?? 0) === starMeta.uniqueEntries
  );
  if (!pass("fixedStarEngineHealthy", starEngineOk)) {
    errors.push(issue(
      "FIXED_STAR_ENGINE_FAILURE",
      "error",
      "O céu estelar completo não foi calculado integralmente; falha parcial também bloqueia a liberação para IA.",
      starMeta ? `unique=${starMeta.uniqueEntries}; calculated=${starMeta.calculatedEntries}; failed=${starMeta.failedEntries}; root=${chart.fixedStarCatalog?.length ?? 0}` : "metadata ausente",
    ));
  }

  const coreDossiersOk = Boolean(
    analysis.technicalForm.sect
      && analysis.technicalForm.temperament
      && analysis.technicalForm.lordOfNativity
      && analysis.technicalForm.manner
      && analysis.technicalForm.mentality
      && analysis.technicalForm.dispositors
  );
  if (!pass("coreDossiersMaterializedInStructuredForm", coreDossiersOk)) {
    errors.push(issue("CORE_DOSSIERS_NOT_MATERIALIZED", "error", "O formulário estruturado não materializou todos os dossiês nucleares (secta, temperamento, Senhor, Manner, mentalidade, dispositores)."));
  }

  const temperamentCanonicalOk = analysis.temperament.canonicalConclusion === null
    && analysis.temperament.temperament === "JULGAMENTO_QUALITATIVO_PENDENTE"
    && analysis.temperament.witnesses.length === 5;
  if (!pass("temperamentQualitativeNoAutoVerdict", temperamentCanonicalOk)) {
    errors.push(issue("TEMPERAMENT_AUTOMATIC_VERDICT", "error", "Temperamento Marcos deve entregar cinco testemunhos e deixar a conclusão canônica para julgamento qualitativo, sem votação automática."));
  }

  const anaretaDistancesOk = analysis.lifeIndicatorsFrawley.anareta.eighthHousePlanets.every((item) => item.distanceFromCusp >= 0 && item.distanceFromCusp <= 180);
  if (!pass("anaretaCuspDistanceNormalized", anaretaDistancesOk)) {
    errors.push(issue("ANARETA_CUSP_DISTANCE_INVALID", "error", "Candidato a Anareta recebeu distância de cúspide não normalizada; planeta antes da VIII por regra de cúspide não pode aparecer a ~358°."));
  }

  const lotsNotRelocated = analysis.technicalForm.lots.every((lot) =>
    lot.housePlacement.ruleScope === "point-contact-only"
    && lot.housePlacement.effectiveHouseMarcos === lot.housePlacement.geometricHouse
    && lot.housePlacement.effectiveHouseFrawley === lot.housePlacement.geometricHouse
  );
  if (!pass("lotsRemainPointsNotPlanets", lotsNotRelocated)) {
    errors.push(issue("LOT_EFFECTIVE_HOUSE_RELOCATION", "error", "Uma Parte foi relocada como se fosse planeta pela regra de cúspide."));
  }

  const derived = analysis.technicalForm.derivedHouseTable;
  const derivedKeys = new Set(derived.map((item) => `${item.baseHouse}:${item.relativeHouse}`));
  const derivedTableOk = derived.length === 144 && derivedKeys.size === 144
    && derived.every((item) => item.resolvedHouse === ((item.baseHouse + item.relativeHouse - 2) % 12) + 1);
  if (!pass("derivedHouseTable12x12", derivedTableOk)) {
    errors.push(issue("DERIVED_HOUSE_TABLE_INVALID", "error", `Tabela derivada deve ter 144 células únicas; recebeu ${derived.length}.`));
  }

  let guguAnglesOk = true;
  for (const item of analysis.profession.guguSupplement.angularProminence) {
    if (![1, 4, 7, 10].includes(item.house)) {
      guguAnglesOk = false;
      errors.push(issue("GUGU_FALSE_ANGULARITY", "error", `${item.planet} foi rotulado angular na casa ${item.house}.`));
    }
  }
  pass("guguAngularSemantics", guguAnglesOk);

  const mannerOk = analysis.manner.candidates.length <= 1
    || (analysis.manner.status === "multiplos-testemunhos" && analysis.manner.selected === null);
  if (!pass("mannerNoInventedTieBreak", mannerOk)) {
    errors.push(issue("MANNER_AUTOMATIC_TIEBREAK", "error", "Manner com múltiplos candidatos recebeu vencedor automático."));
  }

  const timezoneOk = Boolean(chart.calculationMetadata?.timezone && chart.birthDate.coordinates.timezone);
  if (!pass("ianaTimezonePresent", timezoneOk)) {
    errors.push(issue("TIMEZONE_MISSING", "error", "Fuso IANA ausente do mapa calculado."));
  }

  if (aiReport !== undefined) {
    const noSixtySeconds = !/\d+°\d{2}′60″/.test(aiReport);
    if (!pass("reportSexagesimalCarry", noSixtySeconds)) {
      errors.push(issue("SEXAGESIMAL_60_SECONDS", "error", "O relatório contém 60 segundos sem carry para o minuto seguinte."));
    }
    const cleanNoScores = !/score auxiliar|Ranking legado de Senhor da Genitura|ledger numérico legado|ledger histórico|ledger-força=|5\/4\/3\/2\/1=|dignidades \[[^\]]*[+-]\d/i.test(aiReport);
    if (!pass("aiReportNoLegacyScores", cleanNoScores)) {
      errors.push(issue("AI_REPORT_SCORE_CONTAMINATION", "error", "O relatório limpo da IA contém scores/ledgers históricos que devem ficar só na auditoria."));
    }
    const timeFormatted = /Nascimento civil:\s+\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/.test(aiReport);
    if (!pass("civilTimeFormatted", timeFormatted)) {
      errors.push(issue("CIVIL_TIME_FORMAT", "error", "Horário civil não está em HH:MM:SS no relatório limpo."));
    }
    const impossibleIngressText = /ingresso (?:anterior|próximo) ([^→\s;,]+)→\1(?:[;,])/i.test(aiReport);
    if (!pass("reportNoSameSignIngress", !impossibleIngressText)) {
      errors.push(issue("REPORT_IMPOSSIBLE_INGRESS", "error", "O relatório textual contém ingresso de signo X→X."));
    }
  }

  // Source-gap registry is machine-audited. A gap may remain non-blocking when
  const authorialTemperamentsOk = Boolean(
    analysis.temperaments?.marcos
    && analysis.temperaments?.frawley?.publishedBaselineSource === "The Real Astrology Applied"
    && analysis.temperaments?.frawley?.exactCurrentCalculationStatus === "CURRENT_METHOD_NOT_PUBLIC"
    && analysis.temperaments?.gugu?.historicalFourComponents?.length === 4
  );
  if (!pass("authorialTemperamentsMaterialized", authorialTemperamentsOk)) {
    errors.push(issue("AUTHORIAL_TEMPERAMENTS_MISSING", "error", "As trilhas independentes de temperamento Marcos/Frawley/Gugu não estão integralmente materializadas."));
  }

  const guguDossierOk = Boolean(
    analysis.gugu?.primaryMotivation?.ascendantRuler?.planet
    && analysis.gugu?.primaryMotivation?.realizationInstrument?.planet
    && analysis.gugu?.powersOfSoul?.faculties?.length === 7
    && analysis.gugu?.planetRoleMatrix?.planets?.length === 7
    && analysis.gugu?.philosophicalFrame?.anthropologyLayers?.length === 4
  );
  if (!pass("guguNatalDossierMaterialized", guguDossierOk)) {
    errors.push(issue("GUGU_DOSSIER_MISSING", "error", "Motivação primária, potências da alma, matriz planetária ou quadro filosófico de Gugu está incompleto."));
  }

  const frawleyParts = analysis.spiritualOrientation?.sevenKeyLots ?? [];
  const expectedFrawleyPartKeys = new Set(["spirit", "faith", "love", "despair", "valour", "victory", "captivity"]);
  const frawleyPartsOk = frawleyParts.length === 7
    && frawleyParts.every((part) => expectedFrawleyPartKeys.has(part.key))
    && frawleyParts.some((part) => part.key === "captivity" && part.formula === "ASC + Saturno - Fortuna");
  if (!pass("frawleySpiritualPartsIndependent", frawleyPartsOk)) {
    errors.push(issue("FRAWLEY_SPIRITUAL_PARTS_INVALID", "error", "As sete Partes espirituais publicadas de Frawley não estão independentes e completas."));
  }

  const outerModifiersOk = analysis.outerPlanetModifiers.every((outer) =>
    outer.policy.rulership === "NONE"
    && outer.policy.essentialDignity === "NONE"
    && outer.policy.almutenParticipation === "NONE"
    && outer.policy.role === "SECONDARY_MODIFIER_ONLY"
    && outer.policy.authorialOrbStatus === "UNIVERSAL_CUTOFF_NOT_PUBLISHED"
    && outer.policy.allowedAspectTypes.join("|") === "conjunction|opposition"
    && outer.contacts.every((contact) =>
      contact.automaticInterpretation === false
      && contact.authorialOrbStatus === "UNIVERSAL_CUTOFF_NOT_PUBLISHED"
      && (contact.aspect === "conjunction" || contact.aspect === "opposition")
    )
  );
  if (!pass("outerPlanetsRemainSecondary", outerModifiersOk)) {
    errors.push(issue("OUTER_PLANET_ROLE_LEAK", "error", "Urano/Netuno/Plutão receberam função proibida de regência, dignidade ou almuten."));
  }

  // the engine has enough radical evidence and explicitly refuses to invent the
  // missing author-specific rule. Any unresolved gap marked as radical-blocking
  // is a production failure.
  const sourceGaps = analysis.technicalForm.sourceGapRegistry;
  const sourceGapIds = new Set(sourceGaps.map((gap) => gap.id));
  const sourceGapUnique = sourceGaps.length === sourceGapIds.size;
  if (!pass("sourceGapRegistryUnique", sourceGapUnique)) {
    errors.push(issue("SOURCE_GAP_DUPLICATE_ID", "error", "O registro de gaps contém IDs duplicados."));
  }

  const sourceGapProvenanceOk = sourceGaps.every((gap) =>
    gap.id.trim().length > 0
    && gap.domain.trim().length > 0
    && gap.engineBehavior.trim().length > 0
    && gap.provenance.length > 0
    && gap.provenance.every((item) => item.trim().length > 0)
  );
  if (!pass("sourceGapRegistryProvenance", sourceGapProvenanceOk)) {
    errors.push(issue("SOURCE_GAP_PROVENANCE_MISSING", "error", "Todo gap deve declarar domínio, comportamento do motor e proveniência documental."));
  }

  const blockingGaps = sourceGaps.filter((gap) => gap.blocksRadicalInterpretation && gap.status !== "RESOLVED_IMPLEMENTED");
  if (!pass("noBlockingRadicalSourceGaps", blockingGaps.length === 0)) {
    errors.push(issue(
      "BLOCKING_RADICAL_SOURCE_GAP",
      "error",
      "Há regra ausente marcada como necessária para interpretar o radical; a saída não pode ser liberada para IA.",
      blockingGaps.map((gap) => gap.id).join(", "),
    ));
  }

  const rejected = sourceGaps.filter((gap) => gap.status === "REJECTED_UNVERIFIED");
  const disabledProfession = analysis.profession.frawleyVocationalIndicators.disabledUnverifiedCriteria.join(" ").toLowerCase();
  const rejectedRulesDisabled = rejected.every((gap) =>
    gap.id !== "frawley-profession-sunrise-criterion" || (disabledProfession.includes("nasce mais próximo") && disabledProfession.includes("não atribuir"))
  );
  if (!pass("rejectedUnverifiedRulesDisabled", rejectedRulesDisabled)) {
    errors.push(issue("REJECTED_RULE_LEAKED_ACTIVE", "error", "Uma regra documentalmente rejeitada como não verificada ainda parece ativa no motor."));
  }

  for (const gap of sourceGaps) {
    if (gap.blocksRadicalInterpretation || gap.status === "RESOLVED_IMPLEMENTED") continue;
    if (gap.status === "SOURCE_LOCKED_UNRESOLVED") {
      warnings.push(issue(`SOURCE_GAP_${gap.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`, "warning", `${gap.author} / ${gap.domain}: regra permanece source-locked e não é inventada.`, gap.missingEvidence.join("; ")));
    } else if (gap.status === "PARTIAL_RAW_EVIDENCE_ONLY") {
      warnings.push(issue(`RAW_ONLY_${gap.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`, "warning", `${gap.author} / ${gap.domain}: o motor entrega somente evidência bruta na parte não source-locked.`, gap.missingEvidence.join("; ")));
    } else if (gap.status === "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED") {
      warnings.push(issue(`AUTHORIAL_DISCRETION_${gap.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`, "warning", `${gap.author} / ${gap.domain}: toda a geometria/cálculo está materializada; a fonte não fixa um cutoff universal para automatizar o juízo.`, gap.missingEvidence.join("; ")));
    } else if (gap.status === "CURRENT_METHOD_NOT_PUBLIC") {
      warnings.push(issue(`CURRENT_METHOD_NOT_PUBLIC_${gap.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`, "warning", `${gap.author} / ${gap.domain}: o escopo atual é confirmado, mas o algoritmo atual não é público; a versão conhecida é mantida separada sem falsificação.`, gap.missingEvidence.join("; ")));
    } else if (gap.status === "REJECTED_UNVERIFIED") {
      warnings.push(issue(`UNVERIFIED_RULE_DISABLED_${gap.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`, "warning", `${gap.author} / ${gap.domain}: regra alegada foi desabilitada por falta de fonte direta.`));
    }
  }
  if (analysis.manner.selected === null && analysis.manner.candidates.length > 1) {
    warnings.push(issue("MANNER_QUALITATIVE_SELECTION_REQUIRED", "warning", `Manner possui candidatos ${analysis.manner.candidates.map((c) => c.planet).join(", ")}; seleção qualitativa fica para o julgamento, sem score.`));
  }

  return {
    schemaVersion: "1.2.0",
    status: errors.length ? "FAIL" : "PASS",
    errors,
    warnings,
    checks,
  };
}

export function prependNatalValidationHeader(report: string, validation: NatalProductionValidation): string {
  const lines = [
    `PRODUCTION_VALIDATION=${validation.status}; checks=${Object.keys(validation.checks).length}; errors=${validation.errors.length}; warnings=${validation.warnings.length}.`,
    ...(validation.errors.map((item) => `VALIDATION_ERROR ${item.code}: ${item.message}${item.context ? ` [${item.context}]` : ""}`)),
    ...(validation.warnings.map((item) => `VALIDATION_WARNING ${item.code}: ${item.message}`)),
    "",
  ];
  return lines.join("\n") + report;
}
