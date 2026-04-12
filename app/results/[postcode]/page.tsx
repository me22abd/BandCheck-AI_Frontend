import React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { baseUrl } from "@/lib/apiBaseUrl";
import {
  calculateCaseStrengthScore,
  formatMicroProof,
  isBandLowerThan,
  type NearbyProperty,
} from "@/lib/scoring";

function formatPostcode(pc: string) {
  return pc.replace(/(.{3})$/, " $1");
}

function summarizeNearbyHomes(properties: NearbyProperty[]): string {
  if (properties.length === 0) return "No comparisons yet";
  const freq = new Map<string, number>();
  for (const p of properties) {
    const b = p.band;
    freq.set(b, (freq.get(b) ?? 0) + 1);
  }
  let topBand = properties[0].band;
  let max = 0;
  for (const [band, n] of freq) {
    if (n > max) {
      max = n;
      topBand = band;
    }
  }
  return `Mostly Band ${topBand}`;
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
          className="bandcheck-gauge-progress"
          style={
            {
              ["--gauge-circ"]: String(c),
              ["--gauge-start"]: String(c),
              ["--gauge-end"]: String(endOffset),
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-green-700">{score}</span>
        <span className="text-sm font-medium text-green-600/90">/100</span>
      </div>
    </div>
  );
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ postcode: string }>;
}) {
  const { postcode: postcodeParam } = await params;
  const decodedPostcode = decodeURIComponent(postcodeParam);
  const compact = decodedPostcode.replace(/\s+/g, "").toUpperCase();
  const formatted = formatPostcode(compact);
  const pathPostcode = compact;

  let apiData: { userBand: string; nearbyProperties: NearbyProperty[] } | null = null;
  try {
    const res = await fetch(`${baseUrl}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode: compact }),
      cache: "no-store",
    });
    if (res.ok) {
      apiData = (await res.json()) as {
        userBand: string;
        nearbyProperties: NearbyProperty[];
      };
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
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <main className="px-6 py-16 text-gray-900 sm:py-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="text-base text-gray-700">
              We couldn&apos;t analyze this postcode right now. Please try again.
            </p>
            <p className="mt-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 underline-offset-4 transition hover:text-gray-900 hover:underline"
              >
                ← Back
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { userBand, nearbyProperties } = apiData;

  const { score, lowerCount, label, lowConfidence } =
    calculateCaseStrengthScore(userBand, nearbyProperties);

  const microProof = formatMicroProof(lowerCount);
  const nearbyHomesSummary = summarizeNearbyHomes(nearbyProperties);
  const totalNearby = nearbyProperties.length;

  const appealComparables = nearbyProperties
    .filter((p) => isBandLowerThan(p.band, userBand))
    .slice(0, 5)
    .map((p) => ({ address: p.address, band: p.band }));
  const comparablesQuery = encodeURIComponent(JSON.stringify(appealComparables));

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 text-gray-900">
        <div className="space-y-6">

          {/* Header */}
          <div>
            <Link
              href="/"
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              ← Back
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">
              Results for {formatted}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              <Link href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
                Edit postcode
              </Link>
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Your council tax band
              </p>
              <div className="mt-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl font-bold text-blue-600 ring-4 ring-blue-100">
                  {userBand}
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Varies by local authority — check your bill
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Case strength
              </p>
              <div className="mt-2">
                <CaseStrengthGauge score={score} />
              </div>
              <p className="mt-2 text-sm font-semibold text-green-700">{label}</p>
              {lowConfidence ? (
                <p className="mt-1 text-xs text-gray-500">
                  Limited data — confidence may be lower
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Nearby homes
              </p>
              <p className="mt-4 text-lg font-semibold text-gray-900">
                {nearbyHomesSummary}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {lowerCount} of {totalNearby} nearby properties are in a lower band
              </p>
            </div>
          </div>

          {/* Insight banner */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">
            <p className="text-sm font-semibold text-blue-900">
              {microProof}
            </p>
            <p className="mt-1 text-sm text-blue-800/80">
              You may be overpaying. Our analysis suggests you could have a strong case for appeal.
            </p>
          </div>

          {/* CTAs */}
          <Link
            href={`/compare/${encodeURIComponent(pathPostcode)}`}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-150 hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Full Breakdown →
          </Link>
          <Link
            href={`/appeal?postcode=${encodeURIComponent(compact)}&band=${encodeURIComponent(userBand)}&comparables=${comparablesQuery}`}
            className="flex min-h-14 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-8 text-lg font-semibold text-gray-700 shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Appeal
          </Link>

          <p className="text-center text-xs leading-relaxed text-gray-400">
            Nearby properties are based on real postcode data. Results should be used as a guide only.
          </p>

        </div>
      </main>
    </div>
  );
}
