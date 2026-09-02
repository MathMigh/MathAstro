import Link from "next/link";
import WorldTopbar from "./WorldTopbar";

const modules = [
  {
    href: "/ocidental/natal",
    glyph: "☉",
    number: "01",
    name: "Natal",
    kicker: "Natividade",
    copy: "Temperamento, alma, mentalidade, profissão, riqueza, relações e o conjunto do mapa radical.",
  },
  {
    href: "/ocidental/horaria",
    glyph: "☽",
    number: "02",
    name: "Horária",
    kicker: "Pergunta",
    copy: "Significadores, perfeição, recepções, impedimentos, cronologia e juízo de uma questão concreta.",
  },
  {
    href: "/ocidental/eletiva",
    glyph: "✦",
    number: "03",
    name: "Eletiva",
    kicker: "Momento",
    copy: "Seleção e comparação de tempos para uma ação, sem confundir triagem com eleição plena.",
  },
  {
    href: "/ocidental/preditiva",
    glyph: "↻",
    number: "04",
    name: "Preditiva",
    kicker: "Tempo",
    copy: "Revoluções, progressões, profecções, períodos e gatilhos organizados num motor auditável.",
  },
  {
    href: "/ocidental/mundana",
    glyph: "♁",
    number: "05",
    name: "Mundana",
    kicker: "Mundo",
    copy: "Ingressos, eclipses, ciclos e cartas para acontecimentos coletivos, políticos e territoriais.",
  },
  {
    href: "/ocidental/sinastria",
    glyph: "⚭",
    number: "06",
    name: "Sinastria",
    kicker: "Relação",
    copy: "Duas natividades, papéis relacionais, vínculos entre mapas e dossiê técnico de comparação.",
  },
] as const;

export default function WesternPortal() {
  return (
    <main className="western-portal">
      <div className="western-portal__atmosphere" aria-hidden />
      <WorldTopbar world="western" />

      <header className="western-portal__hero">
        <div className="western-portal__seal" aria-hidden>
          <span />
          <i />
          <b />
        </div>
        <div>
          <p className="western-portal__eyebrow">tradição ocidental · seis disciplinas</p>
          <h1>Astrologia Ocidental</h1>
        </div>
        <p>
          O mesmo céu calculado alimenta áreas diferentes; o método de cada arte permanece isolado.
          Escolha o tipo de julgamento, não apenas um “tipo de mapa”.
        </p>
      </header>

      <section className="western-module-grid" aria-label="Módulos da astrologia ocidental">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="western-module-card">
            <div className="western-module-card__head">
              <span className="western-module-card__number">{module.number}</span>
              <span className="western-module-card__glyph" aria-hidden>{module.glyph}</span>
            </div>
            <div className="western-module-card__body">
              <p>{module.kicker}</p>
              <h2>{module.name}</h2>
              <span>{module.copy}</span>
            </div>
            <div className="western-module-card__foot">
              <span>Abrir disciplina</span>
              <b aria-hidden>→</b>
            </div>
          </Link>
        ))}
      </section>

      <footer className="western-portal__footer">
        <Link href="/">← três tradições</Link>
        <span>Natal · Horária · Eletiva · Preditiva · Mundana · Sinastria</span>
      </footer>
    </main>
  );
}
