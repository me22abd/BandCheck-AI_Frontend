"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/editorial/Wordmark";
import { EditorialButton } from "@/components/editorial/EditorialButton";

const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />

        <div className="flex items-center gap-6">
          <nav
            className="hidden items-center gap-8 text-sm font-medium lg:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`transition-colors duration-200 ${
                  pathname === href
                    ? "text-ink"
                    : "text-ink-2 hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <EditorialButton href="/" className="hidden px-4 py-2 text-sm sm:inline-flex">
            Check band
          </EditorialButton>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink lg:hidden"
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

      {mobileOpen && (
        <nav
          className="border-t border-hairline bg-paper-card px-6 pb-4 pt-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === href
                      ? "bg-paper-2 text-ink"
                      : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <EditorialButton href="/" className="w-full text-sm">
                Check band
              </EditorialButton>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
