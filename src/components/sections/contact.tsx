import { Download, Mail } from "lucide-react";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SocialLinks } from "@/components/public/social-icons";
import { ContactForm } from "@/components/sections/contact-form";
import type { Profile } from "@/lib/types";

/**
 * Heading, direct contact links (email/phone/socials), a resume download,
 * and the interactive contact form — two columns on desktop, stacked on
 * mobile. The `mailto:`/`tel:` links stay as a fallback alongside the form
 * so contact never breaks if a submission fails client-side.
 */
export function Contact({ profile }: { profile: Profile | null }) {
  if (!profile?.email) return null;

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            title="Tell me about your project"
            note="Describe what you're building and where it's stuck. I'll come back with whether I can help, how I'd approach it, and what it would take."
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-2.5 font-display text-xl font-semibold text-foreground transition-colors hover:text-muted-foreground sm:text-2xl"
            >
              <Mail className="size-5 shrink-0" />
              {profile.email}
            </a>
            <SocialLinks socials={profile.socials} className="mt-2" />

            {profile.resume_url ? (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                <Download className="size-3.5" />
                Resume, if you need the long version
              </a>
            ) : null}
          </div>

          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
