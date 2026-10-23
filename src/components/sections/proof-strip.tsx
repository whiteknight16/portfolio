import { Container } from "@/components/public/container";
import { proofCells } from "@/lib/profile-view";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

/**
 * Proof strip under the hero (mockup `.proof`): computed years first, then
 * up to three editable highlights. Four columns from `md`, two below that,
 * dashed rules between cells. Renders nothing when there are no cells.
 */
export function ProofStrip({ profile }: { profile: Profile | null }) {
  const cells = proofCells(profile);
  if (cells.length === 0) return null;

  return (
    <section aria-label="At a glance">
      <Container>
        <div className="grid grid-cols-2 border-t-[1.5px] border-b border-t-foreground border-b-rule md:grid-cols-4">
          {cells.map((cell, i) => (
            <div
              key={`${cell.value}-${i}`}
              className={cn(
                "border-dashed border-rule py-4 pr-3 sm:pr-4.5",
                // below md: 2×2 with a dashed vertical and horizontal rule
                i % 2 === 1 && "border-l pl-3 sm:pl-4.5",
                i >= 2 && "border-t",
                // md and up: one row, dashed rule before every cell but the first
                "md:border-t-0",
                i > 0 ? "md:border-l md:pl-4.5" : "md:border-l-0 md:pl-0",
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
      </Container>
    </section>
  );
}
