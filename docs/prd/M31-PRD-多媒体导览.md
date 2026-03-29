# M31-PRD-多媒体导览 (Multimedia Tours)

> Sprint E2 | 版本: v1.0 | 日期: 2026-03-29

---

## 1. 概述

为圣地(HolySite)和祖庭(Temple)提供多媒体导览能力，包括视频导览、360度全景查看、音频讲解三大媒体类型。用户在浏览圣地/祖庭详情时，可以通过多媒体内容更直观地了解目的地的文化与环境，提升沉浸式体验。

### 1.1 目标用户
- **朝圣者/旅行者**: 出发前通过视频、全景预览目的地，决策是否加入行程
- **文化爱好者**: 在线聆听音频讲解，了解宗教文化背景
- **管理员**: 上传和管理多媒体内容，为每个圣地/祖庭配置导览资源

### 1.2 业务价值
- 提高圣地详情页停留时间和转化率
- 差异化竞争: 宗教文化场所的沉浸式导览是竞品缺乏的垂直能力
- 为后续AR/VR导览奠定数据基础

---

## 2. 竞品对标分析

| 竞品 | 功能 | JOINUS借鉴点 |
|------|------|--------------|
| **TripAdvisor** | 用户上传视频+照片墙 | UGC视频展示、缩略图网格 |
| **Google Arts & Culture** | 360度虚拟游览、高清文物展示 | 360度全景查看器、沉浸式布局 |
| **Airbnb体验** | 体验预览视频、沉浸式图片 | 视频自动播放预览、大图卡片风格 |
| **Booking.com** | 酒店视频导览、全景房间 | 视频+全景切换Tab |
| **Trip.com** | 目的地宣传视频、攻略短视频 | 宣传片嵌入、短视频列表 |

---

## 3. 媒体类型定义

| 类型 | 值 | 说明 | 典型内容 |
|------|------|------|----------|
| 视频 | `VIDEO` | 宣传片、导览视频 | 圣地航拍、文化纪录短片、导游讲解 |
| 全景 | `PANORAMA` | 360度全景图片 | 殿堂内部、庭院、自然景观全景 |
| 音频 | `AUDIO` | 音频讲解 | 历史讲解、文化故事、诵经录音 |

### 3.1 关联实体类型

| entityType | 说明 |
|------------|------|
| `HOLY_SITE` | 圣地 |
| `TEMPLE` | 祖庭 |

---

## 4. 数据模型

### MediaContent

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String (CUID) | 自动 | 主键 |
| entityType | String | 是 | 关联实体类型: HOLY_SITE / TEMPLE |
| entityId | String | 是 | 关联实体ID |
| mediaType | String | 是 | 媒体类型: VIDEO / PANORAMA / AUDIO |
| title | String | 是 | 媒体标题 |
| description | String (Text) | 否 | 描述/简介 |
| url | String | 是 | 媒体文件URL |
| thumbnailUrl | String | 否 | 缩略图URL |
| duration | Int | 否 | 时长(秒)，视频和音频用 |
| sortOrder | Int | 否 | 排序权重，默认0 |
| isActive | Boolean | 否 | 是否启用，默认true |
| createdAt | DateTime | 自动 | 创建时间 |
| updatedAt | DateTime | 自动 | 更新时间 |

**索引**:
- `[entityType, entityId, isActive]` — 按实体查询活跃媒体
- `[mediaType]` — 按媒体类型筛选

---

## 5. API契约

### 5.1 公开接口

#### GET /api/media
按实体获取媒体列表 (公开)

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| entityType | string | 是 | HOLY_SITE / TEMPLE |
| entityId | string | 是 | 实体ID |
| mediaType | string | 否 | 按媒体类型筛选 |
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20，最大100 |

**响应**: `{ data: MediaContent[], total: number, page: number, limit: number }`

#### GET /api/media/:id
获取单个媒体详情 (公开)

**响应**: `MediaContent`

### 5.2 管理接口 (需认证)

#### POST /api/media
创建媒体内容

**Body**: CreateMediaDto
```json
{
  "entityType": "HOLY_SITE",
  "entityId": "clx...",
  "mediaType": "VIDEO",
  "title": "菩提伽耶航拍导览",
  "description": "从空中俯瞰菩提伽耶大觉寺...",
  "url": "https://cdn.zuting.org/media/bodh-gaya-aerial.mp4",
  "thumbnailUrl": "https://cdn.zuting.org/media/bodh-gaya-aerial-thumb.jpg",
  "duration": 180,
  "sortOrder": 1
}
```

#### PATCH /api/media/:id
更新媒体内容

#### DELETE /api/media/:id
删除媒体内容

---

## 6. 验收标准

- [ ] MediaContent模型已添加到Prisma Schema，`prisma generate`无报错
- [ ] Media模块已注册到AppModule
- [ ] GET /api/media?entityType=HOLY_SITE&entityId=xxx 返回正确分页数据
- [ ] GET /api/media/:id 返回单条媒体详情，不存在返回404
- [ ] POST /api/media 需认证，创建成功返回201
- [ ] PATCH /api/media/:id 需认证，更新成功返回200
- [ ] DELETE /api/media/:id 需认证，删除成功返回200
- [ ] `tsc --noEmit` 零错误
- [ ] Swagger文档中可见所有端点
- [ ] 公开接口不需要JWT Token
- [ ] 列表接口有分页限制(max 100)

---

## 7. 后续规划

- P29: 圣地导览页前端实现 (视频播放器+全景查看器+音频播放条)
- 支持用户UGC上传视频/全景
- 视频转码+CDN加速
- AR/VR导览集成
