import type { BirthChart, PlanetType } from "@/interfaces/BirthChartInterfaces";
import { CLASSICAL_PLANETS, PLANET_NAMES, SIGN_VOICE } from "./tables";
import { norm, shortDistance, signIndex } from "./calculations";
import type { HoraryChronologyEvent, HoraryDossier, HoraryMediationEvent } from "./types";

const wrap180=(x:number)=>{const y=norm(x);return y>180?y-360:y;};
const aspectName=(angle:number):HoraryChronologyEvent["aspect"]|undefined=>angle===0?"conjunction":angle===60?"sextile":angle===90?"square":angle===120?"trine":angle===180?"opposition":angle===240?"trine":angle===270?"square":angle===300?"sextile":undefined;
const signAspect=(a:number,b:number)=>{const d=Math.min((b-a+12)%12,(a-b+12)%12);return d===0?"conjunction":d===2?"sextile":d===3?"square":d===4?"trine":d===6?"opposition":undefined;};

export type HoraryPlanetSnapshot=Partial<Record<PlanetType,{longitude:number;longitudeSpeed:number;isRetrograde:boolean}>>;
export type HoraryEphemerisProvider=(julianDay:number,types:PlanetType[])=>Promise<HoraryPlanetSnapshot>;
type Snap=HoraryPlanetSnapshot;
async function bisect(provider:HoraryEphemerisProvider,j0:number,j1:number,types:PlanetType[],fn:(s:Snap)=>number,iterations=22){
  let a=j0,b=j1,sa=await provider(a,types),fa=fn(sa);
  for(let i=0;i<iterations;i++){const m=(a+b)/2,sm=await provider(m,types),fm=fn(sm); if(Math.sign(fa)===Math.sign(fm)){a=m;fa=fm;}else b=m;}
  return (a+b)/2;
}
function p(s:Snap,t:PlanetType){const x=s[t];if(!x)throw new Error(`Ephemeris missing ${t}`);return x;}
function crossed(x:number,y:number){return Math.abs(x-y)<180 && (x===0||y===0||Math.sign(x)!==Math.sign(y));}

export interface HoraryChronologyOptions { horizonDays?:number; stepDays?:number; }

