# 自动测试++ (AT++) v1.0

> **代号**: AT++ (Auto Test Plus Plus) | **版本**: v1.0 | **创建**: 2026-04-12 | **移植自**: 作业郎 AT++ v2.0
> **定位**: 真实全链路业务旅程自动测试，5驱动×7旅程×5断言×30铁律，带Pit Registry自学习
> **触发**: `AT++` / `AT++ --smoke` / `AT++ --journey J{n}` / 全审++ 深度模式

---

## §0 元数据

```yaml
name: auto-test-plus-plus
version: 1.0
triggers:
  - AT++                        # 全量7旅程真实测试
  - AT++ --smoke                # 冒烟 (仅健康+登录+一条主链)
  - AT++ --journey J{1..7}      # 单旅程
  - AT++ --role {USER|ADMIN|MERCHANT}
  - AT++ --rca {requestId|url}  # 单点根因追踪
  - AT++ --pit                  # 运行Pit Registry回归
  - AT++ --learn                # 把本次失败写入Pit Registry
  - AT++ --report               # 输出HTML/JSON报告
前置条件:
  - API:3002 / Web:3000 / Admin:3003 至少各起一端
  - Chrome DevTools MCP / Playwright MCP 可用
  - 种子数据已跑过 (pnpm db:seed)
后置动作:
  - 输出5维评分 + 失败旅程requestId → 代码行追踪
  - P0失败→写入Pit Registry → 生成修复任务卡
联动: 全审++ (深度驱动) / 盲区++ (死按钮/伪空态) / 地狱++ (IDOR/Guard) / 飞轮++ (状态机闭环) / 五全++ (五端一致)
```

---

## §1 角色定义

AT++ 是 ZUTING 的**真实用户模拟器**，不是 unit test 替身。它打开真浏览器、敲真 API、写真 DB、读真 Redis，沿着真实业务旅程走通并在每个关键节点做多维断言。

**核心信条**: 不测"代码跑不跑"，只测"用户能不能完成任务"。

---

## §2 作用域

| 层 | 范围 | 工具 |
|---|---|---|
| Web | localhost:3000 + https://zuting.fszyl.top/ | Chrome DevTools MCP / Playwright |
| Admin | localhost:3003 + https://zuting.fszyl.top/admin/ | Playwright (子路径 basename 感知) |
| Mobile/小程序 | 构建产物静态检查 | 仅语义快照，不启动模拟器 |
| API | localhost:3002/api + 生产 /api | curl + paramiko SSH |
| DB/Redis | docker pg:5435 / redis:6380 | psql / redis-cli |
| Infra | Nginx / Docker / Systemd | ssh 120.24.31.151 |

---

## §3 规则 — 5驱动 × 5断言

### 5 驱动 (Drivers)

| ID | 驱动 | 用途 |
|----|------|------|
| D1 | Chrome DevTools MCP | Web/Admin 真浏览器交互+Network+Console |
| D2 | Playwright MCP | 跨浏览器+子路径/admin/ basename 校验 |
| D3 | curl + HTTP 脚本 | API 纯契约+鉴权+IDOR 渗透 |
| D4 | paramiko SSH | 生产日志、docker exec、pg psql 校验 |
| D5 | SSE client (Node fetch ReadableStream) | 小鸿AI 流式专用 — 验证 first-byte<3s, keepalive, 完整事件 |

### 5 断言 (Assertions)

| ID | 维度 | 断言示例 |
|----|------|----------|
| A1 | HTTP | status / body schema / pagination {items,total,page,pageSize} / 错误码 |
| A2 | DB | 行数增减 / 状态字段 / 外键 / 枚举值在 Prisma 范围 |
| A3 | UI | 三态(loading/error/empty) / 文案非 undefined / 按钮真可点 / i18n key 不裸露 |
| A4 | Log | NestJS requestId / Prisma SQL / Redis key / Nginx access |
| A5 | Contract | 前端 .ts type 与后端 DTO 字段/枚举完全一致，无 any |

---

## §4 旅程 — 7大业务主链 (J1-J7)

