# MathAstro Preditiva RC5 — arquitetura de IA de julgamento

## Princípio

**O motor calcula; a IA julga.** A IA não é fallback de astronomia. Toda subjetividade legítima é transformada em `PredictiveJudgmentTask` tipada e auditável.

## Duas camadas de IA

1. **Semântica**: entende a pergunta humana, decompõe papéis e propõe casas/temas candidatos sem modificar o dossiê mecânico.
2. **Julgamento**: pondera qualitativamente testemunhos já calculados, escolhe entre manifestações compatíveis com o radix/contexto e sintetiza escalas temporais.

## Três estados de não-resposta

- `SOURCE_GAP`: falta regra/cutoff/dado mecânico autorizado.
- `CONTEXTO_INSUFICIENTE`: cálculo está completo, mas a manifestação depende de contexto humano ausente.
- `INDETERMINADO`: evidência válida existe, porém não fecha uma conclusão responsável.

Esses estados são saídas corretas, não falhas a serem escondidas.

## Contrato

`aiJudgmentContract` contém:

- fronteira de subjetividade;
- campos exclusivos do motor;
- política de separação Marcos/Frawley/Gugu;
- proibições duras;
- ordem de julgamento;
- tarefas tipadas com `allowedEvidencePaths`;
- `sourceIds` relevantes;
- regras de resolução;
- schema esperado de saída.

Uma IA não deve acessar campos fora de `allowedEvidencePaths` para resolver determinada tarefa.

## Bot adapter

`buildPredictiveBotPayload(result)` cria um pacote neutro de provedor:

- `systemPrompt` — prompt absoluto PT-BR;
- `userMessage` — pergunta + contexto;
- `judgmentContract` — tarefas e restrições;
- `mechanicalDossier` — dados canônicos sem prompt/relatório duplicados;
- `humanTechnicalReport` — índice humano;
- regras de execução.

A rota `POST /api/predictive` aceita `format: "ai-package"` e devolve exatamente esse pacote. Não há dependência de OpenAI/Anthropic/Gemini/etc.; o futuro conector só precisa enviar o payload ao modelo escolhido e exigir JSON conforme `finalOutputSchema`.

## Subjetividade legítima

A IA pode:

- resolver semântica de situações infinitas (inclusive casas derivadas quando justificadas);
- determinar relevância temática de testemunhos;
- ponderar evidência qualitativa sem score;
- distinguir evento externo de experiência subjetiva;
- escolher manifestação concreta entre possibilidades coerentes com o radix e o contexto;
- preservar/explicar divergência autoral;
- integrar escalas de tempo.

A IA não pode:

- calcular ou corrigir astrologia;
- extrapolar timing por velocidade quando a timeline existe;
- inventar orbe/cutoff;
- transformar fallback Marcos em regra Frawley;
- importar astrologia moderna/técnica externa;
- usar biografia conhecida para forçar validação retrospectiva;
- somar testemunhos num score total.

## Autoridade

- **Marcos Monteiro + John Frawley**: eixo técnico principal, preservado separadamente.
- **Gugu**: períodos planetários source-locked e camada filosófico-antropológica quando explicitamente autorizada; não reescreve a mecânica dos outros autores.

## Fluxo futuro do bot

`pergunta/contexto → motor → validation PASS → ai-package → modelo → resposta JSON auditável → renderização humana`.

Se `validation=FAIL`, o bot não deve interpretar como se o dossiê estivesse liberado.
