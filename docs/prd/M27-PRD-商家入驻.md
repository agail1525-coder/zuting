# M27-PRD-商家入驻

> 版本: v1.0 | 创建日期: 2026-03-29 | 状态: 待评审
> 模块类型: 主模块PRD | 所属平台: Web + Admin + Mobile + 小程序

---

## 一、竞品对标分析

### 1.1 竞品功能矩阵

| 竞品 | 商家类型 | 入驻流程 | 审核机制 | 商家后台 | 佣金模式 |
|------|---------|---------|---------|---------|---------|
| Booking.com | 酒店/民宿/公寓 | 线上注册→提交证照→审核→上线 | 人工+自动双审 | 独立Extranet后台 | 按订单佣金15-25% |
| Airbnb | 房东(个人/商业) | 引导式注册→上传房源→即时上线 | AI审核+举报机制 | Host Dashboard | 服务费3%+客人14% |
| Trip.com | 酒店/景点/导游/交通 | 企业注册→资质审核→签约→上线 | 人工审核+实地验证 | 商家中心 | 按类目差异佣金 |
| 美团 | 餐饮/酒店/景点/导游 | 线上+线下结合 | 人工审核+实地考察 | 商家版APP | 佣金+推广费 |
| 飞猪 | OTA/景区/导游/酒店 | 企业开店→资质→审核→上线 | 平台审核 | 商家工作台 | 佣金制 |

### 1.2 竞品优势学习点

- **Booking.com Extranet**: 独立商家后台，数据看板清晰，订单/日历/价格管理一体化
- **Airbnb Host Portal**: 引导式上架流程(分步骤填写)，照片AI优化建议，预计收入计算器
- **Trip.com 商家中心**: 多类目支持(酒店/导游/交通)，资质分类管理，服务质量评分体系
- **美团商家版**: 移动端商家管理，实时订单推送，营销工具(优惠/推广)
- **飞猪商家工作台**: 店铺装修，商品模板，批量管理工具

### 1.3 差异化定位

JOINUS.COM 商家入驻 = 宗教文化垂直供应商生态 + 四大商家类型(寺庙/导游/住宿/交通) + 文化资质认证 + 信仰匹配推荐

与通用旅行平台不同，JOINUS.COM商家需要具备宗教文化领域的专业性和敬畏心，入驻审核侧重文化资质和服务理念。

---

## 二、概述

### 2.1 模块定义

商家入驻系统是JOINUS.COM商业闭环的核心基础设施，允许祖庭/寺庙、导游、住宿提供者、交通服务商在平台注册、提交资质、接受审核并上线运营。该系统连接供给侧(服务提供者)与需求侧(朝圣旅行者)，是Phase D生态扩展的关键模块。

### 2.2 目标用户

| 用户角色 | 描述 | 核心诉求 |
|---------|------|---------|
| 寺庙/祖庭管理者 | 宗教场所的官方管理人员 | 展示寺庙信息、管理参拜预约、发布活动 |
| 导游 | 具备宗教文化知识的专业导游 | 发布导游服务、管理行程订单、获取客源 |
| 住宿提供者 | 寺庙周边的民宿/酒店/禅房经营者 | 上架房源、管理房态、处理订单 |
| 交通服务商 | 提供朝圣路线交通的车队/司机 | 发布线路、管理车辆调度、接单 |
| 平台运营 | JOINUS.COM运营团队 | 审核商家资质、监控服务质量、管理生态 |

---

## 三、商家类型

### 3.1 类型定义

```typescript
enum MerchantType {
  TEMPLE         = 'TEMPLE',          // 寺庙/祖庭
  GUIDE          = 'GUIDE',           // 导游
  ACCOMMODATION  = 'ACCOMMODATION',   // 住宿
  TRANSPORT      = 'TRANSPORT',       // 交通
}
```

### 3.2 各类型资质要求

