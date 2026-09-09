"use client";

import WorldTopbar from "@/app/components/WorldTopbar";
import GeneratedReportPanel from "@/app/components/shared/GeneratedReportPanel";
import LocationAutocomplete, {
  LocationSelection,
} from "@/app/components/shared/LocationAutocomplete";
import VedicTechnicalView from "@/app/components/vedic/VedicTechnicalView";
import {
  ASHTA_KOOTA_OPTIONS,
  DEFAULT_JYOTISH_CONFIG,
  HOUSE_SYSTEM_OPTIONS,
  KALACHAKRA_CYCLE_MODE_OPTIONS,
  KP_RULING_PLANET_OPTIONS,
  KUJA_DOSHA_OPTIONS,
  MRITYU_BHAGA_OPTIONS,
  NODE_ASPECT_OPTIONS,
  SECONDARY_DASHA_OPTIONS,
} from "@/app/lib/jyotish/jyotishConfig";
import type { JyotishConfig, JyotishModuleKey } from "@/app/lib/jyotish/types";
import { VedicSuite } from "@/app/lib/vedic";
import { BirthDate } from "@/interfaces/BirthChartInterfaces";
import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiCompass,
  FiArrowLeft,
  FiChevronRight,
  FiHeart,
  FiLoader,
  FiMoon,
  FiRefreshCw,
  FiSliders,
  FiStar,
  FiSun,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";

