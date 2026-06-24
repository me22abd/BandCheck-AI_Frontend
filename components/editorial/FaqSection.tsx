import { FAQ_ITEMS } from "@/lib/faq";
import { EditorialCard } from "@/components/editorial/EditorialCard";

export function FaqSection() {
  return (
    <section id="faq" className="mt-16 scroll-mt-24">
      <h2 className="font-serif text-xl text-ink">Frequently asked questions</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        Quick answers to common questions about council tax checks and appeals.
      </p>

      <div className="mt-6 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <EditorialCard key={item.question} className="overflow-hidden p-0">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="shrink-0 text-ink-3 transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="border-t border-hairline px-5 pb-4 pt-3">
                <p className="text-sm leading-relaxed text-ink-2">{item.answer}</p>
              </div>
            </details>
          </EditorialCard>
        ))}
      </div>
    </section>
  );
}
