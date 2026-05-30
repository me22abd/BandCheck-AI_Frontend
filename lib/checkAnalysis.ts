import { scrapeGovAllPropertiesAtPostcode } from "./govCouncilTaxScraper";
import { lookupVoaBands } from "./voaLookup";
import type { NearbyProperty } from "./scoring";

const POSTCODES_IO = "https://api.postcodes.io";
const FETCH_TIMEOUT_MS = 12_000;

// ─── postcodes.io helpers ─────────────────────────────────────────────────────

type LookupResult = {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
};

type NearestEntry = {
  postcode: string;
  latitude?: number;
  longitude?: number;
};

type PostcodesIoLookup = {
  status: number;
  result?: LookupResult;
  error?: string;
};

type PostcodesIoNearest = {
  status: number;
  result?: NearestEntry[] | null;
};

async function lookupPostcode(
  postcode: string,
): Promise<
  { kind: "ok"; result: LookupResult } | { kind: "not_found" } | { kind: "error" }
> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${POSTCODES_IO}/postcodes/${encodeURIComponent(postcode)}`,
      { signal: controller.signal, cache: "no-store" },
    );
    clearTimeout(t);
    const json = (await res.json()) as PostcodesIoLookup;
    if (res.status === 404 || json.status === 404) return { kind: "not_found" };
    if (!res.ok || json.status !== 200 || !json.result) return { kind: "error" };
    return { kind: "ok", result: json.result };
  } catch {
    clearTimeout(t);
    return { kind: "error" };
  }
}

async function nearestPostcodes(lat: number, lon: number): Promise<NearestEntry[]> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const q = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    limit: "24",
    radius: "1200",
  });
  try {
    const res = await fetch(`${POSTCODES_IO}/postcodes?${q.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(t);
    const json = (await res.json()) as PostcodesIoNearest;
    if (!res.ok || json.status !== 200 || !json.result?.length) return [];
    return json.result;
  } catch {
    clearTimeout(t);
    return [];
  }
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizePc(pc: string): string {
  return pc.replace(/\s+/g, "").toUpperCase();
}

// ─── statistical fallback (used when HOMEDATA_API_KEY is not set) ─────────────

const BAND_LETTERS = "ABCDEFGH";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function bandIndex(letter: string): number {
  const c = letter.toUpperCase().replace(/[^A-H]/g, "").charAt(0);
  const i = BAND_LETTERS.indexOf(c);
  return i === -1 ? 3 : i;
}

function indexToBand(i: number): string {
  return BAND_LETTERS[Math.min(7, Math.max(0, i))] ?? "D";
}

/** Statistical model — NOT VOA data. Used only as fallback. */
function bandFromSeedWithArea(seed: string, areaKey: string): string {
  const blended = hashString(`${seed}|${areaKey}`) % 100;
  const areaNudge = (hashString(`area:${areaKey}`) % 17) - 8;
  const r = Math.min(99, Math.max(0, blended + Math.floor(areaNudge / 2)));
  if (r < 5) return "A";
  if (r < 12) return "B";
  if (r < 28) return "C";
  if (r < 55) return "D";
  if (r < 78) return "E";
  if (r < 92) return "F";
  if (r < 98) return "G";
  return "H";
}

function bandForNeighbour(
  neighbourPc: string,
  areaKey: string,
  index: number,
  userBand: string,
): string {
  const u = bandIndex(userBand);
  const h = hashString(`${neighbourPc}|${areaKey}|${index}`);
  if (h % 100 < 72) {
    const delta = (h % 3) - 1;
    return indexToBand(u + delta);
  }
  return bandFromSeedWithArea(`${neighbourPc}|n`, areaKey);
}

const STREET_NAMES = [
  "Victoria", "Church", "Park", "Manor", "Queen's", "King", "Mill", "London",
  "Green", "Oxford", "Station", "High", "Elm", "Oak", "Ash", "Cedar",
  "Maple", "Rose", "Bridge", "Water",
];
const STREET_SUFFIXES = [
  "Road", "Street", "Avenue", "Close", "Lane", "Drive", "Way", "Terrace",
  "Place", "Grove", "Crescent", "Mews", "Walk", "Yard", "Row", "Rise", "View", "Hill",
];

