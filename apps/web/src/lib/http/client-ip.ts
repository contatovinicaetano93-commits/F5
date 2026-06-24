import type { NextRequest } from 'next/server';

/** Client IP behind Vercel / reverse proxies. */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function getUserAgent(request: NextRequest): string | undefined {
  const ua = request.headers.get('user-agent');
  return ua?.slice(0, 512) || undefined;
}
