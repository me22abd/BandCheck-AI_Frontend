export type NearbyProperty = {
  address: string;
  band: string;
  /** Optional distance in miles (real when available). */
  distanceMiles?: number;
};

const BAND_ORDER = "ABCDEFGH";

function bandRank(band: string): number {
  const letter = band.toUpperCase().replace(/[^A-H]/g, "").charAt(0);
  if (!letter) return 0;
  const i = BAND_ORDER.indexOf(letter);
  return i === -1 ? 0 : i;
}

/** A=0 … H=7 — for display (e.g. band difference) only. */
export function councilTaxBandIndex(band: string): number {
  return bandRank(band);
}

/** True if property band is strictly lower (cheaper) than the user’s band. */
export function isBandLowerThan(propertyBand: string, userBand: string): boolean {
  return bandRank(propertyBand) < bandRank(userBand);
}

function scoreMeaningLabel(score: number): string {
  if (score <= 30) return "Low likelihood";
  if (score <= 70) return "Moderate likelihood";
  return "High likelihood";
}

/**
 * Case strength from share of nearby properties in a lower band than the user.
 * Score is capped so a full match is not a perfect 100 (more realistic).
 * With fewer than 2 comparables, confidence is limited (low confidence).
 */
export function calculateCaseStrengthScore(
  userBand: string,
  nearbyProperties: NearbyProperty[],
): {
  score: number;
  lowerCount: number;
  totalProperties: number;
  label: string;
  lowConfidence: boolean;
} {
  const userRank = bandRank(userBand);
  const totalProperties = nearbyProperties.length;

  if (totalProperties === 0) {
    return {
      score: 0,
      lowerCount: 0,
      totalProperties: 0,
      label: scoreMeaningLabel(0),
      lowConfidence: true,
    };
  }

  let lowerCount = 0;
  for (const p of nearbyProperties) {
    if (bandRank(p.band) < userRank) lowerCount += 1;
  }

  const ratio = lowerCount / totalProperties;
  let score = Math.round(ratio * 85 + 10);

  const lowConfidence = totalProperties < 2;
  if (lowConfidence) {
    score = Math.min(score, 30);
  }

  const label = lowConfidence ? "Low likelihood" : scoreMeaningLabel(score);

  return {
    score,
    lowerCount,
    totalProperties,
    label,
    lowConfidence,
  };
}

/** Micro-proof line for the results alert (grammar matches count). */
export function formatMicroProof(lowerCount: number): string {
  if (lowerCount === 0) {
    return "We couldn't find similar properties in a lower band in your area";
  }
  if (lowerCount === 1) {
    return "1 similar property in your area is in a lower band";
  }
  return `${lowerCount} similar properties in your area are in a lower band`;
}
