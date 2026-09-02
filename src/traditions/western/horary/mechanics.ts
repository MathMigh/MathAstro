import type { BirthChart, PlanetType } from "@/interfaces/BirthChartInterfaces";
import { CLASSICAL_PLANETS, PLANET_NAMES } from "./tables";
import { aspectBetween, planet } from "./calculations";
import type { HoraryAspectEvent, HoraryMediationEvent } from "./types";

function time(ev:HoraryAspectEvent|undefined){ return ev?.applying ? ev.estimatedDaysToPerfection : undefined; }
function faster(chart:BirthChart,a:PlanetType,b:PlanetType){ return Math.abs(planet(chart,a).longitudeSpeed)>Math.abs(planet(chart,b).longitudeSpeed); }

/**
 * Materializa a sequência intermediária sem confundir recepção com ocorrência.
 * Tradução: planeta mais rápido separa de um significador e aplica ao outro.
 * Coleta: ambos os significadores aplicam a um terceiro mais lento.
 * Proibição: antes da perfeição principal, um dos significadores aperfeiçoa contato com terceiro.
 * Refranação/estação real exige efeméride futura; o snapshot só pode marcar mudança de signo antes da perfeição.
 */
export function analyseMediation(chart:BirthChart,a:PlanetType,b:PlanetType,primary?:HoraryAspectEvent):HoraryMediationEvent[]{
  const out:HoraryMediationEvent[]=[];
  if(a===b) return out; // papéis diferentes podem compartilhar o mesmo regente; isso não cria conjunção, tradução ou coleta consigo mesmo.
  if(primary?.applying && primary.beforeEitherChangesSign===false){
    out.push({kind:"sign_change_obstruction",confidence:"high",statement:"A perfeição geométrica projetada ocorre somente depois de pelo menos um significador mudar de signo; a perfeição não pode ser aceita automaticamente no estado atual.",sourceIds:["M-HORARY-CURRENT","F-HT"],data:{primary}});
  }
  for(const m of CLASSICAL_PLANETS.filter(x=>x!==a&&x!==b)){
    const ma=aspectBetween(chart,m,a), mb=aspectBetween(chart,m,b);
    const am=aspectBetween(chart,a,m), bm=aspectBetween(chart,b,m);

    const translationAB=ma?.separating && mb?.applying && mb.beforeEitherChangesSign && faster(chart,m,a) && faster(chart,m,b);
    const translationBA=mb?.separating && ma?.applying && ma.beforeEitherChangesSign && faster(chart,m,a) && faster(chart,m,b);
    if(translationAB||translationBA){
      out.push({kind:"translation",mediator:m,mediatorName:PLANET_NAMES[m],confidence:"high",statement:`${PLANET_NAMES[m]} separa de um significador e aplica ao outro, sendo mais rápido que ambos: tradução de luz materializada.`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{fromA:ma,toB:mb,fromB:mb,toA:ma}});
    }

    const ta=time(am), tb=time(bm);
    if(ta!==undefined&&tb!==undefined&&am?.beforeEitherChangesSign&&bm?.beforeEitherChangesSign&&!faster(chart,m,a)&&!faster(chart,m,b)){
      out.push({kind:"collection",mediator:m,mediatorName:PLANET_NAMES[m],confidence:"high",statement:`Os dois significadores aplicam a ${PLANET_NAMES[m]}, que é mais lento que ambos: coleta de luz materializada.`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{aToMediator:am,bToMediator:bm}});
    }

    const tp=time(primary);
    if(tp!==undefined){
      const candidates=[{who:a,ev:am},{who:b,ev:bm}].filter(x=>time(x.ev)!==undefined && (time(x.ev) as number)<tp && x.ev?.beforeEitherChangesSign);
      for(const c of candidates){
        out.push({kind:"prohibition_candidate",mediator:m,mediatorName:PLANET_NAMES[m],confidence:"medium",statement:`Antes da perfeição principal, ${PLANET_NAMES[c.who]} aperfeiçoa contato com ${PLANET_NAMES[m]}. É candidato real a proibição/interferência e deve ser lido com natureza do aspecto, recepções e tópico.`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{intervening:c.ev,primary}});
      }
    }
  }
  return out;
}
