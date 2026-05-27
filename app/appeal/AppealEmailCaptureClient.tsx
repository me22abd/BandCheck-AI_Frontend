"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { SmallChip } from "@/components/editorial/SmallChip";
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

  if (confirmed) {
    return (
      <div className="min-h-screen bg-paper-gradient">
        <SiteHeader />
        <main className="mx-auto max-w-lg px-6 py-24 text-center text-ink">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest/10">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-forest" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-6 font-serif text-2xl text-ink">
            We&apos;ll be in touch
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Thanks — your details have been received. Our team will review your
            case and email you within 24 hours with next steps.
          </p>
          <p className="mt-2 text-sm text-ink-3">
            Sent to <span className="font-medium text-ink-2">{email}</span>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <EditorialButton href={appealStartHref}>
              Continue to Appeal Builder →
            </EditorialButton>
            <EditorialButton href="/" variant="secondary">
              Back to home
            </EditorialButton>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="px-6 py-10 pb-16 sm:py-12">
        <div className="mx-auto w-full max-w-4xl">
          <EditorialCard className="overflow-hidden lg:grid lg:min-h-[520px] lg:grid-cols-2">
            <div className="flex flex-col justify-center bg-ink px-8 py-12 text-paper sm:px-10 lg:py-16">
              <SmallChip tone="accent" className="!bg-accent/20 !text-paper">
                Bandcheck ai
              </SmallChip>
              <h1 className="mt-4 font-serif text-2xl leading-tight sm:text-3xl">
                Start your appeal
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-paper/80">
                Secure, guided support to challenge your council tax band with
                confidence.
              </p>
              <ul className="mt-8 space-y-4 text-left text-sm text-paper/90">
                {benefits.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-paper"
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
              <p className="text-center text-sm font-medium text-ink-3 lg:text-left">
                Step 1 of 1
              </p>
              <h2 className="mt-2 text-center font-serif text-xl text-ink lg:text-left sm:text-2xl">
                Enter your email to continue
              </h2>
              <p className="mt-3 text-center text-sm leading-relaxed text-ink-2 lg:text-left">
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
                  className="min-h-12 w-full rounded-xl border border-hairline bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent/30"
                />
                <p className="mt-3 text-center text-xs leading-relaxed text-ink-3 lg:text-left">
                  Used only for your appeal.
                </p>
                <button
                  type="submit"
                  disabled={!email.trim() || loading}
                  className="mt-6 flex min-h-14 w-full items-center justify-center rounded-xl bg-accent px-8 text-lg font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? "Submitting…" : "Continue to Appeal →"}
                </button>
                <p className="mt-3 text-center text-sm font-medium text-ink-2 lg:text-left">
                  No upfront cost. Only pay if successful.
                </p>
                <p className="mt-3 text-center text-xs text-ink-3 lg:text-left">
                  We&apos;ll never share your email.
                </p>
              </form>
            </div>
          </EditorialCard>

          <p className="mt-12 text-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-medium text-accent underline-offset-4 transition hover:text-accent-deep hover:underline"
            >
              ← Back
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
