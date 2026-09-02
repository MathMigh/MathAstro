export interface MundaneRealCaseAnchor {
  id: string;
  source: string;
  author: "John Frawley" | "Marcos Monteiro";
  status: "source-anchored-regression";
  notes: string[];
}

/**
 * Published worked cases used as regression anchors. These are not training
 * examples invented by the engine; the astronomy is checked independently by
 * scripts/verify_mundane_real_cases.py.
 */
export const MUNDANE_REAL_CASES: MundaneRealCaseAnchor[] = [
  {
    id: "frawley-coventry-1940",
    source: "John Frawley, The Real Astrology Applied, mundane astrology chapter, pp. 135-141",
    author: "John Frawley",
    status: "source-anchored-regression",
    notes: [
      "Coventry radix: 21 Jan 1345, 00:00, 52N25 1W31; historical date handled as Julian in oracle.",
      "1921 Grand Conjunction: 10 Sep 1921, 04:14 GMT.",
      "1921 Aries ingress: 21 Mar 1921, 03:51 GMT.",
      "Eclipse chart used: 3 May 1939, 16:11 GMT.",
      "Raid Full Moon: 15 Nov 1940, 02:23 GMT.",
      "Regression checks source-stated cross-chart contacts rather than merely checking isolated ephemeris values.",
    ],
  },
  {
    id: "marcos-pandemic-2019",
    source: "Marcos Monteiro, Curso Estrelas Fixas, Aula 9 (Astrologia(4).zip)",
    author: "Marcos Monteiro",
    status: "source-anchored-regression",
    notes: [
      "Uses the 2000 Jupiter-Saturn conjunction for the late-2019/early-2020 onset; does not retroactively replace it with the December 2020 conjunction.",
      "Then narrows with the 2 July 2019 solar eclipse, 2019 Aries ingress and 2019 Libra ingress.",
      "Solar-eclipse Sun/Moon conjunction and Fortune/ASC coincidence are treated as definition-induced, not independent testimonies.",
      "Beijing is used as national-level locality rather than retrospectively choosing Wuhan solely because it became the epicentre.",
    ],
  },
];
