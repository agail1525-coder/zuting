# M08 用户与认证 产品需求文档

> 版本: v1.0 | 日期: 2026-03-25 | 状态: v1已实现 / v2规划中

---

## 1. 需求背景与目标

### 1.1 背景

用户与认证模块是全平台的基础设施层，承载用户注册/登录/鉴权/角色管理。v1 实现了手机号/邮箱 + 密码的注册登录体系，采用 JWT 双 Token 机制(access 15min + refresh 7d)，全局 JwtAuthGuard 保护所有路由，`@Public()` 装饰器标记开放端点，`@Roles('ADMIN')` 控制管理员权限。v2 需接入微信小程序登录(wx.login → code2session)、手机验证码登录、Google OAuth 等社交登录方式。

### 1.2 目标

| 目标 | 指标 | 说明 |
|------|------|------|
| 注册转化率 | >50% | 访问注册页的用户完成注册的比例 |
| 登录成功率 | >98% | 登录请求中成功的比例 |
| Token 刷新成功率 | >99.5% | refresh token 续期成功率 |
| 安全事件率 | <0.1% | 异常登录/暴力破解检测 |

### 1.3 范围

| 范围 | v1 (已实现) | v2 (规划中) |
|------|-------------|-------------|
| 注册 | 手机/邮箱 + 密码 + 昵称 | — |
| 登录 | 手机/邮箱 + 密码 | 验证码登录、微信登录、Google OAuth |
| Token | JWT 双 Token(access 15m + refresh 7d) | — |
| 登出 | 清除 refreshToken | 多设备管理+单设备登出 |
| 用户信息 | GET /auth/me (含 _count) | 头像上传、资料编辑 |
| Session 管理 | Session 模型已定义 | 实际多设备 Session 跟踪 |
| 验证码 | VerificationCode 模型已定义 | 短信/邮件发送 |
| 角色权限 | PILGRIM/GUIDE/AMBASSADOR/ADMIN | 细粒度权限矩阵 |
| 账号安全 | — | 密码修改、账号注销、登录日志 |

---

## 2. 用户故事

### US-08-01: 新用户注册

**作为** 新用户，**我希望** 用手机号或邮箱快速注册账号，**以便** 开始使用平台功能。

**验收标准:**
- 必须提供手机号或邮箱(至少一项)
- 必须设置密码(>=8位，含字母和数字)
- 必须填写昵称
- 手机号/邮箱不可与已有账号重复(409 Conflict)
- 注册成功返回 accessToken + refreshToken
- 默认角色为 PILGRIM，默认语言 zh-CN

### US-08-02: 用户登录

**作为** 已注册用户，**我希望** 用手机号/邮箱 + 密码登录，**以便** 访问我的个人数据。

**验收标准:**
- 支持手机号或邮箱登录
- 密码错误返回 401 (不透露"用户不存在"还是"密码错误")
- 账号被禁用(isActive=false)返回 401
- 未设置密码(社交登录用户)返回 401 提示使用社交登录
- 登录成功更新 lastLoginAt，返回 token pair
- 登录成功后 accessToken 有效期 15 分钟

### US-08-03: Token 自动刷新

**作为** 已登录用户，**我希望** 在 accessToken 过期时自动续期，**以便** 不被频繁踢出登录。

**验收标准:**
- 前端拦截 401 响应，自动调用 POST /auth/refresh
- refreshToken 有效且匹配数据库记录时，返回新 token pair
- refreshToken 已被撤销(数据库不匹配)时返回 401
- refreshToken 过期(7天)时返回 401，需重新登录
- 刷新成功后旧 refreshToken 失效(单次使用)

### US-08-04: 用户查看个人资料

**作为** 已登录用户，**我希望** 查看我的个人资料和统计数据，**以便** 了解我的使用情况。

**验收标准:**
- 显示昵称、头像、角色、语言、创建时间、最后登录时间
- 显示统计: 行程数、订单数、日志数、修行记录数
- 显示手机号(部分脱敏)和邮箱(部分脱敏)
- 显示验证状态(手机已验证/邮箱已验证)

