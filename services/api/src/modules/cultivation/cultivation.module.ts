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
import { KarmaService } from './karma.service';
import { WisdomService } from './wisdom/wisdom.service';
import { DailyPracticeService } from './daily-practice.service';
import { DailyPracticeController } from './daily-practice.controller';
import { FestivalService } from './festival.service';
import { BhumiPathService } from './bhumi-path/bhumi-path.service';
import { BhumiPathController } from './bhumi-path/bhumi-path.controller';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    CultivationAccessController,
    CultivationAdminController,
    FulfillmentController,
    ZenQuizController,
    ScriptureController,
    PkbController,
    DailyPracticeController,
    BhumiPathController,
  ],
  providers: [
    CultivationAccessService,
    FulfillmentService,
    BhumiPathService,
    ZenQuizService,
    ScriptureService,
    ScriptureLearningService,
    PkbService,
    KarmaService,
    WisdomService,
    DailyPracticeService,
    FestivalService,
  ],
  exports: [
    CultivationAccessService,
    FulfillmentService,
    ScriptureService,
    PkbService,
    KarmaService,
    WisdomService,
    DailyPracticeService,
  ],
})
export class CultivationModule {}
