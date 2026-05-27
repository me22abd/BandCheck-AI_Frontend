import React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { baseUrl } from "@/lib/apiBaseUrl";
import {
  calculateCaseStrengthScore,
  isBandLowerThan,
  councilTaxBandIndex,
  type NearbyProperty,
} from "@/lib/scoring";
import {
  getAppealSummary,
  bandKey,
  formatGbp,
  BAND_ANNUAL,
  likelyLowerBand,
} from "@/lib/appealEstimates";

function formatPostcode(pc: string) {
  return pc.replace(/(.{3})$/, " $1");
}

function formatDistanceMiles(miles?: number): string {
  if (typeof miles !== "number" || !Number.isFinite(miles)) return "";
  if (miles < 0.1) return "<0.1 mi";
  return `${miles.toFixed(2)} mi`;
}

/** Band pill — matches the app's BandPill */
function BandPill({
  letter,
  tone = "ink",
  big = false,
}: {
  letter: string;
  tone?: "ink" | "forest" | "accent";
  big?: boolean;
}) {
  const bg =
    tone === "forest"
      ? "bg-forest text-paper"
      : tone === "accent"
        ? "bg-accent text-paper"
        : "bg-ink text-paper";
  if (big) {
    return (
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-[10px] text-[22px] font-bold shadow-sm ${bg}`}
      >
        {letter}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-[7px] text-sm font-bold shadow-sm ${bg}`}
    >
      {letter}
    </span>
  );
}

