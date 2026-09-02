'use client'

import { useBirthChart } from "@/contexts/BirthChartContext";
import { JSX, useEffect, useRef, useState } from "react";
import {
  convertDegMinToDecimal,
  getProfectionChart,
  monthsNames,
} from "../../utils/chartUtils";
import {
  BirthChartProfile,
  BirthDate,
  ReturnChartType,
} from "@/interfaces/BirthChartInterfaces";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import ChartAndData from ".././ChartAndData";
import ReturnChart from "./ReturnChart";
import { ChartMenuType, useChartMenu } from "@/contexts/ChartMenuContext";
import LunarDerivedChart from "./LunarDerivedChart";
import BirthChartForm from "./BirthChartForm";
import PresavedChartsDropdown from "./PresavedChartsDropdown";
import { useProfiles } from "@/contexts/ProfilesContext";
import { apiFetch } from "@/app/utils/api";
import SinastryChart from "./SinastryChart";
import Spinner from "../Spinner";
import Container from "../Container";
import SecondaryProgressionChart from "./SecondaryProgressionChart";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import ProfectionChart from "./ProfectionChart";
import CitySearch from "../CitySearch";
import type {
  SynastryAIEvaluationPacket,
  SynastryAnalysis,
  SynastryCustomRoleInput,
  SynastryInteractionKind,
  SynastryUserContext,
} from "@/traditions/western/synastry";
import SynastrySetupPanel from "../synastry/SynastrySetupPanel";

export type MenuButtonChoice =
  | "home"
  | "birthChart"
  | "momentChart"
  | "solarReturn"
  | "lunarReturn"
  | "sinastry"
  | "secondaryProgressions"
  | "profection"
  | "momentMap";

