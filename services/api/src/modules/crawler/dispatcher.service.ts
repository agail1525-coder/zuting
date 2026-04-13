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
@Injectable()
export class CrawlerDispatcherService {
  private readonly logger = new Logger(CrawlerDispatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  async dispatch(source: CrawlerSource, itemId: string): Promise<void> {
    const item = await this.prisma.crawlerItem.findUnique({ where: { id: itemId } });
    if (!item) return;

    const targetType = this.pickTargetType(source);
    const existing = await this.findExistingTarget(targetType, item.title ?? '');

    await this.prisma.crawlerItem.update({
      where: { id: item.id },
      data: {
        status: existing ? 'DISPATCHED' : 'PENDING',
        targetType,
        targetId: existing?.id ?? null,
        dispatchedAt: existing ? new Date() : null,
      },
    });
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
