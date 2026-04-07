# 盲区++ (Blind Spot Auditor) v1.0

> **代号**: BS | **版本**: v1.0 | **创建**: 2026-04-06 | **移植自**: 作业郎 盲区++ v1.1
> **定位**: 隐性缺陷猎手 — 发现正常审查容易遗漏的死按钮/伪空态/链路断裂
> **触发**: 全审++ Step 3 / X+ / 盲区++ {module}

---

## §0 元数据

```yaml
name: blind-spot-auditor
version: 1.0
triggers:
  - 盲区++ {module}
  - 全审++ Step 3 (自动调用)
  - X+ (BUG猎杀自动调用)
前置条件:
  - 目标模块已确定
  - 业务++已通过或同步执行
后置动作:
  - 输出BS评分 + 隐性缺陷清单
  - P0缺陷立即修复
联动技能: 全审++ (上游) / 地狱++ (深层协同) / 飞轮++ (闭环验证)
```

---

## §1 角色定义

| 角色 | 职责 | 执行时机 |
|------|------|---------|
| **Inspector** | 8维度扫描隐性缺陷 | Step 1-3 |
| **Executor** | 修复发现的盲区缺陷 | Step 4 |
| **Verifier** | 确认缺陷已修复+无新缺陷引入 | Step 5 |

---

## §2 作用域

扫描范围: 目标模块的所有页面/组件/API/路由
重点关注: 用户可达但功能不可用的路径

---

## §3 领域规则 — 8维度扫描

### J1 死按钮 (Dead UI)
```
[BS-01] 按钮/链接绑定了handler但handler是空函数或仅console.log
[BS-02] 按钮/链接的onClick指向不存在的函数
[BS-03] 按钮/链接的href="#"或onClick={()=>{}}
[BS-04] 表单submit绑定但实际不发请求
[BS-11] 导航按钮指向screen:null或不存在的路由
```

### J2 伪空态 (Fake Empty State)
```
[BS-05] catch块返回空数组[]→用户看到"暂无数据"但实际是请求失败
[BS-06] API返回200但data为null→前端显示空列表而非错误
[BS-13] catch返回空对象{}→下游读取字段全是undefined
```

### J3 链路断裂 (Broken Chain)
```
[BS-07] 页面调用的API端点不存在(404)
[BS-08] API Controller方法存在但未注册路由
[BS-09] 组件import了但未在任何页面使用(死组件)
[BS-14] API返回的字段名与前端读取的字段名不匹配
```

### J4 参数黑洞 (Parameter Void)
```
[BS-10] 路由参数/:id 但页面未读取该参数
[BS-15] API接受查询参数但Service层忽略了该参数
[BS-16] 分页参数传了但API返回全量数据
```

### J5 鸡蛋死锁 (Chicken-Egg Deadlock)
```
[BS-17] 空列表+唯一入口是列表项的操作按钮 → 永远无法添加第一条
[BS-18] 功能依赖登录但登录页没有指向该功能的入口
```

### J6 状态机孤岛 (State Machine Island)
```
[BS-19] Trip状态进入某个状态后无任何UI按钮可触发下一个跳转
[BS-20] 状态机定义了跳转但前端没有对应的操作按钮
```

### J7 导航可达性 (Navigation Reachability)
```
[BS-21] 页面已注册路由但从Header/Footer/导航中没有任何入口
[BS-22] 移动端Tab页面正常但详情页没有返回按钮
[BS-23] 面包屑/返回链接指向错误的上级页面
```

### J8 异步反馈缺失 (Async Feedback Gap)
```
[BS-24] API调用发出但无loading状态 → 用户不知道在处理
[BS-25] 长操作(>3s)没有进度指示器
[BS-26] 操作成功/失败后没有toast/通知反馈
```

---

## §4 执行流程

```
Step 0: 确定扫描目标模块
Step 1: J1-J4 快速扫描 (Grep驱动)
  → Grep空handler: onClick=\{.*=>.*\{\}\}|onClick=\{.*noop
  → Grep空catch: catch.*\{.*return.*\[\]|catch.*\{.*return.*\{\}
  → Grep死路由: href="#"|href="javascript
  → Grep参数忽略: useParams|useSearchParams → 验证是否使用
Step 2: J5-J6 逻辑分析 (Read驱动)
  → 读取列表页 → 检查是否有创建入口
  → 读取状态机定义 → 检查每个状态的UI操作
Step 3: J7-J8 导航+反馈分析
  → 读取Header/Footer/导航组件 → 列出所有入口
  → 对比路由列表 → 找出无入口的孤立页面
  → 检查API调用处是否有loading/error处理
Step 4: 修复 (Executor)
  → P0: 死按钮/链路断裂 → 接通或移除
  → P1: 伪空态/异步反馈 → 添加错误处理/loading
  → P2: 导航可达性 → 补充入口链接
Step 5: 验证 (Verifier)
  → 重跑Step 1-3的检测
  → 确认修复不引入新盲区
```

---

## §5 评分机制

| 维度 | 代号 | 权重 | 说明 |
|------|------|------|------|
| BS-D1 死按钮 | J1 | 15% | 无功能的UI元素数量 |
| BS-D2 伪空态 | J2 | 15% | catch隐藏错误的实例数 |
| BS-D3 链路断裂 | J3 | 15% | API断联/死组件数 |
| BS-D4 参数黑洞 | J4 | 10% | 被忽略的参数数 |
| BS-D5 鸡蛋死锁 | J5 | 10% | 死锁场景数 |
| BS-D6 状态机孤岛 | J6 | 10% | 无UI操作的状态数 |
| BS-D7 导航可达性 | J7 | 15% | 孤立页面数 |
| BS-D8 异步反馈 | J8 | 10% | 缺失反馈的操作数 |

评分标准: 5⭐=零缺陷 / 4⭐=≤2个P2 / 3⭐=有P1 / 2⭐=有P0 / 1⭐=多个P0

---

## §6 工具治理

```
允许工具:
  - Grep: 模式匹配扫描 (核心工具)
  - Read: 精读可疑代码
  - Glob: 发现文件
  - Edit: 修复缺陷
  - Bash: 验证路由/API可达性

核心检测命令:
  空handler:      Grep "=>\s*\{\s*\}" --glob "*.tsx"
  catch空返回:    Grep "catch.*return\s*\[\]|catch.*return\s*\{\}" --glob "*.ts"
  死链接:         Grep 'href="#"|href="javascript' --glob "*.tsx"
  未用组件:       Grep "export (default )?function|export const" → 反向检查import
  路由列表:       Glob "apps/web/src/app/**/page.tsx"
  导航入口:       Grep "href=|Link.*to=|router.push" --path "apps/web/src/components"
```

---

## §7 生命周期

```
L1 触发: 全审++ Step 3 / X+ / 手动
L2 执行: 8维度扫描 → 缺陷分级 → 修复
L3 输出: BS评分 + 缺陷清单(含文件:行号)
L4 反馈: 全审++汇总 / 开发者自查
L5 沉淀: 新盲区模式 → 更新§3规则 + 版本升级
```

---

## §8 铁律清单

见§3 BS-01 ~ BS-26

---

## §9 联动点

| 方向 | 技能 | 接口 |
|------|------|------|
| ←调用 | 全审++ | Step 3 调用，返回BS评分 |
| ←调用 | X+ | BUG猎杀自动调用 |
| →协同 | 地狱++ | 盲区发现→地狱深挖安全影响 |
| →输入 | 飞轮++ | 链路断裂→检查闭环完整性 |
| ←前置 | 业务++ | 确保数据项正确后再扫盲区 |
