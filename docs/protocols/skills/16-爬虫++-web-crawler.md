# 爬虫++ (Web Crawler Engine) v1.2

> **代号**: CW | **版本**: v1.2 | **创建**: 2026-04-13 | **更新**: 2026-04-14 (+CW-YT 挂接详情页)
> **定位**: 24/7 全球旅行数据采集引擎 — 5×6 立体矩阵 × 多适配器 × 自学习质量守门
> **愿景**: 佳绩之旅数据不靠人堆,靠自动化持续采集真实内容喂养 503 圣地 / 12 文化 / 运营全链路
> **触发**: `爬虫++` / `爬虫++ {sourceKey}` / `爬虫++ 新源 {domain}/{channel}` / `爬虫++ 诊断` / `爬虫++ 挂接`

---

## §0 元数据

```yaml
name: web-crawler-engine
code: CW
version: 1.2
triggers:
  - 爬虫++                                # 执行全矩阵日常巡检 + 产出覆盖快照
  - 爬虫++ {sourceKey}                    # 手动跑单源 (如 youtube-rss-feed)
  - 爬虫++ 新源 {domain}/{channel}        # 新增源模板 (HOLY_SITE/WIKI 等)
  - 爬虫++ 诊断                           # 健康巡检 + alerts + 失败率分析
  - 爬虫++ 挂接                           # 重跑 dispatcher, 把 PENDING items 挂到实体
  - 爬虫++ 质量守门                       # 复跑 QG 管道 (sanitize+score+classify)
  - 爬虫++ 投喂                           # 人工 urls.txt / channel-ids.txt 投喂模式
前置条件:
  - 数据库含 CrawlerSource / CrawlerRun / CrawlerItem / CrawlerCoverageSnapshot 表
  - sources.json (scripts/crawler/sources.json) 源登记生效
  - OUTBOUND_PROXY 环境变量设置 (反向 SSH 隧道 → 本机 Clash 127.0.0.1:7890)
  - @Nestjs/schedule CRON 已启用
后置动作:
  - CrawlerItem 入库 + QG 评分 + dispatcher 路由挂接
  - 覆盖快照写入 CrawlerCoverageSnapshot
  - 触发 Web/Admin 下游展示 (详情页视频/评价/配套动态刷新)
联动技能: 目的地++ (DST) / 旅游配套++ (TP) / 项目++ (PJ) / 全审++ (FA) / 天查++ (TC)
核心铁律: CW-01 ~ CW-50 (见§8)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Matrix** (矩阵) | 维护 5 域 × 6 渠道源登记,规划覆盖空洞 | Step 1 |
| **Adapter** (适配) | `canHandle/fetch/extract` 三方法契约,一源一适配器 | Step 2 |
| **Proxy** (代理) | GFW 域名路由 (OUTBOUND_PROXY_DOMAINS),反向 SSH → Clash | Step 3 |
| **QualityGate** (守门) | sanitize → score (6维) → classify (APPROVED/REVIEW/REJECT) | Step 4 |
| **Dispatcher** (派送) | 按 targetDomain + 智能匹配把 CrawlerItem 挂到 HolySite / Religion / Merchant | Step 5 |
| **Feeder** (投喂) | 人工 urls.txt / channel-ids.txt (反爬强的站点绕过批量爬) | 持续 |
| **Cron** (调度) | 按 schedule 字段每日定时触发,失败重试 3 次 | 持续 |
| **Health** (体检) | 日覆盖快照 + 失败率告警 + Redis 缓存刷新 | 持续 |

---

## §2 作用域

| 适用场景 | ✅ / ❌ |
|---------|--------|
| 公开接口/RSS/SPARQL/REST (Wikipedia/Wikidata/YouTube RSS/Commons) | ✅ 主力 |
| 官方媒体页面 (Vatican/NatGeo/Lonely Planet YouTube 等) | ✅ |
| 国内 OTA/UGC (携程/大众点评/小红书/微博) | ⚠️ 仅 HTML + urls.txt 投喂,禁批量爬 |
| 微信公众号 | ⚠️ 仅单篇链接人工投喂,禁批量 (腾讯 ToS) |
| 反爬极强 (Facebook/Instagram/抖音/TikTok) | ❌ 不上,损耗大 |
| 需要登录 / 付费 API 无许可证 (Google Places 未授权) | ❌ |
| 圣地真实图本地化 (tp-images-localize) | ✅ 走 GFW 代理下载到 /static/holy-sites |

**5 域** (targetDomain): HOLY_SITE / MERCHANT / PRICE / GUIDE / NEWS
**6 渠道** (channel): OFFICIAL / WIKI / OTA / MAP / UGC / MEDIA

---

## §3 规则

### 3.1 源登记铁律
- 改源 → 先改 `scripts/crawler/sources.json`,再 `seed-sources.mjs upsert`,禁硬编码 (CW-21)
- 新源必须填 `selector:{}` + `createdBy:'system'` (Prisma 非空约束)
- `schedule` 字段用 5 段 cron,每日不同时间错峰

### 3.2 适配器契约
- 一源一适配器,实现 `CrawlerAdapter { canHandle, fetch, extract }` 三方法
- `canHandle(source)`: 按 `source.key` 或 `(targetDomain, channel, strategy)` 精准路由
- `fetch`: 必须 `fetchText` 走 `http-util.ts` (带 OUTBOUND_PROXY + UA 池 + 超时 15s + 5MB 上限)
- `extract(raw, source)`: 返回 `ExtractedItem[]` `{externalUrl, title, description, imageUrls, raw}`

### 3.3 GFW 绕墙
```ts
// http-util.ts OUTBOUND_PROXY_DOMAINS
const OUTBOUND_PROXY_DOMAINS = [
  'wikipedia.org','wikidata.org','wikimedia.org','mediawiki.org',
  'youtube.com','youtu.be','ytimg.com','googlevideo.com',
  // 新增墙外域名必须加这里,否则 ssrf-req-filter 当本地 IP 拦截
];
```
部署侧: 生产机 `OUTBOUND_PROXY=http://127.0.0.1:7890`,反向 SSH 隧道 `-R 7890:127.0.0.1:7890` 让生产回连本机 Clash。

