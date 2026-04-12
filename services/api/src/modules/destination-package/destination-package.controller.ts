import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PackageCategory, PackageTier } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { DestinationPackageService } from './destination-package.service';
import {
  CreateDestinationPackageDto,
  UpdateDestinationPackageDto,
} from './dto/destination-package.dto';

const TIERS = ['LUXURY', 'BUSINESS', 'STANDARD', 'BUDGET'] as const;
const CATEGORIES = [
  'HOTEL',
  'RESTAURANT',
  'TRANSPORT',
  'EXPERIENCE',
  'SHOPPING',
  'GUIDE',
  'GROUND_TEAM',
] as const;

class PublicListQuery {
  @IsOptional() @IsString() holySiteId?: string;
  @IsOptional() @IsString() routeId?: string;
  @IsOptional() @IsEnum(TIERS as unknown as object) tier?: PackageTier;
}

class AdminListQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @IsString() holySiteId?: string;
  @IsOptional() @IsEnum(TIERS as unknown as object) tier?: PackageTier;
  @IsOptional() @IsEnum(CATEGORIES as unknown as object) category?: PackageCategory;
}

@ApiTags('destination-packages')
@Controller('destination-packages')
export class DestinationPackageController {
  constructor(private readonly service: DestinationPackageService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Public: list packages by holySiteId or routeId, optional tier' })
  async list(@Query() q: PublicListQuery) {
    if (q.holySiteId) return this.service.listByHolySite(q.holySiteId, q.tier);
    if (q.routeId) return this.service.listByRoute(q.routeId, q.tier);
    return [];
  }

  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: paginated list with filters' })
  async adminList(@Query() q: AdminListQuery) {
    return this.service.adminList({
      page: q.page ?? 1,
      limit: q.limit ?? 20,
      holySiteId: q.holySiteId,
      tier: q.tier,
      category: q.category,
    });
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateDestinationPackageDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateDestinationPackageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
