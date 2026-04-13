import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCrawlerSourceDto,
  UpdateCrawlerSourceDto,
} from './dto/crawler.dto';
import { pickAdapter } from './adapters';
import { sha256, titleNormalize } from './adapters/http-util';
import { CrawlerDispatcherService } from './dispatcher.service';

const ALLOWED_DOMAINS = ['HOLY_SITE', 'MERCHANT', 'PRICE', 'GUIDE', 'NEWS'];
const ALLOWED_CHANNELS = ['OFFICIAL', 'WIKI', 'OTA', 'MAP', 'UGC', 'MEDIA'];
const ALLOWED_STRATEGIES = ['HTTP', 'BROWSER', 'API', 'LLM'];

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatcher: CrawlerDispatcherService,
  ) {}

  // ---------- 校验 ----------

  private validateSelector(selector: unknown) {
    if (!selector || typeof selector !== 'object' || Array.isArray(selector)) {
      throw new BadRequestException('selector must be an object');
    }
    const allowedKeys = ['list', 'title', 'price', 'images', 'coords', 'url', 'description', 'rating', 'query'];
    for (const [k, v] of Object.entries(selector as Record<string, unknown>)) {
      if (!allowedKeys.includes(k)) throw new BadRequestException(`CW-17: selector key "${k}" not in whitelist`);
      if (typeof v !== 'string') throw new BadRequestException(`selector.${k} must be string`);
      if ((v as string).toLowerCase().includes('javascript:') || (v as string).includes('eval(')) {
        throw new BadRequestException(`CW-17: selector.${k} forbidden token`);
      }
    }
  }

  private validateHttpUrl(url: string) {
    try {
      const u = new URL(url);
      if (!['http:', 'https:', 'file:'].includes(u.protocol)) {
        throw new BadRequestException('CW-41: URL must be http(s) or file:');
      }
    } catch {
      throw new BadRequestException('baseUrl must be valid URL');
    }
  }

  private validateEnum(field: string, value: string | undefined, allowed: string[]) {
    if (value && !allowed.includes(value)) {
      throw new BadRequestException(`${field} must be one of ${allowed.join(',')}`);
    }
  }

  // ---------- CRUD ----------

  async listSources(params: { enabled?: boolean; domain?: string; channel?: string; page: number; limit: number }) {
    const where: Prisma.CrawlerSourceWhereInput = {
      ...(params.enabled !== undefined ? { enabled: params.enabled } : {}),
      ...(params.domain ? { targetDomain: params.domain } : {}),
      ...(params.channel ? { channel: params.channel } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.crawlerSource.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      }),
      this.prisma.crawlerSource.count({ where }),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  }

  getSource(id: string) {
    return this.prisma.crawlerSource.findUnique({ where: { id } });
  }

  async createSource(createdBy: string, dto: CreateCrawlerSourceDto) {
    this.validateSelector(dto.selector);
    this.validateHttpUrl(dto.baseUrl);
    this.validateEnum('targetDomain', dto.targetDomain, ALLOWED_DOMAINS);
    this.validateEnum('channel', dto.channel, ALLOWED_CHANNELS);
    this.validateEnum('strategy', dto.strategy, ALLOWED_STRATEGIES);
    return this.prisma.crawlerSource.create({
      data: {
        key: dto.key,
        name: dto.name,
        baseUrl: dto.baseUrl,
        type: dto.type,
        targetDomain: dto.targetDomain ?? 'MERCHANT',
        channel: dto.channel ?? 'OFFICIAL',
        priority: dto.priority ?? 3,
        strategy: dto.strategy ?? 'HTTP',
        proxyNeeded: dto.proxyNeeded ?? false,
        notes: dto.notes,
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
    this.validateEnum('targetDomain', dto.targetDomain, ALLOWED_DOMAINS);
    this.validateEnum('channel', dto.channel, ALLOWED_CHANNELS);
    this.validateEnum('strategy', dto.strategy, ALLOWED_STRATEGIES);
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

  // ---------- 抓取核心 ----------

  async runSource(sourceId: string, triggeredBy = 'MANUAL') {
    const source = await this.prisma.crawlerSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new BadRequestException('source not found');
    if (!source.enabled && triggeredBy === 'CRON') {
      throw new BadRequestException('CW-50: disabled source skipped by CRON');
    }

    const run = await this.prisma.crawlerRun.create({
      data: { sourceId, status: 'RUNNING', triggeredBy },
    });

    const adapter = pickAdapter(source);
    if (!adapter) {
      return this.finishFail(run.id, sourceId, 'no adapter matched source (check channel/strategy)');
    }

    try {
      const raw = await adapter.fetch(source);
      const extracted = adapter.extract(raw, source);
      const limit = Math.min(extracted.length, 50);

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (let i = 0; i < limit; i++) {
        const item = extracted[i];
        if (!item.title) {
          skipped++;
          continue;
        }
        const dedupKey = sha256(`${source.id}|${item.externalUrl}|${titleNormalize(item.title)}`);
        const existing = await this.prisma.crawlerItem.findUnique({ where: { dedupKey } });
        if (existing) {
          skipped++;
          continue;
        }
        const createdItem = await this.prisma.crawlerItem.create({
          data: {
            sourceId: source.id,
            externalUrl: item.externalUrl.slice(0, 1000),
            dedupKey,
            title: item.title.slice(0, 500),
            description: item.description?.slice(0, 8000),
            imageUrls: (item.imageUrls ?? []).slice(0, 10),
            raw: item.raw as Prisma.InputJsonValue,
          },
        });
        created++;
        // Dispatch 后台路由标记,不阻塞抓取
        this.dispatcher.dispatch(source, createdItem.id).catch((e) => {
          this.logger.warn(`dispatch fail item=${createdItem.id}: ${String(e)}`);
        });
      }

      await this.prisma.crawlerRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          itemsFound: extracted.length,
          itemsCreated: created,
          itemsUpdated: updated,
          itemsSkipped: skipped,
        },
      });

      await this.prisma.crawlerSource.update({
        where: { id: sourceId },
        data: {
          lastRunAt: new Date(),
          lastStatus: 'SUCCESS',
          consecutiveFails: 0,
          healthScore: Math.min(1, (source.healthScore ?? 1) * 0.9 + 0.1),
        },
      });

      return this.prisma.crawlerRun.findUnique({ where: { id: run.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`crawler run failed id=${sourceId}: ${msg.slice(0, 200)}`);
      return this.finishFail(run.id, sourceId, msg, source.consecutiveFails + 1);
    }
  }

  private async finishFail(runId: string, sourceId: string, msg: string, nextFails?: number) {
    const source = await this.prisma.crawlerSource.findUnique({ where: { id: sourceId } });
    const fails = nextFails ?? (source?.consecutiveFails ?? 0) + 1;
    // CW-45: 3 次停用
    const shouldDisable = fails >= 3;
    await this.prisma.crawlerRun.update({
      where: { id: runId },
      data: { status: 'FAILED', finishedAt: new Date(), errorLog: msg.slice(0, 2000) },
    });
    await this.prisma.crawlerSource.update({
      where: { id: sourceId },
      data: {
        lastRunAt: new Date(),
        lastStatus: 'FAILED',
        consecutiveFails: fails,
        healthScore: Math.max(0, (source?.healthScore ?? 1) * 0.7),
        ...(shouldDisable ? { enabled: false } : {}),
      },
    });
    return this.prisma.crawlerRun.findUnique({ where: { id: runId } });
  }

  // ---------- 查询 ----------

  async listRuns(params: { sourceId?: string; page: number; limit: number }) {
    const where: Prisma.CrawlerRunWhereInput = { ...(params.sourceId ? { sourceId: params.sourceId } : {}) };
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

  async listItems(params: { sourceId?: string; status?: string; page: number; limit: number }) {
    const where: Prisma.CrawlerItemWhereInput = {
      ...(params.sourceId ? { sourceId: params.sourceId } : {}),
      ...(params.status ? { status: params.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.crawlerItem.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { fetchedAt: 'desc' },
      }),
      this.prisma.crawlerItem.count({ where }),
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

  acknowledgeAlert(id: string, note?: string) {
    return this.prisma.packagePriceAlert.update({
      where: { id },
      data: { acknowledged: true, note },
    });
  }

  // ---------- 健康 & 覆盖 ----------

  async healthScan() {
    const sources = await this.prisma.crawlerSource.findMany({
      orderBy: [{ priority: 'desc' }, { healthScore: 'asc' }],
    });
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const rows = await Promise.all(
      sources.map(async (s) => {
        const recent = await this.prisma.crawlerRun.findMany({
          where: { sourceId: s.id, startedAt: { gte: since } },
          select: { status: true, startedAt: true, finishedAt: true, itemsCreated: true },
        });
        const success = recent.filter((r) => r.status === 'SUCCESS').length;
        const total = recent.length;
        const successRate = total === 0 ? null : success / total;
        const lastSuccess = recent.find((r) => r.status === 'SUCCESS')?.startedAt ?? null;
        const avgMs =
          recent.length === 0
            ? null
            : recent
                .filter((r) => r.finishedAt)
                .reduce((acc, r) => acc + (r.finishedAt!.getTime() - r.startedAt.getTime()), 0) /
              Math.max(1, recent.filter((r) => r.finishedAt).length);
        return {
          id: s.id,
          key: s.key,
          name: s.name,
          domain: s.targetDomain,
          channel: s.channel,
          priority: s.priority,
          enabled: s.enabled,
          healthScore: s.healthScore,
          consecutiveFails: s.consecutiveFails,
          lastRunAt: s.lastRunAt,
          lastStatus: s.lastStatus,
          successRate,
          avgMs,
          lastSuccess,
          status: pickHealthStatus(successRate, s.consecutiveFails),
        };
      }),
    );
    return { generatedAt: new Date(), total: rows.length, rows };
  }

  async generateCoverageSnapshot() {
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const snapshots: Array<Prisma.CrawlerCoverageSnapshotCreateManyInput> = [];
    for (const d of ALLOWED_DOMAINS) {
      for (const c of ALLOWED_CHANNELS) {
        const sources = await this.prisma.crawlerSource.findMany({
          where: { targetDomain: d, channel: c },
          select: { id: true, enabled: true, healthScore: true },
        });
        const active = sources.filter((s) => s.enabled).length;
        const avgHealth = sources.length === 0 ? 0 : sources.reduce((a, s) => a + s.healthScore, 0) / sources.length;
        const itemsLast24h =
          sources.length === 0
            ? 0
            : await this.prisma.crawlerItem.count({
                where: { sourceId: { in: sources.map((s) => s.id) }, fetchedAt: { gte: since } },
              });
        snapshots.push({
          domain: d,
          channel: c,
          sourceCount: sources.length,
          activeCount: active,
          itemsLast24h,
          avgHealth,
          status: pickCoverageStatus(sources.length, active, avgHealth),
        });
      }
    }
    await this.prisma.crawlerCoverageSnapshot.createMany({ data: snapshots });
    return { generatedAt: new Date(), grids: snapshots.length, snapshots };
  }

  async getLatestCoverage() {
    const latest = await this.prisma.crawlerCoverageSnapshot.findFirst({ orderBy: { takenAt: 'desc' } });
    if (!latest) return { takenAt: null, snapshots: [] };
    const snapshots = await this.prisma.crawlerCoverageSnapshot.findMany({
      where: { takenAt: latest.takenAt },
      orderBy: [{ domain: 'asc' }, { channel: 'asc' }],
    });
    return { takenAt: latest.takenAt, snapshots };
  }

  // ---------- 批量跑 ----------

  async runMatrix(filter: { domain?: string; channel?: string; minPriority?: number } = {}, triggeredBy = 'MANUAL') {
    const where: Prisma.CrawlerSourceWhereInput = {
      enabled: true,
      ...(filter.domain ? { targetDomain: filter.domain } : {}),
      ...(filter.channel ? { channel: filter.channel } : {}),
      ...(filter.minPriority ? { priority: { gte: filter.minPriority } } : {}),
    };
    const sources = await this.prisma.crawlerSource.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { healthScore: 'desc' }],
    });
    this.logger.log(`[matrix] running ${sources.length} sources (domain=${filter.domain ?? '*'} channel=${filter.channel ?? '*'})`);
    const results: Array<{ id: string; name: string; ok: boolean; error?: string }> = [];
    for (const s of sources) {
      try {
        await this.runSource(s.id, triggeredBy);
        results.push({ id: s.id, name: s.name, ok: true });
      } catch (e) {
        results.push({ id: s.id, name: s.name, ok: false, error: String(e).slice(0, 200) });
      }
      // CW-43: 同站串行 + 速率限制
      await new Promise((r) => setTimeout(r, s.rateLimitMs ?? 1000));
    }
    return { total: sources.length, results };
  }

  // ---------- CRON 多级 ----------

  // T1 高优先源 (priority≥4) 每 6 小时
  @Cron('0 0 */6 * * *')
  async cronT1() {
    this.logger.log('[CRON-T1] priority≥4, every 6h');
    await this.runMatrix({ minPriority: 4 }, 'CRON');
  }

  // T2/T3 全量每日 03:00 (覆盖 priority 1-3)
  @Cron('0 3 * * *')
  async cronDaily() {
    this.logger.log('[CRON-DAILY] all enabled sources');
    await this.runMatrix({}, 'CRON');
  }

  // 覆盖快照 每日 04:00
  @Cron('0 4 * * *')
  async cronCoverage() {
    this.logger.log('[CRON-COVERAGE] generating daily coverage snapshot');
    await this.generateCoverageSnapshot();
  }
}

function pickHealthStatus(successRate: number | null, consecutiveFails: number): string {
  if (consecutiveFails >= 3) return 'DEAD';
  if (successRate === null) return 'UNKNOWN';
  if (successRate >= 0.9) return 'HEALTHY';
  if (successRate >= 0.5) return 'WARNING';
  return 'CRITICAL';
}

function pickCoverageStatus(total: number, active: number, avgHealth: number): string {
  if (total === 0) return 'EMPTY';
  if (active === 0) return 'DISABLED';
  if (avgHealth >= 0.7) return 'HEALTHY';
  if (avgHealth >= 0.4) return 'WARNING';
  return 'CRITICAL';
}
