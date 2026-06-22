import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MarginService } from './margin.service';
import { KpiService } from './kpi.service';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService, MarginService, KpiService],
  exports: [DashboardService, MarginService, KpiService],
})
export class DashboardModule {}
