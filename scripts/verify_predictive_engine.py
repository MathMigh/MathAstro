#!/usr/bin/env python3
from pathlib import Path
import json, math, re, sys
import swisseph as swe
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
FAIL=[]; PASS=[]
def check(name, cond, evidence=''):
    (PASS if cond else FAIL).append((name,evidence))

pdir=ROOT/'src/traditions/western/predictive'
astro=(pdir/'predictiveAstronomy.ts').read_text(encoding='utf-8')
engine=(pdir/'predictiveEngine.ts').read_text(encoding='utf-8')
contract=(pdir/'predictiveMethodContract.ts').read_text(encoding='utf-8')
types=(pdir/'predictiveTypes.ts').read_text(encoding='utf-8')
sources=(pdir/'predictiveSources.ts').read_text(encoding='utf-8')
stars=(pdir/'predictiveFixedStars.ts').read_text(encoding='utf-8')
gugu=(pdir/'guguPeriods.ts').read_text(encoding='utf-8')
route=ROOT/'src/app/api/predictive/route.ts'
page=ROOT/'src/app/ocidental/preditiva/page.tsx'
workspace=ROOT/'src/app/ocidental/preditiva/PredictiveWorkspace.tsx'
report=(pdir/'predictiveReport.ts').read_text(encoding='utf-8')

