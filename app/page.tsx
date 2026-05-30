import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { HomeContent } from "./HomeContent";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-paper-gradient">
      <SiteHeader />
      <Suspense fallback={<HomeShell />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

/** Shown on first server render while the client component hydrates */
function HomeShell() {
  return (
    <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-24 pt-10 sm:pt-14">
      <div className="mb-4">
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-accent/10 text-accent">
          UK Council Tax · Beta
        </span>
      </div>
      <h1 className="font-serif text-[2.1rem] leading-[1.1] tracking-tight text-ink sm:text-[2.5rem]">
        You might be in the{" "}
        <em className="font-serif italic text-accent">wrong</em> council tax
        band.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-2">
        1 in 3 UK homes are. We check yours against nearby comparable properties
        in seconds — no paperwork, no upfront cost.
      </p>
      <div className="mt-8 rounded-editorial border border-hairline bg-paper-card p-1.5 shadow-editorial">
        <div className="flex min-h-14 items-center justify-center">
          <span className="text-sm text-ink-3">Loading…</span>
        </div>
      </div>
    </main>
  );
}
