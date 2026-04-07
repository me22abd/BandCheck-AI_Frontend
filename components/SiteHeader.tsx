import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white shadow-sm"
            aria-hidden
          >
            BC
          </span>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            BandCheck AI
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <nav
            className="hidden items-center gap-8 text-sm font-medium lg:flex"
            aria-label="Marketing"
          >
            <span className="cursor-default text-gray-600 transition-colors duration-200 hover:text-gray-900">
              How it works
            </span>
            <span className="cursor-default text-gray-600 transition-colors duration-200 hover:text-gray-900">
              About
            </span>
            <span className="cursor-default text-gray-600 transition-colors duration-200 hover:text-gray-900">
              Pricing
            </span>
            <span className="cursor-default text-gray-600 transition-colors duration-200 hover:text-gray-900">
              Login
            </span>
          </nav>
          <Link
            href="/"
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
