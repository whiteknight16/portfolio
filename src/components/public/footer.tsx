import Link from "next/link";
import { brand } from "@/lib/config";
import { Container } from "@/components/public/container";
import { SocialLinks } from "@/components/public/social-icons";
import type { Profile } from "@/lib/types";

const FOOTER_LINKS = [
  { href: "/notes", label: "notes" },
  { href: "/notes/rss.xml", label: "rss", external: true },
  { href: "/#subscribe", label: "subscribe" },
] as const;

type SiteFooterProps = {
  name?: string;
  handle?: string;
  socials?: Profile["socials"] | null;
  year?: number;
};

/** Field notes footer: mono copyright left, links + socials right. Server component. */
export function SiteFooter({
  name = brand.name,
  handle = brand.handle,
  socials,
  year = new Date().getFullYear(),
}: SiteFooterProps) {
  return (
    <footer className="mt-16 border-t border-rule">
      <Container className="flex flex-col gap-4 pt-6 pb-8 font-mono text-xs text-faint md:flex-row md:items-center md:justify-between">
        <p>
          &copy; {year} {name} &middot; {handle}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <nav className="flex gap-x-5">
            {FOOTER_LINKS.map((link) =>
              "external" in link ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <SocialLinks socials={socials} iconClassName="size-4" className="gap-3.5" />
        </div>
      </Container>
    </footer>
  );
}
