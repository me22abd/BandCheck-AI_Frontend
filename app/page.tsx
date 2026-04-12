"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search, FileText, Home as HomeIcon, Lock } from "lucide-react";
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

          <section id="how-it-works" className="mx-auto mt-16 w-full max-w-4xl sm:mt-20">
            <h2 className="text-center text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              How it works
            </h2>

            {/* Mobile: vertical step list with connector line */}
            <div className="mt-8 flex flex-col gap-0 sm:hidden">
              {[
                {
                  n: "1",
                  title: "Enter postcode",
                  body: "We validate your postcode and find nearby comparable homes.",
                  icon: "🏠",
                },
                {
                  n: "2",
                  title: "Compare bands",
                  body: "See how your band compares against similar properties nearby.",
                  icon: "📊",
                },
                {
                  n: "3",
                  title: "Start appeal",
                  body: "If you have a strong case, begin your appeal in minutes.",
                  icon: "✅",
                },
              ].map((step, i, arr) => (
                <div key={step.n} className="flex gap-4">
                  {/* Left: number + connector */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/30">
                      {step.n}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="mt-1 w-0.5 flex-1 bg-gradient-to-b from-blue-300 to-blue-100" style={{ minHeight: "2.5rem" }} />
                    )}
                  </div>
                  {/* Right: content */}
                  <div className={`flex-1 pb-6 text-left${i === arr.length - 1 ? "" : ""}`}>
                    <p className="text-base font-semibold text-gray-900">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: 3-column card grid */}
            <div className="mt-8 hidden gap-4 sm:grid sm:grid-cols-3">
              {[
                {
                  n: "1",
                  title: "Enter postcode",
                  body: "We validate your postcode and find nearby comparable homes.",
                },
                {
                  n: "2",
                  title: "Compare bands",
                  body: "See how your band compares against similar properties nearby.",
                },
                {
                  n: "3",
                  title: "Start appeal",
                  body: "If you have a strong case, begin your appeal in minutes.",
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/30">
                    {step.n}
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {step.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="about" className="mx-auto mt-20 w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
                About
              </p>
              <h2 className="mt-2 text-xl font-semibold text-gray-900">
                Built for UK homeowners
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                We help homeowners identify whether they are overpaying council
                tax by comparing their property with nearby homes. Our platform
                provides clear, structured insights and guides you through the
                appeal process with confidence — no jargon, no solicitors needed.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  { icon: <Search className="h-5 w-5 text-gray-600" />, text: "Instant postcode analysis" },
                  { icon: <FileText className="h-5 w-5 text-gray-600" />, text: "Structured appeal pack generated for you" },
                  { icon: <HomeIcon className="h-5 w-5 text-gray-600" />, text: "Real comparable property data" },
                  { icon: <Lock className="h-5 w-5 text-gray-600" />, text: "Secure — your data is never shared" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    {icon}
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="pricing" className="mx-auto mt-8 w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
                Pricing
              </p>
              <h2 className="mt-2 text-xl font-semibold text-gray-900">
                Free to check. Only pay if you save.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
                No upfront cost, no subscription. We take a small percentage of
                the savings you receive — so we only win when you do.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  "Start your postcode check completely free",
                  "Only pay if your appeal is successful",
                  "We take a small percentage of your refund",
                ].map((line) => (
                  <div key={line} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      ✓
                    </span>
                    <span className="text-sm text-gray-700">{line}</span>
                  </div>
                ))}
              </div>
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
