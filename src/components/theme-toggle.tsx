"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

/**
 * True only once the client has taken over. Implemented via
 * `useSyncExternalStore` (server snapshot `false`, client snapshot `true`)
 * rather than a `useState` + `useEffect` pair, which avoids a redundant
 * setState-in-effect render and the corresponding lint warning while giving
 * the identical signal.
 */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Light/dark toggle. `next-themes` only knows the real theme after the client
 * mounts (the server can't know the visitor's OS preference), so we render an
 * inert placeholder of identical size first to avoid a hydration mismatch and
 * a layout jump once the real icon appears.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        disabled
        className={cn("text-muted-foreground", className)}
      >
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
