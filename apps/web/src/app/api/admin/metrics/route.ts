import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const tenantId = request.nextUrl.searchParams.get('tenantId') ?? undefined;
  const productId = request.nextUrl.searchParams.get('productId') ?? undefined;
  return NextResponse.json(await internalData.metrics.list(tenantId, productId));
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const metric = await internalData.metrics.create(body);
  return NextResponse.json(metric, { status: 201 });
}
