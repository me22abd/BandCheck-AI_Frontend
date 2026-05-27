import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Search, FileText, Home as HomeIcon, Lock, TrendingUp, BarChart2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About | BandCheck AI",
  description:
    "BandCheck AI helps UK homeowners identify whether they are overpaying council tax — with clear data, structured tools, and no upfront cost.",
};

const differentiators = [
  {
    icon: <FileText className="h-5 w-5 text-ink-2" />,
    title: "Structured appeal packs",
    body: "We don't just tell you there's a problem — we generate a complete, organised appeal document you can submit directly to the Valuation Office Agency.",
  },
  {
    icon: <BarChart2 className="h-5 w-5 text-ink-2" />,
    title: "Transparent comparisons",
    body: "Every result shows you exactly which nearby properties we found, what band they're in, and why they're relevant to your case. No black box.",
  },
  {
    icon: <Search className="h-5 w-5 text-ink-2" />,
    title: "Simple guided workflow",
    body: "We've broken the appeal process into clear, plain-English steps. You always know where you are and what comes next — no surprises.",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-ink-2" />,
    title: "No win, no fee",
    body: "You pay nothing upfront. We only earn a small percentage of your savings if your appeal is successful — so our interests are completely aligned with yours.",
  },
  {
    icon: <Lock className="h-5 w-5 text-ink-2" />,
    title: "Privacy first",
    body: "Your email and property details are used solely for your appeal. We never sell or share your data with third parties.",
  },
  {
    icon: <HomeIcon className="h-5 w-5 text-ink-2" />,
    title: "Real property data",
    body: "Comparable property data is sourced from publicly available council tax records — the same data the VOA uses when reviewing appeals.",
  },
];

const features = [
  "Instant postcode analysis",
  "Case strength score",
  "Comparable property table",
  "Guided appeal builder",
  "Structured appeal pack",
  "Evidence checklist",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 text-ink">

        {/* Hero */}
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            About
          </p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Built for UK homeowners
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            Around 1 in 3 UK properties are estimated to be in the wrong council
            tax band. That means millions of families are overpaying every year —
            often without ever knowing it.
          </p>
        </div>

        {/* Problem / Solution / Value */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "The problem",
              heading: "Millions overpay council tax",
              body: "Council tax bands were set in 1991 based on estimated 1991 property values. Many were set incorrectly then — and have never been reviewed since.",
            },
            {
              label: "Our solution",
              heading: "We simplify the process using data",
              body: "BandCheck AI uses publicly available property data to identify whether comparable homes nearby are in lower bands — and builds your appeal case automatically.",
            },
            {
              label: "Your benefit",
              heading: "Clear insights, no jargon",
              body: "No solicitors. No complex forms. Just a clear picture of your situation and a structured pack ready to submit to the Valuation Office Agency.",
            },
          ].map(({ label, heading, body }) => (
            <div
              key={label}
              className="rounded-xl border border-hairline bg-paper-card p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {label}
              </p>
              <p className="mt-3 text-base font-semibold text-ink">
                {heading}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p>
            </div>
          ))}
        </div>

        {/* What we do */}
        <div className="mt-16 rounded-xl border border-hairline bg-paper-card p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-ink">What we provide</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            BandCheck AI is a tool — not a law firm, not a claims management
            company. We give you everything you need to make a well-supported,
            confident appeal on your own terms.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 rounded-lg border border-hairline bg-paper-2/40 px-3 py-2.5 text-sm text-ink-2"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  ✓
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* What makes us different */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-ink">
            What makes us different
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            There are other ways to challenge your council tax band — but most
            involve either paying a claims company a large cut upfront, or
            navigating government guidance alone. We sit in between: a clear,
            structured tool that gives you the knowledge and documentation to do
            it yourself, with guidance from us along the way.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {differentiators.map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-lg border border-hairline bg-paper-2/40 p-5"
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <p className="text-sm font-semibold text-ink">{title}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust disclaimer */}
        <div className="mt-16 rounded-xl border border-hairline bg-paper-card p-6 shadow-sm sm:p-8">
          <h2 className="text-base font-semibold text-ink">
            A note on outcomes
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            We do not guarantee that your appeal will be successful. The outcome
            depends on your individual property circumstances, the strength of
            your comparable evidence, and the assessment of the Valuation Office
            Agency. We provide tools, data, and structure to help you make the
            strongest possible case — but the final decision rests with the VOA.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            BandCheck AI is an independent platform. We are not affiliated with
            the Valuation Office Agency, HMRC, or any local authority.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-hairline bg-accent/5 p-8 text-center">
          <h3 className="text-lg font-semibold text-ink">
            See if your property is in the right band
          </h3>
          <p className="mt-2 text-sm text-ink-2">
            Free to check. Takes 30 seconds. No account required.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:bg-accent-deep"
            >
              Start Free Check <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-paper-card px-6 py-3 text-sm font-semibold text-ink-2 shadow-sm transition-all duration-150 hover:bg-paper-2/50"
            >
              How it works
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
