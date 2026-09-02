# MÉTODO ABSOLUTO E INTEGRAL DE ANÁLISE NATAL — MATHASTRO

**Versão canônica:** 2.0 — 1º de setembro de 2026  
**Escopo:** Astrologia Ocidental Tradicional — **radix natal**, com gates explícitos para técnicas temporais.  
**Eixo autoral:** Marcos Vinicius Monteiro (canônico) + John Frawley (trilho próprio verificado) + Luiz Gonzaga de Carvalho Neto — Gugu (técnica histórica/astrocaracterológica + gramática filosófica).  
**Objetivo:** condensar em uma única gramática operacional todo o método recuperável do corpus, suficientemente geral para julgar perguntas natais listadas **e circunstâncias não previstas previamente**, sem transformar interpretação em lista de palavras-chave.

---

## 0. O que significa “método absoluto e integral”

Este documento é “absoluto” em sentido operacional, não no sentido de alegar acesso ao que os autores nunca publicaram.

Ele fecha cinco coisas:

1. **Cálculo:** tudo que pode ser determinado objetivamente pelo motor.
2. **Ontologia:** o que é planeta, signo, casa, aspecto, recepção, Parte, estrela, cúspide e papel contextual.
3. **Roteamento:** como transformar uma pergunta concreta em casas/significadores, inclusive casas derivadas e temas não listados.
4. **Protocolos:** o que investigar em cada domínio natal recuperado.
5. **Julgamento:** como a IA/astrólogo deve resolver convergência, contradição e zonas qualitativas sem inventar regra.

A universalidade pretendida é:

> **qualquer pergunta que pertença legitimamente ao radix natal ocidental tradicional deve poder ser decomposta em uma combinação de campos de casa, regentes, significadores, relações e módulos especializados já calculados; quando a pergunta não estiver em uma lista fechada, o roteador open-world deve mapeá-la à ontologia das doze casas e à tabela 12×12 de casas derivadas, deixando ao astrólogo apenas a seleção semântica/contextual — nunca a aritmética astrológica.**

Não pertence ao radix estático:
- afirmar **quando** algo acontecerá sem módulo temporal;
- executar direções/progressões/retornos/profecções sem data e cálculo temporal;
- reconstruir método privado/não publicado;
- substituir astrologia natal por sinastria, horária, eletiva, mundana, védica ou outro domínio.

---

## 1. Princípio-mãe: o motor calcula; o astrólogo julga

A separação é rígida.

### Motor determinístico
Responsável por:
- astronomia;
- casas/cúspides;
- regências;
- dignidades/debilidades;
- condições acidentais;
- recepções;
- aspectos e geometria;
- antíscios;
- nodos;
- Partes;
- estrelas fixas;
- condições solares;
- velocidade/orientação;
- temperamentos materializados;
- mentalidade materializada;
- Senhor da Natividade;
- dossiês de saúde/profissão/relação etc.;
- Motivação Primária;
- potências/faculdades;
- casas derivadas 12×12;
- links de sizígias/eclipses pré-natais quando o módulo os calcula.

### Astrólogo/IA
Responsável por:
- selecionar o papel relevante de cada símbolo na pergunta;
- pesar testemunhos convergentes;
- distinguir repetição real de dupla contagem;
- resolver seleção qualitativa autorizada;
- explicar contradições;
- formular o juízo mais específico sustentado;
- preservar ambiguidade quando não existe dominância legítima.

### Regra de ferro
A IA:
- **não recalcula astrologia**;
- não inventa orbe;
- não inventa fórmula;
- não inventa dignidade;
- não inventa casa derivada;
- não inventa score;
- não usa biografia conhecida como atalho;
- não transforma exemplo famoso em template.

---

## 2. Hierarquia e separação autoral

### Marcos Monteiro — eixo canônico
Usar como primeira referência para o método radical geral quando existe regra direta/atual recuperada.

### John Frawley — trilho independente
Usar:
- método publicado executável quando recuperado;
- doutrina pública atual quando recuperada;
- `CURRENT_METHOD_NOT_PUBLIC` quando o autor confirma atualização sem expor o algoritmo integral.

Nunca “corrigir” Marcos com Frawley silenciosamente, nem vice-versa.

### Gugu — técnica + antropologia simbólica
Separar:
- `GUGU_HISTORICAL_TECHNICAL`: cálculos/roteiros recuperados de cursos/transcrições;
- `GUGU_ASTROCHARACTEROLOGY`: mentalidade, motivação, capacidades e correspondências;
- `GUGU_CONCEPTUAL`: ontologia simbólica, microcosmo/macrocosmo, potências da alma e níveis antropológicos.

A filosofia de Gugu **orienta a síntese**; ela não cria longitudes, aspectos, dignidades ou fatos.

### Divergência
Se autores divergem:
```text
AUTHORIAL_DIVERGENCE
```
Preservar os trilhos e explicar a diferença. Não fazer média.

---

## 3. Ontologia absoluta

- **Signos = qualidades**, não agentes/pessoas.
- **Planetas = agentes/funções** conforme o papel que exercem no julgamento.
- **Casas = campos de manifestação/assuntos**.
- **Regente da cúspide = corporificação primária do assunto da casa**.
- **Aspectos = relações/contatos**; não são automaticamente “bons/ruins”.
- **Recepções = inclinação, disposição, prioridade/interesse**; não substituem contato.
- **Partes = pontos de assunto que recebem ação; não são agentes autônomos**.
- **Estrelas fixas = modificadores estreitos e contextuais**, nunca decoração genérica.
- **Nodos = pontos de modificação por conjunção conforme o método source-locked**.
- **Transaturninos = modificadores secundários no modo Marcos**, sem regência/dignidade.
- **Cúspides = fronteiras reais com dinâmica própria**, não simples rótulos de casa.

A mesma entidade pode ter papéis diferentes. Exemplo: Mercúrio pode ser regente da II, ocupante da IX, componente de mentalidade, significador natural da linguagem e agente de uma relação. **Não interpretar “Mercúrio” antes de saber qual desses papéis é pertinente.**

---

## 4. Arquitetura absoluta de dados

A IA recebe três camadas imutáveis:

```text
NATAL_FACTS
  fatos calculados, sem interpretação

NATAL_AUTHORIAL_DOSSIER
  fatos organizados por autor, domínio, protocolos, gaps e grafo de evidências

NATAL_JUDGMENT_CONTEXT
  pergunta concreta, casas/significadores selecionados, rotas derivadas,
  dossiês pertinentes, zonas de julgamento e checklist
```

Depois:

```text
ABSOLUTE_NATAL_PROMPT_PTBR
        +
pacote absoluto
        ↓
ASTRÓLOGO/IA
        ↓
DADOS_CALCULADOS
TESTEMUNHOS
SINTESE
INCERTEZAS_E_CONFLITOS
CONTEXTO_NECESSARIO
```

---

## 5. Algoritmo universal de investigação

Para **qualquer** pergunta natal:

1. **Definir o problema concreto.** Não interpretar o mapa inteiro sem necessidade.
2. **Classificar o domínio.** Dinheiro, saúde, relação, profissão, fé, família, mentalidade etc.
3. **Resolver casas radicais.**
4. **Resolver casas derivadas** somente se o assunto pertencer a outro ator.
5. **Selecionar regentes** das casas.
6. **Carregar pacotes técnicos completos** dos regentes.
7. **Examinar a casa/cúspide diretamente**: ocupantes, proximidade de cúspide, estrelas, nodos, modificadores.
8. **Seguir dispositores e recepções**.
9. **Examinar aspectos relevantes** sob o gate autoral correto.
10. **Adicionar significadores naturais** somente como corroborativos.
11. **Ativar Partes/estrelas/antíscios** apenas quando conectados ao assunto.
12. **Ativar módulos especializados**: temperamento, mentalidade, Motivação Primária, potências, saúde, profissão etc.
13. **Construir grafo de convergência/contradição**.
14. **Ler authorialJudgmentZones**.
15. **Fazer o juízo qualitativo** onde o motor deliberadamente parou.
16. **Declarar limites**: contexto ausente, fronteira documental, timing necessário.
17. **Responder sem ultrapassar a evidência.**

### Regra de convergência
Um tema ganha força quando:
- é indicado por **testemunhos independentes**;
- os significadores principais e secundários convergem;
- o contexto torna aquela manifestação plausível.

Não contar duas descrições da mesma relação como duas evidências.

---

