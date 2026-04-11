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
            Check if you&apos;re overpaying council tax
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
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

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-gray-600">
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

          <section id="how-it-works" className="mx-auto mt-16 w-full max-w-4xl sm:mt-20">
            <h2 className="text-center text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              How it works
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-lg shadow-slate-200/50 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Step 1
                </p>
                <p className="mt-2 text-base font-semibold text-gray-900">
                  Enter postcode
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  We validate your postcode and find nearby comparable homes.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-lg shadow-slate-200/50 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Step 2
                </p>
                <p className="mt-2 text-base font-semibold text-gray-900">
                  Compare bands
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  See how your band compares, with a clear breakdown table.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-lg shadow-slate-200/50 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Step 3
                </p>
                <p className="mt-2 text-base font-semibold text-gray-900">
                  Start appeal
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  If you have a strong case, begin your appeal in minutes.
                </p>
              </div>
            </div>
          </section>

          <section id="about" className="mx-auto mt-20 w-full max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              About BandCheck AI
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              We help homeowners identify whether they are overpaying council tax
              by comparing their property with nearby homes. Our platform provides
              clear, structured insights and guides users through the appeal process
              with confidence.
            </p>
          </section>

          <section id="pricing" className="mx-auto mt-20 w-full max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Pricing</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600">
              No upfront cost. You only pay if your appeal is successful — we take
              a small percentage of the savings.
            </p>
            <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 text-left">
              {[
                "No upfront cost — start your check for free",
                "Only pay if your appeal is successful",
                "We take a small percentage of your savings",
              ].map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-sm text-gray-700">{line}</span>
                </div>
              ))}
            </div>
          </section>
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
