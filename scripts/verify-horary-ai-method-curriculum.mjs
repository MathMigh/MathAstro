import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const ai=fs.readFileSync(path.join(root,'src/traditions/western/horary/aiHandoff.ts'),'utf8');
const errors=[];
const modules={
  scope:['HORARY_ONLY','Temperamento natal','potências da alma','OUT_OF_SCOPE_HORARY'],
  question:['NASCIMENTO E LEGITIMIDADE DA PERGUNTA','DEFAULT'],
  semantics:['PROTOCOLO SEMÂNTICO PARA SITUAÇÕES INFINITAS','SEMÂNTICA OPERACIONAL DAS 12 CASAS','TURNING / CASAS DERIVADAS'],
  significators:['ELEIÇÃO DE SIGNIFICADORES','Planetas exteriores nunca regem casas'],
  condition:['DIGNIDADE ESSENCIAL','DIGNIDADE ACIDENTAL','COMBUSTÃO, RAIOS, CAZIMI E SOL'],
  reception:['RECEPÇÕES — LEITURA DIRECIONAL','Recepção não cria evento'],
  event:['EVENTO, ESTADO E DESCRIÇÃO','PERFEIÇÃO E CRONOLOGIA','ASPECTOS — CONTATO E PERFEIÇÃO'],
  moon:['LUA — SEQUÊNCIA E VOC'],
  mechanics:['TRADUÇÃO DE LUZ','COLETA DE LUZ','PROIBIÇÃO','FRUSTRAÇÃO','REFRANAÇÃO'],
  antiscia:['ANTÍSCIOS E CONTRA-ANTÍSCIOS'],
  signs:['QUALIDADES DOS SIGNOS','Fertilidade','Voz:'],
  timing:['TIMING — MÉTODO E CAUTELAS','arco simbólico','dias reais da efeméride'],
  defaultNoAspect:['DEFAULT E “NENHUM ASPECTO”'],
  relationships:['PROTOCOLOS TÓPICOS — RELACIONAMENTOS'],
  work:['PROTOCOLOS TÓPICOS — TRABALHO E CARREIRA'],
  money:['PROTOCOLOS TÓPICOS — DINHEIRO, PAGAMENTO, DÍVIDA E EMPRÉSTIMO','PROTOCOLOS TÓPICOS — INVESTIMENTO, APOSTA E LOTERIA','PROTOCOLOS TÓPICOS — HERANÇA E IMPOSTOS'],
  property:['PROTOCOLOS TÓPICOS — IMÓVEIS E NEGÓCIOS'],
  lostTheft:['PROTOCOLOS TÓPICOS — OBJETOS PERDIDOS E LOCALIZAÇÃO','PROTOCOLOS TÓPICOS — FURTO','PROTOCOLOS TÓPICOS — PESSOA/ANIMAL DESAPARECIDO'],
  contests:['PROTOCOLOS TÓPICOS — PROCESSOS, CONTENDAS E ELEIÇÕES'],
  study:['PROTOCOLOS TÓPICOS — VIAGEM, ESTUDO, CONHECIMENTO'],
  medical:['PROTOCOLOS TÓPICOS — SAÚDE, DOENÇA, MÉDICO, TRATAMENTO, CIRURGIA','PROTOCOLOS TÓPICOS — GRAVIDEZ E FILHOS'],
  deathPrison:['PROTOCOLOS TÓPICOS — MORTE, PRISÃO, CATIVEIRO E SOLTURA'],
  truthDream:['PROTOCOLOS TÓPICOS — VERDADE, RUMOR, NOTÍCIA, SONHO'],
  services:['PROTOCOLOS TÓPICOS — SERVIÇOS, INTERNET, COMUNICAÇÃO E ENTREGA'],
  government:['PROTOCOLOS TÓPICOS — GOVERNO, PRESENTES E DESEJOS'],
  adoption:['PROTOCOLOS TÓPICOS — ADOÇÃO'],
  choices:['PROTOCOLO “DEVO FAZER X?” E ESCOLHAS'],
  auxiliaries:['PARTES, NODOS, ESTRELAS E OUTROS AUXILIARES'],
  variants:['GUGU — VARIANTES EXPLÍCITAS'],
  inference:['DISCIPLINA DE INFERÊNCIA','SUBJETIVIDADE CONTROLADA — O QUE PODE DEPENDER DO ASTRÓLOGO','QUANDO PEDIR CLARIFICAÇÃO','ESTILO DE CONSULTA'],
  output:['SAÍDA OBRIGATÓRIA','CHECKLIST FINAL ANTES DE RESPONDER','REGRA DE OURO'],
};
let tokens=0;
for(const [name,required] of Object.entries(modules)){
  for(const token of required){ tokens++; if(!ai.includes(token)) errors.push(`${name}:${token}`); }
}
for(const roman of ['I —','II —','III —','IV —','V —','VI —','VII —','VIII —','IX —','X —','XI —','XII —']){tokens++; if(!ai.includes(roman))errors.push(`house:${roman}`);}
if(errors.length){console.error('HORARY_AI_METHOD_CURRICULUM_FAIL',errors);process.exit(1);}
console.log(`HORARY_AI_METHOD_CURRICULUM_OK modules=${Object.keys(modules).length} tokens=${tokens} houses=12 prompt=pt-BR-v3 scope=horary-only procedural=integral topic-protocols=present subjectivity=explicit`);
