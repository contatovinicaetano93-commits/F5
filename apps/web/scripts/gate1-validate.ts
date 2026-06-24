/**
 * Gate 1 — validação operacional admin (tenant piloto + SKUs + fluxo mínimo).
 * Uso: pnpm gate1:validate
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PILOT_NAME = 'PET Piloto Nutri';
const MIN_SKUS = 4;

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
  const prisma = new PrismaClient();
  const results: { check: string; ok: boolean; detail?: string }[] = [];

  try {
    const tenant = await prisma.tenant.findFirst({
      where: { name: PILOT_NAME },
    });
    results.push({
      check: 'Tenant piloto cadastrado',
      ok: Boolean(tenant),
      detail: tenant?.name,
    });

    if (!tenant) throw new Error('Tenant piloto ausente');

    const skuCount = await prisma.product.count({ where: { tenantId: tenant.id } });
    results.push({
      check: 'SKUs piloto (≥4)',
      ok: skuCount >= MIN_SKUS,
      detail: `${skuCount} produtos`,
    });

    const viewers = await prisma.user.count({
      where: { tenantId: tenant.id, role: 'client_viewer' },
    });
    results.push({
      check: 'Usuários portal (client_viewer)',
      ok: viewers >= 1,
      detail: `${viewers} viewer(s)`,
    });

    const metrics = await prisma.productMetric.count({
      where: { tenantId: tenant.id },
    });
    results.push({
      check: 'Lançamentos de métricas',
      ok: metrics >= 1,
      detail: `${metrics} registros`,
    });

    const nfs = await prisma.notaFiscal.count({ where: { tenantId: tenant.id } });
    results.push({
      check: 'NF-e registradas',
      ok: nfs >= 1,
      detail: `${nfs} NF-e`,
    });

    const insights = await prisma.insightNote.count({
      where: { tenantId: tenant.id, visibleToClient: true },
    });
    results.push({
      check: 'Insight publicável ao cliente',
      ok: insights >= 1,
      detail: `${insights} insight(s)`,
    });

    const dashboard = await prisma.dashboardMetrics.findUnique({
      where: { tenantId: tenant.id },
    });
    results.push({
      check: 'DashboardMetrics calculado',
      ok: Boolean(dashboard),
      detail: dashboard
        ? `R$ ${Number(dashboard.totalVendasMes).toFixed(0)}`
        : 'ausente',
    });
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== Gate 1 Validation ===\n');
  let passed = 0;
  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${r.check}${r.detail ? ` — ${r.detail}` : ''}`);
    if (r.ok) passed++;
  }
  console.log(`\n${passed}/${results.length} checks passed\n`);
  if (passed < results.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
