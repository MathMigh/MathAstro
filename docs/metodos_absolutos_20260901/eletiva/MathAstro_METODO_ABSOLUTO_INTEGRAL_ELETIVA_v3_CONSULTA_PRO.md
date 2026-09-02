# MÉTODO ABSOLUTO E INTEGRAL DE ASTROLOGIA ELETIVA — MATHASTRO

**MathAstro — Marcos Monteiro + John Frawley + Luiz Gonzaga de Carvalho Neto**  
**Versão canônica:** 3.0 — 2026-09-01 · CONSULTA PROFISSIONAL  
**Domínio:** `western/electional`  
**Arquitetura:** motor determinístico + planejador semântico + broker de cálculos + juiz IA contextual  

**Camada v3:** consulta profissional integral + gramática de interpretação + comparação de finalistas + protocolo anti-erro + contrato humano/IA.  

---

## 0. Declaração de finalidade

Este documento é a especificação metodológica integral do módulo de **Astrologia Eletiva tradicional ocidental** do MathAstro. Ele não é apenas uma lista de regras e não pretende enumerar previamente todas as situações humanas possíveis. Sua finalidade é construir uma **gramática completa de julgamento** capaz de lidar com casos conhecidos e inéditos sem inventar técnica.

O método é “absoluto” num sentido operacional preciso:

1. tudo que é matematicamente ou astronomicamente determinável fica no motor;
2. tudo que é formalmente derivável, mas não veio calculado, pode ser solicitado ao broker;
3. tudo que depende de contexto, analogia simbólica, escolha de função, pertinência ou síntese fica explicitamente para o astrólogo/IA;
4. quando faltar contexto, pergunta-se ao usuário;
5. quando faltar fonte, recupera-se o corpus pertinente;
6. quando não houver fundamento suficiente, declara-se **indeterminado**;
7. nenhuma lacuna fica silenciosa e nenhuma subjetividade é mascarada como cálculo.

Portanto, a cobertura total do domínio não vem de uma tabela infinita de casos; vem da combinação de **princípios fechados + cálculo fechado + jurisdição contextual explícita**.

---

## 1. Escopo e isolamento

O domínio é exclusivamente:

`src/traditions/western/electional/`

O módulo pode **receber** mapas natais, mapas de eclipse, ingresso, contexto mundano ou institucional como evidência necessária ao julgamento eletivo, mas não importa nem executa os interpretadores de Natal, Sinastria ou Horária.

Ele não deve chamar, para produzir seu veredito eletivo:

- análises natais interpretativas;
- sinastria;
- veredito horário de outro módulo;
- astrologia mundana interpretativa pronta.

O dado externo entra como **mapa/contexto**, e a interpretação pertinente é realizada dentro da jurisdição eletiva.

A via “eleição guiada por horária” é um submétodo próprio do domínio eletivo que **preserva o mapa horário original**; não transforma o módulo em uma dependência do interpretador horário.

---

## 2. Hierarquia documental e proveniência

### 2.1. Eixo principal

A tradição canônica do projeto é formada prioritariamente por:

1. **Marcos Monteiro — material atual**;
2. **Marcos Monteiro — material publicado/anterior**;
3. **John Frawley — material atual**;
4. **John Frawley — técnica publicada**, sobretudo *The Real Astrology Applied* e *The Horary Textbook*;
5. **Luiz Gonzaga de Carvalho Neto (Gugu)**, somente onde o corpus permite atribuição efetiva;
6. **MathAstro operacional**, apenas para converter princípios em contratos, estruturas de dados, classificações e rotinas computacionais.

### 2.2. Regra de honestidade de fonte

Nenhuma reconstrução operacional MathAstro deve ser apresentada como se tivesse sido literalmente formulada por Marcos, Frawley ou Gugu.

Toda regra importante deve, quando possível, portar:

- `sourceId`;
- autor;
- obra/aula/transcrição;
- camada (`primary-current`, `primary-published`, `secondary`, `operational`);
- tipo de uso: direto, aplicação contextual ou analogia.

### 2.3. Divergência histórica não é apagada

O método distingue claramente:

- **Frawley publicado:** técnica eletiva completa, detalhada e utilizável;
- **Frawley atual:** posição muito mais cética quanto ao valor prático da eletiva;
- **Marcos publicado:** uso técnico da eletiva;
- **Marcos atual:** preferência crescente por eleição através de horária e crítica à visão mecânica do “minuto mágico”.

Essas posições não são artificialmente harmonizadas. O sistema mantém regimes diferentes.

---

## 3. Os três regimes operacionais

### 3.1. `classical-full-election`

Executa a técnica eletiva completa reconstruída a partir do material publicado e dos princípios tradicionais efetivamente sustentados pelo corpus.

É o regime apropriado quando se deseja uma eleição plena com:

- objetivo exato;
- contexto real;
- natividade(s) pertinente(s), quando a coisa depende de uma pessoa;
- mapa do instante eleito;
- dinâmica;
- comparação natal-eleição;
- modificadores.

### 3.2. `current-marcos-frawley-aware`

Calcula a arquitetura eletiva, mas interpreta o resultado sob as reservas atuais de Marcos/Frawley:

- não existe minuto mágico;
- a qualidade do tempo é contínua;
- o céu eleito não torna bom o que é ruim na realidade;
- a eleição deve ser organicamente conectada ao caso;
- quando a pergunta é adequada, a via horária pode ser epistemologicamente preferível.

### 3.3. `horary-guided`

Usa **o mapa horário original** para escolher quando agir.

Não se ergue um novo mapa eletivo para o instante futuro sem natividade. O método observa o significador pertinente no próprio mapa horário e sua evolução:

- entrada em dignidade;
- conjunção pertinente;
- mudança de signo;
- contato com cúspide ou ponto relevante;
- melhora real da condição.

A saída típica é:

- agora / assim que possível;
- depois de determinada mudança;
- determinado dia/período;
- sem vantagem clara.

Não se promete precisão de minuto quando a técnica só sustenta dia ou faixa.

---

## 4. Princípio-mãe: a arte do possível

A eleição **não fabrica possibilidades**.

Ela escolhe, dentro de um intervalo real, um céu que permita explorar melhor aquilo que já é possível dadas:

- a natureza do ato;
- a realidade concreta;
- as natividades pertinentes;
- os recursos disponíveis;
- o prazo;
- as limitações institucionais, jurídicas, comerciais, humanas ou físicas.

Assim:

- um negócio objetivamente inviável não vira viável porque abre às 14h32;
- um casamento fundamentalmente incompatível não é curado por uma eleição bonita;
- um mapa natal que não comporta determinada possibilidade não é reescrito pela Eletiva;
- uma cidade, instituição ou ato coletivo pode não possuir uma “natividade pessoal anterior” e não se deve inventá-la.

O objetivo é o **melhor disponível**, não o perfeito.

---

## 5. A arquitetura integral do método

O fluxo canônico é:

**situação humana → planejamento semântico → validação → cálculo → julgamento determinístico → trajetória → bundle IA → adjudicação contextual → cálculos adicionais, se necessários → síntese final**.

Em termos de contratos:

1. `mathastro.electional.semantic-planning.v1`
2. `mathastro.electional.semantic-plan.v1`
3. `ElectionalRequest` / `ElectionalScanRequest`
4. `ElectionalEvaluation`
5. `ElectionalTrajectoryCertification`
6. `mathastro.electional.ai-report.v5`
7. `mathastro.electional.absolute-ai-bundle.v1`
8. `mathastro.electional.adjudication.v1`
9. `mathastro.electional.calculation-broker.v1`
10. `mathastro.electional.ai-adjudication-response.v1`

---

# PARTE I — DEFINIÇÃO DO CASO

## 6. A pergunta eletiva correta

Antes de calcular qualquer céu, deve-se saber:

1. **o que vai começar?**
2. **qual ato realmente faz isso começar?**
3. **quem está organicamente envolvido?**
4. **qual é o resultado prioritário?**
5. **qual é a janela de tempo realmente disponível?**
6. **o local é fixo ou pode variar?**
7. **há restrições não astrológicas?**
8. **a coisa é pessoal, relacional, empresarial, institucional ou coletiva?**
9. **uma natividade pessoal é metodologicamente necessária?**
10. **seria melhor tratar o problema por horária guiada?**

“Quero abrir uma empresa” não é uma formulação final. Deve-se perguntar: quer lucro rápido, longevidade, visibilidade, estabilidade, cultura, autoridade, comunicação, união de sócios, venda rápida, proteção patrimonial ou outra coisa?

---

## 7. Gate de realidade

A primeira pergunta não é astrológica:

