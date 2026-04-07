import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TeamCultureService } from './team-culture.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitInquiryDto } from './dto/submit-inquiry.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { TeamMemberGuard } from './guards/team-member.guard';
import { TeamAdminGuard } from './guards/team-admin.guard';

@ApiTags('team-culture')
@Controller('team-culture')
export class TeamCultureController {
  constructor(private readonly service: TeamCultureService) {}

  // ── Public ──────────────────────────────────────────────
  @Get('themes')
  @Public()
  @ApiOperation({ summary: '主题包列表 / List culture themes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  listThemes(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.listThemes(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 12,
    );
  }

  @Get('themes/:slug')
  @Public()
  @ApiOperation({ summary: '主题详情 / Theme detail' })
  @ApiParam({ name: 'slug' })
  getTheme(@Param('slug') slug: string) {
    return this.service.getThemeBySlug(slug);
  }

  @Get('cases')
  @Public()
  @ApiOperation({ summary: '案例列表 / Public cases' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  listCases(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.listCases(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 12,
    );
  }

  @Get('cases/:slug')
  @Public()
  @ApiOperation({ summary: '案例详情 / Case detail' })
  @ApiParam({ name: 'slug' })
  getCase(@Param('slug') slug: string) {
    return this.service.getCaseBySlug(slug);
  }

  @Post('inquiries')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: '提交询价 / Submit inquiry (rate-limited 5/min/IP)' })
  submitInquiry(@Body() dto: SubmitInquiryDto) {
    return this.service.submitInquiry(dto);
  }

  // ── Authenticated: my teams ─────────────────────────────
  @Get('teams/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我所属的团队列表' })
  myTeams(@CurrentUser('id') userId: string) {
    return this.service.getMyTeams(userId);
  }

  @Post('teams')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建团队 (创建者自动成为 OWNER)' })
  createTeam(@CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.service.createTeam(userId, dto);
  }

  @Post('teams/join/:token')
  @ApiBearerAuth()
  @ApiOperation({ summary: '通过邀请 token 加入团队' })
  @ApiParam({ name: 'token' })
  acceptInvite(@CurrentUser('id') userId: string, @Param('token') token: string) {
    return this.service.acceptInvite(token, userId);
  }

  // ── Team-scoped (Member-only) ───────────────────────────
  @Get('teams/:id')
  @UseGuards(TeamMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '团队详情' })
  @ApiParam({ name: 'id' })
  getTeam(@Param('id') id: string) {
    return this.service.getTeam(id);
  }

  @Get('teams/:id/members')
  @UseGuards(TeamMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '团队成员列表' })
  @ApiParam({ name: 'id' })
  listMembers(@Param('id') id: string) {
    return this.service.listMembers(id);
  }

  @Get('teams/:id/certificates')
  @UseGuards(TeamMemberGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '团队证书列表' })
  @ApiParam({ name: 'id' })
  listCertificates(@Param('id') id: string) {
    return this.service.listCertificates(id);
  }

  // ── Team-scoped (Admin/Owner) ───────────────────────────
  @Patch('teams/:id')
  @UseGuards(TeamAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新团队资料 (Owner/Admin)' })
  @ApiParam({ name: 'id' })
  updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.service.updateTeam(id, dto);
  }

  @Post('teams/:id/members/invite')
  @UseGuards(TeamAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '生成邀请链接 (Owner/Admin)' })
  @ApiParam({ name: 'id' })
  invite(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.service.createInvite(id, userId, dto);
  }
}
