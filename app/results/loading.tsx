import { SiteHeader } from "@/components/SiteHeader";

export default function ResultsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-lg shadow-slate-200/50 sm:p-10">
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
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#2563EB"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${0.75 * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold tabular-nums text-[#2563EB]">
                75%
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-base font-medium text-slate-900">
            Analyzing your property…
          </p>
          <p className="mt-2 text-center text-sm text-slate-600">
            This usually takes 20–30 seconds.
          </p>

          <ul className="mt-8 space-y-3 text-left text-sm text-slate-700">
            <li className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"
                aria-hidden
              >
                ✓
              </span>
              Checking council tax band
            </li>
            <li className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"
                aria-hidden
              >
                ✓
              </span>
              Finding similar properties
            </li>
            <li className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"
                aria-hidden
              >
                ✓
              </span>
              Comparing band data
            </li>
            <li className="flex items-center gap-3">
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center"
                aria-hidden
              >
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#2563EB]" />
              </span>
              Calculating case strength…
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
