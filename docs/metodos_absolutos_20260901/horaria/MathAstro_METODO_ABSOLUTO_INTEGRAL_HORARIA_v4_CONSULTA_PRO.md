# MÉTODO ABSOLUTO E INTEGRAL DE ANÁLISE HORÁRIA — MATHASTRO

**Versão canônica:** 4.0 — 1º de setembro de 2026  
**Escopo:** Astrologia Ocidental Tradicional — **HORÁRIA SOMENTE**.  
**Eixo autoral:** Marcos Vinicius Monteiro (eixo canônico do projeto) + John Frawley (fundamentos e trilho publicado verificável) + Luiz Gonzaga de Carvalho Neto — Gugu (suplemento técnico/documentado e variantes explicitamente separadas).  
**Objetivo:** condensar em uma única gramática operacional tudo o que foi recuperado e estruturado para que um motor determinístico + um astrólogo/IA consigam julgar perguntas horárias previstas **e circunstâncias novas não enumeradas**, sem transformar interpretação em palavras-chave, sem inventar regras e sem misturar ramos astrológicos.

---

## 0. O que significa “absoluto e integral” neste documento

“Absoluto” significa **operacionalmente fechado dentro do corpus e do escopo**, não “infalível” e não “acesso a técnica privada não publicada”. A integralidade procurada tem seis camadas:

1. **Astronomia e cálculo:** céu, casas, regentes, movimento e cronologia objetiva.
2. **Ontologia:** pessoas, objetos, instituições, casas, papéis e relações.
3. **Composição semântica:** como representar situações humanas potencialmente infinitas usando as doze casas e turning recursivo.
4. **Gramática decisória:** como distinguir pergunta de evento, estado, verdade, localização, timing, escolha, posse, sobrevivência etc.
5. **Protocolos temáticos:** regras recuperadas para assuntos recorrentes e exceções documentadas.
6. **Julgamento profissional:** como a IA/astrólogo transforma o dossiê técnico em resposta causal, contextual, clara e auditável.

A universalidade pretendida é:

> **qualquer pergunta que pertença legitimamente à astrologia horária tradicional deve poder ser decomposta em atores + assuntos + relações + casas radicais/derivadas + significadores + uma ou mais intenções decisórias; tudo o que for mecanizável é fechado pelo motor e tudo o que continuar qualitativo é entregue à IA/astrólogo com fronteira explícita.**

O sistema nunca promete acertar sempre. Ele promete uma coisa mais útil: **não esconder lacuna, ambiguidade ou subjetividade dentro de um cálculo falso**.

Não pertence a este módulo: natividade, temperamento natal, mentalidade natal, potências/faculdades da alma, sinastria, eletiva, revoluções, progressões, astrologia mundana genérica ou védica. Se uma pergunta exigir outro ramo, o sistema deve marcar `OUT_OF_SCOPE_HORARY`.

---

## 1. Princípio-mãe: o motor calcula; o astrólogo julga

### Motor determinístico
Responsável por, quando disponíveis no pacote:
- data/hora/lugar da pergunta;
- zodíaco e casas Regiomontanus;
- cúspides e regentes tradicionais;
- posições e velocidades planetárias;
- retrogradação, estações e mudança de direção;
- dignidades essenciais e debilidades;
- condição acidental;
- condição solar: cazimi, combustão, sob os raios e contatos solares;
- casas ocupadas e proximidade de cúspides/ângulos;
- recepções direcionais;
- aspectos corporais aplicativos/separativos e possibilidade real de perfeição;
- antíscios e contra-antíscios;
- sequência lunar e Lua VOC;
- tradução, coleta, proibição, frustração, refranação e candidatos de interferência;
- cronologia futura por efeméride para estações, ingressos, contatos e impedimentos;
- qualidades dos signos quando o módulo as ativa;
- casas derivadas e turning compilado;
- papéis semânticos já resolvidos;
- notas de fonte, variantes e considerações antes do julgamento;
- fatos de timing: arcos, graus e eventos de cronologia.

### Astrólogo/IA
Responsável por:
- compreender o sentido real da pergunta;
- distinguir pergunta principal de subperguntas;
- decidir quem é quem quando a frase humana é semanticamente aberta;
- escolher se uma relação é radical ou realmente “X de Y”;
- decidir qual testemunho é pertinente ao contexto;
- interpretar dignidades, recepções, casas, mudanças, aspectos e interposições;
- escolher entre manifestações simbólicas plausíveis sem exceder a evidência;
- escolher unidade de timing quando a fonte deixa espaço qualitativo;
- preservar divergência entre autores;
- redigir a consulta em linguagem humana.

### Regra de ferro
A IA **não recalcula** nem altera longitudes, casas, regentes, movimento, cronologia, aplicação/separação ou aritmética derivada. Se falta dado objetivo, `MISSING_ENGINE_DATA`. Se falta contexto humano capaz de mudar o roteamento, `NEEDS_CLARIFICATION`. Se falta regra recuperada, `SOURCE_RULE_REQUIRED`.

---

## 2. Hierarquia e separação autoral

### Marcos Monteiro — eixo canônico
Usar primeiro quando há regra horária direta recuperada de seus textos, vídeos, aulas ou casos. Preservar particularidades demonstradas por caso sem universalizá-las automaticamente.

### John Frawley — fundamento e trilho publicado
Usar *The Horary Textbook*, *The Real Astrology Applied* e casos publicados para casas, turning, recepções, perfeição, Lua, impedimentos, timing e protocolos temáticos quando recuperados. Quando Marcos e Frawley diferirem, não fundir silenciosamente.

### Gugu — suplemento documentado
Usar somente o que foi recuperado em cursos/transcrições e marcar divergências como `AUTHORIAL_VARIANT_GUGU`. Particularmente: nascimento da pergunta, default, considerações antes do julgamento, timing e algumas leituras de antíscio.

### Regra de divergência
Se duas fontes sustentadas realmente divergem: `AUTHORIAL_DIVERGENCE`. Explicar os dois trilhos e dizer qual o modo ativo. Nunca fazer média.

### Códigos de proveniência recomendados
- `M-HX`: Marcos em *Horary Examples*.
- `M-YT`: Marcos, vídeos/transcrições/aulas.
- `M-IG`: Marcos, material de Instagram/Q&A.
- `M-OP`: reconstrução operacional MathAstro limitada às regras de Marcos recuperadas.
- `F-HT`: John Frawley, *The Horary Textbook*.
- `F-RAA`: John Frawley, *The Real Astrology Applied*.
- `F-HX`: casos de Frawley em *Horary Examples*.
- `G-COSMO`: curso/transcrições de Cosmologia e Astrologia Medieval de Gugu.
- `G-OP`: reconstrução operacional MathAstro limitada ao material recuperado.
- `MA-ENGINE`: regra de infraestrutura/cálculo/isolamento do MathAstro.
- `CASE-PARITY`: caso histórico usado como teste de competência, nunca como template biográfico.

---

## 3. Nascimento da pergunta, sinceridade e legitimidade

1. A horária nasce quando a pergunta é **compreendida e aceita** pelo astrólogo/motor. Se foi necessário esclarecer o sentido, esclarecer antes de fixar o momento quando essa é a política ativa.
2. Registrar hora e lugar com precisão suficiente para o cálculo.
3. A pergunta deve ser genuína e suficientemente definida para que exista algo que possa ser julgado.
4. A mesma pergunta na mesma situação usa a primeira carta; repetir para obter resposta diferente não cria nova horária. Nova carta exige mudança real da situação/pergunta.
5. A resposta positiva deve ser definida concretamente: “o que conta como sucesso?”
6. Se a pergunta contém várias subperguntas que usam mecanismos distintos, separá-las antes de julgar.
7. Considerações tradicionais não invalidam automaticamente a carta no canônico Marcos/Frawley; funcionam como cautelas/diagnósticos. Preservar a variante Gugu quando aplicável.

