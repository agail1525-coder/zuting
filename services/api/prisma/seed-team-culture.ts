/**
 * 独立 Team Culture seeder — M32 v1.3 (深度内容版)
 *
 * 用途:
 *   - 6 个文化主题包,每个都包含 richContent (维度/创业痛点/哲学/每日行程/导师/交付物)
 *   - 完全幂等(upsert by slug),可以重跑任意次
 *   - 不依赖 HolySite/Trip/Religion 等外部表的任何 FK
 *
 * 用法: pnpm tsx prisma/seed-team-culture.ts
 */
import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type RichContent = {
  dimension: { code: string; label: string; kicker: string };
  founderPainPoint: { title: string; body: string; signs: string[] };
  philosophy: {
    title: string;
    body: string;
    quotes: Array<{ source: string; text: string; translation?: string }>;
  };
  dailyItinerary: Array<{
    day: number;
    title: string;
    location: string;
    morning: string;
    afternoon: string;
    evening: string;
    rituals: string[];
  }>;
  mentorTeam: Array<{ name: string; title: string; bio: string }>;
  deliverables: string[];
  targetAudience: string[];
  whyZuting: string[];
};

const themesData: Array<{
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  coverUrl: string;
  keywords: string[];
  holySites: string[];
  routes: string[];
  rituals: Prisma.InputJsonValue;
  richContent: Prisma.InputJsonValue;
  priceFrom: number;
  durationDays: number;
  sortOrder: number;
}> = [
  // ════════ 01 同心之旅 ════════
  {
    slug: 'tongxin',
    title: '同心之旅',
    subtitle: '让团队在朝圣中凝聚 · 凝聚力维度',
    description:
      '通过共同朝圣、共修仪式与团体禅行,让组织成员在天地祖庭面前回到同一颗初心,凝聚团队共识。这是一次为期 4 天的深度文化工程,我们用十余项嵌入式仪式,把"凝聚力"从一句口号变成可触摸、可记忆、可代代传承的组织资产。',
    color: '#3264ff',
    icon: '☯',
    coverUrl: 'https://images.unsplash.com/photo-1545569310-25c4e8eb7eb1?w=1600',
    keywords: ['凝聚', '共识', '同行', '战略对齐'],
    holySites: ['shaolin-temple', 'wudang-mountain'],
    routes: [],
    rituals: [
      { name: '入山开光礼', durationMin: 45, description: '到达祖庭后的开光仪式,正式从世俗工作模式切换为朝圣模式' },
      { name: '同心共诵', durationMin: 30, description: '团队齐诵祖训三十句,用共同的声音建立第一个文化锚点' },
      { name: '同行徒步', durationMin: 180, description: '一同登山到祖庭主殿,用身体的节奏校准团队节奏' },
      { name: '战略闭门会', durationMin: 240, description: '在祖庭精舍内的高管闭门会,无外人、无 PPT、只有真问题' },
      { name: '篝火围坐', durationMin: 120, description: '夜晚围坐分享,创始人讲创业初心,每位成员讲一个被忘记的重要瞬间' },
      { name: '集体宣誓', durationMin: 60, description: '在祖师塔前的集体宣誓,把战略共识铸成精神契约' },
      { name: '同心愿牌', durationMin: 30, description: '每人书写并悬挂同主题的愿牌,留下永久印记' },
      { name: '回程合影', durationMin: 30, description: '在祖庭山门拍下"前-中-后"三组合影,作为文化资产纪录' },
    ],
    richContent: {
      dimension: { code: '01', label: '凝聚力维度', kicker: '组织共识 · 战略对齐 · 跨部门破壁' },
      founderPainPoint: {
        title: '创始人最深的孤独:战略共识穿透不到执行层',
        body: '公司从 50 人扩张到 500 人后,创始人发现自己在不同的会议室里重复说同一件事,但没有人真正记住。中层各自为战,新老员工背景差异巨大,部门之间用 OKR 互相博弈,战略变成了 PPT 上的字。这不是管理问题,是文化没有被身体记住——因为 KPI 永远只在脑子里,而文化必须经由身体进入团队的集体记忆。',
        signs: [
          '高管会议上人人点头,执行层却完全不知道战略是什么',
          '部门 leader 私下抱怨"我们和销售/产品/技术不是一家公司"',
          '快速扩张后新员工对公司缺乏归属感,半年内离职率高',
          '老员工开始怀念创业期"虽然苦但大家是一条心"的状态',
          '战略复盘会变成相互推责的现场',
        ],
      },
      philosophy: {
        title: '12 大信仰中的"和合一处"哲学',
        body: '凝聚力不是被管理出来的,是被仪式化出来的。从孔子到禅宗,从基督教的圣餐到伊斯兰的礼拜,所有延续千年的组织都有一个共同点:他们用反复的、身体在场的、共同的仪式,把抽象的信念铸成肉身记忆。少林千余年的武僧团之所以"令行禁止",不是因为戒律严苛,而是因为他们每天五点敲钟、共诵、共行——日复一日的"同"。',
        quotes: [
          { source: '《论语·子路》', text: '君子和而不同,小人同而不和' },
          { source: '《华严经》', text: '一即一切,一切即一', translation: '一花一世界,团队中每一人即整体' },
          { source: '《道德经·二十二章》', text: '圣人抱一为天下式' },
          { source: '少林宗门家训', text: '万僧一脉,和合一处' },
        ],
      },
      dailyItinerary: [
        {
          day: 1,
          title: '入山·开光·破壁',
          location: '少林寺',
          morning: '抵达郑州·专车入山·入山仪轨(去尘、净手、入门拜)',
          afternoon: '祖庭参观+方丈茶叙·讲少林宗门"和合一处"千年传统',
          evening: '欢迎晚宴(在僧厨用斋)+ 团队签到牌仪式(每人书写"我为何而来")',
          rituals: ['入山开光礼'],
        },
        {
          day: 2,
          title: '同诵·同行·身体记忆',
          location: '少林寺 → 武当山',
          morning: '5:00 早课齐诵祖训三十句·跟随武僧团晨练一小时',
          afternoon: '驱车武当山·徒步登顶金顶(3 小时,无电子设备)',
          evening: '紫霄宫晚课·篝火围坐·创始人讲创业初心,每人讲一个"被忘记的重要瞬间"',
          rituals: ['同心共诵', '同行徒步', '篝火围坐'],
        },
        {
          day: 3,
          title: '战略闭门·集体宣誓',
          location: '武当山·紫霄宫精舍',
          morning: '晨钟·静坐 30 分钟·然后进入闭门会(无外人、无 PPT,只谈三个真问题)',
          afternoon: '继续闭门·写下未来 12 个月的"组织共识三条"',
          evening: '在祖师塔前的集体宣誓·每位高管按手印·把共识铸成精神契约',
          rituals: ['战略闭门会', '集体宣誓'],
        },
        {
          day: 4,
          title: '愿牌·回程·锚点带回',
          location: '武当山 → 回程',
          morning: '同心愿牌仪式·每人书写并悬挂愿牌',
          afternoon: '山门合影(前/中/后三组)·回程',
          evening: '抵达·解散·每人带走一份《同心之旅纪念册》',
          rituals: ['同心愿牌', '回程合影'],
        },
      ],
      mentorTeam: [
        { name: '释延某', title: '少林寺禅修导师', bio: '少林寺禅堂首座,带领企业禅修十余年,曾为多家世界 500 强高管团队主持闭关' },
        { name: '李道长', title: '武当山道家文化导师', bio: '武当紫霄宫道长,精通《道德经》与企业家精神研究,著有《无为而治的领导力》' },
        { name: 'ZUTING 文化策划师', title: '组织文化工程师', bio: '前麦肯锡组织咨询合伙人,将咨询方法论与禅修结合,形成可交付的文化工程' },
      ],
      deliverables: [
        '《同心之旅纪念册》(全员合影 + 个人愿牌照片 + 闭门会纪要节选)',
        '《组织共识三条》联合签署文件(可悬挂于公司大堂)',
        '团队认证证书(由 ZUTING + 少林/武当联合颁发)',
        '专业摄影师全程影像档案(精修 200+ 张)',
        '高管闭门会纪要(脱敏可对外版 + 内部完整版)',
        '6 个月后的"凝聚力复盘"线上工作坊(免费)',
      ],
      targetAudience: [
        '50-500 人快速扩张期的企业',
        '战略共识无法穿透到执行层的高管团队',
        '正在并购整合期、急需新老团队融合的组织',
        '部门墙严重、需要跨部门破壁的中大型企业',
      ],
      whyZuting: [
        '我们不是搞拓展训练的——我们是把千年祖庭文化翻译成组织工具的文化工程师',
        '少林+武当双祖庭联动,儒道双修,是国内独家的深度组合',
        '文化导师由真正的方丈/道长亲自带领,不是商业讲师扮演',
        '所有交付物都是可被代际继承的文化资产,不是一次性合影',
      ],
    },
    priceFrom: 488000,
    durationDays: 4,
    sortOrder: 10,
  },

  // ════════ 02 感恩之旅 ════════
  {
    slug: 'ganen',
    title: '感恩之旅',
    subtitle: '回到文化的源头致谢 · 价值观维度',
    description:
      '感恩父母、感恩师长、感恩天地。在祖庭与圣地之间,让每一位成员体会"感恩文化"的厚度。这是一次为期 3 天的价值观回归工程,通过孔庙的儒家礼制+《孝经》研习+多重感恩仪式,把"感恩"从一句客套话沉淀为组织的底层价值观。',
    color: '#4a7aff',
    icon: '🙏',
    coverUrl: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1600',
    keywords: ['感恩', '回馈', '传承', '价值观'],
    holySites: ['kongmiao-qufu'],
    routes: [],
    rituals: [
      { name: '孔林祭拜', durationMin: 90, description: '在孔林为先师与历代创业先驱献花致敬' },
      { name: '拜师礼', durationMin: 60, description: '在大成殿前的传统拜师仪式,向自己的"师者"致敬' },
      { name: '奉茶礼', durationMin: 45, description: '团队为长辈/同伴/合作伙伴亲手奉茶' },
      { name: '感恩书信', durationMin: 60, description: '现场写一封信给"被你忽略的重要的人"' },
      { name: '《学记》共读', durationMin: 90, description: '在杏坛之下集体诵读儒家《学记》' },
      { name: '感恩晚宴', durationMin: 150, description: '每人讲一个最感恩的人的故事' },
      { name: '供灯仪', durationMin: 30, description: '在祖庭供灯发愿,每盏灯代表一份谢意' },
      { name: '寄信仪式', durationMin: 30, description: '集体寄出当天写的感恩信' },
    ],
    richContent: {
      dimension: { code: '02', label: '价值观维度', kicker: '感恩文化 · 不忘初心 · 客户至上' },
      founderPainPoint: {
        title: '公司大了,人心变冷了——骄傲在悄悄滋生',
        body: '公司估值过 10 亿之后,创始团队开始忘本。忘记当年陪自己熬夜的合伙人,忘记给第一笔订单的客户,忘记父母给的最初支持。会议室里出现越来越多"我"和越来越少的"我们感谢"。客户成了报表上的数字,员工成了 HC 上的代号,合作伙伴成了砍价的对象。当一个组织失去感恩,它就失去了与世界连接的最后一根线——而所有伟大的企业,本质都是"感恩驱动型"的。',
        signs: [
          '高管会议中"客户"被简化为"用户数"或"GMV"',
          '老员工/老合伙人开始离职,带着没说出口的失望',
          '创始人再也没主动向父母/早期投资人/第一批客户表达感谢',
          '公司年会变成业绩秀,不再有"感恩"的瞬间',
          '骄傲与冷漠在中高层蔓延,办公室文化变得功利',
        ],
      },
      philosophy: {
        title: '12 大信仰中的"感恩"是组织底层操作系统',
        body: '从孔子的《孝经》到佛教的"上报四重恩"(父母/师长/众生/国土),从基督教的"凡事谢恩"到伊斯兰的"赞美归于真主"——所有延续千年的文明,都把"感恩"放在价值观第一位。因为感恩是唯一能对抗"骄傲"的力量,而骄傲是所有大企业最终衰落的根本原因。日本京瓷的稻盛和夫每天对员工说"感谢",这不是情商,这是经营哲学。',
        quotes: [
          { source: '《孝经·开宗明义章》', text: '夫孝,德之本也,教之所由生也' },
          { source: '《华严经》', text: '上报四重恩', translation: '父母恩、师长恩、众生恩、国土恩' },
          { source: '《诗经·小雅·蓼莪》', text: '哀哀父母,生我劬劳' },
          { source: '《圣经·帖撒罗尼迦前书》', text: '凡事谢恩' },
        ],
      },
      dailyItinerary: [
        {
          day: 1,
          title: '寻根·孔林祭拜',
          location: '曲阜·孔林',
          morning: '抵达曲阜·入住·换正装(青色长衫)',
          afternoon: '孔林祭拜·在孔子墓前献花·向历代创业先驱致敬',
          evening: '团队"被自己忽略的人"专题写作·每人写一封感恩信(暂不寄出)',
          rituals: ['孔林祭拜', '感恩书信'],
        },
        {
          day: 2,
          title: '大成殿·感恩盛典',
          location: '曲阜·孔庙·大成殿',
          morning: '大成殿前拜师礼·全员奉茶礼(从晚辈奉给长辈,层层传递)',
          afternoon: '杏坛之下集体诵读《学记》·讨论"我们究竟应该感谢谁"',
          evening: '感恩晚宴·每人讲一个最感恩的人的故事·泪点频频',
          rituals: ['拜师礼', '奉茶礼', '《学记》共读', '感恩晚宴'],
        },
        {
          day: 3,
          title: '供灯·寄信·锚点带回',
          location: '曲阜 → 回程',
          morning: '在孔庙供灯·每盏灯代表一份具体的谢意',
          afternoon: '集体寄出昨晚写的感恩信(由我们的工作人员送达)',
          evening: '回程·解散·每人带回一份《感恩纪念礼盒》(给家人)',
          rituals: ['供灯仪', '寄信仪式'],
        },
      ],
      mentorTeam: [
        { name: '孔某某', title: '孔氏家族第 79 代后人', bio: '曲阜本地学者,常年主持儒家礼仪复原与企业团体研习' },
        { name: '陈教授', title: '北大儒学研究中心', bio: '研究儒家经济伦理 20 年,专注《孝经》《学记》与现代企业的连接' },
        { name: 'ZUTING 文化策划师', title: '组织文化工程师', bio: '专精"价值观工程",曾为多家上市公司主持感恩主题年会' },
      ],
      deliverables: [
        '《感恩之旅纪念册》(全员奉茶礼影像 + 拜师礼合影)',
        '《给家人的感恩礼盒》(每人一份,带回家)',
        '专业摄影师全程影像档案',
        '团队感恩故事集(自愿提交版,可成为公司内部传阅文化材料)',
        '《学记》朗读音频(每位成员的声音录入)',
        '团队认证证书',
      ],
      targetAudience: [
        '即将上市/已上市但正在失去初心的公司',
        '创始人感觉团队"变冷"、需要重塑价值观的组织',
        '想要把"感恩文化"沉淀为公司基因的家族企业',
        '正在寻找年度盛典/答谢客户合作伙伴新形式的企业',
      ],
      whyZuting: [
        '在曲阜孔庙这个"感恩文化的源头"做这件事,是无可替代的精神高地',
        '我们的奉茶礼、拜师礼是经儒家学者考证还原的,不是表演',
        '感恩信由我们送达,这个动作本身就是最深的承诺',
        '所有交付物都可以成为公司年度文化叙事的核心素材',
      ],
    },
    priceFrom: 388000,
    durationDays: 3,
    sortOrder: 20,
  },

  // ════════ 03 传承之旅 ════════
  {
    slug: 'chuancheng',
    title: '传承之旅',
    subtitle: '从祖师手中接过那一印 · 接班维度',
    description:
      '为有传承使命的团队设计:师徒交接、立志立愿、受印仪式。承接曹溪三十印之精神。这是一次为期 5 天的接班人/传承工程,通过禅宗五系印的传承之路,让二代/接班人/核心干部从"被指定"完成到"主动担当"的心智转换。受印礼是其中最庄严的时刻——那一刻,基业的重量真正落在新一代肩上。',
    color: '#1e4dcc',
    icon: '✦',
    coverUrl: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d1e9e9?w=1600',
    keywords: ['师徒', '受印', '立愿', '接班'],
    holySites: ['caoxi-temple'],
    routes: [],
    rituals: [
      { name: '入山拜祖', durationMin: 60, description: '抵达曹溪宝林寺·拜祖师塔·讲家族企业传承故事' },
      { name: '青色初印之路', durationMin: 360, description: '徒步走青色初印系路径·讲老祖宗的"立业"之路' },
      { name: '蓝色中印之路', durationMin: 360, description: '走中印系路径·体会"守业更比创业难"' },
      { name: '紫色印果之路', durationMin: 240, description: '走印果印路径·讨论"成业"的真正含义' },
      { name: '受印礼', durationMin: 120, description: '在祖庭主殿举行庄严受印仪式·老一辈交印给二代' },
      { name: '立愿牌', durationMin: 60, description: '亲手书写并悬挂传承愿牌' },
      { name: '家族传承宣言签署', durationMin: 90, description: '在祖庭门口正式签署家族传承宣言' },
      { name: '红色成道之路', durationMin: 240, description: '走成道印路径·象征传承的圆满' },
      { name: '金色归源仪式', durationMin: 90, description: '归源印仪式·封存仪式所有物品' },
    ],
    richContent: {
      dimension: { code: '03', label: '接班维度', kicker: '代际传承 · 基业长青 · 二代接班' },
      founderPainPoint: {
        title: '"富不过三代"的魔咒,正悬在每个家族企业头上',
        body: '第一代用拼搏建立的基业,在第二代手里没有"故事"就没有"魂"。二代不愿接班,或接了也撑不起来——因为他们没有亲历过最艰难的那段路,没有内化父辈的精神。一纸股权转让书无法传递使命,一份董事会决议无法传递信念。真正的传承,必须有"仪式时刻"——一个让二代真正"接到"的瞬间。这正是禅宗一千多年来代代相传的智慧:衣钵不是物,是心法,是必须经过仪式才能完成的传递。',
        signs: [
          '二代对家族企业兴趣缺失,宁愿做投资人或自己创业',
          '第一代担心"接班"问题但没有具体方法',
          '核心干部在创始人和二代之间无所适从',
          '家族成员之间因传承问题出现分歧',
          '"如何让二代接住这副担子"成为创始人最深的焦虑',
        ],
      },
      philosophy: {
        title: '禅宗五系印 · 一千年验证过的传承智慧',
        body: '从达摩到六祖慧能,从慧能到曹溪三十印,禅宗用一千多年证明了一件事:真正的传承不是指定,是仪式。受印礼那一刻,接班人不是"被任命",是"主动接住"。这一字之差,决定了基业能否长青。我们把禅宗五系印的传承智慧,翻译成现代家族企业可用的"接班人觉醒工程"。',
        quotes: [
          { source: '《论语·学而》', text: '君子务本,本立而道生' },
          { source: '《六祖坛经》', text: '衣为争端,止汝勿传', translation: '真正的传承,是心法,不是物' },
          { source: '《付法藏因缘传》', text: '佛佛唯传本体,师师密付本心' },
          { source: '曹溪三十印家训', text: '一印一愿,一愿一行,一行一证' },
        ],
      },
      dailyItinerary: [
        {
          day: 1,
          title: '入山·拜祖·开启',
          location: '韶关·曹溪宝林寺',
          morning: '抵达广州·专车入韶·途中讲家族企业传承故事',
          afternoon: '拜祖师塔·参观六祖真身殿·入住寺院寮房',
          evening: '欢迎晚膳(僧厨素斋)·家族成员各自分享"我对接班的真实想法"',
          rituals: ['入山拜祖'],
        },
        {
          day: 2,
          title: '青色·立业之路',
          location: '曹溪 → 初印系路径',
          morning: '5:00 早课·跟随僧团禅修一小时',
          afternoon: '徒步青色初印系路径(6 小时)·讲老祖宗的立业故事',
          evening: '宝林精舍家族夜话·一代讲创业最艰难的那一年',
          rituals: ['青色初印之路'],
        },
        {
          day: 3,
          title: '蓝色·守业之路',
          location: '中印系路径',
          morning: '禅修·然后徒步中印系路径(6 小时)',
          afternoon: '继续徒步·体会"守业更比创业难"',
          evening: '二代讲"我对未来 10 年的想象"·一代倾听不打断',
          rituals: ['蓝色中印之路'],
        },
        {
          day: 4,
          title: '紫色·受印日 · 庄严时刻',
          location: '曹溪宝林寺·主殿',
          morning: '徒步紫色印果之路(4 小时)·讨论"成业"的真正含义',
          afternoon: '在祖庭主殿举行庄严受印仪式·老一辈正式交印给二代·全场屏息',
          evening: '立愿牌仪式·亲手书写并悬挂传承愿牌·家族晚宴',
          rituals: ['紫色印果之路', '受印礼', '立愿牌'],
        },
        {
          day: 5,
          title: '红色·成业 + 金色·回归',
          location: '曹溪 → 回程',
          morning: '走红色成道印路径(4 小时)+ 金色归源仪式',
          afternoon: '在祖庭门口正式签署《家族传承宣言》·合影留念',
          evening: '回程·解散·每人带走一枚象征所获之印的金属信物',
          rituals: ['红色成道之路', '金色归源仪式', '家族传承宣言签署'],
        },
      ],
      mentorTeam: [
        { name: '惟某法师', title: '曹溪宝林寺方丈', bio: '禅宗曹溪法脉传人,主持过数百次重要传承仪式,深谙"心法传递"的奥义' },
        { name: '王教授', title: '清华大学家族企业研究中心', bio: '研究中国家族企业接班 30 年,著有《富过三代的密码》' },
        { name: 'ZUTING 接班人工程师', title: '资深家族顾问', bio: '前瑞银家族办公室总监,专精家族治理与代际传承设计' },
      ],
      deliverables: [
        '《家族传承宣言》正式签署文件(可装裱悬挂)',
        '受印礼庄严影像 + 4K 视频(终身保存)',
        '每位接班人的金属信物(象征所获之印)',
        '《五系印传承之路》纪念册(含每日徒步轨迹)',
        '专业摄影师全程影像 + 一部 8 分钟纪录短片',
        '12 个月接班人成长复盘陪伴(免费)',
      ],
      targetAudience: [
        '需要二代接班的家族企业',
        '正在寻找接班人觉醒方法的创始人',
        '希望把使命传递给核心干部的中大型企业',
        '准备进行股权传承/家族治理升级的企业',
      ],
      whyZuting: [
        '禅宗五系印的传承体系是国内独家的接班人觉醒工程',
        '在六祖真身殿这个真正的传承圣地举行,精神能量无可替代',
        '受印礼由真正的曹溪法脉传人主持,不是仪式表演',
        '我们的家族顾问理解"传承"既是法律事实也是心法仪式,二者缺一不可',
      ],
    },
    priceFrom: 688000,
    durationDays: 5,
    sortOrder: 30,
  },

  // ════════ 04 匠心之旅 ════════
  {
    slug: 'jiangxin',
    title: '匠心之旅',
    subtitle: '在工艺中见心 · 专业维度',
    description:
      '面向工程师、设计师、手艺人。在祖庭的木构、塑像、壁画之间,体会千年匠心,重燃专业热爱。这是一次为期 4 天的"专业初心唤醒"工程,我们带团队走进日本法隆寺与东大寺,跟随真正的"宫大工"与人间国宝,在千年木构面前重新理解"做一个能传 100 年的东西"是什么意思。',
    color: '#3264ff',
    icon: '◈',
    coverUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600',
    keywords: ['匠心', '专注', '工艺', '专业初心'],
    holySites: ['horyuji-temple'],
    routes: [],
    rituals: [
      { name: '入寺·观木', durationMin: 90, description: '观摩法隆寺千年木构·听千年木构如何挺立' },
      { name: '跟随宫大工', durationMin: 240, description: '跟随传统木匠师傅观摩榫卯技艺' },
      { name: '塑像修复观摩', durationMin: 180, description: '观摩千年塑像的修复过程' },
      { name: '壁画修复观摩', durationMin: 180, description: '观摩千年壁画的修复' },
      { name: '习艺工作坊', durationMin: 240, description: '在导师指导下亲手做一件传统小件' },
      { name: '人间国宝对话', durationMin: 120, description: '与日本人间国宝面对面对话' },
      { name: '专业初心写作', durationMin: 90, description: '写一封信给"刚毕业时的自己"' },
      { name: '匠心信物授予', durationMin: 60, description: '导师亲手授予每位团队成员一枚匠心信物' },
    ],
    richContent: {
      dimension: { code: '04', label: '专业维度', kicker: '专业精神 · 工匠之心 · 长期主义' },
      founderPainPoint: {
        title: '快糙猛压死了精雕细琢——核心专业正在被掏空',
        body: '在快节奏融资和增长压力下,工程师/产品/设计的专业初心正被系统性消耗。"先上线再说"压死了"再打磨一周"。技术大牛开始转管理,因为做技术"上不去",核心专业能力被掏空。CEO 焦虑地发现:公司的护城河不是规模,是专业,而专业正在团队中消失。当一家公司不再有人愿意为一个细节熬通宵,它就失去了基业长青的根基。',
        signs: [
          '工程师抱怨"产品根本不让我打磨,只让我赶进度"',
          '设计师离职率高,因为"做的东西自己都看不上"',
          '技术大牛纷纷转管理岗,因为"做技术没前途"',
          'CTO/CDO 抱怨"我招不到真正爱专业的人"',
          '公司开始用"能跑就行"代替"做到最好"',
        ],
      },
      philosophy: {
        title: '从《考工记》到日本宫大工 · 千年匠人精神',
        body: '《考工记》说"知者创物,巧者述之",中国早在 2000 年前就把"工匠精神"写进经典。日本把这种精神延续了千年——法隆寺的木构在没有水泥钢筋的时代屹立 1300 年,靠的是宫大工对每一个榫卯的极致专注。庄子讲"庖丁解牛"——技进乎道。当一个人把专业做到极致,工艺就变成了道,就变成了宗教。我们带团队去法隆寺,不是看古董,是去重新点燃那团火。',
        quotes: [
          { source: '《考工记》', text: '知者创物,巧者述之,守之世,谓之工' },
          { source: '《庄子·养生主》', text: '臣之所好者道也,进乎技矣' },
          { source: '日本宫大工家训', text: '一木一会,一刀一心' },
          { source: '《六祖坛经》', text: '日日是好日', translation: '每一天都全力以赴,即是修行' },
        ],
      },
      dailyItinerary: [
        {
          day: 1,
          title: '入寺·观千年之木',
          location: '日本·奈良·法隆寺',
          morning: '抵达大阪·专车入奈良·入法隆寺',
          afternoon: '观摩千年木构·听讲解员讲"为什么 1300 年不倒"',
          evening: '在寺内料亭素斋·讨论"我们公司最得意的技术细节是什么"',
          rituals: ['入寺·观木'],
        },
        {
          day: 2,
          title: '跟随宫大工·看榫卯',
          location: '法隆寺修缮工房',
          morning: '跟随宫大工(传统木匠师傅)观摩榫卯技艺·亲手触摸 1300 年的木头',
          afternoon: '观摩塑像修复·细看每一笔修补',
          evening: '工房师傅"一日一木"的家训分享',
          rituals: ['跟随宫大工', '塑像修复观摩'],
        },
        {
          day: 3,
          title: '亲手习艺',
          location: '东大寺·习艺工作坊',
          morning: '观摩东大寺壁画修复',
          afternoon: '在导师指导下,亲手用传统工具做一件小件(榫卯小盒/塑像微件/壁画小幅)',
          evening: '展示+互评·"为什么这一件你最喜欢"',
          rituals: ['壁画修复观摩', '习艺工作坊'],
        },
        {
          day: 4,
          title: '人间国宝对话+回程',
          location: '奈良 → 大阪',
          morning: '与日本人间国宝面对面·听他讲"为什么做了 60 年还在做同一件事"',
          afternoon: '专业初心写作·写一封信给"刚毕业时的自己"',
          evening: '匠心信物授予·导师亲手颁给每人一枚匠心信物·回程',
          rituals: ['人间国宝对话', '专业初心写作', '匠心信物授予'],
        },
      ],
      mentorTeam: [
        { name: '小川某某', title: '法隆寺第 18 代宫大工', bio: '继承了千年木构修缮技艺,曾主持法隆寺多次修缮,被誉为"活着的国宝"' },
        { name: '田中某某', title: '日本人间国宝(漆艺)', bio: '60 年专注一门工艺,作品被多国国家博物馆永久收藏' },
        { name: 'ZUTING 文化策划师', title: '组织文化工程师 + 资深产品人', bio: '前知名互联网公司首席产品官,精通"专业精神"在组织中的工程化沉淀' },
      ],
      deliverables: [
        '每位团队成员亲手制作的传统工艺小件(一生之物)',
        '匠心信物(由人间国宝亲手颁发)',
        '《一日一木》纪念册(含每日影像 + 工艺细节图)',
        '与人间国宝的合影 + 8 分钟对话纪录片',
        '"给刚毕业时的自己"的信(团队匿名集结成册)',
        '《专业初心宣言》联合签署',
      ],
      targetAudience: [
        '研发团队(尤其是 30+ 工程师团队)',
        '设计/产品团队',
        '正在失去专业精神的技术驱动型公司',
        '面临"技术大牛流失"问题的公司',
        '希望重塑长期主义文化的组织',
      ],
      whyZuting: [
        '日本法隆寺是全球唯一持续 1300 年的木构圣地,精神能量无可替代',
        '我们能联系到真正的宫大工和人间国宝(普通团建公司接触不到)',
        '"做一件能传 100 年的东西"这个体验,是 PPT 永远无法传递的',
        '所有交付物都是"一生之物",不是廉价纪念品',
      ],
    },
    priceFrom: 588000,
    durationDays: 4,
    sortOrder: 40,
  },

  // ════════ 05 慈悲之旅 ════════
  {
    slug: 'cibei',
    title: '慈悲之旅',
    subtitle: '让公益成为团队基因 · 社会维度',
    description:
      '把团建变成公益。施食、放生、捐书、助学,在朝圣中沉淀团队的慈悲底色。这是一次为期 3 天的"意义感"工程,我们带团队走进尼泊尔蓝毗尼(佛陀诞生地),把 ESG 战略从一份报告变成全员可亲身参与的、真实改变他人命运的行动。',
    color: '#4a7aff',
    icon: '✧',
    coverUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600',
    keywords: ['慈悲', '公益', '回馈', 'ESG', '意义感'],
    holySites: ['lumbini'],
    routes: [],
    rituals: [
      { name: '抵达蓝毗尼', durationMin: 90, description: '入佛陀诞生地·观摩阿育王柱·静默 30 分钟' },
      { name: '施食仪', durationMin: 120, description: '为周边贫困儿童亲手准备并分发一餐' },
      { name: '助学日', durationMin: 360, description: '为乡村学校捐书 + 义务教学一日' },
      { name: '放生·放愿', durationMin: 90, description: '集体放生仪式 + 写发愿牌' },
      { name: '与尼姑交谈', durationMin: 120, description: '与当地尼师面对面·听她们一辈子奉献的故事' },
      { name: '慈悲晚课', durationMin: 60, description: '晚课中诵念慈悲经文' },
      { name: 'ESG 闭门会', durationMin: 180, description: '高管闭门讨论"我们这一年要做什么真正有意义的事"' },
      { name: '慈悲愿牌仪式', durationMin: 60, description: '团队集体悬挂慈悲愿牌' },
    ],
    richContent: {
      dimension: { code: '05', label: '社会维度', kicker: 'ESG 战略 · 社会责任 · 意义感重建' },
      founderPainPoint: {
        title: '账上有几个亿,但创始人和高管开始问:"为什么"',
        body: '公司做到一定规模,创始人和高管开始问一个内心的问题:"我们做这一切是为了什么?除了钱还有什么?"ESG 报告再漂亮,内心的空虚感无法被填满。员工开始抱怨"工作没有意义",高管开始焦虑"我赚了钱为什么还是不开心"。这不是物质问题,是意义问题。一家失去了"为什么"的公司,无论多大,内核都是空的。慈悲不是慈善,慈悲是组织的意义引擎。',
        signs: [
          '创始人开始问"我做这一切为了什么"的问题',
          '高管开始焦虑钱赚了之后的空虚感',
          '员工抱怨"工作没有意义",离职率上升',
          'ESG 报告做得很漂亮但全公司没人真正在乎',
          '公司想做公益但不知道怎么做才不流于形式',
        ],
      },
      philosophy: {
        title: '12 大信仰中的"慈悲"是组织的意义引擎',
        body: '佛教讲"无缘大慈,同体大悲"——不是因为有缘才慈悲,是无条件的慈悲;不是同情他人,是知道众生与我本是一体。基督讲"爱人如己",伊斯兰把"天课"(zakat)定为五功之一,儒家说"老吾老以及人之老"。所有伟大的文明都把"利他"放在意义的最高位。日本京瓷的稻盛和夫说"利他即利己,这是宇宙的法则"——真正长青的企业,都是慈悲驱动型的。',
        quotes: [
          { source: '《大智度论》', text: '大慈与一切众生乐,大悲拔一切众生苦' },
          { source: '《圣经·马可福音》', text: '爱人如己' },
          { source: '《古兰经》', text: '你们当履行拜功,完纳天课' },
          { source: '《孟子·梁惠王上》', text: '老吾老以及人之老,幼吾幼以及人之幼' },
        ],
      },
      dailyItinerary: [
        {
          day: 1,
          title: '抵达·施食·静默',
          location: '尼泊尔·蓝毗尼',
          morning: '抵达加德满都·转机蓝毗尼·入佛陀诞生地',
          afternoon: '观摩阿育王柱·静默 30 分钟',
          evening: '施食仪·为周边贫困儿童亲手准备并分发一餐·见到他们的笑脸',
          rituals: ['抵达蓝毗尼', '施食仪'],
        },
        {
          day: 2,
          title: '助学·教学·真正改变',
          location: '蓝毗尼周边乡村学校',
          morning: '为乡村学校捐书(我们提前准备了一卡车)+ 义务教学(每位团队成员上一节自己擅长的课)',
          afternoon: '继续教学·与孩子们一起午餐',
          evening: '与当地尼师交谈·听她们一辈子奉献的故事',
          rituals: ['助学日', '与尼姑交谈'],
        },
        {
          day: 3,
          title: 'ESG 闭门·愿牌·回程',
          location: '蓝毗尼',
          morning: '集体放生仪式·写发愿牌·慈悲晚课',
          afternoon: 'ESG 闭门会·高管讨论"我们这一年要做什么真正有意义的事"·写下三件具体的事',
          evening: '慈悲愿牌仪式·全员悬挂·回程',
          rituals: ['放生·放愿', '慈悲晚课', 'ESG 闭门会', '慈悲愿牌仪式'],
        },
      ],
      mentorTeam: [
        { name: '某某尼师', title: '蓝毗尼当地尼师', bio: '在蓝毗尼奉献 30 年,运营着一所收容贫困儿童的学校,被当地视为活菩萨' },
        { name: '李博士', title: '清华公益慈善研究院', bio: '研究 ESG 与企业社会责任 15 年,著有《有意义的资本》' },
        { name: 'ZUTING ESG 顾问', title: '前世界 500 强 ESG 总监', bio: '为多家上市公司设计 ESG 战略,精通"如何让公益不流于形式"' },
      ],
      deliverables: [
        '"我们捐建的乡村教室"挂牌(以企业名义,永久挂在当地学校)',
        '与贫困儿童的合影 + 后续 3 年的成长跟踪报告',
        '《慈悲之旅纪念册》',
        '高管闭门会写下的"三件真正有意义的事"·12 个月后我们会回来跟进',
        '慈悲愿牌·全员永久悬挂在当地寺院',
        '8 分钟感人短片(可作为公司 ESG 报告核心素材)',
      ],
      targetAudience: [
        '已经成功但创始人开始问"为什么"的公司',
        '正在做 ESG 战略但不知道怎么落地的企业',
        '希望把公益沉淀为公司基因的组织',
        '高管/员工出现"意义感缺失"的成熟公司',
      ],
      whyZuting: [
        '蓝毗尼是佛陀诞生地,做慈悲主题的精神能量无可替代',
        '我们与当地尼师/学校有长期合作,所有捐赠都真实落到孩子手上',
        '我们做"持续的"公益,不是一次性走过场——12 个月后会回来跟进',
        '所有交付物都可成为公司年度 ESG 报告的核心素材',
      ],
    },
    priceFrom: 358000,
    durationDays: 3,
    sortOrder: 50,
  },

  // ════════ 06 坚毅之旅 ════════
  {
    slug: 'jianyi',
    title: '坚毅之旅',
    subtitle: '在逆境中重生 · 韧性维度',
    description:
      '为挑战中的团队设计:高山、夜行、守夜、断食小修。让组织在身体与意志的考验中重新出发。这是一次为期 6 天的极限韧性工程,我们带核心团队走入沙特圣地朝圣路线,通过沙漠静默、高山徒步、断食守夜——所有人类宗教传统中最严酷的修炼方式——把团队从困境的灰烬中重新点燃。',
    color: '#1e4dcc',
    icon: '✶',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600',
    keywords: ['坚毅', '突破', '重生', '逆境', '韧性'],
    holySites: ['mecca'],
    routes: [],
    rituals: [
      { name: '入沙漠·静默', durationMin: 240, description: '沙漠静坐三小时·关闭所有电子设备' },
      { name: '高山徒步', durationMin: 480, description: '8 小时山地徒步·考验意志' },
      { name: '守夜礼', durationMin: 600, description: '全队登山到山顶守夜一晚·见证日出' },
      { name: '断食日', durationMin: 720, description: '团队断食一日·只在日落后进餐(模拟斋月)' },
      { name: '晨光发愿礼', durationMin: 60, description: '日出时刻所有人齐发新愿' },
      { name: '困境闭门会', durationMin: 240, description: '高管闭门面对真问题·没有逃避·没有 PPT' },
      { name: '集体宣言', durationMin: 90, description: '在极限考验后的集体宣言时刻' },
      { name: '凯旋归来', durationMin: 60, description: '朝圣证书颁发 + 集体合影' },
    ],
    richContent: {
      dimension: { code: '06', label: '韧性维度', kicker: '困境突围 · 变革重生 · 士气重塑' },
      founderPainPoint: {
        title: '公司遭遇重大挫折,创始人知道:这时候说什么都没用',
        body: '融资失败、裁员、产品出问题、市场转向——公司遭遇重大挫折。团队士气低迷,核心干部开始动摇,内部弥漫着失败主义气氛。所有的鼓舞人心的演讲都失效了,因为团队需要的不是话术,是一次彻底的洗礼——把所有人从舒适的失败感里拽出来,在身体与意志的极限考验中重新找回那个"我们曾经是什么样的人"。这不是团建,是组织的休克疗法。',
        signs: [
          '公司刚经历裁员/融资失败/产品危机',
          '创始人的鼓舞演讲已经不再有效',
          '核心干部开始私下接 offer',
          '团队会议上出现明显的失败主义和相互埋怨',
          '创始人自己也开始怀疑"我们是不是真的不行了"',
        ],
      },
      philosophy: {
        title: '12 大信仰中的"苦修"是重生的火炼',
        body: '《孟子》说"天将降大任于斯人也,必先苦其心志,劳其筋骨,饿其体肤,空乏其身"。伊斯兰的"圣战"(jihad)真正的内涵是"克己之战"。佛教说"难行能行,难忍能忍"。《周易》说"天行健,君子以自强不息"。所有伟大的文明都告诉我们一件事:真正的重生,必须经过身体的火炼。一次极限的、让全身每一个细胞都参与的考验,胜过 100 次会议室里的鼓舞。',
        quotes: [
          { source: '《孟子·告子下》', text: '天将降大任于斯人也,必先苦其心志,劳其筋骨,饿其体肤,空乏其身' },
          { source: '《古兰经》', text: '坚忍者将获得无量的报酬' },
          { source: '《六祖坛经》', text: '难行能行,难忍能忍' },
          { source: '《周易·乾卦》', text: '天行健,君子以自强不息' },
        ],
      },
      dailyItinerary: [
        {
          day: 1,
          title: '入沙漠·关电子·静默',
          location: '中东·沙漠营地',
          morning: '抵达·入沙漠·所有人交出手机和电脑(全程 6 天无电子设备)',
          afternoon: '沙漠静坐 3 小时·什么都不做·只面对自己',
          evening: '篝火夜话·创始人讲"这次我们到底输在哪里"',
          rituals: ['入沙漠·静默'],
        },
        {
          day: 2,
          title: '高山徒步 · 极限考验 Day1',
          location: '沙漠 → 山地',
          morning: '5:00 起床·开始高山徒步',
          afternoon: '继续徒步·总共 8 小时·所有人都到达自己的极限',
          evening: '山中营地·分享"今天最想放弃的那一刻"',
          rituals: ['高山徒步'],
        },
        {
          day: 3,
          title: '守夜礼 · 山顶过夜',
          location: '山地·山顶',
          morning: '继续徒步到山顶',
          afternoon: '搭建守夜营地·准备守夜物品',
          evening: '山顶守夜一晚·全员清醒·等待日出',
          rituals: ['守夜礼'],
        },
        {
          day: 4,
          title: '断食日 · 身体的火炼',
          location: '山地营地',
          morning: '团队断食一日·只允许喝水',
          afternoon: '继续断食·身体被迫诚实',
          evening: '日落后第一餐·感受食物之珍贵',
          rituals: ['断食日'],
        },
        {
          day: 5,
          title: '晨光发愿 · 困境闭门',
          location: '山地营地',
          morning: '5:00 晨光发愿礼·日出时刻所有人齐发新愿',
          afternoon: '困境闭门会·高管面对真问题·没有逃避·没有 PPT·写下"未来 90 天的三个真行动"',
          evening: '集体宣言·把所有人从灰烬中拉起',
          rituals: ['晨光发愿礼', '困境闭门会', '集体宣言'],
        },
        {
          day: 6,
          title: '凯旋归来',
          location: '山地 → 回程',
          morning: '下山·朝圣证书颁发(由当地导师颁发)',
          afternoon: '集体合影·归还电子设备',
          evening: '回程·解散·每人带走一枚象征"重生"的信物',
          rituals: ['凯旋归来'],
        },
      ],
      mentorTeam: [
        { name: '阿卜杜拉某某', title: '中东沙漠朝圣向导(20 年经验)', bio: '带领过无数西方企业家完成沙漠极限挑战,精通"用身体重启心智"' },
        { name: '刘教授', title: '北大组织行为学教授', bio: '研究"组织危机与重建"20 年,著有《灰烬中的凤凰》' },
        { name: 'ZUTING 极限策划师', title: '前特种部队心理教官', bio: '设计过多套极限场景下的团队重塑工程,精通安全与意志的平衡' },
      ],
      deliverables: [
        '朝圣证书(由当地导师 + ZUTING 联合颁发)',
        '"重生信物"·每人一枚',
        '《极限 6 日》全程纪录视频(8 分钟精剪 + 30 分钟完整版)',
        '困境闭门会写下的"未来 90 天三个真行动"',
        '专业摄影师全程影像档案(包括极限时刻)',
        '12 个月组织韧性陪伴(免费 · 每月一次复盘会)',
      ],
      targetAudience: [
        '刚遭遇重大挫折的公司(裁员/融资失败/产品危机)',
        '正在变革转型期的组织',
        '士气低迷需要重塑的核心团队',
        '创始人感到"说什么都没用"的极端时刻',
      ],
      whyZuting: [
        '我们设计的不是"户外拓展",是真正的"组织休克疗法"',
        '所有极限活动都有专业安全保障(20 年经验向导 + 医疗组随行)',
        '中东沙漠+高山+守夜+断食,这套组合是国内独家',
        '极限考验不是目的,目的是让团队从灰烬中重新看见火种',
      ],
    },
    priceFrom: 798000,
    durationDays: 6,
    sortOrder: 60,
  },
];

