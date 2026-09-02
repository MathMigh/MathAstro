# MathAstro — Natal Technical Closeout — 2026-08-28

> **SUPERSEDED FOR AI-RUNTIME ARCHITECTURE:** this checkpoint remains historical. The current interpretive runtime contract is documented in `docs/NATAL_ABSOLUTE_AI_ARCHITECTURE_20260901.md`.


## Resultado

**Não restam gaps de cálculo radical classificados como `PARTIAL_RAW_EVIDENCE_ONLY` ou `SOURCE_LOCKED_UNRESOLVED`.**

O que resta no registro pertence a três classes não computacionais:

1. **cutoff autoral não publicado** — a geometria está completa, mas o autor não fixa número universal;
2. **método atual não público** — Frawley confirma a técnica no currículo, mas não publica o algoritmo da aula atual;
3. **fora do radix estático** — técnicas temporais que exigem data/janela própria.

Isso significa que a IA não precisa recalcular longitude, casas, aspecto, aplicação/separação, recepção, dignidade, antíscio, Partes, estrelas, sizígia/eclipse, casas derivadas, Hyleg/Anareta/Alcochoden ou as novas geometrias Gugu/cúspide. Onde não existe regra autoral pública para converter evidência em decisão, o campo é marcado como fronteira documental.

## Mudanças materiais desta rodada

- Gugu `properPlaces`: implementado integralmente segundo a tabela 1/2/3/4/5.
- Gugu Lua–Nodos: conjunção e quadratura materializadas, com semântica recuperada e orbe autoral explicitamente ausente.
- Eclipse físico: substituído heurístico nodal por evento físico Swiss Ephemeris.
- Cúspides: acrescentados arco real da casa, porcentagem ocupada, 2°/3°/5°, velocidade e aplicação/separação.
- General Fortune: removida seleção especulativa; pacote passa a expor o substrato radical inteiro sem fingir algoritmo atual de Frawley.
- Taxonomia de gaps: separa bug/cálculo faltante de decisão qualitativa e método não público.
- Regressão de produção ampliada para 41 checks.
- Novo oracle independente `verify_eclipse_physical_classifier.py`.
- `@swisseph/browser` atualizado para `^1.3.1`.
- `eslint-config-next` alinhado à linha Next 16.

## Gates

```bash
npm install
npm run verify:natal:all
npm run build
```

A ausência de rede neste ambiente impede apenas os dois passos que dependem da instalação npm. Os gates Python e TypeScript focal são executados no empacotamento e seus resultados ficam registrados.

## Addendum 2026-08-31 — runtime certification boundary

A final audit distinguished **mathematical/source closeout** from **JavaScript production integration**. The existing independent PySwissEph eclipse oracle proves the physical classification rule, but does not execute the installed `@swisseph/browser` package against the vendored `public/vendor/swisseph.wasm`.

For that reason the package now includes `npm run verify:natal:swisseph-runtime` and the release-only aggregate `npm run verify:natal:release`. The latter must pass, together with `next build`, before claiming full production certification. This addendum does not reopen a known radix calculation gap; it closes an engineering test-coverage gap.

## Addendum 2026-09-01 — recoverable corpus closeout

O corpus adicional de Marcos/Frawley/Gugu reabriu temporariamente o closeout de 28/08 para source-hardening. A rodada foi encerrada em `docs/NATAL_RECOVERABLE_CORPUS_CLOSEOUT_20260901.md`.

Mudanças principais: temperamentos autorais paralelos; baseline executável Frawley com boundary contemporâneo; temperamento tardio Gugu recuperado como ledger; Motivação Primária; potências/faculdades da alma e quadro filosófico Gugu; Partes espirituais Frawley separadas das Partes Marcos; aspectos Marcos em tiers 3°/5°; Senhor da Natividade com desempate acidental fail-closed; exteriores Marcos como modificadores secundários sem cutoff numérico especial inventado.

A suíte final offline passa com **53/53 regressões de produção**, cobertura estrutural completa, 1.112 estrelas únicas, eclipse físico, Barra Mansa, isolamento e TypeScript focal. Não há entradas radicais ativas `PARTIAL_RAW_EVIDENCE_ONLY` ou `SOURCE_LOCKED_UNRESOLVED`.

O estado de produção continua `PENDING_RUNTIME_GATE_AND_NEXT_BUILD` enquanto a dependência local `@swisseph/browser` não estiver instalada. Isso é uma fronteira de ambiente/release, não um gap radical oculto.