### US-08-05: 微信小程序自动登录 (v2)

**作为** 小程序用户，**我希望** 打开小程序后自动登录，**以便** 无需手动输入账号密码。

**验收标准:**
- 小程序启动时调用 wx.login() 获取 code
- 后端调用 code2session 获取 openId + sessionKey
- openId 已绑定用户: 直接返回 token pair
- openId 未绑定: 引导补充手机号(wx.getPhoneNumber)后创建账号
- 登录全程无密码输入

---

## 3. 业务流程

### 3.1 注册流程

```
用户                           API服务                     数据库
 │                               │                          │
 │  POST /auth/register          │                          │
 │  {phone?, email?,             │                          │
 │   password, nickname}         │                          │
 │ ────────────────────────────►│                          │
 │                               │  校验 phone || email      │
 │                               │  查重 phone ──────────►  │
 │                               │            ◄──────────── │ null / conflict
 │                               │  查重 email ──────────►  │
 │                               │            ◄──────────── │ null / conflict
 │                               │  bcrypt.hash(password,10) │
 │                               │  创建 User ────────────► │
 │                               │            ◄──────────── │ User
 │                               │  jwt.sign(access, 15m)    │
 │                               │  jwt.sign(refresh, 7d)    │
 │                               │  存储 refreshToken ─────►│
 │  ◄────────────────────────────│                          │
 │  {accessToken, refreshToken,  │                          │
 │   expiresIn: 900}             │                          │
```

### 3.2 登录流程

```
用户                           API服务                     数据库
 │                               │                          │
 │  POST /auth/login             │                          │
 │  {phone/email, password}      │                          │
 │ ────────────────────────────►│                          │
 │                               │  查找用户 ──────────────►│
 │                               │            ◄──────────── │ User / null
 │                               │  null → 401               │
 │                               │  !isActive → 401          │
 │                               │  !passwordHash → 401      │
 │                               │  bcrypt.compare()         │
 │                               │  不匹配 → 401             │
 │                               │  更新 lastLoginAt ──────►│
 │                               │  生成 token pair          │
 │                               │  存储 refreshToken ─────►│
 │  ◄────────────────────────────│                          │
 │  {accessToken, refreshToken,  │                          │
 │   expiresIn: 900}             │                          │
```

### 3.3 Token 刷新流程

```
前端                           API服务                     数据库
 │                               │                          │
 │  请求某API → 收到 401          │                          │
 │                               │                          │
 │  POST /auth/refresh           │                          │
 │  {refreshToken}               │                          │
 │ ────────────────────────────►│                          │
 │                               │  jwt.verify(refreshToken) │
 │                               │  解析出 sub (userId)      │
 │                               │  查找用户 ──────────────►│
 │                               │            ◄──────────── │ User
 │                               │  比对 user.refreshToken   │
 │                               │  不匹配 → 401 (已撤销)    │
 │                               │  生成新 token pair        │
 │                               │  更新 refreshToken ─────►│
 │  ◄────────────────────────────│                          │
 │  {accessToken, refreshToken,  │                          │
 │   expiresIn: 900}             │                          │
 │                               │                          │
 │  用新 accessToken 重试原请求    │                          │
```

### 3.4 登出流程

```
用户                           API服务                     数据库
 │                               │                          │
 │  POST /auth/logout            │                          │
 │  [Authorization: Bearer xxx]  │                          │
 │ ────────────────────────────►│                          │
 │                               │  从 JWT 解析 userId       │
 │                               │  清除 refreshToken ─────►│
 │                               │  data: {refreshToken:null}│
 │  ◄────────────────────────────│                          │
 │  {message: "Logged out"}      │                          │
 │                               │                          │
 │  前端清除本地 token            │                          │
```

### 3.5 微信小程序登录流程 (v2)

