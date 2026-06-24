/**
 * Recalcula DashboardMetrics para um tenant (upsert — não apaga dados).
 * Uso: TENANT_ID=... ou arg1; env de apps/web/.env.local (DATABASE_URL).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { updateDashboardMetrics } from '../src/lib/metrics/dashboard';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

function loadEnvLocal() {
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnvLocal();

if (!process.env.DATABASE_URL?.trim()) {
  console.error('[F5] DATABASE_URL ausente. Configure apps/web/.env.local');
  process.exit(1);
}

const DEMO_NAMES = ['Indústria Pet — Piloto A', 'PET Piloto Nutri'] as const;

async function resolveTenantId(prisma: PrismaClient): Promise<string> {
  const fromArg = process.argv
    .slice(2)
    .find((a) => a !== '--' && a.trim())?.trim();
  if (fromArg) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: fromArg },
      select: { id: true, name: true },
    });
    if (!tenant) throw new Error(`Tenant não encontrado: ${fromArg}`);
    console.log(`[F5] Tenant: ${tenant.name} (${tenant.id})`);
    return tenant.id;
  }

  const fromEnv = process.env.CLIENT_DEMO_TENANT_ID?.trim();
  if (fromEnv) return fromEnv;

  const names = [
    process.env.CLIENT_DEMO_TENANT_NAME?.trim(),
    ...DEMO_NAMES,
  ].filter((n): n is string => Boolean(n));

  for (const name of names) {
    const tenant = await prisma.tenant.findFirst({
      where: { name },
      select: { id: true, name: true },
    });
    if (tenant) {
      console.log(`[F5] Tenant: ${tenant.name} (${tenant.id})`);
      return tenant.id;
    }
  }

  throw new Error(`Tenant não encontrado (tentativas: ${names.join(', ')})`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const tenantId = await resolveTenantId(prisma);

    const beforePs = await prisma.paymentSchedule.count({ where: { tenantId } });
    const beforeDm = await prisma.dashboardMetrics.findUnique({
      where: { tenantId },
    });

    await updateDashboardMetrics(tenantId, prisma);

    const afterPs = await prisma.paymentSchedule.count({ where: { tenantId } });
    const afterDm = await prisma.dashboardMetrics.findUnique({
      where: { tenantId },
    });

    console.log('[F5] updateDashboardMetrics concluído');
    console.log(
      JSON.stringify(
        {
          tenantId,
          paymentSchedule: { before: beforePs, after: afterPs },
          dashboardMetrics: {
            before: beforeDm ? 'exists' : 'missing',
            after: afterDm ? 'exists' : 'missing',
            snapshot: afterDm
              ? {
                  totalVendasMes: Number(afterDm.totalVendasMes),
                  pagamentosReceber: Number(afterDm.pagamentosReceber),
                  calculatedAt: afterDm.calculatedAt.toISOString(),
                }
              : null,
          },
        },
        null,
        2,
      ),
    );

    if (afterPs === 0) {
      console.warn(
        '[F5] Aviso: nenhum PaymentSchedule para este tenant (recalc usa só leitura).',
      );
    }
    if (!afterDm) {
      console.error('[F5] DashboardMetrics ainda ausente após recalc.');
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[F5]', err instanceof Error ? err.message : err);
  process.exit(1);
});