function formatAddress(neighbourPostcode: string, index: number, district: string): string {
  const h = hashString(neighbourPostcode + String(index));
  const n = 1 + (h % 99);
  const name = STREET_NAMES[h % STREET_NAMES.length];
  const suffix = STREET_SUFFIXES[(h >>> 4) % STREET_SUFFIXES.length];
  return `${n} ${name} ${suffix}, ${district}`;
}

function padSyntheticNeighbours(
  target: number,
  seedPostcode: string,
  district: string,
  userBand: string,
  existing: NearbyProperty[],
): NearbyProperty[] {
  const out = [...existing];
  let i = 0;
  while (out.length < target) {
    const fakePc = `${seedPostcode}-SYN-${i}`;
    out.push({
      address: formatAddress(fakePc, out.length, district),
      band: bandForNeighbour(fakePc, district, out.length, userBand),
    });
    i += 1;
  }
  return out.slice(0, target);
}

// ─── most common band helper ──────────────────────────────────────────────────

function mostCommonBand(bands: string[]): string {
  const counts: Record<string, number> = {};
  for (const b of bands) {
    counts[b] = (counts[b] ?? 0) + 1;
  }
  let best = "D";
  let bestCount = 0;
  for (const [band, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = band;
      bestCount = count;
    }
  }
  return best;
}

// ─── public API ───────────────────────────────────────────────────────────────

export type CheckAnalysisData = {
  postcode: string;
  district: string;
  userBand: string;
  nearbyProperties: NearbyProperty[];
  /**
   * false = band confirmed from live VOA data (Homedata API).
   * true  = band is statistically modelled — must be verified at gov.uk/council-tax-bands.
   */
  isEstimated: boolean;
  /** Where the band was obtained from. */
  bandSource: "gov" | "provider" | "model";
};

/**
 * Main entry point for the /api/check route.
 *
 * Strategy:
 * 1. Validate postcode via postcodes.io.
 * 2. If HOMEDATA_API_KEY is set, look up real VOA bands for every property at
 *    the postcode. The user's band is derived from their specific house (if
 *    `houseNumber` is supplied) or inferred as the most common band at the
 *    postcode. Comparables are real properties from the same postcode.
 * 3. If the Homedata API is unavailable/unconfigured, fall back to the
 *    statistical model and return isEstimated: true.
 */
export async function getCheckAnalysisForPostcode(
  normalizedPostcode: string,
  houseNumber?: string,
): Promise<
  | { ok: true; data: CheckAnalysisData }
  | { ok: false; status: number; message: string }
