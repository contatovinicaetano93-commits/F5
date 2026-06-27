import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { UpdateProductSchema, zodErrorMessage } from '@/lib/admin/schemas';
import { internalData } from '@/lib/internal/data';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const parsed = UpdateProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 422 });
  }

  const updated = await internalData.products.update(params.id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  }

  await logAdminAudit({
    action: 'admin.product_update',
    actorEmail: getAdminEmail(),
    request,
    metadata: {
      productId: updated.id,
      tenantId: updated.tenantId,
      sku: updated.sku,
      active: updated.active,
    },
  });

  return NextResponse.json(updated);
}
