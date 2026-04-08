# M34-PRD-个人成长模块 (Personal Growth)

> 企业家信仰系统三部曲之一 | 个人 → 家庭 → 企业 闭环

## 1. 概述

### 1.1 模块定位
**企业家自我进化系统** — 从普通创业者到跨国集团董事长的心灵修炼之旅。
通过12种不同信仰的智慧，为企业家提供系统化的个人精神成长路径。

### 1.2 与团队文化模块的差异
| 维度 | 团队文化(B2B) | 个人成长(B2C) |
|------|-------------|-------------|
| 目标用户 | 企业团队/高管圈 | 个人企业家/创业者 |
| 核心价值 | 组织凝聚力/文化传承 | 个人觉醒/心智升级 |
| 服务形式 | 团队定制方案 | 个人深度修行 |
| 视觉风格 | 蓝色科技感 | 暖金色禅意风 |
| 价格定位 | ¥3,880-6,880/人 | ¥1,280-3,880/人 |
| 行程特色 | 团建+文化共修 | 独处+深度冥想+导师1对1 |

### 1.3 竞品对标
- **灵鹫山心道法师企业禅修** — 个人CEO静修营
- **日本永平寺参禅体验** — 深度个人修行
- **印度瑜伽静修所** — Rishikesh个人灵修
- **Tony Robbins领袖峰会** — 企业家心理突破
- **Vipassana十日禅** — 最纯粹的个人修行

## 2. 用户画像

### 2.1 核心用户
| 阶段 | 画像 | 痛点 |
|------|------|------|
| 创业初期 | 25-35岁，首次创业 | 焦虑/方向迷茫/压力过大 |
| 成长期 | 35-45岁，企业10-100人 | 决策疲劳/合伙人矛盾/家庭失衡 |
| 成熟期 | 45-55岁，企业100-1000人 | 意义危机/传承焦虑/健康透支 |
| 巅峰期 | 50-65岁，集团级 | 精神空虚/遗产规划/灵性觉醒 |

## 3. 六大主题包设计

### 3.1 觉醒之旅 (Awakening) — 创业者初心回溯
- **核心维度**: 自我认知
- **信仰基础**: 佛教·禅宗 (少林寺/达摩面壁洞)
- **目标**: 帮助创业者突破"忙碌陷阱"，找回初心
- **关键修行**: 禅坐·断舍离·面壁三天
- **颜色**: #D4A855 (暗金)
- **图标**: 🌅
- **天数**: 3天
- **价格**: ¥1,880/人

### 3.2 定力之旅 (Fortitude) — 决策者心智锻造
- **核心维度**: 心智韧性
- **信仰基础**: 道教 (武当山/青城山)
- **目标**: 在不确定中保持定力，修炼"不动心"
- **关键修行**: 太极·辟谷·道家呼吸法
- **颜色**: #6B8E6B (松绿)
- **图标**: 🏔️
- **天数**: 4天
- **价格**: ¥2,280/人

### 3.3 格局之旅 (Vision) — 从管理者到领袖
- **核心维度**: 战略格局
- **信仰基础**: 儒教 (曲阜孔庙/白鹿洞书院)
- **目标**: 从"管事"到"管人"到"管心"的跃迁
- **关键修行**: 经典研读·书院夜话·君子六艺
- **颜色**: #8B4513 (沉木)
- **图标**: 📜
- **天数**: 3天
- **价格**: ¥1,680/人

### 3.4 重生之旅 (Rebirth) — 中年危机突破
- **核心维度**: 生命重塑
- **信仰基础**: 基督教 (耶路撒冷/梵蒂冈朝圣之路)
- **目标**: 直面"半生已过"的存在焦虑，找到重生力量
- **关键修行**: 朝圣徒步·忏悔仪式·生命叙事
- **颜色**: #7B3F00 (赤褐)
- **图标**: 🕊️
- **天数**: 5天
- **价格**: ¥3,880/人

