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
import { PersonalGrowthService } from './personal-growth.service';
import { Public } from '../auth/decorators/public.decorator';
import { SubmitPersonalInquiryDto } from './dto/submit-inquiry.dto';

@ApiTags('personal-growth')
@Controller('personal-growth')
export class PersonalGrowthController {
  constructor(private readonly service: PersonalGrowthService) {}

  @Get('themes')
  @Public()
  @ApiOperation({ summary: '个人圆满主题包列表 / Personal fulfillment themes' })
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
  @ApiOperation({ summary: '蜕变案例列表 / Transformation cases' })
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
  @ApiOperation({ summary: '提交个人咨询 / Submit personal inquiry (5/min)' })
  submitInquiry(@Body() dto: SubmitPersonalInquiryDto) {
    return this.service.submitInquiry(dto);
  }
}
