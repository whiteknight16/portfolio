"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  Layers,
  FolderKanban,
  Briefcase,
  Sparkles,
  Trophy,
  GraduationCap,
  NotebookPen,
  Users,
  Mail,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/admin/login/actions";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
  { href: "/admin/sections", label: "Sections", icon: Layers },
  { href: "/admin/blog", label: "Notes", icon: NotebookPen },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  unreadMessageCount,
  onNavigate,
}: {
  pathname: string;
  unreadMessageCount?: number;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        const showUnreadBadge = href === "/admin/messages" && !!unreadMessageCount;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
            {showUnreadBadge ? <Badge className="ml-auto">{unreadMessageCount}</Badge> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminBrand() {
  return (
    <div className="flex flex-col leading-tight">
      <span className="font-display text-lg font-semibold tracking-tight">Admin</span>
      <span className="font-mono text-[11px] text-faint">@knightdeveloper</span>
    </div>
  );
}

function ViewSiteLink() {
  return (
    <Link
      href="/"
      target="_blank"
      rel="noopener"
      className="mb-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      View site ↗
    </Link>
  );
}

function SignOutForm() {
  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2.5 text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </form>
  );
}

export function AdminShell({
  children,
  unreadMessageCount,
}: {
  children: React.ReactNode;
  unreadMessageCount?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-rule bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center justify-between border-b border-rule px-4">
          <AdminBrand />
          <ThemeToggle />
        </div>
        <NavLinks pathname={pathname} unreadMessageCount={unreadMessageCount} />
        <div className="border-t border-rule p-3">
          <ViewSiteLink />
          <SignOutForm />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-ink-lg">
            <div className="flex h-16 items-center justify-between border-b border-rule px-4">
              <AdminBrand />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 hover:bg-sidebar-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavLinks
              pathname={pathname}
              unreadMessageCount={unreadMessageCount}
              onNavigate={() => setOpen(false)}
            />
            <div className="border-t border-rule p-3">
              <ViewSiteLink />
              <SignOutForm />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-rule px-4 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 hover:bg-muted"
          >
            <Menu className="size-5" />
          </button>
          <AdminBrand />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
