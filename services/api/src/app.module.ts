import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [PrismaModule, InternalModule],
})
export class AppModule {}
