import { getExperiences } from "@/lib/content";
import { dateRange } from "@/lib/format";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { cn } from "@/lib/utils";

/** Timeline of roles, newest/`sort_order`-first. Self-fetches so `SiteHome`
 * doesn't need to know each section's data shape. Renders nothing when
 * there's no experience data yet. */
export async function ExperienceSection() {
  const experiences = await getExperiences();
  if (experiences.length === 0) return null;

  return (
    <section id="experience" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Experience" title="Where I've worked" />
        </Reveal>

        <div className="mt-12 flex flex-col gap-10 sm:gap-12">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={Math.min(i * 0.06, 0.3)}>
              <div className="grid gap-x-8 gap-y-2 sm:grid-cols-[9rem_1fr]">
                <p className="font-mono text-sm text-muted-foreground sm:pt-0.5">
                  {dateRange(exp.start_date, exp.end_date, exp.is_current)}
                </p>
                <div className="relative border-l border-border pl-6">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-[5px] top-1.5 size-2 rounded-full",
                      exp.is_current
                        ? "bg-brand"
                        : "bg-border",
                    )}
                  />
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {exp.role}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  {exp.highlights.length > 0 ? (
                    <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
                      {exp.highlights.map((highlight, hi) => (
                        <li key={hi} className="flex gap-2.5">
                          <span aria-hidden className="text-border">
                            —
                          </span>
                          <span className="text-pretty">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
