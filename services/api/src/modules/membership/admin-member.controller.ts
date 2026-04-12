import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

class ListMembersDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}

class AdjustPointsDto {
  @Type(() => Number) @IsInt() @Min(-1000000) @Max(1000000) delta!: number;
  @IsString() @MaxLength(200) reason!: string;
}

@ApiTags('admin-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('members')
export class AdminMemberController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: '后台-会员列表（含用户+积分+等级）' })
  async list(@Query() q: ListMembersDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    const memberships = await this.prisma.membership.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
    });
    const mByUser = new Map(memberships.map((m) => [m.userId, m]));
    const items = users.map((u) => {
      const m = mByUser.get(u.id);
      return {
        id: u.id,
        nickname: u.nickname ?? '',
        email: u.email ?? '',
        memberLevel: m ? `LV${m.level}` : 'LV1',
        totalPoints: m?.totalPoints ?? 0,
        availablePoints: m?.availablePoints ?? 0,
        createdAt: u.createdAt.toISOString(),
      };
    });
    return { items, total, page, limit };
  }

  @Patch(':id/points')
  @ApiOperation({ summary: '后台-调整会员积分' })
  async adjust(@Param('id') userId: string, @Body() dto: AdjustPointsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('user not found');
    const m = await this.prisma.membership.upsert({
      where: { userId },
      update: {
        totalPoints: { increment: Math.max(0, dto.delta) },
        availablePoints: { increment: dto.delta },
      },
      create: {
        userId,
        level: 1,
        levelName: '文化新手',
        totalPoints: Math.max(0, dto.delta),
        availablePoints: Math.max(0, dto.delta),
      },
    });
    await this.prisma.pointsTransaction.create({
      data: {
        membershipId: m.id,
        type: dto.delta >= 0 ? 'EARN' : 'SPEND',
        amount: Math.abs(dto.delta),
        source: 'ADMIN_ADJUST',
        description: dto.reason,
      },
    }).catch(() => undefined);
    return { ok: true, availablePoints: m.availablePoints, totalPoints: m.totalPoints };
  }
}
