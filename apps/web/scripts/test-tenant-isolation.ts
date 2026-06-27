/**
 * Gate P0-07 — isolamento multi-tenant (DB + portal data layer).
 * Uso: pnpm test:isolation
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { getClientOverview, getClientProducts } from '../src/lib/client/data';

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
    console.error('DATABASE_URL é obrigatório para test:isolation');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const results: { check: string; ok: boolean; detail?: string }[] = [];

  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'active' },
      take: 2,
      orderBy: { name: 'asc' },
    });

    results.push({
      check: '≥2 tenants ativos no banco',
      ok: tenants.length >= 2,
      detail: `${tenants.length} tenant(s)`,
    });

    if (tenants.length < 2) {
      throw new Error('Seed com pelo menos 2 tenants ativos para testar isolamento');
    }

    const [a, b] = tenants;

    const productsA = await prisma.product.findMany({ where: { tenantId: a.id } });
    const productLeak = productsA.some((p) => p.tenantId !== a.id);
    results.push({
      check: 'Produtos filtrados por tenantId (DB)',
      ok: !productLeak,
      detail: `${productsA.length} SKUs tenant A`,
    });

    const nfsA = await prisma.notaFiscal.findMany({ where: { tenantId: a.id } });
    const nfLeak = nfsA.some((n) => n.tenantId !== a.id);
    results.push({
      check: 'NF-e filtradas por tenantId (DB)',
      ok: !nfLeak,
      detail: `${nfsA.length} NF-e tenant A`,
    });

    const viewerB = await prisma.user.findFirst({
      where: { tenantId: b.id, role: 'client_viewer' },
    });

    const authA = {
      tenantId: a.id,
      email: 'isolation-a@f5.internal',
      userId: 'iso-a',
      demo: false,
    };
    const authB = {
      tenantId: b.id,
      email: viewerB?.email ?? 'isolation-b@f5.internal',
      userId: viewerB?.id ?? 'iso-b',
      demo: false,
    };

    const [overviewA, overviewB, productsPortalA, productsPortalB] = await Promise.all([
      getClientOverview(authA),
      getClientOverview(authB),
      getClientProducts(authA),
      getClientProducts(authB),
    ]);

    results.push({
      check: 'Portal overview isolado por tenant',
      ok: overviewA.tenant.id !== overviewB.tenant.id,
      detail: `${overviewA.tenant.id.slice(0, 8)}… ≠ ${overviewB.tenant.id.slice(0, 8)}…`,
    });

    const portalIdsA = productsPortalA.items.map((p) => p.id);
    const portalIdsB = productsPortalB.items.map((p) => p.id);

    if (portalIdsA.length > 0) {
      const dbA = await prisma.product.findMany({ where: { id: { in: portalIdsA } } });
      const portalALeak = dbA.some((p) => p.tenantId !== a.id);
      results.push({
        check: 'Produtos portal A pertencem ao tenant A',
        ok: !portalALeak,
        detail: `${dbA.length} produtos verificados`,
      });
    }

    if (portalIdsB.length > 0) {
      const dbB = await prisma.product.findMany({ where: { id: { in: portalIdsB } } });
      const portalBLeak = dbB.some((p) => p.tenantId !== b.id);
      results.push({
        check: 'Produtos portal B pertencem ao tenant B',
        ok: !portalBLeak,
        detail: `${dbB.length} produtos verificados`,
      });
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== Tenant Isolation Test ===\n');
  let passed = 0;
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} ${r.check}${r.detail ? ` — ${r.detail}` : ''}`);
    if (r.ok) passed++;
  }
  console.log(`\n${passed}/${results.length} checks passed\n`);
  if (passed < results.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
