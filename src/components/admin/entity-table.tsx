import { type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowActions, type EntityActionResult } from "@/components/admin/row-actions";

export type { EntityActionResult };

export type EntityTableColumn<T> = {
  /** Column header label. */
  header: string;
  /** Renders the cell content for a given row. */
  cell: (row: T) => ReactNode;
  className?: string;
};

export type EntityTableProps<T extends { id: string }> = {
  /** Data columns rendered before the built-in Actions column. */
  columns: EntityTableColumn<T>[];
  rows: T[];
  /** Edit link destination for a row. */
  editHref: (row: T) => string;
  /** Deletes the row with the given id. The list re-renders via the caller's
   * revalidated route on success; on `{ error }` the dialog stays open and
   * surfaces the message instead. */
  onDelete: (id: string) => Promise<EntityActionResult>;
  /** Shown in place of the table when `rows` is empty. */
  emptyMessage?: string;
  /** Optional row-specific label for the delete confirmation, e.g. the
   * item's title. Defaults to a generic "this item". */
  describeRow?: (row: T) => string;
};

/**
 * Generic, presentational admin list table. Callers supply typed columns and
 * row data; this owns only the recurring Edit/Delete actions column (an edit
 * link plus a delete-confirm dialog) so every entity list in the admin looks
 * and behaves the same. Carries no knowledge of any specific entity — reused
 * by projects, experience/skills/achievements/education, and blog posts.
 *
 * This is a Server Component: the `columns`/`editHref`/`describeRow` functions
 * run here on the server, and only serializable values (plus the `onDelete`
 * server action) cross into the interactive {@link RowActions} client boundary.
 */
export function EntityTable<T extends { id: string }>({
  columns,
  rows,
  editHref,
  onDelete,
  emptyMessage = "Nothing here yet.",
  describeRow,
}: EntityTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.header} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.header} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <RowActions
                  id={row.id}
                  editHref={editHref(row)}
                  onDelete={onDelete}
                  label={describeRow?.(row) ?? "this item"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
