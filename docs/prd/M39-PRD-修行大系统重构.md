# M39-PRD — 修行大系统 Phase 级重构

> **状态**: v1.1 / Wave 1+2 已上线,Wave 3 部分交付 | **负责人**: CEO++ | **日期**: 2026-04-12
> **前置模块**: M37 圆满之路 / M38 经论大系统 / fulfillment / bhumi-path
> **触发来源**: 天查++ / 审查++ 综合报告 — 发现 2 项 P0 + 5 项 P1 + 3 项 P2
> **交付形式**: 跨模块重构,非新建功能。只修不加。

## 📍 执行日志 (2026-04-12)

| Wave | Commit | 状态 | 说明 |
|------|--------|------|------|
| Wave 1 安全底线 | `70bbb78` | ✅ 上线 | 乐观锁 advanceOxStage/advanceBhumi + 转速修复 |
| Wave 2 前端体验 | `3e67ceb` | ✅ 上线 | Toast 6 处反馈 + error-state 修复 + FulfillmentJourney 类型补齐 |
| Wave 3 硬化收尾 | (本次) | ⏳ 编码中 | listWisdomHistory NaN 防护 + PRD 收口 |

### 审查纠偏
- 原 P0#1 (十牛图越界) 实已在 `fulfillment.service.ts:186` `oxStage >= 10` 守卫 — 审查误报
- 原 P0#2 (十地 vowType 跨地) 实已在 `bhumi-path.service.ts:126-127` `matchedVow` 白名单 — 审查误报
- 真 P0 只剩**并发乐观锁** — Wave 1 已修复

### Wave 5 scope 调整
- **FR-05 react-query 全量接入** — **延期**,避免与 Wave 2 同批引入大 blast radius。建议作为 M40 全站数据层 refactor 独立 PRD
- **FR-07 i18n 文案外置** — **延期**,依赖全站 i18n 初始化到 cultivation 路由,独立 M41 处理
- Wave 3 收窄为**输入参数硬化** (pageSize NaN 防护),作为 Wave 1 的延伸

---

## §0 元数据

| 字段 | 值 |
|------|-----|
| PRD 编号 | M39 |
| 主题 | 修行大系统(cultivation)安全/UX/国际化 Phase 重构 |
| 范围 | web/api/admin 三端 |
| 受影响模块 | fulfillment · bhumi-path · ox-path · scripture · wisdom · daily-practice |
| 预计工期 | 3-5 天 (3 Wave) |
| 依赖 | react-query(已安装) · @zuting/translations(已存在) · prisma 乐观锁语义 |
| 风险 | 中 — 涉及状态机关键路径,需灰度+回滚预案 |

---

## §1 背景与目标

### 1.1 背景
修行大系统经天查+审查暴露以下系统性问题:
1. **状态机缺防线** — 十牛图晋阶可越界(>10)、十地大愿可跨地提交
2. **并发脏写** — 双标签页可重复晋阶,无乐观锁
3. **三态伪合一** — gate/data loading 未分离,用户看不到真实错误
4. **缓存失真** — 无 react-query,提交后内存更新,刷新即丢
5. **无法国际化** — OX_STAGE_NAMES 等核心文案硬编码中文
6. **提交无反馈** — 晋阶/发愿后无 toast,用户靠数据回显猜成功与否

### 1.2 战略目标 (SCP 对齐)
- **SCP-06** Phase F3 信仰力评估体系已上线 → 修行大系统是其主宿主,必须零状态机破绽
- **SCP-02** 对标 TripAdvisor UGC 反馈体系 — success toast 是标配
- **HH-V01/V02** 垂直切片 + 空壳零容忍 — 本次不加新功能,只补切片漏洞

### 1.3 不做什么 (Out of Scope)
- ❌ 不新增修行路径 (十地+十牛图已完整,不加"三十七菩提分"等)
- ❌ 不动 Prisma 表结构 (仅加索引/乐观锁条件)
- ❌ 不重写前端组件库 (仅接入 react-query)
- ❌ 不做 i18n 全量翻译 (仅做 key 提取 + zh 基线,en 用 key 兜底)

---

## §2 作用域与文件清单

