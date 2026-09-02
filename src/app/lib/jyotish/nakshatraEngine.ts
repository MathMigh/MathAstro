import type { VedicPoint, VedicSnapshot } from "../vedic";
import type { EngineResult, JyotishModuleKey } from "./types";
import { createDatum, createSection, createTable } from "./engineHelpers";

interface NakshatraProfile {
  gana: "Deva" | "Manushya" | "Rakshasa";
  yoni: string;
  nadi: "Adi" | "Madhya" | "Antya";
  symbol: string;
  shakti: string;
  nature: string;
}

const NAKSHATRA_PROFILES: NakshatraProfile[] = [
  { gana: "Deva", yoni: "Horse", nadi: "Adi", symbol: "Horse head", shakti: "cura rapida", nature: "Light/Swift" },
  { gana: "Manushya", yoni: "Elephant", nadi: "Madhya", symbol: "Yoni", shakti: "renovacao e purificacao", nature: "Fierce/Ugra" },
  { gana: "Rakshasa", yoni: "Sheep", nadi: "Antya", symbol: "Knife", shakti: "cortar ilusoes", nature: "Mixed/Common" },
  { gana: "Manushya", yoni: "Serpent", nadi: "Antya", symbol: "Ox cart / red one", shakti: "fazer crescer", nature: "Fixed/Dhruva" },
  { gana: "Deva", yoni: "Serpent", nadi: "Madhya", symbol: "Deer head", shakti: "buscar e encontrar", nature: "Soft/Mridu" },
  { gana: "Manushya", yoni: "Dog", nadi: "Adi", symbol: "Teardrop", shakti: "agir pela emocao", nature: "Sharp/Tikshna" },
  { gana: "Deva", yoni: "Cat", nadi: "Adi", symbol: "Quiver / arrows", shakti: "renovar e recuperar", nature: "Movable/Chara" },
  { gana: "Deva", yoni: "Sheep", nadi: "Madhya", symbol: "Cow udder", shakti: "gerar energia espiritual", nature: "Light/Swift" },
  { gana: "Rakshasa", yoni: "Cat", nadi: "Antya", symbol: "Snake", shakti: "veneno e medicina", nature: "Sharp/Tikshna" },
  { gana: "Rakshasa", yoni: "Rat", nadi: "Antya", symbol: "Throne", shakti: "deixar o corpo / ancestralidade", nature: "Fierce/Ugra" },
  { gana: "Manushya", yoni: "Rat", nadi: "Adi", symbol: "Front legs of bed", shakti: "criacao e familia", nature: "Fierce/Ugra" },
  { gana: "Manushya", yoni: "Cow", nadi: "Adi", symbol: "Back legs of bed", shakti: "acumular seguranca", nature: "Fixed/Dhruva" },
  { gana: "Deva", yoni: "Buffalo", nadi: "Madhya", symbol: "Hand", shakti: "manifestar desejos", nature: "Light/Swift" },
  { gana: "Rakshasa", yoni: "Tiger", nadi: "Madhya", symbol: "Jewel", shakti: "acumular merito", nature: "Soft/Mridu" },
  { gana: "Deva", yoni: "Buffalo", nadi: "Antya", symbol: "Sword / coral", shakti: "espalhar-se como o vento", nature: "Movable/Chara" },
  { gana: "Rakshasa", yoni: "Tiger", nadi: "Antya", symbol: "Triumphal arch", shakti: "alcancar metas", nature: "Mixed/Common" },
  { gana: "Deva", yoni: "Deer", nadi: "Madhya", symbol: "Lotus", shakti: "adoracao / bhakti", nature: "Soft/Mridu" },
  { gana: "Rakshasa", yoni: "Deer", nadi: "Adi", symbol: "Umbrella", shakti: "conquistar e ter coragem", nature: "Sharp/Tikshna" },
  { gana: "Rakshasa", yoni: "Dog", nadi: "Adi", symbol: "Roots", shakti: "transformar pela raiz", nature: "Sharp/Tikshna" },
  { gana: "Manushya", yoni: "Monkey", nadi: "Madhya", symbol: "Elephant tusk / fan", shakti: "invigorar", nature: "Fierce/Ugra" },
  { gana: "Manushya", yoni: "Mongoose", nadi: "Antya", symbol: "Elephant tusk / planks", shakti: "vitoria completa", nature: "Fixed/Dhruva" },
  { gana: "Deva", yoni: "Monkey", nadi: "Antya", symbol: "Ear", shakti: "conectar e ouvir", nature: "Movable/Chara" },
  { gana: "Rakshasa", yoni: "Lion", nadi: "Madhya", symbol: "Drum", shakti: "dar fama e abundancia", nature: "Movable/Chara" },
  { gana: "Rakshasa", yoni: "Horse", nadi: "Adi", symbol: "Circle", shakti: "cura e segredo", nature: "Movable/Chara" },
  { gana: "Manushya", yoni: "Lion", nadi: "Adi", symbol: "Front legs of bed / sword", shakti: "respirar fogo espiritual", nature: "Fierce/Ugra" },
  { gana: "Manushya", yoni: "Cow", nadi: "Madhya", symbol: "Back legs of bed", shakti: "trazer chuva cosmica", nature: "Fixed/Dhruva" },
  { gana: "Deva", yoni: "Elephant", nadi: "Antya", symbol: "Drum / fish", shakti: "nutrir e transcender", nature: "Soft/Mridu" },
];
const VARNA_BY_SIGN = [
  "Kshatriya",
  "Vaishya",
  "Shudra",
  "Brahmin",
  "Kshatriya",
  "Vaishya",
  "Shudra",
  "Brahmin",
  "Kshatriya",
  "Vaishya",
  "Shudra",
  "Brahmin",
] as const;
const TARA_NAMES = [
  "Janma",
  "Sampat",
  "Vipat",
  "Kshema",
  "Pratyari",
  "Sadhaka",
  "Naidhana",
  "Mitra",
  "Parama Mitra",
] as const;
const SUPPORTIVE_TARAS = new Set([1, 3, 5, 7, 8]);

