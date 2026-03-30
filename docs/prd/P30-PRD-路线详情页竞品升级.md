# P30-PRD-路线详情页竞品升级

> 对标: Booking.com / Trip.com / Airbnb / TripAdvisor / Expedia / Agoda / Kayak / Skyscanner / AmEx Travel / Priceline
> 当前: 11个板块 | 目标: 22+板块, 80+高优先级功能

## 现状差距分析

### 已有 (11项)
- Hero背景图+渐变+面包屑
- 标题/副标题/难度/时长/季节/团队规模/评分
- 价格卡(起步价+AI咨询CTA)
- 价格趋势迷你图
- 亮点标签
- 路线描述
- 社交证明(浏览量)
- 照片马赛克画廊+灯箱
- 日程时间线(天/活动/餐饮/住宿)
- 费用包含/不含
- 途经圣地卡片

### 缺失关键功能 (按优先级)

#### Wave 1 — 核心缺失 (✅ 已实施)
1. ✅ **交互式地图** — RouteMap组件(编号标记+虚线连线+弹窗) (对标Booking/TripAdvisor/Expedia)
2. ✅ **评价板块** — ReviewSection组件接入路线 (对标全部10家)
3. ✅ **相似路线推荐** — SimilarRoutes组件(4卡片网格) (对标TripAdvisor/Expedia)
4. ✅ **预订区增强** — BookingWidget(日期选择+人数+-+实时价格计算+立即预订) (对标全部10家)
5. ✅ **取消政策** — 4级退款规则+不可抗力条款 (对标全部10家)
6. ✅ **信任徽章** — 6枚徽章(免费取消/即时确认/电子票/专业导游/24·7客服/安全支付) (对标Trip.com/Agoda)
7. ✅ **Q&A问答** — QASection组件接入 (对标TripAdvisor)
8. ✅ **分享按钮** — ShareButton组件接入预订区 (对标Airbnb) [从Wave2提前]

#### Wave 2 — 丰富度增强
8. **宗教关联** — 显示所属信仰信息+图标 (差异化)
9. **出行贴士增强** — 天气/穿着/宗教礼仪 (差异化)
10. **分享按钮** — ShareButton组件接入 (对标Airbnb)
11. **稀缺性提示** — "仅剩X名额" (对标Priceline/Agoda)
12. **积分显示** — "预订可赚X积分" (对标Expedia/Agoda)
13. **FAQ折叠面板** — 常见问题 (对标TripAdvisor)

#### Wave 3 — 体验级升级
14. **多媒体导览** — MediaTour组件(视频+全景+音频) (差异化)
15. **相关祖师/祖训** — 文化内容链接 (差异化)
16. **朝圣者日志** — "查看此路线的朝圣日志" (差异化)
17. **小鸿AI浮窗** — "问问小鸿关于这条路线" (差异化)

## Wave 1 实施方案

### 1. 交互式地图
- 使用已有WorldMapDynamic组件
- 数据: route.sites[].site.latitude/longitude
- 显示: 标记点+弹窗(圣地名+天数)+连线

### 2. 评价板块
- 复用已有ReviewSection组件
- targetType='ROUTE', targetId=route.id

### 3. 相似路线推荐
- API: GET /routes?pageSize=4&sort=rating (排除当前)
- 复用RouteCard样式

### 4. 预订区增强
- 日期input + 人数select + "立即预订"→/routes/checkout
- 价格*人数实时计算

### 5. 取消政策
- 静态文案模板(与路线类型关联)

### 6. 信任徽章
- 图标行: 免费取消/即时确认/电子票/专业导游

### 7. Q&A问答
- 复用QASection组件 (如存在)
- targetType='ROUTE', targetId=route.id
