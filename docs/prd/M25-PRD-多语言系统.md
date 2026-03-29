# M25-PRD-多语言系统 (i18n)

> 模块: 多语言国际化系统
> 对标: Booking.com (25+语言) / Trip.com (20+语言) / Airbnb (60+语言)
> Sprint: D1 | 优先级: P0

---

## 1. 概述

JOINUS.COM 面向全球用户，需支持中/英/日/韩/泰/印地/阿拉伯7种语言的完整本地化体验。

### 1.1 目标
- 全站UI文本100%覆盖7语言
- RTL(阿拉伯语)布局完美适配
- 用户语言偏好持久化(localStorage + 数据库)
- Mobile/Miniprogram同步支持i18n
- 语言切换实时生效，无页面刷新

### 1.2 竞品对标

| 特性 | Booking | Trip.com | Airbnb | JOINUS |
|------|---------|----------|--------|--------|
| 语言数量 | 25+ | 20+ | 60+ | 7 |
| RTL支持 | ✅ | ✅ | ✅ | ✅ |
| 自动检测 | ✅ | ✅ | ✅ | ✅ |
| 用户偏好 | ✅ | ✅ | ✅ | ✅ |
| 移动端i18n | ✅ | ✅ | ✅ | ✅ |

---

## 2. 架构设计

### 2.1 Web (Next.js)
- 现有: I18nProvider + useTranslation hook + 7个JSON locale文件
- 升级: 补全Phase B+C新增键 (~63键×5语言=315条翻译)
- 语言检测: navigator.language → localStorage → 默认zh-CN

### 2.2 Mobile (Expo)
- 新增: expo-localization检测系统语言
- i18n Provider + useTranslation hook (与Web同构)
- 7个locale JSON文件 (从Web同步+移动端专属键)

### 2.3 Miniprogram (Taro)
- 新增: Taro i18n context + 语言切换
- 7个locale JSON文件 (精简版，仅小程序页面键)

### 2.4 API
- User模型新增 locale 字段 (默认 "zh-CN")
- 响应头 Content-Language 反映用户语言

---

## 3. 支持语言

| 代码 | 语言 | 方向 | 状态 |
|------|------|------|------|
| zh-CN | 简体中文 | LTR | ✅ 完整 |
| en | English | LTR | ✅ 完整 |
| ja | 日本語 | LTR | ⚠️ 缺Phase B+C键 |
| ko | 한국어 | LTR | ⚠️ 缺Phase B+C键 |
| th | ไทย | LTR | ⚠️ 缺Phase B+C键 |
| hi | हिन्दी | LTR | ⚠️ 缺Phase B+C键 |
| ar | العربية | RTL | ⚠️ 缺Phase B+C键 |

---

## 4. 翻译键清单 (需补全)

Phase B+C新增键 (~63个):
- nav.deals, nav.coupons, nav.packages, nav.prices, nav.membership
- coupon.* (12键)
- promotion.* (8键)
- checkout.* (额外键)
- review.* (额外键)
- profile.* (额外键)
- 其他Phase B+C页面键

---

## 5. 验收标准

- [ ] 7语言JSON文件键数完全一致 (0 missing keys)
- [ ] 阿拉伯语RTL布局: Header/导航/卡片镜像正确
- [ ] 语言切换即时生效，无页面闪烁
- [ ] Mobile支持系统语言自动检测
- [ ] Miniprogram支持微信系统语言
- [ ] 用户登录后语言偏好同步到数据库
