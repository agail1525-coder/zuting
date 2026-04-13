# 爬虫++ 脚本工作区

佳绩之旅 24/7 全球旅行数据采集引擎的源配置与投喂工具。

## 目录结构

```
scripts/crawler/
├── sources.json           # 5×6 矩阵源登记表 (CW-21 唯一真源)
├── seed-sources.mjs       # (已废弃) 改用 services/api/prisma/seed-crawler-sources.ts
│                          # 跑法: cd services/api && npx tsx prisma/seed-crawler-sources.ts
├── feeds/                 # urls.txt 投喂模式 (CW-27)
│   ├── xiaohongshu/
│   │   └── _urls.txt      # 人工收集的小红书链接,每行一个
│   └── wechat/
│       └── <account>/_urls.txt
└── README.md
```

## 使用流程

### 1. 登记新源
改 `sources.json` → `node scripts/crawler/seed-sources.mjs` upsert DB。禁止跳过 sources.json 直接改 DB (违反 CW-21)。

### 2. 手动触发
```bash
# 单源测试
curl -X POST http://localhost:3002/api/crawlers/sources/{id}/run \
  -H "Authorization: Bearer {admin-token}"

# 全矩阵
curl -X POST http://localhost:3002/api/crawlers/matrix/run \
  -H "Authorization: Bearer {admin-token}"
```

### 3. 健康扫描
```bash
curl http://localhost:3002/api/crawlers/health \
  -H "Authorization: Bearer {admin-token}"
```

### 4. 覆盖报告
每周自动生成 `_COVERAGE.md`,也可手动:
```bash
curl -X POST http://localhost:3002/api/crawlers/coverage/generate \
  -H "Authorization: Bearer {admin-token}"
```

## CRON 自动化

NestJS ScheduleModule 自动按源 `schedule` 字段跑 (cron expression)。
默认 04:00 生成 CoverageSnapshot (CW-46)。

## 铁律速查

完整清单见 `.claude/skills/crawler-plus-plus/SKILL.md` 第 4 节。

- **CW-21** 禁硬编码源,统一走 sources.json
- **CW-33** 图片必须本地化,禁 `<img 外链>`
- **CW-36** UGC 用户信息 hash 脱敏
- **CW-39** 新源 PRD 先行
- **CW-43** 同 baseUrl 串行 concurrency=1
- **CW-44** 去重 sha256(sourceId+url+titleNorm)
- **CW-45** 失败指数退避 5m/30m/6h,3 次停用
