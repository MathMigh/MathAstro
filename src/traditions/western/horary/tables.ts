import type { PlanetType } from "@/interfaces/BirthChartInterfaces";
import type { HorarySourceRef, HoraryTopic } from "./types";

export const CLASSICAL_PLANETS: PlanetType[] = ["sun","moon","mercury","venus","mars","jupiter","saturn"];
export const PLANET_NAMES: Record<PlanetType,string> = {
  sun:"Sol", moon:"Lua", mercury:"Mercúrio", venus:"Vênus", mars:"Marte", jupiter:"Júpiter", saturn:"Saturno",
  uranus:"Urano", neptune:"Netuno", pluto:"Plutão", northNode:"Nodo Norte", southNode:"Nodo Sul",
};
export const NAME_TO_PLANET: Record<string,PlanetType> = {
  "Sol":"sun","Lua":"moon","Mercúrio":"mercury","Vênus":"venus","Marte":"mars","Júpiter":"jupiter","Saturno":"saturn",
};

export const HORARY_SOURCES: HorarySourceRef[] = [
  {id:"M-HORARY-CURRENT",author:"Marcos Monteiro",tier:"primary-current",work:"Curso, Q&A e materiais recentes de astrologia horária",note:"Fonte principal para gramática prática, casas, contexto e refinamentos atuais."},
  {id:"M-HOUSE-TURNING",author:"Marcos Monteiro",tier:"primary-current",work:"Material sobre casas e turning houses",note:"Casas como divisões dos assuntos da vida; derivação recursiva apenas quando a relação X de Y faz sentido, evitando virar casas inutilmente."},
  {id:"F-HT",author:"John Frawley",tier:"primary-published",work:"The Horary Textbook",note:"Fonte principal para procedimento operacional e exemplos por classe de pergunta."},
  {id:"F-RAA",author:"John Frawley",tier:"primary-published",work:"The Real Astrology Applied",locator:"Horary Astrology",note:"Fundamentos e filosofia operacional da horária."},
  {id:"G-SUPP",author:"Luiz Gonzaga de Carvalho Neto",tier:"secondary",work:"Material astrológico atribuído no corpus do projeto",note:"Somente suplementar; nenhuma regra horária é criada sem material direto."},
  {id:"M-HE-CHAMPION",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Will the Champion Retain His Belt?",note:"Caso de competição assimétrica e antíscio."},
  {id:"M-HE-BRAZIL",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Will Brazil Win the 2014 World Cup?",note:"Identificação do querente com equipe e vitória."},
  {id:"M-HE-TRIAL",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — When Will I Win the Money from This Trial?",note:"Processo, proibição e proibição da proibição."},
  {id:"M-HE-BET",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Will I Profit from This Bet?",note:"Aposta, estação e refranação."},
  {id:"M-HE-TRIP-BUSINESS",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Trip or Co-working?",note:"Escolha, lucro e tradução."},
  {id:"M-HE-REL",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Will She Talk to Me Again?",note:"Recepções, comunicação e qualidade vocal."},
  {id:"M-HE-BABY",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Baby / Birth",note:"Criança, parto, médico e cirurgia em caso específico."},
  {id:"M-HE-STOMACH",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Stomach",note:"Órgão, condição e causalidade humoral-simbólica."},
  {id:"M-HE-DARRYL",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — Will Darryl Die?",note:"VIII radical/derivada e interposições."},
  {id:"M-HE-INTERNET",author:"Marcos Monteiro",tier:"primary-published",work:"Horary Examples — When Will the Internet Be Cut Off?",note:"Serviço, Mercúrio, voz dos signos e timing simbólico."},
  {id:"MA-OPS",author:"MathAstro",tier:"operational",work:"Contrato HORARY_ONLY",note:"Regras de isolamento, auditoria, relatório e segurança de software."},
];

export const TOPIC_DEFAULT_HOUSES: Partial<Record<HoraryTopic,number>> = {
  relationship:7, marriage:7, separation:7, lover:7,
  job_get:10, job_keep:10, job_quality:10, career_choice:10,
  money:2, salary:11, debt:8, loan:8, investment:2, tax:10, bet:8,
  buy_sell:7, property:4, lost_object:2, missing_animal:6, missing_person:7, theft:2,
  lawsuit:7, competition:7, should_i:7, travel:9, travel_profit:9,
  study:9, exam:9, knowledge:9, course:9,
  health:6, illness:6, doctor:7, treatment:10, surgery:6, pregnancy:5, death:8,
  prison:12, release:12, self_undoing:12, hidden_enemy:12, psychic_attack:12,
  wish:11, dream_truth:9, dream_meaning:9, rumour:3, news_truth:3,
  weather:4, public_event:10, adoption:11, lottery:11, government_grant:11, communication:3, service_change:6, delivery:8, authenticity:8, kidnapping:12,
};

export const TOPIC_REQUIRED_CONTEXT: Partial<Record<HoraryTopic,string[]>> = {
  work_relationship:["workRelation"],
  inheritance:["sourcePersonHouse"],
  prison:["prisonState"],
  release:["prisonState"],
  wish:["desiredObjectTopic"],
  dream_meaning:["dreamNarrative"],
  missing_person:["subjectHouse"],
  kidnapping:["subjectHouse"],

};

export const ASPECT_ANGLES = [
  {name:"conjunction" as const, angle:0},
  {name:"sextile" as const, angle:60},
  {name:"square" as const, angle:90},
  {name:"trine" as const, angle:120},
  {name:"opposition" as const, angle:180},
];

export type HoraryVoiceQuality = "mute" | "loud" | "half" | "weak";
/** Frawley, Horary Textbook: água=mudo; Gêmeos/Virgem/Libra=voz alta; Áries/Touro/Leão/Sagitário=meia voz; Capricórnio/Aquário=voz fraca. */
export const SIGN_VOICE: HoraryVoiceQuality[] = ["half","half","loud","mute","half","loud","loud","mute","half","weak","weak","mute"];
export const FERTILITY_CLASS: Array<"fertile"|"barren"|"neutral"> = ["neutral","neutral","barren","fertile","barren","barren","neutral","fertile","neutral","neutral","neutral","fertile"];

export const AVERAGE_SPEED: Partial<Record<PlanetType,number>> = {
  sun:0.9856, moon:13.1764, mercury:1.3833, venus:1.2, mars:0.524, jupiter:0.0831, saturn:0.0335,
};
