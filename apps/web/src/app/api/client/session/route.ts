import { withSupabaseRoute } from '@/lib/supabase/with-route-handler';
import { requireClientAuth } from '@/lib/client/auth';
import { clientJsonResponse } from '@/lib/http/client-response';

export const dynamic = 'force-dynamic';

/** Example: JWT-verified session via @supabase/server (cookie or Bearer). */
export const GET = withSupabaseRoute({ auth: 'user' }, async (request, ctx) => {
  const portalAuth = await requireClientAuth(request);

  if (portalAuth instanceof Response) {
    if (!ctx.userClaims?.email) {
      return clientJsonResponse({ authenticated: false }, { status: 401 });
    }

    return clientJsonResponse({
      authenticated: true,
      demo: false,
      email: ctx.userClaims.email,
      authMode: ctx.authMode,
    });
  }

  return clientJsonResponse({
    authenticated: !portalAuth.demo,
    demo: portalAuth.demo,
    tenantId: portalAuth.tenantId,
    email: portalAuth.email,
    authMode: ctx.authMode,
  });
});
