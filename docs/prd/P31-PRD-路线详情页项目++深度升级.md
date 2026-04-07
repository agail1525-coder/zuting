# P31 — 路线详情页·项目++深度升级PRD

## 元数据
- 页面: /holy-sites/routes/[slug]
- 文件: apps/web/src/app/holy-sites/routes/[slug]/client.tsx
- 状态: 执行中
- 对标: Trip.com + Klook + Viator + GetYourGuide + Airbnb Experiences
- 触发: 项目++ 深度升级指令

## 现状分析
- 1,023行，29个区域，12内部+11外部组件
- 基础良好(4/5)但存在5处硬编码虚假数据
- 缺少行业标准功能: 难度说明、出发须知、交通图标行程

## 升级清单

### P0 — 消除虚假数据 (必做)
| # | 当前 | 问题 | 升级方案 |
|---|------|------|----------|
| 1 | AccessibilityInfo | 6项硬编码，所有路线显示相同 | → RouteSuitability: 基于difficulty+duration动态推算 |
| 2 | TravelerTypeTags | 硬编码30/25/20/18/7%百分比 | → WhoIsThisFor: 基于路线属性推荐适合人群 |
| 3 | GuideProfile | 模板化"资深领队"，无真实数据 | → 宗教文化感知+路线专属描述 |
| 4 | CancellationPolicy | 纯文本列表 | → 红绿灯色彩分级视觉 |

### P1 — 高影响体验提升
| # | 区域 | 升级内容 |
|---|------|----------|
| 5 | Itinerary | 可折叠手风琴+站间交通图标+餐食住宿卡片化 |
| 6 | 新增: KnowBeforeYouGo | 出发须知(装备/礼仪/签证/体力要求) |
| 7 | Related Sites | 带图片+宗教颜色+hover效果 |

### P2 — 对标竞品增强
| # | 区域 | 升级内容 |
|---|------|----------|
| 8 | Difficulty说明 | 在难度标签旁添加tooltip解释 |
| 9 | Itinerary Day标题 | 添加日程简要摘要行 |

## 竞品对标
- Klook: 每日行程卡片带图片+时长+交通
- Viator: Know Before You Go 独立区域
- GetYourGuide: 适合人群推荐
- Trip.com: 红绿灯退改政策+紧凑实用信息
- Airbnb: 主人(领队)profile带宗教文化描述

## 验收标准
- [ ] 无硬编码虚假数据
- [ ] 难度/时长/人群全部动态生成
- [ ] 行程可折叠+交通图标
- [ ] 退改政策有颜色分级
- [ ] 出发须知模块完整
- [ ] i18n覆盖所有新增文案
- [ ] 移动端响应正常
