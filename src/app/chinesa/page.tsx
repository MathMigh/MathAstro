import Link from "next/link";
export default function ChineseWorldPage() {
  return <main className="chinese-world min-h-screen px-5 py-12"><div className="mx-auto max-w-5xl"><Link href="/" className="text-xs uppercase tracking-[0.25em] text-red-100/65">MathAstro · mundos</Link><div className="mt-20 max-w-3xl"><div className="mb-8 h-px w-40 bg-red-100/30"/><h1 className="font-serif text-5xl text-red-50 sm:text-7xl">中國術數</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-red-50/70">O domínio chinês permanecerá independente, com identidade, dados e regras próprios. Será desenvolvido depois, sem acoplamento ao núcleo ocidental ou védico.</p><p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-red-100/55">Ainda não implementado</p></div></div></main>;
}
