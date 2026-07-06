import { ExperienceForm } from "@/components/admin/experience-form";

export default function NewExperiencePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          New experience
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new role to your work history.
        </p>
      </div>
      <ExperienceForm />
    </div>
  );
}
