"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markMessageReadAction } from "@/app/admin/(dashboard)/messages/actions";

/** Toggles a single contact message between read/unread, calling
 * `markMessageReadAction` and relying on its `revalidatePath` to refresh the
 * list from the server. Surfaces a failure inline rather than silently
 * dropping it. */
export function MarkReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await markMessageReadAction(id, !isRead);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {isRead ? "Mark unread" : "Mark read"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
