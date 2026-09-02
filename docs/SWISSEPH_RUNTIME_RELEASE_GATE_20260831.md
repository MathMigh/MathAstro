# Swiss Ephemeris runtime release gate — 2026-08-31

## Why this exists

`verify:natal:all` is deliberately usable in an offline audit environment. Its eclipse oracle is independent PySwissEph, while part of the production-regression suite performs static source-contract checks. That combination validates the geometry and the intended implementation, but it does **not** by itself prove that the installed JavaScript package can execute the vendored `public/vendor/swisseph.wasm` through the same API path used by MathAstro.

The application initializes `@swisseph/browser` with the checked-in WASM file, not with a WASM path selected automatically from `node_modules`. Therefore a production closeout must test **both pieces together**.

## New gate

```bash
npm run verify:natal:swisseph-runtime
```

It fails closed unless all of the following are true:

- local `@swisseph/browser` is installed and is version 1.3.1 or newer within the compatible major line;
- the vendored `public/vendor/swisseph.wasm` matches the release fingerprint recorded in the test;
- `SwissEphemeris` initializes using that exact vendored WASM;
- `findNextSolarEclipse` and `findNextLunarEclipse` exist at runtime;
- a known physical solar eclipse is found and contains its exact syzygy inside the physical contact interval;
- a known physical lunar eclipse is found and contains its exact syzygy inside the penumbral contact interval;
- an ordinary full moon is **not** classified as an eclipse by interval membership.

The fixture JDs are the same independent cases used by `scripts/verify_eclipse_physical_classifier.py`.

## Release command

For a networked release/Vercel environment, use:

```bash
npm install
npm run verify:natal:release
```

`verify:natal:release` runs, in order:

1. the complete offline/source/oracle Natal suite;
2. the JavaScript + vendored-WASM runtime gate;
3. `next build`.

Only this release gate should be treated as full production certification. A constrained environment may still certify the radical mathematics and source-lock status with `verify:natal:all`, but must record production integration as pending.
