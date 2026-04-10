# M37-PRD-圆满之路修行系统 (Path of Fulfillment · Gated Cultivation)

> 佳绩之旅增量模块 | 禅宗十牛图为骨 × 12文化为血肉 | **权限门控子系统**
> 不覆盖主站旅行风格, 隐藏在"我的行程"内, 需资格或邀请方可进入

## 0. 元数据
- **模块代号**: M37
- **产品等级**: 深度功能模块 (非主轴)
- **主视觉锚**: 禅宗 · 十牛图
- **文化覆盖**: 12文化传统同构
- **关联模块**: M05(行程) M36(信仰力评估) M22(二级分销邀请码) M20(会员) M27(商家)

## 1. 产品定位 — 关键澄清

### 1.1 佳绩之旅是什么
**佳绩之旅 JOINUS.COM 是全球宗教文化旅行平台**, 主业是:
- 12文化传统 × 300圣地内容浏览
- 路线+行程+订单+支付 商业闭环
- 攻略社区+评价+收藏
- 品牌风格: 深蓝殿堂风, 旅行网站语境

### 1.2 跨宗合愿 — 核心哲学
**M37 不是 12 宗教的拼盘, 而是一棵树**:
- **主干**: 禅宗 (因其最贴近"直指本心"的纯粹方法论, 且符号系统十牛图最普适)
- **十二大枝**: 12 文化各自的觉悟路径平行映射到主干
- **众多花叶**: 各文化独有的优秀子系统作为补充注解 (如苏菲旋舞/犹太卡巴拉/印度脉轮/萨满灵境等)
- **同根**: 七境界是普适的人类心智成长规律, 不属任何一家
- **同果**: 都指向"圆融/归家/布施" — 觉悟者回到人间利益众生

**禅宗为主线的理由**:
1. 十牛图天然是 10 阶段进度条, 最适合做 UX 主框架
2. 公案/参禅是"问题-觉悟"模型, 最适合 AI 融通问答
3. 不立文字意味着可承载所有文化的语言, 而非束缚于某教典
4. 历史上禅宗本身就是融合体 (印度禅+中国老庄+本土实践)

**他宗补充原则**:
某些文化在某境界有独特的优秀方法, 用 ✨ 标注:
- 苏菲旋舞 (Sema) 在"忘牛存人"境界独步
- 卡巴拉生命之树在"返本还源"境界提供精密地图
- 印度 7 脉轮系统在身心合一上有独到层次
- 萨满灵境之旅 (Vision Quest) 在"寻牛"境界最直接
- 道教内丹术在"得牛/牧牛"提供完整生理化路线
- 这些独特子系统作为 **可选深修包**, 在对应境界向用户开放

### 1.3 M37 是什么
**M37 是藏在"我的行程"内的深度修行子系统**, 不是主站。
- 针对少数已通过资格审核的"修行者"用户
- 入口必须点进 `/trips` 页 → 看到第4张卡「我的修行」→ 需要权限验证
- 未授权用户: 看到申请页, 展示修行愿景+申请入口
- 已授权用户: 解锁七轴完整体验 (罗盘/十牛图/每日印/融通问答/因缘日志/三生/直播堂)

### 1.3 为什么要门禁
- **内容敏感性**: 跨宗教的深度指导需要成熟心智, 避免误解/冒犯
- **品牌保护**: 旅行网站的大众流量不应被修行内容直接冲击
- **社群质量**: 修行圈需要纯净, 防止低质涌入稀释
- **商业模式**: 稀缺性即高端付费/会员/B2B导师服务的基础

### 1.4 不做什么
- ❌ 不接管主站首页
- ❌ 不改变现有 /trips 页的旅行网站定位
- ❌ 不挤压文化传统/圣地/路线/订单的主业流量
- ❌ 不强制所有用户使用修行功能

## 2. 入口与导航

