import { getAdminEmail } from '@/lib/admin-auth';
import { hasDatabase, prisma } from '@/lib/prisma';
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from '@/lib/supabase/env';

const OPERATOR_ROLES = ['admin', 'operator'] as const;

async function adminHasOperatorRole(email: string): Promise<boolean> {
  if (!hasDatabase()) {
    return email.trim().toLowerCase() === getAdminEmail().trim().toLowerCase();
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      email: { equals: email.trim(), mode: 'insensitive' },
      role: { in: [...OPERATOR_ROLES] },
    },
  });

  return Boolean(dbUser);
}

/** Fallback quando ADMIN_PASSWORD da Vercel diverge do seed Supabase. */
export async function verifyAdminViaSupabasePassword(
  email: string,
  password: string,
): Promise<boolean> {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return false;

  const res = await fetch(`${url.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  if (!res.ok) return false;

  return adminHasOperatorRole(email);
}
