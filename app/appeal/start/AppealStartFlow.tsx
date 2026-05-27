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

const STEP_NAV = [
  { n: 1, label: "Details" },
  { n: 2, label: "Evidence" },
  { n: 3, label: "Review" },
  { n: 4, label: "Submit" },
] as const;

const STEP_COPY: Record<
  number,
  { title: string; subtitle: string }
> = {
  1: {
    title: "Appeal Details",
    subtitle: "Let's start with some basic information.",
  },
  2: {
    title: "Evidence",
    subtitle: "Tell us which documents you have or plan to gather.",
  },
  3: {
    title: "Review",
    subtitle: "Check your details before generating your appeal pack.",
  },
  4: {
    title: "Appeal pack",
    subtitle: "Your submission summary and next steps.",
  },
};

const inputClass =
  "w-full rounded-xl border border-hairline bg-paper-card px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/30";

const labelClass = "text-sm font-medium text-ink-2 mb-1 block";

const sectionBlockClass =
  "border border-hairline rounded-editorial bg-paper-card p-4 mb-4";

const primaryBtnClass =
  "inline-flex items-center justify-center rounded-xl bg-accent px-6 py-2 text-sm font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep disabled:pointer-events-none disabled:opacity-50";

const secondaryBtnClass =
  "inline-flex items-center justify-center rounded-xl border border-hairline bg-paper-card px-6 py-2 text-sm font-semibold text-ink transition-all hover:bg-paper-2/50 disabled:pointer-events-none disabled:opacity-50";

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

function buildAppealBackHref(sp: URLSearchParams): string {
  const qp = new URLSearchParams();
  const pc = sp.get("postcode")?.trim() ?? "";
  const band = sp.get("band")?.trim() ?? "";
  const comp = sp.get("comparables")?.trim() ?? "";
  const postcode = pc.replace(/\s+/g, "").toUpperCase();
  if (postcode) qp.set("postcode", postcode);
  if (band) qp.set("band", band);
  if (comp) qp.set("comparables", comp);
  const q = qp.toString();
  return q ? `/appeal?${q}` : "/appeal";
}

