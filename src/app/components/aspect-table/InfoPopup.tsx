import Image from "next/image";
import React from "react";

export default function InfoPopup() {
  const aspectImgSize = 15;

  return (
    <div className="absolute z-10 w-full overflow-hidden rounded-[1.35rem] border border-amber-200 bg-[linear-gradient(180deg,#fffdf8_0%,#f5ead7_100%)] text-slate-800 shadow-[0_16px_45px_rgba(0,0,0,0.14)]">
      <div className="border-b border-amber-200 px-4 py-3">
        <h2 className="text-center text-lg font-bold">Legenda</h2>
      </div>

      <div className="flex flex-col gap-4 p-4 text-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-[1rem] font-bold text-slate-900">Aspectos</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <LegendItem image="/aspects/sextile.png" label="Sextil" size={aspectImgSize} />
            <LegendItem image="/aspects/square.png" label="Quadratura" size={aspectImgSize} />
            <LegendItem image="/aspects/trine.png" label="Trígono" size={aspectImgSize} />
            <LegendItem image="/aspects/opposition.png" label="Oposição" size={aspectImgSize} />
            <LegendItem image="/aspects/conjunction.png" label="Conjunção" size={aspectImgSize} />
          </div>
          <p className="rounded-xl bg-white/70 px-3 py-2 text-[0.8rem] text-slate-700">
            {"Orbe fixa tradicional de 3° para conjunção, sextil, quadratura, trígono e oposição."}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[1rem] font-bold text-slate-900">Elementos</h2>
          <div>{"(C): Casa astrológica"}</div>
          <div>(E): Elementos do mapa externo</div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-[1rem] font-bold text-slate-900">Tipo de aspecto</h2>
          <div>(A): Aplicativo</div>
          <div>(S): Separativo</div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({
  image,
  label,
  size,
}: {
  image: string;
  label: string;
  size: number;
}) {
  return (
    <div className="flex flex-row items-center gap-2 rounded-xl bg-white/70 px-3 py-2">
      <Image
        alt={label}
        src={image}
        width={size}
        height={size}
        unoptimized
      />
      <span>{label}</span>
    </div>
  );
}
