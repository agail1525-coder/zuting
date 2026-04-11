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
import { ScriptureService } from './scripture.service';
import { ScriptureController } from './scripture.controller';
import { ScriptureLearningService } from './scripture-learning.service';
import { PkbService } from './pkb.service';
import { PkbController } from './pkb.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    CultivationAccessController,
    CultivationAdminController,
    FulfillmentController,
    ZenQuizController,
    ScriptureController,
    PkbController,
  ],
  providers: [
    CultivationAccessService,
    FulfillmentService,
    ZenQuizService,
    ScriptureService,
    ScriptureLearningService,
    PkbService,
  ],
  exports: [CultivationAccessService, FulfillmentService, ScriptureService, PkbService],
})
export class CultivationModule {}
