import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminAiController } from './admin-ai.controller';
import { AdminAiService } from './admin-ai.service';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';

@Module({
  imports: [PrismaModule, AdminAuditModule],
  controllers: [AdminAiController],
  providers: [AdminAiService],
  exports: [AdminAiService],
})
export class AdminAiModule {}
