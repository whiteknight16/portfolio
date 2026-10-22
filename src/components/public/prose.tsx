import { cn } from "@/lib/utils";

/**
 * Typography classes shared between the public `Prose` renderer below and
 * the admin's Tiptap `RichTextEditor` content area (`@/components/editor/
 * rich-text-editor`), so WYSIWYG editing matches the public render. Uses
 * Tailwind utility classes scoped to `[&_x]` descendant selectors rather
 * than the `@tailwindcss/typography` plugin, so it stays on the same design
 * tokens (`text-foreground`, `border-rule`, the burnt-orange accent) as the
 * rest of the site in both light and dark.
 */
export const proseClassNames = cn(
  "max-w-none font-display text-[1.125rem] leading-[1.75] text-foreground/90",
  "[&>*+*]:mt-5",
  "[&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-medium [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:mt-10",
  "[&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-10",
  "[&_h3]:font-display [&_h3]:text-xl [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:text-foreground [&_h3]:mt-8",
  "[&_h4]:font-display [&_h4]:font-medium [&_h4]:text-foreground [&_h4]:mt-6",
  "[&_p]:text-foreground/90",
  "[&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-brand/40 hover:[&_a]:decoration-brand",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_mark]:mark-hl [&_mark]:bg-transparent [&_mark]:text-inherit",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5",
  "[&_li]:text-foreground/90 [&_li]:marker:text-muted-foreground",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:border [&_code]:border-rule [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-rule [&_pre]:bg-[#1d1a16] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:text-[#ece4d4]",
  "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
  "[&_img]:rounded-md [&_img]:border [&_img]:border-rule",
  "[&_hr]:border-rule",
);

type ProseProps = {
  /** Already-sanitized HTML (see `sanitizeHtml` in `@/lib/sanitize.ts`, run
   * at write-time in the admin editor) — safe to render as-is. */
  html: string;
  className?: string;
};

/**
 * Styled container for rendering sanitized rich-text HTML (project/post
 * `content`).
 */
export function Prose({ html, className }: ProseProps) {
  return (
    <div
      className={cn(proseClassNames, className)}
      // Content is sanitized at write-time via `sanitizeHtml` before it's
      // ever stored, so rendering it here is safe.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
