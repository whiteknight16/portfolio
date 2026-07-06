import { cn } from "@/lib/utils";

type ProseProps = {
  /** Already-sanitized HTML (see `sanitizeHtml` in `@/lib/sanitize.ts`, run
   * at write-time in the admin editor) — safe to render as-is. */
  html: string;
  className?: string;
};

/**
 * Styled container for rendering sanitized rich-text HTML (project/post
 * `content`). Uses Tailwind's typography-style utility classes scoped to
 * `[&_x]` selectors rather than the `@tailwindcss/typography` plugin, so it
 * stays on the same design tokens (`text-foreground`, `border-border`, the
 * emerald accent) as the rest of the site in both light and dark.
 */
export function Prose({ html, className }: ProseProps) {
  return (
    <div
      className={cn(
        "max-w-none text-base leading-relaxed text-foreground/90",
        "[&>*+*]:mt-5",
        "[&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:mt-10",
        "[&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-10",
        "[&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground [&_h3]:mt-8",
        "[&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mt-6",
        "[&_p]:text-foreground/90",
        "[&_a]:font-medium [&_a]:text-emerald-600 [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-emerald-600/30 hover:[&_a]:decoration-emerald-600 dark:[&_a]:text-emerald-400 dark:[&_a]:decoration-emerald-400/30 dark:hover:[&_a]:decoration-emerald-400",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5",
        "[&_li]:text-foreground/90 [&_li]:marker:text-muted-foreground",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm",
        "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_img]:rounded-lg [&_img]:border [&_img]:border-border",
        "[&_hr]:border-border",
        className,
      )}
      // Content is sanitized at write-time via `sanitizeHtml` before it's
      // ever stored, so rendering it here is safe.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
