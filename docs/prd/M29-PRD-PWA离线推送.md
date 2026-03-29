# M29-PRD-PWA离线推送 (PWA + Offline + Push Notifications)

> Sprint D3 | 优先级: P1 | 状态: Draft
> 最后更新: 2026-03-29

---

## 1. 概述

### 1.1 产品目标
将 JOINUS.COM Web 端升级为渐进式 Web 应用(PWA)，支持离线浏览、安装到主屏幕和 Web Push 推送通知，同时为 Mobile (Expo) 端接入推送通知系统，实现全平台触达能力。

### 1.2 竞品对标
| 竞品 | 对标功能 | JOINUS.COM 适配 |
|------|----------|----------------|
| Agoda PWA | 离线浏览已查看的酒店、安装横幅、Push通知促销 | 离线浏览已缓存圣地/路线、安装横幅、推送行程提醒 |
| Twitter Lite (X) | Service Worker 缓存策略、App Shell、离线页面 | App Shell 架构、缓存优先策略、离线回退页 |
| Starbucks PWA | 离线菜单浏览、极快加载、安装引导 | 离线内容浏览、骨架屏加载、安装引导组件 |
| Flipkart Lite | 2G环境下可用、推送促销、Add-to-homescreen | 弱网环境友好、推送朝圣提醒、主屏安装 |

### 1.3 目标用户
- **朝圣旅行者**: 在网络不稳定的偏远圣地，仍可查看行程和圣地信息
- **日常用户**: 通过推送通知接收行程状态变更、促销活动
- **移动用户**: 在手机浏览器中获得接近原生App的体验

---

## 2. 用户故事

| ID | 角色 | 故事 | 验收标准 |
|----|------|------|----------|
| US-01 | 旅行者 | 在没有网络的山区圣地，我想查看已缓存的圣地信息和行程安排 | 离线状态下可访问已浏览的页面 |
| US-02 | 用户 | 我想把网站安装到手机主屏幕，像App一样打开 | manifest.json + 安装横幅 + 全屏模式 |
| US-03 | 用户 | 行程状态变更时，我想收到推送通知 | Web Push + Expo Push 通知 |
| US-04 | 运营 | 我想向用户推送促销活动通知 | Admin 后台批量推送能力 |
| US-05 | 用户 | 网络断开时，我想看到友好的离线提示页面 | 自定义离线回退页面 |

---

## 3. 功能设计

### 3.1 Web Manifest (manifest.json)

```json
{
  "name": "JOINUS — 全球祖庭旅行",
  "short_name": "JOINUS",
  "description": "加入我们，探索世界宗教文化圣地",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#020617",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["travel", "lifestyle"],
  "lang": "zh-CN",
  "orientation": "portrait-primary"
}
```

### 3.2 Service Worker 缓存策略