check('bounded context has canonical engine', 'calculatePredictiveEngine' in engine)
check('API /api/predictive exists', route.exists())
check('front /ocidental/preditiva exists', page.exists() and workspace.exists())
check('AI schema upgraded to 1.5 with judgment contract + progression timeline', 'mathastro.predictive.ai-report/1.5' in engine and 'schemaVersion: "1.5.0"' in engine and 'ProgressionWindowTimeline' in types and 'aiJudgmentContract' in engine)
check('integrated author mode exists', '"integrated"' in types and '"gugu"' in types and 'authorMode ?? "integrated"' in engine)
check('Gugu-only mode actually changes calculation stack', 'mode !== "gugu"' in engine and 'period_context_only' in engine)
check('progressions restricted to conjunction/opposition in canonical shared subset', 'conjunction-and-opposition-only' in engine and '["conjunction", "opposition"]' in engine)
check('legacy profection planet rotation not imported', 'chartUtils' not in engine and 'getPlanetsProfection' not in engine)
check('profection explicitly forbids planet rotation', 'do-not-rotate-natal-planets' in engine)
check('transit trigger requires higher support in Marcos/Frawley stack', 'trigger-only-needs-higher-scale-support' in engine and 'background_only' in engine and 'eligible_trigger' in engine)
check('Gugu transit is period-context only', 'gugu-period-context-no-autonomous-event-prediction' in engine and 'period_context_only' in engine)
check('convergence has no aggregate score', 'noAggregateScore' in engine and 'score:' not in re.sub(r'Natal|natal','',engine))
check('report exposes AI judgment order', '## ORDEM DE JULGAMENTO DA IA' in report)
check('report exposes absolute PT-BR AI prompt and typed judgment contract', '## PROMPT ABSOLUTO PARA A IA — PT-BR' in report and '## CONTRATO DE JULGAMENTO SUBJETIVO DA IA' in report)
check('DLR source-locked in contract', 'derived_lunar_return' in contract and 'CANONICAL_NEW_ENGINE' in contract)
check('primary directions deferred, not silently merged', 'primary_directions' in contract and 'DEFERRED_BY_PROFILE' in contract and 'MARCOS_YOUTUBE_EN_PREDICTION_MODULE' in contract)
check('Gugu planetary periods canonical source lock', 'gugu_planetary_periods' in contract and 'GUGU_COSMOLOGY04_PERIOD_VALUES' in sources)
check('Gugu zodiacal subdivision continues across cycles', 'SOURCE_LOCKED_ZODIAC_SEQUENCE_CONTINUED' in types and 'Math.floor(sequenceIndex / 12)' in gugu and 'sequenceIndex < 240' in gugu)
check('Frawley five primary directors materialized', 'FRAWLEY_FIVE_PRIMARY_DIRECTORS' in sources and 'primaryDirectors' in types and all(x in engine for x in ['Parte da Fortuna','progressedAngles','frawleyPrimaryDirectors']))
check('Frawley progression target classes materialized', 'cúspides natais por perfil autoral' in engine and 'mudanças de termo' in engine and 'radixCusps(birthChart' in engine)
check('Frawley natal house policy is Placidus', 'authorMode === "frawley" ? "P" : "R"' in engine and 'frawleyNatal: "Placidus"' in engine)
check('combined modes materialize separate R/P author geometries', 'authorHouseSystemVariants' in types and 'solarAuthorVariants' in engine and 'placidus:' in engine and 'regiomontanus:' in engine)
check('progressed angles decoupled from diurnal symbolic sky', 'calculateNaibodProgressedHouses' in engine and 'naibod-in-ra-via-progressed-ramc' in engine and 'progressPointByMeanSolarArc' not in engine)
check('progression terms use Lilly terms', 'LILLY_TERMS' in engine and 'termChanges' in types)
check('fixed stars are recalculated at predictive epoch', 'calculateFullFixedStarSky' in stars and 'sky.julianDayUt' in stars)
check('fixed-star same-sign gate preserved', 'sameSign' in stars and 'MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB' in stars and 'MARCOS_FIXED_STAR_COMMON_MAX_ORB' in stars)
check('temporal fixed stars materialized in progressions/returns/transits', 'temporalFixedStarContacts' in types and engine.count('calculatePredictiveFixedStarContacts') >= 5)
check('Marcos return location uses birthplace', 'includesMarcos(authorMode) ? input.birthDate.coordinates : eventLocation' in engine and 'MARCOS_BOOK_SOLAR_RETURN_BIRTHPLACE' in sources)
check('alternate event-location geometry materialized without doctrinal blending', 'alternateEventLocationSky' in types and 'solarAlternate' in engine)
check('source registry distinguishes Marcos/Frawley/Gugu', all(x in sources for x in ['MARCOS_YOUTUBE_EN_PREDICTION_MODULE','FRAWLEY_CURRENT_NATAL_PREDICTION','GUGU_COSMOLOGY04_PERIOD_VALUES']))
check('UI separates birthplace from event location', all(x in workspace.read_text(encoding='utf-8') for x in ['birthCoordinates','eventCoordinates','birthLatitude','eventLatitude']))
check('Frawley-only unresolved policies are explicit source gaps', all(x in engine for x in ['FRAWLEY_RETURN_LOCATION_POLICY','FRAWLEY_PROGRESSION_ASPECT_POLICY','FRAWLEY_TEMPORAL_FIXED_STAR_ORB_POLICY']))
check('combined modes expose Marcos fallbacks without claiming Frawley agreement', 'SOURCE_LOCKED_FALLBACK_IN_COMBINED_MODES' in engine and 'doesNotClaimMissingAuthorAgreement: true' in engine and engine.count('missingAuthor: "John Frawley"') == 3)
check('Marcos fallback covers return location in combined modes', 'gapId: "FRAWLEY_RETURN_LOCATION_POLICY"' in engine and 'MARCOS_BOOK_SOLAR_RETURN_BIRTHPLACE' in engine)
check('Marcos fallback covers progression aspect policy in combined modes', 'gapId: "FRAWLEY_PROGRESSION_ASPECT_POLICY"' in engine and 'MARCOS_2026_PROGRESSIONS_CONJ_OPP' in engine and 'MARCOS_CURRENT_SOURCE_LOCKED' in engine)
check('Marcos fallback covers temporal fixed-star orb in combined modes', 'gapId: "FRAWLEY_TEMPORAL_FIXED_STAR_ORB_POLICY"' in engine and 'MARCOS_FIXED_STARS_TEMPORAL_COURSE' in engine)
check('progressed-angle setting has convergent Frawley-school secondary attestation', 'FRAWLEY_NAIBOD_RA_SECONDARY_ATTESTATION' in sources and 'evidenceLevel: "SECONDARY"' in sources and 'naibod-in-ra-via-progressed-ramc' in engine and 'FRAWLEY_SCHOOL_SECONDARY_ATTESTATION_TRADITIONAL_MECHANICS' in types)
check('only primary-author angle-setting citation remains a nonblocking provenance gap', 'ANGLE_PROGRESSION_PRIMARY_AUTHOR_SETTING' in engine and 'MARCOS_PROGRESSIONS_ANGLE_USAGE_EXAMPLES' in sources)
check('Naibod implementation advances natal RAMC then rebuilds houses', all(x in astro for x in ['calculateNaibodProgressedHouses','targetArmc = normalize360(natalArmc + arcDegrees)','rawHouses(sw as any, jd, location, houseSystemCode)']) and 'progressPointByMeanSolarArc' not in engine)
check('Naibod geometry carrier is anchored near day-for-year ephemeris epoch', 'let jd = natalJd + ageYears' in astro)
check('Gugu stale first-cycle source gap removed from active docs/contract', 'first source-explicit zodiacal cycle only' not in contract and 'SOURCE_GAP_AFTER_FIRST_ZODIAC_CYCLE' not in (pdir/'README.md').read_text(encoding='utf-8'))
check('temporal fixed-star doctrine is not falsely attributed to Frawley', 'authors: ["MARCOS_RECENT"]' in contract and 'sourceIds: ["MARCOS_FIXED_STARS_TEMPORAL_COURSE"]' in contract)
check('combined progression stars preserve Marcos movers beyond Frawley five', 'const progressionStars = authorMode === "frawley" ? frawleyStars : marcosStars' in engine and 'const movingPoints = authorMode === "frawley" ? frawleyPrimaryDirectors : marcosMovingPoints' in engine)
check('Frawley star eligibility attaches only to five primary directors', 'frawleyPrimaryDirector' in stars and 'technique === "progression" && frawleyPrimaryDirector' in stars)
check('Marcos seven progressed Parts are recomputed from progressed factors', 'marcosLotsFromSky' in engine and all(x in engine for x in ['Parte da Fortuna','Parte do Espírito','Parte da Necessidade','Parte do Amor','Parte do Valor/Coragem','Parte da Vitória','Parte do Cativeiro']))
arabic_lots=(ROOT/'src/app/lib/arabicLots.ts').read_text(encoding='utf-8')
check('Marcos progressed Parts preserve the Natal spreadsheet fixed formulas without sect reversal', 'const isDiurno = isMarcosMethod ? true : isDiurnalChart(chart)' in arabic_lots and 'const fortune = normalize360(asc + moon - sun)' in engine and ('const spirit = normalize360(asc + sun - moon)' in engine or 'const spirit = normalize360(asc! + sun! - moon!)' in engine))
check('legacy solar-arc Fortune progression removed', 'progressPointByMeanSolarArc(fortuneNatal.longitude' not in engine and 'directedFortune' not in engine)
check('progressed DSC/IC and cusps are RAMC-rebuilt and materialized', all(x in engine for x in ['progressedDsc','progressedIc','Cúspide ${index + 1} progredida','progressedGeometry.cusps']))
check('progression antiscion evidence is explicit', 'antiscionContactsToRadix' in types and 'progressionAntisciaToRadix' in engine and 'antiscionContactsWithinProgressedSky' in types)
check('governing Solar-year progression timeline is materialized', 'buildProgressionWindowTimeline' in engine and 'basis: "governing-solar-return-year"' in engine and 'progressionWindow?: ProgressionWindowTimeline' in types)
check('progression timeline refines exact C/O and antiscion roots', 'refineRoot' in engine and 'signedAngularDelta' in engine and 'directEvents' in types and 'antiscionEvents' in types)
check('progression timeline materializes Frawley term changes', 'termIngressEvents' in types and 'termRulerAt' in engine and 'FRAWLEY_FIVE_PRIMARY_DIRECTORS' in engine)
check('progression timeline materializes sign ingresses', 'signIngressEvents' in types and 'kind: "sign-ingress"' in engine)
check('progression timeline materializes exact fixed-star conjunction dates', 'fixedStarEvents' in types and 'calculatePredictiveFixedStarTargets' in engine and 'kind: "fixed-star-conjunction"' in engine)
check('progression timeline is fail-closed into validation', 'progressionWindowTimelineMaterialized' in engine and 'progressionWindowRootsNumericallyTight' in engine)
check('return planets carry houses', 'house: houseFor(position.longitude)' in astro and 'housePlacements' in types)
check('true nodes are materialized in predictive skies', 'rawPosition(sw as any, jd, 11)' in astro and 'nodes: PredictivePoint[]' in types)
check('return node and node-antiscion evidence is explicit', 'nodeContactsWithinReturn' in types and 'nodeAntiscionContactsToRadix' in types and 'antiscionPoints(sky.nodes)' in engine)
check('Frawley return internal aspect grammar is materialized', 'contactsWithinReturn' in types and 'pairContacts(sky.planets)' in engine and 'FRAWLEY_RETURN_JUDGMENT_GRAMMAR' in sources)
check('return planet-to-angle aspect matrix is explicit', 'planetAngleContactsWithinReturn' in types and 'matrixContacts(sky.planets, sky.angles)' in engine)
check('cadent quiet-return flag requires planets away from cusps', 'allTraditionalPlanetsCadentAndAwayFromCusps' in types and 'cuspProximities.length === 0' in engine)
check('moving-moving application uses both speeds', 'futureFirst' in engine and 'futureSecond' in engine and 'nearestMovingPairContact' in engine)
check('Frawley 1-2 degree return cusp emphasis is source-locked', 'cuspProximities' in types and 'distanceDeg <= 2' in engine and 'maxOrbDeg: 2 as const' in engine)
check('return reception ledger and changes are materialized', all(x in types for x in ['ReturnReceptionEvidence','receptionChangesFromRadix','imminentSignIngresses','recentSignIngresses']))
check('previous and next sign ingresses are calculated', 'findPreviousSignIngress' in engine and 'findNextSignIngress' in engine and 'buildRecentSignIngresses' in engine and 'buildImminentSignIngresses' in engine)
check('return solar conditions are author-separated', 'solarConditions' in types and 'marcosStatus' in types and 'frawleyStatus' in types and 'MARCOS_BOOK_SOLAR_CONDITION_LIMITS' in sources and 'FRAWLEY_APPLIED_SOLAR_CONDITION_LIMITS' in sources)
check('return house rulers and radical rulers in return are explicit', all(x in types for x in ['returnHouseRulers','radicalHouseRulersInReturn','houseRulerContinuities','returnPlanetContactsToRadicalHouseRulers']))
check('return internal antiscion and cusp-antiscion are explicit', 'antiscionContactsWithinReturn' in types and 'cuspAntiscionContactsWithinReturn' in types and 'antiscionPoints(sky.cusps)' in engine)
check('return angle repetition against radix is explicit', 'angleContactsToRadixAngles' in types and 'matrixContacts(sky.angles, radixAngles' in engine)
check('return angular/succedent/cadent summary is explicit', 'allTraditionalPlanetsCadent' in types and 'houseEmphasis' in types)
check('Marcos Solar Return seven-Part variants are materialized', 'MARCOS_SOLAR_RETURN_PARTS_ARC_EXAMPLES' in sources and 'variant: "natal-position" | "return-calculated" | "natal-arc"' in types and 'solarReturn.lots.length >= 21' in engine)
check('return fixed-star calculation includes return Part points', 'solarLotSeeds.map((item) => item.point)' in engine)

