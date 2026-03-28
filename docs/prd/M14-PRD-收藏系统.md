# M14 收藏系统 产品需求文档

> 版本: v1.0 | 日期: 2026-03-29 | 状态: 待开发 | 优先级: P0 (Phase B)

---

## 1. 需求背景与目标

### 1.1 业务背景

朝圣者在浏览圣地、祖庭、祖师等内容时，往往希望将感兴趣的内容保存下来，以便后续规划行程或分享给同行者。目前平台缺乏收藏机制，用户探索的内容无法沉淀，流失严重。

收藏系统将填补这一核心缺口，帮助用户构建个人的"朝圣心愿清单"，提升用户粘性与平台活跃度，同时为行程规划模块提供内容输入。

### 1.2 竞品对标分析

| 竞品 | 核心功能 | 差异点 | JOINUS 借鉴策略 |
|------|----------|--------|-----------------|
| Airbnb Wishlist | 命名收藏夹 + 封面图 + 社交分享 + 多设备同步 | 收藏夹可成为旅行企划工具 | 完全复刻命名夹+封面图+分享链接机制 |
| Booking.com 心愿单 | 按目的地归类 + 价格变动提醒 + 多人协作 | 实用性强，商业转化导向 | 借鉴快速收藏（一键心形）+ 空状态引导 |
| Trip.com 收藏夹 | 景点/酒店/攻略多类型收藏 + 分类标签 | 内容类型丰富，导购转化率高 | 借鉴多实体类型（圣地/祖庭/祖师）收藏 |

### 1.3 需求目标（量化）

| 指标 | 目标值 | 度量方式 |
|------|--------|----------|
| 快速收藏响应时间 | < 500ms (P95) | 前端埋点 + APM |
| 人均收藏数 | > 5 项/月（活跃用户） | 数据分析 |
| 收藏转行程率 | > 30% | 漏斗分析 |
| 分享链接月访问量 | > 1000 PV | GA/Umami |
| 收藏夹上限 | 50 个/用户 | 后端校验 |
| 单收藏夹容量 | 200 项 | 后端校验 |

### 1.4 需求范围

**包含：**
- 快速收藏（心形按钮，一键存入默认收藏夹）
- 收藏夹 CRUD（创建/重命名/删除/封面图）
- 收藏项管理（添加/移除/移动/备注）
- 分享链接（生成 shareToken，匿名可读）
- 公开/私密收藏夹切换
- 四端（Web / Mobile / 小程序 / Admin 统计）适配

**不包含：**
- 多人协作编辑收藏夹（v2）
- 收藏夹价格提醒（v3）
- 收藏推荐（基于收藏的个性化推荐，Phase C）

---

## 2. 用户故事

### US-01 一键收藏圣地

**作为** 正在浏览圣地详情页的朝圣者，
**我希望** 点击页面右上角的心形按钮即可收藏该圣地，
**以便** 快速保存感兴趣的内容，无需离开当前页面。

**验收标准：**
- [ ] 心形按钮出现在所有圣地/祖庭/祖师详情页右上角及列表卡片右上角
- [ ] 未登录时点击，弹出登录提示弹窗
- [ ] 已登录首次点击，自动存入「默认收藏夹」并显示 Toast「已收藏」
- [ ] 已收藏状态下点击，显示确认取消收藏提示，确认后移除
- [ ] 收藏动画：心形图标缩放 + 弹跳效果，耗时 300ms

### US-02 创建主题收藏夹

**作为** 计划华东朝圣之旅的用户，
**我希望** 创建一个名为「华东佛教祖庭之旅」的收藏夹并将相关圣地加入，
**以便** 我能将行程规划素材集中管理。

**验收标准：**
- [ ] 收藏夹列表页有「新建收藏夹」按钮
- [ ] 创建弹窗含：名称（必填，最多 50 字）、描述（选填，最多 200 字）、封面图（选填）、公开开关
- [ ] 创建成功后跳转到新收藏夹详情页
- [ ] 收藏夹数量上限 50 个，超出提示「收藏夹已达上限」

### US-03 分享收藏夹给同行者

**作为** 组织团体朝圣的领队，
**我希望** 生成收藏夹的分享链接发给团队成员，
**以便** 成员可以查看推荐的圣地列表但不能修改。

**验收标准：**
- [ ] 收藏夹详情页有「分享」按钮
- [ ] 点击生成唯一 shareToken 链接（/collections/shared/:token）
- [ ] 分享页面匿名可访问，显示收藏者昵称、收藏夹名称和内容列表
- [ ] 分享链接永久有效（除非用户手动关闭分享）
- [ ] 私密收藏夹不可生成分享链接（按钮置灰，提示「请先设为公开」）

