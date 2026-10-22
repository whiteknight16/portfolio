"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config";
import { handleSlug } from "@/lib/format";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/notes", label: "Notes" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
] as const;

type SiteNavProps = {
  name?: string;
  handle?: string;
};

/**
 * Sticky Field notes nav. Client component for the mobile drawer, theme
 * toggle and active-link state. "Subscribe" points at `#subscribe`; the
 * homepage, the notes list and each note page provide that anchor.
 */
export function SiteNav({ name = brand.name, handle = brand.handle }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();

  // The notes list and each note page carry their own in-page subscribe card.
  const subscribeHref =
    pathname === "/notes" || pathname.startsWith("/notes/") ? "#subscribe" : "/#subscribe";

  const close = () => setOpen(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={close} className="flex items-baseline">
          <span className="font-display text-[19px] font-semibold tracking-tight text-foreground">
            {name}
          </span>
          <small className="ml-2 hidden font-mono text-[11px] font-normal text-faint sm:inline">
            @{handleSlug(handle)}
          </small>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-[26px] text-sm md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "transition-colors hover:text-foreground",
                isActive(link.href) ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button
            size="sm"
            className="bg-foreground font-mono text-background hover:bg-foreground/85"
            nativeButton={false}
            render={<Link href={subscribeHref} />}
          >
            Subscribe
          </Button>
          <ThemeToggle />
        </nav>

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
            className="overflow-hidden border-b border-rule bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3 sm:px-6">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground",
                    isActive(link.href) ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={subscribeHref}
                onClick={close}
                className="mt-1 rounded-[3px] bg-foreground px-2.5 py-2 text-center font-mono text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Subscribe
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
