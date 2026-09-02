# MathAstro Natal — Arquitetura de Julgamento Absoluto por IA

**Data:** 2026-09-01  
**Status:** implementado no motor Natal isolado  
**Objetivo:** fechar deterministicamente tudo o que é calculável/source-lockable e entregar à IA apenas a composição contextual, a seleção qualitativa autorizada e a síntese.

## 1. Divisão de responsabilidade

A fronteira é rígida:

```text
MOTOR
├── astronomia
├── casas/cúspides
├── dignidades/debilidades
├── condições acidentais
├── aspectos e dinâmica
├── recepções
├── antíscios
├── Partes
├── estrelas fixas
├── almutens
├── temperamentos autorais
├── mentalidade
├── Senhor da Natividade
├── Gugu: motivação primária / faculdades / filosofia
└── protocolos e gaps

IA
├── entende a pergunta concreta
├── seleciona o campo/casa e o papel dos símbolos
├── percorre evidências materializadas
├── pesa convergência e contradição qualitativamente
├── preserva divergência entre autores
└── sintetiza sem recalcular astrologia
```

A IA não tem permissão para corrigir ou completar o motor com memória astrológica própria. Dado ausente é `MISSING_ENGINE_DATA`.

## 2. Três camadas do pacote

### `NATAL_FACTS`

Camada imutável de fatos e relações calculadas: secto, cúspides, pacotes planetários, aspectos, recepções, antíscios, Partes, estrelas interpretativamente admitidas, modificadores exteriores, tabela 12×12 de casas derivadas e precisão astronômica.

Scores/ledgers de auditoria são removidos antes do envio à IA.

### `NATAL_AUTHORIAL_DOSSIER`

Organiza os mesmos dados sob as escolas/fontes, sem fundi-las:

- Marcos: temperamento, Senhor da Natividade, mentalidade, casas e regra operacional principal;
- Frawley: temperamento publicado + doutrina pública atual, Manner, mentalidade publicada, indicadores vitais, Fortuna Geral e Partes espirituais;
- Gugu: temperamento histórico/tardio recuperado, Motivação Primária, potências/faculdades da alma, matriz de papéis planetários e quadro filosófico.

Também contém a matriz de protocolos, gaps de fonte, ontologia das doze casas e `AUTHORIAL_EVIDENCE_GRAPH`.

### `NATAL_JUDGMENT_CONTEXT`

É criado para a pergunta real. Contém:

- rota semântica da pergunta;
- domínios detectados;
- casas radicais pertinentes;
- derivação já resolvida pelo motor quando existe relação de posse/pertencimento suficientemente clara;
- planetas e dossiês selecionados;
- protocolos pertinentes;
- `authorialJudgmentZones`;
- checklist obrigatório de investigação;
- contrato de resposta.

Sem pergunta, o status é `AWAITING_QUESTION`: o sistema não pré-interpreta o mapa inteiro.

## 3. Roteamento de mundo aberto

O roteador possui caminhos diretos para domínios comuns, mas a arquitetura não depende de uma lista finita de frases.

A IA recebe:

```text
houseOntology
+ derivedHouseTable
+ evidenceGraph
+ protocols
+ specialist dossiers
```

Logo, situações inéditas podem ser decompostas em ator + assunto + relação.

Exemplo de propriedade explícita:

```text
"dinheiro do vizinho"
ator = vizinho → H3
assunto = dinheiro do ator → H2 relativo
motor consulta tabela precomputada
H2 de H3 = H4 radical
```

O próprio roteador é fail-closed: mera coocorrência não cria posse. Assim:

```text
"problema financeiro com vizinho"
```

mantém H2 + H3 como campos contextuais e **não** inventa automaticamente que se trata do dinheiro do vizinho.

## 4. Grafo de evidência autoral

Cada símbolo pode exercer papéis diferentes. O grafo materializa esses papéis em arestas com proveniência.

Exemplo conceitual:

```text
Mercúrio
├── RULES_HOUSE → H2
├── OCCUPIES_EFFECTIVE_HOUSE_MARCOS → H9
├── DISPOSITED_BY → Marte
├── ASPECT_* → Saturno
├── RECEPTION_* → planeta X
├── ANTISCION_* → Parte Y
├── FIXED_STAR_CONTACT → estrela Z
└── ANALOGICAL_FACULTY → estimativa [Gugu]
```

A regra é: **estabelecer primeiro o papel de Mercúrio no problema atual; só depois interpretar suas relações**.

Isso evita a falha “Mercúrio = comércio/inteligência, portanto...”.

## 5. Zonas de julgamento autoral

