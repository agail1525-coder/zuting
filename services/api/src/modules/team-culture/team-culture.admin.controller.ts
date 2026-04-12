import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TeamCultureService } from './team-culture.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { UpsertThemeDto } from './dto/upsert-theme.dto';
import { UpsertCaseDto } from './dto/upsert-case.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';

@ApiTags('admin-team-culture')
@Controller('admin/team-culture')
@Roles('ADMIN')
@ApiBearerAuth()
export class TeamCultureAdminController {
  constructor(private readonly service: TeamCultureService) {}

  @Get('inquiries')
  @ApiOperation({ summary: 'Admin: 询价线索列表' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  listInquiries(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.adminListInquiries(
      status,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Patch('inquiries/:id/status')
  @ApiOperation({ summary: 'Admin: 流转询价状态' })
  @ApiParam({ name: 'id' })
  updateInquiryStatus(
    @Param('id') id: string,
    @CurrentUser('id') operatorId: string,
    @Body() dto: UpdateInquiryStatusDto,
  ) {
    return this.service.adminUpdateInquiryStatus(id, operatorId, dto);
  }

  @Get('themes')
  @ApiOperation({ summary: 'Admin: 主题包列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  listThemes(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.listThemes(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 50,
    );
  }

  @Get('themes/:slug')
  @ApiOperation({ summary: 'Admin: 主题详情 by slug' })
  @ApiParam({ name: 'slug' })
  getTheme(@Param('slug') slug: string) {
    return this.service.getThemeBySlug(slug);
  }

  @Post('themes')
  @ApiOperation({ summary: 'Admin: 创建/更新主题包' })
  upsertTheme(@Body() dto: UpsertThemeDto) {
    return this.service.adminUpsertTheme(dto);
  }

  @Post('cases')
  @ApiOperation({ summary: 'Admin: 创建/更新案例' })
  upsertCase(@Body() dto: UpsertCaseDto) {
    return this.service.adminUpsertCase(dto);
  }

  @Post('certificates')
  @ApiOperation({ summary: 'Admin: 签发证书' })
  issueCertificate(@Body() dto: IssueCertificateDto) {
    return this.service.adminIssueCertificate(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Admin: 团队文化模块统计' })
  stats() {
    return this.service.adminStats();
  }
}
