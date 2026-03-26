import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function exportSpec() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Global Ancestral Temple Travel Platform API')
    .setDescription(
      '全球祖庭旅行平台 API — 帮助100万人走祖庭，建立全球宗教文化和平使者网络。\n\n' +
      'Global Ancestral Temple Travel Platform API — Helping 1 million people visit ancestral temples, ' +
      'building a global network of religious and cultural peace ambassadors.\n\n' +
      '## Authentication\n' +
      'Protected endpoints require a Bearer JWT token obtained via `POST /api/auth/login`.\n\n' +
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
    .addTag('health', 'Health check endpoints to verify API availability and database connectivity.')
    .addTag('auth', 'User registration, login (phone/email), JWT token management, and profile retrieval.')
    .addTag('religions', 'CRUD for the 12 world religions with multilingual names, symbols, and theme colors.')
    .addTag('holy-sites', 'Sacred sites across all faiths with GPS coordinates, UTC offsets, and rich descriptions.')
    .addTag('temples', 'Ancestral temples — key spiritual heritage sites for each religion.')
    .addTag('patriarchs', 'Founders and key figures of each religion with biographical information.')
    .addTag('teachings', 'Sacred teachings and scriptures with original text and source references.')
    .addTag('seals', 'Caoxi Destiny Thirty Seals organized in 5 series.')
    .addTag('xiaohong', 'XiaoHong AI chat assistant with SSE streaming support.')
    .addTag('trips', 'Full trip lifecycle management with a 12-state machine (DRAFT to COMPLETED).')
    .addTag('orders', 'Order creation, payment processing, cancellation, and refund workflows.')
    .addTag('payments', 'Payment gateway integration for WeChat Pay, Alipay, and Stripe.')
    .addTag('journals', 'Pilgrimage journal entries with mood tracking and photo uploads.')
    .addTag('reviews', 'User reviews and ratings for holy sites and trips.')
    .addTag('uploads', 'File upload management for images and documents.')
    .addTag('notifications', 'Push notifications and in-app message management.')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Export as JSON
  const jsonPath = path.join(docsDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI JSON spec exported to ${jsonPath}`);

  // Export as YAML-like summary for quick reference
  const stats = {
    title: document.info.title,
    version: document.info.version,
    paths: Object.keys(document.paths || {}).length,
    schemas: Object.keys((document.components as any)?.schemas || {}).length,
    tags: (document.tags || []).map((t: any) => t.name),
    endpoints: Object.entries(document.paths || {}).reduce((count, [, methods]) => {
      return count + Object.keys(methods as any).filter(m => ['get', 'post', 'patch', 'put', 'delete'].includes(m)).length;
    }, 0),
  };
  console.log('\n--- OpenAPI Spec Summary ---');
  console.log(`Title: ${stats.title}`);
  console.log(`Version: ${stats.version}`);
  console.log(`Total Paths: ${stats.paths}`);
  console.log(`Total Endpoints: ${stats.endpoints}`);
  console.log(`Total Schemas: ${stats.schemas}`);
  console.log(`Tags: ${stats.tags.join(', ')}`);
  console.log('----------------------------\n');

  await app.close();
  process.exit(0);
}

exportSpec().catch((err) => {
  console.error('Failed to export OpenAPI spec:', err);
  process.exit(1);
});
