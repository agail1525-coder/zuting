# 详情页++ (Detail Page Refinement) v1.0

> **代号**: DPG | **版本**: v1.0 | **创建**: 2026-04-22
> **定位**: 详情页深度精修 — 长文叙事卡片化 / 信息层次可视化 / 禁"课本平铺"
> **触发**: `详情页++ {page}` / CEO 审美不满意 / hohoho Step 8 转入

---

## §0 元数据

```yaml
name: detail-page-refinement
version: 1.0
triggers:
  - 详情页++ {route|holy-site|temple|patriarch|seal|guide|package}
  - CEO 反馈"太单调/像读书/不够意蕴"
前置: CLAUDE.md + 目标详情页现状代码
后置: 单卡分节 + 智能 body 渲染 + 暖金主题统一
联动: 页面++ (PQM 上位框架) / 业务++ (前置数据验证) / 体验++ (UX 协同)
```

---

## §1 角色

| 角色 | 职责 |
|------|------|
| Inspector | 扫描详情页长文字段 (description/intro/story),识别"文字墙" |
| Executor  | 按 DPG-01~12 重构为卡片分节 |
| Verifier  | build 验证 + CEO 视觉验收 |

---

## §2 作用域

ZUTING 六大类详情页,凡含长段叙事字段均适用:

| 详情页 | 长文字段 | 当前状态 | 目标 |
|--------|---------|---------|------|
| /holy-sites/routes/[slug] | `route.description` | ✅ 已卡片化 (lingnan-dao-chan v6 模板) | — |
| /holy-sites/[slug] | `holySite.description / stories` | 待办 | DPG-10 |
| /temples/[id] | `temple.description / history` | 待办 | DPG-10 |
| /patriarchs/[id] | `patriarch.biography` | 待办 | DPG-10 |
| /packages/[slug] | `package.description` | 待办 | DPG-10 |
| /seals/[slug] | `seal.meaning / story` | 部分 | DPG-10 |

---

## §3 领域规则 (DPG-01 ~ DPG-12)

### 视觉铁律

```
[DPG-01] 长文字墙禁令
  单字段 length > 400 字 + 含 2+ 个小标题 → 必须分节卡片化,不能 <p whitespace-pre-line>
  反例: ExpandableText({text: route.description, maxLength: 300})
  正例: <RouteStoryCards description={...} />

[DPG-02] 单卡片原则 (2026-04-22 CEO)
  多段叙事 → 一张白卡内分节,不做多张彩色卡片网格
  反例: grid md:grid-cols-2 gap-4 + 7 色 pastel 背景
  正例: bg-white border rounded-lg + divide-y 分节 + 顶部 3px 暖金渐变条
  原因: 多彩卡片眩目、像儿童读物;单卡分节素雅、像精品杂志

[DPG-03] 暖金主题统一
  详情页叙事卡片所有 accent 必须落在站内暖金色系:
    #D4A855 (主)  /  #B8860B (深)  /  #8B6914 (暗)  /  #A8822F (中)
  顶部装饰条: bg-gradient-to-r from-[#d4a855] via-[#b8860b] to-[#d4a855]
  禁止 pastel 彩色系 (bg-emerald-50 / bg-sky-50 / bg-rose-50 ...) 作大面积背景

[DPG-04] 禁 emoji 滥用
  一节一小图标顶多保留,装饰性 emoji 不上大面积卡片
  优先级: 几何符号 (●✦◎□) > emoji (🎯🗺️✨)
  原因: emoji 风格与暖金禅意主题冲突

[DPG-05] 分节标记法
  后端数据里用 【标题 · 副标题】 作为分节锚点 (中文方头括号)
  副标题用中点 · 分隔,前端 regex /\s*[·・·]\s*/ 拆分
  无 【】 标记的旧字段走 ExpandableText 兜底
```

### 智能 body 渲染

```
[DPG-06] 箭头流 (→) 渲染
  body 含 → → 拆分成 chip 序列,末尾如有结论句单独抽出
  chip 样式: bg-[#fffdf7] border-[#f0e5c7] text-[#5a4a1a] rounded px-2.5 py-1.5
  箭头颜色: #c8a86b (暖金淡)
  max-width chip: 280px,超过换行

[DPG-07] 圆圈编号 (①..⑩) 渲染
  每行起始 [①-⑩] → 抽出编号渲染为左侧暖金数字 + 正文
  编号样式: text-[#8b6914] text-base font-semibold w-5 text-center
  行间距: space-y-2.5

[DPG-08] 普通段落渲染
  兜底: split /\n+/ → <p text-gray-700 text-[14.5px] leading-relaxed>
  段落间距 space-y-2.5,不要 <br/> 堆叠

[DPG-09] 标题层级
  section 标题 font-semibold text-[15.5px] md:text-base
  左侧 1×16 暖金竖条 (style backgroundColor: accent) 代替 icon
  副标题 text-gray-500 text-xs,前置 " · " 分隔
```

