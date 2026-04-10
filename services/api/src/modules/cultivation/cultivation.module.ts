import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CultivationAccessService } from './cultivation-access.service';
import { CultivationAccessController } from './cultivation-access.controller';
import { CultivationAdminController } from './cultivation-admin.controller';
import { FulfillmentService } from './fulfillment.service';
import { FulfillmentController } from './fulfillment.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    CultivationAccessController,
    CultivationAdminController,
    FulfillmentController,
  ],
  providers: [CultivationAccessService, FulfillmentService],
  exports: [CultivationAccessService, FulfillmentService],
})
export class CultivationModule {}
