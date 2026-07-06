"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  type ProfileFormState,
} from "@/app/admin/(dashboard)/profile/actions";
import type { Profile } from "@/lib/types";
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
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";

const initialState: ProfileFormState = {};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>
            Name and title shown at the top of your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              defaultValue={profile?.full_name ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Full Stack Developer"
              defaultValue={profile?.title ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              placeholder="One-line summary shown under your name"
              defaultValue={profile?.headline ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
          <CardDescription>
            Longer description shown in the About section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={6}
              defaultValue={profile?.bio ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>
            How visitors can reach or locate you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile?.location ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={profile?.email ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={profile?.phone ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Socials</CardTitle>
          <CardDescription>
            Links shown as icons in the footer and contact card.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socials.github">GitHub</Label>
            <Input
              id="socials.github"
              name="socials.github"
              placeholder="https://github.com/…"
              defaultValue={profile?.socials?.github ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socials.linkedin">LinkedIn</Label>
            <Input
              id="socials.linkedin"
              name="socials.linkedin"
              placeholder="https://linkedin.com/in/…"
              defaultValue={profile?.socials?.linkedin ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socials.twitter">X (Twitter)</Label>
            <Input
              id="socials.twitter"
              name="socials.twitter"
              placeholder="https://x.com/…"
              defaultValue={profile?.socials?.twitter ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socials.website">Website</Label>
            <Input
              id="socials.website"
              name="socials.website"
              placeholder="https://…"
              defaultValue={profile?.socials?.website ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar &amp; resume</CardTitle>
          <CardDescription>
            Profile photo and downloadable resume link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Avatar</Label>
            <ImageUpload
              name="avatar_url"
              folder="avatar"
              defaultValue={profile?.avatar_url}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="resume_url">Resume URL</Label>
            <Input
              id="resume_url"
              name="resume_url"
              placeholder="/resume.pdf"
              defaultValue={profile?.resume_url ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>Save changes</SubmitButton>
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
