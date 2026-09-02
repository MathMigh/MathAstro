# PROTOCOLO ABSOLUTO DE INSPEÇÃO NATAL PARA IA

> **ATUALIZAÇÃO DE RUNTIME — 01/09/2026**  
> O protocolo abaixo continua sendo a matriz metodológica extensa, mas sua execução por IA foi formalizada em código por `src/app/lib/natalJudgmentEngine.ts`. O runtime usa três camadas (`NATAL_FACTS`, `NATAL_AUTHORIAL_DOSSIER`, `NATAL_JUDGMENT_CONTEXT`), grafo de evidência autoral, roteamento open-world, zonas de julgamento e o Prompt Absoluto em `docs/ABSOLUTE_NATAL_PROMPT_v2_PTBR.txt`. Consulte `docs/NATAL_ABSOLUTE_AI_ARCHITECTURE_20260901.md` para o contrato atual de execução.

**O que a IA deve olhar, em que ordem e segundo qual método**

Marcos Monteiro — eixo canônico  
John Frawley — suplemento verificado  
Gugu — suplemento secundário e separado

Versão 1.0 — 28 de agosto de 2026

---

## Regra de uso

O motor calcula; a IA interpreta. Quando um autor não oferece técnica específica verificada no corpus, registrar a ausência e não completar com astrologia genérica.

## Códigos de fonte

- **M-BK** — Marcos Vinicius Monteiro, Introdução à Astrologia Ocidental - Edição Revista e Aumentada. Fonte primária direta: casas, dignidades, recepções, aspectos, ontologia, técnicas e exemplos.
- **M-TX** — Transcrições, stories, respostas, aulas e vídeos de Marcos fornecidos no corpus MathAstro, sobretudo material de 2026. Fonte primária direta quando a fala está preservada.
- **F-APP** — John Frawley, The Real Astrology Applied. Fonte publicada. Para Natal, usar sobretudo o exemplo de método nas pp. 182-188 do PDF fornecido; regras antigas de pontuação são ledger histórico, não totalizador canônico.
- **F-CUR** — John Frawley, Conversations on Natal Astrology, 2, versão pública atual consultada em 2026. Fonte direta atual para Hyleg, Anareta, Alcochoden e longevidade.
- **F-SYL** — John Frawley, Natal and Electional Astrology, programa público atual. Fonte direta atual para o escopo que ele efetivamente ensina: Temperament; Wit and Manner; General Fortune; casas; progressões; retornos; profecções; longevidade.
- **G-TX** — Compilação/transcrição secundária atribuída a Luiz Gonzaga de Carvalho Neto (Gugu) no corpus MathAstro. Deve ser usada somente como suplemento identificado; nunca como regra Marcos.
- **M-OP** — Reconstrução operacional MathAstro: ordem de inspeção deduzida de regras diretas de Marcos, sem alegar que Marcos publicou um algoritmo com esse formato.
- **F-OP** — Reconstrução operacional MathAstro a partir de exemplos e princípios diretos de Frawley; quando não existe fórmula publicada, a saída deve permanecer qualitativa.

## Pacote planetário universal

- planeta e longitude eclíptica exata; signo e grau;
- latitude eclíptica, ascensão reta e declinação, quando o motor as disponibiliza;
- casa geométrica e casa efetiva depois da regra de cúspide aplicável;
- regências de casas: quais assuntos do mapa este planeta governa;
- domicílio, exaltação, triplicidade do secto, termo e face;
- detrimento, queda e peregrinação segundo a definição do modo usado;
- dispositor por domicílio e condição integral desse dispositor;
- secta, hayz/halb quando o módulo Frawley exigir, e relação com o horizonte;
- velocidade comparada à própria média, direção, retrogradação e eventual estação;
- condição solar: cazimi, combustão, sob os raios ou livre, respeitando a regra específica da fonte;
- orientalidade/ocidentalidade quando pertinente;
- angularidade e distância às cúspides relevantes;
- aspectos tradicionais relevantes, orbe, aplicação/separação e possibilidade real de perfeição;
- recepções em cada direção, sem confundir recepção com aspecto;
- antíscio e contra-antíscio quando o tema os tornar pertinentes;
- conjunções com Nodo Norte/Sul segundo a política do método;
- estrelas fixas realmente relevantes e distância exata;
- Partes ativas ligadas ao planeta ou ao assunto;
- planetas terceiros que afligem, apoiam, proíbem, frustram ou modificam a relação temática.

## Pacote de casa universal

- cúspide: longitude, signo e grau;
- regente do signo da cúspide - este é o regente da casa;
- dossiê planetário integral do regente;
- casa em que o regente se encontra e as casas que ele próprio rege;
- planetas corporalmente na casa e planetas efetivamente sobre a cúspide pela regra aplicável;
- planetas afligindo ou ajudando a cúspide;
- estrelas fixas sobre a cúspide, quando estreitas e pertinentes;
- nodos sobre a cúspide, se a conjunção for tecnicamente válida;
- antíscio/contra-antíscio da cúspide e contatos relevantes;
- co-significador natural da casa apenas como testemunho secundário - nunca como substituto do regente;
- se a pergunta for derivada, identificar de qual pessoa/assunto a casa foi derivada e mostrar a aritmética da derivação.

## Pacote de relação universal

- identificar A e B como agentes reais do tema;
- qual planeta significa A e qual significa B;
- aspecto entre A e B; separação angular; orbe;
- aplicação ou separação; se a perfeição é realmente possível;
- recepção A→B e B→A; dignidade da recepção; eventual recepção mútua;
- condição essencial de A e de B - capacidade de agir;
- condição acidental de A e de B - possibilidade concreta de manifestar a capacidade;
- casas em que A e B estão - onde o assunto se manifesta;
- dispositores de A e B e seu estado;
- planetas terceiros que intermedeiam, proíbem, frustram, traduzem ou coletam, somente quando a técnica empregada autoriza;
- estrelas, nodos, cúspides e Partes que modificam especificamente A/B;
- se não houver recepção, não inventar intenção; se não houver aspecto/oportunidade, não inventar encontro.

## 6. Temperamento - núcleo Marcos

**Pergunta:** Qual é a mistura humoral de fundo e quais testemunhos a tornam mais quente/fria e seca/úmida?

### Marcos — olhar obrigatoriamente
- Examinar exatamente cinco núcleos: (1) Ascendente; (2) regente do Ascendente; (3) estação/fase solar pertinente ao temperamento; (4) fase lunar; (5) Senhor da Natividade.
- Para o Ascendente, partir da qualidade elemental do signo e considerar os modificadores realmente ligados ao ponto; não tratar a casa como se ela mesma fizesse aspecto.
- Para um planeta significador, partir de sua qualidade natural e modulá-la pelo signo e pelos contatos próximos documentados no corpus.
- Para Sol e Lua, preservar a fase/estação específica, o signo e modificadores planetários relevantes.
- Classificar cada testemunho qualitativamente como quente/frio e seco/úmido, registrando se a qualidade foi reforçada ou atenuada. Marcos usa expressões como “pouco” e “muito”; o corpus não publica multiplicadores universais.
- Comparar os cinco testemunhos como conjunto: identificar predominante, secundário, mistura e contradições. Não transformar a síntese em percentuais apresentados como técnica de Marcos.
- Usar o Senhor da Natividade novamente como quinto testemunho, com as qualidades que ele efetivamente possui no mapa.

### Frawley — acrescentar somente o verificado
- Frawley Applied também começa o Natal pelo temperamento e inspeciona I/regente I, Sol, Lua e Lord of Geniture, modulando qualidades por signos, orientação e aspectos. Usar como testemunha comparativa, não para apagar a versão Marcos.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Gerar um ledger dos cinco testemunhos.
2. Descrever cada modulação individualmente.
3. Só depois comparar os quatro humores.
4. Se a fonte não resolver a intensidade exata, conservar “reforça/atenua” e a dúvida.

### Campos mínimos de saída
```text
predominantHumor
secondaryHumor
witnesses[5]
hotColdBalanceQualitative
dryMoistBalanceQualitative
contradictions
uncertainty
```

### Proibições
- Não usar 1,25/0,75 ou outro peso inventado como se fosse Marcos.
- Não decidir por mera contagem 3×2 quando a intensidade qualitativa muda o quadro.

**Base documental:** M-TX - exemplo médico de Bento XVI e respostas de 13/06/2026; M-OP; F-APP pp. 183-184.

## 7. Senhor da Natividade - Marcos

**Pergunta:** Qual planeta reúne a melhor capacidade essencial para representar as melhores qualidades e servir ao temperamento?

### Marcos — olhar obrigatoriamente
- Construir para cada planeta tradicional um ledger de dignidades essenciais: domicílio, exaltação, triplicidade, termo e face; registrar detrimento/queda separadamente.
- Usar a hierarquia documentada: domicílio > exaltação >> triplicidade >> termo/face. Termo e face são dignidades pequenas e podem funcionar como desempate.
- Não somar dignidade essencial e acidental numa única pontuação canônica. Marcos ressalta a heterogeneidade das condições acidentais.
- Se ainda houver empate real após as dignidades, apresentar aos candidatos a condição acidental, angularidade, contatos e contexto para revisão qualitativa; se não houver regra suficiente, devolver unresolved.
- Depois de escolhido, usar seu estado humoral como quinto testemunho do temperamento.
- Fora do temperamento, Marcos diz que o Senhor da Natividade tem pouca função específica e, muito genericamente, simboliza as melhores qualidades do nativo.

