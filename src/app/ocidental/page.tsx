import Link from "next/link";

const modules = [
  { href: "/ocidental/natal", icon: "☉", name: "Natal", copy: "Radix técnico e pacote absoluto para IA, preservando a matriz natal dedicada." },
  { href: "/ocidental/horaria", icon: "☽", name: "Horária", copy: "Juízo horário tradicional isolado, com motor, ontologia, cronologia e handoff para IA." },
  { href: "/ocidental/eletiva", icon: "◇", name: "Eletiva", copy: "Seleção e avaliação de momentos, isolada do Natal e da Horária." },
  { href: "/ocidental/preditiva", icon: "↻", name: "Preditiva", copy: "Progressões, revoluções, períodos e gatilhos com consulta integrada." },
  { href: "/ocidental/mundana", icon: "◎", name: "Mundana", copy: "Ciclos maiores, ingressos, eclipses, radices mundanos e gatilhos." },
  { href: "/ocidental/sinastria", icon: "⚭", name: "Sinastria", copy: "Comparação tradicional entre duas natividades, com papéis relacionais e dossiê para IA." },
];

export default function WesternWorldPage() {
  return (
    <main className="western-world min-h-screen px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="section-eyebrow">MathAstro · mundos</Link>
        <div className="mt-12 max-w-3xl">
          <p className="section-eyebrow">Tradição ocidental</p>
          <h1 className="section-title mt-4 text-5xl font-semibold text-amber-100 sm:text-7xl">A esfera e o juízo</h1>
          <p className="section-copy mt-6 text-base sm:text-lg">Um único projeto, seis disciplinas com fronteiras próprias. O núcleo astronômico é compartilhado; o método e o juízo permanecem isolados por módulo.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.href} href={module.href} className="western-glass rounded-[2rem] p-7 transition hover:-translate-y-1">
              <span className="text-3xl">{module.icon}</span>
              <h2 className="section-title mt-6 text-3xl text-amber-100">{module.name}</h2>
              <p className="section-copy mt-3 text-sm">{module.copy}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
