/**
 * Gate 3 — portal cliente alinhado ao admin (KPIs + isolamento).
 * Uso: pnpm gate3:validate
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import {
  getClientOverview,
  getClientFinance,
  getClientProducts,
  getClientInsights,
} from '../src/lib/client/data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PILOT_NAME = 'PET Piloto Nutri';

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
    if (!tenant) throw new Error(`Tenant "${PILOT_NAME}" não encontrado`);

    const viewer = await prisma.user.findFirst({
      where: { tenantId: tenant.id, role: 'client_viewer' },
    });
    results.push({
      check: 'Viewer piloto no Neon',
      ok: Boolean(viewer),
      detail: viewer?.email,
    });

    const auth = {
      tenantId: tenant.id,
      email: viewer?.email ?? 'demo.nutri@f5digital.com.br',
      userId: viewer?.id ?? 'gate3',
      demo: false,
    };

    const [overview, finance, products, insights] = await Promise.all([
      getClientOverview(auth),
      getClientFinance(auth),
      getClientProducts(auth),
      getClientInsights(auth),
    ]);

    results.push({
      check: 'Overview com vendas do mês',
      ok: overview.monthSales > 0,
      detail: `R$ ${overview.monthSales.toFixed(2)}`,
    });

    results.push({
      check: 'Financeiro com NF-e',
      ok: finance.nfs.length >= 1,
      detail: `${finance.nfs.length} NF-e`,
    });

    results.push({
      check: 'Produtos monitorados',
      ok: products.items.length >= 4,
      detail: `${products.items.length} SKUs`,
    });

    results.push({
      check: 'Insights visíveis',
      ok: insights.items.length >= 1,
      detail: `${insights.items.length} insight(s)`,
    });

    const dm = await prisma.dashboardMetrics.findUnique({
      where: { tenantId: tenant.id },
    });
    const salesMatch =
      dm &&
      Math.abs(Number(dm.totalVendasMes) - overview.monthSales) < 1;
    results.push({
      check: 'KPI portal = DashboardMetrics',
      ok: Boolean(salesMatch),
      detail: salesMatch ? 'alinhado' : 'divergente',
    });

    const otherTenant = await prisma.tenant.findFirst({
      where: { id: { not: tenant.id }, status: 'active' },
    });
    if (otherTenant) {
      const otherViewer = await prisma.user.findFirst({
        where: { tenantId: otherTenant.id, role: 'client_viewer' },
      });
      if (otherViewer) {
        const otherOverview = await getClientOverview({
          tenantId: otherTenant.id,
          email: otherViewer.email,
          userId: otherViewer.id,
          demo: false,
        });
        results.push({
          check: 'Isolamento multi-tenant',
          ok: otherOverview.tenant.id !== tenant.id,
          detail: `${otherTenant.name} ≠ ${tenant.name}`,
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== Gate 3 Validation ===\n');
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
