"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialButton } from "@/components/editorial/EditorialButton";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-6 py-24 text-center text-ink">
        <p className="font-serif text-4xl text-ink-3">Oops</p>
        <h1 className="mt-4 font-serif text-xl text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep"
          >
            Try again
          </button>
          <EditorialButton href="/" variant="secondary">
            ← Go home
          </EditorialButton>
        </div>
      </main>
    </div>
  );
}