### Frawley — acrescentar somente o verificado
- Não confundir com o “strongest planet” por soma de tabelas de Frawley Applied nem com Hyleg/Alcochoden.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Comparar dignidades maiores.
2. Usar dignidades menores como refinamento.
3. Registrar debilidades sem convertê-las em pontos negativos universais.
4. Se necessário, revisão qualitativa - ou não resolver.

### Campos mínimos de saída
```text
planet
essentialDignityLedger
debilityLedger
tieCandidates
resolutionMode
temperamentContribution
```

### Proibições
- Não fabricar vencedor por número de aspectos.
- Não chamar de almuten por soma 5/4/3/2/1 no modo Marcos.

**Base documental:** M-TX - hierarquia essencial e respostas sobre Senhor da Natividade; M-OP.

## 8. Manner - Frawley

**Pergunta:** Por qual planeta o temperamento ganha uma forma exterior, um “polimento” social?

### Marcos — olhar obrigatoriamente
- Nenhum núcleo específico adicional além do dossiê universal.

### Frawley — acrescentar somente o verificado
- Primeiro procurar planeta no signo ascendente.
- Se não houver candidato satisfatório, procurar planeta ligado à Lua ou a Mercúrio.
- Se isso não resolver, usar o regente do Ascendente.
- No procedimento publicado, Sol e Lua não atuam como indicadores de Manner: são tratados como fontes de poder, não como o modo de usar esse poder.
- Depois de identificar o planeta, julgar sua natureza, condição essencial, condição acidental, casa/cúspide, orientação, dispositor e aspectos que o modificam.
- Ler força essencial e destaque acidental separadamente: planeta essencialmente fraco porém angular pode manifestar fortemente sua face problemática.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Aplicar a ordem de seleção sem pular etapas.
2. Se dois candidatos no mesmo estágio forem plausíveis, não somar scores: mostrar ambos e pedir julgamento qualitativo.
3. Integrar o Manner ao temperamento - nunca substituí-lo.

### Campos mínimos de saída
```text
mannerPlanet
selectionStage
essentialCondition
accidentalProminence
modifiers
expressionThroughTemperament
```

### Proibições
- Não usar Sol/Lua como Manner neste procedimento.
- Não selecionar “planeta mais forte do mapa” por score.

**Base documental:** F-APP pp. 184-185.

## 9. Mentalidade - método Marcos

**Pergunta:** Como a mente dirige atenção, organiza dados, imagina, articula e se expressa?

### Marcos — olhar obrigatoriamente
- Mercúrio: registrar signo, elemento, modalidade, casa, dignidades/debilidades, condição solar, velocidade, direção, dispositor, aspectos, recepções, estrelas e contatos de cúspide.
- Interpretar Mercúrio primeiro como foco de atenção/classificação/articulação e forma de expressão - não como quantidade de inteligência.
- Mercúrio por elemento, no primeiro nível: água → sentimentos, emoções e relações estéticas; ar → lógica, discurso, palavras e pensamento articulado; terra → concretude, limites, fundamentos e problemas concretos; fogo → ação, mudança, transformação/destruição.
- Lua: registrar fase, signo/elemento/modalidade, casa, condição essencial/acidental, velocidade, dispositor, aspectos, estrelas e sua relação com Mercúrio.
- Tratar a Lua como camada espontânea da imaginação/sentido comum - “como a pessoa pensa quando não está pensando no que pensa”, na formulação incorporada por Marcos a partir de Gugu.
- Relação Lua–Mercúrio: verificar aspecto, aplicação/separação, eventual perfeição, recepção nos dois sentidos, força relativa e casas em que a relação ocorre.
- Verificar Saturno, Marte, Vênus e Júpiter quando aspectam/modificam Lua ou Mercúrio; registrar a qualidade que introduzem sem criar score.
- Quando pertinente, registrar natureza vocal/muda e modalidade dos signos; III ajuda a localizar comunicação/habilidades básicas, IX ajuda a localizar conhecimento superior.
- O Sol pode entrar como princípio de luz/inteligência em nível diferente de Mercúrio; não transformar isso em ranking de QI.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo específico verificado no corpus atual.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Ler Mercúrio.
2. Ler Lua.
3. Ler a relação Lua–Mercúrio.
4. Adicionar modificadores planetários e estelares.
5. Confrontar III/IX quando a pergunta for habilidade de comunicação versus conhecimento superior.
6. Produzir arquitetura mental, não nota de inteligência.

### Campos mínimos de saída
```text
mercuryAttentionMode
mercuryExpressionMode
moonSpontaneousMind
moonMercuryRelation
mentalModifiers
communicationIndicators
higherKnowledgeIndicators
intelligenceLevel="NOT_CALCULATED"
```

### Proibições
- Mercúrio dignificado ≠ gênio.
- Mercúrio debilitado ≠ estupidez.
- Não transformar signos em tipos psicológicos autônomos.

**Base documental:** M-TX - material de mentalidade 2026; M-BK - faculdades da alma e elementos; M-OP.

## 10. Mentalidade - complemento Frawley

**Pergunta:** Que condições tradicionais adicionais qualificam a eficiência, rigor e manifestação da mente?

### Marcos — olhar obrigatoriamente
- Nenhum núcleo específico adicional além do dossiê universal.

### Frawley — acrescentar somente o verificado
- Começar pela relação Lua–Mercúrio: um aspecto favorável é um testemunho positivo no exemplo publicado, mas não é suficiente sozinho.
- Comparar dignidade essencial de Lua e Mercúrio para ver qual parceiro domina e de que modo.
- Registrar angularidade/proximidade de cúspide e velocidade dos dois.
- Registrar signo vocal/mudo quando o tema é expressão/loquacidade.
- Verificar Saturno para esforço, contração, disciplina ou limitação; Marte para agressividade/conflito; demais planetas conforme seus aspectos/relações.
- Ler recepções: elas qualificam como os componentes da mente se estimam/rejeitam e podem alterar o uso do aspecto.
- Ler estrelas fixas sobre Lua/Mercúrio quando realmente próximas e relevantes.
- Localizar a conjunção/aspecto perto de uma cúspide para saber onde a mente procura manifestar-se.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Usar o exemplo como matriz qualitativa, não como fórmula de pontos.
2. Confrontar cada testemunho com os demais; não declarar capacidade mental por uma única condição.

### Campos mínimos de saída
```text
moonMercuryAspectQuality
relativeEssentialStrength
angularity
speed
voiceQuality
saturnMarsModifiers
receptions
fixedStars
cuspContext
```

### Proibições
- Não importar frases específicas do exemplo (“história vs aritmética”) como significados universais.
- Não converter os fatores em score de inteligência.

**Base documental:** F-APP p. 185.

## 11. Mentalidade - suplemento Gugu

**Pergunta:** Que segunda camada deve ser calculada quando se deseja aplicar o corpus atribuído a Gugu?

### Marcos — olhar obrigatoriamente
- Nenhum núcleo específico adicional além do dossiê universal.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo específico verificado no corpus atual.

### Gugu — suplemento
- Almuten do grau da Lua e almuten do grau de Mercúrio, mantendo a proveniência Gugu e sem confundi-los com o Senhor da Natividade.
- Predominância cardinal/fixa/mutável entre os significadores mentais relevantes.
- Orientalidade/ocidentalidade dos significadores e sua proximidade do MC ou do IC.
- “Lugares próprios” dos planetas em relação aos luminares, conforme a tabela preservada na fonte secundária.
- Condição do Sol.
- Condição do regente do Ascendente.
- Planetas no Ascendente somente quando excepcionalmente fortes/fracos e, portanto, capazes de marcar a estrutura.
- Relação Lua–Nodos segundo a regra secundária; se a fonte não fornece orbe inequívoco, entregar a distância bruta e não inventar corte.

### Ordem de decisão
1. Calcular a camada Gugu separadamente.
2. Compará-la à leitura Marcos/Frawley apenas depois de ambas estarem completas.
3. Quando divergir, manter as duas saídas e a proveniência.

### Campos mínimos de saída
```text
moonAlmuten
mercuryAlmuten
modalityBalance
orientationMCIC
properPlaces
sunCondition
ascRulerCondition
ascExceptionalPlanets
moonNodeGeometry
sourceTier="G-TX"
```

### Proibições
- Não chamar essa camada de Marcos.
- Não inventar limiares ausentes do corpus secundário.

**Base documental:** G-TX - compilação secundária descrita no checkpoint de 27/08/2026.

## 12. Constituição geral, corpo e presença

**Pergunta:** Como o radical descreve a constituição corporal geral e a presença do nativo, sem prometer medidas físicas exatas?

### Marcos — olhar obrigatoriamente
- Casa I e cúspide do Ascendente.
- Regente da I com dossiê integral.
- Planetas sobre o Ascendente pela regra de cúspide de Marcos; planeta em signo anterior não é promovido à cúspide.
- Estrelas fixas sobre ASC e regente I somente quando estreitas/relevantes.
- Temperamento como pano de fundo constitucional.
- Senhor da Natividade apenas como componente de temperamento/melhores qualidades, não como corpo inteiro.
- Aspectos e recepções do regente I para ver como o corpo/nativo se relaciona com outras circunstâncias.
- O mapa inteiro representa a pessoa em um nível; I/regente I representam mais especificamente o corpo e o próprio nativo em outro nível.

