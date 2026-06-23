import { type NextRequest, NextResponse } from 'next/server';
import {
  hasAdminSession,
  isAdminAuthConfigured,
} from '@/lib/admin-auth';
import { updateSession } from '@/lib/middleware-utils';

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname === '/login') return true;
  if (pathname.startsWith('/pitch')) return true;
  if (pathname.startsWith('/cliente')) return true;
  if (pathname.startsWith('/portal')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/auth')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!isAdminAuthConfigured()) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Admin auth not configured' },
          { status: 503 },
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (!hasAdminSession(request)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith('/api/client')) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};
