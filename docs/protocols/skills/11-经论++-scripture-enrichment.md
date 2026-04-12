# 经论++ (Scripture Enrichment) v1.0

> **代号**: SCR | **版本**: v1.0 | **创建**: 2026-04-10
> **定位**: 经论大系统持续充实引擎 — 循环补充12大文化传统的经论内容
> **愿景**: 打造全球企业家实现圆满修炼的智慧大系统 (愿财双圆)
> **触发**: `经论++` / `经论++ {traditionSlug}` / `经论++ 新增 {scriptureSlug}`

---

## §0 元数据

```yaml
name: scripture-enrichment
version: 1.0
triggers:
  - 经论++                       # 自动循环选择最弱传统扩充
  - 经论++ {traditionSlug}       # 针对特定传统深度补充(如: 经论++ ZEN)
  - 经论++ 新增 {slug}           # 新增一部指定经论
  - 经论++ 补章 {slug}           # 对某经论进行章节补全
前置条件:
  - M38 经论大系统已上线 (Scripture/ScriptureChapter表存在)
  - 已读 services/api/prisma/schema.prisma 确认字段
  - 本地可运行 npx tsx + 生产可SSH部署
后置动作:
  - 生成 seed-scriptures-v{N}.ts 补丁文件 (N递增)
  - 本地验证 → git commit → PUSH++ 部署
  - 生产SSH运行v{N}种子 + Redis缓存刷新
联动技能: 项目++ (PRD生成) / 全审++ (质量审查) / 五全++ (前后端一致性)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Scholar** (学者) | 从文献/经典中提取真实经文原文+注释 | Step 1-2 |
| **Compiler** (编纂) | 按Schema结构编排章节/名句/修行提示 | Step 3 |
| **Seeder** (播种) | 生成幂等upsert补丁文件 | Step 4 |
| **Deployer** (部署) | 本地验证→远程部署→缓存刷新 | Step 5-6 |
| **Auditor** (审核) | 验证经论/章节计数 + 前端呈现 | Step 7 |

---

## §2 作用域

### 2.1 12大文化传统目标经论数

| 传统 | Ring | 当前 | 目标 | 方向 |
|------|------|------|------|------|
| 禅宗 ZEN | 1 | 16 | 25 | 五家七宗语录+高僧著作 |
| 佛教 BUDDHISM | 2 | 22 | 35 | 八宗核心经论+注疏 |
| 道教 TAOISM | 3 | 5 | 15 | 老庄列+内丹+全真+正一 |
| 儒家 CONFUCIANISM | 3 | 5 | 15 | 四书五经+宋明理学+阳明心学 |
| 基督 CHRISTIANITY | 3 | 5 | 15 | 新旧约+教父+奥古斯丁+阿奎那 |
| 伊斯兰 ISLAM | 3 | 4 | 12 | 古兰+圣训+鲁米+伊本·阿拉比 |
| 印度 HINDUISM | 3 | 5 | 15 | 吠陀+奥义书+薄伽梵歌+商羯罗 |
| 犹太 JUDAISM | 3 | 4 | 10 | 妥拉+塔木德+卡巴拉+哈西德 |
| 锡克 SIKHISM | 3 | 3 | 8 | 古鲁格兰特+十古鲁著作 |
| 神道 SHINTO | 3 | 3 | 8 | 古事记+日本书纪+祝词+国学 |
| 藏传 TIBETAN | 3 | 4 | 12 | 大藏经+米拉日巴+宗喀巴+六字真言 |
| 原住民 INDIGENOUS | 3 | 3 | 8 | 各部族口传智慧+仪式经典 |
| 巴哈伊 BAHAI | 3 | 4 | 10 | 确信经+七谷经+巴孛著作 |
| **总计** | - | **83** | **188** | **持续扩充至目标** |

### 2.2 单经论章节质量标准

| 级别 | 章节数 | 原文 | keyQuotes | practiceHint | commentary |
|------|--------|------|-----------|--------------|------------|
| ⭐⭐⭐⭐⭐ (核心) | 10+ | 真实全文 | ≥3条/章 | 必须 | 必须 |
| ⭐⭐⭐⭐ (重要) | 5-9 | 真实全文 | ≥2条/章 | 必须 | 建议 |
| ⭐⭐⭐ (一般) | 3-4 | 真实选段 | ≥1条/章 | 必须 | 可选 |
| ⭐⭐ (入门) | 2 | 真实选段 | ≥1条/章 | 必须 | 可选 |
| ⭐ (索引) | 1 | 真实选段 | 可选 | 建议 | 可选 |

### 2.3 企业家圆满修炼映射 (差异化护城河)

每部经论必须标注 `oxStageMin-oxStageMax` (十牛图1-10阶)，服务企业家：
- 阶1-3 **寻牛/见迹/见牛**: 个人觉醒 → 觉察力/初心
- 阶4-6 **得牛/牧牛/骑牛归家**: 定力培养 → 格局/决断
- 阶7-8 **忘牛存人/人牛俱忘**: 事业兴旺 → 无我领导
- 阶9-10 **返本还源/入廛垂手**: 布施回馈 → 愿财双圆

---

## §3 领域规则

### 3.1 数据真实性铁律

```
[SCR-01] 所有originalText必须是真实经典原文，严禁AI编造
[SCR-02] 有历史版本差异时，优先采用通行本(如金刚经用鸠摩罗什译本)
[SCR-03] 翻译类经论(古兰经/圣经)采用公认权威译本
[SCR-04] 原文≥50字，名句提炼≥1条，修行提示必须具象可执行
[SCR-05] 跨文化对照时，标注源语言(梵文/巴利文/阿拉伯文/希伯来文)
```

### 3.2 Schema对齐铁律

```
[SCR-10] Scripture字段: slug/title/titleEn/author/era/ring/categoryId/
         summary/significance/difficulty(1-5)/oxStageMin/oxStageMax/
         readingMins/tags/chapterCount/viewCount/relatedIds