### Frawley — acrescentar somente o verificado
- Frawley também começa a caracterização ampla pelo Ascendente/regente e pelo temperamento; usar como reforço metodológico, sem importar “sun-sign personality”.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Ler I/ASC.
2. Ler regente I.
3. Adicionar planetas/estrelas realmente colados ao ASC.
4. Integrar temperamento.
5. Limitar a conclusão ao nível de generalidade que o natal suporta.

### Campos mínimos de saída
```text
constitution
bodilyStrengthWeakness
ascModifiers
temperamentContext
uncertainty
```

### Proibições
- Não inferir altura, peso, cicatrizes ou medidas corporais inevitáveis sem convergência técnica específica e contextual.

**Base documental:** M-BK Casa I; M-TX - limites do natal.

## 13. Saúde geral e predisposição a doenças

**Pergunta:** Quais predisposições humorais e vulnerabilidades gerais o radical sugere?

### Marcos — olhar obrigatoriamente
- Começar pelo temperamento - no exemplo médico natal de Marcos, ele é a primeira etapa.
- Casa I/regente I = corpo e saúde geral.
- Casa VI/regente VI = doenças e acidentes; VI não é “casa da saúde”.
- Inspecionar o mapa inteiro quando a pergunta é médica: Marcos ressalta que, em astrologia médica, pessoa e doenças não se reduzem à VI.
- Cruzar humores predominantes com órgãos/partes corporais correspondentes apenas para reduzir hipóteses, não para diagnosticar automaticamente.
- Verificar aflições/apoios a regente I, regente VI e ao significador do órgão/parte do corpo em questão.
- Estrelas fixas só entram se fizerem sentido com o órgão/tema e estiverem ligadas ao ponto pertinente; não procurar estrelas mórbidas aleatoriamente.
- Usar condição essencial/acidental, dispositor, aspectos, recepções, cúspides e nodos dos significadores envolvidos.
- Separar predisposição radical de ativação temporal.

### Frawley — acrescentar somente o verificado
- Frawley: temperamento e condição dos significadores oferecem contexto de força/fragilidade; decumbiture é técnica de um episódio de doença, não deve ser fingida como simples natal.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Temperamento.
2. I/regente I.
3. VI/regente VI.
4. Localização corporal.
5. Aflições/modificadores.
6. Convergência.
7. Somente então descrever predisposição.

### Campos mínimos de saída
```text
humoralPredisposition
generalHealthIndicators
diseaseIndicators
organLocalization
supportingAfflictions
fixedStarEvidence
temporalActivationNeeded
```

### Proibições
- O natal não fornece lista 100% precisa de todas as doenças da vida.
- Não emitir diagnóstico médico real a partir do mapa.
- Não tratar VI como emprego/rotina.

**Base documental:** M-BK Casas I e VI; M-TX - exemplo natal médico de Bento XVI; F-SYL - decumbiture separado do natal.

## 14. Localização corporal de uma vulnerabilidade

**Pergunta:** Se há um problema de saúde, em qual parte do corpo a técnica manda procurar convergência?

### Marcos — olhar obrigatoriamente
- Identificar a casa corporal correspondente no esquema de Marcos e seu regente/planetas associados.
- Mapa mínimo de casas: I cabeça/corpo geral; II pescoço/garganta/boca; III mãos/braços/ombros; IV peito/pulmões; V coração/fígado/estômago/costas/laterais; VIII sistema excretor/ânus; X joelhos; XI canelas; XII pés. Para as demais correspondências, usar somente o que estiver explicitamente presente no corpus médico adotado.
- Cruzar o significador corporal com I e VI.
- Exigir uma ligação real: aspecto, conjunção de cúspide, dispositor, estrela coerente ou outra convergência tecnicamente documentada.
- Se a localização não fecha, não completar por uma tabela externa sem marcar a fonte como contexto tradicional separado.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo específico verificado no corpus atual.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Escolher parte corporal.
2. Identificar casa/significador correspondente.
3. Comparar com I/VI.
4. Buscar aflição/modificação convergente.
5. Retornar nível de confiança e lacunas.

### Campos mínimos de saída
```text
bodyPart
house
significator
linkToI
linkToVI
modifiers
confidence
```

### Proibições
- Não usar correspondências modernas signo=órgão como substituto automático das casas.

**Base documental:** M-BK Casas I-XII; M-TX - medicina.

## 15. Acidentes e lesões

**Pergunta:** Há predisposição a acidentes ou dano corporal e por quais canais?

### Marcos — olhar obrigatoriamente
- VI/regente VI, porque Marcos inclui acidentes entre os infortúnios externos da VI.
- I/regente I para ver quem recebe o dano.
- Marte/Saturno somente quando efetivamente ligados como agentes/modificadores, não porque sejam “maléficos” abstratamente.
- Planetas em/na cúspide da VI ou I, estrelas e nodos realmente ligados aos significadores.
- Casa do contexto material do acidente quando conhecida (ex.: viagem, trabalho, animal), usando roteamento de casas; não inventar o cenário antes de existir contexto.
- Para quando, exigir técnica temporal que ative promessa radical.

### Frawley — acrescentar somente o verificado
- Frawley: acidentes entram no julgamento da casa/planeta pertinente; condição e aspecto mostram capacidade e ocasião. Nenhum algoritmo natal separado adicional foi verificado no corpus fornecido.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Ver se há promessa radical.
2. Identificar agente e receptor.
3. Localizar área da vida.
4. Só depois usar tempo.

### Campos mínimos de saída
```text
accidentPredisposition
agents
bodilyReceiver
contextHouse
radicalPromise
timingNeeded
```

### Proibições
- Não predizer acidente específico só porque Marte/Saturno tocam I ou VI.

**Base documental:** M-BK Casa VI; M-OP.

## 16. Sofrimento psíquico, vícios e autossabotagem

**Pergunta:** Quais padrões de autossabotagem/restrição aparecem, sem converter o mapa em diagnóstico psiquiátrico?

### Marcos — olhar obrigatoriamente
- XII/regente XII para vícios, pecado, autossabotagem, inimigos ocultos e restrições geradas/sofridas de modo oculto.
- I/regente I para o nativo e sua capacidade de responder.
- VI para males externos/aflições que não nascem da própria ação; não misturar VI e XII.
- Planetas na XII e sua condição; Saturno tem júbilo na XII, mas o júbilo é um testemunho qualitativo e não “torna a casa boa”.
- Aspectos e recepções ligando XII a I, Lua/Mercúrio ou outros significadores mentais quando a pergunta for psíquica.
- Quando o tema for mentalidade, voltar ao protocolo Lua–Mercúrio antes de atribuir qualquer dificuldade a XII.

### Frawley — acrescentar somente o verificado
- Frawley reconhece a grande dificuldade de planetas na XII agirem salvo circunstância específica como aspecto estreito/recepção; usar como qualificação, não como diagnóstico.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Separar mente (Lua/Mercúrio) de autossabotagem (XII).
2. Identificar se o problema é externo VI ou interno/oculto XII.
3. Procurar ligações reais a I e aos significadores mentais.

### Campos mínimos de saída
```text
selfUndoingIndicators
hiddenRestrictions
linksToMind
linksToBody
counterTestimonies
```

### Proibições
- Não diagnosticar transtorno mental.
- Não chamar XII de “casa da espiritualidade”.
- Não chamar hospital de XII no modo Marcos.

**Base documental:** M-BK Casa XII; F-APP Casa XII, pp. 104-105 aproximadamente.

## 17. Vitalidade, longevidade e morte - Frawley atual

**Pergunta:** Quais significadores atuais de Frawley devem ser calculados para avaliar vitalidade e, em trabalho preditivo especializado, longevidade?

### Marcos — olhar obrigatoriamente
- VIII/regente VIII permanece a casa radical da morte no eixo Marcos; não transformar morte em “transformação psicológica”.

### Frawley — acrescentar somente o verificado
- Hyleg: só Sol ou Lua. Casas hilegíacas atuais: I, VII, IX, X, XI; planeta a cerca de 5° antes da cúspide conta na casa seguinte se estiver no mesmo signo.
- Ordem diurna: Sol; se não servir, Lua. Ordem noturna: Lua; se não servir, Sol. Se nenhum servir, não há Hyleg oficial.
- Crepúsculo: Frawley permite “alguns graus” de luz antes/depois do nascer/pôr, sem número universal; não inventar corte.
- Anareta: primeira escolha é planeta na VIII. Se houver mais de um, selecionar como oficial o que estiver mais perto da cúspide VIII; os demais continuam potenciais agentes de morte. Se VIII vazia, usar regente VIII desde que não seja Hyleg. Hyleg não pode ser Anareta oficial.
- Alcochoden: se existe Hyleg, usar o dispositor por domicílio do Hyleg. Frawley atual rejeita o almuten aditivo para essa função.
- Não calcular “anos exatos de vida” pelo Alcochoden. Frawley atual insiste que precisão de longevidade exige combinação de técnicas; Hyleg/Anareta/Alcochoden são primeiros entre iguais, não mágicos.
- Na avaliação ampla de vida, conservar também luminária do tempo, outra luminária, ASC e regente ASC como significadores vitais.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Calcular secta/crepúsculo.
2. Selecionar Hyleg pela ordem atual.
3. Selecionar Anareta.
4. Selecionar Alcochoden.
5. Guardar outros significadores vitais.
6. Só depois, em módulo preditivo específico, aplicar múltiplas técnicas temporais.

