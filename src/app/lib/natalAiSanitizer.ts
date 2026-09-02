/**
 * Shared sanitizer for every artifact released to an interpretive LLM.
 * Historical numeric ledgers remain available in audit outputs, never in AI inputs.
 */
export const NATAL_AI_AUDIT_ONLY_KEYS = new Set([
  "score",
  "scores",
  "marcosScore",
  "frawleyScore",
  "essentialScore",
  "accidentalScore",
  "totalScore",
  "houseScore",
  "easyAspects",
  "hardAspects",
  "points",
  "strength",
  "rank",
  "ranking",
  "mixture",
  "totals",
  "hotDelta",
  "dryDelta",
  "compatibilityOnly",
  "contributions",
]);

export function sanitizeNatalAiValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeNatalAiValue);
  if (!value || typeof value !== "object") return value;

  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (NATAL_AI_AUDIT_ONLY_KEYS.has(key) || /(?:^|_)(?:score|ranking|rank|points)$/i.test(key)) continue;
    result[key] = sanitizeNatalAiValue(child);
  }
  return result;
}

export function findNatalAiAuditOnlyKeys(value: unknown): string[] {
  const found = new Set<string>();
  const visit = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((child, index) => visit(child, `${path}[${index}]`));
      return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
      if (NATAL_AI_AUDIT_ONLY_KEYS.has(key) || /(?:^|_)(?:score|ranking|rank|points)$/i.test(key)) {
        found.add(path ? `${path}.${key}` : key);
      }
      visit(child, path ? `${path}.${key}` : key);
    }
  };
  visit(value, "");
  return [...found].sort();
}
