import { getSkillsByCategory } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { TagChip } from "@/components/public/tag-chip";
import { SectionHeading } from "@/components/sections/section-heading";

/** About-page skills: mono chips under a Fraunces title per category.
 * Self-fetches; renders nothing when there are no skills recorded yet. */
export async function Skills() {
  const groups = await getSkillsByCategory();
  if (groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
      <Reveal>
        <SectionHeading title="Skills" />
      </Reveal>

      <div className="mt-2.5">
        {groups.map((group, i) => (
          <Reveal
            key={group.category}
            delay={Math.min(i * 0.06, 0.24)}
            className="grid gap-y-2.5 border-b border-rule py-5 sm:grid-cols-[150px_1fr] sm:gap-x-5.5"
          >
            <h3 className="font-display text-[19px] leading-snug font-[450] tracking-[-0.01em] text-foreground">
              {group.category}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.map((skill) => (
                <li key={skill.id}>
                  <TagChip className="text-xs">{skill.name}</TagChip>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
