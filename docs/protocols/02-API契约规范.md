# 02 — API 契约规范

> **版本**: v1.0
> **生效日期**: 2026-03-29
> **适用范围**: JOINUS.COM 全平台后端 (NestJS API — `services/api/`)
> **铁律引用**: [R-04] [R-05] [R-06] [R-63] [R-64] [R-65] [R-68] [R-74]
> **审批**: CEO++ 指令触发生效，后续修订须更新版本号并注明变更原因

---

## 目录

1. [RESTful 设计原则](#1-restful-设计原则)
2. [URL 规范](#2-url-规范)
3. [请求格式](#3-请求格式)
4. [响应格式](#4-响应格式)
5. [错误处理](#5-错误处理)
6. [分页规范](#6-分页规范)
7. [认证与授权](#7-认证与授权)
8. [Swagger 文档规范](#8-swagger-文档规范)
9. [DTO 规范](#9-dto-规范)
10. [版本控制](#10-版本控制)
11. [SSE 流式接口](#11-sse-流式接口)
12. [速率限制](#12-速率限制)
13. [CORS 配置](#13-cors-配置)
14. [铁律速查表](#14-铁律速查表)

---

## 1. RESTful 设计原则

### 1.1 资源命名

| 规则 | 正确示例 | 错误示例 |
|------|----------|----------|
| 复数小写名词 | `/api/holy-sites` | `/api/holySite`, `/api/HolySite` |
| 连字符分隔多词 | `/api/holy-sites` | `/api/holy_sites`, `/api/holysites` |
| 名词而非动词 | `/api/trips` | `/api/getTrips`, `/api/createTrip` |
| 嵌套资源用斜杠 | `/api/trips/:id/sites` | `/api/tripSites?tripId=xxx` |

### 1.2 HTTP 方法语义

| 方法 | 语义 | 幂等 | 安全 | 典型场景 |
|------|------|------|------|----------|
| `GET` | 读取资源 | 是 | 是 | 列表、详情 |
| `POST` | 创建资源 / 触发动作 | 否 | 否 | 新建记录、状态转换、SSE |
| `PATCH` | 部分更新资源 | 是 | 否 | 修改部分字段 |
| `PUT` | 完整替换资源 | 是 | 否 | 仅在明确需要完整替换时使用 |
| `DELETE` | 删除资源 | 是 | 否 | 删除记录 |

> **注意**: 状态机触发（如行程状态转换）使用 `POST /:id/transition`，动作语义优先于幂等要求。

### 1.3 HTTP 状态码语义

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | GET/PATCH/DELETE 成功 |
| 201 | Created | POST 创建资源成功 |
| 204 | No Content | 成功但无响应体（谨慎使用，优先返回 200+数据） |
| 400 | Bad Request | 参数校验失败、业务逻辑拒绝 |
| 401 | Unauthorized | 未携带有效 Token |
| 403 | Forbidden | 已认证但权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建、状态冲突） |
| 422 | Unprocessable Entity | 格式正确但语义不合法 |
| 429 | Too Many Requests | 触发速率限制 |
| 500 | Internal Server Error | 服务器内部错误 |

---

## 2. URL 规范

### 2.1 路径结构

```
/api/{resource}               # 列表
/api/{resource}/:id           # 单个资源详情
/api/{resource}/:id/{action}  # 资源级动作（状态机等）
/api/{resource}/:id/{sub}     # 嵌套子资源列表
/api/{resource}/:id/{sub}/:subId  # 嵌套子资源详情/操作
```

**JOINUS.COM 现有端点示例：**

```
GET    /api/holy-sites                    # 圣地列表
GET    /api/holy-sites/:id                # 圣地详情
POST   /api/holy-sites                    # 创建圣地（admin）
PATCH  /api/holy-sites/:id                # 更新圣地（admin）
DELETE /api/holy-sites/:id                # 删除圣地（admin）

POST   /api/trips                         # 创建行程
GET    /api/trips                         # 行程列表（分页）
GET    /api/trips/status-meta             # 状态机元数据（注意：静态路径在 :id 之前）
GET    /api/trips/:id                     # 行程详情
PATCH  /api/trips/:id                     # 更新行程
POST   /api/trips/:id/transition          # 触发状态转换
POST   /api/trips/:id/sites               # 添加圣地到行程
DELETE /api/trips/:id/sites/:siteId       # 移除行程圣地

POST   /api/xiaohong/chat                 # 普通对话
GET    /api/xiaohong/chat/stream          # SSE 流式对话
GET    /api/xiaohong/suggestions          # 快捷建议
```

### 2.2 路由顺序规则

**静态路径必须注册在动态路径之前**，防止 NestJS 路由冲突：

```typescript
// 正确顺序 ✅
@Get('status-meta')   // 静态，先注册
getStatusMeta() {}

@Get(':id')           // 动态，后注册
findOne() {}

// 错误顺序 ❌ — 'status-meta' 会被匹配为 :id
@Get(':id')
findOne() {}

@Get('status-meta')
getStatusMeta() {}
```

### 2.3 查询参数命名

- 命名使用 **camelCase**
- 筛选参数：`religionId`, `userId`, `status`
- 分页参数：`page`, `limit`（见第 6 节）
- 排序参数：`sortBy`, `sortOrder`（见第 6 节）
- 搜索参数：`q`（全文搜索关键词）

```
GET /api/holy-sites?religionId=xxx&page=1&limit=20
GET /api/trips?userId=xxx&status=DRAFT&page=2&limit=10
GET /api/holy-sites?q=菩提&sortBy=name&sortOrder=asc
```

---

## 3. 请求格式

### 3.1 Content-Type

```http
Content-Type: application/json
Accept: application/json
```

> SSE 流式接口例外，见第 11 节。

### 3.2 JSON Body 规范

- 字段命名统一使用 **camelCase**
- 必填字段不提供时返回 400
- 可选字段缺省时服务端使用默认值
- 禁止传递 `null` 代替"不更新"语义，PATCH 请求只传需要修改的字段

```json
// 创建行程 POST /api/trips — 正确 ✅
{
  "title": "佛教四大圣地朝圣之旅",
  "startDate": "2026-05-01",
  "endDate": "2026-05-14",
  "persons": 2,
  "totalBudget": 15000
}

// 更新行程 PATCH /api/trips/:id — 只传需改字段 ✅
{
  "title": "修改后的行程标题"
}
```

### 3.3 日期时间格式

所有日期时间字段使用 **ISO 8601** 格式（铁律 [R-23]）：

```
日期:        "2026-05-01"           (YYYY-MM-DD)
日期时间:    "2026-05-01T08:00:00.000Z"  (UTC，带 Z 后缀)
时间戳返回:  "2026-03-29T12:34:56.789Z"
```

### 3.4 ID 格式

所有资源 ID 使用 **CUID** 格式（铁律 [R-24]），由 Prisma 自动生成：

```
示例: "clx2xyz9f0001ab12cd34ef56"
```

---

## 4. 响应格式

### 4.1 标准成功响应

NestJS 默认直接返回 Service 层数据，全局使用 **AllExceptionsFilter** 统一处理错误格式。

**单资源响应**（直接返回对象）：

```json
// GET /api/holy-sites/:id
{
  "id": "clx2xyz9f0001ab12cd34ef56",
  "name": "菩提伽耶",
  "nameEn": "Bodh Gaya",
  "country": "India",
  "latitude": 24.6961,
  "longitude": 84.9911,
  "utcOffset": 5.5,
  "description": "...",
  "imageUrl": "https://images.zuting.org/sites/bodh-gaya.jpg",
  "religionId": "clx1abc2d0000ab12cd34ef56",
  "religion": {
    "id": "clx1abc2d0000ab12cd34ef56",
    "name": "佛教",
    "nameEn": "Buddhism"
  },
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-03-29T12:00:00.000Z"
}
```

**创建成功响应**（HTTP 201）：返回被创建的完整资源对象。

**更新成功响应**（HTTP 200）：返回更新后的完整资源对象。

**删除成功响应**（HTTP 200）：返回被删除的资源对象（或 `{ "id": "...", "deleted": true }`）。

### 4.2 列表分页响应（铁律 [R-05]）

```json
// GET /api/trips?page=1&limit=20
{
  "data": [
    {
      "id": "clx3trip0001ab12cd34ef56",
      "title": "佛教四大圣地朝圣之旅",
      "status": "DRAFT",
      "startDate": "2026-05-01",
      "endDate": "2026-05-14",
      "persons": 2,
      "totalBudget": 15000,
      "createdAt": "2026-03-29T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `data` | `T[]` | 当前页数据数组 |
| `total` | `number` | 符合条件的总记录数 |
| `page` | `number` | 当前页码（从 1 开始） |
| `limit` | `number` | 每页数量 |
| `totalPages` | `number` | 总页数 = `Math.ceil(total / limit)` |

> 铁律 [R-05] 要求所有分页接口返回此结构。`PaginatedResponseDto<T>` 已在 `src/common/dto/api-response.dto.ts` 中定义，直接复用。

### 4.3 无分页列表响应

对于数据量可控的枚举型列表（如 12 大信仰、30 印），可直接返回数组：

```json
// GET /api/religions
[
  { "id": "...", "name": "佛教", "nameEn": "Buddhism", "slug": "buddhism" },
  { "id": "...", "name": "道教", "nameEn": "Taoism", "slug": "taoism" }
]
```

> 此类接口必须有 `take` 参数限制（铁律 [R-64]），Service 层 `findMany` 须加 `take: 200` 上限防 OOM。

---

## 5. 错误处理

### 5.1 错误响应格式（铁律 [R-06]）

所有错误由 `AllExceptionsFilter`（`src/common/filters/all-exceptions.filter.ts`）统一拦截并返回：

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2026-03-29T12:34:56.789Z",
  "path": "/api/holy-sites"
}
```

class-validator 校验失败时，`message` 为错误信息数组：

```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "latitude must not be less than -90"
  ],
  "timestamp": "2026-03-29T12:34:56.789Z",
  "path": "/api/holy-sites"
}
```

### 5.2 错误码规范

| 状态码 | 触发场景 | NestJS 异常类 |
|--------|----------|---------------|
| 400 | 参数校验失败、状态机非法转换、业务规则拒绝 | `BadRequestException` |
| 401 | 未携带 Token 或 Token 无效/过期 | `UnauthorizedException` |
| 403 | 权限不足（角色不匹配、IDOR 防护触发） | `ForbiddenException` |
| 404 | 资源不存在 | `NotFoundException` |
| 409 | 资源冲突（重复创建唯一资源、并发冲突） | `ConflictException` |
| 422 | 格式正确但语义不合法（如日期逻辑矛盾） | `UnprocessableEntityException` |
| 429 | 触发速率限制 | Throttler 自动抛出 |
| 500 | 未捕获异常、数据库错误 | 兜底，由 Filter 处理 |

### 5.3 抛出异常规范

```typescript
// Service 层抛出
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

// 资源不存在
if (!site) throw new NotFoundException(`HolySite ${id} not found`);

// 业务规则拒绝
if (trip.status !== 'DRAFT') {
  throw new BadRequestException('只能在草稿状态下修改行程');
}

// 权限不足（IDOR 防护，铁律 [R-68]）
if (trip.userId !== currentUserId && currentUserRole !== 'ADMIN') {
  throw new ForbiddenException('无权操作此行程');
}
```

### 5.4 Controller 层不捕获业务异常

Controller 只负责路由和 DTO 绑定，业务异常在 Service 层抛出，由全局 Filter 统一响应，不在 Controller 中 try-catch 业务逻辑：

```typescript
// 正确 ✅ — Controller 直接透传
@Get(':id')
async findById(@Param('id') id: string) {
  const site = await this.holySiteService.findById(id);
  if (!site) throw new NotFoundException(); // 资源检查可在 Controller
  return site;
}

// 错误 ❌ — 不要在 Controller 吞掉错误
@Get(':id')
async findById(@Param('id') id: string) {
  try {
    return await this.holySiteService.findById(id);
  } catch (e) {
    return { error: e.message }; // 破坏统一错误格式
  }
}
```

---

## 6. 分页规范

### 6.1 分页参数

使用 `PaginationQueryDto`（`src/common/dto/pagination.dto.ts`）：

```typescript
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;           // 页码从 1 开始

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;         // 默认 20，最大 100（铁律 [R-64]）
}
```

**关键规则（铁律 [R-64]）：**
- `page` 从 **1** 开始，不是 0
- `pageSize`/`limit` 默认 **20**，最大不超过 **100**
- Service 层 `findMany` 必须加 `take` 限制，禁止无限制查询

### 6.2 排序参数

```typescript
export class SortQueryDto {
  @ApiPropertyOptional({ description: '排序字段', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

请求示例：

```
GET /api/trips?page=1&limit=10&sortBy=startDate&sortOrder=asc
```

### 6.3 Prisma 分页实现模式

```typescript
// Service 层标准分页实现
async findAll(params: { page?: number; limit?: number; userId?: string }) {
  const { page = 1, limit = 20, userId } = params;
  const skip = (page - 1) * limit;
  const take = Math.min(limit, 100); // 双重保险，铁律 [R-64]

  const where = userId ? { userId } : {};

  const [data, total] = await this.prisma.$transaction([
    this.prisma.trip.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    this.prisma.trip.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit: take,
    totalPages: Math.ceil(total / take),
  };
}
```

---

## 7. 认证与授权

### 7.1 JWT Bearer Token（铁律 [R-63]）

所有受保护接口必须在请求头携带 JWT Token：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token 由 `/api/auth/login` 或 `/api/auth/register` 返回，有效期由环境变量 `JWT_EXPIRES_IN` 控制。

### 7.2 Guard 使用规范（铁律 [R-63] [R-74]）

全局注册 `JwtAuthGuard` 和 `RolesGuard`，路由默认需要认证：

```typescript
// main.ts 或 AppModule — 全局注册
app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
```

**@Public() — 标记公开路由：**

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Public()          // 无需 Token，任何人可访问
@Get()
findAll() {}
```

**@Roles() — 角色权限控制（铁律 [R-74]）：**

```typescript
import { Roles } from '../auth/decorators/roles.decorator';

@Roles('ADMIN')    // 必须配合 RolesGuard 使用，否则装饰器无效
@Post()
create() {}

@Roles('ADMIN', 'OPERATOR')  // 多角色可选满足其一
@Patch(':id')
update() {}
```

> **铁律 [R-74]**: `@Roles()` 必须在 `RolesGuard` 全局注册后才生效，单独使用无效。

### 7.3 获取当前用户

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Get('my-trips')
findMyTrips(@CurrentUser('id') userId: string) {
  return this.tripService.findAll({ userId });
}

@Post()
create(@Body() dto: CreateTripDto, @CurrentUser('id') userId: string) {
  return this.tripService.create(userId, dto);
}

// 获取完整用户信息
transition(
  @CurrentUser('id') userId: string,
  @CurrentUser('role') userRole: string,
) {}
```

### 7.4 IDOR 防护（铁律 [R-68]）

接受 `userId` 参数的端点，必须验证当前请求者是否有权访问目标用户的资源：

```typescript
// Service 层 IDOR 验证模板
async findOne(id: string, currentUserId?: string): Promise<Trip> {
  const trip = await this.prisma.trip.findUnique({ where: { id } });
  if (!trip) throw new NotFoundException(`Trip ${id} not found`);

  // IDOR 防护：非 ADMIN 只能访问自己的行程
  if (currentUserId && trip.userId !== currentUserId) {
    const user = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('无权访问此行程');
    }
  }

  return trip;
}
```

### 7.5 Swagger 认证标注

受保护接口必须标注 `@ApiBearerAuth`：

```typescript
@ApiBearerAuth('bearer')
@Roles('ADMIN')
@Post()
create() {}
```

---

## 8. Swagger 文档规范

### 8.1 必须标注的装饰器（铁律 [R-04]）

每个 Controller 和路由处理方法必须包含以下 Swagger 装饰器：

```typescript
@ApiTags('holy-sites')          // Controller 级别 — 分组标签
@Controller('holy-sites')
export class HolySiteController {

  @ApiOperation({
    summary: '一句话描述（英文）',        // 必填
    description: '中文详细说明\n\nEnglish description.',  // 建议中英双语
  })
  @ApiResponse({ status: 200, description: '成功描述' })   // 必填正常响应
  @ApiResponse({ status: 400, description: '校验失败描述' }) // 必填错误响应
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: '资源不存在。' })
  findById() {}
}
```

### 8.2 参数文档

```typescript
// 路径参数
@ApiParam({
  name: 'id',
  description: 'Holy site ID (CUID). / 圣地ID',
  example: 'clx2xyz9f0001ab12cd34ef56',
})

// 查询参数
@ApiQuery({
  name: 'religionId',
  required: false,
  description: 'Filter by religion ID. / 按宗教ID筛选',
  example: 'clx1abc2d0000ab12cd34ef56',
})

// 枚举查询参数（不能传 Prisma enum 对象，铁律 [R-02]）
const TRIP_STATUS_ENUM = ['DRAFT', 'PLANNING', 'SUBMITTED', ...]; // 字符串数组

@ApiQuery({
  name: 'status',
  required: false,
  enum: TRIP_STATUS_ENUM,  // 用字符串数组，避免 Prisma circular dependency
})
```

> **Prisma Enum 陷阱（CLAUDE.md 注意事项）**: 禁止将 Prisma 生成的 enum 对象直接传给 `@ApiQuery({ enum: PrismaEnum })`，会触发 circular dependency 错误。必须改用字符串数组。

### 8.3 Swagger 访问地址

```
http://localhost:3002/api/docs
```

所有模块的 Swagger 文档在项目启动后可直接在浏览器交互测试。

---

## 9. DTO 规范

### 9.1 DTO 命名约定（铁律 [R-03]）

| DTO 类型 | 命名规范 | 文件名 | 用途 |
|----------|----------|--------|------|
| 创建 | `Create{Resource}Dto` | `create-{resource}.dto.ts` | POST 请求体 |
| 更新 | `Update{Resource}Dto` | `update-{resource}.dto.ts` | PATCH 请求体，字段全部可选 |
| 查询 | `Query{Resource}Dto` | `query-{resource}.dto.ts` | GET 查询参数 |
| 响应 | `{Resource}ResponseDto` | `{resource}-response.dto.ts` | 返回体类型声明 |
| 分页 | `PaginationQueryDto` | `pagination.dto.ts` | 通用分页参数（复用） |

### 9.2 class-validator 装饰器规范（铁律 [R-03]）

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsNumber, IsInt,
  IsEnum, IsBoolean, IsUrl, IsUUID,
  Min, Max, MinLength, MaxLength,
  IsArray, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHolySiteDto {
  // 必填字符串
  @ApiProperty({ description: '圣地中文名称', example: '菩提伽耶' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  // 必填数字，带范围
  @ApiProperty({ description: 'GPS纬度', example: 24.6961, minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  // 可选字符串
  @ApiPropertyOptional({ description: '图片URL', example: 'https://...' })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  // 枚举（用字符串枚举，不用 Prisma enum 对象）
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status: string;
}
```

### 9.3 UpdateDto 使用 PartialType

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateHolySiteDto } from './create-holy-site.dto';

// 所有字段变为可选，自动继承 Swagger 文档
export class UpdateHolySiteDto extends PartialType(CreateHolySiteDto) {}
```

### 9.4 QueryDto 使用 class-transformer Type

查询参数默认为字符串，需要用 `@Type()` 转换类型：

```typescript
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';

export class TripQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(TRIP_STATUS_ENUM)
  status?: string;

  @IsOptional()
  @Type(() => Number)   // 查询参数字符串转数字
  @IsInt()
  @Min(1)
  minPersons?: number;
}
```

### 9.5 TransformPlainToClass 响应序列化

重要的响应 DTO 使用 `class-transformer` 保证字段过滤（如屏蔽密码字段）：

```typescript
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() email: string;
  @Exclude() passwordHash: string;  // 自动排除，不返回给前端
}
```

---

## 10. 版本控制

### 10.1 当前版本

当前 API 路径前缀为 `/api`（不带版本号），对应 v1。

### 10.2 版本预留

未来升级时使用 URL 路径版本控制：

```
/api/v1/holy-sites   ← v1（当前，向后兼容）
/api/v2/holy-sites   ← v2（新版本，破坏性变更时启用）
```

NestJS 版本控制配置（`main.ts`）：

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  prefix: 'v',
  defaultVersion: '1',
});
```

### 10.3 向后兼容策略

| 允许的非破坏性变更 | 需要新版本的破坏性变更 |
|-------------------|----------------------|
| 新增响应字段 | 删除或重命名现有字段 |
| 新增可选请求参数 | 删除或重命名端点 |
| 新增端点 | 修改字段类型 |
| 放宽验证规则 | 修改分页结构 |
| 新增枚举值 | 收紧验证规则（可能） |

---

## 11. SSE 流式接口

### 11.1 端点规范

SSE 接口使用 NestJS `@Sse` 装饰器，路径约定为 `{resource}/stream` 或 `{resource}/chat/stream`：

```typescript
import { Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';

@Public()
@Sse('chat/stream')
@ApiOperation({ summary: '小鸿流式对话 (SSE)' })
chatStream(
  @Query('message') message: string,
  @Query('conversationId') conversationId: string,
): Observable<MessageEvent> {
  if (!message || message.length > 2000) {
    throw new BadRequestException('消息不能为空且不超过2000字符');
  }
  return this.xiaohongService.chatStream(message, undefined, conversationId);
}
```

### 11.2 客户端连接规范

SSE 接口参数通过 **Query String** 传递（非 Body），客户端使用 `EventSource`：

```typescript
// 前端 EventSource 连接
const params = new URLSearchParams({ message: '佛教有哪些圣地？', conversationId: 'xxx' });
const es = new EventSource(`/api/xiaohong/chat/stream?${params}`);

es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.token);  // 流式 token
};

es.addEventListener('done', () => {
  es.close();
});

es.onerror = (error) => {
  console.error('SSE Error', error);
  es.close();
};
```

### 11.3 SSE 事件格式

```typescript
// Service 层返回 Observable<MessageEvent>
import { Observable } from 'rxjs';

// token 事件（流式 token）
{ data: JSON.stringify({ type: 'token', token: '佛' }) }

// done 事件（流结束）
{ data: JSON.stringify({ type: 'done', conversationId: 'xxx' }), event: 'done' }

// error 事件
{ data: JSON.stringify({ type: 'error', message: '生成失败' }), event: 'error' }

// 心跳事件（防止连接超时，每 15 秒发送）
{ data: ':', comment: 'heartbeat' }
```

### 11.4 SSE 超时配置

小鸿 AI（接入 Qwen3.5-35B vLLM）需要较长超时：

- HTTP 超时：180 秒（普通对话）
- SSE 连接超时：300 秒（流式对话）
- 心跳间隔：15 秒（防 Nginx/CDN 断开）

---

## 12. 速率限制

### 12.1 全局速率限制配置（铁律 [R-65]）

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 秒窗口
        limit: 10,    // 每秒最多 10 次请求
      },
      {
        name: 'medium',
        ttl: 60000,   // 1 分钟窗口
        limit: 200,   // 每分钟最多 200 次请求
      },
    ]),
  ],
})
export class AppModule {}
```

### 12.2 敏感接口额外限流

对 AI 聊天、支付等高消耗接口使用 `@Throttle` 进一步限制：

```typescript
import { Throttle } from '@nestjs/throttler';

@Throttle({ short: { ttl: 1000, limit: 1 }, medium: { ttl: 60000, limit: 30 } })
@Post('chat')
chat() {}
```

### 12.3 速率限制响应

触发速率限制时返回 HTTP 429：

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "timestamp": "2026-03-29T12:34:56.789Z",
  "path": "/api/xiaohong/chat"
}
```

客户端应检测 429 响应并实现指数退避重试。

---

## 13. CORS 配置

### 13.1 白名单配置（铁律 [HH-S02]）

```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',  // Web 开发
    'http://localhost:3003',  // Admin 开发
    'https://joinus.com',     // 生产 Web
    'https://admin.joinus.com', // 生产 Admin
    /\.joinus\.com$/,         // 子域名通配
  ],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,          // 允许携带 Cookie（用于 WebSocket/SSE）
  maxAge: 86400,              // 预检缓存 24 小时
});
```

### 13.2 预检请求

浏览器在发送跨域请求前会先发送 `OPTIONS` 预检请求，CORS 配置已自动处理。

自定义请求头（如 `X-Request-ID`）需加入 `allowedHeaders` 列表。

### 13.3 移动端 / 小程序

React Native 和微信小程序不受浏览器 CORS 限制，但需在小程序后台配置合法域名 `api.joinus.com`。

---

## 14. 铁律速查表

| 铁律编号 | 内容摘要 | 所在章节 |
|---------|----------|----------|
| [R-04] | API 使用 NestJS 标准响应格式 + Swagger 文档 | §4, §8 |
| [R-05] | 分页: `{ items: T[], total, page, pageSize }` | §4.2, §6 |
| [R-06] | 错误: HttpException + 对应 HTTP 状态码 | §5 |
| [R-63] | Controller 必须有 JwtAuthGuard + RolesGuard；@Public() 标记公开路由 | §7.2 |
| [R-64] | findMany 必须有 take 参数，列表 @Max(100)，防 OOM | §6.1, §4.3 |
| [R-65] | 外部 HTTP 调用必须有超时 | §11.4, §12 |
| [R-68] | 接受 userId param 的端点必须验证访问权限（IDOR 防护） | §7.4 |
| [R-74] | @Roles() 必须配合 @UseGuards 使用，否则装饰器无效 | §7.2 |

---

## 附录 A — 快速 Checklist（新接口上线前）

开发新 API 端点前，对照以下清单逐项确认（铁律 [HH-E01]）：

- [ ] URL 路径符合资源命名规范（复数小写，连字符）
- [ ] HTTP 方法语义正确（GET/POST/PATCH/DELETE）
- [ ] 静态路径在动态路径 `:id` 之前注册
- [ ] 有 `@ApiTags`、`@ApiOperation`、`@ApiResponse` 文档
- [ ] 有 CreateDto / UpdateDto / QueryDto，字段有 class-validator 装饰器
- [ ] 枚举参数使用字符串数组，不直接传 Prisma enum（防 circular dependency）
- [ ] 受保护接口有 `@ApiBearerAuth`，公开接口有 `@Public()`
- [ ] `@Roles()` 配合全局 `RolesGuard` 使用
- [ ] 有 IDOR 防护（涉及 userId 参数的端点）
- [ ] `findMany` 有 `take` 上限（≤100）
- [ ] 分页接口返回 `{ data, total, page, limit, totalPages }`
- [ ] 错误使用 NestJS HttpException 家族，不自造错误结构
- [ ] 日期字段使用 ISO 8601 格式
- [ ] SSE 接口有心跳机制和合理超时配置

---

## 附录 B — 现有模块端点速查

| 模块 | Controller 文件 | 主要端点 |
|------|----------------|----------|
| 宗教 | `modules/religion/religion.controller.ts` | GET /religions, GET /religions/:slug |
| 圣地 | `modules/holy-site/holy-site.controller.ts` | CRUD /holy-sites |
| 祖庭 | `modules/temple/temple.controller.ts` | CRUD /temples |
| 祖师 | `modules/patriarch/patriarch.controller.ts` | CRUD /patriarchs |
| 祖训 | `modules/teaching/teaching.controller.ts` | CRUD /teachings |
| 印 | `modules/seal/seal.controller.ts` | CRUD /seals |
| 小鸿AI | `modules/xiaohong/xiaohong.controller.ts` | POST /chat, SSE /chat/stream |
| 行程 | `modules/trip/trip.controller.ts` | 完整状态机 CRUD |
| 订单 | `modules/order/order.controller.ts` | POST /pay /cancel /refund |
| 日志 | `modules/journal/journal.controller.ts` | CRUD /journals |
| 评价 | `modules/review/review.controller.ts` | UGC 评价系统 |
| 搜索 | `modules/search/search.controller.ts` | GET /search |
| 通知 | `modules/notification/notification.controller.ts` | 推送通知 |
| 认证 | `modules/auth/` | 登录/注册/OAuth |

> Swagger 完整文档：`http://localhost:3002/api/docs`