**o empreendimento é materialmente possível?**

A entrada pode conter `viableInReality` e restrições de mundo real.

O sistema deve distinguir:

- viável;
- inviável;
- desconhecido por falta de informação.

Se a realidade contradiz o objetivo, isso não é corrigido pela escolha do céu.

Quando a informação material não existe, o sistema devolve `NEEDS_USER_CONTEXT` — não inventa viabilidade.

---

## 8. O ato inaugural

A coisa eleita nasce quando ocorre o ato que realmente a inaugura.

Exemplos possíveis:

- empresa: registro jurídico, abertura ao público, primeira venda, assinatura do contrato — depende do que efetivamente se quer eleger;
- livro: envio ao editor, publicação, lançamento público, início das vendas;
- website: publicação técnica, anúncio ao público, primeira operação;
- casamento: rito/ato juridicamente ou sacramentalmente constitutivo, conforme o contexto real;
- construção: início efetivo da obra, lançamento da pedra fundamental etc.;
- cidade/instituição: ato de fundação efetivo.

Quando mais de um instante é defensável e a escolha muda o mapa, o caso é `AI_CONTEXTUAL_JUDGEMENT` ou `NEEDS_USER_CONTEXT`.

---

## 9. Resultado exato e intenções

O sistema possui intenções tipadas, hoje incluindo:

- `profit`;
- `longevity`;
- `speed`;
- `public-impact`;
- `union`;
- `religion`;
- `culture`;
- `communication`;
- `material-stability`;
- `closure`;
- `security`;
- `authority`.

Quando o caso não cabe nisso, usa-se `customPriorities`, sempre com justificativa e proveniência.

O objetivo final pode alterar:

- casas prioritárias;
- significadores naturais;
- modalidade desejável;
- elemento desejável;
- maleficência funcional;
- duração pretendida;
- importância relativa das condições.

---

# PARTE II — GRAMÁTICA DAS CASAS E SIGNIFICADORES

## 10. Casas são assuntos; planetas são agentes; signos são qualidades

A gramática estrutural deve ser mantida.

A casa não é um “campo energético”. Ela identifica o **assunto/função** relevante. O planeta que rege o signo da cúspide é o significador operacional principal daquele assunto.

A presença de planetas numa casa é secundária à regência quando se busca o agente significador.

---

## 11. Coisa versus função da coisa

A mesma coisa concreta pode pertencer a casas diferentes conforme a função investigada.

Exemplo conceitual:

- um objeto material pode ser II enquanto posse;
- o conhecimento contido nele pode ser IX;
- sua publicação pode ser IX;
- sua criação pode implicar V;
- sua projeção pública pode envolver X.

A pergunta é sempre: **o que esta coisa é nesta história e qual função está sendo eleita?**

---

## 12. Casa I

Na Eletiva, a Casa I tem uma importância excepcional:

- significa o iniciador;
- significa o próprio empreendimento enquanto coisa nascendo;
- pode significar “nós”, quando a unidade do grupo é o sujeito real.

Portanto, L1 nunca deve ser tratado como formalidade.

---

## 13. Derivação de casas

A derivação é usada quando realmente necessária.

Regra:

1. se a coisa já possui uma casa radical adequada, use-a;
2. não derive apenas para criar um segundo significador;
3. derive quando o relacionamento funcional exige isso;
4. se houver ambiguidade real, preserve duas hipóteses e teste ambas.

O broker suporta `turned-house` para efetuar a derivação formal.

---

## 14. Colisão de significadores

Quando duas funções centrais são regidas pelo mesmo planeta, o sistema detecta `roleCollisions`.

Possíveis soluções, somente quando contextualmente justificadas:

- usar a Lua para representar a pessoa;
- manter o regente compartilhado para uma função e usar o regente do segundo signo interno da outra casa;
- redefinir a atribuição funcional se a pergunta mostrar que uma das funções estava mal especificada.

O motor calcula alternativas; a IA/astrólogo decide qual representa organicamente a situação.

---

## 15. Perfis canônicos de objetivo

### 15.1. Negócio / empresa

Casa principal: X.  
Casas auxiliares: II e I, conforme objetivo.  
Natal: X, II e I pertinentes.  
Planetas naturais possíveis: Sol, Mercúrio, Júpiter.  

Objetivos podem deslocar ênfase para lucro, comunicação, reputação, estabilidade etc.

### 15.2. Restaurante

Casas centrais: I, V e X; II quando lucro/recursos forem parte explícita.  
Natal pessoal do proprietário/atores principais é relevante numa eleição plena.

### 15.3. Parceria

I e VII são centrais; X/II podem entrar conforme a finalidade econômica.  
A força de L7 não deve simplesmente sobrepujar L1 sem considerar a estrutura da parceria.

### 15.4. Casamento

I e VII, com Vênus e Lua como significadores naturais contextuais.  
Questão de longa duração: fixidez pode ser desejável.  
A eleição não corrige incompatibilidade fundamental.

### 15.5. Publicação / lançamento de obra

IX para publicação/difusão; V para obra/criação; X para projeção pública, conforme o objetivo.  
Mercúrio/Júpiter são candidatos naturais.

### 15.6. Website / comunicação

III e X podem ser relevantes conforme a função; II se monetização for objetivo.  
Mercúrio tende a ser natural; Ar pode ser funcional.

### 15.7. Casa / imóvel / construção

IV é central, com I/II auxiliares conforme o caso.  
Matéria longa: fixidez e Terra podem ser adequadas.  
Saturno/Lua podem ser naturais conforme a função.

### 15.8. Festa / celebração

V é central; Vênus e Júpiter naturais.  
O mapa deve servir a uma festa, não a uma cirurgia ou fortificação.

### 15.9. Fundação de cidade/instituição duradoura

I é estrutural; IX, X, VII, XII ou outras casas podem entrar conforme os objetivos institucionais.  
Não exige natividade pessoal inexistente.  
Saturno pode ser extremamente funcional à duração/estrutura.

### 15.10. Coroação / início de governo

X, I, VII e IX podem ser pertinentes.  
O Sol é natural para realeza/autoridade.  
Natividade da pessoa soberana pode ser indispensável.  
Mapas de eclipse, ingresso ou contexto mundano podem ser relevantes.

### 15.11. Caso inédito

Usa-se `ElectionalCustomGoalProfile`.

Ele deve declarar:

- casa principal;
- casas auxiliares;
- casas natais pertinentes;
- necessidade ou não de natal;
- significadores naturais;
- modalidade/elementos possíveis;
- racional;
- fontes;
- tipo de inferência.

---

# PARTE III — NATIVIDADE E CONTEXTO

## 16. Quando a natividade é necessária

Em eleição pessoal plena, a natividade não é um acessório.

Devem ser identificados:

- regente do Ascendente natal;
- ambos os luminares;
- regentes das casas natais diretamente relacionadas ao objetivo;
- eventuais planetas cuja função natal os torna prioritários mesmo se forem maléficos.

O motor não deve “esconder Saturno” numa casa fraca se Saturno rege justamente a carreira natal numa eleição de negócio.

---

## 17. Casos sem natividade pessoal

Uma fundação institucional, cidade ou entidade sem pessoa orgânica anterior pode ser julgada sem inventar uma natividade.

O perfil determina `requiresNatalForFull`.

---

## 18. Mapas de contexto

O sistema aceita, quando pertinente:

- eclipse;
- ingresso;
- mapa mundano;
- mapa institucional;
- outro mapa de contexto.

Eles não substituem o mapa eletivo; entram como contexto superior.

A pertinência é contextual e deve ser explicitada.

---

# PARTE IV — CÁLCULO DO MAPA E CONDIÇÃO PLANETÁRIA

## 19. Casas e regra pré-cúspide

Em Regiomontanus/Placidus, um planeta imediatamente antes de uma cúspide pode ser considerado na casa seguinte se:

1. estiver suficientemente próximo;
2. estiver no **mesmo signo da cúspide**.

O limite operacional clássico é aproximadamente 5°, flexível; material recente de Marcos manifesta preferência mais estreita em muitos usos, próxima de 3°. O motor deve guardar casa geométrica e casa efetiva, além da distância e da mudança aplicada.

A regra vale para casas, não para signos.

---

## 20. Dignidade essencial

O motor separa:

- domicílio;
- exaltação;
- triplicidade do secto;
- termo;
- face;
- detrimento;
- queda;
- peregrinação.

A saída não é uma pontuação universal. Ela produz uma avaliação de **qualidade essencial**.

---

## 21. Capacidade acidental

O motor avalia:

