# MathAstro Natal — Recoverable Corpus Closeout — 2026-09-01

> **SUPERSEDED FOR AI-RUNTIME ARCHITECTURE:** this checkpoint remains historical. The current interpretive runtime contract is documented in `docs/NATAL_ABSOLUTE_AI_ARCHITECTURE_20260901.md`.


## Escopo e significado de “100%”

Este closeout certifica **100% do corpus radical atualmente recuperável e source-lockable** dentro do escopo Natal ocidental deste projeto. Isso significa:

- toda regra radical recuperada de Marcos Monteiro, John Frawley e Luiz Gonzaga de Carvalho Neto que pode ser calculada sem inventar dado autoral foi materializada no motor ou explicitamente classificada;
- divergências entre autores são preservadas em trilhas separadas;
- nenhum cutoff, peso, score ou algoritmo privado foi fabricado para preencher silêncio da fonte;
- técnicas temporais continuam fora do radix estático;
- a certificação de produção JavaScript/WASM/Next continua sendo um gate separado.

Não significa “100% de tudo o que qualquer autor sabe hoje”. Em particular, métodos contemporâneos de Frawley que ele confirma mas não publica integralmente permanecem como fronteira documental explícita.

## Status de fechamento

```text
NATAL_RECOVERABLE_CORPUS = CLOSED_BY_CURRENT_CORPUS
NATAL_AUTHORIAL_BOUNDARIES = EXPLICIT
NATAL_OFFLINE_VERIFICATION = PASS
NATAL_ISOLATION = PASS
NATAL_PRODUCTION_CERTIFIED = PENDING_RUNTIME_GATE_AND_NEXT_BUILD
```

O registro formal contém **14 entradas**: 3 `RESOLVED_IMPLEMENTED`, 4 `EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED`, 4 `CURRENT_METHOD_NOT_PUBLIC`, 1 `REJECTED_UNVERIFIED` e 2 `OUTSIDE_STATIC_NATAL_EXECUTION`. Há **zero** entradas ativas em `PARTIAL_RAW_EVIDENCE_ONLY` e **zero** em `SOURCE_LOCKED_UNRESOLVED`; nenhuma fronteira atual bloqueia a interpretação radical.

## Fechamentos autorais desta rodada

### Marcos Monteiro

- Temperamento Marcos permanece em trilha própria, sem receber o cálculo Frawley ou Gugu.
- Relevância de aspectos natais foi refinada para `<=3° = CORE_0_3`, `>3° e <=5° = CONTEXTUAL_3_5`, acima disso `OUTSIDE_GENERIC_5`; a regra de cúspide de aproximadamente 5° continua independente.
- Senhor da Natividade preserva hierarquia essencial e só desempata automaticamente por condição acidental quando existe dominância source-locked inequívoca; aspectos/estrelas não viram score inventado.
- Urano, Netuno e Plutão são materializados somente como modificadores secundários: sem regência, dignidade ou participação em almuten. Apenas geometrias de conjunção/oposição são expostas; o autor não publica um cutoff universal específico para esses corpos, portanto `automaticInterpretation=false`.

### John Frawley

- Temperamento Frawley é independente do Marcos. O motor executa o último baseline publicado recuperável — Casa I/regente, Sol/Lua e Lord of Geniture por quente/frio/úmido/seco — e mantém a versão contemporânea exata como `CURRENT_METHOD_NOT_PUBLIC`.
- As Partes espirituais publicadas por Frawley são calculadas separadamente das sete Partes de Marcos, incluindo a Parte da Fé e a fórmula própria de Cativeiro/Escape.
- `Manner`, `General Fortune` e o módulo contemporâneo de planetas que “shout especially loudly” são mantidos com fronteira atual não pública quando o algoritmo integral não está no corpus.
- O alegado critério profissional do “planeta que nasce mais próximo do Sol” continua `REJECTED_UNVERIFIED` e desligado.

### Luiz Gonzaga de Carvalho Neto (Gugu)

