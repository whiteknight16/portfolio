import { AchievementForm } from "@/components/admin/achievement-form";

export default function NewAchievementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          New achievement
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new achievement to your portfolio.
        </p>
      </div>
      <AchievementForm />
    </div>
  );
}
