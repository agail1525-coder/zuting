import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ADMIN_ACTIONS, ADMIN_RESOURCES, buildAllPermissions, SYSTEM_ROLES } from './permissions';

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  description?: string;
  permissions?: string[];
}

@Injectable()
export class AdminRoleService {
  constructor(private readonly prisma: PrismaService) {}

  listPermissions() {
    return {
      resources: ADMIN_RESOURCES,
      actions: ADMIN_ACTIONS,
      all: buildAllPermissions(),
    };
  }

  async list() {
    return this.prisma.adminRole.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string) {
    const role = await this.prisma.adminRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async create(input: CreateRoleInput) {
    if (!input.name?.trim()) throw new BadRequestException('name required');
    return this.prisma.adminRole.create({
      data: {
        name: input.name.trim(),
        description: input.description,
        permissions: input.permissions ?? [],
      },
    });
  }

  async update(id: string, input: UpdateRoleInput) {
    const existing = await this.findOne(id);
    if (existing.isSystem) {
      throw new BadRequestException('System role cannot be modified');
    }
    return this.prisma.adminRole.update({
      where: { id },
      data: {
        description: input.description,
        permissions: input.permissions,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    if (existing.isSystem) throw new BadRequestException('System role cannot be deleted');
    return this.prisma.adminRole.delete({ where: { id } });
  }

  async seedSystemRoles() {
    for (const role of SYSTEM_ROLES) {
      const existing = await this.prisma.adminRole.findUnique({ where: { name: role.name } });
      if (!existing) {
        await this.prisma.adminRole.create({
          data: {
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            isSystem: true,
          },
        });
      }
    }
    return this.list();
  }
}