| 类型 | 必须资质 | 可选资质 | 特殊要求 |
|------|---------|---------|---------|
| TEMPLE | 宗教活动场所登记证、法人证明 | 文物保护单位证书 | 需宗教事务部门备案 |
| GUIDE | 导游证、身份证 | 宗教文化专项培训证书 | 需通过平台文化知识考核 |
| ACCOMMODATION | 营业执照、消防许可、卫生许可 | 民宿特种经营许可 | 距离圣地10km内优先 |
| TRANSPORT | 道路运输经营许可证、车辆行驶证 | 旅游客运资质 | 车辆保险有效期内 |

---

## 四、入驻流程

### 4.1 流程图

```
用户注册/登录
    │
    ▼
选择商家类型
    │
    ▼
填写基本信息 (名称/描述/联系方式/地址)
    │
    ▼
上传资质证照 (按类型不同)
    │
    ▼
提交审核 → 状态: PENDING
    │
    ├── 审核通过 → 状态: APPROVED → 完善服务信息 → 上线 → 状态: ACTIVE
    │
    ├── 审核驳回 → 状态: REJECTED → 修改后可重新提交
    │
    └── 补充材料 → 状态: PENDING (通知补充)
```

### 4.2 商家状态机

```typescript
enum MerchantStatus {
  PENDING    = 'PENDING',     // 待审核
  APPROVED   = 'APPROVED',    // 审核通过(未上线)
  ACTIVE     = 'ACTIVE',      // 已上线运营中
  SUSPENDED  = 'SUSPENDED',   // 已暂停(违规/主动)
  CLOSED     = 'CLOSED',      // 已关闭(永久)
}
```

### 4.3 状态转换规则

```
AllowedTransitions:
  PENDING   → APPROVED | REJECTED
  REJECTED  → PENDING (重新提交)
  APPROVED  → ACTIVE | CLOSED
  ACTIVE    → SUSPENDED | CLOSED
  SUSPENDED → ACTIVE | CLOSED
  CLOSED    → (终态，不可恢复)
```

| 转换 | 触发者 | 条件 |
|------|-------|------|
| PENDING → APPROVED | 运营审核员 | 资质审核通过 |
| PENDING → REJECTED | 运营审核员 | 资质不合规，附驳回理由 |
| REJECTED → PENDING | 商家 | 修改资料后重新提交 |
| APPROVED → ACTIVE | 商家 | 完善服务信息并确认上线 |
| ACTIVE → SUSPENDED | 运营/系统 | 违规/投诉过多/主动暂停 |
| SUSPENDED → ACTIVE | 运营审核员 | 整改通过，恢复上线 |
| * → CLOSED | 运营/商家 | 永久退出平台 |

---

## 五、数据模型

### 5.1 Merchant 表

```prisma
model Merchant {
  id            String          @id @default(cuid())
  userId        String          @unique
  user          User            @relation(fields: [userId], references: [id])
  type          MerchantType
  name          String          @db.VarChar(100)
  description   String?         @db.Text
  logo          String?         @db.VarChar(500)
  license       String?         @db.VarChar(500)   // 主资质证照URL
  licenseExtra  Json?           // 附加资质证照URLs数组
  status        MerchantStatus  @default(PENDING)
  rejectReason  String?         @db.Text
  contactPhone  String          @db.VarChar(20)
  contactEmail  String          @db.VarChar(100)
  address       String?         @db.VarChar(300)
  latitude      Float?
  longitude     Float?
  rating        Float           @default(0)
  totalOrders   Int             @default(0)
  totalRevenue  Float           @default(0)
  commissionRate Float          @default(0.10)     // 平台佣金比例
  verifiedAt    DateTime?
  activatedAt   DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  // 关联
  services      MerchantService[]
  reviews       Review[]

  @@index([type])
  @@index([status])
  @@index([rating])
}

enum MerchantType {
  TEMPLE
  GUIDE
  ACCOMMODATION
  TRANSPORT
}

enum MerchantStatus {
  PENDING
  APPROVED
  ACTIVE
  SUSPENDED
  CLOSED
}
```

