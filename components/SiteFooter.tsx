"use client";

import Link from "next/link";
import { Wordmark } from "@/components/editorial/Wordmark";

const PRODUCT_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Check my band", href: "/" },
];

const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
  { label: "Contact us", href: "mailto:hello@bandcheckai.co.uk" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-paper-card">
      <div className="mx-auto max-w-6xl px-6 py-14">

        {/* Top section */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-3">
              BandCheck AI helps UK homeowners find out if they&apos;re in the wrong council tax band — and build a free appeal case in minutes. Used by thousands of households across England and Wales.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-forest" />
              <span className="text-xs font-medium text-ink-3">
                Free to check &middot; No account required
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-3">
              Product
            </p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-ink-2 transition-colors hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-3">
              Legal
            </p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith("mailto:") ? (
                    <a
                      href={href}
                      className="text-sm text-ink-2 transition-colors hover:text-ink"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="text-sm text-ink-2 transition-colors hover:text-ink"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-hairline" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-3">
            © {new Date().getFullYear()} BandCheck AI Ltd. All rights reserved.
          </p>
          <p className="text-xs leading-relaxed text-ink-3 sm:max-w-md sm:text-right">
            BandCheck AI provides informational tools only and does not constitute legal or financial advice. All appeal outcomes are decided by the Valuation Office Agency.
          </p>
        </div>
      </div>
    </footer>
  );
}
