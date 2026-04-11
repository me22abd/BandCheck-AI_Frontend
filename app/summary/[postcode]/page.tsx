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

function caseLabel(score: number, lowConfidence: boolean): string {
  if (lowConfidence) return "Limited Data";
  if (score >= 70) return "Strong Case";
  if (score >= 40) return "Good Case";
  return "Building Case";
}

function caseLabelColor(score: number, lowConfidence: boolean): string {
  if (lowConfidence) return "text-amber-600";
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-blue-600";
  return "text-slate-500";
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
          stroke="#e5e7eb"
          strokeWidth="7"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#16a34a"
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
        <span className="text-3xl font-bold tabular-nums text-green-700">
          {score}
        </span>
        <span className="text-sm font-medium text-green-600/90">/100</span>
      </div>
    </div>
  );
}

const CHECK_ICON = (
  <span
    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600"
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
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-gray-50">
        <SiteHeader />
        <main className="px-6 py-16 text-slate-900 sm:py-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="text-base text-slate-700">
              We couldn&apos;t load your case summary right now. Please try again.
            </p>
            <p className="mt-6">
              <Link
                href={compareHref}
                className="text-sm font-medium text-blue-600 underline-offset-4 transition hover:text-blue-800 hover:underline"
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

  const keyPoints = [
    `${lowerCount} similar propert${lowerCount === 1 ? "y" : "ies"} ${lowerCount === 1 ? "is" : "are"} in a lower band`,
    "Properties are similar in size and value",
    "Located in the same area",
    "No recent major improvements reported",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 text-gray-900">
        <div className="mb-6">
          <Link
            href={compareHref}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            ← Back
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          Your Case Summary
        </h1>
        <p className="mt-1 text-sm text-gray-500">{formatted}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          {/* Key points */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <ul className="space-y-3">
              {keyPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  {CHECK_ICON}
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Case strength */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:min-w-[200px]">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Case Strength
            </p>
            <CaseStrengthGauge score={score} />
            <p className={`mt-3 text-sm font-semibold ${labelColor}`}>
              {label}
            </p>
          </div>
        </div>

        {/* Potential savings */}
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">
            Potential Savings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            If your band is reduced from Band {userBand} to a lower band
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { amount: "£361", period: "Saved per year" },
              { amount: "£1,805", period: "Over 5 years" },
              { amount: "£3,610+", period: "Over 10 years" },
            ].map(({ amount, period }) => (
              <div
                key={period}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center"
              >
                <p className="text-lg font-bold text-blue-600 sm:text-xl">
                  {amount}
                </p>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  {period}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Link
            href={appealHref}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue to Appeal →
          </Link>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-gray-400">
          Savings figures are estimates based on average band reductions.
          Actual savings depend on your local authority.
        </p>
      </main>
    </div>
  );
}
