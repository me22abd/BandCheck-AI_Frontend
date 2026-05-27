import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { baseUrl } from "@/lib/apiBaseUrl";
import { councilTaxBandIndex } from "@/lib/scoring";

type CheckResponse = {
  userBand: string;
  nearbyProperties: Array<{
    address: string;
    band: string;
    distanceMiles?: number;
  }>;
};

function formatPostcode(pc: string) {
  return pc.replace(/(.{3})$/, " $1");
}

function bandBadgeClass(band: string, userBand: string): string {
  const base = "px-2 py-1 text-xs font-semibold rounded-md";
  const d = councilTaxBandIndex(band) - councilTaxBandIndex(userBand);
  if (d < 0) return `${base} bg-forest/10 text-forest`;
  if (d === 0) return `${base} bg-ink/5 text-ink-2`;
  return `${base} bg-accent/10 text-accent`;
}

function bandDifferenceLabel(propertyBand: string, userBand: string): string {
  const d =
    councilTaxBandIndex(propertyBand) - councilTaxBandIndex(userBand);
  if (d === 0) return "0";
  return d > 0 ? `+${d}` : `${d}`;
}

function bandDifferenceTone(propertyBand: string, userBand: string): string {
  const d =
    councilTaxBandIndex(propertyBand) - councilTaxBandIndex(userBand);
  if (d < 0) return "font-medium text-forest";
  if (d === 0) return "text-ink-3";
  return "font-medium text-accent";
}

function formatDistanceMiles(miles?: number): string {
  if (typeof miles !== "number" || !Number.isFinite(miles)) return "—";
  if (miles < 0.1) return "<0.1 mi";
  return `${miles.toFixed(2)} mi`;
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ postcode: string }>;
}) {
  const { postcode: postcodeParam } = await params;
  const decodedPostcode = decodeURIComponent(postcodeParam);
  const compact = decodedPostcode.replace(/\s+/g, "").toUpperCase();
  const formatted = formatPostcode(compact);
  const resultsHref = `/results/${encodeURIComponent(compact)}`;

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
              We couldn&apos;t load comparison data right now. Please try again.
            </p>
            <p className="mt-6">
              <Link
                href={resultsHref}
                className="text-sm font-medium text-accent underline-offset-4 transition hover:text-accent-deep hover:underline"
              >
                ← Back to results
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const { userBand, nearbyProperties } = apiData;
  const mockProperties = nearbyProperties;
  const count = mockProperties.length;
  const hasComparable = count > 0;

  let lowerBands = 0;
  let sameBand = 0;
  let higherBands = 0;
  const userIdx = councilTaxBandIndex(userBand);
  for (const p of mockProperties) {
    const pi = councilTaxBandIndex(p.band);
    if (pi < userIdx) lowerBands += 1;
    else if (pi === userIdx) sameBand += 1;
    else higherBands += 1;
  }

  const summaryHref = `/summary/${encodeURIComponent(compact)}`;

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 text-ink">
        <div className="space-y-6">

          {/* Header */}
          <div>
            <Link
              href={resultsHref}
              className="text-sm text-ink-2 transition-colors hover:text-ink"
            >
              ← Back
            </Link>
            <h1 className="mt-4 font-serif text-2xl text-ink">
              Comparable Properties
            </h1>
            <p className="mt-1 text-sm text-ink-2">
              We found {count} similar propert{count === 1 ? "y" : "ies"} near {formatted}.
            </p>
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-editorial border border-hairline bg-paper-card shadow-editorial-sm">
            {hasComparable ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-hairline bg-paper-2/50">
                      {["Address", "Distance", "Band", "Your Band", "Difference"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockProperties.map((row, index) => (
                      <tr
                        key={`${row.address}-${index}`}
                        className="border-b border-hairline transition-colors last:border-b-0 hover:bg-paper-2/30"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-ink">
                          {row.address}
                        </td>
                        <td className="px-4 py-3 text-sm tabular-nums text-ink-3">
                          {formatDistanceMiles(row.distanceMiles)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={bandBadgeClass(row.band, userBand)}>
                            {row.band}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={bandBadgeClass(userBand, userBand)}>
                            {userBand}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm tabular-nums ${bandDifferenceTone(row.band, userBand)}`}>
                          {bandDifferenceLabel(row.band, userBand)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">
                  No comparable properties found in your area
                </p>
                <p className="mt-2 text-sm text-ink-3">
                  Try another postcode or check back later.
                </p>
              </div>
            )}
          </div>

          {/* Summary cards */}
          {hasComparable ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Lower Bands", value: lowerBands, color: "text-forest" },
                { label: "Same Band",   value: sameBand,   color: "text-ink" },
                { label: "Higher Bands",value: higherBands,color: "text-accent"  },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-editorial border border-hairline bg-paper-card p-4 text-center shadow-editorial-sm"
                >
                  <p className={`text-lg font-semibold ${color}`}>{value}</p>
                  <p className="mt-1 text-xs text-ink-3">{label}</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* CTA */}
          {hasComparable ? (
            <Link
              href={summaryHref}
              className="flex min-h-14 w-full items-center justify-center rounded-xl bg-accent px-8 text-lg font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5"
            >
              Start Your Appeal →
            </Link>
          ) : (
            <Link
              href={resultsHref}
              className="text-sm text-ink-2 underline-offset-4 transition hover:text-ink hover:underline"
            >
              ← Back to results
            </Link>
          )}

        </div>
      </main>
    </div>
  );
}
