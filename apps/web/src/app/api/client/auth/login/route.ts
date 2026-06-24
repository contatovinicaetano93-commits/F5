import { NextRequest, NextResponse } from 'next/server';
import {
  isClientPortalAuthConfigured,
  setClientPortalSessionCookie,
  verifyClientPortalPassword,
} from '@/lib/client-portal-auth';

export async function POST(request: NextRequest) {
  if (!isClientPortalAuthConfigured()) {
    return NextResponse.json(
      { error: 'Portal auth not configured' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!verifyClientPortalPassword(password)) {
    return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  return setClientPortalSessionCookie(response);
}
