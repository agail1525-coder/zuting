import { Injectable, Logger } from '@nestjs/common';
import type { CrawlerItem, CrawlerSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Dispatcher: 将已抓取的 CrawlerItem 路由到领域实体。
 * 当前策略: 标记目标类型,等待领域模块消费(避免耦合 schema 频繁变动)。
 * HOLY_SITE → holySite (matchBy name slug)
 * MERCHANT  → merchant (matchBy name + holySite 邻近)
 * GUIDE     → guide (直接 upsert 草稿)
 * PRICE     → DestinationPackage.priceHistory (留接口)
 * NEWS      → notification 草稿
 *
 * 本版先落 targetType 标记,具体 upsert 在各领域模块里由专职 ingest 任务做,
 * 防止 dispatcher 变成超级 service。CW-47 入库前 DTO + sanitize。
 */
// CW-YT 频道 → 文化传统 slug 兜底映射 (无圣地名命中时用)
const YT_CHANNEL_TO_RELIGION_SLUG: Record<string, string> = {
  UCYGbhLeLCvI4pwm2sknjKDw: 'buddhism',         // 法鼓山
  UCQVlk_MxEj4O38usgxBm14w: 'buddhism',         // 佛光山 (占位,下方以真实 id 覆盖)
  'UCQVlk-MxEj4O38usgxBm14w': 'buddhism',
  'UC7E-LYc1wivk33iyt5bR5zQ': 'christianity',   // Vatican News
  UCVfwlh9XpX2Y_tQfjeln9QA: 'christianity',     // BibleProject
  UCNB_OaI4524fASt8h0IL8dw: 'islam',            // Mufti Menk
  UC3vHW2h22WE_pNi5WJtRIjg: 'islam',
  'UC3vHW2h22WE-pNi5WJtRIjg': 'islam',          // Yaqeen Institute
  UCcYzLCs3zrQIBVHYA1sK2sw: 'hinduism',         // Sadhguru
  UCiPJ_g02LuOgOG0ZNk5j1jA: 'tibetan-buddhism', // Dalai Lama
  UCv_oUk8x6SGHMOLrCMDNrsw: 'tibetan-buddhism',
  'UCv-oUk8x6SGHMOLrCMDNrsw': 'tibetan-buddhism', // Mingyur Rinpoche
};

type HolySiteMini = { id: string; name: string; nameEn: string };

@Injectable()
export class CrawlerDispatcherService {
  private readonly logger = new Logger(CrawlerDispatcherService.name);
  private holySiteCache: { loaded: number; sites: HolySiteMini[] } | null = null;
  private readonly HOLY_SITE_TTL_MS = 60_000;

  constructor(private readonly prisma: PrismaService) {}

  async dispatch(source: CrawlerSource, itemId: string): Promise<void> {
    const item = await this.prisma.crawlerItem.findUnique({ where: { id: itemId } });
    if (!item) return;

    let match: { targetType: string; targetId: string } | null = null;
    if (source.parser === 'youtube-rss') {
      match = await this.matchYoutube(item);
    } else {
      const t = this.pickTargetType(source);
      const existing = await this.findExistingTarget(t, item.title ?? '');
      if (existing) match = { targetType: t, targetId: existing.id };
    }

    await this.prisma.crawlerItem.update({
      where: { id: item.id },
      data: {
        status: match ? 'DISPATCHED' : 'PENDING',
        targetType: match?.targetType ?? this.pickTargetType(source),
        targetId: match?.targetId ?? null,
        dispatchedAt: match ? new Date() : null,
      },
    });
  }

  private async loadHolySites(): Promise<HolySiteMini[]> {
    const now = Date.now();
    if (this.holySiteCache && now - this.holySiteCache.loaded < this.HOLY_SITE_TTL_MS) {
      return this.holySiteCache.sites;
    }
    const sites = await this.prisma.holySite.findMany({ select: { id: true, name: true, nameEn: true } });
    this.holySiteCache = { loaded: now, sites };
    return sites;
  }

  private async matchYoutube(item: CrawlerItem): Promise<{ targetType: string; targetId: string } | null> {
    const title = (item.sanitizedTitle ?? item.title ?? '').toLowerCase();
    const desc = (item.sanitizedContent ?? item.description ?? '').toLowerCase();
    const haystack = `${title} ${desc}`;
    if (!haystack.trim()) return null;

    const sites = await this.loadHolySites();
    let best: { id: string; len: number } | null = null;
    for (const s of sites) {
      for (const candidate of [s.name, s.nameEn].filter(Boolean)) {
        const c = candidate.toLowerCase();
        if (c.length < 3) continue;
        if (haystack.includes(c) && (!best || c.length > best.len)) {
          best = { id: s.id, len: c.length };
        }
      }
    }
    if (best) return { targetType: 'holySite', targetId: best.id };

    const raw = item.raw as { channelId?: string } | null;
    const channelId = raw?.channelId;
    const slug = channelId ? YT_CHANNEL_TO_RELIGION_SLUG[channelId] : undefined;
    if (slug) {
      const rel = await this.prisma.religion.findUnique({ where: { slug }, select: { id: true } });
      if (rel) return { targetType: 'religion', targetId: rel.id };
    }
    return null;
  }

  private pickTargetType(source: CrawlerSource): string {
    switch (source.targetDomain) {
      case 'HOLY_SITE':
        return 'holySite';
      case 'MERCHANT':
        return 'merchant';
      case 'GUIDE':
        return 'guide';
      case 'PRICE':
        return 'destinationPackage';
      case 'NEWS':
        return 'notification';
      default:
        return 'unknown';
    }
  }

  private async findExistingTarget(type: string, title: string): Promise<{ id: string } | null> {
    if (!title) return null;
    const norm = title.trim();
    try {
      if (type === 'holySite') {
        return await this.prisma.holySite.findFirst({ where: { name: { contains: norm } }, select: { id: true } });
      }
      if (type === 'merchant') {
        return await this.prisma.merchant.findFirst({ where: { name: { contains: norm } }, select: { id: true } });
      }
    } catch (e) {
      this.logger.warn(`dispatch match failed type=${type}: ${String(e)}`);
    }
    return null;
  }
}