Campos mínimos de question-birth:
```text
questionText
questionContext
questionUnderstood
questionAccepted
questionBirthNote
positiveOutcomeDefinition
repeatedQuestionStatus
changedSituation
```

---

## 4. Ontologia absoluta da horária

- **Signos = qualidades/condições**, não agentes humanos por si mesmos.
- **Planetas = agentes/significadores** depois que seu papel foi determinado.
- **Casas = campos/relacionamentos de assunto**.
- **Regente tradicional da cúspide = significador primário do assunto**, salvo regra temática específica.
- **Aspecto = possibilidade/contato/ação**, não sentimento.
- **Recepção = disposição, afeição, aversão, interesse, dependência ou prioridade**, não evento.
- **Dignidade essencial = qualidade/coerência do agir**; **acidental = capacidade/circunstância de agir**.
- **Dispositor = quem hospeda/controla o significador em certo nível**.
- **Parte = ponto de assunto**, não agente autônomo.
- **Antíscio = contato por correspondência**, não “segredo” automático.
- **Cronologia = ordem real dos acontecimentos planetários futuros**, distinta do timing simbólico.
- **Default = curso natural da situação se nada exigir mudança**.

A mesma entidade pode ter papéis diferentes. Um Mercúrio pode ser L2, natural da comunicação, significador de um prestador, dispositor de outro planeta e agente numa proibição. **Nunca interpretar o planeta antes do papel.**

---

## 5. Arquitetura absoluta de dados

A IA deve receber camadas separadas:

```text
HORARY_QUESTION_CONTEXT
  pergunta, contexto, nascimento, definição de sucesso, papéis humanos

HORARY_FACTS
  céu calculado, cúspides, posições, velocidades, dignidades, recepções,
  aspectos, Lua, antíscios, condições solares, cronologia

HORARY_SEMANTIC_FRAME
  atores, relações, casas radicais/derivadas, ambiguidades e provenance

HORARY_CAUSAL_DOSSIER
  perfeições, impedimentos, mediações, mudanças, default, timing-base

HORARY_AUTHORIAL_DOSSIER
  regras autorizadas, variantes, fronteiras e evidências recuperadas

HORARY_AI_HANDOFF
  tarefas que continuam interpretativas + campos imutáveis
```

Depois:
```text
PROMPT_ABSOLUTO_HORARIA_PTBR
        +
pacote absoluto
        ↓
ASTRÓLOGO/IA
        ↓
DADOS_CALCULADOS
MAPA_DE_PAPEIS
TESTEMUNHOS
CADEIA_CAUSAL
JULGAMENTO
TIMING (se houver)
SUBJETIVIDADE_DECLARADA
FONTES_E_VARIANTES
```

---

## 6. Algoritmo universal de investigação

Para qualquer horária:

1. Entender exatamente a pergunta.
2. Definir o que seria “sim”, “não”, “melhor”, “verdade”, “recuperação” etc.
3. Separar subperguntas.
4. Identificar atores, objetos, instituições, propriedades e relações.
5. Resolver casas radicais.
6. Resolver casas derivadas apenas quando “X de Y” for real.
7. Eleger significadores principais e auxiliares.
8. Classificar a intenção decisória: evento, estado, qualidade, localização, timing, verdade, escolha, recuperação, quantidade, causa, relação, posse, sobrevivência ou soltura.
9. Ler condição essencial e acidental dos significadores.
10. Ler recepções direcionais.
11. Se houver evento, procurar a perfeição real.
12. Ler a Lua e a sequência causal.
13. Verificar tradução, coleta, proibição, frustração, refranação, mudanças de signo, estações e contatos solares.
14. Verificar antíscios/contra-antíscios quando pertinentes.
15. Aplicar default e contexto.
16. Produzir o julgamento do evento/estado.
17. Somente depois, resolver timing.
18. Converter a estrutura em linguagem de consulta profissional.
19. Explicitar subjetividade residual, divergência autoral e limites.
20. Rodar o protocolo anti-erro antes de entregar.

---

## 7. As doze casas como linguagem aberta

A lista abaixo é eixo semântico, não dicionário fechado.


| Casa | Princípio | Exemplos de manifestações legítimas |
|---:|---|---|
| 1 | O próprio sujeito/querente e aquilo que lhe é imediatamente próprio. | querente; pessoa tomada como sujeito; corpo; cabeça/face; voz; nome/identidade. |
| 2 | Aquilo que o sujeito possui, usa, guarda, recebe ou perde como recurso móvel. | dinheiro; recursos financeiros; posses móveis; objeto móvel; bolso/conta; recursos materiais. |
| 3 | Mesmo nível geracional, vizinhança, circulação rotineira e comunicação cotidiana. | irmãos; parentes da mesma geração; vizinhos; mensagens; comunicação rotineira; deslocamento local; ensino elementar; estudantes. |
| 4 | Raiz, terra, casa, patrimônio imóvel e término formal de certos assuntos. | pai; pais; ancestralidade; lar; terra; imóvel; pátria; fim do assunto; veredicto; prognóstico contextual; coisa enterrada. |
| 5 | Geração, prazer, criação e atividades prazerosas/competitivas. | filhos; gravidez; sexo; prazer; diversão; esporte como atividade; obra criada; mensageiro; variante anatômica documentada de Marcos. |
| 6 | Enfermidade, serviço subordinado e animais pequenos/domesticáveis. | doença; hospital; subordinado; empregado; prestador operacional; serviço; pequenos animais; parentes colaterais tradicionais em usos específicos. |
| 7 | O outro em relação direta: parceria, contraparte, confronto e certas relações profissionais. | cônjuge; parceiro; amante; parceiro comercial; cliente; contraparte; inimigo aberto; oponente; inquilino moderno em negócio; médico tratante; outra pessoa sem relação mais específica. |
| 8 | Morte e, por derivação relacional, dinheiro/posses da contraparte. | morte; dinheiro da VII como II da VII; para pessoa específica, preferir II da casa dessa pessoa. |
| 9 | Conhecimento superior, fé, estrangeiro, viagens significativas, sonhos e saber especializado. | universidade; professor; sacerdote; religião; país estrangeiro; viagem longa; peregrinação; sonho; previsão; astrólogo; pessoa erudita. |
| 10 | Ação pública, ofício, autoridade, governo, decisão superior e mãe. | carreira; emprego; chefe; autoridade; governo; governante; juiz/processo; mãe; honra; ação pública; preço do imóvel; tratamento médico em Frawley. |
| 11 | Amigos, dádivas, esperanças e recursos que descem da autoridade/emprego. | amigos; presentes; esperança/desejo; salário como II da X; dinheiro do governo; concessão governamental; windfall/loteria; assessores; criança a adotar quando é filho de “outros”. |
| 12 | Confinamento, autossabotagem, ocultação hostil e animais grandes. | prisão/cativeiro; self-undoing; inimigo oculto; tentação; problema psicológico em gramática histórica; animal grande; childbed; garagem/estábulo em localização. |

**Regra:** se o assunto não estiver literalmente listado, localizar o princípio correspondente e compor a relação. Não usar palavras-chave como classificador rígido.

---

## 8. Casas derivadas — a chave para circunstâncias infinitas

Se uma coisa realmente pertence a outra pessoa/entidade:

```text
casa da pessoa = sua I derivada
assunto relativo = casa relativa do assunto
resultado = casa radical obtida pela composição
```

Exemplos:
- vizinho = III;
- dinheiro do vizinho = II da III = IV;
- filho do vizinho = V da III = VII;
- casa do vizinho = IV da III = VI;
- mãe = X;
- irmão da mãe = III da X = XII;
- dinheiro do irmão da mãe = II da XII = I;
- dinheiro do cônjuge = II da VII = VIII;
- filho de “outras pessoas” para adoção = V da VII = XI.

### Regra contra turning excessivo
Turning só é legítimo se “X de Y” tiver realidade astrológica. “Universidade do meu filho” normalmente continua IX radical porque a instituição não pertence ao filho. “Dinheiro do meu filho” é II da V porque o recurso é dele.