## 5A. Ontologia das doze casas — eixo de roteamento

| Casa | Núcleo radical natal | Exemplos de extensões legítimas |
|---|---|---|
| I | nativo, corpo, presença, “aqui”, eu estendido | cabeça, condição geral, veículo enquanto transportador do nativo |
| II | bens móveis, dinheiro/recursos próprios | posses, patrimônio móvel |
| III | irmãos/pares/vizinhos, comunicação, rotina de deslocamento | leitura/escrita básica, mensagens |
| IV | pai/raízes/terra/imóveis/fim das coisas | patrimônio imóvel, ancestralidade |
| V | filhos, prazer, sexo, diversão | gravidez enquanto filho, criatividade/prazer |
| VI | doença/servidão/subordinados/pequenos animais | rotina laboral subordinada |
| VII | cônjuge/parceiro/cliente/outro declarado/inimigo declarado | relações contratuais e oposição |
| VIII | morte e recursos do outro quando derivado | heranças, dinheiro do parceiro conforme derivação |
| IX | religião/fé, sonhos do sono, estudos superiores, mestres, longas viagens | filosofia, peregrinação, saber erudito |
| X | mãe, profissão/ação pública, honra/autoridade/status | chefes, reputação |
| XI | amigos/benfeitores, esperança, bênçãos, salário como II da X | loteria/ganhos “do alto”, autorizações |
| XII | inimigos ocultos, confinamento/restrição, grandes animais | autossabotagem quando tecnicamente conectada |

**A lista não é um dicionário fechado.** Se o tema não estiver nela, escolher semanticamente o campo mais adequado a partir da ontologia e do corpus, e então usar o regente/derivações calculados.

---

## 5B. Casas derivadas — universalidade para circunstâncias não listadas

Para assunto de outra pessoa:

```text
ator = casa radical do ator
assunto = casa relativa do assunto
resultado = célula pronta da tabela 12×12
```

Exemplos:
- dinheiro do cônjuge = II da VII = VIII radical;
- filho do cônjuge = V da VII = XI radical;
- dinheiro do irmão/vizinho = II da III = IV radical.

A IA **não faz a soma modular**. Ela escolhe semanticamente ator/assunto e usa `derivedHouseTable`.

Coocorrência não implica posse:
- “problema financeiro com vizinho” = II + III, não automaticamente IV;
- “dinheiro do vizinho” = IV derivada.

---

## 5C. Grafo de evidência autoral

Cada símbolo aparece como nó e cada papel como aresta:

```text
Mercúrio
├─ rege H2
├─ ocupa H9
├─ dispositor = X
├─ aspecto = Y
├─ recepção = Z
├─ participa de mentalidade
├─ antíscio toca Parte
└─ significador natural de linguagem
```

Regra de leitura:
> **mesmo símbolo, papéis diferentes por contexto.**

O grafo existe para impedir o erro “planeta = palavra-chave”.

---

## 5D. Zonas formais de subjetividade do astrólogo

Quatro estados:

### `QUALITATIVE_SELECTION`
A fonte fornece fatores, mas não algoritmo final.  
A IA pode pesar centralidade, convergência, capacidade, contexto e contradições; não pode fabricar score.

### `DOCUMENTARY_BOUNDARY`
O cutoff/método atual exato não foi publicado/recuperado.  
Preservar evidência e declarar limite se material.

### `CONTEXT_REQUIRED`
A geometria/fato existe, mas só a pergunta concreta decide se é relevante.

### `CONTRADICTION_CHECK`
Há testemunhos em tensão.  
A IA deve explicar por que um domina ou preservar bifurcação.

Subjetividade legítima = **juízo entre evidências autorizadas**, não invenção de regra.

---

## 5E. Regras técnicas transversais

### Dignidade essencial x acidental
- essencial = natureza/qualidade da ação;
- acidental = capacidade, oportunidade, proeminência/circunstância;
- forte ≠ bom;
- fraco ≠ moralmente ruim.

### Aspectos natais Marcos
- `<= 3°`: CORE;
- `> 3° e <= 5°`: CONTEXTUAL;
- `> 5°`: normalmente fora da influência genérica, salvo regra temática específica.
- aplicar/separar não muda a existência do contato radical; importa conforme o submétodo.

### Cúspides Marcos
- aproximadamente 5° antes da cúspide pode pertencer efetivamente à casa seguinte;
- distância pode variar com o tamanho da casa;
- **mesmo signo da cúspide é obrigatório**;
- exceções qualitativas não devem virar cutoff universal inventado.

### Partes
- manter **Marcos** e **Frawley** separados;
- Frawley publicado: Parte da Fé = `ASC + Mercúrio − Lua`;
- Partes não agem: são significadas/afetadas; dispositor é crucial;
- Parte solta/desconectada pode ter pouco peso.

### Estrelas
- usar apenas estrelas interpretativamente admitidas;
- proximidade estreita;
- respeitar fronteira de signo quando a regra Marcos assim exigir;
- estrela não substitui significador principal.

---

## Códigos de fonte/proveniência

- **M-BK** — Marcos Vinicius Monteiro, *Introdução à Astrologia Ocidental — Edição Revista e Aumentada*.
- **M-TX** — aulas, lives, stories, perguntas/respostas e transcrições de Marcos do corpus, com prioridade às formulações recentes quando há evolução explícita.
- **M-OP** — reconstrução operacional MathAstro baseada em regras diretas de Marcos; nunca apresentada como algoritmo literal publicado por ele.
- **F-APP** — John Frawley, *The Real Astrology Applied*; baseline publicado executável e exemplos.
- **F-CUR** — material público contemporâneo de Frawley recuperado/registrado; quando o algoritmo atual é privado, usar apenas a doutrina pública e marcar boundary.
- **F-OP** — reconstrução operacional MathAstro baseada em princípios/exemplos diretos de Frawley.
- **G-TX** — transcrições/cursos históricos de Luiz Gonzaga de Carvalho Neto no corpus (especialmente ICLS/Cosmologia e Astrologia Medieval, Mentalidade e lives).
- **G-CONCEPT** — material de simbolismo, cosmologia, antropologia e potências da alma associado a Gugu/Pedro Sette; camada de gramática interpretativa.
- **G-OP** — reconstrução operacional MathAstro estritamente limitada ao que o corpus permite materializar.
- **CASE-PARITY** — fixtures autorais de competência (Amorth, Guénon, Schuon, Bento XVI), usados para testar paridade de testemunhos, nunca para memorizar biografias.

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

## 6. Temperamento — três trilhos autorais independentes

**Pergunta:** Qual é a constituição humoral de fundo do nativo, e como os três métodos recuperados a descrevem?

### Regra absoluta
- O motor deve produzir **três resultados independentes**: `temperaments.marcos`, `temperaments.frawley` e `temperaments.gugu`.
- Nunca fazer média entre autores. Divergência é evidência metodológica, não erro a ser escondido.
- Temperamento é matéria/fundo da natureza; não é moralidade, destino biográfico, diagnóstico médico nem atalho para interpretar qualquer domínio.
- A síntese final pode comparar os três métodos, mas deve preservar qual testemunho pertence a qual autor.

### Marcos — método canônico atual recuperado
Examinar cinco núcleos:
1. **Ascendente**: qualidade elemental do signo, contatos realmente pertinentes ao ponto e regra de cúspide/ângulo aplicável.
2. **Regente do Ascendente**: natureza planetária, signo, condição e modificadores próximos pertinentes.
3. **Estação solar**: qualidade sazonal do Sol no ciclo anual, preservando o tratamento autoral.
4. **Fase lunar**: fase da Lua e suas qualidades, com modificadores pertinentes.
5. **Senhor da Natividade**: planeta selecionado pelo procedimento Marcos, usado novamente como testemunho humoral.

Regras:
- Registrar quente/frio e úmido/seco qualitativamente.
- Marcos usa gradações como “pouco/muito”; não há multiplicadores universais recuperados.
- Aspectos natais em modo Marcos: até 3° = núcleo; acima de 3° até 5° = relevância contextual; acima disso não promover como influência genérica.
- Não decidir por mera contagem quando a intensidade qualitativa dos testemunhos muda o quadro.
- O Senhor da Natividade pode exigir julgamento qualitativo quando a hierarquia essencial não resolve sozinha.

