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
  const base = "px-2 py-1 text-xs font-medium rounded-md";
  const d = councilTaxBandIndex(band) - councilTaxBandIndex(userBand);
  if (d < 0) return `${base} bg-green-100 text-green-700`;
  if (d === 0) return `${base} bg-gray-100 text-gray-700`;
  return `${base} bg-red-100 text-red-600`;
}

function userBandBadgeClass(): string {
  return "px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700";
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
  if (d < 0) return "font-medium text-green-600";
  if (d === 0) return "text-gray-500";
  return "font-medium text-red-600";
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
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-gray-50">
        <SiteHeader />
        <main className="px-6 py-16 text-slate-900 sm:py-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <p className="text-base text-slate-700">
              We couldn&apos;t load comparison data right now. Please try again.
            </p>
            <p className="mt-6">
              <Link
                href={resultsHref}
                className="text-sm font-medium text-[#2563EB] underline-offset-4 transition hover:text-blue-800 hover:underline"
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
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 text-gray-900">
        <div className="space-y-6">

          {/* Header */}
          <div>
            <Link
              href={resultsHref}
              className="text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              ← Back
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">
              Comparable Properties
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              We found {count} similar propert{count === 1 ? "y" : "ies"} near {formatted}.
            </p>
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {hasComparable ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {["Address", "Distance", "Band", "Your Band", "Difference"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500"
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
                        className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {row.address}
                        </td>
                        <td className="px-4 py-3 text-sm tabular-nums text-gray-500">
                          {formatDistanceMiles(row.distanceMiles)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={bandBadgeClass(row.band, userBand)}>
                            {row.band}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={userBandBadgeClass()}>
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
                <p className="text-sm font-medium text-gray-900">
                  No comparable properties found in your area
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Try another postcode or check back later.
                </p>
              </div>
            )}
          </div>

          {/* Summary cards */}
          {hasComparable ? (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Lower Bands", value: lowerBands, color: "text-green-600" },
                { label: "Same Band",   value: sameBand,   color: "text-gray-700" },
                { label: "Higher Bands",value: higherBands,color: "text-red-500"  },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
                >
                  <p className={`text-lg font-semibold ${color}`}>{value}</p>
                  <p className="mt-1 text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* CTA */}
          {hasComparable ? (
            <Link
              href={summaryHref}
              className="flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-150 hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Your Appeal →
            </Link>
          ) : (
            <Link
              href={resultsHref}
              className="text-sm text-gray-600 underline-offset-4 transition hover:text-gray-900 hover:underline"
            >
              ← Back to results
            </Link>
          )}

        </div>
      </main>
    </div>
  );
}
