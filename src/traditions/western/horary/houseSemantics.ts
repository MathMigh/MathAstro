import { derivedHouse } from "./calculations";
import type {
  HoraryCompiledSemanticRole,
  HoraryHouseAssignment,
  HoraryHouseAtlasEntry,
  HoraryHouseNumber,
  HoraryHouseSemanticMeaning,
  HoraryHouseSemanticKey,
  HoraryQuestionContext,
  HorarySemanticFrame,
  HorarySemanticRoleSpec,
} from "./types";

export const HORARY_HOUSE_ATLAS_VERSION = "2026-09-01.marcos-frawley.v1";

const M="M-HOUSE-TURNING", F="F-HT";
const meaning=(key:HoraryHouseSemanticKey,label:string,relativeHouse:HoraryHouseNumber,turning:HoraryHouseSemanticMeaning["turning"],note?:string):HoraryHouseSemanticMeaning=>({key,label,relativeHouse,turning,sourceIds:[M,F],note});

/**
 * Atlas semântico das casas para HORARY_ONLY.
 *
 * Importante: isto NÃO é um classificador de linguagem natural. A frase humana é
 * potencialmente ambígua e deve ser convertida por uma camada inteligente (IA/UI/
 * astrólogo) em papéis semânticos. O núcleo abaixo apenas compila esses papéis em
 * casas radicais/derivadas de forma determinística e auditável.
 *
 * A infinitude prática das perguntas vem da composição recursiva: dinheiro (II)
 * do vizinho (III), filho (V) do irmão (III), trabalho (X) da esposa (VII), etc.
 */