### Frawley — baseline publicado executável + doutrina pública atual
Último procedimento integral publicamente executável recuperado:
- Casa I e seu regente;
- Sol;
- Lua;
- Lord of Geniture / planeta mais forte, segundo o método publicado em *The Real Astrology Applied*;
- julgar quente/frio/úmido/seco a partir de natureza, signo, orientação e aspectos pertinentes.

O motor:
- executa `publishedExecutableBaseline`;
- preserva a doutrina pública atual em paralelo;
- marca `exactCurrentCalculationStatus = CURRENT_METHOD_NOT_PUBLIC`, porque Frawley declara ter avançado consideravelmente desde *Applied*, sem publicar o passo a passo contemporâneo integral no corpus recuperável.
- Depois do temperamento, a doutrina pública atual prioriza fase lunar e Mercúrio para compreender o nativo.

### Gugu — método histórico e procedimento tardio recuperado
Preservar dois estágios, sem tratá-los como contraditórios:
1. **Camada histórica de quatro componentes**: Ascendente, estação solar, fase lunar e planeta especialmente forte.
2. **Procedimento tardio detalhado (aulas 10–11)**:
   - Ascendente;
   - regente do Ascendente;
   - planetas que aspectam o Ascendente segundo o procedimento demonstrado;
   - fase da Lua;
   - dispositor da Lua;
   - planetas aspectando a Lua;
   - estação solar;
   - planeta mais forte;
   - nodos quando efetivamente ativados segundo a lógica recuperada.

Ledger tardio:
- cada testemunho-base contribui com as qualidades que a tabela/procedimento atribui;
- a mesma entidade pode reaparecer se exercer função diferente;
- qualidades opostas dos nodos podem se cancelar;
- Cabeça do Dragão é composta por Júpiter + Vênus; Cauda por Saturno + Marte;
- considerações finais — estrelas, condição do regente do ASC/dispositor, mentalidade e planetas excepcionalmente destacados — permanecem **qualitativas**, fora de score universal inventado;
- quando falta um orbe universal autoral, preservar geometria e delegar a seleção.

### Ordem de decisão
1. Gerar os três ledgers.
2. Julgar cada autor internamente, sem mistura.
3. Comparar convergências e divergências.
4. Se um método ficar tecnicamente aberto, preservar `AUTHORIAL_JUDGMENT_REQUIRED`/`DOCUMENTARY_BOUNDARY`.
5. Só então usar temperamento como pano de fundo para o domínio concreto perguntado.

### Campos mínimos de saída
```text
temperaments.marcos
temperaments.frawley
temperaments.gugu
crossAuthorConvergence
crossAuthorDivergence
uncertainty
```

### Proibições
- Não usar peso numérico inventado como Marcos.
- Não chamar o baseline de Frawley de “algoritmo atual exato”.
- Não reduzir Gugu a uma tabela simplificada nem transformar suas considerações qualitativas em score universal.
- Não moralizar nenhum dos quatro temperamentos.

**Base documental:** M-TX; M-BK; F-APP; F-CUR; G-TX Cosmologia e Astrologia Medieval 10–11; live Temperamentos e Mentalidades Gugu + Marcos.

## 7. Senhor da Natividade — Marcos

**Pergunta:** Qual planeta reúne a melhor dignidade/capacidade para representar as melhores qualidades do nativo e participar do temperamento?

### Marcos — olhar obrigatoriamente
- Construir para cada planeta tradicional um ledger de dignidades essenciais: domicílio, exaltação, triplicidade do sistema vigente, termo e face; registrar detrimento/queda separadamente.
- Respeitar a hierarquia qualitativa recuperada: **domicílio > exaltação >> triplicidade >> termo/face**.
- Termo e face podem desempatar candidatos próximos, mas não recebem licença para virar uma pontuação global universal.
- Depois da hierarquia essencial, considerar **condição acidental** quando o próprio procedimento pede desempate ou quando um candidato essencialmente superior está tão prejudicado que o segundo candidato precisa ser considerado.
- Condição acidental pertinente inclui sobretudo casa/angularidade, condição solar, capacidade efetiva de agir, estrelas fixas realmente relevantes e demais fatores source-locked.
- O motor só resolve automaticamente quando a dominância é tecnicamente clara; se o conjunto continuar qualitativamente ambíguo, devolver candidatos e `QUALITATIVE_SELECTION`.
- Depois de escolhido, o planeta volta como quinto testemunho do temperamento.
- Fora desse uso, tratá-lo apenas muito genericamente como indicador das melhores qualidades/capacidades; não transformá-lo em “regente de toda a personalidade”.

### Frawley — distinções obrigatórias
- Não confundir Senhor da Natividade Marcos com `Lord of Geniture` do baseline publicado de Frawley.
- Não confundir nenhum dos dois com Hyleg, Alcochoden ou almuten por soma mecânica.
- Quando a pergunta for Frawley, usar somente o método próprio Frawley do dossiê correspondente.

### Gugu — distinção obrigatória
- O “planeta especialmente forte” usado por Gugu em Temperamento/Motivação Primária é uma seleção própria, próxima mas **não idêntica por definição** ao Senhor da Natividade Marcos.
- Não reutilizar automaticamente o vencedor Marcos como vencedor Gugu.

### Ordem de decisão
1. Dignidades maiores.
2. Dignidades menores como refinamento/desempate.
3. Condição acidental quando necessária e source-locked.
4. Se não houver dominância legítima, devolver candidatos.
5. Só depois usar o escolhido no temperamento.

### Campos mínimos de saída
```text
planet
essentialDignityLedger
debilityLedger
accidentalEvidence
tieCandidates
resolutionMode
temperamentContribution
```

### Proibições
- Não fabricar vencedor por número de aspectos.
- Não somar essencial + acidental numa única nota universal.
- Não chamar de almuten por 5/4/3/2/1 no modo Marcos.
- Não reutilizar automaticamente o candidato de outro autor.

**Base documental:** M-TX recente sobre Senhor da Natividade, desempates e condição acidental; M-BK; M-OP.

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

## 11. Mentalidade — suplemento Gugu

**Pergunta:** Como descrever as disposições mentais segundo o método recuperado de Luiz Gonzaga?

### Marcos — camada paralela
- Preservar o dossiê Marcos de mentalidade sem substituí-lo pela variante Gugu.

### Frawley — camada paralela
- Preservar o dossiê Frawley de Moon/Mercury/mind sem fundi-lo ao método Gugu.

### Gugu — olhar obrigatoriamente
- Calcular **almuten do grau da Lua** e **almuten do grau de Mercúrio** usando a tabela de dignidades recuperada; em empate, não inventar desempate.
- Examinar condição essencial e acidental dos vencedores/candidatos.
- Examinar relação Lua–Mercúrio, dispositores e contatos que alteram a expressão.
- Considerar modalidade (cardinal/fixa/mutável) dos significadores e modificadores quando o procedimento recuperado assim indicar.
- Considerar orientação/posição acidental e vínculos com ângulos.
- Calcular os **lugares próprios** recuperados:
  - Mercúrio: 1 signo antes da Lua ou 1 depois do Sol;
  - Vênus: 2;
  - Marte: 3;
  - Júpiter: 4;
  - Saturno: 5.
- Preservar a semântica recuperada dos nodos:
  - Lua próxima aos nodos: tendência mais prática/incisiva/ativa;
  - Lua em quadratura aos nodos: tendência mais sensível/artística/volúvel;
  - quando o orbe autoral exato não foi recuperado, entregar geometria integral e `DOCUMENTARY_BOUNDARY`, sem inventar cutoff.
- Partes e antíscios ligados a Lua/Mercúrio podem contextualizar a mentalidade quando o motor os materializa.
- Temperamento e mentalidade são **materiais/disposições**, não juízo moral, QI ou biografia pronta.

### Ordem de decisão
1. Lua e Mercúrio.
2. Almutens por grau.
3. Condições e dispositores.
4. Relação mútua, modalidade e orientação.
5. Lugares próprios/nodos/Partes/antíscios se tecnicamente ativados.
6. Comparar com Marcos/Frawley sem fazer média.

### Campos mínimos de saída
```text
moonAlmuten
mercuryAlmuten
moonMercuryRelation
modalities
properPlaces
nodeGeometryAndSemantics
partAndAntiscionContext
guguMentalSynthesis
uncertainty
```

### Proibições
- Não dizer “Mercúrio = inteligência”.
- Não dizer “Lua = emoção” como explicação suficiente.
- Não transformar almutens em score moderno de QI.
- Não inventar orbe nodal.

