# Phase D 生态扩展路线图 — 对标Booking全球化/Airbnb社交/Agoda移动体验

> 创建时间: 2026-03-29
> 状态: 🚀 执行中
> 前置: Phase A(核心)+B(体验升级)+C(商业闭环) 全部完成

---

## 战略目标

Phase D = JOINUS.COM 从"功能完整"走向"全球NO.1"的生态扩展阶段。

核心交付:
1. **多语言系统** — 7语言全站覆盖 (中/英/日/韩/泰/印地/阿拉伯) + RTL支持
2. **社交分享** — Web Share API + 微信 + 各平台原生分享
3. **商家入驻** — 供应商管理平台 (祖庭/导游/住宿)
4. **数据分析** — 用户行为/转化漏斗/运营仪表盘
5. **移动优先** — PWA + 离线缓存 + 推送通知

---

## Sprint 规划

### Sprint D1: 多语言+社交分享 (对标Booking全球化+Airbnb分享)
```
Wave 1: PRD撰写 (3份)
  - M25-PRD-多语言系统.md — 全站i18n架构+7语言翻译
  - M26-PRD-社交分享.md — 分享组件+OG meta+深度链接
  - P24-PRD-语言设置页.md — 用户语言偏好设置

Wave 2: API后端
  - 用户语言偏好存储 (User.locale字段)
  - 分享链接生成API + OG meta动态生成
  - 内容多语言字段支持

Wave 3: Web前端
  - 补全5语言(ja/ko/ar/hi/th)所有Phase B+C翻译键 (~63键×5语言)
  - 语言切换器升级 (Header下拉+持久化)
  - 社交分享组件 (Web Share API + 降级按钮)
  - OG meta动态注入 (Next.js metadata)

Wave 4: Mobile+Miniprogram
  - Mobile: expo-localization + i18n Provider + 7语言
  - Miniprogram: Taro i18n + 7语言
  - 两端社交分享 (RN Share API / 微信SDK)

Wave 5: Admin+验证+部署
  - Admin: 翻译管理页面
  - tsc全端0错误验证
  - Git commit + push + deploy
```

### Sprint D2: 商家入驻平台 (对标Booking供应商后台)
```
Wave 1: PRD
  - M27-PRD-商家入驻.md — 供应商注册/审核/管理
  - P25-PRD-商家后台.md — 供应商自助管理面板
  - P26-PRD-商家列表页.md — 用户端商家浏览

Wave 2: API
  - Merchant模型 + 审核流程
  - 商家CRUD + 商品/服务管理
  - 商家入驻申请API

Wave 3-4: Web + Mobile + Miniprogram + Admin
  - 商家入驻申请页
  - 商家详情/列表页
  - Admin商家审核管理
```

### Sprint D3: 数据分析+PWA (对标Expedia分析+Agoda移动体验)
```
Wave 1: PRD
  - M28-PRD-数据分析.md — 运营仪表盘+转化漏斗
  - M29-PRD-PWA离线推送.md — Service Worker+推送

Wave 2: API
  - 分析统计API (用户行为/转化/热门内容)
  - 推送通知API (Web Push + Expo Push)

Wave 3-4: Web + Mobile + Admin
  - Admin: 运营分析仪表盘 (Recharts)
  - Web: PWA manifest + Service Worker + 离线页
  - Web: Web Push通知
  - Mobile: Expo Push Notifications
```

---

## 验收标准

- [ ] 7语言切换无闪烁，RTL(阿拉伯语)布局正确
- [ ] 所有页面可分享到微信/Facebook/Twitter
- [ ] 商家可自助注册、提交审核、管理商品
- [ ] Admin仪表盘展示核心运营指标
- [ ] Web支持PWA安装、离线浏览、推送通知
- [ ] tsc全端0错误
