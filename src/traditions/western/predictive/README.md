# Western Predictive bounded context — RC5

Canonical isolated Western predictive engine. The engine calculates; the AI judges. Author traditions remain distinct even in `integrated` mode.

## Author modes

- `marcos`: Marcos-current predictive stack.
- `frawley`: Frawley stack, with unresolved author-specific policies emitted as `SOURCE_GAP` rather than guessed.
- `combined`: Marcos + Frawley, without Gugu periods.
- `gugu`: Gugu planetary-period engine only; transits remain period-context evidence and never autonomous event predictions.
- `integrated`: Marcos + Frawley + Gugu calculated in parallel layers. No blended doctrine and no aggregate score.

## Canonical Marcos/Frawley execution order

1. Natal/radix upstream gate (read-only; Natal validation must pass).
2. Secondary progressions by exact decimal age, day-for-year.
3. Individual progressed contacts; the progressed chart is not treated as a second autonomous nativity.
4. Marcos-current progression policy: conjunction/opposition only.
5. Previous exact Solar Return to natal Sun longitude. In modes containing Marcos, primary return geometry is cast for the birthplace.
6. Previous exact Lunar Return to natal Moon longitude.
7. Derived Lunar Return (optional): Moon returns to the Moon longitude of the governing Solar Return.
8. Annual profection by sign/house as contextual testimony; natal planets are **not rotated**.
9. Fixed stars are recalculated for the relevant predictive epoch. Marcos eligibility remains source-locked; Frawley-only astronomy is materialized without inventing a universal temporal star orb.
10. Target-date transits are markers/triggers only and cannot be promoted without higher-scale support in the Marcos/Frawley stack.
11. Convergence is named evidence by layer. No aggregate astrological score is computed.

## Gugu planetary periods

Source-locked values: Moon 25, Sun 19, Mercury 20, Venus 8, Mars 15, Jupiter 12, Saturn 30. Major years are symbolic 360-day years; months are 30 days. The major sequence starts from the natal Ascendant sign and advances zodiacally.

Subdivisions repeat the planetary numbers at smaller units and proceed zodiacally. With the expanded source corpus, the sequence is treated as continuous through Pisces → Aries while the parent period remains active; the engine materializes `zodiacCycle` and tests behavior beyond the first 12-sign pass. This remains a Gugu-specific period engine and does not import Zodiacal Releasing/Lots/Loosing-of-the-Bond rules.

The receiving period lord has greater interpretive weight than the handing-over lord; natal conditions of the active rulers are materialized but not scored. Gugu transits are `period_context_only`.

## AI contract

Schema: `mathastro.predictive.ai-report/1.5` (`schemaVersion: 1.5.0`).

The engine emits mechanical evidence. The AI must not recalculate astronomy, aspects, return instants, dignities, profections, period chronology, fixed-star positions, transit eligibility or convergence. Missing source rules remain explicit source gaps.

RC5 adds a formal `aiJudgmentContract` and the canonical Portuguese prompt `MATHASTRO_PREDITIVA_ABSOLUTE_PTBR_V1`. Subjectivity is constrained to legitimate astrologer judgment: semantic routing, qualitative weighting, choosing a manifestation among radix-compatible possibilities, event-vs-subjective distinction, hierarchy synthesis and author-conflict handling. Every task declares `allowedEvidencePaths`, source IDs, prohibited actions and expected output fields.

The three fail-honest tokens are `SOURCE_GAP`, `CONTEXTO_INSUFICIENTE` and `INDETERMINADO`. AI judgment never converts an unpublished mechanic into a guessed rule.

Operational aspect screening thresholds are engine gates, not universal authorial orbs. Exact distances remain in the JSON.

## API / UI

`POST /api/predictive`

`format: "ai-package"` returns a provider-neutral bot payload containing `systemPrompt`, `userMessage`, `judgmentContract`, `mechanicalDossier` and the human technical report. `report-json` also exposes the prompt/contract.

UI: `/ocidental/preditiva`. Birthplace and event/target location are distinct inputs so author-specific return-location policies can be represented without corrupting the natal coordinates.

