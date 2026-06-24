import { type NextRequest, NextResponse } from 'next/server';
import { getClientAuthContext } from '@/lib/client/auth';

export async function GET(request: NextRequest) {
  const ctx = await getClientAuthContext(request);
  if (!ctx) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: !ctx.demo,
    demo: ctx.demo,
    tenantId: ctx.tenantId,
    email: ctx.email,
  });
}
