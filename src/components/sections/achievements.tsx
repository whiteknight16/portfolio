import { getAchievements } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

/** About-page achievements: a ruled list of title + description.
 * Self-fetches; renders nothing when there are none recorded yet. */
export async function Achievements() {
  const achievements = await getAchievements();
  if (achievements.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
      <Reveal>
        <SectionHeading title="Achievements" />
      </Reveal>

      <ul className="mt-2.5">
        {achievements.map((achievement, i) => (
          <li key={achievement.id} className="border-b border-rule">
            <Reveal delay={Math.min(i * 0.06, 0.24)} className="py-5">
              <h3 className="font-display text-[19px] leading-snug font-[450] tracking-[-0.01em] text-foreground">
                {achievement.title}
              </h3>
              {achievement.description ? (
                <p className="mt-1.5 max-w-170 text-[14.5px] leading-[1.55] text-pretty text-muted-foreground">
                  {achievement.description}
                </p>
              ) : null}
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
