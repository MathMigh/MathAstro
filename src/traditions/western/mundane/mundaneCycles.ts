import type { ElementalConjunction, ElementalRun } from "./mundaneTypes";

const ELEMENTS = ["fire","earth","air","water"] as const;
const SIGN_ELEMENT_INDEX = [0,1,2,3,0,1,2,3,0,1,2,3] as const;

export function elementForSignIndex(signIndex: number): ElementalConjunction["element"] {
  const i = ((Math.trunc(signIndex) % 12) + 12) % 12;
  return ELEMENTS[SIGN_ELEMENT_INDEX[i]];
}

export function normalizeConjunction(input: Omit<ElementalConjunction,"element">): ElementalConjunction {
  return { ...input, element: elementForSignIndex(input.signIndex) };
}

export function buildElementalRuns(conjunctions: ElementalConjunction[]): ElementalRun[] {
  const sorted = [...conjunctions].sort((a,b) => Date.parse(a.utcIso)-Date.parse(b.utcIso));
  const runs: ElementalRun[] = [];
  for (const item of sorted) {
    const last = runs[runs.length-1];
    if (!last || last.element !== item.element) {
      runs.push({ element:item.element, startUtcIso:item.utcIso, endUtcIso:item.utcIso, count:1, conjunctions:[item], canonicalHistoricalMutationClaimed:false });
    } else {
      last.endUtcIso = item.utcIso;
      last.count += 1;
      last.conjunctions.push(item);
    }
  }
  return runs;
}
