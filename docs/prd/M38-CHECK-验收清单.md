# M38 经论大系统 验收清单

> **配套PRD**: M38-PRD-经论大系统.md | **施工图**: M38-DOC-施工图.md
> **版本**: v1.0 | **日期**: 2026-04-11
> **评分**: ≥4.0 PASS / 3.0-3.9 PARTIAL / <3.0 FAIL

---

## A. 数据完整性 (SCR-DATA)

| # | 检查项 | 期望 | 状态 |
|---|--------|------|------|
| A1 | 经论总数 ≥ 188 | ✅ v10 达成 | ☑ |
| A2 | 12大文化传统全部覆盖 | 每传统 ≥ 8 部 | ☑ |
| A3 | 核心经论章节 ≥ 5 章 | 坛经/金刚/道德/论语 等 | ☑ |
| A4 | 所有 `originalText` 真实经文 [SCR-F01] | 无编造 | ☑ |
| A5 | `chapterNo` 连续递增 无跳号 | `@@unique(scriptureId,chapterNo)` | ☑ |
| A6 | `chapterCount` 与实际章节数一致 | seed 末尾刷新 | ☑ |
| A7 | 所有经论 `oxStageMin/Max` ∈ [1,10] | 十牛图映射 | ☑ |
| A8 | `keyQuotes` Json 结构合法 | `[{quote,explanation}]` | ☑ |
| A9 | `practiceHint` 具象可执行 [SCR-F09] | 禁抽象口号 | ☑ |
| A10 | `ScriptureCategory` 分类树无孤儿 | 所有 Scripture.categoryId 有效 | ☑ |

**诊断脚本**:
```bash
npx tsx -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{
  const total = await p.scripture.count();
  const chapters = await p.scriptureChapter.count();
  const byTradition = await p.scripture.groupBy({by:['tradition'],_count:true});
  console.log({total,chapters,byTradition});
})()"
```

**通过标准**: 10/10 ✅

---

## B. API 契约 (SCR-API)

| # | 路由 | 检查 | 状态 |
|---|------|------|------|
| B1 | `GET /cultivation/scriptures/categories` | 返回树结构 | ☑ |
| B2 | `GET /cultivation/scriptures/graph` | 节点+边 | ☑ |
| B3 | `GET /cultivation/scriptures/recommended` | 基于 user 阶位 | ☑ |
| B4 | `GET /cultivation/scriptures/insights` | 筛选 insightType | ☑ |
| B5 | `GET /cultivation/scriptures?ring=1` | 返回禅宗列表 | ☑ |
| B6 | `GET /cultivation/scriptures/:slug` | 含 chapters + relatedIds | ☑ |
| B7 | `GET /cultivation/scriptures/:slug/chapters/:no` | 原文+注释 | ☑ |
| B8 | `POST /cultivation/scriptures/:slug/view` | viewCount++ | ☑ |
| B9 | 所有路由 `@UseGuards(JwtAuthGuard,CultivationAccessGuard)` | 权限闭环 | ☑ |
| B10 | 列表响应 `{items,total,page,pageSize}` [R-05] | 分页标准 | ☑ |
| B11 | Swagger `/api/docs` 可见 8 路由 | ApiOperation 齐全 | ☑ |

**通过标准**: 11/11 ✅

---

## C. 前端呈现 (SCR-UX)

| # | 页面 | 检查 | 状态 |
|---|------|------|------|
| C1 | `/trips/cultivation/scriptures` 列表加载 | 显示全 188 部 | ☑ |
| C2 | 三环自转动画 30/20/14s | 肉眼可见 | ☑ |
| C3 | 品牌名显示"愿财双圆" | 非"祖庭旅行" | ☑ |
| C4 | 总数显示 "共 188 部" | 动态计数 | ☑ |
| C5 | 详情页 `/scriptures/[slug]` 正常 | 元信息+章节目录 | ☑ |
| C6 | 章节页 `/scriptures/[slug]/[chapterNo]` 正常 | 原文+名句+提示 | ☑ |
| C7 | 三态 (loading/error/empty) [HH-E01 Q4] | 齐全 | ☑ |
| C8 | 响应式 (md/lg) | 移动端可读 | ☑ |
| C9 | 上/下章导航 | 边界正确 (首/末章禁用) | ☑ |
| C10 | 点击经论卡片跳详情 | 无死链 [BS盲区++] | ☑ |

**通过标准**: 10/10 ✅

---

## D. 安全与韧性 (SCR-SEC)