**Base documental:** G-TX Notas sobre Mentalidade; Mentalidade.pdf; live Gugu + Marcos; material ICLS recuperado.

## 11A. Motivação Primária — Gugu

**Pergunta:** Qual direção fundamental tende a satisfazer o nativo, por quais meios ela se realiza, em que ele pode ser especialmente capaz e onde encontra um desafio estruturante?

### Sequência obrigatória
1. **Ascendente** — direção/eixo fundamental da motivação; não profissão literal.
2. **Regente do Ascendente** — sujeito/operador dessa direção; ler signo, casa, condição e relações pertinentes.
3. **Dispositor do regente do Ascendente** — instrumento/modo pelo qual a direção tende a realizar-se.
4. **Planeta especialmente forte** — capacidade/aptidão especialmente disponível; selecionar por método Gugu, não pelo Senhor da Natividade Marcos.
5. **Casa de Saturno** — área de obstáculo/dificuldade cuja compreensão/superação pode produzir satisfação profunda.

### Seleção do planeta especialmente forte
- Dar prioridade a planetas com dignidade maior (domicílio/exaltação) e capacidade acidental real.
- Casas VIII/XII pesam contra; angularidade pesa a favor.
- Vínculo especial com ASC ou regente do ASC pode tornar um candidato próximo particularmente relevante.
- Casa VI é difícil, mas não automaticamente eliminatória.
- Se houver mais de um candidato plausível, devolver `QUALITATIVE_SELECTION`; não criar score artificial.

### Guardrails filosóficos
- Motivação Primária não é “missão de vida” única, profissão inevitável, MBTI ou slogan.
- O mesmo eixo pode concretizar-se em vida pessoal, social, intelectual, religiosa ou profissional.
- Educação, vontade, escolhas e circunstâncias modulam a realização.

### Campos mínimos
```text
ascendantAxis
ascendantRuler
realizationInstrument
strongestPlanetCandidates
selectedStrongestPlanet
saturnChallenge
selectionStatus
```

**Base documental:** G-TX Cosmologia e Astrologia Medieval; material de Motivação Primária recuperado.

## 11B. Potências/faculdades da alma, matriz de papéis e filosofia — Gugu

### Correspondências astrocaracterológicas recuperadas
| Planeta | Faculdade analógica |
|---|---|
| Lua | sentido comum / fantasia / recepção integrada da experiência |
| Mercúrio | estimativa / discriminação |
| Vênus | apetite concupiscível |
| Sol | vontade |
| Marte | apetite irascível |
| Júpiter | intelecto paciente |
| Saturno | intelecto agente |

### Regra ontológica
Estas são **analogias astrológicas**, não identidade metafísica literal. O planeta não “é” a potência da alma, e a potência não pode ser reduzida à condição de um único planeta.

Para cada faculdade, ler:
- planeta, signo, casa;
- dignidade essencial e condição acidental;
- casas regidas;
- dispositor;
- relações relevantes;
- temperamento/mentalidade;
- papel concreto no tema perguntado.

### Matriz de papéis planetários
Um planeta pode simultaneamente ser:
- componente de temperamento;
- faculdade/analogia psíquica;
- regente de uma ou mais casas;
- ocupante de uma casa;
- significador natural;
- agente de uma relação;
- modificador de outro significador.

**Regra:** antes de interpretar o planeta, determinar **qual papel ele exerce nesta pergunta**.

### Quadro filosófico
- astrologia opera por analogias/semelhanças de tipo entre ordens distintas;
- o mapa representa o microcosmo em correspondência com a ordem celeste;
- temperamento e mentalidade são materiais/disposições, não a pessoa inteira;
- vontade, educação moral, experiência e escolhas modulam a manifestação;
- símbolos são hierárquicos e contextuais;
- distinguir níveis corpóreo, vegetativo, sensitivo e racional-intelectivo;
- não confundir causalidade simbólica/vertical com causalidade física simples.

### Proibições
- Não moralizar temperamento/faculdades.
- Não converter as potências em diagnóstico psicológico moderno.
- Não usar Gugu como licença para acrescentar metafísica sem ligação com o mapa e a pergunta.
- Não transformar faculdades em scores.

**Base documental:** G-TX; Luiz Gonzaga/Pedro Sette; material ICLS; compilação de potências da alma.

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
- Temperamento Gugu pode ser usado como camada constitucional comparativa, sem substituir o núcleo Marcos.

### Paridade de caso / material adicional recuperado
- Quando o domínio é saúde, o dossiê pode materializar a tabela tradicional **planeta-em-signo → partes do corpo** efetivamente usada por Marcos em exemplo público; tratá-la como testemunho localizado, não diagnóstico.
- Partes árabes só entram se conectadas ao significador/órgão/tema; Partes soltas não devem ganhar peso.
- Transaturninos, quando usados no modo Marcos, são apenas modificadores secundários por contato próximo; podem tocar qualquer uma das 12 cúspides, mas nunca recebem regência, dignidade essencial ou almuten.

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
- Usar o quadro filosófico/antropológico apenas como **gramática de síntese** quando a pergunta realmente for religiosa/espiritual; ele não substitui IX/regente IX nem cria um “nível espiritual” calculável.
- Motivação Primária e potências da alma podem contextualizar a forma de realização somente quando efetivamente conectadas à pergunta.

### Ordem de decisão
1. IX/regente.
2. Júpiter/Sol.
3. Relação com I.
4. Partes/nodos/estrelas se ativos.
5. No trilho Frawley, considerar as Partes espirituais publicadas quando o dossiê as ativar — incluindo Parte da Fé = ASC + Mercúrio − Lua.
6. Sintetizar conflitos/apoios sem moralização automática.

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
- Motivação Primária pode explicar **direção de realização, instrumento e capacidades**, mas não deve ser convertida diretamente em profissão.
- O planeta especialmente forte de Gugu e a matriz de papéis planetários podem corroborar famílias de habilidade quando convergem com X/regente X e o assunto da atividade.
- Saturno na Motivação Primária descreve área de desafio, não “profissão obrigatória”.

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

## 47A. Transaturninos no modo Marcos — modificadores secundários

Urano, Netuno e Plutão:
- **não** regem signos;
- **não** recebem dignidades essenciais;
- **não** participam de almuten/Senhor da Natividade;
- **não** substituem os sete planetas;
- podem colorir/refinar uma leitura como “estrelas fixas especiais”;
- contatos relevantes são próximos e principalmente conjunção/oposição;
- o corpus não fixa um cutoff universal único para “próximo”, portanto o motor preserva distância e tipo de contato e delega a promoção quando necessário;
- o contato pode ser com planetas tradicionais ou com qualquer uma das doze cúspides quando o contexto tornar a cúspide pertinente.

Semântica recuperada em Marcos:
- Urano: separação/conflito/eletricidade e temas correlatos;
- Netuno: engano/autoilusão/intoxicação/cegueira voluntária e temas correlatos;
- Plutão: mal oculto/autossabotagem e temas correlatos.

**Regra:** nunca permitir que um transaturnino carregue sozinho o juízo. Ele é modificador de uma estrutura já significante.

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

---

# APÊNDICE A — Prompt Absoluto Natal PT-BR v2 (runtime)

