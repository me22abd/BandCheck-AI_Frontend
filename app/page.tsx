"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { SmallChip } from "@/components/editorial/SmallChip";

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Pull comparables",
    body: "We fetch every home sold near yours since 1991 from the Land Registry.",
  },
  {
    n: "02",
    title: "Cross-check the VOA",
    body: "AI compares the bands of comparable homes against yours.",
  },
  {
    n: "03",
    title: "Build the case",
    body: "If you're owed a refund, we draft the appeal pack automatically.",
  },
];

const STATS = [
  { v: "400,000", l: "homes checked" },
  { v: "£3,000", l: "avg. refund" },
  { v: "30 sec", l: "to check" },
];

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
    <div className="relative flex min-h-screen flex-col bg-paper-gradient">
      <SiteHeader />

      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-20 pt-10 sm:pt-14">
        <div className="mb-4">
          <SmallChip tone="accent">UK Council Tax · Beta</SmallChip>
        </div>

        <h1 className="font-serif text-[2rem] leading-[1.12] tracking-tight text-ink sm:text-[2.35rem]">
          You might be in the{" "}
          <em className="font-serif italic text-accent">wrong</em> council tax band.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-2">
          1 in 3 UK homes are. We check yours against the Land Registry &amp; VOA in
          seconds — no paperwork, no upfront cost.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <label htmlFor="postcode" className="sr-only">
            Postcode
          </label>
          <EditorialCard className="overflow-hidden p-1.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                id="postcode"
                name="postcode"
                type="text"
                autoComplete="postal-code"
                placeholder="e.g. LU1 2AB"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="min-h-12 flex-1 rounded-xl border-0 bg-transparent px-4 text-base text-ink outline-none placeholder:text-ink-3"
              />
              <button
                type="submit"
                disabled={!postcode.trim() || loading}
                className="min-h-12 shrink-0 rounded-xl bg-accent px-6 text-[15px] font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? "Checking…" : "Check my band →"}
              </button>
            </div>
          </EditorialCard>
        </form>

        <p className="mt-3 text-center text-xs text-ink-3">
          Free check · No account required
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {STATS.map(({ v, l }) => (
            <EditorialCard key={l} className="px-3 py-4 text-center">
              <p className="font-serif text-xl text-ink sm:text-2xl">{v}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-3">
                {l}
              </p>
            </EditorialCard>
          ))}
        </div>

        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink">How it works</h2>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-accent hover:text-accent-deep"
            >
              Full guide →
            </Link>
          </div>
          <div className="space-y-3">
            {HOW_IT_WORKS.map((step) => (
              <EditorialCard key={step.n} className="p-5">
                <p className="font-mono text-[11px] font-medium text-accent">{step.n}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{step.body}</p>
              </EditorialCard>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <EditorialCard className="p-5">
            <SmallChip tone="forest">About</SmallChip>
            <h3 className="mt-3 font-serif text-lg text-ink">Built for UK homeowners</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Real property data, plain English, no solicitors and no upfront cost.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-deep"
            >
              Learn more →
            </Link>
          </EditorialCard>

          <EditorialCard className="p-5">
            <SmallChip tone="accent">Pricing</SmallChip>
            <h3 className="mt-3 font-serif text-lg text-ink">Only pay if you save</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Free to check. We take a small share of savings — only if your appeal succeeds.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-deep"
            >
              See pricing →
            </Link>
          </EditorialCard>
        </div>
      </main>
    </div>
  );
}
