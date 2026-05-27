import { SiteHeader } from "@/components/SiteHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";

export default function ResultsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-paper-gradient">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
        <EditorialCard className="w-full max-w-md p-8 sm:p-10">
          <div className="relative mx-auto h-36 w-36">
            <svg
              className="-rotate-90"
              width="144"
              height="144"
              viewBox="0 0 100 100"
              aria-hidden
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(20, 18, 13, 0.12)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#C8431C"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${0.75 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold tabular-nums text-accent">
                75%
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-base font-medium text-ink">
            Analyzing your property…
          </p>
          <p className="mt-2 text-center text-sm text-ink-2">
            This usually takes 20–30 seconds.
          </p>

          <ul className="mt-8 space-y-3 text-left text-sm text-ink-2">
            {[
              "Checking council tax band",
              "Finding similar properties",
              "Comparing band data",
            ].map((label) => (
              <li key={label} className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"
                  aria-hidden
                >
                  ✓
                </span>
                {label}
              </li>
            ))}
            <li className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-paper-2 border-t-accent" />
              </span>
              Calculating case strength…
            </li>
          </ul>
        </EditorialCard>
      </main>
    </div>
  );
}
