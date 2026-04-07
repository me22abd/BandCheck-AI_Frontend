import type { NearbyProperty } from "./scoring";

const POSTCODES_IO = "https://api.postcodes.io";
const FETCH_TIMEOUT_MS = 12_000;
const NEARBY_COUNT = 3;
const NEAREST_LIMIT = 24;
const NEAREST_RADIUS_M = 1200;

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

/**
 * UK-weighted band (median around D), blended with area so nearby postcodes cluster.
 * Modelled — not VOA data.
 */
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

/** Neighbour bands cluster near the user’s band (same street/area realism). */
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
  "Victoria",
  "Church",
  "Park",
  "Manor",
  "Queen's",
  "King",
  "Mill",
  "London",
  "Green",
  "Oxford",
  "Station",
  "High",
  "Elm",
  "Oak",
  "Ash",
  "Cedar",
  "Maple",
  "Rose",
  "Bridge",
  "Water",
];

const STREET_SUFFIXES = [
  "Road",
  "Street",
  "Avenue",
  "Close",
  "Lane",
  "Drive",
  "Way",
  "Terrace",
  "Place",
  "Grove",
  "Crescent",
  "Mews",
  "Walk",
  "Yard",
  "Row",
  "Rise",
  "View",
  "Hill",
];

function normalizePc(pc: string): string {
  return pc.replace(/\s+/g, "").toUpperCase();
}

function formatAddress(
  neighbourPostcode: string,
  index: number,
  district: string,
): string {
  const h = hashString(neighbourPostcode + String(index));
  const n = 1 + (h % 99);
  const name = STREET_NAMES[h % STREET_NAMES.length];
  const suffix = STREET_SUFFIXES[(h >>> 4) % STREET_SUFFIXES.length];
  return `${n} ${name} ${suffix}, ${district}`;
}

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
      {
        signal: controller.signal,
        cache: "no-store",
      },
    );
    clearTimeout(t);
    const json = (await res.json()) as PostcodesIoLookup;
    if (res.status === 404 || json.status === 404) {
      return { kind: "not_found" };
    }
    if (!res.ok || json.status !== 200 || !json.result) {
      return { kind: "error" };
    }
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
    limit: String(NEAREST_LIMIT),
    radius: String(NEAREST_RADIUS_M),
  });
  try {
    const res = await fetch(`${POSTCODES_IO}/postcodes?${q.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(t);
    const json = (await res.json()) as PostcodesIoNearest;
    if (!res.ok || json.status !== 200 || !json.result?.length) {
      return [];
    }
    return json.result;
  } catch {
    clearTimeout(t);
    return [];
  }
}

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

export type CheckAnalysisData = {
  postcode: string;
  userBand: string;
  nearbyProperties: NearbyProperty[];
};

/**
 * Validates postcode via postcodes.io (lat/lng), finds nearest postcodes,
 * and builds plausible addresses + modelled council tax bands (not VOA).
 */
export async function getCheckAnalysisForPostcode(
  normalizedPostcode: string,
): Promise<
  | { ok: true; data: CheckAnalysisData }
  | { ok: false; status: number; message: string }
> {
  const lookupOutcome = await lookupPostcode(normalizedPostcode);
  if (lookupOutcome.kind === "not_found") {
    return {
      ok: false,
      status: 400,
      message: "Invalid or unknown UK postcode",
    };
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
      typeof n.latitude === "number" &&
      typeof n.longitude === "number" &&
      typeof lookup.latitude === "number" &&
      typeof lookup.longitude === "number"
        ? haversineMiles(lookup.latitude, lookup.longitude, n.latitude, n.longitude)
        : undefined;
    rows.push({
      address: formatAddress(pn, rows.length, district),
      band: bandForNeighbour(pn, areaKey, rows.length, userBand),
      distanceMiles,
    });
    if (rows.length >= NEARBY_COUNT) break;
  }

  const nearbyProperties =
    rows.length < NEARBY_COUNT
      ? padSyntheticNeighbours(
          NEARBY_COUNT,
          normalizedPostcode,
          district,
          userBand,
          rows,
        )
      : rows;

  return {
    ok: true,
    data: {
      postcode: normalizedPostcode,
      userBand,
      nearbyProperties,
    },
  };
}
