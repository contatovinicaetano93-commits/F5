// services/api/src/sync/sync.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InventorySyncService } from './inventory.sync.service';
import { OrdersSyncService } from './orders.sync.service';
import { CategoryMappingService } from './category-mapping.service';
import { SyncQueueService } from './sync-queue.service';

/**
 * API endpoints para gerenciar sincronizações
 * POST /sync/inventory/manual — sincronizar estoque manualmente
 * POST /sync/orders/manual — sincronizar pedidos manualmente
 * GET /sync/logs — histórico de sincronizações
 * GET /sync/queue/status — status da fila de jobs
 */
@Controller('sync')
export class SyncController {
  constructor(
    private inventorySyncService: InventorySyncService,
    private ordersSyncService: OrdersSyncService,
    private categoryMappingService: CategoryMappingService,
    private syncQueueService: SyncQueueService
  ) {}

  /**
   * POST /sync/inventory/manual
   * Sincroniza estoque manualmente para um marketplace específico
   */
  @Post('inventory/manual')
  async syncInventoryManual(
    @Body() payload: {
      tenantId: string;
      marketplace: string;
    }
  ) {
    if (!payload.tenantId || !payload.marketplace) {
      throw new BadRequestException(
        'tenantId and marketplace are required'
      );
    }

    const result = await this.inventorySyncService.syncMarketplaceInventory(
      payload.tenantId,
      payload.marketplace
    );

    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  /**
   * POST /sync/orders/manual
   * Sincroniza pedidos manualmente para um marketplace específico
   */
  @Post('orders/manual')
  async syncOrdersManual(
    @Body() payload: {
      tenantId: string;
      marketplace: string;
    }
  ) {
    if (!payload.tenantId || !payload.marketplace) {
      throw new BadRequestException(
        'tenantId and marketplace are required'
      );
    }

    const result = await this.ordersSyncService.syncMarketplaceOrders(
      payload.tenantId,
      payload.marketplace
    );

    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }

  /**
   * POST /sync/tenant/:tenantId
   * Sincronizar todos os marketplaces de um tenant
   */
  @Post('tenant/:tenantId')
  async syncTenant(@Param('tenantId') tenantId: string) {
    const inventoryResults = await this.inventorySyncService.syncTenantInventory(tenantId);
    const orderResults = await this.ordersSyncService.syncTenantOrders(tenantId);

    return {
      success: true,
      data: {
        inventory: inventoryResults,
        orders: orderResults,
      },
      timestamp: new Date(),
    };
  }

  /**
   * GET /sync/logs?tenantId=xxx&marketplace=yyy&type=inventory&limit=50
   * Histórico de sincronizações com filtros
   */
  @Get('logs')
  async getSyncLogs(
    @Query('tenantId') tenantId?: string,
    @Query('marketplace') marketplace?: string,
    @Query('type') type?: 'inventory' | 'orders' | 'pricing',
    @Query('limit') limit: string = '50'
  ) {
    const limitNum = Math.min(parseInt(limit), 1000);

    // TODO: Implement query to fetch from sync_logs table
    return {
      success: true,
      data: [],
      filters: {
        tenantId,
        marketplace,
        type,
        limit: limitNum,
      },
    };
  }

  /**
   * GET /sync/queue/status
   * Status atual da fila de sincronização
   */
  @Get('queue/status')
  async getQueueStatus() {
    const stats = await this.syncQueueService.getQueueStats();
    const recentJobs = await this.syncQueueService.listRecentJobs(10);

    return {
      success: true,
      data: {
        stats,
        recentJobs,
      },
      timestamp: new Date(),
    };
  }

  /**
   * GET /sync/queue/job/:jobId
   * Status de um job específico
   */
  @Get('queue/job/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    const status = await this.syncQueueService.getJobStatus(jobId);

    if (!status) {
      throw new BadRequestException('Job not found');
    }

    return {
      success: true,
      data: status,
    };
  }

  /**
   * GET /sync/categories
   * Listar todos os mapeamentos de categoria
   */
  @Get('categories')
  async getCategories() {
    const mappings = await this.categoryMappingService.getAllMappings();

    return {
      success: true,
      data: mappings,
    };
  }

  /**
   * POST /sync/categories/validate
   * Validar se uma categoria pode ser publicada em determinados marketplaces
   */
  @Post('categories/validate')
  async validateCategory(
    @Body() payload: {
      category: string;
      marketplaces: string[];
    }
  ) {
    if (!payload.category || !payload.marketplaces?.length) {
      throw new BadRequestException(
        'category and marketplaces are required'
      );
    }

    const result = await this.categoryMappingService.validateCategory(
      payload.category,
      payload.marketplaces
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /sync/inventory/:tenantId/:variantId
   * Atualizar estoque manualmente para variante específica
   */
  @Post('inventory/:tenantId/:variantId')
  async updateInventoryManual(
    @Param('tenantId') tenantId: string,
    @Param('variantId') variantId: string,
    @Body() payload: {
      marketplace: string;
      quantity: number;
    }
  ) {
    if (!payload.marketplace || payload.quantity === undefined) {
      throw new BadRequestException(
        'marketplace and quantity are required'
      );
    }

    const result = await this.inventorySyncService.updateInventoryManual(
      tenantId,
      variantId,
      payload.marketplace,
      payload.quantity
    );

    return {
      success: true,
      data: result,
      timestamp: new Date(),
    };
  }
}
