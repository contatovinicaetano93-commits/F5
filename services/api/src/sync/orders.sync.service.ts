// services/api/src/sync/orders.sync.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface OrderSyncResult {
  marketplace: string;
  success: boolean;
  newOrders: number;
  updatedOrders: number;
  error?: string;
  duration: number;
}

@Injectable()
export class OrdersSyncService {
  private readonly logger = new Logger(OrdersSyncService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * STEP 24: Worker que sincroniza pedidos a cada 15 minutos
   * Busca novos pedidos de TODOS os marketplaces
   */
  @Cron(CronExpression.EVERY_15_MINUTES)
  async syncAllOrders() {
    this.logger.debug('Starting orders sync for all marketplaces...');

    try {
      const tenants = await this.prisma.tenants.findMany({
        where: { status: 'active' },
      });

      for (const tenant of tenants) {
        await this.syncTenantOrders(tenant.id);
      }

      this.logger.log('✅ All marketplace orders synced');
    } catch (error) {
      this.logger.error('❌ Orders sync failed:', error);
    }
  }

  /**
   * Sincroniza pedidos de um tenant em todos os marketplaces
   */
  async syncTenantOrders(tenantId: string) {
    const results: OrderSyncResult[] = [];

    const marketplaces = ['mercado_livre', 'shopee', 'amazon', 'magalu'];

    for (const marketplace of marketplaces) {
      const result = await this.syncMarketplaceOrders(tenantId, marketplace);
      results.push(result);

      // Log sync
      await this.logSync(tenantId, marketplace, result);
    }

    return results;
  }

  /**
   * Sincroniza pedidos de UM marketplace
   * Fluxo: Marketplace API → Local DB
   */
  private async syncMarketplaceOrders(
    tenantId: string,
    marketplace: string
  ): Promise<OrderSyncResult> {
    const startTime = Date.now();
    let newOrders = 0;
    let updatedOrders = 0;

    try {
      // 1. Get marketplace credentials
      const credentials = await this.prisma.marketplaceCredentials.findUnique(
        {
          where: {
            tenantId_marketplace: {
              tenantId,
              marketplace: marketplace as any,
            },
          },
        }
      );

      if (!credentials || credentials.status !== 'active') {
        return {
          marketplace,
          success: false,
          newOrders: 0,
          updatedOrders: 0,
          error: 'No active credentials',
          duration: Date.now() - startTime,
        };
      }

      // 2. Fetch orders from marketplace API (mock for now)
      const remoteOrders = await this.fetchMarketplaceOrders(
        marketplace,
        credentials.accessToken
      );

      // 3. Upsert orders into local database
      for (const remoteOrder of remoteOrders) {
        const existing = await this.prisma.orders.findUnique({
          where: {
            tenantId_marketplaceOrderId_marketplace: {
              tenantId,
              marketplace_order_id: remoteOrder.marketplace_order_id,
              marketplace: marketplace as any,
            },
          },
        });

        if (existing) {
          // Update existing order
          await this.prisma.orders.update({
            where: { id: existing.id },
            data: {
              status: remoteOrder.status,
              updated_at: new Date(),
            },
          });
          updatedOrders++;
        } else {
          // Create new order
          const order = await this.prisma.orders.create({
            data: {
              tenant_id: tenantId,
              marketplace_order_id: remoteOrder.marketplace_order_id,
              marketplace: marketplace as any,
              status: remoteOrder.status,
              customer_name: remoteOrder.customer_name,
              customer_email: remoteOrder.customer_email,
              total_value: remoteOrder.total_value,
              commission_marketplace: remoteOrder.commission_marketplace || 0,
              shipping_cost: remoteOrder.shipping_cost || 0,
            },
          });

          // Create order items
          for (const item of remoteOrder.items || []) {
            await this.createOrderItem(order.id, item);
          }

          newOrders++;
        }
      }

      // 4. Update last_sync
      await this.prisma.marketplaceCredentials.update({
        where: { id: credentials.id },
        data: { last_sync: new Date() },
      });

      const duration = Date.now() - startTime;

      this.logger.log(
        `✅ [${marketplace}] New: ${newOrders}, Updated: ${updatedOrders} in ${duration}ms`
      );

      return {
        marketplace,
        success: true,
        newOrders,
        updatedOrders,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        `❌ [${marketplace}] Orders sync failed: ${error.message}`
      );

      return {
        marketplace,
        success: false,
        newOrders,
        updatedOrders,
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Busca pedidos de um marketplace (API)
   * TODO: Integrar com APIs reais (ML, Shopee, Amazon)
   */
  private async fetchMarketplaceOrders(
    marketplace: string,
    accessToken: string
  ): Promise<any[]> {
    this.logger.debug(
      `Fetching orders from ${marketplace} API...`
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Mock orders
    return [
      {
        marketplace_order_id: `${marketplace.toUpperCase()}-2026-06-001`,
        status: 'new',
        customer_name: 'João Silva',
        customer_email: 'joao@email.com',
        total_value: 299.90,
        commission_marketplace: 45.0,
        shipping_cost: 15.0,
        items: [
          {
            sku: 'ELETRO-001-V1',
            quantity: 2,
            unit_price: 142.45,
          },
        ],
      },
      {
        marketplace_order_id: `${marketplace.toUpperCase()}-2026-06-002`,
        status: 'processing',
        customer_name: 'Maria Santos',
        customer_email: 'maria@email.com',
        total_value: 199.90,
        commission_marketplace: 29.99,
        shipping_cost: 12.0,
        items: [
          {
            sku: 'ELETRO-002-V1',
            quantity: 1,
            unit_price: 199.90,
          },
        ],
      },
    ];
  }

  /**
   * Criar item de pedido
   */
  private async createOrderItem(
    orderId: string,
    item: {
      sku: string;
      quantity: number;
      unit_price: number;
    }
  ) {
    // Find product variant by SKU
    const variant = await this.prisma.productVariants.findFirst({
      where: { sku: item.sku },
    });

    if (!variant) {
      this.logger.warn(`SKU not found for order item: ${item.sku}`);
      return;
    }

    const subtotal = item.quantity * item.unit_price;

    await this.prisma.orderItems.create({
      data: {
        order_id: orderId,
        product_variant_id: variant.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal,
      },
    });
  }

  /**
   * Get unified order feed (all marketplaces mixed)
   * Retorna pedidos de todos os marketplaces ordenados por data
   */
  async getUnifiedFeed(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    const orders = await this.prisma.orders.findMany({
      where: { tenant_id: tenantId },
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
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.orders.count({
      where: { tenant_id: tenantId },
    });

    return {
      orders,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    tenantId: string,
    status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  ) {
    return await this.prisma.orders.findMany({
      where: {
        tenant_id: tenantId,
        status,
      },
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get orders by marketplace
   */
  async getOrdersByMarketplace(
    tenantId: string,
    marketplace: string,
    limit: number = 50
  ) {
    return await this.prisma.orders.findMany({
      where: {
        tenant_id: tenantId,
        marketplace: marketplace as any,
      },
      include: { items: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  /**
   * STEP 25: Webhook handler para pedidos em tempo real
   * Quando marketplace envia novo pedido via webhook
   */
  async handleOrderWebhook(
    tenantId: string,
    marketplace: string,
    payload: {
      marketplace_order_id: string;
      status: string;
      customer_name: string;
      customer_email?: string;
      total_value: number;
      commission?: number;
      items: Array<{
        sku: string;
        quantity: number;
        unit_price: number;
      }>;
    }
  ) {
    try {
      this.logger.log(
        `📥 Webhook received: [${marketplace}] Order ${payload.marketplace_order_id}`
      );

      // Check if order already exists
      const existing = await this.prisma.orders.findUnique({
        where: {
          tenantId_marketplaceOrderId_marketplace: {
            tenantId,
            marketplace_order_id: payload.marketplace_order_id,
            marketplace: marketplace as any,
          },
        },
      });

      if (existing) {
        // Update existing
        await this.prisma.orders.update({
          where: { id: existing.id },
          data: {
            status: payload.status,
            updated_at: new Date(),
          },
        });

        this.logger.log(`✅ Order updated: ${payload.marketplace_order_id}`);
        return { action: 'updated', orderId: existing.id };
      }

      // Create new order
      const order = await this.prisma.orders.create({
        data: {
          tenant_id: tenantId,
          marketplace_order_id: payload.marketplace_order_id,
          marketplace: marketplace as any,
          status: payload.status,
          customer_name: payload.customer_name,
          customer_email: payload.customer_email,
          total_value: payload.total_value,
          commission_marketplace: payload.commission || 0,
        },
      });

      // Create items
      for (const item of payload.items) {
        await this.createOrderItem(order.id, item);
      }

      this.logger.log(`✅ Order created: ${payload.marketplace_order_id}`);
      return { action: 'created', orderId: order.id };
    } catch (error) {
      this.logger.error(
        `❌ Webhook handling failed: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Log sync operation
   */
  private async logSync(
    tenantId: string,
    marketplace: string,
    result: OrderSyncResult
  ) {
    await this.prisma.syncLogs.create({
      data: {
        tenant_id: tenantId,
        marketplace,
        type: 'orders',
        status: result.success ? 'success' : 'failed',
        error: result.error,
        records_processed: result.newOrders + result.updatedOrders,
      },
    });
  }
}
