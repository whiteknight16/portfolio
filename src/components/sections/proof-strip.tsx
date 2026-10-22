import { proofCells } from "@/lib/profile-view";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

/**
 * Proof strip under the hero (mockup `.proof`): computed years first, then
 * up to three editable highlights. Four columns on desktop, two on mobile,
 * dashed rules between cells. Renders nothing when there are no cells.
 */
export function ProofStrip({ profile }: { profile: Profile | null }) {
  const cells = proofCells(profile);
  if (cells.length === 0) return null;

  return (
    <section aria-label="At a glance" className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="grid grid-cols-2 border-t-[1.5px] border-b border-t-foreground border-b-rule lg:grid-cols-4">
        {cells.map((cell, i) => (
          <div
            key={`${cell.value}-${i}`}
            className={cn(
              "border-dashed border-rule py-4 pr-3 sm:pr-4.5",
              // mobile: 2×2 with a dashed vertical and horizontal rule
              i % 2 === 1 && "border-l pl-3 sm:pl-4.5",
              i >= 2 && "border-t",
              // desktop: one row, dashed rule before every cell but the first
              "lg:border-t-0",
              i > 0 ? "lg:border-l lg:pl-4.5" : "lg:border-l-0 lg:pl-0",
            )}
          >
            <p className="font-display text-[26px] leading-tight font-normal tracking-[-0.02em] text-foreground sm:text-[30px]">
              {cell.value}
            </p>
            <p className="mt-0.5 font-mono text-[11.5px] leading-[1.4] text-muted-foreground">
              {cell.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
