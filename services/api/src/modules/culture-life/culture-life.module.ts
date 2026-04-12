import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { CultureLifeController } from './culture-life.controller';
import { CultureLifeService } from './culture-life.service';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CultureLifeController],
  providers: [CultureLifeService],
  exports: [CultureLifeService],
})
export class CultureLifeModule {}
