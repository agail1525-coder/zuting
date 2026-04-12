import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStateMachine } from '../../common/trip-state-machine';
import { NotificationService } from '../notification/notification.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AddTripSiteDto } from './dto/add-trip-site.dto';

/** Map action string -> target TripStatus */
const ACTION_TARGET: Record<string, TripStatus> = {
  start_planning: TripStatus.PLANNING,
  submit: TripStatus.SUBMITTED,
  save_draft: TripStatus.DRAFT,
  admin_confirm: TripStatus.CONFIRMED,
  user_cancel: TripStatus.CANCELLED,
  payment_success: TripStatus.PAID,
  start_prepare: TripStatus.PREPARING,
  start_trip: TripStatus.IN_PROGRESS,
  complete_trip: TripStatus.COMPLETED,
  start_review: TripStatus.REVIEWING,
  finish_review: TripStatus.COMPLETED,
  request_refund: TripStatus.REFUNDING,
  refund_approved: TripStatus.REFUNDED,
  refund_rejected: TripStatus.PAID,
  reopen: TripStatus.DRAFT,
};

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: TripStateMachine,
    private readonly notificationService: NotificationService,
  ) {}

  /** Verify trip ownership — throws ForbiddenException on mismatch */
  private assertOwnership(trip: { userId: string }, userId: string) {
    if (trip.userId !== userId) {
      throw new ForbiddenException('You can only operate on your own trips');
    }
  }

  /** Create a new trip in DRAFT status */
  async create(userId: string, dto: CreateTripDto) {
    return this.prisma.trip.create({
      data: {
        userId,
        title: dto.title,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        totalBudget: dto.totalBudget,
        persons: dto.persons ?? 1,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        note: dto.note,
        status: TripStatus.DRAFT,
      },
      include: { sites: { include: { site: true } } },
    });
  }

  /** Statuses visible to non-owners in list view */
  private static readonly PUBLIC_STATUSES: TripStatus[] = [
    TripStatus.IN_PROGRESS,
    TripStatus.COMPLETED,
    TripStatus.REVIEWING,
  ];

  /** List trips with optional filters (R-68 IDOR-safe: anonymous/non-owner only see public-status trips) */
  async findAll(params: {
    currentUserId?: string;
    currentUserRole?: string;
    userId?: string;
    status?: TripStatus;
    page?: number;
    limit?: number;
  }) {
    const { currentUserId, currentUserRole, userId, status, page = 1, limit = 20 } = params;
    const take = Math.min(limit, 100);
    const where: Prisma.TripWhereInput = {};
    const isAdmin = currentUserRole === 'ADMIN';

    const isOwnerQuery = currentUserId != null && userId != null && userId === currentUserId;

    if (isAdmin) {
      // Admin: see all trips, optionally filtered by userId
      if (userId) where.userId = userId;
    } else if (isOwnerQuery) {
      // Owner querying their own trips — no visibility restriction
      where.userId = currentUserId;
    } else if (userId != null && currentUserId != null) {
      // Authenticated user viewing someone else — reject (R-68 no userId enumeration)
      where.userId = userId;
      where.status = { in: TripService.PUBLIC_STATUSES };
    } else if (userId != null) {
      // Anonymous trying to view a specific user — reject userId enumeration
      where.userId = userId;
      where.status = { in: TripService.PUBLIC_STATUSES };
    } else if (currentUserId != null) {
      // Authenticated user browsing all: own trips + public-status trips from others
      where.OR = [
        { userId: currentUserId },
        { status: { in: TripService.PUBLIC_STATUSES } },
      ];
    } else {
      // Anonymous browsing: only public-status trips
      where.status = { in: TripService.PUBLIC_STATUSES };
    }

    // Apply status filter on top if specified (narrows existing status constraints)
    if (status) {
      if (where.status) {
        // Combine with existing status constraint
        where.AND = [{ status }];
      } else if (where.OR) {
        // For OR queries, apply status to each branch
        where.OR = where.OR.map((clause) => ({ ...clause, status }));
      } else {
        where.status = status;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          sites: { include: { site: true }, orderBy: { order: 'asc' } },
          _count: { select: { journals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
      this.prisma.trip.count({ where }),
    ]);

    // Strip sensitive fields from non-owner trips
    const safeData = data.map((trip) => {
      if (currentUserId != null && trip.userId === currentUserId) {
        return trip; // Owner sees everything
      }
      // Non-owner: strip contact info
      const { contactName, contactPhone, ...safe } = trip;
      return safe;
    });

    return { data: safeData, total, page, limit };
  }

  /** Get trip detail with full relations (IDOR-safe: hides sensitive data from non-owners) */
  async findOne(id: string, currentUserId?: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
        sites: { include: { site: true }, orderBy: { order: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        orders: { orderBy: { createdAt: 'desc' } },
        journals: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);

    // Attach available transitions metadata
    const availableActions = this.stateMachine.getAvailableTransitions(trip.status);
    const statusLabel = this.stateMachine.getStatusLabel(trip.status);
    const statusColor = this.stateMachine.getStatusColor(trip.status);

    const isOwner = currentUserId != null && trip.userId === currentUserId;

    if (!isOwner) {
      // Strip sensitive data for non-owners (R-68 IDOR protection)
      const { contactName, contactPhone, orders, ...safeTrip } = trip;
      return {
        ...safeTrip,
        journals: trip.journals.filter((j) => j.isPublic),
        user: trip.user ? { nickname: trip.user.nickname } : null,
        availableActions,
        statusLabel,
        statusColor,
      };
    }

    return { ...trip, availableActions, statusLabel, statusColor };
  }

  /** Update trip details (only allowed in editable statuses) */
  async update(id: string, userId: string, dto: UpdateTripDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    this.assertOwnership(trip, userId);

    const editableStatuses: TripStatus[] = [
      TripStatus.DRAFT,
      TripStatus.PLANNING,
    ];
    if (!editableStatuses.includes(trip.status)) {
      throw new BadRequestException(
        `Cannot edit trip in ${trip.status} status. Editable statuses: ${editableStatuses.join(', ')}`,
      );
    }

    const data: Prisma.TripUpdateInput = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.trip.update({
      where: { id },
      data,
      include: { sites: { include: { site: true } } },
    });
  }

  /** Actions that require ADMIN role — regular users must not trigger these */
  private static readonly ADMIN_ACTIONS = new Set([
    'admin_confirm',
    'refund_approved',
    'refund_rejected',
  ]);

  /** Trigger a state transition via action name (R-07 state machine + R-74 role guard) */
  async transition(
    id: string,
    userId: string,
    userRole: string,
    action: string,
    operator?: string,
    reason?: string,
  ) {
    const toStatus = ACTION_TARGET[action];
    if (!toStatus) {
      throw new BadRequestException(`Unknown action: ${action}`);
    }
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);

    // R-74: Admin-only actions require ADMIN role
    if (TripService.ADMIN_ACTIONS.has(action)) {
      if (userRole !== 'ADMIN') {
        throw new ForbiddenException(
          `Action "${action}" requires ADMIN role`,
        );
      }
    } else {
      // R-68: Regular actions — verify user owns the trip
      this.assertOwnership(trip, userId);
    }

    const result = await this.stateMachine.transition(id, toStatus, action, operator, reason);

    // Notify user of trip status change (fire-and-forget to avoid blocking)
    this.notificationService
      .notifyTripStatusChange(
        trip.userId,
        trip.id,
        trip.title,
        trip.status,
        toStatus,
      )
      .catch(() => {
        // Notification failure should not block trip transition
      });

    return result;
  }

  /** Add a holy site to a trip */
  async addSite(tripId: string, userId: string, dto: AddTripSiteDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException(`Trip ${tripId} not found`);
    this.assertOwnership(trip, userId);

    // Verify the site exists
    const site = await this.prisma.holySite.findUnique({ where: { id: dto.siteId } });
    if (!site) throw new NotFoundException(`HolySite ${dto.siteId} not found`);

    return this.prisma.tripSite.create({
      data: {
        tripId,
        siteId: dto.siteId,
        order: dto.order,
        visitDate: dto.visitDate ? new Date(dto.visitDate) : undefined,
        notes: dto.notes,
      },
      include: { site: true },
    });
  }

  /** Remove a site from a trip */
  async removeSite(tripId: string, userId: string, siteId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException(`Trip ${tripId} not found`);
    this.assertOwnership(trip, userId);

    // siteId here is the TripSite record id
    const tripSite = await this.prisma.tripSite.findFirst({
      where: { tripId, id: siteId },
    });
    if (!tripSite) {
      throw new NotFoundException(`TripSite not found`);
    }
    return this.prisma.tripSite.delete({ where: { id: tripSite.id } });
  }

  /** Return the full status metadata (labels, colors, transitions) */
  getStatusMeta() {
    return this.stateMachine.getAllStatusMeta();
  }
}
