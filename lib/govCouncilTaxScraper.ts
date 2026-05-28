import * as cheerio from "cheerio";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GovProperty = {
  address: string;
  band: string;
};

type PropertyCache = {
  properties: GovProperty[];
  fetchedAtMs: number;
};

// ─── In-memory caches ─────────────────────────────────────────────────────────

const TTL_MS = 24 * 60 * 60 * 1000;

/** Postcode → all properties at that postcode */
const postcodeCache = new Map<string, PropertyCache>();

function getPostcodeCached(postcode: string): GovProperty[] | null {
  const k = normPostcode(postcode);
  const v = postcodeCache.get(k);
  if (!v) return null;
  if (Date.now() - v.fetchedAtMs > TTL_MS) {
    postcodeCache.delete(k);
    return null;
  }
  return v.properties;
}

function setPostcodeCached(postcode: string, properties: GovProperty[]) {
  postcodeCache.set(normPostcode(postcode), { properties, fetchedAtMs: Date.now() });
}

function normPostcode(pc: string): string {
  return pc.toUpperCase().replace(/\s+/g, "");
}

// ─── Low-level fetch ──────────────────────────────────────────────────────────

type CookieJar = Record<string, string>;

function parseSetCookieHeaders(setCookie: string[]): CookieJar {
  const jar: CookieJar = {};
  for (const line of setCookie) {
    const first = line.split(";")[0];
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    jar[first.slice(0, eq).trim()] = first.slice(eq + 1).trim();
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

// ─── HTML extraction helpers ──────────────────────────────────────────────────

function extractBandFromText(text: string): string | null {
  const m =
    text.match(/council\s*tax\s*band\s*([A-I])\b/i) ??
    text.match(/\bband\s*([A-I])\b/i);
  const band = m?.[1]?.toUpperCase() ?? "";
  return band && /^[A-I]$/.test(band) ? band : null;
}

/**
 * Parse all properties from the GOV checker address-selection table.
 *
 * The page renders a <table class="govuk-table"> where each <tr> has:
 *   <td><a href="/check-council-tax-band/property/...">ADDRESS</a></td>
 *   <td>B</td>   ← the band letter
 *
 * The link's title attribute also contains "(Band X)" as a fallback.
 */
function parsePropertiesFromListPage(html: string): GovProperty[] {
  const $ = cheerio.load(html);
  const results: GovProperty[] = [];

  $("tr.govuk-table__row, tr").each((_, row) => {
    const tds = $(row).find("td");
    if (tds.length < 2) return;

    const addressCell = $(tds[0]);
    const bandCell = $(tds[1]);

    // Address: prefer link text, fall back to cell text
    const link = addressCell.find("a[href*='check-council-tax-band/property']");
    const address = (link.length ? link.text() : addressCell.text()).trim();
    if (!address) return;

    // Band: second column text (usually just "B" etc.)
    let band = bandCell.text().trim().toUpperCase();

    // Fallback: try to extract band from the link title attribute
    if (!band || !/^[A-I]$/.test(band)) {
      const title = link.attr("title") ?? "";
      const m = title.match(/\(Band\s*([A-I])\)/i);
      band = m?.[1]?.toUpperCase() ?? "";
    }

    if (address && /^[A-I]$/.test(band)) {
      results.push({ address, band });
    }
  });

  return results;
}

/** Return the "Next page" URL if pagination is present, else null. */
function extractNextPageUrl(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html);
  const nextLink = $("a")
    .filter((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr("href") ?? "";
      return /next/i.test(text) && /check-council-tax-band/i.test(href);
    })
    .first();
  const href = nextLink.attr("href");
  if (!href) return null;
  return href.startsWith("http") ? href : new URL(href, baseUrl).toString();
}

// ─── Public: get all properties at a postcode ─────────────────────────────────

/**
 * Scrape the GOV.UK council tax band checker to return every property it lists
 * for a given postcode, along with their bands.
 *
 * The address-list page shows both address and band in a table — no need to
 * follow individual property links. We fetch page 1 and optionally page 2 for
 * postcodes with many properties.
 *
 * Results are cached per-postcode for 24 hours (in-process memory).
 *
 * IMPORTANT: This is not an official API and may break at any time.
 */
export async function scrapeGovAllPropertiesAtPostcode(
  postcode: string,
): Promise<
  | { ok: true; properties: GovProperty[]; cached: boolean }
  | { ok: false; reason: string }
> {
  const cached = getPostcodeCached(postcode);
  if (cached) {
    return { ok: true, properties: cached, cached: true };
  }

  // Step 1: POST the postcode to start the search (no cookies needed for the
  // address-list page; the session is embedded in the redirect URL)
  const start = await fetchHtml(
    "https://www.tax.service.gov.uk/check-council-tax-band/search",
  );
  if (start.status >= 400) {
    return { ok: false, reason: `GOV start page failed (HTTP ${start.status})` };
  }

  const $start = cheerio.load(start.html);
  const form = $start("form").first();
  const actionRaw = form.attr("action") || "/check-council-tax-band/search";
  const action = actionRaw.startsWith("http")
    ? actionRaw
    : new URL(actionRaw, start.url).toString();

  const csrf =
    $start("input[name=csrfToken]").attr("value") ??
    $start("input[name=_csrf]").attr("value") ??
    $start("input[name=csrf]").attr("value") ??
    undefined;

  const body = new URLSearchParams();
  body.set("postcode", postcode);
  if (csrf) body.set("csrfToken", csrf);

  // Don't pass start.jar — sending session cookies from the start page can cause
  // the server to return a different (non-list) page. The address-list is
  // accessible without prior session cookies.
  const submitted = await fetchHtml(action, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (submitted.status === 429) {
    return { ok: false, reason: "GOV checker rate-limited (HTTP 429)" };
  }
  if (submitted.status >= 400) {
    return { ok: false, reason: `GOV POST failed (HTTP ${submitted.status})` };
  }

  // Step 2: parse address+band pairs from the table on page 1
  let properties = parsePropertiesFromListPage(submitted.html);

  // Step 3: follow pagination (one extra page is enough for most postcodes)
  const nextPageUrl = extractNextPageUrl(submitted.html, submitted.url);
  if (nextPageUrl) {
    try {
      const page2 = await fetchHtml(nextPageUrl);
      if (page2.status < 400) {
        properties = [...properties, ...parsePropertiesFromListPage(page2.html)];
      }
    } catch {
      // best effort
    }
  }

  if (properties.length > 0) {
    setPostcodeCached(postcode, properties);
    return { ok: true, properties, cached: false };
  }

  // Step 4: fallback for single-result pages where the band is shown directly
  // (some very small postcodes redirect straight to the property detail)
  const directBand = extractBandFromText(submitted.html);
  if (directBand) {
    const $ = cheerio.load(submitted.html);
    const h1 = $("h1").first().text().trim();
    const address = (h1 && !/search results/i.test(h1)) ? h1 : postcode;
    const fallbackProps: GovProperty[] = [{ address, band: directBand }];
    setPostcodeCached(postcode, fallbackProps);
    return { ok: true, properties: fallbackProps, cached: false };
  }

  return { ok: false, reason: "GOV checker: no properties found on page" };
}

// ─── Public: get band for a single property (backward-compat wrapper) ─────────

/**
 * Returns the council tax band (and address) for a specific property identified
 * by postcode + optional house number.
 *
 * Internally fetches ALL properties at the postcode (cached 24 h) and picks
 * the best match, so subsequent calls for the same postcode are instant.
 *
 * IMPORTANT: This is not an official API and may break at any time.
 */
export async function scrapeGovCouncilTaxBand(
  postcode: string,
  houseNumber?: string,
): Promise<
  | { ok: true; band: string; address: string; cached: boolean }
  | { ok: false; reason: string }
> {
  const result = await scrapeGovAllPropertiesAtPostcode(postcode);
  if (!result.ok) return result;

  const { properties, cached } = result;
  if (!properties.length) {
    return { ok: false, reason: "GOV checker returned no properties" };
  }

  const hn = houseNumber?.trim().toLowerCase();
  const chosen = hn
    ? (properties.find((p) => p.address.toLowerCase().includes(hn)) ?? properties[0])
    : properties[0];

  return { ok: true, band: chosen.band, address: chosen.address, cached };
}
