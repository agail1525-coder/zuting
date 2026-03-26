# M10 地图与导航 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: Phase 1 基础地图已实施 + v2 导航规划中

---

## 1. 需求背景与目标

### 1.1 背景

地图是祖庭旅行平台的核心交互载体。60 处圣地分布在全球各大洲，用户需要通过地图直观了解圣地的地理分布、规划行程路线、在旅途中获得导航指引。

当前实现:
- **Web**: /map 页面使用 Leaflet + CartoDB 暗色瓦片，展示所有圣地标记点
- **小程序**: /map 页面使用腾讯地图原生组件，展示标记点 + callout
- **Mobile App**: 尚未实现独立地图页 (v2)

### 1.2 目标

| 目标 | 衡量指标 | 阶段 |
|------|----------|------|
| 圣地可视化 | 60 个标记点全部可见、可交互 | Phase 1 (已完成) |
| 宗教维度过滤 | 按 12 大信仰过滤标记点 | Phase 1 (已完成) |
| 行程路线规划 | 用户可查看行程中各圣地连线路线 | v2 |
| 足迹追踪 | 已访问圣地标记变化 + 完成进度 | v2 |
| 附近发现 | 基于 GPS 发现周边圣地 | v2 |
| 实时导航 | 出行中逐向导航 | v3 |

### 1.3 技术选型

| 端 | 技术 | 说明 |
|----|------|------|
| Web | Leaflet 1.9 + React-Leaflet | 开源，高度可定制 |
| Web 瓦片 | CartoDB Dark Matter | 暗色风格，匹配平台设计 |
| 小程序 | Taro Map 组件 (腾讯地图) | 微信原生，性能好 |
| Mobile | react-native-maps (v2) | Google Maps / Apple Maps 原生桥 |
| 路线规划 | OpenRouteService / 高德 API | 步行/驾车/公共交通路线 |
| 地理编码 | Nominatim / 腾讯位置服务 | 地址 ↔ 坐标转换 |

---

## 2. 用户故事

### 2.1 地图浏览

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-M01 | 作为朝圣者，我想在世界地图上看到所有圣地的位置分布，以获得全局视角 | P0 |
| US-M02 | 作为朝圣者，我想点击地图标记弹出圣地名称和国家，快速了解基本信息 | P0 |
| US-M03 | 作为朝圣者，我想按宗教过滤地图标记，只看我感兴趣的信仰圣地 | P0 |
| US-M04 | 作为朝圣者，我想点击弹窗中的链接跳转到圣地详情页 | P0 |
| US-M05 | 作为朝圣者，我想看到不同宗教的标记点用不同颜色区分 | P1 |

### 2.2 路线规划 (v2)

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-M06 | 作为朝圣者，我想在地图上看到我行程中各圣地之间的路线连线 | P1 |
| US-M07 | 作为朝圣者，我想看到每段路线的预估距离和时间 | P1 |
| US-M08 | 作为朝圣者，我想拖拽调整途经点来优化路线 | P2 |
| US-M09 | 作为朝圣者，我想选择交通方式 (飞机/火车/汽车/步行) 查看不同路线 | P2 |

### 2.3 足迹追踪 (v2)

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-M10 | 作为朝圣者，我想在地图上看到哪些圣地我已经去过 (金色高亮) | P1 |
| US-M11 | 作为朝圣者，我想看到我的朝圣完成进度 (已访问/总数) | P1 |
| US-M12 | 作为朝圣者，我想分享我的足迹地图到社交平台 | P2 |

### 2.4 附近发现 (v2)

| ID | 用户故事 | 优先级 |
|----|----------|--------|
| US-M13 | 作为朝圣者，我想在旅途中发现附近的圣地/祖庭 | P1 |
| US-M14 | 作为朝圣者，我想按距离排序查看周围有哪些圣地 | P1 |
| US-M15 | 作为朝圣者，我想看到到达附近圣地的步行/驾车时间 | P2 |

---

## 3. 业务流程

### 3.1 地图浏览流程 (Phase 1)

```
用户打开 /map 页面
    → 初始化 Leaflet 地图 (中心: [20, 0], zoom: 2)
    → 加载 CartoDB Dark Matter 暗色瓦片
    → GET /api/holy-sites → 获取 60 个圣地数据
    → 遍历圣地，为每个创建 Marker:
        - 位置: [latitude, longitude]
        - 图标: 宗教主题色的自定义 DivIcon (圆点 + 脉冲动画)
        - 弹窗: Popup 显示 {name, country, religion, 查看详情链接}
    → 用户点击 Marker → Popup 弹出
    → 用户点击「查看详情」→ 路由到 /holy-sites/:id
    → 宗教过滤: 侧边 Filter Panel 勾选宗教
        → 前端过滤 Marker 显示/隐藏
        → 地图自适应 fitBounds 到可见标记
```

