import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminAuditService } from './admin-audit.service';
import type { AdminAction } from '@prisma/client';

@ApiTags('admin-audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly service: AdminAuditService) {}

  @Get()
  @ApiOperation({ summary: '查询后台审计日志' })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiQuery({ name: 'adminId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  list(
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.list({
      resource,
      resourceId,
      adminId,
      action: action as AdminAction | undefined,
      dateFrom,
      dateTo,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Get(':resource/:id')
  @ApiOperation({ summary: '查询单个资源的历史' })
  history(@Param('resource') resource: string, @Param('id') id: string) {
    return this.service.listForResource(resource, id);
  }
}
