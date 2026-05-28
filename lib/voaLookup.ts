/**
 * VOA council tax band lookup via Homedata API.
 *
 * Sign up free at https://homedata.co.uk — 100 requests/month, no credit card.
 * Set HOMEDATA_API_KEY in your environment variables (Vercel dashboard).
 *
 * If the API key is absent or the request fails, callers should fall back to
 * the statistical model in checkAnalysis.ts and surface isEstimated: true.
 */

const HOMEDATA_BASE = "https://api.homedata.co.uk/api/council_tax_band/";
const FETCH_TIMEOUT_MS = 8_000;

export type VoaProperty = {
  uprn?: string;
  address: string;
  band: string; // single letter A–H
};

export type VoaLookupResult =
  | { ok: true; properties: VoaProperty[] }
  | { ok: false; reason: string };

/**
 * Look up real council tax bands from the Homedata API.
 *
 * - `houseNumber` is optional. When supplied the API returns the single
 *   matching property. When omitted it returns ALL properties at the postcode
 *   (15–50 typically) — ideal for comparables.
 * - Returns `ok: false` when the API key is missing, the request fails, or
 *   no properties are found.
 */
export async function lookupVoaBands(
  postcode: string,
  houseNumber?: string,
): Promise<VoaLookupResult> {
  const apiKey = process.env.HOMEDATA_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "HOMEDATA_API_KEY not configured" };
  }

  const params = new URLSearchParams({ postcode });
  if (houseNumber?.trim()) {
    params.set("building_number", houseNumber.trim());
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${HOMEDATA_BASE}?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    clearTimeout(t);

    if (res.status === 401 || res.status === 403) {
      console.error("[voa] Homedata API auth error — check HOMEDATA_API_KEY");
      return { ok: false, reason: "API authentication failed" };
    }
    if (res.status === 404) {
      return { ok: false, reason: "No properties found at this postcode" };
    }
    if (!res.ok) {
      return { ok: false, reason: `API returned HTTP ${res.status}` };
    }

    const json = (await res.json()) as unknown;
    const properties = normaliseResponse(json);

    if (properties.length === 0) {
      return { ok: false, reason: "No properties found" };
    }

    return { ok: true, properties };
  } catch (e) {
    clearTimeout(t);
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[voa] Homedata API fetch error:", msg);
    return { ok: false, reason: "API request failed" };
  }
}

// ─── response normalisation ───────────────────────────────────────────────────

/**
 * Homedata may return a single object, an array, or a wrapped { properties: [...] }.
 * Normalise all formats to a flat VoaProperty array.
 */
function normaliseResponse(json: unknown): VoaProperty[] {
  if (Array.isArray(json)) {
    return json.flatMap(parseOne);
  }
  if (typeof json === "object" && json !== null) {
    const obj = json as Record<string, unknown>;
    // Wrapped array: { properties: [...] }
    if (Array.isArray(obj.properties)) {
      return obj.properties.flatMap(parseOne);
    }
    // Single property object
    return parseOne(obj);
  }
  return [];
}

function parseOne(raw: unknown): VoaProperty[] {
  if (typeof raw !== "object" || raw === null) return [];
  const p = raw as Record<string, unknown>;

  const band =
    typeof p.council_tax_band === "string"
      ? p.council_tax_band.toUpperCase().replace(/[^A-H]/g, "").charAt(0)
      : "";
  const address =
    typeof p.address === "string" ? p.address.trim() : "";

  if (!band || !address) return [];

  return [
    {
      uprn: typeof p.uprn === "string" ? p.uprn : undefined,
      address,
      band,
    },
  ];
}
