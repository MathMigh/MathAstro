import type { JyotishContext } from "./types";
import { createDatum, createSection, createTable, createValidation } from "./engineHelpers";
import type { EngineResult, JyotishModuleKey } from "./types";
import type { CharaKarakaEntry, VargaChart, VedicSnapshot } from "../vedic";
import {
  buildAshtaKootaFactors,
  buildKujaAssessments,
  buildSupplementalVivahaFactors,
} from "./vivahaRules";
import { calculateArudhaSet } from "./arudhaUtils";

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
] as const;

const SIGN_LORDS = [
  { key: "mars", label: "Mangala" },
  { key: "venus", label: "Shukra" },
  { key: "mercury", label: "Budha" },
  { key: "moon", label: "Chandra" },
  { key: "sun", label: "Surya" },
  { key: "mercury", label: "Budha" },
  { key: "venus", label: "Shukra" },
  { key: "mars", label: "Mangala" },
  { key: "jupiter", label: "Guru" },
  { key: "saturn", label: "Shani" },
  { key: "saturn", label: "Shani" },
  { key: "jupiter", label: "Guru" },
] as const;

function getPlanet(snapshot: VedicSnapshot, key: string) {
  return snapshot.planets.find((point) => point.key === key);
}

function getKaraka(snapshot: VedicSnapshot, role: CharaKarakaEntry["role"]) {
  return snapshot.charaKarakas.find((item) => item.role === role);
}

function getVarga(snapshot: VedicSnapshot, key: string): VargaChart | undefined {
  return snapshot.vargas.find((item) => item.key === key);
}

function getChartPoints(snapshot: VedicSnapshot, chartKey: "D1" | "D9") {
  if (chartKey === "D1") {
    return [snapshot.ascendant, ...snapshot.planets];
  }

  return getVarga(snapshot, chartKey)?.points ?? [];
}

function relationTone(fromSign: number, toSign: number) {
  const distance = ((toSign - fromSign) % 12 + 12) % 12;
  if (distance === 0) {
    return "mesmo-signo";
  }
  if ([1, 5, 9].includes(distance)) {
    return "trinal";
  }
  if ([2, 6, 10].includes(distance)) {
    return "supportive";
  }
  if ([3, 7, 11].includes(distance)) {
    return "charged";
  }
  return "oposicional";
}

function describeTone(fromSign: number, toSign: number) {
  const tone = relationTone(fromSign, toSign);
  if (tone === "mesmo-signo") {
    return "Mesmo signo";
  }
  if (tone === "trinal") {
    return "Trinal";
  }
  if (tone === "supportive") {
    return "Suporte por sextil/quadrante";
  }
  if (tone === "charged") {
    return "Atrito produtivo";
  }
  return "Polar/oposicional";
}

function buildCrossToneLabel(
  left?:
    | {
        signIndex: number;
      }
    | undefined,
  right?:
    | {
        signIndex: number;
      }
    | undefined
) {
  if (!left || !right) {
    return "--";
  }

  return describeTone(left.signIndex, right.signIndex);
}

function buildSeventhHouseProfile(snapshot: VedicSnapshot, chartKey: "D1" | "D9") {
  const points = getChartPoints(snapshot, chartKey);
  const ascendant = points.find((point) => point.key === "ascendant") ?? snapshot.ascendant;
  const seventhSignIndex = (ascendant.signIndex + 6) % 12;
  const seventhLord = SIGN_LORDS[seventhSignIndex];
  const lordPoint = points.find((point) => point.key === seventhLord.key);
  const occupants = points
    .filter((point) => point.key !== "ascendant" && point.signIndex === seventhSignIndex)
    .map((point) => point.name);

  return {
    chartKey,
    ascendantSign: ascendant.signName,
    seventhSignIndex,
    seventhSign: SIGN_NAMES[seventhSignIndex],
    lordLabel: seventhLord.label,
    lordPoint,
    occupants,
  };
}

function buildKarakasRow(snapshot: VedicSnapshot) {
  const darakaraka = getKaraka(snapshot, "Darakaraka");
  const venus = getPlanet(snapshot, "venus");
  const jupiter = getPlanet(snapshot, "jupiter");
  const navamsa = getVarga(snapshot, "D9");
  const navamsaDarakaraka =
    navamsa?.points.find((point) => point.key === darakaraka?.key) ?? undefined;

  return {
    darakaraka:
      darakaraka
        ? `${darakaraka.name} em ${darakaraka.signName} (${darakaraka.house}a casa)`
        : "--",
    venus: venus ? `${venus.signName} (${venus.house}a)` : "--",
    jupiter: jupiter ? `${jupiter.signName} (${jupiter.house}a)` : "--",
    navamsaDarakaraka: navamsaDarakaraka
      ? `${navamsaDarakaraka.signName} (${navamsaDarakaraka.house}a)`
      : "--",
  };
}

function rajjuStateLabel(state: "clear" | "relieved" | "blocked") {
  if (state === "clear") {
    return "Rajju distinto";
  }

  if (state === "relieved") {
    return "Rajju aliviado";
  }

  return "Mesmo Rajju";
}

function vedhaStateLabel(state: "clear" | "relieved" | "blocked") {
  if (state === "clear") {
    return "Sem vedha direto";
  }

  if (state === "relieved") {
    return "Vedha aliviado";
  }

  return "Vedha direto";
}

function severityLabel(level: "low" | "medium" | "high") {
  if (level === "low") {
    return "Leve";
  }

  if (level === "medium") {
    return "Media";
  }

  return "Alta";
}

function vedhaPairTypeLabel(type: "none" | "direct" | "clustered") {
  if (type === "clustered") {
    return "Cluster";
  }

  if (type === "direct") {
    return "Direto";
  }

  return "Sem par";
}

function kujaMutualLabel(state: "full" | "partial" | "none") {
  if (state === "full") {
    return "Reciproco";
  }

  if (state === "partial") {
    return "Parcial";
  }

  return "Nao";
}

function toneSupportValue(label: string) {
  if (label === "Mesmo signo") {
    return 2;
  }

  if (label === "Trinal" || label === "Suporte por sextil/quadrante") {
    return 1;
  }

  if (label === "Atrito produtivo") {
    return 0;
  }

  if (label === "Polar/oposicional") {
    return -1;
  }

  return 0;
}

