import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let prisma: Record<string, any>;

  const mockReview = {
    id: 'review-1',
    userId: 'user-1',
    targetType: 'TRIP',
    targetId: 'trip-1',
    rating: 5,
    content: 'Amazing pilgrimage experience!',
    images: [],
    createdAt: new Date(),
    user: { id: 'user-1', nickname: 'Pilgrim', avatar: null },
  };

  beforeEach(async () => {
    prisma = {
      review: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      trip: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  describe('create', () => {
    it('should create a review with valid data', async () => {
      prisma.review.findUnique.mockResolvedValue(null); // no duplicate
      prisma.trip.findUnique.mockResolvedValue({
        id: 'trip-1',
        userId: 'user-1',
      });
      prisma.review.create.mockResolvedValue(mockReview);

      const result = await service.create('user-1', {
        targetType: 'TRIP',
        targetId: 'trip-1',
        rating: 5,
        content: 'Amazing pilgrimage experience!',
      });

      expect(prisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            targetType: 'TRIP',
            targetId: 'trip-1',
            rating: 5,
          }),
        }),
      );
      expect(result).toEqual(mockReview);
    });

    it('should throw ConflictException for duplicate review', async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);

      await expect(
        service.create('user-1', {
          targetType: 'TRIP',
          targetId: 'trip-1',
          rating: 4,
          content: 'Another review',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if reviewing someone else\'s trip', async () => {
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.trip.findUnique.mockResolvedValue({
        id: 'trip-1',
        userId: 'other-user',
      });

      await expect(
        service.create('user-1', {
          targetType: 'TRIP',
          targetId: 'trip-1',
          rating: 5,
          content: 'Not my trip',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if trip target does not exist', async () => {
      prisma.review.findUnique.mockResolvedValue(null);
      prisma.trip.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', {
          targetType: 'TRIP',
          targetId: 'nonexistent',
          rating: 5,
          content: 'Missing trip',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return correct average and distribution', async () => {
      prisma.review.findMany.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
        { rating: 5 },
      ]);

      const stats = await service.getStats('TRIP', 'trip-1');

      expect(stats.averageRating).toBe(4.4);
      expect(stats.totalCount).toBe(5);
      expect(stats.distribution).toEqual({
        1: 0,
        2: 0,
        3: 1,
        4: 1,
        5: 3,
      });
    });

    it('should return zeros when no reviews exist', async () => {
      prisma.review.findMany.mockResolvedValue([]);

      const stats = await service.getStats('TRIP', 'trip-1');

      expect(stats.averageRating).toBe(0);
      expect(stats.totalCount).toBe(0);
      expect(stats.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    });
  });

  describe('remove', () => {
    it('should allow owner to delete their review', async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);
      prisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.remove('review-1', 'user-1', false);

      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-1' },
      });
      expect(result).toEqual(mockReview);
    });

    it('should allow admin to delete any review', async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);
      prisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.remove('review-1', 'other-user', true);

      expect(prisma.review.delete).toHaveBeenCalled();
      expect(result).toEqual(mockReview);
    });

    it('should throw ForbiddenException if non-owner non-admin tries to delete', async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);

      await expect(
        service.remove('review-1', 'other-user', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if review does not exist', async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', 'user-1', false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated reviews for a target', async () => {
      prisma.review.findMany.mockResolvedValue([mockReview]);
      prisma.review.count.mockResolvedValue(1);

      const result = await service.findAll({
        targetType: 'TRIP',
        targetId: 'trip-1',
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('update', () => {
    it('should allow owner to update their review', async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);
      const updated = { ...mockReview, rating: 4, content: 'Updated review' };
      prisma.review.update.mockResolvedValue(updated);

      const result = await service.update('review-1', 'user-1', {
        rating: 4,
        content: 'Updated review',
      });

      expect(result.rating).toBe(4);
    });

    it('should throw ForbiddenException if non-owner tries to update', async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);

      await expect(
        service.update('review-1', 'other-user', { rating: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if review not found', async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', 'user-1', { rating: 3 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
