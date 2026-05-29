import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Privacy Policy | BandCheck AI",
  description: "How BandCheck AI collects, uses, and protects your personal data in accordance with UK GDPR.",
};

const LAST_UPDATED = "28 May 2026";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mt-12 font-serif text-xl tracking-tight text-ink first:mt-0">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="mb-12 border-b border-hairline pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Legal</p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-ink-3">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            BandCheck AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share information about you when you use our website at{" "}
            <a href="https://bandcheckai.co.uk" className="text-accent hover:underline">bandcheckai.co.uk</a>{" "}
            and our mobile application (&ldquo;the Service&rdquo;).
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            We are the data controller for the purposes of UK GDPR and the Data Protection Act 2018.
          </p>
        </div>

        <Section id="what-we-collect" title="1. What information we collect">
          <p>We collect the following categories of personal information:</p>
          <ul className="ml-4 list-disc space-y-2 text-ink-2">
            <li><strong className="text-ink">Postcode data</strong> — when you enter a postcode to check your council tax band. This may be combined with your house number if you provide it.</li>
            <li><strong className="text-ink">Email address</strong> — when you request an evidence pack or appeal document to be sent to you.</li>
            <li><strong className="text-ink">Appeal information</strong> — your council tax band, nearby comparable properties, and the outcome of your appeal if you choose to record it.</li>
            <li><strong className="text-ink">Testimonial content</strong> — your first name, area, and feedback if you voluntarily submit a testimonial about your experience.</li>
            <li><strong className="text-ink">Usage data</strong> — anonymised analytics about how users interact with our service (pages visited, features used), collected via server logs and analytics tools.</li>
            <li><strong className="text-ink">Device and technical data</strong> — IP address, browser type, operating system, and device identifiers collected automatically when you access our Service.</li>
          </ul>
        </Section>

        <Section id="how-we-use" title="2. How we use your information">
          <p>We use your personal data for the following purposes:</p>
          <ul className="ml-4 list-disc space-y-2 text-ink-2">
            <li>To deliver the council tax band check and analysis service</li>
            <li>To generate and send your evidence pack and appeal documents by email</li>
            <li>To track your appeal progress and remind you of key steps (with your permission for notifications)</li>
            <li>To improve our accuracy by aggregating anonymised check data across districts</li>
            <li>To respond to your support requests and communications</li>
            <li>To display anonymised social proof (testimonials) on our website, with your explicit consent</li>
            <li>To comply with our legal and regulatory obligations</li>
          </ul>
          <p>
            We do not use your personal data for automated decision-making that produces legal or similarly significant effects on you.
          </p>
        </Section>

        <Section id="legal-basis" title="3. Legal basis for processing">
          <p>We rely on the following legal bases under UK GDPR:</p>
          <ul className="ml-4 list-disc space-y-2 text-ink-2">
            <li><strong className="text-ink">Contract performance</strong> — processing necessary to provide the Service you have requested (e.g. running a postcode check, generating an appeal pack).</li>
            <li><strong className="text-ink">Legitimate interests</strong> — improving our service, preventing fraud, and understanding how users engage with BandCheck AI, where these interests do not override your rights.</li>
            <li><strong className="text-ink">Consent</strong> — sending you push notifications, displaying your testimonial, or sending marketing communications. You may withdraw consent at any time.</li>
            <li><strong className="text-ink">Legal obligation</strong> — where we are required to process data to comply with applicable law.</li>
          </ul>
        </Section>

        <Section id="data-storage" title="4. How we store your data">
          <p>
            Your data is stored securely on servers provided by Railway (PostgreSQL database) and Vercel (hosting infrastructure), both of which operate from data centres within the UK and European Economic Area. We apply industry-standard technical and organisational security measures including encrypted connections (TLS), access controls, and regular security reviews.
          </p>
          <p>
            We retain personal data only as long as necessary for the purposes described in this policy, or as required by law. Postcode check data used for aggregate analytics is anonymised after 90 days. Email addresses associated with appeal packs are retained for 24 months unless you request earlier deletion.
          </p>
        </Section>

        <Section id="sharing" title="5. Who we share data with">
          <p>
            We do not sell your personal data. We share your information only in the following circumstances:
          </p>
          <ul className="ml-4 list-disc space-y-2 text-ink-2">
            <li><strong className="text-ink">Service providers</strong> — trusted third parties who assist us in operating our Service (e.g. email delivery, cloud hosting, analytics). These providers act as data processors under our instruction and are bound by appropriate data processing agreements.</li>
            <li><strong className="text-ink">Legal requirements</strong> — where we are required to disclose information by law, court order, or to protect the rights, property, or safety of BandCheck AI, our users, or the public.</li>
            <li><strong className="text-ink">Business transfers</strong> — if BandCheck AI is acquired or merges with another entity, your data may be transferred as part of that transaction. We will notify you before any such transfer and you will have the right to object.</li>
          </ul>
        </Section>

        <Section id="your-rights" title="6. Your rights">
          <p>Under UK GDPR you have the following rights regarding your personal data:</p>
          <ul className="ml-4 list-disc space-y-2 text-ink-2">
            <li><strong className="text-ink">Right of access</strong> — to request a copy of the personal data we hold about you.</li>
            <li><strong className="text-ink">Right to rectification</strong> — to have inaccurate data corrected.</li>
            <li><strong className="text-ink">Right to erasure</strong> — to request deletion of your personal data (&ldquo;the right to be forgotten&rdquo;), subject to certain legal exceptions.</li>
            <li><strong className="text-ink">Right to restrict processing</strong> — to ask us to pause the processing of your data in certain circumstances.</li>
            <li><strong className="text-ink">Right to data portability</strong> — to receive your data in a structured, machine-readable format.</li>
            <li><strong className="text-ink">Right to object</strong> — to processing based on legitimate interests or for direct marketing purposes.</li>
            <li><strong className="text-ink">Rights related to automated decision-making</strong> — we do not use automated profiling that produces significant effects on you.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@bandcheckai.co.uk" className="text-accent hover:underline">privacy@bandcheckai.co.uk</a>. We will respond within 30 days. You also have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) at{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">ico.org.uk</a>.
          </p>
        </Section>

        <Section id="cookies" title="7. Cookies and tracking">
          <p>
            Our website uses essential cookies necessary for the Service to function (e.g. session management). We do not currently use advertising or tracking cookies. Analytics data is collected in an aggregated, anonymised form that does not identify individual users.
          </p>
          <p>
            Our mobile application uses local device storage to save your case progress, appeal status, and notification preferences. This data is stored on your device only and is not transmitted to our servers unless you explicitly submit a check or appeal.
          </p>
        </Section>

        <Section id="third-party" title="8. Third-party links">
          <p>
            Our Service may contain links to external websites, including the Valuation Office Agency (VOA), Land Registry, and GOV.UK. These websites are not operated by us and we are not responsible for their privacy practices. We encourage you to read their respective privacy policies.
          </p>
        </Section>

        <Section id="children" title="9. Children's privacy">
          <p>
            Our Service is not directed at children under the age of 16. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a child, please contact us immediately at{" "}
            <a href="mailto:privacy@bandcheckai.co.uk" className="text-accent hover:underline">privacy@bandcheckai.co.uk</a>.
          </p>
        </Section>

        <Section id="changes" title="10. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically.
          </p>
        </Section>

        <Section id="contact" title="11. Contact us">
          <p>
            If you have any questions about this Privacy Policy or how we handle your personal data, please contact us:
          </p>
          <div className="rounded-xl border border-hairline bg-paper-card p-5 text-sm">
            <p className="font-semibold text-ink">BandCheck AI</p>
            <p className="mt-1 text-ink-2">Email: <a href="mailto:privacy@bandcheckai.co.uk" className="text-accent hover:underline">privacy@bandcheckai.co.uk</a></p>
            <p className="text-ink-2">Website: <a href="https://bandcheckai.co.uk" className="text-accent hover:underline">bandcheckai.co.uk</a></p>
          </div>
        </Section>

        <div className="mt-12 border-t border-hairline pt-8">
          <Link href="/" className="text-sm font-medium text-accent hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
