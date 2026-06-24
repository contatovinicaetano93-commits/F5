import { type NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const err = new Error('F5 Sentry server test');
  Sentry.captureException(err);
  await Sentry.flush(2000);

  return NextResponse.json({
    ok: true,
    message: 'Evento de servidor enviado ao Sentry. Verifique em ~30s.',
  });
}
