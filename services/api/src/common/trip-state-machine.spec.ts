import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TripStateMachine } from './trip-state-machine';
import { PrismaService } from '../prisma/prisma.service';

/**
 * We use a string enum mirror here so tests don't depend on @prisma/client generation.
 * These values match the TripStatus enum in the Prisma schema.
 */
const TripStatus = {
  DRAFT: 'DRAFT',
  PLANNING: 'PLANNING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REVIEWING: 'REVIEWING',
  CANCELLED: 'CANCELLED',
  REFUNDING: 'REFUNDING',
  REFUNDED: 'REFUNDED',
} as const;

type TripStatusType = (typeof TripStatus)[keyof typeof TripStatus];

describe('TripStateMachine', () => {
  let machine: TripStateMachine;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      trip: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      tripStatusHistory: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripStateMachine,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    machine = module.get<TripStateMachine>(TripStateMachine);
  });

  describe('canTransition', () => {
    const validTransitions: [string, string][] = [
      [TripStatus.DRAFT, TripStatus.PLANNING],
      [TripStatus.PLANNING, TripStatus.SUBMITTED],
      [TripStatus.PLANNING, TripStatus.DRAFT],
      [TripStatus.SUBMITTED, TripStatus.CONFIRMED],
      [TripStatus.SUBMITTED, TripStatus.CANCELLED],
      [TripStatus.CONFIRMED, TripStatus.PAID],
      [TripStatus.CONFIRMED, TripStatus.CANCELLED],
      [TripStatus.PAID, TripStatus.PREPARING],
      [TripStatus.PREPARING, TripStatus.IN_PROGRESS],
      [TripStatus.IN_PROGRESS, TripStatus.COMPLETED],
      [TripStatus.COMPLETED, TripStatus.REVIEWING],
      [TripStatus.REVIEWING, TripStatus.COMPLETED],
      [TripStatus.PAID, TripStatus.REFUNDING],
      [TripStatus.CONFIRMED, TripStatus.REFUNDING],
      [TripStatus.REFUNDING, TripStatus.REFUNDED],
      [TripStatus.REFUNDING, TripStatus.PAID],
      [TripStatus.CANCELLED, TripStatus.DRAFT],
    ];

    it.each(validTransitions)(
      'should allow transition from %s to %s',
      (from, to) => {
        expect(machine.canTransition(from as any, to as any)).toBe(true);
      },
    );

    const invalidTransitions: [string, string][] = [
      [TripStatus.DRAFT, TripStatus.PAID],
      [TripStatus.DRAFT, TripStatus.COMPLETED],
      [TripStatus.DRAFT, TripStatus.REFUNDED],
      [TripStatus.PAID, TripStatus.DRAFT],
      [TripStatus.COMPLETED, TripStatus.DRAFT],
      [TripStatus.REFUNDED, TripStatus.PAID],
      [TripStatus.IN_PROGRESS, TripStatus.DRAFT],
      [TripStatus.PREPARING, TripStatus.SUBMITTED],
    ];

    it.each(invalidTransitions)(
      'should NOT allow transition from %s to %s',
      (from, to) => {
        expect(machine.canTransition(from as any, to as any)).toBe(false);
      },
    );
  });

  describe('getAvailableTransitions', () => {
    it('should return all 12 statuses with at least awareness (some may have 0 transitions)', () => {
      const allStatuses = Object.values(TripStatus);
      expect(allStatuses).toHaveLength(12);

      // Every status should be callable without error
      for (const status of allStatuses) {
        const transitions = machine.getAvailableTransitions(status as any);
        expect(Array.isArray(transitions)).toBe(true);
      }
    });

    it('DRAFT should have exactly one transition: to PLANNING', () => {
      const transitions = machine.getAvailableTransitions(TripStatus.DRAFT as any);
      expect(transitions).toHaveLength(1);
      expect(transitions[0].status).toBe(TripStatus.PLANNING);
      expect(transitions[0].event).toBe('start_planning');
    });

    it('REFUNDED should have no valid transitions (terminal state)', () => {
      const transitions = machine.getAvailableTransitions(TripStatus.REFUNDED as any);
      expect(transitions).toHaveLength(0);
    });

    it('CONFIRMED should allow PAID, CANCELLED, and REFUNDING', () => {
      const transitions = machine.getAvailableTransitions(TripStatus.CONFIRMED as any);
      const targetStatuses = transitions.map((t) => t.status);
      expect(targetStatuses).toContain(TripStatus.PAID);
      expect(targetStatuses).toContain(TripStatus.CANCELLED);
      expect(targetStatuses).toContain(TripStatus.REFUNDING);
    });
  });

  describe('cancel from various states', () => {
    it('should allow cancel from SUBMITTED', () => {
      expect(machine.canTransition(TripStatus.SUBMITTED as any, TripStatus.CANCELLED as any)).toBe(true);
    });

    it('should allow cancel from CONFIRMED', () => {
      expect(machine.canTransition(TripStatus.CONFIRMED as any, TripStatus.CANCELLED as any)).toBe(true);
    });

    it('should NOT allow cancel from PAID (must go through refund)', () => {
      expect(machine.canTransition(TripStatus.PAID as any, TripStatus.CANCELLED as any)).toBe(false);
    });

    it('should NOT allow cancel from DRAFT', () => {
      expect(machine.canTransition(TripStatus.DRAFT as any, TripStatus.CANCELLED as any)).toBe(false);
    });

    it('should NOT allow cancel from IN_PROGRESS', () => {
      expect(machine.canTransition(TripStatus.IN_PROGRESS as any, TripStatus.CANCELLED as any)).toBe(false);
    });
  });

  describe('refund flow: PAID -> REFUNDING -> REFUNDED', () => {
    it('should allow PAID -> REFUNDING', () => {
      expect(machine.canTransition(TripStatus.PAID as any, TripStatus.REFUNDING as any)).toBe(true);
    });

    it('should allow REFUNDING -> REFUNDED', () => {
      expect(machine.canTransition(TripStatus.REFUNDING as any, TripStatus.REFUNDED as any)).toBe(true);
    });

    it('should allow REFUNDING -> PAID (refund rejected)', () => {
      expect(machine.canTransition(TripStatus.REFUNDING as any, TripStatus.PAID as any)).toBe(true);
    });

    it('should NOT allow direct PAID -> REFUNDED (must go through REFUNDING)', () => {
      expect(machine.canTransition(TripStatus.PAID as any, TripStatus.REFUNDED as any)).toBe(false);
    });
  });

  describe('transition (DB operation)', () => {
    it('should execute transition in a database transaction', async () => {
      const mockTrip = { id: 'trip-1', status: TripStatus.DRAFT };
      const updatedTrip = { ...mockTrip, status: TripStatus.PLANNING, sites: [], statusHistory: [] };

      // Mock $transaction to execute the callback with a mock tx
      prisma.$transaction.mockImplementation(async (cb: (tx: any) => any) => {
        const tx = {
          trip: {
            findUniqueOrThrow: jest.fn().mockResolvedValue(mockTrip),
            update: jest.fn().mockResolvedValue(updatedTrip),
          },
          tripStatusHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return cb(tx);
      });

      const result = await machine.transition(
        'trip-1',
        TripStatus.PLANNING as any,
        'start_planning',
        'user-1',
        'Starting to plan',
      );

      expect(result).toEqual(updatedTrip);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid transition', async () => {
      const mockTrip = { id: 'trip-1', status: TripStatus.DRAFT };

      prisma.$transaction.mockImplementation(async (cb: (tx: any) => any) => {
        const tx = {
          trip: {
            findUniqueOrThrow: jest.fn().mockResolvedValue(mockTrip),
          },
          tripStatusHistory: { create: jest.fn() },
        };
        return cb(tx);
      });

      await expect(
        machine.transition('trip-1', TripStatus.PAID as any, 'payment_success'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatusLabel', () => {
    it('should return Chinese and English labels for DRAFT', () => {
      const label = machine.getStatusLabel(TripStatus.DRAFT as any);
      expect(label).toEqual({ cn: '草稿', en: 'Draft' });
    });
  });

  describe('getStatusColor', () => {
    it('should return a hex color for every status', () => {
      for (const status of Object.values(TripStatus)) {
        const color = machine.getStatusColor(status as any);
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    });
  });

  describe('getAllStatusMeta', () => {
    it('should return metadata for all 12 statuses', () => {
      const meta = machine.getAllStatusMeta();
      expect(meta).toHaveLength(12);
      for (const entry of meta) {
        expect(entry).toHaveProperty('status');
        expect(entry).toHaveProperty('label');
        expect(entry).toHaveProperty('color');
        expect(entry).toHaveProperty('transitions');
      }
    });
  });
});
