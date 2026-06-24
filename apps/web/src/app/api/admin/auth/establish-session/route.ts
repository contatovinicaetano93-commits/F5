import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerContext } from '@/lib/supabase/context';
import { isSupabaseConfigured } from '@/lib/supabase-client';
import { hasDatabase, prisma } from '@/lib/prisma';
import {
  isAdminAuthConfigured,
  setAdminSessionCookie,
} from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';

const OPERATOR_ROLES = ['admin', 'operator'] as const;

/** Após Supabase signIn no browser, troca sessão Supabase por cookie admin. */
export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          'Admin não configurado na Vercel. Defina ADMIN_PASSWORD e ADMIN_SECRET e faça redeploy.',
      },
      { status: 503 },
    );
  }

  if (!isSupabaseConfigured() || !hasDatabase()) {
    return NextResponse.json(
      { error: 'Supabase ou banco não configurado' },
      { status: 503 },
    );
  }

  const { data: ctx, error } = await createSupabaseServerContext({
    auth: 'user',
  });

  if (error || !ctx?.userClaims?.email) {
    return NextResponse.json({ error: 'Sessão Supabase inválida' }, { status: 401 });
  }

  const email = ctx.userClaims.email.trim().toLowerCase();

  const dbUser = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: 'insensitive' },
      role: { in: [...OPERATOR_ROLES] },
    },
  });

  if (!dbUser) {
    return NextResponse.json(
      {
        error:
          'Esta conta não tem permissão de operador F5. Use admin@f5digital.com.br ou peça acesso à equipe.',
      },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ ok: true, email: dbUser.email });
  await logAdminAudit({
    action: 'admin.login_success',
    actorEmail: dbUser.email,
    request,
  });
  return setAdminSessionCookie(response);
}
