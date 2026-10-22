import Link from "next/link";

/**
 * Field notes section heading (mockup `.sec-h` + `.secnote`): a Fraunces
 * title over a 1.5px ink rule, an optional mono link on the right, and an
 * optional italic note underneath.
 */
export function SectionHeading({
  title,
  href,
  linkLabel,
  note,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  note?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 border-b-[1.5px] border-foreground pb-2.5">
        <h2 className="font-display text-[26px] leading-tight font-normal tracking-[-0.02em] text-foreground sm:text-[30px]">
          {title}
        </h2>
        {href && linkLabel ? (
          <Link
            href={href}
            className="shrink-0 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      {note ? (
        <p className="mt-3 font-display text-[15px] text-muted-foreground italic">{note}</p>
      ) : null}
    </div>
  );
}