export const HORARY_HOUSE_ATLAS: readonly HoraryHouseAtlasEntry[] = Object.freeze([
  {house:1,principle:"O próprio sujeito/querente e aquilo que lhe é imediatamente próprio.",sourceIds:[M,F],meanings:[
    meaning("self","querente / próprio sujeito",1,"intrinsic"), meaning("person","pessoa tomada como sujeito",1,"intrinsic"),
    meaning("body","corpo do sujeito",1,"intrinsic"), meaning("head","cabeça / face",1,"intrinsic"),
    meaning("voice","voz do sujeito",1,"intrinsic"), meaning("name","nome / identidade nominal",1,"intrinsic"),
  ]},
  {house:2,principle:"Aquilo que o sujeito possui, usa, guarda, recebe ou perde como recurso móvel.",sourceIds:[M,F],meanings:[
    meaning("money","dinheiro / recursos financeiros",2,"intrinsic"), meaning("possessions","posses móveis",2,"intrinsic"),
    meaning("movable_object","objeto móvel possuído",2,"intrinsic"), meaning("bank_balance","saldo / bolso / conta",2,"intrinsic"),
    meaning("personal_resources","recursos materiais do sujeito",2,"intrinsic"),
  ]},
  {house:3,principle:"Mesmo nível geracional, vizinhança, circulação rotineira e comunicação cotidiana.",sourceIds:[M,F],meanings:[
    meaning("sibling","irmão / irmã",3,"intrinsic"), meaning("same_generation_relative","parente da mesma geração",3,"intrinsic"),
    meaning("neighbor","vizinho",3,"intrinsic"), meaning("routine_communication","comunicação rotineira",3,"usually_radical"),
    meaning("sent_message","mensagem/carta enviada",3,"usually_radical"), meaning("local_journey","deslocamento local / rotina",3,"usually_radical"),
    meaning("elementary_knowledge","conhecimento elementar",3,"usually_radical"), meaning("elementary_school","escola elementar",3,"usually_radical"),
    meaning("student","aluno do sujeito",3,"intrinsic"), meaning("arms_hands","braços, ombros e mãos",3,"intrinsic"),
  ]},
  {house:4,principle:"Raiz, terra, casa, patrimônio imóvel e término formal de certos assuntos.",sourceIds:[M,F],meanings:[
    meaning("father","pai",4,"intrinsic"), meaning("parents","pais em geral",4,"intrinsic"), meaning("ancestry","ancestralidade / raízes",4,"intrinsic"),
    meaning("home","casa / lar do sujeito",4,"intrinsic"), meaning("land","terra / terreno",4,"intrinsic"), meaning("immovable_property","imóvel / propriedade",4,"intrinsic"),
    meaning("homeland","país natal / pátria",4,"usually_radical"), meaning("end_of_matter","fim do assunto",4,"usually_radical"),
    meaning("verdict","veredicto / fim do processo",4,"usually_radical","Uso tópico em processos; não é um fallback para qualquer pergunta."),
    meaning("prognosis","prognóstico / fim da enfermidade",4,"contextual"), meaning("buried_thing","coisa enterrada / subterrânea",4,"usually_radical"),
    meaning("chest_lungs","peito e pulmões",4,"intrinsic"),
  ]},
  {house:5,principle:"Geração, prazer, criação e atividades prazerosas/competitivas do sujeito.",sourceIds:[M,F],meanings:[
    meaning("child","filho / criança do sujeito",5,"intrinsic"), meaning("pregnancy","gravidez / concepção",5,"intrinsic"), meaning("sex","sexo enquanto atividade",5,"intrinsic"),
    meaning("pleasure","prazer / diversão",5,"intrinsic"), meaning("sport","esporte enquanto atividade",5,"intrinsic"), meaning("creative_work","obra criada / 'filho' simbólico",5,"intrinsic"),
    meaning("heart_liver_stomach","coração, fígado, estômago, lados e costas",5,"intrinsic"), meaning("messenger","mensageiro / embaixador",5,"usually_radical"),
  ]},
  {house:6,principle:"Enfermidade, serviço subordinado e animais pequenos/domesticáveis.",sourceIds:[M,F],meanings:[
    meaning("illness","doença / enfermidade",6,"intrinsic"), meaning("hospital","hospital / lugar de tratamento da doença",6,"intrinsic"),
    meaning("subordinate","subordinado / empregado",6,"intrinsic"), meaning("employee","empregado / servidor",6,"intrinsic"),
    meaning("tradesman","prestador operacional / trabalhador contratado",6,"intrinsic"), meaning("service_provider","prestador de serviço subordinado/operacional",6,"intrinsic"),
    meaning("small_animal","animal pequeno / domesticável",6,"intrinsic"), meaning("aunt_uncle","tio/tia em uso geral tradicional",6,"intrinsic"),
    meaning("lower_belly_bowels","baixo ventre, intestinos e vísceras inferiores",6,"intrinsic"),
  ]},
  {house:7,principle:"O outro em relação direta: parceria, contraparte, confronto e certas relações profissionais.",sourceIds:[M,F],meanings:[
    meaning("spouse","cônjuge",7,"intrinsic"), meaning("partner","parceiro",7,"intrinsic"), meaning("lover","amante / parceiro amoroso",7,"intrinsic"),
    meaning("business_partner","parceiro comercial",7,"intrinsic"), meaning("client","cliente / contraparte contratual",7,"intrinsic"),
    meaning("counterparty","outra parte numa negociação",7,"intrinsic"), meaning("open_enemy","inimigo aberto",7,"intrinsic"), meaning("opponent","oponente",7,"intrinsic"),
    meaning("tenant","inquilino moderno em relação contratual",7,"intrinsic"), meaning("treating_doctor","médico que trata este caso",7,"intrinsic"),
    meaning("unrelated_other","outra pessoa sem relação mais específica",7,"intrinsic"),
  ]},
  {house:8,principle:"Morte e, por derivação relacional, dinheiro/posses da contraparte.",sourceIds:[M,F],meanings:[
    meaning("death","morte do sujeito",8,"dual_radical_and_turned","Para morte de terceiro, testar VIII radical e VIII derivada."),
    meaning("other_person_money","dinheiro da contraparte padrão",8,"contextual","É II da VII; prefira compor money ancorado na pessoa concreta quando ela não for a VII."),
  ]},
  {house:9,principle:"Conhecimento superior, fé, exterior/estrangeiro, viagens significativas, sonhos e saber especializado.",sourceIds:[M,F],meanings:[
    meaning("higher_knowledge","conhecimento superior",9,"usually_radical"), meaning("university","universidade / ensino superior",9,"usually_radical","Não virar só porque alguém frequenta a universidade; ela não lhe pertence."),
    meaning("teacher","professor / mestre",9,"intrinsic"), meaning("priest","sacerdote / religioso",9,"intrinsic"), meaning("religion","fé / religião / culto",9,"usually_radical"),
    meaning("foreign_country","país estrangeiro / exterior",9,"usually_radical"), meaning("long_journey","viagem longa/significativa",9,"usually_radical"), meaning("pilgrimage","peregrinação",9,"usually_radical"),
    meaning("dream","sonho literal",9,"usually_radical"), meaning("prediction","previsão / profecia",9,"usually_radical"), meaning("astrologer","astrólogo / sábio consultado",9,"intrinsic"),
    meaning("learned_person","pessoa erudita",9,"intrinsic"),
  ]},
  {house:10,principle:"Ação pública, ofício, autoridade, governo, decisão superior e mãe.",sourceIds:[M,F],meanings:[
    meaning("career","carreira / ofício",10,"intrinsic"), meaning("job","emprego / posição profissional",10,"intrinsic"), meaning("boss","chefe / autoridade do sujeito",10,"intrinsic"),
    meaning("authority","autoridade",10,"intrinsic"), meaning("government","governo / governante",10,"usually_radical"), meaning("king","rei / governante atual",10,"usually_radical"),
    meaning("judge","juiz / processo decisório judicial",10,"usually_radical"), meaning("mother","mãe",10,"intrinsic"), meaning("honor_success","honra / sucesso / glória",10,"intrinsic"),
    meaning("public_action","ação pública/visível",10,"intrinsic"), meaning("property_price","preço do imóvel",10,"contextual","Uso tópico documentado em compra/venda de imóvel."),
    meaning("medical_treatment","tratamento aplicado em questão de doença",10,"intrinsic","Frawley: tratamento dado em contexto médico."),
  ]},
  {house:11,principle:"Amigos, dádivas, esperanças e recursos que descem da autoridade/emprego.",sourceIds:[M,F],meanings:[
    meaning("friend","amigo",11,"intrinsic"), meaning("gift","presente / dádiva",11,"intrinsic"), meaning("hope_wish","esperança / desejo",11,"intrinsic"),
    meaning("wages","salário / dinheiro do emprego",11,"contextual","II da X; para emprego do terceiro, prefira compor money ancorado no job/autoridade pertinente."),
    meaning("government_money","dinheiro/cofre do governo",11,"contextual","II da X."), meaning("government_gift","favor/concessão do governo",11,"contextual"),
    meaning("windfall","ganho que cai no colo / loteria",11,"usually_radical"), meaning("advisor","assessor/auxiliar da autoridade",11,"intrinsic"),
    meaning("adoptive_child","criança ainda alheia a ser adotada",11,"contextual","V da VII quando não pertence a pessoa específica já identificada."),
  ]},
  {house:12,principle:"Confinamento, auto-sabotagem, ocultação hostil e animais grandes.",sourceIds:[M,F],meanings:[
    meaning("prison","prisão / cativeiro / confinamento",12,"dual_radical_and_turned","Para terceiro, considerar XII radical e XII derivada."),
    meaning("self_undoing","auto-sabotagem / self-undoing",12,"intrinsic"), meaning("hidden_enemy","inimigo oculto",12,"intrinsic"),
    meaning("temptation","tentação",12,"intrinsic"), meaning("psychological_problem","problema psicológico em gramática histórica",12,"intrinsic"),
    meaning("large_animal","animal grande",12,"intrinsic"), meaning("childbed","confinamento do parto / childbed",12,"intrinsic"),
    meaning("garage_stable","garagem / estábulo em localização de objetos",12,"intrinsic"),
  ]},
]);

