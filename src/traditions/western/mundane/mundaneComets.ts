import { signName } from "@/traditions/western/predictive/predictiveAstronomy";
import type { MundaneCometDossier, MundaneInput } from "./mundaneTypes";
export function buildCometDossiers(input:MundaneInput):MundaneCometDossier[]{
  return (input.comets??[]).map(c=>{
    const path=(c.observedPath??[]).slice().sort((a,b)=>Date.parse(a.utcIso)-Date.parse(b.utcIso));
    const first=path[0];const signs:string[]=[];for(const p of path){const s=signName(p.longitude);if(signs.at(-1)!==s)signs.push(s);}
    return {id:c.id,name:c.name,firstSeenUtcIso:c.firstSeenUtcIso,color:c.color,brightness:c.brightness,twilightOnly:c.twilightOnly,firstSign:first?signName(first.longitude):"unknown",pathSigns:signs,observedPath:path,pathComplete:path.length>1,warnings:path.length>1?[]:["COMET_PATH_MISSING_OR_SINGLE_POINT"],noAutomaticEventPrediction:true};
  });
}
