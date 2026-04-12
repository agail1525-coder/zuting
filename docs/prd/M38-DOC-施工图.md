# M38 经论大系统 施工图 (Construction Blueprint)

> **配套PRD**: M38-PRD-经论大系统.md | **验收清单**: M38-CHECK-验收清单.md
> **版本**: v1.0 | **日期**: 2026-04-11 | **状态**: ✅ 已建成 / 本文档为回溯施工图

---

## 1. 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                       前端 (Web)                              │
│  /trips/cultivation/scriptures              (列表: 三环自转)  │
│  /trips/cultivation/scriptures/[slug]       (详情: 章节目录)  │
│  /trips/cultivation/scriptures/[slug]/[no]  (章节: 原文+注)   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (JWT Bearer)
┌──────────────────────────┴──────────────────────────────────┐
│             NestJS API — cultivation/scriptures              │
│  ScriptureController  (8 routes)                             │
│  ScriptureService     (列表/详情/章节/推荐/图谱/悟道)        │
│  ScriptureLearningService (学习进度 — 关联 cultivation 模块) │
│  Guards: JwtAuthGuard + CultivationAccessGuard               │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma
┌──────────────────────────┴──────────────────────────────────┐
│                    PostgreSQL (5435)                         │
│  ScriptureCategory / Scripture / ScriptureChapter            │
│  ScriptureInsight   (AI素材: DAILY_STUDY|CROSS_REF|...)       │
│                                                               │
│                    Redis (6380)                               │
│  scripture:list:*   scripture:detail:*   scripture:chapter:* │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ seed
┌──────────────────────────┴──────────────────────────────────┐
│        持续充实引擎 (经论++)                                  │
│  prisma/seed-scriptures.ts          (v1 基线 62部)            │
│  prisma/seed-scriptures-v2..v10.ts  (增量补丁 → 188部)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 文件清单 (按层)

### 2.1 数据层
| 文件 | 职责 |
|------|------|
| `services/api/prisma/schema.prisma:1842-1934` | 4个模型定义 (Category/Scripture/Chapter/Insight) |
| `services/api/prisma/seed-scriptures.ts` | v1 基线 (62部经论 / 68章) — **禁改** |
| `services/api/prisma/seed-scriptures-v2.ts` | v2 深度补章 (+21部/+127章) |
| `services/api/prisma/seed-scriptures-v3..v9.ts` | v3-v9 循环扩充 (道儒耶回印/二线/弱传统) |
| `services/api/prisma/seed-scriptures-v10.ts` | v10 收官 (+17部/+34章 → 达成188) |

### 2.2 后端层
| 文件 | 职责 |
|------|------|
| `services/api/src/modules/cultivation/scripture.controller.ts` | 8个 REST 路由 |
| `services/api/src/modules/cultivation/scripture.service.ts` | 列表/详情/章节/图谱/推荐/悟道 业务逻辑 |
| `services/api/src/modules/cultivation/scripture-learning.service.ts` | 用户学习进度 (关联 CultivationProgress) |
| `services/api/src/modules/cultivation/zen-quiz.service.ts` | 基于经论的禅修测验 (信仰力素材源) |
| `services/api/src/modules/cultivation/dto/scripture.dto.ts` | ScriptureListQueryDto / InsightQueryDto |
| `services/api/src/modules/cultivation/cultivation.module.ts` | 注册 Controller + Service |
| `services/api/src/modules/cultivation/guards/cultivation-access.guard.ts` | 权限守卫 |

### 2.3 前端层
| 文件 | 职责 |
|------|------|
| `apps/web/src/app/trips/cultivation/scriptures/page.tsx` | 列表页(三环愿财双圆+自转+总数) |
| `apps/web/src/app/trips/cultivation/scriptures/[slug]/page.tsx` | 详情页 |
| `apps/web/src/app/trips/cultivation/scriptures/[slug]/[chapterNo]/page.tsx` | 章节阅读页 |

### 2.4 协议与规范
| 文件 | 职责 |
|------|------|
| `docs/protocols/skills/11-经论++-scripture-enrichment.md` | 持续充实引擎技能定义 |
| `docs/prd/M38-PRD-经论大系统.md` | 本模块主PRD |
| `docs/prd/M38-CHECK-验收清单.md` | 验收标准 |

---

## 3. 关键实现要点

### 3.1 列表页三环自转 (brand: 愿财双圆)
- 三环分层: 内环=禅宗(ring1) / 中环=佛教宗派(ring2) / 外环=其他10传统(ring3)
- 旋转周期: 30s / 20s / 14s (hover暂停)
- 用 `dangerouslySetInnerHTML` 注入 keyframes (commit `afed09c`)
- 载入全188部，不分页；显示总数 (commit `bd67078`)