对标 ZUTING 真实用户路径。每个旅程产出 **旅程卡** = 步骤 + 预期 + 断言 + 失败→PIT-编号。

### J1 注册登录 + 2FA + 手机号/邮箱双入口
```
POST /api/auth/register (phone) → 返回JWT
POST /api/auth/login (phone OR email, 正则 /^1\d{10}$/ 自动识别)
POST /api/auth/2fa/enable → TOTP secret → OTP验证
Admin /admin/ 以 ADMIN 角色登录 → 菜单按 role 过滤
断言: A1 JWT 格式 / A2 users表 role 字段 / A3 登录失败文案不泄露"用户不存在"/"密码错误"差异 / A5 identifier 字段前后端对齐
```

### J2 搜索 + 文化传统/圣地浏览 + 收藏
```
GET /api/search?q=曹溪 → 混合结果
GET /api/holy-sites?religion=BUDDHISM → 分页
GET /api/holy-sites/{id} → 详情+推荐
POST /api/collections → 收藏
DELETE /api/collections/{id} → 取消
断言: A1 分页格式 / A2 collection 去重 / A3 空搜索显示热词而非空白 / A4 Redis holy-site:* 命中
```

### J3 行程规划 + 12状态机
```
POST /api/trips (DRAFT)
PATCH /api/trips/{id}/submit → SUBMITTED
ADMIN PATCH .../confirm → CONFIRMED
POST /api/orders + /api/payment → PAID
PATCH .../start → IN_PROGRESS → COMPLETED
PATCH .../review → REVIEWING
异常路径: CANCELLED / REFUNDING / REFUNDED
断言: A2 AllowedTransitions 非法跳转被拒 / A2 audit log 写入 / A5 状态枚举前后端一致
```

### J4 下单支付 + 退款闭环
```
POST /api/orders → pending
POST /api/payment/{orderId} → 模拟成功
GET /api/orders/mine → 出现该订单 PAID
POST /api/orders/{id}/refund → REFUNDING → REFUNDED
断言: A2 $transaction 原子性 / A2 积分同步发放 / A1 幂等 (重复支付返回同一结果)
```

### J5 UGC 评价 / 游记 / 问答
```
POST /api/reviews (需已 COMPLETED trip)
POST /api/guides
POST /api/questions + POST /api/questions/{id}/answers
POST /api/reviews/{id}/vote
断言: A2 review 只能对 COMPLETED trip / A3 富文本 XSS 过滤 / A1 投票去重
```

### J6 小鸿 AI SSE 流式 + 推荐
```
POST /api/xiaohong/chat (stream=true)
  → 首字节 < 3s
  → keepalive 心跳
  → 完整 data: ... \n\n 事件
  → 最终 done 事件
GET /api/recommendations/for-me
断言: A1 Content-Type: text/event-stream / A4 无 thinking tag 泄露 / A5 消息历史格式对齐
```

### J7 Admin CRUD + ACL + 审计 + 子路径
```
GET /admin/ → basename /admin 生效 → 资源 /admin/assets/*.js 200
Login → /admin/dashboard
Religion/HolySite/Temple CRUD
Audit log 写入 admin_audit 表
非 ADMIN 访问 /admin/users → 403 或跳转
断言: A3 菜单按 role 过滤 / A4 admin_audit 每次写操作都有条目 / A5 @Roles + @UseGuards 成对出现
```

---

## §5 根因追踪 (RCA)

失败自动触发:
```
失败断言
  → 提取 requestId (NestJS logger) / traceId
  → grep services/api/logs → 找到 module/method
  → 映射到 src/modules/*/*.service.ts:L{行号}
  → 若 DB 错误 → prisma/schema.prisma 对应字段
  → 若 UI 错误 → 对应 page/component 文件
  → 产出"失败→文件:行"卡片
```

---

## §6 Pit Pattern Registry (自学习)

路径: `E:/ZUTING-APP/经验沉淀/PIT-REGISTRY.jsonl` (追加式,一行一坑)

