import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="px-6 py-16 text-ink sm:py-20">
        <div className="mx-auto w-full max-w-lg text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-ink-3">
            404
          </p>
          <h1 className="mt-2 font-serif text-2xl tracking-tight sm:text-3xl">
            Page not found
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            The page you’re looking for doesn’t exist.
          </p>
          <p className="mt-8">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 text-base font-semibold text-paper shadow-btn-accent transition hover:bg-accent-deep"
            >
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
