import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { AdminMemberController } from './admin-member.controller';
import { MembershipService } from './membership.service';

@Module({
  controllers: [MembershipController, AdminMemberController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
