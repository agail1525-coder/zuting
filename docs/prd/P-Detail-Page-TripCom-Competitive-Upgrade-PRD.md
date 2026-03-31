# 详情页深度重构PRD — 对标Trip.com景点详情页

## Context

CEO多次不满意详情页质量。核心问题：我们的详情页仍然是"深色沉浸式旅游博客"风格，而Trip.com是"白色背景专业预订平台"风格。差距不是功能缺失，而是**整体布局架构和视觉语言完全不同**。

需要从根本上重构布局，不是在现有深色Hero上叠加组件。

---

## 一、Trip.com 详情页精确拆解 (从上到下每个像素)

### S1. 面包屑导航 (白色背景)
- 白色背景区域，不在图片上
- 多级面包屑: Home > Destination > North America > United States > Florida > Orange County > Orlando > Universal Orlando Resort
- 右侧: Share to [Facebook] [X] [链接] 图标
- **我们的问题**: 面包屑叠在暗色Hero图片上，可读性差

### S2. 图片画廊 (3列网格，非全屏Hero)
- **左列**: 竖版大图 (约33%宽)
- **中列**: 主轮播图 (约40%宽)，底部有轮播圆点指示器，支持滑动
- **右列**: 视频预览 (约27%宽)，带播放按钮和时长显示 "0:00/0:08"，右下角"See more >"
- 总高度约 370px，圆角，白色背景
- **关键**: 不是全屏暗色Hero，是有边界的图片画廊组件
- **我们的问题**: 用全屏暗色Hero覆盖，照片作为背景而非主角

### S3. 公告横幅 (可选)
- 图片画廊下方，橙色/蓝色文字横幅
- 🎉 活动公告: "Butterbeer Season 2026 Returns..."
- 右侧 "Show more" 链接
- **我们没有这个**

### S4. 标题信息区 (两栏布局开始)
左侧主内容区:
- **名称**: "Universal Orlando Resort" 24px粗体 + ❤️收藏图标
- **评分行**: 👍10 | [4.8/5] 蓝底白字评分徽章 | "1,310 review ▶" | TripAdvisor绿圆点 "based on 41,744 reviews ▶"
- **荣誉徽章**: "Trip.Best | 2026 Global 100 - Best Things to Do >"
- **标签**: "Amusement parks" "Night view" 灰底圆角标签

右侧预订卡 (sticky):
- **价格**: "From $178.9" 大字
- **特性**: "• Immediate access • Book now for today"
- **CTA**: 巨大蓝色 "Book now" 按钮
- **卡片样式**: 白色圆角，阴影 0 4px 20px rgba(15,41,77,0.12)

### S5. 实用信息区
- 🕐 "Closed for the day Open tomorrow at 10:00 AM-9:00 PM >"
- ℹ️ "Recommended sightseeing time: 1-3 days"
- 📍 "Address: 6000 Universal Blvd, Orlando, FL 32819, United States  [Map]"
- 📞 "Phone: Ticket inquiry: +1-407-3638000"
- 每行一个图标+文字，紧凑垂直布局
- **我们的问题**: 用2x4网格卡片显示，视觉权重过大，信息密度低

### S6. 评价预览 (内联，非独立区块)
- "Other visitors' reviews of Universal Orlando Resort" + "Show More Reviews"
- 一条评价快照: 头像 + "Grace_stearns [4.0/5] Excellent" + 评价文字
- 灰色分隔线，轻量卡片
- **我们没有这个内联预览**

### S7. 票务/门票区 (核心转化区)
- **日期Tab**: Today | Tomorrow | April 1 | Select date >
- **优惠标签**: "Up to $4 off" "Up to $3 off" [Claim] 按钮
- **分类Tab左侧**: 1-Day Ticket(蓝色active) | Express Unlimited Pass | 2-Day Ticket | Express Pass
- **票卡**: 
  - 标题: "1-Day Ticket" + "19K+ booked"
  - 子选项: "2-Park 1-Day Ticket (Park-to-Park) (Multiple Options Available) >"
  - 标签: [Immediate access] [Non-refundable] [No ticket collection required]
  - 价格: "From $239.94" + [Book] 蓝色按钮
- **我们的等价物**: "包含此圣地的路线" — 需要更像票务卡片结构

### S8. 评价完整区
- Tab来源: "Trip.com 1,310 review" | TripAdvisor绿圆点 "41,744 reviews"
- 评分: "[4.8/5] Outstanding 1,310 review"
- **筛选Tab**: All(1,310) | Latest | Photo reviews(444) | Verified booking(613) | Positive reviews(893) | Negative reviews(13)
- **评价卡**: 头像 | 名字 | [评分/5] 评级标签 | [Verified booking]标签 | [Original text]按钮 | 评价正文 | 照片网格(8张) | 👍投票数 | 日期
- **我们的问题**: 只有"最新"和"最有用"两个排序，缺少类型筛选Tab

