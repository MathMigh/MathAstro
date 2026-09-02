import { DOMICILE_RULER, EXALTATION } from "@/app/lib/traditionalTables";
import { circularDistance, normalize360, signName } from "@/traditions/western/predictive/predictiveAstronomy";
import type { PredictiveSkySnapshot } from "@/traditions/western/predictive/predictiveTypes";
import type { MundaneFocusEvidence, MundaneFocusProtocol, MundanePartRecord } from "./mundaneTypes";

function signIndex(x:number){return Math.floor(normalize360(x)/30)%12;}
function exaltationRuler(si:number){return Object.entries(EXALTATION).find(([,v])=>v===si)?.[0];}
function houseOf(lon:number,sky:PredictiveSkySnapshot){const c=sky.cusps.map(x=>x.longitude);for(let i=0;i<12;i++){const span=normalize360(c[(i+1)%12]-c[i]),off=normalize360(lon-c[i]);if(off<=span)return i+1;}return 1;}
function houseEvidence(h:number,sky:PredictiveSkySnapshot){const cusp=sky.cusps[h-1],si=signIndex(cusp.longitude);return {house:h,cuspLongitude:cusp.longitude,cuspSign:signName(cusp.longitude),domicileRuler:DOMICILE_RULER[si],exaltationRuler:exaltationRuler(si),planetsInCuspSign:sky.planets.filter(p=>signIndex(p.longitude)===si).map(p=>({planet:p.name,longitude:p.longitude,distanceFromCusp:circularDistance(p.longitude,cusp.longitude)})).sort((a,b)=>a.distanceFromCusp-b.distanceFromCusp)};}
export function buildFocusEvidence(chartId:string,sky:PredictiveSkySnapshot,protocol:MundaneFocusProtocol,parts:MundanePartRecord[]):MundaneFocusEvidence{
  const admitted=protocol.admittedPartKeys.includes("crop-specific")?parts.filter(p=>p.key.startsWith("crop-")):parts.filter(p=>protocol.admittedPartKeys.includes(p.key)||protocol.admittedPartKeys.some(k=>p.key.startsWith(k)));
  return {chartId,primaryHouses:protocol.primaryHouses.map(h=>houseEvidence(h,sky)),secondaryHouses:protocol.secondaryHouses.map(h=>houseEvidence(h,sky)),naturalSignificators:sky.planets.filter(p=>protocol.naturalSignificators.some(n=>n.toLowerCase()===p.name.normalize("NFD").replace(/\p{Diacritic}/gu,"").toLowerCase()||n.toLowerCase()===p.name.toLowerCase())).map(p=>({planet:p.name,longitude:p.longitude,sign:p.sign,house:houseOf(p.longitude,sky)})),admittedParts:admitted,cuspMaterializationPolicy:"same-sign-all-distances-no-conjunction-claim"};
}