O motor não esconde o ponto em que termina a regra fechada. Ele entrega `authorialJudgmentZones`, entre elas:

- empate/seleção qualitativa do Senhor da Natividade;
- múltiplos candidatos de Manner;
- seleção de planeta especialmente forte na Motivação Primária de Gugu;
- aspectos Marcos entre 3° e 5° como contextuais;
- exteriores como modificadores sem orbe universal publicado;
- gaps `CURRENT_METHOD_NOT_PUBLIC`;
- limites autorais de orbe ainda não publicados.

A IA pode julgar qualitativamente **somente a partir da evidência entregue**; não pode construir um score oculto nem inventar o pedaço faltante do autor.

## 6. Prompt Absoluto

O prompt integral está em:

`docs/ABSOLUTE_NATAL_PROMPT_v2_PTBR.txt`

Ele impõe:

1. lei epistêmica motor-calcula/IA-interpreta;
2. precedência e separação Marcos/Frawley/Gugu;
3. ontologia de signos/planetas/casas/aspectos/recepções/Partes;
4. roteamento de mundo aberto;
5. seleção de significadores;
6. hierarquia de evidência;
7. protocolos específicos de temperamento, mentalidade, Motivação Primária, profissão, saúde etc.;
8. tratamento das zonas de julgamento;
9. loop obrigatório de auto-investigação;
10. inferências proibidas;
11. método de síntese;
12. formato obrigatório de resposta.

## 7. Contrato de resposta

A resposta interpretativa deve sempre poder ser decomposta em:

```text
DADOS_CALCULADOS
TESTEMUNHOS
SINTESE
INCERTEZAS_E_CONFLITOS
CONTEXTO_NECESSARIO
```

Isso não obriga a interface final a exibir cinco cabeçalhos ao usuário em todos os contextos; é o contrato lógico do julgamento.

## 8. API e interface

`POST /api/birth-chart` aceita agora opcionalmente:

```json
{
  "birthDate": { "...": "..." },
  "judgmentQuestion": "Tenho vocação para ensinar filosofia?"
}
```

O `reportBundle` passa a expor:

```text
aiTechnicalReport
aiStructuredForm
absoluteJudgmentPackage
absoluteNatalPrompt
natalJudgmentContext
auditTechnicalReport
auditStructuredForm
validation
```

Na tela Natal existe campo opcional de pergunta/contexto e downloads para o Prompt Absoluto e para o pacote JSON integral.

## 9. Segurança contra overfitting

Os casos Amorth, Guénon, Schuon e Bento XVI continuam como regressões de competência, não como templates biográficos.

O sistema não contém regras do tipo:

```text
Amorth = exorcista
Guénon = tradicionalista
Bento XVI = AVC
```

Ele contém os testemunhos e os mecanismos de seleção que permitem analisar um mapa desconhecido segundo a mesma gramática.

## 10. Verificação específica

Novo gate:

```bash
npm run verify:natal:absolute-ai
```

Ele testa em runtime a parte open-world que não depende de Swiss Ephemeris. O gate atual possui **19 checks** e inclui:

- `dinheiro do vizinho` → H2 de H3 = H4;
- `dinheiro da esposa` → H2 de H7 = H8;
- `filho da esposa` → H5 de H7 = H11;
- `carro do irmão` → reconhecer posse ainda não lexicalizada e exigir expansão semântica via `houseOntology` + tabela pronta, sem aritmética da IA;
- `problema financeiro com vizinho` → não inventar posse;
- `vocação para ensinar filosofia` → IX + X e protocolos de ensino/profissão;
- Motivação Primária → camada Gugu;
- ausência de pergunta → `AWAITING_QUESTION`;
- remoção de scores de auditoria;
- três camadas;
- proibição de recálculo;
- separação autoral;
- mundo aberto;
- auto-investigação;
- proibição de conclusão por símbolo isolado.

Esse gate também foi incorporado a `npm run verify:natal:all`.

## 11. Integração com qualquer provedor de LLM

O core não depende de um provedor específico. O helper:

```ts
buildNatalAbsoluteLlmMessages(packageData)
```

retorna:

```ts
{
  system: ABSOLUTE_NATAL_PROMPT,
  user: JSON.stringify({
    NATAL_FACTS,
    NATAL_AUTHORIAL_DOSSIER,
    NATAL_JUDGMENT_CONTEXT,
    RELEASE_GATE
  })
}
```

Assim o cálculo Natal continua independente de OpenAI/Anthropic/Gemini/etc. A integração externa só pode enviar as mensagens quando `RELEASE_GATE.releasedForAi === true`.
