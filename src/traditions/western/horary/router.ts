import type { HoraryHouseAssignment, HoraryQuestionContext, HoraryTopicAnalysis } from "./types";
import { TOPIC_DEFAULT_HOUSES, TOPIC_REQUIRED_CONTEXT } from "./tables";
import { derivedHouse } from "./calculations";
import { compileHorarySemanticFrame } from "./houseSemantics";

function has(ctx:HoraryQuestionContext,key:string):boolean {
  return (ctx as unknown as Record<string,unknown>)[key] !== undefined && (ctx as unknown as Record<string,unknown>)[key] !== "";
}
function pushUnique(houses:HoraryHouseAssignment[],h:HoraryHouseAssignment){ if(!houses.some(x=>x.role===h.role)) houses.push(h); }
function resolvePath(rootHouse:number,turns:number[]=[]):number {
  return turns.reduce((h,turn)=>derivedHouse(h,turn),rootHouse);
}

export function analyseQuestion(ctx:HoraryQuestionContext):HoraryTopicAnalysis {
  const required=[...(TOPIC_REQUIRED_CONTEXT[ctx.topic]??[])];
  const houses:HoraryHouseAssignment[]=[];
  const naturalRoles=[...(ctx.naturalRoles??[])];
  const notes:string[]=[];
  let addGenericQuesited=true;
  pushUnique(houses,{role:"querent",radicalHouse:1,rationale:"A pessoa que formula a pergunta.",sourceIds:["M-HORARY-CURRENT","F-HT"]});

  // Pré-compilação semântica: permite que módulos tópicos recebam a casa do sujeito/fonte
  // por um papel inteligentemente resolvido, sem pedir ao usuário o número radical.
  const semanticPrelude=compileHorarySemanticFrame(ctx,houses);
  for(const h of semanticPrelude.houseAssignments) pushUnique(houses,h);
  const semanticHouse=(roleId?:string)=>roleId?semanticPrelude.compiledRoles.find(r=>r.role===roleId)?.radicalHouse:undefined;
  const subjectHouse=ctx.subjectHouse ?? semanticHouse(ctx.subjectRoleId) ?? 1;
  const sourcePersonHouse=ctx.sourcePersonHouse ?? semanticHouse(ctx.sourcePersonRoleId);
  const paymentSourceHouse=ctx.paymentSourceHouse ?? semanticHouse(ctx.paymentSourceRoleId);
  const suspectHouse=ctx.suspectHouse ?? semanticHouse(ctx.suspectRoleId);
  const serviceProviderHouse=ctx.serviceProviderHouse ?? semanticHouse(ctx.serviceProviderRoleId);
  const fieldResolved=(k:string)=>{
    if(has(ctx,k)) return true;
    if(k==="subjectHouse") return semanticHouse(ctx.subjectRoleId)!==undefined;
    if(k==="sourcePersonHouse") return sourcePersonHouse!==undefined;
    if(k==="paymentSourceHouse") return paymentSourceHouse!==undefined;
    if(k==="suspectHouse") return suspectHouse!==undefined;
    if(k==="serviceProviderHouse") return serviceProviderHouse!==undefined;
    return false;
  };
  const unresolved=required.filter(k=>!fieldResolved(k));
  if(subjectHouse!==1) pushUnique(houses,{role:"subject",radicalHouse:subjectHouse,rationale:ctx.subjectRoleId?`Pessoa/entidade central resolvida pelo papel semântico “${ctx.subjectRoleId}”.`:"Pessoa/entidade central explicitamente identificada no contexto.",sourceIds:["M-HORARY-CURRENT","F-HT"]});

  // Gramática composicional: qualquer papel pode ser definido por casa radical ou por uma cadeia
  // de casas derivadas. Ex.: primo da mãe = 10 -> 3 = 12; dinheiro dele = 10 -> 3 -> 2 = 1.
  for(const spec of ctx.dynamicRoles??[]){
    const radicalHouse=spec.radicalHouse ?? (spec.path?resolvePath(spec.path.rootHouse,spec.path.turns):undefined);
    if(!radicalHouse){ if(!unresolved.includes(`dynamicRole:${spec.role}`)) unresolved.push(`dynamicRole:${spec.role}`); continue; }
    const turns=spec.path?.turns??[];
    pushUnique(houses,{
      role:spec.role,
      radicalHouse,
      derivedFrom:spec.path&&turns.length?spec.path.rootHouse:undefined,
      derivation:turns.length===1?turns[0]:undefined,
      rationale:spec.rationale,
      sourceIds:spec.sourceIds?.length?spec.sourceIds:["F-HT","MA-OPS"],
    });
    if(turns.length>1) notes.push(`Papel ${spec.role}: cadeia derivada ${spec.path!.rootHouse} → ${turns.join(" → ")} = casa radical ${radicalHouse}.`);
  }

  let qHouse=ctx.relevantHouse ?? TOPIC_DEFAULT_HOUSES[ctx.topic];

  if(ctx.topic==="work_relationship"){
    qHouse=ctx.workRelation==="boss"?10:ctx.workRelation==="subordinate"?6:ctx.workRelation==="colleague"?7:undefined;
    notes.push("Chefe/autoridade = X; colega = VII; subordinado = VI. Trata-se primariamente de estado/recepção, não de exigir perfeição de evento.");
  }
  if(ctx.topic==="job_get"){
    qHouse=10;
    pushUnique(houses,{role:"wages",radicalHouse:11,rationale:"Salário: II da X, portanto XI radical.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"job_rival",radicalHouse:7,rationale:"Rival aberto pela vaga: VII.",sourceIds:["F-HT"]});
    notes.push("Conseguir emprego exige L1/L10 e perfeição; salário (L11) qualifica remuneração e não prova obtenção da vaga. L7 pode mostrar rival que recebe a vaga antes do querente.");
  }
  if(ctx.topic==="job_quality"){
    qHouse=10;
    pushUnique(houses,{role:"wages",radicalHouse:11,rationale:"Qualidade da remuneração: II da X = XI.",sourceIds:["F-HT"]});
    notes.push("Qualidade do emprego é descritiva: condição essencial/acidental de L10, aflições e L11 para pagamento; não exige aspecto para existir.");
  }
  if(ctx.topic==="inheritance"&&sourcePersonHouse){
    qHouse=derivedHouse(sourcePersonHouse,2);
    pushUnique(houses,{role:"legacy_money",radicalHouse:qHouse,derivedFrom:sourcePersonHouse,derivation:2,rationale:"Bens da pessoa-fonte: 2ª casa a partir da casa dela.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Posses/dinheiro do querente, destino patrimonial relevante.",sourceIds:["F-HT"]});
    notes.push("Herança específica usa os bens da pessoa-fonte, não VIII automaticamente; verificar chegada a L1/Lua/L2 e possíveis interferências.");
  }
  if(ctx.topic==="wish"&&ctx.desiredObjectTopic){
    qHouse=TOPIC_DEFAULT_HOUSES[ctx.desiredObjectTopic] ?? ctx.relevantHouse;
    pushUnique(houses,{role:"hope/wish",radicalHouse:11,rationale:"XI descreve esperança/desejo; não substitui a casa ontológica do objeto desejado.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
  }
  if(ctx.topic==="tax"){
    pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Dinheiro do querente.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"government",radicalHouse:10,rationale:"Governo/autoridade fiscal.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"government_treasury",radicalHouse:11,rationale:"XI é a 2ª da X: cofres/dinheiro do governo.",sourceIds:["F-HT"]});
    qHouse=11;
    notes.push("Imposto exige relação entre L2, L10 e L11; não deve ser reduzido a L1×L10.");
  }
  if(["health","illness","doctor","treatment","surgery"].includes(ctx.topic)){
    const patientHouse=subjectHouse;
    pushUnique(houses,{role:"patient",radicalHouse:patientHouse,rationale:"Pessoa cuja saúde é investigada.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"illness",radicalHouse:derivedHouse(patientHouse,6),derivedFrom:patientHouse,derivation:6,rationale:"Casa VI da pessoa: doença/enfermidade como assunto; o planeta causal pode ser outro e é diagnosticado separadamente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"doctor_treating_case",radicalHouse:derivedHouse(patientHouse,7),derivedFrom:patientHouse,derivation:7,rationale:"Médico que trata esta doença concreta: VII do paciente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"treatment",radicalHouse:derivedHouse(patientHouse,10),derivedFrom:patientHouse,derivation:10,rationale:"Tratamento aplicado/proposto: X do paciente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    if(ctx.organHouse) pushUnique(houses,{role:"organ",radicalHouse:ctx.organHouse,rationale:"Órgão/parte corporal explicitamente informada no contexto da pergunta.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    notes.push("Diagnóstico médico não identifica automaticamente L6 como planeta causador: procura-se o planeta que aflige o significador do paciente/órgão (dispositor, combustão, aspecto adverso etc.).");
    notes.push("Cirurgia recebe também Marte como significador natural auxiliar; anestesista permanece manual enquanto a regra primária específica de Marcos não estiver documentada no corpus.");
  }
  if(ctx.topic==="pregnancy"){
    addGenericQuesited=false; qHouse=undefined;
    const motherHouse=subjectHouse;
    pushUnique(houses,{role:"mother",radicalHouse:motherHouse,rationale:"Mulher grávida mantém sua casa relacional; no caso da própria querente, I.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"child",radicalHouse:derivedHouse(motherHouse,5),derivedFrom:motherHouse,derivation:5,rationale:"Bebê/gravidez: V da mãe.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"childbed",radicalHouse:derivedHouse(motherHouse,12),derivedFrom:motherHouse,derivation:12,rationale:"Parto/confinamento (childbed): XII da mãe.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"doctor_treating_case",radicalHouse:derivedHouse(motherHouse,7),derivedFrom:motherHouse,derivation:7,rationale:"Médico do caso: VII da paciente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"surgery_marcos_variant",radicalHouse:derivedHouse(motherHouse,6),derivedFrom:motherHouse,derivation:6,rationale:"Variante documentada no caso publicado de Marcos: VI participa como cirurgia/C-section; não substitui o canônico Frawley de tratamento=X em doença.",sourceIds:["M-HORARY-CURRENT"]});
    notes.push("Gravidez é estado/potencial + eventual ocorrência. Antíscio sozinho não é suficiente para afirmar gravidez ou morte; contato corporal continua prioritário nessas classes.");
  }
  if(ctx.topic==="death"){
    addGenericQuesited=false; qHouse=undefined;
    const personHouse=subjectHouse;
    pushUnique(houses,{role:"death_subject",radicalHouse:personHouse,rationale:"Pessoa cuja sobrevivência/morte é perguntada.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"radical_death",radicalHouse:8,rationale:"VIII radical: morte em sentido geral no mapa.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    const turned=derivedHouse(personHouse,8);
    pushUnique(houses,{role:"turned_death",radicalHouse:turned,derivedFrom:personHouse,derivation:8,rationale:"VIII derivada da pessoa investigada; deve ser considerada junto da VIII radical.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    notes.push("Morte de terceiro exige testar o significador da pessoa contra VIII radical e VIII derivada; não se soma aflições genéricas para fabricar morte.");
  }
  if(["prison","release"].includes(ctx.topic)){
    if(!naturalRoles.some(x=>x.role==="imprisonment_natural")) naturalRoles.push({role:"imprisonment_natural",planet:"saturn",rationale:"Saturno como significador natural auxiliar de prisão/confinamento; não substitui XII radical/derivada.",sourceIds:["F-HT"]});
    const personHouse=subjectHouse;
    const derivedPrison=derivedHouse(personHouse,12);
    pushUnique(houses,{role:"prison_subject",radicalHouse:personHouse,rationale:"Pessoa cuja prisão/libertação é perguntada.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    pushUnique(houses,{role:"radical_prison",radicalHouse:12,rationale:"XII radical: prisão/confinamento no mapa da pergunta.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    if(derivedPrison!==12) pushUnique(houses,{role:"derived_prison",radicalHouse:derivedPrison,derivedFrom:personHouse,derivation:12,rationale:"XII derivada da pessoa investigada.",sourceIds:["F-HT"]});
    qHouse=derivedPrison;
    notes.push("Estado atual livre/preso/soltura muda a semântica. Verificar regente(s) de prisão e entrada física do significador da pessoa na cúspide pertinente.");
  }
  if(ctx.topic==="self_undoing"){
    qHouse=12;
    pushUnique(houses,{role:"self_undoing",radicalHouse:12,rationale:"XII enquanto autossabotamento, vício ou dano provocado pelo próprio agente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    notes.push("Avaliar especialmente recepção de L1 em direção a L12, modalidade e mudança de signo de L1.");
  }
  if(ctx.topic==="salary"){
    qHouse=11;
    pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Conta/bolso do querente, possível destino do pagamento.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"wages",radicalHouse:11,rationale:"Salário: II da X.",sourceIds:["F-HT"]});
    notes.push("Pagamento salarial usa L11 e sua chegada a L1/Lua/L2; contato com salário não prova obtenção de vaga.");
  }
  if(["debt","loan"].includes(ctx.topic)){
    const source=paymentSourceHouse ?? (ctx.subjectHouse??semanticHouse(ctx.subjectRoleId)) ?? 7;
    qHouse=derivedHouse(source,2);
    pushUnique(houses,{role:"payer",radicalHouse:source,rationale:"Pessoa/entidade que atualmente detém o dinheiro.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"payment_money",radicalHouse:qHouse,derivedFrom:source,derivation:2,rationale:"Dinheiro da pessoa-fonte: II a partir da casa dela.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Bolso/conta do querente, destino do pagamento.",sourceIds:["F-HT"]});
    notes.push("A procedência do dinheiro governa a casa: dinheiro emprestado pertence astrologicamente à pessoa que o detém enquanto não retorna.");
  }
  if(ctx.topic==="bet"){
    qHouse=8;
    pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Capital do querente antes/depois da aposta.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"bookmaker_money",radicalHouse:8,rationale:"Dinheiro da contraparte/casa de apostas: II da VII.",sourceIds:["F-HT"]});
    notes.push("Quando o interesse real é lucro de aposta, o módulo é financeiro; o jogo em si não converte a pergunta em competição I/VII.");
  }
  if(ctx.topic==="investment"){
    qHouse=2;
    pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Ações/investimentos continuam sendo dinheiro próprio em outra forma.",sourceIds:["F-HT"]});
    notes.push("Mudança de signo e condição futura de L2 podem mostrar melhora/piora da mudança de investimento.");
  }
  if(ctx.topic==="property"||ctx.topic==="buy_sell"){
    pushUnique(houses,{role:"property",radicalHouse:4,rationale:"Imóvel/propriedade.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"price",radicalHouse:10,rationale:"Preço da propriedade: X.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"property_profit",radicalHouse:5,derivedFrom:4,derivation:2,rationale:"Lucro da propriedade: II da IV.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"property_neighbours",radicalHouse:6,derivedFrom:4,derivation:3,rationale:"Vizinhos da propriedade: III da IV.",sourceIds:["F-HT"]});
    if(ctx.topic==="buy_sell") { qHouse=7; notes.push("O acordo compra/venda/locação é entre partes em I/VII; imóvel e preço continuam IV/X."); }
    else qHouse=4;
  }
  if(ctx.topic==="lost_object"){
    qHouse=ctx.relevantHouse ?? 2;
    pushUnique(houses,{role:"lost_object",radicalHouse:qHouse,rationale:"Objeto inanimado normalmente II; IV pode ser escolhido quando descreve melhor o objeto, mediante contexto.",sourceIds:["F-HT"]});
    notes.push("Localização vem primeiro da casa do significador; recuperação é pergunta separada e pode ocorrer por contato com L1/Lua/L2.");
  }
  if(ctx.topic==="missing_animal"){
    qHouse=ctx.animalSize==="large"?12:6;
    pushUnique(houses,{role:"missing_animal",radicalHouse:qHouse,rationale:ctx.animalSize==="large"?"Animal grande = XII.":"Animal pequeno = VI.",sourceIds:["F-HT"]});
    notes.push("Localização usa colocação do significador, casa/signo e contexto; não exige aspecto para o animal estar onde está.");
  }
  if(ctx.topic==="missing_person"){
    qHouse=ctx.subjectHouse ?? semanticHouse(ctx.subjectRoleId);
    if(qHouse) pushUnique(houses,{role:"missing_person",radicalHouse:qHouse,rationale:"Pessoa desaparecida identificada pela relação ordinária com o querente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    notes.push("A pessoa não é tratada como objeto perdido. Depois de identificar seu significador, localização usa casa, signo, antíscio/contexto e direção quando pertinente.");
  }
  if(ctx.topic==="theft"){
    qHouse=ctx.relevantHouse ?? 2;
    pushUnique(houses,{role:"stolen_object",radicalHouse:qHouse,rationale:"Objeto/posse supostamente furtado.",sourceIds:["F-HT"]});
    if(suspectHouse) pushUnique(houses,{role:"theft_suspect",radicalHouse:suspectHouse,rationale:"Suspeito concreto identificado pela relação ordinária; não se usa VII automaticamente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    notes.push("Se o furto não é fato conhecido, exige testemunho de contato passado/posse; aspecto aplicativo não prova um furto já ocorrido.");
  }
  if(ctx.topic==="lawsuit"){
    addGenericQuesited=false; qHouse=undefined;
    pushUnique(houses,{role:"opponent",radicalHouse:7,rationale:"Parte adversária.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"judge",radicalHouse:10,rationale:"Juiz/tribunal/processo legal.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"verdict",radicalHouse:4,rationale:"Fim da matéria/veredicto em processos.",sourceIds:["F-HT"]});
    notes.push("Em processo, o veredicto (L4) funciona como prêmio: contato de L1 ou L7 com L4 costuma decidir mais do que força genérica das partes.");
  }
  if(ctx.topic==="competition"){
    addGenericQuesited=false; qHouse=undefined;
    if(ctx.competitionStructure==="incumbent_challenger"){
      pushUnique(houses,{role:"champion",radicalHouse:10,rationale:"Campeão/titular atual como rei/incumbente: X.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
      pushUnique(houses,{role:"challenger",radicalHouse:4,rationale:"Desafiante como inimigo do rei: IV, oposta à X.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
      notes.push("Estrutura assimétrica incumbente/desafiante: não reduzir a I/VII. Dignidade acidental é prioritária para o resultado do confronto.");
    } else if(ctx.competitionStructure==="tournament_victory"){
      pushUnique(houses,{role:"victory",radicalHouse:10,rationale:"Troféu/vitória/honra desejada: X.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
      notes.push("Time apoiado é extensão do querente (L1); para 'ganhar o torneio', procura-se sua ligação com L10, a vitória/troféu.");
    } else {
      pushUnique(houses,{role:"opponent",radicalHouse:7,rationale:"Adversário aberto em competição simétrica: VII.",sourceIds:["F-HT"]});
      notes.push(ctx.contestMode==="betting"?"O contexto declara interesse de aposta: o motor deve também materializar a rota financeira de bet.":"Competição simétrica é Us contra Them em I/VII; força acidental e combustão pesam fortemente.");
    }
    if(ctx.contestMode==="betting") { pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Dinheiro do apostador.",sourceIds:["F-HT"]}); pushUnique(houses,{role:"bookmaker_money",radicalHouse:8,rationale:"Dinheiro da casa de apostas.",sourceIds:["F-HT"]}); }
  }
  if(ctx.topic==="should_i"||ctx.topic==="career_choice"){
    addGenericQuesited=false; qHouse=undefined;
    if((ctx.alternatives??[]).some(x=>x.profitHouse)) pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Dinheiro próprio do querente, necessário para comparar retorno/risco de alternativas.",sourceIds:["F-HT"]});
    for(const alt of ctx.alternatives??[]){
      if(alt.house) pushUnique(houses,{role:`alternative:${alt.id}`,radicalHouse:alt.house,rationale:`Alternativa concreta: ${alt.label}.`,sourceIds:["F-HT"]});
      if(alt.profitHouse) pushUnique(houses,{role:`alternative:${alt.id}:profit`,radicalHouse:alt.profitHouse,rationale:`Lucro/retorno da alternativa ${alt.label}.`,sourceIds:["F-HT"]});
    }
    notes.push("Escolhas exigem opções concretas. O motor não deve inventar alternativas a partir da imaginação do intérprete.");
  }
  if(ctx.topic==="travel"||ctx.topic==="travel_profit"){
    const travelHouse=ctx.relevantHouse ?? 9;
    qHouse=travelHouse;
    pushUnique(houses,{role:"journey",radicalHouse:travelHouse,rationale:"Casa da viagem definida pelo propósito/contexto; viagens superiores/estrangeiro/peregrinação normalmente IX.",sourceIds:["F-HT"]});
    if(ctx.topic==="travel_profit") pushUnique(houses,{role:"journey_profit",radicalHouse:derivedHouse(travelHouse,2),derivedFrom:travelHouse,derivation:2,rationale:"Lucro da viagem: II a partir da casa da viagem.",sourceIds:["F-HT"]});
  }
  if(["study","exam","knowledge","course"].includes(ctx.topic)){
    const kHouse=ctx.relevantHouse ?? 9;
    qHouse=kHouse;
    pushUnique(houses,{role:"knowledge_or_school",radicalHouse:kHouse,rationale:"Conhecimento superior/escola/universidade = IX; conhecimento elementar pode ser III quando explicitamente contextualizado.",sourceIds:["F-HT"]});
    if(ctx.topic==="knowledge") pushUnique(houses,{role:"knowledge_profit",radicalHouse:derivedHouse(kHouse,2),derivedFrom:kHouse,derivation:2,rationale:"Lucro do conhecimento: II da casa do conhecimento.",sourceIds:["F-HT"]});
  }
  if(ctx.topic==="lottery"){
    addGenericQuesited=false; qHouse=undefined;
    pushUnique(houses,{role:"windfall",radicalHouse:11,rationale:"Loteria/ganho que cai do alto: XI, pennies from Heaven; não é aposta contra bookmaker.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"querent_money",radicalHouse:2,rationale:"Dinheiro/bolso do querente, destino material do prêmio.",sourceIds:["F-HT"]});
    notes.push("Loteria não é contest/bet salvo se houver estratégia contra uma contraparte; para jackpot, L11 precisa ser excepcionalmente forte.");
  }
  if(ctx.topic==="government_grant"){
    addGenericQuesited=false; qHouse=undefined;
    const recipient=subjectHouse;
    pushUnique(houses,{role:"grant_recipient",radicalHouse:recipient,rationale:"Pessoa que receberia o benefício/bolsa/financiamento.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"government",radicalHouse:10,rationale:"Governo/órgão concedente: X.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"government_gift",radicalHouse:11,derivedFrom:10,derivation:2,rationale:"Dinheiro/favor do governo: II da X = XI.",sourceIds:["F-HT"]});
    notes.push("Benefício devido pode dispensar recepção de L10; concessão discricionária torna a atitude do órgão relevante.");
  }
  if(ctx.topic==="election"){
    addGenericQuesited=false; qHouse=undefined;
    if(!naturalRoles.some(x=>x.role==="electorate")) naturalRoles.push({role:"electorate",planet:"moon",rationale:"Lua como significadora natural do eleitorado em horárias eleitorais.",sourceIds:["F-HT"]});
    // As casas dos candidatos dependem de quem pergunta e da estrutura política. Em vez de inventar
    // uma regra universal, o motor aceita semanticRoles/dynamicRoles; a Lua permanece electorate.
    notes.push("Eleições exigem casas dos candidatos resolvidas pelo ponto de vista do querente (incumbente, adversário, parente, estrangeiro etc.). Use semanticRoles/dynamicRoles; a Lua representa o eleitorado.");
    const electionRoles=new Set(houses.map(h=>h.role));
    if(!["candidate","incumbent","challenger","opponent"].some(r=>electionRoles.has(r))) unresolved.push("semanticRole:candidate/incumbent");
  }
  if(ctx.topic==="communication"){
    // Comunicação rotineira é III; mensagem recebida de uma contraparte pode ser III dela (= IX radical).
    qHouse=ctx.relevantHouse ?? 3;
    pushUnique(houses,{role:"communication",radicalHouse:qHouse,rationale:"Comunicação/informação no sentido definido pelo contexto; III radical por padrão, podendo ser derivada de outra pessoa.",sourceIds:["F-HT","M-HORARY-CURRENT"]});
    notes.push("Serviço de comunicação pode ser VI pelo prestador e/ou Mercúrio como regente natural; carta/mensagem permanece função comunicativa, não posse.");
  }
  if(ctx.topic==="service_change"){
    qHouse=serviceProviderHouse ?? 6;
    if(ctx.naturalServicePlanet&&!naturalRoles.some(x=>x.role==="service_natural")) naturalRoles.push({role:"service_natural",planet:ctx.naturalServicePlanet,rationale:"Significador natural explicitamente fornecido para o serviço/fenômeno.",sourceIds:["F-HT","M-HORARY-CURRENT"]});
    pushUnique(houses,{role:"service_provider",radicalHouse:qHouse,rationale:"Prestador/subordinado/contratado que executa o serviço: VI por padrão, salvo contexto relacional diferente.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
    notes.push("O serviço em si pode exigir significador natural (ex.: Mercúrio para comunicação; Lua para luz artificial) além do prestador. eventTrigger registra o fenômeno concreto que marca corte/retorno.");
  }
  if(ctx.topic==="delivery"){
    addGenericQuesited=false; qHouse=undefined;
    const seller=sourcePersonHouse??7;
    const packageHouse=derivedHouse(seller,2);
    pushUnique(houses,{role:"seller",radicalHouse:seller,rationale:"Pessoa/empresa que ainda detém o pacote antes da entrega.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"package",radicalHouse:packageHouse,derivedFrom:seller,derivation:2,rationale:"Pacote/objeto como posse do vendedor/remetente: II dele.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"querent_possessions",radicalHouse:2,rationale:"Posse do querente após a chegada.",sourceIds:["F-HT"]});
    notes.push("Entrega de objeto usa posse, não casa de correspondência: o pacote é II de quem o detém até chegar.");
  }
  if(ctx.topic==="authenticity"){
    addGenericQuesited=false; qHouse=undefined;
    const supplier=sourcePersonHouse??7; const productHouse=derivedHouse(supplier,2);
    pushUnique(houses,{role:"supplier",radicalHouse:supplier,rationale:"Fornecedor/vendedor como contraparte.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"product",radicalHouse:productHouse,derivedFrom:supplier,derivation:2,rationale:"Produto vendido como posse/mercadoria do fornecedor: II dele.",sourceIds:["F-HT"]});
    notes.push("Autenticidade/qualidade pergunta se o significador do produto é aquilo que deveria ser: dignidade essencial e aflições ao produto são centrais.");
  }
  if(ctx.topic==="kidnapping"){
    addGenericQuesited=false; qHouse=undefined;
    const personHouse=subjectHouse;
    pushUnique(houses,{role:"kidnapped_person",radicalHouse:personHouse,rationale:"Pessoa sequestrada identificada primeiro pela relação real com o querente.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"radical_captivity",radicalHouse:12,rationale:"XII radical: cativeiro/confinamento.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"turned_captivity",radicalHouse:derivedHouse(personHouse,12),derivedFrom:personHouse,derivation:12,rationale:"XII da pessoa sequestrada: seu cativeiro.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"radical_death",radicalHouse:8,rationale:"VIII radical como alternativa de morte a testar.",sourceIds:["F-HT"]});
    pushUnique(houses,{role:"turned_death",radicalHouse:derivedHouse(personHouse,8),derivedFrom:personHouse,derivation:8,rationale:"VIII da pessoa sequestrada.",sourceIds:["F-HT"]});
    notes.push("Sequestro é questão composta: primeiro sobrevivência (VIII radical/derivada), depois cativeiro/soltura e timing. O captor não é automaticamente L7; deve emergir da relação/poder/contexto.");
  }
  if(ctx.topic==="hidden_enemy"){
    qHouse=12; pushUnique(houses,{role:"hidden_enemy",radicalHouse:12,rationale:"Inimigos ocultos/ação escondida = XII.",sourceIds:["F-HT"]});
    notes.push("Recepção e contato são avaliados sem converter suspeita em acusação factual.");
  }
  if(ctx.topic==="weather"){
    qHouse=4; notes.push("Clima usa módulo próprio: IV/ângulos, Lua e qualidades do signo conforme a pergunta; não é um fallback para eventos comuns.");
  }
  if(ctx.topic==="public_event") notes.push("Evento público exige identificar primeiro o papel ontológico: governante, competição, eleição, acontecimento etc. A casa X não é fallback universal.");
  if(ctx.topic==="adoption"){
    qHouse=ctx.relevantHouse ?? 11;
    pushUnique(houses,{role:"adoptive_child",radicalHouse:qHouse,rationale:"Criança a adotar é normalmente XI: V da VII, isto é, filho de outra pessoa; se for criança de pessoa específica, deriva-se a V da casa dessa pessoa.",sourceIds:["F-HT"]});
    notes.push("Adoção não usa V automaticamente: V é o próprio filho; a criança ainda alheia é XI salvo relação específica informada.");
  }
  if(ctx.topic==="dream_meaning"){
    notes.push("IX enquadra o sonho enquanto experiência; personagens são remetidos às casas que teriam na vida ordinária.");
    for(const c of ctx.dreamCharacters??[]){
      if(c.radicalHouse) pushUnique(houses,{role:`dream_character:${c.id}`,radicalHouse:c.radicalHouse,rationale:`Personagem “${c.label}” mapeado pela relação ordinária informada.`,sourceIds:["M-HORARY-CURRENT","F-HT"]});
    }
  }
  if(ctx.topic==="surgery"&&!naturalRoles.some(x=>x.role==="surgery_natural")) naturalRoles.push({role:"surgery_natural",planet:"mars",rationale:"Marte como significador natural auxiliar da cirurgia.",sourceIds:["M-HORARY-CURRENT","F-HT"]});
  if(ctx.topic==="psychic_attack") notes.push("Uso apenas como gramática histórica da horária; não afirma causalidade sobrenatural nem acusa pessoa real.");

  if(addGenericQuesited && qHouse) pushUnique(houses,{role:"quesited",radicalHouse:qHouse,rationale:`Casa principal resolvida para o tópico ${ctx.topic}.`,sourceIds:["M-HORARY-CURRENT","F-HT"]});
  else if(addGenericQuesited && !qHouse && !(ctx.semanticRoles?.length||ctx.dynamicRoles?.length||ctx.naturalRoles?.length) && !unresolved.includes("relevantHouse")) unresolved.push("relevantHouse");

  // Camada semântica de alto nível: a IA/UI identifica "quem é quem" e "o que de quem";
  // o núcleo somente compila essas relações em casas. Isso permite combinações abertas sem
  // transformar o motor num classificador textual que adivinha intenções humanas.
  const semanticFrame=compileHorarySemanticFrame(ctx,houses);
  for(const h of semanticFrame.houseAssignments) pushUnique(houses,h);
  for(const u of semanticFrame.unresolved) if(!unresolved.includes(u)) unresolved.push(u);
  notes.push(...semanticFrame.warnings);
  if(ctx.semanticRoles?.length) notes.push(`Frame semântico: ${semanticFrame.compiledRoles.length} papel(is) compilado(s) a partir de ${ctx.semanticRoles.length} especificação(ões); o texto livre não foi usado como classificador oculto.`);

  const primaryRoles=["querent","quesited"];
  if(["prison","release"].includes(ctx.topic)) primaryRoles.splice(0,2,"prison_subject","quesited");
  if(["health","illness","doctor","treatment","surgery"].includes(ctx.topic)) primaryRoles.splice(0,2,"patient","illness");
  if(ctx.topic==="pregnancy") primaryRoles.splice(0,2,"mother","child");
  if(ctx.topic==="death") primaryRoles.splice(0,2,"death_subject","turned_death");
  if(ctx.topic==="inheritance") primaryRoles.splice(0,2,"querent","legacy_money");
  if(ctx.topic==="missing_person") primaryRoles.splice(0,2,"missing_person");
  if(ctx.topic==="lawsuit") primaryRoles.splice(0,2,"querent","verdict");
  if(ctx.topic==="competition"){
    if(ctx.competitionStructure==="incumbent_challenger") primaryRoles.splice(0,2,"champion","challenger");
    else if(ctx.competitionStructure==="tournament_victory") primaryRoles.splice(0,2,"querent","victory");
    else primaryRoles.splice(0,2,"querent","opponent");
  }
  if(ctx.topic==="should_i"||ctx.topic==="career_choice") primaryRoles.splice(0,2,...((ctx.alternatives??[]).slice(0,2).map(x=>`alternative:${x.id}`)));
  if(ctx.topic==="lottery") primaryRoles.splice(0,2,"querent","windfall");
  if(ctx.topic==="government_grant") primaryRoles.splice(0,2,"grant_recipient","government_gift");
  if(ctx.topic==="delivery") primaryRoles.splice(0,2,"querent","package");
  if(ctx.topic==="authenticity") primaryRoles.splice(0,2,"product");
  if(ctx.topic==="kidnapping") primaryRoles.splice(0,2,"kidnapped_person","turned_death");
  if(ctx.primaryRoleIds?.length) primaryRoles.splice(0,primaryRoles.length,...ctx.primaryRoleIds);
  else { const dynPrimary=[...(ctx.semanticRoles??[]).filter(x=>x.primary).map(x=>x.role),...(ctx.dynamicRoles??[]).filter(x=>x.primary).map(x=>x.role),...naturalRoles.filter(x=>x.primary).map(x=>x.role)]; if(dynPrimary.length) primaryRoles.splice(0,primaryRoles.length,...dynPrimary); }
  return {topic:ctx.topic,requiredContext:required,unresolvedContext:[...new Set(unresolved)],houses,naturalRoles,primaryRoles,notes,semanticFrame};
}
