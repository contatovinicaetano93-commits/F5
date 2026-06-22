// services/api/src/sync/inventory.sync.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface InventorySyncResult {
  marketplace: string;
  success: boolean;
  recordsProcessed: number;
  error?: string;
  duration: number;
}

@Injectable()
export class InventorySyncService {
  private readonly logger = new Logger(InventorySyncService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * STEP 21: Worker que roda a cada 5 minutos
   * Sincroniza estoque de TODOS os marketplaces
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncAllMarketplaces() {
    this.logger.debug('Starting inventory sync for all marketplaces...');

    try {
      // Get all tenants with active marketplace credentials
      const tenants = await this.prisma.tenants.findMany({
        where: { status: 'active' },
      });

      for (const tenant of tenants) {
        await this.syncTenantInventory(tenant.id);
      }

      this.logger.log('✅ All marketplace inventory syncs completed');
    } catch (error) {
      this.logger.error('❌ Inventory sync failed:', error);
    }
  }

  /**
   * Sincroniza estoque de um tenant em todos os marketplaces
   */
  async syncTenantInventory(tenantId: string) {
    const results: InventorySyncResult[] = [];

    const marketplaces = ['mercado_livre', 'shopee', 'amazon', 'magalu'];

    for (const marketplace of marketplaces) {
      const result = await this.syncMarketplace(tenantId, marketplace);
      results.push(result);

      // Log each sync
      await this.logSync(tenantId, marketplace, result);
    }

    return results;
  }

  /**
   * Sincroniza estoque de UM marketplace
   * Fluxo: Marketplace API → Local DB
   */
  private async syncMarketplace(
    tenantId: string,
    marketplace: string
  ): Promise<InventorySyncResult> {
    const startTime = Date.now();
    let recordsProcessed = 0;

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
          recordsProcessed: 0,
          error: 'No active credentials',
          duration: Date.now() - startTime,
        };
      }

      // 2. Fetch inventory from marketplace API (mock for now)
      const remoteInventory = await this.fetchMarketplaceInventory(
        marketplace,
        credentials.accessToken
      );

      // 3. Update local database
      for (const item of remoteInventory) {
        await this.updateLocalInventory(tenantId, item);
        recordsProcessed++;
      }

      // 4. Update last_sync timestamp
      await this.prisma.marketplaceCredentials.update({
        where: { id: credentials.id },
        data: { last_sync: new Date() },
      });

      const duration = Date.now() - startTime;

      this.logger.log(
        `✅ [${marketplace}] Synced ${recordsProcessed} items in ${duration}ms`
      );

      return {
        marketplace,
        success: true,
        recordsProcessed,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        `❌ [${marketplace}] Sync failed: ${error.message}`
      );

