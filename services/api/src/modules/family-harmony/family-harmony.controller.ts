import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FamilyHarmonyService } from './family-harmony.service';
import { Public } from '../auth/decorators/public.decorator';
import { SubmitFamilyInquiryDto } from './dto/submit-inquiry.dto';

@ApiTags('family-harmony')
@Controller('family-harmony')
export class FamilyHarmonyController {
  constructor(private readonly service: FamilyHarmonyService) {}

  @Get('themes')
  @Public()
  @ApiOperation({ summary: '家庭和谐主题包列表 / Family harmony themes' })
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
  @ApiOperation({ summary: '家庭故事列表 / Family stories' })
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
  @ApiOperation({ summary: '故事详情 / Story detail' })
  @ApiParam({ name: 'slug' })
  getCase(@Param('slug') slug: string) {
    return this.service.getCaseBySlug(slug);
  }

  @Post('inquiries')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: '提交家庭咨询 / Submit family inquiry (5/min)' })
  submitInquiry(@Body() dto: SubmitFamilyInquiryDto) {
    return this.service.submitInquiry(dto);
  }
}
