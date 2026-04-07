import React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getCheckAnalysisForPostcode } from "@/lib/checkAnalysis";
import {
  calculateCaseStrengthScore,
  formatMicroProof,
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

  const analysisResult = await getCheckAnalysisForPostcode(compact);

  if (!analysisResult.ok) {
    console.error(
      "Check analysis error:",
      analysisResult.status,
      analysisResult.message,
    );
    return (
      <div className="min-h-screen bg-slate-50">
        <SiteHeader />
        <main className="px-6 py-16 text-slate-900 sm:py-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="text-base text-slate-700">
              We couldn&apos;t analyze this postcode right now. Please try again.
            </p>
            <p className="mt-6">
              <Link
                href="/"
                className="text-sm font-medium text-[#2563EB] underline-offset-4 transition hover:text-blue-800 hover:underline"
              >
                ← Back
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { userBand, nearbyProperties } = analysisResult.data;

  const { score, lowerCount, label, lowConfidence } =
    calculateCaseStrengthScore(userBand, nearbyProperties);

  const microProof = formatMicroProof(lowerCount);
  const nearbyHomesSummary = summarizeNearbyHomes(nearbyProperties);
  const totalNearby = nearbyProperties.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="px-6 py-10 pb-16 text-slate-900 sm:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Results for
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {formatted}
            </h1>
            <p className="mt-2">
              <Link
                href="/"
                className="text-sm font-medium text-[#2563EB] hover:text-blue-800 hover:underline"
              >
                Edit postcode
              </Link>
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/40">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your council tax band
              </p>
              <div className="mt-4 flex justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-5xl font-bold text-[#2563EB] shadow-inner ring-4 ring-blue-50 sm:h-32 sm:w-32 sm:text-6xl">
                  {userBand}
                </div>
              </div>
              <p className="mt-5 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                Annual cost (approx.)
              </p>
              <p className="mt-1 text-center text-sm text-slate-500">
                Varies by local authority — check your bill
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/40">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Case strength
              </p>
              <div className="mt-2">
                <CaseStrengthGauge score={score} />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-green-800">
                {label}
              </p>
              {lowConfidence ? (
                <p className="mt-2 text-center text-xs leading-relaxed text-green-800/80">
                  Limited data — confidence may be lower
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-200/40">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nearby homes
              </p>
              <p className="mt-4 text-center text-lg font-semibold text-slate-900">
                {nearbyHomesSummary}
              </p>
              <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                {lowerCount} of {totalNearby} similar properties in this sample are
                in a lower band
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200/90 bg-amber-50 px-5 py-5 shadow-sm sm:px-8 sm:py-6">
            <p className="text-center text-lg font-semibold text-amber-950 sm:text-xl">
              <span aria-hidden>⚠️ </span>
              You may be overpaying. Our analysis suggests you could have a strong
              chance of success.
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-amber-900/95">
              {microProof}
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-amber-900/85">
              This is based on nearby properties with lower council tax bands than
              yours.
            </p>
          </div>

          <div className="bandcheck-animate-cta mt-10 space-y-4">
            <Link
              href={`/compare/${encodeURIComponent(pathPostcode)}`}
              className="flex min-h-14 w-full items-center justify-center rounded-xl bg-[#2563EB] px-8 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-px hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Full Breakdown →
            </Link>
            <p className="text-center">
              <Link
                href="/"
                className="text-sm font-medium text-[#2563EB] underline-offset-4 transition hover:text-blue-800 hover:underline"
              >
                ← Back
              </Link>
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl space-y-3 text-center text-xs leading-relaxed text-slate-500">
            <p>
              Nearby properties are based on real postcode data. Council tax bands
              are estimated for demonstration.
            </p>
            <p>
              Results are based on available nearby property data and should be used
              as a guide.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
