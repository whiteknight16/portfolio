import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { SocialLinks } from "@/components/public/social-icons";
import { ContactForm } from "@/components/sections/contact-form";
import type { Profile } from "@/lib/types";

/**
 * About-page "Say hello" block: a short note, the email address and social
 * links on the left, the contact form on the right (stacked on mobile). The
 * `mailto:` link stays as a fallback so contact never depends on the form.
 */
export function Contact({ profile }: { profile: Profile | null }) {
  const email = profile?.email?.trim();

  return (
    <section id="contact" className="scroll-mt-24 pt-14">
      <Container>
        <Reveal>
          <SectionHeading
            title="Say hello"
            note="A question, a thought on something I wrote, or just hi. I read everything."
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-7 grid grid-cols-1 gap-9 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div className="flex flex-col items-start gap-4">
            {email ? (
              <a
                href={`mailto:${email}`}
                className="font-display text-xl font-[450] tracking-[-0.01em] break-all text-foreground underline decoration-rule underline-offset-4 transition-colors hover:decoration-foreground sm:text-2xl"
              >
                {email}
              </a>
            ) : null}
            <SocialLinks socials={profile?.socials ?? null} className="gap-4.5" iconClassName="size-4.5" />
          </div>

          <ContactForm />
        </Reveal>
      </Container>
    </section>
  );
}
