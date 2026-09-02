import Link from "next/link";
import { ArabicPartsContextProvider } from "@/contexts/ArabicPartsContext";
import { AspectsContextProvider } from "@/contexts/AspectsContext";
import { BirthChartContextProvider } from "@/contexts/BirthChartContext";
import { ChartMenuContextProvider } from "@/contexts/ChartMenuContext";
import { ProfilesContextProvider } from "@/contexts/ProfilesContext";
import { ScreenDimensionsContextProvider } from "@/contexts/ScreenDimensionsContext";
import BirthChart from "@/app/components/charts/BirthChart";

export default function WesternSynastryPage() {
  return (
    <main className="western-world min-h-screen px-4 py-6 sm:px-7 lg:px-10">
      <div className="mx-auto mb-7 flex w-full max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="section-title text-2xl font-semibold text-amber-100">Math, o Mágico</Link>
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-400">
          <Link href="/ocidental" className="rounded-full border border-amber-200/15 px-4 py-2 hover:text-amber-100">Ocidental</Link>
          <span className="rounded-full border border-amber-200/30 bg-amber-200/8 px-4 py-2 text-amber-100">Sinastria</span>
        </nav>
      </div>
      <ProfilesContextProvider>
        <ChartMenuContextProvider>
          <BirthChartContextProvider>
            <ArabicPartsContextProvider>
              <AspectsContextProvider>
                <ScreenDimensionsContextProvider>
                  <BirthChart initialMenu="sinastry" />
                </ScreenDimensionsContextProvider>
              </AspectsContextProvider>
            </ArabicPartsContextProvider>
          </BirthChartContextProvider>
        </ChartMenuContextProvider>
      </ProfilesContextProvider>
    </main>
  );
}
