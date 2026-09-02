import type { FixedStarMatch } from "@/interfaces/BirthChartInterfaces";
import type {
  CrossReception,
  NatalInteractionPattern,
  SynastryAnalysis,
  SynastryPersonFoundation,
} from "./types";

function orb(value?: number): string {
  if (value === undefined) return "—";
  const d = Math.floor(value);
  const minutes = Math.round((value - d) * 60);
  return `${d}°${String(minutes).padStart(2, "0")}′`;
}

function longitude(value?: number): string {
  if (value === undefined) return "—";
  const normalized = ((value % 360) + 360) % 360;
  const sign = Math.floor(normalized / 30);
  const degree = normalized % 30;
  const names = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  return `${degree.toFixed(3)}° ${names[sign]} (${normalized.toFixed(5)}°)`;
}

function lines(title: string, items: string[]): string[] {
  return [title, ...(items.length ? items.map((item) => `- ${item}`) : ["- Nenhum testemunho materializado."]), ""];
}

function starLines(label: string, matches: FixedStarMatch[]): string[] {
  if (!matches.length) return [`- ${label}: nenhuma estrela relevante materializada.`];
  return matches.map((match) =>
    `- ${label}: ${match.starName}, orbe ${orb(match.orb)}${match.nature ? `, natureza ${match.nature}` : ""}.`,
  );
}

function receptionCompact(items: CrossReception[]): string {
  if (!items.length) return "nenhuma";
  return items
    .map((item) => `${item.actorPerson}:${item.actorPlanet}→${item.targetPerson}:${item.targetPlanet}/${item.by}/${item.polarity}`)
    .join("; ");
}

function foundationLines(person: SynastryPersonFoundation): string[] {
  const out = [
    `${person.label}: ASC ${person.ascendant.sign} (${person.ascendant.ruler}); seita ${person.sect}.`,
    `Temperamento natal: ${person.temperament.summary}; Senhor da Natividade: ${person.lordOfNativity ?? "indeterminado"}.`,
    `Mentalidade/modos/orientação espiritual: preservados integralmente no JSON do motor natal em leitura somente; não recebem escore cruzado inventado.`,
  ];

  const supplement = person.romanticMarriageSupplement;
  if (supplement) {
    const dossier = supplement.relationshipPattern;
    const localAspect = dossier.directAspect
      ? `${dossier.ruler1} ${dossier.directAspect.aspect} ${dossier.ruler7}, orbe ${orb(dossier.directAspect.orb)}, ${dossier.directAspect.applying ? "aplicativo" : "separativo"}`
      : "sem aspecto direto I–VII";
    out.push(
      `SUPLEMENTO AMOR/CASAMENTO — eixo natal I–VII: regente I=${dossier.ruler1}; regente VII=${dossier.ruler7}; ${localAspect}.`,
      `Recepção natal I→VII: ${dossier.reception1To7.length ? dossier.reception1To7.map((item) => `${item.by}/${item.polarity}`).join("+") : "nenhuma"}; VII→I: ${dossier.reception7To1.length ? dossier.reception7To1.map((item) => `${item.by}/${item.polarity}`).join("+") : "nenhuma"}.`,
      `Orientação comum I/VII: ${supplement.commonNatalInterests.length ? supplement.commonNatalInterests.map((item) => item.receiver).join(", ") : "nenhum receptor positivo comum materializado"}.`,
      `Parte do Amor: ${supplement.relationshipLots.partOfLove ? `${supplement.relationshipLots.partOfLove.name} ${longitude(supplement.relationshipLots.partOfLove.longitude)}` : "não materializada"}.`,
      `Partes de casamento preservadas: ${supplement.relationshipLots.marriageParts.length}.`,
      ...starLines("estrela do regente I", supplement.relationshipRulerStars.ruler1),
      ...starLines("estrela do regente VII", supplement.relationshipRulerStars.ruler7),
    );
  }
  return out;
}

