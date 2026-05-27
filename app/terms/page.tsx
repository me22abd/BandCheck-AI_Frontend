import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Terms",
  description: "Bandcheck ai terms information.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 text-ink">
        <h1 className="font-serif text-3xl tracking-tight">Terms</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          Bandcheck ai provides informational tools to help you assess your
          council tax band and prepare appeal materials. We do not provide legal
          advice and we do not guarantee appeal outcomes.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          By using the service, you agree that final decisions are made by the
          Valuation Office Agency and local authorities.
        </p>
      </main>
    </div>
  );
}
