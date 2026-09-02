"use client";

import GeneratedReportPanel from "@/app/components/shared/GeneratedReportPanel";
import WorldTopbar from "@/app/components/WorldTopbar";
import LocationAutocomplete, {
  LocationSelection,
} from "@/app/components/shared/LocationAutocomplete";
import {
  buildTongShuReading,
  generateBaziAnnualReport,
  generateBaziCompatibilityReport,
  generateBaziNatalReport,
  generateQiMenReport,
  generateTongShuReport,
  generateZiWeiReport,
  TongShuReading,
} from "@/app/lib/chineseReports";
import {
  CHINESE_MODULE_CATALOG,
  ChineseCatalogSection,
  ChineseModuleKey,
  catalogSectionsToReport,
  flattenModuleTopics,
  getModuleTopicCount,
} from "@/app/lib/chineseModuleCatalog";
import {
  DetailBlock,
  buildBaziAnnualBlocks,
  buildBaziCompatibilityBlocks,
  buildBaziNatalBlocks,
  buildQiMenBlocks,
  buildTongShuBlocks,
  buildZiWeiBlocks,
} from "@/app/lib/chineseTechniques";
import {
  BaziSchoolMode,
  BaziChart,
  BaziInput,
  ElementName,
  Gender,
  Pillar,
  calculateBazi,
  getAnimal,
  getStemMeta,
  mergeElementScores,
} from "@/app/lib/bazi";
import {
  calculateQiMenProfile,
  QiMenEnginePresetId,
  QiMenProfile,
  QIMEN_ENGINE_PRESETS,
} from "@/app/lib/qimen";
import {
  ZiWeiEnginePresetId,
  ZiWeiProfile,
  ZIWEI_ENGINE_PRESETS,
  calculateZiWeiProfile,
} from "@/app/lib/ziwei";
import { useMemo, useState } from "react";
import {
  FiActivity,
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiCompass,
  FiGrid,
  FiLayers,
  FiMap,
  FiMoon,
  FiRefreshCw,
  FiStar,
  FiSun,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiWind,
} from "react-icons/fi";

type BaziViewKey = "natal" | "compatibility" | "cycles";
type ModulePanelKey = "analysis" | "atlas" | "report";

const BAZI_SCHOOL_OPTIONS: Array<{ value: BaziSchoolMode; label: string }> = [
  { value: "ziping-conservative", label: "Zi Ping conservador" },
  { value: "balance-strong-weak", label: "Equilibrio forte/fraco" },
  { value: "geju-structure", label: "Ge Ju / estrutura" },
  { value: "expanded-symbolic", label: "Shen Sha ampliado" },
];

const ZIWEI_PRESET_OPTIONS: Array<{ value: ZiWeiEnginePresetId; label: string }> = Object.values(
  ZIWEI_ENGINE_PRESETS
).map((preset) => ({
  value: preset.id,
  label: preset.label,
}));

const QIMEN_PRESET_OPTIONS: Array<{ value: QiMenEnginePresetId; label: string }> = Object.values(
  QIMEN_ENGINE_PRESETS
).map((preset) => ({
  value: preset.id,
  label: preset.label,
}));

interface ChineseSuite {
  natalChart: BaziChart;
  partnerChart: BaziChart;
  periodChart: BaziChart;
  ziWeiProfile: ZiWeiProfile;
  qiMenProfile: QiMenProfile;
  tongShu: TongShuReading;
  reports: {
    natal: string;
    compatibility: string;
    annual: string;
    ziwei: string;
    qimen: string;
    tongshu: string;
  };
  blocks: {
    natal: DetailBlock[];
    compatibility: DetailBlock[];
    annual: DetailBlock[];
    ziwei: DetailBlock[];
    qimen: DetailBlock[];
    tongshu: DetailBlock[];
  };
}

const defaultLocation: LocationSelection = {
  name: "Barra Mansa, Rio de Janeiro, Brasil",
  city: "Barra Mansa",
  region: "Rio de Janeiro",
  country: "Brasil",
  latitude: -22.5441,
  longitude: -44.1719,
  utcOffset: -3,
};

function createInput(
  name: string,
  date: string,
  time: string,
  gender: Gender,
  location: LocationSelection
): BaziInput {
  return {
    name,
    date,
    time,
    gender,
    location: location.name ?? "",
    latitude: location.latitude,
    longitude: location.longitude,
    utcOffset: location.utcOffset,
    unknownTime: false,
    solarTime: true,
    dayStartsAt23: true,
    splitLuck: true,
    schoolMode: "expanded-symbolic",
  };
}

const primarySeed = createInput("Nativo", "2001-04-21", "06:45", "male", defaultLocation);
const partnerSeed = createInput("Pessoa B", "2002-09-14", "18:20", "female", {
  ...defaultLocation,
  name: "Rio de Janeiro, Rio de Janeiro, Brasil",
  city: "Rio de Janeiro",
  latitude: -22.9068,
  longitude: -43.1729,
});
const periodSeed = createInput("Consulta", "2026-04-25", "12:00", "male", defaultLocation);

const MODULE_UI_META: Record<
  ChineseModuleKey,
  {
    icon: React.ReactNode;
    kicker: string;
    toneClass: string;
    chipClass: string;
    preview: string[];
  }
> = {
  bazi: {
    icon: <FiSun />,
    kicker: "Mapa, sinastria e ciclos",
    toneClass: "border-red-200/28 bg-red-100/8 text-red-100",
    chipClass: "border-red-200/16 bg-red-100/6 text-red-100/82",
    preview: ["BaZi natal", "Sinastria BaZi", "Ciclos e timing"],
  },
  ziwei: {
    icon: <FiLayers />,
    kicker: "Palácios e estrelas",
    toneClass: "border-red-200/28 bg-red-100/8 text-red-100",
    chipClass: "border-red-200/16 bg-red-100/6 text-red-100/82",
    preview: ["Ming Gong", "Shen Gong", "Quatro Transformações"],
  },
  qimen: {
    icon: <FiCompass />,
    kicker: "Estratégia e direção",
    toneClass: "border-red-200/28 bg-red-100/8 text-red-100",
    chipClass: "border-red-200/16 bg-red-100/6 text-red-100/82",
    preview: ["Portas", "Estrelas", "Deuses e Ju"],
  },
  daliuren: {
    icon: <FiWind />,
    kicker: "Lições e transmissões",
    toneClass: "border-red-200/28 bg-red-100/8 text-red-100",
    chipClass: "border-red-200/16 bg-red-100/6 text-red-100/82",
    preview: ["Quatro lições", "Três transmissões", "Favorabilidade"],
  },
  taiyi: {
    icon: <FiTrendingUp />,
    kicker: "Tempo cósmico e presságio",
    toneClass: "border-red-200/28 bg-red-100/8 text-red-100",
    chipClass: "border-red-200/16 bg-red-100/6 text-red-100/82",
    preview: ["Host e guest", "Ciclos", "Clima coletivo"],
  },
  wenwanggua: {
    icon: <FiBookOpen />,
    kicker: "Hexagramas e seis linhas",
    toneClass: "border-red-200/28 bg-red-100/8 text-red-100",
    chipClass: "border-red-200/16 bg-red-100/6 text-red-100/82",
    preview: ["Hexagrama", "Yong Shen", "Transformação da linha"],
  },
  tongshu: {
    icon: <FiCalendar />,
    kicker: "Calendário e seleção",
    toneClass: "border-red-200/28 bg-red-100/8 text-red-100",
    chipClass: "border-red-200/16 bg-red-100/6 text-red-100/82",
    preview: ["Dias auspiciosos", "Horas", "Seleção de atividades"],
  },
};

const BAZI_VIEW_META: Record<
  BaziViewKey,
  {
    label: string;
    title: string;
    description: string;
    actionLabel: string;
    reportTitle: string;
    reportDescription: string;
    icon: React.ReactNode;
  }
> = {
  natal: {
    label: "BaZi Natal",
    title: "BaZi natal",
    description:
      "Quatro Pilares, Mestre do Dia, força do mapa, estrutura, Yong Shen e catálogo técnico completo do natal.",
    actionLabel: "Calcular BaZi natal",
    reportTitle: "Relatório Técnico BaZi Natal",
    reportDescription:
      "Relatório técnico-calculado do mapa natal com exposição direta dos pilares, elementos, estrutura, clima e catálogo completo.",
    icon: <FiSun />,
  },
  compatibility: {
    label: "Sinastria BaZi",
    title: "Sinastria BaZi",
    description:
      "Comparação técnica entre dois mapas, com interação calculada entre Mestres do Dia, elementos e eixos relacionais.",
    actionLabel: "Calcular sinastria BaZi",
    reportTitle: "Relatório Técnico de Sinastria BaZi",
    reportDescription:
      "Relatório técnico-calculado dos dois mapas com exposição direta das interações, estruturas e catálogo completo do módulo BaZi.",
    icon: <FiUsers />,
  },
  cycles: {
    label: "Ciclos BaZi",
    title: "Da Yun, Xiao Yun e timing",
    description:
      "Relatório técnico-calculado de Da Yun, Xiao Yun, Liu Nian, Liu Yue, Liu Ri e Liu Shi.",
    actionLabel: "Calcular relatório de ciclos",
    reportTitle: "Relatório Técnico de Ciclos BaZi",
    reportDescription:
      "Relatório técnico-calculado que cruza mapa natal, ciclos e período analisado, com exposição direta das camadas temporais do BaZi.",
    icon: <FiTrendingUp />,
  },
};

const MODULE_PANEL_META: Record<
  ModulePanelKey,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
  }
