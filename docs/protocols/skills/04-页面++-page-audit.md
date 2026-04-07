# 页面++ (Page Audit & Upgrade) v1.0

> **代号**: PQM | **版本**: v1.0 | **创建**: 2026-04-06 | **移植自**: 作业郎 页面++ v3.0
> **定位**: PRD驱动页面深度重构 — 对标10大旅行竞品循环升级
> **触发**: `页面++ {page}` / 全审++ Step 8 / CEO指令

---

## §0 元数据

```yaml
name: page-audit-upgrade
version: 1.0
triggers:
  - 页面++ {page-name}     # 指定页面升级
  - 页面++ {module}         # 模块下所有页面
  - 全审++ Step 8 (可选)
前置条件:
  - CLAUDE.md 已读取
  - 目标页面PRD已存在 (docs/prd/)
  - 竞品调研已完成或同步进行
后置动作:
  - 输出PQM评分
  - 页面达到竞品对标基准
  - PRD更新 (如代码优于PRD)
联动技能: 业务++ (前置验证) / 体验++ (UX协同) / 盲区++ (缺陷扫描)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Inspector** | 读PRD → 扫描现状 → 竞品对标分析 | Step 1-3 |
| **Executor** | 执行页面重构/升级 | Step 4-5 |
| **Verifier** | 对照PRD逐项验收 + tsc验证 | Step 6 |

---

## §2 作用域

### 竞品对标矩阵 (SCP-02)

| 页面类型 | 主对标 | 辅对标 | 关键功能 |
|---------|-------|-------|---------|
| 首页 | Trip.com, Booking | Airbnb | 大图Hero+搜索+推荐+分类导航 |
| 列表页 | Booking, Kayak | Skyscanner | 筛选+排序+地图+卡片+分页 |
| 详情页 | Airbnb, Booking | TripAdvisor | 沉浸图片+信息架构+评价+预订CTA |
| 路线/套餐 | Expedia, Trip.com | Priceline | 行程安排+价格+包含/不含+预订 |
| 社区/攻略 | TripAdvisor | Airbnb | UGC+评分+照片墙+排行榜 |
| 价格中心 | Skyscanner, Kayak | Priceline | 比价+日历+趋势图+提醒 |
| 会员体系 | AmEx Travel | Agoda | 等级+积分+专属权益+签到 |
| 优惠促销 | Agoda, Priceline | Booking | 限时折扣+闪购+优惠券 |
| 订单/支付 | Booking | Agoda | 订单状态+支付流程+退款 |
| 搜索 | Booking, Kayak | Skyscanner | 全站搜索+热词+建议+筛选 |

---

## §3 领域规则

### 页面重构铁律

```
[PQM-01] 先读PRD再动代码 — 无PRD先补PRD
[PQM-02] 双向分析 — 代码可能比PRD更好，不盲目删已有好代码
[PQM-03] 每个子页面独立重构PRD — 不允许一个PRD涵盖多个页面设计
[PQM-04] 竞品对标必须具体 — "更像Booking"不够，要说"Booking的筛选器有X/Y/Z功能"
[PQM-05] 移动优先 — 所有页面先确保移动端体验，再优化桌面端
[PQM-06] 非触限不停 — 对标竞品循环升级，每轮至少提升1个维度
[PQM-07] 宗教文化差异化 — 在对标竞品的同时保持ZUTING的宗教文化特色
[PQM-08] 图片质量 — Hero图/卡片图必须使用高质量placeholder或真实图片
[PQM-09] CTA明确 — 每个页面至少有一个明确的行动号召按钮
[PQM-10] 数据密度 — 信息架构向Booking/Kayak看齐，不浪费屏幕空间
```

---

## §4 执行流程

```
Step 0: 环境准备
  → 读取 CLAUDE.md + 目标页面PRD (docs/prd/)
  → 确认业务++已通过 (或同步执行)

Step 1: 现状扫描
  → Read 目标页面代码 (所有相关组件)
  → 列出: 当前功能清单 + UI结构 + 数据流

Step 2: PRD对比
  → 对照PRD检查:
    - PRD中有但代码中缺的功能 → 标记[待实现]
    - 代码中有但PRD中没有的功能 → 评估保留或删除
    - PRD描述模糊的部分 → 参考竞品具体化

Step 3: 竞品对标
  → 参考§2竞品对标矩阵
  → 逐功能对比: 当前实现 vs 竞品实现
  → 识别差距 → 输出升级清单

Step 4: 重构执行
  → 按优先级执行升级:
    P0: 功能缺失/数据错误
    P1: UI/UX与竞品差距大
    P2: 细节优化/polish
  → 每轮修改后tsc验证

Step 5: 跨端同步 (如适用)
  → Web页面升级后检查Mobile/Mini是否需同步
  → Admin后台是否需要对应管理功能

Step 6: 验收
  → 对照PRD逐项验收
  → 竞品对标检查 (至少达到2个竞品基准线)
  → tsc编译验证
  → 输出PQM评分
```

---

## §5 评分机制

| 维度 | 代号 | 检查项 |
|------|------|--------|
| PQM-D1 PRD对齐 | 20% | PRD用户故事全部实现 |
| PQM-D2 竞品对标 | 20% | 达到2个主对标竞品的功能基准 |
| PQM-D3 信息架构 | 15% | 数据密度合理，信息层次清晰 |
| PQM-D4 视觉质量 | 15% | 色调/间距/字体/图片符合设计规范 |
| PQM-D5 交互体验 | 15% | 动画/过渡/反馈/手势合理 |
| PQM-D6 宗教特色 | 15% | 保持ZUTING宗教文化差异化特色 |

---

## §6 工具治理

```
允许工具:
  - Read: 读取页面代码/PRD/竞品分析
  - Grep: 搜索组件引用/API调用
  - Glob: 发现页面文件结构
  - Edit: 修改页面代码
  - Write: 创建新组件 (如需要)
  - WebSearch: 竞品功能调研

检测命令:
  页面文件:     Glob "apps/web/src/app/{page}/**/*"
  组件引用:     Grep "import.*from.*components" --path "apps/web/src/app/{page}"
  API调用:      Grep "fetch|api\.|useQuery" --path "apps/web/src/app/{page}"
  i18n使用:     Grep "t\(|useTranslation|useI18n" --path "apps/web/src/app/{page}"
```

---

## §7 生命周期

```
L1 触发: CEO指令 / 全审++可选Step / 手动调用
L2 执行: 现状扫描 → PRD对比 → 竞品对标 → 重构 → 验收
L3 输出: PQM评分 + 升级记录 + PRD更新(如需)
L4 反馈: CEO审阅 / 用户测试
L5 沉淀: 竞品对标发现 → 更新PRD / 新组件模式 → 更新设计规范
```

---

## §8 铁律清单

见§3领域规则 PQM-01 ~ PQM-10

---

## §9 联动点

| 方向 | 技能 | 接口 |
|------|------|------|
| ←前置 | 业务++ | 确保数据服务于业务目的 |
| ←调用 | 全审++ | Step 8 可选调用 |
| →协同 | 体验++ | 重构后交体验++做UX审计 |
| →触发 | 盲区++ | 重构后扫描新引入的缺陷 |
| ←参考 | PRD | docs/prd/ 页面设计规格 |
| ←参考 | 竞品 | §2 对标矩阵 |
| →输出 | PRD | 代码优于PRD时反向更新PRD |
