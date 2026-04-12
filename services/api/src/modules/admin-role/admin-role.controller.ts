import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRoleService } from './admin-role.service';

class CreateRoleDto {
  @IsString() @MaxLength(64) name!: string;
  @IsOptional() @IsString() @MaxLength(200) description?: string;
  @IsArray() @IsString({ each: true }) permissions!: string[];
}

class UpdateRoleDto {
  @IsOptional() @IsString() @MaxLength(200) description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) permissions?: string[];
}

@ApiTags('admin-roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/roles')
export class AdminRoleController {
  constructor(private readonly service: AdminRoleService) {}

  @Get()
  @ApiOperation({ summary: '角色列表' })
  list() {
    return this.service.list();
  }

  @Get('permissions')
  @ApiOperation({ summary: '全部可分配的权限字典' })
  permissions() {
    return this.service.listPermissions();
  }

  @Post('seed')
  @ApiOperation({ summary: '种入系统角色（幂等）' })
  seed() {
    return this.service.seedSystemRoles();
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
