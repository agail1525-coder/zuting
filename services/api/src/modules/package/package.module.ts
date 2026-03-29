import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';

@Module({
  imports: [PrismaModule],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}
