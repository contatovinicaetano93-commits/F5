import { type NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase-client';
import { createSupabaseServerContext } from '@/lib/supabase/context';
import { hasDatabase, prisma } from '@/lib/prisma';
import { resolveClientTenantId } from '@/lib/client/tenant';
import {
  hasClientPortalSession,
  isClientPortalAuthConfigured,
} from '@/lib/client-portal-auth';
import { isProductionDeploy } from '@/lib/env';

export type ClientAuthContext = {
  tenantId: string;
  email: string;
  userId: string;
  demo: boolean;
};

async function portalPasswordContext(): Promise<ClientAuthContext | null> {
  const tenantId = await resolveClientTenantId();
  return {
    tenantId,
    email: 'portal@f5.internal',
    userId: 'portal',
    demo: false,
  };
}

/** Resolve tenant do cliente autenticado (Supabase → senha portal → demo dev). */
export async function getClientAuthContext(
  request?: NextRequest,
): Promise<ClientAuthContext | null> {
  if (isSupabaseConfigured()) {
    const { data: ctx, error } = await createSupabaseServerContext({
      auth: 'user',
    });

    if (error || !ctx?.userClaims?.email) return null;

    const email = ctx.userClaims.email;
    if (!hasDatabase()) return null;

    const dbUser = await prisma.user.findFirst({
      where: {
        email: { equals: email.trim(), mode: 'insensitive' },
        role: 'client_viewer',
      },
    });

    if (!dbUser?.tenantId) return null;

    return {
      tenantId: dbUser.tenantId,
      email: dbUser.email,
      userId: dbUser.id,
      demo: false,
    };
  }

  if (isClientPortalAuthConfigured()) {
    if (request && hasClientPortalSession(request)) {
      return portalPasswordContext();
    }
    return null;
  }

  if (isProductionDeploy()) {
    return null;
  }

  const tenantId = await resolveClientTenantId();
  return {
    tenantId,
    email: 'demo@f5.internal',
    userId: 'demo',
    demo: true,
  };
}

/** Exige sessão válida nas rotas /api/client/*. */
export async function requireClientAuth(
  request?: NextRequest,
): Promise<ClientAuthContext | NextResponse> {
  const ctx = await getClientAuthContext(request);

  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isSupabaseConfigured() && ctx.demo) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isProductionDeploy() && ctx.demo) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return ctx;
}

export function isClientAuthRequired(): boolean {
  return isSupabaseConfigured() || isClientPortalAuthConfigured() || isProductionDeploy();
}