### Coocorrência não implica posse
“Problema financeiro com vizinho” não é automaticamente dinheiro do vizinho. Pode envolver:
- vizinho III;
- meu dinheiro II;
- dinheiro dele II da III;
- imóvel IV;
- dano/contrato VII;
- processo judicial I/VII/X/IV.
A IA deve entender a relação antes de o motor julgar.

### Morte e prisão de terceiros
Quando a técnica exigir, examinar VIII/XII derivada **e radical**. O motor pode materializar ambas para evitar uma escolha silenciosa prematura.

---

## 9. Gramática decisória universal

O tópico é um atalho; não é o algoritmo. O algoritmo nasce das intenções abaixo.


| Arquétipo | Função |
|---|---|
| `EVENT_PERFECTION` | Algo acontecerá? Exige contato/perfeição real ou gatilho tópico equivalente, com cronologia e impedimentos. |
| `STATE_CONDITION` | Como está uma situação já existente? Prioriza condição, posição, recepção e continuidade; não exige aspecto por reflexo. |
| `QUALITY_EVALUATION` | É bom/ruim/adequado/autêntico? Julga condição própria do significador e modificadores pertinentes. |
| `LOCATION_PLACEMENT` | Onde está? Usa casa corporal, signo, elemento, modalidade, angularidade, dispositor e pistas tópicas. |
| `TIMING_SCALE` | Quando? Só depois de provar o evento; converte arco em unidade contextual sem confundir com tempo efemérico real. |
| `TRUTH_STABILITY` | É verdade? Usa protocolo de verdade/fixidez e o significador correto da informação/sonho/predição. |
| `CHOICE_COMPARISON` | Qual opção? Compara alternativas concretas, suas casas, condição e efeitos; não inventa opções. |
| `RECOVERY_RETURN` | Voltará/será encontrado? Procura retorno/reaproximação, ligação ao querente/posse e gatilhos de recuperação. |
| `QUANTITY_STRENGTH` | Quanto? Usa força/condição do significador do recurso ou objeto medido, sem score universal. |
| `CAUSE_AFFLICTION` | Qual a causa? Identifica afligente/dispositor/encadeamento causal sem transformar coincidência em causa. |
| `RELATIONSHIP_RECEPTION` | O que sente/como se relaciona? Recepções direcionais e estado; evento relacional fica separado. |
| `POSSESSION_TRANSFER` | Dinheiro/objeto chega a quem? Identifica proprietário atual e perfeição de transferência. |
| `SURVIVAL_DEATH_CHAIN` | Sobrevive/morre? Compara pessoa com VIII radical/derivada e interposições; antíscio sozinho não substitui corpo onde a fonte o proíbe. |
| `RELEASE_CONFINEMENT` | Será solto? Examina cativeiro, saída da condição, ingresso/egresso, mudança de poder e timing. |

Uma pergunta inédita pode combinar vários arquétipos. Ex.: sequestro = sobrevivência + confinamento + soltura + timing; objeto perdido = localização + recuperação; relacionamento = recepção + estado + eventual evento.

---

## 10. Eleição de significadores

1. Regentes tradicionais das casas relevantes são primários.
2. Sol, Lua, Mercúrio, Vênus, Marte, Júpiter e Saturno governam signos; transaturninos nunca recebem regência tradicional no modo canônico.
3. Lua é cosignificadora geral do querente quando não está ocupada por papel incompatível e quando o tópico não tem regra própria que limite isso.
4. Significadores naturais são auxiliares: Mercúrio comunicação/internet; Marte cirurgia/ferimento; Saturno prisão; Sol/Vênus em relações quando a regra de fonte permitir etc.
5. O auxiliar nunca substitui silenciosamente L1/L7/L10 etc.
6. Se dois papéis principais precisarem interagir e caírem no mesmo planeta, não fabrique aspecto do planeta consigo mesmo; procure cosignificador/alternativa somente se a fonte e o caso exigirem.
7. Em pessoa específica, prefira a relação real (mãe X, irmão III, empregado VI) a um “qualquer outro” VII.

---

## 11. Dignidade essencial e condição acidental

### Essencial
Registrar separadamente:
- domicílio;
- exaltação;
- triplicidade segundo o sistema ativo;
- termo;
- face;
- detrimento;
- queda;
- peregrinação.

Não transformar tudo em score total universal.

### Acidental
Considerar conforme o dossiê:
- angular/sucedente/cadente;
- proximidade a cúspide/ângulo;
- movimento direto/retrógrado;
- velocidade;
- estação;
- combustão/cazimi/sob raios;
- posição na casa do outro;
- ingresso iminente;
- contatos nodais/estelares quando autorizados.

### Interpretação
Essencial responde mais a “como/qualidade”; acidental a “quanto consegue agir/manifestar”. Em processos e competições a força acidental pode ser especialmente decisiva. Em qualidade de objeto/pessoa, essencial pode ser central.

---

## 12. Recepções — sentimentos, disposição e poder relacional

1. Recepção é direcional: A recebe B de modo diferente de B receber A.
2. Domicílio/exaltação indicam estima/valorização forte; detrimento/queda, aversão/depreciação; dignidades menores refinam.
3. Recepção não cria aspecto nem evento.
4. Em perguntas de sentimentos, a recepção pode responder diretamente sem aspecto obrigatório.
5. Em evento, recepção pode facilitar, motivar, permitir, impedir ou explicar por que alguém age, mas a ação precisa de perfeição/gatilho quando mudança é necessária.
6. Recepção mútua não deve ser promovida a “sim automático” fora das regras documentadas.
7. Em relacionamento, distinguir pessoa, cabeça/coração/cosignificadores naturais quando o caso/source os usa; não misturar papéis.

---

## 13. Aspectos e perfeição — núcleo do evento

### Regra fundamental
Para evento importa **perfeição exata futura**, não um portão arbitrário de 12°/moiedades que impeça a existência da aplicação. O motor deve usar a relação dos signos e o movimento real. Conjunção corporal não atravessa fronteira de signo só por distância física pequena.

### Perguntas essenciais
- Os significadores se contemplam por aspecto ptolomaico no estado atual?
- Qual planeta aplica?
- O aspecto aperfeiçoa exatamente?
- Quanto o aplicante precisa realmente percorrer?
- Antes da perfeição ocorre estação, ingresso, Sol, terceiro planeta ou outro impedimento?
- A perfeição acontece depois de mudança de signo? Se sim, o caso/source permite atravessar essa fronteira ou a mudança frustra o evento atual?

### Natureza do aspecto
Conjunção une; sextil/trígono facilitam; quadratura/oposição podem produzir com dificuldade, custo, conflito ou arrependimento conforme contexto. O aspecto não é moralmente bom/ruim isoladamente.

### Separação
Aspecto separativo normalmente descreve algo já ocorrido. Em perguntas sobre passado — “foi roubado?”, “já aconteceu?” — isso pode ser precisamente o que importa.

---

## 14. A Lua como organismo da pergunta

A Lua pode:
- cosignificar o querente;
- mostrar sequência dos acontecimentos;
- traduzir luz;
- ser objeto/papel temático em certos mapas;
- mostrar eleitorado em eleições;
- mostrar fluxo/estado em casos tópicos.

Perguntas obrigatórias:
1. O que a Lua acabou de fazer?
2. A que aplica agora?
3. O que faz antes de sair do signo?
4. Há mudança de signo relevante?
5. Está VOC pelo critério ativo?
6. O último aspecto é mais relevante porque o evento já terminou e só o resultado é desconhecido?
7. A Lua está combust ou incapaz de efetivar aquilo que deveria carregar?

VOC não é “nada acontece em qualquer universo”; é testemunho de pouca mudança e deve ser lido com default e tema.

---

## 15. Mediação e impedimentos

