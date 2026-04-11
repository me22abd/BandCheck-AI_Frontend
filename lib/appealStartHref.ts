/**
 * Normalizes appeal funnel query fields and builds /appeal/start URLs.
 * Shared by the email step (server + client) so redirect params stay consistent.
 */
export type AppealQueryFields = {
  postcode: string;
  band: string;
  comparables: string;
};

function pickParam(
  v: string | string[] | undefined,
): string {
  const s = typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
  return (s ?? "").trim();
}

export function normalizeAppealSearchFields(
  raw: Record<string, string | string[] | undefined>,
): AppealQueryFields {
  const postcodeRaw = pickParam(raw.postcode);
  const postcode = postcodeRaw.replace(/\s+/g, "").toUpperCase();
  const band = pickParam(raw.band);
  const comparables = pickParam(raw.comparables);
  return { postcode, band, comparables };
}

export function buildAppealStartHref(fields: AppealQueryFields): string {
  const qp = new URLSearchParams();
  if (fields.postcode) qp.set("postcode", fields.postcode);
  if (fields.band) qp.set("band", fields.band);
  if (fields.comparables) qp.set("comparables", fields.comparables);
  const q = qp.toString();
  return q ? `/appeal/start?${q}` : "/appeal/start";
}
