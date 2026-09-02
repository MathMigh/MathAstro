# MathAstro — Natal / Hardening de Produção — 28/08/2026

O antigo nome “Matriz Verde Final” é mantido apenas por compatibilidade de checkpoint. **48/48 significa cobertura estrutural, não certificação absoluta.**

## Critério atual

- `docs/MATRIZ_COBERTURA_ESTRUTURAL_NATAL_IA.md` verifica os 48 contratos;
- `natalProductionValidation.status` valida cada mapa real;
- `scripts/verify_natal_production_regressions.py` testa regressões independentes;
- somente `reportBundle.releasedForAi=true` libera a saída saneada à IA.

## Saídas

- relatório IA limpo;
- relatório de auditoria;
- JSON IA saneado;
- JSON de auditoria completo;
- status e erros/avisos do validador de produção.

## Arquivos principais

- `docs/HARDENING_PRODUCAO_NATAL_20260828.md`
- `docs/MATRIZ_COBERTURA_ESTRUTURAL_NATAL_IA.md`
- `docs/METODO_ABSOLUTO_ANALISE_NATAL_COM_IA_v1.0.pdf`
- `src/app/lib/natalProductionValidation.ts`
- `src/app/lib/natalAiForm.ts`
- `src/app/lib/natalAnalysis.ts`
- `src/app/lib/natalTechnicalReport.ts`
- `src/app/lib/fixedStars.ts`
- `src/app/api/birth-chart/route.ts`
