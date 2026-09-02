import type { Metadata } from "next";
import VedicApp from "../components/vedic/VedicApp";

export const metadata: Metadata = {
  title: "Astrologia Vedica | Math, o Mágico",
  description:
    "Rasi, Navamsa, Vimshottari Dasha, Gochar, Matching e Panchanga em uma suite vedica.",
};

export default function VedicPage() {
  return <VedicApp />;
}
