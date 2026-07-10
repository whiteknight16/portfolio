import { getEducation } from "@/lib/content";
import { dateRange } from "@/lib/format";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

/** Degree, institution, dates, and an optional description per entry.
 * Self-fetches; renders nothing when there are no education entries yet. */
export async function EducationSection() {
  const education = await getEducation();
  if (education.length === 0) return null;

  return (
    <section id="education" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="06 — Education" title="Academic background" />
        </Reveal>

        <div className="mt-12 flex flex-col gap-8">
          {education.map((entry, i) => (
            <Reveal key={entry.id} delay={Math.min(i * 0.06, 0.24)}>
              <div className="grid gap-x-8 gap-y-2 sm:grid-cols-[9rem_1fr]">
                <p className="font-mono text-sm text-muted-foreground sm:pt-0.5">
                  {entry.start_date ? dateRange(entry.start_date, entry.end_date, false) : null}
                </p>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {entry.degree}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {entry.institution}
                    {entry.location ? ` · ${entry.location}` : ""}
                  </p>
                  {entry.description ? (
                    <p className="mt-3 text-pretty text-sm text-muted-foreground">
                      {entry.description}
                    </p>
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
