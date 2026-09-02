# Prompt Absoluto — Camada IA Horária v1.0

## Objetivo

O MathAstro fecha deterministicamente tudo que pode ser fechado sem inteligência linguística: astronomia, cúspides Regiomontanus, regentes tradicionais, casas derivadas já resolvidas, dignidades, recepções, perfeições, Lua/VOC, antíscios e cronologia Swiss Ephemeris. A IA recebe somente a parte que continua genuinamente interpretativa: compreender a formulação humana, resolver relações ontológicas, escolher a regra documentada pertinente, sintetizar os testemunhos e redigir o juízo.

A arquitetura não tenta enumerar todas as situações humanas. Ela representa uma situação como **entidades + relações + casas + intenções + fatos calculados**. Assim, `vizinho`, `dinheiro do vizinho`, `filho da irmã da mãe`, `prédio onde trabalha o marido`, etc. podem ser compostos sem criar um tópico específico para cada frase.

## Regra de ouro

**A IA interpreta; o motor calcula.**

A IA nunca altera graus, cúspides, regentes, velocidades, ordem cronológica ou estados aplicativos/separativos para salvar uma interpretação. Quando uma ambiguidade humana muda a casa e o contexto não resolve, ela pede clarificação. Quando falta uma regra documentada, responde `SOURCE_RULE_REQUIRED`.

## Autoridade

1. Marcos Monteiro — material horário direto/atual e casos publicados no corpus.
2. John Frawley — *The Horary Textbook* e *The Real Astrology Applied*.
3. Luiz Gonzaga de Carvalho Neto — suplemento documentado; divergência = variante explícita.
4. MathAstro — contratos operacionais, segurança e isolamento HORARY_ONLY.

## O prompt real

A string canônica está em:

`src/traditions/western/horary/aiHandoff.ts`

Constante:

`HORARY_ABSOLUTE_AI_SYSTEM_PROMPT`

Ela é devolvida pela API junto com `aiHandoff` e `aiUserPrompt`.

## Saída tipada

A IA deve produzir um resultado compatível com `HoraryAIResultShape`:

- `status`: `JUDGED | NEEDS_CLARIFICATION | DESCRIPTIVE_ONLY | SOURCE_RULE_REQUIRED`
- `questionReframed`
- `semanticResolution`
- `answer`: `YES | NO | MIXED | UNKNOWN | DESCRIPTIVE_ONLY`
- `causalChain`
- `sourceVariants`
- `timing` quando pertinente
- `confidence`
- `clarificationNeeded`
- `sourceRuleRequired`
- `reportText`

## RAG / recuperação de fontes

Um prompt, sozinho, não deve fingir conhecer cada linha do corpus. O `aiHandoff.requiredSourceIds` é a ponte para RAG. Em produção, a camada IA deve recuperar apenas as regras/casos associados a esses IDs e, quando surgir uma técnica ainda não documentada, procurar no corpus antes de julgar. Se não encontrar regra, não inventa.

## Resultado arquitetural

`manual_context` deixa de significar “algoritmo faltando”. Passa a significar “a matemática está pronta; a interpretação da linguagem/contexto pertence conscientemente à IA”. Isso torna o sistema aberto a situações infinitas sem transformar o núcleo em um classificador frágil de palavras-chave.
