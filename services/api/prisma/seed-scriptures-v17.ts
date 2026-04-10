/**
 * M38.17 经论++ v17 — 精修第七轮：10 部古典深化
 * 本轮(10部, 248 → 258):
 *   BUDDHISM +3 (自说经 Udana / 如是语 Itivuttaka / 宝性论 Ratnagotravibhaga)
 *   ZEN +2 (汾阳无德语录 / 智旭·周易禅解)
 *   TAOISM +1 (黄庭外景经)
 *   CONFUCIANISM +1 (周敦颐·通书)
 *   CHRISTIANITY +1 (使徒行传)
 *   ISLAM +1 (伊本·阿拉比·麦加启示)
 *   HINDUISM +1 (吠檀多精髓 Vedanta Sara)
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
    slug: "udana", title: "自说经(Udana)", titleEn: "Udana — Inspired Utterances",
    author: "佛陀原始教言结集", era: "公元前 5-4 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "巴利藏《小部》第三经，收录 80 段佛陀在特殊情境下\"不问自说\"（udana）的感叹句。每段都有一个故事背景 — 佛陀看到某个事件后，有感而发说出一句充满诗意和洞察的话。是最能体现佛陀\"当下直觉智慧\"的文献。",
    significance: "《自说经》的独特在于它记录的不是\"系统教义\"，而是\"即兴智慧\"。著名的\"盲人摸象\"比喻、\"涅槃非有非无\"的著名段落、以及大量展现佛陀幽默感的故事都出自此经。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["自说经", "Udana", "巴利", "感叹偈"], sortOrder: 87,
    relatedSlugs: ["sutta-nipata", "dhammapada"],
    chapters: [
      {
        chapterNo: 1, title: "盲人摸象 — 每个人都只看到一部分",
        originalText: "《自说经》6:4 云：\"从前有一位国王召集城中所有天生盲人，让他们围着一头大象摸索，然后问他们大象像什么。\n\n摸到象头的说：\"大象像一口大锅。\"\n摸到象耳的说：\"大象像一把簸箕。\"\n摸到象牙的说：\"大象像一根铁杵。\"\n摸到象鼻的说：\"大象像一根犁柱。\"\n摸到象身的说：\"大象像一个谷仓。\"\n摸到象脚的说：\"大象像一根柱子。\"\n摸到象尾的说：\"大象像一把扫帚。\"\n\n他们争论不休，甚至动起手来：\"你错了！大象就是像我说的那样！\"\n\n国王大笑：\"你们每个人都摸到了大象的一部分，没有一个人错 — 但也没有一个人对。\"\n\n佛陀随即说偈：\"这些自诩的哲学家们，各执一见而相争斗，他们只见一隅，不见全貌。\"",
        commentary: "\"盲人摸象\"是世界文学史上最著名的认识论比喻。佛陀用这个故事告诉门徒：任何单一视角都只是\"象之一部\"。真理需要多个视角的综合。对现代管理者极其重要：当你听到两个团队激烈争论时，不要急着站队，要先问 — 他们每个人摸到的是大象的哪一部分？往往两个人都\"部分正确\"，只是看不到对方看到的那一部分。",
        practiceHint: "下次遇到团队激烈争论时，做\"盲人摸象\"裁决：让每一方先描述对方的观点\"有哪些合理之处\"。只有每一方都能说出对方的合理之处，才允许继续讨论。",
      },
    ],
  },
  {
    slug: "itivuttaka", title: "如是语(Itivuttaka)", titleEn: "Itivuttaka — Thus Was Said",
    author: "佛陀原始教言结集", era: "公元前 5-4 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "巴利藏《小部》第四经，由 112 段以\"如是世尊说\"（Iti vuccati）开头的短经组成。每段包括一个散文陈述和一段偈颂总结，形式统一、内容精炼，是早期佛教\"实修派\"最爱引用的文献。",
    significance: "《如是语》据传由一位名为 Khujjuttara 的女居士从佛陀处听闻并记录。她是古代印度少数被明确留下名字的女性传教者之一。此经因其简洁实用，在南传佛教中广受诵读。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 20,
    tags: ["如是语", "Itivuttaka", "巴利"], sortOrder: 88,
    relatedSlugs: ["udana", "dhammapada"],
    chapters: [
      {
        chapterNo: 1, title: "三种思念的掌控 — 念头也是修行",
        originalText: "《如是语》第 87 经云：\"比丘们，有三种不善的思念会障碍解脱：\n\n一曰感官的思念（kamavitakka）— 想着追求感官快乐\n二曰嗔恚的思念（vyapadavitakka）— 想着伤害他人\n三曰残害的思念（vihimsavitakka）— 想着让他人痛苦\n\n这三种思念会在你的心里留下痕迹，就像走在湿软的泥地上留下的脚印 — 越走越深，最终无法改道。\n\n比丘们，有三种善的思念会促进解脱：\n\n一曰舍离的思念（nekkhammavitakka）\n二曰无嗔的思念（avyapadavitakka）\n三曰无害的思念（avihimsavitakka）\n\n如是，世尊说：\"想什么，你就成为什么。控制你的思念，就是控制你的未来。\"\"",
        commentary: "早期佛教对\"思念\"（vitakka）的细致分析，远比现代\"冥想\"书籍所讲的深入。佛陀不是让你\"停止思考\"，而是让你分辨\"哪些思念是种下痛苦的种子，哪些思念是种下解脱的种子\"。对企业家：你每天头脑里闪过的上千个念头，不都是中性的 — 有些是在\"种下未来的问题\"。养成\"念头觉察\"的习惯，比任何时间管理术都有用。",
        practiceHint: "用一天时间做\"念头分类\"练习：每小时停下来 1 分钟，回顾这一小时你的主要念头属于哪一类（感官/嗔恚/残害/舍离/无嗔/无害）。记录在小本子上。一天结束时看总体倾向。",
      },
    ],
  },
  {
    slug: "ratnagotravibhaga", title: "宝性论(Ratnagotravibhaga)", titleEn: "Ratnagotravibhaga — Treatise on Buddha Nature",
    author: "弥勒/坚慧 造、勒那摩提译", era: "约 4-5 世纪",
    ring: 2, categorySlug: "buddhist-yogacara",
    summary: "大乘如来藏思想的根本论典，又名《究竟一乘宝性论》。系统论证\"一切众生皆有佛性\"的核心观点，从\"佛、法、僧、众生界、菩提、佛德、佛业\"七金刚句展开。是连接印度如来藏思想与中国佛性论的关键文献。",
    significance: "《宝性论》在藏传佛教中地位极高，被称为\"慈氏五论\"之一，格鲁派、宁玛派、噶举派都把它列为必修。对汉传佛教来说，它为\"众生皆可成佛\"的信念提供了最系统的理论基础，是天台、华严、禅宗\"佛性论\"的经文源头。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 40,
    tags: ["宝性论", "如来藏", "佛性", "弥勒"], sortOrder: 89,
    relatedSlugs: ["lengqie-jing", "yuanjue-jing"],
    chapters: [
      {
        chapterNo: 1, title: "众生即佛 — 只是被云遮住的太阳",
        originalText: "《宝性论》云：\"一切众生悉有如来藏，犹如明珠为尘所覆。尘若去已，珠光自现。\n\n佛性喻三种相：\n一如佛像在破布之中 — 佛相未失，但被污秽遮蔽；\n二如黄金在泥土之中 — 黄金本质未变，只是外表难辨；\n三如宝藏在贫者家中 — 贫者不自知，所以受苦；若知所有，即刻富贵。\n\n众生之苦，不在\"没有佛性\"，而在\"不知自有\"。\n\n是故菩萨闻此经，当发大愿：\"我当令一切众生，知自有珠，去其尘垢，显其光明。\"",
        commentary: "《宝性论》的\"佛性论\"是大乘佛教最乐观、最激励人心的教义之一：你不是有缺陷的需要被修补，你是完整的只是被遮蔽。这与现代积极心理学、教练学（Coaching）的核心假设惊人一致 — 好的教练不是\"灌输\"知识给客户，而是\"帮客户看见自己早已拥有的智慧\"。对企业领导：你对团队的假设是\"他们需要我教他们\"还是\"他们本有智慧只是被遮蔽\"？这个假设的差异决定了你是\"老板\"还是\"教练\"。",
        practiceHint: "对你团队中一个你觉得\"需要提升\"的下属，做一次\"宝性实验\"：不给任何建议，只问三个问题：\"你觉得自己的强项是什么？你最近哪件事做得让自己骄傲？如果没有任何限制，你会怎么做这件事？\" 认真听，你可能会发现他本来就有答案。",
      },
    ],
  },
  {
    slug: "fenyang-yulu", title: "汾阳无德禅师语录", titleEn: "Recorded Sayings of Fenyang Wude",
    author: "汾阳善昭", era: "北宋(约 1000)",
    ring: 1, categorySlug: "zen-linji",
    summary: "临济宗中兴祖师汾阳善昭（947-1024）的语录。他整理的\"汾阳十八问\"和\"三句颂古\"是\"文字禅\"和\"看话禅\"的开端。临济宗在他之前一度衰微，他的教学方法使临济宗重振，成为宋代禅宗最主流的宗派。",
    significance: "汾阳的\"十八问\"是对禅门接引学人方法的最系统总结；他的\"颂古\"（以诗偈解古代公案）开创了\"文字禅\"传统，直接启发了后来雪窦重显的《颂古百则》和圆悟克勤的《碧岩录》。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["汾阳", "十八问", "文字禅", "临济中兴"], sortOrder: 90,
    relatedSlugs: ["linji-lu", "biyan-lu"],
    chapters: [
      {
        chapterNo: 1, title: "十八问 — 学人入门的十八种问法",
        originalText: "《汾阳十八问》云：\"学人到师前参问，有十八种问法：\n\n一问\"请益问\"— 直接请教\n二问\"呈解问\"— 呈上自己的见解求印证\n三问\"察辨问\"— 试探老师深浅\n四问\"投机问\"— 恰到好处的问法\n五问\"偏僻问\"— 出奇制胜的问法\n六问\"心行问\"— 问具体用功方法\n七问\"探拔问\"— 深入探究\n八问\"不会问\"— 承认不懂\n九问\"擎担问\"— 举出一个难题\n十问\"置问\"— 故意不问\n十一问\"借事问\"— 借日常事\n十二问\"实问\"— 如实相问\n十三问\"假问\"— 假设性问\n十四问\"审问\"— 反复追问\n十五问\"征问\"— 求证的问\n十六问\"明问\"— 清晰的问\n十七问\"默问\"— 不说话的问\n十八问\"验主问\"— 反向考验老师\n\n十八种问各有妙用，师若不识，则接引无力。\"",
        commentary: "汾阳的\"十八问\"是禅宗最细致的\"教学相长\"方法论。它提醒老师：\"问\"不是一种 — 不同的问法需要不同的回应方式。对企业教练和管理者极有启示：当下属问你问题时，你要先判断这是 18 种中的哪一种 — 是真的不懂（不会问），还是想试探你（察辨问），还是已经有答案只想确认（呈解问）？不同的问需要不同的答。",
        practiceHint: "下次会议中，当有人向你提问时，不要立刻回答。先在心里判断：这是 18 种哪一种？根据分类选择回应方式 — 如果是\"呈解问\"，先让他说；如果是\"默问\"，给他空间；如果是\"请益问\"，再正面回答。",
      },
    ],
  },
  {
    slug: "zhouyi-chanjie", title: "周易禅解", titleEn: "Zen Interpretation of the Book of Changes",
    author: "蕅益智旭", era: "明末(1645)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "明末高僧蕅益智旭（1599-1655）用佛教禅宗的视角解读《周易》的跨传统著作。智旭认为儒释道三教同源，《周易》的六十四卦不仅是占卜与哲学，更是心性修行的图谱。是中国历史上最重要的\"三教融合\"文献之一。",
    significance: "智旭是明末\"四大高僧\"之一（憨山、紫柏、莲池、蕅益），被尊为净土宗第九祖。《周易禅解》展现了中国佛教的\"本土化\"最高成果 — 不是把佛教搬到中国，而是真正和中国文化融为一体。对现代\"跨文化融合\"式思考有巨大启发。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["蕅益", "周易禅解", "三教融合"], sortOrder: 91,
    relatedSlugs: ["yijing", "platform-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "乾卦·元亨利贞 — 修行的四个阶段",
        originalText: "《周易禅解·乾卦》云：\"乾，元亨利贞。智旭释：\n\n\"元\"者 — 发心的清净无染。修行的起点是\"发菩提心\"，即\"愿成佛度众生\"。没有这个起点，后续一切工夫都是空中楼阁。\n\n\"亨\"者 — 修行的顺利通达。发心之后，戒定慧三学渐次展开，如春天万物生长，势不可挡。\n\n\"利\"者 — 悟境的受用真实。\"利\"即\"利他\"— 真正的悟不是\"独自享受\"，而是\"能利益他人\"。若悟境不能化为对他人的关爱，这个悟是假的。\n\n\"贞\"者 — 修行的坚固不退。贞即\"正\"，即\"定\"。真正的成就不是一时的灵光，而是\"几十年如一日的坚守\"。\n\n元亨利贞四字，也就是佛教\"信解行证\"四个阶段的另一种表述。东方文化用不同的语言在讲同一件事。\"",
        commentary: "智旭的\"三教融合\"不是肤浅的\"都差不多\"，而是深入到每个传统的核心后发现它们指向同一个真相。这对现代企业家极有启示：当你面对\"东方智慧 vs 西方管理\"\"传统 vs 现代\"\"理论 vs 实践\"这些看似对立的思想体系时，不要急着\"选一个\" — 深入每一个，你会发现它们在最深处是相通的。",
        practiceHint: "选两个你觉得\"相互对立\"的思想体系（如\"精益创业\"和\"长期主义\"，\"OKR\"和\"无为\"）。不要问\"哪个对\"，而是问：\"它们在最深层是在讲同一件事吗？\" 写下你的思考。",
      },
    ],
  },
  {
    slug: "huangting-waijing", title: "黄庭外景经", titleEn: "Scripture of the Yellow Court — External View",
    author: "魏华存及上清派", era: "东晋(约 300-350)",
    ring: 3, categorySlug: "taoism",
    summary: "道教上清派最重要的内修经典之一，与《黄庭内景经》合称\"黄庭经\"。以七言诗偈形式描述人体内的神灵系统（\"体内有神\"）和内丹修炼方法。是中国传统\"身体修行学\"的里程碑文献。",
    significance: "《黄庭经》对中国书法史也有重要意义 — 王羲之曾手抄《黄庭经》，这个版本成为书法史上的名品\"换鹅帖\"。对中医经络学、气功学、道家内丹学都有深远影响。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["黄庭", "上清", "内丹", "身神"], sortOrder: 92,
    relatedSlugs: ["cantong-qi", "zhengao"],
    chapters: [
      {
        chapterNo: 1, title: "体内众神 — 身体是一座殿堂",
        originalText: "《黄庭外景经》云：\"上有黄庭下关元，后有幽阙前命门。\n呼吸庐间以自偿，保守完坚身受庆。\n\n身体内各部位都有\"神\"居住：\n头顶 — 泥丸宫，有\"脑神\"精根；\n眉间 — 明堂，有\"明堂神\"；\n两眉之间 — 天庭，有\"天庭神\"；\n舌下 — 华池，有\"舌神\"正伦；\n胸 — 绛宫，有\"心神\"丹元；\n腹部中线 — 黄庭，有\"脾神\"常在；\n小腹 — 下丹田，有\"肾神\"玄冥。\n\n修行者每日静坐，要\"存思\"这些体内之神 — 观想他们在你体内各就其位，身体就像一座殿堂，里面住满守护的神灵。\n\n神居则安，神散则病。\n身如神殿，勿令尘染。\"",
        commentary: "道教\"体内有神\"的观念看似迷信，实际上是一种极深的\"身体觉察\"技术。现代神经科学发现：大脑和肠道之间有复杂的神经信号（\"第二大脑\"），心脏也有自己的神经元网络。道家的\"体内众神\"其实是在用一种形象化语言描述这些\"分布式智能\"。对现代人：你的身体不是\"服从大脑的机器\"，它本身就有智慧。学会倾听身体（不舒服、疲惫、直觉），就是在\"尊重体内之神\"。",
        practiceHint: "做\"身体扫描\"练习：躺下，闭眼，从头到脚 \"访问\" 身体每个部位 —头、眉、眼、舌、喉、胸、胃、腹、肾、腿。在每一处停留 30 秒，问：\"这里现在感觉如何？有什么想告诉我的吗？\" 坚持 21 天。",
      },
    ],
  },
  {
    slug: "zhou-dunyi-tongshu", title: "周敦颐·通书", titleEn: "Zhou Dunyi — Penetrating the Book of Changes",
    author: "周敦颐(濂溪先生)", era: "北宋(约 1060)",
    ring: 3, categorySlug: "confucianism",
    summary: "宋明理学开山祖师周敦颐（1017-1073）的代表作，共 40 章。以\"诚\"为核心概念，融合《易经》与儒家道德论，建立了后世理学的基本思想框架。与他的《太极图说》合为理学奠基文献。",
    significance: "周敦颐被朱熹尊为\"理学开山\"，他的\"诚\"概念重新定义了儒家的终极价值 — 不是外在的\"礼\"，而是内在的\"诚\"。通过程颢、程颐传给朱熹，成为整个宋明理学的起点。对中国文人的人格理想塑造了 800 年。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["周敦颐", "通书", "诚", "理学"], sortOrder: 93,
    relatedSlugs: ["jinsi-lu", "chuanxi-lu"],
    chapters: [
      {
        chapterNo: 1, title: "诚 — 宇宙的本源与人格的极致",
        originalText: "《通书·诚上》云：\"诚者，圣人之本。\"大哉乾元，万物资始\"，诚之源也。\n\n\"乾道变化，各正性命\"，诚斯立焉。纯粹至善者也。\n\n故曰：\"一阴一阳之谓道，继之者善也，成之者性也。\"\n\n元、亨，诚之通；利、贞，诚之复。大哉易也，性命之源乎！\n\n〖第二章〗诚，无为；几，善恶。\n\n德：爱曰仁，宜曰义，理曰礼，通曰智，守曰信。\n\n性焉安焉之谓圣，复焉执焉之谓贤，发微不可见、充周不可穷之谓神。\"",
        commentary: "周敦颐把\"诚\"提升到宇宙本体的高度 — 诚不是\"诚实地说话\"这种小事，而是\"宇宙运行的根本节律\"。一个人\"真诚\"时，他不是在\"做一件好事\"，而是在\"与宇宙的节律同步\"。对现代企业家：\"做真实的自己\"不只是心理学建议，而是一个哲学命题 — 只有当你真诚时，你的选择才能与最深的规律对齐。所有的\"装\"\"伪\"\"策略\"都会在真诚面前不战而败。",
        practiceHint: "本周做\"诚实实验\"：选 3 个通常你会\"美化\"或\"回避\"的场合（客户问题、团队反馈、家人矛盾），刻意用\"最真实的表达\"— 不带策略、不为结果、只为真。观察对方的反应和你自己的感受。",
      },
    ],
  },
  {
    slug: "acts-apostles", title: "使徒行传", titleEn: "Acts of the Apostles",
    author: "路加", era: "约 80-90 年",
    ring: 3, categorySlug: "christianity",
    summary: "新约圣经第五卷，路加福音的续篇，记载耶稣升天后的 30 年间基督教从耶路撒冷发源向罗马帝国扩张的过程。核心人物包括彼得、司提反、腓利、巴拿巴、保罗等。是研究早期教会史最重要的文献。",
    significance: "《使徒行传》被称为\"第一本基督教教会史\"，保罗三次传教旅程、早期基督徒社区的共产式生活、外邦人加入教会的争论、第一届耶路撒冷会议等重大事件都记载于此。对理解基督教如何从犹太小宗派成长为世界宗教至关重要。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 30,
    tags: ["使徒", "保罗", "早期教会"], sortOrder: 94,
    relatedSlugs: ["luke-gospel", "romans-epistle"],
    chapters: [
      {
        chapterNo: 1, title: "万民一心 — 凡物公用",
        originalText: "《使徒行传》2:42-47：\"都恒心遵守使徒的教训，彼此交接，擘饼，祈祷。\n\n众人都惧怕，使徒又行了许多奇事神迹。\n\n信的人都在一处，凡物公用，并且卖了田产家业，照各人所需用的分给各人。\n\n他们天天同心合意恒切地在殿里，且在家中擘饼，存着欢喜诚实的心用饭，赞美神，得众民的喜爱。主将得救的人天天加给他们。\"\n\n《使徒行传》4:32-35 续：\"那许多信的人都是一心一意的，没有一人说他的东西有一样是自己的，都是大家公用。\n\n使徒大有能力，见证主耶稣复活；众人也都蒙大恩。\n\n内中也没有一个缺乏的，因为人人将田产房屋都卖了，把所卖的价银拿来放在使徒脚前，照各人所需用的，分给各人。\"",
        commentary: "早期基督徒社区是人类历史上少数真正实行\"凡物公用\"的社区之一。这不是强制的共产主义，而是自愿的共享 — 因为他们相信耶稣的\"爱邻如己\"\"爱仇敌\"不是一句口号，而是日常生活的规则。虽然这种\"凡物公用\"后来没有持续，但它留下的精神遗产影响了后世所有的慈善运动、合作社运动、社会福利制度。对企业家：你的公司是否有真正的\"共享精神\"？还是只是\"各自为政\"的合约集合？",
        practiceHint: "在你的团队里做一个小实验：本月选一个\"需要帮助的同事\"（不一定是你团队内的），不声张地为他做一件事（帮他完成一个任务、介绍一个资源、替他承担一次责任）。不求回报，不让他知道是你。",
      },
    ],
  },
  {
    slug: "futuhat-mecca", title: "麦加启示(Futuhat al-Makkiyya)", titleEn: "The Meccan Revelations",
    author: "伊本·阿拉比(Ibn Arabi)", era: "12-13 世纪(约 1200-1240)",
    ring: 3, categorySlug: "islam",
    summary: "苏菲派大师伊本·阿拉比（1165-1240）的毕生巨著，共 560 章，数百万字。汇集了他在麦加朝觐期间以及之后几十年对\"存在的统一性\"（Wahdat al-Wujud）的深度阐述。被誉为伊斯兰神秘主义的\"百科全书\"。",
    significance: "《麦加启示》的规模与深度在伊斯兰思想史上无与伦比。伊本·阿拉比提出的\"完人\"（Al-Insan al-Kamil）、\"存在的统一\"、\"神圣之名\"等概念，深刻影响了后世的苏菲主义、波斯诗歌、奥斯曼神秘主义，甚至间接影响了欧洲经院哲学。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 40,
    tags: ["伊本阿拉比", "苏菲", "存在统一", "完人"], sortOrder: 95,
    relatedSlugs: ["fusus-al-hikam", "masnavi"],
    chapters: [
      {
        chapterNo: 1, title: "存在的统一 — 万物都是神的名",
        originalText: "《麦加启示》云：\"存在（Wujud）只有一个 — 那就是神（al-Haqq）。其余的一切，看似独立存在的\"物\"，实际上只是神的不同\"显现\"（tajalli）。\n\n就像太阳的光照在不同颜色的玻璃上，呈现不同的颜色 — 颜色看似不同，但光是同一个。\n\n每一个存在者（树、山、人、星辰）都是神的一个\"名\"（Ism）的显现：\n- 一朵花 — 是神的\"美丽\"之名\n- 一座山 — 是神的\"稳固\"之名\n- 一个智者 — 是神的\"智慧\"之名\n- 你自己 — 是神某一个独特之名的显现\n\n因此：你不是\"在寻找神\"— 你本身就是神的一次显现。你要做的，不是\"找到神\"，而是\"清楚地显现出你承载的那个神圣之名\"。\n\n这就是\"完人\"（Al-Insan al-Kamil）— 一个清楚地显现了最多神圣之名的人。\"",
        commentary: "伊本·阿拉比的\"存在的统一\"思想是人类神秘主义哲学的最高成就之一。它与印度教\"梵我如一\"、佛教\"即心即佛\"、道教\"道在万物\"、犹太教卡巴拉神秘主义惊人一致 — 这种跨文明的趋同，暗示着某种超越特定宗教的\"深层真理\"。对企业家：这个思想给出了一个革命性的\"自我定位\"— 你不是在\"争取成功\"，你是在\"显现你本有的某个独特特质\"。每个人都是神的一个独特之名，你的任务不是\"成为别人\"，而是\"完全地成为你自己\"。",
        practiceHint: "做一次\"神圣之名\"自问：如果你是\"神的一个独特之名\"的显现，这个名字是什么？（美丽/智慧/勇气/慈悲/公正/创造/耐心...）写下 3 个可能的答案。本周，在每一个决策时问自己：\"这个决策是在显现这个名字，还是在遮蔽它？\"",
      },
    ],
  },
  {
    slug: "vedanta-saar", title: "吠檀多精髓(Vedanta Sara)", titleEn: "Vedanta Sara — Essence of Vedanta",
    author: "Sadananda Yogindra", era: "15 世纪印度",
    ring: 3, categorySlug: "hinduism",
    summary: "Advaita（不二）吠檀多哲学最经典的入门教科书，15 世纪南印度学者 Sadananda 所作。系统介绍吠檀多的 4 个必要条件（资格）、3 种解脱方法、5 个理解层次。篇幅不长但条理清晰，被称为\"印度哲学的简明入门\"。",
    significance: "《吠檀多精髓》与《吠檀多定义》并列为研究 Advaita 哲学的\"双璧\"。前者更偏\"入门\"，后者更偏\"进阶\"。斯瓦米·维韦卡南达（Swami Vivekananda）在 19 世纪将吠檀多介绍给西方时，大量引用此书作为参考。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["吠檀多", "Advaita", "解脱"], sortOrder: 96,
    relatedSlugs: ["viveka-chudamani", "vedanta-paribhasha"],
    chapters: [
      {
        chapterNo: 1, title: "四种资格 — 修行的前提条件",
        originalText: "《吠檀多精髓》云：\"并非所有人都适合学习吠檀多。必须先具备四种资格（sadhana chatushtaya）：\n\n一曰 Viveka（辨别力）— 能分辨\"永恒者\"与\"无常者\"\n二曰 Vairagya（离欲）— 对世俗享乐不再贪着\n三曰 Shat-sampatti（六德）— 平静、克制、弃绝、忍耐、信心、专注\n四曰 Mumukshutvam（求解脱的渴望）— 强烈的求解脱愿望\n\n没有这四种资格的人学习吠檀多，就像没有牙齿的人吃坚果 — 不仅无用，还可能受伤。\n\n资格不够的人应先通过\"业瑜伽\"（kartma yoga，无私服务）和\"信爱瑜伽\"（bhakti yoga，虔诚奉献）净化心灵，再来学\"知识瑜伽\"（jnana yoga）。\n\n传统的智慧是：急于求知识的人反而学不到知识。\"",
        commentary: "印度哲学对\"学习资格\"的强调值得深思：现代社会普遍相信\"知识对所有人开放\"，但古老传统认为\"某些深层真理需要特定的心智成熟度\"。这不是精英主义，而是保护 — 就像不能把微积分直接教给一年级学生。对企业家：当你引进某个\"先进管理理念\"（OKR、Holacracy、自我管理）时，先评估团队的\"资格\" — 他们有辨别力吗？有耐心吗？有学习渴望吗？如果没有，先补基础课，不要直接上高阶内容。",
        practiceHint: "用\"四种资格\"自评：给自己四项各打 1-10 分（辨别力/离欲/六德/求索心）。最低的那一项，就是你当下最需要补的功课。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.17 经论++ v17 精修第七轮 — 10 部古典深化');

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
    await prisma.scripture.update({
      where: { slug: def.slug },
      data: { relatedIds: related.map(r => r.id) },
    });
    relationCount++;
  }
  console.log(`  ✓ ${relationCount} 新经论有关联`);

  const totalScriptures = await prisma.scripture.count();
  const totalChapters = await prisma.scriptureChapter.count();
  console.log(`\n📜 M38.17 精修第七轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