function togglePillClass(active: boolean) {
  const base =
    "rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";
  return active
    ? `${base} bg-blue-600 text-white shadow-sm`
    : `${base} border border-gray-300 bg-white text-ink-2 hover:bg-gray-100`;
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

  const appealBackHref = useMemo(
    () => buildAppealBackHref(searchParams),
    [searchParams],
  );

  const resultsEditHref = resultsPostcode
    ? `/results/${encodeURIComponent(resultsPostcode)}`
    : "/";

  const copy = STEP_COPY[step] ?? STEP_COPY[1];

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 text-ink">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md">
          <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-gray-200 pb-4">
            <div className="justify-self-start">
              {step === 1 ? (
                <Link href={appealBackHref} className={secondaryBtnClass}>
                  ← Back
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className={secondaryBtnClass}
                >
                  ← Back
                </button>
              )}
            </div>
            <nav
              className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-xs"
              aria-label="Progress"
            >
              {STEP_NAV.map(({ n, label }, i) => (
                <span key={n} className="inline-flex items-center gap-1">
                  {i > 0 ? (
                    <span className="px-1 text-gray-300" aria-hidden>
                      —
                    </span>
                  ) : null}
                  <span
                    className={
                      n === step
                        ? "font-semibold text-accent"
                        : n < step
                          ? "font-medium text-ink-3"
                          : "font-medium text-gray-400"
                    }
                  >
                    <span className="tabular-nums">{n}</span> {label}
                  </span>
                </span>
              ))}
            </nav>
            <span className="hidden sm:block" aria-hidden />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-ink">
              {copy.title}
            </h1>
            <p className="mt-1 text-sm text-ink-2">{copy.subtitle}</p>
          </div>

          <div className="mt-6">
            {step === 1 ? (
              <div>
                <div className={sectionBlockClass}>
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <span className="text-sm font-medium text-ink-2">
                      Property address
                    </span>
                    {hasResultsContext ? (
                      <Link
                        href={resultsEditHref}
                        className="shrink-0 text-sm font-medium text-accent hover:text-blue-800"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                  {hasResultsContext ? (
                    <p className="text-sm text-ink">
                      {formattedPostcode}
                      <span className="text-ink-3"> · </span>
                      Band {resultsBand}
                    </p>
                  ) : (
                    <p className="text-sm text-ink-2">
                      Run a postcode check from the home page to attach your
                      postcode and band to this appeal.
                    </p>
                  )}
                </div>

                <div className={sectionBlockClass}>
                  <p className="mb-3 text-sm font-medium text-ink">
                    Property classification
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelClass}>Property type</span>
                      <select
                        className={inputClass}
                        value={property.propertyType}
                        onChange={(e) =>
                          setProperty((p) => ({
                            ...p,
                            propertyType: e.target
                              .value as PropertyDetails["propertyType"],
                          }))
                        }
                      >
                        <option value="">Select…</option>
                        <option value="house">House</option>
                        <option value="flat">Flat</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className={labelClass}>Ownership</span>
                      <select
                        className={inputClass}
                        value={property.ownership}
                        onChange={(e) =>
                          setProperty((p) => ({
                            ...p,
                            ownership: e.target
                              .value as PropertyDetails["ownership"],
                          }))
                        }
                      >
                        <option value="">Select…</option>
                        <option value="owner">Owner</option>
                        <option value="tenant">Tenant</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className={sectionBlockClass}>
                  <span className={labelClass}>
                    Extensions or major changes since you moved in?
                  </span>
                  <div
                    className="flex gap-2"
                    role="group"
                    aria-label="Extensions or major changes"
                  >
                    <button
                      type="button"
                      aria-pressed={property.extensions === "yes"}
                      onClick={() =>
                        setProperty((p) => ({ ...p, extensions: "yes" }))
                      }
                      className={togglePillClass(property.extensions === "yes")}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      aria-pressed={property.extensions === "no"}
                      onClick={() =>
                        setProperty((p) => ({ ...p, extensions: "no" }))
                      }
                      className={togglePillClass(property.extensions === "no")}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className={sectionBlockClass}>
                  <label className="block">
                    <span className={labelClass}>Notes (optional)</span>
                    <textarea
                      rows={4}
                      className={inputClass}
                      placeholder="Anything else we should know about the property…"
                      value={property.notes}
                      onChange={(e) =>
                        setProperty((p) => ({ ...p, notes: e.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={!canProceedStep1()}
                    onClick={() => setStep(2)}
                    className={primaryBtnClass}
                  >
                    Save &amp; Continue →
                  </button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <div className={sectionBlockClass}>
                  <p className="mb-3 text-sm text-ink-2">
                    {evidenceCompleted} of 5 completed
                  </p>
                  <ul className="space-y-3">
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
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-accent focus:ring-blue-500"
                        />
                        <label
                          htmlFor={key}
                          className="text-sm font-medium text-gray-800"
                        >
                          {label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={sectionBlockClass}>
                  <label className="block">
                    <span className={labelClass}>
                      Additional notes (optional)
                    </span>
                    <textarea
                      rows={3}
                      className={inputClass}
                      placeholder="List documents you plan to gather…"
                      value={evidence.notes}
                      onChange={(e) =>
                        setEvidence((ev) => ({ ...ev, notes: e.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className={primaryBtnClass}
                  >
                    Save &amp; Continue →
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <div className={sectionBlockClass}>
                  <p className="mb-3 text-sm font-semibold text-ink">
                    Property details
                  </p>
                  <dl className="space-y-2 text-sm text-gray-800">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-2">Type</dt>
                      <dd className="font-medium capitalize">
                        {property.propertyType || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-2">Ownership</dt>
                      <dd className="font-medium capitalize">
                        {property.ownership || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-2">Extensions</dt>
                      <dd className="font-medium capitalize">
                        {property.extensions || "—"}
                      </dd>
                    </div>
                    {property.notes.trim() ? (
                      <div>
                        <dt className="text-ink-2">Notes</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-gray-800">
                          {property.notes}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className={sectionBlockClass}>
                  <p className="mb-3 text-sm font-semibold text-ink">
                    Evidence checklist
                  </p>
                  <ul className="space-y-1 text-sm text-gray-800">
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
                      <li className="pt-2 text-ink-2">
                        <span className="font-medium text-gray-800">Notes:</span>{" "}
                        {evidence.notes}
                      </li>
                    ) : null}
                  </ul>
                </div>

                <div className={sectionBlockClass}>
                  <p className="mb-3 text-sm font-semibold text-ink">
                    Analysis from your check
                  </p>
                  {hasResultsContext ? (
                    <div className="space-y-2 text-sm text-gray-800">
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-2">Postcode</dt>
                        <dd className="font-medium tabular-nums">
                          {formattedPostcode}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-2">Your band</dt>
                        <dd className="font-medium">{resultsBand}</dd>
                      </div>
                      <p className="text-ink-2">
                        Based on your results, your property is Band {resultsBand}.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-2">
                      Open this guided flow from your results page after a postcode
                      check to include your postcode and band here.
                    </p>
                  )}
                  {hasComparables ? (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <p className="text-sm text-ink-2">
                        These nearby properties are in a lower council tax band than
                        yours.
                      </p>
                      <ul className="mt-3 space-y-2">
                        {comparables.map((row, i) => (
                          <li
                            key={`${row.address}-${row.band}-${i}`}
                            className="flex justify-between gap-4 border-b border-gray-100 pb-2 text-sm last:border-b-0 last:pb-0"
                          >
                            <span className="min-w-0 flex-1 text-gray-800">
                              {row.address}
                            </span>
                            <span className="shrink-0 font-medium tabular-nums text-ink">
                              {row.band}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : hasResultsContext ? (
                    <p className="mt-4 border-t border-gray-200 pt-4 text-sm text-ink-2">
                      No comparable properties with lower bands were included in this
                      link.
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className={primaryBtnClass}
                  >
                    Save &amp; Continue →
                  </button>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <div className={sectionBlockClass}>
                  <h2 className="text-base font-semibold text-ink">
                    Council Tax Appeal Submission
                  </h2>
                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    Section 1 — Property Summary
                  </h3>
                  <dl className="mt-2 space-y-2 text-sm text-ink-2">
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
                </div>

                <div className={sectionBlockClass}>
                  <h3 className="text-sm font-semibold text-ink">
                    Section 2 — Grounds for Appeal
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    This appeal is submitted on the basis that the property&apos;s
                    council tax band may not reflect its value relative to similar
                    homes in the area. Where nearby comparable properties sit in a
                    lower band, that can indicate the listing authority should review
                    whether the current band remains appropriate.
                  </p>
                </div>

                <div className={sectionBlockClass}>
                  <h3 className="text-sm font-semibold text-ink">
                    Section 3 — Comparable Properties
                  </h3>
                  {hasComparables ? (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[240px] border-collapse text-left text-sm text-gray-800">
                        <thead>
                          <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-ink-3">
                            <th className="py-2 pr-4 font-semibold">Address</th>
                            <th className="py-2 font-semibold">Band</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparables.map((row, i) => (
                            <tr
                              key={`${row.address}-${row.band}-${i}`}
                              className="border-b border-gray-100 last:border-b-0"
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
                    <p className="mt-2 text-sm text-ink-2">
                      No comparable properties were included. Open Start Appeal from
                      your results after a postcode check to add them here.
                    </p>
                  )}
                </div>

                <div className={sectionBlockClass}>
                  <h3 className="text-sm font-semibold text-ink">
                    Why these properties were selected
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    These properties were selected based on proximity to your postcode
                    and similarity in property type where available. Only properties
                    with lower council tax bands were included to support the appeal.
                  </p>
                  {hasComparables ? (
                    <p className="mt-3 text-sm text-ink-2">
                      {comparables.length} comparable properties found within
                      approximately 1km radius
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-ink-2">
                      No suitable lower-band comparable properties were identified
                      within the selected radius.
                    </p>
                  )}
                </div>

                <div className={sectionBlockClass}>
                  <h3 className="text-sm font-semibold text-ink">
                    Section 4 — Supporting Notes
                  </h3>
                  {supportingNotesEmpty ? (
                    <p className="mt-2 text-sm italic text-ink-2">
                      No additional notes were added in this session.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-2">
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
                </div>

                <div className={sectionBlockClass}>
                  <h3 className="text-sm font-semibold text-ink">
                    Section 5 — Data &amp; Methodology
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    This assessment is based on nearby property comparisons and
                    available postcode data.
                  </p>
                </div>

                <div className={sectionBlockClass}>
                  <h3 className="text-xs font-semibold text-ink-3">
                    Important Information
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-3">
                    This document is provided for guidance purposes only and does not
                    constitute legal advice. While care has been taken to present
                    accurate and relevant information, users should verify all details
                    before submitting an appeal to their local authority.
                  </p>
                </div>

                <p className="mb-4 text-center text-xs text-ink-3">
                  Generated by BandCheck AI on {generatedOn}
                </p>

                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    Ready to submit?
                  </p>
                  <p className="mt-1 text-sm text-blue-800/80">
                    Submit your appeal directly to the Valuation Office Agency (VOA) using the information above.
                  </p>
                  <a
                    href="https://www.gov.uk/challenge-council-tax-band"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700"
                  >
                    Submit via GOV.UK →
                  </a>
                </div>

                <div className="mt-6 flex justify-center">
                  <Link href="/" className={`${secondaryBtnClass} text-center`}>
                    ← Back to home
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-3">
          <Link
            href={appealBackHref}
            className="font-medium text-ink-3 underline-offset-4 transition-colors hover:text-gray-800 hover:underline"
          >
            ← Back to appeal entry
          </Link>
        </p>
      </main>
    </div>
  );
}
