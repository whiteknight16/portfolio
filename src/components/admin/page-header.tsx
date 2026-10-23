import type { ReactNode } from "react";

export function AdminPageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5">
      <div className="min-w-0">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
          {kicker}
        </p>
        <h1 className="mt-1 font-display text-[28px] font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
