"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { SmallChip } from "@/components/editorial/SmallChip";

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

const STEP_COPY: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Appeal Details", subtitle: "Let's start with some basic information." },
  2: { title: "Evidence", subtitle: "Tell us which documents you have or plan to gather." },
  3: { title: "Review", subtitle: "Check your details before generating your appeal pack." },
  4: { title: "Appeal pack", subtitle: "Your submission summary and next steps." },
};

const inputClass =
  "w-full rounded-xl border border-hairline bg-paper px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-ink-3";

const labelClass = "text-sm font-medium text-ink-2 mb-1 block";

const sectionBlockClass =
  "border border-hairline rounded-editorial bg-paper-card p-4 mb-4";

const primaryBtnClass =
  "inline-flex items-center justify-center rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep disabled:pointer-events-none disabled:opacity-50";

const secondaryBtnClass =
  "inline-flex items-center justify-center rounded-xl border border-hairline bg-paper-card px-6 py-2.5 text-sm font-semibold text-ink transition-all hover:bg-paper-2/50 disabled:pointer-events-none disabled:opacity-50";

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
        if (address || band) out.push({ address: address || "—", band: band || "—" });
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
  const base = "rounded-lg px-5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/40";
  return active
    ? `${base} bg-accent text-paper shadow-btn-accent`
    : `${base} border border-hairline bg-paper text-ink-2 hover:bg-paper-2/50`;
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
    propertyType: "", ownership: "", extensions: "", notes: "",
  });
  const [evidence, setEvidence] = useState<EvidenceState>({
    councilTaxBill: false, propertyPhotos: false, floorplan: false, extensionHistory: false, notes: "",
  });

  const evidenceCompleted = useMemo(() => {
    const checked = evidenceKeys.filter((k) => evidence[k]).length;
    const notesDone = evidence.notes.trim() ? 1 : 0;
    return checked + notesDone;
  }, [evidence]);

  const generatedOn = useMemo(
    () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    [],
  );

  function canProceedStep1(): boolean {
    return property.propertyType !== "" && property.ownership !== "" && property.extensions !== "";
  }

  const hasResultsContext = Boolean(resultsPostcode && resultsBand);
  const hasComparables = comparables.length > 0;
  const formattedPostcode = formatPostcodeDisplay(resultsPostcode);
  const supportingNotesEmpty = !property.notes.trim() && !evidence.notes.trim();

  const appealBackHref = useMemo(() => buildAppealBackHref(searchParams), [searchParams]);
  const resultsEditHref = resultsPostcode ? `/results/${encodeURIComponent(resultsPostcode)}` : "/";
  const copy = STEP_COPY[step] ?? STEP_COPY[1];

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 text-ink">
        <EditorialCard className="overflow-hidden p-0">
          {/* Step header */}
          <div className="flex items-center justify-between gap-4 border-b border-hairline bg-paper-card px-6 py-4">
            <div className="flex items-center gap-2">
              {step === 1 ? (
                <Link href={appealBackHref} className={secondaryBtnClass + " px-4 py-1.5 text-xs"}>
                  ← Back
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className={secondaryBtnClass + " px-4 py-1.5 text-xs"}
                >
                  ← Back
                </button>
              )}
            </div>

            <nav className="flex items-center gap-1 text-xs" aria-label="Progress">
              {STEP_NAV.map(({ n, label }, i) => (
                <span key={n} className="inline-flex items-center gap-1">
                  {i > 0 ? <span className="px-1 text-ink-3" aria-hidden>—</span> : null}
                  <span className={
                    n === step ? "font-semibold text-accent"
                    : n < step ? "font-medium text-ink-3"
                    : "font-medium text-ink-3/40"
                  }>
                    <span className="tabular-nums">{n}</span> {label}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <SmallChip tone="accent" className="mb-3">Step {step} of 4</SmallChip>
            <h1 className="font-serif text-xl text-ink">{copy.title}</h1>
            <p className="mt-1 text-sm text-ink-2">{copy.subtitle}</p>

            <div className="mt-6">
              {/* ── Step 1: Property details ── */}
              {step === 1 ? (
                <div>
                  <div className={sectionBlockClass}>
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-ink-2">Property address</span>
                      {hasResultsContext ? (
                        <Link href={resultsEditHref} className="shrink-0 text-sm font-medium text-accent hover:text-accent-deep">
                          Edit
                        </Link>
                      ) : null}
                    </div>
                    {hasResultsContext ? (
                      <p className="text-sm font-semibold text-ink">
                        {formattedPostcode}
                        <span className="font-normal text-ink-3"> · </span>
                        Band {resultsBand}
                      </p>
                    ) : (
                      <p className="text-sm text-ink-2">
                        Run a postcode check from the home page to attach your postcode and band.
                      </p>
                    )}
                  </div>

                  <div className={sectionBlockClass}>
                    <p className="mb-3 text-sm font-medium text-ink">Property classification</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className={labelClass}>Property type</span>
                        <select
                          className={inputClass}
                          value={property.propertyType}
                          onChange={(e) => setProperty((p) => ({ ...p, propertyType: e.target.value as PropertyDetails["propertyType"] }))}
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
                          onChange={(e) => setProperty((p) => ({ ...p, ownership: e.target.value as PropertyDetails["ownership"] }))}
                        >
                          <option value="">Select…</option>
                          <option value="owner">Owner</option>
                          <option value="tenant">Tenant</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className={sectionBlockClass}>
                    <span className={labelClass}>Extensions or major changes since you moved in?</span>
                    <div className="flex gap-2" role="group">
                      <button type="button" aria-pressed={property.extensions === "yes"} onClick={() => setProperty((p) => ({ ...p, extensions: "yes" }))} className={togglePillClass(property.extensions === "yes")}>Yes</button>
                      <button type="button" aria-pressed={property.extensions === "no"} onClick={() => setProperty((p) => ({ ...p, extensions: "no" }))} className={togglePillClass(property.extensions === "no")}>No</button>
                    </div>
                  </div>

                  <div className={sectionBlockClass}>
                    <label className="block">
                      <span className={labelClass}>Notes (optional)</span>
                      <textarea rows={4} className={inputClass} placeholder="Anything else we should know about the property…" value={property.notes} onChange={(e) => setProperty((p) => ({ ...p, notes: e.target.value }))} />
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button type="button" disabled={!canProceedStep1()} onClick={() => setStep(2)} className={primaryBtnClass}>
                      Save &amp; Continue →
                    </button>
                  </div>
                </div>
              ) : null}

              {/* ── Step 2: Evidence ── */}
              {step === 2 ? (
                <div>
                  <div className={sectionBlockClass}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-3">
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
                        <li key={key} className="flex items-center gap-3">
                          <input
                            id={key}
                            type="checkbox"
                            checked={evidence[key]}
                            onChange={(e) => setEvidence((ev) => ({ ...ev, [key]: e.target.checked }))}
                            className="h-4 w-4 shrink-0 rounded border-hairline accent-accent"
                          />
                          <label htmlFor={key} className="text-sm font-medium text-ink">{label}</label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={sectionBlockClass}>
                    <label className="block">
                      <span className={labelClass}>Additional notes (optional)</span>
                      <textarea rows={3} className={inputClass} placeholder="List documents you plan to gather…" value={evidence.notes} onChange={(e) => setEvidence((ev) => ({ ...ev, notes: e.target.value }))} />
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button type="button" onClick={() => setStep(3)} className={primaryBtnClass}>
                      Save &amp; Continue →
                    </button>
                  </div>
                </div>
              ) : null}

              {/* ── Step 3: Review ── */}
              {step === 3 ? (
                <div>
                  <div className={sectionBlockClass}>
                    <p className="mb-3 text-sm font-semibold text-ink">Property details</p>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-ink-2">Type</dt><dd className="font-medium capitalize text-ink">{property.propertyType || "—"}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-ink-2">Ownership</dt><dd className="font-medium capitalize text-ink">{property.ownership || "—"}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-ink-2">Extensions</dt><dd className="font-medium capitalize text-ink">{property.extensions || "—"}</dd></div>
                      {property.notes.trim() ? <div><dt className="text-ink-2">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-ink">{property.notes}</dd></div> : null}
                    </dl>
                  </div>

                  <div className={sectionBlockClass}>
                    <p className="mb-3 text-sm font-semibold text-ink">Evidence checklist</p>
                    <ul className="space-y-1 text-sm">
                      <li className={evidence.councilTaxBill ? "text-forest" : "text-ink-3"}>Council tax bill: {evidence.councilTaxBill ? "✓ Ready" : "○ Pending"}</li>
                      <li className={evidence.propertyPhotos ? "text-forest" : "text-ink-3"}>Property photos: {evidence.propertyPhotos ? "✓ Ready" : "○ Pending"}</li>
                      <li className={evidence.floorplan ? "text-forest" : "text-ink-3"}>Floorplan: {evidence.floorplan ? "✓ Ready" : "○ Pending"}</li>
                      <li className={evidence.extensionHistory ? "text-forest" : "text-ink-3"}>Extension history: {evidence.extensionHistory ? "✓ Ready" : "○ Pending"}</li>
                      {evidence.notes.trim() ? <li className="pt-2 text-ink-2"><span className="font-medium text-ink">Notes:</span> {evidence.notes}</li> : null}
                    </ul>
                  </div>

                  <div className={sectionBlockClass}>
                    <p className="mb-3 text-sm font-semibold text-ink">Analysis from your check</p>
                    {hasResultsContext ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-4"><dt className="text-ink-2">Postcode</dt><dd className="font-medium tabular-nums text-ink">{formattedPostcode}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-ink-2">Your band</dt><dd className="font-medium text-ink">{resultsBand}</dd></div>
                      </div>
                    ) : (
                      <p className="text-sm text-ink-2">Open this guided flow from your results page to include your postcode and band.</p>
                    )}
                    {hasComparables ? (
                      <div className="mt-4 border-t border-hairline pt-4">
                        <p className="text-sm text-ink-2">Nearby properties in a lower band than yours.</p>
                        <ul className="mt-3 space-y-2">
                          {comparables.map((row, i) => (
                            <li key={`${row.address}-${row.band}-${i}`} className="flex justify-between gap-4 border-b border-hairline pb-2 text-sm last:border-b-0 last:pb-0">
                              <span className="min-w-0 flex-1 text-ink">{row.address}</span>
                              <span className="shrink-0 font-semibold tabular-nums text-accent">Band {row.band}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : hasResultsContext ? (
                      <p className="mt-4 border-t border-hairline pt-4 text-sm text-ink-2">No comparable properties with lower bands were found.</p>
                    ) : null}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button type="button" onClick={() => setStep(4)} className={primaryBtnClass}>
                      Save &amp; Continue →
                    </button>
                  </div>
                </div>
              ) : null}

              {/* ── Step 4: Submit ── */}
              {step === 4 ? (
                <div>
                  <div className={sectionBlockClass}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3">Section 1 — Property Summary</p>
                    <dl className="space-y-2 text-sm">
                      <div className="flex flex-wrap justify-between gap-4"><dt className="text-ink-2">Postcode</dt><dd className="font-medium tabular-nums text-ink">{formattedPostcode || "—"}</dd></div>
                      <div className="flex flex-wrap justify-between gap-4"><dt className="text-ink-2">Council tax band</dt><dd className="font-medium text-ink">{resultsBand ? `Band ${resultsBand}` : "—"}</dd></div>
                    </dl>
                  </div>

                  <div className={sectionBlockClass}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Section 2 — Grounds for Appeal</p>
                    <p className="text-sm leading-relaxed text-ink-2">
                      This appeal is submitted on the basis that the property&apos;s council tax band may not reflect its value relative to similar homes in the area. Where nearby comparable properties sit in a lower band, that can indicate the listing authority should review whether the current band remains appropriate.
                    </p>
                  </div>

                  <div className={sectionBlockClass}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3">Section 3 — Comparable Properties</p>
                    {hasComparables ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[240px] border-collapse text-left text-sm">
                          <thead>
                            <tr className="border-b border-hairline text-xs font-semibold uppercase tracking-wide text-ink-3">
                              <th className="py-2 pr-4 font-semibold">Address</th>
                              <th className="py-2 font-semibold">Band</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparables.map((row, i) => (
                              <tr key={`${row.address}-${row.band}-${i}`} className="border-b border-hairline last:border-b-0">
                                <td className="py-2 pr-4 align-top text-ink">{row.address}</td>
                                <td className="py-2 align-top font-semibold tabular-nums text-accent">Band {row.band}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-ink-2">No comparable properties included. Run a postcode check first to add them here.</p>
                    )}
                  </div>

                  <div className={sectionBlockClass}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Section 4 — Supporting Notes</p>
                    {supportingNotesEmpty ? (
                      <p className="text-sm italic text-ink-3">No additional notes were added in this session.</p>
                    ) : (
                      <div className="space-y-3 text-sm leading-relaxed text-ink-2">
                        {property.notes.trim() ? <div><p className="font-semibold text-ink">Property details</p><p className="mt-1 whitespace-pre-wrap">{property.notes}</p></div> : null}
                        {evidence.notes.trim() ? <div><p className="font-semibold text-ink">Evidence</p><p className="mt-1 whitespace-pre-wrap">{evidence.notes}</p></div> : null}
                      </div>
                    )}
                  </div>

                  <div className={sectionBlockClass}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-2">Section 5 — Data &amp; Methodology</p>
                    <p className="text-sm leading-relaxed text-ink-2">This assessment is based on nearby property comparisons and available postcode data.</p>
                  </div>

                  <p className="mb-4 text-center text-xs text-ink-3">Generated by BandCheck AI on {generatedOn}</p>

                  {/* Submit CTA */}
                  <div className="mb-4 rounded-editorial border border-forest/20 bg-forest/5 p-5">
                    <p className="text-sm font-semibold text-forest">Ready to submit?</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">
                      Submit your appeal directly to the Valuation Office Agency (VOA) using the information above.
                    </p>
                    <a
                      href="https://www.gov.uk/challenge-council-tax-band"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition-all hover:opacity-90"
                    >
                      Submit via GOV.UK →
                    </a>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Link href="/" className={secondaryBtnClass}>← Back to home</Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </EditorialCard>

        <p className="mt-6 text-center text-sm text-ink-3">
          <Link href={appealBackHref} className="font-medium underline-offset-4 transition-colors hover:text-ink hover:underline">
            ← Back to appeal entry
          </Link>
        </p>
      </main>
    </div>
  );
}
