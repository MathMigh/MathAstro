import type { MundaneAuthorMode, MundaneFocus, MundaneFocusProtocol, MundaneSourceRef } from "./mundaneTypes";

export const MUNDANE_SOURCES: Record<string, MundaneSourceRef> = {
  FRAWLEY_WHEELS: { id: "FRA-MUN-WHEELS", author: "John Frawley", scope: "grand conjunction, preceding Aries ingress, eclipses and nested chart hierarchy" },
  FRAWLEY_THREE_PRINCIPLES: { id: "FRA-3P", author: "John Frawley", scope: "dignity=power, reception=inclination, aspect=occasion" },
  FRAWLEY_PROGRESSION: { id: "FRA-PROG", author: "John Frawley", scope: "progressions/directions and five principal promissors" },
  MARCOS_COSMOLOGY: { id: "MAR-COSMOS", author: "Marcos Monteiro", scope: "traditional cosmological model and planets as agents/stars as background" },
  MARCOS_STARS: { id: "MAR-STARS", author: "Marcos Monteiro", scope: "fixed-star conjunction policy and conservative orbs" },
  FRAWLEY_COVENTRY_CASE: { id: "FRA-MUN-COVENTRY", author: "John Frawley", scope: "published Coventry 1940 mundane worked example and cross-chart source regression" },
  FRAWLEY_ECLIPSE_LORD_SOLAR: { id: "FRA-ECL-LORD-SOLAR", author: "John Frawley", scope: "solar eclipse lord by domicile ruler of eclipse sign (Elizabeth example)" },
  FRAWLEY_ECLIPSE_LORD_COVENTRY: { id: "FRA-ECL-LORD-COVENTRY-CASE", author: "John Frawley", scope: "Coventry source case names Venus as Lord of the eclipse; generic lunar rule remains source-locked" },
  FRAWLEY_WEATHER: { id: "FRA-WEATHER-PARTS", author: "John Frawley", scope: "season-month-week-day weather hierarchy and weather Parts" },
  ENGINEERING: { id: "ENG-MUN", author: "engineering", scope: "materialization gates and astronomical baselines not claimed as author doctrine" },
};

export function sourcesForAuthorMode(mode: MundaneAuthorMode): MundaneSourceRef[] {
  const values = Object.values(MUNDANE_SOURCES);
  if (mode === "research") return values;
  if (mode === "marcos") return values.filter((s) => s.author === "Marcos Monteiro" || s.author === "engineering");
  if (mode === "frawley-legacy") return values.filter((s) => s.author === "John Frawley" || s.author === "engineering");
  return values.filter((s) => s.author !== "user");
}

const FOCUS: Record<MundaneFocus, MundaneFocusProtocol> = {
  general: { focus:"general", requiredLayers:["governing-ingress","preceding-eclipse","historical-radices"], primaryHouses:[1,10], secondaryHouses:[4,7], naturalSignificators:[], admittedPartKeys:[], terrestrialRequirements:["topic-context"], interpretationOrder:["background-cycles","ingress","eclipse","radices","trigger"] },
  war: { focus:"war", requiredLayers:["governing-ingress","preceding-eclipse","historical-radices","trigger"], primaryHouses:[1,7,10], secondaryHouses:[4,8], naturalSignificators:["Mars"], admittedPartKeys:["victory","captivity"], terrestrialRequirements:["belligerents","location"], interpretationOrder:["nation","enemy","government","destruction","timing"] },
  government: { focus:"government", requiredLayers:["governing-ingress","historical-radices","ruler-radix","trigger"], primaryHouses:[1,10], secondaryHouses:[7,11], naturalSignificators:["Sun","Jupiter"], admittedPartKeys:["victory","renunciation"], terrestrialRequirements:["political-context","ruler-identity"], interpretationOrder:["nation","government","ruler","opposition","timing"] },
  economy: { focus:"economy", requiredLayers:["governing-ingress","historical-radices","trigger"], primaryHouses:[2,10,11], secondaryHouses:[1,8], naturalSignificators:["Jupiter","Mercury"], admittedPartKeys:[], terrestrialRequirements:["economic-context"], interpretationOrder:["nation","resources","trade","government","timing"] },
  disaster: { focus:"disaster", requiredLayers:["governing-ingress","preceding-eclipse","historical-radices","trigger"], primaryHouses:[1,4,8], secondaryHouses:[6,10], naturalSignificators:["Mars","Saturn"], admittedPartKeys:[], terrestrialRequirements:["event-type","location"], interpretationOrder:["background","place","damage","population","timing"] },
  weather: { focus:"weather", requiredLayers:["season-ingress","preceding-lunation","monthly-ingress","quarter-phase","sunrise-chart"], primaryHouses:[1,4,10], secondaryHouses:[], naturalSignificators:["Saturn","Jupiter","Mars","Sun","Venus","Mercury","Moon"], admittedPartKeys:["weather","heat","clouds","rain","cold","day"], terrestrialRequirements:["normal-climate","location","pressure","temperature"], interpretationOrder:["season","month","week","day"] },
  agriculture: { focus:"agriculture", requiredLayers:["season-ingress","preceding-lunation"], primaryHouses:[1,4], secondaryHouses:[2,10], naturalSignificators:["Moon","Venus","Jupiter"], admittedPartKeys:["crop-specific"], terrestrialRequirements:["crop","location","season"], interpretationOrder:["season","crop-part","condition","timing"] },
};

export function focusProtocol(focus: MundaneFocus): MundaneFocusProtocol { return FOCUS[focus]; }

export function authorAllows(mode: MundaneAuthorMode, feature: string): boolean {
  if (mode === "research") return true;
  const frawleyOnly = new Set(["lord-of-ingress","lord-of-eclipse","five-promissor-progression","solar-lunar-returns","grand-conjunction-preceding-aries-ingress"]);
  const marcosOnly = new Set(["general-cardinal-ingresses","marcos-fixed-star-orbs"]);
  if (mode === "marcos") return !frawleyOnly.has(feature);
  if (mode === "frawley-legacy") return !marcosOnly.has(feature);
  return true;
}


export type MundaneHouseLayer = "historical-radix" | "mundane-event-chart";

/**
 * Source-reproduction policy, not a universal claim about every author/chart.
 * Frawley's Coventry historical radix reproduces the published VIII-cusp/GC-MC
 * contact with Placidus; event charts retain Regiomontanus as the explicit
 * engineering baseline until a stricter source-specific override is supplied.
 */
export function houseSystemForSourceReproduction(mode: MundaneAuthorMode, layer: MundaneHouseLayer): "P" | "R" {
  if ((mode === "frawley-legacy" || mode === "marcos-frawley" || mode === "research") && layer === "historical-radix") return "P";
  return "R";
}
