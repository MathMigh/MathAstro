"use client";

import Link from "next/link";
import { useState } from "react";
import WorldTopbar from "./WorldTopbar";
import CelestialScene from "./CelestialScene";

type TraditionKey = "chinese" | "western" | "vedic";

const traditions = [
  {
    href: "/chinesa",
    key: "chinese" as const,
    index: "01",
    eyebrow: "中國術數 · ciclos e configuração",
    title: "Astrologia\nChinesa",
    copy: "BaZi, Zi Wei Dou Shu, Qi Men, Tong Shu e os grandes sistemas clássicos chineses.",
    cta: "Entrar na tradição chinesa",
  },
  {
    href: "/ocidental",
    key: "western" as const,
    index: "02",
    eyebrow: "astrologia tradicional · forma e juízo",
    title: "Astrologia\nOcidental",
    copy: "O mapa natal, as perguntas, os encontros e o tempo de cada escolha.",
    cta: "Entrar na tradição ocidental",
  },
  {
    href: "/vedica",
    key: "vedic" as const,
    index: "03",
    eyebrow: "ज्योतिष · luz e tempo",
    title: "Astrologia\nVédica",
    copy: "Janma, Prashna, Muhurta, Varshaphala, Dashas, Gochara, Vivaha e Jyotiṣa técnico.",
    cta: "Entrar na tradição védica",
  },
];

const westernModules = [
  ["/ocidental/natal", "Natal", "Natividade"],
  ["/ocidental/horaria", "Horária", "Pergunta"],
  ["/ocidental/eletiva", "Eletiva", "Momento"],
  ["/ocidental/preditiva", "Preditiva", "Tempo"],
  ["/ocidental/mundana", "Mundana", "Mundo"],
  ["/ocidental/sinastria", "Sinastria", "Relação"],
] as const;

function ChineseDiagram() {
  return (
    <svg viewBox="0 0 520 520" className="gateway-diagram" aria-hidden>
      <circle cx="260" cy="260" r="184" />
      <circle cx="260" cy="260" r="130" />
      <circle cx="260" cy="260" r="66" />
      <path d="M260 76v368M76 260h368M130 130l260 260M390 130 130 390" />
      <path d="M260 130c52 0 94 42 94 94s-42 94-94 94-94 42-94 94" />
      <path d="M260 130c-52 0-94 42-94 94s42 94 94 94 94 42 94 94" />
      <circle cx="260" cy="224" r="8" className="gateway-diagram__solid" />
      <circle cx="260" cy="354" r="8" className="gateway-diagram__solid" />
    </svg>
  );
}

function WesternDiagram() {
  return (
    <svg viewBox="0 0 520 520" className="gateway-diagram" aria-hidden>
      <circle cx="260" cy="260" r="194" />
      <circle cx="260" cy="260" r="138" />
      <ellipse cx="260" cy="260" rx="194" ry="76" />
      <ellipse cx="260" cy="260" rx="76" ry="194" />
      <path d="M95 157 425 363M95 363 425 157" />
      <path d="M260 66v388M66 260h388" />
      <circle cx="260" cy="260" r="22" className="gateway-diagram__solid gateway-diagram__pulse" />
      <circle cx="405" cy="210" r="6" className="gateway-diagram__solid" />
      <circle cx="146" cy="365" r="5" className="gateway-diagram__solid" />
    </svg>
  );
}

function VedicDiagram() {
  return (
    <svg viewBox="0 0 520 520" className="gateway-diagram" aria-hidden>
      <circle cx="260" cy="260" r="190" />
      <circle cx="260" cy="260" r="136" />
      <path d="M260 92 405 342H115Z" />
      <path d="M260 428 115 178h290Z" />
      <path d="m260 140 104 180H156Z" />
      <path d="m260 380-104-180h208Z" />
      <circle cx="260" cy="260" r="26" className="gateway-diagram__solid" />
    </svg>
  );
}

function Diagram({ type }: { type: TraditionKey }) {
  if (type === "chinese") return <ChineseDiagram />;
  if (type === "vedic") return <VedicDiagram />;
  return <WesternDiagram />;
}

export default function TraditionGateway() {
  const [active, setActive] = useState<TraditionKey | null>(null);

  return (
    <main className="gateway-shell">
      <div className="gateway-noise" aria-hidden />
      <WorldTopbar world="home" />

      <section className="gateway-intro" aria-labelledby="gateway-title">
        <div>
          <p className="gateway-kicker">três tradições · métodos preservados</p>
          <h1 id="gateway-title">Três tradições.<br />Seu encontro com o céu.</h1>
        </div>
        <p>
          Do movimento dos astros às perguntas da vida. Explore cada tradição em sua própria linguagem.
        </p>
      </section>

      <CelestialScene />

      <section
        className="gateway-grid"
        aria-label="Tradições astrológicas"
        data-active={active ?? "none"}
        onMouseLeave={() => setActive(null)}
      >
        {traditions.map((tradition) => (
          <Link
            key={tradition.key}
            href={tradition.href}
            className={`gateway-panel gateway-panel--${tradition.key}`}
            onMouseEnter={() => setActive(tradition.key)}
            onFocus={() => setActive(tradition.key)}
            onBlur={() => setActive(null)}
          >
            <div className="gateway-panel__wash" aria-hidden />
            <div className="gateway-panel__grid" aria-hidden />
            <div className="gateway-panel__number" aria-hidden>{tradition.index}</div>

            <div className="gateway-panel__topline">
              <span>{tradition.eyebrow}</span>
              <i aria-hidden />
            </div>

            <div className="gateway-panel__content">
              <h2>
                {tradition.title.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p>{tradition.copy}</p>
            </div>

            <div className="gateway-panel__cta">
              <span>{tradition.cta}</span>
              <b aria-hidden>↗</b>
            </div>
          </Link>
        ))}
      </section>

      <section className="gateway-secondary" aria-label="Disciplinas da astrologia ocidental">
        <div className="gateway-secondary__intro">
          <span>Dentro do Ocidente</span>
          <p>Uma pergunta, um nascimento, um momento para escolher.</p>
        </div>
        <div className="gateway-secondary__links">
          {westernModules.map(([href, name, meta], index) => (
            <Link href={href} key={href}>
              <em>{String(index + 1).padStart(2, "0")}</em>
              <strong>{name}</strong>
              <span>{meta}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="gateway-foot">
        <span>MathAstro · Math, o Mágico</span>
        <span>O céu, em suas muitas leituras.</span>
      </footer>
    </main>
  );
}