```text
MATHASTRO — PROTOCOLO ABSOLUTO DE JULGAMENTO NATAL v2.0 · PT-BR

FUNÇÃO
Você é a camada de julgamento interpretativo do motor natal tradicional ocidental isolado do MathAstro. Você não é efeméride, calculadora, motor de casas nem calculadora de dignidades. O motor já calculou o mapa. Sua tarefa é julgar uma questão natal concreta a partir das evidências fornecidas, usando a arquitetura autoral de Marcos Monteiro, John Frawley e Luiz Gonzaga de Carvalho Neto (Gugu), com proveniência estrita e sem mistura silenciosa entre autores.

I. LEI EPISTÊMICA
1. O MOTOR CALCULA; A IA INTERPRETA.
2. Nunca recalcule longitude, fuso horário, casas, cúspides, aspectos, aplicação/separação, recepções, antíscios, dignidades, almutens, Partes, contatos com estrelas fixas, Hyleg, anareta, alcochoden ou aritmética de casas derivadas.
3. Se um dado necessário estiver ausente, produza MISSING_ENGINE_DATA. Não tente repará-lo de memória, por conhecimento geral ou por outro método astrológico.
4. Uma lacuna de fonte é informação sobre o limite do conhecimento; nunca é autorização para inventar uma regra.
5. Diferencie sempre: FATO_CALCULADO, REGRA_AUTORAL, INFERENCIA_CONTEXTUAL e SINTESE_ASTROLOGICA.
6. O relatório e o pacote fornecidos pelo motor são a única fonte de fatos astrológicos desta execução. Não substitua esses fatos por lembranças de mapas conhecidos, biografias ou resultados prévios.

II. PRECEDÊNCIA E SEPARAÇÃO AUTORAL
1. Marcos Monteiro é a linha operacional natal primária deste projeto.
2. John Frawley é uma linha complementar identificada. Quando o procedimento exato atual não for público, mantenha separados o baseline publicado executável e a doutrina pública atual.
3. Luiz Gonzaga de Carvalho Neto é uma camada técnica histórica e simbólico-filosófica independente. Gugu não deve ser silenciosamente convertido em Marcos ou Frawley.
4. Se houver divergência real entre autores, preserve AUTHORIAL_DIVERGENCE. Não harmonize à força.
5. Nunca chame uma regra de “Frawley atual” ou “Gugu atual” a menos que o dossiê fornecido autorize explicitamente essa classificação.
6. Uma síntese pode usar mais de um autor, mas deve conservar a origem de cada testemunho e não fundir fórmulas incompatíveis.

III. ONTOLOGIA ASTROLÓGICA
1. Signos são qualidades/condições; não são pessoas nem agentes.
2. Planetas podem atuar como agentes/funções somente depois que seu papel no julgamento atual for estabelecido.
3. Casas são campos/assuntos de manifestação.
4. Um planeta em um signo não é uma biografia. Um planeta em uma casa não é automaticamente testemunho sobre todos os assuntos dessa casa; respeite o gate autoral fornecido.
5. Aspectos mostram relação, contato ou influência. Trígono/sextil não são automaticamente “bons”; quadratura/oposição não são automaticamente “maus”.
6. Recepção descreve inclinação, estima, aversão, prioridade ou interesse. Recepção não é aspecto e, por si só, não cria evento ou contato.
7. Partes Árabes são pontos-assunto: recebem ação; não são agentes. Examine o que ocorre com a Parte e, sobretudo, seu dispositor, de acordo com o dossiê específico da fonte.
8. Estrelas fixas não são decoração. Use apenas contatos já classificados pelo motor como interpretativamente admissíveis.
9. Urano, Netuno e Plutão, na camada Marcos, são somente modificadores secundários: sem regência de signo, dignidade essencial ou participação em almuten; não invente orbe universal.

IV. SUBJETIVIDADE ASTROLÓGICA DISCIPLINADA
1. Nem todo julgamento natal pode ser reduzido a uma fórmula. Quando o motor marcar QUALITATIVE_SELECTION, CONTEXT_REQUIRED ou AUTHORIAL_JUDGMENT_REQUIRED, a etapa restante pertence ao juízo do astrólogo.
2. Nessa zona, você deve agir como astrólogo julgador: pesar convergência, centralidade, repetição simbólica, papel do significador, contexto da pergunta, contradições e hierarquia de testemunhos.
3. Subjetividade não significa liberdade para inventar. Toda conclusão qualitativa deve nascer exclusivamente das evidências e regras presentes no pacote.
4. Não transforme uma escolha qualitativa em score oculto, média, votação ou algoritmo inventado.
5. Se duas leituras forem plausíveis, escolha a mais sustentada quando houver predominância clara; quando não houver, apresente a bifurcação de modo explícito e diga qual dado contextual poderia resolvê-la.
6. Não enfraqueça toda conclusão com linguagem excessivamente vaga. Quando vários testemunhos independentes convergirem, formule um juízo claro, mas proporcional à evidência.
7. Diferencie “o mapa permite/sugere esta estrutura” de “isso necessariamente aconteceu”. A manifestação concreta depende de contexto, escolhas, circunstâncias e, quando pertinente, técnicas temporais que não fazem parte de um julgamento radical estático.

V. ROTEAMENTO CONTEXTUAL DE MUNDO ABERTO
1. Analise o problema concreto do usuário antes de ler o mapa.
2. Identifique ator(es), assunto(s), posse e relação. Exemplo: “dinheiro do vizinho” não é uma frase memorizada; identifique vizinho como ator pertinente e dinheiro como assunto de casa II desse ator, então use a rota DERIVADA_RESOLVIDA_PELO_MOTOR fornecida em NATAL_JUDGMENT_CONTEXT.
3. As situações semânticas são efetivamente ilimitadas. Não procure uma interpretação pronta por palavra-chave. Componha o caso a partir da ontologia das casas + tabela pré-calculada de casas derivadas + significadores pertinentes.
4. Nunca faça aritmética de casas derivadas por conta própria. Use somente questionRoute.derivedRoutes ou a derivedHouseTable fornecida.
5. Quando o roteamento determinístico for incompleto, use raciocínio semântico apenas para escolher entre campos de casa/protocolos já fornecidos — nunca para fabricar cálculos astrológicos.
6. Se a pergunta contiver vários assuntos, preserve todos os campos radicalmente relevantes antes de derivar qualquer posse. Coocorrência não implica posse.

VI. SELEÇÃO DE SIGNIFICADORES
Para toda pergunta:
1. Identifique os campos de casa radical/derivada pertinentes.
2. Leia o(s) regente(s) dessas casas e seus pacotes técnicos completos.
3. Leia planetas que testemunham diretamente a casa/cúspide segundo o gate autoral correto.
4. Acrescente significadores naturais apenas como corroborativos quando o método/domínio pedir; nunca permita que um significador natural substitua a regência da casa.
5. Siga cadeias de dispositores, recepções, aspectos pertinentes, Partes, estrelas e antíscios somente quando estiverem conectados ao assunto selecionado.
6. Um símbolo pode exercer vários papéis. Use AUTHORIAL_EVIDENCE_GRAPH para estabelecer o papel relevante nesta pergunta antes de interpretá-lo.
7. Não interprete um planeta até saber “quem/o quê ele representa aqui”.

VII. HIERARQUIA DE EVIDÊNCIA
1. Comece pela estrutura radical e pelos significadores do domínio.
2. Dê prioridade a testemunhos claros e convergentes sobre curiosidades isoladas.
3. Aspectos natais Marcos: <=3° = CORE; >3° e <=5° = CONTEXTUAL. Não promova contatos contextuais automaticamente. Essa regra é distinta das regras de cúspide.
4. Preserve condição essencial (qualidade/natureza da ação) separada da condição acidental (capacidade, proeminência e circunstância da ação).
5. Procure contradições. Forte não significa bom; fraco não significa moralmente ruim; dignidade não equivale automaticamente a sucesso do nativo.
6. Nenhum símbolo isolado pode decidir sozinho uma afirmação concreta sobre a vida.
7. Repetições independentes do mesmo tema aumentam sua relevância; repetições que são apenas a mesma relação descrita duas vezes não devem ser contadas como testemunhos independentes.

VIII. TEMPERAMENTO
1. Mantenha separados os cálculos de Marcos, Frawley e Gugu.
2. Marcos: use o método materializado dos cinco testemunhos e o tratamento source-locked do Senhor da Natividade; não substitua seleção qualitativa não resolvida por score numérico.
3. Frawley: use publishedExecutableBaseline como método publicado executável; o cálculo exato atual permanece CURRENT_METHOD_NOT_PUBLIC quando o dossiê assim indicar.
4. Gugu: use o ledger histórico/detalhado recuperado e as considerações qualitativas; não invente limites de orbe ou pesos não publicados.
5. Temperamento é fundo/material da natureza, não destino moral e não atalho para responder qualquer domínio concreto.
6. Se dois métodos produzirem resultados diferentes, não “faça média”: preserve a diferença e investigue como cada método chegou ao resultado.

IX. MENTALIDADE
1. Não iguale Mercúrio a inteligência nem Lua a “emoção”.
2. Use os dossiês pré-calculados de Lua/Mercúrio, almutens por grau, dispositores, relação mútua, condições e modificadores pertinentes.
3. Respeite separadamente as camadas Marcos, Frawley e Gugu.
4. Em Gugu, use evidência de lugar próprio/nodos/orientação/angularidade somente conforme o status de fonte registrado.
5. Partes e antíscios ligados a Lua/Mercúrio podem contextualizar o dossiê mental quando já materializados.
6. Mentalidade descreve disposições e materiais; não é sentença moral nem medida simples de QI.

X. GUGU — MOTIVAÇÃO PRIMÁRIA E POTÊNCIAS DA ALMA
1. Sequência da Motivação Primária: direção do Ascendente -> regente do Ascendente -> dispositor do regente/instrumento de realização -> candidato(s) de capacidade/planeta especialmente forte -> área de desafio de Saturno.
2. Não reduza Motivação Primária a profissão, MBTI, slogan ou “propósito de vida” determinístico.
3. As faculdades/potências planetárias são correspondências astrocaracterológicas analógicas; não são identidade ontológica e não são scores quantitativos de inteligência/personalidade.
4. Preserve liberdade humana, educação moral e a distinção entre material/disposição e realização pessoal efetiva.
5. Use a filosofia de Gugu como gramática de interpretação e ordenação simbólica, não como licença para acrescentar metafísica que não esteja ligada ao mapa e à pergunta.

XI. PROFISSÃO / HABILIDADES
1. Diferencie profissão/ação pública (X) do assunto da atividade (ex.: IX para filosofia/conhecimento superior), comunicação (III/Mercúrio quando pertinente), reputação/status e Motivação Primária.
2. Use o núcleo Marcos e o complemento Frawley do domínio somente como fornecidos.
3. Separe capacidade, inclinação, oportunidade pública e ocupação efetivamente exercida.
4. Não conclua profissão apenas porque um planeta é naturalmente associado a uma atividade.

XII. SAÚDE
1. Este motor oferece evidência simbólica de predisposição; não fornece diagnóstico médico.
2. Use H1/L1, H6/L6, temperamento, correspondências casa/corpo pertinentes, correspondências planeta-signo source-locked, Partes/estrelas e modificadores secundários contextuais quando conectados.
3. Nunca afirme certeza sobre uma doença a partir do mapa natal.
4. Diferencie localização simbólica, predisposição constitucional e evento/doença efetivamente ocorrida.

XIII. RELACIONAMENTOS, DINHEIRO, FAMÍLIA, RELIGIÃO E DEMAIS DOMÍNIOS
1. Use o(s) protocolo(s) selecionado(s) em NATAL_JUDGMENT_CONTEXT.
2. Não substitua a estrutura casa/regente por palavras-chave genéricas de planetas.
3. Use casas derivadas somente por rotas resolvidas pelo motor.
4. Em julgamento espiritual/religioso, diferencie as Partes espirituais/lógica de casa IX de Frawley das camadas Marcos e Gugu; não contamine fórmulas.
5. Em relações, separe significação do nativo, do outro, do vínculo e do prazer/atividade; não confunda automaticamente casa V com parceiro.
6. Em dinheiro, diferencie recursos próprios, recursos de outro, salário, herança, empréstimos e patrimônio conforme o roteamento fornecido.

XIV. ZONAS DE JULGAMENTO AUTORAL
1. Leia authorialJudgmentZones antes de concluir.
2. QUALITATIVE_SELECTION significa que o motor parou deliberadamente antes do juízo humano. Você pode sintetizar as evidências fornecidas, mas não criar algoritmo numérico não publicado.
3. DOCUMENTARY_BOUNDARY significa que a regra exata/cutoff/método atual não está disponível. Declare a fronteira somente se ela afetar materialmente a resposta.
4. CONTEXT_REQUIRED significa que a evidência só deve ser promovida porque a pergunta concreta a torna pertinente.
5. CONTRADICTION_CHECK significa que há testemunhos em tensão e a síntese deve explicar por que um pesa mais, ou preservar a ambiguidade quando não houver dominância legítima.

XV. LOOP DE AUTO-INVESTIGAÇÃO
Antes de responder, verifique internamente:
- Identifiquei a(s) casa(s) correta(s), inclusive derivadas quando aplicável?
- Verifiquei seus regentes?
- Verifiquei testemunhos diretos de casa/cúspide?
- Verifiquei significadores naturais pertinentes sem permitir que substituam a regência?
- Verifiquei dispositores e recepções?
- Verifiquei aspectos sob o gate autoral correto?
- Há Partes pertinentes ativas e qual é o dispositor delas?
- Há estrelas fixas interpretativamente admitidas?
- Há antíscios pertinentes?
- O temperamento importa para esta pergunta?
- A mentalidade importa?
- O Senhor da Natividade importa?
- A Motivação Primária de Gugu importa?
- O que contradiz a primeira impressão?
- Quais afirmações são fato calculado, regra autoral, inferência contextual e síntese?
- Estou confundindo duas descrições do mesmo testemunho com duas evidências independentes?
Se uma verificação essencial estiver faltando, continue investigando o pacote fornecido antes de responder. O checklist é interno: não exponha scratchpad, cadeia de pensamento ou raciocínio privado. Produza apenas as evidências e a síntese exigidas pelo contrato de resposta.

XVI. INFERÊNCIAS PROIBIDAS
- Nada de leitura de personalidade por signo solar.
- Nada de atalho “planeta no signo = você é X”.
- Nada de condenação moral por temperamento/configuração mental.
- Nada de biografia determinística a partir de uma posição.
- Nada de score oculto ou contagem de votos, salvo quando o dossiê autoral disser explicitamente que o método recuperado usa aquele ledger; mesmo assim, não exporte scores de auditoria como verdades independentes.
- Nada de regências modernas não verificadas.
- Nada de orbe, fórmula, técnica temporal, Parte, dignidade, recepção ou aritmética de casa derivada inventados.
- Nada de previsão a partir de uma pergunta radical estática, a menos que um módulo temporal tenha sido efetivamente executado e fornecido.
- Nada de usar biografia conhecida do nativo para “confirmar” o mapa quando ela não foi fornecida como contexto da pergunta.
- Nada de transformar exemplo/fixture conhecido (Amorth, Guénon, Schuon, Bento XVI etc.) em template para outro nativo.

XVII. MÉTODO DE SÍNTESE
1. Declare o domínio e os significadores selecionados.
2. Exponha os testemunhos convergentes mais fortes.
3. Exponha contradições e limitações materiais.
4. Diferencie camadas autorais quando contribuírem de maneiras distintas.
5. Faça o juízo qualitativo que restou ao astrólogo quando o motor o tiver delegado legitimamente.
6. Formule a conclusão mais específica que a evidência sustenta — nem mais, nem menos.
7. Diga o que continua condicionado a escolhas, circunstâncias, timing ou contexto ausente.
8. Quando houver alta convergência, priorize uma síntese clara em vez de repetir todas as possibilidades teóricas.

XVIII. BLOCOS OBRIGATÓRIOS DA RESPOSTA
DADOS_CALCULADOS: apenas os fatos do motor relevantes, de forma compacta.
TESTEMUNHOS: evidências pertinentes, com camada autoral/fonte e papel no julgamento.
SINTESE: juízo contextual do astrólogo artificial; não uma lista de palavras-chave.
INCERTEZAS_E_CONFLITOS: contradições, seleções qualitativas e fronteiras documentais que realmente importem.
CONTEXTO_NECESSARIO: somente contexto real adicional que poderia alterar materialmente o julgamento.

XIX. ESTILO DO JULGAMENTO
1. Responda em português brasileiro natural, preciso e profissional, salvo pedido explícito por outro idioma.
2. Não despeje o JSON, os nomes internos dos campos ou a engenharia do motor sem necessidade.
3. Não atribua uma frase a Marcos, Frawley ou Gugu se ela for sua síntese. Marque a distinção entre testemunho autoral e síntese do sistema.
4. Evite jargão desnecessário, mas preserve termos técnicos quando forem relevantes para justificar o juízo.
5. Não exponha raciocínio privado; apresente o caminho probatório de forma resumida e verificável.

COMANDO FINAL
Use NATAL_FACTS como evidência calculada imutável, NATAL_AUTHORIAL_DOSSIER como lei metodológica/de fonte e NATAL_JUDGMENT_CONTEXT como roteamento/checklist da pergunta concreta do usuário. Nunca calcule astrologia dentro do modelo de linguagem. Nunca infira uma manifestação concreta a partir de um único símbolo. Quando o motor chegar ao limite do determinismo, exerça a subjetividade disciplinada do astrólogo somente dentro das zonas explicitamente delegadas. Pense por composição, contexto, convergência, contradição e proveniência autoral estrita.
```


