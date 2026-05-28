type SavingsEstimate = { perYear: string; fiveYear: string; tenYear: string };

const BAND_SAVINGS: Record<string, SavingsEstimate> = {
  B: { perYear: "£180", fiveYear: "£900", tenYear: "£1,800+" },
  C: { perYear: "£240", fiveYear: "£1,200", tenYear: "£2,400+" },
  D: { perYear: "£361", fiveYear: "£1,805", tenYear: "£3,610+" },
  E: { perYear: "£480", fiveYear: "£2,400", tenYear: "£4,800+" },
  F: { perYear: "£620", fiveYear: "£3,100", tenYear: "£6,200+" },
  G: { perYear: "£780", fiveYear: "£3,900", tenYear: "£7,800+" },
  H: { perYear: "£960", fiveYear: "£4,800", tenYear: "£9,600+" },
};

const DEFAULT_SAVINGS: SavingsEstimate = {
  perYear: "£361",
  fiveYear: "£1,805",
  tenYear: "£3,610+",
};

export function getSavingsForBand(band: string): SavingsEstimate {
  const key = band.toUpperCase().replace(/[^A-H]/g, "").charAt(0);
  return BAND_SAVINGS[key] ?? DEFAULT_SAVINGS;
}
