// services/api/src/marketplace/pricing.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PricingStrategy {
  type: 'static' | 'dynamic' | 'competitive';
  minPrice: number;
  minMargin: number;
  competitorFactor?: number; // How much cheaper than competitor
  maxPrice?: number;
  rules?: PricingRule[];
}

export interface PricingRule {
  condition: 'inventory' | 'time' | 'demand' | 'competitor';
  threshold: number;
  action: 'increase' | 'decrease';
  factor: number; // % increase/decrease
}

export interface DynamicPrice {
  sku: string;
  marketplace: string;
  basePrice: number;
  dynamicPrice: number;
  appliedRules: string[];
  reason: string;
}

/**
 * STEP 43: Precificação Dinâmica
 * Implementa estratégias de pricing baseadas em:
 * - Estoque disponível
 * - Competidores
 * - Demanda
 * - Margem mínima
 */
@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcular preço dinâmico para um SKU/marketplace
   */
  async calculateDynamicPrice(
    tenantId: string,
    productVariantId: string,
    marketplace: string,
    strategy: PricingStrategy
  ): Promise<DynamicPrice> {
    // 1. Buscar dados do produto e políticas
    const variant = await this.prisma.productVariants.findUnique({
      where: { id: productVariantId },
      include: {
        product: true,
        inventory: {
          where: { marketplace: marketplace as any },
        },
      },
    });

    if (!variant) {
      throw new Error('Product variant not found');
    }

    const policy = await this.prisma.pricingPolicies.findUnique({
      where: {
        tenant_product_marketplace: {
          tenant_id: tenantId,
          product_variant_id: productVariantId,
          marketplace: marketplace as any,
        },
      },
    });

    const currentPrice = policy?.min_price || 100;
    const minMargin = policy?.min_margin_pct || 20;
    let dynamicPrice = currentPrice;
    const appliedRules: string[] = [];

    // 2. Aplicar regras de preço dinâmico
    if (strategy.type === 'static') {
      // Sem ajuste
      return {
        sku: variant.sku,
        marketplace,
        basePrice: currentPrice,
        dynamicPrice,
        appliedRules,
        reason: 'Static pricing',
      };
    }

    // 3. Regras por estoque
    const inventory = variant.inventory[0];
    const availableStock = (inventory?.quantity || 0) - (inventory?.reserved || 0);

    if (strategy.type === 'dynamic') {
      // High stock → lower price (promote sales)
      if (availableStock > 100) {
        dynamicPrice *= 0.95; // -5%
        appliedRules.push('High stock discount');
      }
      // Low stock → higher price (maximize revenue)
      else if (availableStock < 10 && availableStock > 0) {
        dynamicPrice *= 1.1; // +10%
        appliedRules.push('Low stock premium');
      }
      // Out of stock → prevent listing
      else if (availableStock <= 0) {
        dynamicPrice = 0;
        appliedRules.push('Out of stock');
      }
    }

    // 4. Regras por tempo (ex: black friday, seasonal)
    const month = new Date().getMonth();
    if ([10, 11].includes(month)) {
      // Nov = Black Friday
      dynamicPrice *= 0.85; // -15%
      appliedRules.push('Holiday discount');
    }

    // 5. Regras por demanda (futuro: integrar com dados de clicks/views)
    // TODO: Fetch engagement metrics

    // 6. Validar margem mínima
    const costEstimate = currentPrice * (1 - minMargin / 100);
    if (dynamicPrice < costEstimate) {
      dynamicPrice = costEstimate;
      appliedRules.push('Minimum margin enforced');
    }

    // 7. Respeitar preços mínimo/máximo
    if (dynamicPrice < strategy.minPrice) {
      dynamicPrice = strategy.minPrice;
      appliedRules.push('Minimum price enforced');
    }

    if (strategy.maxPrice && dynamicPrice > strategy.maxPrice) {
      dynamicPrice = strategy.maxPrice;
      appliedRules.push('Maximum price enforced');
    }

    return {
      sku: variant.sku,
      marketplace,
      basePrice: currentPrice,
      dynamicPrice: Math.round(dynamicPrice * 100) / 100,
      appliedRules,
      reason: appliedRules.length > 0
        ? `Applied rules: ${appliedRules.join(', ')}`
        : 'Base price maintained',
    };
  }

  /**
   * Aplicar preço dinâmico em um marketplace
   */
  async applyDynamicPrice(
    tenantId: string,
    productVariantId: string,
    marketplace: string,
    price: number
  ): Promise<void> {
    // TODO: Chamar marketplace API (MercadoLivreService.updatePrice, etc)
    this.logger.log(
      `💰 Applied dynamic price: ${productVariantId} on ${marketplace} → R$ ${price}`
    );
  }

  /**
   * Estratégia: Preço competitivo
   * Precificar X% mais barato que competidores
   */
  async getCompetitivePrice(
    sku: string,
    marketplace: string,
    competitorFactor: number = 5
  ): Promise<number> {
    // TODO: Integrar com dados de competidores
    // Por enquanto, retorna preço fixo
    const basePrice = 100;
    return Math.round(basePrice * (1 - competitorFactor / 100) * 100) / 100;
  }

  /**
   * Histórico de mudanças de preço
   */
  async getPriceHistory(
    productVariantId: string,
    marketplace: string,
    daysBack: number = 30
  ): Promise<{
    date: string;
    price: number;
    reason: string;
  }[]> {
    // TODO: Implementar com log de preços
    return [];
  }

  /**
   * Recomendações de preço
   */
  async getPriceRecommendations(
    tenantId: string,
    daysBack: number = 30
  ): Promise<{
    sku: string;
    currentPrice: number;
    recommendedPrice: number;
    potentialRevenue: number;
    reasoning: string;
  }[]> {
    // TODO: Implementar com análise de dados históricos
    return [];
  }

  /**
   * A/B test de preços
   */
  async setupABTest(
    tenantId: string,
    productVariantId: string,
    controlPrice: number,
    testPrice: number,
    testPercentage: number = 10 // 10% de tráfico no teste
  ): Promise<{
    experimentId: string;
    controlPrice: number;
    testPrice: number;
    testPercentage: number;
  }> {
    // TODO: Implementar com suporte a A/B testing
    const experimentId = `ab-${productVariantId}-${Date.now()}`;

    this.logger.log(
      `🧪 A/B test started: ${controlPrice} vs ${testPrice} (${testPercentage}% traffic)`
    );

    return {
      experimentId,
      controlPrice,
      testPrice,
      testPercentage,
    };
  }

  /**
   * Simular impact de mudança de preço
   */
  async simulatePriceChange(
    tenantId: string,
    productVariantId: string,
    newPrice: number,
    elasticity: number = -1.5 // Price elasticity of demand
  ): Promise<{
    currentPrice: number;
    newPrice: number;
    expectedDemandChange: number; // %
    expectedRevenueChange: number; // %
  }> {
    // Revenue elasticity = elasticity of demand
    const policy = await this.prisma.pricingPolicies.findFirst({
      where: {
        product_variant_id: productVariantId,
      },
    });

    const currentPrice = policy?.min_price || 100;
    const priceChangePercent = ((newPrice - currentPrice) / currentPrice) * 100;
    const expectedDemandChange = priceChangePercent * elasticity;
    const expectedRevenueChange = priceChangePercent + expectedDemandChange;

    return {
      currentPrice,
      newPrice,
      expectedDemandChange,
      expectedRevenueChange,
    };
  }
}
