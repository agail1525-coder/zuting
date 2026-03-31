import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import compression from 'compression';
import * as path from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { initSentry } from './common/sentry.init';

// Validate critical environment variables before app creation
function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  // DATABASE_URL — required in production, warn in dev
  if (!process.env.DATABASE_URL) {
    if (isProduction) {
      errors.push('DATABASE_URL is not set. PostgreSQL connection string is required.');
    } else {
      warnings.push('DATABASE_URL is not set — Prisma will fall back to default or fail to connect.');
    }
  }

  // JWT_SECRET — must not be default in production
  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret || jwtSecret === 'change-me-in-production') {
    if (isProduction) {
      errors.push(
        'JWT_SECRET is missing or using the insecure default "change-me-in-production". ' +
        'Set a strong, unique secret for production.',
      );
    } else {
      warnings.push('JWT_SECRET is not set or using default — set a strong secret before deploying.');
    }
  }

  // REDIS_URL — optional, warn if missing
  if (!process.env.REDIS_URL) {
    warnings.push('REDIS_URL is not set — defaulting to localhost:6380.');
  }

  // API_PORT — optional, info if missing
  if (!process.env.API_PORT) {
    warnings.push('API_PORT is not set — defaulting to 3002.');
  }

  // Print warnings
  for (const w of warnings) {
    console.warn(`⚠ ENV: ${w}`);
  }

  // In production, fail fast on critical errors
  if (errors.length > 0) {
    console.error(
      '\n╔══════════════════════════════════════════════════════════════╗\n' +
      '║  FATAL: Missing critical environment variables!             ║\n' +
      '╚══════════════════════════════════════════════════════════════╝',
    );
    for (const e of errors) {
      console.error(`  ✗ ${e}`);
    }
    console.error('');
    process.exit(1);
  }
}

// Initialize Sentry before app creation (must be first)
initSentry();

