import { Controller, Get, Param, Query, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SealService } from './seal.service';
import type { SealSeries } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

const SEAL_SERIES_VALUES = ['CHUYIN', 'ZHONGYIN', 'YINGUOYIN', 'CHENGDAOYIN', 'GUIYUANYIN'];

@ApiTags('seals')
@Controller('seals')
@Public()
export class SealController {
  constructor(private readonly sealService: SealService) {}

  @Get()
  @ApiOperation({ summary: '获取所有三十印 / Get all 30 seals' })
  @ApiQuery({ name: 'series', required: false, enum: SEAL_SERIES_VALUES })
  findAll(@Query('series') series?: string) {
    return this.sealService.findAll(series as SealSeries);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个印详情' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const seal = await this.sealService.findById(id);
    if (!seal) throw new NotFoundException();
    return seal;
  }
}
