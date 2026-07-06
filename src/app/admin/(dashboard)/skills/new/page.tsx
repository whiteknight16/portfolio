import { SkillForm } from "@/components/admin/skill-form";

export default function NewSkillPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          New skill
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new skill to your portfolio.
        </p>
      </div>
      <SkillForm />
    </div>
  );
}
