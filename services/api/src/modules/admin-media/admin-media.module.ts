import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminMediaController } from './admin-media.controller';
import { AdminMediaService } from './admin-media.service';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';

@Module({
  imports: [PrismaModule, AdminAuditModule],
  controllers: [AdminMediaController],
  providers: [AdminMediaService],
  exports: [AdminMediaService],
})
export class AdminMediaModule {}