### Tradução de luz
Planeta rápido separa de A e aplica a B, levando a relação. A tradução pode também ser futura dentro da sequência, desde que a cronologia seja real e os contatos ocorram na ordem correta.

### Coleta de luz
Um planeta mais lento recebe aplicações de dois significadores, reunindo-os. Verificar capacidade e relação do coletor.

### Proibição
Um terceiro contato acontece antes da perfeição necessária e impede/redireciona o evento. Não basta “aspecto qualquer antes”; deve haver pertinência causal segundo a técnica.

### Proibição da proibição
Uma cadeia pode mostrar o planeta que proibiria sendo ele próprio impedido antes de efetuar a proibição. Resolver por ordem cronológica, não por lista estática.

### Frustração
A rota deixa de poder aperfeiçoar por mudança de estado/ingresso/contato que desfaz a condição necessária.

### Refranação
Um significador estaciona/retrograda ou muda seu movimento de modo que desiste da perfeição que parecia iminente.

### Interposição solar
Conjunção com o Sol/combustão pode ser hard stop em vários contextos; respeitar exceções e fonte.

---

## 16. Estações, retrogradação, ingressos e condições solares

- Estações são extremamente importantes: podem mostrar parada, mudança de intenção/curso, reversão ou impedir perfeição.
- Retrogradação pode simbolizar retorno/reconsideração/reversão quando o contexto sustenta; não é “ruim” universal.
- Mudança de signo pode mudar dignidade, recepção, voz, fertilidade, poder e relação antes de o evento ocorrer.
- Cazimi, combustão e sob os raios devem respeitar o critério do motor e fronteira de signo quando aplicável.
- Em objeto perdido, saída de combustão pode indicar momento em que o objeto volta a ser visto, se o restante já promete recuperação.
- Em serviço/comunicação, ingresso de signo vocal para mudo pode ser gatilho de corte quando o tema e significador natural sustentam.

---

## 17. Antíscios e contra-antíscios

1. Antíscio pode agir como contato significativo quando a técnica/caso o admite.
2. Contra-antíscio funciona como relação de oposição por antíscio.
3. Contato antiscial não é automaticamente “secreto”; essa leitura só entra se o contexto pede ocultação/não-obviedade.
4. Em morte, gravidez e doença, antíscio sozinho não deve substituir o contato corporal quando a fonte exige bodily contact.
5. A cronologia antiscial pode participar de proibição/interposição se ocorre antes do evento principal.
6. Não procurar antíscios infinitamente após múltiplos ingressos como se toda futura correspondência pertencesse ao estado inicial da pergunta.

---

## 18. Qualidades dos signos

Use apenas quando pertinentes:
- modalidade: cardinal/fixa/mutável;
- elemento: fogo/terra/ar/água;
- fertilidade/barrenness;
- vocalidade/mudez;
- humano/bestial/feral;
- duplicidade/mutabilidade;
- direção/localização quando a fonte específica usa.

Essas qualidades refinam o mecanismo principal; não o substituem.

### Voz
Água = mudo; Gêmeos/Virgem/Libra = voz forte; Áries/Touro/Leão/Sagitário = meia-voz; Capricórnio/Aquário = voz fraca, no esquema Frawley recuperado. Útil para comunicação e certos julgamentos profissionais/relacionais.

### Fertilidade
Água fértil; Gêmeos/Leão/Virgem barren no esquema citado; demais neutros. Em gravidez atual, signo barren não pode superar sozinho evidência clara de estado; em “will I ever?” ganha mais peso.

---

## 19. Partes, nodos, estrelas e transaturninos

### Parte da Fortuna
Não é “dinheiro” por padrão em horária. Use quando o tópico/source a torna pertinente e como marcador auxiliar, não substituto da casa/regente.

### Outras Partes
Somente quando houver fórmula e regra documentadas. Evitar decorar a carta com dezenas de Partes.

### Nodos
Usar conjunções e modificações conforme a regra recuperada; não importar significados modernos genéricos.

### Estrelas fixas
Apenas contatos estreitos, pertinentes e source-locked; nunca substituir significadores principais.

### Urano/Netuno/Plutão
Podem ser observados como modificadores contextuais quando um caso/source os usa, mas **não governam casas** e não recebem dignidades tradicionais no modo canônico.

---

## 20. Considerações antes do julgamento

Registrar:
- ASC inicial/final;
- Lua VOC;
- Saturno na VII quando relevante;
- relação da hora planetária quando esse módulo estiver disponível;
- outras cautelas documentadas.

No canônico Marcos/Frawley, elas não são veto automático. Em Gugu podem formar um conjunto mais cautelar; uma consideração isolada geralmente não basta. Se o módulo de hora planetária não estiver calculado, não inventar.

---

## 21. Default — a resposta natural antes de procurar exceção

Pergunte: se nada mudar, o que acontece?

- “Continuarei empregado?” pode ter default de continuidade.
- “Meu gato voltará?” pode ter um default contextual diferente conforme a situação e testemunhos.
- “Vou casar algum dia?” exige considerar plausibilidade/idade/contexto e potencial antes de forçar aspecto.
- Lua VOC frequentemente reforça manutenção do status quo.
- Em long-term “will I ever?”, certas proibições comuns podem ser ultrapassadas **depois** de o “sim” já ter sido estabelecido; estação e Sol permanecem hard limits no exemplo Frawley recuperado.

Default não é chute sociológico; precisa ser explicitamente razoável e compatível com a pergunta.

---

## 22. Timing — separar arco simbólico de efeméride real

1. Nunca dar timing antes de estabelecer que o evento ocorre.
2. O aspecto/gatilho que prova o evento geralmente fornece o arco.
3. Preferir calibração por evento passado conhecido quando clara; é o método mais confiável documentado por Frawley.
4. Graus → unidades simbólicas, escolhidas por contexto + signo + casa + método autoral.
5. A efeméride serve para verificar **ordem real**: estação, ingresso, perfeição, combustão, interposição. Ela não converte automaticamente 5,5° em 5,5 dias reais.
6. Marcos/Frawley e Gugu possuem variantes de velocidade por signo/casa; manter trilhos separados.
7. Frawley permite exceções em que se usa distância ao lugar atual do planeta aplicado ou charts “sign-only”; não universalizar.
8. Datas mencionadas e limites temporais podem ser relevantes quando a técnica documentada permite.
9. Responder em precisão proporcional ao método; não fabricar minuto exato para parecer técnico.

### Separação das escalas
```text
HORARY_SYMBOLIC_ARC = graus/unidades usados no julgamento
EPHEMERIS_EVENT_TIME = quando o planeta realmente estaciona/ingressa/perfeiçoa
```
Ambas podem coexistir e ter funções diferentes.

---

## 23. Como transformar técnica em consulta profissional

A consulta não deve ser um dump de dados. Ela deve responder:
1. **Quem é quem?**
2. **Como cada parte está?**
3. **O que cada parte quer/aceita/rejeita?**
4. **Existe ação capaz de ligar/separar as partes?**
5. **O que acontece antes?**
6. **O default muda?**
7. **Qual o juízo?**
8. **Quando, se puder ser julgado?**
9. **Que parte depende de subjetividade/contexto?**

### Frase causal
Em vez de “L1 bom, L7 ruim, trígono”, formular: “o querente tem capacidade de agir; a outra parte está debilitada e pouco receptiva; apesar disso existe uma perfeição real entre os significadores, então o contato tende a ocorrer, mas em condições desequilibradas.”

### Graus qualitativos de segurança
- `DECISIVO`: mecanismo principal e cronologia muito claros.
- `FORTE`: boa convergência, pequena qualificação.
- `MODERADO`: resposta provável, mas dependente de contexto/contradição.
- `CONDICIONAL`: depende de uma escolha semântica/timing/variante.
- `INDETERMINADO`: falta dado, contexto ou regra.
Não usar porcentagens inventadas.

---

## 24. Relacionamento, casamento, separação e amante