- angularidade;
- sucedência;
- cadência;
- júbilo quando pertinente;
- rapidez/lentidão;
- retrogradação;
- combustão;
- cazimi;
- sob os raios.

A saída produz uma avaliação separada de **capacidade acidental**.

---

## 22. Três perguntas diferentes sobre um planeta

Todo significador deve ser lido em três eixos:

1. **qualidade essencial** — que tipo de condição/natureza ele possui;
2. **capacidade acidental** — quanto poder tem para agir;
3. **adequação funcional** — se essa capacidade serve ao objetivo concreto.

Um planeta pode ser essencialmente debilitado e, ainda assim, extremamente capaz por angularidade. Pode ser forte e agir contra o objetivo. Pode ser maléfico e ser exatamente o instrumento necessário.

---

## 23. Luminares

Na eleição pessoal clássica, ambos os luminares merecem atenção especial.

Se ambos estiverem seriamente enfraquecidos, o mapa pode carecer de capacidade de realização.

Isso não significa que todo mapa precise colocar Sol e Lua em dignidade perfeita; a avaliação é feita dentro do possível.

---

## 24. Maléficos funcionais

Marte e Saturno não são automaticamente ruins.

Perguntar:

- regem algo necessário?
- sua natureza serve à função?
- estão causando dano ao significador central?
- podem conter/estruturar/romper/defender conforme a necessidade?

Uma eleição de fundação duradoura pode precisar de Saturno; uma ação cirúrgica ou combativa pode precisar de Marte.

A regra correta é **funcionalidade**, não “benéficos bons / maléficos ruins”.

---

# PARTE V — ASPECTOS, RECEPÇÕES E EVENTO

## 25. Influência não é evento

O método distingue dois usos do aspecto:

### 25.1. Influência atual

Proximidade importa. Alguns graus de separação podem tornar a influência relevante ou irrelevante.

### 25.2. Evento / perfeição

O ponto decisivo é se o aspecto **chega à exatidão** antes de algo impedir.

Um aspecto futuro pode valer para evento mesmo que ainda esteja distante demais para ser uma influência presente forte.

---

## 26. Aplicação e separação

O motor deve dizer:

- aspecto existente;
- quem aplica;
- quem se separa;
- distância;
- se a perfeição é possível;
- qual evento ocorre antes.

Separação e aplicação não são comentários decorativos; podem mudar totalmente o julgamento.

---

## 27. Recepção

Recepção é calculada separadamente do aspecto.

Ela pode descrever:

- disposição;
- preferência;
- aceitação;
- aversão;
- dependência;
- assimetria.

Recepção **não cria contato**. Um planeta pode gostar do outro e jamais alcançá-lo. Da mesma forma, um aspecto pode ocorrer sem boa recepção.

---

## 28. Perfeição direta

A perfeição direta existe quando os significadores relevantes chegam a aspecto exato sem impedimento invalidante.

O motor certifica a trajetória, idealmente via Swiss Ephemeris, em vez de inferir tudo apenas pela velocidade instantânea.

---

## 29. Perfeição após ingresso

Um aspecto pode perfeccionar imediatamente depois de um planeta mudar de signo.

Regra:

1. antes do ingresso, não existe o aspecto atual;
2. o motor continua a trajetória;
3. se a perfeição ocorrer poucos graus dentro do signo seguinte — operacionalmente até cerca de 3–4° — registra-se `perfects-after-ingress-context-required`;
4. recalculam-se as novas dignidades e recepções;
5. a IA/astrólogo decide se a mudança de signo corresponde a uma mudança real de circunstância que torna o evento coerente.

Se a mudança não fizer sentido, pode ser frustração. Se fizer, pode significar “sim, mas apenas depois de X mudar”.

---

## 30. Tradução de luz

O motor detecta a figura formal:

- um terceiro planeta, normalmente mais rápido, separa-se de um significador e aplica ao outro, carregando a ligação.

A IA/astrólogo identifica:

- quem/que coisa o tradutor representa;
- se a mediação existe no mundo real;
- se a tradução é pertinente ao evento.

---

## 31. Coleção de luz

O motor detecta quando dois significadores aplicam a um terceiro capaz de reunir a ação.

A IA/astrólogo identifica o papel real do coletor e se ele possui função coerente de reunir as partes.

---

## 32. Proibição e prevenção

Uma terceira relação pode ocorrer antes da perfeição principal.

Mas **prevenção não significa automaticamente impedimento**.

Devem ser julgados:

- força relativa;
- recepções;
- natureza do planeta preveniente;
- o que ele representa;
- contexto real;
- duração da questão;
- possibilidade de contornar o obstáculo.

A conclusão pode ser:

- impede;
- atrasa;
- modifica;
- apenas descreve evento intermediário;
- não é possível decidir sem contexto.

Esse é um domínio típico de `AI_CONTEXTUAL_JUDGEMENT`.

---

## 33. Frustração

Há frustração quando a conexão que parecia caminhar à perfeição deixa de fazê-lo por mudança relevante na dinâmica — por exemplo, ingresso que quebra a possibilidade ou circunstância necessária.

Não se declara por simples distância; deve-se olhar a trajetória real.

---

## 34. Refranação

Há refranação quando a mudança de movimento/estação impede a perfeição que estava sendo formada.

O motor deve procurar a estação antes do contato exato.

---

## 35. Mudanças de signo e estações

Toda mudança significativa deve ser tratada como evento potencial, não como mera alteração de uma tabela de dignidades.

A pergunta contextual é:

**o que mudou no mundo correspondente à mudança do significador?**

---

# PARTE VI — LUA

## 36. A Lua como sequência

A Lua não é reduzida a “boa/ruim”. O motor deve fornecer:

- estado atual;
- aplicações futuras;
- ordem cronológica;
- próximo contato relevante;
- contatos antes de deixar o signo;
- ingresso;
- eventual ausência de aplicação.

A IA interpreta a sequência como processo da história.

Uma Lua sem aplicação não é automaticamente veto universal.

---

# PARTE VII — MODIFICADORES

## 37. Horas planetárias desiguais

O cálculo tradicional usa:

1. nascer do Sol;
2. pôr do Sol;
3. divide o período diurno em 12 partes;
4. divide o período noturno em 12 partes;
5. aplica a ordem caldaica;
6. o primeiro regente diurno depende do dia da semana.

A hora planetária é um testemunho. A qualidade do regente da hora no próprio céu importa.

Eleições simples podem usar hora planetária ou Lua, mas isso não equivale à eleição completa.

---

## 38. Nodos

Política principal:

- Nodo Norte e Nodo Sul modificam por **conjunção**;
- posição isolada do Nodo em signo não recebe significado autônomo;
- Nodo Norte pode ampliar/fortalecer aquilo que toca;
- Nodo Sul pode diminuir/restringir/enfraquecer aquilo que toca;
- a pertinência depende do significador e da pergunta.

Usar posição verdadeira quando o sistema fornece isso.

---

## 39. Partes Árabes

Partes são **pontos passivos**.

Princípios:

- não agem como planetas;
- recebem aspectos;
- para eventos, conjunção e oposição têm prioridade;
- outros aspectos exigem forte testemunho congruente;
- só se usa uma Parte se ela realmente pertence ao assunto;
- o contato a uma Parte pode marcar evento/tempo sem transformar a Parte em agente.

A IA decide pertinência; o motor calcula posição e relações.

---

## 40. Antíscios e contra-antíscios

O motor pode calculá-los.

A IA decide se o contato é realmente informativo no caso.

Não se deve multiplicar antíscios apenas para fabricar mais testemunhos.

No uso horário de estrelas, antíscios sobre estrelas fixas são ignorados; qualquer extensão eletiva deve ser explicitamente fundamentada e não presumida.

---

## 41. Estrelas fixas

O motor calcula:

- estrela;
- longitude corrigida para a época;
- conjunção;
- orbe;
- planeta/cúspide tocado.

A IA/astrólogo julga pertinência simbólica.

### 41.1. Regime Marcos-prioritário

Estrelas são modificadores contextuais e subordinados. Não salvam estrutura fundamentalmente ruim.

### 41.2. Regime clássico Frawley

Estrelas adequadas em posições proeminentes podem ter grande importância, especialmente em matérias de longa duração.

### 41.3. Regras de uso

- conjunção é o contato principal;
- evitar transformar catálogo de estrelas em ruído;
- a estrela só importa se o simbolismo for pertinente à função do planeta/cúspide;
- uma estrela pode ser forte sem ser “boa” em sentido genérico.

---

# PARTE VIII — COMPATIBILIDADE ELEIÇÃO ↔ NATAL/CONTEXTO

## 42. Regentes natais relevantes