### Campos mínimos de saída
```text
hyleg
anareta
alcochoden
lightOfTime
otherLight
ascendant
ascRuler
twilightAmbiguity
predictionRequiresMultiTechnique
```

### Proibições
- Não dar idade de morte por aritmética simples.
- Não psicologizar Hyleg/Anareta/Alcochoden.
- Não fabricar Hyleg/Anareta quando regras falham.

**Base documental:** M-BK Casa VIII; F-CUR - Conversations on Natal Astrology, 2; F-SYL.

## 18. Dinheiro e recursos próprios

**Pergunta:** Como julgar a condição financeira básica do nativo?

### Marcos — olhar obrigatoriamente
- II e regente II: núcleo de finanças, dinheiro e bens móveis do próprio nativo.
- Planetas na II ou sobre a cúspide: qualificar segundo natureza, condição e casas que regem.
- Casa onde está regente II: mostra por qual área/atores os recursos se conectam; não ler isso sem verificar as regências e o contexto.
- Júpiter como co-significador natural da II/riqueza.
- Fortuna somente quando estiver ativa no filtro Marcos: conjunção/oposição relevante, contato de cúspide, antíscio pertinente ou dispositor envolvido no assunto.
- Dispositor da Fortuna e sua condição integral.
- Recepções e aspectos entre regente II, I e significadores das fontes/drenos de dinheiro.

### Frawley — acrescentar somente o verificado
- Frawley, no exemplo natal, inspeciona II, planetas na II, regente II, Júpiter como significador natural da riqueza e Parte da Fortuna/dispositor.
- Benefício/dano de planeta na II depende de sua natureza e das casas que rege; não aplicar “benéfico=dinheiro / maléfico=pobreza” mecanicamente.
- Usar casas derivadas para identificar de quem vem o dinheiro (pais, irmãos, esposa etc.).

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. II/regente.
2. Planetas na II/cúspide.
3. Júpiter.
4. Fortuna se ativa.
5. Fontes e drenos por casas derivadas.
6. Convergência e contradições.

### Campos mínimos de saída
```text
financialCapacity
incomeSources
resourceStability
drains
fortuneEvidence
derivedHouseLinks
```

### Proibições
- Não confundir II com salário especificamente - salário é XI no esquema Marcos.
- Não confundir II com dinheiro do cônjuge - isso é VIII/2ª da VII.

**Base documental:** M-BK Casa II; M-TX Partes; F-APP p. 187.

## 19. Salário, remuneração e benefícios do trabalho

**Pergunta:** O que a IA deve olhar quando a pergunta é salário/remuneração, e não riqueza genérica?

### Marcos — olhar obrigatoriamente
- XI, por ser II a partir da X: “dinheiro do emprego/patrão”.
- Regente XI e sua condição integral.
- Relação entre XI/regente XI e I/regente I.
- X/regente X para a atividade profissional que gera o salário.
- II/regente II para integrar o salário ao patrimônio total.
- Planetas/cúspides/recepções que conectam X→XI→II.

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal adicional específico de salário foi verificado além do princípio casa-por-casa/derivações.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. X = trabalho.
2. XI = remuneração desse trabalho.
3. II = patrimônio próprio depois de recebido.
4. Ler conexões entre os três.

### Campos mínimos de saída
```text
careerIncome
salaryHouse
salaryRuler
careerLink
netResourceLink
```

### Proibições
- Não chamar VI de “casa do trabalho”.

**Base documental:** M-BK Casa XI; M-BK Casa X.

## 20. Heranças e dinheiro de mortos

**Pergunta:** Como distinguir herança em geral de uma herança proveniente de pessoa determinada?

### Marcos — olhar obrigatoriamente
- VIII pode significar heranças/dinheiro de mortos em geral.
- Quando a herança é de uma pessoa determinada, usar a II derivada da casa dessa pessoa - as posses dela - e documentar a derivação.
- Relação desse regente com I/regente I: capacidade de os recursos chegarem ao nativo.
- Aspectos = oportunidade; recepções = inclinação/interesse dos agentes; não fundir.
- II radical mostra o efeito sobre o patrimônio do nativo.

### Frawley — acrescentar somente o verificado
- Aplicar o mesmo princípio Frawley de dinheiro como segunda casa da pessoa/ator relevante; o contexto define qual dinheiro está sendo julgado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Identificar de quem vem a herança.
2. Derivar a II dessa pessoa.
3. Julgar regente derivado e ligação com I.
4. Integrar à II radical.

### Campos mínimos de saída
```text
inheritanceSource
derivedMoneyHouse
derivedMoneyRuler
linkToNative
impactOnOwnResources
```

### Proibições
- Não usar VIII radical automaticamente para toda herança específica.

**Base documental:** M-BK Casa VIII; F-APP - uso contextual de casas derivadas.

## 21. Dinheiro do cônjuge, parceiro, cliente ou “outro”

**Pergunta:** Como julgar recursos pertencentes à pessoa da VII?

### Marcos — olhar obrigatoriamente
- VII = o outro específico; VIII = II a partir da VII, portanto recursos desse outro.
- Regente VII descreve o outro; regente VIII, seus recursos.
- Comparar recepção/aspectos entre regente VII, regente VIII e regente I conforme a pergunta.
- Se o “outro” não for VII por contexto, derivar a II a partir da casa correta desse ator.

### Frawley — acrescentar somente o verificado
- Frawley usa explicitamente a VIII como dinheiro do público/outros quando VII representa o público, mostrando que o significado deriva do ator do contexto.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Identificar o ator.
2. Escolher casa do ator.
3. Tomar a II derivada.
4. Julgar recurso e ligação com nativo.

### Campos mínimos de saída
```text
otherPersonHouse
otherMoneyHouse
resourceRuler
linkToNative
```

### Proibições
- Não chamar VIII “dinheiro compartilhado” de modo vago; dizer de quem é o dinheiro.

**Base documental:** M-BK Casa VIII; F-APP pp. 181-182.

## 22. Imóveis, terra, casa e patrimônio imóvel

**Pergunta:** Como julgar raízes e bens imóveis?

### Marcos — olhar obrigatoriamente
- IV e regente IV: terrenos, casas, prédios, fazendas, propriedades, raízes e fundações.
- Planetas na IV/cúspide e condição do regente IV.
- II para recursos móveis usados na aquisição/manutenção; X pode representar preço em questões específicas de compra/venda segundo Marcos, mas não deve substituir IV no natal.
- I pode significar “meu lar” quando não há necessidade de separar pessoa e casa; quando o assunto é propriedade como objeto, usar IV.
- Aspectos/recepções entre I/II/IV conforme a pergunta.

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal imobiliário adicional específico foi verificado no corpus Frawley fornecido.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Definir se “lar” é extensão do nativo (I) ou propriedade/terra (IV).
2. Julgar IV/regente.
3. Conectar II se a pergunta for patrimônio financeiro.

### Campos mínimos de saída
```text
propertyCondition
roots
acquisitionCapacity
linksToResources
```

### Proibições
- Não fundir I e IV sem declarar por que cada uma é usada.

**Base documental:** M-BK Casa IV; M-BK Casa I.

## 23. Loteria, ganhos “do alto” e apoios inesperados

**Pergunta:** Onde procurar dinheiro que não vem do trabalho ordinário?

### Marcos — olhar obrigatoriamente
- XI: Marcos a identifica como casa relevante em loteria e bênçãos/benefícios que vêm do alto.
- Regente XI, planetas/cúspide, Júpiter em júbilo e condição dos significadores.
- II para verificar se o ganho se integra aos recursos próprios.
- Fortuna apenas quando ativa e tecnicamente envolvida.
- Evitar prometer prêmio específico sem técnica temporal e convergência forte.

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal adicional de loteria foi verificado no corpus Frawley usado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. XI.
2. II.
3. Fortuna se ativa.
4. Técnicas temporais apenas se houver promessa radical.

### Campos mínimos de saída
```text
windfallPotential
supportChannels
resourceIntegration
timingRequired
```

### Proibições
- Não transformar Júpiter na XI ou Fortuna em “vai ganhar loteria”.

**Base documental:** M-BK Casa XI; M-TX Partes.

## 24. Empréstimos, bancos, contratos financeiros

**Pergunta:** Como rotear um banco/empréstimo sem misturar dinheiro próprio e dinheiro do outro?

### Marcos — olhar obrigatoriamente
- VII pode representar banco/parceiro contratual como “outro”.
- VIII = dinheiro/recursos desse outro quando VII é o banco.
- II = dinheiro/recursos do próprio nativo.
- Regentes I, VII, II, VIII e relações entre eles.
- Recepção mostra interesse/disposição; aspecto mostra oportunidade de contratação/movimento de recursos.
- No natal, isso fornece padrão/capacidade; contrato concreto pertence melhor a horária/eleição ou a técnica temporal apropriada.

### Frawley — acrescentar somente o verificado
- Frawley usa casas derivadas e VII para “outros” em questões financeiras; aplicar apenas como gramática, não como previsão de um contrato inexistente.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. I/II.
2. VII/VIII.
3. Relações entre os pares.
4. Contextualizar como tendência natal, não evento concreto.

