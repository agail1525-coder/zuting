/**
 * M38.28 经论++ v28 — 精修第十八轮：10 部主流传统巨著
 * 本轮(10部, 347 → 357):
 *   HINDUISM +1 (商羯罗·辨道宝鬘)
 *   TAOISM +1 (王重阳·立教十五论)
 *   CONFUCIANISM +1 (陈白沙语录)
 *   CHRISTIANITY +1 (托马斯·肯培斯·效法基督)
 *   ISLAM +1 (伊本·阿拉比·欲望的翻译者)
 *   JUDAISM +1 (迈蒙尼德·密西拿妥拉)
 *   TIBETAN +1 (宗喀巴·菩提道次第广论)
 *   ZEN-CORE +1 (永嘉玄觉·证道歌)
 *   ZEN-LINJI +1 (无门慧开·无门关)
 *   BUDDHIST-ZEN +1 (百丈怀海·百丈广录)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChapterDef {
  chapterNo: number;
  title: string;
  subtitle?: string;
  originalText: string;
  commentary?: string;
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
  {
    slug: "shankara-vivekachudamani", title: "商羯罗·辨道宝鬘", titleEn: "Shankara: Vivekachudamani (Crest Jewel of Discrimination)",
    author: "阿迪·商羯罗", era: "印度(约 800)",
    ring: 3, categorySlug: "hinduism",
    summary: "不二吠檀多学派创立者阿迪·商羯罗(Adi Shankara, 788-820)的代表作，全书 580 节梵文偈颂，系统阐述\"辨别真实与虚妄\"(Viveka)的智慧。以师徒问答形式展开：一位求道者向老师询问如何从轮回中解脱，老师逐层展示从\"凡夫之见\"到\"梵我合一\"的完整修行路径。",
    significance: "《辨道宝鬘》是印度不二论吠檀多(Advaita Vedanta)最重要的入门书，与《梵经注》《薄伽梵歌注》并列为商羯罗三大著作。本书因其诗意的形式和系统性成为后世修行者最爱的读物——20 世纪拉玛那·马哈希、斯瓦米·奇丹南达等现代导师都以本书为教学核心文本。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 55,
    tags: ["商羯罗", "吠檀多", "不二论", "辨别"], sortOrder: 192,
    relatedSlugs: ["vivekananda-karma-yoga", "bhagavad-gita"],
    chapters: [
      {
        chapterNo: 1, title: "梵我合一",
        originalText: "Brahma satyam jagan mithya jivo brahmaiva naparah. 梵是真实，世界是幻象，个我就是梵，除此之外无他。这一句话，就是整部吠檀多的全部精髓。",
        commentary: "商羯罗的这句\"咒语式\"口诀概括了整部吠檀多——\"梵是真\，世界是幻，个我即梵\"。前两句是\"否定\"(neti neti)：这个世界你看到的一切都不是真实的；第三句是\"肯定\"：那真实的就是你自己。修行的全部工作就是去证实这三句话。",
        practiceHint: "每日冥想中默念此偈三次，不作分析，让字义自然渗入。商羯罗说真正理解这 14 个字的人已经解脱了。",
      },
    ],
  },
  {
    slug: "chongyang-lijiao-shiwu", title: "王重阳·立教十五论", titleEn: "Wang Chongyang: Fifteen Discourses on Establishing the Teaching",
    author: "王重阳", era: "金(约 1165)",
    ring: 3, categorySlug: "taoism",
    summary: "全真道创始人王重阳(1113-1170)确立全真教义的纲领性文件，十五篇短论分别论述\"住庵、云游、学书、合药、盖造、合道伴、打坐、降心、炼性、匹配五气、混性命、圣道、超三界、养身之法、离凡世\"。是全真道修行生活的完整指南。",
    significance: "《立教十五论》是全真道最根本的\"教规\"——王重阳在此文中第一次系统地阐述了全真道的修行理念：不同于传统丹鼎派追求\"肉体不死\"，全真强调\"性命双修\"，以\"全其本性真\"为最高目标。此文影响了丘处机、马丹阳等北七真，使全真道从山东传至中原、塞北，成为金元时期最大的道教派别。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 30,
    tags: ["王重阳", "全真", "立教", "十五论"], sortOrder: 193,
    relatedSlugs: ["wuzhen-pian", "taiyi-jinhua"],
    chapters: [
      {
        chapterNo: 1, title: "打坐与降心",
        originalText: "凡打坐者，非言形体端然，瞑目合眼，此是假坐也；真坐者，须要十二时辰，住行坐卧，一切动静之中，心如泰山，不动不摇，把断四门，眼耳口鼻，不令外景入内。\n凡论心之道，若常湛然，其居如渊，其澄如水；常而不定，谓之乱心，速当去之。",
        commentary: "王重阳\"真坐\"概念革命性地重新定义了打坐——不是形式上的\"闭眼端坐\"，而是二十四小时任何活动中的\"心不动摇\"。这是把禅宗\"行住坐卧皆是禅\"的思想引入道教修行体系。所谓\"把断四门\"即不让感官被外境牵引。",
        practiceHint: "不必专门找时间\"打坐\"——在吃饭、走路、说话时观察\"心动摇了吗？\"持续的心不动摇比偶尔的静坐更接近真道。",
      },
    ],
  },
  {
    slug: "chen-baisha-yulu", title: "陈白沙语录", titleEn: "Chen Baisha: Recorded Sayings",
    author: "陈献章", era: "明(约 1490)",
    ring: 3, categorySlug: "confucianism",
    summary: "明代前期大儒陈献章(1428-1500, 号白沙)的语录集，是明代\"心学\"的先驱者。陈白沙主张\"学贵自得\"、\"静中养出端倪\"，强调修养功夫必须自己切身体证，不能只依赖经典。他是王阳明心学的直接先行者，对明代思想史有重要影响。",
    significance: "陈白沙是明代第一位被从祀孔庙的大儒(万历十二年，1584)，他的\"静坐体认\"功夫开启了明代心学的新方向。没有陈白沙就没有王阳明——阳明的\"致良知\"正是在白沙\"自得\"思想的基础上发展起来。本书是研究明代思想转折期的关键文献。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 30,
    tags: ["陈白沙", "心学", "自得", "静坐"], sortOrder: 194,
    relatedSlugs: ["chuanxilu-xia", "zhu-xi-yulei"],
    chapters: [
      {
        chapterNo: 1, title: "学贵自得",
        originalText: "学贵知疑，小疑则小进，大疑则大进。疑者，觉悟之机也。一番觉悟，一番长进。\n为学须从静坐中养出个端倪来，方有商量处。不然，终日讲学，只添得一场热闹。",
        commentary: "陈白沙两条根本主张：(1)\"学贵知疑\"——学问的真正进步在于敢于质疑既有答案；(2)\"静坐养端倪\"——不能只读书而不体证，必须通过静坐让内心真正\"显出一点苗头\"再说。这两条后来都被王阳明继承并发扬光大。",
        practiceHint: "每日留半小时静坐，不求心静，只观察内心自然涌现的\"端倪\"——任何微小的觉悟闪光都值得记录。白沙说\"端倪\"就是从这些闪光中养出来的。",
      },
    ],
  },
  {
    slug: "imitation-of-christ", title: "托马斯·肯培斯·效法基督", titleEn: "Thomas a Kempis: The Imitation of Christ",
    author: "托马斯·肯培斯", era: "荷兰(约 1418)",
    ring: 3, categorySlug: "christianity",
    summary: "14 世纪荷兰修士托马斯·肯培斯(Thomas a Kempis, 1380-1471)所作的基督教灵修经典，全书分为四卷：\"有益灵修的教导\"、\"内心生活的教导\"、\"内心慰藉的教导\"、\"圣餐的教导\"。以朴素直白的语言教导如何在日常生活中效法耶稣基督。",
    significance: "《效法基督》是除圣经以外被翻译成最多语言、印刷最多次的基督教书籍——自 15 世纪至今已有超过 3000 个版本。不论天主教、新教、东正教都将其奉为灵修经典。本书的核心思想\"谦卑、舍己、默想基督受难\"深刻影响了后世所有基督教修行传统，圣依纳爵、卫斯理兄弟、陶恕都以此为入门读物。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 35,
    tags: ["基督教", "灵修", "肯培斯", "效法"], sortOrder: 195,
    relatedSlugs: ["cloud-of-unknowing", "john-cross-dark-night"],
    chapters: [
      {
        chapterNo: 1, title: "舍己从主",
        originalText: "虚空的虚空，凡事都是虚空，惟独爱上帝、服侍他是真实的。轻看自己、重看上帝，这是最高的智慧。追求永恒的生命，看淡短暂的名利——这才是真正的智者。",
        commentary: "本书开篇第一章引用《传道书》\"虚空的虚空\"，定义了基督教灵修的基本态度：所有世俗的追求终将虚空，只有与神的关系是永恒的。这不是悲观主义，而是\"价值清理\"——先把虚假的价值扫除，真正的生命才能生长。",
        practiceHint: "每日睡前默想：\"今天做的事情中，有哪些是\"虚空\"？有哪些是\"真实\"？\"持续 30 天可以根本改变你的生活优先级。",
      },
    ],
  },
  {
    slug: "ibn-arabi-tarjuman-al-ashwaq", title: "伊本·阿拉比·欲望的翻译者", titleEn: "Ibn Arabi: Tarjuman al-Ashwaq (Interpreter of Desires)",
    author: "伊本·阿拉比", era: "安达卢斯(约 1215)",
    ring: 3, categorySlug: "islam",
    summary: "大苏菲哲学家伊本·阿拉比(Ibn Arabi, 1165-1240)的爱情诗集，表面上是一位旅人对梅加的回忆和对一位名叫\"尼扎姆\"(Nizam)的女子的倾慕，实际上是对神圣之爱的象征性表达。每首诗都配有伊本·阿拉比自己的注解，揭示每个意象背后的神秘意义。",
    significance: "《欲望的翻译者》是伊斯兰苏菲文学中\"以俗喻圣\"传统的巅峰——爱情的外衣包裹着对真主的渴慕，尘世的美女是神圣美丽的显化。本书因为表面上像情诗而一度被保守派学者禁止，伊本·阿拉比不得不亲自为每一首诗写注解，证明其中的灵性含义。这些注解本身成了苏菲\"符号学\"的经典。",
    difficulty: 4, oxStageMin: 5, oxStageMax: 10, readingMins: 35,
    tags: ["伊本阿拉比", "苏菲", "神圣之爱", "象征"], sortOrder: 196,
    relatedSlugs: ["fusus-al-hikam", "futuhat-mecca"],
    chapters: [
      {
        chapterNo: 1, title: "我随爱的宗教",
        originalText: "我的心已经能够接受一切形式——它是基督徒的修道院、异教徒的神殿、羚羊的牧场、朝圣者的卡巴天房、托拉的碑版、古兰经的书卷。我信奉爱的宗教——无论爱的骆驼队走向哪个方向，爱便是我的信仰和我的信念。",
        commentary: "伊本·阿拉比最著名的宣言——\"我信奉爱的宗教\"。这首诗因其表面上的\"宗教相对主义\"引起巨大争议，但伊本的本意是：所有宗教外在形式不同，但内核都是\"爱真主\"。真主不受任何特定形式的限制，因此任何真诚的爱都是通向他的路径。",
        practiceHint: "对任何宗教、任何真诚的灵性修行保持尊敬——伊本说，无论你走哪条路，只要\"爱\"是真诚的，都会走向同一个终点。",
      },
    ],
  },
  {
    slug: "maimonides-mishneh-torah", title: "迈蒙尼德·密西拿妥拉", titleEn: "Maimonides: Mishneh Torah",
    author: "迈蒙尼德", era: "埃及(约 1180)",
    ring: 3, categorySlug: "judaism",
    summary: "犹太教历史上最伟大的法学家迈蒙尼德(Moshe ben Maimon, 1138-1204)的毕生之作，十四卷巨著系统整理了从摩西五经到塔木德所有的犹太律法。他的目标是让普通犹太人不需要花一生研读塔木德也能知道如何生活——\"读完我这本书，就不需要再读其他律法书了\"。",
    significance: "《密西拿妥拉》是塔木德之后犹太律法最完整的系统性编纂，至今仍是正统派犹太人遵循律法的标准参考。迈蒙尼德自己谦卑地将其命名为\"Mishneh Torah\"(妥拉的复述)——意思是它只是对妥拉的重新整理。本书与卡罗的《布就之席》一起构成了后塔木德时代犹太律法的两大支柱。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 55,
    tags: ["迈蒙尼德", "犹太", "律法", "妥拉"], sortOrder: 197,
    relatedSlugs: ["maimonides-thirteen", "shulkhan-arukh"],
    chapters: [
      {
        chapterNo: 1, title: "认识神的诫命",
        originalText: "一切律法、诫命的基础是：人必须知道有一位神的存在，他创造万物并维持万物的存在。所有存在物都依赖他而存在，他不依赖任何事物。认识这一点是所有律法的起点——没有这个认识，遵守律法就成了机械动作。",
        commentary: "《密西拿妥拉》第一卷第一章第一句——迈蒙尼德把\"认识神的存在\"放在整个律法体系的最前面。这是对犹太教本质的重要声明：律法不是单纯的外在规则，而是从\"认识神\"这一根本出发而流出的生活方式。这是犹太教哲学化的典型表达。",
        practiceHint: "在做每个宗教行为之前(祈祷、洁净、守安息日)先问自己：\"我此刻是否真正意识到神的存在？\"——这一问能让机械的仪式重新充满意义。",
      },
    ],
  },
  {
    slug: "tsongkhapa-lamrim-chenmo", title: "宗喀巴·菩提道次第广论", titleEn: "Tsongkhapa: The Great Treatise on the Stages of the Path",
    author: "宗喀巴大师", era: "藏区(1402)",
    ring: 3, categorySlug: "tibetan",
    summary: "格鲁派创始人宗喀巴大师(1357-1419)的代表作，系统阐述从凡夫到成佛的完整修行次第。本书以\"三士道\"(下士道、中士道、上士道)为框架，整合了阿底峡《菩提道灯论》以来整个\"道次第\"文学传统，是藏传佛教最全面、最系统的修行手册。",
    significance: "《菩提道次第广论》是藏传佛教格鲁派最根本的论典，宗喀巴由此奠定了\"先修止观、后修密宗\"的教学次第。本书不仅是格鲁派典籍，也被宁玛、萨迦、噶举各派广泛学习——被誉为\"藏地佛教的巅峰之作\"。20 世纪以来被翻译成中、英、日多种语言，是研究藏传佛教无法绕过的著作。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 65,
    tags: ["宗喀巴", "格鲁", "道次第", "三士道"], sortOrder: 198,
    relatedSlugs: ["lamrim-essentials", "gampopa-liberation"],
    chapters: [
      {
        chapterNo: 1, title: "三士道",
        originalText: "佛陀教法可归为三种根器的道路：下士道——畏三恶趣苦而求人天善果；中士道——畏三界苦而求解脱轮回；上士道——畏众生苦而求成佛度生。三道如阶梯，不可越级，必须依次修习。",
        commentary: "宗喀巴的\"三士道\"框架是藏传佛教教学的核心方法——不同根器的学人有不同的起点，但最终都要走到\"上士道\"(菩萨道)。这个\"次第论\"的重要意义在于：反对跳级修行，强调\"共下士道\"、\"共中士道\"的基础性——即使志在成佛，也必须先打好人天善法和解脱道的基础。",
        practiceHint: "先诚实评估自己的修行层次：你真正担心的是三恶道、还是轮回、还是众生苦？答案决定你当前应该着力的重点。不要假装自己是\"上士\"而忽视基础。",
      },
    ],
  },
  {
    slug: "yongjia-zhengdao-ge", title: "永嘉玄觉·证道歌", titleEn: "Yongjia Xuanjue: Song of Enlightenment",
    author: "永嘉玄觉", era: "唐(约 710)",
    ring: 1, categorySlug: "zen-core",
    summary: "六祖慧能法嗣永嘉玄觉禅师(665-713)证悟后所作的长篇禅诗，全诗约 1800 字，以优美的偈颂形式表达禅宗\"顿悟\"的境界。永嘉因拜谒六祖\"一宿觉\"而顿悟，回到永嘉后作此歌以抒证悟之心，是唐代禅宗诗偈的巅峰之作。",
    significance: "《证道歌》是汉传禅宗最广为传诵的诗偈——几乎每个学禅者都能背诵其中名句\"绝学无为闲道人，不除妄想不求真\"\"君不见，绝学无为闲道人\"等。本书将禅宗顿悟的精髓用诗化语言表达，使深奥的禅理变得可感可诵。日本禅宗也把它列为必读经典。",
    difficulty: 3, oxStageMin: 5, oxStageMax: 10, readingMins: 20,
    tags: ["永嘉", "证道", "顿悟", "禅诗"], sortOrder: 199,
    relatedSlugs: ["yongjia-ji", "liuzu-tanjing-jiyuan"],
    chapters: [
      {
        chapterNo: 1, title: "绝学无为",
        originalText: "君不见，绝学无为闲道人，不除妄想不求真。无明实性即佛性，幻化空身即法身。法身觉了无一物，本源自性天真佛。五阴浮云空去来，三毒水泡虚出没。",
        commentary: "永嘉《证道歌》开篇八句道尽禅宗顿悟境界——真正证道的人不需要\"除妄想\"或\"求真理\"，因为一切妄想的本性就是觉悟，一切虚幻的身心就是法身。这八句彻底颠覆了\"除恶修善\"的传统修行观，奠定了禅宗\"烦恼即菩提\"的理论基础。",
        practiceHint: "背诵这八句，在日常生活中起烦恼时默念\"无明实性即佛性\"——这不是口头安慰，而是禅宗最核心的功夫。",
      },
    ],
  },
  {
    slug: "wumen-wumenguan", title: "无门慧开·无门关", titleEn: "Wumen Huikai: The Gateless Gate",
    author: "无门慧开", era: "宋(1228)",
    ring: 1, categorySlug: "zen-linji",
    summary: "南宋临济宗大师无门慧开(1183-1260)编纂的禅宗公案集，收录 48 则最重要的公案，每则都配有无门的\"评唱\"和\"颂\"。与圆悟《碧岩录》、万松《从容录》并列为禅宗三大公案集。无门禅师自己是大慧宗杲一系的\"看话禅\"传人，所以《无门关》强调\"参究一则话头到底\"的修行方法。",
    significance: "《无门关》是禅宗公案集中最精炼、最广为流传的一部。书中第一则\"赵州无字\"——\"狗子还有佛性也无？\" \"无。\"——被誉为\"禅门第一公案\"，是日本临济宗至今仍然使用的核心参究话头。本书比《碧岩录》更短小精悍，因此成为现代人入门禅宗公案最常用的读物。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 35,
    tags: ["无门", "公案", "无字", "看话禅"], sortOrder: 200,
    relatedSlugs: ["yuanwu-biyanlu", "dahui-yulu"],
    chapters: [
      {
        chapterNo: 1, title: "赵州无字",
        originalText: "举：赵州和尚因僧问：\"狗子还有佛性也无？\"州云：\"无。\"\n无门曰：\"参禅须透祖师关，妙悟要穷心路绝。祖关不透，心路不绝，尽是依草附木精灵。\"\n颂曰：\"狗子佛性，全提正令。才涉有无，丧身失命。\"",
        commentary: "禅宗最著名的\"无字公案\"。按佛经所说\"一切众生皆有佛性\"，狗子当然有佛性，为什么赵州说\"无\"？无门说：这个\"无\"不是\"有无之无\"，而是\"绝对的无\"——参透这个\"无\"就等于参透整个禅宗。此公案是日本白隐禅师划时代的入门话头。",
        practiceHint: "每日静坐参\"无\"字——不要去想\"无是什么意思\"，而是直接把\"无\"字当作一个实物放在心里，让它充满整个身心。持续不懈，终有一天\"无\"字会自然破裂。",
      },
    ],
  },
  {
    slug: "baizhang-guanglu", title: "百丈怀海·百丈广录", titleEn: "Baizhang Huaihai: Extensive Records of Baizhang",
    author: "百丈怀海", era: "唐(约 810)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "洪州禅最重要的祖师百丈怀海(720-814)的完整语录集，相对于百丈以寺院清规著称的《百丈清规》，《百丈广录》保存了他的禅机问答和开示教法。百丈是马祖道一的嫡传弟子，承接马祖\"平常心是道\"的思想并发展出\"一日不作，一日不食\"的农禅精神。",
    significance: "《百丈广录》是研究洪州宗教法的根本文献，百丈下出临济义玄(临济宗祖)和沩山灵祐(沩仰宗祖)，因此本书是后世所有中国禅宗(特别是临济一系)的源头。百丈\"三句话\"、\"野狐禅\"公案都出自本书，是后世公案参究的重要素材。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 45,
    tags: ["百丈", "洪州", "农禅", "马祖"], sortOrder: 201,
    relatedSlugs: ["mazu-yulu", "baizhang-qinggui"],
    chapters: [
      {
        chapterNo: 1, title: "不昧因果",
        originalText: "百丈和尚每日上堂，常有一老人听法。一日众退，惟老人不去。师问：\"面前立者复是何人？\"老人云：\"某甲非人也。于过去迦叶佛时，曾住此山，因学人问：\"大修行底人还落因果也无？\"某甲对云：\"不落因果。\"五百生堕野狐身。今请和尚代一转语。\"师云：\"不昧因果。\"老人于言下大悟。",
        commentary: "著名的\"野狐禅\"公案。一个和尚因为错答了一个字\"不落\"(而应该是\"不昧\")，堕为野狐五百年。\"不落\"是否定因果，堕入断见；\"不昧\"是\"不糊涂于因果\"——虽了达空性但仍清楚因果。这一字之差展示了禅宗对\"见地\"的极端严格——错一字就是大修行人与野狐的差别。",
        practiceHint: "对任何禅语都不要轻易下判断\"这是悟的\"或\"这是错的\"——禅的精微处在一字之间。保持谦卑，多听少说。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.28 经论++ v28 精修第十八轮 — 10 部主流传统巨著\n');

  let newScriptures = 0;
  let newChapters = 0;

  for (const def of NEW_SCRIPTURES) {
    const category = await prisma.scriptureCategory.findUnique({ where: { slug: def.categorySlug } });
    if (!category) {
      console.warn(`  ⚠ 类别未找到: ${def.categorySlug}, 跳过 ${def.slug}`);
      continue;
    }

    const scripture = await prisma.scripture.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug, title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
        ring: def.ring, categoryId: category.id, tradition: category.tradition,
        summary: def.summary, significance: def.significance,
        difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
        readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder, isPublished: true,
      },
      update: {
        title: def.title, titleEn: def.titleEn, author: def.author, era: def.era,
        ring: def.ring, categoryId: category.id, tradition: category.tradition,
        summary: def.summary, significance: def.significance,
        difficulty: def.difficulty, oxStageMin: def.oxStageMin, oxStageMax: def.oxStageMax,
        readingMins: def.readingMins, tags: def.tags, sortOrder: def.sortOrder,
      },
    });
    newScriptures++;

    for (const ch of def.chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo: ch.chapterNo } },
        create: {
          scriptureId: scripture.id, chapterNo: ch.chapterNo, title: ch.title, subtitle: ch.subtitle,
          originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
        },
        update: {
          title: ch.title, subtitle: ch.subtitle,
          originalText: ch.originalText, commentary: ch.commentary, practiceHint: ch.practiceHint,
        },
      });
      newChapters++;
    }

    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { chapterCount: def.chapters.length },
    });
  }

  console.log(`  ✓ ${newScriptures} 新经论, ${newChapters} 新章节`);

  let relationCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    if (related.length === 0) continue;
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.28 精修第十八轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
