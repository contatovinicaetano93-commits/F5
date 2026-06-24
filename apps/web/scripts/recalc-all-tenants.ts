/**
 * Recalcula DashboardMetrics para todos os tenants ativos.
 * Uso: pnpm db:recalc-all-tenants
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { updateDashboardMetrics } from '../src/lib/metrics/dashboard';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
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
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(__dirname, '../.env.local'));
loadEnvFile(resolve(__dirname, '../../../services/api/.env'));

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('[F5] DATABASE_URL ausente');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
      select: { id: true, name: true },
    });

    for (const tenant of tenants) {
      await updateDashboardMetrics(tenant.id, prisma);
      console.log(`✅ ${tenant.name}`);
    }

    console.log(`\n[F5] ${tenants.length} tenant(s) recalculados`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
