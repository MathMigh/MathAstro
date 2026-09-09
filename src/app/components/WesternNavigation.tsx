"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WorldTopbar from "./WorldTopbar";
import CelestialScene from "./CelestialScene";

const disciplines = [["natal", "Natal"], ["horaria", "Horária"], ["eletiva", "Eletiva"], ["preditiva", "Preditiva"], ["mundana", "Mundana"], ["sinastria", "Sinastria"]] as const;

export default function WesternNavigation() {
  const pathname = usePathname();
  if (pathname === "/ocidental") return null;
  return <header className="western-navigation">
    <WorldTopbar world="western" />
    <nav className="western-navigation__links" aria-label="Disciplinas ocidentais">
      <Link href="/ocidental">Todas as disciplinas</Link>
      {disciplines.map(([slug, label]) => <Link key={slug} href={`/ocidental/${slug}`} aria-current={pathname === `/ocidental/${slug}` ? "page" : undefined}>{label}</Link>)}
    </nav>
    <CelestialScene tradition="western" compact />
  </header>;
}