### 3.4 人工投喂
反爬强的站点用 `scripts/crawler/feeds/{provider}/` 投喂文件:
- `xiaohongshu/urls.txt`, `wechat/urls.txt`: 每行一个文章 URL
- `youtube/channel-ids.txt`: 每行一个 `UC[A-Za-z0-9_-]{22}`,`#` 注释
- 适配器内 `slice(0, 50)` 单批上限

### 3.5 Quality Gate v1.2
每条 CrawlerItem 入库前经过:
1. **sanitize**: 去 HTML 标签 / 可疑脚本 / 控制字符,写 `sanitizedTitle` + `sanitizedContent`
2. **score**: 6 维打分 0-1 (长度/图文比/正文质量/来源权威/黑词过滤/重复度) → `qualityScore`
3. **classify**: ≥0.7 `APPROVED` / 0.4-0.7 `PENDING_REVIEW` / <0.4 `REJECTED` → `qualityLevel`
4. 拒绝原因写 `rejectReasons[]`

### 3.6 Dispatcher 智能匹配 (CW-YT v1.2 新增)
对 `source.parser === 'youtube-rss'` 的 item:
1. **优先级 1** 扫描 sanitizedTitle/title/description 包含任一 HolySite.name 或 nameEn (≥3字符),最长匹配胜出 → `targetType='holySite'`
2. **优先级 2** `raw.channelId → Religion.slug` 兜底映射 (`YT_CHANNEL_TO_RELIGION_SLUG`) → `targetType='religion'`
3. **优先级 3** 均不命中 → 保持 `status='PENDING'`
4. HolySite 列表内存缓存 TTL 60s (503条,省 DB)

### 3.7 单 run 额度
- `crawler.service.ts` 硬上限: 每次 run 最多入库 500 items (早期 50 太紧,被大频道吃满后religion 频道进不去)
- QG 过滤噪音,大值安全

---

## §4 流程 (Full Run)

