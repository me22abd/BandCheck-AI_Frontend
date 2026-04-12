"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, FileText, Home, Lock, TrendingUp, BarChart2 } from "lucide-react";

function BandCheckLogo() {
  return (
    <span className="flex items-center gap-2">
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M10 1.5L2.5 4.5V10C2.5 14 5.8 17.6 10 18.5C14.2 17.6 17.5 14 17.5 10V4.5L10 1.5Z"
          stroke="#3B82F6"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="#EFF6FF"
        />
        <path
          d="M7 10.5L9 12.5L13 8.5"
          stroke="#3B82F6"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tracking-tight">
        <span className="text-base font-semibold text-gray-900">BandCheck</span>
        <span className="text-base font-medium text-blue-500"> AI</span>
      </span>
    </span>
  );
}

// ─── Panel content ────────────────────────────────────────────────────────────

function HowItWorksPanel() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
          How it works
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Three steps to a lower council tax bill
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          The process is straightforward. Most homeowners complete it in under
          five minutes. We do the heavy lifting — you just answer a few
          questions.
        </p>
      </div>

      <div className="space-y-6">
        {[
          {
            n: "1",
            title: "Enter your postcode",
            body: "We instantly look up your current council tax band and find nearby comparable properties. You'll see exactly which homes around you are in a lower band — and why that matters for your case.",
            detail: "Takes under 10 seconds.",
          },
          {
            n: "2",
            title: "Review your comparison",
            body: "We show you a clear table of nearby properties with their council tax bands side by side. If similar homes nearby are paying less than you, that's your evidence. We calculate a case strength score to tell you how strong your position is.",
            detail: "No jargon. Plain English.",
          },
          {
            n: "3",
            title: "Start your appeal",
            body: "If your case looks strong, we guide you through a structured appeal builder. You answer a few questions about your property and we generate a complete appeal pack — ready to submit to the Valuation Office Agency (VOA).",
            detail: "No solicitor needed.",
          },
        ].map((step, i, arr) => (
          <div key={step.n} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/25">
                {step.n}
              </div>
              {i < arr.length - 1 && (
                <div className="mt-2 w-0.5 flex-1 bg-gradient-to-b from-blue-300 to-blue-100" style={{ minHeight: "2rem" }} />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p className="text-base font-semibold text-gray-900">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{step.body}</p>
              <p className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          Ready to check your band?
        </p>
        <p className="mt-1 text-sm text-blue-800/80">
          It&apos;s free and takes 30 seconds. No signup required to check.
        </p>
        <a
          href="/"
          className="mt-3 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700"
        >
          Check my postcode →
        </a>
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
          About
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Built for UK homeowners
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          BandCheck AI was created to tackle a problem most homeowners don&apos;t
          even know they have. Around 1 in 3 UK properties are estimated to be in
          the wrong council tax band — meaning millions of families are
          overpaying every single year without realising it.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
        <p className="text-sm font-semibold text-gray-900">Our mission</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          To make it genuinely easy for any homeowner to check, challenge, and
          correct their council tax band — without needing a solicitor, an
          accountant, or hours of research.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          {
            icon: <Search className="h-5 w-5 text-gray-600" />,
            title: "Instant analysis",
            body: "Enter your postcode and see results in seconds, powered by real property data.",
          },
          {
            icon: <BarChart2 className="h-5 w-5 text-gray-600" />,
            title: "Clear comparisons",
            body: "Side-by-side band comparison with nearby similar properties — easy to understand.",
          },
          {
            icon: <FileText className="h-5 w-5 text-gray-600" />,
            title: "Appeal pack",
            body: "We generate a structured appeal document ready for the Valuation Office Agency.",
          },
          {
            icon: <Lock className="h-5 w-5 text-gray-600" />,
            title: "Privacy first",
            body: "Your email and property details are never sold or shared with third parties.",
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-gray-600" />,
            title: "No win, no fee",
            body: "You never pay upfront. We only earn when your appeal succeeds.",
          },
          {
            icon: <Home className="h-5 w-5 text-gray-600" />,
            title: "Real data",
            body: "Comparable property data is sourced from publicly available council tax records.",
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-semibold text-gray-900">{title}</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">{body}</p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-gray-400">
        BandCheck AI is an independent platform. We are not affiliated with the
        Valuation Office Agency, HMRC, or any local authority.
      </p>
    </div>
  );
}

function PricingPanel() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
          Pricing
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Free to check. Only pay if you save.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          We believe everyone should be able to check their council tax band
          without risk. That&apos;s why we charge nothing upfront — we only earn
          a small percentage of the savings you receive if your appeal succeeds.
        </p>
      </div>

      {/* Pricing card */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-xl shadow-blue-600/20">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
          Our model
        </p>
        <p className="mt-2 text-xl font-bold">No win, no fee</p>
        <p className="mt-2 text-sm leading-relaxed text-blue-100">
          You keep the majority of your savings. We take a small success fee
          only if your appeal is accepted and your band is reduced.
        </p>
        <div className="mt-5 space-y-3">
          {[
            "Postcode check — always free",
            "Case strength report — always free",
            "Appeal pack generation — free",
            "Success fee on refund received — small %",
          ].map((line, i) => (
            <div key={line} className="flex items-center gap-3">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 3 ? "bg-white/20 text-white" : "bg-green-400/90 text-white"}`}>
                {i === 3 ? "%" : "✓"}
              </span>
              <span className="text-sm text-blue-50">{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What you could save */}
      <div>
        <p className="text-sm font-semibold text-gray-900">What you could save</p>
        <p className="mt-1 text-xs text-gray-500">Estimates based on average band reductions in England</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { band: "Band D → C", year: "£361/yr", total: "£3,610+" },
            { band: "Band E → D", year: "£480/yr", total: "£4,800+" },
            { band: "Band F → E", year: "£620/yr", total: "£6,200+" },
          ].map(({ band, year, total }) => (
            <div key={band} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-xs font-medium text-gray-500">{band}</p>
              <p className="mt-1 text-base font-bold text-gray-900">{year}</p>
              <p className="text-xs text-gray-500">{total} over 10yrs</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Common questions</p>
        <div className="mt-3 space-y-4">
          {[
            {
              q: "When do I pay the success fee?",
              a: "Only after your appeal is accepted and you receive confirmation of a band reduction from your local council.",
            },
            {
              q: "What if my appeal fails?",
              a: "You pay nothing. The check, case review, and appeal pack are all provided at no cost to you.",
            },
            {
              q: "Is there a minimum saving?",
              a: "No. If your band is reduced by even one band, you benefit — and the fee reflects that saving proportionally.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="text-sm font-medium text-gray-800">{q}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <a
        href="/appeal"
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all duration-150 hover:-translate-y-[1px] hover:bg-blue-700"
      >
        Get started — it&apos;s free →
      </a>
    </div>
  );
}

// ─── Panel shell ──────────────────────────────────────────────────────────────

type PanelKey = "how-it-works" | "about" | "pricing";

const PANEL_CONTENT: Record<PanelKey, React.ReactNode> = {
  "how-it-works": <HowItWorksPanel />,
  about: <AboutPanel />,
  pricing: <PricingPanel />,
};

const NAV_ITEMS: { label: string; key: PanelKey }[] = [
  { label: "How it works", key: "how-it-works" },
  { label: "About", key: "about" },
  { label: "Pricing", key: "pricing" },
];

// ─── Header ───────────────────────────────────────────────────────────────────

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);

  // Close panel on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActivePanel(null);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (activePanel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activePanel]);

  function openPanel(key: PanelKey) {
    setActivePanel(key);
    setMobileOpen(false);
  }

  function closePanel() {
    setActivePanel(null);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity hover:opacity-80"
          >
            <BandCheckLogo />
          </Link>

          <div className="flex items-center gap-6">
            {/* Desktop nav */}
            <nav className="hidden items-center gap-8 text-sm font-medium lg:flex" aria-label="Marketing">
              {NAV_ITEMS.map(({ label, key }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => openPanel(key)}
                  className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
                >
                  {label}
                </button>
              ))}
            </nav>

            <a
              href="/appeal"
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Get Started
            </a>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                  <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            className="border-t border-gray-100 bg-white px-6 pb-4 pt-3 lg:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="space-y-1">
              {NAV_ITEMS.map(({ label, key }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => openPanel(key)}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="/appeal"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* ── Slide-in panel overlay ── */}
      {activePanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden
            onClick={closePanel}
          />

          {/* Panel drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={NAV_ITEMS.find((n) => n.key === activePanel)?.label}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
            style={{ animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <BandCheckLogo />
              <button
                type="button"
                aria-label="Close panel"
                onClick={closePanel}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {PANEL_CONTENT[activePanel]}
            </div>

            {/* Tab switcher at bottom */}
            <div className="border-t border-gray-100 px-6 py-3">
              <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                {NAV_ITEMS.map(({ label, key }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivePanel(key)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
                      activePanel === key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0.6; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  );
}
