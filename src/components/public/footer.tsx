import Link from "next/link";
import { brand } from "@/lib/config";
import { GitHubIcon, LinkedInIcon } from "@/components/public/social-icons";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
] as const;

type SiteFooterProps = {
  name?: string;
  githubUrl?: string;
  linkedinUrl?: string;
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
  githubUrl = "https://github.com/whiteknight16",
  linkedinUrl = "https://www.linkedin.com/in/harshpandey61/",
  year = new Date().getFullYear(),
}: SiteFooterProps) {
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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-4" />
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <LinkedInIcon className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
