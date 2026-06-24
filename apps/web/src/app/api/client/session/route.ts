import { withSupabaseRoute } from '@/lib/supabase/with-route-handler';
import { requireClientAuth } from '@/lib/client/auth';
import { NextResponse } from 'next/server';

/** Example: JWT-verified session via @supabase/server (cookie or Bearer). */
export const GET = withSupabaseRoute({ auth: 'user' }, async (request, ctx) => {
  const portalAuth = await requireClientAuth(request);

  if (portalAuth instanceof NextResponse) {
    if (!ctx.userClaims?.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      demo: false,
      email: ctx.userClaims.email,
      authMode: ctx.authMode,
    });
  }

  return NextResponse.json({
    authenticated: !portalAuth.demo,
    demo: portalAuth.demo,
    tenantId: portalAuth.tenantId,
    email: portalAuth.email,
    authMode: ctx.authMode,
  });
});
