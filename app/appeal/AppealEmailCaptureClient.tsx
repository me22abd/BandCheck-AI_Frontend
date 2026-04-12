"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { baseUrl } from "@/lib/apiBaseUrl";

const benefits = [
  "No upfront cost",
  "We only get paid if you save money",
  "Takes less than 2 minutes",
];

type Props = {
  appealStartHref: string;
};

export function AppealEmailCaptureClient({ appealStartHref }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setEmail("");
    setLoading(false);
    setConfirmed(false);
  }, [appealStartHref]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    fetch(`${baseUrl}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => {});
    window.setTimeout(() => {
      setLoading(false);
      setConfirmed(true);
    }, 500);
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  // Confirmation screen
  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <main className="mx-auto max-w-lg px-6 py-24 text-center text-gray-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-green-600" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            We&apos;ll be in touch
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Thanks — your details have been received. Our team will review your
            case and email you within 24 hours with next steps.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Sent to <span className="font-medium text-gray-700">{email}</span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={appealStartHref}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:bg-blue-700"
            >
              Continue to Appeal Builder →
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-50"
            >
              Back to home
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-gray-50">
      <SiteHeader />
      <main className="px-6 py-10 pb-16 text-slate-900 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-slate-200/60 transition-all duration-200 hover:shadow-[0_28px_70px_-34px_rgba(15,23,42,0.35)] lg:grid lg:min-h-[520px] lg:grid-cols-2">
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
                  className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? "Submitting…" : "Continue to Appeal →"}
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
