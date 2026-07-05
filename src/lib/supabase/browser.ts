import { createBrowserClient } from "@supabase/ssr";
import { readPublicEnv } from "@/lib/env";

/** Supabase client for use in Client Components. */
export function createBrowserSupabase() {
  const { supabaseUrl, supabaseAnonKey } = readPublicEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
