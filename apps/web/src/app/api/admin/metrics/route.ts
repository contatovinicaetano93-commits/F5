import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { internalData } from '@/lib/internal/data';

const CreateMetricSchema = z.object({
  tenantId: z.string().min(1, 'tenantId é obrigatório'),
  productId: z.string().min(1, 'productId é obrigatório'),
  marketplace: z.enum(['mercado_livre', 'amazon', 'shopee', 'tiktok', 'outros']),
  periodStart: z.string().min(1, 'periodStart é obrigatório'),
  periodEnd: z.string().min(1, 'periodEnd é obrigatório'),
  impressions: z.number().int().min(0).default(0),
  visits: z.number().int().min(0).default(0),
  unitsSold: z.number().int().min(0).default(0),
  revenue: z.number().min(0).default(0),
  searchPosition: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

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

  const parseResult = CreateMetricSchema.safeParse(await request.json());
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 422 });
  }

  const metric = await internalData.metrics.create(parseResult.data);

  await logAdminAudit({
    action: 'admin.metric_create',
    actorEmail: getAdminEmail(),
    request,
    metadata: {
      metricId: metric.id,
      tenantId: metric.tenantId,
      productId: metric.productId,
      unitsSold: metric.unitsSold,
      revenue: metric.revenue,
    },
  });

  return NextResponse.json(metric, { status: 201 });
}
