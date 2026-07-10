import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readPublicEnv, serverEnv } from "@/lib/env";

/**
 * Service-role Supabase client for admin CMS mutations (RLS bypass).
 * Never import this from client code — the `server-only` guard above
 * throws a build error if it is ever bundled into a client component.
 */
export function createAdminSupabase() {
  const { supabaseUrl } = readPublicEnv();
  const { serviceRoleKey } = serverEnv();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