### 复用铁律

```
[DPG-10] 推广到其他详情页
  RouteStoryCards 组件模式 → 同理可用于:
    HolySiteStoryCards, TempleStoryCards, PatriarchStoryCards...
  后端向对应字段注入 【标题·副标题】 分节即自动生效
  前端只需按字段替换 ExpandableText → XxxStoryCards

[DPG-11] 兼容兜底
  组件内必须判断 description 是否含 /【[^】]+】/
  含 → 卡片化 / 不含 → 走原 ExpandableText
  避免旧数据破板

[DPG-12] 共享路径
  优先把 StoryCards 抽到 apps/web/src/components/StoryCards.tsx 共享
  多个详情页引用同一组件;但首次落地可先 inline 在 [slug]/client.tsx,
  跨 2+ 页面时再抽离 (YAGNI)
```

---

## §4 执行流程

```
Step 1: 扫描目标字段
  grep -l 'whitespace-pre-line\|ExpandableText' apps/web/src/app/{detail-page}
  → 找出仍是文字墙的详情页

Step 2: 确认后端数据分节
  curl API → 检查字段是否已含 【标题·副标题】
  未含 → 先去对应 seed 文件补上分节标记

Step 3: 内联 StoryCards
  client.tsx 顶部 import { Fragment }
  插入 pickAccent / renderStoryBody / RouteStoryCards (~150 行模板)

Step 4: 替换原文字墙
  <ExpandableText text={...} /> → <XxxStoryCards description={...} />
  保留 /【[^】]+】/ 判断兜底

Step 5: build + deploy
  pnpm --filter @zuting/web build → 确认 bundle size 增量 < 2kB
  git commit + py scripts/redeploy-web.py

Step 6: 视觉验收
  访问线上,CEO 审阅截图
  CEO 不满意 → 回 Step 3 调整样式 (多半是色彩密度问题,见 DPG-02/03)
```

---

## §5 评分 (DPG 六维)

| 维度 | 权重 | 检查 |
|------|------|------|
| DPG-D1 信息层次 | 25% | 每节清晰独立,标题/副标题/body 三层可读 |
| DPG-D2 视觉素雅 | 25% | 暖金统一,无 pastel 彩虹,无 emoji 滥用 |
| DPG-D3 智能渲染 | 20% | → / ①②③ 自动识别并结构化 |
| DPG-D4 移动端 | 10% | sm: 单列堆叠,chip max-width 不爆行 |
| DPG-D5 兜底韧性 | 10% | 旧数据 (无【】) 走 ExpandableText 不破板 |
| DPG-D6 bundle | 10% | 单页 bundle 增量 < 2kB |

≥4.0 PASS / 3.0-3.9 PARTIAL / <3.0 FAIL

---

## §6 工具

```
Read/Edit: 目标详情页 client.tsx
Grep: "whitespace-pre-line|ExpandableText" apps/web/src/app
Bash: curl API 确认字段格式 + pnpm build + redeploy-web.py
```

---

## §7 生命周期

```
L1 触发: CEO 审美反馈 / 详情页新交付 / 页面++ 上位调用
L2 执行: 扫描 → 后端分节 → 前端卡片化 → 部署
L3 输出: DPG 六维评分 + commit
L4 沉淀: 跨详情页复用时抽离公共组件 (DPG-12)
```

---

## §8 铁律汇总

见 §3 DPG-01 ~ DPG-12

---

## §9 联动

| 方向 | 技能 | 接口 |
|------|------|------|
| ←上位 | 页面++ (PQM) | 详情页是页面++的子集,PQM 触发后可下钻 DPG |
| ←前置 | 业务++ (BLG) | 先验证字段业务目的,再卡片化 |
| →协同 | 体验++ (UX) | UX 审计三态/响应式/A11y |
| →反哺 | 目的地++ (DST) | 新圣地 seed 必须按【】分节写 description |
| →反哺 | 路线种子 | seed-{route}.ts 的 description 数组按 DPG-05 格式 |

---

## §10 成功案例

### Case 1: /holy-sites/routes/lingnan-dao-chan-2026-may (2026-04-22)

- **问题**: 6 段 description 平铺为一堵文字墙,CEO 反馈"像读书不像享受意蕴"
- **第一次尝试**: 7 色 pastel 卡片网格 → CEO 反馈"卡片太难看,做一个就行"
- **最终方案**: 单张白卡 + 顶部 3px 暖金渐变条 + 节间 hairline divide + 左侧 1×16 暖金竖条 + 智能 → / ①②③ 渲染
- **commit**: `4b13a59` (多卡片 v1) → `0271f29` (单卡片 v2)
- **bundle**: 19.5 → 20.5 → 20.0 kB (final)
- **教训 → DPG-02**: 信息组织 ≠ 色彩堆叠,CEO 对禅意素雅容忍阈值低
