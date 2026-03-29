# F04-PRD-评价图片上传

> 项目: JOINUS.COM — 全球祖庭文化旅行平台
> 文档类型: 延伸功能PRD
> 版本: v1.0 | 创建日期: 2026-03-29 | 最后更新: 2026-03-29
> 状态: 评审中
> 负责人: CEO++ / 后端+前端团队
> 父模块: M15-PRD-UGC评价系统.md

---

## 1. 背景与目标

### 1.1 背景

评价图片上传是 UGC 评价系统的重要组成部分，能显著提升评价可信度和内容价值（TripAdvisor 数据：含图片评价的点击率是纯文字评价的 3 倍）。系统已有 `Upload` 模型和基础文件上传架构，但缺少评价专用上传端点和前端压缩逻辑。需要制定开发阶段（本地存储）与生产阶段（阿里云 OSS）两套方案，平滑迁移。

### 1.2 目标

- [ ] 开发阶段：后端 multer 接收图片，存储至本地 `/public/uploads/reviews/`，返回访问 URL
- [ ] 生产阶段：支持前端直传阿里云 OSS（STS 临时凭证），减轻后端压力
- [ ] 前端压缩：上传前用 Canvas 压缩至 1920px 宽度以内，控制上传体积
- [ ] 安全校验：文件类型（magic bytes）、文件大小（单张 ≤ 5MB）、最多 9 张

### 1.3 非目标（本期不做的）

- 不包含视频上传（延期到 Phase D）
- 不包含 AI 内容审核（延期到 Phase D，当前依赖人工审核）
- 不包含图片水印（延期到 P2）
- 不包含 CDN 加速配置（生产阶段跟随 OSS 配置）

---

## 2. 竞品对标分析

### 2.1 竞品功能对比

| 竞品 | 功能描述 | 优点 | 缺点 | 借鉴点 |
|------|---------|------|------|-------|
| TripAdvisor | 最多9张图片，上传后即时预览，支持旋转 | 上传流畅，预览体验好 | 无压缩提示，大图上传慢 | 最多9张上传数量设定，网格预览布局 |
| 大众点评 | 移动端相机直拍，图片自动压缩，上传进度条 | 移动端体验极佳，压缩透明 | 压缩后图质量有时较差 | 上传进度条、相机直拍快捷入口 |
| Airbnb | 拖拽上传（Web）+ 多选，实时预览+重排序 | 交互优雅，重排序满足用户控制感 | 实现复杂 | 图片预览网格可删除的交互设计 |

### 2.2 差距分析

当前 JOINUS.COM 无评价图片上传功能，`Upload` 模型虽已存在但无评价专用端点，前端未实现图片选择/压缩/预览的完整流程。

### 2.3 差异化优势

评价图片附加圣地 GPS 地理标签（未来），形成朝圣图片地图，与 JOINUS.COM 地图模块联动，打造独特的朝圣轨迹可视化。

---

## 3. 用户故事

### 3.1 目标用户

- 主要用户: 提交图文评价的朝圣旅行者
- 次要用户: 浏览评价图片的潜在朝圣者

### 3.2 用户故事列表

| 编号 | 用户故事 | 优先级 |
|------|---------|-------|
| US-01 | 作为旅行者，我希望在写评价时上传照片，以便让其他人看到真实的圣地环境 | P0 |
| US-02 | 作为旅行者，我希望上传前有预览，以便确认选择了正确的图片 | P0 |
| US-03 | 作为旅行者，我希望可以删除已选的图片重新选择，以便管理上传内容 | P0 |
| US-04 | 作为旅行者，我希望图片上传有进度提示，以便知道上传是否完成 | P1 |
| US-05 | 作为旅行者，我希望系统自动压缩大图，以便上传速度更快且不占用太多流量 | P1 |

---

## 4. 功能清单

### 4.1 核心功能（P0 — 必须有）

- [ ] 图片选择：Web 端文件选择器（accept="image/jpeg,image/png,image/webp"），Mobile 端相册/相机
- [ ] 前端预览：选择后即时显示缩略图网格（最多3×3）
- [ ] 删除图片：每张缩略图右上角显示删除按钮（×）
- [ ] 后端接收：`POST /api/uploads/review-photos` 接受 multipart/form-data，返回图片 URL
- [ ] 文件类型校验：后端校验 magic bytes（JPEG: FF D8 FF / PNG: 89 50 4E 47 / WebP: 52 49 46 46）
- [ ] 文件大小校验：单张 ≤ 5MB，超出前端拦截+提示

### 4.2 增强功能（P1 — 应该有）

- [ ] 前端压缩：上传前 Canvas 压缩，最大宽度 1920px，JPEG 质量 0.85
- [ ] 上传进度：每张图片显示上传进度百分比
- [ ] 多张同时上传：最多同时上传 3 张（并发控制）
- [ ] 最多9张限制：达到上限后隐藏/禁用添加按钮

### 4.3 优化功能（P2 — 可以有）

