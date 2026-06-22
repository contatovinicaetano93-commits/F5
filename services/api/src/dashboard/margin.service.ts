// services/api/src/dashboard/margin.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MarginMetrics {
  sku: string;
  variantId: string;
  variantName: string;
  productName: string;

  // Revenue
  gmv: number;              // Gross Merchandise Value (total vendido)

  // Costs
  commission: number;       // Comissão do marketplace
  shipping: number;         // Custo de frete
  returns: number;          // Reembolsos (devoluções)
  ads: number;              // Custos de publicidade

  // Net
  netRevenue: number;       // GMV - (commission + shipping + returns + ads)
  marginPct: number;        // (netRevenue / GMV) * 100

  // Volume
  unitsSold: number;
  ordersCount: number;

  // Marketplaces breakdown
  marketplaces: {
    [key: string]: {
      gmv: number;
      units: number;
      marginPct: number;
    };
  };
}

/**
 * STEP 31: Painel de Margem Real por SKU (Priority KPI)
 * Calcula margem = GMV - comissão - frete - devoluções - ads
 * Quebrado por marketplace e período
 */
@Injectable()
export class MarginService {
  private readonly logger = new Logger(MarginService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcular margem real para um período (últimos 30 dias por padrão)
   */
  async calculateMarginMetrics(
    tenantId: string,
    daysBack: number = 30
  ): Promise<MarginMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Query: Buscar todos os pedidos no período
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

    // Agrupar por SKU
    const skuMap = new Map<string, {
      orders: any[];
      variant: any;
      product: any;
    }>();

    for (const order of orders) {
      for (const item of order.items) {
        const sku = item.product_variant.sku;
        if (!skuMap.has(sku)) {
          skuMap.set(sku, {
            orders: [],
            variant: item.product_variant,
            product: item.product_variant.product,
          });
        }
        skuMap.get(sku)!.orders.push({
          ...order,
          item,
        });
      }
    }

    // Calcular métricas por SKU
    const metrics: MarginMetrics[] = [];

    for (const [sku, data] of skuMap.entries()) {
      const margin = this.calculateSkuMargin(sku, data, tenantId);
      metrics.push(margin);
    }

    // Ordenar por marginPct DESC (melhores margens primeiro)
    metrics.sort((a, b) => b.marginPct - a.marginPct);

    return metrics;
  }

  /**
   * Calcular margem para um SKU específico
   */
  private calculateSkuMargin(
    sku: string,
    data: any,
    tenantId: string
  ): MarginMetrics {
    const { orders, variant, product } = data;

    let totalGmv = 0;
    let totalCommission = 0;
    let totalShipping = 0;
    let totalReturns = 0;
    let totalAds = 0;
    let totalUnits = 0;
    const marketplaceMap = new Map<string, {
      gmv: number;
      units: number;
    }>();

    // Processar cada ordem
    for (const orderData of orders) {
      const { order, item } = orderData;

      // GMV = subtotal do item (já inclui quantidade)
      const itemGmv = item.subtotal || (item.quantity * item.unit_price);
      totalGmv += itemGmv;
      totalUnits += item.quantity;

      // Comissão: rateio proporcional do pedido
      const itemProportion = item.subtotal / (order.total_value || 1);
      const itemCommission = order.commission_marketplace * itemProportion;
      totalCommission += itemCommission;

      // Frete: rateio proporcional
      const itemShipping = (order.shipping_cost || 0) * itemProportion;
      totalShipping += itemShipping;

      // Devoluções: simulado (TODO: integrar com dados reais)
      const itemReturns = 0; // Será populado quando houver rastreamento de devoluções
      totalReturns += itemReturns;

      // Ads: simulado (TODO: integrar com dados de campaigns)
      const itemAds = 0; // Será populado quando houver integração com platform ads
      totalAds += itemAds;

      // Marketplace breakdown
      const marketplace = order.marketplace;
      if (!marketplaceMap.has(marketplace)) {
        marketplaceMap.set(marketplace, { gmv: 0, units: 0 });
      }
      const mp = marketplaceMap.get(marketplace)!;
      mp.gmv += itemGmv;
      mp.units += item.quantity;
    }

    // Calcular net revenue e margin
    const netRevenue = totalGmv - totalCommission - totalShipping - totalReturns - totalAds;
    const marginPct = totalGmv > 0 ? (netRevenue / totalGmv) * 100 : 0;

    // Build marketplaces breakdown
    const marketplaces: MarginMetrics['marketplaces'] = {};
    for (const [marketplace, data] of marketplaceMap.entries()) {
      marketplaces[marketplace] = {
        gmv: data.gmv,
        units: data.units,
        marginPct: 0, // Será calculado se houver dados de custo por marketplace
      };
    }

    return {
      sku,
      variantId: variant.id,
      variantName: variant.variant_name || 'Padrão',
      productName: product.name,
      gmv: totalGmv,
      commission: totalCommission,
      shipping: totalShipping,
      returns: totalReturns,
      ads: totalAds,
      netRevenue,
      marginPct,
      unitsSold: totalUnits,
      ordersCount: orders.length,
      marketplaces,
    };
  }

