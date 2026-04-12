import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminRoleController } from './admin-role.controller';
import { AdminRoleService } from './admin-role.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminRoleController],
  providers: [AdminRoleService],
  exports: [AdminRoleService],
})
export class AdminRoleModule {}