| # | 检查 | 状态 |
|---|------|------|
| D1 | Controller 有 `JwtAuthGuard + CultivationAccessGuard` [R-63] | ☑ |
| D2 | 列表 DTO 有 `@Max(100)` [R-64] | ☑ |
| D3 | `originalText` 前端渲染纯文本，无 XSS [HH-S03] | ☑ |
| D4 | 章节路由无 IDOR (按 slug+chapterNo 查) [R-68] | ☑ |
| D5 | Redis 缓存 key 含作用域前缀 `scripture:*` | ☑ |
| D6 | seed 补丁 upsert 幂等 可重跑 [SCR-20] | ☑ |
| D7 | 生产 API `NODE_NO_COMPILE_CACHE=1` [OPS-01] | ☑ |
| D8 | seed 后 flush Redis scripture:* [OPS-06] | ☑ |

**通过标准**: 8/8 ✅

---

## E. 性能 (SCR-PERF)

| # | 指标 | 期望 | 状态 |
|---|------|------|------|
| E1 | 列表接口 p95 | <300ms | ☑ |
| E2 | 章节接口 p95 | <500ms | ☑ |
| E3 | Redis 列表命中率 | >70% | ☑ |
| E4 | 列表页 LCP | <2.5s | ☑ |
| E5 | DB 索引命中 `@@index([tradition,ring])` | ☑ |

**通过标准**: 5/5 ✅

---

## F. 可维护性 (SCR-MAINT)

| # | 检查 | 状态 |
|---|------|------|
| F1 | schema.prisma 未被 v2+ 补丁修改 [SCR-F03] | ☑ |
| F2 | seed-scriptures.ts v1 基线未被修改 [SCR-F04] | ☑ |
| F3 | 每个 v{N} 补丁独立可运行 [SCR-23] | ☑ |
| F4 | 技能文件 `11-经论++-scripture-enrichment.md` 就位 | ☑ |
| F5 | PRD / DOC / CHECK 三件套齐全 (本次产出) | ☑ |
| F6 | Commit 规范 `feat(api): 经论++ v{N} ...` | ☑ |

**通过标准**: 6/6 ✅

---

## G. 业务价值 (SCR-VALUE)

| # | 三问测试 [BLG-02] | 答 |
|---|------------------|---|
| G1 | Q1 目标用户是谁? | 企业家 / 修行者 / 文化探索者 |
| G2 | Q2 帮用户做什么决策? | 今日读什么 / 如何落地 / 跨文化通悟 |
| G3 | Q3 去掉会变差吗? | 会 — 护城河消失，退化为普通旅行站 |
| G4 | 与 SCP-01 战略一致? | ✅ 文化传统垂直深度 差异化 |
| G5 | 与 SCP-02 竞品吸收? | ✅ TripAdvisor百科 + AmEx品质 + Airbnb沉浸 |

**通过标准**: 5/5 ✅

---

## 总评

| 维度 | 得分 | 评级 |
|------|------|------|
| A 数据完整性 | 10/10 | ⭐⭐⭐⭐⭐ |
| B API契约 | 11/11 | ⭐⭐⭐⭐⭐ |
| C 前端呈现 | 10/10 | ⭐⭐⭐⭐⭐ |
| D 安全韧性 | 8/8 | ⭐⭐⭐⭐⭐ |
| E 性能 | 5/5 | ⭐⭐⭐⭐⭐ |
| F 可维护性 | 6/6 | ⭐⭐⭐⭐⭐ |
| G 业务价值 | 5/5 | ⭐⭐⭐⭐⭐ |
| **合计** | **55/55** | **✅ PASS 5.0** |

---

## 发现的 GAP (未来迭代)

- [ ] P38-F1: 经论全文搜索 (Postgres GIN / search 模块)
- [ ] P38-F2: 音频朗诵 (media 模块关联)
- [ ] F38-F3: UGC 章节笔记 (走 M12 通用评价)
- [ ] Admin-M38: 经论运营后台 CRUD
- [ ] i18n: Scripture / Chapter 多语言字段
- [ ] 版本字段: `edition` 区分同一经论不同译本
- [ ] ScriptureInsight 数量持续补充至 ≥500 条 (AI小鸿知识底座)
- [ ] 信仰力评估 (M36) 的题库从 ScriptureInsight.QUIZ_MATERIAL 取用闭环

---

## 下一步触发

- 内容继续扩充 → `经论++` 或 `经论++ {traditionSlug}`
- 前端页面再优化 → `页面++ 经论大系统`
- 全面审查 → `hohoho M38` 或 `Y+`
- GAP修复 → 按优先级展开子 PRD (P38-F1 / F38-F3 / Admin-M38)
