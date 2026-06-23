import { internalStore } from '@/lib/internal/store';
import {
  MARKETPLACE_LABELS,
  SCENARIO_LABELS,
  SEGMENT_LABELS,
  type Marketplace,
} from '@/types/internal';
import { CLIENT_DEMO_TENANT_ID, F5_CONTACT } from './constants';

const DEMO_DISPLAY_NAME = 'Indústria Piloto';

function monthStart(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Vendas e canais — agrega métricas + NF-e do tenant demo. */
export function getClientOverview() {
  const tenant = internalStore.tenants.get(CLIENT_DEMO_TENANT_ID);
  const metrics = internalStore.metrics.list(CLIENT_DEMO_TENANT_ID);
  const nfs = internalStore.nfs.list(CLIENT_DEMO_TENANT_ID);

  const monthRevenueFromMetrics = metrics.reduce((s, m) => s + m.revenue, 0);
  const monthRevenueFromNfs = nfs.reduce((s, n) => s + n.valorTotal, 0);
  const monthSales = monthRevenueFromMetrics + monthRevenueFromNfs + 28450.75;

  const previousMonthSales = 24890.2;
  const variationPct =
    previousMonthSales > 0
      ? (monthSales - previousMonthSales) / previousMonthSales
      : 0;

  const channelBase: Record<Marketplace, number> = {
    mercado_livre: 11240,
    amazon: 18620.5,
    shopee: 3240,
    tiktok: 890,
    outros: 460.25,
  };

  for (const m of metrics) {
    channelBase[m.marketplace] = (channelBase[m.marketplace] ?? 0) + m.revenue;
  }

  const channelTotal = Object.values(channelBase).reduce((s, v) => s + v, 0);
  const channelDistribution = (
    Object.entries(channelBase) as [Marketplace, number][]
  )
    .filter(([, v]) => v > 0)
    .map(([channel, amount]) => ({
      channel,
      label: MARKETPLACE_LABELS[channel],
      amount,
      share: channelTotal > 0 ? amount / channelTotal : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const paymentsReceivable = [
    {
      id: 'pay_1',
      marketplace: 'mercado_livre' as Marketplace,
      label: 'Mercado Livre — ciclo D+15',
      amount: 6840.3,
      expectedDate: addDays(new Date(), 6).toISOString(),
      settlementDays: 15,
    },
    {
      id: 'pay_2',
      marketplace: 'amazon' as Marketplace,
      label: 'Amazon — ciclo D+60',
      amount: 12450,
      expectedDate: addDays(new Date(), 22).toISOString(),
      settlementDays: 60,
    },
    {
      id: 'pay_3',
      marketplace: 'shopee' as Marketplace,
      label: 'Shopee — ciclo D+15',
      amount: 1890.45,
      expectedDate: addDays(new Date(), 11).toISOString(),
      settlementDays: 15,
    },
  ];

  const totalReceivable = paymentsReceivable.reduce((s, p) => s + p.amount, 0);

  return {
    tenant: {
      id: CLIENT_DEMO_TENANT_ID,
      displayName: DEMO_DISPLAY_NAME,
      legalName: tenant?.name ?? DEMO_DISPLAY_NAME,
      segment: tenant?.segment ?? 'PET',
      segmentLabel: SEGMENT_LABELS[tenant?.segment ?? 'PET'],
      scenario: tenant?.scenario ?? 'AMAZON_1P',
      scenarioLabel: SCENARIO_LABELS[tenant?.scenario ?? 'AMAZON_1P'],
    },
    period: {
      month: monthStart().toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      referenceDate: new Date().toISOString(),
    },
    monthSales,
    previousMonthSales,
    variationPct,
    totalReceivable,
    paymentsReceivable,
    channelDistribution,
    updatedAt: new Date().toISOString(),
  };
}

/** Performance por SKU com giro calculado. */
export function getClientProducts() {
  const products = internalStore.products.list(CLIENT_DEMO_TENANT_ID);
  const metrics = internalStore.metrics.list(CLIENT_DEMO_TENANT_ID);

  const demoSkus = [
    {
      sku: 'PET-RA-001',
      name: 'Ração premium aves 1kg',
      marketplace: 'amazon' as Marketplace,
      revenue: 8316,
      unitsSold: 42,
      visits: 890,
      conversionRate: 0.047,
      turnover: 1.12,
      trend: 'up' as const,
    },
    {
      sku: 'PET-SN-002',
      name: 'Snack natural pet 500g',
      marketplace: 'mercado_livre' as Marketplace,
      revenue: 5280,
      unitsSold: 88,
      visits: 1240,
      conversionRate: 0.071,
      turnover: 1.45,
      trend: 'up' as const,
    },
    {
      sku: 'PET-SU-003',
      name: 'Suplemento vitamínico aves 250g',
      marketplace: 'mercado_livre' as Marketplace,
      revenue: 3120,
      unitsSold: 52,
      visits: 680,
      conversionRate: 0.076,
      turnover: 0.98,
      trend: 'stable' as const,
    },
    {
      sku: 'PET-AC-004',
      name: 'Acessório comedouro automático',
      marketplace: 'amazon' as Marketplace,
      revenue: 1890,
      unitsSold: 15,
      visits: 420,
      conversionRate: 0.036,
      turnover: 0.62,
      trend: 'down' as const,
    },
    {
      sku: 'PET-KT-005',
      name: 'Kit iniciante aves exóticas',
      marketplace: 'shopee' as Marketplace,
      revenue: 984.75,
      unitsSold: 21,
      visits: 310,
      conversionRate: 0.068,
      turnover: 0.88,
      trend: 'stable' as const,
    },
  ];

  const fromStore = products.map((p) => {
    const m = metrics.find((x) => x.productId === p.id);
    const visits = m?.visits ?? 0;
    const units = m?.unitsSold ?? 0;
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      marketplace: p.marketplace,
      marketplaceLabel: MARKETPLACE_LABELS[p.marketplace],
      revenue: m?.revenue ?? 0,
      unitsSold: units,
      visits,
      conversionRate: m?.conversionRate ?? (visits > 0 ? units / visits : 0),
      turnover: units > 0 ? units / 30 : 0,
      trend: 'stable' as const,
    };
  });

  const merged = demoSkus.map((d, i) => {
    const stored = fromStore.find((s) => s.sku === d.sku);
    return {
      id: stored?.id ?? `demo_${i}`,
      sku: d.sku,
      name: d.name,
      marketplace: d.marketplace,
      marketplaceLabel: MARKETPLACE_LABELS[d.marketplace],
      revenue: d.revenue,
      unitsSold: d.unitsSold,
      visits: d.visits,
      conversionRate: d.conversionRate,
      turnover: d.turnover,
      trend: d.trend,
    };
  });

  const extraFromStore = fromStore.filter(
    (s) => !demoSkus.some((d) => d.sku === s.sku),
  );

  const items = [...merged, ...extraFromStore].sort(
    (a, b) => b.revenue - a.revenue,
  );

  const totals = {
    revenue: items.reduce((s, i) => s + i.revenue, 0),
    units: items.reduce((s, i) => s + i.unitsSold, 0),
    avgConversion:
      items.length > 0
        ? items.reduce((s, i) => s + i.conversionRate, 0) / items.length
        : 0,
  };

  return {
    tenantName: DEMO_DISPLAY_NAME,
    items,
    totals,
    updatedAt: new Date().toISOString(),
  };
}

/** NF-e e calendário de recebimentos D+15 / D+60. */
export function getClientFinance() {
  const nfs = internalStore.nfs.list(CLIENT_DEMO_TENANT_ID);
  const today = new Date();

  const demoNfs = [
    {
      id: 'nf_demo_1',
      nfNumber: '000142',
      nfSeries: '1',
      nfDate: addDays(today, -2).toISOString(),
      valorTotal: 4280.5,
      itemsCount: 3,
      status: 'processed' as const,
      marketplace: 'mercado_livre' as Marketplace,
    },
    {
      id: 'nf_demo_2',
      nfNumber: '000141',
      nfSeries: '1',
      nfDate: addDays(today, -8).toISOString(),
      valorTotal: 6120,
      itemsCount: 5,
      status: 'processed' as const,
      marketplace: 'amazon' as Marketplace,
    },
    {
      id: 'nf_demo_3',
      nfNumber: '000140',
      nfSeries: '1',
      nfDate: addDays(today, -14).toISOString(),
      valorTotal: 2890.75,
      itemsCount: 2,
      status: 'processed' as const,
      marketplace: 'mercado_livre' as Marketplace,
    },
    {
      id: 'nf_demo_4',
      nfNumber: '000139',
      nfSeries: '1',
      nfDate: addDays(today, -21).toISOString(),
      valorTotal: 8450,
      itemsCount: 8,
      status: 'processed' as const,
      marketplace: 'amazon' as Marketplace,
    },
    {
      id: 'nf_demo_5',
      nfNumber: '000138',
      nfSeries: '1',
      nfDate: addDays(today, -3).toISOString(),
      valorTotal: 1560,
      itemsCount: 1,
      status: 'pending' as const,
      marketplace: 'shopee' as Marketplace,
    },
  ];

  const storedNfs = nfs.map((n) => ({
    ...n,
    marketplace: 'mercado_livre' as Marketplace,
  }));

  const allNfs = [
    ...storedNfs,
    ...demoNfs.filter((d) => !storedNfs.some((s) => s.nfNumber === d.nfNumber)),
  ].sort((a, b) => new Date(b.nfDate).getTime() - new Date(a.nfDate).getTime());

  const calendarEvents = [
    {
      id: 'cal_1',
      date: addDays(today, 6).toISOString(),
      amount: 6840.3,
      label: 'Recebimento Mercado Livre',
      settlementDays: 15,
      marketplace: 'mercado_livre' as Marketplace,
    },
    {
      id: 'cal_2',
      date: addDays(today, 11).toISOString(),
      amount: 1890.45,
      label: 'Recebimento Shopee',
      settlementDays: 15,
      marketplace: 'shopee' as Marketplace,
    },
    {
      id: 'cal_3',
      date: addDays(today, 22).toISOString(),
      amount: 12450,
      label: 'Recebimento Amazon',
      settlementDays: 60,
      marketplace: 'amazon' as Marketplace,
    },
    {
      id: 'cal_4',
      date: addDays(today, 38).toISOString(),
      amount: 9320,
      label: 'Recebimento Amazon',
      settlementDays: 60,
      marketplace: 'amazon' as Marketplace,
    },
  ];

  const monthTotal = allNfs
    .filter((n) => {
      const d = new Date(n.nfDate);
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    })
    .reduce((s, n) => s + n.valorTotal, 0);

  return {
    tenantName: DEMO_DISPLAY_NAME,
    nfs: allNfs.map((n) => ({
      ...n,
      marketplaceLabel: MARKETPLACE_LABELS[n.marketplace],
    })),
    calendarEvents: calendarEvents.map((e) => ({
      ...e,
      marketplaceLabel: MARKETPLACE_LABELS[e.marketplace],
    })),
    summary: {
      monthNfTotal: monthTotal,
      pendingCount: allNfs.filter((n) => n.status === 'pending').length,
      nextReceivable: calendarEvents[0] ?? null,
      totalScheduled: calendarEvents.reduce((s, e) => s + e.amount, 0),
    },
    calendarMeta: {
      year: today.getFullYear(),
      month: today.getMonth(),
      daysInMonth: daysInMonth(today),
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Dados da empresa e contato F5. */
export function getClientProfile() {
  const tenant = internalStore.tenants.get(CLIENT_DEMO_TENANT_ID);

  return {
    company: {
      displayName: DEMO_DISPLAY_NAME,
      legalName: tenant?.name ?? 'Indústria Pet — Piloto A',
      cnpj: '12.345.678/0001-90',
      segment: tenant?.segment ?? 'PET',
      segmentLabel: SEGMENT_LABELS[tenant?.segment ?? 'PET'],
      scenario: tenant?.scenario ?? 'AMAZON_1P',
      scenarioLabel: SCENARIO_LABELS[tenant?.scenario ?? 'AMAZON_1P'],
      status: tenant?.status ?? 'active',
      statusLabel:
        tenant?.status === 'active'
          ? 'Operação ativa'
          : tenant?.status === 'trial'
            ? 'Período piloto'
            : 'Inativo',
      marketplaces: ['amazon', 'mercado_livre', 'shopee'] as Marketplace[],
      marketplacesLabels: ['Amazon', 'Mercado Livre', 'Shopee'],
      since: 'Jun/2026',
    },
    contact: F5_CONTACT,
    updatedAt: new Date().toISOString(),
  };
}
