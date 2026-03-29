# M21-PRD-套餐打包

> 模块主PRD | Sprint C2 | 版本 v1.0 | 2026-03-29
> 状态: 待评审 | 负责人: CEO

---

## 一、竞品对标分析

### 1.1 对标竞品

| 竞品 | 套餐打包亮点 | 可借鉴功能 |
|------|------------|-----------|
| **Expedia** | 机+酒+行程三合一，一键打包省钱提示，价格日历选最优组合 | 打包折扣可视化、组合灵活度、行程管理集成 |
| **Trip.com** | 跟团+自由行双轨，套餐包含说明图标化，会员专属套餐价 | 图标化includes展示、会员专属价格、按日行程 |
| **Booking.com** | 度假套餐（住宿+体验），套餐详情页高质量图片，按人数动态定价 | 沉浸式图片、人数定价、体验产品融合 |
| **Agoda** | 限时Flash Deal套餐，早鸟价倒计时，积分+现金混合支付 | 促销时限感、积分抵扣、亚洲市场本地化 |
| **携程** | 跟团游/半自助/自由行三类，路线图+行程单，导游评价体系 | 行程路线可视化、导游匹配、UGC评价 |

### 1.2 JOINUS差异化护城河

- **宗教文化主题套餐**: 每个套餐与具体圣地/祖庭绑定，包含宗教文化解说服务
- **修行体验融合**: 套餐可包含法事体验、冥想课程、祖师讲解等独特元素
- **多信仰覆盖**: 佛教/道教/基督教等12大信仰各有对应主题套餐
- **会员专属价**: 配合M20会员体系，Lv3+会员享早鸟价优先权

---

## 二、用户故事

```
US-M21-01 [P0]
作为 想朝圣的用户
我希望 浏览不同类型的朝圣套餐
以便   找到适合自己预算和需求的整体方案

US-M21-02 [P0]
作为 准备预订套餐的用户
我希望 看到套餐详细包含内容（住宿/交通/导游/餐饮）
以便   清晰了解套餐价值后做预订决策

US-M21-03 [P0]
作为 已选定套餐的用户
我希望 填写人数/日期/联系人后完成预订
以便   快速锁定套餐名额

US-M21-04 [P1]
作为 Lv3+会员
我希望 看到并购买会员专属价格的套餐
以便   享受等级特权带来的实际优惠

US-M21-05 [P1]
作为 带队领袖
我希望 预订团队朝圣套餐（5人+）
以便   以团体优惠价组织朝圣活动

US-M21-06 [P2]
作为 管理员
我希望 在后台创建/编辑/下架套餐
以便   灵活管理平台套餐供给
```

---

## 三、功能清单

### 3.1 P0 核心功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-M21-01 | 套餐列表 | 5类套餐展示，支持类型/价格/时长筛选排序 |
| F-M21-02 | 套餐详情 | 封面图、包含内容、按日行程、相关圣地 |
| F-M21-03 | 套餐预订 | 人数/日期选择，提交预订，生成PackageBooking |
| F-M21-04 | 我的套餐订单 | 查看预订记录，状态追踪 |

### 3.2 P1 重要功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-M21-05 | 会员专属价 | Lv3+会员看到并可购买memberPrice |
| F-M21-06 | 早鸟价优先 | Lv3+会员在正式开售前24h可预订 |
| F-M21-07 | 套餐分享 | 生成分享链接/海报，带邀请码 |
| F-M21-08 | 套餐收藏 | 加入Wishlist，下次快速找到 |

### 3.3 P2 扩展功能

| 功能ID | 功能名称 | 说明 |
|--------|---------|------|
| F-M21-09 | 套餐评价 | 完成后可对套餐打分评价 |
| F-M21-10 | 推荐套餐 | 基于用户信仰偏好推荐匹配套餐 |
| F-M21-11 | 套餐比较 | 最多3个套餐并排对比功能 |
| F-M21-12 | 定制套餐申请 | Lv5会员提交定制需求表单 |

---

## 四、套餐类型定义

