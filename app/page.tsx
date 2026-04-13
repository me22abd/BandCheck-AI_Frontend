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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-gray-50">
      <SiteHeader />

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-12 sm:pb-36 sm:pt-16">
        <div className="relative z-10 w-full max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-[1.1]">
            1 in 3 UK homes are in the wrong council tax band.{" "}
            <span className="text-blue-600">Is yours one of them?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            The average successful appeal saves £3,000+ in backdated refunds.
            Find out if you&apos;re overpaying in 30 seconds — no paperwork, no
            upfront cost.
          </p>

          <form
            id="postcode-input"
            onSubmit={handleSubmit}
            className="mx-auto mt-10 w-full max-w-xl"
          >
            <label htmlFor="postcode" className="sr-only">
              Postcode
            </label>
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/90 p-2 shadow-xl shadow-slate-200/60 backdrop-blur-sm transition-all duration-200 hover:shadow-2xl sm:flex-row sm:items-center sm:gap-0 sm:p-2">
              <input
                id="postcode"
                name="postcode"
                type="text"
                autoComplete="postal-code"
                placeholder="Enter your postcode (e.g. LU1 2AB)"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="min-h-12 w-full flex-1 rounded-xl border-0 bg-transparent px-4 text-left text-base text-gray-900 outline-none ring-0 placeholder:text-gray-400 focus:ring-0 sm:min-h-14"
              />
              <button
                type="submit"
                disabled={!postcode.trim() || loading}
                className="min-h-12 shrink-0 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-md shadow-blue-600/25 transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:min-h-12 sm:rounded-lg"
              >
                {loading ? "Checking..." : "Check Now →"}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Join 2,000+ homeowners checking their council tax band
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-600">
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

          {/* How it works — preview */}
          <section className="mx-auto mt-16 w-full max-w-4xl sm:mt-20">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">How it works</h2>
              <a href="/how-it-works" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Learn more →
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { n: "1", title: "Enter postcode", body: "We find your band and pull nearby comparable properties instantly." },
                { n: "2", title: "Compare bands", body: "See which nearby homes pay less and get a case strength score." },
                { n: "3", title: "Start appeal", body: "Answer a few questions — we generate a complete appeal pack." },
              ].map((step) => (
                <div key={step.n} className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                    {step.n}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* About + Pricing — side by side previews */}
          <div className="mx-auto mt-8 grid w-full max-w-4xl gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">About</p>
              <h2 className="mt-2 text-base font-semibold text-gray-900">Built for UK homeowners</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                We simplify the council tax appeal process using real property data — no jargon, no solicitors, no upfront cost.
              </p>
              <a href="/about" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                Learn about us →
              </a>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Pricing</p>
              <h2 className="mt-2 text-base font-semibold text-gray-900">Free to check. Only pay if you save.</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                No subscription, no upfront cost. We take a small percentage of your savings — only if your appeal succeeds.
              </p>
              <a href="/pricing" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                See pricing details →
              </a>
            </section>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-blue-200/40 via-blue-100/25 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-0"
          aria-hidden
        >
          <img
            src="/house-bg.svg"
            alt=""
            className="h-[280px] w-full object-cover object-bottom opacity-[0.22] mix-blend-multiply"
            aria-hidden
          />
        </div>
      </main>
    </div>
  );
}
