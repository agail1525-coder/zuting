import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CultivationAccessGuard } from './guards/cultivation-access.guard';
import { ZenQuizService } from './zen-quiz.service';
import { SubmitQuizAnswerDto } from './dto/zen-quiz.dto';

@ApiTags('cultivation-zen-quiz')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CultivationAccessGuard)
@Controller('cultivation/zen-quiz')
export class ZenQuizController {
  constructor(private readonly service: ZenQuizService) {}

  @Get('today')
  @ApiOperation({ summary: '获取/生成今日禅修考核 (10题)' })
  today(@CurrentUser('id') userId: string) {
    return this.service.getTodayQuiz(userId);
  }

  @Post('answer')
  @Throttle({ default: { limit: 30, ttl: 3_600_000 } })
  @ApiOperation({ summary: '提交单题答案 → AI评分' })
  answer(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitQuizAnswerDto,
  ) {
    return this.service.submitAnswer(userId, dto);
  }

  @Get('progress')
  @ApiOperation({ summary: '考核连击进度 + 今日状态' })
  progress(@CurrentUser('id') userId: string) {
    return this.service.getProgress(userId);
  }

  @Get('history')
  @ApiOperation({ summary: '历史考核记录' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  history(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.getHistory(
      userId,
      Math.max(1, parseInt(page || '1', 10)),
      Math.min(50, Math.max(1, parseInt(pageSize || '20', 10))),
    );
  }
}
