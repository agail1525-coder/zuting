import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminAiService } from './admin-ai.service';
import {
  CommandDto,
  ContentGenDto,
  InsightDto,
  ModerateDto,
  PromptLabRunDto,
  SeoDto,
  TranslateDto,
} from './dto/admin-ai.dto';

@ApiTags('admin-ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/ai')
export class AdminAiController {
  constructor(private readonly service: AdminAiService) {}

  @Post('translate')
  @ApiOperation({ summary: 'AI 7 语言批译' })
  translate(@Body() dto: TranslateDto, @CurrentUser('id') adminId: string) {
    return this.service.translate(dto, adminId);
  }

  @Post('content/generate')
  @ApiOperation({ summary: 'AI 字段文案生成' })
  contentGenerate(@Body() dto: ContentGenDto, @CurrentUser('id') adminId: string) {
    return this.service.contentGenerate(dto, adminId);
  }

  @Post('seo')
  @ApiOperation({ summary: 'AI SEO meta' })
  seo(@Body() dto: SeoDto, @CurrentUser('id') adminId: string) {
    return this.service.seo(dto, adminId);
  }

  @Post('moderate')
  @ApiOperation({ summary: 'AI 内容审核' })
  moderate(@Body() dto: ModerateDto, @CurrentUser('id') adminId: string) {
    return this.service.moderate(dto, adminId);
  }

  @Post('insight')
  @ApiOperation({ summary: 'AI 数据洞察（NL → 归因）' })
  insight(@Body() dto: InsightDto, @CurrentUser('id') adminId: string) {
    return this.service.insight(dto, adminId);
  }

  @Post('command')
  @ApiOperation({ summary: 'Cmd+K 命令解析' })
  command(@Body() dto: CommandDto, @CurrentUser('id') adminId: string) {
    return this.service.command(dto, adminId);
  }

  @Post('prompt-lab/run')
  @ApiOperation({ summary: 'Prompt Lab 实验运行' })
  promptLab(@Body() dto: PromptLabRunDto, @CurrentUser('id') adminId: string) {
    return this.service.promptLabRun(dto, adminId);
  }

  @Get('traces')
  @ApiOperation({ summary: 'AI 操作日志' })
  traces(
    @Query('scenario') scenario?: string,
    @Query('adminId') adminId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.listTraces({
      scenario,
      adminId,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Post('traces/:id/approve')
  @ApiOperation({ summary: '标记 AI 输出已审核' })
  approveTrace(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.service.approve(id, adminId);
  }
}
