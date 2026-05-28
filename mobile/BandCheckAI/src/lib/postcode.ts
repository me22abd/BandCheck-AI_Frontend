export function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function formatPostcode(compact: string): string {
  const u = normalizePostcode(compact);
  if (!u) return "";
  return u.replace(/(.{3})$/, " $1");
}