  /**
   * Comparação de margem vs meta
   */
  async getMarginVsTarget(
    tenantId: string,
    daysBack: number = 30
  ): Promise<{
    actual: MarginMetrics[];
    targets: Map<string, number>;
    variance: Map<string, number>;
  }> {
    const actual = await this.calculateMarginMetrics(tenantId, daysBack);

    // TODO: Buscar targets da pricing_policies
    const targets = new Map<string, number>();
    for (const metric of actual) {
      targets.set(metric.sku, 25); // Default 25% margin target
    }

    // Calcular variance (actual - target)
    const variance = new Map<string, number>();
    for (const metric of actual) {
      const target = targets.get(metric.sku) || 0;
      variance.set(metric.sku, metric.marginPct - target);
    }

    return { actual, targets, variance };
  }

  /**
   * Alertas de margens baixas
   */
  async getLowMarginAlerts(
    tenantId: string,
    threshold: number = 15
  ): Promise<{
    sku: string;
    productName: string;
    currentMargin: number;
    threshold: number;
    status: 'warning' | 'critical';
  }[]> {
    const metrics = await this.calculateMarginMetrics(tenantId, 30);
    const alerts = [];

    for (const metric of metrics) {
      if (metric.marginPct < threshold) {
        alerts.push({
          sku: metric.sku,
          productName: metric.productName,
          currentMargin: metric.marginPct,
          threshold,
          status: metric.marginPct < 10 ? 'critical' : 'warning',
        });
      }
    }

    return alerts.sort((a, b) => a.currentMargin - b.currentMargin);
  }

  /**
   * Trend de margem (últimos 7 períodos de 7 dias)
   */
  async getMarginTrend(
    tenantId: string,
    sku?: string
  ): Promise<{
    date: string;
    marginPct: number;
    gmv: number;
    netRevenue: number;
  }[]> {
    const trend = [];

    // Últimas 7 semanas
    for (let week = 6; week >= 0; week--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (week * 7));

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);

      // Query orders para essa semana
      const orders = await this.prisma.orders.findMany({
        where: {
          tenant_id: tenantId,
          created_at: { gte: startDate, lte: endDate },
          ...(sku && {
            items: {
              some: {
                product_variant: { sku },
              },
            },
          }),
        },
        include: {
          items: {
            include: {
              product_variant: true,
            },
          },
        },
      });

      let totalGmv = 0;
      let totalCommission = 0;
      let totalShipping = 0;

      for (const order of orders) {
        for (const item of order.items) {
          if (!sku || item.product_variant.sku === sku) {
            const itemGmv = item.subtotal || (item.quantity * item.unit_price);
            totalGmv += itemGmv;

            const itemProportion = item.subtotal / (order.total_value || 1);
            totalCommission += order.commission_marketplace * itemProportion;
            totalShipping += (order.shipping_cost || 0) * itemProportion;
          }
        }
      }

      const netRevenue = totalGmv - totalCommission - totalShipping;
      const marginPct = totalGmv > 0 ? (netRevenue / totalGmv) * 100 : 0;

      trend.push({
        date: startDate.toISOString().split('T')[0],
        marginPct,
        gmv: totalGmv,
        netRevenue,
      });
    }

    return trend;
  }
}
