import type { BirthChart, Planet, PlanetType } from "@/interfaces/BirthChartInterfaces";
import { DOMICILE_RULER, EXALTATION, FALL, DETRIMENT, TRIPLICITY_RULERS, LILLY_TERMS, FACES, SIGN_ELEMENT, ELEMENT_NAMES } from "@/app/lib/traditionalTables";
import { getHouseIndex, getSect } from "@/app/lib/traditionalCalculations";
import { getAbsoluteAngularDistance, resolveTraditionalAspect } from "@/app/lib/aspectDynamics";
import type { ElectionalPlanetCondition } from "./types";

const NAME_TO_TYPE: Record<string, PlanetType> = {
  Sol: "sun", Lua: "moon", "Mercúrio": "mercury", "Vênus": "venus", Marte: "mars", "Júpiter": "jupiter", Saturno: "saturn",
};

export const CLASSICAL: PlanetType[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

function norm(x: number): number { return ((x % 360) + 360) % 360; }
function signIndex(lon: number): number { return Math.floor(norm(lon) / 30); }
function degreeInSign(lon: number): number { return norm(lon) % 30; }
function planet(chart: BirthChart, type: PlanetType): Planet | undefined { return chart.planets.find(p => p.type === type); }

export function houseRuler(chart: BirthChart, house: number): PlanetType {
  const cusp = chart.housesData.house[house - 1];
  const rulerName = DOMICILE_RULER[signIndex(cusp)];
  const type = NAME_TO_TYPE[rulerName];
  if (!type) throw new Error(`Regente tradicional não encontrado para casa ${house}: ${rulerName}`);
  return type;
}

export function signMode(lon: number): "cardinal" | "fixed" | "mutable" {
  const idx = signIndex(lon);
  if ([0,3,6,9].includes(idx)) return "cardinal";
  if ([1,4,7,10].includes(idx)) return "fixed";
  return "mutable";
}

export function signElement(lon: number): "Fogo" | "Terra" | "Ar" | "Agua" {
  const raw = ELEMENT_NAMES[SIGN_ELEMENT[signIndex(lon)]];
  return raw === "Água" ? "Agua" : raw as "Fogo"|"Terra"|"Ar";
}

function essential(chart: BirthChart, p: Planet) {
  const idx = signIndex(p.longitudeRaw);
  const deg = degreeInSign(p.longitudeRaw);
  const sect = getSect(planet(chart,"sun")!.longitudeRaw, chart.housesData.ascendant, chart.housesData.house);
  const name = p.name;
  const domicile = DOMICILE_RULER[idx] === name;
  const exaltation = EXALTATION[name] === idx;
  const detriment = (DETRIMENT[name] ?? []).includes(idx);
  const fall = FALL[name] === idx;
  const tripRuler = TRIPLICITY_RULERS[SIGN_ELEMENT[idx]]?.[sect === "Diurno" ? "day" : "night"];
  const triplicity = tripRuler === name;
  const term = LILLY_TERMS[idx]?.find(t => deg < t.endDeg)?.ruler === name;
  const face = FACES[idx]?.[Math.min(2, Math.floor(deg / 10))] === name;
  return { domicile, exaltation, triplicity, term, face, detriment, fall, peregrine: !(domicile || exaltation || triplicity || term || face) };
}

export function planetCondition(chart: BirthChart, type: PlanetType): ElectionalPlanetCondition {
  const p = planet(chart, type);
  if (!p) throw new Error(`Planeta ausente: ${type}`);
  const house = getHouseIndex(p.longitudeRaw, chart.housesData.house) + 1;
  const dSun = type === "sun" ? 180 : getAbsoluteAngularDistance(p.longitudeRaw, planet(chart,"sun")!.longitudeRaw);
  const accidental = {
    angular: [1,4,7,10].includes(house),
    cadent: [3,6,9,12].includes(house),
    retrograde: p.isRetrograde,
    combust: type !== "sun" && dSun <= 8.5 && dSun > 17/60,
    cazimi: type !== "sun" && dSun <= 17/60,
    underSunbeams: type !== "sun" && dSun > 8.5 && dSun <= 17,
  };
  const ess = essential(chart,p);
  const testimony: string[] = [];
  if (ess.domicile) testimony.push("domicílio");
  if (ess.exaltation) testimony.push("exaltação");
  if (ess.triplicity) testimony.push("triplicidade do secto");
  if (ess.term) testimony.push("termo");
  if (ess.face) testimony.push("face");
  if (ess.detriment) testimony.push("exílio");
  if (ess.fall) testimony.push("queda");
  if (accidental.angular) testimony.push("angular");
  if (accidental.cadent) testimony.push("cadente");
  if (accidental.retrograde) testimony.push("retrógrado");
  if (accidental.combust) testimony.push("combusto");
  if (accidental.cazimi) testimony.push("cazimi");
  if (accidental.underSunbeams) testimony.push("sob os raios");
  return { planet:type, house, sign:p.sign, essential:ess, accidental, testimony };
}

export function classicalConditions(chart: BirthChart): Partial<Record<PlanetType, ElectionalPlanetCondition>> {
  return Object.fromEntries(CLASSICAL.map(t => [t, planetCondition(chart,t)]));
}

export function electionToNatalContacts(election: BirthChart, natal: BirthChart, eType: PlanetType, nType: PlanetType): string[] {
  const e = planet(election,eType); const n = planet(natal,nType);
  if (!e || !n) return [];
  const aspect = resolveTraditionalAspect(
    {
      longitude: e.longitudeRaw,
      speed: e.longitudeSpeed,
      elementType: "planet",
      planetType: e.type,
    },
    {
      longitude: n.longitudeRaw,
      speed: n.longitudeSpeed,
      elementType: "planet",
      planetType: n.type,
    }
  );
  if (!aspect || aspect.orbDistance > aspect.maxOrb) return [];
  return [`${e.name} eletivo ${aspect.aspectType} ${n.name} natal (orbe ${aspect.orbDistance.toFixed(2)}°)`];
}

export function closeToAngle(chart: BirthChart, type: PlanetType, orb = 5): string[] {
  const p = planet(chart,type); if (!p) return [];
  const angles = [["ASC",chart.housesData.ascendant],["MC",chart.housesData.mc],["DSC",norm(chart.housesData.ascendant+180)],["IC",norm(chart.housesData.mc+180)]] as const;
  return angles.filter(([,lon]) => getAbsoluteAngularDistance(p.longitudeRaw,lon) <= orb).map(([name,lon]) => `${p.name} a ${getAbsoluteAngularDistance(p.longitudeRaw,lon).toFixed(2)}° do ${name}`);
}

export interface ElectionalAspectState {
  first: PlanetType;
  second: PlanetType;
  type?: string;
  orb?: number;
  maxOrb?: number;
  applying?: boolean;
}

export function electionalAspect(chart: BirthChart, first: PlanetType, second: PlanetType): ElectionalAspectState {
  const a=planet(chart,first), b=planet(chart,second);
  if(!a||!b) return {first,second};
  const match=resolveTraditionalAspect(
    { longitude:a.longitudeRaw, speed:a.longitudeSpeed, elementType:"planet", planetType:a.type },
    { longitude:b.longitudeRaw, speed:b.longitudeSpeed, elementType:"planet", planetType:b.type },
  );
  if(!match) return {first,second};
  return {first,second,type:match.aspectType,orb:match.orbDistance,maxOrb:match.maxOrb,applying:match.applying};
}

const TYPE_TO_NAME: Partial<Record<PlanetType,string>> = {
  sun:"Sol",moon:"Lua",mercury:"Mercúrio",venus:"Vênus",mars:"Marte",jupiter:"Júpiter",saturn:"Saturno"
};

export function receptionByDignity(chart: BirthChart, host: PlanetType, guest: PlanetType): string[] {
  const hName=TYPE_TO_NAME[host], g=planet(chart,guest); if(!hName||!g) return [];
  const idx=signIndex(g.longitudeRaw), deg=degreeInSign(g.longitudeRaw);
  const sect=getSect(planet(chart,"sun")!.longitudeRaw,chart.housesData.ascendant,chart.housesData.house);
  const out:string[]=[];
  if(DOMICILE_RULER[idx]===hName) out.push("domicílio");
  if(EXALTATION[hName]===idx) out.push("exaltação");
  if(TRIPLICITY_RULERS[SIGN_ELEMENT[idx]]?.[sect === "Diurno" ? "day" : "night"]===hName) out.push("triplicidade do secto");
  if(LILLY_TERMS[idx]?.find(t=>deg<t.endDeg)?.ruler===hName) out.push("termo");
  if(FACES[idx]?.[Math.min(2,Math.floor(deg/10))]===hName) out.push("face");
  return out;
}

export interface LunarSequenceItem { target: PlanetType; type: string; orb: number; applying: boolean; estimatedDays?: number; }
export function lunarApplyingSequence(chart: BirthChart): LunarSequenceItem[] {
  const moon=planet(chart,"moon"); if(!moon) return [];
  const remaining=30-degreeInSign(moon.longitudeRaw);
  const moonSpeed=Math.abs(moon.longitudeSpeed || 13.2);
  const out:LunarSequenceItem[]=[];
  for(const target of CLASSICAL.filter(x=>x!=="moon")){
    const p=planet(chart,target); if(!p) continue;
    const a=electionalAspect(chart,"moon",target);
    if(!a.type || !a.applying || a.orb===undefined) continue;
    const relative=Math.max(0.1,Math.abs((moon.longitudeSpeed||13.2)-(p.longitudeSpeed||0)));
    const days=a.orb/relative;
    if(days*moonSpeed <= remaining+0.5) out.push({target,type:a.type,orb:a.orb,applying:true,estimatedDays:days});
  }
  return out.sort((a,b)=>(a.estimatedDays??99)-(b.estimatedDays??99));
}