export const HORARY_HOUSE_MEANINGS: Readonly<Record<HoraryHouseSemanticKey,HoraryHouseSemanticMeaning>> = Object.freeze(
  Object.fromEntries(HORARY_HOUSE_ATLAS.flatMap(h=>h.meanings.map(m=>[m.key,m]))) as Record<HoraryHouseSemanticKey,HoraryHouseSemanticMeaning>
);

export const HORARY_HOUSE_SEMANTIC_KEYS = Object.freeze(Object.keys(HORARY_HOUSE_MEANINGS) as HoraryHouseSemanticKey[]);

function resolveMode(spec:HorarySemanticRoleSpec,semantic:HoraryHouseSemanticMeaning):"radical"|"turned"|"unresolved" {
  if(spec.relationMode==="radical"||spec.relationMode==="turned") return spec.relationMode;
  if(semantic.turning==="usually_radical") return "radical";
  if(semantic.turning==="contextual") return (spec.anchorRole??"querent")==="querent"?"radical":"unresolved";
  return "turned";
}

export function compileHorarySemanticFrame(ctx:HoraryQuestionContext,baseAssignments:HoraryHouseAssignment[]):HorarySemanticFrame {
  const assignments=[...baseAssignments];
  const roleHouse=new Map<string,number>(assignments.map(x=>[x.role,x.radicalHouse]));
  if(!roleHouse.has("querent")) roleHouse.set("querent",1);
  const compiled:HoraryCompiledSemanticRole[]=[];
  const unresolved:string[]=[];
  const warnings:string[]=[];
  const pending=[...(ctx.semanticRoles??[])];
  let guard=0;
  while(pending.length&&guard++<Math.max(8,pending.length*3)){
    let progressed=false;
    for(let i=pending.length-1;i>=0;i--){
      const spec=pending[i];
      const semantic=HORARY_HOUSE_MEANINGS[spec.meaning];
      const anchorRole=spec.anchorRole??"querent";
      const mode=resolveMode(spec,semantic);
      if(mode==="unresolved"){
        unresolved.push(`semanticRole:${spec.role}:relationMode`);
        warnings.push(`Papel “${spec.role}” (${semantic.label}) é contextual quando ancorado em “${anchorRole}”; a camada inteligente deve escolher radical ou turned, em vez de o núcleo adivinhar.`);
        pending.splice(i,1); progressed=true; continue;
      }
      const anchorHouse=mode==="radical"?1:roleHouse.get(anchorRole);
      if(anchorHouse===undefined) continue;
      const radicalHouse=mode==="radical"?semantic.relativeHouse:derivedHouse(anchorHouse,semantic.relativeHouse);
      const rationale=spec.rationale?.trim()||`${semantic.label}: ${mode==="radical"?`casa ${semantic.relativeHouse} radical`:`${semantic.relativeHouse}ª a partir de ${anchorRole} (casa ${anchorHouse})`}.`;
      const c:HoraryCompiledSemanticRole={role:spec.role,label:spec.label,meaning:spec.meaning,anchorRole,relationMode:mode,relativeHouse:semantic.relativeHouse,radicalHouse,turning:semantic.turning,rationale,sourceIds:spec.sourceIds?.length?spec.sourceIds:semantic.sourceIds,primary:spec.primary===true};
      compiled.push(c); roleHouse.set(spec.role,radicalHouse);
      assignments.push({role:spec.role,radicalHouse,derivedFrom:mode==="turned"?anchorHouse:undefined,derivation:mode==="turned"?semantic.relativeHouse:undefined,rationale,sourceIds:c.sourceIds});
      if(semantic.turning==="dual_radical_and_turned"&&mode==="turned"&&anchorRole!=="querent"){
        const companionRole=`${spec.role}:radical`;
        if(!roleHouse.has(companionRole)){
          assignments.push({role:companionRole,radicalHouse:semantic.relativeHouse,rationale:`Contraparte radical obrigatória de ${semantic.label}: casa ${semantic.relativeHouse} radical deve ser examinada junto da derivada para terceiro.`,sourceIds:c.sourceIds});
          roleHouse.set(companionRole,semantic.relativeHouse);
          warnings.push(`${semantic.label}: motor materializou automaticamente casa radical ${semantic.relativeHouse} + casa derivada ${radicalHouse}, conforme regra de dupla checagem.`);
        }
      }
      pending.splice(i,1); progressed=true;
    }
    if(!progressed) break;
  }
  for(const spec of pending){ unresolved.push(`semanticRole:${spec.role}:anchor:${spec.anchorRole??"querent"}`); warnings.push(`Não foi possível resolver o papel semântico “${spec.role}”: âncora “${spec.anchorRole??"querent"}” ausente ou cíclica.`); }
  for(const a of ctx.semanticAmbiguities??[]){
    if(a.blocking!==false){ unresolved.push(`semanticAmbiguity:${a.phrase}`); warnings.push(`Ambiguidade semântica bloqueadora: “${a.phrase}”. Candidatos: ${a.candidates.map(c=>`${c.meaning}${c.anchorRole?`@${c.anchorRole}`:""}`).join(" | ")}.`); }
  }
  return {
    atlasVersion:HORARY_HOUSE_ATLAS_VERSION,
    compiledRoles:compiled,
    houseAssignments:assignments,
    unresolved:[...new Set(unresolved)],
    warnings:[...new Set(warnings)],
    requiresInterpretiveLayer:true,
    policy:[
      "O núcleo não adivinha o tema de uma frase por palavras-chave: IA/UI/astrólogo resolve entidades, relações e função simbólica antes do cálculo.",
      "Casas podem ser compostas recursivamente: a casa de X torna-se a I de X e a relação seguinte é contada a partir dela.",
      "Não virar casas inutilmente: instituições/objetos que não pertencem ao sujeito permanecem radicais quando a fonte assim exige.",
      "Quando duas leituras semanticamente plausíveis permanecem abertas, registrar ambiguidade e não escolher silenciosamente.",
    ],
  };
}

export function houseAtlasSummary():Array<{house:number;principle:string;meanings:string[]}>{
  return HORARY_HOUSE_ATLAS.map(h=>({house:h.house,principle:h.principle,meanings:h.meanings.map(m=>`${m.key}: ${m.label}`)}));
}
