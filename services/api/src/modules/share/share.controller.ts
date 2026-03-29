import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('shares')
@Controller('shares')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Record a share event',
    description:
      '记录一次社交分享事件。登录用户自动关联userId，未登录也可记录。\n\n' +
      'Record a social sharing event. Authenticated users are auto-linked; anonymous sharing is also supported.',
  })
  @ApiResponse({ status: 201, description: 'Share event recorded. / 分享事件已记录。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  create(
    @Body() dto: CreateShareDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.shareService.create(dto, userId);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get share statistics (Admin only)',
    description:
      '获取分享统计数据，按平台和实体类型分组。仅管理员可访问。\n\n' +
      'Retrieve share statistics grouped by platform and entity type. Admin access only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Share statistics. / 分享统计数据。',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 1024 },
        byPlatform: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string', example: 'WECHAT' },
              count: { type: 'number', example: 512 },
            },
          },
        },
        byEntityType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entityType: { type: 'string', example: 'HOLY_SITE' },
              count: { type: 'number', example: 300 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only. / 仅管理员可访问。' })
  getStats() {
    return this.shareService.getStats();
  }

  @Get('popular')
  @Public()
  @ApiOperation({
    summary: 'Get most shared entities (top 10)',
    description:
      '获取最热门的分享实体（前10名）。公开接口。\n\n' +
      'Retrieve the top 10 most shared entities. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top 10 most shared entities. / 前10热门分享实体。',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entityType: { type: 'string', example: 'TEMPLE' },
          entityId: { type: 'string', example: 'clx5abc0001ab12cd34ef56' },
          shareCount: { type: 'number', example: 88 },
        },
      },
    },
  })
  getPopular() {
    return this.shareService.getPopular();
  }
}