- [ ] 图片重排序：拖拽调整图片顺序
- [ ] 图片旋转：旋转上传前的预览图
- [ ] 生产 OSS 直传：迁移到阿里云 OSS STS 直传方案（见第 8 节技术约束）

---

## 5. 页面线框 / 交互设计

### 5.1 图片上传区组件结构

```
+------------------------------------------+
|  添加照片 (可选，最多9张)                  |
|  ┌────┐  ┌────┐  ┌────┐  ┌────────────┐  |
|  │[图]│× │[图]│× │[图]│× │  [📷 +]   │  |
|  │ ██ │  │ ██ │  │ ██ │  │  添加图片  │  |
|  └────┘  └────┘  └────┘  └────────────┘  |
|  (图片上传中时显示进度圆环)                 |
|                           已选 3 / 9 张  |
+------------------------------------------+
```

### 5.2 上传状态变化

```
未选图片:   [📷 添加图片] 占位符
选中图片:   缩略图 + 右上角 × 删除按钮
上传中:     缩略图 + 圆形进度条覆盖层（0-100%）
上传完成:   缩略图，进度条消失
上传失败:   缩略图变暗 + 红色感叹号 + 点击重试
达到9张:    添加按钮隐藏
```

### 5.3 关键交互流程

```
1. 用户点击"添加图片"
   → Web: 弹出文件选择器（支持多选，最多选至剩余配额数）
   → Mobile: 弹出 ActionSheet（相机 / 相册）

2. 用户选择图片
   → 前端: 读取文件，校验类型和大小
   → 校验失败: Toast "图片大小不能超过5MB" / "仅支持JPG/PNG/WebP格式"
   → 校验通过: 生成本地预览 URL（URL.createObjectURL），显示缩略图

3. 前端压缩（P1）
   → 用 Canvas 将图片绘制到最大 1920px 宽的画布
   → 导出为 JPEG（quality=0.85）Blob

4. 上传至后端
   → FormData: { file: Blob, filename: uuid + 原始扩展名 }
   → POST /api/uploads/review-photos
   → 成功: 用服务器返回 URL 替换本地 ObjectURL
   → 失败: 标记该图片为上传失败状态

5. 用户点击删除（×）
   → 若已上传: 仅从前端列表移除（不调用删除 API，URL 随评价提交携带）
   → 若上传中: 取消上传请求，移除预览
```

### 5.4 三态设计

| 状态 | 表现 |
|------|------|
| Loading（上传中） | 缩略图上显示进度圆环（CSS 动画），上传完成前禁止提交评价 |
| Empty（无图片） | 占位符"📷 添加图片"，点击触发文件选择 |
| Error（上传失败） | 缩略图变暗，右上角红色感叹号，点击触发重新上传 |

---

## 6. API 契约

### 6.1 开发阶段端点

#### `POST /api/uploads/review-photos` （需 JWT）

**请求:** multipart/form-data

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `file` | File | 图片文件，单个请求一张 |

**响应格式:**

```json
{
  "url": "http://localhost:3002/uploads/reviews/a1b2c3d4-uuid.jpg",
  "filename": "a1b2c3d4-uuid.jpg",
  "size": 245760,
  "mimetype": "image/jpeg"
}
```

**错误码:**

| HTTP 状态码 | 错误码 | 说明 |
|------------|-------|------|
| 400 | INVALID_FILE_TYPE | 不支持的文件类型（非JPEG/PNG/WebP） |
| 400 | FILE_TOO_LARGE | 文件超过 5MB |
| 401 | UNAUTHORIZED | 未登录 |
| 429 | RATE_LIMIT | 上传频率超限（每分钟最多20张） |

### 6.2 生产阶段端点（P2，OSS 直传）

#### `POST /api/uploads/sts`（获取 STS 临时凭证）

**响应格式:**

```json
{
  "accessKeyId": "STS.xxx",
  "accessKeySecret": "yyy",
  "stsToken": "zzz",
  "bucket": "joinus-media",
  "region": "oss-cn-hangzhou",
  "keyPrefix": "review-photos/",
  "expiration": "2026-03-29T11:00:00Z"
}
```

---

## 7. 数据模型

图片上传使用现有 `Upload` 模型，无需新增字段：

```prisma
model Upload {
  id        String   @id @default(cuid())
  userId    String
  filename  String
  mimetype  String
  size      Int      // bytes
  url       String   // 访问 URL
  provider  String   @default("local")  // 开发阶段: local; 生产: oss
  createdAt DateTime @default(now())
}
```

评价提交时，`Review.photos[]` 存储已上传图片的 URL 列表。图片 URL 与评价解耦（删除评价不自动删除图片文件，由定时任务清理孤立图片）。

### 7.1 后端存储路径

```
开发阶段（multer）:
  存储目录: services/api/public/uploads/reviews/
  文件名: {uuid}.{ext}  (ext 从 mimetype 推导)
  访问 URL: http://localhost:3002/uploads/reviews/{uuid}.{ext}

生产阶段（OSS）:
  Bucket: joinus-media
  Key: review-photos/{userId}/{uuid}.{ext}
  CDN URL: https://cdn.joinus.com/review-photos/{userId}/{uuid}.{ext}
```

