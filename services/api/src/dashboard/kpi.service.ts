// services/api/src/dashboard/kpi.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardKPIs {
  gmv: {
    value: number;
    currency: string;
    period: string;
    trend: number; // % change from previous period
  };
  inventory: {
    totalUnits: number;
    reservedUnits: number;
    availableUnits: number;
    lowStockItems: number; // items with qty < 10
  };
  orders: {
    total: number;
    new: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    avgValue: number;
  };
  margin: {
    avgMarginPct: number;
    bestSku: string;
    worstSku: string;
    skusBelow15Pct: number; // Alert threshold
  };
}

/**
 * STEP 32: KPI Service para dashboard homepage
 * Calcula 4 métricas principais:
 * 1. GMV (Gross Merchandise Value)
 * 2. Estoque (Inventory)
 * 3. Pedidos (Orders)
 * 4. Margem (Margin)
 */
@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obter todos os KPIs para dashboard homepage
   */
  async getDashboardKPIs(
    tenantId: string,
    daysBack: number = 30
  ): Promise<DashboardKPIs> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Buscar dados em paralelo
    const [gmvData, inventoryData, ordersData, marginData] = await Promise.all([
      this.calculateGMV(tenantId, startDate),
      this.calculateInventory(tenantId),
      this.calculateOrders(tenantId, startDate),
      this.calculateMargin(tenantId, startDate),
    ]);

    return {
      gmv: gmvData,
      inventory: inventoryData,
      orders: ordersData,
      margin: marginData,
    };
  }

  /**
   * STEP 32.1: KPI - GMV (Gross Merchandise Value)
   */
  private async calculateGMV(
    tenantId: string,
    startDate: Date
  ): Promise<DashboardKPIs['gmv']> {
    // Current period
    const orders = await this.prisma.orders.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
    });

    const currentGMV = orders.reduce((sum, o) => sum + (o.total_value || 0), 0);

    // Previous period (para trend)
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const prevOrders = await this.prisma.orders.findMany({
      where: {
        tenant_id: tenantId,
        created_at: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
    });

    const prevGMV = prevOrders.reduce((sum, o) => sum + (o.total_value || 0), 0);
    const trend = prevGMV > 0 ? ((currentGMV - prevGMV) / prevGMV) * 100 : 0;

    return {
      value: currentGMV,
      currency: 'BRL',
      period: `Últimos ${Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} dias`,
      trend,
    };
  }

  /**
   * STEP 32.2: KPI - Inventory
   */
  private async calculateInventory(
    tenantId: string
  ): Promise<DashboardKPIs['inventory']> {
    // Buscar todas as variantes deste tenant
    const variants = await this.prisma.productVariants.findMany({
      where: {
        product: { tenant_id: tenantId },
      },
      include: {
        inventory: true,
      },
    });

    let totalUnits = 0;
    let reservedUnits = 0;
    let lowStockItems = 0;

    for (const variant of variants) {
      for (const inv of variant.inventory) {
        totalUnits += inv.quantity || 0;
        reservedUnits += inv.reserved || 0;

        if ((inv.quantity || 0) < 10) {
          lowStockItems++;
        }
      }
    }

    const availableUnits = totalUnits - reservedUnits;

    return {
      totalUnits,
      reservedUnits,
      availableUnits,
      lowStockItems,
    };
  }

  /**
   * STEP 32.3: KPI - Orders
   */
  private async calculateOrders(
    tenantId: string,
    startDate: Date
  ): Promise<DashboardKPIs['orders']> {
    const orders = await this.prisma.orders.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
    });

    const statusCounts = {
      new: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const order of orders) {
      const status = order.status as keyof typeof statusCounts;
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    }

    const totalValue = orders.reduce((sum, o) => sum + (o.total_value || 0), 0);
    const avgValue = orders.length > 0 ? totalValue / orders.length : 0;

    return {
      total: orders.length,
      new: statusCounts.new,
      processing: statusCounts.processing,
      shipped: statusCounts.shipped,
      delivered: statusCounts.delivered,
      cancelled: statusCounts.cancelled,
      avgValue,
    };
  }

  /**
   * STEP 32.4: KPI - Margin (baseado em MarginService)
   */
  private async calculateMargin(
    tenantId: string,
    startDate: Date
  ): Promise<DashboardKPIs['margin']> {
    const orders = await this.prisma.orders.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
      include: {
        items: {
          include: {
            product_variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Agrupar por SKU e calcular margens
    const skuMargins = new Map<string, {
      sku: string;
      marginPct: number;
      productName: string;
    }>();

    for (const order of orders) {
      for (const item of order.items) {
        const sku = item.product_variant.sku;

        if (!skuMargins.has(sku)) {
          const itemGmv = item.subtotal || (item.quantity * item.unit_price);
          const itemProportion = item.subtotal / (order.total_value || 1);
          const itemCommission = order.commission_marketplace * itemProportion;
          const itemShipping = (order.shipping_cost || 0) * itemProportion;

          const netRevenue = itemGmv - itemCommission - itemShipping;
          const marginPct = itemGmv > 0 ? (netRevenue / itemGmv) * 100 : 0;

          skuMargins.set(sku, {
            sku,
            marginPct,
            productName: item.product_variant.product.name,
          });
        }
      }
    }

    // Calcular agregadas
    let totalMarginPct = 0;
    let bestSku = '';
    let bestMargin = -Infinity;
    let worstSku = '';
    let worstMargin = Infinity;
    let skusBelow15Pct = 0;

    for (const data of skuMargins.values()) {
      totalMarginPct += data.marginPct;

      if (data.marginPct > bestMargin) {
        bestMargin = data.marginPct;
        bestSku = data.sku;
      }

      if (data.marginPct < worstMargin) {
        worstMargin = data.marginPct;
        worstSku = data.sku;
      }

      if (data.marginPct < 15) {
        skusBelow15Pct++;
      }
    }

    const avgMarginPct = skuMargins.size > 0 ? totalMarginPct / skuMargins.size : 0;

    return {
      avgMarginPct,
      bestSku: bestSku || 'N/A',
      worstSku: worstSku || 'N/A',
      skusBelow15Pct,
    };
  }

  /**
   * Comparativo período atual vs período anterior
   */
  async getKPIsComparison(
    tenantId: string,
    currentDays: number = 30,
    previousDays: number = 30
  ) {
    const currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - currentDays);

    const prevEndDate = new Date(currentStartDate);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - previousDays);

    const current = await this.getDashboardKPIs(tenantId, currentDays);

    // Calcular período anterior
    const prevOrders = await this.prisma.orders.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: prevStartDate, lt: prevEndDate },
      },
    });

    const prevGMV = prevOrders.reduce((sum, o) => sum + (o.total_value || 0), 0);

    return {
      current,
      comparison: {
        gmvChange: current.gmv.value - prevGMV,
        gmvChangePercent: prevGMV > 0 ? ((current.gmv.value - prevGMV) / prevGMV) * 100 : 0,
      },
    };
  }

  /**
   * Alertas baseados em KPIs
   */
  async getKPIAlerts(tenantId: string): Promise<{
    type: 'warning' | 'critical';
    metric: string;
    message: string;
    value: number;
  }[]> {
    const alerts = [];
    const kpis = await this.getDashboardKPIs(tenantId, 30);

    // Alert 1: GMV muito baixo
    if (kpis.gmv.value < 1000) {
      alerts.push({
        type: 'warning',
        metric: 'GMV',
        message: 'GMV abaixo de R$ 1.000',
        value: kpis.gmv.value,
      });
    }

    // Alert 2: Estoque baixo
    if (kpis.inventory.lowStockItems > 5) {
      alerts.push({
        type: 'warning',
        metric: 'Inventory',
        message: `${kpis.inventory.lowStockItems} produtos com estoque baixo`,
        value: kpis.inventory.lowStockItems,
      });
    }

    // Alert 3: Pedidos cancelados
    if (kpis.orders.cancelled > kpis.orders.total * 0.1) {
      alerts.push({
        type: 'critical',
        metric: 'Orders',
        message: `Taxa de cancelamento > 10% (${(kpis.orders.cancelled / kpis.orders.total * 100).toFixed(1)}%)`,
        value: kpis.orders.cancelled,
      });
    }

    // Alert 4: Margem baixa
    if (kpis.margin.avgMarginPct < 15) {
      alerts.push({
        type: 'critical',
        metric: 'Margin',
        message: `Margem média abaixo de 15% (${kpis.margin.avgMarginPct.toFixed(1)}%)`,
        value: kpis.margin.avgMarginPct,
      });
    }

    // Alert 5: Muitos SKUs com margem baixa
    if (kpis.margin.skusBelow15Pct > kpis.margin.skusBelow15Pct * 0.5) {
      alerts.push({
        type: 'warning',
        metric: 'Margin',
        message: `${kpis.margin.skusBelow15Pct} produtos com margem < 15%`,
        value: kpis.margin.skusBelow15Pct,
      });
    }

    return alerts;
  }
}
