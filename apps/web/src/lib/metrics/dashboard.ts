import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

function monthStart(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthEnd(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function channelKey(raw: string | null | undefined): string {
  const key = (raw ?? 'outros').toLowerCase();
  if (key.includes('mercado') || key === 'mercado_livre') return 'mercado_livre';
  if (key.includes('amazon')) return 'amazon';
  if (key.includes('shopee')) return 'shopee';
  if (key.includes('tiktok')) return 'tiktok';
  return 'outros';
}

/** Recalcula KPIs mensais — receita e canais só de NF-e; recebimentos de PaymentSchedule. */
export async function updateDashboardMetrics(
  tenantId: string,
  db: DbClient = prisma,
) {
  const start = monthStart();
  const end = monthEnd();

  const [nfs, schedules] = await Promise.all([
    db.notaFiscal.findMany({
      where: { tenantId, nfDate: { gte: start, lte: end } },
      include: { items: true },
    }),
    db.paymentSchedule.findMany({
      where: { tenantId, status: 'pending' },
    }),
  ]);

  const channelTotals: Record<string, number> = {
    mercado_livre: 0,
    amazon: 0,
    shopee: 0,
    tiktok: 0,
    outros: 0,
  };

  let totalVendasMes = 0;

  for (const nf of nfs) {
    if (nf.items.length > 0) {
      for (const item of nf.items) {
        const val = Number(item.valorTotal);
        totalVendasMes += val;
        const ch = channelKey(item.marketplace);
        channelTotals[ch] = (channelTotals[ch] ?? 0) + val;
      }
    } else {
      const val = Number(nf.valorTotal);
      totalVendasMes += val;
      channelTotals.outros += val;
    }
  }

  const channelTotal = Object.values(channelTotals).reduce((s, v) => s + v, 0);
  const pct = (key: string) =>
    channelTotal > 0 ? ((channelTotals[key] ?? 0) / channelTotal) * 100 : 0;

  const pagamentosReceber = schedules.reduce(
    (s, p) => s + Number(p.valor),
    0,
  );

  await db.dashboardMetrics.upsert({
    where: { tenantId },
    create: {
      tenantId,
      totalVendasMes,
      pagamentosReceber,
      mercadoLivrePct: pct('mercado_livre'),
      amazonPct: pct('amazon'),
      shopeePct: pct('shopee'),
      calculatedAt: new Date(),
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