Para cada natividade pertinente:

1. identificar casa natal relevante;
2. identificar seu regente;
3. examinar esse planeta no mapa eleito;
4. verificar contatos eleição↔natal;
5. classificar como supportive / mixed / difficult / neutral;
6. não confundir isso com sinastria geral.

---

## 43. Luminares e Ascendente natal

No regime clássico pessoal, o regente do Ascendente natal e ambos os luminares entram como prioridades estruturais.

Eles não substituem os regentes das casas temáticas; formam a base de capacidade da pessoa.

---

## 44. Contexto mundano/institucional

Em coroações, fundações ou atos coletivos, mapas de contexto podem ser anexados.

A eleição não absorve automaticamente todo o método mundano; apenas registra e interpreta contatos explicitamente relevantes ao ato.

---

# PARTE IX — QUALIDADE DO ATO

## 45. Modalidade

A modalidade deve servir ao objetivo:

- **fixa:** estabilidade, duração, permanência;
- **cardinal:** início rápido, ação, operação breve, liquidação rápida;
- **mutável:** adaptação, transição, tarefas que exigem mudança, quando contextualmente pertinente.

Não existe “fixo é sempre melhor”.

---

## 46. Elemento

O elemento deve servir à natureza do empreendimento.

Exemplos tradicionais/operacionais:

- Terra: materialidade, agricultura, construção, estabilidade;
- Ar: comunicação, mídia, circulação de informação;
- Fogo: ação, projeção, calor, iniciativa, quando pertinente;
- Água: união, fluidez, cuidado, líquidos, contexto específico.

A correspondência não substitui os regentes reais.

---

# PARTE X — CONVERGÊNCIA, CONFLITO E RANKING

## 47. Convergência de testemunhos

O sistema não conta arquivos repetidos como evidências independentes.

Princípio de convergência incorporado do material de Gugu:

- uma indicação isolada: sugestiva, não certeza;
- duas famílias independentes: forte, mas ainda não necessariamente conclusivo;
- três ou mais famílias independentes concordantes: convergência muito robusta;
- tudo continua subordinado à pertinência e à resposta-padrão da situação.

Convergência não é “placar”. É robustez entre **famílias independentes**.

---

## 48. Sem score totalizador

É proibido reduzir o mapa a algo como “84/100”.

A ordenação é lexicográfica:

1. vetos;
2. riscos críticos;
3. riscos maiores;
4. riscos menores;
5. testemunhos de suporte;
6. prioridades específicas do objetivo;
7. desempates contextuais.

Um grave impedimento não é cancelado por seis vantagens pequenas.

---

## 49. `MELHOR_DISPONIVEL`

É uma etiqueta **relativa de scanner**, não uma qualidade intrínseca do mapa.

O candidato pode ser intrinsecamente `ACEITAVEL` e ainda ser o melhor disponível dentro da janela.

O relatório deve mostrar ambas as coisas.

---

# PARTE XI — O SCANNER TEMPORAL

## 50. Restrições práticas primeiro

Antes de astrologia, eliminar:

- datas impossíveis;
- horários fora do expediente;
- dias proibidos;
- intervalos bloqueados;
- limites logísticos.

Só depois calcular.

---

## 51. Duas passagens

### Passagem 1 — triagem leve

Calcula efeméride essencial para grande malha temporal.

### Passagem 2 — finalistas

Para os melhores candidatos:

- mapa completo;
- estrelas;
- dinâmica profunda;
- trajetória Swiss;
- certificação de estações/ingressos/perfeições;
- relatório IA.

---

## 52. Janelas contínuas, não minuto mágico

O scanner agrupa candidatos em faixas.

Cada janela deve informar:

- início;
- fim;
- pico comparativo;
- qualidade intrínseca;
- quantidade de candidatos;
- causa da borda inicial;
- causa da borda final.

A janela deve ser interpretada como gradiente humano, não como câmara mágica.

---

# PARTE XII — MÉTODO CLÁSSICO COMPLETO: ORDEM DE JULGAMENTO

## 53. Algoritmo clássico canônico

A ordem obrigatória é:

### 53.1. Realidade

A coisa é viável e o horário pode fazer diferença?

### 53.2. Ato inaugural

O que exatamente nasce?

### 53.3. Objetivo exato

O que se quer maximizar e o que é secundário?

### 53.4. Casas e funções

Que casa significa cada ator/coisa/função?

### 53.5. Natividade(s)

Quais regentes natais precisam ser protegidos/fortalecidos?

### 53.6. Significadores centrais

L1, regente do assunto, casas auxiliares e significadores naturais pertinentes.

### 53.7. Essência e capacidade

Julgar separadamente dignidade essencial e condição acidental.

### 53.8. Recepção

Quem recebe quem e como?

### 53.9. Ação/perfeição

Existe contato efetivo? Quem aplica? O que ocorre antes?

### 53.10. Dinâmica

Proibição, prevenção, frustração, refranação, tradução, coleção, estações, ingressos.

### 53.11. Lua

Qual a sequência do processo?

### 53.12. Natividade/contexto

Como o céu eleito se relaciona com os mapas pertinentes?

### 53.13. Qualidade do ato

Modalidade, elemento, duração, função dos maléficos.

### 53.14. Modificadores

Hora planetária, Nodos, Partes, antíscios, estrelas.

### 53.15. Convergência

Quantas famílias independentes sustentam a mesma conclusão?

### 53.16. Janela

Onde a qualidade começa a melhorar e onde se deteriora?

### 53.17. Veredito

O que este horário ajuda? O que não resolve? É bom em termos absolutos ou apenas o melhor disponível?

---

# PARTE XIII — MÉTODO MARCOS ATUAL

## 54. Princípios de prudência

No modo atual:

- eleição funciona como escolha de qualidade temporal, não criação mágica;
- o céu deve ser analisado em continuidade;
- uma fronteira de minutos precisa corresponder a mudança astronômica real;
- é essencial saber se o empreendimento é bom ou ruim por razões independentes da Eletiva;
- a técnica clássica pode induzir falsa confiança se tratada isoladamente.

---

## 55. Preferência pela horária quando orgânica

Quando a pergunta pode ser formulada de modo sincero e concreto — por exemplo, “é melhor abrir antes ou depois de X?” — a horária pode fornecer um significador organicamente ligado ao empreendimento.

Ela pode inclusive mostrar:

- que o horário não fará diferença relevante;
- que a coisa será boa de qualquer modo;
- que será ruim de qualquer modo;
- que melhora depois de uma mudança real.

Nesses casos, o sistema deve ao menos sugerir a via horária.

---

# PARTE XIV — ELEIÇÃO GUIADA POR HORÁRIA

## 56. Passo a passo

1. preservar o mapa horário original;
2. identificar o significador do assunto;
3. observar o que esse planeta fará no futuro próximo;
4. identificar uma mudança claramente melhor;
5. converter a distância em unidade de tempo coerente com pergunta, signo, casa e janela real;
6. evitar precisão falsa;
7. não adicionar aspectos de um novo mapa futuro como se fosse eleição completa;
8. apresentar data/faixa ou “depois de” quando isso for o máximo sustentado.

---

# PARTE XV — O ASTRÓLOGO/IA: JURISDIÇÃO EXPLÍCITA

## 57. Quatro classes epistemológicas

### A. `ENGINE_FACT`

Fato vinculante calculado. A IA não altera.

Exemplos:

- longitude;
- velocidade;
- casa/cúspide;
- dignidade calculada;
- aspecto geométrico;
- aplicação/separação;
- hora planetária;
- estação;
- ingresso;
- perfeição Swiss;
- conjunção a estrela/nodo;
- Parte calculada.

### B. `ENGINE_DERIVABLE`

O motor sabe calcular, mas o fato ainda não veio. A IA pede ao broker.

### C. `AI_CONTEXTUAL_JUDGEMENT`

Exige interpretação real do caso.

### D. `UNSUPPORTED`

Sem fundamento suficiente: `INDETERMINATE`.

---

## 58. Os 18 domínios deliberadamente subjetivos

1. ato inaugural;
2. resultado exato;
3. casa/função em caso inédito;
4. viabilidade material;
5. colisão de significadores;
6. adequação funcional da força planetária;
7. sentido das recepções;
8. efeito da prevenção;
9. perfeição pós-ingresso;
10. tradução/coleção no mundo real;
11. sequência lunar como processo;
12. pertinência de Partes;
13. pertinência de estrelas;
14. pertinência de antíscios;
15. conflito de testemunhos;
16. escolha do regime;
17. folga humana da janela;
18. síntese do melhor disponível.

---

## 59. O que a IA nunca pode alterar

