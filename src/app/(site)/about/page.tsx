import type { Metadata } from "next";
import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { SocialLinks } from "@/components/public/social-icons";
import { Achievements } from "@/components/sections/achievements";
import { Contact } from "@/components/sections/contact";
import { EducationSection } from "@/components/sections/education";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { JsonLd } from "@/components/seo/json-ld";
import { getExperiences, getProfile } from "@/lib/content";
import { brand, rssAlternateTypes, defaultOgImages, siteUrl } from "@/lib/config";
import { fillYears, firstSentence, formatExperienceYears } from "@/lib/format";
import { buildProfilePageJsonLd } from "@/lib/seo";

// Reads the profile and every About block straight from the database per request.
export const dynamic = "force-dynamic";

const FALLBACK_PHOTO = "/profile.png";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.full_name || brand.name;
  const years = formatExperienceYears(profile?.career_start_date ?? null);
  const description = firstSentence(fillYears(profile?.bio ?? "", years)) || brand.subline;
  const title = `About — ${name}`;

  return {
    title,
    description,
    alternates: { canonical: "/about", types: rssAlternateTypes },
    openGraph: { title, description, type: "profile", url: "/about", siteName: name, images: defaultOgImages },
    twitter: { card: "summary_large_image", title, description, images: defaultOgImages },
  };
}

export default async function AboutPage() {
  const [profile, experiences] = await Promise.all([getProfile(), getExperiences()]);

  const name = profile?.full_name || brand.name;
  const handle = profile?.handle || brand.handle;
  const years = formatExperienceYears(profile?.career_start_date ?? null);
  const bio = fillYears(profile?.bio ?? "", years).trim();
  const paragraphs = bio ? bio.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) : [];
  const place = profile?.location?.trim() || null;
  const photo = profile?.avatar_url || FALLBACK_PHOTO;
  const resume = profile?.resume_url?.trim() || null;

  return (
    <>
      <JsonLd data={buildProfilePageJsonLd(siteUrl)} />

      <Container as="header" className="pt-12 sm:pt-16">
        <Reveal className="grid items-start gap-9 border-b-[1.5px] border-foreground pb-9 lg:grid-cols-[250px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr] xl:gap-16">
          <figure className="relative mx-auto w-62.5 max-w-[80%] rotate-[-2deg] border border-rule bg-card p-2.5 pb-8.5 shadow-[4px_6px_0_color-mix(in_oklab,var(--foreground)_85%,transparent)] lg:mx-0 xl:w-70">
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 h-6 w-22.5 -translate-x-1/2 rotate-3 bg-[#fde68a]/75 dark:bg-[#fde68a]/45"
            />
            {/* Plain <img>: avatar_url may be any remote host (Supabase storage). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`Photo of ${name}`}
              className="block h-65 w-full bg-muted object-cover xl:h-73"
            />
            {place ? (
              <figcaption className="absolute right-3.5 bottom-2.25 font-display text-sm text-muted-foreground italic">
                {place.split(",")[0]?.trim()}
              </figcaption>
            ) : null}
          </figure>

          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-brand uppercase">
              About
            </p>
            <h1 className="mt-3 font-display text-[44px] leading-none font-normal tracking-[-0.03em] text-foreground sm:text-[56px]">
              {name}
            </h1>
            {handle ? (
              <p className="mt-3 font-mono text-xs text-faint">known online as {handle}</p>
            ) : null}
            {paragraphs.length > 0 ? (
              <div className="mt-5 max-w-[68ch] space-y-4 font-display text-[19px] leading-[1.55] font-light text-pretty text-foreground">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : null}
            <SocialLinks socials={profile?.socials ?? null} className="mt-5.5 gap-4.5" iconClassName="size-4.5" />
          </div>
        </Reveal>
      </Container>

      <Work experiences={experiences} variant="full" />
      <Skills />
      {/* Side by side from lg; either one alone takes the full width. */}
      <Container className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16 lg:[&>*:only-child]:col-span-2">
        <Achievements />
        <EducationSection />
      </Container>
      <Contact profile={profile} />

      {resume ? (
        <Container className="mt-10">
          <p>
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground underline decoration-rule underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              Résumé (PDF)
            </a>
          </p>
        </Container>
      ) : null}
    </>
  );
}
