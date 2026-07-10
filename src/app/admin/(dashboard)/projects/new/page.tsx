import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          New project
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new project to your portfolio.
        </p>
      </div>
      <ProjectForm />
    </div>
  );
}
