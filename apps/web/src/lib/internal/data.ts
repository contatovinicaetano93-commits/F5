import type {
  InsightNote,
  InternalProduct,
  InternalTenant,
  Marketplace,
  NfRecord,
  ProductMetric,
  TenantSegment,
} from '@/types/internal';
import { hasDatabase, prisma } from '@/lib/prisma';
import { internalStore } from '@/lib/internal/store';
import { getSystemOperatorId } from '@/lib/nf/system-user';
import {
  parseNfXml,
  type ParsedNF,
} from '@/lib/nf/parser';
import {
  requireMarketplace,
  resolveNfItemMarketplaces,
} from '@/lib/nf/marketplace';
import { detectMarketplaceFromXml } from '@/lib/nf/parser';
import { addDays, getSettlementDays } from '@/lib/client/settlement';
import { updateDashboardMetrics } from '@/lib/metrics/dashboard';
import type { Prisma } from '@prisma/client';
import type {
  InsightNote as PrismaInsight,
  Marketplace as PrismaMarketplace,
  OperatingScenario,
  Product as PrismaProduct,
  ProductMetric as PrismaMetric,
  Tenant as PrismaTenant,
  TenantSegment as PrismaSegment,
} from '@prisma/client';

function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function mapTenant(t: PrismaTenant): InternalTenant {
  return {
    id: t.id,
    name: t.name,
    cnpj: t.cnpj ?? undefined,
    segment: t.segment as TenantSegment,
    scenario: t.scenario,
    status: t.status as InternalTenant['status'],
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

function mapProduct(p: PrismaProduct): InternalProduct {
  return {
    id: p.id,
    tenantId: p.tenantId,
    sku: p.sku,
    name: p.name,
    description: p.description ?? undefined,
    category: p.category ?? undefined,
    marketplace: p.marketplace as Marketplace,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function mapMetric(m: PrismaMetric): ProductMetric {
  return {
    id: m.id,
    tenantId: m.tenantId,
    productId: m.productId,
    marketplace: m.marketplace as Marketplace,
    periodStart: m.periodStart.toISOString(),
    periodEnd: m.periodEnd.toISOString(),
    impressions: m.impressions,
    visits: m.visits,
    unitsSold: m.unitsSold,
    revenue: Number(m.revenue),
    searchPosition: m.searchPosition ?? undefined,
    conversionRate:
      m.conversionRate !== null ? Number(m.conversionRate) : undefined,
    notes: m.notes ?? undefined,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

function mapInsight(i: PrismaInsight): InsightNote {
  return {
    id: i.id,
    tenantId: i.tenantId,
    productId: i.productId ?? undefined,
    title: i.title,
    body: i.body,
    visibleToClient: i.visibleToClient,
    weekOf: i.weekOf?.toISOString(),
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  };
}

type DbClient = Prisma.TransactionClient | typeof prisma;

async function createPaymentSchedulesFromNf(
  tenantId: string,
  parsed: ParsedNF,
  items: { marketplace: string | null; valorTotal: number }[],
  db: DbClient = prisma,
) {
  const totals = new Map<string, number>();

  for (const item of items) {
    const marketplace = item.marketplace ?? 'outros';
    totals.set(marketplace, (totals.get(marketplace) ?? 0) + item.valorTotal);
  }

  if (totals.size === 0) {
    totals.set('outros', parsed.valorTotal);
  }

  await Promise.all(
    [...totals.entries()].map(([marketplace, valor]) =>
      db.paymentSchedule.create({
        data: {
          tenantId,
          marketplace,
          dataRecebimento: addDays(parsed.nfDate, getSettlementDays(marketplace)),
          valor,
          status: 'pending',
        },
      }),
    ),
  );
}

const PILOT_READINESS_NAME = 'PET Piloto Nutri';

async function computePilotReadiness() {
  if (!hasDatabase()) {
    return { ready: false, checks: [] as { label: string; ok: boolean }[] };
  }

  const tenant = await prisma.tenant.findFirst({
    where: { name: PILOT_READINESS_NAME },
  });
  if (!tenant) {
    return {
      ready: false,
      tenantName: PILOT_READINESS_NAME,
      checks: [{ label: 'Tenant piloto', ok: false }],
    };
  }

  const [skus, nfs, insights, viewers] = await Promise.all([
    prisma.product.count({ where: { tenantId: tenant.id } }),
    prisma.notaFiscal.count({ where: { tenantId: tenant.id } }),
    prisma.insightNote.count({
      where: { tenantId: tenant.id, visibleToClient: true },
    }),
    prisma.user.count({
      where: { tenantId: tenant.id, role: 'client_viewer' },
    }),
  ]);

  const checks = [
    { label: 'SKUs ≥ 4', ok: skus >= 4 },
    { label: 'NF-e ≥ 1', ok: nfs >= 1 },
    { label: 'Insight publicado', ok: insights >= 1 },
    { label: 'Viewer portal', ok: viewers >= 1 },
  ];

  return {
    ready: checks.every((c) => c.ok),
    tenantName: tenant.name,
    tenantId: tenant.id,
    checks,
  };
}

export const internalData = {
  tenants: {
    async list(segment?: TenantSegment): Promise<InternalTenant[]> {
      if (!hasDatabase()) {
        return internalStore.tenants.list(segment);
      }
      const rows = await prisma.tenant.findMany({
        where: segment ? { segment: segment as PrismaSegment } : undefined,
        orderBy: { name: 'asc' },
      });
      return rows.map(mapTenant);
    },

    async get(id: string): Promise<InternalTenant | null> {
      if (!hasDatabase()) return internalStore.tenants.get(id);
      const row = await prisma.tenant.findUnique({ where: { id } });
      return row ? mapTenant(row) : null;
    },

    async create(
      data: Omit<InternalTenant, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<InternalTenant> {
      if (!hasDatabase()) return internalStore.tenants.create(data);
      const row = await prisma.tenant.create({
        data: {
          name: data.name,
          cnpj: data.cnpj,
          segment: data.segment as PrismaSegment,
          scenario: data.scenario as OperatingScenario,
          status: data.status,
        },
      });
      return mapTenant(row);
    },

    async update(
      id: string,
      data: Partial<InternalTenant>,
    ): Promise<InternalTenant | null> {
      if (!hasDatabase()) return internalStore.tenants.update(id, data);
      try {
        const row = await prisma.tenant.update({
          where: { id },
          data: {
            name: data.name,
            cnpj: data.cnpj,
            segment: data.segment as PrismaSegment | undefined,
            scenario: data.scenario as OperatingScenario | undefined,
            status: data.status,
          },
        });
        return mapTenant(row);
      } catch {
        return null;
      }
    },
  },

  products: {
    async list(tenantId?: string): Promise<InternalProduct[]> {
      if (!hasDatabase()) return internalStore.products.list(tenantId);
      const rows = await prisma.product.findMany({
        where: tenantId ? { tenantId } : undefined,
        orderBy: { name: 'asc' },
      });
      return rows.map(mapProduct);
    },

    async create(
      data: Omit<InternalProduct, 'id' | 'createdAt' | 'updatedAt' | 'active'>,
    ): Promise<InternalProduct> {
      if (!hasDatabase()) {
        return internalStore.products.create({ ...data, active: true });
      }
      const row = await prisma.product.create({
        data: {
          tenantId: data.tenantId,
          sku: data.sku,
          name: data.name,
          description: data.description,
          category: data.category,
          marketplace: data.marketplace as PrismaMarketplace,
        },
      });
      return mapProduct(row);
    },

    async update(
      id: string,
      data: Partial<Pick<InternalProduct, 'name' | 'description' | 'category' | 'marketplace' | 'active'>>,
    ): Promise<InternalProduct | null> {
      if (!hasDatabase()) return internalStore.products.update(id, data);
      try {
        const row = await prisma.product.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            category: data.category,
            marketplace: data.marketplace as PrismaMarketplace | undefined,
            active: data.active,
          },
        });
        return mapProduct(row);
      } catch {
        return null;
      }
    },

    async importFromCsv(
      tenantId: string,
      rows: {
        sku: string;
        name: string;
        category?: string;
        marketplace: Marketplace;
      }[],
    ): Promise<{ created: number; updated: number; errors: string[] }> {
      const errors: string[] = [];
      let created = 0;
      let updated = 0;

      if (!hasDatabase()) {
        for (const row of rows) {
          const existing = internalStore.products
            .list(tenantId)
            .find((p) => p.sku.toUpperCase() === row.sku.toUpperCase());
          if (existing) {
            internalStore.products.update(existing.id, {
              name: row.name,
              category: row.category,
              marketplace: row.marketplace,
              active: true,
            });
            updated++;
          } else {
            internalStore.products.create({
              tenantId,
              sku: row.sku,
              name: row.name,
              category: row.category,
              marketplace: row.marketplace,
              active: true,
            });
            created++;
          }
        }
        return { created, updated, errors };
      }

      const existing = await prisma.product.findMany({
        where: { tenantId },
        select: { id: true, sku: true },
      });
      const skuMap = new Map(existing.map((p) => [p.sku.toUpperCase(), p.id]));

      for (const row of rows) {
        const existingId = skuMap.get(row.sku.toUpperCase());
        try {
          if (existingId) {
            await prisma.product.update({
              where: { id: existingId },
              data: {
                name: row.name,
                category: row.category,
                marketplace: row.marketplace as PrismaMarketplace,
                active: true,
              },
            });
            updated++;
          } else {
            await prisma.product.create({
              data: {
                tenantId,
                sku: row.sku,
                name: row.name,
                category: row.category,
                marketplace: row.marketplace as PrismaMarketplace,
              },
            });
            created++;
          }
        } catch {
          errors.push(`Falha ao importar SKU ${row.sku}`);
        }
      }

      return { created, updated, errors };
    },
  },

  metrics: {
    async list(tenantId?: string, productId?: string): Promise<ProductMetric[]> {
      if (!hasDatabase()) {
        return internalStore.metrics.list(tenantId, productId);
      }
      const rows = await prisma.productMetric.findMany({
        where: {
          ...(tenantId ? { tenantId } : {}),
          ...(productId ? { productId } : {}),
        },
        orderBy: { periodStart: 'desc' },
      });
      return rows.map(mapMetric);
    },

    async create(
      data: Omit<ProductMetric, 'id' | 'createdAt' | 'updatedAt' | 'conversionRate'> & {
        conversionRate?: number;
      },
    ): Promise<ProductMetric> {
      if (!hasDatabase()) return internalStore.metrics.create(data);
      const conversionRate =
        data.conversionRate ??
        (data.visits > 0 ? data.unitsSold / data.visits : undefined);
      const row = await prisma.productMetric.create({
        data: {
          tenantId: data.tenantId,
          productId: data.productId,
          marketplace: data.marketplace as PrismaMarketplace,
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          impressions: data.impressions,
          visits: data.visits,
          unitsSold: data.unitsSold,
          revenue: data.revenue,
          searchPosition: data.searchPosition,
          conversionRate,
          notes: data.notes,
        },
      });
      await updateDashboardMetrics(data.tenantId);
      return mapMetric(row);
    },

    async importFromCsv(
      tenantId: string,
      rows: {
        sku: string;
        marketplace: Marketplace;
        impressions: number;
        visits: number;
        unitsSold: number;
        revenue: number;
        searchPosition?: number;
        notes?: string;
      }[],
    ): Promise<{ created: number; errors: string[] }> {
      const periodStart = new Date(weekStart());
      const periodEnd = new Date();
      const errors: string[] = [];
      let created = 0;

      if (!hasDatabase()) {
        for (const row of rows) {
          const product = internalStore.products
            .list(tenantId)
            .find((p) => p.sku.toUpperCase() === row.sku.toUpperCase());
          if (!product) {
            errors.push(`SKU não encontrado: ${row.sku}`);
            continue;
          }
          internalStore.metrics.create({
            tenantId,
            productId: product.id,
            marketplace: row.marketplace,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            impressions: row.impressions,
            visits: row.visits,
            unitsSold: row.unitsSold,
            revenue: row.revenue,
            searchPosition: row.searchPosition,
            notes: row.notes,
          });
          created++;
        }
        return { created, errors };
      }

      const products = await prisma.product.findMany({
        where: { tenantId },
        select: { id: true, sku: true, marketplace: true },
      });
      const skuMap = new Map(
        products.map((p) => [p.sku.toUpperCase(), p]),
      );

      for (const row of rows) {
        const product = skuMap.get(row.sku.toUpperCase());
        if (!product) {
          errors.push(`SKU não encontrado: ${row.sku}`);
          continue;
        }

        const conversionRate =
          row.visits > 0 ? row.unitsSold / row.visits : undefined;

        await prisma.productMetric.create({
          data: {
            tenantId,
            productId: product.id,
            marketplace: (row.marketplace ?? product.marketplace) as PrismaMarketplace,
            periodStart,
            periodEnd,
            impressions: row.impressions,
            visits: row.visits,
            unitsSold: row.unitsSold,
            revenue: row.revenue,
            searchPosition: row.searchPosition,
            conversionRate,
            notes: row.notes,
          },
        });
        created++;
      }

      if (created > 0) {
        await updateDashboardMetrics(tenantId);
      }

      return { created, errors };
    },
  },

  insights: {
    async list(tenantId?: string): Promise<InsightNote[]> {
      if (!hasDatabase()) return internalStore.insights.list(tenantId);
      const rows = await prisma.insightNote.findMany({
        where: tenantId ? { tenantId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapInsight);
    },

    async create(
      data: Omit<InsightNote, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<InsightNote> {
      if (!hasDatabase()) return internalStore.insights.create(data);
      const row = await prisma.insightNote.create({
        data: {
          tenantId: data.tenantId,
          productId: data.productId,
          title: data.title,
          body: data.body,
          visibleToClient: data.visibleToClient,
          weekOf: data.weekOf ? new Date(data.weekOf) : undefined,
        },
      });
      return mapInsight(row);
    },

    async update(
      id: string,
      data: Partial<InsightNote>,
    ): Promise<InsightNote | null> {
      if (!hasDatabase()) return internalStore.insights.update(id, data);
      try {
        const row = await prisma.insightNote.update({
          where: { id },
          data: {
            title: data.title,
            body: data.body,
            visibleToClient: data.visibleToClient,
            productId: data.productId,
            weekOf: data.weekOf ? new Date(data.weekOf) : undefined,
          },
        });
        return mapInsight(row);
      } catch {
        return null;
      }
    },
  },

  nfs: {
    async list(tenantId?: string): Promise<NfRecord[]> {
      if (!hasDatabase()) return internalStore.nfs.list(tenantId);
      const rows = await prisma.notaFiscal.findMany({
        where: tenantId ? { tenantId } : undefined,
        include: {
          _count: { select: { items: true } },
          items: { take: 1, select: { marketplace: true } },
        },
        orderBy: { nfDate: 'desc' },
      });
      return rows.map((nf) => ({
        id: nf.id,
        tenantId: nf.tenantId ?? '',
        nfNumber: nf.nfNumber,
        nfSeries: nf.nfSeries,
        nfDate: nf.nfDate.toISOString(),
        valorTotal: Number(nf.valorTotal),
        itemsCount: nf._count.items,
        status: nf.processedAt ? 'processed' : 'pending',
        uploadedAt: nf.uploadedAt.toISOString(),
        marketplace: (nf.items[0]?.marketplace as Marketplace | undefined) ?? undefined,
      }));
    },

    async create(
      data: Omit<NfRecord, 'id' | 'uploadedAt'> & { marketplace?: Marketplace },
    ): Promise<NfRecord> {
      if (!hasDatabase()) return internalStore.nfs.create(data);

      const marketplace = requireMarketplace(data.marketplace);
      const userId = await getSystemOperatorId();
      const nfDate = new Date(data.nfDate);
      const quantidade = data.itemsCount || 1;
      const valorUnitario = data.valorTotal / quantidade;
      const parsedLike: ParsedNF = {
        nfNumber: data.nfNumber,
        nfSeries: data.nfSeries,
        nfDate,
        emitente: 'manual',
        destinatario: 'manual',
        valorTotal: data.valorTotal,
        valorBaseIcms: 0,
        valorIcms: 0,
        items: [
          {
            sku: 'MANUAL',
            descricao: 'Registro manual NF-e',
            quantidade,
            valorUnitario,
            valorTotal: data.valorTotal,
          },
        ],
      };

      const itemRows = [
        {
          sku: 'MANUAL',
          descricao: 'Registro manual NF-e',
          quantidade,
          valorUnitario,
          valorTotal: data.valorTotal,
          marketplace,
        },
      ];

      try {
        const row = await prisma.$transaction(async (tx) => {
          const created = await tx.notaFiscal.create({
            data: {
              userId,
              tenantId: data.tenantId,
              nfNumber: data.nfNumber,
              nfSeries: data.nfSeries,
              nfDate,
              emitente: 'manual',
              destinatario: 'manual',
              valorTotal: data.valorTotal,
              valorBaseIcms: 0,
              valorIcms: 0,
              xmlContent: '<manual/>',
              processedAt: new Date(),
              items: { create: itemRows },
            },
            include: {
              _count: { select: { items: true } },
              items: { take: 1, select: { marketplace: true } },
            },
          });

          await createPaymentSchedulesFromNf(
            data.tenantId,
            parsedLike,
            itemRows,
            tx,
          );
          await updateDashboardMetrics(data.tenantId, tx);

          return created;
        });

        return {
          id: row.id,
          tenantId: row.tenantId ?? '',
          nfNumber: row.nfNumber,
          nfSeries: row.nfSeries,
          nfDate: row.nfDate.toISOString(),
          valorTotal: Number(row.valorTotal),
          itemsCount: row._count.items,
          status: 'processed',
          uploadedAt: row.uploadedAt.toISOString(),
          marketplace: (row.items[0]?.marketplace as Marketplace | undefined) ?? marketplace,
        };
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === 'P2002') {
          throw new Error(
            'NF-e já registrada (mesmo número, série e emitente manual)',
          );
        }
        throw err;
      }
    },

    async createFromXml(
      tenantId: string,
      xmlContent: string,
      marketplaceOverride?: string | null,
    ): Promise<NfRecord> {
      if (!hasDatabase()) {
        const parsed = await parseNfXml(xmlContent);
        return internalStore.nfs.create({
          tenantId,
          nfNumber: parsed.nfNumber,
          nfSeries: parsed.nfSeries,
          nfDate: parsed.nfDate.toISOString(),
          valorTotal: parsed.valorTotal,
          itemsCount: parsed.items.length,
          status: 'processed',
        });
      }

      const parsed = await parseNfXml(xmlContent);
      const resolved = await resolveNfItemMarketplaces(
        tenantId,
        parsed.items,
        xmlContent,
        marketplaceOverride,
      );
      const userId = await getSystemOperatorId();

      let itemRows =
        resolved.length > 0
          ? resolved.map(({ item, marketplace }) => ({
              sku: item.sku,
              descricao: item.descricao,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              valorTotal: item.valorTotal,
              marketplace,
            }))
          : [];

      if (itemRows.length === 0) {
        const mp = requireMarketplace(
          marketplaceOverride ?? detectMarketplaceFromXml(xmlContent),
        );
        itemRows = [
          {
            sku: 'N/A',
            descricao: 'NF-e consolidada',
            quantidade: 1,
            valorUnitario: parsed.valorTotal,
            valorTotal: parsed.valorTotal,
            marketplace: mp,
          },
        ];
      }

      try {
        const row = await prisma.$transaction(async (tx) => {
          const created = await tx.notaFiscal.create({
            data: {
              userId,
              tenantId,
              nfNumber: parsed.nfNumber,
              nfSeries: parsed.nfSeries,
              nfDate: parsed.nfDate,
              emitente: parsed.emitente,
              destinatario: parsed.destinatario,
              valorTotal: parsed.valorTotal,
              valorBaseIcms: parsed.valorBaseIcms,
              valorIcms: parsed.valorIcms,
              xmlContent,
              processedAt: new Date(),
              items: { create: itemRows },
            },
            include: {
              _count: { select: { items: true } },
              items: { take: 1, select: { marketplace: true } },
            },
          });

          await createPaymentSchedulesFromNf(tenantId, parsed, itemRows, tx);
          await updateDashboardMetrics(tenantId, tx);

          return created;
        });

        return {
          id: row.id,
          tenantId: row.tenantId ?? '',
          nfNumber: row.nfNumber,
          nfSeries: row.nfSeries,
          nfDate: row.nfDate.toISOString(),
          valorTotal: Number(row.valorTotal),
          itemsCount: row._count.items,
          status: 'processed' as const,
          uploadedAt: row.uploadedAt.toISOString(),
          marketplace: (row.items[0]?.marketplace as Marketplace | undefined) ?? undefined,
        };
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === 'P2002') {
          throw new Error(
            'NF-e já processada (mesmo número, série e emitente)',
          );
        }
        throw err;
      }
    },
  },

  async overview() {
    if (!hasDatabase()) return internalStore.overview();

    const start = new Date(weekStart());
    const fourWeeksAgo = new Date(start);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const [tenants, metricsThisWeek, lowGiroCount, pendingNfs, clientInsights, recentInsights] =
      await Promise.all([
        prisma.tenant.findMany({ select: { segment: true, status: true } }),
        prisma.productMetric.count({
          where: { periodStart: { gte: start } },
        }),
        prisma.productMetric.count({
          where: {
            periodStart: { gte: start },
            conversionRate: { lt: 0.04 },
          },
        }),
        prisma.notaFiscal.count({ where: { processedAt: null } }),
        prisma.insightNote.count({ where: { visibleToClient: true } }),
        prisma.insightNote.count({ where: { visibleToClient: true, createdAt: { gte: fourWeeksAgo } } }),
      ]);

    const activeTenantCount = tenants.filter((t) => t.status === 'active').length;
    const expectedInsights = 4 * Math.max(activeTenantCount, 1);
    const insightOnTimePct = Math.round((recentInsights / expectedInsights) * 100);

    const segments: TenantSegment[] = ['PET', 'SAUDE', 'PAPEL', 'PARAFUSO'];

    return {
      activeTenants: activeTenantCount,
      totalTenants: tenants.length,
      metricsThisWeek,
      lowGiroCount,
      pendingNfs,
      clientInsights,
      insightOnTimePct,
      segments: segments.map((segment) => ({
        segment,
        count: tenants.filter((t) => t.segment === segment).length,
      })),
      pilotReadiness: await computePilotReadiness(),
    };
  },

  async getTenantDetail(id: string) {
    if (!hasDatabase()) {
      const tenant = internalStore.tenants.get(id);
      if (!tenant) return null;
      return {
        tenant,
        products: internalStore.products.list(id),
        metrics: internalStore.metrics.list(id),
        insights: internalStore.insights.list(id),
        nfs: internalStore.nfs.list(id),
      };
    }

    const tenant = await internalData.tenants.get(id);
    if (!tenant) return null;

    const [products, metrics, insights, nfs] = await Promise.all([
      internalData.products.list(id),
      internalData.metrics.list(id),
      internalData.insights.list(id),
      internalData.nfs.list(id),
    ]);

    return { tenant, products, metrics, insights, nfs };
  },

  payments: {
    async listPending(tenantId?: string) {
      if (!hasDatabase()) return [];

      const rows = await prisma.paymentSchedule.findMany({
        where: {
          status: 'pending',
          ...(tenantId ? { tenantId } : {}),
        },
        orderBy: { dataRecebimento: 'asc' },
        include: { tenant: { select: { name: true } } },
      });

      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        tenantName: row.tenant.name,
        marketplace: row.marketplace,
        dataRecebimento: row.dataRecebimento.toISOString(),
        valor: Number(row.valor),
        status: row.status as 'pending' | 'paid',
      }));
    },

    async markPaid(id: string) {
      if (!hasDatabase()) {
        throw new Error('Banco não configurado');
      }

      const row = await prisma.paymentSchedule.findUnique({ where: { id } });
      if (!row) throw new Error('Repasse não encontrado');
      if (row.status === 'paid') return { id, alreadyPaid: true };

      await prisma.paymentSchedule.update({
        where: { id },
        data: { status: 'paid' },
      });
      await updateDashboardMetrics(row.tenantId);

      return { id, tenantId: row.tenantId, alreadyPaid: false };
    },
  },
};
