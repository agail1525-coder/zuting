import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCrawlerSourceDto,
  UpdateCrawlerSourceDto,
} from './dto/crawler.dto';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(private readonly prisma: PrismaService) {}

  private validateSelector(selector: unknown) {
    if (!selector || typeof selector !== 'object' || Array.isArray(selector)) {
      throw new BadRequestException('selector must be an object');
    }
    const s = selector as Record<string, unknown>;
    const allowedKeys = ['list', 'title', 'price', 'images', 'coords', 'url', 'description', 'rating'];
    for (const key of Object.keys(s)) {
      if (!allowedKeys.includes(key)) {
        throw new BadRequestException(`TP-17: selector key "${key}" not in whitelist`);
      }
      if (typeof s[key] !== 'string') {
        throw new BadRequestException(`selector.${key} must be a CSS selector string`);
      }
      const val = s[key] as string;
      if (val.toLowerCase().includes('javascript:') || val.includes('eval(')) {
        throw new BadRequestException(`TP-17: selector.${key} contains forbidden token`);
      }
    }
  }

  private validateHttpUrl(url: string) {
    try {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) {
        throw new BadRequestException('TP-19: URL must use http(s)');
      }
    } catch {
      throw new BadRequestException('baseUrl must be a valid URL');
    }
  }

  async listSources(params: { enabled?: boolean; page: number; limit: number }) {
    const where: Prisma.CrawlerSourceWhereInput = {
      ...(params.enabled !== undefined ? { enabled: params.enabled } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.crawlerSource.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.crawlerSource.count({ where }),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  }

  async getSource(id: string) {
    return this.prisma.crawlerSource.findUnique({ where: { id } });
  }

  async createSource(createdBy: string, dto: CreateCrawlerSourceDto) {
    this.validateSelector(dto.selector);
    this.validateHttpUrl(dto.baseUrl);
    return this.prisma.crawlerSource.create({
      data: {
        name: dto.name,
        baseUrl: dto.baseUrl,
        type: dto.type,
        schedule: dto.schedule ?? '0 3 * * *',
        selector: dto.selector as Prisma.InputJsonValue,
        parser: dto.parser,
        rateLimitMs: dto.rateLimitMs ?? 1000,
        enabled: dto.enabled ?? true,
        createdBy,
      },
    });
  }

  async updateSource(id: string, dto: UpdateCrawlerSourceDto) {
    if (dto.selector !== undefined) this.validateSelector(dto.selector);
    if (dto.baseUrl) this.validateHttpUrl(dto.baseUrl);
    const { selector, ...rest } = dto;
    return this.prisma.crawlerSource.update({
      where: { id },
      data: {
        ...rest,
        ...(selector !== undefined ? { selector: selector as Prisma.InputJsonValue } : {}),
      },
    });
  }

  async deleteSource(id: string) {
    await this.prisma.crawlerSource.delete({ where: { id } });
    return { ok: true };
  }

  async runSource(sourceId: string, triggeredBy = 'MANUAL') {
    const source = await this.prisma.crawlerSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new BadRequestException('source not found');
    if (!source.enabled) throw new BadRequestException('source is disabled');

    const run = await this.prisma.crawlerRun.create({
      data: { sourceId, status: 'RUNNING', triggeredBy },
    });

    const finished = await this.prisma.crawlerRun.update({
      where: { id: run.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        itemsFound: 0,
        errorLog: 'stub: real fetcher not yet wired',
      },
    });

    await this.prisma.crawlerSource.update({
      where: { id: sourceId },
      data: { lastRunAt: new Date(), lastStatus: 'SUCCESS' },
    });

    return finished;
  }

  async listRuns(params: { sourceId?: string; page: number; limit: number }) {
    const where: Prisma.CrawlerRunWhereInput = {
      ...(params.sourceId ? { sourceId: params.sourceId } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.crawlerRun.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.crawlerRun.count({ where }),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  }

  async listAlerts(params: { acknowledged?: boolean; page: number; limit: number }) {
    const where: Prisma.PackagePriceAlertWhereInput = {
      ...(params.acknowledged !== undefined ? { acknowledged: params.acknowledged } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.packagePriceAlert.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { detectedAt: 'desc' },
      }),
      this.prisma.packagePriceAlert.count({ where }),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  }

  async acknowledgeAlert(id: string, note?: string) {
    return this.prisma.packagePriceAlert.update({
      where: { id },
      data: { acknowledged: true, note },
    });
  }
}