### Campos mínimos de saída
```text
ownResources
bankActor
bankResources
contractOpportunity
receptionInterest
```

### Proibições
- Não confundir recepção com aprovação automática de crédito.

**Base documental:** M-BK Casas II, VII, VIII; F-APP pp. 181-182.

## 25. Romance, prazer e sexualidade

**Pergunta:** Como distinguir prazer/erotismo de parceria afetiva concreta?

### Marcos — olhar obrigatoriamente
- V = prazer, erotismo/sexo enquanto prazer, diversão, romances enquanto experiência prazerosa.
- Regente V e sua condição; planetas na V/cúspide; Vênus co-significadora e em júbilo, sem substituir regente V.
- VII = a outra pessoa quando há namorado, amante, pretendente, noivo ou cônjuge específico.
- Se a pergunta é “como vive o prazer”, focar V; se é “como se vincula a parceiros”, focar I–VII; se os dois importam, analisar ambos e a conexão entre eles.
- Parte do Amor apenas quando ativa pelo filtro de Partes.

### Frawley — acrescentar somente o verificado
- Frawley: usar condição da casa e do regente, mais relações com os significadores pessoais; nenhum algoritmo natal separado de “romance” foi verificado no exemplo fornecido.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Definir se a pergunta é prazer (V), parceiro (VII) ou ambos.
2. Julgar casas/regentes separadamente.
3. Conectar apenas se houver relação real.

### Campos mínimos de saída
```text
pleasureStyle
eroticPattern
partnerLink
lovePartEvidence
```

### Proibições
- VIII não é sexo no método Marcos.

**Base documental:** M-BK Casas V, VII, VIII; M-TX relacionamento.

## 26. Casamento, parceria e padrão relacional - Marcos

**Pergunta:** Que padrão geral de relação entre o nativo e parceiros o radical contém?

### Marcos — olhar obrigatoriamente
- Regente I = nativo.
- Regente VII = parceiro/outro.
- Dossiê integral de ambos: dignidades, debilidades, condição acidental, casa, velocidade, condição solar, dispositor, estrelas, aspectos.
- Recepção I→VII e VII→I separadamente: quem quer/estima/rejeita quem e em qual dignidade.
- Aspecto I–VII: existe oportunidade de conexão? É aplicação ou separação? Pode aperfeiçoar?
- Cúspides I e VII: planetas colados, aflições, estrelas e nodos.
- Planetas terceiros interferindo em I–VII.
- Casa V somente se a pergunta inclui prazer/sexualidade; Parte do Amor apenas se ativa.
- Usar o resultado para padrões gerais, linhas de falha, facilidade/dificuldade estrutural e importância do tema - não para descrever um cônjuge inevitável.

### Frawley — acrescentar somente o verificado
- Frawley reforça a gramática: dignidade = capacidade; recepção = interesse; aspecto = oportunidade. Aplicar a casa VII e seu regente pelo mesmo método casa-a-casa.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Ler I.
2. Ler VII.
3. Recepções nos dois sentidos.
4. Aspecto/perfeição.
5. Cúspides e modificadores.
6. V/Parte Amor se pertinente.
7. Sintetizar padrão, não profecia de parceiro.

### Campos mínimos de saída
```text
nativeSignificator
partnerSignificator
receptionNativeToPartner
receptionPartnerToNative
aspectOpportunity
perfection
cuspEvidence
thirdPartyInterference
relationshipPattern
```

### Proibições
- Recepção sem aspecto ≠ relação realizada.
- Aspecto sem recepção ≠ amor.
- Não predizer aparência/identidade de parceiro específico pelo radical.

**Base documental:** M-TX - algoritmo I×VII; M-BK Casa VII; F-OP.

## 27. Filhos, fertilidade e gravidez

**Pergunta:** Quais testemunhos sustentam ou enfraquecem fertilidade/filhos no radical?

### Marcos — olhar obrigatoriamente
- V e regente V.
- Signo na cúspide V apenas como um testemunho de fertilidade/esterilidade; não decidir sozinho.
- Lua como significadora natural da procriação; condição, fase, velocidade, dignidades, casa e aspectos.
- Júpiter como testemunho de fertilidade/expansão quando tecnicamente ligado.
- Parte dos Filhos quando calculada no método adotado: ponto passivo, com dispositor e contatos.
- Relação de V/regente V com I e VII quando a pergunta é sobre o nativo e o outro progenitor.
- Planetas/estrelas/nodos sobre V ou regente V quando relevantes.

### Frawley — acrescentar somente o verificado
- Frawley, no exemplo natal, combina: cúspide V fértil/estéril; regente V; Lua; signo fértil; angularidade; velocidade; luz lunar no exemplo; aspecto de Júpiter; Marte como testemunho contrário; Parte dos Filhos e seu dispositor.
- O exemplo mostra que um testemunho “barren” isolado pode ser superado por conjunto forte em sentido contrário; portanto não contar fatores mecanicamente.
- Frawley chega a estimativas de número/sexo no exemplo, mas o protocolo MathAstro deve separar isso como técnica histórica/alta incerteza e nunca como inevitabilidade.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. V/regente.
2. Lua.
3. Júpiter.
4. Parte dos Filhos.
5. Condições e relações.
6. Convergência contra/afavor.
7. Se houver tempo, só então ativação temporal.

### Campos mínimos de saída
```text
fertilityTestimoniesFor
fertilityTestimoniesAgainst
childrenSignificators
partOfChildren
parentChildRelation
uncertainty
```

### Proibições
- Não concluir infertilidade por um único signo.
- Não prometer número/sexo inevitável de filhos.

**Base documental:** M-BK Casa V; F-APP pp. 186-187.

## 28. Pai, raízes e ancestralidade

**Pergunta:** Como julgar o pai e as raízes no método Marcos?

### Marcos — olhar obrigatoriamente
- IV e regente IV.
- Planetas na IV/cúspide, estrelas/nodos pertinentes.
- Sol como co-significador natural da IV no esquema exposto por Marcos, sem substituir regente IV.
- Relação entre regente IV e regente I para o padrão pai–nativo.
- Recepções em ambas as direções e aspectos/oportunidades.
- IV também contém ancestrais, raízes, terra natal e patrimônio imóvel; separar esses subtemas pelo contexto.

### Frawley — acrescentar somente o verificado
- No exemplo Frawley, IV é usado como pai; relações do regente IV com Fortuna/II podem mostrar dinheiro familiar.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. IV/regente.
2. I/regente.
3. Recepções.
4. Aspecto.
5. Modificadores.
6. Contexto específico: pai, raízes ou imóvel.

### Campos mínimos de saída
```text
fatherSignificator
fatherCondition
nativeFatherReception
nativeFatherAspect
rootsContext
```

### Proibições
- Não trocar pai e mãe segundo convenções modernas: no eixo Marcos aqui, IV = pai e X = mãe.

**Base documental:** M-BK Casa IV; F-APP p. 187.

## 29. Mãe

**Pergunta:** Como julgar a mãe no eixo Marcos?

### Marcos — olhar obrigatoriamente
- X e regente X, porque Marcos põe a mãe na casa oposta à IV.
- Planetas na X/cúspide e seus modificadores.
- Relação entre regente X e regente I, com recepções e aspectos.
- Separar o papel “mãe” de profissão/autoridade, que também pertencem à X; o contexto decide qual significado está ativo.

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal materno adicional específico foi verificado no corpus Frawley fornecido.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. X/regente como mãe.
2. I/regente.
3. Recepções/aspectos.
4. Separar de carreira/autoridade.

### Campos mínimos de saída
```text
motherSignificator
motherCondition
nativeMotherRelation
contextDisambiguation
```

### Proibições
- Não atribuir Lua automaticamente à mãe como substituto da X no método Marcos.

**Base documental:** M-BK Casa X.

## 30. Irmãos, primos, vizinhos e pares cotidianos

**Pergunta:** Como julgar irmãos e relações com pares próximos?

### Marcos — olhar obrigatoriamente
- III e regente III.
- Planetas/cúspide da III.
- Marte como co-significador natural da III; Lua em júbilo na III; usar como testemunhos secundários.
- Relação regente III ↔ regente I: aspectos, recepções, casas e dispositores.
- Se a pergunta for dinheiro de irmão, usar II derivada da III; se for filho do irmão, V derivada da III etc.
- III também governa vizinhos/colegas de mesma hierarquia e rotina; contexto deve escolher a pessoa concreta.

### Frawley — acrescentar somente o verificado
- Frawley usa casas derivadas e Marte como natural ruler of brothers no exemplo financeiro; usar apenas quando o contexto é irmão.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. III/regente.
2. I/regente.
3. Derivar subtema se necessário.
4. Identificar qual relação de III está em jogo.

### Campos mínimos de saída
```text
siblingsPattern
peerRelations
derivedSubtopic
receptions
aspects
```

### Proibições
- Não assumir que todo planeta na III “é um irmão”.

**Base documental:** M-BK Casa III; F-APP p. 187.

## 31. Amigos, benfeitores, esperanças e apoios

**Pergunta:** Quais relações de amizade real/benefício entram na XI?