/** Horizontal band ladder — A to H with dots for nearby props */
function BandLadder({
  userBand,
  bands,
}: {
  userBand: string;
  bands: string[];
}) {
  const allBands = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const userKey = bandKey(userBand);
  const userRank = councilTaxBandIndex(userBand);

  const counts: Record<string, number> = {};
  for (const b of bands) {
    const k = bandKey(b);
    counts[k] = (counts[k] ?? 0) + 1;
  }

  return (
    <div className="rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
        Where you sit
      </p>
      <div className="flex items-end gap-1.5">
        {allBands.map((b) => {
          const rank = councilTaxBandIndex(b);
          const isUser = b === userKey;
          const isLower = rank < userRank;
          const count = counts[b] ?? 0;
          return (
            <div key={b} className="flex flex-1 flex-col items-center gap-1">
              {/* dot stack */}
              <div className="flex min-h-6 flex-col-reverse items-center gap-0.5">
                {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${isLower ? "bg-forest" : "bg-ink-3"}`}
                  />
                ))}
                {count > 5 ? (
                  <span className="text-[9px] font-bold text-ink-3">+{count - 5}</span>
                ) : null}
              </div>
              {/* band box */}
              <div
                className={`flex h-9 w-full items-center justify-center rounded-md text-sm font-bold transition-all ${
                  isUser
                    ? "bg-accent text-paper shadow-btn-accent scale-110"
                    : isLower
                      ? "bg-forest/10 text-forest"
                      : "bg-ink/5 text-ink-3"
                }`}
              >
                {b}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-ink-3">
        <span className="font-semibold text-accent">{userKey}</span> = your band ·{" "}
        <span className="font-semibold text-forest">green</span> = lower band (potential match)
      </p>
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
              We couldn&apos;t analyze this postcode right now. Please try again.
            </p>
            <p className="mt-6">
              <Link href="/" className="text-sm font-medium text-accent underline-offset-4 hover:text-accent-deep hover:underline">
                ← Try another postcode
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { userBand, nearbyProperties } = apiData;
  const count = nearbyProperties.length;
  const user = bandKey(userBand);
  const lowerBand = likelyLowerBand(userBand, nearbyProperties.map((p) => p.band));
  const currentAnnual = BAND_ANNUAL[user] ?? BAND_ANNUAL.D;
  const reducedAnnual = lowerBand ? (BAND_ANNUAL[lowerBand] ?? currentAnnual) : currentAnnual;
  const { lowerCount } = calculateCaseStrengthScore(userBand, nearbyProperties);

  const appealComparables = nearbyProperties
    .filter((p) => isBandLowerThan(p.band, userBand))
    .slice(0, 5)
    .map((p) => ({ address: p.address, band: p.band }));
  const comparablesQuery = encodeURIComponent(JSON.stringify(appealComparables));
  const summaryHref = `/summary/${encodeURIComponent(compact)}`;
  const appealHref = `/appeal?postcode=${encodeURIComponent(compact)}&band=${encodeURIComponent(userBand)}&comparables=${comparablesQuery}`;

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-10 text-ink">

        {/* Back */}
        <Link href="/" className="text-sm text-ink-2 transition-colors hover:text-ink">
          ← Back
        </Link>

        {/* Your home card */}
        <div className="mt-5 rounded-editorial border border-hairline bg-paper-card p-5 shadow-editorial-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Your home
          </p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-serif text-xl text-ink">{formatted}</p>
              <p className="mt-0.5 font-mono text-xs text-ink-3">
                {formatted} · Council tax band {user}
              </p>
            </div>
            <BandPill letter={user} tone="accent" big />
          </div>

          {lowerBand ? (
            <div className="mt-4 flex items-stretch gap-0 divide-x divide-hairline rounded-xl border border-hairline">
              <div className="flex-1 px-4 py-3 text-center">
                <p className="font-serif text-lg text-ink">{formatGbp(currentAnnual)}</p>
                <p className="mt-0.5 text-[11px] text-ink-3">this year (band {user})</p>
              </div>
              <div className="flex-1 px-4 py-3 text-center">
                <p className="font-serif text-lg text-forest">{formatGbp(reducedAnnual)}</p>
                <p className="mt-0.5 text-[11px] text-ink-3">if reduced to {lowerBand}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Band ladder */}
        <div className="mt-4">
          <BandLadder
            userBand={userBand}
            bands={nearbyProperties.map((p) => p.band)}
          />
        </div>

        {/* Property list */}
        {count > 0 ? (
          <div className="mt-4">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              Comparable properties
            </p>
            <div className="overflow-hidden rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
              {nearbyProperties.map((row, index) => {
                const match = isBandLowerThan(row.band, userBand);
                return (
                  <div
                    key={`${row.address}-${index}`}
                    className={`flex items-center gap-3 px-4 py-3.5 ${
                      index > 0 ? "border-t border-hairline" : ""
                    } ${!match ? "bg-ink/[0.015]" : ""}`}
                  >
                    <BandPill letter={bandKey(row.band)} tone={match ? "forest" : "ink"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{row.address}</p>
                      {row.distanceMiles !== undefined ? (
                        <p className="font-mono text-[10.5px] text-ink-3">
                          {formatDistanceMiles(row.distanceMiles)}
                        </p>
                      ) : null}
                    </div>
                    {match ? (
                      <span className="rounded-md bg-forest/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-forest">
                        match
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 px-1 text-xs text-ink-3">
              <span className="font-semibold text-forest">{lowerCount} of {count}</span> sit in a lower band than yours
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-editorial border border-hairline bg-paper-card px-6 py-8 text-center shadow-editorial-sm">
            <p className="text-sm font-medium text-ink">No comparable properties found</p>
            <p className="mt-2 text-sm text-ink-3">
              We couldn&apos;t find nearby matches, but you can still continue to the appeal builder.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 space-y-3">
          <Link
            href={summaryHref}
            className="flex min-h-14 w-full items-center justify-center rounded-xl bg-accent px-8 text-[15px] font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5"
          >
            See your case →
          </Link>
          <Link
            href={appealHref}
            className="flex min-h-12 w-full items-center justify-center rounded-xl border border-hairline bg-paper-card px-8 text-sm font-medium text-ink-2 shadow-editorial-sm transition-all hover:bg-paper-2/50"
          >
            Skip to Appeal Builder
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-ink-3">
          Results are based on Land Registry &amp; VOA data. Used as a guide only.
        </p>
      </main>
    </div>
  );
}
