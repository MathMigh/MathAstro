# VALIDAÇÃO DE HARDENING — NATAL → RELATÓRIO → IA

Data: 28/08/2026.

## Estado

A camada possui **48/48 contratos estruturais**, mas cobertura estrutural não é mais chamada de “100%”, “verde final” ou certificação de produção. A liberação de um mapa para IA depende do `natalProductionValidation` executado sobre aquele resultado e das regressões de produção.

## Testes desta rodada

1. `npx tsc -p .audit/tsconfig.json --noEmit` — aprovado para o núcleo focal Natal/API.
2. `python scripts/reference_validation.py` — aprovado; fixture Barra Mansa posteriormente regenerado com tiers Marcos <=3° núcleo / >3°–5° contextual.
3. `python scripts/verify_fixed_star_sky.py` — aprovado; catálogo grande e contatos de referência presentes.
4. `python scripts/verify_natal_green_matrix.py` — `STRUCTURAL_ALL_COVERED=True`; mede apenas cobertura, não produção.
5. `python scripts/verify_natal_production_regressions.py` — aprovado nos casos independentes Manaus 1999 e Barra Mansa 2001 e nas invariantes estáticas.

## Correções críticas

- casa efetiva de planeta em cúspide propagada aos consumidores;
- aspectos Marcos posteriormente refinados pelo corpus 2026 para <=3° núcleo e >3°–5° contextual;
- relações I–VII separam Marcos de aspecto tradicional mais amplo;
- ingressos retrógrados não podem gerar X→X;
- carry sexagesimal corrigido;
- estrelas fixas separadas em catálogo astronômico e contatos interpretativos source-locked;
- aliases canônicos duplicados e promoções estelares sem fonte viraram falha de produção;
- Gugu angular limitado a ângulos reais/casas angulares;
- temperamento e Manner sem desempate por score;
- relatório textual e JSON para IA separados das versões de auditoria;
- `releasedForAi` opera em modo fail-closed.

## Limitação de build

O checkpoint atual não possui um conjunto instalável/completo de `node_modules`; portanto o build integral do Next.js não é declarado como aprovado quando `next` não está disponível. Essa limitação é registrada explicitamente e não é convertida em falso selo de correção.

Ver `docs/HARDENING_PRODUCAO_NATAL_20260828.md` para a matriz detalhada das mudanças.
