import { type NextRequest, NextResponse } from 'next/server';
import {
  hasAdminSession,
  isAdminAuthConfigured,
} from '@/lib/admin-auth';
import {
  hasClientPortalSession,
  isClientPortalAuthConfigured,
} from '@/lib/client-portal-auth';
import { isSupabaseConfigured } from '@/lib/supabase-client';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';
import { isClientAuthRequired } from '@/lib/client/auth';
import { applySecurityHeaders } from '@/lib/resilience/security-headers';
import { createServerClient } from '@supabase/ssr';

function withSecurity(response: NextResponse) {
  return applySecurityHeaders(response);
}

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname === '/login') return true;
  if (pathname.startsWith('/pitch')) return true;
  if (pathname.startsWith('/portal')) return true;
  return false;
}

async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getSession();
  return { response, supabase };
}

async function requireSupabaseUser(request: NextRequest) {
  const { response, supabase } = await refreshSupabaseSession(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return response;

  if (request.nextUrl.pathname.startsWith('/api/client')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

async function requireClientPortalSession(request: NextRequest) {
  if (hasClientPortalSession(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/client')) {
    if (request.nextUrl.pathname === '/api/client/auth/login') {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/health' || pathname.startsWith('/api/cron/')) {
    return withSecurity(NextResponse.next());
  }

  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')) {
    return withSecurity(NextResponse.next());
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!isAdminAuthConfigured()) {
      if (pathname.startsWith('/api/')) {
        return withSecurity(
          NextResponse.json(
            { error: 'Admin auth not configured' },
            { status: 503 },
          ),
        );
      }
      return withSecurity(NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    if (!hasAdminSession(request)) {
      if (pathname.startsWith('/api/')) {
        return withSecurity(
          NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return withSecurity(NextResponse.redirect(loginUrl));
    }

    return withSecurity(NextResponse.next());
  }

  const clientProtected =
    pathname.startsWith('/cliente') || pathname.startsWith('/api/client');

  if (clientProtected && isClientAuthRequired()) {
    if (
      pathname === '/api/client/auth/logout' ||
      pathname === '/api/client/auth/login'
    ) {
      return withSecurity(NextResponse.next());
    }

    if (isSupabaseConfigured()) {
      return withSecurity(await requireSupabaseUser(request));
    }

    if (isClientPortalAuthConfigured()) {
      return withSecurity(await requireClientPortalSession(request));
    }

    if (pathname.startsWith('/api/')) {
      return withSecurity(
        NextResponse.json(
          { error: 'Client auth not configured' },
          { status: 503 },
        ),
      );
    }
    return withSecurity(NextResponse.redirect(new URL('/login', request.url)));
  }

  if (isPublicPath(pathname)) {
    return withSecurity(NextResponse.next());
  }

  if (isSupabaseConfigured()) {
    const { response } = await refreshSupabaseSession(request);
    return withSecurity(response);
  }

  return withSecurity(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.svg$).*)',
  ],
};
