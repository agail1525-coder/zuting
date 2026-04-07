# DOC-50 目的地页面完备化标准 v1.0

> **版本**: v1.0 | **生成日期**: 2026-04-06 | **生成方式**: 项目++ PJ v1.0
> **适用项目**: 圣地列表页 + 圣地详情页 全面完备化
> **关联PRD**: M01-PRD-宗教信仰与圣地 / P29-PRD-圣地导览页 / P30-PRD-圣地列表页 / P-Detail-TripCom-PRD
> **关联DOC**: docs/protocols/01-UI设计规范 / 02-API契约规范 / 06-国际化规范
> **状态**: [新生成]
> **对标**: Booking.com目的地页 + TripAdvisor景点页 + Trip.com详情页 + Airbnb体验页

---

## §0 元数据

```yaml
版本: v1.0 (2026-04-06)
范围: apps/web/src/app/holy-sites/ (列表+详情)
当前状态: 75%完成 (1125行详情 + 745行列表 + 131行卡片 + 403行MediaTour + 397行Review)
已有PRD: 4份 (M01/P29/P30/Trip.com对标)
API端点: 5个 (GET list/detail, POST/PATCH/DELETE)
数据模型: HolySite (35字段, GPS+旅行信息+近邻JSON)
i18n: 57个key已有, 15+硬编码待修
```

---

## §1 现状分析 — 已有 vs 缺失

### 详情页 (detail-client.tsx, 1125行)

| Section | 实现状态 | 问题 |
|---------|---------|------|
| S1 面包屑 | ✅ 完成 | — |
| S2 图片画廊 | ✅ 完成 | Lightbox可优化 |
| S3 公告横幅 | ✅ 完成 | — |
| S4 标题+评分 | ✅ 完成 | 硬编码人气数 |
| S5 实用信息 | ✅ 完成 | 15+硬编码中文标签 |
| S6 评价预览 | ✅ 完成 | — |
| S7 路线卡片 | ✅ 完成 | — |
| S8 评分分布 | ⚠️ 部分 | 百分比硬编码(68%/22%/6%/3%/1%) |
| S9 圣地介绍 | ✅ 完成 | — |
| S10 附近推荐 | ✅ 完成 | — |
| S11 设施服务 | ⚠️ 部分 | 标签硬编码中文 |
| 文化礼仪 | ⚠️ 部分 | 内容硬编码 |
| 最佳时间 | ⚠️ 部分 | Placeholder数据 |
| 行李清单 | ⚠️ 部分 | 硬编码 |
| FAQ | ⚠️ 部分 | 硬编码问答 |
| 导航栏 | ⚠️ 部分 | 标签硬编码 |
| 右侧CTA | ✅ 完成 | — |
| **朝圣传统指南** | ❌ 缺失 | 竞品差异化特色 |
| **朝圣难度评级** | ❌ 缺失 | 物理需求/无障碍评分 |
| **节庆日历** | ❌ 缺失 | 重要宗教节日+最佳朝圣时间 |
| **交通指南** | ❌ 缺失 | schema有transport字段但未渲染 |

### 列表页 (client.tsx, 745行)

| Feature | 实现状态 | 问题 |
|---------|---------|------|
| 信仰筛选 | ✅ 完成 | Dropdown(应改chip) |
| 国家筛选 | ✅ 完成 | — |
| 洲际分类 | ✅ 完成 | Dropdown(应改chip) |
| 搜索 | ✅ 完成 | — |
| 排序 | ✅ 完成 | — |
| 网格/地图切换 | ✅ 完成 | — |
| 对比模式 | ✅ 完成 | — |
| 最近浏览 | ✅ 完成 | — |
| **Hero横幅统计** | ❌ 缺失 | "探索60+圣地 | 40国 | 12信仰" |
| **信仰横滑chip** | ❌ 缺失 | 目前是dropdown |
| **精选Top3轮播** | ❌ 缺失 | 评价最高的3个圣地 |
| **i18n完整性** | ❌ 缺失 | 多处硬编码中文 |

---

## §2 施工图 (管线++)

### Phase 1: i18n完备化 (P0 — 阻断级)

**目标**: 消除所有硬编码中文，补全7语言key

**详情页 i18n修复清单**:

