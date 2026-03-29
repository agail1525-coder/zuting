# F06-PRD-相关推荐组件

> 版本: v1.0 | 创建: 2026-03-29 | 状态: 待评审
> 负责人: CEO++ | 所属模块: M16-推荐系统 | 所属Phase: Phase B

---

## 1. 功能概述

### 1.1 功能定位

"相关推荐组件"(RelatedEntities) 是嵌入所有实体详情页底部的通用横向滚动卡片列表，用于在用户阅读完当前详情后引导探索同类相关内容，减少用户离开平台的概率。

### 1.2 嵌入位置

| 页面 | 标题文案 | API 参数 |
|------|---------|---------|
| 圣地详情页 `/holy-sites/[id]` | 相关圣地 | `entityType=HOLY_SITE` |
| 祖庭详情页 `/temples/[id]` | 相关祖庭 | `entityType=TEMPLE` |
| 祖师详情页 `/patriarchs/[id]` | 相关祖师 | `entityType=PATRIARCH` |

### 1.3 通用性设计原则

组件接受 `entityType` 和 `entityId` 作为 Props，内部封装所有数据请求与渲染逻辑，宿主页面零感知。新增实体类型时只需传入对应参数，无需修改组件内部。

---

## 2. 竞品对标

### 2.1 Booking.com "Similar properties"

- **标题**: "Similar properties" + "You might also like"
- **数量**: 8-12 个，2-3 列横向滑动
- **卡片高度**: 较宽，图片占 55%，信息区 45%
- **价格显示**: 每卡片显示"从 ¥XXX 起"(JOINUS暂无价格，用评分代替)

### 2.2 TripAdvisor "Similar experiences"

- **滚动提示**: 最后一张卡片右侧露出下一张 1/3，暗示可继续滑动
- **"查看全部"链接**: 区块右上角，点击跳转到筛选了同宗教的列表页
- **JOINUS借鉴**: 露出提示 + "查看全部"

### 2.3 Airbnb 相关房源

- **地图联动**: 推荐列表悬停时，地图对应标注高亮
- **心愿单快捷添加**: 每卡片右上角 ♡ 按钮
- **JOINUS借鉴**: 收藏按钮集成

---

## 3. 组件 Props 定义

```typescript
interface RelatedEntitiesProps {
  entityType: 'HOLY_SITE' | 'TEMPLE' | 'PATRIARCH';
  entityId: string;
  limit?: number;  // 默认 6，最大 12
  title?: string;  // 默认按 entityType 自动生成
}
```

---

## 4. 线框设计

### 4.1 组件整体结构

```
┌────────────────────────────────────────────────────────┐
│  相关圣地                               [查看全部 →]     │
├────────────────────────────────────────────────────────┤
│  ← ─────────────── 横向滚动区域 ────────────────── →   │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌── │
│  │ 缩略图  │  │ 缩略图  │  │ 缩略图  │  │ 缩略图  │  │   │
│  │ 120px  │  │ 120px  │  │ 120px  │  │ 120px  │  │   │
│  │ [♡]   │  │ [♡]   │  │ [♡]   │  │ [♡]   │  │   │
│  ├────────┤  ├────────┤  ├────────┤  ├────────┤  ├── │
│  │ 名称    │  │ 名称    │  │ 名称    │  │ 名称    │  │   │
│  │ ★4.8   │  │ ★4.6   │  │ ★4.5   │  │ ★4.3   │  │   │
│  │ [佛教]  │  │ [道教]  │  │ [佛教]  │  │ [基督教] │  │   │
│  └────────┘  └────────┘  └────────┘  └────────┘  └── │
└────────────────────────────────────────────────────────┘
```

### 4.2 单张卡片规格

| 属性 | Web | Mobile | 小程序 |
|------|-----|--------|--------|
| 卡片宽度 | 160px | 130px | 140px |
| 缩略图高度 | 120px | 100px | 105px |
| 圆角 | 10px | 8px | 8px |
| 卡片间距 | 12px | 10px | 10px |
| 整体左右内边距 | 16px | 16px | 16px |

### 4.3 卡片信息

```
[1] 缩略图 (圆角矩形，object-fit: cover)
    └── 右上角收藏按钮 ♡ (绝对定位，12px 内边距)
[2] 实体名称 (1行，超出省略，font-size: 14px)
[3] 评分 (★ 符号 + 数字，金色) + 宗教标签 (胶囊样式，同行)
```

### 4.4 骨架屏

- 推荐数据加载期间显示骨架屏
- 骨架屏数量等于 `limit` 值 (默认6个)
- 动画: `animate-pulse` 灰色矩形

---

## 5. 交互规则

### 5.1 卡片点击

