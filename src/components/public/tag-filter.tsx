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
 * Toggle-chip tag filter with a leading "All" option. Controlled — the
 * caller owns `value`/`onChange` so it can be backed by local state (as on
 * the projects list) or URL search params (as a future blog list might
 * want) without this component knowing the difference.
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
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
