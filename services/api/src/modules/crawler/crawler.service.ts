import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import * as cheerio from 'cheerio';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ssrfFilter = require('ssrf-req-filter') as (url: string) => http.Agent;
import * as http from 'http';
import * as https from 'https';
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

  private fetchHtml(url: string, timeoutMs = 15000): Promise<string> {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol)) {
        return reject(new Error('TP-19: non-http(s) protocol'));
      }
      const lib = u.protocol === 'https:' ? https : http;
      const agent = ssrfFilter(url);
      const req = lib.request(
        url,
        {
          method: 'GET',
          agent,
          timeout: timeoutMs,
          headers: {
            'User-Agent': 'JoinusBot/1.0 (+https://joinus.com/bot)',
            Accept: 'text/html,application/xhtml+xml',
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const chunks: Buffer[] = [];
          let total = 0;
          res.on('data', (c: Buffer) => {
            total += c.length;
            if (total > 5 * 1024 * 1024) {
              req.destroy(new Error('TP-17: response >5MB'));
              return;
            }
            chunks.push(c);
          });
          res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          res.on('error', reject);
        },
      );
      req.on('timeout', () => req.destroy(new Error('timeout')));
      req.on('error', reject);
      req.end();
    });
  }

  private parseWithSelector(html: string, selector: Record<string, string>) {
    const $ = cheerio.load(html);
    const listSel = selector.list;
    if (!listSel) return [];
    const items: Array<Record<string, string>> = [];
    $(listSel).each((_, el) => {
      const row: Record<string, string> = {};
      for (const [key, css] of Object.entries(selector)) {
        if (key === 'list') continue;
        const node = $(el).find(css).first();
        row[key] = (node.text() || node.attr('href') || node.attr('src') || '').trim();
      }
      items.push(row);
    });
    return items;
  }

  async runSource(sourceId: string, triggeredBy = 'MANUAL') {
    const source = await this.prisma.crawlerSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new BadRequestException('source not found');
    if (!source.enabled) throw new BadRequestException('source is disabled');

    const run = await this.prisma.crawlerRun.create({
      data: { sourceId, status: 'RUNNING', triggeredBy },
    });

    try {
      this.validateHttpUrl(source.baseUrl);
      const html = await this.fetchHtml(source.baseUrl);
      const selector = (source.selector as Record<string, string>) || {};
      const items = this.parseWithSelector(html, selector);

      const finished = await this.prisma.crawlerRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          itemsFound: items.length,
          errorLog: items.length > 0 ? null : 'no items matched selector',
        },
      });

      await this.prisma.crawlerSource.update({
        where: { id: sourceId },
        data: { lastRunAt: new Date(), lastStatus: 'SUCCESS' },
      });
      return finished;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`crawler run failed sourceId=${sourceId}: ${msg}`);
      const failed = await this.prisma.crawlerRun.update({
        where: { id: run.id },
        data: { status: 'FAILED', finishedAt: new Date(), errorLog: msg.slice(0, 2000) },
      });
      await this.prisma.crawlerSource.update({
        where: { id: sourceId },
        data: { lastRunAt: new Date(), lastStatus: 'FAILED' },
      });
      return failed;
    }
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

  // TP-15: 每日 03:00 定时抓取所有启用的爬虫源
  @Cron('0 3 * * *')
  async dailyRunAll() {
    const sources = await this.prisma.crawlerSource.findMany({ where: { enabled: true } });
    this.logger.log(`[CRON] dailyRunAll triggering ${sources.length} source(s)`);
    for (const s of sources) {
      try {
        await this.runSource(s.id, 'CRON');
        await new Promise((r) => setTimeout(r, s.rateLimitMs ?? 1000));
      } catch (e) {
        this.logger.warn(`CRON run failed for ${s.name}: ${String(e)}`);
      }
    }
  }
}
