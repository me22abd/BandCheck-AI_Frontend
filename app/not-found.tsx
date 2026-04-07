import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="px-6 py-16 text-slate-900 sm:py-20">
        <div className="mx-auto w-full max-w-lg text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            404
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Page not found
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            The page you’re looking for doesn’t exist.
          </p>
          <p className="mt-8">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#2563EB] px-6 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

