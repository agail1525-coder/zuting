import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AdminAction, Prisma } from '@prisma/client';

export interface WriteAuditInput {
  adminId: string;
  action: AdminAction;
  resource: string;
  resourceId?: string | null;
  diff?: Prisma.InputJsonValue;
  aiTraceId?: string | null;
  ip?: string | null;
  ua?: string | null;
}

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(input: WriteAuditInput) {
    return this.prisma.adminAuditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        diff: input.diff ?? undefined,
        aiTraceId: input.aiTraceId ?? null,
        ip: input.ip ?? null,
        ua: input.ua ?? null,
      },
    });
  }

  async list(params: {
    resource?: string;
    resourceId?: string;
    adminId?: string;
    action?: AdminAction;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
    const where: Prisma.AdminAuditLogWhereInput = {};
    if (params.resource) where.resource = params.resource;
    if (params.resourceId) where.resourceId = params.resourceId;
    if (params.adminId) where.adminId = params.adminId;
    if (params.action) where.action = params.action;
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const log = await this.prisma.adminAuditLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException(`Audit log ${id} not found`);
    return log;
  }

  async listForResource(resource: string, resourceId: string) {
    return this.prisma.adminAuditLog.findMany({
      where: { resource, resourceId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
