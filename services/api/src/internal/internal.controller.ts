import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Marketplace, OperatingScenario, TenantSegment } from '@prisma/client';
import { InternalService } from './internal.service';

@Controller('api/v1/internal')
export class InternalController {
  constructor(private readonly internal: InternalService) {}

  @Get('tenants')
  listTenants(@Query('segment') segment?: TenantSegment) {
    return this.internal.listTenants(segment);
  }

  @Post('tenants')
  createTenant(
    @Body()
    body: {
      name: string;
      cnpj?: string;
      segment: TenantSegment;
      scenario: OperatingScenario;
      status?: string;
    },
  ) {
    return this.internal.createTenant(body);
  }

  @Get('tenants/:id')
  getTenant(@Param('id') id: string) {
    return this.internal.getTenantDetail(id);
  }

  @Patch('tenants/:id')
  updateTenant(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      cnpj: string;
      segment: TenantSegment;
      scenario: OperatingScenario;
      status: string;
    }>,
  ) {
    return this.internal.updateTenant(id, body);
  }

  @Get('products')
  listProducts(@Query('tenantId') tenantId?: string) {
    return this.internal.listProducts(tenantId);
  }

  @Post('products')
  createProduct(
    @Body()
    body: {
      tenantId: string;
      sku: string;
      name: string;
      description?: string;
      category?: string;
      marketplace: Marketplace;
    },
  ) {
    return this.internal.createProduct(body);
  }

  @Get('metrics')
  listMetrics(
    @Query('tenantId') tenantId?: string,
    @Query('productId') productId?: string,
  ) {
    return this.internal.listMetrics(tenantId, productId);
  }

  @Post('metrics')
  createMetric(
    @Body()
    body: {
      tenantId: string;
      productId: string;
      marketplace: Marketplace;
      periodStart: string;
      periodEnd: string;
      impressions: number;
      visits: number;
      unitsSold: number;
      revenue: number;
      searchPosition?: number;
      notes?: string;
      conversionRate?: number;
    },
  ) {
    return this.internal.createMetric({
      ...body,
      periodStart: new Date(body.periodStart),
      periodEnd: new Date(body.periodEnd),
    });
  }

  @Get('insights')
  listInsights(@Query('tenantId') tenantId?: string) {
    return this.internal.listInsights(tenantId);
  }

  @Post('insights')
  createInsight(
    @Body()
    body: {
      tenantId: string;
      productId?: string;
      title: string;
      body: string;
      visibleToClient: boolean;
      weekOf?: string;
    },
  ) {
    return this.internal.createInsight({
      ...body,
      weekOf: body.weekOf ? new Date(body.weekOf) : undefined,
    });
  }

  @Patch('insights/:id')
  updateInsight(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      body: string;
      visibleToClient: boolean;
      weekOf: string;
      productId: string;
    }>,
  ) {
    return this.internal.updateInsight(id, {
      ...body,
      weekOf: body.weekOf ? new Date(body.weekOf) : undefined,
    });
  }

  @Get('overview')
  overview() {
    return this.internal.overview();
  }
}