- `properPlaces` da mentalidade está implementado.
- Mentalidade preserva as regras Lua–Nodos recuperadas, mas não inventa o orbe autoral ausente.
- O temperamento tardio deixou de ser tratado como “tabela perdida”: as aulas 10–11 recuperam cinco grupos determinantes, um ponto por qualidade na contagem-base, repetição do mesmo corpo quando exerce papéis distintos, composição dos nodos e considerações finais qualitativas. Isso agora é um ledger executável e auditável.
- O único boundary numérico remanescente nesse bloco é o orbe universal nodo→ângulo, que não foi recuperado como regra estável e não é inventado.
- Motivação Primária é materializada como `ASC → regente → dispositor/instrumento → candidatos a capacidade/planeta especialmente forte → desafio saturnino`, sem reduzi-la a profissão ou “missão”.
- As sete potências/faculdades da alma são expostas como analogias astrocaracterológicas com condições reais dos planetas e guardrails contra equivalências simplistas como `Mercúrio = QI`.
- `planetRoleMatrix` e `philosophicalFrame` entregam à IA a gramática simbólica: níveis de análise, microcosmo/analogia, liberdade humana, distinção entre material de base e desenvolvimento moral, e proibição de moralizar temperamento/mentalidade.

## Contrato para IA

O formulário técnico Natal está em `schemaVersion = 4.0.0` e o formulário sanitizado para IA em `2.0.0`. A cadeia de uso é:

```text
FATO ASTRONÔMICO / GEOMETRIA
        ↓
TESTEMUNHO SOURCE-LOCKED
        ↓
TRILHA AUTORAL (MARCOS / FRAWLEY / GUGU)
        ↓
BOUNDARY EXPLÍCITO QUANDO A FONTE NÃO AUTORIZA AUTOMAÇÃO
        ↓
SÍNTESE INTERPRETATIVA
```

A IA não deve recalcular o mapa, somar testemunhos heterogêneos como se fossem grandezas equivalentes, fundir autores silenciosamente ou converter uma fronteira qualitativa em regra matemática.

## Verificação offline final

Execução de 2026-09-01:

- matriz estrutural: `STRUCTURAL_ALL_COVERED=True`;
- regressões de produção: **53/53 PASS**;
- fixed-star sky: **PASS**, `unique_stars=1112`, `reference_matches=67`, erro máximo do fallback contra solução exata `37.988 arcsec`;
- oracle físico de eclipses: **PASS** para eclipse solar, eclipse lunar e Lua Cheia ordinária sem eclipse;
- Barra Mansa: longitudes planetárias **PASS** (erro máximo `0.475 arcsec`), ASC Regiomontanus `37.95529930`, MC `309.15052531`;
- isolamento arquitetural: `NATAL_ISOLATION=PASS | files=11`;
- TypeScript focal: **PASS**;
- comando agregado: `npm run verify:natal:all` → **exit 0**.

Log: `audit-results/VERIFY_NATAL_ALL_RECOVERABLE_CLOSEOUT_20260901.log`.

## Gate de produção

O verificador de runtime existe, passa no `node --check`, e falha fechado neste ambiente porque `node_modules/@swisseph/browser/package.json` não está instalado:

```text
SWISSEPH_RUNTIME=DEPENDENCY_MISSING
```

Isso impede, corretamente, declarar a integração JavaScript/WASM e o `next build` como certificados aqui. Em ambiente de release com dependências instaláveis:

```bash
npm install
npm run verify:natal:release
```

O segundo comando só conclui depois de `verify:natal:all`, execução real de `@swisseph/browser` contra o WASM vendorizado e `next build`.

## Critério de reabertura

Este closeout só deve ser reaberto por uma das condições abaixo:

1. novo material autoral recuperado que contradiga ou refine uma regra radical já implementada;
2. falha de regressão/validação;
3. descoberta de contaminação entre trilhas autorais;
4. mudança deliberada de escopo do produto.

Novo material não reabre automaticamente o motor: primeiro é classificado como duplicação, confirmação, refinamento, nova regra radical, técnica temporal ou conteúdo filosófico/interpretativo.
