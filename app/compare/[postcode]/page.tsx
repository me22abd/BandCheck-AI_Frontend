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

function bandBadgeClass(band: string) {
  const b = band.toUpperCase().replace(/[^A-H]/g, "").charAt(0);
  if (!b) return "bg-slate-100 text-slate-800 ring-slate-600/15";
  if (b <= "C") return "bg-green-100 text-green-800 ring-green-600/25";
  if (b === "D") return "bg-blue-100 text-blue-800 ring-blue-600/25";
  return "bg-red-100 text-red-800 ring-red-600/25";
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
  if (d < 0) return "font-semibold text-green-700";
  if (d === 0) return "font-medium text-slate-600";
  return "font-semibold text-blue-800";
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
      <div className="min-h-screen bg-slate-50">
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

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="px-6 py-10 pb-16 text-slate-900 sm:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-slate-500">
            {formatted}
          </p>
          <h1 className="mt-1 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Comparable properties
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-slate-600 sm:text-lg">
            These properties are similar to yours; compare bands to see how yours
            stacks up.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/40">
            {hasComparable ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/90">
                        <th className="px-4 py-3.5 font-semibold text-slate-700 sm:px-6">
                          Address
                        </th>
                        <th className="px-4 py-3.5 font-semibold text-slate-700 sm:px-6">
                          Distance
                        </th>
                        <th className="px-4 py-3.5 font-semibold text-slate-700 sm:px-6">
                          Band
                        </th>
                        <th className="px-4 py-3.5 font-semibold text-slate-700 sm:px-6">
                          Your band
                        </th>
                        <th className="px-4 py-3.5 font-semibold text-slate-700 sm:px-6">
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockProperties.map((row, index) => (
                        <tr
                          key={`${row.address}-${index}`}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">
                            {row.address}
                          </td>
                          <td className="px-4 py-4 tabular-nums text-slate-500 sm:px-6">
                            {formatDistanceMiles(row.distanceMiles)}
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${bandBadgeClass(row.band)}`}
                            >
                              {row.band}
                            </span>
                          </td>
                          <td className="px-4 py-4 sm:px-6">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${bandBadgeClass(userBand)}`}
                            >
                              {userBand}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-4 tabular-nums sm:px-6 ${bandDifferenceTone(row.band, userBand)}`}
                          >
                            {bandDifferenceLabel(row.band, userBand)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-slate-200 bg-slate-50/80 px-4 py-4 text-sm sm:px-6">
                  <span>
                    <span className="font-medium text-slate-600">
                      Lower bands:{" "}
                    </span>
                    <span className="font-semibold text-red-600">
                      {lowerBands}
                    </span>
                  </span>
                  <span>
                    <span className="font-medium text-slate-600">
                      Same band:{" "}
                    </span>
                    <span className="font-semibold text-slate-700">{sameBand}</span>
                  </span>
                  <span>
                    <span className="font-medium text-slate-600">
                      Higher bands:{" "}
                    </span>
                    <span className="font-semibold text-blue-700">{higherBands}</span>
                  </span>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center sm:px-10">
                <p className="text-base font-medium text-slate-900">
                  No comparable properties found in your band area
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Try another postcode or check back later — we update our data
                  regularly.
                </p>
              </div>
            )}
          </div>

          {hasComparable ? (
            <div className="bandcheck-animate-cta mt-10 space-y-4">
              <p className="text-center text-sm leading-relaxed text-slate-600">
                This suggests you may be eligible to reduce your council tax.
              </p>
              <Link
                href="/appeal"
                className="flex min-h-14 w-full items-center justify-center rounded-xl bg-[#2563EB] px-8 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-px hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Your Appeal →
              </Link>
              <p className="text-center">
                <Link
                  href={resultsHref}
                  className="text-sm font-medium text-[#2563EB] underline-offset-4 transition hover:text-blue-800 hover:underline"
                >
                  ← Back
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-10 text-center">
              <Link
                href={resultsHref}
                className="text-sm font-medium text-[#2563EB] underline-offset-4 transition hover:text-blue-800 hover:underline"
              >
                ← Back to results
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
