import { Module } from '@nestjs/common';
import { DestinationPackageController } from './destination-package.controller';
import { DestinationPackageService } from './destination-package.service';

@Module({
  controllers: [DestinationPackageController],
  providers: [DestinationPackageService],
  exports: [DestinationPackageService],
})
export class DestinationPackageModule {}
