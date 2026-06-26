import type { NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';
import { hasDatabase, prisma } from '@/lib/prisma';
import { getClientIp, getUserAgent } from '@/lib/http/client-ip';

export type AdminAuditAction =
  | 'admin.login_success'
  | 'admin.login_failed'
  | 'admin.login_rate_limited'
  | 'admin.logout'
  | 'admin.tenant_create'
  | 'admin.tenant_update'
  | 'admin.product_create'
  | 'admin.product_update'
  | 'admin.catalog_import'
  | 'admin.metric_create'
  | 'admin.insight_create'
  | 'admin.insight_update'
  | 'admin.nf_upload'
  | 'admin.metrics_import'
  | 'admin.payment_mark_paid';

export interface AdminAuditEntry {
  id: string;
  action: AdminAuditAction;
  actorEmail: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export async function logAdminAudit(params: {
  action: AdminAuditAction;
  actorEmail?: string;
  request?: NextRequest;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!hasDatabase()) return;

  const ip = params.request ? getClientIp(params.request) : undefined;
  const userAgent = params.request ? getUserAgent(params.request) : undefined;

  try {
    await prisma.adminAuditLog.create({
      data: {
        action: params.action,
        actorEmail: params.actorEmail,
        ip,
        userAgent,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error('[admin-audit]', params.action, err);
  }
}

export async function listAdminAuditLogs(
  limit = 50,
  action?: string,
): Promise<AdminAuditEntry[]> {
  if (!hasDatabase()) return [];

  const rows = await prisma.adminAuditLog.findMany({
    where: action ? { action } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    action: row.action as AdminAuditAction,
    actorEmail: row.actorEmail,
    ip: row.ip,
    userAgent: row.userAgent,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}
