/**
 * Gate Pilot E2E — admin cadastra → Postgres → portal lê (mesmo tenant).
 * Uso: pnpm gate-pilot:e2e
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { internalData } from '../src/lib/internal/data';
import {
  getClientOverview,
  getClientProducts,
} from '../src/lib/client/data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PILOT_NAME = 'PET Piloto Nutri';
const GATE_SKU_PREFIX = 'GATE-E2E-';

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
    console.error('DATABASE_URL é obrigatório para gate-pilot:e2e');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const results: { check: string; ok: boolean; detail?: string }[] = [];
  let testProductId: string | null = null;

  try {
    const tenant = await prisma.tenant.findFirst({
      where: { name: PILOT_NAME },
    });
    results.push({
      check: 'Tenant piloto no banco',
      ok: Boolean(tenant),
      detail: tenant?.name,
    });
    if (!tenant) throw new Error(`Tenant "${PILOT_NAME}" não encontrado`);

    const demoTenantId = process.env.CLIENT_DEMO_TENANT_ID?.trim();
    if (demoTenantId) {
      results.push({
        check: 'CLIENT_DEMO_TENANT_ID alinhado ao piloto',
        ok: demoTenantId === tenant.id,
        detail:
          demoTenantId === tenant.id
            ? tenant.id
            : `env=${demoTenantId} ≠ piloto=${tenant.id}`,
      });
    }

    const auth = {
      tenantId: tenant.id,
      email: 'gate-pilot@f5.internal',
      userId: 'gate-pilot',
      demo: false,
    };

    const adminBefore = await internalData.products.list(tenant.id);
    const portalBefore = await getClientProducts(auth);
    results.push({
      check: 'Admin e portal leem o mesmo tenant',
      ok: adminBefore.length > 0 && portalBefore.items.length > 0,
      detail: `admin ${adminBefore.length} · portal ${portalBefore.items.length} SKUs`,
    });

    const adminSkus = new Set(adminBefore.map((p) => p.sku.toUpperCase()));
    const portalSkus = new Set(
      portalBefore.items.map((p) => p.sku.toUpperCase()),
    );
    const sharedSkus = [...adminSkus].filter((sku) => portalSkus.has(sku));
    results.push({
      check: 'SKUs admin ⊆ portal (piloto)',
      ok: sharedSkus.length === adminSkus.size,
      detail: `${sharedSkus.length}/${adminSkus.size} em comum`,
    });

    const gateSku = `${GATE_SKU_PREFIX}${Date.now()}`;
    const created = await internalData.products.create({
      tenantId: tenant.id,
      sku: gateSku,
      name: 'Gate Pilot E2E',
      category: 'Teste',
      marketplace: 'mercado_livre',
    });
    testProductId = created.id;

    const adminAfterCreate = await internalData.products.list(tenant.id);
    results.push({
      check: 'Admin persiste produto novo',
      ok: adminAfterCreate.some((p) => p.sku === gateSku),
      detail: gateSku,
    });

    const portalAfterCreate = await getClientProducts(auth);
    results.push({
      check: 'Portal reflete produto novo',
      ok: portalAfterCreate.items.some((p) => p.sku === gateSku),
      detail: `${portalAfterCreate.items.length} SKUs no portal`,
    });

    await internalData.metrics.create({
      tenantId: tenant.id,
      productId: created.id,
      marketplace: 'mercado_livre',
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      impressions: 100,
      visits: 50,
      unitsSold: 5,
      revenue: 250,
      notes: 'gate-pilot:e2e',
    });

    const overview = await getClientOverview(auth);
    results.push({
      check: 'Portal overview após lançamento',
      ok: overview.monthSales > 0,
      detail: `R$ ${overview.monthSales.toFixed(2)}`,
    });

    const dm = await prisma.dashboardMetrics.findUnique({
      where: { tenantId: tenant.id },
    });
    const aligned =
      dm !== null &&
      Math.abs(Number(dm.totalVendasMes) - overview.monthSales) < 1;
    results.push({
      check: 'KPI portal = DashboardMetrics',
      ok: aligned,
      detail: aligned ? 'alinhado' : 'divergente',
    });
  } finally {
    if (testProductId) {
      await prisma.productMetric.deleteMany({ where: { productId: testProductId } });
      await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});
    }
    await prisma.$disconnect();
  }

  console.log('\n=== Gate Pilot E2E ===\n');
  let passed = 0;
  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${r.check}${r.detail ? ` — ${r.detail}` : ''}`);
    if (r.ok) passed++;
  }
  console.log(`\n${passed}/${results.length} checks passed\n`);
  if (passed < results.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
