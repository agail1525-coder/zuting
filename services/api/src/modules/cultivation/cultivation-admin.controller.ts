import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CultivationAccessService } from './cultivation-access.service';
import {
  GrantAccessDto,
  RejectApplicationDto,
  ReviewApplicationDto,
  RevokeAccessDto,
} from './dto/apply.dto';

@ApiTags('admin-cultivation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/cultivation')
export class CultivationAdminController {
  constructor(private readonly service: CultivationAccessService) {}

  @Get('applications')
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiOperation({ summary: '修行资格申请列表' })
  list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listApplications(
      status,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Post('applications/:id/approve')
  @ApiOperation({ summary: '通过申请' })
  approve(
    @Param('id') id: string,
    @CurrentUser('id') operatorId: string,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.service.approveApplication(id, operatorId, dto);
  }

  @Post('applications/:id/reject')
  @ApiOperation({ summary: '拒绝申请' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') operatorId: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.service.rejectApplication(id, operatorId, dto);
  }

  @Post('grant')
  @ApiOperation({ summary: '直接授权 (绕过申请)' })
  grant(@CurrentUser('id') operatorId: string, @Body() dto: GrantAccessDto) {
    return this.service.grantAccess(operatorId, dto);
  }

  @Post('revoke')
  @ApiOperation({ summary: '撤销修行资格' })
  revoke(@CurrentUser('id') operatorId: string, @Body() dto: RevokeAccessDto) {
    return this.service.revokeAccess(operatorId, dto);
  }
}
