import {
  BookOpen,
  FileText,
  GraduationCap,
  Headphones,
  Link2,
  Play,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { SourceCardView } from "@/lib/note-view";
import type { SourceKind } from "@/lib/types";

const KIND_ICON: Record<SourceKind, LucideIcon> = {
  video: Play,
  podcast: Headphones,
  article: FileText,
  paper: ScrollText,
  course: GraduationCap,
  book: BookOpen,
  other: Link2,
};

/**
 * The "Notes on" card under a note's dek (mockup `.source`): a dark thumb
 * with the kind's glyph, the label, the source title and host, and a mono
 * "watch ↗" / "listen ↗" / "read ↗" action. The action's link is stretched
 * over the whole card, so any click opens the source in a new tab.
 */
export function SourceCard({ source, kind }: { source: SourceCardView; kind: SourceKind | null }) {
  const Icon = KIND_ICON[kind ?? "other"];

  return (
    <aside className="relative mt-6 grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-[4px] border border-rule bg-card p-3 transition-colors hover:border-foreground/40 sm:grid-cols-[96px_1fr_auto] sm:gap-3.5">
      <div
        aria-hidden
        className="grid h-12 place-items-center rounded-[3px] bg-linear-135 from-[#2b2b2b] to-[#555] text-white sm:h-13.5"
      >
        <Icon className="size-4.5" fill={kind === "video" ? "currentColor" : "none"} strokeWidth={kind === "video" ? 0 : 1.75} />
      </div>

      <div className="min-w-0">
        <p className="font-mono text-[10.5px] tracking-widest text-brand uppercase">{source.label}</p>
        <p className="mt-0.75 text-sm leading-snug font-medium wrap-break-word text-foreground">
          {source.title}
        </p>
        {source.host ? <p className="mt-0.5 font-mono text-[11.5px] text-faint">{source.host}</p> : null}
      </div>

      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${source.action.replace(" ↗", "")}: ${source.title} (opens in a new tab)`}
        className="shrink-0 rounded-[3px] border-[1.5px] border-foreground px-2.75 py-1.5 font-mono text-xs font-medium text-foreground after:absolute after:inset-0 after:rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {source.action}
      </a>
    </aside>
  );
}
