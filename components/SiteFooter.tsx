"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
];

const POLICY_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-paper-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Bandcheck ai</p>
        <nav className="flex flex-wrap items-center gap-4" aria-label="Footer">
          {FOOTER_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} className="transition-colors hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <nav className="flex flex-wrap items-center gap-4" aria-label="Legal">
          {POLICY_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} className="transition-colors hover:text-ink">
              {label}
            </Link>
          ))}
          <a href="mailto:hello@bandcheck.ai" className="transition-colors hover:text-ink">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
