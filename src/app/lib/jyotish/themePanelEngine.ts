import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

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
const LORD_NAME_TO_KEY: Record<string, string> = {
  Sun: "sun",
  Moon: "moon",
  Mars: "mars",
  Mercury: "mercury",
  Jupiter: "jupiter",
  Venus: "venus",
  Saturn: "saturn",
  Rahu: "northNode",
  Ketu: "southNode",
};

const THEME_ROWS = [
  {
    key: "wealth",
    label: "Recursos e sustento",
    house: 2,
    karakaKeys: ["jupiter", "venus"],
    vargaKey: "D2",
    vargaLabel: "Hora",
    charaRole: undefined,
  },
  {
    key: "siblings",
    label: "Irmaos e esforco",
    house: 3,
    karakaKeys: ["mars"],
    vargaKey: "D3",
    vargaLabel: "Drekkana",
    charaRole: undefined,
  },
  {
    key: "property",
    label: "Lar, base e imoveis",
    house: 4,
    karakaKeys: ["moon", "mars"],
    vargaKey: "D4",
    vargaLabel: "Chaturthamsa",
    charaRole: undefined,
  },
  {
    key: "children",
    label: "Filhos e criacao",
    house: 5,
    karakaKeys: ["jupiter"],
    vargaKey: "D7",
    vargaLabel: "Saptamsa",
    charaRole: undefined,
  },
  {
    key: "marriage",
    label: "Casamento e parceria",
    house: 7,
    karakaKeys: ["venus"],
    vargaKey: "D9",
    vargaLabel: "Navamsa",
    charaRole: "Darakaraka",
  },
  {
    key: "dharma",
    label: "Dharma e fortuna",
    house: 9,
    karakaKeys: ["jupiter", "sun"],
    vargaKey: "D9",
    vargaLabel: "Navamsa",
    charaRole: "Atmakaraka",
  },
  {
    key: "career",
    label: "Carreira e status",
    house: 10,
    karakaKeys: ["sun", "mercury", "saturn"],
    vargaKey: "D10",
    vargaLabel: "Dasamsa",
    charaRole: "Amatyakaraka",
  },
  {
    key: "parents",
    label: "Pais e linhagem",
    house: 9,
    karakaKeys: ["sun", "moon"],
    vargaKey: "D12",
    vargaLabel: "Dvadasamsa",
    charaRole: undefined,
  },
  {
    key: "education",
    label: "Estudos e aprendizado",
    house: 4,
    karakaKeys: ["mercury", "jupiter"],
    vargaKey: "D24",
    vargaLabel: "Siddhamsa",
    charaRole: undefined,
  },
  {
    key: "spirituality",
    label: "Sadhana e moksha",
    house: 12,
    karakaKeys: ["jupiter", "southNode"],
    vargaKey: "D20",
    vargaLabel: "Vimsamsa",
    charaRole: "Atmakaraka",
  },
] as const;

function modulo(value: number, size: number) {
  return ((value % size) + size) % size;
}

function getPlanet(snapshot: VedicSnapshot, key: string) {
  return snapshot.planets.find((point) => point.key === key);
}

function getHouseSignIndex(snapshot: VedicSnapshot, house: number) {
  return modulo(snapshot.ascendant.signIndex + house - 1, 12);
}

function getHouseLord(snapshot: VedicSnapshot, house: number) {
  const signIndex = getHouseSignIndex(snapshot, house);
  const lordKey = SIGN_LORD_KEYS[signIndex];
  return getPlanet(snapshot, lordKey) ?? snapshot.ascendant;
}

function getHouseOccupants(snapshot: VedicSnapshot, house: number) {
  return snapshot.planets.filter((point) => point.house === house);
}

function describePoint(point: VedicPoint | undefined) {
  return point ? `${point.name} em ${point.signName} (H${point.house})` : "--";
}

function getTargetedAspects(snapshot: VedicSnapshot, point: VedicPoint) {
  return snapshot.aspects
    .filter((aspect) => aspect.target === point.name)
    .map((aspect) => `${aspect.source} (${aspect.kind})`);
}

function buildVargaSupport(snapshot: VedicSnapshot, vargaKey: string, lord: VedicPoint, karakas: VedicPoint[]) {
  const chart = snapshot.vargas.find((entry) => entry.key === vargaKey);
  if (!chart) {
    return { label: "--", note: `Sem ${vargaKey} disponivel.` };
  }

  const lordPoint = chart.points.find((point) => point.key === lord.key);
  const karakaPoints = karakas
    .map((point) => chart.points.find((candidate) => candidate.key === point.key))
    .filter((point): point is NonNullable<typeof point> => Boolean(point));

  return {
    label:
      `${vargaKey}: ${lord.name} ${lordPoint ? `em ${lordPoint.signName} (H${lordPoint.house})` : "--"}` +
      `${karakaPoints.length ? ` | ${karakaPoints.map((point) => `${point.name} ${point.signName}/H${point.house}`).join(", ")}` : ""}`,
    note: chart.label,
  };
}

function buildDashaTrigger(snapshot: VedicSnapshot, lord: VedicPoint, karakas: VedicPoint[]) {
  const activeMaha = snapshot.dashas.find((period) => period.active);
  const activeAntara = snapshot.antardashas.find((period) => period.active);
  const watchedKeys = new Set([lord.key, ...karakas.map((point) => point.key)]);
  const watchedNames = [activeMaha?.lord, activeAntara?.lord]
    .filter((name): name is string => Boolean(name))
    .map((name) => LORD_NAME_TO_KEY[name] ?? name);
  const hits = watchedNames.filter((key) => watchedKeys.has(key));

  return hits.length
    ? `${activeMaha?.lord ?? "--"} / ${activeAntara?.lord ?? "--"} toca ${hits
        .map((key) => [lord, ...karakas].find((point) => point.key === key)?.name ?? key)
        .join(", ")}`
    : `${activeMaha?.lord ?? "--"} / ${activeAntara?.lord ?? "--"} sem ancora direta`;
}

