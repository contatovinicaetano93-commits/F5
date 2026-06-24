/**
 * Seed idempotente do tenant piloto — seguro em produção (não apaga dados).
 * Uso: pnpm db:seed:pilot
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PILOT_TENANT_NAME = 'PET Piloto Nutri';

const PILOT_PRODUCTS = [
  {
    sku: 'PET-NP-001',
    name: 'Ração extrusada aves premium 900g',
    category: 'Alimentação',
    marketplace: 'amazon' as const,
  },
  {
    sku: 'PET-NP-002',
    name: 'Snack natural aves 500g',
    category: 'Alimentação',
    marketplace: 'mercado_livre' as const,
  },
  {
    sku: 'PET-NP-003',
    name: 'Suplemento vitamínico aves 250g',
    category: 'Suplementos',
    marketplace: 'mercado_livre' as const,
  },
  {
    sku: 'PET-NP-004',
    name: 'Comedouro automático aves',
    category: 'Acessórios',
    marketplace: 'amazon' as const,
  },
];

async function resolvePilotTenantId(): Promise<string> {
  const fromEnv = process.env.CLIENT_DEMO_TENANT_ID?.trim();
  if (fromEnv) {
    const t = await prisma.tenant.findUnique({ where: { id: fromEnv } });
    if (t) return t.id;
  }

  const byName = await prisma.tenant.findFirst({
    where: { name: PILOT_TENANT_NAME },
  });
  if (byName) return byName.id;

  const legacy = await prisma.tenant.findFirst({
    where: { name: { contains: 'Piloto A' } },
  });
  if (legacy) return legacy.id;

  const created = await prisma.tenant.create({
    data: {
      name: PILOT_TENANT_NAME,
      segment: 'PET',
      scenario: 'AMAZON_1P',
      status: 'active',
    },
  });
  return created.id;
}

async function recalcDashboard(tenantId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

  const [metrics, nfs, schedules] = await Promise.all([
    prisma.productMetric.findMany({
      where: { tenantId, periodStart: { gte: start, lte: end } },
    }),
    prisma.notaFiscal.findMany({
      where: { tenantId, nfDate: { gte: start, lte: end } },
    }),
    prisma.paymentSchedule.findMany({
      where: { tenantId, status: 'pending' },
    }),
  ]);

  let totalVendasMes = 0;
  const channels: Record<string, number> = {
    mercado_livre: 0,
    amazon: 0,
    shopee: 0,
  };

  for (const m of metrics) {
    totalVendasMes += Number(m.revenue);
    channels[m.marketplace] = (channels[m.marketplace] ?? 0) + Number(m.revenue);
  }
  for (const nf of nfs) {
    totalVendasMes += Number(nf.valorTotal);
    channels.amazon += Number(nf.valorTotal);
  }

  const channelTotal = Object.values(channels).reduce((s, v) => s + v, 0);
  const pct = (k: string) =>
    channelTotal > 0 ? ((channels[k] ?? 0) / channelTotal) * 100 : 0;
  const pagamentosReceber = schedules.reduce((s, p) => s + Number(p.valor), 0);

  await prisma.dashboardMetrics.upsert({
    where: { tenantId },
    create: {
      tenantId,
      totalVendasMes,
      pagamentosReceber,
      mercadoLivrePct: pct('mercado_livre'),
      amazonPct: pct('amazon'),
      shopeePct: pct('shopee'),
    },
    update: {
      totalVendasMes,
      pagamentosReceber,
      mercadoLivrePct: pct('mercado_livre'),
      amazonPct: pct('amazon'),
      shopeePct: pct('shopee'),
      calculatedAt: new Date(),
    },
  });
}

async function main() {
  const tenantId = await resolvePilotTenantId();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });

  let productsCreated = 0;
  for (const p of PILOT_PRODUCTS) {
    await prisma.product.upsert({
      where: { tenantId_sku: { tenantId, sku: p.sku } },
      create: { tenantId, ...p },
      update: { name: p.name, category: p.category, marketplace: p.marketplace, active: true },
    });
    productsCreated++;
  }

  const insightExists = await prisma.insightNote.findFirst({
    where: { tenantId, title: 'Posição estável na Amazon', visibleToClient: true },
  });
  if (!insightExists) {
    const product = await prisma.product.findFirst({
      where: { tenantId, sku: 'PET-NP-001' },
    });
    await prisma.insightNote.create({
      data: {
        tenantId,
        productId: product?.id,
        title: 'Posição estável na Amazon',
        body: 'SKU PET-NP-001 mantém top 10 na busca principal. Manter estoque e monitorar sazonalidade.',
        visibleToClient: true,
        weekOf: new Date(),
      },
    });
  }

  await recalcDashboard(tenantId);

  console.log(`✅ Pilot seed: ${tenant.name} (${tenantId})`);
  console.log(`   ${productsCreated} SKUs garantidos: ${PILOT_PRODUCTS.map((p) => p.sku).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
