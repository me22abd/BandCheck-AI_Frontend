export type NearbyProperty = {
  address: string;
  band: string;
  distanceMiles?: number;
};

const BAND_ORDER = "ABCDEFGH";

function bandRank(band: string): number {
  const letter = band.toUpperCase().replace(/[^A-H]/g, "").charAt(0);
  if (!letter) return 0;
  const i = BAND_ORDER.indexOf(letter);
  return i === -1 ? 0 : i;
}

export function councilTaxBandIndex(band: string): number {
  return bandRank(band);
}

export function isBandLowerThan(propertyBand: string, userBand: string): boolean {
  return bandRank(propertyBand) < bandRank(userBand);
}

function scoreMeaningLabel(score: number): string {
  if (score <= 30) return "Low likelihood";
  if (score <= 70) return "Moderate likelihood";
  return "High likelihood";
}

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
  if (lowConfidence) score = Math.min(score, 30);
  const label = lowConfidence ? "Low likelihood" : scoreMeaningLabel(score);

  return { score, lowerCount, totalProperties, label, lowConfidence };
}

export function caseLabel(score: number, lowConfidence: boolean): string {
  if (lowConfidence) return "Limited Data";
  if (score >= 70) return "Strong Case";
  if (score >= 40) return "Good Case";
  return "Building Case";
}

export function caseLabelColor(score: number, lowConfidence: boolean): string {
  if (lowConfidence) return "#D97706";
  if (score >= 70) return "#16A34A";
  if (score >= 40) return "#1B4FD8";
  return "#64748B";
}

export function bandDifferenceLabel(propertyBand: string, userBand: string): string {
  const d = councilTaxBandIndex(propertyBand) - councilTaxBandIndex(userBand);
  if (d === 0) return "0";
  return d > 0 ? `+${d}` : `${d}`;
}

export function bandDifferenceColor(propertyBand: string, userBand: string): string {
  const d = councilTaxBandIndex(propertyBand) - councilTaxBandIndex(userBand);
  if (d < 0) return "#16A34A";
  if (d === 0) return "#6B7280";
  return "#DC2626";
}

export function formatDistanceMiles(miles?: number): string {
  if (typeof miles !== "number" || !Number.isFinite(miles)) return "—";
  if (miles < 0.1) return "<0.1 mi";
  return `${miles.toFixed(2)} mi`;
}
