import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripPlannerService } from './trip-planner.service';
import { TripStateMachine } from '../../common/trip-state-machine';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule, ConfigModule],
  controllers: [TripController],
  providers: [TripService, TripPlannerService, TripStateMachine],
  exports: [TripService, TripStateMachine],
})
export class TripModule {}
