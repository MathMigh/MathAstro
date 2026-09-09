import type { Metadata } from "next";
import VedicApp from "../components/vedic/VedicApp";

export const metadata: Metadata = {
  title: "Astrologia Védica | Math, o Mágico",
  description:
    "Rasi, Navamsa, Vimshottari Dasha, Gochar, matching e Panchanga em uma suíte védica.",
};

export default function VedicPage() {
  return <VedicApp />;
}