      return {
        marketplace,
        success: false,
        recordsProcessed,
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Busca estoque real de um marketplace (API)
   * TODO: Integrar com APIs reais (ML, Shopee, Amazon)
   */
  private async fetchMarketplaceInventory(
    marketplace: string,
    accessToken: string
  ): Promise<
    Array<{
      sku: string;
      quantity: number;
    }>
  > {
    // Mock data for now
    // In production: Call real marketplace APIs

    this.logger.debug(
      `Fetching inventory from ${marketplace} API...`
    );

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Return mock inventory
    return [
      { sku: 'ELETRO-001-V1', quantity: 45 },
      { sku: 'ELETRO-002-V1', quantity: 78 },
      { sku: 'ELETRO-003-V1', quantity: 120 },
    ];
  }

  /**
   * Atualiza estoque local com dados do marketplace
   */
  private async updateLocalInventory(
    tenantId: string,
    remoteItem: { sku: string; quantity: number }
  ) {
    // Find product variant by SKU
    const variant = await this.prisma.productVariants.findFirst({
      where: {
        sku: remoteItem.sku,
        product: {
          tenant_id: tenantId,
        },
      },
    });

    if (!variant) {
      this.logger.warn(`SKU not found: ${remoteItem.sku}`);
      return;
    }

    // Update inventory (upsert)
    const marketplace = 'mercado_livre'; // TODO: Get from context

    await this.prisma.inventory.upsert({
      where: {
        product_variant_id_marketplace: {
          product_variant_id: variant.id,
          marketplace: marketplace as any,
        },
      },
      create: {
        product_variant_id: variant.id,
        marketplace: marketplace as any,
        quantity: remoteItem.quantity,
        reserved: 0,
      },
      update: {
        quantity: remoteItem.quantity,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Log sync operation para audit trail
   */
  private async logSync(
    tenantId: string,
    marketplace: string,
    result: InventorySyncResult
  ) {
    await this.prisma.syncLogs.create({
      data: {
        tenant_id: tenantId,
        marketplace,
        type: 'inventory',
        status: result.success ? 'success' : 'failed',
        error: result.error,
        records_processed: result.recordsProcessed,
      },
    });
  }

  /**
   * STEP 22: API para atualizar estoque local manualmente
   * Usado quando integração com marketplace API falha
   */
  async updateInventoryManual(
    tenantId: string,
    productVariantId: string,
    marketplace: string,
    quantity: number
  ) {
    // Validar que user é do mesmo tenant
    const variant = await this.prisma.productVariants.findFirst({
      where: {
        id: productVariantId,
        product: {
          tenant_id: tenantId,
        },
      },
    });

    if (!variant) {
      throw new Error('Product variant not found');
    }

    // Validar quantidade mínima
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Update inventory
    const updated = await this.prisma.inventory.upsert({
      where: {
        product_variant_id_marketplace: {
          product_variant_id: productVariantId,
          marketplace: marketplace as any,
        },
      },
      create: {
        product_variant_id: productVariantId,
        marketplace: marketplace as any,
        quantity,
        reserved: 0,
      },
      update: {
        quantity,
        updated_at: new Date(),
      },
    });

    // Log manual update
    await this.logSync(tenantId, marketplace, {
      marketplace,
      success: true,
      recordsProcessed: 1,
      duration: 0,
    });

    return updated;
  }

  /**
   * STEP 26: Validar estoque ao criar pedido
   * Se quantity < (pedido + reserved), retorna erro
   */
  async validateStockAvailable(
    productVariantId: string,
    marketplace: string,
    requestedQuantity: number
  ): Promise<boolean> {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        product_variant_id_marketplace: {
          product_variant_id: productVariantId,
          marketplace: marketplace as any,
        },
      },
    });

    if (!inventory) {
      return false; // No inventory record = out of stock
    }

    const available = inventory.quantity - inventory.reserved;

    if (available < requestedQuantity) {
      this.logger.warn(
        `❌ Stock not available: ${available} < ${requestedQuantity}`
      );
      return false;
    }

    return true;
  }

  /**
   * STEP 28: Detectar conflitos de estoque
   * Se 2 pedidos chegam simultâneos e há apenas 1 unidade
   */
  async detectStockConflict(
    productVariantId: string,
    marketplace: string,
    incomingQuantity: number
  ) {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        product_variant_id_marketplace: {
          product_variant_id: productVariantId,
          marketplace: marketplace as any,
        },
      },
    });

    if (!inventory) {
      return { conflict: false };
    }

    const available = inventory.quantity - inventory.reserved;

    if (available < incomingQuantity && available > 0) {
      // Conflict: limited stock for multiple orders
      return {
        conflict: true,
        available,
        requested: incomingQuantity,
      };
    }

    return { conflict: false };
  }

  /**
   * Reservar estoque (quando pedido é confirmado)
   */
  async reserveStock(
    productVariantId: string,
    marketplace: string,
    quantity: number
  ) {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        product_variant_id_marketplace: {
          product_variant_id: productVariantId,
          marketplace: marketplace as any,
        },
      },
    });

    if (!inventory || inventory.quantity - inventory.reserved < quantity) {
      throw new Error('Insufficient stock for reservation');
    }

    return await this.prisma.inventory.update({
      where: {
        product_variant_id_marketplace: {
          product_variant_id: productVariantId,
          marketplace: marketplace as any,
        },
      },
      data: {
        reserved: {
          increment: quantity,
        },
      },
    });
  }

  /**
   * Liberar reserva (quando pedido é cancelado)
   */
  async releaseReservation(
    productVariantId: string,
    marketplace: string,
    quantity: number
  ) {
    return await this.prisma.inventory.update({
      where: {
        product_variant_id_marketplace: {
          product_variant_id: productVariantId,
          marketplace: marketplace as any,
        },
      },
      data: {
        reserved: {
          decrement: quantity,
        },
      },
    });
  }
}
