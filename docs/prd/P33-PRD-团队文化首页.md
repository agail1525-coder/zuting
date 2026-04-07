# P33-PRD 团队文化首页 (Team Culture Landing)

> 子页面PRD | 隶属 M32 | Owner: CEO++ | v1.0 | 2026-04-08

## 0. 路径与定位
- **路由**: `/team-culture`
- **页面角色**: B端品牌着陆页 + 转化漏斗入口
- **目标用户**: HR / 创始人 / 教导主任 / 宗教组织负责人

## 1. 竞品对标 (SCP-02)
| 竞品 | 借鉴点 |
|------|--------|
| Airbnb Experiences for Work | 主视觉大图 + 价值主张三栏 + 客户Logo墙 |
| AmEx Travel Corporate | 高端质感 + 真人案例 + 行动卡片 |
| Booking for Business | 表单极简、CTA明显、信任要素前置 |

## 2. 信息架构 (Top → Bottom)
1. **Hero**: 全屏暗色殿堂背景 + 主标语「让朝圣成为团队最深的纪念」+ 副标语 + 双 CTA「免费方案咨询 / 浏览主题包」
2. **价值主张三栏**: 文化深度 / 全球祖庭 / 定制化共修
3. **6大文化主题包卡片网格** (复用 TeamCultureTheme，链接到 P34)
4. **行业解决方案 Tab**: 企业 / 学校 / 宗教 / 家族 / NGO / 政府
5. **客户案例轮播** (取最近4个 published case)
6. **流程时间线**: 询价 → 方案 → 签约 → 行前 → 朝圣 → 沉淀
7. **信任要素**: 60圣地 / 12大信仰 / 27祖庭 / 服务团队数
8. **询价表单** (锚点 #inquiry，提交到 POST /api/team-culture/inquiries)
9. **常见问题** (静态 i18n)
10. **Footer CTA**: 「与我们的文化顾问对话」

## 3. 数据来源
| 区块 | API |
|------|-----|
| 主题卡片 | GET /api/team-culture/themes?limit=6 |
| 案例轮播 | GET /api/team-culture/cases?limit=4 |
| 信任数字 | 复用 stats 端点 (无则前端硬编码常量 + i18n) |
| 询价提交 | POST /api/team-culture/inquiries |

## 4. 组件清单
- `TeamCultureHero`
- `TeamValueProps`
- `TeamThemeGrid`
- `TeamIndustryTabs`
- `TeamCaseCarousel`
- `TeamProcessTimeline`
- `TeamTrustNumbers`
- `TeamInquiryForm` (受控 + zod + react-hook-form)
- `TeamFAQ`

## 5. 验收 (V1-V5 + 三态)
- [ ] tsc 0 错
- [ ] loading skeleton / error retry / empty state 全有
- [ ] 移动端 ≤ 768 单列响应
- [ ] i18n 7 语言键齐全 (`team_culture.*`)
- [ ] 询价表单：手机号正则 + 必填校验 + 提交后 toast + 防双提交
- [ ] 暗色主题一致 (#0f172a 系)
- [ ] 首屏 LCP ≤ 2.5s

## 6. 反向校验 (业务++ Q3)
去掉 Hero 双CTA → 转化率为零 ✅
去掉案例 → 信任度断 ✅
去掉询价表单 → 漏斗中断 ✅
全部不可去除。
