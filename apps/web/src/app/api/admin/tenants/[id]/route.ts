import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const detail = await internalData.getTenantDetail(params.id);
  if (!detail) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
  }
  return NextResponse.json(detail);
}
