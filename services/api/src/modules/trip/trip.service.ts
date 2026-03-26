import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStateMachine } from '../../common/trip-state-machine';
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
  ) {}

  /** Create a new trip in DRAFT status */
  async create(dto: CreateTripDto) {
    return this.prisma.trip.create({
      data: {
        userId: dto.userId,
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

  /** List trips with optional filters */
  async findAll(params: {
    userId?: string;
    status?: TripStatus;
    page?: number;
    limit?: number;
  }) {
    const { userId, status, page = 1, limit = 20 } = params;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          sites: { include: { site: true }, orderBy: { order: 'asc' } },
          _count: { select: { orders: true, journals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trip.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /** Get trip detail with full relations */
  async findOne(id: string) {
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

    return { ...trip, availableActions, statusLabel, statusColor };
  }

  /** Update trip details (only allowed in editable statuses) */
  async update(id: string, dto: UpdateTripDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);

    const editableStatuses: TripStatus[] = [
      TripStatus.DRAFT,
      TripStatus.PLANNING,
    ];
    if (!editableStatuses.includes(trip.status)) {
      throw new BadRequestException(
        `Cannot edit trip in ${trip.status} status. Editable statuses: ${editableStatuses.join(', ')}`,
      );
    }

    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.trip.update({
      where: { id },
      data,
      include: { sites: { include: { site: true } } },
    });
  }

  /** Trigger a state transition via action name */
  async transition(
    id: string,
    action: string,
    operator?: string,
    reason?: string,
  ) {
    const toStatus = ACTION_TARGET[action];
    if (!toStatus) {
      throw new BadRequestException(`Unknown action: ${action}`);
    }
    return this.stateMachine.transition(id, toStatus, action, operator, reason);
  }

  /** Add a holy site to a trip */
  async addSite(tripId: string, dto: AddTripSiteDto) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException(`Trip ${tripId} not found`);

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
  async removeSite(tripId: string, siteId: string) {
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
