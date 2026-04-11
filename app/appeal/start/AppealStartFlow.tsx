"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

type PropertyDetails = {
  propertyType: "house" | "flat" | "other" | "";
  ownership: "owner" | "tenant" | "";
  extensions: "yes" | "no" | "";
  notes: string;
};

type EvidenceState = {
  councilTaxBill: boolean;
  propertyPhotos: boolean;
  floorplan: boolean;
  extensionHistory: boolean;
  notes: string;
};

type AppealComparableRow = { address: string; band: string };

const evidenceKeys = [
  "councilTaxBill",
  "propertyPhotos",
  "floorplan",
  "extensionHistory",
] as const;

function parseComparablesParam(raw: string | null): AppealComparableRow[] {
  if (!raw?.trim()) return [];
  try {
    const decoded = decodeURIComponent(raw);
    const parsed: unknown = JSON.parse(decoded);
    if (!Array.isArray(parsed)) return [];
    const out: AppealComparableRow[] = [];
    for (const item of parsed.slice(0, 5)) {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const address = String(o.address ?? "").trim();
        const band = String(o.band ?? "").trim();
        if (address || band) {
          out.push({
            address: address || "—",
            band: band || "—",
          });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

function formatPostcodeDisplay(compact: string) {
  const u = compact.replace(/\s+/g, "").toUpperCase();
  if (!u) return "";
  return u.replace(/(.{3})$/, " $1");
}

export default function AppealStartFlow() {
  const searchParams = useSearchParams();
  const [resultsPostcode, setResultsPostcode] = useState("");
  const [resultsBand, setResultsBand] = useState("");
  const [comparables, setComparables] = useState<AppealComparableRow[]>([]);

  useEffect(() => {
    const rawPc = searchParams.get("postcode")?.trim() ?? "";
    const rawBand = searchParams.get("band")?.trim() ?? "";
    setResultsPostcode(rawPc.replace(/\s+/g, "").toUpperCase());
    setResultsBand(rawBand);
    setComparables(parseComparablesParam(searchParams.get("comparables")));
  }, [searchParams]);

  const [step, setStep] = useState(1);
  const [property, setProperty] = useState<PropertyDetails>({
    propertyType: "",
    ownership: "",
    extensions: "",
    notes: "",
  });
  const [evidence, setEvidence] = useState<EvidenceState>({
    councilTaxBill: false,
    propertyPhotos: false,
    floorplan: false,
    extensionHistory: false,
    notes: "",
  });

  const evidenceCompleted = useMemo(() => {
    const checked = evidenceKeys.filter((k) => evidence[k]).length;
    const notesDone = evidence.notes.trim() ? 1 : 0;
    return checked + notesDone;
  }, [evidence]);

  const generatedOn = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  function canProceedStep1(): boolean {
    return (
      property.propertyType !== "" &&
      property.ownership !== "" &&
      property.extensions !== ""
    );
  }

  const hasResultsContext = Boolean(resultsPostcode && resultsBand);
  const hasComparables = comparables.length > 0;
  const formattedPostcode = formatPostcodeDisplay(resultsPostcode);

  const supportingNotesEmpty =
    !property.notes.trim() && !evidence.notes.trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-blue-100/40">
      <SiteHeader />
      <main className="px-6 py-10 pb-16 text-slate-900 sm:py-12">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-slate-500">
            Guided appeal
          </p>
          <h1 className="mt-1 text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Build your appeal case
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-gray-600">
            Step {step} of 4 — walk through property details, evidence, review, and
            your appeal pack.
          </p>

          <div className="mt-8 flex justify-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`h-2 w-8 rounded-full ${
                  n === step ? "bg-blue-600" : "bg-slate-200"
                }`}
                aria-hidden
              />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 1 — Property details
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Property type
                    <select
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={property.propertyType}
                      onChange={(e) =>
                        setProperty((p) => ({
                          ...p,
                          propertyType: e.target.value as PropertyDetails["propertyType"],
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      <option value="house">House</option>
                      <option value="flat">Flat</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Ownership
                    <select
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={property.ownership}
                      onChange={(e) =>
                        setProperty((p) => ({
                          ...p,
                          ownership: e.target.value as PropertyDetails["ownership"],
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                    Extensions since you moved in?
                    <select
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={property.extensions}
                      onChange={(e) =>
                        setProperty((p) => ({
                          ...p,
                          extensions: e.target.value as PropertyDetails["extensions"],
                        }))
                      }
                    >
                      <option value="">Select…</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                    Notes (optional)
                    <textarea
                      rows={4}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Anything else we should know about the property…"
                      value={property.notes}
                      onChange={(e) =>
                        setProperty((p) => ({ ...p, notes: e.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!canProceedStep1()}
                    onClick={() => setStep(2)}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 2 — Evidence checklist
                </h2>
                <p className="text-sm text-gray-600">
                  {evidenceCompleted} of 5 completed
                </p>
                <ul className="space-y-4">
                  {(
                    [
                      ["councilTaxBill", "Council tax bill"],
                      ["propertyPhotos", "Property photos"],
                      ["floorplan", "Floorplan"],
                      ["extensionHistory", "Extension history"],
                    ] as const
                  ).map(([key, label]) => (
                    <li key={key} className="flex items-start gap-3">
                      <input
                        id={key}
                        type="checkbox"
                        checked={evidence[key]}
                        onChange={(e) =>
                          setEvidence((ev) => ({
                            ...ev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={key} className="text-sm text-gray-800">
                        {label}
                      </label>
                    </li>
                  ))}
                </ul>
                <label className="block text-sm font-medium text-gray-700">
                  Additional notes (optional)
                  <textarea
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="List documents you plan to gather…"
                    value={evidence.notes}
                    onChange={(e) =>
                      setEvidence((ev) => ({ ...ev, notes: e.target.value }))
                    }
                  />
                </label>
                <div className="flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 3 — Review
                </h2>
                <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Property details
                  </p>
                  <dl className="mt-3 space-y-2 text-sm text-gray-800">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">Type</dt>
                      <dd className="font-medium capitalize">
                        {property.propertyType || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">Ownership</dt>
                      <dd className="font-medium capitalize">
                        {property.ownership || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">Extensions</dt>
                      <dd className="font-medium capitalize">
                        {property.extensions || "—"}
                      </dd>
                    </div>
                    {property.notes.trim() ? (
                      <div>
                        <dt className="text-gray-600">Notes</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-gray-800">
                          {property.notes}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
                <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Evidence checklist
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-800">
                    <li>
                      Council tax bill:{" "}
                      {evidence.councilTaxBill ? "✓ Ready" : "○ Pending"}
                    </li>
                    <li>
                      Property photos:{" "}
                      {evidence.propertyPhotos ? "✓ Ready" : "○ Pending"}
                    </li>
                    <li>
                      Floorplan: {evidence.floorplan ? "✓ Ready" : "○ Pending"}
                    </li>
                    <li>
                      Extension history:{" "}
                      {evidence.extensionHistory ? "✓ Ready" : "○ Pending"}
                    </li>
                    {evidence.notes.trim() ? (
                      <li className="pt-2 text-gray-600">
                        <span className="font-medium text-gray-800">Notes:</span>{" "}
                        {evidence.notes}
                      </li>
                    ) : null}
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Analysis from your check
                  </p>
                  {hasResultsContext ? (
                    <div className="mt-3 space-y-2 text-sm text-gray-800">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600">Postcode</dt>
                        <dd className="font-medium tabular-nums">
                          {formattedPostcode}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600">Your band</dt>
                        <dd className="font-medium">{resultsBand}</dd>
                      </div>
                      <p className="pt-1 text-gray-700">
                        Based on your results, your property is Band {resultsBand}.
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">
                      Open this guided flow from your results page after a postcode
                      check to include your postcode and band here.
                    </p>
                  )}
                  {hasComparables ? (
                    <div className="mt-4 border-t border-slate-200/80 pt-4">
                      <p className="text-sm text-gray-700">
                        These nearby properties are in a lower council tax band than
                        yours.
                      </p>
                      <ul className="mt-3 space-y-2">
                        {comparables.map((row, i) => (
                          <li
                            key={`${row.address}-${row.band}-${i}`}
                            className="flex justify-between gap-4 border-b border-slate-100 pb-2 text-sm last:border-b-0 last:pb-0"
                          >
                            <span className="min-w-0 flex-1 text-gray-800">
                              {row.address}
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-gray-900">
                              {row.band}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : hasResultsContext ? (
                    <p className="mt-4 border-t border-slate-200/80 pt-4 text-sm text-gray-600">
                      No comparable properties with lower bands were included in this
                      link.
                    </p>
                  ) : null}
                </div>
                <div className="flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Step 4 — Appeal pack
                </h2>

                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <h3 className="text-center text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                    Council Tax Appeal Submission
                  </h3>

                  <section className="mt-12">
                    <h4 className="mb-1 text-lg font-semibold text-gray-900">
                      Section 1 — Property Summary
                    </h4>
                    <dl className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex flex-wrap justify-between gap-4">
                        <dt>Postcode</dt>
                        <dd className="font-medium text-gray-800 tabular-nums">
                          {formattedPostcode || "—"}
                        </dd>
                      </div>
                      <div className="flex flex-wrap justify-between gap-4">
                        <dt>Council tax band</dt>
                        <dd className="font-medium text-gray-800">
                          {resultsBand ? `Band ${resultsBand}` : "—"}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section className="mt-12 border-t border-gray-100 pt-10">
                    <h4 className="mb-1 text-lg font-semibold text-gray-900">
                      Section 2 — Grounds for Appeal
                    </h4>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      This appeal is submitted on the basis that the property&apos;s
                      council tax band may not reflect its value relative to similar
                      homes in the area. Where nearby comparable properties sit in a
                      lower band, that can indicate the listing authority should
                      review whether the current band remains appropriate.
                    </p>
                  </section>

                  <section className="mt-12 border-t border-gray-100 pt-10">
                    <h4 className="mb-1 text-lg font-semibold text-gray-900">
                      Section 3 — Comparable Properties
                    </h4>
                    {hasComparables ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[240px] border-collapse text-left text-sm text-gray-800">
                          <thead>
                            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              <th className="py-2 pr-4 font-semibold">Address</th>
                              <th className="py-2 font-semibold">Band</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparables.map((row, i) => (
                              <tr
                                key={`${row.address}-${row.band}-${i}`}
                                className="border-b border-slate-100 last:border-b-0"
                              >
                                <td className="py-2 pr-4 align-top text-gray-800">
                                  {row.address}
                                </td>
                                <td className="py-2 align-top font-medium tabular-nums">
                                  {row.band}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-600">
                        No comparable properties were included. Open Start Appeal from
                        your results after a postcode check to add them here.
                      </p>
                    )}
                  </section>

                  <section className="mt-12 border-t border-gray-100 pt-10">
                    <h4 className="mb-1 text-lg font-semibold text-gray-900">
                      Why these properties were selected
                    </h4>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      These properties were selected based on proximity to your postcode
                      and similarity in property type where available. Only properties
                      with lower council tax bands were included to support the appeal.
                    </p>
                    {hasComparables ? (
                      <p className="mt-4 text-sm text-gray-600">
                        {comparables.length} comparable properties found within
                        approximately 1km radius
                      </p>
                    ) : (
                      <p className="mt-4 text-sm text-gray-600">
                        No suitable lower-band comparable properties were identified
                        within the selected radius.
                      </p>
                    )}
                  </section>

                  <section className="mt-12 border-t border-gray-100 pt-10">
                    <h4 className="mb-1 text-lg font-semibold text-gray-900">
                      Section 4 — Supporting Notes
                    </h4>
                    {supportingNotesEmpty ? (
                      <p className="mt-4 text-sm italic text-gray-600">
                        No additional notes were added in this session.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
                        {property.notes.trim() ? (
                          <div>
                            <p className="font-medium text-gray-800">
                              Property details
                            </p>
                            <p className="mt-1 whitespace-pre-wrap">
                              {property.notes}
                            </p>
                          </div>
                        ) : null}
                        {evidence.notes.trim() ? (
                          <div>
                            <p className="font-medium text-gray-800">Evidence</p>
                            <p className="mt-1 whitespace-pre-wrap">
                              {evidence.notes}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </section>

                  <section className="mt-12 border-t border-gray-100 pt-10">
                    <h4 className="mb-1 text-lg font-semibold text-gray-900">
                      Section 5 — Data &amp; Methodology
                    </h4>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      This assessment is based on nearby property comparisons and
                      available postcode data.
                    </p>
                  </section>

                  <section className="mt-10 border-t border-gray-100 pt-10">
                    <h4 className="mb-1 text-xs font-semibold text-gray-500">
                      Important Information
                    </h4>
                    <p className="mt-3 text-xs leading-relaxed text-gray-500">
                      This document is provided for guidance purposes only and does not
                      constitute legal advice. While care has been taken to present
                      accurate and relevant information, users should verify all
                      details before submitting an appeal to their local authority.
                    </p>
                  </section>

                  <p className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-gray-500">
                    Generated by BandCheck AI on {generatedOn}
                  </p>
                </div>

                <div className="mt-10">
                  <p className="text-center text-sm font-medium text-gray-800">
                    What would you like to do next?
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm opacity-60 disabled:pointer-events-none"
                    >
                      Download Appeal Pack (coming soon)
                    </button>
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-gray-500 shadow-sm opacity-80 disabled:pointer-events-none"
                    >
                      View council submission guidance (coming soon)
                    </button>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700"
                  >
                    Finish
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            <Link href="/appeal" className="font-medium text-blue-600 hover:underline">
              ← Back to appeal entry
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
