import { getSkillsByCategory } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";

/** Skills grouped by category as tag chips. Self-fetches; renders nothing
 * when there are no skills recorded yet. */
export async function Skills() {
  const groups = await getSkillsByCategory();
  if (groups.length === 0) return null;

  return (
    <section id="skills" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Skills" title="Tools I reach for" />
        </Reveal>

        <div className="mt-12 flex flex-col gap-8">
          {groups.map((group, i) => (
            <Reveal key={group.category} delay={Math.min(i * 0.06, 0.24)}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                {group.category}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="h-auto rounded-full px-3 py-1.5 text-sm font-normal text-foreground/80"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