### US-04 在详情页长按选择目标收藏夹

**作为** 拥有多个主题收藏夹的用户，
**我希望** 在收藏时能选择存入哪个收藏夹，
**以便** 将不同类型的圣地分类管理。

**验收标准：**
- [ ] 长按（移动端）或悬停后点击下拉（Web）心形按钮，弹出收藏夹选择器
- [ ] 选择器列表显示所有收藏夹（含已收藏状态标记）
- [ ] 支持同时选中多个收藏夹
- [ ] 选择器底部有「新建收藏夹」快捷入口

---

## 3. 业务流程

### 3.1 快速收藏流程

```
用户点击心形按钮
      │
      ▼
  已登录？
  ├── 否 → 弹出登录提示 → 登录后回调收藏操作
  └── 是
       │
       ▼
  当前内容已收藏？
  ├── 是 → 弹出「取消收藏」确认 → 确认 → DELETE /api/collections/quick-save
  └── 否 → POST /api/collections/quick-save → 存入默认收藏夹
              │
              ▼
          乐观更新 UI（心形实心）→ API 响应
          │                        │
        成功                      失败
          │                        │
        保持实心状态            回滚为空心 + 错误 Toast
```

### 3.2 创建收藏夹并添加内容流程

```
收藏夹列表页
      │
      ├── [新建按钮] → 填写名称/描述/封面/公开设置 → POST /api/collections
      │                                                       │
      │                                                  成功 → 跳转详情页
      │
      └── [打开已有收藏夹] → 收藏夹详情页
                                    │
                                    ├── [添加内容] → CollectionPicker 弹窗
                                    │                → POST /api/collections/:id/items
                                    │
                                    ├── [移除内容] → DELETE /api/collections/:id/items/:itemId
                                    │
                                    └── [分享] → POST /api/collections/:id/share
                                                  → 复制链接 Toast
```

### 3.3 业务规则清单

| 规则编号 | 描述 | 触发条件 | 处理逻辑 | 异常处理 |
|----------|------|----------|----------|----------|
| R-01 | 默认收藏夹不可删除 | 删除收藏夹 | 检查 isDefault 标记 | 返回 403，提示「默认收藏夹不可删除」 |
| R-02 | 收藏夹数量上限 | 创建收藏夹 | 检查用户当前收藏夹数 ≤ 50 | 超出返回 400 |
| R-03 | 收藏项数量上限 | 添加收藏项 | 检查收藏夹内容数 ≤ 200 | 超出返回 400 |
| R-04 | 收藏项唯一性 | 添加收藏项 | collectionId + entityType + entityId 联合唯一 | 返回 409，静默处理（前端不报错） |
| R-05 | 私密夹不可分享 | 生成分享链接 | 检查 isPublic 字段 | 返回 403，前端提示「请先设为公开」 |
| R-06 | 跨用户访问保护 | CRUD 操作 | 校验 collection.userId === req.user.id | 返回 403 (IDOR 防护) |
| R-07 | shareToken 访问 | GET /shared/:token | 无需认证，但 isPublic 须为 true | isPublic=false 返回 404 |

---

## 4. 功能清单

| 功能ID | 名称 | 描述 | 优先级 | 涉及端 |
|--------|------|------|--------|--------|
| F-01 | 快速收藏按钮 | 心形按钮，一键收藏到默认夹 | P0 | Web, Mobile, 小程序 |
| F-02 | 收藏夹 CRUD | 创建/重命名/设封面/删除收藏夹 | P0 | Web, Mobile |
| F-03 | 收藏项管理 | 添加/移除/移动/备注收藏内容 | P0 | Web, Mobile |
| F-04 | 收藏夹列表页 | 网格/列表展示所有收藏夹 | P0 | Web, Mobile, 小程序 |
| F-05 | 收藏夹详情页 | 展示收藏内容，支持多类型卡片 | P0 | Web, Mobile, 小程序 |
| F-06 | 分享链接 | 生成 shareToken，匿名可读页面 | P1 | Web |
| F-07 | CollectionPicker | 收藏夹选择器弹窗，支持多选 | P0 | Web, Mobile |
| F-08 | 公开/私密切换 | 收藏夹可见性设置 | P1 | Web, Mobile |
| F-09 | 收藏状态检查 | 页面加载时批量检查已收藏状态 | P0 | Web, Mobile, 小程序 |
| F-10 | Admin 收藏统计 | Dashboard 展示最多被收藏内容 Top10 | P2 | Admin |

---

## 5. 数据模型

