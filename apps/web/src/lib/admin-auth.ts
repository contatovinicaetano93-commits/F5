import { type NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'f5_admin_session';

const DEFAULT_ADMIN_EMAIL = 'admin@f5digital.com.br';

export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = getAdminEmail().trim().toLowerCase();

  return normalizedEmail === expectedEmail && password === adminPassword;
}

export function isValidAdminSession(cookieValue: string | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || !cookieValue) return false;
  return cookieValue === secret;
}

export function hasAdminSession(request: NextRequest): boolean {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return isValidAdminSession(cookie);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function setAdminSessionCookie(response: NextResponse): NextResponse {
  const secret = getAdminSecret();
  if (secret) {
    response.cookies.set(ADMIN_COOKIE_NAME, secret, getSessionCookieOptions());
  }
  return response;
}

export function clearAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}

/** Returns 401 response if not authenticated; null if OK. */
export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin auth not configured' },
      { status: 503 },
    );
  }

  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
