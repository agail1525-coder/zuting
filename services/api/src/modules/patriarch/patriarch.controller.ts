import { Controller, Get, Post, Patch, Delete, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PatriarchService } from './patriarch.service';
import { CreatePatriarchDto } from './dto/create-patriarch.dto';
import { UpdatePatriarchDto } from './dto/update-patriarch.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('patriarchs')
@Controller('patriarchs')
export class PatriarchController {
  constructor(private readonly patriarchService: PatriarchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取所有祖师 / Get all patriarchs' })
  @ApiQuery({ name: 'religionId', required: false })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('religionId') religionId?: string,
  ) {
    return this.patriarchService.findAll(religionId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取祖师详情' })
  async findById(@Param('id') id: string) {
    const patriarch = await this.patriarchService.findById(id);
    if (!patriarch) throw new NotFoundException();
    return patriarch;
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建祖师 / Create patriarch (admin)' })
  create(@Body() dto: CreatePatriarchDto) {
    return this.patriarchService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新祖师 / Update patriarch (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdatePatriarchDto) {
    return this.patriarchService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除祖师 / Delete patriarch (admin)' })
  remove(@Param('id') id: string) {
    return this.patriarchService.remove(id);
  }
}
