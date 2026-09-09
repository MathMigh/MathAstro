import Link from "next/link";

type World = "home" | "western" | "chinese" | "vedic";

const nav = [
  { href: "/chinesa", label: "Chinesa", key: "chinese" as const },
  { href: "/ocidental", label: "Ocidental", key: "western" as const },
  { href: "/vedica", label: "Védica", key: "vedic" as const },
];

export default function WorldTopbar({ world = "home" }: { world?: World }) {
  return (
    <div className="world-topbar">
      <Link href="/" className="world-brand" aria-label="Math, o Mágico — início">
        <span className="world-brand__name">Math, o Mágico</span>
        <span className="world-brand__meta">plataforma astrológica integral</span>
      </Link>

      <nav className="world-nav" aria-label="Tradições astrológicas">
        {nav.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            data-active={world === item.key || undefined}
            aria-current={world === item.key ? "page" : undefined}
            className={`world-nav__link world-nav__link--${item.key}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
