// services/api/src/marketplace/marketplace.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoLivreService } from './mercado-livre.service';
import { ShopeeService } from './shopee.service';
import { PricingService } from './pricing.service';
import { MarketplaceController } from './marketplace.controller';

/**
 * STEP 41-43: Marketplace Integration Module
 * Bundles Mercado Livre, Shopee, and Dynamic Pricing services
 */
@Module({
  imports: [PrismaModule],
  providers: [
    MercadoLivreService,
    ShopeeService,
    PricingService,
  ],
  controllers: [MarketplaceController],
  exports: [
    MercadoLivreService,
    ShopeeService,
    PricingService,
  ],
})
export class MarketplaceModule {}
