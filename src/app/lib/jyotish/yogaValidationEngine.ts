import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";
import {
  buildYogaDiagnostics,
  formatYogaPointHouses,
  formatYogaPointNames,
  formatYogaPointSigns,
} from "./yogaCatalog";

const SIGN_LORD_KEYS = [
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
] as const;

const STRONG_TAGS = new Set(["Exaltado", "Domicilio", "Amigavel"]);
const WEAK_TAGS = new Set(["Debilitado", "Inimigo", "Combusto"]);

const DashaLordToPointKey: Record<string, string> = {
  Sun: "sun",
  Moon: "moon",
  Mars: "mars",
  Mercury: "mercury",
  Jupiter: "jupiter",
  Venus: "venus",
  Saturn: "saturn",
  Rahu: "northNode",
  Ketu: "southNode",
  Chandra: "moon",
  Surya: "sun",
  Mangala: "mars",
  Budha: "mercury",
  Guru: "jupiter",
  Shukra: "venus",
  Shani: "saturn",
};

function getHouseLordKey(snapshot: VedicSnapshot, house: number) {
  const signIndex = (snapshot.ascendant.signIndex + house - 1) % 12;
  return SIGN_LORD_KEYS[signIndex];
}

function average(numbers: number[]) {
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

function uniqueKeys(keys: string[]) {
  return Array.from(new Set(keys));
}

function getConjunctionKeys(snapshot: VedicSnapshot) {
  const grouped = new Map<number, string[]>();

  snapshot.planets.forEach((point) => {
    if (point.key === "northNode" || point.key === "southNode") {
      return;
    }

    grouped.set(point.signIndex, [...(grouped.get(point.signIndex) ?? []), point.key]);
  });

  return uniqueKeys(
    Array.from(grouped.values())
      .filter((keys) => keys.length >= 2)
      .flat()
  );
}

function involvedPlanetKeys(snapshot: VedicSnapshot, yogaName: string) {
  const moon = snapshot.planets.find((point) => point.key === "moon");
  const sun = snapshot.planets.find((point) => point.key === "sun");
  const secondLord = getHouseLordKey(snapshot, 2);
  const fourthLord = getHouseLordKey(snapshot, 4);
  const ninthLord = getHouseLordKey(snapshot, 9);
  const tenthLord = getHouseLordKey(snapshot, 10);
  const lagnaLord = getHouseLordKey(snapshot, 1);

  if (yogaName.startsWith("Gaja Kesari")) {
    return ["moon", "jupiter"];
  }

  if (yogaName.startsWith("Budha Aditya")) {
    return ["sun", "mercury"];
  }

  if (yogaName.startsWith("Raja Yoga")) {
    return uniqueKeys([ninthLord, tenthLord]);
  }

  if (yogaName.startsWith("Parijata")) {
    return [lagnaLord];
  }

  if (yogaName.startsWith("Kedara")) {
    return snapshot.planets
      .filter((point) => !["northNode", "southNode"].includes(point.key))
      .map((point) => point.key);
  }

  if (yogaName.startsWith("Dwigraha")) {
    return getConjunctionKeys(snapshot);
  }

  if (yogaName.startsWith("Sunabha")) {
    const secondFromMoon = moon ? (moon.signIndex + 1) % 12 : -1;
    return uniqueKeys([
      "moon",
      ...snapshot.planets
        .filter((point) => point.key !== "sun" && point.signIndex === secondFromMoon)
        .map((point) => point.key),
    ]);
  }

  if (yogaName.startsWith("Anapha")) {
    const twelfthFromMoon = moon ? (moon.signIndex + 11) % 12 : -1;
    return uniqueKeys([
      "moon",
      ...snapshot.planets
        .filter((point) => point.key !== "sun" && point.signIndex === twelfthFromMoon)
        .map((point) => point.key),
    ]);
  }

  if (yogaName.startsWith("Durudhara")) {
    const secondFromMoon = moon ? (moon.signIndex + 1) % 12 : -1;
    const twelfthFromMoon = moon ? (moon.signIndex + 11) % 12 : -1;
    return uniqueKeys([
      "moon",
      ...snapshot.planets
        .filter(
          (point) =>
            point.key !== "sun" &&
            (point.signIndex === secondFromMoon || point.signIndex === twelfthFromMoon)
        )
        .map((point) => point.key),
    ]);
  }

  if (yogaName.startsWith("Swa-Veeryaddhana")) {
    return [secondLord];
  }

  if (yogaName.startsWith("Sumukha")) {
    return [secondLord, "jupiter", "venus", "mercury", "moon"];
  }

  if (yogaName.startsWith("Mathrumooladhana")) {
    return uniqueKeys([secondLord, fourthLord]);
  }

  if (yogaName.startsWith("Matru Sneha")) {
    return uniqueKeys([lagnaLord, fourthLord]);
  }

  if (yogaName.startsWith("Subha-Vasi")) {
    const twelfthFromSun = sun ? (sun.signIndex + 11) % 12 : -1;
    return uniqueKeys([
      "sun",
      ...snapshot.planets
        .filter(
          (point) =>
            point.signIndex === twelfthFromSun &&
            ["moon", "mercury", "jupiter", "venus"].includes(point.key)
        )
        .map((point) => point.key),
    ]);
  }

  return [];
}

function findPointByKey(points: VedicPoint[], key: string) {
  return points.find((point) => point.key === key);
}

function evaluateD9(points: VedicPoint[]) {
  if (!points.length) {
    return {
      label: "Sem leitura D9",
      status: "Sem base suficiente no Navamsha.",
      strongCount: 0,
      weakCount: 0,
    };
  }

  const strongCount = points.filter((point) => point.tags.some((tag) => STRONG_TAGS.has(tag))).length;
  const weakCount = points.filter((point) => point.tags.some((tag) => WEAK_TAGS.has(tag))).length;

  if (strongCount > weakCount) {
    return {
      label: "Confirmado",
      status: `${strongCount} apoios tecnicos e ${weakCount} contradicoes no D9.`,
      strongCount,
      weakCount,
    };
  }

  if (weakCount > strongCount) {
    return {
      label: "Contradito",
      status: `${weakCount} sinais de tensao no D9 superam os apoios.`,
      strongCount,
      weakCount,
    };
  }

  return {
    label: "Neutro",
    status: "D9 sem desempate tecnico forte para este yoga.",
    strongCount,
    weakCount,
  };
}

function formatStrength(rupas: number) {
  if (rupas >= 6.5) {
    return "Forte";
  }

  if (rupas >= 5) {
    return "Sustentado";
  }

  if (rupas >= 4) {
    return "Moderado";
  }

  return "Fraco";
}

function buildActivationLabel(snapshot: VedicSnapshot, involvedKeys: string[]) {
  const activeMaha = snapshot.dashas.find((period) => period.active);
  const activeAntar = snapshot.antardashas.find((period) => period.active);
  const activeKeys = uniqueKeys(
    [activeMaha?.lord, activeAntar?.lord]
      .map((lord) => (lord ? DashaLordToPointKey[lord] : undefined))
      .filter(Boolean) as string[]
  );

  const activatedBy = activeKeys.filter((key) => involvedKeys.includes(key));
  if (activatedBy.length) {
    return {
      label: "Ativo agora",
      note: `O periodo atual toca ${activatedBy.join(", ")} pelo menos em Mahadasha ou Antardasha.`,
    };
  }

  return {
    label: "Nao ativado",
    note: "O recorte atual de dasha nao bate diretamente nos grahas-chave deste yoga.",
  };
}

export function yogaValidationEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const diagnostics = buildYogaDiagnostics(snapshot);
  const navamsa = snapshot.vargas.find((chart) => chart.key === "D9");
  const yogaRows = diagnostics.map((diagnostic) => {
    const yogaName = diagnostic.name;
    const involvedKeys = diagnostic.involvedKeys.length
      ? uniqueKeys(diagnostic.involvedKeys)
      : uniqueKeys(involvedPlanetKeys(snapshot, yogaName));
    const shadbalaValues = involvedKeys
      .map((key) => snapshot.shadbala.find((item) => item.key === key))
      .filter(Boolean);
    const averageRupas = average(shadbalaValues.map((item) => item!.rupas));
    const strengthLabel = formatStrength(averageRupas);
    const d9Points = involvedKeys
      .map((key) => (navamsa ? findPointByKey(navamsa.points, key) : undefined))
      .filter(Boolean) as VedicPoint[];
    const d9Assessment = evaluateD9(d9Points);
    const activation = buildActivationLabel(snapshot, involvedKeys);
    const modification =
      d9Assessment.label === "Contradito" && averageRupas < 5
        ? "Modificado por suporte fraco e D9 tenso"
        : d9Assessment.label === "Contradito"
          ? "Pede revisao por contradicao no D9"
          : "Sem bhanga automatica detectada";

    return {
      yogaName,
      family: diagnostic.family,
      rule: diagnostic.rule,
      area: diagnostic.area,
      detail: diagnostic.detail,
      cancellation: diagnostic.cancellation ?? "Sem bhanga automatica marcada no working set atual.",
      averageRupas,
      strengthLabel,
      d9Assessment,
      activation,
      modification,
      involvedKeys,
    };
  });

  const confirmedCount = yogaRows.filter((row) => row.d9Assessment.label === "Confirmado").length;
  const activatedCount = yogaRows.filter((row) => row.activation.label === "Ativo agora").length;
  const contradictedCount = yogaRows.filter((row) => row.d9Assessment.label === "Contradito").length;

  return {
    sections: [
      createSection({
        id: `${module}-yoga-validation`,
        title: "Validacao dos Yogas",
        description:
          "Cruza yogas detectados com Shadbala, Navamsha e periodo ativo para diferenciar presenca, suporte, contradicao e ativacao temporal.",
        status: "implemented",
        items: yogaRows.length
          ? [
              createDatum(module, "Yoga", "Yogas presentes", yogaRows.length, {
                technicalNotes: "Quantidade de yogas natalmente detectados no recorte atual do motor.",
                confidence: 0.82,
                status: "implemented",
              }),
              createDatum(module, "Yoga", "Confirmados por D9", confirmedCount, {
                technicalNotes: "Yoga confirmado quando os grahas-chave recebem mais suporte do que contradicao no Navamsha.",
                confidence: 0.72,
                status: "implemented",
              }),
              createDatum(module, "Yoga", "Ativados pela dasha atual", activatedCount, {
                technicalNotes: "Ativacao marcada quando Mahadasha ou Antardasha toca um dos grahas-chave do yoga.",
                confidence: 0.76,
                status: "implemented",
              }),
              createDatum(module, "Yoga", "Contraditos no D9", contradictedCount, {
                technicalNotes: "Contradicao aparece quando os grahas-chave recebem mais tensao do que apoio no Navamsha.",
                confidence: 0.7,
                status: "implemented",
              }),
            ]
          : [
              createDatum(module, "Yoga", "Yogas presentes", 0, {
                technicalNotes: "Sem yoga dominante detectado automaticamente neste recorte.",
                confidence: 0.5,
                status: "implemented",
              }),
            ],
        tables: [
          createTable(
            `${module}-yoga-validation-table`,
            "Matriz tecnica de validacao",
            ["Yoga", "Familia", "Regra", "Forca base", "Rupas medias", "D9", "Dasha", "Estado", "Grahas-chave"],
            yogaRows.length
              ? yogaRows.map((row) => [
                  row.yogaName,
                  row.family,
                  row.rule,
                  row.strengthLabel,
                  row.averageRupas ? row.averageRupas.toFixed(2) : "--",
                  row.d9Assessment.label,
                  row.activation.label,
                  row.modification,
                  row.involvedKeys.length ? row.involvedKeys.join(", ") : "--",
                ])
              : [["Nenhum yoga ativo", "--", "--", "--", "--", "--", "--", "--", "--"]],
            "A tabela nao sentencia resultado final; ela apenas informa suporte tecnico, contradicao, confirmacao por D9 e toque do periodo atual."
          ),
          createTable(
            `${module}-yoga-validation-notes`,
            "Notas de suporte",
            ["Yoga", "Area", "Casas", "Signos", "Bhanga / excecao", "Detalhe D9", "Detalhe de dasha"],
            yogaRows.length
              ? yogaRows.map((row) => [
                  row.yogaName,
                  row.area,
                  formatYogaPointHouses(snapshot, row.involvedKeys),
                  formatYogaPointSigns(snapshot, row.involvedKeys),
                  row.cancellation,
                  row.d9Assessment.status,
                  row.activation.note,
                ])
              : [["Nenhum yoga ativo", "--", "--", "--", "--", "Sem notas", "Sem notas"]],
            "Leitura curta para o astrologo humano saber onde o yoga esta sustentado, tensionado ou apenas latente."
          ),
          createTable(
            `${module}-yoga-actors`,
            "Grahas e atores dos yogas",
            ["Yoga", "Grahas-chave", "Evidencia natal"],
            yogaRows.length
              ? yogaRows.map((row) => [
                  row.yogaName,
                  formatYogaPointNames(snapshot, row.involvedKeys),
                  row.detail,
                ])
              : [["Nenhum yoga ativo", "--", "--"]],
            "Deixa explicito quais grahas, signos e posicoes basearam a deteccao antes da leitura interpretativa."
          ),
        ],
      }),
    ],
  };
}
