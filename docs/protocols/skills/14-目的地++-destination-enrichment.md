# 目的地++ (Destination Enrichment) v1.0

> **代号**: DST | **版本**: v1.0 | **创建**: 2026-04-12
> **定位**: 目的地大系统持续充实引擎 — 循环补充真实文化圣地/祖庭/路线，深化落地信息
> **愿景**: 打造全球文化旅行 NO.1 的真实目的地数据库 (对标 Booking/TripAdvisor/Airbnb 详情页深度)
> **触发**: `目的地++` / `目的地++ {type}` / `目的地++ 新增 {slug}` / `目的地++ 深化 {slug}`

---

## §0 元数据

```yaml
name: destination-enrichment
version: 1.0
triggers:
  - 目的地++                          # 自动循环: 选择最弱文化 × 最浅站点补充
  - 目的地++ {traditionSlug}          # 针对文化深度补充 (如: 目的地++ buddhism)
  - 目的地++ {type}                   # holy-site / temple / route / patriarch
  - 目的地++ 新增 {slug}              # 新增单个真实目的地
  - 目的地++ 深化 {slug}              # 对现有目的地补齐落地信息
前置条件:
  - M01/M33 圣地大系统已上线 (HolySite/Temple/Route表存在)
  - 已读 services/api/prisma/schema.prisma 确认字段
  - 至少 2 个权威来源可交叉验证 (官网/维基/Google Maps/联合国教科文/文化部)
后置动作:
  - 生成 seed-destinations-v{N}.ts 补丁文件 (N递增)
  - 本地验证 → git commit → PUSH++ 部署
  - 生产SSH运行v{N}种子 + Redis缓存刷新 (holy-site:* / temple:* / route:*)
联动技能: 项目++ (PRD) / 页面++ (详情页) / 全审++ (质量) / 经论++ (关联经典)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Scout** (侦察) | 从权威来源找到候选真实目的地 | Step 1 |
| **Verifier** (核验) | ≥2个独立来源交叉核验 GPS/名称/存在性/开放状态 | Step 2 |
| **Enricher** (深化) | 补齐落地信息 (时间/费用/交通/预订/禁忌) | Step 3 |
| **Compiler** (编纂) | 按Schema结构化+图片兜底+i18n标题 | Step 4 |
| **Seeder** (播种) | 生成幂等upsert补丁 | Step 5 |
| **Deployer** (部署) | 本地验证→远程部署→缓存刷新 | Step 6 |
| **Auditor** (审核) | 抽样访问详情页验证可落地性 | Step 7 |

---

## §2 作用域

### 2.1 当前覆盖与目标

| 类型 | 当前 | 近期目标 | 终极目标 | 优先补充方向 |
|------|------|---------|---------|------------|
| HolySite (文化圣地) | 300 | 500 | 1000 | 原住民/巴哈伊/神道/锡克偏少 |
| Temple (祖庭) | 27 | 60 | 120 | 道教全真七祖庭/基督主教座堂 |
| Route (精品路线) | 10 | 30 | 80 | 跨国主题路线 (丝绸之路/朝圣之路) |
| Patriarch (祖师) | 28 | 80 | 200 | 每大传统 10+ 关键人物 |

### 2.2 12大文化传统圣地密度目标

| 传统 | Ring | 当前圣地 | 目标 | 重点补充 |
|------|------|---------|------|---------|
| 佛教 buddhism | 1 | 35 | 60 | 四大名山/八大宗祖庭/南传寺院 |
| 道教 taoism | 1 | 30 | 50 | 洞天福地36+72/全真/正一 |
| 儒家 confucianism | 2 | 25 | 40 | 孔庙/书院/贤人故里 |
| 基督文化 christianity | 2 | 30 | 50 | 圣彼得/圣保罗/加尔文宗/东正教 |
| 伊斯兰文化 islam | 2 | 25 | 40 | 麦加麦地那/耶路撒冷/苏菲派 |
| 印度文化 hinduism | 2 | 25 | 40 | 七圣城/四大寺/吠陀遗址 |
| 犹太文化 judaism | 3 | 20 | 30 | 哭墙/马萨达/欧洲犹太社区 |
| 锡克文化 sikhism | 3 | 15 | 25 | 五塔克特/旁遮普10古鲁遗址 |
| 神道文化 shinto | 3 | 18 | 30 | 伊势/出云/熊野三山 |
| 藏传文化 tibetan-buddhism | 3 | 20 | 35 | 三大寺/四大教派祖庭 |
| 原住民 indigenous | 4 | 30 | 50 | 美洲/澳洲/非洲/北极 |
| 巴哈伊 bahai | 4 | 27 | 40 | 海法/阿卡/九国灵曦堂 |
| **合计** | - | **300** | **500** | 循环推进至终极目标 |

### 2.3 单目的地深度质量标准

| 级别 | GPS | 落地信息 | 图片 | 多语言 | 经文关联 |
|------|-----|---------|------|--------|---------|
| ⭐⭐⭐⭐⭐ (核心) | 精确 | 全套(7项+) | 原创≥5张 | 7语言 | ≥2部经论 |
| ⭐⭐⭐⭐ (重要) | 精确 | 核心(5项) | 原创≥3张 | 中英日 | ≥1部经论 |
| ⭐⭐⭐ (一般) | 精确 | 核心(3项) | 版权图≥2张 | 中英 | 可选 |
| ⭐⭐ (入门) | 精确 | 基础(1-2项) | 池图+hash | 中 | 可选 |
| ⭐ (索引) | 精确 | 仅描述 | 池图+hash | 中 | 可选 |

**落地信息7项清单**:
1. 开放时间 (openingHours, 含节假日差异)
2. 门票费用 (entryFee, 含外国游客差异)
3. 到达交通 (accessTransport, 公共交通+自驾)
4. 最佳季节 (bestSeason + 避开时段)
5. 着装/礼仪禁忌 (etiquette, 宗教场所必填)
6. 官方网站/预订链接 (officialUrl)
7. 周边住宿推荐 (nearbyStay, ≥3个不同价位)

---

## §3 领域规则

### 3.1 真实性绝对铁律 ⚠️

```
[DST-01] 所有目的地必须真实存在于现实世界，严禁AI编造任何地名
[DST-02] GPS坐标必须精确至小数点后4位，且能在Google/高德/OSM至少其一找到
[DST-03] 名称必须采用当地官方名/通用译名，禁止生造中文名
[DST-04] 描述不得包含未核实的历史传说 (标注"传说"或"据记载")
[DST-05] 每个目的地必须记录 sourceUrls: string[] (≥2个权威来源)
[DST-06] 已关闭/毁坏/不可访问的遗址必须标注 accessStatus: RUINED | CLOSED | ACTIVE
[DST-07] 涉及政治敏感区域 (如圣城) 必须采用中性表述
```

### 3.2 可落地性铁律

```
[DST-10] 详情页不可出现"待补充"/"暂无"/"敬请期待"/空字段占位
[DST-11] 开放时间必须给出具体时段 (如 "08:00-17:00 周一闭馆") 或明确标注 "全天开放"
[DST-12] 门票必须给出金额+币种+免票条件，免费场所明确写"免费参观"
[DST-13] 交通方式必须至少覆盖 公共交通(地铁/公交/火车) + 自驾 两种
[DST-14] 宗教场所必须写明 着装/拍照/性别/食物 四项禁忌，不适用则写"无特殊要求"
[DST-15] 详情页必须有地图链接 (Google Maps + 高德/百度地图)
[DST-16] 国际目的地必须标注 UTC时区偏移 + 签证要求提示
```

### 3.3 Schema对齐铁律

```
[DST-20] HolySite核心字段: slug/nameZh/nameEn/religionId/country/region/
         latitude/longitude/utcOffset/description/scriptureRef/
         openingHours/entryFee/accessTransport/etiquette/officialUrl/
         images[]/tags[]/accessStatus/sourceUrls[]
