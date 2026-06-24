import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, prisma } from '@/lib/prisma';
import { updateDashboardMetrics } from '@/lib/metrics/dashboard';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== 'production';
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

/** Cron semanal — recalcula dashboard de todos os tenants ativos. */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasDatabase()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no database' });
  }

  const tenants = await prisma.tenant.findMany({
    where: { status: 'active' },
    select: { id: true, name: true },
  });

  const results: { tenantId: string; name: string; ok: boolean }[] = [];
  for (const tenant of tenants) {
    try {
      await updateDashboardMetrics(tenant.id);
      results.push({ tenantId: tenant.id, name: tenant.name, ok: true });
    } catch {
      results.push({ tenantId: tenant.id, name: tenant.name, ok: false });
    }
  }

  return NextResponse.json({
    ok: results.every((r) => r.ok),
    tenants: results.length,
    results,
  });
}