```
Step 0  读 CLAUDE.md + 本技能 + memory:project_crawler_*
Step 1  sources.json 新/改源 → seed-sources.mjs upsert
Step 2  写/改适配器 (canHandle/fetch/extract) + 注册 adapters/index.ts
Step 3  http-util OUTBOUND_PROXY_DOMAINS 按需加墙外域
Step 4  人工投喂 (若需): feeds/{provider}/*.txt 加行
Step 5  本地单源手跑: node -e "svc.runSource('{id}','manual')"
        检查: itemsFound/itemsCreated/itemsSkipped/QG 评分分布
Step 6  Dispatcher 挂接: status=DISPATCHED/targetType/targetId 是否合理
Step 7  若新增挂接类型 (如 YouTube→religion),加 API 端点 + Web 组件
Step 8  build → deploy-xiaoqing.py PUSH++ 全量 / deploy-crawler-*.py 增量
Step 9  生产: curl /api/crawlers/videos 烟雾测 + 详情页目视检查
Step 10 保存 memory:project_crawler_{name}.md (Why+How to apply)
```

---

## §5 评分 (5⭐ × 6 维)

| 维度 | 描述 | ⭐ 标准 |
|------|------|--------|
| D1 覆盖 | 5×6 矩阵 30 格的活源密度 | ≥24/30 有活源 = 5⭐ |
| D2 质量 | APPROVED 占比 | ≥70% = 5⭐ / 50-70% = 3⭐ / <50% = 1⭐ |
| D3 挂接 | DISPATCHED/PENDING 比 | ≥80% 挂上 = 5⭐ |
| D4 韧性 | CrawlerRun SUCCESS 率(7日) | ≥95% = 5⭐ |
| D5 合规 | robots.txt + ToS + 速率限制 | 0 违规 = 5⭐ |
| D6 落地 | 下游详情页/Admin 可见 | 全端可见 = 5⭐ |

---

## §6 工具

