import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Terms",
  description: "BandCheck AI terms information.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 text-gray-900">
        <h1 className="text-3xl font-bold tracking-tight">Terms</h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          BandCheck AI provides informational tools to help you assess your
          council tax band and prepare appeal materials. We do not provide legal
          advice and we do not guarantee appeal outcomes.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          By using the service, you agree that final decisions are made by the
          Valuation Office Agency and local authorities.
        </p>
      </main>
    </div>
  );
}
