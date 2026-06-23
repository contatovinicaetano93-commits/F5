import { NextRequest, NextResponse } from 'next/server';
import {
  isAdminAuthConfigured,
  setAdminSessionCookie,
  verifyAdminCredentials,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin auth not configured. Set ADMIN_PASSWORD on the server.' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  return setAdminSessionCookie(response);
}
