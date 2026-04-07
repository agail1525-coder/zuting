# 地狱++ (Hell-Level Auditor) v1.0

> **代号**: HELL | **版本**: v1.0 | **创建**: 2026-04-06 | **移植自**: 作业郎 地狱++ v2.2
> **定位**: 深层安全与稳定性审计 — IDOR/Guard/事务/状态机/韧性/DTO
> **触发**: 全审++ Step 4 / X+ / 地狱++ {module}

---

## §0 元数据

```yaml
name: hell-level-auditor
version: 1.0
triggers:
  - 地狱++ {module}
  - 全审++ Step 4 (自动调用)
  - X+ (BUG猎杀自动调用)
前置条件:
  - 目标模块已确定
  - schema.prisma已读取
后置动作:
  - 输出HELL评分 + 安全问题清单
  - CRITICAL级别立即修复
联动技能: 全审++ (上游) / 盲区++ (协同) / 飞轮++ (事务闭环)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Inspector** | 8维度深层安全扫描 | Step 1-3 |
| **Executor** | 修复CRITICAL/HIGH安全问题 | Step 4 |
| **Verifier** | 确认修复+不引入新漏洞 | Step 5 |

---

## §2 作用域

重点: services/api/ (Controller + Service + Module + Guard)
辅助: apps/web/src/ (客户端安全) + apps/admin/src/ (权限)

---

## §3 领域规则 — 8维度深层扫描

### H1 IDOR (Insecure Direct Object Reference)
```
[HELL-01] 接受userId参数的端点必须验证req.user.id === userId (R-68)
[HELL-02] 接受entityId的端点必须验证用户有权限访问该entity
[HELL-03] 批量操作端点必须逐条验证权限，非仅验证第一条
[HELL-28] 共享页面的@Roles必须包含所有访问角色
```

### H2 Guard与认证
```
[HELL-04] 非@Public()路由必须有@UseGuards(JwtAuthGuard) (R-63)
[HELL-05] @Roles()必须配合@UseGuards(JwtAuthGuard, RolesGuard) (R-74)
[HELL-06] Controller级Guard优先于Method级Guard
[HELL-07] Admin端点必须有@Roles('ADMIN')
[HELL-29] Guard链顺序: JWT认证 → 角色验证 → 业务权限
```

### H3 DTO与输入校验
```
[HELL-08] 所有用户输入必须经过class-validator DTO (R-03)
[HELL-09] 数值类型必须有@Min/@Max范围限制
[HELL-10] 字符串类型必须有@MaxLength限制
[HELL-11] 枚举参数必须有@IsEnum校验
[HELL-30] 分页pageSize必须@Max(100) (R-64)
[HELL-31] 禁止内联DTO(在Controller方法签名中直接定义类型)
```

### H4 状态机守卫
```
[HELL-12] Trip状态变更必须校验AllowedTransitions (R-07)
[HELL-13] 终态(COMPLETED/CANCELLED/REFUNDED)不可再跳转 (R-08)
[HELL-14] 状态变更必须写审计日志 (R-09)
[HELL-32] 生成型API(创建订单等)必须写DB，不能只返回数据
```

### H5 事务与一致性
```
[HELL-15] 涉及多表写入的操作必须用Prisma事务($transaction)
[HELL-16] 支付/退款操作必须有幂等保护
[HELL-17] 删除操作必须检查关联数据(级联 or 软删)
[HELL-33] List API泛型必须与运行时类型一致，否则白屏
```

### H6 韧性与容错
```
[HELL-18] 外部HTTP调用必须有超时设置 (R-65)
[HELL-19] 第三方API降级不能导致整个页面崩溃
[HELL-20] Redis不可用时核心功能仍需可用(降级策略)
[HELL-34] findMany必须有take参数防OOM (R-64)
```

### H7 XSS与注入
```
[HELL-21] 用户内容输出必须HTML转义
[HELL-22] 动态SQL拼接禁止 → 使用Prisma参数化查询
[HELL-23] URL参数不得直接嵌入页面DOM
[HELL-35] Raw SQL如果使用必须有手动表清单审计
```

### H8 数据泄露防护
```
[HELL-24] API不得返回password/token等敏感字段
[HELL-25] 错误响应不得暴露堆栈信息或内部路径
[HELL-26] 列表API不得返回其他用户的私密数据
[HELL-27] 日志不得记录完整token/密码
```

---

## §4 执行流程

```
Step 0: 读取 schema.prisma + 目标模块Controller
Step 1: H1-H2 权限扫描 (IDOR + Guard)
  → Grep @Public/@UseGuards/@Roles → 验证覆盖率
  → 读取涉及userId的端点 → 检查权限验证