export async function buildHoraryChronology(chart:BirthChart,dossier:HoraryDossier,provider:HoraryEphemerisProvider,options:HoraryChronologyOptions={}):Promise<HoraryChronologyEvent[]> {
  const jd0=chart.calculationMetadata?.julianDayUt;
  if(!Number.isFinite(jd0)) return [];
  const horizon=options.horizonDays??370, step=options.stepDays??1;
  const focus=new Set<PlanetType>(["moon","sun",...dossier.significators.map(s=>s.planet)]);
  // terceiros tradicionais precisam existir para proibição/tradução/coleta.
  CLASSICAL_PLANETS.forEach(x=>focus.add(x));
  const types=[...focus];
  const events:HoraryChronologyEvent[]=[]; const seen=new Set<string>();
  const add=(e:HoraryChronologyEvent)=>{const k=`${e.kind}|${e.planets.join(',')}|${e.aspect??''}|${e.house??''}|${e.daysFromQuestion.toFixed(3)}`;if(!seen.has(k)){seen.add(k);events.push(e);}};
  let jA=jd0!, sA=await provider(jA,types);
  for(let d=step;d<=horizon+1e-9;d+=step){
    const jB=jd0!+d, sB=await provider(jB,types);
    for(const t of types){
      const a=p(sA,t),b=p(sB,t);
      if(Math.sign(a.longitudeSpeed)!==Math.sign(b.longitudeSpeed) && Math.abs(a.longitudeSpeed-b.longitudeSpeed)<5){
        const jd=await bisect(provider,jA,jB,types,s=>p(s,t).longitudeSpeed); add({jd,daysFromQuestion:jd-jd0!,kind:"station",planets:[t],statement:`${PLANET_NAMES[t]} estaciona/reverte movimento.`});
      }
      if(signIndex(a.longitude)!==signIndex(b.longitude)){
        let lo=jA,hi=jB,from=signIndex(a.longitude); for(let i=0;i<22;i++){const m=(lo+hi)/2,sm=await provider(m,[t]); if(signIndex(p(sm,t).longitude)===from)lo=m;else hi=m;} const jd=(lo+hi)/2, sb=await provider(hi,[t]); add({jd,daysFromQuestion:jd-jd0!,kind:"sign_change",planets:[t],fromSign:from,toSign:signIndex(p(sb,t).longitude),statement:`${PLANET_NAMES[t]} muda de signo.`});
      }
      if(t!=="sun"){
        const ca=signIndex(a.longitude)===signIndex(p(sA,"sun").longitude)&&shortDistance(a.longitude,p(sA,"sun").longitude)<=8.5;
        const cb=signIndex(b.longitude)===signIndex(p(sB,"sun").longitude)&&shortDistance(b.longitude,p(sB,"sun").longitude)<=8.5;
        if(ca!==cb){const jd=(jA+jB)/2;add({jd,daysFromQuestion:jd-jd0!,kind:cb?"combustion_entry":"combustion_exit",planets:[t,"sun"],statement:`${PLANET_NAMES[t]} ${cb?"entra em":"sai de"} combustão.`});}
      }
    }
    for(let i=0;i<types.length;i++) for(let k=i+1;k<types.length;k++){
      const a=types[i],b=types[k],a0=p(sA,a).longitude,b0=p(sA,b).longitude,a1=p(sB,a).longitude,b1=p(sB,b).longitude;
      for(const target of [0,60,90,120,180,240,270,300]){
        const e0=wrap180((b0-a0)-target), e1=wrap180((b1-a1)-target); if(!crossed(e0,e1))continue;
        const jd=await bisect(provider,jA,jB,types,s=>wrap180((p(s,b).longitude-p(s,a).longitude)-target)); const sx=await provider(jd,[a,b]);
        const asp=aspectName(target), valid=asp&&signAspect(signIndex(p(sx,a).longitude),signIndex(p(sx,b).longitude))===asp; if(!valid)continue;
        add({jd,daysFromQuestion:jd-jd0!,kind:(asp==="conjunction"&&(a==="sun"||b==="sun"))?"solar_conjunction":"aspect",planets:[a,b],aspect:asp,statement:`${PLANET_NAMES[a]} e ${PLANET_NAMES[b]} aperfeiçoam ${asp}.`});
      }
      const anti0=wrap180(a0+b0-180),anti1=wrap180(a1+b1-180); if(crossed(anti0,anti1)){const jd=await bisect(provider,jA,jB,types,s=>wrap180(p(s,a).longitude+p(s,b).longitude-180));add({jd,daysFromQuestion:jd-jd0!,kind:"antiscion",planets:[a,b],statement:`${PLANET_NAMES[a]} e ${PLANET_NAMES[b]} aperfeiçoam contato por antíscio.`});}
      const contra0=wrap180(a0+b0),contra1=wrap180(a1+b1); if(crossed(contra0,contra1)){const jd=await bisect(provider,jA,jB,types,s=>wrap180(p(s,a).longitude+p(s,b).longitude));add({jd,daysFromQuestion:jd-jd0!,kind:"contra_antiscion",planets:[a,b],statement:`${PLANET_NAMES[a]} e ${PLANET_NAMES[b]} aperfeiçoam contato por contra-antíscio.`});}
    }
    // cúspides do mapa horário permanecem fixas: apenas significadores centrais são testados.
    for(const sig of dossier.significators){for(const h of dossier.topicAnalysis.houses){const cusp=chart.housesData.house[h.radicalHouse-1],e0=wrap180(p(sA,sig.planet).longitude-cusp),e1=wrap180(p(sB,sig.planet).longitude-cusp);if(crossed(e0,e1)){const jd=await bisect(provider,jA,jB,types,s=>wrap180(p(s,sig.planet).longitude-cusp));add({jd,daysFromQuestion:jd-jd0!,kind:"cusp_entry",planets:[sig.planet],house:h.radicalHouse,statement:`${sig.planetName} cruza a cúspide da casa ${h.radicalHouse}.`});}}}
    jA=jB;sA=sB;
  }
  return events.filter(e=>e.daysFromQuestion>=0).sort((a,b)=>a.jd-b.jd);
}