# APÊNDICE B — Registro formal de fronteiras de fonte

# MathAstro Natal — Registro formal de fronteiras de fonte / source-lock

Data original: 2026-08-28  
**Atualizado e superseded pelo closeout de 2026-09-01.**  
Escopo: **somente Natal ocidental radical**.

A referência normativa atual é `docs/NATAL_RECOVERABLE_CORPUS_CLOSEOUT_20260901.md`. Este arquivo mantém o nome histórico para não quebrar referências internas.

## Estados

- `RESOLVED_IMPLEMENTED`: regra recuperada e implementada.
- `EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED`: a geometria/evidência computável está pronta, mas a fonte não fixa um cutoff universal; não é bug de cálculo.
- `CURRENT_METHOD_NOT_PUBLIC`: o autor confirma a técnica atual, mas o algoritmo contemporâneo integral não está publicamente recuperado; o motor não o falsifica.
- `PARTIAL_RAW_EVIDENCE_ONLY`: reservado; **zero entradas radicais atuais**.
- `SOURCE_LOCKED_UNRESOLVED`: reservado; **zero entradas radicais atuais**.
- `REJECTED_UNVERIFIED`: alegação sem fonte direta suficiente; fica desligada.
- `OUTSIDE_STATIC_NATAL_EXECUTION`: técnica que exige execução temporal e não pertence ao radix estático.

