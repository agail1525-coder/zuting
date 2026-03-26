import { Injectable, BadRequestException } from '@nestjs/common';
import { TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** A single allowed transition: from -> to, triggered by event name */
interface Transition {
  from: TripStatus;
  to: TripStatus;
  event: string;
}

/** All legal transitions in the 12-state trip lifecycle */
const TRANSITIONS: Transition[] = [
  { from: TripStatus.DRAFT, to: TripStatus.PLANNING, event: 'start_planning' },
  { from: TripStatus.PLANNING, to: TripStatus.SUBMITTED, event: 'submit' },
  { from: TripStatus.PLANNING, to: TripStatus.DRAFT, event: 'save_draft' },
  { from: TripStatus.SUBMITTED, to: TripStatus.CONFIRMED, event: 'admin_confirm' },
  { from: TripStatus.SUBMITTED, to: TripStatus.CANCELLED, event: 'user_cancel' },
  { from: TripStatus.CONFIRMED, to: TripStatus.PAID, event: 'payment_success' },
  { from: TripStatus.CONFIRMED, to: TripStatus.CANCELLED, event: 'user_cancel' },
  { from: TripStatus.PAID, to: TripStatus.PREPARING, event: 'start_prepare' },
  { from: TripStatus.PREPARING, to: TripStatus.IN_PROGRESS, event: 'start_trip' },
  { from: TripStatus.IN_PROGRESS, to: TripStatus.COMPLETED, event: 'complete_trip' },
  { from: TripStatus.COMPLETED, to: TripStatus.REVIEWING, event: 'start_review' },
  { from: TripStatus.REVIEWING, to: TripStatus.COMPLETED, event: 'finish_review' },
  { from: TripStatus.PAID, to: TripStatus.REFUNDING, event: 'request_refund' },
  { from: TripStatus.CONFIRMED, to: TripStatus.REFUNDING, event: 'request_refund' },
  { from: TripStatus.REFUNDING, to: TripStatus.REFUNDED, event: 'refund_approved' },
  { from: TripStatus.REFUNDING, to: TripStatus.PAID, event: 'refund_rejected' },
  { from: TripStatus.CANCELLED, to: TripStatus.DRAFT, event: 'reopen' },
];

/** Status label map: Chinese + English */
const STATUS_LABELS: Record<TripStatus, { cn: string; en: string }> = {
  DRAFT: { cn: '草稿', en: 'Draft' },
  PLANNING: { cn: '规划中', en: 'Planning' },
  SUBMITTED: { cn: '已提交', en: 'Submitted' },
  CONFIRMED: { cn: '已确认', en: 'Confirmed' },
  PAID: { cn: '已支付', en: 'Paid' },
  PREPARING: { cn: '准备中', en: 'Preparing' },
  IN_PROGRESS: { cn: '朝圣中', en: 'In Progress' },
  COMPLETED: { cn: '已完成', en: 'Completed' },
  REVIEWING: { cn: '评价中', en: 'Reviewing' },
  CANCELLED: { cn: '已取消', en: 'Cancelled' },
  REFUNDING: { cn: '退款中', en: 'Refunding' },
  REFUNDED: { cn: '已退款', en: 'Refunded' },
};

/** Status color for frontend badges */
const STATUS_COLORS: Record<TripStatus, string> = {
  DRAFT: '#9E9E9E',
  PLANNING: '#2196F3',
  SUBMITTED: '#FF9800',
  CONFIRMED: '#4CAF50',
  PAID: '#8BC34A',
  PREPARING: '#00BCD4',
  IN_PROGRESS: '#3F51B5',
  COMPLETED: '#009688',
  REVIEWING: '#E91E63',
  CANCELLED: '#F44336',
  REFUNDING: '#FF5722',
  REFUNDED: '#795548',
};

@Injectable()
export class TripStateMachine {
  constructor(private readonly prisma: PrismaService) {}

  /** Check whether a transition from `from` to `to` is allowed */
  canTransition(from: TripStatus, to: TripStatus): boolean {
    return TRANSITIONS.some((t) => t.from === from && t.to === to);
  }

  /** Get all statuses reachable from the given status */
  getAvailableTransitions(status: TripStatus): { status: TripStatus; event: string }[] {
    return TRANSITIONS.filter((t) => t.from === status).map((t) => ({
      status: t.to,
      event: t.event,
    }));
  }

  /** Find the event name for a from->to pair */
  getEventForTransition(from: TripStatus, to: TripStatus): string | null {
    const t = TRANSITIONS.find((t) => t.from === from && t.to === to);
    return t ? t.event : null;
  }

  /**
   * Execute a state transition inside a database transaction.
   * Validates the transition, updates the trip, and creates an audit history record.
   */
  async transition(
    tripId: string,
    toStatus: TripStatus,
    event: string,
    operator?: string,
    reason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUniqueOrThrow({ where: { id: tripId } });

      if (!this.canTransition(trip.status, toStatus)) {
        throw new BadRequestException(
          `Cannot transition from ${trip.status} to ${toStatus}. ` +
            `Allowed: ${this.getAvailableTransitions(trip.status)
              .map((t) => t.status)
              .join(', ') || 'none'}`,
        );
      }

      await tx.tripStatusHistory.create({
        data: {
          tripId,
          fromStatus: trip.status,
          toStatus,
          event,
          operator,
          reason,
        },
      });

      return tx.trip.update({
        where: { id: tripId },
        data: { status: toStatus },
        include: {
          sites: { include: { site: true } },
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
      });
    });
  }

  /** Get localised label */
  getStatusLabel(status: TripStatus): { cn: string; en: string } {
    return STATUS_LABELS[status];
  }

  /** Get hex color for badge rendering */
  getStatusColor(status: TripStatus): string {
    return STATUS_COLORS[status];
  }

  /** Return full metadata map (useful for frontend config endpoint) */
  getAllStatusMeta() {
    return Object.values(TripStatus).map((s) => ({
      status: s,
      label: STATUS_LABELS[s],
      color: STATUS_COLORS[s],
      transitions: this.getAvailableTransitions(s),
    }));
  }
}