```
小程序                         API服务                   微信服务器
 │                               │                          │
 │  wx.login() → code            │                          │
 │                               │                          │
 │  POST /auth/wechat-login      │                          │
 │  {code}                       │                          │
 │ ────────────────────────────►│                          │
 │                               │  code2session ──────────►│
 │                               │            ◄──────────── │ {openid, session_key}
 │                               │  查找 wechatOpenId ─────►│ DB
 │                               │                          │
 │                    ┌──────────┴──────────┐               │
 │                    │                     │               │
 │              已绑定用户             未绑定用户              │
 │                    │                     │               │
 │             返回 token pair        返回 needBind=true     │
 │                    │                     │               │
 │  ◄─────────────────┘                     │               │
 │                                          │               │
 │  wx.getPhoneNumber → phoneCode           │               │
 │  POST /auth/wechat-bind                  │               │
 │  {openId, phoneCode}                     │               │
 │ ────────────────────────────────────────►│               │
 │                               │  getPhoneNumber ────────►│
 │                               │            ◄──────────── │ {phoneNumber}
 │                               │  创建/绑定用户            │
 │  ◄────────────────────────────│                          │
 │  {accessToken, refreshToken}  │                          │
```

### 3.6 业务规则表

| 规则ID | 规则 | 说明 |
|--------|------|------|
| BR-08-01 | 注册必须提供 phone 或 email | 至少一项，可同时提供 |
| BR-08-02 | phone / email 全局唯一 | 重复返回 409 Conflict |
| BR-08-03 | 密码 bcrypt hash(cost=10) | 不存储明文 |
| BR-08-04 | accessToken 有效期 15 分钟 | JWT exp claim |
| BR-08-05 | refreshToken 有效期 7 天 | JWT exp claim |
| BR-08-06 | refreshToken 单点存储 | 数据库只保留最新一个，刷新时覆盖 |
| BR-08-07 | 登录错误不区分原因 | 统一返回 "Invalid credentials" |
| BR-08-08 | isActive=false 禁止登录 | 管理员可禁用账号 |
| BR-08-09 | 全局 JwtAuthGuard | 所有路由默认需认证 |
| BR-08-10 | @Public() 跳过认证 | 标记开放端点(列表/详情等) |
| BR-08-11 | @Roles('ADMIN') | 管理员专属操作 |
| BR-08-12 | v2: 密码最少8位 | 含字母+数字 |
| BR-08-13 | v2: 登录失败5次锁定15分钟 | 防暴力破解 |
| BR-08-14 | v2: 手机号脱敏显示 | 138****1234 |

---

## 4. 功能清单

| 功能ID | 功能名称 | 优先级 | 版本 | 端 | 说明 |
|--------|---------|--------|------|-----|------|
| F08-01 | 手机/邮箱注册 | P0 | v1 | Web/App/Mini | phone/email + password + nickname |
| F08-02 | 手机/邮箱登录 | P0 | v1 | Web/App/Mini/Admin | phone/email + password |
| F08-03 | Token 刷新 | P0 | v1 | 全端 | refreshToken → 新 token pair |
| F08-04 | 登出 | P0 | v1 | 全端 | 清除 refreshToken |
| F08-05 | 获取当前用户 | P0 | v1 | 全端 | GET /auth/me 含统计 _count |
| F08-06 | 全局 JWT 守卫 | P0 | v1 | API | JwtAuthGuard + @Public() |
| F08-07 | 角色守卫 | P0 | v1 | API | RolesGuard + @Roles() |
| F08-08 | 微信登录 | P0 | v2 | Mini/App | wx.login + code2session |
| F08-09 | 手机验证码登录 | P1 | v2 | Web/App/Mini | 发送短信 + 验证码校验 |
| F08-10 | Google OAuth | P1 | v2 | Web/App | Google Sign-In |
| F08-11 | 个人资料编辑 | P1 | v2 | Web/App/Mini | 昵称、头像、语言 |
| F08-12 | 头像上传 | P1 | v2 | Web/App/Mini | OSS 上传+裁剪 |
| F08-13 | 密码修改 | P1 | v2 | Web/App | 旧密码验证+新密码设置 |
| F08-14 | 账号注销 | P2 | v2 | Web/App/Mini | GDPR 合规，30天冷静期 |
| F08-15 | 多设备 Session | P2 | v2 | Web/App | 查看和管理登录设备 |
| F08-16 | 登录日志 | P2 | v2 | Admin | IP、设备、时间记录 |

