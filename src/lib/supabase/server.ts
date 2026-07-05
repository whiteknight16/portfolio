import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readPublicEnv } from "@/lib/env";

/**
 * Cookie-bound Supabase client for Server Components and Server Actions.
 * `cookies()` is async in Next.js 16, so this factory must be awaited.
 */
export async function createServerSupabase() {
  const { supabaseUrl, supabaseAnonKey } = readPublicEnv();
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* called from a RSC (read-only) — proxy.ts refreshes instead */
        }
      },
    },
  });
}