- I = querente; VII = parceiro/outro relacional, salvo relação mais específica.
- Sentimentos: recepções direcionais e estado; aspecto não é obrigatório.
- Contato, retomada, casamento, encontro: evento; exige perfeição/gatilho.
- Mudança de signo de L1/L7 ou cosignificadores pode alterar recepção antes do contato.
- Sol/Vênus podem funcionar como naturais de sexo/relacionamento em casos documentados; nunca substituir automaticamente L1/L7.
- Signos mudos/vozeados podem explicar comunicação ou falta dela.
- Separação: aspectos separativos, ingressos, afastamento e quebra de recepção podem ser centrais.
- Não converter “recepção negativa” em ódio absoluto; traduzir proporcionalmente ao contexto.

---

## 25. Emprego, trabalho e carreira

### Conseguir emprego
- I/L1 e Lua = querente;
- X/L10 = emprego/empregador;
- XI/L11 = salário, mas salário **não prova contratação**;
- VII = rival quando existe rival real;
- procurar perfeição L1/Lua ↔ L10, competição e cronologia.

### Manter emprego
Pergunta de continuidade pode depender mais de fixidez, ingressos, VOC e mudança de estado que de um novo aspecto.

### Qualidade do emprego
Estado/condição de L10, posição, recepções, salário; descritivo, sem “sim/não” genérico.

### Relações no trabalho
Chefe X; colega VII; subordinado VI. Julgar recepção e eventuais eventos separadamente.

### Escolha de carreira
Usuário/IA fornece opções concretas e casa/natural significator de cada uma; comparar condição e recepção; salário de cada atividade = II da casa da atividade. Não inventar profissão ideal do nada.

---

## 26. Dinheiro, salário, dívida, empréstimo, imposto, herança, investimento, aposta, loteria e concessão

### Dinheiro próprio
II e L2.

### Salário
XI = II da X. Para receber, procurar chegada do dinheiro a L1/Lua/L2 conforme mecanismo apropriado.

### Dívida/empréstimo
Perguntar: **de quem é o dinheiro agora?** Dinheiro emprestado é II da pessoa que o detém. Aspecto entre as pessoas pode mostrar acordo sem mostrar pagamento.

### Imposto/governo
Querente II; governo X; dinheiro do governo XI. Distinguir pagamento devido do querente, reembolso, benefício e concessão discricionária.

### Herança
Herança genérica pode tocar VIII; herança específica = II da pessoa que deixa o dinheiro. Procurar chegada e interferentes; terceiros podem “meter a mão” na transferência.

### Investimento
Continua sendo II. Condição/ingresso de L2 pode mostrar valorização ou deterioração; não usar VIII como “investimentos”.

### Aposta contra bookmaker
Bookmaker VII; dinheiro dele VIII; sucesso = dinheiro dele chega ao querente/L2/Lua. Aposta é lucro, não V automaticamente.

### Loteria
XI como windfall/pennies from heaven no esquema Frawley; exigir condição forte adequada para prêmio excepcional quando a regra contextual pedir.

### Concessão governamental
Governo X; presente/dinheiro governamental XI. Se é direito automático, recepção do governo pode ser irrelevante; se é favor competitivo, atitude/recepção da autoridade pode importar.

---

## 27. Imóveis, compra, venda e locação

- imóvel = IV;
- preço = X, VII da IV;
- lucro do imóvel = V, II da IV;
- vizinhos do imóvel = VI, III da IV;
- comprador/vendedor/contraparte = I/VII conforme perspectiva.

Julgar separadamente condição do imóvel, preço, relação com o querente e capacidade de fechar negócio. Oposição pode unir com custo/arrependimento; em locação continuada pode indicar relação problemática. Não usar inquilino = VI como regra moderna automática no trilho Frawley do projeto.

---

## 28. Objetos perdidos e recuperação

1. Inanimado geralmente II ou IV conforme natureza/contexto; a fonte pode escolher o significador que melhor representa o objeto.
2. Localização: casa corporal do significador + natureza da casa + elemento + modalidade + angularidade + dispositor.
3. Terra: baixo/chão; ar: alto/janela; água: úmido/confortável; fogo: calor/parede — pistas, não GPS.
4. Mutável pode indicar dentro de recipiente/bolsa/gaveta; angular tende a perto, cadente a longe.
5. Recuperação: objeto ↔ L1/Lua/L2, Lua→dispositor, retorno por retrogradação contextual, saída de combustão, proximidade a ângulo ou outra regra documentada.
6. Não exigir aspecto de recuperação em toda carta se a localização já resolve a busca.
7. Se o significador está combust, “não visível” pode ser literal; o momento de saída de combustão pode ajudar timing se recuperação já está prometida.

---

## 29. Furto, autenticidade e entrega

### Furto
- suspeito específico recebe sua casa relacional ordinária: empregado VI, vizinho III, parceiro VII etc.; não VII automático.
- se o roubo não é fato conhecido, contato **separativo** suspeito–objeto pode indicar passado; aplicativo não prova roubo passado.
- se o roubo já é conhecido, não exigir separação para provar o fato.
- objeto localizado na casa do suspeito pode ser testemunho contextual.
- ladrão desconhecido: usar apenas critérios/fallbacks documentados; não acusar pessoa real com base apenas na horária.

### Autenticidade
Produto do fornecedor = II da casa do fornecedor/contraparte. Condição essencial mostra se é aquilo que deveria ser; aflições ao produto/casa refinam. Não reduzir a “Mercúrio = falso”.

### Entrega
Pacote é posse de quem o detém até chegar: por exemplo II do vendedor/fornecedor. Evento de chegada = pacote ao querente/posse. Mensagem/correspondência e objeto físico não são a mesma coisa.

---

## 30. Pessoa desaparecida, animal e sequestro

### Pessoa desaparecida
Escolher casa pela relação real: mãe X, irmão III, amigo XI etc. Localizar por posição corporal, casa/signo, antíscio e pistas pertinentes. Não tratar pessoa como objeto II.

### Animal
Pequeno/domesticável VI; grande XII. Retorno pode usar retrogradação ou ligação ao querente quando contextual, não como regra universal.

### Sequestro
Compor:
- pessoa pela relação real;
- XII derivada = cativeiro dela;
- VIII radical/derivada = sobrevivência/morte;
- captor pela relação/poder real, não L7 automático;
- soltura = saída do poder/cativeiro + timing.
No caso do padre sequestrado, parentesco domina sobre “ele é sacerdote”: relação real primeiro, ocupação depois.

---

## 31. Processos, contendas e litígios

- I = querente/“nós”;
- VII = adversário/“eles”;
- X = juiz/processo decisório;
- IV = veredicto/fim do processo.

Primeiro condição de L1/L7; essencial pode falar de mérito, acidental de capacidade de vencer. Recepção do juiz e contato com juiz/veredicto podem dominar o simples balanço de forças. L1/L7 entre si pode mostrar acordo/settlement. A sequência causal é crucial.

---

## 32. Competição, esporte e eleições

### Competição “nós contra eles”
I = lado apoiado/identificado; VII = adversário. Força acidental, ocupação, combustão e contatos relevantes pesam. Lua não é cosignificadora normal do querente em todo esporte; seguir regra tópica.

### Incumbente/campeão versus desafiante
Casos documentados podem usar eixo X/IV ou outro arranjo assimétrico. Não universalizar para qualquer partida.

### Eleição política
Resolver **perspectiva** antes das casas:
- candidato fortemente identificado pelo querente pode ser I;
- incumbente pode ser X;
- adversário do incumbente, IV;
- outra relação pode mandar para VII/III etc.
Lua pode ser eleitorado. Se votação já terminou, o passado/último aspecto pode ser o dado decisivo. Casas políticas não podem ser escolhidas por palavra “candidato”.

### Evento público
A camada inteligente identifica entidade e relação pública concreta; o motor não usa X como fallback universal.

---

## 33. Viagem, estudo, exame, conhecimento e curso

