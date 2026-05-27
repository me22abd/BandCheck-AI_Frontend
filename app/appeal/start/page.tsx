import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import AppealStartFlow from "./AppealStartFlow";

function AppealStartFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-blue-100/40">
      <SiteHeader />
      <main className="px-6 py-10 pb-16 text-slate-900 sm:py-12">
        <div className="mx-auto w-full max-w-3xl text-center text-sm text-ink-2">
          Loading…
        </div>
      </main>
    </div>
  );
}

export default function AppealStartPage() {
  return (
    <Suspense fallback={<AppealStartFallback />}>
      <AppealStartFlow />
    </Suspense>
  );
}
