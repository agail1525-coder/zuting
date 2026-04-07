# M32-CHECK 验收清单 (Acceptance Checklist)

> 项目++标准产出 | 隶属 M32 | v1.0 | 2026-04-08
> 执行：全审++ hohoho 通过后勾选

## V1 — 代码质量
- [ ] `pnpm -r tsc --noEmit` 零错
- [ ] 全模块无 `any`
- [ ] 命名符合 R-19~R-24
- [ ] 无死代码 / 无孤立文件 (HH-V04)
- [ ] ESLint 通过

## V2 — 功能完整 (垂直切片)
- [ ] 6 张表 db push 成功
- [ ] seed 生成 6 主题 / 2 案例 / 1 演示团队
- [ ] API 12 路由全部 Swagger 文档化
- [ ] DTO 全部 class-validator
- [ ] TeamInquiry 状态机 `AllowedTransitions` 生效
- [ ] 询价提交走通：表单 → API → DB → Admin 看板可见
- [ ] 团队创建 → 邀请 → 加入 → 退出 全闭环
- [ ] 证书签发 → 团队中心可见 → PDF 可下载

## V3 — 用户体验
- [ ] P33/P34/P35 loading / error / empty 三态齐全
- [ ] 移动端 375 / 414 响应式 OK
- [ ] i18n 7 语言 (zh/en/ja/ko/th/hi/ar) `team_culture.*` 键齐全
- [ ] 暗色主题一致
- [ ] 询价表单交互反馈 (toast / disabled / 防双提)
- [ ] 无 A11y 明显问题 (alt / label / tabindex)

## V4 — 安全
- [ ] 所有 Controller 有 `JwtAuthGuard + RolesGuard` 或 `@Public()`
- [ ] `/teams/:id/*` 走 `TeamMemberGuard` (IDOR)
- [ ] Admin 路由 `@Roles('ADMIN')`
- [ ] 询价表单速率限制 5/min/IP
- [ ] 团队描述 / 案例故事 sanitize
- [ ] 邀请 token 24h 过期 + 单次使用
- [ ] Prisma 无 enum 直传 Swagger

## V5 — 性能
- [ ] 列表接口 `take`/`@Max(100)`
- [ ] 分页标准格式
- [ ] next/image 优化
- [ ] useQuery staleTime 分级 (静态主题 5min / 动态团队 30s)
- [ ] Admin Kanban 分页加载

## D6 — IDOR 渗透
- [ ] 跨团队访问 403
- [ ] 非成员查证书 403
- [ ] shareToken 只允许读取对应资源

## D7 — 契约漂移
- [ ] 前后端路径一致
- [ ] 枚举值 Web / Admin / API 对齐
- [ ] 价格字段统一「分」
- [ ] 分页 `{items,total,page,pageSize}`

## D8 — 韧性
- [ ] findMany 均有 take
- [ ] PDF 生成超时包装 (10s)
- [ ] Promise.allSettled 用于详情页并行 fetch

## D9 — 安全深度
- [ ] DTO @MaxLength 保护长文本
- [ ] 错误响应不泄露内部堆栈
- [ ] 富文本字段 sanitize-html

## D10 — 状态机
- [ ] TeamInquiry 非法跳转 400
- [ ] 终态 CLOSED/LOST 不可再变
- [ ] 每次变更写 `TeamInquiryLog`

## D11 — 数据完整
- [ ] 邀请接受走 `$transaction` (验证 token + 创建 member + 失效 token)
- [ ] `@@unique([teamId,userId])` 防重复入团
- [ ] Team 删除级联 Members / Certificates

## 五全 (FF)
- [ ] Web ✅ / Admin ✅ / Mobile 只读 ✅ / 小程序 扫码+证书 ✅
- [ ] 共享类型更新到 `packages/shared-types`
- [ ] api-client 已生成

## 飞轮 (FW)
- [ ] 询价 → 团队 → 行程 → 证书 → 案例 闭环数据可查
- [ ] 事件链：创建团队 / 接受邀请 / 发起行程 / 签发证书 各自落日志

## 交付
- [ ] Git commit ≤30 文件/次，分 4 次
- [ ] CLAUDE.md 更新 Sprint 历史
- [ ] 保存++ 沉淀到记忆
