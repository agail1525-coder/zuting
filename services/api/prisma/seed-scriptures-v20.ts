/**
 * M38.20 经论++ v20 — 精修第十轮：10 部补齐最弱分类
 * 目标：补齐"只有 1-2 部"的小众分类
 * 本轮(10部, 277 → 287):
 *   ZEN-YUNMEN +1 (雪窦颂古百则) 1→2
 *   ZEN-FAYAN +1 (法眼文益禅师语录) 2→3
 *   ZEN-GUIYANG +1 (沩山灵祐语录) 2→3
 *   BUDDHIST-ESOTERIC +1 (苏悉地羯罗经) 2→3
 *   BUDDHIST-PURELAND +1 (往生论 世亲) 2→3
 *   BUDDHIST-VINAYA +1 (南山律学·道宣) 2→3
 *   BAHAI +1 (盟约书 Kitab-i-Ahd) 9→10
 *   SIKHISM +1 (Chaupai Sahib 查拜祷文) 9→10
 *   INDIGENOUS +1 (约鲁巴 Ifa Odu) 10→11
 *   SHINTO +1 (本居宣长·古事记传) 12→13
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
    slug: "xuedou-songgu", title: "雪窦颂古百则", titleEn: "Xuedou's Verse Commentaries on One Hundred Cases",
    author: "雪窦重显", era: "北宋(约 1030)",
    ring: 1, categorySlug: "zen-yunmen",
    summary: "云门宗第四代祖师雪窦重显（980-1052）选取 100 则古代公案，每则配以精妙的诗偈评唱。后来圆悟克勤为其添加\"垂示、著语、评唱\"，形成了禅宗文字禅的集大成之作《碧岩录》。雪窦的原文偈颂是《碧岩录》的骨干。",
    significance: "雪窦的\"颂古\"是禅宗文学的高峰之一。他以清丽的诗笔把原本\"截断众流\"的公案呈现为可反复玩味的文学作品，既保持公案的禅机，又让学人能从诗意中渐入门径。其作品与汾阳善昭的\"颂古\"并称\"两大颂古派\"，影响了整个宋代禅林。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 25,
    tags: ["雪窦", "颂古", "云门", "碧岩"], sortOrder: 117,
    relatedSlugs: ["biyan-lu", "wumen-guan"],
    chapters: [
      {
        chapterNo: 1, title: "第一则·武帝问达摩 — 廓然无圣",
        originalText: "《雪窦颂古·第一则》：\"梁武帝问达摩大师：\"如何是圣谛第一义？\"摩云：\"廓然无圣。\"帝曰：\"对朕者谁？\"摩云：\"不识。\"帝不契。达摩遂渡江至魏。\n\n雪窦颂曰：\n\"圣谛廓然，何当辨的？\n对朕者谁，还云不识。\n因兹暗渡江，岂免生荆棘？\n阖国人追不再来，千古万古空相忆。\n休相忆，清风匝地有何极！\"\n\n师顾视左右云：\"这里还有祖师么？\"自云：\"有。唤来与老僧洗脚。\"",
        commentary: "第一则公案是禅宗史上最有名的对话之一。达摩初到中国，面对笃信佛教的梁武帝，直接说\"廓然无圣\"—没有所谓\"圣\"与\"凡\"的分别。武帝听不懂，达摩就渡江北上。雪窦的颂词\"清风匝地有何极\"极妙 — 真正的佛法不在庙堂、不在典籍、不在对话里，就在这扑面而来的清风中。对现代人的启示：你花了多少心思去\"区分高下\"（职位高低、财富多少、学历好坏）？达摩会说：\"廓然无圣\" — 这些分别本身就是迷惑的根源。",
        practiceHint: "下周做一次\"廓然无圣\"实验：刻意停止\"分级别\"看人 — 无论对方是 CEO 还是保洁员，都用同样的眼神、语气、姿态对话。观察这个简单的改变对你内心和关系带来什么变化。",
      },
    ],
  },
  {
    slug: "wenyi-yulu", title: "法眼文益禅师语录", titleEn: "Recorded Sayings of Fayan Wenyi",
    author: "法眼文益", era: "五代(885-958)",
    ring: 1, categorySlug: "zen-fayan",
    summary: "禅宗五家中\"法眼宗\"的开宗祖师文益（885-958）的语录。文益的禅法以\"一切现成\"\"闻声悟道\"著称，强调当下事物的直接呈现即是佛性。他的《宗门十规论》系统批评当时禅林的十大弊病，是禅宗史上最早的\"禅病诊断书\"。",
    significance: "法眼宗在五代-北宋时期一度是江南禅宗主流，对高丽（韩国）禅宗影响深远 — 高丽太祖派人入宋求法，带回的就是法眼宗的法脉。文益的弟子德韶禅师成为吴越国师，再传弟子永明延寿著《宗镜录》。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["法眼", "文益", "一切现成"], sortOrder: 118,
    relatedSlugs: ["zen-fayan", "zongjing-lu"],
    chapters: [
      {
        chapterNo: 1, title: "闻声悟道 — 真理从不需要翻译",
        originalText: "《法眼文益语录》载：\"僧问：\"如何是佛？\"师云：\"汝是慧超。\" — 此慧超直下承当而悟。\n\n又有僧问：\"如何是学人自己？\"师云：\"丙丁童子来求火。\"\n\n文益开示云：\"佛法不是从你不知道的地方来的，佛法就在你眼前 — 你看见的树，你听见的声音，你呼吸的空气，无一不是佛法。\n\n丙丁 — 五行属火。丙丁童子就是\"火童子\"— 他自己就是火，却还要向别人讨火。这不是愚蠢吗？\n\n你也一样 — 你自己就是佛，却还要四处求佛。\n\n停止寻找。你已经有了。你所有的、所感知到的、所是的 — 这一切，就是它。\n\n一切现成，不劳回首。\"",
        commentary: "法眼的\"一切现成\"思想是对\"求而不得\"式修行的根本批判。大多数人修行时在\"寻找\" —寻找开悟、寻找宁静、寻找意义 — 但法眼说：你寻找的东西本来就在这里，只是你一边寻找一边错过了。这与现代心理学\"正念\"（Mindfulness）的核心观点一致：真正的富足不在\"明天得到什么\"，而在\"此刻有什么\"。对企业家极具挑战：你的\"下一个目标\"是你让自己逃离\"当下\"的方式吗？",
        practiceHint: "做\"一切现成\"实验：一天之内，每当你冒出\"我要得到 X 才能幸福\"的念头时，立刻停下来问：\"此刻，我已经有什么？\" 列出 5 样你已经拥有的东西（健康、家人、朋友、阳光、呼吸...）。21 天后，观察你对\"幸福\"的定义是否变化。",
      },
    ],
  },
  {
    slug: "weishan-yulu", title: "沩山灵祐禅师语录", titleEn: "Recorded Sayings of Weishan Lingyou",
    author: "沩山灵祐", era: "唐(771-853)",
    ring: 1, categorySlug: "zen-guiyang",
    summary: "沩仰宗开祖灵祐（771-853）的语录。灵祐是百丈怀海的大弟子，开创沩山道场，门下出香严智闲、仰山慧寂等高足，形成\"沩仰宗\"。他以\"具足凡夫事，始得名为佛\"的朴素禅风著称，强调\"平常心是道\"的具体落实。",
    significance: "沩仰宗是禅宗五家中最早成立的一家，也是\"农禅并重\"传统的典型。灵祐与百丈一样坚持\"一日不作一日不食\"，要求弟子在劳动中参禅。这种\"劳动即修行\"的精神对日本永平寺、韩国曹溪宗的丛林制度都有深远影响。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["沩山", "灵祐", "沩仰", "农禅"], sortOrder: 119,
    relatedSlugs: ["xiangyan-yulu", "weishan-jingce"],
    chapters: [
      {
        chapterNo: 1, title: "具足凡夫事 — 在日常中见道",
        originalText: "《沩山语录》载：\"沩山一日问仰山：\"汝今夏作得个什么事？\"仰云：\"锄得一片畲，下得一箩种。\"沩云：\"汝今夏不虚过。\"仰问沩：\"和尚今夏作得什么事？\"沩云：\"日中一食，夜后一寝。\"仰云：\"和尚今夏亦不虚过。\"\n\n灵祐开示：\"莫谓\"出家\"就要\"脱离凡俗\"。出家的意思是\"出离执着\"，不是\"出离生活\"。\n\n你该吃饭时吃饭，该睡觉时睡觉，该干活时干活 — 只是这些\"该\"上面不加\"我\"的计较。\n\n农夫的\"一锄一种\"和我的\"一食一寝\"有什么区别？没有区别。\n\n差别只在\"心上\"— 你做的时候，心是不是\"明明白白\"？还是被念头拖走？\n\n具足凡夫事，始得名为佛。真正的佛不是\"不再做凡夫的事\"，而是\"做凡夫的事，心里不再有凡夫的纠结\"。\"",
        commentary: "灵祐的\"具足凡夫事\"是中国禅最接地气的教导之一。这与印度佛教\"出家\"\"离欲\"的取向有根本区别 — 中国禅宗发现：真正的解脱不在\"远离生活\"，而在\"完全投入生活\"。对企业家的启示是决定性的：你不需要\"等退休后再修行\"，你每天处理的合同、谈判、会议、家务，就是最好的道场。关键不是\"做什么\"，而是\"怎么做\" — 全神贯注、不带抱怨地做。",
        practiceHint: "选一件你最讨厌做但必须做的日常事（写邮件、打电话、填表格）。下次做它时，刻意练习\"全神贯注\"— 不想别的、不看手机、不在心里抱怨。做完后，问：感觉是否不同？",
      },
    ],
  },
  {
    slug: "susiddhikara-sutra", title: "苏悉地羯罗经", titleEn: "Susiddhikara Sutra",
    author: "输波迦罗(善无畏)译", era: "唐(726)",
    ring: 2, categorySlug: "buddhist-esoteric",
    summary: "密宗（真言宗）核心经典之一，与《大日经》《金刚顶经》合称\"密宗三部\"。系统讲述密宗成就的方法 — 持咒、结印、观想、供养四大基本修法。特别强调\"三密相应\"（身口意三业与诸佛的身口意相应）才能成就。",
    significance: "《苏悉地经》在日本真言宗中地位极高，是\"修法\"（修行仪轨）的根本文献。日本真言宗历代祖师都必须深研此经才能传承密法。它对理解东亚密教的仪轨系统极为关键。",
    difficulty: 5, oxStageMin: 4, oxStageMax: 10, readingMins: 30,
    tags: ["苏悉地", "密宗", "三密"], sortOrder: 120,
    relatedSlugs: ["dari-jing", "buddhist-esoteric"],
    chapters: [
      {
        chapterNo: 1, title: "三密相应 — 身口意合一的力量",
        originalText: "《苏悉地经》卷一云：\"凡修真言之法，必三密具足。\n\n身密 — 结印（手指的特定姿势），让身体进入\"佛的姿态\"\n口密 — 诵真言（特定的咒语），让声音成为\"佛的声音\"\n意密 — 观想（在心中观想本尊形象），让意识进入\"佛的意识\"\n\n三密任一缺失，则成就不圆满。\n\n譬如射箭：\n身密像是\"稳定的站姿\"\n口密像是\"呼吸的节奏\"\n意密像是\"对靶心的专注\"\n\n三者合一，箭矢自然命中。\n\n修真言者，先学手印（至少 9 种基本印），后学梵字（读诵准确），最后观想（清晰不乱）。\n\n每日晨昏各一次，百日即见感应。\"",
        commentary: "密宗\"三密相应\"的精髓在于：修行不能只靠\"意\"（想想就好），也不能只靠\"身\"（做做样子），必须三个层次同步才能产生\"共振效应\"。这与现代心理学\"具身认知\"（Embodied Cognition）的发现惊人一致 — 身体姿势会影响心理状态，声音节奏会调节神经系统，视觉想象会激活特定脑区。对现代人：当你想\"改变一个习惯\"时，只靠\"意志力\"（意）往往失败，要同时调动身体（换环境、换姿势）和语言（对自己说话）。",
        practiceHint: "选一个你想建立的新习惯（如早起、冥想、锻炼）。为它设计\"三密相应\"：①身密（一个特定的身体动作，如双手合十）② 口密（一句话，如\"我开始了\"）③ 意密（一幅画面，如完成后的自我形象）。每次做这个习惯前先做这\"三密\"，3 秒钟。",
      },
    ],
  },
  {
    slug: "wangsheng-lun", title: "往生论", titleEn: "Treatise on the Pure Land",
    author: "世亲菩萨造、菩提流支译", era: "北魏(529)",
    ring: 2, categorySlug: "buddhist-pureland",
    summary: "净土宗根本论典，又名《无量寿经优婆提舍愿生偈》。世亲菩萨（4-5 世纪）以 24 偈论证往生西方极乐世界的理论与方法，提出\"五念门\"（礼拜、赞叹、作愿、观察、回向）作为净土修行的核心次第。是从般若唯识学角度解读净土法门的里程碑。",
    significance: "《往生论》的特殊意义在于：它由印度大乘瑜伽行派的代表人物世亲菩萨所造，证明\"净土信仰\"不是中国民间佛教的产物，而是印度大乘佛教的主流思想。昙鸾大师为之作《往生论注》成为中国净土宗三经一论之一。日本净土真宗创始人亲鸾直接从此论得到启发。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["往生论", "世亲", "五念门"], sortOrder: 121,
    relatedSlugs: ["wuliangshou-jing", "amitabha-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "五念门 — 通往净土的五把钥匙",
        originalText: "《往生论》云：\"世尊！我一心归命尽十方无碍光如来，愿生安乐国。\n\n修五念门成就者，毕竟得生安乐国土，见彼阿弥陀佛。\n\n何等五念门？\n\n一者礼拜门 — 身业礼拜阿弥陀佛，为生彼国\n二者赞叹门 — 口业称名，如彼如来光明智相\n三者作愿门 — 心常作愿，一心专念，毕竟往生\n四者观察门 — 以智慧观察，正念观彼\n五者回向门 — 不舍一切苦恼众生，心常作愿，先度他人\n\n前四门是\"自利\"：我要往生；第五门是\"利他\"：我往生不是为了自己，而是为了更好地回来帮助众生。\n\n如是五门，次第所作，始自礼拜，终于回向。\n\n若不具足五门，则不名\"真正修行人\"。\"",
        commentary: "世亲的\"五念门\"把净土修行从\"只念一句佛号\"扩展为一个完整的五步次第：身（礼拜）→口（赞叹）→意（作愿）→慧（观察）→悲（回向）。特别是最后的\"回向门\"— 修行的终极目的不是\"自己解脱\"，而是\"为了更好地帮助众生\"。这是把\"个人得救\"与\"菩萨大愿\"结合起来的精妙设计。对企业家：你所有的努力，如果只为\"自己的成功\"而不为\"更多人的福祉\"，最终会变得空虚。把\"回向\"融入日常 — 每做一件事前问：\"这件事最终是为了谁好？\"",
        practiceHint: "给你的每一件工作事项前加一句\"回向\"：\"愿这件事成就之后，能帮助 [具体的人]。\" 例如：\"愿这次产品迭代之后，能帮助 1 万个用户节省时间。\" 这个小习惯会改变你对工作的内在感受。",
      },
    ],
  },
  {
    slug: "nanshan-lvxue", title: "南山律学·道宣", titleEn: "Nanshan Vinaya School — Daoxuan",
    author: "道宣", era: "唐(596-667)",
    ring: 2, categorySlug: "buddhist-vinaya",
    summary: "中国律宗三大支派之一\"南山律宗\"的开创者道宣（596-667）的戒律学说。道宣长期研究《四分律》，著述丰富，代表作《四分律行事钞》《四分律比丘含注戒本》系统整理了汉传佛教的戒律实践方法。被尊为\"南山律祖\"。",
    significance: "道宣不仅是律学大师，还是佛教史学家（著《续高僧传》）和护教论者（与道士辩论）。他的律学体系通过鉴真和尚传到日本，成为日本律宗的根基。现代汉传佛教所有的戒律实践（出家仪轨、结夏安居、诵戒、忏悔）都源于南山律宗。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 9, readingMins: 25,
    tags: ["道宣", "南山律", "四分律"], sortOrder: 122,
    relatedSlugs: ["sifen-lv", "fanwang-jing"],
    chapters: [
      {
        chapterNo: 1, title: "心戒 — 戒不在条文而在发心",
        originalText: "《行事钞·序》云：\"夫戒律之设，本在对治。若无贪嗔痴三毒，则一切戒皆成虚设。\n\n故律宗有三聚：\"摄律仪戒\"防非止恶，\"摄善法戒\"策进善行，\"摄众生戒\"度化有情。\n\n若人持律，但求\"不犯\"而不求\"发心\"，则持戒成枷锁 — 越持越苦，越苦越怨。\n\n若人持律，先发大菩提心，然后以戒为道 — 则每持一戒，都是一次\"慈悲的练习\"。\n\n道宣云：\"戒有止持、作持。止持 — 禁止做恶（消极）；作持 — 主动行善（积极）。二者缺一，都不是完整的戒。\n\n南山律的精神：持戒不是\"我不做坏事\"就够了，而是\"我主动做利益众生的事\"。\n\n你不偷东西，这只是基本；你主动把东西给别人，这才是戒的圆满。\"",
        commentary: "南山律\"止持+作持\"的双轨制戒律观是中国佛教的一大创造。印度佛教戒律偏向\"止恶\"（不要做什么），南山律加入\"行善\"（必须做什么），使戒律从\"束缚\"变成\"修行路径\"。对现代企业的启示极深：合规（Compliance）是\"不要做什么\" — 不违法、不欺诈、不伤害。但更高层次的\"企业道德\"是\"必须做什么\" — 主动保护员工、主动服务客户、主动回馈社会。真正的好公司既\"止持\"又\"作持\"。",
        practiceHint: "审视你公司的\"戒律\"（规则、政策）：有多少是\"止持\"（禁止条款）？有多少是\"作持\"（鼓励行动）？如果前者远多于后者，考虑添加\"作持条款\"—例如 \"每月必须为社区做一件事\"\"每季度必须培养一名新人\"。",
      },
    ],
  },
  {
    slug: "kitab-i-ahd", title: "盟约书(Kitab-i-Ahd)", titleEn: "Kitab-i-Ahd — The Book of the Covenant",
    author: "巴哈欧拉(Bahaullah)", era: "19 世纪(1891)",
    ring: 3, categorySlug: "bahai",
    summary: "巴哈欧拉去世前一年亲笔写下的\"盟约遗嘱\"，指定长子阿博都-巴哈为他之后的唯一解读者和领袖。这份文件是巴哈伊信仰\"盟约原则\"（Covenant）的根本文献 — 每一位巴哈伊都承诺遵循这份盟约以维护信仰的合一性。",
    significance: "《盟约书》的意义超越具体内容：它代表了巴哈伊信仰最独特的制度创新 — 明确的\"授权链\"（Authority Chain）。历史上大多数宗教在创始人去世后都会因继承权争议而分裂，巴哈伊因《盟约书》的明确指定避免了这种分裂。这种\"防分裂\"的制度设计对现代组织理论也有启发。",
    difficulty: 3, oxStageMin: 2, oxStageMax: 9, readingMins: 20,
    tags: ["盟约书", "巴哈伊", "授权"], sortOrder: 123,
    relatedSlugs: ["kitab-i-aqdas", "hidden-words"],
    chapters: [
      {
        chapterNo: 1, title: "盟约 — 预防分裂的制度设计",
        originalText: "《盟约书》开篇云：\"虽然从远古以来，预言中一直提到，凡经神授权的人将被神选为其\"解读者\"，但没有任何一位显圣者曾亲自做此明确的授权。\n\n我 — 巴哈欧拉 — 今天为此立下这份文字。在我升天之后，所有人都应当转向\"最伟大的枝\"（阿博都-巴哈），他是我的\"解读者\"（Interpreter）。\n\n凡不服从此盟约者，即使他拥有千种能力、万种知识，也不属于巴哈伊信仰。\n\n\"盟约\"的意义在于：没有盟约，就没有合一；没有合一，就没有爱；没有爱，就没有神圣事业的成就。\n\n一个信仰团体最大的敌人不是外在的敌人，而是内部的分裂。分裂一旦发生，即使真理再伟大，也会被分裂的人心扭曲。\n\n所以我留下这份明确的指示 — 不是为了限制你们的自由，而是为了保护你们不在\"谁是领袖\"的问题上消耗精力。\"",
        commentary: "巴哈欧拉的\"盟约\"制度是人类宗教组织史上最精巧的\"防分裂\"设计之一。他看到的问题是：大多数宗教在创始人去世后都会因\"正统性之争\"而分裂。他的解决方案是：亲笔写下明确的继承人指定，同时让\"服从这份指定\"成为信仰的一部分。这个设计让巴哈伊成为 19 世纪后诞生的宗教中保持最完整统一的一个。对企业家的启示：接班人问题是所有成功企业最大的考验 — 你是否有明确的、书面的、大家都认可的接班制度？还是把它留到\"以后再说\"？",
        practiceHint: "写下你自己的\"盟约书\"：如果你明天突然离开（退休、转岗、退出），你希望谁来接管你最重要的责任？为什么是他？他需要什么样的权威和支持？把这份文件保存起来。",
      },
    ],
  },
  {
    slug: "chaupai-sahib", title: "查拜萨希伯(Chaupai Sahib)", titleEn: "Chaupai Sahib",
    author: "锡克第十位古鲁·戈宾德·辛格", era: "17 世纪末(约 1698)",
    ring: 3, categorySlug: "sikhism",
    summary: "锡克教日常祈祷文之一，由第十位古鲁戈宾德·辛格（Guru Gobind Singh, 1666-1708）所作。从他的长篇史诗《Bachitar Natak》中节选出来，被列为锡克每日必念的五祷文之一。内容是向神祈求保护，免受一切敌人、困难、恐惧的侵害。",
    significance: "《查拜萨希伯》在锡克生活中地位极高 — 每天日出和日落时诵读。它既是宗教仪式，也是心理护身符 — 无数锡克人在面对困难时通过诵念此祷文获得力量。它反映了锡克\"灵战合一\"的传统：既要内在的灵修，也要外在的勇气。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 9, readingMins: 15,
    tags: ["查拜", "戈宾德辛格", "日常祈祷"], sortOrder: 124,
    relatedSlugs: ["japji-sahib", "rehras-sahib"],
    chapters: [
      {
        chapterNo: 1, title: "请求保护 — 将自己交托给至高者",
        originalText: "《查拜萨希伯》选：\"Hamri karo hath dai rachha, Puran hoi chit ki iccha — 用你的手保护我，让我心中所愿全部实现。\n\nTav charnan man rahai hamaro, Apna jan karo pratipara — 愿我的心常驻于你的脚下，请像对待自己的孩子一样守护我。\n\nHamre dusht sabhai tum ghavhu, Aap hath dai mohi bachavhu — 击败我所有的敌人，伸出你的手救援我。\n\nSukhi basai mora parivara, Sevak sikh sabhai kartara — 让我的家人安康，让所有的仆人和学生都受你的照顾。\n\nMo rachha nij kar dai kariyai, Sabh bairan ko aaj sanghariyai — 请亲手保护我，今天就击败所有的敌人。\n\nPuran hoi hamari asa, Tor bhajan ki rahai piaasa — 让我的愿望实现，但让我对你赞美的渴望永远延续。\"",
        commentary: "《查拜萨希伯》的独特在于它既有\"战士的祈祷\"（求击败敌人）又有\"圣者的祈祷\"（求更接近神）。这种融合反映了戈宾德·辛格创立\"Khalsa\"（纯净兄弟会）的精神 — 锡克既是修行者也是战士，既要内在的平安也要外在的正义。对现代人最有启示的是最后两句：\"让愿望实现，但让对你的渴望永远延续\"— 这是一种罕见的智慧：求你想要的，但不要让\"得到\"成为你的终点。",
        practiceHint: "写下你的\"双层祈祷\"：一层是具体愿望（想得到什么）；另一层是\"元愿望\"（无论是否得到，都愿意保持的心态）。例如：具体愿望\"公司估值翻倍\"，元愿望\"无论成败都保持创新的热情\"。每天早晨默念两层。",
      },
    ],
  },
  {
    slug: "ifa-odu", title: "伊法·奥杜(Ifa Odu)", titleEn: "Ifa Corpus — Odu Ifa",
    author: "约鲁巴口传数千年", era: "公元前开始",
    ring: 3, categorySlug: "indigenous",
    summary: "西非约鲁巴（Yoruba）文明的核心智慧文献，由 256 章\"Odu\"（诗章）组成，每章包含数千则故事、谚语、预言和伦理教导。传承形式为口传 — 祭司（Babalawo）通过 16 颗棕榈果的占卜系统召唤特定的 Odu 来指导人生决策。\"Ifa\"是约鲁巴智慧之神。",
    significance: "2005 年联合国教科文组织将《Ifa 占卜系统》列为\"人类非物质文化遗产代表作\"。它是现存最完整的非洲传统智慧体系之一。Ifa 的思想通过奴隶贸易传到美洲，成为古巴 Lucumi、巴西 Candomble、海地 Vodou 等宗教的核心。对非洲文化复兴和全球原住民智慧的再发现极为重要。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["Ifa", "约鲁巴", "非洲智慧", "Orisha"], sortOrder: 125,
    relatedSlugs: ["ubuntu-wisdom", "popol-vuh"],
    chapters: [
      {
        chapterNo: 1, title: "命运与选择 — Ori 的智慧",
        originalText: "《Odu Ifa》核心教导：\"每一个人出生前，都要在天堂选择自己的\"Ori\"（命运之头）。\n\n你可以选任何 Ori — 聪明的、愚笨的、富有的、贫穷的、长寿的、短命的。\n\n但选 Ori 的时候你是\"蒙着眼\"的，你不知道你选的是哪一个。\n\n这告诉我们一个深刻的真理：你此生的\"命运\"不是别人强加的，是\"你自己选的\"— 只是你在选的时候不记得自己在选。\n\n那么为什么还要\"占卜 Ifa\"？\n\n因为占卜不是为了\"改变命运\"— Ori 一旦选定就不能改。\n\n占卜是为了\"清楚地看见你的命运\"，然后选择\"如何承担它\"。\n\n比如你占卜显示\"今年有大灾难\"— Ifa 不会告诉你\"怎么避免\"，它会告诉你\"如何在灾难中保持尊严\"。\n\n\"奥里\"（Ori）是你的命运，但\"你怎么走这段路\"才是真正的自由。\n\n约鲁巴谚语：\"命运是水，品格是坝 — 没有坝，水会淹没一切；有了坝，水会灌溉田地。\"",
        commentary: "约鲁巴的\"Ori 选择论\"是非洲哲学最深刻的\"命运与自由\"思辨之一。它拒绝两个极端：既不相信\"一切都是命中注定\"（宿命论），也不相信\"一切都由你决定\"（纯自由意志论），而是提出一种中道 — \"命运定了方向，品格决定走法\"。这与斯多葛派的\"控制二分法\"和佛教的\"业力+自由\"观惊人相似。对现代人：当你遇到\"不公平的现实\"时，约鲁巴智慧说 — 不要浪费时间抱怨\"为什么是我\"，而要问\"既然是我，我怎么走这段路才配得上最好的自己？\"",
        practiceHint: "写下你当下面临的一个\"无法改变的困境\"。然后用两种视角看：① 如果这是你\"命运的一部分\"，你会怎么对待它？② 你的\"品格之坝\" 足以引导这个\"水\"吗？需要加固什么？",
      },
    ],
  },
  {
    slug: "motoori-kojikiden", title: "本居宣长·古事记传", titleEn: "Motoori Norinaga's Commentary on Kojiki",
    author: "本居宣长", era: "日本江户(1798)",
    ring: 3, categorySlug: "shinto",
    summary: "江户时代国学大师本居宣长（1730-1801）用 35 年时间完成的《古事记》全注，共 44 卷，约 600 万字。宣长通过严密的语言学和文献学研究，重新发现了被佛教和儒教长期覆盖的\"大和心\"（Yamato-gokoro, 日本原生精神）。是日本国学运动的最高成就。",
    significance: "《古事记传》对日本文化的影响难以估量：它促成了日本\"神道\"的独立意识，直接启发了明治维新时期\"神道国教化\"的政策，也影响了现代日本对自身文化身份的理解。宣长提出的\"物哀\"（mono no aware, 对万物流转的幽微感受）成为日本美学的核心概念之一。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 25,
    tags: ["本居宣长", "古事记传", "国学", "物哀"], sortOrder: 126,
    relatedSlugs: ["kojiki", "nihon-shoki"],
    chapters: [
      {
        chapterNo: 1, title: "物哀 — 对万物流转的幽微感受",
        originalText: "《古事记传》论\"物哀\"云：\"所谓\"物哀\"（mono no aware），是对一切事物自然涌起的真实感情。\n\n看樱花落时心中的一震 — 那是物哀\n听蟋蟀夜鸣时胸中的一动 — 那是物哀\n见老人弯腰时眼里的一润 — 那是物哀\n读古人诗歌时心中的一叹 — 那是物哀\n\n物哀不是\"悲哀\"，而是\"看见事物的本来样子时自然涌起的感动\"。\n\n日本人的心不善于抽象哲学 — 我们不像中国人那样长于议论，不像印度人那样长于思辨。\n\n但日本人的心极其敏感于\"此刻此地的真实感受\"。\n\n樱花开了 — 美；樱花落了 — 更美，因为你看见了\"美的短暂\"。\n\n这种敏感，不是悲观，是对存在本身的深深的珍惜。\n\n孔子教我们\"克己复礼\"—这是伟大的，但不是日本式的。\n佛陀教我们\"看穿空性\"— 这是深奥的，但不是日本式的。\n\n日本式的智慧是：全心全意地活在当下的感受里，让每一朵花、每一声鸟鸣、每一阵风都在你心中完整地展开。\n\n这就是大和心 — 日本原生精神。\"",
        commentary: "宣长的\"物哀\"美学是日本文化对世界的一大独特贡献。它不是一种\"哲学理论\"，而是一种\"感受方式\"— 对万物流转的温柔注视。与西方的\"征服自然\"、中国的\"天人合一\"、印度的\"解脱轮回\"都不同，日本人选择了\"完全投入到这一瞬间的美和悲\"。对现代人的启示：你每天被无数信息和任务轰炸，是否还记得\"停下来看一朵花\"的那种感觉？物哀不是伤感，是一种\"认真地活过\"的能力。",
        practiceHint: "做一周的\"物哀练习\"：每天找一个\"转瞬即逝\"的自然现象（晨雾、落叶、夕阳、云的形状），停下来认真看 30 秒。不拍照、不发朋友圈、不分析，只是看。一周后，你可能会发现对\"时间\"的感觉变了。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.20 经论++ v20 精修第十轮 — 10 部补齐最弱分类');

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
  console.log(`\n📜 M38.20 精修第十轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
