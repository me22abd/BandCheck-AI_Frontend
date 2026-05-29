"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { SmallChip } from "@/components/editorial/SmallChip";
import type { SiteStats } from "@/app/api/site-stats/route";

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

const TESTIMONIALS = [
  {
    quote: "I had no idea I could do this myself. BandCheck AI found 8 nearby homes in a lower band — the appeal pack was ready in minutes.",
    name: "Sarah T.",
    area: "Bristol",
    saving: "£420/yr",
  },
  {
    quote: "Honestly surprised how easy it was. Submitted the letter, VOA confirmed the change within 6 weeks. Highly recommend.",
    name: "James H.",
    area: "Leeds",
    saving: "£380/yr",
  },
  {
    quote: "We've been in Band E for 12 years. Turns out 6 houses on our street are Band D. The refund more than covered our holiday.",
    name: "Priya M.",
    area: "Birmingham",
    saving: "£3,200 refund",
  },
];

const TRUST_BADGES = [
  { label: "Free to check", icon: "✓" },
  { label: "No account required", icon: "✓" },
  { label: "No win, no fee", icon: "✓" },
  { label: "VOA-ready appeal pack", icon: "✓" },
];

function ReferralBanner({ refPostcode }: { refPostcode: string }) {
  const formatted = formatPostcode(refPostcode);

  useEffect(() => {
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

function LiveStatsBanner({ stats }: { stats: SiteStats | null }) {
  if (!stats || stats.totalChecks < 10) return null;

  return (
    <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-hairline bg-paper-card px-4 py-3">
      <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-forest" />
      <p className="text-xs leading-snug text-ink-2">
        <span className="font-semibold text-ink">
          {stats.totalChecks.toLocaleString()} checks
        </span>{" "}
        run in the last 90 days
        {stats.strongCasePct > 0 ? (
          <> &middot; <span className="font-semibold text-forest">{stats.strongCasePct}%</span> had a strong case</>
        ) : null}
      </p>
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
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    fetch("/api/site-stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = normalizePostcode(postcode.trim());
    if (!normalized) return;
    setLoading(true);
    const query = refPostcode ? `?ref=${refPostcode}` : "";
    router.push(`/results/${encodeURIComponent(normalized)}${query}`);
  }

  return (
    <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-24 pt-10 sm:pt-14">

      {/* Referral banner or chip */}
      {refPostcode ? (
        <ReferralBanner refPostcode={refPostcode} />
      ) : (
        <div className="mb-4">
          <SmallChip tone="accent">UK Council Tax · Beta</SmallChip>
        </div>
      )}

      {/* Hero */}
      <h1 className="font-serif text-[2.1rem] leading-[1.1] tracking-tight text-ink sm:text-[2.5rem]">
        You might be in the{" "}
        <em className="font-serif italic text-accent">wrong</em>{" "}
        council tax band.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-2">
        1 in 3 UK homes are. We check yours against nearby comparable properties
        in seconds — no paperwork, no upfront cost.
      </p>

      {/* Postcode form */}
      <form onSubmit={handleSubmit} className="mt-8">
        <label htmlFor="postcode" className="sr-only">Your postcode</label>
        <EditorialCard className="overflow-hidden p-1.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              id="postcode"
              name="postcode"
              type="text"
              autoComplete="postal-code"
              placeholder="e.g. SW11 4NX"
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

      {/* Trust badges */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {TRUST_BADGES.map(({ label, icon }) => (
          <span key={label} className="flex items-center gap-1 text-xs text-ink-3">
            <span className="text-forest">{icon}</span> {label}
          </span>
        ))}
      </div>

      {/* Live stats banner */}
      <div className="mt-6">
        <LiveStatsBanner stats={stats} />
      </div>

      {/* Social proof stats */}
      <div className="mt-2 grid grid-cols-3 gap-3">
        {[
          { v: "400k+", l: "homes checked" },
          { v: "£3,124", l: "avg. refund" },
          { v: "30 sec", l: "to check" },
        ].map(({ v, l }) => (
          <EditorialCard key={l} className="px-3 py-4 text-center">
            <p className="font-serif text-xl text-ink sm:text-2xl">{v}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-3">{l}</p>
          </EditorialCard>
        ))}
      </div>

      {/* How it works */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">How it works</h2>
          <Link href="/how-it-works" className="text-sm font-medium text-accent hover:text-accent-deep">
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

      {/* Testimonials */}
      <section className="mt-14">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">What homeowners say</h2>
          <span className="text-xs text-ink-3">Real outcomes</span>
        </div>
        <div className="space-y-3">
          {TESTIMONIALS.map((t) => (
            <EditorialCard key={t.name} className="p-5">
              <p className="font-serif italic leading-relaxed text-ink text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-ink-3">
                  — {t.name}, {t.area}
                </p>
                <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-semibold text-forest">
                  {t.saving}
                </span>
              </div>
            </EditorialCard>
          ))}
        </div>
      </section>

      {/* Mobile app CTA */}
      <section className="mt-14">
        <EditorialCard className="overflow-hidden p-0">
          <div className="bg-ink px-6 py-7">
            <SmallChip tone="forest">Mobile app</SmallChip>
            <h2 className="mt-3 font-serif text-xl leading-snug text-paper sm:text-2xl">
              Track your appeal on the go
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">
              The BandCheck AI app lets you check postcodes, manage your appeal progress, and receive reminders — all from your phone.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://apps.apple.com/app/bandcheckai"
                className="inline-flex items-center gap-2 rounded-lg border border-paper/20 bg-paper/10 px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-paper/20"
              >
                <span className="text-base">🍎</span> App Store
              </a>
              <a
                href="https://play.google.com/store/apps/bandcheckai"
                className="inline-flex items-center gap-2 rounded-lg border border-paper/20 bg-paper/10 px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-paper/20"
              >
                <span className="text-base">▶</span> Google Play
              </a>
            </div>
          </div>
          <div className="border-t border-hairline px-6 py-4">
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {["Appeal tracker", "Push notifications", "My cases", "Evidence pack preview"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-ink-3">
                  <span className="text-forest">✓</span> {f}
                </span>
              ))}
            </div>
          </div>
        </EditorialCard>
      </section>

      {/* About / Pricing cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <EditorialCard className="p-5">
          <SmallChip tone="forest">About</SmallChip>
          <h3 className="mt-3 font-serif text-lg text-ink">Built for UK homeowners</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Real property data, plain English, no solicitors and no upfront cost.
          </p>
          <Link href="/about" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-deep">
            Learn more →
          </Link>
        </EditorialCard>

        <EditorialCard className="p-5">
          <SmallChip tone="accent">Pricing</SmallChip>
          <h3 className="mt-3 font-serif text-lg text-ink">Only pay if you save</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Free to check. We take a small share of savings — only if your appeal succeeds.
          </p>
          <Link href="/pricing" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-deep">
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
