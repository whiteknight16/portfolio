import { EducationForm } from "@/components/admin/education-form";

export default function NewEducationPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          New education
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new education entry to your portfolio.
        </p>
      </div>
      <EducationForm />
    </div>
  );
}