### Marcos — olhar obrigatoriamente
- XI e regente XI.
- Planetas na XI/cúspide.
- Sol como co-significador; Júpiter em júbilo.
- Relação XI ↔ I para capacidade de receber/oferecer apoio.
- Distinguir amigo real (quem está disposto a perder algo pelo nativo) de colega/contato casual, que pode cair em III/VII conforme contexto.
- Esperanças e desejos também são XI, mas sonhos durante o sono são IX.

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal adicional específico de amizade foi verificado no corpus Frawley fornecido.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Definir se é amigo, esperança, salário ou autorização - todos podem usar XI por razões diferentes.
2. Ler XI/regente e ligação com I.

### Campos mínimos de saída
```text
friendSupport
hopes
benefactors
contextSubtype
```

### Proibições
- Não tratar contatos sociais genéricos como amigos XI automaticamente.

**Base documental:** M-BK Casa XI.

## 32. Inimigos declarados, concorrentes e oposição

**Pergunta:** Como julgar padrão de confronto com o “outro” que se opõe abertamente?

### Marcos — olhar obrigatoriamente
- VII e regente VII para inimigos declarados/concorrentes/oponentes.
- I/regente I para o nativo.
- Estado integral de ambos e relações entre eles.
- Recepção pode mostrar interesse/hostilidade; aspecto mostra ocasião de confronto.
- Planetas terceiros, casas derivadas e contexto definem natureza do conflito.
- X pode significar juiz/autoridade em litígio; II pode representar advogado/preposto segundo o contexto específico de Marcos.

### Frawley — acrescentar somente o verificado
- Frawley: aplicar gramática horária/natal de casa I × VII apenas quando o tema concreto justifica; no radical, interpretar como padrão de confronto, não litígio inevitável.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. I.
2. VII.
3. autoridade/segundos se contexto jurídico.
4. recepções/aspectos.
5. limitar à promessa natal.

### Campos mínimos de saída
```text
conflictPattern
opponentCondition
nativeOpponentRelation
authorityContext
```

### Proibições
- Não predizer inimigo concreto inexistente.

**Base documental:** M-BK Casa VII; M-BK Casa X/II.

## 33. Inimigos ocultos, confinamentos e restrições

**Pergunta:** Como julgar aquilo que age contra o nativo de modo oculto/restritivo?

### Marcos — olhar obrigatoriamente
- XII e regente XII.
- Planetas na XII e sua capacidade limitada de agir; observar exceções por aspectos/recepções fortes.
- I/regente I como receptor do dano/restrição.
- Distinguir inimigo oculto (XII) de inimigo declarado (VII). A classificação depende da natureza do ataque, não de sabermos o nome do agressor.
- Prisão/confinamento/restrição pertencem à XII; hospital não é XII no esquema Marcos.
- Vícios/autossabotagem também XII; separar agente externo oculto de comportamento do próprio nativo pelo contexto e por quem rege/ocupa a casa.

### Frawley — acrescentar somente o verificado
- Frawley: planetas na XII têm grande dificuldade de agir salvo ligações específicas; isso qualifica a potência do significador.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. XII/regente.
2. I/regente.
3. Definir tipo: inimigo oculto, confinamento ou vício.
4. Rastrear agente pelas regências.

### Campos mínimos de saída
```text
hiddenEnemyPattern
restrictionPattern
selfUndoingPattern
actorSource
```

### Proibições
- Não chamar XII de hospital ou espiritualidade.

**Base documental:** M-BK Casa XII; F-APP Casa XII.

## 34. Comunicação, leitura, escrita e habilidades intelectuais básicas

**Pergunta:** O que olhar para capacidade de comunicar e lidar com habilidades cognitivas básicas?

### Marcos — olhar obrigatoriamente
- III/regente III: comunicação e habilidades básicas como ler, escrever e falar.
- Mercúrio como significador de articulação/classificação, usando o protocolo mental completo.
- Relação III ↔ Mercúrio e III ↔ I.
- Lua em júbilo na III e Marte co-significador como testemunhos secundários, não regentes.
- Signos vocais/mudos apenas quando tecnicamente pertinentes, especialmente no complemento Frawley.
- IX deve ser separada quando o tema passa de comunicação básica para conhecimento/estudo superior.

### Frawley — acrescentar somente o verificado
- Frawley: signo vocal/mudo de Lua/Mercúrio e angularidade de Mercúrio podem qualificar expressão no exemplo natal.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. III/regente.
2. Mercúrio/Lua.
3. Vocalidade/modificadores.
4. Separar expressão (III) de conhecimento superior (IX).

### Campos mínimos de saída
```text
basicLearning
communicationStyle
speechWriting
mercuryIntegration
```

### Proibições
- Não usar III sozinha para medir inteligência global.

**Base documental:** M-BK Casa III; M-TX mentalidade; F-APP p. 185.

## 35. Rotina e atividades cotidianas

**Pergunta:** Qual casa governa a rotina segundo Marcos e o que a IA deve inspecionar?

### Marcos — olhar obrigatoriamente
- III é a casa da lida diária/rotina e deslocamentos quotidianos pelo critério de finalidade.
- Regente III, planetas na III e ligações a I.
- X é profissão/trabalho; VI são subordinados/doenças/pequenos animais. Não deslocar rotina para VI.
- Se a pergunta é “rotina do trabalho”, combinar III (rotina) com X (trabalho) e documentar essa combinação.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo natal específico verificado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. III.
2. Se rotina profissional, adicionar X.
3. Se rotina de saúde, adicionar I/VI conforme o tema - sem mudar o significado básico de III.

### Campos mínimos de saída
```text
dailyRoutine
workRoutineLink
habitContext
```

### Proibições
- VI não é rotina.

**Base documental:** M-BK Casa III; M-TX - “ROTINA: CASA 3; TRABALHO: CASA 10”.

## 36. Ensino superior, conhecimento, mestres e profissões eruditas como categoria

**Pergunta:** Como julgar relação do nativo com conhecimento superior?

### Marcos — olhar obrigatoriamente
- IX/regente IX.
- Planetas na IX/cúspide.
- Júpiter co-significador; Sol em júbilo na IX.
- Relação IX ↔ I e IX ↔ Mercúrio/Lua quando a pergunta é capacidade de estudo/conhecimento.
- III permanece a expressão básica/comunicação; IX é o assunto superior/conhecimento.
- Uma pessoa instruída (médico/professor/advogado/astrólogo) pode ser IX “em si”, mas numa relação concreta pode ser VII; a IA deve rotear pelo papel no contexto.

### Frawley — acrescentar somente o verificado
- Frawley: IX é primeira casa na análise de fé; para conhecimento superior, usar a mesma condição casa/regente e significadores naturais pertinentes.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. IX/regente.
2. I.
3. Mercúrio/Lua se cognitivo.
4. III se expressão.
5. Distinguir a pessoa instruída como categoria IX de sua função concreta VII.

### Campos mínimos de saída
```text
higherLearning
knowledgeOrientation
teacherScholarPattern
contextualRoleRouting
```

### Proibições
- Não chamar todo médico “casa IX” em qualquer contexto.

**Base documental:** M-BK Casa IX; F-APP p. 185-186.

## 37. Fé, religião e orientação espiritual

**Pergunta:** O que a IA deve examinar para a relação do nativo com fé/religião?

### Marcos — olhar obrigatoriamente
- IX e regente IX como núcleo.
- Planetas na IX/cúspide e sua condição.
- Júpiter como co-significador/natural significator da religião; Sol em júbilo na IX.
- Relação IX/regente IX com I/regente I: recepções, aspectos, dispositores.
- Lua/Sol quando realmente conectados; Partes e estrelas apenas se ativas/relevantes.
- XII não é casa de espiritualidade no método Marcos.

### Frawley — acrescentar somente o verificado
- No exemplo natal, Frawley olha primeiro IX; planeta na IX; regente IX; relação do regente IX com o Lord of Ascendant; Jupiter natural ruler of religion; aspectos de Lua/outros; Parte da Fortuna e Nodo Sul quando conectados; ausência/presença de recepção mútua.
- Ele usa essa camada para contextualizar o “nível” em que outras tendências são vividas, mas isso deve permanecer um julgamento de testemunhos, não uma nota moral automática.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. IX/regente.
2. Júpiter/Sol.
3. Relação com I.
4. Partes/nodos/estrelas se ativos.
5. Sintetizar conflitos/apoios.

### Campos mínimos de saída
```text
faithImportance
faithEaseDifficulty
nativeFaithReception
spiritualModifiers
uncertainty
```

### Proibições
- Não declarar santidade, condenação ou “nível espiritual” por um único aspecto.
- Não usar XII como substituto de IX.
- Não inferir vocação monástica inevitável.

**Base documental:** M-BK Casa IX; F-APP pp. 185-186; M-TX - limites de vocação espiritual.

## 38. Sonhos durante o sono

**Pergunta:** Como rotear o tema de sonhos literais?

### Marcos — olhar obrigatoriamente
- IX: Marcos coloca os sonhos que acontecem durante o sono nessa casa.
- Regente IX, planetas na IX e Lua quando a pergunta envolve imaginação/experiência onírica.
- III não é “sonho”; XI contém esperança/sonho no sentido de desejo futuro.

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal adicional específico verificado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. IX.
2. Lua se experiência imaginativa.
3. Distinguir sonho literal de esperança XI.

### Campos mínimos de saída
```text
dreamPattern
lunarLink
house9Condition
```

