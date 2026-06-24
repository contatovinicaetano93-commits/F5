import { NextRequest, NextResponse } from 'next/server';
import {
  isClientPortalAuthConfigured,
  setClientPortalSessionCookie,
  verifyClientPortalPassword,
} from '@/lib/client-portal-auth';
import {
  isClientLoginRateLimited,
  recordClientLoginFailure,
} from '@/lib/admin/rate-limit';

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  if (!isClientPortalAuthConfigured()) {
    return NextResponse.json(
      { error: 'Portal auth not configured' },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  if (isClientLoginRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 15 minutos.' },
      { status: 429 },
    );
  }

  const body = await request.json();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!verifyClientPortalPassword(password)) {
    recordClientLoginFailure(ip);
    return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  return setClientPortalSessionCookie(response);
}
