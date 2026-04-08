# M32-PRD 团队文化打造 (Team Culture Building)

> 主模块PRD | Owner: CEO++ | 状态: Active v1.1 | 创建: 2026-04-08 | 更新: 2026-04-08
> 协议依据: SCP-02(竞品全吸收) / SCP-03(PRD先行) / SCP-06(Phase F扩展)
> 关联协议: 项目++ / 业务++ / 页面++ / 飞轮++ / 五全++

---

## v1.1 重大调整 (CEO++亲令 · 2026-04-08)

**背景**: v1.0 落地后 CEO++ 巡检发现两个原则性偏差,即刻 hotfix:

1. **UI 体系冲突**: v1.0 团队文化模块沿用了"暗色殿堂风(#0f172a 黑底 + #D4A855 金色)",
   与 ZUTING/Joinus 主品牌的"蓝色光明体系(#3264ff 蓝 + 白底)"产生强烈视觉割裂。
   决议: 团队文化模块全量改造为蓝色光明体系,与 Header / 首页 / 路线 / 行程 等模块统一。
   - Hero: `bg-gradient-to-br from-[#3264ff] via-[#4a7aff] to-[#1e4dcc]`
   - Body: `bg-white text-gray-900`
   - 强调色: `text-[#3264ff]`, hover `bg-blue-50`
   - 不再出现 `#D4A855` / `#0f172a` / `#020617` / `bg-white/5`

2. **业务焦点偏移**: v1.0 把"学校 / 宗教组织"列为同等优先客户,稀释了 B2B 旗舰定位。
   决议: **核心客户聚焦企业 (ENTERPRISE) / 高管团队 (EXECUTIVE) / 家族办公室 (FAMILY_OFFICE)**,
   学校 / 宗教组织从前台 UI 隐藏(数据库 enum 保留以兼容历史数据)。
   前台 5 个组织类型 Tab: 企业团队 / 高管团队 / 家族办公室 / 公益组织 / 政府机关。