function buildVivahaOverviewState(
  kootaScore: number,
  kootaMax: number,
  supplementalScore: number,
  supplementalMax: number,
  generalCompatibility: number | undefined,
  relationTones: string[],
  activeAntidotes: number
) {
  const kootaPercent = Math.round((kootaScore / Math.max(kootaMax, 1)) * 100);
  const supplementalPercent = Math.round((supplementalScore / Math.max(supplementalMax, 1)) * 100);
  const toneTotal = relationTones.reduce((sum, tone) => sum + toneSupportValue(tone), 0);
  const rows = [
    {
      criterion: "Ashta Koota",
      state: `${kootaPercent}%`,
      score: kootaPercent >= 75 ? 2 : kootaPercent >= 60 ? 1 : -1,
      note: `Grade base atual em ${kootaScore.toFixed(1)}/${kootaMax}.`,
    },
    {
      criterion: "Matching complementar",
      state: `${supplementalPercent}%`,
      score: supplementalPercent >= 70 ? 2 : supplementalPercent >= 50 ? 1 : -1,
      note: `Camada adicional em ${supplementalScore.toFixed(1)}/${supplementalMax}.`,
    },
    {
      criterion: "Indicador composto",
      state: generalCompatibility === undefined ? "Sem dado" : `${generalCompatibility}%`,
      score:
        generalCompatibility === undefined
          ? 0
          : generalCompatibility >= 70
            ? 1
            : generalCompatibility >= 55
              ? 0
              : -1,
      note:
        generalCompatibility === undefined
          ? "O motor geral nao devolveu percentual composto nesta rodada."
          : "Indicador agregado do motor geral, usado aqui apenas como camada auxiliar.",
    },
    {
      criterion: "Tons relacionais",
      state: relationTones.join(" | "),
      score: toneTotal >= 3 ? 2 : toneTotal >= 0 ? 1 : -1,
      note: "Soma D1, D9, Upapada e Darapada para ver se o vinculo fecha mais em apoio do que em polarizacao.",
    },
    {
      criterion: "Antidotos ativos",
      state: activeAntidotes > 0 ? `${activeAntidotes} ativo(s)` : "Nenhum destaque",
      score: activeAntidotes >= 2 ? 1 : 0,
      note: "Nao substituem os filtros principais, mas aliviam Rajju e Vedha quando presentes.",
    },
  ];
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const state =
    totalScore >= 6
      ? "Compatibilidade sustentada"
      : totalScore >= 3
        ? "Compatibilidade promissora"
        : totalScore >= 0
          ? "Compatibilidade mista"
          : "Compatibilidade delicada";

  return {
    rows,
    totalScore,
    state,
    note: `Score agregado ${totalScore} na malha geral de matching, cruzando Koota, camadas complementares, tom relacional e antidotos ativos.`,
  };
}

function buildKujaOperationalState(kuja: ReturnType<typeof buildKujaAssessments>) {
  const activeMaps = kuja.rows.filter((row) => row.activeTriggers.length > 0).length;
  const highSeverityMaps = kuja.rows.filter((row) => row.severity === "strong").length;
  const mitigationHits = kuja.rows.reduce(
    (sum, row) => sum + row.cancellations.length + row.mitigations.length,
    0
  );
  const rows = [
    {
      criterion: "Carga ativa",
      state: activeMaps === 0 ? "Sem carga remanescente" : `${activeMaps} mapa(s) ativo(s)`,
      score: activeMaps === 0 ? 2 : activeMaps === 1 ? 0 : -1,
      note: "Conta quantos mapas ainda mantem Kuja efetivo apos cancelamentos fortes.",
    },
    {
      criterion: "Simetria",
      state: kuja.symmetry,
      score: kuja.symmetry === "balanced" ? 1 : kuja.symmetry === "partially-balanced" ? 0 : -1,
      note: "Mostra se a carga manglika fica distribuida ou concentrada.",
    },
    {
      criterion: "Cancelamento mutuo",
      state: kuja.mutualCancellation,
      score: kuja.mutualCancellation === "full" ? 1 : kuja.mutualCancellation === "partial" ? 0 : -1,
      note: "Le a reciprocidade da recorrencia manglika entre os dois mapas.",
    },
    {
      criterion: "Cobertura mitigadora",
      state: kuja.mitigationCoverage,
      score: kuja.mitigationCoverage === "high" ? 2 : kuja.mitigationCoverage === "medium" ? 1 : -1,
      note: `${mitigationHits} sinal(is) somados entre cancelamentos fortes e mitigacoes contextuais.`,
    },
    {
      criterion: "Severidade final",
      state: kuja.rows.map((row) => `${row.subject}: ${row.severity}`).join(" | "),
      score: highSeverityMaps === 0 ? 2 : highSeverityMaps === 1 ? 0 : -2,
      note: "Usa a severidade final por mapa, ja depois de cruzar excecoes e reducoes.",
    },
  ];
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const state =
    totalScore >= 4
      ? "Kuja acomodado"
      : totalScore >= 1
        ? "Kuja administravel"
        : totalScore >= -1
          ? "Kuja sensivel"
          : "Kuja tenso";

  return {
    rows,
    totalScore,
    state,
    note: `Score ${totalScore} no overlay manglik, cruzando carga ativa, simetria, cancelamento mutuo, cobertura mitigadora e severidade final.`,
  };
}

function buildAdvancedVivahaState(
  rows: Array<{
    criterion: string;
    first: string;
    second: string;
    note: string;
  }>
) {
  const normalizedRows = rows.map((row) => {
    const pairScore = toneSupportValue(row.first) + toneSupportValue(row.second);
    return {
      ...row,
      pairScore,
      state: pairScore >= 2 ? "Fechada" : pairScore >= 0 ? "Parcial" : "Tensa",
    };
  });
  const totalScore = normalizedRows.reduce((sum, row) => sum + row.pairScore, 0);
  const state =
    totalScore >= 4
      ? "Ponte avancada forte"
      : totalScore >= 1
        ? "Ponte avancada util"
        : totalScore >= -1
          ? "Ponte avancada mista"
          : "Ponte avancada delicada";

  return {
    rows: normalizedRows,
    totalScore,
    state,
    note: `Score ${totalScore} na ponte avancada D1-D9, cruzando DK, Upapada e Darapada dos dois lados.`,
  };
}

