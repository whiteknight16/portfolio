"use client";

import { useActionState } from "react";
import {
  createSkillAction,
  updateSkillAction,
  type SkillFormState,
} from "@/app/admin/(dashboard)/skills/actions";
import type { Skill } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/admin/submit-button";

const initialState: SkillFormState = {};

export function SkillForm({ skill }: { skill?: Skill | null }) {
  const action = skill ? updateSkillAction.bind(null, skill.id) : createSkillAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill</CardTitle>
          <CardDescription>
            The skill name and the category it&apos;s grouped under.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={skill?.name ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g. Languages, Frameworks, Tools"
              defaultValue={skill?.category ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2 sm:max-w-40">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={skill?.sort_order ?? 0}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>{skill ? "Save changes" : "Create skill"}</SubmitButton>
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
