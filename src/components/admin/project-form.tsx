"use client";

import { useActionState } from "react";
import {
  createProjectAction,
  updateProjectAction,
  type ProjectFormState,
} from "@/app/admin/(dashboard)/projects/actions";
import type { Project } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

const initialState: ProjectFormState = {};

export function ProjectForm({ project }: { project?: Project | null }) {
  const action = project
    ? updateProjectAction.bind(null, project.id)
    : createProjectAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
          <CardDescription>
            Title and URL slug. Leave the slug blank to auto-generate it from
            the title.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={project?.title ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="auto-generated from title"
              defaultValue={project?.slug ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={2}
              placeholder="One or two sentences shown in the project list"
              defaultValue={project?.summary ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="e.g. Next.js, TypeScript, Supabase"
              defaultValue={project?.tags.join(", ") ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>
            Full write-up shown on the project&apos;s detail page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor name="content" defaultValue={project?.content} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links &amp; cover image</CardTitle>
          <CardDescription>
            Optional live demo and repository links, plus a cover image.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="links.live">Live URL</Label>
              <Input
                id="links.live"
                name="links.live"
                placeholder="https://…"
                defaultValue={project?.links?.live ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="links.repo">Repository URL</Label>
              <Input
                id="links.repo"
                name="links.repo"
                placeholder="https://github.com/…"
                defaultValue={project?.links?.repo ?? ""}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Cover image</Label>
            <ImageUpload
              name="cover_image_url"
              folder="projects"
              defaultValue={project?.cover_image_url}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>
            Visibility, ordering, and whether this project is featured.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={project?.status ?? "draft"}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={project?.sort_order ?? 0}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="featured">Featured</Label>
            <Switch
              id="featured"
              name="featured"
              defaultChecked={project?.featured ?? false}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
        {state.ok ? (
          <p role="status" className="text-sm text-muted-foreground">
            Saved.
          </p>
        ) : null}
        {state.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
