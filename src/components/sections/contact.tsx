import { Download, Mail, Phone } from "lucide-react";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SocialLinks } from "@/components/public/social-icons";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

/**
 * Heading + direct contact links (email/phone/socials) and a résumé
 * download. This is a placeholder for the interactive contact form (Task
 * 24) — the `mailto:` link below is the seam it will replace; everything
 * else on this section stays as-is once the form lands.
 */
export function Contact({ profile }: { profile: Profile | null }) {
  if (!profile?.email) return null;

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="07 — Contact"
            title="Let's build something"
            description="Have a role, project, or idea in mind? I'd love to hear about it."
          />
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex flex-col gap-4">
            {/* Seam for Task 24: an interactive contact form replaces/joins
             * this mailto link. Keep the `href="mailto:..."` fallback intact
             * so contact never breaks if the form ships later. */}
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-2.5 font-display text-xl font-semibold text-foreground transition-colors hover:text-muted-foreground sm:text-2xl"
            >
              <Mail className="size-5 shrink-0" />
              {profile.email}
            </a>
            {profile.phone ? (
              <a
                href={`tel:${profile.phone}`}
                className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-4 shrink-0" />
                {profile.phone}
              </a>
            ) : null}
            <SocialLinks socials={profile.socials} className="mt-2" />
          </div>

          {profile.resume_url ? (
            <Button
              size="lg"
              variant="outline"
              render={<a href={profile.resume_url} target="_blank" rel="noopener noreferrer" />}
            >
              <Download className="size-4" />
              Download résumé
            </Button>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
