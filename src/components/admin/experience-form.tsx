"use client";

import { useActionState, useState } from "react";
import {
  createExperienceAction,
  updateExperienceAction,
  type ExperienceFormState,
} from "@/app/admin/(dashboard)/experience/actions";
import type { Experience } from "@/lib/types";
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
import { SubmitButton } from "@/components/admin/submit-button";

const initialState: ExperienceFormState = {};

export function ExperienceForm({ experience }: { experience?: Experience | null }) {
  const action = experience
    ? updateExperienceAction.bind(null, experience.id)
    : createExperienceAction;
  const [state, formAction] = useActionState(action, initialState);
  const [isCurrent, setIsCurrent] = useState(experience?.is_current ?? false);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Role</CardTitle>
          <CardDescription>The position and company for this entry.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              required
              defaultValue={experience?.role ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              required
              defaultValue={experience?.company ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. Remote, San Francisco CA"
              defaultValue={experience?.location ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dates</CardTitle>
          <CardDescription>
            When this role started and ended. Toggle &quot;Current role&quot; for
            an ongoing position.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start_date">Start date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              defaultValue={experience?.start_date ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end_date">End date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              disabled={isCurrent}
              defaultValue={experience?.end_date ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="is_current">Current role</Label>
            <Switch
              id="is_current"
              name="is_current"
              checked={isCurrent}
              onCheckedChange={setIsCurrent}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
          <CardDescription>One bullet point per line.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="highlights">Highlights</Label>
            <Textarea
              id="highlights"
              name="highlights"
              rows={5}
              placeholder={"Led migration to Next.js\nMentored two junior engineers"}
              defaultValue={experience?.highlights.join("\n") ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ordering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 sm:max-w-40">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={experience?.sort_order ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>
          {experience ? "Save changes" : "Create experience"}
        </SubmitButton>
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
