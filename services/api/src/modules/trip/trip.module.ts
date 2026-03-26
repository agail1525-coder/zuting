import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripStateMachine } from '../../common/trip-state-machine';

@Module({
  controllers: [TripController],
  providers: [TripService, TripStateMachine],
  exports: [TripService, TripStateMachine],
})
export class TripModule {}