function buildVivahaStructuralState(
  supplementalScore: number,
  supplementalMax: number,
  rajju: { state: "clear" | "relieved" | "blocked"; severity: "low" | "medium" | "high"; note: string },
  vedha: { state: "clear" | "relieved" | "blocked"; severity: "low" | "medium" | "high"; note: string },
  tones: { d1: string; d9: string; upapada: string; darapada: string },
  activeAntidotes: number
) {
  const supplementalPercent = Math.round((supplementalScore / Math.max(supplementalMax, 1)) * 100);
  const rows = [
    {
      criterion: "Matching complementar",
      state: `${supplementalPercent}%`,
      score: supplementalPercent >= 70 ? 2 : supplementalPercent >= 50 ? 1 : -1,
      note: `Camada adicional em ${supplementalScore.toFixed(1)}/${supplementalMax}.`,
    },
    {
      criterion: "Rajju",
      state: rajjuStateLabel(rajju.state),
      score: rajju.state === "clear" ? 2 : rajju.state === "relieved" ? 1 : -2,
      note: `${severityLabel(rajju.severity)}. ${rajju.note}`,
    },
    {
      criterion: "Vedha",
      state: vedhaStateLabel(vedha.state),
      score: vedha.state === "clear" ? 2 : vedha.state === "relieved" ? 1 : -2,
      note: `${severityLabel(vedha.severity)}. ${vedha.note}`,
    },
    {
      criterion: "Eixos D1-D9",
      state: `${tones.d1} | ${tones.d9}`,
      score: toneSupportValue(tones.d1) + toneSupportValue(tones.d9),
      note: "Cruza os tons das 7as casas no D1 e no D9 antes de entrar nos arudhas relacionais.",
    },
    {
      criterion: "Arudhas relacionais",
      state: `${tones.upapada} | ${tones.darapada}`,
      score: toneSupportValue(tones.upapada) + toneSupportValue(tones.darapada),
      note: "Compara Upapada e Darapada dos dois mapas como imagem conjugal e espelho de parceria.",
    },
    {
      criterion: "Antidotos ativos",
      state: activeAntidotes > 0 ? `${activeAntidotes} ativo(s)` : "Nenhum destaque",
      score: activeAntidotes >= 2 ? 1 : 0,
      note: "Nao apagam os filtros principais, mas aliviam bloqueios quando reaparecem de forma coerente.",
    },
  ];
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const state =
    totalScore >= 6
      ? "Base estrutural forte"
      : totalScore >= 2
        ? "Base estrutural util"
        : totalScore >= -1
          ? "Base estrutural mista"
          : "Base estrutural delicada";

  return {
    rows,
    totalScore,
    state,
    note: `Score ${totalScore} na malha estrutural, cruzando matching complementar, Rajju, Vedha, eixos D1-D9, arudhas relacionais e antidotos ativos.`,
  };
}

