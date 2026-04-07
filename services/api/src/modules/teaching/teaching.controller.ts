import { Controller, Get, Post, Patch, Delete, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TeachingService } from './teaching.service';
import { CreateTeachingDto } from './dto/create-teaching.dto';
import { UpdateTeachingDto } from './dto/update-teaching.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReligionFilterQueryDto } from '../../common/dto/religion-filter-query.dto';

@ApiTags('teachings')
@Controller('teachings')
export class TeachingController {
  constructor(private readonly teachingService: TeachingService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取所有祖训 / Get all teachings' })
  @ApiQuery({ name: 'religionId', required: false })
  findAll(
    @Query() query: ReligionFilterQueryDto,
  ) {
    return this.teachingService.findAll(query.religionId, query.page, query.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取祖训详情' })
  async findById(@Param('id') id: string) {
    const teaching = await this.teachingService.findById(id);
    if (!teaching) throw new NotFoundException();
    return teaching;
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建祖训 / Create teaching (admin)' })
  create(@Body() dto: CreateTeachingDto) {
    return this.teachingService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新祖训 / Update teaching (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateTeachingDto) {
    return this.teachingService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除祖训 / Delete teaching (admin)' })
  remove(@Param('id') id: string) {
    return this.teachingService.remove(id);
  }
}
