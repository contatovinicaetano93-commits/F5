import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { internalData } from '@/lib/internal/data';

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const tenantId = request.nextUrl.searchParams.get('tenantId') ?? undefined;
  return NextResponse.json(await internalData.nfs.list(tenantId));
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  try {
    const nf = await internalData.nfs.create({
      tenantId: body.tenantId,
      nfNumber: body.nfNumber,
      nfSeries: body.nfSeries ?? '1',
      nfDate: body.nfDate ?? new Date().toISOString(),
      valorTotal: body.valorTotal ?? 0,
      itemsCount: body.itemsCount ?? 0,
      status: 'pending',
    });
    return NextResponse.json(nf, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar NF';
    return NextResponse.json({ error: message }, { status: 501 });
  }
}
