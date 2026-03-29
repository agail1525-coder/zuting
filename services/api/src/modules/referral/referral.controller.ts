import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { BindInviteDto } from './dto/bind-invite.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('referral')
@Controller('referral')
@ApiBearerAuth()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('my-code')
  @ApiOperation({ summary: '获取/生成我的邀请码 / Get or create my invite code' })
  getMyCode(@CurrentUser('id') userId: string) {
    return this.referralService.getOrCreateCode(userId);
  }

  @Get('my-team')
  @ApiOperation({ summary: '我的团队 (一级+二级被邀请人) / My referral team' })
  getMyTeam(@CurrentUser('id') userId: string) {
    return this.referralService.getMyTeam(userId);
  }

  @Get('my-rewards')
  @ApiOperation({ summary: '我的返佣记录 / My referral rewards (paginated)' })
  getMyRewards(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.referralService.getMyRewards(
      userId,
      pagination.page,
      pagination.limit,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: '分销统计数据 / My distribution stats' })
  getStats(@CurrentUser('id') userId: string) {
    return this.referralService.getStats(userId);
  }

  @Post('bind')
  @ApiOperation({ summary: '绑定邀请码 (新用户) / Bind invite code' })
  bindCode(
    @CurrentUser('id') userId: string,
    @Body() dto: BindInviteDto,
  ) {
    return this.referralService.bindInviteCode(userId, dto.code);
  }

  // ─── Admin Endpoints ────────────────────────────────────────────────────────

  @Get('admin/distributors')
  @Roles('ADMIN')
  @ApiOperation({ summary: '(Admin) 分销商列表 / List all distributors' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getDistributors(@Query() pagination: PaginationQueryDto) {
    return this.referralService.getDistributors(
      pagination.page,
      pagination.limit,
    );
  }

  @Get('admin/distributors/:userId/team')
  @Roles('ADMIN')
  @ApiOperation({ summary: '(Admin) 分销商团队 / Get distributor team members' })
  @ApiParam({ name: 'userId', description: 'Distributor user ID' })
  getDistributorTeam(@Param('userId') userId: string) {
    return this.referralService.getDistributorTeam(userId);
  }
}
