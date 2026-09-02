import Link from "next/link";
export default function VedicWorldPage() {
  return <main className="vedic-world min-h-screen px-5 py-12"><div className="mx-auto max-w-5xl"><Link href="/" className="text-xs uppercase tracking-[0.25em] text-orange-900/70">MathAstro · mundos</Link><div className="mt-20 max-w-3xl"><div className="mb-8 h-px w-40 bg-orange-900/40"/><h1 className="font-serif text-5xl text-orange-950 sm:text-7xl">Jyotiṣa</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-orange-950/70">Um mundo separado, reservado para a futura implementação védica. Nenhuma regra deste domínio é importada pelo motor ocidental.</p><p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-orange-900/60">Ainda não implementado</p></div></div></main>;
}
