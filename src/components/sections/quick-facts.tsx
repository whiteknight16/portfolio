import Link from "next/link";
import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import type { FactItem, QuickFact } from "@/lib/facts";

const LINK =
  "underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground";

function FactValue({ item }: { item: FactItem }) {
  if (!item.href) return <>{item.text}</>;
  if (item.href.startsWith("/")) {
    return (
      <Link href={item.href} className={LINK}>
        {item.text}
      </Link>
    );
  }
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={LINK}>
      {item.text}
    </a>
  );
}

/**
 * About-page "Quick facts" card (`#facts`): the profile's key facts as a
 * definition list, two columns from `lg`. Every value comes from
 * `buildQuickFacts`, so nothing here is hand-typed; renders nothing without facts.
 */
export function QuickFacts({ facts }: { facts: QuickFact[] }) {
  if (facts.length === 0) return null;

  return (
    <section id="facts" aria-labelledby="facts-title" className="scroll-mt-24 pt-10">
      <Container>
        <Reveal>
          <div className="rounded-[4px] border-[1.5px] border-foreground bg-card px-5 pt-4.5 pb-2 shadow-ink sm:px-6">
            <h2
              id="facts-title"
              className="font-mono text-[11px] font-medium tracking-[0.12em] text-brand uppercase"
            >
              Quick facts
            </h2>
            <dl className="mt-3 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
              {facts.map(({ label, items }) => (
                <div
                  key={label}
                  className="grid grid-cols-[104px_minmax(0,1fr)] gap-x-4 border-t border-rule py-2.75 sm:grid-cols-[150px_minmax(0,1fr)]"
                >
                  <dt className="pt-0.75 font-mono text-[11.5px] text-faint">{label}</dt>
                  <dd className="font-display text-[16.5px] leading-snug text-pretty text-foreground">
                    {items.map((item, i) => (
                      <span key={item.text}>
                        {i > 0 ? ", " : null}
                        <FactValue item={item} />
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