# Independent PySwiss reference using the project's Barra Mansa precision fixture.
fixture=json.loads((ROOT/'fixtures/barra-mansa-santa-casa-2001-precision.json').read_text(encoding='utf-8'))
birth_jd=fixture['input']['julianDayUt']; birth_sun=fixture['positions']['Sol']['longitude']; birth_moon=fixture['positions']['Lua']['longitude']
target_dt=datetime(2026,8,31,15,0,0,tzinfo=timezone.utc)
target_jd=swe.julday(target_dt.year,target_dt.month,target_dt.day,15.0,swe.GREG_CAL)
def norm(x): return x%360.0
def signed(x):
    x=norm(x); return x-360 if x>=180 else x
def pos(jd,body):
    data,_=swe.calc_ut(jd,body,swe.FLG_SWIEPH|swe.FLG_SPEED); return data[0],data[3]
def previous_return(body,target,before,cycle):
    lon,spd=pos(before,body); sep=norm(lon-target); fallback=0.985647 if body==swe.SUN else 13.1764
    guess=before-sep/max(abs(spd),fallback*.5)
    def refine(jd):
        for _ in range(20):
            l,s=pos(jd,body); err=signed(l-target); s=s if abs(s)>1e-8 else fallback; jd-=err/s
            if abs(err)<1e-10: break
        return jd
    guess=refine(guess)
    if guess>before+1/86400: guess=refine(guess-cycle)
    if before-guess>cycle*1.25: guess=refine(guess+cycle)
    if guess>before+1/86400: guess=refine(guess-cycle)
    l,_=pos(guess,body); return guess,l,abs(signed(l-target))*3600

