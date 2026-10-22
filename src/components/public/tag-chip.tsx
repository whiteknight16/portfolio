import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small mono tag chip (mockup `.tag`): card fill, rule border, 3px corners. */
export function TagChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-[3px] border border-rule bg-card px-1.75 py-0.5 font-mono text-[11px] leading-normal text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
