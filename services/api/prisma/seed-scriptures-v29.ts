/**
 * M38.29 经论++ v29 — 精修第十九轮：10 部小传统第二层深化
 * 本轮(10部, 357 → 367):
 *   HINDUISM +1 (商羯罗·自我知识 Atma Bodha)
 *   TAOISM +1 (陈抟·无极图说)
 *   CONFUCIANISM +1 (王夫之·读通鉴论)
 *   CHRISTIANITY +1 (圣特蕾莎·内心城堡)
 *   ISLAM +1 (朱奈德·书信集)
 *   JUDAISM +1 (维尔纳加昂·光辉之冠)
 *   TIBETAN +1 (龙钦巴·大圆满三休息)
 *   SIKHISM +1 (古鲁安格德·萨洛克)
 *   BAHAI +1 (阿博都巴哈·巴黎之谈)
 *   INDIGENOUS +1 (奥希耶萨·印第安人的灵魂)
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
    slug: "shankara-atmabodha", title: "商羯罗·自我知识", titleEn: "Shankara: Atma Bodha (Self-Knowledge)",
    author: "阿迪·商羯罗", era: "印度(约 800)",
    ring: 3, categorySlug: "hinduism",
    summary: "商羯罗的 68 节短诗体论著，是吠檀多最精炼的入门读物。与巨著《辨道宝鬘》相比，《自我知识》是商羯罗为那些没有时间深入学习的初学者而写的\"速成指南\"——用最简短的篇幅直接讲\"你就是梵\"的核心真理。",
    significance: "《自我知识》因其短小(只需一小时读完)而在印度教传统中被视为\"随身携带的宝石\"——任何时候困惑时读一遍都能重新定位。20 世纪斯瓦米·奇达南达(Swami Chinmayananda)将其英译并广泛传播，成为现代印度教初学者最广泛使用的入门文本。",
    difficulty: 3, oxStageMin: 4, oxStageMax: 10, readingMins: 20,
    tags: ["商羯罗", "吠檀多", "自我", "梵"], sortOrder: 202,
    relatedSlugs: ["shankara-vivekachudamani", "vivekananda-karma-yoga"],
    chapters: [
      {
        chapterNo: 1, title: "我即阿特曼",
        originalText: "正如太阳的倒影显现在水面上并非太阳本身——同样，你以为的\"自我\"并非真正的阿特曼。真正的阿特曼永远不生不灭、不增不减，不被任何身心活动所污染。辨别这一点，就是解脱的开端。",
        commentary: "商羯罗的\"太阳-水影\"譬喻是吠檀多最经典的象征。你平时感到的\"我\"(有情绪、有身体、会衰老的那个我)只是阿特曼在身心上的\"倒影\"——不是阿特曼本身。修行的全部工作就是透过倒影看到真正的太阳。",
        practiceHint: "在任何情绪(高兴、悲伤、愤怒、恐惧)升起时，立即问自己：\"感到这情绪的那个\"我\"是倒影还是真阿特曼？\"——持续观察可以松动对情绪的执着。",
      },
    ],
  },
  {
    slug: "chentuan-wuji-tu", title: "陈抟·无极图说", titleEn: "Chen Tuan: Diagram of the Ultimate of Nothingness",
    author: "陈抟", era: "五代/宋(约 970)",
    ring: 3, categorySlug: "taoism",
    summary: "华山道士陈抟(871-989)所绘并注解的《无极图》，是道教内丹学最重要的图像化理论之一。此图从\"无极\"出发，经\"太极\"、\"阴阳\"、\"五行\"、\"万物\"的顺向展开展示宇宙生成；再从\"万物\"到\"五行\"、\"阴阳\"、\"太极\"、\"无极\"的逆向修炼展示内丹成就——修丹即是\"逆天地之造化\"。",
    significance: "陈抟《无极图》是北宋内丹学的理论奠基之一，周敦颐著名的《太极图说》直接源自此图(只是方向相反)。无极图通过可视化的方式展示\"精气神合一\"的修炼路径，成为后世全真、南宗、东派、西派内丹学的共同理论基础。陈抟本人也被尊为\"睡仙\"、\"希夷先生\"。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 30,
    tags: ["陈抟", "无极图", "内丹", "逆修"], sortOrder: 203,
    relatedSlugs: ["wuzhen-pian", "taiji-tushuo"],
    chapters: [
      {
        chapterNo: 1, title: "逆则成丹",
        originalText: "顺则生人，逆则成丹。顺行天地造化——从无极到太极到阴阳到五行到万物，是天地生人之道；逆行天地造化——从万物收摄到五行，五行收摄到阴阳，阴阳收摄到太极，太极归于无极，是人还为仙之道。",
        commentary: "陈抟内丹学的核心公式——\"顺则生人，逆则成丹\"。宇宙向外扩展产生万物的过程就是\"顺\"；修炼者把身心向内收摄归于本源的过程就是\"逆\"。这个\"逆向工程\"是道教内丹学区别于其他养生术的根本——不是\"补养身体\"，而是\"回归本源\"。",
        practiceHint: "每日打坐时练习\"逆收\"：从眼耳感官(万物)收回到呼吸(阴阳)，从呼吸收回到心识(太极)，最后让心识本身消融(无极)。",
      },
    ],
  },
  {
    slug: "wang-fuzhi-dushu", title: "王夫之·读通鉴论", titleEn: "Wang Fuzhi: On Reading the Comprehensive Mirror",
    author: "王夫之", era: "明末清初(约 1687)",
    ring: 3, categorySlug: "confucianism",
    summary: "明末清初大儒王夫之(1619-1692)以《资治通鉴》为纲写就的史论巨著，30 卷，评论从秦至五代的历史人物和事件。王夫之不同于一般史论者的\"褒贬人物\"，而是着力探究\"历史规律\"——他是中国古代最接近\"历史哲学家\"的思想家。",
    significance: "《读通鉴论》是王夫之\"经世致用\"思想的集中体现，也是其哲学观点在历史领域的应用。他在此书中提出\"理势合一\"、\"天人相继\"等重要命题，为后来\"经世实学\"和近代民族主义思想提供了思想资源。梁启超评价此书\"读之令人胸怀开朗\"。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 50,
    tags: ["王夫之", "读通鉴", "经世", "史论"], sortOrder: 204,
    relatedSlugs: ["chen-baisha-yulu", "lvkun-shenyinyu"],
    chapters: [
      {
        chapterNo: 1, title: "理势合一",
        originalText: "势之所趋，理之所在。理不孤行，势不妄作。理势合一，天人相继。善观天下者，不执理以议势，不循势以弃理；而是从理势交织的整体中看出\"历史的必然\"。",
        commentary: "王夫之\"理势合一\"的历史哲学——所谓\"势\"指历史发展的客观趋势，所谓\"理\"指应当如何的道德准则。一般人要么\"空谈道德\"忽视客观趋势，要么\"屈从现实\"放弃道德原则。王夫之主张二者统一：道德必须落实在现实趋势中，趋势也必须符合道德方向。",
        practiceHint: "面对任何社会问题时同时问两个问题：(1)它的客观趋势是什么？(2)它应当怎样？——两个答案交汇处，就是你应当行动的方向。",
      },
    ],
  },
  {
    slug: "teresa-interior-castle", title: "圣特蕾莎·内心城堡", titleEn: "Teresa of Avila: The Interior Castle",
    author: "阿维拉的德兰", era: "西班牙(1577)",
    ring: 3, categorySlug: "christianity",
    summary: "加尔默罗会改革者阿维拉的德兰(Teresa of Avila, 1515-1582)的灵修经典代表作。她以\"内心城堡\"为譬喻——灵魂就像一座由七重住所组成的晶莹城堡，基督在最中心的第七重住所等候灵魂。修行就是逐层深入，穿过七道住所去见基督。",
    significance: "《内心城堡》是基督教神秘主义文学的巅峰之作，与十字若望的《心灵的黑夜》并列为西班牙神秘主义双璧。特蕾莎于 1622 年被封圣，1970 年被教会正式授予\"教会圣师\"(Doctor of the Church)称号——她是第一位获此荣誉的女性。本书影响了后世几乎所有基督教灵修作家。",
    difficulty: 4, oxStageMin: 5, oxStageMax: 10, readingMins: 45,
    tags: ["特蕾莎", "内心城堡", "七重住所", "神秘"], sortOrder: 205,
    relatedSlugs: ["teresa-way-perfection", "john-cross-dark-night"],
    chapters: [
      {
        chapterNo: 1, title: "七重住所",
        originalText: "我把灵魂想象成一座城堡，完全由一颗钻石或非常透明的水晶制成，里面有许多房间，正如在天堂里有许多住所一样。姐妹们，如果我们仔细想想，灵魂不过就是正义人的天堂，而上帝说他在那里感到快乐。",
        commentary: "特蕾莎开篇就建立了整部书的核心意象——灵魂是一座由透明水晶制成的城堡，有七重房间。第一至三重是外层(凡夫修行)，第四至六重是中层(灵魂进入默观)，第七重是最深处(灵魂与神\"婚配\")。这种\"空间化\"的修行地图极大影响了后世灵修传统。",
        practiceHint: "每日默想\"你的灵魂是透明水晶城堡\"——这个意象本身就会改变你看待自己的方式。你不再是\"有缺陷的凡夫\"，而是\"神所居住的圣殿\"。",
      },
    ],
  },
  {
    slug: "junayd-rasail", title: "朱奈德·书信集", titleEn: "Junayd of Baghdad: Letters and Treatises",
    author: "朱奈德", era: "巴格达(约 900)",
    ring: 3, categorySlug: "islam",
    summary: "9 世纪苏菲道师\"首领\"朱奈德·巴格达迪(Junayd of Baghdad, 830-910)的书信和小论文集。朱奈德被后世所有苏菲道团尊为\"sayyid al-ta'ifa\"(道团之主)——在他之前苏菲多为散修行者，在他之后才有了系统化的\"道团\"组织。他的书信是最早的苏菲系统性教学文献。",
    significance: "朱奈德是\"清醒苏菲\"(sober Sufism)的开创者，与同时代\"醉苏菲\"巴斯塔米形成对照。他主张苏菲应当在证悟之后仍然遵守伊斯兰律法，不应以\"入神状态\"为借口放弃宗教义务。这一立场使苏菲主义与正统伊斯兰教和解，此后 1000 年苏菲道团得以在伊斯兰世界合法存在，都得益于朱奈德的思想基础。",
    difficulty: 4, oxStageMin: 5, oxStageMax: 10, readingMins: 35,
    tags: ["朱奈德", "苏菲", "清醒", "道团"], sortOrder: 206,
    relatedSlugs: ["rumi-fihi-ma-fihi", "jilani-ghunyat"],
    chapters: [
      {
        chapterNo: 1, title: "醒与醉",
        originalText: "苏菲修行有两个阶段：第一阶段是\"醉\"(sukr)——心灵被神的爱情淹没，忘记一切；第二阶段是\"醒\"(sahw)——从神的醉中回到日常世界，用律法和伦理继续生活。初学者常停留于\"醉\"——那是半途；真正的大师是\"醒\"——醉后归来。",
        commentary: "朱奈德\"醒与醉\"的两阶段理论是苏菲修行的核心结构。\"醉\"虽然境界高，但若停留于此就会放弃日常义务，变得\"疯狂的苏菲\"(如哈拉智被处死)。\"醒\"是更高的境界——已经尝过神的爱情，却仍能回到世间以正常面貌示人，不炫耀、不脱离。",
        practiceHint: "若你曾体验过宗教狂喜，警惕停留于那种状态——朱奈德说，真正的大师不会让别人看出他\"有什么特别\"，他看起来就像普通人。",
      },
    ],
  },
  {
    slug: "vilna-gaon-aderet", title: "维尔纳加昂·光辉之冠", titleEn: "Vilna Gaon: Aderet Eliyahu",
    author: "维尔纳加昂(Elijah ben Solomon)", era: "立陶宛(约 1780)",
    ring: 3, categorySlug: "judaism",
    summary: "立陶宛大拉比维尔纳加昂(Gaon of Vilna, 1720-1797)对摩西五经的简短注释集，名\"Aderet Eliyahu\"(以利亚的华美外袍)。他的注释特色是极简主义——一两句话直击经文最关键的难点，不作冗长讨论。这反映了他\"Misnagdim\"(反哈西德派)的理性主义立场：经文要用智力严谨地解读，不能陷入神秘情感。",
    significance: "维尔纳加昂是 18 世纪犹太教最具影响力的学者之一，被视为\"立陶宛学派\"的奠基人。他反对当时兴起的哈西德派(Hasidism)的神秘情感倾向，坚持\"以理性研读妥拉\"的传统。他的影响使立陶宛成为 18-19 世纪犹太教学术研究的中心(如著名的沃洛任耶希瓦)，后来美国主流正统派犹太教的学术传统也直接源自这一脉。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 40,
    tags: ["维尔纳加昂", "立陶宛", "理性", "Misnagdim"], sortOrder: 207,
    relatedSlugs: ["maimonides-mishneh-torah", "shulkhan-arukh"],
    chapters: [
      {
        chapterNo: 1, title: "以理性读圣书",
        originalText: "研读妥拉要用最严格的智力分析——不能仅凭感动，不能仅凭传说，不能仅凭神秘体验。每个词、每个字母都必须有理由。若你读出与先前学者不同的理解，你必须能用逻辑证明自己的理解更符合经文。",
        commentary: "维尔纳加昂的治学原则——对妥拉的诠释必须经得起\"逻辑法庭\"的审判。这与哈西德派\"心灵直觉\"的读经法形成鲜明对照。他本人精通数学、天文、音乐，主张这些\"世俗知识\"是正确理解妥拉的必要辅助——没有知识就无法真正懂经。",
        practiceHint: "读任何宗教经典时，永远问：\"我的理解是否经得起严格的逻辑检验？\"——这不是对经典不敬，而是最深的敬意。",
      },
    ],
  },
  {
    slug: "longchenpa-three-rests", title: "龙钦巴·大圆满三休息", titleEn: "Longchenpa: The Trilogy of Rest",
    author: "龙钦巴", era: "藏区(约 1360)",
    ring: 3, categorySlug: "tibetan",
    summary: "宁玛派大圆满传承最重要的大师龙钦巴(1308-1364)的\"三休息\"三部曲：\"心性休息\"、\"禅定休息\"、\"虚幻休息\"。每一部都包含\"根本颂\"加\"自注\"，完整阐述大圆满见、修、行的各个层次。与龙钦\"七宝藏\"一起构成龙钦文学的两大支柱。",
    significance: "\"三休息\"是宁玛派大圆满最系统的修行手册，在藏传佛教内被视为\"大圆满的百科全书\"。\"休息\"(ngal gso)这个词是龙钦特有的用法——不是\"休息放松\"的意思，而是\"从寻觅中安住下来\"——因为大圆满的本性已经本具，任何寻找都是多余的，只需\"安住其中\"。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 55,
    tags: ["龙钦巴", "大圆满", "三休息", "宁玛"], sortOrder: 208,
    relatedSlugs: ["longchenpa-seven-treasuries", "patrul-kunzang-lamai"],
    chapters: [
      {
        chapterNo: 1, title: "心性休息",
        originalText: "万法本来清净，无需再清净；万法本来圆满，无需再圆满。看到这一点，不是一种新的见解，而是\"从寻觅中休息下来\"。初学者以为修行是\"做什么\"——真正的大圆满修行是\"什么也不做，安住本然\"。",
        commentary: "龙钦\"休息\"概念的核心——所有其他宗派的修行都是\"为了达成什么\"(解脱、成佛、证悟)，而大圆满是\"因为已经达成，所以不需要再做\"。这种\"非修之修\"听起来像偷懒，实际上极难——真正能\"什么也不做\"而不陷入妄想的人，已经是佛。",
        practiceHint: "每日尝试几分钟\"休息式冥想\"——不要控制呼吸，不要观察念头，不要寻求任何境界，就是\"完完全全地什么也不做\"。你会发现这比\"正式打坐\"难得多。",
      },
    ],
  },
  {
    slug: "guru-angad-salok", title: "古鲁安格德·萨洛克", titleEn: "Guru Angad: Salok",
    author: "古鲁·安格德", era: "印度(约 1550)",
    ring: 3, categorySlug: "sikhism",
    summary: "锡克教第二代古鲁安格德(Guru Angad, 1504-1552)创作的短诗集，收录在《古鲁·格兰特·萨希卜》中。古鲁安格德最重要的贡献是创立了\"古尔穆基文\"(Gurmukhi)字母系统——让锡克教徒可以用本族文字记录古鲁的教导，不再依赖梵文或波斯文。他的\"萨洛克\"(Salok，短诗)朴素直白，成为锡克教徒日常吟诵的重要文本。",
    significance: "古鲁安格德是锡克教历史上的\"巩固者\"——那那克开创了宗教，安格德把它制度化：创立文字、编纂经文、建立社区机构。没有安格德，那那克的口传教导很可能会失传。\"古尔穆基文\"至今仍是旁遮普邦的官方文字之一，是锡克教与印度教、伊斯兰教区分的重要身份标记。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["古鲁安格德", "锡克", "古尔穆基", "萨洛克"], sortOrder: 209,
    relatedSlugs: ["japji-sahib", "nanak-janamsakhi"],
    chapters: [
      {
        chapterNo: 1, title: "劳动即崇拜",
        originalText: "诚实工作，养活自己和家人，就是对神的最高崇拜。逃避劳动去庙里祷告的人，并没有接近神；在工厂、田地、厨房里认真劳动的人，每一滴汗水都是献给神的。",
        commentary: "\"诚实劳动即崇拜\"是锡克教最有特色的教义之一，由古鲁安格德进一步系统化。这一点使锡克教在印度教的\"出家至上\"和伊斯兰教的\"五时礼拜\"之间走出第三条路——宗教生活和世俗生活不分离，工作本身就是灵修。",
        practiceHint: "在下一次工作时尝试\"劳动即崇拜\"——不论你在做什么(打字、洗碗、开车)，默念\"这一刻我在服侍神\"，你会发现工作的质量和心情都完全改变。",
      },
    ],
  },
  {
    slug: "abdul-baha-paris-talks", title: "阿博都巴哈·巴黎之谈", titleEn: "Abdul-Baha: Paris Talks",
    author: "阿博都巴哈", era: "巴黎(1911)",
    ring: 3, categorySlug: "bahai",
    summary: "巴哈伊信仰第二代领袖阿博都巴哈(Abdul-Baha, 1844-1921)于 1911 年访问巴黎时给信徒的演讲记录。此时欧洲第一次世界大战前夕的紧张气氛中，阿博都巴哈反复讲授\"人类合一\"、\"废除偏见\"、\"男女平等\"、\"普遍教育\"、\"通用语言\"等巴哈伊核心原则。",
    significance: "《巴黎之谈》是巴哈伊信仰向西方世界传播的关键文献——阿博都巴哈是第一位到欧美传教的巴哈伊领袖，此书是他系统阐述巴哈伊社会教义的第一手资料。这些演讲词被当时的西方听众广泛传抄，直接影响了\"世界联邦运动\"、\"国际和平运动\"等 20 世纪初的思潮。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 10, readingMins: 30,
    tags: ["阿博都巴哈", "巴哈伊", "合一", "巴黎"], sortOrder: 210,
    relatedSlugs: ["abdul-baha-answers", "bahaullah-hidden-words"],
    chapters: [
      {
        chapterNo: 1, title: "人类合一",
        originalText: "你们全部是一棵树上的叶子，同一海洋中的滴水。种族、国籍、阶级、宗教的划分都是人为制造的障碍，神所创造的只有\"一个\"人类。若这个基本真理被所有人接受，战争、贫困、歧视就会在一夜之间消失。",
        commentary: "\"人类合一\"是整个巴哈伊信仰的核心教义，也是巴哈欧拉使命的总结——\"地球只是一个国家，人类都是其公民\"。阿博都巴哈在巴黎一再重复这个主题，因为他深知第一次世界大战即将爆发——他是那个时代极少数公开呼吁废除民族国家的宗教领袖之一。",
        practiceHint: "每当你感到对\"另一群人\"有偏见时(不同种族、不同宗教、不同政治立场)，默念\"我们是一棵树上的叶子\"——巴哈伊说这句简单的真理能治愈所有偏见。",
      },
    ],
  },
  {
    slug: "ohiyesa-soul-indian", title: "奥希耶萨·印第安人的灵魂", titleEn: "Ohiyesa (Charles Eastman): The Soul of the Indian",
    author: "查尔斯·伊斯特曼", era: "美国(1911)",
    ring: 3, categorySlug: "indigenous",
    summary: "苏族印第安人查尔斯·伊斯特曼(Charles Eastman, 苏族名 Ohiyesa, 1858-1939)用英语向白人读者介绍苏族传统灵性的著作。他是第一位获得欧美正式医学学位的印第安人，却终生为原住民权益奔走。《印第安人的灵魂》用简洁的散文展示了苏族对神(Wakan Tanka)、自然、死亡、沉默的理解。",
    significance: "《印第安人的灵魂》是北美原住民第一次用英语向主流社会系统介绍自己灵性传统的著作。伊斯特曼打破了白人对印第安人\"异教徒\"的刻板印象，展示了苏族宗教中与基督教\"圣方济各\"甚至与佛教同等深邃的自然灵性。此书对后世\"深层生态学\"(Deep Ecology)和\"生态神学\"有直接影响。",
    difficulty: 2, oxStageMin: 2, oxStageMax: 10, readingMins: 25,
    tags: ["奥希耶萨", "苏族", "灵魂", "自然"], sortOrder: 211,
    relatedSlugs: ["black-elk-speaks", "black-elk-great-vision"],
    chapters: [
      {
        chapterNo: 1, title: "沉默的宗教",
        originalText: "印第安人的宗教是\"沉默的宗教\"——没有教堂，没有经文，没有传教士。当清晨太阳升起时，印第安人独自走到森林深处或山顶，面对升起的太阳默默站立一两个小时——这就是他的祈祷。说话的祈祷是白人的发明；真正的祈祷不需要词语。",
        commentary: "伊斯特曼抓住了印第安灵性最核心的一点——\"沉默的宗教\"。与依赖语言(经文、讲道、祷告词)的亚伯拉罕宗教不同，印第安人认为神的存在是\"直接的感受\"，一开口说话就已经把它\"翻译\"为次级的东西。这种\"不言之教\"反而与东方的禅宗、道家有深度相通。",
        practiceHint: "每周至少一次\"沉默的祈祷\"——独自走到自然中，不说话、不祈求、什么也不做，就是静静站立一小时。你会发现这比任何用词语的祷告都更深。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.29 经论++ v29 精修第十九轮 — 10 部小传统第二层深化\n');

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
  console.log(`\n📜 M38.29 精修第十九轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
