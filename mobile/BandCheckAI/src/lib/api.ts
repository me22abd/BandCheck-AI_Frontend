import type { NearbyProperty } from "./scoring";

export type CheckResponse = {
  postcode: string;
  district: string;
  userBand: string;
  nearbyProperties: NearbyProperty[];
  /** Band is statistically modelled — not live VOA data. Always verify. */
  isEstimated?: boolean;
  annualSaving?: number;
};

export type LeadPayload = {
  email: string;
  postcode: string;
  userBand: string;
  draftAppeal: boolean;
  comparables?: Array<{ address: string; band: string }>;
  // Scoring & savings — computed client-side, used for the PDF
  likelyBand?: string;
  score?: number;
  strength?: string;
  lowerCount?: number;
  totalProperties?: number;
  currentAnnual?: number;
  reducedAnnual?: number;
  annualSaving?: number;
  backdatedRefund?: number;
  totalOwed?: number;
};

export type SubmitLeadResult =
  | { ok: true; emailSent: boolean }
  | { ok: false; error: string; status?: number };

export async function submitLead(
  apiBaseUrl: string,
  payload: LeadPayload,
): Promise<SubmitLeadResult> {
  const base = apiBaseUrl.trim();
  if (!base) {
    return {
      ok: false,
      error: "API is not configured. Add EXPO_PUBLIC_API_BASE_URL to your .env file.",
    };
  }

  try {
    const res = await fetch(`${base}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      let emailSent = true;
      try {
        const json = (await res.json()) as { success?: boolean; emailSent?: boolean };
        emailSent = json.emailSent !== false;
      } catch {
        // default to true (optimistic)
      }
      return { ok: true, emailSent };
    }

    let message = `Could not send (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (typeof body?.error === "string" && body.error.trim()) {
        message = body.error.trim();
      }
    } catch {
      // use default message
    }

    return { ok: false, error: message, status: res.status };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export type DistrictStats = {
  district: string;
  totalChecked: number;
  strongCaseCount: number;
  strongCasePct: number;
  bandBreakdown: Record<string, number>;
};

export async function fetchDistrictStats(
  apiBaseUrl: string,
  district: string,
): Promise<DistrictStats | null> {
  try {
    const res = await fetch(
      `${apiBaseUrl}/api/stats?district=${encodeURIComponent(district)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    return (await res.json()) as DistrictStats;
  } catch {
    return null;
  }
}

export function getApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";
  return normalizeApiBaseUrl(env);
}

export function normalizeApiBaseUrl(raw: string): string {
  const s = (raw ?? "").trim().replace(/\/+$/, "");
  if (!s) return "";
  if (s === "https://bandcheckai.co.uk") return "https://www.bandcheckai.co.uk";
  if (s === "http://bandcheckai.co.uk") return "http://www.bandcheckai.co.uk";
  return s;
}

export async function checkPostcode(
  apiBaseUrl: string,
  postcode: string,
  houseNumber?: string,
): Promise<CheckResponse> {
  const res = await fetch(`${apiBaseUrl}/api/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcode, ...(houseNumber ? { houseNumber } : {}) }),
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (typeof body?.error === "string" && body.error.trim()) {
        message = body.error.trim();
      }
    } catch { /* use default */ }
    throw new Error(message);
  }
  const data = (await res.json()) as CheckResponse;
  return {
    ...data,
    nearbyProperties: data.nearbyProperties ?? [],
  };
}
