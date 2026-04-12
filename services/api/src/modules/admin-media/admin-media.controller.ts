import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminMediaService } from './admin-media.service';
import {
  AiGenerateImageDto,
  CreateMediaAssetDto,
  ListMediaQueryDto,
  UpdateMediaAssetDto,
} from './dto/admin-media.dto';

@ApiTags('admin-media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly service: AdminMediaService) {}

  @Get()
  @ApiOperation({ summary: '媒体库列表' })
  list(@Query() query: ListMediaQueryDto) {
    return this.service.list(query);
  }

  @Post()
  @ApiOperation({ summary: '登记媒体资产' })
  create(@Body() dto: CreateMediaAssetDto, @CurrentUser('id') adminId: string) {
    return this.service.create(dto, adminId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新元数据/alt/tags' })
  update(@Param('id') id: string, @Body() dto: UpdateMediaAssetDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/ai-describe')
  @ApiOperation({ summary: 'AI 生成 alt + description' })
  aiDescribe(@Param('id') id: string) {
    return this.service.aiDescribe(id);
  }

  @Post('ai-generate')
  @ApiOperation({ summary: 'AI 文生图' })
  aiGenerate(@Body() dto: AiGenerateImageDto, @CurrentUser('id') adminId: string) {
    return this.service.aiGenerate(dto, adminId);
  }

  @Get(':id/references')
  @ApiOperation({ summary: '查媒体引用' })
  references(@Param('id') id: string) {
    return this.service.getReferences(id);
  }
}
