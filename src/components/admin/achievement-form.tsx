"use client";

import { useActionState } from "react";
import {
  createAchievementAction,
  updateAchievementAction,
  type AchievementFormState,
} from "@/app/admin/(dashboard)/achievements/actions";
import type { Achievement } from "@/lib/types";
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

const initialState: AchievementFormState = {};

export function AchievementForm({ achievement }: { achievement?: Achievement | null }) {
  const action = achievement
    ? updateAchievementAction.bind(null, achievement.id)
    : createAchievementAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Achievement</CardTitle>
          <CardDescription>Title and description for this achievement.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={achievement?.title ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={achievement?.description ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:max-w-40">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={achievement?.sort_order ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>
          {achievement ? "Save changes" : "Create achievement"}
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