[DST-21] slug规则: kebab-case + 国家前缀 (如 cn-wutai-shan / jp-ise-jingu)
[DST-22] 国际目的地 nameZh 使用通行译名 + 括号标注当地名
[DST-23] 图片兜底遵循 [DATA-01]: 同文化分组 + 名称哈希确定性选取
[DST-24] 新增字段需先评估是否影响现有 holy-site-data.ts 结构
```

### 3.4 幂等与可重跑

```
[DST-30] 使用upsert模式: slug 作为unique key
[DST-31] 补丁文件命名: seed-destinations-v{N}.ts (N从2开始递增)
[DST-32] 每个补丁文件独立可运行，不依赖前序版本顺序
[DST-33] upsert后必须刷新Redis: holy-site:* / temple:* / route:* / religion:*
[DST-34] 关联字段 (religionId/patriarchId) 必须先查后写，缺失则跳过并告警
```

### 3.5 竞品对标基线 (详情页必备元素)

```
[DST-40] 参考 Booking.com: 大图轮播 + 5维评分 + 附近配套 + 价格日历
[DST-41] 参考 TripAdvisor: UGC评价 + 排行榜 + 问答 + 照片墙
[DST-42] 参考 Airbnb: 沉浸式图文 + 主理人故事 + 体验产品
[DST-43] 参考 Google Maps: 精确坐标 + 街景链接 + 实时开放状态
[DST-44] 我方差异化: 经文引用 + 祖师故事 + 生命命题视角 (对接M40)
```

---

## §4 标准执行流程

### Step 1: 现状诊断 (Scout)
```sql
-- 诊断最弱传统的最浅站点
SELECT r.slug, COUNT(h.id) as sites,
       AVG(LENGTH(h.description)) as avg_desc,
       SUM(CASE WHEN h.openingHours IS NULL THEN 1 ELSE 0 END) as missing_hours
