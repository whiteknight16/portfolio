import { getEducation } from "@/lib/content";
import { dateRange } from "@/lib/format";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

/** About-page education: date column, degree, institution and optional note
 * per entry. Self-fetches; renders nothing when there are no entries yet. */
export async function EducationSection() {
  const education = await getEducation();
  if (education.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
      <Reveal>
        <SectionHeading title="Education" />
      </Reveal>

      <ol className="mt-2.5">
        {education.map((entry, i) => (
          <li key={entry.id} className="border-b border-rule">
            <Reveal
              delay={Math.min(i * 0.06, 0.24)}
              className="grid grid-cols-1 gap-y-1.5 py-5 sm:grid-cols-[150px_1fr] sm:gap-x-5.5"
            >
              <p className="font-mono text-xs text-faint sm:pt-1.25">
                {entry.start_date
                  ? dateRange(entry.start_date, entry.end_date, false)
                  : null}
              </p>
              <div>
                <h3 className="font-display text-[21px] leading-snug font-[450] tracking-[-0.01em] text-foreground">
                  {entry.degree}
                  <span className="font-light text-muted-foreground">
                    {" "}
                    · {entry.institution}
                    {entry.location ? `, ${entry.location}` : ""}
                  </span>
                </h3>
                {entry.description ? (
                  <p className="mt-1.5 text-[14.5px] leading-[1.55] text-pretty text-muted-foreground">
                    {entry.description}
                  </p>
                ) : null}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
