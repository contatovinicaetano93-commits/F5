import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from '@/lib/supabase/env';

/** Cookie-based SSR client for auth flows (login / logout). */
export const createClient = async () => {
  const cookieStore = await cookies();
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  if (!url || !key) {
    throw new Error('Supabase not configured');
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies.
        }
      },
    },
  });
};
