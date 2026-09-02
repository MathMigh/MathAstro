from pathlib import Path
root=Path(__file__).resolve().parents[1]
files={p.name:p.read_text(encoding='utf-8') for p in (root/'src/traditions/western/mundane').glob('*.ts')}
checks=[]
def ck(name, ok):
    checks.append((name,bool(ok))); print(('PASS' if ok else 'FAIL'),name)
policy=files['mundanePolicy.ts']; cycles=files['mundaneCycles.ts']; gaps=files['mundaneGapMatrix.ts']; real=files['mundaneRealCases.ts']
ck('author modes materialized', all(x in ''.join(files.values()) for x in ['marcos','frawley-legacy','marcos-frawley','research']))
ck('Frawley-exclusive features gated', 'frawleyOnly' in policy and 'lord-of-eclipse' in policy and 'five-promissor-progression' in policy)
ck('Marcos-exclusive features gated', 'marcosOnly' in policy and 'general-cardinal-ingresses' in policy)
ck('focus drives required layers', 'requiredLayers' in policy and 'terrestrialRequirements' in policy and 'interpretationOrder' in policy)
ck('weather chain materialized', all(x in policy for x in ['season-ingress','monthly-ingress','quarter-phase','sunrise-chart']))
ck('agriculture requires crop-specific part', 'crop-specific' in policy)
ck('elemental runs do not claim canonical mutation', 'canonicalHistoricalMutationClaimed:false' in cycles)
ck('960 cycle remains source locked', 'SUPER_CYCLE_960_CANONICAL' in gaps and 'source-locked' in gaps)
ck('exact mundane directions remain source locked', 'EXACT_MUNDANE_DIRECTIONS' in gaps)
ck('lunar eclipse lord not inferred', 'LUNAR_ECLIPSE_LORD_RULE' in gaps)
ck('published real-case regressions registered', all(x in real for x in ['frawley-coventry-1940','marcos-pandemic-2019','source-anchored-regression']))
struct=(root/'src/traditions/western/mundane/mundaneStructuralInvariants.ts').read_text(encoding='utf-8')
ck('definition-induced testimony filter exists', all(x in struct for x in ['structuralByDefinition','independentTestimony:false','solar_eclipse_geometry','fortune_formula_at_solar_syzygy']))
ck('source reproduction house policy exists', 'houseSystemForSourceReproduction' in policy and 'historical-radix' in policy)
ck('release QA remains blocking', 'FULL_BUILD_AND_RELEASE' in gaps and 'blocking:true' in gaps)

engine=(root/'src/traditions/western/mundane/mundaneEngine.ts').read_text(encoding='utf-8')
astronomy=(root/'src/traditions/western/mundane/mundaneAstronomy.ts').read_text(encoding='utf-8')
ck('runtime mundane engine exists', 'calculateMundaneEngine' in engine and 'findGoverningAriesIngress' in engine)
ck('runtime astronomy roots exist', all(x in astronomy for x in ['findAriesIngressForYear','findLatestPrecedingGrandConjunction','findPrecedingMajorLunation']))
ck('API mundane exists', (root/'src/app/api/mundane/route.ts').exists())
ck('UI mundane exists', (root/'src/app/ocidental/mundana/page.tsx').exists())

prompt=files["mundaneAiPrompt.ts"]
ck("absolute Portuguese AI prompt embedded", "PROTOCOLO ABSOLUTO DE JULGAMENTO MUNDANO v3.0" in prompt)
ck("AI handoff exposes astrologer judgment gate", "ASTROLOGER_JUDGMENT_REQUIRED" in prompt)
ck("AI retrieval protocol preserves direct/analogy distinction", "FOUND_DIRECT_RULE" in prompt and "FOUND_ANALOGOUS_EXAMPLE" in prompt)
failed=[n for n,o in checks if not o]
print(f'SUMMARY pass={len(checks)-len(failed)} fail={len(failed)}')
raise SystemExit(1 if failed else 0)
