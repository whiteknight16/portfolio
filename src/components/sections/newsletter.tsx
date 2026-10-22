import { Reveal } from "@/components/public/reveal";
import { SubscribeForm } from "@/components/public/subscribe-form";

/**
 * Dark subscribe panel (mockup `.sub`), the target of the nav's "Subscribe"
 * (`/#subscribe`). The panel is literal ink `#1d1a16` in both themes: the
 * `ink` SubscribeForm's colours were contrast-checked against exactly that.
 */
export function Newsletter() {
  return (
    <section id="subscribe" className="mx-auto max-w-5xl scroll-mt-24 px-4 pt-14 sm:px-6">
      <Reveal>
        <div className="grid gap-5 rounded-[4px] bg-[#1d1a16] px-5 py-6 text-[#f3eee4] sm:px-7.5 sm:py-6.5 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-7.5 dark:border dark:border-rule">
          <div>
            <h2 className="font-display text-[26px] leading-[1.1] font-normal tracking-[-0.02em] sm:text-[28px]">
              Get the next note <em className="text-[#fde68a] italic">in your inbox.</em>
            </h2>
            <p className="mt-2 text-[13.5px] leading-normal text-[#b9b0a2]">
              One email when I publish something new. Nothing else.
            </p>
          </div>
          <SubscribeForm variant="ink" source="/" />
        </div>
      </Reveal>
    </section>
  );
}