A IA não pode:

- apagar `hardVetoes`;
- modificar `ENGINE_FACTS`;
- inventar posição planetária;
- inventar fonte;
- criar veto duro por analogia;
- atribuir inferência MathAstro a Marcos/Frawley/Gugu;
- transformar uma Parte em agente;
- transformar estrela em aspecto;
- somar testemunhos num score universal;
- alterar automaticamente testemunho não marcado como adjudicável.

---

# PARTE XVI — CALCULATION BROKER

## 60. Princípio

Se a IA percebe que precisa de um cálculo formal adicional, ela **não calcula de cabeça**. Emite um pedido estruturado ao `mathastro.electional.calculation-broker.v1`.

Capacidades atuais:

- `planet-condition`;
- `house-ruler`;
- `aspect-state`;
- `trajectory`;
- `reception`;
- `essential-condition-at-longitude`;
- `lunar-sequence`;
- `planetary-hour`;
- `node-conjunctions`;
- `fixed-star-conjunctions`;
- `arabic-parts`;
- `natal-contact`;
- `context-contacts`;
- `cusp-proximity`;
- `angle-proximity`;
- `antiscion`;
- `turned-house`;
- `secondary-house-sign-ruler`.

A IA pede; o motor calcula; a IA interpreta.

---

# PARTE XVII — ANALOGIA CONTROLADA E RECUPERAÇÃO DE FONTE

## 61. Circunstância inédita

A variedade dos casos reais é aberta. Quando não houver regra literal:

1. definir o que a coisa é;
2. definir a função investigada;
3. levantar poucas analogias tradicionalmente defensáveis;
4. calcular as hipóteses;
5. escolher a que melhor representa o caso;
6. rotular como `ANALOGICAL_INFERENCE`;
7. nunca fingir que o autor tratou aquele caso literal.

---

## 62. Recuperação de fonte

Se a IA sabe que a questão provavelmente está coberta pelo corpus, mas não recebeu o trecho:

`NEEDS_SOURCE_RETRIEVAL`.

Ela não substitui fonte ausente por lembrança vaga.

---

## 63. Pergunta ao usuário

Usar `NEEDS_USER_CONTEXT` quando apenas o usuário pode responder algo que muda o juízo.

Perguntar somente o detalhe decisivo.

---

## 64. Indeterminação profissional

Se duas interpretações permanecem igualmente defensáveis, o sistema devolve ambas e explica o que as separaria.

Não existe obrigação de produzir “sim” ou “não”.

---

# PARTE XVIII — RELATÓRIO ABSOLUTO

## 65. Estrutura obrigatória do relatório

O relatório canônico deve conter:

### IDENTIDADE DA ELEIÇÃO

- objetivo;
- ato inaugural;
- local;
- janela;
- método;
- completude.

### LIMITES DO POSSÍVEL

- viabilidade;
- limitações natais;
- restrições reais;
- o que a eleição pode e não pode melhorar.

### SIGNIFICADORES CENTRAIS

- L1;
- regente principal;
- regentes adicionais;
- significadores naturais;
- colisões.

### ESTADO DOS SIGNIFICADORES

- essência;
- capacidade;
- operabilidade;
- casa geométrica/efetiva;
- movimento;
- relação com Sol;
- testemunhos técnicos.

### RECEPÇÕES

- A recebe B;
- B recebe A;
- significado contextual separado do contato.

### AÇÃO / EVENTO

- perfeição;
- aspecto;
- aplicante;
- tempo;
- ingresso;
- estação;
- impedimentos.

### DINÂMICA

- proibição;
- prevenção;
- frustração;
- refranação;
- tradução;
- coleção;
- cadeia de eventos.

### LUA

- estado;
- sequência;
- próximo contato;
- saída do signo.

### NATIVIDADES

- casas natais relevantes;
- regentes;
- condição deles na eleição;
- contatos eleição↔natal.

### MAPAS DE CONTEXTO

- eclipse;
- ingresso;
- mundano;
- institucional;
- contatos relevantes.

### QUALIDADE DO ATO

- modalidade;
- elemento;
- duração;
- adequação funcional.

### MODIFICADORES

- hora planetária;
- Nodos;
- Partes;
- antíscios;
- estrelas.

### CONVERGÊNCIA

- famílias independentes;
- nível de robustez;
- conflitos.

### JANELA

- início;
- pico;
- fim;
- causas de deterioração;
- margem prática.

### VEREDITO

- favorece;
- dificulta;
- veta;
- secundário;
- melhor disponível;
- alternativas;
- limites;
- grau de completude.

### HANDOFF PARA IA

- fatos vinculantes;
- perguntas contextuais abertas;
- cálculos adicionais permitidos;
- fontes a recuperar;
- contratos de resposta.

---

# PARTE XIX — O PROMPT ABSOLUTO

## 66. Constituição do Juiz IA — baseline preservado

A IA final deve receber o **Prompt Absoluto Eletiva em português**, cuja função não é “ensinar astrologia do zero”, mas impor uma constituição de julgamento.

Princípios fundamentais do prompt:

1. `ENGINE_FACTS_ARE_BINDING`;
2. realidade antes de simbolismo;
3. arte do possível;
4. casas por função;
5. regentes por cúspide;
6. essência ≠ capacidade ≠ adequação;
7. recepção ≠ aspecto ≠ perfeição;
8. evento exige perfeição real;
9. prevenção não é veto automático;
10. ingresso pode exigir contexto;
11. Partes são passivas;
12. estrelas são contextuais;
13. convergência não é score;
14. preservar Marcos atual versus publicado e Frawley atual versus publicado;
15. toda analogia é rotulada;
16. pedir cálculo em vez de inventá-lo;
17. pedir contexto em vez de adivinhá-lo;
18. recuperar fonte em vez de atribuir memória vaga;
19. declarar indeterminado quando necessário;
20. sintetizar o melhor disponível sem prometer destino.

O prompt v2 foi o baseline histórico. O prompt canônico v3 fica em:

`docs/MathAstro_PROMPT_ABSOLUTO_ELETIVA_PTBR_v3_CONSULTA_PRO.txt`

---

# PARTE XX — TESTES DE CONTROLE AUTORAIS

## 67. Elizabeth I — Frawley

Este caso controla se o método consegue entender simultaneamente:

- natividade + prazo real;
- Sol como significador natural da realeza;
- Sol debilitado essencialmente, mas fortalecido no MC;
- valor funcional da fixidez para estabilidade;
- Marte separando de Saturno;
- Marte aplicando ao significador dos inimigos;
- júbilos dos maléficos;
- Mercúrio/Ascendente;
- estrela proeminente no Ascendente;
- Fortuna–Regulus;
- contatos eleição↔natividade;
- contexto de eclipse/mundano;
- melhor disponível, não perfeição.

Se um motor reduz esse caso a “Sol em detrimento = ruim”, ele falha.

---

## 68. Bagdá — Marcos

Este caso controla:

- eleição institucional sem natividade pessoal inventada;
- objetivos múltiplos;
- casas I/IX/X/VII/XII em interação;
- Sol/Júpiter fortes;
- significador na angularidade;
- conflitos de regência;
- Partes;
- antíscios;
- estrelas;
- segurança, religião, cultura e duração;
- aceitação de um mapa suficientemente bom e funcional.

---

## 69. Restaurante — Marcos atual

Controla:

- I/V/X como dimensões centrais;
- referência às natividades dos envolvidos;
- realidade do empreendimento;
- crítica ao mapa “bonito em si”;
- continuidade temporal;
- preferência potencial pela horária guiada.

---

## 70. Eleição guiada por horária — Frawley/Marcos

Controla:

- mapa horário preservado;
- significador relevante;
- movimento futuro;
- timing por mudança real;
- ausência de segundo mapa eletivo clandestino;
- ausência de precisão de minuto indevida.

---

# PARTE XXI — ERROS PROIBIDOS

## 71. O método não permite

- mapa bonito sem objetivo concreto;
- eleição completa pessoal sem natividade pertinente, salvo perfil explicitamente institucional;
- “Saturno ruim, Júpiter bom” como regra universal;
- somar dignidades num score mágico;
- fundir aspecto e recepção;
- considerar aspecto que não perfecciona como evento realizado;
- rejeitar automaticamente perfeição pós-ingresso sem examinar o contexto;
- tratar toda prevenção como impedimento fatal;
- tratar Lua vazia/sem aplicação como veto universal;
- usar Parte como planeta;
- usar Nodo por signo isolado;
- usar estrela sem pertinência;
- criar derivação de casa desnecessária;
- criar segundo significador apenas porque o primeiro é inconveniente;
- ignorar o regente natal relevante porque ele é maléfico;
- transformar o pico do scanner em minuto mágico;
- afirmar que a Eletiva transforma realidade material impossível;
- inventar regra de Gugu onde o corpus não fornece;
- atribuir reconstrução MathAstro a um autor;
- deixar a IA alterar fatos astronômicos.