export function vivahaEngine(
  module: JyotishModuleKey,
  context: JyotishContext
): EngineResult {
  if (!context.partner) {
    return {
      sections: [
        createSection({
          id: `${module}-vivaha-empty`,
          title: "Vivaha Jyotish",
          description: "O modulo precisa de dois mapas para abrir matching tecnico.",
          status: "implemented",
          items: [
            createDatum(module, "Compatibilidade", "Estado", "Aguardando segundo mapa", {
              technicalNotes:
                "Sem o segundo mapa, o modulo nao pode avaliar 7a casa, Upapada, Ashta Koota e matching.",
              confidence: 0.2,
              status: "implemented",
            }),
          ],
        }),
      ],
      validations: [
        createValidation("error", "Vivaha sem os dois mapas; preencha Pessoa A e Pessoa B.", "partner", "dual-chart-required"),
      ],
    };
  }

  const primaryMoon = context.primary.planets.find((point) => point.key === "moon") ?? context.primary.ascendant;
  const partnerMoon = context.partner.planets.find((point) => point.key === "moon") ?? context.partner.ascendant;
  const primaryLabel = context.primary.name === context.partner.name ? "Pessoa A" : context.primary.name;
  const partnerLabel = context.primary.name === context.partner.name ? "Pessoa B" : context.partner.name;
  const ashtaKoota = buildAshtaKootaFactors(primaryMoon, partnerMoon, context.config.ashtaKootaMode);
  const kootaScore = ashtaKoota.reduce((sum, factor) => sum + factor.score, 0);
  const kootaMax = ashtaKoota.reduce((sum, factor) => sum + factor.max, 0);
  const supplemental = buildSupplementalVivahaFactors(
    primaryLabel,
    context.primary,
    partnerLabel,
    context.partner,
    ashtaKoota
  );
  const supplementalFactors = supplemental.factors;
  const mahendra = supplemental.mahendra;
  const striDeergha = supplemental.striDeergha;
  const rajju = supplemental.rajju;
  const vedha = supplemental.vedha;
  const kuja = buildKujaAssessments(
    primaryLabel,
    context.primary,
    partnerLabel,
    context.partner,
    context.config.kujaDoshaRules
  );
  const primaryD1 = buildSeventhHouseProfile(context.primary, "D1");
  const partnerD1 = buildSeventhHouseProfile(context.partner, "D1");
  const primaryD9 = buildSeventhHouseProfile(context.primary, "D9");
  const partnerD9 = buildSeventhHouseProfile(context.partner, "D9");
  const primaryArudhas = calculateArudhaSet(context.primary);
  const partnerArudhas = calculateArudhaSet(context.partner);
  const primaryUpapada = primaryArudhas.find((entry) => entry.houseNumber === 12);
  const partnerUpapada = partnerArudhas.find((entry) => entry.houseNumber === 12);
  const primaryDarapada = primaryArudhas.find((entry) => entry.houseNumber === 7);
  const partnerDarapada = partnerArudhas.find((entry) => entry.houseNumber === 7);
  const primaryKarakas = buildKarakasRow(context.primary);
  const partnerKarakas = buildKarakasRow(context.partner);
  const primaryNavamsa = getVarga(context.primary, "D9");
  const partnerNavamsa = getVarga(context.partner, "D9");
  const primaryDarakaraka = getKaraka(context.primary, "Darakaraka");
  const partnerDarakaraka = getKaraka(context.partner, "Darakaraka");
  const primaryDarakarakaD9Point =
    primaryNavamsa?.points.find((point) => point.key === primaryDarakaraka?.key) ?? undefined;
  const partnerDarakarakaD9Point =
    partnerNavamsa?.points.find((point) => point.key === partnerDarakaraka?.key) ?? undefined;
  const primaryVenus = getPlanet(context.primary, "venus");
  const partnerVenus = getPlanet(context.partner, "venus");
  const d1Tone = describeTone(primaryD1.seventhSignIndex, partnerD1.seventhSignIndex);
  const d9Tone = describeTone(primaryD9.seventhSignIndex, partnerD9.seventhSignIndex);
  const upapadaTone =
    primaryUpapada && partnerUpapada
      ? describeTone(primaryUpapada.signIndex, partnerUpapada.signIndex)
      : "--";
  const darapadaTone =
    primaryDarapada && partnerDarapada
      ? describeTone(primaryDarapada.signIndex, partnerDarapada.signIndex)
      : "--";
  const supplementalScore = supplementalFactors.reduce((sum, factor) => sum + factor.score, 0);
  const supplementalMax = supplementalFactors.reduce((sum, factor) => sum + factor.max, 0);
  const generalCompatibility = context.compatibility?.percentage;
  const primaryDkToPartnerD9 = buildCrossToneLabel(primaryDarakarakaD9Point, {
    signIndex: partnerD9.seventhSignIndex,
  });
  const partnerDkToPrimaryD9 = buildCrossToneLabel(partnerDarakarakaD9Point, {
    signIndex: primaryD9.seventhSignIndex,
  });
  const primaryUpapadaToPartnerD9 = buildCrossToneLabel(primaryUpapada, {
    signIndex: partnerD9.seventhSignIndex,
  });
  const partnerUpapadaToPrimaryD9 = buildCrossToneLabel(partnerUpapada, {
    signIndex: primaryD9.seventhSignIndex,
  });
  const primaryDarapadaToPartnerDk = buildCrossToneLabel(primaryDarapada, partnerDarakarakaD9Point);
  const partnerDarapadaToPrimaryDk = buildCrossToneLabel(partnerDarapada, primaryDarakarakaD9Point);
  const activeAntidotes = Array.from(new Set([...rajju.antidoteNotes, ...vedha.antidoteNotes]));
  const overviewState = buildVivahaOverviewState(
    kootaScore,
    kootaMax,
    supplementalScore,
    supplementalMax,
    generalCompatibility,
    [d1Tone, d9Tone, upapadaTone, darapadaTone],
    activeAntidotes.length
  );
  const kujaState = buildKujaOperationalState(kuja);
  const structuralState = buildVivahaStructuralState(
    supplementalScore,
    supplementalMax,
    rajju,
    vedha,
    { d1: d1Tone, d9: d9Tone, upapada: upapadaTone, darapada: darapadaTone },
    activeAntidotes.length
  );
  const advancedState = buildAdvancedVivahaState([
    {
      criterion: "Darakaraka D9 -> 7a D9",
      first: primaryDkToPartnerD9,
      second: partnerDkToPrimaryD9,
      note: "Cruza o DK refinado de cada mapa com a 7a D9 do outro.",
    },
    {
      criterion: "Upapada -> 7a D9",
      first: primaryUpapadaToPartnerD9,
      second: partnerUpapadaToPrimaryD9,
      note: "Mede a imagem conjugal do D1 contra o eixo conjugal fino do D9 do outro mapa.",
    },
    {
      criterion: "Darapada -> Darakaraka D9",
      first: primaryDarapadaToPartnerDk,
      second: partnerDarapadaToPrimaryDk,
      note: "Compara a projecao relacional do D1 com o DK refinado da outra pessoa.",
    },
  ]);
  const vivahaResidualRows = [
    {
      criterion: "Rajju/Vedha por escola",
      state:
        rajju.state === "blocked" || vedha.state === "blocked"
          ? "Pede override escolar"
          : rajju.state === "relieved" || vedha.state === "relieved"
            ? "Alivio escolar parcial"
            : "Base resolvida",
      note:
        "A malha base ja abre trilha, pada, severidade e antidotos, mas os overrides mais estritos por escola ainda ficam fora deste working set.",
    },
    {
      criterion: "Kuja por tradicao",
      state: "Camada geral implementada",
      note:
        "O motor ja fecha simetria, cancelamentos fortes e mitigacoes, mas ainda nao expande grades regionais completas de Kuja por tradicao local.",
    },
    {
      criterion: "Ponte D1-D9 fina",
      state:
        primaryDarakarakaD9Point && partnerDarakarakaD9Point && primaryUpapada && partnerUpapada
          ? "Base cruzada presente"
          : "Depende de ponto ausente",
      note:
        "DK D9, Upapada, Darapada e 7a D9 ja entram no motor; faltam apenas variantes escolares mais finas de prioridade e excecao.",
    },
    {
      criterion: "Residual explicito",
      state: "Mapeado",
      note:
        "O residual restante agora esta catalogado no proprio relatorio para evitar que ausencia de escola completa pareca falha silenciosa do matching.",
    },
  ];
  const vivahaResidualState = `${vivahaResidualRows.filter((row) => row.state !== "Base resolvida" && row.state !== "Mapeado").length} frente(s) ainda abertas`;

  return {
    sections: [
      createSection({
        id: `${module}-vivaha-overview`,
        title: "Vivaha Jyotish",
        description:
          "Compatibilidade vedica tecnica baseada em Ashta Koota, sinais manglikos, Lua, Lagna e fatores ja disponiveis no motor atual.",
        status: "implemented",
        items: [
          createDatum(module, "Compatibilidade", "Ashta Koota", kootaScore.toFixed(1), {
            unit: `/ ${kootaMax}`,
            technicalNotes:
              `Grade base v1 do motor atual em modo ${context.config.ashtaKootaMode}. As matrizes continuam configuraveis por escola e podem ser refinadas sem quebrar a arquitetura.`,
            confidence: 0.72,
            status: "implemented",
          }),
          createDatum(module, "Compatibilidade", "Percentual do koota", Math.round((kootaScore / kootaMax) * 100), {
            unit: "%",
            technicalNotes: "Percentual derivado da grade de 36 pontos ativa nesta versao.",
            confidence: 0.72,
            status: "implemented",
          }),
          createDatum(
            module,
            "Compatibilidade",
            "Compatibilidade geral do motor",
            generalCompatibility ?? "--",
            {
              unit: generalCompatibility === undefined ? undefined : "%",
              technicalNotes:
                "Indicador composto do motor geral, mantido ao lado do Koota para comparacao, nao como sentenca final.",
              confidence: generalCompatibility === undefined ? 0.2 : 0.68,
              status: generalCompatibility === undefined ? "placeholder" : "implemented",
            }
          ),
          createDatum(module, "Compatibilidade", "Faixa geral de matching", overviewState.state, {
            technicalNotes: overviewState.note,
            confidence: 0.74,
            status: "implemented",
            methodUsed: "working-set-vivaha-overview-scorecard-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-ashta-koota`,
            "Ashta Koota",
            ["Fator", "Score", "Max", "Nota tecnica"],
            ashtaKoota.map((factor) => [
              factor.label,
              factor.score.toFixed(1),
              factor.max.toString(),
              factor.note,
            ]),
            "Grade classica em oito fatores a partir das Luas. O motor atual mostra explicitamente que as matrizes seguem uma configuracao v1."
          ),
          createTable(
            `${module}-vivaha-overview-scorecard`,
            "Scorecard Geral de Matching",
            ["Filtro", "Estado", "Score", "Nota"],
            overviewState.rows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
            "Painel curto para pesar Koota, camada complementar, indicador composto, tons relacionais e antidotos antes da sintese geral."
          ),
        ],
      }),
      createSection({
        id: `${module}-vivaha-structure`,
        title: "Estrutura Relacional",
        description:
          "Cruza 7a casa, regentes, D9 e karakas relacionais para dar base tecnica ao matching, sem fingir unanimidade escolar.",
        status: "implemented",
        items: [
          createDatum(module, "Vivaha", "Fatores complementares", supplementalScore.toFixed(1), {
            unit: `/ ${supplementalMax}`,
            technicalNotes:
              "Mahendra por direcao, Stri Deergha, Rajju v2 com Aroha/Avaroha e Vedha nakshatra entram como camada complementar ao Ashta Koota.",
            confidence: 0.67,
            status: "implemented",
          }),
          createDatum(module, "Vivaha", "Rajju por escola", rajjuStateLabel(rajju.state), {
            technicalNotes:
              `${rajju.note}${rajju.schoolNotes.length > 0 ? ` Escola: ${rajju.schoolNotes.join(" ")}` : ""}${rajju.reliefNotes.length > 0 ? ` Alivios: ${rajju.reliefNotes.join(" ")}` : ""}`,
            confidence: 0.71,
            status: "implemented",
            methodUsed: "working-set-rajju-aroha-avaroha-v2",
          }),
          createDatum(module, "Vivaha", "Vedha porutham", vedhaStateLabel(vedha.state), {
            technicalNotes:
              `${vedha.note}${vedha.schoolNotes.length > 0 ? ` Escola: ${vedha.schoolNotes.join(" ")}` : ""}${vedha.reliefNotes.length > 0 ? ` Alivios: ${vedha.reliefNotes.join(" ")}` : ""}`,
            confidence: 0.69,
            status: "implemented",
            methodUsed: "working-set-vedha-porutham-v1",
          }),
          createDatum(module, "Vivaha", "Base estrutural do vinculo", structuralState.state, {
            technicalNotes: structuralState.note,
            confidence: 0.72,
            status: "implemented",
            methodUsed: "working-set-vivaha-structural-scorecard-v1",
          }),
          createDatum(
            module,
            "Vivaha",
            "Antidotos classicos ativos",
            activeAntidotes.length > 0 ? activeAntidotes.join(" | ") : "Nenhum destaque forte",
            {
              technicalNotes:
                "Explicita quando Dina/Tara, Graha Maitri, Nadi, Yoni ou rashi-lord entram apenas como alivio parcial em Rajju/Vedha.",
              confidence: activeAntidotes.length > 0 ? 0.72 : 0.58,
              status: "implemented",
              methodUsed: "working-set-vivaha-antidotes-v1",
            }
          ),
          createDatum(module, "Vivaha", "Tom entre 7as casas D1", d1Tone, {
            technicalNotes:
              "Leitura pela relacao entre os signos da 7a casa de cada mapa no D1.",
            confidence: 0.7,
            status: "implemented",
          }),
          createDatum(module, "Vivaha", "Tom entre 7as casas D9", d9Tone, {
            technicalNotes:
              "Leitura pela relacao entre os signos da 7a casa de cada mapa no D9.",
            confidence: 0.68,
            status: "implemented",
          }),
          createDatum(module, "Vivaha", "Tom entre Upapadas", upapadaTone, {
            technicalNotes:
              "Compara Upapada Lagna (A12) de ambos os mapas como sinal de imagem conjugal e lastro de uniao.",
            confidence: primaryUpapada && partnerUpapada ? 0.68 : 0.25,
            status: primaryUpapada && partnerUpapada ? "implemented" : "placeholder",
          }),
          createDatum(module, "Vivaha", "Tom entre Darapadas", darapadaTone, {
            technicalNotes:
              "Compara A7 de ambos os mapas para leitura de projeção relacional e espelho de parceria.",
            confidence: primaryDarapada && partnerDarapada ? 0.66 : 0.25,
            status: primaryDarapada && partnerDarapada ? "implemented" : "placeholder",
          }),
        ],
        tables: [
          createTable(
            `${module}-supplemental-matching`,
            "Matching complementar",
            ["Fator", "Score", "Max", "Nota tecnica"],
            supplementalFactors.map((factor) => [
              factor.label,
              factor.score.toFixed(1),
              factor.max.toString(),
              factor.note,
            ]),
            "Camadas classicas adicionais que nao substituem o Ashta Koota, mas ajudam a qualificar direcao e sustentacao do vinculo."
          ),
          createTable(
            `${module}-supplemental-details`,
            "Mahendra, Stri Deergha, Rajju e Vedha",
            ["Fator", "Pessoa A", "Pessoa B", "Estado", "Severidade", "Antidotos / escola", "Nota tecnica"],
            [
              [
                "Mahendra",
                primaryMoon.nakshatra,
                partnerMoon.nakshatra,
                mahendra.score === 2 ? "Classico presente" : mahendra.score === 1 ? "Apoio reverso" : "Nao fecha",
                "--",
                `${mahendra.direction}: ${mahendra.count}; ${mahendra.reverseDirection}: ${mahendra.reverseCount}`,
                mahendra.note,
              ],
              [
                "Stri Deergha",
                primaryMoon.nakshatra,
                partnerMoon.nakshatra,
                striDeergha.score === 2 ? "Bom" : striDeergha.score === 1 ? "Mediano" : "Curto",
                "--",
                `${striDeergha.direction}: ${striDeergha.count}`,
                striDeergha.note,
              ],
              [
                "Rajju v2",
                `${primaryMoon.nakshatra} P${rajju.firstPada} / ${rajju.firstTrack} ${rajju.firstGroup}`,
                `${partnerMoon.nakshatra} P${rajju.secondPada} / ${rajju.secondTrack} ${rajju.secondGroup}`,
                rajjuStateLabel(rajju.state),
                severityLabel(rajju.severity),
                [...rajju.schoolNotes, ...rajju.antidoteNotes].join(" | ") || "--",
                rajju.note,
              ],
              [
                "Vedha",
                `${primaryMoon.nakshatra} P${vedha.firstPada}`,
                `${partnerMoon.nakshatra} P${vedha.secondPada}`,
                `${vedhaStateLabel(vedha.state)} (${vedhaPairTypeLabel(vedha.pairType)})`,
                severityLabel(vedha.severity),
                [...vedha.schoolNotes, ...vedha.antidoteNotes].join(" | ") || "Sem alivio necessario",
                vedha.note,
              ],
            ],
            "Camada complementar agora explicita direcao de Mahendra, leitura Rajju por trilha/pada e Vedha com antidotos classicos ja visiveis."
          ),
          createTable(
            `${module}-seventh-houses`,
            "7a casa e regentes",
            ["Mapa", "D1 7a", "Lord D1", "D9 7a", "Lord D9", "Ocupantes"],
            [
              [
                primaryLabel,
                primaryD1.seventhSign,
                primaryD1.lordPoint
                  ? `${primaryD1.lordLabel} em ${primaryD1.lordPoint.signName} (${primaryD1.lordPoint.house}a)`
                  : primaryD1.lordLabel,
                primaryD9.seventhSign,
                primaryD9.lordPoint
                  ? `${primaryD9.lordLabel} em ${primaryD9.lordPoint.signName} (${primaryD9.lordPoint.house}a)`
                  : primaryD9.lordLabel,
                primaryD1.occupants.length > 0 ? primaryD1.occupants.join(", ") : "--",
              ],
              [
                partnerLabel,
                partnerD1.seventhSign,
                partnerD1.lordPoint
                  ? `${partnerD1.lordLabel} em ${partnerD1.lordPoint.signName} (${partnerD1.lordPoint.house}a)`
                  : partnerD1.lordLabel,
                partnerD9.seventhSign,
                partnerD9.lordPoint
                  ? `${partnerD9.lordLabel} em ${partnerD9.lordPoint.signName} (${partnerD9.lordPoint.house}a)`
                  : partnerD9.lordLabel,
                partnerD1.occupants.length > 0 ? partnerD1.occupants.join(", ") : "--",
              ],
            ],
            "Tabela direta para leitura do eixo conjugal no D1 e no Navamsa."
          ),
          createTable(
            `${module}-vivaha-structural-scorecard`,
            "Scorecard Estrutural do Vivaha",
            ["Filtro", "Estado", "Score", "Nota"],
            structuralState.rows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
            "Painel estrutural para pesar matching complementar, Rajju, Vedha, tons D1-D9, arudhas relacionais e antidotos antes da camada mais fina."
          ),
          createTable(
            `${module}-karakas-d9`,
            "Darakaraka, Venus, Jupiter e D9",
            ["Mapa", "Darakaraka", "Venus", "Jupiter", "Darakaraka no D9"],
            [
              [
                primaryLabel,
                primaryKarakas.darakaraka,
                primaryKarakas.venus,
                primaryKarakas.jupiter,
                primaryKarakas.navamsaDarakaraka,
              ],
              [
                partnerLabel,
                partnerKarakas.darakaraka,
                partnerKarakas.venus,
                partnerKarakas.jupiter,
                partnerKarakas.navamsaDarakaraka,
              ],
            ],
            "Resumo relacional objetivo para consulta tecnica rapida."
          ),
          createTable(
            `${module}-upapada-table`,
            "Upapada e Darapada",
            ["Mapa", "Upapada", "Casa", "Darapada", "Casa", "Nota"],
            [
              [
                primaryLabel,
                primaryUpapada?.signName ?? "--",
                primaryUpapada ? `H${primaryUpapada.houseFromLagna}` : "--",
                primaryDarapada?.signName ?? "--",
                primaryDarapada ? `H${primaryDarapada.houseFromLagna}` : "--",
                primaryUpapada?.note ?? "--",
              ],
              [
                partnerLabel,
                partnerUpapada?.signName ?? "--",
                partnerUpapada ? `H${partnerUpapada.houseFromLagna}` : "--",
                partnerDarapada?.signName ?? "--",
                partnerDarapada ? `H${partnerDarapada.houseFromLagna}` : "--",
                partnerUpapada?.note ?? "--",
              ],
            ],
            "A12 (Upapada) e A7 (Darapada) derivados do D1 pelo metodo de Arudha usado no modulo natal."
          ),
        ],
      }),
      createSection({
        id: `${module}-kuja-dosha`,
        title: "Kuja Dosha",
        description:
          "Triagem manglik por Lagna, Lua e Venus, agora com cancelamentos fortes e mitigacoes explicitados por eixo antes da sintese final.",
        status: "implemented",
        items: [
          createDatum(module, "Kuja Dosha", "Leitura combinada", kuja.combinedNote, {
            technicalNotes:
              `A regra ativa segue o perfil ${context.config.kujaDoshaRules} declarado na configuracao do modulo.`,
            confidence: 0.66,
            status: "implemented",
          }),
          createDatum(module, "Kuja Dosha", "Simetria manglika", kuja.symmetry, {
            technicalNotes:
              "Classifica se os dois mapas acionam Kuja em peso parecido, em peso parcialmente equilibrado ou de forma assimetrica.",
            confidence: 0.68,
            status: "implemented",
            methodUsed: "working-set-kuja-symmetry-v1",
          }),
          createDatum(
            module,
            "Kuja Dosha",
            "Eixos acionados em comum",
            kuja.sharedAxes.length > 0 ? kuja.sharedAxes.join(", ") : "Nenhum",
            {
              technicalNotes:
                "Mostra se Lagna, Lua ou Venus seguem ativos nos dois mapas apos a etapa de cancelamentos fortes.",
              confidence: 0.67,
              status: "implemented",
              methodUsed: "working-set-kuja-shared-axes-v1",
            }
          ),
          createDatum(module, "Kuja Dosha", "Cancelamento mutuo", kujaMutualLabel(kuja.mutualCancellation), {
            technicalNotes:
              "Resume o quanto o motor conseguiu aplicar a logica de dupla recorrencia manglika entre os dois mapas, sem apagar o restante do matching.",
            confidence: 0.66,
            status: "implemented",
            methodUsed: "working-set-kuja-mutual-cancellation-v1",
          }),
          createDatum(
            module,
            "Kuja Dosha",
            "Severidade apos cancelamentos",
            kuja.rows.map((row) => `${row.subject}: ${row.severity}`).join(" | "),
            {
              technicalNotes:
                "Leitura final por mapa apos cruzar excecoes fortes, aspectos beneficos e mitigacoes contextuais.",
              confidence: 0.65,
              status: "implemented",
              methodUsed: "working-set-kuja-severity-v1",
            }
          ),
          createDatum(module, "Kuja Dosha", "Cobertura mitigadora", kuja.mitigationCoverage, {
            technicalNotes:
              "Resume quantos cancelamentos fortes e mitigacoes contextuais o motor conseguiu reconhecer nos dois mapas somados.",
            confidence: 0.64,
            status: "implemented",
            methodUsed: "working-set-kuja-mitigation-coverage-v1",
          }),
          createDatum(module, "Kuja Dosha", "Balance mangliko", kujaState.state, {
            technicalNotes: kujaState.note,
            confidence: 0.7,
            status: "implemented",
            methodUsed: "working-set-kuja-scorecard-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-kuja-table`,
            "Triagem manglik",
            [
              "Mapa",
              "Mars do Lagna",
              "Mars da Lua",
              "Mars de Venus",
              "Bruto",
              "Ativo",
              "Cancelados",
              "Severidade",
              "Cancelamentos fortes",
              "Mitigacoes",
            ],
            kuja.rows.map((row) => [
              row.subject,
              row.houses.fromLagna.toString(),
              row.houses.fromMoon.toString(),
              row.houses.fromVenus.toString(),
              row.triggeredFrom.length > 0 ? row.triggeredFrom.join(", ") : "Nao",
              row.activeTriggers.length > 0 ? row.activeTriggers.join(", ") : "--",
              row.cancelledTriggers.length > 0 ? row.cancelledTriggers.join(", ") : "--",
              row.severity,
              row.cancellations.length > 0 ? row.cancellations.join(" | ") : "--",
              row.mitigations.length > 0 ? row.mitigations.join(" | ") : "--",
            ]),
            "Houses contadas em whole-sign a partir de Lagna, Lua e Venus; a coluna Ativo ja sai apos os cancelamentos fortes."
          ),
          createTable(
            `${module}-kuja-balance`,
            "Simetria e Balanceamento de Kuja",
            ["Indicador", "Valor", "Nota tecnica"],
            [
              [
                "Simetria",
                kuja.symmetry,
                "Balanced indica pesos proximos nos dois mapas; partially-balanced indica reciprocidade parcial; asymmetric indica peso concentrado em um lado.",
              ],
              [
                "Eixos em comum",
                kuja.sharedAxes.length > 0 ? kuja.sharedAxes.join(", ") : "--",
                "Ajuda a distinguir simetria por eixo real de simples coincidencia de contagem.",
              ],
              [
                "Cancelamento mutuo",
                kujaMutualLabel(kuja.mutualCancellation),
                "Reciproco indica dupla recorrencia manglika comparavel; parcial indica equilibrio incompleto; nao indica carga concentrada em um lado.",
              ],
              [
                "Cobertura mitigadora",
                kuja.mitigationCoverage,
                "High/medium/low resume a densidade de cancelamentos fortes e redutores operacionais ja reconhecidos pelo motor.",
              ],
            ],
            "Tabela-resumo para leitura rapida da reciprocidade manglika."
          ),
          createTable(
            `${module}-kuja-scorecard`,
            "Scorecard de Kuja Dosha",
            ["Filtro", "Estado", "Score", "Nota"],
            kujaState.rows.map((row) => [row.criterion, row.state, row.score.toString(), row.note]),
            "Overlay curto para separar carga ativa, simetria, cancelamento mutuo, mitigacao e severidade final."
          ),
        ],
      }),
      createSection({
        id: `${module}-vivaha-advanced`,
        title: "Vivaha Avancado",
        description:
          "Cruza Darakaraka em D9, Upapada, Darapada e 7a casa do Navamsa para abrir uma camada relacional mais fina sem esconder o residual escolar que ainda existe.",
        status: "implemented",
        items: [
          createDatum(module, "Vivaha", "Darakaraka D9 -> 7a D9 do par", `${primaryDkToPartnerD9} | ${partnerDkToPrimaryD9}`, {
            technicalNotes:
              "Mostra o tom do Darakaraka refinado em Navamsa de cada pessoa contra a 7a casa D9 da outra, como pista de encaixe afetivo e relacional.",
            confidence: primaryDarakarakaD9Point && partnerDarakarakaD9Point ? 0.68 : 0.3,
            status: primaryDarakarakaD9Point && partnerDarakarakaD9Point ? "implemented" : "placeholder",
            methodUsed: "working-set-vivaha-dk-d9-cross-v1",
          }),
          createDatum(module, "Vivaha", "Upapada -> 7a D9 do par", `${primaryUpapadaToPartnerD9} | ${partnerUpapadaToPrimaryD9}`, {
            technicalNotes:
              "Cruza a imagem conjugal do Upapada com a casa de casamento no Navamsa do outro mapa.",
            confidence: primaryUpapada && partnerUpapada ? 0.66 : 0.3,
            status: primaryUpapada && partnerUpapada ? "implemented" : "placeholder",
            methodUsed: "working-set-vivaha-upapada-d9-cross-v1",
          }),
          createDatum(module, "Vivaha", "Darapada -> Darakaraka D9", `${primaryDarapadaToPartnerDk} | ${partnerDarapadaToPrimaryDk}`, {
            technicalNotes:
              "Compara a projeÃ§Ã£o de parceria no D1 com o Darakaraka refinado do outro mapa no D9.",
            confidence: primaryDarapada && partnerDarakarakaD9Point && partnerDarapada && primaryDarakarakaD9Point ? 0.64 : 0.28,
            status:
              primaryDarapada && partnerDarakarakaD9Point && partnerDarapada && primaryDarakarakaD9Point
                ? "implemented"
                : "placeholder",
            methodUsed: "working-set-vivaha-darapada-dk-cross-v1",
          }),
          createDatum(module, "Vivaha", "Ponte relacional avancada", advancedState.state, {
            technicalNotes: advancedState.note,
            confidence: 0.68,
            status: "implemented",
            methodUsed: "working-set-vivaha-advanced-bridge-v1",
          }),
          createDatum(module, "Vivaha", "Residual escolar", vivahaResidualState, {
            technicalNotes:
              "Rajju/Vedha agora expõem trilha, pada, severidade e antidotos classicos; seguem abertos os overrides mais estritos por escola/pada, malhas escolares completas de Kuja e cruzamentos ainda mais finos de D9/Upapada.",
            confidence: 0.62,
            status: "implemented",
            methodUsed: "residual-escolar-explicito-v2",
          }),
        ],
        tables: [
          createTable(
            `${module}-vivaha-d9-cross`,
            "D9 cruzado, Upapada e Darapada",
            ["Ligacao", "Pessoa A", "Pessoa B", "Tom", "Nota tecnica"],
            [
              [
                "Darakaraka D9 -> 7a D9",
                primaryDarakarakaD9Point
                  ? `${primaryDarakarakaD9Point.signName} (${primaryDarakarakaD9Point.house}a)`
                  : "--",
                partnerD9.seventhSign,
                primaryDkToPartnerD9,
                "Pessoa A: Darakaraka no Navamsa comparado com a 7a D9 da Pessoa B.",
              ],
              [
                "Darakaraka D9 -> 7a D9",
                partnerDarakarakaD9Point
                  ? `${partnerDarakarakaD9Point.signName} (${partnerDarakarakaD9Point.house}a)`
                  : "--",
                primaryD9.seventhSign,
                partnerDkToPrimaryD9,
                "Pessoa B: Darakaraka no Navamsa comparado com a 7a D9 da Pessoa A.",
              ],
              [
                "Upapada -> 7a D9",
                primaryUpapada?.signName ?? "--",
                partnerD9.seventhSign,
                primaryUpapadaToPartnerD9,
                "Pessoa A: Upapada do D1 contra o eixo conjugal D9 da Pessoa B.",
              ],
              [
                "Upapada -> 7a D9",
                partnerUpapada?.signName ?? "--",
                primaryD9.seventhSign,
                partnerUpapadaToPrimaryD9,
                "Pessoa B: Upapada do D1 contra o eixo conjugal D9 da Pessoa A.",
              ],
              [
                "Darapada -> Darakaraka D9",
                primaryDarapada?.signName ?? "--",
                partnerDarakarakaD9Point?.signName ?? "--",
                primaryDarapadaToPartnerDk,
                "Pessoa A: A7 comparado com o Darakaraka refinado da Pessoa B.",
              ],
              [
                "Darapada -> Darakaraka D9",
                partnerDarapada?.signName ?? "--",
                primaryDarakarakaD9Point?.signName ?? "--",
                partnerDarapadaToPrimaryDk,
                "Pessoa B: A7 comparado com o Darakaraka refinado da Pessoa A.",
              ],
            ],
            "Camada cruzada de D1/D9 para sair do matching apenas lunar."
          ),
          createTable(
            `${module}-vivaha-advanced-scorecard`,
            "Scorecard da Ponte Avancada",
            ["Filtro", "Pessoa A", "Pessoa B", "Estado", "Score", "Nota"],
            advancedState.rows.map((row) => [
              row.criterion,
              row.first,
              row.second,
              row.state,
              row.pairScore.toString(),
              row.note,
            ]),
            "Pesa as pontes cruzadas entre D1, D9, Upapada e Darapada para mostrar se a camada avancada fecha, ajuda ou tensiona o matching."
          ),
          createTable(
            `${module}-vivaha-residuals`,
            "Mapa do Residual Escolar",
            ["Frente", "Estado", "Nota"],
            vivahaResidualRows.map((row) => [row.criterion, row.state, row.note]),
            "Inventario explicito do que ainda depende de escola mais estrita, para separar limite de tradicao de lacuna estrutural do motor."
          ),
          createTable(
            `${module}-vivaha-reference-points`,
            "Pontos de referencia relacionais",
            ["Mapa", "Darakaraka D9", "Venus natal", "Upapada", "Darapada", "7a D9"],
            [
              [
                primaryLabel,
                primaryDarakarakaD9Point
                  ? `${primaryDarakarakaD9Point.signName} (${primaryDarakarakaD9Point.house}a)`
                  : "--",
                primaryVenus ? `${primaryVenus.signName} (${primaryVenus.house}a)` : "--",
                primaryUpapada?.signName ?? "--",
                primaryDarapada?.signName ?? "--",
                primaryD9.seventhSign,
              ],
              [
                partnerLabel,
                partnerDarakarakaD9Point
                  ? `${partnerDarakarakaD9Point.signName} (${partnerDarakarakaD9Point.house}a)`
                  : "--",
                partnerVenus ? `${partnerVenus.signName} (${partnerVenus.house}a)` : "--",
                partnerUpapada?.signName ?? "--",
                partnerDarapada?.signName ?? "--",
                partnerD9.seventhSign,
              ],
            ],
            "Resumo curto dos pontos usados na camada avancada do matching."
          ),
        ],
      }),
    ],
    summary: [
      `Ashta Koota atual em ${kootaScore.toFixed(1)}/${kootaMax}.`,
      `${overviewState.state} no matching geral, com score ${overviewState.totalScore}.`,
      `Matching complementar em ${supplementalScore.toFixed(1)}/${supplementalMax}, com Rajju ${rajjuStateLabel(rajju.state)} (${severityLabel(rajju.severity)}), Vedha ${vedhaStateLabel(vedha.state)} (${severityLabel(vedha.severity)}), D1 ${d1Tone}, D9 ${d9Tone}, Upapada ${upapadaTone} e ${activeAntidotes.length} antidotos classicos ativos.`,
      `${structuralState.state} na malha estrutural, com score ${structuralState.totalScore}.`,
      `${kujaState.state} no overlay de Kuja. Eixos em comum: ${kuja.sharedAxes.length > 0 ? kuja.sharedAxes.join(", ") : "nenhum"}.`,
      `${advancedState.state} na ponte avancada D1-D9; residual escolar em ${vivahaResidualState}.`,
    ],
  };
}
