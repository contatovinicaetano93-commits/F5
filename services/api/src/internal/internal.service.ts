import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Marketplace,
  OperatingScenario,
  TenantSegment,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InternalService {
  constructor(private readonly prisma: PrismaService) {}

  listTenants(segment?: TenantSegment) {
    return this.prisma.tenant.findMany({
      where: segment ? { segment } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  getTenant(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  createTenant(data: {
    name: string;
    cnpj?: string;
    segment: TenantSegment;
    scenario: OperatingScenario;
    status?: string;
  }) {
    return this.prisma.tenant.create({
      data: {
        name: data.name,
        cnpj: data.cnpj,
        segment: data.segment,
        scenario: data.scenario,
        status: data.status ?? 'trial',
      },
    });
  }

  updateTenant(
    id: string,
    data: Partial<{
      name: string;
      cnpj: string;
      segment: TenantSegment;
      scenario: OperatingScenario;
      status: string;
    }>,
  ) {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async getTenantDetail(id: string) {
    const tenant = await this.getTenant(id);
    if (!tenant) throw new NotFoundException('Cliente não encontrado');

    const [products, metrics, insights, notasFiscais] = await Promise.all([
      this.listProducts(id),
      this.listMetrics(id),
      this.listInsights(id),
      this.prisma.notaFiscal.findMany({
        where: { tenantId: id },
        include: { _count: { select: { items: true } } },
        orderBy: { nfDate: 'desc' },
      }),
    ]);

    const nfs = notasFiscais.map((nf) => ({
      id: nf.id,
      tenantId: nf.tenantId ?? id,
      nfNumber: nf.nfNumber,
      nfSeries: nf.nfSeries,
      nfDate: nf.nfDate.toISOString(),
      valorTotal: Number(nf.valorTotal),
      itemsCount: nf._count.items,
      status: nf.processedAt ? 'processed' : 'pending',
      uploadedAt: nf.uploadedAt.toISOString(),
    }));

    return { tenant, products, metrics, insights, nfs };
  }

  listProducts(tenantId?: string) {
    return this.prisma.product.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  createProduct(data: {
    tenantId: string;
    sku: string;
    name: string;
    description?: string;
    category?: string;
    marketplace: Marketplace;
  }) {
    return this.prisma.product.create({ data });
  }

  listMetrics(tenantId?: string, productId?: string) {
    return this.prisma.productMetric.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        ...(productId ? { productId } : {}),
      },
      orderBy: { periodStart: 'desc' },
    });
  }

  createMetric(data: {
    tenantId: string;
    productId: string;
    marketplace: Marketplace;
    periodStart: Date;
    periodEnd: Date;
    impressions: number;
    visits: number;
    unitsSold: number;
    revenue: number;
    searchPosition?: number;
    notes?: string;
    conversionRate?: number;
  }) {
    const conversionRate =
      data.conversionRate ??
      (data.visits > 0 ? data.unitsSold / data.visits : undefined);

    return this.prisma.productMetric.create({
      data: {
        tenantId: data.tenantId,
        productId: data.productId,
        marketplace: data.marketplace,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        impressions: data.impressions,
        visits: data.visits,
        unitsSold: data.unitsSold,
        revenue: data.revenue,
        searchPosition: data.searchPosition,
        conversionRate,
        notes: data.notes,
      },
    });
  }

  listInsights(tenantId?: string) {
    return this.prisma.insightNote.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  createInsight(data: {
    tenantId: string;
    productId?: string;
    title: string;
    body: string;
    visibleToClient: boolean;
    weekOf?: Date;
  }) {
    return this.prisma.insightNote.create({ data });
  }

  async updateInsight(
    id: string,
    data: Partial<{
      title: string;
      body: string;
      visibleToClient: boolean;
      weekOf: Date;
      productId: string;
    }>,
  ) {
    try {
      return await this.prisma.insightNote.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Insight não encontrado');
    }
  }

  async overview() {
    const weekStart = this.getWeekStart();

    const [
      tenants,
      metricsThisWeek,
      lowGiroCount,
      pendingNfs,
      clientInsights,
    ] = await Promise.all([
      this.prisma.tenant.findMany({ select: { segment: true, status: true } }),
      this.prisma.productMetric.count({
        where: { periodStart: { gte: weekStart } },
      }),
      this.prisma.productMetric.count({
        where: {
          periodStart: { gte: weekStart },
          conversionRate: { lt: 0.04 },
        },
      }),
      this.prisma.notaFiscal.count({ where: { processedAt: null } }),
      this.prisma.insightNote.count({ where: { visibleToClient: true } }),
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
  }

  private getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
