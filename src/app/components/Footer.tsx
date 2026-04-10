import { CgWebsite } from "react-icons/cg";
import { SiGithub } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="mt-10 w-full border-t border-amber-300/10 pt-6 text-stone-300/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:gap-6">
        <p className="text-sm tracking-[0.16em] uppercase text-stone-300/55">
          &copy; {new Date().getFullYear()} MathAstro
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5 text-lg">
          <a
            href="https://mathastro.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir o site"
            className="flex items-center gap-2 hover:text-amber-200"
          >
            <CgWebsite size={20} />
            <span className="hidden sm:inline">Site</span>
          </a>

          <a
            href="https://github.com/MathMigh/MathAstro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir o repositório"
            className="flex items-center gap-2 hover:text-amber-200"
          >
            <SiGithub size={20} />
            <span className="hidden sm:inline">Repositório</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