---

## 8. 技术约束

- **性能**: 单张 5MB 图片压缩 < 2s（Canvas 操作），压缩后上传 < 5s（正常网络）
- **移动端**: Expo 使用 `expo-image-picker`（v14+），小程序使用 `Taro.chooseImage`
- **压缩实现**: Web 端用原生 Canvas API；React Native 端用 `expo-image-manipulator`；小程序端 Taro 压缩接口
- **文件名安全**: 后端生成 UUID 文件名，忽略客户端传入的原始文件名，防路径注入
- **类型校验**: 后端用 `file-type` 包读取 magic bytes，不信任 Content-Type header
- **速率限制**: 每个用户每分钟最多上传 20 张（防滥用），用 Redis 计数
- **环境变量（生产阶段 OSS）**:
  ```
  OSS_ACCESS_KEY_ID=
  OSS_ACCESS_KEY_SECRET=
  OSS_BUCKET=joinus-media
  OSS_REGION=oss-cn-hangzhou
  OSS_CDN_DOMAIN=cdn.joinus.com
  ```
- **静态文件服务（开发阶段）**: NestJS 需配置 `ServeStaticModule`，挂载 `/uploads` 路径

---

## 9. 验收标准

### 9.1 功能验收

| 编号 | 验收项 | 测试步骤 | 通过标准 |
|------|-------|---------|---------|
| AC-01 | 正常图片上传 | 选择一张 2MB 以内的 JPEG 图片上传 | 响应 200，返回图片 URL，URL 可访问，图片显示在预览区 |
| AC-02 | 超大图片拒绝 | 选择一张 6MB 的图片上传 | 前端弹出提示"图片大小不能超过5MB"，不发出上传请求 |
| AC-03 | 非法文件类型拒绝 | 将 .txt 文件改名为 .jpg 后上传 | 后端返回 400 INVALID_FILE_TYPE（magic bytes 校验失败） |
| AC-04 | 删除已选图片 | 上传2张图片后，点击第1张右上角× | 第1张从预览区消失，剩余1张，可继续添加图片 |
| AC-05 | 9张上限限制 | 已选9张图片时，点击"添加图片"按钮 | 按钮不可点击，页面无响应，不弹出文件选择器 |
| AC-06 | 上传进度显示 | 上传一张图片（网速限制为 Slow 3G） | 图片缩略图上显示进度圆环，完成后消失 |
| AC-07 | 上传失败重试 | 上传时断网 | 图片标记为上传失败（红色感叹号），点击后重新触发上传 |
| AC-08 | Mobile 相机上传 | Expo 端点击"添加图片" → 选择相机拍摄 | 拍摄后图片出现在预览区，上传成功 |
| AC-09 | 文件名随机化 | 上传任意图片，检查数据库 Upload 记录 | filename 为 UUID 格式，与原始文件名无关 |
| AC-10 | 图片 URL 可访问 | 取出响应中的 url，浏览器直接访问 | 图片正常显示（开发阶段 localhost:3002/uploads/reviews/...） |

### 9.2 性能验收

| 指标 | 目标值 | 测量方法 |
|------|--------|---------|
| 前端压缩耗时 | < 2s（5MB 图片） | Performance.now() 测量 |
| 单张图片上传（4G网络） | < 3s | Network 面板 |

### 9.3 完成标志

- [ ] 后端 `POST /api/uploads/review-photos` 端点实现（multer + magic bytes 校验）
- [ ] 前端图片选择/预览/删除组件实现（Web + Mobile + 小程序）
- [ ] 前端压缩逻辑实现（Canvas / expo-image-manipulator）
- [ ] Upload 记录写入数据库
- [ ] TypeScript 编译零错误
- [ ] 开发阶段静态文件可通过 URL 访问

---

## 10. 开发记录

### 10.1 实现进度

| 任务 | 负责人 | 开始日期 | 完成日期 | 状态 |
|------|-------|---------|---------|------|
| NestJS multer 上传端点 | - | - | - | 未开始 |
| ServeStaticModule 静态文件配置 | - | - | - | 未开始 |
| Web 图片上传组件（含 Canvas 压缩） | - | - | - | 未开始 |
| Mobile expo-image-manipulator 压缩 | - | - | - | 未开始 |
| 小程序 Taro.chooseImage 上传 | - | - | - | 未开始 |

### 10.2 变更记录

| 日期 | 变更内容 | 原因 | 更改者 |
|------|---------|------|-------|
| 2026-03-29 | 初版创建，采用开发阶段本地 multer 方案 | Phase B 快速启动，OSS 迁移在生产前完成 | CEO++ |

---

*本 PRD 为 M15-PRD-UGC评价系统 的延伸功能 PRD，遵循 SCP-03 PRD 先行铁律。*
