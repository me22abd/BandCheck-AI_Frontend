import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white shadow-sm"
            aria-hidden
          >
            BC
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            BandCheck AI
          </span>
        </Link>
        <nav
          className="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex"
          aria-label="Marketing"
        >
          <span className="cursor-default">How it works</span>
          <span className="cursor-default">About</span>
          <span className="cursor-default">Pricing</span>
          <span className="cursor-default">Login</span>
        </nav>
        <Link
          href="/"
          className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