| 工具 | 路径 | 用途 |
|------|------|------|
| sources.json | `scripts/crawler/sources.json` | 源登记中枢 |
| seed-sources.mjs | `services/api/prisma/seed-sources.mjs` | upsert 源到 DB |
| http-util.ts | `services/api/src/modules/crawler/adapters/http-util.ts` | 代理 + UA池 + 超时 |
| adapters/*.ts | 同上目录 | 一源一适配器 |
| crawler.service | `crawler.service.ts` | runSource / listItems / listAttachedVideos |
| dispatcher.service | `dispatcher.service.ts` | 智能匹配路由 |
| qa.service | `qa.service.ts` | Quality Gate v1.2 |
| feeds/ | `scripts/crawler/feeds/{provider}/` | 人工投喂文件 |
| deploy-crawler-*.py | `scripts/` | paramiko 增量部署 + 回填 + 烟雾测 |

---

## §7 生命周期

```
[新需求] → 1. sources.json 注册 → 2. 适配器开发 → 3. 本地手跑 +QG 校准
        → 4. dispatcher 挂接规则 → 5. API + Web 下游 → 6. PUSH++ 部署
        → 7. CRON 自动化 → 8. 覆盖快照 + 告警 → 9. 退役/迁移时 sources.json enabled=false
```

---

## §8 核心铁律 (CW-01 ~ CW-50 摘要)

### 治理
- **CW-01** robots.txt + ToS 合规,禁绕 (小红书/微信/携程只走投喂)
- **CW-21** 改源先改 sources.json 再 seed,禁硬编码
- **CW-27** 反爬强站点只接受人工投喂 (urls.txt/channel-ids.txt),不硬刚
- **CW-31** 价格数据只聚合展示,禁转售给第三方 (Booking ToS)
- **CW-36** UGC 采集必须用户身份脱敏

### 工程
- **CW-33** 图片必须本地化 (/static/holy-sites),禁外链原站,防 hotlink 失效 + 隐私泄漏
- **CW-41** fetch 仅 http/https,禁 file/ftp (SSRF)
- **CW-42** 响应 >5MB 截断,防 OOM
- **CW-43** 同站串行 + rateLimitMs 速率限制
- **CW-47** 入库前 DTO + sanitize,禁裸字段进 DB

### 质量 (v1.2 新增)
- **CW-QG01** 每条 item 必过 sanitize+score+classify 三步
- **CW-QG02** APPROVED 才允许挂到面向用户的详情页
- **CW-QG03** PENDING_REVIEW 进人工审核队列
- **CW-QG04** REJECTED 保留 rejectReasons 供调参

### 绕墙 (GFW)
- **CW-GFW01** 墙外域名必须写入 OUTBOUND_PROXY_DOMAINS,按 hostname 路由 agent
- **CW-GFW02** 生产机不直连墙外,永远走 OUTBOUND_PROXY=Clash 隧道
- **CW-GFW03** 反向 SSH 隧道由开发机 Clash 提供出口,断连即源全红

### 挂接 (CW-YT v1.2 新增)
- **CW-DISP01** YouTube items 优先标题匹配圣地,channel→religion 兜底
- **CW-DISP02** channel-ids.txt 新增频道必须同步 `YT_CHANNEL_TO_RELIGION_SLUG` 加映射
- **CW-DISP03** 单 run 上限 ≥500,防大频道吃满额度后小频道进不去
- **CW-DISP04** 详情页挂接组件 `<CrawlerVideos targetType targetId />` 懒加载 + 空数据隐藏

### 部署
- **CW-DEPLOY01** Prisma upsert 必填 `selector:{}` + `createdBy:'system'`
- **CW-DEPLOY02** 重启 API 用 `fuser -k 3002/tcp + setsid nohup + disown`,stdout 不阻塞
- **CW-DEPLOY03** `NODE_NO_COMPILE_CACHE=1` 必带 (Node v20 compile cache 坏 Prisma enum)
- **CW-DEPLOY04** seed-localize-images 已知卡顿,deploy 时可直接 kill 放行

---

## §9 联动

| 上游触发 | 技能 | 场景 |
|---------|------|------|
| 目的地++ | DST | 补新圣地 → CW 拉 Wiki 介绍 + 图 |
| 旅游配套++ | TP | 配套数据每日爬虫更新 |
| 页面++ | PQM | 详情页加 CrawlerVideos 等组件 |
| 全审++ | FA | 检查爬虫健康 + 质量分布 |
| 天查++ | TC | 拓扑分析源分布盲点 |
| 经论++ | SCR | 抓经论公开本到 seed-scriptures |

| 下游消费 | 去向 |
|---------|------|
| CrawlerItem(status=DISPATCHED, targetType=holySite) | /holy-sites/:id 视频/攻略/配套 |
| CrawlerItem(status=DISPATCHED, targetType=religion) | /religions/:slug 视频/大师开示 |
| CrawlerItem(status=DISPATCHED, targetType=merchant) | 商家模块补全 |
| CrawlerCoverageSnapshot | /about/data-freshness 公开透明度页 |

---

## §10 实战档案 (踩坑编年史)

| 日期 | 事件 | 归因 | 规则落地 |
|------|------|------|---------|
| 2026-04-13 | v1.0 5×6 矩阵落地,21 源首版 | — | CW-01~CW-50 初版 |
| 2026-04-13 | 503 圣地图本地化,GFW 下载残损 100+ | 直连墙外 | CW-GFW01~03 |
| 2026-04-13 | 微信公众号批量爬被 ToS 拦 | 违反腾讯 ToS | CW-27 人工投喂 |
| 2026-04-14 | v1.2 QG 加入 sanitize+score+classify | 抓回噪声入详情页 | CW-QG01~04 |
| 2026-04-14 | YouTube RSS 适配器 (CW-YT) 落地 | Data API 需配额 | 零鉴权 Atom RSS |
| 2026-04-14 | 首轮 50 items 全是 NatGeo,religion 频道被挤出 | 单 run 上限 50 | CW-DISP03 上限改 500 |
| 2026-04-14 | YouTube items 挂不上详情页 | dispatcher 只认 holySite/merchant | CW-DISP01~02 智能匹配 |
| 2026-04-14 | PUSH++ 部署卡 seed-localize-images 16min | 已知网络卡顿 | CW-DEPLOY04 直接 kill |

---

**维护人**: CEO++ / Claude | **最后审查**: 2026-04-14 PUSH++ 交付后
