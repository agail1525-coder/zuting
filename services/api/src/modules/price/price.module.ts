import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';
import { PriceAlertCronService } from './price-alert-cron.service';
import { PriceReconcileService } from './price-reconcile.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationModule],
  controllers: [PriceController],
  providers: [PriceService, PriceAlertCronService, PriceReconcileService],
  exports: [PriceService],
})
export class PriceModule {}
