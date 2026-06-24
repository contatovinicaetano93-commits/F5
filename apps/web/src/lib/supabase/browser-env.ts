/** Supabase env helpers safe for browser bundles — no @supabase/server imports. */

export function getBrowserSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function getBrowserSupabaseKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(getBrowserSupabaseUrl() && getBrowserSupabaseKey());
}
