import { NextRequest, NextResponse } from 'next/server';
import {
  clearAdminSessionCookie,
  getAdminEmail,
  hasAdminSession,
} from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';

export async function POST(request: NextRequest) {
  if (hasAdminSession(request)) {
    await logAdminAudit({
      action: 'admin.logout',
      actorEmail: getAdminEmail(),
      request,
    });
  }

  const response = NextResponse.json({ ok: true });
  return clearAdminSessionCookie(response);
}
