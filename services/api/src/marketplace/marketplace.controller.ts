// services/api/src/marketplace/marketplace.controller.ts

import { Controller, Get, Post, Body, Query, Redirect, BadRequestException } from '@nestjs/common';
import { MercadoLivreService } from './mercado-livre.service';
import { ShopeeService } from './shopee.service';
import { PricingService } from './pricing.service';

/**
 * Marketplace API endpoints
 * OAuth callbacks, webhooks, pricing endpoints
 */
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private mlService: MercadoLivreService,
    private shopeeService: ShopeeService,
    private pricingService: PricingService
  ) {}

  /**
   * STEP 41: Mercado Livre OAuth
   */

  @Get('mercado-livre/auth')
  mercadoLivreAuth(@Query('tenantId') tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId required');
    }
    const authUrl = this.mlService.getAuthUrl(tenantId);
    return { success: true, authUrl };
  }

  @Get('mercado-livre/callback')
  @Redirect()
  async mercadoLivreCallback(
    @Query('code') code?: string,
    @Query('state') state?: string
  ) {
    if (!code || !state) {
      throw new BadRequestException('Missing code or state');
    }

    try {
      const tenantId = atob(state).split(':')[0];
      const token = await this.mlService.exchangeCodeForToken(code);

      // TODO: Save token to database
      // await this.credentialsService.saveMercadoLivreToken(tenantId, token);

      return {
        url: `/dashboard/${tenantId}?auth=success&marketplace=mercado_livre`,
      };
    } catch (error) {
      return {
        url: `/dashboard?auth=failed&error=${encodeURIComponent(String(error))}`,
      };
    }
  }

  @Post('mercado-livre/webhook')
  async mercadoLivreWebhook(@Body() payload: any) {
    // TODO: Extract tenantId from webhook
    const tenantId = 'tenant-123';
    await this.mlService.handleWebhook(tenantId, payload);

    return { success: true };
  }

  /**
   * STEP 42: Shopee OAuth
   */

  @Get('shopee/auth')
  shopeeAuth(@Query('tenantId') tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId required');
    }
    const authUrl = this.shopeeService.getAuthUrl(tenantId);
    return { success: true, authUrl };
  }

  @Get('shopee/callback')
  @Redirect()
  async shopeeCallback(
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('shop_id') shopId?: string
  ) {
    if (!code || !state || !shopId) {
      throw new BadRequestException('Missing code, state, or shop_id');
    }

    try {
      const tenantId = atob(state).split(':')[0];
      const token = await this.shopeeService.exchangeCodeForToken(code, shopId);

      // TODO: Save token to database
      // await this.credentialsService.saveShopeeToken(tenantId, token, shopId);

      return {
        url: `/dashboard/${tenantId}?auth=success&marketplace=shopee`,
      };
    } catch (error) {
      return {
        url: `/dashboard?auth=failed&error=${encodeURIComponent(String(error))}`,
      };
    }
  }

  @Post('shopee/webhook')
  async shopeeWebhook(@Body() payload: any) {
    // TODO: Extract tenantId from webhook
    const tenantId = 'tenant-123';
    await this.shopeeService.handleWebhook(tenantId, payload);

    return { success: true };
  }

  /**
   * STEP 43: Dynamic Pricing
   */

  @Post('pricing/calculate')
  async calculateDynamicPrice(
    @Body()
    payload: {
      tenantId: string;
      productVariantId: string;
      marketplace: string;
      strategy: {
        type: 'static' | 'dynamic' | 'competitive';
        minPrice: number;
        minMargin: number;
      };
    }
  ) {
    const dynamicPrice = await this.pricingService.calculateDynamicPrice(
      payload.tenantId,
      payload.productVariantId,
      payload.marketplace,
      payload.strategy
    );

    return {
      success: true,
      data: dynamicPrice,
    };
  }

  @Get('pricing/recommendations')
  async getPriceRecommendations(
    @Query('tenantId') tenantId?: string,
    @Query('days') days: string = '30'
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId required');
    }

    const recommendations = await this.pricingService.getPriceRecommendations(
      tenantId,
      parseInt(days)
    );

    return {
      success: true,
      data: recommendations,
    };
  }

  @Post('pricing/simulate')
  async simulatePriceChange(
    @Body()
    payload: {
      tenantId: string;
      productVariantId: string;
      newPrice: number;
      elasticity?: number;
    }
  ) {
    const simulation = await this.pricingService.simulatePriceChange(
      payload.tenantId,
      payload.productVariantId,
      payload.newPrice,
      payload.elasticity
    );

    return {
      success: true,
      data: simulation,
    };
  }
}
