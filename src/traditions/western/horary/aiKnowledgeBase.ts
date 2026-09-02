import type { HoraryAISourceEvidence, HoraryAISourceResolver } from "./types";

/**
 * Base de conhecimento CURADA e parafraseada do método já consolidado no projeto.
 * Não substitui o corpus primário. Ela garante que um provedor de IA recém-conectado
 * receba um mínimo metodológico verificável mesmo antes de um RAG externo ser ligado.
 */
export const HORARY_BUILTIN_SOURCE_EVIDENCE: Record<string, HoraryAISourceEvidence> = {
  "M-HORARY-CURRENT": {
    sourceId:"M-HORARY-CURRENT",
    title:"Marcos Monteiro — regras horárias consolidadas",
    locator:"resumo operacional curado MathAstro",
    excerpt:"Horária deve ser mantida separada de natal/eletiva; pergunta concreta e sinceramente desejada; casas e relações são resolvidas antes dos testemunhos; aspectos/perfeições mostram ocorrência, recepções descrevem disposição; considerações antes do julgamento são cautelas e não invalidações mecânicas; default da situação importa; sem score totalizador; sete planetas tradicionais regem casas; antíscio pode funcionar como contato, mas significados de segredo dependem de contexto; turning deve seguir a relação real e não o possessivo verbal."
  },
  "M-HOUSE-TURNING": {
    sourceId:"M-HOUSE-TURNING",
    title:"Marcos Monteiro — casas e turning houses",
    locator:"resumo operacional curado MathAstro",
    excerpt:"As doze casas são uma gramática de assuntos. Para obter X de Y, trate a casa de Y como primeira e conte até a casa de X, mas somente quando X realmente pertence ou se relaciona a Y. Exemplos: dinheiro do pai = II da IV; irmão do pai = III da IV. Não derive instituições sem necessidade: a universidade frequentada pelo filho normalmente continua IX radical. Relações podem ser compostas recursivamente, mas cada elo precisa fazer sentido."
  },
  "F-HT": {
    sourceId:"F-HT",
    title:"John Frawley — The Horary Textbook",
    locator:"resumo operacional curado MathAstro",
    excerpt:"Julgue primeiro a pergunta real, depois as casas e os significadores. Evento exige contato/perfeição ou mecanismo equivalente; recepção e dignidade não substituem evento. Orbes não funcionam como portão arbitrário contra uma perfeição real. Leia aplicação/separação, Lua, tradução, coleta, proibição, refranação, estações, mudanças de signo e contatos solares. Dignidade essencial e acidental têm funções distintas. Timing só vem depois do sim e combina arco simbólico, contexto, signo/casa e, quando possível, calibração por evento passado. Turning deve ser usado com parcimônia e pela relação real."
  },
  "F-RAA": {
    sourceId:"F-RAA",
    title:"John Frawley — The Real Astrology Applied",
    locator:"resumo operacional curado MathAstro",
    excerpt:"A horária funciona como sistema congruente próprio e não precisa ser validada pela natividade. Mantenha a técnica tradicional simples antes de adicionar ornamentos. O julgamento deve partir das casas, significadores e relações relevantes, não de proliferação de corpos ou símbolos secundários."
  },
  "G-SUPP": {
    sourceId:"G-SUPP",
    title:"Luiz Gonzaga de Carvalho Neto — suplemento horário",
    locator:"resumo operacional curado MathAstro",
    excerpt:"O momento da pergunta é ligado à compreensão/aceitação pelo astrólogo; contexto e default devem ser definidos. Considerações tradicionais podem funcionar como impedimentos/cautelas em combinação. Há variantes próprias para timing por qualidade de casas/signos e usos interpretativos de antíscio/contra-antíscio. Quando essas regras divergirem do canônico Marcos/Frawley, devem ser apresentadas como variante explícita, nunca fundidas silenciosamente."
  },
  "MA-OPS": {
    sourceId:"MA-OPS",
    title:"MathAstro — contrato operacional HORARY_ONLY",
    locator:"runtime",
    excerpt:"Astronomia, cúspides, regentes, dignidades, recepções, aspectos, antíscios e cronologia fornecidos pelo motor são imutáveis para a IA. A IA resolve somente semântica e interpretação contextual. Ambiguidade que altera casa/método exige clarificação. Ausência de regra exige SOURCE_RULE_REQUIRED. Não misturar natal, sinastria ou eletiva; não inventar fontes; não usar score totalizador; declarar subjetividade residual."
  },
  "M-HE-CHAMPION": {sourceId:"M-HE-CHAMPION",title:"Marcos — Champion Retain His Belt",locator:"Horary Examples",excerpt:"Caso de competição assimétrica: campeão/incumbente e desafiante podem exigir casas diferentes do I/VII genérico. A dignidade acidental e contatos antiscais pertinentes podem ser decisivos. A regra é contextual e não deve ser universalizada para todo esporte."},
  "M-HE-BRAZIL": {sourceId:"M-HE-BRAZIL",title:"Marcos — Brazil 2014 World Cup",locator:"Horary Examples",excerpt:"Quando o querente se identifica fortemente com sua equipe, a equipe pode compartilhar I. Vitória/troféu pode exigir casa própria no caso documentado. Boa recepção sem perfeição não basta para produzir o evento."},
  "M-HE-TRIAL": {sourceId:"M-HE-TRIAL",title:"Marcos — Trial Money",locator:"Horary Examples",excerpt:"Caso jurídico com I/VII, juiz X e veredicto IV. A sequência cronológica inclui interferências complexas: uma proibição pode ser ela própria impedida por contato anterior, portanto a cadeia precisa ser resolvida em ordem e não por rótulo isolado."},
  "M-HE-BET": {sourceId:"M-HE-BET",title:"Marcos — Profit from Bet",locator:"Horary Examples",excerpt:"Aposta é julgada como lucro: dinheiro do querente II, bookmaker VII e dinheiro desejado VIII. Uma aplicação aparente falha porque Vênus estaciona antes da perfeição; a estação/refranação revoga o evento."},
  "M-HE-TRIP-BUSINESS": {sourceId:"M-HE-TRIP-BUSINESS",title:"Marcos — Trip or Co-working",locator:"Horary Examples",excerpt:"Pergunta de escolha deve manter alternativas separadas. Viagem e negócio recebem casas próprias, bem como lucro/dinheiro. A Lua pode traduzir luz entre uma opção e o dinheiro, e recepção negativa pode mostrar a atividade prejudicando recursos."},
  "M-HE-REL": {sourceId:"M-HE-REL",title:"Marcos — Will She Talk to Me Again",locator:"Horary Examples",excerpt:"Sentimento é lido por recepções; retomada de comunicação é evento e requer conexão. Qualidade vocal dos signos e mudança iminente de signo podem explicar silêncio e alteração de atitude. Não confundir importância afetiva com ocorrência de contato."},
  "M-HE-BABY": {sourceId:"M-HE-BABY",title:"Marcos — Baby / Birth",locator:"Horary Examples",excerpt:"Caso com criança V, childbed XII, médico VII e cirurgia VI como particularidade documentada de Marcos. Questão de saúde da criança e timing do nascimento são subperguntas distintas; não transformar a variante de cirurgia em regra universal."},
  "M-HE-STOMACH": {sourceId:"M-HE-STOMACH",title:"Marcos — Stomach",locator:"Horary Examples",excerpt:"Caso médico em que estômago é V na prática de Marcos. Pessoa e órgão podem compartilhar regente sem criar aspecto do planeta consigo mesmo. A condição do órgão, combustão, dispositor e qualidades simbólicas podem formar uma cadeia causal descritiva, sem pretensão de diagnóstico clínico."},
  "M-HE-DARRYL": {sourceId:"M-HE-DARRYL",title:"Marcos — Will Darryl Die",locator:"Horary Examples",excerpt:"Para morte de terceiro, examine VIII radical e VIII derivada. Morte exige contato que realmente leve o significador à morte; interposições/proibições e antíscios pertinentes devem ser resolvidos antes. Antíscio não substitui automaticamente contato corporal para morte."},
  "M-HE-INTERNET": {sourceId:"M-HE-INTERNET",title:"Marcos — Internet Cut Off",locator:"Horary Examples",excerpt:"Prestador de serviço pode ser VI; o serviço de comunicação pode ser representado também por Mercúrio natural. Mudança de Gêmeos vocal para Câncer mudo simboliza interrupção. O arco em graus fornece unidades simbólicas de timing; o tempo astronômico real do ingresso serve para cronologia e não substitui automaticamente a escala simbólica."},
};

export const BUILTIN_HORARY_SOURCE_RESOLVER: HoraryAISourceResolver = {
  async resolve(input){
    return input.sourceIds.map(id=>HORARY_BUILTIN_SOURCE_EVIDENCE[id]).filter((x):x is HoraryAISourceEvidence=>!!x);
  }
};

export function createBuiltInHorarySourceResolver():HoraryAISourceResolver{
  return BUILTIN_HORARY_SOURCE_RESOLVER;
}
