/**
 * The social profiles the site links to, in display order: icons in
 * `SocialLinks`, text links in the About page's Quick facts.
 */

import type { Profile } from "./types.ts";

export const SOCIALS = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "X" },
  { key: "website", label: "Website" },
] as const;

export type SocialKey = (typeof SOCIALS)[number]["key"];

/** The profile's set social links, in `SOCIALS` order. */
export function socialLinks(
  socials: Profile["socials"] | null | undefined,
): { key: SocialKey; label: string; href: string }[] {
  return SOCIALS.flatMap(({ key, label }) => {
    const href = socials?.[key];
    return href ? [{ key, label, href }] : [];
  });
}
