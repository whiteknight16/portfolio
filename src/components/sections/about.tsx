import { MapPin } from "lucide-react";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import type { Profile } from "@/lib/types";

/** Bio + location, in a single readable column. Renders nothing if there's
 * no bio to show — a blank about section is worse than no section. */
export function About({ profile }: { profile: Profile | null }) {
  if (!profile?.bio) return null;

  return (
    <section id="about" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="About" title="About me" />
        </Reveal>
        <Reveal delay={0.1} className="mt-8 max-w-2xl">
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
          {profile.location ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {profile.location}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