| 资源类型 | 缓存策略 | 说明 |
|----------|----------|------|
| App Shell (HTML/CSS/JS) | Cache First, Network Fallback | 核心框架资源优先从缓存加载 |
| API 数据 (/api/*) | Network First, Cache Fallback | 优先获取最新数据，离线时回退缓存 |
| 图片资源 | Cache First (max-age 7d) | 图片缓存7天，减少流量 |
| 字体/静态资源 | Cache First (max-age 30d) | 长期缓存 |
| 离线回退 | 预缓存 /offline 页面 | 所有请求失败时展示 |

**缓存预加载 (Precache)**:
- /offline (离线回退页)
- App Shell (主布局 + 导航)
- 首页数据 (12大信仰列表)

**运行时缓存 (Runtime Cache)**:
- 用户浏览过的圣地详情页
- 用户浏览过的路线详情页
- 用户的行程列表数据

### 3.3 离线页面 (/offline)

设计要素:
- JOINUS 品牌 Logo
- "您当前处于离线状态" 提示
- 已缓存页面列表 (可点击访问)
- "重新连接" 按钮 (navigator.onLine 检测)
- 简约设计，匹配深色殿堂风

### 3.4 安装横幅 (Install Banner)

触发条件:
- 用户访问 >= 2次
- 未安装 PWA
- 满足浏览器 PWA 安装条件

UI:
- 底部弹出横幅: "安装 JOINUS 到主屏幕，离线也能查看行程"
- 安装/忽略 两个按钮
- 7天内不重复弹出 (localStorage 记录)

### 3.5 Web Push 通知

**通知类型**:
| 类型 | 触发时机 | 内容 |
|------|----------|------|
| TRIP_STATUS | 行程状态变更 | "您的行程已确认，准备出发吧！" |
| ORDER_STATUS | 订单状态变更 | "订单支付成功，行程已激活" |
| PROMOTION | 管理员推送 | "限时优惠：春季朝圣路线8折" |
| REMINDER | 行程出发前1天 | "明天出发，请检查行李和证件" |

**技术流程**:
1. 用户授权通知 → 获取 PushSubscription
2. 将 subscription 存储到后端 (新增 PushSubscription 表或字段)
3. 服务端事件触发 → web-push 库发送通知
4. 浏览器 Service Worker 的 push 事件处理 → 展示通知
5. 用户点击通知 → 打开对应页面

### 3.6 Mobile 推送 (Expo Push Notifications)

- 使用 `expo-notifications` SDK
- Expo Push Token 注册到后端
- 后端统一推送接口: 根据平台选择 Web Push 或 Expo Push
- 通知类型与 Web Push 一致

---

## 4. API 契约 (推送相关)

### 4.1 POST /api/notifications/subscribe

**说明**: 注册推送订阅

**Request Body**:
```json
{
  "platform": "WEB",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

或 Expo:
```json
{
  "platform": "EXPO",
  "expoPushToken": "ExponentPushToken[...]"
}
```

**Response 201**:
```json
{
  "id": "clx...",
  "message": "Subscription registered"
}
```

### 4.2 POST /api/notifications/push (Admin)

**说明**: 管理员批量推送

**Request Body**:
```json
{
  "type": "PROMOTION",
  "title": "限时优惠",
  "body": "春季朝圣路线8折",
  "link": "/promotions/spring-2026",
  "targetUserIds": []
}
```

**Response 200**:
```json
{
  "sent": 1234,
  "failed": 5
}
```

---

## 5. 技术方案

### 5.1 Web (Next.js 15)

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| Service Worker | next-pwa 或 手写 sw.js | Next.js 15 App Router 兼容 |
| Manifest | public/manifest.json | 在 layout.tsx 引用 |
| Web Push | web-push (npm) | VAPID 密钥对，服务端推送 |
| 离线检测 | navigator.onLine + online/offline 事件 | React hook: useOnlineStatus |
| 安装横幅 | beforeinstallprompt 事件 | React 组件: InstallBanner |

### 5.2 Mobile (Expo)

| 组件 | 技术选型 | 说明 |
|------|----------|------|
| Push Token | expo-notifications | registerForPushNotificationsAsync |
| 通知处理 | expo-notifications listeners | 前台/后台/关闭 三种状态 |
| 权限 | expo-permissions | 首次打开时请求通知权限 |

### 5.3 后端 (NestJS)

- 扩展现有 NotificationModule
- 新增 PushSubscription 存储 (可扩展 Notification 模型或新增表)
- web-push 库发送 Web Push
- expo-server-sdk 发送 Expo Push
- 推送任务队列 (可选 Bull + Redis)

### 5.4 文件结构
```
apps/web/
├── public/
│   ├── manifest.json
│   ├── sw.js (Service Worker)
│   ├── offline.html
│   └── icons/ (PWA icons)
├── src/
│   ├── components/
│   │   ├── InstallBanner.tsx
│   │   └── OfflineIndicator.tsx
│   └── hooks/
│       └── useOnlineStatus.ts

services/api/src/modules/notification/
├── notification.module.ts (扩展)
├── notification.controller.ts (新增 subscribe/push 端点)
├── notification.service.ts (扩展推送逻辑)
└── push.service.ts (新增: Web Push + Expo Push)
```

---

## 6. 验收标准

### 6.1 PWA 基础
- [ ] Lighthouse PWA 审计得分 >= 90
- [ ] manifest.json 正确配置，浏览器可检测到 PWA
- [ ] Android Chrome 显示 "添加到主屏幕" 提示
- [ ] 安装后全屏模式运行，无浏览器地址栏

### 6.2 Service Worker
- [ ] 首次访问后，App Shell 资源被缓存
- [ ] 离线状态下可访问已浏览的页面
- [ ] 离线状态下未缓存的页面跳转到 /offline 回退页
- [ ] 重新上线后自动恢复实时数据

### 6.3 Push 通知
- [ ] Web: 用户授权后可接收推送通知
- [ ] Mobile: Expo Push Token 注册成功
- [ ] 行程状态变更时触发推送
- [ ] Admin 可批量推送促销通知
- [ ] 点击通知跳转到对应页面

### 6.4 安装横幅
- [ ] 第2次访问时显示安装横幅
- [ ] 忽略后7天内不再弹出
- [ ] 已安装PWA后不再显示

---

## 7. 里程碑

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | manifest.json + 基础 Service Worker + 离线页 | 待排期 |
| Phase 2 | 缓存策略实现 + 安装横幅 | 待排期 |
| Phase 3 | Web Push 后端 + 前端订阅 | 待排期 |
| Phase 4 | Expo Push Notifications 接入 | 待排期 |
| Phase 5 | Admin 推送管理面板 | 待排期 |

---

## 8. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| Next.js 15 App Router + Service Worker 兼容性 | SW 注册失败 | 使用 next-pwa 或自定义 sw.js 放 public/ |
| iOS Safari PWA 限制 | 无 Web Push、有限离线 | 降级体验：iOS 仅离线缓存，推送走 Expo |
| VAPID 密钥管理 | 安全风险 | 密钥存 .env，不入 Git |
| 大量推送并发 | 接口超时 | Bull 队列异步处理 |
