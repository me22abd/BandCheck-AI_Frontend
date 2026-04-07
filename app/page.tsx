"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export default function Home() {
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = normalizePostcode(postcode.trim());
    if (!normalized) return;
    setLoading(true);
    router.push(`/results/${encodeURIComponent(normalized)}`);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-white via-blue-50/50 to-slate-50">
      <SiteHeader />

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-12 sm:pb-36 sm:pt-16">
        <div className="relative z-10 w-full max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.15]">
            Check if you&apos;re overpaying council tax
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-base leading-relaxed text-slate-600 sm:text-lg">
            We compare your property with nearby homes to see if you have a strong
            case for a lower band.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 w-full max-w-xl"
          >
            <label htmlFor="postcode" className="sr-only">
              Postcode
            </label>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-lg shadow-slate-200/60 sm:flex-row sm:items-center sm:gap-0 sm:p-2">
              <input
                id="postcode"
                name="postcode"
                type="text"
                autoComplete="postal-code"
                placeholder="Enter your postcode (e.g. LU1 2AB)"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="min-h-12 w-full flex-1 rounded-xl border-0 bg-transparent px-4 text-left text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:ring-0 sm:min-h-14"
              />
              <button
                type="submit"
                disabled={!postcode.trim() || loading}
                className="min-h-12 shrink-0 rounded-xl bg-[#2563EB] px-8 text-base font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:min-h-12 sm:rounded-lg"
              >
                {loading ? "Checking..." : "Check Now →"}
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600" aria-hidden>
                ✓
              </span>
              No cost upfront
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600" aria-hidden>
                ⏱
              </span>
              Takes 30 seconds
            </span>
          </div>

          <section className="mx-auto mt-14 w-full max-w-4xl">
            <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              How it works
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-md shadow-slate-200/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 1
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  Enter postcode
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  We validate your postcode and find nearby comparable homes.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-md shadow-slate-200/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 2
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  Compare bands
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  See how your band compares, with a clear breakdown table.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-md shadow-slate-200/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 3
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  Start appeal
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  If you have a strong case, begin your appeal in minutes.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-100/30 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-10 opacity-[0.12]"
          aria-hidden
        >
          <svg width="72" height="48" viewBox="0 0 72 48" className="text-slate-800">
            <path fill="currentColor" d="M36 4L8 28h8v16h16V36h8v8h16V28h8L36 4z" />
          </svg>
          <svg width="72" height="48" viewBox="0 0 72 48" className="text-slate-800">
            <path fill="currentColor" d="M36 8L12 28h6v12h12V32h8v8h12V28h6L36 8z" />
          </svg>
          <svg width="72" height="48" viewBox="0 0 72 48" className="hidden text-slate-800 sm:block">
            <path fill="currentColor" d="M36 6L10 26h9v14h14V34h8v6h14V26h9L36 6z" />
          </svg>
        </div>
      </main>
    </div>
  );
}