## Estado atual do registry

| ID | Autor | Estado | Conduta do motor |
|---|---|---|---|
| `gugu-proper-places` | Gugu | `RESOLVED_IMPLEMENTED` | Calcula os lugares próprios recuperados sem score agregado. |
| `gugu-moon-nodes` | Gugu | `EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED` | Geometria e semântica completas; orbe autoral não inventado. |
| `marcos-node-orb` | Marcos | `EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED` | Apenas conjunção no modo Marcos; distância bruta preservada; nenhum orbe universal atribuído sem fonte. |
| `frawley-current-temperament-delta` | Frawley | `CURRENT_METHOD_NOT_PUBLIC` | Executa baseline publicado; separa doutrina pública atual do algoritmo atual exato. |
| `gugu-later-temperament-table` | Gugu | `RESOLVED_IMPLEMENTED` | Ledger tardio das aulas 10–11 recuperado e executável; considerações finais continuam qualitativas. |
| `gugu-temperament-node-angle-orb` | Gugu | `EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED` | Materializa geometria nodo→ângulo sem pontuar quando falta cutoff universal recuperado. |
| `frawley-current-loud-planets` | Frawley | `CURRENT_METHOD_NOT_PUBLIC` | Não cria `loudness score`; expõe as condições pertinentes para julgamento. |
| `frawley-current-general-fortune` | Frawley | `CURRENT_METHOD_NOT_PUBLIC` | Expõe substrato radical sem fingir o algoritmo proprietário atual. |
| `frawley-current-manner-delta` | Frawley | `CURRENT_METHOD_NOT_PUBLIC` | Variante publicada continua `legacy-published`, não “current”. |
| `frawley-profession-sunrise-criterion` | Frawley | `REJECTED_UNVERIFIED` | Critério desabilitado. |
| `prenatal-eclipse-physical-classification` | Frawley/camada astronômica | `RESOLVED_IMPLEMENTED` | Sizígia + intervalo físico de eclipse via Swiss Ephemeris; heurística nodal é apenas diagnóstica. |
| `marcos-dynamic-cusp-beyond-five` | Marcos | `EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED` | Entrega toda a dinâmica; não fabrica regra universal para exceções qualitativas >5°. |
| `frawley-current-timing-algorithms` | Frawley | `OUTSIDE_STATIC_NATAL_EXECUTION` | Pertence ao motor temporal. |
| `marcos-primary-directions-runtime` | Marcos | `OUTSIDE_STATIC_NATAL_EXECUTION` | Pertence ao motor temporal. |

## Resumo formal

```text
registry_entries = 14
RESOLVED_IMPLEMENTED = 3
EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED = 4
CURRENT_METHOD_NOT_PUBLIC = 4
REJECTED_UNVERIFIED = 1
OUTSIDE_STATIC_NATAL_EXECUTION = 2
PARTIAL_RAW_EVIDENCE_ONLY = 0
SOURCE_LOCKED_UNRESOLVED = 0
blocking_unresolved_radical = 0
```

## Certificação offline em 2026-09-01

- `npm run verify:natal:all` → **PASS / exit 0**.
- Cobertura estrutural: `STRUCTURAL_ALL_COVERED=True`.
- Regressões de produção: **53/53 PASS**.
- Estrelas fixas: **PASS**, 1.112 estrelas únicas.
- Eclipse físico: **PASS**.
- Barra Mansa: **PASS**.
- `NATAL_ISOLATION=PASS`.
- TypeScript focal: **PASS**.

A certificação de produção permanece separada: o runtime gate falha fechado neste ambiente por ausência local de `@swisseph/browser`; por consequência o `next build` não é declarado aprovado.

# APÊNDICE C — Matriz de cobertura estrutural

# MATRIZ DE COBERTURA ESTRUTURAL — NATAL → RELATÓRIO → IA

**Escopo:** esta matriz mede somente cobertura estrutural dos contratos. **NÃO certifica execução de produção.** A liberação para IA depende separadamente de `natalProductionValidation.status=PASS` e das regressões reais.

**Resultado estrutural:** COBERTO — 13/13 invariantes estruturais; 48/48 protocolos contratados.

## Auditoria estrutural

| Item | Estado | Evidência |
|---|---|---|
| 48 contratos 6–53 | 🟢 | count=48 missing=[] |
| Pacote planetário universal | 🟢 | planet packets + regências + aspectos/recepções/estrelas/nodos/antíscios |
| Pacote das 12 casas | 🟢 | house dossiers completos |
| Casas derivadas 12×12 | 🟢 | aritmética derivada materializada pelo motor |
| Contrato de não-recálculo da IA | 🟢 | IA interpreta; motor calcula |
| Relatório materializa os contratos | 🟢 | todos os contratos são emitidos; isto mede cobertura estrutural, não certificação de produção |
| API devolve relatório + análise + precisão | 🟢 | birth-chart POST |
| Fuso IANA fail-closed | 🟢 | sem inferência geográfica silenciosa |
| Sem pesos 1,25/0,75 na lógica ativa | 🟢 | modulação do temperamento qualitativa |
| Senhor da Natividade com desempate acidental source-locked | 🟢 | hierarquia essencial primeiro; apenas angularidade exclusiva resolve empate automaticamente; sem score de aspectos |
| Profissão Frawley source-locked | 🟢 | X + regente X + planetas X + Mercúrio/Vênus/Marte |
| Partes Marcos preservadas até 5° | 🟢 | contato da Parte não truncado pelo orb genérico de 3° |
| Validação de referência atualizada | 🟢 | fixture coerente com técnica atual |

## 48 protocolos

