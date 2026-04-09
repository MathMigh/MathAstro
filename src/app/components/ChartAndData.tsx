"use client";

import {
  BirthChart,
  ChatDateProps,
} from "@/interfaces/BirthChartInterfaces";
import React, { JSX, useCallback, useEffect, useState } from "react";
import { ArabicPart, ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import AspectsTable from "./aspect-table/AspectsTable";
import AstroChart from "./charts/AstroChart";
import { PlanetAspectData } from "@/interfaces/AstroChartInterfaces";
import { useBirthChart } from "@/contexts/BirthChartContext";
import { useChartMenu } from "@/contexts/ChartMenuContext";
import ArabicPartsLayout from "./ArabicPartsLayout";
import { useArabicParts } from "@/contexts/ArabicPartsContext";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import { ChartDate } from "./ChartDate";
import ChartSelectorArrows from "./ChartSelectorArrows";
import Container from "./Container";
import { SkeletonLine, SkeletonTable } from "./skeletons";
import {
  ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT,
  SKELETON_LOADER_TIME,
} from "../utils/constants";
import Spinner from "./Spinner";

interface Props {
  innerChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts?: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
  tableItemsPerPage?: number;
  onTableItemsPerPageChanged?: (newItemsPerPage: number) => void;
  chartDateProps: ChatDateProps;
  outerChartDateProps?: ChatDateProps;
  title?: string;
}

export default function ChartAndData(props: Props) {
  const {
    innerChart,
    outerChart,
    arabicParts,
    outerArabicParts,
    tableItemsPerPage,
    chartDateProps,
    outerChartDateProps,
    title,
  } = {
    ...props,
  };

  const [loading, setLoading] = useState(true);
  const { isMobileBreakPoint } = useScreenDimensions();
  const [aspectsData, setAspectsData] = useState<PlanetAspectData[]>([]);
  const itemsPerPage =
    tableItemsPerPage ?? ASPECT_TABLE_ITEMS_PER_PAGE_DEFAULT;
  const {
    updateBirthChart,
    updateLunarDerivedChart,
    updateIsCombinedWithBirthChart,
    updateIsCombinedWithReturnChart,
    loadingNextChart,
    isMountingChart,
  } = useBirthChart();
  const {
    resetChartMenus,
    isReturnChart,
    isSinastryChart,
    isProgressionChart,
    isProfectionChart,
  } = useChartMenu();
  const {
    updateArabicParts,
    updateSinastryArabicParts,
    getPartsArray,
    updateSolarReturnParts,
    updateArchArabicParts,
  } = useArabicParts();
  const [partsArray, setPartsArray] = useState<ArabicPart[]>([]);
  const [useInnerParts, setUseInnerParts] = useState(true);
  const [nextChartContentLoaded, setNextChartContentLoaded] = useState(false);

  function updateParts() {
    if (useInnerParts && arabicParts) {
      setPartsArray(getPartsArray(arabicParts));
    } else if (outerArabicParts) {
      setPartsArray(getPartsArray(outerArabicParts));
    }

    setTimeout(() => {
      setLoading(false);
    }, SKELETON_LOADER_TIME);
  }

  useEffect(() => {
    updateParts();
  }, [useInnerParts, arabicParts, outerArabicParts]);

  function handleOnToggleInnerPartsVisualization(showInnerParts: boolean) {
    setUseInnerParts(showInnerParts);
  }

  useEffect(() => {
    if (!loadingNextChart) {
      setNextChartContentLoaded(true);
    } else {
      setNextChartContentLoaded(false);
    }
  }, [loadingNextChart]);

  const handleReset = useCallback(() => {
    updateBirthChart({ chartType: "birth", chartData: undefined });
    updateBirthChart({ chartType: "return", chartData: undefined });
    updateBirthChart({ chartType: "sinastry", chartData: undefined });
    updateBirthChart({ chartType: "progression", chartData: undefined });
    updateBirthChart({ chartType: "profection", chartData: undefined });
    updateLunarDerivedChart(undefined);
    updateArabicParts(undefined);
    updateArchArabicParts(undefined);
    updateSinastryArabicParts(undefined);
    updateSolarReturnParts(undefined);
    updateIsCombinedWithBirthChart(false);
    updateIsCombinedWithReturnChart(false);
    resetChartMenus();
  }, []);

  function handleOnUpdateAspectsData(newAspectData: PlanetAspectData[]) {
    setAspectsData(newAspectData);
  }

  function getTraditionalReportChart(): BirthChart | undefined {
    if (innerChart.traditionalReport) return innerChart;
    if (outerChart?.traditionalReport) return outerChart;
    return undefined;
  }

  function downloadTraditionalReport(reportChart: BirthChart) {
    const blob = new Blob([reportChart.traditionalReport ?? ""], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Mapa_Natal_${chartDateProps.birthChart?.birthDate?.year ?? "Zazastro"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderChart(): JSX.Element {
    const content = (
      <div className="w-full md:min-w-[46rem] 2xl:min-w-[46rem] 3xl:min-w-48rem flex flex-col items-center justify-center relative">
        {(loadingNextChart || isMountingChart) && (
          <div
            className={`absolute w-full h-full top-0 md:top-auto md:h-[108%] px-3 md:px-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-10 
              md:rounded-2xl transition-all duration-200 ease-in-out opacity-0 animate-[fadeIn_0.2s_forwards]`}
          >
            <Spinner size="16" />
            <h2 className="font-bold text-lg pl-10 mt-3">Carregando...</h2>
          </div>
        )}

        <>
          <ChartSelectorArrows className="w-full mb-2 md:px-6">
            {title && (
              <h1 className="text-lg md:text-2xl font-bold text-center">
                {title}
              </h1>
            )}
          </ChartSelectorArrows>
          <div className="mb-2">
            <ChartDate {...chartDateProps} />
            {outerChartDateProps && <ChartDate {...outerChartDateProps} />}
          </div>

          {innerChart && (
            <AstroChart
              props={{
                planets: innerChart.planets,
                housesData: innerChart.housesData,
                arabicParts: arabicParts,
                outerPlanets: outerChart?.planets,
                outerHouses: outerChart?.housesData,
                outerArabicParts,
                fixedStars: innerChart.fixedStars,
                onUpdateAspectsData: handleOnUpdateAspectsData,
                useReturnSelectorArrows:
                  isReturnChart() ||
                  isProgressionChart() ||
                  isProfectionChart(),
              }}
            />
          )}

          <button
            type="button"
            className="default-btn w-full! md:w-[25.5rem]! mt-6 mb-2"
            onClick={handleReset}
          >
            Menu Principal
          </button>
        </>
      </div>
    );

    return isMobileBreakPoint() ? (
      <div className="flex flex-col items-center">{content}</div>
    ) : (
      <Container
        className={`px-0! lg:mx-2 2xl:mx-6 ${isSinastryChart() ? "px-0!" : ""}`}
      >
        {content}
      </Container>
    );
  }

  function renderArabicPartsAndAspectsTable(): JSX.Element {
    const tableContent = (
      <>
        <AspectsTable
          aspects={aspectsData}
          birthChart={innerChart}
          outerChart={outerChart}
          arabicParts={arabicParts!}
          outerArabicParts={outerArabicParts}
          initialItemsPerPage={itemsPerPage}
        />
      </>
    );

    return (
      <>
        {!isMobileBreakPoint() && (
          <div className="md:w-[450px] 2xl:w-[450px] 3xl:w-[500px] flex flex-col gap-4 2xl:mr-[-15px] 3xl:mr-zero">
            <Container>
              {loading || loadingNextChart ? (
                <div className="w-full">
                  <SkeletonLine width="w-1/3" className="mb-4" />
                  <SkeletonTable rows={8} />
                </div>
              ) : (
                <ArabicPartsLayout
                  parts={partsArray}
                  showMenuButtons={true}
                  showSwitchParts
                  onToggleInnerPartsVisualization={
                    handleOnToggleInnerPartsVisualization
                  }
                />
              )}
            </Container>

            {arabicParts && innerChart && (
              <Container className="">{tableContent}</Container>
            )}
          </div>
        )}

        {isMobileBreakPoint() && (
          <>
            {loading || loadingNextChart ? (
              <div className="w-full">
                <SkeletonLine width="w-1/3" className="mb-4" />
                <SkeletonTable rows={8} />
              </div>
            ) : (
              <ArabicPartsLayout
                parts={partsArray}
                showMenuButtons={true}
                showSwitchParts
                onToggleInnerPartsVisualization={
                  handleOnToggleInnerPartsVisualization
                }
              />
            )}

            {arabicParts && innerChart && (
              <div className="md:absolute md:top-full mb-4 md:mb-0">
                {tableContent}
              </div>
            )}
          </>
        )}
      </>
    );
  }

  function renderTraditionalReport(): JSX.Element | null {
    const reportChart = getTraditionalReportChart();

    if (!reportChart && !nextChartContentLoaded) {
      const skeleton = (
        <div className="w-full h-full flex flex-col">
          <SkeletonLine width="w-1/3" className="mb-4" />
          <SkeletonTable rows={12} cols={1} />
        </div>
      );

      return isMobileBreakPoint() ? (
        <div className="w-full md:w-[26rem]">{skeleton}</div>
      ) : (
        <Container className="xl:w-full 2xl:w-[18.5rem] 3xl:w-29rem px-6! 2xl:ml-[-15px] 3xl:ml-zero">
          {skeleton}
        </Container>
      );
    }

    if (!reportChart?.traditionalReport) {
      return null;
    }

    const reportContent = (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <h2 className="font-bold self-start text-lg">
            Relatorio Tradicional
          </h2>
          <button
            type="button"
            onClick={() => downloadTraditionalReport(reportChart)}
            className="text-xs bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-white/70"
          >
            Download .txt
          </button>
        </div>

        <pre className="whitespace-pre-wrap font-mono text-[0.8rem] md:text-[0.9rem] leading-relaxed text-indigo-100/90 overflow-x-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-white/10">
          {reportChart.traditionalReport}
        </pre>
      </div>
    );

    return isMobileBreakPoint() ? (
      <div className="w-full md:w-[26rem]">{reportContent}</div>
    ) : (
      <Container className="xl:w-full 2xl:w-[18.5rem] 3xl:w-29rem px-6! 2xl:ml-[-15px] 3xl:ml-zero">
        {reportContent}
      </Container>
    );
  }

  return (
    <div className="w-[95%] md:w-full flex flex-col md:flex-row md:items-start md:justify-center mt-1 mb:mb-4">
      {isMobileBreakPoint() && (
        <>
          {renderChart()}
          {renderTraditionalReport()}
          {renderArabicPartsAndAspectsTable()}
        </>
      )}

      {!isMobileBreakPoint() && (
        <div className="w-full flex flex-row items-start justify-center mb-4">
          {renderArabicPartsAndAspectsTable()}
          {renderChart()}
          {renderTraditionalReport()}
        </div>
      )}
    </div>
  );
}
