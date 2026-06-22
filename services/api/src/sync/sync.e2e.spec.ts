// services/api/src/sync/sync.e2e.spec.ts

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventorySyncService } from './inventory.sync.service';
import { OrdersSyncService } from './orders.sync.service';
import { CategoryMappingService } from './category-mapping.service';

/**
 * STEP 29: E2E tests para sincronização
 * Testa fluxo completo: criar dados → sincronizar → validar resultados
 */
describe('Sync Service E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let inventorySync: InventorySyncService;
  let ordersSync: OrdersSyncService;
  let categoryMapping: CategoryMappingService;

  // Test data
  const testTenantId = 'test-tenant-123';
  const testMarketplace = 'mercado_livre';

  beforeAll(async () => {
    // Setup test module
    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        InventorySyncService,
        OrdersSyncService,
        CategoryMappingService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    inventorySync = moduleRef.get<InventorySyncService>(InventorySyncService);
    ordersSync = moduleRef.get<OrdersSyncService>(OrdersSyncService);
    categoryMapping = moduleRef.get<CategoryMappingService>(
      CategoryMappingService
    );

    await app.init();

    // Create test tenant and products
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create test tenant
    // Note: In real setup, this would create fixtures via database
    console.log('Setting up test data for tenant:', testTenantId);
  }

  async function cleanupTestData() {
    // Remove test data
    console.log('Cleaning up test data');
  }

  /**
   * Test 1: Inventory sync flow
   * Verifica sincronização de estoque de um marketplace
   */
  describe('Inventory Sync', () => {
    it('should sync inventory from marketplace', async () => {
      const result = await inventorySync.syncMarketplaceInventory(
        testTenantId,
        testMarketplace
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.recordsProcessed).toBeGreaterThanOrEqual(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should update local inventory correctly', async () => {
      const result = await inventorySync.updateInventoryManual(
        testTenantId,
        'variant-123',
        testMarketplace,
        100
      );

      expect(result).toBeDefined();
      expect(result.quantity).toBe(100);
    });

    it('should validate stock availability', async () => {
      // First, set inventory
      await inventorySync.updateInventoryManual(
        testTenantId,
        'variant-123',
        testMarketplace,
        50
      );

      // Then validate
      const isAvailable = await inventorySync.validateStockAvailable(
        'variant-123',
        testMarketplace,
        30
      );

      expect(isAvailable).toBe(true);
    });

    it('should fail validation when stock insufficient', async () => {
      await inventorySync.updateInventoryManual(
        testTenantId,
        'variant-456',
        testMarketplace,
        10
      );

      const isAvailable = await inventorySync.validateStockAvailable(
        'variant-456',
        testMarketplace,
        20
      );

      expect(isAvailable).toBe(false);
    });

    it('should detect stock conflicts', async () => {
      await inventorySync.updateInventoryManual(
        testTenantId,
        'variant-789',
        testMarketplace,
        5
      );

      const conflict = await inventorySync.detectStockConflict(
        'variant-789',
        testMarketplace,
        3
      );

      expect(conflict).toBeDefined();
      expect(conflict.conflict).toBe(false); // Only conflict if available < requested AND > 0
    });

    it('should reserve and release stock', async () => {
      await inventorySync.updateInventoryManual(
        testTenantId,
        'variant-reserved',
        testMarketplace,
        100
      );

      // Reserve
      await inventorySync.reserveStock(
        'variant-reserved',
        testMarketplace,
        30
      );

      // Validate available = 100 - 30 = 70
      const isAvailable = await inventorySync.validateStockAvailable(
        'variant-reserved',
        testMarketplace,
        70
      );
      expect(isAvailable).toBe(true);

      // Release
      await inventorySync.releaseReservation(
        'variant-reserved',
        testMarketplace,
        30
      );

      // Now should be available for 100 again
      const isAvailableAfter = await inventorySync.validateStockAvailable(
        'variant-reserved',
        testMarketplace,
        100
      );
      expect(isAvailableAfter).toBe(true);
    });
  });

  /**
   * Test 2: Orders sync flow
   * Verifica sincronização de pedidos de um marketplace
   */
  describe('Orders Sync', () => {
    it('should sync orders from marketplace', async () => {
      const result = await ordersSync.syncMarketplaceOrders(
        testTenantId,
        testMarketplace
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.newOrders).toBeGreaterThanOrEqual(0);
      expect(result.updatedOrders).toBeGreaterThanOrEqual(0);
    });

    it('should handle webhook payload correctly', async () => {
      const webhookPayload = {
        marketplace_order_id: 'TEST-ORDER-001',
        status: 'new',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        total_value: 299.90,
        commission: 45.0,
        items: [
          {
            sku: 'ELETRO-001-V1',
            quantity: 2,
            unit_price: 142.45,
          },
        ],
      };

      const result = await ordersSync.handleOrderWebhook(
        testTenantId,
        testMarketplace,
        webhookPayload
      );

      expect(result).toBeDefined();
      expect(result.action).toMatch(/created|updated/);
      expect(result.orderId).toBeDefined();
    });

    it('should return unified feed', async () => {
      const feed = await ordersSync.getUnifiedFeed(testTenantId, 10, 0);

      expect(feed).toBeDefined();
      expect(feed.orders).toBeInstanceOf(Array);
      expect(feed.total).toBeGreaterThanOrEqual(0);
      expect(feed.limit).toBe(10);
      expect(feed.offset).toBe(0);
    });

    it('should filter orders by status', async () => {
      const orders = await ordersSync.getOrdersByStatus(
        testTenantId,
        'new'
      );

      expect(orders).toBeInstanceOf(Array);
      orders.forEach(order => {
        expect(order.status).toBe('new');
      });
    });

    it('should filter orders by marketplace', async () => {
      const orders = await ordersSync.getOrdersByMarketplace(
        testTenantId,
        testMarketplace,
        10
      );

      expect(orders).toBeInstanceOf(Array);
      orders.forEach(order => {
        expect(order.marketplace).toBe(testMarketplace);
      });
    });
  });

  /**
   * Test 3: Category mapping
   * Verifica tradução de categorias entre sistemas
   */
  describe('Category Mapping', () => {
    it('should translate category to marketplace', async () => {
      const mappedId = await categoryMapping.translateCategory(
        'Eletrodomésticos',
        testMarketplace
      );

      expect(mappedId).toBeDefined();
      expect(typeof mappedId).toBe('string');
    });

    it('should return null for unmapped category', async () => {
      const mappedId = await categoryMapping.translateCategory(
        'UnknownCategory',
        testMarketplace
      );

      expect(mappedId).toBeNull();
    });

    it('should validate category before publishing', async () => {
      const validation = await categoryMapping.validateCategory(
        'Eletrodomésticos',
        ['mercado_livre', 'shopee', 'amazon']
      );

      expect(validation).toBeDefined();
      expect(validation.valid).toEqual(expect.any(Boolean));
      expect(validation.missingMappings).toEqual(expect.any(Array));
    });

    it('should get all mappings', async () => {
      const mappings = await categoryMapping.getAllMappings();

      expect(mappings).toBeInstanceOf(Array);
    });
  });

  /**
   * Test 4: Sync integration flow
   * Testa fluxo completo: ordem → estoque → webhook
   */
  describe('Integration Flow', () => {
    it('should handle complete order-to-inventory flow', async () => {
      // 1. Set initial inventory
      await inventorySync.updateInventoryManual(
        testTenantId,
        'variant-integration',
        testMarketplace,
        100
      );

      // 2. Receive webhook order
      const orderResult = await ordersSync.handleOrderWebhook(
        testTenantId,
        testMarketplace,
        {
          marketplace_order_id: 'INTEGRATION-001',
          status: 'new',
          customer_name: 'Integration Test',
          customer_email: 'test@test.com',
          total_value: 299.90,
          commission: 45.0,
          items: [],
        }
      );

      expect(orderResult.orderId).toBeDefined();

      // 3. Reserve stock
      await inventorySync.reserveStock(
        'variant-integration',
        testMarketplace,
        10
      );

      // 4. Validate remaining stock
      const available = await inventorySync.validateStockAvailable(
        'variant-integration',
        testMarketplace,
        90
      );

      expect(available).toBe(true);

      // 5. Release reservation on order cancellation
      await inventorySync.releaseReservation(
        'variant-integration',
        testMarketplace,
        10
      );

      // 6. Verify stock available again
      const availableAfter = await inventorySync.validateStockAvailable(
        'variant-integration',
        testMarketplace,
        100
      );

      expect(availableAfter).toBe(true);
    });
  });
});
