import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';

@ApiTags('moderation')
@Controller('reports')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交举报 / Submit content report' })
  create(
    @CurrentUser('id') reporterId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.moderationService.createReport(reporterId, dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '举报列表 / Admin list reports' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'REVIEWED', 'DISMISSED'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moderationService.findAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      status,
    );
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '举报统计 / Admin report stats' })
  getStats() {
    return this.moderationService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '举报详情 / Admin view report detail' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  findOne(@Param('id') id: string) {
    return this.moderationService.findOne(id);
  }

  @Patch(':id/review')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核举报 / Admin review report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  review(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewReportDto,
  ) {
    return this.moderationService.review(id, reviewerId, dto.action);
  }
}