| 类型Key | 中文名 | 包含内容 | 适合人群 |
|---------|-------|---------|---------|
| CLASSIC_PILGRIMAGE | 经典朝圣 | 行程规划 + 住宿 | 个人/情侣初次朝圣 |
| DEEP_EXPERIENCE | 深度体验 | 行程 + 住宿 + 专业导游 | 希望深入了解宗教文化 |
| VIP_ALL_INCLUSIVE | 尊享VIP | 全包（行程+住宿+导游+餐饮+接送） | 高端用户，无忧体验 |
| FREE_STYLE | 自由行 | 住宿 + 交通方案 | 独立旅行者 |
| GROUP_PILGRIMAGE | 团队朝圣 | 5人+团队优惠，含导游 | 宗教团体/家庭 |

---

## 五、数据模型

### 5.1 Prisma Schema

```prisma
model TravelPackage {
  id            String      @id @default(cuid())
  name          String
  description   String      @db.Text
  coverImage    String?
  packageType   PackageType
  basePrice     Int                           // 单位: 分（人民币）
  memberPrice   Int?                          // 会员专属价，单位: 分
  includes      Json                          // { accommodation: bool, transport: bool, guide: bool, meals: bool, custom: string[] }
  duration      Int                           // 天数
  maxPersons    Int         @default(20)
  entityType    String?                       // "HOLY_SITE" | "TEMPLE" | null
  entityIds     String[]                      // 关联圣地/祖庭ID列表
  isActive      Boolean     @default(true)
  sortOrder     Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  bookings      PackageBooking[]
  itinerary     PackageItineraryDay[]

  @@index([packageType, isActive])
  @@map("travel_packages")
}

model PackageItineraryDay {
  id          String        @id @default(cuid())
  packageId   String
  day         Int           // 第N天
  title       String        // 如"第一天：抵达成都，前往青城山"
  description String        @db.Text
  activities  Json          // [{ time: "09:00", activity: "...", location: "..." }]

  package     TravelPackage @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@index([packageId, day])
  @@map("package_itinerary_days")
}

model PackageBooking {
  id          String               @id @default(cuid())
  packageId   String
  userId      String
  orderId     String?              // 关联支付订单
  persons     Int
  totalPrice  Int                  // 实际支付金额（分）
  status      PackageBookingStatus @default(PENDING)
  startDate   DateTime
  contactName String
  contactPhone String
  notes       String?
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  package     TravelPackage @relation(fields: [packageId], references: [id])

  @@index([userId, createdAt])
  @@map("package_bookings")
}

enum PackageType {
  CLASSIC_PILGRIMAGE
  DEEP_EXPERIENCE
  VIP_ALL_INCLUSIVE
  FREE_STYLE
  GROUP_PILGRIMAGE
}

enum PackageBookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

---

## 六、API契约

### 6.1 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/packages | 套餐列表（分页+筛选） | 可选 |
| GET | /api/packages/:id | 套餐详情 | 可选 |
| POST | /api/packages/:id/book | 预订套餐 | 必须 |
| GET | /api/packages/my-bookings | 我的预订列表 | 必须 |
| GET | /api/packages/my-bookings/:id | 预订详情 | 必须 |
| PATCH | /api/packages/my-bookings/:id/cancel | 取消预订 | 必须 |

### 6.2 GET /api/packages

**查询参数:**
```
page: number (default: 1)
pageSize: number (default: 12, max: 50)
packageType: PackageType (可选)
minPrice: number (分，可选)
maxPrice: number (分，可选)
minDuration: number (天，可选)
maxDuration: number (天，可选)
sort: PRICE_ASC | PRICE_DESC | DURATION_ASC | POPULAR (default: POPULAR)
```

**响应体:**
```json
{
  "items": [
    {
      "id": "clpkg001",
      "name": "峨眉山经典朝圣3日游",
      "packageType": "CLASSIC_PILGRIMAGE",
      "coverImage": "https://cdn.joinus.com/packages/emeishan.jpg",
      "basePrice": 198000,
      "memberPrice": 168000,
      "duration": 3,
      "maxPersons": 20,
      "includes": {
        "accommodation": true,
        "transport": false,
        "guide": false,
        "meals": false
      },
      "entityType": "HOLY_SITE",
      "entityIds": ["clsite001"]
    }
  ],
  "total": 23,
  "page": 1,
  "pageSize": 12
}
```

### 6.3 GET /api/packages/:id

**响应体（含完整行程）:**
```json
{
  "id": "clpkg001",
  "name": "峨眉山经典朝圣3日游",
  "description": "...",
  "coverImage": "...",
  "packageType": "CLASSIC_PILGRIMAGE",
  "basePrice": 198000,
  "memberPrice": 168000,
  "includes": { "accommodation": true, "transport": false, "guide": false, "meals": false },
  "duration": 3,
  "maxPersons": 20,
  "itinerary": [
    {
      "day": 1,
      "title": "抵达成都，登峨眉山",
      "description": "...",
      "activities": [
        { "time": "09:00", "activity": "集合出发", "location": "成都东站" },
        { "time": "14:00", "activity": "抵达峨眉山，参拜报国寺", "location": "报国寺" }
      ]
    }
  ],
  "relatedSites": [
    { "id": "clsite001", "name": "峨眉山", "religion": "佛教" }
  ],
  "isActive": true
}
```

### 6.4 POST /api/packages/:id/book

**请求体:**
```json
{
  "persons": 2,
  "startDate": "2026-05-01T00:00:00Z",
  "contactName": "张三",
  "contactPhone": "13800138000",
  "notes": "需要素食餐"
}
```

**响应体:**
```json
{
  "id": "clbkg001",
  "packageId": "clpkg001",
  "packageName": "峨眉山经典朝圣3日游",
  "persons": 2,
  "totalPrice": 396000,
  "status": "PENDING",
  "startDate": "2026-05-01T00:00:00Z",
  "createdAt": "2026-03-29T10:00:00Z"
}
```

---

## 七、页面线框（ASCII）

```
套餐列表页（P18详细设计见 P18-PRD-套餐列表页.md）

