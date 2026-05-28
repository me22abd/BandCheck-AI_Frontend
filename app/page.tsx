"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { SmallChip } from "@/components/editorial/SmallChip";

function normalizePostcode(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function formatPostcode(compact: string): string {
  const s = compact.replace(/\s+/g, "").toUpperCase();
  if (s.length <= 3) return s;
  return `${s.slice(0, -3)} ${s.slice(-3)}`;
}

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Pull comparables",
    body: "We fetch every home near yours from the Land Registry & VOA.",
  },
  {
    n: "02",
    title: "Cross-check the bands",
    body: "AI compares your band against similar nearby properties.",
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

function ReferralBanner({ refPostcode }: { refPostcode: string }) {
  const formatted = formatPostcode(refPostcode);

  useEffect(() => {
    // Track the click
    fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: refPostcode }),
    }).catch(() => {});
  }, [refPostcode]);

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-forest/20 bg-forest/8 px-4 py-3.5">
      <span className="mt-0.5 text-lg">🏘️</span>
      <div>
        <p className="text-sm font-semibold text-forest">
          A neighbour near {formatted} shared this with you
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-3">
          They checked their council tax band with BandCheck AI. Enter your postcode below to see if you&apos;re overpaying too.
        </p>
      </div>
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refPostcode = searchParams.get("ref")
    ? normalizePostcode(searchParams.get("ref")!)
    : null;

  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = normalizePostcode(postcode.trim());
    if (!normalized) return;
    setLoading(true);
    // Carry the ref through to the results page so we can attribute conversion
    const query = refPostcode ? `?ref=${refPostcode}` : "";
    router.push(`/results/${encodeURIComponent(normalized)}${query}`);
  }

  return (
    <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-20 pt-10 sm:pt-14">
      {refPostcode ? <ReferralBanner refPostcode={refPostcode} /> : (
        <div className="mb-4">
          <SmallChip tone="accent">UK Council Tax · Beta</SmallChip>
        </div>
      )}

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
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-paper-gradient">
      <SiteHeader />
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
