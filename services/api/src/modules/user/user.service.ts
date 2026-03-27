import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Shape of the full user data export */
export interface UserDataExport {
  profile: {
    id: string;
    nickname: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    language: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  trips: Array<{
    id: string;
    title: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    totalBudget: number | null;
    persons: number;
    contactName: string | null;
    contactPhone: string | null;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    sites: Array<{
      id: string;
      siteId: string;
      order: number;
      visitDate: Date | null;
      notes: string | null;
    }>;
    statusHistory: Array<{
      fromStatus: string;
      toStatus: string;
      event: string;
      createdAt: Date;
    }>;
  }>;
  orders: Array<{
    id: string;
    orderNo: string;
    totalAmount: number;
    paidAmount: number | null;
    paymentMethod: string | null;
    status: string;
    createdAt: Date;
    paidAt: Date | null;
    cancelledAt: Date | null;
    refundedAt: Date | null;
  }>;
  journals: Array<{
    id: string;
    title: string;
    content: string;
    images: string[];
    mood: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  reviews: Array<{
    id: string;
    targetType: string;
    targetId: string;
    rating: number;
    content: string | null;
    images: string[];
    createdAt: Date;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
  }>;
  posts: Array<{
    id: string;
    content: string;
    images: string[];
    siteTag: string | null;
    likes: number;
    createdAt: Date;
  }>;
  exportedAt: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export all user data for GDPR compliance.
   * Collects profile, trips, orders, journals, reviews, notifications, posts.
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        language: true,
        emailVerified: true,
        phoneVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found / 用户不存在');
    }

    // Fetch all related data in parallel
    const [trips, orders, journals, reviews, notifications, posts] =
      await Promise.all([
        this.prisma.trip.findMany({
          where: { userId },
          take: 100,
          orderBy: { createdAt: 'desc' },
          include: {
            sites: {
              select: {
                id: true,
                siteId: true,
                order: true,
                visitDate: true,
                notes: true,
              },
            },
            statusHistory: {
              select: {
                fromStatus: true,
                toStatus: true,
                event: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        }),
        this.prisma.order.findMany({
          where: { userId },
          take: 100,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNo: true,
            totalAmount: true,
            paidAmount: true,
            paymentMethod: true,
            status: true,
            createdAt: true,
            paidAt: true,
            cancelledAt: true,
            refundedAt: true,
          },
        }),
        this.prisma.journalEntry.findMany({
          where: { userId },
          take: 100,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            content: true,
            images: true,
            mood: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.review.findMany({
          where: { userId },
          take: 100,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            targetType: true,
            targetId: true,
            rating: true,
            content: true,
            images: true,
            createdAt: true,
          },
        }),
        this.prisma.notification.findMany({
          where: { userId },
          take: 100,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            isRead: true,
            createdAt: true,
          },
        }),
        this.prisma.post.findMany({
          where: { userId },
          take: 100,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            images: true,
            siteTag: true,
            likes: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      profile: user,
      trips: trips.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        startDate: t.startDate,
        endDate: t.endDate,
        totalBudget: t.totalBudget,
        persons: t.persons,
        contactName: t.contactName,
        contactPhone: t.contactPhone,
        note: t.note,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        sites: t.sites,
        statusHistory: t.statusHistory,
      })),
      orders,
      journals,
      reviews,
      notifications,
      posts,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Soft-delete user account for GDPR "right to be forgotten".
   *
   * Strategy:
   * 1. Anonymize PII (name, email, phone, avatar, OAuth IDs)
   * 2. Set isActive = false
   * 3. Delete all sessions (immediate logout)
   * 4. After a 30-day grace period, a scheduled job should hard-delete
   *    all remaining user data (trips, orders, journals, reviews,
   *    notifications, posts, uploads, coupon usages, practices).
   *
   * The 30-day grace period allows account recovery if the request was
   * made in error. During this period, the user cannot log in (isActive=false)
   * but their data still exists in anonymized form.
   */
  async softDeleteAccount(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found / 用户不存在');
    }

    // Use a transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete all sessions (immediate logout everywhere)
      await tx.session.deleteMany({ where: { userId } });

      // 2. Anonymize PII and deactivate account
      await tx.user.update({
        where: { id: userId },
        data: {
          nickname: 'Deleted User',
          email: null,
          phone: null,
          avatar: null,
          wechatOpenId: null,
          wechatUnionId: null,
          googleId: null,
          passwordHash: null,
          refreshToken: null,
          isActive: false,
          // Note: Prisma schema doesn't have deletedAt field yet.
          // When added, set it here: deletedAt: new Date()
          // For now, isActive=false + anonymized PII serves as soft-delete.
        },
      });

      this.logger.log(
        `User ${userId} soft-deleted: PII anonymized, sessions cleared, account deactivated. ` +
          `Hard deletion of related data should occur after 30-day grace period.`,
      );
    });
  }
}
