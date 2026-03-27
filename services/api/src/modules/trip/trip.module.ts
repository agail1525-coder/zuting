import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripStateMachine } from '../../common/trip-state-machine';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [TripController],
  providers: [TripService, TripStateMachine],
  exports: [TripService, TripStateMachine],
})
export class TripModule {}
