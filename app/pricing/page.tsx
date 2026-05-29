import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Pricing | BandCheck AI",
  description:
    "Free to check. Only pay if your appeal is successful. No hidden fees, no subscription, no obligation.",
};

const included = [
  "Instant postcode band check",
  "Full comparable property table",
  "Case strength score",
  "Guided appeal builder",
  "Structured appeal document",
  "Evidence checklist",
  "Submission guidance",
];

const savingsExamples = [
  { from: "D", to: "C", perYear: "£361", refund: "£3,000+", fee: "~£300" },
  { from: "E", to: "D", perYear: "£480", refund: "£4,000+", fee: "~£400" },
  { from: "F", to: "E", perYear: "£620", refund: "£5,000+", fee: "~£500" },
];

const faqs = [
  {
    q: "When do I pay the success fee?",
    a: "Only after your appeal is formally accepted and your council confirms a band reduction. You receive the savings first — we invoice you after.",
  },
  {
    q: "What if my appeal is rejected?",
    a: "You pay nothing. The check, case review, appeal pack, and all guidance are provided at no cost to you. If the appeal doesn't succeed, we don't earn anything either.",
  },
  {
    q: "Is there a minimum saving amount?",
    a: "No minimum. Even a reduction of one band saves you money every year — and potentially a backdated refund too. Our fee is always proportional to what you actually save.",
  },
  {
    q: "How is the success fee calculated?",
    a: "We take a small, transparent percentage of the total refund you receive. We'll confirm the exact percentage before you proceed — there are no surprises.",
  },
  {
    q: "Do I need to pay to use the appeal builder?",
    a: "No. The entire process — postcode check, comparison, case review, and appeal pack generation — is completely free to use. You only pay if your appeal succeeds.",
  },
  {
    q: "Are there any hidden fees or subscriptions?",
    a: "None. No monthly subscription, no credit card required to check, no onboarding fee. It is entirely free until you receive savings from a successful appeal.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper-gradient">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 text-ink">

        {/* Hero */}
        <div className="mb-16 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Pricing
          </p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Simple, fair pricing
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2">
            Everything is free to use. We only charge a small percentage of your
            savings — and only if your appeal is successful. No win, no fee.
          </p>
        </div>

        {/* Main pricing block */}
        <div className="grid gap-6 sm:grid-cols-2">

          {/* Free tier */}
          <div className="rounded-xl border border-hairline bg-paper-card p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-3">
              Always free
            </p>
            <h2 className="mt-3 text-2xl font-bold text-ink">£0</h2>
            <p className="mt-1 text-sm text-ink-3">No card required. No signup fee.</p>

            <ul className="mt-6 space-y-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-ink-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep"
            >
              Start Free Check <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Success fee */}
          <div className="rounded-xl border border-hairline bg-paper-card p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-3">
              If your appeal succeeds
            </p>
            <h2 className="mt-3 text-2xl font-bold text-ink">
              Small % of savings
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Only charged after you receive your refund.
            </p>

            <div className="mt-6 rounded-xl border border-hairline bg-forest/5 p-4">
              <p className="text-sm font-semibold text-forest">How it works in practice</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                If your refund is <span className="font-semibold text-ink">£3,000</span>, we take a small percentage of
                that — so you keep the vast majority of the savings. We only
                succeed when you do.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "No upfront payment",
                "No hidden fees",
                "No obligation to proceed",
                "Fee confirmed before you submit",
              ].map((line) => (
                <div key={line} className="flex items-center gap-3 text-sm text-ink-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings examples */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-ink">
            What you could save
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            Estimates based on average band reductions in England. Actual savings
            depend on your local authority rates and the extent of any backdated
            refund.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-hairline bg-paper-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-paper-2/40 text-xs font-medium uppercase tracking-wide text-ink-3">
                  <th className="px-5 py-3 text-left">Band reduction</th>
                  <th className="px-5 py-3 text-left">Saving per year</th>
                  <th className="px-5 py-3 text-left">Typical refund</th>
                  <th className="px-5 py-3 text-left">Approx. fee</th>
                </tr>
              </thead>
              <tbody>
                {savingsExamples.map(({ from, to, perYear, refund, fee }, i) => (
                  <tr
                    key={from}
                    className={`border-b border-hairline last:border-b-0 ${i % 2 === 0 ? "" : "bg-paper-2/30"}`}
                  >
                    <td className="px-5 py-3 font-medium text-ink">
                      Band {from} → Band {to}
                    </td>
                    <td className="px-5 py-3 text-ink-2">{perYear}</td>
                    <td className="px-5 py-3 font-semibold text-forest">{refund}</td>
                    <td className="px-5 py-3 text-ink-3">{fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink-3">
            Fee shown is an approximate illustration only. Exact percentage confirmed before submission.
          </p>
        </div>

        {/* Reassurance row */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: <ShieldCheck className="h-5 w-5 text-forest" />, title: "No hidden fees", body: "The fee structure is explained clearly before you submit anything. No surprises." },
            { icon: <ShieldCheck className="h-5 w-5 text-forest" />, title: "No obligation", body: "You can generate and review your appeal pack without any commitment to proceed." },
            { icon: <ShieldCheck className="h-5 w-5 text-forest" />, title: "Transparent process", body: "We show you every comparable property we used and explain exactly how your case was assessed." },
          ].map(({ icon, title, body }) => (
            <div key={title} className="rounded-lg border border-hairline bg-paper-2/40 p-5">
              <div className="flex items-center gap-3">
                {icon}
                <p className="text-sm font-semibold text-ink">{title}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-4">
            {faqs.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-lg border border-hairline bg-paper-card p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-ink">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-hairline bg-accent/5 p-8 text-center">
          <h3 className="text-lg font-semibold text-ink">
            Free to check. You only pay if you save.
          </h3>
          <p className="mt-2 text-sm text-ink-2">
            Enter your postcode and see your results in 30 seconds.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper shadow-btn-accent transition-all hover:bg-accent-deep"
          >
            Start Free Check <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
