/**
 * Shared heading block for every home-page section: a small mono eyebrow
 * (with the section's single accent-colored marker dot), a display title,
 * and an optional description. Kept as one primitive so vertical rhythm and
 * type scale stay identical across `about`, `experience`, `skills`, etc.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-pretty text-base text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
