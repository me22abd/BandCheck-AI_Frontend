import * as cheerio from "cheerio";

type CachedBand = {
  band: string;
  address: string;
  fetchedAtMs: number;
};

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, CachedBand>();

function cacheKey(postcode: string, houseNumber?: string): string {
  return `${postcode.toUpperCase().replace(/\s+/g, "")}|${(houseNumber ?? "").trim().toLowerCase()}`;
}

function getCached(postcode: string, houseNumber?: string): CachedBand | null {
  const k = cacheKey(postcode, houseNumber);
  const v = cache.get(k);
  if (!v) return null;
  if (Date.now() - v.fetchedAtMs > TTL_MS) {
    cache.delete(k);
    return null;
  }
  return v;
}

function setCached(postcode: string, houseNumber: string | undefined, band: string, address: string) {
  cache.set(cacheKey(postcode, houseNumber), { band, address, fetchedAtMs: Date.now() });
}

type CookieJar = Record<string, string>;

function parseSetCookieHeaders(setCookie: string[]): CookieJar {
  const jar: CookieJar = {};
  for (const line of setCookie) {
    const first = line.split(";")[0];
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    if (name) jar[name] = value;
  }
  return jar;
}

function mergeCookies(a: CookieJar, b: CookieJar): CookieJar {
  return { ...a, ...b };
}

function cookieHeader(jar: CookieJar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function fetchHtml(
  url: string,
  init: RequestInit & { cookieJar?: CookieJar } = {},
): Promise<{ url: string; html: string; jar: CookieJar; status: number }> {
  const jarIn = init.cookieJar ?? {};
  const headers = new Headers(init.headers ?? {});
  if (Object.keys(jarIn).length) {
    headers.set("cookie", cookieHeader(jarIn));
  }
  headers.set("user-agent", "Mozilla/5.0 (BandCheckAI server scraper)");
  headers.set("accept", "text/html,application/xhtml+xml");
  headers.set("accept-language", "en-GB,en;q=0.9");

  const res = await fetch(url, { ...init, headers, redirect: "follow" });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const jarOut = mergeCookies(jarIn, parseSetCookieHeaders(setCookie));
  const html = await res.text();
  return { url: res.url, html, jar: jarOut, status: res.status };
}

function extractBandFromText(text: string): string | null {
  // Typical outputs include "Council Tax band B" or "Band B"
  const m =
    text.match(/council\s*tax\s*band\s*([A-I])\b/i) ??
    text.match(/\bband\s*([A-I])\b/i);
  const band = m?.[1]?.toUpperCase() ?? "";
  return band && /^[A-I]$/.test(band) ? band : null;
}

function pickAddressCandidate(html: string): string | null {
  const $ = cheerio.load(html);
  const h1 = $("h1").first().text().trim();
  if (h1 && h1.length > 5) return h1;
  const title = $("title").first().text().trim();
  return title || null;
}

/**
 * Scrape GOV council tax band checker (tax.service.gov.uk) to retrieve a real band.
 *
 * IMPORTANT:
 * - This is not an official API. It may break or be blocked at any time.
 * - Cache is in-memory only (per server instance) unless you add a real DB/KV.
 */
export async function scrapeGovCouncilTaxBand(
  postcode: string,
  houseNumber?: string,
): Promise<{ ok: true; band: string; address: string; cached: boolean } | { ok: false; reason: string }> {
  const cached = getCached(postcode, houseNumber);
  if (cached) {
    return { ok: true, band: cached.band, address: cached.address, cached: true };
  }

  // Start page: often redirects to a session-specific journey
  const start = await fetchHtml("https://www.tax.service.gov.uk/check-your-council-tax-band/search");
  if (start.status >= 400) {
    return { ok: false, reason: `GOV checker start failed (HTTP ${start.status})` };
  }

  const $start = cheerio.load(start.html);
  const form = $start("form").first();
  const actionRaw = form.attr("action") || "/check-your-council-tax-band/search";
  const action = actionRaw.startsWith("http")
    ? actionRaw
    : new URL(actionRaw, start.url).toString();

  // Try common CSRF hidden input names. If absent, submit anyway.
  const csrf =
    $start("input[name=csrfToken]").attr("value") ??
    $start("input[name=_csrf]").attr("value") ??
    $start("input[name=csrf]").attr("value") ??
    undefined;

  const body = new URLSearchParams();
  body.set("postcode", postcode);
  if (csrf) body.set("csrfToken", csrf);

  const submitted = await fetchHtml(action, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cookieJar: start.jar,
  });

  if (submitted.status === 429) {
    return { ok: false, reason: "GOV checker rate-limited (HTTP 429)" };
  }
  if (submitted.status >= 400) {
    return { ok: false, reason: `GOV checker POST failed (HTTP ${submitted.status})` };
  }

  // The response might be:
  // - A results page directly containing a band
  // - A list of addresses to choose from
  const bandDirect = extractBandFromText(submitted.html);
  if (bandDirect) {
    const addr = pickAddressCandidate(submitted.html) ?? postcode;
    setCached(postcode, houseNumber, bandDirect, addr);
    return { ok: true, band: bandDirect, address: addr, cached: false };
  }

  // Address selection flow: pick best matching link if possible
  const $ = cheerio.load(submitted.html);
  const links = $("a")
    .map((_, el) => ({
      href: $(el).attr("href") ?? "",
      text: $(el).text().trim(),
    }))
    .get()
    .filter((l) => l.href && l.text && /check-your-council-tax-band/i.test(l.href));

  if (!links.length) {
    return { ok: false, reason: "GOV checker: could not find band or address links" };
  }

  const hn = houseNumber?.trim().toLowerCase();
  const chosen =
    hn ? links.find((l) => l.text.toLowerCase().includes(hn)) ?? links[0] : links[0];

  const nextUrl = chosen.href.startsWith("http")
    ? chosen.href
    : new URL(chosen.href, submitted.url).toString();

  const detail = await fetchHtml(nextUrl, { cookieJar: submitted.jar });
  if (detail.status >= 400) {
    return { ok: false, reason: `GOV checker detail failed (HTTP ${detail.status})` };
  }

  const band = extractBandFromText(detail.html);
  if (!band) {
    return { ok: false, reason: "GOV checker detail: band not found in HTML" };
  }
  const address = pickAddressCandidate(detail.html) ?? chosen.text ?? postcode;
  setCached(postcode, houseNumber, band, address);
  return { ok: true, band, address, cached: false };
}

