"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Subscriber } from "@/lib/types";
import { setSubscriberStatusAction } from "@/app/admin/(dashboard)/subscribers/actions";

/** Toggles a subscriber between active and unsubscribed. */
export function SubscriberStatusButton({
  id,
  status,
}: {
  id: string;
  status: Subscriber["status"];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next = status === "active" ? "unsubscribed" : "active";

  return (
    <>
      {error ? (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await setSubscriberStatusAction(id, next);
            if ("error" in result) setError(result.error);
          });
        }}
      >
        {status === "active" ? "Mark unsubscribed" : "Mark active"}
      </Button>
    </>
  );
}
