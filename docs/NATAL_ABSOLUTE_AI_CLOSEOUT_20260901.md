# Natal Absolute AI — Closeout 2026-09-01

## Status

This checkpoint supersedes `MathAstro_NATAL_AUTHOR_CASE_PARITY_20260901` as the current Natal AI-judgment architecture checkpoint.

- `NATAL_FACTS = IMPLEMENTED`
- `NATAL_AUTHORIAL_DOSSIER = IMPLEMENTED`
- `NATAL_JUDGMENT_CONTEXT = IMPLEMENTED`
- `ABSOLUTE_NATAL_PROMPT = IMPLEMENTED`
- `OPEN_WORLD_SEMANTIC_ROUTING = IMPLEMENTED_FAIL_CLOSED`
- `AUTHORIAL_EVIDENCE_GRAPH = IMPLEMENTED`
- `AUTHORIAL_JUDGMENT_ZONES = IMPLEMENTED`
- `AUTHOR_SEPARATION_MARCOS_FRAWLEY_GUGU = ENFORCED`
- `NATAL_OFFLINE_VERIFICATION = PASS`
- `NATAL_ISOLATION = PASS`
- `DEPLOYMENT_CERTIFICATION = PENDING_SWISSEPH_RUNTIME_AND_NEXT_BUILD`

## Architectural decision

MathAstro now treats natal judgment as two complementary kinds of intelligence:

1. The deterministic engine owns astronomy, houses, rulerships, dignities, receptions, aspects, antiscia, Parts, fixed stars, sect, solar condition, lunar phase, house geometry, derived-house arithmetic and all other computable evidence.
2. The LLM owns bounded qualitative synthesis of the already-computed evidence for a concrete real-world question. It is forbidden to recalculate astrology or manufacture missing technical facts.

The AI-facing runtime is split into three explicit layers:

### `NATAL_FACTS`

Immutable computed evidence. Audit-only numerical scores/rankings are sanitized before release to the interpretation layer.

### `NATAL_AUTHORIAL_DOSSIER`

Methodological organization with Marcos Monteiro, John Frawley and Luiz Gonzaga de Carvalho Neto kept as separate author tracks. It includes domain dossiers, source gaps, the authorial evidence graph, open-world house ontology and the complete precomputed derived-house table.

### `NATAL_JUDGMENT_CONTEXT`

Question-specific routing. The concrete question/context selects relevant houses, planets, protocols, specialist dossiers and bounded judgment zones. No question means no automatic whole-chart life narrative.

## Open-world routing

The router does not try to enumerate every possible human circumstance. It composes actor, subject and relation from a house ontology and uses the engine-provided derived-house table when a turned house is actually justified.

Examples covered by executable runtime tests:

- `dinheiro do vizinho` -> actor H3, possession H2 relative to H3 -> H4;
- `dinheiro da esposa` -> H2 of H7 -> H8;
- `filho da esposa` -> H5 of H7 -> H11;
- `problema financeiro com vizinho` -> keeps radical H2 + H3 and does **not** invent ownership;
- `carro do irmão` -> asks for semantic expansion because `carro` is not in the deterministic subject lexicon, then requires selection from the already-computed derived-house table rather than LLM arithmetic;
- `vocação para ensinar filosofia` -> routes IX + X and the relevant higher-learning/profession protocols;
- `motivação primária` -> routes to the Gugu primary-motivation dossier.

## Authorial evidence graph

The same symbol can participate in different roles according to context. The graph therefore records relations such as house rulership, effective house occupation, dispositor chains, receptions, aspects, antiscia, fixed-star contacts, Part dispositors and Gugu analogical faculties. Interpretation must establish the role of a symbol in the current problem before assigning concrete meaning.

A key invariant is:

`NEVER_INFER_CONCRETE_MANIFESTATION_FROM_ONE_SYMBOL_ALONE`

## Authorial judgment zones

When a source does not authorize a deterministic rule, the engine does not hide the ambiguity and does not invent a score. It emits a bounded judgment zone containing the evidence, author, documentary status and AI instruction. Examples include unpublished current-method deltas, qualitative Lord-of-Nativity ties, contextual Marcos 3–5 degree aspects, Gugu strongest-planet selection and outer-planet modifiers without a published universal authorial orb.

## Absolute Natal Prompt

O prompt operacional vigente, integralmente em português brasileiro, está em:

`docs/ABSOLUTE_NATAL_PROMPT_v2_PTBR.txt`

It is a protocol rather than a persona. It enforces epistemic rules, author separation, ontology, context routing, significator selection, evidence hierarchy, temperament, mentality, Gugu primary motivation/powers of soul, profession, health, relationships, money, family, religion, judgment-zone handling, self-investigation, prohibited inferences and synthesis.

The LLM must not expose private scratchwork/chain-of-thought. Its answer contract is evidence-oriented:

- `DADOS_CALCULADOS`
- `TESTEMUNHOS`
- `SINTESE`
- `INCERTEZAS_E_CONFLITOS`
- `CONTEXTO_NECESSARIO`

## API and UI

`POST /api/birth-chart` accepts optional `judgmentQuestion` and returns the absolute judgment package after ordinary chart calculation and production validation. The package is fail-closed if audit scores/rankings leak into the AI layer.

The Natal workspace exposes an optional question/context field and can save both the Absolute Prompt and the absolute AI package.

A vendor-neutral helper produces a system message plus a user JSON payload containing the three layers and release gate. No external LLM provider dependency is required by this checkpoint.

## Verification — 2026-09-01

`npm run verify:natal:all` passed with:

- structural coverage: PASS;
- independent production regressions: **78/78 PASS**;
- fixed-star sky: PASS, **1,112 unique stars**;
- physical eclipse classifier: PASS;
- Barra Mansa reference validation: PASS;
- Natal isolation: PASS;
- Absolute Natal AI executable runtime: **28/28 PASS**;
- provider-ready Natal UI transpile/gate: **PASS**;
- focal TypeScript compilation: PASS.

The new AI-runtime regressions specifically protect three-layer separation, no recalculation, author separation, authorial evidence graph, Frawley-vs-Marcos antiscion source layers, explicit judgment zones, fail-closed derived-house ownership, open-world fallback, shared score sanitizer, API release gating and vendor-neutral LLM messages.

## Deployment boundary

`npm run verify:natal:swisseph-runtime` cannot be certified in this environment because `@swisseph/browser` is not locally installed. The gate correctly exits fail-closed with `SWISSEPH_RUNTIME=DEPENDENCY_MISSING`.

Therefore this checkpoint does **not** claim `NATAL_PRODUCTION_CERTIFIED`. In a networked release environment, run:

```bash
npm install
npm run verify:natal:release
```

That aggregate command reruns the full Natal suite, verifies the actual Swiss Ephemeris browser/WASM runtime and then runs the Next build.

## Final scope statement

This architecture maximizes the currently recoverable/source-lockable Marcos + Frawley + Gugu natal corpus while moving genuinely qualitative and open-world judgment into an explicitly bounded AI layer. It does not claim access to unpublished author methods and does not convert documentary gaps into invented rules.