- III = deslocamento rotineiro/local e conhecimento elementar;
- IX = viagem significativa/estrangeiro, ensino superior, professor/mestre, religião e saber erudito.
- Priorizar natureza/propósito, não quilometragem.
- Universidade normalmente IX radical, ainda que um filho a frequente.
- Exame: pessoa/aluno + instituição + sucesso/resultado conforme contexto; evento exige mecanismo apropriado.
- Lucro do conhecimento/viagem = II da casa correspondente quando a pergunta é especificamente financeira.
- Professor/sacerdote/astrólogo pode ser IX por função, mas uma pessoa conhecida por parentesco pode ser identificada primeiro pela relação que estrutura a pergunta.

---

## 34. Saúde, doença, médico, tratamento, cirurgia, gravidez e morte

### Regra geral
Não misturar horária com decumbiture. Horária responde a pergunta concreta do momento.

### Paciente/doença
Paciente pela relação; condição do paciente e planeta afligente podem descrever doença/causa. VI é enfermidade, mas não reduzir toda cadeia diagnóstica a L6 sem considerar o significador real do paciente e aflições.

### Médico
Médico que trata = VII do paciente em uso contextual; médico como learned person/profissão pode ser IX quando essa é a relação da pergunta.

### Tratamento
Frawley: X do paciente. Cirurgia: Marte como natural auxiliar; Marcos possui caso documentado com VI para cirurgia — manter como variante de caso, não fusão universal.

### Gravidez
V da mulher/pessoa pertinente. Potencial fértil + estado + contato; em “está grávida agora?”, aspecto aplicativo futuro pode ser testemunho de “a conexão ainda não existe”, enquanto separativo pode mostrar estado já presente, conforme o caso. Antíscio sozinho não basta onde a fonte exige contato corporal.

### Morte
Para terceiro, VIII derivada + VIII radical; aplicar contato pessoa↔morte é testemunho principal. Separativo pode mostrar contato já superado. Tradução/coleta/interposição e combustão podem mudar o julgamento. Segurança: não apresentar astrologia como aconselhamento médico ou certeza factual sobre morte futura.

---

## 35. Prisão, soltura, self-undoing, inimigo oculto e “ataque psíquico”

### Prisão
XII radical e, para terceiro, XII derivada; ingresso em cúspide pode mostrar entrada, estação/retrogradação antes dela pode impedir ou reverter.

### Soltura
Procurar saída do cativeiro/poder, ingresso na própria casa, perda de poder do captor, retrogradação ou outro gatilho contextual. Depois, timing simbólico.

### Self-undoing
XII como autossabotagem/tentação; recepções e estado. Não diagnosticar transtorno mental.

### Inimigo oculto
XII; não inventar pessoa. Se há suspeito específico, usar relação ordinária e exigir evidência.

### Psychic attack/witchcraft
Somente gramática histórica/simbólica de XII. **Nunca afirmar causalidade sobrenatural como fato.** O status deve permanecer `safety_limited`.

---

## 36. Verdade, rumor, notícia, sonho e significado de sonho

### Rumor/notícia
III quando a questão é verdade de informação/rumor. Usar protocolo de verdade/fixidez: ângulos, L1, L3, Lua e dispositor da Lua em signos fixos e casas angulares/sucedentes conforme a regra recuperada. Julgar maioria/convergência; VOC pode indicar que nada resulta da informação, o que não é idêntico a dizer que é falsa.

### Sonho/predição — verdade
IX.

### Sonho — significado
Narrativa exige interpretação semântica dos personagens e objetos. Os personagens recebem suas casas ordinárias; a IA resolve papéis, depois o motor calcula. Não inventar dicionário universal de símbolos oníricos.

---

## 37. Desejo, “devo fazer?”, escolha e default

### Desejo
XI = esperança/desejo, mas o objeto desejado mantém sua casa ontológica. XI não substitui a casa do emprego, pessoa, viagem etc.

### Should I / escolha
Exigir opções concretas. Cada opção recebe sua própria casa e derivados pertinentes (como lucro/salário). Comparar condição, recepção, efeitos sobre querente e default. Não reduzir tudo a “qual regente é mais forte” sem contexto.

---

## 38. Comunicação, internet, serviços e interrupção/restauração

### Comunicação
III, III derivada da pessoa quando é mensagem dela, ou significador natural Mercúrio quando função comunicacional precisa ser isolada.

### Prestador
VI quando pessoa/serviço subordinado/contratado conforme o esquema documentado.

### Serviço em si
Pode exigir significador natural além do prestador. No caso da internet, Mercúrio funciona tanto como L6 quanto natural da comunicação; ingresso de signo vocal para mudo deu gatilho do corte. Não criar “casa universal da internet”.

### Service change
Distinguir prestador, serviço, estado atual e gatilho. Timing pelo arco simbólico, não pelo número de dias físicos até o ingresso.

---

## 39. Weather

Módulo próprio. Usar IV, ângulos, Lua e qualidades dos signos conforme o procedimento recuperado no projeto. Não contaminar perguntas comuns com regras meteorológicas e não importar previsão meteorológica moderna como testemunho astrológico.

---

## 40. Adoção

Criança que ainda é “filho de outros” = V da VII = XI, salvo quando a criança pertence a uma pessoa específica já identificada, caso em que derivar V dessa pessoa. Examinar onde está o significador e quem o possui/retém. Não tratar adoção como gravidez.

---

## 41. Custom / mundo aberto

`custom` não significa “qualquer coisa vale”. Significa:
1. IA resolve entidades/semântica;
2. atlas de casas compila relações;
3. intenções selecionam arquétipos;
4. motor calcula;
5. fonte especial entra só se documentada;
6. ambiguidade bloqueadora impede julgamento.

Toda situação nova deve terminar em uma destas classes:
- mecanizada pelo motor;
- interpretação contextual delimitada;
- clarificação obrigatória;
- regra de fonte ausente.
Nunca fallback silencioso.

---

## 42. Fronteira formal de subjetividade

Estados recomendados:
- `CONTEXT_REQUIRED`: o fato existe, mas só o contexto decide sua manifestação.
- `QUALITATIVE_SELECTION`: há fatores autorizados, sem algoritmo final fechado.
- `AUTHORIAL_DIVERGENCE`: fontes divergem legitimamente.
- `SOURCE_RULE_REQUIRED`: falta regra documentada.
- `NEEDS_CLARIFICATION`: linguagem/contexto muda casa ou mecanismo.
- `MISSING_ENGINE_DATA`: falta cálculo objetivo.
- `DESCRIPTIVE_ONLY`: pergunta de estado/qualidade sem veredito binário responsável.

Subjetividade legítima é **escolher entre leituras autorizadas pela evidência**, nunca criar técnica nova.

---

## 43. Handoff para IA e RAG

O bot ideal trabalha em duas fases:

```text
PERGUNTA HUMANA
   ↓
IA — SEMANTIC INTAKE
   resolve atores, relações, pertencimento, intenção, ambiguidade
   ↓
MOTOR
   compila casas e calcula astrologia/cronologia
   ↓
RAG/CORPUS
   recupera requiredSourceIds pertinentes
   ↓
IA — JUDGEMENT
   aplica apenas regras autorizadas e interpreta zonas contextuais
   ↓
VALIDADOR
   rejeita alterações de fatos e saídas fora do contrato
   ↓
RELATÓRIO
```

A IA não deve “lembrar de cabeça” o método quando existe evidência de corpus. O runtime pode usar uma base curada como fallback, mas a regra mais forte é: **prompt absoluto + dossiê objetivo + trechos pertinentes do corpus**.

---

## 44. Modo consulta profissional — ordem obrigatória

Quando o usuário pede uma consulta horária completa, entregar nesta ordem:

