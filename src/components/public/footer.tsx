import Link from "next/link";
import { brand } from "@/lib/config";
import { SocialLinks } from "@/components/public/social-icons";
import type { Profile } from "@/lib/types";

const BASE_NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Blog", blogOnly: true },
  { href: "/#contact", label: "Contact" },
] as const;

type SiteFooterProps = {
  name?: string;
  socials?: Profile["socials"] | null;
  /** Show the Blog link. Controlled by the `blog` site section toggle. */
  blogEnabled?: boolean;
  /** Copyright year. Defaults to the current year — pass a fixed value from
   * a server component to keep output stable if that ever matters. */
  year?: number;
};

/**
 * Minimal footer: brand + copyright, a handful of nav links, and social
 * icons. A server component — nothing here needs interactivity, and
 * `new Date().getFullYear()` is safe to compute at request time.
 */
export function SiteFooter({
  name = brand.name,
  socials,
  blogEnabled = true,
  year = new Date().getFullYear(),
}: SiteFooterProps) {
  const navLinks = BASE_NAV_LINKS.filter(
    (link) => !("blogOnly" in link) || blogEnabled,
  );

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-semibold tracking-tight text-foreground">
            {name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            &copy; {year} {name}. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <SocialLinks socials={socials} iconClassName="size-4" />
      </div>
    </footer>
  );
}