---

## 5. 数据模型

### 5.1 实体关系

```
User 1──────* Session
User 1──────* Trip
User 1──────* Order
User 1──────* JournalEntry
User 1──────* Practice
VerificationCode (独立表, 通过 target 关联)
```

### 5.2 字段表

**User (用户) — 已实现**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| phone | String | 否 | — | 手机号, unique |
| email | String | 否 | — | 邮箱, unique |
| wechatOpenId | String | 否 | — | 微信 OpenID, unique |
| googleId | String | 否 | — | Google ID, unique |
| nickname | String | 是 | — | 昵称 |
| avatar | String | 否 | — | 头像 URL |
| role | UserRole | 是 | PILGRIM | 角色(枚举) |
| language | String | 是 | zh-CN | 语言偏好 |
| passwordHash | String | 否 | — | bcrypt 密码哈希 |
| refreshToken | String | 否 | — | 当前 refresh token |
| emailVerified | Boolean | 是 | false | 邮箱已验证 |
| phoneVerified | Boolean | 是 | false | 手机已验证 |
| lastLoginAt | DateTime | 否 | — | 最后登录时间 |
| isActive | Boolean | 是 | true | 账号是否启用 |
| createdAt | DateTime | 是 | now() | 注册时间 |
| updatedAt | DateTime | 是 | auto | 更新时间 |

**Session (会话) — 已定义**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| userId | String | 是 | — | 关联用户 |
| token | String | 是 | — | session token, unique |
| deviceInfo | String | 否 | — | 设备信息(UA/型号) |
| ipAddress | String | 否 | — | 登录 IP |
| expiresAt | DateTime | 是 | — | 过期时间 |
| createdAt | DateTime | 是 | now() | 创建时间 |

**VerificationCode (验证码) — 已定义**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | String (cuid) | 是 | auto | 主键 |
| target | String | 是 | — | 目标(手机号/邮箱) |
| code | String | 是 | — | 6位数字验证码 |
| type | String | 是 | — | 类型: REGISTER/LOGIN/RESET_PASSWORD |
| expiresAt | DateTime | 是 | — | 过期时间(5分钟) |
| used | Boolean | 是 | false | 是否已使用 |
| createdAt | DateTime | 是 | now() | 创建时间 |

### 5.3 角色枚举

| 角色 | 说明 | 权限 |
|------|------|------|
| PILGRIM | 朝圣者(默认) | 个人行程/订单/日志 CRUD; 浏览公开内容 |
| GUIDE | 导游 | PILGRIM 权限 + 接单/带团/导游资料 |
| AMBASSADOR | 文化大使 | PILGRIM 权限 + 发布官方内容/组织活动 |
| ADMIN | 管理员 | 全部权限: 所有 CRUD + 用户管理 + 数据统计 |

### 5.4 角色权限矩阵

| 资源 | PILGRIM | GUIDE | AMBASSADOR | ADMIN |
|------|---------|-------|------------|-------|
| 宗教/圣地/祖庭/祖师/祖训/印 (读) | O | O | O | O |
| 行程 (自己的 CRUD) | O | O | O | O |
| 行程 (所有人) | X | X | X | O |
| 行程确认/状态管理 | X | X | X | O |
| 订单 (自己的) | O | O | O | O |
| 订单 (所有人+退款审批) | X | X | X | O |
| 日志 (自己的 CRUD) | O | O | O | O |
| 日志 (公开列表读) | O | O | O | O |
| 日志 (所有人+审核) | X | X | X | O |
| 小鸿 AI 聊天 | O | O | O | O |
| 用户管理 | X | X | X | O |
| 导游接单 | X | O | X | O |
| 发布官方内容 | X | X | O | O |
| Admin 后台访问 | X | X | X | O |

