import { Award } from "lucide-react";
import { getAchievements } from "@/lib/content";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";

/** Grid of achievement title + description tiles. Self-fetches; renders
 * nothing when there are no achievements recorded yet. */
export async function Achievements() {
  const achievements = await getAchievements();
  if (achievements.length === 0) return null;

  return (
    <section id="achievements" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="05 — Achievements" title="Recognition along the way" />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {achievements.map((achievement, i) => (
            <Reveal key={achievement.id} delay={Math.min(i * 0.06, 0.24)}>
              <div className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <Award className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {achievement.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