export default function BirthChart({ initialMenu = "home" }: { initialMenu?: MenuButtonChoice } = {}) {
  const [loading, setLoading] = useState(false);
  const {
    profileName,
    birthChart,
    returnChart,
    lunarDerivedChart,
    progressionChart,
    profectionChart,
    updateBirthChart,
    currentCity,
    selectCity,
    sinastryChart,
  } = useBirthChart();
  const { profiles } = useProfiles();
  const { arabicParts, archArabicParts } = useArabicParts();
  const [solarYear, setSolarYear] = useState(0);
  const [lunarDay, setLunarDay] = useState(1);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarYear, setLunarYear] = useState(0);
  const [chartProfile, setChartProfile] = useState<
    BirthChartProfile | undefined
  >(profiles[0]);
  const [sinastryProfile, setSinastryProfile] = useState<
    BirthChartProfile | undefined
  >();
  const [synastryResult, setSynastryResult] = useState<{
    analysis: SynastryAnalysis;
    report: string;
    ai?: SynastryAIEvaluationPacket;
  }>();
  const [synastryInteractionKind, setSynastryInteractionKind] = useState<SynastryInteractionKind>("general");
  const [synastryCustomRole, setSynastryCustomRole] = useState<SynastryCustomRoleInput>({
    houseForA: 7,
    houseForB: 7,
    roleA: "outra pessoa B",
    roleB: "outra pessoa A",
  });
  const [synastryUserContext, setSynastryUserContext] = useState<SynastryUserContext>({});
  const [synastryError, setSynastryError] = useState<string>();
  const [progressionYear, setProgressionYear] = useState<number | undefined>(
    undefined
  );

  const [profectionYear, setProfectionYear] = useState<number | undefined>(
    undefined
  );

  const firstProfileSetAtBeggining = useRef(false);

  const { chartMenu, addChartMenu, updateChartMenuDirectly } = useChartMenu();
  const { calculateArabicParts, calculateBirthArchArabicParts } =
    useArabicParts();
  const { screenDimensions } = useScreenDimensions();

  const [menu, setMenu] = useState<MenuButtonChoice>(initialMenu);
  const [isClientReady, setIsClientReady] = useState(false);
  const [activeChart, setActiveChart] = useState(chartMenu);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const solarReturnForm = useRef<HTMLFormElement>(null);
  const lunarReturnForm = useRef<HTMLFormElement>(null);
  const progressionForm = useRef<HTMLFormElement>(null);
  const profectionForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (chartMenu === activeChart) return;

    setIsTransitioning(true);
    setActiveChart(chartMenu);

    const timeout = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [chartMenu]);

  useEffect(() => {
    // Páginas especializadas (ex.: /ocidental/sinastria) podem abrir
    // diretamente no fluxo correto. Só a interface genérica deve
    // retornar automaticamente ao menu antigo quando não há mapa.
    if (initialMenu === "home" && birthChart === undefined && returnChart === undefined) {
      setMenu("home");
    }

    if (lunarDerivedChart) {
      addChartMenu("lunarDerivedReturn");
      updateChartMenuDirectly("lunarDerivedReturn");
    }
  }, [birthChart, returnChart, lunarDerivedChart]);

  useEffect(() => {
    if (birthChart) {
      calculateArabicParts(birthChart, "birth");

      if (menu === "profection") {
        makeProfection();
      }
    }
  }, [birthChart]);

  useEffect(() => {
    if (progressionChart) {
      calculateBirthArchArabicParts(progressionChart.housesData.ascendant);
    } else {
      setProgressionYear(undefined);
    }
  }, [progressionChart]);

  useEffect(() => {
    if (returnChart) {
      calculateBirthArchArabicParts(returnChart.housesData.ascendant, {
        isLunarDerivedChart: false,
      });
    }
  }, [returnChart, arabicParts]);

  useEffect(() => {
    if (lunarDerivedChart) {
      calculateBirthArchArabicParts(lunarDerivedChart.housesData.ascendant, {
        isLunarDerivedChart: true,
      });
    }
  }, [lunarDerivedChart]);

  useEffect(() => {
    if (profectionChart) {
      calculateBirthArchArabicParts(profectionChart.housesData.ascendant);
    }
  }, [profectionChart]);

  useEffect(() => {
    if (menu === "home") {
      firstProfileSetAtBeggining.current = false;
      setChartProfile(profiles[0]);
      setSinastryProfile(profiles[1] ?? profiles[0]);
      setSynastryResult(undefined);
      setSynastryError(undefined);
    }
  }, [menu, profiles]);

  useEffect(() => {
    if (profiles.length > 0 && !firstProfileSetAtBeggining.current) {
      setChartProfile(profiles[0]);
      firstProfileSetAtBeggining.current = true;
    }
  }, [profiles]);

  async function getBirthChart(chartProfileToOverwrite?: BirthChartProfile) {
    setLoading(true);
    if (chartProfileToOverwrite) {
      setChartProfile(chartProfileToOverwrite);
    }

    if (chartProfileToOverwrite?.birthDate?.coordinates)
      selectCity(chartProfileToOverwrite?.birthDate?.coordinates);

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate:
            chartProfileToOverwrite?.birthDate ?? chartProfile?.birthDate,
        }),
      });

      updateBirthChart({
        profileName: chartProfileToOverwrite?.name ?? chartProfile?.name,
        chartData: {
          ...data,
          birthDate:
            chartProfileToOverwrite?.birthDate ?? chartProfile?.birthDate,
        },
        chartType: "birth",
      });
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  }

  const getPlanetReturn = async (returnType: ReturnChartType) => {
    setLoading(true);

    if (!chartProfile) return;

    const targetDate: BirthDate = {
      ...chartProfile.birthDate!,
      day: returnType === "solar" ? chartProfile.birthDate!.day : lunarDay,
      month:
        returnType === "solar" ? chartProfile.birthDate!.month : lunarMonth,
      year: returnType === "solar" ? solarYear : lunarYear,
    };

    if (chartProfile?.birthDate?.coordinates)
      selectCity(chartProfile?.birthDate?.coordinates);

    const data = await apiFetch("return/" + returnType, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: chartProfile?.birthDate,
        targetDate,
      }),
    });

    updateBirthChart({
      chartType: "birth",
      profileName: chartProfile?.name,
      chartData: {
        ...data,
        birthDate: chartProfile?.birthDate,
        targetDate,
      },
    });

    if (chartProfile) {
      updateBirthChart({
        chartType: "return",
        chartData: {
          planets: data.returnPlanets,
          housesData: data.returnHousesData,
          returnType,
          birthDate: chartProfile.birthDate!,
          targetDate,
          returnTime: data.returnTime,
          fixedStars: data.fixedStars,
          timezone: data.timezone,
        },
      });

      const chartType: ChartMenuType =
        returnType === "solar" ? "solarReturn" : "lunarReturn";
      addChartMenu(chartType);
      updateChartMenuDirectly(chartType);
      setLoading(false);
    }
  };

  const getMomentBirthChart = async () => {
    const now = new Date();
    const hourString = convertDegMinToDecimal(
      now.getHours(),
      now.getMinutes()
    ).toString();

    const birthDate: BirthDate = {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      time: hourString,
      coordinates: currentCity ?? {
        latitude: 0,
        longitude: 0
      },
    };

    // console.log(birthDate);

    getBirthChart({
      name: "Mapa do Momento",
      birthDate,
    });
  };

  const makeSinastryCharts = async () => {
    if (!chartProfile?.birthDate || !sinastryProfile?.birthDate) {
      setSynastryError("Selecione a Pessoa A e a Pessoa B antes de calcular.");
      return;
    }

    if (synastryInteractionKind === "custom") {
      if (!synastryCustomRole.roleA.trim() || !synastryCustomRole.roleB.trim()) {
        setSynastryError("No modo personalizado, descreva o papel de cada pessoa no mapa da outra.");
        return;
      }
    }

    setLoading(true);
    setSynastryResult(undefined);
    setSynastryError(undefined);

    if (chartProfile.birthDate.coordinates) {
      selectCity(chartProfile.birthDate.coordinates);
    }

    try {
      const data = await apiFetch("synastry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDateA: chartProfile.birthDate,
          birthDateB: sinastryProfile.birthDate,
          labelA: chartProfile.name,
          labelB: sinastryProfile.name,
          interactionKind: synastryInteractionKind,
          customRole: synastryInteractionKind === "custom" ? synastryCustomRole : undefined,
          userContext: synastryUserContext,
        }),
      });

      updateBirthChart({
        profileName: chartProfile.name,
        chartData: data.chartA,
        chartType: "birth",
      });

      updateBirthChart({
        chartData: data.chartB,
        chartType: "sinastry",
      });

      setSynastryResult({
        analysis: data.synastryAnalysis as SynastryAnalysis,
        report: data.synastryReport as string,
        ai: data.synastryAI as SynastryAIEvaluationPacket | undefined,
      });

      const chartType: ChartMenuType = "sinastry";
      addChartMenu(chartType);
      updateChartMenuDirectly(chartType);
    } catch (error) {
      console.error("Erro ao calcular sinastria tradicional:", error);
      setSynastryError(error instanceof Error ? error.message : "Não foi possível calcular a sinastria. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };


  function getTitleMenuTitle(): string {
    if (menu === "home") return "Selecione o tipo de mapa que deseja";
    else if (menu === "birthChart")
      return "Escolha ou crie um novo mapa astral";
    else if (menu === "solarReturn" || menu === "lunarReturn")
      return "Escolha um mapa e digite o ano da revolução";
    else if (menu === "sinastry")
      return "Escolha os mapas a serem combinados em sinastria";
    else if (menu === "secondaryProgressions") return "Progressões Secundárias";
    else if (menu === "profection") return "Profecção Anual";
    else if (menu === "momentMap") return "Mapa do Momento";

    return "Sem título";
  }

  async function makeSecondaryProgression() {
    let birthDate = chartProfile?.birthDate;
    if (!birthDate || !progressionYear) return;

    const jsDate = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    jsDate.setDate(jsDate.getDate() + progressionYear);

    birthDate = {
      ...birthDate,
      day: jsDate.getDate(),
      month: jsDate.getMonth() + 1,
      year: jsDate.getFullYear(),
    };

    await getBirthChart();
    setLoading(true);

    try {
      const data = await apiFetch("birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
        }),
      });

      updateBirthChart({
        profileName: chartProfile?.name,
        chartData: {
          ...data,
          birthDate,
        },
        chartType: "progression",
      });

      const chartType: ChartMenuType = "progression";
      addChartMenu(chartType);
      updateChartMenuDirectly(chartType);
    } catch (error) {
      console.error("Erro ao consultar mapa astral:", error);
    } finally {
      setLoading(false);
    }
  }

  function makeProfection() {
    setLoading(true);

    if (!birthChart) {
      setLoading(false);
      return;
    }

    const profectedChart = getProfectionChart(birthChart, profectionYear || 0);

    updateBirthChart({
      chartData: {
        ...profectedChart,
      },
      profileName: chartProfile?.name,
      chartType: "profection",
    });

    const chartType: ChartMenuType = "profection";
    addChartMenu(chartType);
    updateChartMenuDirectly(chartType);
    setLoading(false);
    setProfectionYear(undefined);
  }

  function _getDebugData(): JSX.Element {
    return (
      <div className="h-fit text-center">
        <span className="font-bold text-xl">:: Debugging ::</span>

        <div className="flex flex-col text-start items-start mt-2 gap-1">
          <span>
            screenDimensions:{" "}
            <span className="font-bold text-blue-800">
              [w: {screenDimensions.width}px x h: {screenDimensions.height}px]
            </span>
          </span>
          <span>
            birthChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(birthChart === undefined).toString()}
            </span>
          </span>
          <span>
            menu: <strong>{menu}</strong>
          </span>
          <span>
            chartMenu: <span className="font-bold">{chartMenu}</span>
          </span>
          <span>
            sinastryChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(sinastryChart === undefined).toString()}
            </span>
          </span>
          <span>
            arabicParts === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(arabicParts === undefined).toString()}
            </span>
          </span>
          <span>
            archArabicParts === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(archArabicParts === undefined).toString()}
            </span>
          </span>
          <span>
            lunarDerivedChart === undefined:{" "}
            <span className="font-bold text-blue-800">
              {(lunarDerivedChart === undefined).toString()}
            </span>
          </span>
        </div>
      </div>
    );
  }

  function canRenderChart(): boolean {
    if ((menu === "birthChart" || menu === "home") && birthChart) return true;
    if ((menu === "birthChart" || menu === "momentMap") && birthChart) return true;
    if ((menu === "solarReturn" || menu === "lunarReturn") && returnChart) return true;
    if (menu === "sinastry" && sinastryChart) return true;
    if (menu === "secondaryProgressions" && progressionChart && birthChart) return true;
    if (menu === "profection" && profectionChart && birthChart) return true;

    return false;
  }

  const getInitialMenuContent = (): JSX.Element =>
    <Container className="mx-auto mt-10 w-[94%] sm:w-[32rem]">
      <div className="w-full px-4 pt-2 text-center sm:px-2">
        <p className="section-eyebrow mb-3">Leitura Classica</p>
        <h2 className="section-title text-[1.8rem] font-semibold text-amber-50 sm:text-[2.1rem]">
        {getTitleMenuTitle()}
        </h2>
        <p className="section-copy mt-3 text-sm">
          Gere mapas natais, retornos, sinastrias e tecnicas tradicionais em um
          painel pensado para consulta longa e leitura serena.
        </p>
      </div>

      <div className="mt-8 w-full p-4 sm:p-0 flex flex-col gap-3">
        {menu === "home" && (
          <div className="w-full flex flex-col gap-3">
            <button
              className="default-btn"
              onClick={() => setMenu("birthChart")}
            >
              Mapa Natal
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("solarReturn")}
            >
              Revolução Solar
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("lunarReturn")}
            >
              Revolução Lunar
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("sinastry")}
            >
              Combinar mapas (Sinastria)
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("secondaryProgressions")}
            >
              Progressão Secundária
            </button>

            <button
              className="default-btn"
              onClick={() => setMenu("profection")}
            >
              Profecção
            </button>
            <div className="mt-2 rounded-[1.35rem] border border-amber-300/12 bg-white/[0.03] px-4 py-4 text-left">
              <p className="section-eyebrow mb-2 text-[0.62rem]!">
                Metodo
              </p>
              <p className="section-copy text-sm">
                Casas em Regiomontanus, calculo por Swiss Ephemeris e relatorio
                tradicional com dignidades, anticios, partes arabes, secto e
                temperamento.
              </p>
            </div>
          </div>
        )}

        {menu === "birthChart" && (
          <BirthChartForm
            currentBirthDate={chartProfile?.birthDate}
            onSubmit={(profile) => getBirthChart(profile)}
          />
        )}

        {menu === "solarReturn" && (
          <>
            <PresavedChartsDropdown
              onChange={(profile) => setChartProfile(profile)}
            />
            <form
              ref={solarReturnForm}
              className="w-full flex flex-col items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  solarReturnForm.current &&
                  solarReturnForm.current.checkValidity()
                ) {
                  getPlanetReturn("solar");
                } else {
                  solarReturnForm.current?.reportValidity();
                }
              }}
            >
              <input
                required
                className="w-full"
                placeholder="Ano Rev. Solar"
                type="number"
                onChange={(e) => {
                  if (e.target.value.length > 0) {
                    let number = Number.parseInt(e.target.value);
                    if (number < 0) number = 0;
                    if (number > 3000) number = 2999;
                    setSolarYear(number);
                    e.target.value = number.toString();
                  }
                }}
              />

              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    solarReturnForm.current &&
                    solarReturnForm.current.checkValidity()
                  ) {
                    getPlanetReturn("solar");
                  } else {
                    solarReturnForm.current?.reportValidity();
                  }
                }}
                className="default-btn"
              >
                Revolução Solar
              </button>
            </form>
          </>
        )}

        {menu === "lunarReturn" && (
          <>
            <PresavedChartsDropdown
              onChange={(newProfile) => setChartProfile(newProfile)}
            />
            <form
              ref={lunarReturnForm}
              className="w-full flex flex-col justify-between gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  lunarReturnForm.current &&
                  lunarReturnForm.current.checkValidity()
                ) {
                  getPlanetReturn("lunar");
                } else {
                  lunarReturnForm.current?.reportValidity();
                }
              }}
            >
              <div className="w-full flex flex-row justify-between gap-1">
                <input
                  required
                  className="w-1/3"
                  placeholder="Dia"
                  type="number"
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      let val = Number.parseInt(e.target.value);
                      if (val < 1) val = 1;
                      if (val > 31) val = 31;
                      setLunarDay(val);
                      e.target.value = val.toString();
                    }
                  }}
                />

                <select
                  required
                  className="w-1/2"
                  value={lunarMonth}
                  onChange={(e) =>
                    setLunarMonth(Number.parseInt(e.target.value))
                  }
                >
                  {monthsNames.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>

                <input
                  required
                  type="number"
                  className="w-20"
                  placeholder="Ano"
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      let val = Number.parseInt(e.target.value);
                      if (val < 0) val = 0;
                      setLunarYear(val);
                      e.target.value = val.toString();
                    }
                  }}
                />
              </div>

              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    lunarReturnForm.current &&
                    lunarReturnForm.current.checkValidity()
                  ) {
                    getPlanetReturn("lunar");
                  } else {
                    lunarReturnForm.current?.reportValidity();
                  }
                }}
                className="default-btn"
              >
                Revolução Lunar
              </button>
            </form>
          </>
        )}

        {menu === "sinastry" && (
          <SynastrySetupPanel
            personA={chartProfile}
            personB={sinastryProfile}
            interactionKind={synastryInteractionKind}
            customRole={synastryCustomRole}
            userContext={synastryUserContext}
            loading={loading}
            error={synastryError}
            onPersonA={(profile) => { setChartProfile(profile); setSynastryError(undefined); }}
            onPersonB={(profile) => { setSinastryProfile(profile); setSynastryError(undefined); }}
            onInteractionKind={(kind) => { setSynastryInteractionKind(kind); setSynastryError(undefined); }}
            onCustomRole={setSynastryCustomRole}
            onUserContext={setSynastryUserContext}
            onSwap={() => {
              const previousA = chartProfile;
              setChartProfile(sinastryProfile);
              setSinastryProfile(previousA);
              if (synastryInteractionKind === "teacher-student") setSynastryInteractionKind("student-teacher");
              else if (synastryInteractionKind === "student-teacher") setSynastryInteractionKind("teacher-student");
              else if (synastryInteractionKind === "employer-employee") setSynastryInteractionKind("employee-employer");
              else if (synastryInteractionKind === "employee-employer") setSynastryInteractionKind("employer-employee");
              else if (synastryInteractionKind === "father-child") setSynastryInteractionKind("child-father");
              else if (synastryInteractionKind === "child-father") setSynastryInteractionKind("father-child");
              else if (synastryInteractionKind === "mother-child") setSynastryInteractionKind("child-mother");
              else if (synastryInteractionKind === "child-mother") setSynastryInteractionKind("mother-child");
              else if (synastryInteractionKind === "custom") {
                setSynastryCustomRole({
                  houseForA: synastryCustomRole.houseForB,
                  houseForB: synastryCustomRole.houseForA,
                  roleA: synastryCustomRole.roleB,
                  roleB: synastryCustomRole.roleA,
                });
              }
              setSynastryError(undefined);
            }}
            onSubmit={makeSinastryCharts}
          />
        )}

        {menu === "home" && (
          <button
            onClick={() => setMenu("momentMap")}
            className="default-btn"
          >
            Mapa do Momento
          </button>
        )}

        {menu === "secondaryProgressions" && (
          <form
            ref={progressionForm}
            className="w-full flex flex-col justify-between gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              makeSecondaryProgression();
            }}
          >
            <span className="section-copy text-sm">Selecione o mapa:</span>
            <PresavedChartsDropdown
              onChange={(profile) => setChartProfile(profile)}
            />

            <div className="flex flex-row items-center gap-2">
              <label className="text-nowrap">Número de anos:</label>
              <input
                required
                type="number"
                placeholder="ex: 30"
                className="w-full"
                value={progressionYear ?? ""}
                onChange={(e) => {
                  const parsed = Number.parseInt(e.target.value);
                  if (Number.isNaN(parsed)) {
                    setProgressionYear(undefined);
                    return;
                  }

                  let val = parsed;
                  if (val < 0) val = 0;
                  setProgressionYear(val);
                }}
              />
            </div>

            <button
              type="submit"
              className="default-btn"
            >
              Gerar Progressão
            </button>
          </form>
        )}

        {menu === "profection" && (
          <form
            ref={profectionForm}
            className="w-full flex flex-col justify-between gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              getBirthChart();
            }}
          >
            <span className="section-copy text-sm">Selecione o mapa:</span>
            <PresavedChartsDropdown
              onChange={(profile) => setChartProfile(profile)}
            />

            <div className="flex flex-row items-center gap-2">
              <label className="text-nowrap">Número de anos:</label>
              <input
                required
                type="number"
                placeholder="ex: 30"
                className="w-full"
                value={profectionYear ?? ""}
                onChange={(e) => {
                  const parsed = Number.parseInt(e.target.value);
                  if (Number.isNaN(parsed)) {
                    setProfectionYear(undefined);
                    return;
                  }

                  let val = parsed;
                  if (val < 0) val = 0;
                  setProfectionYear(val);
                }}
              />
            </div>

            <button
              type="submit"
              className="default-btn"
            >
              Gerar Profecção
            </button>
          </form>
        )}

        {menu === "momentMap" && (
          <>
            <CitySearch
              onSelect={selectCity}
            />
            <button
              className="default-btn"
              onClick={() => getMomentBirthChart()}
            >
              Gerar Mapa
            </button>
          </>
        )}

        {/* Back btn */}
        {menu !== "home" && (
          <button
            className="default-btn"
            onClick={() => setMenu("home")}
          >
            Voltar
          </button>
        )}

        <span
          className={`w-full text-start flex flex-row items-center justify-center gap-3 mt-2 ${loading ? "opacity-100" : "opacity-0"
            }`}
        >
          <Spinner />
          <span>Carregando...</span>
        </span>
      </div>
    </Container>

  const getChartContent = (): JSX.Element | null => {
    switch (activeChart) {
      case "birth":
        return birthChart ? <div className="w-full flex flex-col items-center">
          <div className="w-full text-left flex flex-col items-center mb-4">
            <ChartAndData
              arabicParts={arabicParts}
              title={`Mapa Natal - ${profileName}`}
              innerChart={birthChart}
              chartDateProps={{
                chartType: "birth",
                birthChart,
              }}
            />
          </div>
        </div> : null;

      case "solarReturn":
      case "lunarReturn":
        return returnChart ? <ReturnChart /> : null;

      case "lunarDerivedReturn":
        return lunarDerivedChart && archArabicParts && arabicParts ? (
          <LunarDerivedChart />
        ) : null;

      case "sinastry":
        return sinastryChart ? (
          <SinastryChart
            sinastryChart={sinastryChart}
            sinastryProfileName={sinastryProfile?.name}
            synastryAnalysis={synastryResult?.analysis}
            synastryReport={synastryResult?.report}
            synastryAI={synastryResult?.ai}
          />
        ) : null;

      case "progression":
        return <SecondaryProgressionChart />;

      case "profection":
        return <ProfectionChart />;

      default: return null;
    }
  }

  if (!isClientReady) {
    return <Container className="w-[90%] md:w-1/4 h-[416px] md:h-[428px] flex flex-col items-center justify-center space-y-3 ">
      <Spinner size="16" />
      <span className="pl-5">Carregando...</span>
    </Container>
  }

  return (
    <div className="mt-8 flex min-h-[50vh] w-full flex-col items-center justify-center gap-2">
      {!canRenderChart() ? getInitialMenuContent() :
        <>
          {isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`absolute w-full h-full top-0 md:top-auto md:h-[108%] px-3 md:px-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-10 
                  md:rounded-2xl transition-all duration-200 ease-in-out opacity-0 animate-[fadeIn_0.2s_forwards]`}
              >
                <Spinner size="16" />
                <h2 className="font-bold text-lg pl-10 mt-3">Carregando...</h2>
              </div>
            </div>
          )}

          <div
            className={`${isTransitioning ? "opacity-0" : "opacity-100"
              } w-full flex items-center justify-center`}
          >
            {getChartContent()}
          </div>
        </>}

      {/* {_getDebugData()} */}

    </div>
  );
}