> = {
  analysis: {
    label: "Mapa técnico",
    description: "Tela principal do módulo com formulário, cálculo e referência visual.",
    icon: <FiGrid />,
  },
  atlas: {
    label: "Atlas técnico",
    description: "Lista completa dos tópicos pedidos para este módulo.",
    icon: <FiBookOpen />,
  },
  report: {
    label: "Relatório",
    description: "Texto final exportável do módulo selecionado.",
    icon: <FiMap />,
  },
};

const GENERIC_MODULE_NOTES: Record<
  Exclude<ChineseModuleKey, "bazi" | "ziwei" | "tongshu">,
  string[]
> = {
  qimen: [
    "O momento calculado abre o tabuleiro para leitura de portas, estrelas, deidades e direção estratégica.",
    "Este módulo foi reorganizado para concentrar Ju, Fu Yin, Fan Yin, San Qi e a leitura de palácios do caso.",
    "Abaixo ficam reunidas todas as camadas técnicas pedidas para decisão, eleição e divinação.",
  ],
  daliuren: [
    "A consulta usa o momento escolhido para distribuir cursos, lições e transmissões do caso.",
    "O foco aqui é enxergar sujeito, objeto, favorabilidades e classes de lição de modo estruturado.",
    "O atlas técnico abaixo mantém juntos todos os componentes tradicionais do Da Liu Ren.",
  ],
  taiyi: [
    "O recorte temporal organiza host, guest, generais e o palácio do governante contra o palácio do evento.",
    "Este painel foi preparado para leitura mundana, clima coletivo, presságio e direção de vantagem.",
    "Toda a camada técnica do Tai Yi Shen Shu está listada logo abaixo, em blocos bem separados.",
  ],
  wenwanggua: [
    "A base temporal da consulta ancora a leitura do hexagrama, das linhas, do Yong Shen e das transformações.",
    "O módulo foi arrumado para concentrar o método de seis linhas em uma navegação mais clara.",
    "O atlas técnico abaixo reúne todos os itens pedidos para a leitura do Wen Wang Gua.",
  ],
};

const elementColor: Record<ElementName, string> = {
  Madeira: "bg-emerald-600",
  Fogo: "bg-red-600",
  Terra: "bg-amber-600",
  Metal: "bg-zinc-700",
  Agua: "bg-sky-700",
};

const elementWash: Record<ElementName, string> = {
  Madeira: "bg-emerald-50 border-emerald-200",
  Fogo: "bg-red-50 border-red-200",
  Terra: "bg-amber-50 border-amber-200",
  Metal: "bg-zinc-50 border-zinc-200",
  Agua: "bg-sky-50 border-sky-200",
};

function buildChineseSuite(
  natalInput: BaziInput,
  partnerInput: BaziInput,
  periodInput: BaziInput,
  ziWeiPreset: ZiWeiEnginePresetId = "default-exact",
  qiMenPreset: QiMenEnginePresetId = "flying-chaibu"
): ChineseSuite {
  const natalChart = calculateBazi(natalInput, new Date(periodInput.date).getFullYear());
  const partnerChart = calculateBazi(partnerInput, new Date(periodInput.date).getFullYear());
  const periodChart = calculateBazi(periodInput, new Date(periodInput.date).getFullYear());
  const ziWeiProfile = calculateZiWeiProfile(natalInput, natalChart, {
    date: periodChart.adjusted.date,
    time: periodChart.adjusted.time,
  }, ziWeiPreset);
  const qiMenProfile = calculateQiMenProfile(periodInput, periodChart, qiMenPreset);
  const tongShu = buildTongShuReading(periodChart);

  return {
    natalChart,
    partnerChart,
    periodChart,
    ziWeiProfile,
    qiMenProfile,
    tongShu,
    reports: {
      natal: generateBaziNatalReport(natalChart),
      compatibility: generateBaziCompatibilityReport(natalChart, partnerChart),
      annual: generateBaziAnnualReport(natalChart, periodChart),
      ziwei: generateZiWeiReport(ziWeiProfile, natalChart),
      qimen: generateQiMenReport(qiMenProfile, periodChart),
      tongshu: generateTongShuReport(tongShu, periodChart),
    },
    blocks: {
      natal: buildBaziNatalBlocks(natalChart),
      compatibility: buildBaziCompatibilityBlocks(natalChart, partnerChart),
      annual: buildBaziAnnualBlocks(natalInput, natalChart, periodChart),
      ziwei: buildZiWeiBlocks(natalChart, ziWeiProfile),
      qimen: buildQiMenBlocks(qiMenProfile),
      tongshu: buildTongShuBlocks(periodChart),
    },
  };
}

function appendCatalogToReport(
  baseReport: string,
  moduleKey: ChineseModuleKey,
  leadLines: string[] = []
) {
  const sections = CHINESE_MODULE_CATALOG[moduleKey].sections;
  const parts = [baseReport];

  if (leadLines.length) {
    parts.push("", ...leadLines);
  }

  parts.push("", "ESCOPO TÉCNICO COMPLETO", "", catalogSectionsToReport(sections));

  return parts.join("\n");
}

function formatPillarSummary(chart: BaziChart) {
  return chart.pillars
    .map((pillar) => `${pillar.label}: ${pillar.ganZhi} ${pillar.animal}`)
    .join(" | ");
}

function buildCatalogModuleReport(
  moduleKey: Exclude<ChineseModuleKey, "bazi" | "ziwei" | "tongshu">,
  input: BaziInput,
  chart: BaziChart
) {
  const moduleCatalog = CHINESE_MODULE_CATALOG[moduleKey];
  const notes = GENERIC_MODULE_NOTES[moduleKey];

  return [
    moduleCatalog.reportTitle.toUpperCase(),
    "",
    `Caso: ${input.name || moduleCatalog.label}`,
    `Local: ${input.location}`,
    `Data ajustada: ${chart.adjusted.date} ${chart.adjusted.time}`,
    `Mestre do Dia do momento: ${chart.dayMaster.label}`,
    `Pilares correntes: ${formatPillarSummary(chart)}`,
    "",
    ...notes,
    "",
    "ESCOPO TÉCNICO COMPLETO",
    "",
    catalogSectionsToReport(moduleCatalog.sections),
  ].join("\n");
}

function updateInput<K extends keyof BaziInput>(
  setter: (value: BaziInput) => void,
  value: BaziInput,
  key: K,
  next: BaziInput[K]
) {
  setter({ ...value, [key]: next });
}

function MetricBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200/16 bg-white/[0.04] px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-amber-100/82">
      {label}
    </span>
  );
}

function findBlockValue(blocks: DetailBlock[], label: string, fallback = "--") {
  for (const block of blocks) {
    const item = block.items.find((entry) => entry.label === label);

    if (item) {
      return item.value;
    }
  }

  return fallback;
}

