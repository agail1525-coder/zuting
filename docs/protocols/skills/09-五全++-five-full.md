# 五全++ (Five-Full Cross-Platform Auditor) v1.0

> **代号**: FF | **版本**: v1.0 | **创建**: 2026-04-06 | **移植自**: 作业郎 五全++ v2.1
> **定位**: 五端一致性审计 — Web/Mobile/Mini/Admin/API数据对齐+共享包一致
> **触发**: 全审++ Step 7 / 五全++ {module} / 跨端开发

---

## §0 元数据

```yaml
name: five-full-cross-platform
version: 1.0
triggers:
  - 五全++ {module}
  - 全审++ Step 7 (自动调用)
  - 跨端开发完成后
前置条件:
  - 目标模块在至少2个端有实现
  - 业务++/盲区++/地狱++/体验++/飞轮++ 已完成
后置动作:
  - 输出FF评分 + 跨端不一致清单
  - 修复关键不一致
联动技能: 全审++ (上游) / 飞轮++ (闭环一致) / 体验++ (UX一致)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Inspector** | 5维度跨端对比分析 | Step 1-3 |
| **Executor** | 修复跨端不一致 | Step 4 |
| **Verifier** | 确认五端数据一致 | Step 5 |

---

## §2 作用域

### 五端对应关系

| 端 | 框架 | 位置 | 共享包使用 |
|----|------|------|-----------|
| API | NestJS 11 | services/api/ | 被所有端调用 |
| Web | Next.js 15 | apps/web/ | api-client, shared-types, translations |
| Mobile | Expo 52 | apps/mobile/ | api-client, shared-types, config |
| Mini | Taro 4 | apps/miniprogram/ | api-client, shared-types |
| Admin | Vite+AntD | apps/admin/ | api-client, shared-types |

### 共享包

| 包 | 路径 | 职责 |
|----|------|------|
| @zuting/api-client | packages/api-client/ | 类型安全API客户端 |
| @zuting/shared-types | packages/shared-types/ | 共享TypeScript类型 |
| @zuting/config | packages/config/ | 业务配置(religions, seals, trips, design) |
| @zuting/shared-utils | packages/shared-utils/ | 共享工具函数 |
| @zuting/translations | packages/translations/ | i18n翻译文件 |

---

## §3 领域规则 — 5维度跨端检查

### C1 API契约一致
```
[FF-01] 前端调用的API路径必须与后端Controller路由完全匹配
[FF-02] 请求DTO字段必须与前端发送的字段名一致
[FF-03] 响应类型必须与前端使用的类型一致 (shared-types)
[FF-04] 分页格式统一: { items: T[], total, page, pageSize }
[FF-05] 错误码统一: HttpException + 标准HTTP状态码
[FF-06] 枚举值前后端完全一致 (R-02)
```

### C2 类型共享
```
[FF-07] 多端使用的类型必须定义在@zuting/shared-types中
[FF-08] 不允许各端单独定义已有shared-types中的类型 (防漂移)
[FF-09] Prisma enum/model → shared-types → 前端 单向同步链
[FF-10] API响应类型与shared-types定义一致
[FF-11] 内联DTO(直接在代码中定义的类型)必须提升到shared-types
```

### C3 数据展示一致
```
[FF-12] 同一数据(如圣地名/价格/评分)在各端显示值一致
[FF-13] 日期格式: 统一使用ISO8601→各端locale格式化
[FF-14] 货币: 统一从API获取→各端格式化展示
[FF-15] 图片URL: 统一使用API返回的完整URL
[FF-16] 分页: 各端使用相同的pageSize默认值
```

### C4 功能覆盖
```
[FF-17] Web有的核心功能，Mobile/Mini应有对应实现(或明确标注N/A)
[FF-18] Admin管理功能覆盖所有需要后台管理的内容
[FF-19] 五端的路由/导航结构映射关系清晰
[FF-20] 新增API端点 → 所有调用端同步更新api-client
```

### C5 配置共享
```
[FF-21] 业务配置(宗教列表/印系列/颜色)统一从@zuting/config获取
[FF-22] i18n翻译统一从@zuting/translations获取(或各端lib/i18n)
[FF-23] 环境变量(API_URL等)各端配置一致
[FF-24] 种子数据(seed.ts)与各端硬编码数据一致
[FF-25] Mock数据必须标注为Mock → 不允许各端有不一致的Mock数据
```

---

## §4 执行流程

```
Step 0: 确定目标模块在各端的实现位置
Step 1: C1 API契约检查
  → 对比Controller路由 vs 前端API调用
  → 对比DTO字段 vs 前端请求payload
  → 检查枚举值一致性
Step 2: C2-C3 类型+数据检查
  → 检查shared-types覆盖率
  → 对比各端数据展示值
  → 检查日期/货币/图片格式一致性
Step 3: C4-C5 功能+配置检查
  → 各端功能覆盖矩阵
  → 配置来源一致性
Step 4: 修复 (Executor)
  → 类型提升到shared-types
  → API路径/字段名对齐
  → 配置统一
Step 5: 验证 (Verifier)
  → tsc全端编译
  → 确认修复后各端一致
```

---

## §5 评分机制

| 维度 | 代号 | 权重 |
|------|------|------|
| FF-D1 API契约 | C1 | 25% |
| FF-D2 类型共享 | C2 | 20% |
| FF-D3 数据一致 | C3 | 20% |
| FF-D4 功能覆盖 | C4 | 20% |
| FF-D5 配置共享 | C5 | 15% |

---

## §6 工具治理

```
允许工具:
  - Read: 读取各端代码+共享包
  - Grep: 搜索API调用/类型引用/配置引用
  - Glob: 发现各端文件
  - Edit: 修复不一致
  - Bash: tsc全端编译验证

核心检测命令:
  API路径:      Grep "api\.|fetch\(|axios" --path "apps/"
  shared-types: Grep "@zuting/shared-types" --path "apps/"
  枚举定义:     Grep "enum " --path "services/api/prisma/schema.prisma"
  枚举使用:     Grep "{EnumName}" --path "apps/"
  config引用:   Grep "@zuting/config" --path "apps/"
```

---

## §7 生命周期

```
L1 触发: 全审++ Step 7 / 跨端开发后 / 手动
L2 执行: 5维度跨端对比 → 不一致识别 → 修复
L3 输出: FF评分 + 跨端不一致清单
L4 反馈: 全审++汇总
L5 沉淀: 跨端对齐模式 → 更新规则
```

---

## §8 铁律清单

见§3 FF-01 ~ FF-25

---

## §9 联动点

| 方向 | 技能 | 接口 |
|------|------|------|
| ←调用 | 全审++ | Step 7 调用，返回FF评分 |
| ←输入 | 飞轮++ | 闭环修复后检查跨端一致 |
| ←输入 | 体验++ | UX修复后检查各端体验一致 |
| ←参考 | API契约 | docs/protocols/02-API契约规范.md |
| ←参考 | schema.prisma | 数据模型SSOT |
