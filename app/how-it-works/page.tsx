import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { EditorialCard } from "@/components/editorial/EditorialCard";
import { SmallChip } from "@/components/editorial/SmallChip";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { FaqSection } from "@/components/editorial/FaqSection";

export const metadata = {
  title: "How It Works",
  description:
    "A simple, guided process to check your council tax band and build a strong appeal case in minutes.",
};

const steps = [
  {
    number: "01",
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
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 text-ink">
        <div className="mb-16 max-w-2xl">
          <SmallChip tone="accent">How it works</SmallChip>
          <h1 className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl">
            How BandCheck AI works
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            A simple, guided process to check your council tax band and build a
            strong appeal case in minutes. No jargon, no solicitors, no upfront
            cost.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/">
              Start free check <ArrowRight className="h-4 w-4" />
            </EditorialButton>
            <EditorialButton href="/pricing" variant="secondary">
              See pricing
            </EditorialButton>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <EditorialCard key={step.number} className="p-6 sm:p-8">
              <p className="font-mono text-[11px] font-medium text-accent">
                Step {step.number}
              </p>
              <h2 className="mt-2 font-serif text-xl text-ink">{step.title}</h2>
              <p className="mt-2 text-sm font-medium text-ink-2">{step.summary}</p>
              <ul className="mt-4 space-y-3">
                {step.detail.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-ink-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                    {point}
                  </li>
                ))}
              </ul>
            </EditorialCard>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-serif text-xl text-ink">Why this works</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            The council tax appeal process is well established. The VOA is
            legally required to review your band if you can demonstrate that
            comparable nearby properties are assessed lower. We make finding
            that evidence fast and straightforward.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {whyItWorks.map(({ title, body }) => (
              <EditorialCard key={title} className="p-5">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p>
              </EditorialCard>
            ))}
          </div>
        </div>

        <FaqSection />

        <EditorialCard className="mt-16 p-8 text-center">
          <h3 className="font-serif text-lg text-ink">
            Ready to check your council tax band?
          </h3>
          <p className="mt-2 text-sm text-ink-2">
            It takes 30 seconds. No account needed to check.
          </p>
          <div className="mt-6">
            <EditorialButton href="/">
              Start free check <ArrowRight className="h-4 w-4" />
            </EditorialButton>
          </div>
        </EditorialCard>
      </main>
    </div>
  );
}
