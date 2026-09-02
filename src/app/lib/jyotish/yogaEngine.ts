import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";
import {
  buildYogaDiagnostics,
  formatYogaPointHouses,
  formatYogaPointNames,
  formatYogaPointSigns,
} from "./yogaCatalog";

type YogaFamilyCoverage = "direct" | "partial" | "mapped";

type YogaFamilyDefinition = {
  name: string;
  coverage: YogaFamilyCoverage;
  patterns: string[];
  note: string;
};

const YOGA_FAMILIES: YogaFamilyDefinition[] = [
  {
    name: "Raja Yogas",
    coverage: "partial",
    patterns: ["Raja Yoga", "Parijata Yoga", "Budha Aditya", "Subha-Vasi"],
    note: "Hoje o motor pega ramos mais visiveis do eixo dharma-karma e apoio forte do lagna lord.",
  },
  {
    name: "Dhana Yogas",
    coverage: "partial",
    patterns: ["Swa-Veeryaddhana Yoga", "Sumukha Yoga", "Mathrumooladhana Yoga"],
    note: "O motor ja cobre alguns yogas de riqueza por 2a casa, apoio benefico e ligacao com a 4a.",
  },
  {
    name: "Daridra Yogas",
    coverage: "partial",
    patterns: ["Daridra Yoga"],
    note: "O motor agora abre pressao sobre 2a e 11a casas por dusthanas e aflicao natural, mantendo a familia em leitura conservadora.",
  },
  {
    name: "Arishta Yogas",
    coverage: "partial",
    patterns: ["Arishta Yoga"],
    note: "A camada basal agora rastreia Lua, Lagna e eixo da 8a quando ha vulnerabilidade com pressao e nota explicita de bhanga.",
  },
  {
    name: "Neecha Bhanga Raja Yoga",
    coverage: "partial",
    patterns: ["Neecha Bhanga Raja Yoga"],
    note: "Agora existe detector basal de cancelamento de debilidade; variantes mais finas de escola ainda podem ampliar esta familia.",
  },
  {
    name: "Viparita Raja Yoga",
    coverage: "partial",
    patterns: ["Viparita Raja Yoga", "Harsha Viparita Raja Yoga", "Sarala Viparita Raja Yoga", "Vimala Viparita Raja Yoga"],
    note: "O motor agora abre os subtipos classicos basais por lords de dusthana em dusthana.",
  },
  {
    name: "Pancha Mahapurusha Yogas",
    coverage: "partial",
    patterns: [
      "Ruchaka Mahapurusha Yoga",
      "Bhadra Mahapurusha Yoga",
      "Hamsa Mahapurusha Yoga",
      "Malavya Mahapurusha Yoga",
      "Sasa Mahapurusha Yoga",
    ],
    note: "Detector basal ativo para os cinco Mahapurusha por kendra e dignidade de signo.",
  },
  {
    name: "Gaja Kesari Yoga",
    coverage: "direct",
    patterns: ["Gaja Kesari"],
    note: "Detector direto ativo por Jupiter em kendra a partir da Lua.",
  },
  {
    name: "Sunapha Yoga",
    coverage: "direct",
    patterns: ["Sunabha Yoga", "Sunapha Yoga"],
    note: "Detector direto ativo pela 2a casa a partir da Lua.",
  },
  {
    name: "Anapha Yoga",
    coverage: "direct",
    patterns: ["Anapha Yoga"],
    note: "Detector direto ativo pela 12a casa a partir da Lua.",
  },
  {
    name: "Durudhara Yoga",
    coverage: "direct",
    patterns: ["Durudhara Yoga"],
    note: "Detector direto ativo pelo apoio simultaneo dos dois lados da Lua.",
  },
  {
    name: "Kemadruma Yoga",
    coverage: "partial",
    patterns: ["Kemadruma Yoga"],
    note: "Agora existe detector basal com nota explicita de bhanga; as excecoes completas ainda podem crescer.",
  },
  {
    name: "Adhi Yoga",
    coverage: "partial",
    patterns: ["Adhi Yoga"],
    note: "Detector basal ativo por beneficos em 6a, 7a e 8a a partir da Lua.",
  },
  {
    name: "Vasumati Yoga",
    coverage: "partial",
    patterns: ["Vasumati Yoga"],
    note: "Detector basal ativo por beneficos em upachayas a partir do Lagna.",
  },
  {
    name: "Lakshmi Yoga",
    coverage: "partial",
    patterns: ["Lakshmi Yoga"],
    note: "Detector basal ativo pela combinacao de 9o lord forte em kendra/trikona e Lagna lord sustentado.",
  },
  {
    name: "Saraswati Yoga",
    coverage: "partial",
    patterns: ["Saraswati Yoga"],
    note: "Detector basal ativo por Budha, Guru e Shukra em casas fortes, com nota de tensao quando aplicavel.",
  },
  {
    name: "Parivartana Yogas",
    coverage: "partial",
    patterns: ["Parivartana Yoga"],
    note: "O motor agora abre trocas de signos entre lords de casas e explicita os pares envolvidos.",
  },
  {
    name: "Dharma-Karmadhipati Yoga",
    coverage: "direct",
    patterns: ["Dharma-Karmadhipati"],
    note: "Detector direto ativo dentro do working set de Raja Yoga.",
  },
  {
    name: "Nabhasa Yogas",
    coverage: "partial",
    patterns: ["Gola Yoga", "Yuga Yoga", "Shula Yoga", "Kedara Yoga", "Pasha Yoga", "Dama Yoga", "Veena Yoga", "Rajju Yoga", "Musala Yoga", "Nala Yoga"],
    note: "O motor agora cobre Sankhya e Ashraya Nabhasa basais pela distribuicao dos sete grahas classicos entre signos e qualidades.",
  },
  {
    name: "Sanyasa Yogas",
    coverage: "partial",
    patterns: ["Sanyasa Yoga"],
    note: "O motor agora abre aglomeracoes asceticas de quatro ou mais grahas classicos, com planeta dominante explicitado.",
  },
  {
    name: "Pravrajya Yogas",
    coverage: "partial",
    patterns: ["Pravrajya Yoga"],
    note: "Entrou o detector basal de renuncia por aglomeracao classica, com dominancia planetaria e ressalva de dignidade.",
  },
  {
    name: "Kuja Dosha / Manglik",
    coverage: "direct",
    patterns: ["Kuja Dosha", "Manglik"],
    note: "A familia entra forte no modulo Vivaha; no catalogo geral ainda depende do recorte em uso.",
  },
  {
    name: "Yogas de Rahu/Ketu",
    coverage: "partial",
    patterns: ["Grahana Yoga", "Surya Grahana Yoga", "Chandra Grahana Yoga"],
    note: "A camada nodal agora abre grahana por conjuncao apertada entre luminares e nodos, sem misturar tecnicas nao classicas nesta grade.",
  },
  {
    name: "Yogas Jaimini",
    coverage: "partial",
    patterns: ["Jaimini Raja Yoga", "Jaimini Dhana Yoga"],
    note: "Hoje a familia ja conversa com o modulo Jaimini, mas ainda nao cobre todos os subtipos.",
  },
];

