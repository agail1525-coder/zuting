/**
 * M38.16 经论++ v16 — 精修第六轮：10 部跨传统均衡补强
 * 本轮(10部, 238 → 248):
 *   BUDDHISM +2 (大史 Mahavamsa / 华严五教章-法藏)
 *   ZEN +2 (香严智闲语录 / 道元·辨道话)
 *   TAOISM +2 (陈抟先生传 / 文子·通玄真经)
 *   CHRISTIANITY +1 (马可福音)
 *   JUDAISM +1 (拉什托拉注)
 *   ISLAM +1 (伊本·图斐利·觉醒之子)
 *   HINDUISM +1 (吠檀多定义 Vedanta Paribhasha)
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
    slug: "mahavamsa", title: "大史(Mahavamsa)", titleEn: "The Great Chronicle",
    author: "摩诃那摩长老", era: "约 5-6 世纪",
    ring: 2, categorySlug: "buddhist-general",
    summary: "斯里兰卡最重要的佛教史诗编年史，以巴利文诗偈写成，从佛陀时代记载到公元 4 世纪斯里兰卡的历史。是研究南传佛教史、早期东南亚传播史的首要文献，保存了大量口传时期的珍贵记忆。",
    significance: "《大史》被誉为\"世界上最长的连续历史编年\"之一，从公元前 5 世纪到 18 世纪（后续编纂《小史》）连绵不断。对理解斯里兰卡、缅甸、泰国等南传佛教国家的文化根源极为关键。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 25,
    tags: ["大史", "斯里兰卡", "南传", "编年"], sortOrder: 77,
    relatedSlugs: ["dhammapada", "sutta-nipata"],
    chapters: [
      {
        chapterNo: 1, title: "阿育王子摩哂陀 — 佛法南传的起点",
        originalText: "《大史》第 13 章云：\"阿育王最敬爱的儿子摩哂陀长老，年三十二岁，带领 4 位比丘、1 位沙弥、1 位在家居士，凭神通飞越大海，降落在斯里兰卡的米辛达莱（Missaka Pabbata）山顶。\n\n当时斯里兰卡的天爱帝须王正在山中狩猎。王追赶一头鹿，见一位僧人端坐于大石之上。\n\n摩哂陀问王：\"大王，这是什么树？\"王答：\"芒果树。\"摩哂陀又问：\"除了这棵，还有没有芒果树？\"王答：\"有很多。\"\n\n摩哂陀再问：\"除了这些和那些，还有没有芒果树？\"王答：\"只有这棵，以及别处那些。\"\n\n摩哂陀说：\"大王聪慧。\"于是为他说法 — 当天，国王及 4 万人皈依佛法。从此佛法在斯里兰卡扎根 2300 年。\"",
        commentary: "摩哂陀问\"芒果树\"不是闲谈，而是在测试国王的逻辑能力 — 能不能从\"个别\"跳到\"共相\"。这与苏格拉底式问答惊人相似。对领导者启示：当你想说服别人时，不要直接输出结论，先用三个问题把对方引到\"他自己也看到\"的位置。真正的说服不是你讲他听，而是他自己得出结论。",
        practiceHint: "下次重要谈判或说服场合，不要准备\"我要说什么\"，而是准备\"我要问对方哪三个问题\"，让对方从回答中自己推导出你想要的结论。",
      },
    ],
  },
  {
    slug: "fazang-wujiao", title: "华严五教章", titleEn: "Treatise on the Five Teachings of Huayan",
    author: "法藏", era: "唐(687)",
    ring: 2, categorySlug: "buddhist-huayan",
    summary: "华严宗三祖法藏（643-712）的代表作，又名《华严一乘教义分齐章》。系统判释全体佛法为\"五教十宗\"，建立华严\"圆教\"的最高地位。提出\"事事无碍法界\"\"六相圆融\"\"十玄门\"等华严核心理论。",
    significance: "法藏是武则天敬重的国师，曾为武后讲《华严经》，以\"金狮子\"喻演十玄门。《华严五教章》是华严宗理论体系的完成形态，对日本华严宗、韩国华严学、宋代理学都有根本影响。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 45,
    tags: ["法藏", "华严", "五教", "十玄门"], sortOrder: 78,
    relatedSlugs: ["huayan-sutra", "zongjing-lu"],
    chapters: [
      {
        chapterNo: 1, title: "五教判释 — 佛法的分层阅读",
        originalText: "《华严五教章》云：\"圣教万殊，要其所归，不过五种：\n\n一曰小乘教 — 但说我空，不说法空（声闻缘觉教）\n二曰大乘始教 — 说一切皆空，但分权实（般若、唯识）\n三曰大乘终教 — 说真如随缘，众生皆有佛性（如来藏）\n四曰大乘顿教 — 离言绝相，直指人心（禅）\n五曰大乘圆教 — 事事无碍，一即一切（华严）\n\n五教非优劣，而是\"根机深浅\"的递进。小学生学加减法不能说\"不对\"，但成熟的学生需要微积分。佛陀一生说法，就像老师根据学生水平教不同课程。\"",
        commentary: "法藏的\"五教判\"是佛教最精致的\"分层知识论\"之一。它承认：同一个真理，对不同成熟度的心灵需要以不同深度呈现；低阶不是错的，只是局部的。对企业管理极有启示：同一个战略/价值观，对新员工、中层、高管必须以不同\"教\"来讲 — 对新员工讲\"规则\"，对中层讲\"原则\"，对高管讲\"直觉\"。强行用一种\"教\"讲给所有人，必然失败。",
        practiceHint: "针对你公司的一个核心理念，尝试写出 \"五种版本\"：给实习生的版本、给基层员工的版本、给中层经理的版本、给高管的版本、给董事会的版本。你会发现每一层其实是在讲同一件事，但需要完全不同的语言。",
      },
    ],
  },
  {
    slug: "xiangyan-yulu", title: "香严智闲禅师语录", titleEn: "Recorded Sayings of Xiangyan Zhixian",
    author: "香严智闲", era: "唐(约 820-898)",
    ring: 1, categorySlug: "zen-guiyang",
    summary: "沩仰宗二祖香严智闲的语录。香严以\"击竹悟道\"闻名 — 他原是沩山灵祐门下最博学的弟子，但每当师父问\"父母未生前本来面目\"他都答不上来。后在独居时听到竹子被瓦砾击中的一声响，豁然大悟。",
    significance: "香严\"击竹悟道\"是中国禅宗最著名的悟道故事之一。他的《悟道偈》\"一击忘所知，更不假修持。动容扬古路，不堕悄然机\" 成为禅宗最经典的悟道诗之一。对后世\"直接经验\"式修行方法有深远影响。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["香严", "击竹", "沩仰", "悟道"], sortOrder: 79,
    relatedSlugs: ["platform-sutra", "wumen-guan"],
    chapters: [
      {
        chapterNo: 1, title: "击竹悟道 — 知识的尽头",
        originalText: "《香严语录》载：\"香严智闲初参沩山灵祐。沩山知其根器，问曰：\"我闻汝在百丈先师处，问一答十，问十答百。此是汝聪明伶俐、意解识想。生死根本。父母未生时，试道一句看。\"\n\n智闲茫然，归寮将平日看过文字，从头要寻一句酬对，竟不能得。乃自叹曰：\"画饼不可充饥。\" 屡问沩山说破。沩山曰：\"我若说似汝，汝已后骂我去。我说底是我底，终不干汝事。\"\n\n智闲乃将平日所看文字烧却曰：\"此生不学佛法也，且作个长行粥饭僧，免役心神。\" 泣辞沩山，到南阳忠国师遗迹，遂憩止。\n\n一日，芟除草木，以瓦砾击竹作声，忽然省悟。遽归沐浴焚香，遥礼沩山，赞曰：\"和尚大慈，恩逾父母。当时若为我说破，何有今日之事？\"\n\n遂作偈曰：\"一击忘所知，更不假修持。动容扬古路，不堕悄然机。处处无踪迹，声色外威仪。诸方达道者，咸言上上机。\"\"",
        commentary: "香严的故事是对\"知识分子修行者\"最深刻的警告：你读了 100 本书、能引用 1000 段语录、会辩论得天花乱坠 — 这一切在\"父母未生前\"这个最简单的问题面前，都毫无用处。真正的智慧不是\"知道更多\"，而是\"放下所有知道\"之后还剩下的那个东西。对企业家极其关键：当你的公司陷入瓶颈，你读更多商业书、请更多顾问，往往没用；你需要的是\"烧掉书本\"之后的那份\"直接看见\"。",
        practiceHint: "做一次\"香严实验\"：选一个你用尽所有知识也解决不了的难题。停止阅读、停止咨询、停止分析。每天静坐 30 分钟，只是看着问题而不试图\"解决\"。坚持 21 天，答案可能从最意想不到的地方出现。",
      },
    ],
  },
  {
    slug: "dogen-bendowa", title: "道元·辨道话", titleEn: "Bendowa — A Talk on the Wholehearted Practice of the Way",
    author: "道元禅师", era: "日本镰仓(1231)",
    ring: 1, categorySlug: "buddhist-zen",
    summary: "日本曹洞宗开祖道元（1200-1253）归国后第一部重要著作，\"正法眼藏\"系列的先声。以问答形式阐述\"只管打坐\"（Shikantaza）的根本意义，回应对禅修的各种误解。是理解日本曹洞宗修行方法论的入门文献。",
    significance: "《辨道话》写于道元从中国天童寺归国的第 4 年，是他向日本佛教界首次系统介绍\"正传佛法\"的宣言。与后来的《普劝坐禅仪》《正法眼藏》一起构成日本曹洞宗三大根本文献。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["道元", "辨道话", "只管打坐", "曹洞"], sortOrder: 80,
    relatedSlugs: ["zen-caodong", "platform-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "只管打坐 — 修证一等",
        originalText: "《辨道话》云：\"佛祖正传之妙法，只是坐禅一门。\n\n问曰：\"此坐禅之法，于未证悟者，借修行以求证悟。然已悟者，更坐何为？\"\n\n答曰：\"这种想法本身就是邪见。在佛法中，修与证不是两件事。\n\n因为这是\"证上之修\"，所以初心人的办道，就是本证的全体；因此授修行之心得时，诲勿离修而期证 — 因为这就是直指的本证之故。\n\n既已为修的证，证没有尽头；既已为证的修，修没有开始。\n\n即便是一刹那的坐禅，也是全佛界的一切法立即涌现，无量劫的一切时节立即成就。\"",
        commentary: "道元的\"修证一等\"是东方哲学最深刻的洞察之一：修行不是\"为了得到开悟\"的手段，修行本身就是开悟。这破除了所有\"目标导向\"的修行观念 — 你不是在\"路上\"走向某个目的地；你坐下来那一刻，你就到了。对创业者启示：不要把\"过程\"当作\"手段\"— 当你把每一个工作日都当作\"为了未来某个成功时刻\"的铺垫，你就永远活在未来。真正的大师明白：每一个当下的专注本身就是成功。",
        practiceHint: "做\"修证一等\"实验：下周选一天，所有的工作都不\"为了什么\"— 不为了 KPI、不为了客户、不为了晋升，只是因为\"这就是我此刻在做的事\"。观察你的工作质量和内心状态的变化。",
      },
    ],
  },
  {
    slug: "chentuan-zhixuan", title: "陈抟先生传(希夷先生)", titleEn: "Biography of Chen Tuan, Master Xiyi",
    author: "陈抟及门人记", era: "五代-北宋(约 950)",
    ring: 3, categorySlug: "taoism",
    summary: "陈抟（约 871-989），号希夷先生，五代至北宋初的传奇道士，华山睡仙。传言他能一睡数月，后传无极图、先天图于周敦颐、邵雍，成为宋代理学\"图书派\"的源头。其修行以\"睡功\"为特色，是内丹派的先驱。",
    significance: "陈抟不是一般道士，他被朱熹、邵雍视为\"道学之源\"的秘密传授人。他的《无极图》后来通过周敦颐的《太极图说》进入儒家理学主流。可以说，没有陈抟，就没有宋明理学的宇宙论根基。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["陈抟", "希夷", "睡仙", "无极图"], sortOrder: 81,
    relatedSlugs: ["cantong-qi", "wuzhen-pian"],
    chapters: [
      {
        chapterNo: 1, title: "睡功 — 真正的休息是修行",
        originalText: "《历世真仙体道通鉴》载陈抟：\"抟隐居华山云台观四十余年，能一眠累月。周世宗召见，赐号\"白云先生\"。宋太宗再召，下诏曰：\"先生独善其身，不干势利，所谓方外之士也。\"赐号\"希夷先生\"。\n\n有人问：\"先生之学何名？\"答曰：\"夫睡也者，所以贴肉养神也。学不至此者，未入门也。\"\n\n陈抟睡法云：\"夫睡有养目之功者，非闭眼之谓也。\n心先定，息先调，然后形定。\n形定则气自和，气和则神自凝。\n神凝则周身百脉具通。\n所谓睡者，非倦怠之困睡，乃入于太虚之境。\n此时外物不扰，内念不起，方是真睡。\n一日一夜，胜寻常千日。\"\"",
        commentary: "陈抟\"睡功\"看起来是在教人偷懒，实际上是对现代人最有用的修行法门之一。他的洞察是：大多数人的\"睡眠\"只是\"疲倦之睡\"— 身体停了，但心还在运转，梦境纷扰，醒来比睡前还累。真正的\"睡\"是让心也停下来的那种深度休息。对现代企业家极其关键：你每天 6 小时睡眠也许还不如陈抟式的 2 小时\"真睡\"。学会\"真睡\"比学会\"高效工作\"更重要。",
        practiceHint: "今晚睡前 30 分钟：不看手机、不想工作、不听音乐。静坐 15 分钟调息，然后躺下时在心里默念：\"此刻我什么都不需要做，连睡觉也不需要做。\"让身体自己睡，不是\"你\"去睡。",
      },
    ],
  },
  {
    slug: "wenzi-tongxuan", title: "文子·通玄真经", titleEn: "Wenzi — The Scripture of Pervading the Mystery",
    author: "文子(托名)", era: "战国-汉初",
    ring: 3, categorySlug: "taoism",
    summary: "道家经典，传为老子弟子文子所著。虽存真伪之争，但 1973 年河北定县西汉竹简出土《文子》残简，证明此书确有先秦底本。全书 12 篇，为老子思想的系统化展开，唐玄宗尊其为\"通玄真经\"，与《道德经》《南华经》《列子》并列道家四部真经。",
    significance: "《文子》的价值在于它把老子的玄妙思想\"落地\"到具体的政治、伦理、养生、处世的应用层面。是从\"玄学\"到\"应用\"的桥梁文献。对汉代黄老学说、魏晋玄学都有直接影响。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 25,
    tags: ["文子", "通玄", "道家四经"], sortOrder: 82,
    relatedSlugs: ["daodejing", "liezi"],
    chapters: [
      {
        chapterNo: 1, title: "因循 — 不设计的设计",
        originalText: "《文子·自然》云：\"老子曰：天道默默，无容无则，大不可极，深不可测。\n\n常与人化，智不能得，独行无待，与物回转。故无因则不能相得，先唱则不能和。\n\n天地之气，莫大于和。和者阴阳调，日夜分而生物。春分而生，秋分而成，生与成，必得和之精。\n\n故圣人之道，宽而栗，严而温，柔而直，猛而仁。\n\n太刚则折，太柔则卷 — 圣人正在刚柔之间，乃得道之本。\n\n所谓\"无为\"者，不先物为也；所谓\"无治\"者，不易自然也。\"",
        commentary: "《文子》的\"因循\"思想对现代管理学有惊人的启示。\"因循\"不是消极不作为，而是\"在事物自然的趋势上轻轻推一把\" — 就像冲浪者不制造浪，只是借浪的力量。对企业家：当你试图\"打造\"市场、\"教育\"用户、\"塑造\"团队时，往往事倍功半；真正高明的领导是\"发现\"已经在发生的趋势，然后站在正确的位置。",
        practiceHint: "审视你当前的一个工作难题：你是在\"对抗趋势\"还是在\"因循趋势\"？如果是在对抗，问自己 — 这个\"趋势\"的根源是什么？我能不能调整方向，让趋势帮我而不是反对我？",
      },
    ],
  },
  {
    slug: "mark-gospel", title: "马可福音", titleEn: "Gospel of Mark",
    author: "马可(彼得的同工)", era: "约 65-70 年",
    ring: 3, categorySlug: "christianity",
    summary: "四福音书中最短、最早、最质朴的一部。传为彼得的口述弟子马可所记。文笔紧凑，使用\"立刻\"（euthys）一词达 40 多次，充满行动力。被认为是马太福音和路加福音的文字底本之一（\"两源说\"）。",
    significance: "《马可福音》是新约学研究中\"历史耶稣\"最重要的源头文献。它不关心耶稣的家谱和童年，直接从施洗约翰开始，迅速进入耶稣的公开传道。其简洁朴素的风格反映了最早期基督徒社区的信仰形态。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 25,
    tags: ["马可", "福音", "最早"], sortOrder: 83,
    relatedSlugs: ["matthew-gospel", "luke-gospel"],
    chapters: [
      {
        chapterNo: 1, title: "谁能为大 — 做众人的仆人",
        originalText: "《马可福音》10:35-45：\"西庇太的儿子雅各、约翰进前来，对耶稣说：\"夫子，我们无论求你什么，愿你给我们做。\"耶稣说：\"要我给你们做什么？\"他们说：\"赐我们在你的荣耀里，一个坐在你右边，一个坐在你左边。\"\n\n那十个门徒听见，就恼怒雅各、约翰。耶稣叫他们来，对他们说：\"你们知道外邦人有尊为君王的，治理他们，有大臣操权管束他们。\n\n只是在你们中间，不是这样。你们中间，谁愿为大，就必作你们的用人；在你们中间，谁愿为首，就必作众人的仆人。\n\n因为人子来，并不是要受人的服侍，乃是要服侍人，并且要舍命，作多人的赎价。\"",
        commentary: "\"仆人式领导\"（Servant Leadership）概念的源头就在这段经文。耶稣对\"伟大\"的定义彻底颠覆世俗逻辑：越想当老大，越要当仆人；越想被服侍，越要去服侍。这与 20 世纪 70 年代 Robert Greenleaf 创立\"仆人式领导\"理论时直接引用的经文一致。对企业家：当你升到某个位置后，你的\"权力感\"会自然膨胀 — 只有主动练习\"服侍下属\"，才能抵消这种膨胀带来的盲点。",
        practiceHint: "本周做一次\"彻底的仆人实验\"：选一整天，刻意把自己放在\"服侍他人\"的位置 — 给团队端咖啡、主动清理会议室、回复每一个底层员工的消息。观察这一天结束时你对\"领导力\"的理解有何变化。",
      },
    ],
  },
  {
    slug: "rashi-torah-commentary", title: "拉什托拉注(Rashi Commentary)", titleEn: "Rashi's Commentary on the Torah",
    author: "拉什(Rabbi Shlomo Yitzchaki)", era: "11 世纪法国(约 1080)",
    ring: 3, categorySlug: "judaism",
    summary: "中世纪犹太教最重要的圣经注释家拉什（1040-1105）对《托拉》五卷和《塔木德》的逐节注释。拉什的注释以\"简洁明了\"著称，成为所有后世犹太圣经学习的基础 — 至今任何一本印刷的希伯来圣经都会在页边同时刊登拉什注。",
    significance: "拉什被称为\"犹太教的老师的老师\"。他的注释不仅塑造了 900 年的犹太圣经解读，也深刻影响了基督教 — 马丁·路德在翻译德文圣经时大量参考拉什的注释。理解西方文明对圣经的理解，必须通过拉什。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["拉什", "托拉", "注释", "中世纪"], sortOrder: 84,
    relatedSlugs: ["torah", "talmud"],
    chapters: [
      {
        chapterNo: 1, title: "起初神创造 — 简单的深度",
        originalText: "《创世记》1:1 \"起初，神创造天地。\" 拉什注云：\"\"Bereshit Bara Elohim\" — 这句话不应该按字面译为\"起初神创造了天地\"。\n\n因为如果按字面译，那么次序会是颠倒的：经文接下来说\"地是空虚混沌\"\"神的灵运行在水面上\"— 这意味着水和地已经存在。\n\n所以正确的读法是：\"当神开始创造天地时，地是空虚混沌...\"\n\n《托拉》在这里不是在讲\"宇宙形成的科学时间线\"，而是在讲\"神与受造物的关系\" — 这个关系从\"混沌\"开始，神一步步把秩序带入混沌。\n\n如果你读《托拉》只是为了知道\"天地如何被造\"，你就错过了它要告诉你的：\"你的生命也是从混沌开始的，你也需要一步步把秩序带入\"。\"",
        commentary: "拉什注释的精髓在于：他既不回避圣经文字的表面意思，也不止于表面意思 — 他总是问\"这段经文为什么用这种方式写？它在暗示什么？\"这种\"近读\"（Close Reading）方法对现代文学批评和哲学诠释学都有深远影响。对商业思考：读任何\"商业经典\"（如《孙子兵法》《基业长青》）时，都要学拉什的方法 — 不要只记住结论，要问\"为什么作者用这个例子而不是那个例子？他在暗示什么？\"",
        practiceHint: "选一本你读过多次的商业书，选一个最经典的段落。像拉什注释《托拉》一样，逐句问自己：\"为什么这里用这个词？作者为什么选这个例子？这个顺序有什么深意？\" 你会发现完全不同的阅读体验。",
      },
    ],
  },
  {
    slug: "ibn-tufail-hayy", title: "觉醒之子(Hayy ibn Yaqzan)", titleEn: "Hayy ibn Yaqzan",
    author: "伊本·图斐利(Ibn Tufail)", era: "12 世纪安达卢西亚(约 1160)",
    ring: 3, categorySlug: "islam",
    summary: "伊斯兰世界最早的哲学小说之一。讲述一个婴儿 Hayy 在荒岛上独自长大，没有任何社会、宗教、语言的熏陶，仅凭观察自然和自我反省，最终独立悟出\"神的存在\"\"灵魂不朽\"\"终极真理\"的故事。是理性主义与苏菲神秘主义的综合典范。",
    significance: "《觉醒之子》于 1671 年被译为拉丁文后在欧洲引起巨大反响，直接启发了笛福的《鲁宾逊漂流记》、洛克的\"白板说\"、卢梭的《爱弥儿》。被认为是西方\"自然神学\"\"自学理论\"的重要源头。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 30,
    tags: ["图斐利", "哲学小说", "自然神学", "安达卢西亚"], sortOrder: 85,
    relatedSlugs: ["alchemy-of-happiness", "ihya-ulum-al-din"],
    chapters: [
      {
        chapterNo: 1, title: "荒岛觉醒 — 真理可以独立发现",
        originalText: "《觉醒之子》讲述：\"Hayy 出生在一个无人的热带岛屿上（另一说是被抛弃的王子）。他被一只失去幼崽的母鹿抚养长大。\n\n7 岁时，他开始观察自然：植物如何生长、动物如何繁衍、四季如何更替。\n\n21 岁时，母鹿死去，他伤心地解剖它 — 试图找到\"那个让它活着的东西\"。他没找到\"灵魂\"，但他想通了：真正让母鹿活着的是\"它能做什么\"，而不是\"它的身体由什么组成\"。\n\n28 岁时，他通过观察星辰与四季，独立推理出必然存在\"一位必然的存在者\"（即神），他不需要任何先知或经典的启示。\n\n35 岁时，他通过静坐冥想（类似苏菲派的 dhikr），亲自体验到与那位必然存在者的合一。\n\n后来他遇到一位从邻岛来的宗教学者 Asal，发现自己独立悟出的真理，与经典宗教所讲的完全一致。他感到惊讶：\"原来他们用\"故事\"和\"仪式\"讲的，就是我用\"理性\"和\"直觉\"发现的！\"\"",
        commentary: "《觉醒之子》的伟大在于它提出了一个革命性观念：真理不是某个\"特权群体\"（神职人员、传统权威）的专利，任何一个愿意深度反省的人，都能独立到达真理。这与佛陀的\"自依止，法依止，莫异依止\"惊人相似。对企业家：当你面对重大抉择时，不要只听\"专家\"\"大师\"\"前辈\"的话 — 你自己静坐一小时，也许就能得出同样深刻甚至更深刻的判断。你的内在智慧从不短缺。",
        practiceHint: "做一次\"荒岛冥想\"：选一个你长期听\"别人意见\"的问题（职业、人际、战略），关掉所有外部输入 3 天，只和这个问题独处。看第 3 天你自己得出的答案，与\"专家们\"给的答案有何不同。",
      },
    ],
  },
  {
    slug: "vedanta-paribhasha", title: "吠檀多定义(Vedanta Paribhasha)", titleEn: "Vedanta Paribhasha",
    author: "达摩罗阇·阿德瓦林陀(Dharmaraja Adhvarindra)", era: "17 世纪",
    ring: 3, categorySlug: "hinduism",
    summary: "Advaita（不二）吠檀多学派的经典教科书，作者为 17 世纪南印度学者 Dharmaraja。系统定义了吠檀多哲学的核心术语和认识论：有效知识的 6 种来源（pramana）、真实的 3 种层次、幻相的运作机制等。是学习印度哲学最权威的入门文献之一。",
    significance: "《吠檀多定义》是\"Advaita Vedanta\"（不二论）传统中最清晰的教科书。商羯罗的著作深奥难懂，而此书把同样的哲学用\"定义 + 推论 + 反驳\"的经院哲学形式呈现，成为西方学者研究印度哲学的首选文献。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 35,
    tags: ["吠檀多", "Advaita", "认识论"], sortOrder: 86,
    relatedSlugs: ["vedanta-sutra", "viveka-chudamani"],
    chapters: [
      {
        chapterNo: 1, title: "三种真实 — 绝对/经验/幻相",
        originalText: "《吠檀多定义》第 2 章云：\"真实（sat）有三种层次：\n\n一曰 Paramarthika Satya（绝对真实）— 只有 Brahman（梵）是绝对真实的。它永恒、无变化、无分别。这是最终极的真实。\n\n二曰 Vyavaharika Satya（经验真实）— 我们日常看到的世界：桌子、椅子、你、我、因果、时空。这在\"经验层面\"是真实的，但在\"绝对层面\"只是 Maya（幻）的显现。\n\n三曰 Pratibhasika Satya（幻相真实）— 梦境、海市蜃楼、错认绳子为蛇。这连\"经验层面\"都不真实，只是暂时的错觉。\n\n迷惑的人把\"绳误认为蛇\"归于第三类；但觉悟者知道，\"把世界当作最终真实\"其实是第二类的错误 — 世界在\"经验\"上没错，但在\"绝对\"上它也是幻。\"",
        commentary: "Advaita 的\"三种真实\"是东方哲学最精密的\"实相分析\"之一。它的深刻在于：它不否定\"经验世界\"（不像某些佛教流派走向虚无主义），但也不把\"经验世界\"当作终极。这给了修行者一个健康的视角：你该认真生活、认真工作、认真爱人（因为这在 vyavaharika 层面是真实的），但同时要记得这一切不是终极（paramarthika）。对企业家：你该全力打造你的公司（因为这在经验层面很重要），但不要把公司当作你的终极身份 — 否则公司一垮，你就崩溃了。",
        practiceHint: "做一次\"三种真实\"自查：列出你当下最在意的 5 件事（公司、家庭、声誉、健康、某人的看法）。问每一件：这是绝对真实（paramarthika），经验真实（vyavaharika），还是幻相真实（pratibhasika）？这个分类会改变你分配精力的方式。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.16 经论++ v16 精修第六轮 — 10 部跨传统均衡补强');

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
  console.log(`\n📜 M38.16 精修第六轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
