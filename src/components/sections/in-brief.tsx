import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import type { QA } from "@/lib/facts";

/**
 * About-page "In brief" (`#in-brief`): short, self-contained answers about
 * Harsh, the same ones the page's FAQPage JSON-LD carries. Renders nothing
 * without any.
 */
export function InBrief({ qas }: { qas: QA[] }) {
  if (qas.length === 0) return null;

  return (
    <section id="in-brief" className="scroll-mt-24 pt-14">
      <Container>
        <Reveal>
          <SectionHeading title="In brief" />
        </Reveal>

        <div className="mt-2.5">
          {qas.map((qa, i) => (
            <Reveal
              key={qa.question}
              delay={Math.min(i * 0.06, 0.24)}
              className="grid grid-cols-1 gap-y-1.5 border-b border-rule py-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-x-12"
            >
              <h3 className="font-display text-[19px] leading-snug font-[450] tracking-[-0.01em] text-foreground">
                {qa.question}
              </h3>
              <p className="max-w-[72ch] text-[15px] leading-[1.6] text-pretty wrap-anywhere text-muted-foreground lg:pt-0.5">
                {qa.answer}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
