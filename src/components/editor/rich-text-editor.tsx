"use client";

import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { proseClassNames } from "@/components/public/prose";
import { EditorToolbar } from "@/components/editor/toolbar";

type RichTextEditorProps = {
  /** Name of the hidden input the resulting HTML is submitted under. */
  name: string;
  /** Existing HTML to load into the editor, if editing. */
  defaultValue?: string | null;
  placeholder?: string;
  /** Storage bucket for inline image uploads. Defaults to "media"; blog uses "blog-images". */
  bucket?: string;
};

/**
 * Tiptap-based WYSIWYG editor for admin project/post `content` fields.
 *
 * Keeps a hidden `<input name>` in sync with `editor.getHTML()` (mirroring
 * the `ImageUpload` hidden-input pattern in `@/components/admin/
 * image-upload`) so the surrounding `<form>` submits the rendered HTML under
 * `name` on save. That HTML is re-sanitized server-side (`sanitizeHtml` in
 * `@/lib/sanitize.ts`) before persistence, so the extension set here is
 * deliberately scoped to the sanitizer's tag allowlist (headings h1-h4, p,
 * a, ul/ol/li, strong/em, code, pre, blockquote, img, hr, br) — underline
 * and strike are disabled since that markup isn't in the allowlist and
 * would just be stripped on save.
 *
 * `immediatelyRender: false` is required for SSR: Next renders this client
 * component's first pass on the server, where no editor instance exists
 * yet, so `useEditor` returns `null` until the component mounts on the
 * client. That avoids a hydration mismatch (see the Tiptap SSR guide).
 */
export function RichTextEditor({
  name,
  defaultValue,
  placeholder = "Write your post…",
  bucket = "media",
}: RichTextEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Link is configured separately below (openOnClick/rel/autolink).
        link: false,
        // Not in the sanitizer's tag allowlist — would be stripped on save.
        underline: false,
        strike: false,
        heading: { levels: [1, 2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-lg border border-border" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue ?? "",
    editorProps: {
      attributes: {
        // Lets a surrounding <Label htmlFor={name}> focus the editor.
        id: name,
        class: cn(
          proseClassNames,
          "min-h-56 rounded-b-lg border border-t-0 border-border bg-background px-4 py-3 focus:outline-none",
          "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-muted-foreground [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
        ),
      },
    },
    onCreate: ({ editor }) => {
      if (inputRef.current) inputRef.current.value = editor.getHTML();
    },
    onUpdate: ({ editor }) => {
      if (inputRef.current) inputRef.current.value = editor.getHTML();
    },
  });

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue ?? ""}
      />
      <EditorToolbar editor={editor} bucket={bucket} />
      <EditorContent editor={editor} />
    </div>
  );
}
