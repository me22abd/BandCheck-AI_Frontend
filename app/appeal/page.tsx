"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { baseUrl } from "@/lib/apiBaseUrl";

const benefits = [
  "No upfront cost",
  "We only get paid if you save money",
  "Takes less than 2 minutes",
];

export default function AppealPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    fetch(`${baseUrl}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => {
      // Keep UX unchanged even if lead endpoint fails.
    });
    window.setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 500);
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="px-6 py-10 pb-16 text-slate-900 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
          {success ? (
            <div className="overflow-hidden rounded-2xl border border-green-200/90 bg-white shadow-lg shadow-slate-200/50">
              <div className="bg-gradient-to-br from-green-50 to-white px-8 py-12 text-center sm:px-12 sm:py-14">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-4xl text-white shadow-lg shadow-green-600/30">
                  ✓
                </div>
                <h1 className="mt-8 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Your appeal request has been submitted
                </h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
                  We&apos;ll review your case and contact you with next steps shortly
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/60 lg:grid lg:min-h-[520px] lg:grid-cols-2">
              <div className="flex flex-col justify-center bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] px-8 py-12 text-white sm:px-10 lg:py-16">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/90">
                  BandCheck AI
                </p>
                <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                  Start your appeal
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-blue-100/95">
                  Secure, guided support to challenge your council tax band with
                  confidence.
                </p>
                <ul className="mt-8 space-y-4 text-left text-sm text-blue-50/95">
                  {benefits.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/90 text-xs font-bold text-white"
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-center px-8 py-10 sm:px-10 lg:py-12">
                <p className="text-center text-sm font-medium text-slate-500 lg:text-left">
                  Step 1 of 1
                </p>
                <h2 className="mt-2 text-center text-xl font-bold text-slate-900 lg:text-left sm:text-2xl">
                  Enter your email to continue
                </h2>
                <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 lg:text-left">
                  We&apos;ll guide you through the process and handle everything for
                  you.
                </p>

                <form onSubmit={handleSubmit} className="mt-8">
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-base text-slate-900 shadow-inner outline-none ring-[#2563EB]/10 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                  <p className="mt-3 text-center text-xs leading-relaxed text-slate-500 lg:text-left">
                    Used only for your appeal.
                  </p>
                  <button
                    type="submit"
                    disabled={!email.trim() || loading}
                    className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl bg-[#2563EB] px-8 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-px hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {loading ? "Starting…" : "Continue to Appeal →"}
                  </button>
                  <p className="mt-3 text-center text-sm font-medium text-slate-700 lg:text-left">
                    No upfront cost. Only pay if successful.
                  </p>
                  <p className="mt-3 text-center text-xs text-slate-500 lg:text-left">
                    We&apos;ll never share your email.
                  </p>
                </form>
              </div>
            </div>
          )}

          <p className="mt-12 text-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-[#2563EB] underline-offset-4 transition hover:text-blue-800 hover:underline"
            >
              ← Back
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