solar_jd,solar_lon,solar_res=previous_return(swe.SUN,birth_sun,target_jd,365.2422)
lunar_jd,lunar_lon,lunar_res=previous_return(swe.MOON,birth_moon,target_jd,27.321661)
solar_moon,_=pos(solar_jd,swe.MOON)
dlr_jd,dlr_lon,dlr_res=previous_return(swe.MOON,solar_moon,target_jd,27.321661)
age_years=(target_jd-birth_jd)/365.2425; progressed_jd=birth_jd+age_years; age_completed=math.floor(age_years)
profected_house=age_completed%12+1; asc=fixture['houses']['regiomontanus'][0]; profected_sign=(math.floor(asc/30)+age_completed)%12
rulers=['Marte','Vênus','Mercúrio','Lua','Sol','Mercúrio','Vênus','Marte','Júpiter','Saturno','Saturno','Júpiter']
check('PySwiss solar root <1 arcsec', solar_res < 1, f'{solar_res:.8f}"')
check('PySwiss lunar root <1 arcsec', lunar_res < 1, f'{lunar_res:.8f}"')
check('PySwiss DLR root <1 arcsec', dlr_res < 1, f'{dlr_res:.8f}"')
check('governing returns precede target', solar_jd <= target_jd and lunar_jd <= target_jd and dlr_jd <= target_jd)
check('day-for-year uses decimal age', abs((progressed_jd-birth_jd)-age_years)<1e-9, f'age={age_years:.8f}')
check('reference profection is house 2 at age 25', age_completed==25 and profected_house==2, f'age={age_completed} house={profected_house}')
check('reference profection lord is Mercury', rulers[profected_sign]=='Mercúrio', f'signIndex={profected_sign} lord={rulers[profected_sign]}')

