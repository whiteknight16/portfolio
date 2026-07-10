/**
 * Shared heading block for every home-page section: a small mono label with
 * the single brand-colored marker dot, a display title, and an optional
 * description. One primitive keeps vertical rhythm and type scale identical
 * across `about`, `experience`, `skills`, etc.
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
        <span className="size-1.5 rounded-full bg-brand" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
