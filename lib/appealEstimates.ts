import type { NearbyProperty } from "./scoring";
import { calculateCaseStrengthScore, councilTaxBandIndex } from "./scoring";

export const BAND_ANNUAL: Record<string, number> = {
  A: 1200,
  B: 1460,
  C: 1729,
  D: 2194,
  E: 2650,
  F: 3100,
  G: 3550,
  H: 4000,
};

export function bandKey(band: string): string {
  return band.toUpperCase().replace(/[^A-H]/g, "").charAt(0) || "D";
}

export function formatGbp(amount: number): string {
  return `£${Math.round(amount).toLocaleString("en-GB")}`;
}

export function likelyLowerBand(userBand: string, bands: string[]): string | null {
  const userIdx = councilTaxBandIndex(userBand);
  let best: string | null = null;
  let bestIdx = userIdx;
  for (const band of bands) {
    const idx = councilTaxBandIndex(band);
    if (idx < userIdx && idx < bestIdx) {
      bestIdx = idx;
      best = bandKey(band);
    }
  }
  return best;
}

export function strengthWord(score: number, lowConfidence: boolean): string {
  if (lowConfidence) return "moderate";
  if (score >= 70) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

export function getAppealSummary(userBand: string, nearbyProperties: NearbyProperty[]) {
  const user = bandKey(userBand);
  const lower = likelyLowerBand(
    userBand,
    nearbyProperties.map((p) => p.band),
  );
  const { score, lowerCount, totalProperties, lowConfidence } = calculateCaseStrengthScore(
    userBand,
    nearbyProperties,
  );

  const currentAnnual = BAND_ANNUAL[user] ?? BAND_ANNUAL.D;
  const reducedAnnual = lower ? (BAND_ANNUAL[lower] ?? currentAnnual) : currentAnnual;
  const annualSaving = Math.max(0, currentAnnual - reducedAnnual);
  const backdatedRefund = annualSaving * 4;
  const totalOwed = annualSaving + backdatedRefund;

  return {
    userBand: user,
    likelyBand: lower ?? user,
    currentAnnual,
    reducedAnnual,
    annualSaving,
    backdatedRefund,
    totalOwed,
    score,
    lowerCount,
    totalProperties,
    lowConfidence,
    strength: strengthWord(score, lowConfidence),
    likelihood: lowConfidence ? Math.min(score, 30) : score,
  };
}