### 5.2 MerchantService 表 (商家服务)

```prisma
model MerchantService {
  id            String    @id @default(cuid())
  merchantId    String
  merchant      Merchant  @relation(fields: [merchantId], references: [id])
  name          String    @db.VarChar(200)
  description   String?   @db.Text
  category      String    @db.VarChar(50)    // 服务分类
  price         Float
  currency      String    @default("CNY") @db.VarChar(3)
  unit          String    @db.VarChar(20)    // 每人/每晚/每趟
  images        Json?                         // 图片URLs数组
  isActive      Boolean   @default(true)
  maxCapacity   Int?                          // 最大容量(人/间)
  availableFrom DateTime?
  availableTo   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([merchantId])
  @@index([category])
  @@index([isActive])
}
```

---

## 六、API契约

### 6.1 端点总览

| # | 方法 | 端点 | 权限 | 说明 |
|---|------|------|------|------|
| 1 | POST | /api/merchants/register | 登录用户 | 商家注册(提交入驻申请) |
| 2 | GET | /api/merchants/my | 商家 | 获取当前用户的商家信息 |
| 3 | PATCH | /api/merchants/my | 商家 | 更新商家信息 |
| 4 | GET | /api/merchants | 公开 | 商家列表(用户端浏览) |
| 5 | GET | /api/merchants/:id | 公开 | 商家详情 |
| 6 | POST | /api/merchants/:id/approve | 管理员 | 审核通过 |
| 7 | POST | /api/merchants/:id/suspend | 管理员 | 暂停商家 |
| 8 | GET | /api/merchants/:id/stats | 商家/管理员 | 商家运营统计 |

### 6.2 详细契约

#### 6.2.1 POST /api/merchants/register

商家注册/入驻申请。

**Request Body:**
```json
{
  "type": "GUIDE",
  "name": "李明佛教文化导游",
  "description": "专注佛教四大名山导览，10年从业经验",
  "logo": "https://cdn.joinus.com/merchants/logo-xxx.jpg",
  "license": "https://cdn.joinus.com/merchants/license-xxx.jpg",
  "licenseExtra": ["https://cdn.joinus.com/merchants/cert1.jpg"],
  "contactPhone": "13800138000",
  "contactEmail": "liming@example.com",
  "address": "安徽省池州市九华山风景区",
  "latitude": 30.4867,
  "longitude": 117.8024
}
```

**Response 201:**
```json
{
  "id": "clxyz123...",
  "type": "GUIDE",
  "name": "李明佛教文化导游",
  "status": "PENDING",
  "createdAt": "2026-03-29T10:00:00.000Z"
}
```

**校验规则:**
- `type`: 必填，枚举 MerchantType
- `name`: 必填，2-100字符
- `contactPhone`: 必填，手机号格式
- `contactEmail`: 必填，邮箱格式
- 同一userId只能注册一个商家(唯一约束)

#### 6.2.2 GET /api/merchants/my

获取当前登录用户的商家信息。

