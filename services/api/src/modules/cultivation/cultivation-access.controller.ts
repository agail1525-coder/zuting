import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CultivationAccessService } from './cultivation-access.service';
import {
  GenerateInviteDto,
  RedeemInviteDto,
  SubmitApplicationDto,
} from './dto/apply.dto';
import { CultivationRoles } from './decorators/cultivation-roles.decorator';
import { CultivationRoleGuard } from './guards/cultivation-role.guard';

@ApiTags('cultivation-access')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cultivation')
export class CultivationAccessController {
  constructor(private readonly service: CultivationAccessService) {}

  @Post('apply')
  @Throttle({ default: { limit: 10, ttl: 86_400_000 } })
  @ApiOperation({ summary: '提交修行资格申请 (10/day)' })
  apply(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitApplicationDto,
  ) {
    return this.service.submitApplication(userId, dto);
  }

  @Get('apply/mine')
  @ApiOperation({ summary: '查询自己的申请状态 + 资格信息' })
  mine(@CurrentUser('id') userId: string) {
    return this.service.getMyApplication(userId);
  }

  @Post('invite/redeem')
  @Throttle({ default: { limit: 10, ttl: 86_400_000 } })
  @ApiOperation({ summary: '使用邀请码兑换修行资格' })
  redeem(
    @CurrentUser('id') userId: string,
    @Body() dto: RedeemInviteDto,
  ) {
    return this.service.redeemInvite(userId, dto);
  }

  @Post('invite/generate')
  @UseGuards(CultivationRoleGuard)
  @CultivationRoles('MENTOR', 'MASTER')
  @ApiOperation({ summary: '导师生成邀请码 (本月上限 5 张)' })
  generate(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateInviteDto,
  ) {
    return this.service.generateInvites(userId, dto);
  }

  @Get('invite/mine')
  @UseGuards(CultivationRoleGuard)
  @CultivationRoles('MENTOR', 'MASTER')
  @ApiOperation({ summary: '我发出的邀请码' })
  myInvites(@CurrentUser('id') userId: string) {
    return this.service.listMyInvites(userId);
  }
}