---

## 6. API 接口

### v1 已实现

| # | 方法 | 路径 | 认证 | 说明 | 请求体/参数 | 响应 |
|---|------|------|------|------|------------|------|
| 1 | POST | /api/auth/register | @Public | 注册 | `{phone?, email?, password, nickname}` | `{accessToken, refreshToken, expiresIn}` |
| 2 | POST | /api/auth/login | @Public | 登录 | `{phone?, email?, password}` | `{accessToken, refreshToken, expiresIn}` |
| 3 | POST | /api/auth/refresh | @Public | 刷新Token | `{refreshToken}` | `{accessToken, refreshToken, expiresIn}` |
| 4 | POST | /api/auth/logout | JWT | 登出 | 无(从JWT取userId) | `{message}` |
| 5 | GET | /api/auth/me | JWT | 当前用户 | 无 | User (含 _count) |

### v2 新增

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 6 | POST | /api/auth/wechat-login | @Public | 微信登录(code) |
| 7 | POST | /api/auth/wechat-bind | @Public | 微信绑定手机号 |
| 8 | POST | /api/auth/send-code | @Public | 发送验证码(手机/邮箱) |
| 9 | POST | /api/auth/code-login | @Public | 验证码登录 |
| 10 | GET | /api/auth/google | @Public | Google OAuth 跳转 |
| 11 | GET | /api/auth/google/callback | @Public | Google OAuth 回调 |
| 12 | PATCH | /api/auth/profile | JWT | 更新个人资料 |
| 13 | POST | /api/auth/change-password | JWT | 修改密码 |
| 14 | POST | /api/auth/delete-account | JWT | 申请注销账号 |
| 15 | GET | /api/auth/sessions | JWT | 我的登录设备列表 |
| 16 | DELETE | /api/auth/sessions/:id | JWT | 移除指定设备 |

---

## 7. 多端页面规格

### 7.1 Web 端

#### 页面: /login — 登录

| 项目 | 说明 |
|------|------|
| 布局 | 全屏居中卡片; 左侧: 品牌图(祖庭剪影+金色标语); 右侧: 登录表单 |
| 表单字段 | 手机号/邮箱 输入框(自动检测格式) + 密码输入框(可切换明文) + "记住我"复选框 + "登录"按钮 |
| 底部链接 | "没有账号? 立即注册" → /register; v2: "忘记密码?" → 重置流程 |
| v2 社交登录 | 分割线"或者" + Google 登录按钮 |
| 错误处理 | 输入校验(实时); 登录失败红色提示; 禁用账号特殊提示 |
| 设计 | 背景 #020617; 卡片 #0f172a; 金色边框 #D4A855; 输入框 #1e293b |

#### 页面: /register — 注册

| 项目 | 说明 |
|------|------|
| 布局 | 与登录页同结构; 表单: 昵称 + 手机号 + 邮箱(选填) + 密码 + 确认密码 + "注册"按钮 |
| 密码强度 | 实时显示密码强度条(弱/中/强); >=8位+字母+数字为强 |
| 底部链接 | "已有账号? 立即登录" → /login |

#### 页面: /profile — 个人中心

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 头像+昵称+角色Badge; 统计: 行程数/订单数/日志数/修行数 四宫格; 菜单列表: 个人资料/我的行程/我的订单/我的日志/设置/退出登录 |
| 头像 | 点击可更换(v2: 裁剪上传); 默认头像使用首字母生成 |
| 统计 | 调用 GET /auth/me 的 _count 字段 |
| 退出 | 点击弹窗确认 → 调用 logout → 清除 localStorage → 跳转 /login |

### 7.2 App 端 (Expo React Native)