function normalizeYogaName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function coverageLabel(coverage: YogaFamilyCoverage) {
  if (coverage === "direct") {
    return "Detector direto";
  }

  if (coverage === "partial") {
    return "Cobertura parcial";
  }

  return "Somente mapeado";
}

function familyStatusLabel(matches: string[], coverage: YogaFamilyCoverage) {
  if (matches.length) {
    return "Presente";
  }

  if (coverage === "mapped") {
    return "Catalogado";
  }

  return "Nao detectado";
}

function familyStatusState(matches: string[], coverage: YogaFamilyCoverage) {
  if (matches.length) {
    return "implemented" as const;
  }

  if (coverage === "mapped") {
    return "placeholder" as const;
  }

  return "implemented" as const;
}

function familyConfidence(matches: string[], coverage: YogaFamilyCoverage) {
  if (matches.length) {
    return coverage === "direct" ? 0.76 : 0.64;
  }

  if (coverage === "mapped") {
    return 0.3;
  }

  return 0.5;
}

export function yogaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const diagnostics = buildYogaDiagnostics(snapshot);
  const yogaItems = diagnostics.length
    ? diagnostics.map((item) =>
        createDatum(module, "Yoga", item.name, "Presente", {
          technicalNotes: `${item.rule} ${item.detail}${item.cancellation ? ` ${item.cancellation}` : ""}`,
          confidence: 0.76,
          status: "implemented",
        })
      )
    : [
        createDatum(module, "Yoga", "Nenhum yoga automatico dominante no recorte atual.", "Presente", {
          technicalNotes: "Sem detalhe tecnico adicional neste recorte.",
          confidence: 0.45,
          status: "implemented",
        }),
      ];
  const normalizedYogas = diagnostics.map((row) => ({
    raw: `${row.name} - ${row.detail}`,
    normalized: normalizeYogaName(`${row.name} ${row.detail}`),
  }));

  const familyRows = YOGA_FAMILIES.map((family) => {
    const matches = normalizedYogas
      .filter((item) =>
        family.patterns.some((pattern) => item.normalized.includes(normalizeYogaName(pattern)))
      )
      .map((item) => item.raw);

    return {
      ...family,
      matches,
      statusLabel: familyStatusLabel(matches, family.coverage),
      state: familyStatusState(matches, family.coverage),
      confidence: familyConfidence(matches, family.coverage),
    };
  });

  const coveredYogas = new Set(familyRows.flatMap((family) => family.matches));
  const uncataloguedYogas = diagnostics
    .map((row) => `${row.name} - ${row.detail}`)
    .filter((yoga) => !coveredYogas.has(yoga));
  const presentFamilies = familyRows.filter((family) => family.matches.length > 0);
  const mappedOnlyCount = familyRows.filter((family) => family.coverage === "mapped").length;
  const directCoverageCount = familyRows.filter((family) => family.coverage === "direct").length;
  const partialCoverageCount = familyRows.filter((family) => family.coverage === "partial").length;
  const conditionedCount = diagnostics.filter((row) => row.cancellation).length;

  return {
    sections: [
      createSection({
        id: `${module}-yogas`,
        title: "Yogas Detectados",
        description:
          "Yogas efetivamente detectados pelo motor atual, sem transformar a deteccao em sentenca interpretativa final.",
        status: "implemented",
        items: yogaItems,
        tables: diagnostics.length
          ? [
              createTable(
                `${module}-yoga-detailed-detections`,
                "Matriz tecnica dos yogas",
                ["Yoga", "Familia", "Regra", "Grahas-chave", "Casas", "Signos", "Area", "Bhanga / excecao"],
                diagnostics.map((row) => [
                  row.name,
                  row.family,
                  row.rule,
                  formatYogaPointNames(snapshot, row.involvedKeys),
                  formatYogaPointHouses(snapshot, row.involvedKeys),
                  formatYogaPointSigns(snapshot, row.involvedKeys),
                  row.area,
                  row.cancellation ?? "--",
                ]),
                "Tabela tecnica para auditoria humana: regra usada, grahas envolvidos, casas, signos, area de frutificacao e eventuais notas de bhanga ou ressalva."
              ),
            ]
          : [],
      }),
      createSection({
        id: `${module}-yoga-catalog`,
        title: "Catalogo de Yogas",
        description:
          "Familias classicas organizadas por cobertura real do motor: o catalogo deixa claro o que ja e detectado, o que apareceu no recorte e o que ainda esta apenas mapeado.",
        status: "implemented",
        items: [
          createDatum(module, "Yoga", "Familias presentes", presentFamilies.length, {
            technicalNotes:
              presentFamilies.length
                ? presentFamilies.map((family) => family.name).join(", ")
                : "Nenhuma familia classica principal foi acionada neste recorte.",
            confidence: 0.74,
            status: "implemented",
          }),
          createDatum(module, "Yoga", "Yogas condicionados por bhanga ou excecao", conditionedCount, {
            technicalNotes:
              conditionedCount
                ? "Ha yogas cujo detector basal veio acompanhado de nota de cancelamento, alivio ou excecao escolar."
                : "Nenhum yoga desta rodada precisou de ressalva basal de bhanga/excecao.",
            confidence: 0.72,
            status: "implemented",
          }),
          createDatum(module, "Yoga", "Cobertura do motor", `${directCoverageCount} diretas | ${partialCoverageCount} parciais | ${mappedOnlyCount} mapeadas`, {
            technicalNotes:
              "A secao separa detector direto, cobertura parcial e familia apenas catalogada para evitar prometer mais do que o motor realmente calcula hoje.",
            confidence: 0.72,
            status: "implemented",
          }),
          createDatum(module, "Yoga", "Yogas fora do catalogo principal", uncataloguedYogas.length ? uncataloguedYogas.join("; ") : "Nenhum", {
            technicalNotes:
              uncataloguedYogas.length
                ? "Combinacoes reais detectadas, mas fora das familias priorizadas neste catalogo classico."
                : "Todas as deteccoes atuais cairam dentro das familias catalogadas.",
            confidence: uncataloguedYogas.length ? 0.62 : 0.7,
            status: "implemented",
          }),
        ],
        tables: [
          createTable(
            `${module}-yoga-family-catalog`,
            "Familias, cobertura e ocorrencia",
            ["Familia", "Estado", "Cobertura", "Yogas no recorte", "Nota"],
            familyRows.map((family) => [
              family.name,
              family.statusLabel,
              coverageLabel(family.coverage),
              family.matches.length ? family.matches.join(" | ") : "--",
              family.note,
            ]),
            "Tabela honesta do motor atual: mostra onde ja existe deteccao de verdade e onde ainda ha apenas mapeamento arquitetural."
          ),
          ...(uncataloguedYogas.length
            ? [
                createTable(
                  `${module}-yoga-extra-detections`,
                  "Outras combinacoes detectadas",
                  ["Yoga detectado", "Leitura no catalogo"],
                  uncataloguedYogas.map((yoga) => [
                    yoga,
                    "Ainda fora das familias priorizadas desta secao; manter como combinacao tecnica detectada.",
                  ]),
                  "Nem toda deteccao do motor cabe nas familias classicas priorizadas aqui; esta grade evita esconder combinacoes reais."
                ),
              ]
            : []),
        ],
      }),
    ],
  };
}
