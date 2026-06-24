import {
  createSupabaseContext,
  type AuthModeWithKey,
  type SupabaseContext,
  type WithSupabaseConfig,
} from '@supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseEnvOverrides } from '@/lib/supabase/env';
import { createSupabaseServerContext } from '@/lib/supabase/context';

type RouteHandler = (
  req: NextRequest,
  ctx: SupabaseContext,
) => Promise<Response>;

function authIncludesUser(
  auth: AuthModeWithKey | AuthModeWithKey[] | undefined,
): boolean {
  if (!auth) return true;
  if (auth === 'user') return true;
  if (Array.isArray(auth)) return auth.includes('user');
  return false;
}

function isHeaderAuthMode(auth: AuthModeWithKey | AuthModeWithKey[]): boolean {
  const modes = Array.isArray(auth) ? auth : [auth];
  return modes.some(
    (mode) =>
      mode === 'none' ||
      mode === 'publishable' ||
      mode === 'secret' ||
      mode.startsWith('publishable:') ||
      mode.startsWith('secret:'),
  );
}

function hasRequestCredentials(request: NextRequest): boolean {
  return (
    request.headers.has('authorization') || request.headers.has('apikey')
  );
}

/**
 * Next.js App Router adapter for `withSupabase`.
 *
 * - Bearer / apikey headers → `@supabase/server` `createSupabaseContext`
 * - Cookie sessions (client portal) → SSR + JWKS via `createSupabaseServerContext`
 */
export function withSupabaseRoute(
  config: Pick<WithSupabaseConfig, 'auth' | 'env'>,
  handler: RouteHandler,
) {
  const auth = config.auth ?? 'user';
  const envOverrides = () =>
    getSupabaseEnvOverrides(config.env as Parameters<typeof getSupabaseEnvOverrides>[0]);

  return async (request: NextRequest): Promise<Response> => {
    const useHeaderContext =
      hasRequestCredentials(request) || isHeaderAuthMode(auth);

    if (useHeaderContext) {
      const { data: ctx, error } = await createSupabaseContext(request, {
        auth,
        cors: false,
        env: envOverrides(),
      });

      if (error) {
        return NextResponse.json(
          { message: error.message, code: error.code },
          { status: error.status },
        );
      }

      return handler(request, ctx!);
    }

    if (authIncludesUser(auth)) {
      const { data: ctx, error } = await createSupabaseServerContext({ auth });

      if (error) {
        const status =
          'status' in error && typeof error.status === 'number'
            ? error.status
            : 401;
        const code = 'code' in error ? error.code : undefined;
        return NextResponse.json(
          { message: error.message, code },
          { status },
        );
      }

      return handler(request, ctx!);
    }

    const { data: ctx, error } = await createSupabaseContext(request, {
      auth,
      cors: false,
      env: envOverrides(),
    });

    if (error) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status },
      );
    }

    return handler(request, ctx!);
  };
}

export { withSupabaseRoute as withSupabase };
