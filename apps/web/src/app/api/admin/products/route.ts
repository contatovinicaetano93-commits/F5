import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { CreateProductSchema, zodErrorMessage } from '@/lib/admin/schemas';
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

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const parsed = CreateProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 422 });
  }

  const product = await internalData.products.create(parsed.data);

  await logAdminAudit({
    action: 'admin.product_create',
    actorEmail: getAdminEmail(),
    request,
    metadata: {
      productId: product.id,
      tenantId: product.tenantId,
      sku: product.sku,
      name: product.name,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