### Proibições
- Não confundir sonhos IX com esperanças XI.

**Base documental:** M-BK Casas IX e XI.

## 39. Viagens curtas/rotineiras e deslocamentos

**Pergunta:** Como decidir III versus IX para viagens?

### Marcos — olhar obrigatoriamente
- III = viagem curta no sentido funcional/quotidiano; a distância geográfica não é o único critério.
- IX = viagem longa no sentido de afastamento da rotina/peregrinação/viagem não quotidiana.
- Regente da casa escolhida, relação com I e significadores do transporte quando relevantes.
- Para capacidade de dirigir, Marcos associa a III por ligação com a condução do dia a dia.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo natal específico verificado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Classificar pela finalidade.
2. III ou IX.
3. Ler regente e relação com I.
4. Não decidir só por quilômetros.

### Campos mínimos de saída
```text
travelType
travelHouse
travelRuler
nativeTravelRelation
```

### Proibições
- Não usar regra rígida “até X km = III”.

**Base documental:** M-BK Casas III e IX.

## 40. Viagens longas, estrangeiro e peregrinação

**Pergunta:** Que indicadores usar para afastamentos longos/não quotidianos?

### Marcos — olhar obrigatoriamente
- IX/regente IX.
- Planetas na IX/cúspide.
- Relação com I/regente I.
- Júpiter/Sol como testemunhos secundários da IX.
- Contexto distingue viagem, estudo, fé ou pessoa instruída; a mesma IX não significa tudo ao mesmo tempo.

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal adicional específico verificado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. IX/regente.
2. I.
3. Contexto.
4. Ativação temporal se a pergunta for quando.

### Campos mínimos de saída
```text
longTravelPotential
foreignContext
pilgrimageStudyLink
```

### Proibições
- Não transformar qualquer planeta na IX em “morará no exterior”.

**Base documental:** M-BK Casa IX.

## 41. Profissão, habilidades e estilo de trabalho - Marcos

**Pergunta:** Quais capacidades e modos de atuação profissional o radical mostra?

### Marcos — olhar obrigatoriamente
- X e regente X: profissão, magistério, honra pública e agir no mundo.
- Planetas na X/cúspide e sua condição.
- Marte como co-significador natural da X - energia para defender o “pequeno império” - sem substituir regente X.
- Examinar dignidades, debilidades, condição acidental, casas, dispositores, recepções e aspectos dos significadores profissionais.
- Produzir dimensões funcionais antes de nome de profissão: nível de atividade; tolerância/preferência por rotina; pendor artístico; intelectual/prático; trabalhar sozinho/com pessoas; liderança; autonomia; estabilidade/variedade; famílias de habilidades.
- III pode informar rotina/habilidades básicas; IX, formação superior; II, recursos; XI, salário; I, capacidade do nativo. Usá-las como apoio contextual, não como substitutos da X.
- Confrontar a estrutura com opções profissionais reais fornecidas pelo usuário quando a pergunta for escolha de carreira.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo específico verificado no corpus atual.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. X/regente.
2. Planetas na X.
3. Extrair dimensões de capacidade/estilo.
4. Adicionar III/IX/I/II/XI somente pelo contexto.
5. Comparar com opções concretas.

### Campos mínimos de saída
```text
activityLevel
routineAffinity
artisticInclination
intellectualInclination
practicalInclination
solitaryVsSocial
leadership
autonomy
stabilityVsVariety
skillFamilies
```

### Proibições
- Não devolver “sua profissão é X” como destino inevitável.
- VI não é trabalho.

**Base documental:** M-BK Casa X; M-TX - profissão/capacidades; M-OP.

## 42. Profissão - complemento Frawley verificado

**Pergunta:** Quais significadores Frawley acrescenta de modo diretamente verificável no corpus?

### Marcos — olhar obrigatoriamente
- Nenhum núcleo específico adicional além do dossiê universal.

### Frawley — acrescentar somente o verificado
- Casa X.
- Regente da X.
- Planetas que caem na X.
- Mercúrio, Vênus e Marte como três significadores tradicionais adicionais de carreira/vocação.
- Julgar cada um por condição essencial e acidental, casa, aspectos, recepções, dispositores e signos pertinentes ao tipo de capacidade.
- Usar propriedades de signo quando diretamente relevantes: por exemplo, signos vocais podem qualificar significadores de vocação em temas de voz/canto.
- Não atribuir a Frawley, no corpus fornecido, a regra do “planeta que nasce imediatamente antes do Sol” como procedimento natal canônico: a busca direta não a confirmou para carreira.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Montar conjunto {X, regente X, planetas X, Mercúrio, Vênus, Marte}.
2. Qualificar todos.
3. Comparar com estilo Marcos.
4. Se houver conflito, preservar proveniência.

### Campos mínimos de saída
```text
house10
house10Ruler
planetsIn10
mercury
venus
mars
capacityComparison
```

### Proibições
- Não inventar ranking por soma essentialScore+accidentalScore.
- Não atribuir técnica não localizada ao autor.

**Base documental:** F-APP p. 104 e método natal pp. 182-188.

## 43. Honra, autoridade, chefes e posição pública

**Pergunta:** Como julgar a relação com poder/autoridade e visibilidade pública?

### Marcos — olhar obrigatoriamente
- X/regente X.
- Planetas no MC/cúspide X e estrelas fixas estreitas no MC.
- I/regente I para a capacidade pessoal de ocupar/responder a autoridade.
- Relações X↔I, recepções e aspectos.
- Se a pergunta for sobre chefe concreto, X pode significá-lo; se sobre carreira do nativo, X é a carreira/posição.
- Estrelas não “dão fama” sozinhas: qualificam o ponto/planeta que tocam.

### Frawley — acrescentar somente o verificado
- Frawley atribui grande relevância a estrelas fixas em ângulos/luminares em Natal, sobretudo para acontecimentos maiores/notabilidade; integrar sem determinismo.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. X/MC.
2. Regente X.
3. I.
4. Estrelas/planetas angulares.
5. Contexto autoridade vs carreira.

### Campos mínimos de saída
```text
publicStatus
authorityPattern
mcEvidence
fixedStarProminence
```

### Proibições
- Não inferir cargo exato ou fama mundial por uma única estrela.

**Base documental:** M-BK Casa X; F-APP - estrelas fixas/natal.

## 44. Fama e notabilidade - suplemento Frawley

**Pergunta:** O que olhar quando a pergunta é notabilidade histórica, não apenas carreira?

### Marcos — olhar obrigatoriamente
- X/MC, luminares, I/ASC, significadores do tema e estrelas fixas proeminentes; manter o eixo Marcos de casa/planeta.
- Não separar notabilidade do contexto histórico/temporal.

### Frawley — acrescentar somente o verificado
- Frawley Applied ressalta que a notabilidade não é avaliada somente pela nativity isolada: o nativo “pega a onda” quando há conexões entre a natividade e a lunação/eclipses próximos ao nascimento, dentro de ciclos maiores.
- Priorizar estrelas reais em ângulos/luminares e verificar se o significador da área pública está em condição de manifestá-las.
- Comparar a promessa radical com o clima/ciclo maior; um grande potencial pode não se tornar fama histórica sem oportunidade mundana.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Promessa natal pública.
2. Estrelas/ângulos.
3. Lunação/eclipses próximos ao nascimento se estiver usando Frawley.
4. Contexto histórico maior.
5. Separar talento de oportunidade histórica.

### Campos mínimos de saída
```text
natalProminence
fixedStarProminence
prenatalLunationEclipseLinks
mundaneContextNeeded
```

### Proibições
- Não prometer fama apenas por estrela real ou angularidade.

**Base documental:** F-APP - seção sobre ciclos mundanos/notabilidade; F-SYL - General Fortune, eclipses & lunations.

## 45. Empregados, subordinados, prestadores e pequenos animais

**Pergunta:** O que olhar para pessoas/animais que estão “abaixo” do nativo na relação de serviço/cuidado?

### Marcos — olhar obrigatoriamente
- VI/regente VI.
- Planetas na VI/cúspide.
- Mercúrio como co-significador natural da VI; Marte em júbilo na VI, sem substituir regente.
- Relação VI↔I para subordinados/prestadores e pequenos animais.
- Distinguir o trabalho do próprio nativo (X) do empregado/subordinado que trabalha para ele (VI).

### Frawley — acrescentar somente o verificado
- Nenhum algoritmo natal adicional específico verificado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. VI/regente.
2. I.
3. Contexto: empregado/prestador/animal pequeno.
4. Não mover trabalho do nativo para VI.

### Campos mínimos de saída
```text
subordinates
serviceProviders
smallAnimals
nativeRelation
```

### Proibições
- VI ≠ profissão do nativo.

**Base documental:** M-BK Casa VI.

## 46. Grandes animais

**Pergunta:** Como rotear grandes animais e riscos ligados a eles?

### Marcos — olhar obrigatoriamente
- XII/regente XII para animais grandes/indomáveis segundo Marcos.
- I/regente I para relação do nativo com o animal.
- VI fica para animais pequenos/domesticáveis.
- Se a pergunta é profissão com animais, combinar a casa do animal com X, sem alterar os significados-base.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo natal específico verificado.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Classificar pequeno VI ou grande XII.
2. Adicionar I.
3. Adicionar X se profissão.

