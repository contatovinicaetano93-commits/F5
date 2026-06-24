import { type NextRequest, NextResponse } from 'next/server';
import { isProductionDeploy } from '@/lib/env';

export const CLIENT_COOKIE_NAME = 'f5_client_session';

export function getClientPortalSessionToken(): string | undefined {
  if (process.env.CLIENT_PORTAL_SECRET?.trim()) {
    return process.env.CLIENT_PORTAL_SECRET.trim();
  }
  if (!isProductionDeploy()) {
    return 'f5-client-dev-session';
  }
  return undefined;
}

export function isClientPortalAuthConfigured(): boolean {
  if (!process.env.CLIENT_PORTAL_PASSWORD?.trim()) return false;
  if (isProductionDeploy() && !getClientPortalSessionToken()) return false;
  return true;
}

export function verifyClientPortalPassword(password: string): boolean {
  const expected = process.env.CLIENT_PORTAL_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function isValidClientPortalSession(
  cookieValue: string | undefined,
): boolean {
  const token = getClientPortalSessionToken();
  if (!token || !cookieValue) return false;
  return cookieValue === token;
}

export function hasClientPortalSession(request: NextRequest): boolean {
  return isValidClientPortalSession(
    request.cookies.get(CLIENT_COOKIE_NAME)?.value,
  );
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function setClientPortalSessionCookie(
  response: NextResponse,
): NextResponse {
  const token = getClientPortalSessionToken();
  if (token) {
    response.cookies.set(CLIENT_COOKIE_NAME, token, sessionCookieOptions());
  }
  return response;
}

export function clearClientPortalSessionCookie(
  response: NextResponse,
): NextResponse {
  response.cookies.set(CLIENT_COOKIE_NAME, '', {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
