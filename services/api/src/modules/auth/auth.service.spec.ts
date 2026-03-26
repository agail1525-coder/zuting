import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: Record<string, any>;
  let jwt: Record<string, any>;
  let config: Record<string, any>;
  let redis: Record<string, any>;

  const mockUser = {
    id: 'user-1',
    phone: '13800138000',
    email: 'test@zuting.com',
    nickname: 'Pilgrim',
    passwordHash: '$2b$10$hashedpassword',
    role: 'USER',
    isActive: true,
    refreshToken: 'old-refresh-token',
    lastLoginAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    config = {
      get: jest.fn().mockReturnValue('jwt-secret'),
    };

    redis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('should create a user with hashed password and return tokens', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ ...mockUser, id: 'new-user-1' });
      jwt.sign.mockReturnValueOnce('access-tok').mockReturnValueOnce('refresh-tok');
      prisma.user.update.mockResolvedValue({});

      const result = await service.register({
        phone: '13800138000',
        password: 'password123',
        nickname: 'Pilgrim',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: '13800138000',
          nickname: 'Pilgrim',
          passwordHash: 'hashed-pw',
        }),
      });
      expect(result).toEqual({
        accessToken: 'access-tok',
        refreshToken: 'refresh-tok',
        expiresIn: 900,
      });
    });

    it('should throw ConflictException if phone already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          phone: '13800138000',
          password: 'password123',
          nickname: 'Pilgrim',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already registered', async () => {
      // First call (phone lookup) returns null, second call (email lookup) returns existing user
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // no phone match
        .mockResolvedValueOnce(mockUser); // email match

      await expect(
        service.register({
          phone: '13900139000',
          email: 'test@zuting.com',
          password: 'password123',
          nickname: 'Pilgrim',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if neither phone nor email provided', async () => {
      await expect(
        service.register({
          password: 'password123',
          nickname: 'Pilgrim',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({});
      jwt.sign.mockReturnValueOnce('access-tok').mockReturnValueOnce('refresh-tok');

      const result = await service.login({
        phone: '13800138000',
        password: 'password123',
      });

      expect(result).toEqual({
        accessToken: 'access-tok',
        refreshToken: 'refresh-tok',
        expiresIn: 900,
      });
      // Verify lastLoginAt was updated
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: { lastLoginAt: expect.any(Date) },
        }),
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ phone: '13800138000', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for nonexistent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ phone: '00000000000', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        service.login({ phone: '13800138000', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user has no passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: null });

      await expect(
        service.login({ phone: '13800138000', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile with _count', async () => {
      const profile = {
        id: mockUser.id,
        phone: mockUser.phone,
        email: mockUser.email,
        nickname: mockUser.nickname,
        avatar: null,
        role: 'USER',
        language: 'zh',
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date(),
        lastLoginAt: null,
        _count: { trips: 2, orders: 1, journals: 3, practices: 0 },
      };
      prisma.user.findUnique.mockResolvedValue(profile);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(profile);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          select: expect.objectContaining({ _count: expect.any(Object) }),
        }),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should return new token pair for valid refresh token', async () => {
      const validRefreshToken = 'valid-refresh-token';
      jwt.verify.mockReturnValue({ sub: 'user-1', role: 'USER' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'USER',
        refreshToken: validRefreshToken,
        isActive: true,
      });
      jwt.sign.mockReturnValueOnce('new-access').mockReturnValueOnce('new-refresh');
      prisma.user.update.mockResolvedValue({});

      const result = await service.refresh(validRefreshToken);

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresIn: 900,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refresh('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if refresh token is revoked', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', role: 'USER' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'USER',
        refreshToken: 'different-token',
        isActive: true,
      });

      await expect(service.refresh('stale-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', role: 'USER' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'USER',
        refreshToken: 'token',
        isActive: false,
      });

      await expect(service.refresh('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