```
点击卡片 → 跳转到对应详情页
  Web: Next.js router.push(`/{entityTypePath}/{entityId}`)
  Mobile: router.push(`/{entityTypePath}/${entityId}`)
  小程序: Taro.navigateTo({ url: `/{page}?id=${entityId}` })

路由映射:
  HOLY_SITE   → /holy-sites/{id}
  TEMPLE      → /temples/{id}
  PATRIARCH   → /patriarchs/{id}
```

### 5.2 跳转后推荐刷新

```
用户从"相关圣地"点击进入新的圣地详情页时:
  1. 新详情页加载
  2. 相关推荐组件以新页面的 entityId 重新请求推荐
  3. 浏览历史自动记录新页面 (见F07)
```

### 5.3 收藏按钮

```
已登录用户:
  点击 ♡ → 调用收藏API → 按钮变为 ♥ (实心，金色)
  再点击 ♥ → 取消收藏 → 按钮变回 ♡
未登录用户:
  点击 ♡ → 显示"登录后可收藏"提示弹窗 → 引导登录
```

### 5.4 "查看全部"链接

```
点击"查看全部 →" → 跳转到对应列表页，并预设宗教筛选:
  圣地详情页 → /holy-sites?religion={currentReligion}
  祖庭详情页 → /temples?religion={currentReligion}
  祖师详情页 → /patriarchs?religion={currentReligion}
```

### 5.5 空状态

```
IF 推荐数为 0:
  隐藏整个相关推荐组件 (不占用版面)
  不显示标题和滚动区域
```

---

## 6. API 调用

```
GET /api/recommendations/related
Params:
  entityType: 'HOLY_SITE' | 'TEMPLE' | 'PATRIARCH'
  entityId: string
  limit: number (默认6)

Response:
{
  "items": [
    {
      "entityType": "HOLY_SITE",
      "entityId": "clxxx",
      "name": "峨眉山",
      "nameEn": "Mount Emei",
      "religion": "BUDDHISM",
      "religionName": "佛教",
      "region": "四川，中国",
      "rating": 4.8,
      "imageUrl": "https://...",
      "isFavorited": false  // 已登录时返回收藏状态
    }
  ],
  "total": 6,
  "algorithm": "content-based-v1"
}
```

---

## 7. 全端实现规范

### 7.1 Web (Next.js + TailwindCSS)

```tsx
// src/components/RelatedEntities.tsx
// 使用 React Query 获取数据
// 使用 overflow-x-auto + flex + gap 实现横向滚动
// 隐藏滚动条: scrollbar-hide (tailwind-scrollbar-hide 插件)
```

### 7.2 Mobile (Expo + React Native)

```tsx
// components/RelatedEntities.tsx
// 使用 FlatList horizontal={true} 实现横向滚动
// showsHorizontalScrollIndicator={false}
// ItemSeparatorComponent: 12px 间距
// onEndReached: 暂不分页 (limit=6已足够)
```

### 7.3 微信小程序 (Taro)

```tsx
// src/components/RelatedEntities/index.tsx
// 使用 <ScrollView scrollX enableFlex> 实现横向滚动
// white-space: nowrap 防止换行
// 注意: Taro ScrollView 横向需设置固定高度
```

---

## 8. 性能要求

| 指标 | 要求 |
|------|------|
| 组件首次渲染 | ≤ 50ms (骨架屏立即出现) |
| 推荐数据加载 | ≤ 300ms (Redis命中时) |
| 滑动帧率 | ≥ 60fps |
| 图片尺寸 | 缩略图 ≤ 50KB (WebP格式) |
| 组件体积 | ≤ 5KB gzip |

---

## 9. 验收标准

- [ ] 圣地详情页底部正确显示"相关圣地"标题
- [ ] 推荐列表展示 4-6 个卡片
- [ ] 推荐内容与当前页面同宗教 (相关性验证，抽查 5 个不同圣地)
- [ ] 横向滑动流畅，最后一张卡片右侧有可见的下一张露出提示
- [ ] 收藏按钮在已登录/未登录状态下行为正确
- [ ] 卡片点击后正确跳转，且新页面的相关推荐已刷新
- [ ] "查看全部"跳转到正确的筛选列表页
- [ ] 数据加载期间骨架屏正确显示
- [ ] 空推荐结果时整个组件不渲染 (不占用版面)
- [ ] Web / Mobile / 小程序 三端均实现并可用

---

## 10. 关联文档

| 文档 | 关系 |
|------|------|
| [M16-PRD-推荐系统](M16-PRD-推荐系统.md) | 父模块PRD，算法与API定义 |
| [P07-PRD-首页个性化推荐](P07-PRD-首页个性化推荐.md) | 首页推荐区块 (同算法，不同位置) |
| [M14-PRD-收藏系统](M14-PRD-收藏系统.md) | 卡片收藏按钮集成 |
| [F07-PRD-最近浏览](F07-PRD-最近浏览.md) | 点击推荐卡片触发浏览记录 |

---

*PRD版本历史*

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|---------|
| v1.0 | 2026-03-29 | CEO++ | 初始版本，覆盖全三端实现规范 |