function patternLines(pattern: NatalInteractionPattern): string[] {
  const h = pattern.counterpartHouseFoundation;
  return [
    `${pattern.person}: papel da outra pessoa = ${pattern.roleLabel}; casa ${pattern.counterpartHouse}; regente do nativo=${pattern.selfRuler}; Lua=significador secundário; regente do papel=${pattern.counterpartRuler}.`,
    `Tom técnico do padrão: ${pattern.tone} [classificador operacional, não escore].`,
    `Aspecto natal regente I↔papel: ${pattern.directAspect ? `${pattern.directAspect.aspect}, orbe ${orb(pattern.directAspect.orb)}, ${pattern.directAspect.applying ? "aplicativo" : "separativo"}` : "nenhum aspecto direto"}.`,
    `Aspecto natal Lua↔papel: ${pattern.moonDirectAspect ? `${pattern.moonDirectAspect.aspect}, orbe ${orb(pattern.moonDirectAspect.orb)}, ${pattern.moonDirectAspect.applying ? "aplicativo" : "separativo"}` : "nenhum aspecto direto"}.`,
    `Recepção regente I→papel: ${pattern.selfToCounterpart.length ? pattern.selfToCounterpart.map((item) => `${item.by}/${item.polarity}`).join("+") : "nenhuma"}.`,
    `Recepção papel→regente I: ${pattern.counterpartToSelf.length ? pattern.counterpartToSelf.map((item) => `${item.by}/${item.polarity}`).join("+") : "nenhuma"}.`,
    `Recepção Lua→papel: ${pattern.moonToCounterpart.length ? pattern.moonToCounterpart.map((item) => `${item.by}/${item.polarity}`).join("+") : "nenhuma"}.`,
    `Recepção papel→Lua: ${pattern.counterpartToMoon.length ? pattern.counterpartToMoon.map((item) => `${item.by}/${item.polarity}`).join("+") : "nenhuma"}.`,
    `Estado do regente I: essencial ${pattern.selfEssential.sign}; casa ${pattern.selfAccidental.house}; condição solar ${pattern.selfAccidental.solarCondition}.`,
    `Estado da Lua: essencial ${pattern.moonEssential.sign}; casa ${pattern.moonAccidental.house}; condição solar ${pattern.moonAccidental.solarCondition}.`,
    `Estado do regente do papel: ${pattern.counterpartEssential ? `essencial ${pattern.counterpartEssential.sign}` : "MISSING_ENGINE_DATA"}; ${pattern.counterpartAccidental ? `casa ${pattern.counterpartAccidental.house}, condição solar ${pattern.counterpartAccidental.solarCondition}` : "MISSING_ENGINE_DATA"}.`,
    `Casa ${h.house} (${h.topic}): cúspide ${h.cuspSign} em ${longitude(h.cuspLongitude)}; testemunhos planetários diretos=${h.cuspPlanetContacts.length}; ocupantes/testemunhos=${h.occupants.length}; Partes ativas=${h.activeLots.length}; estrelas na cúspide=${h.cuspFixedStars.length}.`,
    ...starLines(`estrelas do regente do papel ${pattern.counterpartRuler}`, pattern.counterpartRulerStars),
    ...pattern.evidence.map((item) => `- Evidência: ${item}`),
  ];
}