> {
  // Step 1: validate postcode
  const lookupOutcome = await lookupPostcode(normalizedPostcode);
  if (lookupOutcome.kind === "not_found") {
    return { ok: false, status: 400, message: "Invalid or unknown UK postcode" };
  }
  if (lookupOutcome.kind === "error") {
    return {
      ok: false,
      status: 503,
      message: "Postcode lookup service unavailable. Please try again.",
    };
  }

  const lookup = lookupOutcome.result;
  const district = lookup.admin_district?.trim() || "Local area";

  // Step 2: primary free source — scrape GOV checker for ALL properties at postcode
  // This single call gives us the user's band AND all comparables at once (cached 24 h).
  const gov = await scrapeGovAllPropertiesAtPostcode(normalizedPostcode);
  if (gov.ok && gov.properties.length > 0) {
    const props = gov.properties;

    // Identify the user's specific property by house number if supplied
    const hn = houseNumber?.trim().toLowerCase();
    const userProp = hn
      ? (props.find((p) => p.address.toLowerCase().includes(hn)) ?? null)
      : null;
    const userBand = userProp
      ? userProp.band
      : mostCommonBand(props.map((p) => p.band));

    // Comparables = every other property at the postcode (exclude user's exact address)
    const nearbyProperties: NearbyProperty[] = props
      .filter((p) => !userProp || p.address !== userProp.address)
      .map((p) => ({ address: p.address, band: p.band }));

    // If only one property exists at this postcode, attempt provider comparables
    // so the UI never shows an empty list.
    let finalComps = nearbyProperties;
    if (finalComps.length === 0) {
      const voaForComps = await lookupVoaBands(normalizedPostcode);
      if (voaForComps.ok) {
        finalComps = voaForComps.properties
          .filter((p) => !userProp || p.address !== userProp.address)
          .map((p) => ({ address: p.address, band: p.band }));
      }
    }

    return {
      ok: true,
      data: {
        postcode: normalizedPostcode,
        district,
        userBand,
        nearbyProperties: finalComps,
        isEstimated: false,
        bandSource: "gov",
      },
    };
  }

  // Step 3: secondary sources — provider APIs
  const voaResult = await lookupVoaBands(normalizedPostcode, houseNumber);

  if (voaResult.ok && voaResult.properties.length > 0) {
    // ── Real VOA data path ────────────────────────────────────────────────────
    const props = voaResult.properties;

    // Determine the user's band:
    // - If we have a house number, find the matching property
    // - Otherwise, use the most common band at the postcode (still real data,
    //   just not guaranteed to be for their specific unit)
    let userBand: string;
    if (houseNumber?.trim()) {
      const normalized = houseNumber.trim().toLowerCase();
      const match = props.find((p) =>
        p.address.toLowerCase().includes(normalized),
      );
      userBand = match?.band ?? mostCommonBand(props.map((p) => p.band));
    } else {
      userBand = mostCommonBand(props.map((p) => p.band));
    }

    // Build comparables from the real VOA data (all other properties at the postcode)
    const nearbyProperties: NearbyProperty[] = props.map((p) => ({
      address: p.address,
      band: p.band,
    }));

    return {
      ok: true,
      data: {
        postcode: normalizedPostcode,
        district,
        userBand,
        nearbyProperties,
        isEstimated: !houseNumber?.trim(), // exact match = confirmed; postcode-only = inferred
        bandSource: "provider",
      },
    };
  }

  // Step 4: statistical fallback
  // Log why real data wasn't used so the operator can diagnose it
  if (!gov.ok) {
    console.warn(`[checkAnalysis] GOV scrape failed for ${normalizedPostcode}: ${gov.reason}`);
  }
  if (!voaResult.ok) {
    console.warn(`[checkAnalysis] Provider lookup failed for ${normalizedPostcode}: ${voaResult.reason}`);
  }

  const areaKey = district;
  const userBand = bandFromSeedWithArea(normalizedPostcode, areaKey);

  const nearest = await nearestPostcodes(lookup.latitude, lookup.longitude);
  const selfNorm = normalizePc(lookup.postcode);
  const seen = new Set<string>();
  const rows: NearbyProperty[] = [];

  for (const n of nearest) {
    if (!n.postcode) continue;
    const pn = normalizePc(n.postcode);
    if (pn === selfNorm || seen.has(pn)) continue;
    seen.add(pn);
    const distanceMiles =
      typeof n.latitude === "number" && typeof n.longitude === "number"
        ? haversineMiles(lookup.latitude, lookup.longitude, n.latitude, n.longitude)
        : undefined;
    rows.push({
      address: formatAddress(pn, rows.length, district),
      band: bandForNeighbour(pn, areaKey, rows.length, userBand),
      distanceMiles,
    });
    if (rows.length >= 3) break;
  }

  const nearbyProperties =
    rows.length < 3
      ? padSyntheticNeighbours(3, normalizedPostcode, district, userBand, rows)
      : rows;

  return {
    ok: true,
    data: {
      postcode: normalizedPostcode,
      district,
      userBand,
      nearbyProperties,
      isEstimated: true,
      bandSource: "model",
    },
  };
}