interface PersonFormState {
  name: string;
  date: string;
  time: string;
  gender: "male" | "female";
  unknownTime: boolean;
  location?: LocationSelection;
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

const primarySeed: PersonFormState = {
  name: "Nativo",
  date: "2001-04-21",
  time: "06:45",
  gender: "male",
  unknownTime: false,
  location: defaultLocation,
};

const partnerSeed: PersonFormState = {
  name: "Pessoa B",
  date: "2002-09-14",
  time: "18:20",
  gender: "female",
  unknownTime: false,
  location: {
    ...defaultLocation,
    name: "Rio de Janeiro, Rio de Janeiro, Brasil",
    city: "Rio de Janeiro",
    latitude: -22.9068,
    longitude: -43.1729,
  },
};

const transitSeed: PersonFormState = {
  name: "Momento de Analise",
  date: "2026-04-25",
  time: "12:00",
  gender: "male",
  unknownTime: false,
  location: defaultLocation,
};

const MODULE_META: Record<
  JyotishModuleKey,
  {
    label: string;
    title: string;
    description: string;
    short: string;
    action: string;
    icon: React.ReactNode;
  }
> = {
  janma: {
    label: "Janma Jyotish",
    title: "Janma Jyotish",
    description:
      "Módulo natal principal com Rasi, lordships, vargas, bala, yogas, Jaimini e base técnica maximalista.",
    short: "Natal",
    action: "Gerar Janma Jyotish",
    icon: <FiSun />,
  },
  prashna: {
    label: "Prashna Jyotish",
    title: "Prashna Jyotish",
    description:
      "Carta da pergunta com foco em Lagna do momento, Lua, Panchanga e validação técnica.",
    short: "Pergunta",
    action: "Gerar Prashna Jyotish",
    icon: <FiCompass />,
  },
  muhurta: {
    label: "Muhurta",
    title: "Muhurta",
    description:
      "Bloco eletivo com Panchanga, Lagna do evento, contexto lunar e reserva para janelas clássicas.",
    short: "Eleição",
    action: "Gerar Muhurta",
    icon: <FiMoon />,
  },
  varshaphala: {
    label: "Varshaphala",
    title: "Varshaphala",
    description:
      "Leitura anual védica/Tajika com dasha em curso, configurações claras e espaço para Muntha e Sahams.",
    short: "Ano solar",
    action: "Gerar Varshaphala",
    icon: <FiTrendingUp />,
  },
  dasha: {
    label: "Dasha Shastra",
    title: "Dasha Shastra",
    description:
      "Motor de períodos planetários com Vimshottari ativo e famílias adicionais já estruturadas.",
    short: "Períodos",
    action: "Gerar Dasha Shastra",
    icon: <FiClock />,
  },
  gochara: {
    label: "Gochara",
    title: "Gochara",
    description:
      "Trânsitos a partir do Lagna e da Lua, ligados ao período ativo, sem previsão fatalista automática.",
    short: "Trânsitos",
    action: "Gerar Gochara",
    icon: <FiRefreshCw />,
  },
  vivaha: {
    label: "Vivaha Jyotish",
    title: "Vivaha Jyotish",
    description:
      "Compatibilidade técnica védica com dois mapas, matching e trilha aberta para Ashta Koota, D9 e Upapada.",
    short: "Compatibilidade",
    action: "Gerar Vivaha Jyotish",
    icon: <FiHeart />,
  },
};

const MODULE_ORDER = Object.entries(MODULE_META) as [
  JyotishModuleKey,
  (typeof MODULE_META)[JyotishModuleKey],
][];

const CORE_STACK = [
  "Rasi e bhavas",
  "Nakshatras",
  "Vargas",
  "Bala",
  "Dasha",
  "Gochar",
  "Relatório",
];

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

function ConfigSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Field label={label} icon={<FiStar />}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="bazi-input">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function PersonForm({
  title,
  value,
  onChange,
}: {
  title: string;
  value: PersonFormState;
  onChange: (nextValue: PersonFormState) => void;
}) {
  return (
    <section className="rounded-[1.6rem] border border-amber-200/14 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-amber-200/84">
            {title}
          </p>
          <h2 className="mt-1 text-xl font-black text-amber-50">{value.name}</h2>
        </div>
        <FiCompass className="text-amber-100/70" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome" icon={<FiUser />}>
          <input
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
            className="bazi-input"
          />
        </Field>

        <Field label="Genero" icon={<FiStar />}>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => onChange({ ...value, gender })}
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

        <Field label="Data" icon={<FiSun />}>
          <input
            type="date"
            value={value.date}
            onChange={(event) => onChange({ ...value, date: event.target.value })}
            className="bazi-input"
          />
        </Field>

        <Field label="Hora" icon={<FiClock />}>
          <input
            type="time"
            value={value.time}
            disabled={value.unknownTime}
            onChange={(event) => onChange({ ...value, time: event.target.value })}
            className="bazi-input disabled:opacity-45"
          />
        </Field>
      </div>

      <div className="mt-4">
        <LocationAutocomplete
          value={value.location}
          onSelect={(location) => onChange({ ...value, location })}
        />
      </div>

      <div className="mt-4">
        <Toggle
          label="Hora desconhecida"
          checked={value.unknownTime}
          onChange={(unknownTime) => onChange({ ...value, unknownTime })}
        />
      </div>
    </section>
  );
}

function toBirthDate(form: PersonFormState): BirthDate | undefined {
  if (!form.location) {
    return undefined;
  }

  const [year, month, day] = form.date.split("-").map(Number);

  return {
    year,
    month,
    day,
    time: form.unknownTime ? "12:00" : form.time,
    gender: form.gender,
    coordinates: {
      name: form.location.name,
      latitude: form.location.latitude,
      longitude: form.location.longitude,
      timezone: form.location.utcOffset === 0 ? "Etc/GMT" : form.location.utcOffset > 0 ? `Etc/GMT-${form.location.utcOffset}` : `Etc/GMT+${Math.abs(form.location.utcOffset)}`,
      timezoneSource: "user",
    },
  };
}