### 3.2 章节阅读页
- `originalText` 渲染为纯文本 (禁HTML注入)
- `keyQuotes` 按 Json `[{quote,explanation}]` 列表展示
- `practiceHint` 高亮卡片 — "今日可执行"
- 上/下章导航按 `chapterNo` 递增

### 3.3 后端查询关键点
- `listScriptures` — `{ring, tradition, categoryId, q, page, pageSize}` 筛选；默认 `isPublished=true`
- `getScripture` — include `category` + `chapters (select chapterNo/title)` + 计算 `relatedIds`
- `getChapter` — `findUnique({scriptureId_chapterNo})`，命中后 +viewCount
- Redis 缓存 key: `scripture:list:{hash}` / `scripture:detail:{slug}` / `scripture:chapter:{slug}:{no}`
- TTL: 列表 5min / 详情 1h / 章节 6h

### 3.4 种子补丁模式 [SCR-20..24]
```typescript
// seed-scriptures-v{N}.ts 标准骨架
const CHAPTER_PATCHES: Record<string, ChapterDef[]> = { ... };
const NEW_SCRIPTURES: NewScriptureDef[] = [ ... ];

// 1. upsert 已有经论的新章节 (scriptureId_chapterNo unique)
// 2. create 新经论 (先 existsBySlug 检查)
// 3. 重建 relatedIds 关联
// 4. 刷新父 Scripture.chapterCount
// 5. console.log 增量报告
```

---

## 4. 部署流水

```bash
# 1. 本地验证补丁
cd services/api && npx tsx prisma/seed-scriptures-v{N}.ts

# 2. 提交
git add services/api/prisma/seed-scriptures-v{N}.ts
git commit -m "feat(api): 经论++ v{N} ..."

# 3. 部署 (deploy-xiaoqing.py 会 build + upload + restart)
python scripts/deploy-xiaoqing.py

# 4. 远程种子 (SSH paramiko)
ssh root@120.24.31.151 'cd /opt/zuting/api && NODE_NO_COMPILE_CACHE=1 npx tsx prisma/seed-scriptures-v{N}.ts'

# 5. Redis flush (部署脚本自动)
redis-cli -p 6380 --scan --pattern 'scripture:*' | xargs redis-cli -p 6380 del

# 6. 健康检查
curl https://api.joinus.com/api/cultivation/scriptures?pageSize=1 -H "Authorization: Bearer ..."
```

**关键OPS铁律**:
- [OPS-01] 生产启动必须 `NODE_NO_COMPILE_CACHE=1`
- [OPS-06] seed 后必须 flush Redis scripture:*
- [SCR-F06] 部署后必须 SSH 运行远程种子

---

## 5. 监控与运维

| 指标 | 健康值 | 告警阈值 |
|------|--------|---------|
| 经论总数 | 188 | <185 |
| 章节总数 | ~600 | <500 |
| 列表接口 p95 | <300ms | >800ms |
| 章节接口 p95 | <500ms | >1500ms |
| 列表 Redis 命中率 | >70% | <40% |
| scriptureInsight 总数 | ≥100 | <50 |

**诊断命令**:
```bash
npx tsx -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{console.log('scriptures:',await p.scripture.count(),'chapters:',await p.scriptureChapter.count(),'insights:',await p.scriptureInsight.count())})()"
```

---

## 6. 扩展点 (未来)

- **音频朗诵** (F38-F2): 每章关联 `audioUrl`，走 media 模块
- **经论搜索** (P38-F1): 全文索引 `originalText` → Postgres GIN / 或接 search 模块
- **UGC心得** (F38-F3): 用户章节笔记 — 走 M12 评价系统通用表
- **Admin后台** (Admin-M38): 经论/章节 CRUD 入 Admin 运营端
- **i18n多语言**: Scripture 增加 titleI18n Json / Chapter 增加 textI18n Json
- **AI深度悟道**: ScriptureInsight 自动生成，结合小鸿 LLM

---

## 7. 已知限制

- 章节 `originalText` 当前用纯文本，未支持分段元数据 (未来可 markdown)
- `relatedIds` 为字符串数组，非外键 — 手动维护，未来可独立 `ScriptureRelation` 表
- 无经论版本字段 (如《金刚经》鸠摩罗什译本 vs 玄奘译本) — 未来可加 `edition`
- Admin 尚无 CRUD 界面，纯依赖 seed 补丁维护
