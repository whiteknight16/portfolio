"use client";

import { cn } from "@/lib/utils";

type TagFilterProps = {
  /** Distinct tags available to filter by, in display order. */
  tags: string[];
  /** Currently active tag, or `null` for "All". */
  value: string | null;
  onChange: (tag: string | null) => void;
  className?: string;
};

/**
 * Toggle-chip tag filter with a leading "All" option, styled as the mockup's
 * `.topics` row: mono chips on card, the active one solid ink. Controlled:
 * the caller owns `value`/`onChange`, so it can be backed by local state (as
 * on the notes and projects lists) or URL search params without this
 * component knowing the difference.
 */
export function TagFilter({ tags, value, onChange, className }: TagFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter by tag"
      className={cn("flex flex-wrap gap-2", className)}
    >
      <Chip label="All" active={value === null} onClick={() => onChange(null)} />
      {tags.map((tag) => (
        <Chip key={tag} label={tag} active={value === tag} onClick={() => onChange(tag)} />
      ))}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-[3px] border px-2.5 py-1 font-mono text-[11.5px] leading-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-rule bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
