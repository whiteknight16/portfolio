"use client";

import { useActionState } from "react";
import {
  createEducationAction,
  updateEducationAction,
  type EducationFormState,
} from "@/app/admin/(dashboard)/education/actions";
import type { Education } from "@/lib/types";
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
import { SubmitButton } from "@/components/admin/submit-button";

const initialState: EducationFormState = {};

export function EducationForm({ education }: { education?: Education | null }) {
  const action = education
    ? updateEducationAction.bind(null, education.id)
    : createEducationAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
          <CardDescription>
            The degree and institution for this entry.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              name="degree"
              required
              defaultValue={education?.degree ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              name="institution"
              required
              defaultValue={education?.institution ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. Boston, MA"
              defaultValue={education?.location ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start_date">Start date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={education?.start_date ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end_date">End date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={education?.end_date ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={education?.description ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:max-w-40">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={education?.sort_order ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>
          {education ? "Save changes" : "Create education"}
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