格式:
```json
{"id":"PIT-005","title":"nginx bind mount stale inode","trigger":"docker inspect 显示 mount 但容器内文件只读","fix":"写 host 文件+docker restart 重绑","first_seen":"2026-04-12","journey":"J7","driver":"D4"}
```

### 种子 Pit (7条已知坑)

| ID | 标题 | 触发 | 修复 |
|----|------|------|------|
| PIT-001 | node-v20-compile-cache 破坏 Prisma enum | 生产 API trip-state-machine TypeError | `NODE_NO_COMPILE_CACHE=1` |
| PIT-002 | seed 后 Redis 缓存旧 ID 导致 404 | deleteMany+create 生成新 cuid | seed 后 flush 实体缓存 |
| PIT-003 | seed deleteMany FK 顺序错导致外键冲突 | 先删父表被子表引用 | 反向顺序: 先子后父 |
| PIT-004 | Prisma enum 直传 Swagger 装饰器循环依赖 | NestJS 启动爆 circular dep | enum 转字符串数组 |
| PIT-005 | nginx 容器 bind mount 绑定旧 inode | host 文件被 mv/cp 替换后 mount 失联 | 写 host + `docker restart` 重绑 |
| PIT-006 | Git Bash MSYS 把 `/admin/` 当路径吞掉 | `ADMIN_BASE=/admin/` 变成 `/Git/admin/` | vite.config.ts 内硬编码 / 或 `MSYS_NO_PATHCONV=1` |
| PIT-007 | 国内运营商屏蔽非标端口(3004) | 手机 4G 访问 http://ip:3004 连接失败 | 改走 443 主域名 `/admin/` 子路径 |

### Pit 回归

`AT++ --pit` 会把每条 PIT 转成可执行断言,自动运行,任何一条复发立即 FAIL。

### Pit 学习

`AT++ --learn` 在失败后自动追加新条目,字段: id/title/trigger/fix/first_seen/journey/driver/assertion。

---

## §7 30 铁律 (AT-01 ~ AT-30)

### 执行类 (AT-01 ~ AT-10)
```
[AT-01] 必须在真端真数据跑,禁止 mock DB/Redis
[AT-02] 每个旅程必须跨到 ≥2 端 (Web+API / Admin+API / Mobile-产物+API)
[AT-03] 登录必须走真 /api/auth/login,禁止直接注入 JWT
[AT-04] CRUD 必须验证回读 (POST 完 GET 必须看到)
[AT-05] 状态机必须跑终态前至少一次非法跳转,验证被拒
[AT-06] 支付旅程必须校验幂等 (同 orderId 重复支付返回同结果)
[AT-07] SSE 旅程必须计时首字节 < 3s
[AT-08] Admin 子路径必须验证 /admin/ base 和 /admin/assets/ 资源 200
[AT-09] 登录失败文案禁止泄露"用户不存在"vs"密码错误"差异
[AT-10] 并发读必须验证分页 total 一致
```

### 追踪类 (AT-11 ~ AT-20)
```
[AT-11] 任何失败必须输出 requestId → 代码文件:行号
[AT-12] DB 断言必须 psql 直查,禁止通过 API 自证
[AT-13] Redis 断言必须 redis-cli 直查 key 真实存在
[AT-14] Log 断言必须匹配 NestJS logger 格式,禁止宽松正则
[AT-15] Contract 断言必须对齐 packages/shared-types 导出
[AT-16] i18n 断言必须验证 7 语言 key 存在,不可裸露 key
[AT-17] UI 断言必须截图存档 (失败时)
[AT-18] 三态断言 loading/error/empty 缺一即 FAIL
[AT-19] 死按钮 (无 handler / 无 href / disabled 无 tooltip) 零容忍
[AT-20] IDOR 断言: 换 userId 访问别人的资源必须 403
```

