import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CultivationAccessGuard } from '../guards/cultivation-access.guard';
import { BhumiPathService } from './bhumi-path.service';
import type { VowSource } from './ten-bhumi.constants';

const VOW_TYPES: VowSource[] = [
  'THREE_LIVES','KARMA','SEAL','QUIZ','WISDOM','JOURNAL','REVIEW','GUIDE',
  'QUESTION','SHARE','REFERRAL','PERSONAL','FAMILY','TEAM','REFLECTION',
];

export class SubmitBhumiVowDto {
  @ApiProperty({ minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  bhumiStage!: number;

  @ApiProperty({ enum: VOW_TYPES })
  @IsString()
  vowType!: VowSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  evidenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  reflection?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 1000, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  count?: number;
}

@ApiTags('cultivation-bhumi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CultivationAccessGuard)
@Controller('cultivation/bhumi-path')
export class BhumiPathController {
  constructor(private readonly service: BhumiPathService) {}

  @Get()
  @ApiOperation({ summary: '菩萨十地当前进度' })
  get(@CurrentUser('id') userId: string) {
    return this.service.getBhumiPath(userId);
  }

  @Get('gate')
  @ApiOperation({ summary: '入地资格检查 (需十牛图圆满)' })
  gate(@CurrentUser('id') userId: string) {
    return this.service.getGate(userId);
  }

  @Post('unlock')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @ApiOperation({ summary: '发心入欢喜地 (一次性)' })
  unlock(@CurrentUser('id') userId: string) {
    return this.service.unlockBhumi(userId);
  }

  @Post('submit-vow')
  @Throttle({ default: { limit: 30, ttl: 3_600_000 } })
  @ApiOperation({ summary: '提交大愿凭证' })
  submitVow(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitBhumiVowDto,
  ) {
    return this.service.submitVow(userId, {
      bhumiStage: dto.bhumiStage,
      vowType: dto.vowType,
      evidenceId: dto.evidenceId,
      reflection: dto.reflection,
      count: dto.count,
    });
  }

  @Post('advance')
  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  @ApiOperation({ summary: '证入下一地 (需三大愿圆满)' })
  advance(@CurrentUser('id') userId: string) {
    return this.service.advanceBhumi(userId);
  }
}
