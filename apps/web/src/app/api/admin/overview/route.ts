import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  return NextResponse.json(await internalData.overview());
}