FROM "HolySite" h JOIN "Religion" r ON h.religionId=r.id
GROUP BY r.slug ORDER BY sites ASC, avg_desc ASC;
```
- 识别"数量洼地" (sites < target)
- 识别"深度洼地" (avg_desc < 200 或 missing_hours > 0)
- 输出"待补充/待深化优先队列"

### Step 2: 真实性核验 (Verifier)
逐一候选目的地交叉核验：
1. Google Maps / OpenStreetMap 搜索 → 确认存在 + 抓取精确GPS
2. 官方网站 / 维基百科 → 确认开放状态 + 基础信息
3. 联合国教科文世界遗产/ICOMOS → 确认文化价值分级
4. Google Places API (可选) → 拉取评分/照片作为参考
5. 记录 `sourceUrls: string[]` (≥2个)
6. **任何无法通过≥2来源核验的候选，立即丢弃** [DST-F01]

### Step 3: 落地信息采集 (Enricher)
- 访问官网抓取: 开放时间/门票/联系方式
- 旅游攻略站点交叉: Lonely Planet / 马蜂窝 / 穷游
- 宗教场所额外: 礼仪禁忌 (参考官方导览手册)
- 所有信息标注采集日期 (lastVerifiedAt)

### Step 4: 编纂 (Compiler)
- 填充 nameZh (通行译名) + nameEn (当地官方名)
- description 200-500字，含历史+现状+文化价值
- scriptureRef 关联经论 (查 Scripture 表 slug)
- 图片: 原创 > 版权图 > 池图哈希兜底 [DATA-01]
- tags: 文化类型 + 地理 + 建筑风格 + 主题

### Step 5: 文件生成 (Seeder)
- 读取最新补丁号: `ls services/api/prisma/seed-destinations-v*.ts`
- 生成 `seed-destinations-v{N+1}.ts`:
  ```typescript
  const NEW_SITES: NewHolySiteDef[] = [ ... ];
  const DEEPEN_SITES: DeepenPatch[] = [ ... ]; // 仅补字段不改身份
  // upsert循环 + 关联刷新
  ```

### Step 6: 本地验证 (Seeder)
```bash
cd services/api && npx tsx prisma/seed-destinations-v{N}.ts
# 预期: ✓ 新增 X 个 / 深化 Y 个 / 跳过 Z 个(已存在且无差异)
```

### Step 7: 部署 (Deployer)
```bash
git add services/api/prisma/seed-destinations-v{N}.ts
git commit -m "feat(data): M01.{N} 目的地充实 — 新增X个深化Y个"
git push
python scripts/deploy-xiaoqing.py
# 脚本内已自动 SSH 运行 v{N} + flush Redis
```

### Step 8: 审计验证 (Auditor)
- 抽查3个新目的地: `/culture-sites/{slug}` 详情页
- 验证7项落地信息全部非空
- 验证地图坐标可打开 Google Maps
- 验证图片能加载 (无404)
- 记录本轮增量并更新 memory

---

## §5 评分体系 (6维 × 5⭐)

| 维度 | 5⭐ | 4⭐ | 3⭐ | 2⭐ | 1⭐ |
|------|----|----|----|----|----|
| **真实性** | ≥3源核验+GPS精确 | 2源核验 | 1源+GPS | 仅名称 | 有编造嫌疑 |
| **完整性** | 落地7项全 | 5项 | 3项 | 1-2项 | 0项 |
| **可落地性** | 含预订+价格+交通 | 含交通+时间 | 仅地址 | 描述模糊 | 无法执行 |
| **国际化** | 7语言全 | 中英日韩 | 中英 | 仅中 | 翻译错误 |
| **多媒体** | 原创≥5张+视频 | 原创≥3张 | 版权≥2张 | 池图 | 无图 |
| **转化力** | 含CTA+推荐路线 | 关联路线 | 关联经文 | 仅展示 | 断联 |

**前缀**: DST-01~DST-N
**目标**: ≥4.0 PASS / 3.0-3.9 PARTIAL / <3.0 FAIL (<3.0 的目的地必须下架或深化)

---

## §6 工具与文件

### 关键文件
- `services/api/prisma/schema.prisma` — HolySite/Temple/Route模型
- `services/api/prisma/data/holy-sites-data.ts` — 初版300站点 (~2500行)
- `services/api/prisma/seed-destinations-v{N}.ts` — 本技能持续产出的增量补丁
- `services/api/src/modules/holy-site/holy-site.service.ts` — 后端服务
- `apps/web/src/app/culture-sites/[slug]/page.tsx` — 详情页
- `docs/protocols/09-竞品分析规范.md` — 详情页对标模板

### 命令速查
```bash
# 本地种子
cd services/api && npx tsx prisma/seed-destinations-v{N}.ts

