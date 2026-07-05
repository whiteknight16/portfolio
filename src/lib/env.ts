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

export const env = readPublicEnv();

export function serverEnv(src: Source = process.env) {
  const serviceRoleKey = src.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = src.RESEND_API_KEY;
  const contactEmail = src.CONTACT_NOTIFICATION_EMAIL;
  const contactFrom = src.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return { serviceRoleKey, resendApiKey, contactEmail, contactFrom };
}
