import { Module } from '@nestjs/common';
import { PersonalGrowthController } from './personal-growth.controller';
import { PersonalGrowthAdminController } from './personal-growth.admin.controller';
import { PersonalGrowthService } from './personal-growth.service';

@Module({
  controllers: [PersonalGrowthController, PersonalGrowthAdminController],
  providers: [PersonalGrowthService],
  exports: [PersonalGrowthService],
})
export class PersonalGrowthModule {}
