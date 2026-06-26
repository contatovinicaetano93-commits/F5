import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { listAdminAuditLogs } from '@/lib/admin/audit';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.min(Number(limitParam) || 50, 200) : 50;
  const action = request.nextUrl.searchParams.get('action') ?? undefined;
  const logs = await listAdminAuditLogs(limit, action);

  return NextResponse.json({ logs });
}