[SCR-11] ScriptureChapter字段: scriptureId/chapterNo/title/subtitle/
         originalText/commentary/keyQuotes(JSON)/practiceHint
[SCR-12] chapterNo从1开始连续递增，不允许跳号
[SCR-13] 新增章节后必须更新父Scripture的chapterCount字段
[SCR-14] keyQuotes JSON结构: { quote: string, explanation: string }[]
```

### 3.3 幂等与可重跑

```
[SCR-20] 使用upsert模式: scriptureId_chapterNo 复合unique约束
[SCR-21] 新经论用create + 前置existsBy slug检查，避免唯一冲突
[SCR-22] 补丁文件命名: seed-scriptures-v{N}.ts (N从2开始递增)
[SCR-23] 每个补丁文件独立可运行，不依赖前序版本顺序
[SCR-24] 补丁包含 upsert 后必须重建 relatedIds 关联
```

### 3.4 企业家价值映射

```
[SCR-30] 每章practiceHint必须具象可执行 (非抽象口号)
         ❌ "修习止观"  ✅ "今日静坐20分钟，观察呼吸"
[SCR-31] 每章keyQuotes至少一条能连接商业/家庭/领导力场景
[SCR-32] 核心经论必须有commentary说明对企业家的现代启示
[SCR-33] 跨传统关联(relatedIds)体现"融通"理念 — 儒释道耶回同源
```

---

## §4 标准执行流程

### Step 1: 现状诊断 (Inspect)
```sql
-- 诊断当前经论覆盖密度
SELECT r.name, COUNT(s.id) as scriptures, SUM(s.chapterCount) as chapters
FROM Scripture s LEFT JOIN ScriptureCategory c ON s.categoryId=c.id
GROUP BY c.tradition ORDER BY chapters ASC;
```
- 识别最弱传统 (chapters最少)
- 识别单章经论 (chapterCount=1 且在核心名单)
- 输出"待补充优先队列"

### Step 2: 内容准备 (Scholar)
按优先队列逐一处理：
1. 确定经论slug/title/author/era/tradition
2. 查找真实经文原文 (知识库/经典通行本)
3. 提炼名句 + 编写面向企业家的修行提示
4. 若为新经论，还需 summary + significance + tags

### Step 3: 文件生成 (Compiler + Seeder)
- 读取现有最新补丁号: `ls services/api/prisma/seed-scriptures-v*.ts`
- 生成下一版本: `seed-scriptures-v{N+1}.ts`
- 结构:
  ```typescript
  const CHAPTER_PATCHES: Record<slug, ChapterDef[]> = { ... };
  const NEW_SCRIPTURES: NewScriptureDef[] = [ ... ];
  // upsert 循环 + create 循环 + 关联重建 + chapterCount刷新
  ```

### Step 4: 本地验证 (Seeder)
```bash
cd services/api && npx tsx prisma/seed-scriptures-v{N}.ts
# 预期输出: ✓ X 经论补充了 Y 章节 / ✓ Z 新经论
```
- 验证输出计数符合预期
- 若报错(引号/Schema不匹配)立即修复

### Step 5: 部署 (Deployer)
```bash
git add services/api/prisma/seed-scriptures-v{N}.ts
git commit -m "feat(cultivation): M38.{N} 经论充实 — ..."
git push
python scripts/deploy-xiaoqing.py
```

### Step 6: 生产种子 + 缓存刷新
```python
# SSH paramiko → 120.24.31.151
ssh.exec_command('cd /opt/zuting/api && npx tsx prisma/seed-scriptures-v{N}.ts')
# 部署脚本已自动flush Redis scripture:* keys
```

### Step 7: 审计验证 (Auditor)
- 访问 `/trips/cultivation/scriptures` 确认新经论显示
- 抽查1-2部新经论的详情页+章节阅读页
- 记录本轮增量: 经论+X / 章节+Y
- 更新 memory: 当前经论总数/章节总数

---

## §5 评分体系 (N维 × 5⭐)

| 维度 | 5⭐ | 4⭐ | 3⭐ | 2⭐ | 1⭐ |
|------|----|----|----|----|----|
| **真实性** | 100%原文 | 90%原文 | 70%原文 | <70% | 有编造 |
| **章节密度** | 核心经论≥10章 | ≥6章 | ≥3章 | ≥2章 | 1章 |
| **传统覆盖** | 12传统目标达成 | 11传统 | ≥9传统 | ≥7传统 | <7传统 |
| **修行可执行性** | 每章具象hint | 80%具象 | 60%具象 | <60% | 抽象口号 |
| **企业家映射** | oxStage+商业启示 | 仅oxStage | 仅tags | 无映射 | 无 |
| **幂等性** | 可重跑零副作用 | 需手动清理 | 有冲突 | 报错 | 不可重跑 |

**前缀**: SCR-01~SCR-N
**目标**: ≥4.0 PASS / 3.0-3.9 PARTIAL / <3.0 FAIL

---

## §6 工具与文件

### 关键文件
- `services/api/prisma/schema.prisma` — Scripture/ScriptureChapter/ScriptureCategory模型
- `services/api/prisma/seed-scriptures.ts` — 初版种子 (v1, 62经论)
- `services/api/prisma/seed-scriptures-v2.ts` — 第二轮补丁 (83经论/195章)
- `services/api/prisma/seed-scriptures-v{N}.ts` — 本技能持续产出的增量补丁
- `services/api/src/modules/cultivation/scripture.service.ts` — 后端服务
- `apps/web/src/app/trips/cultivation/scriptures/**` — 前端呈现

### 命令速查
```bash
# 本地种子
cd services/api && npx tsx prisma/seed-scriptures-v{N}.ts

# 诊断当前计数
npx tsx -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{console.log('scriptures:',await p.scripture.count(),'chapters:',await p.scriptureChapter.count())})()"

# 部署
python scripts/deploy-xiaoqing.py

# 生产种子 (via paramiko)
# 见 Step 6 SSH脚本
```

---

## §7 生命周期

### 触发模式

**模式A: 自动循环 (经论++)**
```
1. Step 1 诊断 → 选出章节最少的传统/经论
2. Step 2-7 完整执行
3. 报告增量 → 若距目标(188部)仍远，提示用户下一轮
```

**模式B: 定向深化 (经论++ {tradition})**
```
1. 仅针对该传统诊断
2. 补齐该传统至目标数
3. 报告该传统前后对比
```

**模式C: 单点新增 (经论++ 新增 {slug})**
```
1. 生成单经论的补丁文件
2. 完整流程部署
```

### 迭代节奏
- 每轮补丁增量: 5-15部经论 + 30-80章节
- 版本号递增: v2 → v3 → v4 ...
- 目标达成后转入"精修模式": 提升单经论章节深度

---

## §8 铁律 (SCR-F01~SCR-F10)

```
[SCR-F01] 原文真实性绝对不可妥协 — 宁可少一章，不可编一字
[SCR-F02] 每个补丁文件必须先本地验证通过才能commit
[SCR-F03] 禁止修改 schema.prisma (仅追加数据，不改结构)
[SCR-F04] 禁止直接修改 seed-scriptures.ts v1 (会破坏幂等基线)
[SCR-F05] 新经论必须有明确categoryId (先查ScriptureCategory表)
[SCR-F06] 部署后必须SSH运行远程种子，否则生产无新数据
[SCR-F07] 每轮完成后必须在memory中更新当前总数
[SCR-F08] 单次补丁≤20部新经论，避免审查困难
[SCR-F09] practiceHint 禁止宗教化说教，保持普世可执行
[SCR-F10] 跨文化相同主题(如"慈悲")建议添加relatedIds关联
```

---

## §9 联动技能

| 上游触发 | 本技能 | 下游联动 |
|---------|--------|---------|
| 项目++ (生成M38.N PRD) | **经论++** | 全审++ (审质量) |
| 全审++ (发现经论内容稀疏) | **经论++** | 页面++ (优化呈现) |
| CEO++ 指令 | **经论++** | 五全++ (前后端一致) |

### 与其他技能的边界
- **经论++**: 只管数据内容扩充 (seed补丁)
- **页面++**: 只管前端呈现优化
- **项目++**: 只管PRD生成
- **全审++**: 只管质量审查

---

## §10 历史版本记录

| 版本 | 日期 | 经论数 | 章节数 | 备注 |
|------|------|--------|--------|------|
| v1 (初版) | 2026-04-09 | 62 | 68 | M38 经论大系统上线 |
| v2 (本轮) | 2026-04-10 | 83 | 195 | M38.2 章节深度补全+21部新经论 |
| v3 | 待定 | 目标100+ | 目标280+ | 道儒耶回印深化 |
| ... | ... | ... | ... | 最终目标188部 |

---

## §11 愿景

> 经论大系统 = 全球企业家圆满修炼的智慧地图
>
> 从禅宗到巴哈伊，从孔孟到鲁米，从米拉日巴到王阳明 —
> 每一部经论都是一盏灯，照亮企业家的愿财双圆之路。
>
> 起大愿，发大财，布施众生。
