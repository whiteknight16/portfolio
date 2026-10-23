import { PostForm } from "@/components/admin/post-form";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          New note
        </h1>
        <p className="text-sm text-muted-foreground">
          Write a new note for your site.
        </p>
      </div>
      <PostForm />
    </div>
  );
}