export function generateSynastryTechnicalReport(analysis: SynastryAnalysis): string {
  const userContext = [
    analysis.userContext.focus ? `- Foco/pergunta: ${analysis.userContext.focus}` : "- Foco/pergunta: não informado.",
    analysis.userContext.relationshipState ? `- Estado atual da relação: ${analysis.userContext.relationshipState}` : "- Estado atual da relação: não informado.",
    analysis.userContext.notes ? `- Observações: ${analysis.userContext.notes}` : "- Observações: não informadas.",
    "- O contexto textual não altera nenhum cálculo mecânico; serve apenas à interpretação posterior.",
  ];

  const out: string[] = [
    `${analysis.method} · v${analysis.methodVersion}`,
    `Autoridade: ${analysis.authority.primary.join(" → ")} · suplemento: ${analysis.authority.secondary.join(", ")}`,
    `Contexto declarado: ${analysis.interactionContext.label}.`,
    `Papéis: A recebe B como ${analysis.interactionContext.roleA} (casa ${analysis.interactionContext.counterpartHouseForA}); B recebe A como ${analysis.interactionContext.roleB} (casa ${analysis.interactionContext.counterpartHouseForB}).`,
    `Proveniência do pareamento de papéis: ${analysis.interactionContext.sourceStatus}${analysis.interactionContext.custom ? " · personalizado" : " · preset"}.`,
    "",
    "0. PRINCÍPIO DE ORDEM",
    "- Não começar pelos contatos entre mapas.",
    "- Primeiro: preservar as duas natividades e comparar o fundamento temperamental geral.",
    "- Depois: julgar em A o padrão natal do papel de B; julgar em B o padrão natal do papel de A; comparar os dois padrões.",
    "- Só então: contatos cruzados → recepções → ressonância pessoa↔papel → cúspides/áreas → antíscios → síntese.",
    "",
    "1. AUDITORIA DE ENTRADA E COMPLETUDE",
    `- Entrada válida: ${analysis.inputAudit.valid ? "sim" : "não"}.`,
    `- Completude mecânica: ${analysis.calculationCompleteness.status}.`,
    `- Mapa A: ${analysis.inputAudit.chartA.traditionalPlanets} planetas tradicionais; ${analysis.inputAudit.chartA.cusps} cúspides; céu integral de estrelas=${analysis.inputAudit.chartA.hasFullFixedStarSky ? "sim" : "não"}.`,
    `- Mapa B: ${analysis.inputAudit.chartB.traditionalPlanets} planetas tradicionais; ${analysis.inputAudit.chartB.cusps} cúspides; céu integral de estrelas=${analysis.inputAudit.chartB.hasFullFixedStarSky ? "sim" : "não"}.`,
    ...Object.entries(analysis.calculationCompleteness.checks).map(([key, value]) => `- check.${key}=${value ? "OK" : "MISSING_ENGINE_DATA"}.`),
    `- Contagens: contatos=${analysis.calculationCompleteness.counts.contacts}; role-core=${analysis.calculationCompleteness.counts.roleCoreContacts}; recepções=${analysis.calculationCompleteness.counts.receptions}; recepções mútuas=${analysis.calculationCompleteness.counts.mutualReceptions}; ressonâncias ativas=${analysis.calculationCompleteness.counts.activeRoleResonances}; antíscios=${analysis.calculationCompleteness.counts.antiscia}.`,
    ...analysis.calculationCompleteness.missing.map((item) => `- MISSING_ENGINE_DATA: ${item}`),
    `- ${analysis.calculationCompleteness.note}`,
    ...analysis.inputAudit.warnings.map((item) => `- Aviso: ${item}`),
    "",
    "2. CONTEXTO PARA A IA — NÃO PARTICIPA DO CÁLCULO",
    ...userContext,
    "",
    "3. FUNDAÇÕES NATAIS — LEITURA SOMENTE",
    ...foundationLines(analysis.foundations.A).map((item) => `- ${item}`),
    ...foundationLines(analysis.foundations.B).map((item) => `- ${item}`),
    "",
    "4. TEMPERAMENTO E TERRENO COMUM — FUNDAMENTO GERAL",
    `- Temperamento: ${analysis.temperamentBond.status}.`,
    ...analysis.temperamentBond.axisRelations.map((item) => `- ${item.axis}: A=${item.personA}; B=${item.personB}; relação=${item.relation}.`),
    ...analysis.temperamentBond.interpretationKey.map((item) => `- ${item}`),
    ...analysis.sharedGround.map((item) => `- [${item.present ? "SIM" : "NÃO"}] ${item.description} [${item.sourceStatus}]`),
    "",
    "5. PADRÃO NATAL DE A PARA O PAPEL DE B",
    ...patternLines(analysis.interactionPatterns.A).map((item) => item.startsWith("-") ? item : `- ${item}`),
    "",
    "6. PADRÃO NATAL DE B PARA O PAPEL DE A",
    ...patternLines(analysis.interactionPatterns.B).map((item) => item.startsWith("-") ? item : `- ${item}`),
    "",
    "7. COMPARAÇÃO DOS PADRÕES — ANTES DOS CONTATOS",
    `- Status: ${analysis.interactionPatterns.comparison.status}.`,
    `- ${analysis.interactionPatterns.comparison.description}`,
    "",
    "8. PONTES LUA–SOL — INDICADORES DERIVADOS DO EXEMPLO FRAWLEY",
    ...analysis.sunMoonBridges.map((item) =>
      `- [${item.present ? "SIM" : "NÃO"}] ${item.direction}; Sol=${item.sunSign}; Lua=${item.moonSign}; Sol-alvo enfraquecido=${item.targetSunWeak ? "sim" : "não"}; Lua-atora enfraquecida=${item.actorMoonWeak ? "sim" : "não"}. ${item.note}`,
    ),
    "",
    "9. RESSONÂNCIA DOS PAPÉIS — REGENTE I + LUA ↔ PADRÃO NATAL",
    ...analysis.roleResonance.map((item) =>
      `- [evidência=${item.present ? "sim" : "não"}; contato=${item.contactPresent ? "sim" : "não"}; recepção=${item.receptionPresent ? "sim" : "não"}] ${item.title}: ${item.description}${item.aspect ? ` Aspecto=${item.aspect}, orbe=${orb(item.orb)}.` : ""} [${item.sourceStatus}]`,
    ),
    "",
    "10. CONTATOS CRUZADOS — COMO E ONDE GANHA CORPO",
    ...analysis.contacts.map((item) =>
      `- ${item.pointA} (A, ${longitude(item.longitudeA)}) ${item.aspect} ${item.pointB} (B, ${longitude(item.longitudeB)}), orbe ${orb(item.orb)} / máx. ${orb(item.maxOrb)}; prioridade=${item.priority}; papéis=${item.roleTags.join(", ") || "nenhum"}; fonte=${item.sourceStatus}. ${item.note} Base: ${item.sourceBasis}`,
    ),
    "",
    "11. RECEPÇÕES CRUZADAS — INCLINAÇÃO, NÃO CONTATO",
    ...analysis.receptions.map((item) =>
      `- ${item.actorPlanet} (${item.actorPerson}) → ${item.targetPlanet} (${item.targetPerson}) por ${item.by}: ${item.quality}; polaridade=${item.polarity}; prioridade=${item.priority}; aspecto simultâneo=${item.hasCrossAspect ? `${item.aspect} ${orb(item.orb)}` : "não"}; seita da triplicidade=${item.sectBasis}.`,
    ),
    "",
    "12. RECEPÇÕES MÚTUAS",
    ...analysis.mutualReceptions.map((item) =>
      `- ${item.personAPlanet} (A) ↔ ${item.personBPlanet} (B); contato=${item.hasCrossAspect ? `${item.aspect} ${orb(item.orb)}` : "não"}; A→B=${receptionCompact(item.aTowardB)}; B→A=${receptionCompact(item.bTowardA)}.`,
    ),
    "",
    "13. ANTÍSCIOS / CONTRA-ANTÍSCIOS — SUBORDINADOS",
    ...analysis.antiscia.map((item) =>
      `- ${item.sourcePoint} (${item.sourcePerson}) ${longitude(item.sourceLongitude)} → antíscio ${longitude(item.antiscionLongitude)} ${item.aspect} ${item.targetPoint} (${item.targetPerson}, ${item.targetPointType}, ${longitude(item.targetLongitude)}), orbe ${orb(item.orb)} / máx. ${orb(item.maxOrb)}; peso=${item.aspectWeight}; prioridade=${item.priority}; fonte=${item.sourceStatus}. Base: ${item.sourceBasis}`,
    ),
    "",
    "14. SÍNTESE HIERÁRQUICA",
    `Encaixe dos padrões: ${analysis.synthesis.patternFit}.`,
    `Vínculo estrutural: ${analysis.synthesis.structuralBond}.`,
    `Capacidade de contato: ${analysis.synthesis.contactCapacity}.`,
    `Reciprocidade: ${analysis.synthesis.reciprocity}.`,
    "",
    ...lines("POR QUÊ", analysis.synthesis.why),
    ...lines("COMO", analysis.synthesis.how),
    ...lines("FORÇAS", analysis.synthesis.strengths),
    ...lines("TENSÕES", analysis.synthesis.tensions),
    ...lines("ASSIMETRIAS", analysis.synthesis.asymmetries),
    ...lines("POTENCIAL FORMATIVO / DE CRESCIMENTO", analysis.synthesis.growthPotential),
    ...lines("LIMITES", analysis.synthesis.limits),
    "15. NOTAS DE FONTE",
    ...analysis.sourceNotes.map((item) => `- ${item}`),
    "",
    "16. QUESTÕES TÉCNICAS AINDA BLOQUEADAS PELA DOCUMENTAÇÃO",
    ...analysis.unresolvedTechnicalQuestions.map((item) => `- ${item}`),
    "",
    "17. CAUTELAS",
    ...analysis.cautions.map((item) => `- ${item}`),
    "",
    "18. CONTRATO PARA INTERPRETAÇÃO POR IA",
    "- A IA interpreta evidência já materializada; não recalcula longitude, casas, aspecto, aplicação/separação, recepção, antíscio, dignidade, estrelas, Partes, temperamento ou Senhor da Natividade.",
    "- Campo ausente = MISSING_ENGINE_DATA. Não preencher lacuna com astrologia genérica.",
    "- Respeitar a ordem: fundações natais/temperamento → padrões natais de papel → comparação → contatos → recepções → ressonância pessoa↔papel → áreas/cúspides → antíscios → síntese.",
    "- Respeitar sourceStatus/sourceBasis. Regra source-locked não pode ser substituída silenciosamente por derivação ou exemplo.",
    "- Não converter a sinastria em percentual, nota de compatibilidade, determinismo de alma gêmea ou prognóstico temporal.",
    "",
    "19. ANEXO JSON INTEGRAL — TODOS OS CAMPOS MATERIALIZADOS PELO MOTOR",
    JSON.stringify(analysis, null, 2),
  ];
  return out.join("\n");
}
