import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminAuditService } from '../admin-audit/admin-audit.service';

@ApiTags('admin-scripture')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/scriptures')
export class ScriptureAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: '经论列表 (Admin)' })
  async list(
    @Query('q') q?: string,
    @Query('tradition') tradition?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    const where: Record<string, unknown> = {};
    if (tradition) where.tradition = tradition;
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
    ];
    const [items, total] = await Promise.all([
      this.prisma.scripture.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (p - 1) * ps,
        take: ps,
        include: { category: true, _count: { select: { chapters: true } } },
      }),
      this.prisma.scripture.count({ where }),
    ]);
    return { items, total, page: p, pageSize: ps };
  }

  @Get(':id')
  @ApiOperation({ summary: '经论详情 (Admin, by id)' })
  async detail(@Param('id') id: string) {
    const scripture = await this.prisma.scripture.findUnique({
      where: { id },
      include: {
        category: true,
        chapters: { orderBy: { chapterNo: 'asc' } },
      },
    });
    if (!scripture) throw new NotFoundException('Scripture not found');
    return scripture;
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新经论' })
  async update(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @CurrentUser('id') adminId: string,
  ) {
    const before = await this.prisma.scripture.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Scripture not found');
    const updated = await this.prisma.scripture.update({
      where: { id },
      data: data as never,
    });
    await this.audit.write({
      adminId,
      action: 'UPDATE',
      resource: 'scripture',
      resourceId: id,
      diff: { before, after: updated } as never,
    });
    return updated;
  }

  @Post()
  @ApiOperation({ summary: '创建经论' })
  async create(
    @Body() data: Record<string, unknown>,
    @CurrentUser('id') adminId: string,
  ) {
    const created = await this.prisma.scripture.create({ data: data as never });
    await this.audit.write({
      adminId,
      action: 'CREATE',
      resource: 'scripture',
      resourceId: created.id,
      diff: { after: created } as never,
    });
    return created;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除经论' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    const before = await this.prisma.scripture.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Scripture not found');
    await this.prisma.scripture.delete({ where: { id } });
    await this.audit.write({
      adminId,
      action: 'DELETE',
      resource: 'scripture',
      resourceId: id,
      diff: { before } as never,
    });
    return { id };
  }
}
