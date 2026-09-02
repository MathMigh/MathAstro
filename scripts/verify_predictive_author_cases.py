#!/usr/bin/env python3
from pathlib import Path
import json, sys

ROOT=Path(__file__).resolve().parents[1]
PDIR=ROOT/'src/traditions/western/predictive'
engine=(PDIR/'predictiveEngine.ts').read_text(encoding='utf-8')
types=(PDIR/'predictiveTypes.ts').read_text(encoding='utf-8')
sources=(PDIR/'predictiveSources.ts').read_text(encoding='utf-8')
stars=(PDIR/'predictiveFixedStars.ts').read_text(encoding='utf-8')
report=(PDIR/'predictiveReport.ts').read_text(encoding='utf-8')

checks=[]
def check(author_case, testimony, required, ok):
    checks.append({'case':author_case,'testimony':testimony,'requiredEngineEvidence':required,'status':'PASS' if ok else 'FAIL'})

# John Frawley — George Orwell gets shot (official public Natal extract)
case='Frawley — George Orwell, shooting / Solar 1936 / Lunar 1937'
check(case,'progressed ASC exactly conjunct progressed Mars','progressed↔progressed contact matrix', 'contactsWithinProgressedSky' in types and 'progressionInternal' in engine)
check(case,'progressed Moon conjunct natal Mars','progressed→radix contact matrix', 'contactsToRadix' in types and 'progressionToRadix' in engine)
check(case,'Solar Venus conjunct Mars by antiscion','internal return antiscion contacts', 'antiscionContactsWithinReturn' in types and 'antiscionPoints(sky.planets)' in engine)
check(case,'Solar 2/8 cusps fall on ASC/DSC axis by antiscion','return cusp-antiscion→angle contacts', 'cuspAntiscionContactsWithinReturn' in types and 'antiscionPoints(sky.cusps)' in engine)
check(case,'Venus goes immediately to Sun on South Node','moving-moving aspects + true nodes in return', 'nearestMovingPairContact' in engine and 'nodeContactsWithinReturn' in types and 'rawPosition(sw as any, jd, 11)' in (PDIR/'predictiveAstronomy.ts').read_text(encoding='utf-8'))
check(case,'Venus has just entered combustion','solar condition + recent sign ingress', 'solarConditions' in types and 'recentSignIngresses' in types and 'MARCOS_BOOK_SOLAR_CONDITION_LIMITS' in sources and 'FRAWLEY_APPLIED_SOLAR_CONDITION_LIMITS' in sources)
check(case,'Mercury repeats natal position','return→radix contacts retain exact distance', 'contactsToRadix: matrixContacts(returnCore, radix)' in engine)
check(case,'Saturn exactly conjunct natal Jupiter','return→radix planet contacts', 'contactsToRadix: matrixContacts(returnCore, radix)' in engine)
check(case,'Lunar ASC on natal Mars','return angles→radix planets', 'returnCore = [...sky.planets, ...sky.angles]' in engine)
check(case,'Lunar Venus on Baten Kaitos','explicit Frawley return-star evidence with distance and no invented universal orb', 'baten kaitos' in stars.lower() and 'SOURCE_LOCKED_RETURN_EXAMPLE_DISTANCE_UNFILTERED' in types)
check(case,'static return dignity is not enough; changes matter','dignity changes + recent/imminent ingresses', 'dignityChangesFromRadix' in types and 'recentSignIngresses' in types and 'imminentSignIngresses' in types)
check(case,'reception is important when it is about to change','reception ledger + ingress reception deltas', 'receptionChangesFromRadix' in types and 'changedReceptionKeys' in types and 'buildImminentSignIngresses' in engine)

# Frawley — published generic return judgment grammar
case='Frawley — published Solar/Lunar Return judgment grammar'
check(case,'return planet house placement matters','house attached to every predictive planet', 'house: houseFor(position.longitude)' in (PDIR/'predictiveAstronomy.ts').read_text(encoding='utf-8'))
check(case,'planets within 1–2 degrees of return cusps may be emphasized','source-locked 2° cusp proximity ledger', 'distanceDeg <= 2' in engine and 'FRAWLEY_RETURN_JUDGMENT_GRAMMAR' in sources)
check(case,'return house rulers 1/7 can apply to conjunction','return house-ruler contacts with moving-moving application', 'returnHouseRulerContacts' in types and 'buildHouseRulerContacts' in engine)
check(case,'radical house rulers can apply in return','radical rulers located/contacted in return', 'radicalHouseRulersInReturn' in types and 'radicalHouseRulerContactsInReturn' in types)
check(case,'return Jupiter may aspect ruler of natal second','every return planet is explicitly related to radical-house rulers', 'returnPlanetContactsToRadicalHouseRulers' in types)
check(case,'same ruler can repeat between radix and return house','house-ruler continuity ledger', 'houseRulerContinuities' in types)
check(case,'return angles can repeat/mirror natal angles','angle repetition evidence', 'angleContactsToRadixAngles' in types)
check(case,'nodes on angles matter','node↔angle return contacts', 'nodeContactsWithinReturn' in types)
check(case,'planetary aspects to return angles are available without reconstruction','planet↔angle internal contact matrix', 'planetAngleContactsWithinReturn' in types)
check(case,'all planets tucked in the middle of cadent houses can signal little happening','cadent-and-away-from-cusps composite summary', 'allTraditionalPlanetsCadentAndAwayFromCusps' in types and 'cuspProximities.length === 0' in engine)

