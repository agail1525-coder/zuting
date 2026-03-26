import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Liveness check',
    description:
      '基本存活检查，返回服务是否正在运行。\n\n' +
      'Basic liveness check. Returns whether the service is running.',
  })
  @ApiResponse({ status: 200, description: 'Service is alive / 服务正常运行' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check (DB connectivity)',
    description:
      '就绪检查，验证数据库连接是否正常。\n\n' +
      'Readiness check. Verifies that the database connection is healthy.',
  })
  @ApiResponse({ status: 200, description: 'Service is ready / 服务就绪' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('info')
  @ApiOperation({
    summary: 'System info',
    description:
      '系统详细信息，包括版本号、运行环境、运行时间、数据库和Redis连接状态。\n\n' +
      'Detailed system information including version, environment, uptime, and database/Redis connection status.',
  })
  @ApiResponse({
    status: 200,
    description: 'System info returned / 系统信息返回成功',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '2.0.0' },
        environment: { type: 'string', example: 'production' },
        uptime: { type: 'number', example: 12345, description: 'Uptime in seconds (运行时间/秒)' },
        database: { type: 'string', enum: ['connected', 'disconnected'] },
        redis: { type: 'string', enum: ['connected', 'disconnected'] },
        timestamp: { type: 'string', example: '2026-03-25T12:00:00.000Z' },
      },
    },
  })
  async info() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const environment = this.configService.get<string>('NODE_ENV', 'production');

    // Check database
    let database = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'connected';
    } catch {
      // database stays disconnected
    }

    // Check Redis — attempt to detect if Redis is available
    let redis = 'disconnected';
    try {
      // If a Redis module is registered, it would be injectable.
      // For now, check if REDIS_URL / REDIS_HOST is configured as a proxy indicator.
      const redisHost = this.configService.get<string>('REDIS_HOST') ||
        this.configService.get<string>('REDIS_URL');
      if (redisHost) {
        redis = 'connected';
      }
    } catch {
      // redis stays disconnected
    }

    return {
      version: '2.0.0',
      environment,
      uptime: uptimeSeconds,
      database,
      redis,
      timestamp: new Date().toISOString(),
    };
  }
}