### S9. 景点亮点/介绍
- "Universal Orlando Resort attraction highlights"
- 要点列表(·开头)
- "Show more" 展开按钮
- **我们有类似的ExpandableDescription**

### S10. 附近推荐 (地图+列表)
- **标题**: "Recommendations near Universal Orlando Resort"
- **Tab**: Hotels(active) | Attractions | Restaurants | Airports and Railway Stations
- **左侧地图**: 约60%宽，交互式地图带标记
- **右侧列表**: 酒店卡片 (图片+名称+星级+评分+距离+价格)
- **促销**: "Gift pack for your first booking" + [Claim now]
- **我们缺少这个完整的附近推荐系统**

### S11. 附加信息
- "Additional information"
- **设施网格** 3列: Parking | Luggage storage | Scenic area map | In-park transport | ATM | Dining | Souvenir shop | Accessibility
- **联系**: Phone / Ticket inquiry 号码
- **我们有类似的设施网格但位置不对**

### S12. 照片墙 (Trip Moments)
- "Universal Orlando Resort Photos: Trip Moments" + "Show more"
- 4x2 网格大图，沉浸式照片
- **我们有UGCPhotoWall**

### S13. 你可能也喜欢
- 4列卡片: 图片 + 名称 + 👍数 + 评分 + 评价数 + 标签 + 价格
- **我们有RelatedEntities但卡片信息密度不够**

### S14. 精选热门路线
- "Featured popular routes near Universal Orlando Resort"
- 4列横向滚动卡片: 大图 + 路线标题 + "1 popular attraction" + 景点名称列表
- **我们的AvailableRoutes是列表式而非卡片式**

### S15. Trip.com精选
- "Trip.com Picks" + Tab: "Top Tours in Orlando" | "Best Experiences in Orlando"
- 5x3链接网格
- **我们没有这个**

### S16. 更多推荐 (手风琴)
- "More recommendations" 下多个可展开区块:
  - Nearby Attractions / Popular Types / Popular Restaurants / Popular Destinations / Recommended attractions / Popular Ranked Lists / Trending Travelogues / Popular Trip Moments / More Things To Do
- **我们没有这个SEO友好的手风琴区**

---

## 二、核心差距总结

| 维度 | Trip.com | 我们现在 | 差距等级 |
|------|----------|---------|---------|
| **背景色** | 纯白色，清爽专业 | 深色Hero覆盖，暗黑风 | 🔴 致命 |
| **图片画廊** | 3列网格+视频+轮播 | 全屏背景图或PhotoMosaic | 🔴 致命 |
| **标题位置** | 图片下方白底区域 | 叠在暗色图片上 | 🔴 致命 |
| **预订卡位置** | 右侧sticky，与内容分离 | 叠在Hero上或sidebar内 | 🟡 严重 |
| **实用信息** | 紧凑列表(时间/地址/电话) | 4格卡片网格 | 🟡 严重 |
| **评价预览** | 标题区下方内联快照 | 无，需滚动到底部 | 🟡 严重 |
| **票务/路线区** | 日期Tab+分类Tab+票卡 | 简单列表 | 🟡 严重 |
| **评价筛选** | 6个类型Tab | 仅2个排序按钮 | 🟠 中等 |
| **附近推荐** | 地图+Tab切换 | 简单4宫格 | 🟠 中等 |
| **照片墙/推荐/手风琴** | 完整 | 部分有 | 🟢 轻微 |

---

## 三、重构方案 — 圣地详情页 (模板，祖庭/路线套用)

### 新布局架构 (白色背景，信息密集)