### 5.1 实体关系

```
User (1) ──────< (N) Collection
Collection (1) ──────< (N) CollectionItem
CollectionItem.entityId → HolySite | Temple | Patriarch | Trip
```

### 5.2 核心字段

**Collection 收藏夹表：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String (cuid) | 是 | 主键 |
| userId | String (FK) | 是 | 所属用户 |
| name | String | 是 | 收藏夹名称，默认「默认收藏夹」 |
| description | String? | 否 | 收藏夹描述 |
| coverImage | String? | 否 | 封面图 URL（默认取第一个内容项图片） |
| isPublic | Boolean | 是 | 是否公开，默认 false |
| isDefault | Boolean | 是 | 是否为系统默认夹，默认 false |
| shareToken | String? (unique) | 否 | 分享令牌，唯一 |
| createdAt | DateTime | 是 | 创建时间 |
| updatedAt | DateTime | 是 | 更新时间 |

**CollectionItem 收藏项表：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String (cuid) | 是 | 主键 |
| collectionId | String (FK) | 是 | 所属收藏夹 |
| entityType | CollectionEntityType | 是 | 内容类型枚举 |
| entityId | String | 是 | 对应实体 ID |
| note | String? | 否 | 用户备注，最多 200 字 |
| sortOrder | Int | 否 | 自定义排序权重，默认 0 |
| createdAt | DateTime | 是 | 创建时间（用于按时间排序） |

**CollectionEntityType 枚举：**

```
HOLY_SITE   — 圣地
TEMPLE      — 祖庭
PATRIARCH   — 祖师
TRIP        — 行程
```

---

## 6. API 接口

| 接口 | Method | 路径 | 权限 | 说明 |
|------|--------|------|------|------|
| 收藏夹列表 | GET | /api/collections | JWT | 当前用户的所有收藏夹 |
| 创建收藏夹 | POST | /api/collections | JWT | 创建新收藏夹 |
| 收藏夹详情 | GET | /api/collections/:id | JWT | 含 items 列表 |
| 更新收藏夹 | PATCH | /api/collections/:id | JWT | 名称/描述/封面/公开设置 |
| 删除收藏夹 | DELETE | /api/collections/:id | JWT | 非默认夹才可删 |
| 添加收藏项 | POST | /api/collections/:id/items | JWT | 单项添加 |
| 删除收藏项 | DELETE | /api/collections/:id/items/:itemId | JWT | 移除单项 |
| 生成分享链接 | POST | /api/collections/:id/share | JWT | 返回 shareToken |
| 分享链接访问 | GET | /api/collections/shared/:token | 公开 | 返回只读收藏夹 |
| 快速收藏 | POST | /api/collections/quick-save | JWT | 存入默认收藏夹 |
| 检查收藏状态 | GET | /api/collections/check | JWT | ?entityType=&entityId= |

**CollectionCreateDto：**
```json
{
  "name": "string (required, maxLength: 50)",
  "description": "string (optional, maxLength: 200)",
  "coverImage": "string (optional, url)",
  "isPublic": "boolean (default: false)"
}
```

**CollectionItemCreateDto：**
```json
{
  "entityType": "HOLY_SITE | TEMPLE | PATRIARCH | TRIP",
  "entityId": "string (required)",
  "note": "string (optional, maxLength: 200)"
}
```

**QuickSaveDto：**
```json
{
  "entityType": "HOLY_SITE | TEMPLE | PATRIARCH | TRIP",
  "entityId": "string (required)"
}
```

---

## 7. 验收标准

| 标准编号 | 类别 | 描述 |
|----------|------|------|
| AC-01 | 性能 | 快速收藏接口响应 ≤ 500ms (P95) |
| AC-02 | 容量 | 收藏夹上限 50 个，超出返回 400 并有明确提示 |
| AC-03 | 容量 | 单收藏夹上限 200 项，超出返回 400 并有明确提示 |
| AC-04 | 安全 | 分享链接只读，无法通过链接修改数据 |
| AC-05 | 安全 | 跨用户访问收藏夹返回 403 |
| AC-06 | 功能 | 默认收藏夹在用户首次注册时自动创建，且不可删除 |
| AC-07 | 功能 | 分享链接 /collections/shared/:token 无需登录可访问 |
| AC-08 | UI | 收藏动画（心形缩放弹跳）在 Web / Mobile / 小程序三端均有实现 |
| AC-09 | 四端 | 收藏按钮嵌入所有圣地详情页、祖庭详情页、祖师详情页 |
| AC-10 | 数据 | 收藏项 entityType + entityId 联合唯一，重复收藏静默忽略 |
