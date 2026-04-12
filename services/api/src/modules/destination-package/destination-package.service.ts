import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, PackageTier, PackageCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDestinationPackageDto,
  UpdateDestinationPackageDto,
} from './dto/destination-package.dto';

// Words forbidden by TP-06 (寺院提供 话术净化)
const FORBIDDEN_PHRASES = [
  '寺院提供',
  '寺庙提供',
  '寺院安排',
  '寺庙安排',
  '僧众提供',
  '僧人提供',
  '师父提供',
  '寺内提供',
];

@Injectable()
export class DestinationPackageService {
  constructor(private readonly prisma: PrismaService) {}

  private assertClean(text: string | undefined | null, field: string) {
    if (!text) return;
    for (const phrase of FORBIDDEN_PHRASES) {
      if (text.includes(phrase)) {
        throw new BadRequestException(
          `TP-06 violation in ${field}: contains "${phrase}" — use "请咨询当地地接服务团队" instead`,
        );
      }
    }
  }

  private validatePayload(dto: CreateDestinationPackageDto | UpdateDestinationPackageDto) {
    this.assertClean(dto.description, 'description');
    this.assertClean(dto.groundTeamNote ?? undefined, 'groundTeamNote');
    if (dto.sourceUrls && dto.sourceUrls.length < 2) {
      throw new BadRequestException('TP-01: sourceUrls must have at least 2 entries');
    }
    if (dto.priceMin !== undefined && dto.priceMax !== undefined && dto.priceMin > dto.priceMax) {
      throw new BadRequestException('priceMin must be <= priceMax');
    }
  }

  async listByHolySite(holySiteId: string, tier?: PackageTier) {
    return this.prisma.destinationPackage.findMany({
      where: { holySiteId, enabled: true, ...(tier ? { tier } : {}) },
      orderBy: [{ tier: 'asc' }, { category: 'asc' }, { priceMin: 'asc' }],
    });
  }

  async listByRoute(routeId: string, tier?: PackageTier) {
    return this.prisma.destinationPackage.findMany({
      where: { routeId, enabled: true, ...(tier ? { tier } : {}) },
      orderBy: [{ tier: 'asc' }, { category: 'asc' }, { priceMin: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.destinationPackage.findUnique({ where: { id } });
  }

  async adminList(params: {
    page: number;
    limit: number;
    holySiteId?: string;
    tier?: PackageTier;
    category?: PackageCategory;
  }) {
    const where: Prisma.DestinationPackageWhereInput = {
      ...(params.holySiteId ? { holySiteId: params.holySiteId } : {}),
      ...(params.tier ? { tier: params.tier } : {}),
      ...(params.category ? { category: params.category } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.destinationPackage.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.destinationPackage.count({ where }),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  }

  async create(dto: CreateDestinationPackageDto) {
    this.validatePayload(dto);
    return this.prisma.destinationPackage.create({
      data: {
        ...dto,
        priceAsOf: new Date(dto.priceAsOf),
        sourceLastSeenAt: new Date(dto.sourceLastSeenAt),
      },
    });
  }

  async update(id: string, dto: UpdateDestinationPackageDto) {
    this.validatePayload(dto);
    const { priceAsOf, sourceLastSeenAt, ...rest } = dto;
    return this.prisma.destinationPackage.update({
      where: { id },
      data: {
        ...rest,
        ...(priceAsOf ? { priceAsOf: new Date(priceAsOf) } : {}),
        ...(sourceLastSeenAt ? { sourceLastSeenAt: new Date(sourceLastSeenAt) } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.destinationPackage.delete({ where: { id } });
    return { ok: true };
  }
}