function cycleDistance(fromIndex: number, toIndex: number, size: number) {
  return ((toIndex - fromIndex) % size + size) % size;
}

function getProfile(point: VedicPoint) {
  return NAKSHATRA_PROFILES[point.nakshatraIndex] ?? NAKSHATRA_PROFILES[0];
}

function getTaraFromMoon(moon: VedicPoint, point: VedicPoint) {
  const index = cycleDistance(moon.nakshatraIndex, point.nakshatraIndex, 27) % 9;
  return {
    label: TARA_NAMES[index],
    index: index + 1,
    supportive: SUPPORTIVE_TARAS.has(index),
  };
}

export function nakshatraEngine(
  module: JyotishModuleKey,
  snapshot: VedicSnapshot
): EngineResult {
  const moon = snapshot.planets.find((point) => point.key === "moon") ?? snapshot.ascendant;
  const asc = snapshot.ascendant;
  const janmaProfile = getProfile(moon);
  const lagnaProfile = getProfile(asc);
  const d1Rows = [snapshot.ascendant, ...snapshot.planets].map((point) => {
    const profile = getProfile(point);
    const tara = getTaraFromMoon(moon, point);

    return {
      point,
      profile,
      tara,
    };
  });
  const supportiveCount = d1Rows.filter((row) => row.tara.supportive).length;

  return {
    sections: [
      createSection({
        id: `${module}-nakshatra-profile`,
        title: "Nakshatras e Padas",
        description:
          "Abre o perfil natal dos nakshatras do D1 com gana, yoni, nadi, tara a partir da Lua e a malha completa de padas dos vargas reportados.",
        status: "implemented",
        items: [
          createDatum(module, "Nakshatra", "Janma Nakshatra", `${moon.nakshatra} P${moon.pada}`, {
            technicalNotes:
              `${moon.name} em ${moon.nakshatra}, gana ${janmaProfile.gana}, yoni ${janmaProfile.yoni}, nadi ${janmaProfile.nadi}, ` +
              `varna ${VARNA_BY_SIGN[moon.signIndex]}, simbolo ${janmaProfile.symbol}, shakti ${janmaProfile.shakti} e purushartha ${snapshot.nakshatraDetails.find((detail) => detail.chartKey === "D1" && detail.pointKey === moon.key)?.purpose ?? "--"}.`,
            relatedPlanet: moon.name,
            relatedNakshatra: moon.nakshatra,
            relatedSign: moon.signName,
            confidence: 0.84,
            status: "implemented",
            methodUsed: "janma-nakshatra-profile-v1",
          }),
          createDatum(module, "Nakshatra", "Nakshatra do Lagna", `${asc.nakshatra} P${asc.pada}`, {
            technicalNotes:
              `Lagna em ${asc.nakshatra}, gana ${lagnaProfile.gana}, yoni ${lagnaProfile.yoni}, nadi ${lagnaProfile.nadi} e tara ${getTaraFromMoon(moon, asc).label} a partir da Lua.`,
            relatedPlanet: asc.name,
            relatedNakshatra: asc.nakshatra,
            relatedSign: asc.signName,
            confidence: 0.8,
            status: "implemented",
            methodUsed: "lagna-nakshatra-profile-v1",
          }),
          createDatum(module, "Nakshatra", "Pontos em taras de apoio", supportiveCount, {
            technicalNotes:
              "Conta quantos pontos do D1 caem nas taras Sampat, Kshema, Sadhaka, Mitra ou Parama Mitra a partir do Janma Nakshatra.",
            confidence: 0.74,
            status: "implemented",
            methodUsed: "tara-bala-grid-v1",
          }),
        ],
        tables: [
          createTable(
            `${module}-nakshatra-d1-profile`,
            "Perfil de Nakshatra do D1",
            ["Ponto", "Nakshatra", "Pada", "Gana", "Yoni", "Nadi", "Varna", "Simbolo", "Shakti", "Natureza", "Tara da Lua", "Purushartha"],
            d1Rows.map((row) => [
              row.point.name,
              row.point.nakshatra,
              row.point.pada.toString(),
              row.profile.gana,
              row.profile.yoni,
              row.profile.nadi,
              VARNA_BY_SIGN[row.point.signIndex],
              row.profile.symbol,
              row.profile.shakti,
              row.profile.nature,
              `${row.tara.label} (${row.tara.index})`,
              snapshot.nakshatraDetails.find(
                (detail) => detail.chartKey === "D1" && detail.pointKey === row.point.key
              )?.purpose ?? "--",
            ]),
            "A tara e contada desde o Janma Nakshatra da Lua, para deixar o fluxo lunar e a malha relacional dos pontos visiveis."
          ),
          createTable(
            `${module}-nakshatra-table`,
            "Detalhe de Nakshatra",
            ["Carta", "Ponto", "Signo", "Nakshatra", "Pada", "Lord", "Deidade", "Purushartha"],
            snapshot.nakshatraDetails.map((detail) => [
              detail.chartKey,
              detail.pointName,
              detail.signName,
              detail.nakshatra,
              detail.pada.toString(),
              detail.lord,
              detail.deity,
              detail.purpose,
            ]),
            "Base expandida para cruzar padas, dashas lunares, matching e leituras por varga."
          ),
        ],
      }),
    ],
    summary: [
      `Janma Nakshatra ${moon.nakshatra} P${moon.pada} com perfil ${janmaProfile.gana}/${janmaProfile.yoni}/${janmaProfile.nadi}.`,
      `Malha do D1 abriu ${supportiveCount} ponto(s) em taras de apoio a partir da Lua.`,
    ],
  };
}
