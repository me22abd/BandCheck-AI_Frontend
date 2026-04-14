import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CheckCircle2, MapPin, BarChart2, FileText, ArrowRight } from "lucide-react";

export const metadata = {
  title: "How It Works | BandCheck AI",
  description:
    "A simple, guided process to check your council tax band and build a strong appeal case in minutes.",
};

const steps = [
  {
    number: "01",
    icon: <MapPin className="h-6 w-6 text-blue-600" />,
    title: "Enter your postcode",
    summary: "We validate your postcode and instantly pull up nearby comparable properties.",
    detail: [
      "We verify your postcode against official UK address records to make sure we're looking at the right area.",
      "Our system fetches publicly available council tax band data for nearby properties — typically within a 0.5–1km radius.",
      "We identify which council tax band each nearby property sits in, giving you an immediate picture of what similar homes around you are paying.",
    ],
  },
  {
    number: "02",
    icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
    title: "Compare your band",
    summary: "See exactly how your band stacks up against similar nearby homes.",
    detail: [
      "We display a clear, structured table of nearby properties and their council tax bands side by side with yours.",
      "If any nearby homes of similar size and type sit in a lower band, that's a signal your property may be overassessed.",
      "We calculate a Case Strength Score — a simple indicator of how strong your appeal case looks based on the number and quality of comparable properties we find.",
    ],
  },
  {
    number: "03",
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    title: "Build your appeal",
    summary: "Answer a few questions and we generate a complete, structured appeal pack.",
    detail: [
      "Our guided appeal builder walks you through a short set of questions about your property — type, ownership, any extensions or changes.",
      "You select which evidence you have available: council tax bill, floor plan, photos, or extension history.",
      "We compile everything into a structured appeal document — including your property details, comparable properties, and grounds for appeal — ready for submission to the Valuation Office Agency (VOA).",
    ],
  },
];

const whyItWorks = [
  {
    title: "Based on real property comparisons",
    body: "The VOA's own guidance says you can appeal if similar nearby properties are in a lower band. We find those properties for you automatically.",
  },
  {
    title: "Uses proximity and similarity",
    body: "We only include properties that are geographically close and comparable in type — not random houses across the borough.",
  },
  {
    title: "Designed for clarity",
    body: "No legal jargon. No confusing forms. Every step is explained in plain English so you always know what you're doing and why.",
  },
  {
    title: "No solicitor required",
    body: "Council tax band appeals are a straightforward administrative process. You don't need legal representation — just the right information.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 text-gray-900">

        {/* Hero */}
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            How it works
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How BandCheck AI works
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            A simple, guided process to check your council tax band and build a
            strong appeal case in minutes. No jargon, no solicitors, no upfront
            cost.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:bg-blue-700"
            >
              Start Free Check <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-150 hover:bg-gray-50"
            >
              See pricing
            </Link>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Step {step.number}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    {step.summary}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {step.detail.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-gray-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why this works */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900">
            Why this works
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            The council tax appeal process is well established. The VOA is
            legally required to review your band if you can demonstrate that
            comparable nearby properties are assessed lower. We make finding
            that evidence fast and straightforward.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {whyItWorks.map(({ title, body }) => (
              <div
                key={title}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5"
              >
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-blue-100 bg-blue-50 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Ready to check your council tax band?
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            It takes 30 seconds. No account needed to check.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:bg-blue-700"
          >
            Start Free Check <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
