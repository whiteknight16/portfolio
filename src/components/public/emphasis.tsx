import { splitEmphasis, stripEmphasis } from "@/lib/format";

/**
 * Text whose one `*…*` phrase renders in accent italics (the hero thesis and
 * lede, the About bio). Anything else (no pair, a stray or second `*`) renders
 * as plain text with the markers removed, so a literal `*` never shows.
 */
export function Emphasis({ text }: { text: string }) {
  const parts = splitEmphasis(text);
  if (!parts) return <>{stripEmphasis(text)}</>;
  return (
    <>
      {parts.before}
      <em className="text-brand italic">{parts.em}</em>
      {parts.after}
    </>
  );
}