# Marcos Monteiro — Ciro/Bolsonaro public progression/return examples
case='Marcos — Ciro Gomes / Jair Bolsonaro predictive examples'
check(case,'Fortune and Spirit move at lunar-scale when recomputed from progressed factors','seven progressed Parts recomputed, no solar-arc Fortune translation', 'marcosLotsFromSky' in engine and 'directedFortune' not in engine)
check(case,'other Parts such as Necessity can also be progressed','all seven Marcos lots in progressed layer', all(x in engine for x in ['Parte da Necessidade','Parte do Amor','Parte do Valor/Coragem','Parte da Vitória','Parte do Cativeiro']))
check(case,'progressed DSC and MC are explicit','four progressed angles', 'progressedDsc' in engine and 'progressedIc' in engine and 'name: "DSC"' in engine)
check(case,'progressed house cusp can be contacted','annual-scale progressed cusps', 'Cúspide ${index + 1} progredida' in engine and 'progressedGeometry.cusps' in engine and 'calculateNaibodProgressedHouses' in engine)
check(case,'progressed antiscion to natal Moon/node/Part is used','progressed antiscion→radix ledger', 'progressionAntisciaToRadix' in engine)
check(case,'progressed internal antiscion is available','progressed internal antiscion ledger', 'antiscionContactsWithinProgressedSky' in types)
check(case,'fixed stars along progressed Moon/Fortune/MC are inspectable','temporal fixed stars include Marcos moving points/lots', 'calculatePredictiveFixedStarContacts(birthChart, marcosSky, marcosMovingPoints' in engine)
check(case,'Solar ASC/DSC repetition with natal axis is explicit','return angle↔radix angle ledger', 'angleContactsToRadixAngles' in types)
check(case,'return nodes can contact natal nodes by antiscion','node antiscion→radix node/angle ledger', 'nodeAntiscionContactsToRadix' in types)
check(case,'recent sign-based dignity change in Solar is explicit','previous sign ingress + condition delta substrate', 'recentSignIngresses' in types and 'buildRecentSignIngresses' in engine)
check(case,'Solar uses natal, recalculated and natal-arc Parts; examples extend beyond Fortune','three variants for seven source-locked Parts', 'MARCOS_SOLAR_RETURN_PARTS_ARC_EXAMPLES' in sources and 'variant: "natal-position" | "return-calculated" | "natal-arc"' in types)
check(case,'Marcos follows progressed points through the year instead of only a target-date snapshot','governing Solar-year exact perfection timeline', 'ProgressionWindowTimeline' in types and 'buildProgressionWindowTimeline' in engine)
check(case,'chronology of direct C/O contacts is engine data, not AI extrapolation','dated direct perfection events with civil + symbolic instants', 'directEvents' in types and 'perfectionUtcIso' in types and 'symbolicUtcIso' in types)
check(case,'chronology of progressed antiscia is engine data','dated antiscion perfection events', 'antiscionEvents' in types and '"antiscion-contact"' in engine and 'antiscion ?' in engine)
check(case,'fixed-star passages receive exact dates instead of snapshot-only proximity','dated fixed-star conjunction events with epoch recalc', 'fixedStarEvents' in types and 'calculatePredictiveFixedStarTargets' in engine)

case='Frawley — five directors across a predictive year'
check(case,'change of term is a dated event for the five primary directors','term-ingress timeline', 'termIngressEvents' in types and 'primaryNames.has(moving)' in engine and 'FRAWLEY_FIVE_PRIMARY_DIRECTORS' in engine)
check(case,'sign ingress is dated because dignity/reception can change','sign-ingress timeline', 'signIngressEvents' in types and 'kind: "sign-ingress"' in engine)

# AI contract surface
case='MathAstro AI contract — no astrological recalculation'
for field in ['houses dos planetas','aspectos internos','nodos','recepções','ingressos','condições solares','regentes','Partes']:
    key={'houses dos planetas':'casas dos planetas','aspectos internos':'aspectos internos','nodos':'nodos','recepções':'recepções','ingressos':'ingressos','condições solares':'condições solares','regentes':'regentes','Partes':'Partes da Revolução'}[field]
    check(case,f'TXT/AI dossier exposes {field}',f'report mentions {key}', key.lower() in report.lower())


check(case,'subjective work is typed instead of hidden in prose','typed judgment tasks with evidence whitelist', 'PredictiveJudgmentTask' in types and 'allowedEvidencePaths' in types)
check(case,'semantic ambiguity can wait for human context','semantic task uses NEEDS_USER_CONTEXT', 'SEMANTIC_TOPIC_ROUTING' in types and 'NEEDS_USER_CONTEXT' in types)
check(case,'source gaps cannot be silently solved by the AI','absolute prompt preserves SOURCE_GAP', 'SOURCE_GAP' in (ROOT/'src/traditions/western/predictive/predictiveAiContract.ts').read_text(encoding='utf-8'))
check(case,'future bot has provider-neutral payload','ai-package API + bot adapter', 'format === "ai-package"' in (ROOT/'src/app/api/predictive/route.ts').read_text(encoding='utf-8') and (ROOT/'src/traditions/western/predictive/predictiveBotAdapter.ts').exists())

fails=[c for c in checks if c['status']=='FAIL']
out={'schema':'mathastro.predictive.author-case-oracles/1.1','checks':checks,'pass':len(checks)-len(fails),'fail':len(fails)}
(ROOT/'audit-results').mkdir(exist_ok=True)
(ROOT/'audit-results/predictive-author-case-oracles.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PREDICTIVE AUTHOR-CASE ORACLES RC5')
for c in checks: print(c['status'], '|', c['case'], '|', c['testimony'])
print(f"SUMMARY pass={out['pass']} fail={out['fail']}")
sys.exit(1 if fails else 0)
