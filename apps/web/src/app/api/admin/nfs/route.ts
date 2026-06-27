import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { CreateManualNfSchema, zodErrorMessage } from '@/lib/admin/schemas';
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

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const parsed = CreateManualNfSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 422 });
  }

  const { tenantId, nfNumber, nfSeries, nfDate, valorTotal, itemsCount, marketplace } =
    parsed.data;

  try {
    const nf = await internalData.nfs.create({
      tenantId,
      nfNumber,
      nfSeries,
      nfDate: nfDate ?? new Date().toISOString(),
      valorTotal,
      itemsCount,
      status: 'processed',
      marketplace,
    });

    await logAdminAudit({
      action: 'admin.nf_manual_create',
      actorEmail: getAdminEmail(),
      request,
      metadata: {
        tenantId,
        nfNumber: nf.nfNumber,
        valorTotal: nf.valorTotal,
      },
    });

    return NextResponse.json(nf, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar NF';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
