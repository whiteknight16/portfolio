"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config";

const SECTION_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#projects", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#about", label: "About" },
] as const;

type SiteNavProps = {
  /** Brand name shown in the nav. Defaults to the site-wide brand config. */
  name?: string;
  /** Show the Blog link. Controlled by the `blog` site section toggle. */
  blogEnabled?: boolean;
};

/**
 * Sticky top nav for the public site. A client component because the mobile
 * drawer and theme toggle both need interactivity; the brand name is passed in
 * as a prop (or defaults to `brand`) rather than fetched here, so this stays a
 * plain client component with no data dependency.
 *
 * The primary action is "Start a project", not a resume download — this site
 * is selling an engagement, and the resume lives quietly in the contact block.
 */
export function SiteNav({ name = brand.name, blogEnabled = true }: SiteNavProps) {
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
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            render={<Link href="/#contact" />}
          >
            Start a project
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
              <Link
                href="/#contact"
                onClick={close}
                className="mt-1 rounded-md bg-brand px-2.5 py-2 text-center text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Start a project
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