### 学习类 (AT-21 ~ AT-30)
```
[AT-21] 每次 FAIL 后必须评估是否写入 Pit Registry
[AT-22] Pit Registry 只增不减,弃用标"deprecated":true
[AT-23] Pit 必须有 trigger(复现条件)+fix(修复要点)两字段
[AT-24] Pit 回归 (--pit) 必须每次发版前跑一次
[AT-25] 同一 Pit 复发 ≥2 次必须升级为 CLAUDE.md 铁律或协议条款
[AT-26] AT++ 报告必须存档 E:/ZUTING-APP/测试档案库/YYYY-MM-DD-xxx.md
[AT-27] 生产环境 AT++ 必须只读,禁止写生产 DB (只跑 GET/HEAD)
[AT-28] 生产环境写操作必须在 staging/本地,绝不触碰生产 users/orders
[AT-29] AT++ 发现 P0 必须阻断部署 (P+ / PUSH++ 不得继续)
[AT-30] 每季度必须执行一次完整 7 旅程离线压测,结果入档
```

---

## §8 执行流程

```
Step 0  读 CLAUDE.md + 本技能 + Pit Registry (回归基线)
Step 1  环境预检: API/Web/Admin 健康检查 (健康端点或首页 200)
Step 2  跑 J1 登录,拿到 USER/ADMIN/MERCHANT 三套 JWT
Step 3  按 --journey 或全量 (J2..J7) 并行/串行执行
        Admin+Merchant 旅程串行 (避免污染 audit log)
        只读旅程 (搜索/浏览) 并行
Step 4  每旅程失败 → RCA → 追加 Pit Registry 候选
Step 5  跑 Pit Registry 回归 (--pit)
Step 6  汇总 5 维评分 + 输出 HTML+JSON 报告 + 存档
        报告路径: E:/ZUTING-APP/测试档案库/{date}-AT-report.md
```

---

## §9 评分体系

5 维 × 5⭐:
```
M1 旅程通过率      (7旅程完整通过率, P0阻断计0分)
M2 断言通过率      (总断言 PASS/总数)
M3 追踪命中率      (FAIL 中成功映射到 file:line 的比例)
M4 Pit 回归通过率  (PIT-REGISTRY 全绿)
M5 报告完整性      (5维数据全/报告存档/截图保留)

≥4.5 ✅ 发版就绪
4.0-4.4 ⚠️ 允许带已记录的非阻断问题发版
3.0-3.9 ❌ P1 必须修复后重跑
<3.0 🚫 P0 阻断,不得进入 P+/PUSH++
```

---

## §10 生命周期

```
引入:  AT++ 命令 / 全审++ 深度模式 / 发版前自动
升级:  复发 Pit ≥2 次 → 升级为 CLAUDE.md 条款
归档:  每次报告入 E:/ZUTING-APP/测试档案库/
废弃:  某旅程被业务下线 → 标 deprecated,保留历史
```

---

## §11 联动

```
全审++ (Step 8 深度驱动) ── AT++ 真实跑 7 旅程补强 V2/V3/V4/V5
盲区++ (死按钮/伪空态)   ── AT++ A3 UI断言自动覆盖
地狱++ (IDOR/Guard)      ── AT++ AT-20 强制渗透
飞轮++ (状态机闭环)       ── AT++ J3 全状态机+非法跳转
五全++ (五端一致)         ── AT++ A5 Contract 断言
RRR (3分钟速查)          ── AT++ --smoke 对应快速冒烟
项目++ (PRD→施工图)       ── AT++ 从 PRD 验收清单反推旅程断言
```

---

## 附录 A — 子命令参考

```
AT++                              # 全量
AT++ --smoke                      # 冒烟 (仅 J1 + J2 首页 + J7 首页)
AT++ --journey J3                 # 单旅程
AT++ --role ADMIN                 # 按角色过滤
AT++ --rca <requestId|url>        # 单点根因
AT++ --pit                        # Pit Registry 回归
AT++ --learn                      # 失败写入 Pit
AT++ --report {html|json|md}      # 导出报告
AT++ --compare <baseline>         # 对比历史基线
AT++ --upgrade                    # 刷新本技能版本
```

## 附录 B — 与 PUSH++ 的关系

```
P+ / PUSH++ 前置钩子: AT++ --smoke 必须通过
发版 (生产 deploy) 前: AT++ 全量 (仅读旅程) 必须 ≥4.0
季度健康审计: AT++ 全量+Pit 回归 必须 ≥4.5
```