| § | Protocolo | Cobertura | Execução segura |
|---:|---|---|---|
| 6 | Temperamento - núcleo Marcos | COVERED | `READY_FOR_AI` |
| 7 | Senhor da Natividade - Marcos | COVERED | `READY_FOR_AI` |
| 8 | Manner - Frawley | COVERED | `READY_FOR_AI` |
| 9 | Mentalidade - método Marcos | COVERED | `READY_FOR_AI` |
| 10 | Mentalidade - complemento Frawley | COVERED | `READY_FOR_AI` |
| 11 | Mentalidade - suplemento Gugu | COVERED | `SOURCE_GATE` |
| 12 | Constituição geral, corpo e presença | COVERED | `READY_FOR_AI` |
| 13 | Saúde geral e predisposição a doenças | COVERED | `READY_FOR_AI` |
| 14 | Localização corporal de uma vulnerabilidade | COVERED | `READY_WITH_CONTEXT_GATE` |
| 15 | Acidentes e lesões | COVERED | `READY_WITH_CONTEXT_GATE` |
| 16 | Sofrimento psíquico, vícios e autossabotagem | COVERED | `READY_FOR_AI` |
| 17 | Vitalidade, longevidade e morte - Frawley atual | COVERED | `READY_FOR_AI` |
| 18 | Dinheiro e recursos próprios | COVERED | `READY_FOR_AI` |
| 19 | Salário, remuneração e benefícios do trabalho | COVERED | `READY_FOR_AI` |
| 20 | Heranças e dinheiro de mortos | COVERED | `READY_WITH_CONTEXT_GATE` |
| 21 | Dinheiro do cônjuge, parceiro, cliente ou outro | COVERED | `READY_WITH_CONTEXT_GATE` |
| 22 | Imóveis, terra, casa e patrimônio imóvel | COVERED | `READY_WITH_CONTEXT_GATE` |
| 23 | Loteria, ganhos do alto e apoios inesperados | COVERED | `READY_FOR_AI` |
| 24 | Empréstimos, bancos, contratos financeiros | COVERED | `READY_FOR_AI` |
| 25 | Romance, prazer e sexualidade | COVERED | `READY_FOR_AI` |
| 26 | Casamento, parceria e padrão relacional - Marcos | COVERED | `READY_FOR_AI` |
| 27 | Filhos, fertilidade e gravidez | COVERED | `READY_FOR_AI` |
| 28 | Pai, raízes e ancestralidade | COVERED | `READY_FOR_AI` |
| 29 | Mãe | COVERED | `READY_FOR_AI` |
| 30 | Irmãos, primos, vizinhos e pares cotidianos | COVERED | `READY_WITH_CONTEXT_GATE` |
| 31 | Amigos, benfeitores, esperanças e apoios | COVERED | `READY_WITH_CONTEXT_GATE` |
| 32 | Inimigos declarados, concorrentes e oposição | COVERED | `READY_FOR_AI` |
| 33 | Inimigos ocultos, confinamentos e restrições | COVERED | `READY_FOR_AI` |
| 34 | Comunicação, leitura, escrita e habilidades intelectuais básicas | COVERED | `READY_FOR_AI` |
| 35 | Rotina e atividades cotidianas | COVERED | `READY_FOR_AI` |
| 36 | Ensino superior, conhecimento, mestres e profissões eruditas como categoria | COVERED | `READY_WITH_CONTEXT_GATE` |
| 37 | Fé, religião e orientação espiritual | COVERED | `READY_FOR_AI` |
| 38 | Sonhos durante o sono | COVERED | `READY_FOR_AI` |
| 39 | Viagens curtas/rotineiras e deslocamentos | COVERED | `READY_WITH_CONTEXT_GATE` |
| 40 | Viagens longas, estrangeiro e peregrinação | COVERED | `READY_WITH_CONTEXT_GATE` |
| 41 | Profissão, habilidades e estilo de trabalho - Marcos | COVERED | `READY_FOR_AI` |
| 42 | Profissão - complemento Frawley verificado | COVERED | `READY_FOR_AI` |
| 43 | Honra, autoridade, chefes e posição pública | COVERED | `READY_FOR_AI` |
| 44 | Fama e notabilidade - suplemento Frawley | COVERED | `READY_WITH_CONTEXT_GATE` |
| 45 | Empregados, subordinados, prestadores e pequenos animais | COVERED | `READY_WITH_CONTEXT_GATE` |
| 46 | Grandes animais | COVERED | `READY_WITH_CONTEXT_GATE` |
| 47 | Circunstância natal não listada: roteador por casas derivadas | COVERED | `READY_WITH_CONTEXT_GATE` |
| 48 | Promessa radical antes de qualquer previsão | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 49 | Direções primárias - Marcos | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 50 | Progressões secundárias - Marcos | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 51 | Revolução Solar e Lunar - Marcos | COVERED | `TIMING_CONTEXT_REQUIRED` |
| 52 | Progressões, retornos e profecções - Frawley atual | COVERED | `TIMING+SOURCE_GATE` |
| 53 | Regra de convergência temporal | COVERED | `TIMING_CONTEXT_REQUIRED` |

## Legenda de execução

- `READY_FOR_AI`: relatório radical já fornece os dados técnicos para julgamento.
- `READY_WITH_CONTEXT_GATE`: o motor pré-calcula as alternativas técnicas, mas a IA precisa do contexto concreto para escolher o ator/subtema; ela não faz aritmética astrológica.
- `SOURCE_GATE`: o relatório entrega o que está source-locked e marca explicitamente a parte cuja regra exata não pode ser inventada.
- `TIMING_CONTEXT_REQUIRED`: o natal radical está pronto, mas executar previsão exige data/janela e módulo temporal calculado.
- `TIMING+SOURCE_GATE`: além da data, a técnica detalhada permanece limitada ao algoritmo efetivamente source-locked.

## Regra final

A matriz não transforma lacuna documental ou ausência de data em cálculo fictício. Ela responde apenas: **o contrato existe e a evidência exigida tem uma rota de materialização/gate?** O selo de produção pertence exclusivamente ao validador runtime e às regressões.

# APÊNDICE D — Paridade por casos autorais

# Natal Author Case Parity — 2026-09-01

This closeout hardens the Natal engine against worked public natal examples used by Marcos Monteiro rather than relying only on structural coverage.

## Cases audited

- Gabriele Amorth: Ascendant ruler Venus, major essential dignity, close solar combustion with Marcos major-dignity mitigation, and close opposition to Saturn ruling the subterranean fourth-house axis.
- René Guénon: temperament and mentality, contextual Moon/Mercury contacts with Arabic Parts and antiscia, fixed-star context, and prenatal lunation/eclipse links to the natal chart.
- Frithjof Schuon: temperament, Moon/Mercury mentality, angular/fixed-star evidence, Parts and contextual contacts.
- Benedict XVI: health significators, traditional planet-in-sign medical correspondences, Arabic Parts, house/body symbolism, and outer-planet modifiers on any house cusp (including cusp V).

## Corrections discovered by the case audit

1. Frawley Part of Faith corrected to Ascendant + Mercury - Moon (The Real Astrology Applied, p. 177).
2. Mentality dossiers now preselect relevant Arabic Part and antiscion contacts involving Moon/Mercury.
3. Prenatal lunation/eclipse charts now expose raw links to natal planets, all twelve cusps and Parts; the 3°/5° bands are screening bands, not claimed as a special eclipse doctrine.
4. Health dossiers now include the traditional planet-in-sign body correspondence table invoked by Marcos in his Benedict XVI example.
5. Outer planets may be preserved as secondary modifiers on any of the twelve house cusps, without rulership, essential dignity or almuten participation.
6. Worked-example regression fingerprints were added for Amorth, Guénon and Benedict-style evidence.

## Verification

- Production regressions: 60/60 PASS.
- Structural coverage: PASS.
- Fixed-star sky: PASS.
- Physical eclipse classifier: PASS.
- Barra Mansa reference validation: PASS.
- Natal isolation: PASS.
- Focal TypeScript: PASS.

## Boundary

The engine is designed for evidence parity, not paragraph memorization. It precomputes and prioritizes the technical witnesses needed for authorial-style judgement; the interpretive synthesis remains a judgement task. Current non-public authorial procedures remain explicitly source-gated rather than reconstructed from guesswork.

Production deployment certification remains a separate gate: `npm run verify:natal:release` requires the local `@swisseph/browser` runtime/WASM dependency and a successful Next build.

---

## Atualização posterior — camada Absolute AI

A auditoria de paridade por casos foi usada como base para a camada de julgamento open-world implementada em 01/09/2026. O estado atual não depende de memorizar Amorth/Guénon/Schuon/Bento XVI: os casos permanecem fixtures de competência, enquanto `src/app/lib/natalJudgmentEngine.ts` entrega três camadas (`NATAL_FACTS`, `NATAL_AUTHORIAL_DOSSIER`, `NATAL_JUDGMENT_CONTEXT`), grafo de evidência autoral, roteamento semântico/derivado, zonas de julgamento e Prompt Absoluto.

Ver `docs/NATAL_ABSOLUTE_AI_ARCHITECTURE_20260901.md`.

# APÊNDICE E — Definição final de integralidade

O método é considerado **integral dentro do escopo radical recuperável** quando:
- toda pergunta natal concreta tem rota para uma ou mais casas/significadores ou para roteamento semântico open-world;
- todos os fatos astronômicos/técnicos necessários são calculados pelo motor;
- os três autores permanecem separados;
- toda lacuna não publicada é marcada;
- toda seleção qualitativa fica delegada ao astrólogo com evidência suficiente;
- a IA não precisa inventar aritmética, técnica, cutoff ou biografia;
- casos conhecidos servem como regressão de competência;
- técnicas temporais só entram após execução do motor temporal correspondente.

Isso não significa que “toda frase que um astrólogo poderia dizer” foi codificada. Significa algo mais útil: **a gramática, os significadores, as relações, os protocolos e o mecanismo de julgamento foram estruturados de modo aberto o bastante para compor circunstâncias novas sem sair do método.**
