# P34-PRD 团队文化方案库 (Solution Library)

> 子页面PRD | 隶属 M32 | v1.0 | 2026-04-08

## 0. 路径
- **列表**: `/team-culture/themes`
- **详情**: `/team-culture/themes/[slug]`

## 1. 竞品对标
- **Airbnb Experiences** — 卡片式沉浸图片
- **Trip.com 套餐** — 主题聚合 + 起价展示
- **Expedia Packages** — 「包含什么」明细清单

## 2. 6大文化主题包 (初始 seed)
| Slug | 主题 | 目标 | 核心仪式 | 对标信仰 |
|------|------|------|----------|----------|
| tongxin | 同心之旅 | 团队凝聚 | 共诵/同行 | 儒 / 佛 |
| ganen | 感恩之旅 | 回馈文化 | 供灯/奉茶 | 佛 / 道 / 神道 |
| chuancheng | 传承之旅 | 师徒交接 | 受印/立愿 | 曹溪印系 |
| jiangxin | 匠心之旅 | 工艺之美 | 观造/习艺 | 道 / 神道 |
| cibei | 慈悲之旅 | 公益同行 | 放生/施食 | 佛 / 基督 |
| jianyi | 坚毅之旅 | 逆境破局 | 登山/守夜 | 伊斯兰 / 锡克 |

## 3. 列表页
- Hero 小 + Filter (行业 / 人数区间 / 天数 / 预算)
- 主题卡片：封面图 + 标题 + 副标题 + 3 个关键词 tag + 起价 + 「查看方案」
- 分页 pageSize=12，服务端分页

## 4. 详情页 IA
1. Hero: 大图 + 标题 + 关键词 + 「立即询价」CTA
2. 文化内核: description + 对应信仰链接 → /religions/*
3. 推荐圣地: 调用 holy-sites by slug array (3-5 个卡片)
4. 推荐路线: 复用 route 卡片 (1-3 条)
5. 共修仪式清单 (rituals Json 渲染)
6. 行程示例: 时间线 4-7 天模板
7. 配套服务: 导师/摄影/交通/保险
8. 起价说明 + 询价CTA (底部 sticky)

## 5. 数据
- GET /api/team-culture/themes
- GET /api/team-culture/themes/:slug
- 详情页内嵌关联 holy-sites / routes (后端 populate 或前端 parallel fetch)

## 6. 验收
- [ ] 6 主题卡片数据从 API
- [ ] 详情页 404 处理 (notFound())
- [ ] sticky 询价按钮 mobile 可点击
- [ ] i18n 7 语言
- [ ] 图片 next/image 优化
- [ ] 分享按钮 (复用 ShareButton)
