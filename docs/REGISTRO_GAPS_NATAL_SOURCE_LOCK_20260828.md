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
