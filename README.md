# MathAstro

MathAstro is a personal astrology website built with Next.js and focused on traditional Western astrology.

## Live Project

- Site: https://mathastro.vercel.app/
- Repository: https://github.com/MathMigh/MathAstro

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Production

The project is connected to Vercel and deploys from the `main` branch.

## Natal release certification (2026-08-31)

The offline Natal audit remains `npm run verify:natal:all`. Full production certification is stricter:

```bash
npm install
npm run verify:natal:release
```

`verify:natal:release` additionally executes the installed `@swisseph/browser` against the exact vendored `public/vendor/swisseph.wasm` on known solar/lunar/non-eclipse fixtures, then runs `next build`. See `docs/SWISSEPH_RUNTIME_RELEASE_GATE_20260831.md`.

## Natal recoverable-corpus closeout (2026-09-01)

The Western Natal engine is closed against the **currently recoverable Marcos Monteiro + John Frawley + Luiz Gonzaga de Carvalho Neto corpus**, with explicit authorial boundaries and no active radical entries in `PARTIAL_RAW_EVIDENCE_ONLY` or `SOURCE_LOCKED_UNRESOLVED`.

Current offline gate:

```bash
npm run verify:natal:all
```

Result at recoverable-corpus closeout (historical checkpoint): structural coverage PASS, **53/53 production regressions PASS**, fixed-star sky PASS (1,112 unique stars), physical eclipse oracle PASS, Barra Mansa reference PASS, Natal isolation PASS, and focal TypeScript PASS.

Full deployment certification remains deliberately separate. This environment does not have local `@swisseph/browser`, so `npm run verify:natal:swisseph-runtime` fails closed and `next build` is not claimed as certified here. In a dependency-enabled release environment run:

```bash
npm install
npm run verify:natal:release
```

See `docs/NATAL_RECOVERABLE_CORPUS_CLOSEOUT_20260901.md` for the normative status and authorial-boundary register.

## Camada Natal Absolute AI — PT-BR / provider-ready (2026-09-01)

O motor Natal isolado agora emite um pacote de julgamento absoluto para IA, separado em:

```text
NATAL_FACTS
NATAL_AUTHORIAL_DOSSIER
NATAL_JUDGMENT_CONTEXT
```

O Prompt Absoluto vigente está integralmente em português brasileiro em `docs/ABSOLUTE_NATAL_PROMPT_v2_PTBR.txt`. Ele inclui uma seção explícita de **subjetividade astrológica disciplinada**: o motor fecha tudo o que é determinístico; a IA exerce julgamento qualitativo apenas nas zonas autorais/contextuais que o motor delega, sem inventar scores, fórmulas ou fatos.

A integração futura com qualquer modelo está pronta em `src/app/lib/natalAiIntegration.ts`. O provedor entra somente por `NatalAiProviderAdapter`; segredos permanecem server-side e o adapter não recalcula astrologia. A API já devolve `reportBundle.aiIntegration` com prompt, mensagens, contrato de resposta e gates.

Gates:

```text
READY_FOR_PROVIDER
AWAITING_QUESTION
BLOCKED_BY_ENGINE_VALIDATION
```

A interface mostra esse status e permite exportar o pacote de invocação do provedor. Consulte `docs/NATAL_AI_PROVIDER_ADAPTER_CONTRACT_20260901.md` e `docs/NATAL_ABSOLUTE_AI_PTBR_PROVIDER_READY_CLOSEOUT_20260901.md`.
