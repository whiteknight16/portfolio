/** True when a Supabase/PostgREST error is a Postgres unique violation (23505). */
export function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}
