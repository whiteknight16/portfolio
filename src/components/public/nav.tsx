"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config";

const SECTION_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
] as const;

type SiteNavProps = {
  /** Brand name shown in the nav. Defaults to the site-wide brand config. */
  name?: string;
  /** Where the "Résumé" button links. Defaults to a static file in `/public`. */
  resumeUrl?: string;
  /** Show the Blog link. Controlled by the `blog` site section toggle. */
  blogEnabled?: boolean;
};

/**
 * Sticky top nav for the public site. A client component because the mobile
 * drawer and theme toggle both need interactivity; the brand name and resume
 * link are passed in as props (or default to `brand`) rather than fetched
 * here, so this stays a plain client component with no data dependency.
 */
export function SiteNav({
  name = brand.name,
  resumeUrl = "/resume.pdf",
  blogEnabled = true,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={close}
          className="font-display text-base font-bold tracking-tight text-foreground"
        >
          {name}
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 md:flex">
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {blogEnabled ? (
            <Link
              href="/blog"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Blog
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            size="sm"
            variant="outline"
            render={<a href={resumeUrl} target="_blank" rel="noopener noreferrer" />}
          >
            Résumé
          </Button>
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.nav
            id="mobile-nav"
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="overflow-hidden border-b border-border/60 bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3 sm:px-6">
              {SECTION_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {blogEnabled ? (
                <Link
                  href="/blog"
                  onClick={close}
                  className="rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Blog
                </Link>
              ) : null}
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="mt-1 rounded-md border border-border px-2.5 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Résumé
              </a>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