#### 页面: /login — 登录

| 项目 | 说明 |
|------|------|
| 布局 | 全屏: 顶部品牌Logo+标语(动画渐入) → 表单区 → 底部社交登录 |
| 表单 | 手机号/邮箱 TextInput + 密码 TextInput(SecureTextEntry) + "登录"按钮(金色渐变) |
| 键盘 | KeyboardAvoidingView; 输入框获得焦点时自动上滚 |
| 生物识别 | v2: FaceID/TouchID 快速登录(存储 refreshToken 在 SecureStore) |

#### 页面: Profile Tab — 我的

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 头像+昵称+角色(暗色横幅背景); 统计卡片(横向滚动); 菜单列表(SectionList) |
| 菜单 | 个人资料 → 我的行程 → 我的订单 → 我的日志 → 我的修行 → 语言设置 → 关于 → 退出 |
| 头像 | 点击 ActionSheet: 拍照/相册/取消 |

### 7.3 小程序端 (Taro)

#### 登录方式

| 项目 | 说明 |
|------|------|
| 首次启动 | wx.login() → code → POST /auth/wechat-login; 已绑定则自动登录; 未绑定弹出授权手机号 |
| 手机号授权 | `<button open-type="getPhoneNumber">` → phoneCode → POST /auth/wechat-bind |
| Token 存储 | wx.setStorageSync('accessToken') + wx.setStorageSync('refreshToken') |

#### 页面: /profile — 个人中心

| 项目 | 说明 |
|------|------|
| 布局 | 顶部: 头像+昵称(点击可修改); 统计四宫格; 菜单列表(Taro List) |
| 菜单 | 我的行程/我的订单/我的日志/修行记录/设置/关于 |
| 登出 | 清除 storage + wx.reLaunch 到首页 |

### 7.4 Admin 后台

#### 页面: /login — 管理员登录

| 项目 | 说明 |
|------|------|
| 布局 | 居中卡片: "祖庭管理后台"标题 + 邮箱输入 + 密码输入 + 登录按钮 |
| 校验 | 登录后检查 role === 'ADMIN'，非管理员跳转 403 页面 |
| 设计 | 简洁风格; 卡片白色; 主色 #D4A855 |

#### 用户管理 (v2)

| 项目 | 说明 |
|------|------|
| 布局 | 筛选栏(角色/状态/搜索) + Ant Design Table + 分页 |
| 表格列 | ID、昵称、手机号(脱敏)、邮箱(脱敏)、角色(Tag)、状态(启用/禁用)、注册时间、最后登录、操作 |
| 操作 | 查看详情; 修改角色(下拉); 启用/禁用 toggle; v2: 查看登录日志 |
| 统计 | 顶部卡片: 总用户数、今日新增、活跃用户(7天内登录)、各角色分布 |

---

## 8. 埋点需求

| 事件名 | 触发时机 | 参数 | 说明 |
|--------|---------|------|------|
| `auth_register` | 注册成功 | userId, method(phone/email), platform | 注册量 |
| `auth_register_fail` | 注册失败 | reason(duplicate/validation), method | 注册失败分析 |
| `auth_login` | 登录成功 | userId, method(phone/email/wechat/google), platform | 登录量+方式分布 |
| `auth_login_fail` | 登录失败 | reason(invalid/disabled/no_password), method | 登录失败分析 |
| `auth_refresh` | Token刷新 | userId, success(bool) | 续期健康度 |
| `auth_logout` | 主动登出 | userId, platform | 登出分析 |
| `auth_wechat_login` | 微信登录 | userId, isNewUser, platform | v2 微信登录 |
| `auth_password_change` | 修改密码 | userId | v2 安全操作 |
| `auth_profile_update` | 更新资料 | userId, changedFields[] | 资料编辑 |
| `profile_page_view` | 查看个人中心 | userId, platform | 页面访问 |
| `auth_session_delete` | 移除登录设备 | userId, sessionId | v2 设备管理 |