async function main() {
  console.log('[seed-team-culture] start');

  for (const t of themesData) {
    await prisma.teamCultureTheme.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }
  console.log(`[seed-team-culture] ✓ ${themesData.length} themes upserted (with rich content)`);

  const tongxin = await prisma.teamCultureTheme.findUnique({ where: { slug: 'tongxin' } });
  const ganen = await prisma.teamCultureTheme.findUnique({ where: { slug: 'ganen' } });
  const chuancheng = await prisma.teamCultureTheme.findUnique({ where: { slug: 'chuancheng' } });
  const jiangxin = await prisma.teamCultureTheme.findUnique({ where: { slug: 'jiangxin' } });
  const cibei = await prisma.teamCultureTheme.findUnique({ where: { slug: 'cibei' } });

  const casesData = [
    {
      slug: 'case-tech-tongxin-2025',
      teamName: '某互联网公司技术中台 50 人团队',
      orgType: 'ENTERPRISE' as const,
      industry: '互联网',
      themeId: tongxin?.id ?? null,
      headcount: 50,
      story:
        '在连续加班半年后,技术中台团队来到少林寺与武当山,进行了为期 4 天的"同心之旅"。从晨钟到暮鼓,从齐诵祖训到同行登山,团队在朝圣的每一步中重新找到工作之外的连接。回到岗位后,技术债清理速度提升 40%,离职率下降明显。',
      highlights: ['团队凝聚显著提升', '离职率下降', '协作效率 +40%'],
      photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'],
      testimonial: '这是我做过最有意义的团建。— 技术总监',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-exec-ganen-2025',
      teamName: '某上市公司高管团队 18 人',
      orgType: 'EXECUTIVE' as const,
      industry: '高端制造',
      themeId: ganen?.id ?? null,
      headcount: 18,
      story:
        '在年度战略复盘前,18 位 VP 与事业部总裁走进曲阜孔庙,进行 3 天"感恩之旅"。在大成殿前向至圣先师致敬,在杏坛之下重读《学记》。回到公司后,董事会与高管层在战略对齐与决策共识上效率显著提升。',
      highlights: ['高管层共识对齐', '战略决策提速', '组织信念升华'],
      photos: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'],
      testimonial: '让我们重新理解了"领导者"三个字。— CEO',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-family-chuancheng-2025',
      teamName: '某百年家族企业接班人团队 12 人',
      orgType: 'FAMILY_OFFICE' as const,
      industry: '家族控股',
      themeId: chuancheng?.id ?? null,
      headcount: 12,
      story:
        '第三代接班人与第二代创始人共同走入曹溪祖庭,在五系印的传承之间,完成了从"被指定"到"主动担当"的心智转换。受印礼那一刻,年轻一代第一次明白家族基业的重量。',
      highlights: ['接班人心智成熟', '家族共识凝聚', '使命主动承接'],
      photos: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'],
      testimonial: '我终于知道为什么爷爷那一辈能撑过那么多次危机。— 接班人代表',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-rd-jiangxin-2025',
      teamName: '某新能源车企研发核心 30 人',
      orgType: 'ENTERPRISE' as const,
      industry: '新能源汽车',
      themeId: jiangxin?.id ?? null,
      headcount: 30,
      story:
        '在新车发布前 3 个月,研发团队走进日本法隆寺,看千年木构如何挺立。回到工厂后,工程师们重新审视每一颗螺丝、每一行代码——"我们也要造能传 100 年的东西"。',
      highlights: ['工程师信念重塑', '良品率 +12%', '团队留存率提升'],
      photos: ['https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800'],
      testimonial: '原来工程师可以是匠人,不只是螺丝钉。— 总工',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      slug: 'case-ngo-cibei-2025',
      teamName: '某国际公益基金会项目组 22 人',
      orgType: 'NGO' as const,
      industry: '公益慈善',
      themeId: cibei?.id ?? null,
      headcount: 22,
      story:
        '在尼泊尔蓝毗尼朝圣期间,公益基金会的项目组完成了为期 3 天的"慈悲之旅"。施食、捐书、助学,从被动执行项目转向主动发心助人。回到工作中,项目执行效率与团队凝聚力同步提升。',
      highlights: ['团队发心强化', '项目效率 +25%', '使命感升华'],
      photos: ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'],
      testimonial: '我们不再只是"做项目",我们在"行愿"。— 项目总监',
      consentSigned: true,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const c of casesData) {
    await prisma.teamCase.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }
  console.log(`[seed-team-culture] ✓ ${casesData.length} cases upserted`);

  console.log('[seed-team-culture] done ✓');
}

main()
  .catch((e) => {
    console.error('[seed-team-culture] FAILED', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
