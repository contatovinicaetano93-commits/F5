import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminEmail,
  isAdminAuthConfigured,
  setAdminSessionCookie,
  verifyAdminCredentials,
} from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import {
  isAdminLoginRateLimited,
  recordAdminLoginFailure,
} from '@/lib/admin/rate-limit';
import { getClientIp } from '@/lib/http/client-ip';

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin auth not configured. Set ADMIN_PASSWORD on the server.' },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);

  if (await isAdminLoginRateLimited(ip)) {
    await logAdminAudit({
      action: 'admin.login_rate_limited',
      request,
    });
    return NextResponse.json(
      {
        error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.',
      },
      { status: 429 },
    );
  }

  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!verifyAdminCredentials(email, password)) {
    await recordAdminLoginFailure(ip);
    await logAdminAudit({
      action: 'admin.login_failed',
      actorEmail: email.trim().toLowerCase() || undefined,
      request,
    });
    return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
  }

  await logAdminAudit({
    action: 'admin.login_success',
    actorEmail: getAdminEmail(),
    request,
  });

  const response = NextResponse.json({ ok: true });
  return setAdminSessionCookie(response);
}
