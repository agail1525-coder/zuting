import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

/**
 * PriceAlertCronService · 价格告警小时扫描触发器
 *
 * 对应 PRD: M24-v2 §4.4
 * 规则 PRC-03: 幂等 —— isTriggered=true 后不再重复推送。
 */
@Injectable()
export class PriceAlertCronService {
  private readonly logger = new Logger(PriceAlertCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  @Cron('0 0 * * * *', { name: 'price-alert-scan' })
  async scanAndTrigger(): Promise<void> {
    const startedAt = Date.now();
    const alerts = await this.prisma.priceAlert.findMany({
      where: { isActive: true, isTriggered: false },
      take: 500,
      orderBy: { createdAt: 'asc' },
    });

    if (alerts.length === 0) {
      this.logger.log('no pending alerts');
      return;
    }

    let triggered = 0;
    let scanned = 0;

    for (const alert of alerts) {
      scanned++;
      try {
        const latest = await this.prisma.priceSnapshot.findFirst({
          where: { entityType: alert.entityType, entityId: alert.entityId },
          orderBy: { date: 'desc' },
          select: { price: true, date: true, currency: true },
        });

        if (!latest) continue;

        if (latest.price <= alert.targetPrice) {
          await this.prisma.$transaction([
            this.prisma.priceAlert.update({
              where: { id: alert.id },
              data: {
                isTriggered: true,
                triggeredAt: new Date(),
                currentPrice: latest.price,
              },
            }),
          ]);

          await this.notification.create(
            alert.userId,
            'PRICE_ALERT',
            `${alert.entityName} 已降至目标价`,
            `您关注的 ${alert.entityName} 最新价格 ¥${(latest.price / 100).toFixed(0)},已达到目标价 ¥${(alert.targetPrice / 100).toFixed(0)}。`,
            `/prices/alerts`,
          );

          triggered++;
        }
      } catch (err) {
        this.logger.error(
          `alert ${alert.id} failed: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `scanned=${scanned} triggered=${triggered} elapsed=${Date.now() - startedAt}ms`,
    );
  }
}
