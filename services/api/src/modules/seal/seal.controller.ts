import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body,
  NotFoundException, ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SealService } from './seal.service';
import { CreateSealDto } from './dto/create-seal.dto';
import type { SealSeries } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const SEAL_SERIES_VALUES = ['CHUYIN', 'ZHONGYIN', 'YINGUOYIN', 'CHENGDAOYIN', 'GUIYUANYIN'];

@ApiTags('seals')
@Controller('seals')
export class SealController {
  constructor(private readonly sealService: SealService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取所有三十印 / Get all 30 seals' })
  @ApiQuery({ name: 'series', required: false, enum: SEAL_SERIES_VALUES })
  findAll(@Query('series') series?: string) {
    return this.sealService.findAll(series as SealSeries);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '创建印' })
  create(@Body() dto: CreateSealDto) {
    return this.sealService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新印' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateSealDto>) {
    const seal = await this.sealService.findById(id);
    if (!seal) throw new NotFoundException();
    return this.sealService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '删除印' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const seal = await this.sealService.findById(id);
    if (!seal) throw new NotFoundException();
    return this.sealService.delete(id);
  }
}
