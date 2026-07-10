type Source = Record<string, string | undefined>;

export function readPublicEnv(src: Source = process.env) {
  const supabaseUrl = src.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = src.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = src.ADMIN_EMAIL;
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!adminEmail) throw new Error("Missing ADMIN_EMAIL");
  return { supabaseUrl, supabaseAnonKey, adminEmail };
}

export function serverEnv(src: Source = process.env) {
  const serviceRoleKey = src.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = src.RESEND_API_KEY;
  const contactEmail = src.CONTACT_NOTIFICATION_EMAIL;
  const contactFrom = src.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return { serviceRoleKey, resendApiKey, contactEmail, contactFrom };
}

/**
 * Non-throwing accessor for the email-related env vars only. Unlike
 * `serverEnv`, this never throws (e.g. when `SUPABASE_SERVICE_ROLE_KEY` is
 * missing) so callers that only need email config can't be crashed by an
 * unrelated secret.
 */
export function emailEnv(src: Source = process.env) {
  return {
    resendApiKey: src.RESEND_API_KEY,
    contactEmail: src.CONTACT_NOTIFICATION_EMAIL,
    contactFrom: src.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev",
  };
}
