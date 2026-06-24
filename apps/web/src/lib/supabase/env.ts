import { resolveEnv } from '@supabase/server/core';
import type { SupabaseEnv } from '@supabase/server';

/** Project URL — server env first, then Next public fallback. */
export function getSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    undefined
  );
}

/** Publishable key (`sb_publishable_…`) — not the legacy anon JWT. */
export function getSupabasePublishableKey(): string | undefined {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    undefined
  );
}

/** Secret key (`sb_secret_…`) — server only, never commit. */
export function getSupabaseSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    undefined
  );
}

function parseInlineJwks(): SupabaseEnv['jwks'] | null {
  const raw = process.env.SUPABASE_JWKS?.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return { keys: parsed } as SupabaseEnv['jwks'];
    }
    return parsed as SupabaseEnv['jwks'];
  } catch {
    return null;
  }
}

function resolveJwks(): SupabaseEnv['jwks'] | null {
  const inline = parseInlineJwks();
  if (inline) return inline;

  const jwksUrl = process.env.SUPABASE_JWKS_URL?.trim();
  if (jwksUrl) {
    return new URL(jwksUrl);
  }

  return null;
}

/** Partial env for `@supabase/server` — bridges Next.js public vars. */
export function getSupabaseEnvOverrides(
  overrides?: Partial<SupabaseEnv>,
): Partial<SupabaseEnv> {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  const secretKey = getSupabaseSecretKey();
  const jwks = resolveJwks();

  const merged: Partial<SupabaseEnv> = { ...overrides };

  if (url && !merged.url) merged.url = url;

  if (publishableKey && !merged.publishableKeys) {
    merged.publishableKeys = { default: publishableKey };
  }

  if (secretKey && !merged.secretKeys) {
    merged.secretKeys = { default: secretKey };
  }

  if (jwks !== null && merged.jwks === undefined) {
    merged.jwks = jwks;
  }

  return merged;
}

export function resolveSupabaseEnv(overrides?: Partial<SupabaseEnv>) {
  return resolveEnv(getSupabaseEnvOverrides(overrides));
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

/** Default JWKS URL for Supabase hosted projects. */
export function getDefaultJwksUrl(): string | undefined {
  const url = getSupabaseUrl();
  if (!url) return undefined;
  return `${url.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
}
