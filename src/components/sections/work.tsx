import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { TagChip } from "@/components/public/tag-chip";
import { SectionHeading } from "@/components/sections/section-heading";
import { dateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Experience } from "@/lib/types";

const HOME_TAGS = 2;

/**
 * Job history (mockup `.roles` / `.role`), kept apart from personal projects.
 * `home`: first highlight and up to two tags per role, linking to About.
 * `full` (About page): every highlight as a list and every tag.
 * Renders nothing without experiences.
 */
export function Work({
  experiences,
  variant,
}: {
  experiences: Experience[];
  variant: "home" | "full";
}) {
  if (experiences.length === 0) return null;
  const home = variant === "home";

  return (
    <section id="work" className="scroll-mt-24 pt-14">
      <Container>
        <Reveal>
          <SectionHeading
            title="Work"
            note="What I've built for the teams I've worked with."
            href={home ? "/about#work" : undefined}
            linkLabel={home ? "full story on About →" : undefined}
          />
        </Reveal>

        <ol className="mt-2.5">
          {experiences.map((exp) => {
            // `tags` arrived in migration 0006; a database without it has no tags.
            const allTags = exp.tags ?? [];
            const tags = home ? allTags.slice(0, HOME_TAGS) : allTags;
            const highlights = home ? exp.highlights.slice(0, 1) : exp.highlights;

            return (
              <li
                key={exp.id}
                className="grid grid-cols-1 gap-y-1.5 border-b border-rule py-5 sm:grid-cols-[150px_1fr] sm:gap-x-5.5 lg:grid-cols-[150px_1fr_150px] xl:grid-cols-[150px_1fr_240px]"
              >
                <p
                  className={cn(
                    "font-mono text-xs sm:pt-1.25",
                    exp.is_current ? "text-brand" : "text-faint",
                  )}
                >
                  {dateRange(exp.start_date, exp.end_date, exp.is_current)}
                </p>

                <div>
                  <h3 className="font-display text-[21px] leading-snug font-[450] tracking-[-0.01em] text-foreground">
                    {exp.role}
                    <span className="font-light text-muted-foreground"> · {exp.company}</span>
                  </h3>
                  {home ? (
                    highlights[0] ? (
                      <p className="mt-1.5 max-w-[72ch] text-[14.5px] leading-[1.55] text-muted-foreground">
                        {highlights[0]}
                      </p>
                    ) : null
                  ) : highlights.length > 0 ? (
                    <ul className="mt-2 max-w-[72ch] list-disc space-y-1.5 pl-5 text-[14.5px] leading-[1.55] text-muted-foreground marker:text-faint">
                      {highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1 sm:col-start-2 lg:col-start-auto lg:justify-end lg:self-start lg:pt-1.25">
                    {tags.map((tag) => (
                      <TagChip key={tag}>{tag}</TagChip>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
