import Link from "next/link";
import PredictiveWorkspace from "./PredictiveWorkspace";

export default function WesternPredictivePage() {
  return (
    <main className="western-world min-h-screen px-4 py-6 sm:px-7 lg:px-10">
      <div className="mx-auto mb-7 flex w-full max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="section-title text-2xl font-semibold text-amber-100">Math, o Mágico</Link>
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-stone-400">
          <Link href="/ocidental" className="rounded-full border border-amber-200/15 px-4 py-2 hover:text-amber-100">Ocidental</Link>
          <Link href="/ocidental/natal" className="rounded-full border border-amber-200/15 px-4 py-2 hover:text-amber-100">Natal</Link>
          <span className="rounded-full border border-amber-200/30 bg-amber-200/8 px-4 py-2 text-amber-100">Preditiva</span>
        </nav>
      </div>
      <PredictiveWorkspace />
    </main>
  );
}