**Response 200:**
```json
{
  "id": "clxyz123...",
  "type": "GUIDE",
  "name": "李明佛教文化导游",
  "description": "...",
  "status": "ACTIVE",
  "rating": 4.8,
  "totalOrders": 156,
  "totalRevenue": 78000.00,
  "commissionRate": 0.10,
  "services": [
    {
      "id": "clsvc001",
      "name": "九华山一日深度导览",
      "price": 299,
      "unit": "每人",
      "isActive": true
    }
  ],
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

#### 6.2.3 PATCH /api/merchants/my

更新商家信息。PENDING状态下可修改全部字段(重新提交审核)；ACTIVE状态下仅可修改description/logo/contactPhone/contactEmail/address。

**Request Body (部分更新):**
```json
{
  "description": "更新后的描述",
  "contactPhone": "13900139000"
}
```

#### 6.2.4 GET /api/merchants

公开的商家列表，支持分页、筛选、排序。

**Query Parameters:**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页条数(max 100) |
| type | MerchantType | - | 按类型筛选 |
| keyword | string | - | 搜索名称/描述 |
| sortBy | string | rating | 排序字段: rating/totalOrders/createdAt |
| sortOrder | string | desc | asc/desc |
| lat | number | - | 纬度(附近排序) |
| lng | number | - | 经度(附近排序) |

**Response 200:**
```json
{
  "items": [
    {
      "id": "clxyz123...",
      "type": "GUIDE",
      "name": "李明佛教文化导游",
      "description": "专注佛教四大名山导览...",
      "logo": "...",
      "rating": 4.8,
      "totalOrders": 156,
      "address": "安徽省池州市九华山"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

**注:** 仅返回status=ACTIVE的商家。

#### 6.2.5 GET /api/merchants/:id

商家详情页，包含商家信息+服务列表+评价统计。

**Response 200:**
```json
{
  "id": "clxyz123...",
  "type": "GUIDE",
  "name": "李明佛教文化导游",
  "description": "...",
  "logo": "...",
  "rating": 4.8,
  "totalOrders": 156,
  "address": "安徽省池州市九华山",
  "latitude": 30.4867,
  "longitude": 117.8024,
  "services": [
    {
      "id": "clsvc001",
      "name": "九华山一日深度导览",
      "description": "...",
      "price": 299,
      "currency": "CNY",
      "unit": "每人",
      "images": ["..."],
      "maxCapacity": 15,
      "isActive": true
    }
  ],
  "reviewStats": {
    "total": 89,
    "averageRating": 4.8,
    "distribution": { "5": 62, "4": 18, "3": 6, "2": 2, "1": 1 }
  },
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

#### 6.2.6 POST /api/merchants/:id/approve

管理员审核通过/驳回商家。

**Request Body:**
```json
{
  "action": "approve",        // "approve" | "reject"
  "reason": "资质审核通过"     // reject时必填驳回理由
}
```

**Response 200:**
```json
{
  "id": "clxyz123...",
  "status": "APPROVED",
  "verifiedAt": "2026-03-29T12:00:00.000Z"
}
```

#### 6.2.7 POST /api/merchants/:id/suspend

管理员暂停/恢复商家。

**Request Body:**
```json
{
  "action": "suspend",         // "suspend" | "restore"
  "reason": "收到多次投诉，暂停营业整改"
}
```

#### 6.2.8 GET /api/merchants/:id/stats

商家运营统计数据。

**Response 200:**
```json
{
  "overview": {
    "totalOrders": 156,
    "totalRevenue": 78000.00,
    "platformCommission": 7800.00,
    "netRevenue": 70200.00,
    "averageRating": 4.8,
    "totalReviews": 89
  },
  "monthly": [
    {
      "month": "2026-03",
      "orders": 23,
      "revenue": 8970.00,
      "rating": 4.9
    }
  ],
  "topServices": [
    {
      "serviceId": "clsvc001",
      "name": "九华山一日深度导览",
      "orders": 78,
      "revenue": 23322.00
    }
  ]
}
```

---

## 七、页面线框

### 7.1 入驻申请页 (用户端)

```
┌─────────────────────────────────────────────┐
│  成为JOINUS合作伙伴                           │
│  "与百万朝圣者连接，分享您的专业服务"            │
├─────────────────────────────────────────────┤
│                                             │
│  选择商家类型:                                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ 🏛️   │ │ 🧭   │ │ 🏨   │ │ 🚐   │      │
│  │寺庙   │ │导游   │ │住宿   │ │交通   │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│  ─── Step 1/3: 基本信息 ───                  │
│  商家名称:  [____________________]           │
│  描述:      [____________________]           │
│  联系电话:  [____________________]           │
│  联系邮箱:  [____________________]           │
│  地址:      [____________________]           │
│                                             │
│  ─── Step 2/3: 资质上传 ───                  │
│  营业执照/证书: [上传区域]                     │
│  附加资质:      [上传区域] (可选)              │
│  LOGO:          [上传区域] (可选)              │
│                                             │
│  ─── Step 3/3: 确认提交 ───                  │
│  [ ] 我已阅读并同意《商家入驻协议》             │
│  [        提交入驻申请        ]               │
│                                             │
└─────────────────────────────────────────────┘
```

### 7.2 管理后台审核列表

```
┌─────────────────────────────────────────────┐
│  商家审核管理                                  │
│  状态筛选: [全部▼] 类型: [全部▼] 搜索: [___]   │
├────┬──────┬──────┬──────┬──────┬──────┬────┤
│ ID │ 名称  │ 类型  │ 状态  │ 提交时间│ 评分 │操作│
├────┼──────┼──────┼──────┼──────┼──────┼────┤
│ 01 │李明导游│GUIDE │PENDING│03-28 │ -   │审核│
│ 02 │九华禅院│TEMPLE│ACTIVE │03-15 │4.8  │管理│
│ 03 │朝圣巴士│TRANS │SUSPEND│03-20 │3.2  │恢复│
└────┴──────┴──────┴──────┴──────┴──────┴────┘
```

---

## 八、验收标准

### 8.1 功能验收

| # | 验收项 | 标准 |
|---|--------|------|
| 1 | 商家注册 | 登录用户可选择类型、填写信息、上传资质并提交 |
| 2 | 唯一约束 | 同一用户只能注册一个商家，重复注册提示已存在 |
| 3 | 状态流转 | 状态变更严格遵循AllowedTransitions，终态不可回退 |
| 4 | 审核流程 | 管理员可查看待审核列表，通过/驳回并填写理由 |
| 5 | 驳回理由 | 驳回时reason必填，商家可看到驳回原因并修改重提 |
| 6 | 商家列表 | 用户端仅展示ACTIVE商家，支持类型筛选/关键词搜索/评分排序 |
| 7 | 商家详情 | 展示完整商家信息+服务列表+评价统计 |
| 8 | 运营统计 | 商家可查看自己的订单/收入/评分统计 |

### 8.2 安全验收

| # | 验收项 | 标准 |
|---|--------|------|
| 1 | 认证 | 所有非公开端点需JwtAuthGuard |
| 2 | 授权 | /my端点验证userId匹配，管理端点需ADMIN角色 |
| 3 | IDOR防护 | 商家只能访问自己的数据，不能通过修改id访问他人 |
| 4 | 输入校验 | 所有DTO字段使用class-validator装饰器 |
| 5 | 分页限制 | 列表接口pageSize最大100，防OOM |

### 8.3 体验验收

| # | 验收项 | 标准 |
|---|--------|------|
| 1 | 三态处理 | loading骨架屏/error提示/empty引导 |
| 2 | 分步表单 | 入驻申请分3步，支持上一步/下一步，数据不丢失 |
| 3 | 上传体验 | 资质图片支持拖拽/预览/删除，限制5MB |
| 4 | 审核通知 | 审核结果通过站内信/短信通知商家 |
| 5 | 响应式 | Web/Mobile/小程序适配 |

---

## 九、非功能需求

| 维度 | 要求 |
|------|------|
| 性能 | 商家列表接口 < 200ms(P95) |
| 可用性 | 入驻流程断点续传(关闭浏览器后数据不丢) |
| 可扩展 | 商家类型枚举可扩展，不硬编码业务逻辑 |
| 审计 | 所有状态变更记录操作人、时间、原因 |
| 合规 | 商家资质信息加密存储，符合个人信息保护法 |

---

## 十、关联模块

| 模块 | 关联方式 |
|------|---------|
| M08-用户与认证 | 商家基于User扩展，共享认证体系 |
| M06-订单与支付 | 订单关联商家，佣金结算 |
| M15-UGC评价系统 | 评价关联商家，影响rating |
| M19-促销引擎 | 商家可创建自己的促销活动 |
| P25-商家后台 | 商家自助管理面板 |
| P26-商家列表页 | 用户端商家浏览 |