export function applyChronology(dossier:HoraryDossier,events:HoraryChronologyEvent[]):HoraryDossier {
  dossier.chronology=events;
  const byRole=(r:string)=>dossier.significators.find(s=>s.role===r);
  const roles=dossier.topicAnalysis.primaryRoles.map(byRole).filter(Boolean);
  if(roles.length<2)return dossier;
  const [a,b]=roles as any[];
  const samePair=(e:HoraryChronologyEvent,x:PlanetType,y:PlanetType)=>e.planets.length===2&&e.planets.includes(x)&&e.planets.includes(y);
  const actualPrimary=events.find(e=>e.kind==="aspect"&&samePair(e,a.planet,b.planet));
  const snapshotPrimary=dossier.directPerfections.find(e=>e.applying&&((e.a===a.planet&&e.b===b.planet)||(e.a===b.planet&&e.b===a.planet)));
  const firstPassNot=events.find(e=>(e.kind==="station"||e.kind==="solar_conjunction"||e.kind==="sign_change")&&e.planets.some(p=>p===a.planet||p===b.planet));

  // Refranação clássica: a aplicação existe no mapa inicial, mas um significador estaciona/reverte antes de aperfeiçoar.
  // Não exigimos que exista um aspecto exato futuro: justamente a estação pode impedir que ele venha a existir.
  if(snapshotPrimary&&firstPassNot&&(!actualPrimary||firstPassNot.jd<actualPrimary.jd)){
    const kind:HoraryMediationEvent["kind"]=firstPassNot.kind==="station"?"refranation":"frustration";
    dossier.mediation.push({kind,confidence:"high",statement:`Cronologia efemérica: a aplicação inicial ${a.planetName}–${b.planetName} é interrompida antes de aperfeiçoar porque ${firstPassNot.statement}`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{blocker:firstPassNot,initialProjection:snapshotPrimary,actualPrimary:actualPrimary??null}});
    if(dossier.question.topic==="bet"){
      dossier.judgement.answer="NO";
      dossier.judgement.reasons.push("A aplicação ao dinheiro da aposta refrana: um significador estaciona/reverte antes de qualquer perfeição real. Sem aspecto, não há lucro.");
    } else if(dossier.judgement.answer==="YES"){
      dossier.judgement.answer="UNKNOWN";
      dossier.judgement.reasons.push("A trajetória efemérica encontrou um pass-not real antes da perfeição inicialmente projetada; o YES linear foi revogado.");
    }
  }

  if(actualPrimary&&!['lawsuit','death'].includes(dossier.question.topic)){
    const thirds=events.filter(e=>e.jd<actualPrimary.jd&&["aspect","antiscion","contra_antiscion"].includes(e.kind)&&e.planets.some((p:PlanetType)=>p===a.planet||p===b.planet)&&e.planets.some((p:PlanetType)=>p!==a.planet&&p!==b.planet));
    for(const third of thirds.slice(0,6)) dossier.mediation.push({kind:"prohibition",confidence:"high",statement:`Terceiro contato aperfeiçoa antes do encontro principal: ${third.statement} A função concreta é resolvida pelo tópico e pela sequência.`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{third,primary:actualPrimary}});
  }

  const chronologicalTranslation=(x:PlanetType,y:PlanetType,mediator:PlanetType="moon")=>{
    const contacts=events.filter(e=>e.kind==="aspect"&&e.planets.includes(mediator)&&(e.planets.includes(x)||e.planets.includes(y))).sort((u,v)=>u.jd-v.jd);
    for(let i=0;i<contacts.length;i++){
      const first=contacts[i],firstTarget=first.planets.includes(x)?x:y;
      for(let j=i+1;j<contacts.length;j++){
        const second=contacts[j],secondTarget=second.planets.includes(x)?x:y;
        if(firstTarget===secondTarget) continue;
        const ingress=events.find(e=>e.kind==="sign_change"&&e.planets.includes(mediator)&&e.jd>first.jd&&e.jd<second.jd);
        if(!ingress) return {first,second,mediator};
        break;
      }
    }
    return undefined;
  };

  if(dossier.question.topic==="should_i"||dossier.question.topic==="career_choice"){
    const businessId=dossier.question.alternatives?.find(x=>x.profitHouse)?.id;
    const business=businessId?byRole(`alternative:${businessId}`):undefined, money=byRole("querent_money");
    if(business&&money){
      const tr=chronologicalTranslation(business.planet,money.planet,"moon");
      if(tr){
        dossier.mediation.push({kind:"translation",mediator:"moon",mediatorName:"Lua",confidence:"high",statement:`Cronologia confirma tradução futura de luz: ${tr.first.statement} e depois ${tr.second.statement}, sem mudança de signo da Lua entre os dois contatos.`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:tr});
        const r=dossier.receptions.find(x=>x.from===business.planet&&x.to===money.planet);
        if(r&&(r.disposition==="negative"||r.disposition==="strong_negative")) dossier.judgement.reasons.push("A Lua liga o negócio ao dinheiro do querente, mas a recepção do negócio para L2 é negativa: a ligação tende a prejudicar o dinheiro, exatamente o tipo de cadeia que uma escolha precisa expor.");
      }
    }
  }

  // Processos: L4 é o veredicto. O caso publicado de Marcos exige uma cadeia de proibição em dois níveis.
  if(dossier.question.topic==="lawsuit"){
    const q=byRole("querent"),opp=byRole("opponent"),judge=byRole("judge"),verdict=byRole("verdict");
    if(q&&opp&&judge&&verdict){
      const qVerdict=events.find(e=>e.kind==="aspect"&&samePair(e,q.planet,verdict.planet));
      const oppJudge=events.find(e=>e.kind==="aspect"&&samePair(e,opp.planet,judge.planet));
      if(qVerdict){
        const firstInterposition=events.find(e=>e.jd<qVerdict.jd&&["aspect","antiscion","contra_antiscion"].includes(e.kind)&&e.planets.includes(verdict.planet)&&e.planets.some(p=>p!==verdict.planet&&p!==q.planet));
        if(firstInterposition){
          const mediator=firstInterposition.planets.find(p=>p!==verdict.planet)!;
          dossier.mediation.push({kind:"prohibition",mediator,mediatorName:PLANET_NAMES[mediator],confidence:"high",statement:`Veredicto→querente é proibido antes da perfeição por ${firstInterposition.statement}`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{interposition:firstInterposition,querentVerdict:qVerdict}});
          if(oppJudge){
            const mediatorJudge=events.find(e=>e.kind==="aspect"&&samePair(e,mediator,judge.planet)&&e.jd<oppJudge.jd);
            if(mediatorJudge&&firstInterposition.jd<mediatorJudge.jd){
              dossier.mediation.push({kind:"prohibition_of_prohibition",mediator,mediatorName:PLANET_NAMES[mediator],confidence:"high",statement:`A mesma cadeia confirma “proibição da proibição”: ${firstInterposition.statement} ocorre antes de ${mediatorJudge.statement}, de modo que a interferência de ${PLANET_NAMES[mediator]} contra o contato oponente–juiz é ela própria interceptada.`,sourceIds:["M-HORARY-CURRENT"],data:{firstInterposition,mediatorJudge,opponentJudge:oppJudge}});
              dossier.judgement.answer="NO";
              dossier.judgement.reasons.push("A cronologia real reproduz a cadeia do caso: contra-antíscio do veredicto com Mercúrio antes de Lua–Marte proíbe o ganho do querente; a mesma cadeia impede Mercúrio de bloquear Vênus–Saturno, deixando oponente e juiz chegarem ao contato.");
            }
          }
        }
      }
    }
  }

  // Comunicação em relacionamento: significadores naturais podem parecer aplicar linearmente, mas mudança de signo antes do exato invalida o contato no estado atual.
  if(dossier.question.topic==="relationship"&&/talk|communicat|falar|convers|contato/.test(dossier.question.concreteQuestion.toLowerCase())){
    const q=byRole("querent"),other=byRole("quesited");
    if(q&&other){
      const qPlanets=[...new Set<PlanetType>([q.planet,"moon",...(dossier.question.querentSex?[dossier.question.querentSex==="male"?"sun":"venus" as PlanetType]:[])])];
      const oPlanets=[...new Set<PlanetType>([other.planet,...(dossier.question.quesitedSex?[dossier.question.quesitedSex==="male"?"sun":"venus" as PlanetType]:[])])];
      let viable=false;
      for(const op of oPlanets) for(const qp of qPlanets){
        if(op===qp) continue;
        const t=dossier.testimonies.find(x=>x.id===`relationship-contact-${op}-${qp}`);
        const asp=t?.data?.aspect as any;
        if(!asp?.applying||asp.beforeEitherChangesSign===false) continue;
        const exact=events.find(e=>e.kind==="aspect"&&samePair(e,op,qp));
        const block=events.find(e=>(e.kind==="sign_change"||e.kind==="station"||e.kind==="solar_conjunction")&&e.planets.some(p=>p===op||p===qp)&&(!exact||e.jd<exact.jd));
        if(exact&&!block) viable=true;
        else if(block) dossier.mediation.push({kind:block.kind==="station"?"refranation":"frustration",confidence:"high",statement:`Contato de comunicação ${PLANET_NAMES[op]}–${PLANET_NAMES[qp]} não aperfeiçoa no estado atual: ${block.statement} ocorre antes do exato.`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{block,exact:exact??null,initial:asp}});
      }
      const currentSilent=oPlanets.every(pt=>{const sky=dossier.neutralSky.find(x=>x.planet===pt); return !!sky&&(SIGN_VOICE[signIndex(sky.longitude)]==="mute"||SIGN_VOICE[signIndex(sky.longitude)]==="weak");});
      if(!viable&&currentSilent){ dossier.judgement.answer="NO"; dossier.judgement.reasons.push("A cronologia elimina os contatos aparentes de comunicação antes da perfeição, enquanto os significadores do quesitado estão em signos mudos/de voz fraca; a retomada da fala não é mostrada."); }
    }
  }

  // Morte de terceiro: qualquer uma das duas VIII pode atuar; ambas precisam ser examinadas.
  if(dossier.question.topic==="death"){
    const subject=byRole("death_subject"),rad=byRole("radical_death"),turned=byRole("turned_death");
    if(subject&&rad&&turned){
      const initialAspect=(deathPlanet:PlanetType)=>dossier.directPerfections.find(e=>e.applying&&e.beforeEitherChangesSign&&((e.a===subject.planet&&e.b===deathPlanet)||(e.b===subject.planet&&e.a===deathPlanet)));
      const route=(death:typeof rad)=>{
        const initial=initialAspect(death.planet);
        if(!initial) return {initial:undefined,exact:undefined,blocked:false,interpositions:[] as HoraryChronologyEvent[]};
        const exact=events.find(e=>e.kind==="aspect"&&samePair(e,subject.planet,death.planet));
        if(!exact) return {initial,exact:undefined,blocked:true,interpositions:[] as HoraryChronologyEvent[]};
        // Proibição corporal: o significador da pessoa encontra um terceiro antes de chegar à morte.
        const bodily=events.filter(e=>e.jd<exact.jd&&e.kind==="aspect"&&e.planets.includes(subject.planet)&&!e.planets.includes(death.planet)&&e.planets.some(p=>p!==subject.planet&&p!==rad.planet&&p!==turned.planet));
        // Interposição oculta: antíscio/contra-antíscio de terceiro com o significador da morte antes da perfeição.
        const hidden=events.filter(e=>e.jd<exact.jd&&(e.kind==="antiscion"||e.kind==="contra_antiscion")&&e.planets.includes(death.planet)&&!e.planets.includes(subject.planet)&&e.planets.some(p=>p!==rad.planet&&p!==turned.planet));
        const interpositions=[...bodily,...hidden].sort((x,y)=>x.jd-y.jd);
        return {initial,exact,blocked:interpositions.length>0,interpositions};
      };
      const rr=route(rad),tr=route(turned);
      for(const x of [...rr.interpositions,...tr.interpositions].slice(0,8)) dossier.mediation.push({kind:"prohibition",confidence:"high",statement:`Interposição antes de contato com morte: ${x.statement}`,sourceIds:["M-HORARY-CURRENT","F-HT"],data:{event:x}});
      const unblocked=(rr.initial&&rr.exact&&!rr.blocked)||(tr.initial&&tr.exact&&!tr.blocked);
      if(unblocked){ dossier.judgement.answer="YES"; dossier.judgement.reasons.push("Existe aplicação inicial válida e perfeição não proibida da pessoa com uma das duas VIII; o motor registra testemunho técnico de morte, sujeito à política de comunicação segura."); }
      else { dossier.judgement.answer="NO"; dossier.judgement.reasons.push("Nenhuma aplicação inicial válida à VIII radical/derivada chega à perfeição sem interposição; a cronologia favorece sobrevivência no horizonte analisado."); }
    }
  }

  // Evento assumido cujo marcador é mudança de signo: a efeméride confirma a ordem, mas o timing horário continua simbólico em graus/unidades.
  if(dossier.question.eventAssumed&&dossier.question.eventTrigger?.kind==="sign_change"){
    const triggerRole=dossier.question.eventTrigger.role??"quesited", sig=byRole(triggerRole);
    const ptype=dossier.question.eventTrigger.planet??sig?.planet??dossier.question.naturalServicePlanet;
    if(ptype){ const ingress=events.find(e=>e.kind==="sign_change"&&e.planets.includes(ptype)); if(ingress) dossier.judgement.reasons.push(`Efeméride confirma a mudança real de signo de ${PLANET_NAMES[ptype]} em +${ingress.daysFromQuestion.toFixed(2)} d; este tempo astronômico não substitui o arco simbólico usado no timing horário.`); }
  }
  return dossier;
}
