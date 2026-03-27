import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const UNREAD_COUNT_PREFIX = 'notification:unread:'; // notification:unread:{userId}
const UNREAD_COUNT_TTL = 60; // 60 seconds cache

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Create a single notification */
  async create(
    userId: string,
    type: string,
    title: string,
    content: string,
    link?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, content, link },
    });
    await this.invalidateUnreadCount(userId);
    return notification;
  }

  /** Paginated list for a user */
  async findAll(
    userId: string,
    page = 1,
    limit = 20,
    unreadOnly?: boolean,
  ) {
    const take = Math.min(limit, 100);
    const where: Prisma.NotificationWhereInput = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Count unread notifications (cached in Redis for 60s) */
  async getUnreadCount(userId: string) {
    const cacheKey = `${UNREAD_COUNT_PREFIX}${userId}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) {
      return { count: parseInt(cached, 10) };
    }

    // Cache miss — query DB
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    // Store in Redis with TTL
    await this.redis.setex(cacheKey, UNREAD_COUNT_TTL, String(count));

    return { count };
  }

  /** Invalidate the cached unread count for a user */
  private async invalidateUnreadCount(userId: string) {
    await this.redis.del(`${UNREAD_COUNT_PREFIX}${userId}`);
  }

  /** Mark a single notification as read */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Cannot access this notification');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    await this.invalidateUnreadCount(userId);
    return updated;
  }

  /** Mark all notifications as read for a user */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    await this.invalidateUnreadCount(userId);
    return { updated: result.count };
  }

  /** Delete a single notification */
  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Cannot access this notification');
    }

    const deleted = await this.prisma.notification.delete({ where: { id } });
    await this.invalidateUnreadCount(userId);
    return deleted;
  }

  /** Admin: send system notification to multiple users */
  async sendSystem(
    userIds: string[],
    title: string,
    content: string,
    link?: string,
  ) {
    const data = userIds.map((userId) => ({
      userId,
      type: 'SYSTEM',
      title,
      content,
      link: link ?? null,
    }));

    const result = await this.prisma.notification.createMany({ data });
    // Invalidate cached counts for all recipients
    await Promise.all(
      userIds.map((uid) => this.invalidateUnreadCount(uid)),
    );
    return { sent: result.count };
  }

  // ─── Helper methods for specific notification types ───

  /** Notify user of trip status change */
  async notifyTripStatusChange(
    userId: string,
    tripId: string,
    tripTitle: string,
    fromStatus: string,
    toStatus: string,
  ) {
    return this.create(
      userId,
      'TRIP_STATUS',
      '行程状态更新',
      `您的行程「${tripTitle}」状态已更新: ${fromStatus} → ${toStatus}`,
      `/trips/${tripId}`,
    );
  }

  /** Notify user of successful payment */
  async notifyPaymentSuccess(
    userId: string,
    orderId: string,
    amount: number,
  ) {
    return this.create(
      userId,
      'PAYMENT',
      '支付成功',
      `支付成功! 订单 ${orderId} 已支付 ¥${(amount / 100).toFixed(2)}`,
      `/orders/${orderId}`,
    );
  }

  /** Notify user of refund result */
  async notifyRefundResult(
    userId: string,
    orderId: string,
    approved: boolean,
  ) {
    return this.create(
      userId,
      'PAYMENT',
      approved ? '退款已通过' : '退款被拒绝',
      `退款${approved ? '已通过' : '被拒绝'}`,
      `/orders/${orderId}`,
    );
  }

  /** Notify user of a new review */
  async notifyNewReview(
    userId: string,
    reviewerName: string,
    targetType: string,
    targetId: string,
  ) {
    return this.create(
      userId,
      'REVIEW',
      '收到新评价',
      `${reviewerName} 对您的${targetType}发表了新评价`,
      `/${targetType}s/${targetId}`,
    );
  }
}
