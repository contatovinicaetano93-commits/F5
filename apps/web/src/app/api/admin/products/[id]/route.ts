import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { internalData } from '@/lib/internal/data';
import type { Marketplace } from '@/types/internal';

const MARKETPLACES: Marketplace[] = [
  'mercado_livre',
  'amazon',
  'shopee',
  'tiktok',
  'outros',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const body = await request.json();
  const data: {
    name?: string;
    description?: string;
    category?: string;
    marketplace?: Marketplace;
    active?: boolean;
  } = {};

  if (typeof body.name === 'string' && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.description === 'string') {
    data.description = body.description.trim() || undefined;
  }
  if (typeof body.category === 'string') {
    data.category = body.category.trim() || undefined;
  }
  if (typeof body.marketplace === 'string' && MARKETPLACES.includes(body.marketplace as Marketplace)) {
    data.marketplace = body.marketplace as Marketplace;
  }
  if (typeof body.active === 'boolean') {
    data.active = body.active;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const updated = await internalData.products.update(params.id, data);
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
