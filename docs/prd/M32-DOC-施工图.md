# M32-DOC 施工图 (Construction Plan)

> 项目++标准产出 | 隶属 M32 | v1.0 | 2026-04-08

## Wave 划分 (5-Wave 标准流程)

### Wave 1 — PRD (已完成)
- [x] M32-PRD-团队文化打造.md
- [x] P33 / P34 / P35 子页面 PRD
- [x] M32-DOC-施工图.md (本文件)
- [x] M32-CHECK-验收清单.md

### Wave 2 — API 层
**目录**: `services/api/src/modules/team-culture/`
1. `schema.prisma` 追加 6 张表 + 2 个 enum → `pnpm db:push`
2. 创建模块：
   - `team-culture.module.ts`
   - `team-culture.controller.ts` (公开端点)
   - `team-culture.admin.controller.ts` (admin 端点)
   - `team-culture.service.ts`
   - `dto/` (9 个 DTO)
   - `guards/team-member.guard.ts`
   - `guards/team-admin.guard.ts`
3. 接入 `app.module.ts`
4. 更新 `prisma/seed.ts`：6 主题包 + 2 案例 + 1 演示团队
5. 写单测：service 层 + state machine
6. Swagger 文档自动生成校验

### Wave 3 — Web (Next.js)
**目录**: `apps/web/src/app/team-culture/`
1. 新增路由树：
   - `/team-culture/page.tsx` (P33)
   - `/team-culture/themes/page.tsx` + `[slug]/page.tsx` (P34)
   - `/team-culture/cases/page.tsx` + `[slug]/page.tsx`
   - `/team-culture/dashboard/page.tsx` + `[teamId]/...` (P35)
   - `/team-culture/join/[token]/page.tsx`
2. 组件库 `src/components/team-culture/` (参见 P33-P35)
3. API 客户端 `src/lib/api/team-culture.ts`
4. i18n 键 `team_culture.*` → 7 语言翻译
5. 全局导航菜单增加「团队共修」入口
6. 首页 footer/header 新增 B 端入口链接

### Wave 4 — Admin (Vite)
**目录**: `apps/admin/src/pages/team-culture/`
1. 销售线索看板 (Kanban 按 status 分栏，拖拽改状态)
2. 团队管理 CRUD
3. 主题包管理 CRUD
4. 案例管理 CRUD + 发布开关
5. 证书签发工具 (选团队+主题+生成PDF)
6. 路由接入 Admin 导航

### Wave 5 — Mobile + 小程序 + 验证提交
1. Mobile：新增「团队」Tab 或「我的」内嵌入口 (只读 2 屏：团队列表 + 证书墙)
2. 小程序：团队扫码加入页 + 证书分享海报
3. 全审++ hohoho：V1-V5 + D6-D11
4. 修复 P0/P1
5. Git commit (≤30文件/次，分模块提交)
6. 更新 CLAUDE.md「Sprint 历史」行：Phase F1/F2

## 文件清单预估 (≤120文件)
| 端 | 新文件 | 修改 |
|----|--------|------|
| API | ~25 | 3 (app.module/schema/seed) |
| Web | ~30 | 2-3 (nav/i18n) |
| Admin | ~10 | 1-2 |
| Mobile | ~4 | 1 |
| 小程序 | ~3 | 1 |
| Docs | 5 (已完成) | 1 (CLAUDE.md) |
| **合计** | **~77** | **~10** |

分 4 次 commit：prisma+api / web / admin / mobile+mini。

## 依赖
- 复用：user / holy-site / route / trip / upload / share / chat / i18n
- 新依赖包：无 (nanoid / qrcode 若需邀请token生成，已在项目中)

## 关键决策
- 团队成员权限三级：OWNER > ADMIN > MEMBER (不再细分，避免复杂度)
- 证书本期走服务端生成 PDF (puppeteer 或 pdfkit，二选一 — 建议 pdfkit 避免 chromium 依赖)
- 案例库 seed 2 条标杆案例，其余后台创建
- 小程序/Mobile 本期只读，写操作留 F3