## Verification

```bash
npm run verify:predictive:all
```

This runs predictive isolation, independent predictive references, author-case oracles, the AI-judgment-contract verifier, Gugu period tests, predictive TypeScript, and the complete Natal regression suite.

Production gate:

```bash
npm run verify:predictive:release
```

A release is not certified as production-build complete unless `next build` runs with installed project dependencies.

## Known source gaps (fail-honest)

- Frawley-only: return-location policy is not source-locked in the recovered/current corpus.
- Frawley-only: exclusive secondary-progression aspect policy is not source-locked; conjunction/opposition is exposed as a conservative subset.
- Frawley-only: temporal fixed-star positions are materialized, but no universal Frawley temporal star-orb rule is invented. In combined/integrated modes Marcos supplies his own source-locked fixed-star proximity rule to the Marcos layer.
- Progressed ASC/MC: authorial use and ~1°/year scale are source-supported, but the exact constant/software setting remains operational traditional mechanics rather than an author-exclusive claim.
- Primary Directions: legitimate technique, deliberately separated from Marcos-current canonical progression workflow.
- Firdaria: remains separate/deferred and is never confused with Gugu planetary periods.


## Author fallbacks in combined modes

`combined` and `integrated` now expose `authorFallbacks` explicitly. When Frawley's recovered corpus is silent on return location, a universal progression-aspect list, or a universal temporal fixed-star orb, Marcos can supply a source-locked operational rule **only for the Marcos sublayer**. The result records the missing author, supplying author, source IDs, and `doesNotClaimMissingAuthorAgreement=true`. Pure `frawley` mode remains fail-honest and keeps those policies as non-blocking authorial gaps.

Progressed angles retain only a provenance-level gap: Marcos clearly uses progressed ASC/MC and examples consistent with roughly one degree per year, while two independent Frawley-school attestations identify `Naibod in RA / Mean Solar Arc in RA`, matching the operational calculation. A direct primary quotation from Marcos/Frawley naming the software setting has not yet been recovered, so that attribution remains explicitly secondary.


## RC5 — author-case oracle coverage

The predictive dossier is now regression-tested against **requirements derived from calculable evidence** explicitly used in published Marcos Monteiro and John Frawley examples. Return-chart grammar is materialized internally (houses, rulers, aspects, receptions/changes, nodes, antiscion, cusp emphasis, angle repetition and Parts), and Marcos progression examples drive recomputed seven Arabic Parts plus progressed antiscion evidence. The AI must never derive these from raw longitudes.


## Timeline de progressões RC5

`ProgressionWindowTimeline` cobre o ano da Revolução Solar governante e entrega datas civis/simbólicas de perfeições C/O, antíscios, conjunções exatas com estrelas, ingressos de signo e mudanças de termo dos cinco diretores Frawley. A IA não deve extrapolar datas a partir de velocidade.


## RC5 — camada subjetiva controlada / bot-ready

`PredictiveInput.consultation` accepts an optional question and factual context. These fields never change astronomy; they only unlock semantic/judgment tasks. The UI includes both fields.

`buildPredictiveBotPayload()` is provider-neutral: future model integration only needs to send its `systemPrompt` + `userMessage` + `judgmentContract` + `mechanicalDossier` and require JSON matching `finalOutputSchema`. The current code intentionally has no model/vendor dependency.

The full human-auditable prompt is mirrored at `docs/PROMPT_ABSOLUTO_IA_PREDITIVA_PTBR_v1.0.md`; architecture details live at `docs/ARQUITETURA_IA_PREDITIVA_RC5.md`.

## RC5 release status

Offline/corpus gate: `ENGINE_CASE_QA_PASS`. Current suite: predictive engine 87/87, author-case requirements 51/51, AI judgment contract 34/34, Gugu 22/22, Natal production regressions 41/41, predictive isolation 31/31, plus the complete Natal QA. Production certification remains separate because the current environment has no installed `next` executable; `npm run verify:predictive:release` therefore reaches `next build` only after all offline gates pass and then exits 127 (`next: not found`).