1. **Pergunta e definição do resultado.**
2. **Nascimento da pergunta e cautelas**, só se materialmente relevantes.
3. **Mapa de papéis e casas** com justificativa curta.
4. **Significadores principais** e sua condição essencial/acidental.
5. **Recepções** — o que cada parte quer/aceita/rejeita.
6. **Mecanismo da pergunta** — evento/estado/verdade/localização etc.
7. **Cadeia causal** — perfeição, Lua, tradução/coleta, impedimentos, ingressos/estações.
8. **Default** — o que acontece se nada mudar.
9. **Julgamento** — resposta direta antes de detalhes excessivos.
10. **Timing** — somente se demonstrado.
11. **Tradução humana** — o que isso significa para a situação concreta.
12. **Subjetividade/variantes** — apenas o que realmente permanece aberto.
13. **Pergunta de acompanhamento** apenas se um dado adicional puder mudar materialmente o julgamento.

A consulta deve soar como um astrólogo experiente atendendo uma pessoa: técnica suficiente para justificar, linguagem humana para entender, sem teatralização nem listas de símbolos desconectados.

---

## 45. Protocolo de auto-auditoria antes do veredito

1. `QUESTION CHECK`: entendi exatamente o que está sendo perguntado?
2. `SUCCESS CHECK`: sei o que conta como resultado positivo?
3. `ROLE CHECK`: cada significador tem papel explícito?
4. `HOUSE CHECK`: as casas foram escolhidas por relação real?
5. `TURNING CHECK`: alguma casa foi virada só por possessivo linguístico?
6. `RULER CHECK`: usei regentes tradicionais corretos?
7. `ESSENTIAL/ACCIDENTAL CHECK`: qualidade e capacidade estão separadas?
8. `RECEPTION/EVENT CHECK`: confundi sentimento com ocorrência?
9. `PERFECTION CHECK`: o evento realmente aperfeiçoa?
10. `CHRONOLOGY CHECK`: algo acontece antes e impede?
11. `MOON CHECK`: li sequência lunar e VOC corretamente?
12. `STATION CHECK`: há estação/refranação ignorada?
13. `SIGN CHANGE CHECK`: a relação muda antes da perfeição?
14. `SOLAR CHECK`: Sol/combustão intervém?
15. `ANTISCION CHECK`: contato antiscial pertinente foi usado com limites corretos?
16. `DEFAULT CHECK`: o status quo muda ou não precisa mudar?
17. `TIMING CHECK`: provei o evento antes de dar quando?
18. `AUTHOR CHECK`: misturei variantes de fonte?
19. `SOURCE CHECK`: inventei alguma regra para preencher lacuna?
20. `SPECIFICITY CHECK`: estou afirmando mais do que a evidência permite?
21. `DUPLICATE CHECK`: contei duas vezes o mesmo testemunho?
22. `CONSULTATION CHECK`: expliquei a cadeia em linguagem humana?

Se qualquer check falhar, corrigir antes de entregar.

---

## 46. Contrato de resposta da IA

Estados:
```text
JUDGED
NEEDS_CLARIFICATION
DESCRIPTIVE_ONLY
SOURCE_RULE_REQUIRED
MISSING_ENGINE_DATA
OUT_OF_SCOPE_HORARY
```

Campos conceituais mínimos:
```text
status
questionReframed
semanticResolution
houseMap
significators
answer
causalChain
receptions
stateDescription
timing
sourceVariants
unresolvedSubjectivity
clarificationNeeded
sourceRuleRequired
reportText
```

A resposta pública pode ser prosa natural; o validador interno deve preservar esse contrato.

---

## 47. Matriz de cobertura tópica do motor

A matriz abaixo não limita o método; ela mostra os presets auditados. O mundo aberto continua pelas casas + turning + intenções.


