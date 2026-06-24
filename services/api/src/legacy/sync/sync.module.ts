// services/api/src/sync/sync.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InventorySyncService } from './inventory.sync.service';
import { OrdersSyncService } from './orders.sync.service';
import { CategoryMappingService } from './category-mapping.service';
import { SyncQueueService } from './sync-queue.service';
import { SyncController } from './sync.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * STEP 21-30: Synchronization Module
 * Bundles inventory, orders, category mapping, and queue services
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  providers: [
    InventorySyncService,
    OrdersSyncService,
    CategoryMappingService,
    SyncQueueService,
  ],
  controllers: [SyncController],
  exports: [
    InventorySyncService,
    OrdersSyncService,
    CategoryMappingService,
    SyncQueueService,
  ],
})
export class SyncModule {}
