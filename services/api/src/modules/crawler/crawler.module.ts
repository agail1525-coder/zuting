import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { CrawlerDispatcherService } from './dispatcher.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CrawlerController],
  providers: [CrawlerService, CrawlerDispatcherService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