### 3.2 行程路线显示流程 (v2)

```
用户打开行程详情页 → 地图区域加载
    → GET /api/trips/:id → 获取行程数据 (含 TripSite[] 按 order 排序)
    → 在地图上标注行程包含的圣地 (编号标记: 1, 2, 3...)
    → 调用路线API (OpenRouteService / 高德) 计算相邻圣地间路线
    → Leaflet Polyline 绘制路线连线 (金色虚线 #D4A855)
    → 每段路线中间显示距离+时间 badge
    → 用户点击路线段 → 弹窗显示该段详细信息:
        - 出发地 → 目的地
        - 距离 (km)
        - 预估时间 (步行/驾车/飞行)
        - 交通建议
```

### 3.3 足迹追踪流程 (v2)

```
用户打开「我的足迹」页面
    → GET /api/users/me/footprint → 获取已完成行程的圣地列表
    → 地图渲染:
        - 已访问圣地: 金色实心标记 + 发光效果
        - 未访问圣地: 灰色半透明标记
    → 进度条: 已访问 N / 总数 60 (百分比)
    → 按信仰分组进度: 每个信仰 5 个圣地的完成数
    → 「分享我的足迹」按钮:
        → 生成足迹地图截图 (html2canvas)
        → 分享到微信/微博/保存图片
```

### 3.4 附近发现流程 (v2)

```
用户打开「附近圣地」功能
    → 请求 GPS 定位权限 (Geolocation API / App 原生定位)
    → 获取用户当前坐标 (lat, lng)
    → GET /api/holy-sites/nearby?lat=xx&lng=xx&radius=500 (500km)
    → 返回按距离排序的圣地列表
    → 地图: 以用户位置为中心，显示附近圣地标记
    → 列表: 卡片展示圣地名称 + 距离 + 预计时间
    → 点击圣地 → 跳转详情 / 开始导航
```

---

## 4. 功能清单

### 4.1 Phase 1 — 已实施

| 功能 | Web | 小程序 | App |
|------|-----|--------|-----|
| 全球圣地地图 | Leaflet + CartoDB Dark | 腾讯地图 | - |
| 标记点显示 | 自定义 DivIcon (宗教色) | 默认标记 | - |
| 点击弹窗 | Popup: 名称+国家+链接 | Callout | - |
| 宗教过滤 | 侧边 Filter Panel | 顶部 Tabs | - |
| 缩放/平移 | Leaflet 原生 | 地图原生 | - |
| 暗色风格 | CartoDB Dark Matter 瓦片 | 自定义样式 JSON | - |

### 4.2 Phase 1 — Web 地图实现细节

**瓦片图层**:
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
attribution: CartoDB
```

**自定义标记 (DivIcon)**:
```html
<div class="site-marker" style="
  background: {religion.color};
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 2px solid #D4A855;
  box-shadow: 0 0 8px {religion.color}80;
">
</div>
```

**弹窗内容**:
```html
<div class="site-popup" style="color: #e5e5e5;">
  <h4 style="color: #D4A855;">{site.name}</h4>
  <p>{site.country} · {religion.name}</p>
  <a href="/holy-sites/{site.id}">查看详情 →</a>
</div>
```

**过滤面板**:
- 12 个宗教的 Checkbox，每个带宗教主题色圆点
- 全选/全不选 快捷按钮
- 当前显示数量计数: "显示 N/60 个圣地"

### 4.3 Phase 1 — 小程序地图实现

```tsx
// Taro Map 组件
<Map
  longitude={108}
  latitude={20}
  scale={3}
  markers={markers}
  onMarkerTap={handleMarkerTap}
  style="width: 100%; height: 100vh;"
