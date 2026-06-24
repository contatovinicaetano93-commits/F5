import { hasDatabase, prisma } from '@/lib/prisma';
import { isProductionDeploy } from '@/lib/env';
import {
  CLIENT_DEMO_TENANT_ID,
  CLIENT_DEMO_TENANT_NAME,
} from '@/lib/client/constants';

/** Tenant exibido no portal cliente (MVP sem login). */
export async function resolveClientTenantId(): Promise<string> {
  if (process.env.CLIENT_DEMO_TENANT_ID?.trim()) {
    return process.env.CLIENT_DEMO_TENANT_ID.trim();
  }

  if (isProductionDeploy()) {
    throw new Error(
      'CLIENT_DEMO_TENANT_ID é obrigatório em produção. Configure na Vercel.',
    );
  }

  const tenantName = process.env.CLIENT_DEMO_TENANT_NAME ?? CLIENT_DEMO_TENANT_NAME;

  if (hasDatabase()) {
    const byName = await prisma.tenant.findFirst({
      where: { name: tenantName },
      orderBy: { createdAt: 'asc' },
    });
    if (byName) return byName.id;
  }

  return CLIENT_DEMO_TENANT_ID;
}