| 位置 | 硬编码内容 | i18n key |
|------|-----------|---------|
| SectionNav标签 | 概况/路线/介绍/评价/设施/礼仪/行装/问答/附近 | holysite.nav.overview ~ .nearby |
| 实用信息 | "开放参观"/"建议参访时长"/"时区"/"着装要求" | holysite.openVisit/suggestDuration/timezone/dressCode (已有部分) |
| 设施标签 | "停车场"/"洗手间"/"无障碍通道"/"储物柜"/"导览服务" | holysite.parking ~ .guideService (已有) |
| 评分分布 | "评分分布"/"条评价" | holysite.ratingDistribution/reviewsCount |
| 文化礼仪 | "得体着装，殿堂内禁止拍照" 等5条 | holysite.etiquette.dress ~ .photo |
| 最佳时间 | 月份名/热力图 | common.month.jan ~ .dec |
| 行李清单 | 分类名+物品名 | holysite.packing.essentials ~ .items |
| FAQ | 问答内容 | holysite.faq.q1 ~ .a5 |
| 路线区 | "可预订路线"/"选择日期" | holysite.availableRoutes/selectDate |
| CTA卡片 | "最低价"/"立即预订"/"AI规划" | holysite.lowestPrice/bookNow/askAiPlan (已有部分) |

**列表页 i18n修复清单**:

| 位置 | 硬编码内容 | i18n key |
|------|-----------|---------|
| 洲际标签 | "亚洲"/"欧洲"/"中东" 等 | holySites.continent.* (已有) |
| 筛选UI | 部分标签 | holySites.filter.* |
| 对比模式 | 提示文本 | holySites.compare.* (已有) |

### Phase 2: 详情页数据驱动化 (P0)

**目标**: 将硬编码数据替换为API/schema数据

| 硬编码 | 来源 | 修改 |
|--------|------|------|
| 评分分布百分比 | reviewStats API | 调用review聚合API |
| 日期tabs | 动态生成 | 从当前日期生成7天tabs |
| 人气计数"1.2万" | collectionCount | 使用API返回的真实数据 |
| 最佳时间heatmap | site.bestSeason | 解析bestSeason字段 |
| 文化礼仪5条 | site.tips[] | 使用schema的tips数组 |
| FAQ问答 | 可从community/Q&A API | 先用tips fallback |
| 设施列表 | 静态但i18n化 | 保持静态,改用t() |

### Phase 3: 列表页升级 (P1)

**目标**: Hero统计横幅 + 信仰chip横滑

| Feature | 实现方式 |
|---------|---------|
| Hero横幅 | 统计总数(来自API total) + 国家数(去重) + 信仰数(12) |
| 信仰chip | 横向滚动flex, 替代dropdown |
| 洲际chip | 同上, 置于Hero下方 |
| 精选Top3 | 按reviewStats.averageRating排序取前3 |

### Phase 4: 详情页新增Section (P1)

| Section | 内容 | 数据源 |
|---------|------|--------|
| 交通指南 | 渲染site.transport字段 | HolySite.transport (已有) |
| 朝圣传统 | 宗教特有朝圣仪式说明 | site.religion.description + config |
| 朝圣难度 | 海拔/步行/阶梯/体力评级 | 新i18n key或tips扩展 |

### Phase 5: Review筛选增强 (P2)

| Filter | 说明 |
|--------|------|
| 全部 | 默认 |
| 有图 | hasPhotos=true |
| 已验证 | isVerified=true |
| 好评(4-5⭐) | rating>=4 |
| 差评(1-2⭐) | rating<=2 |
| 最新 | sortBy=createdAt |

---

## §3 验收清单 (闭环++)

| # | 维度 | 验收项 | 方法 |
|---|------|--------|------|
| D1-01 | i18n | 详情页零硬编码中文 | Grep [\u4e00-\u9fff] detail-client.tsx |
| D1-02 | i18n | 列表页零硬编码中文 | Grep [\u4e00-\u9fff] client.tsx |
| D1-03 | i18n | 7语言JSON key集合一致 | 对比zh-CN/en/ja/ko/th/hi/ar |
| D2-01 | 数据 | 评分分布来自API非硬编码 | 代码审查 |
| D2-02 | 数据 | 日期tabs动态生成 | 代码审查 |
| D2-03 | 数据 | 人气数/收藏数来自API | 代码审查 |
| D3-01 | 功能 | 交通指南section渲染transport | 页面检查 |
| D3-02 | 功能 | Hero统计横幅显示正确数字 | 页面检查 |
| D3-03 | 功能 | 信仰chip横滑替代dropdown | 页面检查 |
| D4-01 | 质量 | tsc零错误 | npx tsc --noEmit |
| D4-02 | 质量 | 详情页三态完整(loading/error/empty) | 代码审查 |
| D4-03 | 质量 | 无any类型 | Grep ": any" |
| D5-01 | 体验 | 移动端布局不破裂 | 响应式测试 |
| D5-02 | 体验 | 暗色主题一致性 | 视觉检查 |
