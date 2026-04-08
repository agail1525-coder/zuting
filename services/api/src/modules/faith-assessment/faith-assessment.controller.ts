import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

import { FaithAssessmentService } from './faith-assessment.service';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('faith-assessment')
@Controller('faith-assessment')
export class FaithAssessmentController {
  constructor(private readonly service: FaithAssessmentService) {}

  @Public()
  @Get('questions')
  @ApiOperation({ summary: '获取评估题目' })
  @ApiQuery({ name: 'mode', enum: ['PERSONAL', 'FAMILY', 'ENTERPRISE'] })
  getQuestions(@Query('mode') mode: string) {
    const validModes = ['PERSONAL', 'FAMILY', 'ENTERPRISE'];
    if (!validModes.includes(mode)) mode = 'PERSONAL';
    return this.service.getQuestions(mode);
  }

  @Public()
  @Post('submit')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: '提交评估答案' })
  submitAssessment(
    @Body() dto: SubmitAssessmentDto,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.service.submitAssessment(dto, userId, sessionId);
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: '公开统计数据' })
  getStats() {
    return this.service.getStats();
  }

  @Public()
  @Get('results/:id')
  @ApiOperation({ summary: '获取评估结果' })
  getResult(@Param('id') id: string) {
    return this.service.getResult(id);
  }

  @Get('my-results')
  @ApiOperation({ summary: '我的评估历史' })
  getMyResults(
    @Req() req: any,
    @Query('page') page?: string,
  ) {
    return this.service.getMyResults(req.user.id, Number(page) || 1);
  }
}
