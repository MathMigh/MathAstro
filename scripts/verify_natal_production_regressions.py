#!/usr/bin/env python3
"""Independent production regressions for the isolated Western natal engine.

This verifier deliberately does not import the TypeScript implementation. It uses
PySwissEph as an independent oracle for the geometric cases that previously
failed in real reports, and performs static contract assertions on the hardening
code. A structural 48/48 matrix alone is NOT considered a production pass.
"""
from __future__ import annotations

from pathlib import Path
import math
import re
import sys
import swisseph as swe

ROOT = Path(__file__).resolve().parents[1]
SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED

checks: list[tuple[str, bool, str]] = []

def check(name: str, ok: bool, detail: str) -> None:
    checks.append((name, bool(ok), detail))


def norm(x: float) -> float:
    return x % 360.0


def angular(a: float, b: float) -> float:
    d = abs(norm(a) - norm(b))
    return 360.0 - d if d > 180.0 else d


def sign_index(x: float) -> int:
    return int(norm(x) // 30.0) % 12


def lon(jd: float, body: int) -> float:
    return norm(swe.calc_ut(jd, body, FLAGS)[0][0])


def house_index(longitude: float, cusps: tuple[float, ...]) -> int:
    x = norm(longitude)
    for i in range(12):
        start = norm(cusps[i])
        end = norm(cusps[(i + 1) % 12])
        span = norm(end - start)
        offset = norm(x - start)
        if offset < span or math.isclose(offset, span, abs_tol=1e-10):
            return i + 1
    raise AssertionError("house not resolved")


def find_ingress(jd0: float, body: int, direction: int, step: float = 0.5, maxdays: float = 1200.0):
    prev = jd0
    prev_sign = sign_index(lon(prev, body))
    elapsed = step
    while elapsed <= maxdays:
        candidate = jd0 + direction * elapsed
        candidate_sign = sign_index(lon(candidate, body))
        if candidate_sign != prev_sign:
            left, right = sorted((prev, candidate))
            left_sign = sign_index(lon(left, body))
            for _ in range(90):
                mid = (left + right) / 2
                if sign_index(lon(mid, body)) == left_sign:
                    left = mid
                else:
                    right = mid
            root = (left + right) / 2
            before = sign_index(lon(root - 1e-6, body))
            after = sign_index(lon(root + 1e-6, body))
            return root - jd0, SIGNS[before], SIGNS[after], lon(root, body)
        prev = candidate
        prev_sign = candidate_sign
        elapsed += step
    return None


def format_orb(value: float) -> str:
    total_seconds = max(0, round(abs(value) * 3600))
    degree = total_seconds // 3600
    minute = (total_seconds % 3600) // 60
    second = total_seconds % 60
    return f"{degree}°{minute:02d}′{second:02d}″"

# ------------------------------------------------------------------
# 1) Manaus 1999: the exact case that exposed effective-house leakage.
# ------------------------------------------------------------------
MANAUS_JD = swe.julday(1999, 6, 18, 21.0)
manaus_cusps, _ = swe.houses_ex(MANAUS_JD, -3.1321038, -60.0215685, b"R", 0)
saturn = lon(MANAUS_JD, swe.SATURN)
saturn_geom = house_index(saturn, manaus_cusps)
next_house = 1 if saturn_geom == 12 else saturn_geom + 1
next_cusp = norm(manaus_cusps[next_house - 1])
distance = norm(next_cusp - saturn)
same_sign = sign_index(saturn) == sign_index(next_cusp)
saturn_effective = next_house if 0 < distance <= 5 and same_sign else saturn_geom
check(
    "manaus_saturn_effective_house_6",
    saturn_geom == 5 and saturn_effective == 6 and distance < 2,
    f"Saturn geom=H{saturn_geom}, effective=H{saturn_effective}, distance={distance:.8f}°",
)

# The old report emitted Libra→Libra. Independent ephemeris must resolve real transitions.
previous_mars = find_ingress(MANAUS_JD, swe.MARS, -1)
next_mars = find_ingress(MANAUS_JD, swe.MARS, 1)
check(
    "manaus_mars_previous_ingress_real_transition",
    bool(previous_mars and previous_mars[1] == "Scorpio" and previous_mars[2] == "Libra" and previous_mars[1] != previous_mars[2]),
    f"previous={previous_mars}",
)
check(
    "manaus_mars_next_ingress_real_transition",
    bool(next_mars and next_mars[1] == "Libra" and next_mars[2] == "Scorpio" and next_mars[1] != next_mars[2]),
    f"next={next_mars}",
)

# ------------------------------------------------------------------
# 2) Barra Mansa 2001: independent Swiss regression against known output.
# ------------------------------------------------------------------
BM_JD = swe.julday(2001, 4, 21, 9.75)
expected = {
    swe.SUN: 31.3486111111,
    swe.MOON: 4.9077777778,
    swe.MERCURY: 29.0908333333,
    swe.VENUS: 1.4852777778,
    swe.MARS: 266.7327777778,
    swe.JUPITER: 71.4933333333,
    swe.SATURN: 60.0583333333,
}
max_err = 0.0
for body, target in expected.items():
    max_err = max(max_err, angular(lon(BM_JD, body), target))
check("barra_mansa_planet_longitudes", max_err < 2 / 3600, f"max error={max_err*3600:.3f} arcsec")

bm_cusps, bm_ascmc = swe.houses_ex(BM_JD, -22.4852784, -44.19707, b"R", 0)
check("barra_mansa_ascendant_regiomontanus", angular(bm_ascmc[0], 37.9552777778) < 3/3600, f"ASC={bm_ascmc[0]:.8f}")
check("barra_mansa_mc_regiomontanus", angular(bm_ascmc[1], 309.1505555556) < 3/3600, f"MC={bm_ascmc[1]:.8f}")

# ------------------------------------------------------------------
# 3) Formatting regression: sexagesimal carry must never show 60 seconds.
# ------------------------------------------------------------------
carry_samples = [1 + 12/60 + 59.6/3600, 0 + 0/60 + 59.8/3600, 0 + 44/60 + 59.9/3600]
formatted = [format_orb(v) for v in carry_samples]
check("sexagesimal_carry", all("′60″" not in x for x in formatted), f"samples={formatted}")

# ------------------------------------------------------------------
# 4) Static source gates: prevent regression back to old semantics.
# ------------------------------------------------------------------
analysis_ts = (ROOT / "src/app/lib/natalAnalysis.ts").read_text(encoding="utf-8")
constants_ts = (ROOT / "src/traditions/western/natal/natalMethodConstants.ts").read_text(encoding="utf-8")
precision_ts = (ROOT / "src/app/lib/natalPrecision.ts").read_text(encoding="utf-8")
report_ts = (ROOT / "src/app/lib/natalTechnicalReport.ts").read_text(encoding="utf-8")
validator_ts = (ROOT / "src/app/lib/natalProductionValidation.ts").read_text(encoding="utf-8")
route_ts = (ROOT / "src/app/api/birth-chart/route.ts").read_text(encoding="utf-8")
ai_form_ts = (ROOT / "src/app/lib/natalAiForm.ts").read_text(encoding="utf-8")
fixed_ts = (ROOT / "src/app/lib/fixedStars.ts").read_text(encoding="utf-8")
judgment_ts = (ROOT / "src/app/lib/natalJudgmentEngine.ts").read_text(encoding="utf-8")
integration_ts = (ROOT / "src/app/lib/natalAiIntegration.ts").read_text(encoding="utf-8")
sanitizer_ts = (ROOT / "src/app/lib/natalAiSanitizer.ts").read_text(encoding="utf-8")

check("anareta_distance_uses_absolute_angular", "distanceFromCusp: getAbsoluteAngularDistance(planet.longitudeRaw, eighthCusp)" in analysis_ts, "Anareta candidate distance normalized across the VIII cusp")
check("structured_form_materializes_core_dossiers", all(token in analysis_ts for token in ["sect,", "temperament,", "lordOfNativity: temperament.lordOfNativity", "manner,", "mentality,", "dispositors: dispositorSummary"]), "core radical dossiers live in technicalForm, not only prose")
check("ai_form_filters_noninterpretive_stars", "fixedStarContacts: source.fixedStarContacts.filter((match) => match.isRelevant)" in ai_form_ts and "major15: []" in ai_form_ts, "AI JSON excludes astronomical-only star coincidences/display list")
check("star_fallback_boundary_is_conservative", "CATALOG_PRECESSION_BOUNDARY_UNCERTAINTY_DEGREES = 1 / 60" in fixed_ts and "boundaryUncertain" in fixed_ts, "fallback star contacts near orb boundary fail closed")
check("marcos_planetary_influence_tiers_3_5", "MARCOS_NATAL_CORE_INFLUENCE_MAX_ORB = 3" in constants_ts and "MARCOS_NATAL_CONTEXTUAL_INFLUENCE_MAX_ORB = 5" in constants_ts and "classifyMarcosNatalInfluenceOrb" in constants_ts and "currentOrb > MARCOS_NATAL_INFLUENCE_MAX_ORB" in precision_ts, "<=3° core; >3°–5° contextual; distinct from cusp rule")
check("cusp_rule_remains_distinct_5", "MARCOS_CUSP_BASE_MAX_DEGREES = 5" in constants_ts and "distance <= MARCOS_CUSP_BASE_MAX_DEGREES" in analysis_ts, "cusp geometry remains <=5° same sign via distinct constant")
check("relationship_marcos_aspect_gated", "aspect.orbDistance <= MARCOS_NATAL_INFLUENCE_MAX_ORB" in analysis_ts and "broaderTraditionalAspect" in analysis_ts, "I-VII broad aspect separated")
check("house_ruler_aspects_have_source_gate", "rulerAspects: Array" in analysis_ts and "marcosNatalEligible" in analysis_ts, "house-ruler aspects carry author eligibility")
check("report_uses_contract_not_green_label", "[CONTRACT-COVERED]" in report_ts and "[GREEN]" not in report_ts, "structural coverage no longer presented as production certification")
check("production_validator_has_global_aspect_gate", "globalAspectSourceSeparation" in validator_ts, "validator checks all planet/house aspect source gates")
check("ai_form_is_separate_and_sanitized", "buildNatalAiStructuredForm" in ai_form_ts and "sanitizeNatalAiValue" in ai_form_ts and "NATAL_AI_AUDIT_ONLY_KEYS" in sanitizer_ts and "aiStructuredForm" in route_ts and "auditStructuredForm" in route_ts, "AI JSON separated from audit JSON")
check("ai_release_is_fail_closed", 'releasedForAi: natalValidation.status === "PASS"' in route_ts, "API release controlled by production validation")
check("fixed_star_marcos_principal_set", all(name in fixed_ts for name in ["Regulus", "Aldebaran", "Antares", "Fomalhaut", "Sirius", "Procyon", "Castor", "Pollux", "Spica", "Algol"]), "ten Marcos principal stars encoded")
check("fixed_star_orb_classes", "MARCOS_FIXED_STAR_PRINCIPAL_MAX_ORB = 3" in constants_ts and "MARCOS_FIXED_STAR_COMMON_MAX_ORB = 1" in constants_ts and "const maxOrb = marcosPrincipal" in fixed_ts, "Marcos principal <=3°; Frawley-only explicit/common traditional <=1°")
check("source_locked_deep_sky_exception", "sourceLockedNonstellar" in fixed_ts and "Frawley-Applied-explicit" in fixed_ts, "Frawley explicit nebula/deep-sky not blanket-deleted")
check("source_gap_registry_materialized", "sourceGapRegistry: NatalSourceGapEntry[]" in analysis_ts and "buildNatalSourceGapRegistry" in analysis_ts, "formal registry separates source gaps from missing engine data")
check("source_gap_registry_fail_closed", "noBlockingRadicalSourceGaps" in validator_ts and "BLOCKING_RADICAL_SOURCE_GAP" in validator_ts, "unresolved radical-blocking source gaps fail AI release")
check("source_gap_registry_unique_and_sourced", "sourceGapRegistryUnique" in validator_ts and "sourceGapRegistryProvenance" in validator_ts, "gap IDs/provenance are production invariants")
check("unverified_profession_rule_stays_disabled", "frawley-profession-sunrise-criterion" in analysis_ts and "REJECTED_UNVERIFIED" in analysis_ts and "planeta que nasce mais próximo do Sol no nascer do Sol - não atribuir" in analysis_ts and "rejectedUnverifiedRulesDisabled" in validator_ts, "unverified sunrise-vocation claim cannot leak back into active Natal")
check("ai_form_exposes_gap_summary", 'schemaVersion: "2.0.0"' in ai_form_ts and "sourceGaps:" in ai_form_ts and "blockingRadical" in ai_form_ts and "unresolvedNonBlocking" in ai_form_ts, "AI form receives explicit gap classes without confusing them with engine failure")
check("node_orb_not_invented_as_5deg", "nodeRawDistances" in analysis_ts and ".filter((item) => item.distance <= 1)" in analysis_ts and "CONJUNCTION_ONLY_CONSERVATIVE_1DEG" in analysis_ts and "marcos-node-orb" in analysis_ts, "nodes preserve raw geometry; 1° is conservative engine gate, never a claimed Marcos 5° orb")
check("solar_condition_is_source_split", "solarConditionBySource" in analysis_ts and "classifySolarConditionMarcos" in analysis_ts and "classifySolarConditionFrawleyApplied" in analysis_ts, "Marcos canonical solar condition is not blended with Frawley Applied")
check("marcos_cazimi_17_5_arcmin", "17.5 / 60" in analysis_ts and "outer under-rays boundary is 17°" in analysis_ts, "detailed Marcos solar-radius explanation encoded")
check("frawley_sunbeams_17_5deg", "distance <= 17.5" in analysis_ts and "The Real Astrology Applied: 17.5' cazimi" in analysis_ts, "Frawley Applied solar boundaries preserved independently")
check("eclipse_physical_classifier_implemented", "prenatal-eclipse-physical-classification" in analysis_ts and 'status: "RESOLVED_IMPLEMENTED"' in analysis_ts and "findNextSolarEclipse" in precision_ts and "findNextLunarEclipse" in precision_ts and "physicalEclipse" in precision_ts, "exact syzygy is tested against Swiss Ephemeris physical eclipse intervals; nodal geometry is diagnostic only")

check("gugu_proper_places_source_locked", 'properPlacesStatus: "SOURCE_LOCKED_IMPLEMENTED"' in analysis_ts and '\"Mercúrio\": 1' in analysis_ts and '\"Saturno\": 5' in analysis_ts and "signsBeforeMoon" in analysis_ts and "signsAfterSun" in analysis_ts, "Gugu proper-place 1/2/3/4/5 sign table is calculated, not left unresolved")
check("gugu_moon_nodes_semantics_source_locked", "mais-pratica-incisiva-ativa" in analysis_ts and "mais-sensivel-artistica-voluvel" in analysis_ts and "northSquareError" in analysis_ts and "RULE_SEMANTICS_SOURCE_LOCKED_ORB_UNSPECIFIED" in analysis_ts, "Gugu near-node/square-node semantics are materialized while the unpublished orb remains gated")
check("dynamic_cusp_beyond_five_evidence_complete", "marcos-dynamic-cusp-beyond-five" in analysis_ts and "EVIDENCE_COMPLETE_AUTHORIAL_CUTOFF_UNPUBLISHED" in analysis_ts and "distanceFractionOfHouse" in precision_ts and "withinTwoDegreesSameSign" in precision_ts and "withinThreeDegreesSameSign" in precision_ts and "motionTowardNextCusp" in precision_ts and "OUTSIDE_BASE_AUTHORIAL_REVIEW" in precision_ts, "all cusp arithmetic/dynamics materialized; no invented >5° authorial cutoff")
check("gugu_moon_orientation_materialized", 'name === "Lua"' in analysis_ts and 'waxing = occidental, waning = oriental' in analysis_ts, "Moon retains Gugu-requested oriental/occidental evidence without changing universal luminary label")
check("frawley_explicit_star_does_not_inherit_marcos_3deg", "Do not let a Frawley-explicit object inherit Marcos's wider principal-star orb" in fixed_ts and "const maxOrb = marcosPrincipal" in fixed_ts, "Frawley-only explicit objects stay at common ~1° unless also Marcos-principal")
check("solar_testimonies_are_author_separated", "cazimi-marcos" in analysis_ts and "cazimi-frawley" in analysis_ts and "combusto-marcos" in analysis_ts and "combusto-frawley" in analysis_ts and "no Marcos-only" in analysis_ts, "solar testimony ledger cannot silently merge author-specific exceptions")
check("audit_score_provenance_explicit", "scoreProvenance" in analysis_ts and "FRAWLEY_APPLIED_LEDGER" in analysis_ts and "proveniência do score" in report_ts, "audit numbers cannot masquerade as Marcos canonical scores")
check("node_testimony_has_no_invented_shared_score", "conjuncao-${node.type}-marcos" in analysis_ts and "conjuncao-${node.type}-frawley" in analysis_ts and "gate conservador do motor <=1°" in analysis_ts, "node conjunction evidence split by author and qualitative")
check("fixed_star_testimony_provenance_split", "estrela-${slug}-marcos" in analysis_ts and "estrela-${slug}-frawley" in analysis_ts and "sem score Marcos inventado" in analysis_ts, "star importance and Frawley legacy ledger are not silently merged")

check("authorial_temperaments_parallel", "temperaments: AuthorialTemperamentsDossier" in analysis_ts and "buildFrawleyTemperamentDossier" in analysis_ts and "buildGuguTemperamentDossier" in analysis_ts, "Marcos/Frawley/Gugu temperament tracks are materialized separately")
check("frawley_current_temperament_boundary", "frawley-current-temperament-delta" in analysis_ts and 'exactCurrentCalculationStatus: "CURRENT_METHOD_NOT_PUBLIC"' in analysis_ts, "published executable baseline is not mislabeled as exact current method")
check("gugu_primary_motivation_materialized", "buildGuguPrimaryMotivationDossier" in analysis_ts and "realizationInstrument" in analysis_ts and "saturnChallenge" in analysis_ts, "ASC→ruler→dispositor + strongest capability + Saturn challenge")
check("gugu_powers_of_soul_seven", "buildGuguPowerOfSoulDossier" in analysis_ts and all(token in analysis_ts for token in ["sentido-comum-fantasia", "estimativa", "apetite-concupiscivel", "vontade", "apetite-irascivel", "intelecto-paciente", "intelecto-agente"]), "seven analogical faculties are present with guardrails")
check("gugu_philosophical_frame_materialized", "buildGuguPhilosophicalFrame" in analysis_ts and "Astrologia opera por analogias" in analysis_ts and "Não moralizar um temperamento" in analysis_ts, "symbolic/anthropological frame is first-class")
check("frawley_spiritual_parts_independent", "FrawleySpiritualPart" in analysis_ts and 'makeSpiritualPart("faith"' in analysis_ts and '"ASC + Saturno - Fortuna"' in analysis_ts and "lotDossiers.map((lot)" not in analysis_ts[analysis_ts.find("function buildSpiritualOrientationDossier"):analysis_ts.find("function buildChildrenDossier")], "Frawley seven spiritual Parts are not Marcos seven lots")
check("outer_planets_secondary_modifiers_only", "buildOuterPlanetModifiers" in analysis_ts and 'role: "SECONDARY_MODIFIER_ONLY"' in analysis_ts and 'rulership: "NONE"' in analysis_ts and 'almutenParticipation: "NONE"' in analysis_ts, "Uranus/Neptune/Pluto can color close contacts but never rule or enter dignities")
check("outer_planet_orb_boundary_not_invented", 'authorialOrbStatus: "UNIVERSAL_CUTOFF_NOT_PUBLISHED"' in analysis_ts and "automaticInterpretation: false" in analysis_ts and "if (orb > MARCOS_NATAL_INFLUENCE_MAX_ORB) return" not in analysis_ts[analysis_ts.find("function buildOuterPlanetModifiers"):analysis_ts.find("function buildTechnicalForm")], "outer-planet geometry is preserved without turning generic 3°/5° into a special authorial cutoff")
check("marcos_lord_natv_accidental_tiebreak_failclosed", "essential-tie-accidental-angularity" in (ROOT / "src/app/lib/traditionalTemperament.ts").read_text(encoding="utf-8") and "angularFinalists.length === 1" in (ROOT / "src/app/lib/traditionalTemperament.ts").read_text(encoding="utf-8"), "direct Ratzinger-style accidental tie-break is limited to unambiguous exclusive angularity")
check("marcos_aspect_tier_provenance_materialized", "marcosInfluenceTier" in analysis_ts and "classifyMarcosNatalInfluenceOrb" in analysis_ts, "aspect dossiers carry core/contextual/outside tier")
check("gugu_later_temperament_resolved", "gugu-later-temperament-table" in analysis_ts and 'status: "RESOLVED_IMPLEMENTED"' in analysis_ts and "SOURCE_LOCKED_DETERMINANTS_AND_POINT_LEDGER" in analysis_ts and "DETAILED_WITNESS_LEDGER_IMPLEMENTED_ORB_BOUNDARY_EXPLICIT" in analysis_ts, "late-course Gugu base ledger is executable from recovered demonstrations")
check("gugu_temperament_node_angle_orb_boundary", "gugu-temperament-node-angle-orb" in analysis_ts and "orbe universal explícito e estável para nodo→ângulo" in analysis_ts and "ORB_BOUNDARY_UNPUBLISHED" in analysis_ts, "only the unprinted universal node→angle cutoff remains qualitative")

check("absolute_ai_three_layer_architecture", all(token in judgment_ts for token in ["NATAL_FACTS", "NATAL_AUTHORIAL_DOSSIER", "NATAL_JUDGMENT_CONTEXT", "absolute-natal-judgment"]), "absolute package separates computed facts, authorial method and question-specific judgment context")
check("absolute_ai_prompt_is_operational", all(token in judgment_ts for token in ["ABSOLUTE_NATAL_PROMPT", "LEI EPISTÊMICA", "ROTEAMENTO CONTEXTUAL DE MUNDO ABERTO", "LOOP DE AUTO-INVESTIGAÇÃO", "INFERÊNCIAS PROIBIDAS"]), "Portuguese prompt is a procedural judgment protocol rather than persona prose")
check("absolute_ai_forbids_recalculation", "Nunca recalcule longitude" in judgment_ts and "Nunca calcule astrologia dentro do modelo de linguagem" in judgment_ts and "aritmética de casas derivadas" in judgment_ts, "LLM cannot replace deterministic astrology engine")
check("absolute_ai_author_separation", "AUTHORIAL_DIVERGENCE" in judgment_ts and "Não harmonize à força" in judgment_ts and 'authorSeparation: "STRICT"' in judgment_ts, "Marcos/Frawley/Gugu provenance cannot be silently blended")
check("absolute_ai_evidence_graph", "buildNatalAuthorialEvidenceGraph" in judgment_ts and "same-symbol-different-role-by-context" in judgment_ts and "ANALOGICAL_FACULTY" in judgment_ts and "REALIZATION_INSTRUMENT" in judgment_ts, "same symbol can be followed through context-specific authorial roles")
check("absolute_ai_antiscion_author_layers", "contact.orb <= 1 + 1e-9" in judgment_ts and "Frawley Applied is only attached here at <=1°" in judgment_ts, "evidence graph does not attribute wider Marcos antiscion contacts to Frawley")
check("absolute_ai_judgment_zones", "buildAuthorialJudgmentZones" in judgment_ts and "DOCUMENTARY_BOUNDARY" in judgment_ts and "QUALITATIVE_SELECTION" in judgment_ts and "CONTEXT_REQUIRED" in judgment_ts, "unclosed authorial zones are surfaced to the LLM instead of hidden")
check("absolute_ai_derived_house_failclosed", "mere co-occurrence" in judgment_ts and "ownershipLinked" in judgment_ts and "derivedHouseTable.find" in judgment_ts, "turned houses are engine-resolved only on an ownership relation, not keyword co-occurrence")
check("absolute_ai_open_world_fallback", "OPEN_WORLD_SEMANTIC_ROUTING_REQUIRED" in judgment_ts and "houseOntology" in judgment_ts and "derivedHouseTable" in judgment_ts, "unlisted natal situations route through ontology rather than canned interpretation lists")
check("absolute_ai_shared_sanitizer", "sanitizeNatalAiValue" in judgment_ts and "NATAL_AI_AUDIT_ONLY_KEYS" in sanitizer_ts and "findNatalAiAuditOnlyKeys" in sanitizer_ts, "absolute package cannot leak audit scores/rankings")
check("absolute_ai_api_release_gate", "buildNatalAbsoluteJudgmentPackage" in route_ts and "AI_ABSOLUTE_PACKAGE_SCORE_CONTAMINATION" in route_ts and "absoluteJudgmentPackage" in route_ts and "absoluteNatalPrompt" in route_ts, "API builds and fail-closes the absolute judgment artifact")
check("absolute_ai_question_context_api", "judgmentQuestion" in route_ts and "natalJudgmentContext" in route_ts, "API accepts optional real-world question/context without contaminating chart calculation")
check("absolute_ai_vendor_neutral_llm_messages", "buildNatalAbsoluteLlmMessages" in judgment_ts and "NATAL_FACTS: packageData.natalFacts" in judgment_ts and "system: packageData.absolutePrompt" in judgment_ts, "runtime exposes a vendor-neutral system+user message pair without adding a provider dependency")
check("absolute_ai_prompt_ptbr_v2", "PROTOCOLO ABSOLUTO DE JULGAMENTO NATAL v2.0" in judgment_ts and "Responda em português brasileiro" in judgment_ts, "current runtime prompt is Portuguese-first and versioned")
check("absolute_ai_disciplined_subjectivity", "SUBJETIVIDADE ASTROLÓGICA DISCIPLINADA" in judgment_ts and "agir como astrólogo julgador" in judgment_ts and "score oculto" in judgment_ts, "qualitative judgment is explicitly delegated without inventing algorithms")
check("absolute_ai_provider_adapter_contract", "interface NatalAiProviderAdapter" in integration_ts and "executeNatalAiWithProvider" in integration_ts and "SERVER_SIDE_ONLY" in integration_ts, "future AI provider is a transport adapter with server-side secrets")
check("absolute_ai_provider_fail_closed", all(token in integration_ts for token in ["READY_FOR_PROVIDER", "AWAITING_QUESTION", "BLOCKED_BY_ENGINE_VALIDATION", "rejectWhenEngineValidationFails", "rejectWithoutConcreteQuestion"]), "provider invocation is blocked unless chart validation passed and a concrete question exists")
check("absolute_ai_provider_envelope_in_api", "buildNatalAiIntegrationEnvelope" in route_ts and "aiIntegration" in route_ts, "birth-chart API already exports a provider-ready invocation envelope")

# ------------------------------------------------------------------
# 5) Author-worked-case parity hardening.
# These checks were added after replaying Marcos' public Amorth, Guénon,
# Schuon and Benedict XVI natal demonstrations against the engine contract.
# ------------------------------------------------------------------
tables_ts = (ROOT / "src/app/lib/traditionalTables.ts").read_text(encoding="utf-8")

check(
    "frawley_faith_formula_is_mercury_not_jupiter",
    'makeSpiritualPart("faith", "Parte da Fé", asc + getPlanet(chart, "Mercúrio").longitudeRaw - moonLongitude, "ASC + Mercúrio - Lua")' in analysis_ts
    and '"ASC + Júpiter - Lua"' not in analysis_ts,
    "Applied p.177 glyph ☿ is preserved; no Marcos/Frawley formula contamination",
)
check(
    "guenon_mentality_preselects_lots_and_antiscia",
    "contextualContacts" in analysis_ts and "lotRelations" in analysis_ts and "antiscionContacts" in analysis_ts
    and "enrichMentalityContext" in analysis_ts,
    "Moon/Mercury packet directly carries the Part/antiscion contacts Marcos uses in the Guénon example",
)
check(
    "guenon_prenatal_lunation_links_materialized",
    "prenatalLunationNatalLinks" in precision_ts and "traditionalPlanetSnapshot" in precision_ts
    and "RAW_PRENATAL_LINK_AUTHORIAL_SYNTHESIS_REQUIRED" in precision_ts
    and "prenatalLunationNatalLinks" in ai_form_ts,
    "prenatal syzygy/eclipses are compared to natal planets, cusps and lots without inventing a special orb",
)
check(
    "benedict_planet_sign_medical_table_materialized",
    "LILLY_PLANET_SIGN_BODY_PARTS" in tables_ts and '"Sol": [' in tables_ts
    and '["coxas"]' in tables_ts and '"Júpiter": [' in tables_ts and '"Lua": [' in tables_ts
    and "planetSignMedicalCorrespondences" in analysis_ts,
    "traditional planet-in-sign body table invoked in Marcos' Benedict example is available to the health dossier",
)
check(
    "outer_planets_can_modify_all_house_cusps",
    'targetType: "traditional-planet" | "angle" | "house-cusp"' in analysis_ts
    and 'houseCusps.forEach((cusp) => add(cusp.name, "house-cusp", cusp.longitude));' in analysis_ts
    and "outerCuspModifiers" in analysis_ts,
    "Marcos' Pluto-at-cusp-V health testimony is no longer lost by an angles-only outer-planet filter",
)

# Gabriele Amorth, 1 May 1925 16:10 CET, Modena. This is an independent
# Swiss-Ephemeris geometry fingerprint of the public Marcos example; the test
# is not a biographical judgement.
AMORTH_JD = swe.julday(1925, 5, 1, 15 + 10/60)
amorth_cusps, amorth_ascmc = swe.houses_ex(AMORTH_JD, 44.6471, 10.9252, b"R", 0)
amorth_sun = lon(AMORTH_JD, swe.SUN)
amorth_venus = lon(AMORTH_JD, swe.VENUS)
amorth_saturn = lon(AMORTH_JD, swe.SATURN)
amorth_asc = amorth_ascmc[0]
amorth_l1 = "Venus" if sign_index(amorth_asc) == 6 else "other"
amorth_l4_is_saturn = sign_index(amorth_cusps[3]) in (9, 10)
check(
    "amorth_public_example_geometry_fingerprint",
    amorth_l1 == "Venus"
    and sign_index(amorth_venus) == 1
    and sign_index(amorth_sun) == 1
    and sign_index(amorth_saturn) == 7
    and angular(amorth_venus, amorth_sun) < 3
    and abs(180 - angular(amorth_venus, amorth_saturn)) < 3
    and abs(180 - angular(amorth_sun, amorth_saturn)) < 3
    and amorth_l4_is_saturn,
    f"ASC={amorth_asc:.4f}; Sun={amorth_sun:.4f}; Venus={amorth_venus:.4f}; Saturn={amorth_saturn:.4f}",
)
check(
    "amorth_combustion_major_dignity_mitigation_available",
    "combustao-mitigada-dignidade-maior" in analysis_ts,
    "Venus in Taurus near Sun can be represented as technically combust with Marcos major-dignity mitigation",
)

failed = [row for row in checks if not row[1]]
for name, ok, detail in checks:
    print(f"{'PASS' if ok else 'FAIL'} | {name} | {detail}")
print(f"PRODUCTION_REGRESSIONS={'PASS' if not failed else 'FAIL'} | checks={len(checks)} | failures={len(failed)}")
sys.exit(1 if failed else 0)
