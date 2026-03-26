import { Module } from '@nestjs/common';
import { HolySiteController } from './holy-site.controller';
import { HolySiteService } from './holy-site.service';

@Module({
  controllers: [HolySiteController],
  providers: [HolySiteService],
})
export class HolySiteModule {}
