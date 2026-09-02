import type { MundaneGap } from "./mundaneTypes";

export const MUNDANE_GAP_MATRIX: MundaneGap[] = [
  { code:"AUTHOR_MODE_ISOLATION", status:"closed", blocking:false, note:"Author-exclusive techniques are gated rather than silently blended." },
  { code:"FOCUS_PROTOCOL", status:"closed", blocking:false, note:"Focus now defines required layers, houses, significators, terrestrial inputs and reading order." },
  { code:"ELEMENTAL_240_RAW", status:"closed", blocking:false, note:"Consecutive elemental runs are calculated; they are not mislabeled as canonical historical mutations." },
  { code:"REAL_CASE_REGRESSION", status:"closed", blocking:false, note:"Published Frawley Coventry 1940 and Marcos pandemic 2019 teaching chains are tested independently with PySwissEph." },
  { code:"STRUCTURAL_INVARIANTS", status:"closed", blocking:false, note:"Definition-induced eclipse/ingress contacts are marked non-independent so the AI cannot double-count them." },
  { code:"SUPER_CYCLE_960_CANONICAL", status:"source-locked", blocking:false, note:"Approximate doctrinal cycle is retained, but no unsupported historical segmentation algorithm is invented." },
  { code:"EXACT_MUNDANE_DIRECTIONS", status:"source-locked", blocking:false, note:"Baseline directions/progressions may be calculated; exact refinement remains explicitly unclaimed where source is insufficient." },
  { code:"LUNAR_ECLIPSE_LORD_RULE", status:"source-locked", blocking:false, note:"No symmetric rule is invented from the documented solar-eclipse lord procedure." },
  { code:"LOCAL_ECLIPSE_VISIBILITY", status:"partial", blocking:false, note:"Local physical visibility is an engineering astronomical baseline and must remain provenance-labeled." },
  { code:"FULL_BUILD_AND_RELEASE", status:"qa", blocking:true, note:"Must pass TypeScript, source-policy tests, isolation tests, astronomy regressions and full Next build before 100% certification." },
];

export function blockingMundaneGaps(): MundaneGap[] { return MUNDANE_GAP_MATRIX.filter(g => g.blocking); }
