import type { HoraryCategoryFamily, HoraryIntent, HoraryOntologyClassification, HoraryQuestionContext, HoraryTopic } from "./types";

interface TopicOntologyPreset {
  family: HoraryCategoryFamily;
  intents: HoraryIntent[];
}

/**
 * Ontologia horária: o tópico é apenas um preset de entrada. A pergunta real é
 * decomposta em família ontológica + intenção(ões) + papéis/casas. Assim o motor
 * não depende de uma lista finita de frases possíveis.
 */
export const HORARY_TOPIC_ONTOLOGY: Record<HoraryTopic,TopicOntologyPreset> = {
  relationship:{family:"relationships_contests_legal",intents:["relationship","state"]},
  marriage:{family:"relationships_contests_legal",intents:["event","relationship"]},
  separation:{family:"relationships_contests_legal",intents:["event","relationship"]},
  lover:{family:"relationships_contests_legal",intents:["relationship","state"]},
  job_get:{family:"career_authority",intents:["event"]},
  job_keep:{family:"career_authority",intents:["state"]},
  job_quality:{family:"career_authority",intents:["quality"]},
  work_relationship:{family:"career_authority",intents:["relationship","state"]},
  career_choice:{family:"career_authority",intents:["choice","quality"]},
  money:{family:"money_possessions",intents:["state","quantity"]},
  salary:{family:"money_possessions",intents:["event","timing"]},
  debt:{family:"money_possessions",intents:["event","timing"]},
  loan:{family:"money_possessions",intents:["event","timing"]},
  investment:{family:"money_possessions",intents:["choice","quality"]},
  tax:{family:"money_possessions",intents:["event","quantity"]},
  inheritance:{family:"death_other_money",intents:["event","quantity"]},
  bet:{family:"money_possessions",intents:["event","quantity"]},
  buy_sell:{family:"property_home",intents:["event"]},
  property:{family:"property_home",intents:["quality","state"]},
  lost_object:{family:"money_possessions",intents:["location","recovery"]},
  missing_animal:{family:"illness_service_animals",intents:["location","recovery"]},
  missing_person:{family:"relationships_contests_legal",intents:["location","recovery"]},
  theft:{family:"money_possessions",intents:["truth","possession"]},
  lawsuit:{family:"relationships_contests_legal",intents:["event"]},
  competition:{family:"relationships_contests_legal",intents:["event"]},
  should_i:{family:"meta_custom",intents:["choice","quality"]},
  travel:{family:"knowledge_travel_dreams",intents:["event","quality"]},
  travel_profit:{family:"knowledge_travel_dreams",intents:["event","quantity"]},
  study:{family:"knowledge_travel_dreams",intents:["quality","event"]},
  exam:{family:"knowledge_travel_dreams",intents:["event"]},
  knowledge:{family:"knowledge_travel_dreams",intents:["quality","quantity"]},
  course:{family:"knowledge_travel_dreams",intents:["quality","event"]},
  health:{family:"illness_service_animals",intents:["state","cause"]},
  illness:{family:"illness_service_animals",intents:["cause","state"]},
  doctor:{family:"illness_service_animals",intents:["quality"]},
  treatment:{family:"illness_service_animals",intents:["quality","event"]},
  surgery:{family:"illness_service_animals",intents:["event","quality"]},
  pregnancy:{family:"children_pregnancy",intents:["state","event"]},
  death:{family:"death_other_money",intents:["survival","timing"]},
  prison:{family:"confinement_hidden",intents:["event","state"]},
  release:{family:"confinement_hidden",intents:["release","timing"]},
  self_undoing:{family:"confinement_hidden",intents:["cause","state"]},
  hidden_enemy:{family:"confinement_hidden",intents:["truth","state"]},
  psychic_attack:{family:"confinement_hidden",intents:["truth","cause"]},
  wish:{family:"gifts_wishes",intents:["event"]},
  dream_truth:{family:"knowledge_travel_dreams",intents:["truth"]},
  dream_meaning:{family:"knowledge_travel_dreams",intents:["cause","state"]},
  rumour:{family:"communication_truth",intents:["truth"]},
  news_truth:{family:"communication_truth",intents:["truth"]},
  weather:{family:"property_home",intents:["state","timing"]},
  public_event:{family:"public_collective",intents:["event"]},
  adoption:{family:"children_pregnancy",intents:["event"]},
  lottery:{family:"gifts_wishes",intents:["event","quantity"]},
  election:{family:"public_collective",intents:["event"]},
  government_grant:{family:"gifts_wishes",intents:["event","quantity"]},
  communication:{family:"communication_truth",intents:["event","timing"]},
  service_change:{family:"illness_service_animals",intents:["event","state","timing"]},
  delivery:{family:"money_possessions",intents:["event","timing"]},
  authenticity:{family:"money_possessions",intents:["truth","quality"]},
  kidnapping:{family:"confinement_hidden",intents:["survival","release","timing"]},
  custom:{family:"meta_custom",intents:["event"]},
};

/** Lista canônica de presets. UI, testes e API devem consumir esta lista em vez de manter arrays paralelos. */
export const HORARY_TOPIC_LIST = Object.freeze(Object.keys(HORARY_TOPIC_ONTOLOGY) as HoraryTopic[]);

export function classifyHoraryQuestion(ctx:HoraryQuestionContext):HoraryOntologyClassification {
  const p=HORARY_TOPIC_ONTOLOGY[ctx.topic];
  return {
    family:p.family,
    intents:[...(ctx.intents?.length?ctx.intents:p.intents)],
    presetTopic:ctx.topic,
    composable:true,
  };
}
