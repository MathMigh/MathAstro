import type { HoraryIntent, HoraryQuestionContext, HoraryTopic } from "./types";
import { classifyHoraryQuestion, HORARY_TOPIC_LIST } from "./ontology";

export type HoraryDecisionArchetype =
  | "EVENT_PERFECTION"
  | "STATE_CONDITION"
  | "QUALITY_EVALUATION"
  | "LOCATION_PLACEMENT"
  | "TIMING_SCALE"
  | "TRUTH_STABILITY"
  | "CHOICE_COMPARISON"
  | "RECOVERY_RETURN"
  | "QUANTITY_STRENGTH"
  | "CAUSE_AFFLICTION"
  | "RELATIONSHIP_RECEPTION"
  | "POSSESSION_TRANSFER"
  | "SURVIVAL_DEATH_CHAIN"
  | "RELEASE_CONFINEMENT";

export interface HoraryDecisionStep {
  archetype: HoraryDecisionArchetype;
  intent: HoraryIntent;
  purpose: string;
  requiredSignals: string[];
  forbiddenShortcuts: string[];
}

export interface HoraryDecisionPlan {
  topic: HoraryTopic;
  intents: HoraryIntent[];
  archetypes: HoraryDecisionArchetype[];
  steps: HoraryDecisionStep[];
  compositional: true;
}

const INTENT_ARCHETYPE: Record<HoraryIntent,HoraryDecisionArchetype> = {
  event:"EVENT_PERFECTION",
  state:"STATE_CONDITION",
  quality:"QUALITY_EVALUATION",
  location:"LOCATION_PLACEMENT",
  timing:"TIMING_SCALE",
  truth:"TRUTH_STABILITY",
  choice:"CHOICE_COMPARISON",
  recovery:"RECOVERY_RETURN",
  quantity:"QUANTITY_STRENGTH",
  cause:"CAUSE_AFFLICTION",
  relationship:"RELATIONSHIP_RECEPTION",
  possession:"POSSESSION_TRANSFER",
  survival:"SURVIVAL_DEATH_CHAIN",
  release:"RELEASE_CONFINEMENT",
};

const PURPOSE: Record<HoraryDecisionArchetype,string> = {
  EVENT_PERFECTION:"Determinar se o evento se realiza por perfeição direta, tradução/coleta ou mecanismo tópico equivalente, respeitando impedimentos e cronologia.",
  STATE_CONDITION:"Descrever o estado presente sem exigir aspecto de evento quando a pergunta é ontologicamente estática.",
  QUALITY_EVALUATION:"Avaliar condição essencial/acidental, adequação e recepções sem converter qualidade em ocorrência.",
  LOCATION_PLACEMENT:"Localizar pela colocação do significador, casa/signo e contexto, sem inventar necessidade de perfeição.",
  TIMING_SCALE:"Só atribuir tempo após identificar o testemunho do evento; separar arco simbólico de trânsito astronômico real.",
  TRUTH_STABILITY:"Testar verdade/falsidade por testemunhos próprios do tópico; não transformar toda pergunta em III/IX.",
  CHOICE_COMPARISON:"Comparar alternativas concretas já fornecidas; não inventar opções nem reduzir tudo a YES/NO genérico.",
  RECOVERY_RETURN:"Testar retorno/recuperação pela conexão com querente, posse ou localização recuperável.",
  QUANTITY_STRENGTH:"Estimar quantidade pela força/condição do significador pertinente, sem score universal entre técnicas.",
  CAUSE_AFFLICTION:"Identificar agente causal pela cadeia de aflição/disposição/contexto, evitando diagnosticar além da gramática astrológica.",
  RELATIONSHIP_RECEPTION:"Separar atitude/valoração (recepção) de ocorrência (perfeição), preservando direção da recepção.",
  POSSESSION_TRANSFER:"Rastrear de quem é a posse/dinheiro antes e depois da transferência, usando casas derivadas quando necessário.",
  SURVIVAL_DEATH_CHAIN:"Avaliar sobrevivência/morte com VIII radical e derivada quando aplicável, além de tradução, combustão, estação e impedimentos.",
  RELEASE_CONFINEMENT:"Avaliar saída de confinamento pela XII pertinente, ingresso/saída, estação/reversão e estado atual.",
};