export default function VedicApp() {
  const [menu, setMenu] = useState<"home" | "service">("home");
  const [activeModule, setActiveModule] = useState<JyotishModuleKey>("janma");
  const [primary, setPrimary] = useState(primarySeed);
  const [partner, setPartner] = useState(partnerSeed);
  const [transit, setTransit] = useState(transitSeed);
  const [config, setConfig] = useState<JyotishConfig>(DEFAULT_JYOTISH_CONFIG);
  const [question, setQuestion] = useState("Qual é a radicalidade desta pergunta?");
  const [eventType, setEventType] = useState("Assinatura e início de projeto");
  const [suite, setSuite] = useState<VedicSuite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSections, setSelectedSections] = useState<Record<JyotishModuleKey, string>>({
    janma: "",
    prashna: "",
    muhurta: "",
    varshaphala: "",
    dasha: "",
    gochara: "",
    vivaha: "",
  });

  const activeMeta = MODULE_META[activeModule];
  const activeModuleData = suite?.modules[activeModule];

  async function generateSuite() {
    const primaryBirthDate = toBirthDate(primary);
    const transitBirthDate = toBirthDate(transit);
    const partnerBirthDate = toBirthDate(partner);

    if (!primaryBirthDate || !transitBirthDate) {
      setError("Selecione cidades válidas para o mapa base e para o momento de análise.");
      return;
    }

    if (activeModule === "vivaha" && !partnerBirthDate) {
      setError("Vivaha Jyotish precisa de dois mapas com cidade válida.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/vedic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          primary: primaryBirthDate,
          transit: transitBirthDate,
          partner: partnerBirthDate,
          ayanamsa: config.ayanamsha,
          config,
          question,
          eventType,
          selectedYear: Number(transit.date.slice(0, 4)),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.erro ?? "Não consegui montar a suíte védica agora.");
        setSuite(null);
        return;
      }

      setSuite(data as VedicSuite);
    } catch (requestError) {
      console.error("Falha ao gerar suíte védica:", requestError);
      setError("A suíte védica não respondeu agora.");
      setSuite(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void generateSuite();
  }, []);

  useEffect(() => {
    if (!activeModuleData || selectedSections[activeModule]) {
      return;
    }

    setSelectedSections((current) => ({
      ...current,
      [activeModule]: activeModuleData.sections[0]?.id ?? "",
    }));
  }, [activeModule, activeModuleData, selectedSections]);

  const activeSectionId =
    selectedSections[activeModule] || activeModuleData?.sections[0]?.id || "";

  const serviceForms = useMemo(() => {
    switch (activeModule) {
      case "janma":
        return <PersonForm title="Mapa natal" value={primary} onChange={setPrimary} />;
      case "prashna":
        return (
          <>
            <PersonForm title="Momento da pergunta" value={transit} onChange={setTransit} />
            <Field label="Pergunta" icon={<FiCompass />}>
              <textarea
                rows={3}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="bazi-input min-h-[8rem]"
              />
            </Field>
          </>
        );
      case "muhurta":
        return (
          <>
            <PersonForm title="Momento do evento" value={transit} onChange={setTransit} />
            <Field label="Tipo de evento" icon={<FiMoon />}>
              <input
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                className="bazi-input"
              />
            </Field>
          </>
        );
      case "varshaphala":
        return (
          <>
            <PersonForm title="Mapa natal" value={primary} onChange={setPrimary} />
            <PersonForm title="Ano consultado" value={transit} onChange={setTransit} />
          </>
        );
      case "dasha":
        return (
          <>
            <PersonForm title="Mapa natal" value={primary} onChange={setPrimary} />
            <PersonForm title="Data de análise" value={transit} onChange={setTransit} />
          </>
        );
      case "gochara":
        return (
          <>
            <PersonForm title="Mapa natal" value={primary} onChange={setPrimary} />
            <PersonForm title="Data de gochara" value={transit} onChange={setTransit} />
          </>
        );
      case "vivaha":
        return (
          <>
            <PersonForm title="Pessoa A" value={primary} onChange={setPrimary} />
            <PersonForm title="Pessoa B" value={partner} onChange={setPartner} />
            <PersonForm title="Data de observação" value={transit} onChange={setTransit} />
          </>
        );
      default:
        return null;
    }
  }, [activeModule, eventType, partner, primary, question, transit]);

  return (
    <main className="vedic-world app-world min-h-screen px-4 pb-10 text-amber-50 md:px-6">
      <WorldTopbar world="vedic" />
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <header className="vedic-hero">
          <div className="vedic-hero__mark" aria-hidden>
            <FiStar />
          </div>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.26em] text-emerald-200/70">
              ज्योतिष · sete frentes clássicas
            </p>
            <h1 className="section-title mt-3 text-4xl font-semibold text-amber-50 sm:text-5xl lg:text-6xl">
              Astrologia Védica
            </h1>
            <p className="section-copy mt-4 max-w-3xl text-sm sm:text-base">
              Um workspace Jyotish com motor técnico visível: nascimento, pergunta,
              eleição, retorno anual, dashas, trânsitos e compatibilidade no mesmo mapa
              de trabalho.
            </p>
          </div>
          <div className="vedic-hero__stack" aria-label="Camadas do motor védico">
            <span className="vedic-engine-pill">
              {suite ? "Motor conectado" : loading ? "Sincronizando motor" : "Motor pronto"}
            </span>
            {CORE_STACK.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </header>

        {menu === "home" ? (
          <section className="vedic-home">
            <div className="vedic-home__intro">
              <p className="section-eyebrow">Escolha o módulo</p>
              <h2 className="section-title mt-3 text-3xl font-semibold text-amber-50 sm:text-4xl">
                Sete entradas, um só motor védico.
              </h2>
              <p className="section-copy mt-4 max-w-3xl text-sm">
                Cada frente abre com os campos certos e preserva a configuração técnica
                no relatório: ayanamsha, bhava, KP, dashas, nodos, Kuja Dosha e Ashta Koota.
              </p>
            </div>

            <div className="vedic-orbit-stage" aria-hidden>
              <div className="vedic-orbit-core">
                <FiStar />
              </div>
              <div className="vedic-orbit-ring vedic-orbit-ring--wide" />
              <div className="vedic-orbit-ring vedic-orbit-ring--mid" />
              <div className="vedic-orbit-ring vedic-orbit-ring--tight" />
              <div className="vedic-orbit-band" />
              {MODULE_ORDER.map(([key, meta]) => (
                <span key={key} className="vedic-orbit-node">
                  {meta.icon}
                </span>
              ))}
            </div>

            <div className="vedic-module-grid">
              {MODULE_ORDER.map(([key, meta], index) => (
                <article key={key} className="vedic-module-card">
                  <button
                    type="button"
                    className="vedic-module-card__button"
                    onClick={() => {
                      setActiveModule(key);
                      setMenu("service");
                    }}
                  >
                    <span className="vedic-module-card__head">
                      <span className="vedic-module-card__index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="vedic-module-card__icon">{meta.icon}</span>
                    </span>
                    <span className="vedic-module-card__body">
                      <span className="vedic-module-card__type">{meta.short}</span>
                      <strong>{meta.label}</strong>
                      <span>{meta.description}</span>
                    </span>
                    <span className="vedic-module-card__foot">
                      Abrir workspace
                      <FiChevronRight />
                    </span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <>
            <nav className="vedic-module-tabs" aria-label="Módulos védicos">
              {MODULE_ORDER.map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    data-active={activeModule === key}
                    className="vedic-module-tab"
                    onClick={() => {
                      setActiveModule(key);
                    }}
                  >
                    {meta.icon}
                    <span>{meta.short}</span>
                  </button>
                ))}
            </nav>

            <section className="vedic-workspace">
              <aside className="vedic-control-panel">
                <div>
                  <p className="section-eyebrow">Workspace ativo</p>
                  <h2 className="section-title mt-3 text-3xl font-semibold text-amber-50">
                    {activeMeta.title}
                  </h2>
                  <p className="section-copy mt-3 text-sm">{activeMeta.description}</p>
                </div>

                <div className="mt-6 grid gap-4">
                  <ConfigSelect
                    label="Ayanamsha"
                    value={config.ayanamsha}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        ayanamsha: value as JyotishConfig["ayanamsha"],
                      }))
                    }
                    options={[
                      { value: "lahiri", label: "Lahiri" },
                      { value: "krishnamurti", label: "Krishnamurti" },
                      { value: "raman", label: "Raman" },
                    ]}
                  />
                  <ConfigSelect
                    label="Sistema de bhava"
                    value={config.houseSystem}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        houseSystem: value as JyotishConfig["houseSystem"],
                      }))
                    }
                    options={HOUSE_SYSTEM_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                  <ConfigSelect
                    label="Dasha secundária"
                    value={config.secondaryDasha}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        secondaryDasha: value as JyotishConfig["secondaryDasha"],
                      }))
                    }
                    options={SECONDARY_DASHA_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                  <ConfigSelect
                    label="Ciclo Kalachakra"
                    value={config.kalachakraCycleMode}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        kalachakraCycleMode: value as JyotishConfig["kalachakraCycleMode"],
                      }))
                    }
                    options={KALACHAKRA_CYCLE_MODE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                  <ConfigSelect
                    label="Ayanamsha KP"
                    value={config.kpAyanamsha}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        kpAyanamsha: value as JyotishConfig["kpAyanamsha"],
                      }))
                    }
                    options={[
                      { value: "lahiri", label: "Lahiri" },
                      { value: "krishnamurti", label: "Krishnamurti" },
                      { value: "raman", label: "Raman" },
                    ]}
                  />
                  <ConfigSelect
                    label="Aspectos Rahu/Ketu"
                    value={config.nodeAspectMode}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        nodeAspectMode: value as JyotishConfig["nodeAspectMode"],
                      }))
                    }
                    options={NODE_ASPECT_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                  <ConfigSelect
                    label="Ashta Koota"
                    value={config.ashtaKootaMode}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        ashtaKootaMode: value as JyotishConfig["ashtaKootaMode"],
                      }))
                    }
                    options={ASHTA_KOOTA_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                  <ConfigSelect
                    label="Kuja Dosha"
                    value={config.kujaDoshaRules}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        kujaDoshaRules: value as JyotishConfig["kujaDoshaRules"],
                      }))
                    }
                    options={KUJA_DOSHA_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                  <ConfigSelect
                    label="Ruling Planets KP"
                    value={config.kpRulingPlanetMode}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        kpRulingPlanetMode: value as JyotishConfig["kpRulingPlanetMode"],
                      }))
                    }
                    options={KP_RULING_PLANET_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                  <ConfigSelect
                    label="Mrityu Bhaga"
                    value={config.mrityuBhagaRules}
                    onChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        mrityuBhagaRules: value as JyotishConfig["mrityuBhagaRules"],
                      }))
                    }
                    options={MRITYU_BHAGA_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                  />
                </div>

                <div className="mt-5 grid gap-2">
                  <Toggle
                    label="Incluir Rahu/Ketu"
                    checked={config.includeNodes}
                    onChange={(includeNodes) => setConfig((current) => ({ ...current, includeNodes }))}
                  />
                  <Toggle
                    label="Técnicas avançadas"
                    checked={config.showAdvanced}
                    onChange={(showAdvanced) => setConfig((current) => ({ ...current, showAdvanced }))}
                  />
                  <Toggle
                    label="Bhava Chalit Sripati"
                    checked={config.bhavaChalitSystem === "sripati"}
                    onChange={(checked) =>
                      setConfig((current) => ({
                        ...current,
                        bhavaChalitSystem: checked ? "sripati" : "whole-sign",
                      }))
                    }
                  />
                  <Toggle
                    label="Camada KP separada"
                    checked={config.kpEnabled}
                    onChange={(kpEnabled) => setConfig((current) => ({ ...current, kpEnabled }))}
                  />
                </div>
              </aside>

              <div className="vedic-input-panel">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-200/10 pb-5">
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-emerald-200/75">
                      Dados de cálculo
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-amber-50">
                      {activeMeta.label}
                    </h3>
                  </div>
                  <FiSliders className="text-2xl text-emerald-100/60" />
                </div>

                <div className="mt-6 grid gap-4">{serviceForms}</div>

                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button type="button" onClick={() => void generateSuite()} className="default-btn">
                    <span className="inline-flex items-center justify-center gap-2">
                      {loading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
                      {activeMeta.action}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMenu("home")}
                    className="vedic-back-btn"
                  >
                    <FiArrowLeft />
                    Módulos
                  </button>
                </div>
              </div>
            </section>

            {error ? (
              <section className="mt-6 w-full rounded-2xl border border-red-200/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
                {error}
              </section>
            ) : null}

            {activeModuleData ? (
              <>
                <section className="mt-8 grid w-full gap-4 xl:grid-cols-[18rem_1fr]">
                  <article className="rounded-[1.75rem] border border-amber-200/14 bg-white/[0.03] p-5">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-amber-200/84">
                      Síntese do módulo
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-amber-50">{activeModuleData.label}</h3>
                    <div className="mt-4 space-y-2 text-sm leading-6 text-amber-100/74">
                      {activeModuleData.summary.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </article>

                  <div className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-[1.75rem] border border-amber-200/14 bg-white/[0.03] p-5">
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-amber-200/84">
                        Cobertura
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-amber-100/74">
                        <p>{activeModuleData.coverage.implemented} seções calculadas</p>
                        <p>{activeModuleData.coverage.mixed} seções parciais</p>
                        <p>{activeModuleData.coverage.placeholder} seções estruturadas</p>
                      </div>
                    </article>
                    <article className="rounded-[1.75rem] border border-amber-200/14 bg-white/[0.03] p-5">
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-amber-200/84">
                        Método
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-amber-100/74">
                        <p>Ayanamsha {suite?.config.ayanamsha}</p>
                        <p>Bhava {suite?.config.houseSystem}</p>
                        <p>KP {suite?.config.kpEnabled ? `${suite.config.kpAyanamsha} / ${suite.config.kpHouseSystem}` : "desligado"}</p>
                        <p>Dasha {suite?.config.primaryDasha}</p>
                        <p>Secundária {suite?.config.secondaryDasha}</p>
                        <p>Kalachakra {suite?.config.kalachakraCycleMode}</p>
                        <p>Mrityu {suite?.config.mrityuBhagaRules}</p>
                      </div>
                    </article>
                    <article className="rounded-[1.75rem] border border-amber-200/14 bg-white/[0.03] p-5">
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-amber-200/84">
                        Alertas
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-amber-100/74">
                        {activeModuleData.validations.length ? (
                          activeModuleData.validations.map((validation) => (
                            <p key={`${validation.level}-${validation.message}`}>
                              [{validation.level.toUpperCase()}] {validation.message}
                            </p>
                          ))
                        ) : (
                          <p>Sem alerta bloqueante neste recorte.</p>
                        )}
                      </div>
                    </article>
                  </div>
                </section>

                <div className="mt-6 w-full">
                  <VedicTechnicalView
                    sections={activeModuleData.sections}
                    activeSectionId={activeSectionId}
                    onSelect={(sectionId) =>
                      setSelectedSections((current) => ({
                        ...current,
                        [activeModule]: sectionId,
                      }))
                    }
                  />
                </div>

                <div className="mt-6 w-full">
                  <GeneratedReportPanel
                    title={activeModuleData.label}
                    description={activeModuleData.description}
                    report={activeModuleData.report}
                    filename={`lemathastro-${activeModule}.txt`}
                    jsonData={activeModuleData.jsonExport}
                    pdfTitle={activeModuleData.label}
                  />
                </div>
              </>
            ) : (
              <section className="mt-6 w-full rounded-2xl border border-dashed border-amber-200/18 bg-white/[0.03] px-4 py-10 text-center text-sm text-amber-100/70">
                {loading ? "Gerando a suíte védica..." : "Preencha o formulário e gere a leitura."}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
