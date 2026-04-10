import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { CultivationAccessService } from './cultivation-access.service';
import { CultivationAccessController } from './cultivation-access.controller';
import { CultivationAdminController } from './cultivation-admin.controller';
import { FulfillmentService } from './fulfillment.service';
import { FulfillmentController } from './fulfillment.controller';
import { ZenQuizService } from './zen-quiz.service';
import { ZenQuizController } from './zen-quiz.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    CultivationAccessController,
    CultivationAdminController,
    FulfillmentController,
    ZenQuizController,
  ],
  providers: [CultivationAccessService, FulfillmentService, ZenQuizService],
  exports: [CultivationAccessService, FulfillmentService],
})
export class CultivationModule {}
