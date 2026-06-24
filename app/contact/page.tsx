import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { SmallChip } from "@/components/editorial/SmallChip";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with the BandCheck AI team — questions about council tax appeals, your account, or partnerships.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 text-ink">
        <div className="mb-10 max-w-2xl">
          <SmallChip tone="accent">Contact</SmallChip>
          <h1 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl">
            Get in touch
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            Questions about your check, appeal, or account? Send us a message and
            we&apos;ll get back to you within 1–2 working days.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <EditorialCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                General enquiries
              </p>
              <a
                href="mailto:hello@bandcheckai.co.uk"
                className="mt-2 block text-sm font-medium text-accent hover:text-accent-deep"
              >
                hello@bandcheckai.co.uk
              </a>
            </EditorialCard>

            <EditorialCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                Privacy & data
              </p>
              <a
                href="mailto:privacy@bandcheckai.co.uk"
                className="mt-2 block text-sm font-medium text-accent hover:text-accent-deep"
              >
                privacy@bandcheckai.co.uk
              </a>
            </EditorialCard>

            <EditorialCard className="p-5">
              <p className="text-sm leading-relaxed text-ink-2">
                Looking for answers? Check our{" "}
                <Link href="/how-it-works#faq" className="font-medium text-accent hover:text-accent-deep">
                  FAQ
                </Link>{" "}
                for common questions about appeals, pricing, and data.
              </p>
            </EditorialCard>
          </div>
        </div>
      </main>
    </div>
  );
}
