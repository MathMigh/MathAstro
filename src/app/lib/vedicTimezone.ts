export function resolveVedicTimezone(coordinates: { longitude: number; timezone?: string }): string {
  if (coordinates.timezone) return coordinates.timezone;
  const offset = Math.max(-12, Math.min(14, Math.round(Number(coordinates.longitude) / 15)));
  if (offset === 0) return "Etc/GMT";
  return offset > 0 ? `Etc/GMT-${offset}` : `Etc/GMT+${Math.abs(offset)}`;
}