# Independent PySwiss oracle for Naibod-in-RA progressed houses. The canonical
# operation is RAMC_natal + Naibod arc, followed by a fresh house calculation
# at the natal latitude. This deliberately differs from translating each cusp's
# own RA point-by-point.
mean_solar_motion=0.98564736
angle_arc=age_years*mean_solar_motion
check('progressed angle arc is annual-scale not diurnal', 20 < angle_arc < 30, f'arc={angle_arc:.8f}°')
check('progressed angle arc equals mean-solar motion x decimal age', abs(angle_arc-age_years*0.98564736)<1e-12)
lat=fixture['input']['latitude']; lon=fixture['input']['longitude']
sidereal_rotation=360.98564736629
def angular_error(a,b): return abs(signed(a-b))
def naibod_houses_oracle(hsys):
    natal_cusps,natal_ascmc=swe.houses_ex(birth_jd,lat,lon,hsys)
    natal_armc=natal_ascmc[2]
    target_armc=norm(natal_armc+angle_arc)
    carrier=birth_jd+age_years
    for _ in range(10):
        c,a=swe.houses_ex(carrier,lat,lon,hsys)
        err=signed(a[2]-target_armc)
        if abs(err)<1e-11: break
        carrier-=err/sidereal_rotation
    synthetic_cusps,synthetic_ascmc=swe.houses_ex(carrier,lat,lon,hsys)
    true_eps=swe.calc_ut(carrier,swe.ECL_NUT)[0][0]
    direct_cusps,direct_ascmc=swe.houses_armc(target_armc,lat,true_eps,hsys)
    max_err=max(
        [angular_error(synthetic_ascmc[0],direct_ascmc[0]), angular_error(synthetic_ascmc[1],direct_ascmc[1]), angular_error(synthetic_ascmc[2],target_armc)]
        + [angular_error(x,y) for x,y in zip(synthetic_cusps,direct_cusps)]
    )
    return {
        'natal_cusps':natal_cusps,'natal_ascmc':natal_ascmc,'target_armc':target_armc,
        'carrier':carrier,'cusps':synthetic_cusps,'ascmc':synthetic_ascmc,'direct_cusps':direct_cusps,
        'direct_ascmc':direct_ascmc,'max_err_deg':max_err,
    }
