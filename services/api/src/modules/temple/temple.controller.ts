import { Controller, Get, Post, Patch, Delete, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TempleService } from './temple.service';
import { CreateTempleDto } from './dto/create-temple.dto';
import { UpdateTempleDto } from './dto/update-temple.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('temples')
@Controller('temples')
export class TempleController {
  constructor(private readonly templeService: TempleService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取所有祖庭 / Get all ancestral temples' })
  @ApiQuery({ name: 'religionId', required: false })
  findAll(@Query('religionId') religionId?: string) {
    return this.templeService.findAll(religionId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取祖庭详情' })
  async findById(@Param('id') id: string) {
    const temple = await this.templeService.findById(id);
    if (!temple) throw new NotFoundException();
    return temple;
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建祖庭 / Create temple (admin)' })
  create(@Body() dto: CreateTempleDto) {
    return this.templeService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新祖庭 / Update temple (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateTempleDto) {
    return this.templeService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除祖庭 / Delete temple (admin)' })
  remove(@Param('id') id: string) {
    return this.templeService.remove(id);
  }
}
