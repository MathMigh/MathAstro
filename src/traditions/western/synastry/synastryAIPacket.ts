import type { SynastryAnalysis } from "./types";

export interface SynastryAIEvaluationPacket {
  schema: "MathAstro.SynastryAIEvidence.v4";
  purpose: string;
  contract: {
    interpretationOrder: readonly string[];
    forbiddenRecalculations: readonly string[];
    forbiddenShortcuts: readonly string[];
    missingDataRule: string;
    provenanceRule: string;
    temporalRule: string;
    contextRule: string;
  };
  CALCULATION_COMPLETENESS: SynastryAnalysis["calculationCompleteness"];
  DADOS_CALCULADOS: SynastryAnalysis;
  TESTEMUNHOS: {
    interactionPatterns: SynastryAnalysis["interactionPatterns"];
    temperamentBond: SynastryAnalysis["temperamentBond"];
    sharedGround: SynastryAnalysis["sharedGround"];
    sunMoonBridges: SynastryAnalysis["sunMoonBridges"];
    contacts: SynastryAnalysis["contacts"];
    receptions: SynastryAnalysis["receptions"];
    mutualReceptions: SynastryAnalysis["mutualReceptions"];
    roleResonance: SynastryAnalysis["roleResonance"];
    antiscia: SynastryAnalysis["antiscia"];
  };
  SINTESE_MECANICA: SynastryAnalysis["synthesis"];
  INCERTEZAS_E_CONFLITOS: {
    unresolvedTechnicalQuestions: SynastryAnalysis["unresolvedTechnicalQuestions"];
    cautions: SynastryAnalysis["cautions"];
    sourceNotes: SynastryAnalysis["sourceNotes"];
  };
  CONTEXTO_NECESSARIO: {
    interactionContext: SynastryAnalysis["interactionContext"];
    userContext: SynastryAnalysis["userContext"];
    personA: { label: string };
    personB: { label: string };
  };
}

/**
 * Pacote determinístico para uma IA interpretadora. A IA recebe evidência já
 * materializada e não deve refazer astronomia, casas, aspectos, recepções,
 * antíscios, dignidades ou qualquer outra mecânica astrológica.
 */
export function buildSynastryAIEvaluationPacket(analysis: SynastryAnalysis): SynastryAIEvaluationPacket {
  return {
    schema: "MathAstro.SynastryAIEvidence.v4",
    purpose: "Permitir interpretação por IA sem delegar à IA nenhum cálculo astrológico mecânico e com auditoria explícita de completude/proveniência.",
    contract: {
      interpretationOrder: [
        "CALCULATION_COMPLETENESS",
        "DADOS_CALCULADOS",
        "fundações natais + temperamento (uma qualidade comum + uma diferente como faixa preferencial) + terreno comum",
        "padrões natais dos papéis A e B, incluindo regente I + Lua",
        "comparação dos padrões",
        "contatos cruzados e sua proveniência",
        "recepções cruzadas separadas dos contatos",
        "ressonâncias pessoa real ↔ papel natal, incluindo Lua secundária",
        "antíscios subordinados",
        "SINTESE_MECANICA",
        "INCERTEZAS_E_CONFLITOS",
        "CONTEXTO_NECESSARIO",
      ],
      forbiddenRecalculations: [
        "longitude",
        "ASC_MC",
        "timezone",
        "houseGeometry",
        "aspect",
        "applicationSeparation",
        "reception",
        "antiscion",
        "essentialDignity",
        "accidentalDignity",
        "solarCondition",
        "fixedStarContact",
        "arabicLot",
        "derivedHouseArithmetic",
        "temperament",
        "lordOfNativity",
      ],
      forbiddenShortcuts: [
        "compatibilityScore",
        "percentual de compatibilidade",
        "signo solar como compatibilidade",
        "aspecto bom/ruim por automatismo",
        "recepção tratada como aspecto",
        "aplicação/separação entre dois nascimentos",
        "I–VII universalizado para toda espécie de vínculo",
        "começar a interpretação pelos contatos antes dos padrões natais",
        "inventar regra de Gugu não recuperada no corpus",
      ],
      missingDataRule: "Qualquer item listado em CALCULATION_COMPLETENESS.missing ou campo não materializado deve ser tratado como MISSING_ENGINE_DATA; a IA não pode completar por cálculo próprio.",
      provenanceRule: "Respeitar sourceStatus e sourceBasis. source-locked tem precedência; derived-from-source e example-derived devem ser verbalizados com o grau de certeza correspondente. O teto uniforme de 5° para planeta→qualquer cúspide é derived-from-source, não citação literal universal de Frawley.",
      temporalRule: "Sinastria estática não autoriza inferir encontro, início, duração ou término sem técnica temporal separada.",
      contextRule: "userContext serve para orientar a interpretação da evidência calculada; nunca altera retroativamente casas, significadores ou cálculos.",
    },
    CALCULATION_COMPLETENESS: analysis.calculationCompleteness,
    DADOS_CALCULADOS: analysis,
    TESTEMUNHOS: {
      interactionPatterns: analysis.interactionPatterns,
      temperamentBond: analysis.temperamentBond,
      sharedGround: analysis.sharedGround,
      sunMoonBridges: analysis.sunMoonBridges,
      contacts: analysis.contacts,
      receptions: analysis.receptions,
      mutualReceptions: analysis.mutualReceptions,
      roleResonance: analysis.roleResonance,
      antiscia: analysis.antiscia,
    },
    SINTESE_MECANICA: analysis.synthesis,
    INCERTEZAS_E_CONFLITOS: {
      unresolvedTechnicalQuestions: analysis.unresolvedTechnicalQuestions,
      cautions: analysis.cautions,
      sourceNotes: analysis.sourceNotes,
    },
    CONTEXTO_NECESSARIO: {
      interactionContext: analysis.interactionContext,
      userContext: analysis.userContext,
      personA: { label: analysis.foundations.A.label },
      personB: { label: analysis.foundations.B.label },
    },
  };
}