/>
```

Markers 数据格式:
```typescript
{
  id: site.id,
  latitude: site.latitude,
  longitude: site.longitude,
  iconPath: `/assets/markers/${religion.slug}.png`,
  width: 28,
  height: 28,
  callout: {
    content: `${site.name}\n${site.country}`,
    color: '#D4A855',
    bgColor: '#1a1a2e',
    borderRadius: 8,
    padding: 8,
    display: 'BYCLICK',
  }
}
```

### 4.4 v2 — 路线规划

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 行程路线可视化 | 在行程详情的地图上显示圣地间连线 | P1 |
| 距离/时间估算 | 每段路线计算直线距离 + 飞行/驾车时间 | P1 |
| 交通方式切换 | 飞机/火车/汽车/步行 切换不同路线 | P2 |
| 路线优化 | 基于 TSP 算法建议最优圣地访问顺序 | P2 |
| 途经点编辑 | 拖拽地图上的路线途经点调整路线 | P3 |

### 4.5 v2 — 足迹地图

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 已访问标记 | 已完成行程的圣地显示金色高亮 | P1 |
| 进度统计 | 总进度条 + 按信仰分组进度 | P1 |
| 足迹动画 | 访问时间线回放动画 | P2 |
| 分享截图 | 生成足迹地图分享图片 | P2 |
| 成就徽章 | 完成某信仰全部 5 个圣地 → 获得信仰徽章 | P2 |

### 4.6 v2 — 附近发现

| 功能 | 说明 | 优先级 |
|------|------|--------|
| GPS 定位 | 获取用户当前位置 | P1 |
| 附近圣地列表 | 距离排序，显示距离+方向 | P1 |
| 附近祖庭 | 类似逻辑，包含 Temple 数据 | P1 |
| 步行/驾车时间 | 调用地图 API 估算 | P2 |
| 到达提醒 | 进入圣地 500m 范围 → 推送提醒 | P2 |
| AR 导览 (v3) | 到达圣地后的 AR 增强体验 | P3 |

### 4.7 v3 — 高级功能

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 热力图 | 按访问量/受欢迎程度显示热力层 | P2 |
| 3D 地球 | 使用 Three.js / Cesium 渲染 3D 地球 | P3 |
| 逐向导航 | 集成高德/Google 导航 SDK | P3 |
| 离线地图 | 下载区域地图离线使用 | P3 |
| 语音导览 | 到达圣地自动播放介绍音频 | P3 |

---

## 5. 数据模型

### 5.1 现有模型 (地图相关字段)

**HolySite** — 地图核心数据:
```prisma
model HolySite {
  id          String  @id @default(cuid())
  name        String
  nameEn      String
  country     String
  latitude    Float           // 纬度 (-90 to 90)
  longitude   Float           // 经度 (-180 to 180)
  utcOffset   Float           // UTC 时区偏移 (e.g., +8.0)
  description String  @db.Text
  imageUrl    String?
  soundEffect String?         // 到达时播放的音效
  religionId  String
  religion    Religion @relation(...)
}
```

**Temple** — 部分有坐标:
```prisma
model Temple {
  latitude     Float?
  longitude    Float?
  // ... 其他字段
}
```

### 5.2 v2 新增模型

**UserFootprint** — 用户足迹:
```prisma
model UserFootprint {
  id        String   @id @default(cuid())
  userId    String
  siteId    String
  visitedAt DateTime @default(now())
  tripId    String?
  photoUrl  String?
  note      String?

  @@unique([userId, siteId])  // 每个圣地只记录一次
  @@index([userId])
}
```

**SavedRoute** — 保存的路线:
```prisma
model SavedRoute {
  id           String   @id @default(cuid())
  userId       String
  tripId       String?
  name         String
  waypoints    Json     // [{siteId, lat, lng, order}]
  totalDistance Float?   // km
  estimatedTime Int?    // minutes
  transport    String?  // flight/train/car/walk
  createdAt    DateTime @default(now())

  @@index([userId])
}
```

---

## 6. API 接口

### 6.1 现有接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/holy-sites | 获取全部圣地 (含坐标，用于地图渲染) |
| GET | /api/holy-sites/:id | 圣地详情 |
| GET | /api/religions | 宗教列表 (用于过滤) |
| GET | /api/temples | 祖庭列表 (含坐标的可显示在地图) |

### 6.2 v2 新增接口

| 方法 | 路径 | Auth | 说明 |
|------|------|------|------|
| GET | /api/holy-sites/nearby | 可选 | 附近圣地 ?lat=&lng=&radius= |
| GET | /api/users/me/footprint | 必须 | 我的足迹列表 |
| POST | /api/users/me/footprint | 必须 | 记录足迹 {siteId, tripId?} |
| GET | /api/users/me/footprint/stats | 必须 | 足迹统计 (按信仰分组) |
| POST | /api/routes/calculate | 可选 | 计算路线 {waypoints[], transport} |
| POST | /api/routes/optimize | 可选 | TSP 路线优化 {siteIds[]} |
| POST | /api/routes/save | 必须 | 保存路线 |
| GET | /api/routes/saved | 必须 | 我的保存路线列表 |

### 6.3 附近圣地 API 详细设计

```
GET /api/holy-sites/nearby?lat=31.23&lng=121.47&radius=500&limit=10

