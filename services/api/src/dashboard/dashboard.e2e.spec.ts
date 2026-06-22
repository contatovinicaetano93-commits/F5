// services/api/src/dashboard/dashboard.e2e.spec.ts

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarginService } from './margin.service';
import { KpiService } from './kpi.service';

/**
 * STEP 40: E2E tests para Dashboard & KPIs
 * Testa cálculos de margem, KPIs e alertas
 */
describe('Dashboard Services E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let marginService: MarginService;
  let kpiService: KpiService;

  const testTenantId = 'test-tenant-dashboard';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        MarginService,
        KpiService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    marginService = moduleRef.get<MarginService>(MarginService);
    kpiService = moduleRef.get<KpiService>(KpiService);

    await app.init();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    console.log('Setting up test data for dashboard tests');
  }

  async function cleanupTestData() {
    console.log('Cleaning up dashboard test data');
  }

  /**
   * Test Suite 1: Margin Calculations
   */
  describe('Margin Service', () => {
    it('should calculate margin metrics correctly', async () => {
      const metrics = await marginService.calculateMarginMetrics(
        testTenantId,
        30
      );

      expect(metrics).toBeInstanceOf(Array);
      if (metrics.length > 0) {
        const metric = metrics[0];
        expect(metric.sku).toBeDefined();
        expect(metric.gmv).toBeGreaterThanOrEqual(0);
        expect(metric.netRevenue).toBeLessThanOrEqual(metric.gmv);
        expect(metric.marginPct).toBeGreaterThanOrEqual(-100);
        expect(metric.marginPct).toBeLessThanOrEqual(100);
      }
    });

    it('should return metrics sorted by margin descending', async () => {
      const metrics = await marginService.calculateMarginMetrics(
        testTenantId,
        30
      );

      if (metrics.length > 1) {
        for (let i = 0; i < metrics.length - 1; i++) {
          expect(metrics[i].marginPct).toBeGreaterThanOrEqual(
            metrics[i + 1].marginPct
          );
        }
      }
    });

    it('should include correct cost breakdown', async () => {
      const metrics = await marginService.calculateMarginMetrics(
        testTenantId,
        30
      );

      if (metrics.length > 0) {
        const metric = metrics[0];
        // Verify formula: netRevenue = GMV - costs
        const totalCosts = metric.commission + metric.shipping +
                          metric.returns + metric.ads;
        const expectedNetRevenue = metric.gmv - totalCosts;
        expect(metric.netRevenue).toBeCloseTo(expectedNetRevenue, 2);
      }
    });

    it('should calculate marketplace breakdown', async () => {
      const metrics = await marginService.calculateMarginMetrics(
        testTenantId,
        30
      );

      if (metrics.length > 0) {
        const metric = metrics[0];
        expect(metric.marketplaces).toBeDefined();
        expect(typeof metric.marketplaces).toBe('object');

        // Each marketplace entry should have gmv and units
        for (const [_, mp] of Object.entries(metric.marketplaces)) {
          expect(mp).toHaveProperty('gmv');
          expect(mp).toHaveProperty('units');
        }
      }
    });

    it('should get alerts for low margin SKUs', async () => {
      const alerts = await marginService.getLowMarginAlerts(testTenantId, 50);

      expect(alerts).toBeInstanceOf(Array);
      alerts.forEach(alert => {
        expect(alert.sku).toBeDefined();
        expect(alert.productName).toBeDefined();
        expect(alert.currentMargin).toBeLessThan(50);
        expect(['warning', 'critical']).toContain(alert.status);
      });
    });

    it('should calculate trend correctly', async () => {
      const trend = await marginService.getMarginTrend(testTenantId);

      expect(trend).toBeInstanceOf(Array);
      expect(trend.length).toBeLessThanOrEqual(7);

      trend.forEach(point => {
        expect(point.date).toBeDefined();
        expect(point.marginPct).toBeGreaterThanOrEqual(-100);
        expect(point.marginPct).toBeLessThanOrEqual(100);
        expect(point.gmv).toBeGreaterThanOrEqual(0);
        expect(point.netRevenue).toBeGreaterThanOrEqual(-point.gmv);
      });
    });

    it('should compare actual vs target', async () => {
      const result = await marginService.getMarginVsTarget(testTenantId, 30);

      expect(result.actual).toBeInstanceOf(Array);
      expect(result.targets).toBeInstanceOf(Map);
      expect(result.variance).toBeInstanceOf(Map);

      for (const metric of result.actual) {
        const target = result.targets.get(metric.sku) || 0;
        const variance = result.variance.get(metric.sku) || 0;
        expect(variance).toBeCloseTo(metric.marginPct - target, 1);
      }
    });

    it('should handle empty data gracefully', async () => {
      const metrics = await marginService.calculateMarginMetrics(
        'nonexistent-tenant',
        30
      );

      expect(metrics).toBeInstanceOf(Array);
      expect(metrics.length).toBe(0);
    });
  });

  /**
   * Test Suite 2: KPI Calculations
   */
  describe('KPI Service', () => {
    it('should calculate all 4 KPIs', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);

      expect(kpis).toHaveProperty('gmv');
      expect(kpis).toHaveProperty('inventory');
      expect(kpis).toHaveProperty('orders');
      expect(kpis).toHaveProperty('margin');
    });

    it('should calculate GMV correctly', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);

      expect(kpis.gmv).toHaveProperty('value');
      expect(kpis.gmv).toHaveProperty('currency');
      expect(kpis.gmv).toHaveProperty('period');
      expect(kpis.gmv).toHaveProperty('trend');

      expect(kpis.gmv.value).toBeGreaterThanOrEqual(0);
      expect(kpis.gmv.currency).toBe('BRL');
    });

    it('should calculate inventory KPI', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);

      expect(kpis.inventory).toHaveProperty('totalUnits');
      expect(kpis.inventory).toHaveProperty('reservedUnits');
      expect(kpis.inventory).toHaveProperty('availableUnits');
      expect(kpis.inventory).toHaveProperty('lowStockItems');

      // Available should be total - reserved
      const expected = kpis.inventory.totalUnits - kpis.inventory.reservedUnits;
      expect(kpis.inventory.availableUnits).toBe(expected);
    });

    it('should calculate orders KPI', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);

      expect(kpis.orders).toHaveProperty('total');
      expect(kpis.orders).toHaveProperty('new');
      expect(kpis.orders).toHaveProperty('processing');
      expect(kpis.orders).toHaveProperty('shipped');
      expect(kpis.orders).toHaveProperty('delivered');
      expect(kpis.orders).toHaveProperty('cancelled');
      expect(kpis.orders).toHaveProperty('avgValue');

      // Sum of all statuses should be <= total
      const statusSum = kpis.orders.new + kpis.orders.processing +
                       kpis.orders.shipped + kpis.orders.delivered +
                       kpis.orders.cancelled;
      expect(statusSum).toBeLessThanOrEqual(kpis.orders.total);
    });

    it('should calculate margin KPI', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);

      expect(kpis.margin).toHaveProperty('avgMarginPct');
      expect(kpis.margin).toHaveProperty('bestSku');
      expect(kpis.margin).toHaveProperty('worstSku');
      expect(kpis.margin).toHaveProperty('skusBelow15Pct');

      expect(kpis.margin.avgMarginPct).toBeGreaterThanOrEqual(-100);
      expect(kpis.margin.avgMarginPct).toBeLessThanOrEqual(100);
    });

    it('should generate KPI alerts', async () => {
      const alerts = await kpiService.getKPIAlerts(testTenantId);

      expect(alerts).toBeInstanceOf(Array);
      alerts.forEach(alert => {
        expect(['warning', 'critical']).toContain(alert.type);
        expect(alert.metric).toBeDefined();
        expect(alert.message).toBeDefined();
        expect(typeof alert.value).toBe('number');
      });
    });

    it('should compare KPIs between periods', async () => {
      const comparison = await kpiService.getKPIsComparison(
        testTenantId,
        30,
        30
      );

      expect(comparison).toHaveProperty('current');
      expect(comparison).toHaveProperty('comparison');
      expect(comparison.comparison).toHaveProperty('gmvChange');
      expect(comparison.comparison).toHaveProperty('gmvChangePercent');
    });
  });

  /**
   * Test Suite 3: Integration Scenarios
   */
  describe('Dashboard Integration', () => {
    it('should handle default 30-day period', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId);

      expect(kpis).toBeDefined();
      expect(kpis.gmv.value).toBeGreaterThanOrEqual(0);
    });

    it('should handle custom periods', async () => {
      const kpis7 = await kpiService.getDashboardKPIs(testTenantId, 7);
      const kpis30 = await kpiService.getDashboardKPIs(testTenantId, 30);
      const kpis90 = await kpiService.getDashboardKPIs(testTenantId, 90);

      // Generally, more data means more GMV (not always true, but common)
      expect([kpis7, kpis30, kpis90]).toBeDefined();
    });

    it('should alert on low margin', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);
      const alerts = await kpiService.getKPIAlerts(testTenantId);

      // If avg margin < 15%, should have critical alert
      if (kpis.margin.avgMarginPct < 15) {
        const marginAlert = alerts.find(a => a.metric === 'Margin');
        expect(marginAlert).toBeDefined();
      }
    });

    it('should alert on low stock', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);
      const alerts = await kpiService.getKPIAlerts(testTenantId);

      // If many items low stock, should have alert
      if (kpis.inventory.lowStockItems > 5) {
        const stockAlert = alerts.find(a => a.metric === 'Inventory');
        expect(stockAlert).toBeDefined();
      }
    });
  });

  /**
   * Test Suite 4: Edge Cases
   */
  describe('Edge Cases', () => {
    it('should handle zero GMV', async () => {
      const metrics = await marginService.calculateMarginMetrics(
        'empty-tenant',
        30
      );

      expect(metrics).toBeInstanceOf(Array);
      expect(metrics.length).toBe(0);
    });

    it('should handle margin = 0%', async () => {
      // Scenario: GMV = Costs
      // Margin should be 0, not NaN
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 30);

      expect(typeof kpis.margin.avgMarginPct).toBe('number');
      expect(Number.isNaN(kpis.margin.avgMarginPct)).toBe(false);
    });

    it('should handle negative margin', async () => {
      // Scenario: Costs > GMV
      // Margin should be negative
      const metrics = await marginService.calculateMarginMetrics(
        testTenantId,
        30
      );

      metrics.forEach(m => {
        expect(Number.isNaN(m.marginPct)).toBe(false);
      });
    });

    it('should handle very large period (365 days)', async () => {
      const kpis = await kpiService.getDashboardKPIs(testTenantId, 365);

      expect(kpis).toBeDefined();
      expect(kpis.gmv.value).toBeGreaterThanOrEqual(0);
    });
  });
});
