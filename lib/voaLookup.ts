/**
 * VOA council tax band lookup — multi-provider with automatic fallback chain:
 *
 *  1. Homedata API (HOMEDATA_API_KEY)
 *     https://homedata.co.uk — free tier, 100 req/month
 *     ⚠ Council Tax Band endpoint is "Coming Soon" — select it in their
 *       dashboard now and it will activate automatically on launch.
 *
 *  2. PropertyData API (PROPERTYDATA_API_KEY)
 *     https://propertydata.co.uk — paid, council tax endpoint is LIVE today.
 *     Use this as a bridge until Homedata's endpoint activates.
 *
 * If neither key is set, or both fail, callers fall back to the statistical
 * model in checkAnalysis.ts with isEstimated: true.
 */

const FETCH_TIMEOUT_MS = 8_000;

export type VoaProperty = {
  uprn?: string;
  address: string;
  band: string; // single letter A–H
};

export type VoaLookupResult =
  | { ok: true; properties: VoaProperty[]; source: "homedata" | "propertydata" }
  | { ok: false; reason: string };

// ─── public entry point ───────────────────────────────────────────────────────

export async function lookupVoaBands(
  postcode: string,
  houseNumber?: string,
): Promise<VoaLookupResult> {
  // Try Homedata first (free, activates automatically when their CT endpoint launches)
  const homedataKey = process.env.HOMEDATA_API_KEY?.trim();
  if (homedataKey) {
    const result = await homedataLookup(postcode, houseNumber, homedataKey);
    if (result.ok) return result;
    console.warn(`[voa] Homedata lookup failed (${result.reason}) — trying PropertyData`);
  }

  // Try PropertyData as bridge (live today, paid)
  const propertydataKey = process.env.PROPERTYDATA_API_KEY?.trim();
  if (propertydataKey) {
    const result = await propertydataLookup(postcode, propertydataKey);
    if (result.ok) return result;
    console.warn(`[voa] PropertyData lookup failed (${result.reason})`);
  }

  return { ok: false, reason: "No VOA data provider configured or available" };
}

// ─── Homedata ─────────────────────────────────────────────────────────────────

async function homedataLookup(
  postcode: string,
  houseNumber: string | undefined,
  apiKey: string,
): Promise<VoaLookupResult> {
  const params = new URLSearchParams({ postcode });
  if (houseNumber?.trim()) params.set("building_number", houseNumber.trim());

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://api.homedata.co.uk/api/council_tax_band/?${params.toString()}`,
      {
        signal: controller.signal,
        headers: { Authorization: `Api-Key ${apiKey}`, Accept: "application/json" },
        cache: "no-store",
      },
    );
    clearTimeout(t);

    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: "Homedata auth failed — check HOMEDATA_API_KEY" };
    }
    if (res.status === 404) return { ok: false, reason: "Homedata: no properties found" };
    if (res.status === 404 || res.status === 501 || res.status === 503) {
      return { ok: false, reason: `Homedata: endpoint not yet live (HTTP ${res.status})` };
    }
    if (!res.ok) return { ok: false, reason: `Homedata: HTTP ${res.status}` };

    const json = (await res.json()) as unknown;
    const properties = normaliseResponse(json);
    if (properties.length === 0) return { ok: false, reason: "Homedata: empty response" };

    return { ok: true, properties, source: "homedata" };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, reason: `Homedata: ${e instanceof Error ? e.message : "request failed"}` };
  }
}

// ─── PropertyData ─────────────────────────────────────────────────────────────

type PropertyDataResponse = {
  status: string;
  message?: string;
  data?: {
    known_bands?: Array<{
      address: string;
      band: string;
      uprn?: string;
    }>;
  };
};

async function propertydataLookup(
  postcode: string,
  apiKey: string,
): Promise<VoaLookupResult> {
  const params = new URLSearchParams({ key: apiKey, postcode });
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://api.propertydata.co.uk/council-tax?${params.toString()}`,
      { signal: controller.signal, cache: "no-store" },
    );
    clearTimeout(t);

    if (!res.ok) return { ok: false, reason: `PropertyData: HTTP ${res.status}` };

    const json = (await res.json()) as PropertyDataResponse;
    if (json.status !== "success") {
      return { ok: false, reason: `PropertyData: ${json.message ?? "error"}` };
    }

    const rawBands = json.data?.known_bands ?? [];
    const properties: VoaProperty[] = rawBands.flatMap((p) => {
      const band = (p.band ?? "").toUpperCase().replace(/[^A-H]/g, "").charAt(0);
      if (!band || !p.address) return [];
      return [{ address: p.address, band, uprn: p.uprn }];
    });

    if (properties.length === 0) {
      return { ok: false, reason: "PropertyData: no known bands for this postcode" };
    }

    return { ok: true, properties, source: "propertydata" };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, reason: `PropertyData: ${e instanceof Error ? e.message : "request failed"}` };
  }
}

// ─── response normalisation (Homedata formats) ────────────────────────────────

function normaliseResponse(json: unknown): VoaProperty[] {
  if (Array.isArray(json)) return json.flatMap(parseOne);
  if (typeof json === "object" && json !== null) {
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj.properties)) return obj.properties.flatMap(parseOne);
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
  const address = typeof p.address === "string" ? p.address.trim() : "";
  if (!band || !address) return [];
  return [{ uprn: typeof p.uprn === "string" ? p.uprn : undefined, address, band }];
}