Response:
{
  "data": [
    {
      "id": "clu...",
      "name": "灵隐寺",
      "nameEn": "Lingyin Temple",
      "country": "中国",
      "latitude": 30.24,
      "longitude": 120.10,
      "distance": 125.6,    // km (Haversine formula)
      "religion": { "name": "佛教", "color": "#FFD700" },
      "imageUrl": "..."
    }
  ],
  "total": 3,
  "center": { "lat": 31.23, "lng": 121.47 },
  "radius": 500
}
```

后端实现: PostgreSQL + PostGIS 扩展，使用 `ST_DWithin` + `ST_DistanceSphere` 计算地理距离。

---

## 7. 多端页面规格

### 7.1 Web — /map 页面

```
┌─────────────────────────────────────────────────────┐
│  TopNav: 导航栏                                       │
├────────┬────────────────────────────────────────────┤
│ Filter │  Leaflet Map (全屏高度)                      │
│ Panel  │                                             │
│        │     ● 佛教圣地 (金色)                         │
│ ☑ 佛教 │           ● 基督教圣地 (蓝色)                 │
│ ☑ 道教 │                                             │
│ ☑ 基督教│                    ● 伊斯兰教圣地             │
│ ☑ ...  │                                             │
│        │  [+][-] 缩放控制                              │
│ 显示:   │                                             │
│ 48/60  │  ┌────────────────┐                         │
│        │  │ 菩提伽耶 Bodh G │  ← Popup               │
│        │  │ 印度 · 佛教      │                         │
│        │  │ [查看详情 →]     │                         │
│        │  └────────────────┘                         │
├────────┴────────────────────────────────────────────┤
│  Footer                                              │
└─────────────────────────────────────────────────────┘
```

- Filter Panel: 宽 220px，深色背景 #0f172a，左侧固定
- 地图: 占满剩余宽度，高度 calc(100vh - nav - footer)
- 移动端 (< 768px): Filter Panel 改为底部 Sheet 抽屉

### 7.2 小程序 — /map 页面

```
┌─────────────────────────┐
│  Tabs: 全部|佛教|道教|...  │
├─────────────────────────┤
│                          │
│     腾讯地图全屏           │
│                          │
│     ● 标记1               │
│         ● 标记2           │
│                          │
│  ┌───────────────────┐   │
│  │ 灵隐寺              │  ← Callout
│  │ 中国杭州 · 佛教      │
│  └───────────────────┘   │
│                          │
├─────────────────────────┤
│  TabBar: 首页|圣地|聊天|我的│
└─────────────────────────┘
```

- 顶部: 宗教 Tabs 横向滚动，当前选中高亮
- 地图: 全屏，腾讯地图原生组件
- Callout: 原生 callout，点击跳转详情页

### 7.3 Mobile App — /map (v2)

```
┌─────────────────────────┐
│  SearchBar + Filter icon │
├─────────────────────────┤
│                          │
│     react-native-maps    │
│     (Apple/Google Maps)  │
│                          │
│     ● 自定义标记           │
│                          │
│  ┌───────────────────┐   │
│  │ BottomSheet 圣地卡片│   │
│  │ 名称 | 距离 | 详情  │   │
│  └───────────────────┘   │
│                          │
├─────────────────────────┤
│  TabBar                  │
└─────────────────────────┘
```

- 地图: react-native-maps 全屏
- 标记: 自定义 Marker 组件 (宗教色 + 图标)
- BottomSheet: 点击标记后从底部弹出圣地概览卡片
- 搜索: 顶部搜索框搜索圣地名称/国家

---

## 8. 埋点需求

### 8.1 地图交互事件

| 事件 | 参数 | 说明 |
|------|------|------|
| map_page_view | platform, center_lat, center_lng | 地图页面访问 |
| map_marker_click | site_id, site_name, religion | 点击圣地标记 |
| map_popup_detail_click | site_id | 弹窗中点击「查看详情」 |
| map_filter_change | religion_slugs[], visible_count | 宗教过滤变化 |
| map_zoom_change | zoom_level | 缩放级别变化 |
| map_pan | center_lat, center_lng | 地图平移 (节流 2s) |

### 8.2 v2 功能事件

| 事件 | 参数 | 说明 |
|------|------|------|
| map_nearby_request | lat, lng, radius, result_count | 请求附近圣地 |
| map_nearby_site_click | site_id, distance | 点击附近圣地 |
| map_route_calculate | trip_id, waypoint_count, transport | 计算路线 |
| map_route_save | route_id, waypoint_count | 保存路线 |
| map_footprint_view | visited_count, total_count, percentage | 查看足迹 |
| map_footprint_share | platform (wechat/weibo/save) | 分享足迹 |
| map_navigation_start | from_site, to_site, transport | 开始导航 |

### 8.3 性能指标

| 指标 | 采集方式 | 目标 |
|------|----------|------|
| 地图首次渲染 | Leaflet tileload 事件 | < 3s |
| 标记点渲染 | 全部 Marker 创建完成 | < 500ms |
| 弹窗展开 | Marker click → Popup open | < 100ms |
| 附近搜索响应 | API 请求耗时 | < 1s |
| 路线计算 | 路线 API 响应时间 | < 3s |
