"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  toggleSectionAction,
  reorderSectionsAction,
} from "@/app/admin/(dashboard)/sections/actions";
import type { SiteSection } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function SectionsManager({ sections }: { sections: SiteSection[] }) {
  const [rows, setRows] = useState(sections);
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(key: string, enabled: boolean) {
    setError(null);
    // Optimistic update — reflect the new state immediately, revert on error.
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, enabled } : row)),
    );
    setPendingKey(key);
    startTransition(async () => {
      const result = await toggleSectionAction(key, enabled);
      setPendingKey(null);
      if ("error" in result) {
        setError(result.error);
        setRows((prev) =>
          prev.map((row) => (row.key === key ? { ...row, enabled: !enabled } : row)),
        );
      }
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    setError(null);
    setPendingKey(next[index].key);

    startTransition(async () => {
      const result = await reorderSectionsAction(next.map((row) => row.key));
      setPendingKey(null);
      if ("error" in result) {
        setError(result.error);
        setRows(rows);
      }
    });
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground">
          No sections found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col divide-y divide-border">
          {rows.map((section, index) => (
            <div
              key={section.key}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Move ${section.label} up`}
                    disabled={isPending || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Move ${section.label} down`}
                    disabled={isPending || index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </div>
                <Label htmlFor={`section-${section.key}`}>
                  {section.label}
                </Label>
              </div>
              <Switch
                id={`section-${section.key}`}
                checked={section.enabled}
                disabled={isPending && pendingKey === section.key}
                onCheckedChange={(checked) => handleToggle(section.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
