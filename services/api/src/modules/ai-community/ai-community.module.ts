import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AiCommunityService } from './ai-community.service';
import { AiCommunityContentService } from './ai-community-content.service';
import { AiCommunityLlmService } from './ai-community-llm.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    AiCommunityService,
    AiCommunityContentService,
    AiCommunityLlmService,
  ],
  exports: [AiCommunityContentService, AiCommunityLlmService],
})
export class AiCommunityModule {}
