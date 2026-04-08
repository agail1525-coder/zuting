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
import { PersonalGrowthService } from './personal-growth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('admin/personal-growth')
@Controller('admin/personal-growth')
@ApiBearerAuth()
@Roles('ADMIN')
export class PersonalGrowthAdminController {
  constructor(private readonly service: PersonalGrowthService) {}

  @Get('inquiries')
  @ApiOperation({ summary: '咨询列表 (Admin)' })
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
  @ApiOperation({ summary: '更新咨询状态 (Admin)' })
  @ApiParam({ name: 'id' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') operatorId: string,
    @Body() dto: { toStatus: string; note?: string },
  ) {
    return this.service.adminUpdateInquiryStatus(id, operatorId, dto);
  }

  @Post('themes')
  @ApiOperation({ summary: '创建/更新主题包 (Admin)' })
  upsertTheme(@Body() dto: Record<string, unknown>) {
    return this.service.adminUpsertTheme(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: '个人成长统计 (Admin)' })
  stats() {
    return this.service.adminStats();
  }
}
