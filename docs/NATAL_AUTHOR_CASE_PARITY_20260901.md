# Natal Author Case Parity — 2026-09-01

This closeout hardens the Natal engine against worked public natal examples used by Marcos Monteiro rather than relying only on structural coverage.

## Cases audited

- Gabriele Amorth: Ascendant ruler Venus, major essential dignity, close solar combustion with Marcos major-dignity mitigation, and close opposition to Saturn ruling the subterranean fourth-house axis.
- René Guénon: temperament and mentality, contextual Moon/Mercury contacts with Arabic Parts and antiscia, fixed-star context, and prenatal lunation/eclipse links to the natal chart.
- Frithjof Schuon: temperament, Moon/Mercury mentality, angular/fixed-star evidence, Parts and contextual contacts.
- Benedict XVI: health significators, traditional planet-in-sign medical correspondences, Arabic Parts, house/body symbolism, and outer-planet modifiers on any house cusp (including cusp V).

## Corrections discovered by the case audit

1. Frawley Part of Faith corrected to Ascendant + Mercury - Moon (The Real Astrology Applied, p. 177).
2. Mentality dossiers now preselect relevant Arabic Part and antiscion contacts involving Moon/Mercury.
3. Prenatal lunation/eclipse charts now expose raw links to natal planets, all twelve cusps and Parts; the 3°/5° bands are screening bands, not claimed as a special eclipse doctrine.
4. Health dossiers now include the traditional planet-in-sign body correspondence table invoked by Marcos in his Benedict XVI example.
5. Outer planets may be preserved as secondary modifiers on any of the twelve house cusps, without rulership, essential dignity or almuten participation.
6. Worked-example regression fingerprints were added for Amorth, Guénon and Benedict-style evidence.

## Verification

- Production regressions: 60/60 PASS.
- Structural coverage: PASS.
- Fixed-star sky: PASS.
- Physical eclipse classifier: PASS.
- Barra Mansa reference validation: PASS.
- Natal isolation: PASS.
- Focal TypeScript: PASS.

## Boundary

The engine is designed for evidence parity, not paragraph memorization. It precomputes and prioritizes the technical witnesses needed for authorial-style judgement; the interpretive synthesis remains a judgement task. Current non-public authorial procedures remain explicitly source-gated rather than reconstructed from guesswork.

Production deployment certification remains a separate gate: `npm run verify:natal:release` requires the local `@swisseph/browser` runtime/WASM dependency and a successful Next build.

---

## Atualização posterior — camada Absolute AI

A auditoria de paridade por casos foi usada como base para a camada de julgamento open-world implementada em 01/09/2026. O estado atual não depende de memorizar Amorth/Guénon/Schuon/Bento XVI: os casos permanecem fixtures de competência, enquanto `src/app/lib/natalJudgmentEngine.ts` entrega três camadas (`NATAL_FACTS`, `NATAL_AUTHORIAL_DOSSIER`, `NATAL_JUDGMENT_CONTEXT`), grafo de evidência autoral, roteamento semântico/derivado, zonas de julgamento e Prompt Absoluto.

Ver `docs/NATAL_ABSOLUTE_AI_ARCHITECTURE_20260901.md`.
