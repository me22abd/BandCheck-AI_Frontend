import Link from "next/link";

function BandCheckLogo() {
  return (
    <span className="flex items-center gap-2">
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M10 1.5L2.5 4.5V10C2.5 14 5.8 17.6 10 18.5C14.2 17.6 17.5 14 17.5 10V4.5L10 1.5Z"
          stroke="#3B82F6"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="#EFF6FF"
        />
        <path
          d="M7 10.5L9 12.5L13 8.5"
          stroke="#3B82F6"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tracking-tight">
        <span className="text-base font-semibold text-gray-900">BandCheck</span>
        <span className="text-base font-medium text-blue-500"> AI</span>
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-80"
        >
          <BandCheckLogo />
        </Link>

        <div className="flex items-center gap-6">
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
