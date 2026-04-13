---
name: crawler-plus-plus
description: >
  爬虫++ v1.0 — 佳绩之旅 24/7 自学习自适应全球旅行数据采集引擎。
  为 503 圣地 + 2538 商家 + 10129 服务 + 84 攻略 + 动态价格持续供粮。
  5×6 立体矩阵(圣地/商家/价格/攻略/动态 × 官方/百科/OTA/地图/UGC/自媒体)。
  触发: `爬虫++` / `/crawler++` / `crawler++`
  子命令: --scan(健康扫描) / --matrix(跑完整矩阵) / --domain(按域) / --channel(按纵) / --add(添加源) / --test(测试单源) / --coverage(覆盖报告) / --full(全量优化)
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Agent
---

# 爬虫++ (Crawler++) v1.0 — 佳绩之旅

## 0. 元数据

| 属性 | 值 |
|------|-----|
| **版本** | v1.0 (2026-04-14) |
| **定位** | 24/7 自学习自适应全球旅行数据采集引擎 |
| **触发** | `爬虫++` / `/crawler++` / `crawler++` |
| **哲学** | 自学习 > 自适应 > 自愈 > 自发布 > 经验沉淀 |
| **源** | 移植自佛山升学爬虫++ v1.1,改造为 5×6 旅行矩阵 |
| **PLAN** | `E:\ZUTING-APP\PLAN\2026-04-14-crawler-plus-plus-v1.md` |
| **代码** | `services/api/src/modules/crawler/` + `scripts/crawler/` |
| **矩阵** | `scripts/crawler/sources.json` (30 格, 12 首发启用) |
| **联动** | TP++(MERCHANT) / 目的地++(HOLY_SITE) / 全审++(L7) / AI++(LLM兜底) / 经论++(P2) |

## 1. 4 层自进化

```
L1 自学习 — CrawlerSource.healthScore + consecutiveFails 自动调整策略
L2 自适应 — HTTP (got-scraping) ↔ Browser (Playwright, P1) 自动切换
L3 自愈   — 选择器失效检测 → LLM (Qwen) 重定位 → 人工告警 (P1/P2)
L4 自发布 — Adapter 提取 → Dispatcher 路由 → HolySite/Merchant/Guide upsert
```

## 2. 5×6 立体矩阵

|  | 官方 OFFICIAL | 百科 WIKI | OTA | 地图 MAP | UGC | 自媒体 MEDIA |
|---|---|---|---|---|---|---|
| **HOLY_SITE** | 文旅局/景区官网 | Wikipedia/Wikidata P18/百度百科 | — | Google Places/高德/百度POI | — | 抖音/YouTube tag |
| **MERCHANT** | — | — | Booking/Agoda/携程/美团/大众点评 | Google/高德 POI | TripAdvisor | — |
| **PRICE** | — | — | Skyscanner/Kayak/飞猪/Trip.com | — | — | — |
| **GUIDE** | — | — | — | — | 小红书/马蜂窝/穷游/知乎 | 微博话题 |
| **NEWS** | 景区公告 | — | OTA价格浪潮 | — | — | 微博/微信 |

**首发 T1 启用** (priority≥4): Wikipedia REST + Wikidata SPARQL + 少量景区官网公告。
**T2/T3** 留配置位,等代理池/OTA合作/账号就绪接入。

## 3. 子命令

| 命令 | 说明 |
|------|------|
| `爬虫++ --scan` | 健康扫描: 列所有启用源成功率/耗时/最后成功/状态 |
| `爬虫++ --matrix` | 跑完整 5×6 矩阵 (按 priority 降序) |
| `爬虫++ --domain <HOLY_SITE\|MERCHANT\|PRICE\|GUIDE\|NEWS>` | 按横层跑 |
| `爬虫++ --channel <OFFICIAL\|WIKI\|OTA\|MAP\|UGC\|MEDIA>` | 按纵层跑 |
| `爬虫++ --add <name> <url> <domain> <channel>` | 添加新源,登记 sources.json + upsert DB |
| `爬虫++ --test <id\|name>` | 测单源,不写 DB,输出预览 |
| `爬虫++ --coverage` | 生成 `_COVERAGE.md` 30 格健康矩阵 |
| `爬虫++ --full` | scan + matrix + coverage 全量 |

## 4. 铁律 CW-01 ~ CW-50

> CW-01~CW-30 继承自源项目 (佛山升学) — 见 PLAN 完整列表。新增 CW-31~CW-50 针对旅行域。

