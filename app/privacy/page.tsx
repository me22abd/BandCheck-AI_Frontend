import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Privacy",
  description: "Bandcheck ai privacy information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 text-ink">
        <h1 className="font-serif text-3xl tracking-tight">Privacy</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          We only collect information needed to provide the service, such as your
          postcode and email address. We do not sell your personal data.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          If you contact us by email, we use your details only to respond to your
          request and support your appeal workflow.
        </p>
      </main>
    </div>
  );
}