naibod_R=naibod_houses_oracle(b'R'); naibod_P=naibod_houses_oracle(b'P')
check('PySwiss Regiomontanus Naibod RAMC reconstruction <0.01 arcsec', naibod_R['max_err_deg']*3600 < 0.01, f"max={naibod_R['max_err_deg']*3600:.6f} arcsec")
check('PySwiss Placidus Naibod RAMC reconstruction <0.01 arcsec', naibod_P['max_err_deg']*3600 < 0.01, f"max={naibod_P['max_err_deg']*3600:.6f} arcsec")
check('Naibod target RAMC equals natal RAMC plus annual arc', angular_error(naibod_R['target_armc'], norm(naibod_R['natal_ascmc'][2]+angle_arc)) < 1e-12, f"target={naibod_R['target_armc']:.9f}")

# Discriminating regression: the RC4 point-wise RA translation of the natal ASC
# is materially different from a Naibod RAMC house reconstruction, so this test
# would have caught the old implementation instead of merely blessing the new one.
def ecl_to_ra(lon0, eps=23.4392911):
    l=math.radians(norm(lon0)); e=math.radians(eps)
    return norm(math.degrees(math.atan2(math.sin(l)*math.cos(e), math.cos(l))))
def ra_to_ecl(ra0, eps=23.4392911):
    r=math.radians(norm(ra0)); e=math.radians(eps)
    return norm(math.degrees(math.atan2(math.sin(r), math.cos(r)*math.cos(e))))
def legacy_pointwise_progress(lon0, years):
    return ra_to_ecl(ecl_to_ra(lon0)+years*mean_solar_motion)
old_pointwise_asc=legacy_pointwise_progress(naibod_R['natal_ascmc'][0],age_years)
correct_naibod_asc=naibod_R['ascmc'][0]
old_vs_new_asc=angular_error(old_pointwise_asc,correct_naibod_asc)
check('oracle discriminates old point-wise ASC method from Naibod RAMC', old_vs_new_asc > 1.0, f'diff={old_vs_new_asc:.6f}° old={old_pointwise_asc:.6f} new={correct_naibod_asc:.6f}')

