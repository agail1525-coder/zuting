import { Module } from '@nestjs/common';
import { TeamCultureController } from './team-culture.controller';
import { TeamCultureAdminController } from './team-culture.admin.controller';
import { TeamCultureService } from './team-culture.service';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';

@Module({
  controllers: [TeamCultureController, TeamCultureAdminController],
  providers: [TeamCultureService, TeamMemberGuard, TeamAdminGuard],
  exports: [TeamCultureService],
})
export class TeamCultureModule {}