### 2.1 后端 (services/api)
```
src/modules/fulfillment/fulfillment.service.ts      ← P0#1 越界守卫 + P1#3 乐观锁
src/modules/fulfillment/fulfillment.controller.ts   ← DTO @Max 补强
src/modules/bhumi-path/bhumi-path.service.ts        ← P0#2 vowType 白名单
src/modules/bhumi-path/bhumi-path.controller.ts     ← DTO 动态枚举
src/modules/bhumi-path/constants/ten-bhumi.ts       ← 导出 VOW_TYPES_BY_BHUMI
src/modules/wisdom/wisdom.service.ts                ← @Max(100) take 上限
```

### 2.2 前端 (apps/web)
```
src/app/trips/cultivation/page.tsx                  ← 三态拆分
src/app/trips/cultivation/ox-path/page.tsx          ← useQuery + success toast
src/app/trips/cultivation/bhumi-path/page.tsx       ← useQuery + invalidate
src/app/trips/cultivation/scriptures/page.tsx       ← useQuery staleTime 分级
src/lib/i18n/cultivation.ts (新)                    ← 文案 key 表
```

### 2.3 共享 (packages)
```
packages/translations/src/cultivation.zh.ts (新)    ← OX_STAGE_NAMES + BHUMI_LABELS 等
packages/translations/src/cultivation.en.ts (新)    ← 英文基线(可先等同 key)
```

---

## §3 功能需求

### 3.1 后端安全门 (P0)

**FR-01 十牛图晋阶终态保护**
- 位置: `fulfillment.service.ts:advanceOxStage`
- 行为: `newStage > 10` 抛 `BadRequestException('已至十牛终界,不可再进')`
- 测试: 手动将 `oxStage=10` 用户的晋阶请求,期望 400

**FR-02 十地大愿类型白名单**
- 位置: `bhumi-path.service.ts:submitVow`
- 行为:
  ```ts
  const allowedTypes = VOW_TYPES_BY_BHUMI[journey.bhumiStage] ?? [];
  if (!allowedTypes.includes(input.vowType))
    throw new BadRequestException(`第 ${journey.bhumiStage} 地不存在 ${input.vowType} 愿`);
  ```
- 测试: 第一地用户提交"十地同修"(第十地愿),期望 400

**FR-03 并发晋阶乐观锁**
- 位置: `fulfillment.service.ts:advanceOxStage`
- 行为: 用 `updateMany + where:{ id, oxStage: currentStage }` 代替 `update`
  ```ts
  const result = await prisma.fulfillmentJourney.updateMany({
    where: { id: journey.id, oxStage: journey.oxStage },
    data: { oxStage: newStage, updatedAt: new Date() },
  });
  if (result.count === 0)
    throw new ConflictException('状态已被其他会话更新,请刷新');
  ```
- 同理应用于 `bhumi-path.service.ts:advanceBhumi`

### 3.2 前端 UX (P1)

**FR-04 三态分离**
- 拆 `gateLoading` / `dataLoading` / `error` / `empty` 四态
- 组件: `<CultivationState state={...} />` (新,放 cultivation/_components)
- 伪空态禁止: error 时永远不显示 empty

