import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PackageService } from './package.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BookPackageDto } from './dto/book-package.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackageQueryDto } from './dto/package-query.dto';

@ApiTags('packages')
@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  // ─── Static routes BEFORE :id ──────────────────────────────────────────────

  @Get('my-bookings')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的套餐预订 / My package bookings' })
  getMyBookings(
    @CurrentUser('id') userId: string,
    @Query() pagination: PackageQueryDto,
  ) {
    return this.packageService.getMyBookings(
      userId,
      pagination.page,
      pagination.limit,
    );
  }

  // ─── Admin create (POST / before :id routes) ─────────────────────────────

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] 创建套餐 / Create package' })
  adminCreate(@Body() dto: CreatePackageDto) {
    return this.packageService.adminCreate(dto);
  }

  // ─── Public listing ────────────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: '套餐列表 / List packages (public)' })
  findAll(@Query() query: PackageQueryDto) {
    return this.packageService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '套餐详情 / Package detail (public)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(id);
  }

  @Post(':id/book')
  @ApiBearerAuth()
  @ApiOperation({ summary: '预订套餐 / Book a package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  book(
    @Param('id') packageId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BookPackageDto,
  ) {
    return this.packageService.book(userId, packageId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] 更新套餐 / Update package' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  adminUpdate(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePackageDto>,
  ) {
    return this.packageService.adminUpdate(id, dto);
  }
}
