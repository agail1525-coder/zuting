# 07 — Git 与部署规范 (Git & Deployment Protocol)

> JOINUS.COM — 全球祖庭文化旅行平台
> 版本: v1.0 | 生效日期: 2026-03-29 | 状态: 生效中

---

## 目录

1. [分支策略](#1-分支策略)
2. [Commit 规范](#2-commit-规范)
3. [备份铁律](#3-备份铁律)
4. [环境变量管理](#4-环境变量管理)
5. [服务器部署信息](#5-服务器部署信息)
6. [部署流程](#6-部署流程)
7. [Docker 管理规范](#7-docker-管理规范)
8. [Nginx 配置规范](#8-nginx-配置规范)
9. [回滚策略](#9-回滚策略)
10. [禁止项与安全规则](#10-禁止项与安全规则)

---

## 1. 分支策略

### 1.1 分支模型

JOINUS.COM 采用**简化 GitFlow** 模型，符合小团队高效迭代原则：

```
master              ← 主分支（生产就绪，随时可部署）
├── feature/*       ← 功能开发分支
├── fix/*           ← BUG 修复分支
├── refactor/*      ← 重构分支
└── chore/*         ← 基础设施/配置变更分支
```

### 1.2 分支命名规范

```bash
# 功能分支: feature/{scope}-{简短描述}
feature/web-search-system
feature/mobile-review-ui
feature/api-wishlist-module

# BUG 修复: fix/{scope}-{问题描述}
fix/api-trip-state-machine
fix/mobile-homepage-field-mismatch
fix/web-map-leaflet-ssr

# 重构分支: refactor/{scope}-{描述}
refactor/mobile-remove-any-types

# 基础设施: chore/{描述}
chore/update-dependencies
chore/docker-compose-postgres-upgrade
```

### 1.3 分支生命周期

| 阶段 | 操作 |
|------|------|
| 创建 | 从最新 `master` 切出 |
| 开发 | 小步提交，每完成一个原子功能即 commit（遵循 B-01）|
| 合并 | 通过 PR（或 CEO++ 直接 merge），合并后立即删除远端分支 |
| 清理 | `git branch -d feature/xxx`（本地）+ `git push origin --delete feature/xxx`（远端）|

---

## 2. Commit 规范

### 2.1 Commit Message 格式

```
<type>(<scope>): <subject>

[可选 body]

[可选 footer]
```

### 2.2 Type 定义

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(web): 添加圣地收藏夹系统` |
| `fix` | BUG 修复 | `fix(api): 修复行程状态机终态跳转漏洞` |
| `refactor` | 重构（不改变功能） | `refactor(mobile): 消灭全部 useState<any>` |
| `style` | 样式调整（不改变逻辑） | `style(web): 统一首页金色点缀色值` |
| `docs` | 文档更新 | `docs(protocols): 新增国际化规范 v1.0` |
| `test` | 测试代码 | `test(api): 补充 TripStateMachine 单测` |
| `chore` | 构建/工具/依赖 | `chore: 升级 Prisma 到 6.x` |
| `perf` | 性能优化 | `perf(web): 首页图片懒加载优化` |

### 2.3 Scope 定义

| Scope | 对应端 |
|-------|-------|
| `api` | NestJS 后端服务 |
| `web` | Next.js 官网 |
| `admin` | Vite 管理后台 |
| `mobile` | Expo React Native |
| `miniprogram` | Taro 微信小程序 |
| `shared` | packages/ 下的共享包 |
| `deploy` | 部署/Docker/Nginx/CI 相关 |
| `desktop` | Python 桌面助手 |

### 2.4 Subject 写法规则

- **使用中文**（项目主要协作语言）
- **动词开头**：添加 / 修复 / 删除 / 更新 / 重构 / 升级
- **不超过 50 字**
- **不以句号结尾**
- **描述做了什么，而非为什么**（为什么放 body）

### 2.5 合格 Commit 示例

```bash
# ✅ 标准格式
git commit -m "feat(web): 添加圣地详情页评价系统 — UGC评分+照片上传"
git commit -m "fix(mobile): 修复首页 runtime 字段名不匹配 (name vs nameZh)"
git commit -m "refactor(mobile+miniprogram): 消灭全部 useState<any> — 类型安全清零"
git commit -m "chore(deploy): 更新 Nginx 配置添加 gzip 压缩"
git commit -m "docs(protocols): 新增 06-国际化规范 v1.0"

# ❌ 不合格示例
git commit -m "update"                      # 无 type/scope，描述过于模糊
git commit -m "feat: 修复了一些 bug"         # type 与内容矛盾
git commit -m "Fixed the issue"             # 非中文
git commit -m "WIP"                         # 禁止 WIP commit 进主分支
```

### 2.6 多端同时修改的 Commit

当一次功能涉及多个端时，scope 用 `+` 连接：

```bash
git commit -m "feat(mobile+miniprogram): Wave 2 评价系统+订单通知升级"
git commit -m "fix(api+web): 修复圣地分页接口与前端 pageSize 不一致"
```

---

## 3. 备份铁律

遵循 CLAUDE.md 中的 [B-01] ~ [B-07] 铁律：

### [B-01] 即时提交原则

```
完成一个完整功能单元后，必须立即执行 git add + git commit。
禁止积累未提交代码超过 4 小时（半个工作日）。
```

判断"完整功能单元"的标准：
- 一个 API 端点完整实现（Controller + Service + DTO + 测试）
- 一个页面完整实现（UI + API 调用 + loading/error/empty 三态）
- 一个 PRD 文档完成

### [B-02] 单次 Commit 文件数限制

```
单次 commit ≤ 30 个文件。
超过 30 个文件必须拆分成多个语义清晰的 commit。
```

拆分原则：
- 按端拆分（Web 改动一个 commit，API 改动一个 commit）
- 按功能模块拆分（搜索模块一个 commit，评价模块一个 commit）
- 按 type 拆分（先 refactor commit，再 feat commit）

### [B-03] 禁止跳过 Pre-commit Hook

```
严禁使用 --no-verify 绕过 pre-commit hook。
hook 失败 = 代码有问题，必须修复后重新提交。
```

### [B-07] 禁止积累临时文件

```
会话结束/功能完成后，必须清理以下临时文件：
- 根目录的 *.log 文件
- 测试时生成的 .tmp / .bak 文件
- 调试时产生的 console.log 输出（提交前清理）
- 无用的注释掉的代码块
```

---

## 4. 环境变量管理

### 4.1 文件规则

| 文件名 | 用途 | 是否进 Git |
|--------|------|-----------|
| `.env.example` | 变量名模板（无真实值） | 是 |
| `.env.development` | 本地开发环境 | **否** |
| `.env.production` | 生产环境 | **否** |
| `.env.test` | 测试环境 | **否** |
| `.env` | 通用本地变量 | **否** |

所有 `.env*` 文件（除 `.env.example`）已在 `.gitignore` 中配置，**永远不得提交到 Git**（对应 [HH-S01]）。

### 4.2 必需环境变量

```bash
# .env.example — 必须与此模板保持同步

# 数据库
DATABASE_URL="postgresql://user:password@localhost:5435/zuting"
REDIS_URL="redis://localhost:6380"

# JWT
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="7d"

# AI (小鸿)
XIAOHONG_API_URL="http://your-vllm-endpoint/v1"
XIAOHONG_API_KEY="your-api-key"
XIAOHONG_MODEL="Qwen3.5-35B"
XIAOHONG_TIMEOUT_MS=180000

# 应用
NODE_ENV="development"
PORT=3002
CORS_ORIGINS="http://localhost:3000,http://localhost:3003"
```

### 4.3 新增环境变量流程

1. 在 `.env.example` 中添加占位符（有注释说明）
2. 在本地 `.env.development` 中填写真实值
3. 通知团队成员更新本地配置
4. 生产服务器上手动配置（SSH 登录后 `nano /opt/zuting/.env.production`）
5. 在 PRD/文档中记录该变量的用途

---

## 5. 服务器部署信息

### 5.1 服务器基本信息

| 项目 | 值 |
|------|----|
| 服务器 IP | 120.24.31.151 |
| 操作系统 | Linux (Ubuntu) |
| 部署用户 | root |
| 部署目录 | /opt/zuting |
| SSH 端口 | 22 (标准) |

### 5.2 服务端口映射

| 服务 | 容器内端口 | 宿主机端口 | 说明 |
|------|----------|----------|------|
| PostgreSQL | 5432 | **5435** | 避免与宿主机 PG 冲突 |
| Redis | 6379 | **6380** | 避免与宿主机 Redis 冲突 |
| NestJS API | 3002 | 3002 | 直接暴露，Nginx 反代 |
| Next.js Web | 3000 | 3000 | Nginx 反代 |
| Admin (Vite) | 3003 | 3003 | Nginx 反代 |
| Expo Dev | 8081 | 8081 | 仅开发环境 |

### 5.3 域名配置

| 域名 | 指向服务 |
|------|---------|
| zuting.fszyl.top | 主站 (Next.js Web) |
| api.zuting.fszyl.top | API (NestJS) |
| admin.zuting.fszyl.top | 管理后台 (Admin) |

---

## 6. 部署流程

### 6.1 标准部署步骤

```bash
# 本地: 确保代码已提交并推送
git status                  # 确认无未提交改动
git push origin master      # 推送到远端

# 远程部署（通过 deploy.py 脚本）
python scripts/deploy.py --env production

# 或手动 SSH 部署
ssh root@120.24.31.151 << 'EOF'
  cd /opt/zuting
  git pull origin master
  pnpm install --frozen-lockfile
  pnpm build
  pm2 restart all
EOF
```

### 6.2 API 部署流程

```bash
# 服务器上
cd /opt/zuting/services/api

# 1. 安装依赖
pnpm install --frozen-lockfile

# 2. 生成 Prisma Client
pnpm prisma generate

# 3. 数据库迁移（生产环境用 migrate deploy，不用 db push）
pnpm prisma migrate deploy

# 4. 编译
pnpm build

# 5. 重启服务（PM2）
pm2 restart zuting-api
pm2 save
```

### 6.3 Web 部署流程

```bash
cd /opt/zuting/apps/web

# 1. 编译（Next.js）
pnpm build

# 2. 重启服务
pm2 restart zuting-web
```

### 6.4 部署前检查清单

在执行部署前，必须逐项确认：

- [ ] `tsc --noEmit` 通过（所有端）
- [ ] 无未提交的改动（`git status` 干净）
- [ ] 环境变量已在服务器更新（如有新增）
- [ ] 数据库 Schema 变更已通过 `migrate deploy`（不是 `db push`）
- [ ] 关键 API 端点在本地已测试通过
- [ ] PRD 验收标准已逐项核对

### 6.5 PM2 进程管理

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs zuting-api --lines 100
pm2 logs zuting-web --lines 100

# 重启单个服务
pm2 restart zuting-api

# 重启所有服务
pm2 restart all

# PM2 配置文件: /opt/zuting/ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'zuting-api',
      script: 'dist/main.js',
      cwd: '/opt/zuting/services/api',
      env: { NODE_ENV: 'production', PORT: 3002 },
      max_memory_restart: '1G',
    },
    {
      name: 'zuting-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/opt/zuting/apps/web',
      env: { NODE_ENV: 'production', PORT: 3000 },
    },
    {
      name: 'zuting-admin',
      script: 'serve',
      args: '-s dist -l 3003',
      cwd: '/opt/zuting/apps/admin',
    },
  ],
};
```

---

## 7. Docker 管理规范

### 7.1 Docker 使用范围

Docker 仅用于管理**数据服务**（PostgreSQL + Redis），应用服务（API/Web/Admin）直接用 PM2 运行，不容器化。

### 7.2 docker-compose.yml 规范

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: zuting-postgres
    environment:
      POSTGRES_USER:     ${POSTGRES_USER:-zuting}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}       # 必须通过环境变量，禁止硬编码
      POSTGRES_DB:       ${POSTGRES_DB:-zuting}
    ports:
      - "5435:5432"                                  # 宿主机:容器
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: zuting-redis
    ports:
      - "6380:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 7.3 Docker 操作铁律

```
[D-01] 禁止在 docker-compose.yml 中硬编码密码，必须使用环境变量
[D-02] 端口映射必须显式声明（宿主机:容器），禁止使用默认端口避免冲突
[D-03] 数据目录必须使用 named volumes，禁止使用 bind mount 到随机路径
[D-04] 生产环境修改 Docker 配置，必须先备份数据再操作
[D-05] 禁止在生产环境使用 docker-compose down（会销毁网络），用 docker-compose stop
```

### 7.4 常用命令

```bash
# 开发环境启动数据库
pnpm docker:up            # = docker-compose -f docker/docker-compose.yml up -d

# 停止（保留数据）
pnpm docker:stop          # = docker-compose stop

# 查看日志
docker logs zuting-postgres --tail=50
docker logs zuting-redis --tail=50

# 进入 PostgreSQL
docker exec -it zuting-postgres psql -U zuting -d zuting
```

---

## 8. Nginx 配置规范

### 8.1 反向代理配置规则

```nginx
# /etc/nginx/sites-available/zuting.conf

# ✅ 正确的 proxy_pass 配置
location /api/ {
    proxy_pass http://127.0.0.1:3002/api/;    # 末尾斜杠对称
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# SSE 流式接口需要额外配置（小鸿 AI 聊天）
location /api/xiaohong/chat/stream {
    proxy_pass http://127.0.0.1:3002;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding on;
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 300s;
}
```

### 8.2 Nginx 配置铁律

```
[N-01] 禁止用 sed 脚本修改 Nginx 配置（容易引入格式错误）
       正确做法: 直接编辑 /etc/nginx/sites-available/xxx.conf，然后 nginx -t 测试

[N-02] 每次修改 Nginx 配置后必须执行: nginx -t && nginx -s reload
       绝对禁止: service nginx restart（会中断所有连接）

[N-03] proxy_pass 配置末尾斜杠必须对称
       ✅ location /api/  →  proxy_pass http://127.0.0.1:3002/api/
       ❌ location /api/  →  proxy_pass http://127.0.0.1:3002/api  (路径错位)

[N-04] Docker bridge 网络中，proxy_pass 必须使用宿主机IP (127.0.0.1)，
       不能使用 localhost（在某些系统会解析为 ::1）

[N-05] SSE/WebSocket 端点必须单独配置 proxy_buffering off + proxy_read_timeout
```

### 8.3 HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name zuting.fszyl.top;

    ssl_certificate     /etc/letsencrypt/live/zuting.fszyl.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zuting.fszyl.top/privkey.pem;

    # 安全头（配合 NestJS helmet）
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1024;
}

# HTTP → HTTPS 重定向
server {
    listen 80;
    server_name zuting.fszyl.top;
    return 301 https://$host$request_uri;
}
```

---

## 9. 回滚策略

### 9.1 Git Tag 版本标记

每次正式发布前打 Tag：

```bash
# 发布时打 Tag
git tag -a v1.0.0 -m "Phase A 完整版 — 核心功能上线"
git tag -a v1.1.0 -m "Wave 1-6 升级 — 评价系统+订单+通知"
git push origin --tags

# Tag 命名: v{大版本}.{功能版本}.{补丁版本}
# 大版本: Phase A/B/C/D 对应 1/2/3/4
# 功能版本: 新增功能模块时递增
# 补丁版本: BUG 修复时递增
```

### 9.2 快速回滚流程

```bash
# 步骤 1: 确认要回滚到的 Tag
git log --oneline --tags --no-walk

# 步骤 2: 在服务器上回滚
ssh root@120.24.31.151 << 'EOF'
  cd /opt/zuting
  git fetch --tags
  git checkout v1.0.0       # 回滚到指定 Tag

  # 步骤 3: 重新构建
  pnpm install
  pnpm build

  # 步骤 4: 重启服务
  pm2 restart all
EOF

# 步骤 5: 验证回滚成功
curl https://api.zuting.fszyl.top/api/health
```

### 9.3 数据库回滚注意事项

```
[DB-ROLLBACK-01] 代码回滚后，如果有数据库 Schema 变更，需要手动执行降级迁移
[DB-ROLLBACK-02] 生产数据库在执行迁移前，必须先备份:
                 pg_dump -h localhost -p 5435 -U zuting zuting > backup-$(date +%Y%m%d).sql
[DB-ROLLBACK-03] 禁止在生产环境使用 prisma db push（用 prisma migrate deploy）
```

---

## 10. 禁止项与安全规则

遵循 CLAUDE.md 中的 [HH-S01] ~ [HH-S03] 安全底线：

```
[GIT-F01] 严禁将 .env* 文件（除 .env.example）提交到 Git
          一旦发现：立即 git rm --cached .env* + 更换所有密钥

[GIT-F02] 严禁 git push --force 到 master 分支（单向锁定）
          如需撤销错误 commit，使用 git revert 生成反向 commit

[GIT-F03] 严禁 --no-verify 绕过 pre-commit hook
          Hook 失败 = 代码不合格，必须修复

[GIT-F04] 严禁在 commit message 中包含密码、API Key、Token 等敏感信息

[GIT-F05] 严禁在 master 分支直接开发（WIP 代码必须在 feature/* 分支）

[GIT-F06] 严禁积累超过 4 小时的未提交代码（[B-01]）

[DEPLOY-F01] 严禁在生产数据库上执行 prisma db push（开发专用命令）
[DEPLOY-F02] 严禁 docker-compose down（会销毁 Docker 网络，用 stop 代替）
[DEPLOY-F03] 严禁在不通知团队的情况下在生产环境执行 Schema 变更
[DEPLOY-F04] 严禁跳过部署前检查清单（第 6.4 节）
```

---

*本规范由 CEO++ 指令触发，遵循 SCP-04 开发协议规则库管理。如有疑问，以最高宪法协议 (00-最高宪法协议.md) 为准。*

*版本历史: v1.0 (2026-03-29) — 初版建立*
