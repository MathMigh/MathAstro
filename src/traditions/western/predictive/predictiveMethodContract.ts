export type PredictiveAuthor = "MARCOS_BOOK" | "MARCOS_RECENT" | "FRAWLEY" | "GUGU" | "TRADITIONAL";

export type PredictiveTechniqueId =
  | "radical_gate"
  | "secondary_progressions"
  | "primary_directions"
  | "annual_profections"
  | "solar_return"
  | "lunar_return"
  | "derived_lunar_return"
  | "temporal_fixed_stars"
  | "transits"
  | "convergence"
  | "gugu_planetary_periods"
  | "ai_judgment_layer"
  | "firdaria";

export type PredictiveRecoveryState =
  | "CANONICAL_NEW_ENGINE"
  | "CANONICAL_WITH_OPERATIONAL_GATE"
  | "CANONICAL_PARTIAL_SOURCE_LOCK"
  | "TRADITIONAL_STANDARD_MECHANICS"
  | "LEGACY_UNTRUSTED"
  | "SOURCE_LOCK_REQUIRED"
  | "DEFERRED_BY_PROFILE"
  | "UNSUPPORTED";

export interface PredictiveTechniqueContract {
  id: PredictiveTechniqueId;
  state: PredictiveRecoveryState;
  authors: PredictiveAuthor[];
  sourceIds: string[];
  notes: string[];
  blockedReason?: string;
}

