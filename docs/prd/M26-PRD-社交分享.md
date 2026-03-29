# M26-PRD-社交分享系统

> 模块: 社交分享
> 对标: Airbnb (分享到社交平台) / TripAdvisor (评价分享) / Trip.com (行程分享)
> Sprint: D1 | 优先级: P0

---

## 1. 概述

为JOINUS.COM所有内容页面添加社交分享能力，支持微信/微博/Facebook/Twitter/WhatsApp等主流平台。

### 1.1 分享场景
- 圣地详情页 → "分享这个圣地给朋友"
- 行程详情 → "分享我的朝圣行程"
- 攻略/游记 → "分享这篇攻略"
- 社区问答 → "分享这个问题"
- 促销活动 → "分享优惠给朋友"

### 1.2 竞品对标

| 特性 | Airbnb | TripAdvisor | Trip.com | JOINUS |
|------|--------|-------------|----------|--------|
| Web Share API | ✅ | ✅ | ✅ | ✅ |
| OG Meta | ✅ | ✅ | ✅ | ✅ |
| 微信分享 | ❌ | ❌ | ✅ | ✅ |
| 复制链接 | ✅ | ✅ | ✅ | ✅ |
| 二维码 | ❌ | ❌ | ✅ | ✅ |
| 分享追踪 | ✅ | ✅ | ✅ | ✅ |

---

## 2. 技术方案

### 2.1 Web分享组件 (ShareButton)
```
<ShareButton
  title="xxx圣地"
  description="探索世界最神圣的地方"
  url="/holy-sites/xxx"
  image="/images/xxx.jpg"
/>
```

分享渠道:
1. **Web Share API** (移动端优先) — navigator.share()
2. **降级方案** — 弹出分享面板:
   - 微信 (生成二维码)
   - 微博 (URL scheme)
   - Facebook (sharer.php)
   - Twitter/X (intent/tweet)
   - WhatsApp (api.whatsapp.com)
   - 复制链接 (clipboard API)

### 2.2 OG Meta (Open Graph)
Next.js metadata API动态生成:
```
og:title — 页面标题
og:description — 页面描述
og:image — 封面图
og:url — 当前URL
og:type — website/article
```

### 2.3 API端点
- POST /api/shares — 记录分享事件 (platform, entityType, entityId)
- GET /api/shares/stats — 分享统计 (Admin)

### 2.4 Mobile分享
- React Native Share API (Expo Sharing)
- 微信SDK (react-native-wechat-lib)

### 2.5 Miniprogram分享
- Taro.showShareMenu() + onShareAppMessage
- 微信内置分享能力

---

## 3. 分享追踪

每次分享记录:
- userId (可选，未登录为null)
- platform (wechat/weibo/facebook/twitter/whatsapp/copy)
- entityType (holy_site/trip/guide/question/promotion)
- entityId
- createdAt

---

## 4. 验收标准

- [ ] 所有内容详情页有分享按钮
- [ ] Web Share API在移动端浏览器正常调起
- [ ] 降级分享面板在桌面端正常显示
- [ ] OG Meta在Facebook/Twitter预览正确
- [ ] 微信分享卡片标题+图片+描述正确
- [ ] 分享事件记录到数据库
- [ ] Mobile端原生分享弹窗正常
- [ ] 小程序分享到微信好友/朋友圈正常