### 3.5 慈悲之旅 (Compassion) — 从成功到意义
- **核心维度**: 利他觉醒
- **信仰基础**: 藏传佛教 (拉萨/尼泊尔蓝毗尼)
- **目标**: 超越物质成功，找到"为何活着"的终极答案
- **关键修行**: 转山·供灯·与活佛对话
- **颜色**: #9B2335 (绛红)
- **图标**: 🪷
- **天数**: 4天
- **价格**: ¥3,280/人

### 3.6 传灯之旅 (Legacy) — 企业家精神遗产
- **核心维度**: 智慧传承
- **信仰基础**: 多信仰融合 (曹溪南华寺+嵩山少林+终南山)
- **目标**: 50+企业家，把一生经验凝练为可传承的精神遗产
- **关键修行**: 立遗嘱仪式·传灯法会·导师认证
- **颜色**: #C49B3C (琥珀金)
- **图标**: 🏮
- **天数**: 5天
- **价格**: ¥3,880/人

## 4. richContent结构 (每个主题包)

```typescript
{
  dimension: { code, label, kicker },
  entrepreneurPainPoint: {  // 替代founderPainPoint
    title, body,
    signs: string[],  // 5个危险信号
    stage: string,    // 适合哪个企业家阶段
  },
  philosophy: {
    title, body,
    quotes: Array<{ source, text, translation? }>,
  },
  dailyItinerary: Array<{
    day, title, location,
    dawn?: string,    // 黎明修行(个人特色)
    morning, afternoon, evening,
    soloTime?: string, // 独处时间(个人特色)
    rituals: string[],
  }>,
  mentorProfile: {  // 替代mentorTeam，单个导师深度介绍
    name, title, bio,
    expertise: string[],
    philosophy: string,
  },
  transformationPath: string[], // 替代deliverables，个人蜕变路径
  targetAudience: string[],
  testimonials: Array<{  // 个人见证(替代whyZuting)
    name, role, company,
    quote: string,
    before: string,
    after: string,
  }>,
  gallery: string[],
}
```

## 5. 页面设计

### 5.1 落地页 (/personal-growth)
- **Hero**: 暖金色渐变(#D4A855→#8B6914)，标题"企业家觉醒之旅"
- **进化阶梯**: 4阶段企业家成长路径可视化 (创业→成长→成熟→巅峰)
- **6大主题卡片**: 暗色殿堂风卡片，金色边框
- **蜕变故事**: 3个真实案例对比(Before/After)
- **数据说话**: 300+圣地 / 12信仰 / 1对1导师 / 30天跟踪
- **咨询表单**: 简化版(姓名/电话/当前角色/最大挑战/期望)

### 5.2 主题列表页 (/personal-growth/themes)
### 5.3 主题详情页 (/personal-growth/themes/:slug)
### 5.4 案例列表页 (/personal-growth/cases)
### 5.5 案例详情页 (/personal-growth/cases/:slug)

## 6. API契约

### 6.1 公开端点
| Method | Path | Description |
|--------|------|-------------|
| GET | /personal-growth/themes | 主题包列表 |
| GET | /personal-growth/themes/:slug | 主题详情 |
| GET | /personal-growth/cases | 案例列表 |
| GET | /personal-growth/cases/:slug | 案例详情 |
| POST | /personal-growth/inquiries | 提交咨询(限流5/min) |

### 6.2 Admin端点
| Method | Path | Description |
|--------|------|-------------|
| POST | /admin/personal-growth/themes | 创建/更新主题 |
| POST | /admin/personal-growth/cases | 创建/更新案例 |
| GET | /admin/personal-growth/inquiries | 咨询列表 |
| PATCH | /admin/personal-growth/inquiries/:id/status | 更新状态 |
| GET | /admin/personal-growth/stats | 统计数据 |

## 7. 验收标准
- [ ] 6个主题包数据完整(richContent全字段)
- [ ] Landing页暖金色风格，非蓝色
- [ ] 进化阶梯可视化组件
- [ ] 咨询表单可提交
- [ ] API全部Public路由可访问
- [ ] Swagger文档完整
- [ ] 导航栏可达
