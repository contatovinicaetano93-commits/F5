import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { PatchInsightSchema, zodErrorMessage } from '@/lib/admin/schemas';
import { internalData } from '@/lib/internal/data';
import type { InsightNote } from '@/types/internal';
import { sendInsightNotification } from '@/lib/email/insight-notification';

const CreateInsightSchema = z.object({
  tenantId: z.string().min(1, 'tenantId é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório').trim(),
  body: z.string().min(1, 'Conteúdo é obrigatório').trim(),
  visibleToClient: z.boolean().default(false),
  weekOf: z.string().optional(),
  productId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const tenantId = request.nextUrl.searchParams.get('tenantId') ?? undefined;
  return NextResponse.json(await internalData.insights.list(tenantId));
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const parseResult = CreateInsightSchema.safeParse(await request.json());
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 422 });
  }

  const insight = await internalData.insights.create(parseResult.data);

  await logAdminAudit({
    action: 'admin.insight_create',
    actorEmail: getAdminEmail(),
    request,
    metadata: {
      insightId: insight.id,
      tenantId: insight.tenantId,
      title: insight.title,
      visibleToClient: insight.visibleToClient,
    },
  });

  if (insight.visibleToClient) {
    const tenant = await internalData.tenants.list().then((list) =>
      list.find((t) => t.id === insight.tenantId),
    );
    if (tenant) {
      sendInsightNotification({
        tenantName: tenant.name,
        recipientEmail: tenant.cnpj ?? 'cliente@f5digital.com.br',
        insightTitle: insight.title,
        insightBody: insight.body,
        portalUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.f5digital.com.br'}/cliente`,
      }).catch((e: unknown) => console.error('[insight email]', e));
    }
  }

  return NextResponse.json(insight, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const body = await request.json();
  const parsed = PatchInsightSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 422 });
  }

  const { id, productId, ...rest } = parsed.data;
  const patch: Partial<InsightNote> = { ...rest };
  if (productId !== undefined) {
    patch.productId = productId ?? undefined;
  }
  const updated = await internalData.insights.update(id, patch);
  if (!updated) {
    return NextResponse.json({ error: 'Insight não encontrado' }, { status: 404 });
  }

  await logAdminAudit({
    action: 'admin.insight_update',
    actorEmail: getAdminEmail(),
    request,
    metadata: {
      insightId: updated.id,
      tenantId: updated.tenantId,
      title: updated.title,
      visibleToClient: updated.visibleToClient,
    },
  });

  return NextResponse.json(updated);
}