export function themePanelEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const rows = THEME_ROWS.map((entry) => {
    const lord = getHouseLord(snapshot, entry.house);
    const occupants = getHouseOccupants(snapshot, entry.house);
    const karakaPoints = entry.karakaKeys
      .map((key) => getPlanet(snapshot, key))
      .filter((point): point is NonNullable<typeof point> => Boolean(point));
    const chara = entry.charaRole ? snapshot.charaKarakas.find((item) => item.role === entry.charaRole) : undefined;
    const charaPoint = chara ? getPlanet(snapshot, chara.key) : undefined;
    const allKarakas = [...karakaPoints, ...(charaPoint ? [charaPoint] : [])];
    const vargaSupport = buildVargaSupport(snapshot, entry.vargaKey, lord, allKarakas);
    const lordAspects = getTargetedAspects(snapshot, lord);
    const occupantAspects = occupants.flatMap((point) => getTargetedAspects(snapshot, point));

    return {
      ...entry,
      lord,
      occupants,
      allKarakas,
      vargaSupport,
      dashaTrigger: buildDashaTrigger(snapshot, lord, allKarakas),
      lordAspects,
      occupantAspects,
    };
  });

  const directlyActivated = rows.filter((row) => !row.dashaTrigger.includes("sem ancora direta"));
  const marriageRow = rows.find((row) => row.key === "marriage");
  const careerRow = rows.find((row) => row.key === "career");

  return {
    sections: [
      createSection({
        id: `${module}-theme-panels`,
        title: "Casa, Senhor, Karaka, Varga e Dasha",
        description:
          "Organiza o mapa por assunto sem interpretar por conta propria: casa-base, senhor, ocupantes, karakas, varga correspondente e ativadores de dasha.",
        status: "implemented",
        items: [
          createDatum(module, "Painel Tematico", "Temas tocados pela cadeia ativa", directlyActivated.length, {
            technicalNotes:
              directlyActivated.length
                ? directlyActivated.map((row) => row.label).join(", ")
                : "A cadeia ativa atual nao toca diretamente o senhor ou os karakas principais desta grade curta.",
            confidence: 0.76,
            status: "implemented",
            methodUsed: "theme-panel-dasha-bridge-v1",
          }),
          createDatum(module, "Painel Tematico", "Casamento: eixo tecnico", marriageRow ? `${describePoint(marriageRow.lord)} | ${marriageRow.vargaSupport.note}` : "--", {
            technicalNotes: marriageRow
              ? `Casa 7, karakas ${marriageRow.allKarakas.map((point) => point.name).join(", ") || "--"} e ${marriageRow.vargaSupport.label}.`
              : "Sem linha de casamento montada.",
            confidence: marriageRow ? 0.78 : 0.3,
            status: marriageRow ? "implemented" : "placeholder",
            methodUsed: "theme-panel-marriage-v1",
          }),
          createDatum(module, "Painel Tematico", "Carreira: eixo tecnico", careerRow ? `${describePoint(careerRow.lord)} | ${careerRow.vargaSupport.note}` : "--", {
            technicalNotes: careerRow
              ? `Casa 10, karakas ${careerRow.allKarakas.map((point) => point.name).join(", ") || "--"} e ${careerRow.vargaSupport.label}.`
              : "Sem linha de carreira montada.",
            confidence: careerRow ? 0.78 : 0.3,
            status: careerRow ? "implemented" : "placeholder",
            methodUsed: "theme-panel-career-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-theme-panel-table`,
            "Painel tematico natal",
            ["Tema", "Casa", "Senhor", "Ocupantes", "Aspectos", "Karakas", "Varga", "Dasha ativa"],
            rows.map((row) => [
              row.label,
              `H${row.house} em ${SIGN_NAMES[getHouseSignIndex(snapshot, row.house)]}`,
              describePoint(row.lord),
              row.occupants.length ? row.occupants.map((point) => point.name).join(", ") : "--",
              [
                row.lordAspects.length ? `Lord: ${row.lordAspects.join(", ")}` : "",
                row.occupantAspects.length ? `Casa: ${row.occupantAspects.join(", ")}` : "",
              ]
                .filter(Boolean)
                .join(" | ") || "--",
              row.allKarakas.length ? row.allKarakas.map((point) => point.name).join(", ") : "--",
              row.vargaSupport.label,
              row.dashaTrigger,
            ]),
            "Cada linha deixa o trilho tecnico pronto para o astrologo cruzar promessa natal, varga pertinente e ativacao temporal."
          ),
          createTable(
            `${module}-theme-panel-lords`,
            "Senhores e casas-base",
            ["Tema", "Signo da casa", "Senhor da casa", "Karaka chara", "Varga-chave"],
            rows.map((row) => [
              row.label,
              SIGN_NAMES[getHouseSignIndex(snapshot, row.house)],
              row.lord.name,
              row.charaRole ?? "--",
              `${row.vargaKey} (${row.vargaLabel})`,
            ]),
            "Mostra qual casa-base, qual senhor e qual varga sao usados para cada assunto da grade curta."
          ),
        ],
      }),
    ],
    summary: [
      `Painel tematico montado com ${rows.length} assuntos e ${directlyActivated.length} toque(s) diretos da cadeia ativa.`,
      "A leitura agora pode ser auditada por casa, senhor, karaka, varga e dasha sem exigir texto interpretativo do sistema.",
    ],
  };
}