### 2.1 入口位置 — 我的行程页
基于当前截图, `/trips` 页已有「人生三部曲·祖庭文化之旅」三张卡:
```
┌────────────────────────────────────────────────┐
│ 人生三部曲 · 祖庭文化之旅                       │
│ 个人圆满·家庭和谐·企业兴旺 — 达到自性圆满的境地 │
├────────────────────────────────────────────────┤
│ [个人文化之旅] [家庭文化之旅] [企业/团队文化之旅] [🔒 我的修行] │
│    0 个行程       0 个行程        0 个行程       需要资格     │
└────────────────────────────────────────────────┘
```
**第4张卡 = M37 入口**, 右上角小锁图标.

### 2.2 点击后的两条分支
```
点击「我的修行」卡
      │
      ├── 未授权 → /trips/cultivation/apply
      │          (申请页: 愿景展示+申请表单)
      │
      └── 已授权 → /trips/cultivation
                 (罗盘首页, 完整七轴体验)
```

### 2.3 路由树 (全部在 /trips/cultivation/* 下, 不抢占根路径)
```
/trips/cultivation/apply           # 申请页 (Public 可达, 未授权看到)
/trips/cultivation                 # 修行罗盘首页 (需资格)
/trips/cultivation/ox-path         # 十牛图路径
/trips/cultivation/daily-seal      # 每日一印
/trips/cultivation/synthesis       # 融通问答
/trips/cultivation/karma-journal   # 因缘日志
/trips/cultivation/three-lives     # 三生愿景
/trips/cultivation/live-dharma     # 活佛直播堂
/trips/cultivation/circle          # 修行圈 (邀请管理)
```

## 3. 权限门控设计

### 3.1 资格字段
```prisma
model User {
  // ... existing fields
  cultivationAccess     Boolean   @default(false)  // 是否有修行资格
  cultivationGrantedBy  String?   // 授权人 (admin userId 或 邀请人 userId)
  cultivationGrantedAt  DateTime?
  cultivationRole       CultivationRole @default(NONE)
}

enum CultivationRole {
  NONE       // 无资格
  SEEKER     // 求道者 (已申请待审)
  PRACTITIONER // 修行者 (基础资格)
  MENTOR     // 导师 (可邀请他人)
  MASTER     // 大师 (可开活佛直播)
}
```

### 3.2 获取资格的三条路径

| 路径 | 说明 | 审核方 |
|------|------|-------|
| 1. **管理员授权** | 用户在申请页填表, admin 在后台审核通过 | 超级管理员 |
| 2. **导师邀请** | 已有 MENTOR+ 角色的用户生成邀请码 (类似 M22) | 导师本人, 每月限额 |
| 3. **付费晋级** | 通过 M36 信仰力评估 + 购买年度修行会员 | 系统自动 |

### 3.3 守卫实现
```typescript
// services/api/src/modules/cultivation/guards/cultivation-access.guard.ts
@Injectable()
export class CultivationAccessGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user?.cultivationAccess) {
      throw new ForbiddenException('需要修行资格。请先申请或使用邀请码。');
    }
    return true;
  }
}

// 使用
@UseGuards(JwtAuthGuard, CultivationAccessGuard)
@Controller('cultivation/compass')
export class CompassController { ... }
```

