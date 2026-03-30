import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body,
  NotFoundException, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SealService } from './seal.service';
import { CreateSealDto } from './dto/create-seal.dto';
import { UpdateSealDto } from './dto/update-seal.dto';
import type { SealSeries } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

const SEAL_SERIES_VALUES = ['CHUYIN', 'ZHONGYIN', 'YINGUOYIN', 'CHENGDAOYIN', 'GUIYUANYIN'];

@ApiTags('seals')
@Controller('seals')
export class SealController {
  constructor(private readonly sealService: SealService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取所有三十印 / Get all 30 seals' })
  @ApiQuery({ name: 'series', required: false, enum: SEAL_SERIES_VALUES })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('series') series?: string,
  ) {
    return this.sealService.findAll(series as SealSeries, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取单个印详情' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const seal = await this.sealService.findById(id);
    if (!seal) throw new NotFoundException();
    return seal;
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: '创建印' })
  create(@Body() dto: CreateSealDto) {
    return this.sealService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新印' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSealDto) {
    const seal = await this.sealService.findById(id);
    if (!seal) throw new NotFoundException();
    return this.sealService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '删除印' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const seal = await this.sealService.findById(id);
    if (!seal) throw new NotFoundException();
    return this.sealService.delete(id);
  }
}
