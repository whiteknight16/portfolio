import type { Profile } from "@/lib/types";
import { brand, siteUrl } from "@/lib/config";

/**
 * Emits schema.org structured data as JSON-LD so search engines can build a
 * knowledge-graph entity for the site owner. This is the primary signal that
 * ties this website → the person → their LinkedIn/GitHub (`sameAs`), which is
 * what makes a *name* search surface the site and the linked profiles together.
 *
 * Rendered as a native `<script type="application/ld+json">` per the Next.js
 * recommendation; the `<` → `<` escaping guards against XSS from any
 * user-editable profile field.
 */
export function PersonJsonLd({ profile }: { profile: Profile | null }) {
  const name = profile?.full_name ?? brand.name;
  const jobTitle = profile?.title ?? brand.headline;
  const description = profile?.headline ?? brand.subline;

  // `sameAs` is the load-bearing field: every canonical profile that is
  // provably the same person. Order doesn't matter; only real, live URLs go in.
  const sameAs = [
    profile?.socials?.linkedin,
    profile?.socials?.github,
    profile?.socials?.twitter,
    profile?.socials?.website,
  ].filter((url): url is string => Boolean(url));

  const person = {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name,
    url: siteUrl,
    jobTitle,
    description,
    ...(profile?.avatar_url ? { image: profile.avatar_url } : {}),
    ...(profile?.email ? { email: profile.email } : {}),
    ...(profile?.location
      ? { address: { "@type": "PostalAddress", addressLocality: profile.location } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: `${name} — ${jobTitle}`,
    description,
    author: { "@id": `${siteUrl}/#person` },
    inLanguage: "en",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [person, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