**影响范围**:
- Web: TeamCultureLanding + 7 个子页面 + home-client 卡片 + i18n keys 重写
- Mobile: app/team-culture.tsx 全量蓝色化
- Miniprogram: pages/team-culture/* 全量蓝色化
- Backend: Prisma TeamOrgType 新增 EXECUTIVE / FAMILY_OFFICE
- Admin: TeamCultureManagePage 组织类型下拉用中文 label
- Seed: SCHOOL 案例替换为 EXECUTIVE 案例

---

## 0. 元数据

| 字段 | 值 |
|------|-----|
| 模块号 | M32 |
| 模块名 | 团队文化打造 (Team Culture) |
| 业务线 | B2B2C 企业/组织团建 |
| Phase | F (生态深化) |
| 优先级 | P0 — CEO++亲自指派 |
| 预计 Sprint | F2 |
| 五端覆盖 | Web ✅ / Admin ✅ / Mobile 🟡(查看为主) / 小程序 🟡(查看+签到) |

---

## 1. 战略定位

### 1.1 为什么 ZUTING 要做这个模块
ZUTING 已有 C 端朝圣旅行闭环 (Phase A-E)。团队文化打造是 **B 端入口**，把"个人朝圣"升级为"组织共修共行"：
- **企业**: 用朝圣替代庸俗团建，塑造同心/感恩/传承的企业文化
- **学校**: 文化研学，让学生在祖庭里学传统文化
- **宗教组织**: 自发组织朝山团、共修团
- **NGO/家族**: 公益使命之旅、家族寻根

### 1.2 差异化护城河
对比 Booking 团体预订 / Trip.com 企业差旅 / Airbnb Experiences：
- 它们卖**住宿+机票**；ZUTING 卖**文化主题 + 12大信仰深度 + 共修仪式**
- 它们是**采购流程**；ZUTING 是**文化养成流程**
- 不可复制点：60圣地+27祖庭+30印仪式+小鸿AI讲解

### 1.3 商业模型
- **主收入**: 团队定制套餐 (¥/人 × 人数 × 服务费率 15-25%)
- **增值**: 文化主题包(标准/精品/旗舰) / 私享导师 / 团体仪式 / 文化证书
- **沉淀**: 团队画像 → 复购+口碑+案例库 → 飞轮

---

## 2. 用户画像与三问测试 (业务++ BLG)

### 2.1 主用户
| 角色 | 痛点 | 决策权 |
|------|------|--------|
| HR/行政总监 | 团建无新意、员工疲惫、无文化沉淀 | 选方案/审预算 |
| 创始人/CEO | 想给团队注入精神内核 | 拍板 |
| 学校教导主任 | 研学活动缺深度 | 审方案 |
| 寺院/教会负责人 | 组织朝山团缺平台工具 | 全权 |
| 家族族长 | 寻根之旅缺执行力 | 全权 |

### 2.2 三问测试 (BLG-02)
- **Q1 目标用户?** HR/创始人/教导主任/宗教组织负责人/家族族长
- **Q2 帮做什么决策?** 选哪个文化主题、选哪条路线、确定人数预算、签约执行、回收文化沉淀
- **Q3 去掉会变差?** 没有 B 端入口，ZUTING 永远只是 OTA，无法承接组织级订单和文化沉淀飞轮

✅ 三问全过，业务边界成立。

---

## 3. 作用域 (Scope)

### 3.1 In-Scope
- 团队文化模块官网入口 (品牌着陆页)
- 6 大文化主题包 (同心/感恩/传承/匠心/慈悲/坚毅)
- 行业解决方案库 (企业/学校/宗教/家族/NGO/政府)
- 成功案例展示 + 案例详情
- 询价表单 → 销售线索池 → 后台跟进
- 团队管理中心 (成员/行程/相册/证书)
- 团队画像与文化标签
- 文化证书生成 (PDF + 链上锚定可选)
- Admin: 销售线索/团队/案例/主题包 CRUD
- API: team-culture 模块 (~12 路由)
- DB: 6 张新表

### 3.2 Out-of-Scope (本期)
- 链上证书 NFT (留F3)
- 直播共修间 (依赖 chat 模块扩展，留F3)
- 团队 IM 工作台 (复用现有 chat 模块即可)
- 多团队联合活动 (留F3)

---

## 4. 功能规则与铁律

### 4.1 核心规则
- **R-M32-01** 团队创建必须绑定 ownerUserId，所有权变更走转让流程
- **R-M32-02** 团队成员邀请走 token 链接，token 24h 过期，单次使用
- **R-M32-03** 询价(TeamInquiry)状态机：`NEW → CONTACTED → QUOTED → SIGNED → DELIVERED → CLOSED` / `LOST`
- **R-M32-04** 文化主题包(TeamCultureTheme)与 holy-site/route 多对多关联，复用现有内容资产
- **R-M32-05** 证书生成必须落库，签发时间不可改，撤销走作废而非删除
- **R-M32-06** 案例(TeamCase)涉及隐私，发布前必须勾选 `consentSigned`，否则不允许 publish
- **R-M32-07** 所有 B 端写接口必须 `JwtAuthGuard + RolesGuard`，团队管理接口走 `TeamMemberGuard` (BLG IDOR)
- **R-M32-08** 询价表单后端必须 `class-validator` 校验手机号/邮箱/人数/预算范围 + 速率限制 5/min/IP

### 4.2 状态机 (TeamInquiryState)
```
NEW ──► CONTACTED ──► QUOTED ──► SIGNED ──► DELIVERED ──► CLOSED
  │          │           │           │
  └──► LOST ◄┴───────────┴───────────┘
```
终态：CLOSED / LOST。审计日志 → `TeamInquiryLog`。

### 4.3 安全 (HELL)
- IDOR：`/team/:id/*` 必须验证 caller 是该 team 的 OWNER/ADMIN/MEMBER
- 速率限制：询价表单、邀请发送各自独立桶
- XSS：团队描述/案例故事必须 sanitize
- 文件：相册上传走现有 upload 模块，size ≤ 10MB

---

## 5. 数据模型 (Prisma)

新增 6 张表：

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  orgType     TeamOrgType
  industry    String?
  size        Int      @default(0)
  description String?  @db.Text
  logoUrl     String?
  city        String?
  ownerId     String
  owner       User     @relation("TeamOwner", fields: [ownerId], references: [id])
  members     TeamMember[]
  inquiries   TeamInquiry[]
  certificates TeamCertificate[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([ownerId])
}

enum TeamOrgType { ENTERPRISE SCHOOL RELIGIOUS NGO FAMILY GOVERNMENT OTHER }

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId    String
  role      TeamMemberRole @default(MEMBER)
  joinedAt  DateTime @default(now())
  @@unique([teamId, userId])
  @@index([userId])
}

enum TeamMemberRole { OWNER ADMIN MEMBER GUEST }

model TeamCultureTheme {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  subtitle    String?
  description String   @db.Text
  color       String
  icon        String?
  coverUrl    String?
  keywords    String[]
  // 关联资产
  holySites   String[] // holySite slug array
  routes      String[] // route slug array
  rituals     Json?    // [{name, durationMin, description}]
  priceFrom   Int?     // 起价(分)
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(true)
  inquiries   TeamInquiry[]
  cases       TeamCase[]
}

model TeamInquiry {
  id          String   @id @default(cuid())
  teamId      String?
  team        Team?    @relation(fields: [teamId], references: [id])
  themeId     String?
  theme       TeamCultureTheme? @relation(fields: [themeId], references: [id])
  contactName String
  contactRole String?
  phone       String
  email       String?
  orgName     String
  headcount   Int
  budget      Int?     // 分
  preferredAt DateTime?
  message     String?  @db.Text
  source      String?  // utm
  status      TeamInquiryStatus @default(NEW)
  assignedTo  String?  // admin user id
  logs        TeamInquiryLog[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([status])
  @@index([assignedTo])
}

enum TeamInquiryStatus { NEW CONTACTED QUOTED SIGNED DELIVERED CLOSED LOST }

model TeamInquiryLog {
  id         String   @id @default(cuid())
  inquiryId  String
  inquiry    TeamInquiry @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
  fromStatus TeamInquiryStatus?
  toStatus   TeamInquiryStatus
  operatorId String
  note       String?  @db.Text
  createdAt  DateTime @default(now())
}

model TeamCase {
  id          String   @id @default(cuid())
  slug        String   @unique
  teamName    String
  orgType     TeamOrgType
  industry    String?
  themeId     String?
  theme       TeamCultureTheme? @relation(fields: [themeId], references: [id])
  headcount   Int
  story       String   @db.Text
  highlights  String[]
  photos      String[]
  videoUrl    String?
  testimonial String?  @db.Text
  consentSigned Boolean @default(false)
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
}

model TeamCertificate {
  id        String   @id @default(cuid())
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  tripId    String?
  themeId   String?
  title     String
  serialNo  String   @unique
  pdfUrl    String?
  imageUrl  String?
  issuedAt  DateTime @default(now())
  revokedAt DateTime?
  revokedReason String?
}
```

迁移：`pnpm db:push` (开发) + 写入 seed (≥3主题/2案例)。

---

## 6. API 契约 (~12 路由)

模块：`services/api/src/modules/team-culture/`

| 方法 | 路径 | Guard | 说明 |
|------|------|-------|------|
| GET  | /api/team-culture/themes | Public | 主题包列表 |
| GET  | /api/team-culture/themes/:slug | Public | 主题详情 |
| GET  | /api/team-culture/cases | Public | 已发布案例列表(分页) |
| GET  | /api/team-culture/cases/:slug | Public | 案例详情 |
| POST | /api/team-culture/inquiries | Public + RateLimit(5/min) | 提交询价 |
| POST | /api/team-culture/teams | Jwt | 创建团队 |
| GET  | /api/team-culture/teams/me | Jwt | 我所属团队列表 |
| GET  | /api/team-culture/teams/:id | TeamMemberGuard | 团队详情 |
| PATCH | /api/team-culture/teams/:id | TeamAdminGuard | 更新团队 |
| POST | /api/team-culture/teams/:id/members/invite | TeamAdminGuard | 生成邀请token |
| POST | /api/team-culture/teams/join/:token | Jwt | 接受邀请 |
| GET  | /api/team-culture/teams/:id/certificates | TeamMemberGuard | 团队证书列表 |
| (Admin) PATCH | /api/admin/team-culture/inquiries/:id/status | AdminRole | 流转线索状态 |
| (Admin) POST  | /api/admin/team-culture/cases | AdminRole | 创建/发布案例 |
| (Admin) POST  | /api/admin/team-culture/certificates | AdminRole | 签发证书 |

DTO：全部 class-validator。响应：标准 `{items,total,page,pageSize}` 或资源对象。

---

## 7. 子页面PRD索引

| 编号 | 文件 | 端 |
|------|------|----|
| P33 | P33-PRD-团队文化首页.md | Web |
| P34 | P34-PRD-团队文化方案库.md | Web |
| P35 | P35-PRD-团队管理中心.md | Web |
| (待) | P36-PRD-询价表单页 | Web |
| (待) | P37-PRD-成功案例详情 | Web |
| (待) | A28-PRD-Admin销售线索看板 | Admin |

本期先交付 P33/P34/P35 三页 + Admin线索看板。

---

## 8. 五端对齐 (五全++ FF)

| 端 | 范围 | 说明 |
|----|------|------|
| Web | 入口+方案+案例+询价+团队中心 | 主战场 |
| Admin | 线索/团队/主题/案例/证书 5 页 | 销售运营 |
| Mobile | 团队首页(只读)+证书查看+团队相册 | 复用 web API |
| 小程序 | 团队码扫码+签到+证书分享 | 引流回流 |

---

## 9. 验收 (六线全绿)

详见 `M32-CHECK-验收清单.md`。核心：
- V1: tsc 0 / 无 any / 命名规范
- V2: API 全连通 + DTO 校验 + 状态机
- V3: 三态/响应式/i18n 7 语言
- V4: Guard + IDOR + RateLimit + sanitize
- V5: 列表 take/Max(100) / 分页 / 缓存 staleTime 分级
- D6-D11: IDOR/契约/韧性/安全深度/状态机/数据完整 全过

---

## 10. 风险与决策

| 风险 | 缓解 |
|------|------|
| B 端销售线索冷启动 | 第一批由 CEO 渠道导入，案例库 seed 2 个标杆 |
| 主题包内容空洞 | 复用现有 holy-site/route，不重复造内容 |
| 团队权限复杂 | 复用现有 user 体系 + 三角色简化(OWNER/ADMIN/MEMBER) |
| Mobile/小程序工作量 | 本期只读，写操作留 F3 |

---

## 11. 联动协议
- 业务++(BLG): 三问测试已过
- 项目++(PJ): 本 PRD 即为标准产出
- 页面++(PQM): P33/P34/P35 各自走对标流程
- 飞轮++(FW): 询价→团队→行程→证书→案例 闭环
- 五全++(FF): 见 §8
- 全审++(FA): 模块完工后触发 hohoho

---
