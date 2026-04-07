# P35-PRD 团队管理中心 (Team Dashboard)

> 子页面PRD | 隶属 M32 | v1.0 | 2026-04-08

## 0. 路径
- `/team-culture/dashboard` — 我的团队总览
- `/team-culture/dashboard/[teamId]` — 单团队工作台
- `/team-culture/dashboard/[teamId]/members`
- `/team-culture/dashboard/[teamId]/trips`
- `/team-culture/dashboard/[teamId]/certificates`
- `/team-culture/dashboard/[teamId]/album`

## 1. 前置
- 必须登录 (JwtAuthGuard)，未登录重定向到 /login?redirect=
- Owner/Admin 可写，Member 只读

## 2. 功能矩阵
| 子页 | 数据 | 写操作 | Guard |
|------|------|--------|-------|
| 总览 | GET /teams/me | 创建团队 | Jwt |
| 单团队 Home | GET /teams/:id | 编辑资料 (Owner/Admin) | TeamMemberGuard |
| 成员 | 成员列表 | 邀请/移除/改角色 | TeamAdminGuard |
| 行程 | 复用 trips API + teamId filter | 发起团队行程 | TeamAdminGuard |
| 证书 | GET /teams/:id/certificates | (签发由 Admin 后台) | TeamMemberGuard |
| 相册 | 复用 journal + teamId tag | 上传照片 | Member+ |

## 3. 组件清单
- `TeamSwitcher` (顶部切换当前团队)
- `TeamHeroCard` (logo+名称+规模+主理人)
- `TeamMemberTable` (邀请按钮 + 角色下拉)
- `InviteMemberModal` (生成链接/复制/二维码)
- `TeamTripsList` (复用 TripCard + 团队标签)
- `TeamCertificateWall` (证书墙 + PDF下载)
- `TeamAlbumGrid`

## 4. 交互规则
- 创建团队 → 默认 OWNER 为当前用户
- 邀请流程：Admin 点击 → 生成 token (24h) → 复制链接/二维码 → 被邀请者登录后访问 `/team-culture/join/:token` → 自动加入
- 证书点击 → 预览 Modal + 下载PDF + 分享链接 (shareToken)
- 转让 Owner：二次确认 modal + 邮件/短信验证 (本期：仅确认弹窗)

## 5. 验收
- [ ] 未登录正确重定向
- [ ] 非成员访问 /:id 返回 403 (IDOR防护)
- [ ] 邀请 token 过期/已用场景
- [ ] 成员列表空态
- [ ] 移动端表格转卡片
- [ ] i18n 7 语言
