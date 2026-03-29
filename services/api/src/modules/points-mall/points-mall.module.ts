import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PointsMallController } from './points-mall.controller';
import { PointsMallService } from './points-mall.service';

@Module({
  imports: [PrismaModule],
  controllers: [PointsMallController],
  providers: [PointsMallService],
  exports: [PointsMallService],
})
export class PointsMallModule {}
