import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { internalData } from '@/lib/internal/data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const result = await internalData.payments.markPaid(params.id);
    await logAdminAudit({
      action: 'admin.payment_mark_paid',
      actorEmail: getAdminEmail(),
      request,
      metadata: { paymentId: params.id, tenantId: result.tenantId },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar repasse';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
