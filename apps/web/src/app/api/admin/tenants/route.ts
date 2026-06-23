import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';
import type { TenantSegment } from '@/types/internal';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const segment = request.nextUrl.searchParams.get('segment') as TenantSegment | null;
  const tenants = await internalData.tenants.list(segment ?? undefined);
  return NextResponse.json(tenants);
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const tenant = await internalData.tenants.create({
    name: body.name,
    cnpj: body.cnpj,
    segment: body.segment,
    scenario: body.scenario,
    status: body.status ?? 'trial',
  });
  return NextResponse.json(tenant, { status: 201 });
}
