import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { requireDatabaseForWrite } from '@/lib/admin/system-status';
import { internalData } from '@/lib/internal/data';
import type { TenantSegment } from '@/types/internal';

const CreateTenantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').trim(),
  segment: z.enum(['PET', 'SAUDE', 'PAPEL', 'PARAFUSO']),
  scenario: z.enum(['BRACO_ONLINE', 'SOCIO_DIGITAL', 'COMPRAR_REVENDER', 'AMAZON_1P']),
  status: z.enum(['active', 'inactive', 'trial']).default('trial'),
  cnpj: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const segment = request.nextUrl.searchParams.get('segment') as TenantSegment | null;
  const tenants = await internalData.tenants.list(segment ?? undefined);
  return NextResponse.json(tenants);
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const dbError = requireDatabaseForWrite();
  if (dbError) return dbError;

  const result = CreateTenantSchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 422 });
  }

  const { name, segment, scenario, status, cnpj } = result.data;

  const tenant = await internalData.tenants.create({
    name,
    cnpj,
    segment: segment as TenantSegment,
    scenario,
    status,
  });

  await logAdminAudit({
    action: 'admin.tenant_create',
    actorEmail: getAdminEmail(),
    request,
    metadata: {
      tenantId: tenant.id,
      name: tenant.name,
      segment: tenant.segment,
      scenario: tenant.scenario,
    },
  });

  return NextResponse.json(tenant, { status: 201 });
}