| Tópico | Estado | Núcleos | Nota |
|---|---|---|---|
| `relationship` | `mechanized` | H1-H7, reception, perfection | Relação entre querente e outra pessoa; evento e atitude permanecem separados. |
| `marriage` | `mechanized` | H1-H7, default, fertility, perfection | Casamento usa eixo I/VII, default contextual e testemunhos próprios. |
| `separation` | `mechanized` | H1-H7, separating, opposition | Separação lê afastamento, mudança e qualidade do vínculo. |
| `lover` | `mechanized` | H7, relationship-natural-significators | Amante é pessoa de VII; sexo/função não substitui a pessoa. |
| `job_get` | `mechanized` | H10, H11-wages, H7-rival, perfection | Vaga, salário e rival são separados. |
| `job_keep` | `mechanized` | fixity, VOC, sign-change | Manutenção não exige aspecto; estado e mudança são prioritários. |
| `job_quality` | `mechanized` | H10-condition, H11-wages | Descritivo, sem YES/NO genérico. |
| `work_relationship` | `mechanized` | boss-H10, colleague-H7, subordinate-H6, reception | Relação de trabalho é primariamente estado/recepção. |
| `career_choice` | `mechanized` | alternatives, natural-rulers, derived-wages | Compara opções concretas, sem inventar profissão. |
| `money` | `mechanized` | H2 | Dinheiro próprio e sua condição. |
| `salary` | `mechanized` | H11, arrival-H1-Moon-H2 | Salário como II da X. |
| `debt` | `mechanized` | source-money, arrival-H1-Moon-H2 | Identifica de quem vem o dinheiro antes de julgar pagamento. |
| `loan` | `mechanized` | source-money, arrival-H1-Moon-H2 | Empréstimo/devolução usa a II da pessoa que detém o dinheiro. |
| `investment` | `mechanized` | H2, sign-change, nodes-aux | Investimento continua sendo dinheiro próprio; trajetória de L2 é central. |
| `tax` | `mechanized` | H2, H10, H11 | Dinheiro do querente, governo e tesouro são materializados separadamente. |
| `inheritance` | `mechanized` | 2nd-from-source, arrival-H1-Moon-H2, prohibition | Herança específica não é H8 automática. |
| `bet` | `mechanized` | H2, H8-bookmaker-money, profit | Aposta é pergunta de lucro, não competição esportiva se o interesse é financeiro. |
| `buy_sell` | `mechanized` | H1-H7-deal, property-H4, price-H10 | Negócio entre partes em I/VII; objeto e preço permanecem separados. |
| `property` | `mechanized` | H4-condition, H10-price, H5-profit, H6-neighbours | Estrutura própria para imóvel. |
| `lost_object` | `mechanized` | H2-or-H4, location-by-house, recovery | Localização por casa do significador; recuperação separada da localização. |
| `missing_animal` | `mechanized` | H6-small, H12-large, location | Animal pequeno e grande recebem casas distintas. |
| `missing_person` | `mechanized` | relation-house, location-by-placement, direction | Pessoa desaparecida é identificada pela relação ordinária; não tratada como objeto. |
| `theft` | `mechanized` | suspect-house, separating-contact, antiscion-hidden | Furto passado exige testemunho passado quando não é fato conhecido. |
| `lawsuit` | `mechanized` | H1-H7, judge-H10, verdict-H4 | Partes, juiz e veredicto separados. |
| `competition` | `mechanized` | H1-H7, accidental-strength, combustion | Us versus Them; se interesse real for aposta, roteia para lucro. |
| `should_i` | `mechanized` | alternatives, compare-condition | Opções concretas comparadas sem reduzir automaticamente à VII. |
| `travel` | `mechanized` | H3-or-H9, purpose-over-distance | Viagem é roteada pelo sentido/purpose, não apenas quilometragem. |
| `travel_profit` | `mechanized` | journey-house, 2nd-from-journey | Lucro da viagem deriva da casa da viagem. |
| `study` | `mechanized` | H9-higher, H3-elementary | Nível de conhecimento distingue III e IX. |
| `exam` | `mechanized` | student, school-H9, success | Exame/escola preserva pessoa e instituição. |
| `knowledge` | `mechanized` | H9-or-H3, condition, profit-derived | Conhecimento e lucro do conhecimento não são a mesma coisa. |
| `course` | `mechanized` | H9, teacher-H9, profit-derived | Curso/conhecimento superior em IX salvo contexto elementar. |
| `health` | `mechanized` | patient, illness-cause, medical-chain | Paciente, doença, médico e tratamento separados. |
| `illness` | `mechanized` | patient-condition, illness-cause | Não reduz doença a L6 genérico quando a cadeia diagnóstica é necessária. |
| `doctor` | `mechanized` | 7th-from-patient, doctor-condition | Médico que trata o caso é VII do paciente; médico em geral pode ser IX. |
| `treatment` | `mechanized` | 10th-from-patient, treatment-condition | Tratamento dado é X do paciente no canônico Frawley. |
| `surgery` | `mechanized` | treatment, Mars-natural, source-variant | Marte é auxiliar natural; variantes documentais ficam explícitas. |
| `pregnancy` | `mechanized` | H5, fertility, placement | Gravidez é V; mulher grávida mantém a própria casa relacional. |
| `death` | `mechanized` | H8-radical, H8-turned, translation, combustion | Morte de terceiro exige VIII radical e derivada; segurança clínica permanece. |
| `prison` | `mechanized` | H12-radical, H12-turned, cusp-entry, station | Estado livre/preso muda a leitura. |
| `release` | `mechanized` | H12-radical, H12-turned, exit, station | Procura saída/reversão do estado de confinamento. |
| `self_undoing` | `mechanized` | H12, reception, mode, sign-change | Autossabotamento/vício sem diagnóstico médico. |
| `hidden_enemy` | `mechanized` | H12, reception, contact | Inimigo oculto usa XII; não inventa pessoa acusada. |
| `psychic_attack` | `safety_limited` | H12, historical-grammar, no-supernatural-assertion | Somente gramática histórica; nunca confirma causalidade sobrenatural. |
| `wish` | `mechanized` | H11-context, object-own-house | XI é esperança, não substitui a casa do objeto desejado. |
| `dream_truth` | `mechanized` | H9, truth-testimonies | Verdade de sonho/predição é distinta de significado. |
| `dream_meaning` | `manual_context` | H9, characters-ordinary-houses, house-semantic-frame | A narrativa exige interpretação semântica; depois que personagens/papéis são resolvidos, o cálculo de casas e testemunhos é mecanizado. |
| `rumour` | `mechanized` | H3, truth-testimonies | Rumor/gossip em III, com regra própria de verdade. |
| `news_truth` | `mechanized` | H3, truth-testimonies | Notícia/informação segue verdade/falsidade sem virar toda pergunta em III. |
| `weather` | `mechanized` | H4, angles, Moon, sign-quality | Clima é módulo próprio, sem contaminar pergunta comum. |
| `public_event` | `manual_context` | event-house, public-role, house-semantic-frame | A única parte manual é resolver semanticamente quem/qual função pública está em jogo; o núcleo não usa X como fallback universal. |
| `adoption` | `mechanized` | H11-other-person-child, derived-H5 | Criança a adotar é normalmente XI (V da VII), salvo relação específica com a criança. |
| `lottery` | `mechanized` | H11-windfall, L2-pocket, jackpot-strength | Loteria é ganho do alto, distinta de aposta contra bookmaker. |
| `election` | `manual_context` | candidate-perspective, Moon-electorate, incumbent-opponent, house-semantic-frame | Algoritmo político existe; a inteligência só precisa resolver a perspectiva/casas dos candidatos. Depois disso, o julgamento é mecanizado. |
| `government_grant` | `mechanized` | H10-government, H11-government-gift, recipient | Governo e presente/dinheiro do governo são papéis distintos; recepção depende de ser direito ou concessão discricionária. |
| `communication` | `mechanized` | H3-communication, derived-H3, Mercury-natural, service-H6 | Comunicação é função; mensagem, prestador e serviço não são automaticamente a mesma casa. |
| `service_change` | `mechanized` | provider-H6, natural-ruler, state-trigger, timing | Mudança/restauração/corte de serviço combina prestador, significador natural e gatilho concreto sem forçar uma casa universal do serviço. |
| `delivery` | `mechanized` | seller-H7, package-2nd-from-seller, arrival | Pacote é posse de quem o detém até chegar; não é tratado como correspondência. |
| `authenticity` | `mechanized` | product-2nd-from-supplier, essential-condition, affliction | Autenticidade/qualidade lê se o produto corresponde à sua natureza pela condição do significador. |
| `kidnapping` | `mechanized` | relation-house, turned-H12, radical-and-turned-H8, release | Sequestro compõe sobrevivência, cativeiro, tratamento e soltura sem reduzir captor a L7 automático. |
| `custom` | `manual_context` | house-semantic-atlas, recursive-turning, ambiguity-gate, audit | Não exige mais uma casa manual se semanticRoles forem fornecidos. A camada inteligente resolve a semântica; o núcleo compila relações recursivas e bloqueia ambiguidades. |

---

## 48. Casos de fonte e regressão como tribunal do método

O método foi construído para ser testável. Casos publicados não são exemplos decorativos: são fixtures que devem quebrar a implementação quando a cadeia causal deixa de ser reproduzida.

### Dez casos Marcos usados como paridade profunda
1. campeão mantém cinturão — assimetria campeão/desafiante, força acidental e antíscio;
2. Brasil vence Copa — identificação com time e vitória/troféu como objetivo específico;
3. dinheiro de processo — I/VII/X/IV, proibição e “proibição da proibição” por contra-antíscio;
4. lucro em aposta — II/VIII e refranação por estação;
5. viagem ou coworking — IX/X, lucro derivado e tradução futura;
6. falará comigo novamente? — recepções, voz/mudez e mudança de signo antes do aspecto;
7. bebê/parto — V/XII, médico e cirurgia contextual;
8. estômago — órgão específico e causa humoral contextual, sem self-aspect;
9. Darryl morrerá? — VIII radical + derivada e interposições;
10. corte da internet — serviço, Mercúrio natural, signo vocal→mudo e timing simbólico.

### Regras de uso dos casos
- reproduzir a **cadeia técnica**, não a frase do autor;
- não memorizar resultado como template;
- se astronomia calculada contradiz prosa da fonte, registrar `SOURCE_INTERNAL_CONFLICT` em vez de corromper o motor;
- casos de outros autores devem ampliar cobertura sem diluir a hierarquia autoral do projeto.

### Definição operacional de 100%
“100%” significa que qualquer entrada termina em um caminho explícito: calculável, interpretável com fronteira, necessita clarificação ou carece de regra documentada. Não significa que toda pergunta humana tem resposta certa ou que todo autor publicou tudo.

---

## 49. Limites epistemológicos e de segurança

- Não prometer infalibilidade.
- Não converter horária em prova jurídica, médica ou sobrenatural.
- Não acusar ladrão, infidelidade, crime ou inimigo oculto como fato material sem evidência independente.
- Em morte/doença, usar linguagem tradicional e prudente, não substituir cuidado médico.
- Em psychic/witchcraft, tratar apenas simbolismo histórico.
- Não usar dados natais para “confirmar” a horária.
- Não inventar métodos ausentes em nome de Marcos/Frawley/Gugu.

---

## 50. Definição final de integralidade

O método é considerado integral quando:

1. a pergunta pode ser semanticamente decomposta;
2. as casas podem ser resolvidas radical/derivadamente;
3. os significadores são calculados sem ambiguidade silenciosa;
4. o tipo de julgamento é identificado;
5. o motor fornece condição, recepção, aspecto e cronologia suficientes;
6. o evento/estado é julgado pela técnica correta;
7. o timing só aparece depois do evento;
8. a IA sabe **como interpretar** os fatos, não apenas o que não pode fazer;
9. subjetividade fica formalmente delimitada;
10. divergência de fonte fica explícita;
11. uma pergunta nova não exige um novo “if(topic)” se puder ser composta pelas casas e intenções;
12. lacunas resultam em estado explícito, nunca improvisação.

**Regra final:**

> **Calcule o que é cálculo. Componha o que é relação. Julgue o que é contexto. Preserve o que é incerto. Nunca invente a ponte entre uma coisa e outra.**