┌─────────────────────────────────────────┐
│  发现朝圣套餐                            │
├─────────────────────────────────────────┤
│  [全部][经典][深度][VIP][自由行][团队]    │
│  价格: [¥0——¥5000] 时长: [1-14天]       │
│  排序: [热门▼]                           │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │  [图片]  │  │  [图片]  │            │
│  │ 峨眉山3日│  │ 五台山5日│            │
│  │ 经典朝圣 │  │ 深度体验 │            │
│  │ [住宿✓] │  │ [住宿✓] │            │
│  │ ¥1,980  │  │ [导游✓] │            │
│  │ 会员¥1,680│  │ ¥3,580  │            │
│  │ [立即预订]│  │ [立即预订]│            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

---

## 八、验收标准

- [ ] F-M21-01: 5类套餐筛选Tab均生效，空状态友好提示
- [ ] F-M21-01: 排序（价格/时长/热门）切换正确
- [ ] F-M21-02: 详情页行程按天展示，includes图标完整
- [ ] F-M21-03: 预订表单校验（人数>0，日期>今天，手机格式）
- [ ] F-M21-03: 预订成功后跳转订单确认页
- [ ] F-M21-04: 我的预订列表正确显示状态
- [ ] F-M21-05: Lv3+用户看到会员价，Lv1/2不显示
- [ ] 价格显示：basePrice/100 = 元，保留两位小数
- [ ] 最大人数限制：超过maxPersons返回400

---

## 九、技术约束

```
[TC-M21-01] 价格全部以"分"存储（Int），前端除以100显示元
[TC-M21-02] memberPrice可null，显示时判断用户等级决定是否展示
[TC-M21-03] includes字段为JSON，后端定义TypeScript interface约束结构
[TC-M21-04] entityIds为String[]，通过关联查询获取圣地/祖庭详情
[TC-M21-05] 预订时totalPrice = (useMemberPrice ? memberPrice : basePrice) * persons
[TC-M21-06] isActive=false的套餐不在列表展示，直接访问详情返回404
[TC-M21-07] 遵守 [R-64] findMany取套餐列表max 50条
```

---

*PRD版本: v1.0 | 创建: 2026-03-29 | 子PRD: P18/P19*