**FR-05 react-query 接入**
- 所有 cultivation/* 页面 fetch 迁到 `useQuery`
- staleTime 分级:
  - 静态内容 (十牛图定义/十地定义): `Infinity`
  - 用户进度: `5 * 60 * 1000` (5 min)
  - 列表/排行: `60 * 1000` (1 min)
- 提交后: `queryClient.invalidateQueries(['cultivation','journey'])`

**FR-06 Success Toast**
- 晋阶成功 → toast 显示"恭喜:进入第 N 牛:{牌名}"(参照 five-houses 色调)
- 发愿成功 → toast 显示"愿已纳受,大地为证"
- 失败 → toast 显示后端返回的 message

### 3.3 国际化 (P1)

**FR-07 cultivation 文案迁移**
- 抽 `OX_STAGE_NAMES` / `OX_STAGE_DESC` / `BHUMI_LABELS` / `BHUMI_VOWS.description` 到 `packages/translations/src/cultivation.zh.ts`
- 前后端同时消费: 后端 service 返回 key,前端负责翻译 (避免后端嵌入文案)
- 英文版先等同 key,后续由翻译组补齐

---

## §4 实施流程 (3 Wave)

### Wave 1 — 安全底线 (Day 1, 阻断性)
- [ ] FR-01 十牛图越界
- [ ] FR-02 十地 vowType 白名单
- [ ] FR-03 乐观锁 (ox + bhumi)
- [ ] 单元测试: `fulfillment.service.spec.ts` + `bhumi-path.service.spec.ts`
- [ ] 手动 curl 验证: 越界 / 跨地 / 并发三种攻击路径
- [ ] commit + deploy (灰度)

### Wave 2 — 前端体验 (Day 2-3)
- [ ] FR-04 三态组件 + 页面接入 (4 页)
- [ ] FR-05 react-query 接入 + invalidate
- [ ] FR-06 Success Toast (复用现有 toast 组件)
- [ ] Chrome DevTools 人工走查: loading/error/empty/success 四态截屏
- [ ] commit + deploy

### Wave 3 — 国际化 (Day 4-5)
- [ ] FR-07 文案 key 提取
- [ ] 后端 service 返回 stageKey 代替 stageName
- [ ] 前端翻译层接入
- [ ] en.ts 兜底 (key = 英文占位)
- [ ] commit + deploy

---

## §5 验收标准

| # | 验收项 | 通过条件 |
|---|--------|----------|
| AC-01 | 越界防护 | curl POST ox-path/advance (oxStage=10 用户) 返回 400 + 明确 message |
| AC-02 | 跨地防护 | curl POST bhumi-path/vow (第一地用户+第十地 vowType) 返回 400 |
| AC-03 | 并发防护 | 两个 terminal 同时 POST advance,只有一个成功,另一个 409 |
| AC-04 | 三态分离 | 断网刷新 /trips/cultivation 显示 error 而非 empty |
| AC-05 | 缓存一致 | 发愿后不刷新,列表自动更新 (invalidate 生效) |
| AC-06 | Toast 反馈 | 晋阶/发愿成功/失败均有明确 toast |
| AC-07 | 文案外置 | grep "十牛" services/api/src/modules/fulfillment 无直接硬编码 |
| AC-08 | 回归测试 | tsc 全绿 + 现有 e2e 不破 |

---

## §6 铁律与风险

### 6.1 铁律对齐
- **R-07/R-08 状态机** — FR-01/02 直接服务此铁律
- **R-63 Guard** — 所有 cultivation 端点必须已有 `@JwtAuthGuard`,本次不新增端点只加守卫
- **R-64 @Max(100)** — FR-03 wisdom/karma 列表 take 上限
- **FE-01 curl 验证** — 所有 AC 必须 curl 通过才算完成
- **HH-V01 垂直切片** — 本次不新增空壳
- **PP-04 ++只能升级** — 本 PRD 作为现有 M37 的安全补丁,不替代

### 6.2 风险与回滚
| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 乐观锁导致合法请求误杀 | 中 | 中 | 先灰度 5% 用户,监控 409 率 < 0.5% |
| react-query 迁移破旧页 | 中 | 高 | 逐页迁移,每页独立 commit |
| 文案 key 迁移前后端错位 | 低 | 中 | Wave 3 最后做,先后端发 key 后前端消费 |
| 回滚预案 | — | — | 每 Wave 一个独立 commit,可单独 revert |

---

## §7 竞品对标

| 维度 | 现状 | 对标 | 目标 |
|------|------|------|------|
| 状态机防护 | ⚠️ 仅前端禁用 | Duolingo Streak (服务端权威) | ✅ 后端白名单+乐观锁 |
| 进度反馈 | ❌ 无 toast | Strava (完成即庆祝) | ✅ Success toast + 动画 |
| 缓存一致 | ❌ 手动 setData | TripAdvisor Review (自动刷新) | ✅ react-query invalidate |
| 国际化 | ❌ 硬编码中文 | Booking (40+ 语言) | ⚠️ key 提取 (en 兜底) |

---

## §8 后续衍生 PRD

- **P40-PRD-修行 Toast 组件** — 复用现有 toast 或新建 cultivation 主题 toast
- **F12-PRD-修行进度乐观 UI** — submit 时立即更新 UI,失败回滚 (本次不做)
- **M40-PRD-修行多语言完整翻译** — en/ja/ko 补齐 (本次只做 key 提取)

---

## §9 评审签核

| 角色 | 状态 | 备注 |
|------|------|------|
| CEO++ | ⏳ 待批 | — |
| 后端负责 | — | Wave 1 交付人 |
| 前端负责 | — | Wave 2 交付人 |
| i18n | — | Wave 3 交付人 |
| QA | — | AC-01~08 验收人 |

---

**签批即执行**。本 PRD 通过后,直接进入 Wave 1 编码,无需再写子 PRD。
