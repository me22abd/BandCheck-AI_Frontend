import React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { baseUrl } from "@/lib/apiBaseUrl";
import { isBandLowerThan, type NearbyProperty } from "@/lib/scoring";
import { getAppealSummary, formatGbp, bandKey } from "@/lib/appealEstimates";

function formatPostcode(pc: string) {
  return pc.replace(/(.{3})$/, " $1");
}

function BandPill({ letter, tone = "ink" }: { letter: string; tone?: "ink" | "forest" }) {
  const bg = tone === "forest" ? "bg-forest text-paper" : "bg-ink text-paper";
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-base font-bold shadow-sm ${bg}`}
    >
      {letter}
    </span>
  );
}

function CaseStrengthBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70 ? "bg-forest" : score >= 40 ? "bg-accent" : "bg-ink-3";
  return (
    <div className="rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Case strength</p>
        <p className="text-sm font-semibold text-forest">{label}</p>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-1.5 text-right font-mono text-[11px] text-ink-3">{score}/100</p>
    </div>
  );
}

export default async function SummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ postcode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { postcode: postcodeParam } = await params;
  const sp = await searchParams;
  const decodedPostcode = decodeURIComponent(postcodeParam);
  const compact = decodedPostcode.replace(/\s+/g, "").toUpperCase();
  const formatted = formatPostcode(compact);
  const houseNumber = typeof sp.house === "string" ? sp.house.trim() : undefined;
  const houseQuery = houseNumber ? `?house=${encodeURIComponent(houseNumber)}` : "";
  const compareHref = `/results/${encodeURIComponent(compact)}${houseQuery}`;

  let apiData: { userBand: string; nearbyProperties: NearbyProperty[] } | null = null;
  try {
    const res = await fetch(`${baseUrl}/api/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode: compact, houseNumber: houseNumber || undefined }),
      cache: "no-store",
    });
    if (res.ok) {
      apiData = (await res.json()) as { userBand: string; nearbyProperties: NearbyProperty[] };
    } else {
      const errJson = (await res.json().catch(() => null)) as { error?: string } | null;
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
              <Link href={compareHref} className="text-sm font-medium text-accent underline-offset-4 hover:text-accent-deep hover:underline">
                ← Back
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { userBand, nearbyProperties } = apiData;
  const summary = getAppealSummary(userBand, nearbyProperties);

  const appealComparables = nearbyProperties
    .filter((p) => isBandLowerThan(p.band, userBand))
    .slice(0, 5)
    .map((p) => ({ address: p.address, band: p.band }));
  const comparablesQuery = encodeURIComponent(JSON.stringify(appealComparables));
  const appealHref = `/appeal?postcode=${encodeURIComponent(compact)}&band=${encodeURIComponent(userBand)}&comparables=${comparablesQuery}`;

  const chipLabel =
    summary.score >= 70
      ? `Strong case · ${summary.likelihood}% likelihood`
      : summary.score >= 40
        ? `Good case · ${summary.likelihood}% likelihood`
        : `Building case · ${summary.likelihood}% likelihood`;

  const caseLabel =
    summary.lowConfidence ? "Limited Data" :
    summary.score >= 70 ? "Strong Case" :
    summary.score >= 40 ? "Good Case" : "Building Case";

  const reasons = [
    summary.lowerCount > 0
      ? `${summary.lowerCount} of ${summary.totalProperties} nearby comparable homes are in band ${summary.likelyBand}, not ${summary.userBand}.`
      : `We found ${summary.totalProperties} comparable homes near your postcode.`,
    "Properties are similar in size and value.",
    "Located in the same area.",
    "No qualifying improvements found in planning records.",
  ];

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-10 text-ink">

        {/* Back */}
        <Link href={compareHref} className="text-sm text-ink-2 transition-colors hover:text-ink">
          ← Back
        </Link>

        {/* Hero — big refund number */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center rounded-md bg-forest/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
            {chipLabel}
          </span>
          {summary.totalOwed > 0 ? (
            <>
              <p className="mt-4 font-serif leading-none text-ink" style={{ fontSize: "clamp(3rem, 12vw, 5rem)", letterSpacing: "-0.04em" }}>
                <span className="text-[0.55em] text-ink-2">£</span>
                {Math.round(summary.totalOwed).toLocaleString("en-GB")}
              </p>
              <p className="mt-2 font-serif italic text-ink-2 sm:text-lg">
                total you could be owed
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 font-serif text-2xl text-ink">Your Case Summary</p>
              <p className="mt-1 text-sm text-ink-3">{formatted}</p>
            </>
          )}
        </div>

        {/* Breakdown card */}
        <div className="mt-6 overflow-hidden rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
          {/* Current band row */}
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-ink">Current band</p>
              <p className="font-mono text-[10.5px] text-ink-3">{formatGbp(summary.currentAnnual)} / year</p>
            </div>
            <BandPill letter={summary.userBand} />
          </div>
          {/* Likely band row */}
          {summary.likelyBand !== summary.userBand ? (
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-ink">Likely correct band</p>
                <p className="font-mono text-[10.5px] text-ink-3">{formatGbp(summary.reducedAnnual)} / year</p>
              </div>
              <BandPill letter={summary.likelyBand} tone="forest" />
            </div>
          ) : null}
          {/* Annual saving */}
          {summary.annualSaving > 0 ? (
            <div className="flex items-center justify-between border-b border-hairline bg-forest/[0.04] px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-ink">Annual saving</p>
                <p className="font-mono text-[10.5px] text-ink-3">every year going forward</p>
              </div>
              <p className="font-serif text-xl text-forest">{formatGbp(summary.annualSaving)}</p>
            </div>
          ) : null}
          {/* Backdated refund */}
          {summary.backdatedRefund > 0 ? (
            <div className="flex items-center justify-between bg-forest/[0.04] px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-ink">Backdated refund</p>
                <p className="font-mono text-[10.5px] text-ink-3">estimated backdated amount</p>
              </div>
              <p className="font-serif text-xl text-forest">{formatGbp(summary.backdatedRefund)}</p>
            </div>
          ) : null}
        </div>

        {/* Case strength bar */}
        <div className="mt-4">
          <CaseStrengthBar score={summary.score} label={caseLabel} />
        </div>

        {/* Why we think this */}
        <div className="mt-4 rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink font-serif text-sm italic text-paper">
              ai
            </span>
            <p className="text-sm font-semibold text-ink">Why we think this</p>
          </div>
          <ol className="space-y-2">
            {reasons.map((reason, i) => (
              <li key={reason} className="flex gap-3">
                <span className="mt-0.5 shrink-0 font-serif text-base text-accent">{i + 1}.</span>
                <span className="text-sm leading-relaxed text-ink-2">{reason}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="mt-6 space-y-3">
          <Link
            href={appealHref}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-accent px-8 text-[15px] font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5"
          >
            Build my appeal →
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-ink-3">
          Savings are estimates based on average band reductions. Actual amounts depend on your local authority.
        </p>
      </main>
    </div>
  );
}