function InsightStrip({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={`${item.label}-${item.value}`}
          className="rounded-2xl border border-stone-200 bg-white/92 p-4 shadow-sm"
        >
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-red-800">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
            {item.value}
          </p>
        </article>
      ))}
    </section>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-amber-100/70">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left text-xs font-bold transition ${
        checked
          ? "border-amber-300/50 bg-amber-200/14 text-amber-50"
          : "border-amber-200/14 bg-white/[0.03] text-amber-100/78 hover:border-amber-200/28"
      }`}
    >
      <span>{label}</span>
      <span
        className={`h-4 w-7 rounded-full border p-0.5 ${
          checked ? "border-amber-100/55 bg-amber-100/20" : "border-amber-200/18 bg-white/[0.04]"
        }`}
      >
        <span
          className={`block h-2.5 w-2.5 rounded-full bg-current transition ${
            checked ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function ChineseForm({
  title,
  value,
  onChange,
  nameLabel = "Nome",
}: {
  title: string;
  value: BaziInput;
  onChange: (nextValue: BaziInput) => void;
  nameLabel?: string;
}) {
  return (
    <section className="rounded-[1.6rem] border border-amber-200/14 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-amber-200/84">
            {title}
          </p>
          <h2 className="mt-1 text-xl font-black text-amber-50">
            {value.name || "Sem rótulo"}
          </h2>
        </div>
        <FiCompass className="text-amber-100/70" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={nameLabel} icon={<FiUser />}>
          <input
            value={value.name}
            onChange={(event) => updateInput(onChange, value, "name", event.target.value)}
            className="bazi-input"
          />
        </Field>

        <Field label="Gênero" icon={<FiStar />}>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as Gender[]).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => updateInput(onChange, value, "gender", gender)}
                className={`min-h-11 rounded-2xl border px-3 text-sm font-bold transition ${
                  value.gender === gender
                    ? "border-amber-300/50 bg-amber-200/14 text-amber-50"
                    : "border-amber-200/14 bg-white/[0.03] text-amber-100/78 hover:border-amber-200/28"
                }`}
              >
                {gender === "male" ? "Homem" : "Mulher"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Escola / linha" icon={<FiLayers />}>
          <select
            value={value.schoolMode}
            onChange={(event) =>
              updateInput(onChange, value, "schoolMode", event.target.value as BaziSchoolMode)
            }
            className="bazi-input"
          >
            {BAZI_SCHOOL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Data" icon={<FiCalendar />}>
          <input
            type="date"
            value={value.date}
            onChange={(event) => updateInput(onChange, value, "date", event.target.value)}
            className="bazi-input"
          />
        </Field>

        <Field label="Hora" icon={<FiClock />}>
          <input
            type="time"
            value={value.time}
            disabled={value.unknownTime}
            onChange={(event) => updateInput(onChange, value, "time", event.target.value)}
            className="bazi-input disabled:opacity-45"
          />
        </Field>
      </div>

      <div className="mt-4">
        <LocationAutocomplete
          value={
            value.location
              ? {
                  name: value.location,
                  city: value.location.split(",")[0] ?? value.location,
                  region: "",
                  country: "",
                  latitude: value.latitude,
                  longitude: value.longitude,
                  utcOffset: value.utcOffset,
                }
              : undefined
          }
          onSelect={(location) => {
            if (!location) {
              return;
            }

            onChange({
              ...value,
              location: location.name ?? "",
              latitude: location.latitude,
              longitude: location.longitude,
              utcOffset: location.utcOffset,
            });
          }}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_10rem]">
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle
            label="Hora desconhecida"
            checked={value.unknownTime}
            onChange={(next) => updateInput(onChange, value, "unknownTime", next)}
          />
          <Toggle
            label="Hora solar real"
            checked={value.solarTime}
            onChange={(next) => updateInput(onChange, value, "solarTime", next)}
          />
          <Toggle
            label="Dia começa 23:00"
            checked={value.dayStartsAt23}
            onChange={(next) => updateInput(onChange, value, "dayStartsAt23", next)}
          />
        </div>

        <Field label="UTC" icon={<FiSun />}>
          <input
            type="number"
            step="0.5"
            value={value.utcOffset}
            onChange={(event) =>
              updateInput(onChange, value, "utcOffset", Number(event.target.value))
            }
            className="bazi-input"
          />
        </Field>
      </div>
    </section>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const stemMeta = getStemMeta(pillar.stem);

  return (
    <article
      className={`flex h-full flex-col rounded-[1.6rem] border p-4 shadow-sm ${elementWash[pillar.stemElement]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-stone-500">
            {pillar.label}
          </p>
          <p className="mt-1 text-xs font-bold text-stone-600">{pillar.tenGod}</p>
        </div>
        <span className="rounded-md border border-current/20 bg-white/70 px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-stone-600">
          {stemMeta?.polarity}
        </span>
      </div>

      <div className="my-5 text-center">
        <div className="font-serif text-5xl leading-none text-stone-950 sm:text-6xl">{pillar.stem}</div>
        <div className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-stone-700">
          {stemMeta?.label}
        </div>
        <div className="mt-4 font-serif text-4xl leading-none text-stone-950 sm:text-5xl">{pillar.branch}</div>
        <div className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-600">
          {pillar.animal}
        </div>
      </div>

      <div className="mt-auto space-y-3 text-xs text-stone-700">
        <div>
          <p className="font-bold text-stone-950">Raizes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pillar.hiddenStems.length ? (
              pillar.hiddenStems.map((stem, index) => (
                <span
                  key={`${pillar.key}-${stem}-${index}`}
                  className="rounded-full border border-stone-300/80 bg-white/70 px-2.5 py-1 text-[0.68rem] font-semibold text-stone-700"
                >
                  {stem} {getStemMeta(stem)?.element} | {pillar.hiddenGods[index] ?? "--"}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-stone-300/80 bg-white/70 px-2.5 py-1 text-[0.68rem] font-semibold text-stone-700">
                Sem raiz escondida
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/55 p-3">
            <p className="font-bold text-stone-950">Na Yin</p>
            <p className="mt-1">{pillar.naYin}</p>
          </div>
          <div className="rounded-2xl bg-white/55 p-3">
            <p className="font-bold text-stone-950">Qi</p>
            <p className="mt-1">{pillar.qiPhase}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ElementBars({
  scores,
  title,
}: {
  scores: BaziChart["elementScores"];
  title: string;
}) {
  return (
    <section className="rounded-[1.55rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-950">{title}</h3>
        <FiActivity className="text-red-800" />
      </div>
      <div className="space-y-3">
        {scores.map((score) => (
          <div key={score.element} className="rounded-2xl bg-stone-50/80 p-3">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-stone-700">
              <span>
                {score.element} | {score.role}
              </span>
              <span>{score.percent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-stone-200/80">
              <div
                className={`h-2.5 rounded-full ${elementColor[score.element]}`}
                style={{ width: `${Math.max(4, score.percent)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LuckCycles({ chart }: { chart: BaziChart }) {
  return (
    <section className="rounded-[1.55rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-950">Da Yun</h3>
        {chart.currentLuck ? (
          <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-white">
            Atual {chart.currentLuck.startYear}-{chart.currentLuck.endYear}
          </span>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {chart.luckCycles.map((cycle) => (
          <div
            key={`${cycle.startYear}-${cycle.ganZhi}`}
            className={`rounded-2xl border p-4 ${
              cycle.active ? "border-red-300 bg-red-50" : "border-stone-200 bg-stone-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-4xl leading-none text-stone-950">{cycle.ganZhi}</p>
                <p className="mt-1 text-xs font-bold text-stone-600">
                  {cycle.startYear}-{cycle.endYear}
                </p>
              </div>
              <span className="text-right text-xs font-bold text-stone-600">
                {getStemMeta(cycle.stem)?.element}
                <br />
                {getAnimal(cycle.branch)}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-red-800">
              {cycle.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PillarReadings({ blocks }: { blocks: DetailBlock[] }) {
  const cards = [
    {
      title: "Pilar do Ano",
      technical: findBlockValue(blocks, "Pilar do Ano"),
      reference: findBlockValue(blocks, "Referencia tecnica do Pilar do Ano"),
    },
    {
      title: "Pilar do Mes",
      technical: findBlockValue(blocks, "Pilar do Mes"),
      reference: findBlockValue(blocks, "Referencia tecnica do Pilar do Mes"),
    },
    {
      title: "Pilar do Dia",
      technical: findBlockValue(blocks, "Pilar do Dia"),
      reference: `${findBlockValue(blocks, "Referencia tecnica do Pilar do Dia")} Palacio do Conjuge: ${findBlockValue(blocks, "Palacio do Conjuge")}.`,
    },
    {
      title: "Pilar da Hora",
      technical: findBlockValue(blocks, "Pilar da Hora"),
      reference: `${findBlockValue(blocks, "Referencia tecnica do Pilar da Hora")} Tai Yuan / Ming Gong / Shen Gong: ${findBlockValue(blocks, "Tai Yuan")} | ${findBlockValue(blocks, "Ming Gong")} | ${findBlockValue(blocks, "Shen Gong")}.`,
    },
  ];

  return (
    <section className="rounded-[1.6rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
            Referencia por pilar
          </p>
          <h3 className="mt-2 text-xl font-black text-stone-950">
            Quadro tecnico de cada posicao
          </h3>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-600">
          Ano, mes, dia e hora
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-[1.45rem] border border-stone-200 bg-stone-50/80 p-4"
          >
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
              {card.title}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-stone-800">
              {card.technical}
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-600">{card.reference}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TechnicalBlocks({ blocks }: { blocks: DetailBlock[] }) {
  return (
    <section className="grid gap-4 2xl:grid-cols-2">
      {blocks.map((block) => (
        <article
          key={block.title}
          className="rounded-[1.6rem] border border-stone-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-950">
            {block.title}
          </h3>

          <div className="mt-4 space-y-3">
            {block.items.map((item) => (
              <div
                key={`${block.title}-${item.label}`}
                className="grid min-w-0 gap-2 rounded-2xl border border-stone-100 bg-stone-50/90 p-3 xl:grid-cols-[13rem_minmax(0,1fr)]"
              >
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-red-800">
                  {item.label}
                </p>
                <p className="break-words text-sm leading-6 text-stone-700">{item.value}</p>
              </div>
            ))}
          </div>

          {block.bullets?.length ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-stone-600">
              {block.bullets.map((bullet) => (
                <p key={`${block.title}-${bullet}`} className="leading-6">
                  {bullet}
                </p>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function QiMenPalaceCard({ palace }: { palace: QiMenProfile["gridPalaces"][number] }) {
  return (
    <article className="rounded-[1.45rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-sky-800">
            {palace.label}
          </p>
          <p className="mt-1 text-xs font-bold text-stone-500">
            {palace.direction} • {palace.bagua} • {palace.wangShuai}
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-600">
          {palace.number}
        </span>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-stone-50/90 p-3 text-sm text-stone-700">
        <p>
          <span className="font-black text-stone-950">Porta:</span> {palace.men}
        </p>
        <p>
          <span className="font-black text-stone-950">Estrela:</span> {palace.xing}
        </p>
        <p>
          <span className="font-black text-stone-950">Deidade:</span> {palace.tianPanShen}
        </p>
        <p>
          <span className="font-black text-stone-950">Ceu/Terra:</span> {palace.tianPanGan} / {palace.diPanGan}
        </p>
        <p>
          <span className="font-black text-stone-950">An Gan/Zhi:</span> {palace.anGan} / {palace.anZhi}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-stone-600">
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">
          Ma Xing {palace.maXing ? "sim" : "nao"}
        </span>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">
          Gong Kong {palace.gongKong ? "sim" : "nao"}
        </span>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">
          Yi Kong {palace.tianPanYiKong || palace.diPanYiKong ? "sim" : "nao"}
        </span>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">
          Tian Jia {palace.cangTianPanJia ? "sim" : "nao"}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-xs leading-5 text-stone-500">
        <p>
          Liu Qin céu/terra {palace.tianPanGanLiuQin}/{palace.diPanGanLiuQin} • Shi Shen céu/terra{" "}
          {palace.tianPanGanShiShen}/{palace.diPanGanShiShen}
        </p>
        <p>长生 céu {palace.tianPanGanZhangSheng} • 长生 terra {palace.diPanGanZhangSheng}</p>
        <p>
          正格: {palace.zhengGeNames.join(" / ") || "--"} • 附格: {palace.fuGe.activeNames.join(" / ") || "--"}
        </p>
        <p>神煞: {palace.shenShaNames.slice(0, 4).join(" / ") || "--"}</p>
      </div>
    </article>
  );
}

function TopicAtlas({
  sections,
  moduleKey,
}: {
  sections: ChineseCatalogSection[];
  moduleKey: ChineseModuleKey;
}) {
  const ui = MODULE_UI_META[moduleKey];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-eyebrow">Atlas Técnico</p>
          <h2 className="section-title mt-2 text-3xl font-semibold text-amber-50">
            Tudo o que entra neste módulo
          </h2>
          <p className="section-copy mt-2 max-w-3xl text-sm">
            Organizei os tópicos pedidos em blocos legíveis para você navegar sem perder nenhuma
            camada da técnica.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricBadge label={`${sections.length} blocos`} />
          <MetricBadge label={`${sections.reduce((sum, section) => sum + section.topics.length, 0)} tópicos`} />
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className="panel-surface overflow-hidden rounded-[1.7rem] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="section-eyebrow">{section.title}</p>
                <p className="section-copy mt-2 text-sm">{section.description}</p>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.18em] ${ui.chipClass}`}
              >
                {section.topics.length} itens
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {section.topics.map((topic) => (
                <span
                  key={`${section.title}-${topic}`}
                  className="rounded-full border border-amber-200/14 bg-white/[0.04] px-3 py-1.5 text-[0.76rem] font-semibold text-amber-50/86"
                >
                  {topic}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeModuleCard({
  moduleKey,
  onSelect,
}: {
  moduleKey: ChineseModuleKey;
  onSelect: (moduleKey: ChineseModuleKey) => void;
}) {
  const moduleCatalog = CHINESE_MODULE_CATALOG[moduleKey];
  const ui = MODULE_UI_META[moduleKey];
  const topics = flattenModuleTopics(moduleKey).slice(0, 5);

  return (
    <button
      type="button"
      onClick={() => onSelect(moduleKey)}
      className="chinese-home-card group panel-surface relative overflow-hidden rounded-[1.9rem] p-6 text-left transition duration-200 hover:-translate-y-1"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,211,138,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(150,41,41,0.12),transparent_30%)] opacity-80"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-xl ${ui.toneClass}`}>
            {ui.icon}
          </div>
          <MetricBadge label={`${getModuleTopicCount(moduleKey)} tópicos`} />
        </div>

        <div className="mt-6">
          <p className="section-eyebrow">{ui.kicker}</p>
          <h2 className="section-title mt-2 text-3xl font-semibold text-amber-50">
            {moduleCatalog.label}
          </h2>
          <p className="section-copy mt-3 text-sm">{moduleCatalog.shortDescription}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {ui.preview.map((item) => (
            <span
              key={item}
              className={`rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] ${ui.chipClass}`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-6 h-px bg-gradient-to-r from-amber-200/35 to-transparent" />

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-amber-50/78">
          {topics.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function ConsultationSpotlight({
  moduleKey,
  chart,
  location,
}: {
  moduleKey: Exclude<ChineseModuleKey, "bazi" | "ziwei" | "tongshu">;
  chart: BaziChart;
  location: string;
}) {
  const notes = GENERIC_MODULE_NOTES[moduleKey];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <article className="panel-surface rounded-[1.7rem] p-5">
          <p className="section-eyebrow">Momento da Consulta</p>
          <h2 className="section-title mt-3 text-3xl font-semibold text-amber-50">
            {chart.adjusted.date}
          </h2>
          <p className="mt-2 text-sm text-amber-100/76">
            {chart.adjusted.time} • {location}
          </p>
          <div className="gold-divider mt-5" />
          <div className="mt-5 space-y-3 text-sm text-amber-50/80">
            {notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {chart.pillars.map((pillar) => (
            <PillarCard key={pillar.key} pillar={pillar} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ElementBars scores={chart.elementScores} title="Pulso elemental do momento" />

        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-950">
            Resumo temporal
          </h3>
          <div className="mt-4 space-y-2 text-sm text-stone-600">
            {chart.summary.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
            <p>Mestre do Dia: {chart.dayMaster.label}</p>
            <p className="mt-2">Pilares: {formatPillarSummary(chart)}</p>
          </div>
        </article>
      </section>
    </div>
  );
}

export default function ChineseAstrologyApp() {
  const [screen, setScreen] = useState<"home" | "module">("home");
  const [activeModule, setActiveModule] = useState<ChineseModuleKey>("bazi");
  const [baziView, setBaziView] = useState<BaziViewKey>("natal");
  const [activePanel, setActivePanel] = useState<ModulePanelKey>("analysis");
  const [natalInput, setNatalInput] = useState(primarySeed);
  const [partnerInput, setPartnerInput] = useState(partnerSeed);
  const [periodInput, setPeriodInput] = useState(periodSeed);
  const [ziWeiPreset, setZiWeiPreset] = useState<ZiWeiEnginePresetId>("default-exact");
  const [qiMenPreset, setQiMenPreset] = useState<QiMenEnginePresetId>("flying-chaibu");
  const [suite, setSuite] = useState<ChineseSuite>(() =>
    buildChineseSuite(primarySeed, partnerSeed, periodSeed, "default-exact", "flying-chaibu")
  );

  const activeCatalog = CHINESE_MODULE_CATALOG[activeModule];
  const activeUi = MODULE_UI_META[activeModule];
  const activePreviewTopics = useMemo(
    () => flattenModuleTopics(activeModule).slice(0, 8),
    [activeModule]
  );
  const combinedScores = useMemo(
    () => mergeElementScores([suite.natalChart, suite.partnerChart]),
    [suite]
  );

  const moduleReport = useMemo(() => {
    if (activeModule === "bazi") {
      if (baziView === "compatibility") {
        return appendCatalogToReport(suite.reports.compatibility, "bazi", [
          "A sinastria BaZi está concentrada dentro do próprio módulo BaZi, como você pediu.",
        ]);
      }

      if (baziView === "cycles") {
        return appendCatalogToReport(suite.reports.annual, "bazi", [
          "Este recorte reúne Da Yun, Xiao Yun, Liu Nian, Liu Yue, Liu Ri e Liu Shi dentro do BaZi.",
        ]);
      }

      return appendCatalogToReport(suite.reports.natal, "bazi");
    }

    if (activeModule === "ziwei") {
      return appendCatalogToReport(suite.reports.ziwei, "ziwei");
    }

    if (activeModule === "qimen") {
      return appendCatalogToReport(suite.reports.qimen, "qimen", [
        "O Qi Men Dun Jia agora usa tabuleiro real de nove palacios, com portas, estrelas, deidades, ceu, terra, vazio, ma xing, zheng ge e Shen Sha.",
      ]);
    }

    if (activeModule === "tongshu") {
      return appendCatalogToReport(suite.reports.tongshu, "tongshu");
    }

    return buildCatalogModuleReport(activeModule, periodInput, suite.periodChart);
  }, [activeModule, baziView, periodInput, suite]);

  const reportTitle =
    activeModule === "bazi"
      ? BAZI_VIEW_META[baziView].reportTitle
      : activeCatalog.reportTitle;

  const reportDescription =
    activeModule === "bazi"
      ? BAZI_VIEW_META[baziView].reportDescription
      : `${activeCatalog.longDescription} O relatório abaixo já traz o atlas técnico completo do módulo.`;

  const reportFilename =
    activeModule === "bazi"
      ? `lemathastro-bazi-${baziView}.txt`
      : `lemathastro-${activeModule}.txt`;

  const reportJsonData = useMemo(() => {
    const common = {
      module: activeModule,
      topics: flattenModuleTopics(activeModule),
      report: moduleReport,
    };

    if (activeModule === "bazi") {
      if (baziView === "compatibility") {
        return {
          ...common,
          view: baziView,
          chartA: suite.natalChart,
          chartB: suite.partnerChart,
          blocks: suite.blocks.compatibility,
        };
      }

      if (baziView === "cycles") {
        return {
          ...common,
          view: baziView,
          natalChart: suite.natalChart,
          periodChart: suite.periodChart,
          blocks: suite.blocks.annual,
        };
      }

      return {
        ...common,
        view: baziView,
        chart: suite.natalChart,
        blocks: suite.blocks.natal,
      };
    }

    if (activeModule === "ziwei") {
      return {
        ...common,
        chart: suite.natalChart,
        profile: suite.ziWeiProfile,
        blocks: suite.blocks.ziwei,
      };
    }

    if (activeModule === "qimen") {
      return {
        ...common,
        chart: suite.periodChart,
        profile: suite.qiMenProfile,
        blocks: suite.blocks.qimen,
      };
    }

    if (activeModule === "tongshu") {
      return {
        ...common,
        chart: suite.periodChart,
        reading: suite.tongShu,
        blocks: suite.blocks.tongshu,
      };
    }

    return {
      ...common,
      input: periodInput,
      chart: suite.periodChart,
    };
  }, [activeModule, baziView, moduleReport, periodInput, suite]);

  const moduleForm =
    activeModule === "bazi"
      ? {
          natal: (
            <ChineseForm title="Mapa natal" value={natalInput} onChange={setNatalInput} />
          ),
          compatibility: (
            <>
              <ChineseForm title="Pessoa A" value={natalInput} onChange={setNatalInput} />
              <ChineseForm title="Pessoa B" value={partnerInput} onChange={setPartnerInput} />
            </>
          ),
          cycles: (
            <>
              <ChineseForm title="Mapa natal" value={natalInput} onChange={setNatalInput} />
              <ChineseForm
                title="Período analisado"
                value={periodInput}
                onChange={setPeriodInput}
                nameLabel="Rótulo do período"
              />
            </>
          ),
        }[baziView]
      : activeModule === "ziwei"
        ? (
          <>
            <ChineseForm title="Perfil natal" value={natalInput} onChange={setNatalInput} />
            <section className="rounded-2xl border border-amber-200/12 bg-white/[0.04] p-4">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-amber-100/78">
                Preset do Zi Wei
              </p>
              <select
                value={ziWeiPreset}
                onChange={(event) => setZiWeiPreset(event.target.value as ZiWeiEnginePresetId)}
                className="mt-3 w-full rounded-2xl border border-amber-200/20 bg-stone-950/55 px-4 py-3 text-sm text-amber-50 outline-none transition focus:border-amber-200/40"
              >
                {ZIWEI_PRESET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-stone-950 text-amber-50">
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-sm leading-6 text-amber-100/70">
                {ZIWEI_ENGINE_PRESETS[ziWeiPreset].description}
              </p>
            </section>
          </>
        )
        : activeModule === "qimen"
          ? (
            <>
              <ChineseForm
                title="Consulta Qi Men"
                value={periodInput}
                onChange={setPeriodInput}
                nameLabel="Caso ou foco"
              />
              <section className="rounded-2xl border border-amber-200/12 bg-white/[0.04] p-4">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-amber-100/78">
                  Preset do Qi Men
                </p>
                <select
                  value={qiMenPreset}
                  onChange={(event) => setQiMenPreset(event.target.value as QiMenEnginePresetId)}
                  className="mt-3 w-full rounded-2xl border border-amber-200/20 bg-stone-950/55 px-4 py-3 text-sm text-amber-50 outline-none transition focus:border-amber-200/40"
                >
                  {QIMEN_PRESET_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-stone-950 text-amber-50">
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-3 text-sm leading-6 text-amber-100/70">
                  {QIMEN_ENGINE_PRESETS[qiMenPreset].description}
                </p>
              </section>
            </>
          )
        : <ChineseForm
            title={activeModule === "tongshu" ? "Dia de consulta" : "Consulta base"}
            value={periodInput}
            onChange={setPeriodInput}
            nameLabel={activeModule === "tongshu" ? "Rótulo do dia" : "Caso ou foco"}
          />;

  const moduleActionLabel =
    activeModule === "bazi"
      ? BAZI_VIEW_META[baziView].actionLabel
      : activeCatalog.actionLabel;

  const moduleContent =
    activeModule === "bazi"
      ? {
          natal: (
            <div className="space-y-4">
              <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                  {suite.natalChart.pillars.map((pillar) => (
                    <PillarCard key={pillar.key} pillar={pillar} />
                  ))}
                </div>
                <div className="grid content-start gap-4">
                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-red-800">
                      Mestre do Dia
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-stone-950">
                      {suite.natalChart.dayMaster.label}
                    </h2>
                    <p className="mt-3 text-sm text-stone-600">
                      Força {suite.natalChart.dayMaster.strength}% | {suite.natalChart.dayMaster.tone}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      {[
                        findBlockValue(suite.blocks.natal, "Forca do Mestre do Dia"),
                        findBlockValue(suite.blocks.natal, "Raiz dos Troncos / Tong Gen"),
                        findBlockValue(suite.blocks.natal, "Estrutura do mapa"),
                        `Yong Shen ${findBlockValue(suite.blocks.natal, "Yong Shen")} | Xi Shen ${findBlockValue(suite.blocks.natal, "Xi Shen")}`,
                      ].map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </section>
                  <ElementBars scores={suite.natalChart.elementScores} title="Elementos do mapa" />
                </div>
              </section>
              <InsightStrip
                items={[
                  {
                    label: "Yue Ling",
                    value: findBlockValue(suite.blocks.natal, "Mes de comando / Yue Ling"),
                  },
                  {
                    label: "Estrutura",
                    value: findBlockValue(suite.blocks.natal, "Estrutura do mapa"),
                  },
                  {
                    label: "Yong Shen",
                    value: findBlockValue(suite.blocks.natal, "Yong Shen"),
                  },
                  {
                    label: "Integridade",
                    value: findBlockValue(suite.blocks.natal, "Integridade da estrutura"),
                  },
                  {
                    label: "Confianca",
                    value: findBlockValue(suite.blocks.natal, "Confianca estrutural"),
                  },
                  {
                    label: "Clima",
                    value: findBlockValue(suite.blocks.natal, "Equilibrio climatico"),
                  },
                  {
                    label: "Apoio do Mestre",
                    value: `${suite.natalChart.analysis.strength.supportiveShare}% apoio | ${suite.natalChart.analysis.strength.hostileShare}% desgaste`,
                  },
                  {
                    label: "Raiz do Mestre",
                    value: findBlockValue(suite.blocks.natal, "Raiz dos Troncos / Tong Gen"),
                  },
                  {
                    label: "Transformacao",
                    value: findBlockValue(
                      suite.blocks.natal,
                      "Condicoes para transformacao verdadeira"
                    ),
                  },
                  {
                    label: "Catalogo simbolico",
                    value: findBlockValue(suite.blocks.natal, "Shen Sha / estrelas simbolicas"),
                  },
                ]}
              />
              <PillarReadings blocks={suite.blocks.natal} />
              <LuckCycles chart={suite.natalChart} />
              <TechnicalBlocks blocks={suite.blocks.natal} />
            </div>
          ),
          compatibility: (
            <div className="space-y-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="grid gap-3 md:grid-cols-2">
                  {[suite.natalChart, suite.partnerChart].map((chart) => (
                    <article
                      key={chart.input.name}
                      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-red-800">
                        {chart.input.name}
                      </p>
                      <h3 className="mt-3 text-2xl font-black text-stone-950">
                        {chart.dayMaster.label}
                      </h3>
                      <p className="mt-2 text-sm text-stone-600">
                        {chart.pillars.find((pillar) => pillar.key === "day")?.animal} |{" "}
                        {chart.dayMaster.tone}
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-stone-600">
                        {chart.summary.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </article>
                  ))}
                </section>

                <div className="grid gap-4">
                  <ElementBars scores={combinedScores} title="Soma dos elementos" />
                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-950">
                      Pulso da relação
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      <p>{findBlockValue(suite.blocks.compatibility, "Fator harmonico do par")}</p>
                      <p>{findBlockValue(suite.blocks.compatibility, "Fator de tensao do par")}</p>
                      <p>{findBlockValue(suite.blocks.compatibility, "Ponte de conciliacao do par")}</p>
                      <p>{findBlockValue(suite.blocks.compatibility, "Tom simbolico do par")}</p>
                      <p>{findBlockValue(suite.blocks.compatibility, "Ajuste mutuo de Yong Shen")}</p>
                      <p>{findBlockValue(suite.blocks.compatibility, "Estado estrutural do vinculo")}</p>
                    </div>
                  </section>
                </div>
              </div>

              <InsightStrip
                items={[
                  {
                    label: "Eixo elemental",
                    value: findBlockValue(suite.blocks.compatibility, "Mesma natureza elementar"),
                  },
                  {
                    label: "Dominante A",
                    value: findBlockValue(suite.blocks.compatibility, "Elemento mais forte de A"),
                  },
                  {
                    label: "Dominante B",
                    value: findBlockValue(suite.blocks.compatibility, "Elemento mais forte de B"),
                  },
                  {
                    label: "Yong Shen do par",
                    value: `${findBlockValue(suite.blocks.compatibility, "Yong Shen provavel de A")} | ${findBlockValue(suite.blocks.compatibility, "Yong Shen provavel de B")}`,
                  },
                  {
                    label: "Apoio cruzado",
                    value: findBlockValue(suite.blocks.compatibility, "Favorabilidade cruzada"),
                  },
                  {
                    label: "Tensao cruzada",
                    value: findBlockValue(suite.blocks.compatibility, "Pressao cruzada"),
                  },
                  {
                    label: "Fator harmonico",
                    value: findBlockValue(suite.blocks.compatibility, "Fator harmonico do par"),
                  },
                  {
                    label: "Fator de tensao",
                    value: findBlockValue(suite.blocks.compatibility, "Fator de tensao do par"),
                  },
                  {
                    label: "Ponte tecnica",
                    value: findBlockValue(
                      suite.blocks.compatibility,
                      "Ponte de conciliacao do par"
                    ),
                  },
                  {
                    label: "Catalogo simbolico",
                    value: findBlockValue(suite.blocks.compatibility, "Tom simbolico do par"),
                  },
                  {
                    label: "Estado estrutural",
                    value: findBlockValue(suite.blocks.compatibility, "Estado estrutural do vinculo"),
                  },
                  {
                    label: "Yong mutuo",
                    value: findBlockValue(suite.blocks.compatibility, "Ajuste mutuo de Yong Shen"),
                  },
                ]}
              />
              <TechnicalBlocks blocks={suite.blocks.compatibility} />
            </div>
          ),
          cycles: (
            <div className="space-y-4">
              <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {suite.periodChart.pillars.map((pillar) => (
                    <PillarCard key={pillar.key} pillar={pillar} />
                  ))}
                </section>

                <div className="grid content-start gap-4">
                  <ElementBars scores={suite.periodChart.elementScores} title="Elementos do período" />
                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-950">
                      Direção temporal
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      <p>{findBlockValue(suite.blocks.annual, "Sentido do Yun")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Metodo do Yun")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Jie usado como referencia")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Distancia tecnica ate o primeiro Yun")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Pulso do periodo")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Estrutura do periodo")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Integridade do periodo")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Logica do Yong do periodo")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Saldo tecnico do periodo")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Temas simbolicos do periodo")}</p>
                      <p>{findBlockValue(suite.blocks.annual, "Resgate estrutural do periodo")}</p>
                    </div>
                  </section>
                </div>
              </section>

              <InsightStrip
                items={[
                  {
                    label: "Da Yun",
                    value: findBlockValue(suite.blocks.annual, "Da Yun"),
                  },
                  {
                    label: "Liu Nian",
                    value: findBlockValue(suite.blocks.annual, "Liu Nian"),
                  },
                  {
                    label: "Natal + Liu Nian",
                    value: findBlockValue(suite.blocks.annual, "Mapa natal + Liu Nian"),
                  },
                  {
                    label: "Da Yun + Liu Nian",
                    value: findBlockValue(suite.blocks.annual, "Da Yun + Liu Nian"),
                  },
                  {
                    label: "Pulso do periodo",
                    value: findBlockValue(suite.blocks.annual, "Pulso do periodo"),
                  },
                  {
                    label: "Saldo tecnico",
                    value: findBlockValue(suite.blocks.annual, "Saldo tecnico do periodo"),
                  },
                  {
                    label: "Favorece o natal",
                    value: findBlockValue(suite.blocks.annual, "Transito favorece o natal"),
                  },
                  {
                    label: "Pressiona o natal",
                    value: findBlockValue(suite.blocks.annual, "Transito pressiona o natal"),
                  },
                  {
                    label: "Yong do periodo",
                    value: findBlockValue(suite.blocks.annual, "Yong Shen do periodo"),
                  },
                  {
                    label: "Yong do natal",
                    value: findBlockValue(suite.blocks.annual, "Yong do natal ativado no periodo"),
                  },
                  {
                    label: "Resgate estrutural",
                    value: findBlockValue(suite.blocks.annual, "Resgate estrutural do periodo"),
                  },
                  {
                    label: "Atrito estrutural",
                    value: findBlockValue(suite.blocks.annual, "Atrito estrutural do periodo"),
                  },
                  {
                    label: "Catalogo simbolico",
                    value: findBlockValue(suite.blocks.annual, "Shen Sha do periodo"),
                  },
                  {
                    label: "Integridade",
                    value: findBlockValue(suite.blocks.annual, "Integridade do periodo"),
                  },
                  {
                    label: "Estrutura",
                    value: findBlockValue(suite.blocks.annual, "Estrutura do periodo"),
                  },
                ]}
              />
              <LuckCycles chart={suite.natalChart} />
              <TechnicalBlocks blocks={suite.blocks.annual} />
            </div>
          ),
        }[baziView]
      : activeModule === "ziwei"
        ? (
          <div className="space-y-4">
            <section className="grid gap-4 xl:grid-cols-[18rem_1fr]">
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-red-800">
                  Eixo Zi Wei
                </p>
                <h2 className="mt-2 text-2xl font-black text-stone-950">
                  {suite.ziWeiProfile.mingPalaceName}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Ming Gong em {suite.ziWeiProfile.mingGong}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  Shen Gong em {suite.ziWeiProfile.shenGong}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  命主 {suite.ziWeiProfile.soulStar} • 身主 {suite.ziWeiProfile.bodyStar}
                </p>
                <div className="mt-4 space-y-2 text-sm text-stone-600">
                  {suite.ziWeiProfile.summary.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </article>

              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {[
                    {
                      label: "Bureau",
                      value: suite.ziWeiProfile.fiveElementBureau,
                    },
                    {
                      label: "Zi Wei",
                      value: suite.ziWeiProfile.ziweiStarBranch,
                    },
                    {
                      label: "Catalogo",
                      value: `>= ${suite.ziWeiProfile.coverage.expectedFloor} | local ${suite.ziWeiProfile.coverage.libraryEstimatedStarCount}`,
                    },
                    {
                      label: "Preset",
                      value: suite.ziWeiProfile.enginePreset.label,
                    },
                    {
                      label: "Grande periodo",
                      value: `${suite.ziWeiProfile.currentDecadePalace} | ${suite.ziWeiProfile.currentDecadeRange}`,
                    },
                  ].map((item) => (
                    <article
                      key={item.label}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
                        {item.label}
                      </p>
                      <p className="mt-3 text-sm font-semibold leading-6 text-stone-900">
                        {item.value}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {suite.ziWeiProfile.palaceHighlights.map((palace) => (
                    <article
                      key={`${palace.name}-${palace.branch}`}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-800">
                        {palace.name} {palace.isBodyPalace ? "• Shen Gong" : ""}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {palace.chineseName} • {palace.ganZhi} • Grande periodo {palace.ageRange}
                      </p>
                      <h3 className="mt-2 text-lg font-black text-stone-950">{palace.branch}</h3>
                      <p className="mt-3 text-sm font-semibold text-stone-900">
                        Principais: {palace.majorStars.map((star) => star.name).join(" / ") || "--"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Auxiliares: {palace.minorStars.map((star) => star.name).join(" / ") || "--"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Adjetivas: {palace.adjectiveStars.map((star) => star.name).join(" / ") || "--"}
                      </p>
                      <p className="mt-3 text-sm text-stone-600">{palace.headline}</p>
                      <p className="mt-3 text-xs leading-5 text-stone-500">
                        四化: {palace.yearTransformations.join(" / ") || "--"} | 自化:{" "}
                        {palace.selfTransformations.join(" / ") || "--"} | 飞化:{" "}
                        {palace.flyingStars.join(" / ") || "--"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        12长生: {palace.changsheng12} | 博士: {palace.boshi12} | 将前: {palace.jiangqian12} |
                        岁前: {palace.suiqian12}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        三方四正: {palace.surroundedPalaces.join(" | ") || "--"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        Oposto: {palace.oppositePalace} | riqueza-axis: {palace.wealthAxisPalace} |
                        carreira-axis: {palace.careerAxisPalace}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        飞化 p/ oposto {palace.fliesToOpposite ? "sim" : "nao"} | riqueza{" "}
                        {palace.fliesToWealth ? "sim" : "nao"} | carreira{" "}
                        {palace.fliesToCareer ? "sim" : "nao"} | 自化{" "}
                        {palace.selfTransformations.length ? "sim" : "nao"} | 空宫{" "}
                        {palace.isEmpty ? "sim" : "nao"}
                      </p>
                      {palace.isEmpty ? (
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          借星: {palace.borrowedMajorStars.join(" / ") || "--"} | origem {palace.oppositePalace}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
                      三方四正
                    </p>
                    <div className="mt-4 space-y-4">
                      {suite.ziWeiProfile.trineHighlights.map((trine) => (
                        <article key={trine.title} className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-stone-950">
                            {trine.title}
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-stone-900">{trine.targetPalace}</p>
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            {trine.members.join(" | ")}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            {trine.starDigest.join(" || ")}
                          </p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
                      Relações de palácio
                    </p>
                    <div className="mt-4 space-y-4">
                      {suite.ziWeiProfile.relationHighlights.map((relation) => (
                        <article
                          key={relation.title}
                          className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                        >
                          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-stone-950">
                            {relation.title}
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-stone-900">
                            {relation.palace}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            Oposto: {relation.oppositePalace} | riqueza: {relation.wealthPalace} |
                            carreira: {relation.careerPalace}
                          </p>
                          <div className="mt-2 space-y-1 text-xs leading-5 text-stone-500">
                            <p>
                              飞化: {relation.flyTargets.join(" / ") || "--"} | 自化{" "}
                              {relation.selfMutaged ? "sim" : "nao"} | 空宫{" "}
                              {relation.isEmpty ? "sim" : "nao"}
                            </p>
                            <p>
                              Voa p/ oposto {relation.fliesToOpposite ? "sim" : "nao"} | riqueza{" "}
                              {relation.fliesToWealth ? "sim" : "nao"} | carreira{" "}
                              {relation.fliesToCareer ? "sim" : "nao"}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
                      Camadas temporais
                    </p>
                    <div className="mt-4 space-y-4">
                      {suite.ziWeiProfile.horoscopeLayers.map((layer) => (
                        <article key={layer.scope} className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-stone-950">
                            {layer.label} {layer.ganZhi}
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-stone-900">
                            {layer.activePalace} {layer.activePalaceGanZhi} =&gt; {layer.rolePalace}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            四化: {layer.mutagen.join(" / ") || "--"} | estrelas dinâmicas {layer.starCount}
                          </p>
                          <div className="mt-2 space-y-1 text-xs leading-5 text-stone-500">
                            {layer.starLines.slice(0, 4).map((line) => (
                              <p key={`${layer.scope}-${line}`}>{line}</p>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
                      Relações temporais
                    </p>
                    <div className="mt-4 space-y-4">
                      {suite.ziWeiProfile.horoscopeLayers.map((layer) => {
                        const relations = suite.ziWeiProfile.temporalRelationHighlights.filter(
                          (entry) => entry.scope === layer.scope
                        );

                        return (
                          <article
                            key={`relation-${layer.scope}`}
                            className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                          >
                            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-stone-950">
                              {layer.label} {layer.ganZhi}
                            </h3>
                            <div className="mt-2 space-y-2 text-xs leading-5 text-stone-500">
                              {relations.map((relation) => (
                                <div key={`${layer.scope}-${relation.palace}`} className="rounded-2xl bg-white/70 p-3">
                                  <p className="font-semibold text-stone-800">
                                    {relation.palace} =&gt; {relation.roleAtTarget}
                                  </p>
                                  <p>
                                    Oposto {relation.oppositeRole} | riqueza {relation.wealthRole} |
                                    carreira {relation.careerRole}
                                  </p>
                                  <p>四化: {relation.mutagen.join(" / ") || "--"}</p>
                                  <p>Alvo: {relation.targetStars.join(" / ") || "--"}</p>
                                </div>
                              ))}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
                    Catálogo das estrelas observadas
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {suite.ziWeiProfile.starCatalog.length} entradas observadas no natal e nas camadas temporais do
                    preset atual.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {suite.ziWeiProfile.starCatalog.map((entry) => (
                      <article
                        key={entry.name}
                        className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                      >
                        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-stone-950">
                          {entry.name}
                        </h3>
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          Família: {entry.families.join(" / ") || "--"} | 五行 {entry.fiveElements ?? "--"} | 阴阳{" "}
                          {entry.yinYang ?? "--"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          Natal: {entry.natalPalaces.join(" | ") || "--"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          Timing: {entry.dynamicScopes.join(" | ") || "--"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          Brilho: {entry.brightnesses.join(" / ") || "--"} | 四化 {entry.mutagens.join(" / ") || "--"}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-800">
                    空宫 e 借星
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {suite.ziWeiProfile.borrowedStarProfiles.length} palácios com ficha técnica de vazio ou empréstimo
                    por oposição no preset atual.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {suite.ziWeiProfile.borrowedStarProfiles.length ? (
                      suite.ziWeiProfile.borrowedStarProfiles.map((entry) => (
                        <article
                          key={entry.palace}
                          className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                        >
                          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-stone-950">
                            {entry.palace}
                          </h3>
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            空宫: {entry.isEmpty ? "sim" : "nao"} | empresta de {entry.borrowedFrom}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            Principais emprestadas: {entry.borrowedMajorStars.join(" / ") || "--"}
                          </p>
                        </article>
                      ))
                    ) : (
                      <p className="text-sm text-stone-600">
                        Nenhum palácio vazio exigiu empréstimo técnico do oposto neste recorte.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </section>

            <TechnicalBlocks blocks={suite.blocks.ziwei} />
          </div>
        )
        : activeModule === "qimen"
          ? (
            <div className="space-y-4">
              <section className="grid gap-4 xl:grid-cols-[18rem_1fr]">
                <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-sky-800">
                    Nucleo do Ju
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-stone-950">
                    {suite.qiMenProfile.juLabel}
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">
                    {suite.qiMenProfile.enginePreset.label}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {suite.qiMenProfile.adjustedMoment}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-stone-600">
                    {suite.qiMenProfile.summary.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </article>

                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {[
                      {
                        label: "Jie Qi",
                        value: suite.qiMenProfile.jieQiWindow.currentJie,
                      },
                      {
                        label: "Zhi Fu",
                        value: `${suite.qiMenProfile.zhiFu} | ${suite.qiMenProfile.zhiFuPalace}`,
                      },
                      {
                        label: "Zhi Shi",
                        value: `${suite.qiMenProfile.zhiShi} | ${suite.qiMenProfile.zhiShiPalace}`,
                      },
                      {
                        label: "Xun Shou",
                        value: suite.qiMenProfile.xunShou,
                      },
                      {
                        label: "Huan Ju",
                        value: `${suite.qiMenProfile.huanJuActivePalaces} palacios`,
                      },
                    ].map((item) => (
                      <article
                        key={item.label}
                        className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                      >
                        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                          {item.label}
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-stone-900">
                          {item.value}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="grid gap-3 xl:grid-cols-4">
                    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-800">
                        Portas
                      </p>
                      <p className="mt-3 text-sm font-semibold text-stone-900">
                        Abertas: {suite.qiMenProfile.canonicalDoorHighlights.open.join(" | ") || "--"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        Cautela: {suite.qiMenProfile.canonicalDoorHighlights.caution.join(" | ") || "--"}
                      </p>
                    </article>

                    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-800">
                        Deidades
                      </p>
                      <p className="mt-3 text-sm font-semibold text-stone-900">
                        Apoio: {suite.qiMenProfile.canonicalDeityHighlights.supportive.join(" | ") || "--"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        Cautela: {suite.qiMenProfile.canonicalDeityHighlights.caution.join(" | ") || "--"}
                      </p>
                    </article>

                    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-800">
                        Marcadores do caso
                      </p>
                      <p className="mt-3 text-sm font-semibold text-stone-900">
                        Sujeito {suite.qiMenProfile.caseMarkers.subject.stem}:{" "}
                        {suite.qiMenProfile.caseMarkers.subject.carriers[0] || "--"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        Objeto {suite.qiMenProfile.caseMarkers.object.stem}:{" "}
                        {suite.qiMenProfile.caseMarkers.object.carriers[0] || "--"}
                      </p>
                    </article>

                    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-sky-800">
                        Escopo temporal
                      </p>
                      <p className="mt-3 text-sm font-semibold text-stone-900">
                        Horario: {suite.qiMenProfile.temporalScopeSupport.hourly}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">
                        Diario: {suite.qiMenProfile.temporalScopeSupport.daily}
                      </p>
                    </article>
                  </div>
                </div>
              </section>

              <InsightStrip
                items={[
                  {
                    label: "Dun / Ju",
                    value: suite.qiMenProfile.juLabel,
                  },
                  {
                    label: "Zhi Fu",
                    value: `${suite.qiMenProfile.zhiFu} | ${suite.qiMenProfile.zhiFuPalace}`,
                  },
                  {
                    label: "Zhi Shi",
                    value: `${suite.qiMenProfile.zhiShi} | ${suite.qiMenProfile.zhiShiPalace}`,
                  },
                  {
                    label: "Xun Shou",
                    value: suite.qiMenProfile.xunShou,
                  },
                  {
                    label: "Kong Wang",
                    value: suite.qiMenProfile.gongKongPalaces.join(" | ") || "--",
                  },
                  {
                    label: "Yi Kong",
                    value: suite.qiMenProfile.yiKongPalaces.join(" | ") || "--",
                  },
                  {
                    label: "Ma Xing",
                    value: suite.qiMenProfile.maXingPalaces.join(" | ") || "--",
                  },
                  {
                    label: "San Qi",
                    value: suite.qiMenProfile.sanQiOnSky.join(" | ") || "--",
                  },
                  {
                    label: "Liu Yi",
                    value: suite.qiMenProfile.liuYiOnSky.join(" | ") || "--",
                  },
                  {
                    label: "Estruturas",
                    value: suite.qiMenProfile.structureNames.join(" | ") || "--",
                  },
                  {
                    label: "Direção líder",
                    value: suite.qiMenProfile.bestDirections[0] || "--",
                  },
                ]}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                    Escopo temporal do motor
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-stone-600">
                    <p>
                      <span className="font-semibold text-stone-900">Anual:</span>{" "}
                      {suite.qiMenProfile.temporalScopeSupport.yearly}
                    </p>
                    <p>
                      <span className="font-semibold text-stone-900">Mensal:</span>{" "}
                      {suite.qiMenProfile.temporalScopeSupport.monthly}
                    </p>
                    <p>
                      <span className="font-semibold text-stone-900">Diario:</span>{" "}
                      {suite.qiMenProfile.temporalScopeSupport.daily}
                    </p>
                    <p>
                      <span className="font-semibold text-stone-900">Horario:</span>{" "}
                      {suite.qiMenProfile.temporalScopeSupport.hourly}
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                    Ancoras do caso
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-stone-600">
                    {[
                      suite.qiMenProfile.caseMarkers.subject,
                      suite.qiMenProfile.caseMarkers.object,
                      suite.qiMenProfile.caseMarkers.yearAnchor,
                      suite.qiMenProfile.caseMarkers.monthAnchor,
                    ].map((marker) => (
                      <article
                        key={`${marker.label}-${marker.stem}`}
                        className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                      >
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stone-900">
                          {marker.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">
                          {marker.stem} | {marker.carriers.join(" | ") || "--"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-500">{marker.rule}</p>
                      </article>
                    ))}
                    <p className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-xs leading-5 text-stone-500">
                      {suite.qiMenProfile.caseMarkers.yongShenRule}
                    </p>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                      Matriz técnica do caso
                    </p>
                    <h3 className="mt-2 text-xl font-black text-stone-950">
                      Sujeito, objeto e eixo de comando no tabuleiro
                    </h3>
                  </div>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-600">
                    {suite.qiMenProfile.caseRelationMatrix.length} palacios
                  </span>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[22rem_1fr]">
                  <article className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stone-900">
                      Resumo do eixo
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-stone-600">
                      {suite.qiMenProfile.caseAxisSummary.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </article>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {suite.qiMenProfile.caseRelationMatrix.map((row) => (
                      <article
                        key={`${row.palace}-${row.direction}`}
                        className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                      >
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stone-900">
                          {row.palace} {row.direction}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">
                          {row.grade} | score {row.score}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          Tags: {row.tags.join(" / ") || "--"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-500">
                          {row.notes.join(" | ") || "Sem nota complementar."}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                    Padrões canônicos auditados
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-stone-600">
                    {suite.qiMenProfile.patternAudits.map((audit) => (
                      <article
                        key={audit.name}
                        className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                      >
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stone-900">
                          {audit.name}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-stone-900">
                          {audit.status} | {audit.palaces.join(" | ") || "--"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-stone-500">{audit.criterion}</p>
                        {audit.details.length ? (
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            {audit.details.join(" | ")}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                    Direções e eleição técnica
                  </p>
                  <div className="mt-4 space-y-4">
                    <article className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-800">
                        Direções mais fortes
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-emerald-900">
                        {(suite.qiMenProfile.bestDirections.length
                          ? suite.qiMenProfile.bestDirections
                          : ["--"]).map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </article>

                    <article className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-800">
                        Direções de cautela
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-red-900">
                        {(suite.qiMenProfile.cautionDirections.length
                          ? suite.qiMenProfile.cautionDirections
                          : ["--"]).map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </article>

                    <div className="grid gap-3 md:grid-cols-2">
                      {suite.qiMenProfile.directionRatings.map((rating) => (
                        <article
                          key={`${rating.palace}-${rating.direction}`}
                          className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                        >
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stone-900">
                            {rating.palace} {rating.direction}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-stone-900">
                            {rating.grade} | score {rating.score}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-stone-500">
                            {rating.reasons.join(" | ") || "Sem reforco especial."}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                      Aplicações canônicas
                    </p>
                    <h3 className="mt-2 text-xl font-black text-stone-950">
                      Usos técnicos do quadro
                    </h3>
                  </div>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-600">
                    Sem leitura automática
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {suite.qiMenProfile.applicationCues.map((cue) => (
                    <article
                      key={cue.key}
                      className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                    >
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stone-900">
                        {cue.label}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-stone-500">{cue.rule}</p>
                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-emerald-800">
                            Palácios mais aderentes
                          </p>
                          <div className="mt-2 space-y-2 text-sm text-emerald-900">
                            {(cue.bestPalaces.length ? cue.bestPalaces : ["--"]).map((item) => (
                              <p key={item}>{item}</p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-red-800">
                            Palácios de cautela
                          </p>
                          <div className="mt-2 space-y-2 text-sm text-red-900">
                            {(cue.cautionPalaces.length ? cue.cautionPalaces : ["--"]).map((item) => (
                              <p key={item}>{item}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                      Tabuleiro horario
                    </p>
                    <h3 className="mt-2 text-xl font-black text-stone-950">
                      Nove palacios em grade tecnica
                    </h3>
                  </div>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-600">
                    Fei Pan
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {suite.qiMenProfile.gridPalaces.map((palace) => (
                    <QiMenPalaceCard key={palace.key} palace={palace} />
                  ))}
                </div>
              </section>

              <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                    Estruturas e ge ju
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-stone-600">
                    {suite.qiMenProfile.structureHighlights.slice(0, 18).map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-sky-800">
                    Shen Sha do quadro
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-stone-600">
                    {suite.qiMenProfile.shenShaHighlights.slice(0, 18).map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </section>
              </div>

              <TechnicalBlocks blocks={suite.blocks.qimen} />
            </div>
          )
        : activeModule === "tongshu"
          ? (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
                <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-red-800">
                    Dia escolhido
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-stone-950">
                    {suite.tongShu.dayPillar}
                  </h2>
                  <p className="mt-2 text-sm text-stone-600">{suite.tongShu.dayMaster}</p>
                  <p className="mt-4 text-sm text-stone-600">{suite.tongShu.note}</p>
                </article>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-950">
                      Favorece
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      {suite.tongShu.favorableActivities.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-950">
                      Horas favoráveis
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      {suite.tongShu.favorableHours.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <TechnicalBlocks blocks={suite.blocks.tongshu} />
            </div>
          )
          : (
            <ConsultationSpotlight
              moduleKey={activeModule}
              chart={suite.periodChart}
              location={periodInput.location}
            />
          );

  const panelDescription =
    activePanel === "analysis"
      ? activeModule === "bazi"
        ? BAZI_VIEW_META[baziView].description
        : activeCatalog.longDescription
      : MODULE_PANEL_META[activePanel].description;

  return (
    <main className="chinese-world app-world relative min-h-screen overflow-hidden px-4 pb-8 text-amber-50 md:px-8">
      <WorldTopbar world="chinese" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-7rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-red-400/10 blur-3xl" />
        <div className="absolute right-[6%] top-[12%] h-56 w-56 rounded-full border border-amber-200/8" />
        <div className="absolute left-[5%] top-[36%] h-36 w-36 rounded-full border border-red-200/8" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-col">
        <header className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-amber-200/35 bg-red-100/10 text-2xl text-amber-100">
            <FiMoon />
          </div>
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em] text-red-200/58">
              中國術數 · sete sistemas clássicos
            </p>
            <h1 className="section-title mt-2 text-4xl font-semibold text-amber-50 sm:text-5xl md:text-6xl">
              Astrologia Chinesa
            </h1>
            <p className="section-copy mx-auto mt-4 max-w-3xl text-sm sm:text-base">
              A trilha chinesa foi reorganizada em módulos claros, com BaZi abrigando a própria
              sinastria e cada técnica recebendo seu atlas técnico completo.
            </p>
          </div>
        </header>

        {screen === "home" ? (
          <section className="panel-surface mt-8 overflow-hidden rounded-[2rem] p-5 sm:p-7">
            <div className="flex flex-col gap-5 border-b border-amber-200/12 pb-6 text-center sm:text-left">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <p className="section-eyebrow">Sete Módulos Clássicos</p>
                  <h2 className="section-title mt-2 text-3xl font-semibold text-amber-50 sm:text-4xl">
                    Selecione o serviço chinês que deseja
                  </h2>
                </div>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                  <MetricBadge label="BaZi com sinastria interna" />
                  <MetricBadge label="Sem mexer na védica ou ocidental" />
                </div>
              </div>

              <p className="section-copy mx-auto max-w-3xl text-sm sm:mx-0 sm:text-base">
                No lugar da tela antiga, a área chinesa agora abre Bazi, Zi Wei Dou Shu, Qi Men Dun
                Jia, Da Liu Ren, Tai Yi Shen Shu, Wen Wang Gua e Tong Shu, cada um com o conjunto
                completo de tópicos que você pediu.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(Object.keys(CHINESE_MODULE_CATALOG) as ChineseModuleKey[]).map((moduleKey) => (
                <HomeModuleCard
                  key={moduleKey}
                  moduleKey={moduleKey}
                  onSelect={(nextModule) => {
                    setActiveModule(nextModule);
                    setActivePanel("analysis");
                    if (nextModule === "bazi") {
                      setBaziView("natal");
                    }
                    setScreen("module");
                  }}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-[21rem_minmax(0,1fr)] 2xl:grid-cols-[23rem_minmax(0,1fr)]">
            <aside className="space-y-5">
              <section className="panel-surface rounded-[1.9rem] p-5">
                <button
                  type="button"
                  onClick={() => setScreen("home")}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200/16 bg-white/[0.04] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-white/[0.08]"
                >
                  <FiArrowLeft />
                  Voltar aos módulos
                </button>

                <div className="mt-5 flex items-start gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl border text-xl ${activeUi.toneClass}`}>
                    {activeUi.icon}
                  </div>

                  <div>
                    <p className="section-eyebrow">{activeUi.kicker}</p>
                    <h2 className="section-title mt-2 text-3xl font-semibold text-amber-50">
                      {activeCatalog.label}
                    </h2>
                  </div>
                </div>

                  <p className="section-copy mt-4 text-sm">{activeCatalog.longDescription}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <MetricBadge label={`${activeCatalog.sections.length} blocos`} />
                  <MetricBadge label={`${getModuleTopicCount(activeModule)} tópicos`} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {activePreviewTopics.map((topic) => (
                    <span
                      key={topic}
                      className={`rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${activeUi.chipClass}`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </section>

              {activeModule === "bazi" ? (
                <section className="panel-surface rounded-[1.9rem] p-5">
                  <p className="section-eyebrow">Dentro do BaZi</p>
                  <div className="mt-4 grid gap-2">
                    {(Object.entries(BAZI_VIEW_META) as [BaziViewKey, (typeof BAZI_VIEW_META)[BaziViewKey]][]).map(
                      ([key, meta]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setBaziView(key);
                            setActivePanel("analysis");
                          }}
                          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            baziView === key
                              ? "border-amber-300/45 bg-amber-200/14 text-amber-50"
                              : "border-amber-200/14 bg-white/[0.03] text-amber-100/78 hover:border-amber-200/28"
                          }`}
                        >
                          <span className="inline-flex items-center gap-3 text-sm font-bold">
                            {meta.icon}
                            {meta.label}
                          </span>
                          <FiGrid className="shrink-0 opacity-70" />
                        </button>
                      )
                    )}
                  </div>
                  <p className="section-copy mt-4 text-sm">{BAZI_VIEW_META[baziView].description}</p>
                </section>
              ) : null}

              <section className="panel-surface rounded-[1.9rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">Formulário</p>
                    <h3 className="section-title mt-2 text-2xl font-semibold text-amber-50">
                      {activeModule === "bazi"
                        ? BAZI_VIEW_META[baziView].title
                        : activeCatalog.label}
                    </h3>
                  </div>
                  <FiMap className="text-amber-100/72" />
                </div>

                <div className="mt-5 space-y-4">{moduleForm}</div>

                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                      onClick={() =>
                      setSuite(
                        buildChineseSuite(
                          natalInput,
                          partnerInput,
                          periodInput,
                          ziWeiPreset,
                          qiMenPreset
                        )
                      )
                      }
                    className="default-btn"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <FiRefreshCw />
                      {moduleActionLabel}
                    </span>
                  </button>
                </div>
              </section>
            </aside>

            <section className="space-y-6">
              <section className="panel-surface rounded-[1.9rem] p-4 sm:p-5">
                <div className="flex flex-col gap-4 border-b border-amber-200/12 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="section-eyebrow">Painéis do Módulo</p>
                    <h3 className="section-title mt-2 text-2xl font-semibold text-amber-50">
                      {MODULE_PANEL_META[activePanel].label}
                    </h3>
                    <p className="section-copy mt-2 text-sm">{panelDescription}</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {(Object.entries(MODULE_PANEL_META) as [ModulePanelKey, (typeof MODULE_PANEL_META)[ModulePanelKey]][]).map(
                      ([key, meta]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActivePanel(key)}
                          className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] transition ${
                            activePanel === key
                              ? "border-amber-300/45 bg-amber-200/14 text-amber-50"
                              : "border-amber-200/14 bg-white/[0.03] text-amber-100/78 hover:border-amber-200/28"
                          }`}
                        >
                          {meta.icon}
                          {meta.label}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  {activePanel === "analysis" ? moduleContent : null}
                  {activePanel === "atlas" ? (
                    <TopicAtlas sections={activeCatalog.sections} moduleKey={activeModule} />
                  ) : null}
                  {activePanel === "report" ? (
                    <GeneratedReportPanel
                      title={reportTitle}
                      description={reportDescription}
                      report={moduleReport}
                      filename={reportFilename}
                      jsonData={reportJsonData}
                      pdfTitle={reportTitle}
                    />
                  ) : null}
                </div>
              </section>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
