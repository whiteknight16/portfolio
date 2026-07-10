import { PostForm } from "@/components/admin/post-form";

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          New post
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new post to your blog.
        </p>
      </div>
      <PostForm />
    </div>
  );
}
