/**
 * M38.26 经论++ v26 — 精修第十六轮：10 部佛教子类深化
 * 本轮(10部, 329 → 339):
 *   ZEN-YUNMEN +1 (云门文偃禅师广录) 4→5
 *   BUDDHIST-PURELAND +1 (善导·观经四帖疏) 5→6
 *   BUDDHIST-VINAYA +1 (道宣·四分律行事钞) 5→6
 *   BUDDHIST-YOGACARA +1 (护法等·成唯识论) 5→6
 *   BUDDHIST-MADHYAMAKA +1 (青目·中论释) 5→6
 *   BUDDHIST-ESOTERIC +1 (金刚顶经) 5→6
 *   ZEN-GUIYANG +1 (沩山灵祐·沩山警策) 5→6
 *   ZEN-FAYAN +1 (永明延寿·宗镜录) 5→6
 *   BUDDHIST-TIANTAI +1 (智顗·法华玄义) 6→7
 *   BUDDHIST-HUAYAN +1 (法藏·华严金师子章) 6→7
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
    slug: "yunmen-guanglu", title: "云门文偃禅师广录", titleEn: "Extensive Records of Chan Master Yunmen Wenyan",
    author: "云门文偃 / 守坚编", era: "五代(约 949)",
    ring: 1, categorySlug: "zen-yunmen",
    summary: "云门宗开创者云门文偃禅师(864-949)的完整语录集，由其法嗣守坚编辑，保存了云门\"一字关\"、\"云门三句\"、\"函盖乾坤、截断众流、随波逐浪\"等核心教法。云门以\"一字禅\"震摄后学——问佛问祖，答曰\"露\"、\"鉴\"、\"顾\"、\"咦\"一字了毕。",
    significance: "《云门广录》是云门宗最根本的典籍，奠定了宋代禅林以\"古则公案\"参究的风气。雪窦重显从《广录》中选出百则作《颂古百则》，圆悟克勤据此作《碧岩录》——中国禅宗\"文字禅\"的高峰由此开启。云门一字禅\"语短意长\"，成为后世禅家追摹的典范。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 10, readingMins: 40,
    tags: ["云门", "一字关", "三句", "语录"], sortOrder: 172,
    relatedSlugs: ["xuedou-songgu", "biyanlu"],
    chapters: [
      {
        chapterNo: 1, title: "云门三句",
        originalText: "师云：\"函盖乾坤，目机铢两，不涉春缘，作么生承当？\"自代云：\"一镞破三关。\"德山圆明密禅师颂云：\"函盖乾坤句，截断众流句，随波逐浪句。\"",
        commentary: "\"函盖乾坤\"——真理无所不包；\"截断众流\"——斩断一切分别；\"随波逐浪\"——应机说法。三句构成云门宗完整的禅修路径：见体、破执、起用。",
        practiceHint: "参云门三句时不要分别高下，三句本是一句——于\"函盖乾坤\"处见本体，于\"截断众流\"处破情执，于\"随波逐浪\"处起妙用。",
      },
    ],
  },
  {
    slug: "shandao-guanjing-sitie-shu", title: "善导·观经四帖疏", titleEn: "Shandao: Commentary on the Contemplation Sutra in Four Fascicles",
    author: "善导大师", era: "唐(约 680)",
    ring: 2, categorySlug: "buddhist-pureland",
    summary: "净土宗第二祖善导大师(613-681)对《观无量寿经》的权威注疏，分\"玄义分、序分义、定善义、散善义\"四帖。善导在本书中确立\"称名念佛为净土正定之业\"的核心主张，将净土修行从\"观想\"转向\"称名\"，使净土法门真正下贯到普通百姓。",
    significance: "《观经四帖疏》是汉传净土宗的教理根基，日本净土宗开宗祖师法然上人读此书后\"信心决定\"，创立日本净土宗；亲鸾进一步发展为净土真宗。善导\"本愿称名\"的思想通过此书传播至东亚，是念佛法门从\"难行\"变为\"易行\"的理论支柱。",
    difficulty: 4, oxStageMin: 3, oxStageMax: 10, readingMins: 50,
    tags: ["善导", "净土", "观经", "称名"], sortOrder: 173,
    relatedSlugs: ["wangsheng-lunzhu", "wangsheng-lun"],
    chapters: [
      {
        chapterNo: 1, title: "称名正定业",
        originalText: "一心专念，弥陀名号，行住坐卧，不问时节久近，念念不舍者，是名正定之业，顺彼佛愿故。",
        commentary: "善导此\"正定业\"四句是净土宗的核心判教——只要一心称念弥陀名号，不论时间久暂、形式优劣，都是与阿弥陀佛四十八愿完全相应的\"正定之业\"。这彻底打破了\"念佛是浅根钝机的方便法门\"的偏见。",
        practiceHint: "每日至少称念\"南无阿弥陀佛\"一千声，不求感应，但求相续——善导说\"念念不舍\"即是净土正因。",
      },
    ],
  },
  {
    slug: "daoxuan-sifen-xingshi-chao", title: "道宣·四分律行事钞", titleEn: "Daoxuan: Commentary on Activities of the Dharmaguptaka Vinaya",
    author: "道宣律师", era: "唐(约 626)",
    ring: 2, categorySlug: "buddhist-vinaya",
    summary: "汉传律宗南山律派创始人道宣律师(596-667)的代表作，全称《四分律删繁补阙行事钞》。本书把《四分律》中的戒条按僧团日常运作的\"行事\"重新组织——受戒、说戒、安居、自恣、衣食、医药、葬送——使冗长的律文转化为可操作的寺院生活手册。",
    significance: "《行事钞》是汉传律学最权威的实用教科书，道宣由此被尊为南山律宗开祖。鉴真东渡日本所传即是南山律，日本律宗以《行事钞》为根本——千余年来日本僧人的受戒仪规仍依此书。\"南山三大部\"(《行事钞》《戒本疏》《羯磨疏》)是汉地律师必读经典。",
    difficulty: 5, oxStageMin: 5, oxStageMax: 9, readingMins: 45,
    tags: ["道宣", "律宗", "四分律", "行事"], sortOrder: 174,
    relatedSlugs: ["mulasarvastivada-vinaya", "fanwang-jing"],
    chapters: [
      {
        chapterNo: 1, title: "持戒摄心",
        originalText: "戒是平地，众善由生；定是静水，能澄众浊；慧是利剑，能断众惑。三学次第，如鼎三足，缺一不可。",
        commentary: "道宣以\"平地、静水、利剑\"三喻说明戒定慧三学不可偏废。戒是修行的根基，没有戒的\"平地\"，定慧无处生长。这也回应了禅宗\"不拘细行\"的倾向——道宣强调即使是上根利器也不能舍戒。",
        practiceHint: "持戒从\"五戒\"起步：不杀、不盗、不邪淫、不妄语、不饮酒。每日睡前自检一日行为，若有违犯则忏悔并警策明日。",
      },
    ],
  },
  {
    slug: "cheng-weishi-lun", title: "护法等·成唯识论", titleEn: "Dharmapala et al: Treatise on Consciousness-Only",
    author: "护法等造 / 玄奘译", era: "唐(约 659)",
    ring: 2, categorySlug: "buddhist-yogacara",
    summary: "汉传唯识宗的根本论书，由玄奘大师糅合印度护法等十大论师对世亲《唯识三十颂》的注解编译而成。本书系统建立\"万法唯识\"的理论体系——一切现象都是第八识\"阿赖耶识\"的显现，世界的实在性被彻底重新定义为\"识之变现\"。",
    significance: "《成唯识论》是汉地唯识学的最高成就，玄奘-窥基师徒据此创立法相唯识宗。本书首次完整系统地介绍了印度瑜伽行派的\"三能变、八识、四分、三自性、五位百法\"完整体系，是研究印度唯识学最权威的汉文资料——比现存梵文资料更完整。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 60,
    tags: ["唯识", "玄奘", "护法", "八识"], sortOrder: 175,
    relatedSlugs: ["vimsatika-vijnaptimatrata", "she-dacheng-lun"],
    chapters: [
      {
        chapterNo: 1, title: "万法唯识",
        originalText: "由假说我法，有种种相转；彼依识所变，此能变唯三。谓异熟思量，及了别境识。",
        commentary: "世亲《三十颂》开篇四句。\"假说我法\"——我们所谓的\"自我\"和\"事物\"都是假名；\"依识所变\"——这些假名依托于识的变现；\"能变唯三\"——能产生这些变现的识只有三类：异熟识(第八阿赖耶识)、思量识(第七末那识)、了别境识(前六识)。",
        practiceHint: "在日常感知中练习\"识变\"观：看到一个人起好恶时，反问\"这是对象的属性还是我的识变？\"——持续练习可松动\"我执\"。",
      },
    ],
  },
  {
    slug: "qingmu-zhonglun-shi", title: "青目·中论释", titleEn: "Pingala: Commentary on the Mulamadhyamakakarika",
    author: "青目(Pingala) / 鸠摩罗什译", era: "印度 4 世纪 / 汉译 409",
    ring: 2, categorySlug: "buddhist-madhyamaka",
    summary: "对龙树《中论》最早的完整注疏，作者青目(Pingala)生平不详，鸠摩罗什将其随《中论》本颂一起译为汉文。这是汉传三论宗依据的\"中论\"标准版——每首偈颂都配有青目的散文解说，使龙树极其精炼的\"八不偈\"和\"四句破\"变得可读。",
    significance: "青目释是汉地中观学的入门和根本，吉藏、僧肇等汉传三论宗论师均依此本解说中论。青目对\"空\"、\"假\"、\"中\"的解释影响深远，天台宗智顗\"三谛圆融\"和禅宗\"本来无一物\"的思想都可追溯至此。本书与印度月称的《明句论》、清辨的《般若灯论》并列为中观三大注疏。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 50,
    tags: ["中观", "青目", "龙树", "空"], sortOrder: 176,
    relatedSlugs: ["vigrahavyavartani", "shi-er-men-lun"],
    chapters: [
      {
        chapterNo: 1, title: "八不中道",
        originalText: "不生亦不灭，不常亦不断，不一亦不异，不来亦不出。能说是因缘，善灭诸戏论，我稽首礼佛，诸说中第一。",
        commentary: "龙树《中论》开篇\"八不偈\"——通过同时否定八个相对概念(生灭、常断、一异、来出)，指出一切对立的概念都是戏论。青目解释\"八不\"不是简单的\"都不是\"，而是\"破而不立\"——破除执着即显中道，不需要另立\"中\"。",
        practiceHint: "对任何起心动念，尝试\"八不\"观察：此念是新生还是续旧？是永恒还是断灭？是一体还是分离？是从外来还是内出？四组都答不上时，即见空性。",
      },
    ],
  },
  {
    slug: "jingangding-jing", title: "金刚顶经", titleEn: "Vajrasekhara Sutra",
    author: "不空译", era: "唐(约 746)",
    ring: 2, categorySlug: "buddhist-esoteric",
    summary: "密宗三大根本经之一(与《大日经》《苏悉地经》合称密宗三部)，全称《金刚顶一切如来真实摄大乘现证大教王经》，由开元三大士之一的不空三藏译出。本经以\"金刚界曼荼罗\"为核心，展开\"五方五佛、三十七尊\"的完整密教神圣宇宙图式。",
    significance: "《金刚顶经》与《大日经》并列为汉传唐密和日本真言宗的根本经典——《大日经》重\"胎藏界\"(理)，《金刚顶经》重\"金刚界\"(智)，合称\"金胎两部\"。日本空海大师入唐学法主要即是求此经，回日本后创立真言宗，千年来以此经为核心展开修行体系。",
    difficulty: 5, oxStageMin: 7, oxStageMax: 10, readingMins: 55,
    tags: ["密教", "金刚界", "曼荼罗", "五智"], sortOrder: 177,
    relatedSlugs: ["dari-jing-yishi", "susiddhikara-sutra"],
    chapters: [
      {
        chapterNo: 1, title: "五智如来",
        originalText: "大圆镜智、平等性智、妙观察智、成所作智、法界体性智——五智即五佛，五佛即五蕴清净。转识成智，即身成佛。",
        commentary: "《金刚顶经》的核心教法——凡夫的\"五蕴\"(色受想行识)本质上就是五方佛的\"五智\"。不是凡夫之外另有佛，而是\"转识成智\"即成佛。这是密宗\"即身成佛\"思想的理论根据。",
        practiceHint: "观想自身五蕴为五方佛：色蕴-大日、受蕴-宝生、想蕴-阿弥陀、行蕴-不空成就、识蕴-阿閦。日常烦恼起时观\"此即五智光明\"。",
      },
    ],
  },
  {
    slug: "guishan-jingce", title: "沩山警策", titleEn: "Guishan's Admonitions",
    author: "沩山灵祐", era: "唐(约 850)",
    ring: 1, categorySlug: "zen-guiyang",
    summary: "沩仰宗开创者沩山灵祐禅师(771-853)的训诫文，全文不足两千字却成为千年来禅门最广为传诵的入门指南。本文直白而严厉地指出出家修行者常见的懈怠、虚浮、攀缘、混日子等病态，并提出\"如何是出家本分事\"的根本追问。",
    significance: "《沩山警策》与《四十二章经》《佛遗教经》合称\"佛祖三经\"，是汉地禅林公认的沙弥必读读物。其价值不在教理深邃，而在\"切中要害\"——沩山一针见血地戳破\"出家人的自我感动\"，每一句都像当头棒喝。明清以来凡入禅堂必先背诵此篇。",
    difficulty: 2, oxStageMin: 1, oxStageMax: 10, readingMins: 20,
    tags: ["沩山", "警策", "出家", "警醒"], sortOrder: 178,
    relatedSlugs: ["weishan-yulu", "yangshan-yulu"],
    chapters: [
      {
        chapterNo: 1, title: "出家本分",
        originalText: "夫出家者，发足超方，心形异俗，绍隆圣种，震慑魔军，用报四恩，拔济三有。若不如此，滥厕僧伦，言行荒疏，虚沾信施。昔年行处，寸步不移；恍惚一生，将何凭恃！",
        commentary: "沩山开篇三句定义\"出家\"的本义——\"发足超方\"(志向超越世俗)、\"心形异俗\"(身心都与世俗不同)、\"绍隆圣种\"(继承圣贤事业)。紧接着反问：若做不到这些，凭什么吃信众供养？这是对每个修行者的终极拷问。",
        practiceHint: "每周读一次《沩山警策》全文——不是作为教理学习，而是作为\"自我检查表\"。每读到一处脸红就是修行的入手处。",
      },
    ],
  },
  {
    slug: "yongming-zongjing-lu", title: "永明延寿·宗镜录", titleEn: "Yongming Yanshou: Record of the Source Mirror",
    author: "永明延寿", era: "宋(约 961)",
    ring: 1, categorySlug: "zen-fayan",
    summary: "法眼宗第三代祖师永明延寿禅师(904-975)的百卷巨著，会通禅教、融摄诸宗。永明延寿集唐末五代禅教之大成，本书引用三藏十二部经论共 300 余种，以禅宗\"一心\"为宗旨，贯通华严、天台、唯识、净土、密教等各家学说，成为中国佛教史上规模最大的综合性佛学著作。",
    significance: "《宗镜录》是汉传\"禅教一致\"思想的最高成就——永明延寿不满于当时禅宗\"呵佛骂祖\"的狂禅风气，主张禅必须以教为依据。本书影响深远：宋元以来\"教在贤首、禅在曹溪、念佛求生净土\"的中国佛教主流格局即由永明延寿奠基。他也是禅净双修的倡导者。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 60,
    tags: ["永明", "法眼", "宗镜", "禅教一致"], sortOrder: 179,
    relatedSlugs: ["wenyi-yulu", "deshao-jiesong"],
    chapters: [
      {
        chapterNo: 1, title: "一心为宗",
        originalText: "立此一心为宗，照万法如镜。举一心为宗，照万法为镜；万法昭然，一心朗然；不即不离，不一不异；名为妙心。",
        commentary: "《宗镜录》全书一百卷的总纲——\"一心为宗，万法为镜\"。一心不是抽象的本体，而是能显现万法的明镜；万法不是独立的事物，而是明镜中的影像。二者\"不即不离\"——既不能说心即是法，也不能说心离于法。这是永明会通禅教的基本立场。",
        practiceHint: "每日静坐时观\"心如明镜\"——不要压制念头，让一切想法如影像在镜中来去。镜不动而影像自生灭，心不动而万念自来去。",
      },
    ],
  },
  {
    slug: "zhiyi-fahua-xuanyi", title: "智顗·法华玄义", titleEn: "Zhiyi: Profound Meaning of the Lotus Sutra",
    author: "智顗说 / 灌顶记", era: "隋(约 593)",
    ring: 2, categorySlug: "buddhist-tiantai",
    summary: "天台宗实际创始人智顗大师(538-597)讲解《法华经》的三大部之一(另二为《法华文句》《摩诃止观》)。本书不逐句解释经文，而是系统阐发《法华经》的\"玄义\"——即经题\"妙法莲华经\"五字背后的深层哲学。以\"五重玄义\"(释名、辨体、明宗、论用、判教)展开。",
    significance: "《法华玄义》确立了天台宗\"圆顿教\"的判教体系——智顗将佛陀一生说法分为\"五时八教\"，判定《法华经》为最高圆教。本书中的\"五重玄义\"成为汉地讲经的标准方法，\"化法四教、化仪四教\"的判教框架影响了后世所有中国佛教宗派。",
    difficulty: 5, oxStageMin: 6, oxStageMax: 10, readingMins: 55,
    tags: ["天台", "智顗", "法华", "玄义"], sortOrder: 180,
    relatedSlugs: ["tiantai-xiao-zhiguan", "mohe-zhiguan-shijing"],
    chapters: [
      {
        chapterNo: 1, title: "五重玄义",
        originalText: "一释名，二辨体，三明宗，四论用，五判教。释名者，释经之名也；辨体者，明经之体也；明宗者，显经之宗也；论用者，述经之用也；判教者，判经之位也。",
        commentary: "智顗解经的标准方法——任何一部经都要从五个层次理解：名(经题字面义)、体(经的根本真理)、宗(经的核心教法)、用(经的功能效用)、教(经在佛教整体中的地位)。这五个层次的完整性保证了对经典的理解不会片面。",
        practiceHint: "读任何一部经时自问五个问题：(1)经题什么意思？(2)经说的根本真理是什么？(3)教人做什么？(4)能带来什么利益？(5)在佛法体系中什么地位？——能答出五个则算真读懂。",
      },
    ],
  },
  {
    slug: "fazang-jinshizi-zhang", title: "法藏·华严金师子章", titleEn: "Fazang: Treatise on the Golden Lion",
    author: "法藏大师", era: "唐(约 700)",
    ring: 2, categorySlug: "buddhist-huayan",
    summary: "华严宗三祖法藏大师(643-712)为武则天讲解华严宗旨时，指着殿前金狮子而作的即兴譬喻之作，全文不足两千字。法藏以\"金\"比喻真如本体，以\"狮子\"的各部位比喻缘起现象，用一个日常可见的物件完整展示了华严宗\"六相十玄\"的深奥哲学。",
    significance: "《金师子章》是华严宗最简明扼要也是流传最广的入门读物。武则天据说听此章\"豁然领悟\"。本章用单一譬喻完整阐释了华严\"理事无碍、事事无碍\"的法界观，成为后世华严学人必读经典。日本东大寺的卢舍那大佛即是据华严思想而造——法藏此章是理论支柱。",
    difficulty: 3, oxStageMin: 4, oxStageMax: 10, readingMins: 25,
    tags: ["法藏", "华严", "金师子", "六相"], sortOrder: 181,
    relatedSlugs: ["huayan-ru-fajie", "litongxuan-xin-huayan"],
    chapters: [
      {
        chapterNo: 1, title: "金与狮子",
        originalText: "谓金无自性，随工巧匠缘，遂有狮子相起。起但是缘，故名缘起。金即无生，名为真空。虽复空无自性，不碍幻有宛然。金狮子不二，真空妙有不二。",
        commentary: "法藏的核心譬喻——金(真如本体)本身没有固定形状，遇到工匠的因缘就可以变成狮子相。狮子的出现只是因缘，所以叫\"缘起\"；但金的本性无生无灭，所以叫\"真空\"。虽然本性空，却不妨碍现出狮子的\"幻有\"。金和狮子\"不二\"——真空和妙有也\"不二\"。",
        practiceHint: "看到任何一个事物时练习\"金师子观\"：这个事物(狮子相)依靠什么因缘(工匠)显现？它的本质(金)是什么？相与性是一还是二？——持续练习可以体会\"事事无碍\"。",
      },
    ],
  },
];

async function main() {
  console.log('🌱 M38.26 经论++ v26 精修第十六轮 — 10 部佛教子类深化\n');

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
  console.log(`\n📜 M38.26 精修第十六轮完成！`);
  console.log(`  经论总数: ${totalScriptures}`);
  console.log(`  章节总数: ${totalChapters}`);
}

main()
  .catch(e => { console.error('❌ 失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
