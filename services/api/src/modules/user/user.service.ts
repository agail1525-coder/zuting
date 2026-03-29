import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
   * List users with pagination, search, and filtering (admin only).
   */
  async listUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { page, limit, search, role, isActive } = params;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { nickname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          nickname: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { trips: true, orders: true, journals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Admin update user role or active status.
   */
  async adminUpdateUser(
    userId: string,
    data: { role?: string; isActive?: boolean },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found / 用户不存在');
    }

    const updateData: Record<string, unknown> = {};
    if (data.role !== undefined) {
      updateData.role = data.role;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nickname: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

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
   * Get or auto-create UserProfile for authenticated user.
   * Includes computed stats from the profile record.
   */
  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true, email: true, avatar: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found / 用户不存在');

    let profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: { userId },
      });
    }

    return { ...user, profile };
  }

  /**
   * Update UserProfile fields for authenticated user.
   */
  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    // Ensure profile exists
    await this.getMyProfile(userId);

    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        location: dto.location,
        avatar: dto.avatar,
      },
    });

    // Also update avatar on User record if provided
    if (dto.avatar) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: dto.avatar },
      });
    }

    return profile;
  }

  /**
   * Get public profile for a user (no private data).
   */
  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        _count: { select: { trips: true, journals: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found / 用户不存在');

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: {
        displayName: true,
        avatar: true,
        bio: true,
        location: true,
        pilgrimLevel: true,
        totalTrips: true,
        totalSites: true,
        guideCount: true,
        reviewCount: true,
        followerCount: true,
        followingCount: true,
      },
    });

    return { ...user, profile };
  }

  /**
   * Get paginated published guides for a user.
   */
  async getUserGuides(userId: string, page: number, limit: number) {
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.guide.findMany({
        where: { userId, status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          coverImage: true,
          viewCount: true,
          likeCount: true,
          commentCount: true,
          publishedAt: true,
          createdAt: true,
          tags: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.guide.count({ where: { userId, status: 'PUBLISHED' } }),
    ]);

    return { data, total, page, limit: take };
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