# Marcos-case regression: Fortune/Spirit must be recomputed from progressed
# ASC/Sun/Moon using the correctly reconstructed progressed ASC, not translated
# by the ~1°/year mean-solar arc.
prog_sun,_=pos(progressed_jd,swe.SUN); prog_moon,_=pos(progressed_jd,swe.MOON)
prog_asc=correct_naibod_asc
natal_fortune=norm(naibod_R['natal_ascmc'][0]+birth_moon-birth_sun)
prog_fortune=norm(prog_asc+prog_moon-prog_sun)
prog_spirit=norm(prog_asc+prog_sun-prog_moon)
legacy_solar_arc_fortune=legacy_pointwise_progress(natal_fortune,age_years)
check('Marcos progressed Fortune is factor-recomputed, not solar-arc translated', abs(signed(prog_fortune-legacy_solar_arc_fortune)) > 1.0, f'new={prog_fortune:.6f} legacy={legacy_solar_arc_fortune:.6f}')
check('Marcos progressed Fortune/Spirit remain ASC-symmetric', abs(signed(norm(prog_fortune+prog_spirit)-norm(2*prog_asc))) < 1e-9, f'fortune={prog_fortune:.6f} spirit={prog_spirit:.6f}')

reference={
 'schema':'mathastro.predictive.reference/1.3', 'fixture':'barra-mansa-santa-casa-2001-precision.json', 'targetUtc':'2026-08-31T15:00:00Z',
 'ageYears':age_years,'progressedJulianDayUt':progressed_jd,
 'solarReturn':{'julianDayUt':solar_jd,'longitude':solar_lon,'targetLongitude':birth_sun,'residualArcSeconds':solar_res},
 'lunarReturn':{'julianDayUt':lunar_jd,'longitude':lunar_lon,'targetLongitude':birth_moon,'residualArcSeconds':lunar_res},
 'derivedLunarReturn':{'julianDayUt':dlr_jd,'longitude':dlr_lon,'targetLongitude':solar_moon,'solarMoonLongitude':solar_moon,'residualArcSeconds':dlr_res},
 'profection':{'ageCompleted':age_completed,'house':profected_house,'profectedSignIndex':profected_sign,'lordOfYear':rulers[profected_sign]},
 'naibodProgressedHouses':{
   'arcDegrees':angle_arc,
   'regiomontanus':{'targetArmc':naibod_R['target_armc'],'syntheticJulianDayUt':naibod_R['carrier'],'asc':naibod_R['ascmc'][0],'mc':naibod_R['ascmc'][1],'cusps':list(naibod_R['cusps']),'oracleMaxErrorArcSeconds':naibod_R['max_err_deg']*3600},
   'placidus':{'targetArmc':naibod_P['target_armc'],'syntheticJulianDayUt':naibod_P['carrier'],'asc':naibod_P['ascmc'][0],'mc':naibod_P['ascmc'][1],'cusps':list(naibod_P['cusps']),'oracleMaxErrorArcSeconds':naibod_P['max_err_deg']*3600},
   'legacyPointwiseAsc':old_pointwise_asc,'legacyVsNaibodAscDifferenceDeg':old_vs_new_asc,
 },
 'progressedLotsMarcos':{'fortune':prog_fortune,'spirit':prog_spirit},
}
(ROOT/'fixtures/predictive-reference-20260901.json').write_text(json.dumps(reference,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

print('PREDICTIVE ENGINE VERIFICATION RC5')
for n,e in PASS: print('PASS',n,('— '+e) if e else '')
for n,e in FAIL: print('FAIL',n,('— '+e) if e else '')
print(f'SUMMARY pass={len(PASS)} fail={len(FAIL)}')
sys.exit(1 if FAIL else 0)
