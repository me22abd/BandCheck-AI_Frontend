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
        <span className="text-3xl font-bold tabular-nums text-forest">{score}</span>
        <span className="text-sm font-medium text-forest/80">/100</span>
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
      <div className="min-h-screen bg-paper-gradient">
        <SiteHeader />
        <main className="px-6 py-16 text-ink sm:py-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="text-base text-ink-2">
              We couldn&apos;t analyze this postcode right now. Please try again.
            </p>
            <p className="mt-6">
              <Link
                href="/"
                className="text-sm font-medium text-ink-2 underline-offset-4 transition hover:text-ink hover:underline"
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
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 text-ink">
        <div className="space-y-6">

          {/* Header */}
          <div>
            <Link
              href="/"
              className="text-sm text-ink-2 transition-colors hover:text-ink"
            >
              ← Back
            </Link>
            <h1 className="mt-4 font-serif text-2xl text-ink">
              Results for {formatted}
            </h1>
            <p className="mt-1 text-sm text-ink-3">
              <Link href="/" className="text-accent hover:text-accent-deep hover:underline">
                Edit postcode
              </Link>
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-editorial border border-hairline bg-paper-card p-6 shadow-editorial-sm text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
                Your council tax band
              </p>
              <div className="mt-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[10px] bg-ink text-4xl font-bold text-paper shadow-sm">
                  {userBand}
                </div>
              </div>
              <p className="mt-4 text-xs text-ink-3">
                Varies by local authority — check your bill
              </p>
            </div>

            <div className="rounded-editorial border border-hairline bg-paper-card p-6 shadow-editorial-sm text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
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

            <div className="rounded-editorial border border-hairline bg-paper-card p-6 shadow-editorial-sm text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
                Nearby homes
              </p>
              <p className="mt-4 text-lg font-semibold text-ink">
                {nearbyHomesSummary}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                {lowerCount} of {totalNearby} nearby properties are in a lower band
              </p>
            </div>
          </div>

          {/* Insight banner */}
          <div className="rounded-editorial border border-hairline bg-accent/5 px-6 py-5">
            <p className="text-sm font-semibold text-ink">
              {microProof}
            </p>
            <p className="mt-1 text-sm text-ink-2">
              You may be overpaying. Our analysis suggests you could have a strong case for appeal.
            </p>
          </div>

          {/* CTAs */}
          <Link
            href={`/compare/${encodeURIComponent(pathPostcode)}`}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-accent px-8 text-lg font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5"
          >
            View Full Breakdown →
          </Link>
          <Link
            href={`/appeal?postcode=${encodeURIComponent(compact)}&band=${encodeURIComponent(userBand)}&comparables=${comparablesQuery}`}
            className="flex min-h-14 w-full items-center justify-center rounded-xl border border-hairline bg-paper-card px-8 text-lg font-semibold text-ink shadow-editorial-sm transition-all hover:opacity-90"
          >
            Start Appeal
          </Link>

          <p className="text-center text-xs leading-relaxed text-ink-3">
            Nearby properties are based on real postcode data. Results should be used as a guide only.
          </p>

        </div>
      </main>
    </div>
  );
}
