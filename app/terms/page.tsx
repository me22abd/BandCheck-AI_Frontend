import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Terms of Service | BandCheck AI",
  description: "Terms and conditions governing use of BandCheck AI's council tax appeal service.",
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">

        {/* Header */}
        <div className="mb-12 border-b border-hairline pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Legal</p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-ink-3">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using BandCheck AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), accessible at{" "}
            <a href="https://bandcheckai.co.uk" className="text-accent hover:underline">bandcheckai.co.uk</a>{" "}
            and via our mobile application (collectively &ldquo;the Service&rdquo;).
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>
        </div>

        <Section id="service-description" title="1. Description of service">
          <p>
            BandCheck AI provides a digital tool that allows UK residents to:
          </p>
          <ul className="ml-4 list-disc space-y-2">
            <li>Check whether their property may be placed in an incorrect council tax band</li>
            <li>Compare their band against nearby comparable properties using publicly available Land Registry and VOA data</li>
            <li>Generate a personalised evidence pack and draft appeal letter</li>
            <li>Track the progress of their council tax band appeal</li>
          </ul>
          <p>
            The Service is intended for use by homeowners and renters in England and Wales. Council tax banding in Scotland and Northern Ireland is governed by separate legislation and is outside the scope of this Service.
          </p>
        </Section>

        <Section id="not-legal-advice" title="2. Not legal or financial advice">
          <p>
            <strong className="text-ink">BandCheck AI is an informational tool only.</strong> Nothing on this website or in our application constitutes legal advice, financial advice, or professional advice of any kind. The analysis and estimates we provide are based on publicly available data and algorithmic assessment — they are not a guarantee of any specific outcome.
          </p>
          <p>
            You should verify your official council tax band at{" "}
            <a href="https://www.gov.uk/council-tax-bands" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">gov.uk/council-tax-bands</a>{" "}
            before submitting any formal appeal. All formal appeal decisions are made exclusively by the Valuation Office Agency (VOA) and, where applicable, the Valuation Tribunal.
          </p>
          <p>
            If you require legal or professional advice regarding your council tax, we recommend consulting a qualified solicitor or specialist advisor.
          </p>
        </Section>

        <Section id="eligibility" title="3. Eligibility">
          <p>
            You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you are 18 or older and have the legal capacity to enter into these Terms.
          </p>
        </Section>

        <Section id="acceptable-use" title="4. Acceptable use">
          <p>You agree not to:</p>
          <ul className="ml-4 list-disc space-y-2">
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations</li>
            <li>Submit false, misleading, or fraudulent information</li>
            <li>Attempt to gain unauthorised access to any part of our systems, servers, or databases</li>
            <li>Scrape, crawl, or extract data from the Service in bulk without our prior written consent</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
            <li>Use the Service in a way that could damage, disable, or impair its functionality</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
          </ul>
        </Section>

        <Section id="pricing-fees" title="5. Pricing and success fee">
          <p>
            The Service is <strong className="text-ink">free to use</strong> for checking your council tax band, reviewing comparable properties, and generating an appeal pack.
          </p>
          <p>
            If you choose to proceed with your appeal using our Service and your appeal is <strong className="text-ink">formally successful</strong> (i.e. the VOA formally reduces your council tax band), a success fee will become payable to BandCheck AI. The success fee is calculated as a percentage of the total refund or financial benefit received as a result of the band reduction.
          </p>
          <p>
            The exact percentage will be clearly disclosed to you before you submit your appeal. You will not be charged until your appeal has been confirmed as successful and you have received the benefit.
          </p>
          <p>
            If your appeal is unsuccessful, no fee is payable. You have no obligation to proceed at any point in the process.
          </p>
        </Section>

        <Section id="data-accuracy" title="6. Data accuracy and limitations">
          <p>
            Our analysis is based on data from the Land Registry, VOA, and other publicly available sources. While we work to maintain accuracy, we cannot guarantee that this data is complete, current, or error-free.
          </p>
          <p>
            Band estimates and financial projections (including potential refunds and annual savings) are <strong className="text-ink">estimates only</strong>. Actual outcomes will depend on individual property circumstances, your local authority&apos;s rates, VOA assessments, and other factors outside our control.
          </p>
          <p>
            We make no representation or warranty — express or implied — regarding the accuracy, reliability, or completeness of any data or analysis provided through the Service.
          </p>
        </Section>

        <Section id="intellectual-property" title="7. Intellectual property">
          <p>
            All content, design, code, algorithms, trademarks, and materials on the Service are the property of BandCheck AI or its licensors and are protected by applicable intellectual property laws.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable licence to use the Service for personal, non-commercial purposes only. You may not reproduce, distribute, or create derivative works from any part of the Service without our prior written consent.
          </p>
          <p>
            The appeal documents and evidence packs generated for you are provided for your personal use in connection with your own council tax appeal. You may not distribute, resell, or use them on behalf of third parties without our permission.
          </p>
        </Section>

        <Section id="user-content" title="8. User content">
          <p>
            If you submit a testimonial, feedback, or other content through the Service, you grant BandCheck AI a non-exclusive, royalty-free, worldwide licence to use, display, and reproduce that content in connection with operating and promoting the Service.
          </p>
          <p>
            You represent that any content you submit is accurate, does not infringe any third-party rights, and does not violate any applicable law. We reserve the right to remove or decline to publish any user content at our discretion.
          </p>
        </Section>

        <Section id="limitation-liability" title="9. Limitation of liability">
          <p>
            To the fullest extent permitted by applicable law, BandCheck AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service, including but not limited to loss of profit, loss of data, or business interruption.
          </p>
          <p>
            Our total aggregate liability to you for any claim arising out of or related to these Terms or the Service shall not exceed the amount you have paid to us in the twelve months preceding the claim (or £100 if no payment has been made).
          </p>
          <p>
            Nothing in these Terms limits or excludes our liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be limited or excluded by applicable UK law.
          </p>
        </Section>

        <Section id="third-party-services" title="10. Third-party services and links">
          <p>
            The Service may contain links to third-party websites and services, including the Valuation Office Agency, Land Registry, and GOV.UK. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.
          </p>
        </Section>

        <Section id="termination" title="11. Termination">
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time, without notice, if we believe you have violated these Terms or are using the Service in a way that may harm us, other users, or third parties.
          </p>
          <p>
            You may stop using the Service at any time. Sections relating to intellectual property, limitation of liability, and dispute resolution shall survive any termination.
          </p>
        </Section>

        <Section id="changes" title="12. Changes to these terms">
          <p>
            We may update these Terms from time to time to reflect changes to our Service, legal requirements, or business practices. We will notify you of material changes by posting the updated Terms on this page and updating the &ldquo;Last updated&rdquo; date.
          </p>
          <p>
            Your continued use of the Service after changes become effective constitutes your acceptance of the revised Terms.
          </p>
        </Section>

        <Section id="governing-law" title="13. Governing law and disputes">
          <p>
            These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
          <p>
            If you have a complaint or dispute, please contact us first at{" "}
            <a href="mailto:hello@bandcheckai.co.uk" className="text-accent hover:underline">hello@bandcheckai.co.uk</a>{" "}
            and we will do our best to resolve it informally.
          </p>
        </Section>

        <Section id="contact" title="14. Contact us">
          <p>
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="rounded-xl border border-hairline bg-paper-card p-5 text-sm">
            <p className="font-semibold text-ink">BandCheck AI</p>
            <p className="mt-1 text-ink-2">Email: <a href="mailto:hello@bandcheckai.co.uk" className="text-accent hover:underline">hello@bandcheckai.co.uk</a></p>
            <p className="text-ink-2">Website: <a href="https://bandcheckai.co.uk" className="text-accent hover:underline">bandcheckai.co.uk</a></p>
          </div>
        </Section>

        <div className="mt-12 border-t border-hairline pt-8 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-accent hover:underline">
            ← Back to home
          </Link>
          <Link href="/privacy" className="text-sm font-medium text-ink-2 hover:text-ink hover:underline">
            Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
