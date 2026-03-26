import { Module } from '@nestjs/common';
import { PatriarchController } from './patriarch.controller';
import { PatriarchService } from './patriarch.service';

@Module({
  controllers: [PatriarchController],
  providers: [PatriarchService],
})
export class PatriarchModule {}
