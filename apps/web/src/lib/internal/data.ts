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
      return mapMetric(row);
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
        include: { _count: { select: { items: true } } },
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
      }));
    },

    async create(data: Omit<NfRecord, 'id' | 'uploadedAt'>): Promise<NfRecord> {
      if (!hasDatabase()) return internalStore.nfs.create(data);
      throw new Error(
        'Criação de NF via admin requer integração completa — use fallback em memória ou API Nest',
      );
    },
  },

  async overview() {
    if (!hasDatabase()) return internalStore.overview();

    const start = new Date(weekStart());
    const [tenants, metricsThisWeek, lowGiroCount, pendingNfs, clientInsights] =
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
      ]);

    const segments: TenantSegment[] = ['PET', 'SAUDE', 'PAPEL', 'PARAFUSO'];

    return {
      activeTenants: tenants.filter((t) => t.status === 'active').length,
      totalTenants: tenants.length,
      metricsThisWeek,
      lowGiroCount,
      pendingNfs,
      clientInsights,
      segments: segments.map((segment) => ({
        segment,
        count: tenants.filter((t) => t.segment === segment).length,
      })),
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
};
