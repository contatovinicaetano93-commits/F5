import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getAdminEmail } from '@/lib/admin-auth';
import { logAdminAudit } from '@/lib/admin/audit';
import { internalData } from '@/lib/internal/data';
import { hasDatabase, prisma } from '@/lib/prisma';
import type { OperatingScenario, TenantSegment } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const detail = await internalData.getTenantDetail(params.id);
  if (!detail) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  if (!hasDatabase()) {
    return NextResponse.json({ error: 'Banco não configurado' }, { status: 503 });
  }

  const body = await request.json();
  const data: {
    name?: string;
    segment?: TenantSegment;
    scenario?: OperatingScenario;
    status?: string;
  } = {};

  if (typeof body.name === 'string' && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.segment === 'string') {
    data.segment = body.segment as TenantSegment;
  }
  if (typeof body.scenario === 'string') {
    data.scenario = body.scenario as OperatingScenario;
  }
  if (typeof body.status === 'string') {
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  try {
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data,
    });

    await logAdminAudit({
      action: 'admin.tenant_update',
      actorEmail: getAdminEmail(),
      request,
      metadata: {
        tenantId: tenant.id,
        name: tenant.name,
        status: tenant.status,
      },
    });

    return NextResponse.json({ ok: true, tenant });
  } catch {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
  }
}