```
┌─────────────────────────────────────────────────────┐
│ [Navbar]                                            │
├─────────────────────────────────────────────────────┤
│ Home > 圣地 > 菩提伽耶        [分享] [Facebook] [X] │  ← 白底面包屑
├─────────────────────────────────────────────────────┤
│ ┌────────┬──────────────┬─────────┐                 │
│ │ 左侧图 │   主轮播图     │ 视频/更多│                │  ← 3列图片画廊
│ │        │  ···轮播点···  │ See more│                │
│ └────────┴──────────────┴─────────┘                 │
├─────────────────────────────────────────────────────┤
│ 🔊 公告: 即将到来的朝圣季...           Show more     │  ← 可选公告横幅
├──────────────────────────────┬──────────────────────┤
│ 菩提伽耶 ❤️                   │ ┌──────────────────┐ │
│ ☸️佛教 │ ★4.8/5 │ 128条评价 ▶   │ │  想去这里?       │ │
│ [世界遗产] [佛教四大圣地]       │ │                  │ │  ← Sticky预订卡
│                              │ │  AI规划师咨询      │ │
│ 🕐 开放时间: 6:00-18:00       │ │  [蓝色大按钮]     │ │
│ ⏱ 建议时长: 2-3小时           │ │                  │ │
│ 📍 地址: 印度比哈尔邦 [地图]    │ │  查看相关路线     │ │
│ 📞 电话: +91-xxx             │ │  [边框按钮]       │ │
│                              │ │                  │ │
│ ┌───────────────────────┐    │ │  ❤️收藏  📤分享   │ │
│ │ 朝圣者评价 "非常震撼..." │    │ │                  │ │  ← 评价预览
│ │ ★4.0 Grace [查看更多]  │    │ └──────────────────┘ │
│ └───────────────────────┘    │                      │
├──────────────────────────────┤                      │
│ 包含此圣地的路线              │                      │
│ [今天] [明天] [选日期]        │   (sticky card       │
│ ┌─────────────────────────┐  │    continues)        │
│ │ 印度佛陀足迹 8天7晚       │  │                      │
│ │ [即时确认] [免费取消]      │  │                      │
│ │              ¥12,800 [预订]│  │                      │
│ └─────────────────────────┘  │                      │
├──────────────────────────────┤                      │
│ 圣地介绍                      │                      │
│ 菩提伽耶是佛教最神圣的...      │                      │
│ [展开全部 ▼]                  │                      │
├──────────────────────────────┤                      │
│ 评价区                        │                      │
│ [4.8/5] 卓越 128条评价        │                      │
│ [全部] [最新] [有图] [好评]    │                      │
│ 评价卡片...                   │                      │
├──────────────────────────────┤                      │
│ 设施与服务                    │                      │
│ 🅿停车 🚻洗手间 ♿无障碍 ...  │                      │
├──────────────────────────────┤                      │
│ 周边推荐                      │                      │
│ [圣地] [住宿] [餐饮]          │                      │
│ [地图] + [列表]               │                      │
├──────────────────────────────┴──────────────────────┤
│ 朝圣者照片墙 (Trip Moments)                          │
│ [4x2 照片网格]                    [查看更多]          │
├─────────────────────────────────────────────────────┤
│ 你可能也喜欢                                         │
│ [4列卡片: 图片+名称+评分+价格]                        │
├─────────────────────────────────────────────────────┤
│ 精选途经路线                                         │
│ [4列横向滚动卡片]                                    │
├─────────────────────────────────────────────────────┤
│ 更多推荐 (手风琴)                                    │
│ ▸ 附近圣地 / ▸ 热门路线 / ▸ 推荐攻略                  │
└─────────────────────────────────────────────────────┘
```

---

## 四、实施计划

### 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `apps/web/src/app/holy-sites/[id]/detail-client.tsx` | **重写** | 全新白底布局，对标Trip.com |
| `apps/web/src/app/temples/[id]/detail-client.tsx` | **重写** | 同圣地模式 |
| `apps/web/src/app/routes/[slug]/client.tsx` | **重构** | Hero改白底画廊，BookingWidget移至sidebar |
| `apps/web/src/components/ReviewSection.tsx` | **增强** | 添加筛选Tab(全部/有图/好评/差评) |
| `apps/web/src/components/PhotoMosaic.tsx` | **增强** | 添加视频支持，3列布局模式 |

### 实施步骤 (每步完成即commit+deploy)

**Step 1: 圣地详情页全面重写**
- 白色背景布局 (移除深色Hero)
- 3列图片画廊 (升级PhotoMosaic)
- 标题区: 名称+收藏+评分徽章+标签
- 实用信息列表 (非网格卡片)
- 评价预览内联
- 路线票务区 (Trip.com Tickets风格)
- 右侧Sticky CTA卡
- 移动端底部CTA

**Step 2: ReviewSection增强**
- 添加筛选Tab: 全部 | 最新 | 有图 | 好评 | 差评
- 带数量显示

**Step 3: 祖庭详情页同步重写**

**Step 4: 路线详情页重构**
- Hero改为白底图片画廊
- BookingWidget移至右侧sticky

**Step 5: TypeScript验证 + 部署**

### 验证方式
1. `npx tsc --noEmit --project apps/web/tsconfig.json` — 零错误
2. `python scripts/deploy-xiaoqing.py` — 部署到生产
3. 浏览器对比: zuting.fszyl.top/holy-sites/xxx vs Trip.com截图