### 安全与合规 (CW-01~CW-05, CW-31~CW-38, CW-41~CW-47)
```
[CW-01] 必须遵守 robots.txt,OTA 尤其严格
[CW-02] 同站频率 ≤2 req/sec,官方 ≤1 req/sec
[CW-03] 公开数据聚合用途,禁商业转售
[CW-04] 日志脱敏,错误截断 200 字,禁记完整 HTML/URL
[CW-05] 所有 HTTP 请求 AbortSignal.timeout ≤15s
[CW-31] OTA价格爬取尊重 robots + Crawl-delay,禁商业转售
[CW-32] GFW 外源走代理或服务侧,超时 ≤30s
[CW-33] 图片本地化(沿用 TP-18),禁 <img 外链>
[CW-34] 多语源原文+翻译分离
[CW-35] GPS 双源交叉验证,偏差 >500m 告警
[CW-36] UGC 采集仅公开,昵称 hash 脱敏
[CW-37] 价格带 timestamp + TTL 24h
[CW-38] 寺院话术净化(沿用 TP-12)
[CW-41] 走 ssrf-req-filter,禁内网/169.254
[CW-42] 响应体 ≤5MB + charset 检测
[CW-43] 同 baseUrl 串行 concurrency=1
[CW-44] 去重键 sha256(sourceId+url+titleNorm),14 天保留
[CW-45] 失败重试指数退避 5m/30m/6h,3 次停用
[CW-46] 每日 04:00 CoverageSnapshot
[CW-47] Dispatcher 入库 DTO 校验 + XSS sanitize
```

### 架构 (CW-21~CW-30, CW-39~CW-40, CW-48~CW-50)
```
[CW-21] 所有源登记到 scripts/crawler/sources.json,禁硬编码
[CW-39] 新源 PRD 先行(SCP-03),登记 sources.json
[CW-40] 每周生成 _COVERAGE.md
[CW-48] Adapter 必须实现 canHandle(source) + extract(raw): CrawlerItem[]
[CW-49] LLM 兜底仅在 CSS+XPath 双失败启用
[CW-50] enabled=false CRON 跳,但 runSource(id) 可强制(带审计)
```

## 5. 技术栈路线

### V1.0 (本次)
- HTTP: Node 原生 http/https + ssrf-req-filter (已有)
- 解析: Cheerio (已有)
- Adapter 模式: Wiki/Official/Map/OTA/UGC 5 类
- Dispatcher: 按 targetDomain 路由 upsert
- 多级 CRON: 6h / 24h / 周

### V1.5 (P1, 留接口)
- `got-scraping` 替 fetch (TLS 指纹)
- `iconv-lite` 处理 GB2312
- Playwright 降级 (script 独立服务)

### V2.0 (P2)
- Crawlee AdaptiveCrawler
- Qwen LLM 兜底提取 (schema 驱动)
- 代理池 (BrightData CN / 快代理)

## 6. 执行流程

### --scan
```
读 CrawlerSource (enabled=true)
→ 近 7 天 CrawlerRun 聚合 successRate/avgMs/lastSuccess
→ 输出 Markdown 表 + DEAD/WARNING 列表
```

### --matrix
```
按 priority DESC 遍历所有启用源
→ 每源 runSource() 顺序(concurrency=1 per baseUrl)
→ rateLimitMs 间隔
→ 失败计入 consecutiveFails,连 5 停用
→ 结束后 --coverage
```

### --add
```
1. 验 URL 可达
2. 检 HTML 结构 → 选 parser
3. 试爬不写 DB
4. 确认后 upsert sources.json + CrawlerSource
```

## 7. 经验沉淀

每次 `--upgrade` 或大修 → `E:\ZUTING-APP\经验沉淀\CW-{序号}-{描述}.md`

## 8. 联动

| 系统 | 联动 |
|---|---|
| TP++ | MERCHANT 域复用,DestinationPackage.crawlerSourceId |
| 目的地++ | HOLY_SITE 域 Wiki/Map 供新站点发现 |
| 全审++ | L7 数据采集检查 |
| AI++ | LLM 兜底走小鸿 Qwen 网关 |
| Admin | /crawler 页扩展 |

## 9. 验证清单

| # | 检查 | 命令 |
|---|---|---|
| 1 | 源健康 | `爬虫++ --scan` |
| 2 | CRON 跑 | `docker logs --since 6h \| grep crawler` |
| 3 | 0 tsc | `pnpm -F @zuting/api typecheck` |
| 4 | Wiki 源跑通 | `POST /crawlers/sources/:id/run` |
| 5 | 覆盖报告 | `_COVERAGE.md` 存在 |
| 6 | 30 格登记 | `jq '.sources\|length' sources.json` ≥ 12 |

## 10. 与源项目差异 (vs 佛山升学爬虫++)

| 项 | 源项目 | 佳绩之旅 |
|---|---|---|
| 矩阵 | 3×3 (小升初/中考/高考 × GOV/SCHOOL/WX) | 5×6 (圣地/商家/价格/攻略/动态 × 官方/百科/OTA/地图/UGC/自媒体) |
| 语言 | 中文政策 | 7 语言(EN/ZH/JA/KO/TH/HI/AR) |
| GFW | 境内源为主 | 境内+境外(Wiki/Google/Booking) |
| 落盘 | E:\作业郎\佛山升学\ | DB (CrawlerItem) 为主,图片 /static/ |
| 铁律 | CW-01~CW-30 | +CW-31~CW-50 旅行域扩展 |
| 图片 | 附件 PDF | 景区图/商家图,TP-18 本地化 |
| AI | Qwen3.5-122B LLM 提取 | 小鸿 Qwen3.5-35B 兜底 |