Step 2: H3-H4 输入+状态机扫描
  → Grep DTO使用 → 检查class-validator装饰器
  → 读取状态变更端点 → 检查AllowedTransitions调用
Step 3: H5-H8 深层扫描
  → 事务: Grep $transaction → 检查多表写入覆盖
  → 韧性: 检查超时配置/降级策略
  → XSS: 检查用户内容输出路径
  → 泄露: 检查API响应字段(是否包含敏感数据)
Step 4: 修复 (Executor)
  → CRITICAL: 立即修复 (IDOR/无Guard/SQL注入)
  → HIGH: 本轮修复 (缺DTO校验/无事务/数据泄露)
  → MEDIUM: 记录待修 (韧性/降级策略)
Step 5: 验证 (Verifier)
  → tsc编译通过
  → 重跑检测确认修复
  → 确认无新漏洞引入
```

---

## §5 评分机制

| 维度 | 代号 | 权重 | 说明 |
|------|------|------|------|
| HELL-D1 IDOR | H1 | 15% | 权限绕过漏洞数 |
| HELL-D2 Guard | H2 | 15% | 缺失Guard的路由数 |
| HELL-D3 DTO | H3 | 10% | 缺校验的输入参数数 |
| HELL-D4 状态机 | H4 | 15% | 非法跳转路径数 |
| HELL-D5 事务 | H5 | 10% | 缺事务的多表操作数 |
| HELL-D6 韧性 | H6 | 10% | 缺超时/降级的调用数 |
| HELL-D7 XSS | H7 | 15% | 未转义的用户内容输出数 |
| HELL-D8 泄露 | H8 | 10% | 暴露敏感数据的端点数 |

严重级别: CRITICAL=有一个即<2⭐ / HIGH=有则≤3⭐ / MEDIUM=允许≤2个

---

## §6 工具治理

```
允许工具:
  - Grep: 模式匹配 (Guard/DTO/Roles/Public)
  - Read: 精读Controller/Service/Module
  - Glob: 发现Controller文件
  - Edit: 修复安全问题
  - Bash: tsc验证

核心检测命令:
  Guard覆盖:    Grep "@UseGuards|@Public" --glob "*.controller.ts"
  IDOR检查:     Grep "userId|:id.*Param" --glob "*.controller.ts"
  DTO检查:      Grep "@Body|@Query|@Param" --glob "*.controller.ts" → 验证DTO类
  状态机:       Grep "AllowedTransitions|canTransition" --glob "*.service.ts"
  事务:         Grep "\\$transaction" --glob "*.service.ts"
  敏感字段:     Grep "password|token|secret" --glob "*.service.ts"
  Roles:        Grep "@Roles" --glob "*.controller.ts"
```

---

## §7 生命周期

```
L1 触发: 全审++ Step 4 / X+ / 手动
L2 执行: 8维度扫描 → 严重级别分类 → 修复
L3 输出: HELL评分 + 安全问题清单(CRITICAL/HIGH/MEDIUM)
L4 反馈: 全审++汇总 / 安全团队审阅
L5 沉淀: 新漏洞模式 → 更新§3规则 + 版本升级
```

---

## §8 铁律清单

见§3 HELL-01 ~ HELL-35

---

## §9 联动点

| 方向 | 技能 | 接口 |
|------|------|------|
| ←调用 | 全审++ | Step 4 调用，返回HELL评分 |
| ←调用 | X+ | BUG猎杀自动调用 |
| ←输入 | 盲区++ | 盲区发现的链路断裂→深挖安全影响 |
| →输入 | 飞轮++ | 事务问题→检查数据一致性闭环 |
| ←参考 | CLAUDE.md | R-63/R-64/R-65/R-68/R-74 铁律 |
| ←参考 | schema.prisma | 验证Model/字段/关系 |