Web 端同步: 未授权访问 /trips/cultivation/* (除 /apply) → 客户端 redirect 到 /trips/cultivation/apply.

## 3.5 跨宗合愿体系 — 禅宗为主线 × 12文化全对照 (核心设计)

### 3.5.1 七境界 × 十牛图 (主干, 普适)
```
境界 1: 初觉 Awakening    — 寻牛  — 意识到有"牛"存在
境界 2: 明心 Clarifying   — 见迹  — 看到牛的足迹
境界 3: 见性 Seeing       — 见牛  — 亲见牛的真身
境界 4: 证道 Attaining    — 得牛+牧牛 — 制服并驯化
境界 5: 圆融 Integrating  — 骑牛归家+忘牛存人 — 牛人合一
境界 6: 归家 Returning    — 人牛俱忘+返本还源 — 空亦空
境界 7: 布施 Giving Back  — 入廛垂手 — 入世利他
```

### 3.5.2 12文化全对照表 (一字千金, 七境界 × 12文化 = 84 核心条目)

下表每一格包含: **境界符号 | 原典关键词 | 经典出处**.
✨ 标记表示该文化在该境界有独特优秀子系统, 详见 §3.5.3 深修包.

| 境界 | 1.禅宗(主) | 2.道教 | 3.儒家 | 4.藏传 | 5.印度教 | 6.锡克 |
|------|-----------|--------|--------|--------|----------|--------|
| **初觉** | 寻牛<br/>"茫茫拨草去追寻"<br/>《十牛图颂》 | 问道<br/>"上士闻道勤而行"<br/>《道德经·41》 | 立志<br/>"吾十有五而志于学"<br/>《论语·为政》 | 皈依<br/>"诸佛正法贤圣僧"<br/>《四皈依文》 | 求师 Guru-Khoj<br/>"欲得真智当亲近师"<br/>《薄伽梵歌·4:34》 | Simran 忆念<br/>"忆念真名"<br/>《Guru Granth Sahib》 |
| **明心** | 见迹<br/>"水边林下迹偏多" | 归正<br/>"反者道之动"<br/>《道德经·40》 | 省身<br/>"吾日三省吾身"<br/>《论语·学而》 | 忏罪<br/>百字明咒<br/>《密宗四加行》 | 净心<br/>"心地清净方为道"<br/>《奥义书》 | Hukam 顺道<br/>"遵行神旨"<br/>《Guru Nanak》 |
| **见性** | 见牛<br/>"黄鹂枝上一声声" | 见本性<br/>"复归于婴儿"<br/>《道德经·28》 | 知天命<br/>"五十而知天命" | 见明光<br/>《中阴得度经》 | 梵我一如<br/>Tat Tvam Asi<br/>《歌者奥义书》 | Sach Khand 真境<br/>《Guru Granth Sahib》 |
| **证道** | 得牛·牧牛<br/>"竭尽神通获得渠" | 得丹 ✨<br/>内丹术周天<br/>《周易参同契》 | 从心所欲<br/>"七十而从心所欲不逾矩" | 得灌顶<br/>《密集金刚》 | Moksha初门<br/>"瑜伽八支" ✨<br/>《瑜伽经》 | Naam Japna<br/>持名修行 |
| **圆融** | 骑牛归家·忘牛存人<br/>"骑牛迤逦欲还家" | 天人合一<br/>"独与天地精神往来"<br/>《庄子》 | 中庸<br/>"致中和天地位焉" | 大手印<br/>《那洛六法》 ✨ | Jivanmukti 现身解脱<br/>《不二吠檀多》 | Sehaj 自然境<br/>《Guru Arjan》 |
| **归家** | 人牛俱忘·返本还源<br/>"返本还源已费功" | 无为<br/>"为无为则无不治" | 万物一体<br/>《大学》"明明德" | 大圆满<br/>《龙钦心髓》 ✨ | Nirguna Brahman<br/>无属性梵<br/>《奥义书》 | Anand 喜境<br/>《Anand Sahib》 |
| **布施** | 入廛垂手<br/>"布袋持钱入市廛" | 圣人不积<br/>"既以为人己愈有"<br/>《道德经·81》 | 仁者爱人<br/>"己欲立而立人"<br/>《论语·雍也》 | 菩提心<br/>"愿一切众生具足乐"<br/>《入菩萨行论》 | Seva 服务<br/>《薄伽梵歌·3:25》 ✨ | Langar 施食<br/>共享厨房 ✨ |

| 境界 | 7.基督文化 | 8.犹太文化 | 9.伊斯兰 | 10.巴哈伊 | 11.神道 | 12.原住民 |
|------|----------|-----------|---------|----------|--------|---------|
| **初觉** | 呼召 Calling<br/>"凡劳苦担重担到我这里"<br/>《马太·11:28》 | Teshuvah 回转<br/>"以色列归向耶和华"<br/>《何西阿·14:1》 | 觉醒 Fitra<br/>"你们当忆念真主"<br/>《古兰·2:152》 | 追寻之谷<br/>《七谷经》 | 禊祓<br/>"清净身心入神前"<br/>《古事记》 | Vision Quest ✨<br/>灵境追寻<br/>Lakota传统 |
| **明心** | 悔改 Metanoia<br/>"天国近了应当悔改"<br/>《马太·4:17》 | Heshbon Hanefesh<br/>灵魂盘点<br/>《Mussar 传统》 ✨ | Tawbah<br/>"他是至赦至慈的"<br/>《古兰·39:53》 | 爱之谷<br/>《七谷经》 | Harae 清祓<br/>《神道仪轨》 | 净化小屋<br/>Sweat Lodge<br/>Lakota |
| **见性** | 重生 Born Again<br/>"人若不重生不能见神国"<br/>《约翰·3:3》 | Devekut 黏附<br/>哈西德主义 | Ma'rifa 真知<br/>苏菲秘修 | 知识之谷<br/>《七谷经》 | 见神 Kami-mi<br/>《古事记》 | Medicine Wheel<br/>药轮见心 |
| **证道** | 圣化 Sanctification<br/>"非我乃是基督在我里面"<br/>《加拉太·2:20》 | Tikkun Olam 修复世界<br/>《卡巴拉》 ✨ | Wilayah 圣亲<br/>"真主之友"<br/>苏菲传统 | 一致之谷<br/>"万有归一" | 神人合一<br/>《先代旧事本纪》 | 与图腾合一<br/>《Black Elk Speaks》 |
| **圆融** | 与基督联合<br/>"我活着就是基督"<br/>《腓立比·1:21》 | Ein Sof 无限光<br/>《卡巴拉生命之树》 ✨ | Tawhid 认主独一<br/>《古兰·112》 | 惊异之谷<br/>"心湖映现万象" | 八百万神和谐<br/>《古事记》 | 七世代圆环<br/>Seven Generations |
| **归家** | 与神同在<br/>"在他里面活动存留"<br/>《使徒·17:28》 | Ein 虚无<br/>卡巴拉至高境 | Fana 存灭<br/>苏菲旋舞 ✨<br/>《Rumi Mathnawi》 | 至贫与绝对之谷<br/>《七谷经》 | 神去 Kami-sari<br/>归源 | Great Mystery<br/>大神秘 |
| **布施** | 爱邻舍如己<br/>"洗他人的脚"<br/>《约翰·13》 | Gemilut Chasadim<br/>仁爱善行<br/>《塔木德》 ✨ | Khidmah 服务<br/>"最好的人是有益于人的人"<br/>《圣训》 | 真正之谷<br/>无私服务 | 和合<br/>"和を以て貴しとなす" | 大地母亲<br/>"我们都是亲人"<br/>Mitakuye Oyasin ✨ |

### 3.5.3 各文化独特优秀子系统 (深修包 / Deep Modules)

某些文化在特定境界有独到方法, 不强行塞进禅宗框架, 而作为可选深修包提供:

| 编号 | 名称 | 来源文化 | 适用境界 | 简介 |
|------|------|---------|---------|------|
| DM-01 | **苏菲旋舞 Sema** | 伊斯兰 | 圆融/归家 | 鲁米传统, 旋转中体证 Fana, 身心合一. M37 提供 14 日引导 |
| DM-02 | **卡巴拉生命之树** | 犹太 | 见性/证道/归家 | 10 Sefirot 精密心灵地图, 配合 Tikkun Olam 修复世界 |
| DM-03 | **道家内丹周天** | 道教 | 证道 | 任督二脉小周天 → 大周天, 完整生理化路线 |
| DM-04 | **大圆满 Dzogchen** | 藏传 | 圆融/归家 | 龙钦心髓直指本觉, 与禅宗"见性"互证 |
| DM-05 | **印度瑜伽八支** | 印度教 | 证道 | Yama→Niyama→Asana→Pranayama→Pratyahara→Dharana→Dhyana→Samadhi |
| DM-06 | **印度 7 脉轮系统** | 印度教 | 全境界纵贯 | 海底轮→顶轮, 身体觉醒地图, 配合冥想引导 |
| DM-07 | **萨满灵境之旅** | 原住民 | 初觉/见性 | Vision Quest 独自入山禁食祈祷, 等待灵显现 |
| DM-08 | **Mussar 灵魂盘点** | 犹太 | 明心 | 每日 13 项品格自检, 系统化心智净化 |
| DM-09 | **锡克 Langar 共食** | 锡克 | 布施 | 不分种姓共享厨房, 真实落地的众生平等 |
| DM-10 | **基督登山宝训八福** | 基督 | 全境界 | 八福作为内化八阶, 与七境界对应 |
| DM-11 | **儒家八条目** | 儒家 | 全境界 | 格物致知诚意正心修身齐家治国平天下 8 阶 |
| DM-12 | **巴哈伊七谷** | 巴哈伊 | 全境界 | 巴哈欧拉《七谷经》原本就是 7 阶心灵地图, 与七境界几乎 1:1 |

**深修包激活规则**:
- 用户在罗盘页"主修+融修"中选择某文化时, 自动解锁该文化对应的所有 DM
- 每个 DM 是独立的内容包: 文字+音频+冥想引导+打卡, 7-49 天不等
- 完成 DM 给境界算法附加加分 (F37.01)
- 巴哈伊七谷 (DM-12) 因与七境界 1:1, 作为"七境界对照说明"长期常驻

### 3.5.4 设计原则
1. **不改信仰** — 不试图把基督徒变成佛教徒, 只帮助他在自己传统中走得更深
2. **平等显示** — 12 文化在罗盘/十牛图/融通问答中地位完全对等
3. **禅宗主轴** — 主框架/UX/默认推荐仍以禅宗为锚, 用户可一键切换主修
4. **不混搭真理** — 融通问答时祖师各自表达, 用户自己融合, AI 不强行调和
5. **不评判优劣** — 各文化只描述其方法, 不做"哪个更好"的比较
6. **学者级严谨** — 所有原典引文必须有出处, 文化顾问团终审



| # | 轴名 | 路由 | 子PRD | 权限 |
|---|------|------|------|------|
| A1 | 修行罗盘 | /trips/cultivation | P37.01 | PRACTITIONER+ |
| A2 | 十牛图路径 | /trips/cultivation/ox-path | P37.02 | PRACTITIONER+ |
| A3 | 每日一印 | /trips/cultivation/daily-seal | P37.03 | PRACTITIONER+ |
| A4 | 融通问答 | /trips/cultivation/synthesis | P37.04 | PRACTITIONER+ |
| A5 | 因缘日志 | /trips/cultivation/karma-journal | P37.05 | PRACTITIONER+ |
| A6 | 三生愿景 | /trips/cultivation/three-lives | P37.06 | PRACTITIONER+ |
| A7 | 活佛直播堂 | /trips/cultivation/live-dharma | P37.07 | PRACTITIONER+ (观看), MASTER (开播) |
| — | 修行圈邀请 | /trips/cultivation/circle | F37.05 | MENTOR+ |

**内部体验与上版完全相同**, 七境界/十牛图/12文化同构/AI融通问答等所有创新保留. 唯一变化是**入口位置 + 门禁**.

## 5. 数据模型 (新增表 + User 扩展)

```prisma
enum CultivationRole { NONE SEEKER PRACTITIONER MENTOR MASTER }

model User {
  cultivationAccess     Boolean         @default(false)
  cultivationRole       CultivationRole @default(NONE)
  cultivationGrantedBy  String?
  cultivationGrantedAt  DateTime?
}

model CultivationApplication {
  id          String   @id @default(cuid())
  userId      String
  motivation  String   @db.Text  // 申请动机
  tradition   String?             // 主修意向
  experience  String?  @db.Text   // 修行经验
  status      String   @default("PENDING") // PENDING|APPROVED|REJECTED
  reviewedBy  String?
  reviewNote  String?  @db.Text
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?
  user        User     @relation(fields: [userId], references: [id])
  @@index([status, submittedAt])
}

model CultivationInviteCode {
  id          String   @id @default(cuid())
  code        String   @unique @default(cuid())
  issuerId    String   // 邀请人 (必须 MENTOR+)
  assigneeId  String?  // 被邀请人 (使用后填充)
  note        String?
  usedAt      DateTime?
  expiresAt   DateTime
  createdAt   DateTime @default(now())
}

model FulfillmentJourney { ... }      // 同上版
model DailySealPractice { ... }       // 同上版
model WisdomQuery { ... }             // 同上版
model KarmaEvent { ... }              // 同上版
model ThreeLifeVision { ... }         // 同上版
model DharmaLiveSession { ... }       // 同上版
model OxCultureMapping { ... }        // F37.02
```

## 6. API 契约 (新增门禁路由 + 原七轴路由带前缀)

```
# 门禁 (Public 或 JwtAuthGuard)
POST   /cultivation/apply              提交申请 (登录即可)
GET    /cultivation/apply/mine         查询自己的申请状态
POST   /cultivation/invite/redeem      使用邀请码

# 管理员 (Admin role)
GET    /admin/cultivation/applications?status=PENDING
POST   /admin/cultivation/applications/:id/approve
POST   /admin/cultivation/applications/:id/reject
POST   /admin/cultivation/grant        { userId, role } 直接授权
POST   /admin/cultivation/revoke       { userId, reason }

# 邀请 (MENTOR+)
POST   /cultivation/invite/generate    { count, note }
GET    /cultivation/invite/mine

# 七轴 (PRACTITIONER+) — 详见各子PRD
GET    /cultivation/journey/me
GET    /cultivation/compass
GET    /cultivation/ox-path
POST   /cultivation/ox-path/advance
GET    /cultivation/daily-seal/today
POST   /cultivation/daily-seal/practice
POST   /cultivation/wisdom/query
POST   /cultivation/karma/event
...
```

所有 /cultivation/* 路由 (除 /apply 和 /invite/redeem) 必须经过 `CultivationAccessGuard`.

## 7. 申请页 UX (/trips/cultivation/apply)

```
┌──────────────────────────────────────────┐
│ 佳绩之旅 · 我的修行                       │
│ (与主站同风格, 深蓝殿堂风)                │
├──────────────────────────────────────────┤
│                                            │
│   🪷 修行系统简介                          │
│   这是佳绩之旅为深度修行者开辟的专属空间   │
│   融合 12 文化智慧, 以禅宗十牛图为路径    │
│                                            │
│   七大修行体验 (图标展示, 不可点击):      │
│   • 修行罗盘   • 十牛图路径                │
│   • 每日一印   • 融通问答                  │
│   • 因缘日志   • 三生愿景                  │
│   • 活佛直播堂                             │
│                                            │
│   ⚠️ 此系统需资格审核                     │
│                                            │
│   ┌─ 如何获得资格 ─────────────────┐     │
│   │ 1. 提交申请 (动机+经验)         │     │
│   │ 2. 使用导师邀请码               │     │
│   │ 3. 通过信仰力评估 + 年度会员   │     │
│   └───────────────────────────────┘     │
│                                            │
│   [申请表单]                              │
│   主修意向: [下拉12文化]                  │
│   申请动机: [textarea 200字]              │
│   修行经验: [textarea 200字, 可选]        │
│   [ 提交申请 ]                            │
│                                            │
│   或使用邀请码: [输入框] [兑换]           │
└──────────────────────────────────────────┘
```

## 8. Admin 后台 (扩展现有 admin)

新增页面 `/admin/cultivation`:
- 申请审核列表 (Ant Design Table + Drawer)
- 一键授权/拒绝 + 备注
- 直接授权面板 (输入 userId + 角色)
- 修行者列表 (按角色/境界筛选)
- 邀请码发放统计
- 内容审核: karma 日志/融通问答敏感内容

## 9. 5-Wave 执行计划

### Wave 0 — PRD (本次)
- 本主PRD更新完成
- F37.05 修行资格与邀请系统 (本次新增)
- P37.01-P37.07 / F37.01-F37.04 保留, 仅路由调整

### Wave 1 — API + 门禁
- cultivation 模块: Application/Invite/Guard
- 七轴 Service+Controller 骨架
- Admin 审核端点
- db push 新表

### Wave 2 — Web /trips 改造 + 申请页
- /trips 页加第4卡「我的修行」(带锁图标)
- /trips/cultivation/apply 申请页
- 路由守卫 + redirect 逻辑
- /trips/cultivation 罗盘首屏

### Wave 3 — 七轴内页
- 十牛图/每日印/融通/因缘/三生/直播 逐一交付

### Wave 4 — Admin 审核 + Mobile/Mini
- Admin 审核台
- Mobile 我的Tab 加修行入口 (同样门禁)
- 小程序同步

### Wave 5 — 种子 + 部署
- 内容种子 (30印×3文化 MVP, 十牛图, 12祖师人设)
- 首批种子修行者 (内部10人)
- 部署验证

## 10. 验收标准 (DoD)
- [ ] /trips 页第4卡「我的修行」上线且带锁
- [ ] 未授权访问 /cultivation/* 一律 403 或 redirect
- [ ] 申请流程: 提交→admin审→通过→解锁 闭环
- [ ] 邀请码: MENTOR 生成→他人兑换→升级 闭环
- [ ] 资格撤销: admin revoke → 立即失效, 再访 403
- [ ] 主站旅行风格零改动 (首页/圣地/路线/订单页像素级未动)
- [ ] 七轴内容 PRD 100% 实现
- [ ] Admin 审核台有完整 CRUD
- [ ] i18n 7 语言 (申请页+全七轴)
- [ ] 所有 Controller: JwtAuthGuard + CultivationAccessGuard + @Roles
- [ ] XSS 清洗 / Rate Limit / IDOR 防护 三件套

## 11. 安全铁律
- [R-63] `CultivationAccessGuard` 必须在 JwtAuthGuard 后
- [R-64] 所有列表 @Max(50), 修行资源数据更敏感
- [R-68] karma/journey 必须 userId 归属校验
- [HH-S01] 小鸿 Key 走 env, 融通问答 Rate Limit 10/h
- [XSS] motivation/reflection/karma body 入库前 isomorphic-dompurify 清洗
- [Audit] 授权/撤销/晋阶 全部写审计日志
- [Privacy] 修行数据默认 PRIVATE, 不入搜索引擎
- [Invite] 邀请码单次使用 + 7天过期 + 每 MENTOR 每月上限 5 张

## 12. 与现有模块的关系

| 现有模块 | 关系 |
|---------|------|
| M05 行程 | /trips 页新增第4卡作为入口 |
| M36 信仰力评估 | 作为付费晋级路径的前置条件 |
| M22 二级分销 | 邀请码机制可复用基础设施 |
| M20 会员 | 年度修行会员作为独立 SKU |
| M27 商家 | MASTER 级导师可申请真人直播主讲资格 |
| M29 moderation | 融通问答/因缘日志内容审核复用 |

## 13. 风险与对策

| 风险 | 对策 |
|------|------|
| 主站用户困惑"第4卡是什么" | 卡片带锁图标+悬浮说明"需修行资格" |
| 申请积压 | 默认通过率 30%, admin 每周批处理 |
| 邀请码滥发 | 每月每 MENTOR 5 张上限 + 单次使用 |
| 宗教敏感内容外溢 | 所有数据 PRIVATE 默认 + 不入搜索/推荐 |
| 用户买会员后后悔 | 7天无理由退款 |
