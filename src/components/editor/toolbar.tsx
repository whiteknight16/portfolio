"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link2,
  ImagePlus,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImageAction } from "@/app/admin/actions/upload";

type EditorToolbarProps = {
  editor: Editor | null;
  /** Storage bucket for inline image uploads. Defaults to "media". */
  bucket?: string;
};

type ToolbarButtonProps = {
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  icon: Icon,
  iconClassName,
  active,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      aria-label={label}
      aria-pressed={active ?? false}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className={iconClassName} />
    </Button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-border" aria-hidden="true" />;
}

/**
 * Formatting toolbar for `RichTextEditor`. Every command is scoped to the
 * server-side sanitizer's tag allowlist (see `@/lib/sanitize.ts`) — no
 * underline/strike/table buttons, since that markup would just get stripped
 * on save.
 */
export function EditorToolbar({ editor, bucket = "media" }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Allow re-selecting the same file later.
    event.target.value = "";
    if (!file || !editor) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", "posts");
      formData.set("bucket", bucket);

      const result = await uploadImageAction(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      editor.chain().focus().setImage({ src: result.url }).run();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleLink() {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Link URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-col gap-1 rounded-t-lg border border-border bg-muted/40 p-1">
      <div className="flex flex-wrap items-center gap-0.5">
        <ToolbarButton
          label="Bold"
          icon={Bold}
          active={editor?.isActive("bold")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={Italic}
          active={editor?.isActive("italic")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Heading 2"
          icon={Heading2}
          active={editor?.isActive("heading", { level: 2 })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Heading 3"
          icon={Heading3}
          active={editor?.isActive("heading", { level: 3 })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Bullet list"
          icon={List}
          active={editor?.isActive("bulletList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Ordered list"
          icon={ListOrdered}
          active={editor?.isActive("orderedList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Quote"
          icon={Quote}
          active={editor?.isActive("blockquote")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="Inline code"
          icon={Code}
          active={editor?.isActive("code")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          label="Code block"
          icon={Code2}
          active={editor?.isActive("codeBlock")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Link"
          icon={Link2}
          active={editor?.isActive("link")}
          disabled={!editor}
          onClick={handleLink}
        />
        <ToolbarButton
          label="Insert image"
          icon={uploading ? Loader2 : ImagePlus}
          iconClassName={uploading ? "animate-spin" : undefined}
          disabled={!editor || uploading}
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleImageFile}
        />
      </div>
      {error ? <p className="px-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