# 诊断
npx tsx -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{console.log('sites:',await p.holySite.count(),'temples:',await p.temple.count())})()"

# 地图验证 (开发工具)
open "https://www.google.com/maps/@${lat},${lng},15z"

# 部署 + Redis刷新
python scripts/deploy-xiaoqing.py
```

---

## §7 生命周期

### 触发模式

**模式A: 自动循环 (目的地++)**
```
1. Step 1 诊断 → 选出最弱传统 × 最浅站点
2. 默认每轮: 新增5-10个 + 深化10-20个
3. Step 2-8 完整执行
4. 报告增量+距目标差距
```

**模式B: 定向补充 (目的地++ {tradition})**
```
1. 仅针对该传统诊断
2. 补齐数量+深化质量至目标
3. 报告该传统前后对比
```

**模式C: 类型专项 (目的地++ temple | route | patriarch)**
```
1. 针对类型诊断
2. 补齐该类型至近期目标
```

**模式D: 单点深化 (目的地++ 深化 {slug})**
```
1. 读取现有数据
2. 核查缺失字段
3. 补齐落地7项
```

### 迭代节奏
- 每轮补丁增量: 5-15个新目的地 + 10-30个深化
- 版本号递增: v2 → v3 → v4 ...
- 近期目标 (500 sites) 达成后转"精修模式": 全量深化至⭐⭐⭐⭐及以上

---

## §8 铁律 (DST-F01~DST-F12)

```
[DST-F01] 真实性零妥协 — 无法通过≥2来源核验的目的地一律不入库 [SCP保护]
[DST-F02] 禁止编造GPS坐标 — 坐标必须能在Google/高德/OSM至少其一找到
[DST-F03] 禁止编造开放时间/门票 — 未核实字段必须置 null 并在UI降级
[DST-F04] 详情页不得出现"待补充/敬请期待/暂无" — 无数据则整卡隐藏
[DST-F05] 每个补丁文件必须先本地验证通过才能commit
[DST-F06] 禁止修改 schema.prisma (仅追加数据，结构变更走 项目++ 流程)
[DST-F07] 禁止直接修改 holy-sites-data.ts v1 (会破坏幂等基线)
[DST-F08] 新目的地必须有明确 religionId (先查 Religion 表)
[DST-F09] 部署后必须SSH运行远程种子 + flush Redis，否则生产无新数据
[DST-F10] 每轮完成后必须在 memory 中更新总数 (sites/temples/routes)
[DST-F11] 单次补丁 ≤ 20 个新目的地，避免审查困难
[DST-F12] 图片必须标注来源 (origin/cc-by/pool-hash)，不得无授权使用商业图
```

---

## §9 联动技能

| 上游触发 | 本技能 | 下游联动 |
|---------|--------|---------|
| 项目++ (生成M01.N PRD) | **目的地++** | 全审++ (质量审查) |
| 页面++ (详情页发现数据稀疏) | **目的地++** | 页面++ (补数据后回升) |
| 经论++ (新增经论缺关联圣地) | **目的地++** | 五全++ (五端一致) |
| 全审++ 发现盲区 | **目的地++** | 飞轮++ (验证闭环) |
| CEO++ 指令 | **目的地++** | 自动测试++ (回归验证) |

### 与其他技能的边界
- **目的地++**: 只管真实目的地数据扩充与深化 (seed补丁)
- **页面++**: 只管详情页前端呈现升级
- **项目++**: 只管PRD生成与结构变更
- **全审++**: 只管质量审查
- **经论++**: 只管经论扩充 (与本技能通过 scriptureRef 互相关联)

---

## §10 历史版本记录

| 版本 | 日期 | HolySites | Temples | Routes | 备注 |
|------|------|-----------|---------|--------|------|
| v1 (初版) | 2026-03 | 300 | 27 | 10 | M33 圣地300扩充 |
| v2 | 待定 | 目标330+ | 目标40+ | 目标15+ | 第一轮增量补丁 |
| ... | ... | ... | ... | ... | 近期目标: 500/60/30 |

---

## §11 愿景

> 目的地大系统 = 全球文化旅行者可以真正抵达的 1000 个文化现场
>
> 从五台山到伊势神宫，从圣墓大教堂到拉萨大昭寺，从麦加到耶路撒冷 —
> 每一个目的地都必须是真实的、可落地的、可走到的。
>
> **不瞎编一个地名，不漏写一个开放时间，不误导一个朝圣者。**
>
> 起大愿，发大财，布施众生 — 用真实的文化现场，连接人类文明的每一次呼吸。