export const PREDICTIVE_RECOVERY_CONTRACT: PredictiveTechniqueContract[] = [
  {
    id: "radical_gate",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["MARCOS_BOOK", "MARCOS_RECENT", "FRAWLEY", "GUGU"],
    sourceIds: ["MARCOS_BOOK_CH22_SECONDARY", "MARCOS_2024_PREDICTIVE_HIERARCHY", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
    notes: ["Predictive techniques unfold/activate natal possibilities; Natal is upstream and read-only.", "The canonical engine refuses to release a PASS if Natal upstream validation is not released for AI."],
  },
  {
    id: "secondary_progressions",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["MARCOS_BOOK", "MARCOS_RECENT", "FRAWLEY"],
    sourceIds: ["MARCOS_BOOK_CH22_SECONDARY", "MARCOS_2026_PROGRESSIONS_CONJ_OPP", "MARCOS_YOUTUBE_EN_PREDICTION_MODULE", "MARCOS_PROGRESSIONS_ANGLE_USAGE_EXAMPLES",
        "FRAWLEY_NAIBOD_RA_SECONDARY_ATTESTATION", "MARCOS_FORTUNE_TEMPORAL_CURRENT", "FRAWLEY_FIVE_PRIMARY_DIRECTORS", "FRAWLEY_ORWELL_RELATIONAL_EVIDENCE"],
    notes: ["Exact decimal age mapped by day-for-year.", "Canonical Marcos-current aspect policy: conjunction/opposition only.", "Frawley source-locks the five main directors and target classes; combined modes use Marcos's aspect restriction as an explicit fallback, not as a claim about Frawley.", "Marcos examples source-lock progressed ASC/MC usage and an approximate ~1°/year scale; two independent Frawley-school secondary attestations identify Naibod in RA / Mean Solar Arc in RA, matching the operational setting. A primary direct author quotation naming the setting remains unlocated.", "Snapshot exists only as a calculation surface; report materializes individual contacts."],
  },
  {
    id: "primary_directions",
    state: "DEFERRED_BY_PROFILE",
    authors: ["MARCOS_BOOK", "FRAWLEY"],
    sourceIds: ["MARCOS_YOUTUBE_EN_PREDICTION_MODULE"],
    notes: ["Valid separate technique, not silently mixed into the secondary-progression profile.", "Marcos explicitly says he uses secondary progressions instead because they are easier to calculate and easier to trust in software; this is a practice/profile choice, not a claim that primary directions are invalid."],
  },
  {
    id: "annual_profections",
    state: "TRADITIONAL_STANDARD_MECHANICS",
    authors: ["MARCOS_RECENT", "FRAWLEY", "TRADITIONAL"],
    sourceIds: ["MARCOS_RECENT_PROFECTION_CAUTION", "TRADITIONAL_ANNUAL_PROFECTION_STANDARD", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
    notes: ["One sign/house per completed year.", "Natal planets are NEVER rotated.", "Lord of year is contextual and does not automatically dominate the judgment."],
  },
  {
    id: "solar_return",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["MARCOS_BOOK", "MARCOS_RECENT", "FRAWLEY"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "MARCOS_BOOK_SOLAR_RETURN_BIRTHPLACE", "MARCOS_FORTUNE_TEMPORAL_CURRENT", "FRAWLEY_CURRENT_NATAL_PREDICTION", "FRAWLEY_ORWELL_RELATIONAL_EVIDENCE"],
    notes: ["Solves the previous exact return of the Sun to natal longitude.", "Marcos source-locks birthplace as the return location; combined modes may use this explicitly where Frawley's recovered corpus is silent, without attributing the rule to Frawley.", "Materializes return↔radix relations, house rulers, antiscia and dignity changes."],
  },
  {
    id: "lunar_return",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["MARCOS_BOOK", "MARCOS_RECENT", "FRAWLEY"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
    notes: ["Solves the previous exact return of the Moon to natal longitude.", "Subordinate to radix/progressions/Solar."],
  },
  {
    id: "derived_lunar_return",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["MARCOS_RECENT", "FRAWLEY"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "FRAWLEY_CURRENT_NATAL_PREDICTION"],
    notes: ["Uses the Moon longitude at the governing Solar Return as the lunar return base, matching the recovered MathAstro DLR workflow.", "Refines/shortens the period; judged under the Lunar/Solar hierarchy."],
  },
  {
    id: "temporal_fixed_stars",
    state: "CANONICAL_WITH_OPERATIONAL_GATE",
    authors: ["MARCOS_RECENT"],
    sourceIds: ["MARCOS_FIXED_STARS_TEMPORAL_COURSE"],
    notes: [
      "Fixed-star longitudes are recalculated for each predictive epoch rather than reusing natal-epoch longitudes.",
      "Marcos same-sign and documented fixed-star conjunction gates are materialized as candidate evidence; Frawley receives astronomy without an invented universal star-orb rule when the corpus does not source-lock it.",
      "Fixed stars never create a prediction by themselves; they qualify an already relevant predictive layer.",
    ],
  },
  {
    id: "transits",
    state: "CANONICAL_WITH_OPERATIONAL_GATE",
    authors: ["MARCOS_RECENT", "FRAWLEY", "GUGU"],
    sourceIds: ["MARCOS_2026_TRANSIT_TRIGGER", "FRAWLEY_CURRENT_NATAL_PREDICTION", "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION"],
    notes: ["Transits are markers/triggers, not autonomous causes.", "A transit can be eligible only when the same radix target has higher-scale support.", "The 1° screening gate is explicitly engine-operational, never represented as an authorial universal orb."],
  },
  {
    id: "convergence",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["MARCOS_RECENT", "FRAWLEY"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "MARCOS_2026_TRANSIT_TRIGGER", "FRAWLEY_ORWELL_RELATIONAL_EVIDENCE"],
    notes: ["Convergence is materialized as named evidence layers per radix target.", "No aggregate astrological score is computed."],
  },
  {
    id: "gugu_planetary_periods",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["GUGU"],
    sourceIds: ["GUGU_COSMOLOGY04_PERIOD_VALUES", "GUGU_COSMOLOGY04_ZODIAC_SEQUENCE", "GUGU_COSMOLOGY04_SUBDIVISIONS", "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION"],
    notes: [
      "Major periods are source-locked: start from the Ascendant sign, proceed zodiacally, use 360-day years and planetary values 25/19/20/8/15/12/30.",
      "Month/day/hour subdivisions continue through the zodiacal sequence while the parent period remains active; cycle index is materialized and second-cycle behavior is regression-tested.",
      "Receiver of authority is exposed as the higher-priority lord; natal conditions are materialized, but no numerical benefic/malefic score is fabricated.",
    ],
  },
  {
    id: "ai_judgment_layer",
    state: "CANONICAL_NEW_ENGINE",
    authors: ["MARCOS_BOOK", "MARCOS_RECENT", "FRAWLEY", "GUGU"],
    sourceIds: ["MARCOS_2024_PREDICTIVE_HIERARCHY", "MARCOS_2026_TRANSIT_TRIGGER", "FRAWLEY_CURRENT_NATAL_PREDICTION", "GUGU_COSMOLOGY04_TRANSIT_SUBORDINATION"],
    notes: [
      "Subjective work is typed as judgment tasks: semantic routing, qualitative weighting, manifestation choice, event-vs-subjective distinction and author-conflict synthesis.",
      "The AI is prohibited from recalculating astrology, inventing source gaps, aggregate scoring or blending authors without provenance.",
      "Provider-neutral bot payload exposes the absolute PT-BR prompt, allowed evidence paths, expected JSON output and the canonical mechanical dossier.",
    ],
  },
  {
    id: "firdaria",
    state: "DEFERRED_BY_PROFILE",
    authors: ["MARCOS_RECENT"],
    sourceIds: [],
    notes: ["Not privileged by Marcos in current practice; remains optional/deferred."],
  },
];
