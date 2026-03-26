
---
[2026-03-27 07:17] Task: miniprogram-fix-auth-hardcoded-localhost
文件: apps/miniprogram/src/lib/auth.ts
发现: auth.ts 和 api.ts 各自独立定义 API_URL/BASE_URL，auth.ts 忘记用环境变量导致生产认证全挂
原因: auth.ts 是后加的模块，复制时没同步 api.ts 的环境变量逻辑
解法: 用相同的 process.env.TARO_APP_API_URL + NODE_ENV fallback 模式。理想状态是抽取为共享常量避免重复
