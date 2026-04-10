/**
 * M38.4 经论++ v4 — 7个弱传统全面补齐
 * 触发: 经论++ (2026-04-10 第三轮)
 *
 * 本轮目标:
 *   - INDIGENOUS +3 (黑麋鹿如是说/酋长西雅图演讲/乌班图智慧)
 *   - SIKHISM +2 (雷赫拉斯晚祷/锡克十戒)
 *   - SHINTO +2 (延喜式祝词/神皇正统记)
 *   - TIBETAN +2 (大圆满前行/冈波巴大手印)
 *   - BAHAI +1 (巴孛选集)
 *   - ISLAM +2 (幸福炼金术/穆斯林圣训)
 *   - JUDAISM +2 (父辈箴言/哈西德故事)
 *
 * 共14部新经论，每部2章 ≈ 28章
 * 执行: npx tsx prisma/seed-scriptures-v4.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChapterDef {
  chapterNo: number;
  title: string;
  subtitle?: string;
  originalText: string;
  commentary?: string;
  keyQuotes?: { quote: string; explanation: string }[];
  practiceHint?: string;
}

interface NewScriptureDef {
  slug: string;
  title: string;
  titleEn?: string;
  author?: string;
  era?: string;
  ring: number;
  categorySlug: string;
  summary: string;
  significance?: string;
  difficulty: number;
  oxStageMin: number;
  oxStageMax: number;
  readingMins?: number;
  tags: string[];
  sortOrder: number;
  relatedSlugs?: string[];
  chapters: ChapterDef[];
}

const NEW_SCRIPTURES: NewScriptureDef[] = [
  // ─── INDIGENOUS +3 ──────────────────────────────────
  {
    slug: 'black-elk-speaks', title: '黑麋鹿如是说', titleEn: 'Black Elk Speaks',
    author: '黑麋鹿(Black Elk)口述 / 约翰·奈哈特记录', era: '1932年出版',
    ring: 3, categorySlug: 'indigenous',
    summary: '美洲苏族(Lakota)圣人黑麋鹿的自传与预言，记录了19世纪末北美原住民的灵性宇宙观与悲惨命运。',
    significance: '20世纪最重要的北美原住民灵性文献，荣格、坎贝尔、基督教神学家都从中汲取智慧。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 45,
    tags: ['苏族', '黑麋鹿', '大异象', '神圣环'], sortOrder: 10,
    relatedSlugs: ['popol-vuh', 'dreamtime'],
    chapters: [
      {
        chapterNo: 1, title: '大异象', subtitle: '神圣之树与圆环',
        originalText: '我九岁时生了一场大病，在病中我得到了一个伟大的异象：我看见天上的六位祖父坐在一个大圆环中，他们代表六个方向——东、南、西、北、上、下。\n\n祖父们对我说："看吧，这就是你族人的命运。看这条神圣之树，它站在世界的中心。只要这棵树还绿着，你的族人就会兴旺。"\n\n然后他们给我看了万物相连的景象——每一片草、每一块石头、每一只动物、每一个人，都是这个大圆环的一部分。没有什么是孤立的。\n\n但我也看见了大树开始枯萎，我的族人开始分散，圆环开始破碎。我的心充满了悲伤。',
        commentary: '黑麋鹿九岁的"大异象"是北美原住民灵性的经典 — 万物相连、神圣圆环、中心之树。',
        keyQuotes: [
          { quote: '只要这棵树还绿着，你的族人就会兴旺', explanation: '每个文化、每个企业都有自己的"中心之树" — 核心价值。它活着，事业就活着。' },
          { quote: '没有什么是孤立的', explanation: '生态思维的源头 — 商业决策必须考虑它对整个生态圈的影响。' },
        ],
        practiceHint: '画一个圆，把你生活中所有的"角色"(员工/家人/朋友/客户/社区)放在圆上。感受它们如何相连。',
      },
      {
        chapterNo: 2, title: '圆环的智慧', subtitle: '万物以圆圈运行',
        originalText: '你注意到印第安人所做的一切都在一个圆圈里吗？那是因为"权力"(Wakan Tanka伟大神秘)以圆圈运行，万物都努力成为圆的。\n\n在过去，我们的帐篷(tipi)都是圆的，我们的营地也排成圆圈。鸟儿的巢也是圆的，因为它们也有同样的宗教。太阳以圆圈划过天空。月亮做同样的事。连季节也在一个大圆圈中运行 — 春夏秋冬年复一年。\n\n人的生命也是一个圆圈——从儿童到儿童。在我们的生命里一切都回到它的起始处。所有那些还拥有权力的东西都是圆的。',
        commentary: '圆环是苏族宇宙观的核心符号 — 与西方线性进步观完全相反的循环智慧。',
        keyQuotes: [
          { quote: '人的生命也是一个圆圈——从儿童到儿童', explanation: '一生的尽头是回到孩子般的纯真。这不是退步，是圆满。' },
          { quote: '所有那些还拥有权力的东西都是圆的', explanation: '持久的事物都是循环的。企业家要建立循环而非线性的商业模式。' },
        ],
        practiceHint: '思考你的事业中哪些是"线性的消耗"(资源、注意力)，哪些可以变成"循环的再生"？列3个具体改变。',
      },
    ],
  },
  {
    slug: 'chief-seattle-speech', title: '酋长西雅图演讲', titleEn: 'Chief Seattle Speech',
    author: '西雅图酋长(Chief Seattle)', era: '1854年',
    ring: 3, categorySlug: 'indigenous',
    summary: '北美杜瓦米什族酋长西雅图对美国总统的著名演讲，阐述对土地、自然的神圣认知。现代生态运动的起点文献。',
    significance: '1970年代被重新发掘后，成为全球环保运动的精神宣言。西雅图城以他命名。',
    difficulty: 2, oxStageMin: 2, oxStageMax: 10, readingMins: 15,
    tags: ['西雅图', '生态', '土地', '原住民'], sortOrder: 11,
    relatedSlugs: ['black-elk-speaks'],
    chapters: [
      {
        chapterNo: 1, title: '土地不属于人', subtitle: '人属于土地',
        originalText: '华盛顿的大酋长捎信说他要买我们的土地。这怎么可能呢？你怎能买卖天空和土地的温暖？这念头对我们是那么陌生。\n\n如果我们并不拥有空气的清新和水流的闪光，你又如何能买它们呢？\n\n这片土地的每一部分对我的人民都是神圣的。每一片闪亮的松针，每一个沙滩，每一片幽暗森林里的雾霭，每一只鸣虫 — 在我的人民的记忆和经历中都是神圣的。\n\n我们知道：土地不属于人，人属于土地。我们也知道：万物都如血液一样相连，将家庭结合在一起。凡是临到土地的，也必临到土地之子。',
        commentary: '西雅图酋长最核心的哲学 — 颠倒了西方"拥有土地"的观念，人只是土地的一部分。',
        keyQuotes: [
          { quote: '土地不属于人，人属于土地', explanation: '颠倒所有权思维 — 你不拥有公司/资源，你只是暂时被托付。这种心态创造最长久的事业。' },
          { quote: '凡是临到土地的，也必临到土地之子', explanation: '生态因果律 — 你对环境做的一切，终将回到你身上。' },
        ],
        practiceHint: '下次说"我的公司/我的团队"时，改成"我管理的..."。观察一周后心态的变化。',
      },
      {
        chapterNo: 2, title: '一切相连', subtitle: '子孙的眼光',
        originalText: '你的命运对我们是一个谜。当所有的野牛都被屠尽，所有的野马都被驯服，神秘的森林里到处是人类的气味，翠绿丘陵上遍布喧哗电线的时候，那又会是怎样？\n\n密林何处？没有了。\n雄鹰何在？没有了。\n\n与迅捷的野马和狩猎告别就是生命的终结，生存的开始。\n\n无论我们做什么决定，都要考虑我们的决定如何影响未来七代人。这是我们祖先的教导。',
        commentary: '著名的"七代原则" — 北美原住民决策智慧的精髓。',
        keyQuotes: [
          { quote: '考虑我们的决定如何影响未来七代人', explanation: '七代原则 = 180年视角。你的商业决策如果放在这个尺度，80%会改变。' },
          { quote: '与迅捷的野马和狩猎告别就是生命的终结，生存的开始', explanation: '失去与自然的连接不是进步，是一种文明的死亡。' },
        ],
        practiceHint: '做下一个重要决定前问自己："这个决定对100年后的人会是祝福还是诅咒？"用这个标准重新评估。',
      },
    ],
  },
  {
    slug: 'ubuntu-wisdom', title: '乌班图智慧', titleEn: 'Ubuntu Wisdom',
    author: '非洲班图语系各民族口传', era: '古老至今',
    ring: 3, categorySlug: 'indigenous',
    summary: '非洲班图哲学核心概念"Ubuntu"(我因众人而在)的智慧集成，曼德拉、图图大主教的精神源泉。',
    significance: '非洲对人类哲学最大的贡献 — 以"我们"而非"我"为本体的存在观，是南非后种族隔离和解运动的基石。',
    difficulty: 2, oxStageMin: 2, oxStageMax: 10, readingMins: 20,
    tags: ['乌班图', '非洲', '曼德拉', '共同体'], sortOrder: 12,
    relatedSlugs: ['black-elk-speaks', 'chief-seattle-speech'],
    chapters: [
      {
        chapterNo: 1, title: '我因众人而在', subtitle: 'Ubuntu的核心',
        originalText: '乌班图(Ubuntu)是一个非洲词，无法直译。最接近的翻译是："我因众人而在。"(I am because we are.)\n\n一个拥有乌班图的人是慷慨的、好客的、友善的、关怀的、富有同情心的。他们不觉得别人的好是对自己的威胁，因为他们清楚地知道：他们属于一个更大的整体，当别人被羞辱或压迫时，他们也被降低或削弱了。\n\n图图大主教说："非洲人有一句谚语：一个人不能独自是一个人。我们相互属于。你不能孤立地成为人类。"\n\n曼德拉说："只有通过乌班图，我们才能真正成为人。一个独自坐在角落吃东西而不分享给路过的陌生人的人，不是真正的人。"',
        commentary: 'Ubuntu哲学颠覆了西方个人主义 — 人的本质是关系，不是独立个体。',
        keyQuotes: [
          { quote: '我因众人而在', explanation: 'Ubuntu核心命题。你的成就不是"你的"，是所有支持你的人共同的成就。这份感恩是领导力的源泉。' },
          { quote: '一个人不能独自是一个人', explanation: '孤立的"个人成功"在非洲哲学中不存在。真正的成功必然包含周围人的繁荣。' },
        ],
        practiceHint: '列出让你今天能坐在这里工作的10个人(父母/老师/同事/供应商...)。花5分钟感恩他们。',
      },
      {
        chapterNo: 2, title: '真相与和解', subtitle: '南非的Ubuntu实践',
        originalText: '图图大主教在南非真相与和解委员会中说："没有宽恕就没有未来。"\n\nUbuntu的智慧告诉我们：当你伤害别人时，你也在伤害自己，因为我们相互连接。同样，当你宽恕别人时，你也在解放自己。\n\n在乌班图传统中，判决一个犯错者的社区不是问："你做了什么？"而是问："是什么让你做了这件事？是什么让你失去了与社区的连接？"\n\n修复的目标不是惩罚，而是让这个人重新回到社区。因为如果他不回来，社区本身就是不完整的。',
        commentary: '南非1995年真相与和解委员会是Ubuntu哲学的现代实践 — 以修复代替报复。',
        keyQuotes: [
          { quote: '没有宽恕就没有未来', explanation: '心中有恨的人走不远。企业家面对背叛时的选择决定你的格局。' },
          { quote: '是什么让你做了这件事？', explanation: '比"你错了什么"更深的问题。理解原因才能真正修复。' },
        ],
        practiceHint: '想一个你还不能原谅的人。今天只做一件事 — 问自己："是什么让他们那样做？"不为原谅，只为理解。',
      },
    ],
  },

  // ─── SIKHISM +2 ─────────────────────────────────
  {
    slug: 'rehras-sahib', title: '雷赫拉斯晚祷', titleEn: 'Rehras Sahib',
    author: '锡克十古鲁集锦', era: '15-17世纪',
    ring: 3, categorySlug: 'sikhism',
    summary: '锡克教每日晚祷祈祷文，收录古鲁纳纳克、阿曼达斯、拉姆达斯、阿尔君、戈宾德·辛格五位古鲁的颂歌。',
    significance: '锡克人每天日落后必诵，是一日辛劳后的精神洗涤，提醒"一切有主"。',
    difficulty: 2, oxStageMin: 2, oxStageMax: 9, readingMins: 15,
    tags: ['雷赫拉斯', '晚祷', '感恩', '锡克'], sortOrder: 10,
    relatedSlugs: ['japji-sahib', 'sukhmani'],
    chapters: [
      {
        chapterNo: 1, title: '日落感恩', subtitle: '一切来自主',
        originalText: '我向那真名鞠躬，那超越时间的存在。\n\n主啊，无论我得到什么，都是你的馈赠。我只是一个接受者。\n\n白天我奔波劳碌，追逐这个追逐那个，忘记了你。现在太阳下山了，让我回到你这里，数一数你今天给我的所有祝福。\n\n食物是你给的，水是你给的，空气是你给的，我所接触的每一个人也是你派来的。甚至我的呼吸都不是我的 — 它每一刻都是你的恩赐。\n\n那些认为"这是我的"的人活在幻觉中。那些说"一切是你的"的人才真正富有。',
        commentary: 'Rehras Sahib 的核心主题 — 一日结束时的感恩与归零。',
        keyQuotes: [
          { quote: '一切来自主，我只是一个接受者', explanation: '锡克的感恩观 — 成就不属于你，你只是通道。这种心态让人谦卑而不失力量。' },
          { quote: '那些说"一切是你的"的人才真正富有', explanation: '真正的富有不是拥有多少，而是感恩多少。' },
        ],
        practiceHint: '今晚睡前花5分钟，不打开手机，只回想今天你得到的10件礼物(哪怕最小的)。说10次"谢谢"。',
      },
      {
        chapterNo: 2, title: '晚祷的力量', subtitle: '梦中神识',
        originalText: '古鲁阿尔君说："谁若在夜晚不忘记主，他的梦也会变得神圣。谁若入睡前念诵主名，他的每一个细胞都在祷告。"\n\n白天你属于世界，晚上你属于自己。让这个自己属于主。\n\n劳累的农夫、疲惫的工匠、焦虑的商人——当你们把一天的重担交给主时，你们就像婴儿在母亲的怀里入睡。明早醒来，你会发现问题没有变，但你的力量变了。\n\n记住：主从不睡觉。你的担忧由他接管。',
        commentary: '锡克晚祷的心理学 — 通过把担忧"交出去"获得真正的休息。',
        keyQuotes: [
          { quote: '白天你属于世界，晚上你属于自己', explanation: '晚上是最重要的修行时间。如果你晚上仍在工作，你就失去了自我。' },
          { quote: '问题没有变，但你的力量变了', explanation: '真正的改变不是改变外境，而是改变你面对外境的能量。' },
        ],
        practiceHint: '今晚睡前做一个仪式：写下3件担忧的事，然后说"这些我交出去了"。把纸放到枕头下，明早看看感受。',
      },
    ],
  },
  {
    slug: 'sikh-ten-vows', title: '锡克十誓', titleEn: 'Ten Principles of Sikhism',
    author: '古鲁戈宾德·辛格(第十任古鲁)', era: '1699年',
    ring: 3, categorySlug: 'sikhism',
    summary: '第十任古鲁戈宾德·辛格创立"卡尔萨"(Khalsa)战士教团时所订的十条根本戒律，塑造了锡克人的骨气。',
    significance: '锡克教从灵修走向行动的标志 — 圣人即战士，修道院即战场。',
    difficulty: 3, oxStageMin: 4, oxStageMax: 9, readingMins: 20,
    tags: ['戈宾德辛格', '卡尔萨', '戒律', '战士'], sortOrder: 11,
    relatedSlugs: ['japji-sahib', 'rehras-sahib'],
    chapters: [
      {
        chapterNo: 1, title: '十戒之本', subtitle: '崇拜唯一真神',
        originalText: '古鲁戈宾德·辛格向卡尔萨宣布：\n\n1. 只崇拜唯一真神(Waheguru)，不拜偶像、不拜人、不拜墓。\n2. 诚实劳动获取生活所需，不靠乞讨或诈骗。\n3. 与众分享所得的十分之一(Dasvandh)，帮助有需要的人。\n4. 永远记诵主名，无论工作还是休息。\n5. 视所有人类为一家，无种姓、无贵贱、无男女高下。\n6. 抵抗不公正，即使付出生命的代价。保护弱者。\n7. 不偷盗，不奸淫，不贪婪，不说谎，不赌博。\n8. 不使用烟草、酒、麻醉品 — 头脑必须清明。\n9. 不剪发，佩戴五K(梳子/短裤/手镯/短剑/未剪之发)，外在即是内在的提醒。\n10. 女性与男性完全平等，女性也是卡尔萨战士。',
        commentary: '锡克十戒既是灵修又是社会改革 — 400年前就破除种姓与性别歧视。',
        keyQuotes: [
          { quote: '视所有人类为一家，无种姓、无贵贱、无男女高下', explanation: '17世纪的锡克就已经反对种姓制度 — 这是灵性直觉带来的社会革新。' },
          { quote: '抵抗不公正，即使付出生命的代价', explanation: '锡克精神 = 圣人+战士。灵修不是逃避，而是更勇敢地介入世界。' },
        ],
        practiceHint: '选十戒中一条你最难做到的，作为本周的修行。不用全部，一条即可。',
      },
      {
        chapterNo: 2, title: '十分之一', subtitle: 'Dasvandh的智慧',
        originalText: '古鲁戈宾德·辛格说："你的收入中有十分之一不是你的 — 那是属于社区的，属于那些比你更需要的人的。"\n\n这不是施舍，这是正义。因为你的成功从来不是你一个人的 — 社会给了你环境、客户、教育、健康。当你成功时，你有义务把一部分还回去。\n\n锡克商人在经商中最被信任，因为他们知道：每一笔交易都有一个"隐藏的股东" — 那些需要帮助的人。\n\n给出去的十分之一不是失去，而是让你的生意有了神圣的意义，让你在困难时得到祝福。',
        commentary: 'Dasvandh(十分之一奉献)是锡克教义的经济实践 — 17世纪就有的社会企业概念。',
        keyQuotes: [
          { quote: '你的收入中有十分之一不是你的', explanation: '这不是道德要求，是事实认知。你的成功依赖无数人。' },
          { quote: '给出去的十分之一让你的生意有了神圣的意义', explanation: '布施不是负担，是意义。企业家最缺的不是钱，是意义。' },
        ],
        practiceHint: '计算你过去一年收入的10%。不用全部捐出，但本月至少捐1%，并找一个让你感动的受助者。',
      },
    ],
  },

  // ─── SHINTO +2 ─────────────────────────────
  {
    slug: 'engishiki-norito', title: '延喜式祝词', titleEn: 'Engishiki Norito',
    author: '藤原时平等编', era: '927年(延喜五年)',
    ring: 3, categorySlug: 'shinto',
    summary: '平安时代官修律令《延喜式》第八卷收录的27篇祝词，是日本神道正式祝词的最早汇编。',
    significance: '日本神道仪式的根本文本，至今神社仪式仍在使用其中的经典祝词。',
    difficulty: 4, oxStageMin: 3, oxStageMax: 8, readingMins: 25,
    tags: ['延喜式', '祝词', '神道', '平安'], sortOrder: 10,
    relatedSlugs: ['oharae', 'kojiki'],
    chapters: [
      {
        chapterNo: 1, title: '祈年祭祝词', subtitle: '春天的祈愿',
        originalText: '集まりし神官各々、谨みて恐み恐みも白さく。天照大御神以为万方之亲、本宗源祖也。地域之神、水神、火神、山神、田神、各以其职、济助皇孙尊。\n\n于是、春莺初鸣、土气上腾、农人将事、神以佑之。愿五谷丰登、蚕桑茂盛、无虫无灾、无水旱之忧。\n\n百官庶民、各获其所、各尽其职、以报神恩。\n\n再拜、再拜。',
        commentary: '祈年祭是日本神道最重要的春季祭祀 — 祈求一年农事顺利。',
        keyQuotes: [
          { quote: '各以其职、济助皇孙尊', explanation: '神道宇宙观 — 众神各司其职，共同支持人间。这是日本式管理哲学的源头。' },
          { quote: '各获其所、各尽其职', explanation: '每个人都在正确位置做正确的事 — 这是最高的组织状态。' },
        ],
        practiceHint: '回顾你团队中每个人的"职"是否匹配他的"所"。错位的人，本月重新调整。',
      },
      {
        chapterNo: 2, title: '六月晦大祓', subtitle: '半年清净',
        originalText: '诸々の罪あらむ、过ちあらむを祓え给い清め给えと申す。\n\n六月之晦、天地自然之节。半年过去、尘染积累、心神疲敝。此时当祓之。\n\n如高山之雪融入川、如大海之潮卷走沙、如烈风吹散云，我等身上之罪、口上之过、心中之垢，皆随此祓而去。\n\n祓ひ给ひ清め给へ、神清し、心清し。',
        commentary: '大祓(おおはらえ)是日本神道最重要的净化仪式 — 半年一次的心灵重启。',
        keyQuotes: [
          { quote: '半年过去、尘染积累、心神疲敝，此时当祓之', explanation: '每半年做一次心灵"大扫除" — 这是企业家防止倦怠的关键。' },
          { quote: '神清し、心清し', explanation: '神圣与清净本是一回事。清净的心就是神。' },
        ],
        practiceHint: '选一天作为你的"个人大祓日" — 不工作、不看手机、只做清理(家/心/关系)。每半年一次。',
      },
    ],
  },
  {
    slug: 'jinno-shotoki', title: '神皇正统记', titleEn: 'Jinno Shotoki',
    author: '北畠亲房', era: '1339年',
    ring: 3, categorySlug: 'shinto',
    summary: '南北朝时代北畠亲房在战乱中写就的日本历史哲学书，确立"日本是神国"的思想，影响日本精神数百年。',
    significance: '日本神道政治哲学的奠基之作，明治维新的思想源泉之一。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 8, readingMins: 35,
    tags: ['北畠亲房', '神国', '正统', '皇统'], sortOrder: 11,
    relatedSlugs: ['kojiki', 'nihon-shoki'],
    chapters: [
      {
        chapterNo: 1, title: '大日本神国也', subtitle: '开篇立论',
        originalText: '大日本者神国也。天祖始めて基を开き、日神长く统を伝へ给ふ。我が国のみ此の事あり。异朝には其の类なし。此の故に神国と云ふなり。\n\n神代には天地未だ别れず、阴阳分れず、混沌の中に生ずる所の神あり、造化の神、天地を开きし神なり。\n\n人间の国も、本を忘れず、始めを慎めば、末を全うすべし。国家も同じ。',
        commentary: '《神皇正统记》开宗明义 — 日本是神国，这是北畠亲房在南北朝战乱中为正统留下的精神遗产。',
        keyQuotes: [
          { quote: '本を忘れず、始めを慎めば、末を全うすべし', explanation: '不忘初心，谨慎开始，才能善终。这是任何事业的根本法则。' },
          { quote: '异朝には其の类なし', explanation: '日本独特性的宣言 — 意识到自己的独特才能创造独特的价值。' },
        ],
        practiceHint: '写下你事业的"神话起源" — 它是怎么开始的？这个"本"你还记得吗？本月用一件事回到它。',
      },
      {
        chapterNo: 2, title: '正统论', subtitle: '德与位',
        originalText: '正统とは、位にあらず、徳にあり。位高くして徳なきは僭なり。位低くして徳あるは隐君子なり。\n\n君たる者、民を子の如く视るべし。民を苦しめる者は、たとへ位高くとも、天命必ず去る。\n\n天下は一人の天下にあらず、天下の天下なり。故に君たる者、我欲を去り、公を以て天下と为す。',
        commentary: '北畠亲房的正统论 — 正统不在血脉位阶，而在德性与民心。',
        keyQuotes: [
          { quote: '正统とは、位にあらず、徳にあり', explanation: '真正的正当性不来自职位，来自德行。企业家的权威靠德立，不靠title。' },
          { quote: '天下は一人の天下にあらず、天下の天下なり', explanation: '天下不是一个人的，是天下人的。企业也不是老板一个人的。' },
        ],
        practiceHint: '今天做一件"有位但无权"的决定 — 用德行而不是职位去说服一个人。体会真正的领导力。',
      },
    ],
  },

  // ─── TIBETAN +2 ───────────────────────────
  {
    slug: 'kunzang-lama', title: '普贤上师言教', titleEn: 'Words of My Perfect Teacher',
    author: '华智仁波切(Patrul Rinpoche)', era: '19世纪',
    ring: 3, categorySlug: 'tibetan',
    summary: '藏传宁玛派大圆满前行教授的经典版本，华智仁波切以通俗生动的语言讲解大圆满修行的前行与正行。',
    significance: '被誉为"藏传佛教最好的入门书"，达赖喇嘛推崇为"修行者必读"。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 50,
    tags: ['华智', '大圆满', '前行', '宁玛'], sortOrder: 10,
    relatedSlugs: ['bodhicaryavatara', 'bardo-thodol', 'lamrim'],
    chapters: [
      {
        chapterNo: 1, title: '暇满人身', subtitle: '难得的机会',
        originalText: '华智仁波切说："你是否意识到，你现在拥有的这个人身是多么珍贵？佛陀曾打比方：一只瞎眼的乌龟在大海中浮游，大海上漂着一个木轭。每一百年乌龟浮出水面一次。它恰好把头伸进木轭的概率有多大？\n\n得到人身的机会比这还要小。"\n\n"这个人身有八种闲暇和十种圆满 — 你没有生在地狱，没有生为畜生，没有生在没有佛法的地方，没有残障无法听闻佛法，你有智力，你遇到了法，你有机会修行...\n\n暇满人身难得今已得，佛法难闻今已闻，若此生不向解脱之道努力，后世何时才能再得此机？"',
        commentary: '藏传修行的第一课 — 强烈意识到人身难得，才能真正珍惜修行。',
        keyQuotes: [
          { quote: '暇满人身难得今已得', explanation: '活着本身就是奇迹。认识这一点，才会珍惜时间。' },
          { quote: '若此生不努力，后世何时才能再得此机', explanation: '紧迫感是修行的动力。不是恐惧，是清醒。' },
        ],
        practiceHint: '今天起床第一个念头："我又得到一天 — 我要怎么用？"不用多想，这个念头本身就是修行。',
      },
      {
        chapterNo: 2, title: '无常', subtitle: '生命如晨露',
        originalText: '华智仁波切说："观察无常是修行的第二课。\n\n有谁能保证今晚睡下去，明早还能醒来？没人能保证。死亡不会通知你它什么时候来。\n\n生命如同晨露 — 阳光一照就消失。如同风中的蜡烛 — 一阵风就灭。如同屠宰场上的牛 — 每一步都在靠近死亡。\n\n但请不要因此悲伤。无常的认识应该让你更珍惜每一刻，而不是让你消沉。无常让微不足道的事情变得神圣，让琐碎的对话变得珍贵。\n\n如果你真的知道这可能是你见母亲的最后一次，你会和她说什么？如果你真的知道今天是你工作的最后一天，你会用什么态度工作？"',
        commentary: '无常观是藏传修行的基石 — 不是悲观，而是强烈的珍惜。',
        keyQuotes: [
          { quote: '无常让微不足道的事情变得神圣', explanation: '知道一切都会失去，你才真正开始拥有。' },
          { quote: '如果你真的知道这可能是见母亲的最后一次', explanation: '这不是假设 — 这是事实。只是你假装不知道而已。' },
        ],
        practiceHint: '今天打电话给一个你很久没联系的人。假装这是最后一次。说出你一直想说但没说的话。',
      },
    ],
  },
  {
    slug: 'gampopa-mahamudra', title: '冈波巴大手印', titleEn: 'Gampopa Mahamudra Teachings',
    author: '冈波巴大师(Gampopa)', era: '12世纪',
    ring: 3, categorySlug: 'tibetan',
    summary: '藏传噶举派创始人冈波巴大师的大手印教言集，融合密勒日巴的实修与阿底峡的学理。',
    significance: '噶举派"白教"的根本教典，也是大手印(Mahamudra)禅法的权威阐释。',
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 45,
    tags: ['冈波巴', '大手印', '噶举', '密勒日巴'], sortOrder: 11,
    relatedSlugs: ['milarepa-songs', 'bodhicaryavatara'],
    chapters: [
      {
        chapterNo: 1, title: '心性光明', subtitle: '大手印见',
        originalText: '冈波巴说："心性本来清净光明，如镜本净，如空本空。\n\n你不需要去创造这个清净 — 它一直在那里。你只需要认出它。\n\n修行不是制造一个新的心，而是放下遮蔽本心的云 — 贪、嗔、痴、慢、疑。云散则日现。\n\n大手印的修行很简单：当念头起来时，不跟随它，不压制它，只是认出它的本质是空性的。这个「认出」本身就是觉醒。\n\n初学者以为要静坐很久才能见性。错了。见性就在此刻，就在你此刻的觉知中。所谓「修行」，只是让这个认识保持的时间越来越长而已。"',
        commentary: '大手印(Mahamudra)的核心 — 心性本自清净，修行只是"认出"而非"创造"。',
        keyQuotes: [
          { quote: '你不需要去创造这个清净，它一直在那里', explanation: '所有觉醒传统的共同发现。你追求的东西，你本来就是。' },
          { quote: '见性就在此刻', explanation: '不在未来的某个时刻，不在下次禅七。就在你读这行字的此刻。' },
        ],
        practiceHint: '此刻停下阅读3秒。注意你的觉知。那个"注意到"的东西就是心性。别抓，就让它在。',
      },
      {
        chapterNo: 2, title: '六法与方便', subtitle: '那若巴六法',
        originalText: '冈波巴说："那若六法是密勒日巴传给我的命根教法：拙火、幻身、梦瑜伽、光明、中阴、迁识。\n\n拙火 — 升起内在的热，烧尽烦恼。\n幻身 — 认出一切现象如梦如幻。\n梦瑜伽 — 在梦中保持觉知，死时也能觉知。\n光明 — 认出深睡时的本净光明。\n中阴 — 为死亡与转生做好准备。\n迁识 — 掌握意识转移的技术。\n\n这六法是方便，不是目的。目的是认识心的本性。六法好像渡河的船 — 到了彼岸就该放下。\n\n不要成为「法的囚徒」。法为你服务，你不为法服务。"',
        commentary: '那若巴六法是噶举派的核心密法 — 但冈波巴警告不要执着方法。',
        keyQuotes: [
          { quote: '法为你服务，你不为法服务', explanation: '一切方法都是工具，不要变成工具的奴隶。企业家警惕被"方法论"绑架。' },
          { quote: '六法好像渡河的船，到了彼岸就该放下', explanation: '放下工具的能力和掌握工具的能力同样重要。' },
        ],
        practiceHint: '列出你现在依赖的3个"方法/工具"(app/框架/流程)。问自己："如果没有它们，我还能达成目标吗？"',
      },
    ],
  },

  // ─── BAHAI +1 ──────────────────────────────
  {
    slug: 'bab-selections', title: '巴孛选集', titleEn: 'Selections from the Writings of the Bab',
    author: '巴孛(阿里·穆罕默德·设拉子)', era: '1844-1850年',
    ring: 3, categorySlug: 'bahai',
    summary: '巴哈伊信仰先驱巴孛的著作精选，他宣告"期待的一位"即将出现，为巴哈欧拉的降临铺路。',
    significance: '巴哈伊信仰的源头文本。巴孛33岁殉道，点燃了一场全新的世界宗教。',
    difficulty: 4, oxStageMin: 4, oxStageMax: 9, readingMins: 30,
    tags: ['巴孛', '先驱', '启示', '殉道'], sortOrder: 10,
    relatedSlugs: ['kitab-i-iqan', 'seven-valleys', 'hidden-words'],
    chapters: [
      {
        chapterNo: 1, title: '期待的一位', subtitle: '黎明的宣告',
        originalText: '巴孛说："我是伟大者的先驱。我来是为了告诉你们：他，那一位，即将显现。他的出现将比黎明还要明亮，他的真理将刺穿所有的面纱。\n\n准备好你们的心。因为当他出现时，许多人会因为他的光芒而转身离开 — 他们的眼睛习惯了黑暗，受不了光明。\n\n我说的一切，都是为了他铺路。我不是那一位 — 我只是他的门(Bab)。通过我走向他。"\n\n巴孛的名字"Bab"就是"门"的意思。他知道自己不是终极，只是通往终极的通道。',
        commentary: '巴孛清醒地知道自己是"先驱"而非"正主" — 这份谦卑塑造了巴哈伊的精神。',
        keyQuotes: [
          { quote: '我不是那一位，我只是他的门', explanation: '真正的伟大在于知道自己的位置。能做"门"而不做"神"的人，才是真正的伟人。' },
          { quote: '许多人会因为他的光芒而转身离开', explanation: '人类最深的恐惧是光明而不是黑暗。因为光明暴露了一切。' },
        ],
        practiceHint: '思考你的事业中你是"先驱"还是"终点"？很多时候把自己定位为"门"会让你走得更远。',
      },
      {
        chapterNo: 2, title: '为信仰赴死', subtitle: '巴孛的殉道',
        originalText: '1850年，波斯当局把巴孛绑在一块木板上，用750支枪瞄准他。\n\n枪声响起。硝烟散去后，人群惊呆了 — 巴孛不在那里。他消失了。\n\n士兵们在附近的房间找到他，他正在平静地对弟子说完最后的话。他转身说："现在你们可以完成你们的任务了。"\n\n第二轮枪声响起。这次，巴孛和弟子一同殉道。\n\n他的遗言是："呵，若我留到今日的清晨，我本想告诉你们关于那一位的更多事情。但这就是我的时候。我不为死亡悲伤 — 我为没能说尽我想说的话悲伤。"',
        commentary: '巴孛的殉道故事 — 一个33岁的年轻人平静面对死亡，只因他知道自己在为更大的事铺路。',
        keyQuotes: [
          { quote: '我不为死亡悲伤，我为没能说尽我想说的话悲伤', explanation: '真正的人生悲伤不是死亡本身，而是有话没说、有事没做。' },
          { quote: '现在你们可以完成你们的任务了', explanation: '对死亡的豁达来自知道"任务"比"个人"重要。' },
        ],
        practiceHint: '问自己："如果我明天死去，我最遗憾没做/没说的事是什么？"然后这周去做/去说它。',
      },
    ],
  },

  // ─── ISLAM +2 ──────────────────────────────
  {
    slug: 'alchemy-of-happiness', title: '幸福炼金术', titleEn: 'Kimiya-yi Sa\'adat',
    author: '伊玛目安萨里(Al-Ghazali)', era: '约1105年',
    ring: 3, categorySlug: 'islam',
    summary: '11世纪伊斯兰最伟大的神学家安萨里的波斯语著作，是其巨著《宗教科学的复兴》的简明版，讲解如何通过认识自己获得真正的幸福。',
    significance: '被誉为"伊斯兰世界的奥古斯丁忏悔录"。影响了托马斯·阿奎那、但丁、苏非主义整个传统。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 9, readingMins: 45,
    tags: ['安萨里', '苏非', '幸福', '自知'], sortOrder: 10,
    relatedSlugs: ['masnavi', 'rumi-garden', 'quran-fatiha'],
    chapters: [
      {
        chapterNo: 1, title: '认识自己', subtitle: '幸福的第一步',
        originalText: '安萨里说："真正的幸福不在外物中，而在认识自己。但「认识自己」到底意味着什么？\n\n你以为你认识自己——你知道你的名字、职业、家庭。但这只是关于你的信息，不是你自己。\n\n真正的自知包括：你从哪里来？你为什么来这里？你要去哪里？是什么让你幸福？是什么让你悲伤？\n\n大多数人对这些问题的答案是模糊的。他们活了一辈子，却不认识自己内心最深处的东西。这就像一个人拥有一座宫殿，却只住在门廊里，从未进入内殿。"',
        commentary: '安萨里把"认识自己"作为一切修行的起点，与苏格拉底、孔子殊途同归。',
        keyQuotes: [
          { quote: '你拥有一座宫殿，却只住在门廊里', explanation: '大多数人活了一辈子没有进入自己的深处。外在的成功无法填补内在的空洞。' },
          { quote: '真正的幸福不在外物中，而在认识自己', explanation: '幸福是内在品质，不是外在条件的结果。企业家追求幸福要向内求而非向外求。' },
        ],
        practiceHint: '今晚独处1小时，不看手机、不读书、不工作。只是坐着问自己："我现在真正感受到什么？"',
      },
      {
        chapterNo: 2, title: '心的城堡', subtitle: '四种力量',
        originalText: '安萨里说："心就像一座城堡，有四种力量守护着它：\n\n1. 天使的力量 — 智慧、同情、自制、慷慨。这让你成为人。\n2. 野兽的力量 — 欲望、贪食、肉欲。这让你偏离正道。\n3. 猛兽的力量 — 愤怒、报复、残忍。这让你伤害别人。\n4. 魔鬼的力量 — 嫉妒、诡计、虚伪、傲慢。这是最危险的。\n\n每一刻，这四种力量都在争夺你心的主导权。当天使的力量占上风时，你感到平静和喜悦。当另外三种占上风时，你感到不安和痛苦。\n\n修行就是训练自己的心，让天使的力量成为主人，其他三种成为仆人。不是消灭它们 — 欲望也有用处 — 而是让它们服从智慧的指挥。"',
        commentary: '安萨里的"心的四力量"模型 — 一千年前的心理学，今天依然有效。',
        keyQuotes: [
          { quote: '让天使的力量成为主人，其他三种成为仆人', explanation: '不是消灭欲望、愤怒、傲慢 — 而是让它们服从。这比西方的压抑模式更健康。' },
          { quote: '每一刻，这四种力量都在争夺你心的主导权', explanation: '觉察到这场战斗本身就是胜利的开始。' },
        ],
        practiceHint: '今天每遇到一次情绪起伏，问自己："这是哪一种力量？"只是识别，不用对抗。一周后你会更懂自己。',
      },
    ],
  },
  {
    slug: 'muslim-hadith', title: '穆斯林圣训', titleEn: 'Sahih Muslim',
    author: '穆斯林·本·哈贾吉', era: '9世纪',
    ring: 3, categorySlug: 'islam',
    summary: '与布哈里圣训并列的逊尼派六大正统圣训集之一，收录约7000条穆罕默德的言行。',
    significance: '逊尼派圣训学的权威之作，与《古兰经》并为伊斯兰教法的两大根源。',
    difficulty: 3, oxStageMin: 3, oxStageMax: 8, readingMins: 35,
    tags: ['圣训', '穆斯林', '先知', '逊尼派'], sortOrder: 11,
    relatedSlugs: ['bukhari-hadith', 'quran-fatiha'],
    chapters: [
      {
        chapterNo: 1, title: '意图篇', subtitle: '一切行为看意图',
        originalText: '先知(愿主福安之)说："一切行为都由意图决定，每个人的所得只是他所意图的。\n\n谁为真主和他的使者而迁徙，他的迁徙就是为了真主和他的使者。谁为了世俗利益或为了娶一个女子而迁徙，他的迁徙就只是为了他所迁徙的那些。"\n\n又说："真主不看你们的外貌和财富，而是看你们的内心和行为。"\n\n又说："善行使你的心平静，恶行使你的心不安。即使法官的判决对你有利，但如果你的心不安，你就犯了罪。"',
        commentary: 'Muslim圣训第一篇 — 意图(Niyyah)是一切行为的本质。',
        keyQuotes: [
          { quote: '一切行为都由意图决定', explanation: '同样的行为，不同的意图会导向完全不同的结果。企业家做事前先问自己"为什么"。' },
          { quote: '善行使你的心平静，恶行使你的心不安', explanation: '你的内心是最好的道德法庭。即使外人看不出，你自己一清二楚。' },
        ],
        practiceHint: '今天做每件事前，花3秒问："我真正的意图是什么？"如果意图不纯，先调整意图再做。',
      },
      {
        chapterNo: 2, title: '知识篇', subtitle: '求学是义务',
        originalText: '先知说："求学是每个穆斯林男女的义务。从摇篮到坟墓，不停地求学。"\n\n"为求学而出发的人，就如同为真主之道而战斗一样。"\n\n"智者胜过敬拜者，如同月亮胜过群星。"\n\n"真正的富有不是物质上的富有，而是心灵的富有。"\n\n"最好的施舍是教人知识。一个知识让无数人受益，持续几代人。钱财给出去就没了，知识给出去还在自己这里。"',
        commentary: '伊斯兰教对学问的高度重视 — 这是伊斯兰黄金时代科学繁荣的精神源头。',
        keyQuotes: [
          { quote: '从摇篮到坟墓，不停地求学', explanation: '终身学习不是现代概念，1400年前先知就说了。这是所有伟大文明的共识。' },
          { quote: '最好的施舍是教人知识', explanation: '给钱是一次性的，给知识是终身的。企业家的最高布施是教会他人。' },
        ],
        practiceHint: '本月教别人一个你擅长的技能 — 免费、全心全意。看看这份"施舍"给你带来什么。',
      },
    ],
  },

  // ─── JUDAISM +2 ────────────────────────────
  {
    slug: 'pirkei-avot', title: '父辈箴言', titleEn: 'Pirkei Avot (Ethics of the Fathers)',
    author: '历代拉比集锦', era: '公元2世纪编纂',
    ring: 3, categorySlug: 'judaism',
    summary: '塔木德《密释纳》中唯一不讨论律法而专讲伦理的篇章，收录历代犹太拉比的道德箴言和生命智慧。',
    significance: '犹太伦理教育的核心教材，是安息日下午的传统学习内容。每一条箴言都简短却深刻。',
    difficulty: 2, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ['拉比', '伦理', '箴言', '密释纳'], sortOrder: 10,
    relatedSlugs: ['mishnah', 'torah', 'talmud'],
    chapters: [
      {
        chapterNo: 1, title: '三件事', subtitle: '世界的根基',
        originalText: '拉比希蒙说："世界建立在三件事上：妥拉(学习)、服侍、仁爱。"\n\n大祭司希勒尔说："若我不为自己，谁为我？若我只为自己，我是谁？若不是现在，何时？"\n\n拉比塔尔丰说："日头短，工作多，工人懒，报酬大，主人催。"\n\n又说："不是你必须完成这项工作，但你也不能放弃这项工作。"',
        commentary: '《父辈箴言》开篇就是几句塑造了犹太精神两千年的名言。',
        keyQuotes: [
          { quote: '若我不为自己，谁为我？若我只为自己，我是谁？若不是现在，何时？', explanation: '希勒尔三问 — 犹太生存智慧的精髓。自我负责 + 超越自我 + 立即行动。' },
          { quote: '不是你必须完成这项工作，但你也不能放弃这项工作', explanation: '对付不完的任务的最佳心态 — 不执着完成，但从不放弃。' },
        ],
        practiceHint: '今天把希勒尔三问写在你工作的地方。每次遇到决策困难时，读一遍。',
      },
      {
        chapterNo: 2, title: '学习与教导', subtitle: '每个人的价值',
        originalText: '本·佐玛说："谁是智者？从每个人那里学习的人。谁是强者？控制自己情欲的人。谁是富者？对自己所有感到满足的人。谁是尊贵的？尊重他人的人。"\n\n拉比西蒙说："四种人：\'你的是你的，我的是我的\' — 这是中等人，有人说这是所多玛人的性格。\n\'你的是我的，我的是你的\' — 无知者。\n\'你的是你的，我的是你的\' — 圣人。\n\'你的是我的，我的是我的\' — 恶人。"\n\n拉比雅各说："这个世界就像一个大厅的前厅。在前厅准备好自己，才能进入大厅。"',
        commentary: '《父辈箴言》充满这种"分类智慧" — 用简单的框架揭示复杂的人性。',
        keyQuotes: [
          { quote: '谁是富者？对自己所有感到满足的人', explanation: '这是世界上最短的幸福定义。不是你拥有多少，而是你对拥有的满足程度。' },
          { quote: '这个世界就像一个大厅的前厅', explanation: '所有的积累都是为了更大的可能性。不要把前厅当成目的地。' },
        ],
        practiceHint: '今晚写下5件你已经拥有但很少感谢的东西(健康/家人/技能等)。读3遍。这就是富有的开始。',
      },
    ],
  },
  {
    slug: 'hasidic-tales', title: '哈西德故事集', titleEn: 'Hasidic Tales',
    author: '马丁·布伯(Martin Buber)辑录', era: '18世纪起源，20世纪整理',
    ring: 3, categorySlug: 'judaism',
    summary: '东欧犹太哈西德派(敬虔派)的圣者故事集，以巴尔·谢姆·托夫为源头，用故事和笑话传达深刻的灵修智慧。',
    significance: '马丁·布伯的辑录让哈西德故事进入世界文学。这些故事影响了卡夫卡、艾萨克·辛格、列维纳斯等人。',
    difficulty: 2, oxStageMin: 2, oxStageMax: 10, readingMins: 30,
    tags: ['哈西德', '巴尔谢姆托夫', '布伯', '故事'], sortOrder: 11,
    relatedSlugs: ['pirkei-avot', 'zohar'],
    chapters: [
      {
        chapterNo: 1, title: '两个口袋', subtitle: '谦卑与自尊',
        originalText: '拉比布南(Bunam)教导他的弟子："每个人都应该有两个口袋，他可以根据需要把手伸到任何一个。\n\n右边口袋里写着：「为我的缘故，世界被创造出来。」(塔木德)\n\n左边口袋里写着：「我不过是尘土和灰烬。」(亚伯拉罕对神说的话)\n\n当你感到沮丧，觉得自己一无是处时，把手伸到右边口袋，读那句话。你会记起你是多么珍贵。\n\n当你感到骄傲，觉得自己高人一等时，把手伸到左边口袋，读那句话。你会记起你是多么渺小。\n\n真正的智慧是知道在什么时候读哪一句。"',
        commentary: '这是哈西德故事中最著名的一个 — 用"两个口袋"的意象教导心理平衡。',
        keyQuotes: [
          { quote: '为我的缘故，世界被创造出来 / 我不过是尘土和灰烬', explanation: '两句看似矛盾的话共同构成健康的心理。你既是无限宝贵的又是无限渺小的。' },
          { quote: '真正的智慧是知道在什么时候读哪一句', explanation: '领导者的艺术 — 在不同情境下调用不同的真理。' },
        ],
        practiceHint: '真的写两张小纸条放在你的两个口袋里。一周内每次手插口袋时，感受你拿到的那句话。',
      },
      {
        chapterNo: 2, title: '宝藏的位置', subtitle: '你要走出去才找到家',
        originalText: '哈西德派有一个著名的故事：\n\n克拉科夫的拉比艾西克连续三次做同一个梦：如果他去布拉格，在皇家桥下会找到宝藏。\n\n他动身去布拉格，来到那座桥下。但桥边站着一个士兵，不让他挖。艾西克就每天在桥附近转悠。\n\n几天后，士兵问他在这里做什么。艾西克讲了他的梦。士兵大笑："你们犹太人真奇怪，为了一个梦走这么远！我也做过梦 — 梦见在克拉科夫有个犹太人艾西克家的炉子后面有宝藏。你看我会为此去克拉科夫吗？"\n\n艾西克惊讶地听着，谢过士兵，急忙回家。在自己家里的炉子后面，他挖出了宝藏。\n\n这个故事的意义是：有些东西你只能在自己家找到，但你必须先走出去，从陌生人那里听到线索，才知道回家去找。',
        commentary: '哈西德最深的一则寓言 — 宝藏在家，但你必须先走出去才能找到它。',
        keyQuotes: [
          { quote: '有些东西你只能在自己家找到，但你必须先走出去', explanation: '人生的悖论 — 要找到自己，必须先离开自己；要找到本质，必须先经历表象。' },
          { quote: '我也做过梦...你看我会为此去克拉科夫吗', explanation: '外人告诉你的真理，有时是你寻找已久的答案。保持开放。' },
        ],
        practiceHint: '下周和一个完全不同行业的人深聊1小时。你会从他那里听到关于你自己的"宝藏线索"。',
      },
    ],
  },
];

// ============================================================
// EXECUTION
// ============================================================

async function main() {
  console.log('📜 M38.4 经论++ v4 — 7弱传统全面补齐...');

  console.log('  新增经论...');
  let newScriptures = 0;
  let newChapters = 0;

  for (const def of NEW_SCRIPTURES) {
    const existing = await prisma.scripture.findUnique({ where: { slug: def.slug } });
    if (existing) {
      console.log(`  ⏭  已存在: ${def.slug}`);
      continue;
    }
    const category = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
    if (!category) {
      console.warn(`  ⚠️  category 不存在: ${def.categorySlug}`);
      continue;
    }
    const scripture = await prisma.scripture.create({
      data: {
        slug: def.slug,
        title: def.title,
        titleEn: def.titleEn,
        author: def.author,
        era: def.era,
        ring: def.ring,
        categoryId: category.id,
        tradition: category.tradition,
        summary: def.summary,
        significance: def.significance,
        difficulty: def.difficulty,
        oxStageMin: def.oxStageMin,
        oxStageMax: def.oxStageMax,
        readingMins: def.readingMins,
        tags: def.tags,
        chapterCount: def.chapters.length,
        sortOrder: def.sortOrder,
        relatedIds: [],
      },
    });
    for (const ch of def.chapters) {
      await prisma.scriptureChapter.create({
        data: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          keyQuotes: ch.keyQuotes ?? [],
          practiceHint: ch.practiceHint,
        },
      });
      newChapters++;
    }
    newScriptures++;
  }
  console.log(`  ✓ ${newScriptures} 新经论, ${newChapters} 新章节`);

  // Fill relatedIds
  console.log('  填充新经论关联...');
  let relatedCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const scripture = await prisma.scripture.findUnique({ where: { slug: def.slug } });
    if (!scripture) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    await prisma.scripture.update({
      where: { id: scripture.id },
      data: { relatedIds: related.map((r) => r.id) },
    });
    relatedCount++;
  }
  console.log(`  ✓ ${relatedCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log('\n📜 M38.4 完成！');
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