### Campos mínimos de saída
```text
animalCategory
animalHouse
nativeRelation
careerLink
```

### Proibições
- Não usar VI para todo animal indistintamente.

**Base documental:** M-BK Casas VI e XII.

## 47. Circunstância natal não listada: roteador por casas derivadas

**Pergunta:** Como a IA deve proceder quando o usuário pergunta algo específico que não possui capítulo próprio?

### Marcos — olhar obrigatoriamente
- Primeiro identificar o ator/objeto principal e sua casa radical pelo significado concreto do contexto.
- Se a pergunta é sobre uma posse, filho, parceiro, dinheiro ou outra relação de alguém já representado por uma casa, derivar a casa a partir dela e documentar a contagem.
- Escolher o regente do signo da cúspide derivada; não usar co-significador natural como regente.
- Aplicar o dossiê universal de casa, planeta e relação.
- Separar capacidade (dignidade), intenção (recepção) e oportunidade (aspecto).
- Se duas rotas de casa são plausíveis, não escolher silenciosamente: declarar a ambiguidade e pedir contexto.
- Se nenhuma fonte Marcos/Frawley/Gugu no corpus sustenta o significado, marcar “UNSUPPORTED_BY_CURRENT_CORPUS”.

### Frawley — acrescentar somente o verificado
- Frawley usa amplamente casas derivadas: o contexto decide “de quem” é dinheiro/filho/posse. Aplicar como gramática, sem transformar o natal numa horária de evento concreto.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Identificar ator.
2. Identificar assunto.
3. Derivar casa.
4. Calcular regente.
5. Aplicar dossiês.
6. Explicitar contexto e proveniência.

### Campos mínimos de saída
```text
actor
radicalHouse
derivedHouse
derivationPath
significator
evidence
unsupportedFlag
```

### Proibições
- Não inventar associação casa-signo moderna.
- Não escolher casa pela palavra isolada; usar o papel real no contexto.

**Base documental:** M-BK - regras de casas e exemplos contextuais; F-APP - casas derivadas.

## 48. Promessa radical antes de qualquer previsão

**Pergunta:** O evento/tema está contido como possibilidade no radical?

### Marcos — olhar obrigatoriamente
- Antes de tempo, concluir o dossiê natal do assunto.
- Registrar testemunhos que permitem, dificultam ou tornam improvável a manifestação.
- Uma técnica temporal não cria aquilo que o radical não contém; deve ativar/refinar uma possibilidade natal.
- Se o radical é ambíguo, a previsão deve carregar a ambiguidade.

### Frawley — acrescentar somente o verificado
- Frawley também trabalha previsão a partir do radical e ensina progressões/retornos/profecções depois do julgamento natal.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Dossiê natal.
2. radicalPromise.
3. Somente então técnica temporal.

### Campos mínimos de saída
```text
radicalPromise
radicalContradictions
timingEligible
```

### Proibições
- Não usar trânsito isolado como substituto da promessa natal no modo Marcos.

**Base documental:** M-TX - técnicas temporais; F-SYL.

## 49. Direções primárias - Marcos

**Pergunta:** Que contato temporal amplo deve ser inspecionado nas direções primárias?

### Marcos — olhar obrigatoriamente
- Usar significadores/promissores previstos no módulo de direções e permitir os aspectos tradicionais que o material de Marcos admite nessa técnica.
- Registrar qual ponto natal é dirigido a qual promissor, aspecto, arco/data e qual domínio natal é ativado.
- Tratar direção como linha geral; a Revolução deve refinar/confirmar em vez de competir com ela.
- Só interpretar contatos que ativem significadores relevantes do tema natal.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo específico verificado no corpus atual.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Selecionar significador natal.
2. Calcular direção.
3. Relacionar ao domínio.
4. Buscar confirmação em retorno.

### Campos mínimos de saída
```text
directionContact
aspect
dateWindow
activatedNatalDomain
returnConfirmation
```

### Proibições
- Não misturar regra de progressão (só conj/opp) com direções.

**Base documental:** M-TX - arquitetura temporal.

## 50. Progressões secundárias - Marcos

**Pergunta:** Que aspectos a IA deve aceitar nas progressões secundárias no modo Marcos?

### Marcos — olhar obrigatoriamente
- No material transcrito, Marcos restringe progressões secundárias a conjunção e oposição para reduzir ruído.
- Registrar o ponto progredido, alvo natal, distância, aplicação/separação e janela temporal.
- Relacionar cada contato ao dossiê natal que ele ativa.
- Tratar progressão como linha geral e buscar refinamento/confirmação em Revolução.

### Frawley — acrescentar somente o verificado
- Nenhum acréscimo específico verificado no corpus atual.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Filtrar somente conj/opp.
2. Mapear ao radical.
3. Buscar retorno convergente.

### Campos mínimos de saída
```text
progressedPoint
natalTarget
contactType
timeWindow
activatedDomain
returnConfirmation
```

### Proibições
- Não acrescentar sextil/quadratura/trígono em progressões no modo Marcos só para “ter mais informação”.

**Base documental:** M-TX - técnicas temporais.

## 51. Revolução Solar e Lunar - Marcos

**Pergunta:** Como a Revolução deve ser usada em relação ao radical e às técnicas mais gerais?

### Marcos — olhar obrigatoriamente
- Revolução Solar: calcular para o retorno exato do Sol natal; no livro de Marcos, lançar para o local de nascimento, não para o lugar onde a pessoa passa o aniversário.
- Revolução Lunar: retorno exato da Lua natal para refinamento mensal quando o módulo for usado.
- Não ler retorno sozinho: ele refina/confirma a linha dada pelo radical + direção/progressão.
- Usar significadores do assunto e casas do retorno, sempre comparando com pontos natais correspondentes.
- Para Fortuna em Revolução, preservar a regra específica do corpus Marcos e não substituir silenciosamente por fórmula de outra escola.

### Frawley — acrescentar somente o verificado
- Frawley atual ensina return charts e profections; manter os dois sistemas separados quando divergirem em procedimentos de localização ou leitura.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Radical.
2. Direção/progressão.
3. Retorno.
4. Convergência.
5. Contradições explícitas.

### Campos mínimos de saída
```text
solarReturn
lunarReturn
natalCrossLinks
refinement
contradictions
```

### Proibições
- Não deixar retorno “vencer” o radical.

**Base documental:** M-BK - técnicas temporais; M-TX; F-SYL.

## 52. Progressões, retornos e profecções - Frawley atual

**Pergunta:** Quais módulos temporais atuais de Frawley devem existir sem fingir técnica que não está no corpus?

### Marcos — olhar obrigatoriamente
- Nenhum núcleo específico adicional além do dossiê universal.

### Frawley — acrescentar somente o verificado
- O programa atual de Frawley inclui: introdução às progressões; return charts; profections; Hyleg e tempo de morte; eclipses/lunações no General Fortune.
- O syllabus não fornece, por si só, cada algoritmo. Onde o corpus não contém o procedimento detalhado, o MathAstro deve registrar o módulo como “escopo confirmado, algoritmo ainda não source-locked”.
- Não preencher lacunas com regras modernas genéricas e rotulá-las Frawley.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. Verificar se há algoritmo direto no corpus.
2. Se sim, aplicar com proveniência.
3. Se não, declarar “escopo confirmado / regra não materializada”.

### Campos mínimos de saída
```text
module
sourceLockedAlgorithm
status
unresolvedTechnique
```

### Proibições
- Não inventar a técnica a partir do título da aula.

**Base documental:** F-SYL.

## 53. Regra de convergência temporal

**Pergunta:** Quando a IA pode promover um período/evento a conclusão temporal forte?

### Marcos — olhar obrigatoriamente
- Exigir promessa radical do tema.
- Preferir repetição do mesmo tema em direção/progressão e Revolução.
- Registrar se as técnicas convergem, apenas se complementam ou se contradizem.
- Quanto mais grave/específica a afirmação, maior deve ser a convergência necessária e mais explícita a incerteza.
- Se uma técnica isolada contradiz o radical, não promover a técnica isolada.

### Frawley — acrescentar somente o verificado
- Frawley atual também rejeita “uma técnica mágica” para precisão de longevidade e exige combinação de técnicas.

### Gugu — suplemento
- Nenhum acréscimo específico de Gugu.

### Ordem de decisão
1. radicalPromise.
2. generalTechnique.
3. return/refinement.
4. convergence.
5. confidence.

### Campos mínimos de saída
```text
convergence
corroborations
contradictions
confidence
eventSpecificity
```

### Proibições
- Não contar “número de técnicas” mecanicamente; avaliar se são realmente independentes e pertinentes.

**Base documental:** M-TX; F-CUR.

## Schema universal de julgamento temático
```text
domain
question
actors[]
primaryHouses[]
derivedHouses[]
significators[]
calculatedFacts[]
capacityEvidence[]
intentionEvidence[]
opportunityEvidence[]
cuspEvidence[]
fixedStarEvidence[]
nodeEvidence[]
lotEvidence[]
antisciaEvidence[]
convergences[]
contradictions[]
unresolved[]
radicalPromise
temporalActivation[]
contextNeeded[]
sourceTiers[]
confidenceStatement
```

## Regra final

**A IA não deve “fazer astrologia em geral”. Ela deve executar o protocolo do domínio, com a fonte identificada, e parar onde a fonte para.**