---

# PARTE XXII — PROCEDIMENTO UNIVERSAL PARA QUALQUER NOVO CASO

## 72. Algoritmo de cobertura aberta

Quando surgir um caso nunca visto:

1. receber a descrição integral;
2. identificar quem pergunta e quem age;
3. identificar o ato inaugural;
4. identificar o resultado prioritário;
5. verificar viabilidade material;
6. classificar se pessoal/institucional/coletivo;
7. escolher método: clássico, atual-aware, horária guiada ou comparação;
8. determinar casas candidatas pela função real;
9. derivar somente se necessário;
10. detectar colisões de regentes;
11. identificar natividades/contextos necessários;
12. criar `customGoal` se o vocabulário padrão não cobrir;
13. validar fontes e inferência;
14. calcular a janela;
15. avaliar candidatos;
16. certificar trajetória dos finalistas;
17. produzir relatório absoluto;
18. listar todas as perguntas contextuais ainda abertas;
19. permitir que a IA solicite cálculos extras ao broker;
20. recuperar fontes pertinentes;
21. adjudicar somente o que é subjetivo;
22. aplicar efeitos contextuais autorizados;
23. recalcular síntese;
24. apresentar o melhor disponível e seus limites;
25. se não houver fundamento suficiente, declarar indeterminado.

Esse procedimento é o que torna o método extensível a circunstâncias que nunca foram literalmente descritas pelos autores.

---

# PARTE XXIII — CRITÉRIO DE “100%”

## 73. O que significa método completo

Neste domínio, “100%” **não** pode significar que já escrevemos uma regra literal para toda situação futura imaginável.

Significa que:

- toda situação entra por uma gramática conhecida;
- todo cálculo tem dono;
- toda subjetividade tem dono;
- toda fonte tem proveniência;
- toda lacuna produz uma ação explícita;
- nenhuma IA pode inventar astronomia;
- nenhuma regra analógica pode se mascarar de tradição;
- todo veredito declara seus limites.

O método está estruturalmente completo quando nenhuma nova situação exige quebrar a arquitetura — apenas aplicar a gramática, criar um `customGoal`, pedir cálculos ou exercer julgamento contextual.

---

## 74. O que ainda é certificação de software, não lacuna metodológica

A completude metodológica deve ser separada da certificação do aplicativo.

Ainda podem existir bloqueadores de software externos, como:

- instalação completa das dependências;
- `next build` integral;
- diferenças de calendário em regressões históricas;
- disponibilidade de efemérides históricas específicas;
- integração real com o provedor IA escolhido.

Isso não muda o método descrito aqui; muda o estado de certificação do produto.

---


---

# PARTE XXIV — CAMADA v3 DE CONSULTA PROFISSIONAL

## 75. O que a versão 3 acrescenta

A versão 2 fechou a gramática metodológica, a fronteira motor↔IA, o broker, a subjetividade explícita, o scanner, os regimes e os controles autorais. A versão 3 acrescenta a peça necessária para transformar isso em **astrólogo eletivo de consulta**, e não apenas em um sistema tecnicamente correto.

O v3 ensina explicitamente à IA:

1. como transformar uma situação humana em problema eletivo;
2. como escolher o modo de trabalho;
3. como ler um significador sem cair em palavra-chave;
4. como converter dignidade/capacidade/recepção/perfeição em linguagem da situação;
5. como comparar candidatos que possuem bens diferentes;
6. como tratar compromissos inevitáveis;
7. como explicar o melhor disponível sem vendê-lo como perfeito;
8. como produzir recomendação temporal prática;
9. como reconhecer quando a própria Eletiva é o método inadequado;
10. como auditar a si mesma antes da resposta.

O método canônico continua sendo source-locked. A camada de consulta é **operacional MathAstro**: ela organiza como um astrólogo deve raciocinar com as regras recuperadas, sem atribuir ao autor frases que ele não formulou.

---

## 76. Modos de consulta

### 76.1. `FULL_ELECTIONAL_CONSULTATION`

Entrada:
- descrição da situação;
- objetivo;
- janela;
- local;
- restrições;
- natividades/contextos quando pertinentes.

Saída:
- definição do ato;
- regime;
- casas/significadores;
- varredura;
- finalistas;
- adjudicação contextual;
- melhor faixa;
- justificativa;
- alternativas;
- limites.

### 76.2. `CANDIDATE_JUDGMENT`

Entrada:
- um instante já calculado.

Saída:
- qualidade intrínseca;
- adequação ao objetivo;
- riscos;
- dinâmica;
- se vale a pena dentro do possível.

### 76.3. `WINDOW_SELECTION`

Entrada:
- janela temporal real.

Saída:
- faixas contínuas;
- pico comparativo;
- margens;
- causas das bordas;
- comparação dos melhores candidatos.

### 76.4. `HORARY_GUIDED_TIMING`

Entrada:
- mapa horário original;
- pergunta concreta;
- significador identificado ou dados para identificá-lo;
- janela prática.

Saída:
- melhora futura do significador;
- timing coerente;
- sem segundo mapa futuro clandestino;
- precisão limitada ao que a técnica sustenta.

### 76.5. `TECHNICAL_AUDIT`

Confere:
- fatos;
- fontes;
- regime;
- casas;
- dinâmica;
- uso da IA;
- conclusão.

### 76.6. `AUTHORIAL_COMPARISON`

Mantém trilhos separados e só sintetiza depois.

---

## 77. Intake profissional — o que perguntar ao cliente

O astrólogo eletivo não deve começar pelo céu. Deve começar pelo **ato real**.

Campos essenciais:

```text
caseDescription
inauguralActCandidates[]
primaryObjective
secondaryObjectives[]
objectivesThatMayBeSacrificed[]
actors[]
beneficiaries[]
institutionalOrPersonal
viableInReality
practicalWindow
location
timeZone
allowedWeekdays
allowedHours
blockedIntervals
nativities[]
contextCharts[]
methodPreference
```

Perguntas humanas fundamentais:

1. O que exatamente vai começar?
2. O que torna isso oficialmente/realmente iniciado?
3. Qual é o resultado mais importante?
4. O que você aceitaria sacrificar para obter esse resultado?
5. Há data-limite?
6. Há dias/horas inviáveis?
7. O local pode mudar?
8. Quem é organicamente afetado?
9. Existe natividade pertinente?
10. O empreendimento é de fato viável?
11. Há uma mudança futura já prevista que possa corresponder a ingresso/significator change?
12. A pergunta seria mais naturalmente formulada como “antes ou depois de X?” ou “quando este significador melhora?”?

Não perguntar tudo indiscriminadamente. O sistema deve fazer **context gating**: perguntar apenas o que altera casa, significador, regime ou resultado.

---

## 78. Planejamento semântico profissional

Antes de escanear:

```text
REAL_WORLD_CASE
  ↓
ACT_DEFINITION
  ↓
OBJECTIVE_HIERARCHY
  ↓
METHOD_SELECTION
  ↓
HOUSE_FUNCTION_MAP
  ↓
SIGNIFICATOR_MAP
  ↓
NATAL_CONTEXT_REQUIREMENTS
  ↓
SCAN_CONSTRAINTS
```

O planejador deve produzir:
- hipótese principal;
- hipóteses alternativas;
- pontos de ambiguidade;
- dados faltantes;
- `customGoal`, quando necessário;
- sourceIds e inferenceType.

Nenhuma hipótese semântica ganha autoridade astronômica. Ela apenas decide **o que o motor deve calcular**.

---

## 79. Gramática universal de interpretação de significador

Para qualquer planeta central:

### 79.1. Papel

Pergunta:
**quem/o que este planeta é nesta eleição?**

Sem papel definido, não interpretar.

### 79.2. Função exigida

Pergunta:
**o que ele precisa conseguir fazer para este objetivo dar certo?**

Exemplos funcionais:
- iniciar;
- sustentar;
- unir;
- vender;
- tornar público;
- conservar;
- liquidar;
- defender;
- comunicar;
- receber;
- autorizar;
- produzir prazer;
- transmitir conhecimento.

### 79.3. Qualidade essencial

Pergunta:
**de que modo essa função tende a agir?**

Não responder em adjetivos soltos.

### 79.4. Capacidade acidental

Pergunta:
**quanto poder real essa função possui neste instante?**

