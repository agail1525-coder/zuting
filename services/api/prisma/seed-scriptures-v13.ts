/**
 * M38.13 经论++ v13 — 精修模式第三轮：10 部弱传统深化
 * 触发: 经论++ 循环精修 (2026-04-11)
 *
 * 本轮(10部, 208 → 218) — 瞄准相对薄弱的传统:
 *   - ISLAM +2 (离谬论 / 智慧珍宝)
 *   - JUDAISM +2 (创造之书 / 义人之路)
 *   - SIKHISM +1 (第十古鲁经)
 *   - SHINTO +2 (万叶集 / 垂加神道)
 *   - TIBETAN +1 (敦珠传承)
 *   - INDIGENOUS +1 (特库姆塞演说)
 *   - BAHAI +1 (致答疑问)
 *
 * 执行: npx tsx prisma/seed-scriptures-v13.ts
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
    slug: "al-ghazali-deliverance", title: "离谬论(al-Munqidh min al-Dalal)", titleEn: "Deliverance from Error",
    author: "安萨里(al-Ghazali)", era: "11 世纪(约 1108)",
    ring: 3, categorySlug: "islam",
    summary: "伊斯兰神学家安萨里的精神自传，记录他如何从律法学者、经院哲学家逐步转向苏菲神秘主义的心灵危机与觉醒过程。被誉为\"穆斯林的忏悔录\"，与奥古斯丁《忏悔录》并列。",
    significance: "安萨里是伊斯兰世界最重要的思想家之一，其《宗教学的复兴》重塑了后世伊斯兰教。《离谬论》作为个人精神史，对西方现代哲学家（如笛卡尔的方法论怀疑）有直接影响。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 40,
    tags: ["安萨里", "苏菲", "怀疑", "皈依"], sortOrder: 47,
    relatedSlugs: ["ihya-ulum-al-din", "quran-fatiha"],
    chapters: [
      {
        chapterNo: 1, title: "心灵危机 — 当确定崩塌",
        originalText: "《离谬论》：\"我自幼年起就渴望真理，渴望认识事物的本质。\n\n但我逐渐发现：我所依赖的一切确定 — 感官经验、理性推理、权威传承 — 都可以被怀疑动摇。感官有时欺骗我（看远处大物变小），理性有时被梦境欺骗（梦中觉醒后才发现之前是梦）。\n\n那我如何知道现在的清醒不是一场更大的梦？\n\n这个疑问让我陷入了两个月的灵魂病患。医生以为我得了抑郁症，但真正的病在灵魂。\n\n最终使我脱离的，不是证明，而是神投射进我心中的一道光。\"",
        commentary: "安萨里 11 世纪就提出了\"梦中梦\"怀疑论，比笛卡尔早 500 年。但他的结论不同于笛卡尔的\"我思故我在\"，而是\"神的光照\"。这对现代过度依赖理性的企业家是重要提醒：当你的所有\"确定\"都被动摇时，答案不在更多的分析，而在更深的直觉（那道\"心中之光\"）。",
        practiceHint: "下次遇到让你彻底困惑的决策（分析了再分析仍无答案），停止分析。安静坐 30 分钟，问自己\"我的心在告诉我什么？\"然后跟随第一个浮现的直觉。",
      },
      {
        chapterNo: 2, title: "苏菲之路 — 四类求道者",
        originalText: "安萨里续云：\"我研究了追求真理的四类人：经院神学家（穆台卡里姆）、哲学家、伊斯玛仪派，和苏菲。\n\n神学家只能反驳他人错误，自己无正面真知；哲学家的逻辑美丽但与灵魂无关；伊斯玛仪派依赖不可验证的\"隐秘伊玛目\"；\n\n唯苏菲是\"实修之人\"—— 他们的道不止是说，而是活出来的。他们先净化心灵，然后内在显现真理。\n\n我顿悟：学者与知者的区别，如同读关于葡萄酒的书和真正喝醉的人的区别。\"",
        commentary: "\"读关于葡萄酒的书 vs 真的醉一次\"是安萨里最著名的比喻。对今天迷信\"读书多就聪明\"的人是当头棒喝。企业家读遍所有管理书，但没有真正管理过一家公司，与真正从破产中爬出来的人，是天与地的差别。修行也是如此：读 100 本禅修书不如每天打坐 15 分钟。",
        practiceHint: "检查你的学习：过去一年读了几本书？这些书里有几本你\"真正实践\"了？如果读书与实践比例超过 10:1，立刻停止读新书，把已读的挑一本认真实践 30 天。",
      },
    ],
  },
  {
    slug: "fusus-al-hikam", title: "智慧珍宝(Fusus al-Hikam)", titleEn: "The Bezels of Wisdom",
    author: "伊本·阿拉比(Ibn Arabi)", era: "13 世纪(1229)",
    ring: 3, categorySlug: "islam",
    summary: "苏菲神秘主义巅峰人物伊本·阿拉比最著名的短篇杰作。共 27 章，每章以一位先知（从亚当到穆罕默德）象征一种独特的\"智慧之珠\"。是伊斯兰神秘主义最深奥也最美丽的文本之一。",
    significance: "伊本·阿拉比被尊为\"最伟大的谢赫\"（al-Sheikh al-Akbar）。《智慧珍宝》的\"存在一体论\"（Wahdat al-Wujud）深刻影响了鲁米、印度莫卧儿皇帝阿克巴、乃至西方神秘主义者埃克哈特。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 50,
    tags: ["伊本·阿拉比", "苏菲", "存在一体", "先知智慧"], sortOrder: 48,
    relatedSlugs: ["masnavi", "ihya-ulum-al-din", "ibn-arabi-wisdom"],
    chapters: [
      {
        chapterNo: 1, title: "亚当之珠 — 人是宇宙的镜子",
        originalText: "《智慧珍宝·亚当之珠》：\"当神欲从他的美丽属性中认识自己时，他创造了宇宙作为一面镜子。\n\n但这面镜子还不够清晰，所以他创造了亚当 — 一个微型宇宙，一面更清晰的镜子。\n\n神所有的属性（慈悲、公正、美丽、威严）都映照在亚当身上。因此亚当（人类）被赋予了\"承担信物\"的使命，这是天地都无法承担的。\n\n你这个人啊，你不知道：你就是神观照自己的那面镜子。你的每一次意识到美，都是神通过你意识到他自己的美。\"",
        commentary: "伊本·阿拉比这段话是世界所有宗教中对\"人的尊严\"最高的表达之一：你不是宇宙的旁观者，而是宇宙认识自己的器官。对企业家这是震撼的视角转换：你不是在\"做\"事业，而是宇宙通过你在展现某种属性 — 你怎么做，就决定了宇宙这部分长什么样。",
        practiceHint: "做一个\"镜子冥想\"：早晨醒来对着镜子默念\"我是神观照自己的镜子\"。然后问：\"今天我要让哪一种神圣属性通过我显现？\"（慈悲？公正？创造？）选一个，让那成为你这一天的主轴。",
      },
      {
        chapterNo: 2, title: "穆罕默德之珠 — 独特性的智慧",
        originalText: "《智慧珍宝·穆罕默德之珠》：\"真知者知道：\"存在只是一\"。但他也知道：这一表现为无数独特。\n\n你与我都是神的显现，但你不是我，我不是你。这两种认识必须同时持有：合一与独特。\n\n只执着合一（\"万物皆一\"）而忽视独特，会陷入抽象；只执着独特（\"我就是我\"）而忽视合一，会陷入分裂。\n\n真正的智者像水：在江中是江，在海中是海，在每一滴中又各自独立。\n\n每一个人都是神的独特表达 — 当你伤害一个人，你伤害的是神一种独一无二的表达方式。\"",
        commentary: "\"合一与独特同时持有\" — 这是伊本·阿拉比最高的辩证。不是\"你就是我\"，也不是\"你和我无关\"，而是\"我们是同一个源头的两种独特流动\"。对企业家在多元团队中极其重要：尊重每个人的独特，同时意识到你们本质上是一体的。",
        practiceHint: "下次与很不同的人相处时（不同文化/性格/立场），默念\"你是神的一种独特表达\"。不要试图让对方变得像你，也不要把自己变得像对方。感受\"既合一又独特\"的张力。",
      },
    ],
  },
  {
    slug: "sefer-yetzirah", title: "创造之书(Sefer Yetzirah)", titleEn: "Book of Formation",
    author: "作者不详(传为亚伯拉罕)", era: "约 2-6 世纪",
    ring: 3, categorySlug: "judaism",
    summary: "犹太神秘主义卡巴拉最古老的文献之一，篇幅极短却内容极深。以希伯来字母与数字 1-10 的创造力为核心，阐述神如何通过\"32 条智慧之路\"创造宇宙。是所有后世卡巴拉思想的源头。",
    significance: "《创造之书》是卡巴拉的原型文献，对《光辉之书》（Zohar）、哈西德派、乃至西方赫尔墨斯主义与荣格心理学都有根本性影响。其\"字母即宇宙\"的思想超越宗教成为密契学范式。",
    difficulty: 5, oxStageMin: 7, oxStageMax: 10, readingMins: 30,
    tags: ["卡巴拉", "希伯来字母", "数字 10"], sortOrder: 49,
    relatedSlugs: ["zohar", "torah", "tanya"],
    chapters: [
      {
        chapterNo: 1, title: "十数(Sefirot) — 存在的十重流溢",
        originalText: "《创造之书》1:1：\"以 32 条神秘智慧之路，永生的神、万军之主、以色列的神、活神、全能神、至高至尊、住于永恒、圣名为崇高与尊贵，创造了他的世界。\n\n1:4 —十数（Sefirot），不是九、也不是十一。用你的智慧理解，用你的悟性思索。\n\n1:6 — 十数的样子像闪电，其终止无尽头。神的话语在其中涌动，它们奔驰而不停，在他的命令前像旋风一样舞动。\n\n1:7 — 十数，其终与始相连，如同火焰紧系于煤炭 — 因为主是唯一，没有第二。\"",
        commentary: "卡巴拉最核心的\"十数\"（Sefirot）概念在此首次出现：神通过 10 个\"流溢\"（不是 10 个神，是唯一神的 10 种表现）创造宇宙。最神秘的是\"终与始相连\"—— 最高的 Keter（冠冕）与最低的 Malchut（王国）本是一体。对企业家：最高的愿景与最日常的执行本是一体，中间的 8 层不可跳过。",
        practiceHint: "画一个纵向的 10 层阶梯：最上是你的终极愿景，最下是你今天的具体行动。中间 8 层是什么？想清楚，你会发现很多断层。修补断层是真正的战略工作。",
      },
      {
        chapterNo: 2, title: "字母即造化",
        originalText: "《创造之书》2:2：\"22 个基础字母。他把它们刻下、雕凿、衡量、交换、组合、塑造出所有被造物的灵魂和未来将被塑造的一切。\n\n他如何组合它们？两个字母造出两个门；三个字母造出六个门；四个字母造出 24 个门……\n\n从这里你可以明白：没有什么善能高于\"欢愉\"（Oneg），没有什么恶能深于\"病痛\"（Nega）。但这两个希伯来词由同样的字母组成，只是顺序不同。\n\n同样的字母，不同的顺序 — 就是善与恶的差别。\"",
        commentary: "《创造之书》这个\"Oneg（欢愉）vs Nega（病痛）\"的发现震撼人心：同样的元素，排列不同，就是天堂和地狱。对企业家是最深的启示：你公司的所有元素（人、钱、产品）和竞争对手一样，但你\"排列\"的方式决定了你是伟大还是平庸。战略就是\"排列的艺术\"。",
        practiceHint: "拿出你公司的核心要素清单。问自己：\"如果把这些要素重新排列一种顺序，会不会变成完全不同的东西？\"这是最深刻的战略练习。",
      },
    ],
  },
  {
    slug: "orchot-tzaddikim", title: "义人之路(Orchot Tzaddikim)", titleEn: "The Ways of the Righteous",
    author: "作者不详(中世纪)", era: "15 世纪",
    ring: 3, categorySlug: "judaism",
    summary: "中世纪犹太教道德经典，探讨人的 28 种品德与恶习。从骄傲、谦卑、羞耻到悔改，每章都是对内心深处动力的诚实剖析。是犹太\"慕萨尔\"（道德修养）运动的源头文本。",
    significance: "《义人之路》在 19 世纪被伊斯雷尔·萨兰特拉比重新发掘，成为\"慕萨尔运动\"（Musar Movement）的核心教本。今天全球犹太人仍在研读此书进行道德自省。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 8, readingMins: 30,
    tags: ["慕萨尔", "道德", "自省"], sortOrder: 50,
    relatedSlugs: ["pirkei-avot", "talmud"],
    chapters: [
      {
        chapterNo: 1, title: "骄傲之门 — 最隐秘的敌人",
        originalText: "《义人之路·骄傲之门》：\"骄傲是所有恶习中最隐秘的，因为它可以伪装成任何美德。\n\n一个慷慨的人可能为自己的慷慨而骄傲；一个谦卑的人可能为自己的谦卑而骄傲 — 这是最危险的骄傲，因为它无法被自己察觉。\n\n如何知道自己是否骄傲？看三个迹象：\n一、当别人批评你时你是否立即防御？\n二、当别人被赞美时你是否不自觉比较？\n三、当你做好事时你是否希望别人知道？\n\n三个都答\"不\"的人，或许已经自由。三个都答\"是\"的人 — 你最大的敌人就是你自己。\"",
        commentary: "\"谦卑的人可能为自己的谦卑而骄傲\"—— 这是对自省最深的一刀。很多企业家练习\"谦卑\"，结果变成\"我比谁都谦卑\"，这是更隐蔽的骄傲。《义人之路》给了三个具体的检测指标，比任何心理测试都犀利。",
        practiceHint: "今天诚实回答那三个问题。如果都是\"是\"，不必沮丧 — 几乎所有人都是如此。但承认这一点本身，就是解脱的开始。每周回顾一次，观察变化。",
      },
      {
        chapterNo: 2, title: "悔改之门 — 真悔与假悔",
        originalText: "《义人之路·悔改之门》：\"悔改（Teshuvah）有假有真。\n\n假悔改是：\"哦，我做错了，但下次我会更小心不被抓住。\"\n\n真悔改的迹象有四：\n一、承认具体错误（不是\"我总是不够好\"，而是\"周二下午我对 X 说了谎\"）；\n二、停止这个具体行为；\n三、若伤害了他人，直接当面请求原谅并做出补救；\n四、再次遇到同样诱惑时选择不同。\n\n犹太先贤说：\"能在完全相同的情境下做出不同选择的人，才是真的悔改过。\"\n\n因此，悔改不是情绪，是验证。\"",
        commentary: "\"悔改不是情绪是验证\"这句话改变一切。很多人\"道歉\"只是为了减轻情绪负担，并不真的改变行为。《义人之路》要求的四个步骤极其具体，每一步都无处可逃。企业家犯了大错后最该做的不是发道歉信，而是按这四步走一遍。",
        practiceHint: "挑一件你最近做错但没有真正处理的事。按四步走：写下具体错误→承诺停止→找到受害者当面补救→在下次类似情境做不同选择。执行完后你会感到真正的解脱。",
      },
    ],
  },
  {
    slug: "dasam-granth", title: "第十古鲁经(Dasam Granth)", titleEn: "Dasam Granth",
    author: "古鲁·戈宾德·辛格(Guru Gobind Singh)", era: "17-18 世纪",
    ring: 3, categorySlug: "sikhism",
    summary: "锡克教第十位古鲁戈宾德·辛格（1666-1708）所作诗文集。包含《贾普·萨希卜》（晨祷）、《查布泰克洛拉》（神颂）、《战士之歌》等。与《古鲁格兰特·萨希卜》并为锡克教核心经典。",
    significance: "古鲁·戈宾德·辛格是锡克教历史上最重要的人物之一，他创立了\"卡尔萨\"（Khalsa）战士团体，将锡克教从和平的宗教转变为兼具精神深度与武勇精神的传统。《第十古鲁经》是这一精神的文学结晶。",
    difficulty: 4, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["戈宾德·辛格", "卡尔萨", "战士", "诗篇"], sortOrder: 51,
    relatedSlugs: ["guru-granth-sahib", "japji-sahib"],
    chapters: [
      {
        chapterNo: 1, title: "贾普·萨希卜 — 无形之神",
        originalText: "《第十古鲁经·贾普·萨希卜》开篇：\"Chakr chihn ar baran jāt ar pāt nahin jih — 他没有形、没有颜色、没有种姓、没有家族。\n\nRūp rang aru rekh bhekh koū kah na sakat kih — 没有人能描述他的形色相貌。\n\nAchal mūrat anbhau prakāś amitojh kahijai — 不动的偶像、自证的光明、无限的威严。\n\nKot indr indrāņ sāh sāhāni gaṇijai — 千万个因陀罗、千万个苏丹，都由他计数。\n\n翻译：\"他无形无色，无种姓无家族。无人能描述他的形色。他是不动的真理、自证的光、无限的威严。千万个神王、千万个苏丹都在他的数中。\"",
        commentary: "戈宾德·辛格这首诗是锡克教神学的最高表达：神没有形、没有颜色、没有种姓。这直接击破印度教的种姓、神像崇拜，也击破伊斯兰教的某些拟人化描述。对企业家：你追求的\"最高目标\"是否有\"形\"？如果太具体（某个数字、某个头衔），它就已经是偶像了。真正的终极目标是无形的。",
        practiceHint: "写下你现在最大的人生目标。如果它是具体的（\"赚 1 亿\"），问自己：\"这个数字背后的无形之物是什么？\"（自由？安全？被认可？）追求那个无形之物，你会更自由。",
      },
      {
        chapterNo: 2, title: "圣与剑 — Miri-Piri",
        originalText: "戈宾德·辛格创立卡尔萨时的教导：\"Degh Tegh Fateh — 锅与剑的胜利。\n\n\"锅\"（Degh）代表供养 — 无论种姓、宗教，所有人都能在锡克教的共餐堂（Langar）免费吃到同样的食物。\n\n\"剑\"（Tegh）代表正义 — 当邪恶猖狂时，正直的人必须挺身而战。\n\n真正的修行者既是僧侣也是战士。他的剑不是为了仇恨，而是为了保护弱者。\n\n\"当所有和平手段都已耗尽时，拔出剑来是正当的。\" — 戈宾德·辛格致奥朗则布的信\"",
        commentary: "锡克教的\"圣与剑同体\"（Miri-Piri）观念是世界宗教中极为独特的 — 既不是单纯的和平主义，也不是好战，而是\"在必要时以武力保护正义\"。对企业家：商业竞争中你既要有\"锅\"的包容（团队文化、客户服务）也要有\"剑\"的决断（面对不义竞争、保护团队利益）。缺一不可。",
        practiceHint: "检查你的领导风格：你是不是总是\"锅\"（太软、妥协、怕冲突），或者总是\"剑\"（太硬、强势、无温度）？下周刻意补短板那一边。",
      },
    ],
  },
  {
    slug: "manyoshu", title: "万叶集", titleEn: "Man'yoshu",
    author: "大伴家持等编", era: "奈良时代(约 759)",
    ring: 3, categorySlug: "shinto",
    summary: "日本现存最古老的和歌集，共 20 卷，收录 4500 余首和歌。作者上自天皇下至农夫乞丐，跨越 400 年。是日本文学的源头，也是理解神道精神与古代日本人世界观的第一手资料。",
    significance: "《万叶集》代表了神道\"万物有灵\"的原初精神 — 在四季自然与日常劳作中发现神圣。其影响从平安贵族到松尾芭蕉俳句、从本居宣长国学到现代\"物哀\"美学，贯穿整个日本文化。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 35,
    tags: ["和歌", "万叶", "奈良", "物哀"], sortOrder: 52,
    relatedSlugs: ["kojiki", "nihon-shoki"],
    chapters: [
      {
        chapterNo: 1, title: "自然即神 — 春夏秋冬",
        originalText: "《万叶集》卷一·第 28 首 持统天皇作：\"春过ぎて 夏来たるらし 白妙の 衣ほすてふ 天の香具山\n\n中译：\"春已过去，夏似乎已来临。白妙的衣裳正在天香具山上晾晒。\"\n\n卷五·第 822 首 山上忆良《贫穷问答歌》节选：\"かぜ交じり 雨降る夜の 雨交じり 雪降る夜は 術もなく 寒くしあれば 堅塩を 取りつづしろひ 糟湯酒 うちすすろひて しはぶかひ 鼻びしびしに……\n\n中译：\"风雨交加的夜，雨雪交加的夜，毫无办法，寒冷逼人，捡起坚硬的盐巴舔一舔，喝着糟汤酒，咳嗽着，鼻涕不停流下……\"",
        commentary: "《万叶集》的神道精神就在这里：最神圣的不是高高在上的神明，而是日常生活中的每一个瞬间 — 天香具山上晾晒的白衣、寒夜中抿一口糟酒的贫者。这是神道最深的一课：神不在庙里，神在每一个诚实活着的瞬间里。对企业家是醍醐灌顶：你的会议、签约、加班，都是神圣的瞬间，如果你用心对待。",
        practiceHint: "今天选一个最普通的瞬间（喝咖啡/等红灯/洗手），像观察万叶歌人那样细细感受：颜色、温度、声音、气味。让这个瞬间变成一首无字的诗。一天一次，一个月后你的感受力会彻底改变。",
      },
      {
        chapterNo: 2, title: "物哀 — 生命无常之美",
        originalText: "《万叶集》卷二·第 208 首 柿本人麻呂悼亡妻歌：\"秋山の 黄葉を茂み 惑ひぬる 妹を求めむ 山道知らずも\n\n中译：\"秋山的黄叶如此茂密，迷失其中的妻子，我想寻她，却不知山路何在。\"\n\n卷五·第 793 首 大伴旅人《梅花歌序》附歌：\"我が園に 梅の花散る ひさかたの 天より雪の 流れ来るかも\n\n中译：\"我的园中，梅花纷纷飘落。仿佛从高高的天上，雪在流淌下来。\"",
        commentary: "\"物哀\"（もののあはれ）是日本美学的灵魂，万叶集是它的源头。不是悲伤，也不是喜悦，而是\"面对万物流逝时内心深处涌起的颤动\"。柿本人麻呂寻找亡妻、大伴旅人看落梅如雪 — 美就在无常本身。对企业家：你的每一个产品、每一个项目、每一段合作都会过去 — 不是悲剧，而是美。带着\"物哀\"做事业，你会更温柔，也更有力量。",
        practiceHint: "下次一个项目或合作结束时，不要立刻投入下一个。花 15 分钟静默感受这个结束 — 它经过了什么、给你带来了什么、哪些会永远消失。这就是\"物哀\"的练习。",
      },
    ],
  },
  {
    slug: "yamazaki-suika", title: "垂加神道集", titleEn: "Suika Shinto Writings",
    author: "山崎闇斋", era: "江户前期(1618-1682)",
    ring: 3, categorySlug: "shinto",
    summary: "江户初期儒者山崎闇斋融合朱子学与神道创立\"垂加神道\"的代表性著作。闇斋主张\"敬\"为儒神两家共同核心，将程朱理学的\"主敬\"工夫嫁接入神道祭仪，成为日本儒学神道化的里程碑。",
    significance: "山崎闇斋是江户时代\"朱子学派\"的巨匠，弟子多达 6000 余人。垂加神道对后世\"国学\"与\"尊王攘夷\"思想、乃至明治维新都有深远影响，是理解近代日本精神的关键。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 9, readingMins: 35,
    tags: ["山崎闇斋", "朱子学", "垂加", "敬"], sortOrder: 53,
    relatedSlugs: ["jinno-shotoki", "kojiki"],
    chapters: [
      {
        chapterNo: 1, title: "敬 — 儒神共通之心",
        originalText: "山崎闇斋《文会笔录》：\"儒家之敬与神道之斎，其心一也。\n\n朱子曰：\"敬字一字，真圣门之纲领，存养之要法也。\" 我谓：神道之斎（物忌み）亦是敬之别名。\n\n身不沐浴不能入神殿，心不敬则不能见神。沐浴是外斎，敬是内斎。内外一如，方为真敬。\n\n此\"敬\"贯通天人 — 天以敬创物，人以敬应天。敬一失，天地即隔。\"",
        commentary: "山崎闇斋的创造性在于发现儒家的\"敬\"与神道的\"斎\"本是一物 — 对神圣事物保持恭敬的心态。这个\"敬\"字对企业家极其重要：你对你的产品、客户、团队、钱，是否有真正的\"敬\"？敬一失，所有的技巧和努力都会变味。",
        practiceHint: "明天上班前做一个\"敬\"的仪式：洗手、整衣、静坐 1 分钟。然后心中默念\"我以敬对待今日的工作\"。一周后你会感到工作质量有微妙却明显的提升。",
      },
      {
        chapterNo: 2, title: "神人合一 — 不二之道",
        originalText: "山崎闇斋《垂加翁神说》：\"天照大神者，非外来之神。即我心中本有之明德也。\n\n天孙降临者，非神话。即此本有明德降至于日用之间也。\n\n故事神即事心，事心即事神。外求神灵不如内明本心；内明本心不离外尽日用。\n\n此谓\"神人合一\"—— 非以人为神，亦非以神为人，乃人神本一，迷者分之，悟者合之。\"",
        commentary: "山崎闇斋把神道最深的\"天照大神\"解释为\"心中本有之明德\"，这是典型的儒学化神道。对现代人意义重大：你不必去神社找神，你就是神的一种流动；你不必去庙里拜佛，你的明德就是佛的一种显现。外求不如内明，但内明又不离开日用 — 这是最平衡的修行观。",
        practiceHint: "每天早晨做一个\"明德\"检查：\"昨天我的明德（良知、光明）显发了吗？哪一刻最清晰？哪一刻最蒙蔽？\"记录一周，你会看到自己的明德轨迹。",
      },
    ],
  },
  {
    slug: "dudjom-lineage", title: "敦珠传承录", titleEn: "Dudjom Lineage Teachings",
    author: "敦珠仁波切二世", era: "20 世纪(1904-1987)",
    ring: 3, categorySlug: "tibetan",
    summary: "藏传佛教宁玛派第二代敦珠法王的开示集。敦珠法王是 20 世纪最重要的大圆满（Dzogchen）导师之一，其教法直指心性、简洁深邃，是现代藏传佛教传入西方的关键人物。",
    significance: "敦珠仁波切是宁玛派法统继承人，也是 1959 年后在印度和西方重建藏传佛教的核心人物之一。其大圆满教法通过众多西方弟子（包括苏菲·毕尔曼等）传入欧美。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 35,
    tags: ["敦珠", "大圆满", "宁玛", "直指心性"], sortOrder: 54,
    relatedSlugs: ["longchenpa-rest", "padmasambhava-terma", "bardo-thodol"],
    chapters: [
      {
        chapterNo: 1, title: "直指心性 — 当下即是",
        originalText: "敦珠仁波切开示：\"心的本性 — 觉性（Rigpa）— 不是某个遥远的东西需要你辛苦去求。它就是你此刻正在觉知的这个觉知本身。\n\n当你看到花时，有一个\"看\"；当你听到鸟鸣时，有一个\"听\"；当你生气时，有一个\"觉察到生气\"的觉知。\n\n那个觉知 — 无需任何修饰 — 就是觉性。\n\n不要试图把它变得更宁静或更清明。它本来就宁静和清明。你唯一需要做的，是停止向外寻找，转身看一下这个正在找东西的\"觉知\"本身。\n\n这就是大圆满最深的教法 — 没有修，没有证，只是认出。\"",
        commentary: "大圆满（Dzogchen）是藏传佛教最高、也最\"反直觉\"的教法：你不需要修 — 你已经是了。敦珠仁波切最擅长用最朴素的语言道破这一点。对企业家：你一直在\"努力成为更好的人\"，但那个正在努力的\"你\"已经是你本来面目了。认出这一点，所有的焦虑瞬间瓦解。",
        practiceHint: "现在停止读这段文字，闭上眼睛 30 秒，问自己\"谁在读这段文字？\"不要用头脑回答，只是\"注意到\"那个正在觉知的觉知。这就是敦珠所说的\"认出\"。",
      },
      {
        chapterNo: 2, title: "四种放下",
        originalText: "敦珠仁波切四种放下教导：\"第一，放下对过去的执着 — 过去已经过去，你抓不住任何一刻。\n\n第二，放下对未来的焦虑 — 未来还没来，你担心的事 99% 不会发生。\n\n第三，放下对当下的分析 — 当你一边生活一边评判\"我做得好不好\"，你已经在生活之外了。\n\n第四，放下对\"放下\"的执着 — 这是最隐秘的一种。很多修行人为\"我已经放下了\"而骄傲，这本身是最大的没放下。\n\n四种都放下时，你会发现：没有一个\"你\"在放下 — 本来就没有东西在绑着你。\"",
        commentary: "\"放下对放下的执着\"是大圆满最狡猾也最深的一刀。修行圈里充满了\"我比谁都超脱\"的自负，敦珠仁波切一针见血。对企业家：你读了禅宗书之后说\"我现在看淡名利了\"，但如果你因此而骄傲，你比之前更执着。真正的放下无声无息，连自己都不知道。",
        practiceHint: "今天观察自己：你有没有在心里默默说\"我比那些追名逐利的人境界高\"？如果有，立刻停住 — 这就是第四种执着。真正的修行没有比较。",
      },
    ],
  },
  {
    slug: "tecumseh-speeches", title: "特库姆塞演说集", titleEn: "Speeches of Tecumseh",
    author: "特库姆塞(Tecumseh)", era: "19 世纪初(1768-1813)",
    ring: 3, categorySlug: "indigenous",
    summary: "肖尼族伟大首领特库姆塞为团结北美原住民各部族抵抗美国西进而发表的系列演说。他是 19 世纪最伟大的原住民政治家与演说家之一，其演说融合精神智慧与战略远见。",
    significance: "特库姆塞的演说代表了北美原住民面对殖民扩张时最深刻、最统一的回应。他的\"土地不能买卖\"论对后世环境伦理、原住民权利运动、乃至现代生态哲学都有深远影响。",
    difficulty: 3, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["肖尼", "特库姆塞", "土地伦理", "演说"], sortOrder: 55,
    relatedSlugs: ["chief-seattle-speech", "black-elk-speaks"],
    chapters: [
      {
        chapterNo: 1, title: "土地不能买卖",
        originalText: "特库姆塞 1810 年对印第安那领地州长哈里森的回答：\"卖土地？！为什么不卖空气、卖大海、卖大地？\n\n伟大的灵赐予这片土地给他所有的孩子使用。它不属于任何一个人，就像风不属于任何一个人。\n\n白人能买空气吗？能买落在他们田地上的阳光吗？不能。那他们凭什么认为可以从我们这里\"买\"土地？\n\n土地不是商品。土地是母亲。你能把你的母亲卖掉吗？\n\n我们战斗，不是为了仇恨白人，而是为了保护母亲不被贩卖。\"",
        commentary: "特库姆塞 1810 年说的话，比现代环境伦理早了 170 年。他把\"土地\"从\"资源\"重新定义为\"母亲\"—— 这不是浪漫主义，是整个原住民世界观的核心。对企业家启示：你对待你的资源（员工、自然、用户数据）是\"商品\"还是\"关系\"？前者让你赢得季度，后者让你赢得世纪。",
        practiceHint: "列出你公司最依赖的三种资源（人才/自然/数据/品牌）。对每一种问自己：\"我是把它当商品还是关系？\" 选一种你最把它当商品的，下周开始用\"关系\"的方式对待它。",
      },
      {
        chapterNo: 2, title: "团结 — 一根柴易折",
        originalText: "特库姆塞号召各部族团结时的演说：\"一根柴很容易折断，一束柴就不容易折断。\n\n我们原住民部族互相争斗了几百年 — 肖尼与易洛魁、克里克与乔克托。我们以为我们在保护自己的地盘，其实我们在给敌人送礼。\n\n白人像潮水一样涌来。他们的战术是一根一根地折断我们。\n\n如果我们是一束，谁能折断我们？\n\n放下旧怨，合成一束。这不是懦弱，是最大的勇气 — 因为放下仇恨比持守仇恨更难。\"",
        commentary: "\"放下仇恨比持守仇恨更难\"这一句话穿越时代。今天的商业世界充满了\"行业对手\"、\"部门内斗\"、\"团队纷争\"。特库姆塞告诉我们：真正的敌人往往在外面，而我们却在内部消耗自己。团结不是软弱，是清醒。",
        practiceHint: "想一个你\"对手\"（竞争公司、对手部门、难相处的同事）。问自己：\"我们真正的共同敌人是什么？\"（市场下行？技术过时？用户流失？）找到共同敌人，合作就有了基础。",
      },
    ],
  },
  {
    slug: "abdul-baha-answers", title: "致答疑问(Some Answered Questions)", titleEn: "Some Answered Questions",
    author: "阿博都-巴哈(Abdu'l-Baha)", era: "1904-1906 年讲述",
    ring: 3, categorySlug: "bahai",
    summary: "巴哈伊信仰创始人巴哈欧拉之子阿博都-巴哈在阿卡（巴勒斯坦）接受美国学者劳拉·巴尼提问的记录。内容涵盖哲学、神学、科学与宗教的和谐、人类进化等主题，是巴哈伊最系统的入门教义书。",
    significance: "《致答疑问》被誉为\"巴哈伊的要理问答\"，以问答体回应 19-20 世纪西方最关心的神学与哲学问题。对巴哈伊信仰在西方的传播起了关键作用，至今仍是新学员必读。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 30,
    tags: ["阿博都-巴哈", "问答", "科学宗教和谐"], sortOrder: 56,
    relatedSlugs: ["gleanings-bahaullah", "kitab-i-aqdas", "seven-valleys"],
    chapters: [
      {
        chapterNo: 1, title: "科学与宗教的和谐",
        originalText: "《致答疑问》论科学与宗教：\"宗教与科学是真理的两翼，人类的灵魂正是凭着这两翼飞翔。\n\n只用一翼不能飞。只有宗教而没有科学，宗教会沦为迷信和幻想；只有科学而没有宗教，科学会沦为唯物主义与道德真空。\n\n真正的宗教必须经得起理性的检验 — 如果一个教义与确定的科学事实相冲突，那要么这个教义需要重新理解，要么这个\"事实\"并不真正确定。\n\n真理只有一个，它不会自相矛盾。\"",
        commentary: "阿博都-巴哈 1904 年就提出的这个观点，在科学与宗教对立依然激烈的今天仍然振聋发聩。他不要求你在理性和信仰之间二选一，而是说两者必须同时持有。对企业家：数据分析是你的\"科学之翼\"，直觉信念是你的\"宗教之翼\"，缺一个都飞不起来。",
        practiceHint: "检查你最近的重大决策：是纯靠数据（可能失去远见）还是纯靠直觉（可能失去根据）？下次决策时刻意两者都用 — 先看数据，再问\"我的直觉怎么说？\"一致的决策最可靠。",
      },
      {
        chapterNo: 2, title: "人类是神圣进化的顶点",
        originalText: "《致答疑问》第 46 章：\"矿物有生长；植物除生长外有生机；动物除生机外有感觉；人除感觉外有理性与灵性。\n\n这四个层次不是平行的，而是层层包含 — 人类身上有矿物性（身体的元素）、植物性（生长代谢）、动物性（感觉本能），但最高的是理性与灵性。\n\n人的挑战在于：不要让较低的层次支配较高的层次。让动物性服从理性，让理性服从灵性。\n\n这不是压抑较低的层次，而是让每一层各安其位。\"",
        commentary: "\"不是压抑而是各安其位\"是阿博都-巴哈最平衡的表达。很多宗教要求\"战胜肉体\"，他说不，肉体要被照顾，但不能让它主导。这对企业家极其重要：你的本能（赚钱、生存、竞争）不需要被消灭，但也不能主导 — 上面还有理性和灵性。",
        practiceHint: "做一个\"四层自检\"：你今天的主要决策是由哪一层驱动的？矿物（生理需求）、植物（习惯）、动物（情绪本能）、人（理性灵性）？理想是四层各安其位，但主导是最高层。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.13 经论++ v13 精修第三轮 — 10 部弱传统深化');

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
        sortOrder: def.sortOrder,
        isPublished: true,
      },
      update: {
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
        sortOrder: def.sortOrder,
      },
    });
    newScriptures++;

    for (const ch of def.chapters) {
      await prisma.scriptureChapter.upsert({
        where: { scriptureId_chapterNo: { scriptureId: scripture.id, chapterNo: ch.chapterNo } },
        create: {
          scriptureId: scripture.id,
          chapterNo: ch.chapterNo,
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          practiceHint: ch.practiceHint,
        },
        update: {
          title: ch.title,
          subtitle: ch.subtitle,
          originalText: ch.originalText,
          commentary: ch.commentary,
          practiceHint: ch.practiceHint,
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

  console.log('  填充新经论关联...');
  let relationCount = 0;
  for (const def of NEW_SCRIPTURES) {
    if (!def.relatedSlugs?.length) continue;
    const related = await prisma.scripture.findMany({
      where: { slug: { in: def.relatedSlugs } },
      select: { id: true },
    });
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.13 精修第三轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => {
    console.error('❌ 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
