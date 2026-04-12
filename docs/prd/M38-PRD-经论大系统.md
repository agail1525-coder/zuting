# M38 经论大系统 PRD (愿财双圆·智慧地图)

> **模块代号**: M38 | **版本**: v1.0 | **状态**: ✅ 上线 | **日期**: 2026-04-11
> **定位**: 全球企业家圆满修炼的智慧大系统 — 188部经论 × 12文化传统 × 十牛图阶位
> **愿景**: 起大愿、发大财、布施众生 — 经论是灯，照亮愿财双圆之路

---

## 0. 宪法对齐

- **SCP-01 战略**: 经论大系统是 JOINUS.COM 相对 Booking/TripAdvisor 等旅行平台的**差异化护城河** — 文化传统垂直深度
- **SCP-02 竞品吸收**: TripAdvisor "景点百科" × AmEx "高端品质感" × Airbnb "沉浸式卡片" 的融合
- **SCP-03 PRD先行**: 本文档即 M38 主PRD，子页面见 `P38-*`，子功能见 `F38-*`
- **SCP-04 协议库**: `docs/protocols/skills/11-经论++-scripture-enrichment.md` 为持续充实引擎
- **SCP-06 路线图**: Phase F 内容深化核心成果

---

## 1. 目标用户与业务目的

| 维度 | 描述 |
|------|------|
| **主要用户** | 全球企业家、修行者、文化探索者 |
| **核心诉求** | 在实体朝圣之外，沉浸式阅读权威经论，将古圣智慧落地于商业/家庭/领导力 |
| **业务目的** | ① 内容壁垒 ② 用户停留时长 ③ AI聊天知识底座 ④ 信仰力评估素材源 |
| **差异化** | 与维基/佛学辞典不同：每章必有**企业家可执行的practiceHint** + **十牛图阶位映射** |

**三问测试通过**:
- Q1 用户? → 寻求智慧落地的企业家 / 修行者
- Q2 决策? → 今日修什么、读哪一段、如何应用
- Q3 去掉? → 平台将退化为普通旅行网站，护城河尽失

---

## 2. 竞品对标

| 平台 | 可学 | 已吸收 |
|------|------|--------|
| TripAdvisor | 景点百科 + UGC评价 | ✅ 经论百科(188部) + 章节结构 |
| AmEx Travel | 高端精选感 | ✅ 五环分层(禅宗/佛教宗派/其他10传统) |
| Airbnb | 沉浸卡片 | ✅ 经论卡片 + 作者 + 年代 + 阶位 |
| Goodreads | 读书进度 | ✅ 章节viewCount + 阅读记录 |
| Wikipedia | 知识关联 | ✅ relatedIds 跨文化关联 + 知识图谱graph |
| Audible | 音频导览 | ⏳ 经论音频朗诵 (未来P38-F2) |

---

## 3. 范围 (In / Out)

### 3.1 In — 已交付
- 12大文化传统的 **188部经论** (截至 v10 补丁)
- 每部经论: 标题/作者/年代/ring/分类/摘要/难度/十牛图阶位/标签/关联
- 每章: 原文 / 注释 / keyQuotes / practiceHint
- 后端: `cultivation/scriptures` 模块 (8路由)
- 前端: `/trips/cultivation/scriptures` 列表/详情/章节阅读 3页
- 持续充实引擎: `经论++` 技能 (seed-scriptures-v{N}.ts 幂等补丁模式)

### 3.2 Out — 不在本PRD
- 经论音频 / 视频朗诵 (未来 P38-F2)
- 经论UGC评论 (走 M12 评价系统通用表)
- 经论购买/打赏 (未来 F38-F3)
- Admin 经论后台CRUD (当前纯数据层维护，未来可上 Admin)

---

## 4. 数据模型 (Prisma)

引用 `services/api/prisma/schema.prisma:1842-1934`

```
ScriptureCategory  — 分类树 (ring×tradition×parentId)
Scripture          — 经论主表 (slug/title/author/oxStageMin-Max/relatedIds/tags)
ScriptureChapter   — 章节 (scriptureId+chapterNo 唯一 / originalText / keyQuotes Json / practiceHint)
ScriptureInsight   — AI悟道素材 (DAILY_STUDY|CROSS_REF|PRACTICE_GUIDE|QUIZ_MATERIAL)
```

**关键铁律**:
- [SCR-10..14] Schema对齐 — 见经论++技能文档
- `chapterNo` 从1连续递增，父 `chapterCount` 必须同步
- `oxStageMin/Max` ∈ [1,10] 对齐十牛图
- `ring` ∈ {1禅宗, 2佛教宗派, 3其他10传统}

---

## 5. API 契约 (已上线)

Base: `/api/cultivation/scriptures` — 均需 `JwtAuthGuard + CultivationAccessGuard`

| Method | Path | 说明 | DTO |
|--------|------|------|-----|
| GET | `/categories` | 分类树 | — |
| GET | `/graph` | 知识图谱 (节点+边) | — |
| GET | `/recommended` | 基于用户阶位推荐 | — |
| GET | `/insights` | AI悟道内容 | `InsightQueryDto` |
| GET | `/` | 经论列表 | `ScriptureListQueryDto` (ring/tradition/category/搜索/分页) |
| GET | `/:slug` | 经论详情 + 章节目录 + 关联 + 悟道 | path |
| GET | `/:slug/chapters/:no` | 章节全文+注释 | path |
| POST | `/:slug/view` | 记录阅读 (viewCount++) | path |

