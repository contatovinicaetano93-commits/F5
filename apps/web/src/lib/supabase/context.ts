import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  verifyCredentials,
  createContextClient,
  createAdminClient,
} from '@supabase/server/core';
import {
  createSupabaseContext as createHeaderSupabaseContext,
  type AuthModeWithKey,
  type SupabaseContext,
  type WithSupabaseConfig,
} from '@supabase/server';
import {
  getSupabaseEnvOverrides,
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseServerConfigured,
  resolveSupabaseEnv,
} from '@/lib/supabase/env';

export type { SupabaseContext, AuthModeWithKey };

export async function createSupabaseServerContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: 'user' },
): Promise<
  { data: SupabaseContext; error: null } | { data: null; error: Error }
> {
  if (!isSupabaseServerConfigured()) {
    return {
      data: null,
      error: new Error('Supabase not configured (SUPABASE_URL + publishable key)'),
    };
  }

  const envOverrides = getSupabaseEnvOverrides();
  const { error: envError } = resolveSupabaseEnv(envOverrides);
  if (envError) {
    return { data: null, error: envError };
  }

  const url = getSupabaseUrl()!;
  const publishableKey = getSupabasePublishableKey()!;

  const cookieStore = await cookies();
  const ssrClient = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies — middleware handles refresh.
        }
      },
    },
  });

  const {
    data: { session },
  } = await ssrClient.auth.getSession();
  const token = session?.access_token ?? null;

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: options.auth ?? 'user', env: envOverrides },
  );

  if (error) {
    return { data: null, error };
  }

  const supabase = createContextClient({
    auth: { token: auth!.token },
    env: envOverrides,
  });
  const supabaseAdmin = createAdminClient({ env: envOverrides });

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
      authMode: auth!.authMode,
    },
    error: null,
  };
}

/**
 * Header-based context (`Authorization` / `apikey`) — use in Route Handlers
 * that receive bearer tokens or for publishable/secret/none auth modes.
 */
export async function createSupabaseContextFromRequest(
  request: Request,
  options: Pick<WithSupabaseConfig, 'auth' | 'env'> = { auth: 'user' },
) {
  return createHeaderSupabaseContext(request, {
    ...options,
    cors: false,
    env: getSupabaseEnvOverrides(options.env),
  });
}
