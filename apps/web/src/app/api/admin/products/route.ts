import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const tenantId = request.nextUrl.searchParams.get('tenantId') ?? undefined;
  return NextResponse.json(await internalData.products.list(tenantId));
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const product = await internalData.products.create(body);
  return NextResponse.json(product, { status: 201 });
}