**响应格式**: `{ items, total, page, pageSize }` (列表) / 实体对象 (详情)

---

## 6. 前端页面 (P38 子页面索引)

| 页面 | 路径 | 状态 | 要点 |
|------|------|------|------|
| P38-01 经论列表 | `/trips/cultivation/scriptures` | ✅ | 三环分层(愿财双圆)+旋转动画+全188部+总数显示 |
| P38-02 经论详情 | `/trips/cultivation/scriptures/[slug]` | ✅ | 元信息+章节目录+相关经论+AI悟道 |
| P38-03 章节阅读 | `/trips/cultivation/scriptures/[slug]/[chapterNo]` | ✅ | 原文+注释+名句+修行提示+上下章导航 |

**品牌命名**: "经论大系统" 前端展示为 **"愿财双圆"**，三环(禅宗/佛教宗派/其他10传统) 自转 30s/20s/14s

---

## 7. 12大文化传统覆盖 (截至 v10 / 188部)

| 传统 | Ring | 经论数 | 代表 |
|------|------|--------|------|
| 禅宗 ZEN | 1 | ~25 | 坛经·碧岩录·临济录·五灯会元·无门关 |
| 佛教 BUDDHISM | 2 | ~35 | 金刚经·心经·法华经·楞严经·华严经·八宗注疏 |
| 道教 TAOISM | 3 | ~15 | 道德经·南华经·列子·黄庭经·周易参同契·悟真篇 |
| 儒家 CONFUCIANISM | 3 | ~15 | 论语·大学·中庸·孟子·传习录·近思录 |
| 基督 CHRISTIANITY | 3 | ~15 | 福音书·保罗书信·奥古斯丁忏悔录·阿奎那神学大全 |
| 伊斯兰 ISLAM | 3 | ~12 | 古兰经·圣训·鲁米玛斯那维·伊本·阿拉比 |
| 印度 HINDUISM | 3 | ~15 | 吠陀·奥义书·薄伽梵歌·瑜伽经·商羯罗 |
| 犹太 JUDAISM | 3 | ~10 | 妥拉·塔木德·光辉之书·哈西德故事 |
| 锡克 SIKHISM | 3 | ~8 | 古鲁格兰特·十古鲁著作 |
| 神道 SHINTO | 3 | ~8 | 古事记·日本书纪·祝词·平田国学 |
| 藏传 TIBETAN | 3 | ~12 | 密勒日巴十万歌集·宗喀巴菩提道次第·六字真言 |
| 原住民 INDIGENOUS | 3 | ~8 | 部族口传智慧·仪式经典 |
| 巴哈伊 BAHAI | 3 | ~10 | 确信经·七谷经·隐言经 |
| **总计** | - | **188** | **护城河达成** |

---

## 8. 十牛图阶位映射 (差异化护城河)

每部经论必标 `oxStageMin ~ oxStageMax`:

| 阶位 | 图名 | 对应企业家阶段 |
|------|------|--------------|
| 1-3 | 寻牛/见迹/见牛 | 个人觉醒 → 觉察力/初心 |
| 4-6 | 得牛/牧牛/骑牛归家 | 定力培养 → 格局/决断 |
| 7-8 | 忘牛存人/人牛俱忘 | 事业兴旺 → 无我领导 |
| 9-10 | 返本还源/入廛垂手 | 布施回馈 → 愿财双圆 |

---

## 9. 用户故事

- US-01: 作为企业家，我想按 "觉察力" 阶位快速筛选适合我的经论 → `ring+oxStage` 筛选
- US-02: 作为修行者，我想今日读一段《金刚经》并得到可执行建议 → 章节页 practiceHint
- US-03: 作为文化探索者，我想发现《道德经》和《薄伽梵歌》的共通之处 → `relatedIds` 跨文化关联
- US-04: 作为AI聊天用户，我问"如何修定力"，小鸿基于 ScriptureInsight 回答 → AI底座
- US-05: 作为信仰力测评用户，我的评估题目来自经论原文 → QUIZ_MATERIAL insight

---

## 10. 非功能需求

| 项 | 要求 |
|----|------|
| 性能 | 列表 p95 <300ms；章节全文 <500ms (Redis scripture:* 缓存) |
| 安全 | JwtAuthGuard + CultivationAccessGuard 必经；原文禁止XSS注入(纯文本) |
| i18n | titleEn 已就位；未来支持7语言翻译层 |
| 可维护 | 禁改 schema 仅追加 v{N} 补丁；禁改 v1 基线 |
| 版权 | 所有原文采用公认公版/通行译本，杜绝编造 [SCR-F01] |

---

## 11. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 经文编造 | 信誉崩塌 | [SCR-F01] 真实性铁律 + 人工复核关键章节 |
| 宗教争议 | 用户反感 | [SCR-F09] practiceHint禁说教，保持普世可执行 |
| 数据膨胀 | 加载变慢 | 列表分页 + 章节按需加载 + Redis 缓存 |
| 补丁冲突 | 生产数据乱 | [SCR-20..24] upsert幂等 + v{N}递增 + 独立可重跑 |

---

## 12. 验收入口

详见 `docs/prd/M38-CHECK-验收清单.md`
施工图详见 `docs/prd/M38-DOC-施工图.md`
持续充实引擎详见 `docs/protocols/skills/11-经论++-scripture-enrichment.md`

---

## 13. 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-04-11 | 项目++ 首次产出标准PRD，回溯对齐v1-v10数据状态(188部) |