### 79.5. Adequação funcional

Pergunta:
**essa força serve ao objetivo?**

### 79.6. Localização

Pergunta:
**onde a ação aparece e qual campo ela ocupa?**

### 79.7. Dispositor

Pergunta:
**sob que condição/autoridade/ambiente o agente opera?**

### 79.8. Recepção

Pergunta:
**qual é a disposição entre os agentes?**

### 79.9. Aspecto

Pergunta:
**há contato?**

### 79.10. Trajetória

Pergunta:
**o contato acontece de fato e o que ocorre antes?**

### 79.11. Modificadores

Somente se pertinentes.

### 79.12. Conclusão funcional

Converter tudo em:
- capacidade;
- vulnerabilidade;
- direção;
- dependência;
- relação;
- condição de sucesso;
- limite.

---

## 80. Ficha universal de leitura de candidato

Cada finalista deve poder ser resumido por:

```text
candidateId
timeRange
peakTime
intrinsicBand
relativeRank

realWorldFit
inauguralActFit
objectiveFit

L1Role
primarySubjectRulerRole
additionalRulers[]

essentialQualitySummary
accidentalCapacitySummary
functionalFitSummary

receptionSummary
perfectionSummary
dynamicSummary
moonProcessSummary

natalFitSummary
contextChartSummary

modalityFit
elementFit
maleficFunctionalUse

planetaryHourSummary
nodeSummary
partsSummary
fixedStarSummary
antiscionSummary

hardVetoes[]
criticalRisks[]
majorRisks[]
minorRisks[]
supports[]

independentEvidenceFamilies[]
contradictions[]

boundaryStartCause
boundaryEndCause
humanMargin

openContextQuestions[]
pendingCalculations[]
pendingSources[]

finalJudgment
```

A ficha não é o texto ao cliente. É o suporte para a síntese.

---

## 81. Natividade dentro da Eletiva — uso estritamente funcional

A natividade entra para responder:
- o que o nativo pode sustentar;
- quais regentes natais precisam ser preservados;
- como os luminares/ASC natal participam;
- se o mapa eleito conversa com os pontos pertinentes.

Ela **não** entra para:
- produzir perfil psicológico;
- calcular temperamento para a consulta eletiva;
- descrever mentalidade;
- fazer sinastria geral;
- produzir vocação natal completa.

Se o julgamento eletivo precisar de uma conclusão natal interpretativa que não veio calculada, solicitar ao domínio Natal um **fato/dossiê técnico explícito**; não importar silenciosamente outro método.

---

## 82. Objetivos concorrentes e trade-offs

Uma eleição real frequentemente é um problema multiobjetivo.

Exemplo abstrato:
- candidato A favorece duração;
- candidato B favorece rapidez;
- candidato C favorece publicidade;
- nenhum maximiza tudo.

O método deve:

1. identificar objetivo primário;
2. identificar objetivos secundários;
3. registrar objetivos sacrificáveis;
4. eliminar candidatos com defeitos estruturais;
5. comparar os sobreviventes pela hierarquia declarada;
6. explicar o custo da escolha.

Saída ideal:
> “Esta janela vence porque protege a duração, que você definiu como prioridade. A alternativa de terça-feira é mais rápida e comercialmente mais agressiva, mas aceita um risco estrutural maior para estabilidade.”

Isso é superior a:
> “Segunda 87 pontos; terça 84.”

---

## 83. Manual interpretativo de dinâmica

### 83.1. Aplicação

Traduzir como movimento em direção à relação/evento, apenas quando os papéis justificarem.

### 83.2. Separação

Pode representar:
- fato já ocorrido;
- influência que está ficando para trás;
- condição herdada.

Não interpretar sem história.

### 83.3. Perfeição

É o momento de contato formal. Qualidade do resultado exige condição e recepção.

### 83.4. Prevenção

Pode representar:
- obstáculo;
- prioridade concorrente;
- pessoa que entra antes;
- burocracia;
- pagamento;
- autorização;
- evento intermediário;
- atraso não fatal.

### 83.5. Proibição

Julgar quem impede e se possui capacidade real para fazê-lo.

### 83.6. Frustração

Perguntar qual mudança real rompe aquilo que parecia possível.

### 83.7. Refranação

Mudança de movimento que impede a chegada ao contato.

### 83.8. Tradução

Perguntar quem carrega a ação.

### 83.9. Coleção

Perguntar quem tem poder de reunir.

### 83.10. Ingresso

Perguntar:
**o que precisa mudar antes que o evento possa ocorrer?**

O motor descreve a geometria; o astrólogo descreve a correspondência.

---

## 84. Manual da Lua como narrativa

Converter a sequência em uma frase temporal:

```text
estado presente
→ próximo contato
→ intervenção
→ mudança
→ contato central
→ saída do signo
```

Cada contato deve ser mapeado a uma função do caso.

Não inventar pessoa/acontecimento para planeta sem papel plausível.

A Lua pode:
- confirmar;
- narrar;
- mostrar mudança;
- mostrar interrupção;
- mostrar ausência de ação;
- mostrar o primeiro evento que acontece.

A falta de aplicação, isoladamente, não é “mapa morto”.

---

## 85. Manual de janelas e bordas

A recomendação deve ser uma **faixa operacional**.

Para cada janela:

```text
start
bestCore
peak
safeMargin
end
```

Explicar bordas por eventos reais:
- ingresso;
- estação;
- aspecto;
- perfeição;
- cessação de recepção;
- alteração de angularidade;
- mudança de casa efetiva;
- troca de hora planetária;
- novo risco crítico;
- fim da restrição prática.

Se a borda decorre apenas do passo de amostragem do scanner e não de fenômeno real, não fingir precisão. Pedir refinamento ao motor.

---

## 86. Comparação contrafactual de finalistas

O sistema deve saber responder:
**por que não o horário imediatamente anterior?**
**por que não o candidato 2?**
**o que eu ganho e perco escolhendo esta faixa?**

Para isso, comparar diferenças decisivas, não todos os campos.

Exemplo:

```text
A vence B porque:
- elimina risco crítico X;
- mantém objetivo primário Y;
- preserva contato natal Z.

B ainda possui:
- suporte estelar;
- hora planetária melhor;
mas esses fatores são secundários diante de X/Y/Z.
```

---

## 87. Veredito em duas dimensões

Sempre separar:

### Qualidade intrínseca
Quão bom é o mapa em si dentro do método?

### Posição relativa
É o melhor disponível na janela?

Possíveis casos:
- excelente e melhor disponível;
- bom e melhor disponível;
- aceitável, mas melhor disponível;
- fraco, porém único utilizável;
- nenhum candidato responsável.

Não transformar `MELHOR_DISPONIVEL` em elogio absoluto.

---

## 88. Recomendação prática

O veredito final precisa responder:

1. **quando agir**;
2. **qual ato executar nessa faixa**;
3. **qual margem é segura**;
4. **o que precisa permanecer igual ao cenário analisado**;
5. **qual objetivo a janela privilegia**;
6. **qual defeito ela não elimina**;
7. **qual alternativa usar se a janela for perdida**.

Se o cliente só puder agir fora da melhor faixa, comparar a melhor alternativa real — não continuar recomendando um horário impossível.

---

## 89. Graus de segurança do juízo

Sem porcentagens inventadas.

- `CENTRAL`
- `FORTE`
- `MODERADA`
- `POSSIVEL`
- `INDETERMINADA`

O rótulo representa segurança da **síntese**, não pontuação do céu.

---

## 90. Dupla passagem de julgamento humano/IA

### Primeira leitura — construção

1. realidade;
2. ato;
3. objetivo;
4. regime;
5. significadores;
6. condição;
7. relações;
8. dinâmica;
9. Lua;
10. contexto;
11. modificadores;
12. janela.

### Segunda leitura — tentativa de refutação

Perguntar:
- o que tornaria minha escolha errada?
- há um hardVeto que ignorei?
- usei significador errado?
- a recepção contradiz a narrativa?
- o aspecto realmente perfecciona?
- algo intervém antes?
- o ingresso muda o sentido?
- a natividade contradiz a escolha?
- um apoio secundário está mascarando risco principal?
- a melhor faixa é só artefato de amostragem?
- estou vendendo precisão maior que o método?

Só concluir depois da segunda passagem.

---

## 91. Checklist anti-erro definitivo

