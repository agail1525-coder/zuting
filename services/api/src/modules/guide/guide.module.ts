import { Module } from '@nestjs/common';
import { GuideController } from './guide.controller';
import { GuideService } from './guide.service';
import { AiCommunityModule } from '../ai-community/ai-community.module';

@Module({
  imports: [AiCommunityModule],
  controllers: [GuideController],
  providers: [GuideService],
  exports: [GuideService],
})
export class GuideModule {}