const REQUIRED: Record<HoraryDecisionArchetype,string[]> = {
  EVENT_PERFECTION:["primary roles","exact perfection or topical event trigger","chronology/impediments"],
  STATE_CONDITION:["relevant significator","essential condition","accidental condition"],
  QUALITY_EVALUATION:["relevant significator","essential condition","accidental condition","contextual receptions"],
  LOCATION_PLACEMENT:["located significator","house placement","sign quality","real-world context"],
  TIMING_SCALE:["event testimony","degrees/arcs","contextual time units"],
  TRUTH_STABILITY:["topic-specific truth significators","fixity/angularity or equivalent source testimonies"],
  CHOICE_COMPARISON:["two or more concrete alternatives","condition of each alternative","reception/return where relevant"],
  RECOVERY_RETURN:["object/person significator","querent or possession significator","return/recovery testimony"],
  QUANTITY_STRENGTH:["quantity significator","essential/accidental strength","relevant house condition"],
  CAUSE_AFFLICTION:["subject significator","afflicting/dispositing planet","contextual confirmation"],
  RELATIONSHIP_RECEPTION:["both parties","directional receptions","event testimony only if event is asked"],
  POSSESSION_TRANSFER:["current holder","possession/money house","recipient/arrival testimony"],
  SURVIVAL_DEATH_CHAIN:["person significator","radical VIII","turned VIII when third party","chronology"],
  RELEASE_CONFINEMENT:["person significator","radical/turned XII","current confinement state","chronology"],
};

const FORBIDDEN: Record<HoraryDecisionArchetype,string[]> = {
  EVENT_PERFECTION:["orb as starting gate","reception alone = event","dignity alone = event"],
  STATE_CONDITION:["require aspect merely to describe state"],
  QUALITY_EVALUATION:["quality = occurrence","single total strength score"],
  LOCATION_PLACEMENT:["aspect required for current location","direction method used indoors without context"],
  TIMING_SCALE:["timing before event testimony","ephemeris days automatically replacing symbolic units"],
  TRUTH_STABILITY:["route every 'is it true' phrase to III/IX regardless of underlying question"],
  CHOICE_COMPARISON:["invent alternatives","compare unlike roles without ontology"],
  RECOVERY_RETURN:["location = recovery automatically"],
  QUANTITY_STRENGTH:["universal numeric score"],
  CAUSE_AFFLICTION:["medical/supernatural factual assertion beyond source grammar"],
  RELATIONSHIP_RECEPTION:["mutual reception assumed from one-way reception","reception = contact"],
  POSSESSION_TRANSFER:["assume money remains querent's after lending","confuse message with package/possession"],
  SURVIVAL_DEATH_CHAIN:["antiscion alone as death proof","death of third party from radical VIII only"],
  RELEASE_CONFINEMENT:["XII symbolism = factual imprisonment without context"],
};

function unique<T>(xs:T[]):T[]{ return [...new Set(xs)]; }

export function compileHoraryDecisionPlan(ctx:HoraryQuestionContext):HoraryDecisionPlan {
  const classification=classifyHoraryQuestion(ctx);
  const intents=classification.intents;
  const archetypes=unique(intents.map(i=>INTENT_ARCHETYPE[i]));
  return {
    topic:ctx.topic,
    intents,
    archetypes,
    steps:intents.map(intent=>{
      const archetype=INTENT_ARCHETYPE[intent];
      return {archetype,intent,purpose:PURPOSE[archetype],requiredSignals:[...REQUIRED[archetype]],forbiddenShortcuts:[...FORBIDDEN[archetype]]};
    }),
    compositional:true,
  };
}

/** Build-time audit helper: every preset must compile into at least one decision archetype. */
export function auditHoraryDecisionGrammar(): Array<{topic:HoraryTopic;ok:boolean;archetypes:HoraryDecisionArchetype[]}> {
  return HORARY_TOPIC_LIST.map(topic=>{
    const plan=compileHoraryDecisionPlan({topic,concreteQuestion:`audit:${topic}`});
    return {topic,ok:plan.steps.length>0&&plan.archetypes.length>0,archetypes:plan.archetypes};
  });
}