```text
[ ] REALITY
[ ] INAUGURAL_ACT
[ ] OBJECTIVE
[ ] METHOD_REGIME
[ ] HOUSE_FUNCTION
[ ] DERIVATION
[ ] SIGNIFICATOR_ROLE
[ ] NATAL_REQUIREMENT
[ ] ESSENTIAL_QUALITY
[ ] ACCIDENTAL_CAPACITY
[ ] FUNCTIONAL_FIT
[ ] RECEPTION
[ ] ASPECT
[ ] PERFECTION
[ ] TRAJECTORY
[ ] PREVENTION
[ ] INGRESS
[ ] TRANSLATION_COLLECTION
[ ] MOON_SEQUENCE
[ ] MODALITY_ELEMENT
[ ] PLANETARY_HOUR
[ ] NODES
[ ] PARTS
[ ] ANTISCIA
[ ] FIXED_STARS
[ ] CONVERGENCE
[ ] CONTRADICTION
[ ] DUPLICATE_EVIDENCE
[ ] SOURCE_PROVENANCE
[ ] BROKER_REQUESTS
[ ] WINDOW_CONTINUITY
[ ] COUNTERFACTUAL_COMPARISON
[ ] HUMAN_MARGIN
[ ] PRACTICAL_RECOMMENDATION
[ ] LIMITS
[ ] OUT_OF_SCOPE
```

---

## 92. Contrato de resposta humana

Em consulta integral:

### RESUMO_EXECUTIVO
A decisão.

### O_QUE_ESTA_SENDO_ELEITO
Ato + objetivo.

### LIMITES_DO_POSSIVEL
Realidade + natal/contexto.

### SIGNIFICADORES_E_FUNCOES
Somente os que decidem.

### QUALIDADE_E_CAPACIDADE
Essência/acidental/adequação.

### RELACOES_E_EVENTO
Recepção + aspecto + perfeição.

### DINAMICA
Somente figuras ativas.

### LUA
Processo.

### MODIFICADORES
Somente os relevantes.

### JANELA_RECOMENDADA
Faixa + pico + margem + bordas.

### POR_QUE_ESTA_JANELA
Convergência e comparação.

### DEFEITOS_QUE_PERMANECEM
O que não foi possível consertar.

### ALTERNATIVAS
Planos B.

### VEREDITO
Qualidade intrínseca + posição relativa.

### LIMITES_E_PENDENCIAS
Contexto/cálculo/fonte.

A explicação deve soar como **consulta**, não relatório de debug.

---

## 93. Contrato para runtime IA

O bot deve carregar:

```text
PROMPT_ABSOLUTO_ELETIVA_PTBR_v3_CONSULTA_PRO
+
mathastro.electional.absolute-ai-bundle.v1
+
ENGINE_FACTS
+
authorial dossier/source registry
+
open contextual questions
+
broker capabilities
```

O modelo pode:
- adjudicar contexto;
- solicitar cálculo;
- solicitar fonte;
- solicitar contexto;
- propor testemunho contextual permitido.

O modelo não pode:
- alterar fatos;
- apagar veto;
- criar cálculo;
- criar fonte;
- criar veto duro analógico.

---

## 94. Blind author-reconstruction benchmark

Para testar competência interpretativa, o sistema deve receber os fatos de um caso autoral sem receber a conclusão final e tentar reconstruir o tipo de raciocínio.

Fixtures centrais:
- Elizabeth I / Frawley;
- Bagdá / Marcos;
- restaurante / Marcos atual;
- eleição guiada por horária / Frawley + Marcos.

O objetivo não é memorizar o parágrafo; é verificar se o sistema:
- escolhe os fatores certos;
- hierarquiza corretamente;
- tolera trade-offs;
- reconhece função de maléficos;
- respeita natividade/contexto;
- não confunde influência/perfeição;
- não transforma estrela em fundamento principal quando ela é secundária;
- não cria minuto mágico.

---

## 95. Definição v3 de “absoluto”

O método é absoluto em sentido operacional quando qualquer caso eletivo legítimo possui um destino:

```text
CALCULABLE → motor
DERIVABLE → broker
CONTEXTUAL → astrólogo/IA
MISSING_CONTEXT → usuário
MISSING_SOURCE → corpus
UNSUPPORTED → indeterminado
```

A completude não depende de haver uma receita para todo objeto futuro. Ela depende de o sistema possuir:
- ontologia;
- roteamento;
- cálculo;
- regimes;
- protocolos;
- adjudicação;
- anti-erro;
- proveniência;
- saída prática.

Uma nova circunstância deve exigir **aplicação da gramática**, não quebra da arquitetura.

---

# APÊNDICE E — PROMPT CANÔNICO v3

O prompt normativo da camada interpretativa passa a ser:

`MathAstro_PROMPT_ABSOLUTO_ELETIVA_PTBR_v3_CONSULTA_PRO.txt`

Ele substitui o v2 como prompt recomendado para novas integrações, preservando compatibilidade conceitual com:
- `mathastro.electional.ai-report.v5`;
- `mathastro.electional.absolute-ai-bundle.v1`;
- `mathastro.electional.adjudication.v1`;
- `mathastro.electional.calculation-broker.v1`;
- `mathastro.electional.ai-adjudication-response.v1`.

---

# APÊNDICE F — REGRA MESTRA DEFINITIVA

> **A realidade define o problema; o método define o que observar; o motor calcula; o broker completa; a IA/astrólogo julga a parte contextual; a janela é comparada dentro do possível; a recomendação termina em uma ação real, com limites declarados.**

> **Se é calculável, o motor calcula. Se é derivável, peça ao broker. Se é contextual, julgue. Se falta contexto, pergunte. Se falta fonte, recupere. Se não houver fundamento, declare indeterminado.**


# APÊNDICE A — REGISTRO CANÔNICO DE FONTES

Principais IDs usados no motor:

- `M-BK-ELECT` — Marcos publicado, fundamentos eletivos;
- `M-TX-ELECT-CURRENT` — Marcos atual, crítica e eleição via horária;
- `M-BAGHDAD-ELECT` — caso Bagdá;
- `M-BK-HOURS` — horas planetárias desiguais;
- `M-CURRENT-ASPECTS` — influência versus perfeição/evento;
- `M-CURRENT-NODES` — Nodos por conjunção;
- `M-FIXED-STARS` — política contextual de estrelas;
- `F-REAL-ELECT` — Frawley, técnica eletiva publicada;
- `F-QUEEN-BESS` — caso Elizabeth I;
- `F-HORARY-ELECT` — eleição por horária;
- `F-HORARY-DYNAMICS` — tradução, coleção, prevenção, frustração, refranação e ingresso;
- `F-HORARY-PARTS` — Partes;
- `F-CURRENT-ELECT` — posição atual de Frawley;
- `G-CONVERGENCE` — Gugu, convergência de indicações;
- `G-ELECT` — material eletivo atribuível a Gugu;
- `MA-OP-ELECT` — operacionalização MathAstro;
- `MA-AI-ADJUDICATION` — constituição do juiz IA.

---

# APÊNDICE B — REGRA MESTRA DA IA

> **Se é calculável, o motor calcula. Se é formalmente derivável, a IA pede ao broker. Se é contextual, o astrólogo/IA julga. Se falta contexto, pergunta. Se falta fonte, recupera. Se não houver fundamento, declara indeterminado.**

---

# APÊNDICE C — RESUMO DE EXECUÇÃO EM 12 LINHAS

1. Defina a coisa e o ato inaugural.  
2. Defina o resultado exato.  
3. Verifique a realidade.  
4. Escolha método/regime.  
5. Determine casas e significadores.  
6. Integre natividades/contextos pertinentes.  
7. Calcule essência, capacidade e função.  
8. Julgue recepções, perfeição e dinâmica.  
9. Leia Lua e modificadores.  
10. Compare candidatos por hierarquia, não score.  
11. Reconstrua janelas contínuas.  
12. Entregue à IA somente a parcela realmente contextual, preservando fatos e limites.

---

# APÊNDICE D — DOCUMENTOS COMPLEMENTARES NORMATIVOS

Este método deve ser lido em conjunto com:

- `MathAstro_PROMPT_ABSOLUTO_ELETIVA_PTBR_v3_CONSULTA_PRO.txt`;
- `PROMPT_PLANEJADOR_SEMANTICO_ELETIVA_V1.md`;
- `ARQUITETURA_ELETIVA_IA_ABSOLUTA_V1.md`;
- `MATRIZ_SUBJETIVIDADE_ELETIVA_IA_V1.md`;
- `CONTRATO_INTEGRACAO_BOT_IA_ELETIVA_V1.md`;
- `AUDITORIA_ELETIVA_FINAL_IA_20260901.md`;
- `fixtures/electional-author-benchmarks.json`.

Esses documentos são auxiliares. **O presente arquivo é a síntese metodológica canônica.**
