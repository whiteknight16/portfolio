import type { ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
  getEnabledSections,
  getExperiences,
  getFeaturedProjects,
  getLatestPosts,
  getProfile,
} from "@/lib/content";
import { brand } from "@/lib/config";
import { fillYears, formatExperienceYears } from "@/lib/format";
import { subscribePlacement } from "@/lib/home-view";
import { nowRows } from "@/lib/profile-view";
import type { Profile, SiteSection } from "@/lib/types";
import { Container } from "@/components/public/container";
import { Reveal } from "@/components/public/reveal";
import { Hero, type HeroProps } from "@/components/sections/hero";
import { ProofStrip } from "@/components/sections/proof-strip";
import { Built } from "@/components/sections/built";
import { NotesPreview, SubscribeCard } from "@/components/sections/notes-preview";
import { Newsletter } from "@/components/sections/newsletter";
import { Work } from "@/components/sections/work";

const FALLBACK_PHOTO = "/profile.png";

/**
 * The homepage. A server component: reads the profile, the enabled
 * `site_sections` and every section's data in one parallel round, then renders
 * Hero + ProofStrip (always) followed by the enabled sections in `sort_order`.
 * Every fetcher degrades to null/[] and every section hides itself without
 * data, so an unreachable database still yields a working page.
 */
export async function SiteHome() {
  const [profile, sections, projects, posts, experiences] = await Promise.all([
    getProfile(),
    getEnabledSections(),
    getFeaturedProjects(3),
    getLatestPosts(5),
    getExperiences(),
  ]);

  // The nav's "Subscribe" targets /#subscribe: exactly one block carries that
  // id and a form — the Newsletter panel, else a card in the Notes block, else
  // a card closing the page.
  const placement = subscribePlacement(sections.map((s) => s.key));

  const renderSection = (section: SiteSection): ReactNode => {
    switch (section.key) {
      case "projects":
        return <Built key={section.id} projects={projects} />;
      case "blog":
        return <NotesPreview key={section.id} posts={posts} subscribe={placement.notes ?? "form"} />;
      case "newsletter":
        return <Newsletter key={section.id} />;
      case "experience":
        return <Work key={section.id} experiences={experiences} variant="home" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Hero {...heroProps(profile)} />
      <ProofStrip profile={profile} />
      {sections.map(renderSection)}
      {placement.target === "end" ? (
        <section aria-label="Subscribe" className="pt-14">
          <Container>
            <Reveal>
              <SubscribeCard hasNotes={posts.length > 0} />
            </Reveal>
          </Container>
        </section>
      ) : null}
    </>
  );
}

/** Resolve everything time- or locale-dependent on the server so the client hero hydrates cleanly. */
function heroProps(profile: Profile | null): HeroProps {
  const years = formatExperienceYears(profile?.career_start_date ?? null);
  const place = profile?.location?.split(",")[0]?.trim() || null;
  const title = profile?.title?.trim() || brand.headline;
  const nowStamp = profile ? (profile.now_updated_at ?? profile.updated_at) : null;

  return {
    name: profile?.full_name || brand.name,
    kicker: place ? `${title} · ${place}` : title,
    thesis: fillYears(profile?.headline || brand.subline, years),
    lede: fillYears(profile?.tagline ?? "", years).trim(),
    photoSrc: profile?.avatar_url || FALLBACK_PHOTO,
    caption: place,
    nowRows: nowRows(profile),
    nowMonth: nowStamp ? format(parseISO(nowStamp), "MMM yyyy") : null,
    socials: profile?.socials ?? null,
  };
}
