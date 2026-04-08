import { Module } from '@nestjs/common';
import { FamilyHarmonyController } from './family-harmony.controller';
import { FamilyHarmonyAdminController } from './family-harmony.admin.controller';
import { FamilyHarmonyService } from './family-harmony.service';

@Module({
  controllers: [FamilyHarmonyController, FamilyHarmonyAdminController],
  providers: [FamilyHarmonyService],
  exports: [FamilyHarmonyService],
})
export class FamilyHarmonyModule {}
