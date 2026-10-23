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
          <CardTitle>Who you are</CardTitle>
          <CardDescription>
            Name, title and the copy shown at the top of your site.
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
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              name="handle"
              placeholder="e.g. harsh"
              defaultValue={profile?.handle ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Voice AI Engineer"
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
            <p className="text-xs text-muted-foreground">
              Wrap one phrase in *asterisks* to italicise it. Use {"{years}"} for your live years of experience.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={profile?.tagline ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Wrap one phrase in *asterisks* to italicise it. Use {"{years}"} for your live years of experience.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={6}
              defaultValue={profile?.bio ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Wrap one phrase in *asterisks* to italicise it. Use {"{years}"} for your live years of experience.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="career_start_date">Career start date</Label>
            <Input
              id="career_start_date"
              name="career_start_date"
              type="date"
              defaultValue={profile?.career_start_date ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              First full-time role. Years on the site are counted from here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Now</CardTitle>
          <CardDescription>
            What you are up to right now. Saving a change stamps the “updated” date.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["building", "writing", "learning"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label htmlFor={`now.${key}`} className="capitalize">
                {key}
              </Label>
              <Input
                id={`now.${key}`}
                name={`now.${key}`}
                defaultValue={profile?.now?.[key] ?? ""}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
          <CardDescription>
            The first cell, years of experience, is automatic.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[8rem_1fr]">
              <Input
                name={`highlights.${i}.value`}
                aria-label={`Highlight ${i + 1} value`}
                placeholder="Value, e.g. 3"
                defaultValue={profile?.highlights?.[i]?.value ?? ""}
              />
              <Input
                name={`highlights.${i}.label`}
                aria-label={`Highlight ${i + 1} label`}
                placeholder="Label, e.g. products shipped"
                defaultValue={profile?.highlights?.[i]?.label ?? ""}
              />
            </div>
          ))}
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
            <Label htmlFor="socials.youtube">YouTube</Label>
            <Input
              id="socials.youtube"
              name="socials.youtube"
              placeholder="https://youtube.com/@…"
              defaultValue={profile?.socials?.youtube ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socials.instagram">Instagram</Label>
            <Input
              id="socials.instagram"
              name="socials.instagram"
              placeholder="https://instagram.com/…"
              defaultValue={profile?.socials?.instagram ?? ""}
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
