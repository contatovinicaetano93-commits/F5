import { Controller, Get, Query, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { DashboardService } from './dashboard.service';
import { MarginService } from './margin.service';
import { KpiService } from './kpi.service';

/**
 * Dashboard API endpoints
 * GET /api/v1/dashboard — Homepage com 4 KPI cards
 * GET /api/v1/dashboard/kpis — Detalhes dos KPIs
 * GET /api/v1/dashboard/margin — Painel de Margem Real por SKU (Priority KPI)
 * GET /api/v1/dashboard/alerts — Alertas consolidados
 */
@Controller('api/v1/dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private marginService: MarginService,
    private kpiService: KpiService
  ) {}

  @Get()
  async getDashboard(@Request() req: any) {
    const userId = req.user.id;
    return this.dashboardService.getDashboard(userId);
  }

  @Get('sales/recent')
  async getRecentSales(@Request() req: any) {
    const userId = req.user.id;
    return this.dashboardService.getRecentSales(userId);
  }

  /**
   * GET /api/v1/dashboard/kpis?tenantId=xxx&days=30
   * Retorna 4 KPI cards: GMV, Estoque, Pedidos, Margem
   */
  @Get('kpis')
  async getKPIs(
    @Query('tenantId') tenantId?: string,
    @Query('days') days: string = '30'
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const daysNum = Math.min(parseInt(days), 365);
    const kpis = await this.kpiService.getDashboardKPIs(tenantId, daysNum);

    return {
      success: true,
      data: kpis,
      period: `Últimos ${daysNum} dias`,
      timestamp: new Date(),
    };
  }

  /**
   * GET /api/v1/dashboard/kpis/comparison?tenantId=xxx&currentDays=30&prevDays=30
   * Comparativo período atual vs anterior
   */
  @Get('kpis/comparison')
  async getKPIsComparison(
    @Query('tenantId') tenantId?: string,
    @Query('currentDays') currentDays: string = '30',
    @Query('prevDays') prevDays: string = '30'
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const comparison = await this.kpiService.getKPIsComparison(
      tenantId,
      parseInt(currentDays),
      parseInt(prevDays)
    );

    return {
      success: true,
      data: comparison,
    };
  }

  /**
   * GET /api/v1/dashboard/margin?tenantId=xxx&days=30
   * STEP 31: Painel de Margem Real por SKU (Priority KPI)
   * Mostra: GMV - comissão - frete - devoluções - ads = Net Revenue
   */
  @Get('margin')
  async getMarginMetrics(
    @Query('tenantId') tenantId?: string,
    @Query('days') days: string = '30'
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const daysNum = Math.min(parseInt(days), 365);
    const metrics = await this.marginService.calculateMarginMetrics(
      tenantId,
      daysNum
    );

    return {
      success: true,
      data: metrics,
      period: `Últimos ${daysNum} dias`,
      timestamp: new Date(),
    };
  }

  /**
   * GET /api/v1/dashboard/margin/vs-target?tenantId=xxx&days=30
   * Comparação margem real vs meta definida em pricing_policies
   */
  @Get('margin/vs-target')
  async getMarginVsTarget(
    @Query('tenantId') tenantId?: string,
    @Query('days') days: string = '30'
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const result = await this.marginService.getMarginVsTarget(
      tenantId,
      parseInt(days)
    );

    const variance: Record<string, number> = {};
    const targets: Record<string, number> = {};

    for (const [sku, value] of result.variance.entries()) {
      variance[sku] = value;
    }

    for (const [sku, value] of result.targets.entries()) {
      targets[sku] = value;
    }

    return {
      success: true,
      data: {
        actual: result.actual,
        targets,
        variance,
      },
    };
  }

  /**
   * GET /api/v1/dashboard/margin/trend?tenantId=xxx&sku=ELETRO-001
   * Trend de margem nos últimos 7 períodos de 7 dias
   */
  @Get('margin/trend')
  async getMarginTrend(
    @Query('tenantId') tenantId?: string,
    @Query('sku') sku?: string
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const trend = await this.marginService.getMarginTrend(tenantId, sku);

    return {
      success: true,
      data: trend,
      sku: sku || 'all',
      timestamp: new Date(),
    };
  }

  /**
   * GET /api/v1/dashboard/margin/alerts?tenantId=xxx&threshold=15
   * Alertas de produtos com margem abaixo do threshold
   */
  @Get('margin/alerts')
  async getLowMarginAlerts(
    @Query('tenantId') tenantId?: string,
    @Query('threshold') threshold: string = '15'
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const alerts = await this.marginService.getLowMarginAlerts(
      tenantId,
      parseInt(threshold)
    );

    return {
      success: true,
      data: alerts,
      alertCount: alerts.length,
      timestamp: new Date(),
    };
  }

  /**
   * GET /api/v1/dashboard/alerts?tenantId=xxx
   * Consolidado de todos os alertas (KPIs + Margin)
   */
  @Get('alerts')
  async getAllAlerts(@Query('tenantId') tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const [kpiAlerts, marginAlerts] = await Promise.all([
      this.kpiService.getKPIAlerts(tenantId),
      this.marginService.getLowMarginAlerts(tenantId, 15),
    ]);

    const allAlerts = [
      ...kpiAlerts,
      ...marginAlerts.map(alert => ({
        type: alert.status as 'warning' | 'critical',
        metric: 'Margin',
        message: `${alert.productName} (${alert.sku}) - Margem ${alert.currentMargin.toFixed(1)}%`,
        value: alert.currentMargin,
      })),
    ];

    const sorted = allAlerts.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'critical' ? -1 : 1;
      }
      return 0;
    });

    return {
      success: true,
      data: sorted,
      critical: sorted.filter(a => a.type === 'critical').length,
      warnings: sorted.filter(a => a.type === 'warning').length,
      timestamp: new Date(),
    };
  }
}
