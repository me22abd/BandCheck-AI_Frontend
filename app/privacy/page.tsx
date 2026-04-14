import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Privacy",
  description: "BandCheck AI privacy information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 text-gray-900">
        <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          We only collect information needed to provide the service, such as your
          postcode and email address. We do not sell your personal data.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          If you contact us by email, we use your details only to respond to your
          request and support your appeal workflow.
        </p>
      </main>
    </div>
  );
}
