import type { VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

const SECONDARY_VARGAS = ["D5", "D6", "D8", "D11", "D108", "D144"] as const;
const SECONDARY_VARGA_SET = new Set<string>(SECONDARY_VARGAS);
const SIGN_LORDS = ["Mangala", "Shukra", "Budha", "Chandra", "Surya", "Budha", "Shukra", "Mangala", "Guru", "Shani", "Shani", "Guru"];
const SECONDARY_TOPICS: Record<(typeof SECONDARY_VARGAS)[number], string> = {
  D5: "autoridade, poder e projecao criativa",
  D6: "saude, doenca e resistencia",
  D8: "crises, longevidade e transformacao",
  D11: "forca de superacao, atrito e perdas",
  D108: "camada sutil de karma e refinamento espiritual",
  D144: "microdiferencas karmicas e retificacao fina",
};
const SECONDARY_SENSITIVITY: Record<(typeof SECONDARY_VARGAS)[number], string> = {
  D5: "Media",
  D6: "Media",
  D8: "Media",
  D11: "Media",
  D108: "Alta",
  D144: "Muito alta",
};
const CLASSICAL_REFERENCE_VARGAS = new Set(["D1", "D9", "D10", "D12", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"]);

export function vargaEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const secondaryCharts = snapshot.vargas.filter((varga) => SECONDARY_VARGA_SET.has(varga.key));
  const secondaryAvailable = secondaryCharts.length === SECONDARY_VARGAS.length;

  return {
    sections: [
      createSection({
        id: `${module}-vargas`,
        title: "Vargas / Mapas Divisionais",
        description:
          "Mapa divisional com Shodashavarga e vargas opcionais ativos, mantendo os secundarios como leitura avancada para confirmacao ou contradicao do D1.",
        status: "implemented",
        tables: snapshot.vargas.map((varga) =>
          createTable(
            `${module}-${varga.key}`,
            `${varga.key} - ${varga.label}`,
            ["Ponto", "Signo", "Casa", "Nakshatra", "Estado"],
            varga.points.map((point) => [
              point.name,
              point.signName,
              point.house.toString(),
              `${point.nakshatra} P${point.pada}`,
              point.tags.join(", "),
            ]),
            SECONDARY_VARGA_SET.has(varga.key)
              ? "Varga opcional calculado pelo working set harmonico-explicito do motor atual."
              : "Tabela derivada do motor igualitario atual das divisionais.",
            varga.key !== "D1" && !["D9", "D10", "D60"].includes(varga.key)
          )
        ),
        items: snapshot.vargas.map((varga) =>
          createDatum(module, "Varga", `${varga.key} ativo`, "Sim", {
            relatedVarga: varga.key,
            technicalNotes: SECONDARY_VARGA_SET.has(varga.key)
              ? `${varga.label} disponivel no working set harmonico do motor atual.`
              : `${varga.label} disponivel para confirmacao tecnica.`,
            confidence: SECONDARY_VARGA_SET.has(varga.key) ? 0.62 : 0.68,
          })
        ),
      }),
      createSection({
        id: `${module}-varga-methodology`,
        title: "Metodo Tradicional das Divisionais",
        description:
          "Explicita como o motor trata os vargas altos quando a tradicao e alguns softwares modernos nao convergem no mesmo desenho final.",
        status: "implemented",
        items: [
          createDatum(module, "Varga", "Linha metodologica", "Parasari-classica", {
            technicalNotes:
              "Quando ha choque entre convencoes de software e regra tradicional, o motor prioriza a escola classica declarada na propria configuracao do Jyotish.",
            confidence: 0.86,
            status: "implemented",
            methodUsed: "parasari-classic-varga-policy",
          }),
          createDatum(module, "Varga", "D30 / Trimsamsa", "Segmentos classicos por signo", {
            relatedVarga: "D30",
            technicalNotes:
              "O Trimsamsa usa a malha classica de segmentos por signo impar/par e projecao interna coerente com a leitura tradicional, sem reescrever o mapa para seguir software externo.",
            confidence: 0.84,
            status: "implemented",
            methodUsed: "parasari-trimsamsa-classic-v2",
          }),
          createDatum(module, "Varga", "D40 / Khavedamsa", "Impares desde Aries; pares desde Libra", {
            relatedVarga: "D40",
            technicalNotes:
              "O Chatvarimsamsa segue a regra classica de contagem desde Aries nos signos impares e desde Libra nos signos pares. Divergencias isoladas de software ficam tratadas como variacao escolar, nao como base do motor.",
            confidence: 0.84,
            status: "implemented",
            methodUsed: "parasari-chatvarimsamsa-classic-v1",
          }),
          createDatum(module, "Varga", "Vargas altos", "Leitura de alta sensibilidade", {
            technicalNotes:
              "D27 para cima pedem horario mais limpo e servem como confirmacao ou contradicao refinada do D1, nao como substituicao mecanica da leitura natal.",
            confidence: 0.8,
            status: "implemented",
            methodUsed: "high-varga-sensitivity-note-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-varga-methodology-table`,
            "Mapa metodologico dos vargas altos",
            ["Varga", "Regra operacional", "Uso no motor", "Observacao"],
            snapshot.vargas
              .filter((varga) => CLASSICAL_REFERENCE_VARGAS.has(varga.key))
              .map((varga) => [
                `${varga.key} - ${varga.label}`,
                varga.key === "D30"
                  ? "Segmentos classicos por signo impar/par"
                  : varga.key === "D40"
                    ? "Impares desde Aries; pares desde Libra"
                    : "Regra divisional classica do working set atual",
                ["D30", "D40", "D45", "D60"].includes(varga.key) ? "Confirmacao fina / contradicao refinada" : "Leitura divisional ativa",
                ["D30", "D40"].includes(varga.key)
                  ? "Se um software divergir aqui, o motor mantem a linha tradicional."
                  : "Mantido como camada tecnicamente operacional do modulo natal.",
              ]),
            "Painel de metodo para distinguir base tradicional, sensibilidade horaria e possiveis divergencias escolares nos vargas altos."
          ),
        ],
      }),
      createSection({
        id: `${module}-secondary-vargas`,
        title: "Vargas Secundarios Opcionais",
        description:
          "Os vargas opcionais agora saem do puro placeholder e entram como charts calculados, com sensibilidade explicitada para leitura e retificacao.",
        status: secondaryCharts.length ? "implemented" : "placeholder",
        items: secondaryCharts.map((varga) => {
          const lagna = varga.points.find((point) => point.key === "ascendant");
          return createDatum(module, "Varga", `${varga.key} secundario`, lagna?.signName ?? "--", {
            relatedVarga: varga.key,
            technicalNotes: `${varga.label} voltado a ${SECONDARY_TOPICS[varga.key as keyof typeof SECONDARY_TOPICS]}. Sensibilidade: ${SECONDARY_SENSITIVITY[varga.key as keyof typeof SECONDARY_SENSITIVITY]}.`,
            confidence: ["D108", "D144"].includes(varga.key) ? 0.56 : 0.64,
            status: lagna ? "implemented" : "placeholder",
          });
        }),
        tables: [
          createTable(
            `${module}-secondary-vargas-summary`,
            "Resumo dos vargas opcionais",
            ["Varga", "Tema", "Lagna", "Regente do Lagna", "Sensibilidade"],
            secondaryCharts.map((varga) => {
              const lagna = varga.points.find((point) => point.key === "ascendant");
              return [
                `${varga.key} - ${varga.label}`,
                SECONDARY_TOPICS[varga.key as keyof typeof SECONDARY_TOPICS],
                lagna?.signName ?? "--",
                lagna ? SIGN_LORDS[lagna.signIndex] : "--",
                SECONDARY_SENSITIVITY[varga.key as keyof typeof SECONDARY_SENSITIVITY],
              ];
            }),
            "Working set harmonico-explicito para D5, D6, D8, D11, D108 e D144; D108 e D144 exigem ainda mais rigor no horario."
          ),
        ],
      }),
    ],
    summary: [
      "Vargas altos seguem a linha Parasari-classica declarada no motor, mesmo quando algum software externo apresentar convencao distinta.",
      "D30 usa a malha classica de Trimsamsa por signo impar/par; D40 usa Chatvarimsamsa com contagem desde Aries nos impares e desde Libra nos pares.",
    ],
  };
}
