import React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { baseUrl } from "@/lib/apiBaseUrl";
import {
  calculateCaseStrengthScore,
  isBandLowerThan,
  type NearbyProperty,
} from "@/lib/scoring";

type CheckResponse = {
  userBand: string;
  nearbyProperties: NearbyProperty[];
};

function formatPostcode(pc: string) {
  return pc.replace(/(.{3})$/, " $1");
}

type SavingsEstimate = { perYear: string; fiveYear: string; tenYear: string };

const BAND_SAVINGS: Record<string, SavingsEstimate> = {
  B: { perYear: "£180",   fiveYear: "£900",   tenYear: "£1,800+" },
  C: { perYear: "£240",   fiveYear: "£1,200", tenYear: "£2,400+" },
  D: { perYear: "£361",   fiveYear: "£1,805", tenYear: "£3,610+" },
  E: { perYear: "£480",   fiveYear: "£2,400", tenYear: "£4,800+" },
  F: { perYear: "£620",   fiveYear: "£3,100", tenYear: "£6,200+" },
  G: { perYear: "£780",   fiveYear: "£3,900", tenYear: "£7,800+" },
  H: { perYear: "£960",   fiveYear: "£4,800", tenYear: "£9,600+" },
};

const DEFAULT_SAVINGS: SavingsEstimate = {
  perYear: "£361", fiveYear: "£1,805", tenYear: "£3,610+",
};

function getSavingsForBand(band: string): SavingsEstimate {
  const key = band.toUpperCase().replace(/[^A-H]/g, "").charAt(0);
  return BAND_SAVINGS[key] ?? DEFAULT_SAVINGS;
}

function caseLabel(score: number, lowConfidence: boolean): string {
  if (lowConfidence) return "Limited Data";
  if (score >= 70) return "Strong Case";
  if (score >= 40) return "Good Case";
  return "Building Case";
}

function caseLabelColor(score: number, lowConfidence: boolean): string {
  if (lowConfidence) return "text-ink-3";
  if (score >= 70) return "text-forest";
  if (score >= 40) return "text-accent";
  return "text-ink-3";
}

function CaseStrengthGauge({ score }: { score: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const endOffset = c - (score / 100) * c;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg
        className="-rotate-90"
        width="144"
        height="144"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgba(20, 18, 13, 0.12)"
          strokeWidth="7"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#0F5C3E"
          strokeWidth="7"
          strokeLinecap="round"
          style={
            {
              strokeDasharray: c,
              strokeDashoffset: endOffset,
              transition: "stroke-dashoffset 0.6s ease",
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-forest">
          {score}
        </span>
        <span className="text-sm font-medium text-forest/80">/100</span>
      </div>
    </div>
  );
}

const CHECK_ICON = (
  <span
    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"
    aria-hidden
  >
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-3 w-3"
    >
      <path
        fillRule="evenodd"
        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
        clipRule="evenodd"
      />
    </svg>
  </span>
);

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ postcode: string }>;
}) {
  const { postcode: postcodeParam } = await params;
  const decodedPostcode = decodeURIComponent(postcodeParam);
  const compact = decodedPostcode.replace(/\s+/g, "").toUpperCase();
  const formatted = formatPostcode(compact);
  const compareHref = `/compare/${encodeURIComponent(compact)}`;

  let apiData: CheckResponse | null = null;
  try {
    const res = await fetch(`${baseUrl}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode: compact }),
      cache: "no-store",
    });
    if (res.ok) {
      apiData = (await res.json()) as CheckResponse;
    } else {
      const errJson = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      console.error("Check API error:", res.status, errJson?.error ?? "Unknown");
    }
  } catch (e) {
    console.error("Check API error:", e);
  }

  if (!apiData) {
    return (
      <div className="min-h-screen bg-paper-gradient">
        <SiteHeader />
        <main className="px-6 py-16 text-ink sm:py-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="text-base text-ink-2">
              We couldn&apos;t load your case summary right now. Please try again.
            </p>
            <p className="mt-6">
              <Link
                href={compareHref}
                className="text-sm font-medium text-accent underline-offset-4 transition hover:text-accent-deep hover:underline"
              >
                ← Back to comparison
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { userBand, nearbyProperties } = apiData;

  const { score, lowerCount, lowConfidence } = calculateCaseStrengthScore(
    userBand,
    nearbyProperties,
  );

  const appealComparables = nearbyProperties
    .filter((p) => isBandLowerThan(p.band, userBand))
    .slice(0, 5)
    .map((p) => ({ address: p.address, band: p.band }));
  const comparablesQuery = encodeURIComponent(
    JSON.stringify(appealComparables),
  );
  const appealHref = `/appeal?postcode=${encodeURIComponent(compact)}&band=${encodeURIComponent(userBand)}&comparables=${comparablesQuery}`;

  const label = caseLabel(score, lowConfidence);
  const labelColor = caseLabelColor(score, lowConfidence);
  const savings = getSavingsForBand(userBand);

  const keyPoints = [
    `${lowerCount} similar propert${lowerCount === 1 ? "y" : "ies"} ${lowerCount === 1 ? "is" : "are"} in a lower band`,
    "Properties are similar in size and value",
    "Located in the same area",
    "No recent major improvements reported",
  ];

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 text-ink">
        <div className="space-y-6">

          {/* Back + title */}
          <div>
            <Link
              href={compareHref}
              className="text-sm text-ink-2 transition-colors hover:text-ink"
            >
              ← Back
            </Link>
            <h1 className="mt-4 font-serif text-2xl text-ink">
              Your Case Summary
            </h1>
            <p className="mt-1 text-sm text-ink-3">{formatted}</p>
          </div>

          {/* Key points + case strength */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Key points — spans 2 cols */}
            <div className="rounded-editorial border border-hairline bg-paper-card p-6 shadow-editorial-sm md:col-span-2">
              <ul className="space-y-3">
                {keyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    {CHECK_ICON}
                    <span className="text-sm text-ink-2">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Case strength — 1 col */}
            <div className="flex flex-col items-center justify-center rounded-editorial border border-hairline bg-paper-card p-6 shadow-editorial-sm text-center">
              <p className="text-sm font-semibold text-ink">
                Case Strength
              </p>
              <div className="mt-3">
                <CaseStrengthGauge score={score} />
              </div>
              <p className={`mt-3 text-sm font-medium ${labelColor}`}>
                {label}
              </p>
            </div>
          </div>

          {/* Potential savings */}
          <div className="rounded-editorial border border-hairline bg-paper-2/40 p-6 shadow-editorial-sm">
            <h2 className="font-serif text-lg text-ink">
              Potential Savings
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              If your band is reduced from Band {userBand} to a lower band
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { amount: savings.perYear,  period: "Saved per year" },
              { amount: savings.fiveYear, period: "Over 5 years" },
              { amount: savings.tenYear,  period: "Over 10 years" },
            ].map(({ amount, period }) => (
                <div
                  key={period}
                  className="rounded-editorial border border-hairline bg-paper-card p-4 text-center shadow-editorial-sm"
                >
                  <p className="text-lg font-semibold text-accent">
                    {amount}
                  </p>
                  <p className="mt-1 text-xs text-ink-3">{period}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href={appealHref}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-accent px-8 text-lg font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5"
          >
            Continue to Appeal →
          </Link>

          <p className="text-center text-xs leading-relaxed text-ink-3">
            Savings figures are estimates based on average band reductions.
            Actual savings depend on your local authority.
          </p>

        </div>
      </main>
    </div>
  );
}
