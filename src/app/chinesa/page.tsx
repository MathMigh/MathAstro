import type { Metadata } from "next";
import ChineseAstrologyApp from "../components/chinese/ChineseAstrologyApp";

export const metadata: Metadata = {
  title: "Astrologia Chinesa | Math, o Mágico",
  description:
    "BaZi com sinastria interna, Zi Wei Dou Shu, Qi Men Dun Jia, Da Liu Ren, Tai Yi Shen Shu, Wen Wang Gua e Tong Shu.",
};

export default function ChineseAstrologyPage() {
  return <ChineseAstrologyApp />;
}