// Validate environment variables before creating the app
validateEnv();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Enable raw body access for webhook signature verification (Stripe, WeChat Pay)
    rawBody: true,
  });

  // Security
  app.use(helmet());
  app.use(compression());
  // Parse CORS_ORIGINS (comma-separated) with localhost defaults for dev
  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const defaultOrigins = [
    ...(process.env.NODE_ENV !== 'production'
      ? ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:8081']
      : []),
  ];
  const allOrigins = [
    ...new Set([...defaultOrigins, ...corsOrigins]),
  ];
  app.enableCors({
    origin: allOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Serve uploaded files statically
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new SentryExceptionFilter(), new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger / OpenAPI 3.0
  const config = new DocumentBuilder()
    .setTitle('Global Ancestral Temple Travel Platform API')
    .setDescription(
      '全球祖庭旅行平台 API — 帮助100万人走祖庭，建立全球宗教文化和平使者网络。\n\n' +
      'Global Ancestral Temple Travel Platform API — Helping 1 million people visit ancestral temples, ' +
      'building a global network of religious and cultural peace ambassadors.\n\n' +
      '## Features / 功能\n' +
      '- **12 World Religions** (12大信仰): Buddhism, Taoism, Christianity, Islam, Hinduism, Judaism, Confucianism, Sikhism, Shinto, Tibetan Buddhism, Indigenous Spirituality, Bahá\'í Faith\n' +
      '- **60 Holy Sites** (60圣地): 5 per religion with GPS coordinates\n' +
      '- **27 Ancestral Temples** (27祖庭): Key ancestral temples across all faiths\n' +
      '- **28 Patriarchs** (28祖师): Founders and key figures of each religion\n' +
      '- **39 Teachings** (39祖训): Original teachings with sources\n' +
      '- **30 Seals** (三十印): Caoxi Destiny Thirty Seals across 5 series\n' +
      '- **AI Chat** (小鸿AI): SSE-powered intelligent assistant\n' +
      '- **Trip Management** (行程管理): 12-state trip lifecycle\n' +
      '- **Payment Integration** (支付): WeChat Pay, Alipay, Stripe\n' +
      '- **Pilgrimage Journals** (朝圣日志): User travel journals\n\n' +
      '## Authentication\n' +
      'Protected endpoints require a Bearer JWT token obtained via `POST /api/auth/login`.\n' +
      'Include the token in the `Authorization` header: `Bearer <token>`.\n\n' +
      '## Rate Limiting\n' +
      'API requests are rate-limited. Default: 100 requests per minute per IP.\n\n' +
      '## Error Format\n' +
      '```json\n' +
      '{ "statusCode": 400, "message": "Validation failed", "error": "Bad Request" }\n' +
      '```\n',
    )
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token obtained from POST /api/auth/login',
      },
      'bearer',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setContact(
      'Zuting Platform Team',
      'https://zuting.org',
      'api@zuting.org',
    )
    .setExternalDoc('Platform Documentation', 'https://docs.zuting.org')
    .addServer('http://localhost:3002', 'Local Development / 本地开发')
    .addServer('https://api-staging.zuting.org', 'Staging / 预发布')
    .addServer('https://api.zuting.org', 'Production / 生产')
    .addTag('health', 'Health check endpoints to verify API availability and database connectivity. / 健康检查接口，验证API可用性与数据库连通性。')
    .addTag('auth', 'User registration, login (phone/email), JWT token management, and profile retrieval. / 用户注册、登录（手机/邮箱）、JWT令牌管理与个人资料获取。')
    .addTag('religions', 'CRUD for the 12 world religions with multilingual names, symbols, and theme colors. / 12大世界宗教的增删改查，支持多语言名称、符号与主题色。')
    .addTag('holy-sites', 'Sacred sites across all faiths with GPS coordinates, UTC offsets, and rich descriptions. / 各信仰圣地管理，包含GPS坐标、UTC偏移与详细描述。')
    .addTag('temples', 'Ancestral temples — key spiritual heritage sites for each religion. / 祖庭管理——各宗教重要精神遗产圣地。')
    .addTag('patriarchs', 'Founders and key figures of each religion with biographical information. / 各宗教创始人及重要人物传记信息。')
    .addTag('teachings', 'Sacred teachings and scriptures with original text and source references. / 祖训经典原文与出处引用。')
    .addTag('seals', 'Caoxi Destiny Thirty Seals (曹溪愿命三十印) organized in 5 series: Initial, Middle, Fruition, Enlightenment, Return. / 曹溪愿命三十印，五系：初印系、中印系、印果印、成道印、归源印。')
    .addTag('xiaohong', 'XiaoHong AI chat assistant with SSE streaming support for real-time responses. / 小鸿AI聊天助手，支持SSE流式实时响应。')
    .addTag('trips', 'Full trip lifecycle management with a 12-state machine (DRAFT → COMPLETED). Supports site planning, budget tracking, and group coordination. / 完整行程生命周期管理，12状态机（草稿→完成），支持圣地规划、预算跟踪与团队协调。')
    .addTag('orders', 'Order creation, payment processing, cancellation, and refund workflows tied to trips. / 订单创建、支付处理、取消与退款流程，关联行程管理。')
    .addTag('payments', 'Payment gateway integration for WeChat Pay, Alipay, and Stripe with webhook callbacks. / 支付网关集成：微信支付、支付宝、Stripe，含异步回调。')
    .addTag('journals', 'Pilgrimage journal entries with mood tracking, photo uploads, and public/private visibility. / 朝圣日志，支持心情记录、照片上传与公开/私密设置。')
    .addTag('reviews', 'User reviews and ratings for holy sites and trips. / 用户对圣地和行程的评价与评分。')
    .addTag('uploads', 'File upload management for images and documents. / 图片与文档的文件上传管理。')
    .addTag('notifications', 'Push notifications and in-app message management. / 推送通知与应用内消息管理。')
    .build();
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: 'Zuting API Docs',
      customfavIcon: 'https://zuting.org/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: { activate: true, theme: 'monokai' },
      },
    });
  }

  // Security: warn if JWT_SECRET is still the default value
  const jwtSecret = process.env.JWT_SECRET || '';
  if (!jwtSecret || jwtSecret === 'change-me-in-production') {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.error(
        '\n╔══════════════════════════════════════════════════════════════╗\n' +
        '║  CRITICAL: JWT_SECRET is using the default value!          ║\n' +
        '║  Set a strong, unique JWT_SECRET in production.            ║\n' +
        '║  Current value is publicly known and INSECURE.             ║\n' +
        '╚══════════════════════════════════════════════════════════════╝\n',
      );
      process.exit(1);
    } else {
      console.warn(
        '⚠ JWT_SECRET is using default value "change-me-in-production" — ' +
        'set a strong secret before deploying to production.',
      );
    }
  }

  const port = process.env.API_PORT || 3002;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
