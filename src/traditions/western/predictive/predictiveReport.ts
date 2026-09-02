import type { PredictiveEngineResult, PredictiveFixedStarContact } from "./predictiveTypes";

function active<T extends { operationallyActive: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.operationallyActive);
}

function fixedStarSection(items: PredictiveFixedStarContact[]): string[] {
  const hits = items.filter((item) => item.operationallyActive || item.authorEligibility.frawley === "SOURCE_LOCKED_RETURN_EXAMPLE_DISTANCE_UNFILTERED");
  if (!hits.length) return ["- Nenhuma conjunção temporal source-locked de estrela fixa ativa nesta camada."];
  return hits.map((item) => `- ${item.moving} ↔ ${item.star}: distância ${item.distanceToConjunction.toFixed(4)}°; estrela em ${item.starSign}; modo=${item.calculationMode}; mesmo signo=${item.sameSign}; MarcosAtivo=${item.operationallyActive}; Frawley=${item.authorEligibility.frawley}; orbe Marcos quando aplicável=${item.maxOrbDeg}°.`);
}

export function generatePredictiveReport(result: Omit<PredictiveEngineResult, "analysisReport">): string {
  const lines: string[] = [
    "# MATHASTRO — DOSSIÊ TÉCNICO DE ASTROLOGIA PREDITIVA",
    "",
    `Schema: ${result.schema} | versão ${result.schemaVersion}`,
    `Princípio: ${result.principle}`,
    `Perfil autoral: ${result.authorMode}`,
    `Validação: ${result.validation.status}`,
    "",
    "## REGRA DE USO PELA IA",
    "A IA NÃO deve recalcular posições, retornos, períodos, profecções ou aspectos. Deve julgar somente a evidência mecânica fornecida. Campo ausente, source gap ou técnica deferida não autoriza reconstrução intuitiva.",
    "Autores permanecem separados: convergência não transforma divergências Marcos/Frawley/Gugu numa doutrina sintética inventada.",
    "",
    "## RADIX UPSTREAM",
    `- release natal para IA: ${result.radix.natalAiReleaseStatus}`,
    `- UTC natal: ${result.radix.utcIso}`,
    `- erros natais: ${result.radix.natalValidationErrorCodes.join(", ") || "nenhum"}`,
  ];

  if (result.progressions) {
    lines.push(
      "",
      "## PROGRESSÕES SECUNDÁRIAS",
      `- método: ${result.progressions.method}`,
      `- idade decimal: ${result.progressions.ageYears.toFixed(8)} anos`,
      `- instante efemérico progredido: ${result.progressions.progressedUtcIso}`,
      `- política de aspectos: ${result.progressions.aspectPolicy}; proveniência=${result.progressions.aspectPolicyProvenance}; fontes=[${result.progressions.aspectPolicySourceIds.join(", ") || "nenhuma — subconjunto conservador não atribuído a Frawley"}]`,
      `- casas na camada principal: ${result.progressions.houseSystemPolicy.primary}; Frawley natal=${result.progressions.houseSystemPolicy.frawleyNatal}; geometria autoral alternativa=${result.progressions.houseSystemPolicy.alternateAuthorGeometryMaterialized ? "materializada" : "não necessária"}`,
      ...(result.progressions.authorVariants ? Object.values(result.progressions.authorVariants).filter(Boolean).flatMap((variant) => [
        `- variante autoral ${variant!.author}: casas=${variant!.houseSystem}; ASC=${variant!.progressedSky.angles.find((p) => p.name === "ASC")?.longitude.toFixed(6)}°; MC=${variant!.progressedSky.angles.find((p) => p.name === "MC")?.longitude.toFixed(6)}°; contatos ativos→radix=${active(variant!.contactsToRadix).length}; antíscios ativos→radix=${active(variant!.antiscionContactsToRadix).length}; estrelas=${variant!.temporalFixedStarContacts.length}`,
        `  - cúspides progredidas: ${variant!.progressedSky.cusps.map((c) => `H${c.house}=${c.longitude.toFixed(6)}°`).join(", ")}`,
        `  - timeline autoral: ${variant!.progressionWindow ? `${variant!.progressionWindow.startUtcIso} → ${variant!.progressionWindow.endUtcIso}; eventos=${variant!.progressionWindow.allEvents.length}` : "ausente"}`,
        ...active(variant!.contactsToRadix).map((contact) => `  - ${contact.moving} ${contact.aspect} ${contact.target}: erro ${contact.distanceToExact.toFixed(5)}°`),
      ]) : []),
      `- contatos ativos com radix: ${active(result.progressions.contactsToRadix).length}`,
      ...active(result.progressions.contactsToRadix).map((contact) => `  - ${contact.moving} ${contact.aspect} ${contact.target}: erro ${contact.distanceToExact.toFixed(5)}°`),
      `- Partes progredidas: ${result.progressions.progressedLots.map((lot) => `${lot.name}@${lot.longitude.toFixed(4)}°`).join("; ") || "nenhuma"}`,
      `- antíscios progredidos ativos→radix: ${active(result.progressions.antiscionContactsToRadix).length}; internos: ${active(result.progressions.antiscionContactsWithinProgressedSky).length}`,
      ...(result.progressions.progressionWindow ? [
        `- timeline do ano solar governante: ${result.progressions.progressionWindow.startUtcIso} → ${result.progressions.progressionWindow.endUtcIso}; amostras=${result.progressions.progressionWindow.sampleCount}; eventos=${result.progressions.progressionWindow.allEvents.length}`,
        `- perfeições diretas=${result.progressions.progressionWindow.directEvents.length}; antíscios=${result.progressions.progressionWindow.antiscionEvents.length}; estrelas=${result.progressions.progressionWindow.fixedStarEvents.length}; mudanças de termo=${result.progressions.progressionWindow.termIngressEvents.length}; ingressos de signo=${result.progressions.progressionWindow.signIngressEvents.length}`,
        ...result.progressions.progressionWindow.allEvents.map((event) => `  - ${event.perfectionUtcIso}: ${event.moving} ${event.kind === "direct-contact" || event.kind === "antiscion-contact" || event.kind === "fixed-star-conjunction" ? `${event.aspect ?? "conjunction"} ${event.target}` : `${event.fromValue ?? "?"}→${event.toValue ?? event.target}`} [${event.kind}] residual=${event.residualDeg.toExponential(3)}°; simbólico=${event.symbolicUtcIso}`),
      ] : ["- timeline do ano solar governante: AUSENTE — a IA não deve extrapolar datas por conta própria."]),
      "- estrelas fixas na época progredida:",
      ...fixedStarSection(result.progressions.temporalFixedStarContacts),
    );
  } else {
    lines.push("", "## PROGRESSÕES SECUNDÁRIAS", "- Fora do perfil autoral selecionado; não calculadas.");
  }

  for (const dossier of [result.solarReturn, result.lunarReturn, result.derivedLunarReturn].filter(Boolean)) {
    const ret = dossier!;
    lines.push(
      "",
      `## ${ret.kind.toUpperCase()}`,
      `- instante exato UTC: ${ret.exactReturnUtcIso}`,
      `- residual: ${ret.residualArcSeconds.toFixed(8)} arcsec`,
      `- localização primária: ${ret.locationPolicy.primaryLocation} (${ret.sky.location.name ?? "sem nome"})`,
      `- política espacial: ${ret.locationPolicy.rationale}`,
      `- geometria alternativa do local do evento: ${ret.alternateEventLocationSky ? "materializada" : "não aplicável/não solicitada"}`,
      `- sistema de casas principal: ${ret.sky.houseSystem}; variantes autorais R/P: ${ret.authorHouseSystemVariants ? "materializadas separadamente" : "não necessárias"}`,
      `- contatos ativos retorno↔radix: ${active(ret.contactsToRadix).length}`,
      `- aspectos internos ativos da Revolução: ${active(ret.contactsWithinReturn).length}; planeta↔ângulo internos ativos=${active(ret.planetAngleContactsWithinReturn).length}`,
      `- cúspides ativas↔radix: ${active(ret.cuspContactsToRadix).length}; planetas até 2° de cúspides da própria Revolução: ${ret.cuspProximities.length}`,
      `- antíscios ativos retorno↔radix: ${active(ret.antiscionContactsToRadix).length}; internos: ${active(ret.antiscionContactsWithinReturn).length}; cúspide-antíscio→ângulo: ${active(ret.cuspAntiscionContactsWithinReturn).length}`,
      `- nodos: ${ret.sky.nodes.map((node) => `${node.name}@${node.longitude.toFixed(4)}° casa ${node.house ?? "?"}`).join("; ")}; contatos ativos nodais→radix=${active(ret.nodeContactsToRadix).length}; antíscios nodais→nodos/ângulos natais=${active(ret.nodeAntiscionContactsToRadix).length}`,
      `- repetição/espelhamento de eixos retorno↔radix (C/O ativas): ${active(ret.angleContactsToRadixAngles).length}`,
      `- casas dos planetas: ${ret.sky.planets.map((point) => `${point.name}=H${point.house ?? "?"}`).join(", ")}`,
      `- angularidade: angulares=[${ret.houseEmphasis.angular.join(", ")}]; sucedentes=[${ret.houseEmphasis.succedent.join(", ")}]; cadentes=[${ret.houseEmphasis.cadent.join(", ")}]; todos cadentes=${ret.houseEmphasis.allTraditionalPlanetsCadent}; todos cadentes e longe das cúspides=${ret.houseEmphasis.allTraditionalPlanetsCadentAndAwayFromCusps}`,
      `- mudanças de condição essencial/signo: ${ret.dignityChangesFromRadix.filter((item) => item.changed).map((item) => item.planet).join(", ") || "nenhuma"}`,
      `- recepções atuais: ${ret.receptions.length}; mudanças radix→retorno: ${ret.receptionChangesFromRadix.filter((item) => item.changed).length}`,
      `- ingressos recentes com mudança de recepção: ${ret.recentSignIngresses.filter((item) => item.changedReceptionKeys.length).map((item) => `${item.planet} ${item.fromSign}→${item.toSign} há ${item.daysBeforeReturn.toFixed(2)}d`).join("; ") || "nenhum no horizonte"}`,
      `- ingressos futuros com mudança de recepção: ${ret.imminentSignIngresses.filter((item) => item.changedReceptionKeys.length).map((item) => `${item.planet} ${item.fromSign}→${item.toSign} em ${item.daysAfterReturn.toFixed(2)}d`).join("; ") || "nenhum no horizonte"}`,
      `- condições solares atuais: ${ret.solarConditions.map((item) => `${item.planet}: Marcos=${item.marcosStatus}, Frawley=${item.frawleyStatus}, sep=${item.separationDeg.toFixed(3)}°, ${item.approachingSun === null ? "direção indeterminada" : item.approachingSun ? "aproximando do Sol" : "afastando do Sol"}`).join("; ")}`,
      `- continuidade de regentes por casa radix↔retorno: ${ret.houseRulerContinuities.filter((item) => item.sameRuler).map((item) => `H${item.house}:${item.radicalRuler}`).join(", ") || "nenhuma"}`,
      `- regentes das casas da Revolução materializados: ${ret.returnHouseRulers.length}; contatos entre regentes=${ret.returnHouseRulerContacts.length}; regentes das casas natais em suas posições da Revolução=${ret.radicalHouseRulersInReturn.length}; contatos planeta-retorno→regente-casa-natal=${ret.returnPlanetContactsToRadicalHouseRulers.length}`,
      `- Partes da Revolução: ${ret.lots.map((lot) => `${lot.label}@${lot.point.longitude.toFixed(4)}° H${lot.house ?? "?"} → ${lot.dispositor}`).join("; ") || "não ativadas para esta escala"}`,
      "- estrelas fixas temporalmente recalculadas:",
      ...fixedStarSection(ret.temporalFixedStarContacts),
      `- hierarquia: ${ret.hierarchy}`,
    );
  }
  if (!result.solarReturn) lines.push("", "## RETORNOS SOLAR/LUNAR", "- Fora do perfil autoral selecionado; não calculados.");

  if (result.profection) {
    lines.push(
      "",
      "## PROFECÇÃO ANUAL",
      `- idade completa: ${result.profection.ageCompleted}`,
      `- casa profectada: ${result.profection.profectedHouse}`,
      `- signo profectado: ${result.profection.profectedSign}`,
      `- regente anual: ${result.profection.lordOfYear}`,
      `- regra mecânica: ${result.profection.rule}`,
      `- peso interpretativo: ${result.profection.interpretiveWeight}`,
    );
  }

  if (result.guguPeriods) {
    const g = result.guguPeriods;
    lines.push(
      "",
      "## PERÍODOS PLANETÁRIOS — GUGU",
      `- método: ${g.method}`,
      `- Ascendente natal: ${g.natalAscendantSign} (${g.natalAscendantLongitude.toFixed(6)}°)`,
      `- grande período ativo: ${g.activeMajor.sign}/${g.activeMajor.ruler} — ${g.activeMajor.startUtcIso} → ${g.activeMajor.endUtcIso}`,
      `- subperíodo mensal: ${g.minor.active.sign}/${g.minor.active.ruler} — ${g.minor.active.startUtcIso} → ${g.minor.active.endUtcIso}; ciclo zodiacal=${g.minor.active.zodiacCycle}`,
      `- nível diário: ${g.day?.active.sign}/${g.day?.active.ruler}; ciclo zodiacal=${g.day?.active.zodiacCycle}`,
      `- nível horário: ${g.hour?.active.sign}/${g.hour?.active.ruler}; ciclo zodiacal=${g.hour?.active.zodiacCycle}`,
      "- caminho autoral ativo:",
      ...g.activePath.map((item) => `  - ${item.level}: ${item.sign}/${item.ruler}; ${item.startUtcIso} → ${item.endUtcIso}; número=${item.planetaryNumber}`),
      "- condição natal dos regentes ativos:",
      ...(g.lordConditions ?? []).map((item) => `  - ${item.planet}: ${item.sign}, casa ${item.house ?? "?"}, ${item.essentialCondition.labels.join("/") || "sem dignidade/debilidade essencial maior"}${item.retrograde ? ", retrógrado" : ""}`),
      "- distâncias às fronteiras (sem orbe temporal autoral inventado):",
      ...g.boundaryEvidence.map((item) => `  - ${item.level}/${item.ruler}: ${item.elapsedDays.toFixed(3)} dias desde o início; ${item.remainingDays.toFixed(3)} dias até o fim; fronteira mais próxima ${item.nearestBoundaryDistanceDays.toFixed(3)} dias.`),
      `- regra de autoridade: receptor pesa mais=${g.interpretiveMechanics.receiverHasGreaterWeight}; condição natal deve ser comparada=${g.interpretiveMechanics.compareNatalConditionOfPeriodLords}; score agregado=${g.interpretiveMechanics.noAggregateScore ? "disabled" : "enabled"}`,
    );
  }

  lines.push(
    "",
    "## TRÂNSITOS",
    `- política: ${result.transits.triggerPolicy}`,
    `- contatos ativos: ${active(result.transits.contactsToRadix).length}`,
    ...result.transits.triggers.map((trigger) => `- ${trigger.status}: ${trigger.contact.moving} ${trigger.contact.aspect} ${trigger.contact.target}; apoio=[${trigger.supportLayers.join(", ")}]. ${trigger.reason}`),
    "- estrelas fixas no céu-alvo:",
    ...fixedStarSection(result.transits.temporalFixedStarContacts),
    "",
    "## CONVERGÊNCIA MARCOS/FRAWLEY",
    ...(result.convergence.length ? result.convergence.map((item) => `- ${item.radixTarget}: [${item.layers.join(", ")}]; ${item.evidence.join(" | ")}`) : ["- Nenhuma camada de convergência Marcos/Frawley neste perfil."]),
    "- Não há score agregado.",
    "",
    "## FALLBACKS AUTORAIS EXPLÍCITOS",
    ...(result.authorFallbacks.length ? result.authorFallbacks.map((item) => `- ${item.gapId}: ${item.suppliedBy} supre operacionalmente a lacuna de ${item.missingAuthor} em [${item.appliesInModes.join(", ")}]; fontes=[${item.sourceIds.join(", ")}]. ${item.rule} Não implica concordância do autor ausente.`) : ["- nenhum — perfil não combinado ou nenhuma lacuna suprida por outro autor."]),
    "",
    "## SOURCE GAPS / TÉCNICAS DEFERIDAS",
    ...(result.sourceGaps.length ? result.sourceGaps.map((gap) => `- ${gap.id} (${gap.blocking ? "BLOCKING" : "NON-BLOCKING"}): ${gap.note}`) : ["- nenhum"]),
    "",
    "## ORDEM DE JULGAMENTO DA IA",
    ...result.interpretationOrder.map((item) => `- ${item}`),
    "",
    "## CONTRATO DE JULGAMENTO SUBJETIVO DA IA",
    `- schema: ${result.aiJudgmentContract.schema}; versão=${result.aiJudgmentContract.contractVersion}; botReady=${result.aiJudgmentContract.botReady}`,
    `- consulta/pergunta: ${result.aiJudgmentContract.consultation.question?.trim() || "não informada — tarefas semânticas ficam CONTEXTO_INSUFICIENTE"}`,
    `- contexto humano: ${result.aiJudgmentContract.consultation.context?.trim() || "não informado"}`,
    "- A IA pode julgar: " + result.aiJudgmentContract.subjectivityBoundary.aiMayJudge.join("; "),
    "- Exclusivo do motor: " + result.aiJudgmentContract.subjectivityBoundary.engineExclusive.join("; "),
    "- Proibições duras: " + result.aiJudgmentContract.hardProhibitions.join("; "),
    "- Tarefas de julgamento:",
    ...result.aiJudgmentContract.tasks.map((task) => `  - ${task.id} | ${task.type} | ${task.status} | autores=[${task.authors.join(", ")}]: ${task.purpose} | evidência permitida=[${task.allowedEvidencePaths.join(", ")}]`),
    "",
    "## PROMPT ABSOLUTO PARA A IA — PT-BR",
    `Prompt ID: ${result.aiPrompt.id} | versão=${result.aiPrompt.version}`,
    "",
    result.aiPrompt.text,
    "",
    "## VALIDAÇÃO",
    ...Object.entries(result.validation.checks).map(([key, value]) => `- ${value ? "PASS" : "FAIL"} ${key}`),
    ...(result.validation.warnings.length ? ["", "### Avisos", ...result.validation.warnings.map((warning) => `- ${warning}`)] : []),
    "",
    "## ANEXO MECÂNICO",
    "O objeto JSON retornado pela API é o anexo mecânico integral e canônico. Este texto é índice humano e não substitui nenhum campo do JSON.",
  );
  return lines.join("\n");
}
