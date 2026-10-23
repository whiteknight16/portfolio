import { getSkillsByCategory } from "@/lib/content";
import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { TagChip } from "@/components/public/tag-chip";
import { SectionHeading } from "@/components/sections/section-heading";

/** About-page skills: one ruled block per category (Fraunces title over mono
 * chips), in a grid of 1 / 2 / 3 columns. Self-fetches; renders nothing when
 * there are no skills recorded yet. */
export async function Skills() {
  const groups = await getSkillsByCategory();
  if (groups.length === 0) return null;

  return (
    <section className="pt-14">
      <Container>
        <Reveal>
          <SectionHeading title="Skills" />
        </Reveal>

        <div className="mt-2.5 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-14">
          {groups.map((group, i) => (
            <Reveal
              key={group.category}
              delay={Math.min(i * 0.06, 0.24)}
              className="border-b border-rule py-5"
            >
              <h3 className="font-display text-[19px] leading-snug font-[450] tracking-[-0.01em] text-foreground">
                {group.category}
              </h3>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {group.items.map((skill) => (
                  <li key={skill.id}>
                    <TagChip className="text-xs">{skill.name}</TagChip>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
