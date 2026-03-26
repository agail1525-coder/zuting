import { Module } from '@nestjs/common';
import { XiaohongController } from './xiaohong.controller';
import { XiaohongService } from './xiaohong.service';

@Module({
  controllers: [XiaohongController],
  providers: [XiaohongService],
  exports: [XiaohongService],
})
export class XiaohongModule {}
