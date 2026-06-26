import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { searchAdmin } from '@/lib/admin/search';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const q = request.nextUrl.searchParams.get('q') ?? '';
  const results = await searchAdmin(q);
  return NextResponse.json({ query: q.trim(), results });
}
