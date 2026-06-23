import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const tenantId = request.nextUrl.searchParams.get('tenantId') ?? undefined;
  return NextResponse.json(await internalData.insights.list(tenantId));
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const insight = await internalData.insights.create(body);
  return NextResponse.json(insight, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updated = await internalData.insights.update(body.id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Insight não encontrado' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
